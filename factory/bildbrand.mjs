#!/usr/bin/env node
// bildbrand.mjs — "bär den här videons SISTA sekunder ett slutkort som pekar ut
// en butik?" Den frågan, och bara den.
//
// Varför den finns (mätt 2026-09-20 på Bäverbutikens 24 svenska taköverdrags-
// videor): nio av dem slutar med ett slutkort på EXAKT 3,0 sekunder. Åtta bär
// Bäverbutikens logga (svart ruta, rött bäverhuvud, guld ordmärke, svensk
// flagga, svensk titel, "10 recensioner", 1 469 kr överstruket / 1 129 kr),
// den nionde (PD_5_H1) en blå badge med "carashell.se". Åtta av dem ligger
// live i Norge med loggan kvar. Ingen spärr i repot tittade på bildrutorna:
// tools/ops-spegla.mjs:107 brandtraff() läser COPY och BRIEFTEXT, inte bild,
// så slutkortet passerade rakt igenom speglingen.
//
// Axels beslut 2026-09-18: butikens namn står ALDRIG i en annons — inte
// "Bäverbutiken", inte "CaraShell", inte domänen. Gäller copy, bild, voiceover
// och captions. Axels beslut 2026-09-20: täpp luckan INFÖR DANMARK; gå inte
// tillbaka och rätta marknader som redan är live.
//
//   import { granskaSlutkort, DOMAR } from './bildbrand.mjs';
//   const d = await granskaSlutkort('/sökväg/video.mp4', { butiksord: ['carashell', 'carashell.se'] });
//   d.dom  → 'ren' | 'slutkort-utan-brand' | 'slutkort-med-brand' | 'okand'
//
//   node factory/bildbrand.mjs <fil.mp4> [--butiksord carashell,carashell.se]
//                              [--slut 3.0] [--json]
//
// TRE DOMAR + EN (Axels regel: ett fynd namnges, det göms aldrig):
//   ren                   inget stillastående slutkort i slutet → ladda upp
//   slutkort-utan-brand   slutkort finns, men ingen butik läses ur det →
//                         ladda upp, men NAMNGE raden i rapporten (ett slutkort
//                         på svenska är ändå fel marknadsspråk i Danmark)
//   slutkort-med-brand    slutkort + butiksnamn/domän i bilden → ladda INTE upp
//                         den här raden; namngiven rad i rapporten + action till
//                         Axel. Rutinen fortsätter med de andra raderna.
//   okand                 gick inte att läsa (ingen ffmpeg, ingen OCR, trasig
//                         fil, för kort video) → ladda upp, men NAMNGE raden.
//                         "Oläst är aldrig ren" (factory/rakning.mjs:19) gäller
//                         domen, inte uppladdningen: ett saknat python-paket
//                         får aldrig stoppa hela Danmark, och raden ska läsas
//                         av en människa i rapporten samma dag.
//
// ⚠️ Den här modulen pausar ALDRIG något som redan är live (Axels beslut
// 2026-09-15). Den körs FÖRE uppladdning, på filen som ska laddas upp.
//
// ⚠️ Den körs bara på VIDEO som faktiskt ska laddas upp (rad med fil, inte
// dubblett i Meta). Kostnaden, mätt 2026-09-20 i den här containern på en
// 11 s / 1080×1920-video: ~0,10 s för längden (ffmpeg -i), ~0,15 s för
// gråskalerutorna, ~0,35 s för PNG-rutan, ~1,4 s för OCR:en (rapidocr, första
// anropet laddar modellen: ~3 s). Alltså ≈ 2 s per video, ~4 s för den första.
// En leveransrunda på 20 videor kostar ungefär en minut — mot Meta-anropens
// 8 min per rad (CLAUDE.md, speglingen 2026-09-18) är det brus.
//
// Noll npm-beroenden. ffmpeg + python3 spawnas; OCR:en är factory/brand-text.py
// (rapidocr-onnxruntime), matchningen mot källbrandet factory/brandord.mjs —
// brand-detektor.mjs är orörd, det här är byggt BREDVID den.
//
// ⚠️ ffprobe i den här containern är en python-shim som INTE stöder
// -select_streams (ValueError: not enough values to unpack). Därför läses
// längden ur `ffmpeg -i`:s stderr ("Duration: HH:MM:SS.ss"), precis som
// tools/qa-frames.py:45 gör. Bygg aldrig något här som kräver ffprobe.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { sökBrand, normalisera } from './brandord.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

export const DOMAR = {
  ren: 'ren',
  utanBrand: 'slutkort-utan-brand',
  medBrand: 'slutkort-med-brand',
  okand: 'okand',
};

