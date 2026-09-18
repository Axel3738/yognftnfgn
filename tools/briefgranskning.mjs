#!/usr/bin/env node
// briefgranskning.mjs — creative director-granskningen av Bäverbutikens
// senaste briefrond, ALLA hubbar i ett svep (Axels beslut 2026-09-18, ombyggd
// samma dag från OPS-registret: OPS-projektet är nedlagt utom CaraShell, och
// CaraShells briefer skrivs i Bäverbutikens hubbar).
//
// Måndag + torsdag 07:00 svensk tid, EN rutin för hela Bäverbutiken.
//
//   node tools/briefgranskning.mjs [--rond YYYY-MM-DD] [--hub <id|del av titel>] [--maxdagar 10] [--igen] [--ut <mapp>] [--json]
//       LÄSER: hittar hubbarna dynamiskt (alla databaser integrationen ser, minus
//       OPS-hubbarna per id, minus andra verksamheters hubbar och mallen, minus
//       databaser utan brief-livscykel), väljer senaste ronden per hub, hoppar
//       ronder som redan har en Feedback-rad, hämtar varje briefs text, läser
//       priset live ur radens Landing page och kör mätningarna. Skriver kön till
//       tools/output/briefgranskning/<idag>/ko.json och varje brief som
//       <idag>/<hub>/<namn>.md. Rör ingenting i Notion.
//   node tools/briefgranskning.mjs --skriv <dom.json> [--torr] [--igen]
//       SKRIVER sessionens dom för EN hub: en ny rad med Typ "Feedback" och
//       titeln "Brief review <rond>" i hubben (engelska: bra / missat / tre regler
//       för nästa rond), en engelsk kommentar på varje granskad rad med ett FEL
//       (aldrig annars), och products/<id>/feedback.md när produkten har en
//       mapp. Ändrar ALDRIG en rads status. Skriver <idag>/<hub>.resultat.json.
//   node tools/briefgranskning.mjs --rapport [--torr] [--idag YYYY-MM-DD]
//       EN engelsk Discord-rapport för hela körningen (ko.json + *.resultat.json)
//       i Bäverbutikens server, kanalen #problem-and-revisions-ads — samma kanal
//       som /notionkorning använder för problem. Axel pingas bara när något
//       kräver honom.
//
// Arbetsdelningen: verktyget mäter det som går att mäta (namn, taggar, pris mot
// butiken läst live, butikens namn i annonstexten, tre-frågorstestets ❌,
// KPI mot target, dna.md:s utdömda koncept, IMAGE PROMPT, COPY CARD). Sessionen
// läser varje brief själv och dömer det som kräver omdöme — en hub i taget,
// aldrig blandat mellan produkter — och skriver domen i <hub>.dom.json. Det
// verktyget hittar är ett golv, aldrig hela domen.
//
// Regler (aldrig valfria):
//   • Läs bara. Ingen status ändras, ingen brief skapas, inget i Meta rörs.
//   • Kommentar på en rad BARA när briefen har ett fel redigeraren måste känna
//     till. Anmärkningar går till Feedback-raden, feedback.md och Discord.
//   • Hitta aldrig på siffror: priset läses live ur radens Landing page,
//     break-even bara ur products.json, dna.md citeras ordagrant.
//   • Engelska i allt som redigerarna läser: Feedback-raden, kommentarerna,
//     Discord. Rapporten till Axel i chatten är svensk.
//   • Hubblistan kommer ALDRIG ur minnet (CLAUDE.md: "Titelregeln är DÖD").
//     Nya produkter täcks av sig själva; en hub som inte hittas syns i
//     rapporten som "hubbar lästa: N".
//
// Kräver env NOTION_TOKEN (+ DISCORD_BOT_TOKEN för --rapport). Noll npm-beroenden.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { hittaHubbar } from './notion-kalla.mjs';
import { normaliseraId } from './lib/ops-hubbar.mjs';
import { tolkaNamn, annonsdel, typAv, hamtaPris } from './ops-leveranskon.mjs';
import { brandtraff, textUrBlock } from './ops-spegla.mjs';
import { hittaFält, lasManifest, tillBlock, delaBlock, landningUrBrief } from './notion-brief.mjs';
import { promptUrBrief } from '../factory/ops-bild.mjs';
import { serUtSomSvenska } from './lib/engelska.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOTION_API = 'https://api.notion.com/v1';
const TYP_RE = /pending approval/i;          // inkludering, aldrig uteslutning
/** Utdatan per körning: tools/output/briefgranskning/<idag>/ (brief-dumparna är gitignorerade). */
export const UTMAPP = 'tools/output/briefgranskning';
/** Typ-taggen på granskningsraden i hubben. Finns i alla creative hubs (mätt 2026-09-18). */
export const FEEDBACK_TYP = 'Feedback';
/** Titeln på granskningsraden — datumet är RONDENS, så en omkörning känner igen den. */
export const feedbackTitel = (rond) => `Brief review ${rond}`;
/** Statusen granskningsraden får om hubben har den (de befintliga Feedback-raderna står i Draft, mätt 2026-09-18). */
export const FEEDBACK_STATUS = 'Draft';
/** Ronder äldre än så här granskas inte utan --rond: feedbacken är till för NÄSTA rond, och en hub som slutat få briefer har ingen. */
export const MAXDAGAR = 10;
/** Discord-kanalen: samma som /notionkorning använder för problem (Axels beslut 2026-09-02). */
export const DISCORD_KANAL = 'problem-and-revisions-ads';

/** Taggarna varje brief ska bära (VARIABELTAGGAR-raden, ANALYSMETOD 6b + copy-A/B:t). */
export const KRAVDA_TAGGAR = Object.freeze(['vinkel', 'hook-typ', 'format', 'proof', 'offer-i-creativen', 'visuell stil', 'textmängd', 'talare', 'copy_model']);
const TAGGALIAS = { hook: 'hook-typ', hooktyp: 'hook-typ', offer: 'offer-i-creativen', 'offer i creativen': 'offer-i-creativen', textmangd: 'textmängd', 'visuell-stil': 'visuell stil', copymodel: 'copy_model', 'copy-model': 'copy_model', angle: 'vinkel', visual: 'visuell stil', text: 'textmängd', speaker: 'talare', 'copy model': 'copy_model' };
/** Veckodagar rutinen går (JS: 1 = måndag, 4 = torsdag). */
export const GRANSKNINGSDAGAR = Object.freeze([1, 4]);
/** Markören som gör kommentaren igenkännbar, så en omkörning aldrig skriver den två gånger. */
export const KOMMENTARMARKE = 'Brief review';
/** Butiksnamnen som aldrig får stå i en Bäverbutiks-annons (Bäver-familjen fångas dessutom av brandtraff). */
export const BAVER_NAMN = Object.freeze(['Bäverbutiken', 'baverbutiken.se', 'baverbutiken']);

/** Andra verksamheters hubbar och mallen — undantas på titel, som /oversatt gör
 *  (CLAUDE.md → Connectors). OPS-hubbarna undantas PER ID av notion-kalla.mjs. */
export const ANDRA_VERKSAMHETER = Object.freeze([/matstrumpor/i, /grillkliniken/i, /b[äa]verkoppling/i, /creative hub master/i, /\bMALL\b/]);

// ------------------------------------------------------------ ren logik
// Allt nedan är utan nät och testas i tools/test/briefgranskning.test.mjs.

