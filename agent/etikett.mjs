#!/usr/bin/env node
// ETIKETTEN DAG 7 — utfallet per annons, och breakthrough-frekvensen.
//
// Axels beslut 2026-09-20 (ur Evolve-materialet, docs/ecomtalent/SKALNINGSKUNGEN-FORSLAG.md 2.4):
// varje annons får en etikett när den är sju dygn gammal, räknad på annonsens
// EGNA första vecka [D0, D0+6] — aldrig last_7d, aldrig kalenderveckan.
//
//   BREAKTHROUGH  andel ≥ 30 % av kampanjens spend OCH kampanjens budget höjdes
//                 under veckan OCH annonsens ROAS ≥ break-even (KPI-kravet —
//                 utan det blir frekvensen uppblåst)
//   SPEND_WINNER  andel ≥ 30 %, men ingen höjning eller under break-even
//   KPI_WINNER    andel < 30 %, minst ett köp, ROAS ≥ kampanjens ROAS
//   LOSER         resten
//   INGEN_LEVERANS spend under 10 kr — hooken föll, logga och släpp
//
// Trösklarna är Evolves för 0–100 k dollar/månad, där varje Bäverkampanj ligger.
//
// ETIKETTEN ÄR INTE EN DOM. Den beskriver vad Meta gjorde. Domar, kill, skalning,
// DNA och iterationsplaybook kräver `bedombar` (≥ 300 kr OCH ≥ 3 köp,
// CLAUDE.md regel 3 / ANALYSMETOD). Båda fälten står på samma rad.
//
// Etiketten skrivs en gång och ändras aldrig — utom uppgradering till
// BREAKTHROUGH (Evolve: "the status of an ad does not change after you label it
// unless it becomes a breakthrough").
//
// Skriptet RÄKNAR och LOGGAR. Sessionen hämtar raderna ur Meta (rond-auto steg
// 3c) och skriver dem ordagrant i en jobbfil — aldrig tvärtom.
//
//   node agent/etikett.mjs --jobb <fil.json> [--json] [--torr] [--uppgradering]
//   node agent/etikett.mjs --frekvens [--json]         # bara frekvensen ur loggen
//
// Jobbfilen (en per kampanj och dag):
// {
//   "datum": "2026-09-27", "ad_account_id": "1867947880635861",
//   "kampanj_id": "…", "kampanj_namn": "Produkten | BE ROAS 1.63 | …",
//   "break_even": 1.63, "struktur": "CBO",
//   "kampanj": { "spend": "12 340,10 kr (SEK)", "roas": "2.91" },   // samma fönster som annonserna
//   "budget_d0": 1000, "budget_d7": 1200,                          // valfritt — annars ur budgetloggen
//   "annonser": [
//     { "id": "…", "namn": "Takoverdrag_PD_10_H1", "d0": "2026-09-20",
//       "spend": "4 120,00 kr (SEK)", "kop": 14, "roas": "3.12",
//       "impressions": 41000, "video_3s": 9800, "thruplay": 1900,
//       "hook_text": "…", "hook_vo": "…", "batch": 3, "typ": "N", "iteration_nr": 0, "parent": null }
//   ]
// }

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lasBelopp, MIN_KOP_FOR_DOM, MIN_SPEND_FOR_DOM } from './besked.mjs';
import { lasLogg, skrivRad } from './logg.mjs';

/** Andel av kampanjens spend som krävs för spend winner/breakthrough (Evolve, 0–100 k$/mån). */
export const ETIKETT_ANDEL = 0.30;
/** Så nära tröskeln avgör budgetkriteriet ensamt — ROAS och spend revideras i efterhand. */
export const ETIKETT_NARA_GRANS = 0.03;
/** Under så här lite spend har annonsen aldrig levererat. */
export const INGEN_LEVERANS_SEK = 10;
/** Annonsens egna första vecka: D0 … D0+6. */
export const ETIKETT_FONSTER_DAGAR = 7;
/** Under så många etiketterade annonser skrivs frekvensen aldrig som procent. */
export const FREKVENS_MIN_ANTAL = 10;

