import { cardImage, getCard } from "../game/cards";
import type { GameState } from "../game/engine";
import type { Puzzle } from "../game/puzzle";
import { ElixirDrop } from "./ElixirDrop";

interface Props {
  puzzle: Puzzle;
  state: GameState;
  /** Slot that was just found, to play the flip animation. */
  justFound: number | null;
}

const TYPE_ICON = { Troop: "⚔️", Spell: "✨", Building: "🏰" } as const;

export function DeckGrid({ puzzle, state, justFound }: Props) {
  const over = state.status !== "playing";
  return (
    <ol className="deck" aria-label="Today's deck">
      {puzzle.cards.map((key, slot) => {
        const card = getCard(key);
        const isHidden = puzzle.hidden.includes(slot);
        const found = state.found.has(slot);
        const shown = !isHidden || found || over;
        const missed = isHidden && !found && over;
        const has = (hint: "elixir" | "type" | "rarity") => state.hints.has(hint);
        const label = shown ? card.name : `Hidden card ${puzzle.hidden.indexOf(slot) + 1}`;
        return (
          <li key={slot} className="slot" aria-label={label}>
            <div
              className={[
                "slot__card",
                shown ? "is-shown" : "",
                found ? "is-found" : "",
                missed ? "is-missed" : "",
                found && slot === justFound ? "is-flipping" : "",
              ].join(" ")}
            >
              {shown ? (
                <img src={cardImage(key)} alt={card.name} draggable={false} />
              ) : (
                <div className={`back${has("rarity") ? ` back--${card.rarity.toLowerCase()}` : ""}`}>
                  <span className="back__mark">?</span>
                  {has("rarity") && <span className="back__rarity">{card.rarity}</span>}
                  {has("type") && (
                    <span className="back__type">
                      <span aria-hidden>{TYPE_ICON[card.type]}</span> {card.type}
                    </span>
                  )}
                </div>
              )}
              {missed && <span className="slot__flag">missed</span>}
            </div>
            <ElixirDrop value={shown || has("elixir") ? card.elixir : "?"} size={22} dim={!shown && !has("elixir")} />
          </li>
        );
      })}
    </ol>
  );
}
