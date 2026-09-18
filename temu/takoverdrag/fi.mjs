// Skapar taköverdraget i majavakauppa.fi med de nio längderna som varianter.
//   node temu/takoverdrag/fi.mjs            # torrkörning: visar copy, priser och media
//   node temu/takoverdrag/fi.mjs --skarp    # skapar produkten
//
// Axels beslut 2026-09-18: undantag från "nya produkter bara SE+NO" — den här går till FI.
// Underlag: copy-fi.json (Sonnet-skribent), fi-priser.mjs (prisstegen), fakta.mjs (SKU:er).
// Bilderna återanvänds från den svenska CDN:en (Shopify kopierar dem till FI:s egen CDN),
// storlekstabellen på finska laddas upp från bilder-storlekstabell.mjs fi.
// Beskrivningens ordning enligt CLAUDE.md: problem → GIF → lösning → bild → funktioner →
// bild → storleksrad + tabell → garanti. Samma som sida.mjs i SE.
import { Butik } from '../api.mjs';
import { STORLEKAR } from './fakta.mjs';
import { PRIS_FI } from './fi-priser.mjs';
import { GARANTI4, RUBRIKER4 } from '../utrullning/texter4.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const TAB = process.env.TAK_UT || '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/tak';
const skarp = process.argv.includes('--skarp');
const sov = (ms) => new Promise((x) => setTimeout(x, ms));
const esc = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const KATEGORI = 'gid://shopify/TaxonomyCategory/vp-1-5-3';   // Vehicle Covers — verifierad i FI 2026-09-18
const VENDOR = 'Majavakauppa';

// Bilderna som ligger live i SE (lästa 2026-09-18). GIF:en ligger bara i SE:s beskrivning.
const SE_CDN = 'https://cdn.shopify.com/s/files/1/1013/0322/2621/files/';
const SE_BILDER = [
  ['hero', SE_CDN + 'image4.png?v=1788793284'],
  ['van', SE_CDN + 'tak-van.jpg?v=1788806818'],
  ['hopvikt', SE_CDN + 'tak-hopvikt.jpg?v=1788806819'],
  ['spanne', SE_CDN + 'tak-spanne.jpg?v=1788806820'],
  ['gif', SE_CDN + 'b6-takoverdrag-4.gif?v=1788806802'],
];

const t = JSON.parse(readFileSync(path.join(HÄR, 'copy-fi.json'), 'utf8'));
const r = RUBRIKER4.fi;
if (t.varden.length !== STORLEKAR.length) throw new Error(`copy-fi.json har ${t.varden.length} värden, fakta.mjs ${STORLEKAR.length}`);
const tabellFil = `${TAB}/tak-storlekar-fi.jpg`;

const b = new Butik('fi');
const shop = await b.verifiera();
if (shop.currencyCode !== 'EUR') throw new Error(`Fel butik: ${shop.name} (${shop.currencyCode})`);
console.log(`${shop.name} (${shop.currencyCode}) — ${skarp ? 'SKARP KÖRNING' : 'torrkörning'}\n`);

const finns = await b.fraga(`query($q:String!){products(first:3,query:$q){nodes{id title handle}}}`, { q: `sku:${PRIS_FI[0].sku}` });
if (finns.products.nodes.length) { console.log(`= finns redan: ${finns.products.nodes[0].handle} — avbryter`); process.exit(0); }

const varianter = PRIS_FI.map((p, i) => ({
  price: p.pris.toFixed(2), compareAtPrice: p.jamfor.toFixed(2), taxable: false, inventoryPolicy: 'CONTINUE',
  optionValues: [{ optionName: t.option, name: t.varden[i] }],
  inventoryItem: { sku: p.sku, tracked: false, cost: p.cogs.toFixed(2) },
}));

if (!skarp) {
  console.log(`titel:  ${t.titel}`);
  console.log(`seo:    ${t.seoTitel} (${t.seoTitel.length}) | ${t.seoText} (${t.seoText.length})`);
  console.log(`option: ${t.option} = ${t.varden.join(' · ')}`);
  console.log(`bullets (${t.bullets.length}):`); for (const x of t.bullets) console.log('   ', x.replace(/<[^>]+>/g, ''));
  console.log(`storleksrad: ${t.storleksrad}`);
  console.log('varianter:'); for (const v of varianter) console.log(`    ${v.optionValues[0].name.padEnd(11)} ${v.price} / ${v.compareAtPrice}  cogs ${v.inventoryItem.cost}  ${v.inventoryItem.sku}`);
  console.log(`media: ${SE_BILDER.map(([k]) => k).join(', ')} + storlekstabell ${existsSync(tabellFil) ? '✔' : 'SAKNAS ⚠️ (kör bilder-storlekstabell.mjs fi)'}`);
  console.log('\n(torrkörning — lägg till --skarp)');
  process.exit(0);
}
if (!existsSync(tabellFil)) { console.error(`Avbryter: ${tabellFil} saknas — kör bilder-storlekstabell.mjs fi`); process.exit(1); }