export const ETIKETT = {
  BREAKTHROUGH: 'BREAKTHROUGH',
  SPEND_WINNER: 'SPEND_WINNER',
  KPI_WINNER: 'KPI_WINNER',
  LOSER: 'LOSER',
  INGEN_LEVERANS: 'INGEN_LEVERANS',
  INGEN_DATA: 'INGEN_DATA',
};

export const ETIKETTKODER = ['ETIKETT', 'ETIKETT_UPPGRADERAD'];

const num = (x) => {
  const n = lasBelopp(x);
  return Number.isFinite(n) ? n : null;
};

function datumPlus(iso, dagar) {
  const t = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(t)) return null;
  return new Date(t + dagar * 86400000).toISOString().slice(0, 10);
}

/** Hela dygn mellan två ISO-datum (b − a). */
export function dagarMellan(a, b) {
  const ta = Date.parse(`${a}T00:00:00Z`);
  const tb = Date.parse(`${b}T00:00:00Z`);
  if (!Number.isFinite(ta) || !Number.isFinite(tb)) return null;
  return Math.floor((tb - ta) / 86400000);
}

/** BOF-koncept (token 2 i namnet) etiketteras men räknas inte i frekvensens nämnare. */
export function arBof(namn) {
  const delar = String(namn ?? '').split('_');
  return delar.length > 1 && delar[1].toUpperCase() === 'BOF';
}

/**
 * Höjdes kampanjens budget i fönstret [d0, d7]? Läses ur budgetloggen:
 *  - en genomförd SKALA-rad i fönstret (motorns eller raketens höjning), eller
 *  - sista kända budgeten i fönstret > första kända (Axels egna höjningar över
 *    taket syns bara så — Metas aktivitetslogg är av, logg.mjs:3–5).
 * Saknas varje budgetuppgift i fönstret: null, aldrig gissat.
 */
export function budgetHojdUrLogg(logg, kampanjId, d0, d7) {
  const iFonster = logg
    .filter((r) => r.kampanj_id === kampanjId && String(r.datum) >= String(d0) && String(r.datum) <= String(d7))
    .sort((a, b) => (String(a.datum) < String(b.datum) ? -1 : 1));
  if (iFonster.some((r) => r.kod === 'SKALA' && r.genomford === true && Number.isFinite(r.ny_budget))) return true;
  const kanda = iFonster
    .map((r) => (r.genomford === true && Number.isFinite(r.ny_budget) ? r.ny_budget : r.gammal_budget))
    .filter((b) => Number.isFinite(b));
  if (kanda.length === 0) return null;
  return kanda[kanda.length - 1] > kanda[0];
}

/**
 * Etiketten för EN annons. Ren räkning.
 * @param {object} a         normaliserad annons (se lasEtikettannons)
 * @param {object} k         { spend, roas, breakEven, struktur, budgetHojd }
 */
