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
import { lasBelopp, targetRoas, GOLV_SEK, MIN_SPEND_FOR_DOM, MIN_KOP_FOR_DOM } from './besked.mjs';

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

/** Kontrollfaktorn: minst så många kampanjdygn från så många ANDRA kampanjer i
 *  bandet. Annars grannbanden, sedan båda marknaderna, annars k = 1 och sagt.
 *  Mätt 2026-09-30: kravet "ingen ändring på elva dygn" gav 6 prov i Sverige —
 *  motorn rör nästan allt var tredje dag — så kontrollen räknas i stället som
 *  regressionens skärningspunkt (se kontrollfaktor). */
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
  HALL_HOG: 'väntan över target', HALL_MELLAN: 'väntan mellan break-even och target', HALL_FORLUST: 'väntan i förlust',
});
const FAMILJNAMN_EN = Object.freeze({
  HOJ: 'raises', SANK: 'cuts', STANG: 'kills', TJUV: 'thief pauses',
  HALL_HOG: 'holds above target', HALL_MELLAN: 'holds between break-even and target', HALL_FORLUST: 'holds in loss',
});

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
    if (!['HOJ', 'SANK', 'STANG', 'TJUV'].includes(b.familj)) continue;
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

// ── Kontrollen: regressionen mot medelvärdet ────────────────────────────────

/**
 * Prov för kontrollen: varje kampanjdygn d med ett bedömbart före-fönster
 * (≥ 300 kr, ≥ 3 köp, spend varje dygn) och spend varje dygn i efter-fönstret
 * D+1..D+h. Ändringar spelar ingen roll här — regressionen räknar bort dem.
 *   x = log(spend per dygn efter ÷ före)      (hur mycket spenden flyttade)
 *   y = log(ROAS efter ÷ ROAS före)            (hur ROAS rörde sig)
 */
export function kontrollprov(serie, beIndex, { marknadFor: mf, since, until, h }) {
  const prov = [];
  for (const [kid, m] of serie) {
    const datum = [...m.keys()].sort();
    if (!datum.length) continue;
    const forsta = datum[0] > since ? datum[0] : since;
    for (let d = plusDagar(forsta, FORE_DAGAR); plusDagar(d, h) <= until; d = plusDagar(d, 1)) {
      const fore = summa(serie, kid, plusDagar(d, -FORE_DAGAR), plusDagar(d, -1));
      if (fore.nolldygn || fore.spend < MIN_SPEND_FOR_DOM || fore.kop < MIN_KOP_FOR_DOM || !(fore.roas > 0)) continue;
      const efter = summa(serie, kid, plusDagar(d, 1), plusDagar(d, h));
      if (efter.nolldygn) continue;
      const be = beIndex(kid, d);
      if (!Number.isFinite(be)) continue;
      const x = Math.log((efter.spend / efter.dagar) / (fore.spend / fore.dagar));
      prov.push({ kampanj_id: kid, datum: d, marknad: mf(kid), band: bandFor(fore.roas, be), x, q: fore.roas / be, y: (efter.roas ?? 0) / be, w: fore.spend });
    }
  }
  return prov;
}

const bandIndex = (namn) => BAND.findIndex((b) => b.namn === namn);

/**
 * Viktad minsta kvadrat y = a + b·q + c·x (tre okända, normalekvationerna).
 * Saknas spridning i x eller q faller den koefficienten bort (sätts till 0).
 */
export function regression(prov) {
  const W = prov.reduce((s, p) => s + p.w, 0);
  if (!(W > 0) || prov.length < 3) return null;
  const m = (f) => prov.reduce((s, p) => s + p.w * f(p), 0) / W;
  const mq = m((p) => p.q); const mx = m((p) => p.x); const my = m((p) => p.y);
  const sqq = m((p) => (p.q - mq) ** 2); const sxx = m((p) => (p.x - mx) ** 2); const sqx = m((p) => (p.q - mq) * (p.x - mx));
  const sqy = m((p) => (p.q - mq) * (p.y - my)); const sxy = m((p) => (p.x - mx) * (p.y - my));
  let b = 0; let c = 0;
  const det = sqq * sxx - sqx * sqx;
  if (sqq > 1e-9 && sxx > 1e-9 && Math.abs(det) > 1e-12) { b = (sqy * sxx - sxy * sqx) / det; c = (sxy * sqq - sqy * sqx) / det; }
  else if (sqq > 1e-9) b = sqy / sqq;
  else if (sxx > 1e-9) c = sxy / sxx;
  return { a: my - b * mq - c * mx, b, c };
}

/**
 * Kontrafaktisk ROAS (i break-even-enheter) för en kampanj som hade ROAS/BE = q
 * före beslutet, om spenden INTE flyttat: a + b·q ur regressionen över andra
 * kampanjers dygn. b < 1 är regressionen mot medelvärdet — en kampanj som nyss
 * gått ovanligt bra förväntas falla tillbaka, en i förlust studsa upp.
 *
 * Varför kontinuerligt och inte per band (mätt 2026-09-30 i simuleringstestet):
 * motorn höjer precis vid target, bandets nedre kant, och ett bandsnitt
 * underskattade då det kontrafaktiska — sann vinst 0 kr blev +13 274 kr med
 * log-kvoter per band, +8 853 kr med kvoter per band.
 * Kampanjen som bedöms räknas aldrig in i sin egen kontroll. Tunn marknad ⇒
 * båda marknaderna; annars saknas kontrollen och det sägs.
 */
export function kontrollfaktor(prov, { q = null, band = null, marknad, utom = null }) {
  for (const marknader of [[marknad], ['SE', 'NO']]) {
    const urval = prov.filter((p) => p.kampanj_id !== utom && marknader.includes(p.marknad) && p.q > 0 && p.q < KONTROLL_MAX_Q);
    const kampanjer = new Set(urval.map((p) => p.kampanj_id)).size;
    if (urval.length < KONTROLL_MIN_PROV || kampanjer < KONTROLL_MIN_KAMPANJER) continue;
    const reg = regression(urval);
    if (!reg) continue;
    const qq = Number.isFinite(q) ? q : bandMitt(band);
    const kvot = Math.max(reg.a + reg.b * qq, 0);
    return { kvot, k: qq > 0 ? kvot / qq : null, a: reg.a, b: reg.b, elasticitet: reg.c, prov: urval.length, kampanjer, marknad: marknader.join('+') };
  }
  return { kvot: null, k: 1, prov: 0, kampanjer: 0, marknad, saknas: true };
}

