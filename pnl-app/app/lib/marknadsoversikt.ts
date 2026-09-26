/**
 * Marknadsöversikten på panelen: en rad per land med omsättning, snittorder,
 * annonskostnad, MER, BREAK-EVEN och bidrag per dag — utan att handlaren
 * behöver filtrera land för land.
 *
 * Axel 2026-09-26: "jag behöver veta exakt vad min breakeven roas är [i USA]
 * … och hur mycket vinst jag ligger på varje dag". Filtret ?market=US visade
 * det redan, men ett land i taget och bara för den som visste om filtret.
 *
 * Tre saker som sägs rakt ut i stället för att räknas fel:
 * - Break-even räknas UTAN annonskostnad (omsättning ÷ bruttovinst), så den
 *   står även för ett land vars kampanjer inte är märkta. Annonskostnaden,
 *   MER och bidraget står då som okända — aldrig som noll.
 * - Ett land utan EGEN kostnadspost räknas på butikens standardkostnad. Det
 *   märks (`egenKostnad: false`): frakten till USA är inte frakten till
 *   Sverige, och en break-even på fel kostnad ser exakt lika säker ut.
 * - Bidraget är FÖRE fasta kostnader. De fasta hör till butiken, och att
 *   dela dem på länder hade varit ett påhittat tal.
 *
 * Ren modul (ingen databas) — testad i test/marknadsoversikt.test.mjs.
 */
import {
  compute,
  type ComputeInput,
  type MarknadsDel,
  type ProductRow,
  type SalesDay,
  type SpendDay,
} from "./pnl.server.ts";
import { tacktOms } from "./avgifter.ts";
import { mergeProductRows } from "./orderrader.ts";

export interface MarknadsDelar {
  /** Per landskod: dagarna (en per dag med uppdelning) och produktmixen. */
  delar: Record<string, { sales: SalesDay[]; products: ProductRow[] }>;
  /** Dagar i perioden som saknar uppdelning per marknad. */
  dagarUtan: number;
}

const tomDel = (): MarknadsDel => ({
  orders: 0, grossSales: 0, discounts: 0, returns: 0, netSales: 0, totalSales: 0, shippingCharges: 0, products: [],
});

/**
 * Delar dagsraderna per marknad. Varje marknad får en rad för VARJE dag som
 * bär en uppdelning (tom om landet inte sålde den dagen), så att alla länder
 * räknas över samma dagar.
 */
export function delaPaMarknader(
  rader: { day: string; markets: Record<string, MarknadsDel> | null }[],
): MarknadsDelar {
  const lander = new Set<string>();
  for (const r of rader) for (const m of Object.keys(r.markets ?? {})) lander.add(m);
  const delar: MarknadsDelar["delar"] = {};
  for (const m of lander) delar[m] = { sales: [], products: [] };
  let dagarUtan = 0;
  for (const r of rader) {
    if (!r.markets) {
      dagarUtan++;
      continue;
    }
    for (const m of lander) {
      const { products, ...dag } = r.markets[m] ?? tomDel();
      delar[m].sales.push({ day: r.day, ...dag });
      delar[m].products.push(...products.map((p) => ({ ...p, market: m })));
    }
  }
  for (const m of lander) delar[m].products = mergeProductRows(delar[m].products);
  return { delar, dagarUtan };
}

export interface Marknadsrad {
  market: string;
  totalSales: number;
  orders: number;
  aov: number | null;
  /** Null = inga kampanjer märkta med landet (eller annonskällan felar). */
  spend: number | null;
  mer: number | null;
  /** Omsättning ÷ bruttovinst. Oberoende av annonskostnaden. */
  breakEvenMer: number | null;
  /** Bruttovinst efter varukostnad, tull och avgifter (före annonser). */
  grossProfit: number;
  /** Bruttovinst − annonser, före fasta kostnader. Null när spend är okänd. */
  bidrag: number | null;
  bidragPerDag: number | null;
  /** Mer än 2 % av försäljningen saknar riktig kostnad ⇒ break-even är en undre gräns. */
  kostnadOsaker: boolean;
  /** Andel av försäljningen utan riktig kostnad, 0–1. */
  andelUtanKostnad: number;
  /** Landet har minst en EGEN kostnadspost (inte bara butikens standard). */
  egenKostnad: boolean;
  /** Landet har en egen tullpost i Inställningar. */
  egenTull: boolean;
}

export function raknaMarknader(opts: {
  delar: MarknadsDelar["delar"];
  from: string;
  to: string;
  /** Antal dagar i perioden — nämnaren i "per dag". */
  dagar: number;
  /** Annonskostnaden per marknadsmärkning (getSpend med perMarknad). */
  spendPerMarknad: Record<string, SpendDay[]> | undefined;
  /** Annonskällan svarade utan fel. */
  spendOk: boolean;
  /** Länder som minst en kampanj är märkt med. */
  markta: Set<string>;
  /** Länder med minst en egen kostnadspost eller eget flerpackssteg. */
  egnaKostnader: Set<string>;
  /** Länder med egen tull i `marketFees`. */
  egenTull: Set<string>;
  /** Kostnad på raderna (nuvarande katalogkostnad + ev. uppskattning). */
  forbered: (rader: ProductRow[]) => ProductRow[];
  bas: Pick<ComputeInput, "costChanges" | "costTiers" | "settings" | "freeVariants">;
}): Marknadsrad[] {
  const ut: Marknadsrad[] = [];
  for (const [market, del] of Object.entries(opts.delar)) {
    const oms = del.sales.reduce((a, s) => a + s.totalSales, 0);
    const ordrar = del.sales.reduce((a, s) => a + s.orders, 0);
    if (!(oms > 0) && !(ordrar > 0)) continue;
    const spendOk = opts.spendOk && opts.markta.has(market);
    const r = compute({
      from: opts.from,
      to: opts.to,
      spendReliable: spendOk,
      fixedMonthlyTotal: 0,
      sales: del.sales,
      sessions: [],
      spend: spendOk ? opts.spendPerMarknad?.[market] ?? [] : [],
      products: opts.forbered(del.products),
      ...opts.bas,
      salesByMarket: { [market]: oms },
      coveredByMarket: { [market]: del.sales.reduce((a, s) => a + tacktOms(s), 0) },
      ordersByMarket: { [market]: ordrar },
    });
    const t = r.totals;
    const bidrag = spendOk ? t.grossProfit - t.spend : null;
    ut.push({
      market,
      totalSales: t.totalSales,
      orders: t.orders,
      aov: t.aov,
      spend: spendOk ? t.spend : null,
      mer: spendOk ? t.mer : null,
      breakEvenMer: t.breakEvenMer,
      grossProfit: t.grossProfit,
      bidrag,
      bidragPerDag: bidrag == null || !(opts.dagar > 0) ? null : bidrag / opts.dagar,
      kostnadOsaker: t.kostnadOsaker,
      andelUtanKostnad: t.cogsCoverage == null ? 0 : 1 - t.cogsCoverage,
      egenKostnad: opts.egnaKostnader.has(market),
      egenTull: opts.egenTull.has(market),
    });
  }
  return ut.sort((a, b) => b.totalSales - a.totalSales);
}
