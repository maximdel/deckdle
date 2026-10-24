import { DECKS, type Deck } from "../data/decks";
import { seededShuffle } from "./random";

export const HIDDEN_COUNT = 4;

export interface Puzzle {
  number: number;
  deck: Deck;
  /** The deck's 8 cards in the order they are shown. */
  cards: string[];
  /** Positions in `cards` that the player has to find, ascending. */
  hidden: number[];
}

/** Deck order for one pass through the list ("cycle"). */
function cycleOrder(cycle: number, count: number): number[] {
  const order = seededShuffle([...Array(count).keys()], `deckdle:cycle:${cycle}`);
  // Never show the same deck two days in a row across a cycle boundary.
  if (cycle > 0 && count > 1) {
    const prev = seededShuffle([...Array(count).keys()], `deckdle:cycle:${cycle - 1}`);
    if (order[0] === prev[count - 1]) [order[0], order[1]] = [order[1], order[0]];
  }
  return order;
}

/**
 * The puzzle for a given day number (1 = launch day). Every deck is used once
 * per cycle of `decks.length` days, in a shuffled order, so nothing repeats
 * until all decks have been played.
 */
export function getPuzzle(number: number, decks: readonly Deck[] = DECKS): Puzzle {
  if (!Number.isInteger(number)) throw new Error(`Bad puzzle number: ${number}`);
  const index = Math.max(0, number - 1);
  const cycle = Math.floor(index / decks.length);
  const deck = decks[cycleOrder(cycle, decks.length)[index % decks.length]];
  const cards = seededShuffle(deck.cards, `deckdle:cards:${number}`);
  const hidden = seededShuffle([...cards.keys()], `deckdle:hidden:${number}`)
    .slice(0, HIDDEN_COUNT)
    .sort((a, b) => a - b);
  return { number, deck, cards, hidden };
}
