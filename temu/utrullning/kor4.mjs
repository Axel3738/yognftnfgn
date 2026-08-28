// Offert 4-skaparen (2026-08-25): 5 nya produkter → alla fem butikerna.
// (Badshortsen skapades 2026-08-28 via badshorts.mjs — den behöver två
// optioner (Motiv × Storlek), som den här enradsmaskin inte hanterar.)
//
//   node kor4.mjs stage <land>    # ladda upp landets bilder till staged storage
//   node kor4.mjs <land> [prod]   # land = se | no | dk | fi | uk
//
// ⚠️ LÄRDOM 2026-08-25: en staged-URL kan bara KONSUMERAS en gång — när en butik
// ingesterat filen är blobben borta. Därför stageas bilderna PER BUTIK
// (staged-<land>.json), aldrig delat mellan butiker.
//
// Bilderna stageas via SE-appens stagedUploadsCreate (kräver bara write_products —
// verifierat 2026-08-25) och resourceUrls är publikt läsbara, så samma URL:er
// används som originalSource i alla butiker. Jämförpris = pris × 1,3 sätts direkt
// vid skapandet (Axels schema). Kaching-fallbacken fångar produkterna automatiskt.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { Butik } from '../api.mjs';
import { BUTIKER } from '../butiker.mjs';
import { T4, GARANTI4, RUBRIKER4, PRISER4 } from './texter4.mjs';

const BAS = '/tmp/fix/offert4';

const sov = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Produktdefinitioner. b(fil) = originalfoto, k(fil) = genererad språkbild.
// ---------------------------------------------------------------------------

