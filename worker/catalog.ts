/**
 * The shared catalog. Every team, game, person and listing is invented; none represents a real
 * organization or person. It lives in code, so reading it uses none of the database allowance.
 */
import type { Category, FeedPost, Game, Listing, ListingDetail, Person, Team } from "../src/shared/types";

export const GAMES: Game[] = [
  { id: "ember-arena", name: "Ember Arena", genre: "MOBA", banner: "ember", description: "Five-on-five battles for control of a burning arena." },
  { id: "vantage-strike", name: "Vantage Strike", genre: "Tactical shooter", banner: "jade", description: "Round-based attack and defense where one mistake ends the round." },
  { id: "skyline-royale", name: "Skyline Royale", genre: "Battle royale", banner: "storm", description: "Sixty squads, one shrinking city, and no second chances." },
  { id: "kingsfall", name: "Kingsfall", genre: "Real-time strategy", banner: "frost", description: "Build, scout and outthink a single opponent." },
];

const team = (
  id: string,
  name: string,
  banner: string,
  tagline: string,
  location: string,
  founded: string,
  size: string,
  focusAreas: string[],
  game: string,
): Team => ({
  id,
  name,
  banner,
  tagline,
  location,
  founded,
  size,
  focusAreas,
  about: [
    `${name} is an independent esports organization built around one idea: ${tagline.toLowerCase()}`,
    `We field competitive rosters in ${game}, run an academy for rising players, and give staff room to grow beyond a single season.`,
  ],
  whatWeDo: [
    "Build competitive rosters with purpose, not just rankings",
    "Run an academy that turns ranked talent into tournament players",
    "Support creators and players as individuals",
    "Share scouting and coaching methods with the wider community",
  ],
  faqs: [
    { question: `What games does ${name} focus on?`, answer: `Our main title is ${game}, and we scout other titles every season.` },
    { question: "Where are members based?", answer: `Our base is in ${location}, and most roles work remotely between events.` },
    { question: "Is the team hiring?", answer: "Yes. Open roles are listed below, and we read every application." },
  ],
});

export const TEAMS: Team[] = [
  team("ember-foxes", "Ember Foxes", "ember", "Patience wins more games than talent.", "Lisbon, Portugal", "2019", "51-200 employees", ["Player Development", "Coaching", "Community Growth"], "Ember Arena"),
  team("stormhowl", "Stormhowl", "storm", "Every player should be able to call the shot.", "Toronto, Canada", "2021", "11-50 employees", ["Competitive Play", "Streaming", "Live Events"], "Skyline Royale"),
  team("jade-vanguard", "Jade Vanguard", "jade", "Discipline is a skill you can train.", "Seoul, South Korea", "2017", "51-200 employees", ["Tactical Analysis", "Coaching", "Cross-Platform Presence"], "Vantage Strike"),
  team("frostline", "Frostline Esports", "frost", "Small rosters, long contracts, no drama.", "Oslo, Norway", "2020", "11-50 employees", ["Player Development", "Mental Coaching"], "Kingsfall"),
  team("dune-raiders", "Dune Raiders", "dusk", "Regional scenes deserve world-class teams.", "Buenos Aires, Argentina", "2022", "11-50 employees", ["Community Growth", "Creative Culture", "Live Events"], "Vantage Strike"),
  team("voidlight", "Voidlight", "void", "Great content and great play feed each other.", "Remote", "2023", "1-10 employees", ["Content Creation", "Streaming", "Creative Culture"], "Ember Arena"),
];

export const PEOPLE: Person[] = [
  { id: "mara", name: "Mara Quinn", role: "Recruiter at Ember Foxes", headline: "Finding players before the ladder does", bio: "Former semi-pro who now scouts for Ember Foxes." },
  { id: "devon", name: "Devon Achebe", role: "Head coach at Jade Vanguard", headline: "Coaching others to improve their game", bio: "Eight seasons coaching tactical shooters. Direct, kind, obsessed with fundamentals." },
  { id: "yuki", name: "Yuki Tanabe", role: "Analyst at Frostline", headline: "Turning VODs into habits", bio: "Performance analyst who builds review routines for players." },
  { id: "rafa", name: "Rafa Moreno", role: "Captain at Dune Raiders", headline: "Building the Latin American scene", bio: "In-game leader and a loud voice for regional esports." },
  { id: "nadia", name: "Nadia Farouk", role: "Talent manager at Stormhowl", headline: "Contracts, careers, and common sense", bio: "Helps players read contracts and plan careers." },
  { id: "tomas", name: "Tomas Lind", role: "Mental performance coach", headline: "Tilt is a training problem", bio: "Sports psychologist working with esports rosters." },
  { id: "priya", name: "Priya Raman", role: "Creator at Voidlight", headline: "Narrative streams and short clips", bio: "Streamer who explains high-level play for newcomers." },
  { id: "kofi", name: "Kofi Mensah", role: "Rising player", headline: "Academy player, ranked grinder", bio: "Academy player sharing what it takes to go pro." },
  { id: "lena", name: "Lena Brandt", role: "Video editor", headline: "Turning chaos into scroll-stopping clips", bio: "Freelance editor for esports creators." },
];

