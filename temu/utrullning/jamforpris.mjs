// Jämförpris enligt Axels schema 2026-08-22: compareAtPrice = pris × 1,3.
// 1x-raden i Kaching-stegen visar då ordinarie pris med rean synlig
// (useProductCompareAtPrice: true i deal-blocket).
//
//   node jamforpris.mjs <se|no|dk|fi|uk|alla>
//
// Gäller BARA de 8 ramverksprodukterna — övriga katalogen (t.ex. axelbältets
// medvetet satta jämförpris) rörs inte. Priset läses live ur butiken vid varje
// körning. Avrundning: hela kronor i SEK/NOK/DKK, 2 decimaler i EUR/GBP —
// samma konvention som Axels exempel (909 kr → 1 182 kr).

import { Butik } from '../api.mjs';

const SKU_PREFIX = {
  pingis: 'TEMU-605778962427277',
  kangor: 'TEMU-601099705910254',
  bollpannband: 'TEMU-601100409294093',
  batmotor: 'TEMU-605748427852371',
  mc: 'TEMU-601102992953649',
  dorr: 'TEMU-601099515911841',
  kran: 'TEMU-601101411598143',
  plysch: 'TEMU-601102047663138',
};

const HELTAL = new Set(['SEK', 'NOK', 'DKK']);

const val = process.argv[2];
const lander = val === 'alla' ? ['se', 'no', 'dk', 'fi', 'uk'] : [val];
if (!lander.every((l) => ['se', 'no', 'dk', 'fi', 'uk'].includes(l))) {
  console.error('Användning: node jamforpris.mjs <se|no|dk|fi|uk|alla>');
  process.exit(1);
}

for (const land of lander) {
  const butik = new Butik(land);
  const shop = await butik.verifiera();
  console.log(`\n✔ ${shop.name} (${shop.currencyCode})`);
  const runda = HELTAL.has(shop.currencyCode)
    ? (v) => String(Math.round(v))
    : (v) => (Math.round(v * 100) / 100).toFixed(2);

  const { produkter } = await butik.inventera();
  for (const [nyckel, prefix] of Object.entries(SKU_PREFIX)) {
    const p = produkter.find((x) => x.skuer.some((s) => s.startsWith(prefix)));
    if (!p) { console.log(`  ✖ ${nyckel}: hittas inte`); continue; }
    const d = await butik.fraga(
      `query($id: ID!) { product(id: $id) { variants(first: 30) { nodes { id price } } } }`,
      { id: p.id }
    );
    const varianter = d.product.variants.nodes.map((v) => ({
      id: v.id,
      compareAtPrice: runda(parseFloat(v.price) * 1.3),
    }));
    await butik.mutera(
      `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
         productVariantsBulkUpdate(productId: $productId, variants: $variants) {
           userErrors { field message } } }`,
      { productId: p.id, variants: varianter },
      'productVariantsBulkUpdate'
    );
    console.log(`  ✔ ${nyckel}: ${d.product.variants.nodes[0].price} → jämförpris ${varianter[0].compareAtPrice} (${varianter.length} varianter)`);
  }
}
