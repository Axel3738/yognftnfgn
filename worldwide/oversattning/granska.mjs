// granska.mjs — mekanisk kontroll av de engelska produkttexterna för Beaver Store Co.
//
//   node worldwide/oversattning/granska.mjs worldwide/oversattning/kalla/produkter-01.json [...]
//   node worldwide/oversattning/granska.mjs --alla
//
// Varje produkt i källfilen ska ha worldwide/oversattning/en/<handle>.json. Kontrollerna
// är desamma som Matstrumpors granska.mjs byggde på: samma taggar i samma ordning, samma
// bildadresser och länkar, varje siffra kvar, ingen svenska kvar, inget förbjudet ord.
// Exit 1 = minst en produkt har ❌ och registreras aldrig (worldwide/bygg.mjs läser samma
// funktion).

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = dirname(fileURLToPath(import.meta.url));
export const EN_MAPP = join(ROT, 'en');

const text = (html) => String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const taggar = (html) => [...String(html ?? '').matchAll(/<\s*(\/?)\s*([a-zA-Z0-9]+)/g)].map((m) => `${m[1]}${m[2].toLowerCase()}`);
const attr = (html, namn) => [...String(html ?? '').matchAll(new RegExp(`\\s${namn}="([^"]*)"`, 'g'))].map((m) => m[1]).sort();

// Ord som bara svenskan har (engelska ord som "till", "den", "for" är medvetet utelämnade).
const SVENSKA = ['och', 'att', 'är', 'inte', 'som', 'det', 'eller', 'från', 'också', 'utan', 'när', 'där', 'varje', 'hela', 'eftersom', 'måste', 'bara', 'ingen', 'inga', 'ditt', 'dina', 'våra', 'vår', 'med', 'för', 'på', 'av', 'sitter', 'håller'];
const SVENSKA_RE = new RegExp(`(?<![\\p{L}])(${SVENSKA.join('|')})(?![\\p{L}])`, 'giu');
const FORBJUDET = [/klarna/i, /bäverbutik/i, /baverbutik/i, /beaver\s*store/i, /ångerrätt/i, /\b\d+\s?kr\b/i, /\bkronor\b/i, /swish/i];

