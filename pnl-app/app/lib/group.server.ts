/**
 * Summering av flera butiker till en gemensam kalkyl.
 *
 * Läser bara ur cachen. Varje butik håller sin egen cache varm när någon
 * öppnar dess panel, och att hämta ordrar för fem butiker vid varje
 * sidladdning vore både långsamt och en väg runt att varje butik ska stå för
 * sin egen datahämtning. Saknas en butiks siffror för perioden sägs det rakt
 * ut istället för att summan tyst blir för låg.
 *
 * Valuta: varje butik räknas om till den betraktande butikens valuta med
 * dagskurs. Går kursen inte att hämta utesluts butiken och namnges — en summa
 * där NOK och GBP lagts ihop rakt av är värre än en ofullständig summa.
 */

import prisma from "../db.server";
import { compute } from "./pnl.server";
import { rate } from "./fx.server";

export interface GroupTotals {
  totalSales: number;
  orders: number;
  cogs: number;
  tariff: number;
  fees: number;
  spend: number;
  fixedCosts: number;
  netProfit: number;
}

export interface GroupResult {
  currency: string;
  totals: GroupTotals;
  /** En rad per butik, för tabellen under hjulet. */
  rows: { shop: string; currency: string; totalSales: number; netProfit: number; spend: number }[];
  /** Butiker vars siffror inte gick att räkna in, med skäl. */
  missing: { shop: string; reason: string }[];
}

const noll = (): GroupTotals => ({
  totalSales: 0, orders: 0, cogs: 0, tariff: 0, fees: 0, spend: 0, fixedCosts: 0, netProfit: 0,
});

export async function summeraGrupp(
  groupId: string,
  cacheKey: string,
  from: string,
  to: string,
  visaValuta: string,
): Promise<GroupResult> {
  const medlemmar = await prisma.shopSettings.findMany({ where: { groupId }, orderBy: { shop: "asc" } });
  const totals = noll();
  const rows: GroupResult["rows"] = [];
  const missing: GroupResult["missing"] = [];

  for (const m of medlemmar) {
    const cached = await prisma.pnlCache.findUnique({
      where: { shop_key: { shop: m.shop, key: cacheKey } },
    });
    if (!cached) {
      missing.push({ shop: m.shop, reason: "inga sparade siffror för perioden — öppna butikens panel en gång" });
      continue;
    }

    const kurs = await rate(m.currency, visaValuta);
    if (kurs == null) {
      missing.push({ shop: m.shop, reason: `växelkurs ${m.currency}→${visaValuta} kunde inte hämtas` });
      continue;
    }

    const [costChanges, fixedRows, spendRows] = await Promise.all([
      prisma.costChange.findMany({ where: { shop: m.shop } }),
      prisma.fixedCost.findMany({ where: { shop: m.shop } }),
      prisma.dailySpend.findMany({
        where: { shop: m.shop, day: { gte: new Date(from), lte: new Date(to) } },
      }),
    ]);

    const data = cached.payload as unknown as { sales: any[]; products: any[] };
    const r = compute({
      from, to,
      spendReliable: true,
      fixedMonthlyTotal: fixedRows.reduce((a, x) => a + Number(x.monthlyAmount), 0),
      sales: data.sales,
      sessions: [],
      spend: spendRows.map((s) => ({
        day: s.day.toISOString().slice(0, 10),
        spend: Number(s.spend),
        impressions: s.impressions,
        clicks: s.clicks,
      })),
      products: data.products,
      costChanges: costChanges.map((c) => ({
        productGid: c.productGid,
        variantGid: c.variantGid,
        unitCost: Number(c.unitCost),
        effectiveFrom: c.effectiveFrom.toISOString().slice(0, 10),
        note: c.note,
      })),
      settings: {
        tariffPerOrder: Number(m.tariffPerOrder),
        feeRate: Number(m.feeRate),
        targetMargin: Number(m.targetMargin),
      },
    });

    const t = r.totals;
    totals.totalSales += t.totalSales * kurs;
    totals.orders += t.orders;               // antal, ingen omräkning
    totals.cogs += t.cogs * kurs;
    totals.tariff += t.tariff * kurs;
    totals.fees += t.fees * kurs;
    totals.spend += t.spend * kurs;
    totals.fixedCosts += t.fixedCosts * kurs;
    totals.netProfit += t.netProfit * kurs;

    rows.push({
      shop: m.shop,
      currency: m.currency,
      totalSales: t.totalSales * kurs,
      netProfit: t.netProfit * kurs,
      spend: t.spend * kurs,
    });
  }

  return { currency: visaValuta, totals, rows, missing };
}
