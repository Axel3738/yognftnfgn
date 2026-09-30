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
//   node agent/facit.mjs [--konto SE|NO|alla] [--hamta] [--idag YYYY-MM-DD] [--torr]
//   node agent/facit.mjs --status [--en]      rader till rondens leverans
//   node agent/facit.mjs --json               allt som maskindata
import { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
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
/** En efter-intäkt på noll ger ingen logaritm; golvet 10 % av före-ROAS. */
export const KONTROLL_GOLV = 0.1;

/** Hinken säger något först vid så många bedömbara episoder (bredvid dagens beslut). */
export const MIN_BEDOMBARA_NOT = 5;
/** Ett regelförslag till Axel kräver så många bedömbara episoder i hinken. */
export const MIN_BEDOMBARA_FORSLAG = 8;
/** Hållbeslut: minst så många kampanjdygn från så många kampanjer. */
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
  const fran = Number(x?.old_value?.old_value);
  const till = Number(x?.new_value?.new_value);
  if (!Number.isFinite(fran) || !Number.isFinite(till)) return null;
  return {
    tid: a.event_time,
    datum: lokaltDatum(a.event_time, tz),
    kampanj_id: String(a.object_id),
    fran_sek: fran / 100,
    till_sek: till / 100,
    app: a.application_name ?? null,
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
  for (const a of budgetandringar ?? []) lagg(String(a.kampanj_id), a.datum, a.till_sek > a.fran_sek ? 'upp' : 'ner', a.motor);
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
      const y = Math.log(Math.max(efter.roas ?? 0, KONTROLL_GOLV * fore.roas) / fore.roas);
      prov.push({ kampanj_id: kid, datum: d, marknad: mf(kid), band: bandFor(fore.roas, be), x, y, w: fore.spend });
    }
  }
  return prov;
}

const bandIndex = (namn) => BAND.findIndex((b) => b.namn === namn);

/** Viktad minsta kvadrat y = a + b·x. Utan spridning i x: a = viktat medel, b = 0. */
export function regression(prov) {
  const W = prov.reduce((s, p) => s + p.w, 0);
  if (!(W > 0)) return null;
  const mx = prov.reduce((s, p) => s + p.w * p.x, 0) / W;
  const my = prov.reduce((s, p) => s + p.w * p.y, 0) / W;
  const sxx = prov.reduce((s, p) => s + p.w * (p.x - mx) ** 2, 0);
  const sxy = prov.reduce((s, p) => s + p.w * (p.x - mx) * (p.y - my), 0);
  const b = sxx > 1e-9 ? sxy / sxx : 0;
  return { a: my - b * mx, b };
}

/**
 * Kontrollfaktorn k: hur ROAS rör sig för en kampanj i samma band när spenden
 * INTE flyttar — skärningspunkten i regressionen ovan, exp(a). Mätt 2026-09-30
 * (7 dygn, Sverige): ≥ 2,0 ⇒ ~0,56, 1,6–2,0 ⇒ ~0,68, 0,8–1,0 ⇒ ~1,48 — en
 * kampanj som nyss gått ovanligt bra faller av sig själv, en i förlust studsar.
 * Kampanjen som bedöms räknas aldrig in i sin egen kontroll. Vidgas till
 * grannbanden, sedan båda marknaderna; hittas inget blir k = 1 och det sägs.
 */
export function kontrollfaktor(prov, { band, marknad, utom = null }) {
  const i = bandIndex(band);
  const bandsteg = [[band], [BAND[i - 1]?.namn, band, BAND[i + 1]?.namn].filter(Boolean)];
  for (const marknader of [[marknad], ['SE', 'NO']]) {
    for (const baner of bandsteg) {
      const urval = prov.filter((p) => p.kampanj_id !== utom && marknader.includes(p.marknad) && baner.includes(p.band));
      const kampanjer = new Set(urval.map((p) => p.kampanj_id)).size;
      if (urval.length < KONTROLL_MIN_PROV || kampanjer < KONTROLL_MIN_KAMPANJER) continue;
      const reg = regression(urval);
      if (!reg) continue;
      return { k: Math.exp(reg.a), elasticitet: reg.b, prov: urval.length, kampanjer, band: baner.join('+'), marknad: marknader.join('+') };
    }
  }
  return { k: 1, elasticitet: null, prov: 0, kampanjer: 0, band, marknad, saknas: true };
}

// ── Domen per episod ─────────────────────────────────────────────────────────

