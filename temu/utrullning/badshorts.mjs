// Badshortsen ur offert 4 (2026-08-28) — skapas separat eftersom den behöver
// TVÅ optioner (Motiv × Storlek), vilket kor4.mjs enradsmaskin inte gör.
//
//   node badshorts.mjs stage <land>   # stagea de 7 bilderna för landet
//   node badshorts.mjs <land>         # skapa produkten (se|no|dk|fi|uk)
//
// Storlekarna S–XXL kommer från Temu-listningens storleksväljare
// (Axels skärmdump 2026-08-28, "Standard"-skalan). CWD trycker på beställning
// ("all make to order") — säger CWD andra mått är det deras som gäller.
// Ingen måttabell i copyn: vi har inga verifierade cm-mått, och då påstår vi inga.
//
// Motiv → bildmapp: Hajar=korall, Cocktail=cocktail, Krabbor=sjogras, Hawaii=logo.
// Samma staged-per-butik-regel som kor4: en staged-URL kan bara konsumeras en gång.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { Butik } from '../api.mjs';
import { BUTIKER } from '../butiker.mjs';
import { T4, GARANTI4, RUBRIKER4, PRISER4 } from './texter4.mjs';

const BAS = '/tmp/fix/offert4';
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

const SKU_BAS = 'TEMU-606721154083596';
const KATEGORI = 'gid://shopify/TaxonomyCategory/aa-1-20-2'; // Apparel > Clothing > Swimwear > Boardshorts (slagen upp 2026-08-28)
const STORLEKAR = ['S', 'M', 'L', 'XL', 'XXL'];
const MOTIV_SUFFIX = ['-HA', '-CO', '-KR', '-HW']; // ordning = t.designer

const MEDIA = [
  { roll: 'main', fil: 'badshorts-logo/badshorts-logo-01.jpg' },
  { roll: 'bak', fil: 'badshorts-korall/badshorts-korall-02.jpg' },
  { roll: 'hajar', fil: 'badshorts-korall/badshorts-korall-01.jpg' },
  { roll: 'cocktail', fil: 'badshorts-cocktail/badshorts-cocktail-01.jpg' },
  { roll: 'krabbor', fil: 'badshorts-sjogras/badshorts-sjogras-02.jpg' },
  { roll: 'tryck', fil: 'badshorts-korall/badshorts-korall-05.jpg' },
  { roll: 'snore', fil: 'badshorts-logo/badshorts-logo-05.jpeg' },
];
const HTML_ROLLER = ['main', 'bak', 'tryck'];
// motivindex (som i t.designer) → bildroll för variantbilden
const MOTIV_BILD = ['hajar', 'cocktail', 'krabbor', 'main'];

// Alt-texter per språk (texter4 bär bara alt.tryck för badshortsen).
const ALT = {
  sv: { main: 'Hawaiimotivet framifrån och bakifrån vid poolen', bak: 'Baksidan ser ut som en nedåkt linning', hajar: 'Hajmotivet framifrån och bakifrån', cocktail: 'Cocktailmotivet framifrån och bakifrån', krabbor: 'Krabbmotivet bakifrån', snore: 'Snörning i midjan' },
  no: { main: 'Hawaiimotivet forfra og bakfra ved bassenget', bak: 'Baksiden ser ut som en nedglidd linning', hajar: 'Haimotivet forfra og bakfra', cocktail: 'Cocktailmotivet forfra og bakfra', krabbor: 'Krabbemotivet bakfra', snore: 'Snøring i livet' },
  da: { main: 'Hawaiimotivet forfra og bagfra ved poolen', bak: 'Bagsiden ligner en nedgledet linning', hajar: 'Hajmotivet forfra og bagfra', cocktail: 'Cocktailmotivet forfra og bagfra', krabbor: 'Krabbemotivet bagfra', snore: 'Snøre i taljen' },
  fi: { main: 'Havaiji-kuosi edestä ja takaa altaalla', bak: 'Takaa vyötärö näyttää valuneelta', hajar: 'Hai-kuosi edestä ja takaa', cocktail: 'Cocktail-kuosi edestä ja takaa', krabbor: 'Rapu-kuosi takaa', snore: 'Kiristysnyöri vyötäröllä' },
  en: { main: 'The Hawaii design front and back by the pool', bak: 'The back looks like a slipped waistband', hajar: 'The shark design front and back', cocktail: 'The cocktail design front and back', krabbor: 'The crab design from behind', snore: 'Drawstring waist' },
};