/** Slutkortets längd i källmaterialet. Mätt: nio av nio ligger på exakt 3,0 s
 *  (starttid = videons längd − 3,0 s). Fönstret läses ändå som ETT fönster —
 *  ett slutkort på 2 s syns som stillbild i den sista delen av det. */
export const SLUT_SEK = 3.0;
/** Referensfönstret FÖRE slutkortet. Utan det kan en video som är stillastående
 *  hela vägen (en produktbild med voiceover) inte skiljas från ett slutkort. */
export const FORE_SEK = 1.2;
/** Rutor per sekund. 4 ⇒ 12 rutor över slutkortet, 5 i referensen. Tätare
 *  köper ingenting: slutkortet är en STILLBILD, inte en rad som blinkar förbi
 *  (den jakten är brand-detektorns, 0,3 s över hela filmen). */
export const FPS = 4;
/** Rutstorleken gråskalerutorna skalas till. 64×64 = 4 096 byte per ruta, så
 *  hela fönstret är ~70 kB i minnet och kan jämföras i ren JS utan bildbibliotek. */
export const RUTA = 64;
/** Skyddszon runt övergången: rutor inom ±0,25 s från slutkortets start hör
 *  varken till slutkortet eller till referensen (en övergång kan vara mjuk). */
export const MARGINAL_SEK = 0.25;

/** Medelabsolutdiff (0–255) under vilken två rutor räknas som samma bild.
 *  ⚠️ Inte 0: h.264 gör varje ruta lite olik den förra även i en stillbild.
 *  Mätt 2026-09-20 på ett syntetiskt slutkort (crf 23): 0,05–0,4. Rörlig film
 *  i samma mätning: 8–40. */
export const STILLA_TROSKEL = 2.0;
/** Medelabsolutdiff mot referensrutan över vilken slutet räknas som ett EGET
 *  kort och inte som fortsättningen på filmen. */
export const BYTE_TROSKEL = 8.0;

/** Domäner som pekar ut EN butik. Fångar carashell.se, baverbutiken.se,
 *  beverbutikken.no, carashell.com … — och bara i den formen, så "3.0 s" eller
 *  "210D" inte blir en domän. */
const DOMAN_RE = /\b[a-z][a-z0-9-]{2,30}\.(se|no|dk|fi|com|net|eu|shop|store)\b/gi;

// ------------------------------------------------------------- ren logik
// Allt nedan är utan nätverk, utan ffmpeg och utan OCR — och testas så
// (factory/test/bildbrand.test.mjs).

/**
 * Speltiden ur `ffmpeg -i`:s stderr. Null när raden saknas.
 * ffprobe används med flit INTE — se varningen högst upp.
 */