/** Kontrollen räknas på dygn med ROAS under 5 × break-even (extrema dygn på få köp styr annars linjen). */
export const KONTROLL_MAX_Q = 5;
const bandMitt = (namn) => { const i = BAND.findIndex((b) => b.namn === namn); if (i < 0) return null; const lag = i === 0 ? 0.5 : BAND[i - 1].upp; const hog = Number.isFinite(BAND[i].upp) ? BAND[i].upp : lag * 1.3; return (lag + hog) / 2; };

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
  };

  // Episoden kan fortfarande växa: vänta tills en ny ändring åt samma håll inte längre hinner komma.
  if (plusDagar(ep.slut, KEDJA_DAGAR) > until && ['HOJ', 'SANK'].includes(ep.familj)) return null;

  // Före-fönstret = urvalsfönstret, exakt det motorn såg (D−3..D−1).
  const foreFran = plusDagar(ep.start, -FORE_DAGAR);
  if (foreFran < ctx.since) return { ...bas, dom: 'UTANFOR_DATAN', orsak: `före-fönstret börjar ${foreFran}, datan ${ctx.since}` };
  const fore = summa(serie, ep.kampanj_id, foreFran, plusDagar(ep.start, -1));
  const be = Number.isFinite(ep.be) ? ep.be : ctx.beIndex(ep.kampanj_id, ep.start);
  const target = Number.isFinite(be) ? targetRoas(be).target : null;
  bas.break_even = Number.isFinite(be) ? be : null;
  bas.target = Number.isFinite(target) ? Math.round(target * 1000) / 1000 : null;
  bas.band = bandFor(fore.roas, be);
  // Beslutsdatan före 2026-09-25 bar visningsköp (kontots standardattribution);
  // facit räknar allt i 7d_click, så bandet kan skilja från det motorn såg.
  bas.beslutsdata = ep.start < ATTRIBUTION_7D_CLICK_FRAN ? 'med visningsköp' : '7d_click';
  if (!Number.isFinite(be)) return { ...bas, dom: 'SAKNAR_BREAK_EVEN', fore: kort(fore) };
  if (ep.familj !== 'STANG' && fore.nolldygn) return { ...bas, dom: 'LANSERINGSFAS', orsak: `${fore.nolldygn} dygn utan spend i före-fönstret`, fore: kort(fore) };
  const tidigare = handelserMellan(index, ep.kampanj_id, foreFran, plusDagar(ep.start, -1));
  if (ep.familj !== 'STANG' && tidigare.length) return { ...bas, dom: 'STORD', orsak: `${tidigare[0].motor ? 'motorn' : 'handändring'} ${tidigare[0].typ} ${tidigare[0].datum} i före-fönstret`, fore: kort(fore) };

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
    avbruten = storning.motor && ep.familj !== 'STANG';
    orsakKap = `${storning.motor ? 'motorn' : 'handändring'} ${storning.typ} ${storning.datum}`;
  }
  if (ep.familj !== 'STANG') {
    for (let d = eFran; d <= eTill; d = plusDagar(d, 1)) {
      const v = serie.get(ep.kampanj_id)?.get(d);
      if (!v || !(v.spend > 0)) { eTill = plusDagar(d, -1); avbruten = false; orsakKap = `inget spend ${d} (pausad för hand?)`; break; }
    }
  }
  if (plusDagar(eTill, MOGNAD_DAGAR) > until) return null; // fönstret har inte stängt och mognat — väntar
  const eDagar = dagarMellan(eFran, eTill) + 1;
  if (eDagar < (avbruten ? 2 : MIN_EFTER_DAGAR)) return { ...bas, dom: avbruten ? 'AVBRUTEN_TIDIGT' : 'STORD', orsak: orsakKap ?? 'för kort efter-fönster', fore: kort(fore) };
  const efter = summa(serie, ep.kampanj_id, eFran, eTill);
  const rad = { ...bas, fore: kort(fore), efter: kort(efter), avkortat: orsakKap, avbruten };

  // Avstängning: ingen kontrafaktisk dom (kritiken 2026-09-30 — valet av k
  // avgjorde domen helt). Det som räknas är det som faktiskt hände: startades
  // den om, och gick den då plus?
  if (ep.familj === 'STANG') {
    if (efter.spend > 0) rad.aterstartad = { spend: runda(efter.spend, 0), roas: efter.roas === null ? null : runda(efter.roas, 3), vinst_kr: runda(efter.intakt / be - efter.spend, 0) };
    rad.kop_fore = fore.kop;
    return { ...rad, dom: 'REGISTRERAD', orsak: rad.aterstartad ? 'återstartad — utfallet efter återstarten står i raden' : 'ingen kontrafaktisk dom för avstängningar', bedombar: false };
  }

  // Kontrafaktisk ROAS: före-ROAS × k, där k är hur ROAS rör sig för ANDRA
  // kampanjer i samma band när spenden inte flyttar (regressionens skärnings-
  // punkt). Vald på placebotestet 2026-09-30: "veckan innan motorn tittade" som
  // baslinje gav −41 066 kr på 24 dygn där inget ändrades (kampanjer mattas av),
  // regressionen +11 033 kr med ett intervall som innehåller noll.
  const kf = kontrollfaktor(ctx.prov[horisont] ?? [], { q: fore.roas / be, marknad: ep.marknad, utom: ep.kampanj_id });
  if (kf.saknas) return { ...rad, dom: 'UNG', orsak: 'ingen kontroll (för få andra kampanjer)' };
  const roasCf = kf.kvot * be;
  // Osäkerheten i det kontrafaktiska: före-fönstrets brus × lutningen b (så mycket av före-ROAS som går vidare).
  const varCfPerKr = (intaktsvarians(fore) * kf.b * kf.b) / (fore.spend ** 2);
  rad.k = runda(kf.k, 3);
  rad.kontrafaktiskt = `ROAS/BE före ${dec(fore.roas / be)} ⇒ utan ändring ${dec(kf.kvot)} (${kf.prov} kampanjdygn, ${kf.kampanjer} andra kampanjer, ${kf.marknad})`;

  // Vad hade gammal budget gett? Spend som i före-fönstret, ROAS som kontrafaktiskt.
  const sf = fore.spend / fore.dagar;
  const Scf = sf * eDagar;
  const Rcf = roasCf * Scf;
  const dS = efter.spend - Scf;
  const dR = efter.intakt - Rcf;
  const dVinst = dR / be - dS;
  const aov = fore.kop > 0 ? fore.intakt / fore.kop : efter.kop > 0 ? efter.intakt / efter.kop : null;
  const sd = Math.sqrt(intaktsvarians(efter, aov) + varCfPerKr * Scf * Scf) / be;
  rad.delta_spend_kr = runda(dS, 0);
  rad.delta_intakt_kr = runda(dR, 0);
  rad.marginal_roas = Math.abs(dS) >= MIN_FLYTT_SEK ? runda(dR / dS, 3) : null;
  rad.delta_vinst_kr = runda(dVinst, 0);
  rad.intervall_80 = [runda(dVinst - Z80 * sd, 0), runda(dVinst + Z80 * sd, 0)];
  rad.flyttat_kr = runda(Math.abs(dS), 0);
  if (Math.abs(dS) < MIN_FLYTT_SEK) rad.etikett = 'spenden flyttade inte';
  else if (ep.familj === 'HOJ' && dS < 0) rad.etikett = 'KOLLAPS — spenden föll efter höjningen';
  else if (ep.familj === 'SANK' && dS > 0) rad.etikett = 'spenden steg efter sänkningen';
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
    if (eTill > ctx.until || dagarMellan(x.datum, eTill) < MIN_EFTER_DAGAR) continue;
    const fore = summa(ctx.serie, x.kampanj_id, plusDagar(x.datum, -FORE_DAGAR), plusDagar(x.datum, -1));
    const efter = summa(ctx.serie, x.kampanj_id, plusDagar(x.datum, 1), eTill);
    if (fore.spend < MIN_SPEND_FOR_DOM || fore.kop < MIN_KOP_FOR_DOM || efter.nolldygn) continue;
    const be = Number.isFinite(x.be) ? x.be : ctx.beIndex(x.kampanj_id, x.datum);
    if (!Number.isFinite(be)) continue;
    const target = targetRoas(be).target;
    let familj = null; let utfall = null; let forlust = 0;
    if (fore.roas >= target) {
      familj = 'HALL_HOG';
      utfall = efter.roas >= target ? 'HOLL' : efter.roas >= be ? 'SJONK' : 'FORLUST';
    } else if (fore.roas >= be) {
      familj = 'HALL_MELLAN';
      utfall = efter.roas >= be ? 'HOLL_VINST' : 'FOLL_UNDER';
      forlust = Math.max(0, efter.spend - efter.intakt / be);
    } else {
      familj = 'HALL_FORLUST';
      utfall = efter.roas >= be ? 'ATERHAMTAD' : 'FORTSATT_FORLUST';
      forlust = Math.max(0, efter.spend - efter.intakt / be);
    }
    ut.push({
      familj, kod: x.kod, datum: x.datum, kampanj_id: x.kampanj_id, kampanj_namn: x.kampanj_namn, marknad: x.marknad,
      zon: zonFor(x.budget), band: bandFor(fore.roas, be), utfall, forlust_kr: runda(forlust, 0),
      vinst_efter_kr: runda(efter.intakt / be - efter.spend, 0), roas_fore: runda(fore.roas, 3), roas_efter: runda(efter.roas, 3),
    });
  }
  return ut;
}

