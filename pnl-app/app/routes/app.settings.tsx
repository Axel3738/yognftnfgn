/**
 * Butiksinställningar: tull per order, kortavgift, målmarginal och Meta-koppling.
 * Defaults är Bäverbutikens: $2,90 tull och 2,9 % kortavgift.
 */

import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Banner, BlockStack, Button, Card, Layout, Page, Text, TextField } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const s = await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    create: { shop: session.shop },
    update: {},
  });
  return json({
    tariffPerOrder: Number(s.tariffPerOrder),
    feeRate: Number(s.feeRate),
    targetMargin: Number(s.targetMargin),
    metaAdAccountId: s.metaAdAccountId ?? "",
    hasMetaToken: Boolean(s.metaAccessToken),
    currency: s.currency,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const f = await request.formData();
  const dec = (k: string) => parseFloat(String(f.get(k) ?? "").replace(",", "."));
  const token = String(f.get("metaAccessToken") ?? "");

  await prisma.shopSettings.update({
    where: { shop: session.shop },
    data: {
      tariffPerOrder: dec("tariffPerOrder"),
      feeRate: dec("feeRate") / 100,
      targetMargin: dec("targetMargin") / 100,
      metaAdAccountId: String(f.get("metaAdAccountId") ?? "") || null,
      // Tomt fält = behåll befintlig token, radera den inte av misstag.
      ...(token ? { metaAccessToken: token } : {}),
    },
  });
  // Cachad spend bygger på det gamla kontot — släng den så inget blandas ihop.
  await prisma.dailySpend.deleteMany({ where: { shop: session.shop } });
  return json({ ok: true });
}

export default function Settings() {
  const d = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [v, setV] = useState({
    tariffPerOrder: String(d.tariffPerOrder),
    feeRate: String((d.feeRate * 100).toFixed(2)),
    targetMargin: String(Math.round(d.targetMargin * 100)),
    metaAdAccountId: d.metaAdAccountId,
    metaAccessToken: "",
  });
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));

  return (
    <Page title="Inställningar">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">Kostnader per order</Text>
              <TextField
                label={`Tull per order (${d.currency})`}
                value={v.tariffPerOrder}
                onChange={set("tariffPerOrder")}
                autoComplete="off"
                helpText="Tas ut en gång per order, inte per styck. Det är därför bundles har bättre marginal."
              />
              <TextField
                label="Transaktionsavgift (%)"
                value={v.feeRate}
                onChange={set("feeRate")}
                autoComplete="off"
                helpText="Andel av totalt ordervärde. Shopify Payments ligger typiskt kring 2,9 %."
              />
              <TextField
                label="Målmarginal (%)"
                value={v.targetMargin}
                onChange={set("targetMargin")}
                autoComplete="off"
                helpText="Max-CPA på panelen räknas mot den här marginalen."
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">Meta</Text>
              <TextField
                label="Annonskonto-ID"
                value={v.metaAdAccountId}
                onChange={set("metaAdAccountId")}
                autoComplete="off"
                helpText="Siffrorna, med eller utan act_-prefix."
              />
              <TextField
                label="Access token"
                type="password"
                value={v.metaAccessToken}
                onChange={set("metaAccessToken")}
                autoComplete="off"
                helpText={
                  d.hasMetaToken
                    ? "En token är sparad. Lämna tomt för att behålla den."
                    : "Long-lived token från developers.facebook.com. Utan den visas ingen annonskostnad."
                }
              />
              <Banner tone="info">
                Utan Meta-koppling visas försäljning och COGS som vanligt, men täckningsbidraget
                flaggas som ofullständigt istället för att räknas som om annonskostnaden vore noll.
              </Banner>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Button
            variant="primary"
            loading={fetcher.state !== "idle"}
            onClick={() => fetcher.submit(v, { method: "POST" })}
          >
            Spara
          </Button>
          {fetcher.data?.ok ? <Banner tone="success">Sparat.</Banner> : null}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