function altFor(roll, sprak, t) {
  if (roll === 'tryck') return t.alt.tryck;
  const a = ALT[sprak][roll];
  if (!a) throw new Error(`alt saknas: ${roll}/${sprak}`);
  return a;
}

// ---------------------------------------------------------------------------

async function stagea(land) {
  const STAGED_FIL = `${BAS}/staged-${land === 'se' ? 'se' : land}.json`;
  const butik = new Butik(land);
  await butik.verifiera();
  const karta = existsSync(STAGED_FIL) ? JSON.parse(readFileSync(STAGED_FIL, 'utf8')) : {};
  const grupp = MEDIA.map((m) => m.fil).filter((f) => !karta[f]);
  if (!grupp.length) { console.log('allt redan stagat'); return; }
  const d = await butik.mutera(
    `mutation($input: [StagedUploadInput!]!) {
       stagedUploadsCreate(input: $input) {
         stagedTargets { url resourceUrl parameters { name value } }
         userErrors { field message } } }`,
    { input: grupp.map((f) => ({ filename: f.replaceAll('/', '-'), mimeType: 'image/jpeg', resource: 'IMAGE', httpMethod: 'PUT' })) },
    'stagedUploadsCreate'
  );
  for (let j = 0; j < grupp.length; j++) {
    const t = d.stagedTargets[j];
    const buf = readFileSync(`${BAS}/${grupp[j]}`);
    const svar = await fetch(t.url, { method: 'PUT', headers: Object.fromEntries(t.parameters.map((p) => [p.name, p.value])), body: buf });
    if (!svar.ok) throw new Error(`PUT ${grupp[j]} → ${svar.status}`);
    karta[grupp[j]] = t.resourceUrl;
    console.log(`  ✔ ${grupp[j]}`);
  }
  writeFileSync(STAGED_FIL, JSON.stringify(karta, null, 1));
  console.log(`Sparade ${STAGED_FIL}`);
}

function byggHtml(t, sprak, bildAvRoll) {
  const r = RUBRIKER4[sprak];
  const img = (roll, forsta) => {
    const b = bildAvRoll[roll];
    const stil = `max-width:100%;height:auto${forsta ? ';border-radius:8px' : ''}`;
    return `<p><img src="${b.url}" alt="${b.alt}" loading="lazy" style="${stil}"></p>`;
  };
  return (
    `<h3>${t.problemH}</h3><p>${t.problemP}</p>` + img(HTML_ROLLER[0], true) +
    `<h3>${t.losningH}</h3><p>${t.losningP}</p>` + img(HTML_ROLLER[1], false) +
    `<h3>${r.funktioner}</h3><ul>\n` +
    t.bullets.map((b) => `<li>\n${b}</li>`).join('\n') +
    `\n</ul>` + img(HTML_ROLLER[2], false) +
    `<h3>${r.garanti}</h3><p>${GARANTI4[sprak]}</p>`
  );
}

async function vantaMedia(butik, pid, antal) {
  for (let i = 0; i < 40; i++) {
    const d = await butik.fraga(
      `query($id: ID!) { product(id: $id) { media(first: 30) {
         nodes { ... on MediaImage { id alt status image { url } } } } } }`,
      { id: pid }
    );
    const noder = d.product.media.nodes.filter((n) => n.id);
    if (noder.length >= antal && noder.every((n) => n.status === 'READY' || n.status === 'FAILED')) {
      const fel = noder.filter((n) => n.status === 'FAILED');
      if (fel.length) throw new Error(`media FAILED: ${fel.map((f) => f.alt).join(' · ')}`);
      return noder;
    }
    await sov(3000);
  }
  throw new Error(`media blev aldrig READY på ${pid}`);
}

// ---------------------------------------------------------------------------

const kommando = process.argv[2];
if (kommando === 'stage') { await stagea(process.argv[3]); process.exit(0); }

const land = kommando;
if (!['se', 'no', 'dk', 'fi', 'uk'].includes(land)) {
  console.error('Användning: node badshorts.mjs stage <land> | node badshorts.mjs <land>');
  process.exit(1);
}
const STAGED = JSON.parse(readFileSync(`${BAS}/staged-${land}.json`, 'utf8'));
const konfig = BUTIKER[land];
const sprak = konfig.sprak;
const HELTAL = new Set(['SEK', 'NOK', 'DKK']);

const butik = new Butik(land);
const shop = await butik.verifiera();
console.log(`✔ Rätt butik: ${shop.name} (${shop.currencyCode})`);
const kanaler = await butik.kanaler();
const { produkter } = await butik.inventera();

