#!/usr/bin/env node
/* ==========================================================================
   analys.mjs — läser av ett A/B-test och ger ett beslut.

   Två sätt att köra:

   1. PLANERA — innan testet startar. Hur länge måste det rulla?
        node ab/analys.mjs --planera --baslinje 0.054 --mde 0.2 --trafik 820

   2. LÄSA AV — när testet rullat.
        node ab/analys.mjs --test buybox --ordrar ordrar.json
        node ab/analys.mjs --test buybox --a 118 --b 143
        node ab/analys.mjs --test buybox --a 118 --b 143 --besokare-a 4900 --besokare-b 4950

   Filen ordrar.json är en lista med ordrar hämtade ur Shopify:
     [ { "name": "#1042", "totalPrice": 399, "attributes": { "AB buybox": "b" } } ]

   Kan du inte exportera filen själv: be Claude köra /abtest, då hämtas den
   direkt ur Shopify och läses av i samma steg.
   ========================================================================== */

import fs from 'node:fs';
import {
  proportionTest, splitTest, aovTest, sampleSize, testLength, verdict
} from './statistik.mjs';

/* --- argument ------------------------------------------------------------ */

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const num = (v, fallback) => {
  if (v === undefined || v === true) return fallback;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
};

/* --- utskrift ------------------------------------------------------------ */

const kr = (n) => n.toLocaleString('sv-SE', { maximumFractionDigits: 0 }) + ' kr';
const pct = (n, d = 1) => (n * 100).toFixed(d).replace('.', ',') + ' %';
const rule = (t) => console.log('\n' + t + '\n' + '─'.repeat(Math.max(20, t.length)));

/* --- läge 1: planera ----------------------------------------------------- */

if (args.planera) {
  const baslinje = num(args.baslinje, 0.05);
  const trafik = num(args.trafik ?? args['trafik-per-dag'], 0);

  rule('Planering av A/B-test');
  console.log(`Nuvarande konvertering : ${pct(baslinje, 2)}`);
  console.log(`Trafik per dag         : ${trafik ? Math.round(trafik) + ' besökare' : 'okänd'}`);
  console.log('\nHur länge testet måste rulla, per storlek på förbättringen:\n');
  console.log('  Lyft   Per variant    Totalt   Dagar');
  console.log('  ' + '─'.repeat(42));

  for (const mde of [0.05, 0.1, 0.15, 0.2, 0.3, 0.5]) {
    let r;
    try { r = testLength({ baseline: baslinje, mde, visitorsPerDay: trafik }); }
    catch { continue; }
    const dagar = r.days === Infinity ? '—' : String(r.days);
    const varning = r.days > 42 ? '  ← för långt' : (r.days <= 21 ? '  ← rimligt' : '');
    console.log(
      '  ' + ('+' + Math.round(mde * 100) + ' %').padEnd(7) +
      String(r.perVariant).padStart(10) + '  ' +
      String(r.total).padStart(8) + '  ' +
      dagar.padStart(6) + varning
    );
  }
  console.log('\nTumregel: ett test som tar över sex veckor hinner störas av');
  console.log('säsong, kampanjer och prisändringar. Testa då något större i stället.');
  process.exit(0);
}

/* --- läge 2: läsa av ----------------------------------------------------- */

const testId = args.test === true || !args.test ? null : String(args.test);
if (!testId) {
  console.error('Ange vilket test som ska läsas av: --test <id>');
  console.error('Eller planera ett nytt: --planera --baslinje 0.054 --trafik 820');
  process.exit(2);
}

let aOrders = num(args.a, null);
let bOrders = num(args.b, null);
let aValues = [], bValues = [];
let uteslutna = 0;

if (args.ordrar) {
  const file = String(args.ordrar);
  if (!fs.existsSync(file)) {
    console.error(`Hittar inte filen ${file}`);
    process.exit(2);
  }
  let rows;
  try { rows = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.error(`Kan inte läsa ${file}: ${e.message}`); process.exit(2); }
  if (!Array.isArray(rows)) { console.error('Filen ska innehålla en lista med ordrar.'); process.exit(2); }

  const key = 'AB ' + testId;
  aValues = []; bValues = [];
  for (const o of rows) {
    const attrs = o.attributes || o.customAttributes || {};
    // Tillåt både { "AB x": "b" } och [{ key, value }].
    const flat = Array.isArray(attrs)
      ? Object.fromEntries(attrs.map(x => [x.key, x.value]))
      : attrs;
    const v = flat[key];
    if (v !== 'a' && v !== 'b') continue;
    // Besök där varianten tvingats fram via länk är inte slumpmässiga.
    if (flat[key + ' forced'] === 'ja') { uteslutna++; continue; }
    const value = Number(o.totalPrice ?? o.total ?? 0);
    (v === 'a' ? aValues : bValues).push(value);
  }
  aOrders = aValues.length;
  bOrders = bValues.length;
}

