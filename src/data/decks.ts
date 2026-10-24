// Well-known deck archetypes used as daily puzzles.
// Each deck has exactly 8 unique card keys from cards.json (a test checks this).
// Lists follow the classic, most-played version of each archetype.
//
// Adding decks: append new entries with `addedOn` set to a FUTURE puzzle number
// (today's number is shown in the app as #N). Past puzzles never change. Never remove or edit a deck
// that has already been played; set `retiredFrom` instead.
export interface Deck {
  id: string;
  name: string;
  /** Roughly the year this deck was at its most popular (an approximation). */
  era: number;
  /** First puzzle number this deck can appear in. */
  addedOn: number;
  /** Puzzle number from which this deck no longer appears. */
  retiredFrom?: number;
  cards: string[];
}

export const DECKS: Deck[] = [
  { id: "hog-26", name: "Hog 2.6 Cycle", era: 2017, addedOn: 1, cards: ["hog-rider", "musketeer", "cannon", "ice-golem", "ice-spirit", "skeletons", "fireball", "the-log"] },
  { id: "log-bait", name: "Classic Log Bait", era: 2017, addedOn: 1, cards: ["goblin-barrel", "princess", "goblin-gang", "knight", "inferno-tower", "rocket", "ice-spirit", "the-log"] },
  { id: "xbow-29", name: "X-Bow 2.9 Cycle", era: 2018, addedOn: 1, cards: ["x-bow", "tesla", "archers", "ice-golem", "skeletons", "ice-spirit", "fireball", "the-log"] },
  { id: "golem-nw", name: "Golem Night Witch Beatdown", era: 2018, addedOn: 1, cards: ["golem", "night-witch", "baby-dragon", "lumberjack", "mega-minion", "tornado", "lightning", "barbarian-barrel"] },
  { id: "lavaloon", name: "LavaLoon", era: 2017, addedOn: 1, cards: ["lava-hound", "balloon", "mega-minion", "minions", "guards", "tombstone", "fireball", "zap"] },
  { id: "pekka-bs", name: "P.E.K.K.A Bridge Spam", era: 2019, addedOn: 1, cards: ["pekka", "battle-ram", "bandit", "royal-ghost", "electro-wizard", "magic-archer", "poison", "zap"] },
  { id: "miner-poison", name: "Miner Poison Control", era: 2018, addedOn: 1, cards: ["miner", "poison", "inferno-tower", "valkyrie", "bats", "spear-goblins", "knight", "the-log"] },
  { id: "splashyard", name: "Splashyard", era: 2019, addedOn: 1, cards: ["graveyard", "baby-dragon", "ice-wizard", "tornado", "poison", "barbarian-barrel", "tombstone", "knight"] },
  { id: "rg-fisherman", name: "Royal Giant Fisherman", era: 2021, addedOn: 1, cards: ["royal-giant", "fisherman", "hunter", "mother-witch", "electro-spirit", "skeletons", "lightning", "the-log"] },
  { id: "giant-double-prince", name: "Giant Double Prince", era: 2017, addedOn: 1, cards: ["giant", "prince", "dark-prince", "electro-wizard", "mega-minion", "bats", "fireball", "zap"] },
  { id: "mortar-bait", name: "Mortar Bait", era: 2019, addedOn: 1, cards: ["mortar", "miner", "goblin-gang", "skeleton-barrel", "dart-goblin", "knight", "arrows", "the-log"] },
  { id: "hog-eq", name: "Hog Earthquake Firecracker", era: 2019, addedOn: 1, cards: ["hog-rider", "earthquake", "firecracker", "valkyrie", "skeletons", "ice-spirit", "tesla", "the-log"] },
  { id: "recruits-hogs", name: "Split Lane Royal Hogs Recruits", era: 2019, addedOn: 1, cards: ["royal-hogs", "royal-recruits", "flying-machine", "zappies", "goblin-cage", "barbarian-barrel", "arrows", "fireball"] },
  { id: "drill-cycle", name: "Goblin Drill Cycle", era: 2021, addedOn: 1, cards: ["goblin-drill", "wall-breakers", "bomber", "valkyrie", "tesla", "skeletons", "fireball", "the-log"] },
  { id: "lumberloon", name: "Lumberloon Freeze", era: 2017, addedOn: 1, cards: ["lumberjack", "balloon", "freeze", "bowler", "guards", "baby-dragon", "tornado", "barbarian-barrel"] },
  { id: "three-musketeers", name: "Three Musketeers Split", era: 2018, addedOn: 1, cards: ["three-musketeers", "elixir-collector", "battle-ram", "ice-golem", "bandit", "royal-ghost", "dark-prince", "zap"] },
  { id: "mk-bridge", name: "Mega Knight Bridge Spam", era: 2019, addedOn: 1, cards: ["mega-knight", "bandit", "ram-rider", "electro-wizard", "inferno-dragon", "bats", "zap", "fireball"] },
  { id: "sparky-giant", name: "Giant Sparky", era: 2018, addedOn: 1, cards: ["giant", "sparky", "mini-pekka", "electro-wizard", "goblin-gang", "arrows", "zap", "fireball"] },
  { id: "gg-sparky", name: "Goblin Giant Sparky", era: 2019, addedOn: 1, cards: ["goblin-giant", "sparky", "dark-prince", "electro-wizard", "mega-minion", "rage", "zap", "fireball"] },
  { id: "egiant", name: "Electro Giant Tornado", era: 2021, addedOn: 1, cards: ["electro-giant", "tornado", "lightning", "bowler", "cannon-cart", "dark-prince", "zap", "electro-spirit"] },
  { id: "rg-ebarbs", name: "Royal Giant Elite Barbarians", era: 2018, addedOn: 1, cards: ["royal-giant", "elite-barbarians", "lightning", "furnace", "mega-minion", "zap", "fisherman", "ice-spirit"] },
  { id: "loon-freeze", name: "Balloon Freeze", era: 2018, addedOn: 1, cards: ["balloon", "freeze", "lumberjack", "ice-golem", "bats", "inferno-dragon", "arrows", "barbarian-barrel"] },
  { id: "icebow", name: "Icebow", era: 2019, addedOn: 1, cards: ["x-bow", "ice-wizard", "tesla", "knight", "archers", "skeletons", "rocket", "the-log"] },
  { id: "pekka-ram", name: "P.E.K.K.A Ram Rider", era: 2019, addedOn: 1, cards: ["pekka", "ram-rider", "electro-wizard", "royal-ghost", "bandit", "dark-prince", "poison", "zap"] },
  { id: "egolem", name: "Elixir Golem Battle Healer", era: 2020, addedOn: 1, cards: ["elixir-golem", "battle-healer", "electro-dragon", "night-witch", "barbarian-barrel", "rage", "tornado", "lightning"] },
  { id: "wb-miner", name: "Miner Wall Breakers", era: 2020, addedOn: 1, cards: ["miner", "wall-breakers", "magic-archer", "bomber", "valkyrie", "spear-goblins", "poison", "the-log"] },
  { id: "hog-exe-nado", name: "Hog Executioner Tornado", era: 2018, addedOn: 1, cards: ["hog-rider", "executioner", "tornado", "rocket", "knight", "electro-wizard", "ice-spirit", "the-log"] },
  { id: "graveyard-freeze", name: "Graveyard Freeze", era: 2018, addedOn: 1, cards: ["graveyard", "freeze", "ice-wizard", "valkyrie", "baby-dragon", "barbarian-barrel", "poison", "knight"] },
  { id: "phoenix-loon", name: "Phoenix LavaLoon", era: 2022, addedOn: 1, cards: ["lava-hound", "balloon", "phoenix", "skeleton-dragons", "guards", "tombstone", "fireball", "zap"] },
];
