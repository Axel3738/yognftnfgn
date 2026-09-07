// Sätter unitCost (COGS) på varianter som saknar det.
// Plan: /tmp/fix/cogs-plan.json = { "<land>": { "<sku-bas>": { belopp, kalla } } }
// Kör:  node cogs-applicera.mjs <land> [--skarp]   (utan --skarp = torrkörning)
import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
import { readFileSync, writeFileSync } from 'node:fs';

const land = process.argv[2];
const skarp = process.argv.includes('--skarp');
if (!['se', 'no', 'dk', 'fi', 'uk'].includes(land)) { console.error('Användning: node cogs-applicera.mjs <se|no|dk|fi|uk> [--skarp]'); process.exit(1); }

const plan = JSON.parse(readFileSync('/tmp/fix/cogs-plan.json', 'utf8'))[land] || {};
const b = new Butik(land);
const shop = await b.verifiera();
console.log(`${shop.name} (${shop.currencyCode}) — ${skarp ? 'SKARP KÖRNING' : 'torrkörning'}`);

// Hämta alla varianter utan cogs
let cursor = null; const utan = [];
do {
  const d = await b.fraga(`query($after: String) { products(first: 50, after: $after) { pageInfo { hasNextPage endCursor }
    nodes { title variants(first: 40) { nodes { sku title inventoryItem { id unitCost { amount } } } } } } }`, { after: cursor });
  for (const p of d.products.nodes) for (const v of p.variants.nodes) {
    if (v.inventoryItem?.unitCost?.amount != null || !v.inventoryItem?.id) continue;
    utan.push({ produkt: p.title, sku: v.sku, variant: v.title, invId: v.inventoryItem.id });
  }
  cursor = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
} while (cursor);

const bas = (s) => (/^(TEMU-\d+|BEVER-[A-Z]+-\d+)/.exec(s || '') || [])[1] || null;
const gora = [], hoppa = [];
for (const v of utan) {
  const p = plan[bas(v.sku)];
  if (p) gora.push({ ...v, belopp: p.belopp, kalla: p.kalla });
  else hoppa.push(v);
}
console.log(`${utan.length} varianter utan cogs → ${gora.length} har plan, ${hoppa.length} saknar källa`);

if (!skarp) {
  console.log('\nFörsta 15 som skulle sättas:');
  gora.slice(0, 15).forEach((v) => console.log(`  ${(v.sku || '(ingen sku)').padEnd(26)} ${String(v.belopp).padStart(8)}  [${v.kalla}]  ${v.produkt.slice(0, 38)}`));
  console.log('\nFörsta 10 utan källa:');
  hoppa.slice(0, 10).forEach((v) => console.log(`  ${(v.sku || '(ingen sku)').padEnd(26)} ${v.produkt.slice(0, 50)}`));
  writeFileSync(`/tmp/fix/cogs-torr-${land}.json`, JSON.stringify({ gora, hoppa }, null, 1));
  process.exit(0);
}

let ok = 0, fel = 0;
for (const v of gora) {
  try {
    await b.mutera(
      `mutation($id: ID!, $input: InventoryItemInput!) { inventoryItemUpdate(id: $id, input: $input) {
         inventoryItem { id unitCost { amount } } userErrors { field message } } }`,
      { id: v.invId, input: { cost: String(v.belopp) } }, 'inventoryItemUpdate');
    ok++;
    if (ok % 25 === 0) console.log(`  … ${ok}/${gora.length}`);
  } catch (e) { fel++; console.error(`  ✘ ${v.sku}: ${e.message}`); }
}
console.log(`\n✔ ${ok} satta, ${fel} fel, ${hoppa.length} utan källa (orörda)`);
writeFileSync(`/tmp/fix/cogs-satt-${land}.json`, JSON.stringify({ satta: gora.length, ok, fel, utanKalla: hoppa }, null, 1));
