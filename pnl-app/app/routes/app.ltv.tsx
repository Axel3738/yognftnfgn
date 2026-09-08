/**
 * Kundvärde (LTV) — tilläggsfunktionen.
 *
 * Låst bakom planen "Standard + LTV" på App Store-tjänsten; egna butiker
 * (BILLING_EXEMPT_SHOPS) och custom-deployments ser den direkt.
 *
 * Underlaget är alla ordrar med kund-ID, hämtade med bulk-exporten och
 * cachade sex timmar (kohorter ändras inte minut för minut). Räknelogiken
 * bor i lib/ltv.server.ts och är ren; den här filen hämtar, cachar och visar.
 */

import { Suspense } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { defer, json } from "@remix-run/node";
import { Await, Form, useLoaderData } from "@remix-run/react";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  DataTable,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Spinner,
  Text,
} from "@shopify/polaris";

import { authenticate, billingEnabled, billingExemptShops, PREMIUM_PLAN } from "../shopify.server";
import prisma from "../db.server";
import { fetchLtvOrders, fetchShopInfo, type AdminApiContext } from "../lib/shopify-data.server";
import { computeLtv, type LtvResult } from "../lib/ltv.server";
import { HORISONT, MIN_KUNDER } from "../lib/ltv-konstanter";

const CACHE_KEY = "ltv:all";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

interface Page {
  fatal: string | null;
  result: LtvResult | null;
  currency: string;
  dataAgeMin: number;
  scopeHint: string | null;
}

async function loadLtv(admin: AdminApiContext, shop: string, scope: string): Promise<Page> {
  const missingScopes = ["read_customers", "read_all_orders"].filter((s) => !scope.split(",").includes(s));
  const scopeHint = missingScopes.length
    ? `Appen saknar behörigheten ${missingScopes.join(" och ")} i den här butiken. ` +
      (missingScopes.includes("read_all_orders")
        ? "Utan read_all_orders ses bara de senaste 60 dagarna, vilket är för kort för kundvärde. "
        : "") +
      "Installera om appen för att godkänna de nya behörigheterna."
    : null;

  try {
    const shopInfo = await fetchShopInfo(admin);
    const cached = await prisma.pnlCache.findUnique({ where: { shop_key: { shop, key: CACHE_KEY } } });
    let orders: Awaited<ReturnType<typeof fetchLtvOrders>>;
    let dataAgeMin = 0;
    if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
      orders = cached.payload as unknown as typeof orders;
      dataAgeMin = Math.round((Date.now() - cached.fetchedAt.getTime()) / 60000);
    } else {
      orders = await fetchLtvOrders(admin, shopInfo.timezone);
      await prisma.pnlCache.upsert({
        where: { shop_key: { shop, key: CACHE_KEY } },
        create: { shop, key: CACHE_KEY, payload: orders as any },
        update: { payload: orders as any, fetchedAt: new Date() },
      });
    }
    return {
      fatal: null,
      result: computeLtv(orders, shopInfo.today),
      currency: shopInfo.currency,
      dataAgeMin,
      scopeHint,
    };
  } catch (e) {
    console.error("Loader-fel /app/ltv:", e);
    return { fatal: (e as Error).message, result: null, currency: "SEK", dataAgeMin: 0, scopeHint };
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session, billing } = await authenticate.admin(request);

  let unlocked = true;
  if (billingEnabled && !billingExemptShops.has(session.shop.toLowerCase())) {
    const check = await billing.check({ plans: [PREMIUM_PLAN] });
    unlocked = check.hasActivePayment;
  }
  if (!unlocked) {
    return defer({ unlocked: false as const, page: null });
  }
  return defer({ unlocked: true as const, page: loadLtv(admin, session.shop, session.scope ?? "") });
}

/** Uppgradering: Shopify visar sin godkännandesida och skickar tillbaka hit. */
export async function action({ request }: ActionFunctionArgs) {
  const { billing } = await authenticate.admin(request);
  if (!billingEnabled) return json({ ok: true });
  return billing.request({
    plan: PREMIUM_PLAN,
    returnUrl: `${process.env.SHOPIFY_APP_URL}/app/ltv`,
  });
}

