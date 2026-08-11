/**
 * Panelen. Läser allt server-side i loadern så att första renderingen redan har
 * siffrorna — ingen spinner, inget "hämtar" som i artifact-versionen.
 */

import { Suspense } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Banner,
  Card,
  DataTable,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Spinner,
  Text,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { compute, rangeWindow } from "../lib/pnl.server";
import { fetchOrderData, fetchShopInfo } from "../lib/shopify-data.server";
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

  const settings = await prisma.shopSettings.upsert({
    where: { shop },
    create: { shop },
    update: {},
  });

  /* Bulk-exporten tar 20–60 s — cachea färdiga aggregat per intervall så att
     bara första laddningen betalar det priset. 10 min TTL. */
  const cacheKey = `${from}:${to}`;
  const cached = await prisma.pnlCache.findUnique({
    where: { shop_key: { shop, key: cacheKey } },
  });
  let orderData: Awaited<ReturnType<typeof fetchOrderData>>;
  if (cached && Date.now() - cached.fetchedAt.getTime() < 10 * 60 * 1000) {
    orderData = cached.payload as unknown as Awaited<ReturnType<typeof fetchOrderData>>;
  } else {
    orderData = await fetchOrderData(admin, from, to, shopInfo.timezone, shop);
    await prisma.pnlCache.upsert({
      where: { shop_key: { shop, key: cacheKey } },
      create: { shop, key: cacheKey, payload: orderData as any },
      update: { payload: orderData as any, fetchedAt: new Date() },
    });
  }
  const costChanges = await prisma.costChange.findMany({ where: { shop } });
  const { sales, products } = orderData;
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
  );

  const result = compute({
    from,
    to,
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

  return {
    fatal: null as string | null,
    result,
    rangeKey,
    currency: settings.currency,
    spendError: spend.error ?? null,
    targetMargin: Number(settings.targetMargin),
  };
  } catch (e) {
    /* Remix maskerar kastade fel i produktion till "Application Error" utan
       detaljer. Här fångas de och visas i klartext — utan feltexten på skärmen
       blir varje felsökningsrunda en gissningslek. */
    console.error("Loader-fel /app:", e);
    return {
      fatal: e instanceof Error ? `${e.message}` : String(e),
      result: null as ReturnType<typeof compute> | null,
      rangeKey,
      currency: "SEK",
      spendError: null as string | null,
      targetMargin: 0.25,
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

function DashboardView({ d }: { d: PageData }) {
  const { fatal, result, rangeKey, currency, spendError, targetMargin } = d;
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

  const nf = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });
  const money = (v: number | null) => (v == null ? "—" : `${nf.format(Math.round(v))} ${currency}`);
  const pct = (v: number | null) =>
    v == null ? "—" : `${(v * 100).toFixed(1).replace(".", ",")} %`;
  const mult = (v: number | null) => (v == null ? "—" : `${v.toFixed(2).replace(".", ",")}×`);

  const kpis: { label: string; value: string; sub: string; tone?: "critical" | "success" }[] = [
    { label: "Försäljning", value: money(t.totalSales), sub: `varav frakt ${money(t.shipping)}` },
    { label: "Ordrar", value: nf.format(t.orders), sub: `snittorder ${money(t.aov)}` },
    { label: "Sessioner", value: t.sessions ? nf.format(t.sessions) : "—", sub: "kräver Shopify-analytics" },
    {
      label: "Annonskostnad",
      value: money(t.spend),
      sub: t.spendComplete ? `CPA ${money(t.cpa)}` : `⚠ saknas ${t.missingSpendDays.length} dagar`,
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
      label: "Täckningsbidrag",
      value: money(t.netContribution),
      sub: t.spendComplete
        ? `max CPA @ ${Math.round(targetMargin * 100)} %: ${money(t.maxCpaAtTarget)}`
        : "för högt — annonsdata saknas",
      tone: t.spendComplete && t.netContribution >= 0 ? "success" : "critical",
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

            {spendError ? <Banner tone="warning">{spendError}</Banner> : null}

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
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            <DataTable
              columnContentTypes={["text", "numeric", "numeric", "numeric", "numeric", "numeric"]}
              headings={["Produkt", "Enheter", "Netto", "COGS", "TB", "Multipel"]}
              rows={result.products.map((p) => [
                p.variantTitle ? `${p.title} · ${p.variantTitle}` : p.title,
                nf.format(p.units),
                money(p.netSales),
                p.cogs == null ? "saknas" : money(p.cogs) + (p.blend ? " ✦" : ""),
                p.contribution == null ? "—" : money(p.contribution),
                p.multiple == null ? "—" : mult(p.multiple),
              ])}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
