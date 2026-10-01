// Alternativnamnen "Color"/"Size" på svenska produktsidor → "Färg"/"Storlek" (Axels val A 2026-10-01).
// Nio produkter bar engelska alternativnamn i Shopify redan när worldwide-bygget läste dem 2026-09-30,
// så svenska kunder såg "Color" ovanför färgvalet. Översättningarna (oversattning/<l>/*.json → options.name)
// nycklas på det svenska namnet och är redan bytta; efter bytet registrerar bygg.mjs dem på nytt.
// Temats färgrutor är avstängda (color_swatches: false i alla produktmallar, mätt samma dag), så
// bytet ändrar bara etiketten. Loggen worldwide/granskning/alternativnamn-logg.json bär originalen.
//   node worldwide/granskning/alternativnamn.mjs            torrt
//   node worldwide/granskning/alternativnamn.mjs --skarpt   byter och läser tillbaka
//   node worldwide/granskning/alternativnamn.mjs --angra --skarpt   tillbaka till loggens original
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { KONFIG } from '../bygg.mjs';
import { lasButik, skapaKlient } from '../../sparning/butik.mjs';

export const NYTT = { Color: 'Färg', Size: 'Storlek' };
const SKARPT = process.argv.includes('--skarpt');
const ANGRA = process.argv.includes('--angra');
const LOGG = new URL('./alternativnamn-logg.json', import.meta.url);

const k = await skapaKlient({ ...lasButik('baverbutiken'), env_suffix: KONFIG.butik.env_suffix });
const fran = ANGRA ? Object.fromEntries(Object.entries(NYTT).map(([a, b]) => [b, a])) : NYTT;
const logg = existsSync(LOGG) ? JSON.parse(readFileSync(LOGG, 'utf8')) : [];
const tillAngra = new Set(logg.map((r) => r.optionId));

let efter = null, antal = 0, fel = 0;
const planer = [];
for (;;) {
  const r = await k.graphql(`query($e: String) { products(first: 100, after: $e) { pageInfo { hasNextPage endCursor } nodes { id handle options { id name } } } }`, { e: efter });
  for (const p of r.products.nodes) for (const o of p.options) {
    if (!fran[o.name]) continue;
    if (ANGRA && !tillAngra.has(o.id)) continue; // ångra bara det vi själva bytte
    planer.push({ productId: p.id, handle: p.handle, optionId: o.id, fore: o.name, efter: fran[o.name] });
  }
  if (!r.products.pageInfo.hasNextPage) break;
  efter = r.products.pageInfo.endCursor;
}
for (const pl of planer) console.log(`${pl.handle}: "${pl.fore}" → "${pl.efter}"`);
if (!SKARPT) { console.log(`\n${planer.length} alternativ. Torrt — lägg till --skarpt.`); process.exit(0); }

for (const pl of planer) {
  const s = await k.graphql(`mutation($p: ID!, $o: OptionUpdateInput!) { productOptionUpdate(productId: $p, option: $o) { product { options { id name } } userErrors { field message } } }`, { p: pl.productId, o: { id: pl.optionId, name: pl.efter } });
  const ue = s.productOptionUpdate.userErrors;
  const last = s.productOptionUpdate.product?.options.find((o) => o.id === pl.optionId)?.name;
  if (ue.length || last !== pl.efter) { fel++; console.log(`❌ ${pl.handle}: ${ue.map((e) => e.message).join('; ') || `läst "${last}"`}`); continue; }
  antal++;
  if (!ANGRA) logg.push({ ...pl, tid: new Date().toISOString() });
}
writeFileSync(LOGG, JSON.stringify(ANGRA ? logg.filter((r) => !planer.some((p) => p.optionId === r.optionId)) : logg, null, 2) + '\n');
console.log(`\n${antal} bytta och tillbakalästa, ${fel} fel.`);
if (fel) process.exit(1);
