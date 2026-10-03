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
 * - Utan ROAS (Axel 2026-10-03, "som den vanliga Shopify-dashboarden") ritas
 *   försäljningen PER TIMME som staplar, inte hopräknad: `salesTimme` och
 *   `ordersTimme` bär timmens egna tal, `*Hittills` summan till och med den.
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
  /** Försäljning och ordrar för bara den timmen — staplarna utan ROAS. */
  salesTimme: number;
  ordersTimme: number;
  salesHittills: number;
  spendHittills: number;
  ordersHittills: number;
}

/**
 * Ett jämnt tak för staplarnas beloppsaxel: 1, 2, 2,5 eller 5 × 10^n, det
 * första som rymmer maxvärdet. 3 791 kr ⇒ 5 000; 180 ⇒ 200; 0 ⇒ 1 (en tom
 * dag får en axel ändå, aldrig division med noll).
 */
export function jamntBeloppstak(max: number): number {
  if (!Number.isFinite(max) || max <= 0) return 1;
  const bas = Math.pow(10, Math.floor(Math.log10(max)));
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (max <= m * bas) return m * bas;
  }
  return 10 * bas;
}

export function roasUnderDagen(d: TimDag, sistaTimme = 23): TimPunkt[] {
  const ut: TimPunkt[] = [];
  let s = 0;
  let sp = 0;
  let o = 0;
  for (let h = 0; h <= Math.min(23, sistaTimme); h++) {
    const timSales = d.sales[h] ?? 0;
    const timOrders = d.orders[h] ?? 0;
    s += timSales;
    o += timOrders;
    const timSpend = d.spend?.[h] ?? 0;
    sp += timSpend;
    ut.push({
      hour: h,
      hittills: d.spend && sp > 0 ? s / sp : null,
      timme: d.spend && timSpend > 0 ? timSales / timSpend : null,
      salesTimme: timSales,
      ordersTimme: timOrders,
      salesHittills: s,
      spendHittills: sp,
      ordersHittills: o,
    });
  }
  return ut;
}
