// Matstrumpors Trustpilot på hemsidan. Axels beställning 2026-09-29: "Jag vill
// gärna flexa matstrumpors trustpilot på hemsidan! Vi har ju så många bra
// recensioner."
//
// Profilen: https://se.trustpilot.com/review/www.matstrumpor.se — claimad,
// business unit 69458c03ae5298305b500fde, TrustScore 4,2 / 15 omdömen vid bygget
// (11 femstjärniga, 4 enstjärniga om leveranstiden i december).
//
// ⚠️ Trustpilots egna widgetar (TrustBox) går INTE att använda: gratisplanen
// släpper bara igenom mallen "Starter" (mätt 2026-09-29 mot
// widget.trustpilot.com/trustbox-data: MicroCombo, Mini, Carousel, Grid … svarar
// alla "BusinessUnit does not have access to that trustbox"). Starter visar
// ingen text och inga omdömen. Därför ritas blocket av temat självt:
//
//   1. Betyget (TrustScore, stjärnor, antal, etiketten "Bra"/"Great" per språk)
//      läses ur Starter-mallens JSON — stabil, utan botspärr.
//   2. Omdömena läses ur profilsidans __NEXT_DATA__ i Chromium (sidan svarar 403
//      på curl men bär hela innehållet i HTML:en, samma som annonsbiblioteket).
//   3. Allt skrivs som EN JSON i butikens shop-metafält matstrumpor.trustpilot,
//      och sektionen sections/ms-trustpilot.liquid ritar det ur metafältet — så
//      en uppdatering är ett metafältsskrivning, aldrig en temaskrivning.
//
// Minnet är matstrumpor/trustpilot/data.json (committas). Rör Chromium inte
// sidan behålls förra körningens omdömen och bara betyget uppdateras.
//
//   node matstrumpor/trustpilot.mjs --hamta              # läs Trustpilot → data.json (skriver inget i butiken)
//   node matstrumpor/trustpilot.mjs --skarpt             # --hamta + metafältet, tillbakaläst
//   node matstrumpor/trustpilot.mjs --tema [--skarpt]    # sektionen + startsidan (idempotent)
//   node matstrumpor/trustpilot.mjs --kundvy             # startsidan publikt: står betyget där?
//
// Bara Matstrumpor. Skriptet rör aldrig en annan butik, aldrig Judge.me, aldrig
// en annons. Trustpilots villkor: omdömena visas med namn, datum, länk till
// omdömet och Trustpilots namn — och betyget är alltid det aktuella.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
export const ROT = join(HAR, '..');
export const MAPP = join(HAR, 'trustpilot');
export const DATAFIL = join(MAPP, 'data.json');
export const SPRAKFIL = join(MAPP, 'sprak.json');
export const SEKTIONSFIL = join(MAPP, 'ms-trustpilot.liquid');
export const SNIPPETFIL = join(MAPP, 'ms-trustpilot-rad.liquid');

export const BUTIK_ID = 'matstrumpor';
export const BUSINESS_UNIT_ID = '69458c03ae5298305b500fde';
export const STARTER_MALL = '56278e9abfbbba0bdcd568bc';
export const PROFIL_SV = 'https://se.trustpilot.com/review/www.matstrumpor.se';
export const METAFALT = { namespace: 'matstrumpor', key: 'trustpilot' };
export const SEKTION_TYP = 'ms-trustpilot';
export const SEKTIONSFIL_TEMA = `sections/${SEKTION_TYP}.liquid`;
export const SNIPPET_NAMN = 'ms-trustpilot-rad';
export const SNIPPETFIL_TEMA = `snippets/${SNIPPET_NAMN}.liquid`;
export const INDEX_FIL = 'templates/index.json';
export const PRODUKT_FIL = 'templates/product.json';
export const KORG_FIL = 'templates/cart.json';
export const KOLLEKTION_FIL = 'templates/collection.json';
export const LADA_FIL = 'snippets/cart-drawer.liquid';
export const RAD_I_LADAN = `        {% render '${SNIPPET_NAMN}', kompakt: true %}\n`;
export const LADA_ANKARE = '        <!-- CTAs -->';