const PRODUKTER = {
  tankoverdrag: {
    sku: 'TEMU-601099590911868',
    kategori: 'gid://shopify/TaxonomyCategory/fr-16-1',
    media: (s) => [
      { roll: 'main', fil: 'tankoverdrag/tankoverdrag-01.jpg' },
      { roll: 'ute', fil: 'tankoverdrag/tankoverdrag-04.jpg' },
      { roll: 'matt', fil: s === 'en' ? 'tankoverdrag/tankoverdrag-03.jpg' : 'klart/matt-tankoverdrag.jpg' },
      { roll: 'forefter', fil: s === 'en' ? 'tankoverdrag/tankoverdrag-02.jpg' : `klart/forefter-tankoverdrag-${s}.jpg` },
      { roll: 'hog', fil: 'tankoverdrag/tankoverdrag-05.jpg' },
    ],
    htmlBilder: ['forefter', 'ute', 'matt'],
  },
  jattefotboll: {
    sku: 'TEMU-601101802223563',
    kategori: 'gid://shopify/TaxonomyCategory/tg-5-6-1',
    media: (s) => [
      { roll: 'main', fil: 'jattefotboll/jattefotboll-06.jpg' },
      { roll: 'familj', fil: 'jattefotboll/jattefotboll-01.jpeg' },
      { roll: 'matt', fil: s === 'en' ? 'jattefotboll/jattefotboll-02.jpeg' : 'klart/matt-jattefotboll.jpg' },
      { roll: 'strand', fil: 'jattefotboll/jattefotboll-07.jpeg' },
      { roll: 'detalj', fil: 'jattefotboll/jattefotboll-08.jpeg' },
      { roll: 'hund', fil: 'jattefotboll/jattefotboll-10.jpeg' },
    ],
    htmlBilder: ['familj', 'main', 'matt'],
  },
  benskydd: {
    sku: 'TEMU-601101617191068',
    kategori: 'gid://shopify/TaxonomyCategory/aa-7-2',
    media: (s) => [
      { roll: 'main', fil: 'benskydd/benskydd-08.jpg' },
      { roll: 'orange', fil: 'benskydd/benskydd-09.jpg' },
      { roll: 'matt', fil: s === 'en' ? 'benskydd/benskydd-03.jpg' : `klart/matt-benskydd-${s}.jpg` },
      { roll: 'spanne', fil: s === 'en' ? 'benskydd/benskydd-05.jpeg' : `klart/spanne-benskydd-${s}.jpg` },
      { roll: 'karborre', fil: s === 'en' ? 'benskydd/benskydd-04.jpeg' : `klart/karborre-benskydd-${s}.jpg` },
    ],
    htmlBilder: ['main', 'spanne', 'matt'],
    // suffix + variantbildroll per värde i t.varden (null = ingen bild)
    varianter: [['-GU', null], ['-NG', null], ['-OR', 'orange']],
  },
  gravstenspenna: {
    sku: 'TEMU-605790790325172',
    kategori: 'gid://shopify/TaxonomyCategory/os-11-11-4-2',
    media: (s) => [
      { roll: 'main', fil: s === 'en' ? 'gravstenspenna/gravstenspenna-01.jpeg' : `klart/vattentat-gravstenspenna-${s}.jpg` },
      { roll: 'forefter', fil: s === 'en' ? 'gravstenspenna/gravstenspenna-02.jpeg' : `klart/forefter-gravstenspenna-${s}.jpg` },
      { roll: 'matt', fil: s === 'en' ? 'gravstenspenna/gravstenspenna-08.jpeg' : 'klart/matt-gravstenspenna.jpg' },
      { roll: 'guld', fil: 'gravstenspenna/gravstenspenna-09.jpeg' },
      { roll: 'silver', fil: 'gravstenspenna/gravstenspenna-10.jpeg' },
      { roll: 'svart', fil: 'gravstenspenna/gravstenspenna-11.jpeg' },
      { roll: 'vit', fil: 'gravstenspenna/gravstenspenna-12.jpeg' },
      { roll: 'rod', fil: 'gravstenspenna/gravstenspenna-13.jpeg' },
    ],
    htmlBilder: ['forefter', 'main', 'matt'],
    varianter: [['-GD', 'guld'], ['-SV', 'svart'], ['-VI', 'vit'], ['-SI', 'silver'], ['-RO', 'rod'], ['-BL', null]],
  },
  kamouflagetejp: {
    sku: 'TEMU-601105076226732',
    kategori: 'gid://shopify/TaxonomyCategory/sg-4-9-3-12',
    media: (s) => [
      { roll: 'main', fil: s === 'en' ? 'kamouflagetejp/kamouflagetejp-01.jpg' : `klart/tejp-monster1-${s}.jpg` },
      { roll: 'anv', fil: 'kamouflagetejp/kamouflagetejp-06.jpg' },
      { roll: 'matt', fil: s === 'en' ? 'kamouflagetejp/kamouflagetejp-05.jpg' : 'klart/matt-kamouflagetejp.jpg' },
      { roll: 'm2', fil: s === 'en' ? 'kamouflagetejp/kamouflagetejp-02.jpg' : `klart/tejp-monster2-${s}.jpg` },
      { roll: 'm3', fil: s === 'en' ? 'kamouflagetejp/kamouflagetejp-03.jpg' : `klart/tejp-monster3-${s}.jpg` },
      { roll: 'm4', fil: s === 'en' ? 'kamouflagetejp/kamouflagetejp-07.jpg' : `klart/tejp-monster4-${s}.jpg` },
    ],
    htmlBilder: ['anv', 'main', 'matt'],
    varianter: [['-JU', 'main'], ['-AC', 'm2'], ['-SN', 'm3'], ['-OK', 'm4']],
    monsterAlt: ['m1', 'm2', 'm3', 'm4'], // alt-nycklar för mönsterbilderna
  },
};

// Alt-text för en roll: t.alt[roll], med tejpens main → alt.m1.
function altFor(nyckel, roll, t) {
  if (nyckel === 'kamouflagetejp' && roll === 'main') return t.alt.m1;
  const a = t.alt[roll];
  if (!a) throw new Error(`alt saknas: ${nyckel}/${roll}`);
  return a;
}

// ---------------------------------------------------------------------------
// stage: ladda upp alla unika filer en gång, spara namn → resourceUrl.
// ---------------------------------------------------------------------------