const rad = (t) => String(t ?? '').replace(/\r\n?/g, '\n').split('\n');
const utanFet = (s) => String(s ?? '').replace(/\*\*/g, '').replace(/`/g, '');
const tal = (s) => {
  let x = String(s ?? '').trim();
  // Engelska tusentalskomman ("1,129 SEK" i English meaning-kolumnen) är samma tal som "1 129 kr".
  if (/^\d{1,3}(,\d{3})+$/.test(x)) x = x.replace(/,/g, '');
  const n = Number(x.replace(/[\s  .]/g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Är databasen en creative hub med brief-livscykel? Strukturellt, inte på
 * titel: Typ-fältet bär "… Pending Approval" OCH Status bär både "Draft" och
 * "To be Reviewed". Så faller "Product test center", "Customer support" och
 * SOP-databaser bort av sig själva (mätt 2026-09-18: Product test center SE
 * BÄVER har 45 rader med Typ Video - Pending Approval men statusarna Products/
 * Testing/Exit — det är produkter, inte briefer). Titeln avgör bara andra
 * verksamheter och mallen.
 */
export function arCreativeHub(schema = {}, titel = '') {
  // Skälen är engelska — de går rakt in i Discord-rapportens "Skipped"-lista.
  const t = String(titel ?? '');
  const andra = ANDRA_VERKSAMHETER.find((re) => re.test(t));
  if (andra) return { ok: false, skal: 'other business or the template (by title)' };
  const falt = hittaFält(schema);
  if (!falt.titel) return { ok: false, skal: 'no title field' };
  const alternativ = (namn) => (namn && schema[namn] ? (schema[namn][schema[namn].type]?.options ?? []).map((o) => String(o.name ?? '')) : []);
  const typer = alternativ(falt.typ);
  if (!typer.some((x) => TYP_RE.test(x))) return { ok: false, skal: falt.typ ? 'Typ has no "… Pending Approval" option' : 'no Typ field' };
  const statusar = alternativ(falt.status).map((x) => x.toLowerCase());
  if (!statusar.includes('draft') || !statusar.includes('to be reviewed')) return { ok: false, skal: 'Status lacks the brief lifecycle (Draft → To be Reviewed) — products or SOPs, not briefs' };
  return { ok: true, skal: null, falt, harFeedbackTyp: typer.some((x) => x.toLowerCase() === FEEDBACK_TYP.toLowerCase()) };
}

/** Filnamnsvänlig nyckel för en hub: ascii-titel + de åtta första tecknen i id:t
 *  (två hubbar delar titel "BÄVER Termoskyddet för Husbil", mätt 2026-09-18). */
export function hubbSlug(titel, id) {
  const ascii = String(titel ?? '').toLowerCase()
    .replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'hub';
  return `${ascii}-${normaliseraId(id).slice(0, 8)}`;
}

/** Hubbens annonsprefix = det vanligaste prefixet bland raderna (första fältet
 *  före "_"). Null när inget namn går att tolka. */
export function dominantPrefix(namn = []) {
  const antal = {};
  for (const n of namn) {
    const p = tolkaNamn(n).prefix;
    if (p) antal[p] = (antal[p] ?? 0) + 1;
  }
  const bast = Object.entries(antal).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  return bast ? { prefix: bast[0], antal: bast[1], av: namn.length } : null;
}

/** Bär annonsnamnet prefixet, med ordgräns ("_" efter prefixet)? Skiftlägesokänsligt. */
export function harPrefix(namn, prefix) {
  const n = String(annonsdel(namn) ?? '').toLowerCase();
  const p = String(prefix ?? '').replace(/_$/, '').toLowerCase();
  if (!n || !p) return false;
  return n === p || n.startsWith(`${p}_`);
}

/**
 * Hub → produktminne. Tre källor, aldrig en gissning:
 *   1. products.json: notion.database_id är hubben
 *   2. register.json: en OPS-post speglas ur hubben (spegling.kalla_hub) — CaraShell
 *   3. products.json: creative_prefix är hubbens annonsprefix
 * Returnerar { id, kalla, minne, break_even_cpa, creative_prefix } eller null.
 * `finnsMinne(id)` säger om products/<id>/dna.md finns.
 */
export function produktFor(hubId, prefix, { products = [], register = {}, finnsMinne = () => false } = {}) {
  const id = normaliseraId(hubId);
  const tillPost = (p, kalla) => ({ id: p.id, kalla, minne: finnsMinne(p.id) ? `products/${p.id}` : null, break_even_cpa: Number.isFinite(Number(p.break_even_cpa_sek)) ? Number(p.break_even_cpa_sek) : null, creative_prefix: p.creative_prefix ?? null });
  const viaHub = products.find((p) => p.notion?.database_id && normaliseraId(p.notion.database_id) === id);
  if (viaHub) return tillPost(viaHub, 'products.json (notion.database_id)');
  for (const [nyckel, post] of Object.entries(register?.poster ?? {})) {
    if (post?.spegling?.kalla_hub && normaliseraId(post.spegling.kalla_hub) === id) {
      return { id: nyckel, kalla: 'register.json (spegling.kalla_hub)', minne: finnsMinne(nyckel) ? `products/${nyckel}` : null, break_even_cpa: null, creative_prefix: null };
    }
  }
  const p = String(prefix ?? '').replace(/_$/, '').toLowerCase();
  if (p) {
    const viaPrefix = products.find((x) => x.creative_prefix && String(x.creative_prefix).replace(/_$/, '').toLowerCase() === p);
    if (viaPrefix) return tillPost(viaPrefix, 'products.json (creative_prefix)');
  }
  return null;
}

/** Butiksnamnen som stoppar i den här hubben: Bäverbutiken alltid, och
 *  speglas hubben till en OPS-butik även DEN butikens namn och domäner
 *  (annonsen går live i båda butikerna — "CaraShell" i copyn är lika fel). */
export function butiksnamnFor(hubId, register = {}) {
  const id = normaliseraId(hubId);
  const ut = [...BAVER_NAMN];
  for (const [nyckel, post] of Object.entries(register?.poster ?? {})) {
    if (!post?.spegling?.kalla_hub || normaliseraId(post.spegling.kalla_hub) !== id) continue;
    const butik = String(nyckel).split('/')[0];
    const brand = String(post.spegling.status_se ?? '').trim().split(/\s+/)[0];
    for (const n of [brand, butik, `${butik}.se`, `${butik}.com`]) if (n && !ut.some((x) => x.toLowerCase() === n.toLowerCase())) ut.push(n);
  }
  return ut;
}

/** Är raden en rubrik — markdown (#) eller Notion-dump (numrerad eller känd rubriktext)?
 *  Bäverbutikens briefer (mätt 2026-09-18) skriver huvudet som nyckel–värde-rader
 *  ("Make: …", "Format: Static 4:5", "Why: …") och rubrikerna nakna ("Hook",
 *  "Three-question test — every Swedish line", "Script / shot list", "Rules").
 *  En nyckel–värde-rad eller en tabellrad är aldrig en rubrik. */
export function arRubrik(r) {
  const s = utanFet(r).trim();
  if (/^#{1,6}\s/.test(s)) return true;
  if (/\|/.test(s)) return false;                       // tabellrad ("Format | 9:16")
  if (/^[^:]{1,40}:\s*\S/.test(s)) return false;        // nyckel–värde ("Format: Static 4:5")
  return /^(\d+[.)]\s+)?(why this ad exists|hypothesis|hypotes|format|exact text|design brief|shot list|copy card|three-question test|kpi|hard rules|rules|image prompt|script|manus|hook)\b/i.test(s);
}

/** "Why: …"-raden i Bäverbutikens briefhuvud — rationalen och hypotesen i en rad. '' om den saknas. */
export function whyRad(text) {
  const m = /^\s*(?:\*\*)?why(?:\*\*)?\s*:\s*(.+)$/im.exec(String(text ?? ''));
  return m ? utanFet(m[1]).trim() : '';
}

/** Regelsektionen: "Hard rules" (OPS-mallen) eller "Rules" (Bäverbutikens briefer). */
export const reglerSektion = (text) => sektion(text, /\brules\b/i);

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

/** VARIABELTAGGAR-raden (OPS-mallen) eller "Variables:"-raden (Bäverbutikens
 *  briefer, engelska nycklar: angle=… · hook=… · visual=… · text=…) →
 *  { rad, taggar: {nyckel: värde}, saknade: [] } eller null. */
export function taggarUr(text) {
  const r = rad(text).find((x) => /VARIABELTAGGAR\s*:/i.test(x)) ?? rad(text).find((x) => /^\s*(?:\*\*)?variables(?:\*\*)?\s*:/i.test(x));
  if (!r) return null;
  const rest = utanFet(r).replace(/^.*?(?:VARIABELTAGGAR|variables)\s*:\s*/i, '');
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
 *  Annonsnamn (Takoverdrag_SP_5_1) räknas inte — ordgränsen ser till det. */
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
  const kallor = [utanFet(reglerSektion(text)), hela].filter(Boolean);
  const forsta = (re) => { for (const k of kallor) { const m = re.exec(k); if (m) return tal(m[1]); } return null; };
  const pris = forsta(/\bpri(?:ce|s)\s*(?:exactly|exakt)?\s*:?\s*(\d[\d\s  .]*\d|\d)\s*(?:kr|sek)\b/i)
    ?? forsta(/(\d[\d\s  .]*\d|\d)\s*kr\s*\(\s*ord\.?\s*\d/i);
  const jamforpris = forsta(/(?:compare-?at|ord\.?|jämförpris|jamforpris|ordinarie)\s*(?:price)?\s*:?\s*\(?\s*(\d[\d\s  .]*\d|\d)\s*(?:kr|sek)\b/i);
  return { pris, jamforpris };
}

/** Alla kronbelopp i en text, som tal. "1 129 kr", "1129 kr" och "1,129 SEK"
 *  (English meaning-kolumnen) är samma belopp — mätt 2026-09-18: utan kommat
 *  lästes "1,129 SEK" som 129 kr och 24 briefer fick en falsk prisanmärkning. */
export function kronorI(text) {
  const ut = [];
  for (const m of String(text ?? '').matchAll(/(\d[\d\s  .,]*\d|\d)\s*(?:kr|kronor|sek)\b/gi)) {
    const n = tal(m[1]);
    if (n) ut.push(n);
  }
  return [...new Set(ut)];
}

/**
 * Tre-frågorstestet: finns tabellen, och vilka rader föll?
 * Två tabellformer finns i hubbarna (mätt 2026-09-18):
 *   OPS-mallen:   Line | Visualise? | Falsifiable? | Only we can say it?   — ❌ i en cell = föll
 *   Bäverbutiken: Line | Visualize? | Falsifiable? | Competitor-signable? | Verdict
 *                 — i "Competitor-signable?" är ❌ det RÄTTA svaret (konkurrenten kan
 *                 inte skriva under), ✅ = föll; Verdict "Kill"/"Rewrite" = föll.
 * Kolumnrubriken avgör alltså vad ett kryss betyder.
 */
export function trefragorUr(text) {
  const rader = rad(text);
  const start = rader.findIndex((r) => /visuali[sz]/i.test(r) && /falsif/i.test(r) && /\|/.test(r));
  if (start === -1) return { finns: false, underkanda: [] };
  const celler = (s) => utanFet(s).replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const rubriker = celler(rader[start]).map((c) => c.toLowerCase());
  const underkanda = [];
  for (const r of rader.slice(start + 1)) {
    const s = r.trim();
    if (!s || arRubrik(s) || !/\|/.test(s)) break;
    if (/^\|?\s*:?-{3,}/.test(s)) continue;
    const c = celler(s);
    let foll = false;
    for (let i = 1; i < c.length; i++) {
      const rubrik = rubriker[i] ?? '';
      if (/sign/.test(rubrik)) foll ||= /✅|\byes\b|\bja\b/i.test(c[i]);
      else if (/verdict|dom\b/.test(rubrik)) foll ||= /❌|\bkill\b|\brewrite\b|skriv om/i.test(c[i]);
      else foll ||= /❌/.test(c[i]);
    }
    if (foll) underkanda.push(c[0]);
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

/** Nämner briefens huvud (raderna före första rubriken, "Why this ad exists"
 *  och "Why:"-raden) en källa — playbook, winning line, swipe, egen data
 *  (mätning, CPA, köp, en bevisad struktur), backlog, förälder — eller är
 *  den märkt gissning? */
export function kallaUr(text) {
  const rader = rad(text);
  const forstaRubrik = rader.findIndex((r, i) => i > 0 && arRubrik(r));
  // Taggraden beskriver annonsen (proof=16 omdömen), inte var idén kommer ifrån.
  const huvud = rader.slice(0, forstaRubrik === -1 ? rader.length : forstaRubrik).filter((r) => !/^\s*(?:\*\*)?(?:VARIABELTAGGAR|variables)(?:\*\*)?\s*:/i.test(r)).join('\n') + '\n' + sektion(text, /why this ad exists|varför/i) + '\n' + whyRad(text);
  const t = utanFet(huvud);
  const gissning = /\b(guess|gissning)\b/i.test(t);
  // "köp" ensamt räknas inte ("30 dagars öppet köp" är villkor, inte data) — men "12 köp" gör det.
  const kalla = /\b(backlog|playbook|winning|winner|proven|held for|readings?|swipe|inherited|ärvd|source|källa|measured|mätt|data|dna\.md|product file|produktfil|parent|förälder|purchases|\d+\s*köp|cpa|roas|spend|batch\s*#?\d|the account|omdömen?|recensioner?|voc)\b/i.test(t);
  return { kalla, gissning };
}

/** Hypotesen: "Hypothesis"-sektionen (OPS-mallen) eller "Why:"-raden (Bäverbutiken). */
export function hypotesUr(text) {
  const sekt = sektion(text, /hypothes|hypotes/i).split('\n').filter((l) => !/^\**\s*hook idea/i.test(l)).join('\n').trim();
  return sekt || whyRad(text);
}

/** Break-even-CPA som KPI:n dömer mot, och om den dömer mot target (förbjudet).
 *  `finns` = briefen har en KPI-sektion alls (Bäverbutikens briefer har ingen). */
export function kpiUr(text) {
  const sekt = sektion(text, /\bkpi\b/i);
  const t = utanFet(sekt || text);
  const be = /break-?even\s*(?:cpa)?\s*(?:of|på)?\s*:?\s*(\d[\d\s  .]*\d|\d)\s*kr/i.exec(t);
  const motTarget = /judged against\s+(?:the\s+)?target|mot target|against target-cpa/i.test(t) && !/never against target/i.test(t);
  return { finns: Boolean(sekt), breakEvenCpa: be ? tal(be[1]) : null, motTarget };
}

/** Argumenterar hypotesen på ROAS ensamt (ANALYSMETOD: enmetriks-domar är förbjudna)? */
export function roasEnsamt(text) {
  const t = `${sektion(text, /why this ad exists|varför/i)}\n${sektion(text, /hypothes|hypotes/i)}\n${whyRad(text)}`;
  return /\bROAS\b/.test(t) && !/\bCPA\b|profit contribution|vinstbidrag|purchases|köp\b/i.test(t);
}

/**
 * Domen per brief — det mätbara. Ren funktion.
 * rad: { namn, typ ('video'|'bild'), typ_notion, status, text }
 * ctx: { prefix (hubbens annonsprefix) , creative_prefix (products.json, valfritt),
 *        butiksnamn: [...], pris_butik: {pris, jamforpris} | null, breakEvenCpa,
 *        copyModell, doda_koncept: [{koncept, citat}] }
 * Returnerar { fel: [{kod, text}], anmarkningar: [{kod, text}], fakta }.
 *
 * FEL = något REDIGERAREN måste veta innan hon producerar (blir kommentar på
 * raden): fel namn/typ, butikens namn i annonstexten, fel pris mot butiken, en
 * rad som föll i tre-frågorstestet, video utan manus, bild utan textrader.
 * ANMÄRKNING = något BRIEFSKRIVAREN ska göra bättre nästa rond (blir Feedback-
 * raden, feedback.md och Discord): taggar, hypotes, källa, en variabel, KPI,
 * COPY CARD, regelraden om butiksnamnet. Kalibrerat 2026-09-18 mot 78 riktiga
 * Bäver-briefer: med OPS-mallens krav som fel fick alla 78 fyra–sex fel, och
 * redigerarna hade fått 78 kommentarer om saker de inte kan påverka.
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

  // 1. Namnet (docs/naming-convention.md: <prefix>_<KONCEPT>_<nr>[_<variant>]).
  const prefix = String(ctx.creative_prefix ?? ctx.prefix ?? '').replace(/_$/, '');
  if (prefix && !harPrefix(namn, prefix)) F('namn', `name "${namn}" does not carry the hub's ad prefix (${prefix}) — the delivery run cannot map it to a campaign`);
  else if (prefix && namn.toLowerCase().startsWith(prefix.toLowerCase()) && !namn.startsWith(prefix)) A('namn', `prefix is spelled "${namn.slice(0, prefix.length)}", the hub's is "${prefix}" — same ad, different casing; keep it exact`);
  if (!t.koncept) F('namn', `name "${namn}" has no concept code (<prefix>_<CONCEPT>_<n>[_<variant>])`);
  if (t.nummer == null) F('namn', `name "${namn}" has no number`);
  const namnVideo = /^H\d+/i.test(String(t.variant ?? ''));
  if (typ === 'bild' && namnVideo) F('typ', `Typ says image but the name's variant "${t.variant}" says video (H-variant)`);
  if (typ === 'video' && t.variant && !namnVideo) F('typ', `Typ says video but the name's variant "${t.variant}" is an image variant (videos are _H1, _H2 …)`);

  // 2. Variabeltaggarna (VARIABELTAGGAR eller Variables:) — utan dem kan
  //    feedback-loopen inte gruppera vinstbidrag per variabel. Skrivarens sak.
  const taggar = taggarUr(text);
  if (!taggar) A('taggar', 'no variable tags line (VARIABELTAGGAR / Variables: angle · hook · format · proof · offer · visual · text · speaker) — the next /cs run cannot group this ad by variable');
  else if (taggar.saknade.length) {
    const saknarCopy = taggar.saknade.includes('copy_model');
    const ovriga = taggar.saknade.filter((k) => k !== 'copy_model');
    if (ovriga.length) A('taggar', `variable tags missing: ${ovriga.join(', ')}`);
    if (saknarCopy && ctx.copyModell === 'ab') A('taggar', 'variable tags have no copy_model — the Fable/Sonnet A/B test cannot count this ad');
  }

  // 3. Hypotes, förälder/källa, EN variabel — skrivarens sak.
  const hypotes = hypotesUr(text);
  if (hypotes.replace(/\s+/g, ' ').trim().length < 20) A('hypotes', 'no hypothesis ("Why:" line or Hypothesis section) — nothing to read the outcome against');
  if (roasEnsamt(text)) A('hypotes', 'the rationale argues on ROAS alone — rank on profit contribution (break-even-CPA − CPA) × purchases (ANALYSMETOD)');
  const variant = arVariant(text);
  if (variant) {
    const iso = isoleradVariabel(text);
    if (!iso) A('variabel', 'variant of a parent ad without an "Isolated variable:" line — say the one thing that changed');
    else if (/\s(\+|and|och)\s|,/i.test(iso.replace(/\([^)]*\)/g, ''))) A('variabel', `"Isolated variable: ${iso}" may name more than one variable — a variant changes exactly one thing`);
  } else {
    const k = kallaUr(text);
    if (!k.kalla && !k.gissning) A('kalla', 'new concept with no source named (playbook, winning line, swipe, own data, a parent ad or the backlog) and not marked as a guess');
  }

  // 4. Butikens namn i annonstexten (Axels beslut 2026-09-18) — redigeraren måste veta.
  const annons = annonstextUr(text);
  const traffar = namntraff(annons, ctx.butiksnamn ?? BAVER_NAMN);
  if (traffar.length) F('butiksnamn', `the ad text names the store (${traffar.join(', ')}) — never in copy, on the image, in voice-over or captions (rule since 2026-09-18; ads are mirrored between stores)`);
  if (!/never name the store|never names? the store|store'?s name|store name|butikens namn/i.test(utanFet(reglerSektion(text)))) A('hardrules', 'the Rules section does not carry "the ad never names the store" (rule since 2026-09-18)');

  // 5. Priset — briefens mot butikens, läst live ur radens Landing page.
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

  // 8. Formatet: textraderna (Swedish (use this)) är det redigeraren bygger på —
  //    bild utan dem går live som ett rent foto, video utan dem har inget manus.
  //    IMAGE PROMPT är OPS-mallens block; Bäverbutikens /bildannonser bygger
  //    prompten ur briefen själv, så ett saknat block är inget fel — bara ett
  //    trasigt.
  let prompt = null;
  try { prompt = promptUrBrief(text); } catch (e) { F('bild', `IMAGE PROMPT unreadable: ${e.message}`); }
  const harTextTabell = /swedish\s*\(use this\)/i.test(text);
  if (typ === 'bild') {
    if (!harTextTabell) F('bild', 'image brief without the text table (Swedish (use this) | English meaning) — the editor has no lines to put on the image');
  } else {
    if (!harTextTabell) F('video', 'video brief without the script table (Swedish (use this) | English meaning)');
    if (!/caption/i.test(text)) A('video', 'no caption column or caption rule (max 2 lines) in the brief');
  }

  // 9. COPY CARD + KPI — skrivarens sak.
  if (!/copy card/i.test(text) || !/primary text/i.test(text) || !/headline/i.test(text)) A('copy', 'no COPY CARD (primary text + headline + description) — the ad copy in Ads Manager is not specified by the brief');
  const kpi = kpiUr(text);
  if (kpi.motTarget) A('kpi', 'KPI judges against target — kill decisions are measured against break-even only (ANALYSMETOD step 3)');
  if (kpi.finns && kpi.breakEvenCpa == null) A('kpi', 'KPI names no break-even CPA');
  else if (kpi.breakEvenCpa != null && ctx.breakEvenCpa && Math.abs(kpi.breakEvenCpa - Math.round(ctx.breakEvenCpa)) > 1) A('kpi', `KPI says break-even CPA ${kpi.breakEvenCpa} kr, products.json says ${Math.round(ctx.breakEvenCpa)} kr`);

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

/** Dagar mellan två YYYY-MM-DD (b − a). Null om något inte går att läsa. */
export function dagarMellan(a, b) {
  const x = new Date(`${a}T12:00:00Z`);
  const y = new Date(`${b}T12:00:00Z`);
  if (Number.isNaN(x.getTime()) || Number.isNaN(y.getTime())) return null;
  return Math.round((y - x) / 86400000);
}

/**
 * Vilken rond som granskas i en hub. Ren.
 * rader: [{ namn, skapad_dag }]. --rond vinner; annars hubbens nyaste dag.
 * `for_gammal` = ronden är äldre än maxdagar (utan --rond) — feedback till
 * nästa rond har inget värde när hubben slutat få briefer.
 */
export function valjRond(rader, { rond = null, idag = null, maxdagar = MAXDAGAR } = {}) {
  const perDag = {};
  for (const r of rader) if (r.skapad_dag) perDag[r.skapad_dag] = (perDag[r.skapad_dag] ?? 0) + 1;
  const dagar = Object.keys(perDag).sort();
  let datum = null;
  let kalla = null;
  if (rond) { datum = rond; kalla = '--rond'; }
  else if (dagar.length) { datum = dagar.at(-1); kalla = 'hubbens nyaste dag'; }
  const alder = datum && idag ? dagarMellan(datum, idag) : null;
  const forGammal = !rond && alder != null && maxdagar != null && alder > maxdagar;
  return { datum, kalla, rader: rader.filter((r) => r.skapad_dag === datum), per_dag: perDag, alder, for_gammal: forGammal };
}

/** Är ronden redan granskad? En Feedback-rad i hubben vars titel bär rondens datum. */
export function redanGranskad(feedbackRader = [], rond) {
  const d = String(rond ?? '');
  if (!d) return null;
  return feedbackRader.find((f) => String(f.titel ?? '').includes(d)) ?? null;
}

/** Batchnumret ur products/<id>/batch-NN/manifest.json — den batch som delar flest namn. */
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

/** Sessionens dom mot hubbens kö: allt måste stämma innan något skrivs. */
export function giltigDom(dom, ko) {
  const fel = [];
  if (!dom || typeof dom !== 'object') return { ok: false, fel: ['dom.json är inte ett objekt'] };
  if (!dom.hub_id) fel.push('dom.hub_id saknas');
  else if (ko?.hub?.id && normaliseraId(dom.hub_id) !== normaliseraId(ko.hub.id)) fel.push(`dom.hub_id ${dom.hub_id} ≠ köns hub ${ko.hub.id}`);
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
        ? `${namn}: "${s.slice(0, 60)}…" ser svenskt ut — kommentarer, Feedback-raden och Discord är på engelska`
        : `${namn}: "${s.slice(0, 60)}…" citerar svenska annonsrader med citattecken — sätt dem i backticks (\`…\`) så Discords engelskspärr släpper raden`);
    }
  }
  if (kanda.size) for (const n of kanda.keys()) if (!rader.some((r) => String(r?.namn ?? '').toLowerCase() === n)) fel.push(`"${kanda.get(n).namn}" i kön saknar en dom`);
  for (const f of ['bra', 'missat']) {
    if (dom[f] !== undefined && !Array.isArray(dom[f])) fel.push(`${f} ska vara en lista`);
    for (const x of Array.isArray(dom[f]) ? dom[f] : []) if (serUtSomSvenska(String(x).replace(/`[^`]*`/g, ' '))) fel.push(`${f}: "${String(x).slice(0, 60)}…" ser svenskt ut — Feedback-raden är på engelska`);
  }
  for (const [i, r] of regler.entries()) if (serUtSomSvenska(r.replace(/`[^`]*`/g, ' '))) fel.push(`regel ${i + 1} ser svensk ut — reglerna läses av redigerarna och nästa briefskrivare på engelska`);
  return { ok: fel.length === 0, fel };
}

