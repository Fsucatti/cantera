import { expect, test, type BrowserContext, type Page } from "@playwright/test";

/** Sign-ups are limited per address. Locally the header below acts as the address, so tests don't share a limit. */
const asNewVisitor = (context: BrowserContext) =>
  context.setExtraHTTPHeaders({ "cf-connecting-ip": `test-${Math.random().toString(36).slice(2)}` });

async function asGuest(page: Page) {
  await asNewVisitor(page.context());
  await page.goto("/");
  await page.getByRole("button", { name: "Try it as a guest" }).click();
  await expect(page.getByRole("heading", { name: "Hi Again, Alex!" })).toBeVisible();
}

const uniqueEmail = () => `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

test.beforeEach(async ({ page, context }) => {
  await asNewVisitor(context);
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    // A failed login or a rejected request logs a network error, which those tests expect.
    if (message.type() === "error" && !/status of (401|403|404|409)/.test(message.text())) problems.push(message.text());
  });
  (page as Page & { problems?: string[] }).problems = problems;
});

test.afterEach(async ({ page }) => {
  expect((page as Page & { problems?: string[] }).problems).toEqual([]);
});

test("a visitor can sign up, log out, and log back in", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Sam Player");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("short");
  await page.getByRole("button", { name: "Sign Up" }).click();
  await expect(page.getByRole("alert")).toContainText("at least 8");

  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign Up" }).click();
  await expect(page.getByRole("heading", { name: "Hi Again, Sam!" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Hi Again, Sam!" })).toBeVisible();

  await page.goto("/settings/account");
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByRole("heading", { name: "Log In" })).toBeVisible();

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrong password");
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page.getByRole("alert")).toContainText("don't match");

  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page.getByRole("heading", { name: "Hi Again, Sam!" })).toBeVisible();
});

test("the same email can't sign up twice", async ({ page }) => {
  const email = uniqueEmail();
  for (const attempt of [1, 2]) {
    await page.goto("/signup");
    await page.getByLabel("Name").fill("Sam");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("correct horse battery");
    await page.getByRole("button", { name: "Sign Up" }).click();
    if (attempt === 1) {
      await expect(page.getByRole("heading", { name: "Hi Again, Sam!" })).toBeVisible();
      await page.goto("/settings/account");
      await page.getByRole("button", { name: "Log out" }).click();
      await expect(page.getByRole("heading", { name: "Log In" })).toBeVisible();
    }
  }
  await expect(page.getByRole("alert")).toContainText("already has an account");
});

test("sign-ups are limited per address", async ({ context }) => {
  const statuses: number[] = [];
  for (let attempt = 0; attempt < 14; attempt++) {
    statuses.push((await context.request.post("/api/auth/guest")).status());
  }
  expect(statuses[0]).toBe(201);
  expect(statuses.at(-1)).toBe(429);
});

test("signed-out visitors can't reach private data", async ({ request }) => {
  for (const path of ["/api/me", "/api/home", "/api/feed", "/api/conversations", "/api/listings"]) {
    expect((await request.get(path)).status(), path).toBe(401);
  }
});

test("a guest sees a full home screen with real images", async ({ page }) => {
  await asGuest(page);
  await expect(page.locator(".job-card")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "Level up your career" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Devon Achebe" })).toBeVisible();

  const broken = await page.evaluate(async () => {
    await Promise.all([...document.images].map((image) => (image.complete ? null : new Promise((done) => { image.onload = image.onerror = done; }))));
    const banners = [...document.querySelectorAll<HTMLElement>(".job-banner")].map((el) => el.style.backgroundImage.slice(5, -2));
    const results = await Promise.all(banners.map(async (url) => (await fetch(url)).ok));
    return { images: [...document.images].filter((image) => image.naturalWidth === 0).map((image) => image.src), banners: results.filter((ok) => !ok).length };
  });
  expect(broken).toEqual({ images: [], banners: 0 });
});

test("the jobs board filters, searches and saves", async ({ page }) => {
  await asGuest(page);
  await page.getByRole("link", { name: "Jobs" }).click();
  await expect(page.getByRole("heading", { name: "Jobs Board" })).toBeVisible();
  await expect(page.locator(".job-card").nth(10)).toBeVisible();
  const all = await page.locator(".job-card").count();

  await page.getByRole("button", { name: "Events" }).click();
  await expect(page.locator(".job-card")).toHaveCount(2);

  await page.getByRole("button", { name: "Games" }).click();
  await expect(page.locator(".game-card")).toHaveCount(4);

  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByLabel("Search listings").fill("Railhead");
  await page.getByLabel("Search listings").press("Enter");
  await expect(page.getByRole("heading", { name: 'Results for "Railhead"' })).toBeVisible();
  await expect(page.locator(".job-card")).toHaveCount(2);
  await expect(page.locator(".job-card", { hasText: "Pro Player | Railhead" })).toBeVisible();

  await page.getByLabel("Search listings").fill("zzzz");
  await page.getByLabel("Search listings").press("Enter");
  await expect(page.getByText("Nothing matches that search.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".job-card")).toHaveCount(all);

  await page.getByRole("button", { name: /^Save Entry Fragger/ }).click();
  await expect(page.getByRole("status")).toContainText("Saved");
  await page.getByRole("button", { name: "Saved", exact: true }).click();
  await expect(page.locator(".job-card")).toHaveCount(1);
});

test("applying opens a recruiter conversation, and can be withdrawn", async ({ page }) => {
  await asGuest(page);
  await page.goto("/jobs/entry-fragger");
  await expect(page.getByRole("heading", { name: "Entry Fragger, Deadband" })).toBeVisible();
  await page.getByRole("button", { name: "Apply for this position" }).click();
  await page.getByLabel(/good fit/).fill("I have a great entry record.");
  await page.getByRole("button", { name: "Send application" }).click();

  await expect(page).toHaveURL(/\/inbox\/devon/);
  await expect(page.getByLabel("Conversation with Devon Achebe")).toContainText("Entry Fragger, Deadband");

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Review Entry Fragger, Deadband" })).toBeVisible();

  await page.goto("/jobs/entry-fragger");
  await page.getByRole("button", { name: "Withdraw application" }).click();
  await expect(page.getByRole("button", { name: "Apply for this position" })).toBeVisible();
});

test("skills change job matches", async ({ page }) => {
  await asGuest(page);
  await page.goto("/settings/profile");
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Video Editing" }).click();
  await page.getByRole("button", { name: "Content Creation" }).click();
  await page.getByRole("button", { name: "Save skills" }).click();
  await expect(page.getByLabel("Your skills")).toContainText("Video Editing");

  await page.goto("/jobs/clip-editor");
  await expect(page.locator(".detail-sub")).toContainText("100% skill match");
});

test("posts stay private and get an answer; AI failures fall back gracefully", async ({ page, browser }) => {
  await asGuest(page);
  const text = `How do I find a team? ${Date.now()}`;
  await page.getByLabel("Write a post").fill(text);
  await page.getByRole("button", { name: "Post", exact: true }).first().click();
  const mine = page.locator(".post", { hasText: text });
  await expect(mine).toContainText("Visible only to you", { timeout: 30_000 });
  await expect(mine.locator(".reply")).toContainText("Devon Achebe", { timeout: 30_000 });

  const other = await browser.newContext({ baseURL: "http://localhost:8789" });
  const otherPage = await other.newPage();
  await asGuest(otherPage);
  await expect(otherPage.getByText(text)).toHaveCount(0);
  await other.close();

  await mine.getByRole("button", { name: "Delete post" }).click();
  await expect(page.getByText(text)).toHaveCount(0);
});

test("reactions and replies on shared posts persist", async ({ page }) => {
  await asGuest(page);
  const post = page.locator(".post", { hasText: "Read this before you sign" });
  await post.getByRole("button", { name: "Give a trophy" }).click();
  await expect(post.getByRole("button", { name: "Give a trophy" })).toHaveAttribute("aria-pressed", "true");
  await post.getByLabel("Reply to Nadia Farouk").fill("Great advice, thanks!");
  await post.getByRole("button", { name: "Post", exact: true }).click();
  await expect(post.locator(".reply")).toContainText("Great advice, thanks!");
  await page.reload();
  await expect(page.locator(".post", { hasText: "Read this before you sign" }).locator(".reply")).toContainText("Great advice");
});

test("the inbox shows the seeded thread, sends messages and clears unread", async ({ page }) => {
  await asGuest(page);
  await expect(page.getByRole("button", { name: /Notifications, 1 new/ })).toBeVisible();
  await page.getByRole("link", { name: "Inbox" }).click();
  await expect(page.getByText("1", { exact: true })).toBeVisible();
  await page.locator(".inbox-item", { hasText: "Mara Quinn" }).click();
  await expect(page.locator(".thread")).toContainText("Anchor guide");
  await expect(page.locator(".unread")).toHaveCount(0);

  await page.getByLabel("Message").fill("I'm free on Thursday.");
  await page.getByRole("button", { name: "Post" }).click();
  await expect(page.locator(".thread .message")).toHaveCount(3, { timeout: 30_000 });

  await page.getByRole("button", { name: "+ New Conversation" }).click();
  await page.getByRole("button", { name: /Tomas Lind/ }).click();
  await expect(page).toHaveURL(/\/inbox\/tomas/);
  await expect(page.getByText("Say hello to Tomas.")).toBeVisible();
});

test("search finds games, jobs, teams and people, and navigates", async ({ page }) => {
  await asGuest(page);
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("heading", { name: "Top Games" })).toBeVisible();
  await page.getByLabel("Search team, tag or player").fill("kaamos");
  await expect(page.getByRole("button", { name: /Kaamos, Rovaniemi/ })).toBeVisible();
  await page.getByRole("button", { name: /Kaamos, Rovaniemi/ }).click();
  await expect(page).toHaveURL(/\/teams\/kaamos/);
  await expect(page.getByRole("heading", { name: "About Kaamos" })).toBeVisible();

  await page.getByRole("button", { name: "Follow Kaamos" }).click();
  await expect(page.getByRole("button", { name: "Unfollow Kaamos" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Unfollow Kaamos" })).toBeVisible();

  await page.getByRole("button", { name: "Search" }).click();
  await page.getByLabel("Search team, tag or player").fill("hfx");
  await expect(page.getByRole("button", { name: /Halifax Undertow, Halifax/ })).toBeVisible();
  await page.getByLabel("Search team, tag or player").fill("real-time");
  await page.locator(".search-row", { hasText: "Railhead" }).click();
  await expect(page).toHaveURL(/\/games\/railhead/);
});

test("game and team pages show their detail and link to each other", async ({ page }) => {
  await asGuest(page);
  await page.goto("/jobs?category=game");
  await page.getByRole("link", { name: /Deadband/ }).click();
  await expect(page).toHaveURL(/\/games\/deadband/);
  await expect(page.getByRole("heading", { name: "Deadband" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The competitive circuit" })).toBeVisible();
  await expect(page.getByText("Silent retake", { exact: true })).toBeVisible();
  await expect(page.getByText("Ninth Relay")).toBeVisible();
  await expect(page.locator(".job-card").first()).toBeVisible();

  await page.getByRole("link", { name: "B2", exact: true }).click();
  await expect(page).toHaveURL(/\/teams\/b2/);
  await expect(page.getByRole("heading", { name: "Deadband roster" })).toBeVisible();
  await expect(page.getByText("Banjang")).toBeVisible();
  await expect(page.locator(".honor-win").first()).toContainText("Champions");

  const broken = await page.evaluate(async () => {
    await Promise.all([...document.images].map((image) => (image.complete ? null : new Promise((done) => { image.onload = image.onerror = done; }))));
    return [...document.images].filter((image) => image.naturalWidth === 0).map((image) => image.src);
  });
  expect(broken).toEqual([]);

  await page.getByRole("link", { name: "Message Devon Achebe" }).click();
  await expect(page).toHaveURL(/\/inbox\/devon/);

  await page.goto("/games/nope");
  await expect(page.getByRole("alert")).toContainText("doesn't exist");
});

test("the profile saves, including an uploaded picture", async ({ page }) => {
  await asGuest(page);
  await page.goto("/settings/profile");
  await page.getByLabel("Display Name").fill("Alexa Stone");
  await page.getByLabel("Country of Residence").fill("Chile");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText("Profile saved");

  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
  await page.getByLabel("Upload background").setInputFiles({ name: "bg.png", mimeType: "image/png", buffer: png });
  await expect(page.getByAltText("Current background")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Display Name")).toHaveValue("Alexa Stone");
  await expect(page.getByAltText("Current background")).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hi Again, Alexa!" })).toBeVisible();
});

test("work history, awards, highlights and linked accounts can be added and removed", async ({ page }) => {
  await asGuest(page);

  await page.goto("/settings/work");
  await expect(page.locator(".work-list li")).toHaveCount(3);
  await page.getByRole("button", { name: "+ Add New Experience" }).click();
  await page.getByLabel("Team", { exact: true }).fill("Kaamos");
  await page.getByLabel("Period").fill("2020 - 2021");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.locator(".work-list li")).toHaveCount(4);
  await page.getByRole("button", { name: "Remove Kaamos" }).click();
  await expect(page.locator(".work-list li")).toHaveCount(3);

  await page.goto("/settings/awards");
  await page.getByRole("button", { name: "+ Add New Award" }).click();
  await page.getByLabel("Title").fill("Spring Cup");
  await page.getByLabel("Medal").selectOption("bronze");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.locator(".award", { hasText: "Spring Cup" }).locator(".medal-bronze")).toBeVisible();

  await page.goto("/settings/highlights");
  await expect(page.locator(".highlight")).toHaveCount(4);
  await page.getByRole("button", { name: "+ Add New Highlight" }).click();
  await page.getByLabel("Title").fill("Ace round");
  await page.getByLabel("Thumbnail").selectOption("beached");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.locator(".highlight", { hasText: "Ace round" })).toBeVisible();

  await page.goto("/settings/linked");
  await page.getByRole("button", { name: "Connect to Instagram" }).click();
  await page.getByLabel("Username").fill("alex.plays");
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByText("alex.plays")).toBeVisible();
  await page.getByRole("button", { name: "Unlink Instagram" }).click();
  await expect(page.getByRole("button", { name: "Connect to Instagram" })).toBeVisible();
});

test("a password can be changed, and an account deleted", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/signup");
  await page.getByLabel("Name").fill("Del");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("first password");
  await page.getByRole("button", { name: "Sign Up" }).click();
  await expect(page.getByRole("heading", { name: "Hi Again, Del!" })).toBeVisible();

  await page.goto("/settings/account");
  await page.getByLabel("Current password").fill("wrong one here");
  await page.getByLabel("New password").fill("second password");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByRole("alert")).toContainText("incorrect");
  await page.getByLabel("Current password").fill("first password");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByRole("status")).toContainText("Password changed");

  await page.getByRole("button", { name: "Delete account" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete account" }).click();
  await expect(page.getByRole("heading", { name: "Log In" })).toBeVisible();

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("second password");
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page.getByRole("alert")).toContainText("don't match");
});

test("one user can't touch another user's data", async ({ browser, baseURL }) => {
  const one = await browser.newContext({ baseURL });
  const two = await browser.newContext({ baseURL });
  const pageOne = await one.newPage();
  const pageTwo = await two.newPage();
  await asGuest(pageOne);
  await asGuest(pageTwo);

  const sections = await (await one.request.get("/api/profile/sections")).json();
  const workId = sections.work[0].id;
  expect((await two.request.delete(`/api/profile/work/${workId}`)).status()).toBe(404);
  expect((await (await one.request.get("/api/profile/sections")).json()).work).toHaveLength(3);

  const created = await (await one.request.post("/api/posts", { data: { body: "secret" } })).json();
  expect((await two.request.post(`/api/posts/${created.id}/replies`, { data: { body: "hi" } })).status()).toBe(404);
  expect((await two.request.delete(`/api/posts/${created.id}`)).status()).toBe(404);
  await one.close();
  await two.close();
});

test("the API rejects bad input", async ({ page, context }) => {
  await asGuest(page);
  const { request } = context;
  expect((await request.post("/api/posts", { data: { body: "  " } })).status()).toBe(400);
  expect((await request.post("/api/posts", { data: { body: "x".repeat(3000) } })).status()).toBe(400);
  expect((await request.patch("/api/me", { data: { name: "" } })).status()).toBe(400);
  expect((await request.patch("/api/me", { data: { avatar: "javascript:alert(1)" } })).status()).toBe(400);
  expect((await request.patch("/api/me", { data: { avatar: "https://evil.example/x.png" } })).status()).toBe(400);
  expect((await request.post("/api/listings/nope/apply", { data: {} })).status()).toBe(404);
  expect((await request.post("/api/posts", { data: { body: "x" }, headers: { origin: "https://example.com" } })).status()).toBe(403);
});

test("user content can't inject HTML", async ({ page }) => {
  await asGuest(page);
  await page.route("**/api/posts", (route) => route.fallback());
  await page.goto("/settings/profile");
  await page.getByLabel("Display Name").fill('<img src=x onerror="window.pwned=1">');
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText("Profile saved");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Hi Again/ })).toContainText("<img");
  expect(await page.evaluate(() => (window as Window & { pwned?: number }).pwned)).toBeUndefined();
});

test("security headers and session cookie are set", async ({ request, page, context }) => {
  const response = await request.get("/");
  expect(response.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  await asGuest(page);
  const cookie = (await context.cookies()).find((item) => item.name === "cantera_session");
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Lax");
});

test("unknown pages show a way back", async ({ page }) => {
  await asGuest(page);
  await page.goto("/nope");
  await expect(page.getByRole("heading", { name: "This page doesn't exist" })).toBeVisible();
  await page.goto("/jobs/nope");
  await expect(page.getByRole("alert")).toContainText("doesn't exist");
});

test("@mobile the app works on a phone with no sideways scroll", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try it as a guest" }).click();
  await expect(page.getByRole("heading", { name: "Hi Again, Alex!" })).toBeVisible();

  for (const path of ["/", "/jobs", "/jobs?category=game", "/jobs/entry-fragger", "/games/deadband", "/games/curfew", "/teams", "/teams/atletico-latencia", "/teams/b2", "/people", "/inbox", "/inbox/mara", "/settings/profile", "/settings/awards", "/settings/highlights", "/settings/work", "/settings/linked"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }

  await page.goto("/inbox/mara");
  await expect(page.getByRole("link", { name: "Back to conversations" })).toBeVisible();
  await page.getByRole("button", { name: /Notifications/ }).click();
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
});

test("@mobile phones get a top bar and five evenly spaced, labeled tabs", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try it as a guest" }).click();
  await expect(page.getByRole("heading", { name: "Hi Again, Alex!" })).toBeVisible();

  const layout = await page.evaluate(() => {
    const box = (element: Element) => element.getBoundingClientRect();
    const tabs = [...document.querySelectorAll(".nav-tabs .nav-item")].map((tab) => ({ left: box(tab).left, right: box(tab).right, bottom: box(tab).bottom, label: tab.textContent }));
    const top = ["Cantera home", "Search", "Your profile and settings"].map((name) => box(document.querySelector(`[aria-label="${name}"]`) as Element).bottom);
    return { tabs, top, width: innerWidth, height: innerHeight };
  });
  expect(layout.tabs.map((tab) => tab.label)).toEqual(["Home", "Jobs", "Teams", "People", "Inbox"]);
  const widths = layout.tabs.map((tab) => tab.right - tab.left);
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
  expect(layout.tabs[0].left).toBe(0);
  expect(layout.tabs[4].right).toBeCloseTo(layout.width, 0);
  expect(layout.tabs[0].bottom).toBeCloseTo(layout.height, 0);
  for (const bottom of layout.top) expect(bottom).toBeLessThan(60);

  // Both bars stay put while the page scrolls, and the last thing on the page can still be reached.
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.getByRole("button", { name: "Search" })).toBeInViewport();
  await expect(page.getByRole("link", { name: "Inbox" })).toBeInViewport();
  const clearance = await page.evaluate(() => {
    const tabs = (document.querySelector(".nav-tabs") as Element).getBoundingClientRect();
    return tabs.top - (document.querySelector(".credit") as Element).getBoundingClientRect().bottom;
  });
  expect(clearance).toBeGreaterThanOrEqual(0);

  await page.getByRole("link", { name: "Inbox" }).click();
  await expect(page).toHaveURL(/\/inbox/);
  await expect(page.getByRole("link", { name: "Inbox" })).toHaveClass(/active/);
});
