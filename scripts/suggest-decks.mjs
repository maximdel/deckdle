// Lists the decks today's top Path of Legends players are using, to pick new
// Deckdle decks from the current meta. Prints them and writes
// scripts/out/deck-suggestions.json. It never edits src/data/decks.ts:
// you choose which ones to add and give them a name.
//
//   PowerShell:  $env:CR_API_TOKEN="your-key"; npm run decks:suggest
//   options:     npm run decks:suggest -- --players 300 --top 30
//
// Uses the same key and optional CR_API_BASE as `npm run data`.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const token = process.env.CR_API_TOKEN;
const apiBase = process.env.CR_API_BASE ?? 'https://api.clashroyale.com/v1';
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? Number(process.argv[i + 1]) : fallback;
};
const PLAYERS = arg('players', 200);
const TOP = arg('top', 25);

if (!token) {
  console.error('Set CR_API_TOKEN first (see the comment at the top of this file).');
  process.exit(1);
}

/** Same keys as scripts/refresh-data.mjs. */
const toKey = (name) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function api(urlPath) {
  const res = await fetch(`${apiBase}${urlPath}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`${urlPath} -> HTTP ${res.status} ${body.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/** Top players: the live global ladder, or else the last finished season. */
async function topPlayers() {
  const tries = [`/locations/global/pathoflegend/players?limit=${PLAYERS}`];
  const now = new Date();
  for (let back = 1; back <= 3; back++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
    const season = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    tries.push(`/locations/global/pathoflegend/${season}/rankings/players?limit=${PLAYERS}`);
  }
  for (const url of tries) {
    try {
      const data = await api(url);
      if (data.items?.length) {
        console.log(`Players from ${url.split('?')[0]} (${data.items.length})`);
        return data.items;
      }
    } catch (err) {
      if (err.status === 403) throw err; // bad key or IP: no point trying more
      console.warn(`  skipped ${url.split('?')[0]}: ${err.message.split(' -> ')[1]}`);
    }
  }
  throw new Error('Could not load any Path of Legends ranking.');
}

/** Runs fn over items, a few at a time, to stay friendly with the rate limit. */
async function mapLimited(items, limit, fn) {
  const out = [];
  let next = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]).catch((e) => ({ error: e.message }));
    }
  });
  await Promise.all(workers);
  return out;
}

const cards = JSON.parse(await readFile(path.join(root, 'src/data/cards.json'), 'utf8'));
const known = new Map(cards.map((c) => [c.key, c]));
// The current decks, read straight from decks.ts (keys only).
const decksSource = await readFile(path.join(root, 'src/data/decks.ts'), 'utf8');
const existing = [...decksSource.matchAll(/id: "([^"]+)"[^\n]*?cards: \[([^\]]+)\]/g)].map(
  ([, id, list]) => ({ id, cards: [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]) }),
);

const players = await topPlayers().catch((err) => {
  console.error(
    err.status === 403
      ? 'The API refused the key (403). Check CR_API_TOKEN, and that the key was made for your current IP.'
      : err.message,
  );
  process.exit(1);
});
let done = 0;
const decks = await mapLimited(players, 5, async (p) => {
  const player = await api(`/players/${encodeURIComponent(p.tag)}`);
  if (++done % 25 === 0) console.log(`  ${done}/${players.length} players`);
  return (player.currentDeck ?? []).map((c) => toKey(c.name));
});

const counts = new Map();
for (const deck of decks) {
  if (!Array.isArray(deck) || deck.length !== 8) continue;
  const id = [...deck].sort().join(',');
  counts.set(id, (counts.get(id) ?? 0) + 1);
}

const ranked = [...counts.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, TOP)
  .map(([id, count]) => {
    const keys = id.split(',');
    const unknown = keys.filter((k) => !known.has(k));
    const avg = keys.reduce((s, k) => s + (known.get(k)?.elixir ?? 0), 0) / 8;
    const closest = existing
      .map((d) => ({ id: d.id, shared: d.cards.filter((k) => keys.includes(k)).length }))
      .sort((a, b) => b.shared - a.shared)[0];
    return { count, avgElixir: Number(avg.toFixed(1)), cards: keys, unknown, closest };
  });

const failed = decks.filter((d) => d?.error).length;
console.log(
  `\nTop ${ranked.length} decks among ${players.length - failed} players` +
    (failed ? ` (${failed} lookups failed)` : '') +
    ':\n',
);
for (const [i, d] of ranked.entries()) {
  const note =
    d.closest?.shared === 8
      ? `  (already in Deckdle: ${d.closest.id})`
      : d.closest?.shared >= 6
        ? `  (close to ${d.closest.id})`
        : '';
  console.log(`${String(i + 1).padStart(2)}. x${d.count}  avg ${d.avgElixir}${note}`);
  console.log(`    cards: [${d.cards.map((k) => `"${k}"`).join(', ')}]`);
  if (d.unknown.length) console.log(`    not in cards.json, run npm run data: ${d.unknown.join(', ')}`);
}

await mkdir(path.join(root, 'scripts/out'), { recursive: true });
const outFile = path.join(root, 'scripts/out/deck-suggestions.json');
await writeFile(
  outFile,
  JSON.stringify({ generatedAt: new Date().toISOString(), players: players.length, decks: ranked }, null, 2) + '\n',
);
console.log(`\nSaved to ${path.relative(root, outFile)}`);