/** Butikens språk (request.locale.iso_code) → Trustpilots locale och profildomän. */
export const SPRAK = {
  sv: { locale: 'sv-SE', doman: 'se' },
  nb: { locale: 'nb-NO', doman: 'no' },
  da: { locale: 'da-DK', doman: 'dk' },
  fi: { locale: 'fi-FI', doman: 'fi' },
  en: { locale: 'en-US', doman: 'www' },
  de: { locale: 'de-DE', doman: 'de' },
  fr: { locale: 'fr-FR', doman: 'fr' },
  nl: { locale: 'nl-NL', doman: 'nl' },
  es: { locale: 'es-ES', doman: 'es' },
  it: { locale: 'it-IT', doman: 'it' },
  pl: { locale: 'pl-PL', doman: 'pl' },
  'pt-PT': { locale: 'pt-PT', doman: 'pt' },
  // Japan och Taiwan 2026-09-30. Trustpilot har japanska (etiketten "ほぼ満足" för 4,2) men ingen
  // kinesiska: zh-TW-locale svarar med engelskans "Great", så Taiwans etikett kommer ur ETIKETT_EGEN.
  // Profilen på jp.trustpilot.com; tw.trustpilot.com skickar till www.
  ja: { locale: 'ja-JP', doman: 'jp' },
  'zh-TW': { locale: 'zh-TW', doman: 'www' },
};

// Språk där Trustpilot inte översätter etiketten: Trustpilots egen skala (Excellent/Great/Average/Poor/Bad,
// samma trösklar som starsString) på språket. Nyckeln är den engelska etiketten Trustpilot svarar med.
export const ETIKETT_EGEN = {
  'zh-TW': { Excellent: '極佳', Great: '很好', Average: '普通', Poor: '差', Bad: '很差' },
};

// Språk som skriver betyget med decimalpunkt (4.2), inte decimalkomma (4,2).
export const DECIMALPUNKT = ['en', 'ja', 'zh-TW'];

export const MAX_OMDOMEN = 9;      // kort i sektionen
export const MINST_STJARNOR = 4;   // TrustBox-standarden "4–5 stjärnor"; betyget visas ändå oavkortat
export const MAX_TECKEN = 280;     // längre texter klipps vid ordgräns med …

const MANADER_SV = ['jan', 'feb', 'mars', 'apr', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];

export function starterUrl(locale = 'sv-SE') {
  return `https://widget.trustpilot.com/trustbox-data/${STARTER_MALL}?businessUnitId=${BUSINESS_UNIT_ID}&locale=${locale}`;
}

export function profilUrl(sprak = 'sv') {
  const d = SPRAK[sprak]?.doman ?? 'www';
  return `https://${d}.trustpilot.com/review/www.matstrumpor.se`;
}

