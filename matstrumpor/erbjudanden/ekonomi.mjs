#!/usr/bin/env node
// erbjudanden/ekonomi.mjs — räknemotorn för Matstrumpors ERBJUDANDEN: vad en
// order ger i täckningsbidrag beroende på hur många lådor kunden tar, till vilket
// pris, och vilket upsell som ligger i samma paket.
//
// Ren räknelogik. Inga nätanrop, inga sidoeffekter. Talen läses ur
// matstrumpor/konfig.json och matstrumpor/cogs.json vid körning — aldrig ur
// minnet, aldrig inbrända här. Momslinjen räknas av `linje()` i
// matstrumpor/ekonomi.mjs, samma funktion som ronden använder.
//
//   node matstrumpor/erbjudanden/ekonomi.mjs                              båda kostnadslägena, kortavgift 0
//   node matstrumpor/erbjudanden/ekonomi.mjs --kostnad shopify --kortavgift 0.02
//   node matstrumpor/erbjudanden/ekonomi.mjs --moms --eur-sek 11.3 --frakt-kostnad 0 --json
//
// TVÅ kostnadsavläsningar som inte stämmer överens. Båda räknas, ingen väljs:
//   konfig   ekonomi.kostnad_per_order_sek = inköp för 2 lådor (Axel 2026-09-21;
//            kommentaren i konfigen bär talet för 1 låda) + tull_eur × eur_sek per paket.
//   shopify  cogs.json sverige.kostnad per låda LANDAD (Shopifys Cost per item,
//            2026-09-27) + samma tull per PAKET — tullen dras en gång per order,
//            aldrig per låda.
// Vilken som gäller är Axels fråga. Kortavgift och frakt till kund är INTE mätta:
// de är parametrar med standard 0, och utskriften säger det rakt ut.
//
//   intäkt brutto  = pris + fraktintäkt                (det Meta ser som ROAS-underlag)
//   kostnad        = varukostnad + tull + kortavgift + fraktkostnad
//   tb             = intäkt (utan momsen om --moms) − kostnad
//   break-even-ROAS = brutto / tb · break-even-CPA = tb

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { linje, MOMSSATS } from '../ekonomi.mjs';
import { lasCogs, COGS_FIL } from '../cogs.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
export const KONFIG_FIL = join(ROT, '..', 'konfig.json');
export const lasKonfig = (fil = KONFIG_FIL) => JSON.parse(readFileSync(fil, 'utf8'));
export { COGS_FIL, lasCogs };

export const LAGEN = ['konfig', 'shopify'];
export const STANDARD_VARIANT = 'sushi-5';
/** Standardordern är 2 lådor — konfigens tal är definierat för den. */
export const STANDARD_LADOR = 2;

const round2 = (v) => Math.round(v * 100) / 100;
const round3 = (v) => Math.round(v * 1000) / 1000;
const tal = (v) => (Number.isFinite(Number(v)) ? Number(v) : NaN);

