#!/usr/bin/env node
// briefgranskning.mjs — creative director-granskningen av Nattvaktens senaste
// briefrond för EN OPS-produkt. Dagen efter varje briefrond (ons + sön natt ⇒
// torsdag + måndag 07:00 + plats) läser den ALLA briefer Nattvakten lade i
// produktens hub i den ronden och dömer dem mot husets regler.
//
//   node tools/briefgranskning.mjs <nyckel> [--rond YYYY-MM-DD] [--ut <mapp>] [--json] [--igen]
//       LÄSER: registret, hubben, varje briefs text, butikens pris live, dna.md.
//       Skriver kön till <ut>.json och varje brief som <ut>/<namn>.md. Rör inget.
//   node tools/briefgranskning.mjs <nyckel> --skriv <dom.json> [--ko <ko.json>] [--idag YYYY-MM-DD] [--torr]
//       SKRIVER sessionens dom: en daterad sektion i products/<nyckel>/feedback.md,
//       en engelsk kommentar på varje rad som har ett FEL (aldrig annars), och
//       Discord-jobbet (lage `granskning`). Ändrar ALDRIG en rads status.
//
// Arbetsdelningen: verktyget mäter det som går att mäta (namn, taggar, pris mot
// butiken, butikens namn i annonstexten, tre-frågorstestets ❌, break-even i
// KPI:n, dna.md:s utdömda koncept, IMAGE PROMPT, COPY CARD). Sessionen läser
// varje brief själv och dömer det som kräver omdöme (håller hypotesen mot
// datan, testar den EN variabel, upprepar den ett dött koncept) och skriver
// domen i dom.json. Det verktyget hittar är ett golv, aldrig hela domen.
//
// Regler (aldrig valfria):
//   • Läs bara. Ingen status ändras, ingen brief skapas, inget i Meta rörs.
//   • Kommentar på en rad BARA när briefen har ett fel redigeraren måste känna
//     till. Anmärkningar går till feedback.md och Discord, inte till raden.
//   • Hitta aldrig på siffror: priset läses live ur butiken, break-even ur
//     produktfilen, dna.md citeras ordagrant.
//   • Kommentarerna är på engelska (redigerarna läser dem); feedback.md och
//     Discord-jobbets rader likaså (Discord är engelska sedan 2026-09-05).
//
// Kräver env NOTION_TOKEN. Noll npm-beroenden.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tolkaNamn, annonsdel, typAv, hamtaPris } from './ops-leveranskon.mjs';
import { brandtraff, textUrBlock, SPEGEL_OFFSET } from './ops-spegla.mjs';
import { hittaFält, lasManifest } from './notion-brief.mjs';
import { promptUrBrief } from '../factory/ops-bild.mjs';
import { marknadslank, domanUrButik } from '../factory/opsmarknader.mjs';
import { serUtSomSvenska } from './lib/engelska.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOTION_API = 'https://api.notion.com/v1';
const TYP_RE = /pending approval/i;          // inkludering, aldrig uteslutning

/** Taggarna varje brief ska bära (VARIABELTAGGAR-raden, ANALYSMETOD 6b + copy-A/B:t). */
export const KRAVDA_TAGGAR = Object.freeze(['vinkel', 'hook-typ', 'format', 'proof', 'offer-i-creativen', 'visuell stil', 'textmängd', 'talare', 'copy_model']);
const TAGGALIAS = { hook: 'hook-typ', hooktyp: 'hook-typ', offer: 'offer-i-creativen', 'offer i creativen': 'offer-i-creativen', textmangd: 'textmängd', 'visuell-stil': 'visuell stil', copymodel: 'copy_model', 'copy-model': 'copy_model' };
/** Veckodagar rutinen går (JS: 1 = måndag, 4 = torsdag) — dagen efter briefnätterna sön + ons. */
export const GRANSKNINGSDAGAR = Object.freeze([1, 4]);
/** Markören som gör kommentaren igenkännbar, så en omkörning aldrig skriver den två gånger. */
export const KOMMENTARMARKE = 'Brief review';

// ------------------------------------------------------------ ren logik
// Allt nedan är utan nät och testas i tools/test/briefgranskning.test.mjs.

