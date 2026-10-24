// Puzzle days roll over at midnight in Brussels time, for everyone.
export const TIME_ZONE = "Europe/Brussels";
/** Puzzle #1 is played on this date. */
export const EPOCH = "2026-10-24";

const DAY_MS = 86_400_000;

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function wallClock(now: Date, timeZone: string): WallClock {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), second: get("second") };
}

/** The calendar date ("YYYY-MM-DD") in the puzzle time zone. */
export function dateKey(now: Date, timeZone = TIME_ZONE): string {
  const { year, month, day } = wallClock(now, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Puzzle number for a date key: EPOCH is #1. */
export function dayNumber(key: string): number {
  const toUtc = (k: string) => {
    const [y, m, d] = k.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(key) - toUtc(EPOCH)) / DAY_MS) + 1;
}

/** Offset of the time zone from UTC at a moment, in ms (Brussels: +1h or +2h). */
function zoneOffset(at: Date, timeZone: string): number {
  const w = wallClock(at, timeZone);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** Milliseconds until the next puzzle (next midnight in the time zone). */
export function msUntilNextPuzzle(now: Date, timeZone = TIME_ZONE): number {
  const w = wallClock(now, timeZone);
  const nextMidnightWall = Date.UTC(w.year, w.month - 1, w.day + 1);
  // Use the offset that applies at the next midnight, so DST switch days are right.
  const guess = new Date(nextMidnightWall - zoneOffset(now, timeZone));
  const next = nextMidnightWall - zoneOffset(guess, timeZone);
  return Math.max(0, next - now.getTime());
}
