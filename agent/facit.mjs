#!/usr/bin/env node
// Facit — återkopplingen till Skalnings kungen (Axels beställning 2026-09-30:
// "kollar om det var bra eller dåligt att vi skalade och stängde av … så att vi
// i framtiden lär oss vart det är okej att skala mer och vart vi kan spara in
// mer pengar"). Designen och skälen: agent/FACIT.md.
//
// Frågan: tjänade de kronor motorn lade till pengar, och förlorade de kronor
// den tog bort pengar? Måttet är marginal-ROAS för de flyttade kronorna mot
// break-even, efter en kontroll för regressionen mot medelvärdet.
//
// Den här filen är REN räkning (inga nätanrop) plus ett tunt CLI längst ner.
// Datan hämtas av agent/hamta-facit.mjs. Facit ändrar ALDRIG ett beslut, en
// budget, en regel eller budgetloggen — det skriver bara sina egna filer.
//
//   node agent/facit.mjs [--konto SE|NO|alla] [--hamta] [--idag YYYY-MM-DD] [--skriv]
//     utan --skriv skrivs ingenting (rapporten till skärmen); rutinen kör --hamta --skriv
//   node agent/facit.mjs --status [--en]      rader till rondens leverans
//   node agent/facit.mjs --json               allt som maskindata
import { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  lasBelopp, targetRoas, vinstProcent, GOLV_SEK, MIN_SPEND_FOR_DOM, MIN_KOP_FOR_DOM,
  TRAPPA, SNABB_SKALNING_ROAS, KONSEKVENT_DAGAR, TAK_UTAN_VINNARE, NARA_GRANS_PP, LIVSTIDS_MAX_BACKDAGAR, TEST_TROSKEL_SEK,
} from './besked.mjs';

const HÄR = dirname(fileURLToPath(import.meta.url));
export const FACITFIL = join(HÄR, 'facit.jsonl');
export const KALIBRERINGSFIL = join(HÄR, 'kalibrering.json');

// ── Konstanterna ─────────────────────────────────────────────────────────────

export const KONTON = { '1867947880635861': 'SE', '1050941584152547': 'NO' };

/** Före-fönstret = exakt det motorn såg: D−3..D−1 (last_3d utesluter dag D). */
export const FORE_DAGAR = 3;
/** Efter-fönstren räknas från D+1 — dag D är delad (ändringen landar ~07:55). */
export const HORISONTER = Object.freeze({ kort: 3, lang: 7 });
/** Kortaste efter-fönster som får dömas när en störning kapar fönstret. */
export const MIN_EFTER_DAGAR = 3;
/** Ändringar åt samma håll med högst så här många dygns mellanrum = en episod. */
export const KEDJA_DAGAR = 3;
/** Flyttade Meta färre kronor än så här av en ändring var budgeten inte flaskhalsen. */
export const MIN_FLYTT_SEK = 300;
/** Grinden på deltat: flyttade kronor ≥ 3 × break-even-CPA (nog för tre köp). */
export const GRIND_BE_CPA = 3;
/** Under 5 × break-even-CPA är domen preliminär (ANALYSMETOD 2c: 3–4 köp). */
export const PRELIMINAR_BE_CPA = 5;

/** ROAS / break-even vid beslutet. Gränserna ligger där motorns zoner ligger:
 *  1,0 = break-even, 1,3–1,6 ≈ 16–25 % vinst, ≥ 1,6 ≈ över target. */
export const BAND = Object.freeze([
  { namn: '<0,8', upp: 0.8 },
  { namn: '0,8–1,0', upp: 1.0 },
  { namn: '1,0–1,3', upp: 1.3 },
  { namn: '1,3–1,6', upp: 1.6 },
  { namn: '1,6–2,0', upp: 2.0 },
  { namn: '≥2,0', upp: Infinity },
]);
export const ZONER = Object.freeze([
  { namn: '<1 000', upp: 1000 },
  { namn: '1 000–2 000', upp: 2000 },
  { namn: '2 000–4 000', upp: 4000 },
  { namn: '≥4 000', upp: Infinity },
]);

/** Regelverken (git log agent/besked.mjs). Episoder bär sitt regelverk; hinkarna
 *  mäter marknadens svar och får läggas ihop, men rapporten visar uppdelningen.
 *  Ny regel i besked.mjs ⇒ ny rad här, med datum då den första gången styrde en rond. */
export const REGELVERK = Object.freeze([
  { fran: '2026-08-28', namn: 'augusti–september (raket, tak 4 000/10 000)' },
  { fran: '2026-09-23', namn: 'trappan + inget tak + CPA-spärr (2026-09-22)' },
]);

/** Kontrollen kräver minst så många kampanjdygn från så många ANDRA kampanjer
 *  (den egna marknaden först, annars båda). Annars ingen dom (UNG), och det sägs. */
export const KONTROLL_MIN_PROV = 15;
export const KONTROLL_MIN_KAMPANJER = 5;


/** Hinken säger något först vid så många bedömbara episoder (bredvid dagens beslut). */
export const MIN_BEDOMBARA_NOT = 5;
/** Ett regelförslag till Axel kräver så många OLIKA kampanjer (kritiken
 *  2026-09-30: åtta episoder kan vara två kampanjer på snabbspåret). */
export const MIN_KAMPANJER_FORSLAG = 8;
/** Hållbeslut: minst så många kampanjdygn (från MIN_KAMPANJER_FORSLAG kampanjer för ett förslag). */
export const MIN_HALL_DYGN = 15;
export const MIN_HALL_KAMPANJER = 5;
/** Procent visas först från 10 fall (samma regel som etikettfrekvensen). */
export const PROCENT_FRAN = 10;

export const HOJ_KODER = ['SKALA'];
export const SANK_KODER = ['SANK', 'HALVERA', 'MANUELL_SANK'];
export const STANG_KODER = ['STANG_AV'];
export const TJUV_KODER = ['TJUV_PAUSAD', 'TRAPPA_FORLANGNING'];
/** Hållbeslut som säger något om motorns tålamod. FOR_LITE_DATA, FRYST,
 *  AGARENS och liknande är inga val — de räknas inte. */
export const HALL_KODER = ['LAT_VARA', 'VANTA_KADENS', 'VANTA_KONSEKVENT', 'CPA_STIGER', 'VISNING_AVVAKTA', 'HOGZON_AVVAKTA', 'UPPSKJUTEN_GRANS', 'RAKNA_BACKDAGAR', 'VANTA_TROSKEL', 'VANTA_BREAKTHROUGH', 'VANTA_FORLANGNING'];

export const FAMILJNAMN = Object.freeze({
  HOJ: 'höjningar', SANK: 'sänkningar', STANG: 'avstängningar', TJUV: 'tjuvpauser',
  AXEL_HOJ: 'dina egna höjningar', AXEL_SANK: 'dina egna sänkningar',
  HALL_HOG: 'väntan över target', HALL_MELLAN: 'väntan mellan break-even och target', HALL_FORLUST: 'väntan i förlust',
});
const FAMILJNAMN_EN = Object.freeze({
  HOJ: 'raises', SANK: 'cuts', STANG: 'kills', TJUV: 'thief pauses',
  AXEL_HOJ: "Axel's own raises", AXEL_SANK: "Axel's own cuts",
  HALL_HOG: 'holds above target', HALL_MELLAN: 'holds between break-even and target', HALL_FORLUST: 'holds in loss',
});

/** Metodens version på varje facit-rad. Hinkarna räknas bara ur gällande version,
 *  så en rättad metod aldrig blandas med frysta rader från en gammal. */
export const METOD_VERSION = 3;

/** Familjens grund: dina egna ändringar mäts precis som motorns. */
export const grund = (f) => (f === 'AXEL_HOJ' ? 'HOJ' : f === 'AXEL_SANK' ? 'SANK' : f);
export const arBudgetfamilj = (f) => ['HOJ', 'SANK'].includes(grund(f));

/** ROAS ÷ target vid beslutet — exakt trappans steg i besked.mjs (TRAPPA.over 1,0 / 1,5 / 2,0). */
export const trappaFor = (roas, target) => {
  if (!Number.isFinite(roas) || !Number.isFinite(target) || target <= 0) return 'okänd';
  const q = roas / target;
  return q < 1 ? '<1,0' : q < 1.5 ? '1,0–1,5' : q < 2 ? '1,5–2,0' : '≥2,0';
};

// ── Datum ────────────────────────────────────────────────────────────────────