/**
 * Räknar en episod vid en horisont. Returnerar null när fönstret inte stängt
 * än (väntar), annars en facit-rad. `ctx` = { serie, index, prov, until, idag,
 * beIndex, produktFor }.
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

  // Före-fönstret, kapat efter en tidigare ändring (minst två dygn kvar).
  const tidigare = handelserMellan(index, ep.kampanj_id, plusDagar(ep.start, -FORE_DAGAR), plusDagar(ep.start, -1));
  const foreFran = tidigare.length ? plusDagar(tidigare[tidigare.length - 1].datum, 1) : plusDagar(ep.start, -FORE_DAGAR);
  if (foreFran < ctx.since) return { ...bas, dom: 'UTANFOR_DATAN', orsak: `före-fönstret börjar ${foreFran}, datan ${ctx.since}` };
  const fore = summa(serie, ep.kampanj_id, foreFran, plusDagar(ep.start, -1));
  const be = Number.isFinite(ep.be) ? ep.be : ctx.beIndex(ep.kampanj_id, ep.start);
  const target = Number.isFinite(be) ? targetRoas(be).target : null;
  bas.break_even = Number.isFinite(be) ? be : null;
  bas.target = Number.isFinite(target) ? Math.round(target * 1000) / 1000 : null;
  bas.band = bandFor(fore.roas, be);
  if (fore.dagar < 2) return { ...bas, dom: 'STORD', orsak: 'före-fönstret stört av en tidigare ändring', fore: kort(fore) };

  // Efter-fönstret, kapat vid första störning (annan ändring eller dygn utan spend).
  const eFran = plusDagar(ep.slut, 1);
  let eTill = plusDagar(ep.slut, h);
  let orsakKap = null;
  const egnaDagar = ep.steg.map((s) => s.datum);
  const storning = handelserMellan(index, ep.kampanj_id, eFran, eTill, { utom: egnaDagar })[0];
  if (storning) { eTill = plusDagar(storning.datum, -1); orsakKap = `${storning.motor ? 'motorn' : 'handändring'} ${storning.typ} ${storning.datum}`; }
  if (ep.familj !== 'STANG') {
    for (let d = eFran; d <= eTill; d = plusDagar(d, 1)) {
      const v = serie.get(ep.kampanj_id)?.get(d);
      if (!v || !(v.spend > 0)) { eTill = plusDagar(d, -1); orsakKap = `inget spend ${d} (pausad?)`; break; }
    }
  }
  if (eTill > until) return null; // fönstret har inte stängt — väntar
  const eDagar = dagarMellan(eFran, eTill) + 1;
  if (eDagar < MIN_EFTER_DAGAR) return { ...bas, dom: 'STORD', orsak: orsakKap ?? 'för kort efter-fönster', fore: kort(fore) };
  const efter = summa(serie, ep.kampanj_id, eFran, eTill);

  if (!Number.isFinite(be)) return { ...bas, dom: 'SAKNAR_BREAK_EVEN', fore: kort(fore), efter: kort(efter) };
  if (!(fore.spend > 0) || !(fore.intakt >= 0)) return { ...bas, dom: 'FOR_LITE_DATA', orsak: 'inget spend före', fore: kort(fore), efter: kort(efter) };

  const kf = kontrollfaktor(ctx.prov[horisont] ?? [], { band: bas.band, marknad: ep.marknad, utom: ep.kampanj_id });
  const sf = fore.spend / fore.dagar;
  const rf = fore.intakt / fore.dagar;
  let se = efter.spend / eDagar;
  let re = efter.intakt / eDagar;
  const rad = { ...bas, fore: kort(fore), efter: kort(efter), avkortat: orsakKap, k: runda(kf.k, 3), kontroll: kf.saknas ? 'saknas' : `${kf.prov} kampanjdygn, ${kf.kampanjer} andra kampanjer, band ${kf.band}, ${kf.marknad}` };

  // Avstängning: efter-fönstret ska vara tomt. Syns spend är kampanjen återstartad.
  if (ep.familj === 'STANG') {
    if (efter.spend > 0) rad.aterstartad = { spend: runda(efter.spend, 0), roas: efter.roas === null ? null : runda(efter.roas, 3) };
    se = 0; re = 0;
    rad.osaker = 'kontrafaktiskt: kampanjen har ingen data efter avstängningen';
  }

  const rcf = rf * kf.k;
  const dS = se - sf;
  const dR = re - rcf;
  const aov = fore.kop > 0 ? fore.intakt / fore.kop : efter.kop > 0 ? efter.intakt / efter.kop : null;
  const beCpa = aov ? aov / be : null;
  const flyttat = Math.abs(dS) * eDagar;
  rad.delta_spend_dag = runda(dS, 0);
  rad.delta_intakt_dag = runda(dR, 0);
  rad.marginal_roas = Math.abs(dS) > 1e-9 ? runda(dR / dS, 3) : null;
  rad.delta_vinst_kr = runda((dR / be - dS) * eDagar, 0);
  rad.flyttat_kr = runda(flyttat, 0);
  rad.be_cpa = beCpa ? runda(beCpa, 0) : null;

  const dom = domFor(ep.familj, { dS, flyttat, beCpa, fore, efter, dVinst: dR / be - dS });
  return { ...rad, ...dom };
}

function domFor(familj, { dS, flyttat, beCpa, fore, efter, dVinst }) {
  if (familj === 'HOJ' && dS * 1 <= 0) return { dom: 'UTAN_EFFEKT', orsak: 'spenden steg inte efter höjningen — budgeten var inte flaskhalsen', bedombar: false };
  if (familj === 'SANK' && dS >= 0) return { dom: 'UTAN_EFFEKT', orsak: 'spenden föll inte efter sänkningen — budgeten styrde inte', bedombar: false };
  if ((familj === 'HOJ' || familj === 'SANK') && flyttat < MIN_FLYTT_SEK) return { dom: 'UTAN_EFFEKT', orsak: `bara ${Math.round(flyttat)} kr flyttades`, bedombar: false };
  if (familj === 'TJUV') {
    if (efter.spend < MIN_SPEND_FOR_DOM || efter.kop + fore.kop < MIN_KOP_FOR_DOM) return { dom: 'FOR_LITE_DATA', orsak: 'under 300 kr eller 3 köp', bedombar: false };
    return { dom: dVinst >= 0 ? 'RATT' : 'FEL', bedombar: true, preliminar: efter.kop < 5 };
  }
  if (familj === 'STANG') {
    if (fore.spend < MIN_SPEND_FOR_DOM) return { dom: 'FOR_LITE_DATA', orsak: 'under 300 kr före avstängningen', bedombar: false };
    return { dom: dVinst >= 0 ? 'RATT' : 'FEL', bedombar: true, preliminar: !beCpa || flyttat < PRELIMINAR_BE_CPA * beCpa };
  }
  // Höjning / sänkning: grinden gäller deltat (CLAUDE.md regel 3, ANALYSMETOD 2b).
  const kopEfterKrav = familj === 'HOJ' ? efter.kop : fore.kop;
  if (!beCpa || flyttat < GRIND_BE_CPA * beCpa || kopEfterKrav < MIN_KOP_FOR_DOM) {
    return { dom: 'FOR_LITE_DATA', orsak: !beCpa ? 'inga köp att räkna break-even-CPA på' : kopEfterKrav < MIN_KOP_FOR_DOM ? 'under 3 köp i fönstret' : `${Math.round(flyttat)} kr flyttat, grinden ${Math.round(GRIND_BE_CPA * beCpa)} kr`, bedombar: false };
  }
  return { dom: dVinst >= 0 ? 'RATT' : 'FEL', bedombar: true, preliminar: flyttat < PRELIMINAR_BE_CPA * beCpa };
}

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

/** Räknar hinkarna ur facit-rader (en horisont). Bara bedömbara rader bär kronor. */
export function hinkar(rader) {
  const ut = {};
  for (const r of rader) {
    if (!['HOJ', 'SANK', 'STANG', 'TJUV'].includes(r.familj)) continue;
    for (const dim of DIMENSIONER) {
      if (['forsta_steg', 'total', 'kedja'].includes(dim) && !['HOJ', 'SANK'].includes(r.familj)) continue;
      const varde = dim === 'alla' ? 'alla' : r[dim] ?? 'okänd';
      const nyckel = `${r.familj}|${dim}|${varde}`;
      const b = ut[nyckel] ??= { familj: r.familj, dimension: dim, varde, episoder: 0, bedombara: 0, ratt: 0, fel: 0, preliminara: 0, utan_effekt: 0, for_lite_data: 0, stord: 0, osakra: 0, aterstartade: 0, flyttat_kr: 0, delta_vinst_kr: 0, _dS: 0, _dR: 0, _beVikt: 0, kampanjer: [] };
      b.episoder += 1;
      if (!b.kampanjer.includes(r.kampanj_id)) b.kampanjer.push(r.kampanj_id);
      if (r.dom === 'UTAN_EFFEKT') b.utan_effekt += 1;
      else if (r.dom === 'FOR_LITE_DATA') b.for_lite_data += 1;
      else if (['STORD', 'UTANFOR_DATAN', 'SAKNAR_BREAK_EVEN'].includes(r.dom)) b.stord += 1;
      if (r.aterstartad) b.aterstartade += 1;
      if (!r.bedombar) continue;
      b.bedombara += 1;
      if (r.dom === 'RATT') b.ratt += 1;
      if (r.dom === 'FEL') b.fel += 1;
      if (r.preliminar) b.preliminara += 1;
      if (r.osaker) b.osakra += 1;
      const dagar = r.efter?.dagar ?? 0;
      b.flyttat_kr += r.flyttat_kr ?? 0;
      b.delta_vinst_kr += r.delta_vinst_kr ?? 0;
      b._dS += (r.delta_spend_dag ?? 0) * dagar;
      b._dR += (r.delta_intakt_dag ?? 0) * dagar;
      b._beVikt += (r.break_even ?? 0) * Math.abs((r.delta_spend_dag ?? 0) * dagar);
    }
  }
  for (const b of Object.values(ut)) {
    b.marginal_roas = Math.abs(b._dS) > 1e-9 ? runda(b._dR / b._dS, 3) : null;
    b.break_even_viktad = b.flyttat_kr > 0 ? runda(b._beVikt / Math.abs(b._dS || 1), 3) : null;
    b.kampanjer = b.kampanjer.length;
    b.flyttat_kr = Math.round(b.flyttat_kr);
    b.delta_vinst_kr = Math.round(b.delta_vinst_kr);
    delete b._dS; delete b._dR; delete b._beVikt;
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
    if (b.dimension === 'alla' || b.dimension === 'regelverk' || b.bedombara < MIN_BEDOMBARA_FORSLAG) continue;
    const andelFel = b.fel / b.bedombara;
    const andelRatt = b.ratt / b.bedombara;
    const hink = `${FAMILJNAMN[b.familj]} där ${dimText(b.dimension)} ${b.varde}`;
    const bevis = `${b.ratt}/${b.bedombara} rätt, ${kr(b.delta_vinst_kr)} i vinst mot kontrollen, ${kr(b.flyttat_kr)} flyttat${b.marginal_roas !== null ? `, marginal-ROAS ${dec(b.marginal_roas)} mot break-even ${dec(b.break_even_viktad)}` : ''}`;
    if (b.familj === 'HOJ' && b.delta_vinst_kr < 0 && andelFel >= 0.6) ut.push({ typ: 'BROMSA', hink, bevis, konstant: konstantFor(b), text: `Bromsa höjningarna här — de tillagda kronorna har gått back.` });
    if (b.familj === 'HOJ' && b.delta_vinst_kr > 0 && andelRatt >= 0.7 && b.marginal_roas >= 1.25 * (b.break_even_viktad ?? Infinity)) ut.push({ typ: 'GASA', hink, bevis, konstant: konstantFor(b), text: `Skala mer här — större steg eller kortare väntan har täckning.` });
    if (b.familj === 'SANK' && b.delta_vinst_kr < 0 && andelFel >= 0.6) ut.push({ typ: 'MILDRA', hink, bevis, konstant: konstantFor(b), text: `Sänkningarna här tog bort lönsamma kronor — sänk mindre eller vänta längre.` });
    if (b.familj === 'STANG' && andelFel >= 0.4) ut.push({ typ: 'STANG_SENARE', hink, bevis: `${bevis} (kontrafaktiskt, osäkert)`, konstant: konstantFor(b), text: `Avstängningarna här kom ofta för tidigt.` });
  }
  for (const b of Object.values(kal.hall ?? {})) {
    if (b.dimension !== 'kod' || b.kampanjdygn < MIN_HALL_DYGN || b.kampanjer < MIN_HALL_KAMPANJER) continue;
    const n = b.kampanjdygn;
    if (b.familj === 'HALL_HOG' && (b.utfall.HOLL ?? 0) / n >= 0.8) ut.push({ typ: 'SKALA_TIDIGARE', hink: `${FAMILJNAMN[b.familj]} (${b.varde})`, bevis: `${b.utfall.HOLL}/${n} kampanjdygn stod kvar över target efter väntan (${b.kampanjer} kampanjer)`, konstant: konstantFor(b), text: `Väntan här kostade höjningar — kampanjerna höll.` });
    if (b.familj === 'HALL_MELLAN' && (b.utfall.FOLL_UNDER ?? 0) / n >= 0.6 && b.forlust_kr >= 3000) ut.push({ typ: 'SANK_TIDIGARE', hink: `${FAMILJNAMN[b.familj]} (${b.varde})`, bevis: `${b.utfall.FOLL_UNDER}/${n} kampanjdygn föll under break-even, ${kr(-b.forlust_kr)} under väntan (${b.kampanjer} kampanjer)`, konstant: konstantFor(b), text: `Kampanjer som bara gick lite plus föll oftast under break-even — sänk tidigare.` });
    if (b.familj === 'HALL_FORLUST' && (b.utfall.FORTSATT_FORLUST ?? 0) / n >= 0.8 && b.forlust_kr >= 3000) ut.push({ typ: 'STANG_TIDIGARE', hink: `${FAMILJNAMN[b.familj]} (${b.varde})`, bevis: `${b.utfall.FORTSATT_FORLUST}/${n} kampanjdygn fortsatte under break-even, ${kr(b.forlust_kr)} förlust under väntan (${b.kampanjer} kampanjer)`, konstant: konstantFor(b), text: `Väntan här kostade pengar — kampanjerna tog sig inte upp.` });
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
export function kor({ logg, data, idag, sparade = [], karta = {} }) {
  const beslut = beslutUrLogg(logg);
  const hall = hallUrLogg(logg);
  const beIndex = breakEvenIndex(logg);
  const produktFor = (ep) => karta[ep.kampanj_id]?.produkt ?? null;
  const sparadeNycklar = new Set(sparade.map((r) => r.nyckel));
  const nya = [];
  const hallRader = { kort: [], lang: [] };
  const vantar = [];
  const statistik = {};

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
    const minaHall = hall.filter((x) => x.marknad === kontoKod);
    for (const [hNamn, h] of Object.entries(HORISONTER)) hallRader[hNamn].push(...dommaHall(minaHall, h, ctx));
    // Handändringar: det motorn inte gjorde (Axels egna budgetändringar i Meta).
    statistik[kontoKod] = {
      dygnsrader: d.dygn.length,
      budgetandringar: d.budgetandringar.length,
      handandringar: d.budgetandringar.filter((a) => !a.motor).length,
      kontrollprov_lang: prov.lang.filter((p) => p.marknad === kontoKod).length,
      kontroll_lang: Object.fromEntries(BAND.map((b) => { const kf = kontrollfaktor(prov.lang, { band: b.namn, marknad: kontoKod }); return [b.namn, { k: runda(kf.k, 2), elasticitet: runda(kf.elasticitet, 2), prov: kf.prov, kampanjer: kf.kampanjer, kalla: kf.saknas ? 'saknas' : `${kf.band} ${kf.marknad}` }]; })),
      since: d.since,
      until: d.until,
    };
  }

  const alla = [...sparade, ...nya];
  const kal = kalibrering(alla, hallRader, { idag, statistik, vantar });
  return { nya, alla, hallRader, kalibrering: kal, vantar };
}

export function kalibrering(alla, hallRader, { idag, statistik = {}, vantar = [] } = {}) {
  const per = { kort: hinkar(alla.filter((r) => r.horisont === 'kort')), lang: hinkar(alla.filter((r) => r.horisont === 'lang')) };
  const hall = { kort: hallHinkar(hallRader.kort ?? []), lang: hallHinkar(hallRader.lang ?? []) };
  const kal = { skapad: idag, metod: 'agent/FACIT.md', horisonter: HORISONTER, hinkar: per, hall, statistik, vantar: vantar.length };
  kal.forslag = forslag({ hinkar: per.lang, hall: hall.lang });
  return kal;
}

// ── Noten bredvid dagens beslut (läses av agent/rond.mjs) ────────────────────

/** Vilken familj dagens dom hör till. Hållbeslut över target / under break-even. */
export function familjForDom(rad) {
  const kod = rad?.dom?.kod;
  if (HOJ_KODER.includes(kod)) return 'HOJ';
  if (SANK_KODER.includes(kod)) return 'SANK';
  if (kod === 'STANG_AV' || kod === 'ATGARDSTRAPPAN') return 'STANG';
  if (!HALL_KODER.includes(kod) && kod !== 'VANTA_KADENS') return null;
  const be = rad?.dom?.breakEven;
  if (!Number.isFinite(rad?.roas3d) || !Number.isFinite(be)) return null;
  if (rad.roas3d >= targetRoas(be, rad.targetRoas ?? null).target) return 'HALL_HOG';
  if (rad.roas3d < be) return 'HALL_FORLUST';
  return 'HALL_MELLAN';
}

/**
 * Facit bredvid ett beslut: hinkens bråk för dagens läge (budgetzon och
 * ROAS/break-even-band), lång horisont. Ren. Ändrar aldrig domen — anroparen
 * lägger resultatet i `dom.facit`. Null när det inte finns något att säga.
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
  if (familj.startsWith('HALL')) {
    const b = kal.hall?.lang?.[`${familj}|kod|${rad.dom.kod}`];
    if (b && b.kampanjdygn >= MIN_HALL_DYGN) {
      const n = b.kampanjdygn;
      delar.push(familj === 'HALL_HOG'
        ? `${rad.dom.kod} över target: ${brak(b.utfall.HOLL ?? 0, n)} kampanjdygn höll sig kvar över target efter väntan`
        : familj === 'HALL_MELLAN'
          ? `${rad.dom.kod} mellan break-even och target: ${brak(b.utfall.FOLL_UNDER ?? 0, n)} föll under break-even, ${krUtanTecken(b.forlust_kr)} förlust under väntan`
          : `${rad.dom.kod} i förlust: ${brak(b.utfall.ATERHAMTAD ?? 0, n)} tog sig över break-even, väntan kostade ${krUtanTecken(b.forlust_kr)}`);
      hinkarNu.push(`${familj}|kod|${rad.dom.kod}`);
    }
  } else {
    for (const [dim, varde] of [['zon', zon], ['band', band]]) {
      const b = kal.hinkar.lang[`${familj}|${dim}|${varde}`];
      if (!b) continue;
      hinkarNu.push(`${familj}|${dim}|${varde}`);
      if (b.bedombara < MIN_BEDOMBARA_NOT) { delar.push(`${dim === 'zon' ? `vid ${varde} kr` : `vid ROAS/BE ${varde}`}: för få fall än (${b.bedombara} bedömbara)`); continue; }
      delar.push(`${dim === 'zon' ? `vid ${varde} kr` : `vid ROAS/BE ${varde}`}: ${brak(b.ratt, b.bedombara)} rätt, ${kr(b.delta_vinst_kr)}${b.marginal_roas !== null ? `, marginal-ROAS ${dec(b.marginal_roas)}` : ''}`);
    }
  }
  if (!delar.length) return null;
  const fb = kal.forslag?.filter((f) => hinkarNu.some((h) => f.hink.includes(h.split('|')[2]) && f.hink.startsWith(FAMILJNAMN[familj]))) ?? [];
  return {
    familj,
    zon,
    band,
    hinkar: hinkarNu,
    text: `Facit ${FAMILJNAMN[familj]} (7 d): ${delar.join(' · ')}${fb.length ? ` · ⚑ förslag: ${fb.map((f) => f.typ).join(', ')}` : ''}`,
  };
}

// ── Rapport och status ───────────────────────────────────────────────────────

function sammanfattning(kal, { en = false } = {}) {
  const ut = [];
  const namn = en ? FAMILJNAMN_EN : FAMILJNAMN;
  for (const familj of ['HOJ', 'SANK', 'STANG', 'TJUV']) {
    const b = kal.hinkar?.lang?.[`${familj}|alla|alla`];
    if (!b) continue;
    const mr = b.marginal_roas !== null && familj !== 'STANG' ? (en ? `, marginal ROAS ${b.marginal_roas.toFixed(2)} vs break-even ${b.break_even_viktad?.toFixed(2) ?? '?'}` : `, marginal-ROAS ${dec(b.marginal_roas)} mot break-even ${dec(b.break_even_viktad)}`) : '';
    const osak = familj === 'STANG' ? (en ? ' (counterfactual, uncertain)' : ' (kontrafaktiskt, osäkert)') : '';
    ut.push(en
      ? `${namn[familj]}: ${brak(b.ratt, b.bedombara)} right of ${b.episoder} episodes judged${osak}, ${b.delta_vinst_kr >= 0 ? '+' : '−'}${Math.abs(b.delta_vinst_kr).toLocaleString('en-US')} SEK profit vs control${mr} (${b.utan_effekt} no effect, ${b.for_lite_data} too little data, ${b.stord} disturbed)`
      : `${namn[familj]}: ${brak(b.ratt, b.bedombara)} rätt av ${b.episoder} episoder${osak}, ${kr(b.delta_vinst_kr)} mot kontrollen${mr} (${b.utan_effekt} utan effekt, ${b.for_lite_data} för lite data, ${b.stord} störda)`);
  }
  for (const familj of ['HALL_HOG', 'HALL_MELLAN', 'HALL_FORLUST']) {
    const b = kal.hall?.lang?.[`${familj}|alla|alla`];
    if (!b) continue;
    if (familj === 'HALL_MELLAN') ut.push(en ? `${namn[familj]}: ${brak(b.utfall.FOLL_UNDER ?? 0, b.kampanjdygn)} campaign-days fell below break-even, ${b.forlust_kr.toLocaleString('en-US')} SEK lost while waiting (${b.kampanjer} campaigns)` : `${namn[familj]}: ${brak(b.utfall.FOLL_UNDER ?? 0, b.kampanjdygn)} kampanjdygn föll under break-even, ${krUtanTecken(b.forlust_kr)} förlust under väntan (${b.kampanjer} kampanjer)`);
    else if (familj === 'HALL_HOG') ut.push(en ? `${namn[familj]}: ${brak(b.utfall.HOLL ?? 0, b.kampanjdygn)} campaign-days stayed above target after waiting (${b.kampanjer} campaigns)` : `${namn[familj]}: ${brak(b.utfall.HOLL ?? 0, b.kampanjdygn)} kampanjdygn stod kvar över target efter väntan (${b.kampanjer} kampanjer)`);
    else ut.push(en ? `${namn[familj]}: ${brak(b.utfall.ATERHAMTAD ?? 0, b.kampanjdygn)} recovered above break-even, waiting cost ${b.forlust_kr.toLocaleString('en-US')} SEK (${b.kampanjer} campaigns)` : `${namn[familj]}: ${brak(b.utfall.ATERHAMTAD ?? 0, b.kampanjdygn)} tog sig över break-even, väntan kostade ${krUtanTecken(b.forlust_kr)} (${b.kampanjer} kampanjer)`);
  }
  return ut;
}

export function status(kal, { en = false } = {}) {
  if (!kal) return en ? ['Facit: no calibration yet (agent/kalibrering.json missing).'] : ['Facit: ingen kalibrering än (agent/kalibrering.json saknas).'];
  const ut = [en ? `Facit ${kal.skapad} — how the robot's budget moves actually paid (7-day window, controlled for regression to the mean):` : `Facit ${kal.skapad} — så har motorns budgetbeslut faktiskt gått (7 dygn efter, kontrollerat för regressionen mot medelvärdet):`];
  for (const s of sammanfattning(kal, { en })) ut.push(`- ${s}`);
  const f = kal.forslag ?? [];
  if (f.length) {
    ut.push(en ? `- ${f.length} rule proposal(s) for Axel — see agent/utdata/facit-${kal.skapad}.md. Nothing changes until Axel says yes.` : `- ⚑ ${f.length} regelförslag till Axel — se agent/utdata/facit-${kal.skapad}.md. Inget ändras förrän Axel säger ja.`);
  } else ut.push(en ? '- No rule proposals yet (a bucket needs 8 judged episodes).' : '- Inga regelförslag än (en hink kräver 8 bedömbara episoder).');
  return ut;
}

export function rapportMd(kal, { nya = [], alla = [], hallRader = {} } = {}) {
  const ut = [];
  ut.push(`# Facit — ${kal.skapad}`);
  ut.push('');
  ut.push('Så har Skalnings kungens budgetbeslut gått. Varje höjning, sänkning och avstängning mäts på de flyttade kronorna: gav de mer eller mindre än break-even? En kontroll räknar bort att kampanjer som gått ovanligt bra faller tillbaka av sig själva. Metoden: `agent/FACIT.md`. **Facit ändrar ingenting** — förslagen nedan är Axels beslut.');
  ut.push('');
  ut.push('## Sammanfattning (7 dygn efter)');
  ut.push('');
  for (const s of sammanfattning(kal)) ut.push(`- ${s}`);
  ut.push('');

  const f = kal.forslag ?? [];
  ut.push(`## ⚑ Förslag till Axel (${f.length})`);
  ut.push('');
  if (!f.length) ut.push(`Inga än. Ett förslag kräver minst ${MIN_BEDOMBARA_FORSLAG} bedömbara episoder i samma hink (eller ${MIN_HALL_DYGN} kampanjdygn från ${MIN_HALL_KAMPANJER} kampanjer för hållbeslut).`);
  for (const x of f) ut.push(`- **${x.typ}** — ${x.hink}: ${x.text} Bevis: ${x.bevis}.${x.konstant ? ` Gäller \`${x.konstant}\` i agent/besked.mjs.` : ''}`);
  ut.push('');

  const tabell = (familj, rubrik) => {
    const rader = Object.values(kal.hinkar?.lang ?? {}).filter((b) => b.familj === familj && b.dimension !== 'alla' && b.dimension !== 'produkt');
    if (!rader.length) return;
    ut.push(`## ${rubrik}`);
    ut.push('');
    ut.push('| Hink | Episoder | Bedömbara | Rätt | Δ vinst mot kontroll | Flyttat | Marginal-ROAS | Break-even |');
    ut.push('|---|---|---|---|---|---|---|---|');
    for (const b of rader.sort((a, c) => (a.dimension === c.dimension ? String(a.varde).localeCompare(String(c.varde), 'sv') : a.dimension.localeCompare(c.dimension)))) {
      ut.push(`| ${b.dimension}: ${b.varde} | ${b.episoder} | ${b.bedombara} | ${b.bedombara ? brak(b.ratt, b.bedombara) : '—'} | ${b.bedombara ? kr(b.delta_vinst_kr) : '—'} | ${b.bedombara ? krUtanTecken(b.flyttat_kr) : '—'} | ${dec(b.marginal_roas)} | ${dec(b.break_even_viktad)} |`);
    }
    ut.push('');
  };
  tabell('HOJ', 'Höjningar — var det lönar sig att skala');
  tabell('SANK', 'Sänkningar — tog de bort förlustkronor?');
  tabell('STANG', 'Avstängningar — kontrafaktiskt, osäkert');
  tabell('TJUV', 'Tjuvpauser — blev kampanjen bättre?');

  const hall = Object.values(kal.hall?.lang ?? {}).filter((b) => b.dimension === 'kod');
  if (hall.length) {
    ut.push('## Hållbeslut — väntan (rullande 45 dygn, kampanjdygn överlappar)');
    ut.push('');
    ut.push('| Läge | Kod | Kampanjdygn | Kampanjer | Utfall | Förlust under väntan |');
    ut.push('|---|---|---|---|---|---|');
    for (const b of hall.sort((a, c) => c.kampanjdygn - a.kampanjdygn)) {
      ut.push(`| ${FAMILJNAMN[b.familj]} | ${b.varde} | ${b.kampanjdygn} | ${b.kampanjer} | ${Object.entries(b.utfall).map(([k, v]) => `${k} ${brak(v, b.kampanjdygn)}`).join(', ')} | ${b.familj === 'HALL_FORLUST' ? krUtanTecken(b.forlust_kr) : '—'} |`);
    }
    ut.push('');
  }

  const prod = Object.values(kal.hinkar?.lang ?? {}).filter((b) => b.dimension === 'produkt' && b.bedombara > 0).sort((a, b) => a.delta_vinst_kr - b.delta_vinst_kr);
  if (prod.length) {
    ut.push('## Per produkt (bedömbara episoder)');
    ut.push('');
    for (const b of prod) ut.push(`- ${b.varde} — ${FAMILJNAMN[b.familj]}: ${brak(b.ratt, b.bedombara)} rätt, ${kr(b.delta_vinst_kr)}`);
    ut.push('');
  }

  const senaste = [...nya].filter((r) => r.horisont === 'lang' && r.bedombara !== undefined).slice(-20);
  if (nya.length) {
    ut.push(`## Nya facit i dag (${nya.length} rader)`);
    ut.push('');
    for (const r of [...nya].filter((x) => x.horisont === 'lang').slice(0, 40)) {
      ut.push(`- ${r.start}${r.slut !== r.start ? `–${r.slut}` : ''} **${String(r.kampanj_namn ?? r.kampanj_id).split('|')[0].trim()}** (${r.marknad}) ${FAMILJNAMN[r.familj]} ${r.beslut_fran_sek ?? '?'} → ${r.beslut_till_sek ?? '?'} kr: **${r.dom}**${r.preliminar ? ' (preliminär)' : ''}${r.orsak ? ` — ${r.orsak}` : ''}${Number.isFinite(r.delta_vinst_kr) && r.bedombara ? ` · ${kr(r.delta_vinst_kr)}` : ''}${r.marginal_roas !== null && r.marginal_roas !== undefined && r.bedombara ? ` · marginal-ROAS ${dec(r.marginal_roas)} mot ${dec(r.break_even)}` : ''}${r.avkortat ? ` · kapat: ${r.avkortat}` : ''}${r.aterstartad ? ' · ÅTERSTARTAD' : ''}`);
    }
    ut.push('');
  }
  void senaste; void alla; void hallRader;

  ut.push('## Datan');
  ut.push('');
  for (const [k, s] of Object.entries(kal.statistik ?? {})) ut.push(`- ${k}: ${s.dygnsrader} dygnsrader ${s.since}..${s.until}, ${s.budgetandringar} budgetändringar i Metas aktivitetslogg varav ${s.handandringar} för hand, ${s.kontrollprov_lang} kontrollprov (7 d).`);
  ut.push(`- ${kal.vantar} episoder väntar på att fönstret stänger.`);
  ut.push('- Mätt 2026-09-30: tredagarssiffrorna revideras inte i efterhand (587 av 587 loggade köp = omhämtningen). Ett fönster döms dagen efter att det stängt.');
  ut.push('');
  return ut.join('\n');
}

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
  const torr = argv.includes('--torr');

  const { cachefil, hamtaFacitdata, CACHE } = await import('./hamta-facit.mjs');
  const data = {};
  const varningar = [];
  for (const k of valda) {
    const fil = flagga('--data') && valda.length === 1 ? flagga('--data') : cachefil(k, idag);
    try {
      if (argv.includes('--hamta')) {
        const d = await hamtaFacitdata(k, { idag });
        mkdirSync(CACHE, { recursive: true });
        writeFileSync(cachefil(k, idag), `${JSON.stringify(d)}\n`);
        data[k] = d;
      } else if (existsSync(fil)) {
        data[k] = JSON.parse(readFileSync(fil, 'utf8'));
      } else {
        varningar.push(`${k}: ingen data (${fil}) — kör med --hamta.`);
      }
    } catch (e) {
      varningar.push(`${k}: hämtningen misslyckades — ${e.message}. Facit räknas utan ${k} i dag.`);
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
  const utfall = kor({ logg, data, idag, sparade, karta });
  utfall.kalibrering.varningar = varningar;

  if (argv.includes('--json')) { console.log(JSON.stringify(utfall.kalibrering, null, 2)); }
  const md = rapportMd(utfall.kalibrering, utfall);
  if (torr) {
    if (!argv.includes('--json')) console.log(md);
    console.error(`FACIT (torr): ${utfall.nya.length} nya rader skulle skrivas. Inget skrivet.`);
    return;
  }
  if (utfall.nya.length) appendFileSync(FACITFIL, utfall.nya.map((r) => JSON.stringify(r)).join('\n') + '\n');
  writeFileSync(KALIBRERINGSFIL, `${JSON.stringify(utfall.kalibrering, null, 2)}\n`);
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