/** Kommentaren på en rad med fel. Engelska, med markören först. */
export function kommentarText(r, { datum, hub }) {
  const punkter = (r.fel ?? []).map((x, i) => `${i + 1}. ${x}`).join('\n');
  return `${KOMMENTARMARKE} ${datum}${hub ? ` (${hub})` : ''} — this brief has ${r.fel.length === 1 ? 'an error' : `${r.fel.length} errors`} the editor must know about:\n${punkter}\nFix before production. If the ad is already live, apply it to the next version — nothing is paused. Status unchanged.`.slice(0, 2000);
}

/** Sektionen i feedback.md för en rond. Ren, markdown (svensk rubrik, engelska rader). */
export function feedbackSektion(dom, { idag, batch = null, antal = null, hub = null }) {
  const rader = dom.rader ?? [];
  const n = antal ?? rader.length;
  const ut = [];
  ut.push(`## Rond ${dom.rond} — ${batch ? `batch #${batch}` : 'batch okänd'} (${n} brief${n === 1 ? '' : 'er'}) · granskad ${idag}${hub ? ` · hub ${hub}` : ''}`);
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

/**
 * Feedback-raden i hubben, som markdown (→ tillBlock). Engelska: redigerarna
 * och nästa briefskrivare (Skalnings kungen, Nattvakten) läser den.
 * Radernas dom står i en tabell sist; tabellen kapas vid 100 rader (Notions tak).
 */
export function feedbackRadMarkdown(dom, { idag, hubTitel = '', antal = null } = {}) {
  const rader = dom.rader ?? [];
  const n = antal ?? rader.length;
  const medFel = rader.filter((r) => r.fel?.length).length;
  const medAnm = rader.filter((r) => !r.fel?.length && r.anmarkningar?.length).length;
  const ut = [];
  ut.push(`# ${feedbackTitel(dom.rond)}${hubTitel ? ` — ${hubTitel}` : ''}`);
  ut.push('');
  ut.push(`Reviewed ${idag} by the brief review (/briefgranskning): ${n} brief${n === 1 ? '' : 's'} created ${dom.rond} — ${n - medFel - medAnm} clean, ${medAnm} with notes, ${medFel} with errors. Errors are also a comment on the brief's own row. No status was changed; a live ad is never paused for this — a finding goes into the next version.`);
  ut.push('');
  const lista = (rubrik, punkter, tom) => {
    ut.push(`## ${rubrik}`);
    if (punkter.length) for (const p of punkter) ut.push(`- ${p}`);
    else ut.push(`- ${tom}`);
    ut.push('');
  };
  lista('What the round got right', (dom.bra ?? []).map(String), 'nothing to single out');
  lista('What it missed', (dom.missat ?? []).map(String), 'nothing');
  ut.push('## Three rules for the next round');
  ut.push('Read these before writing the next briefs in this hub. A rule that is broken again stays until it holds.');
  (dom.regler ?? []).forEach((r, i) => ut.push(`${i + 1}. ${r}`));
  ut.push('');
  ut.push('## Verdict per brief');
  ut.push('| Brief | Verdict | Errors | Notes |');
  ut.push('|---|---|---|---|');
  for (const r of rader.slice(0, 99)) {
    const dom_ = domFor(r);
    const cell = (l) => (l ?? []).map((x) => String(x).replace(/\|/g, '/')).join(' · ') || '—';
    ut.push(`| ${r.namn} | ${domTecken[dom_]} | ${cell(r.fel)} | ${cell(r.anmarkningar)} |`);
  }
  if (rader.length > 99) ut.push(`| … | | +${rader.length - 99} more in feedback.md | |`);
  ut.push('');
  return ut.join('\n');
}

/** Egenskaperna för Feedback-raden efter hubbens schema. Ren.
 *  Typ Feedback (select/multi_select), Status Draft om hubben har den, Skapad = idag. */
export function feedbackEgenskaper(schema, { rond, idag }) {
  const falt = hittaFält(schema);
  const varningar = [];
  const alternativ = (namn) => (namn && schema[namn] ? (schema[namn][schema[namn].type]?.options ?? []).map((o) => String(o.name ?? '')) : []);
  if (!falt.titel) throw new Error('hubben har inget titelfält');
  const properties = { [falt.titel]: { title: [{ type: 'text', text: { content: feedbackTitel(rond) } }] } };
  if (!falt.typ) varningar.push('hubben har inget Typ-fält — raden skapas utan Typ Feedback');
  else {
    if (!alternativ(falt.typ).some((x) => x.toLowerCase() === FEEDBACK_TYP.toLowerCase())) varningar.push(`Typ saknar alternativet "${FEEDBACK_TYP}" — Notion skapar det`);
    properties[falt.typ] = schema[falt.typ].type === 'multi_select' ? { multi_select: [{ name: FEEDBACK_TYP }] } : { select: { name: FEEDBACK_TYP } };
  }
  if (falt.status) {
    const val = alternativ(falt.status);
    const status = val.find((x) => x.toLowerCase() === FEEDBACK_STATUS.toLowerCase());
    if (status) properties[falt.status] = schema[falt.status].type === 'status' ? { status: { name: status } } : { select: { name: status } };
    else varningar.push(`Status saknar "${FEEDBACK_STATUS}" — raden får hubbens standardstatus`);
  }
  if (falt.skapad && idag) properties[falt.skapad] = { date: { start: idag } };
  return { properties, varningar, falt };
}

/**
 * Discord-rapporten för hela körningen. Ren, engelska. En hub per rad.
 * korning: { idag, hubbar: [{ titel, laget: 'granskad'|'hoppad'|'olasbar'|'ej_domd', skal, rond, antal, rena, anm, fel, kommentarer, feedback_rad, feedback_fil }], varningar, stopp }
 * Returnerar { text, ping_axel }.
 */
export function byggRapport(korning) {
  const hubbar = korning.hubbar ?? [];
  const granskade = hubbar.filter((h) => h.laget === 'granskad');
  const hoppade = hubbar.filter((h) => h.laget === 'hoppad');
  const olasbara = hubbar.filter((h) => h.laget === 'olasbar');
  const ejDomda = hubbar.filter((h) => h.laget === 'ej_domd');
  const b = (s) => `\`${String(s ?? '').replace(/`/g, "'")}\``;
  const ut = [];
  ut.push(`🔎 BÄVERBUTIKEN brief review — ${korning.idag}`);
  ut.push(`Hubs found: ${hubbar.length} · reviewed: ${granskade.length} · skipped: ${hoppade.length}${olasbara.length ? ` · unreadable: ${olasbara.length}` : ''}${ejDomda.length ? ` · NOT judged: ${ejDomda.length}` : ''}`);
  if (granskade.length) {
    ut.push('', '**Reviewed**');
    for (const h of granskade) {
      const delar = [`round ${h.rond}, ${h.antal} brief${h.antal === 1 ? '' : 's'}: ${h.rena} clean · ${h.anm} with notes · ${h.fel} with errors`];
      delar.push(h.feedback_rad ? `Feedback row ${b(feedbackTitel(h.rond))}` : 'no Feedback row written');
      if (h.kommentarer) delar.push(`${h.kommentarer} comment${h.kommentarer === 1 ? '' : 's'} on rows`);
      if (h.feedback_fil) delar.push(`rules in ${h.feedback_fil}`);
      ut.push(`• ${b(h.titel)} — ${delar.join(' · ')}`);
    }
  }
  if (ejDomda.length) {
    ut.push('', '**⚠️ Rounds read but not judged (no dom.json written)**');
    for (const h of ejDomda) ut.push(`• ${b(h.titel)} — round ${h.rond}, ${h.antal} briefs`);
  }
  if (hoppade.length) {
    ut.push('', '**Skipped**');
    for (const h of hoppade.slice(0, 10)) ut.push(`• ${b(h.titel)} — ${h.skal}`);
    if (hoppade.length > 10) ut.push(`+${hoppade.length - 10} more`);
  }
  if (olasbara.length) {
    ut.push('', '**Unreadable**');
    for (const h of olasbara.slice(0, 6)) ut.push(`• ${b(h.titel)} — ${h.skal}`);
    if (olasbara.length > 6) ut.push(`+${olasbara.length - 6} more`);
  }
  const varningar = (korning.varningar ?? []).map(String);
  if (varningar.length) {
    ut.push('', '**⚠️ Warnings**');
    for (const v of varningar.slice(0, 8)) ut.push(`• ${v}`);
    if (varningar.length > 8) ut.push(`+${varningar.length - 8} more`);
  }
  const stopp = (korning.stopp ?? []).map(String);
  const nasta = nastaGranskning(korning.idag);
  ut.push('');
  if (stopp.length) {
    ut.push('**🔴 ACTION NEEDED — Axel:**');
    stopp.forEach((s, i) => ut.push(`${i + 1}. ${s}`));
    if (nasta) ut.push(`Next run: ${nasta}`);
  } else {
    ut.push(`✅ Nothing for you to do.${nasta ? ` Next run: ${nasta}` : ''}`);
  }
  return { text: ut.join('\n'), ping_axel: stopp.length > 0 };
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
    const e = new Error(res.status === 404
      ? `Notion 404 på ${sokvag} — integrationen är inte inbjuden (••• → Connections), databasen är arkiverad, eller sidan ligger i papperskorgen.`
      : `Notion ${res.status}: ${json.message || res.statusText}`);
    e.status = res.status;
    throw e;
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

/** Annonsraderna (Typ ~ pending approval, alla statusar) och Feedback-raderna i hubben. */
async function allaRader(hub) {
  const annonser = [];
  const feedback = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const r = await notion(`databases/${ren(hub.id)}/query`, { method: 'POST', body });
    for (const s of r.results ?? []) {
      if (s.archived) continue;
      const p = s.properties ?? {};
      const typ = hub.falt.typ ? varde(p[hub.falt.typ]) : '';
      const titel = hub.falt.titel ? varde(p[hub.falt.titel]) : '';
      if (typ.trim().toLowerCase() === FEEDBACK_TYP.toLowerCase()) { feedback.push({ page_id: s.id, titel, url: s.url, skapad: s.created_time }); continue; }
      if (!TYP_RE.test(typ)) continue;
      if (!titel || /^Skärmavbild/i.test(titel)) continue;
      const skapadProp = hub.falt.skapad ? varde(p[hub.falt.skapad]) : '';
      annonser.push({
        page_id: s.id, url: s.url, namn: annonsdel(titel), titel, typ_notion: typ, typ: typAv(typ),
        status: hub.falt.status ? varde(p[hub.falt.status]) : '',
        landning: hub.falt.landning ? (varde(p[hub.falt.landning]).match(/https?:\/\/[^\s)\]]+/)?.[0] ?? null) : null,
        skapad: s.created_time, skapad_dag: (skapadProp || svenskDag(s.created_time) || '').slice(0, 10),
      });
    }
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return { annonser, feedback };
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

