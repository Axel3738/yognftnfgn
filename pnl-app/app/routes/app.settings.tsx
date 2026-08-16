/**
 * Butiksinställningar: språk, tull per order, kortavgift, målmarginal och
 * Meta-koppling. Defaults är Bäverbutikens: $2,90 tull och 2,9 % kortavgift.
 *
 * Språkväljaren ligger överst med flit — den ska vara det första man hittar.
 */

import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Banner, BlockStack, Button, Card, Layout, Page, Select, Text, TextField } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { encrypt, encryptionAvailable } from "../lib/crypto.server";
import { asLang, t } from "../lib/texts";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const s = await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    create: { shop: session.shop },
    update: {},
  });
  return json({
    lang: asLang(s.language),
    tariffPerOrder: Number(s.tariffPerOrder),
    feeRate: Number(s.feeRate),
    targetMargin: Number(s.targetMargin),
    metaAdAccountId: s.metaAdAccountId ?? "",
    hasMetaToken: Boolean(s.metaAccessToken),
    krypteringPa: encryptionAvailable(),
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
      language: asLang(String(f.get("language") ?? "")),
      tariffPerOrder: dec("tariffPerOrder"),
      feeRate: dec("feeRate") / 100,
      targetMargin: dec("targetMargin") / 100,
      metaAdAccountId: String(f.get("metaAdAccountId") ?? "") || null,
      // Tomt fält = behåll befintlig token, radera den inte av misstag.
      ...(token ? { metaAccessToken: encrypt(token) } : {}),
      // Kvitterar kom igång-checklistans steg om tull och avgifter.
      settingsSavedAt: new Date(),
      // Nytt konto kan ha annan valuta — läs om den istället för att lita på
      // den gamla, annars jämförs butiken mot fel valuta.
      spendCurrency: null,
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
    language: d.lang as string,
    tariffPerOrder: String(d.tariffPerOrder),
    feeRate: String((d.feeRate * 100).toFixed(2)),
    targetMargin: String(Math.round(d.targetMargin * 100)),
    metaAdAccountId: d.metaAdAccountId,
    metaAccessToken: "",
  });
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  const T = t(d.lang);

  return (
    <Page title={T.settings.title}>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Select
                label={T.settings.languageLabel}
                options={[
                  { label: "English", value: "en" },
                  { label: "Svenska", value: "sv" },
                ]}
                value={v.language}
                onChange={set("language")}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">{T.settings.costsPerOrder}</Text>
              <TextField
                label={T.settings.tariffLabel(d.currency)}
                value={v.tariffPerOrder}
                onChange={set("tariffPerOrder")}
                autoComplete="off"
                helpText={T.settings.tariffHelp}
              />
              <TextField
                label={T.settings.feeLabel}
                value={v.feeRate}
                onChange={set("feeRate")}
                autoComplete="off"
                helpText={T.settings.feeHelp}
              />
              <TextField
                label={T.settings.marginLabel}
                value={v.targetMargin}
                onChange={set("targetMargin")}
                autoComplete="off"
                helpText={T.settings.marginHelp}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">{T.settings.metaTitle}</Text>
              <TextField
                label={T.settings.adAccountLabel}
                value={v.metaAdAccountId}
                onChange={set("metaAdAccountId")}
                autoComplete="off"
                helpText={T.settings.adAccountHelp}
              />
              <TextField
                label={T.settings.tokenLabel}
                type="password"
                value={v.metaAccessToken}
                onChange={set("metaAccessToken")}
                autoComplete="off"
                helpText={d.hasMetaToken ? T.settings.tokenHelpSaved : T.settings.tokenHelpEmpty}
              />
              <Banner tone="info">{T.settings.metaBanner}</Banner>
              {d.krypteringPa ? (
                <Text as="p" variant="bodySm" tone="subdued">
                  {T.settings.encryptedNote}
                </Text>
              ) : (
                <Banner tone="warning" title={T.settings.unencryptedTitle}>
                  {T.settings.unencryptedBody}
                </Banner>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Button
            variant="primary"
            loading={fetcher.state !== "idle"}
            onClick={() => fetcher.submit(v, { method: "POST" })}
          >
            {T.settings.save}
          </Button>
          {fetcher.data?.ok ? <Banner tone="success">{T.settings.saved}</Banner> : null}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
