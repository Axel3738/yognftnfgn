/**
 * Panelen. Läser allt server-side i loadern så att första renderingen redan har
 * siffrorna — ingen spinner, inget "hämtar" som i artifact-versionen.
 */

import { Suspense, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { defer, json } from "@remix-run/node";
import { Await, Link, useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Banner,
  Button,
  Card,
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
import { applyCurrentCosts, fetchOrderData, fetchShopInfo, fetchVariantCosts } from "../lib/shopify-data.server";
import { getSpend } from "../lib/meta.server";

const RANGES: Record<string, string> = {
  today: "Idag",
  yesterday: "Igår",
  "7d": "7 dagar",
  "30d": "30 dagar",
  "90d": "90 dagar",
};

/**
 * Det tunga jobbet bor i ett promise som INTE awaitas i loadern: skalet
 * renderas direkt och datan strömmas in när den är klar. 30 dagar = ~750
 * ordrar i sekventiella API-anrop, 10–30 sekunder — utan defer är iframen
 * spikvit hela den tiden och ser trasig ut.
 */
async function loadPage(admin: any, shop: string, rangeKey: string, url: URL) {
  try {

  const shopInfo = await fetchShopInfo(admin);
  const today = shopInfo.today;
  const [from, to] = rangeWindow(rangeKey, today, {
    from: url.searchParams.get("from") ?? today,
    to: url.searchParams.get("to") ?? today,
  });

  let settings = await prisma.shopSettings.upsert({
    where: { shop },
    create: { shop, currency: shopInfo.currency },
    update: {},
  });

  /* Butiken kan byta valuta, och installationer gjorda innan valutan lästes in
     ligger kvar på default. Skriv bara när den faktiskt skiljer sig — annars
     blir det en databasskrivning per sidladdning i onödan. */
  if (shopInfo.currency && settings.currency !== shopInfo.currency) {
    settings = await prisma.shopSettings.update({
      where: { shop },
      data: { currency: shopInfo.currency },
    });
  }

  /* Stale-while-revalidate: finns det EN sparad version serveras den direkt
     (<2 s), och en färsk export körs i bakgrunden till nästa besök. Att vänta
     30–60 s på exporten vid varje inträde gjorde appen oanvändbar — hellre
     minuter gamla siffror nu och färska strax, än färska siffror om en minut. */
  const cacheKey = `${from}:${to}`;
  const cached = await prisma.pnlCache.findUnique({
    where: { shop_key: { shop, key: cacheKey } },
  });
  const refreshCache = async (f: string, t: string, key: string) => {
    try {
      const freshData = await fetchOrderData(admin, f, t, shopInfo.timezone, shop);
      await prisma.pnlCache.upsert({
        where: { shop_key: { shop, key } },
        create: { shop, key, payload: freshData as any },
        update: { payload: freshData as any, fetchedAt: new Date() },
      });
    } catch (e) {
      console.error("Bakgrundsuppdatering misslyckades:", e);
    }
  };
  let orderData: Awaited<ReturnType<typeof fetchOrderData>>;
  let dataAgeMin = 0;
  let refreshing = false;
  if (cached) {
    orderData = cached.payload as unknown as Awaited<ReturnType<typeof fetchOrderData>>;
    dataAgeMin = Math.round((Date.now() - cached.fetchedAt.getTime()) / 60000);
    if (Date.now() - cached.fetchedAt.getTime() > 3 * 60 * 1000) {
      refreshing = true;
      void refreshCache(from, to, cacheKey); // medvetet inget await
    }
  } else {
    orderData = await fetchOrderData(admin, from, to, shopInfo.timezone, shop);
    await prisma.pnlCache.upsert({
      where: { shop_key: { shop, key: cacheKey } },
      create: { shop, key: cacheKey, payload: orderData as any },
      update: { payload: orderData as any, fetchedAt: new Date() },
    });
  }
  const [costChanges, fixedRows] = await Promise.all([
    prisma.costChange.findMany({ where: { shop } }),
    prisma.fixedCost.findMany({ where: { shop } }),
  ]);
  const fixedMonthlyTotal = fixedRows.reduce((a, r) => a + Number(r.monthlyAmount), 0);

  /* Kostnaden läses om ur katalogen (5 min minnescache) istället för att tas
     ur det cachade aggregatet — annars syns ett nyss inskrivet inköpspris
     först när hela orderexporten körts om, och importen ser trasig ut. */
  const catalog = await fetchVariantCosts(admin, shop);
  const sales = orderData.sales;
  const products = applyCurrentCosts(orderData.products, catalog);
  /* Sessioner/CVR finns inte i det publika Admin-API:t — analytics-ytan är
     intern hos Shopify. Tom serie => "—" i panelen. */
  const sessions: never[] = [];

  const spend = await getSpend(
    shop,
    settings.metaAdAccountId && settings.metaAccessToken
      ? { adAccountId: settings.metaAdAccountId, accessToken: settings.metaAccessToken }
      : null,
    from,
    to,
    today,
    shopInfo.currency,
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
    const shift = (iso: string, days: number) => {
      const dd = new Date(iso + "T12:00:00Z");
      dd.setUTCDate(dd.getUTCDate() + days);
      return dd.toISOString().slice(0, 10);
    };
    const dayCount = result.days.length;
    const prevTo = shift(from, -1);
    const prevFrom = shift(prevTo, -(dayCount - 1));
    const prevKey = `${prevFrom}:${prevTo}`;
    const prevCached = await prisma.pnlCache.findUnique({
      where: { shop_key: { shop, key: prevKey } },
    });
    /* Bara cache — saknas jämförelsedatan fylls den i bakgrunden och syns
       vid nästa besök. Den får aldrig kosta en synlig sekund. */
    if (!prevCached) {
      void refreshCache(prevFrom, prevTo, prevKey);
      throw new Error("jämförelsen fylls i bakgrunden");
    }
    const prevData = prevCached.payload as unknown as Awaited<ReturnType<typeof fetchOrderData>>;
    if (Date.now() - prevCached.fetchedAt.getTime() > 60 * 60 * 1000) {
      void refreshCache(prevFrom, prevTo, prevKey);
    }
    const prevSpend = await getSpend(
      shop,
      metaConfigured
        ? { adAccountId: settings.metaAdAccountId!, accessToken: settings.metaAccessToken! }
        : null,
      prevFrom, prevTo, today, shopInfo.currency,
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

  return {
    fatal: null as string | null,
    comparison,
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
    targetMargin: Number(settings.targetMargin),
    tariffPerOrder: Number(settings.tariffPerOrder),
  };
  } catch (e) {
    /* Remix maskerar kastade fel i produktion till "Application Error" utan
       detaljer. Här fångas de och visas i klartext — utan feltexten på skärmen
       blir varje felsökningsrunda en gissningslek. */
    console.error("Loader-fel /app:", e);
    return {
      fatal: e instanceof Error ? `${e.message}` : String(e),
      comparison: null as { totalSales: number; orders: number; spend: number; netProfit: number } | null,
      setup: null as { dismissed: boolean; meta: boolean; fixed: boolean; settings: boolean } | null,
      fixedCount: 0,
      dataAgeMin: 0,
      refreshing: false,
      result: null as ReturnType<typeof compute> | null,
      rangeKey,
      currency: "SEK",
      spendError: null as string | null,
      spendCurrencyMismatch: null as { spend: string; shop: string } | null,
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
  // Medvetet inget await — promiset strömmas till klienten via defer.
  return defer({ page: loadPage(admin, session.shop, rangeKey, url) });
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
  const { page } = useLoaderData<typeof loader>();
  return (
    <Suspense
      fallback={
        <Page title="Vinst">
          <Card>
            <BlockStack gap="300" inlineAlign="center">
              <Spinner accessibilityLabel="Hämtar ordrar" size="large" />
              <Text as="p" tone="subdued">
                Hämtar ordrar från Shopify — 30-dagarsvyn läser hela orderhistoriken och kan ta
                upp till en halv minut.
              </Text>
            </BlockStack>
          </Card>
        </Page>
      }
    >
      <Await resolve={page}>{(d) => <DashboardView d={d as PageData} />}</Await>
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
  t,
  money,
}: {
  t: NonNullable<PageData["result"]>["totals"];
  money: (v: number | null) => string;
}) {
  const [tip, setTip] = useState<{ x: number; y: number; key: string } | null>(null);

  const parts = [
    { key: "cogs", label: "Produktkostnad", value: t.cogs },
    { key: "spend", label: "Annonser", value: t.spend },
    { key: "fees", label: "Transaktionsavgifter", value: t.fees },
    { key: "tariff", label: "Tull", value: t.tariff },
    { key: "fixed", label: "Fasta kostnader", value: t.fixedCosts },
    { key: "profit", label: "Nettovinst", value: Math.max(t.netProfit, 0) },
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
      ofRevenue: t.totalSales > 0 ? p.value / t.totalSales : 0,
      d: `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${r} ${r} 0 ${large} 0 ${xi0} ${yi0} Z`,
    };
  });

  const hovered = tip ? arcs.find((a) => a.key === tip.key) ?? null : null;
  const pctStr = (v: number) => `${(v * 100).toFixed(1).replace(".", ",")} %`;

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
        <svg viewBox="0 0 200 200" style={{ width: 230, maxWidth: "100%" }} role="img" aria-label="Fördelning av omsättningen">
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
              <text x="100" y="122" textAnchor="middle" fontSize="10" fill="#6d7175">av omsättningen</text>
            </>
          ) : (
            <>
              <text x="100" y="94" textAnchor="middle" fontSize="11" fill="#6d7175">Omsättning</text>
              <text x="100" y="112" textAnchor="middle" fontSize="14" fontWeight="700" fill="#202223">{money(t.totalSales)}</text>
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
          {money(hovered.value)} · {pctStr(hovered.ofRevenue)} av omsättningen
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
}: {
  result: NonNullable<PageData["result"]>;
  money: (v: number | null) => string;
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
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }} role="img" aria-label="Vinst per dag">
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
          Försäljning: {money(rows[tip.i].revenue)}
          <br />
          Annonser: {money(rows[tip.i].spend)}
          <br />
          Vinst: {money(rows[tip.i].profit)}
        </div>
      ) : null}
    </div>
  );
}

