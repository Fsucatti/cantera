import { describe, expect, it } from "vitest";
import { CATEGORIES, SKILLS } from "../src/shared/types";
import { GAMES, LISTINGS, PEOPLE, SHARED_POSTS, TEAMS, listingDetail, matchScore, recruiterFor, tidyReply } from "./catalog";
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