// ── Kalibreringen: hinkarna ─────────────────────────────────────────────────

export const DIMENSIONER = ['alla', 'marknad', 'zon', 'band', 'forsta_steg', 'total', 'kedja', 'regelverk', 'produkt'];

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
    if (!['HOJ', 'SANK', 'STANG', 'TJUV'].includes(r.familj)) continue;
    for (const dim of DIMENSIONER) {
      if (['forsta_steg', 'total', 'kedja'].includes(dim) && !['HOJ', 'SANK'].includes(r.familj)) continue;
      const varde = dim === 'alla' ? 'alla' : r[dim] ?? 'okänd';
      const nyckel = `${r.familj}|${dim}|${varde}`;
      const b = ut[nyckel] ??= { familj: r.familj, dimension: dim, varde, episoder: 0, bedomda: 0, ratt: 0, fel: 0, osakra: 0, preliminara: 0, avbrutna: 0, ej_bedomda: 0, aterstartade: 0, aterstartade_plus: 0, flyttat_kr: 0, delta_vinst_kr: 0, _dS: 0, _dR: 0, _beVikt: 0, _alla: new Set(), _per: new Map(), _v: [] };
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
    b.intervall_80 = klusterintervall(b._per, nyckel);
    b.flyttat_kr = Math.round(b.flyttat_kr);
    b.delta_vinst_kr = Math.round(b.delta_vinst_kr);
    void absS;
    delete b._dS; delete b._dR; delete b._beVikt; delete b._alla; delete b._per; delete b._v;
  }
  return ut;
}

/** Hållbeslutens hinkar: per kod, band, zon och marknad. */
export function hallHinkar(hallRader) {
  const ut = {};
  for (const r of hallRader) {
    for (const dim of ['alla', 'kod', 'band', 'zon', 'marknad']) {
      const varde = dim === 'alla' ? 'alla' : r[dim] ?? 'okänd';
      const nyckel = `${r.familj}|${dim}|${varde}`;
      const b = ut[nyckel] ??= { familj: r.familj, dimension: dim, varde, kampanjdygn: 0, kampanjer: new Set(), utfall: {}, forlust_kr: 0, vinst_efter_kr: 0 };
      b.kampanjdygn += 1;
      b.kampanjer.add(r.kampanj_id);
      b.utfall[r.utfall] = (b.utfall[r.utfall] ?? 0) + 1;
      b.forlust_kr += r.forlust_kr ?? 0;
      b.vinst_efter_kr += r.vinst_efter_kr ?? 0;
    }
  }
  for (const b of Object.values(ut)) { b.kampanjer = b.kampanjer.size; b.forlust_kr = Math.round(b.forlust_kr); b.vinst_efter_kr = Math.round(b.vinst_efter_kr); }
  return ut;
}

// ── Förslagen till Axel ──────────────────────────────────────────────────────

/** Vilken konstant i besked.mjs ett förslag gäller, per familj och dimension. */
const KONSTANT = {
  'HOJ|zon|≥4 000': 'HOGZON_MAX_FAKTOR / TAK_UTAN_VINNARE',
  'HOJ|forsta_steg|+>60 %': 'TRAPPA (steget ×2 vid ≥ 200 % av target)',
  'HOJ|forsta_steg|+26–60 %': 'TRAPPA (steget ×1,5 vid ≥ 150 % av target)',
  'HOJ|forsta_steg|+≤25 %': 'TRAPPA (steget +20 % vid ≥ target)',
  'HOJ|total|+>60 %': 'SNABB_SKALNING_ROAS / TRAPPA (hur långt en kedja får gå)',
  'HOJ|kedja|2+ steg': 'SNABB_SKALNING_ROAS / SNABB_MIN_DAGAR (snabbspåret)',
  HOJ: 'ZON_SKALA_OVER / KONSEKVENT_DAGAR (när en höjning får ske)',
  SANK: 'ZON_SANK_UNDER / HALVERA (hur hårt motorn sänker)',
  'SANK|forsta_steg|till golvet': 'LIVSTIDS_MAX_BACKDAGAR (livstidsspärrens sänkning till 500 kr)',
  STANG: 'BACK_DAGAR_FOR_AVSTANGNING / spendtjuvens grind',
  'HALL_HOG|kod|VANTA_KONSEKVENT': 'KONSEKVENT_DAGAR (dygn över target före höjning)',
  'HALL_HOG|kod|VANTA_KADENS': 'MIN_DAGAR_MELLAN_ANDRINGAR / SNABB_SKALNING_ROAS',
  'HALL_HOG|kod|LAT_VARA': 'TAK_UTAN_VINNARE / ZON_SKALA_OVER',
  'HALL_HOG|kod|CPA_STIGER': 'CPA_STIG_DAGAR (trend.mjs)',
  'HALL_HOG|kod|UPPSKJUTEN_GRANS': 'NARA_GRANS_PP (uppskjutning nära zongräns)',
  HALL_MELLAN: 'ZON_SANK_UNDER (testprodukter i plus rörs aldrig — Axels regel 2026-08-29)',
  'HALL_FORLUST|kod|VANTA_TROSKEL': 'TEST_TROSKEL_SEK (testet får 1 500 kr innan det döms)',
  'HALL_FORLUST|kod|RAKNA_BACKDAGAR': 'BACK_DAGAR_FOR_AVSTANGNING / LIVSTIDS_MAX_BACKDAGAR',
};
const konstantFor = (b) => KONSTANT[`${b.familj}|${b.dimension}|${b.varde}`] ?? KONSTANT[b.familj] ?? null;

