/**
 * Flytta hit — inköpspriser från en annan vinstapp i tre steg.
 *
 *  1. Kollen: hur många varianter har redan inköpspris i Shopify? Appar som
 *     skriver till Shopifys eget kostnadsfält (och Shopify självt) är redan
 *     klara — då är flytten noll klick.
 *  2. Filen: släpp exporten (CSV/TSV) eller klistra in. Kolumnerna känns igen
 *     automatiskt och tolkningen visas innan något skrivs.
 *  3. Skrivningen: en knapp. Kostnaderna hamnar i Shopifys unitCost — som
 *     butikens egendom, inte inlåsta i vår app.
 */

import { useCallback, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  DataTable,
  DropZone,
  InlineStack,
  Layout,
  Page,
  ProgressBar,
  Text,
  TextField,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { fetchVariantCosts, invalidateVariantCosts, setUnitCost } from "../lib/shopify-data.server";
import { matchRows, parseCostText } from "../lib/cost-import.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const catalog = await fetchVariantCosts(admin, session.shop);
  const total = catalog.all.length;
  const withCost = catalog.all.filter((v) => v.unitCost != null && v.unitCost > 0).length;
  return json({ total, withCost, withSku: catalog.all.filter((v) => v.sku).length });
}

type Preview = {
  ok: true;
  intent: "preview";
  columns: Record<string, string | null>;
  hadHeader: boolean;
  matched: { label: string; via: string; cost: number; count: number }[];
  unmatched: { label: string; reason: string }[];
  totalTargets: number;
};
type Applied = { ok: true; intent: "apply"; applied: number; failed: string[]; skipped: number };
type Failed = { ok: false; message: string };

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "preview");
  const text = String(form.get("text") ?? "");
  const effectiveFrom = String(form.get("effectiveFrom") ?? "");

  const parsed = parseCostText(text);
  if (!parsed.rows.length) {
    return json<Failed>({ ok: false, message: "Filen är tom eller gick inte att läsa. Exportera igen som CSV och prova på nytt." }, { status: 400 });
  }
  const catalog = await fetchVariantCosts(admin, session.shop);
  const { matched, unmatched } = matchRows(parsed.rows, catalog);

  if (intent === "preview") {
    return json<Preview>({
      ok: true,
      intent: "preview",
      columns: parsed.columns,
      hadHeader: parsed.hadHeader,
      matched: matched.map((m) => ({
        label: m.targets.length === 1
          ? `${m.targets[0].productTitle}${m.targets[0].variantTitle !== "Default Title" ? ` · ${m.targets[0].variantTitle}` : ""}`
          : `${m.targets[0].productTitle} · alla ${m.targets.length} varianter`,
        via: m.via === "variantId" ? "variant-ID" : m.via === "sku" ? "SKU" : "titel",
        cost: m.row.cost!,
        count: m.targets.length,
      })),
      unmatched: unmatched.map((u) => ({ label: `rad ${u.row.line}`, reason: u.reason })),
      totalTargets: matched.reduce((a, m) => a + m.targets.length, 0),
    });
  }

  /* Skrivningen. Samma matchning körs om på servern — förhandsgranskningen
     är bara en bild av vad som kommer att hända, inte det som skrivs. */
  let applied = 0;
  const failed: string[] = [];
  for (const m of matched) {
    for (const target of m.targets) {
      const res = await setUnitCost(admin, target.inventoryItemGid, m.row.cost!);
      if (!res.ok) { failed.push(`${target.productTitle} · ${target.variantTitle}: ${res.error}`); continue; }
      applied++;
      if (effectiveFrom) {
        await prisma.costChange.create({
          data: {
            shop: session.shop,
            productGid: target.productGid,
            variantGid: m.targets.length === 1 ? target.variantGid : null,
            unitCost: m.row.cost!,
            effectiveFrom: new Date(effectiveFrom),
            note: `importerad kostnad, gäller från ${effectiveFrom}`,
          },
        });
      }
    }
  }
  invalidateVariantCosts(session.shop);
  return json<Applied>({ ok: true, intent: "apply", applied, failed, skipped: unmatched.length });
}