const rad = (t) => String(t ?? '').replace(/\r\n?/g, '\n').split('\n');
const utanFet = (s) => String(s ?? '').replace(/\*\*/g, '').replace(/`/g, '');
const tal = (s) => {
  const n = Number(String(s ?? '').replace(/[\s  .]/g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Är raden en rubrik — markdown (#) eller Notion-dump (numrerad eller känd rubriktext)? */
export function arRubrik(r) {
  const s = utanFet(r).trim();
  if (/^#{1,6}\s/.test(s)) return true;
  return /^(\d+[.)]\s+)?(why this ad exists|hypothesis|hypotes|format|exact text|design brief|shot list|copy card|three-question test|kpi|hard rules|image prompt|script|manus)\b/i.test(s);
}

/** Texten under en rubrik som matchar `re`, fram till nästa rubrik. '' om den saknas. */
export function sektion(text, re) {
  const rader = rad(text);
  const start = rader.findIndex((r) => arRubrik(r) && re.test(utanFet(r)));
  if (start === -1) return '';
  const ut = [];
  for (const r of rader.slice(start + 1)) {
    if (arRubrik(r)) break;
    ut.push(r);
  }
  return ut.join('\n').trim();
}

/** VARIABELTAGGAR-raden → { rad, taggar: {nyckel: värde}, saknade: [] } eller null. */
export function taggarUr(text) {
  const r = rad(text).find((x) => /VARIABELTAGGAR\s*:/i.test(x));
  if (!r) return null;
  const rest = utanFet(r).replace(/^.*?VARIABELTAGGAR\s*:\s*/i, '');
  const taggar = {};
  for (const del of rest.split(/\s*[·|]\s*/)) {
    const m = del.match(/^\s*([^=:]+?)\s*[=:]\s*(.+?)\s*$/);
    if (!m) continue;
    const nyckel = m[1].trim().toLowerCase();
    taggar[TAGGALIAS[nyckel] ?? nyckel] = m[2].trim();
  }
  const saknade = KRAVDA_TAGGAR.filter((k) => !taggar[k]);
  return { rad: rest.trim(), taggar, saknade };
}

/**
 * Annonstexten ur en brief — det som hamnar i annonsen, inte förklaringen
 * till redigeraren: tabellerna "Swedish (use this)", COPY CARD, hook-raden,
 * caption-raderna och alternativa hooks. Länkar och Destination-/Landing
 * page-rader räknas inte (metadata). Butikens namn får stå i "Why this ad
 * exists" — där pratar vi med redigeraren, inte kunden.
 */
export function annonstextUr(text) {
  const rader = rad(text);
  const ut = [];
  let iTabell = false;
  let iCopy = false;
  for (const r of rader) {
    const s = utanFet(r).trim();
    if (iCopy) {
      if (arRubrik(s) && !/copy card/i.test(s)) iCopy = false;
      else { if (!/^(destination|landing page)\s*:/i.test(s)) ut.push(s); continue; }
    }
    if (iTabell) {
      if (!s || arRubrik(s) || !/\|/.test(s)) iTabell = false;
      else { if (!/^\|?\s*:?-{3,}/.test(s)) ut.push(s); continue; }
    }
    if (/swedish\s*\(use this\)/i.test(s) && /\|/.test(s)) { iTabell = true; continue; }
    if (/copy card/i.test(s) && arRubrik(s)) { iCopy = true; continue; }
    if (/^(hook idea|hook|caption overlays?|alternative hooks?|primary text|headline|description)\s*[:(]/i.test(s)) ut.push(s);
  }
  return ut.join('\n').replace(/https?:\/\/\S+/gi, ' ');
}

/** Butikens namn i annonstexten: brandet, domänbasen och Bäver-familjen.
 *  Annonsnamn (CaraShellRoof_SP_5_1) räknas inte — ordgränsen ser till det. */
export function namntraff(annonstext, namn = []) {
  const t = String(annonstext ?? '');
  const ut = new Set();
  for (const n of namn) {
    const ren = String(n ?? '').trim();
    if (!ren) continue;
    const re = new RegExp(`(?<![\\wåäö])${ren.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\wåäö])`, 'gi');
    for (const m of t.matchAll(re)) ut.add(m[0]);
  }
  for (const b of brandtraff(t)) ut.add(b);
  return [...ut];
}

/** Priset briefen föreskriver + jämförpriset. Hard rules-sektionen vinner
 *  ("Price 1 129 kr, compare-at 1 469 kr"); annars COPY CARD-formen
 *  "1 129 kr (ord. 1 469 kr)" var den än står. */
export function prisUrBriefText(text) {
  const hela = utanFet(text);
  const kallor = [utanFet(sektion(text, /hard rules/i)), hela].filter(Boolean);
  const forsta = (re) => { for (const k of kallor) { const m = re.exec(k); if (m) return tal(m[1]); } return null; };
  const pris = forsta(/\bpri(?:ce|s)\s*(?:exactly|exakt)?\s*:?\s*(\d[\d\s  .]*\d|\d)\s*(?:kr|sek)\b/i)
    ?? forsta(/(\d[\d\s  .]*\d|\d)\s*kr\s*\(\s*ord\.?\s*\d/i);
  const jamforpris = forsta(/(?:compare-?at|ord\.?|jämförpris|jamforpris|ordinarie)\s*(?:price)?\s*:?\s*\(?\s*(\d[\d\s  .]*\d|\d)\s*(?:kr|sek)\b/i);
  return { pris, jamforpris };
}

/** Alla kronbelopp i en text, som tal. */
export function kronorI(text) {
  const ut = [];
  for (const m of String(text ?? '').matchAll(/(\d[\d\s  .]*\d|\d)\s*(?:kr|kronor|sek)\b/gi)) {
    const n = tal(m[1]);
    if (n) ut.push(n);
  }
  return [...new Set(ut)];
}

/** Tre-frågorstestet: finns tabellen, och vilka rader fick ❌? */
export function trefragorUr(text) {
  const rader = rad(text);
  const start = rader.findIndex((r) => /visualis/i.test(r) && /falsif/i.test(r));
  if (start === -1) return { finns: false, underkanda: [] };
  const underkanda = [];
  for (const r of rader.slice(start + 1)) {
    const s = r.trim();
    if (!s || arRubrik(s)) break;
    if (!/\|/.test(s)) break;
    if (/❌/.test(s)) underkanda.push(utanFet(s).replace(/^\|/, '').split('|')[0].trim());
  }
  return { finns: true, underkanda };
}

/** Koncept dna.md uttryckligen tar bort ur nästa rond ("GT får inga briefer").
 *  Citatet följer med så sessionen kan avgöra om instruktionen gäller än. */
export function dodaKoncept(dnaText) {
  const ut = [];
  for (const r of rad(dnaText)) {
    const s = utanFet(r);
    // Konceptkoden är VERSALER — ingen i-flagga, annars vinner "och" över "GT".
    // Ordgränsen skrivs ut: JS \b ser "D" i "Därför" som ett eget ord (ä är
    // inget \w-tecken utan u-flaggan).
    const m = /(?<![A-Za-zÅÄÖåäö])([A-Z]{1,4})(?![A-Za-zÅÄÖåäö])[^\n]{0,40}?(?<![A-Za-zÅÄÖåäö])(?:får|ska få|gets?)\s+(?:inga|no)\s+(?:briefer|briefs)/.exec(s)
      ?? /(?<![A-Za-zÅÄÖåäö])(?:inga|no)\s+(?:briefer|briefs)[^\n]{0,20}?(?<![A-Za-zÅÄÖåäö])(?:för|for|på|to)\s+([A-Z]{1,4})(?![A-Za-zÅÄÖåäö])/.exec(s);
    if (m && !ut.some((x) => x.koncept === m[1])) ut.push({ koncept: m[1], citat: s.trim().slice(0, 200) });
  }
  return ut;
}

/** Är briefen en VARIANT (pekar på en förälder-annons / isolerar en variabel)? */
export function arVariant(text) {
  const t = utanFet(text);
  return /isolated variable/i.test(t) || /\bparent\b[^\n:]{0,20}:\s*[A-Za-zÅÄÖ]+_[A-Z]{1,4}_\d+/i.test(t) || /\bförälder\b[^\n:]{0,20}:\s*[A-Za-zÅÄÖ]+_[A-Z]{1,4}_\d+/i.test(t);
}

/** Den isolerade variabeln ("Isolated variable: the setting of the photo.") eller null. */
export function isoleradVariabel(text) {
  const m = /isolated variable\s*:\s*([^\n.]+)/i.exec(utanFet(text));
  return m ? m[1].trim() : null;
}

/** Nämner briefens huvud (raderna före första rubriken + "Why this ad exists") en källa? */
export function kallaUr(text) {
  const rader = rad(text);
  const forstaRubrik = rader.findIndex((r, i) => i > 0 && arRubrik(r));
  const huvud = rader.slice(0, forstaRubrik === -1 ? rader.length : forstaRubrik).join('\n') + '\n' + sektion(text, /why this ad exists|varför/i);
  const t = utanFet(huvud);
  const gissning = /\b(guess|gissning)\b/i.test(t);
  const kalla = /\b(backlog|playbook|winning line|swipe|inherited|ärvd|source|källa|measured|mätt|data|dna\.md|product file|produktfil|parent|förälder)\b/i.test(t);
  return { kalla, gissning };
}

/** Break-even-CPA som KPI:n dömer mot, och om den dömer mot target (förbjudet). */
export function kpiUr(text) {
  const t = utanFet(sektion(text, /\bkpi\b/i) || text);
  const be = /break-?even\s*(?:cpa)?\s*(?:of|på)?\s*:?\s*(\d[\d\s  .]*\d|\d)\s*kr/i.exec(t);
  const motTarget = /judged against\s+(?:the\s+)?target|mot target|against target-cpa/i.test(t) && !/never against target/i.test(t);
  return { breakEvenCpa: be ? tal(be[1]) : null, motTarget };
}

/** Argumenterar hypotesen på ROAS ensamt (ANALYSMETOD: enmetriks-domar är förbjudna)? */
export function roasEnsamt(text) {
  const t = `${sektion(text, /why this ad exists|varför/i)}\n${sektion(text, /hypothes|hypotes/i)}`;
  return /\bROAS\b/.test(t) && !/\bCPA\b|profit contribution|vinstbidrag|purchases|köp\b/i.test(t);
}

/**
 * Domen per brief — det mätbara. Ren funktion.
 * rad: { namn, typ ('video'|'bild'), typ_notion, status, text }
 * ctx: { annonsprefix, prefix: [..], tillhor(namn, prefix), butiksnamn: [...],
 *        pris_butik: {pris, jamforpris} | null, breakEvenCpa, copyModell, doda_koncept: [{koncept, citat}] }
 * Returnerar { fel: [{kod, text}], anmarkningar: [{kod, text}], fakta }.
 */
export function granskaBrief(r, ctx = {}) {
  const fel = [];
  const anm = [];
  const F = (kod, text) => fel.push({ kod, text });
  const A = (kod, text) => anm.push({ kod, text });
  const text = String(r.text ?? '');
  const namn = annonsdel(r.namn);
  const t = tolkaNamn(namn);
  const typ = r.typ ?? typAv(r.typ_notion);

  // 1. Namnet (docs/naming-convention.md + OPS-konventionen <prefix>_<KONCEPT>_<nr>[_<variant>]).
  const ap = String(ctx.annonsprefix ?? '').replace(/_$/, '');
  if (ctx.prefix?.length && typeof ctx.tillhor === 'function' && !ctx.tillhor(namn, ctx.prefix)) F('namn', `name "${namn}" does not carry the store's ad prefix (${ap || ctx.prefix.join('/')})`);
  else if (ap && namn.toLowerCase().startsWith(ap.toLowerCase()) && !namn.startsWith(ap)) A('namn', `prefix is spelled "${namn.slice(0, ap.length)}", the store's is "${ap}" — same ad, different casing; keep it exact`);
  if (!t.koncept) F('namn', `name "${namn}" has no concept code (<prefix>_<CONCEPT>_<n>[_<variant>])`);
  if (t.nummer == null) F('namn', `name "${namn}" has no number`);
  else if (t.nummer >= SPEGEL_OFFSET) F('namn', `number ${t.nummer} is in the mirror range (≥ ${SPEGEL_OFFSET} is reserved for /ops-spegla) — own briefs are numbered below ${SPEGEL_OFFSET}`);
  const namnVideo = /^H\d+/i.test(String(t.variant ?? ''));
  if (typ === 'bild' && namnVideo) F('typ', `Typ says image but the name's variant "${t.variant}" says video (H-variant)`);
  if (typ === 'video' && t.variant && !namnVideo) F('typ', `Typ says video but the name's variant "${t.variant}" is an image variant (videos are _H1, _H2 …)`);

  // 2. VARIABELTAGGAR — utan dem kan feedback-loopen inte gruppera vinstbidrag.
  const taggar = taggarUr(text);
  if (!taggar) F('taggar', 'VARIABELTAGGAR line missing — the next /cs run cannot group this ad by variable');
  else if (taggar.saknade.length) {
    const saknarCopy = taggar.saknade.includes('copy_model');
    const ovriga = taggar.saknade.filter((k) => k !== 'copy_model');
    if (ovriga.length) A('taggar', `VARIABELTAGGAR missing: ${ovriga.join(', ')}`);
    if (saknarCopy) (ctx.copyModell === 'ab' ? F : A)('taggar', 'VARIABELTAGGAR has no copy_model — the Fable/Sonnet A/B test cannot count this ad');
  }

  // 3. Hypotes, förälder/källa, EN variabel.
  // Hook-raden ligger under hypotesrubriken i mallen — den är ingen hypotes.
  const hypotes = sektion(text, /hypothes|hypotes/i).split('\n').filter((l) => !/^\**\s*hook idea/i.test(l)).join('\n');
  if (hypotes.replace(/\s+/g, ' ').trim().length < 20) F('hypotes', 'no hypothesis section — nothing to read the outcome against');
  if (roasEnsamt(text)) A('hypotes', 'the rationale argues on ROAS alone — rank on profit contribution (break-even-CPA − CPA) × purchases (ANALYSMETOD)');
  const variant = arVariant(text);
  if (variant) {
    const iso = isoleradVariabel(text);
    if (!iso) F('variabel', 'variant of a parent ad without an "Isolated variable:" line — say the one thing that changed');
    else if (/\s(\+|and|och)\s|,/i.test(iso.replace(/\([^)]*\)/g, ''))) A('variabel', `"Isolated variable: ${iso}" may name more than one variable — a variant changes exactly one thing`);
  } else {
    const k = kallaUr(text);
    if (!k.kalla && !k.gissning) F('kalla', 'new concept with no source named (playbook, winning line, swipe, own data or backlog) and not marked as a guess');
  }

  // 4. Butikens namn i annonstexten (Axels beslut 2026-09-18).
  const annons = annonstextUr(text);
  const traffar = namntraff(annons, ctx.butiksnamn ?? []);
  if (traffar.length) F('butiksnamn', `the ad text names the store (${traffar.join(', ')}) — never in copy, on the image, in voice-over or captions (rule since 2026-09-18; ads are mirrored between stores)`);
  if (!/never name the store|never names? the store|store'?s name|butikens namn/i.test(utanFet(sektion(text, /hard rules/i)))) A('hardrules', 'hard rules do not carry "the ad never names the store" (rule since 2026-09-18)');

  // 5. Priset — briefens mot butikens, läst live.
  const p = prisUrBriefText(text);
  const butik = ctx.pris_butik ?? null;
  if (p.pris == null && kronorI(annons).length) A('pris', 'the ad text carries kronor amounts but the brief states no price rule ("Price exactly … kr")');
  if (p.pris != null) {
    if (!butik?.pris) A('pris', `brief says ${p.pris} kr — the store price could not be read live, so it is unchecked`);
    else if (p.pris !== butik.pris) F('pris', `brief says ${p.pris} kr, the store says ${butik.pris} kr (read live) — fix before production; if the ad is already live it goes into the next version`);
    if (p.jamforpris != null && butik?.jamforpris && p.jamforpris !== butik.jamforpris) F('pris', `compare-at ${p.jamforpris} kr in the brief, ${butik.jamforpris} kr in the store`);
  }
  if (butik?.pris) {
    const ok = new Set([butik.pris, butik.jamforpris, butik.jamforpris ? butik.jamforpris - butik.pris : null].filter(Boolean));
    const andra = kronorI(annons).filter((n) => !ok.has(n));
    if (andra.length) A('pris', `other kronor amounts in the ad text: ${andra.join(', ')} kr — only the price, compare-at and the saving are allowed`);
  }

  // 6. Tre-frågorstestet (docs/copy-regler.md).
  const tre = trefragorUr(text);
  if (!tre.finns) A('trefragor', 'no three-question test table (visualise / falsify / only we can say it)');
  // Svenska rader i backticks — så Discords engelskspärr inte tar felet för svenska.
  else if (tre.underkanda.length) F('trefragor', `a line failed the three-question test (❌) and still went out: ${tre.underkanda.map((x) => `\`${x}\``).join(', ')}`);

  // 7. Döda koncept ur dna.md — sessionen avgör om instruktionen gäller än.
  for (const d of ctx.doda_koncept ?? []) {
    if (t.koncept && d.koncept === t.koncept) A('dna', `dna.md rules this concept out: "${d.citat}" — decide whether that still holds for this round`);
  }

  // 8. Formatet: bild ⇒ IMAGE PROMPT + Exact text; video ⇒ manustabell.
  let prompt = null;
  try { prompt = promptUrBrief(text); } catch (e) { F('bild', `IMAGE PROMPT unreadable: ${e.message}`); }
  const harTextTabell = /swedish\s*\(use this\)/i.test(text);
  if (typ === 'bild') {
    if (!prompt) F('bild', 'image brief without an IMAGE PROMPT block — the factory cannot generate it');
    if (!harTextTabell) A('bild', 'image brief without an "Exact text" table — it goes live as a plain photo (batch #2 lesson 2026-09-15)');
  } else {
    if (!harTextTabell) F('video', 'video brief without the script table (Swedish (use this) | English meaning)');
    if (!/max\s*2\s*lines|max 2 rader|två rader/i.test(text)) A('video', 'no caption rule (max 2 lines) in the brief');
  }

  // 9. COPY CARD + KPI.
  if (!/copy card/i.test(text) || !/primary text/i.test(text) || !/headline/i.test(text)) F('copy', 'COPY CARD incomplete (primary text + headline + description) — the delivery run cannot upload without it');
  const kpi = kpiUr(text);
  if (kpi.motTarget) F('kpi', 'KPI judges against target — kill decisions are measured against break-even only (ANALYSMETOD step 3)');
  if (kpi.breakEvenCpa == null) A('kpi', 'KPI names no break-even CPA');
  else if (ctx.breakEvenCpa && Math.abs(kpi.breakEvenCpa - Math.round(ctx.breakEvenCpa)) > 1) F('kpi', `KPI says break-even CPA ${kpi.breakEvenCpa} kr, the product file says ${Math.round(ctx.breakEvenCpa)} kr`);

  return {
    fel, anmarkningar: anm,
    fakta: { koncept: t.koncept, nummer: t.nummer, variant: t.variant, typ, ar_variant: variant, isolerad: isoleradVariabel(text), taggar: taggar?.taggar ?? null, pris_brief: p, trefragor: tre.finns, image_prompt: Boolean(prompt) },
  };
}

/** Svensk dag ur en ISO-tidsstämpel. */
export function svenskDag(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const delar = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d);
  const del = (typ) => delar.find((x) => x.type === typ)?.value;
  return `${del('year')}-${del('month')}-${del('day')}`;
}

/**
 * Vilken rond som granskas. Ren.
 * rader: [{ namn, skapad_dag }]. Ordningen: --rond, annars registrets
 * senaste_brief (om hubben har rader den dagen), annars hubbens nyaste dag.
 */
export function valjRond(rader, { rond = null, senasteBrief = null } = {}) {
  const perDag = {};
  for (const r of rader) if (r.skapad_dag) perDag[r.skapad_dag] = (perDag[r.skapad_dag] ?? 0) + 1;
  const dagar = Object.keys(perDag).sort();
  let datum = null;
  let kalla = null;
  if (rond) { datum = rond; kalla = '--rond'; }
  else if (senasteBrief && perDag[senasteBrief]) { datum = senasteBrief; kalla = 'registrets senaste_brief'; }
  else if (dagar.length) { datum = dagar.at(-1); kalla = senasteBrief ? `hubbens nyaste dag (registrets senaste_brief ${senasteBrief} har inga rader)` : 'hubbens nyaste dag (registret saknar senaste_brief)'; }
  return { datum, kalla, rader: rader.filter((r) => r.skapad_dag === datum), per_dag: perDag };
}

/** Batchnumret ur products/<nyckel>/batch-NN/manifest.json — den batch som delar flest namn. */
export function hittaBatch(minnesmapp, namn = []) {
  if (!minnesmapp || !existsSync(minnesmapp)) return null;
  const vill = new Set(namn.map((n) => annonsdel(n).toLowerCase()));
  let bast = null;
  for (const d of readdirSync(minnesmapp).filter((x) => /^batch-\d+$/i.test(x)).sort()) {
    const fil = join(minnesmapp, d, 'manifest.json');
    if (!existsSync(fil)) continue;
    let lista;
    try { lista = lasManifest(readFileSync(fil, 'utf8'), join(minnesmapp, d)); } catch { continue; }
    const traffar = lista.filter((r) => vill.has(r.namn.toLowerCase())).length;
    if (traffar > 0 && (!bast || traffar > bast.traffar)) bast = { batch: Number(d.replace(/^batch-/i, '')), mapp: join(minnesmapp, d), traffar, antal: lista.length };
  }
  return bast;
}

/** Nästa granskningsdag (måndag/torsdag) efter `idag`. */
export function nastaGranskning(idag, dagar = GRANSKNINGSDAGAR) {
  const d = new Date(`${idag}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  for (let i = 0; i < 8; i++) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (dagar.includes(d.getUTCDay())) return d.toISOString().slice(0, 10);
  }
  return null;
}

