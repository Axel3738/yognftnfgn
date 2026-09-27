#!/usr/bin/env node
// factory/marknadskoll.mjs — vakten för EN OPS-butiks marknad: placeringarna,
// spenden per placering och språket på sidorna kunden landar på.
//
//   node factory/marknadskoll.mjs <butik> --marknad US [--torr] [--discord] [--json <fil>] [--utan-sidor]
//
// Axels order 2026-09-27, efter natten då Meta lade 16 654 kr av en ny annons
// i Instagram Stories utan ett enda köp: "kör bara flöden på fb och ig" och
// "jag vet inte men du behöver hålla koll på det". Vakten mäter tre saker och
// rättar EN:
//
//   1. PLACERINGAR — varje adset i marknadens ACTIVE kampanjer ska bära exakt
//      marknadens `placeringar` (factory/opsmarknader.mjs). Ett adset som
//      glidit (nytt via appen får Advantage+-placeringar) sätts tillbaka och
//      läses tillbaka; --torr visar bara. En marknad utan `placeringar`
//      (SE/NO/DK) mäts inte på den punkten.
//   2. SPEND PER PLACERING — i går och i dag, ur Metas insights. Kronor
//      utanför de tillåtna placeringarna är ett larm: det ska inte kunna hända
//      när adseten är rätt, så händer det är något annat fel.
//   3. SPRÅKET — startsidan, annonsernas landningssidor, produktsidorna de
//      länkar till och kassan, lästa i Chromium som marknadens kund. Svenska
//      rader ⇒ larm med raden citerad. Judge.me-recensionerna räknas inte
//      (Axel 2026-09-27: "recensionerna har aldrig varit problemet"), inte
//      heller valutaväljaren. Kassans förvalda land ska vara marknadens.
//
// Rapporten är svensk i stdout och engelsk i Discord (--discord, BARA när
// något är fel: #annons-uppladdning i butikens server, Axel pingas under
// ACTION NEEDED). Läs-bar utom punkt 1. Rör aldrig annonser, budgetar,
// status eller kampanjer. Noll beroenden utöver Chromium för punkt 3.

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasButik } from './butik.mjs';
import { laddaEnv } from './env.mjs';
import { marknadFor, OPS_MARKNADSKODER, domanForMarknad } from './opsmarknader.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const PLAYWRIGHT = process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROME_KANDIDATER = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'];
const SPRAKTAGG = { sv: 'sv-SE', nb: 'nb-NO', da: 'da-DK', en: 'en-US', fi: 'fi-FI' };

// --------------------------------------------------------------- Placeringar

/** Metas namn i targeting → namnet i insights-breakdownen platform_position. */
const INSIGHTSNAMN = Object.freeze({
  facebook: { feed: 'feed', story: 'facebook_stories', facebook_reels: 'facebook_reels', marketplace: 'marketplace', video_feeds: 'video_feeds', right_hand_column: 'right_hand_column', search: 'search', instream_video: 'instream_video', facebook_reels_overlay: 'facebook_reels_overlay', profile_feed: 'facebook_profile_feed', notification: 'facebook_notification' },
  instagram: { stream: 'feed', story: 'instagram_stories', reels: 'instagram_reels', explore: 'instagram_explore', explore_home: 'instagram_explore_home', ig_search: 'instagram_search', profile_feed: 'instagram_profile_feed', profile_reels: 'instagram_profile_reels' },
});
const POSITIONSFALT = Object.freeze({ facebook: 'facebook_positions', instagram: 'instagram_positions', audience_network: 'audience_network_positions', messenger: 'messenger_positions', threads: 'threads_positions' });

/** De placeringar (plattform/position i insights-termer) som marknaden tillåter. */
export function tillatnaPlaceringar(placeringar) {
  const ut = new Set();
  for (const plattform of placeringar?.publisher_platforms ?? []) {
    const positioner = placeringar[POSITIONSFALT[plattform]] ?? [];
    if (positioner.length === 0) { ut.add(`${plattform}/*`); continue; }
    for (const p of positioner) ut.add(`${plattform}/${INSIGHTSNAMN[plattform]?.[p] ?? p}`);
  }
  return ut;
}

