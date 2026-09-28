/**
 * "ROAS under dagen" på panelen: för EN dag, timme för timme, ROAS hittills
 * (ackumulerad försäljning ÷ ackumulerad annonskostnad) och ROAS per timme.
 *
 * Axel 2026-09-28: timgrafen ska visa dagen som den växer — "så vi kan se
 * när vi ska skala". Summan över 30 dagar svarade på vilken timme som bär;
 * den här svarar på "ligger vi över break-even just nu, i dag?".
 *
 * Tre regler:
 * - Ingen ROAS utan annonskostnad: timmar innan första kronan är spenderad
 *   har ingen ROAS hittills (null), aldrig 0 eller oändligt.
 * - Framtida timmar i dag ritas inte — en platt linje till midnatt hade sett
 *   ut som en dag utan försäljning.
 * - Per timme: en timme med kostnad men ingen försäljning är ROAS 0 — det är
 *   ett riktigt svar. En timme utan kostnad har ingen ROAS.
 *
 * Ren modul — testad i test/roas-under-dagen.test.mjs.
 */

export interface TimDag {
  day: string;
  orders: number[];
  sales: number[];
  /** Annonskostnad per timme på butikens klocka, eller null. */
  spend: number[] | null;
}

export interface TimPunkt {
  hour: number;
  /** Ackumulerad ROAS till och med timmen. */
  hittills: number | null;
  /** ROAS för bara den timmen. */
  timme: number | null;
  salesHittills: number;
  spendHittills: number;
  ordersHittills: number;
}

export function roasUnderDagen(d: TimDag, sistaTimme = 23): TimPunkt[] {
  const ut: TimPunkt[] = [];
  let s = 0;
  let sp = 0;
  let o = 0;
  for (let h = 0; h <= Math.min(23, sistaTimme); h++) {
    s += d.sales[h] ?? 0;
    o += d.orders[h] ?? 0;
    const timSpend = d.spend?.[h] ?? 0;
    sp += timSpend;
    ut.push({
      hour: h,
      hittills: d.spend && sp > 0 ? s / sp : null,
      timme: d.spend && timSpend > 0 ? (d.sales[h] ?? 0) / timSpend : null,
      salesHittills: s,
      spendHittills: sp,
      ordersHittills: o,
    });
  }
  return ut;
}
