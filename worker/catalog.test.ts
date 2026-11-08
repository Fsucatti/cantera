import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CATEGORIES, LINKED_ACCOUNTS, SKILLS, THUMBNAILS } from "../src/shared/types";
import { GAMES, LISTINGS, PEOPLE, SHARED_POSTS, TEAMS, listingDetail, matchScore, recruiterFor, teamContact, tidyReply, worldBriefFor } from "./catalog";
import { hashProof, isPasswordProof, safeEqual } from "./security";

describe("job matching", () => {
  it("scores the share of a listing's skills a player has", () => {
    expect(matchScore(["A", "B", "C", "D"], ["a", "C"])).toBe(50);
    expect(matchScore(["A"], [])).toBe(0);
    expect(matchScore([], ["A"])).toBe(0);
    expect(matchScore(["A", "B"], ["A", "B", "Z"])).toBe(100);
  });
});

describe("cleaning model replies", () => {
  it("removes Markdown emphasis", () => {
    expect(tidyReply("Track **key events** daily.")).toBe("Track key events daily.");
  });

  it("closes a Spanish exclamation or question left open", () => {
    expect(tidyReply("Practicá los ganks. ¡Suerte")).toBe("Practicá los ganks. ¡Suerte!");
    expect(tidyReply("¿Cuándo jugás")).toBe("¿Cuándo jugás?");
  });

  it("leaves complete sentences alone", () => {
    expect(tidyReply("¡Hola! Todo bien.")).toBe("¡Hola! Todo bien.");
    expect(tidyReply("You've got this!")).toBe("You've got this!");
    expect(tidyReply("  ¿Listo?  ")).toBe("¿Listo?");
  });
});

describe("the catalog", () => {
  it("has a listing for every filter except games", () => {
    for (const category of CATEGORIES.filter((value) => value !== "game")) {
      expect(LISTINGS.some((listing) => listing.category === category), category).toBe(true);
    }
  });

  it("only refers to teams, games and skills that exist", () => {
    const teams = new Set(TEAMS.map((team) => team.id));
    const games = new Set(GAMES.map((game) => game.id));
    const skills = new Set<string>(SKILLS);
    for (const listing of LISTINGS) {
      expect(teams.has(listing.teamId)).toBe(true);
      expect(games.has(listing.gameId)).toBe(true);
      expect(listing.skills.every((skill) => skills.has(skill)), listing.id).toBe(true);
      expect(listing.payMax).toBeGreaterThanOrEqual(listing.payMin);
      expect(listingDetail(listing.id)?.description.length).toBeGreaterThan(0);
      expect(recruiterFor(listing)).toBeDefined();
    }
    for (const post of SHARED_POSTS) expect(PEOPLE.some((person) => person.id === post.personId)).toBe(true);
    expect(new Set(LISTINGS.map((listing) => listing.id)).size).toBe(LISTINGS.length);
  });

  it("doesn't mention the real people, teams or games from the source design", () => {
    const forbidden = /\b(ibai|shroud|pokimane|faker|skt|t1|astralis|g2|geng|liquid|isurus|100 thieves|riot|valorant|league of legends|dota|counter-strike|digital bridge)\b/i;
    expect(JSON.stringify({ GAMES, TEAMS, PEOPLE, LISTINGS, SHARED_POSTS })).not.toMatch(forbidden);
    for (const person of PEOPLE) expect(worldBriefFor(person)).not.toMatch(forbidden);
  });

  it("tells each AI character about their own team and game", () => {
    const devon = worldBriefFor(PEOPLE.find((person) => person.id === "devon") as (typeof PEOPLE)[number]);
    expect(devon).toContain("Your team, B2:");
    expect(devon).toContain("Silent retake:");
    expect(devon).not.toContain("Wet pull:");
    const unattached = worldBriefFor({ id: "x", name: "X", role: "Freelancer", headline: "", bio: "" });
    expect(unattached).toContain("Railhead");
    expect(unattached).not.toContain("Your team");
  });

  it("has every picture and logo it refers to", () => {
    const image = (path: string) => new URL(`../public/images/${path}`, import.meta.url);
    for (const game of GAMES) {
      expect(existsSync(image(`banners/${game.banner}.webp`)), game.banner).toBe(true);
      expect(existsSync(image(`games/${game.id}.svg`)), game.id).toBe(true);
    }
    for (const team of TEAMS) {
      expect(existsSync(image(`banners/${team.banner}.webp`)), team.banner).toBe(true);
      expect(existsSync(image(`teams/${team.id}.svg`)), team.id).toBe(true);
    }
    for (const listing of LISTINGS) expect(existsSync(image(`banners/${listing.banner}.webp`)), listing.banner).toBe(true);
    for (const name of THUMBNAILS) expect(existsSync(image(`highlights/${name}.webp`)), name).toBe(true);
  });

  it("connects teams, games and people", () => {
    const games = new Set(GAMES.map((game) => game.id));
    for (const team of TEAMS) {
      expect(team.gameIds.length).toBeGreaterThan(0);
      expect(team.gameIds.every((id) => games.has(id)), team.id).toBe(true);
      expect(GAMES.find((game) => game.id === team.gameIds[0])?.name).toBe(team.gameName);
      expect(team.roster.length, team.id).toBeGreaterThan(0);
      expect(teamContact(team.id), team.id).toBeDefined();
    }
    for (const game of GAMES) {
      expect(LISTINGS.some((listing) => listing.gameId === game.id), game.id).toBe(true);
      expect(TEAMS.some((team) => team.gameIds.includes(game.id)), game.id).toBe(true);
      expect(LINKED_ACCOUNTS.some((account) => account.key === game.id), game.id).toBe(true);
    }
  });

  it("names roster roles that exist in the team's main game", () => {
    for (const team of TEAMS.filter((candidate) => candidate.id !== "second-monitor")) {
      const roles = new Set(GAMES.find((game) => game.id === team.gameIds[0])?.roles.map((role) => role.name));
      for (const player of team.roster) expect(roles.has(player.role), `${team.id}: ${player.role}`).toBe(true);
    }
  });

  it("never dates a team before its main game came out", () => {
    for (const team of TEAMS) {
      const game = GAMES.find((candidate) => candidate.id === team.gameIds[0]) as (typeof GAMES)[number];
      expect(Number(team.founded), team.id).toBeGreaterThanOrEqual(Number(game.released));
    }
  });

  it("returns nothing for an unknown listing", () => {
    expect(listingDetail("nope")).toBeNull();
  });
});

describe("password handling", () => {
  it("only accepts a proof that looks like a PBKDF2 result", () => {
    expect(isPasswordProof("a".repeat(64))).toBe(true);
    expect(isPasswordProof("a".repeat(63))).toBe(false);
    expect(isPasswordProof("Z".repeat(64))).toBe(false);
    expect(isPasswordProof(undefined)).toBe(false);
  });

  it("gives the same password different hashes under different salts", async () => {
    const proof = "a".repeat(64);
    expect(await hashProof("one", proof)).toBe(await hashProof("one", proof));
    expect(await hashProof("one", proof)).not.toBe(await hashProof("two", proof));
  });

  it("compares safely", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