const somMangd = (v) => new Set((Array.isArray(v) ? v : []).map(String));
const likaMangder = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

/** Avviker adsetets targeting från marknadens placeringar? → { avviker, skillnader[] } */
export function placeringsAvvikelse(targeting, placeringar) {
  const skillnader = [];
  const t = targeting ?? {};
  const vill = placeringar ?? {};
  const falt = ['publisher_platforms', ...Object.values(POSITIONSFALT)];
  for (const f of falt) {
    const har = somMangd(t[f]);
    const ska = somMangd(vill[f]);
    if (f !== 'publisher_platforms' && ska.size === 0 && !(vill.publisher_platforms ?? []).includes(Object.keys(POSITIONSFALT).find((k) => POSITIONSFALT[k] === f))) {
      // Plattformen är inte tillåten alls — positioner för den spelar ingen roll
      // så länge publisher_platforms stänger ute den; men står de kvar är det
      // ändå en glidning värd att städa.
      if (har.size > 0) skillnader.push(`${f}: ${[...har].join(',')} ska bort`);
      continue;
    }
    if (!likaMangder(har, ska)) skillnader.push(`${f}: ${[...har].join(',') || '(tomt = alla)'} ska vara ${[...ska].join(',') || '(tomt)'}`);
  }
  return { avviker: skillnader.length > 0, skillnader };
}

/** Targeting med marknadens placeringar inlagda och främmande plattformars positioner borttagna. */
export function nyTargeting(targeting, placeringar) {
  const ut = { ...(targeting ?? {}) };
  for (const f of Object.values(POSITIONSFALT)) delete ut[f];
  delete ut.publisher_platforms;
  return { ...ut, ...placeringar };
}

/** Insights-rader (spend > 0) utanför de tillåtna placeringarna. "unknown" räknas inte. */
export function spendUtanfor(rader, tillatna) {
  return (rader ?? [])
    .filter((r) => Number(r.spend) > 0)
    .filter((r) => r.publisher_platform !== 'unknown')
    .filter((r) => !tillatna.has(`${r.publisher_platform}/${r.platform_position}`) && !tillatna.has(`${r.publisher_platform}/*`));
}

// --------------------------------------------------------------- Språket

// Ord som bara finns på svenska (inte norska/danska/engelska), så att samma
// detektor duger på /nb och /da: "med", "eller", "pris", "garanti" delas med
// norskan och stoppas därför bara på engelska sidor.
const SVENSKA_ORD = ['och', 'inte', 'från', 'köp', 'leverans', 'varukorg', 'kundvagn', 'beställ', 'beställning', 'sök', 'stäng', 'storlek', 'recension', 'recensioner', 'verifierat', 'husvagn', 'husbil', 'skydd', 'skyddar', 'passar', 'dagar', 'arbetsdagar', 'betalning', 'lägg', 'hem', 'kassa', 'spåra', 'paket', 'nöjd', 'lösning', 'använda', 'också', 'mycket', 'väder', 'sommar'];
// Samma stavning på norska/danska ("frakt", "enkel", "kvalitet", "regn",
// "vinter") — bevisar ingenting på /nb och /da, bara på engelska och finska
// sidor. Aldrig ett ord som också är engelska ("over", "under", "till"):
// första torrkörningen 2026-09-27 flaggade fem engelska rader på dem.
const DELADE_MED_NORDEN = ['med', 'eller', 'för', 'pris', 'garanti', 'tak', 'kr', 'frakt', 'enkel', 'kvalitet', 'regn', 'vinter'];

/** Regex för svenska rader på en sida med språket `locale` (en, nb, da, fi, sv → null). */
export function svenskDetektor(locale) {
  if (locale === 'sv' || !locale) return null;
  const ord = locale === 'en' || locale === 'fi' ? [...SVENSKA_ORD, ...DELADE_MED_NORDEN] : SVENSKA_ORD;
  const tecken = locale === 'en' || locale === 'fi' ? '[åäöÅÄÖ]' : '[äöÄÖ]';
  return new RegExp(`${tecken}|\\b(${ord.join('|')})\\b`, 'i');
}