/** Skapar Feedback-raden: POST pages (första 100 block) → PATCH resten → läs tillbaka. */
async function skapaFeedbackRad(hub, properties, markdown) {
  const block = tillBlock(markdown);
  const omgangar = delaBlock(block);
  const sida = await notion('pages', { method: 'POST', body: { parent: { database_id: ren(hub.id) }, properties, children: omgangar[0] ?? [] } });
  for (let i = 1; i < omgangar.length; i++) await notion(`blocks/${ren(sida.id)}/children`, { method: 'PATCH', body: { children: omgangar[i] } });
  const efter = await notion(`pages/${ren(sida.id)}`);
  const titel = Object.values(efter.properties ?? {}).find((p) => p.type === 'title');
  return { page_id: sida.id, url: efter.url ?? null, titel: (titel?.title ?? []).map((t) => t.plain_text).join(''), block: block.length };
}

// ------------------------------------------------------------ huvudflödet

const lasJson = (fil, tom = {}) => { try { return JSON.parse(readFileSync(fil, 'utf8')); } catch { return tom; } };
export const idagSvensk = () => svenskDag(new Date().toISOString());
const utmappFor = (idag, ut = null) => (ut ? resolve(ut) : join(ROT, UTMAPP, idag));

/**
 * Läsläget: alla hubbar → senaste ronden per hub → varje briefs text → mätningen.
 * Returnerar körningen { idag, hubbar: [...], varningar, stopp }.
 */