export function langdUrFfmpeg(stderr) {
  const m = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(String(stderr ?? ''));
  if (!m) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

/** Delar en rå gråskaleström i rutor om `storlek`×`storlek` byte. */
export function delaRutor(buf, storlek = RUTA) {
  const per = storlek * storlek;
  const ut = [];
  for (let i = 0; i + per <= buf.length; i += per) ut.push(buf.subarray(i, i + per));
  return ut;
}

/** Medelabsolutdiff mellan två lika långa gråskalerutor (0–255). */
export function medelDiff(a, b) {
  const n = Math.min(a.length, b.length);
  if (!n) return 0;
  let s = 0;
  for (let i = 0; i < n; i++) s += Math.abs(a[i] - b[i]);
  return s / n;
}

/** Största medelabsolutdiffen mellan två rutor i listan — 0 för en stillbild. */
export function storstaDiff(rutor) {
  let max = 0;
  for (let i = 1; i < rutor.length; i++) max = Math.max(max, medelDiff(rutor[i - 1], rutor[i]));
  return max;
}

/**
 * Är slutet ett eget, stillastående kort?
 * @param {Uint8Array[]} slutrutor   rutorna i slutfönstret
 * @param {Uint8Array[]} forerutor   rutorna före slutkortet (referensen)
 * @returns {{slutkort: boolean, stilla: number, byte: number, skal: string}}
 */
export function arSlutkort(slutrutor, forerutor, { stillaTroskel = STILLA_TROSKEL, byteTroskel = BYTE_TROSKEL } = {}) {
  if (slutrutor.length < 2) return { slutkort: false, stilla: null, byte: null, skal: 'för få rutor i slutfönstret' };
  const stilla = storstaDiff(slutrutor);
  if (stilla > stillaTroskel) return { slutkort: false, stilla, byte: null, skal: `slutet rör sig (största diff ${stilla.toFixed(2)} > ${stillaTroskel})` };
  if (!forerutor.length) return { slutkort: false, stilla, byte: null, skal: 'ingen referensruta före slutkortet — går inte att skilja från en stillastående film' };
  // Minsta diffen mot referensen: ett slutkort måste skilja sig från ALLA
  // rutor före det. Räknas medelvärdet i stället kan en enda mörk ruta i
  // referensen lyfta snittet över tröskeln och friskriva en film som aldrig byter bild.
  let byte = Infinity;
  for (const f of forerutor) byte = Math.min(byte, medelDiff(f, slutrutor[slutrutor.length - 1]));
  if (byte < byteTroskel) return { slutkort: false, stilla, byte, skal: `slutet är samma bild som före (diff ${byte.toFixed(2)} < ${byteTroskel})` };
  return { slutkort: true, stilla, byte, skal: `stillbild (diff ${stilla.toFixed(2)}) som byter från filmen (diff ${byte.toFixed(2)})` };
}

/**
 * Pekar de OCR-lästa raderna ut en butik?
 * Källbrandet matchas av factory/brandord.mjs (samma matchare som yta 1–4 i
 * brand-detektorn — en sträng får aldrig dömas olika beroende på vem som läste
 * den). Butikens EGET namn och varje domän räknas också: Axels regel är att
 * INGEN butik namnges i en annons, inte bara att den fel butiken inte gör det.
 *
 * @param {string[]} textrader  OCR-rader ur slutkortet
 * @param {{butiksord?: string[], extraOrd?: string[]}} opt
 * @returns {Array<{ord: string, form: string, satt: string}>} ordagranna fynd
 */
export function butiksfynd(textrader, { butiksord = [], extraOrd = [] } = {}) {
  const fynd = [];
  const sett = new Set();
  const lagg = (ord, form, satt) => {
    const nyckel = `${normalisera(ord)}|${satt}`;
    if (sett.has(nyckel)) return;
    sett.add(nyckel);
    fynd.push({ ord, form, satt });
  };
  const egna = butiksord.map((o) => normalisera(o)).filter(Boolean);
  for (const rad of textrader) {
    const text = String(rad ?? '');
    // 1. Källbrandet (Bäverbutiken, felstavningar, norska formen).
    for (const f of sökBrand(text, extraOrd).fynd) lagg(f.ord, f.form, `kallbrand/${f.sätt}`);
    // 2. Butikens eget namn — ord för ord, så "CaraShell" träffar men inte
    //    varje ord som råkar innehålla bokstäverna.
    for (const ord of text.split(/[^\p{L}\p{N}.-]+/u)) {
      const n = normalisera(ord);
      if (!n) continue;
      for (const e of egna) if (n === e || (e.length >= 5 && n.includes(e))) lagg(ord, e, 'butikens eget namn');
    }
    // 3. Vilken domän som helst — en .se/.com i ett slutkort ÄR en butik.
    for (const m of text.matchAll(DOMAN_RE)) lagg(m[0], m[0], 'doman');
  }
  return fynd;
}

/**
 * Domen ur mätningarna. Ren funktion — hela beslutsträdet på ett ställe.
 * @param {{slutkort: boolean, last: boolean, fynd: Array, skal?: string}} m
 */
export function slutkortsdom({ slutkort, last, fynd = [], skal = '' }) {
  if (!last) return { dom: DOMAR.okand, skal: skal || 'videon gick inte att läsa' };
  if (!slutkort) return { dom: DOMAR.ren, skal: skal || 'inget stillastående slutkort i slutet' };
  if (fynd.length) return { dom: DOMAR.medBrand, skal: `slutkortet namnger en butik: ${fynd.map((f) => `"${f.ord}" (${f.satt})`).join(', ')}` };
  return { dom: DOMAR.utanBrand, skal: skal || 'slutkort utan läsbart butiksnamn' };
}

/** En rad för rapporten — engelska, för Discord (CLAUDE.md: allt i Discord är engelska). */
export function rapportrad(namn, granskning) {
  const g = granskning ?? {};
  switch (g.dom) {
    case DOMAR.medBrand:
      return `${namn}: end card names a store — ${(g.fynd ?? []).map((f) => `"${f.ord}"`).join(', ')} (last ${g.slut_sek ?? SLUT_SEK}s). NOT uploaded — the editor must rebuild the end card.`;
    case DOMAR.utanBrand:
      return `${namn}: has an end card (last ${g.slut_sek ?? SLUT_SEK}s, no store name read). Uploaded — check that the card is in the market's language.`;
    case DOMAR.okand:
      return `${namn}: end card could not be checked — ${g.skal ?? 'unknown'}. Uploaded — someone has to look at the last seconds.`;
    default:
      return null;   // ren: ingen rad, annars drunknar fynden i brus
  }
}

/** Blockerar domen uppladdningen av EN rad? (Aldrig hela körningen.) */
export const blockerar = (dom) => dom === DOMAR.medBrand;

// ------------------------------------------------------------- mätningen
// Härifrån och ned spawnas ffmpeg och python. Testerna injicerar `kor` och
// `ocr` i stället, så hela beslutsträdet går att mäta utan media.

const körFfmpeg = (args) => {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', ...args], { encoding: 'buffer', maxBuffer: 256 * 1024 * 1024, timeout: 120_000 });
  return { status: r.status, stdout: r.stdout ?? Buffer.alloc(0), stderr: String(r.stderr ?? ''), fel: r.error ? String(r.error.message) : null };
};

/** OCR via factory/brand-text.py (rapidocr). Returnerar textrader, eller null
 *  när OCR:en inte finns — då blir domen "okand", aldrig "ren". */
const körOcr = (pngFil) => {
  const r = spawnSync('python3', [join(ROT, 'brand-text.py'), '--filer', pngFil], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 180_000 });
  if (r.status !== 0) return { rader: null, fel: String(r.stderr ?? r.error?.message ?? `brand-text.py avslutade med ${r.status}`).trim().split('\n')[0] };
  try {
    const json = JSON.parse(r.stdout);
    const rader = Object.values(json).flat().map((x) => x?.text ?? '').filter(Boolean);
    return { rader, fel: null };
  } catch (e) {
    return { rader: null, fel: `kunde inte läsa OCR-svaret: ${e.message}` };
  }
};

