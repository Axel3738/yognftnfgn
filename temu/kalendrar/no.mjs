// Klonar en kalender från bäverbutiken.se till beverbutikken.no.
//   node temu/kalendrar/no.mjs <id> [--skarp]        t.ex. node temu/kalendrar/no.mjs dinosaurie --skarp
//
// Källan är det som ligger LIVE i SE (bilder via SE:s CDN — Shopify kopierar dem till NO:s egen
// CDN), copyn är norsk ur copy-no.json (Sonnet-skribent), priset ur FAKTA[id].no i fakta.mjs.
// Beskrivningens ordning speglar SE-sidan: problem → lösning → bild → funktioner (✓) → specar →
// FAQ → garanti (GARANTI4.no). Vägrar om SKU:n redan finns i NO.
import { Butik } from '../api.mjs';
import { FAKTA, FX_NOK } from './fakta.mjs';
import { GARANTI4, RUBRIKER4 } from '../utrullning/texter4.mjs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const KATEGORI = 'gid://shopify/TaxonomyCategory/hg-3-58-1';   // Decor > Seasonal > Advent Calendars (global GID)
const VENDOR = 'Beverbutikken';
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const id = process.argv.slice(2).find((a) => !a.startsWith('--'));
const skarp = process.argv.includes('--skarp');
const f = FAKTA[id];
if (!f) { console.error(`Okänt id "${id}". Finns: ${Object.keys(FAKTA).join(', ')}`); process.exit(1); }
if (!f.no) { console.error(`${id}: FAKTA.${id}.no saknas i fakta.mjs — inget norskt pris`); process.exit(1); }
const t = JSON.parse(readFileSync(path.join(HÄR, 'copy-no.json'), 'utf8'))[id];
if (!t) { console.error(`${id}: ingen norsk copy i copy-no.json`); process.exit(1); }
const r = RUBRIKER4.no;
const cogs = +(f.no.usd * FX_NOK).toFixed(2);

const se = new Butik('se'), no = new Butik('no');
const shopNo = await no.verifiera();
if (shopNo.currencyCode !== 'NOK') throw new Error(`Fel butik: ${shopNo.name} (${shopNo.currencyCode})`);
console.log(`${shopNo.name} (${shopNo.currencyCode}) — ${skarp ? 'SKARP KÖRNING' : 'torrkörning'}\n`);

const finns = await no.fraga(`query($q:String!){products(first:2,query:$q){nodes{id handle}}}`, { q: `sku:${f.sku}` });
if (finns.products.nodes.length) { console.log(`= ${id}: finns redan i NO (${finns.products.nodes[0].handle}) — avbryter`); process.exit(0); }

const src = await se.fraga(`query($q:String!){products(first:1,query:$q){nodes{title handle media(first:20){nodes{status ... on MediaImage{image{url}}}}}}}`, { q: `sku:${f.sku}` });
const källa = src.products.nodes[0];
if (!källa) throw new Error(`${id}: finns inte i SE (sku ${f.sku})`);
const bilder = källa.media.nodes.filter((m) => m.status === 'READY' && m.image?.url).map((m) => m.image.url);
if (!bilder.length) throw new Error(`${id}: SE-produkten har inga READY-bilder`);

console.log(`källa SE: ${källa.title} (${källa.handle}) · ${bilder.length} bild(er)`);
console.log(`titel:  ${t.titel}`);
console.log(`pris:   ${f.no.pris} / ${f.no.jamfor} NOK · cogs ${cogs} (${f.no.usd} USD × ${FX_NOK}${f.no.modell ? ', MODELL — ' + f.no.modell : ', offert'})`);
console.log(`seo:    ${t.seoTitel} (${t.seoTitel.length}) | ${t.seoText} (${t.seoText.length})`);
console.log(`✓ ${t.checkmarks.length} · specar ${t.specar.length} · faq ${t.faq.length} · taggar ${t.taggar.join(', ')}`);
if (!skarp) { console.log('\n(torrkörning — lägg till --skarp)'); process.exit(0); }