/** Siffergrupper i en text, normaliserade (2,5 → 2.5, 1 000 → 1000). */
export function siffror(s, locale = 'en') {
  let t = String(s);
  // de/nl/it/es/pt/pl skriver tusental med punkt (1.000) — slås ihop före decimalkommat.
  if (locale !== 'en') t = t.replace(/\b(\d{1,3})((?:\.\d{3})+)(?![\d.,])/g, (m, a, b) => a + b.replace(/\./g, ''));
  return [...t
    .replace(/(\d)[\s\u00a0\u202f](?=\d{3}\b)/g, '$1')                                          // 72 420 → 72420 (svenskt tusental)
    .replace(/\b(\d{1,3})((?:,\d{3})+)(?![\d,])/g, (m, a, b) => a + b.replace(/,/g, ''))   // 72,420 → 72420 (engelskt tusental)
    .replace(/(\d),(\d)/g, '$1.$2')                                                         // 2,5 → 2.5 (svenskt decimalkomma)
    .matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
}

/** Dom för en produkt: lista med fel (tom = ✅). */
export function granskaProdukt(kalla, en, { locale = 'en' } = {}) {
  const fel = [];
  if (!en) return [`saknar ${locale}-fil`];
  if (en.handle !== kalla.handle) fel.push(`handle ${en.handle} ≠ ${kalla.handle}`);
  if (!String(en.title ?? '').trim()) fel.push('titel saknas');
  for (const [f, k] of [['seo_title', 'seo_title'], ['seo_description', 'seo_description']]) {
    if (kalla[k] && !String(en[f] ?? '').trim()) fel.push(`${f} saknas (källan har en)`);
  }
  const a = taggar(kalla.descriptionHtml), b = taggar(en.descriptionHtml);
  if (a.join(' ') !== b.join(' ')) {
    const i = a.findIndex((t, ix) => t !== b[ix]);
    fel.push(`HTML-taggarna skiljer (${a.length} mot ${b.length}; första skillnad vid tagg ${i}: ${a[i]} ≠ ${b[i]})`);
  }
  for (const namn of ['src', 'href', 'style']) {
    if (attr(kalla.descriptionHtml, namn).join('|') !== attr(en.descriptionHtml, namn).join('|')) fel.push(`attributet ${namn} har ändrats`);
  }
  const alla = [en.title, en.seo_title, en.seo_description, text(en.descriptionHtml), ...attr(en.descriptionHtml, 'alt')].join(' \n ');
  const svenska = [...alla.matchAll(SVENSKA_RE)].map((m) => m[0]);
  const svBokstav = locale === 'de' ? /[åÅ]/ : locale === 'en' ? /[åäöÅÄÖ]/ : /[åÅ]|(?<![\p{L}])\p{L}*[äöÄÖ]\p{L}*(?![\p{L}])/u;
  if (svBokstav.test(alla.replace(/Bäver\w*|Göteborg|Malmö|Umeå|Växjö|Örebro|Jönköping/g, ''))) fel.push(`å/ä/ö kvar: "${(alla.match(/[^\s]*[åäöÅÄÖ][^\s]*/) ?? [''])[0]}"`);
  if (svenska.length >= 2) fel.push(`svenska ord kvar: ${[...new Set(svenska)].slice(0, 6).join(', ')}`);
  for (const re of FORBJUDET) if (re.test(alla)) fel.push(`förbjudet: ${re}`);
  // Returlöftet utomlands är 14 dagar (butikens returpolicy, Axels beslut B 2026-09-22) — de 32
  // svenska produktsidornas "30 dagars öppet köp" följer alltså inte med, och 30 ska inte krävas.
  const kalltext = [kalla.title, text(kalla.descriptionHtml)].join(' ').replace(/30\s*dagars\s*(öppet köp|nöjd-kund-garanti)/gi, '14 dagars $1');
  const kallsiffror = siffror(kalltext);
  const ensiffror = new Set(siffror(alla, locale));
  const saknas = [...new Set(kallsiffror)].filter((s) => !ensiffror.has(s));
  if (saknas.length) fel.push(`siffror saknas: ${saknas.slice(0, 8).join(', ')}`);
  for (const o of kalla.options ?? []) {
    const eo = (en.options ?? []).find((x) => x.name === o.name);
    if (!eo || !String(eo.name_en ?? '').trim()) { fel.push(`alternativet "${o.name}" saknas`); continue; }
    const sakn = o.values.filter((v) => !String(eo.values?.[v] ?? '').trim());
    if (sakn.length) fel.push(`alternativvärden saknas i "${o.name}": ${sakn.slice(0, 4).join(', ')}`);
    const kvar = Object.values(eo.values ?? {}).filter((v) => (locale === 'de' ? /[åÅ]/ : /[åäöÅÄÖ]/).test(v));
    if (kvar.length) fel.push(`svenska alternativvärden: ${kvar.slice(0, 4).join(', ')}`);
  }
  const langd = text(en.descriptionHtml).length / Math.max(1, text(kalla.descriptionHtml).length);
  const [lo, hi] = locale === 'en' ? [0.7, 1.45] : [0.7, 1.75];
  if (text(kalla.descriptionHtml).length > 200 && (langd < lo || langd > hi)) fel.push(`längden ${Math.round(langd * 100)} % av källan`);
  return fel;
}

export const SPRAK = ['de', 'fr', 'es', 'it', 'nl', 'pl', 'pt-PT'];

export function lasEn(handle, locale = 'en') {
  const f = join(ROT, locale, `${handle}.json`);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch (e) { return { handle, _fel: `ogiltig JSON: ${e.message}` }; }
}

/** Samma nycklar, rekursivt (för _-filerna: sidor, villkor, tema, menyer). */
function nycklar(o, vag = '') {
  if (Array.isArray(o)) return o.flatMap((x, i) => nycklar(x, `${vag}[${i}]`));
  if (o && typeof o === 'object') return Object.entries(o).flatMap(([k, v]) => [`${vag}.${k}`, ...nycklar(v, `${vag}.${k}`)]);
  return [];
}
const strangar = (o) => (Array.isArray(o) ? o.flatMap(strangar) : o && typeof o === 'object' ? Object.values(o).flatMap(strangar) : typeof o === 'string' ? [o] : []);

/** En _-fil på ett språk mot den engelska: samma struktur, samma taggar, ingen svenska, inget förbjudet. */
export function granskaDel(enObj, ut, locale) {
  const fel = [];
  const a = nycklar(enObj), b = new Set(nycklar(ut));
  const saknas = a.filter((k) => !b.has(k));
  if (saknas.length) fel.push(`nycklar saknas: ${saknas.slice(0, 4).join(', ')}`);
  const ea = strangar(enObj), ua = strangar(ut);
  const ti = ea.findIndex((x, i) => taggar(x).join(' ') !== taggar(ua[i] ?? '').join(' '));
  if (ti >= 0) fel.push(`HTML-taggarna skiljer i text ${ti}`);
  const alla = ua.map(text).join(' \n ');
  const svenska = [...alla.matchAll(SVENSKA_RE)].map((m) => m[0]);
  if (svenska.length >= 3) fel.push(`svenska ord: ${[...new Set(svenska)].slice(0, 6).join(', ')}`);
  // Sidor och villkor får nämna butikens juridiska namn och supportadressen (kundsupport@baverbutiken.se).
  const utanNamn = alla.replace(/\S+@b[äa]verbutiken\.se/gi, '').replace(/\(?B[äa]verbutiken[^)]{0,30}\)?/g, '');
  for (const re of FORBJUDET.filter((r) => !/beaver|verbutik/.test(String(r)))) if (re.test(utanNamn)) fel.push(`förbjudet: ${re}`);
  const eng = new Set(siffror(ea.map(text).join(' '))), ut2 = new Set(siffror(alla, locale));
  const sakn = [...eng].filter((x) => !ut2.has(x));
  if (sakn.length) fel.push(`siffror saknas: ${sakn.slice(0, 6).join(', ')}`);
  return fel;
}