function BreakdownRow({ label, value, bold, colorKey, money, ofRevenue }: {
  label: string; value: number; bold?: boolean;
  colorKey?: keyof typeof SLICE_COLORS;
  money: (v: number | null) => string;
  /** Andel av omsättningen — visas dämpat efter beloppet. */
  ofRevenue?: number;
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
            {`${(Math.abs(ofRevenue) * 100).toFixed(1).replace(".", ",")} %`}
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
function FixedCostQuickAdd() {
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
        <TextField label="Namn" labelHidden placeholder="t.ex. Shopify-abonnemang"
          value={name} onChange={setName} autoComplete="off" />
      </div>
      <div style={{ minWidth: 130 }}>
        <TextField label="Kr/månad" labelHidden placeholder="kr/månad" suffix="kr/mån"
          value={amount} onChange={setAmount} autoComplete="off" />
      </div>
      <Button variant="primary" onClick={add} loading={busy}>Lägg till</Button>
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
}: {
  setup: NonNullable<PageData["setup"]>;
  costsDone: boolean;
  costsHint: string;
  currency: string;
  tariffPerOrder: number;
}) {
  const dismisser = useFetcher();
  const steps = [
    {
      key: "costs",
      done: costsDone,
      title: "Lägg in inköpspriser",
      hint: costsHint,
      to: "/app/costs",
      cta: "Till Kostnader",
    },
    {
      key: "meta",
      done: setup.meta,
      title: "Koppla annonskontot",
      hint: setup.meta
        ? "Annonskostnaden hämtas automatiskt varje dag."
        : "Utan koppling räknas annonskostnaden som noll och vinsten blir för hög.",
      to: "/app/settings",
      cta: "Till Inställningar",
    },
    {
      key: "fixed",
      done: setup.fixed,
      title: "Fyll i fasta månadskostnader",
      hint: setup.fixed
        ? "Dras från nettovinsten, utslagna per dag."
        : "Abonnemang, appar, anställda — allt som kostar oavsett försäljning.",
      to: "/app/fixed",
      cta: "Visa alla",
    },
    {
      key: "settings",
      done: setup.settings,
      title: "Granska tull och transaktionsavgift",
      hint: setup.settings
        ? "Sparat för den här butiken."
        : `Kör fortfarande på standardvärdena (${tariffPerOrder
            .toFixed(2)
            .replace(".", ",")} ${currency} per order, 2,9 %). Stämmer de för den här butiken?`,
      to: "/app/settings",
      cta: "Till Inställningar",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <Card background="bg-surface-secondary">
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center" wrap={false}>
          <Text as="h2" variant="headingMd">Kom igång 🚀</Text>
          <Badge tone={doneCount === steps.length ? "success" : "attention"}>
            {`${doneCount} av ${steps.length} klart`}
          </Badge>
        </InlineStack>
        <Text as="p" tone="subdued">
          Panelen räknar redan — men den blir sann först när de här fyra är ifyllda.
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
                  <FixedCostQuickAdd />
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
            Dölj checklistan
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

function DashboardView({ d }: { d: PageData }) {
  const { fatal, result, rangeKey, currency, spendError, spendCurrencyMismatch, targetMargin, tariffPerOrder, comparison, setup, dataAgeMin, refreshing } = d;
  const [, setParams] = useSearchParams();
  if (fatal || !result) {
    return (
      <Page title="Vinst">
        <Banner tone="critical" title="Panelen kunde inte hämta data">
          <p style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{fatal ?? "okänt fel"}</p>
          <p>Skicka en skärmbild av det här meddelandet — det pekar ut exakt var det stannar.</p>
        </Banner>
      </Page>
    );
  }
  const t = result.totals;

  /* Kostnadssteget kan bara bedömas mot faktiskt sålda enheter — en butik utan
     ordrar i perioden har inget att stämma av mot, och kvitteras inte. */
  const costsDone = t.orders > 0 && t.unitsWithoutCost === 0;
  const costsHint =
    t.orders === 0
      ? "Inga ordrar i perioden än. Steget kvitteras när sålda produkter har inköpspris."
      : t.unitsWithoutCost > 0
        ? `${t.unitsWithoutCost} sålda enheter saknar inköpspris och räknas som gratis.`
        : "Alla sålda enheter har inköpspris.";
  const setupAllDone =
    Boolean(setup) && costsDone && setup!.meta && setup!.fixed && setup!.settings;

  const nf = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });
  const money = (v: number | null) => (v == null ? "—" : `${nf.format(Math.round(v))} ${currency}`);
  const pct = (v: number | null) =>
    v == null ? "—" : `${(v * 100).toFixed(1).replace(".", ",")} %`;
  const mult = (v: number | null) => (v == null ? "—" : `${v.toFixed(2).replace(".", ",")}×`);
  /* Delta mot föregående period, som text i KPI-undertexten. */
  const delta = (now: number, prev: number | undefined) => {
    if (prev == null || Math.abs(prev) < 0.5) return "";
    const ch = (now - prev) / Math.abs(prev);
    const arrow = ch >= 0 ? "▲" : "▼";
    return ` · ${arrow} ${Math.abs(ch * 100).toFixed(0)} % vs förra`;
  };

  const kpis: { label: string; value: string; sub: string; tone?: "critical" | "success" }[] = [
    { label: "Försäljning", value: money(t.totalSales), sub: `varav frakt ${money(t.shipping)}${delta(t.totalSales, comparison?.totalSales)}` },
    { label: "Ordrar", value: nf.format(t.orders), sub: `snittorder ${money(t.aov)}${delta(t.orders, comparison?.orders)}` },
    { label: "Fasta kostnader", value: money(t.fixedCosts), sub: "utslagna per dag" },
    {
      label: "Annonskostnad",
      value: money(t.spend),
      sub: t.spendComplete ? `CPA ${money(t.cpa)}${delta(t.spend, comparison?.spend)}` : `⚠ saknas ${t.missingSpendDays.length} dagar`,
      tone: t.spendComplete ? undefined : "critical",
    },
    {
      label: "COGS",
      value: money(t.cogs),
      sub: t.unitsWithoutCost ? `${t.unitsWithoutCost} enheter utan kostnad` : "alla enheter täckta",
      tone: t.unitsWithoutCost ? "critical" : undefined,
    },
    { label: "Tull", value: money(t.tariff), sub: `${nf.format(t.orders)} ordrar` },
    { label: "MER", value: mult(t.mer), sub: `break-even ${mult(t.breakEvenMer)}` },
    {
      label: "Nettovinst",
      value: money(t.netProfit),
      sub: t.spendComplete
        ? `max CPA @ ${Math.round(targetMargin * 100)} %: ${money(t.maxCpaAtTarget)}${delta(t.netProfit, comparison?.netProfit)}`
        : "för hög — annonsdata saknas",
      tone: t.spendComplete && t.netProfit >= 0 ? "success" : "critical",
    },
  ];

  return (
    <Page
      title="Vinst"
      subtitle={`${result.from} – ${result.to}`}
      primaryAction={{ content: "Uppdatera", onAction: () => setParams((p) => p) }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <InlineStack gap="200">
              {Object.entries(RANGES).map(([k, label]) => (
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

            {dataAgeMin > 0 ? (
              <Text as="span" variant="bodySm" tone="subdued">
                {`Siffrorna uppdaterades för ${dataAgeMin} min sedan${refreshing ? " — ny hämtning pågår i bakgrunden, ladda om strax" : ""}.`}
              </Text>
            ) : null}

            {setup && !setup.dismissed && !setupAllDone ? (
              <SetupChecklist
                setup={setup}
                costsDone={costsDone}
                costsHint={costsHint}
                currency={currency}
                tariffPerOrder={tariffPerOrder}
              />
            ) : null}

            {spendError ? <Banner tone="warning">{spendError}</Banner> : null}

            {spendCurrencyMismatch ? (
              <Banner tone="critical" title="Annonskontot har en annan valuta än butiken">
                Annonskostnaden redovisas i {spendCurrencyMismatch.spend}, försäljningen i{" "}
                {spendCurrencyMismatch.shop}. Beloppen räknas ihop som om de vore samma valuta, så
                nettovinst, MER och CPA stämmer inte. Använd ett annonskonto i{" "}
                {spendCurrencyMismatch.shop} för den här butiken.
              </Banner>
            ) : null}

            {!t.spendComplete ? (
              <Banner tone="critical" title="Täckningsbidraget är för högt">
                Annonskostnad saknas för {t.missingSpendDays.join(", ")}. De dagarna räknas som noll
                i annonskostnad, vilket gör vinsten missvisande.
              </Banner>
            ) : null}

            {t.unitsWithoutCost > 0 ? (
              <Banner tone="warning" title="Kostnad saknas">
                {t.unitsWithoutCost} sålda enheter har ingen inköpskostnad i Shopify. De räknas som
                gratis, så COGS är för låg och vinsten för hög. Fyll i under Kostnader.
              </Banner>
            ) : null}

            {result.appliedCostChanges.map((c) => (
              <Banner key={c.note} tone="info">
                {c.weight >= 0.999
                  ? `COGS: ${c.note}.`
                  : `COGS: ${c.note} — perioden spänner över brytdatumet, kostnaden är vägd ` +
                    `${Math.round(c.weight * 100)} % ny / ${Math.round((1 - c.weight) * 100)} % gammal ` +
                    `efter omsättning per dag.`}
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
                  <Text as="h2" variant="headingMd">Visuell uppdelning</Text>
                  <Donut t={t} money={money} />
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">Detaljerad uppdelning</Text>
                  <BreakdownRow label="Omsättning" value={t.totalSales} bold money={money} />
                  <BreakdownRow label="Produktkostnad" value={-t.cogs} colorKey="cogs" money={money} ofRevenue={t.totalSales > 0 ? t.cogs / t.totalSales : undefined} />
                  <BreakdownRow label="Tull" value={-t.tariff} colorKey="tariff" money={money} ofRevenue={t.totalSales > 0 ? t.tariff / t.totalSales : undefined} />
                  <BreakdownRow label="Transaktionsavgifter" value={-t.fees} colorKey="fees" money={money} ofRevenue={t.totalSales > 0 ? t.fees / t.totalSales : undefined} />
                  <BreakdownRow label="Bruttovinst" value={t.grossProfit} bold money={money} ofRevenue={t.totalSales > 0 ? t.grossProfit / t.totalSales : undefined} />
                  <BreakdownRow label="Annonser" value={-t.spend} colorKey="spend" money={money} ofRevenue={t.totalSales > 0 ? t.spend / t.totalSales : undefined} />
                  <BreakdownRow label="Fasta kostnader" value={-t.fixedCosts} colorKey="fixed" money={money} ofRevenue={t.totalSales > 0 ? t.fixedCosts / t.totalSales : undefined} />
                  <BreakdownRow label="Nettovinst" value={t.netProfit} bold colorKey="profit" money={money} ofRevenue={t.totalSales > 0 ? t.netProfit / t.totalSales : undefined} />
                </BlockStack>
              </Card>
            </InlineGrid>

            {result.sales.length > 1 ? (
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">Vinst per dag</Text>
                  <Text as="span" variant="bodySm" tone="subdued">
                    COGS, avgifter och tull fördelade per dags omsättning — uppskattning, inte bokföring.
                  </Text>
                  <ProfitBars result={result} money={money} />
                </BlockStack>
              </Card>
            ) : null}
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            <DataTable
              columnContentTypes={["text", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric"]}
              headings={["Produkt", "Enheter", "Netto", "COGS", "TB", "Marginal", "Multipel"]}
              rows={result.products.map((p) => [
                p.variantTitle ? `${p.title} · ${p.variantTitle}` : p.title,
                nf.format(p.units),
                money(p.netSales),
                p.cogs == null ? "saknas" : money(p.cogs) + (p.blend ? " ✦" : ""),
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