/**
 * Granskar en videofils sista sekunder.
 *
 * @param {string} fil
 * @param {object} opt
 * @param {string[]} opt.butiksord  butikens egna former ("carashell", "carashell.se")
 * @param {string[]} opt.extraOrd   fler former av KÄLLbrandet (produktfilens kalla.extra_brandord)
 * @param {number}   opt.slutSek    slutfönstret i sekunder (default 3,0 — mätt)
 * @param {Function} opt.kor        ffmpeg-körare (injiceras i test)
 * @param {Function} opt.ocr        OCR-körare (injiceras i test)
 * @returns {Promise<{dom, skal, langd_s, start_s, stilla, byte, textrader, fynd, sekunder, slut_sek}>}
 */
export async function granskaSlutkort(fil, {
  butiksord = [], extraOrd = [], slutSek = SLUT_SEK, fps = FPS, ruta = RUTA,
  kor = körFfmpeg, ocr = körOcr, arbetsmapp = null,
} = {}) {
  const t0 = Date.now();
  const klar = (extra) => ({
    fil, slut_sek: slutSek, langd_s: null, start_s: null, stilla: null, byte: null,
    textrader: [], fynd: [], sekunder: Number(((Date.now() - t0) / 1000).toFixed(2)), ...extra,
  });

  if (!fil || !existsSync(fil)) return klar({ ...slutkortsdom({ last: false, skal: `filen finns inte: ${fil}` }) });

  // 1. Längden. `ffmpeg -i` utan utdata ger exit 1 med Duration på stderr —
  //    det är förväntat, inte ett fel. (ffprobe -select_streams är trasig här.)
  const info = kor(['-i', fil]);
  const langd = langdUrFfmpeg(info.stderr);
  if (!langd) return klar({ ...slutkortsdom({ last: false, skal: `ffmpeg läste ingen speltid ur filen${info.fel ? ` (${info.fel})` : ''}` }) });
  if (langd < slutSek + 0.8) return klar({ langd_s: langd, ...slutkortsdom({ last: false, skal: `videon är ${langd.toFixed(1)} s — för kort för att skilja ett ${slutSek} s slutkort från filmen` }) });

  // 2. Gråskalerutor över [slutkortets start − FORE_SEK, slutet]. En enda
  //    avkodning; -ss före -i söker i filen i stället för att läsa den från början.
  const kortStart = langd - slutSek;
  const fonsterStart = Math.max(0, kortStart - FORE_SEK);
  const rå = kor(['-ss', fonsterStart.toFixed(3), '-i', fil, '-vf', `fps=${fps},scale=${ruta}:${ruta},format=gray`, '-f', 'rawvideo', '-pix_fmt', 'gray', '-']);
  const rutor = delaRutor(rå.stdout, ruta);
  if (rutor.length < 3) return klar({ langd_s: langd, start_s: kortStart, ...slutkortsdom({ last: false, skal: `ffmpeg gav ${rutor.length} bildrutor ur slutet — för få att döma på` }) });

  const tid = (i) => fonsterStart + i / fps;
  const slutrutor = rutor.filter((_, i) => tid(i) >= kortStart + MARGINAL_SEK);
  const forerutor = rutor.filter((_, i) => tid(i) <= kortStart - MARGINAL_SEK);
  const kort = arSlutkort(slutrutor, forerutor);
  if (!kort.slutkort) {
    return klar({ langd_s: langd, start_s: kortStart, stilla: kort.stilla, byte: kort.byte, ...slutkortsdom({ slutkort: false, last: true, skal: kort.skal }) });
  }

  // 3. Bara nu kostar det OCR: en enda PNG mitt i slutkortet.
  const mapp = arbetsmapp ?? mkdtempSync(join(tmpdir(), 'bildbrand-'));
  const png = join(mapp, 'slutkort.png');
  try {
    const p = kor(['-ss', (kortStart + slutSek / 2).toFixed(3), '-i', fil, '-frames:v', '1', '-y', png]);
    if (!existsSync(png)) {
      return klar({ langd_s: langd, start_s: kortStart, stilla: kort.stilla, byte: kort.byte, ...slutkortsdom({ slutkort: true, last: false, skal: `slutkort hittat men bildrutan gick inte att spara${p.fel ? ` (${p.fel})` : ''}` }) });
    }
    const läst = ocr(png);
    if (!läst.rader) {
      return klar({ langd_s: langd, start_s: kortStart, stilla: kort.stilla, byte: kort.byte, ...slutkortsdom({ slutkort: true, last: false, skal: `slutkort hittat men texten gick inte att läsa — ${läst.fel}` }) });
    }
    const fynd = butiksfynd(läst.rader, { butiksord, extraOrd });
    return klar({
      langd_s: langd, start_s: kortStart, stilla: kort.stilla, byte: kort.byte,
      textrader: läst.rader, fynd, ...slutkortsdom({ slutkort: true, last: true, fynd, skal: kort.skal }),
    });
  } finally {
    if (!arbetsmapp) rmSync(mapp, { recursive: true, force: true });
  }
}

