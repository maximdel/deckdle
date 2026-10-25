// Refreshes the bundled card data and card images.
//
// Preferred: the official Clash Royale API (always up to date). Needs an API key
// from https://developer.clashroyale.com, created for your current IP address:
//   PowerShell:  $env:CR_API_TOKEN="your-key"; npm run data
//   bash:        CR_API_TOKEN=your-key npm run data
// If your IP changes often, create the key for RoyaleAPI's proxy IP (45.79.218.79)
// and also set CR_API_BASE=https://proxy.royaleapi.dev/v1
//
// Without a key it falls back to RoyaleAPI's open data (last updated Dec 2023)
// plus scripts/extra-cards.json.
//
//   npm run data -- --force   also re-downloads images that already exist
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const force = process.argv.includes('--force');
const token = process.env.CR_API_TOKEN;
const apiBase = process.env.CR_API_BASE ?? 'https://api.clashroyale.com/v1';

const ROYALEAPI_CARDS =
  'https://raw.githubusercontent.com/RoyaleAPI/cr-api-data/master/docs/json/cards.json';
const ROYALEAPI_IMAGE = (key) =>
  `https://raw.githubusercontent.com/RoyaleAPI/cr-api-assets/master/cards-150/${key}.png`;

// Event-only cards that can't go in a normal deck.
const EXCLUDED = new Set([
  'terry',
  'party-hut',
  'party-rocket',
  'santa-hog-rider',
]);
const isEventCard = (key) => key.startsWith('super-') || EXCLUDED.has(key);

/** "Mini P.E.K.K.A" -> "mini-pekka", same keys as RoyaleAPI uses. */
const toKey = (name) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Cards whose id range doesn't match what the game shows (Heal Spirit has a spell id).
const TYPE_OVERRIDES = { 'heal-spirit': 'Troop' };

/** Official card ids encode the type: 26xxxxxx troop, 27xxxxxx building, 28xxxxxx spell. */
const typeFromId = (id) =>
  ({ 26: 'Troop', 27: 'Building', 28: 'Spell' })[Math.floor(id / 1_000_000)];
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${url} -> HTTP ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function readPrevious() {
  try {
    return JSON.parse(
      await readFile(path.join(root, 'src/data/cards.json'), 'utf8'),
    );
  } catch {
    return [];
  }
}

/** Cards from the official API. Returns [cards, imageUrlByKey]. */
async function fromOfficialApi(previous) {
  const data = await getJson(`${apiBase}/cards`, {
    Authorization: `Bearer ${token}`,
  });
  const prevByKey = new Map(previous.map((c) => [c.key, c]));
  const cards = [];
  const images = new Map();
  for (const item of data.items) {
    const key = toKey(item.name);
    const type = TYPE_OVERRIDES[key] ?? typeFromId(item.id);
    if (!type || isEventCard(key)) continue;
    // A few cards (e.g. Mirror) have no elixirCost in the API; keep the last known value.
    const elixir = item.elixirCost ?? prevByKey.get(key)?.elixir;
    if (elixir === undefined) {
      console.warn(`Skipping ${item.name}: no elixir cost`);
      continue;
    }
    cards.push({
      key,
      name: item.name,
      elixir,
      type,
      rarity: capitalize(item.rarity),
    });
    if (item.iconUrls?.medium) images.set(key, item.iconUrls.medium);
  }
  return [cards, images];
}

/** Fallback: RoyaleAPI's open data plus hand-added newer cards. */
async function fromRoyaleApi() {
  const upstream = await getJson(ROYALEAPI_CARDS);
  const extra = JSON.parse(
    await readFile(path.join(root, 'scripts/extra-cards.json'), 'utf8'),
  ).cards;
  const byKey = new Map();
  for (const c of upstream) {
    if (c.is_evolved || isEventCard(c.key)) continue;
    byKey.set(c.key, {
      key: c.key,
      name: c.name,
      elixir: c.elixir,
      type: c.type,
      rarity: c.rarity,
    });
  }
  for (const c of extra) if (!byKey.has(c.key)) byKey.set(c.key, c);
  return [[...byKey.values()], new Map()];
}

const previous = await readPrevious();
const [rawCards, officialImages] = token
  ? await fromOfficialApi(previous)
  : await fromRoyaleApi();
console.log(
  token
    ? 'Source: official Clash Royale API'
    : 'Source: RoyaleAPI open data (set CR_API_TOKEN to use the official API)',
);

const cards = rawCards.sort((a, b) => a.name.localeCompare(b.name));
const prevKeys = new Set(previous.map((c) => c.key));
const added = cards.filter((c) => !prevKeys.has(c.key)).map((c) => c.name);
const removed = previous
  .filter((c) => !cards.some((n) => n.key === c.key))
  .map((c) => c.name);
await writeFile(
  path.join(root, 'src/data/cards.json'),
  JSON.stringify(cards, null, 2) + '\n',
);
console.log(`Wrote ${cards.length} cards to src/data/cards.json`);
if (added.length) console.log(`New: ${added.join(', ')}`);
if (removed.length)
  console.warn(
    `Gone (check no deck uses them, run npm test): ${removed.join(', ')}`,
  );

const imgDir = path.join(root, 'public/cards');
await mkdir(imgDir, { recursive: true });
let downloaded = 0;
const missing = [];
for (const { key } of cards) {
  const file = path.join(imgDir, `${key}.png`);
  if (
    !force &&
    (await access(file).then(
      () => true,
      () => false,
    ))
  )
    continue;
  let img = officialImages.has(key)
    ? await fetch(officialImages.get(key))
    : null;
  if (!img?.ok) img = await fetch(ROYALEAPI_IMAGE(key));
  if (!img.ok) {
    missing.push(key);
    continue;
  }
  await writeFile(file, Buffer.from(await img.arrayBuffer()));
  downloaded++;
}
console.log(`Downloaded ${downloaded} images.`);
if (missing.length) console.warn(`No image found for: ${missing.join(', ')}`);
