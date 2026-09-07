import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
const SKU = 'TEMU-601101617191068';
for (const land of ['se','no','dk','fi','uk']) {
  const b = new Butik(land);
  const d = await b.fraga(`query { products(first: 1, query: "sku:${SKU}*") { nodes { title handle status
    options { name optionValues { name } }
    variants(first: 40) { nodes { sku title price image { url } inventoryItem { unitCost { amount } } } }
    media(first: 60) { nodes { id status } } } } }`);
  const p = d.products.nodes[0];
  const v = p.variants.nodes;
  const utanBild = v.filter(x => !x.image).length, utanCogs = v.filter(x => x.inventoryItem?.unitCost?.amount == null).length;
  const ejReady = p.media.nodes.filter(m => m.status !== 'READY').length;
  const dubbletter = v.length - new Set(v.map(x => x.sku)).size;
  console.log(`${land.toUpperCase()}: ${v.length} varianter | ${p.media.nodes.length} media (${ejReady} ej READY) | ${utanBild} utan bild | ${utanCogs} utan cogs | ${dubbletter} dubbl-sku | ${p.status}`);
  console.log(`   färger: ${p.options[0].optionValues.map(o=>o.name).join(', ')}`);
  const bas = { se:'baverbutiken.se', no:'beverbutikken.no', dk:'xn--bverbutiken-x8a.dk', fi:'majavakauppa.fi', uk:'beavershop.co.uk' }[land];
  console.log(`   https://${bas}/products/${p.handle}`);
}