export default function Ltv() {
  const d = useLoaderData<typeof loader>();
  if (!d.unlocked) return <Upsell />;
  return (
    <Suspense
      fallback={
        <Page title="Kundvärde">
          <Card>
            <BlockStack gap="300" inlineAlign="center">
              <Spinner size="large" />
              <Text as="p" tone="subdued">Hämtar hela orderhistoriken — första gången tar det upp till en minut.</Text>
            </BlockStack>
          </Card>
        </Page>
      }
    >
      <Await resolve={d.page}>{(page) => <LtvView p={page as Page} />}</Await>
    </Suspense>
  );
}

function Upsell() {
  return (
    <Page title="Kundvärde">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">Vad är en kund värd — inte bara första köpet?</Text>
              <Text as="p">
                Kundvärde (LTV) följer varje kundkohort månad för månad: hur mycket de som köpte
                första gången i januari har handlat för sedan dess, och hur mycket de som köpte i
                augusti sannolikt kommer att handla för — räknat på dina egna kunders beteende,
                inte på branschsnitt.
              </Text>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>LTV-kurva 0–12 månader, observerat och prognos tydligt åtskilda</li>
                <li>Kohorttabell: kunder, återköpsgrad, ordrar per kund, värde per kund</li>
                <li>Max-CPA räknat på kundvärde i stället för första ordern</li>
                <li>Låst på riktig data — för små kohorter visas som "för lite data", aldrig som en siffra</li>
              </ul>
              <InlineStack gap="300" blockAlign="center">
                <Form method="post">
                  <Button variant="primary" submit>Lägg till för 5 USD/mån</Button>
                </Form>
                <Text as="span" tone="subdued">Totalt 14,99 USD/mån. Avsluta när du vill.</Text>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function LtvView({ p }: { p: Page }) {
  const { fatal, result: r, currency, dataAgeMin, scopeHint } = p;
  if (fatal || !r) {
    return (
      <Page title="Kundvärde">
        <BlockStack gap="300">
          {scopeHint ? <Banner tone="warning">{scopeHint}</Banner> : null}
          <Banner tone="critical" title="Kundvärdet kunde inte räknas">
            <p style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{fatal ?? "okänt fel"}</p>
            {/protected customer data|customer|ACCESS_DENIED/i.test(fatal ?? "") ? (
              <p>
                Det här är oftast Shopifys skydd för kunddata: appen behöver godkännande för
                <em> Protected Customer Data</em> (nivå 1, bara kund-ID) i Partner-dashboarden, plus
                behörigheterna read_customers och read_all_orders.
              </p>
            ) : null}
          </Banner>
        </BlockStack>
      </Page>
    );
  }

  const nf0 = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });
  const money = (v: number | null | undefined) => (v == null ? "—" : `${nf0.format(Math.round(v))} ${currency}`);
  const pct = (v: number | null) => (v == null ? "—" : `${(v * 100).toFixed(0)} %`);

  const kurvaMax = Math.max(1, ...r.kurva.map((k) => k.varde ?? 0));
  const usable = r.kohorter.filter((k) => !k.forLiteData).length;
  const lift = r.forstaKop && r.ltv12 ? r.ltv12 / r.forstaKop : null;

  return (
    <Page title="Kundvärde" subtitle={`${nf0.format(r.totalKunder)} kunder · ${nf0.format(r.totalOrdrar)} ordrar · alla tider`}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {scopeHint ? <Banner tone="warning">{scopeHint}</Banner> : null}
            {dataAgeMin > 0 ? (
              <Text as="span" variant="bodySm" tone="subdued">{`Underlaget hämtades för ${dataAgeMin} min sedan. Uppdateras var sjätte timme.`}</Text>
            ) : null}
            {usable === 0 ? (
              <Banner tone="info" title="För lite data för en prognos">
                {`Kundvärde kräver minst en kohort med ${MIN_KUNDER} kunder som köpt första gången samma månad. Tabellen nedan fylls på allt eftersom.`}
              </Banner>
            ) : null}

            <InlineGrid columns={{ xs: 2, md: 4 }} gap="300">
              <Kpi label="Första köpet per kund" value={money(r.forstaKop)} sub="månad 0, viktat över kohorter" />
              <Kpi
                label={`Kundvärde ${HORISONT} mån`}
                value={money(r.ltv12)}
                sub={r.ltv12 == null ? "för lite data" : r.kurva[HORISONT].prognos ? "delvis prognos" : "observerat"}
                tone={r.ltv12 != null ? "success" : undefined}
              />
              <Kpi label="Lyft mot första köpet" value={lift ? `${lift.toFixed(2).replace(".", ",")}×` : "—"} sub="så mycket mer är en kund värd än sin första order" />
              <Kpi label="Återköpsgrad" value={pct(r.aterkopsgrad)} sub="kunder med minst två ordrar" />
            </InlineGrid>

            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">LTV-kurva per kund</Text>
                  <InlineStack gap="200">
                    <Badge tone="info">observerat</Badge>
                    <Badge>prognos</Badge>
                  </InlineStack>
                </InlineStack>
                <Text as="span" variant="bodySm" tone="subdued">
                  Ackumulerad nettointäkt per kund, månader efter första köpet. Prognosen bygger på hur
                  dina äldre kohorter växte i samma månad — inga branschsnitt.
                </Text>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160, paddingTop: 8 }}>
                  {r.kurva.map((k) => (
                    <div key={k.manad} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }} title={k.varde == null ? "ingen data" : `${money(k.varde)} (${k.prognos ? "prognos" : `${k.kohorter} kohorter`})`}>
                      <span style={{ fontSize: 10, color: "#616161" }}>{k.varde == null ? "—" : nf0.format(k.varde)}</span>
                      <div
                        aria-label={`Månad ${k.manad}: ${money(k.varde)}${k.prognos ? " (prognos)" : ""}`}
                        style={{
                          width: "100%",
                          height: k.varde == null ? 2 : Math.max(2, (k.varde / kurvaMax) * 120),
                          background: k.varde == null ? "#e3e3e3" : k.prognos ? "repeating-linear-gradient(45deg,#8a8a8a 0 4px,#c9c9c9 4px 8px)" : "#005bd3",
                          borderRadius: 3,
                        }}
                      />
                      <span style={{ fontSize: 11, color: "#616161" }}>{k.manad}</span>
                    </div>
                  ))}
                </div>
              </BlockStack>
            </Card>

            <Card padding="0">
              <DataTable
                columnContentTypes={["text", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "text"]}
                headings={["Kohort", "Kunder", "Återköp", "Ordrar/kund", "Månad 0", "Månad 3", `Månad ${HORISONT}`, "Status"]}
                rows={r.kohorter.map((k) => {
                  const at = (m: number) => {
                    if (m < k.observerade) return money(k.perKund[m]);
                    const p = k.prognos[m];
                    return p == null ? "—" : `≈ ${money(p)}`;
                  };
                  return [
                    k.manad,
                    nf0.format(k.kunder),
                    pct(k.aterkop),
                    k.ordrarPerKund.toFixed(2).replace(".", ","),
                    at(0),
                    at(3),
                    at(HORISONT),
                    k.forLiteData ? (
                      <Badge tone="attention">{`för lite data (<${MIN_KUNDER})`}</Badge>
                    ) : k.observerade > HORISONT ? (
                      <Badge tone="success">mogen</Badge>
                    ) : (
                      <Badge tone="info">{`${k.observerade} mån observerade`}</Badge>
                    ),
                  ];
                })}
              />
            </Card>
            <Text as="span" variant="bodySm" tone="subdued">
              ≈ markerar prognos. Innevarande månad räknas inte som observerad förrän den är slut.
              Kohorter under {MIN_KUNDER} kunder visas men påverkar inte prognosen.
            </Text>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "success" | "critical" }) {
  return (
    <Card>
      <BlockStack gap="100">
        <Text as="span" variant="bodySm" tone="subdued">{label}</Text>
        <Text as="p" variant="headingLg" tone={tone}>{value}</Text>
        <Text as="span" variant="bodySm" tone="subdued">{sub}</Text>
      </BlockStack>
    </Card>
  );
}