/** Raderna som ser svenska ut, unika, i ordning. Valutaväljarens rader ("SEK kr") räknas inte. */
export function svenskaRader(rader, locale) {
  const rx = svenskDetektor(locale);
  if (!rx) return [];
  const sedda = new Set();
  const ut = [];
  for (const rad0 of rader ?? []) {
    const rad = String(rad0).replace(/\s+/g, ' ').trim();
    if (!rad || sedda.has(rad)) continue;
    if (/^[A-Za-zÅÄÖåäöÆØæø .'-]+\s*\((SEK|NOK|DKK|EUR|USD|GBP|AUD|CAD|NZD)\b.*\)$/.test(rad)) continue; // "Sverige (SEK kr)"
    if (/^(SEK|NOK|DKK|EUR|USD|GBP|AUD|CAD|NZD)\s*(kr|kr\.|€|\$|£)?$/i.test(rad)) continue;
    if (rx.test(rad)) { sedda.add(rad); ut.push(rad); }
  }
  return ut;
}

/** Unika landningslänkar ur annonsernas creatives (link_data, video_data, asset_feed_spec). */
export function landningslankar(annonser) {
  const ut = [];
  const sedda = new Set();
  const lagg = (u) => { const s = String(u ?? '').trim(); if (/^https?:\/\//.test(s) && !sedda.has(s)) { sedda.add(s); ut.push(s); } };
  for (const a of annonser ?? []) {
    const c = a?.creative ?? {};
    const oss = c.object_story_spec ?? {};
    for (const d of [oss.link_data, oss.video_data, oss.photo_data]) {
      if (!d) continue;
      lagg(d.link);
      lagg(d.call_to_action?.value?.link);
    }
    for (const l of c.asset_feed_spec?.link_urls ?? []) lagg(l.website_url);
  }
  return ut;
}

// --------------------------------------------------------------- Rapporten

const kr = (n) => Math.round(Number(n) || 0).toLocaleString('sv-SE').replace(/ /g, ' ');

/** Svensk rapport ur resultatet, en rad per fynd. */
export function byggRapport(r) {
  const rader = [`Marknadsvakten ${r.brand} ${r.marknad} — ${r.datum}`];
  if (r.kampanjer.length === 0) rader.push(`⚠️ ingen ACTIVE kampanj med ${r.prefix} i kontot ${r.act} — inget att vakta`);
  for (const k of r.kampanjer) rader.push(`kampanj ${k.name} (${k.id}): ${k.adsets.length} adsets, ${k.annonser} annonser ACTIVE, budget ${kr(k.daily_budget / 100)}/dag`);
  if (!r.placeringar) rader.push(`placeringar: marknaden ${r.marknad} har inga i opsmarknader.mjs — mäts inte`);
  else {
    rader.push(`placeringar ska vara ${JSON.stringify(r.placeringar)}`);
    const glidna = r.adsets.filter((a) => a.avviker);
    if (glidna.length === 0) rader.push(`✅ alla ${r.adsets.length} adsets bär rätt placeringar`);
    for (const a of glidna) rader.push(`${a.rattad ? '🔧' : '⚠️'} ${a.name} (${a.id}) avvek: ${a.skillnader.join('; ')}${a.rattad ? ' — satt tillbaka och tillbakaläst' : r.torr ? ' — --torr, inte rättat' : a.fel ? ` — rättningen misslyckades: ${a.fel}` : ''}`);
  }
  for (const [namn, rows] of Object.entries(r.spend)) {
    const tot = rows.reduce((s, x) => s + Number(x.spend), 0);
    const ut = r.spendUtanfor[namn] ?? [];
    const fore = r.spendFore?.[namn];
    rader.push(`spend ${namn}: ${kr(tot)} kr på ${rows.filter((x) => Number(x.spend) > 0).length} placeringar${ut.length ? ` — ${fore ? 'ℹ️' : '⚠️'} ${kr(ut.reduce((s, x) => s + Number(x.spend), 0))} kr UTANFÖR flödet: ${ut.filter((x) => Number(x.spend) >= 1).map((x) => `${x.publisher_platform}/${x.platform_position} ${kr(x.spend)} kr`).join(', ')}${fore ? ` (adseten ändrades ${r.senastAndrad} — dygnet bär spend från före bytet, inget larm)` : ''}` : ' — ✅ allt i tillåtna placeringar'}`);
  }
  if (r.sidor === null) rader.push('sidorna: hoppade (--utan-sidor)');
  else if (r.sidor.fel) rader.push(`⚠️ sidorna kunde inte läsas: ${r.sidor.fel}`);
  else {
    for (const s of r.sidor.lasta) rader.push(`${s.svenska.length ? '⚠️' : '✅'} ${s.typ} ${s.url} — lang=${s.lang ?? '?'}, ${s.rader} rader${s.svenska.length ? `, ${s.svenska.length} svenska: ${s.svenska.slice(0, 3).map((x) => `"${x.slice(0, 60)}"`).join(' · ')}` : ''}${s.fel ? ` — fel: ${s.fel}` : ''}`);
    if (r.sidor.kassa) {
      const k = r.sidor.kassa;
      rader.push(`${k.fel || k.svenska.length || (k.land && k.land !== r.country) ? '⚠️' : '✅'} kassan ${k.url ?? ''} — lang=${k.lang ?? '?'}, land=${k.land ?? '?'} (ska vara ${r.country ?? 'butikens'}), ${k.svenska.length} svenska rader${k.svenska.length ? `: ${k.svenska.slice(0, 3).map((x) => `"${x.slice(0, 60)}"`).join(' · ')}` : ''}${k.fel ? ` — fel: ${k.fel}` : ''}`);
    }
  }
  return rader;
}

/** Discord-jobb (tools/discord-rapport.mjs) — bara när något är fel. Engelska. */
export function byggJobb(r) {
  const gjort = [];
  const varningar = [];
  const action = [];
  for (const a of r.adsets.filter((x) => x.avviker)) {
    if (a.rattad) gjort.push(`Ad set ${a.name} had drifted placements (${a.skillnader.join('; ')}) — reset to feed only and read back.`);
    else varningar.push(`Ad set ${a.name} has drifted placements (${a.skillnader.join('; ')}) — ${r.torr ? 'dry run, not reset' : `reset failed: ${a.fel}`}.`);
  }
  for (const [namn, ut] of Object.entries(r.spendUtanfor)) {
    if (ut.length && !r.spendFore?.[namn]) varningar.push(`Spend outside the allowed placements (${namn === 'i går' ? 'yesterday' : 'today'}): ${ut.filter((x) => Number(x.spend) >= 1).map((x) => `${x.publisher_platform}/${x.platform_position} ${kr(x.spend)} SEK`).join(', ')}.`);
  }
  if (r.sidor?.fel) varningar.push(`Pages could not be read in Chromium: ${r.sidor.fel}`);
  for (const s of r.sidor?.lasta ?? []) {
    if (s.svenska.length) action.push(`Swedish text on ${s.url}: ${s.svenska.slice(0, 2).map((x) => `"${x.slice(0, 50)}"`).join(', ')} — a Claude session must fix the translation.`);
    if (s.fel) varningar.push(`Could not read ${s.url}: ${s.fel}`);
  }
  const k = r.sidor?.kassa;
  if (k?.svenska?.length) action.push(`Swedish text in the checkout (${k.url}): ${k.svenska.slice(0, 2).map((x) => `"${x.slice(0, 50)}"`).join(', ')}.`);
  if (k?.land && r.country && k.land !== r.country) action.push(`Checkout preselects ${k.land}, not ${r.country} — check Shopify Markets.`);
  if (k?.fel) varningar.push(`Checkout could not be read: ${k.fel}`);
  return {
    brand: r.brand, butik: r.butik, datum: r.datum, lage: 'oversatt', marknad: r.marknad, kanal: 'annons-uppladdning',
    gjort, varningar, action_axel: action,
    problem: gjort.length + varningar.length + action.length > 0,
  };
}

// --------------------------------------------------------------- Meta

async function metaDel() {
  const m = await import('../tools/meta-lib.mjs');
  return m;
}

async function hamtaKampanjer(api, alla, act, prefix) {
  const lista = await alla(`act_${act}/campaigns`, { fields: 'id,name,status,effective_status,daily_budget', filtering: JSON.stringify([{ field: 'name', operator: 'CONTAIN', value: prefix }]) });
  return (lista ?? []).filter((k) => k.effective_status === 'ACTIVE');
}

async function hamtaSpend(alla, act, prefix, preset) {
  return (await alla(`act_${act}/insights`, {
    level: 'campaign', fields: 'campaign_name,spend,impressions,actions', breakdowns: 'publisher_platform,platform_position',
    filtering: JSON.stringify([{ field: 'campaign.name', operator: 'CONTAIN', value: prefix }]), date_preset: preset,
  })) ?? [];
}

// --------------------------------------------------------------- Chromium

async function startaChromium() {
  let pw;
  try { pw = await import(PLAYWRIGHT); } catch (e) { throw new Error(`Playwright saknas (${e.message.split('\n')[0]})`); }
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const args = ['--no-sandbox', '--ignore-certificate-errors'];
  const fel = [];
  for (const exe of [null, ...CHROME_KANDIDATER]) {
    if (exe && !existsSync(exe)) continue;
    try { return await pw.chromium.launch({ headless: true, args, proxy, ...(exe ? { executablePath: exe } : {}) }); }
    catch (e) { fel.push(e.message.split('\n')[0]); }
  }
  throw new Error(`Chromium startade inte: ${fel.join(' | ')}`);
}

// Synlig text utan det som inte är sidans eget språk: skript, stilar,
// rullistor (valutaväljaren, varianter), Judge.me-rutan. Körs I webbläsaren
// (page.evaluate) — en riktig funktion, inte en sträng: en sträng utvärderas
// som uttryck och ger funktionen själv, inte dess resultat (mätt 2026-09-27).
function textUrSidan() {
  const kopia = document.body.cloneNode(true);
  for (const el of kopia.querySelectorAll('script,style,noscript,select,option,[class*="jdgm-"],[id*="judgeme"],form[action*="localization"],[class*="localization"]')) el.remove();
  const ruta = document.createElement('div'); ruta.style.position = 'fixed'; ruta.style.left = '-99999px'; ruta.appendChild(kopia); document.documentElement.appendChild(ruta);
  const text = kopia.innerText; ruta.remove();
  const produktlankar = [...document.querySelectorAll('a[href*="/products/"]')].map((a) => a.href);
  return { lang: document.documentElement.lang, text, produktlankar, variant: document.querySelector('form[action*="/cart/add"] [name="id"]')?.value ?? null };
}

function kassaUrSidan() {
  return { lang: document.documentElement.lang, text: document.body.innerText, land: document.querySelector('select[name="countryCode"]')?.value ?? null };
}

async function lasSida(page, url, typ, locale) {
  const ut = { typ, url, lang: null, rader: 0, svenska: [], produktlankar: [], variant: null, fel: null };
  try {
    try { await page.goto(url, { waitUntil: 'load', timeout: 60000 }); }
    catch { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); }
    await page.waitForTimeout(1500);
    const d = await page.evaluate(textUrSidan);
    const rader = String(d.text ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
    ut.lang = d.lang; ut.rader = rader.length; ut.svenska = svenskaRader(rader, locale); ut.produktlankar = d.produktlankar ?? []; ut.variant = d.variant;
  } catch (e) { ut.fel = e.message.split('\n')[0]; }
  return ut;
}

async function lasKassa(page, { origin, prefix, country, variant, locale }) {
  const ut = { url: null, lang: null, land: null, svenska: [], fel: null };
  try {
    const status = await page.evaluate(async ({ prefix, variant }) => {
      const r = await fetch(`${prefix}/cart/add.js`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: variant, quantity: 1 }] }) });
      return r.status;
    }, { prefix, variant });
    if (status !== 200) throw new Error(`cart/add.js svarade ${status}`);
    const kassaUrl = `${origin}${prefix}/checkout${country ? `?country=${country}` : ''}`;
    try { await page.goto(kassaUrl, { waitUntil: 'networkidle', timeout: 90000 }); }
    catch { await page.goto(kassaUrl, { waitUntil: 'domcontentloaded', timeout: 90000 }); }
    await page.waitForTimeout(3000);
    ut.url = page.url();
    const d = await page.evaluate(kassaUrSidan);
    ut.lang = d.lang; ut.land = d.land;
    ut.svenska = svenskaRader(String(d.text ?? '').split('\n'), locale);
  } catch (e) { ut.fel = e.message.split('\n')[0]; }
  return ut;
}

