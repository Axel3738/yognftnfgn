// Batch 5-skaparen (2026-08-28): 14 produkter → alla fem butikerna.
//
//   node kor5.mjs stage <land>    # stagea landets bilder (staged5-<land>.json)
//   node kor5.mjs <land> [prod]   # skapa (se|no|dk|fi|uk)
//
// Skillnader mot kor4: flexibelt antal beskrivningsbilder (1–3), variantbilder
// per option-värde, per-variant-priser (magnetplattorna: 46/60 delar kostar
// olika), och mimeType per filändelse (offertens inbäddade bilder är PNG).
// Staged-URL:er konsumeras EN gång → stagea alltid PER butik.
//
// Bildkällor: CWD-offertens inbäddade bilder (/tmp/fix/batch5-media/xl/media/)
// + Temu-länkarnas top_gallery_url (nedladdade till /tmp/fix/batch5-galleri/).
// Bilder med fel räkneord (48/68pcs, 111pcs) eller kinesisk text används inte.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { Butik } from '../api.mjs';
import { BUTIKER } from '../butiker.mjs';
import { GARANTI4, RUBRIKER4 } from './texter4.mjs';
import { T5_SV } from './texter5.mjs';

const BAS = '/tmp/fix';
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// PRISER5[nyckel] = { SE, NO, DK, FI, UK } — eller en array per option-värde.
// Räknade 2026-08-28 ur CWD-offerten med 3×-regeln + låsta FX + lokala prispunkter.
// ---------------------------------------------------------------------------

export const PRISER5 = {
  arbetslampa: { SE: 439, NO: 339, DK: 299, FI: 41.9, UK: 18.99 },
  diskstall: { SE: 739, NO: 789, DK: 549, FI: 100.9, UK: 52.99 },
  bankhylla: { SE: 849, NO: 939, DK: 639, FI: 118.9, UK: 55.99 },
  luffarschack: { SE: 259, NO: 189, DK: 199, FI: 27.9, UK: 11.99 },
  glasspints: { SE: 499, NO: 449, DK: 379, FI: 56.9, UK: 29.99 },
  kastfanga: { SE: 419, NO: 359, DK: 309, FI: 47.9, UK: 22.99 },
  magnetplattor: [
    { SE: 469, NO: 409, DK: 349, FI: 49.9, UK: 23.99 }, // 46 delar
    { SE: 539, NO: 469, DK: 399, FI: 56.9, UK: 27.99 }, // 60 delar
  ],
  mcvaska: { SE: 989, NO: 1049, DK: 729, FI: 123.9, UK: 66.99 },
  somnadskit: { SE: 329, NO: 269, DK: 269, FI: 36.9, UK: 16.99 },
  reseask: { SE: 289, NO: 219, DK: 229, FI: 30.9, UK: 14.99 },
  veckodosett: { SE: 389, NO: 319, DK: 289, FI: 42.9, UK: 20.99 },
  sandbild: { SE: 459, NO: 399, DK: 349, FI: 49.9, UK: 23.99 },
  dysonborste: { SE: 539, NO: 479, DK: 399, FI: 59.9, UK: 31.99 },
  magnethylla: { SE: 439, NO: 379, DK: 329, FI: 46.9, UK: 20.99 },
};

const G = (f) => `batch5-galleri/${f}`;
const M = (f) => `batch5-media/xl/media/${f}`;

