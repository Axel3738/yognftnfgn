/**
 * COGS-editor.
 *
 * Skriver till Shopifys `InventoryItem.unitCost` — inte till en egen tabell.
 * Det är hela poängen: kostnaden blir butikens egendom, läsbar av Shopifys egna
 * rapporter och av vilken annan app som helst. Appen äger bara *historiken*
 * (CostChange), eftersom Shopify inte sparar någon.
 *
 * CSV-format: produkttitel;varianttitel;kostnad
 * Varianttitel tom = gäller alla varianter i produkten.
 */

import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Banner,
  Button,
  Card,
  DataTable,
  Layout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { fetchVariantCosts, setUnitCost } from "../lib/shopify-data.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const costs = await fetchVariantCosts(admin);
  const rows = [...costs.all].sort((a, b) => {
    // Saknade kostnader först — det är dem man är här för att fixa.
    if ((a.unitCost == null) !== (b.unitCost == null)) return a.unitCost == null ? -1 : 1;
    return a.productTitle.localeCompare(b.productTitle, "sv");
  });
  return json({
    rows,
    missing: rows.filter((r) => r.unitCost == null).length,
    total: rows.length,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const form = await request.formData();
  const csv = String(form.get("csv") ?? "");
  const effectiveFrom = String(form.get("effectiveFrom") ?? "");

  /* Tålig radtolkning: semikolon är formatet, men text som passerat Excel
     kommer med tabbar och kommadecimaler. Sista kolumnen är alltid kostnaden. */
  const parseLine = (line: string) => {
    let parts = line.split(/[;\t]/).map((x) => x.trim());
    if (parts.length < 2) parts = line.split(/\s{2,}/).map((x) => x.trim());
    const cost = parseFloat((parts[parts.length - 1] ?? "").replace(",", "."));
    return {
      product: parts[0] ?? "",
      variant: parts.length >= 3 ? parts.slice(1, -1).join(" ").trim() : "",
      cost,
    };
  };
  const rawLines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !/^B[äa]verbutiken inköpspriser/i.test(l));
  const parsed = rawLines.map(parseLine).filter((r) => r.product && Number.isFinite(r.cost));

  if (!parsed.length) {
    const sample = rawLines[0] ? ` Första raden tolkades som: ${JSON.stringify(parseLine(rawLines[0]))}` : "";
    return json(
      { ok: false, message: `Hittade inga giltiga rader i CSV:n.${sample}` },
      { status: 400 },
    );
  }

  const catalog = await fetchVariantCosts(admin);
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const row of parsed) {
    // Tom varianttitel = alla varianter i produkten.
    const targets = catalog.all.filter(
      (v) =>
        v.productTitle.toLowerCase() === row.product.toLowerCase() &&
        (row.variant === "" || v.variantTitle.toLowerCase() === row.variant.toLowerCase()),
    );
    if (!targets.length) {
      skipped.push(`${row.product}${row.variant ? ` · ${row.variant}` : ""}`);
      continue;
    }

    for (const target of targets) {
      const res = await setUnitCost(admin, target.inventoryItemGid, row.cost);
      if (!res.ok) {
        skipped.push(`${target.productTitle} · ${target.variantTitle}: ${res.error}`);
        continue;
      }
      applied.push(`${target.productTitle} · ${target.variantTitle}`);

      // Historik, så att äldre perioder räknas på den kostnad som gällde då.
      if (effectiveFrom) {
        await prisma.costChange.create({
          data: {
            shop: session.shop,
            productGid: target.productGid,
            variantGid: row.variant ? target.variantGid : null,
            unitCost: row.cost,
            effectiveFrom: new Date(effectiveFrom),
            note: `ny kostnad från ${effectiveFrom}`,
          },
        });
      }
    }
  }

  return json({
    ok: true,
    message:
      `${applied.length} varianter uppdaterade.` +
      (skipped.length ? ` ${skipped.length} hoppades över: ${skipped.slice(0, 5).join(", ")}` : ""),
  });
}

export default function Costs() {
  const { rows, missing, total } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [csv, setCsv] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");

  const nf = new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 2 });

  return (
    <Page title="Kostnader" subtitle={`${total - missing} av ${total} varianter har inköpspris`}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {missing > 0 ? (
              <Banner tone="warning" title={`${missing} varianter saknar inköpspris`}>
                Utan inköpspris räknas produkten som gratis och vinsten blir för hög.
              </Banner>
            ) : (
              <Banner tone="success">Alla varianter har inköpspris.</Banner>
            )}

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Importera
                </Text>
                <Text as="p" tone="subdued">
                  En rad per produkt: <code>produkttitel;varianttitel;kostnad</code>. Lämna
                  varianttiteln tom för att sätta samma kostnad på alla varianter. Kostnaden ska
                  vara vara + frakt <em>utan</em> tull — tullen är per order och ligger i
                  Inställningar.
                </Text>
                <TextField
                  label="CSV"
                  value={csv}
                  onChange={setCsv}
                  multiline={8}
                  autoComplete="off"
                  placeholder={"Marin Motorhölje 420D – Universellt Skydd;Svart / 40 - 60 hk;81.92\nStrandtofflor för Herr – Halkfria Trädgårdsskor;;103.16"}
                />
                <TextField
                  label="Gäller från (valfritt)"
                  type="date"
                  value={effectiveFrom}
                  onChange={setEffectiveFrom}
                  autoComplete="off"
                  helpText="Sätts ett datum sparas ändringen i historiken, så att perioder före datumet räknas på den gamla kostnaden."
                />
                <Button
                  variant="primary"
                  loading={fetcher.state !== "idle"}
                  onClick={() => fetcher.submit({ csv, effectiveFrom }, { method: "POST" })}
                >
                  Skriv till Shopify
                </Button>
                {fetcher.data ? (
                  <Banner tone={fetcher.data.ok ? "success" : "critical"}>
                    {fetcher.data.message}
                  </Banner>
                ) : null}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            <DataTable
              columnContentTypes={["text", "text", "numeric", "numeric", "text"]}
              headings={["Produkt", "Variant", "Pris", "Inköp", "Multipel"]}
              rows={rows.map((r) => [
                r.productTitle,
                r.variantTitle === "Default Title" ? "—" : r.variantTitle,
                nf.format(r.price),
                r.unitCost == null ? "—" : nf.format(r.unitCost),
                r.unitCost == null || r.unitCost === 0 ? (
                  <Badge tone="critical">saknas</Badge>
                ) : (
                  `${(r.price / r.unitCost).toFixed(2).replace(".", ",")}×`
                ),
              ])}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