/** "2026-09-28T11:30:20.000Z" → "28 sep 2026" (svenska). */
export function datumSv(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getUTCDate()} ${MANADER_SV[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Klipper vid ordgräns och sätter … — aldrig mitt i ett ord. */
export function klipp(text, max = MAX_TECKEN) {
  const t = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const kort = t.slice(0, max - 1);
  const sista = kort.lastIndexOf(' ');
  return (sista > max * 0.6 ? kort.slice(0, sista) : kort).replace(/[,.;:!?]+$/, '') + '…';
}

/**
 * Trustpilot sätter en rubrik själv när kunden inte skrev någon: textens
 * första ord med "…" på slutet, eller hela texten om den är kort. Den rubriken
 * upprepar bara texten och ritas inte. Mätt 2026-09-29: 7 av 9 rubriker var
 * sådana ("Kul att ge till någon som verkligen…").
 */
export function egenRubrik(rubrik, text) {
  const r = String(rubrik ?? '').replace(/\s+/g, ' ').trim();
  if (!r) return '';
  const t = String(text ?? '').replace(/\s+/g, ' ').trim();
  const norm = (s) => s.toLowerCase().replace(/[…\s.,!?;:'"«»()]+$/g, '').replace(/[.,!?;:'"«»()]/g, '');
  const rn = norm(r);
  if (!rn || norm(t).startsWith(rn)) return '';
  return r;
}

/**
 * Omdömena ur Trustpilots sidodata (props.pageProps.reviews) → de som visas.
 * Bara ≥ MINST_STJARNOR, nyast först, max MAX_OMDOMEN, aldrig tomma texter.
 */
export function valjOmdomen(reviews, { max = MAX_OMDOMEN, minst = MINST_STJARNOR, maxTecken = MAX_TECKEN } = {}) {
  return (reviews ?? [])
    .filter((r) => Number(r.rating) >= minst && String(r.text ?? '').trim())
    .sort((a, b) => String(b.dates?.publishedDate ?? '').localeCompare(String(a.dates?.publishedDate ?? '')))
    .slice(0, max)
    .map((r) => ({
      id: r.id ?? null,
      stjarnor: Number(r.rating),
      datum: String(r.dates?.publishedDate ?? '').slice(0, 10),
      datum_sv: datumSv(r.dates?.publishedDate),
      namn: klipp(r.consumer?.displayName ?? '', 40),
      rubrik: klipp(egenRubrik(r.title, r.text), 90),
      text: klipp(r.text ?? '', maxTecken),
      lank: r.id ? `https://se.trustpilot.com/reviews/${r.id}` : PROFIL_SV,
    }));
}

/** Betyget ur Starter-JSON:en (en per språk). → { poang, stjarnor, antal, fordelning, etikett } */
export function betygUr(starterPerSprak) {
  const sv = starterPerSprak.sv;
  const bu = sv?.businessUnit;
  if (!bu || typeof bu.trustScore !== 'number') throw new Error('Starter-JSON:en saknar businessUnit.trustScore — inget skrivs.');
  const n = bu.numberOfReviews ?? {};
  const etikett = {};
  for (const [sprak, d] of Object.entries(starterPerSprak)) if (d?.starsString) etikett[sprak] = ETIKETT_EGEN[sprak]?.[d.starsString] ?? d.starsString;
  return {
    poang: bu.trustScore,
    poang_text: String(bu.trustScore.toFixed(1)).replace('.', ','),
    poang_en: bu.trustScore.toFixed(1),
    stjarnor: bu.stars,
    antal: n.total ?? 0,
    fordelning: { 1: n.oneStar ?? 0, 2: n.twoStars ?? 0, 3: n.threeStars ?? 0, 4: n.fourStars ?? 0, 5: n.fiveStars ?? 0 },
    etikett,
  };
}

/** Metafältets JSON ur betyg + omdömen. Ren. */
export function metafaltJson({ betyg, omdomen, hamtad = new Date().toISOString() }) {
  const profil = {};
  for (const s of Object.keys(SPRAK)) profil[s] = profilUrl(s);
  return { hamtad, ...betyg, profil, omdomen };
}

// ---------------------------------------------------------------- hämtningen

async function hamtaStarter(fetchFn = fetch) {
  const ut = {}; const fel = [];
  for (const [sprak, { locale }] of Object.entries(SPRAK)) {
    try {
      const r = await fetchFn(starterUrl(locale), { headers: { accept: 'application/json' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      ut[sprak] = await r.json();
    } catch (e) { fel.push(`${sprak}: ${e.message}`); }
  }
  if (!ut.sv) throw new Error(`Betyget gick inte att läsa (Starter sv-SE): ${fel.join('; ')}`);
  return { starter: ut, fel };
}

/** Profilsidan i Chromium → reviews[] ur __NEXT_DATA__. null om sidan inte gick att läsa. */
async function hamtaOmdomen({ logg = console.error } = {}) {
  let start;
  try { ({ startaWebblasare: start } = await import('../konkurrenter/adlibrary.mjs')); } catch (e) { logg(`  Chromium-hjälparen saknas (${e.message.split('\n')[0]})`); return null; }
  let browser;
  try {
    ({ browser } = await start({ locale: 'sv-SE' }));
    const ctx = browser.contexts()[0];
    const sida = await ctx.newPage();
    let html = '';
    for (let i = 0; i < 6; i++) {
      const r = await sida.goto(PROFIL_SV, { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => null);
      await sida.waitForTimeout(2500);
      html = await sida.content().catch(() => '');
      logg(`  profilsidan försök ${i + 1}: HTTP ${r?.status() ?? '?'}${html.includes('__NEXT_DATA__') ? ', innehållet finns' : ''}`);
      if (html.includes('__NEXT_DATA__')) break;
      await sida.waitForTimeout(4000);
    }
    const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) return null;
    const d = JSON.parse(m[1]);
    const reviews = d?.props?.pageProps?.reviews;
    return Array.isArray(reviews) ? reviews : null;
  } catch (e) { logg(`  profilsidan gick inte att läsa: ${e.message.split('\n')[0]}`); return null; }
  finally { await browser?.close().catch(() => {}); }
}

export function lasData() {
  return existsSync(DATAFIL) ? JSON.parse(readFileSync(DATAFIL, 'utf8')) : null;
}

/** Hela hämtningen → data.json. Returnerar { data, noter }. */
export async function hamta({ fetchFn = fetch, logg = console.log } = {}) {
  const noter = [];
  const { starter, fel } = await hamtaStarter(fetchFn);
  if (fel.length) noter.push(`etiketten saknas för: ${fel.join('; ')}`);
  const betyg = betygUr(starter);
  logg(`  betyg: ${betyg.poang_text} av 5 (${betyg.etikett.sv ?? '?'}), ${betyg.antal} omdömen, ${betyg.fordelning[5]} femstjärniga`);
  const reviews = await hamtaOmdomen({ logg });
  const forra = lasData();
  let omdomen;
  if (reviews) {
    omdomen = valjOmdomen(reviews);
    logg(`  omdömen: ${reviews.length} lästa på profilsidan, ${omdomen.length} visas (≥ ${MINST_STJARNOR} stjärnor, nyast först)`);
  } else if (forra?.omdomen?.length) {
    omdomen = forra.omdomen;
    noter.push(`profilsidan gick inte att läsa — förra körningens ${omdomen.length} omdömen (${forra.hamtad}) står kvar, bara betyget är nytt`);
  } else {
    omdomen = [];
    noter.push('profilsidan gick inte att läsa och det finns inga tidigare omdömen — sektionen visar bara betyget');
  }
  const data = metafaltJson({ betyg, omdomen });
  mkdirSync(MAPP, { recursive: true });
  writeFileSync(DATAFIL, JSON.stringify(data, null, 2) + '\n');
  logg(`  → ${DATAFIL.replace(ROT + '/', '')}`);
  return { data, noter };
}

// ---------------------------------------------------------------- butiken

async function klientFor() {
  (await import('../mejl/shopify.mjs')).kravProxy();
  const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
  const butik = lasButik(BUTIK_ID);
  return { butik, klient: await skapaKlient(butik) };
}

/** Skriver metafältet om det skiljer sig, läser tillbaka. → { skrivet, varde } */
export async function skrivMetafalt(klient, data, { logg = console.log } = {}) {
  const varde = JSON.stringify(data);
  const q = await klient.graphql(`{ shop { id metafield(namespace: "${METAFALT.namespace}", key: "${METAFALT.key}") { value } } }`);
  if (q.shop.metafield?.value === varde) { logg('  metafältet bär redan exakt den här datan — inget skrivet'); return { skrivet: false, varde }; }
  const r = await klient.graphql(
    `mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { metafields { id } userErrors { field message } } }`,
    { m: [{ ownerId: q.shop.id, namespace: METAFALT.namespace, key: METAFALT.key, type: 'json', value: varde }] }
  );
  const fel = r.metafieldsSet?.userErrors ?? [];
  if (fel.length) throw new Error(`metafieldsSet: ${fel.map((e) => e.message).join('; ')}`);
  const las = await klient.graphql(`{ shop { metafield(namespace: "${METAFALT.namespace}", key: "${METAFALT.key}") { value } } }`);
  if (las.shop.metafield?.value !== varde) throw new Error('metafältet lästes tillbaka med ett annat värde än det som skrevs.');
  logg(`  ✓ shop-metafältet ${METAFALT.namespace}.${METAFALT.key} skrivet och tillbakaläst (${(varde.length / 1024).toFixed(1)} kB)`);
  return { skrivet: true, varde };
}

/** Ordboken i Liquid: en case-gren per språk för varje nyckel. */
export function sprakCase(sprak, nyckel, { n = null } = {}) {
  const v = (s) => {
    let t = String(sprak[s]?.[nyckel] ?? sprak.sv[nyckel]);
    if (n != null) t = t.replace('{n}', n);
    return t.replace(/'/g, '&#39;');
  };
  const grenar = Object.keys(sprak).filter((s) => s !== 'sv').map((s) => `{% when '${s}' %}${v(s)}`).join('');
  return `{% case request.locale.iso_code %}${grenar}{% else %}${v('sv')}{% endcase %}`;
}

/** Sektionsfilen ur mallen i repot + ordboken. Ren. */
export function byggSektion(mall, sprak) {
  const saknar = Object.keys(sprak).filter((s) => !sprak[s].eyebrow || !sprak[s].heading || !sprak[s].av5 || !sprak[s].omdomen || !sprak[s].pa_trustpilot || !sprak[s].baserat || !sprak[s].knapp || !sprak[s].las);
  if (saknar.length) throw new Error(`sprak.json saknar nycklar för: ${saknar.join(', ')}`);
  return mall.replace(/\{\{\{\s*sprak:(\w+)\s*\}\}\}/g, (_, nyckel) => sprakCase(sprak, nyckel, { n: nyckel === 'baserat' ? "{{ d.antal }}" : null }));
}

/** Tar bort Shopifys kommentarshuvud och läser JSON:en. */
export function lasMallJson(text) {
  const start = text.indexOf('{');
  if (start < 0) throw new Error('mallfilen är inte JSON.');
  return JSON.parse(text.slice(start));
}

/**
 * Startsidan: den kompakta raden efter marquee:n, korten där den handskrivna
 * slidern "omdomen" står — slidern göms (visible: false, kvar i redigeraren).
 * Ren; returnerar samma objekt om allt redan står rätt.
 */
export function laggInPaStartsidan(index) {
  const ut = JSON.parse(JSON.stringify(index));
  ut.sections ??= {}; ut.order ??= [];
  let andrat = false;
  if (!ut.sections.trustpilot_rad) {
    ut.sections.trustpilot_rad = { type: SEKTION_TYP, settings: { visible: true, variant: 'rad' } };
    const i = ut.order.indexOf('ms_marquee');
    ut.order.splice(i >= 0 ? i + 1 : 0, 0, 'trustpilot_rad');
    andrat = true;
  }
  if (!ut.sections.trustpilot) {
    ut.sections.trustpilot = { type: SEKTION_TYP, settings: { visible: true, variant: 'kort', max: 6 } };
    const i = ut.order.indexOf('omdomen');
    ut.order.splice(i >= 0 ? i : ut.order.length, 0, 'trustpilot');
    andrat = true;
  }
  if (ut.sections.omdomen?.settings && ut.sections.omdomen.settings.visible !== false) {
    ut.sections.omdomen.settings.visible = false;
    andrat = true;
  }
  return andrat ? ut : index;
}

/**
 * Produktsidan: raden som custom_liquid-block i main-product, direkt efter
 * trygghetsraden ms_trust (annars efter köpknapparna, annars sist). Ren.
 */
export function laggInPaProduktsidan(mall) {
  const ut = JSON.parse(JSON.stringify(mall));
  const main = ut.sections?.main;
  if (!main || main.type !== 'main-product') throw new Error('produktmallen saknar sektionen main (main-product).');
  if (main.blocks?.ms_trustpilot) return mall;
  main.blocks ??= {}; main.block_order ??= [];
  main.blocks.ms_trustpilot = { type: 'custom_liquid', settings: { custom_liquid: `{% render '${SNIPPET_NAMN}', kompakt: true %}` } };
  const efter = ['ms_trust', 'buy_buttons'].map((k) => main.block_order.indexOf(k)).find((i) => i >= 0);
  main.block_order.splice(efter != null ? efter + 1 : main.block_order.length, 0, 'ms_trustpilot');
  return ut;
}

/** En rad-sektion i en JSON-mall, direkt efter sektionen `efter` (annars först). Ren. */
export function laggInRad(mall, { efter = null } = {}) {
  if (mall.sections?.trustpilot_rad) return mall;
  const ut = JSON.parse(JSON.stringify(mall));
  ut.sections ??= {}; ut.order ??= [];
  ut.sections.trustpilot_rad = { type: SEKTION_TYP, settings: { visible: true, variant: 'rad' } };
  const i = efter ? ut.order.indexOf(efter) : -1;
  ut.order.splice(i >= 0 ? i + 1 : 0, 0, 'trustpilot_rad');
  return ut;
}

/** Varukorgslådan: raden ovanför "Till kassan". Ren; samma text tillbaka om den redan finns. */
export function laggInILadan(text) {
  if (text.includes(`'${SNIPPET_NAMN}'`)) return text;
  const i = text.indexOf(LADA_ANKARE);
  if (i < 0) throw new Error(`${LADA_FIL} saknar ankaret "${LADA_ANKARE.trim()}" — lådan ser inte ut som väntat, inget skrivs.`);
  return text.slice(0, i) + RAD_I_LADAN + text.slice(i);
}

async function lasTemafiler(klient, temaId, namn) {
  const d = await klient.graphql(
    `query($id: ID!, $namn: [String!]) { theme(id: $id) { files(filenames: $namn, first: 10) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`,
    { id: temaId, namn }
  );
  const ut = {};
  for (const f of d.theme?.files?.nodes ?? []) ut[f.filename] = f.body?.content ?? null;
  return ut;
}

/**
 * Alla temafiler ur de nuvarande: sektionen, snippeten, startsidan,
 * produktsidan, varukorgssidan, kollektionssidan och varukorgslådan.
 * Ren; returnerar bara det som skiljer sig, med en rad text per fil.
 */
export function temaFiler(fore, sprak, { sektionsmall, snippetmall }) {
  const sektion = byggSektion(sektionsmall, sprak);
  const snippet = byggSektion(snippetmall, sprak);
  const ut = []; const rader = [];
  const json = (namn, fn, beskriv) => {
    if (fore[namn] == null) throw new Error(`${namn} finns inte i temat.`);
    const gammal = lasMallJson(fore[namn]);
    const ny = fn(gammal);
    if (ny === gammal) { rader.push(`${namn}: står redan rätt`); return; }
    rader.push(`${namn}: ${beskriv(gammal)}`);
    ut.push({ filename: namn, body: { type: 'TEXT', value: JSON.stringify(ny, null, 2) + '\n' }, kontroll: JSON.stringify(ny) });
  };
  const text = (namn, ny, beskriv) => {
    if (fore[namn] === ny) { rader.push(`${namn}: står redan rätt`); return; }
    rader.push(`${namn}: ${beskriv}`);
    ut.push({ filename: namn, body: { type: 'TEXT', value: ny }, kontroll: ny });
  };
  text(SEKTIONSFIL_TEMA, sektion, fore[SEKTIONSFIL_TEMA] == null ? 'saknas, skapas' : 'skiljer sig, skrivs om');
  text(SNIPPETFIL_TEMA, snippet, fore[SNIPPETFIL_TEMA] == null ? 'saknas, skapas' : 'skiljer sig, skrivs om');
  json(INDEX_FIL, laggInPaStartsidan, (g) => `får ${['trustpilot_rad', 'trustpilot'].filter((k) => !g.sections?.[k]).join(' + ') || 'slidern gömd'}`);
  json(PRODUKT_FIL, laggInPaProduktsidan, () => 'får raden under trygghetsraden');
  json(KORG_FIL, (m) => laggInRad(m, { efter: 'cart-footer' }), () => 'får raden under summan');
  json(KOLLEKTION_FIL, (m) => laggInRad(m, { efter: 'banner' }), () => 'får raden under rubriken');
  if (fore[LADA_FIL] == null) throw new Error(`${LADA_FIL} finns inte i temat.`);
  text(LADA_FIL, laggInILadan(fore[LADA_FIL]), 'får raden ovanför Till kassan');
  return { filer: ut, rader };
}

export async function skrivTema(klient, { skarpt = false, logg = console.log } = {}) {
  const sprak = JSON.parse(readFileSync(SPRAKFIL, 'utf8'));
  const t = await klient.graphql('{ themes(first: 5, roles: [MAIN]) { nodes { id name role } } }');
  const tema = (t.themes?.nodes ?? []).find((x) => x.role === 'MAIN');
  if (!tema) throw new Error('hittar inget publicerat tema (role MAIN).');
  logg(`  tema: "${tema.name}" (publicerat)`);
  const namn = [SEKTIONSFIL_TEMA, SNIPPETFIL_TEMA, INDEX_FIL, PRODUKT_FIL, KORG_FIL, KOLLEKTION_FIL, LADA_FIL];
  const fore = await lasTemafiler(klient, tema.id, namn);
  const { filer, rader } = temaFiler(fore, sprak, { sektionsmall: readFileSync(SEKTIONSFIL, 'utf8'), snippetmall: readFileSync(SNIPPETFIL, 'utf8') });
  for (const r of rader) logg(`  ${r}`);
  if (!filer.length) return { skrivna: [] };
  if (!skarpt) { logg('  torrt: inget skrivet. Kör med --tema --skarpt.'); return { skrivna: [], torrt: filer.map((f) => f.filename) }; }
  const u = await klient.graphql(
    `mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename code message } } }`,
    { id: tema.id, files: filer.map(({ filename, body }) => ({ filename, body })) }
  );
  const fel = u.themeFilesUpsert?.userErrors ?? [];
  if (fel.length) throw new Error(`themeFilesUpsert: ${fel.map((e) => `${e.filename}: ${e.message}`).join('; ')}`);
  const efter = await lasTemafiler(klient, tema.id, filer.map((f) => f.filename));
  for (const f of filer) {
    const last = f.filename.endsWith('.json') ? JSON.stringify(lasMallJson(efter[f.filename] ?? '')) : efter[f.filename];
    if (last !== f.kontroll) throw new Error(`${f.filename} lästes tillbaka med annat innehåll.`);
  }
  logg(`  ✓ ${filer.map((f) => f.filename).join(', ')} skrivna och lästa tillbaka`);
  return { skrivna: filer.map((f) => f.filename) };
}

/** Kundens vy: står betyget på startsidan? → { rad, kort, poang } */
export function sidanBar(html, data) {
  const har = (s) => html.includes(s);
  return {
    rad: har('ms-tp--rad'),
    kort: har('ms-tp--kort'),
    poang: har(`${data.poang_text} `) || har(`${data.poang_text}<`),
    omdomen: data.omdomen.filter((o) => o.namn && har(o.namn.replace(/&/g, '&amp;'))).length,
  };
}

export async function kundvy(data, { fetchFn = fetch, logg = console.log } = {}) {
  const url = 'https://matstrumpor.se/?country=SE';
  const r = await fetchFn(url, { headers: { accept: 'text/html', 'accept-language': 'sv' } });
  const html = await r.text();
  const k = sidanBar(html, data);
  logg(`  ${url}: raden ${k.rad ? '✓' : '✗'} · korten ${k.kort ? '✓' : '✗'} · betyget ${data.poang_text} ${k.poang ? '✓' : '✗'} · ${k.omdomen} av ${data.omdomen.length} namn i HTML:en`);
  return k;
}

async function main() {
  const argv = process.argv.slice(2);
  const skarpt = argv.includes('--skarpt');
  const noter = [];
  if (argv.includes('--tema')) {
    const { klient } = await klientFor();
    console.log('Temat:');
    await skrivTema(klient, { skarpt });
  }
  let data = lasData();
  if (argv.includes('--hamta') || (skarpt && !argv.includes('--tema')) || (!argv.includes('--tema') && !argv.includes('--kundvy'))) {
    console.log('Trustpilot:');
    const h = await hamta();
    data = h.data; noter.push(...h.noter);
  }
  if (skarpt && data) {
    const { klient } = await klientFor();
    console.log('Butiken:');
    await skrivMetafalt(klient, data);
  }
  if (argv.includes('--kundvy') && data) {
    console.log('Kundens vy:');
    await kundvy(data);
  }
  for (const n of noter) console.log(`  ⚠️ ${n}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