/** Läser sidorna som marknadens kund. → { lasta[], kassa, fel } */
async function lasSidor({ hem, landningar, locale, country, prefix, maxSidor = 8 }) {
  const ut = { lasta: [], kassa: null, fel: null };
  let browser;
  try { browser = await startaChromium(); } catch (e) { ut.fel = e.message; return ut; }
  try {
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, locale: SPRAKTAGG[locale] ?? locale ?? 'en-US', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
    const page = await ctx.newPage();
    ut.lasta.push(await lasSida(page, hem, 'startsida', locale));
    const produktlankar = new Set();
    for (const l of landningar.slice(0, maxSidor)) {
      const s = await lasSida(page, l, 'landningssida', locale);
      ut.lasta.push(s);
      for (const p of s.produktlankar) produktlankar.add(p.split('#')[0]);
    }
    let variant = null; let origin = null;
    for (const p of [...produktlankar].slice(0, 4)) {
      const s = await lasSida(page, p, 'produktsida', locale);
      ut.lasta.push(s);
      if (!variant && s.variant) { variant = s.variant; origin = new URL(p).origin; }
    }
    if (variant) ut.kassa = await lasKassa(page, { origin, prefix, country, variant, locale });
    else ut.kassa = { url: null, lang: null, land: null, svenska: [], fel: 'ingen produktsida med varukorgsformulär hittad — kassan inte läst' };
  } catch (e) { ut.fel = e.message.split('\n')[0]; }
  finally { await browser.close().catch(() => {}); }
  return ut;
}

