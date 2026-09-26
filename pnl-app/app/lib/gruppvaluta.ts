/**
 * Gruppsummans omräkning per dag — ren logik, utbruten ur group.server.ts
 * så att den går att testa (`group.server.ts` drar in Prisma, och testerna
 * körs med `--experimental-strip-types` utan databas). `fx.server.ts` har
 * inga importer, så `rateOn` går att läsa härifrån utan att något annat
 * följer med.
 */

import type { SalesDay, SpendDay } from "./pnl.server.ts";
import { rateOn, type DailyRates } from "./fx.server.ts";

export interface GroupTotals {
  totalSales: number;
  orders: number;
  cogs: number;
  tariff: number;
  fees: number;
  spend: number;
  fixedCosts: number;
  netProfit: number;
  /**
   * Nettoförsäljning utan kostnad, och med kostnad exakt 0 som inte
   * kvitterats som gratis — samma fält som i compute(). Förut syntes de inte
   * alls i summan: en butik där 40 % av enheterna saknade kostnad lade in
   * gratisvaror i gruppens vinst utan ett ord.
   */
  netSalesWithoutCost: number;
  netSalesZeroCost: number;
  /** Nämnaren: produktradernas nettoförsäljning. */
  productNetSales: number;
}

export const nollTotaler = (): GroupTotals => ({
  totalSales: 0, orders: 0, cogs: 0, tariff: 0, fees: 0, spend: 0, fixedCosts: 0, netProfit: 0,
  netSalesWithoutCost: 0, netSalesZeroCost: 0, productNetSales: 0,
});

/**
 * Räknar om en butiks periodsumma till betraktarens valuta, dag för dag.
 *
 * Varför inte inne i `compute()`: motorn får produktmixen aggregerad för hela
 * perioden (dagsradernas `products` slås ihop i `readDaily`), så COGS finns
 * inte per dag utan att motorn byggs om. Det som FINNS per dag — försäljning,
 * ordrar och annonskostnad — räknas om exakt med den dagens kurs. Resten
 * följer den post den är proportionell mot:
 *   - avgifter = feeRate × försäljning → försäljningens dagsvägda kurs (exakt)
 *   - tull     = ordrar × tull/order   → ordrarnas dagsvägda kurs (exakt)
 *   - fasta    = samma belopp varje dag → medelkurs över dagarna (exakt)
 *   - COGS     → försäljningens dagsvägda kurs (approximation: antar att
 *                marginalen är ungefär lika från dag till dag; felet är
 *                kursens spridning inom perioden gånger marginalens spridning,
 *                i praktiken promille av COGS — mot de procent som en enda
 *                dagsaktuell kurs på en 30-dagarsperiod gav)
 *   - försäljning utan kostnad och produktradernas försäljning → samma
 *                försäljningsvägda kurs som COGS. Andelen (kvoten) blir då
 *                exakt densamma som i butikens egen panel, och det är den
 *                som avgör om summan märks som osäker.
 * Butikens egen panel i butikens valuta påverkas inte alls.
 *
 * undefined = någon dag saknade kurs även efter bakåtsökning; butiken ska då
 * uteslutas och namnges, aldrig räknas med en gissad kurs.
 */
export function convertTotalsPerDay(
  tt: GroupTotals,
  sales: SalesDay[],
  spend: SpendDay[],
  rates: DailyRates,
  from: string,
  to: string,
): GroupTotals | undefined {
  const dagar = sales.filter((s) => s.day >= from && s.day <= to);

  let omsKr = 0, oms = 0, orderKr = 0, ordrar = 0, kursSumma = 0;
  for (const s of dagar) {
    const k = rateOn(rates, s.day);
    if (k == null) return undefined;
    omsKr += s.totalSales * k;
    oms += s.totalSales;
    orderKr += s.orders * k;
    ordrar += s.orders;
    kursSumma += k;
  }
  /* Utan säljdagar är alla säljposter (och de fasta, som räknas per säljdag)
     noll i compute() — bara annonskostnaden nedan kan ha ett belopp. */
  const medel = dagar.length ? kursSumma / dagar.length : 0;
  /* Vägd kurs; utan underlag (noll försäljning / noll ordrar) är posten noll
     och vilken kurs som helst ger noll — medelkursen håller det ärligt. */
  const kursOms = oms > 0 ? omsKr / oms : medel;
  const kursOrder = ordrar > 0 ? orderKr / ordrar : medel;

  let spendKr = 0;
  for (const d of spend) {
    if (d.day < from || d.day > to) continue;
    const k = rateOn(rates, d.day);
    if (k == null) return undefined;
    spendKr += d.spend * k;
  }

  const totalSales = tt.totalSales * kursOms;
  const cogs = tt.cogs * kursOms;
  const tariff = tt.tariff * kursOrder;
  const fees = tt.fees * kursOms;
  const fixedCosts = tt.fixedCosts * medel;
  return {
    totalSales,
    orders: tt.orders, // antal, ingen omräkning
    cogs,
    tariff,
    fees,
    spend: spendKr,
    fixedCosts,
    /* Samma ekvation som i compute(): bruttovinst − annonser − fasta. Räknas
       ur de omräknade delarna så summan alltid går ihop med sina delposter. */
    netProfit: totalSales - cogs - tariff - fees - spendKr - fixedCosts,
    netSalesWithoutCost: tt.netSalesWithoutCost * kursOms,
    netSalesZeroCost: tt.netSalesZeroCost * kursOms,
    productNetSales: tt.productNetSales * kursOms,
  };
}