/** Finns redan en sektion för ronden i feedback.md? */
export const harSektion = (befintlig, rond) => new RegExp(`^## Rond ${rond}\\b`, 'm').test(String(befintlig ?? ''));

/** Domen per rad: ❌ vid fel, ⚠️ vid anmärkning, ✅ annars. */
export const domFor = (r) => (r.fel?.length ? 'fel' : r.anmarkningar?.length ? 'anmarkning' : 'ok');
const domTecken = { fel: '❌', anmarkning: '⚠️', ok: '✅' };

/** Sessionens dom mot kön: allt måste stämma innan något skrivs. */
export function giltigDom(dom, ko) {
  const fel = [];
  if (!dom || typeof dom !== 'object') return { ok: false, fel: ['dom.json är inte ett objekt'] };
  if (dom.nyckel && ko?.nyckel && dom.nyckel !== ko.nyckel) fel.push(`dom.nyckel "${dom.nyckel}" ≠ köns "${ko.nyckel}"`);
  if (!dom.rond) fel.push('dom.rond saknas (YYYY-MM-DD)');
  else if (ko?.rond?.datum && dom.rond !== ko.rond.datum) fel.push(`dom.rond ${dom.rond} ≠ köns rond ${ko.rond.datum}`);
  const regler = Array.isArray(dom.regler) ? dom.regler.map((x) => String(x ?? '').trim()).filter(Boolean) : [];
  if (regler.length !== 3) fel.push(`exakt tre regler för nästa rond krävs — fick ${regler.length}`);
  for (const [i, r] of regler.entries()) if (r.length < 15) fel.push(`regel ${i + 1} är för kort för att kunna följas: "${r}"`);
  const rader = Array.isArray(dom.rader) ? dom.rader : [];
  const kanda = new Map((ko?.rader ?? []).map((r) => [String(r.namn).toLowerCase(), r]));
  for (const r of rader) {
    const namn = String(r?.namn ?? '').trim();
    if (!namn) { fel.push('en rad i dom.rader saknar namn'); continue; }
    if (kanda.size && !kanda.has(namn.toLowerCase())) fel.push(`"${namn}" finns inte i rondens kö`);
    for (const f of ['fel', 'anmarkningar', 'bra']) if (r[f] !== undefined && !Array.isArray(r[f])) fel.push(`${namn}: ${f} ska vara en lista`);
    for (const x of [...(r.fel ?? []), ...(r.anmarkningar ?? [])]) {
      const s = String(x);
      if (!serUtSomSvenska(s)) continue;
      // Svenska annonsrader i citattecken är ok i sak — men Discords spärr ser
      // dem: de ska stå i backticks, som engelska.mjs hoppar över.
      fel.push(serUtSomSvenska(s.replace(/"[^"]*"/g, ' ').replace(/'[^']*'/g, ' '))
        ? `${namn}: "${s.slice(0, 60)}…" ser svenskt ut — kommentarer och Discord-rader är på engelska`
        : `${namn}: "${s.slice(0, 60)}…" citerar svenska annonsrader med citattecken — sätt dem i backticks (\`…\`) så Discords engelskspärr släpper raden`);
    }
  }
  if (kanda.size) for (const n of kanda.keys()) if (!rader.some((r) => String(r?.namn ?? '').toLowerCase() === n)) fel.push(`"${kanda.get(n).namn}" i kön saknar en dom`);
  for (const f of ['bra', 'missat']) if (dom[f] !== undefined && !Array.isArray(dom[f])) fel.push(`${f} ska vara en lista`);
  return { ok: fel.length === 0, fel };
}

/** Kommentaren på en rad med fel. Engelska, med markören först. */
export function kommentarText(r, { datum, brand }) {
  const punkter = (r.fel ?? []).map((x, i) => `${i + 1}. ${x}`).join('\n');
  return `${KOMMENTARMARKE} ${datum}${brand ? ` (${brand})` : ''} — this brief has ${r.fel.length === 1 ? 'an error' : `${r.fel.length} errors`} the editor must know about:\n${punkter}\nFix before production. If the ad is already live, apply it to the next version — nothing is paused. Status unchanged.`.slice(0, 2000);
}

/** Sektionen i feedback.md för en rond. Ren, markdown. */
export function feedbackSektion(dom, { idag, batch = null, antal = null }) {
  const rader = dom.rader ?? [];
  const n = antal ?? rader.length;
  const ut = [];
  ut.push(`## Rond ${dom.rond} — ${batch ? `batch #${batch}` : 'batch okänd'} (${n} brief${n === 1 ? '' : 'er'}) · granskad ${idag}`);
  ut.push('');
  const lista = (rubrik, punkter, tom) => {
    ut.push(`**${rubrik}**`);
    if (punkter.length) for (const p of punkter) ut.push(`- ${p}`);
    else ut.push(`- ${tom}`);
    ut.push('');
  };
  lista('Bra', (dom.bra ?? []).map(String), 'inget att lyfta');
  lista('Missat', (dom.missat ?? []).map(String), 'inget');
  ut.push('**Tre regler för nästa rond**');
  (dom.regler ?? []).forEach((r, i) => ut.push(`${i + 1}. ${r}`));
  ut.push('');
  ut.push('| Brief | Dom | Fel | Anmärkningar |');
  ut.push('|---|---|---|---|');
  for (const r of rader) {
    const dom_ = domFor(r);
    ut.push(`| \`${r.namn}\` | ${domTecken[dom_]} | ${(r.fel ?? []).join(' · ') || '—'} | ${(r.anmarkningar ?? []).join(' · ') || '—'} |`);
  }
  ut.push('');
  return ut.join('\n');
}

/** Lägger in (eller byter ut) rondens sektion i feedback.md. Ren. */
export function laggInSektion(befintlig, rond, sektion_, { rubrik = '' } = {}) {
  let text = String(befintlig ?? '');
  if (!text.trim()) text = `${rubrik}\n\n---\n\n`;
  const re = new RegExp(`^## Rond ${rond}\\b[\\s\\S]*?(?=^## Rond |(?![\\s\\S]))`, 'm');
  if (re.test(text)) return text.replace(re, `${sektion_.trimEnd()}\n\n`);
  return `${text.trimEnd()}\n\n${sektion_.trimEnd()}\n`;
}

/** Discord-jobbet (lage `granskning`). Ren, engelska rader. */
export function byggDiscordJobb({ brand, datum, rond, batch = null, hub_url = null, rader = [], regler = [], varningar = [], redigerare = null, feedbackFil = null, stopp = [] }) {
  const medFel = rader.filter((r) => r.fel?.length);
  const medAnm = rader.filter((r) => !r.fel?.length && r.anmarkningar?.length);
  const rena = rader.length - medFel.length - medAnm.length;
  const gjort = [];
  gjort.push(`Reviewed ${rader.length} brief${rader.length === 1 ? '' : 's'} from the ${rond} round${batch ? ` (batch #${batch})` : ''}: ${rena} clean, ${medAnm.length} with notes, ${medFel.length} with errors`);
  for (const r of medFel) gjort.push(`${r.namn}: ${r.fel.join(' · ')} — comment on the Notion row`);
  if (regler.length) gjort.push(`3 rules for the next round written to ${feedbackFil ?? 'feedback.md'}: ${regler.map((x, i) => `(${i + 1}) ${x}`).join(' ')}`);
  const varn = [];
  for (const r of medAnm) varn.push(`${r.namn}: ${r.anmarkningar.join(' · ')}`);
  for (const v of varningar) varn.push(v);
  const action_redigerare = [];
  if (medFel.length && redigerare?.discord_id) {
    action_redigerare.push({ discord_id: redigerare.discord_id, namn: redigerare.namn ?? null, rader: medFel.map((r) => `${r.namn}: ${r.fel.join(' · ')} — see the comment on the Notion row`) });
  } else if (medFel.length) {
    varn.push(`No editor assigned — ${medFel.length} brief${medFel.length === 1 ? '' : 's'} with errors stay as they are; the night watch reads feedback.md before the next round`);
  }
  return {
    brand, datum, lage: 'granskning',
    gjort, varningar: varn, action_axel: [...stopp], action_redigerare,
    hub_url,
    nasta_korning: nastaGranskning(datum) ?? '',
  };
}

// ------------------------------------------------------------ nät: Notion

let sist = 0;
async function notion(sokvag, { method = 'GET', body = null } = {}) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN saknas i miljön.');
  const vanta = 350 - (Date.now() - sist);
  if (vanta > 0) await new Promise((r) => setTimeout(r, vanta));
  sist = Date.now();
  for (let forsok = 0; ; forsok++) {
    let res;
    try {
      res = await fetch(`${NOTION_API}/${sokvag}`, {
        method,
        headers: { authorization: `Bearer ${token}`, 'notion-version': '2022-06-28', 'content-type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      if (forsok < 3) { await new Promise((r) => setTimeout(r, 3000 * (forsok + 1))); continue; }
      throw new Error(`Notion nåddes inte (${sokvag}): ${e.cause?.message ?? e.message}`);
    }
    const json = await res.json().catch(() => ({}));
    if (res.ok) return json;
    if ((res.status === 429 || res.status >= 500) && forsok < 3) { await new Promise((r) => setTimeout(r, 2000 * (forsok + 1))); continue; }
    if (res.status === 404) throw new Error(`Notion 404 på ${sokvag} — integrationen är inte inbjuden (••• → Connections), eller sidan ligger i papperskorgen.`);
    throw new Error(`Notion ${res.status}: ${json.message || res.statusText}`);
  }
}

const ren = (id) => String(id ?? '').replace(/-/g, '');
const varde = (p) => {
  if (!p) return '';
  if (p.type === 'title') return p.title.map((t) => t.plain_text).join('');
  if (p.type === 'rich_text') return p.rich_text.map((t) => t.plain_text).join('');
  if (p.type === 'status') return p.status?.name ?? '';
  if (p.type === 'select') return p.select?.name ?? '';
  if (p.type === 'multi_select') return (p.multi_select ?? []).map((o) => o.name).join(', ');
  if (p.type === 'date') return p.date?.start ?? '';
  if (p.type === 'url') return p.url ?? '';
  return '';
};

async function hamtaHub(databaseId) {
  const d = await notion(`databases/${ren(databaseId)}`);
  const titel = (d.title ?? []).map((t) => t.plain_text ?? '').join('') || '(namnlös)';
  return { id: d.id, titel, url: d.url ?? null, in_trash: !!(d.in_trash || d.archived), properties: d.properties ?? {}, falt: hittaFält(d.properties ?? {}) };
}

/** Alla annonsrader i hubben (Typ ~ pending approval), oavsett status. */
async function allaRader(hub) {
  const ut = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const r = await notion(`databases/${ren(hub.id)}/query`, { method: 'POST', body });
    for (const s of r.results ?? []) {
      if (s.archived) continue;
      const p = s.properties ?? {};
      const typ = hub.falt.typ ? varde(p[hub.falt.typ]) : '';
      if (!TYP_RE.test(typ)) continue;
      const titel = hub.falt.titel ? varde(p[hub.falt.titel]) : '';
      if (!titel || /^Skärmavbild/i.test(titel)) continue;
      const skapadProp = hub.falt.skapad ? varde(p[hub.falt.skapad]) : '';
      ut.push({
        page_id: s.id, url: s.url, namn: annonsdel(titel), titel, typ_notion: typ, typ: typAv(typ),
        status: hub.falt.status ? varde(p[hub.falt.status]) : '',
        skapad: s.created_time, skapad_dag: (skapadProp || svenskDag(s.created_time) || '').slice(0, 10),
      });
    }
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return ut;
}

/** Toppnivåblocken i en sida; tabellernas rader fästs som `barn`. */
async function hamtaBlock(pageId) {
  const las = async (blockId) => {
    const ut = [];
    let cursor;
    do {
      const r = await notion(`blocks/${ren(blockId)}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`);
      ut.push(...(r.results ?? []));
      cursor = r.has_more ? r.next_cursor : null;
    } while (cursor);
    return ut;
  };
  const block = await las(pageId);
  for (const b of block) if (b.type === 'table' && b.has_children) b.barn = await las(b.id);
  return block;
}

async function kommentera(pageId, text) {
  await notion('comments', { method: 'POST', body: { parent: { page_id: pageId }, rich_text: [{ text: { content: String(text).slice(0, 2000) } }] } });
}

/** Står redan en kommentar med markören på raden? Utan rätten "Read comments"
 *  svarar API:t 403 — då skriver vi hellre en gång för mycket än tiger. */
async function harKommentar(pageId, marke) {
  try {
    const r = await notion(`comments?block_id=${ren(pageId)}&page_size=100`);
    return (r.results ?? []).some((k) => (k.rich_text ?? []).map((t) => t.plain_text ?? '').join('').startsWith(marke));
  } catch { return false; }
}

// ------------------------------------------------------------ huvudflödet

/** Produktminnet: products/<nyckel>/ i första hand, annars products/<butik>/ (enproduktsbutik). */
export function minnesmapp(post, rot = ROT) {
  const perNyckel = join(rot, 'products', post.nyckel);
  if (existsSync(join(perNyckel, 'dna.md'))) return perNyckel;
  const perButik = join(rot, 'products', String(post.nyckel).split('/')[0]);
  if (existsSync(join(perButik, 'dna.md'))) return perButik;
  return perNyckel;
}

export async function byggGranskningsko({ nyckel, rond = null, ut = null, logg = (...a) => console.error(...a) }) {
  const varningar = [];
  const stopp = [];
  const { laddaButik, sakerstallKonto, OPS_ANNONSKONTO, tillhorButiken, svenskDatum, utmapp } = await import('../factory/register.mjs');
  const butik = laddaButik(nyckel);
  const post = butik.post;
  if (sakerstallKonto(post) !== OPS_ANNONSKONTO) throw new Error(`STOPP: ${post.nyckel} pekar inte på OPS-kontot — briefgranskningen är byggd för OPS-butikerna.`);
  if (!butik.prefix) throw new Error(`${post.nyckel}: ${butik.prefixfel}`);
  const hubId = post.notion?.database_id;
  if (!hubId) throw new Error(`${post.nyckel}: hubben är inte inskriven — \`node factory/register.mjs notion ${post.nyckel} <id>\``);
  const mapp = minnesmapp(post);
  logg(`Butik: ${post.brand} (${post.nyckel}) · prefix ${butik.prefix.join(' · ')} · annonsprefix ${post.annonsprefix || '?'} · minne ${mapp.replace(`${ROT}/`, '')}`);

  // 1. Hubben + alla rader.
  const hub = await hamtaHub(hubId);
  if (hub.in_trash) throw new Error(`hubben "${hub.titel}" (${hub.id}) ligger i papperskorgen — rätta registret.`);
  const alla = await allaRader(hub);
  logg(`Hubb: ${hub.titel} (${hub.id}) · ${alla.length} annonsrader`);

  // 2. Ronden.
  const valet = valjRond(alla, { rond, senasteBrief: post.senaste_brief || null });
  if (!valet.datum) throw new Error('hubben har inga annonsrader — ingen rond att granska.');
  logg(`Rond: ${valet.datum} (${valet.kalla}) · ${valet.rader.length} rader · dagar i hubben: ${Object.entries(valet.per_dag).sort().map(([d, n]) => `${d}×${n}`).join(', ')}`);
  // Utdatan hamnar i butikens utmapp med rondens datum i namnet — så skrivläget
  // hittar kön utan att någon behöver veta datumet i förväg.
  if (!ut) ut = join(utmapp(post), `briefgranskning-${valet.datum}`);
  const speglade = valet.rader.filter((r) => (tolkaNamn(r.namn).nummer ?? 0) >= SPEGEL_OFFSET);
  const egna = valet.rader.filter((r) => !speglade.includes(r));
  if (speglade.length) logg(`  ${speglade.length} speglad(e) rad(er) hoppas över (nummer ≥ ${SPEGEL_OFFSET}, /ops-spegla): ${speglade.map((r) => r.namn).join(', ')}`);
  const batch = hittaBatch(mapp, egna.map((r) => r.namn));
  if (batch) logg(`Batch: #${batch.batch} (${batch.traffar} av ${batch.antal} namn i ${batch.mapp.replace(`${ROT}/`, '')})`);
  else varningar.push('ingen batch-NN/manifest.json i minnet delar namn med ronden — batchnumret är okänt');
  const feedbackFil = join(mapp, 'feedback.md');
  const redanGranskad = existsSync(feedbackFil) && harSektion(readFileSync(feedbackFil, 'utf8'), valet.datum);
  if (redanGranskad) logg(`⚠️  Ronden ${valet.datum} har redan en sektion i ${feedbackFil.replace(`${ROT}/`, '')} — kör med --igen för att skriva om den.`);

  // 3. Butikens pris, live. Aldrig grönt utan pris.
  let pris_butik = null;
  let pris_skal = null;
  try {
    const handle = butik.produkt?.produkt?.handle || butik.produkt?.produkt?.id || post.id;
    const lank = marknadslank(butik.butik, { handle, kod: 'SE' });
    const p = await hamtaPris(lank, post.valuta ?? 'SEK');
    pris_butik = p.pris_butik; pris_skal = p.skal;
    if (pris_butik) logg(`Pris ur butiken: ${pris_butik.pris} ${pris_butik.valuta}${pris_butik.jamforpris ? ` · jämförpris ${pris_butik.jamforpris}` : ''} via ${pris_butik.kalla}`);
    else varningar.push(`pris: ${pris_skal} — prisraden i varje brief är okontrollerad`);
  } catch (e) { varningar.push(`pris: ${e.message}`); }

  // 4. dna.md → utdömda koncept.
  let doda = [];
  const dnaFil = join(mapp, 'dna.md');
  if (existsSync(dnaFil)) doda = dodaKoncept(readFileSync(dnaFil, 'utf8'));
  else varningar.push(`${dnaFil.replace(`${ROT}/`, '')} saknas — inga döda koncept kunde läsas`);
  if (doda.length) logg(`dna.md tar bort: ${doda.map((d) => d.koncept).join(', ')}`);

  // 5. Varje brief: texten ur Notion, mätningen.
  const doman = (() => { try { return domanUrButik(butik.butik); } catch { return null; } })();
  const butiksnamn = [post.brand, doman, doman ? doman.split('.')[0] : null].filter(Boolean);
  const ctx = {
    annonsprefix: post.annonsprefix || null, prefix: butik.prefix, tillhor: tillhorButiken,
    butiksnamn, pris_butik: pris_butik ? { pris: pris_butik.pris, jamforpris: pris_butik.jamforpris } : null,
    breakEvenCpa: butik.ekonomi?.breakEvenCpa ?? null, copyModell: post.copy_modell ?? null, doda_koncept: doda,
  };
  if (ut) mkdirSync(ut, { recursive: true });
  const rader = [];
  for (const r of egna) {
    let text = '';
    let fel_las = null;
    try { text = textUrBlock(await hamtaBlock(r.page_id)); }
    catch (e) { fel_las = e.message; }
    const g = fel_las ? { fel: [{ kod: 'notion', text: `the brief could not be read from Notion: ${fel_las}` }], anmarkningar: [], fakta: {} } : granskaBrief({ ...r, text }, ctx);
    let fil = null;
    if (ut && text) { fil = join(ut, `${r.namn.replace(/[^\w åäöÅÄÖ.-]/g, '_')}.md`); writeFileSync(fil, `${text}\n`); }
    rader.push({ ...r, tecken: text.length, fil, fel: g.fel, anmarkningar: g.anmarkningar, fakta: g.fakta });
    logg(`  ${domTecken[domFor(g)]} ${r.namn} [${r.typ}, ${r.status || 'ingen status'}] ${g.fel.length} fel · ${g.anmarkningar.length} anm`);
  }

  return {
    butik: post.brand, nyckel: post.nyckel, brand: post.brand, annonsprefix: post.annonsprefix || null,
    hub: { id: hub.id, titel: hub.titel, url: hub.url },
    rond: { datum: valet.datum, kalla: valet.kalla, batch: batch?.batch ?? null, batchmapp: batch ? batch.mapp.replace(`${ROT}/`, '') : null, per_dag: valet.per_dag },
    redan_granskad: redanGranskad, feedback_fil: feedbackFil.replace(`${ROT}/`, ''), minnesmapp: mapp.replace(`${ROT}/`, ''),
    redigerare: post.redigerare ? { namn: post.redigerare, discord_id: post.redigerare_discord_id ?? null } : null,
    pris_butik, pris_skal, break_even_cpa: ctx.breakEvenCpa, copy_modell: ctx.copyModell, butiksnamn, doda_koncept: doda,
    rader, speglade: speglade.map((r) => ({ namn: r.namn, page_id: r.page_id, skal: `speglad från Bäverbutiken (nummer ≥ ${SPEGEL_OFFSET}) — inte Nattvaktens brief` })),
    ut: ut.replace(`${ROT}/`, ''), varningar, stopp, idag: svenskDatum(), hamtad: new Date().toISOString(),
  };
}

/** Sessionens dom → feedback.md, kommentarer på rader med fel, Discord-jobb. */
export async function skrivGranskning({ ko, dom, idag, torr = false, logg = (...a) => console.error(...a) }) {
  const kontroll = giltigDom(dom, ko);
  if (!kontroll.ok) throw new Error(`dom.json håller inte:\n  - ${kontroll.fel.join('\n  - ')}`);
  const perNamn = new Map(ko.rader.map((r) => [r.namn.toLowerCase(), r]));
  const rader = dom.rader.map((r) => ({ ...perNamn.get(String(r.namn).toLowerCase()), namn: r.namn, fel: (r.fel ?? []).map(String), anmarkningar: (r.anmarkningar ?? []).map(String), bra: (r.bra ?? []).map(String) }));

  // 1. feedback.md — Nattvakten läser den i steg 0.
  const fil = join(ROT, ko.feedback_fil);
  const rubrik = `# Feedback på Nattvaktens briefer — ${ko.brand} (${ko.nyckel})\n\nSkrivs av \`/briefgranskning ${ko.nyckel}\` dagen efter varje briefrond (måndag + torsdag).\nNattvakten läser den senaste sektionen i steg 0 innan den skriver nästa rond.\nReglerna är kumulativa: en regel som bryts igen står kvar tills den hålls.\nInga påhittade siffror — allt kommer ur briefarna, butiken (läst live) och dna.md.`;
  const sektion_ = feedbackSektion({ ...dom, rader }, { idag, batch: ko.rond?.batch ?? null });
  const ny = laggInSektion(existsSync(fil) ? readFileSync(fil, 'utf8') : '', dom.rond, sektion_, { rubrik });
  if (torr) logg(`[--torr] skulle skriva sektionen "Rond ${dom.rond}" till ${ko.feedback_fil}`);
  else { mkdirSync(dirname(fil), { recursive: true }); writeFileSync(fil, ny); logg(`✓ ${ko.feedback_fil}: sektionen "Rond ${dom.rond}" skriven`); }

  // 2. Kommentar på varje rad med FEL — aldrig annars, aldrig statusbyte.
  const kommentarer = [];
  for (const r of rader) {
    if (!r.fel.length) continue;
    if (!r.page_id) { kommentarer.push({ namn: r.namn, utfall: 'fel', skal: 'page_id saknas i kön' }); continue; }
    const text = kommentarText(r, { datum: dom.rond, brand: ko.brand });
    if (serUtSomSvenska(text)) { kommentarer.push({ namn: r.namn, utfall: 'stoppad', skal: 'kommentaren ser svensk ut' }); continue; }
    const marke = `${KOMMENTARMARKE} ${dom.rond}`;
    if (torr) { kommentarer.push({ namn: r.namn, utfall: 'torr', text }); logg(`[--torr] kommentar på ${r.namn}:\n${text.split('\n').map((x) => `    ${x}`).join('\n')}`); continue; }
    if (await harKommentar(r.page_id, marke)) { kommentarer.push({ namn: r.namn, utfall: 'fanns' }); logg(`  ↷ ${r.namn}: kommentaren finns redan`); continue; }
    try { await kommentera(r.page_id, text); kommentarer.push({ namn: r.namn, utfall: 'skriven', text }); logg(`  ✓ ${r.namn}: kommentar skriven`); }
    catch (e) { kommentarer.push({ namn: r.namn, utfall: 'fel', skal: e.message }); logg(`  ❌ ${r.namn}: ${e.message}`); }
  }

  // 3. Discord-jobbet.
  const jobb = byggDiscordJobb({
    brand: ko.brand, datum: idag, rond: dom.rond, batch: ko.rond?.batch ?? null, hub_url: ko.hub?.url ?? null,
    rader, regler: dom.regler, varningar: [...(ko.varningar ?? []), ...kommentarer.filter((k) => k.utfall === 'fel' || k.utfall === 'stoppad').map((k) => `${k.namn}: comment not written — ${k.skal}`)],
    redigerare: ko.redigerare, feedbackFil: ko.feedback_fil, stopp: ko.stopp ?? [],
  });
  return { feedback_fil: ko.feedback_fil, sektion: sektion_, kommentarer, jobb };
}

// ------------------------------------------------------------ utskrift

export function tabell(ko) {
  const ut = [];
  ut.push(`=== Briefgranskning · ${ko.butik} (${ko.nyckel}) · rond ${ko.rond.datum}${ko.rond.batch ? ` · batch #${ko.rond.batch}` : ''} ===`);
  ut.push(`Hubb: ${ko.hub.titel} (${ko.hub.id}) · rond vald ur ${ko.rond.kalla}`);
  ut.push(`Pris ur butiken: ${ko.pris_butik ? `${ko.pris_butik.pris} ${ko.pris_butik.valuta}${ko.pris_butik.jamforpris ? ` · jämförpris ${ko.pris_butik.jamforpris}` : ''}` : `⚠️  okänt — ${ko.pris_skal}`} · break-even-CPA ${ko.break_even_cpa ?? '?'} kr · copy-modell ${ko.copy_modell ?? '?'}`);
  ut.push(`Butiksnamn som stoppar: ${ko.butiksnamn.join(', ')} + Bäver-familjen · dna.md tar bort: ${ko.doda_koncept.length ? ko.doda_koncept.map((d) => d.koncept).join(', ') : 'inget'}`);
  if (ko.redan_granskad) ut.push(`⚠️  Ronden är redan granskad i ${ko.feedback_fil} (--igen skriver om)`);
  ut.push('');
  if (!ko.rader.length) ut.push('Inga egna briefer i ronden.');
  for (const r of ko.rader) {
    ut.push(`${domTecken[domFor(r)]} ${r.namn}  [${r.typ}, ${r.status || 'ingen status'}]  ${r.tecken} tecken${r.fil ? `  → ${r.fil.replace(`${ROT}/`, '')}` : ''}`);
    for (const f of r.fel) ut.push(`    ❌ ${f.kod}: ${f.text}`);
    for (const a of r.anmarkningar) ut.push(`    ⚠️  ${a.kod}: ${a.text}`);
    ut.push(`    notion: ${r.url}`);
  }
  if (ko.speglade.length) { ut.push(''); ut.push(`Hoppade (${ko.speglade.length}): ${ko.speglade.map((s) => `${s.namn} — ${s.skal}`).join(' · ')}`); }
  ut.push('');
  const fel = ko.rader.filter((r) => r.fel.length).length;
  const anm = ko.rader.filter((r) => !r.fel.length && r.anmarkningar.length).length;
  ut.push(`${ko.rader.length} brief(er) · ${fel} med fel · ${anm} med anmärkning · ${ko.rader.length - fel - anm} rena (mätbart — sessionen dömer resten)`);
  if (ko.varningar.length) { ut.push(`\nVarningar (${ko.varningar.length}):`); for (const v of ko.varningar) ut.push(`  ⚠️  ${v}`); }
  return ut.join('\n');
}

// ------------------------------------------------------------ CLI

async function huvud() {
  const { säkerställProxy } = await import('./meta-lib.mjs');
  säkerställProxy();
  const args = process.argv.slice(2);
  const flagga = (n, s = null) => { const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : s; };
  const finns = (n) => args.includes(`--${n}`);
  const flaggvarden = new Set(['rond', 'ut', 'skriv', 'ko', 'idag'].map((n) => flagga(n)).filter(Boolean));
  const nyckel = args.find((a) => !a.startsWith('--') && !flaggvarden.has(a));
  const do_ = (m) => { console.error(`✗ ${m}`); process.exit(1); };
  if (!nyckel) do_('Ange <nyckel>. Exempel: node tools/briefgranskning.mjs carashell/takskyddet');
  if (!process.env.NOTION_TOKEN) do_('NOTION_TOKEN saknas i miljön — hubben går inte att läsa.');

  const skriv = flagga('skriv');
  if (!skriv) {
    const ko = await byggGranskningsko({ nyckel, rond: flagga('rond'), ut: flagga('ut') });
    if (ko.redan_granskad && !finns('igen')) ko.varningar.push(`ronden ${ko.rond.datum} är redan granskad (${ko.feedback_fil}) — kör med --igen om den ska skrivas om`);
    const koFil = join(ROT, `${ko.ut}.json`);
    mkdirSync(dirname(koFil), { recursive: true });
    writeFileSync(koFil, `${JSON.stringify(ko, null, 2)}\n`);
    console.error(`Kön skriven till ${ko.ut}.json`);
    if (finns('json')) console.log(JSON.stringify(ko, null, 2));
    else console.log(tabell(ko));
    return;
  }

  // Skrivläget.
  const dom = JSON.parse(readFileSync(resolve(skriv), 'utf8'));
  const { laddaButik, svenskDatum, utmapp } = await import('../factory/register.mjs');
  const post = laddaButik(nyckel).post;
  const koFil = flagga('ko') ?? join(utmapp(post), `briefgranskning-${dom.rond}.json`);
  if (!existsSync(koFil)) do_(`kön ${koFil} finns inte — kör läsläget med --ut först, eller peka med --ko.`);
  const ko = JSON.parse(readFileSync(koFil, 'utf8'));
  if (ko.nyckel !== post.nyckel) do_(`kön är för ${ko.nyckel}, inte ${post.nyckel}.`);
  const idag = flagga('idag') ?? svenskDatum();
  const torr = finns('torr');
  const res = await skrivGranskning({ ko, dom, idag, torr });
  const jobbFil = koFil.replace(/\.json$/, '') + '.discord.json';
  writeFileSync(jobbFil, `${JSON.stringify(res.jobb, null, 2)}\n`);
  const kort = jobbFil.replace(`${ROT}/`, '');
  console.log(`\n${res.sektion}`);
  console.log(`Kommentarer: ${res.kommentarer.map((k) => `${k.namn} ${k.utfall}`).join(' · ') || 'inga (inga fel)'}`);
  console.log(`Discord-jobb: ${kort} → node tools/discord-rapport.mjs --jobb ${kort}${torr ? ' --torr' : ''}`);
  if (torr) console.log('\n--torr: inget skrivet till Notion eller feedback.md.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