export function etikettera(a, k) {
  const spend = a.spend;
  const ut = {
    etikett: null, andel: null, bedombar: false, preliminar: false, nara_grans: false,
    roas_ad: a.roas, roas_kampanj: k.roas ?? null, budget_hojd: k.budgetHojd ?? null,
    struktur: k.struktur === 'ABO' ? 'ABO' : 'CBO',
  };
  if (!Number.isFinite(spend)) return { ...ut, etikett: ETIKETT.INGEN_DATA, orsak: 'spend saknas' };
  ut.bedombar = spend >= MIN_SPEND_FOR_DOM && a.kop >= MIN_KOP_FOR_DOM;
  ut.preliminar = ut.bedombar && a.kop <= MIN_KOP_FOR_DOM + 1;
  if (spend < INGEN_LEVERANS_SEK) return { ...ut, etikett: ETIKETT.INGEN_LEVERANS };

  const kpi = a.kop >= 1 && Number.isFinite(k.roas) && a.roas >= k.roas;
  if (ut.struktur === 'ABO') {
    return { ...ut, etikett: kpi ? ETIKETT.KPI_WINNER : ETIKETT.LOSER, orsak: 'ABO — andel går inte att räkna, bara KPI' };
  }
  if (!Number.isFinite(k.spend) || k.spend <= 0) return { ...ut, etikett: ETIKETT.INGEN_DATA, orsak: 'kampanjens spend saknas' };

  ut.andel = spend / k.spend;
  ut.nara_grans = Math.abs(ut.andel - ETIKETT_ANDEL) <= ETIKETT_NARA_GRANS;
  const overTroskel = ut.andel >= ETIKETT_ANDEL;
  const hallerKpi = Number.isFinite(k.breakEven) ? a.roas >= k.breakEven : false;

  // Nära gränsen avgör budgetkriteriet ensamt: höjdes budgeten och KPI:n håller
  // räknas den som breakthrough även strax under 30 %; annars som vanligt.
  if ((overTroskel || ut.nara_grans) && k.budgetHojd === true && hallerKpi) {
    return { ...ut, etikett: ETIKETT.BREAKTHROUGH };
  }
  if (overTroskel) return { ...ut, etikett: ETIKETT.SPEND_WINNER };
  if (kpi) return { ...ut, etikett: ETIKETT.KPI_WINNER };
  return { ...ut, etikett: ETIKETT.LOSER };
}

/** Normaliserar en annonsrad ur jobbfilen. Tål Metas strängar ordagrant. */
export function lasEtikettannons(rad) {
  const spend = num(rad.spend ?? rad.amount_spent);
  const roas = num(rad.roas ?? rad.purchase_roas);
  const kop = num(rad.kop ?? rad.omni_purchase);
  const impressions = num(rad.impressions);
  const treSek = num(rad.video_3s ?? rad.video_view);
  const thruplay = num(rad.thruplay ?? rad.video_thruplay_watched_actions);
  const d0 = String(rad.d0 ?? rad.created_time ?? '').slice(0, 10);
  return {
    id: String(rad.id ?? ''),
    namn: String(rad.namn ?? rad.name ?? ''),
    d0: /^\d{4}-\d{2}-\d{2}$/.test(d0) ? d0 : null,
    spend: Number.isFinite(spend) ? spend : null,
    // Ingen ROAS de dygn inget såldes = noll intäkt, inte "vet inte".
    roas: Number.isFinite(roas) ? roas : 0,
    kop: Number.isFinite(kop) ? kop : 0,
    hook_rate: Number.isFinite(impressions) && impressions > 0 && Number.isFinite(treSek) ? treSek / impressions : null,
    hold_rate: Number.isFinite(impressions) && impressions > 0 && Number.isFinite(thruplay) ? thruplay / impressions : null,
    hook_text: rad.hook_text ?? null,
    hook_vo: rad.hook_vo ?? null,
    batch: rad.batch ?? null,
    typ: rad.typ ?? null,
    iteration_nr: rad.iteration_nr ?? null,
    parent: rad.parent ?? null,
  };
}

/** Senaste etikettraden per annons ur loggen. */
export function senasteEtikett(logg, annonsId) {
  let traff = null;
  for (const r of logg) {
    if (!ETIKETTKODER.includes(r.kod) || r.annons_id !== annonsId) continue;
    if (traff === null || String(r.datum) > String(traff.datum)) traff = r;
  }
  return traff;
}

/**
 * Räknar etiketterna för en jobbfil. Returnerar rader att skriva + hoppade.
 * Annonser som redan har etikett hoppas över — utom vid `uppgradering`, då en
 * SPEND_WINNER/KPI_WINNER som nu uppfyller BREAKTHROUGH får en ny rad.
 */