if (aOrders === null || bOrders === null) {
  console.error('Ange antingen --ordrar <fil.json> eller --a <antal> --b <antal>.');
  process.exit(2);
}

const besA = num(args['besokare-a'], null);
const besB = num(args['besokare-b'], null);
const harExponering = besA !== null && besB !== null && besA > 0 && besB > 0;

const res = harExponering
  ? proportionTest({ aConversions: aOrders, aVisitors: besA, bConversions: bOrders, bVisitors: besB })
  : splitTest({ aOrders, bOrders });

/* Två separata frågor, som inte får blandas ihop:
     a) Räcker antalet KÖP för att testet överhuvudtaget ska gälla?
     b) Räcker antalet BESÖKARE för att ett oavgjort resultat ska betyda något?  */

const MIN_KOP_PER_VARIANT = 25;
const observedOutcomes = Math.min(aOrders, bOrders);
const enoughData = observedOutcomes >= MIN_KOP_PER_VARIANT;

const baslinje = harExponering ? (aOrders / besA) : num(args.baslinje, 0.05);
const mde = num(args.mde, 0.2);

let minSample = null;
let observed = harExponering ? Math.min(besA, besB) : null;
let powerReached = true;
try {
  minSample = sampleSize({ baseline: baslinje, mde });
  if (harExponering) powerReached = observed >= minSample;
  else powerReached = observedOutcomes >= MIN_KOP_PER_VARIANT * 4;
} catch { minSample = null; }

const dom = verdict({
  p: res.p,
  relativtLyft: res.relativtLyft,
  enoughData, powerReached,
  minOutcomes: MIN_KOP_PER_VARIANT, observedOutcomes,
  minSample, observed,
  enhet: harExponering ? 'besökare' : 'köp'
});

/* --- rapport ------------------------------------------------------------- */

rule(`A/B-test: ${testId}`);
console.log(`Metod                  : ${res.metod}`);
if (uteslutna) console.log(`Uteslutna (tvingad variant): ${uteslutna} ordrar`);
console.log('');
console.log('              Variant A     Variant B');
console.log('  ' + '─'.repeat(40));
console.log(`  Ordrar   ${String(aOrders).padStart(12)}${String(bOrders).padStart(14)}`);
if (harExponering) {
  console.log(`  Besökare ${String(besA).padStart(12)}${String(besB).padStart(14)}`);
  console.log(`  Konv.    ${pct(res.aRate, 2).padStart(12)}${pct(res.bRate, 2).padStart(14)}`);
}
if (aValues.length && bValues.length) {
  const sum = (xs) => xs.reduce((s, v) => s + v, 0);
  const aov = aovTest(aValues, bValues);
  console.log(`  Intäkt   ${kr(sum(aValues)).padStart(12)}${kr(sum(bValues)).padStart(14)}`);
  if (aov.tillräckligt) {
    console.log(`  Snittorder${kr(aov.aAov).padStart(11)}${kr(aov.bAov).padStart(14)}`);
    console.log(`\n  Skillnad i snittordervärde: ${kr(aov.skillnad)} (p = ${aov.p.toFixed(3)})`);
    if (aov.p > 0.05) console.log('  → ingen säkerställd skillnad i ordervärde.');
  }
}

console.log('');
if (res.relativtLyft !== null) {
  console.log(`  Lyft B mot A : ${res.relativtLyft >= 0 ? '+' : ''}${pct(res.relativtLyft)}`);
}
console.log(`  p-värde      : ${res.p.toFixed(4)}`);
console.log(`  Konfidens    : ${pct(res.konfidens, 1)}`);
if (res.intervall) {
  console.log(`  95 %-intervall för skillnaden: ${pct(res.intervall[0], 2)} till ${pct(res.intervall[1], 2)}`);
}

rule('Beslut');
console.log('  ' + dom.text);

if (minSample && harExponering) {
  console.log('');
  console.log(`  För att kunna utesluta ett lyft på +${Math.round(mde * 100)} % krävs`);
  console.log(`  ${minSample} besökare per variant. Du har ${observed}.`);
}
if (dom.beslut === 'b vinner' || dom.beslut === 'a vinner') {
  console.log('');
  console.log('  Obs: har du kikat på siffrorna flera gånger under testets gång ökar');
  console.log('  risken för falsklarm. Bekräfta gärna genom att låta det rulla');
  console.log('  ytterligare några dagar innan du publicerar.');
}
console.log('');