export async function byggGranskningsko({ rond = null, hubFilter = null, maxdagar = MAXDAGAR, igen = false, ut = null, idag = idagSvensk(), logg = (...a) => console.error(...a) } = {}) {
  const varningar = [];
  const stopp = [];
  const products = lasJson(join(ROT, 'products', 'products.json'), { products: [] }).products ?? [];
  const register = lasJson(join(ROT, 'factory', 'produkter', 'register.json'), { poster: {} });
  const finnsMinne = (id) => existsSync(join(ROT, 'products', id, 'dna.md'));
  const mapp = utmappFor(idag, ut);
  mkdirSync(mapp, { recursive: true });

  // 1. Hubbarna — dynamiskt, aldrig ur minnet. notion-kalla loggar OPS-raden.
  let kandidater = await hittaHubbar();
  logg(`Hubbar integrationen ser (efter OPS-filtret): ${kandidater.length}`);
  if (hubFilter) {
    // Hela eller början av id:t (med eller utan bindestreck), eller en del av titeln.
    const f = String(hubFilter).toLowerCase();
    const fid = normaliseraId(hubFilter);
    kandidater = kandidater.filter((h) => (fid.length >= 8 && normaliseraId(h.id).startsWith(fid)) || String(h.titel ?? '').toLowerCase().includes(f));
    logg(`--hub "${hubFilter}": ${kandidater.length} hub(bar) matchar`);
    if (!kandidater.length) varningar.push(`--hub "${hubFilter}" matched no hub — nothing was reviewed`);
  } else if (!kandidater.length) stopp.push('No creative hub could be found in Notion — the integration "Bäverbutiken RUTINER" sees no databases. Check ••• → Connections on the Bäverbutiken teamspace.');

  const hubbar = [];
  const prisCache = new Map();
  for (const kand of kandidater) {
    const post = { id: kand.id, titel: kand.titel, url: kand.url ?? null, kalla: kand.kalla, slug: hubbSlug(kand.titel, kand.id) };
    let hub;
    try { hub = await hamtaHub(kand.id); }
    catch (e) { hubbar.push({ ...post, laget: 'olasbar', skal: e.status === 404 ? 'Notion 404 — archived or not shared with the integration' : e.message }); logg(`✗ ${kand.titel}: ${e.message}`); continue; }
    post.titel = hub.titel; post.url = hub.url ?? post.url; post.slug = hubbSlug(hub.titel, hub.id);
    if (hub.in_trash) { hubbar.push({ ...post, laget: 'olasbar', skal: 'in the trash' }); logg(`✗ ${hub.titel}: i papperskorgen`); continue; }
    const struktur = arCreativeHub(hub.properties, hub.titel);
    if (!struktur.ok) { hubbar.push({ ...post, laget: 'hoppad', skal: `not a creative hub: ${struktur.skal}` }); logg(`↷ ${hub.titel}: ${struktur.skal}`); continue; }

    // 2. Raderna och ronden.
    let alla;
    try { alla = await allaRader(hub); }
    catch (e) { hubbar.push({ ...post, laget: 'olasbar', skal: `rows could not be read: ${e.message}` }); logg(`✗ ${hub.titel}: ${e.message}`); continue; }
    const valet = valjRond(alla.annonser, { rond, idag, maxdagar });
    const dagar = Object.entries(valet.per_dag).sort().slice(-5).map(([d, n]) => `${d}×${n}`).join(', ');
    logg(`## ${hub.titel} (${hub.id}) · ${alla.annonser.length} annonsrader · ${alla.feedback.length} Feedback-rader · senaste dagar: ${dagar || '—'}`);
    if (!valet.datum) { hubbar.push({ ...post, laget: 'hoppad', skal: 'no ad rows (Typ … Pending Approval)', feedback_rader: alla.feedback.length }); logg('   ↷ inga annonsrader'); continue; }
    const granskad = redanGranskad(alla.feedback, valet.datum);
    const grund = { ...post, rond: valet.datum, rond_kalla: valet.kalla, alder_dagar: valet.alder, antal: valet.rader.length, per_dag: valet.per_dag, feedback_rader: alla.feedback.length, redan_granskad: granskad ? { titel: granskad.titel, url: granskad.url } : null };
    if (granskad && !igen) { hubbar.push({ ...grund, laget: 'hoppad', skal: `round ${valet.datum} already reviewed (${granskad.titel})` }); logg(`   ↷ ronden ${valet.datum} är redan granskad: "${granskad.titel}" (--igen granskar om)`); continue; }
    if (valet.for_gammal) { hubbar.push({ ...grund, laget: 'hoppad', skal: `latest round ${valet.datum} is ${valet.alder} days old (limit ${maxdagar}) — no newer briefs to give feedback on` }); logg(`   ↷ ronden ${valet.datum} är ${valet.alder} dagar gammal (gräns ${maxdagar}) — hoppar (--rond ${valet.datum} granskar ändå)`); continue; }

    // 3. Produkten (aldrig gissad), prefixet, butiksnamnen, dna.md.
    const dominant = dominantPrefix(alla.annonser.map((r) => r.namn));
    const produkt = produktFor(hub.id, dominant?.prefix, { products, register, finnsMinne });
    const butiksnamn = butiksnamnFor(hub.id, register);
    const minnesmapp = produkt?.minne ? join(ROT, produkt.minne) : null;
    let doda = [];
    if (minnesmapp && existsSync(join(minnesmapp, 'dna.md'))) doda = dodaKoncept(readFileSync(join(minnesmapp, 'dna.md'), 'utf8'));
    const batch = minnesmapp ? hittaBatch(minnesmapp, valet.rader.map((r) => r.namn)) : null;
    const feedbackFil = minnesmapp ? join(minnesmapp, 'feedback.md') : null;
    const hubVarningar = [];
    if (!produkt) hubVarningar.push('no product folder in the repo (products.json / register.json) — dna.md and feedback.md do not apply; the Feedback row in the hub is the memory');
    else if (!produkt.minne) hubVarningar.push(`product ${produkt.id} (${produkt.kalla}) has no products/${produkt.id}/dna.md — only the Feedback row in the hub is written`);
    logg(`   rond ${valet.datum} (${valet.kalla}) · ${valet.rader.length} briefer · prefix ${dominant ? `${dominant.prefix} (${dominant.antal}/${dominant.av})` : '?'} · produkt ${produkt ? `${produkt.id} via ${produkt.kalla}${produkt.minne ? ` · minne ${produkt.minne}` : ''}` : 'ingen mapp'} · stoppar namn: ${butiksnamn.join(', ')}${doda.length ? ` · dna.md tar bort ${doda.map((d) => d.koncept).join(', ')}` : ''}`);

    // 4. Varje brief: texten ur Notion, priset live ur Landing page (radens
    //    egenskap, annars "Landing page: https://…" i brödtexten — Bäverbutikens
    //    briefer skriver den där, mätt 2026-09-18: 72 av 78 rader hade tom
    //    egenskap men länken i texten), sedan mätningen.
    const hubMapp = join(mapp, post.slug);
    mkdirSync(hubMapp, { recursive: true });
    const rader = [];
    for (const r of valet.rader) {
      let text = '';
      let fel_las = null;
      try { text = textUrBlock(await hamtaBlock(r.page_id)); }
      catch (e) { fel_las = e.message; }
      const landning = r.landning ?? landningUrBrief(text);
      let pris_butik = null;
      let pris_skal = null;
      if (landning) {
        if (!prisCache.has(landning)) {
          try { prisCache.set(landning, await hamtaPris(landning, 'SEK')); }
          catch (e) { prisCache.set(landning, { pris_butik: null, skal: e.message }); }
        }
        const p = prisCache.get(landning);
        pris_butik = p.pris_butik ? { pris: p.pris_butik.pris, jamforpris: p.pris_butik.jamforpris, kalla: p.pris_butik.kalla } : null;
        pris_skal = p.skal;
      } else pris_skal = 'no Landing page on the row or in the brief';
      const ctx = { prefix: dominant?.prefix ?? null, creative_prefix: produkt?.creative_prefix ?? null, butiksnamn, pris_butik, breakEvenCpa: produkt?.break_even_cpa ?? null, copyModell: null, doda_koncept: doda };
      const g = fel_las ? { fel: [{ kod: 'notion', text: `the brief could not be read from Notion: ${fel_las}` }], anmarkningar: [], fakta: {} } : granskaBrief({ ...r, text }, ctx);
      if (!fel_las && pris_skal && prisUrBriefText(text).pris != null) g.anmarkningar.push({ kod: 'pris', text: `store price unread: ${pris_skal}` });
      let fil = null;
      if (text) { fil = join(hubMapp, `${r.namn.replace(/[^\w åäöÅÄÖ.-]/g, '_')}.md`); writeFileSync(fil, `${text}\n`); }
      rader.push({ ...r, landning, tecken: text.length, fil: fil ? fil.replace(`${ROT}/`, '') : null, pris_butik, pris_skal, fel: g.fel, anmarkningar: g.anmarkningar, fakta: g.fakta });
      logg(`   ${domTecken[domFor(g)]} ${r.namn} [${r.typ}, ${r.status || 'ingen status'}] ${g.fel.length} fel · ${g.anmarkningar.length} anm${pris_butik ? ` · pris ${pris_butik.pris}${pris_butik.jamforpris ? `/${pris_butik.jamforpris}` : ''} kr` : ''}`);
    }
    hubbar.push({
      ...grund, laget: 'att_doma', hub: { id: hub.id, titel: hub.titel, url: hub.url, har_feedback_typ: struktur.harFeedbackTyp },
      prefix: dominant?.prefix ?? null, produkt, butiksnamn, doda_koncept: doda,
      batch: batch?.batch ?? null, feedback_fil: feedbackFil ? feedbackFil.replace(`${ROT}/`, '') : null,
      dom_fil: join(mapp, `${post.slug}.dom.json`).replace(`${ROT}/`, ''), varningar: hubVarningar, rader,
    });
  }
  const korning = { idag, hamtad: new Date().toISOString(), ut: mapp.replace(`${ROT}/`, ''), hubbar, varningar, stopp };
  writeFileSync(join(mapp, 'ko.json'), `${JSON.stringify(korning, null, 2)}\n`);
  return korning;
}