// --------------------------------------------------------------- Huvud

function butiksfil(nyckel) {
  const id = String(nyckel).split('/')[0];
  const fil = join(ROT, 'butiker', `${id}.yaml`);
  if (!existsSync(fil)) throw new Error(`hittar inte ${fil}`);
  return { id, fil };
}

export async function kor({ nyckel, marknad, torr = false, utanSidor = false, logg = console.log }) {
  laddaEnv?.();
  const M = String(marknad).toUpperCase();
  if (!OPS_MARKNADSKODER.includes(M)) throw new Error(`--marknad ${M} finns inte. Välj ${OPS_MARKNADSKODER.join(', ')}.`);
  const m = marknadFor(M);
  const { id: butikId, fil } = butiksfil(nyckel);
  const { butik } = lasButik(fil);
  const brand = butik.butik.brand;
  const prefix = `${brand.toUpperCase()}_${M}_`;
  const datum = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
  const { api, alla } = await metaDel();

  const r = { brand, butik: butikId, marknad: M, datum, act: m.act, prefix, country: m.country, placeringar: m.placeringar ?? null, torr, kampanjer: [], adsets: [], senastAndrad: null, spend: {}, spendUtanfor: {}, spendFore: {}, sidor: null };

  // 1. Placeringarna.
  const kampanjer = await hamtaKampanjer(api, alla, m.act, prefix);
  const annonser = [];
  for (const k of kampanjer) {
    const adsets = await alla(`${k.id}/adsets`, { fields: 'id,name,status,effective_status,targeting,updated_time' });
    for (const a of adsets ?? []) {
      const t = Date.parse(a.updated_time);
      if (Number.isFinite(t) && (!r.senastAndrad || t > Date.parse(r.senastAndrad))) r.senastAndrad = new Date(t).toISOString();
    }
    const ads = (await alla(`${k.id}/ads`, { fields: 'id,name,status,effective_status,creative{object_story_spec,asset_feed_spec}' })) ?? [];
    const aktiva = ads.filter((a) => a.effective_status === 'ACTIVE');
    annonser.push(...aktiva);
    r.kampanjer.push({ id: k.id, name: k.name, daily_budget: Number(k.daily_budget) || 0, adsets: adsets ?? [], annonser: aktiva.length });
    for (const a of adsets ?? []) {
      const post = { id: a.id, name: a.name, kampanj: k.name, avviker: false, skillnader: [], rattad: false, fel: null };
      if (r.placeringar) {
        const { avviker, skillnader } = placeringsAvvikelse(a.targeting, r.placeringar);
        post.avviker = avviker; post.skillnader = skillnader;
        if (avviker && !torr) {
          try {
            await api(a.id, { method: 'POST', form: { targeting: JSON.stringify(nyTargeting(a.targeting, r.placeringar)) } });
            const igen = await api(a.id, { params: { fields: 'targeting' } });
            const kontroll = placeringsAvvikelse(igen.targeting, r.placeringar);
            if (kontroll.avviker) post.fel = `tillbakaläsningen avviker fortfarande: ${kontroll.skillnader.join('; ')}`;
            else post.rattad = true;
          } catch (e) { post.fel = e.message.split('\n')[0]; }
        }
      }
      r.adsets.push(post);
    }
  }

  // 2. Spenden per placering. Ett dygn som börjar innan adseten senast
  //    ändrades kan bära spend från FÖRE placeringsbytet (2026-09-27: 16 654 kr
  //    i Stories på morgonen, adseten rättade 13:45) — det redovisas, men
  //    larmas inte. Dygnet räknas i UTC med två timmars marginal mot kontots tid.
  const tillatna = r.placeringar ? tillatnaPlaceringar(r.placeringar) : null;
  const idagUTC = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
  for (const preset of ['yesterday', 'today']) {
    const namn = preset === 'yesterday' ? 'i går' : 'i dag';
    const start = preset === 'yesterday' ? idagUTC - 86400e3 : idagUTC;
    r.spendFore[namn] = Boolean(r.senastAndrad && Date.parse(r.senastAndrad) >= start - 2 * 3600e3);
    try {
      const rows = await hamtaSpend(alla, m.act, prefix, preset);
      r.spend[namn] = rows;
      r.spendUtanfor[namn] = tillatna ? spendUtanfor(rows, tillatna) : [];
    } catch (e) { r.spend[namn] = []; r.spendUtanfor[namn] = []; logg(`⚠️ spend ${namn} gick inte att läsa: ${e.message.split('\n')[0]}`); }
  }

  // 3. Språket på sidorna.
  if (!utanSidor) {
    const { doman, egen } = domanForMarknad(butik, M);
    const prefixVag = egen || !m.locale ? '' : `/${m.locale}`;
    const hem = `https://${doman}${prefixVag}/${m.country ? `?country=${m.country}` : ''}`;
    r.sidor = await lasSidor({ hem, landningar: landningslankar(annonser), locale: m.locale ?? 'sv', country: m.country, prefix: prefixVag });
  }
  return r;
}

