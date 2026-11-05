/** The API: accounts, profile, listings, applications, feed and inbox. */
import { Hono, type Context, type Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import {
  CATEGORIES,
  GUEST_DAYS,
  LIMITS,
  LINKED_ACCOUNTS,
  REACTIONS,
  SKILLS,
  THUMBNAILS,
  type Award,
  type Conversation,
  type FeedPost,
  type Highlight,
  type Listing,
  type Message,
  type Notification,
  type Reply,
  type Team,
  type User,
  type WorkItem,
} from "../src/shared/types";
import {
  FALLBACK_REPLIES,
  GAMES,
  LISTINGS,
  PEOPLE,
  SHARED_POSTS,
  TEAMS,
  listingDetail,
  matchScore,
  personAvatar,
  recruiterFor,
  tidyReply,
} from "./catalog";
import { SESSION_COOKIE, SESSION_SECONDS, hashProof, isPasswordProof, randomHex, safeEqual, sha256Hex } from "./security";

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  DB: D1Database;
  AI: { run(model: string, input: unknown): Promise<unknown> };
  ASSETS: { fetch(request: Request): Promise<Response> };
  AUTH_LIMIT: RateLimiter;
  WRITE_LIMIT: RateLimiter;
  AI_LIMIT: RateLimiter;
}

interface UserRow {
  id: string;
  email: string;
  password_salt: string | null;
  password_hash: string | null;
  is_guest: number;
  name: string;
  handle: string;
  about: string;
  country: string;
  avatar: string | null;
  background: string | null;
  skills: string;
}

type AppContext = { Bindings: Env; Variables: { user: UserRow } };
type C = Context<AppContext>;

const AI_MODEL = "@cf/zai-org/glm-4.7-flash";

const fail = (status: 400 | 401 | 403 | 404 | 409 | 413 | 429, message: string) =>
  new HTTPException(status, { message });

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.is_guest ? "" : row.email,
    isGuest: Boolean(row.is_guest),
    name: row.name,
    handle: row.handle,
    about: row.about,
    country: row.country,
    avatar: row.avatar,
    background: row.background,
    skills: JSON.parse(row.skills) as string[],
  };
}

/** Reads a text field, trimming it and enforcing its limit. */
function text(value: unknown, label: string, max: number, required = false): string {
  if (value !== undefined && typeof value !== "string") throw fail(400, `${label} must be text.`);
  const clean = (value ?? "").trim();
  if (required && !clean) throw fail(400, `${label} is required.`);
  if (clean.length > max) throw fail(400, `${label} can have ${max} characters at most.`);
  return clean;
}

function image(value: unknown, label: string): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(value)) {
    throw fail(400, `${label} must be an image.`);
  }
  if (value.length > LIMITS.imageChars) throw fail(413, `${label} is too large.`);
  return value;
}

async function body(c: C): Promise<Record<string, unknown>> {
  const raw = await c.req.text();
  if (raw.length > LIMITS.imageChars * 2 + 10_000) throw fail(413, "The request is too large.");
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  } catch {
    // Reported below.
  }
  throw fail(400, "The request isn't valid JSON.");
}

async function startSession(c: C, userId: string): Promise<void> {
  const token = randomHex(32);
  const now = Date.now();
  await c.env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(await sha256Hex(token), userId, now + SESSION_SECONDS * 1000)
    .run();
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: new URL(c.req.url).protocol === "https:",
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

/** Visitors with no account yet can only be told apart by their address. */
const clientKey = (c: C) => c.req.header("cf-connecting-ip") ?? "local";

async function limited(limiter: RateLimiter, key: string): Promise<void> {
  const { success } = await limiter.limit({ key });
  if (!success) throw fail(429, "Too many requests. Wait a minute and try again.");
}

async function currentUser(c: C): Promise<UserRow | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  return c.env.DB.prepare(
    "SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id WHERE token_hash = ? AND sessions.expires_at > ?",
  )
    .bind(await sha256Hex(token), Date.now())
    .first<UserRow>();
}

const requireUser = async (c: C, next: Next) => {
  const row = await currentUser(c);
  if (!row) throw fail(401, "Your session ended. Sign in again.");
  c.set("user", row);
  if (c.req.method !== "GET") await limited(c.env.WRITE_LIMIT, row.id);
  await next();
};

const app = new Hono<AppContext>().basePath("/api");

app.onError((error, c) => {
  if (error instanceof HTTPException) return c.json({ error: error.message }, error.status);
  console.error("Unexpected error:", error);
  return c.json({ error: "Something went wrong. Try again." }, 500);
});