interface Seed {
  id: string;
  category: Category;
  teamId: string;
  title: string;
  role: string;
  gameId: string;
  pay: [number, number];
  hours: string;
  mode: string;
  schedule: string;
  jobType?: string;
  days: number;
  skills: string[];
  summary: string;
}

const SEEDS: Seed[] = [
  { id: "support-main-fa", category: "job", teamId: "ember-foxes", title: "Support Main, Ember Arena (Remote/LAN)", role: "Pro Player | Ember Arena", gameId: "ember-arena", pay: [90, 140], hours: "35 hrs/wk", mode: "Remote", schedule: "Weekends", days: 2, skills: ["Support Play", "Map Knowledge", "Role Flexibility", "Shot Calling"], summary: "We need a support who sets the tempo, protects the carry, and makes everyone around them better." },
  { id: "battle-royale-igl", category: "job", teamId: "stormhowl", title: "In-Game Leader, Skyline Royale", role: "Competitive Player | Skyline Royale", gameId: "skyline-royale", pay: [50, 70], hours: "40 hrs/wk", mode: "Hybrid", schedule: "Any time", days: 4, skills: ["Shot Calling", "Game Sense", "Positioning", "Tilt Control"], summary: "Lead a four-player squad through the rotations that decide every match." },
  { id: "entry-fragger-na", category: "job", teamId: "jade-vanguard", title: "Entry Fragger, Vantage Strike", role: "Pro Player | Vantage Strike", gameId: "vantage-strike", pay: [110, 170], hours: "40 hrs/wk", mode: "Remote", schedule: "Any time", days: 1, skills: ["Mechanical Aim", "Outplay Potential", "Clutch Performance", "Map Knowledge"], summary: "First through the door, every round. We want aim backed by discipline." },
  { id: "academy-mid", category: "job", teamId: "dune-raiders", title: "Academy Mid Laner, Ember Arena", role: "Academy Player | Ember Arena", gameId: "ember-arena", pay: [25, 45], hours: "30 hrs/wk", mode: "Remote", schedule: "Evenings", days: 6, skills: ["Mechanical Aim", "Game Sense", "VOD Review"], summary: "A paid path into competitive play for a hungry ranked player." },
  { id: "rts-pro", category: "job", teamId: "frostline", title: "Pro Player, Kingsfall", role: "Pro Player | Kingsfall", gameId: "kingsfall", pay: [70, 115], hours: "35 hrs/wk", mode: "Hybrid", schedule: "Weekdays", days: 9, skills: ["Game Sense", "Tilt Control", "Clutch Performance"], summary: "One player, long contract, and a staff built around your preparation." },
  { id: "head-coach-vs", category: "coach", teamId: "dune-raiders", title: "Head Coach, Vantage Strike", role: "Coach | Vantage Strike", gameId: "vantage-strike", pay: [60, 95], hours: "40 hrs/wk", mode: "Remote", schedule: "Weekdays", days: 3, skills: ["Mentoring", "VOD Review", "Shot Calling", "Tilt Control"], summary: "Build the training culture of a young, ambitious roster." },
  { id: "analyst-ea", category: "coach", teamId: "ember-foxes", title: "Performance Analyst", role: "Analyst | Ember Arena", gameId: "ember-arena", pay: [40, 65], hours: "30 hrs/wk", mode: "Remote", schedule: "Flexible", days: 11, skills: ["VOD Review", "Game Sense", "Mentoring"], summary: "Turn hours of replays into three things players can fix this week." },
  { id: "narrative-streamer", category: "creator", teamId: "voidlight", title: "Narrative Streamer", role: "Creator | Ember Arena", gameId: "ember-arena", pay: [30, 80], hours: "20 hrs/wk", mode: "Remote", schedule: "Flexible", days: 5, skills: ["Content Creation", "Game Sense"], summary: "Tell the story behind the match, and grow an audience that stays for it." },
  { id: "clip-editor", category: "creator", teamId: "stormhowl", title: "Short-Form Video Editor", role: "Creator | Skyline Royale", gameId: "skyline-royale", pay: [28, 50], hours: "20 hrs/wk", mode: "Remote", schedule: "Flexible", days: 8, skills: ["Video Editing", "Content Creation"], summary: "Turn long scrims into short clips people actually finish." },
  { id: "aim-session", category: "session", teamId: "jade-vanguard", title: "Aim Fundamentals, 1-on-1 Session", role: "Paid session | Vantage Strike", gameId: "vantage-strike", pay: [20, 35], hours: "1 hr", mode: "Remote", schedule: "Any time", jobType: "Single session", days: 2, skills: ["Mechanical Aim", "Mentoring"], summary: "Run focused aim sessions for players climbing the ranked ladder." },
  { id: "tilt-session", category: "session", teamId: "frostline", title: "Tilt Control Workshop Host", role: "Paid session | Any game", gameId: "kingsfall", pay: [35, 60], hours: "2 hrs/wk", mode: "Remote", schedule: "Evenings", jobType: "Part time", days: 7, skills: ["Tilt Control", "Mentoring"], summary: "Host a weekly group session on staying sharp under pressure." },
  { id: "open-cup-caster", category: "event", teamId: "dune-raiders", title: "Caster, Southern Open Cup", role: "Event | Vantage Strike", gameId: "vantage-strike", pay: [40, 60], hours: "3 days", mode: "LAN", schedule: "Weekend", jobType: "Single event", days: 10, skills: ["Content Creation", "Game Sense"], summary: "Call the finals of a regional open, live, in front of a crowd." },
  { id: "lan-admin", category: "event", teamId: "stormhowl", title: "Tournament Admin, Skyline Invitational", role: "Event | Skyline Royale", gameId: "skyline-royale", pay: [25, 40], hours: "4 days", mode: "LAN", schedule: "Weekend", jobType: "Single event", days: 12, skills: ["Map Knowledge", "Role Flexibility"], summary: "Keep sixty squads on schedule at our biggest event of the year." },
  { id: "community-lead", category: "community", teamId: "voidlight", title: "Community Lead", role: "Community | Ember Arena", gameId: "ember-arena", pay: [22, 38], hours: "25 hrs/wk", mode: "Remote", schedule: "Flexible", days: 4, skills: ["Content Creation", "Mentoring"], summary: "Run the place where our players, fans and creators meet every day." },
  { id: "scrim-organizer", category: "community", teamId: "dune-raiders", title: "Scrim League Organizer", role: "Community | Vantage Strike", gameId: "vantage-strike", pay: [18, 30], hours: "15 hrs/wk", mode: "Remote", schedule: "Evenings", days: 13, skills: ["Shot Calling", "Mentoring"], summary: "Keep a weekly league running for rising regional teams." },
  { id: "guide-writer", category: "guide", teamId: "ember-foxes", title: "Support Guide Writer", role: "Guide | Ember Arena", gameId: "ember-arena", pay: [25, 40], hours: "10 hrs/wk", mode: "Remote", schedule: "Flexible", days: 6, skills: ["Support Play", "Map Knowledge", "Content Creation"], summary: "Write the guide you wish you'd had when you started." },
  { id: "map-guide", category: "guide", teamId: "jade-vanguard", title: "Map Strategy Author", role: "Guide | Vantage Strike", gameId: "vantage-strike", pay: [30, 45], hours: "10 hrs/wk", mode: "Remote", schedule: "Flexible", days: 15, skills: ["Map Knowledge", "VOD Review"], summary: "Explain the setups pros use, in a way a ranked player can apply tonight." },
];

