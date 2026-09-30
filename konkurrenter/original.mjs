// konkurrenter/original.mjs — våra ORIGINALANNONSER i Metas annonsbibliotek.
//
// Axel 2026-09-29, när han granskade anmälningarna: "exemplet på vårt original
// leder bara till produktsidan … du måste hitta annonserna inne i vårt ad library
// … vi äger ju rättigheterna till alla annonserna". Metas formulär tar EN länk som
// exempel på vårt verk, och den ska vara vår egen annons, inte butikens sida.
//
// Vägen: vår annonstext (Graph API, annonsens creative) → en fras ur den →
// annonsbibliotekets sökning på exakt fras → träffarna på VÅRA sidor
// (konfig.anmalan.vara_sidor) → varje träffs film laddas ner och dess rutor jämförs
// med vår films rutor (samma dHash som klippvalet). Bara en annons vars film ÄR vår
// räknas; en träff som bara delar texten räknas aldrig.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { annonserUrHtml, normaliseraAnnons } from './adlibrary.mjs';
import { avstand, rutorUrVideo, hamtaFil, MAX_AVSTAND, KONTRAST_MIN } from './klipp.mjs';

/** Minsta andel lika rutor ÅT BÅDA HÅLL för att en träff ska vara vår film (mätt: samma film ≥ 0,9, en annan film med ett delat klipp ≤ 0,3). */
export const MIN_ANDEL = 0.6;

/**
 * Frasen att söka på: första stycket i vår annonstext med 5–10 ord, utan siffror.
 * Kroken står först och är den mest egna meningen; siffror (pris, 210D) stryks
 * eftersom sökningen är ordagrann. null när inget stycke räcker. Ren.
 */
export function frasUrText(text) {
  return fraserUrText(text, { max: 1 })[0] ?? null;
}

/**
 * Upp till `max` fraser att pröva i tur och ordning: kroken (första stycket) först, sedan de LÄNGSTA
 * övriga — en kort fras som "Det är allt det tar" gav 30 träffar hos andra och ingen hos oss (mätt
 * 2026-09-29, Takoverdrag_PD_6_H1). Samma regel per stycke som frasUrText. Ren.
 */
