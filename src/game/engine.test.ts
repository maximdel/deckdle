import { describe, expect, it } from "vitest";
import type { Puzzle } from "./puzzle";
import { averageElixir, deriveState, evaluateGuess, MAX_MISSES, shareText } from "./engine";
import { searchCards, type Card } from "./cards";
import { emptyStats, liveStreak, recordResult } from "./stats";

const puzzle: Puzzle = {
  number: 7,
  deck: { id: "hog-26", name: "Hog 2.6 Cycle", cards: [] },
  cards: ["hog-rider", "musketeer", "cannon", "ice-golem", "ice-spirit", "skeletons", "fireball", "the-log"],
  hidden: [0, 2, 5, 7], // hog-rider, cannon, skeletons, the-log
};

describe("evaluateGuess", () => {
  it("reports a hit with its slot", () => {
    expect(evaluateGuess(puzzle, [], "cannon")).toEqual({ kind: "hit", slot: 2 });
  });

  it("reports a miss for a card not in the deck", () => {
    expect(evaluateGuess(puzzle, [], "golem")).toEqual({ kind: "miss" });
  });

  it("rejects cards that are already visible", () => {
    expect(evaluateGuess(puzzle, [], "musketeer")).toEqual({ kind: "invalid", reason: "visible" });
  });

  it("rejects repeated guesses", () => {
    expect(evaluateGuess(puzzle, ["golem"], "golem")).toEqual({ kind: "invalid", reason: "repeat" });
    expect(evaluateGuess(puzzle, ["cannon"], "cannon")).toEqual({ kind: "invalid", reason: "repeat" });
  });

  it("rejects guesses once the game is over", () => {
    const won = ["hog-rider", "cannon", "skeletons", "the-log"];
    expect(evaluateGuess(puzzle, won, "golem")).toEqual({ kind: "invalid", reason: "over" });
  });
});

describe("deriveState", () => {
  it("starts playing with no hints", () => {
    const s = deriveState(puzzle, []);
    expect(s.status).toBe("playing");
    expect(s.misses).toBe(0);
    expect(s.hints.size).toBe(0);
  });

  it("unlocks hints in order with each miss", () => {
    expect([...deriveState(puzzle, ["golem"]).hints]).toEqual(["elixir"]);
    expect([...deriveState(puzzle, ["golem", "pekka"]).hints]).toEqual(["elixir", "type"]);
    expect([...deriveState(puzzle, ["golem", "pekka", "cannon", "zap", "miner"]).hints]).toEqual([
      "elixir",
      "type",
      "rarity",
      "name",
    ]);
  });

  it("is won when all hidden cards are found, whatever the order", () => {
    const s = deriveState(puzzle, ["the-log", "golem", "skeletons", "hog-rider", "cannon"]);
    expect(s.status).toBe("won");
    expect(s.found).toEqual(new Set([0, 2, 5, 7]));
    expect(s.misses).toBe(1);
  });

  it(`is lost after ${MAX_MISSES} misses`, () => {
    const s = deriveState(puzzle, ["cannon", "golem", "pekka", "zap", "miner", "rage"]);
    expect(s.status).toBe("lost");
    expect(s.found.size).toBe(1);
  });
});

describe("shareText", () => {
  it("shows hits and misses in guess order without naming cards", () => {
    const text = shareText(puzzle, ["cannon", "golem", "hog-rider", "skeletons", "the-log"], "https://x.test");
    expect(text).toBe("Deckdle #7 · 4/4 found, 1 miss\n🟩🟥🟩🟩🟩\nhttps://x.test");
  });

  it("marks a lost game", () => {
    const text = shareText(puzzle, ["cannon", "golem", "pekka", "zap", "miner", "rage"], "u");
    expect(text.split("\n")[0]).toBe("Deckdle #7 · 1/4 found ❌");
  });

  it("says flawless wins have no misses", () => {
    expect(shareText(puzzle, ["cannon", "hog-rider", "skeletons", "the-log"], "u")).toContain("no misses");
  });
});

describe("averageElixir", () => {
  it("rounds to one decimal like the game", () => {
    expect(averageElixir([4, 4, 3, 2, 1, 1, 4, 2])).toBe("2.6");
  });
});

describe("searchCards", () => {
  const cards: Card[] = [
    { key: "pekka", name: "P.E.K.K.A", elixir: 7, type: "Troop", rarity: "Epic" },
    { key: "mini-pekka", name: "Mini P.E.K.K.A", elixir: 4, type: "Troop", rarity: "Rare" },
    { key: "knight", name: "Knight", elixir: 3, type: "Troop", rarity: "Common" },
    { key: "mega-knight", name: "Mega Knight", elixir: 7, type: "Troop", rarity: "Legendary" },
  ];

  it("ignores punctuation and case", () => {
    expect(searchCards("pekka", new Set(), cards).map((c) => c.key)).toEqual(["pekka", "mini-pekka"]);
  });

  it("puts names starting with the query first", () => {
    expect(searchCards("kni", new Set(), cards).map((c) => c.key)).toEqual(["knight", "mega-knight"]);
  });

  it("leaves out excluded cards", () => {
    expect(searchCards("kni", new Set(["knight"]), cards).map((c) => c.key)).toEqual(["mega-knight"]);
  });
});

describe("stats", () => {
  it("builds a streak over consecutive days and resets on a loss", () => {
    let s = emptyStats();
    s = recordResult(s, 1, true, 0);
    s = recordResult(s, 2, true, 2);
    expect(s.currentStreak).toBe(2);
    expect(s.distribution).toEqual([1, 0, 1, 0, 0]);
    s = recordResult(s, 3, false, 5);
    expect(s).toMatchObject({ played: 3, wins: 2, currentStreak: 0, maxStreak: 2 });
  });

  it("restarts the streak after a skipped day", () => {
    let s = recordResult(emptyStats(), 1, true, 0);
    s = recordResult(s, 3, true, 0);
    expect(s.currentStreak).toBe(1);
    expect(liveStreak(s, 3)).toBe(1);
    expect(liveStreak(s, 4)).toBe(1);
    expect(liveStreak(s, 5)).toBe(0);
  });

  it("ignores recording the same puzzle twice", () => {
    const s = recordResult(emptyStats(), 1, true, 0);
    expect(recordResult(s, 1, true, 0)).toBe(s);
  });
});