export function forslag(kal) {
  const ut = [];
  for (const b of Object.values(kal.hinkar ?? {})) {
    if (['alla', 'regelverk', 'produkt'].includes(b.dimension) || (b.bedomda_kampanjer ?? 0) < MIN_KAMPANJER_FORSLAG || !b.intervall_80) continue;
    const [lo, hi] = b.intervall_80;
    const hink = `${FAMILJNAMN[b.familj]} där ${dimText(b.dimension)} ${b.varde}`;
    const nyckel = `${b.familj}|${b.dimension}|${b.varde}`;
    const bevis = `${b.bedomda} episoder på ${b.bedomda_kampanjer} kampanjer: ${b.ratt} rätt, ${b.fel} fel, ${b.osakra} osäkra · Σ ${kr(b.delta_vinst_kr)} (80 %: ${kr(lo)} till ${kr(hi)}) · median ${kr(b.median_kr)} per episod · utan största kampanjen ${kr(b.utan_storsta_kr)}${b.marginal_roas !== null ? ` · marginal-ROAS ${dec(b.marginal_roas)} mot break-even ${dec(b.break_even_viktad)}` : ''}`;
    // Samma tecken i kort och lång horisont — annars är det fönstret som talar, inte marknaden.
    const kort = kal.hinkarKort?.[nyckel];
    const kortSamma = (tecken) => kort && Math.sign(kort.delta_vinst_kr) === tecken;
    const vinner = lo > 0 && b.utan_storsta_kr > 0 && b.median_kr > 0 && kortSamma(1);
    const forlorar = hi < 0 && b.utan_storsta_kr < 0 && b.median_kr < 0 && kortSamma(-1);
    if (b.familj === 'HOJ' && vinner) ut.push({ nyckel, typ: 'GASA', hink, bevis, konstant: konstantFor(b), text: 'De tillagda kronorna har tjänat pengar här, även utan den största kampanjen. Större steg eller kortare väntan har täckning.' });
    if (b.familj === 'HOJ' && forlorar) ut.push({ nyckel, typ: 'BROMSA', hink, bevis, konstant: konstantFor(b), text: 'De tillagda kronorna har gått back här. Mindre steg eller hårdare krav före höjning.' });
    if (b.familj === 'SANK' && forlorar) ut.push({ nyckel, typ: 'MILDRA', hink, bevis, konstant: konstantFor(b), text: 'Sänkningarna här tog bort kronor som tjänade pengar. Sänk mindre eller vänta längre.' });
    if (b.familj === 'SANK' && vinner) ut.push({ nyckel, typ: 'SANK_MER', hink, bevis, konstant: konstantFor(b), text: 'Sänkningarna här sparade pengar. Att sänka tidigare eller mer har täckning.' });
  }
  for (const b of Object.values(kal.hall ?? {})) {
    if (!['kod', 'band'].includes(b.dimension) || b.kampanjdygn < MIN_HALL_DYGN || b.kampanjer < MIN_KAMPANJER_FORSLAG) continue;
    const n = b.kampanjdygn;
    const hink = `${FAMILJNAMN[b.familj]} (${b.dimension === 'band' ? `ROAS/BE ${b.varde}` : b.varde})`;
    const nyckel = `${b.familj}|${b.dimension}|${b.varde}`;
    if (b.familj === 'HALL_HOG' && (b.utfall.HOLL ?? 0) / n >= 0.8) ut.push({ nyckel, typ: 'SKALA_TIDIGARE', hink, bevis: `${brak(b.utfall.HOLL, n)} kampanjdygn stod kvar över target efter väntan (${b.kampanjer} kampanjer)`, konstant: konstantFor(b), text: 'Kampanjerna höll sig över target medan motorn väntade. Väntan kostade höjningar.' });
    if (b.familj === 'HALL_MELLAN' && (b.utfall.FOLL_UNDER ?? 0) / n >= 0.6 && b.forlust_kr >= 3000) ut.push({ nyckel, typ: 'SANK_TIDIGARE', hink, bevis: `${brak(b.utfall.FOLL_UNDER, n)} kampanjdygn föll under break-even, ${krUtanTecken(b.forlust_kr)} förlust under väntan (${b.kampanjer} kampanjer)`, konstant: konstantFor(b), text: 'Kampanjer som bara gick lite plus föll oftast under break-even. Att sänka tidigare har täckning.' });
    if (b.familj === 'HALL_FORLUST' && (b.utfall.FORTSATT_FORLUST ?? 0) / n >= 0.8 && b.forlust_kr >= 3000) ut.push({ nyckel, typ: 'STANG_TIDIGARE', hink, bevis: `${brak(b.utfall.FORTSATT_FORLUST, n)} kampanjdygn fortsatte under break-even, ${krUtanTecken(b.forlust_kr)} förlust under väntan (${b.kampanjer} kampanjer)`, konstant: konstantFor(b), text: 'Kampanjerna i förlust tog sig inte upp medan motorn väntade. Väntan kostade pengar.' });
  }
  return ut;
}