const t = T4.badshorts[sprak];
const pris = PRISER4.badshorts[land.toUpperCase()];
const jamfor = HELTAL.has(konfig.valuta)
  ? String(Math.round(parseFloat(pris) * 1.3))
  : (Math.round(parseFloat(pris) * 1.3 * 100) / 100).toFixed(2);

const bef = produkter.find((p) => p.skuer.some((s) => s.startsWith(SKU_BAS)));
if (bef) { console.log(`= finns redan: ${bef.titel} — avbryter`); process.exit(0); }

const media = MEDIA.map((m) => ({ originalSource: STAGED[m.fil], alt: altFor(m.roll, sprak, t), mediaContentType: 'IMAGE' }));
for (const m of MEDIA) if (!STAGED[m.fil]) throw new Error(`staged-URL saknas för ${m.fil} — kör stage först`);

const skapad = await butik.mutera(
  `mutation($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
     productCreate(product: $product, media: $media) {
       product { id title handle } userErrors { field message } } }`,
  {
    product: {
      title: t.titel, descriptionHtml: '', vendor: konfig.vendor, status: 'ACTIVE',
      templateSuffix: 'claudeprodukter', category: KATEGORI,
      productOptions: [
        { name: t.optionDesign, values: t.designer.map((v) => ({ name: v })) },
        { name: t.optionStorlek, values: STORLEKAR.map((v) => ({ name: v })) },
      ],
    },
    media,
  },
  'productCreate'
);
const pid = skapad.product.id;
console.log(`+ skapad: ${skapad.product.title} (${pid.split('/').pop()})`);

const variants = [];
t.designer.forEach((motiv, i) => {
  for (const strl of STORLEKAR) {
    variants.push({
      optionValues: [
        { optionName: t.optionDesign, name: motiv },
        { optionName: t.optionStorlek, name: strl },
      ],
      price: pris, compareAtPrice: jamfor, taxable: false, inventoryPolicy: 'CONTINUE',
      inventoryItem: { sku: `${SKU_BAS}${MOTIV_SUFFIX[i]}-${strl}`, tracked: false },
    });
  }
});
await butik.mutera(
  `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!, $strategy: ProductVariantsBulkCreateStrategy) {
     productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: $strategy) {
       userErrors { field message } } }`,
  { productId: pid, variants, strategy: 'REMOVE_STANDALONE_VARIANT' },
  'productVariantsBulkCreate'
);
console.log(`+ ${variants.length} varianter (${t.designer.length} motiv × ${STORLEKAR.length} storlekar)`);

const noder = await vantaMedia(butik, pid, MEDIA.length);
const bildAvRoll = {};
for (const m of MEDIA) {
  const alt = altFor(m.roll, sprak, t);
  const nod = noder.find((n) => n.alt === alt);
  if (!nod) throw new Error(`READY-bild saknas för "${alt}"`);
  bildAvRoll[m.roll] = { id: nod.id, url: nod.image.url, alt };
}
await butik.mutera(
  `mutation($product: ProductUpdateInput!) { productUpdate(product: $product) { product { id } userErrors { field message } } }`,
  { product: { id: pid, descriptionHtml: byggHtml(t, sprak, bildAvRoll) } },
  'productUpdate'
);

const dv = await butik.fraga(`query($id: ID!) { product(id: $id) { variants(first: 30) { nodes { id sku } } } }`, { id: pid });
const idAvSku = Object.fromEntries(dv.product.variants.nodes.map((v) => [v.sku, v.id]));
const variantMedia = [];
t.designer.forEach((_, i) => {
  for (const strl of STORLEKAR) {
    const vid = idAvSku[`${SKU_BAS}${MOTIV_SUFFIX[i]}-${strl}`];
    if (!vid) throw new Error(`variant saknas: ${MOTIV_SUFFIX[i]}-${strl}`);
    variantMedia.push({ variantId: vid, mediaIds: [bildAvRoll[MOTIV_BILD[i]].id] });
  }
});
await butik.mutera(
  `mutation($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
     productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
       userErrors { field message } } }`,
  { productId: pid, variantMedia },
  'productVariantAppendMedia'
);

await butik.mutera(
  `mutation($id: ID!, $input: [PublicationInput!]!) {
     publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
  { id: pid, input: kanaler.map((k) => ({ publicationId: k.id })) },
  'publishablePublish'
);

const url = `https://${shop.primaryDomain?.host}/products/${skapad.product.handle}`;
console.log(`✔ klar: ${url}  (${pris} ${konfig.valuta}, jmf ${jamfor})`);