// ---------------------------------------------------------------------------
// Scenarierna är DATA. Ett nytt erbjudande = en rad till. `lador` är antalet
// lådor i paketet, `prisTotalt` det kunden betalar för varorna, `fraktIntakt`
// det kunden betalar för frakten (0 = fri frakt). Ett paket = en tull.
// Priserna är butikens 2026-09-30: 5-pack 399 kr, 3-pack 369 kr; koderna
// SUSHI-K1F1 (2 lådor 399) och SUSHI-K2F2 (4 lådor 798).
// ---------------------------------------------------------------------------
export const SCENARIER = [
  { namn: '2 lådor 399 kr (Köp 1 – få 1)', baslinje: true, lador: 2, prisTotalt: 399, variant: 'sushi-5', kod: 'SUSHI-K1F1' },
  { namn: '1 låda 399 kr', lador: 1, prisTotalt: 399, variant: 'sushi-5', not: 'kunden köper utan kod' },
  { namn: '2 × 3-pack 369 kr', lador: 2, prisTotalt: 369, variant: 'sushi-3', kod: 'SUSHI-K1F1' },
  { namn: '4 lådor 798 kr (Köp 2 – få 2)', lador: 4, prisTotalt: 798, variant: 'sushi-5', kod: 'SUSHI-K2F2', not: 'ett paket, en tull' },
  { namn: '2 lådor + post-purchase 2 lådor 319 kr (samma paket)', lador: 4, prisTotalt: 718, variant: 'sushi-5', upsell: 'pp319', not: '4 lådor 718 kr, en tull' },
  { namn: '2 lådor + post-purchase 2 lådor 279 kr (samma paket)', lador: 4, prisTotalt: 678, variant: 'sushi-5', upsell: 'pp279', not: '4 lådor 678 kr, en tull' },
  { namn: '2 lådor 399 kr + frakt 29 kr', lador: 2, prisTotalt: 399, fraktIntakt: 29, variant: 'sushi-5' },
  { namn: '4 lådor 798 kr, fri frakt', lador: 4, prisTotalt: 798, variant: 'sushi-5', not: 'samma tal som Köp 2 – få 2 tills fraktkostnaden är mätt — raden finns för att ställas mot "+ frakt 29 kr"' },
];

// ---------------------------------------------------------------------------
// Kostnadsläge: var talen kommer ifrån.
// ---------------------------------------------------------------------------

/** "80,61 kr för 1 par" ur konfigens kostnad_comment — talet står bara där.
 *  null när kommentaren inte bär det; då gissas inget. */
export function enLadaUrKommentar(kommentar) {
  const m = String(kommentar ?? '').match(/(\d+(?:[.,]\d+)?)\s*kr\s+för\s+1\s+(?:par|låda)/i);
  return m ? Number(m[1].replace(',', '.')) : null;
}

/** Datumet kursen bär, ur konfigens eur_sek_comment (YYYY-MM-DD). null om det saknas. */
export function kursDatum(konfig) {
  const m = String(konfig?.ekonomi?.eur_sek_comment ?? '').match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : null;
}

/**
 * kostnadsLage('konfig' | 'shopify', { konfig, cogs, eurSek })
 * → { namn, perLada(variant, lador), lada(variant, lador), tullPerPaket, kurs, kalla }
 *
 * `perLada` ger ett tal eller kastar med orsak; `lada` ger { perLada, kalla } eller
 * { saknas } — scenarier() använder den senare så att en rad utan kostnad blir
 * "—" med orsak, aldrig en nolla.
 */