const PRODUKTER = {
  arbetslampa: {
    sku: 'TEMU-605988157507785',
    kategori: 'gid://shopify/TaxonomyCategory/ha-15-79',
    media: [{ roll: 'main', fil: G('rad5.jpg') }, { roll: 'b2', fil: M('image2.png') }],
    suffixar: ['-BL', '-GU', '-RO'], variantBild: ['main', null, null],
  },
  diskstall: {
    sku: 'TEMU-601100495932584',
    kategori: 'gid://shopify/TaxonomyCategory/hg-11-8-22',
    media: [{ roll: 'main', fil: G('rad9.jpg') }, { roll: 'b2', fil: M('image29.png') }],
    suffixar: ['-SV', '-VI'], variantBild: ['main', null],
  },
  bankhylla: {
    sku: 'TEMU-606593194260136',
    kategori: 'gid://shopify/TaxonomyCategory/hg-11-8-41',
    media: [{ roll: 'main', fil: G('rad13.jpg') }, { roll: 'b2', fil: M('image20.png') }, { roll: 'b3', fil: M('image17.png') }],
    suffixar: ['-SV', '-VI'], variantBild: ['main', null],
  },
  luffarschack: {
    sku: 'TEMU-601101920237436',
    kategori: 'gid://shopify/TaxonomyCategory/tg-2-5',
    media: [{ roll: 'main', fil: G('rad17.jpg') }, { roll: 'b2', fil: M('image21.png') }],
  },
  glasspints: {
    sku: 'TEMU-606152708439387',
    kategori: 'gid://shopify/TaxonomyCategory/hg-11-6-14',
    media: [{ roll: 'main', fil: G('rad21.jpg') }, { roll: 'b2', fil: M('image34.png') }],
  },
  kastfanga: {
    sku: 'TEMU-601105338361446',
    kategori: 'gid://shopify/TaxonomyCategory/sg-4-14',
    media: [{ roll: 'main', fil: G('rad25.jpg') }, { roll: 'b2', fil: M('image24.png') }],
  },
  magnetplattor: {
    sku: 'TEMU-601099555317731',
    kategori: 'gid://shopify/TaxonomyCategory/tg-5-7-8',
    media: [{ roll: 'main', fil: G('rad29.jpg') }, { roll: 'b2', fil: M('image22.png') }],
    suffixar: ['-46', '-60'], variantBild: [null, null],
  },
  mcvaska: {
    sku: 'TEMU-601099525417124',
    kategori: 'gid://shopify/TaxonomyCategory/vp-1-7-6',
    media: [{ roll: 'main', fil: G('rad33.jpg') }, { roll: 'b2', fil: M('image5.png') }],
  },
  somnadskit: {
    sku: 'TEMU-601100056763025',
    kategori: 'gid://shopify/TaxonomyCategory/ae-2-1-5-2-3',
    media: [{ roll: 'main', fil: G('rad37.jpg') }],
  },
  reseask: {
    sku: 'TEMU-601099583478869',
    kategori: 'gid://shopify/TaxonomyCategory/hb-1-19',
    media: [{ roll: 'main', fil: G('rad41.jpg') }, { roll: 'b2', fil: M('image4.png') }],
    suffixar: ['-VI', '-GR'], variantBild: ['main', 'b2'],
  },
  veckodosett: {
    sku: 'TEMU-606321420111309',
    kategori: 'gid://shopify/TaxonomyCategory/hb-1-19',
    media: [{ roll: 'main', fil: G('rad45.jpg') }, { roll: 'b2', fil: M('image30.png') }],
  },
  sandbild: {
    sku: 'TEMU-601099652857203',
    kategori: 'gid://shopify/TaxonomyCategory/hg-3-41',
    media: [{ roll: 'main', fil: G('rad53.jpg') }, { roll: 'b2', fil: M('image33.png') }, { roll: 'b3', fil: M('image10.png') }],
    suffixar: ['-RO', '-BA'], variantBild: ['main', 'b3'],
  },
  dysonborste: {
    sku: 'TEMU-601099915330362',
    kategori: 'gid://shopify/TaxonomyCategory/hg-8-11',
    media: [{ roll: 'main', fil: G('rad57.jpg') }, { roll: 'b2', fil: M('image13.png') }],
  },
  magnethylla: {
    sku: 'TEMU-601099921451643',
    kategori: 'gid://shopify/TaxonomyCategory/hg-11-6-24-7',
    media: [{ roll: 'main', fil: G('rad65.jpg') }, { roll: 'b2', fil: M('image27.png') }],
    suffixar: ['-SV', '-VI'], variantBild: ['main', 'b2'],
  },
};

async function laddaTexter(sprak) {
  if (sprak === 'sv') return T5_SV;
  const namn = { no: 'T5_NO', da: 'T5_DA', fi: 'T5_FI', en: 'T5_EN' }[sprak];
  const mod = await import(`./texter5-${sprak}.mjs`);
  return mod[namn];
}

function mime(fil) {
  return fil.endsWith('.png') ? 'image/png' : 'image/jpeg';
}

