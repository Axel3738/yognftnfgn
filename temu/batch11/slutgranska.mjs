// Slutgranskning skarpt: läser varje batch 11–13-produkt i SE och NO och kontrollerar det som ligger live.
//   node temu/batch11/slutgranska.mjs
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
const REST = { se: /<!--|TODO|\{\{|ångerrätt|snabb leverans|vattentät/i, no: /<!--|TODO|\{\{|angrerett|rask levering|hurtig levering|vanntett|Vår garanti<\/h3><p>30 dagars/i };
const DOM = { se: 'https://baverbutiken.se', no: 'https://beverbutikken.no' };
let fel = 0, n = 0;
for (const land of ['se', 'no']) {
  const b = new Butik(land);
  console.log(`\n== ${land.toUpperCase()}`);
  for (const [id, f] of Object.entries(FAKTA)) {
    if (f.status !== 'bygg') continue;
    const q = await b.fraga(`query($q:String!){products(first:2,query:$q){nodes{title handle status templateSuffix category{id} seo{title description} descriptionHtml resourcePublicationsCount{count}
      variants(first:3){nodes{sku price compareAtPrice taxable inventoryPolicy inventoryItem{unitCost{amount}}}} media(first:10){nodes{status ... on MediaImage{image{url altText}}}}}}}`, { q: `sku:${f.sku}` });
    const p = q.products.nodes[0]; const anm = [];
    if (!p) { console.log(`✗ ${id}: SAKNAS`); fel++; continue; }
    if (q.products.nodes.length > 1) anm.push('DUBBLETT');
    if (p.status !== 'ACTIVE') anm.push(p.status);
    if (p.templateSuffix !== 'claudeprodukter') anm.push('mall ' + p.templateSuffix);
    if (!p.category) anm.push('ingen kategori');
    if (!p.seo?.description) anm.push('ingen seo-text');
    const v = p.variants.nodes[0];
    if (v.taxable) anm.push('MOMS PÅ'); if (v.inventoryPolicy !== 'CONTINUE') anm.push(v.inventoryPolicy); if (!v.inventoryItem.unitCost?.amount) anm.push('ingen cogs');
    if (+v.compareAtPrice <= +v.price) anm.push('jämför ≤ pris');
    if (p.media.nodes.some((m) => m.status !== 'READY')) anm.push('media ej READY');
    for (const m of p.media.nodes) { const r = await fetch(m.image.url, { method: 'HEAD' }); if (r.status !== 200) anm.push(`media ${r.status}`); if (!m.image.altText) anm.push('alt saknas'); }
    for (const u of p.descriptionHtml.matchAll(/src="([^"]+)"/g)) { const r = await fetch(u[1], { method: 'HEAD' }); if (r.status !== 200) anm.push(`bild i text ${r.status}`); }
    if (REST[land].test(p.descriptionHtml)) anm.push('REST i texten');
    if (!/<h3>[^<]+<\/h3><p>30 (dagars|dagers)/.test(p.descriptionHtml)) anm.push('garantiblock saknas');
    await new Promise((r) => setTimeout(r, 2500));   // storefronten svarar 429 vid snabba anrop
    const sf = await fetch(`${DOM[land]}/products/${p.handle}`, { method: 'HEAD', redirect: 'follow' }); if (sf.status !== 200) anm.push(`storefront ${sf.status}`);
    n++; if (anm.length) { fel += anm.length; console.log(`✗ ${id}: ${anm.join(' · ')}`); } else console.log(`✔ ${id}  ${v.price}/${v.compareAtPrice}  ${p.media.nodes.length} media  ${p.resourcePublicationsCount.count} kanaler  /${p.handle}`);
  }
}
console.log(`\n${n} produktsidor granskade, ${fel ? fel + ' anmärkningar' : 'inga anmärkningar'}`);
