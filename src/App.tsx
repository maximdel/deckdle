import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DeckGrid } from "./components/DeckGrid";
import { GuessInput } from "./components/GuessInput";
import { HelpModal } from "./components/HelpModal";
import { StatsModal } from "./components/StatsModal";
import { Countdown } from "./components/Countdown";
import { ElixirDrop } from "./components/ElixirDrop";
import { cardImage, getCard } from "./game/cards";
import { dateKey, dayNumber } from "./game/date";
import { averageElixir, deriveState, evaluateGuess, MAX_MISSES, shareText } from "./game/engine";
import { getPuzzle } from "./game/puzzle";
import { liveStreak, recordResult } from "./game/stats";
import * as storage from "./game/storage";

// Never below #1, even if the device clock is set before launch day.
const todayNumber = () => Math.max(1, dayNumber(dateKey(new Date())));
const siteUrl = () => `${location.origin}${import.meta.env.BASE_URL}`;

const INVALID_MESSAGE = {
  visible: "That card is already in the deck",
  repeat: "You already tried that card",
  over: "Today's game is over",
} as const;

export default function App() {
  const [number, setNumber] = useState(todayNumber);
  const puzzle = useMemo(() => getPuzzle(number), [number]);
  const [guesses, setGuesses] = useState(() => storage.loadGuesses(number));
  const [stats, setStats] = useState(storage.loadStats);
  const [justFound, setJustFound] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(() => !storage.hasSeenHelp());
  const [statsOpen, setStatsOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const state = useMemo(() => deriveState(puzzle, guesses), [puzzle, guesses]);
  const over = state.status !== "playing";

  // A new day: load that day's puzzle (also when the tab was left open overnight).
  const checkRollover = useCallback(() => {
    const n = todayNumber();
    if (n !== number) {
      setNumber(n);
      setGuesses(storage.loadGuesses(n));
      setJustFound(null);
    }
  }, [number]);

  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && checkRollover();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [checkRollover]);

  const showToast = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const onGuess = (key: string) => {
    const result = evaluateGuess(puzzle, guesses, key);
    if (result.kind === "invalid") {
      showToast(INVALID_MESSAGE[result.reason]);
      return;
    }
    const next = [...guesses, key];
    setGuesses(next);
    storage.saveGuesses(puzzle.number, next);
    if (result.kind === "hit") {
      setJustFound(result.slot);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 450);
    }

    const after = deriveState(puzzle, next);
    if (after.status !== "playing") {
      const updated = recordResult(stats, puzzle.number, after.status === "won", after.misses);
      setStats(updated);
      storage.saveStats(updated);
      setTimeout(() => setStatsOpen(true), 1400);
    }
  };

  const share = async () => {
    const text = shareText(puzzle, guesses, siteUrl());
    const touch = matchMedia("(pointer: coarse)").matches;
    try {
      if (touch && navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      showToast("Result copied. Paste it anywhere!");
    } catch (err) {
      if ((err as Error).name !== "AbortError") showToast("Couldn't share. Try again?");
    }
  };

  const avg = averageElixir(puzzle.cards.map((k) => getCard(k).elixir));
  const exclude = useMemo(
    () => new Set([...puzzle.cards.filter((_, i) => !puzzle.hidden.includes(i)), ...guesses]),
    [puzzle, guesses],
  );
  const misses = guesses.filter((g) => !puzzle.hidden.includes(puzzle.cards.indexOf(g)));
  const livesLeft = MAX_MISSES - state.misses;
  const showName = state.hints.has("name") || over;
  const showEra = state.hints.has("era");
  const boardTitle = showName ? puzzle.deck.name : showEra ? `Popular around ${puzzle.deck.era}` : "Mystery deck";

  return (
    <div className="app">
      <header className="topbar">
        <button className="icon-btn" onClick={() => setHelpOpen(true)} aria-label="How to play">
          ?
        </button>
        <h1 className="logo">
          Deck<span>dle</span>
        </h1>
        <button className="icon-btn" onClick={() => setStatsOpen(true)} aria-label="Statistics">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden>
            <rect x="2" y="10" width="4" height="8" rx="1" fill="currentColor" />
            <rect x="8" y="5" width="4" height="13" rx="1" fill="currentColor" />
            <rect x="14" y="2" width="4" height="16" rx="1" fill="currentColor" />
          </svg>
        </button>
      </header>

      <main className="main">
        <section className={`board${shake ? " is-shaking" : ""}`}>
          <div className="board__head">
            <span className="board__num">#{puzzle.number}</span>
            <span key={boardTitle} className={`board__name${showName || showEra ? " is-revealed" : ""}`}>
              {boardTitle}
            </span>
            <span className="board__avg" title="Average elixir of the full deck">
              <ElixirDrop size={16} /> {avg}
            </span>
          </div>
          <DeckGrid puzzle={puzzle} state={state} justFound={justFound} />
        </section>

        {!over ? (
          <section className="play">
            <div className="lives" aria-label={`${livesLeft} wrong guesses left before the game ends`}>
              <span className="lives__label">
                Found <strong>{state.found.size}/{puzzle.hidden.length}</strong>
              </span>
              <span className="lives__pips" aria-hidden>
                {Array.from({ length: MAX_MISSES }, (_, i) => (
                  <span key={i} className={`pip${i < livesLeft ? "" : " is-lost"}`} />
                ))}
              </span>
            </div>
            <GuessInput exclude={exclude} onGuess={onGuess} />
            <NextHint misses={state.misses} />
          </section>
        ) : (
          <section className={`result result--${state.status}`}>
            <h2>{state.status === "won" ? resultTitle(state.misses) : "Out of guesses"}</h2>
            <p>
              {state.status === "won"
                ? `You found all ${puzzle.hidden.length} cards${state.misses ? ` with ${state.misses} wrong guess${state.misses > 1 ? "es" : ""}` : " without a single mistake"}.`
                : `You found ${state.found.size} of ${puzzle.hidden.length}. The missing cards are marked above.`}
            </p>
            <div className="result__actions">
              <button className="btn btn--primary" onClick={share}>
                Share result
              </button>
              <button className="btn" onClick={() => setStatsOpen(true)}>
                Stats
              </button>
            </div>
            <p className="result__next">
              Next deck in <Countdown onRollover={checkRollover} />
            </p>
          </section>
        )}

        {misses.length > 0 && (
          <section className="misses" aria-label="Wrong guesses">
            <h3>Not in this deck</h3>
            <ul>
              {misses.map((key) => (
                <li key={key} className="miss-chip">
                  <img src={cardImage(key)} alt="" />
                  {getCard(key).name}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>
          This material is unofficial and is not endorsed by Supercell. For more information see{" "}
          <a href="https://supercell.com/en/fan-content-policy/" target="_blank" rel="noreferrer">
            Supercell's Fan Content Policy
          </a>
          .
        </p>
        <p>
          Fan-made and free. Card data and images via{" "}
          <a href="https://github.com/RoyaleAPI" target="_blank" rel="noreferrer">
            RoyaleAPI
          </a>
          .
        </p>
      </footer>

      <div className={`toast${toast ? " is-visible" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>

      <HelpModal
        open={helpOpen}
        onClose={() => {
          setHelpOpen(false);
          storage.markHelpSeen();
        }}
      />
      <StatsModal
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        stats={stats}
        streak={liveStreak(stats, number)}
        todayMisses={state.status === "won" ? state.misses : null}
      />
    </div>
  );
}

function resultTitle(misses: number): string {
  return ["Flawless!", "Excellent!", "Great!", "Well played!", "Nice!", "Phew, close one!"][misses] ?? "Well played!";
}

const NEXT_HINT = ["their elixir cost", "their card type", "their rarity", "when the deck was popular", "the deck's name"];

function NextHint({ misses }: { misses: number }) {
  const next = NEXT_HINT[misses];
  if (!next) return <p className="hint-line">Last chance! One more wrong guess ends the game.</p>;
  return (
    <p className="hint-line">
      {misses === 0 ? "A wrong guess" : "Another wrong guess"} reveals <strong>{next}</strong>.
    </p>
  );
}
