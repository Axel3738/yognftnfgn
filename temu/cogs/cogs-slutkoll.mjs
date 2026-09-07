import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
import { writeFileSync } from 'node:fs';
const ut = {};
for (const land of ['se','no','dk','fi','uk']) {
  const b = new Butik(land); let cursor = null; let tot = 0, med = 0; const utan = [];
  do {
    const d = await b.fraga(`query($after: String) { products(first: 50, after: $after) { pageInfo { hasNextPage endCursor }
      nodes { title variants(first: 40) { nodes { sku price inventoryItem { unitCost { amount } } } } } } }`, { after: cursor });
    for (const p of d.products.nodes) for (const v of p.variants.nodes) {
      tot++;
      if (v.inventoryItem?.unitCost?.amount != null) med++;
      else utan.push({ produkt: p.title, sku: v.sku, pris: v.price });
    }
    cursor = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
  } while (cursor);
  ut[land] = { tot, med, utan };
  console.log(`${land.toUpperCase()}: ${med}/${tot} har cogs (${(med/tot*100).toFixed(0)}%) — ${utan.length} kvar (${new Set(utan.map(x=>x.produkt)).size} produkter)`);
}
writeFileSync('/tmp/fix/cogs-slutlage.json', JSON.stringify(ut, null, 1));
console.log('\nNO — de som fortfarande saknar:');
for (const [p, vs] of Object.entries(ut.no.utan.reduce((a,x)=>((a[x.produkt] ??= []).push(x),a),{})))
  console.log(`  ${p.slice(0,50).padEnd(52)} ${String(vs.length).padStart(2)} var  ${vs[0].pris} NOK`);