// 1. Produkten (DRAFT tills bilden är READY och beskrivningen satt)
const skapad = await no.mutera(
  `mutation($product: ProductCreateInput!) { productCreate(product: $product) { product { id } userErrors { field message } } }`,
  { product: { title: t.titel, vendor: VENDOR, status: 'DRAFT', templateSuffix: 'claudeprodukter', category: KATEGORI,
      tags: t.taggar, seo: { title: t.seoTitel, description: t.seoText } } }, 'productCreate');
const pid = skapad.product.id;

// 2. Bilderna från SE:s CDN
const cm = await no.mutera(
  `mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
  { productId: pid, media: bilder.map((u) => ({ mediaContentType: 'IMAGE', originalSource: u, alt: t.alt })) }, 'productCreateMedia');
const nya = cm.media.map((m) => m.id);
let urls = [];
for (let i = 0; ; i++) {
  await sov(3000);
  const s = await no.fraga(`query($id:ID!){product(id:$id){media(first:20){nodes{id status ... on MediaImage{image{url}}}}}}`, { id: pid });
  const rel = s.product.media.nodes.filter((n) => nya.includes(n.id));
  if (rel.length === nya.length && rel.every((n) => n.status === 'READY')) { urls = nya.map((m) => rel.find((n) => n.id === m).image.url); break; }
  if (rel.some((n) => n.status === 'FAILED')) throw new Error('media FAILED');
  if (i > 40) throw new Error('media tog för lång tid');
}

// 3. Beskrivningen — samma ordning som SE
const li = (xs) => `<ul>\n${xs.map((x) => `<li>${esc(x)}</li>`).join('\n')}\n</ul>`;
const html =
  `<h3>${esc(t.problemH)}</h3><p>${esc(t.problemP)}</p>` +
  `<h3>${esc(t.losningH)}</h3><p>${esc(t.losningP)}</p>` +
  `<p><img src="${urls[0]}" alt="${esc(t.alt)}" loading="lazy" style="max-width:100%;height:auto"></p>` +
  `<h3>${esc(t.funktionerH)}</h3>` + li(t.checkmarks) + li(t.specar) +
  `<h3>${esc(t.faqH)}</h3>\n` + t.faq.map((q) => `<p><strong>${esc(q.f)}</strong><br>${esc(q.s)}</p>`).join('\n') +
  `<h3>${r.garanti}</h3><p>${GARANTI4.no}</p>`;
await no.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
  { input: { id: pid, descriptionHtml: html, status: 'ACTIVE' } }, 'productUpdate');

// 4. Varianten
const v = await no.fraga(`query($id:ID!){product(id:$id){variants(first:3){nodes{id}}}}`, { id: pid });
await no.mutera(
  `mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!){productVariantsBulkUpdate(productId:$productId,variants:$variants){userErrors{field message}}}`,
  { productId: pid, variants: [{ id: v.product.variants.nodes[0].id, price: String(f.no.pris), compareAtPrice: String(f.no.jamfor),
      taxable: false, inventoryPolicy: 'CONTINUE', inventoryItem: { sku: f.sku, tracked: false, cost: String(cogs) } }] },
  'productVariantsBulkUpdate');

// 5. Publicera på alla kanaler
const kanaler = await no.kanaler();
await no.mutera(`mutation($id:ID!,$input:[PublicationInput!]!){publishablePublish(id:$id,input:$input){userErrors{field message}}}`,
  { id: pid, input: kanaler.map((k) => ({ publicationId: k.id })) }, 'publishablePublish');

await sov(2500);
const slut = await no.fraga(`query($id:ID!){product(id:$id){title handle status resourcePublicationsCount{count} category{id}
  variants(first:3){nodes{sku price compareAtPrice taxable inventoryPolicy inventoryItem{unitCost{amount}}}} media(first:20){nodes{status}}}}`, { id: pid });
const q = slut.product, v0 = q.variants.nodes[0];
console.log(`\n✔ ${q.title}`);
console.log(`   ${q.status} | ${v0.price}/${v0.compareAtPrice} NOK | moms ${v0.taxable} | cogs ${v0.inventoryItem.unitCost?.amount} | ${v0.inventoryPolicy} | ${v0.sku} | ${q.media.nodes.filter((m) => m.status === 'READY').length}/${q.media.nodes.length} media | ${q.resourcePublicationsCount.count} kanaler | ${q.category?.id}`);
console.log(`   https://beverbutikken.no/products/${q.handle}`);
