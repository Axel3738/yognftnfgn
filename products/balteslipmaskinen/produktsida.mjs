#!/usr/bin/env node
// Bälteslipmaskinens produktsida i alla fyra Bäverbutiker (SE, NO, DK, FI):
// tekniska uppgifter, ström-raden, "vad den passar för", tre korta videoloopar ur
// våra egna annonsfilmer och tre nya produktbilder. Byggt 2026-10-03 på Axels
// order ("Göra detta mer tydligt på produktsidan … för alla marknader … mycket
// snyggare gifs och bilder").
//
//   node products/balteslipmaskinen/produktsida.mjs                 # torrt: planen + html i output/, inget skrivs
//   node products/balteslipmaskinen/produktsida.mjs --skarpt        # alla fyra butiker
//   node products/balteslipmaskinen/produktsida.mjs --bara se --skarpt
//   node products/balteslipmaskinen/produktsida.mjs --strom klar --watt 96 --skarpt   # när leverantören svarat
//   node products/balteslipmaskinen/produktsida.mjs --aterstall se --skarpt           # senaste backupen tillbaka
//
// Ström-raden (Axels fråga: "what is the wattage, and does it run on 230 V?"):
//   vantar  = vi vet inte än (standard tills leverantören svarat; LEVERANTOR-FRAGA-STROM.md)
//   klar    = adapter med nordisk stickpropp, 230 V, effekt --watt
//   adapter = universaladapter + resestickpropp i lådan, 230 V, effekt --watt
// Valet sparas i lage.json så en omkörning utan --strom behåller det.
//
// Media laddas upp EN gång per butik till butikens egna Shopify Files (lage.json
// minns URL:erna) — ingen butik hotlinkar en annan. Beskrivningen byggs ur den
// gamla: bildparagraferna (Temu-gifen) tas bort, hero-loopen läggs efter första
// stycket, slipningsloopen efter lösningsstycket, specblocket före garantin.
// Allt det nya ligger i <div class="bs-spec"> så en omkörning byter blocket i
// stället för att dubbla det. Varje skarp körning backar upp den gamla texten.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, basename } from 'node:path';
import { lasButik, skapaKlient } from '../../sparning/butik.mjs';
import { tillShopify } from '../../matstrumpor/thumbnails.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const MEDIA = join(ROT, 'media');
const LAGE = join(ROT, 'lage.json');
const TEXTER = JSON.parse(readFileSync(join(ROT, 'texter.json'), 'utf8'));

function arg(namn, standard = null) {
  const i = process.argv.indexOf(namn);
  return i >= 0 ? (process.argv[i + 1] ?? true) : standard;
}
const SKARPT = process.argv.includes('--skarpt');
const BARA = arg('--bara');
const STROM = arg('--strom');
const WATT = arg('--watt');
const ATERSTALL = arg('--aterstall');

// Butikerna. SE skrivs med appen "Bäver uppladdare" (SHOPIFY_*_SE: write_products +
// write_content, staged uploads mätta 2026-10-03); NO/DK/FI med spårningens appar.
export const BUTIKER = {
  se: { id: 'se', namn: 'Bäverbutiken', sprak: 'sv', url: 'https://baverbutiken.se', handle: 'balteslipmaskin-mini-3-i-1-knivslip-polerare', klient: { id: 'baverbutiken-upp', namn: 'Bäverbutiken', myshopify: '4snrw0-mg.myshopify.com', env_suffix: 'SE' } },
  no: { id: 'no', namn: 'Beverbutikken', sprak: 'nb', url: 'https://beverbutikken.no', handle: 'beltesliper-mini-3-i-1-knivsliper-polerer', register: 'beverbutikken' },
  dk: { id: 'dk', namn: 'Bæverbutiken', sprak: 'da', url: 'https://baeverbutiken.dk', handle: 'bandslibemaskine-mini-3-i-1-knivsliber-polerer', register: 'baeverbutiken' },
  fi: { id: 'fi', namn: 'Majavakauppa', sprak: 'fi', url: 'https://majavakauppa.fi', handle: 'nauhahiomakone-mini-3-in-1-hio-teroita-kiillota', register: 'majavakauppa' },
};

