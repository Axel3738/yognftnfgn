/**
 * Panelen. Läser allt server-side i loadern så att första renderingen redan har
 * siffrorna — ingen spinner, inget "hämtar" som i artifact-versionen.
 */

import { Suspense, useEffect, useRef, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { defer, json } from "@remix-run/node";
import { Await, Link, useFetcher, useLoaderData, useRevalidator, useSearchParams } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Banner,
  Button,
  Card,
  Checkbox,
  DataTable,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Spinner,
  Text,
  TextField,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { compute, rangeWindow } from "../lib/pnl.server";
import { applyCurrentCosts, dayInTz, fetchShopInfo, loadCatalog } from "../lib/shopify-data.server";
import {
  bakgrundPagar,
  farStartaBakgrund,
  markeraPagaende,
  readDaily,
  refreshDaily,
  refreshShopDaily,
  shiftIso,
} from "../lib/daily.server";
import { getSpend } from "../lib/meta.server";
import { summeraGrupp } from "../lib/group.server";
import { decrypt } from "../lib/crypto.server";
import { asLang, localeOf, t, type Lang, type Texts } from "../lib/texts";

type SettingsRow = Awaited<ReturnType<typeof prisma.shopSettings.upsert>>;

/**
 * Det tunga jobbet bor i ett promise som INTE awaitas i loadern: skalet
 * renderas direkt och datan strömmas in när den är klar. 30 dagar = ~750
 * ordrar i sekventiella API-anrop, 10–30 sekunder — utan defer är iframen
 * spikvit hela den tiden och ser trasig ut.
 */
async function loadPage(admin: any, shop: string, rangeKey: string, url: URL, settings0: SettingsRow) {
  const lang = asLang(settings0.language);
  try {

  let settings = settings0;

  /* Butiksinfo kostade ett GraphQL-anrop på varje sidladdning. Tidszonen
     ändras i praktiken aldrig, så när den är känd räknas "idag" fram lokalt
     och anropet hoppas över helt. Är den okänd hämtas den en gång och sparas.
     Valutan kan ändras i efterhand, så den läses om i bakgrunden en gång per
     dygn — utan att någon behöver vänta på det. */
  let timezone = settings.timezone;
  if (!timezone) {
    const info = await fetchShopInfo(admin);
    timezone = info.timezone;
    settings = await prisma.shopSettings.update({
      where: { shop },
      data: { timezone, currency: info.currency },
    });
  } else if (Date.now() - settings.updatedAt.getTime() > 24 * 60 * 60 * 1000) {
    void fetchShopInfo(admin)
      .then((info) =>
        prisma.shopSettings.update({
          where: { shop },
          data: { timezone: info.timezone, currency: info.currency },
        }),
      )
      .catch(() => {});
  }

  const today = dayInTz(new Date(), timezone);
  const [from, to] = rangeWindow(rangeKey, today, {
    from: url.searchParams.get("from") ?? today,
    to: url.searchParams.get("to") ?? today,
  });

  /* Dagslagret: intervallet läses som färdiga dagsrader ur databasen —
     millisekunder oavsett datumval, det är hela snabbhetsmodellen. Bara dagar
     som ALDRIG hämtats exporteras synkront: första besöket ever, och morgonens
     nya dag (som tar snabbvägen via paginering, ett par sekunder). */
  let daily = await readDaily(shop, from, to);
  if (daily.missingDays.length) {
    const first = daily.missingDays[0];
    const last = daily.missingDays[daily.missingDays.length - 1];
    await refreshDaily(admin, shop, timezone, first, last);
    daily = await readDaily(shop, from, to);
  }

  /* Färskhet: intervallets sista dag är den som rör sig — äldre än 10 min
     uppdateras dagens närmaste dagar i bakgrunden (billig, kort export).
     Ligger någon dag i intervallet mer än 6 h bak (sena returer bokförs på
     orderns dag) exporteras hela intervallet om, också i bakgrunden. */
  /* Gruppvyn väntar ändå in alla medlemmars färska dagar — då måste den EGNA
     butiken hämtas synkront också. Annars visar samma skärm färska
     medlemssiffror i tabellen och timgamla i KPI-rutorna ovanför, och den
     som läser av dagens vinst får två olika svar. */
  const gruppvy = url.searchParams.get("all") === "1";
  const lastAt = daily.lastDayFetchedAt?.getTime() ?? 0;
  const oldestAt = daily.oldestFetchedAt?.getTime() ?? 0;
  const dataAgeMin = lastAt ? Math.round((Date.now() - lastAt) / 60000) : 0;
  /* Startvärdet är "pågår det redan en hämtning?" — inte "startade JAG en?".
     Skillnaden avgör om självomladdningen fortsätter polla: en bulk-export
     tar ~30 s, och minutspärren hindrar nästa laddning från att starta en ny,
     så utan det här slutade panelen polla efter 6 sekunder och stod kvar på
     gamla siffror tills någon laddade om för hand. */
  let refreshing = bakgrundPagar(shop);
  const refreshBg = (f: string, tt: string) => {
    refreshing = true;
    void markeraPagaende(
      shop,
      refreshDaily(admin, shop, timezone, f, tt),
    ).catch((e) => console.error("Bakgrundsuppdatering misslyckades:", e));
  };
  const forAldrad = to >= today && Date.now() - lastAt > 10 * 60 * 1000;
  if (gruppvy && forAldrad) {
    const senasteFrom = from > shiftIso(today, -2) ? from : shiftIso(today, -2);
    if (await refreshShopDaily(shop, senasteFrom, today, { force: true })) {
      daily = await readDaily(shop, from, to);
    }
  } else if (forAldrad && farStartaBakgrund(shop)) {
    refreshBg(from > shiftIso(today, -2) ? from : shiftIso(today, -2), today);
  } else if (Date.now() - oldestAt > 6 * 60 * 60 * 1000 && farStartaBakgrund(shop)) {
    refreshBg(from, to);
  }
  /* Allt nedan är oberoende av varandra — sekventiellt blev det fyra
     väntningar i rad där en räcker. */
  const [costChanges, fixedRows, catalog, groupSize] = await Promise.all([
    prisma.costChange.findMany({ where: { shop } }),
    prisma.fixedCost.findMany({ where: { shop } }),
    loadCatalog(admin, shop, prisma),
    settings.groupId
      ? prisma.shopSettings.count({ where: { groupId: settings.groupId } })
      : Promise.resolve(1),
  ]);
  const fixedMonthlyTotal = fixedRows.reduce((a, r) => a + Number(r.monthlyAmount), 0);

  /* Kostnaden läses om ur katalogen (5 min minnescache) istället för att tas
     ur det lagrade aggregatet — annars syns ett nyss inskrivet inköpspris
     först när hela orderexporten körts om, och importen ser trasig ut. */
  const sales = daily.sales;
  const products = applyCurrentCosts(daily.products, catalog);
  /* Sessioner/CVR finns inte i det publika Admin-API:t — analytics-ytan är
     intern hos Shopify. Tom serie => "—" i panelen. */
  const sessions: never[] = [];

  const spend = await getSpend(
    shop,
    settings.metaAdAccountId && settings.metaAccessToken
      ? { adAccountId: settings.metaAdAccountId, accessToken: decrypt(settings.metaAccessToken)! }
      : null,
    from,
    to,
    today,
    settings.currency,
    settings.spendCurrency,
  );

  const metaConfigured = Boolean(settings.metaAdAccountId && settings.metaAccessToken);

  /* Kom igång-läget. En ny butik installerar appen och ser siffror som ser
     riktiga ut men ljuger — noll inköpspriser ger full marginal, saknad
     Meta-koppling ger noll annonskostnad. Checklistan säger rakt ut vad som
     fattas i just den här butiken istället för att låta handlaren gissa. */
  const setup = {
    dismissed: Boolean(settings.setupDismissedAt),
    meta: metaConfigured && !spend.error,
    fixed: fixedRows.length > 0,
    settings: Boolean(settings.settingsSavedAt),
  };

  const result = compute({
    from,
    to,
    spendReliable: metaConfigured && !spend.error,
    fixedMonthlyTotal,
    sales,
    sessions,
    spend: spend.days,
    products,
    costChanges: costChanges.map((c) => ({
      productGid: c.productGid,
      variantGid: c.variantGid,
      unitCost: Number(c.unitCost),
      effectiveFrom: c.effectiveFrom.toISOString().slice(0, 10),
      note: c.note,
    })),
    settings: {
      tariffPerOrder: Number(settings.tariffPerOrder),
      feeRate: Number(settings.feeRate),
      targetMargin: Number(settings.targetMargin),
    },
  });

  /* Jämförelse: samma antal dagar direkt före perioden. Hämtas EFTER huvud-
     perioden (bulk-kön är en i taget) och får misslyckas tyst — en panel utan
     jämförelsesiffror är bättre än en som inte laddar. */
  let comparison: { totalSales: number; orders: number; spend: number; netProfit: number } | null = null;
  try {
    const dayCount = result.days.length;
    const prevTo = shiftIso(from, -1);
    const prevFrom = shiftIso(prevTo, -(dayCount - 1));
    const prevData = await readDaily(shop, prevFrom, prevTo);
    /* Bara databasen — saknas jämförelsedagar fylls de i bakgrunden och syns
       vid nästa besök. De får aldrig kosta en synlig sekund. */
    if (prevData.missingDays.length) {
      if (farStartaBakgrund(shop)) {
        void refreshDaily(
          admin, shop, timezone,
          prevData.missingDays[0],
          prevData.missingDays[prevData.missingDays.length - 1],
        ).catch(() => {});
      }
      throw new Error("jämförelsen fylls i bakgrunden");
    }
    const prevSpend = await getSpend(
      shop,
      metaConfigured
        ? { adAccountId: settings.metaAdAccountId!, accessToken: decrypt(settings.metaAccessToken)! }
        : null,
      prevFrom, prevTo, today, settings.currency, settings.spendCurrency,
    );
    const prev = compute({
      from: prevFrom, to: prevTo,
      spendReliable: metaConfigured && !prevSpend.error,
      fixedMonthlyTotal,
      sales: prevData.sales, sessions: [], spend: prevSpend.days,
      products: applyCurrentCosts(prevData.products, catalog),
      costChanges: costChanges.map((c) => ({
        productGid: c.productGid, variantGid: c.variantGid, unitCost: Number(c.unitCost),
        effectiveFrom: c.effectiveFrom.toISOString().slice(0, 10), note: c.note,
      })),
      settings: {
        tariffPerOrder: Number(settings.tariffPerOrder),
        feeRate: Number(settings.feeRate),
        targetMargin: Number(settings.targetMargin),
      },
    });
    if (prev.totals.orders > 0) {
      comparison = {
        totalSales: prev.totals.totalSales, orders: prev.totals.orders,
        spend: prev.totals.spend, netProfit: prev.totals.netProfit,
      };
    }
  } catch (e) {
    // väntat när jämförelsen ännu inte cachats — den fylls i bakgrunden
  }

  /* Gemensam vy över flera butiker. Bara när handlaren kryssat i den —
     summan kostar ett antal databasfrågor och de flesta vill se sin egen
     butik. Antalet medlemmar räknas alltid, för kryssrutan ska bara finnas
     när det faktiskt finns något att summera. */
  const visaAlla = gruppvy && groupSize > 1;
  const group = visaAlla
    ? await summeraGrupp(settings.groupId!, from, to, settings.currency, lang)
    : null;

  return {
    fatal: null as string | null,
    comparison,
    groupSize,
    group,
    setup: setup as {
      dismissed: boolean; meta: boolean; fixed: boolean; settings: boolean;
    } | null,
    fixedCount: fixedRows.length,
    dataAgeMin,
    refreshing,
    result,
    rangeKey,
    currency: settings.currency,
    spendError: spend.error ?? null,
    spendCurrencyMismatch: spend.currencyMismatch ?? null,
    spendConverted: spend.converted ?? null,
    targetMargin: Number(settings.targetMargin),
    tariffPerOrder: Number(settings.tariffPerOrder),
  };
  } catch (e) {
    /* Remix maskerar kastade fel i produktion till "Application Error" utan
       detaljer. Här fångas de och visas i klartext — utan feltexten på skärmen
       blir varje felsökningsrunda en gissningslek. */
    console.error("Loader-fel /app:", e);
    /* Shopify-biblioteket kastar Response-objekt vid auktoriseringsfel.
       Utan urpackning blev det "[object Response]" på skärmen — ett fel som
       pekar ingenstans. Status, kropp och eventuell reauth-adress säger allt. */
    let fatal: string;
    if (e instanceof Response) {
      const body = await e.text().catch(() => "");
      const reauth = e.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url") ?? "";
      fatal =
        `HTTP ${e.status} ${e.statusText || ""}`.trim() +
        (body ? ` — ${body.slice(0, 300)}` : "") +
        (reauth ? ` (reauthorize: ${reauth})` : "");
    } else {
      fatal = e instanceof Error ? `${e.message}` : String(e);
    }
    return {
      fatal,
      comparison: null as { totalSales: number; orders: number; spend: number; netProfit: number } | null,
      groupSize: 1,
      group: null as Awaited<ReturnType<typeof summeraGrupp>> | null,
      setup: null as { dismissed: boolean; meta: boolean; fixed: boolean; settings: boolean } | null,
      fixedCount: 0,
      dataAgeMin: 0,
      refreshing: false,
      result: null as ReturnType<typeof compute> | null,
      rangeKey,
      currency: "SEK",
      spendError: null as string | null,
      spendCurrencyMismatch: null as { spend: string; shop: string } | null,
      spendConverted: null as { from: string; to: string } | null,
      targetMargin: 0.25,
      tariffPerOrder: 27.5,
    };
  }
}

type PageData = Awaited<ReturnType<typeof loadPage>>;

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const rangeKey = url.searchParams.get("range") ?? "30d";
  /* Språket behövs redan i Suspense-fallbacken, alltså före det tunga
     promiset — därför läses inställningsraden synkront här (PK-uppslag,
     millisekunder) och skickas vidare in i loadPage. */
  const settings = await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    create: { shop: session.shop },
    update: {},
  });
  // Medvetet inget await — promiset strömmas till klienten via defer.
  return defer({
    lang: asLang(settings.language),
    page: loadPage(admin, session.shop, rangeKey, url, settings),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  if (String(form.get("intent")) === "dismiss-setup") {
    await prisma.shopSettings.update({
      where: { shop: session.shop },
      data: { setupDismissedAt: new Date() },
    });
  }
  return json({ ok: true });
}

export default function Dashboard() {
  const { lang, page } = useLoaderData<typeof loader>();
  const T = t(lang);
  return (
    <Suspense
      fallback={
        <Page title={T.dashboard.title}>
          <Card>
            <BlockStack gap="300" inlineAlign="center">
              <Spinner accessibilityLabel={T.dashboard.loadingOrders} size="large" />
              <Text as="p" tone="subdued">
                {T.dashboard.loadingText}
              </Text>
            </BlockStack>
          </Card>
        </Page>
      }
    >
      <Await resolve={page}>{(d) => <DashboardView d={d as PageData} lang={lang} />}</Await>
    </Suspense>
  );
}


/* ============ Visuell uppdelning ============
   Del-av-helhet: omsättningen delas i kostnadsposter + nettovinst.
   Paletten är validerad med dataviz-skillens sex kontroller (CVD-säker,
   fast ordning). Tabellen bredvid är den obligatoriska avlastningen för
   segment med låg kontrast (gul, magenta). */
const SLICE_COLORS = {
  cogs: "#4a3aa7",     // violett — produktkostnad
  spend: "#eb6834",    // orange — annonser
  fees: "#2a78d6",     // blå — transaktionsavgifter
  tariff: "#eda100",   // gul — tull
  fixed: "#e87ba4",    // magenta — fasta kostnader
  profit: "#008300",   // grön — nettovinst
} as const;

const TIP_STYLE: React.CSSProperties = {
  position: "absolute", pointerEvents: "none", transform: "translate(-50%, -115%)",
  background: "#202223", color: "#ffffff", padding: "8px 10px", borderRadius: 8,
  fontSize: 12, lineHeight: 1.45, whiteSpace: "nowrap", zIndex: 10,
  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
};

function Donut({
  t: totals,
  money,
  T,
  lang,
}: {
  t: NonNullable<PageData["result"]>["totals"];
  money: (v: number | null) => string;
  T: Texts;
  lang: Lang;
}) {
  const [tip, setTip] = useState<{ x: number; y: number; key: string } | null>(null);

  const parts = [
    { key: "cogs", label: T.dashboard.productCost, value: totals.cogs },
    { key: "spend", label: T.dashboard.ads, value: totals.spend },
    { key: "fees", label: T.dashboard.txFees, value: totals.fees },
    { key: "tariff", label: T.dashboard.kpi.duty, value: totals.tariff },
    { key: "fixed", label: T.dashboard.kpi.fixedCosts, value: totals.fixedCosts },
    { key: "profit", label: T.dashboard.kpi.netProfit, value: Math.max(totals.netProfit, 0) },
  ].filter((p) => p.value > 0.5);
  const total = parts.reduce((a, p) => a + p.value, 0);
  if (total <= 0) return null;

  const R = 80, r = 48, C = 100;
  let angle = -Math.PI / 2;
  const arcs = parts.map((p) => {
    const sweep = (p.value / total) * Math.PI * 2;
    const a0 = angle, a1 = angle + sweep;
    angle = a1;
    const large = sweep > Math.PI ? 1 : 0;
    const x0 = C + R * Math.cos(a0), y0 = C + R * Math.sin(a0);
    const x1 = C + R * Math.cos(a1), y1 = C + R * Math.sin(a1);
    const xi1 = C + r * Math.cos(a1), yi1 = C + r * Math.sin(a1);
    const xi0 = C + r * Math.cos(a0), yi0 = C + r * Math.sin(a0);
    return {
      ...p,
      /* procent av omsättningen — det användaren frågar sig vid hovring */
      ofRevenue: totals.totalSales > 0 ? p.value / totals.totalSales : 0,
      d: `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${r} ${r} 0 ${large} 0 ${xi0} ${yi0} Z`,
    };
  });

  const hovered = tip ? arcs.find((a) => a.key === tip.key) ?? null : null;
  const pctStr = (v: number) => {
    const s = (v * 100).toFixed(1);
    return `${lang === "sv" ? s.replace(".", ",") : s} %`;
  };

  return (
    <div
      style={{ position: "relative" }}
      onMouseLeave={() => setTip(null)}
      onMouseMove={(e) => {
        if (!tip) return;
        const rct = e.currentTarget.getBoundingClientRect();
        setTip({ ...tip, x: e.clientX - rct.left, y: e.clientY - rct.top });
      }}
    >
      <BlockStack gap="300" inlineAlign="center">
        <svg viewBox="0 0 200 200" style={{ width: 230, maxWidth: "100%" }} role="img" aria-label={T.dashboard.donutAria}>
          {arcs.map((a) => (
            <path
              key={a.key}
              d={a.d}
              fill={SLICE_COLORS[a.key as keyof typeof SLICE_COLORS]}
              stroke="#ffffff"
              strokeWidth="2"
              opacity={tip && tip.key !== a.key ? 0.4 : 1}
              style={{ transition: "opacity 120ms", cursor: "default" }}
              onMouseEnter={(e) => {
                const rct = (e.currentTarget.ownerSVGElement!.parentElement as HTMLElement)
                  .closest("div")!.getBoundingClientRect();
                setTip({ key: a.key, x: e.clientX - rct.left, y: e.clientY - rct.top });
              }}
            />
          ))}
          {hovered ? (
            <>
              <text x="100" y="88" textAnchor="middle" fontSize="11" fill="#6d7175">{hovered.label}</text>
              <text x="100" y="106" textAnchor="middle" fontSize="15" fontWeight="700"
                fill={SLICE_COLORS[hovered.key as keyof typeof SLICE_COLORS]}>
                {pctStr(hovered.ofRevenue)}
              </text>
              <text x="100" y="122" textAnchor="middle" fontSize="10" fill="#6d7175">{T.dashboard.ofRevenue}</text>
            </>
          ) : (
            <>
              <text x="100" y="94" textAnchor="middle" fontSize="11" fill="#6d7175">{T.dashboard.revenue}</text>
              <text x="100" y="112" textAnchor="middle" fontSize="14" fontWeight="700" fill="#202223">{money(totals.totalSales)}</text>
            </>
          )}
        </svg>
        <InlineStack gap="300" wrap align="center">
          {arcs.map((a) => (
            <InlineStack key={a.key} gap="100" blockAlign="center">
              <span style={{ width: 10, height: 10, borderRadius: 5, background: SLICE_COLORS[a.key as keyof typeof SLICE_COLORS], display: "inline-block" }} />
              <Text as="span" variant="bodySm" tone="subdued">{a.label}</Text>
            </InlineStack>
          ))}
        </InlineStack>
      </BlockStack>
      {hovered && tip ? (
        <div style={{ ...TIP_STYLE, left: tip.x, top: tip.y }}>
          <strong>{hovered.label}</strong>
          <br />
          {money(hovered.value)} · {pctStr(hovered.ofRevenue)} {T.dashboard.ofRevenue}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Vinst per dag. COGS, avgifter och tull fördelas per dag i proportion till
 * dagens omsättning/ordrar — produktmixen finns bara aggregerad för perioden,
 * så per-dag-vinsten är en välgrundad uppskattning, inte bokföring.
 */
function ProfitBars({
  result,
  money,
  T,
}: {
  result: NonNullable<PageData["result"]>;
  money: (v: number | null) => string;
  T: Texts;
}) {
  const [tip, setTip] = useState<{ x: number; y: number; i: number } | null>(null);
  const t = result.totals;
  const days = result.sales;
  if (days.length < 2) return null;

  const fixedDaily = t.fixedCosts / days.length;
  const rows = days.map((d) => {
    const spend = result.spendByDay[d.day]?.spend ?? 0;
    const cogs = t.netSales > 0 ? t.cogs * (d.netSales / t.netSales) : 0;
    const fees = t.totalSales > 0 ? t.fees * (d.totalSales / t.totalSales) : 0;
    const tariff = t.orders > 0 ? t.tariff * (d.orders / t.orders) : 0;
    return { day: d.day, revenue: d.totalSales, spend, profit: d.totalSales - cogs - fees - tariff - spend - fixedDaily };
  });

  const W = 860, H = 150, padL = 8, padB = 18;
  const maxV = Math.max(...rows.map((r) => r.profit), 1);
  const minV = Math.min(...rows.map((r) => r.profit), 0);
  const span = maxV - minV || 1;
  const y = (v: number) => 6 + (H - padB - 12) * (1 - (v - minV) / span);
  const bw = (W - padL * 2) / rows.length;
  const zero = y(0);
  const lbl = (iso: string) => `${+iso.slice(8, 10)}/${+iso.slice(5, 7)}`;
  const every = Math.max(1, Math.ceil(rows.length / 8));

  return (
    <div style={{ position: "relative" }} onMouseLeave={() => setTip(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }} role="img" aria-label={T.dashboard.profitPerDay}>
        <line x1={padL} x2={W - padL} y1={zero} y2={zero} stroke="#d2d5d8" strokeWidth="1" />
        {rows.map((r, i) => {
          const x = padL + i * bw + 1;
          const w = Math.max(bw - 2, 1.5);
          const top = Math.min(y(r.profit), zero);
          const h = Math.max(Math.abs(y(r.profit) - zero), 1);
          return (
            <rect
              key={r.day}
              x={x} y={top} width={w} height={h} rx={3}
              fill={r.profit >= 0 ? "#008300" : "#b3261e"}
              opacity={tip && tip.i !== i ? 0.45 : 0.9}
              onMouseEnter={(e) => {
                const rct = (e.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect();
                setTip({ i, x: e.clientX - rct.left, y: e.clientY - rct.top });
              }}
              onMouseMove={(e) => {
                const rct = (e.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect();
                setTip({ i, x: e.clientX - rct.left, y: e.clientY - rct.top });
              }}
            />
          );
        })}
        {rows.map((r, i) =>
          i % every === 0 || i === rows.length - 1 ? (
            <text key={r.day} x={padL + i * bw + bw / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="#6d7175">
              {lbl(r.day)}
            </text>
          ) : null,
        )}
      </svg>
      {tip ? (
        <div style={{ ...TIP_STYLE, left: tip.x, top: tip.y }}>
          <strong>{lbl(rows[tip.i].day)}</strong>
          <br />
          {T.dashboard.tipSales}: {money(rows[tip.i].revenue)}
          <br />
          {T.dashboard.tipAds}: {money(rows[tip.i].spend)}
          <br />
          {T.dashboard.tipProfit}: {money(rows[tip.i].profit)}
        </div>
      ) : null}
    </div>
  );
}

function BreakdownRow({ label, value, bold, colorKey, money, ofRevenue, dec }: {
  label: string; value: number; bold?: boolean;
  colorKey?: keyof typeof SLICE_COLORS;
  money: (v: number | null) => string;
  /** Andel av omsättningen — visas dämpat efter beloppet. */
  ofRevenue?: number;
  /** Decimaltecken efter språk. */
  dec: (s: string) => string;
}) {
  return (
    <InlineStack align="space-between" blockAlign="center">
      <InlineStack gap="150" blockAlign="center">
        {colorKey ? (
          <span style={{ width: 8, height: 8, borderRadius: 4, background: SLICE_COLORS[colorKey], display: "inline-block" }} />
        ) : null}
        <Text as="span" variant={bold ? "headingSm" : "bodyMd"}>{label}</Text>
      </InlineStack>
      <InlineStack gap="150" blockAlign="center">
        {ofRevenue != null ? (
          <Text as="span" variant="bodySm" tone="subdued">
            {`${dec((Math.abs(ofRevenue) * 100).toFixed(1))} %`}
          </Text>
        ) : null}
        <Text as="span" variant={bold ? "headingSm" : "bodyMd"}>
          {value < 0 ? `−${money(-value)}` : money(value)}
        </Text>
      </InlineStack>
    </InlineStack>
  );
}


/**
 * Frågar efter månadskostnaderna direkt på förstasidan tills minst en finns.
 * En flik man måste leta upp är en flik ingen fyller i — utan fasta kostnader
 * ljuger nettovinsten uppåt, så panelen ber aktivt om dem.
 */
function FixedCostQuickAdd({ T }: { T: Texts }) {
  const fetcher = useFetcher();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const busy = fetcher.state !== "idle";
  const add = () => {
    if (!name.trim() || !amount.trim()) return;
    fetcher.submit(
      { intent: "add", name, monthlyAmount: amount },
      { method: "POST", action: "/app/fixed" },
    );
    setName("");
    setAmount("");
  };
  return (
    <InlineStack gap="300" blockAlign="end" wrap>
      <div style={{ minWidth: 200, flex: 1 }}>
        <TextField label={T.dashboard.quickAdd.nameLabel} labelHidden placeholder={T.dashboard.quickAdd.namePlaceholder}
          value={name} onChange={setName} autoComplete="off" />
      </div>
      <div style={{ minWidth: 130 }}>
        <TextField label={T.dashboard.quickAdd.amountLabel} labelHidden placeholder={T.dashboard.quickAdd.amountPlaceholder}
          suffix={T.dashboard.quickAdd.amountSuffix}
          value={amount} onChange={setAmount} autoComplete="off" />
      </div>
      <Button variant="primary" onClick={add} loading={busy}>{T.dashboard.quickAdd.add}</Button>
    </InlineStack>
  );
}

/**
 * Kom igång-checklista.
 *
 * En nyinstallerad butik visar siffror som ser färdiga ut men är fel: utan
 * inköpspriser är marginalen 100 %, utan Meta-koppling är annonskostnaden noll.
 * Checklistan pekar ut exakt vad som fattas i den butiken och länkar dit.
 * Fasta kostnader har formuläret direkt i listan — ett steg som kräver ett
 * fliksbyte är ett steg som inte blir gjort.
 */
function SetupChecklist({
  setup,
  costsDone,
  costsHint,
  currency,
  tariffPerOrder,
  T,
  dec,
}: {
  setup: NonNullable<PageData["setup"]>;
  costsDone: boolean;
  costsHint: string;
  currency: string;
  tariffPerOrder: number;
  T: Texts;
  dec: (s: string) => string;
}) {
  const dismisser = useFetcher();
  const steps = [
    {
      key: "costs",
      done: costsDone,
      title: T.dashboard.setup.stepCosts,
      hint: costsHint,
      to: "/app/costs",
      cta: T.dashboard.setup.ctaCosts,
    },
    {
      key: "meta",
      done: setup.meta,
      title: T.dashboard.setup.stepMeta,
      hint: setup.meta ? T.dashboard.setup.metaHintDone : T.dashboard.setup.metaHintTodo,
      to: "/app/settings",
      cta: T.dashboard.setup.ctaSettings,
    },
    {
      key: "fixed",
      done: setup.fixed,
      title: T.dashboard.setup.stepFixed,
      hint: setup.fixed ? T.dashboard.setup.fixedHintDone : T.dashboard.setup.fixedHintTodo,
      to: "/app/fixed",
      cta: T.dashboard.setup.ctaFixed,
    },
    {
      key: "settings",
      done: setup.settings,
      title: T.dashboard.setup.stepSettings,
      hint: setup.settings
        ? T.dashboard.setup.settingsHintDone
        : T.dashboard.setup.settingsHintTodo(dec(tariffPerOrder.toFixed(2)), currency),
      to: "/app/settings",
      cta: T.dashboard.setup.ctaSettings,
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <Card background="bg-surface-secondary">
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center" wrap={false}>
          <Text as="h2" variant="headingMd">{T.dashboard.setup.title}</Text>
          <Badge tone={doneCount === steps.length ? "success" : "attention"}>
            {T.dashboard.setup.progress(doneCount, steps.length)}
          </Badge>
        </InlineStack>
        <Text as="p" tone="subdued">
          {T.dashboard.setup.intro}
        </Text>

        <BlockStack gap="300">
          {steps.map((s) => (
            <BlockStack key={s.key} gap="200">
              <InlineStack gap="300" blockAlign="start" wrap={false}>
                <span
                  aria-hidden
                  style={{
                    flex: "0 0 auto", width: 20, height: 20, borderRadius: 10, marginTop: 2,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    background: s.done ? "#008300" : "#ffffff",
                    border: s.done ? "none" : "2px solid #babec3",
                    color: "#ffffff", fontSize: 12, fontWeight: 700, lineHeight: 1,
                  }}
                >
                  {s.done ? "✓" : ""}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <BlockStack gap="050">
                    <Text as="span" variant="bodyMd" fontWeight={s.done ? "regular" : "semibold"}
                      tone={s.done ? "subdued" : undefined}>
                      {s.title}
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">{s.hint}</Text>
                  </BlockStack>
                </div>
                {s.done ? null : (
                  <Link to={s.to}>
                    <Text as="span" variant="bodySm">{s.cta} →</Text>
                  </Link>
                )}
              </InlineStack>
              {/* Formuläret ligger i listan just för att slippa fliksbytet. */}
              {s.key === "fixed" && !s.done ? (
                <div style={{ paddingLeft: 32 }}>
                  <FixedCostQuickAdd T={T} />
                </div>
              ) : null}
            </BlockStack>
          ))}
        </BlockStack>

        <InlineStack align="end">
          <Button
            variant="plain"
            loading={dismisser.state !== "idle"}
            onClick={() => dismisser.submit({ intent: "dismiss-setup" }, { method: "POST" })}
          >
            {T.dashboard.setup.dismiss}
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

function DashboardView({ d, lang }: { d: PageData; lang: Lang }) {
  const { fatal, result, rangeKey, currency, spendError, spendCurrencyMismatch, spendConverted, targetMargin, tariffPerOrder, comparison, setup, dataAgeMin, refreshing, groupSize, group } = d;
  const [params, setParams] = useSearchParams();
  const revalidator = useRevalidator();
  const T = t(lang);

  /* Saknas butiker i gruppsumman pågår en bakgrundshämtning på servern —
     sidan laddar då om sig själv tills alla är med, istället för att be
     handlaren trycka F5. Takbegränsat: en butik med död nyckel ska inte ge
     en evig pollningsloop. */
  const missingCount = d.group?.missing.length ?? 0;
  const pollCount = useRef(0);
  useEffect(() => {
    /* Två skäl att ladda om sig själv: gruppbutiker saknas (bakgrundshämtning
       pågår på servern), eller den egna butikens dagssiffror uppdateras i
       bakgrunden (refreshing). Utan det andra skälet stod panelen kvar på
       timmar gamla siffror med bara en diskret "uppdaterad för X min sedan"-
       rad — och den som läste av dagens vinst fick fel svar tills en manuell
       omladdning ingen visste behövdes. */
    if ((missingCount === 0 && !refreshing) || pollCount.current >= 10 || revalidator.state !== "idle") return;
    const timer = setTimeout(() => {
      pollCount.current += 1;
      revalidator.revalidate();
    }, 6000);
    return () => clearTimeout(timer);
  }, [missingCount, refreshing, revalidator, revalidator.state]);
  const dec = (s: string) => (lang === "sv" ? s.replace(".", ",") : s);
  if (fatal || !result) {
    return (
      <Page title={T.dashboard.title}>
        <Banner tone="critical" title={T.dashboard.fatalTitle}>
          <p style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{fatal ?? T.dashboard.unknownError}</p>
          <p>{T.dashboard.fatalHelp}</p>
        </Banner>
      </Page>
    );
  }
  const t2 = result.totals;

  /* Kostnadssteget kan bara bedömas mot faktiskt sålda enheter — en butik utan
     ordrar i perioden har inget att stämma av mot, och kvitteras inte. */
  const costsDone = t2.orders > 0 && t2.unitsWithoutCost === 0;
  const costsHint =
    t2.orders === 0
      ? T.dashboard.setup.costsHintNoOrders
      : t2.unitsWithoutCost > 0
        ? T.dashboard.setup.costsHintMissing(t2.unitsWithoutCost)
        : T.dashboard.setup.costsHintDone;
  const setupAllDone =
    Boolean(setup) && costsDone && setup!.meta && setup!.fixed && setup!.settings;

  const nf = new Intl.NumberFormat(localeOf(lang), { maximumFractionDigits: 0 });
  const money = (v: number | null) => (v == null ? "—" : `${nf.format(Math.round(v))} ${currency}`);
  const pct = (v: number | null) =>
    v == null ? "—" : `${dec((v * 100).toFixed(1))} %`;
  const mult = (v: number | null) => (v == null ? "—" : `${dec(v.toFixed(2))}×`);
  /* Delta mot föregående period, som text i KPI-undertexten. */
  const delta = (now: number, prev: number | undefined) => {
    if (prev == null || Math.abs(prev) < 0.5) return "";
    const ch = (now - prev) / Math.abs(prev);
    const arrow = ch >= 0 ? "▲" : "▼";
    return ` · ${arrow} ${Math.abs(ch * 100).toFixed(0)} % ${T.dashboard.kpi.vsPrev}`;
  };

  const ranges: [string, string][] = [
    ["today", T.dashboard.ranges.today],
    ["yesterday", T.dashboard.ranges.yesterday],
    ["7d", T.dashboard.ranges.d7],
    ["30d", T.dashboard.ranges.d30],
    ["90d", T.dashboard.ranges.d90],
  ];

  const kpis: { label: string; value: string; sub: string; tone?: "critical" | "success" }[] = [
    { label: T.dashboard.kpi.sales, value: money(t2.totalSales), sub: `${T.dashboard.kpi.shippingOfWhich(money(t2.shipping))}${delta(t2.totalSales, comparison?.totalSales)}` },
    { label: T.dashboard.kpi.orders, value: nf.format(t2.orders), sub: `${T.dashboard.kpi.avgOrder(money(t2.aov))}${delta(t2.orders, comparison?.orders)}` },
    { label: T.dashboard.kpi.fixedCosts, value: money(t2.fixedCosts), sub: T.dashboard.kpi.perDay },
    {
      label: T.dashboard.kpi.adSpend,
      value: money(t2.spend),
      sub: t2.spendComplete
        ? `${T.dashboard.kpi.cpa(money(t2.cpa))}${delta(t2.spend, comparison?.spend)}`
        : T.dashboard.kpi.missingDays(t2.missingSpendDays.length),
      tone: t2.spendComplete ? undefined : "critical",
    },
    {
      label: T.dashboard.kpi.cogs,
      value: money(t2.cogs),
      sub: t2.unitsWithoutCost ? T.dashboard.kpi.unitsNoCost(t2.unitsWithoutCost) : T.dashboard.kpi.allUnitsCovered,
      tone: t2.unitsWithoutCost ? "critical" : undefined,
    },
    { label: T.dashboard.kpi.duty, value: money(t2.tariff), sub: T.dashboard.kpi.ordersCount(nf.format(t2.orders)) },
    { label: T.dashboard.kpi.mer, value: mult(t2.mer), sub: T.dashboard.kpi.breakEven(mult(t2.breakEvenMer)) },
    {
      label: T.dashboard.kpi.netProfit,
      value: money(t2.netProfit),
      sub: t2.spendComplete
        ? `${T.dashboard.kpi.maxCpa(Math.round(targetMargin * 100), money(t2.maxCpaAtTarget))}${delta(t2.netProfit, comparison?.netProfit)}`
        : T.dashboard.kpi.profitTooHigh,
      tone: t2.spendComplete && t2.netProfit >= 0 ? "success" : "critical",
    },
  ];

  return (
    <Page
      title={T.dashboard.title}
      subtitle={`${result.from} – ${result.to}`}
      primaryAction={{
        content: T.dashboard.refresh,
        loading: revalidator.state === "loading",
        onAction: () => revalidator.revalidate(),
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <InlineStack gap="200">
              {ranges.map(([k, label]) => (
                <Badge key={k} tone={k === rangeKey ? "info" : undefined}>
                  <button
                    type="button"
                    style={{ all: "unset", cursor: "pointer" }}
                    onClick={() => setParams({ range: k })}
                  >
                    {label}
                  </button>
                </Badge>
              ))}
            </InlineStack>

            {groupSize > 1 ? (
              <Card background="bg-surface-secondary">
                <BlockStack gap="300">
                  <Checkbox
                    label={T.dashboard.combineStores(groupSize)}
                    helpText={T.dashboard.combineHelp(currency)}
                    checked={Boolean(group)}
                    onChange={(v) => {
                      const nya = new URLSearchParams(params);
                      if (v) nya.set("all", "1");
                      else nya.delete("all");
                      setParams(nya);
                    }}
                  />

                  {group ? (
                    <BlockStack gap="300">
                      <InlineGrid columns={{ xs: 2, sm: 4 }} gap="300">
                        {[
                          { key: "sales", label: T.dashboard.kpi.sales, value: money(group.totals.totalSales) },
                          { key: "orders", label: T.dashboard.kpi.orders, value: nf.format(group.totals.orders) },
                          { key: "spend", label: T.dashboard.kpi.adSpend, value: money(group.totals.spend) },
                          { key: "profit", label: T.dashboard.kpi.netProfit, value: money(group.totals.netProfit) },
                        ].map((k) => (
                          <Card key={k.key}>
                            <BlockStack gap="100">
                              <Text as="span" variant="bodySm" tone="subdued">{k.label}</Text>
                              <Text as="span" variant="headingLg"
                                tone={k.key === "profit" ? (group.totals.netProfit >= 0 ? "success" : "critical") : undefined}>
                                {k.value}
                              </Text>
                            </BlockStack>
                          </Card>
                        ))}
                      </InlineGrid>

                      <Card padding="0">
                        <DataTable
                          columnContentTypes={["text", "text", "numeric", "numeric", "numeric"]}
                          headings={[T.dashboard.thStore, T.dashboard.thCurrency, T.dashboard.thSales, T.dashboard.thAds, T.dashboard.thNetProfit]}
                          rows={group.rows.map((r) => [
                            r.shop.replace(/\.myshopify\.com$/, ""),
                            r.currency,
                            money(r.totalSales),
                            money(r.spend),
                            money(r.netProfit),
                          ])}
                          totals={["", "", money(group.totals.totalSales), money(group.totals.spend), money(group.totals.netProfit)]}
                        />
                      </Card>

                      {group.missing.length ? (
                        <Banner tone="warning" title={T.dashboard.missingStores(group.missing.length)}>
                          {group.missing.map((m) => (
                            <p key={m.shop}>
                              {m.shop.replace(/\.myshopify\.com$/, "")}: {m.reason}
                            </p>
                          ))}
                        </Banner>
                      ) : null}
                    </BlockStack>
                  ) : null}
                </BlockStack>
              </Card>
            ) : null}

            {dataAgeMin > 0 ? (
              <Text as="span" variant="bodySm" tone="subdued">
                {T.dashboard.updatedAgo(dataAgeMin, refreshing)}
              </Text>
            ) : null}

            {setup && !setup.dismissed && !setupAllDone ? (
              <SetupChecklist
                setup={setup}
                costsDone={costsDone}
                costsHint={costsHint}
                currency={currency}
                tariffPerOrder={tariffPerOrder}
                T={T}
                dec={dec}
              />
            ) : null}

            {spendError ? <Banner tone="warning">{spendError}</Banner> : null}

            {spendCurrencyMismatch ? (
              <Banner tone="critical" title={T.dashboard.fxTitle}>
                {T.dashboard.fxBody(spendCurrencyMismatch.spend, spendCurrencyMismatch.shop)}
              </Banner>
            ) : null}

            {spendConverted ? (
              <Text as="span" variant="bodySm" tone="subdued">
                {T.dashboard.convertedNote(spendConverted.from, spendConverted.to)}
              </Text>
            ) : null}

            {!t2.spendComplete ? (
              <Banner tone="critical" title={T.dashboard.spendMissingTitle}>
                {T.dashboard.spendMissingBody(t2.missingSpendDays.join(", "))}
              </Banner>
            ) : null}

            {t2.unitsWithoutCost > 0 ? (
              <Banner tone="warning" title={T.dashboard.costMissingTitle}>
                {T.dashboard.costMissingBody(t2.unitsWithoutCost)}
              </Banner>
            ) : null}

            {result.appliedCostChanges.map((c) => (
              <Banner key={c.note} tone="info">
                {c.weight >= 0.999
                  ? T.dashboard.cogsChange(c.note)
                  : T.dashboard.cogsChangeWeighted(c.note, Math.round(c.weight * 100), Math.round((1 - c.weight) * 100))}
              </Banner>
            ))}

            <InlineGrid columns={{ xs: 2, md: 4 }} gap="300">
              {kpis.map((k) => (
                <Card key={k.label}>
                  <BlockStack gap="100">
                    <Text as="span" variant="bodySm" tone="subdued">
                      {k.label}
                    </Text>
                    <Text as="p" variant="headingLg" tone={k.tone}>
                      {k.value}
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {k.sub}
                    </Text>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>

            <InlineGrid columns={{ xs: 1, md: 2 }} gap="300">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">{T.dashboard.visualTitle}</Text>
                  <Donut t={t2} money={money} T={T} lang={lang} />
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">{T.dashboard.detailTitle}</Text>
                  <BreakdownRow label={T.dashboard.revenue} value={t2.totalSales} bold money={money} dec={dec} />
                  <BreakdownRow label={T.dashboard.productCost} value={-t2.cogs} colorKey="cogs" money={money} dec={dec} ofRevenue={t2.totalSales > 0 ? t2.cogs / t2.totalSales : undefined} />
                  <BreakdownRow label={T.dashboard.kpi.duty} value={-t2.tariff} colorKey="tariff" money={money} dec={dec} ofRevenue={t2.totalSales > 0 ? t2.tariff / t2.totalSales : undefined} />
                  <BreakdownRow label={T.dashboard.txFees} value={-t2.fees} colorKey="fees" money={money} dec={dec} ofRevenue={t2.totalSales > 0 ? t2.fees / t2.totalSales : undefined} />
                  <BreakdownRow label={T.dashboard.grossProfit} value={t2.grossProfit} bold money={money} dec={dec} ofRevenue={t2.totalSales > 0 ? t2.grossProfit / t2.totalSales : undefined} />
                  <BreakdownRow label={T.dashboard.ads} value={-t2.spend} colorKey="spend" money={money} dec={dec} ofRevenue={t2.totalSales > 0 ? t2.spend / t2.totalSales : undefined} />
                  <BreakdownRow label={T.dashboard.kpi.fixedCosts} value={-t2.fixedCosts} colorKey="fixed" money={money} dec={dec} ofRevenue={t2.totalSales > 0 ? t2.fixedCosts / t2.totalSales : undefined} />
                  <BreakdownRow label={T.dashboard.kpi.netProfit} value={t2.netProfit} bold colorKey="profit" money={money} dec={dec} ofRevenue={t2.totalSales > 0 ? t2.netProfit / t2.totalSales : undefined} />
                </BlockStack>
              </Card>
            </InlineGrid>

            {result.sales.length > 1 ? (
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">{T.dashboard.profitPerDay}</Text>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {T.dashboard.profitPerDayNote}
                  </Text>
                  <ProfitBars result={result} money={money} T={T} />
                </BlockStack>
              </Card>
            ) : null}
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            <DataTable
              columnContentTypes={["text", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric"]}
              headings={[
                T.dashboard.thProduct,
                T.dashboard.thUnits,
                T.dashboard.thNet,
                T.dashboard.thCogs,
                T.dashboard.thCm,
                T.dashboard.thMargin,
                T.dashboard.thMultiple,
              ]}
              rows={result.products.map((p) => [
                p.variantTitle ? `${p.title} · ${p.variantTitle}` : p.title,
                nf.format(p.units),
                money(p.netSales),
                p.cogs == null ? T.dashboard.missing : money(p.cogs) + (p.blend ? " ✦" : ""),
                p.contribution == null ? "—" : money(p.contribution),
                p.margin == null ? "—" : pct(p.margin),
                p.multiple == null ? "—" : mult(p.multiple),
              ])}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
