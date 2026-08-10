/**
 * Panelen. Läser allt server-side i loadern så att första renderingen redan har
 * siffrorna — ingen spinner, inget "hämtar" som i artifact-versionen.
 */

import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
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

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const rangeKey = url.searchParams.get("range") ?? "30d";

  const shopInfo = await fetchShopInfo(admin);
  const today = shopInfo.today;
  const [from, to] = rangeWindow(rangeKey, today, {
    from: url.searchParams.get("from") ?? today,
    to: url.searchParams.get("to") ?? today,
  });

  const settings = await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    create: { shop: session.shop },
    update: {},
  });

  const [orderData, costChanges] = await Promise.all([
    fetchOrderData(admin, from, to, shopInfo.timezone),
    prisma.costChange.findMany({ where: { shop: session.shop } }),
  ]);
  const { sales, products } = orderData;
  /* Sessioner/CVR finns inte i det publika Admin-API:t — analytics-ytan är
     intern hos Shopify. Tom serie => "—" i panelen. */
  const sessions: never[] = [];

  const spend = await getSpend(
    session.shop,
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

  return json({
    result,
    rangeKey,
    currency: settings.currency,
    spendError: spend.error ?? null,
    targetMargin: Number(settings.targetMargin),
  });
}

export default function Dashboard() {
  const { result, rangeKey, currency, spendError, targetMargin } = useLoaderData<typeof loader>();
  const [, setParams] = useSearchParams();
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
