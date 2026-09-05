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
import { readDaily, refreshShopDaily, shiftIso } from "./daily.server";
import { getSpend } from "./meta.server";
import { dayInTz } from "./shopify-data.server";
import { decrypt } from "./crypto.server";
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
  /* "Idag" i BUTIKENS tidszon. UTC-dagen släpar efter mellan midnatt och
     02:00 svensk tid, vilket gjorde både färskhetsfönstret och Metas
     dagsklassning en dag för generösa. */
  const idag = dayInTz(new Date(), m.timezone ?? "UTC");
  let daily = await readDaily(m.shop, from, to);
  if (daily.missingDays.length) {
    const first = daily.missingDays[0];
    const last = daily.missingDays[daily.missingDays.length - 1];
    const spann = (Date.parse(last) - Date.parse(first)) / 86_400_000 + 1;
    /* Korta luckor (Idag, 7 dagar) fylls SYNKRONT med butikens egen nyckel —
       paginerings-snabbvägen tar ett par sekunder, och alla butiker hämtas
       parallellt, så summan är komplett direkt istället för att be handlaren
       ladda om. Långa luckor (första 90-dagarsbygget) tar bulk-exportens
       halvminut per butik och får gå i bakgrunden; panelen laddar då om sig
       själv tills alla är med. */
    let hamtningOk = true;
    if (spann <= 7) {
      hamtningOk = await refreshShopDaily(m.shop, first, last, { force: true });
      if (hamtningOk) daily = await readDaily(m.shop, from, to);
    } else {
      /* Lång lucka: sondera nyckeln synkront med luckans sista dagar
         (pagineringsvägen, ett par sekunder) innan resten lovas bort till
         bakgrunden. Utan sonderingen sa panelen "hämtas just nu" i all
         evighet för en butik vars nyckel var död — FI:s 401 syntes aldrig. */
      const probeFrom = shiftIso(last, -2) > first ? shiftIso(last, -2) : first;
      hamtningOk = await refreshShopDaily(m.shop, probeFrom, last, { force: true });
      if (hamtningOk) {
        void refreshShopDaily(m.shop, first, last);
        daily = await readDaily(m.shop, from, to);
      }
    }
    /* Skillnaden syns i UI:t: "hämtas just nu" är sant bara när en hämtning
       faktiskt pågår. Slog den fel (död nyckel — FI:s token gav 401 i dagar
       medan panelen lovade att summan skulle fyllas på) ska det stå att
       butiken behöver öppnas, inte att allt löser sig självt. */
    if (daily.missingDays.length) {
      return {
        ok: false,
        shop: m.shop,
        reason: hamtningOk ? T.group.noCachedData : T.group.refreshFailed,
      };
    }
  } else {
    /* Färskhet: dagens siffror rör sig. De uppdaterades tidigare bara i
       bakgrunden — gruppsumman serverade då timmar gamla dagssiffror och det
       nya syntes först vid NÄSTA omladdning, som ingen visste att de skulle
       göra. En dag som såg ut som förlust var i verkligheten vinst. Nu väntar
       summan in de sekunder det tar: bara de tre senaste dagarna hämtas
       (pagineringssnabbvägen) och alla butiker går parallellt, så priset är
       ett par sekunder — och siffrorna är aldrig äldre än 10 minuter. */
    const senast = daily.lastDayFetchedAt?.getTime() ?? 0;
    if (to >= shiftIso(idag, -1) && Date.now() - senast > 10 * 60 * 1000) {
      const senasteFrom = from > shiftIso(to, -2) ? from : shiftIso(to, -2);
      const ok = await refreshShopDaily(m.shop, senasteFrom, to, { force: true });
      if (ok) {
        daily = await readDaily(m.shop, from, to);
      } else {
        /* Misslyckad uppdatering av den dag som fortfarande rör sig får INTE
           serveras tyst. Raden som ligger kvar är antingen morgongammal eller
           — värre — en nollrad skriven när orderfrågan svarade med fel. Då
           visades 0 kr försäljning bredvid full annonskostnad, vilket ser ut
           som en förlustdag men är ett hämtningsfel. Butiken namnges. */
        return { ok: false, shop: m.shop, reason: T.group.refreshFailed };
      }
    }
  }

  const kurs = await rate(m.currency, visaValuta);
  if (kurs == null) {
    return { ok: false, shop: m.shop, reason: T.group.fxUnavailable(m.currency, visaValuta) };
  }

  /* Annonskostnaden går genom getSpend med butikens EGEN Meta-nyckel — samma
     väg som butikens panel. Tidigare lästes bara cachade DailySpend-rader,
     så butiker vars panel ingen öppnat halkade efter i dagar och summans
     annonskostnad blev tyst för låg. Nu fylls luckor på plats och färskheten
     sköts i bakgrunden, precis som för dagsraderna. */
  const metaToken = m.metaAccessToken ? decrypt(m.metaAccessToken) : null;
  const metaCfg =
    m.metaAdAccountId && metaToken
      ? { adAccountId: m.metaAdAccountId, accessToken: metaToken }
      : null;
  const [costChanges, costTiers, fixedRows, spendData] = await Promise.all([
    prisma.costChange.findMany({ where: { shop: m.shop } }),
    prisma.costTier.findMany({ where: { shop: m.shop } }),
    prisma.fixedCost.findMany({ where: { shop: m.shop } }),
    /* syncFresh: även annonskostnadens färskhet väntas in — dagens spend är
       halva vinstkalkylen, och en bakgrundshämtning hade lämnat samma lucka
       som dagssiffrorna nyss hade. */
    getSpend(m.shop, metaCfg, from, to, idag, m.currency, m.spendCurrency, { syncFresh: true }),
  ]);

  /* Annonskostnaden måste vara komplett för att summan ska betyda något.
     Saknas den (död Meta-nyckel, rate limit) eller gick den inte att räkna om
     till butikens valuta, utesluts butiken och namnges — annars räknas
     saknade dagar som noll annonskostnad och gruppens vinst blir för HÖG.
     Det var exakt den lögnen som fick Axel att nästan fatta fel beslut. */
  if (spendData.currencyMismatch) {
    return {
      ok: false,
      shop: m.shop,
      reason: T.group.fxUnavailable(spendData.currencyMismatch.spend, spendData.currencyMismatch.shop),
    };
  }
  if (metaCfg && spendData.error) {
    return { ok: false, shop: m.shop, reason: T.group.spendUnavailable };
  }

  const r = compute({
    from, to,
    spendReliable: Boolean(!metaCfg || !spendData.error),
    fixedMonthlyTotal: fixedRows.reduce((a, x) => a + Number(x.monthlyAmount), 0),
    sales: daily.sales,
    sessions: [],
    spend: spendData.days,
    products: daily.products,
    costChanges: costChanges.map((c) => ({
      productGid: c.productGid,
      variantGid: c.variantGid,
      unitCost: Number(c.unitCost),
      effectiveFrom: c.effectiveFrom.toISOString().slice(0, 10),
      note: c.note,
    })),
    costTiers: costTiers.map((c) => ({ variantGid: c.variantGid, units: c.units, totalCost: Number(c.totalCost) })),
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
  const utfall = (
    await Promise.allSettled(medlemmar.map((m) => summeraButik(m, from, to, visaValuta, T)))
  ).map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    /* En butiks fel (DB-hicka, oväntat undantag) fick tidigare hela
       gruppsumman att kasta — och panelen visade "Application Error" i
       stället för de fyra butiker som gick bra. */
    console.error(`Gruppsummering för ${medlemmar[i].shop} misslyckades:`, r.reason);
    return { ok: false as const, shop: medlemmar[i].shop, reason: T.group.refreshFailed };
  });

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