// 1. Produkten (DRAFT, utan beskrivning — bild-URL:erna finns först när media är READY)
const skapad = await b.mutera(
  `mutation($product: ProductCreateInput!) { productCreate(product: $product) { product { id } userErrors { field message } } }`,
  { product: { title: t.titel, vendor: VENDOR, status: 'DRAFT', templateSuffix: 'claudeprodukter', category: KATEGORI,
      tags: t.taggar, seo: { title: t.seoTitel, description: t.seoText },
      productOptions: [{ name: t.option, values: t.varden.map((n) => ({ name: n })) }] } },
  'productCreate');
const pid = skapad.product.id;
console.log('+ produkt', pid);

// 2. Media: SE-bilderna via URL, tabellen via staged upload
const st = await b.mutera(
  `mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
  { input: [{ filename: 'tak-storlekar-fi.jpg', mimeType: 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE',
      fileSize: String(readFileSync(tabellFil).length) }] }, 'stagedUploadsCreate');
const put = await fetch(st.stagedTargets[0].url, { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: readFileSync(tabellFil) });
if (!put.ok) throw new Error('PUT storlekstabell: ' + put.status);
const media = [
  ...SE_BILDER.filter(([k]) => k !== 'gif').map(([k, u]) => [k, u]),
  ['storlekstabell', st.stagedTargets[0].resourceUrl],
  ...SE_BILDER.filter(([k]) => k === 'gif'),
];
const cm = await b.mutera(
  `mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
  { productId: pid, media: media.map(([k, u]) => ({ mediaContentType: 'IMAGE', originalSource: u, alt: t.alt[k] || t.titel })) },
  'productCreateMedia');
const nya = cm.media.map((m) => m.id);
const url = {};
for (let i = 0; ; i++) {
  await sov(3000);
  const s = await b.fraga(`query($id:ID!){product(id:$id){media(first:20){nodes{id status ... on MediaImage{image{url}}}}}}`, { id: pid });
  const rel = s.product.media.nodes.filter((n) => nya.includes(n.id));
  if (rel.length === nya.length && rel.every((n) => n.status === 'READY')) {
    nya.forEach((mid, j) => { url[media[j][0]] = rel.find((n) => n.id === mid).image.url; });
    break;
  }
  if (rel.some((n) => n.status === 'FAILED')) throw new Error('media FAILED: ' + JSON.stringify(rel.filter((n) => n.status === 'FAILED')));
  if (i > 40) throw new Error('media tog för lång tid');
}
console.log('+ media READY:', Object.keys(url).join(', '));

// 3. Beskrivningen med FI:s egna bild-URL:er
const img = (k, extra = '') => url[k]
  ? `<p><img src="${url[k]}" alt="${esc(t.alt[k] || t.titel)}" loading="lazy" style="max-width:100%;height:auto${extra}"></p>` : '';
const html =
  `<h3>${esc(t.problemH)}</h3><p>${esc(t.problemP)}</p>` +
  img('gif', ';border-radius:8px') +
  `<h3>${esc(t.losningH)}</h3><p>${esc(t.losningP)}</p>` +
  img('van') +
  `<h3>${r.funktioner}</h3><ul>\n` + t.bullets.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` +
  img('hopvikt') +
  `<p>${esc(t.storleksrad)}</p>` + img('storlekstabell') +
  `<h3>${r.garanti}</h3><p>${GARANTI4.fi}</p>`;
await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
  { input: { id: pid, descriptionHtml: html } }, 'productUpdate');

// 4. De nio varianterna (den automatiska standardvarianten tas bort)
await b.mutera(
  `mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!,$strategy:ProductVariantsBulkCreateStrategy){
     productVariantsBulkCreate(productId:$productId,variants:$variants,strategy:$strategy){userErrors{field message}}}`,
  { productId: pid, strategy: 'REMOVE_STANDALONE_VARIANT', variants: varianter }, 'productVariantsBulkCreate');

// 5. Aktivera + publicera på alla kanaler
await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
  { input: { id: pid, status: 'ACTIVE' } }, 'productUpdate');
const kanaler = await b.kanaler();
await b.mutera(`mutation($id:ID!,$input:[PublicationInput!]!){publishablePublish(id:$id,input:$input){userErrors{field message}}}`,
  { id: pid, input: kanaler.map((k) => ({ publicationId: k.id })) }, 'publishablePublish');

await sov(2500);
const slut = await b.fraga(`query($id:ID!){product(id:$id){title handle status resourcePublicationsCount{count} category{id}
  variants(first:30){nodes{title sku price compareAtPrice taxable inventoryPolicy inventoryItem{unitCost{amount}}}}
  media(first:20){nodes{status}}}}`, { id: pid });
const q = slut.product;
console.log(`\n✔ ${q.title}`);
console.log(`   ${q.status} | ${q.variants.nodes.length} varianter | ${q.media.nodes.filter((m) => m.status === 'READY').length}/${q.media.nodes.length} media READY | ${q.resourcePublicationsCount.count} kanaler | ${q.category?.id}`);
for (const v of q.variants.nodes) console.log(`   ${v.title.padEnd(11)} ${v.price} / ${v.compareAtPrice}  cogs ${v.inventoryItem.unitCost?.amount}  moms ${v.taxable}  ${v.inventoryPolicy}  ${v.sku}`);
console.log(`   https://majavakauppa.fi/products/${q.handle}`);
