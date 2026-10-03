// cogs-skriv.mjs — skriver "Cost per item" (inventoryItem.unitCost, SEK, landad kostnad
// vara + frakt till Sverige, UTAN tull) på Matstrumpors varianter i Shopify, och samma tal
// i cogs.json → sverige.kostnad så att repots facit och butiken säger samma sak.
//
// Byggt 2026-10-03: donut-, pizza- och hamburgarstrumporna hade TOMT Cost per item sedan
// butiken byggdes (100 lådor på 14 dagar), och StonePNL räknar tomt som "cost missing".
// Talen är Axels — skriptet gissar aldrig ett belopp.
//
//   node matstrumpor/cogs-skriv.mjs --las                                  # bara läsa
//   node matstrumpor/cogs-skriv.mjs donut-strumpor=79.5 pizza-strumpor=84  # torrt: visar före/efter
//   node matstrumpor/cogs-skriv.mjs donut-strumpor=79.5 --skarpt           # skriver + läser tillbaka
//
// Handle=belopp. Ett handle med flera varianter får samma belopp på alla, om inte
// handle/variant-titel=belopp skrivs ("sushi-strumpor/3 - Par / One Size=67.51").
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { lasButik, skapaKlient } from '../sparning/butik.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const COGS_FIL = join(ROT, 'cogs.json');

const args = process.argv.slice(2);
const skarpt = args.includes('--skarpt');
const baraLas = args.includes('--las');
const onskat = args.filter((a) => !a.startsWith('--')).map((a) => {
  const i = a.lastIndexOf('=');
  if (i < 0) throw new Error(`förstår inte "${a}" — skriv handle=belopp`);
  const nyckel = a.slice(0, i);
  const belopp = Number(a.slice(i + 1).replace(',', '.'));
  if (!Number.isFinite(belopp) || belopp < 0) throw new Error(`"${a}": beloppet är inte ett tal`);
  const [handle, variant] = nyckel.split('/');
  return { handle, variant: variant ?? null, belopp };
});
if (!baraLas && onskat.length === 0) {
  console.error('Inget att göra: ge handle=belopp, eller --las.');
  process.exit(2);
}

const svar = (d, op) => d?.[op] ?? d?.data?.[op];
const k = await skapaKlient(lasButik('matstrumpor'));

// Alla aktiva produkter med varianter och nuvarande Cost per item.
const d = await k.graphql(`{ products(first: 50, query: "status:active") { nodes { handle title variants(first: 20) { nodes { id title price inventoryItem { id unitCost { amount currencyCode } } } } } } }`);
const produkter = svar(d, 'products').nodes;

console.log('Cost per item i Shopify nu (SEK):');
for (const p of produkter) for (const v of p.variants.nodes) {
  console.log(`  ${p.handle.padEnd(26)} ${v.title.padEnd(24)} pris ${v.price.padStart(7)}  kostnad ${v.inventoryItem.unitCost ? v.inventoryItem.unitCost.amount : 'TOMT'}`);
}
if (baraLas) process.exit(0);

// Vilka varianter ska skrivas.
const plan = [];
for (const o of onskat) {
  const p = produkter.find((x) => x.handle === o.handle);
  if (!p) throw new Error(`handle "${o.handle}" finns inte bland de aktiva produkterna`);
  const varianter = p.variants.nodes.filter((v) => !o.variant || v.title === o.variant);
  if (varianter.length === 0) throw new Error(`"${o.handle}" har ingen variant "${o.variant}"`);
  for (const v of varianter) {
    if (o.belopp >= Number(v.price)) throw new Error(`${o.handle} ${v.title}: kostnaden ${o.belopp} är inte lägre än priset ${v.price} — fel tal?`);
    plan.push({ handle: o.handle, variant: v.title, inventoryItemId: v.inventoryItem.id, fore: v.inventoryItem.unitCost?.amount ?? null, efter: o.belopp });
  }
}
console.log(`\n${skarpt ? 'SKRIVER' : 'TORRT — skulle skriva'}:`);
for (const r of plan) console.log(`  ${r.handle} ${r.variant}: ${r.fore ?? 'TOMT'} → ${r.efter}`);
if (!skarpt) { console.log('\nLägg till --skarpt för att skriva.'); process.exit(0); }

// Skriv och läs tillbaka, en variant i taget.
let fel = 0;
for (const r of plan) {
  const m = await k.graphql(`mutation($id: ID!, $input: InventoryItemInput!) { inventoryItemUpdate(id: $id, input: $input) { inventoryItem { id unitCost { amount currencyCode } } userErrors { field message } } }`,
    { id: r.inventoryItemId, input: { cost: r.efter } });
  const res = svar(m, 'inventoryItemUpdate');
  if (res.userErrors?.length) { fel++; console.error(`  ❌ ${r.handle} ${r.variant}: ${JSON.stringify(res.userErrors)}`); continue; }
  const t = await k.graphql(`query($id: ID!) { inventoryItem(id: $id) { unitCost { amount currencyCode } } }`, { id: r.inventoryItemId });
  const las = svar(t, 'inventoryItem').unitCost;
  const ok = las && Math.abs(Number(las.amount) - r.efter) < 0.005 && las.currencyCode === 'SEK';
  if (!ok) fel++;
  console.log(`  ${ok ? '✅' : '❌'} ${r.handle} ${r.variant}: tillbakaläst ${las ? `${las.amount} ${las.currencyCode}` : 'TOMT'}`);
}

// Samma tal i cogs.json → sverige.kostnad (nyckeln ur produkter[handle].varianter).
const cogs = JSON.parse(readFileSync(COGS_FIL, 'utf8'));
for (const r of plan) {
  const map = cogs.produkter?.[r.handle]?.varianter ?? {};
  const nyckel = map[r.variant] ?? map['*'];
  if (!nyckel) { console.warn(`  ⚠️ cogs.json har ingen nyckel för ${r.handle} ${r.variant} — skriv den för hand`); continue; }
  cogs.sverige.kostnad[nyckel] = r.efter;
}
cogs.sverige.matt = new Date().toISOString().slice(0, 10);
writeFileSync(COGS_FIL, JSON.stringify(cogs, null, 2) + '\n');
console.log(`\ncogs.json uppdaterad (sverige.kostnad). ${fel ? `${fel} fel — se ovan.` : 'Allt tillbakaläst.'}`);
process.exit(fel ? 1 : 0);