const dimText = (d) => ({ marknad: 'marknaden är', zon: 'budgeten var', band: 'ROAS/break-even var', forsta_steg: 'första steget var', total: 'hela ändringen var', kedja: 'kedjan var', produkt: 'produkten är' }[d] ?? d);

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

  // Kontrollproven för alla konton först — kontrollen får låna från den andra
  // marknaden när det egna bandet är för tunt.
  const provAlla = { kort: [], lang: [] };
  for (const [kontoKod, d] of Object.entries(data)) {
    if (!d) continue;
    const serie = byggSerie(d.dygn);
    for (const [hNamn, h] of Object.entries(HORISONTER)) provAlla[hNamn].push(...kontrollprov(serie, beIndex, { marknadFor: () => kontoKod, since: d.since, until: d.until, h }));
  }

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
    const index = andringsIndex(d.budgetandringar, minaBeslut);
    const marknadForK = () => kontoKod;
    const prov = {};
    for (const [hNamn, h] of Object.entries(HORISONTER)) prov[hNamn] = [...(provAlla[hNamn] ?? [])];
    const ctx = { serie, index, prov, until: d.until, since: d.since, idag, beIndex, produktFor };
    const eps = episoder(minaBeslut, index);
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
    placeboRader.push(...placebo(minaHall, ctx));
    // Handändringar: det motorn inte gjorde (Axels egna budgetändringar i Meta).
    statistik[kontoKod] = {
      dygnsrader: d.dygn.length,
      budgetandringar: d.budgetandringar.length,
      handandringar: d.budgetandringar.filter((a) => !a.motor).length,
      kontrollprov_lang: prov.lang.filter((p) => p.marknad === kontoKod).length,
      kontroll_lang: (() => { const kf = kontrollfaktor(prov.lang, { q: 1, marknad: kontoKod }); return kf.saknas ? { saknas: true } : { a: runda(kf.a, 3), b: runda(kf.b, 3), elasticitet: runda(kf.elasticitet, 3), prov: kf.prov, kampanjer: kf.kampanjer, marknad: kf.marknad }; })(),
      since: d.since,
      until: d.until,
    };
  }

  const alla = [...sparade, ...nya];
  const konton = Object.keys(data).filter((k) => data[k]);
  const kal = kalibrering(alla, hallRader, { idag, statistik, vantar, placeboRader, sagtandRader, konton, delvis: Boolean(forvantadeKonton) && forvantadeKonton.some((k) => !konton.includes(k)), tidigare });
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
 * Placebo: samma mätare på kampanjdygn där motorn INTE ändrade något (ett
 * hållbeslut, ingen ändring D−3..D+3 — kort horisont, för det långa fönstret
 * ger för få dygn). Mätaren ska då säga ≈ 0 kr. Gör den inte det är den skev,
 * och då går inga förslag till Axel (kritiken 2026-09-30).
 */
export function placebo(hall, ctx) {
  const ut = [];
  const sett = new Set();
  for (const x of hall) {
    const nyckel = `${x.kampanj_id}|${x.datum}`;
    if (sett.has(nyckel)) continue;
    sett.add(nyckel);
    if (handelserMellan(ctx.index, x.kampanj_id, plusDagar(x.datum, -FORE_DAGAR), plusDagar(x.datum, HORISONTER.kort)).length) continue;
    const ep = { familj: 'HOJ', kampanj_id: x.kampanj_id, kampanj_namn: x.kampanj_namn, marknad: x.marknad, start: x.datum, slut: x.datum, steg: [{ datum: x.datum, kod: 'PLACEBO', fran: x.budget, till: x.budget }], fran: x.budget, till: x.budget, be: x.be };
    const r = dommaEpisod(ep, 'kort', ctx);
    if (!r || !r.bedombar || r.avkortat) continue;
    ut.push({ kampanj_id: x.kampanj_id, datum: x.datum, marknad: x.marknad, delta_vinst_kr: r.delta_vinst_kr, dom: r.dom });
  }
  return ut;
}

export function placeboSammanfattning(rader) {
  const per = new Map();
  for (const r of rader) per.set(r.kampanj_id, (per.get(r.kampanj_id) ?? 0) + r.delta_vinst_kr);
  const iv = klusterintervall(per, 'placebo');
  const fel = rader.filter((r) => r.dom === 'FEL').length;
  const ratt = rader.filter((r) => r.dom === 'RATT').length;
  const godkant = Boolean(iv) && per.size >= MIN_KAMPANJER_FORSLAG && iv[0] <= 0 && iv[1] >= 0;
  return { kampanjdygn: rader.length, kampanjer: per.size, ratt, fel, osakra: rader.length - ratt - fel, summa_kr: Math.round(rader.reduce((s, r) => s + r.delta_vinst_kr, 0)), median_kr: rader.length ? Math.round(median(rader.map((r) => r.delta_vinst_kr))) : null, intervall_80: iv, godkant };
}