function toListing(seed: Seed): Listing {
  const owner = TEAMS.find((candidate) => candidate.id === seed.teamId) as Team;
  const game = GAMES.find((candidate) => candidate.id === seed.gameId) as Game;
  return {
    id: seed.id,
    category: seed.category,
    teamId: owner.id,
    teamName: owner.name,
    banner: owner.banner,
    title: seed.title,
    role: seed.role,
    gameId: game.id,
    gameName: game.name,
    payMin: seed.pay[0],
    payMax: seed.pay[1],
    hours: seed.hours,
    mode: seed.mode,
    schedule: seed.schedule,
    jobType: seed.jobType ?? "Full Time / Part Time",
    postedDaysAgo: seed.days,
    skills: seed.skills,
  };
}

export const LISTINGS: Listing[] = SEEDS.map(toListing).sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);

export function listingDetail(id: string): Omit<ListingDetail, "similar"> | null {
  const seed = SEEDS.find((candidate) => candidate.id === id);
  if (!seed) return null;
  const listing = toListing(seed);
  return {
    ...listing,
    description: [
      seed.summary,
      `${listing.teamName} doesn't hire for highlights alone. We want someone who improves the people around them and stays curious when results don't come.`,
      `You'd work with our ${listing.gameName} staff on a clear plan for the season, with honest feedback every week.`,
    ],
    requirements: [
      `Proven experience in ${listing.gameName}, at ranked or tournament level`,
      ...listing.skills.slice(0, 2).map((skill) => `Strong ${skill.toLowerCase()}`),
      "Clear communication in voice comms and written notes",
      "Available for practice blocks and occasional LAN events",
    ],
    greatFit: [
      "You read the game ahead of the moment, and explain your reasoning",
      "You'd rather fix a habit than blame a teammate",
      "You care about the project, the people, and the win rate",
    ],
    offers: [
      `$${listing.payMin}-${listing.payMax} per hour, agreed before you start`,
      "Access to our coaches, analysts and review tools",
      "Visibility through team content, if you want it",
      "A community with heart, strategy, and a vision beyond the meta",
    ],
    expectations: [
      "Showing up prepared, including on bad days",
      "Competitive drive with a respectful attitude",
      `Commitment of about ${listing.hours}`,
    ],
    whyItMatters: [
      "Regional scenes need more than recycled rosters and empty promises",
      `This role shapes how ${listing.teamName} plays, trains and talks to its community`,
    ],
  };
}