/** Skrivläget för EN hub: Feedback-rad, kommentarer på rader med fel, feedback.md. */
export async function skrivGranskning({ ko, dom, idag, torr = false, igen = false, logg = (...a) => console.error(...a) }) {
  const kontroll = giltigDom(dom, { hub: ko.hub, rond: { datum: ko.rond }, rader: ko.rader });
  if (!kontroll.ok) throw new Error(`dom.json håller inte:\n  - ${kontroll.fel.join('\n  - ')}`);
  const perNamn = new Map(ko.rader.map((r) => [r.namn.toLowerCase(), r]));
  const rader = dom.rader.map((r) => ({ ...perNamn.get(String(r.namn).toLowerCase()), namn: r.namn, fel: (r.fel ?? []).map(String), anmarkningar: (r.anmarkningar ?? []).map(String), bra: (r.bra ?? []).map(String) }));
  const resultat = { hub_id: ko.hub.id, hub_titel: ko.hub.titel, slug: ko.slug, rond: dom.rond, idag, antal: rader.length, rena: rader.filter((r) => domFor(r) === 'ok').length, anm: rader.filter((r) => domFor(r) === 'anmarkning').length, fel: rader.filter((r) => domFor(r) === 'fel').length, feedback_rad: null, feedback_fil: null, kommentarer: [], varningar: [...(ko.varningar ?? [])], torr };

  // 1. Feedback-raden i hubben — minnet för hubbar utan produktmapp, och det
  //    nästa briefskrivare läser innan den skriver.
  const markdown = feedbackRadMarkdown({ ...dom, rader }, { idag, hubTitel: ko.hub.titel });
  if (serUtSomSvenska(markdown.replace(/`[^`]*`/g, ' ').replace(/\|[^\n]*\|/g, ' '))) throw new Error('Feedback-raden ser svensk ut — den läses av redigerarna på engelska.');
  let schema = null;
  try { schema = torr ? null : (await hamtaHub(ko.hub.id)).properties; } catch (e) { resultat.varningar.push(`hub schema could not be read: ${e.message}`); }
  if (torr) {
    logg(`[--torr] skulle skapa raden "${feedbackTitel(dom.rond)}" (Typ ${FEEDBACK_TYP}) i "${ko.hub.titel}":\n${markdown.split('\n').map((x) => `    ${x}`).join('\n')}`);
    resultat.feedback_rad = { torr: true, markdown };
  } else if (schema) {
    const finns = await (async () => { try { return redanGranskad((await allaRader({ id: ko.hub.id, falt: hittaFält(schema) })).feedback, dom.rond); } catch { return null; } })();
    if (finns && !igen) { resultat.feedback_rad = { fanns: true, titel: finns.titel, url: finns.url }; logg(`  ↷ Feedback-raden "${finns.titel}" finns redan — ingen ny rad (--igen skriver en till)`); }
    else {
      try {
        const { properties, varningar } = feedbackEgenskaper(schema, { rond: dom.rond, idag });
        for (const v of varningar) { logg(`  ⚠️ ${v}`); resultat.varningar.push(`${ko.hub.titel}: ${v}`); }
        const rad_ = await skapaFeedbackRad({ id: ko.hub.id }, properties, markdown);
        resultat.feedback_rad = { skapad: true, ...rad_ };
        logg(`  ✓ Feedback-rad "${rad_.titel}" — ${rad_.url} (${rad_.block} block)`);
      } catch (e) { resultat.feedback_rad = { fel: e.message }; resultat.varningar.push(`${ko.hub.titel}: Feedback row not written — ${e.message}`); logg(`  ❌ Feedback-raden: ${e.message}`); }
    }
  }

  // 2. Kommentar på varje rad med FEL — aldrig annars, aldrig statusbyte.
  for (const r of rader) {
    if (!r.fel.length) continue;
    if (!r.page_id) { resultat.kommentarer.push({ namn: r.namn, utfall: 'fel', skal: 'page_id saknas i kön' }); continue; }
    const text = kommentarText(r, { datum: dom.rond, hub: ko.hub.titel });
    if (serUtSomSvenska(text.replace(/`[^`]*`/g, ' '))) { resultat.kommentarer.push({ namn: r.namn, utfall: 'stoppad', skal: 'kommentaren ser svensk ut' }); continue; }
    const marke = `${KOMMENTARMARKE} ${dom.rond}`;
    if (torr) { resultat.kommentarer.push({ namn: r.namn, utfall: 'torr', text }); logg(`[--torr] kommentar på ${r.namn}:\n${text.split('\n').map((x) => `    ${x}`).join('\n')}`); continue; }
    if (await harKommentar(r.page_id, marke)) { resultat.kommentarer.push({ namn: r.namn, utfall: 'fanns' }); logg(`  ↷ ${r.namn}: kommentaren finns redan`); continue; }
    try { await kommentera(r.page_id, text); resultat.kommentarer.push({ namn: r.namn, utfall: 'skriven', text }); logg(`  ✓ ${r.namn}: kommentar skriven`); }
    catch (e) { resultat.kommentarer.push({ namn: r.namn, utfall: 'fel', skal: e.message }); resultat.varningar.push(`${r.namn}: comment not written — ${e.message}`); logg(`  ❌ ${r.namn}: ${e.message}`); }
  }

  // 3. feedback.md — bara när produkten har en mapp i repot (CaraShell via speglingen, products.json-produkterna).
  if (ko.feedback_fil) {
    const fil = join(ROT, ko.feedback_fil);
    const rubrik = `# Feedback på briefronderna — ${ko.produkt?.id ?? ko.hub.titel}\n\nSkrivs av \`/briefgranskning\` (Bäverbutiken, måndag + torsdag) dagen efter en briefrond i hubben "${ko.hub.titel}".\nNästa briefskrivare läser den senaste sektionen (och Feedback-raden i hubben) innan den skriver nästa rond.\nReglerna är kumulativa: en regel som bryts igen står kvar tills den hålls.\nInga påhittade siffror — allt kommer ur briefarna, butiken (läst live) och dna.md.`;
    const sektion_ = feedbackSektion({ ...dom, rader }, { idag, batch: ko.batch ?? null, hub: ko.hub.titel });
    const ny = laggInSektion(existsSync(fil) ? readFileSync(fil, 'utf8') : '', dom.rond, sektion_, { rubrik });
    if (torr) logg(`[--torr] skulle skriva sektionen "Rond ${dom.rond}" till ${ko.feedback_fil}`);
    else { mkdirSync(dirname(fil), { recursive: true }); writeFileSync(fil, ny); logg(`✓ ${ko.feedback_fil}: sektionen "Rond ${dom.rond}" skriven`); }
    resultat.feedback_fil = ko.feedback_fil;
  }
  return resultat;
}