export function kalibrering(alla, hallRader, { idag, statistik = {}, vantar = [], placeboRader = [], sagtandRader = [], konton = [], delvis = false, tidigare = null } = {}) {
  const per = { kort: hinkar(alla.filter((r) => r.horisont === 'kort')), lang: hinkar(alla.filter((r) => r.horisont === 'lang')) };
  const hall = { kort: hallHinkar(hallRader.kort ?? []), lang: hallHinkar(hallRader.lang ?? []) };
  const plac = placeboSammanfattning(placeboRader);
  const kal = { schema: KALIBRERING_SCHEMA, skapad: idag, metod: 'agent/FACIT.md', konton, delvis, horisonter: HORISONTER, hinkar: per, hall, placebo: plac, sagtand: sagtandHinkar(sagtandRader), statistik, vantar: vantar.length };
  // Kandidater: det datan stöder i dag. Förslag: kandidater som stått
  // FORSLAG_DAGAR_I_RAD körningar i rad, på en hel (inte delvis) dag, med
  // godkänt placebo. En delvis dag rör inte historiken.
  const kandidater = delvis ? [] : forslag({ hinkar: per.lang, hinkarKort: per.kort, hall: hall.lang });
  const historik = { ...(tidigare?.forslag_historik ?? {}) };
  if (!delvis && tidigare?.skapad !== idag) {
    const nu = new Set(kandidater.map((f) => `${f.typ}|${f.nyckel}`));
    for (const k of Object.keys(historik)) if (!nu.has(k)) delete historik[k];
    for (const k of nu) {
      const h = historik[k];
      const fortsatter = h && dagarMellan(h.senast, idag) <= 2;
      historik[k] = { forst: fortsatter ? h.forst : idag, senast: idag, dagar_i_rad: fortsatter ? h.dagar_i_rad + 1 : 1 };
    }
  }
  kal.forslag_historik = historik;
  kal.kandidater = kandidater.map((f) => ({ ...f, dagar_i_rad: historik[`${f.typ}|${f.nyckel}`]?.dagar_i_rad ?? 0 }));
  kal.forslag = plac.godkant ? kal.kandidater.filter((f) => f.dagar_i_rad >= FORSLAG_DAGAR_I_RAD) : [];
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

const hinkText = (b) => `${b.ratt} rätt, ${b.fel} fel, ${b.osakra} osäkra på ${b.bedomda_kampanjer} kampanjer · Σ ${kr(b.delta_vinst_kr)}${b.intervall_80 ? ` (80 %: ${kr(b.intervall_80[0])} till ${kr(b.intervall_80[1])})` : ''}`;

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
    const nyckel = familj === 'STANG' ? `HALL_FORLUST|band|${band}` : `${familj}|kod|${rad.dom.kod}`;
    const b = kal.hall?.lang?.[nyckel];
    if (b && b.kampanjdygn >= MIN_HALL_DYGN) {
      const n = b.kampanjdygn;
      hinkarNu.push(nyckel);
      if (familj === 'STANG') delar.push(`kampanjer i förlust vid ROAS/BE ${band} som fick leva: ${brak(b.utfall.ATERHAMTAD ?? 0, n)} kampanjdygn tog sig över break-even (${b.kampanjer} kampanjer, överlevare)`);
      else if (familj === 'HALL_HOG') delar.push(`${rad.dom.kod} över target: ${brak(b.utfall.HOLL ?? 0, n)} kampanjdygn stod kvar över target efter väntan (${b.kampanjer} kampanjer)`);
      else if (familj === 'HALL_MELLAN') delar.push(`${rad.dom.kod} mellan break-even och target: ${brak(b.utfall.FOLL_UNDER ?? 0, n)} föll under break-even, ${krUtanTecken(b.forlust_kr)} förlust under väntan (${b.kampanjer} kampanjer)`);
      else delar.push(`${rad.dom.kod} i förlust: ${brak(b.utfall.ATERHAMTAD ?? 0, n)} tog sig över break-even, väntan kostade ${krUtanTecken(b.forlust_kr)} (${b.kampanjer} kampanjer)`);
    }
  } else {
    for (const [dim, varde] of [['zon', zon], ['band', band]]) {
      const b = kal.hinkar.lang[`${familj}|${dim}|${varde}`];
      if (!b) continue;
      hinkarNu.push(`${familj}|${dim}|${varde}`);
      const etikett = dim === 'zon' ? `vid ${varde} kr` : `vid ROAS/BE ${varde}`;
      if ((b.bedomda_kampanjer ?? 0) < MIN_KAMPANJER_NOT) { delar.push(`${etikett}: för få kampanjer än (${b.bedomda_kampanjer ?? 0})`); continue; }
      delar.push(`${etikett}: ${hinkText(b)}`);
    }
  }
  if (!delar.length) return null;
  // Rena siffror, inga förslag och inga verb — texten står bredvid dagens beslut
  // och får aldrig kunna läsas som en order (kritiken 2026-09-30).
  return { familj, zon, band, hinkar: hinkarNu, text: `Facit ${FAMILJNAMN[familj]} (7 d): ${delar.join(' · ')}` };
}

// ── Rapport och status ───────────────────────────────────────────────────────

function sammanfattning(kal, { en = false } = {}) {
  const ut = [];
  const namn = en ? FAMILJNAMN_EN : FAMILJNAMN;
  const sek = (n) => `${n >= 0 ? '+' : '−'}${Math.abs(Math.round(n)).toLocaleString('en-US')} SEK`;
  for (const familj of ['HOJ', 'SANK', 'TJUV']) {
    const b = kal.hinkar?.lang?.[`${familj}|alla|alla`];
    if (!b) continue;
    const iv = b.intervall_80;
    ut.push(en
      ? `${namn[familj]}: ${b.bedomda} of ${b.episoder} episodes measured (${b.bedomda_kampanjer} campaigns) — ${b.ratt} right, ${b.fel} wrong, ${b.osakra} uncertain; ${sek(b.delta_vinst_kr)} profit vs what the old budget would have made${iv ? ` (80 %: ${sek(iv[0])} to ${sek(iv[1])})` : ''}, median ${sek(b.median_kr ?? 0)} per episode, ${sek(b.utan_storsta_kr ?? 0)} without the biggest campaign`
      : `${namn[familj]}: ${b.bedomda} av ${b.episoder} episoder mätta (${b.bedomda_kampanjer} kampanjer) — ${b.ratt} rätt, ${b.fel} fel, ${b.osakra} osäkra; ${kr(b.delta_vinst_kr)} mot vad gammal budget hade gett${iv ? ` (80 %: ${kr(iv[0])} till ${kr(iv[1])})` : ''}, median ${kr(b.median_kr)} per episod, ${kr(b.utan_storsta_kr)} utan största kampanjen`);
  }
  const sg = kal.sagtand?.['alla|alla'];
  if (sg) ut.push(en ? `sawtooth: ${brak(sg.vande, sg.hojningar)} raises were followed by the robot's own cut or pause within ${SAGTAND_DAGAR} days (median ${sg.median_dagar ?? '—'} days, ${sg.kampanjer} campaigns)` : `sågtand: ${brak(sg.vande, sg.hojningar)} höjningar följdes av motorns egen sänkning eller avstängning inom ${SAGTAND_DAGAR} dygn (median ${sg.median_dagar ?? '—'} dygn, ${sg.kampanjer} kampanjer)`);
  const st = kal.hinkar?.lang?.['STANG|alla|alla'];
  if (st) ut.push(en ? `${namn.STANG}: ${st.episoder} recorded, no counterfactual verdict; ${st.aterstartade} restarted, ${st.aterstartade_plus} of them made money after the restart` : `${namn.STANG}: ${st.episoder} registrerade, ingen kontrafaktisk dom; ${st.aterstartade} återstartade, varav ${st.aterstartade_plus} gick plus efter återstarten`);
  for (const familj of ['HALL_HOG', 'HALL_MELLAN', 'HALL_FORLUST']) {
    const b = kal.hall?.lang?.[`${familj}|alla|alla`];
    if (!b) continue;
    if (familj === 'HALL_HOG') ut.push(en ? `${namn[familj]}: ${brak(b.utfall.HOLL ?? 0, b.kampanjdygn)} campaign-days stayed above target after waiting (${b.kampanjer} campaigns)` : `${namn[familj]}: ${brak(b.utfall.HOLL ?? 0, b.kampanjdygn)} kampanjdygn stod kvar över target efter väntan (${b.kampanjer} kampanjer)`);
    else if (familj === 'HALL_MELLAN') ut.push(en ? `${namn[familj]}: ${brak(b.utfall.FOLL_UNDER ?? 0, b.kampanjdygn)} campaign-days fell below break-even, ${b.forlust_kr.toLocaleString('en-US')} SEK lost while waiting (${b.kampanjer} campaigns)` : `${namn[familj]}: ${brak(b.utfall.FOLL_UNDER ?? 0, b.kampanjdygn)} kampanjdygn föll under break-even, ${krUtanTecken(b.forlust_kr)} förlust under väntan (${b.kampanjer} kampanjer)`);
    else ut.push(en ? `${namn[familj]}: ${brak(b.utfall.ATERHAMTAD ?? 0, b.kampanjdygn)} recovered above break-even, waiting cost ${b.forlust_kr.toLocaleString('en-US')} SEK (${b.kampanjer} campaigns)` : `${namn[familj]}: ${brak(b.utfall.ATERHAMTAD ?? 0, b.kampanjdygn)} tog sig över break-even, väntan kostade ${krUtanTecken(b.forlust_kr)} (${b.kampanjer} kampanjer)`);
  }
  return ut;
}