const POST_LIST = [
  "How I built a training schedule without burning out the squad",
  "The tools we used for tactical analysis",
  "Mindset drills we ran before each match",
  "Tips to keep morale high when results aren't going your way",
];

export const SHARED_POSTS: (Omit<FeedPost, "mine" | "replies" | "reactions" | "author"> & { personId: string })[] = [
  {
    id: "seed-regionals",
    personId: "devon",
    title: "How I prepped my team for a top 4 finish at regionals",
    body: `After weeks of scrims, VOD reviews and one-on-one sessions, we landed a top 4 spot in the regional Vantage Strike circuit. In this post, I'm sharing:\n\n${POST_LIST.map((item) => `- ${item}`).join("\n")}\n\nIf you're a coach, or want to become one, drop your questions below. Happy to share what worked and what didn't.`,
    createdAt: Date.UTC(2026, 9, 28),
  },
  {
    id: "seed-first-contract",
    personId: "nadia",
    title: "Read this before you sign your first contract",
    body: "I've reviewed hundreds of player contracts. Three clauses cause most of the regret:\n\n- Buyouts that make it impossible to leave\n- Prize splits that aren't written down\n- Content rights that outlive the contract\n\nAsk about all three. A good team won't mind the questions.",
    createdAt: Date.UTC(2026, 9, 25),
  },
  {
    id: "seed-tilt",
    personId: "tomas",
    title: "Tilt is a training problem",
    body: "Players treat tilt like weather: something that just happens. It isn't. You can practice recovering from a bad round the same way you practice aim.\n\nTry this tonight: after each loss, write one sentence about what you controlled. That's the whole drill.",
    createdAt: Date.UTC(2026, 9, 21),
  },
];

/** Greetings and fallbacks, used when a message arrives without AI or the model is unavailable. */
export const FALLBACK_REPLIES = [
  "Thanks for the message! I'm away from my desk, but I've noted this and I'll follow up soon.",
  "Good question. Let me check with the staff and come back to you with a proper answer.",
  "Appreciate you reaching out. Send me your availability this week and we'll take it from there.",
];

export function recruiterFor(listing: Listing): Person {
  const byTeam: Record<string, string> = {
    "ember-foxes": "mara",
    stormhowl: "nadia",
    "jade-vanguard": "devon",
    frostline: "yuki",
    "dune-raiders": "rafa",
    voidlight: "priya",
  };
  return PEOPLE.find((person) => person.id === byTeam[listing.teamId]) as Person;
}

/**
 * Cleans up a model's chat message. Messages show as plain text, so Markdown would appear as
 * literal asterisks, and GLM sometimes drops the final mark of a Spanish "¡...!".
 */
export function tidyReply(reply: string): string {
  const clean = reply.replace(/\*\*|__/g, "").trim();
  const closes = (opening: string, closing: string) => clean.lastIndexOf(opening) > clean.lastIndexOf(closing);
  if (closes("¡", "!")) return `${clean}!`;
  if (closes("¿", "?")) return `${clean}?`;
  return clean;
}

export const personAvatar = (id: string) => `/images/people/${id}.webp`;

/** Share of a listing's skills that a player has, from 0 to 100. */
export function matchScore(listingSkills: string[], userSkills: string[]): number {
  if (listingSkills.length === 0) return 0;
  const owned = new Set(userSkills.map((skill) => skill.toLowerCase()));
  const hits = listingSkills.filter((skill) => owned.has(skill.toLowerCase())).length;
  return Math.round((hits / listingSkills.length) * 100);
}
