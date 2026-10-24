# Roadmap

## 1. Deck mode (done, v1)

Find the 4 hidden cards of a famous deck. Wrong guesses unlock hints.

## 2. Card mode: guess the card from its attributes (next)

**Can we build it?** Yes. Elixir, rarity and type are already in `src/data/cards.json`, and `cr-api-data` also has the arena. Release year isn't in any open data source, so it has to be added by hand (one value per card, about 120 cards). Targets and speed are in `cr-api-data`'s stats files, but those stop at December 2023.

**Is it already common?** Very. It's the main mode on every existing site:

- [Royaledly](https://royaledly.com) Classic: elixir, rarity, type, targets, hit speed, speed, release date, with green for exact and arrows for higher/lower.
- Royaledle Classic: elixir, rarity, type, target, speed, arena, release year.

So it only makes sense if it's clearly better. Ideas:

- **One game, two tabs.** Card mode sits next to Deck mode with the same design, the same stats screen and one shared daily streak. Other sites feel like separate mini-games.
- **Clearer feedback.** Use green for exact, yellow for close (elixir ±1, release ±1 year) and arrows for higher/lower. Add an icon or pattern on every tile so colour-blind players can read it too.
- **Data you can trust.** Cards are up to date, including new releases, and a test checks every card has every attribute. Competitors often lag behind new cards.
- **A few attributes others don't have**, picked so each guess teaches you something: release year, arena, whether the card has an Evolution, and its role (win condition, spell, defence, support).
- **Clean on a phone.** No ads covering the board, a big readable result grid and one-tap sharing.

**Effort:** small. The engine pattern (a pure `evaluateGuess` plus `deriveState`), the date and puzzle code, storage and the UI parts can all be reused. The main work is curating the data and designing the feedback row.

## 3. Friend groups (after the core game)

- Create a group, get a short invite code or link, and see each other's daily results and streaks.
- No accounts: a random player ID in `localStorage` plus a display name.
- Needs a small backend. Cloudflare Pages Functions with D1 (SQLite) fits, and it stays free at this scale.
- Privacy: only the name and results are stored. Add a "leave group" button that deletes your data.
