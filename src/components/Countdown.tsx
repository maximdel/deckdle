import { useEffect, useState } from "react";
import { msUntilNextPuzzle } from "../game/date";

const pad = (n: number) => String(n).padStart(2, "0");

/** Time left until the next puzzle; calls onRollover when it reaches zero. */
export function Countdown({ onRollover }: { onRollover: () => void }) {
  const [ms, setMs] = useState(() => msUntilNextPuzzle(new Date()));

  useEffect(() => {
    const id = setInterval(() => {
      const left = msUntilNextPuzzle(new Date());
      setMs(left);
      if (left < 1000) onRollover();
    }, 1000);
    return () => clearInterval(id);
  }, [onRollover]);

  const s = Math.floor(ms / 1000);
  return (
    <span className="countdown" aria-label="Time until the next deck">
      {pad(Math.floor(s / 3600))}:{pad(Math.floor((s % 3600) / 60))}:{pad(s % 60)}
    </span>
  );
}
