// Skapar klistermärkesprodukten i NO/DK/FI/UK ur SE-källan.
// Kör: node st-rulla.mjs <no|dk|fi|uk> [--skarp]
import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
import { GARANTI4, RUBRIKER4 } from '/home/user/yognftnfgn/temu/utrullning/texter4.mjs';
import { readFileSync } from 'node:fs';

const SKU = 'TEMU-601102867393554';
const KATEGORI = 'gid://shopify/TaxonomyCategory/hg-3-38';
const SE = JSON.parse(readFileSync('/tmp/fix/stickers/se-media.json', 'utf8'));
const url = (frag) => SE.find((m) => m.image.url.includes(frag)).image.url;
const BILDER = { main: url('e7b71aa2'), uppfart: url('162214'), kylskap: url('616-o4XloTL'), inne: url('161815'), ansikten: url('161813'), miljo: url('161828') };

const LAND = {
  no: { vendor: 'Beverbutikken', pris: '199.00', jamfor: '259.00', cogs: '52.93', sprak: 'no' },
  dk: { vendor: 'Bæverbutiken', pris: '149.00', jamfor: '199.00', cogs: '36.87', sprak: 'da' },
  fi: { vendor: 'Majavakauppa', pris: '19.90', jamfor: '25.90', cogs: '5.47', sprak: 'fi' },
  uk: { vendor: 'BeaverShop', pris: '14.99', jamfor: '19.99', cogs: '3.50', sprak: 'en' },
};

const land = process.argv[2], skarp = process.argv.includes('--skarp');
const L = LAND[land];
if (!L) { console.error('Användning: node st-rulla.mjs <no|dk|fi|uk> [--skarp]'); process.exit(1); }
const t = JSON.parse(readFileSync(`/tmp/fix/stickers/${land}.json`, 'utf8'));
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

const b = new Butik(land);
const shop = await b.verifiera();
const bef = await b.fraga(`query { products(first: 3, query: "sku:${SKU}*") { nodes { id title } } }`);
console.log(`${shop.name} (${shop.currencyCode}) — ${t.titel} | ${L.pris}/${L.jamfor} | cogs ${L.cogs}`);
if (bef.products.nodes.length) { console.log(`  = finns redan (${bef.products.nodes[0].title}) — hoppar`); process.exit(0); }
if (!skarp) { console.log('  torrkörning — inget skapat'); process.exit(0); }

const r = RUBRIKER4[L.sprak];
const bild = (u, a) => `<p><img src="${u}" alt="${a}" loading="lazy" style="max-width:100%;height:auto"></p>`;
const html =
  `<h3>${t.problemH}</h3><p>${t.problemP}</p>` + bild(BILDER.miljo, t.alt.miljo) +
  `<h3>${t.losningH}</h3><p>${t.losningP}</p>` + bild(BILDER.uppfart, t.alt.main) +
  `<h3>${r.funktioner}</h3><ul>\n` + t.bullets.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` +
  bild(BILDER.kylskap, t.alt.kylskap) +
  `<h3>${r.garanti}</h3><p>${GARANTI4[L.sprak]}</p>`;

// 1. Skapa produkten med de sex delade bilderna
const media = [
  [BILDER.main, t.alt.main], [BILDER.uppfart, t.alt.main], [BILDER.kylskap, t.alt.kylskap],
  [BILDER.inne, t.alt.main], [BILDER.ansikten, t.alt.main], [BILDER.miljo, t.alt.miljo],
].map(([u, a]) => ({ originalSource: u, alt: a, mediaContentType: 'IMAGE' }));
const skapad = await b.mutera(
  `mutation($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
     productCreate(product: $product, media: $media) { product { id title handle } userErrors { field message } } }`,
  { product: { title: t.titel, descriptionHtml: html, vendor: L.vendor, status: 'ACTIVE',
      templateSuffix: 'claudeprodukter', category: KATEGORI, tags: t.tags }, media }, 'productCreate');
const pid = skapad.product.id;
console.log(`  + ${skapad.product.title} (${skapad.product.handle})`);

// 2. Lokaliserad storleksguide
const buf = readFileSync(`/tmp/fix/stickers/storlek-${land}.jpg`);
const st = await b.mutera(
  `mutation s($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl } userErrors { field message } } }`,
  { input: [{ filename: `klistermarken-storlek-${land}.jpg`, mimeType: 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(buf.length) }] }, 'stagedUploadsCreate');
const put = await fetch(st.stagedTargets[0].url, { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: buf });
if (!put.ok) throw new Error(`PUT ${put.status}`);
await b.mutera(
  `mutation m($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { field message } } }`,
  { productId: pid, media: [{ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[0].resourceUrl, alt: t.alt.storlek }] }, 'productCreateMedia');

// 3. Variant: pris, moms av, ingen lagerspärr, cogs
const bv = await b.fraga(`query($id: ID!) { product(id: $id) { variants(first: 5) { nodes { id inventoryItem { id } } } } }`, { id: pid });
const v = bv.product.variants.nodes[0];
await b.mutera(
  `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
     productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { field message } } }`,
  { productId: pid, variants: [{ id: v.id, price: L.pris, compareAtPrice: L.jamfor, taxable: false,
      inventoryPolicy: 'CONTINUE', inventoryItem: { sku: SKU, tracked: false, cost: L.cogs } }] }, 'productVariantsBulkUpdate');

// 4. Publicera på alla kanaler
const kanaler = await b.kanaler();
await b.mutera(
  `mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
  { id: pid, input: kanaler.map((k) => ({ publicationId: k.id })) }, 'publishablePublish');

// 5. Vänta in media och verifiera
for (let i = 0; ; i++) {
  const q = await b.fraga(`query($id: ID!) { product(id: $id) { media(first: 20) { nodes { status } } } }`, { id: pid });
  const m = q.product.media.nodes;
  if (m.length === 7 && m.every((n) => n.status === 'READY')) break;
  if (m.some((n) => n.status === 'FAILED')) throw new Error('media FAILED');
  if (i > 60) throw new Error(`media blev inte READY (${m.filter((n) => n.status === 'READY').length}/7)`);
  await sov(3000);
}
const slut = await b.fraga(`query($id: ID!) { product(id: $id) { title handle status descriptionHtml
  variants(first:5){nodes{ sku price compareAtPrice taxable inventoryPolicy inventoryItem{ unitCost{amount} } }}
  media(first:20){nodes{ status ... on MediaImage { image { url } } }}
  resourcePublicationsCount { count } } }`, { id: pid });
const p = slut.product;
const vv = p.variants.nodes[0];
console.log(`  ✔ ${p.status} | ${vv.price}/${vv.compareAtPrice} | moms ${vv.taxable} | cogs ${vv.inventoryItem.unitCost?.amount} | ${p.media.nodes.length} bilder | ${p.resourcePublicationsCount.count} kanaler`);
console.log(`    ${p.handle}`);
