// Utrullning av de 8 ramverksprodukterna till NO/DK/FI/UK. 2026-08-22.
//
//   node kor.mjs <land> [produkt]     land = no | dk | fi | uk
//
// Speglar SE-butikens färdiga sidor exakt: samma bildordning, samma
// 7-blocksstruktur, lokala texter ur texter.mjs, priser ur PRISER
// (3×(landad kostnad + 2,9 €) i EU, 3×landad i NO/UK — låsta 2026-08-22).
//
// Tre vägar per produkt:
//   SKAPA      — produkten saknas i butiken (allt i NO utom mc/dorr/kran/plysch,
//                batmotor överallt)
//   ERSÄTT     — gammal felaktig produkt raderas och skapas om rent
//                (pingis låg som gammal tränare, bollpannband som boxningsprodukt)
//   UPPDATERA  — produkten finns: ny copy, nya bilder, nytt pris, mall, kanaler
//
// Språkbilderna (måttbilder/infografiker) ligger på Shopifys staged storage —
// engångs-URL:er ur /tmp/fix/staged-sprak.json (genererade samma dag).
// Alla övriga bilder hämtas från svenska CDN:en (se-bilder.json) — Shopify
// kopierar dem till landets egen CDN vid uppladdning.

import { readFileSync, writeFileSync } from 'node:fs';
import { Butik } from '../api.mjs';
import { BUTIKER } from '../butiker.mjs';
import { T, GARANTI, PRISER, HKSTORLEKAR, HKSKU, SKOSTORLEKAR } from './texter.mjs';

const SE = JSON.parse(readFileSync(new URL('./se-bilder.json', import.meta.url)));
const STAGED = JSON.parse(readFileSync('/tmp/fix/staged-sprak.json', 'utf8'));

const sov = (ms) => new Promise((r) => setTimeout(r, ms));

/** Staged språkbild för en roll. UK använder engelska original (uk-prefix). */
function sprakbild(sprak, roll) {
  if (roll === 'pingis-1' || roll === 'pingis-2') {
    return STAGED[`pingis-info-${roll.slice(-1)}-${sprak}`];
  }
  if (roll === 'batmotor-tabell') return STAGED[`${sprak}-batmotor-tabell`];
  const pre = sprak === 'en' ? 'uk' : sprak;
  return STAGED[`${pre}-${roll}`];
}