export function raknaEtiketter(jobb, logg = [], { uppgradering = false } = {}) {
  const datum = String(jobb.datum ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) throw new Error('Jobbfilen saknar giltigt datum (YYYY-MM-DD).');
  const breakEven = num(jobb.break_even);
  const kampanj = {
    spend: num(jobb.kampanj?.spend ?? jobb.spend_kampanj),
    roas: num(jobb.kampanj?.roas ?? jobb.roas_kampanj),
    breakEven,
    struktur: String(jobb.struktur ?? 'CBO').toUpperCase(),
  };
  const rader = [];
  const hoppade = [];
  for (const rå of Array.isArray(jobb.annonser) ? jobb.annonser : []) {
    const a = lasEtikettannons(rå);
    if (!a.id) { hoppade.push({ namn: a.namn, orsak: 'saknar id' }); continue; }
    if (!a.d0) { hoppade.push({ namn: a.namn, orsak: 'saknar d0/created_time' }); continue; }
    const alder = dagarMellan(a.d0, datum);
    if (alder === null || alder < ETIKETT_FONSTER_DAGAR) {
      hoppade.push({ namn: a.namn, orsak: `bara ${alder} dygn gammal — etikett från dag ${ETIKETT_FONSTER_DAGAR}` });
      continue;
    }
    const d6 = datumPlus(a.d0, ETIKETT_FONSTER_DAGAR - 1);
    const d7 = datumPlus(a.d0, ETIKETT_FONSTER_DAGAR);
    const tidigare = senasteEtikett(logg, a.id);
    if (tidigare && !uppgradering) { hoppade.push({ namn: a.namn, orsak: `redan etiketterad ${tidigare.datum}: ${tidigare.etikett}` }); continue; }

    let budgetHojd = null;
    const b0 = num(jobb.budget_d0);
    const b7 = num(jobb.budget_d7);
    if (Number.isFinite(b0) && Number.isFinite(b7)) budgetHojd = b7 > b0;
    else budgetHojd = budgetHojdUrLogg(logg, String(jobb.kampanj_id), a.d0, d7);

    const e = etikettera(a, { ...kampanj, budgetHojd });
    if (tidigare && uppgradering) {
      if (e.etikett !== ETIKETT.BREAKTHROUGH || tidigare.etikett === ETIKETT.BREAKTHROUGH) {
        hoppade.push({ namn: a.namn, orsak: `ingen uppgradering (${tidigare.etikett} → ${e.etikett})` });
        continue;
      }
    }
    rader.push({
      datum,
      kampanj_id: String(jobb.kampanj_id ?? ''),
      kampanj_namn: String(jobb.kampanj_namn ?? ''),
      ad_account_id: String(jobb.ad_account_id ?? '').replace(/^act_/, ''),
      kod: tidigare && uppgradering ? 'ETIKETT_UPPGRADERAD' : 'ETIKETT',
      annons_id: a.id,
      annons_namn: a.namn,
      batch: a.batch,
      typ: a.typ,
      iteration_nr: a.iteration_nr,
      parent: a.parent,
      d0: a.d0,
      d6,
      spend_ad: a.spend,
      spend_kampanj: kampanj.spend,
      andel: e.andel === null ? null : Number(e.andel.toFixed(4)),
      kop: a.kop,
      roas_ad: a.roas,
      roas_kampanj: kampanj.roas,
      hook_rate: a.hook_rate === null ? null : Number(a.hook_rate.toFixed(4)),
      hold_rate: a.hold_rate === null ? null : Number(a.hold_rate.toFixed(4)),
      hook_text: a.hook_text,
      hook_vo: a.hook_vo,
      budget_d0: Number.isFinite(b0) ? b0 : null,
      budget_d7: Number.isFinite(b7) ? b7 : null,
      budget_hojd: e.budget_hojd,
      struktur: e.struktur,
      bof: arBof(a.namn),
      etikett: e.etikett,
      bedombar: e.bedombar,
      preliminar: e.preliminar,
      nara_grans: e.nara_grans,
      orsak: e.orsak ?? null,
      // ALDRIG ny_budget: dagarSedanAndring räknar varje rad med det fältet som
      // en budgetändring och skulle frysa kampanjen i tre dygn.
      genomford: true,
      godkand_av: 'auto — etikett dag 7, Axels beslut 2026-09-20',
    });
  }
  return { rader, hoppade };
}

