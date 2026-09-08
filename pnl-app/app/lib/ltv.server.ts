/**
 * Kundvärde (LTV) per förvärvskohort — räknemotorn. Ren funktion utan I/O.
 * Formlerna följer docs/ltv-tillagg.md avsnitt 3 rad för rad.
 *
 * Kohort c = alla kunder (kundHash) med första order i samma kalendermånad.
 * För horisont h dagar efter första ordern:
 *   N_c        antal kunder
 *   AOV1_c     medel netto första ordern         (TB1_c i täckningsbidrag)
 *   R_c(h)     andel som lagt ≥ 1 order till inom h dagar
 *   n_c(h)     medel antal återköp inom h bland dem som återköpt
 *   AOVr_c(h)  medel netto per återköpsorder inom h   (TBr_c i tb)
 *   LTV_c(h)   = AOV1_c + R_c(h) × n_c(h) × AOVr_c(h)
 *
 * Allt ovan är OBSERVERAT och gäller bara mogna kohorter (alla kunder har
 * hunnit se h dagar). För yngre kohorter lånas återköpsdelen ur poolen av
 * mogna kohorter (viktad med N) — kohortens eget AOV1 behålls. Det märks
 * est:true och visas aldrig förrän poolen bär det (trösklarna i
 * ltv-konstanter.ts). Osäkerheten sitter i R(h): Wilson-intervall 95 %,
 * propagerat rakt genom formeln.
 *
 * Gästordrar (kundHash null) ingår aldrig i kohorter; deras andel rapporteras.
 */

import {
  HORISONTER,
  MIN_KOHORT,
  MIN_POOL_ATERKOP,
  MIN_POOL_KOHORTER,
  MIN_POOL_KUNDER,
  type Horisont,
} from "./ltv-konstanter.ts";

export { HORISONTER };

export interface LtvOrder {
  kundHash: string | null;
  dag: string; // YYYY-MM-DD i butikens tidszon
  netto: number;
  tb: number | null;
}

export interface Intervall {
  mid: number;
  low: number;
  high: number;
}

export interface HorisontVarde {
  /** true = alla kohortens kunder har hunnit observera h dagar. */
  observed: boolean;
  /** Prognos (lånad återköpsdel). Alltid false när observed. */
  est: boolean;
  R: Intervall | null;
  n: number | null;
  aovR: number | null;
  tbR: number | null;
  ltv: Intervall | null;
  ltvTb: Intervall | null;
}

export interface Kohort {
  manad: string; // YYYY-MM
  n: number;
  tooSmall: boolean;
  aov1: number;
  /** Medel tb första ordern över de ordrar som har tb; null om ingen har. */
  tb1: number | null;
  /** Andel av kohortens första ordrar som saknar tb (inköpspris saknades). */
  tb1Saknas: number;
  perH: Record<Horisont, HorisontVarde>;
}

export interface Pool {
  h: Horisont;
  kohorter: number;
  kunder: number;
  aterkopsOrdrar: number;
  R: Intervall | null;
  n: number | null;
  aovR: number | null;
  tbR: number | null;
  aov1: number | null;
  tb1: number | null;
  /** Räcker poolen för prognos och max-CPA? */
  ok: boolean;
  /** Vad som saknas, med tal — för mognadsmätaren. */
  saknas: { kohorter: [number, number]; kunder: [number, number]; aterkop: [number, number] };
}

export type Konfidens = "good" | "low" | "hidden";

export interface MaxCpa {
  h: Horisont;
  /** LTVtb(h) — noll vinst efter h dagar. */
  breakEven: Intervall;
  /** LTVtb(h) − targetMargin × LTV(h). */
  maxCpa: Intervall;
  /** Samma form utan återköp: TB1 − targetMargin × AOV1. */
  firstOrderMaxCpa: number | null;
  ltv: Intervall;
  konfidens: Konfidens;
}

export interface LtvResult {
  today: string;
  kohorter: Kohort[]; // senaste först
  pool: Record<Horisont, Pool>;
  maxCpa: Partial<Record<Horisont, MaxCpa>>;
  totalKunder: number;
  totalOrdrar: number;
  /** Kunder med ≥ 2 ordrar / kunder (hela historiken). */
  aterkopsgrad: number | null;
  /** Andel ordrar utan kund-ID. */
  guestShare: number;
  dataFrom: string | null;
  dataTo: string | null;
}

