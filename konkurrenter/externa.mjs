// konkurrenter/externa.mjs — klipp vi VET inte är våra.
//
// Eoka AB (ORVO) visade 2026-09-29 att en sekvens i vår annons Takoverdrag_SP_4_H1
// kommer från Specialised Covers TikTok (publicerad 22 maj 2025). Samma klipp låg i
// 58 av våra 240 takskyddsfilmer. Brevet hade påstått att "filmerna är framställda
// av oss", och procentsiffrorna räknade de lånade rutorna som våra. Därför nu:
//
//  - Varje känd extern källa ligger i konkurrenter/externa/<id>.json med sina
//    rutor (dHash 9 × 8, samma som klipp.mjs), vem som äger den och varför den
//    står där.
//  - --klipp utesluter rutorna. I våra filmer och i deras annons blir de
//    "lånade", så de bär aldrig ett par och räknas aldrig i andelen.
//  - --original länkar aldrig en av våra annonser som original om dess film bär
//    ett externt klipp (original.mjs → originalFor).
//
// Registret växer åt ett håll. En källa läggs till när vi får veta att ett klipp
// inte är vårt. En källa tas aldrig bort för att ett fall ska bli starkare.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { avstand, KONTRAST_MIN, MAX_AVSTAND } from './klipp.mjs';

export const MAPP = join(dirname(fileURLToPath(import.meta.url)), 'externa');

/**
 * Alla externa källor ur mappen: [{ id, agare, lank, publicerad, tillagd, orsak, rutor: [{ t, hash }] }].
 * En fil som inte går att läsa är ett fel, inte en tyst lucka. Saknas mappen blir det en tom lista.
 */
export function lasExterna({ mapp = MAPP } = {}) {
  if (!existsSync(mapp)) return [];
  const ut = [];
  for (const f of readdirSync(mapp).filter((x) => x.endsWith('.json')).sort()) {
    let k;
    try { k = JSON.parse(readFileSync(join(mapp, f), 'utf8')); } catch (e) { throw new Error(`konkurrenter/externa/${f} går inte att läsa: ${e.message}`); }
    const rutor = (k.rutor ?? []).filter((r) => r && /^[0-9a-f]{16}$/.test(String(r.hash)));
    if (!rutor.length) throw new Error(`konkurrenter/externa/${f} har inga rutor — en källa utan rutor utesluter ingenting.`);
    ut.push({ id: k.id ?? f.replace(/\.json$/, ''), agare: k.agare ?? null, lank: k.lank ?? null, publicerad: k.publicerad ?? null, tillagd: k.tillagd ?? null, orsak: k.orsak ?? null, rutor });
  }
  return ut;
}

/**
 * Rutorna i en rutlista som visar ett externt klipp: Set av r.i. Två regler:
 *  - träff = avstånd ≤ maxAvstand mot någon av källornas rutor. Mätt 2026-09-29: vår
 *    SP_4_H1 mot Specialised Covers video gav 0–6, andra bilder ≥ 16.
 *  - ± fonsterS sekunder runt en träff räknas med. En tagning har rörelse, och 2 rutor/s
 *    hos oss mot 10/s i källan missar annars kanterna.
 * Platta rutor (kontrast < kontrastMin) träffar aldrig, de liknar alla varandra. Ren.
 */
export function externaIRutor(rutor, hashar, { maxAvstand = MAX_AVSTAND, fonsterS = 1, kontrastMin = KONTRAST_MIN } = {}) {
  const ut = new Set();
  if (!rutor?.length || !hashar?.length) return ut;
  const informativ = (r) => r.kontrast === undefined || r.kontrast === null || r.kontrast >= kontrastMin;
  const traff = rutor.filter((r) => informativ(r) && hashar.some((h) => avstand(r.hash, h) <= maxAvstand));
  for (const r of traff) {
    ut.add(r.i);
    if (r.t === null || r.t === undefined) continue;
    for (const x of rutor) if (x.t !== null && x.t !== undefined && Math.abs(x.t - r.t) <= fonsterS) ut.add(x.i);
  }
  return ut;
}