export function kostnadsLage(namn, { konfig = lasKonfig(), cogs = lasCogs(), eurSek = null } = {}) {
  if (!LAGEN.includes(namn)) throw new Error(`Okänt kostnadsläge "${namn}" — ett av ${LAGEN.join(' | ')}.`);
  const e = konfig?.ekonomi ?? {};
  const kursAngiven = eurSek !== null && eurSek !== undefined && eurSek !== '';
  const kurs = kursAngiven ? tal(eurSek) : tal(e.eur_sek);
  if (!(kurs > 0)) throw new Error(kursAngiven ? `--eur-sek "${eurSek}" är inget tal.` : 'ekonomi.eur_sek saknas i konfig.json — hämta kursen, gissa aldrig.');
  const tullEur = tal(e.tull_eur ?? 0);
  if (!Number.isFinite(tullEur)) throw new Error('ekonomi.tull_eur i konfig.json är inget tal.');
  const tullPerPaket = round2(tullEur * kurs);
  const kursInfo = kursAngiven
    ? { eur_sek: kurs, datum: null, kalla: '--eur-sek på kommandoraden (datum okänt — skriv det i svaret)' }
    : { eur_sek: kurs, datum: kursDatum(konfig), kalla: `konfig.json (${kursDatum(konfig) ? `ECB ${kursDatum(konfig)}` : 'datum saknas i eur_sek_comment'})` };
  const tullKalla = `tull ${tullEur} EUR × ${kurs} = ${tullPerPaket} kr per paket`;

  let lada;
  let kalla;
  if (namn === 'konfig') {
    const perOrder = tal(e.kostnad_per_order_sek);
    if (!Number.isFinite(perOrder)) throw new Error('ekonomi.kostnad_per_order_sek saknas i konfig.json.');
    const enLada = enLadaUrKommentar(e.kostnad_comment);
    kalla = `konfig.json ekonomi.kostnad_per_order_sek ${perOrder} kr för ${STANDARD_LADOR} lådor (inköp, Axel 2026-09-21)${enLada !== null ? `, ${enLada} kr för 1 låda enligt kommentaren` : ''}; ${tullKalla}`;
    lada = (variant = STANDARD_VARIANT, lador = STANDARD_LADOR) => {
      if (variant !== STANDARD_VARIANT) return { saknas: `konfigen har bara ett tal (${perOrder} kr för ${STANDARD_LADOR} lådor) och skiljer inte ${variant} från ${STANDARD_VARIANT}` };
      if (Number(lador) === 1 && enLada !== null) return { perLada: enLada, kalla: `${enLada} kr för 1 låda (konfigens kommentar)` };
      return { perLada: round2(perOrder / STANDARD_LADOR), kalla: `${perOrder} kr för ${STANDARD_LADOR} lådor ÷ ${STANDARD_LADOR} = ${round2(perOrder / STANDARD_LADOR)} kr per låda${Number(lador) === 1 ? ' (kommentaren bär inget tal för 1 låda — linjärt)' : ''}` };
    };
  } else {
    const sv = cogs?.sverige ?? {};
    kalla = `cogs.json sverige.kostnad (Shopifys Cost per item, landad, mätt ${cogs?.matt ?? 'okänt datum'}); ${tullKalla}`;
    lada = (variant = STANDARD_VARIANT) => {
      const k = sv.kostnad?.[variant];
      if (k === null || k === undefined) return { saknas: `${variant}: ${k === null ? sv.saknas_orsak ?? 'Cost per item saknas i Shopify' : 'finns inte i cogs.json sverige.kostnad'}` };
      return { perLada: Number(k), kalla: `Cost per item ${k} kr per låda (cogs.json ${cogs?.matt ?? ''})` };
    };
  }

  const perLada = (variant = STANDARD_VARIANT, lador = STANDARD_LADOR) => {
    const l = lada(variant, lador);
    if (l.saknas) throw new Error(`Kostnad saknas i läget ${namn}: ${l.saknas}`);
    return l.perLada;
  };
  return { namn, perLada, lada, tullPerPaket, kurs: kursInfo, kalla };
}

// ---------------------------------------------------------------------------
// En order.
// ---------------------------------------------------------------------------

/**
 * orderEkonomi({ lador, prisTotalt, perLada, tullPerPaket, fraktIntakt, fraktKostnad, kortavgiftAndel, moms })
 * → { lador, intaktBrutto, intakt, varukostnad, tull, kortavgift, fraktKostnad, fraktIntakt,
 *     kostnad, tb, beRoas, beCpa, moms, varning }
 *
 * Ren. Kortavgiften dras på det kunden betalar (brutto, inklusive frakt).
 * Momsen dras ur intäkten som matstrumpor/ekonomi.mjs gör (linje). Tullen är
 * per PAKET — en order, en tull — oavsett antal lådor.
 */