/** Körningens läge per hub, ur ko.json + resultatfilerna — underlaget för rapporten. */
export function samlaKorning(ko, resultat = []) {
  const perHub = new Map(resultat.map((r) => [normaliseraId(r.hub_id), r]));
  const hubbar = (ko.hubbar ?? []).map((h) => {
    if (h.laget !== 'att_doma') return { titel: h.titel, laget: h.laget, skal: h.skal ?? null, rond: h.rond ?? null, antal: h.antal ?? null };
    const r = perHub.get(normaliseraId(h.id));
    if (!r) return { titel: h.titel, laget: 'ej_domd', rond: h.rond, antal: h.antal, skal: 'no dom.json written' };
    return { titel: h.titel, laget: 'granskad', rond: r.rond, antal: r.antal, rena: r.rena, anm: r.anm, fel: r.fel, feedback_rad: !!(r.feedback_rad && (r.feedback_rad.skapad || r.feedback_rad.fanns || r.feedback_rad.torr)), kommentarer: r.kommentarer.filter((k) => k.utfall === 'skriven' || k.utfall === 'fanns' || k.utfall === 'torr').length, feedback_fil: r.feedback_fil ?? null };
  });
  const varningar = [...(ko.varningar ?? []), ...resultat.flatMap((r) => r.varningar ?? [])];
  return { idag: ko.idag, hubbar, varningar: [...new Set(varningar)], stopp: [...(ko.stopp ?? [])] };
}