async function stagea(land) {
  const sprak = BUTIKER[land].sprak;
  const filer = new Set();
  for (const def of Object.values(PRODUKTER)) {
    for (const m of def.media(sprak)) filer.add(m.fil);
  }
  const lista = [...filer];
  const STAGED_FIL = `${BAS}/staged-${land}.json`;
  console.log(`${lista.length} bilder att stagea för ${land}`);
  const butik = new Butik(land);
  await butik.verifiera();
  const karta = existsSync(STAGED_FIL) ? JSON.parse(readFileSync(STAGED_FIL, 'utf8')) : {};
  for (let i = 0; i < lista.length; i += 8) {
    const grupp = lista.slice(i, i + 8).filter((f) => !karta[f]);
    if (!grupp.length) continue;
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
  }
  console.log(`Sparade ${STAGED_FIL}`);
}

// ---------------------------------------------------------------------------
// Skapa i en butik
// ---------------------------------------------------------------------------

function byggHtml(t, sprak, bildAvRoll, roller) {
  const r = RUBRIKER4[sprak];
  const img = (roll, forsta) => {
    const b = bildAvRoll[roll];
    const stil = `max-width:100%;height:auto${forsta ? ';border-radius:8px' : ''}`;
    return `<p><img src="${b.url}" alt="${b.alt}" loading="lazy" style="${stil}"></p>`;
  };
  return (
    `<h3>${t.problemH}</h3><p>${t.problemP}</p>` + img(roller[0], true) +
    `<h3>${t.losningH}</h3><p>${t.losningP}</p>` + img(roller[1], false) +
    `<h3>${r.funktioner}</h3><ul>\n` +
    t.bullets.map((b) => `<li>\n${b}</li>`).join('\n') +
    `\n</ul>` + img(roller[2], false) +
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

const kommando = process.argv[2];
if (kommando === 'stage') {
  await stagea(process.argv[3]);
  process.exit(0);
}

const land = kommando;
const bara = process.argv[3] || null;
if (!['se', 'no', 'dk', 'fi', 'uk'].includes(land)) {
  console.error('Användning: node kor4.mjs stage | node kor4.mjs <se|no|dk|fi|uk> [produkt]');
  process.exit(1);
}
const STAGED = JSON.parse(readFileSync(`${BAS}/staged-${land}.json`, 'utf8'));
const konfig = BUTIKER[land];
const sprak = konfig.sprak; // sv | no | da | fi | en
const PRISKOL = land.toUpperCase();
const HELTAL = new Set(['SEK', 'NOK', 'DKK']);

const butik = new Butik(land);
const shop = await butik.verifiera();
console.log(`✔ Rätt butik: ${shop.name} (${shop.currencyCode})`);
const kanaler = await butik.kanaler();
const kanalInput = kanaler.map((k) => ({ publicationId: k.id }));
const { produkter } = await butik.inventera();
const resultat = {};

for (const [nyckel, def] of Object.entries(PRODUKTER)) {
  if (bara && nyckel !== bara) continue;
  const t = T4[nyckel][sprak];
  const pris = PRISER4[nyckel][PRISKOL];
  const jamfor = HELTAL.has(konfig.valuta)
    ? String(Math.round(parseFloat(pris) * 1.3))
    : (Math.round(parseFloat(pris) * 1.3 * 100) / 100).toFixed(2);

  console.log(`\n── ${nyckel} ──`);
  try {
    const bef = produkter.find((p) => p.skuer.some((s) => s.startsWith(def.sku)));
    if (bef) { console.log(`  = finns redan: ${bef.titel} — hoppar över`); resultat[nyckel] = { id: bef.id, handle: bef.handle, hoppad: true }; continue; }

    const mediaDef = def.media(sprak);
    const media = mediaDef.map((m) => ({ originalSource: STAGED[m.fil], alt: altFor(nyckel, m.roll, t), mediaContentType: 'IMAGE' }));
    const varDefs = def.varianter || null;
    const productOptions = varDefs
      ? [{ name: t.option, values: t.varden.map((v) => ({ name: v })) }]
      : undefined;

    const skapad = await butik.mutera(
      `mutation($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
         productCreate(product: $product, media: $media) {
           product { id title handle } userErrors { field message } } }`,
      { product: { title: t.titel, descriptionHtml: '', vendor: konfig.vendor, status: 'ACTIVE', templateSuffix: 'claudeprodukter', category: def.kategori, ...(productOptions ? { productOptions } : {}) }, media },
      'productCreate'
    );
    const pid = skapad.product.id;
    console.log(`  + skapad: ${skapad.product.title} (${pid.split('/').pop()})`);

    const variants = varDefs
      ? varDefs.map(([suffix], i) => ({
          optionValues: [{ optionName: t.option, name: t.varden[i] }],
          price: pris, compareAtPrice: jamfor, taxable: false, inventoryPolicy: 'CONTINUE',
          inventoryItem: { sku: def.sku + suffix, tracked: false },
        }))
      : [{ price: pris, compareAtPrice: jamfor, taxable: false, inventoryPolicy: 'CONTINUE', inventoryItem: { sku: def.sku, tracked: false } }];
    await butik.mutera(
      `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!, $strategy: ProductVariantsBulkCreateStrategy) {
         productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: $strategy) {
           userErrors { field message } } }`,
      { productId: pid, variants, strategy: 'REMOVE_STANDALONE_VARIANT' },
      'productVariantsBulkCreate'
    );

    const noder = await vantaMedia(butik, pid, mediaDef.length);
    const bildAvRoll = {};
    for (const m of mediaDef) {
      const alt = altFor(nyckel, m.roll, t);
      const nod = noder.find((n) => n.alt === alt);
      if (!nod) throw new Error(`READY-bild saknas för "${alt}"`);
      bildAvRoll[m.roll] = { id: nod.id, url: nod.image.url, alt };
    }
    await butik.mutera(
      `mutation($product: ProductUpdateInput!) { productUpdate(product: $product) { product { id } userErrors { field message } } }`,
      { product: { id: pid, descriptionHtml: byggHtml(t, sprak, bildAvRoll, def.htmlBilder) } },
      'productUpdate'
    );

    if (varDefs && varDefs.some(([, roll]) => roll)) {
      const dv = await butik.fraga(`query($id: ID!) { product(id: $id) { variants(first: 30) { nodes { id sku } } } }`, { id: pid });
      const idAvSku = Object.fromEntries(dv.product.variants.nodes.map((v) => [v.sku, v.id]));
      const variantMedia = varDefs
        .filter(([, roll]) => roll)
        .map(([suffix, roll]) => ({ variantId: idAvSku[def.sku + suffix], mediaIds: [bildAvRoll[roll].id] }));
      await butik.mutera(
        `mutation($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
           productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
             userErrors { field message } } }`,
        { productId: pid, variantMedia },
        'productVariantAppendMedia'
      );
    }

    await butik.mutera(
      `mutation($id: ID!, $input: [PublicationInput!]!) {
         publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
      { id: pid, input: kanalInput },
      'publishablePublish'
    );

    resultat[nyckel] = { id: pid, handle: skapad.product.handle, titel: skapad.product.title, pris, jamfor };
    resultat[nyckel].url = `https://${shop.primaryDomain?.host}/products/${skapad.product.handle}`;
    console.log(`  ✔ klar: ${resultat[nyckel].url}  (${pris} ${konfig.valuta}, jmf ${jamfor})`);
  } catch (e) {
    resultat[nyckel] = { fel: e.message };
    console.error(`  ✖ FEL på ${nyckel}: ${e.message}`);
  }
}

writeFileSync(`${BAS}/skapade-${land}.json`, JSON.stringify(resultat, null, 1));
const fel = Object.entries(resultat).filter(([, v]) => v.fel);
if (fel.length) { console.error(`${fel.length} produkter felade`); process.exit(1); }