export function fraserUrText(text, { max = 3 } = {}) {
  const delar = String(text ?? '').split(/[\n.!?—–:;,"”“()«»]+/).map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const ok = delar.map((d) => d.split(' ').filter(Boolean)).filter((ord) => ord.length >= 5 && !ord.some((w) => /\d/.test(w)));
  if (!ok.length) return [];
  const [forsta, ...ovriga] = ok;
  const ut = [forsta, ...ovriga.sort((a, b) => b.length - a.length)].map((ord) => ord.slice(0, 10).join(' '));
  return [...new Set(ut)].slice(0, max);
}

/** Marknaden ur annonsnamnet (CaraShellRoof_NO_UG_101_H1 → NO), annars SE. Ren. */
export function landUrNamn(namn) {
  const m = String(namn ?? '').match(/_(NO|DK|FI|US|GB|UK|AU|CA|NZ|DE)_/);
  return m ? (m[1] === 'UK' ? 'GB' : m[1]) : 'SE';
}

/** Sökningen på exakt fras i annonsbiblioteket, alla annonser (aktiva och avslutade). Ren. */
export const sokUrl = (fras, { land = 'SE' } = {}) => `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${encodeURIComponent(land)}&is_targeted_country=false&media_type=all&q=${encodeURIComponent(`"${fras}"`)}&search_type=keyword_exact_phrase`;

/**
 * Annonsobjekten (`ad_archive_id` + `snapshot`) i ett svar: sidans inbäddade JSON
 * eller ett GraphQL-svar med en JSON per rad (föregånget av "for (;;);"). Ren.
 */
export function annonserUrSvar(text) {
  const ut = new Map();
  const walk = (v) => {
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (typeof v.ad_archive_id === 'string' && v.snapshot) { if (!ut.has(v.ad_archive_id)) ut.set(v.ad_archive_id, v); return; }
    for (const x of Object.values(v)) walk(x);
  };
  for (const del of String(text ?? '').replace(/^for \(;;\);/, '').split('\n')) { try { walk(JSON.parse(del)); } catch { /* inte JSON */ } }
  return [...ut.values()];
}

/**
 * Söker frasen i annonsbiblioteket från en öppen sida (Chromium). Resultaten kommer
 * både i sidans HTML och i GraphQL-svar efteråt (mätt 2026-09-29: 11 träffar, 0 i
 * HTML:en, alla i det första GraphQL-svaret) — båda läses, och sidan skrollas för fler.
 */
export async function sokFras(page, fras, { land = 'SE', logg = () => {}, skroll = 4, maxVantaMs = 60_000, forsok = 2 } = {}) {
  const alla = new Map();
  const lyss = async (r) => {
    if (!/\/api\/graphql/.test(r.url())) return;
    try { for (const n of annonserUrSvar(await r.text())) alla.set(n.ad_archive_id, n); } catch { /* svaret stängt */ }
  };
  page.on('response', lyss);
  const t0 = Date.now();
  try {
    // Noll träffar prövas en gång till: samma fras gav 0 och sedan 8 träffar två körningar i rad (mätt 2026-09-29, CaraShells norska).
    for (let f = 0; f < forsok && !alla.size; f++) {
      const t1 = Date.now();
      await page.goto(sokUrl(fras, { land }), { waitUntil: 'load', timeout: 90_000 }).catch(() => {});
      while (Date.now() - t1 < maxVantaMs) {
        await page.waitForTimeout(2000);
        const text = await page.evaluate(() => document.body?.innerText ?? '').catch(() => '');
        if (/Library ID|Biblioteks-id|No ads match|Inga annonser/i.test(text)) break;
      }
      for (let i = 0; i < skroll; i++) { await page.mouse.wheel(0, 4000).catch(() => {}); await page.waitForTimeout(1500); }
      for (const n of annonserUrHtml(await page.content())) if (!alla.has(n.ad_archive_id)) alla.set(n.ad_archive_id, n);
    }
  } finally { page.off('response', lyss); }
  const annonser = [...alla.values()].map(normaliseraAnnons);
  logg(`    "${fras}" (${land}): ${annonser.length} träffar, ${Math.round((Date.now() - t0) / 1000)} s`);
  return annonser;
}

/** Andelen rutor i `a` som finns i `b` (≤ maxAvstand), platta rutor oräknade. Ren. */
export function andelLika(a, b, { maxAvstand = MAX_AVSTAND, kontrastMin = KONTRAST_MIN } = {}) {
  const x = (a ?? []).filter((r) => (r.kontrast ?? 99) >= kontrastMin);
  const y = (b ?? []).filter((r) => (r.kontrast ?? 99) >= kontrastMin);
  if (!x.length || !y.length) return 0;
  let n = 0;
  for (const r of x) if (y.some((q) => avstand(r.hash, q.hash) <= maxAvstand)) n++;
  return Math.round((n / x.length) * 100) / 100;
}

/**
 * Bästa träffen: bara våra sidor, bara verifierade (lika åt båda håll ≥ MIN_ANDEL),
 * helst filmens egen sida, sedan tidigast start, sedan högst andel. Ren.
 */
export function valjOriginal(kandidater, { egenSida = null, minAndel = MIN_ANDEL } = {}) {
  const ok = kandidater.filter((k) => k.andel >= minAndel && k.tackning >= minAndel);
  ok.sort((p, q) => (q.sidaId === egenSida) - (p.sidaId === egenSida) || String(p.start ?? '9').localeCompare(String(q.start ?? '9')) || (q.andel + q.tackning) - (p.andel + p.tackning));
  return ok[0] ?? null;
}

/**
 * Letar upp EN film i annonsbiblioteket. `film` = { namn, rutor, sida (vår sid-id
 * för filmens verksamhet) }, `text` = vår annonstext, `varaSidor` = alla våra
 * sid-id:n. Kandidaternas filmer laddas ner till `mapp` (cache per arkiv-id).
 * Returnerar { arkivId, lank, start, sidaId, sida, andel, tackning, fras, land, provade } | { fel, fras, provade }.
 */
export async function hittaOriginal(page, { film, text, varaSidor, ffmpeg, mapp, logg = () => {}, maxProva = 6, maxFraser = 3, sokFn = sokFras, hamtaFn = hamtaFil, rutorFn = rutorUrVideo }) {
  const fraser = fraserUrText(text, { max: maxFraser });
  if (!fraser.length) return { fel: 'ingen fras på 5–10 ord utan siffror i vår annonstext', fras: null, provade: 0 };
  const land = landUrNamn(film.namn);
  const provade = []; const sedda = new Set();
  mkdirSync(mapp, { recursive: true });
  // Fras för fras tills en träff på våra sidor ÄR vår film; varje kandidat laddas ner och jämförs högst en gång.
  for (const fras of fraser) {
    const traffar = (await sokFn(page, fras, { land, logg })).filter((a) => varaSidor.includes(String(a.sidaId)) && a.videoUrl && !sedda.has(a.id));
    traffar.sort((p, q) => (String(q.sidaId) === String(film.sida)) - (String(p.sidaId) === String(film.sida)) || String(p.start ?? '9').localeCompare(String(q.start ?? '9')));
    for (const a of traffar.slice(0, maxProva)) {
      sedda.add(a.id);
      const rutfil = join(mapp, `bibl-${a.id}.json`);
      let rutor = null;
      try { rutor = existsSync(rutfil) ? JSON.parse(readFileSync(rutfil, 'utf8')) : null; } catch { rutor = null; }
      if (!rutor) {
        try {
          const fil = join(mapp, `bibl-${a.id}.mp4`);
          await hamtaFn(a.videoUrl, fil);
          rutor = rutorFn(ffmpeg, fil, { maxSek: 90 });
          writeFileSync(rutfil, JSON.stringify(rutor));
        } catch (e) { provade.push({ id: a.id, fel: e.message.split('\n')[0] }); continue; }
      }
      const k = { id: a.id, lank: a.lank, start: a.start, slut: a.slut, aktiv: a.aktiv, sidaId: String(a.sidaId), sida: a.sida, andel: andelLika(rutor, film.rutor), tackning: andelLika(film.rutor, rutor) };
      provade.push(k);
      logg(`      ${a.id} (${a.sida ?? a.sidaId}, start ${a.start ?? '?'}): ${Math.round(k.andel * 100)} % av annonsens rutor finns i ${film.namn}, ${Math.round(k.tackning * 100)} % åt andra hållet`);
      if (k.andel >= 0.9 && k.tackning >= 0.9 && String(a.sidaId) === String(film.sida)) break; // säker träff på filmens egen sida — inga fler nedladdningar
    }
    const bast = valjOriginal(provade.filter((p) => !p.fel), { egenSida: String(film.sida ?? '') });
    if (bast) return { arkivId: bast.id, lank: bast.lank, start: bast.start, sidaId: bast.sidaId, sida: bast.sida, andel: bast.andel, tackning: bast.tackning, fras, land, provade: provade.length };
  }
  const lista = fraser.map((f) => `"${f}"`).join(', ');
  return { fel: provade.length ? `${provade.length} träff(ar) på våra sidor, men ingen film var ${film.namn} (lika < ${MIN_ANDEL * 100} %)` : `ingen videoannons på våra sidor med ${fraser.length === 1 ? 'frasen' : 'fraserna'} ${lista} (${land})`, fras: fraser[0], fraser, land, provade: provade.length };
}

/** Ledfilmen för en anmälan: flest matchade rutor (perFilm), annars flest par, annars första. Ren. */
export function ledfilm(klipp) {
  const filmer = klipp?.filmer ?? [];
  if (!filmer.length) return null;
  const par = new Map(); for (const p of klipp.par ?? []) if (p.film) par.set(p.film, (par.get(p.film) ?? 0) + 1);
  return [...filmer].sort((a, b) => (klipp.perFilm?.[b] ?? 0) - (klipp.perFilm?.[a] ?? 0) || (par.get(b) ?? 0) - (par.get(a) ?? 0) || filmer.indexOf(a) - filmer.indexOf(b))[0];
}

/**
 * Originalen för en anmälan i den ordning länkarna ska stå: ledfilmen först, sedan
 * de andra filmerna med en hittad annons. `original` = original.json:s `filmer`.
 * `fore` = deras annons startdatum: en annons av VÅRA som startade samma dag eller
 * senare visas aldrig som exempel, även om filmen är vår (ORVO Norge 2026-09-29:
 * vår US-annons med samma film startade 27/9, deras 24/9 — Metas granskare ser bara
 * annonsbibliotekets datum, och där hade vi sett ut att komma efter). Ren.
 */
export function originalFor(klipp, original = {}, { fore = null } = {}) {
  const led = ledfilm(klipp);
  const ordning = [led, ...(klipp?.filmer ?? []).filter((f) => f !== led)].filter(Boolean);
  // `externa` (--original, konkurrenter/externa/): filmen bär ett klipp vi vet inte är vårt. Den är aldrig
  // "vårt original" — Eoka AB fällde just det 2026-09-29 (Specialised Covers klipp i Takoverdrag_SP_4_H1).
  return ordning.map((f) => ({ film: f, ...(original[f] ?? {}) })).filter((o) => o.lank && !o.externa && startadeFore(o, fore));
}

/**
 * Startade vår annons `o` FÖRE deras annons (`derasStart`, datum eller ISO-tid)?
 * Samma dag räknas inte. Okänt datum på någon sida kan inte dömas ⇒ true.
 * Samma regel i anmälans länkar och i bevisbildens rad per par. Ren.
 */
export function startadeFore(o, derasStart) {
  if (!derasStart || !o?.start) return true;
  return String(o.start).slice(0, 10) < String(derasStart).slice(0, 10);
}