/** Skickar rapporten via tools/notify-discord.mjs till #problem-and-revisions-ads (Bäverbutikens server). */
export function skickaRapport(text, { pingAxel = false, torr = false } = {}) {
  if (torr) return { skickad: false, torr: true };
  const args = [join(ROT, 'tools', 'notify-discord.mjs')];
  if (pingAxel) args.push('--ping-axel');
  const r = spawnSync(process.execPath, args, { input: text, encoding: 'utf8', env: { ...process.env, DISCORD_CHANNEL_NAME: DISCORD_KANAL, DISCORD_CHANNEL_ID: '' }, timeout: 120000 });
  return { skickad: r.status === 0, status: r.status, stdout: String(r.stdout ?? '').trim(), stderr: String(r.stderr ?? '').trim() };
}

// ------------------------------------------------------------ utskrift

export function tabell(korning) {
  const ut = [];
  ut.push(`=== Briefgranskning · Bäverbutiken · ${korning.idag} ===`);
  const n = (l) => korning.hubbar.filter((h) => h.laget === l).length;
  ut.push(`Hubbar: ${korning.hubbar.length} · att döma: ${n('att_doma')} · hoppade: ${n('hoppad')} · olåsbara: ${n('olasbar')}`);
  ut.push('');
  for (const h of korning.hubbar) {
    if (h.laget === 'olasbar') { ut.push(`✗ ${h.titel} (${h.id}) — ${h.skal}`); continue; }
    if (h.laget === 'hoppad') { ut.push(`↷ ${h.titel} (${h.id}) — ${h.skal}${h.per_dag ? ` · dagar: ${Object.entries(h.per_dag).sort().slice(-3).map(([d, c]) => `${d}×${c}`).join(', ')}` : ''}`); continue; }
    ut.push(`## ${h.titel} (${h.id}) · rond ${h.rond} (${h.rond_kalla}, ${h.alder_dagar} dagar gammal) · ${h.antal} briefer${h.batch ? ` · batch #${h.batch}` : ''}`);
    ut.push(`   prefix ${h.prefix ?? '?'} · produkt ${h.produkt ? `${h.produkt.id} (${h.produkt.kalla})` : 'ingen mapp'} · feedback.md: ${h.feedback_fil ?? '—'} · dom: ${h.dom_fil}`);
    ut.push(`   stoppar butiksnamn: ${h.butiksnamn.join(', ')} · dna.md tar bort: ${h.doda_koncept.length ? h.doda_koncept.map((d) => d.koncept).join(', ') : 'inget'}`);
    for (const v of h.varningar ?? []) ut.push(`   ⚠️  ${v}`);
    for (const r of h.rader) {
      ut.push(`   ${domTecken[domFor(r)]} ${r.namn}  [${r.typ}, ${r.status || 'ingen status'}]  ${r.tecken} tecken${r.pris_butik ? `  pris ${r.pris_butik.pris} kr${r.pris_butik.jamforpris ? ` (ord. ${r.pris_butik.jamforpris})` : ''}` : `  pris okänt: ${r.pris_skal}`}${r.fil ? `  → ${r.fil}` : ''}`);
      for (const f of r.fel) ut.push(`       ❌ ${f.kod}: ${f.text}`);
      for (const a of r.anmarkningar) ut.push(`       ⚠️  ${a.kod}: ${a.text}`);
    }
    const fel = h.rader.filter((r) => r.fel.length).length;
    const anm = h.rader.filter((r) => !r.fel.length && r.anmarkningar.length).length;
    ut.push(`   ${h.rader.length} brief(er) · ${fel} med fel · ${anm} med anmärkning · ${h.rader.length - fel - anm} rena (mätbart — sessionen dömer resten)`);
    ut.push('');
  }
  if (korning.varningar.length) { ut.push(`Varningar (${korning.varningar.length}):`); for (const v of korning.varningar) ut.push(`  ⚠️  ${v}`); }
  if (korning.stopp.length) { ut.push(`STOPP (${korning.stopp.length}):`); for (const s of korning.stopp) ut.push(`  🔴 ${s}`); }
  return ut.join('\n');
}

// ------------------------------------------------------------ CLI

async function huvud() {
  const { säkerställProxy } = await import('./meta-lib.mjs');
  säkerställProxy();
  const args = process.argv.slice(2);
  const flagga = (n, s = null) => { const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : s; };
  const finns = (n) => args.includes(`--${n}`);
  const do_ = (m) => { console.error(`✗ ${m}`); process.exit(1); };
  if (!process.env.NOTION_TOKEN && !finns('rapport')) do_('NOTION_TOKEN saknas i miljön — hubbarna går inte att läsa.');
  const idag = flagga('idag') ?? idagSvensk();
  const torr = finns('torr');

  // --rapport: EN Discord-rapport för hela körningen.
  if (finns('rapport')) {
    const mapp = utmappFor(idag, flagga('ut'));
    const koFil = join(mapp, 'ko.json');
    if (!existsSync(koFil)) do_(`${koFil.replace(`${ROT}/`, '')} finns inte — kör läsläget först.`);
    const ko = JSON.parse(readFileSync(koFil, 'utf8'));
    const resultat = readdirSync(mapp).filter((f) => f.endsWith('.resultat.json')).map((f) => JSON.parse(readFileSync(join(mapp, f), 'utf8')));
    const korning = samlaKorning(ko, resultat);
    const { text, ping_axel } = byggRapport(korning);
    writeFileSync(join(mapp, 'rapport.txt'), `${text}\n`);
    console.log(text);
    if (serUtSomSvenska(text.replace(/`[^`]*`/g, ' '))) do_('rapporten ser svensk ut — skriv om på engelska (Axels order 2026-09-05).');
    if (torr) { console.log(`\n[--torr] ${text.length} tecken, ping Axel: ${ping_axel ? 'ja' : 'nej'}. Inget skickat.`); return; }
    const svar = skickaRapport(text, { pingAxel: ping_axel });
    if (svar.stdout) console.error(svar.stdout);
    if (svar.stderr) console.error(svar.stderr);
    if (!svar.skickad) do_(`Discord-skicket misslyckades (exit ${svar.status}) — rapporten står i ${join(mapp, 'rapport.txt').replace(`${ROT}/`, '')}.`);
    console.log(`\n✅ Discord: rapporten postad i #${DISCORD_KANAL}${ping_axel ? ' med ping till Axel' : ''}.`);
    return;
  }

  // --skriv <dom.json>: EN hubs dom.
  const skriv = flagga('skriv');
  if (skriv) {
    const dom = JSON.parse(readFileSync(resolve(skriv), 'utf8'));
    const mapp = utmappFor(idag, flagga('ut'));
    const koFil = join(mapp, 'ko.json');
    if (!existsSync(koFil)) do_(`${koFil.replace(`${ROT}/`, '')} finns inte — kör läsläget först (samma dag, eller --idag).`);
    const alla = JSON.parse(readFileSync(koFil, 'utf8'));
    const ko = (alla.hubbar ?? []).find((h) => h.laget === 'att_doma' && normaliseraId(h.id) === normaliseraId(dom.hub_id));
    if (!ko) do_(`hubben ${dom.hub_id} finns inte i kön som "att döma" — läs ko.json.`);
    const res = await skrivGranskning({ ko, dom, idag, torr, igen: finns('igen') });
    const resFil = join(mapp, `${ko.slug}.resultat.json`);
    if (!torr) writeFileSync(resFil, `${JSON.stringify(res, null, 2)}\n`);
    console.log(`\n${ko.hub.titel} · rond ${dom.rond}: ${res.antal} briefer · ${res.rena} rena · ${res.anm} med anmärkning · ${res.fel} med fel`);
    console.log(`Feedback-rad: ${res.feedback_rad?.url ?? (res.feedback_rad?.torr ? 'torr' : res.feedback_rad?.fel ?? '—')}`);
    console.log(`Kommentarer: ${res.kommentarer.map((k) => `${k.namn} ${k.utfall}`).join(' · ') || 'inga (inga fel)'}`);
    if (res.feedback_fil) console.log(`feedback.md: ${res.feedback_fil}`);
    console.log(torr ? '\n--torr: inget skrivet till Notion eller feedback.md.' : `Resultat: ${resFil.replace(`${ROT}/`, '')}`);
    return;
  }

  // Läsläget.
  const maxdagar = flagga('maxdagar') != null ? Number(flagga('maxdagar')) : MAXDAGAR;
  const korning = await byggGranskningsko({ rond: flagga('rond'), hubFilter: flagga('hub'), maxdagar: Number.isFinite(maxdagar) ? maxdagar : MAXDAGAR, igen: finns('igen'), ut: flagga('ut'), idag });
  console.error(`Kön skriven till ${korning.ut}/ko.json`);
  if (finns('json')) console.log(JSON.stringify(korning, null, 2));
  else console.log(tabell(korning));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
