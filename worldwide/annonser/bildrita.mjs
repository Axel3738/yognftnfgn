// bildrita.mjs — engelsk text i Bäverbutikens bildannonser utan bildmodell: mät → para → sudda → rita.
//
//   node worldwide/annonser/bildrita.mjs                     # torrt: mätning + parning, ingen bild
//   node worldwide/annonser/bildrita.mjs --skarpt            # rita alla, skriv klar/ + media.json
//   node worldwide/annonser/bildrita.mjs --skarpt --bara Batmotor_BF_12_1
//
// Varför inte kie (bilder.mjs): mätt 2026-09-30 på Takoverdrag_CS_2_1 skrev nano-banana-edit
// "23% RABATT – TOAY", lämnade "1469 kr 1129 kr" kvar och blandade "Köp before det tars out".
// Samma lärdom som pipeline/: bildmodellen ritar aldrig text. Här används CaraShells verktyg för
// danska bildannonser (factory/bildmarknad-mat.py mäter med OCR, factory/bildmarknad-rita.py
// suddar skarpt och skriver med samma storlek, vikt och färg) — men texten kommer ur
// bildtext.json (sonnet läste varje bild), inte ur en produktfil, eftersom worldwide har
// flera valutor: priser suddas bort, de räknas aldrig om.
//
// Själva ritningen görs av zonrita.py BLOCK FÖR BLOCK (bildtext.json → "rader" är blocken);
// para() här nedan är den första rad-för-rad-versionen och används bara av testerna.
//
// En bild blir "klar" först när efterkontrollen (OCR igen) inte hittar en enda av källans
// svenska rader och inget belopp i kronor. Resultatet TITTAS på innan det laddas upp
// (media.json → "granskad": true sätts för hand efter granskningen).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ROT = dirname(fileURLToPath(import.meta.url));
const REPO = join(ROT, '..', '..');
const U = JSON.parse(readFileSync(join(ROT, '..', 'urval.json'), 'utf8'));
const lasJson = (f, def) => (existsSync(join(ROT, f)) ? JSON.parse(readFileSync(join(ROT, f), 'utf8')) : def);
const log = (s) => console.log(s);
export const filnamn = (namn) => namn.replace(/[^A-Za-z0-9_.-]+/g, '_');

/** Vikning: gemener, å/ä/ö → a/a/o, bara a–z0–9 (OCR:en läser utan diakriter). */
export const vik = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9%]+/g, '');

/** Likhet 0–1 mellan en OCR-rad och en källrad: gemensamma tecken-bigram (tål OCR-fel). */
export function likhet(a, b) {
  const bi = (s) => { const v = vik(s); const m = new Map(); for (let i = 0; i < v.length - 1; i++) { const k = v.slice(i, i + 2); m.set(k, (m.get(k) ?? 0) + 1); } return m; };
  const x = bi(a), y = bi(b);
  let gem = 0, nx = 0, ny = 0;
  for (const [k, n] of x) { nx += n; gem += Math.min(n, y.get(k) ?? 0); }
  for (const n of y.values()) ny += n;
  return nx + ny ? (2 * gem) / (nx + ny) : 0;
}

/** Ingår OCR-raden i källraden (en rad kan brytas i flera OCR-rader)? */
export const ingarI = (ocr, rad) => { const o = vik(ocr); return o.length >= 3 && vik(rad).includes(o); };

const SVENSKA = /\b(och|att|för|med|på|till|från|din|ditt|nu|idag|köp|fri|frakt|dagar|dagars|kr|kronor|rabatt|lager|beställ|spara|ord|ingen|inga|enkel|vi|det|den|som|är|inte|slut|handla|storlek|motor)\b|[åäö]/i;
export const arSvensk = (t) => SVENSKA.test(String(t)) || /\d\s?kr\b/i.test(String(t));

/**
 * Parar mätningens rader med bildtextens rader.
 * Returnerar { atgarder: [{i, text, ny}], orada: [text] } — en källrad som OCR bröt i N rader
 * får sin engelska delad på N rader (ord för ord, i proportion till radernas längd).
 */
export function para(matRader, textRader) {
  const tilldelning = new Map(); // textradens index → [matradsindex…]
  const orada = [];
  for (const r of matRader) {
    let bast = -1, poang = 0;
    textRader.forEach((t, j) => {
      const p = ingarI(r.text, t.sv) ? 1 + vik(r.text).length / 1000 : likhet(r.text, t.sv);
      if (p > poang) { poang = p; bast = j; }
    });
    if (bast >= 0 && poang >= 0.55) {
      if (!tilldelning.has(bast)) tilldelning.set(bast, []);
      tilldelning.get(bast).push(r);
    } else orada.push(r);
  }
  const atgarder = [];
  for (const [j, rader] of tilldelning) {
    const en = textRader[j].en ?? '';
    if (rader.length === 1 || !en) { for (const [k, r] of rader.entries()) atgarder.push({ i: r.i, text: r.text, ny: k === 0 ? en : '' }); continue; }
    const ord = en.split(/\s+/);
    const vikt = rader.map((r) => Math.max(1, vik(r.text).length));
    const summa = vikt.reduce((s, v) => s + v, 0);
    let pos = 0;
    rader.forEach((r, k) => {
      const n = k === rader.length - 1 ? ord.length - pos : Math.max(1, Math.round((vikt[k] / summa) * ord.length));
      atgarder.push({ i: r.i, text: r.text, ny: ord.slice(pos, pos + n).join(' ') });
      pos += n;
    });
  }
  return { atgarder: atgarder.sort((a, b) => a.i - b.i), orada };
}

