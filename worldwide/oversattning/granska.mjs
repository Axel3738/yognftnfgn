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
export function siffror(s) {
  return [...String(s)
    .replace(/(\d)[\s\u00a0](?=\d{3}\b)/g, '$1')                                          // 72 420 → 72420 (svenskt tusental)
    .replace(/\b(\d{1,3})((?:,\d{3})+)(?![\d,])/g, (m, a, b) => a + b.replace(/,/g, ''))   // 72,420 → 72420 (engelskt tusental)
    .replace(/(\d),(\d)/g, '$1.$2')                                                         // 2,5 → 2.5 (svenskt decimalkomma)
    .matchAll(/\d+(?:\.\d+)?/g)].map((m) => m[0]);
}

/** Dom för en produkt: lista med fel (tom = ✅). */
export function granskaProdukt(kalla, en) {
  const fel = [];
  if (!en) return ['saknar engelsk fil'];
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
  if (/[åäöÅÄÖ]/.test(alla.replace(/Bäver\w*|Göteborg|Malmö|Umeå|Växjö|Örebro|Jönköping/g, ''))) fel.push(`å/ä/ö kvar: "${(alla.match(/[^\s]*[åäöÅÄÖ][^\s]*/) ?? [''])[0]}"`);
  if (svenska.length >= 2) fel.push(`svenska ord kvar: ${[...new Set(svenska)].slice(0, 6).join(', ')}`);
  for (const re of FORBJUDET) if (re.test(alla)) fel.push(`förbjudet: ${re}`);
  // Returlöftet utomlands är 14 dagar (butikens returpolicy, Axels beslut B 2026-09-22) — de 32
  // svenska produktsidornas "30 dagars öppet köp" följer alltså inte med, och 30 ska inte krävas.
  const kalltext = [kalla.title, text(kalla.descriptionHtml)].join(' ').replace(/30\s*dagars\s*(öppet köp|nöjd-kund-garanti)/gi, '14 dagars $1');
  const kallsiffror = siffror(kalltext);
  const ensiffror = new Set(siffror(alla));
  const saknas = [...new Set(kallsiffror)].filter((s) => !ensiffror.has(s));
  if (saknas.length) fel.push(`siffror saknas: ${saknas.slice(0, 8).join(', ')}`);
  for (const o of kalla.options ?? []) {
    const eo = (en.options ?? []).find((x) => x.name === o.name);
    if (!eo || !String(eo.name_en ?? '').trim()) { fel.push(`alternativet "${o.name}" saknas`); continue; }
    const sakn = o.values.filter((v) => !String(eo.values?.[v] ?? '').trim());
    if (sakn.length) fel.push(`alternativvärden saknas i "${o.name}": ${sakn.slice(0, 4).join(', ')}`);
    const kvar = Object.values(eo.values ?? {}).filter((v) => /[åäöÅÄÖ]/.test(v));
    if (kvar.length) fel.push(`svenska alternativvärden: ${kvar.slice(0, 4).join(', ')}`);
  }
  const langd = text(en.descriptionHtml).length / Math.max(1, text(kalla.descriptionHtml).length);
  if (text(kalla.descriptionHtml).length > 200 && (langd < 0.7 || langd > 1.45)) fel.push(`längden ${Math.round(langd * 100)} % av källan`);
  return fel;
}

export function lasEn(handle) {
  const f = join(EN_MAPP, `${handle}.json`);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch (e) { return { handle, _fel: `ogiltig JSON: ${e.message}` }; }
}

export function granskaFiler(filer) {
  let ok = 0, dåliga = 0;
  const rader = [];
  for (const fil of filer) {
    for (const p of JSON.parse(readFileSync(fil, 'utf8'))) {
      const en = lasEn(p.handle);
      const fel = en?._fel ? [en._fel] : granskaProdukt(p, en);
      if (fel.length) { dåliga++; rader.push(`❌ ${p.handle}: ${fel.join(' · ')}`); } else { ok++; rader.push(`✅ ${p.handle}`); }
    }
  }
  return { ok, dåliga, rader };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  let filer = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (process.argv.includes('--alla')) filer = readdirSync(join(ROT, 'kalla')).filter((f) => f.startsWith('produkter-') && f.endsWith('.json')).map((f) => join(ROT, 'kalla', f));
  if (!filer.length) { console.error('Ange källfiler eller --alla.'); process.exit(2); }
  const r = granskaFiler(filer);
  const visa = process.argv.includes('--bara-fel') ? r.rader.filter((x) => x.startsWith('❌')) : r.rader;
  for (const rad of visa) console.log(rad);
  console.log(`\n${r.ok} ✅ · ${r.dåliga} ❌`);
  process.exit(r.dåliga ? 1 : 0);
}
