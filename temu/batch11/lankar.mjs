// Länktabell för batch 11–13: läser SE och NO skarpt och skriver en markdown-tabell till stdout.
//   node temu/batch11/lankar.mjs > temu/batch11/LANKAR.md
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
const Q = `query($q:String!){products(first:50,query:$q){nodes{title handle status variants(first:1){nodes{sku price}}}}}`;
const BAS = { se: 'https://baverbutiken.se', no: 'https://beverbutikken.no' };
const ut = {};
for (const land of ['se', 'no']) {
  const b = new Butik(land); await b.verifiera();
  const d = await b.fraga(Q, { q: 'sku:TEMU-B11* OR sku:TEMU-B12* OR sku:TEMU-B13* OR sku:TEMU-601099746858349' });
  for (const p of d.products.nodes) {
    const sku = p.variants.nodes[0].sku; const id = Object.entries(FAKTA).find(([, f]) => f.sku === sku)?.[0] || sku;
    (ut[id] ||= { batch: FAKTA[id]?.batch ?? '?' })[land] = { url: `${BAS[land]}/products/${p.handle}`, pris: p.variants.nodes[0].price, status: p.status, titel: p.title };
  }
}
const rader = Object.entries(ut).sort(([a, x], [b, y]) => x.batch - y.batch || a.localeCompare(b));
const cell = (v) => (v ? `[${v.pris.replace(/\.00$/, '')}](${v.url})${v.status !== 'ACTIVE' ? ` (${v.status})` : ''}` : '–');
console.log(`# Batch 11–13 — produktlänkar (${new Date().toISOString().slice(0, 10)})\n`);
console.log(`Genererad av \`node temu/batch11/lankar.mjs\`. Priset i cellen är länken. ${rader.length} produkter.\n`);
console.log('| Batch | id | Titel (SE) | 🇸🇪 SEK | 🇳🇴 NOK |\n|---|---|---|---|---|');
for (const [id, v] of rader) console.log(`| ${v.batch} | \`${id}\` | ${(v.se ?? v.no)?.titel ?? id} | ${cell(v.se)} | ${cell(v.no)} |`);
const vanta = Object.entries(FAKTA).filter(([, f]) => f.status === 'vanta');
if (vanta.length) console.log(`\n**Väntar (inte i butiken):** ${vanta.map(([id, f]) => `\`${id}\` – ${f.vanta ?? f.orsak ?? 'se fakta.mjs'}`).join('; ')}`);