/**
 * Per film: vilka rutor som är externa och ur vilken källa.
 * @param filmer [{ id, namn, rutor }] · @param kallor lasExterna()
 * @returns {{ perFilm: Map<id, Set<i>>, filmer: { [namn]: { rutor, kallor: string[], tider: number[] } }, hashar: string[] }}  Ren.
 */
export function externaIFilmer(filmer, kallor, opts = {}) {
  const perFilm = new Map(); const sammanfattning = {};
  const hashar = kallor.flatMap((k) => k.rutor.map((r) => r.hash));
  for (const f of filmer ?? []) {
    const alla = new Set(); const fran = [];
    for (const k of kallor) {
      const s = externaIRutor(f.rutor ?? [], k.rutor.map((r) => r.hash), opts);
      if (!s.size) continue;
      for (const i of s) alla.add(i);
      fran.push(k.id);
    }
    if (!alla.size) continue;
    perFilm.set(f.id, alla);
    const tider = (f.rutor ?? []).filter((r) => alla.has(r.i) && r.t !== null && r.t !== undefined).map((r) => r.t);
    sammanfattning[f.namn ?? f.id] = { rutor: alla.size, kallor: fran, tider };
  }
  return { perFilm, filmer: sammanfattning, hashar };
}

/** Tiderna som sammanhängande spann, "0:30–0:36, 1:02". Ren. */
export function spannText(tider = [], { steg = 0.5 } = {}) {
  const t = [...new Set(tider)].sort((a, b) => a - b);
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const ut = []; let start = null; let forra = null;
  for (const x of t) {
    if (start === null) { start = x; forra = x; continue; }
    if (x - forra <= steg + 1e-6) { forra = x; continue; }
    ut.push(start === forra ? mmss(start) : `${mmss(start)}–${mmss(forra)}`); start = x; forra = x;
  }
  if (start !== null) ut.push(start === forra ? mmss(start) : `${mmss(start)}–${mmss(forra)}`);
  return ut.join(', ');
}

/**
 * Laddar ner en video till fil. TikTok via Chromium: sidan bär videons adress i sin data
 * (__UNIVERSAL_DATA_FOR_REHYDRATION__). yt-dlp fick "Unexpected response" mätt 2026-09-29, Chromium gick.
 * Allt annat hämtas direkt. Returnerar { byte, publicerad, agare, text } (TikTok) eller { byte }.
 */
export async function hamtaVideo(url, fil) {
  if (!/tiktok\.com\//i.test(url)) { const { hamtaFil } = await import('./klipp.mjs'); return hamtaFil(url, fil); }
  const { startaWebblasare } = await import('./adlibrary.mjs');
  const { browser, ctx } = await startaWebblasare();
  try {
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForTimeout(6_000);
    const html = await page.content();
    const m = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
    let it = null;
    try { it = m ? JSON.parse(m[1]).__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct : null; } catch { it = null; }
    const play = it?.video?.playAddr || it?.video?.downloadAddr;
    if (!play) throw new Error('TikTok-sidan bar ingen videoadress (kräver den inloggning, eller är videon borttagen?)');
    const r = await ctx.request.get(play, { headers: { Referer: 'https://www.tiktok.com/' } });
    if (r.status() !== 200) throw new Error(`TikTok-videon svarade HTTP ${r.status()}`);
    const b = await r.body();
    writeFileSync(fil, b);
    return { byte: b.length, publicerad: it.createTime ? new Date(Number(it.createTime) * 1000).toISOString().slice(0, 10) : null, agare: it.author?.uniqueId ? `@${it.author.uniqueId}` : null, text: it.desc ?? null };
  } finally { await browser.close().catch(() => {}); }
}
