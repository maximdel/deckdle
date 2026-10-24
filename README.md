# Deckdle

A daily fan-made puzzle for Clash Royale players. Every day there is one famous deck with 4 of its 8 cards hidden. Find them. Each wrong guess unlocks a hint about the hidden cards (elixir, then type, then rarity, then the deck's name). The 5th wrong guess ends the game.

Everyone gets the same deck on the same day. The day rolls over at midnight, Brussels time.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (daily pick, guess feedback, stats)
npm run build    # static site in dist/
```

## How it works

- `src/game/puzzle.ts`: picks the day's deck. Every deck is played once, in a shuffled order, before any repeats, and never two days in a row.
- `src/game/engine.ts`: checks guesses, unlocks hints, builds the share text.
- `src/game/date.ts`: puzzle number and countdown in `Europe/Brussels` (handles daylight saving).
- `src/game/stats.ts` + `storage.ts`: stats and streak in `localStorage`. No backend, no accounts.
- `src/data/decks.ts`: the deck list. Add decks here; a test checks every deck has 8 unique, known cards.

Adding or removing decks changes the order of future puzzles, so do it before launch or accept a reshuffle.

## Card data

`npm run data` rebuilds `src/data/cards.json` and downloads card images to `public/cards/` from:

- [RoyaleAPI/cr-api-data](https://github.com/RoyaleAPI/cr-api-data): card list and stats. It was last updated in December 2023.
- [RoyaleAPI/cr-api-assets](https://github.com/RoyaleAPI/cr-api-assets): card images, used unmodified.

Cards released after December 2023 are added by hand in `scripts/extra-cards.json`. Check their stats in-game before using one in a deck. Event-only cards (Super cards, Terry, Party cards, Santa Hog Rider) are left out.

## Fan Content Policy

Deckdle follows [Supercell's Fan Content Policy](https://supercell.com/en/fan-content-policy/):

- free, with no payments of any kind;
- the required notice is in the footer: "This material is unofficial and is not endorsed by Supercell…";
- no Supercell logos, and no "Clash" or "Royale" in the name or domain (the policy forbids domains that use their trademarks);
- card images are shown unmodified (no blur, pixelation or cropping).

## Deploy (Cloudflare Pages, free)

1. Create a GitHub repo `maximdel/deckdle` and push `main`.
2. In the Cloudflare dashboard, go to Workers & Pages, then Create, then Pages, then Connect to Git, and pick the repo.
3. Use these build settings: framework **Vite**, build command `npm run build`, output folder `dist`.
4. The site goes live at `https://deckdle.pages.dev` (if that name is still free) and redeploys on every push.

The `*.pages.dev` address is free. A custom domain like `deckdle.com` is optional and costs about €10–15 a year.