// Other sites can't send requests with this site's cookie.
app.use("*", async (c, next) => {
  const origin = c.req.header("origin");
  if (c.req.method !== "GET" && origin && origin !== new URL(c.req.url).origin) {
    throw fail(403, "Requests from other sites aren't allowed.");
  }
  await next();
  c.header("cache-control", "no-store");
});

/* Accounts */

// Not being signed in is a normal answer here, not an error.
app.get("/session", async (c) => {
  const row = await currentUser(c);
  return c.json({ user: row ? toUser(row) : null });
});

async function seedGuest(db: D1Database, userId: string): Promise<void> {
  const now = Date.now();
  const work = [
    ["Dune Raiders Academy", "2024 - Present", "Buenos Aires", "2 Years"],
    ["Voidlight", "2022 - 2024", "Remote", "2 Years"],
    ["Open Ladder Collective", "2021 - 2022", "Remote", "1 Year"],
  ];
  const awards = [
    ["2025 Southern Legends Championship", "Ember Arena", "Regional", "+800 Participants", "Reached the finals after a run through the regional qualifiers, as starting support.", "gold"],
    ["2024 Mid-Season Open", "Ember Arena", "International", "+900 Participants", "Qualified through the spring split and finished in the top eight.", "silver"],
    ["2024 Community Cup", "Vantage Strike", "Online Event", "~1500 Participants", "Competed in an open online tournament and advanced from the group stage.", "bronze"],
  ];
  const highlights = [
    ["Final Match, Southern Legends", "clash", "15:31 minutes", "July 19, 2025", "1.5M views"],
    ["Mid-Season Highlights", "river", "41:21 minutes", "May 3, 2024", "575K views"],
    ["Community Cup Run", "forest", "21:13 minutes", "September 4, 2024", "125K views"],
    ["Comeback at the Crystal", "siege", "8:02 minutes", "March 12, 2025", "25K views"],
  ];
  await db.batch([
    ...work.map((row, index) =>
      db.prepare("INSERT INTO work_history (id, user_id, team, period, location, duration, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(randomHex(12), userId, ...row, now - index),
    ),
    ...awards.map((row, index) =>
      db.prepare("INSERT INTO awards (id, user_id, title, game, scope, participants, description, medal, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(randomHex(12), userId, ...row, now - index),
    ),
    ...highlights.map((row, index) =>
      db.prepare("INSERT INTO highlights (id, user_id, title, thumbnail, duration, played_on, views, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(randomHex(12), userId, ...row, now - index),
    ),
    db.prepare("INSERT INTO linked_accounts (user_id, account_key, handle) VALUES (?, 'ember-arena', 'alexr#LAS')").bind(userId),
    db.prepare("INSERT INTO applications (user_id, listing_id, note, created_at) VALUES (?, 'guide-writer', '', ?)").bind(userId, now),
    db.prepare("INSERT INTO messages (id, user_id, person_id, from_user, body, read, created_at) VALUES (?, ?, 'mara', 0, ?, 0, ?)")
      .bind(randomHex(12), userId, "Hi Alex! Thanks for applying to write our support guide. What's the one thing you wish someone had told you when you started?", now),
  ]);
}

app.post("/auth/guest", async (c) => {
  await limited(c.env.AUTH_LIMIT, clientKey(c));
  const id = randomHex(16);
  const now = Date.now();
  const skills = ["Mechanical Aim", "Game Sense", "Positioning", "Outplay Potential", "Tilt Control", "Map Knowledge", "Support Play", "Role Flexibility", "Clutch Performance"];
  await c.env.DB.prepare(
    "INSERT INTO users (id, email, is_guest, name, handle, about, country, avatar, skills, created_at, expires_at) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(
      id,
      `guest-${id}@guest.invalid`,
      "Alex Rivera",
      "alexr",
      "Competitive Ember Arena support with a deep understanding of team dynamics and high-pressure decision making. Always aiming for the next win, on and off the arena.",
      "Argentina",
      personAvatar("alex"),
      JSON.stringify(skills),
      now,
      now + GUEST_DAYS * 86_400_000,
    )
    .run();
  await seedGuest(c.env.DB, id);
  await startSession(c, id);
  const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
  return c.json(toUser(row as UserRow), 201);
});

app.post("/auth/signup", async (c) => {
  await limited(c.env.AUTH_LIMIT, clientKey(c));
  const data = await body(c);
  const name = text(data.name, "Name", LIMITS.name, true);
  const email = text(data.email, "Email", 200, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(400, "Enter a valid email.");
  if (!isPasswordProof(data.proof)) throw fail(400, "Enter a valid password.");

  const salt = randomHex(16);
  const id = randomHex(16);
  try {
    await c.env.DB.prepare(
      "INSERT INTO users (id, email, password_salt, password_hash, name, handle, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(id, email, salt, await hashProof(salt, data.proof), name, "", Date.now())
      .run();
  } catch (error) {
    if (String(error).includes("UNIQUE")) throw fail(409, "That email already has an account. Log in instead.");
    throw error;
  }
  await startSession(c, id);
  const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
  return c.json(toUser(row as UserRow), 201);
});

app.post("/auth/login", async (c) => {
  await limited(c.env.AUTH_LIMIT, clientKey(c));
  const data = await body(c);
  const email = text(data.email, "Email", 200, true).toLowerCase();
  const invalid = fail(401, "That email and password don't match.");
  if (!isPasswordProof(data.proof)) throw invalid;
  const row = await c.env.DB.prepare("SELECT * FROM users WHERE email = ? AND is_guest = 0").bind(email).first<UserRow>();
  // Hash either way, so response time doesn't reveal whether the email exists.
  const expected = row?.password_hash ?? "";
  const actual = await hashProof(row?.password_salt ?? "none", data.proof);
  if (!row || !safeEqual(actual, expected)) throw invalid;
  await startSession(c, row.id);
  return c.json(toUser(row));
});

app.post("/auth/logout", async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256Hex(token)).run();
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

/* Everything below needs an account, including a guest one. */
app.use("*", requireUser);

const uid = (c: C) => c.get("user").id;

/* Profile */

app.get("/me", (c) => c.json(toUser(c.get("user"))));

app.patch("/me", async (c) => {
  const data = await body(c);
  const current = c.get("user");
  const skills = Array.isArray(data.skills)
    ? data.skills.filter((skill): skill is string => (SKILLS as readonly string[]).includes(String(skill)))
    : (JSON.parse(current.skills) as string[]);
  const avatar = "avatar" in data ? (data.avatar === current.avatar ? current.avatar : image(data.avatar, "Avatar")) : current.avatar;
  const background = "background" in data ? image(data.background, "Background") : current.background;
  await c.env.DB.prepare("UPDATE users SET name = ?, handle = ?, about = ?, country = ?, avatar = ?, background = ?, skills = ? WHERE id = ?")
    .bind(
      "name" in data ? text(data.name, "Name", LIMITS.name, true) : current.name,
      "handle" in data ? text(data.handle, "URL name", LIMITS.handle) : current.handle,
      "about" in data ? text(data.about, "About", LIMITS.about) : current.about,
      "country" in data ? text(data.country, "Country", LIMITS.country) : current.country,
      avatar,
      background,
      JSON.stringify(skills),
      current.id,
    )
    .run();
  const row = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(current.id).first<UserRow>();
  return c.json(toUser(row as UserRow));
});

app.post("/me/password", async (c) => {
  const data = await body(c);
  const user = c.get("user");
  if (user.is_guest) throw fail(403, "Guest accounts don't have a password.");
  if (!isPasswordProof(data.current) || !isPasswordProof(data.next)) throw fail(400, "Enter a valid password.");
  if (!safeEqual(await hashProof(user.password_salt ?? "", data.current), user.password_hash ?? "")) {
    throw fail(401, "Your current password is incorrect.");
  }
  const salt = randomHex(16);
  await c.env.DB.prepare("UPDATE users SET password_salt = ?, password_hash = ? WHERE id = ?")
    .bind(salt, await hashProof(salt, data.next), user.id)
    .run();
  return c.json({ ok: true });
});

app.delete("/me", async (c) => {
  await c.env.DB.prepare("DELETE FROM users WHERE id = ?").bind(uid(c)).run();
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

/* Catalog */

async function decorate(c: C, listings: Listing[]): Promise<Listing[]> {
  const db = c.env.DB;
  const [applied, saved] = await db.batch<{ listing_id: string }>([
    db.prepare("SELECT listing_id FROM applications WHERE user_id = ?").bind(uid(c)),
    db.prepare("SELECT listing_id FROM saved_listings WHERE user_id = ?").bind(uid(c)),
  ]);
  const appliedIds = new Set(applied.results.map((row) => row.listing_id));
  const savedIds = new Set(saved.results.map((row) => row.listing_id));
  const skills = JSON.parse(c.get("user").skills) as string[];
  return listings.map((listing) => ({
    ...listing,
    applied: appliedIds.has(listing.id),
    saved: savedIds.has(listing.id),
    match: matchScore(listing.skills, skills),
  }));
}

const contains = (haystack: string, needle: string) => haystack.toLowerCase().includes(needle);

app.get("/games", (c) => c.json(GAMES));

app.get("/listings", async (c) => {
  const category = c.req.query("category");
  const query = (c.req.query("q") ?? "").trim().toLowerCase().slice(0, 80);
  const saved = c.req.query("saved") === "1";
  let results = LISTINGS;
  if (category && (CATEGORIES as readonly string[]).includes(category)) {
    results = results.filter((listing) => listing.category === category);
  }
  if (query) {
    results = results.filter((listing) =>
      contains(`${listing.title} ${listing.teamName} ${listing.gameName} ${listing.role} ${listing.skills.join(" ")}`, query),
    );
  }
  const decorated = await decorate(c, results);
  return c.json(saved ? decorated.filter((listing) => listing.saved) : decorated);
});

app.get("/listings/:id", async (c) => {
  const detail = listingDetail(c.req.param("id"));
  if (!detail) throw fail(404, "That listing doesn't exist.");
  const [current] = await decorate(c, [detail]);
  const similar = LISTINGS.filter((listing) => listing.id !== detail.id && (listing.gameId === detail.gameId || listing.category === detail.category)).slice(0, 3);
  return c.json({ ...detail, ...current, similar: await decorate(c, similar) });
});

app.get("/teams", async (c) => {
  const follows = await c.env.DB.prepare("SELECT team_id FROM follows WHERE user_id = ?").bind(uid(c)).all<{ team_id: string }>();
  const ids = new Set(follows.results.map((row) => row.team_id));
  return c.json(TEAMS.map((team) => ({ ...team, following: ids.has(team.id) })));
});

app.get("/teams/:id", async (c) => {
  const team = TEAMS.find((candidate) => candidate.id === c.req.param("id"));
  if (!team) throw fail(404, "That team doesn't exist.");
  const follow = await c.env.DB.prepare("SELECT 1 FROM follows WHERE user_id = ? AND team_id = ?").bind(uid(c), team.id).first();
  const listings = await decorate(c, LISTINGS.filter((listing) => listing.teamId === team.id));
  return c.json({ ...team, following: Boolean(follow), listings });
});

app.get("/people", (c) => c.json(PEOPLE));

app.get("/search", async (c) => {
  const query = (c.req.query("q") ?? "").trim().toLowerCase().slice(0, 80);
  const match = (value: string) => !query || contains(value, query);
  const listings = LISTINGS.filter((listing) => match(`${listing.title} ${listing.teamName} ${listing.gameName} ${listing.category}`));
  return c.json({
    games: GAMES.filter((game) => match(`${game.name} ${game.genre}`)),
    listings: await decorate(c, listings),
    people: PEOPLE.filter((person) => match(`${person.name} ${person.role} ${person.headline}`)),
    teams: TEAMS.filter((team) => match(`${team.name} ${team.location}`)),
  });
});

app.get("/home", async (c) => {
  const decorated = await decorate(c, LISTINGS);
  const matches = decorated
    .filter((listing) => !listing.applied)
    .sort((a, b) => (b.match ?? 0) - (a.match ?? 0) || a.postedDaysAgo - b.postedDaysAgo)
    .slice(0, 3);
  const follows = await c.env.DB.prepare("SELECT team_id FROM follows WHERE user_id = ?").bind(uid(c)).all<{ team_id: string }>();
  const ids = new Set(follows.results.map((row) => row.team_id));
  const suggestedTeams: Team[] = TEAMS.map((team) => ({ ...team, following: ids.has(team.id) }))
    .sort((a, b) => Number(a.following) - Number(b.following))
    .slice(0, 3);
  return c.json({ matches, applied: decorated.filter((listing) => listing.applied).slice(0, 3), suggestedTeams });
});

/* Applications, saved listings and follows */

app.post("/listings/:id/apply", async (c) => {
  const listing = LISTINGS.find((candidate) => candidate.id === c.req.param("id"));
  if (!listing) throw fail(404, "That listing doesn't exist.");
  const data = await body(c);
  const note = text(data.note, "Note", LIMITS.note);
  const now = Date.now();
  const inserted = await c.env.DB.prepare("INSERT OR IGNORE INTO applications (user_id, listing_id, note, created_at) VALUES (?, ?, ?, ?)")
    .bind(uid(c), listing.id, note, now)
    .run();
  if (inserted.meta.changes === 0) throw fail(409, "You already applied to this one.");
  // A recruiter acknowledges every application, which opens a conversation in the inbox.
  const recruiter = recruiterFor(listing);
  await c.env.DB.prepare("INSERT INTO messages (id, user_id, person_id, from_user, body, read, created_at) VALUES (?, ?, ?, 0, ?, 0, ?)")
    .bind(randomHex(12), uid(c), recruiter.id, `Hi ${c.get("user").name.split(" ")[0]}! I'm ${recruiter.name}, and I got your application for "${listing.title}". What's your availability for a quick trial this week?`, now)
    .run();
  return c.json({ ok: true, recruiterId: recruiter.id }, 201);
});

app.delete("/listings/:id/apply", async (c) => {
  await c.env.DB.prepare("DELETE FROM applications WHERE user_id = ? AND listing_id = ?").bind(uid(c), c.req.param("id")).run();
  return c.json({ ok: true });
});

app.put("/listings/:id/save", async (c) => {
  if (!LISTINGS.some((listing) => listing.id === c.req.param("id"))) throw fail(404, "That listing doesn't exist.");
  await c.env.DB.prepare("INSERT OR IGNORE INTO saved_listings (user_id, listing_id) VALUES (?, ?)").bind(uid(c), c.req.param("id")).run();
  return c.json({ ok: true });
});

app.delete("/listings/:id/save", async (c) => {
  await c.env.DB.prepare("DELETE FROM saved_listings WHERE user_id = ? AND listing_id = ?").bind(uid(c), c.req.param("id")).run();
  return c.json({ ok: true });
});

app.put("/teams/:id/follow", async (c) => {
  if (!TEAMS.some((team) => team.id === c.req.param("id"))) throw fail(404, "That team doesn't exist.");
  await c.env.DB.prepare("INSERT OR IGNORE INTO follows (user_id, team_id) VALUES (?, ?)").bind(uid(c), c.req.param("id")).run();
  return c.json({ ok: true });
});

app.delete("/teams/:id/follow", async (c) => {
  await c.env.DB.prepare("DELETE FROM follows WHERE user_id = ? AND team_id = ?").bind(uid(c), c.req.param("id")).run();
  return c.json({ ok: true });
});

/* AI: the catalog's fictional people answer through Workers AI, with canned replies as a fallback. */

async function askPerson(c: C, personId: string, history: { role: "user" | "assistant"; content: string }[], fallbackSeed: number): Promise<string> {
  const person = PEOPLE.find((candidate) => candidate.id === personId);
  const fallback = FALLBACK_REPLIES[fallbackSeed % FALLBACK_REPLIES.length];
  if (!person) return fallback;
  try {
    await limited(c.env.AI_LIMIT, uid(c));
    const raw = (await c.env.AI.run(AI_MODEL, {
      max_tokens: 220,
      temperature: 0.7,
      chat_template_kwargs: { enable_thinking: false },
      messages: [
        {
          role: "system",
          content: `You are ${person.name}, a fictional ${person.role} on Cantera, a demo esports talent platform. ${person.bio} All teams and games here are invented. Reply as a short, friendly plain-text chat message of at most three sentences, with no Markdown, in the language of the user. Never promise real money or a real contract, and never ask for personal or payment details.`,
        },
        ...history,
      ],
    })) as { response?: string; choices?: { message?: { content?: string } }[] };
    const answer = raw.choices?.[0]?.message?.content ?? raw.response;
    return (answer && tidyReply(answer)) || fallback;
  } catch (error) {
    console.error("AI reply failed:", error instanceof Error ? error.message : error);
    return fallback;
  }
}

/* Feed */

app.get("/feed", async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  const [own, replies, reactions] = await db.batch([
    db.prepare("SELECT id, body, created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC").bind(user.id),
    db.prepare("SELECT id, post_id, person_id, body, created_at FROM replies WHERE user_id = ? ORDER BY created_at").bind(user.id),
    db.prepare("SELECT post_id, kind FROM reactions WHERE user_id = ?").bind(user.id),
  ]) as [
    D1Result<{ id: string; body: string; created_at: number }>,
    D1Result<{ id: string; post_id: string; person_id: string | null; body: string; created_at: number }>,
    D1Result<{ post_id: string; kind: string }>,
  ];

  const repliesFor = (postId: string): Reply[] =>
    replies.results
      .filter((reply) => reply.post_id === postId)
      .map((reply) => {
        const person = PEOPLE.find((candidate) => candidate.id === reply.person_id);
        return {
          id: reply.id,
          body: reply.body,
          createdAt: reply.created_at,
          author: person ? { name: person.name, avatar: personAvatar(person.id) } : { name: user.name, avatar: user.avatar },
        };
      });
  const reactionsFor = (postId: string) => reactions.results.filter((row) => row.post_id === postId).map((row) => row.kind);

  const posts: FeedPost[] = [
    ...own.results.map((post) => ({
      id: post.id,
      mine: true,
      author: { name: user.name, avatar: user.avatar, headline: "Visible only to you" },
      body: post.body,
      createdAt: post.created_at,
      reactions: reactionsFor(post.id),
      replies: repliesFor(post.id),
    })),
    ...SHARED_POSTS.map(({ personId, ...post }) => {
      const person = PEOPLE.find((candidate) => candidate.id === personId);
      return {
        ...post,
        mine: false,
        author: { name: person?.name ?? "", avatar: personAvatar(personId), headline: person?.headline ?? "" },
        reactions: reactionsFor(post.id),
        replies: repliesFor(post.id),
      };
    }),
  ];
  return c.json(posts);
});

async function ownsOrShared(c: C, postId: string): Promise<boolean> {
  if (SHARED_POSTS.some((post) => post.id === postId)) return true;
  return Boolean(await c.env.DB.prepare("SELECT 1 FROM posts WHERE id = ? AND user_id = ?").bind(postId, uid(c)).first());
}

app.post("/posts", async (c) => {
  const data = await body(c);
  const postBody = text(data.body, "Post", LIMITS.post, true);
  const count = await c.env.DB.prepare("SELECT COUNT(*) AS total FROM posts WHERE user_id = ?").bind(uid(c)).first<{ total: number }>();
  if ((count?.total ?? 0) >= LIMITS.postsPerUser) throw fail(409, "You reached the post limit for this demo.");
  const id = randomHex(12);
  await c.env.DB.prepare("INSERT INTO posts (id, user_id, body, created_at) VALUES (?, ?, ?, ?)").bind(id, uid(c), postBody, Date.now()).run();

  // A coach answers new posts, so the feed responds even though it's private to each visitor.
  const answer = await askPerson(c, "devon", [{ role: "user", content: postBody }], postBody.length);
  await c.env.DB.prepare("INSERT INTO replies (id, user_id, post_id, person_id, body, created_at) VALUES (?, ?, ?, 'devon', ?, ?)")
    .bind(randomHex(12), uid(c), id, answer, Date.now())
    .run();
  return c.json({ id }, 201);
});

app.delete("/posts/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const result = await db.prepare("DELETE FROM posts WHERE id = ? AND user_id = ?").bind(id, uid(c)).run();
  if (result.meta.changes === 0) throw fail(404, "That post doesn't exist.");
  await db.batch([
    db.prepare("DELETE FROM replies WHERE post_id = ? AND user_id = ?").bind(id, uid(c)),
    db.prepare("DELETE FROM reactions WHERE post_id = ? AND user_id = ?").bind(id, uid(c)),
  ]);
  return c.json({ ok: true });
});

app.post("/posts/:id/replies", async (c) => {
  const id = c.req.param("id");
  if (!(await ownsOrShared(c, id))) throw fail(404, "That post doesn't exist.");
  const data = await body(c);
  const reply = text(data.body, "Reply", LIMITS.reply, true);
  await c.env.DB.prepare("INSERT INTO replies (id, user_id, post_id, person_id, body, created_at) VALUES (?, ?, ?, NULL, ?, ?)")
    .bind(randomHex(12), uid(c), id, reply, Date.now())
    .run();
  return c.json({ ok: true }, 201);
});

app.put("/posts/:id/reactions/:kind", async (c) => {
  const { id, kind } = c.req.param();
  if (!(REACTIONS as readonly string[]).includes(kind) || !(await ownsOrShared(c, id))) throw fail(404, "That post doesn't exist.");
  await c.env.DB.prepare("INSERT OR IGNORE INTO reactions (user_id, post_id, kind) VALUES (?, ?, ?)").bind(uid(c), id, kind).run();
  return c.json({ ok: true });
});

app.delete("/posts/:id/reactions/:kind", async (c) => {
  const { id, kind } = c.req.param();
  await c.env.DB.prepare("DELETE FROM reactions WHERE user_id = ? AND post_id = ? AND kind = ?").bind(uid(c), id, kind).run();
  return c.json({ ok: true });
});

/* Inbox */

app.get("/conversations", async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT person_id, body, created_at, unread FROM (
       SELECT person_id, body, created_at,
         SUM(CASE WHEN from_user = 0 AND read = 0 THEN 1 ELSE 0 END) OVER (PARTITION BY person_id) AS unread,
         ROW_NUMBER() OVER (PARTITION BY person_id ORDER BY created_at DESC) AS position
       FROM messages WHERE user_id = ?
     ) WHERE position = 1 ORDER BY created_at DESC`,
  )
    .bind(uid(c))
    .all<{ person_id: string; body: string; created_at: number; unread: number }>();
  const conversations: Conversation[] = rows.results.flatMap((row) => {
    const person = PEOPLE.find((candidate) => candidate.id === row.person_id);
    return person ? [{ person, lastMessage: row.body, lastAt: row.created_at, unread: row.unread }] : [];
  });
  return c.json(conversations);
});

const toMessage = (row: { id: string; from_user: number; body: string; created_at: number }): Message => ({
  id: row.id,
  fromUser: Boolean(row.from_user),
  body: row.body,
  createdAt: row.created_at,
});

app.get("/conversations/:personId", async (c) => {
  const personId = c.req.param("personId");
  const person = PEOPLE.find((candidate) => candidate.id === personId);
  if (!person) throw fail(404, "That person doesn't exist.");
  const db = c.env.DB;
  const [messages] = await db.batch<{ id: string; from_user: number; body: string; created_at: number }>([
    db.prepare("SELECT id, from_user, body, created_at FROM messages WHERE user_id = ? AND person_id = ? ORDER BY created_at").bind(uid(c), personId),
    db.prepare("UPDATE messages SET read = 1 WHERE user_id = ? AND person_id = ? AND read = 0").bind(uid(c), personId),
  ]);
  return c.json({ person, messages: messages.results.map(toMessage) });
});

app.post("/conversations/:personId", async (c) => {
  const personId = c.req.param("personId");
  if (!PEOPLE.some((person) => person.id === personId)) throw fail(404, "That person doesn't exist.");
  const data = await body(c);
  const message = text(data.body, "Message", LIMITS.message, true);
  const db = c.env.DB;
  const previous = await db.prepare("SELECT from_user, body FROM messages WHERE user_id = ? AND person_id = ? ORDER BY created_at DESC LIMIT 12")
    .bind(uid(c), personId)
    .all<{ from_user: number; body: string }>();
  const total = await db.prepare("SELECT COUNT(*) AS total FROM messages WHERE user_id = ? AND person_id = ?").bind(uid(c), personId).first<{ total: number }>();
  if ((total?.total ?? 0) >= LIMITS.messagesPerThread) throw fail(409, "This conversation reached its limit for the demo.");

  const now = Date.now();
  await db.prepare("INSERT INTO messages (id, user_id, person_id, from_user, body, read, created_at) VALUES (?, ?, ?, 1, ?, 1, ?)")
    .bind(randomHex(12), uid(c), personId, message, now)
    .run();
  const history = previous.results.reverse().map((row) => ({ role: row.from_user ? ("user" as const) : ("assistant" as const), content: row.body }));
  const answer = await askPerson(c, personId, [...history, { role: "user", content: message }], message.length);
  await db.prepare("INSERT INTO messages (id, user_id, person_id, from_user, body, read, created_at) VALUES (?, ?, ?, 0, ?, 1, ?)")
    .bind(randomHex(12), uid(c), personId, answer, Date.now())
    .run();
  const thread = await db.prepare("SELECT id, from_user, body, created_at FROM messages WHERE user_id = ? AND person_id = ? ORDER BY created_at")
    .bind(uid(c), personId)
    .all<{ id: string; from_user: number; body: string; created_at: number }>();
  return c.json(thread.results.map(toMessage), 201);
});

app.get("/notifications", async (c) => {
  const db = c.env.DB;
  const [messages, applications] = await db.batch([
    db.prepare("SELECT id, person_id, body, created_at FROM messages WHERE user_id = ? AND from_user = 0 AND read = 0 ORDER BY created_at DESC LIMIT 8").bind(uid(c)),
    db.prepare("SELECT listing_id, created_at FROM applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5").bind(uid(c)),
  ]) as [
    D1Result<{ id: string; person_id: string; body: string; created_at: number }>,
    D1Result<{ listing_id: string; created_at: number }>,
  ];
  const items: Notification[] = [
    ...messages.results.map((row) => ({
      id: `message-${row.id}`,
      text: `${PEOPLE.find((person) => person.id === row.person_id)?.name ?? "Someone"} sent you a message`,
      to: `/inbox/${row.person_id}`,
      createdAt: row.created_at,
    })),
    ...applications.results.flatMap((row) => {
      const listing = LISTINGS.find((candidate) => candidate.id === row.listing_id);
      return listing
        ? [{ id: `application-${row.listing_id}`, text: `Your application to ${listing.teamName} was received`, to: `/jobs/${listing.id}`, createdAt: row.created_at }]
        : [];
    }),
  ].sort((a, b) => b.createdAt - a.createdAt);
  return c.json({ items, unread: messages.results.length });
});

/* Work history, awards, highlights and linked accounts */

async function underLimit(c: C, table: "work_history" | "awards" | "highlights"): Promise<void> {
  const count = await c.env.DB.prepare(`SELECT COUNT(*) AS total FROM ${table} WHERE user_id = ?`).bind(uid(c)).first<{ total: number }>();
  if ((count?.total ?? 0) >= LIMITS.rowsPerCollection) throw fail(409, "You reached the limit for this section.");
}

async function deleteOwned(c: C, table: "work_history" | "awards" | "highlights"): Promise<Response> {
  const result = await c.env.DB.prepare(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`).bind(c.req.param("id") ?? "", uid(c)).run();
  if (result.meta.changes === 0) throw fail(404, "That item doesn't exist.");
  return c.json({ ok: true });
}

app.get("/profile/sections", async (c) => {
  const db = c.env.DB;
  const [work, awards, highlights, linked] = await db.batch([
    db.prepare("SELECT id, team, period, location, duration FROM work_history WHERE user_id = ? ORDER BY created_at DESC").bind(uid(c)),
    db.prepare("SELECT id, title, game, scope, participants, description, medal FROM awards WHERE user_id = ? ORDER BY created_at DESC").bind(uid(c)),
    db.prepare("SELECT id, title, thumbnail, duration, played_on AS playedOn, views FROM highlights WHERE user_id = ? ORDER BY created_at DESC").bind(uid(c)),
    db.prepare("SELECT account_key AS accountKey, handle FROM linked_accounts WHERE user_id = ?").bind(uid(c)),
  ]) as [D1Result<WorkItem>, D1Result<Award>, D1Result<Highlight>, D1Result<{ accountKey: string; handle: string }>];
  return c.json({ work: work.results, awards: awards.results, highlights: highlights.results, linked: linked.results });
});

app.post("/profile/work", async (c) => {
  await underLimit(c, "work_history");
  const data = await body(c);
  await c.env.DB.prepare("INSERT INTO work_history (id, user_id, team, period, location, duration, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(randomHex(12), uid(c), text(data.team, "Team", LIMITS.shortField, true), text(data.period, "Period", LIMITS.shortField, true), text(data.location, "Location", LIMITS.shortField), text(data.duration, "Duration", LIMITS.shortField), Date.now())
    .run();
  return c.json({ ok: true }, 201);
});
app.delete("/profile/work/:id", (c) => deleteOwned(c, "work_history"));

app.post("/profile/awards", async (c) => {
  await underLimit(c, "awards");
  const data = await body(c);
  const medal = ["gold", "silver", "bronze"].includes(String(data.medal)) ? String(data.medal) : "gold";
  await c.env.DB.prepare("INSERT INTO awards (id, user_id, title, game, scope, participants, description, medal, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(randomHex(12), uid(c), text(data.title, "Title", LIMITS.shortField, true), text(data.game, "Game", LIMITS.shortField), text(data.scope, "Scope", LIMITS.shortField), text(data.participants, "Participants", LIMITS.shortField), text(data.description, "Description", LIMITS.description), medal, Date.now())
    .run();
  return c.json({ ok: true }, 201);
});
app.delete("/profile/awards/:id", (c) => deleteOwned(c, "awards"));

app.post("/profile/highlights", async (c) => {
  await underLimit(c, "highlights");
  const data = await body(c);
  const thumbnail = (THUMBNAILS as readonly string[]).includes(String(data.thumbnail)) ? String(data.thumbnail) : THUMBNAILS[0];
  await c.env.DB.prepare("INSERT INTO highlights (id, user_id, title, thumbnail, duration, played_on, views, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(randomHex(12), uid(c), text(data.title, "Title", LIMITS.shortField, true), thumbnail, text(data.duration, "Duration", LIMITS.shortField), text(data.playedOn, "Date", LIMITS.shortField), text(data.views, "Views", LIMITS.shortField), Date.now())
    .run();
  return c.json({ ok: true }, 201);
});
app.delete("/profile/highlights/:id", (c) => deleteOwned(c, "highlights"));

app.put("/profile/linked/:key", async (c) => {
  const key = c.req.param("key");
  if (!LINKED_ACCOUNTS.some((account) => account.key === key)) throw fail(404, "Unknown account type.");
  const data = await body(c);
  await c.env.DB.prepare("INSERT INTO linked_accounts (user_id, account_key, handle) VALUES (?, ?, ?) ON CONFLICT (user_id, account_key) DO UPDATE SET handle = excluded.handle")
    .bind(uid(c), key, text(data.handle, "Username", LIMITS.shortField, true))
    .run();
  return c.json({ ok: true });
});

app.delete("/profile/linked/:key", async (c) => {
  await c.env.DB.prepare("DELETE FROM linked_accounts WHERE user_id = ? AND account_key = ?").bind(uid(c), c.req.param("key")).run();
  return c.json({ ok: true });
});

app.all("*", () => {
  throw fail(404, "Unknown endpoint.");
});

export default {
  async fetch(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
    if (new URL(request.url).pathname.startsWith("/api/")) return app.fetch(request, env, context);
    return env.ASSETS.fetch(request);
  },

  /** Daily cleanup, so old guest accounts don't use up the free storage. */
  async scheduled(_event: ScheduledController, env: Env): Promise<void> {
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare("DELETE FROM users WHERE expires_at IS NOT NULL AND expires_at < ?").bind(now),
      env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now),
    ]);
  },
};