export function plusDagar(iso, n) {
  const t = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(t) ? new Date(t + n * 86400000).toISOString().slice(0, 10) : null;
}
export function dagarMellan(fran, till) {
  return Math.round((Date.parse(`${till}T00:00:00Z`) - Date.parse(`${fran}T00:00:00Z`)) / 86400000);
}
function lokaltDatum(iso, tz) {
  const t = Date.parse(String(iso).replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
  if (!Number.isFinite(t)) return null;
  return new Intl.DateTimeFormat('sv-SE', { timeZone: tz || 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(t));
}

// ── Tolkning av Metas svar (används av hamta-facit.mjs) ─────────────────────

const actionVarde = (arr, typ) => {
  const a = (arr || []).find((x) => x.action_type === typ);
  if (!a || a['7d_click'] === undefined) return null; // aldrig `value` — det bär visningsköpen
  const n = Number(a['7d_click']);
  return Number.isFinite(n) ? n : null;
};

/** En dygnsrad ur insights → { kampanj_id, namn, datum, spend, kop, intakt }.
 *  Intäkt = action_values omni_purchase[7d_click] (mätt 2026-09-30: stämmer mot
 *  spend × purchase_roas på 2e-6, och fångar köp på dygn utan spend). */
export function tolkaInsiktsrad(r) {
  if (!r?.campaign_id || !r?.date_start) return null;
  const spend = Number(r.spend ?? 0);
  const kop = actionVarde(r.actions, 'omni_purchase') ?? 0;
  let intakt = actionVarde(r.action_values, 'omni_purchase');
  if (intakt === null) {
    const roas = actionVarde(r.purchase_roas, 'omni_purchase');
    intakt = roas !== null ? spend * roas : 0;
  }
  return { kampanj_id: String(r.campaign_id), namn: r.campaign_name ?? null, datum: r.date_start, spend: Number.isFinite(spend) ? spend : 0, kop, intakt };
}

/** En rad ur aktivitetsloggen (category BUDGET) → budgetändring, eller null. */
export function tolkaBudgethandelse(a, tz) {
  if (a?.event_type !== 'update_campaign_budget') return null;
  let x;
  try { x = typeof a.extra_data === 'string' ? JSON.parse(a.extra_data) : a.extra_data; } catch { return null; }
  const franRa = x?.old_value?.old_value;
  const till = Number(x?.new_value?.new_value);
  if (!Number.isFinite(till)) return null;
  // Ingen gammal budget = budgeten skapades (ny kampanj). Varken höjning eller störning.
  const skapad = franRa === null || franRa === undefined || franRa === '';
  const fran = skapad ? null : Number(franRa);
  if (!skapad && !Number.isFinite(fran)) return null;
  return {
    tid: a.event_time,
    datum: lokaltDatum(a.event_time, tz),
    kampanj_id: String(a.object_id),
    fran_sek: skapad ? null : fran / 100,
    till_sek: till / 100,
    app: a.application_name ?? null,
    skapad,
    // Preliminärt: appens namn. kor() avgör på riktigt — motorn är den ändring
    // som matchar en genomförd rad i budgetloggen, oavsett app (andra sessioner
    // använder också MCP-servern).
    motor: a.application_name === 'ads MCP server',
  };
}

// ── Hinkar ───────────────────────────────────────────────────────────────────

export const bandFor = (roas, be) => {
  if (!Number.isFinite(roas) || !Number.isFinite(be) || be <= 0) return 'okänd';
  const q = roas / be;
  return BAND.find((b) => q < b.upp).namn;
};
export const zonFor = (budget) => (Number.isFinite(budget) && budget > 0 ? ZONER.find((z) => budget < z.upp).namn : 'okänd');
export const regelverkFor = (datum) => [...REGELVERK].reverse().find((r) => String(datum) >= r.fran)?.namn ?? 'före ronden';
export function stegFor(familj, fran, till) {
  if (!Number.isFinite(fran) || !Number.isFinite(till) || fran <= 0) return 'okänd';
  const q = till / fran;
  if (familj === 'HOJ') return q <= 1.25 ? '+≤25 %' : q <= 1.6 ? '+26–60 %' : '+>60 %';
  if (familj === 'SANK') return till <= GOLV_SEK ? 'till golvet' : q >= 0.75 ? '−≤25 %' : '−26–55 %';
  return '—';
}

// ── Dygnsserien ──────────────────────────────────────────────────────────────

/** Serien per kampanj: Map(kampanj_id → Map(datum → {spend,kop,intakt})). */
export function byggSerie(dygn) {
  const s = new Map();
  for (const d of dygn ?? []) {
    if (!d) continue;
    if (!s.has(d.kampanj_id)) s.set(d.kampanj_id, new Map());
    const m = s.get(d.kampanj_id);
    const f = m.get(d.datum) ?? { spend: 0, kop: 0, intakt: 0 };
    m.set(d.datum, { spend: f.spend + d.spend, kop: f.kop + d.kop, intakt: f.intakt + d.intakt });
  }
  return s;
}

/** Summan över [fran, till]. En saknad dygnsrad = noll spend (Meta skriver ingen
 *  rad för ett dygn utan leverans). `nolldygn` räknar dygn utan spend. */
export function summa(serie, kampanjId, fran, till) {
  const m = serie.get(String(kampanjId)) ?? new Map();
  let spend = 0; let kop = 0; let intakt = 0; let nolldygn = 0; let dagar = 0;
  for (let d = fran; d <= till; d = plusDagar(d, 1)) {
    dagar += 1;
    const v = m.get(d);
    if (!v || !(v.spend > 0)) nolldygn += 1;
    if (v) { spend += v.spend; kop += v.kop; intakt += v.intakt; }
  }
  return { fran, till, dagar, spend, kop, intakt, nolldygn, roas: spend > 0 ? intakt / spend : null };
}

// ── Loggen → beslut och händelser ────────────────────────────────────────────

const marknadFor = (rad) => KONTON[String(rad?.ad_account_id ?? '').replace(/^act_/, '')] ?? null;

/**
 * Budgetloggen → beslut per kampanj. Bara genomförda rader räknas. TRAPPA_STEG_1
 * (2026-08-30..09-01) står genomford:true men ändrade ingenting i Meta — hoppas.
 * Dubbletter (samma kampanj, dag och kod) räknas en gång.
 */
export function beslutUrLogg(logg) {
  const ut = [];
  const sett = new Set();
  for (const r of logg ?? []) {
    if (!r || r.genomford !== true || !r.kampanj_id || !r.datum) continue;
    const kod = r.kod;
    const familj = HOJ_KODER.includes(kod) ? 'HOJ' : SANK_KODER.includes(kod) ? 'SANK' : STANG_KODER.includes(kod) ? 'STANG' : TJUV_KODER.includes(kod) ? 'TJUV' : kod === 'ATERAKTIVERA' ? 'START' : null;
    if (!familj) continue;
    const nyckel = `${r.kampanj_id}|${r.datum}|${familj === 'TJUV' ? 'TJUV' : kod}`;
    if (sett.has(nyckel)) continue;
    sett.add(nyckel);
    ut.push({
      familj,
      kod,
      datum: r.datum,
      kampanj_id: String(r.kampanj_id),
      kampanj_namn: r.kampanj_namn ?? null,
      marknad: marknadFor(r),
      fran: lasBelopp(r.gammal_budget ?? r.fran_budget ?? null),
      till: lasBelopp(r.ny_budget ?? null),
      be: lasBelopp(r.break_even ?? r.break_even_roas ?? null),
    });
  }
  return ut.sort((a, b) => (a.datum === b.datum ? 0 : a.datum < b.datum ? -1 : 1));
}

/** Hållbesluten: sista hållraden per kampanj och dygn. */
export function hallUrLogg(logg) {
  const per = new Map();
  for (const r of logg ?? []) {
    if (!r || !r.kampanj_id || !r.datum || !HALL_KODER.includes(r.kod)) continue;
    per.set(`${r.kampanj_id}|${r.datum}`, r);
  }
  return [...per.values()].map((r) => ({
    kod: r.kod, datum: r.datum, kampanj_id: String(r.kampanj_id), kampanj_namn: r.kampanj_namn ?? null,
    marknad: marknadFor(r), budget: lasBelopp(r.gammal_budget ?? null), be: lasBelopp(r.break_even ?? null),
  }));
}

/** Break-even per kampanj och dag, ur loggens rader (senaste kända ≤ dagen, annars första efter). */
export function breakEvenIndex(logg) {
  const per = new Map();
  for (const r of logg ?? []) {
    const be = lasBelopp(r?.break_even ?? null);
    if (!r?.kampanj_id || !r?.datum || !Number.isFinite(be) || be <= 1) continue;
    const k = String(r.kampanj_id);
    if (!per.has(k)) per.set(k, []);
    per.get(k).push([r.datum, be]);
  }
  for (const v of per.values()) v.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  return (kampanjId, datum) => {
    const v = per.get(String(kampanjId));
    if (!v?.length) return null;
    let be = v[0][1];
    for (const [d, b] of v) { if (d <= datum) be = b; else break; }
    return be;
  };
}

/**
 * Alla ändringar per kampanj (dygn), ur aktivitetsloggen (alla appar, även
 * Axels egna) plus loggens avstängningar och återstarter. Används för att kapa
 * efter-fönster och för att hitta kampanjer som INTE ändrades (kontrollen).
 */
export function andringsIndex(budgetandringar, beslut) {
  const per = new Map();
  const lagg = (k, d, typ, motor) => {
    if (!d) return;
    if (!per.has(k)) per.set(k, []);
    per.get(k).push({ datum: d, typ, motor });
  };
  for (const a of budgetandringar ?? []) { if (a.skapad) continue; lagg(String(a.kampanj_id), a.datum, a.till_sek > a.fran_sek ? 'upp' : 'ner', a.motor); }
  for (const b of beslut ?? []) {
    if (b.familj === 'HOJ') lagg(b.kampanj_id, b.datum, 'upp', true);
    if (b.familj === 'SANK') lagg(b.kampanj_id, b.datum, 'ner', true);
    if (b.familj === 'STANG') lagg(b.kampanj_id, b.datum, 'stang', true);
    if (b.familj === 'START') lagg(b.kampanj_id, b.datum, 'start', false);
    if (b.familj === 'TJUV') lagg(b.kampanj_id, b.datum, 'tjuv', true);
  }
  for (const v of per.values()) v.sort((a, b) => (a.datum < b.datum ? -1 : 1));
  return per;
}

const handelserMellan = (index, kampanjId, fran, till, { utom = [] } = {}) => (index.get(String(kampanjId)) ?? [])
  .filter((h) => h.datum >= fran && h.datum <= till && !utom.includes(h.datum));

// ── Episoderna ───────────────────────────────────────────────────────────────

/**
 * Höjningar och sänkningar åt samma håll på samma kampanj, högst KEDJA_DAGAR
 * isär och utan en annan ändring emellan, blir en episod. Avstängningar och
 * tjuvpauser är en episod per beslut.
 */
export function episoder(beslut, index) {
  const ut = [];
  const perKampanj = new Map();
  for (const b of beslut) {
    if (!['HOJ', 'SANK', 'STANG', 'TJUV', 'AXEL_HOJ', 'AXEL_SANK'].includes(b.familj)) continue;
    if (!perKampanj.has(b.kampanj_id)) perKampanj.set(b.kampanj_id, []);
    perKampanj.get(b.kampanj_id).push(b);
  }
  for (const [kid, lista] of perKampanj) {
    let aktuell = null;
    const avsluta = () => { if (aktuell) ut.push(aktuell); aktuell = null; };
    for (const b of lista) {
      if (b.familj === 'STANG' || b.familj === 'TJUV') {
        avsluta();
        ut.push({ familj: b.familj, kampanj_id: kid, kampanj_namn: b.kampanj_namn, marknad: b.marknad, start: b.datum, slut: b.datum, steg: [b], fran: b.fran, till: b.till, be: b.be });
        continue;
      }
      const passar = aktuell && aktuell.familj === b.familj
        && dagarMellan(aktuell.slut, b.datum) <= KEDJA_DAGAR
        && handelserMellan(index, kid, plusDagar(aktuell.slut, 1), plusDagar(b.datum, -1)).length === 0;
      if (passar) {
        aktuell.steg.push(b);
        aktuell.slut = b.datum;
        aktuell.till = b.till;
      } else {
        avsluta();
        aktuell = { familj: b.familj, kampanj_id: kid, kampanj_namn: b.kampanj_namn, marknad: b.marknad, start: b.datum, slut: b.datum, steg: [b], fran: b.fran, till: b.till, be: b.be };
      }
    }
    avsluta();
  }
  return ut.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
}

// ── Kontrollen: vad hade hänt utan ändringen? ────────────────────────────────
//
// Version 3 (2026-09-30), vald i en provbänk mot fyra simuleringar med känt facit
// (agent/FACIT.md → "Hur modellen valdes"). Motorn agerar nästan alltid när ROAS
// är hög eller låg, så de dygn där inget ändrades är få just där besluten tas.
// En regression över ALLA kampanjdygn med spendens flytt som förklaring (version
// 2) blandade ihop motorns egen reaktion med kampanjens utveckling: i
// simuleringen såg höjningar ut att tjäna 60–90 % av de flyttade kronorna för
// mycket och sänkningar lika mycket för lite, åt fel håll. Version 3 utgår från
// kampanjens EGEN nivå veckan innan och räknar hur mycket av före-fönstrets
// avvikelse som brukar hålla i sig (empirisk Bayes). Felet i simuleringarna:
// 1–15 % av de flyttade kronorna, utan en riktning som går igen.

/** Kampanjens egen nivå: dygn D−10..D−4, minst 5 dygn med spend, 3 köp och 300 kr. */
export const HISTORIK = Object.freeze({ fran: 10, till: 4, minDagar: 5 });
/** Ett köps intäkt är brusig (sammansatt Poisson): variansen i log-ROAS ≈ (1 + CV²) / köp. */
const BRUS_PER_KOP = () => 1 + AOV_CV ** 2;

/** Kampanjens nivå veckan innan D, eller null (för lite historik — ny kampanj). */
export function egenHistorik(serie, kampanjId, datum, be, since) {
  const fran = plusDagar(datum, -HISTORIK.fran);
  if (fran < since || !Number.isFinite(be)) return null;
  const h = summa(serie, kampanjId, fran, plusDagar(datum, -HISTORIK.till));
  if (h.dagar - h.nolldygn < HISTORIK.minDagar || h.kop < MIN_KOP_FOR_DOM || h.spend < MIN_SPEND_FOR_DOM || !(h.roas > 0)) return null;
  return { qh: h.roas / be, kop: h.kop, spend: h.spend };
}

/**
 * Prov för kontrollen: varje kampanjdygn d där budgeten INTE ändrades D−3..D,
 * med ett bedömbart före-fönster (≥ 300 kr, ≥ 3 köp, spend varje dygn) och en
 * egen historik (D−10..D−4). Utfallet är ROAS D+1..D+h oavsett vad som hände
 * sedan (samma fråga som ett hållbeslut besvarar: vad blev det när vi lät den
 * vara i dag). Minst halva efter-fönstret med spend.
 *   q  = ROAS/BE före     qh = ROAS/BE veckan innan     y = ROAS/BE efter
 */
export function kontrollprov(serie, beIndex, { marknadFor: mf, since, until, h, index = new Map() }) {
  const prov = [];
  for (const [kid, m] of serie) {
    const datum = [...m.keys()].sort();
    if (!datum.length) continue;
    const forsta = datum[0] > since ? datum[0] : since;
    const andringar = (index.get(String(kid)) ?? []).map((x) => x.datum);
    for (let d = plusDagar(forsta, FORE_DAGAR); plusDagar(d, h) <= until; d = plusDagar(d, 1)) {
      if (andringar.some((a) => a >= plusDagar(d, -FORE_DAGAR) && a <= d)) continue;
      const fore = summa(serie, kid, plusDagar(d, -FORE_DAGAR), plusDagar(d, -1));
      if (fore.nolldygn || fore.spend < MIN_SPEND_FOR_DOM || fore.kop < MIN_KOP_FOR_DOM || !(fore.roas > 0)) continue;
      const efter = summa(serie, kid, plusDagar(d, 1), plusDagar(d, h));
      if (!(efter.spend > 0) || (efter.dagar - efter.nolldygn) * 2 < efter.dagar) continue;
      const be = beIndex(kid, d);
      if (!Number.isFinite(be)) continue;
      const hist = egenHistorik(serie, kid, d, be, since);
      if (!hist) continue;
      const q = fore.roas / be;
      if (q >= KONTROLL_MAX_Q) continue;
      prov.push({ kampanj_id: kid, datum: d, marknad: mf(kid), q, qh: hist.qh, kop: fore.kop, kop_hist: hist.kop, kop_efter: efter.kop, y: (efter.roas ?? 0) / be, w: fore.spend });
    }
  }
  return prov;
}

/** Kontrollen räknas på dygn med ROAS under 5 × break-even (extrema dygn på få köp styr annars). */
export const KONTROLL_MAX_Q = 5;

/**
 * Kontrafaktisk ROAS/BE för en kampanj med före-nivån q och egna nivån qh, om
 * budgeten stått still:   κ · qh · (q ÷ qh)^ρ
 *   ρ = C ÷ (C + brus)   hur mycket av avvikelsen mot den egna nivån som håller
 *                        i sig. C = hur mycket den brukar hålla (kovariansen i
 *                        andra kampanjers orörda dygn), brus = (1 + CV²) ÷ köp
 *                        före — få köp ⇒ mer är slump ⇒ lägre ρ.
 *   κ                    trötthet och allt annat som drar alla kampanjer åt
 *                        samma håll (kalibrerat så att andra kampanjers orörda
 *                        dygn får rätt snitt).
 * Kampanjen som bedöms räknas aldrig in i sin egen kontroll. Tunn marknad ⇒
 * båda marknaderna; annars saknas kontrollen och det sägs.
 */
export function kontrollfaktor(prov, { q, qh, kop, kopHist = null, marknad, utom = null, omdragningar = 0, fro = '' }) {
  const saknas = (orsak) => ({ kvot: null, k: 1, prov: 0, kampanjer: 0, marknad, saknas: true, orsak });
  if (!(q > 0)) return saknas('ingen före-ROAS');
  if (!(qh > 0)) return saknas('för lite egen historik veckan innan');
  const alla = prov.filter((p) => p.kampanj_id !== utom && p.q > 0 && p.qh > 0);
  if (!kontrollRacker(alla)) return saknas('för få andra kampanjer med orörda dygn');
  const m = anpassa(alla, marknad);
  if (!m) return saknas('för få orörda dygn med köp');
  const ut = m.forutsag({ q, qh, kop });
  const brus = BRUS_PER_KOP();
  // Osäkerheten i det kontrafaktiska (log-skala): före-fönstrets och historikens brus.
  const sdLn = Math.sqrt(ut.rho * ut.rho * brus / Math.max(kop, 1) + (1 - ut.rho) ** 2 * (Number.isFinite(kopHist) ? brus / Math.max(kopHist, 1) : 0));
  // Modellens egen osäkerhet: kontrollkampanjerna dras om med återläggning och
  // κ och C räknas om. Den är GEMENSAM för alla beslut samma morgon (samma
  // skattning), så hinkarna lägger ihop den rakt, inte i kvadrat.
  let sdKvot = null;
  if (omdragningar > 0) {
    const perKampanj = new Map();
    for (const p of alla) { if (!perKampanj.has(p.kampanj_id)) perKampanj.set(p.kampanj_id, []); perKampanj.get(p.kampanj_id).push(p); }
    const grupper = [...perKampanj.values()];
    const r = slump(hash(`kontroll|${fro}`));
    const v = [];
    for (let i = 0; i < omdragningar; i++) {
      const drag = [];
      for (let j = 0; j < grupper.length; j++) drag.push(...grupper[Math.floor(r() * grupper.length)]);
      const mb = anpassa(drag, marknad);
      if (mb) v.push(mb.forutsag({ q, qh, kop }).kvot);
    }
    if (v.length >= 10) { const mv = v.reduce((a2, b2) => a2 + b2, 0) / v.length; sdKvot = Math.sqrt(v.reduce((a2, b2) => a2 + (b2 - mv) ** 2, 0) / (v.length - 1)); }
  }
  return { kvot: ut.kvot, k: ut.kvot / q, rho: ut.rho, kappa: m.kappa, C: m.C, sdLn, sdKvot, prov: m.prov, kampanjer: m.kampanjer, marknad: m.marknad };
}

/** Så många omdragningar av kontrollkampanjerna per beslut (modellens osäkerhet). */
export const MODELL_OMDRAGNINGAR = 60;
/** Omdragningen fångar skattningens brus men inte att modellen är en förenkling.
 *  Kalibrerat i simuleringen 2026-09-30 (3 världar × 8 frön, en månads data per
 *  körning): felet delat med omdragningens sd hade spridningen 1,4 för höjningar
 *  och 1,9 för sänkningar. Skalan gör 80 %-intervallen ärliga. */
export const MODELL_SKALA = Object.freeze({ HOJ: 1.5, SANK: 1.9 });

const kontrollRacker = (r) => r.length >= KONTROLL_MIN_PROV && new Set(r.map((p) => p.kampanj_id)).size >= KONTROLL_MIN_KAMPANJER;

/**
 * Anpassar modellen på en uppsättning orörda dygn: C på alla (båda marknaderna —
 * på en marknad var det för tunt: Norge 2026-09-30 hade 27 dygn på 6 kampanjer
 * och C slog i golvet), κ på marknadens egna när de räcker (trötthet och säsong
 * är marknadens). Null när datan inte bär.
 */
function anpassa(alla, marknad) {
  const brus = BRUS_PER_KOP();
  const med = alla.filter((p) => p.y > 0);
  const W = med.reduce((s, p) => s + p.w, 0);
  if (!(W > 0) || med.length < 3) return null;
  const u = med.map((p) => Math.log(p.q / p.qh));
  const z = med.map((p) => Math.log(p.y / p.qh));
  const mu = med.reduce((s, p, i) => s + p.w * u[i], 0) / W;
  const mz = med.reduce((s, p, i) => s + p.w * z[i], 0) / W;
  const C = Math.max(med.reduce((s, p, i) => s + p.w * (u[i] - mu) * (z[i] - mz), 0) / W, 0.001);
  const rhoFor = (k) => C / (C + brus / Math.max(k, 1));
  const pred0 = (p) => p.qh * Math.exp(rhoFor(p.kop) * Math.log(p.q / p.qh));
  const egna = alla.filter((p) => p.marknad === marknad);
  const urval = kontrollRacker(egna) ? egna : alla;
  const Wa = urval.reduce((s, p) => s + p.w * pred0(p), 0);
  if (!(Wa > 0)) return null;
  const kappa = urval.reduce((s, p) => s + p.w * p.y, 0) / Wa;
  return {
    C, kappa, prov: urval.length, kampanjer: new Set(urval.map((p) => p.kampanj_id)).size, marknad: urval === egna ? marknad : 'SE+NO',
    forutsag: ({ q, qh, kop }) => { const rho = rhoFor(kop); return { rho, kvot: kappa * qh * Math.exp(rho * Math.log(q / qh)) }; },
  };
}

// ── Domen per episod (version 2, efter designkritiken 2026-09-30) ────────────
//
// Kritiken (agent/FACIT.md → "Kritiken") mätte fyra fel i version 1 och de är
// rättade här:
//  1. Kontrafaktiskt utfall. Före-fönstret är fönstret motorn VALDE på, så det
//     är för högt vid en höjning och för lågt vid en sänkning. Kontrafaktisk
//     ROAS = före-ROAS × k (regressionens skärningspunkt, se kontrollfaktor).
//     Kritikens förslag — veckan innan motorn tittade som baslinje — prövades
//     och föll på placebotestet (kampanjer mattas av; −41 066 kr på dygn utan
//     ändring). En placebokörning varje morgon vaktar att mätaren håller.
//  2. Bruset. Tre dygns köp är Poisson-brus. Varje episod får ett 80 %-intervall
//     för Δvinst, och döms RÄTT/FEL bara när intervallet ligger helt på ena
//     sidan om noll — annars OSÄKER. Mätt: av 15 höjningar hade 2 ett sådant.
//  3. Överlevare. Höjningar som motorn själv stängde av eller vände räknas fram
//     till avbrottet (AVBRUTEN) i stället för att falla bort som "störda".
//  4. Lanseringsdagar. Ett före-fönster med ett dygn utan spend är lansering,
//     inte en baslinje — LANSERINGSFAS, ingen dom.
// Efter-fönstret börjar dagen efter FÖRSTA steget och räknar kedjans
// mellandagar som behandlade (version 1 kastade dem och började mäta när
// nedgången redan startat).

/** Dygn ett fönster ska ha varit stängt innan det döms. Mätt 2026-09-30: de
 *  loggade 7d_click-talen 3–6 dygn gamla stämde exakt mot omhämtningen — men
 *  det bevisar inte att sena köp saknas. Tre dygns marginal. */
export const MOGNAD_DAGAR = 3;
/** 80 %-intervall (normalapproximation). */
export const Z80 = 1.2816;
/** Ordervärdets spridning i intäktens varians (sammansatt Poisson). */
export const AOV_CV = 0.4;

/** Intäktens varians i ett fönster: AOV² × (1 + CV²) × köp (minst ett köp). */
function intaktsvarians(f, aovReserv) {
  const aov = f.kop > 0 ? f.intakt / f.kop : aovReserv;
  if (!Number.isFinite(aov)) return 0;
  return aov * aov * (1 + AOV_CV ** 2) * Math.max(f.kop, 1);
}

/**
 * Räknar en episod vid en horisont. Returnerar null när fönstret inte stängt
 * än (väntar), annars en facit-rad. `ctx` = { serie, konto, index, prov,
 * until, since, idag, beIndex, produktFor }.
 */
export function dommaEpisod(ep, horisont, ctx) {
  const h = HORISONTER[horisont];
  const { serie, index, until } = ctx;
  const bas = {
    nyckel: `${ep.familj}|${ep.kampanj_id}|${ep.start}|${horisont}`,
    horisont,
    familj: ep.familj,
    kampanj_id: ep.kampanj_id,
    kampanj_namn: ep.kampanj_namn,
    marknad: ep.marknad,
    produkt: ctx.produktFor?.(ep) ?? String(ep.kampanj_namn ?? '').split('|')[0].trim(),
    start: ep.start,
    slut: ep.slut,
    beslut: ep.steg.map((s) => ({ datum: s.datum, kod: s.kod, fran_sek: s.fran, till_sek: s.till })),
    beslut_fran_sek: ep.fran,
    beslut_till_sek: ep.till,
    regelverk: regelverkFor(ep.start),
    zon: zonFor(ep.fran),
    // Första stegets storlek (det trappan bestämmer) och hela episodens ändring
    // (en kedja på snabbspåret är flera +20 % i rad). Två olika frågor.
    forsta_steg: stegFor(ep.familj, ep.steg[0]?.fran, ep.steg[0]?.till),
    total: stegFor(ep.familj, ep.fran, ep.till),
    kedja: ep.steg.length > 1 ? '2+ steg' : '1 steg',
    av: ep.familj.startsWith('AXEL_') ? 'axel' : 'motorn',
    metod: METOD_VERSION,
  };
  // Hur länge sedan förra ändringen (snabbspåret höjer igen efter ett dygn).
  const fore0 = (index.get(String(ep.kampanj_id)) ?? []).filter((x) => x.datum < ep.start).pop();
  const sedan = fore0 ? dagarMellan(fore0.datum, ep.start) : null;
  bas.fart = sedan === 1 ? 'snabbspår (1 dygn)' : sedan === 2 ? '2 dygn' : 'normal (≥ 3 dygn)';

  // Episoden kan fortfarande växa: vänta tills en ny ändring åt samma håll inte längre hinner komma.
  if (plusDagar(ep.slut, KEDJA_DAGAR) > until && arBudgetfamilj(ep.familj)) return null;

  // Före-fönstret = urvalsfönstret, exakt det motorn såg (D−3..D−1).
  const foreFran = plusDagar(ep.start, -FORE_DAGAR);
  if (foreFran < ctx.since) return { ...bas, dom: 'UTANFOR_DATAN', orsak: `före-fönstret börjar ${foreFran}, datan ${ctx.since}` };
  const fore = summa(serie, ep.kampanj_id, foreFran, plusDagar(ep.start, -1));
  const be = Number.isFinite(ep.be) ? ep.be : ctx.beIndex(ep.kampanj_id, ep.start);
  const target = Number.isFinite(be) ? targetRoas(be).target : null;
  bas.break_even = Number.isFinite(be) ? be : null;
  bas.target = Number.isFinite(target) ? Math.round(target * 1000) / 1000 : null;
  bas.band = bandFor(fore.roas, be);
  bas.trappa = trappaFor(fore.roas, target);
  // Beslutsdatan före 2026-09-25 bar visningsköp (kontots standardattribution);
  // facit räknar allt i 7d_click, så bandet kan skilja från det motorn såg.
  bas.beslutsdata = ep.start < ATTRIBUTION_7D_CLICK_FRAN ? 'med visningsköp' : '7d_click';
  if (!Number.isFinite(be)) return { ...bas, dom: 'SAKNAR_BREAK_EVEN', fore: kort(fore) };
  if (ep.familj !== 'STANG' && fore.nolldygn) return { ...bas, dom: 'LANSERINGSFAS', orsak: `${fore.nolldygn} dygn utan spend i före-fönstret`, fore: kort(fore) };
  const tidigare = handelserMellan(index, ep.kampanj_id, foreFran, plusDagar(ep.start, -1));
  if (ep.familj !== 'STANG' && tidigare.length) return { ...bas, dom: 'STORD', orsak: `${tidigare[0].motor ? 'motorn' : 'handändring'} ${tidigare[0].typ} ${tidigare[0].datum} i före-fönstret`, fore: kort(fore) };

  // Avstängning: ingen kontrafaktisk dom (kritiken 2026-09-30 — valet av kontroll
  // avgjorde domen helt). Det som räknas är det som faktiskt hände: startades den
  // om (loggad ATERAKTIVERA eller spend syns igen), och gick den då plus?
  if (ep.familj === 'STANG') {
    const rad0 = { ...bas, fore: kort(fore), kop_fore: fore.kop };
    let r = null;
    for (let d = plusDagar(ep.start, 1); d <= plusDagar(ep.start, h) && d <= until; d = plusDagar(d, 1)) {
      const v = serie.get(ep.kampanj_id)?.get(d);
      if (v && v.spend > 0) { r = d; break; }
    }
    if (!r && plusDagar(ep.start, h + MOGNAD_DAGAR) > until) return null;
    if (r) {
      const rTill = plusDagar(r, h - 1);
      if (plusDagar(rTill, MOGNAD_DAGAR) > until) return null;
      const w = summa(serie, ep.kampanj_id, r, rTill);
      rad0.aterstartad = { datum: r, dagar: w.dagar, spend: runda(w.spend, 0), roas: w.roas === null ? null : runda(w.roas, 3), vinst_kr: runda(w.intakt / be - w.spend, 0) };
    }
    return { ...rad0, dom: 'REGISTRERAD', orsak: rad0.aterstartad ? 'återstartad — utfallet efter återstarten står i raden' : 'ingen kontrafaktisk dom för avstängningar', bedombar: false };
  }

  // Efter-fönstret: dagen efter första steget till H dygn efter sista. Kapas vid
  // första ändring som inte hör till episoden. Motorns egen avstängning eller
  // vändning = AVBRUTEN (räknas fram till avbrottet); handändring = STÖRD.
  const eFran = plusDagar(ep.start, 1);
  let eTill = plusDagar(ep.slut, h);
  let orsakKap = null;
  let avbruten = false;
  const egnaDagar = ep.steg.map((s) => s.datum);
  const storning = handelserMellan(index, ep.kampanj_id, eFran, eTill, { utom: egnaDagar })[0];
  if (storning) {
    eTill = plusDagar(storning.datum, -1);
    avbruten = storning.motor && bas.av === 'motorn';
    orsakKap = `${storning.motor ? 'motorn' : 'handändring'} ${storning.typ} ${storning.datum}`;
  }
  for (let d = eFran; d <= eTill; d = plusDagar(d, 1)) {
    const v = serie.get(ep.kampanj_id)?.get(d);
    if (!v || !(v.spend > 0)) { eTill = plusDagar(d, -1); avbruten = false; orsakKap = `inget spend ${d} (pausad för hand?)`; break; }
  }
  if (plusDagar(eTill, MOGNAD_DAGAR) > until) return null; // fönstret har inte stängt och mognat — väntar
  const eDagar = dagarMellan(eFran, eTill) + 1;
  if (eDagar < (avbruten ? 2 : MIN_EFTER_DAGAR)) return { ...bas, dom: avbruten ? 'AVBRUTEN_TIDIGT' : 'STORD', orsak: orsakKap ?? 'för kort efter-fönster', fore: kort(fore) };
  const efter = summa(serie, ep.kampanj_id, eFran, eTill);
  const rad = { ...bas, fore: kort(fore), efter: kort(efter), avkortat: orsakKap, avbruten };

  // Kontrafaktisk ROAS: kampanjens egen nivå veckan innan, plus den del av
  // före-fönstrets avvikelse som brukar hålla i sig (kontrollfaktor, version 3).
  // Fönster på upp till 5 dygn jämförs med 3-dygnsprov, längre med 7-dygnsprov.
  const hist = egenHistorik(serie, ep.kampanj_id, ep.start, be, ctx.since);
  if (!hist) return { ...rad, dom: 'UNG', orsak: 'för lite egen historik veckan innan (ny eller nyss startad kampanj)' };
  const provH = eDagar <= 5 ? 'kort' : 'lang';
  const kf = kontrollfaktor(ctx.prov[provH] ?? [], { q: fore.roas / be, qh: hist.qh, kop: fore.kop, kopHist: hist.kop, marknad: ep.marknad, utom: ep.kampanj_id, omdragningar: ctx.omdragningar ?? MODELL_OMDRAGNINGAR, fro: bas.nyckel });
  if (kf.saknas) return { ...rad, dom: 'UNG', orsak: `ingen kontroll (${kf.orsak})` };
  const roasCf = kf.kvot * be;
  rad.k = runda(kf.k, 3);
  rad.kontroll = { q: runda(fore.roas / be, 3), qh: runda(hist.qh, 3), rho: runda(kf.rho, 3), kappa: runda(kf.kappa, 3), prov: kf.prov, kampanjer: kf.kampanjer, marknad: kf.marknad, fonster: provH };
  rad.kontrafaktiskt = `ROAS/BE veckan innan ${dec(hist.qh)}, före ${dec(fore.roas / be)} ⇒ utan ändring ${dec(kf.kvot)} (${kf.prov} orörda dygn, ${kf.kampanjer} andra kampanjer, ${kf.marknad})`;

  // Vad hade gammal budget gett? Spend som i före-fönstret, ROAS som kontrafaktiskt.
  const sf = fore.spend / fore.dagar;
  const Scf = sf * eDagar;
  const Rcf = roasCf * Scf;
  const dS = efter.spend - Scf;
  const dR = efter.intakt - Rcf;
  const dVinst = dR / be - dS;
  const aov = fore.kop > 0 ? fore.intakt / fore.kop : efter.kop > 0 ? efter.intakt / efter.kop : null;
  const vandringLn2 = ctx.vandring?.[provH] ?? VANDRING_RESERV;
  const modellSd = Number.isFinite(kf.sdKvot) ? kf.sdKvot * Scf * (MODELL_SKALA[grund(ep.familj)] ?? 1.9) : 0; // i vinstkronor: Δvinst = … − kvot × Scf
  const sd = Math.sqrt((intaktsvarians(efter, aov) + Rcf * Rcf * (kf.sdLn ** 2 + vandringLn2)) / (be * be) + modellSd * modellSd);
  rad.modell_sd_kr = runda(modellSd, 0);
  rad.delta_spend_kr = runda(dS, 0);
  rad.delta_intakt_kr = runda(dR, 0);
  rad.marginal_roas = Math.abs(dS) >= MIN_FLYTT_SEK ? runda(dR / dS, 3) : null;
  rad.delta_vinst_kr = runda(dVinst, 0);
  rad.intervall_80 = [runda(dVinst - Z80 * sd, 0), runda(dVinst + Z80 * sd, 0)];
  rad.flyttat_kr = runda(Math.abs(dS), 0);
  if (Math.abs(dS) < MIN_FLYTT_SEK) rad.etikett = 'spenden flyttade inte';
  else if (grund(ep.familj) === 'HOJ' && dS < 0) rad.etikett = 'KOLLAPS — spenden föll efter höjningen';
  else if (grund(ep.familj) === 'SANK' && dS > 0) rad.etikett = 'spenden steg efter sänkningen';
  const lo = dVinst - Z80 * sd; const hi = dVinst + Z80 * sd;
  return { ...rad, dom: lo > 0 ? 'RATT' : hi < 0 ? 'FEL' : 'OSAKER', bedombar: true, preliminar: efter.kop < 5 };
}

/** Från och med det här datumet loggade ronden 7d_click (före: kontots standard med visningsköp). */
export const ATTRIBUTION_7D_CLICK_FRAN = '2026-09-25';

const runda = (x, d) => (Number.isFinite(x) ? Math.round(x * 10 ** d) / 10 ** d : null);
const kort = (f) => ({ fran: f.fran, till: f.till, dagar: f.dagar, spend: runda(f.spend, 0), kop: f.kop, intakt: runda(f.intakt, 0), roas: f.roas === null ? null : runda(f.roas, 3) });

// ── Hållbesluten (rullande, sparas inte) ─────────────────────────────────────

/**
 * Varje hållbeslut: vad hände dagarna efter att motorn lät kampanjen vara?
 * Efter-fönstret kapas vid nästa ändring (minst tre dygn kvar) — väntan tog
 * slut där. Före-fönstret får bära en tidigare ändring: frågan gäller ROAS,
 * inte spend. Tre lägen vid beslutet:
 *   över target   → stod den kvar över target? (då var väntan en missad höjning)
 *   BE–target     → höll den sig över break-even, eller föll den under?
 *   under BE      → tog den sig över break-even, eller kostade väntan pengar?
 */
export function dommaHall(hall, h, ctx) {
  const ut = [];
  for (const x of hall) {
    if (plusDagar(x.datum, -FORE_DAGAR) < ctx.since) continue;
    let eTill = plusDagar(x.datum, h);
    const nasta = handelserMellan(ctx.index, x.kampanj_id, x.datum, eTill)[0];
    if (nasta) eTill = plusDagar(nasta.datum, -1);
    if (plusDagar(eTill, MOGNAD_DAGAR) > ctx.until || dagarMellan(x.datum, eTill) < MIN_EFTER_DAGAR) continue;
    const fore = summa(ctx.serie, x.kampanj_id, plusDagar(x.datum, -FORE_DAGAR), plusDagar(x.datum, -1));
    const efter = summa(ctx.serie, x.kampanj_id, plusDagar(x.datum, 1), eTill);
    if (fore.spend < MIN_SPEND_FOR_DOM || fore.kop < MIN_KOP_FOR_DOM || efter.nolldygn) continue;
    const be = Number.isFinite(x.be) ? x.be : ctx.beIndex(x.kampanj_id, x.datum);
    if (!Number.isFinite(be)) continue;
    const target = targetRoas(be).target;
    let familj = null; let utfall = null;
    if (fore.roas >= target) {
      familj = 'HALL_HOG';
      utfall = efter.roas >= target ? 'HOLL' : efter.roas >= be ? 'SJONK' : 'FORLUST';
    } else if (fore.roas >= be) {
      familj = 'HALL_MELLAN';
      utfall = efter.roas >= be ? 'HOLL_VINST' : 'FOLL_UNDER';
    } else {
      familj = 'HALL_FORLUST';
      utfall = efter.roas >= be ? 'ATERHAMTAD' : 'FORTSATT_FORLUST';
    }
    // Vinsten per dygn efter (intäkt ÷ break-even − spend). Hinkarna summerar
    // UNIKA kampanjdygn — överlappande fönster räknades förut flera gånger
    // (kritiken 2026-09-30: 342 fönsterdygn men 132 unika).
    const dygn = [];
    for (let d = plusDagar(x.datum, 1); d <= eTill; d = plusDagar(d, 1)) {
      const v = ctx.serie.get(x.kampanj_id)?.get(d);
      if (v) dygn.push([d, runda(v.intakt / be - v.spend, 0)]);
    }
    // Nästa morgons tredygnsfönster (D−2..D): stod den kvar över target när motorn tittade igen?
    const nastaMorgon = summa(ctx.serie, x.kampanj_id, plusDagar(x.datum, -2), x.datum);
    ut.push({
      familj, kod: x.kod, datum: x.datum, kampanj_id: x.kampanj_id, kampanj_namn: x.kampanj_namn, marknad: x.marknad,
      zon: zonFor(x.budget), band: bandFor(fore.roas, be), trappa: trappaFor(fore.roas, target), utfall,
      nasta_morgon_over_target: nastaMorgon.nolldygn ? null : nastaMorgon.roas >= target,
      roas_fore: runda(fore.roas, 3), roas_efter: runda(efter.roas, 3), dygn,
    });
  }
  return ut;
}

/**
 * Väntans kostnad (kritiken 2026-09-30: facit kunde inte se missade höjningar —
 * väntan som följdes av en höjning inom två dygn sorterades bort). För varje
 * hålldygn över target som följdes av en höjning inom 3 dygn: den höjningens
 * mätta Δvinst per dygn. Positivt = väntan kostade; negativt = väntan sparade.
 */
export function vantekostnad(hall, hojRader, ctx) {
  const perStart = new Map();
  for (const r of hojRader) if (r.bedombar && r.familj === 'HOJ') perStart.set(`${r.kampanj_id}|${r.start}`, r);
  const ut = [];
  for (const x of hall) {
    if (plusDagar(x.datum, -FORE_DAGAR) < ctx.since) continue;
    const be = Number.isFinite(x.be) ? x.be : ctx.beIndex(x.kampanj_id, x.datum);
    if (!Number.isFinite(be)) continue;
    const fore = summa(ctx.serie, x.kampanj_id, plusDagar(x.datum, -FORE_DAGAR), plusDagar(x.datum, -1));
    if (fore.nolldygn || !(fore.roas >= targetRoas(be).target)) continue;
    for (let n = 1; n <= 3; n++) {
      const r = perStart.get(`${x.kampanj_id}|${plusDagar(x.datum, n)}`);
      if (!r) continue;
      ut.push({ kod: x.kod, datum: x.datum, kampanj_id: x.kampanj_id, marknad: x.marknad, hojning: r.start, kostnad_kr: runda(r.delta_vinst_kr / (r.efter?.dagar || 1), 0) });
      break;
    }
  }
  return ut;
}

/**
 * Revideringen (underlag för NARA_GRANS_PP, kritiken 2026-09-30): motorn skjuter
 * upp beslut nära en zongräns med motiveringen att ROAS revideras uppåt i
 * efterhand. Här jämförs loggad 3-dygns-ROAS med samma fönster hämtat i dag,
 * för rader från 7d_click-tiden. Korsar omhämtningen gränsen?
 */
export function revidering(logg, serie, { since, marknad }) {
  const sett = new Set();
  const ut = [];
  const zon = (v) => (v === null ? null : v < 0 ? 0 : v < 16 ? 1 : v < 25 ? 2 : 3);
  for (const r of logg) {
    if (marknadFor(r) !== marknad || !r.datum || r.datum < ATTRIBUTION_7D_CLICK_FRAN) continue;
    const roas = lasBelopp(r.roas_3d ?? null); const be = lasBelopp(r.break_even ?? null);
    if (!Number.isFinite(roas) || !Number.isFinite(be) || be <= 1) continue;
    const nyckel = `${r.kampanj_id}|${r.datum}`;
    if (sett.has(nyckel)) continue;
    sett.add(nyckel);
    const fran = plusDagar(r.datum, -FORE_DAGAR);
    if (fran < since) continue;
    const nu = summa(serie, String(r.kampanj_id), fran, plusDagar(r.datum, -1));
    if (!(nu.spend > 0)) continue;
    const vLogg = vinstProcent(be, roas); const vNu = vinstProcent(be, nu.roas);
    const nara = vLogg !== null && [0, 16, 25].some((g) => Math.abs(vLogg - g) < 3);
    ut.push({ nara, uppskjuten: r.kod === 'UPPSKJUTEN_GRANS', korsade: zon(vLogg) !== zon(vNu), kvot: roas > 0 ? nu.roas / roas : null });
  }
  return ut;
}

// ── Kalibreringen: hinkarna ─────────────────────────────────────────────────

/** Hinkarnas dimensioner. trappa, fart, zon och forsta_steg är KÄNDA vid beslutet
 *  (det förslagen får bygga på); kedja och total beror på vad som hände efteråt
 *  och står bara som beskrivning (kritiken 2026-09-30). */
export const DIMENSIONER = ['alla', 'marknad', 'zon', 'band', 'trappa', 'fart', 'forsta_steg', 'total', 'kedja', 'regelverk', 'produkt'];

/** Bootstrap-omdragningar för hinkens intervall. Kampanjen är enheten (kluster):
 *  sex episoder på samma kampanj är inte sex oberoende bevis. */
export const BOOTSTRAP_DRAG = 500;

/** Deterministisk slump (mulberry32) — samma data ger samma intervall varje morgon. */
function slump(fro) {
  let a = fro >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const median = (v) => { if (!v.length) return null; const s = [...v].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/**
 * Σ Δvinst med 80 %-intervall där kampanjer dras om med återläggning.
 * `perKampanj` = Map(kampanj_id → Σ Δvinst för hinkens episoder på kampanjen).
 */
export function klusterintervall(perKampanj, nyckel) {
  const v = [...perKampanj.values()];
  if (v.length < 2) return null;
  const r = slump(hash(nyckel));
  const summor = [];
  for (let i = 0; i < BOOTSTRAP_DRAG; i++) {
    let s = 0;
    for (let j = 0; j < v.length; j++) s += v[Math.floor(r() * v.length)];
    summor.push(s);
  }
  summor.sort((a, b) => a - b);
  return [Math.round(summor[Math.floor(0.1 * BOOTSTRAP_DRAG)]), Math.round(summor[Math.floor(0.9 * BOOTSTRAP_DRAG) - 1])];
}

const EJ_BEDOMDA = ['LANSERINGSFAS', 'UNG', 'STORD', 'UTANFOR_DATAN', 'SAKNAR_BREAK_EVEN', 'AVBRUTEN_TIDIGT'];

/**
 * Räknar hinkarna ur facit-rader (en horisont). Bara bedömda rader bär kronor.
 * Per hink: antal, olika kampanjer, rätt/fel/osäkra, Σ Δvinst med klusterintervall,
 * median per episod, Σ utan den största kampanjen (kritiken 2026-09-30: en enda
 * produkt stod för 67 % av Sveriges tillagda intäkt), samlad marginal-ROAS.
 */
export function hinkar(rader) {
  const ut = {};
  for (const r of rader) {
    if (!['HOJ', 'SANK', 'STANG', 'TJUV', 'AXEL_HOJ', 'AXEL_SANK'].includes(r.familj)) continue;
    for (const dim of DIMENSIONER) {
      if (['forsta_steg', 'total', 'kedja', 'trappa', 'fart'].includes(dim) && !arBudgetfamilj(r.familj)) continue;
      if (dim === 'fart' && grund(r.familj) !== 'HOJ') continue;
      const varde = dim === 'alla' ? 'alla' : r[dim] ?? 'okänd';
      const nyckel = `${r.familj}|${dim}|${varde}`;
      const b = ut[nyckel] ??= { familj: r.familj, dimension: dim, varde, episoder: 0, bedomda: 0, ratt: 0, fel: 0, osakra: 0, preliminara: 0, avbrutna: 0, ej_bedomda: 0, aterstartade: 0, aterstartade_plus: 0, flyttat_kr: 0, delta_vinst_kr: 0, _dS: 0, _dR: 0, _beVikt: 0, _dagar: 0, _modell: 0, _alla: new Set(), _per: new Map(), _v: [] };
      b.episoder += 1;
      b._alla.add(r.kampanj_id);
      if (EJ_BEDOMDA.includes(r.dom)) b.ej_bedomda += 1;
      if (r.aterstartad) { b.aterstartade += 1; if (r.aterstartad.vinst_kr > 0) b.aterstartade_plus += 1; }
      if (!r.bedombar) continue;
      b.bedomda += 1;
      if (r.dom === 'RATT') b.ratt += 1;
      if (r.dom === 'FEL') b.fel += 1;
      if (r.dom === 'OSAKER') b.osakra += 1;
      if (r.preliminar) b.preliminara += 1;
      if (r.avbruten) b.avbrutna += 1;
      const v = r.delta_vinst_kr ?? 0;
      b.flyttat_kr += r.flyttat_kr ?? 0;
      b.delta_vinst_kr += v;
      b._v.push(v);
      b._per.set(r.kampanj_id, (b._per.get(r.kampanj_id) ?? 0) + v);
      b._dS += r.delta_spend_kr ?? 0;
      b._dR += r.delta_intakt_kr ?? 0;
      b._dagar += r.efter?.dagar ?? 0;
      b._modell += r.modell_sd_kr ?? 0;
      b._beVikt += (r.break_even ?? 0) * Math.abs(r.delta_spend_kr ?? 0);
    }
  }
  for (const [nyckel, b] of Object.entries(ut)) {
    b.kampanjer = b._alla.size;
    b.bedomda_kampanjer = b._per.size;
    b.marginal_roas = Math.abs(b._dS) >= MIN_FLYTT_SEK ? runda(b._dR / b._dS, 3) : null;
    const absS = [...b._v].length ? Math.abs(b._dS) : 0;
    b.break_even_viktad = b.flyttat_kr > 0 ? runda(b._beVikt / b.flyttat_kr, 3) : null;
    b.median_kr = b._v.length ? Math.round(median(b._v)) : null;
    const storsta = [...b._per.entries()].sort((x, y) => Math.abs(y[1]) - Math.abs(x[1]))[0];
    b.utan_storsta_kr = storsta ? Math.round(b.delta_vinst_kr - storsta[1]) : null;
    b.storsta_kampanj = storsta ? storsta[0] : null;
    b.storsta_andel = storsta && Math.abs(b.delta_vinst_kr) > 0 ? runda(Math.abs(storsta[1]) / Math.abs(b.delta_vinst_kr), 2) : null;
    // Håller tecknet när en kampanj i taget lämnas utanför?
    const tecken = Math.sign(b.delta_vinst_kr);
    b.tecken_haller = b._per.size >= 2 && tecken !== 0 && [...b._per.values()].every((v) => Math.sign(b.delta_vinst_kr - v) === tecken);
    const dagar = b._dagar;
    b.kr_per_kampanjvecka = dagar > 0 ? Math.round((b.delta_vinst_kr / dagar) * 7) : null;
    // Utfallens spridning (kampanjer dras om) plus modellens egen osäkerhet, som är
    // gemensam för besluten och därför läggs ihop rakt (mätt i simuleringen
    // 2026-09-30: en månads data gav ±30–40 % av de flyttade kronorna i modellfel).
    b.intervall_80_utfall = klusterintervall(b._per, nyckel);
    b.modell_sd_kr = Math.round(b._modell);
    b.intervall_80 = b.intervall_80_utfall ? [Math.round(b.intervall_80_utfall[0] - Z80 * b._modell), Math.round(b.intervall_80_utfall[1] + Z80 * b._modell)] : null;
    b.flyttat_kr = Math.round(b.flyttat_kr);
    b.delta_vinst_kr = Math.round(b.delta_vinst_kr);
    void absS;
    delete b._dS; delete b._dR; delete b._beVikt; delete b._dagar; delete b._modell; delete b._alla; delete b._per; delete b._v;
  }
  return ut;
}

/** Hållbeslutens hinkar: per kod, band, trappa, zon och marknad. Nettot räknas
 *  på UNIKA kampanjdygn (intäkt ÷ break-even − spend), aldrig max(0, …) per fönster. */
export function hallHinkar(hallRader) {
  const ut = {};
  for (const r of hallRader) {
    for (const dim of ['alla', 'kod', 'band', 'trappa', 'zon', 'marknad']) {
      const varde = dim === 'alla' ? 'alla' : r[dim] ?? 'okänd';
      const nyckel = `${r.familj}|${dim}|${varde}`;
      const b = ut[nyckel] ??= { familj: r.familj, dimension: dim, varde, kampanjdygn: 0, kampanjer: new Set(), utfall: {}, nasta_morgon: { over: 0, av: 0 }, _dygn: new Map() };
      b.kampanjdygn += 1;
      b.kampanjer.add(r.kampanj_id);
      b.utfall[r.utfall] = (b.utfall[r.utfall] ?? 0) + 1;
      if (r.nasta_morgon_over_target !== null && r.nasta_morgon_over_target !== undefined) { b.nasta_morgon.av += 1; if (r.nasta_morgon_over_target) b.nasta_morgon.over += 1; }
      for (const [d, v] of r.dygn ?? []) b._dygn.set(`${r.kampanj_id}|${d}`, v);
    }
  }
  for (const b of Object.values(ut)) {
    b.kampanjer = b.kampanjer.size;
    b.unika_dygn = b._dygn.size;
    b.netto_kr = Math.round([...b._dygn.values()].reduce((x, y) => x + (y ?? 0), 0));
    delete b._dygn;
  }
  return ut;
}

export function vantekostnadHinkar(rader) {
  const ut = {};
  for (const r of rader) {
    for (const varde of ['alla', r.kod]) {
      const b = ut[varde] ??= { kod: varde, hålldygn: 0, kampanjer: new Set(), kostnad_kr: 0 };
      b['hålldygn'] += 1; b.kampanjer.add(r.kampanj_id); b.kostnad_kr += r.kostnad_kr ?? 0;
    }
  }
  for (const b of Object.values(ut)) { b.kampanjer = b.kampanjer.size; b.kostnad_kr = Math.round(b.kostnad_kr); }
  return ut;
}

export function revideringSammanfattning(rader) {
  const nara = rader.filter((r) => r.nara || r.uppskjuten);
  const kvoter = rader.map((r) => r.kvot).filter(Number.isFinite);
  return { rader: rader.length, nara: nara.length, nara_korsade: nara.filter((r) => r.korsade).length, alla_korsade: rader.filter((r) => r.korsade).length, median_kvot: kvoter.length ? runda(median(kvoter), 3) : null };
}

// ── Förslagen till Axel ──────────────────────────────────────────────────────

// ── Förslagen: en konstant, från A till B, JA eller NEJ ─────────────────────
//
// Kritiken 2026-09-30: "skala mer här" går inte att säga ja till. Varje förslag
// pekar på exakt en konstant i agent/besked.mjs med dagens värde och ett nytt,
// och bygger bara på det som var KÄNT vid beslutet (trappsteg, fart, zon,
// hållkod) — aldrig på kedja eller total, som beror på vad som hände efteråt.
// Evidensen måste hålla på alla sätt samtidigt (stark()).

/** Minsta underlag för ett förslag på höjningar: episoder och OLIKA kampanjer. */
export const FORSLAG_MIN_EPISODER = 8;
export const FORSLAG_MIN_KAMPANJER = 5;
/** Den största kampanjen får bära högst så stor del av summan. */
export const FORSLAG_MAX_STORSTA = 0.4;
/** "Tjänade pengar" = samlad marginal-ROAS minst så mycket över break-even. */
export const FORSLAG_GASA_MARGINAL = 1.25;

/**
 * Stark evidens i en hink: nog med episoder och kampanjer, 80 %-intervallet på
 * ena sidan om noll, samma tecken utan största kampanjen, utan varje kampanj i
 * tur och ordning, och i kort horisont — och ingen kampanj bär mer än 40 %.
 */
export function stark(b, { kort = null, minEp = FORSLAG_MIN_EPISODER, minKamp = FORSLAG_MIN_KAMPANJER } = {}) {
  if (!b || b.bedomda < minEp || (b.bedomda_kampanjer ?? 0) < minKamp || !b.intervall_80) return 0;
  const [lo, hi] = b.intervall_80;
  const tecken = lo > 0 ? 1 : hi < 0 ? -1 : 0;
  if (!tecken) return 0;
  if (Math.sign(b.utan_storsta_kr) !== tecken || !b.tecken_haller) return 0;
  if (!(b.storsta_andel <= FORSLAG_MAX_STORSTA)) return 0;
  if (!kort || Math.sign(kort.delta_vinst_kr) !== tecken) return 0;
  return tecken;
}

const TRAPPSTEG = {
  '1,0–1,5': { steg: TRAPPA.find((t) => t.over === 1.0), upp: 1.3, ner: 1.1 },
  '1,5–2,0': { steg: TRAPPA.find((t) => t.over === 1.5), upp: 1.75, ner: 1.3 },
  '≥2,0': { steg: TRAPPA.find((t) => t.over === 2.0), upp: 2.5, ner: 1.5 },
};
const tal = (x) => String(x).replace('.', ',');
const bevisText = (b) => `${b.bedomda} mätta på ${b.bedomda_kampanjer} kampanjer · ${b.ratt} rätt, ${b.fel} fel, ${b.osakra} osäkra · ${kr(b.delta_vinst_kr)} mot att låta bli (80 %: ${kr(b.intervall_80?.[0])} till ${kr(b.intervall_80?.[1])})${b.marginal_roas !== null ? ` · marginal-ROAS ${dec(b.marginal_roas)} mot break-even ${dec(b.break_even_viktad)}` : ''}`;

export function forslag(kal) {
  const ut = [];
  const H = kal.hinkarNya ?? {}; const K = kal.hinkarNyaKort ?? {}; const A = kal.hinkarAlla ?? {};
  const lagg = (f) => ut.push({ matare: null, ...f, nyckel: `${f.konstant}|${f.till}` });
  const laggHoj = (f) => lagg({ ...f, matare: PLACEBO_HOJ }); // bygger på mätarens kontrafaktik i toppläget

  // R1 — trappan: steget per trappsteg (ROAS ÷ target vid beslutet).
  for (const [varde, t] of Object.entries(TRAPPSTEG)) {
    const b = H[`HOJ|trappa|${varde}`];
    const tecken = stark(b, { kort: K[`HOJ|trappa|${varde}`] });
    if (tecken > 0 && b.marginal_roas >= FORSLAG_GASA_MARGINAL * b.break_even_viktad) laggHoj({ konstant: `TRAPPA (steget vid ROAS ${varde} × target)`, fran: `×${tal(t.steg.faktor)}`, till: `×${tal(t.upp)}`, varfor: 'Höjningarna i det här trappsteget tjänade pengar, även utan den största kampanjen.', bevis: bevisText(b), kr_per_vecka: b.kr_per_kampanjvecka });
    if (tecken < 0) laggHoj({ konstant: `TRAPPA (steget vid ROAS ${varde} × target)`, fran: `×${tal(t.steg.faktor)}`, till: `×${tal(t.ner)}`, varfor: 'Höjningarna i det här trappsteget gick back.', bevis: bevisText(b), kr_per_vecka: b.kr_per_kampanjvecka });
  }
  // R3 — snabbspåret: höjningar dagen efter förra höjningen.
  {
    const v = 'snabbspår (1 dygn)'; const b = H[`HOJ|fart|${v}`];
    const tecken = stark(b, { kort: K[`HOJ|fart|${v}`] });
    if (tecken > 0 && b.marginal_roas >= FORSLAG_GASA_MARGINAL * b.break_even_viktad) laggHoj({ konstant: 'SNABB_SKALNING_ROAS', fran: tal(SNABB_SKALNING_ROAS.toFixed(1)), till: '2,5', varfor: 'Höjningar dagen efter förra höjningen tjänade pengar — snabbspåret kan öppnas tidigare.', bevis: bevisText(b), kr_per_vecka: b.kr_per_kampanjvecka });
    if (tecken < 0) laggHoj({ konstant: 'SNABB_SKALNING_ROAS', fran: tal(SNABB_SKALNING_ROAS.toFixed(1)), till: '4,0', varfor: 'Höjningar dagen efter förra höjningen gick back.', bevis: bevisText(b), kr_per_vecka: b.kr_per_kampanjvecka });
  }
  // R4 — taket utan vinnaretikett: höjningar över 4 000 kr (motorns och dina egna).
  for (const fam of ['HOJ', 'AXEL_HOJ']) {
    const hink = fam === 'HOJ' ? H : A;
    const b = hink[`${fam}|zon|≥4 000`];
    const tecken = stark(b, { kort: fam === 'HOJ' ? K[`${fam}|zon|≥4 000`] : (kal.hinkarAllaKort ?? {})[`${fam}|zon|≥4 000`], minEp: 5, minKamp: 3 });
    if (tecken > 0 && b.marginal_roas >= FORSLAG_GASA_MARGINAL * b.break_even_viktad) laggHoj({ konstant: 'TAK_UTAN_VINNARE', fran: `${TAK_UTAN_VINNARE.toLocaleString('sv-SE')} kr`, till: '6 000 kr', varfor: `${fam === 'HOJ' ? 'Motorns' : 'Dina egna'} höjningar över 4 000 kr/dag tjänade pengar.`, bevis: bevisText(b), kr_per_vecka: b.kr_per_kampanjvecka });
  }
  // R2 — konsekvensspärren: stod kampanjen kvar över target nästa morgon?
  {
    const b = kal.hall?.['HALL_HOG|kod|VANTA_KONSEKVENT'];
    if (b && b.nasta_morgon.av >= MIN_HALL_DYGN && b.kampanjer >= FORSLAG_MIN_KAMPANJER) {
      const andel = b.nasta_morgon.over / b.nasta_morgon.av;
      const hoj = H['HOJ|alla|alla'];
      const bevis = `${brak(b.nasta_morgon.over, b.nasta_morgon.av)} väntedygn stod kvar över target nästa morgon (${b.kampanjer} kampanjer)`;
      if (andel >= 0.8 && hoj && hoj.delta_vinst_kr > 0) lagg({ konstant: 'KONSEKVENT_DAGAR', fran: String(KONSEKVENT_DAGAR), till: '1', varfor: 'Kampanjerna låg nästan alltid kvar över target dagen efter — den extra väntedagen gav inget.', bevis, kr_per_vecka: null });
      if (andel <= 0.5) lagg({ konstant: 'KONSEKVENT_DAGAR', fran: String(KONSEKVENT_DAGAR), till: '3', varfor: 'Hälften föll under target redan nästa morgon — toppen höll inte.', bevis, kr_per_vecka: null });
    }
  }
  // R8 — uppskjutningen nära en zongräns: reviderades siffrorna i efterhand?
  {
    const r = kal.revidering;
    if (r && r.nara >= 30 && r.nara_korsade / r.nara < 0.05) lagg({ konstant: 'NARA_GRANS_PP', fran: String(NARA_GRANS_PP), till: '0', varfor: 'Motorn skjuter upp beslut nära en gräns för att siffran kan revideras — men den gör det inte.', bevis: `${r.nara_korsade} av ${r.nara} rader nära en gräns korsade den när samma fönster hämtades om (median omhämtad ÷ loggad ROAS ${dec(r.median_kvot, 3)})`, kr_per_vecka: null });
  }
  // R6/R7 — väntan i förlust: livstidsspärren och testtröskeln (netto på unika dygn).
  for (const [kod, konstant, fran, snabbare, langsammare] of [['RAKNA_BACKDAGAR', 'LIVSTIDS_MAX_BACKDAGAR', String(LIVSTIDS_MAX_BACKDAGAR), '3', '7'], ['VANTA_TROSKEL', 'TEST_TROSKEL_SEK', `${TEST_TROSKEL_SEK.toLocaleString('sv-SE')} kr`, '1 000 kr', '2 000 kr']]) {
    const b = kal.hall?.[`HALL_FORLUST|kod|${kod}`];
    if (!b || b.kampanjdygn < MIN_HALL_DYGN || b.kampanjer < FORSLAG_MIN_KAMPANJER) continue;
    const n = b.kampanjdygn;
    const bevis = `${brak(b.utfall.FORTSATT_FORLUST ?? 0, n)} fortsatte under break-even, ${brak(b.utfall.ATERHAMTAD ?? 0, n)} tog sig upp · netto ${kr(b.netto_kr)} på ${b.unika_dygn} unika dygn (${b.kampanjer} kampanjer)`;
    if ((b.utfall.FORTSATT_FORLUST ?? 0) / n >= 0.8 && b.netto_kr < 0) lagg({ konstant, fran, till: snabbare, varfor: 'Kampanjerna i förlust som fick vänta tog sig nästan aldrig upp, och väntan kostade pengar.', bevis, kr_per_vecka: null });
    if ((b.utfall.ATERHAMTAD ?? 0) / n >= 0.5 && b.netto_kr > 0) lagg({ konstant, fran, till: langsammare, varfor: 'Kampanjerna i förlust som fick vänta tog sig ofta upp, och väntan tjänade pengar (överlevare — osäkert).', bevis, kr_per_vecka: null });
  }
  return ut;
}


// ── Formatering ──────────────────────────────────────────────────────────────

export const kr = (n) => (Number.isFinite(n) ? `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(Math.round(n)).toLocaleString('sv-SE')} kr` : '—');
const krUtanTecken = (n) => (Number.isFinite(n) ? `${Math.round(n).toLocaleString('sv-SE')} kr` : '—');
export const dec = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d).replace('.', ',') : '—');
/** "7/11" under 10 fall, "7/11 (64 %)" från 10. */
export const brak = (a, b) => (b >= PROCENT_FRAN ? `${a}/${b} (${Math.round((100 * a) / b)} %)` : `${a}/${b}`);

// ── Hela körningen ───────────────────────────────────────────────────────────

/**
 * Räknar facit för en uppsättning konton. `data` = { SE: hamtaFacitdata-svar, NO: … }.
 * `sparade` = befintliga facit-rader (skrivs aldrig om). Returnerar nya rader,
 * alla rader, hållraderna och kalibreringen.
 */
export function kor({ logg, data, idag, sparade = [], karta = {}, forvantadeKonton = null, tidigare = null }) {
  const beslut = beslutUrLogg(logg);
  const hall = hallUrLogg(logg);
  const beIndex = breakEvenIndex(logg);
  const produktFor = (ep) => karta[ep.kampanj_id]?.produkt ?? null;
  const sparadeNycklar = new Set(sparade.map((r) => r.nyckel));
  const nya = [];
  const hallRader = { kort: [], lang: [] };
  const vantar = [];
  const statistik = {};
  const placeboRader = [];
  const sagtandRader = [];
  const vantaRader = [];
  const revideringRader = [];

  // Kontrollproven för alla konton först — kontrollen får låna från den andra
  // marknaden när det egna bandet är för tunt.
  // Orörda dygn = ingen ändring i aktivitetsloggen eller budgetloggen D−3..D.
  const provAlla = { kort: [], lang: [] };
  for (const [kontoKod, d] of Object.entries(data)) {
    if (!d) continue;
    const serie = byggSerie(d.dygn);
    const index = andringsIndex(d.budgetandringar, beslut.filter((b) => b.marknad === kontoKod));
    for (const [hNamn, h] of Object.entries(HORISONTER)) provAlla[hNamn].push(...kontrollprov(serie, beIndex, { marknadFor: () => kontoKod, since: d.since, until: d.until, h, index }));
  }
  const placeboPer = { kort: placebo(provAlla.kort), lang: placebo(provAlla.lang) };
  const vandr = { kort: vandring(placeboPer.kort), lang: vandring(placeboPer.lang) };

  for (const [kontoKod, d] of Object.entries(data)) {
    if (!d) continue;
    const serie = byggSerie(d.dygn);
    const minaBeslut = beslut.filter((b) => b.marknad === kontoKod);
    // Motorn = den budgetändring som matchar en genomförd rad i budgetloggen
    // (samma kampanj, ±1 dygn, samma nya budget), oavsett app. Kritiken
    // 2026-09-30: andra sessioner går också via MCP-servern, och Axels återstart
    // (ATERAKTIVERA) är hans, inte motorns.
    const loggBudget = minaBeslut.filter((b) => b.familj === 'HOJ' || b.familj === 'SANK');
    for (const a of d.budgetandringar ?? []) {
      if (a.skapad) { a.motor = false; continue; }
      const upp = a.till_sek > a.fran_sek;
      a.motor = loggBudget.some((b) => b.kampanj_id === a.kampanj_id && Math.abs(dagarMellan(b.datum, a.datum)) <= 1
        && (Number.isFinite(b.till) ? Math.abs(b.till - a.till_sek) < 1 : (b.familj === 'HOJ') === upp));
    }
    // Saknad gammal/ny budget i loggraden (4 höjningar, 36 avstängningar
    // 2026-09-30) fylls ur Metas aktivitetslogg: motorns ändring samma dygn.
    for (const b of minaBeslut) {
      if (Number.isFinite(b.fran) && (Number.isFinite(b.till) || !['HOJ', 'SANK'].includes(b.familj))) continue;
      const a = (d.budgetandringar ?? []).find((x) => x.motor && x.kampanj_id === b.kampanj_id && x.datum === b.datum);
      if (!a) continue;
      if (!Number.isFinite(b.fran)) b.fran = a.fran_sek;
      if (!Number.isFinite(b.till) && ['HOJ', 'SANK'].includes(b.familj)) b.till = a.till_sek;
    }
    // Dina egna budgetändringar (Power Editor, iOS, andra sessioner — allt som inte
    // står i budgetloggen) mäts med samma metod som motorns (kritiken 2026-09-30:
    // Taköverdragets dubblingar i september var de tydligaste lärdomarna om var det
    // går att skala mer, och facit använde dem bara för att kapa fönster).
    const namnFor = (kid) => d.dygn.find((x) => x.kampanj_id === kid && x.namn)?.namn ?? logg.find((r) => String(r.kampanj_id) === kid)?.kampanj_namn ?? kid;
    const axel = (d.budgetandringar ?? []).filter((a) => !a.motor && !a.skapad && Number.isFinite(a.fran_sek) && a.till_sek !== a.fran_sek).map((a) => ({
      familj: a.till_sek > a.fran_sek ? 'AXEL_HOJ' : 'AXEL_SANK', kod: 'HAND', datum: a.datum, kampanj_id: a.kampanj_id, kampanj_namn: namnFor(a.kampanj_id),
      marknad: kontoKod, fran: a.fran_sek, till: a.till_sek, be: beIndex(a.kampanj_id, a.datum),
    }));
    const index = andringsIndex(d.budgetandringar, minaBeslut);
    const marknadForK = () => kontoKod;
    const prov = {};
    for (const [hNamn, h] of Object.entries(HORISONTER)) prov[hNamn] = [...(provAlla[hNamn] ?? [])];
    const ctx = { serie, index, prov, vandring: vandr, until: d.until, since: d.since, idag, beIndex, produktFor };
    const eps = episoder([...minaBeslut, ...axel].sort((x, y) => (x.datum < y.datum ? -1 : x.datum > y.datum ? 1 : 0)), index);
    for (const ep of eps) {
      for (const hNamn of Object.keys(HORISONTER)) {
        const nyckel = `${ep.familj}|${ep.kampanj_id}|${ep.start}|${hNamn}`;
        if (sparadeNycklar.has(nyckel)) continue;
        const r = dommaEpisod(ep, hNamn, ctx);
        if (!r) { if (hNamn === 'kort') vantar.push({ familj: ep.familj, kampanj_namn: ep.kampanj_namn, start: ep.start, slut: ep.slut }); continue; }
        if (r.dom === 'UTANFOR_DATAN') continue; // äldre än hämtningen — skrivs aldrig som ett facit
        nya.push({ ...r, skapad: idag, attribution: '7d_click', godkand_av: 'auto — beslutsfacit, Axels beställning 2026-09-30' });
        sparadeNycklar.add(nyckel);
      }
    }
    sagtandRader.push(...sagtand(eps, index, { until: d.until, marknad: kontoKod }));
    const minaHall = hall.filter((x) => x.marknad === kontoKod);
    for (const [hNamn, h] of Object.entries(HORISONTER)) hallRader[hNamn].push(...dommaHall(minaHall, h, ctx));
    const hojMatta = [...sparade, ...nya].filter((r) => r.marknad === kontoKod && r.familj === 'HOJ' && r.metod === METOD_VERSION);
    const basta = new Map();
    for (const r of hojMatta) { const k = `${r.kampanj_id}|${r.start}`; if (!basta.has(k) || (r.horisont === 'lang' && r.bedombar)) basta.set(k, r); }
    vantaRader.push(...vantekostnad(minaHall, [...basta.values()], ctx));
    revideringRader.push(...revidering(logg, serie, { since: d.since, marknad: kontoKod }));
    // Handändringar: det motorn inte gjorde (Axels egna budgetändringar i Meta).
    statistik[kontoKod] = {
      dygnsrader: d.dygn.length,
      budgetandringar: d.budgetandringar.length,
      handandringar: d.budgetandringar.filter((a) => !a.motor).length,
      kontrollprov_lang: prov.lang.filter((p) => p.marknad === kontoKod).length,
      // Exempel: en kampanj på break-even veckan innan, 1,5 × break-even före, 10 köp.
      kontroll_lang: (() => { const kf = kontrollfaktor(prov.lang, { q: 1.5, qh: 1, kop: 10, marknad: kontoKod }); return kf.saknas ? { saknas: true, orsak: kf.orsak } : { rho_10_kop: runda(kf.rho, 3), kappa: runda(kf.kappa, 3), kvot_vid_1_5: runda(kf.kvot, 3), prov: kf.prov, kampanjer: kf.kampanjer, marknad: kf.marknad }; })(),
      since: d.since,
      until: d.until,
    };
  }

  placeboRader.push(...placeboPer.kort);
  const alla = [...sparade, ...nya];
  const konton = Object.keys(data).filter((k) => data[k]);
  const kal = kalibrering(alla, hallRader, { idag, statistik, vantar, placeboRader, vandring: vandr, sagtandRader, vantaRader, revideringRader, konton, delvis: Boolean(forvantadeKonton) && forvantadeKonton.some((k) => !konton.includes(k)), tidigare });
  return { nya, alla, hallRader, kalibrering: kal, vantar, placeboRader };
}

/** Sågtanden: så många dygn efter en höjnings sista steg räknas en sänkning som en vändning. */
export const SAGTAND_DAGAR = 7;

/**
 * Sågtanden (fynd 2026-09-30: alla 9 mätbara höjningar avbröts av motorns egen
 * sänkning eller avstängning inom en vecka). Ren räkning på loggen och Metas
 * aktivitetslogg — ingen kontrafaktik: följdes höjningen av en sänkning,
 * halvering eller avstängning inom SAGTAND_DAGAR dygn?
 */
export function sagtand(eps, index, { until, marknad }) {
  const ut = [];
  for (const ep of eps) {
    if (ep.familj !== 'HOJ' || plusDagar(ep.slut, SAGTAND_DAGAR) > until) continue;
    const vand = handelserMellan(index, ep.kampanj_id, plusDagar(ep.slut, 1), plusDagar(ep.slut, SAGTAND_DAGAR))
      .find((h) => h.motor && (h.typ === 'ner' || h.typ === 'stang'));
    ut.push({ kampanj_id: ep.kampanj_id, marknad, zon: zonFor(ep.fran), kedja: ep.steg.length > 1 ? '2+ steg' : '1 steg', vande: Boolean(vand), dagar: vand ? dagarMellan(ep.slut, vand.datum) : null, typ: vand?.typ ?? null });
  }
  return ut;
}

export function sagtandHinkar(rader) {
  const ut = {};
  for (const r of rader) {
    for (const dim of ['alla', 'zon', 'kedja', 'marknad']) {
      const varde = dim === 'alla' ? 'alla' : r[dim];
      const b = ut[`${dim}|${varde}`] ??= { dimension: dim, varde, hojningar: 0, vande: 0, stangda: 0, kampanjer: new Set(), _dagar: [] };
      b.hojningar += 1;
      b.kampanjer.add(r.kampanj_id);
      if (r.vande) { b.vande += 1; b._dagar.push(r.dagar); if (r.typ === 'stang') b.stangda += 1; }
    }
  }
  for (const b of Object.values(ut)) { b.kampanjer = b.kampanjer.size; b.median_dagar = b._dagar.length ? median(b._dagar) : null; delete b._dagar; }
  return ut;
}

/** Kalibreringsfilens format. rond.mjs läser bara det här schemat. */
export const KALIBRERING_SCHEMA = 2;
/** Ett förslag visas för Axel först när det stått så många körningar i rad. */
export const FORSLAG_DAGAR_I_RAD = 7;

/**
 * Placebo (version 3): mätaren på dygn där ingenting ändrades, en kampanj i
 * taget med kampanjen själv borttagen ur kontrollen. Felet är intäkten mätaren
 * hade hittat på: (ROAS efter − förutsagd ROAS) × spend, i vinstkronor. En rak
 * mätare hamnar nära noll.
 *
 * Varför inte motorns hålldygn "utan ändring D−3..D+3" som i version 2: kravet
 * att inget ändrades EFTERÅT väljer ut dygn på utfallet (motorn höjer när det
 * går bra), så sanningen där är inte noll. Mätt i simuleringen 2026-09-30: det
 * sanna värdet på de hålldygnen var −67 000 kr, inte 0. Här villkoras bara på
 * det som låg före beslutet.
 */
export function placebo(prov) {
  const ut = [];
  for (const p of prov) {
    const kf = kontrollfaktor(prov, { q: p.q, qh: p.qh, kop: p.kop, kopHist: p.kop_hist, marknad: p.marknad, utom: p.kampanj_id });
    if (kf.saknas) continue;
    ut.push({ kampanj_id: p.kampanj_id, datum: p.datum, marknad: p.marknad, lage: p.q >= 1.5 ? 'över 1,5 × BE' : p.q >= 1 ? 'BE–1,5 × BE' : 'under BE', fel_kr: runda((p.y - kf.kvot) * p.w, 0), y: p.y, yhat: kf.kvot, sdLn: kf.sdLn, kop_efter: p.kop_efter, w: p.w });
  }
  return ut;
}

/** Mätarens prov per läge. Ett förslag om höjningar kräver att mätaren håller
 *  i läget där motorn höjer (över 1,5 × BE), inte bara i snitt — mätt
 *  2026-09-30: +31 790 kr i mittläget och −31 676 kr i toppläget tog ut varandra. */
export const PLACEBO_LAGEN = ['under BE', 'BE–1,5 × BE', 'över 1,5 × BE'];
export const PLACEBO_HOJ = 'över 1,5 × BE';

export function placeboSammanfattning(rader) {
  const sammanfatta = (r) => {
    const per = new Map();
    for (const x of r) per.set(x.kampanj_id, (per.get(x.kampanj_id) ?? 0) + x.fel_kr);
    const iv = klusterintervall(per, 'placebo');
    return { kampanjdygn: r.length, kampanjer: per.size, summa_kr: Math.round(r.reduce((s, x) => s + x.fel_kr, 0)), intervall_80: iv, godkant: Boolean(iv) && per.size >= MIN_KAMPANJER_FORSLAG && iv[0] <= 0 && iv[1] >= 0 };
  };
  const lagen = {};
  for (const l of PLACEBO_LAGEN) { const r = rader.filter((x) => x.lage === l); if (r.length) lagen[l] = sammanfatta(r); }
  return { ...sammanfatta(rader), lagen };
}

/**
 * Kampanjernas egen vandring (log-varians) utöver köpbruset och kontrollens
 * osäkerhet, mätt på placebodygnen: (ln y − ln ŷ)² minus det bruset förklarar.
 * Läggs på varje episods intervall — utan den var intervallen för smala (en
 * kampanj rör sig på några dygn även när ingen rör budgeten). Minst 10 dygn,
 * annars 0,1 (≈ ±32 %), mätt 2026-09-30 på 3-dygnsfönstren.
 */
export const VANDRING_RESERV = 0.1;
export function vandring(placeboRader) {
  const r = placeboRader.filter((x) => x.y > 0 && x.yhat > 0 && x.kop_efter > 0);
  if (r.length < 10) return VANDRING_RESERV;
  const W = r.reduce((s, x) => s + x.w, 0);
  const tot = r.reduce((s, x) => s + x.w * Math.log(x.y / x.yhat) ** 2, 0) / W;
  const brus = r.reduce((s, x) => s + x.w * (BRUS_PER_KOP() / x.kop_efter + x.sdLn ** 2), 0) / W;
  return Math.max(tot - brus, 0);
}

export function kalibrering(alla, hallRader, { idag, statistik = {}, vantar = [], placeboRader = [], vandring: vandr = null, sagtandRader = [], vantaRader = [], revideringRader = [], konton = [], delvis = false, tidigare = null } = {}) {
  const giltiga = alla.filter((r) => r.metod === METOD_VERSION);
  const nuvarande = REGELVERK[REGELVERK.length - 1].namn;
  const nya = giltiga.filter((r) => r.regelverk === nuvarande || r.av === 'axel');
  const per = { kort: hinkar(giltiga.filter((r) => r.horisont === 'kort')), lang: hinkar(giltiga.filter((r) => r.horisont === 'lang')) };
  const perNya = { kort: hinkar(nya.filter((r) => r.horisont === 'kort')), lang: hinkar(nya.filter((r) => r.horisont === 'lang')) };
  const hall = { kort: hallHinkar(hallRader.kort ?? []), lang: hallHinkar(hallRader.lang ?? []) };
  const plac = placeboSammanfattning(placeboRader);
  const rev = revideringSammanfattning(revideringRader);
  // Hur långt det nuvarande regelverket har kommit mot ett förslag, per trappsteg.
  const nyaRegeln = Object.fromEntries(Object.keys(TRAPPSTEG).map((v) => { const b = perNya.lang[`HOJ|trappa|${v}`]; return [v, { matta: b?.bedomda ?? 0, kampanjer: b?.bedomda_kampanjer ?? 0 }]; }));
  const kal = {
    schema: KALIBRERING_SCHEMA, metod_version: METOD_VERSION, skapad: idag, metod: 'agent/FACIT.md', konton, delvis, horisonter: HORISONTER,
    regelverk_nu: nuvarande, nya_regeln: nyaRegeln,
    hinkar: per, hinkar_nya_regeln: perNya, hall, placebo: plac, sagtand: sagtandHinkar(sagtandRader),
    vantekostnad: vantekostnadHinkar(vantaRader), revidering: rev, statistik, vantar: vantar.length,
    vandring: vandr ? { kort: runda(vandr.kort, 3), lang: runda(vandr.lang, 3) } : null,
  };
  // Kandidater: det datan stöder i dag. Förslag: kandidater som stått
  // FORSLAG_DAGAR_I_RAD körningar i rad, på en hel (inte delvis) dag, med
  // godkänt placebo. En delvis dag rör inte historiken.
  const kandidater = delvis ? [] : forslag({ hinkarNya: perNya.lang, hinkarNyaKort: perNya.kort, hinkarAlla: per.lang, hinkarAllaKort: per.kort, hall: hall.lang, revidering: rev });
  const historik = { ...(tidigare?.forslag_historik ?? {}) };
  if (!delvis && tidigare?.skapad !== idag) {
    const nu = new Set(kandidater.map((f) => f.nyckel));
    for (const k of Object.keys(historik)) if (!nu.has(k)) delete historik[k];
    for (const k of nu) {
      const h = historik[k];
      const fortsatter = h && dagarMellan(h.senast, idag) <= 2;
      historik[k] = { forst: fortsatter ? h.forst : idag, senast: idag, dagar_i_rad: fortsatter ? h.dagar_i_rad + 1 : 1 };
    }
  }
  kal.forslag_historik = historik;
  // Spärr: mätaren ska hålla totalt OCH i läget förslaget bygger på.
  const sparr = (f) => (!plac.godkant ? 'mätaren är inte godkänd' : f.matare && !plac.lagen?.[f.matare]?.godkant ? `mätaren är inte godkänd vid ROAS/BE ${f.matare}` : null);
  kal.kandidater = kandidater.map((f) => ({ ...f, dagar_i_rad: historik[f.nyckel]?.dagar_i_rad ?? 0, sparrad: sparr(f) }));
  kal.forslag = kal.kandidater.filter((f) => f.dagar_i_rad >= FORSLAG_DAGAR_I_RAD && !f.sparrad).map((f, i) => ({ ...f, nr: i + 1 }));
  return kal;
}

// ── Noten bredvid dagens beslut (läses av agent/rond.mjs) ────────────────────

/** Vilken familj dagens dom hör till. Hållbeslut över target / mellan / under break-even. */
export function familjForDom(rad) {
  const kod = rad?.dom?.kod;
  if (HOJ_KODER.includes(kod)) return 'HOJ';
  if (SANK_KODER.includes(kod)) return 'SANK';
  if (kod === 'STANG_AV' || kod === 'ATGARDSTRAPPAN') return 'STANG';
  if (!HALL_KODER.includes(kod)) return null;
  const be = rad?.dom?.breakEven;
  if (!Number.isFinite(rad?.roas3d) || !Number.isFinite(be)) return null;
  if (rad.roas3d >= targetRoas(be, rad.targetRoas ?? null).target) return 'HALL_HOG';
  if (rad.roas3d < be) return 'HALL_FORLUST';
  return 'HALL_MELLAN';
}

/** Hinken säger något bredvid dagens beslut först från så många olika kampanjer. */
export const MIN_KAMPANJER_NOT = 3;

const kampanjer = (n) => `${n} ${n === 1 ? 'kampanj' : 'kampanjer'}`;
const hinkText = (b) => `${b.ratt} rätt, ${b.fel} fel, ${b.osakra} för jämna att döma, på ${kampanjer(b.bedomda_kampanjer)} · ${kr(b.delta_vinst_kr)} mot att låta budgeten stå${b.intervall_80 ? ` (80 %: ${kr(b.intervall_80[0])} till ${kr(b.intervall_80[1])})` : ''}`;
const hallText = (b, familj) => {
  const n = b.kampanjdygn;
  const netto = `netto ${kr(b.netto_kr)} på ${b.unika_dygn} unika kampanjdygn`;
  if (familj === 'HALL_HOG') return `${brak(b.utfall.HOLL ?? 0, n)} stod kvar över target efter väntan${b.nasta_morgon.av ? `, ${brak(b.nasta_morgon.over, b.nasta_morgon.av)} redan nästa morgon` : ''} (${b.kampanjer} kampanjer)`;
  if (familj === 'HALL_MELLAN') return `${brak(b.utfall.FOLL_UNDER ?? 0, n)} föll under break-even under väntan · ${netto} (${b.kampanjer} kampanjer)`;
  return `${brak(b.utfall.ATERHAMTAD ?? 0, n)} tog sig över break-even · ${netto} (${b.kampanjer} kampanjer)`;
};

/**
 * Facit bredvid ett beslut: hinkens utfall för dagens läge (budgetzon och
 * ROAS/break-even-band), lång horisont. Ren. Ändrar aldrig domen — anroparen
 * lägger resultatet i `dom.facit`. Null när det inte finns något att säga.
 * Avstängningar döms inte kontrafaktiskt — där visas hur hållna kampanjer i
 * förlust i samma band gick.
 */
export function facitNot(kal, rad) {
  if (!kal?.hinkar?.lang) return null;
  const familj = familjForDom(rad);
  if (!familj) return null;
  const be = rad?.dom?.breakEven;
  const zon = zonFor(rad?.budget);
  const band = bandFor(rad?.roas3d, be);
  const delar = [];
  const hinkarNu = [];
  if (familj.startsWith('HALL') || familj === 'STANG') {
    const hallFamilj = familj === 'STANG' ? 'HALL_FORLUST' : familj;
    const nyckel = familj === 'STANG' ? `HALL_FORLUST|band|${band}` : `${familj}|kod|${rad.dom.kod}`;
    const b = kal.hall?.lang?.[nyckel];
    if (b && b.kampanjdygn >= MIN_HALL_DYGN) {
      hinkarNu.push(nyckel);
      const etikett = familj === 'STANG' ? `kampanjer i förlust vid ROAS/BE ${band} som fick leva` : `${rad.dom.kod}`;
      delar.push(`${etikett}: ${hallText(b, hallFamilj)}`);
    }
  } else {
    for (const [dim, varde] of [['zon', zon], ['band', band]]) {
      const b = kal.hinkar.lang[`${familj}|${dim}|${varde}`];
      if (!b) continue;
      hinkarNu.push(`${familj}|${dim}|${varde}`);
      const etikett = dim === 'zon' ? `vid ${varde} kr` : `vid ROAS/BE ${varde}`;
      if ((b.bedomda_kampanjer ?? 0) < MIN_KAMPANJER_NOT) { delar.push(`${etikett}: för få mätta kampanjer än (${b.bedomda_kampanjer ?? 0})`); continue; }
      delar.push(`${etikett}: ${hinkText(b)}`);
    }
  }
  if (!delar.length) return null;
  // Rena siffror, inga förslag och inga verb — texten står bredvid dagens beslut
  // och får aldrig kunna läsas som en order (kritiken 2026-09-30).
  return { familj, zon, band, hinkar: hinkarNu, text: `Facit ${FAMILJNAMN[familj]} (7 d): ${delar.join(' · ')}` };
}

// ── Rapport och status ───────────────────────────────────────────────────────

const stor = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const decDag = (n) => (Number.isFinite(n) ? String(Math.round(n * 10) / 10).replace('.', ',') : '—');

/** En rad per budgetfamilj (lång horisont). Svenska med kronor, eller engelska utan. */
function familjRad(b, familj, { en = false } = {}) {
  const namn = (en ? FAMILJNAMN_EN : FAMILJNAMN)[familj];
  if (!b.bedomda) {
    return en
      ? `${namn}: ${b.episoder} so far, none measurable yet (launch phase, disturbed or too little history)`
      : `${stor(namn)}: ${b.episoder} st, ingen mätbar än (${b.ej_bedomda} i lanseringsfas, störda eller utan egen historik)`;
  }
  if (en) return `${namn}: ${b.bedomda} measured on ${b.bedomda_kampanjer} campaigns — ${b.ratt} paid off, ${b.fel} did not, ${b.osakra} too close to call`;
  return `${stor(namn)}: ${b.bedomda} av ${b.episoder} mätta · ${hinkText(b)}`;
}

function sammanfattning(kal) {
  const ut = [];
  for (const familj of ['HOJ', 'SANK', 'AXEL_HOJ', 'AXEL_SANK', 'TJUV']) {
    const b = kal.hinkar?.lang?.[`${familj}|alla|alla`];
    if (b) ut.push(familjRad(b, familj));
  }
  const sg = kal.sagtand?.['alla|alla'];
  if (sg) ut.push(`Sågtand: ${brak(sg.vande, sg.hojningar)} höjningar vändes av motorns egen sänkning eller avstängning inom ${SAGTAND_DAGAR} dygn (median ${decDag(sg.median_dagar)} dygn, ${sg.kampanjer} kampanjer)`);
  const st = kal.hinkar?.lang?.['STANG|alla|alla'];
  if (st) ut.push(`Avstängningar: ${st.episoder} registrerade, ingen dom (det går inte att veta vad en avstängd kampanj hade gett) · ${st.aterstartade} startades om, ${st.aterstartade_plus} av dem gick plus`);
  for (const familj of ['HALL_HOG', 'HALL_MELLAN', 'HALL_FORLUST']) {
    const b = kal.hall?.lang?.[`${familj}|alla|alla`];
    if (b) ut.push(`${stor(FAMILJNAMN[familj])}: ${hallText(b, familj)}`);
  }
  return ut;
}

const forslagText = (f) => `⚑ Förslag ${f.nr}: ${f.konstant} från ${f.fran} till ${f.till}. ${f.varfor} Bevis: ${f.bevis}. Svara JA ${f.nr} eller NEJ ${f.nr}.`;

/** Rondens leverans: en skärm, svenska, kronor. */
export function status(kal, { en = false } = {}) {
  if (en) return statusEngelska(kal);
  if (!kal) return ['Facit: ingen kalibrering än (agent/kalibrering.json saknas).'];
  const ut = [`Facit ${kal.skapad}${kal.delvis ? ' (DELVIS — ett konto saknades, inga förslag i dag)' : ''} — så gick budgetbesluten 7 dygn efter, mot att låta budgeten stå:`];
  for (const familj of ['HOJ', 'SANK', 'AXEL_HOJ']) {
    const b = kal.hinkar?.lang?.[`${familj}|alla|alla`];
    if (b) ut.push(`- ${familjRad(b, familj)}`);
  }
  const sg = kal.sagtand?.['alla|alla'];
  if (sg) ut.push(`- Sågtand: ${brak(sg.vande, sg.hojningar)} höjningar vändes av motorn själv inom ${SAGTAND_DAGAR} dygn (median ${decDag(sg.median_dagar)} dygn).`);
  const p = kal.placebo;
  if (p) { const h = p.lagen?.[PLACEBO_HOJ]; ut.push(`- Mätaren, prövad på ${p.kampanjdygn} dygn där ingen rörde budgeten: ${kr(p.summa_kr)} (ska vara nära noll${p.intervall_80 ? `, 80 %: ${kr(p.intervall_80[0])} till ${kr(p.intervall_80[1])}` : ''}) — ${p.godkant ? 'godkänd' : 'EJ godkänd, inga förslag går ut'}${h ? `; i toppläget där motorn höjer ${kr(h.summa_kr)}, ${h.godkant ? 'godkänd' : 'EJ godkänd'}` : ''}.`); }
  const nr = kal.nya_regeln ?? {};
  if (Object.keys(nr).length) ut.push(`- Nya regeln (${kal.regelverk_nu}): mätta höjningar per trappsteg ${Object.entries(nr).map(([v, x]) => `${v} × target ${x.matta} av ${FORSLAG_MIN_EPISODER}`).join(' · ')}.`);
  const f = kal.forslag ?? [];
  const k = (kal.kandidater ?? []).filter((x) => !f.some((y) => y.nyckel === x.nyckel));
  for (const x of f) ut.push(`- ${forslagText(x)}`);
  if (!f.length) ut.push(`- Inga regelförslag${k.length ? ` (på väg: ${k.map((x) => `${x.konstant} till ${x.till}, dag ${x.dagar_i_rad} av ${FORSLAG_DAGAR_I_RAD}${x.sparrad ? ', spärrad' : ''}`).join('; ')})` : ''}.`);
  return ut;
}

/** Discord-raden på engelska: bara antal, inga kronor och ingen break-even —
 *  redigerarna läser #scaling (CLAUDE.md: redigerare ser aldrig spend). */
export function statusEngelska(kal) {
  if (!kal) return ['Facit: no calibration yet.'];
  const ut = [`Facit ${kal.skapad} — how the robot's budget moves turned out (7 days after):`];
  for (const familj of ['HOJ', 'SANK']) {
    const b = kal.hinkar?.lang?.[`${familj}|alla|alla`];
    if (b) ut.push(`- ${familjRad(b, familj, { en: true })}`);
  }
  const sg = kal.sagtand?.['alla|alla'];
  if (sg) ut.push(`- sawtooth: ${sg.vande} of ${sg.hojningar} raises were followed by the robot's own cut or pause within ${SAGTAND_DAGAR} days`);
  const f = kal.forslag?.length ?? 0;
  ut.push(`- ${f ? `${f} rule proposal(s) waiting for Axel.` : 'No rule proposals.'}`);
  return ut;
}

export function rapportMd(kal, { nya = [] } = {}) {
  const ut = [];
  const sortera = (x, y) => (x.dimension === y.dimension ? String(x.varde).localeCompare(String(y.varde), 'sv') : x.dimension.localeCompare(y.dimension));
  ut.push(`# Facit — ${kal.skapad}`);
  ut.push('');
  ut.push('Så har Skalnings kungens budgetbeslut gått. Varje höjning och sänkning jämförs med vad GAMMAL budget hade gett: samma spend som före beslutet, och den ROAS kampanjen hade fått ändå. Den räknas från kampanjens egen nivå veckan innan plus den del av en topp eller dipp som brukar hålla i sig, mätt på andra kampanjers dygn där ingen rörde budgeten. Skillnaden i vinst är beslutets facit. Metoden, provbänken och det mätaren inte klarar: `agent/FACIT.md`. **Facit ändrar ingenting** — förslagen nedan är Axels beslut.');
  ut.push('');
  ut.push('Ett enskilt beslut är oftast för jämnt att döma: tre till sju dygns köp räcker sällan för att skilja ett bra beslut från tur. Det är hinkarna över veckor som lär motorn något.');
  ut.push('');
  ut.push('## Sammanfattning (7 dygn efter)');
  ut.push('');
  for (const s of sammanfattning(kal)) ut.push(`- ${s}`);
  ut.push('');

  const f = kal.forslag ?? [];
  ut.push(`## ⚑ Förslag till Axel (${f.length})`);
  ut.push('');
  if (!f.length) ut.push(`Inga än. Ett förslag kräver minst ${FORSLAG_MIN_EPISODER} mätta beslut på ${FORSLAG_MIN_KAMPANJER} olika kampanjer i samma hink, ett 80 %-intervall som inte korsar noll, samma tecken utan den största kampanjen och i det korta fönstret, en godkänd mätare, och att det stått ${FORSLAG_DAGAR_I_RAD} morgnar i rad.`, '');
  for (const x of f) {
    ut.push(`### Förslag ${x.nr}: \`${x.konstant}\` från ${x.fran} till ${x.till}`);
    ut.push('');
    ut.push(`${x.varfor} Bevis: ${x.bevis}.${Number.isFinite(x.kr_per_vecka) ? ` Hinken: ${kr(x.kr_per_vecka)} per kampanjvecka.` : ''} Konstanten står i \`agent/besked.mjs\`.`);
    ut.push('');
    ut.push(`Svara **JA ${x.nr}** eller **NEJ ${x.nr}**. Inget ändras förrän du svarat.`);
    ut.push('');
  }
  const kand = (kal.kandidater ?? []).filter((x) => !f.some((y) => y.nyckel === x.nyckel));
  if (kand.length) {
    ut.push(`### På väg (ett förslag måste stå ${FORSLAG_DAGAR_I_RAD} morgnar i rad)`);
    ut.push('');
    for (const x of kand) ut.push(`- \`${x.konstant}\` från ${x.fran} till ${x.till}: dag ${x.dagar_i_rad} av ${FORSLAG_DAGAR_I_RAD}${x.sparrad ? ` — SPÄRRAD: ${x.sparrad}` : ''}. ${x.varfor} ${x.bevis}.`);
    ut.push('');
  }

  const p = kal.placebo;
  if (p) {
    ut.push('## Mätaren — mäter den rätt?');
    ut.push('');
    ut.push(`Mätaren prövas varje morgon på ${p.kampanjdygn} kampanjdygn (${p.kampanjer} kampanjer) där ingen rörde budgeten, en kampanj i taget med kampanjen själv borttagen. Den intäkt den hittar på där ska vara nära noll: ${kr(p.summa_kr)}${p.intervall_80 ? ` (80 %: ${kr(p.intervall_80[0])} till ${kr(p.intervall_80[1])})` : ''}. ${p.godkant ? '**Godkänd** — intervallet innehåller noll.' : '**Inte godkänd** — då går inga förslag till Axel.'}`);
    ut.push('');
    for (const [l, x] of Object.entries(p.lagen ?? {})) ut.push(`- ROAS/BE ${l}: ${kr(x.summa_kr)} på ${x.kampanjdygn} dygn (${x.kampanjer} kampanjer)${x.intervall_80 ? `, 80 %: ${kr(x.intervall_80[0])} till ${kr(x.intervall_80[1])}` : ''} — ${x.godkant ? 'godkänd' : 'inte godkänd'}${l === PLACEBO_HOJ ? ' (spärrar förslag om höjningar)' : ''}`);
    if (kal.vandring) ut.push(`- Kampanjernas egen vandring utöver köpbruset (log-varians, läggs på varje intervall): ${dec(kal.vandring.kort, 3)} på 3 dygn, ${dec(kal.vandring.lang, 3)} på 7 dygn.`);
    ut.push('');
  }

  const tabell = (familj, rubrik) => {
    const rader = Object.values(kal.hinkar?.lang ?? {}).filter((b) => b.familj === familj && b.dimension !== 'alla' && b.dimension !== 'produkt');
    if (!rader.length) return;
    ut.push(`## ${rubrik}`);
    ut.push('');
    ut.push('| Hink | Beslut | Mätta kampanjer | Rätt / fel / för jämna | Σ Δ vinst | 80 % | Median | Utan största | Marginal-ROAS | Break-even |');
    ut.push('|---|---|---|---|---|---|---|---|---|---|');
    for (const b of rader.sort(sortera)) {
      const iv = b.intervall_80 ? `${kr(b.intervall_80[0])} … ${kr(b.intervall_80[1])}` : '—';
      ut.push(`| ${dimNamn(b.dimension)}: ${b.varde} | ${b.episoder} | ${b.bedomda_kampanjer} | ${b.ratt} / ${b.fel} / ${b.osakra} | ${b.bedomda ? kr(b.delta_vinst_kr) : '—'} | ${iv} | ${kr(b.median_kr)} | ${kr(b.utan_storsta_kr)} | ${dec(b.marginal_roas)} | ${dec(b.break_even_viktad)} |`);
    }
    ut.push('');
  };
  const sgr = Object.values(kal.sagtand ?? {}).filter((b) => b.dimension !== 'alla');
  if (sgr.length) {
    ut.push(`## Sågtanden — höjning följd av motorns egen sänkning inom ${SAGTAND_DAGAR} dygn`);
    ut.push('');
    ut.push('Ren räkning på loggen, ingen kontrafaktik. En hög andel betyder att motorn höjer på toppar som inte håller.');
    ut.push('');
    for (const b of sgr.sort(sortera)) ut.push(`- ${dimNamn(b.dimension)} ${b.varde}: ${brak(b.vande, b.hojningar)} vände (${b.stangda} till avstängning), median ${decDag(b.median_dagar)} dygn, ${b.kampanjer} kampanjer`);
    ut.push('');
  }
  tabell('HOJ', 'Höjningar — var det lönar sig att skala');
  tabell('SANK', 'Sänkningar — sparade de pengar?');
  tabell('AXEL_HOJ', 'Dina egna höjningar (allt i Metas aktivitetslogg som inte står i budgetloggen)');
  tabell('AXEL_SANK', 'Dina egna sänkningar');
  tabell('TJUV', 'Tjuvpauser — blev kampanjen bättre?');

  const st = Object.values(kal.hinkar?.lang ?? {}).filter((b) => b.familj === 'STANG' && b.dimension === 'band');
  if (st.length) {
    ut.push('## Avstängningar — det som faktiskt hände');
    ut.push('');
    ut.push('En avstängd kampanj har ingen data efteråt, så facit fäller ingen dom. Här står antalet per band, hur många som startades om och gick plus, och hur kampanjer i samma band gick när de fick leva (överlevare — de som fick leva var de motorn trodde på).');
    ut.push('');
    for (const b of st.sort((x, y) => String(x.varde).localeCompare(String(y.varde), 'sv'))) {
      const levde = kal.hall?.lang?.[`HALL_FORLUST|band|${b.varde}`];
      ut.push(`- ROAS/BE ${b.varde}: ${b.episoder} avstängda (${b.kampanjer} kampanjer), ${b.aterstartade} återstartade varav ${b.aterstartade_plus} gick plus${levde ? ` · de som fick leva i bandet: ${hallText(levde, 'HALL_FORLUST')}` : ''}`);
    }
    ut.push('');
  }

  const hall = Object.values(kal.hall?.lang ?? {}).filter((b) => b.dimension === 'kod');
  if (hall.length) {
    ut.push('## Hållbeslut — vad väntan gav (7 dygn, rullande 45 dygn)');
    ut.push('');
    ut.push('Nettot räknas på unika kampanjdygn: intäkt ÷ break-even − spend. Över target finns inget netto att räkna — där är frågan om toppen höll.');
    ut.push('');
    ut.push('| Läge | Kod | Kampanjdygn | Kampanjer | Utfall | Över target nästa morgon | Netto |');
    ut.push('|---|---|---|---|---|---|---|');
    for (const b of hall.sort((x, y) => y.kampanjdygn - x.kampanjdygn)) {
      ut.push(`| ${FAMILJNAMN[b.familj]} | ${b.varde} | ${b.kampanjdygn} | ${b.kampanjer} | ${Object.entries(b.utfall).map(([k, v]) => `${k} ${brak(v, b.kampanjdygn)}`).join(', ')} | ${b.nasta_morgon.av ? brak(b.nasta_morgon.over, b.nasta_morgon.av) : '—'} | ${b.familj === 'HALL_HOG' ? '—' : `${kr(b.netto_kr)} (${b.unika_dygn} dygn)`} |`);
    }
    ut.push('');
  }

  const vk = kal.vantekostnad?.alla;
  if (vk) {
    ut.push('## Väntans kostnad — väntedygn över target som följdes av en höjning');
    ut.push('');
    ut.push(`${vk['hålldygn']} väntedygn över target (${vk.kampanjer} kampanjer) följdes av en höjning inom 3 dygn. Höjningarnas mätta vinst per dygn, summerad över väntedygnen: ${kr(vk.kostnad_kr)}. Plus betyder att höjningen tjänade pengar, alltså att väntan kostade ungefär så mycket; minus att väntan sparade pengar.`);
    ut.push('');
    for (const b of Object.values(kal.vantekostnad).filter((x) => x.kod !== 'alla')) ut.push(`- ${b.kod}: ${b['hålldygn']} väntedygn, ${kr(b.kostnad_kr)}`);
    ut.push('');
  }
  const rv = kal.revidering;
  if (rv?.rader) {
    ut.push('## Revideras siffrorna i efterhand? (underlag för `NARA_GRANS_PP`)');
    ut.push('');
    ut.push(`Samma tredygnsfönster hämtat i dag jämfört med det motorn loggade (7d_click-tiden): ${rv.rader} rader, median omhämtad ÷ loggad ROAS ${dec(rv.median_kvot, 3)}. Av ${rv.nara} rader nära en zongräns korsade ${rv.nara_korsade} gränsen vid omhämtningen.`);
    ut.push('');
  }

  const prod = Object.values(kal.hinkar?.lang ?? {}).filter((b) => b.dimension === 'produkt' && b.bedomda > 0 && ['HOJ', 'SANK', 'AXEL_HOJ', 'AXEL_SANK'].includes(b.familj)).sort((x, y) => x.delta_vinst_kr - y.delta_vinst_kr);
  if (prod.length) {
    ut.push('## Per produkt (mätta beslut)');
    ut.push('');
    for (const b of prod) ut.push(`- ${b.varde} — ${FAMILJNAMN[b.familj]}: ${b.ratt} rätt, ${b.fel} fel, ${b.osakra} för jämna, ${kr(b.delta_vinst_kr)}`);
    ut.push('');
  }

  const dagens = nya.filter((r) => r.horisont === 'lang');
  if (dagens.length) {
    ut.push(`## Nya facit i dag (${dagens.length} beslut, 7 dygn)`);
    ut.push('');
    for (const r of dagens.slice(0, 60)) {
      ut.push(`- ${r.start}${r.slut !== r.start ? `–${r.slut}` : ''} **${String(r.kampanj_namn ?? r.kampanj_id).split('|')[0].trim()}** (${r.marknad}) ${FAMILJNAMN[r.familj]} ${r.beslut_fran_sek ?? '?'} → ${r.beslut_till_sek ?? '?'} kr: **${r.dom}**${r.orsak ? ` — ${r.orsak}` : ''}${r.bedombar ? ` · ${kr(r.delta_vinst_kr)} (80 %: ${kr(r.intervall_80?.[0])} till ${kr(r.intervall_80?.[1])})` : ''}${r.marginal_roas !== null && r.marginal_roas !== undefined && r.bedombar ? ` · marginal-ROAS ${dec(r.marginal_roas)} mot ${dec(r.break_even)}` : ''}${r.kontrafaktiskt ? ` · ${r.kontrafaktiskt}` : ''}${r.etikett ? ` · ${r.etikett}` : ''}${r.avbruten ? ' · AVBRUTEN av motorn' : ''}${r.avkortat && !r.avbruten ? ` · kapat: ${r.avkortat}` : ''}${r.aterstartad ? ` · ÅTERSTARTAD (${kr(r.aterstartad.vinst_kr)})` : ''}`);
    }
    ut.push('');
  }

  ut.push('## Datan');
  ut.push('');
  for (const [k, s] of Object.entries(kal.statistik ?? {})) {
    const kl = s.kontroll_lang;
    ut.push(`- ${k}: ${s.dygnsrader} dygnsrader ${s.since}..${s.until}, ${s.budgetandringar} budgetändringar i Metas aktivitetslogg varav ${s.handandringar} för hand. Kontrollen: ${s.kontrollprov_lang} orörda 7-dygnsprov${kl && !kl.saknas ? ` (${kl.kampanjer} kampanjer; en kampanj på break-even veckan innan och 1,5 × före med 10 köp väntas ge ${dec(kl.kvot_vid_1_5)} × break-even utan ändring, ρ ${dec(kl.rho_10_kop)})` : kl?.orsak ? ` — ${kl.orsak}` : ''}.`);
  }
  ut.push(`- ${kal.vantar} beslut väntar på att fönstret stänger och mognar (${MOGNAD_DAGAR} dygn).`);
  ut.push(`- Beslut före ${ATTRIBUTION_7D_CLICK_FRAN} fattades på siffror med visningsköp; facit räknar allt i 7d_click.`);
  ut.push('- Nya annonser som laddas upp i samma kampanj under fönstret syns inte som störning — de påverkar ROAS utan att budgeten ändrats.');
  ut.push('');
  return ut.join('\n');
}

const dimNamn = (d) => ({ marknad: 'marknad', zon: 'budget före', band: 'ROAS/BE vid beslutet', trappa: 'ROAS ÷ target', fart: 'fart', forsta_steg: 'första steget', total: 'hela ändringen', kedja: 'kedja', regelverk: 'regelverk' }[d] ?? d);

// ── CLI ──────────────────────────────────────────────────────────────────────

function lasJsonl(fil) {
  if (!existsSync(fil)) return [];
  return readFileSync(fil, 'utf8').split('\n').filter((l) => l.trim()).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } });
}

