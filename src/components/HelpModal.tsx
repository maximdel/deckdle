import { MAX_MISSES } from "../game/engine";
import { HIDDEN_COUNT } from "../game/puzzle";
import { ElixirDrop } from "./ElixirDrop";
import { Modal } from "./Modal";

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal title="How to play" open={open} onClose={onClose}>
      <p>
        Every day there is one famous deck. {8 - HIDDEN_COUNT} cards are shown, <strong>{HIDDEN_COUNT} are hidden</strong>. Find
        them all.
      </p>
      <ul className="help-list">
        <li>Type a card name and pick it from the list. You can find the hidden cards in any order.</li>
        <li>
          You can make <strong>{MAX_MISSES - 1} wrong guesses</strong>. The {MAX_MISSES}th one ends the game.
        </li>
        <li>Each wrong guess unlocks a hint about the hidden cards:</li>
      </ul>
      <ol className="help-hints">
        <li>
          <ElixirDrop value={3} size={16} /> their elixir cost
        </li>
        <li>⚔️ their type: troop, spell or building</li>
        <li>💎 their rarity</li>
        <li>🏷️ the name of the deck</li>
      </ol>
      <p className="muted">The average elixir of the full deck is shown from the start. A new deck comes every day at midnight (Brussels time).</p>
    </Modal>
  );
}
