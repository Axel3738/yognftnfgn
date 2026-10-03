// varmesulor-storlek.mjs — storleksinvändningen på värmesulornas produktsida i Bäverbutiken,
// på alla butikens språk (Axels order 2026-10-03: "gör det tydligare så att de bara kan
// klippas ner till 41").
//
// Bakgrund: kommentarsgranskningen 2026-10-02 fångade "Synd att dom inte finns i storlek
// 35-37" och frågan "can they be cut smaller than 41?". Sidan sa bara "41–46", och "klipps
// efter din egen skostorlek" lästes som att sulan går att klippa hur liten som helst.
//
// Vad skriptet gör (torrt utan --skarpt):
//   1. Läser produkten och dess översättningar (body_html + meta_description) på alla
//      publicerade språk utom svenska (sv är primärt; mätt 2026-10-03: de en es fr it nl pl pt-PT).
//   2. Bygger den nya texten per språk ur tools/varmesulor-storlek.json genom tre
//      splitsningar i den befintliga texten — aldrig en nyöversättning av hela sidan:
//        a) ett nytt block <h3>rubrik</h3><p>stycke</p> direkt efter första stycket,
//        b) stycke 2 (det som sa "41–46") byts mot den nya lydelsen,
//        c) punkten i funktionslistan som nämner 41–46 byts.
//      Saknas något av ankarna i ett språk stoppar skriptet för det språket i stället för
//      att gissa. Finns rubriken redan görs ingen dubbel insättning (idempotent).
//   3. --skarpt: productUpdate (descriptionHtml + seo.description) på svenska, läser om
//      digesten och registrerar de åtta översättningarna med translationsRegister mot den
//      NYA digesten (en översättning utan rätt digest räknas som föråldrad av Shopify).
//   4. Läser tillbaka via API och som kund på alla nio språk (`--kundvy`): rubriken ska
//      finnas i HTML:en på marknadens adress för språket (rootUrls ur API:t — svenskan på
//      baverbutiken.se, de åtta andra på beaverstoreco.com, mätt 2026-10-03).
//
// Nycklar: SHOPIFY_SHOP_SE + SHOPIFY_CLIENT_ID_SE/SECRET_SE (appen med write_products +
// write_translations, mätt 2026-10-03). Inget annat rörs: inte titeln, inte bilderna, inte
// priset, inte andra produkter.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { mintaToken, normaliseraDoman } from '../factory/token.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const API = '2025-07';
const HANDLE = 'varmesulor-med-fjarrkontroll-varma-fotter-pa-passet';
const BUTIK_URL = 'https://baverbutiken.se';

const arg = process.argv.slice(2);
const SKARPT = arg.includes('--skarpt');
const KUNDVY = arg.includes('--kundvy');
const TEXTER = JSON.parse(readFileSync(join(HAR, 'varmesulor-storlek.json'), 'utf8'));

// ------------------------------------------------------------ textbygget (rena funktioner)

/** Alla <p> som inte bara bär en bild, i ordning. */
const stycken = (html) => [...html.matchAll(/<p>(?!<img)([\s\S]*?)<\/p>/g)];

/**
 * Bygger den nya beskrivningen ur den gamla. Kastar om ett ankare saknas.
 *   texter: { rubrik, stycke, stycke2, punkt }
 */
export function byggBeskrivning(html, texter) {
  const nyttBlock = `<h3>${texter.rubrik}</h3><p>${texter.stycke}</p>`;
  let ut = html;

  // b) stycke 2 — det som nämner 41–46 — byts helt (redan bytt ⇒ rörs inte).
  if (!ut.includes(`<p>${texter.stycke2}</p>`)) {
    const p = stycken(ut).filter((m) => /41\s*[–-]\s*46/.test(m[1]));
    if (p.length !== 1) throw new Error(`hittade ${p.length} stycken med "41–46" (väntade 1) — ingen gissning, inget skrivet`);
    ut = ut.replace(p[0][0], `<p>${texter.stycke2}</p>`);
  }

  // c) punkten i listan.
  if (!ut.includes(texter.punkt)) {
    const li = [...ut.matchAll(/<li>\s*([\s\S]*?)<\/li>/g)].filter((m) => /41\s*[–-]\s*46/.test(m[1]));
    if (li.length !== 1) throw new Error(`hittade ${li.length} punkter med "41–46" (väntade 1)`);
    ut = ut.replace(li[0][0], `<li>\n${texter.punkt}</li>`);
  }

  // a) det nya blocket efter första stycket (före första bilden), bara om det inte redan finns.
  if (!ut.includes(nyttBlock)) {
    const forsta = stycken(ut)[0];
    if (!forsta) throw new Error('hittade inget första stycke att lägga blocket efter');
    const pos = ut.indexOf(forsta[0]) + forsta[0].length;
    ut = ut.slice(0, pos) + nyttBlock + ut.slice(pos);
  }
  return ut;
}