export function status(kal, { en = false } = {}) {
  if (en) return statusEngelska(kal);
  if (!kal) return ['Facit: ingen kalibrering än (agent/kalibrering.json saknas).'];
  const ut = [`Facit ${kal.skapad}${kal.delvis ? ' (DELVIS — ett konto saknades)' : ''} — så har motorns budgetbeslut faktiskt gått (7 dygn efter, mot vad gammal budget hade gett):`];
  for (const x of sammanfattning(kal)) ut.push(`- ${x}`);
  const p = kal.placebo;
  if (p) ut.push(`- Placebo (dygn utan ändring, ska ge ≈ 0 kr): ${kr(p.summa_kr)} på ${p.kampanjer} kampanjer${p.intervall_80 ? ` (80 %: ${kr(p.intervall_80[0])} till ${kr(p.intervall_80[1])})` : ''} — ${p.godkant ? 'godkänt' : 'EJ godkänt, inga förslag går ut'}`);
  const f = kal.forslag ?? [];
  const k = (kal.kandidater ?? []).filter((x) => !f.includes(x));
  if (f.length) {
    ut.push(`- ⚑ ${f.length} regelförslag till Axel (stått ${FORSLAG_DAGAR_I_RAD} morgnar i rad) — se agent/utdata/facit-${kal.skapad}.md. Inget ändras förrän Axel säger ja.`);
    for (const x of f) ut.push(`  - ${x.typ}: ${x.hink}`);
  } else ut.push(`- Inga regelförslag än${k.length ? ` — ${k.length} kandidat(er) på väg (${k.map((x) => `${x.typ} dag ${x.dagar_i_rad} av ${FORSLAG_DAGAR_I_RAD}`).join(', ')})` : ''}.`);
  return ut;
}

/** Discord-raden på engelska: bara antal, inga kronor och ingen break-even —
 *  redigerarna läser #scaling (CLAUDE.md: redigerare ser aldrig spend). */
export function statusEngelska(kal) {
  if (!kal) return ['Facit: no calibration yet.'];
  const ut = [`Facit ${kal.skapad} — how the robot's budget moves turned out (7 days after):`];
  for (const [familj, namn] of [['HOJ', 'raises'], ['SANK', 'cuts']]) {
    const b = kal.hinkar?.lang?.[`${familj}|alla|alla`];
    if (b) ut.push(`- ${namn}: ${b.bedomda} measured on ${b.bedomda_kampanjer} campaigns — ${b.ratt} paid off, ${b.fel} did not, ${b.osakra} too close to call`);
  }
  const sg = kal.sagtand?.['alla|alla'];
  if (sg) ut.push(`- sawtooth: ${sg.vande} of ${sg.hojningar} raises were followed by the robot's own cut or pause within ${SAGTAND_DAGAR} days`);
  const f = kal.forslag?.length ?? 0;
  ut.push(`- ${f ? `${f} rule proposal(s) waiting for Axel.` : 'No rule proposals.'}`);
  return ut;
}

