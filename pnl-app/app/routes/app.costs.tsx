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
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Banner,
  Button,
  Card,
  DataTable,
  DropZone,
  InlineStack,
  Layout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { fetchVariantCosts, invalidateVariantCosts, setUnitCost } from "../lib/shopify-data.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const costs = await fetchVariantCosts(admin, session.shop);
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
  // Excel och vår egen mall skriver BOM först i filen — annars ser rad ett ut
  // som data istället för kommentar och tolkningen börjar snett.
  const csv = String(form.get("csv") ?? "").replace(/^﻿/, "");
  const effectiveFrom = String(form.get("effectiveFrom") ?? "");

  /* Tålig radtolkning: semikolon är formatet, men text som passerat Excel
     kommer med tabbar och kommadecimaler. Sista kolumnen är alltid kostnaden. */
  const parseLine = (line: string) => {
    let parts = line.split(/[;\t]/).map((x) => x.trim());
    if (parts.length < 2) parts = line.split(/\s{2,}/).map((x) => x.trim());
    /* Mallen har fyra kolumner: titel;variant;kostnad;pris. Priset finns med
       som referens — det gör mallen matchbar mellan butiker på olika språk,
       där titeln inte hjälper — men det är kostnaden som ska skrivas.
       Tre kolumner är det handskrivna formatet: sista kolumnen är kostnaden. */
    const fyra = parts.length >= 4;
    const cost = parseFloat((fyra ? parts[2] : parts[parts.length - 1] ?? "").replace(",", "."));
    return {
      product: parts[0] ?? "",
      variant: fyra ? parts[1] : parts.length >= 3 ? parts.slice(1, -1).join(" ").trim() : "",
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

  invalidateVariantCosts(session.shop);
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
  const [fileName, setFileName] = useState<string | null>(null);
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [visaMall, setVisaMall] = useState(false);

  /* Mallen byggs i webbläsaren av datan som redan finns på sidan.
     En serverrutt hade varit renare, men en vanlig länknavigering inifrån
     Shopifys iframe bär ingen sessionstoken — resultatet blev att man laddade
     ner inloggningssidan istället för filen. */
  const safe = (s: string) => s.replace(/;/g, ",").trim();
  const mallText = [
    "# Inköpspriser — produkttitel;varianttitel;kostnad;försäljningspris",
    "# Fyll i KOSTNAD (tredje kolumnen). Priset sist är bara referens och ignoreras vid import.",
    "# Kostnaden är vara + frakt, UTAN tull. Tullen är per order och ligger i Inställningar.",
    "# Lämna varianttiteln tom för att sätta samma kostnad på alla varianter.",
    "# Ändra inte titlarna — de matchas mot butiken.",
    ...rows.map(
      (r) =>
        `${safe(r.productTitle)};${r.variantTitle === "Default Title" ? "" : safe(r.variantTitle)};${r.unitCost ?? ""};${r.price}`,
    ),
  ].join("\n");

  const laddaNerMall = () => {
    const blob = new Blob(["﻿" + mallText + "\n"], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inkopspriser.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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

            <Card background="bg-surface-secondary">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Så här gör du 📋</Text>
                <Text as="p" tone="subdued">
                  <strong>1.</strong> Ladda ner mallen nedan — den innehåller butikens alla
                  produkter med rätt titlar.<br />
                  <strong>2.</strong> Fyll i kostnadskolumnen. Filen går att skicka vidare till
                  leverantören, bokföringen eller en AI som fyller i den åt dig.<br />
                  <strong>3.</strong> Släpp tillbaka filen här. Alla kostnader skrivs till Shopify
                  på en gång.<br />
                  <strong>4.</strong> Klicka på en produkt i listan längst ner för att lägga till
                  <em> daterade poster</em> — vara och frakt var för sig, med datumet de började
                  gälla. Ändras ett pris lägger du till en ny post istället för att skriva över,
                  så förblir gammal statistik sann.
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Importera inköpspriser
                  </Text>
                  <Text as="p" tone="subdued">
                    Ladda ner mallen — den innehåller butikens exakta produkttitlar. Fyll i
                    kostnadskolumnen, eller skicka filen vidare till den som sitter på
                    inköpspriserna, och släpp den tillbaka här. Kostnaden är vara + frakt{" "}
                    <em>utan</em> tull; tullen är per order och ligger i Inställningar.
                  </Text>
                  <InlineStack gap="300" blockAlign="center" wrap>
                    <Button onClick={laddaNerMall}>⬇ Ladda ner mall med dina produkter</Button>
                    <Button variant="plain" onClick={() => setVisaMall((x) => !x)}>
                      {visaMall ? "Dölj mallen" : "eller visa som text"}
                    </Button>
                  </InlineStack>

                  {visaMall ? (
                    <TextField
                      label="Mall att kopiera"
                      value={mallText}
                      onChange={() => {}}
                      multiline={10}
                      autoComplete="off"
                      readOnly
                      helpText="Markera allt och kopiera om nedladdningen blockeras av webbläsaren."
                    />
                  ) : null}
                </BlockStack>

                <DropZone
                  accept=".csv,text/csv"
                  type="file"
                  allowMultiple={false}
                  onDrop={(_all, accepted) => {
                    const file = accepted[0];
                    if (!file) return;
                    file.text().then((text) => {
                      setCsv(text);
                      setFileName(file.name);
                    });
                  }}
                >
                  {csv ? (
                    <div style={{ padding: 16 }}>
                      <BlockStack gap="100">
                        <Text as="p" fontWeight="semibold">
                          {fileName ?? "Inklistrad text"}
                        </Text>
                        <Text as="p" tone="subdued" variant="bodySm">
                          {`${csv.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#")).length} rader redo att skrivas`}
                        </Text>
                      </BlockStack>
                    </div>
                  ) : (
                    <DropZone.FileUpload
                      actionTitle="Välj CSV-fil"
                      actionHint="eller dra filen hit"
                    />
                  )}
                </DropZone>

                <TextField
                  label="…eller klistra in raderna direkt"
                  value={csv}
                  onChange={(v) => {
                    setCsv(v);
                    setFileName(null);
                  }}
                  multiline={6}
                  autoComplete="off"
                  placeholder={"Marin Motorhölje 420D – Universellt Skydd;Svart / 40 - 60 hk;81.92\nStrandtofflor för Herr – Halkfria Trädgårdsskor;;148.42"}
                />
                <TextField
                  label="Gäller från (valfritt)"
                  type="date"
                  value={effectiveFrom}
                  onChange={setEffectiveFrom}
                  autoComplete="off"
                  helpText="Sätts ett datum sparas ändringen i historiken, så att perioder före datumet räknas på den gamla kostnaden. Släpp in en ny version av filen när priserna ändras och sätt datumet då de började gälla."
                />
                <Button
                  variant="primary"
                  disabled={!csv.trim()}
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
                <Link key={r.variantGid} to={`/app/costs/${r.productGid.split("/").pop()}`}>
                  {r.productTitle}
                </Link>,
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