/**
 * Bekvämlighet för köerna: granskar bara VIDEO, bara när det finns en fil att
 * ladda upp. Allt annat returnerar null — och null betyder "inget att säga",
 * aldrig "ren". Håller kostnaden där den hör hemma (krav 4).
 */
export async function granskaOmVideo({ fil, typ, hoppa = false, ...opt } = {}) {
  if (hoppa || !fil) return null;
  if (typ && !/video/i.test(String(typ))) return null;
  if (!typ && !/\.(mp4|mov|m4v|webm)$/i.test(String(fil))) return null;
  return granskaSlutkort(fil, opt);
}

// ------------------------------------------------------------------- CLI
if (process.argv[1] && /[\\/]bildbrand\.mjs$/.test(process.argv[1])) {
  const argv = process.argv.slice(2);
  const MED_VARDE = ['--butiksord', '--slut'];
  const val = (flagga) => { const i = argv.indexOf(flagga); return i >= 0 ? argv[i + 1] : null; };
  const fil = argv.find((a, i) => !a.startsWith('--') && !MED_VARDE.includes(argv[i - 1]));
  if (!fil) {
    console.error('Användning: node factory/bildbrand.mjs <fil.mp4> [--butiksord a,b] [--slut 3.0] [--json]');
    process.exit(2);
  }
  const g = await granskaSlutkort(fil, {
    butiksord: (val('--butiksord') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    slutSek: Number(val('--slut') ?? SLUT_SEK),
  });
  if (argv.includes('--json')) console.log(JSON.stringify(g, null, 2));
  else {
    const ikon = { [DOMAR.ren]: '✅', [DOMAR.utanBrand]: '⚠️', [DOMAR.medBrand]: '⛔', [DOMAR.okand]: '❔' }[g.dom];
    console.log(`${ikon} ${g.dom} — ${g.skal}`);
    console.log(`   längd ${g.langd_s?.toFixed(2) ?? '?'} s, slutkort från ${g.start_s?.toFixed(2) ?? '?'} s, stilla ${g.stilla?.toFixed(2) ?? '?'}, byte ${g.byte?.toFixed(2) ?? '?'}, ${g.sekunder} s`);
    if (g.textrader.length) console.log(`   OCR: ${g.textrader.join(' | ')}`);
  }
  process.exit(0);
}
