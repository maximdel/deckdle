import { MAX_MISSES } from "./engine";

export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** Puzzle number of the last finished game. */
  lastPlayed: number | null;
  /** Wins by number of misses: index 0 = flawless. */
  distribution: number[];
}

export const emptyStats = (): Stats => ({
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayed: null,
  distribution: Array(MAX_MISSES).fill(0),
});

/** Adds a finished game. Recording the same puzzle twice changes nothing. */
export function recordResult(stats: Stats, puzzleNumber: number, won: boolean, misses: number): Stats {
  if (stats.lastPlayed !== null && puzzleNumber <= stats.lastPlayed) return stats;
  const continues = stats.lastPlayed === puzzleNumber - 1;
  const currentStreak = won ? (continues ? stats.currentStreak + 1 : 1) : 0;
  const distribution = [...stats.distribution];
  if (won) distribution[Math.min(misses, distribution.length - 1)]++;
  return {
    played: stats.played + 1,
    wins: stats.wins + (won ? 1 : 0),
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    lastPlayed: puzzleNumber,
    distribution,
  };
}

/** Streak shown today: it is broken once a day is skipped. */
export function liveStreak(stats: Stats, today: number): number {
  if (stats.lastPlayed === null || stats.lastPlayed < today - 1) return 0;
  return stats.currentStreak;
}
