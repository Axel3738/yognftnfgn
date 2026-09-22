#!/usr/bin/env node
// bildbrand.mjs — "bär den här videons SISTA sekunder ett slutkort som pekar ut
// en butik?" Den frågan, och bara den.
//
// FACIT, mätt 2026-09-20 mot de riktiga filerna (inte gissat). Videorna
// hämtades ur Meta, granskades och raderades; det som finns kvar på disk är
// den PNG varje träff sparades som, `factory/output/carashell/endkort/<annons>/
// slutkort.png`. Efterräknat 2026-09-20 genom att köra brand-text.py + `butiksfynd`
// på just de PNG:erna — 24 slutkort hittades:
//   20 "slutkort-med-brand": de nio kända CaraShellRoof-korten (CO_101, OB_101,
//      PD_5, PD_106, PD_107, RI_101, RI_103, SP_104, UG_101), deras åtta svenska
//      källfiler (Takoverdrag_CO_1/OB_1/PD_6/PD_7/RI_1/RI_3/SP_4/UG_1) och de tre
//      norska (NO_CO_101, NO_SP_104, NO_UG_101) som ligger live i Norge med
//      loggan kvar. 19 av dem fälls på "baverbutiken", PD_5 på "carashell.se".
//    4 "slutkort-utan-brand": de FINSKA versionerna, vars kort är ombyggt på
//      finska utan butiksnamn — precis som det ska vara.
// ⚠️ Här stod tidigare "av 70 videor dömdes 22". Det var fel: 9 + 8 + 3 = 20,
//    och efterräkningen på PNG:erna ger 20. Antalet 70 går inte att verifiera i
//    efterhand — mp4:erna är borta.
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
//   d.kod  → språkneutral orsak när domen är 'okand' (OKAND_EN ger engelskan;
//            `d.skal` är svenskt och får aldrig in i en Discord-rad)
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
// dubblett i Meta). Kostnaden, MÄTT 2026-09-20 på 70 riktiga annonsvideor i
// den här containern (Takoverdrag/CaraShellRoof/Termoskydd, 2–6 MB styck):
//   70 videor på 46,7 s = 0,67 s/video i snitt.
//   utan slutkort ~0,2–0,9 s (ffmpeg läser bara längd + gråskalerutor,
//                             OCR körs ALDRIG — det är hela besparingen)
//   med slutkort  ~1,0–1,6 s (en PNG + ett OCR-anrop)
//   första anropet +2–3 s     (rapidocr laddar modellen en gång per process)
// En leveransrunda på 20 videor kostar alltså ~15 sekunder. Meta-anropen i
// samma runda tar upp till 8 minuter PER RAD (CLAUDE.md, speglingen
// 2026-09-18) — kontrollen är brus i jämförelse.
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
 *
 *  Mätt 2026-09-20 på 70 riktiga annonsvideor (Takoverdrag/CaraShellRoof/
 *  Termoskydd, SE + NO + FI, hämtade ur Meta och sedan raderade):
 *    slutkort (21 st, ögongranskade):   0,01–1,76
 *  6,0 är alltså 3,4× över det mest "levande" slutkortet.
 *
 *  ⚠️ Här stod också "videor utan slutkort (49 st): 18,49–129,20" och
 *  "3,1× under den lugnaste rörliga filmen". Den undre gränsen stämmer INTE
 *  generellt. Efterkoll 2026-09-20 på repots alla 98 mp4:or (samma modul,
 *  samma fönster) gav fyra videor UTAN slutkort under 18,49:
 *    factory/output/utekattkojan/catcabin-regn-demo.mp4            0,69
 *    market-expansion/…/2026-08-29/deliver/NO_ibc_SP_1_H1.mp4      8,11
 *    …/NO_ibc_SP_1_H2.mp4 10,72   …/NO_ibc_SP_1_H3.mp4 11,38
 *  Den verkliga marginalen uppåt är alltså 1,35× (8,11/6,0), inte 3,1×, och
 *  catcabin-demon ligger UNDER tröskeln — den räddas bara av byte-kollen
 *  (`byte 1,35 < 8`: slutet är samma bild som före, alltså ingen ny skärm).
 *  Håll därför BYTE_TROSKEL vid liv; stillheten ensam räcker inte.
 *
 *  Att tröskeln ibland är för tillåtande gör inte skada åt fel håll: en video
 *  som felaktigt kallas slutkort får domen "slutkort-utan-brand" (eller
 *  "med-brand" om OCR:en läser ett butiksnamn i den frusna slutrutan — det
 *  senare stoppar en rad, så ett sådant stopp ska läsas som en fråga till en
 *  människa, inte som ett facit). */