// Filerna i media/ och vad de är. Looparna är RIKTIG film ur TikTok-klippen i Axels dokument
// (2026-10-03, hans dom på de första: "väldigt AI-aktiga"): hero och papperstestet ur
// 7674842883618376974, kniven mot bandet + gnistorna ur 7647756056042409230. Nyckeln tomat_*
// heter så av historiska skäl och bär papperstestet. Bildordningen i galleriet: hero, kniv, stationerna, kök, lådan (butikens gamla foto).
const MEDIAFILER = {
  hero_bild: 'balteslip-hero-bank.jpg',
  bruk_bild: 'balteslip-bruk-kniv.jpg',
  stationer_bild: 'balteslip-stationer2.jpg',
  kok_bild: 'balteslip-kok.jpg',
  hero_mp4: 'balteslip-hero.mp4',
  hero_poster: 'balteslip-hero-poster.jpg',
  slipning_mp4: 'balteslip-slipning.mp4',
  slipning_poster: 'balteslip-slipning-poster.jpg',
  tomat_mp4: 'balteslip-papper.mp4',
  tomat_poster: 'balteslip-papper-poster.jpg',
};

export function lasLage() {
  return existsSync(LAGE) ? JSON.parse(readFileSync(LAGE, 'utf8')) : { strom: 'vantar', watt: null, butiker: {} };
}
function sparaLage(l) { writeFileSync(LAGE, JSON.stringify(l, null, 1) + '\n'); }

