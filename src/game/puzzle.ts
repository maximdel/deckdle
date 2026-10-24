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

const available = (deck: Deck, day: number) =>
  deck.addedOn <= day && (deck.retiredFrom === undefined || day < deck.retiredFrom);

/**
 * Deck ids for days 1..upTo, worked out like a shuffled bag: every deck that is
 * available is played once before the bag is refilled. A deck added later only
 * joins at the next refill on or after its `addedOn` day, so days that already
 * happened never change when the list grows.
 */
export function deckSchedule(upTo: number, decks: readonly Deck[] = DECKS): string[] {
  const schedule: string[] = [];
  let bag: string[] = [];
  for (let day = 1; day <= upTo; day++) {
    bag = bag.filter((id) => available(decks.find((d) => d.id === id)!, day));
    if (bag.length === 0) {
      bag = seededShuffle(
        decks.filter((d) => available(d, day)).map((d) => d.id),
        `deckdle:bag:${day}`,
      );
      if (bag.length === 0) throw new Error(`No decks available on day ${day}`);
      // Never the same deck two days in a row across a refill.
      if (bag.length > 1 && bag[0] === schedule[schedule.length - 1]) [bag[0], bag[1]] = [bag[1], bag[0]];
    }
    schedule.push(bag.shift()!);
  }
  return schedule;
}

let cache: { decks: readonly Deck[]; schedule: string[] } | null = null;

function deckFor(number: number, decks: readonly Deck[]): Deck {
  if (!cache || cache.decks !== decks || cache.schedule.length < number) {
    // Compute a year ahead so the next lookups are instant.
    cache = { decks, schedule: deckSchedule(number + 366, decks) };
  }
  return decks.find((d) => d.id === cache!.schedule[number - 1])!;
}

/** The puzzle for a given day number (1 = launch day). */
export function getPuzzle(number: number, decks: readonly Deck[] = DECKS): Puzzle {
  if (!Number.isInteger(number) || number < 1) throw new Error(`Bad puzzle number: ${number}`);
  const deck = deckFor(number, decks);
  const cards = seededShuffle(deck.cards, `deckdle:cards:${number}`);
  const hidden = seededShuffle([...cards.keys()], `deckdle:hidden:${number}`)
    .slice(0, HIDDEN_COUNT)
    .sort((a, b) => a - b);
  return { number, deck, cards, hidden };
}
