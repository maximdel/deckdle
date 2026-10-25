# Deckdle

**Play: https://deckdle.pages.dev**

A daily fan-made puzzle for Clash Royale players. Every day there is one famous deck with 4 of its 8 cards hidden. Find them. Each wrong guess unlocks a hint about the hidden cards (elixir, then type, then rarity, then roughly when the deck was popular, then the deck's name). The 6th wrong guess ends the game.

Everyone gets the same deck on the same day. The day rolls over at midnight, Brussels time.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (daily pick, guess feedback, stats)
npm run build    # static site in dist/
```

## How it works

- `src/game/puzzle.ts`: picks the day's deck. Every deck is played once, in a shuffled order, before any repeats, and never two days in a row. Adding decks later doesn't change past days.
- `src/game/engine.ts`: checks guesses, unlocks hints, builds the share text.
- `src/game/date.ts`: puzzle number and countdown in `Europe/Brussels` (handles daylight saving).
- `src/game/stats.ts` + `storage.ts`: stats and streak in `localStorage`. No backend, no accounts.
- `src/data/decks.ts`: the deck list. Add decks here; a test checks every deck has 8 unique, known cards.

## Card data

`npm run data` rebuilds `src/data/cards.json` and downloads any missing card images to `public/cards/`.

- **With an official API key** (recommended, always up to date):
  `$env:CR_API_TOKEN="your-key"; npm run data`
  Get the key at [developer.clashroyale.com](https://developer.clashroyale.com) for your current IP. The card type comes from the card ID (26… troop, 27… building, 28… spell).
- **Without a key**, it falls back to [RoyaleAPI/cr-api-data](https://github.com/RoyaleAPI/cr-api-data). That data was last updated in December 2023, so newer cards are added by hand in `scripts/extra-cards.json`.

Card images come from the official API or [RoyaleAPI/cr-api-assets](https://github.com/RoyaleAPI/cr-api-assets) and are used unmodified. Event-only cards (Super cards, Terry, Party cards, Santa Hog Rider) are left out.

## Adding decks

To find decks from the current meta, run `$env:CR_API_TOKEN="your-key"; npm run decks:suggest`. It lists the most-used decks among the top Path of Legends players (it doesn't edit anything). Pick the ones you like and give them a name.

Append a deck to `src/data/decks.ts` with `addedOn` set to a future puzzle number. Past puzzles never change, because the schedule replays day by day and a new deck only joins once its day has come. Don't delete decks that have been played: set `retiredFrom` instead. `npm test` checks every deck.

## Fan Content Policy

Deckdle follows [Supercell's Fan Content Policy](https://supercell.com/en/fan-content-policy/):

- free, with no payments of any kind;
- the required notice is in the footer: "This material is unofficial and is not endorsed by Supercell…";
- no Supercell logos, and no "Clash" or "Royale" in the name or domain (the policy forbids domains that use their trademarks);
- card images are shown unmodified (no blur, pixelation or cropping).

## Deploy (Cloudflare Pages, free)

Live at https://deckdle.pages.dev. Every push to `main` is built and deployed automatically. Setup for reference:

1. Create a GitHub repo `maximdel/deckdle` and push `main`.
2. In the Cloudflare dashboard, go to Workers & Pages, then Create, then Pages, then Connect to Git, and pick the repo.
3. Use these build settings: framework **Vite**, build command `npm run build`, output folder `dist`.
4. The site goes live at `https://deckdle.pages.dev` (if that name is still free) and redeploys on every push.

The `*.pages.dev` address is free. A custom domain like `deckdle.com` is optional and costs about €10–15 a year.