export const STILLA_TROSKEL = 6.0;
/** Medelabsolutdiff mot referensrutan över vilken slutet räknas som ett EGET
 *  kort och inte som fortsättningen på filmen. Mätt i samma 70: äkta slutkort
 *  47,86–123,98 mot rutorna strax före. 8,0 är alltså rundlig marginal. */
export const BYTE_TROSKEL = 8.0;

/** Domäner som pekar ut EN butik. Fångar carashell.se, baverbutiken.se,
 *  beverbutikken.no, carashell.com … — och bara i den formen, så "3.0 s" eller
 *  "210D" inte blir en domän.
 *
 *  ⚠️ Gränserna är `\p{L}\p{N}`-lookarounds, inte `\b`. JS:s `\b` räknar bara
 *  [A-Za-z0-9_] som ordtecken, så varje å/ä/ö/æ/ø i en rad skapar en falsk
 *  ordgräns MITT i ordet. Mätt 2026-09-20: "Begrænsetantal.Se" gav fyndet
 *  "nsetantal.Se" och "påLager.Se" gav "Lager.Se" — båda hade STOPPAT en rad
 *  före uppladdning. Det biter hårdast på just de marknader modulen byggdes
 *  för (danska/norska/svenska "Se …", "Nå …").
 *
 *  Kvar som känd risk: en rad som SLUTAR på "<ord>.Se" (t.ex. "Kun få
 *  tilbage.Se") ser strukturellt likadan ut som "carashell.se" och fälls
 *  fortfarande. Det går inte att skilja med en regex. I praktiken skyddar
 *  OCR:en: rapidocr klistrar ihop orden inom en rad ("Varastossa-rajoitettumaara"),
 *  så "… antal. Se her" blir "…antal.Sehere" och faller på lookaheaden.
 *  Ett stopp på en .se/.dk-träff ska ändå alltid läsas av en människa — det
 *  står ordagrant i rapporten, det är hela poängen med att fyndet namnges. */
const DOMAN_RE = /(?<![\p{L}\p{N}])[a-z][a-z0-9-]{2,30}\.(se|no|dk|fi|com|net|eu|shop|store)(?![\p{L}\p{N}])/giu;

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
  // Ett ord rapporteras EN gång, med det första sättet det hittades på —
  // "carashell.se" som både domän och butiksnamn är ett fynd, inte tre.
  const lagg = (ord, form, satt) => {
    const nyckel = normalisera(ord);
    if (!nyckel || sett.has(nyckel)) return;
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
  // "baverbutiken.se" ger träff både som domän och som brandnamn. Rapportera
  // det LÄNGSTA fyndet: en rad som säger 'nämner "baverbutiken.se"' är mer
  // användbar för redigeraren än samma sak tre gånger.
  return fynd.filter((f) => {
    const n = normalisera(f.ord);
    return !fynd.some((g) => g !== f && normalisera(g.ord).length > n.length && normalisera(g.ord).includes(n));
  });
}

/**
 * Domen ur mätningarna. Ren funktion — hela beslutsträdet på ett ställe.
 * @param {{slutkort: boolean, last: boolean, fynd: Array, skal?: string}} m
 */
export function slutkortsdom({ slutkort, last, fynd = [], skal = '', kod = null }) {
  if (!last) return { dom: DOMAR.okand, skal: skal || 'videon gick inte att läsa', kod: kod ?? 'okand' };
  if (!slutkort) return { dom: DOMAR.ren, skal: skal || 'inget stillastående slutkort i slutet', kod: null };
  if (fynd.length) return { dom: DOMAR.medBrand, skal: `slutkortet namnger en butik: ${fynd.map((f) => `"${f.ord}" (${f.satt})`).join(', ')}`, kod: null };
  return { dom: DOMAR.utanBrand, skal: skal || 'slutkort utan läsbart butiksnamn', kod: null };
}

/** Engelsk orsak per `okand`-kod. Finns för att `skal` är SVENSKT (resten av
 *  repot är svenskt) medan rapportraden går till Discord, där
 *  tools/lib/engelska.mjs stoppar svensk text med exit 3 när
 *  ANTHROPIC_NYCKEL saknas. Mätt 2026-09-20: raden
 *  "… end card could not be checked — slutkort hittat men texten gick inte
 *  att läsa …" föll på just den spärren. Koden är språkneutral; texten
 *  väljs av läsaren. */
