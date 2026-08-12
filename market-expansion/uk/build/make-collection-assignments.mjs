// Bygger kollektionstilldelningar för BeaverShop UK.
// Läser catalog.uk.json (produkt -> källkollektion/kategori), collection-map.json
// och push-results/*.log.jsonl (handle -> produkt-GID) och skriver
// output/collection-assignments.json: { "<collectionGid>": ["<productGid>", ...] }.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const base = new URL('..', import.meta.url).pathname;
const catalog = JSON.parse(readFileSync(base + 'output/catalog.uk.json', 'utf8')).products;
const map = JSON.parse(readFileSync(base + 'build/collection-map.json', 'utf8'));

const idByHandle = {};
const dir = base + 'output/push-results/';
for (const f of readdirSync(dir).filter(f => f.endsWith('.log.jsonl'))) {
  for (const line of readFileSync(dir + f, 'utf8').split('\n').filter(Boolean)) {
    const r = JSON.parse(line);
    if (r.status === 'ok' && r.id) idByHandle[r.handle] = r.id;
  }
}

const assignments = {};
const missing = [];
const unassigned = [];
for (const p of catalog) {
  const gid = idByHandle[p.handle];
  if (!gid) { missing.push(p.handle); continue; }
  const col = p.collection
    ? map.sourceCollections[p.collection]
    : map.categoryFallback[p.category];
  if (!col) { unassigned.push(p.handle); continue; }
  (assignments[col] ??= []).push(gid);
}

writeFileSync(base + 'output/collection-assignments.json', JSON.stringify(assignments, null, 1));
console.log('Kollektioner:', Object.keys(assignments).length);
for (const [c, ids] of Object.entries(assignments)) console.log(' ', c, ids.length);
console.log('Utan produkt-GID (ej pushade/fel):', missing.length, missing.join(', '));
console.log('Medvetet utan kollektion (SERV m.fl.):', unassigned.length, unassigned.join(', '));