async function stagea(land) {
  const STAGED_FIL = `${BAS}/staged5-${land}.json`;
  const butik = new Butik(land);
  await butik.verifiera();
  const karta = existsSync(STAGED_FIL) ? JSON.parse(readFileSync(STAGED_FIL, 'utf8')) : {};
  const filer = [...new Set(Object.values(PRODUKTER).flatMap((d) => d.media.map((m) => m.fil)))].filter((f) => !karta[f]);
  console.log(`${filer.length} bilder att stagea för ${land}`);
  for (let i = 0; i < filer.length; i += 8) {
    const grupp = filer.slice(i, i + 8);
    const d = await butik.mutera(
      `mutation($input: [StagedUploadInput!]!) {
         stagedUploadsCreate(input: $input) {
           stagedTargets { url resourceUrl parameters { name value } }
           userErrors { field message } } }`,
      { input: grupp.map((f) => ({ filename: f.replaceAll('/', '-'), mimeType: mime(f), resource: 'IMAGE', httpMethod: 'PUT' })) },
      'stagedUploadsCreate'
    );
    for (let j = 0; j < grupp.length; j++) {
      const t = d.stagedTargets[j];
      const svar = await fetch(t.url, { method: 'PUT', headers: Object.fromEntries(t.parameters.map((p) => [p.name, p.value])), body: readFileSync(`${BAS}/${grupp[j]}`) });
      if (!svar.ok) throw new Error(`PUT ${grupp[j]} → ${svar.status}`);
      karta[grupp[j]] = t.resourceUrl;
      console.log(`  ✔ ${grupp[j]}`);
    }
    writeFileSync(STAGED_FIL, JSON.stringify(karta, null, 1));
  }
  console.log(`Sparade ${STAGED_FIL}`);
}