export const OKAND_EN = Object.freeze({
  'fil-saknas': 'the file is missing',
  'ingen-speltid': 'ffmpeg could not read the duration',
  'for-kort': 'the video is too short to tell an end card from the film',
  'for-fa-rutor': 'ffmpeg returned too few frames from the end',
  'ingen-bildruta': 'an end card was found but the frame could not be saved',
  'ocr-fel': 'an end card was found but the text could not be read (OCR)',
  okand: 'unknown',
});

/**
 * Butikens egna former ur det köerna redan har: brandnamnet och värdnamnen i
 * butikens länkar. "CaraShell" + https://carashell.se/… + https://carashell.com/…
 * → ['carashell', 'carashell.se', 'carashell.com'].
 * www. och språkprefix (/nb, /en) spelar ingen roll — bara värdnamnet läses.
 */
export function butiksordUr({ brand = null, lankar = [] } = {}) {
  const ut = new Set();
  if (brand) ut.add(String(brand).trim().toLowerCase());
  for (const l of lankar) {
    if (!l) continue;
    try { ut.add(new URL(String(l)).hostname.replace(/^www\./i, '').toLowerCase()); } catch { /* inte en URL: hoppas */ }
  }
  return [...ut].filter(Boolean);
}

/** En rad för rapporten — engelska, för Discord (CLAUDE.md: allt i Discord är engelska).
 *
 *  ⚠️ Raden säger vad KONTROLLEN kom fram till, aldrig vad som hände med
 *  uppladdningen. Här stod tidigare "Uploaded — check …" på `utan-brand` och
 *  `okand`. Det är en osann mening: en rad kan stoppas av priset, av en saknad
 *  fil eller av den ANDRA marknadens slutkort och ändå bära de domarna —
 *  rapporten påstod då att något laddats upp som aldrig laddades upp. Mätt
 *  2026-09-20 mot `byggDiscordJobb`: en rad vars SE-slutkort stoppade hela
 *  raden fick ändå Discord-raden "… (NO): … Uploaded".
 *  `med-brand` behåller "NOT uploaded" — den domen stoppar alltid sin egen
 *  marknad, så där är påståendet mätbart sant. */
export function rapportrad(namn, granskning) {
  const g = granskning ?? {};
  switch (g.dom) {
    case DOMAR.medBrand:
      return `${namn}: end card names a store — ${(g.fynd ?? []).map((f) => `"${f.ord}"`).join(', ')} (last ${g.slut_sek ?? SLUT_SEK}s). NOT uploaded — the editor must rebuild the end card.`;
    case DOMAR.utanBrand:
      return `${namn}: has an end card (last ${g.slut_sek ?? SLUT_SEK}s, no store name read). Does not block the upload — check that the card is in the market's language.`;
    case DOMAR.okand:
      // ⚠️ `g.skal` är SVENSKT och får inte in i en Discord-rad — se OKAND_EN.
      return `${namn}: end card could not be checked — ${OKAND_EN[g.kod] ?? OKAND_EN.okand}. Does not block the upload — someone has to look at the last seconds.`;
    default:
      return null;   // ren: ingen rad, annars drunknar fynden i brus
  }
}

/** Blockerar domen uppladdningen av EN rad? (Aldrig hela körningen.) */
export const blockerar = (dom) => dom === DOMAR.medBrand;

/** `--slut`-flaggans värde, eller SLUT_SEK. Kastar hellre än att skicka NaN
 *  vidare till ffmpeg — ett tyst NaN blir "-ss NaN" och ett obegripligt fel. */
export function slutSekUrFlagga(varde) {
  if (varde == null || varde === '') return SLUT_SEK;
  const n = Number(varde);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`--slut måste vara ett positivt tal sekunder, fick "${varde}"`);
  return n;
}

/** Ikonen per dom. Ligger här och inte i varje tabell — domarnas strängar
 *  ("slutkort-med-brand") stod hårdkodade på tre ställen, och en femte dom
 *  hade då fått fel ikon i två av dem utan att något test märkte det. */
export const IKON = Object.freeze({
  [DOMAR.ren]: '✅',
  [DOMAR.utanBrand]: '⚠️ ',
  [DOMAR.medBrand]: '⛔',
  [DOMAR.okand]: '❔',
});

// ------------------------------------------------------------- mätningen
// Härifrån och ned spawnas ffmpeg och python. Testerna injicerar `kor` och
// `ocr` i stället, så hela beslutsträdet går att mäta utan media.

