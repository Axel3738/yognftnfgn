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
 * kursen för RESPEKTIVE DAG (ECB via Frankfurter). Fram till 2026-09-07 gick
 * hela perioden på en enda kurs — dagens — så en 30-dagarsvy ändrade sig
 * varje gång kronan rörde sig, även för dagar som var stängda sedan veckor.
 * Går kurserna inte att hämta utesluts butiken och namnges — en summa där
 * NOK och GBP lagts ihop rakt av är värre än en ofullständig summa.
 */

import prisma from "../db.server";
import { compute, type SalesDay, type SpendDay } from "./pnl.server";
import { dailyRates, latestRateDay, rateOn, type DailyRates } from "./fx.server";
import { readDaily, refreshShopDaily, shiftIso } from "./daily.server";
import { getSpend, kampanjFilter } from "./meta.server";
import { dayInTz } from "./shopify-data.server";
import { decrypt } from "./crypto.server";
import { dagarKvar, VARNA_DAGAR } from "./meta-login";
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
  /** Saker ägaren behöver göra i en ANNAN butik — t.ex. logga in igen på
   *  Facebook där, innan dess annonskostnad försvinner ur summan. Bara den
   *  butik man står i visar annars sin egen varning. */
  notes: { shop: string; text: string }[];
  /**
   * Senaste ECB-dag vars kurs användes (den äldsta bland butikerna, så att
   * datumet aldrig lovar mer än vad summan håller). Null när ingen butik
   * behövde räknas om.
   */
  fxDate: string | null;
}

const noll = (): GroupTotals => ({
  totalSales: 0, orders: 0, cogs: 0, tariff: 0, fees: 0, spend: 0, fixedCosts: 0, netProfit: 0,
});

type Medlem = Awaited<ReturnType<typeof prisma.shopSettings.findMany>>[number];

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
  };
}

async function summeraButik(
  m: Medlem,
  from: string,
  to: string,
  visaValuta: string,
  T: ReturnType<typeof t>,
): Promise<
  | { ok: true; shop: string; currency: string; totals: GroupTotals; fxDate: string | null; note?: string }
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

  /* Kurs per dag för hela intervallet — en hämtning per butik, cachad. Dagens
     egen kurs finns först ~16 CET och helger saknas: de dagarna får senast
     publicerade kurs, medan stängda dagar behåller sin egen för alltid. */
  const kurser = await dailyRates(m.currency, visaValuta, from, to);
  if (!kurser) {
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
      ? { adAccountId: m.metaAdAccountId, accessToken: metaToken, ...kampanjFilter(m) }
      : null;

  /* Token sparad men inget annonskonto valt (flera konton i listan, eller
     inklistrad token utan konto): ingen annonskostnad går att hämta, och
     butikens egen panel säger "för hög". Summan får inte räkna in samma
     butik som noll annonskostnad — uteslut och namnge, som en utgången
     inloggning. */
  if (m.metaAccessToken && !m.metaAdAccountId) {
    return { ok: false, shop: m.shop, reason: T.group.accountNotChosen };
  }
  /* Känd utgång (inloggning eller inklistrad token med känt datum): getSpend
     gör då inget dömt anrop och serverar inte den rörliga dagen som färdig. */
  const utgangsDagar = dagarKvar(m.metaTokenExpiresAt);
  const [costChanges, costTiers, fixedRows, spendData] = await Promise.all([
    prisma.costChange.findMany({ where: { shop: m.shop } }),
    prisma.costTier.findMany({ where: { shop: m.shop } }),
    prisma.fixedCost.findMany({ where: { shop: m.shop } }),
    /* syncFresh: även annonskostnadens färskhet väntas in — dagens spend är
       halva vinstkalkylen, och en bakgrundshämtning hade lämnat samma lucka
       som dagssiffrorna nyss hade. */
    getSpend(m.shop, metaCfg, from, to, idag, m.currency, m.spendCurrency, {
      syncFresh: true,
      tokenExpired: utgangsDagar != null && utgangsDagar < 0,
    }),
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
    /* Utgången Facebook-inloggning får ett eget skäl: åtgärden är ett klick
       i DEN butikens Settings, inte "öppna panelen en gång". */
    return {
      ok: false,
      shop: m.shop,
      reason: spendData.errorCode === "expired" ? T.group.loginExpired : T.group.spendUnavailable,
    };
  }

  /* Snart utgången inloggning i en annan butik syns bara här — ägaren står
     i en butik och tittar på fem. Sägs i god tid, med butikens namn. */
  const dagar = m.metaTokenSource === "login" ? dagarKvar(m.metaTokenExpiresAt) : null;
  const note =
    dagar != null && dagar <= VARNA_DAGAR
      ? dagar < 0
        ? T.group.loginExpired
        : T.group.loginExpiresSoon(dagar)
      : undefined;

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

  const totals = convertTotalsPerDay(r.totals, daily.sales, spendData.days, kurser, from, to);
  if (!totals) {
    /* En dag utan kurs inom tio dagar bakåt: kartan täcker inte intervallet
       (ett trunkerat svar, eller nödfallscachen räckte inte). Gissa inte. */
    return { ok: false, shop: m.shop, reason: T.group.fxUnavailable(m.currency, visaValuta) };
  }
  const fxDate = m.currency === visaValuta ? null : (latestRateDay(kurser, to) ?? null);
  return { ok: true, shop: m.shop, currency: m.currency, totals, fxDate, note };
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
  const notes: GroupResult["notes"] = [];
  let fxDate: string | null = null;

  for (const u of utfall) {
    if (!u.ok) {
      missing.push({ shop: u.shop, reason: u.reason });
      continue;
    }
    if (u.note) notes.push({ shop: u.shop, text: u.note });
    /* Redan omräknat per dag till betraktarens valuta i summeraButik. */
    const tt = u.totals;
    totals.totalSales += tt.totalSales;
    totals.orders += tt.orders;
    totals.cogs += tt.cogs;
    totals.tariff += tt.tariff;
    totals.fees += tt.fees;
    totals.spend += tt.spend;
    totals.fixedCosts += tt.fixedCosts;
    totals.netProfit += tt.netProfit;
    if (u.fxDate && (!fxDate || u.fxDate < fxDate)) fxDate = u.fxDate;

    rows.push({
      shop: u.shop,
      currency: u.currency,
      totalSales: tt.totalSales,
      netProfit: tt.netProfit,
      spend: tt.spend,
    });
  }

  return { currency: visaValuta, totals, rows, missing, notes, fxDate };
}