function mat(fil) {
  const r = spawnSync('python3', [join(REPO, 'factory/bildmarknad-mat.py'), fil, '--konf=0.45', '--pad=6'], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`bildmarknad-mat.py: ${String(r.stderr).slice(-400)}`);
  return JSON.parse(r.stdout);
}

async function huvud() {
  const a = process.argv.slice(2);
  const skarpt = a.includes('--skarpt');
  const bara = a.includes('--bara') ? a[a.indexOf('--bara') + 1] : null;
  const kallor = a.includes('--kallor') ? a[a.indexOf('--kallor') + 1] : join(ROT, 'kallor');
  const texter = lasJson('bildtext.json', {});
  const media = lasJson('media.json', {});
  const spara = () => writeFileSync(join(ROT, 'media.json'), JSON.stringify(media, null, 1));
  const ut = join(ROT, 'klar');
  mkdirSync(ut, { recursive: true });
  const bilder = U.produkter.filter((p) => !p.under).flatMap((p) => p.annonser.filter((x) => x.typ === 'bild'));
  let klara = 0, fel = 0;
  for (const b of bilder) {
    if (bara && b.namn !== bara) continue;
    const t = texter[b.namn];
    if (!t) { log(`· ${b.namn}: ingen rad i bildtext.json`); continue; }
    if (t.hoppa) { media[b.namn] = { hoppa: t.hoppa }; continue; }
    const kalla = join(kallor, `${filnamn(b.namn)}.jpg`);
    if (!existsSync(kalla)) { log(`⚠️ ${b.namn}: källan saknas (${kalla})`); continue; }
    const slut = join(ut, `${filnamn(b.namn)}.jpg`);
    if (!t.rader.length) {
      if (skarpt) { writeFileSync(slut, readFileSync(kalla)); media[b.namn] = { fil: slut.slice(REPO.length + 1), sha256: createHash('sha256').update(readFileSync(slut)).digest('hex'), granskad: true, utan_text: true }; spara(); }
      log(`✓ ${b.namn}: ingen text — används som den är`);
      klara++;
      continue;
    }
    const radfil = `${slut}.rader.json`;
    writeFileSync(radfil, JSON.stringify(t.rader));
    if (!skarpt) { log(`torrt: ${b.namn} — ${t.rader.length} block`); continue; }
    const r = spawnSync('python3', [join(ROT, 'zonrita.py'), kalla, slut, radfil], { encoding: 'utf8', maxBuffer: 1 << 26 });
    if (r.status !== 0) { log(`❌ ${b.namn}: zonrita.py ${String(r.stderr).slice(-300)}`); fel++; continue; }
    const res = JSON.parse(r.stdout);
    const ejHittade = res.block.filter((x) => x.hittad === false);
    if (ejHittade.length) log(`   ⚠️ block som inte hittades i bilden: ${ejHittade.map((x) => JSON.stringify(x.sv)).join(', ')}`);
    const kvarSvensk = res.oparade.filter((x) => arSvensk(x));
    log(`\n${b.namn}: ${res.block.length} block${ejHittade.length ? `, ${ejHittade.length} hittades inte i bilden` : ''}${res.oparade.length ? `, oparade OCR-rader: ${res.oparade.map((x) => JSON.stringify(x)).join(', ')}` : ''}`);
    for (const x of res.block) log(`   ${JSON.stringify(x.sv).slice(0, 60)} → ${x.en ? JSON.stringify(x.en).slice(0, 60) : (x.hittad === false ? 'HITTADES INTE' : 'SUDDAS')}`);
    const hoppade = [];
    const efter = mat(slut);
    const kvar = efter.rader.filter((r2) => arSvensk(r2.text) && t.rader.some((tr) => likhet(r2.text, tr.sv) >= 0.6 || ingarI(r2.text, tr.sv)));
    const kronor = efter.rader.filter((r2) => /\d\s?kr\b|kronor/i.test(r2.text));
    const ok = !hoppade.length && !kvar.length && !kronor.length && !kvarSvensk.length;
    log(`   efterkontroll: ${ok ? '✅ ren' : `❌ ${[hoppade.length && `${hoppade.length} rader gick inte att sudda`, kvar.length && `svenska kvar: ${kvar.map((x) => x.text).join(' | ')}`, kronor.length && `kronor kvar: ${kronor.map((x) => x.text).join(' | ')}`, kvarSvensk.length && 'oparade svenska rader'].filter(Boolean).join(' · ')}`}`);
    media[b.namn] = { fil: slut.slice(REPO.length + 1), sha256: createHash('sha256').update(readFileSync(slut)).digest('hex'), granskad: false, efterkontroll: ok ? 'ren' : 'svenska kvar', oparade: res.oparade };
    spara();
    ok ? klara++ : fel++;
  }
  log(`\n${klara} klara, ${fel} med fel`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}
