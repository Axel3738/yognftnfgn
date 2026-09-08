/**
 * Butiksinställningar: tull per order, kortavgift, målmarginal och Meta-koppling.
 * Defaults är Bäverbutikens: 27,50 kr tull och 2,9 % kortavgift.
 *
 * Meta kopplas helst med knappen (OAuth) — då väljer handlaren annonskonto ur
 * en lista och valutan följer med. Token-fältet finns kvar för den som hellre
 * klistrar in, och för deployments utan Meta-app.
 */

import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  Collapsible,
  InlineStack,
  Layout,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { fetchAdAccountInfo, metaOAuthEnabled, type MetaAdAccount } from "../lib/meta.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const s = await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    create: { shop: session.shop },
    update: {},
  });
  const accounts = (Array.isArray(s.metaAdAccounts) ? s.metaAdAccounts : []) as unknown as MetaAdAccount[];
  const daysLeft = s.metaTokenExpiresAt
    ? Math.floor((s.metaTokenExpiresAt.getTime() - Date.now()) / 86_400_000)
    : null;
  return json({
    tariffPerOrder: Number(s.tariffPerOrder),
    feeRate: Number(s.feeRate),
    targetMargin: Number(s.targetMargin),
    metaAdAccountId: s.metaAdAccountId ?? "",
    metaAdAccountCurrency: s.metaAdAccountCurrency ?? null,
    hasMetaToken: Boolean(s.metaAccessToken),
    connectedVia: s.metaConnectedVia ?? (s.metaAccessToken ? "token" : null),
    accounts,
    tokenDaysLeft: daysLeft,
    oauthEnabled: metaOAuthEnabled,
    currency: s.currency,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const f = await request.formData();
  const intent = String(f.get("intent") ?? "save");

  if (intent === "disconnect-meta") {
    await prisma.shopSettings.update({
      where: { shop: session.shop },
      data: {
        metaAccessToken: null,
        metaTokenExpiresAt: null,
        metaConnectedVia: null,
        metaAdAccounts: [],
        metaAdAccountId: null,
        metaAdAccountCurrency: null,
      },
    });
    await prisma.dailySpend.deleteMany({ where: { shop: session.shop } });
    return json({ ok: true, message: "Meta är bortkopplat." });
  }

  const dec = (k: string) => parseFloat(String(f.get(k) ?? "").replace(",", "."));
  const token = String(f.get("metaAccessToken") ?? "").trim();
  const accountId = String(f.get("metaAdAccountId") ?? "").trim().replace(/^act_/, "") || null;

  const before = await prisma.shopSettings.findUnique({ where: { shop: session.shop } });
  const accountChanged = (before?.metaAdAccountId ?? null) !== accountId;

  /* Kontots valuta: ur den sparade kontolistan om den finns, annars ett
     Meta-anrop. Utan valuta kan spend inte räknas om, så den sparas direkt. */
  let currency: string | null = before?.metaAdAccountCurrency ?? null;
  if (accountId && (accountChanged || !currency)) {
    const list = (Array.isArray(before?.metaAdAccounts) ? before!.metaAdAccounts : []) as unknown as MetaAdAccount[];
    currency = list.find((a) => a.id === accountId)?.currency ?? null;
    const tok = token || before?.metaAccessToken;
    if (!currency && tok) {
      try {
        currency = (await fetchAdAccountInfo({ adAccountId: accountId, accessToken: tok })).currency || null;
      } catch {
        currency = null; // fylls i vid första spend-hämtningen
      }
    }
  }
  if (!accountId) currency = null;

  await prisma.shopSettings.update({
    where: { shop: session.shop },
    data: {
      tariffPerOrder: dec("tariffPerOrder"),
      feeRate: dec("feeRate") / 100,
      targetMargin: dec("targetMargin") / 100,
      metaAdAccountId: accountId,
      metaAdAccountCurrency: currency,
      // Tomt fält = behåll befintlig token, radera den inte av misstag.
      ...(token ? { metaAccessToken: token, metaConnectedVia: "token", metaTokenExpiresAt: null } : {}),
      // Kvitterar kom igång-checklistans steg om tull och avgifter.
      settingsSavedAt: new Date(),
    },
  });
  // Cachad spend bygger på det gamla kontot — släng den så inget blandas ihop.
  if (accountChanged || token) {
    await prisma.dailySpend.deleteMany({ where: { shop: session.shop } });
  }
  return json({ ok: true, message: "Sparat." });
}

const META_NOTICES: Record<string, { tone: "success" | "warning" | "critical"; text: string }> = {
  connected: { tone: "success", text: "Meta är kopplat. Välj annonskonto nedan och spara." },
  noaccounts: { tone: "warning", text: "Inloggningen lyckades, men Meta-kontot har inga annonskonton. Logga in med ett konto som har åtkomst till annonskontot." },
  cancelled: { tone: "warning", text: "Inloggningen avbröts. Inget ändrades." },
  failed: { tone: "critical", text: "Meta-inloggningen misslyckades." },
  disabled: { tone: "warning", text: "Meta-knappen är inte aktiverad i den här installationen. Klistra in en token nedan." },
};

export default function Settings() {
  const d = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [params] = useSearchParams();
  const notice = META_NOTICES[params.get("meta") ?? ""];
  const reason = params.get("reason");

  const [v, setV] = useState({
    tariffPerOrder: String(d.tariffPerOrder),
    feeRate: String((d.feeRate * 100).toFixed(2)),
    targetMargin: String(Math.round(d.targetMargin * 100)),
    metaAdAccountId: d.metaAdAccountId,
    metaAccessToken: "",
  });
  const [showToken, setShowToken] = useState(!d.oauthEnabled || d.connectedVia === "token");
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));

  const accountOptions = [
    { label: "— välj annonskonto —", value: "" },
    ...d.accounts.map((a) => ({
      label: `${a.name} · ${a.id} · ${a.currency}`,
      value: a.id,
    })),
  ];
  const chosen = d.accounts.find((a) => a.id === v.metaAdAccountId);
  const chosenCurrency = chosen?.currency ?? d.metaAdAccountCurrency;
  const foreign = chosenCurrency && chosenCurrency !== d.currency;

  const tokenWarning =
    d.tokenDaysLeft != null && d.tokenDaysLeft <= 7
      ? d.tokenDaysLeft <= 0
        ? "Meta-inloggningen har gått ut. Koppla om för att fortsätta hämta annonskostnad."
        : `Meta-inloggningen går ut om ${d.tokenDaysLeft} dagar. Koppla om i god tid.`
      : null;

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
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">Meta-annonser</Text>
                {d.hasMetaToken ? (
                  <Badge tone={tokenWarning ? "attention" : "success"}>
                    {d.connectedVia === "oauth" ? "Kopplat med Meta-inloggning" : "Kopplat med token"}
                  </Badge>
                ) : (
                  <Badge tone="critical">Inte kopplat</Badge>
                )}
              </InlineStack>

              {notice ? (
                <Banner tone={notice.tone}>
                  {notice.text}
                  {reason ? ` (${reason})` : ""}
                </Banner>
              ) : null}
              {tokenWarning ? <Banner tone="warning">{tokenWarning}</Banner> : null}

              {d.oauthEnabled ? (
                <InlineStack gap="300" blockAlign="center" wrap>
                  <Button
                    variant={d.hasMetaToken && d.connectedVia === "oauth" ? "secondary" : "primary"}
                    url="/app/meta/connect"
                  >
                    {d.hasMetaToken && d.connectedVia === "oauth" ? "Koppla om Meta" : "Koppla Meta"}
                  </Button>
                  {d.hasMetaToken ? (
                    <Button
                      tone="critical"
                      variant="plain"
                      loading={fetcher.state !== "idle"}
                      onClick={() => fetcher.submit({ intent: "disconnect-meta" }, { method: "POST" })}
                    >
                      Koppla bort
                    </Button>
                  ) : null}
                  <Text as="span" variant="bodySm" tone="subdued">
                    Logga in med det Facebook-konto som har åtkomst till annonskontot. Vi läser bara annonskostnad.
                  </Text>
                </InlineStack>
              ) : null}

              {d.accounts.length ? (
                <Select
                  label="Annonskonto"
                  options={accountOptions}
                  value={v.metaAdAccountId}
                  onChange={set("metaAdAccountId")}
                  helpText={
                    foreign
                      ? `Kontot står i ${chosenCurrency}. Annonskostnaden räknas om till ${d.currency} dag för dag med ECB-kursen.`
                      : "Kontot står i butikens valuta — ingen omräkning behövs."
                  }
                />
              ) : (
                <TextField
                  label="Annonskonto-ID"
                  value={v.metaAdAccountId}
                  onChange={set("metaAdAccountId")}
                  autoComplete="off"
                  helpText={
                    foreign
                      ? `Kontot står i ${chosenCurrency}. Annonskostnaden räknas om till ${d.currency} dag för dag med ECB-kursen.`
                      : "Siffrorna, med eller utan act_-prefix."
                  }
                />
              )}

              {d.oauthEnabled ? (
                <Button variant="plain" onClick={() => setShowToken((s) => !s)} disclosure={showToken ? "up" : "down"}>
                  Klistra in en token i stället
                </Button>
              ) : null}
              <Collapsible open={showToken} id="meta-token">
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
              </Collapsible>

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
            onClick={() => fetcher.submit({ ...v, intent: "save" }, { method: "POST" })}
          >
            Spara
          </Button>
          {fetcher.data?.ok ? <Banner tone="success">{fetcher.data.message}</Banner> : null}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