export function orderEkonomi({ lador, prisTotalt, perLada, tullPerPaket, fraktIntakt = 0, fraktKostnad = 0, kortavgiftAndel = 0, moms = false }) {
  const n = tal(lador);
  const pris = tal(prisTotalt);
  const pl = tal(perLada);
  const tull = tal(tullPerPaket);
  if (!(n >= 1)) throw new Error(`lador måste vara ≥ 1 (fick ${lador}).`);
  if (!(pris >= 0)) throw new Error(`prisTotalt måste vara ett tal ≥ 0 (fick ${prisTotalt}).`);
  if (!Number.isFinite(pl)) throw new Error(`perLada måste vara ett tal (fick ${perLada}).`);
  if (!Number.isFinite(tull)) throw new Error(`tullPerPaket måste vara ett tal (fick ${tullPerPaket}).`);
  const fi = tal(fraktIntakt) || 0;
  const fk = tal(fraktKostnad) || 0;
  const ka = tal(kortavgiftAndel) || 0;
  if (ka < 0 || ka >= 1) throw new Error(`kortavgiftAndel ska vara en andel 0–1 (fick ${kortavgiftAndel}).`);

  const brutto = round2(pris + fi);
  const varukostnad = round2(pl * n);
  const kortavgift = round2(ka * brutto);
  const kostnad = round2(varukostnad + tull + kortavgift + fk);
  const l = linje(brutto, kostnad, Boolean(moms));
  return {
    lador: n,
    intaktBrutto: brutto,
    intakt: l.intakt,
    varukostnad,
    tull: round2(tull),
    kortavgift,
    fraktKostnad: round2(fk),
    fraktIntakt: round2(fi),
    kostnad,
    tb: l.tackningsbidrag,
    beRoas: l.break_even_roas,
    beCpa: l.break_even_cpa_sek,
    moms: Boolean(moms),
    ...(l.varning ? { varning: l.varning } : {}),
  };
}

// ---------------------------------------------------------------------------
// Scenarierna mot ett kostnadsläge.
// ---------------------------------------------------------------------------

/**
 * scenarier(lage, { kortavgiftAndel, fraktKostnad, moms, lista })
 * → [ { ...scenario, ekonomi, diff: { tb, beRoas, beCpa } } | { ...scenario, saknas } ]
 * Baslinjen ligger alltid först; diff är mot den (baslinjens egen diff är 0).
 */
export function scenarier(lage, { kortavgiftAndel = 0, fraktKostnad = 0, moms = false, lista = SCENARIER } = {}) {
  const bas = lista.find((s) => s.baslinje);
  if (!bas) throw new Error('Scenariolistan saknar en baslinje (baslinje: true).');
  const ordnade = [bas, ...lista.filter((s) => s !== bas)];
  const rakna = (s) => {
    const k = lage.lada(s.variant ?? STANDARD_VARIANT, s.lador);
    if (k.saknas) return { ...s, saknas: k.saknas };
    const ekonomi = orderEkonomi({ lador: s.lador, prisTotalt: s.prisTotalt, perLada: k.perLada, tullPerPaket: lage.tullPerPaket, fraktIntakt: s.fraktIntakt ?? 0, fraktKostnad, kortavgiftAndel, moms });
    return { ...s, kostnadKalla: k.kalla, ekonomi };
  };
  const rader = ordnade.map(rakna);
  const basRad = rader[0];
  for (const r of rader) {
    if (r.saknas || basRad.saknas) { r.diff = null; continue; }
    const d = (f) => (r.ekonomi[f] === null || basRad.ekonomi[f] === null ? null : round2(r.ekonomi[f] - basRad.ekonomi[f]));
    r.diff = { tb: d('tb'), beCpa: d('beCpa'), beRoas: r.ekonomi.beRoas === null || basRad.ekonomi.beRoas === null ? null : round3(r.ekonomi.beRoas - basRad.ekonomi.beRoas) };
  }
  return rader;
}

// ---------------------------------------------------------------------------
// Blandade ordrar: en andel tar ett upsell.
// ---------------------------------------------------------------------------

