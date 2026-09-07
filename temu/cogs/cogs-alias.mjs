// Verifierade NO-matchningar → sätt cogs via SKU-alias (BEVER-* → TEMU-*).
// Kostnaderna är SE-baskostnader ur offertarket → × landfaktor NO 1.133 × FX.
import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
const FX_NO = 9.2989, LF_NO = 1.133;
// Endast matchningar där skeptikern INTE avvisade (avvisad=false)
const ALIAS = [
  { noSkuPrefix: 'BEVER-CAMP-111', temu: 'TEMU-601099613072998', usd: 17.28, namn: 'Lettvektsryggsekk' },
  { noSkuPrefix: 'BEVER-DIV-113',  temu: 'TEMU-601103791378059', usd: 8.24,  namn: 'Antiskli-mattestoppere' },
  { noSkuPrefix: 'BEVER-DIV-114',  temu: 'TEMU-601099746858349', usd: 25.30, namn: 'Radiostyrt Bil' },
  { noSkuPrefix: 'BEVER-CAMP-115', temu: 'TEMU-601105338816115', usd: 17.01, namn: 'Fiskesett' },
  { noSkuPrefix: 'BEVER-DIV-116',  temu: 'TEMU-606038489195587', usd: 40.30, namn: 'AI Smartbriller' },
  { noSkuPrefix: 'BEVER-KJT-120',  temu: 'TEMU-601099524922604', usd: 13.80, namn: 'Hjelmholder' },
  // Skeptikern avvisade "sätt 10.3 rakt av" men rekommenderade uttryckligen aliaset med landfaktor:
  { noSkuPrefix: 'BEVER-DIV-121',  temu: 'TEMU-601099520362678', usd: 10.30, namn: 'Golfkølle-børste' },
];
const skarp = process.argv.includes('--skarp');
const b = new Butik('no');
const shop = await b.verifiera();
console.log(`${shop.name} — ${skarp ? 'SKARP' : 'torrkörning'}\n`);

let cursor = null; const utan = [];
do {
  const d = await b.fraga(`query($after: String) { products(first: 50, after: $after) { pageInfo { hasNextPage endCursor }
    nodes { title variants(first: 40) { nodes { sku title inventoryItem { id unitCost { amount } } } } } } }`, { after: cursor });
  for (const p of d.products.nodes) for (const v of p.variants.nodes)
    if (v.inventoryItem?.id && v.inventoryItem?.unitCost?.amount == null) utan.push({ produkt: p.title, sku: v.sku, invId: v.inventoryItem.id });
  cursor = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
} while (cursor);

let ok = 0;
for (const a of ALIAS) {
  const träffar = utan.filter((v) => (v.sku || '').startsWith(a.noSkuPrefix));
  const belopp = +(a.usd * LF_NO * FX_NO).toFixed(2);
  console.log(`${a.namn.padEnd(24)} ${a.noSkuPrefix.padEnd(17)} → ${a.temu}  ${a.usd} USD × ${LF_NO} × ${FX_NO} = ${belopp} NOK  (${träffar.length} varianter)`);
  if (!skarp) continue;
  for (const v of träffar) {
    await b.mutera(`mutation($id: ID!, $input: InventoryItemInput!) { inventoryItemUpdate(id: $id, input: $input) { inventoryItem { id } userErrors { field message } } }`,
      { id: v.invId, input: { cost: String(belopp) } }, 'inventoryItemUpdate');
    ok++;
  }
}
if (skarp) console.log(`\n✔ ${ok} varianter satta via alias`);
