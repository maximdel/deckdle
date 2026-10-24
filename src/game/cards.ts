import rawCards from "../data/cards.json";

export type CardType = "Troop" | "Spell" | "Building";
export type Rarity = "Common" | "Rare" | "Epic" | "Legendary" | "Champion";

export interface Card {
  key: string;
  name: string;
  elixir: number;
  type: CardType;
  rarity: Rarity;
}

export const CARDS = rawCards as Card[];
export const CARD_BY_KEY = new Map(CARDS.map((c) => [c.key, c]));

export function getCard(key: string): Card {
  const card = CARD_BY_KEY.get(key);
  if (!card) throw new Error(`Unknown card: ${key}`);
  return card;
}

export const cardImage = (key: string) => `${import.meta.env.BASE_URL}cards/${key}.png`;

/** Lowercase, no accents or punctuation: "P.E.K.K.A" -> "pekka". */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cards whose name matches the query: names starting with it first, then words starting with it. */
export function searchCards(query: string, exclude: ReadonlySet<string>, cards: readonly Card[] = CARDS): Card[] {
  const q = normalize(query);
  if (!q) return [];
  const rank = (c: Card) => {
    const name = normalize(c.name);
    if (name.startsWith(q)) return 0;
    if (name.split(" ").some((w) => w.startsWith(q))) return 1;
    return name.includes(q) ? 2 : -1;
  };
  return cards
    .filter((c) => !exclude.has(c.key) && rank(c) >= 0)
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}