/**
 * Förväntat täckningsbidrag per order när andelen `andelUpsell` (0–1) tar upsellet:
 *   tb_bas + andel × (tb_upsell − tb_bas)
 * Tar tal (`tbBas`, `tbUpsell`) eller orderEkonomi-resultat (`bas`, `upsell`).
 */
export function blandad({ andelUpsell, tbBas, tbUpsell, bas, upsell }) {
  const a = tal(andelUpsell);
  if (!(a >= 0 && a <= 1)) throw new Error(`andelUpsell ska vara 0–1 (fick ${andelUpsell}).`);
  const b = Number.isFinite(tal(tbBas)) ? tal(tbBas) : tal(bas?.tb);
  const u = Number.isFinite(tal(tbUpsell)) ? tal(tbUpsell) : tal(upsell?.tb);
  if (!Number.isFinite(b) || !Number.isFinite(u)) throw new Error('blandad() behöver tbBas och tbUpsell (eller bas/upsell ur orderEkonomi).');
  return round2(b + a * (u - b));
}

/**
 * Vid vilken take-rate-SKILLNAD är upsell B bättre än upsell A?
 * Returnerar faktorn B:s take-rate måste vara gånger A:s:
 *   B bättre ⟺ andel_B × (tbB − tbBas) > andel_A × (tbA − tbBas)
 *   ⟺ andel_B / andel_A > (tbA − tbBas) / (tbB − tbBas)
 * 1,25 betyder "B måste tas av minst 25 % fler än A". 0 = B är alltid bättre
 * (A ger inget lyft), Infinity = B kan aldrig bli bättre (B ger inget lyft).
 */
export function brytpunktAndel(tbBas, tbUpsellA, tbUpsellB) {
  const b = tal(tbBas);
  const a = tal(tbUpsellA);
  const c = tal(tbUpsellB);
  if (![b, a, c].every(Number.isFinite)) throw new Error('brytpunktAndel() behöver tre tal.');
  const lyftA = a - b;
  const lyftB = c - b;
  if (lyftB <= 0) return lyftA <= 0 ? 1 : Infinity;
  if (lyftA <= 0) return 0;
  return round3(lyftA / lyftB);
}

// ---------------------------------------------------------------------------
// Hela körningen som data (det CLI:n skriver ut och --json ger).
// ---------------------------------------------------------------------------

