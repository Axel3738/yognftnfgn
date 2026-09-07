// Rättar SE-produkten: garantitext (hastighetslöfte), bullets, jämförpris,
// alt-texter och svensk storleksguide i stället för den engelska.
import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
import { GARANTI4, RUBRIKER4 } from '/home/user/yognftnfgn/temu/utrullning/texter4.mjs';
import { readFileSync } from 'node:fs';

const SKU = 'TEMU-601102867393554';
const ENGELSK_GUIDE = 'Namnlosdesign-2026-08-21T161816.402.png';
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const skarp = process.argv.includes('--skarp');

const BULLETS = [
  '<strong>Du ser vilken tunna som är din redan från dörren</strong> – fyra olika ansikten: blinkande gapskratt, tunga ute, brett leende och gråtande',
  '<strong>Regn och blask torkas bort med en trasa</strong> – slät PVC-yta utan struktur som samlar smuts',
  '<strong>Sätts upp för hand, direkt på tunnan</strong> – självhäftande baksida, inga verktyg och inget lim',
  '<strong>Ligger slätt utan bubblor i kanterna</strong> – platt 2D-tryck som följer tunnans yta',
  '<strong>Räcker till hela tunnraden</strong> – fyra ark på 20 × 20 cm, eller sätt dem på kylskåp, dörrar och skåpluckor',
];
const ALT = {
  'e7b71aa2-1f45-442d-a415-4343682380d4.jpg': 'Fyra tecknade klistermärken för soptunnan',
  'Namnlosdesign-2026-08-21T162214.168.png': 'Tunnor med ansikten i uppfarten och trädgården',
  '616-o4XloTL._AC_SL1500_3f2c31cf-9d7c-481e-90e1-d84e7e579709.jpg': 'Gråtande tecknat ansikte på ett kylskåp',
  'Namnlosdesign-2026-08-21T161815.220.png': 'Två soptunnor inomhus med leende och gråtande ansikte',
  'Namnlosdesign-2026-08-21T161813.185.png': 'De fyra ansiktena – gapskratt, tunga ute, leende och gråtande',
  'Namnlosdesign-2026-08-21T161828.197.png': 'Fyra färgade soptunnor med ansikten framför ett vitt staket',
};

const b = new Butik('se');
const shop = await b.verifiera();
const d = await b.fraga(`query { products(first:1, query:"sku:${SKU}*") { nodes { id title
  variants(first:5){ nodes { id price compareAtPrice } }
  media(first:30){ nodes { id alt ... on MediaImage { image { url } } } } } } }`);
const p = d.products.nodes[0];
const fil = (u) => (u || '').split('?')[0].split('/').pop();
console.log(`${shop.name}: ${p.title}`);
if (!skarp) {
  p.media.nodes.forEach((m) => console.log(`  ${fil(m.image?.url)}  alt=${JSON.stringify(m.alt)} → ${JSON.stringify(ALT[fil(m.image?.url)] ?? '(storleksguide, byts ut)')}`));
  console.log(`  pris ${p.variants.nodes[0].price} jämför ${p.variants.nodes[0].compareAtPrice} → 259.00`);
  process.exit(0);
}

// 1. Ny svensk storleksguide
const buf = readFileSync('/tmp/fix/stickers/storlek-sv.jpg');
const st = await b.mutera(
  `mutation s($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl } userErrors { field message } } }`,
  { input: [{ filename: 'klistermarken-storlek-sv.jpg', mimeType: 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(buf.length) }] }, 'stagedUploadsCreate');
const put = await fetch(st.stagedTargets[0].url, { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: buf });
if (!put.ok) throw new Error(`PUT ${put.status}`);
const cm = await b.mutera(
  `mutation m($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { field message } } }`,
  { productId: p.id, media: [{ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[0].resourceUrl, alt: 'Storleksguide – fyra ark på 20 × 20 cm, motiv 16 × 19 cm' }] }, 'productCreateMedia');
for (let i = 0; ; i++) {
  const q = await b.fraga(`query($id: ID!) { product(id: $id) { media(first: 50) { nodes { id status } } } }`, { id: p.id });
  const m = q.product.media.nodes.find((n) => n.id === cm.media[0].id);
  if (m?.status === 'READY') break;
  if (m?.status === 'FAILED' || i > 40) throw new Error(`media ${m?.status}`);
  await sov(3000);
}

// 2. Radera den engelska guiden
const eng = p.media.nodes.find((m) => fil(m.image?.url) === ENGELSK_GUIDE);
if (eng) await b.mutera(
  `mutation($productId: ID!, $mediaIds: [ID!]!) { productDeleteMedia(productId: $productId, mediaIds: $mediaIds) { userErrors { field message } } }`,
  { productId: p.id, mediaIds: [eng.id] }, 'productDeleteMedia');

// 3. Alt-texter
for (const m of p.media.nodes) {
  const ny = ALT[fil(m.image?.url)];
  if (!ny || ny === m.alt) continue;
  await b.mutera(
    `mutation($productId: ID!, $media: [UpdateMediaInput!]!) { productUpdateMedia(productId: $productId, media: $media) { mediaUserErrors { field message } } }`,
    { productId: p.id, media: [{ id: m.id, alt: ny }] }, 'productUpdateMedia');
}

// 4. Ny beskrivning
const url = (n) => p.media.nodes.find((m) => fil(m.image?.url) === n).image.url;
const bild = (n, a) => `<p><img src="${url(n)}" alt="${a}" loading="lazy" style="max-width:100%;height:auto"></p>`;
const html =
  `<h3>Alla grå tunnor ser likadana ut. Även din.</h3><p>Soptunnan står först i uppfarten och är det första folk ser. Grå plast, ett husnummer klottrat med sprittusch – och exakt likadan som grannens, så efter tömningsdagen står du ändå och lyfter på locket för att lista ut vilken som är er.</p>` +
  bild('Namnlosdesign-2026-08-21T161828.197.png', 'Fyra färgade soptunnor med ansikten framför ett vitt staket') +
  `<h3>Lösningen: fyra ansikten, fyra tunnor med egen personlighet</h3><p>Ett som gapskrattar och blinkar, ett som räcker ut tungan, ett som ler stort – och ett som gråter över att det är just han som är soptunnan. Tryck fast ett per tunna, så ser du redan från dörren vilken som är din, och tunnan alla låtsas inte finns blir det roligaste på gatan.</p>` +
  bild('Namnlosdesign-2026-08-21T162214.168.png', 'Tunnor med ansikten i uppfarten och trädgården') +
  `<h3>${RUBRIKER4.sv.funktioner}</h3><ul>\n` + BULLETS.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` +
  bild('616-o4XloTL._AC_SL1500_3f2c31cf-9d7c-481e-90e1-d84e7e579709.jpg', 'Gråtande tecknat ansikte på ett kylskåp') +
  `<h3>${RUBRIKER4.sv.garanti}</h3><p>${GARANTI4.sv}</p>`;
await b.mutera(
  `mutation u($input: ProductUpdateInput!) { productUpdate(product: $input) { userErrors { field message } } }`,
  { input: { id: p.id, descriptionHtml: html } }, 'productUpdate');

// 5. Jämförpris
await b.mutera(
  `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { field message } } }`,
  { productId: p.id, variants: [{ id: p.variants.nodes[0].id, compareAtPrice: '259.00' }] }, 'productVariantsBulkUpdate');

console.log('✔ SE rättad');
