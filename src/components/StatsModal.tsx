import type { Stats } from "../game/stats";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  stats: Stats;
  streak: number;
  /** Misses in today's won game, to highlight its bar. */
  todayMisses: number | null;
}

export function StatsModal({ open, onClose, stats, streak, todayMisses }: Props) {
  const winPct = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
  const max = Math.max(1, ...stats.distribution);
  return (
    <Modal title="Statistics" open={open} onClose={onClose}>
      <dl className="stat-row">
        {[
          ["Played", stats.played],
          ["Win %", winPct],
          ["Streak", streak],
          ["Best", stats.maxStreak],
        ].map(([label, value]) => (
          <div key={label} className="stat">
            <dd>{value}</dd>
            <dt>{label}</dt>
          </div>
        ))}
      </dl>
      <h3 className="dist-title">Wins by wrong guesses</h3>
      <div className="dist">
        {stats.distribution.map((count, misses) => (
          <div key={misses} className="dist__row">
            <span className="dist__label">{misses}</span>
            <span
              className={`dist__bar${todayMisses === misses ? " is-today" : ""}`}
              style={{ width: `${Math.max(8, (count / max) * 100)}%` }}
            >
              {count}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