export function rapportMd(kal, { nya = [] } = {}) {
  const ut = [];
  ut.push(`# Facit — ${kal.skapad}`);
  ut.push('');
  ut.push('Så har Skalnings kungens budgetbeslut gått. Varje höjning och sänkning jämförs med vad GAMMAL budget hade gett: samma spend som före beslutet, och den ROAS kampanjen hade veckan innan motorn tittade (justerad för hur resten av kontot rörde sig). Skillnaden i vinst är beslutets facit. Metoden och kritiken den klarat: `agent/FACIT.md`. **Facit ändrar ingenting** — förslagen nedan är Axels beslut.');
  ut.push('');
  ut.push('Läs bråken rätt: ett enskilt beslut är oftast OSÄKERT — tre dygns köp är för få för att skilja ett bra beslut från tur. Det är hinkarna över veckor som lär motorn något, och de växer varje morgon.');
  ut.push('');
  ut.push('## Sammanfattning (7 dygn efter)');
  ut.push('');
  for (const s of sammanfattning(kal)) ut.push(`- ${s}`);
  ut.push('');

  const f = kal.forslag ?? [];
  ut.push(`## ⚑ Förslag till Axel (${f.length})`);
  ut.push('');
  if (!f.length) ut.push(`Inga än. Ett förslag kräver minst ${MIN_KAMPANJER_FORSLAG} olika kampanjer i samma hink, ett 80 %-intervall som inte korsar noll, och att resultatet håller även utan den största kampanjen.`);
  for (const x of f) ut.push(`- **${x.typ}** — ${x.hink}: ${x.text} Bevis: ${x.bevis}.${x.konstant ? ` Gäller \`${x.konstant}\` i agent/besked.mjs.` : ''}`);
  ut.push('');
  const kand = (kal.kandidater ?? []).filter((x) => !f.includes(x));
  if (kand.length) {
    ut.push(`### Kandidater (ett förslag måste stå ${FORSLAG_DAGAR_I_RAD} morgnar i rad)`);
    ut.push('');
    for (const x of kand) ut.push(`- ${x.typ} — ${x.hink}: dag ${x.dagar_i_rad} av ${FORSLAG_DAGAR_I_RAD}. ${x.bevis}.`);
    ut.push('');
  }
  const p = kal.placebo;
  if (p) {
    ut.push('### Placebo — mäter mätaren rätt?');
    ut.push('');
    ut.push(`Samma mätare på ${p.kampanjdygn} kampanjdygn (${p.kampanjer} kampanjer) där motorn INTE ändrade något. Den ska ge ≈ 0 kr: ${kr(p.summa_kr)}${p.intervall_80 ? ` (80 %: ${kr(p.intervall_80[0])} till ${kr(p.intervall_80[1])})` : ''}, median ${kr(p.median_kr)}, ${p.ratt} "rätt" / ${p.fel} "fel" / ${p.osakra} osäkra. ${p.godkant ? '**Godkänt** — intervallet innehåller noll.' : '**Inte godkänt** — då går inga förslag till Axel.'}`);
    ut.push('');
  }

  const tabell = (familj, rubrik) => {
    const rader = Object.values(kal.hinkar?.lang ?? {}).filter((b) => b.familj === familj && b.dimension !== 'alla' && b.dimension !== 'produkt');
    if (!rader.length) return;
    ut.push(`## ${rubrik}`);
    ut.push('');
    ut.push('| Hink | Episoder | Kampanjer | Rätt / fel / osäkra | Σ Δ vinst | 80 % | Median | Utan största | Marginal-ROAS | Break-even |');
    ut.push('|---|---|---|---|---|---|---|---|---|---|');
    for (const b of rader.sort((x, y) => (x.dimension === y.dimension ? String(x.varde).localeCompare(String(y.varde), 'sv') : x.dimension.localeCompare(y.dimension)))) {
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
    for (const b of sgr.sort((x, y) => (x.dimension === y.dimension ? String(x.varde).localeCompare(String(y.varde), 'sv') : x.dimension.localeCompare(y.dimension)))) ut.push(`- ${dimNamn(b.dimension)} ${b.varde}: ${brak(b.vande, b.hojningar)} vände (${b.stangda} till avstängning), median ${b.median_dagar ?? '—'} dygn, ${b.kampanjer} kampanjer`);
    ut.push('');
  }
  tabell('HOJ', 'Höjningar — var det lönar sig att skala');
  tabell('SANK', 'Sänkningar — sparade de pengar?');
  tabell('TJUV', 'Tjuvpauser — blev kampanjen bättre?');

  const st = Object.values(kal.hinkar?.lang ?? {}).filter((b) => b.familj === 'STANG' && b.dimension === 'band');
  if (st.length) {
    ut.push('## Avstängningar — det som faktiskt hände');
    ut.push('');
    ut.push('En avstängd kampanj har ingen data efteråt, så facit fäller ingen kontrafaktisk dom (valet av kontroll avgjorde domen helt — kritiken 2026-09-30). Här står antalet per band, hur många som startades om och gick plus, och hur kampanjer i samma band gick när de fick leva.');
    ut.push('');
    for (const b of st.sort((x, y) => String(x.varde).localeCompare(String(y.varde), 'sv'))) {
      const levde = kal.hall?.lang?.[`HALL_FORLUST|band|${b.varde}`];
      ut.push(`- ROAS/BE ${b.varde}: ${b.episoder} avstängda (${b.kampanjer} kampanjer), ${b.aterstartade} återstartade varav ${b.aterstartade_plus} gick plus${levde ? ` · de som fick leva i bandet: ${brak(levde.utfall.ATERHAMTAD ?? 0, levde.kampanjdygn)} kampanjdygn tog sig över break-even (${levde.kampanjer} kampanjer, överlevare)` : ''}`);
    }
    ut.push('');
  }

  const hall = Object.values(kal.hall?.lang ?? {}).filter((b) => b.dimension === 'kod');
  if (hall.length) {
    ut.push('## Hållbeslut — vad väntan gav (rullande 45 dygn, kampanjdygn överlappar)');
    ut.push('');
    ut.push('| Läge | Kod | Kampanjdygn | Kampanjer | Utfall | Förlust under väntan |');
    ut.push('|---|---|---|---|---|---|');
    for (const b of hall.sort((x, y) => y.kampanjdygn - x.kampanjdygn)) {
      ut.push(`| ${FAMILJNAMN[b.familj]} | ${b.varde} | ${b.kampanjdygn} | ${b.kampanjer} | ${Object.entries(b.utfall).map(([k, v]) => `${k} ${brak(v, b.kampanjdygn)}`).join(', ')} | ${b.familj === 'HALL_HOG' ? '—' : krUtanTecken(b.forlust_kr)} |`);
    }
    ut.push('');
  }

  const prod = Object.values(kal.hinkar?.lang ?? {}).filter((b) => b.dimension === 'produkt' && b.bedomda > 0 && ['HOJ', 'SANK'].includes(b.familj)).sort((x, y) => x.delta_vinst_kr - y.delta_vinst_kr);
  if (prod.length) {
    ut.push('## Per produkt (mätta episoder)');
    ut.push('');
    for (const b of prod) ut.push(`- ${b.varde} — ${FAMILJNAMN[b.familj]}: ${b.ratt} rätt, ${b.fel} fel, ${b.osakra} osäkra, ${kr(b.delta_vinst_kr)}`);
    ut.push('');
  }

  const dagens = nya.filter((r) => r.horisont === 'lang');
  if (dagens.length) {
    ut.push(`## Nya facit i dag (${dagens.length} episoder, 7 dygn)`);
    ut.push('');
    for (const r of dagens.slice(0, 60)) {
      ut.push(`- ${r.start}${r.slut !== r.start ? `–${r.slut}` : ''} **${String(r.kampanj_namn ?? r.kampanj_id).split('|')[0].trim()}** (${r.marknad}) ${FAMILJNAMN[r.familj]} ${r.beslut_fran_sek ?? '?'} → ${r.beslut_till_sek ?? '?'} kr: **${r.dom}**${r.orsak ? ` — ${r.orsak}` : ''}${r.bedombar ? ` · ${kr(r.delta_vinst_kr)} (80 %: ${kr(r.intervall_80?.[0])} till ${kr(r.intervall_80?.[1])})` : ''}${r.marginal_roas !== null && r.marginal_roas !== undefined && r.bedombar ? ` · marginal-ROAS ${dec(r.marginal_roas)} mot ${dec(r.break_even)}` : ''}${r.etikett ? ` · ${r.etikett}` : ''}${r.avbruten ? ' · AVBRUTEN av motorn' : ''}${r.avkortat && !r.avbruten ? ` · kapat: ${r.avkortat}` : ''}${r.aterstartad ? ` · ÅTERSTARTAD (${kr(r.aterstartad.vinst_kr)})` : ''}`);
    }
    ut.push('');
  }

  ut.push('## Datan');
  ut.push('');
  for (const [k, s] of Object.entries(kal.statistik ?? {})) ut.push(`- ${k}: ${s.dygnsrader} dygnsrader ${s.since}..${s.until}, ${s.budgetandringar} budgetändringar i Metas aktivitetslogg varav ${s.handandringar} för hand.`);
  ut.push(`- ${kal.vantar} episoder väntar på att fönstret stänger och mognar (${MOGNAD_DAGAR} dygn).`);
  ut.push(`- Beslut före ${ATTRIBUTION_7D_CLICK_FRAN} fattades på siffror med visningsköp; facit räknar allt i 7d_click.`);
  ut.push('- Nya annonser som laddas upp i samma kampanj under fönstret syns inte som störning — de påverkar ROAS utan att budgeten ändrats.');
  ut.push('');
  return ut.join('\n');
}

const dimNamn = (d) => ({ marknad: 'marknad', zon: 'budget före', band: 'ROAS/BE vid beslutet', forsta_steg: 'första steget', total: 'hela ändringen', kedja: 'kedja', regelverk: 'regelverk' }[d] ?? d);

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