async function huvud(argv) {
  const { säkerställProxy } = await metaDel();
  säkerställProxy?.();
  const pos = argv.filter((a) => !a.startsWith('--'));
  const flagga = (n) => argv.includes(n);
  const varde = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : null);
  const nyckel = pos[0];
  if (!nyckel || flagga('--help')) {
    console.log('node factory/marknadskoll.mjs <butik> --marknad US [--torr] [--discord] [--json <fil>] [--utan-sidor]');
    process.exit(nyckel ? 0 : 1);
  }
  const r = await kor({ nyckel, marknad: varde('--marknad') ?? 'US', torr: flagga('--torr'), utanSidor: flagga('--utan-sidor') });
  for (const rad of byggRapport(r)) console.log(rad);
  const jobb = byggJobb(r);
  const jsonFil = varde('--json');
  if (jsonFil) { mkdirSync(dirname(jsonFil), { recursive: true }); writeFileSync(jsonFil, JSON.stringify({ ...r, jobb }, null, 2)); console.log(`→ ${jsonFil}`); }
  if (!jobb.problem) { console.log('✅ inget att larma om'); return; }
  console.log(`⚠️ ${jobb.gjort.length} rättade, ${jobb.varningar.length} varningar, ${jobb.action_axel.length} till Axel`);
  if (flagga('--discord')) {
    const { skickaRapport } = await import('../tools/discord-rapport.mjs');
    const svar = await skickaRapport(jobb);
    console.log(`✅ Discord: postat i #${svar.kanal.name} på ${svar.server.name} (meddelande ${svar.id})`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud(process.argv.slice(2)).catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