/**
 * Breakthrough-frekvensen ur loggen: per kampanj (och per batch när den finns).
 * Nämnaren är ALLA etiketterade annonser utom BOF — även INGEN_LEVERANS och
 * LOSER (en annons som inte levererade är Evolves "hook failed", inte bortfall).
 * En annons räknas en gång; en uppgraderad rad gör den till breakthrough.
 */
export function breakthroughFrekvens(logg, { kampanjId = null } = {}) {
  const perAnnons = new Map();
  for (const r of logg) {
    if (!ETIKETTKODER.includes(r.kod)) continue;
    if (kampanjId && r.kampanj_id !== kampanjId) continue;
    if (r.bof === true || arBof(r.annons_namn)) continue;
    const nyckel = `${r.kampanj_id}|${r.annons_id}`;
    const tidigare = perAnnons.get(nyckel);
    const arBt = r.etikett === ETIKETT.BREAKTHROUGH;
    perAnnons.set(nyckel, {
      kampanj_id: r.kampanj_id, kampanj_namn: r.kampanj_namn, batch: r.batch ?? null,
      etikett: tidigare?.etikett === ETIKETT.BREAKTHROUGH || arBt ? ETIKETT.BREAKTHROUGH : r.etikett,
      ad_account_id: r.ad_account_id,
    });
  }
  const grupper = new Map();
  for (const a of perAnnons.values()) {
    const key = `${a.ad_account_id}|${a.kampanj_id}`;
    if (!grupper.has(key)) {
      grupper.set(key, { ad_account_id: a.ad_account_id, kampanj_id: a.kampanj_id, kampanj_namn: a.kampanj_namn, antal: 0, breakthroughs: 0, spend_winners: 0, kpi_winners: 0, losers: 0, ingen_leverans: 0, batcher: new Map() });
    }
    const g = grupper.get(key);
    g.antal += 1;
    if (a.etikett === ETIKETT.BREAKTHROUGH) g.breakthroughs += 1;
    else if (a.etikett === ETIKETT.SPEND_WINNER) g.spend_winners += 1;
    else if (a.etikett === ETIKETT.KPI_WINNER) g.kpi_winners += 1;
    else if (a.etikett === ETIKETT.INGEN_LEVERANS) g.ingen_leverans += 1;
    else if (a.etikett === ETIKETT.LOSER) g.losers += 1;
    const bk = a.batch === null || a.batch === undefined ? 'okänd' : String(a.batch);
    const b = g.batcher.get(bk) ?? { batch: bk, antal: 0, breakthroughs: 0 };
    b.antal += 1;
    if (a.etikett === ETIKETT.BREAKTHROUGH) b.breakthroughs += 1;
    g.batcher.set(bk, b);
  }
  return [...grupper.values()].map((g) => ({
    ...g,
    frekvens: formateraFrekvens(g.breakthroughs, g.antal),
    batcher: [...g.batcher.values()].map((b) => ({ ...b, frekvens: formateraFrekvens(b.breakthroughs, b.antal) })),
  }));
}

/** "3/21 (14 %)" — aldrig procent ensam, och ingen procent alls under tio annonser. */
export function formateraFrekvens(breakthroughs, antal) {
  if (!antal) return '0/0';
  const bas = `${breakthroughs}/${antal}`;
  return antal < FREKVENS_MIN_ANTAL ? bas : `${bas} (${Math.round((breakthroughs / antal) * 100)} %)`;
}

/** Iterationsplaybookens läsning av etiketten — vad nästa runda gör med annonsen. */
export function playbookLasning(rad) {
  if (rad.bof) return 'BOF — ingen spend-fix, räknas inte i frekvensen';
  switch (rad.etikett) {
    case ETIKETT.BREAKTHROUGH: return '80 % vidarebygg på denna: I1 tre hookar → I2 problemdel → I3 in media res';
    case ETIKETT.SPEND_WINNER: return 'KPI-fix: LP-byte, proof, kostnad-av-att-vänta — utförandet, inte idén';
    case ETIKETT.KPI_WINNER: return '3 nya hookar, allt annat lika — den säljer men får inte spend';
    case ETIKETT.LOSER: return rad.typ === 'N' ? 'iterera en gång (idén kan ha varit rätt, utförandet fel)' : 'släpp';
    case ETIKETT.INGEN_LEVERANS: return 'hooken föll — logga och släpp, aldrig ABO';
    default: return 'ingen data';
  }
}

