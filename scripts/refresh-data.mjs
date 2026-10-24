// Refreshes the bundled card data and card images.
//   npm run data            -> rebuild src/data/cards.json, download missing images
//   npm run data -- --force -> also re-download images that already exist
//
// Sources (fan-made, both carry Supercell's Fan Content Policy notice):
//   https://github.com/RoyaleAPI/cr-api-data   (card list and stats)
//   https://github.com/RoyaleAPI/cr-api-assets (card images, used unmodified)
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CARDS_URL = "https://raw.githubusercontent.com/RoyaleAPI/cr-api-data/master/docs/json/cards.json";
const IMAGE_URL = (key) => `https://raw.githubusercontent.com/RoyaleAPI/cr-api-assets/master/cards-150/${key}.png`;
const force = process.argv.includes("--force");

// Event-only cards that can't go in a normal deck.
const EXCLUDED = new Set(["terry", "party-hut", "party-rocket", "santa-hog-rider"]);
const isEventCard = (key) => key.startsWith("super-") || EXCLUDED.has(key);

const res = await fetch(CARDS_URL);
if (!res.ok) throw new Error(`Card list download failed: ${res.status}`);
const upstream = await res.json();
const extra = JSON.parse(await readFile(path.join(root, "scripts/extra-cards.json"), "utf8")).cards;

const byKey = new Map();
for (const c of upstream) {
  if (c.is_evolved || isEventCard(c.key)) continue;
  byKey.set(c.key, { key: c.key, name: c.name, elixir: c.elixir, type: c.type, rarity: c.rarity });
}
for (const c of extra) if (!byKey.has(c.key)) byKey.set(c.key, c);

const cards = [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
await writeFile(path.join(root, "src/data/cards.json"), JSON.stringify(cards, null, 2) + "\n");
console.log(`Wrote ${cards.length} cards to src/data/cards.json`);

const imgDir = path.join(root, "public/cards");
await mkdir(imgDir, { recursive: true });
let downloaded = 0;
const missing = [];
for (const { key } of cards) {
  const file = path.join(imgDir, `${key}.png`);
  if (!force && (await access(file).then(() => true, () => false))) continue;
  const img = await fetch(IMAGE_URL(key));
  if (!img.ok) { missing.push(key); continue; }
  await writeFile(file, Buffer.from(await img.arrayBuffer()));
  downloaded++;
}
console.log(`Downloaded ${downloaded} images.`);
if (missing.length) console.warn(`No image found for: ${missing.join(", ")}`);
