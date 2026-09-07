// Byter neongröna damaskbilden (kinesisk text) mot den rensade i alla butiker.
// Idempotent: hoppar över butiker som redan har den rena bilden på varianten.
// Kör: node ng-fix.mjs <land> [--skarp]
import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
import { readFileSync } from 'node:fs';

const SKU = 'TEMU-601101617191068-NG';
const NY = '/tmp/fix/dam-kie-ut/neongron.jpg';
const MARKE = '-NG-ren';
const ALT = { se: 'Damasker i neongrönt', no: 'Gamasjer i neongrønt', dk: 'Gamacher i neongrøn', fi: 'Säärystimet – neonvihreä', uk: 'Gaiters in neon green' };
const land = process.argv[2], skarp = process.argv.includes('--skarp');
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const bas = (u) => (u || '').split('?')[0];

const b = new Butik(land);
const shop = await b.verifiera();

async function las() {
  const d = await b.fraga(`query { products(first:1, query:"sku:${SKU}") { nodes { id title
    variants(first:30){ nodes { id sku image { url } } }
    media(first:50){ nodes { id alt status ... on MediaImage { image { url } } } } } } }`);
  return d.products.nodes[0];
}

const p = await las();
if (!p) { console.log(`${land}: produkten saknas`); process.exit(0); }
const v = p.variants.nodes.find((x) => x.sku === SKU);
if (!v) { console.log(`${land}: NG-varianten saknas`); process.exit(0); }
const harRen = bas(v.image?.url || '').includes(MARKE);
const gammal = p.media.nodes.find((m) => m.image?.url && v.image?.url && bas(m.image.url) === bas(v.image.url));
const redanUppladdad = p.media.nodes.find((m) => bas(m.image?.url || '').includes(MARKE));
console.log(`${shop.name}: NG=${bas(v.image?.url || '').split('/').pop()} | ren finns i galleriet: ${redanUppladdad ? 'ja' : 'nej'}`);
if (harRen) { console.log('  = redan rätt bild — hoppar'); process.exit(0); }
if (!skarp) process.exit(0);

// 1. Ladda upp den rensade bilden (eller återanvänd en från en avbruten körning)
let nyId = redanUppladdad?.id;
if (!nyId) {
  const buf = readFileSync(NY);
  const st = await b.mutera(
    `mutation s($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl } userErrors { field message } } }`,
    { input: [{ filename: `damask-${land}${MARKE}.jpg`, mimeType: 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(buf.length) }] },
    'stagedUploadsCreate');
  const put = await fetch(st.stagedTargets[0].url, { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: buf });
  if (!put.ok) throw new Error(`PUT ${put.status}`);
  const cm = await b.mutera(
    `mutation m($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { field message } } }`,
    { productId: p.id, media: [{ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[0].resourceUrl, alt: ALT[land] }] },
    'productCreateMedia');
  nyId = cm.media[0].id;
}

// 2. Vänta READY
for (let i = 0; ; i++) {
  const q = await b.fraga(`query($id: ID!) { product(id: $id) { media(first: 50) { nodes { id status } } } }`, { id: p.id });
  const m = q.product.media.nodes.find((n) => n.id === nyId);
  if (m?.status === 'READY') break;
  if (m?.status === 'FAILED' || i > 40) throw new Error(`media status ${m?.status}`);
  await sov(3000);
}

// 3. Radera den kinesiska bilden FÖRST (frigör variantens mediaplats), sedan koppla den rena
if (gammal) {
  await b.mutera(
    `mutation($productId: ID!, $mediaIds: [ID!]!) { productDeleteMedia(productId: $productId, mediaIds: $mediaIds) { deletedMediaIds userErrors { field message } } }`,
    { productId: p.id, mediaIds: [gammal.id] }, 'productDeleteMedia');
  await sov(1500);
}
await b.mutera(
  `mutation($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
     productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) { userErrors { field message } } }`,
  { productId: p.id, variantMedia: [{ variantId: v.id, mediaIds: [nyId] }] }, 'productVariantAppendMedia');

// 4. Verifiera
await sov(1500);
const p2 = await las();
const v2 = p2.variants.nodes.find((x) => x.sku === SKU);
const utan = p2.variants.nodes.filter((x) => !x.image).length;
const kvar = p2.media.nodes.some((m) => bas(m.image?.url || '').endsWith(`damask-${land}-NG.jpg`));
console.log(`  ✔ NG=${bas(v2.image?.url || '').split('/').pop()} | ${p2.media.nodes.length} media | ${utan} utan bild | gamla bilden kvar: ${kvar ? 'JA ⚠️' : 'nej'}`);
