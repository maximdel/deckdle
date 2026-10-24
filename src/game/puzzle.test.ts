import { describe, expect, it } from "vitest";
import { DECKS } from "../data/decks";
import { CARD_BY_KEY } from "./cards";
import { dateKey, dayNumber, msUntilNextPuzzle } from "./date";
import { getPuzzle, HIDDEN_COUNT } from "./puzzle";

describe("deck data", () => {
  it.each(DECKS.map((d) => [d.id, d] as const))("%s has 8 unique, known cards", (_, deck) => {
    expect(deck.cards).toHaveLength(8);
    expect(new Set(deck.cards).size).toBe(8);
    for (const key of deck.cards) expect(CARD_BY_KEY.has(key), key).toBe(true);
  });

  it("has unique deck ids", () => {
    expect(new Set(DECKS.map((d) => d.id)).size).toBe(DECKS.length);
  });
});

describe("dateKey / dayNumber", () => {
  it("uses Brussels time, not UTC", () => {
    // 23:30 UTC on 24 Oct 2026 is already 25 Oct in Brussels (UTC+2 in summer time).
    expect(dateKey(new Date("2026-10-24T23:30:00Z"))).toBe("2026-10-25");
    expect(dateKey(new Date("2026-10-24T21:59:59Z"))).toBe("2026-10-24");
    // In winter Brussels is UTC+1.
    expect(dateKey(new Date("2026-12-31T22:59:59Z"))).toBe("2026-12-31");
    expect(dateKey(new Date("2026-12-31T23:00:00Z"))).toBe("2027-01-01");
  });

  it("numbers puzzles from the launch day", () => {
    expect(dayNumber("2026-10-24")).toBe(1);
    expect(dayNumber("2026-10-25")).toBe(2);
    expect(dayNumber("2027-10-24")).toBe(366);
  });

  it("counts down to Brussels midnight, including on a DST switch day", () => {
    // 10:00 Brussels (UTC+2) -> 14 hours left.
    expect(msUntilNextPuzzle(new Date("2026-10-24T08:00:00Z"))).toBe(14 * 3_600_000);
    // 25 Oct 2026 clocks go back at 03:00, so that day has 25 hours.
    // 00:00 Brussels on 25 Oct = 22:00 UTC on 24 Oct; next midnight = 23:00 UTC on 25 Oct.
    expect(msUntilNextPuzzle(new Date("2026-10-24T22:00:00Z"))).toBe(25 * 3_600_000);
  });
});

describe("getPuzzle", () => {
  it("is the same for the same day", () => {
    expect(getPuzzle(42)).toEqual(getPuzzle(42));
  });

  it("hides the right number of distinct, sorted positions", () => {
    for (let n = 1; n <= 200; n++) {
      const p = getPuzzle(n);
      expect(p.hidden).toHaveLength(HIDDEN_COUNT);
      expect(new Set(p.hidden).size).toBe(HIDDEN_COUNT);
      expect([...p.hidden].sort((a, b) => a - b)).toEqual(p.hidden);
      expect(p.hidden.every((i) => i >= 0 && i < 8)).toBe(true);
      expect([...p.cards].sort()).toEqual([...p.deck.cards].sort());
    }
  });

  it("plays every deck once before any repeats", () => {
    for (let cycle = 0; cycle < 5; cycle++) {
      const start = cycle * DECKS.length + 1;
      const ids = Array.from({ length: DECKS.length }, (_, i) => getPuzzle(start + i).deck.id);
      expect(new Set(ids).size).toBe(DECKS.length);
    }
  });

  it("never repeats a deck on consecutive days", () => {
    for (let n = 1; n < DECKS.length * 20; n++) {
      expect(getPuzzle(n).deck.id).not.toBe(getPuzzle(n + 1).deck.id);
    }
  });
});