const svensktDatumIdag = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

async function main(argv) {
  const flagga = (namn, fallback = null) => { const i = argv.indexOf(namn); return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback; };
  if (argv.includes('--status')) {
    const kal = existsSync(KALIBRERINGSFIL) ? JSON.parse(readFileSync(KALIBRERINGSFIL, 'utf8')) : null;
    console.log(status(kal, { en: argv.includes('--en') }).join('\n'));
    return;
  }
  const idag = flagga('--idag', svensktDatumIdag());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(idag)) { console.error('Ogiltigt --idag.'); process.exit(2); }
  const valda = flagga('--konto', 'alla') === 'alla' ? ['SE', 'NO'] : [flagga('--konto')];
  // Skriver bara med --skriv (rutinens steg 6b) — en utvecklingssession som kör
  // skriptet ska aldrig råka lägga rader i facit.jsonl (kritiken 2026-09-30).
  const torr = !argv.includes('--skriv') || argv.includes('--torr') || process.env.FACIT_INGEN_SKRIVNING === '1';

  const { cachefil, hamtaFacitdata, CACHE, TIDSGRANS_MS } = await import('./hamta-facit.mjs');
  const data = {};
  const varningar = [];
  const deadline = Date.now() + TIDSGRANS_MS; // gemensam för båda kontona
  for (const k of valda) {
    const fil = flagga('--data') && valda.length === 1 ? flagga('--data') : cachefil(k, idag);
    try {
      if (argv.includes('--hamta')) {
        const d = await hamtaFacitdata(k, { idag, deadline });
        mkdirSync(CACHE, { recursive: true });
        writeFileSync(cachefil(k, idag), `${JSON.stringify(d)}\n`);
        data[k] = d;
      } else if (existsSync(fil)) {
        data[k] = JSON.parse(readFileSync(fil, 'utf8'));
      } else {
        varningar.push(`${k}: ingen data (${fil}) — kör med --hamta.`);
      }
    } catch (e) {
      varningar.push(`${k}: hämtningen misslyckades — ${e.message}. Facit räknas utan ${k} i dag (delvis — inga förslag).`);
    }
  }
  if (!Object.keys(data).length) {
    console.error(`FACIT: ingen data — ${varningar.join(' ')} Ronden går vidare utan facit.`);
    process.exit(1);
  }

  const logg = lasJsonl(join(HÄR, 'budgetlogg.jsonl'));
  let karta = {};
  try { for (const p of JSON.parse(readFileSync(join(HÄR, 'produktkarta.json'), 'utf8')).kampanjer ?? []) karta[p.campaign_id] = p; } catch { karta = {}; }
  const sparade = lasJsonl(FACITFIL);
  let tidigare = null;
  try { tidigare = existsSync(KALIBRERINGSFIL) ? JSON.parse(readFileSync(KALIBRERINGSFIL, 'utf8')) : null; } catch { tidigare = null; }
  const utfall = kor({ logg, data, idag, sparade, karta, forvantadeKonton: valda, tidigare });
  utfall.kalibrering.varningar = varningar;

  if (argv.includes('--json')) { console.log(JSON.stringify(utfall.kalibrering, null, 2)); }
  const md = rapportMd(utfall.kalibrering, utfall);
  if (torr) {
    if (!argv.includes('--json')) console.log(md);
    console.error(`FACIT (torr): ${utfall.nya.length} nya rader skulle skrivas. Inget skrivet — rutinen skriver med --skriv.`);
    return;
  }
  if (utfall.nya.length) appendFileSync(FACITFIL, utfall.nya.map((r) => JSON.stringify(r)).join('\n') + '\n');
  const tmp = `${KALIBRERINGSFIL}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(utfall.kalibrering, null, 2)}\n`);
  renameSync(tmp, KALIBRERINGSFIL);
  const rapportfil = join(HÄR, 'utdata', `facit-${idag}.md`);
  mkdirSync(dirname(rapportfil), { recursive: true });
  writeFileSync(rapportfil, `${md}\n`);
  for (const v of varningar) console.error(`⚠ ${v}`);
  console.error(`FACIT: ${utfall.nya.length} nya rader i agent/facit.jsonl, kalibreringen i agent/kalibrering.json, rapporten i agent/utdata/facit-${idag}.md.`);
  console.log(status(utfall.kalibrering).join('\n'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((e) => { console.error(`FACIT AVBRÖTS: ${e.message}`); process.exit(1); });
}