export function granskaFiler(filer, locale = 'en') {
  let ok = 0, dåliga = 0;
  const rader = [];
  for (const fil of filer) {
    for (const p of JSON.parse(readFileSync(fil, 'utf8'))) {
      const en = lasEn(p.handle, locale);
      const fel = en?._fel ? [en._fel] : granskaProdukt(p, en, { locale });
      if (fel.length) { dåliga++; rader.push(`❌ ${p.handle}: ${fel.join(' · ')}`); } else { ok++; rader.push(`✅ ${p.handle}`); }
    }
  }
  return { ok, dåliga, rader };
}

/** --locale <kod> --filer a.json b.json … : filerna i <kod>/ granskas mot källan (produkter) eller engelskan (_-filer). */
function granskaSprakfiler(locale, namn) {
  const kallor = new Map();
  for (const f of readdirSync(join(ROT, 'kalla')).filter((x) => x.startsWith('produkter-'))) for (const p of JSON.parse(readFileSync(join(ROT, 'kalla', f), 'utf8'))) kallor.set(p.handle, p);
  let ok = 0, dåliga = 0;
  for (const n of namn) {
    const bas = n.split('/').pop();
    let fel;
    try {
      const ut = JSON.parse(readFileSync(join(ROT, locale, bas), 'utf8'));
      if (bas.startsWith('_')) fel = granskaDel(JSON.parse(readFileSync(join(EN_MAPP, bas), 'utf8')), ut, locale);
      else fel = kallor.has(ut.handle) ? granskaProdukt(kallor.get(ut.handle), ut, { locale }) : [`okänd handle ${ut.handle}`];
    } catch (e) { fel = [`kan inte läsas: ${e.message.slice(0, 120)}`]; }
    if (fel.length) { dåliga++; console.log(`❌ ${bas}: ${fel.join(' · ')}`); } else { ok++; console.log(`✅ ${bas}`); }
  }
  console.log(`\n${ok} ✅ · ${dåliga} ❌`);
  return dåliga;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const lx = process.argv.indexOf('--locale');
  if (lx >= 0) {
    const locale = process.argv[lx + 1];
    let namn = process.argv.includes('--filer') ? process.argv.slice(process.argv.indexOf('--filer') + 1).filter((a) => !a.startsWith('--')) : [];
    if (!namn.length && existsSync(join(ROT, locale))) namn = readdirSync(join(ROT, locale)).filter((f) => f.endsWith('.json'));
    process.exit(granskaSprakfiler(locale, namn) ? 1 : 0);
  }
  let filer = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (process.argv.includes('--alla')) filer = readdirSync(join(ROT, 'kalla')).filter((f) => f.startsWith('produkter-') && f.endsWith('.json')).map((f) => join(ROT, 'kalla', f));
  if (!filer.length) { console.error('Ange källfiler eller --alla.'); process.exit(2); }
  const r = granskaFiler(filer);
  const visa = process.argv.includes('--bara-fel') ? r.rader.filter((x) => x.startsWith('❌')) : r.rader;
  for (const rad of visa) console.log(rad);
  console.log(`\n${r.ok} ✅ · ${r.dåliga} ❌`);
  process.exit(r.dåliga ? 1 : 0);
}