const ym = (dag: string) => dag.slice(0, 7);
const dagar = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const sistaDagenIManad = (manad: string) => {
  const [y, m] = manad.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
};
const medel = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Wilson score interval, 95 %, för en andel p ur n försök. */
export function wilson(k: number, n: number): Intervall | null {
  if (n <= 0) return null;
  const z = 1.959964;
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return { mid: p, low: Math.max(0, centre - half), high: Math.min(1, centre + half) };
}

const propagera = (bas: number, R: Intervall, n: number, aovR: number): Intervall => ({
  mid: bas + R.mid * n * aovR,
  low: bas + R.low * n * aovR,
  high: bas + R.high * n * aovR,
});

export function konfidensAv(iv: Intervall): Konfidens {
  if (!(iv.mid > 0)) return "hidden";
  const spann = (iv.high - iv.low) / iv.mid;
  return spann <= 0.4 ? "good" : spann <= 0.8 ? "low" : "hidden";
}

interface Kund {
  first: LtvOrder;
  rest: LtvOrder[]; // sorterade
}

export function computeLtv(input: { orders: LtvOrder[]; today: string; targetMargin: number }): LtvResult {
  const { today, targetMargin } = input;
  const alla = [...input.orders].sort((a, b) => (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0));
  const guests = alla.filter((o) => !o.kundHash).length;

  const kunder = new Map<string, Kund>();
  for (const o of alla) {
    if (!o.kundHash) continue;
    const k = kunder.get(o.kundHash);
    if (!k) kunder.set(o.kundHash, { first: o, rest: [] });
    else k.rest.push(o);
  }

  const perManad = new Map<string, Kund[]>();
  for (const k of kunder.values()) {
    const m = ym(k.first.dag);
    (perManad.get(m) ?? perManad.set(m, []).get(m)!).push(k);
  }

  const kohorter: Kohort[] = [];
  for (const [manad, ks] of [...perManad].sort()) {
    const n = ks.length;
    const aov1 = medel(ks.map((k) => k.first.netto)) ?? 0;
    const tbs = ks.map((k) => k.first.tb).filter((x): x is number => x != null);
    const tb1 = medel(tbs);
    const tb1Saknas = n ? (n - tbs.length) / n : 0;
    const perH = {} as Record<Horisont, HorisontVarde>;
    for (const h of HORISONTER) {
      /* Mogen: även kohortens SISTA möjliga första-orderdag har hunnit se h
         dagar. Annars skulle sena kunder dra ner R bara för att tiden inte
         gått — inte för att de inte återköper. */
      const observed = dagar(sistaDagenIManad(manad), today) >= h;
      if (!observed) {
        perH[h] = { observed: false, est: false, R: null, n: null, aovR: null, tbR: null, ltv: null, ltvTb: null };
        continue;
      }
      let aterkopare = 0;
      const antalPerAterkopare: number[] = [];
      const nettoR: number[] = [];
      const tbR: number[] = [];
      for (const k of ks) {
        const inom = k.rest.filter((o) => dagar(k.first.dag, o.dag) <= h);
        if (!inom.length) continue;
        aterkopare++;
        antalPerAterkopare.push(inom.length);
        for (const o of inom) {
          nettoR.push(o.netto);
          if (o.tb != null) tbR.push(o.tb);
        }
      }
      const R = wilson(aterkopare, n);
      const nRep = medel(antalPerAterkopare);
      const aovR = medel(nettoR);
      const tbRm = medel(tbR);
      const ltv = R && nRep != null && aovR != null ? propagera(aov1, R, nRep, aovR) : R ? { mid: aov1, low: aov1, high: aov1 } : null;
      const ltvTb =
        tb1 != null && R
          ? nRep != null && tbRm != null
            ? propagera(tb1, R, nRep, tbRm)
            : { mid: tb1, low: tb1, high: tb1 }
          : null;
      perH[h] = { observed: true, est: false, R, n: nRep, aovR, tbR: tbRm, ltv, ltvTb };
    }
    kohorter.push({ manad, n, tooSmall: n < MIN_KOHORT, aov1, tb1, tb1Saknas, perH });
  }

  /* Poolen per horisont: mogna kohorter med N ≥ MIN_KOHORT, viktade med N. */
  const pool = {} as Record<Horisont, Pool>;
  for (const h of HORISONTER) {
    const mogna = kohorter.filter((c) => !c.tooSmall && c.perH[h].observed);
    let kunderN = 0, aterkopare = 0, aterkopsOrdrar = 0, sumN = 0, sumAovR = 0, sumTbR = 0, wTbR = 0, sumAov1 = 0, sumTb1 = 0, wTb1 = 0;
    for (const c of mogna) {
      const v = c.perH[h];
      kunderN += c.n;
      const ak = Math.round((v.R?.mid ?? 0) * c.n);
      aterkopare += ak;
      const ord = ak * (v.n ?? 0);
      aterkopsOrdrar += ord;
      sumN += ord;
      if (v.aovR != null) sumAovR += v.aovR * ord;
      if (v.tbR != null) { sumTbR += v.tbR * ord; wTbR += ord; }
      sumAov1 += c.aov1 * c.n;
      if (c.tb1 != null) { sumTb1 += c.tb1 * c.n; wTb1 += c.n; }
    }
    const R = wilson(aterkopare, kunderN);
    const n = aterkopare ? sumN / aterkopare : null;
    const aovR = sumN ? sumAovR / sumN : null;
    const tbR = wTbR ? sumTbR / wTbR : null;
    const ok =
      mogna.length >= MIN_POOL_KOHORTER && kunderN >= MIN_POOL_KUNDER && aterkopsOrdrar >= MIN_POOL_ATERKOP;
    pool[h] = {
      h,
      kohorter: mogna.length,
      kunder: kunderN,
      aterkopsOrdrar: Math.round(aterkopsOrdrar),
      R, n, aovR, tbR,
      aov1: kunderN ? sumAov1 / kunderN : null,
      tb1: wTb1 ? sumTb1 / wTb1 : null,
      ok,
      saknas: {
        kohorter: [mogna.length, MIN_POOL_KOHORTER],
        kunder: [kunderN, MIN_POOL_KUNDER],
        aterkop: [Math.round(aterkopsOrdrar), MIN_POOL_ATERKOP],
      },
    };
  }

  /* Prognos för omogna kohorter: eget AOV1/TB1, lånad återköpsdel. */
  for (const c of kohorter) {
    if (c.tooSmall) continue;
    for (const h of HORISONTER) {
      const v = c.perH[h];
      const p = pool[h];
      if (v.observed || !p.ok || !p.R || p.n == null || p.aovR == null) continue;
      c.perH[h] = {
        observed: false,
        est: true,
        R: p.R,
        n: p.n,
        aovR: p.aovR,
        tbR: p.tbR,
        ltv: propagera(c.aov1, p.R, p.n, p.aovR),
        ltvTb: c.tb1 != null && p.tbR != null ? propagera(c.tb1, p.R, p.n, p.tbR) : null,
      };
    }
  }

  /* Max-CPA per horisont ur poolen. */
  const maxCpa: Partial<Record<Horisont, MaxCpa>> = {};
  for (const h of HORISONTER) {
    const p = pool[h];
    if (!p.ok || !p.R || p.n == null || p.aovR == null || p.aov1 == null || p.tb1 == null || p.tbR == null) continue;
    const ltv = propagera(p.aov1, p.R, p.n, p.aovR);
    const ltvTb = propagera(p.tb1, p.R, p.n, p.tbR);
    const mc = {
      mid: ltvTb.mid - targetMargin * ltv.mid,
      low: ltvTb.low - targetMargin * ltv.low,
      high: ltvTb.high - targetMargin * ltv.high,
    };
    maxCpa[h] = {
      h,
      breakEven: ltvTb,
      maxCpa: mc,
      firstOrderMaxCpa: p.tb1 - targetMargin * p.aov1,
      ltv,
      konfidens: konfidensAv(ltvTb),
    };
  }

  const totalKunder = kunder.size;
  const aterkopare = [...kunder.values()].filter((k) => k.rest.length > 0).length;

  return {
    today,
    kohorter: kohorter.reverse(),
    pool,
    maxCpa,
    totalKunder,
    totalOrdrar: alla.length,
    aterkopsgrad: totalKunder ? aterkopare / totalKunder : null,
    guestShare: alla.length ? guests / alla.length : 0,
    dataFrom: alla[0]?.dag ?? null,
    dataTo: alla[alla.length - 1]?.dag ?? null,
  };
}