export function normalisera(html) {
  return String(html ?? '').replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function videoHtml(mp4, poster, alt, { kvadrat = false } = {}) {
  const ar = kvadrat ? '1/1' : '4/5';
  return `<video autoplay muted loop playsinline preload="metadata" poster="${esc(poster)}" style="display:block;width:100%;max-width:460px;height:auto;aspect-ratio:${ar};object-fit:cover;border-radius:14px" aria-label="${esc(alt)}"><source src="${esc(mp4)}" type="video/mp4"></video>`;
}
const bildtext = (t) => `<p style="font-size:.9em;opacity:.75;margin:6px 0 18px">${esc(t)}</p>`;

/** Ström-raden ur texterna: vantar | klar | adapter (+ watt). */
export function stromRad(t, strom, watt) {
  if (strom === 'vantar') return t.strom_vantar;
  if (!watt || !/^\d{2,4}$/.test(String(watt))) throw new Error(`--strom ${strom} kräver --watt <heltal> (effekten ur leverantörens svar).`);
  const nyckel = strom === 'klar' ? 'strom_klar' : strom === 'adapter' ? 'strom_adapter' : null;
  if (!nyckel) throw new Error(`Okänt --strom "${strom}". Finns: vantar, klar, adapter.`);
  return t[nyckel].replace('{{WATT}}', String(watt));
}

/** Specblocket (allt nytt), byggt ur språkets texter och butikens uppladdade media. */
export function specBlock(t, m, { strom, watt, ladaBild }) {
  const rader = ['rad_motor', 'rad_varvtal', 'rad_vinkel', 'rad_band', 'rad_stationer', 'rad_ingar', 'rad_storlek']
    .map((k) => `<li>${esc(t[k])}</li>`).join('');
  return [
    `<div class="bs-spec" data-bs="1">`,
    `<h3>${esc(t.rubrik_spec)}</h3><ul>${rader}</ul>`,
    `<h3>${esc(t.rubrik_strom)}</h3><p>${esc(stromRad(t, strom, watt))}</p>`,
    `<h3>${esc(t.rubrik_passar)}</h3><p>${esc(t.passar_ja)}</p><p>${esc(t.passar_nej)}</p>`,
    videoHtml(m.tomat_mp4, m.tomat_poster, t.bildtext_tomat), bildtext(t.bildtext_tomat),
    ladaBild ? `<p><img src="${esc(ladaBild)}" alt="${esc(t.alt_lada)}" loading="lazy" style="max-width:100%;height:auto;border-radius:14px"></p>${bildtext(t.bildtext_lada)}` : '',
    `</div>`,
  ].join('');
}

/**
 * Nya beskrivningen ur den gamla. Ren funktion: (gammalHtml, texter, media, val) → html.
 *  1. gamla <p><img …></p> bort (Temu-gifen och Temu-fotot),
 *  2. ett tidigare bs-spec-block bort,
 *  3. hero-loopen efter första </p>, slipningsloopen efter andra </p>,
 *  4. specblocket före sista <h3> (garanti/ångerrätt).
 */
// Gamla rader som säger emot specen (finska sidan påstod steglös hastighet — den har 7 steg).
const RATTELSER = {
  fi: [[/Nopeus säätyy portaattomasti, joten/g, 'Nopeudessa on 7 porrasta, joten'], [/portaaton nopeussäätö/g, '7 nopeutta']],
};

export function byggBeskrivning(gammal, t, m, val) {
  let html = String(gammal ?? '');
  for (const [re, till] of RATTELSER[val.sprak] ?? []) html = html.replace(re, till);
  html = html.replace(/<div class="bs-spec"[\s\S]*?<\/div>/g, '');
  html = html.replace(/<p>\s*<img[^>]*>\s*<\/p>/g, '');
  html = html.replace(/<video[\s\S]*?<\/video>/g, '');
  html = html.replace(/<p style="font-size:\.9em[^"]*">[^<]*<\/p>/g, '');
  const hero = videoHtml(m.hero_mp4, m.hero_poster, t.bildtext_hero, { kvadrat: true }) + bildtext(t.bildtext_hero);
  const slip = videoHtml(m.slipning_mp4, m.slipning_poster, t.bildtext_bruk) + bildtext(t.bildtext_bruk);
  let n = 0;
  html = html.replace(/<\/p>/g, (s) => { n += 1; if (n === 1) return s + hero; if (n === 2) return s + slip; return s; });
  if (n < 2) throw new Error('Gamla beskrivningen har färre än två stycken — bygg inte om den blint.');
  const sista = html.lastIndexOf('<h3>');
  if (sista < 0) throw new Error('Gamla beskrivningen saknar <h3> — bygg inte om den blint.');
  return html.slice(0, sista) + specBlock(t, m, val) + html.slice(sista);
}

/** Copy-reglerna på det NYA (docs/copy-regler.md): inga priser, inget butiksnamn, tankstreck bara mellan siffror. */
export function kontrollera(html) {
  const nytt = (html.match(/<div class="bs-spec"[\s\S]*?<\/div>/) ?? [''])[0].replace(/<[^>]+>/g, ' ');
  const fel = [];
  if (/\d ?kr\b|€|\bkr\b/i.test(nytt)) fel.push('ett pris i specblocket');
  if (/b[äæa]verbutik|majavakauppa|beverbutikk/i.test(nytt)) fel.push('butikens namn i specblocket');
  if (/[—]/.test(nytt)) fel.push('långt tankstreck i specblocket');
  if (/[^\d ]–|–[^\d ]/.test(nytt.replace(/\d ?– ?\d/g, '0'))) fel.push('kort tankstreck utanför ett sifferintervall');
  if (/\{\{WATT\}\}/.test(nytt)) fel.push('{{WATT}} är inte ifyllt');
  if (!nytt.trim()) fel.push('specblocket saknas');
  return fel;
}

/** Laddar upp en video till Shopify Files (VIDEO) och väntar på en mp4-källa. */
export async function tillShopifyVideo(klient, lokalFil, { forsok = 60 } = {}) {
  const namn = basename(lokalFil);
  const staged = await klient.graphql(
    `mutation($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl parameters{name value}} userErrors{message}}}`,
    { input: [{ filename: namn, mimeType: 'video/mp4', resource: 'VIDEO', fileSize: String(readFileSync(lokalFil).length), httpMethod: 'POST' }] },
  );
  const mal = staged.stagedUploadsCreate.stagedTargets[0];
  if (!mal) throw new Error('Shopify gav ingen staged target för videon.');
  const form = new FormData();
  for (const p of mal.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([readFileSync(lokalFil)], { type: 'video/mp4' }), namn);
  const svar = await fetch(mal.url, { method: 'POST', body: form });
  if (!svar.ok) throw new Error(`Staged upload (video) misslyckades: ${svar.status} ${(await svar.text()).slice(0, 200)}`);
  const skapad = await klient.graphql(
    `mutation($files:[FileCreateInput!]!){fileCreate(files:$files){files{id fileStatus} userErrors{message}}}`,
    { files: [{ originalSource: mal.resourceUrl, contentType: 'VIDEO', alt: namn }] },
  );
  const id = skapad.fileCreate.files[0]?.id;
  if (!id) throw new Error(`fileCreate (video) gav inget id: ${JSON.stringify(skapad).slice(0, 200)}`);
  for (let i = 0; i < forsok; i++) {
    const las = await klient.graphql(`query($id:ID!){node(id:$id){... on Video{fileStatus sources{url format mimeType width height} originalSource{url}}}}`, { id });
    const n = las.node;
    if (n?.fileStatus === 'READY') {
      const mp4 = (n.sources ?? []).filter((s) => s.mimeType === 'video/mp4' && s.url).sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
      const vald = mp4.find((s) => (s.width ?? 0) <= 720) ?? mp4[0];
      if (vald) return vald.url;
      if (n.originalSource?.url) return n.originalSource.url;
      throw new Error(`${namn} är READY men utan mp4-källa.`);
    }
    if (n?.fileStatus === 'FAILED') throw new Error(`Shopify kunde inte processa videon ${namn}.`);
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error(`${namn} blev aldrig READY — vänta och kör om, ladda inte upp igen.`);
}

async function klientFor(b) {
  return skapaKlient(b.klient ?? lasButik(b.register));
}

async function laddaUppMedia(klient, b, lage, logg) {
  const minne = lage.butiker[b.id] = lage.butiker[b.id] ?? {};
  minne.media = minne.media ?? {};
  for (const [nyckel, fil] of Object.entries(MEDIAFILER)) {
    if (minne.media[nyckel]) continue;
    const sokvag = join(MEDIA, fil);
    if (!existsSync(sokvag)) throw new Error(`Saknar ${sokvag}.`);
    let url;
    try {
      url = fil.endsWith('.mp4') ? await tillShopifyVideo(klient, sokvag) : await tillShopify(klient, sokvag);
    } catch (e) {
      // NO/DK/FI-apparna saknar write_files (mätt 2026-10-03). Då länkas Bäverbutikens
      // egna filer — samma väg som den gamla Temu-gifen gick, och galleribilderna
      // kopieras ändå in i butiken av productCreateMedia.
      if (!/write_files/.test(e.message)) throw e;
      const se = lage.butiker.se?.media ?? {};
      if (!se[nyckel]) throw new Error(`${b.namn}: appen saknar write_files och Bäverbutiken har ingen ${fil} att låna — kör SE först.`);
      url = se[nyckel];
      minne.media_kalla = 'baverbutiken (appen saknar write_files)';
      logg(`   ↪ ${fil}: appen saknar write_files, länkar Bäverbutikens fil`);
    }
    minne.media[nyckel] = url;
    sparaLage(lage);
    logg(`   ↑ ${fil} → ${url}`);
  }
  return minne.media;
}

/** Lägger de tre nya bilderna först i produktens galleri (en gång), gamla fotot sist. */
async function ordnaGalleri(klient, b, produkt, media, t, lage, logg) {
  const minne = lage.butiker[b.id];
  if (minne.galleri) { logg('   galleriet redan ordnat'); return; }
  const nya = [
    { originalSource: media.hero_bild, alt: t.alt_hero, mediaContentType: 'IMAGE' },
    { originalSource: media.bruk_bild, alt: t.alt_bruk, mediaContentType: 'IMAGE' },
    { originalSource: media.stationer_bild, alt: t.bildtext_stationer, mediaContentType: 'IMAGE' },
    { originalSource: media.kok_bild, alt: t.alt_kok, mediaContentType: 'IMAGE' },
  ];
  const skapad = await klient.graphql(
    `mutation($id:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$id,media:$media){media{id status} mediaUserErrors{message}}}`,
    { id: produkt.id, media: nya },
  );
  const fel = skapad.productCreateMedia.mediaUserErrors;
  if (fel?.length) throw new Error(`productCreateMedia: ${fel.map((f) => f.message).join('; ')}`);
  const nyaId = skapad.productCreateMedia.media.map((m) => m.id);
  // Vänta tills de är READY, sedan lägg dem först.
  for (let i = 0; i < 40; i++) {
    const d = await klient.graphql(`query($id:ID!){product(id:$id){media(first:20){nodes{id status}}}}`, { id: produkt.id });
    const noder = d.product.media.nodes;
    const vara = noder.filter((n) => nyaId.includes(n.id));
    if (vara.length === nyaId.length && vara.every((n) => n.status === 'READY')) break;
    if (vara.some((n) => n.status === 'FAILED')) throw new Error('En av de nya galleribilderna blev FAILED i Shopify.');
    await new Promise((r) => setTimeout(r, 2000));
  }
  const moves = nyaId.map((id, i) => ({ id, newPosition: String(i) }));
  const om = await klient.graphql(
    `mutation($id:ID!,$moves:[MoveInput!]!){productReorderMedia(id:$id,moves:$moves){job{id} mediaUserErrors{message}}}`,
    { id: produkt.id, moves },
  );
  const fel2 = om.productReorderMedia.mediaUserErrors;
  if (fel2?.length) throw new Error(`productReorderMedia: ${fel2.map((f) => f.message).join('; ')}`);
  minne.galleri = { nya: nyaId, datum: new Date().toISOString() };
  sparaLage(lage);
  logg(`   galleri: ${nyaId.length} nya bilder först, gamla fotot kvar sist`);
}

const Q = `query($h:String!){productByHandle(handle:$h){id title handle descriptionHtml featuredImage{url} media(first:20){nodes{id ... on MediaImage{image{url}}}}}}`;

async function korButik(b, lage, logg) {
  const t = TEXTER[b.sprak];
  if (!t) throw new Error(`Inga texter för språket ${b.sprak}.`);
  logg(`\n== ${b.namn} (${b.sprak}) ${b.url}/products/${b.handle}`);
  const klient = await klientFor(b);
  const d = await klient.graphql(Q, { h: b.handle });
  const p = d.productByHandle;
  if (!p) throw new Error(`${b.namn}: hittar ingen produkt med handle ${b.handle}.`);
  const gammal = p.descriptionHtml ?? '';
  logg(`   produkt: ${p.title} (${p.id}), ${p.media.nodes.length} media, beskrivning ${normalisera(gammal).length} tecken`);

  if (ATERSTALL) {
    const mapp = join(ROT, 'backup');
    const filer = existsSync(mapp) ? readdirSync(mapp).filter((f) => f.endsWith(`-${b.id}.html`)).sort() : [];
    if (!filer.length) throw new Error(`Ingen backup för ${b.id}.`);
    const html = readFileSync(join(mapp, filer.at(-1)), 'utf8');
    logg(`   återställer ${filer.at(-1)} (${normalisera(html).length} tecken)`);
    if (!SKARPT) return;
    await klient.graphql(`mutation($p:ProductUpdateInput!){productUpdate(product:$p){product{id} userErrors{message}}}`, { p: { id: p.id, descriptionHtml: html } });
    logg('   ✅ återställd');
    return;
  }

  const minne = lage.butiker[b.id] ?? {};
  const mediaKlart = minne.media && Object.keys(MEDIAFILER).every((k) => minne.media[k]);
  let media = minne.media ?? {};
  if (!mediaKlart) {
    if (!SKARPT) {
      logg(`   torrt: ${Object.keys(MEDIAFILER).filter((k) => !media[k]).length} mediafiler laddas upp vid skarp körning`);
      media = Object.fromEntries(Object.entries(MEDIAFILER).map(([k, f]) => [k, media[k] ?? `https://cdn.shopify.com/PLATSHALLARE/${f}`]));
    } else {
      media = await laddaUppMedia(klient, b, lage, logg);
    }
  }
  // Lådbilden = butikens eget gamla produktfoto (Temu-fotot), aldrig en annan butiks CDN.
  const lada = p.featuredImage?.url ?? p.media.nodes.find((n) => n.image?.url)?.image?.url ?? null;
  if (!lada) logg('   ⚠️ produkten saknar ett eget foto av lådans innehåll — bilden hoppas över');

  const ny = byggBeskrivning(gammal, t, media, { strom: lage.strom, watt: lage.watt, ladaBild: lada, sprak: b.sprak });
  const fel = kontrollera(ny);
  if (fel.length) throw new Error(`${b.namn}: stoppar — ${fel.join('; ')}`);
  mkdirSync(join(ROT, 'output'), { recursive: true });
  writeFileSync(join(ROT, 'output', `${b.id}.html`), ny);
  const rubriker = (h) => [...h.matchAll(/<h3>([^<]*)<\/h3>/g)].map((m) => m[1]);
  logg(`   rubriker: ${rubriker(ny).join(' | ')}`);
  logg(`   media i texten: ${(ny.match(/<video\b/g) ?? []).length} video, ${(ny.match(/<img\b/g) ?? []).length} bild · ${normalisera(ny).length} tecken · output/${b.id}.html`);
  if (normalisera(gammal) === normalisera(ny)) { logg('   samma text redan live'); }
  if (!SKARPT) return;

  mkdirSync(join(ROT, 'backup'), { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  writeFileSync(join(ROT, 'backup', `${stamp}-${b.id}.html`), gammal);
  if (normalisera(gammal) !== normalisera(ny)) {
    const u = await klient.graphql(`mutation($p:ProductUpdateInput!){productUpdate(product:$p){product{id descriptionHtml} userErrors{message}}}`, { p: { id: p.id, descriptionHtml: ny } });
    const tillbaka = u.productUpdate.product?.descriptionHtml ?? '';
    const ok = normalisera(tillbaka) === normalisera(ny);
    logg(ok ? '   ✅ beskrivningen bytt och tillbakaläst' : `   ⚠️ tillbakaläst text skiljer sig (${normalisera(tillbaka).length} mot ${normalisera(ny).length} tecken)`);
    if (!ok) {
      // Shopify normaliserar ibland attributordning — kräv bara att det nya finns.
      const tst = [t.rubrik_spec, t.rubrik_strom, media.hero_mp4, media.tomat_mp4].every((s) => tillbaka.includes(s));
      if (!tst) throw new Error(`${b.namn}: det nya blocket saknas i tillbakaläsningen.`);
      logg('   (rubrikerna och videokällorna finns i tillbakaläsningen — godkänt)');
    }
  }
  await ordnaGalleri(klient, b, p, media, t, lage, logg);

  // Kundens vy: publika .json ska bära specrubriken och videokällan.
  try {
    const r = await fetch(`${b.url}/products/${b.handle}.json`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const j = await r.json();
    const pub = j?.product?.body_html ?? '';
    const bilder = j?.product?.images?.length ?? 0;
    const har = pub.includes(esc(t.rubrik_spec)) && pub.includes('<video');
    logg(har ? `   ✅ kundvyn bär specblocket och videon · ${bilder} bilder i galleriet` : `   ⚠️ kundvyn visar inte det nya ännu (${r.status}) — cache eller fel`);
  } catch (e) {
    logg(`   ⚠️ kunde inte läsa kundvyn: ${e.message}`);
  }
}

async function main() {
  const lage = lasLage();
  if (STROM) { lage.strom = STROM; lage.watt = WATT ?? lage.watt ?? null; stromRad(TEXTER.sv, lage.strom, lage.watt); }
  const logg = (s) => console.log(s);
  logg(`Ström-raden: ${lage.strom}${lage.watt ? ` (${lage.watt} W)` : ''} · ${SKARPT ? 'SKARPT' : 'torrt'}`);
  const valda = BARA ? [BUTIKER[BARA]].filter(Boolean) : Object.values(BUTIKER);
  if (!valda.length) throw new Error(`Okänd butik "${BARA}". Finns: ${Object.keys(BUTIKER).join(', ')}.`);
  const fel = [];
  for (const b of valda) {
    try { await korButik(b, lage, logg); } catch (e) { fel.push(`${b.namn}: ${e.message}`); logg(`   ❌ ${e.message}`); }
  }
  if (SKARPT) sparaLage(lage);
  if (fel.length) { console.error(`\n${fel.length} butik(er) gick inte:\n- ${fel.join('\n- ')}`); process.exit(1); }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
}