function byggHtml(t, sprak, bildAvRoll, def) {
  const r = RUBRIKER4[sprak];
  const roller = def.media.map((m) => m.roll).slice(0, 3);
  const img = (i, forsta) => {
    if (!roller[i]) return '';
    const b = bildAvRoll[roller[i]];
    const stil = `max-width:100%;height:auto${forsta ? ';border-radius:8px' : ''}`;
    return `<p><img src="${b.url}" alt="${b.alt}" loading="lazy" style="${stil}"></p>`;
  };
  return (
    `<h3>${t.problemH}</h3><p>${t.problemP}</p>` + img(0, true) +
    `<h3>${t.losningH}</h3><p>${t.losningP}</p>` + img(1, false) +
    `<h3>${r.funktioner}</h3><ul>\n` +
    t.bullets.map((b) => `<li>\n${b}</li>`).join('\n') +
    `\n</ul>` + img(2, false) +
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

const fmt = (v) => v.toFixed(2);

const kommando = process.argv[2];
if (kommando === 'stage') { await stagea(process.argv[3]); process.exit(0); }

const land = kommando;
const bara = process.argv[3] || null;
if (!['se', 'no', 'dk', 'fi', 'uk'].includes(land)) {
  console.error('Användning: node kor5.mjs stage <land> | node kor5.mjs <land> [produkt]');
  process.exit(1);
}
const STAGED = JSON.parse(readFileSync(`${BAS}/staged5-${land}.json`, 'utf8'));
const konfig = BUTIKER[land];
const sprak = konfig.sprak;
const TEXTER = await laddaTexter(sprak);
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
  const t = TEXTER[nyckel];
  if (!t) { console.error(`  ✖ text saknas för ${nyckel}/${sprak}`); resultat[nyckel] = { fel: 'text saknas' }; continue; }
  console.log(`\n── ${nyckel} ──`);
  try {
    const bef = produkter.find((p) => p.skuer.some((s) => s.startsWith(def.sku)));
    if (bef) { console.log(`  = finns redan — hoppar över`); resultat[nyckel] = { id: bef.id, hoppad: true }; continue; }

    const prisAv = (i) => {
      const rad = Array.isArray(PRISER5[nyckel]) ? PRISER5[nyckel][i] : PRISER5[nyckel];
      const p = rad[PRISKOL];
      const j = HELTAL.has(konfig.valuta) ? Math.round(p * 1.3) : Math.round(p * 1.3 * 100) / 100;
      return { pris: fmt(p), jamfor: fmt(j) };
    };

    const media = def.media.map((m) => ({ originalSource: STAGED[m.fil], alt: t.alt[m.roll], mediaContentType: 'IMAGE' }));
    for (const m of def.media) {
      if (!STAGED[m.fil]) throw new Error(`staged saknas: ${m.fil}`);
      if (!t.alt[m.roll]) throw new Error(`alt saknas: ${nyckel}/${m.roll}/${sprak}`);
    }

    const harOption = !!def.suffixar;
    const skapad = await butik.mutera(
      `mutation($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
         productCreate(product: $product, media: $media) {
           product { id title handle } userErrors { field message } } }`,
      {
        product: {
          title: t.titel, descriptionHtml: '', vendor: konfig.vendor, status: 'ACTIVE',
          templateSuffix: 'claudeprodukter', category: def.kategori,
          ...(harOption ? { productOptions: [{ name: t.option, values: t.varden.map((v) => ({ name: v })) }] } : {}),
        },
        media,
      },
      'productCreate'
    );
    const pid = skapad.product.id;
    console.log(`  + skapad: ${skapad.product.title} (${pid.split('/').pop()})`);

    const variants = harOption
      ? def.suffixar.map((suffix, i) => {
          const { pris, jamfor } = prisAv(i);
          return {
            optionValues: [{ optionName: t.option, name: t.varden[i] }],
            price: pris, compareAtPrice: jamfor, taxable: false, inventoryPolicy: 'CONTINUE',
            inventoryItem: { sku: def.sku + suffix, tracked: false },
          };
        })
      : [(() => { const { pris, jamfor } = prisAv(0); return { price: pris, compareAtPrice: jamfor, taxable: false, inventoryPolicy: 'CONTINUE', inventoryItem: { sku: def.sku, tracked: false } }; })()];
    await butik.mutera(
      `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!, $strategy: ProductVariantsBulkCreateStrategy) {
         productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: $strategy) {
           userErrors { field message } } }`,
      { productId: pid, variants, strategy: 'REMOVE_STANDALONE_VARIANT' },
      'productVariantsBulkCreate'
    );

    const noder = await vantaMedia(butik, pid, def.media.length);
    const bildAvRoll = {};
    for (const m of def.media) {
      const nod = noder.find((n) => n.alt === t.alt[m.roll]);
      if (!nod) throw new Error(`READY-bild saknas för "${t.alt[m.roll]}"`);
      bildAvRoll[m.roll] = { id: nod.id, url: nod.image.url, alt: t.alt[m.roll] };
    }
    await butik.mutera(
      `mutation($product: ProductUpdateInput!) { productUpdate(product: $product) { product { id } userErrors { field message } } }`,
      { product: { id: pid, descriptionHtml: byggHtml(t, sprak, bildAvRoll, def) } },
      'productUpdate'
    );

    if (harOption && def.variantBild && def.variantBild.some(Boolean)) {
      const dv = await butik.fraga(`query($id: ID!) { product(id: $id) { variants(first: 30) { nodes { id sku } } } }`, { id: pid });
      const idAvSku = Object.fromEntries(dv.product.variants.nodes.map((v) => [v.sku, v.id]));
      const variantMedia = def.suffixar
        .map((suffix, i) => ({ suffix, roll: def.variantBild[i] }))
        .filter((x) => x.roll)
        .map((x) => ({ variantId: idAvSku[def.sku + x.suffix], mediaIds: [bildAvRoll[x.roll].id] }));
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

    const { pris, jamfor } = prisAv(0);
    resultat[nyckel] = { id: pid, handle: skapad.product.handle, url: `https://${shop.primaryDomain?.host}/products/${skapad.product.handle}` };
    console.log(`  ✔ klar: ${resultat[nyckel].url}  (${pris} ${konfig.valuta}, jmf ${jamfor})`);
  } catch (e) {
    resultat[nyckel] = { fel: e.message };
    console.error(`  ✖ FEL på ${nyckel}: ${e.message}`);
  }
}

writeFileSync(`${BAS}/skapade5-${land}.json`, JSON.stringify(resultat, null, 1));
const fel = Object.entries(resultat).filter(([, v]) => v.fel);
console.log(`\n${Object.keys(resultat).length - fel.length} OK, ${fel.length} fel`);
if (fel.length) process.exit(1);