export default function Import() {
  const d = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [effectiveFrom, setEffectiveFrom] = useState("");

  const onDrop = useCallback((_dropped: File[], accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setText(String(reader.result ?? ""));
      setFileName(file.name);
    };
    reader.readAsText(file);
  }, []);

  const data = fetcher.data;
  const preview = data && data.ok && data.intent === "preview" ? data : null;
  const applied = data && data.ok && data.intent === "apply" ? data : null;
  const failure = data && !data.ok ? data : null;
  const busy = fetcher.state !== "idle";

  const coverage = d.total ? Math.round((d.withCost / d.total) * 100) : 0;
  const allDone = d.total > 0 && d.withCost === d.total;
  const nf = new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 2 });

  return (
    <Page title="Flytta hit" subtitle="Ta med inköpspriserna från din gamla vinstapp">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {/* Steg 1 */}
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">1. Vad finns redan?</Text>
                  <Badge tone={allDone ? "success" : coverage > 0 ? "attention" : "critical"}>
                    {`${d.withCost} av ${d.total} varianter har inköpspris`}
                  </Badge>
                </InlineStack>
                <ProgressBar progress={coverage} tone={allDone ? "success" : "primary"} size="small" />
                {allDone ? (
                  <Banner tone="success" title="Klart — inget att flytta">
                    Alla varianter har redan ett inköpspris i Shopify. Din gamla app skrev till
                    Shopifys eget kostnadsfält, och det är precis det vi läser. Panelen räknar redan rätt.
                  </Banner>
                ) : (
                  <Text as="p" tone="subdued">
                    Vi läser Shopifys eget fält <em>Kostnad per artikel</em>. Appar som sparar
                    inköpspriser i sin egen databas (t.ex. Juicy) lämnar fältet tomt — då tar du med
                    dem i steg 2. Det tar en minut.
                  </Text>
                )}
              </BlockStack>
            </Card>

            {/* Steg 2 */}
            {!allDone || text ? (
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">2. Släpp exporten här</Text>
                  <Text as="p" tone="subdued">
                    I din gamla app: hitta <strong>Export</strong> (ofta under COGS / Costs /
                    Settings) och spara som CSV. Släpp filen här — kolumnerna känns igen automatiskt:
                    variant-ID, SKU eller produkttitel plus kostnad. Rubriker på engelska eller svenska.
                  </Text>
                  <DropZone accept=".csv,.tsv,.txt,text/csv,text/plain" type="file" allowMultiple={false} onDrop={onDrop}>
                    {fileName ? (
                      <div style={{ padding: 16 }}>
                        <Text as="p" alignment="center">{`Fil: ${fileName}`}</Text>
                      </div>
                    ) : (
                      <DropZone.FileUpload actionTitle="Välj fil" actionHint="eller släpp en CSV här" />
                    )}
                  </DropZone>
                  <TextField
                    label="… eller klistra in"
                    value={text}
                    onChange={(v) => { setText(v); setFileName(null); }}
                    multiline={6}
                    autoComplete="off"
                    placeholder={"SKU;Product;Variant;Cost\nMH-420-S;Marin Motorhölje 420D;Svart / 40 - 60 hk;81,92"}
                  />
                  <TextField
                    label="Gäller från (valfritt)"
                    type="date"
                    value={effectiveFrom}
                    onChange={setEffectiveFrom}
                    autoComplete="off"
                    helpText="Sätt ett datum om kostnaderna är nya. Perioder före datumet räknas då på det som gällde innan."
                  />
                  <InlineStack gap="300">
                    <Button
                      variant="primary"
                      disabled={!text.trim()}
                      loading={busy && fetcher.formData?.get("intent") === "preview"}
                      onClick={() => fetcher.submit({ intent: "preview", text, effectiveFrom }, { method: "POST" })}
                    >
                      Visa vad som händer
                    </Button>
                  </InlineStack>
                  {failure ? <Banner tone="critical">{failure.message}</Banner> : null}
                </BlockStack>
              </Card>
            ) : null}

            {/* Steg 3 */}
            {preview ? (
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">3. Skriv till Shopify</Text>
                  <Text as="p" tone="subdued">
                    {preview.hadHeader
                      ? `Kolumner: ${Object.entries(preview.columns).filter(([, v]) => v).map(([k, v]) => `${label(k)} = "${v}"`).join(", ")}.`
                      : "Ingen rubrikrad — tolkat som produkt;variant;kostnad."}
                  </Text>
                  <InlineStack gap="200">
                    <Badge tone="success">{`${preview.totalTargets} varianter får kostnad`}</Badge>
                    {preview.unmatched.length ? (
                      <Badge tone="attention">{`${preview.unmatched.length} rader hoppas över`}</Badge>
                    ) : null}
                  </InlineStack>
                  {preview.matched.length ? (
                    <DataTable
                      columnContentTypes={["text", "text", "numeric"]}
                      headings={["Variant", "Matchad via", "Kostnad"]}
                      rows={preview.matched.slice(0, 200).map((m) => [m.label, m.via, nf.format(m.cost)])}
                    />
                  ) : null}
                  {preview.unmatched.length ? (
                    <Banner tone="warning" title="Rader som inte hittar sin variant">
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {preview.unmatched.slice(0, 15).map((u) => (
                          <li key={u.label}>{`${u.label}: ${u.reason}`}</li>
                        ))}
                        {preview.unmatched.length > 15 ? <li>{`… och ${preview.unmatched.length - 15} till`}</li> : null}
                      </ul>
                      <p>De skrivs inte. Rätta titeln eller SKU:t i filen och kör igen, eller fyll i dem under Kostnader efteråt.</p>
                    </Banner>
                  ) : null}
                  <Button
                    variant="primary"
                    disabled={preview.totalTargets === 0}
                    loading={busy && fetcher.formData?.get("intent") === "apply"}
                    onClick={() => fetcher.submit({ intent: "apply", text, effectiveFrom }, { method: "POST" })}
                  >
                    {`Skriv ${preview.totalTargets} inköpspriser till Shopify`}
                  </Button>
                </BlockStack>
              </Card>
            ) : null}

            {applied ? (
              <Banner tone={applied.failed.length ? "warning" : "success"} title={`${applied.applied} inköpspriser skrivna`}>
                {applied.skipped ? <p>{`${applied.skipped} rader hoppades över (ingen matchande variant).`}</p> : null}
                {applied.failed.length ? <p>{`Misslyckades: ${applied.failed.slice(0, 5).join("; ")}`}</p> : null}
                <p>Kostnaderna ligger nu i Shopify och syns direkt i panelen. Din gamla app kan avinstalleras.</p>
              </Banner>
            ) : null}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

const label = (k: string) =>
  ({ product: "produkt", variant: "variant", sku: "SKU", variantId: "variant-ID", cost: "kostnad" } as Record<string, string>)[k] ?? k;