export function rakna({ kostnad = 'bada', kortavgiftAndel = 0, fraktKostnad = 0, moms = false, eurSek = null, konfig = lasKonfig(), cogs = lasCogs() } = {}) {
  const namn = kostnad === 'bada' ? LAGEN : [kostnad];
  const lagen = namn.map((n) => {
    const lage = kostnadsLage(n, { konfig, cogs, eurSek });
    const rader = scenarier(lage, { kortavgiftAndel, fraktKostnad, moms });
    const bas = rader[0];
    const ppA = rader.find((r) => r.upsell === 'pp319');
    const ppB = rader.find((r) => r.upsell === 'pp279');
    const brytpunkt = bas.ekonomi && ppA?.ekonomi && ppB?.ekonomi
      ? { a: ppA.namn, b: ppB.namn, lyftA: round2(ppA.ekonomi.tb - bas.ekonomi.tb), lyftB: round2(ppB.ekonomi.tb - bas.ekonomi.tb), faktor: brytpunktAndel(bas.ekonomi.tb, ppA.ekonomi.tb, ppB.ekonomi.tb) }
      : null;
    const standard = lage.lada(STANDARD_VARIANT, STANDARD_LADOR);
    return { namn: n, kalla: lage.kalla, perLada: standard.saknas ? null : standard.perLada, perLadaKalla: standard.saknas ?? standard.kalla, tullPerPaket: lage.tullPerPaket, kurs: lage.kurs, scenarier: rader, brytpunkt };
  });
  const bas = lagen.map((l) => l.scenarier[0]?.ekonomi?.tb ?? null);
  const skiljer = lagen.length === 2 && bas[0] !== null && bas[1] !== null && bas[0] !== bas[1];
  return {
    matt: { konfig: konfig?.ekonomi?.kostnad_comment ? '2026-09-21 (konfig.json)' : null, cogs: cogs?.matt ?? null },
    parametrar: {
      kortavgiftAndel, kortavgift: kortavgiftAndel ? `${round2(kortavgiftAndel * 100)} % av det kunden betalar` : 'inte mätt, 0 %',
      fraktKostnad, frakt: fraktKostnad ? `${fraktKostnad} kr per paket` : 'inte mätt, 0 kr',
      moms: Boolean(moms), momsKonfig: konfig?.ekonomi?.moms_antagen ?? null, momssats: MOMSSATS,
    },
    varning: skiljer
      ? `De två kostnadsavläsningarna skiljer sig: konfig ger ${bas[0]} kr i täckningsbidrag på baslinjen, Shopify ${bas[1]} kr (${round2(bas[0] - bas[1])} kr isär). Vilken som gäller är Axels fråga — ingen av dem väljs här.`
      : null,
    lagen,
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const f2 = (v) => (v === null || v === undefined ? '—' : Number(v).toFixed(2));
const f3 = (v) => (v === null || v === undefined ? '—' : Number(v).toFixed(3));
const fd = (v, dec = 2) => (v === null || v === undefined ? '—' : `${v > 0 ? '+' : ''}${Number(v).toFixed(dec)}`);

export function tabell(resultat) {
  const ut = [];
  const p = resultat.parametrar;
  const kurs = resultat.lagen[0]?.kurs;
  if (resultat.varning) ut.push(`⚠️  ${resultat.varning}`);
  for (const l of resultat.lagen) ut.push(`   ${l.namn.padEnd(8)} ${l.perLada === null ? `— (${l.perLadaKalla})` : `${f2(l.perLada)} kr per låda`} · ${l.kalla}`);
  ut.push(`Kurs EUR→SEK ${kurs?.eur_sek} — ${kurs?.kalla}. Moms: ${p.moms ? 'MED (dras ur intäkten)' : 'UTAN'}${p.momsKonfig === false ? ' — konfigens moms_antagen är false (Axel: utan moms)' : p.momsKonfig === true ? ' — konfigens moms_antagen är true' : ''}.`);
  ut.push(`Kortavgift: ${p.kortavgift} · frakt till kund: ${p.frakt}. Ingen av dem är mätt — talen är i bästa fall tills de är det.`);
  ut.push('');
  const bredd = Math.max(...SCENARIER.map((s) => s.namn.length)) + 12;
  const rubrik = `${'Scenario'.padEnd(bredd)} ${'läge'.padEnd(8)} ${'intäkt'.padStart(8)} ${'varukost'.padStart(9)} ${'tull'.padStart(6)} ${'kort'.padStart(6)} ${'frakt'.padStart(6)} ${'kostnad'.padStart(8)} ${'tb'.padStart(8)} ${'BE-ROAS'.padStart(8)} ${'BE-CPA'.padStart(8)} ${'Δ tb'.padStart(8)} ${'Δ BE-ROAS'.padStart(9)}`;
  ut.push(rubrik);
  ut.push('-'.repeat(rubrik.length));
  const antal = resultat.lagen[0]?.scenarier.length ?? 0;
  const fotnoter = [];
  for (let i = 0; i < antal; i++) {
    resultat.lagen.forEach((l, j) => {
      const r = l.scenarier[i];
      const namn = j === 0 ? `${r.namn}${r.baslinje ? '  [baslinje]' : ''}` : '';
      if (r.saknas) { ut.push(`${namn.padEnd(bredd)} ${l.namn.padEnd(8)} ${'—'.padStart(8)}  kostnad saknas: ${r.saknas}`); return; }
      const e = r.ekonomi;
      ut.push(`${namn.padEnd(bredd)} ${l.namn.padEnd(8)} ${f2(e.intakt).padStart(8)} ${f2(e.varukostnad).padStart(9)} ${f2(e.tull).padStart(6)} ${f2(e.kortavgift).padStart(6)} ${f2(e.fraktKostnad).padStart(6)} ${f2(e.kostnad).padStart(8)} ${f2(e.tb).padStart(8)} ${f3(e.beRoas).padStart(8)} ${f2(e.beCpa).padStart(8)} ${(r.baslinje ? '—' : fd(r.diff?.tb)).padStart(8)} ${(r.baslinje ? '—' : fd(r.diff?.beRoas, 3)).padStart(9)}`);
      if (e.varning && j === 0) fotnoter.push(`${r.namn}: ${e.varning}`);
    });
    const s = resultat.lagen[0].scenarier[i];
    if (s.not && !fotnoter.some((f) => f.startsWith(s.namn))) fotnoter.push(`${s.namn}: ${s.not}`);
  }
  if (fotnoter.length) { ut.push(''); for (const f of fotnoter) ut.push(`  · ${f}`); }
  ut.push('');
  ut.push('Post-purchase: 319 kr mot 279 kr för 2 lådor till i samma paket');
  for (const l of resultat.lagen) {
    const b = l.brytpunkt;
    if (!b) { ut.push(`   ${l.namn.padEnd(8)} går inte att räkna (kostnad saknas)`); continue; }
    const dom = b.faktor === Infinity ? '279-erbjudandet lyfter inte tb — det kan aldrig slå 319' : b.faktor === 0 ? '319-erbjudandet lyfter inte tb — 279 är alltid bättre' : `279 kr slår 319 kr först när dess take-rate är minst ${b.faktor} × 319-erbjudandets`;
    ut.push(`   ${l.namn.padEnd(8)} lyft per upsell-order: 319 kr → ${fd(b.lyftA)} kr, 279 kr → ${fd(b.lyftB)} kr mot baslinjen ⇒ ${dom}.`);
  }
  ut.push('   Förväntat tb per order = tb_bas + take-rate × (tb_upsell − tb_bas). Take-raten är inte mätt — mät den i Shopify innan något väljs.');
  return ut.join('\n');
}

function main() {
  const arg = process.argv.slice(2);
  const har = (f) => arg.includes(f);
  const varde = (f, d = null) => { const i = arg.indexOf(f); return i > -1 && arg[i + 1] !== undefined ? arg[i + 1] : d; };
  if (har('--hjalp') || har('-h')) {
    console.log('node matstrumpor/erbjudanden/ekonomi.mjs [--kostnad konfig|shopify|bada] [--kortavgift 0.02] [--frakt-kostnad 0] [--moms] [--eur-sek 11.3] [--json]');
    return;
  }
  const kostnad = varde('--kostnad', 'bada');
  if (!['bada', ...LAGEN].includes(kostnad)) throw new Error(`--kostnad ska vara konfig, shopify eller bada (fick "${kostnad}").`);
  const kortavgiftAndel = Number(varde('--kortavgift', 0));
  const fraktKostnad = Number(varde('--frakt-kostnad', 0));
  if (!Number.isFinite(kortavgiftAndel)) throw new Error('--kortavgift ska vara en andel, t.ex. 0.02.');
  if (!Number.isFinite(fraktKostnad)) throw new Error('--frakt-kostnad ska vara kronor per paket, t.ex. 45.');
  const eurSek = varde('--eur-sek', null);
  const resultat = rakna({ kostnad, kortavgiftAndel, fraktKostnad, moms: har('--moms'), eurSek });
  if (har('--json')) { console.log(JSON.stringify(resultat, (k, v) => (v === Infinity ? 'Infinity' : v), 2)); return; }
  console.log(tabell(resultat));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try { main(); } catch (e) { console.error(`FEL: ${e.message}`); process.exit(1); }
}