// ffmpeg finns inte alltid som systembinär. Rutinens container saknade den
// 2026-09-21 (leveransrundan carashell/takskyddet): kontrollen svarade
// "spawnSync ffmpeg ENOENT" ⇒ dom "okand" ⇒ regeln släpper igenom videon.
// Två videor med carashell.se på slutkortet hade laddats upp den dagen.
// Python-paketet imageio-ffmpeg bär en egen binär och finns i containern —
// tools/qa-frames.py använder samma väg. Systembinären vinner alltid.
let ffmpegVag;
export function ffmpegBinar() {
  if (ffmpegVag !== undefined) return ffmpegVag;
  const system = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8', timeout: 20_000 });
  if (!system.error) { ffmpegVag = 'ffmpeg'; return ffmpegVag; }
  const via = spawnSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'], { encoding: 'utf8', timeout: 60_000 });
  const sokvag = String(via.stdout ?? '').trim();
  ffmpegVag = via.status === 0 && sokvag && existsSync(sokvag) ? sokvag : 'ffmpeg';
  return ffmpegVag;
}

const körFfmpeg = (args) => {
  const r = spawnSync(ffmpegBinar(), ['-hide_banner', '-nostdin', ...args], { encoding: 'buffer', maxBuffer: 256 * 1024 * 1024, timeout: 120_000 });
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

  if (!fil || !existsSync(fil)) return klar({ ...slutkortsdom({ last: false, kod: 'fil-saknas', skal: `filen finns inte: ${fil}` }) });

  // 1. Längden. `ffmpeg -i` utan utdata ger exit 1 med Duration på stderr —
  //    det är förväntat, inte ett fel. (ffprobe -select_streams är trasig här.)
  const info = kor(['-i', fil]);
  const langd = langdUrFfmpeg(info.stderr);
  if (!langd) return klar({ ...slutkortsdom({ last: false, kod: 'ingen-speltid', skal: `ffmpeg läste ingen speltid ur filen${info.fel ? ` (${info.fel})` : ''}` }) });
  if (langd < slutSek + 0.8) return klar({ langd_s: langd, ...slutkortsdom({ last: false, kod: 'for-kort', skal: `videon är ${langd.toFixed(1)} s — för kort för att skilja ett ${slutSek} s slutkort från filmen` }) });

  // 2. Gråskalerutor över [slutkortets start − FORE_SEK, slutet]. En enda
  //    avkodning; -ss före -i söker i filen i stället för att läsa den från början.
  const kortStart = langd - slutSek;
  const fonsterStart = Math.max(0, kortStart - FORE_SEK);
  const rå = kor(['-ss', fonsterStart.toFixed(3), '-i', fil, '-vf', `fps=${fps},scale=${ruta}:${ruta},format=gray`, '-f', 'rawvideo', '-pix_fmt', 'gray', '-']);
  const rutor = delaRutor(rå.stdout, ruta);
  if (rutor.length < 3) return klar({ langd_s: langd, start_s: kortStart, ...slutkortsdom({ last: false, kod: 'for-fa-rutor', skal: `ffmpeg gav ${rutor.length} bildrutor ur slutet — för få att döma på` }) });

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
      return klar({ langd_s: langd, start_s: kortStart, stilla: kort.stilla, byte: kort.byte, ...slutkortsdom({ slutkort: true, last: false, kod: 'ingen-bildruta', skal: `slutkort hittat men bildrutan gick inte att spara${p.fel ? ` (${p.fel})` : ''}` }) });
    }
    const läst = ocr(png);
    if (!läst.rader) {
      return klar({ langd_s: langd, start_s: kortStart, stilla: kort.stilla, byte: kort.byte, ...slutkortsdom({ slutkort: true, last: false, kod: 'ocr-fel', skal: `slutkort hittat men texten gick inte att läsa — ${läst.fel}` }) });
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
  // `--slut` utan värde gav förut NaN, och NaN gick rakt in i ffmpeg:s -ss som
  // strängen "NaN" — ett obegripligt fel i stället för ett läsbart.
  let slutSek;
  try { slutSek = slutSekUrFlagga(val('--slut')); }
  catch (e) { console.error(e.message); process.exit(2); }
  const g = await granskaSlutkort(fil, {
    butiksord: (val('--butiksord') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    slutSek,
  });
  if (argv.includes('--json')) console.log(JSON.stringify(g, null, 2));
  else {
    const ikon = (IKON[g.dom] ?? '?').trim();
    console.log(`${ikon} ${g.dom} — ${g.skal}`);
    console.log(`   längd ${g.langd_s?.toFixed(2) ?? '?'} s, slutkort från ${g.start_s?.toFixed(2) ?? '?'} s, stilla ${g.stilla?.toFixed(2) ?? '?'}, byte ${g.byte?.toFixed(2) ?? '?'}, ${g.sekunder} s`);
    if (g.textrader.length) console.log(`   OCR: ${g.textrader.join(' | ')}`);
  }
  process.exit(0);
}