/** Handle ur titel: gemener, nordiska tecken translittererade, bindestreck. */
function handleAv(titel) {
  return titel
    .toLowerCase()
    .replace(/[åä]/g, 'a').replace(/[öø]/g, 'o').replace(/æ/g, 'ae')
    .replace(/×/g, 'x').replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const RUBRIKER = {
  no: { funktioner: 'Funksjoner', garanti: 'Vår garanti' },
  da: { funktioner: 'Funktioner', garanti: 'Vores garanti' },
  fi: { funktioner: 'Ominaisuudet', garanti: 'Takuumme' },
  en: { funktioner: 'Features', garanti: 'Our guarantee' },
};

// ---------------------------------------------------------------------------
// Produktdefinitionerna. Bildordning och html-bildplacering speglar SE exakt.
// ---------------------------------------------------------------------------

const PRODUKTER = {
  pingis: {
    skuPrefix: ['TEMU-605778962427277', 'TEMU-601099969009037'],
    skuNy: 'TEMU-605778962427277',
    kategori: 'gid://shopify/TaxonomyCategory/sg-3-6',
    ersatt: true, // utlandsbutikerna har kvar gamla tränarprodukten (fel goods)
    media: (s) => [
      { roll: 'main', url: SE['cf861360-b6dc-45a0-87c4-d26602695d39.jpg'] },
      { roll: 'svart', url: SE['temu3-pingnat-svart.jpg'] },
      { roll: 'orange', url: SE['temu3-pingnat-orange.jpg'] },
      { roll: 'info1', url: sprakbild(s, 'pingis-1') },
      { roll: 'info2', url: sprakbild(s, 'pingis-2') },
    ],
    htmlBilder: ['info1', 'svart', 'info2'],
    varianter: (t) => [
      { suffix: '-SV', val: t.varden[0], bild: 'svart' },
      { suffix: '-OR', val: t.varden[1], bild: 'orange' },
    ],
  },

  kangor: {
    skuPrefix: ['TEMU-601099705910254'],
    skuNy: 'TEMU-601099705910254',
    kategori: 'gid://shopify/TaxonomyCategory/aa-8',
    nyHandle: true, // gamla handlarna säger "sneakers"/"trainers" — fel produkttyp
    media: () => [
      { roll: 'main', url: SE['vandringskangor-herr.jpg'] },
      { roll: 'gaende', url: SE['vandringskangor-gaende.png'] },
      { roll: 'miljo', url: SE['vandringskangor-miljo-1x1.png'] },
    ],
    htmlBilder: ['gaende', 'main', 'miljo'],
    varianter: () => SKOSTORLEKAR.map((n) => ({ suffix: `-${n}`, val: n })),
  },

  bollpannband: {
    skuPrefix: ['TEMU-601100409294093'],
    skuNy: 'TEMU-601100409294093',
    kategori: 'gid://shopify/TaxonomyCategory/sg-1-4-2',
    ersatt: true, // låg som boxningsprodukt med 1 variant utan färg
    media: () => [
      { roll: 'main', url: SE['21f347ce-1e2d-44da-acb6-f293b043dbf0.jpg'] },
      { roll: 'produkt', url: SE['boxboll-produkt.jpg'] },
      { roll: 'detalj', url: SE['boxboll-detalj.jpg'] },
      { roll: 'kvall', url: SE['bollpannband-spelkvall.png'] },
    ],
    htmlBilder: ['kvall', 'produkt', 'detalj'],
    varianter: (t) => [
      { suffix: '-SV', val: t.varden[0], bild: 'produkt' },
      { suffix: '-RO', val: t.varden[1], bild: 'detalj' },
    ],
  },

  batmotor: {
    skuPrefix: ['TEMU-605748427852371'],
    skuNy: 'TEMU-605748427852371',
    kategori: 'gid://shopify/TaxonomyCategory/vp-1-5-3-6',
    media: (s) => [
      { roll: 'main', url: SE['batmotorskydd-svart.jpg'] },
      { roll: 'pabat', url: SE['batmotor-pa-bat.jpg'] },
      { roll: 'tabell', url: sprakbild(s, 'batmotor-tabell') },
      { roll: 'vinter', url: SE['batmotorskydd-vinter-tackt.jpg'] },
    ],
    htmlBilder: ['vinter', 'pabat', 'tabell'],
    varianter: (t) => HKSTORLEKAR.map((n, i) => ({ suffix: `-${HKSKU[i]}`, val: `${n} ${t.hk}` })),
  },

  mc: {
    skuPrefix: ['TEMU-601102992953649'],
    behallVarianter: true, // 6 färgvarianter finns redan med lokala namn
    media: (s) => [
      { roll: 'main', url: SE['temu3-mc-kapell-1.jpg'] },
      { roll: 'studio', url: SE['mc-studio.jpg'] },
      { roll: 'regn', url: SE['mc-regn.jpg'] },
      { roll: 'matt', url: sprakbild(s, 'mc-matt') },
      { roll: 'resar', url: SE['mc-resar.jpg'] },
    ],
    htmlBilder: ['regn', 'main', 'matt'],
  },

  dorr: {
    skuPrefix: ['TEMU-601099515911841'],
    behallVarianter: true,
    media: (s) => [
      { roll: 'huvud', url: SE['dorrlist-huvud.jpg'] },
      { roll: 'padorr', url: SE['dorrlist-pa-dorr.jpg'] },
      { roll: 'matt', url: sprakbild(s, 'dorrlist-matt') },
      { roll: 'rulle', url: SE['dorrlist-rulle.jpg'] },
      { roll: 'klipp', url: SE['dorrlist-klippbar.jpg'] },
      { roll: 'skum', url: SE['dorrlist-skum.jpg'] },
    ],
    htmlBilder: ['padorr', 'klipp', 'matt'],
  },

  kran: {
    skuPrefix: ['TEMU-601101411598143'],
    behallVarianter: true,
    media: (s) => [
      { roll: 'main', url: SE['temu3-kranskydd-1.jpg'] },
      { roll: 'pakran', url: SE['kranskydd-pa-kran.jpg'] },
      { roll: 'matt', url: sprakbild(s, 'kranskydd-matt') },
      { roll: 'studio', url: SE['kranskydd-studio.jpg'] },
    ],
    htmlBilder: ['pakran', 'main', 'matt'],
  },

  plysch: {
    skuPrefix: ['TEMU-601102047663138'],
    behallVarianter: true,
    media: (s) => [
      { roll: 'main', url: SE['temu3-plyschtofflor-1.jpg'] },
      { roll: 'studio', url: SE['plysch-studio.jpg'] },
      { roll: 'memory', url: sprakbild(s, 'plysch-memory') },
      { roll: 'anv', url: SE['plysch-anvandning.jpg'] },
      { roll: 'anv2', url: SE['plysch-anvandning-2.jpg'] },
    ],
    htmlBilder: ['anv', 'main', 'memory'],
  },
};

// ---------------------------------------------------------------------------
// GraphQL-byggstenar
// ---------------------------------------------------------------------------

const M_PRODUCT_UPDATE = `mutation($product: ProductUpdateInput!, $media: [CreateMediaInput!]) {
  productUpdate(product: $product, media: $media) {
    product { id title handle }
    userErrors { field message }
  }
}`;

const M_PRODUCT_CREATE = `mutation($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
  productCreate(product: $product, media: $media) {
    product { id title handle }
    userErrors { field message }
  }
}`;

function altFor(roll, t, fallback) {
  if (t.alt && t.alt[roll]) return t.alt[roll];
  if (roll === 'main') return t.titel || fallback;
  throw new Error(`ingen alt-text för rollen ${roll}`);
}

function byggHtml(t, sprak, bildAvRoll, roller) {
  const r = RUBRIKER[sprak];
  const img = (roll, forsta) => {
    const b = bildAvRoll[roll];
    if (!b) throw new Error(`html-bild saknas för rollen ${roll}`);
    const stil = `max-width:100%;height:auto${forsta ? ';border-radius:8px' : ''}`;
    return `<p><img src="${b.url}" alt="${b.alt}" loading="lazy" style="${stil}"></p>`;
  };
  return (
    `<h3>${t.problemH}</h3><p>${t.problemP}</p>` + img(roller[0], true) +
    `<h3>${t.losningH}</h3><p>${t.losningP}</p>` + img(roller[1], false) +
    `<h3>${r.funktioner}</h3><ul>\n` +
    t.bullets.map((b) => `<li>\n${b}</li>`).join('\n') +
    `\n</ul>` + img(roller[2], false) +
    `<h3>${r.garanti}</h3><p>${GARANTI[sprak]}</p>`
  );
}

/** Väntar tills produktens alla bilder är READY. Returnerar noderna. */
async function vantaMedia(butik, pid, antalVantat) {
  for (let i = 0; i < 40; i++) {
    const d = await butik.fraga(
      `query($id: ID!) { product(id: $id) { media(first: 30) {
         nodes { ... on MediaImage { id alt status image { url } } } } } }`,
      { id: pid }
    );
    const noder = d.product.media.nodes.filter((n) => n.id);
    const klara = noder.every((n) => n.status === 'READY' || n.status === 'FAILED');
    if (klara && noder.length >= antalVantat) {
      const fel = noder.filter((n) => n.status === 'FAILED');
      if (fel.length) throw new Error(`media FAILED: ${fel.map((f) => f.alt).join(' · ')}`);
      return noder;
    }
    await sov(3000);
  }
  throw new Error(`media blev aldrig READY på ${pid}`);
}

// ---------------------------------------------------------------------------
// Huvudflödet
// ---------------------------------------------------------------------------

const land = process.argv[2];
const bara = process.argv[3] || null;
if (!['no', 'dk', 'fi', 'uk'].includes(land)) {
  console.error('Användning: node kor.mjs <no|dk|fi|uk> [produkt]');
  process.exit(1);
}
const konfig = BUTIKER[land];
const sprak = konfig.sprak; // no | da | fi | en
const PRISKOL = land.toUpperCase();

const butik = new Butik(land);
const shop = await butik.verifiera();
console.log(`✔ Rätt butik: ${shop.name} (${shop.currencyCode}) — ${shop.primaryDomain?.host}`);

const kanaler = await butik.kanaler();
const kanalInput = kanaler.map((k) => ({ publicationId: k.id }));
console.log(`  ${kanaler.length} försäljningskanaler`);

const { produkter } = await butik.inventera();
const resultat = {};

function hittaBefintlig(def) {
  return produkter.find((p) => p.skuer.some((s) => def.skuPrefix.some((pre) => s.startsWith(pre)))) || null;
}

async function publicera(pid) {
  await butik.mutera(
    `mutation($id: ID!, $input: [PublicationInput!]!) {
       publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
    { id: pid, input: kanalInput },
    'publishablePublish'
  );
}

/**
 * Ersätter produktens hela bildlista i ett svep via productSet.
 * fileDelete kräver write_files som landsapparna saknar — productSet gör
 * jobbet deklarativt med bara write_products (verifierat 2026-08-22).
 */
async function ersattBilder(pid, mediaDef, t, fallbackTitel) {
  await butik.mutera(
    `mutation($id: ID!, $files: [FileSetInput!]) {
       productSet(input: { id: $id, files: $files }) {
         product { id }
         userErrors { field message } } }`,
    {
      id: pid,
      files: mediaDef.map((m) => ({
        originalSource: m.url,
        alt: altFor(m.roll, t, fallbackTitel),
        contentType: 'IMAGE',
        duplicateResolutionMode: 'APPEND_UUID',
      })),
    },
    'productSet'
  );
}

async function kopplaVariantbilder(pid, varDefs, skuNy, bildAvRoll) {
  const medBild = varDefs.filter((v) => v.bild);
  if (!medBild.length) return;
  const d = await butik.fraga(
    `query($id: ID!) { product(id: $id) { variants(first: 30) { nodes { id sku } } } }`,
    { id: pid }
  );
  const idAvSku = Object.fromEntries(d.product.variants.nodes.map((v) => [v.sku, v.id]));
  const variantMedia = medBild.map((v) => ({
    variantId: idAvSku[skuNy + v.suffix],
    mediaIds: [bildAvRoll[v.bild].id],
  }));
  if (variantMedia.some((v) => !v.variantId)) throw new Error('variant för bildkoppling saknas');
  await butik.mutera(
    `mutation($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
       productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
         userErrors { field message } } }`,
    { productId: pid, variantMedia },
    'productVariantAppendMedia'
  );
}

/** alt → {id, url} för rollerna, efter att media blivit READY. */
function mappaRoller(noder, mediaDef, t, fallbackTitel) {
  const bildAvRoll = {};
  for (const m of mediaDef) {
    const alt = altFor(m.roll, t, fallbackTitel);
    const nod = noder.find((n) => n.alt === alt);
    if (!nod) throw new Error(`hittar ingen READY-bild med alt "${alt}"`);
    bildAvRoll[m.roll] = { id: nod.id, url: nod.image.url, alt };
  }
  return bildAvRoll;
}

async function skapaProdukt(nyckel, def, t, pris) {
  const mediaDef = def.media(sprak);
  const media = mediaDef.map((m) => ({
    originalSource: m.url,
    alt: altFor(m.roll, t, null),
    mediaContentType: 'IMAGE',
  }));
  const varDefs = def.varianter(t);
  const skapad = await butik.mutera(M_PRODUCT_CREATE, {
    product: {
      title: t.titel,
      descriptionHtml: '',
      vendor: konfig.vendor,
      status: 'ACTIVE',
      templateSuffix: 'claudeprodukter',
      category: def.kategori,
      productOptions: [{ name: t.option, values: varDefs.map((v) => ({ name: v.val })) }],
    },
    media,
  }, 'productCreate');
  const pid = skapad.product.id;
  console.log(`  + skapad: ${skapad.product.title} (${pid.split('/').pop()})`);

  await butik.mutera(
    `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!, $strategy: ProductVariantsBulkCreateStrategy) {
       productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: $strategy) {
         userErrors { field message } } }`,
    {
      productId: pid,
      strategy: 'REMOVE_STANDALONE_VARIANT',
      variants: varDefs.map((v) => ({
        optionValues: [{ optionName: t.option, name: v.val }],
        price: pris,
        taxable: false,
        inventoryPolicy: 'CONTINUE',
        inventoryItem: { sku: def.skuNy + v.suffix, tracked: false },
      })),
    },
    'productVariantsBulkCreate'
  );

  const noder = await vantaMedia(butik, pid, mediaDef.length);
  const bildAvRoll = mappaRoller(noder, mediaDef, t, null);
  await butik.mutera(M_PRODUCT_UPDATE, {
    product: { id: pid, descriptionHtml: byggHtml(t, sprak, bildAvRoll, def.htmlBilder) },
  }, 'productUpdate');
  await kopplaVariantbilder(pid, varDefs, def.skuNy, bildAvRoll);
  await publicera(pid);
  return { id: pid, handle: skapad.product.handle, titel: skapad.product.title };
}

async function uppdateraProdukt(nyckel, def, t, pris, bef) {
  const pid = bef.id;
  const prod = { id: pid, templateSuffix: 'claudeprodukter', status: 'ACTIVE' };
  if (t.titel) prod.title = t.titel;
  if (def.nyHandle && t.titel) {
    prod.handle = handleAv(t.titel);
    prod.redirectNewHandle = true;
  }
  if (def.kategori) prod.category = def.kategori;
  const upp = await butik.mutera(M_PRODUCT_UPDATE, { product: prod }, 'productUpdate');

  const mediaDef = def.media(sprak);
  await ersattBilder(pid, mediaDef, t, upp.product.title);
  console.log(`  ~ ${upp.product.title}: bildlistan ersatt (${mediaDef.length} bilder)`);

  // Varianter: befintliga uppdateras (pris, moms av, CONTINUE), saknade skapas.
  const d = await butik.fraga(
    `query($id: ID!) { product(id: $id) {
       options { id name optionValues { id name } }
       variants(first: 30) { nodes { id sku } } } }`,
    { id: pid }
  );
  const optNamn = t.option;
  if (optNamn && d.product.options.length === 1 && d.product.options[0].name !== optNamn) {
    await butik.mutera(
      `mutation($productId: ID!, $option: OptionUpdateInput!) {
         productOptionUpdate(productId: $productId, option: $option) { userErrors { field message } } }`,
      { productId: pid, option: { id: d.product.options[0].id, name: optNamn } },
      'productOptionUpdate'
    );
  }

  const befVarianter = d.product.variants.nodes;
  if (def.behallVarianter || !def.varianter) {
    await butik.mutera(
      `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
         productVariantsBulkUpdate(productId: $productId, variants: $variants) {
           userErrors { field message } } }`,
      {
        productId: pid,
        variants: befVarianter.map((v) => ({
          id: v.id, price: pris, compareAtPrice: null, taxable: false, inventoryPolicy: 'CONTINUE',
        })),
      },
      'productVariantsBulkUpdate'
    );
  } else {
    const varDefs = def.varianter(t);
    const uppdatera = [];
    const skapa = [];
    for (const v of varDefs) {
      const sku = def.skuNy + v.suffix;
      const bef2 = befVarianter.find((b) => b.sku === sku);
      if (bef2) {
        uppdatera.push({ id: bef2.id, price: pris, compareAtPrice: null, taxable: false, inventoryPolicy: 'CONTINUE' });
      } else {
        skapa.push({
          optionValues: [{ optionName: optNamn, name: v.val }],
          price: pris, taxable: false, inventoryPolicy: 'CONTINUE',
          inventoryItem: { sku, tracked: false },
        });
      }
    }
    if (uppdatera.length) {
      await butik.mutera(
        `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
           productVariantsBulkUpdate(productId: $productId, variants: $variants) {
             userErrors { field message } } }`,
        { productId: pid, variants: uppdatera },
        'productVariantsBulkUpdate'
      );
    }
    if (skapa.length) {
      await butik.mutera(
        `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
           productVariantsBulkCreate(productId: $productId, variants: $variants) {
             userErrors { field message } } }`,
        { productId: pid, variants: skapa },
        'productVariantsBulkCreate'
      );
    }
  }

  const noder = await vantaMedia(butik, pid, mediaDef.length);
  const bildAvRoll = mappaRoller(noder, mediaDef, t, upp.product.title);
  await butik.mutera(M_PRODUCT_UPDATE, {
    product: { id: pid, descriptionHtml: byggHtml(t, sprak, bildAvRoll, def.htmlBilder) },
  }, 'productUpdate');
  if (def.varianter && !def.behallVarianter) {
    await kopplaVariantbilder(pid, def.varianter(t), def.skuNy, bildAvRoll);
  }
  await publicera(pid);

  const slut = await butik.fraga(`query($id: ID!) { product(id: $id) { handle title } }`, { id: pid });
  return { id: pid, handle: slut.product.handle, titel: slut.product.title };
}

for (const nyckel of Object.keys(PRODUKTER)) {
  if (bara && nyckel !== bara) continue;
  const def = PRODUKTER[nyckel];
  const t = T[nyckel][sprak];
  const pris = PRISER[nyckel][PRISKOL];
  if (!t || !pris) throw new Error(`text eller pris saknas för ${nyckel}/${sprak}`);

  console.log(`\n── ${nyckel} ──`);
  try {
    let bef = hittaBefintlig(def);

    if (bef && def.ersatt) {
      // Säkerhetsspärr: radera bara om produktens SKU:er hör till just denna produkt.
      const frammande = bef.skuer.filter((s) => !def.skuPrefix.some((p) => s.startsWith(p)));
      if (frammande.length) throw new Error(`vägrar radera ${bef.id} — främmande SKU:er: ${frammande.join(',')}`);
      console.log(`  − raderar gammal: "${bef.titel}" (${bef.id.split('/').pop()})`);
      await butik.mutera(
        `mutation($input: ProductDeleteInput!) { productDelete(input: $input) { deletedProductId userErrors { field message } } }`,
        { input: { id: bef.id } },
        'productDelete'
      );
      bef = null;
    }

    resultat[nyckel] = bef
      ? await uppdateraProdukt(nyckel, def, t, pris, bef)
      : await skapaProdukt(nyckel, def, t, pris);
    resultat[nyckel].pris = pris;
    resultat[nyckel].url = `https://${shop.primaryDomain?.host}/products/${resultat[nyckel].handle}`;
    console.log(`  ✔ klar: ${resultat[nyckel].url}  (${pris} ${konfig.valuta})`);
  } catch (e) {
    resultat[nyckel] = { fel: e.message };
    console.error(`  ✖ FEL på ${nyckel}: ${e.message}`);
  }
}

writeFileSync(`/tmp/fix/utrullning-${land}.json`, JSON.stringify(resultat, null, 1));
console.log(`\nSparade /tmp/fix/utrullning-${land}.json`);
const fel = Object.entries(resultat).filter(([, v]) => v.fel);
if (fel.length) {
  console.error(`${fel.length} produkter felade: ${fel.map(([k]) => k).join(', ')}`);
  process.exit(1);
}
