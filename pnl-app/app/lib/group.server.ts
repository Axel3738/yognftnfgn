/**
 * Summering av flera butiker till en gemensam kalkyl.
 *
 * Läser dagsrader ur DailyPnl — rena databasfrågor, inga API-anrop, och alla
 * medlemmar hämtas parallellt. Saknas en butiks dagar startas en bakgrunds-
 * hämtning med butikens EGEN sparade nyckel (alla tjänster delar databas, så
 * nycklarna finns i Session-tabellen): ingen behöver längre öppna varje
 * butiks panel för att summan ska bli komplett. Under tiden sägs det rakt ut
 * vilka butiker som saknas istället för att summan tyst blir för låg.
 *
 * Valuta: varje butik räknas om till den betraktande butikens valuta med
 * dagskurs. Går kursen inte att hämta utesluts butiken och namnges — en summa
 * där NOK och GBP lagts ihop rakt av är värre än en ofullständig summa.
 */

import prisma from "../db.server";
import { compute } from "./pnl.server";
import { rate } from "./fx.server";
import { readDaily, refreshShopDaily } from "./daily.server";
import { t, type Lang } from "./texts";

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

type Medlem = Awaited<ReturnType<typeof prisma.shopSettings.findMany>>[number];

async function summeraButik(
  m: Medlem,
  from: string,
  to: string,
  visaValuta: string,
  T: ReturnType<typeof t>,
): Promise<
  | { ok: true; shop: string; currency: string; totals: ReturnType<typeof compute>["totals"]; kurs: number }
  | { ok: false; shop: string; reason: string }
> {
  const daily = await readDaily(m.shop, from, to);
  if (daily.missingDays.length) {
    /* Självläkning: fyll dagarna i bakgrunden med butikens egen nyckel. */
    void refreshShopDaily(m.shop, daily.missingDays[0], daily.missingDays[daily.missingDays.length - 1]);
    return { ok: false, shop: m.shop, reason: T.group.noCachedData };
  }

  const kurs = await rate(m.currency, visaValuta);
  if (kurs == null) {
    return { ok: false, shop: m.shop, reason: T.group.fxUnavailable(m.currency, visaValuta) };
  }

  const [costChanges, fixedRows, spendRows] = await Promise.all([
    prisma.costChange.findMany({ where: { shop: m.shop } }),
    prisma.fixedCost.findMany({ where: { shop: m.shop } }),
    prisma.dailySpend.findMany({
      where: { shop: m.shop, day: { gte: new Date(from), lte: new Date(to) } },
    }),
  ]);

  const r = compute({
    from, to,
    spendReliable: true,
    fixedMonthlyTotal: fixedRows.reduce((a, x) => a + Number(x.monthlyAmount), 0),
    sales: daily.sales,
    sessions: [],
    spend: spendRows.map((s) => ({
      day: s.day.toISOString().slice(0, 10),
      spend: Number(s.spend),
      impressions: s.impressions,
      clicks: s.clicks,
    })),
    products: daily.products,
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

  return { ok: true, shop: m.shop, currency: m.currency, totals: r.totals, kurs };
}

export async function summeraGrupp(
  groupId: string,
  from: string,
  to: string,
  visaValuta: string,
  lang: Lang = "en",
): Promise<GroupResult> {
  // Skälen i `missing` visas i UI:t — de följer den betraktande butikens språk.
  const T = t(lang);
  const medlemmar = await prisma.shopSettings.findMany({ where: { groupId }, orderBy: { shop: "asc" } });

  /* Sekventiellt blev fem butiker fem väntetider i rad — parallellt är
     summan klar när den långsammaste butiken är det. */
  const utfall = await Promise.all(medlemmar.map((m) => summeraButik(m, from, to, visaValuta, T)));

  const totals = noll();
  const rows: GroupResult["rows"] = [];
  const missing: GroupResult["missing"] = [];

  for (const u of utfall) {
    if (!u.ok) {
      missing.push({ shop: u.shop, reason: u.reason });
      continue;
    }
    const tt = u.totals;
    totals.totalSales += tt.totalSales * u.kurs;
    totals.orders += tt.orders; // antal, ingen omräkning
    totals.cogs += tt.cogs * u.kurs;
    totals.tariff += tt.tariff * u.kurs;
    totals.fees += tt.fees * u.kurs;
    totals.spend += tt.spend * u.kurs;
    totals.fixedCosts += tt.fixedCosts * u.kurs;
    totals.netProfit += tt.netProfit * u.kurs;

    rows.push({
      shop: u.shop,
      currency: u.currency,
      totalSales: tt.totalSales * u.kurs,
      netProfit: tt.netProfit * u.kurs,
      spend: tt.spend * u.kurs,
    });
  }

  return { currency: visaValuta, totals, rows, missing };
}