const pct = (x) => (x === null || x === undefined ? '—' : `${Math.round(x * 100)} %`);
const dec = (x) => (x === null || x === undefined ? '—' : Number(x).toFixed(2).replace('.', ','));

/** Markdown-tabellen som klistras in i products/<id>/batch-log.md och rapporten. */
export function formateraTabell(rader) {
  const ut = ['| Annons | Batch | Typ | Etikett (7 d) | Andel | Spend | Köp | ROAS ad / kampanj | Bedömbar | Playbook |', '|---|---|---|---|---|---|---|---|---|---|'];
  for (const r of rader) {
    ut.push(`| ${r.annons_namn} | ${r.batch ?? '—'} | ${r.typ ?? '—'} | **${r.etikett}**${r.nara_grans ? ' ⚠ nära 30 %' : ''} | ${pct(r.andel)} | ${Math.round(r.spend_ad ?? 0)} kr | ${r.kop} | ${dec(r.roas_ad)} / ${dec(r.roas_kampanj)} | ${r.bedombar ? (r.preliminar ? 'ja (prel.)' : 'ja') : 'nej'} | ${playbookLasning(r)} |`);
  }
  return ut.join('\n');
}

export function formateraFrekvenser(grupper) {
  if (grupper.length === 0) return 'Breakthrough-frekvens: inga etiketter i loggen än.';
  const ut = ['Breakthrough-frekvens (BREAKTHROUGH / alla etiketterade utom BOF):'];
  for (const g of grupper) {
    const namn = String(g.kampanj_namn).split('|')[0].trim();
    ut.push(`  ${namn}: ${g.frekvens} — spend winners ${g.spend_winners}, KPI winners ${g.kpi_winners}, losers ${g.losers}, ej levererade ${g.ingen_leverans}`);
    for (const b of g.batcher) ut.push(`      batch ${b.batch}: ${b.frekvens}`);
  }
  return ut.join('\n');
}

async function main(argv) {
  const logg = await lasLogg();
  if (argv.includes('--frekvens')) {
    const grupper = breakthroughFrekvens(logg);
    console.log(argv.includes('--json') ? JSON.stringify(grupper, null, 2) : formateraFrekvenser(grupper));
    return;
  }
  const i = argv.indexOf('--jobb');
  if (i === -1 || !argv[i + 1]) {
    console.error('Användning: node agent/etikett.mjs --jobb <fil.json> [--json] [--torr] [--uppgradering]  |  --frekvens');
    process.exit(2);
  }
  const jobb = JSON.parse(readFileSync(argv[i + 1], 'utf8'));
  const { rader, hoppade } = raknaEtiketter(jobb, logg, { uppgradering: argv.includes('--uppgradering') });
  const torr = argv.includes('--torr');
  if (!torr) for (const r of rader) await skrivRad(r);
  const grupper = breakthroughFrekvens([...logg, ...rader], { kampanjId: String(jobb.kampanj_id ?? '') });
  if (argv.includes('--json')) {
    console.log(JSON.stringify({ skrivna: torr ? 0 : rader.length, torr, rader, hoppade, frekvens: grupper }, null, 2));
    return;
  }
  console.log(`ETIKETTER — ${jobb.kampanj_namn ?? jobb.kampanj_id} (${jobb.datum})${torr ? ' — TORRKÖRNING, inget skrivet' : ''}`);
  console.log(rader.length ? formateraTabell(rader) : 'Inga nya etiketter i dag.');
  if (hoppade.length) {
    console.log('\nHoppade:');
    for (const h of hoppade) console.log(`  - ${h.namn}: ${h.orsak}`);
  }
  console.log('');
  console.log(formateraFrekvenser(grupper));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await main(process.argv.slice(2));
}
