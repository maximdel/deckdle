import { emptyStats, type Stats } from "./stats";

// localStorage can throw (private mode, blocked cookies), so every access is guarded.
const PREFIX = "deckdle:v1:";

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Not saved; the game still works for this visit.
  }
}

interface SavedGame {
  puzzle: number;
  guesses: string[];
}

export function loadGuesses(puzzle: number): string[] {
  const saved = read<SavedGame>("game");
  return saved?.puzzle === puzzle && Array.isArray(saved.guesses) ? saved.guesses : [];
}

export const saveGuesses = (puzzle: number, guesses: string[]) => write("game", { puzzle, guesses });

export function loadStats(): Stats {
  return { ...emptyStats(), ...read<Stats>("stats") };
}

export const saveStats = (stats: Stats) => write("stats", stats);

export const hasSeenHelp = () => read<boolean>("seenHelp") === true;
export const markHelpSeen = () => write("seenHelp", true);
