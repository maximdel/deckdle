import type { Puzzle } from "./puzzle";

/** The 5th wrong guess ends the game. */
export const MAX_MISSES = 5;

/** What each wrong guess unlocks, in order. */
export const HINTS = ["elixir", "type", "rarity", "name"] as const;
export type Hint = (typeof HINTS)[number];

export type GuessResult =
  | { kind: "hit"; slot: number }
  | { kind: "miss" }
  | { kind: "invalid"; reason: "visible" | "repeat" | "over" };

export type Status = "playing" | "won" | "lost";

export interface GameState {
  /** Hidden positions the player has found. */
  found: Set<number>;
  misses: number;
  status: Status;
  /** Hints unlocked so far. */
  hints: Set<Hint>;
}

export function deriveState(puzzle: Puzzle, guesses: readonly string[]): GameState {
  const found = new Set<number>();
  let misses = 0;
  for (const key of guesses) {
    const slot = puzzle.cards.indexOf(key);
    if (slot !== -1 && puzzle.hidden.includes(slot)) found.add(slot);
    else misses++;
  }
  const status: Status = found.size === puzzle.hidden.length ? "won" : misses >= MAX_MISSES ? "lost" : "playing";
  return { found, misses, status, hints: new Set(HINTS.slice(0, misses)) };
}

/** Checks a guess against the puzzle and the guesses made so far. */
export function evaluateGuess(puzzle: Puzzle, guesses: readonly string[], key: string): GuessResult {
  if (deriveState(puzzle, guesses).status !== "playing") return { kind: "invalid", reason: "over" };
  if (guesses.includes(key)) return { kind: "invalid", reason: "repeat" };
  const slot = puzzle.cards.indexOf(key);
  if (slot === -1) return { kind: "miss" };
  if (!puzzle.hidden.includes(slot)) return { kind: "invalid", reason: "visible" };
  return { kind: "hit", slot };
}

/** Average elixir of the whole deck, like the in-game deck screen. */
export function averageElixir(elixirs: readonly number[]): string {
  return (elixirs.reduce((a, b) => a + b, 0) / elixirs.length).toFixed(1);
}

export function shareText(puzzle: Puzzle, guesses: readonly string[], url: string): string {
  const state = deriveState(puzzle, guesses);
  const row = guesses.map((g) => (puzzle.hidden.includes(puzzle.cards.indexOf(g)) ? "🟩" : "🟥")).join("");
  const total = puzzle.hidden.length;
  const result =
    state.status === "won"
      ? `${total}/${total} found, ${state.misses === 0 ? "no misses" : `${state.misses} miss${state.misses === 1 ? "" : "es"}`}`
      : `${state.found.size}/${total} found ❌`;
  return `Deckdle #${puzzle.number} · ${result}\n${row}\n${url}`;
}