/** Kontrollen efteråt: allt nytt finns, det gamla "bara 41–46"-stycket är borta. */
export function kontrollera(html, texter) {
  const fel = [];
  for (const k of ['rubrik', 'stycke', 'stycke2', 'punkt']) if (!html.includes(texter[k])) fel.push(`saknar ${k}`);
  if (html.split(`<h3>${texter.rubrik}</h3>`).length !== 2) fel.push('rubriken står inte exakt en gång');
  return fel;
}

// ------------------------------------------------------------ Shopify

async function klient() {
  const env = process.env;
  const shop = normaliseraDoman(env.SHOPIFY_SHOP_SE ?? '');
  if (!shop || !env.SHOPIFY_CLIENT_ID_SE || !env.SHOPIFY_CLIENT_SECRET_SE) throw new Error('saknar SHOPIFY_SHOP_SE / SHOPIFY_CLIENT_ID_SE / SHOPIFY_CLIENT_SECRET_SE i miljön');
  const t = await mintaToken({ shop, clientId: env.SHOPIFY_CLIENT_ID_SE, clientSecret: env.SHOPIFY_CLIENT_SECRET_SE, butikId: 'baverbutiken' });
  return async (query, variables) => {
    const r = await fetch(`https://${shop}/admin/api/${API}/graphql.json`, {
      method: 'POST',
      headers: { 'X-Shopify-Access-Token': t.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const j = await r.json();
    if (j.errors) throw new Error(`GraphQL: ${JSON.stringify(j.errors)}`);
    return j.data;
  };
}

const lasProdukt = (gql) => gql(`query($h: String!) { productByHandle(handle: $h) { id title descriptionHtml seo { description } } }`, { h: HANDLE }).then((d) => d.productByHandle);
const lasInnehall = (gql, id) => gql(`query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest value } } }`, { id }).then((d) => d.translatableResource.translatableContent);
const lasOversattning = (gql, id, locale) => gql(`query($id: ID!, $l: String!) { translatableResource(resourceId: $id) { translations(locale: $l) { key value outdated } } }`, { id, l: locale }).then((d) => d.translatableResource.translations);
const lasSprak = (gql) => gql(`{ shopLocales { locale primary published } }`).then((d) => d.shopLocales.filter((l) => l.published && !l.primary).map((l) => l.locale));

/**
 * Var varje språk visas för kunden: ur marknadernas webbnärvaro (rootUrls), aldrig gissat.
 * Mätt 2026-10-03: svenskan på baverbutiken.se (Sverige), de åtta andra på beaverstoreco.com
 * (marknaden Worldwide: engelska i roten, de övriga i /<locale>/). /de/ på baverbutiken.se
 * svarar 404 — språket hör inte till den svenska marknaden.
 */
async function rotAdresser(gql) {
  const d = await gql(`{ markets(first: 20) { nodes { enabled webPresences(first: 5) { nodes { rootUrls { locale url } } } } } }`);
  const rot = { sv: `${BUTIK_URL}/` };
  for (const m of d.markets.nodes) if (m.enabled) for (const w of m.webPresences.nodes) for (const r of w.rootUrls) rot[r.locale] ??= r.url;
  return rot;
}

/**
 * Shopify geolokaliserar webbläsare: från containern (USA) skickas /de/ utan landkod vidare
 * till den engelska roten (mätt 2026-10-03, samma som Matstrumpor 2026-10-01). Därför bär
 * varje läsning ett land som hör till språket.
 */
const LAND_FOR_SPRAK = { sv: 'SE', en: 'US', de: 'DE', es: 'ES', fr: 'FR', it: 'IT', nl: 'NL', pl: 'PL', 'pt-PT': 'PT' };

async function kundvy(url, rubrik) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36' }, redirect: 'follow' });
  const html = await r.text();
  const avkodad = html.replace(/&amp;/g, '&').replace(/&#8211;|&ndash;/g, '–').replace(/&nbsp;|&#160;/g, '\u00a0');
  return { url, status: r.status, finns: avkodad.includes(rubrik) };
}

// ------------------------------------------------------------ körningen

async function main() {
  const gql = await klient();
  const produkt = await lasProdukt(gql);
  const sprak = await lasSprak(gql);
  console.log(`${produkt.title} (${produkt.id})`);
  console.log(`språk utöver svenska: ${sprak.join(' ')}`);
  const saknarText = sprak.filter((l) => !TEXTER[l]);
  if (saknarText.length) throw new Error(`butiken har språk utan text i varmesulor-storlek.json: ${saknarText.join(' ')} — översätt först, annars står de kvar med den gamla texten`);

  // Svenska.
  const nySv = byggBeskrivning(produkt.descriptionHtml, TEXTER.sv);
  const felSv = kontrollera(nySv, TEXTER.sv);
  if (felSv.length) throw new Error(`svenska: ${felSv.join(', ')}`);
  const svAndrad = nySv !== produkt.descriptionHtml;
  const metaAndrad = produkt.seo.description !== TEXTER.sv.meta_description;
  console.log(`sv: beskrivning ${svAndrad ? 'ändras' : 'redan rätt'}, meta ${metaAndrad ? 'ändras' : 'redan rätt'}`);

  // De andra språken — byggs ur den översättning som ligger i butiken.
  const nya = {};
  for (const l of sprak) {
    const tr = await lasOversattning(gql, produkt.id, l);
    const body = tr.find((x) => x.key === 'body_html')?.value;
    if (!body) throw new Error(`${l}: ingen body_html-översättning i butiken — sidan hade visat svenska; stoppar`);
    const ny = byggBeskrivning(body, TEXTER[l]);
    const fel = kontrollera(ny, TEXTER[l]);
    if (fel.length) throw new Error(`${l}: ${fel.join(', ')}`);
    nya[l] = { body_html: ny, meta_description: TEXTER[l].meta_description };
    console.log(`${l}: beskrivning ${ny !== body ? 'ändras' : 'redan rätt'} (${ny.length} tecken), meta ${TEXTER[l].meta_description.length} tecken`);
  }

  const utMapp = join(HAR, 'output', 'varmesulor-storlek');
  mkdirSync(utMapp, { recursive: true });
  writeFileSync(join(utMapp, 'forslag.json'), JSON.stringify({ sv: { body_html: nySv, meta_description: TEXTER.sv.meta_description }, ...nya }, null, 1));
  console.log(`förslaget per språk: ${join(utMapp, 'forslag.json')}`);

  if (!SKARPT) { console.log('torrt — inget skrivet. Kör med --skarpt för att skriva.'); return; }

  // 3. Skriv svenskan.
  const up = await gql(`mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { product { id } userErrors { field message } } }`,
    { p: { id: produkt.id, descriptionHtml: nySv, seo: { description: TEXTER.sv.meta_description } } });
  if (up.productUpdate.userErrors.length) throw new Error(`productUpdate: ${JSON.stringify(up.productUpdate.userErrors)}`);
  console.log('✅ sv skriven');

  // Digesten läses EFTER skrivningen — översättningen måste peka på den nya svenskan.
  const innehall = await lasInnehall(gql, produkt.id);
  const digest = Object.fromEntries(innehall.map((c) => [c.key, c.digest]));
  if (!innehall.find((c) => c.key === 'body_html')?.value.includes(TEXTER.sv.rubrik)) throw new Error('tillbakaläsningen av svenskan saknar rubriken — översättningarna registreras inte');

  for (const l of sprak) {
    const t = [
      { key: 'body_html', value: nya[l].body_html, locale: l, translatableContentDigest: digest.body_html },
      { key: 'meta_description', value: nya[l].meta_description, locale: l, translatableContentDigest: digest.meta_description },
    ];
    let r;
    for (let forsok = 1; forsok <= 3; forsok++) {
      try {
        r = await gql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { translations { key } userErrors { field message code } } }`, { id: produkt.id, t });
        break;
      } catch (e) {
        // Mätt 2026-09-27 (matstrumpor): translationsRegister kan svara INTERNAL_SERVER_ERROR en stund — kör om.
        if (forsok === 3) throw e;
        await new Promise((res) => setTimeout(res, 3000 * forsok));
      }
    }
    if (r.translationsRegister.userErrors.length) throw new Error(`${l}: ${JSON.stringify(r.translationsRegister.userErrors)}`);
    const tillbaka = await lasOversattning(gql, produkt.id, l);
    const b = tillbaka.find((x) => x.key === 'body_html');
    const m = tillbaka.find((x) => x.key === 'meta_description');
    const ok = b?.value === nya[l].body_html && !b.outdated && m?.value === nya[l].meta_description && !m.outdated;
    console.log(`${ok ? '✅' : '❌'} ${l}: ${r.translationsRegister.translations.length} registrerade, tillbakaläst ${ok ? 'lika, inte föråldrad' : 'AVVIKER'}`);
    if (!ok) process.exitCode = 1;
  }
}

async function kundvyAlla() {
  const gql = await klient();
  const sprak = ['sv', ...(await lasSprak(gql))];
  const rot = await rotAdresser(gql);
  let fel = 0;
  for (const l of sprak) {
    if (!rot[l]) { console.log(`❌ ${l}: ingen marknad visar språket (ingen rootUrl)`); fel++; continue; }
    const land = LAND_FOR_SPRAK[l];
    const v = await kundvy(`${rot[l]}products/${HANDLE}${land ? `?country=${land}` : ''}`, TEXTER[l].rubrik);
    console.log(`${v.finns ? '✅' : '❌'} ${l} ${v.status} ${v.url}`);
    if (!v.finns) fel++;
  }
  if (fel) { console.log(`${fel} språk visar inte rubriken som kund (cache? vänta en minut och kör --kundvy igen)`); process.exitCode = 1; }
}

const arHuvud = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (arHuvud) {
  (KUNDVY ? kundvyAlla() : main()).catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}
