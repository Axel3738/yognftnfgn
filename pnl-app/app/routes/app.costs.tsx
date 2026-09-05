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
import { fetchVariantCosts, invalidateCatalog, invalidateVariantCosts, loadCatalog, setUnitCost } from "../lib/shopify-data.server";
import { asLang, localeOf, t } from "../lib/texts";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const settings = await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    create: { shop: session.shop },
    update: {},
  });
  const lang = asLang(settings.language);
  const [costs, tierRows] = await Promise.all([
    loadCatalog(admin, session.shop, prisma),
    prisma.costTier.findMany({ where: { shop: session.shop }, orderBy: { units: "asc" } }),
  ]);
  /* Mallen ska gå att skicka runt och släppa tillbaka utan att tappa
     flerpacken — därför följer stegen med i kostnadskolumnen: 88.34|134.22. */
  const tiersByVariant = new Map<string, string[]>();
  for (const t of tierRows) {
    const list = tiersByVariant.get(t.variantGid) ?? [];
    list.push(Number(t.totalCost).toFixed(2));
    tiersByVariant.set(t.variantGid, list);
  }
  const rows = [...costs.all].map((v) => ({
    ...v,
    costCell: v.unitCost == null ? "" : [v.unitCost.toFixed(2), ...(tiersByVariant.get(v.variantGid) ?? [])].join("|"),
  })).sort((a, b) => {
    // Saknade kostnader först — det är dem man är här för att fixa.
    if ((a.unitCost == null) !== (b.unitCost == null)) return a.unitCost == null ? -1 : 1;
    return a.productTitle.localeCompare(b.productTitle, lang === "sv" ? "sv" : "en");
  });
  return json({
    lang,
    rows,
    missing: rows.filter((r) => r.unitCost == null).length,
    total: rows.length,
    tariffPerOrder: Number(settings.tariffPerOrder),
    feeRate: Number(settings.feeRate),
    currency: settings.currency,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const form = await request.formData();
  // Meddelandena visas i UI:t — hämta butikens språk först.
  const settings = await prisma.shopSettings.findUnique({ where: { shop: session.shop } });
  const T = t(asLang(settings?.language));
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
    /* Flerpack: "88.34|134.22|180.19" = totalkostnad för 1, 2 och 3 st i
       samma orderrad. Första talet är styckpriset som skrivs till Shopify;
       resten sparas som steg i appen. */
    const steg = (fyra ? parts[2] : parts[parts.length - 1] ?? "")
      .split("|")
      .map((x) => parseFloat(x.trim().replace(",", ".")));
    return {
      product: parts[0] ?? "",
      variant: fyra ? parts[1] : parts.length >= 3 ? parts.slice(1, -1).join(" ").trim() : "",
      cost: steg[0],
      tiers: steg.slice(1).map((totalCost, i) => ({ units: i + 2, totalCost })).filter((t) => Number.isFinite(t.totalCost)),
    };
  };
  const rawLines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !/^B[äa]verbutiken inköpspriser/i.test(l));
  const parsed = rawLines.map(parseLine).filter((r) => r.product && Number.isFinite(r.cost));

  if (!parsed.length) {
    const sample = rawLines[0] ? T.costs.firstRowParsed(JSON.stringify(parseLine(rawLines[0]))) : "";
    return json(
      { ok: false, message: T.costs.noValidRows(sample) },
      { status: 400 },
    );
  }

  const catalog = await fetchVariantCosts(admin);
  const applied: string[] = [];
  const skipped: string[] = [];

  /* Leverantörsofferter skriver "6-18 hk" där butiken har "6 - 18 hk" eller
     "6–18 hk" — samma variant, olika streck. Jämför därför på en städad form.
     En rad får också träffa via ett enda alternativ ("6 - 18 hk" träffar
     "Svart / 6 - 18 hk", "Blå / 6 - 18 hk" …) så att en storleksprislista
     inte behöver upprepas per färg. */
  const norm = (s: string) =>
    s.toLowerCase().replace(/[–—−]/g, "-").replace(/\s*([-/])\s*/g, "$1").replace(/\s+/g, " ").trim();
  const variantMatches = (variantTitle: string, wanted: string) => {
    if (wanted === "") return true;
    const w = norm(wanted);
    const v = norm(variantTitle);
    return v === w || v.split("/").includes(w);
  };

  for (const row of parsed) {
    // Tom varianttitel = alla varianter i produkten.
    const targets = catalog.all.filter(
      (v) => norm(v.productTitle) === norm(row.product) && variantMatches(v.variantTitle, row.variant),
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

      /* Stegen ersätter variantens tidigare steg — filen är sanningen. En rad
         utan steg rör dem inte, så en vanlig prislista raderar inga flerpack. */
      if (row.tiers.length) {
        await prisma.costTier.deleteMany({ where: { shop: session.shop, variantGid: target.variantGid } });
        await prisma.costTier.createMany({
          data: row.tiers.map((t) => ({
            shop: session.shop, variantGid: target.variantGid, units: t.units, totalCost: t.totalCost,
          })),
        });
      }

      // Historik, så att äldre perioder räknas på den kostnad som gällde då.
      if (effectiveFrom) {
        await prisma.costChange.create({
          data: {
            shop: session.shop,
            productGid: target.productGid,
            variantGid: row.variant ? target.variantGid : null,
            unitCost: row.cost,
            effectiveFrom: new Date(effectiveFrom),
            note: T.costs.costNote(effectiveFrom),
          },
        });
      }
    }
  }

  invalidateVariantCosts(session.shop);
  await invalidateCatalog(session.shop, prisma);
  return json({
    ok: true,
    message: T.costs.updatedMsg(applied.length, skipped.length, skipped.slice(0, 5).join(", ")),
  });
}

export default function Costs() {
  const { lang, rows, missing, total, tariffPerOrder, feeRate, currency } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [visaMall, setVisaMall] = useState(false);
  const T = t(lang);

  /* Mallen byggs i webbläsaren av datan som redan finns på sidan.
     En serverrutt hade varit renare, men en vanlig länknavigering inifrån
     Shopifys iframe bär ingen sessionstoken — resultatet blev att man laddade
     ner inloggningssidan istället för filen. */
  const safe = (s: string) => s.replace(/;/g, ",").trim();
  const mallText = [
    T.costs.tpl1,
    T.costs.tpl2,
    T.costs.tpl3,
    T.costs.tpl4,
    T.costs.tpl5,
    T.costs.tpl6,
    ...rows.map(
      (r) =>
        `${safe(r.productTitle)};${r.variantTitle === "Default Title" ? "" : safe(r.variantTitle)};${r.costCell};${r.price}`,
    ),
  ].join("\n");

  const laddaNerMall = () => {
    const blob = new Blob(["﻿" + mallText + "\n"], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = lang === "sv" ? "inkopspriser.csv" : "costs.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const nf = new Intl.NumberFormat(localeOf(lang), { minimumFractionDigits: 2 });
  const dec = (s: string) => (lang === "sv" ? s.replace(".", ",") : s);

  /* Täckningsbidrag och break-even ROAS per styck.
     Tullen tas ut per ORDER, inte per styck — här räknas den som om ordern
     innehåller en enhet, vilket är det försiktiga fallet. Ett tvåpack bär
     tullen en gång och har därför bättre siffror än vad som visas här. */
  const perStyck = (pris: number, kostnad: number | null) => {
    if (kostnad == null) return null;
    const tb = pris - kostnad - tariffPerOrder - pris * feeRate;
    return { tb, beRoas: tb > 0 ? pris / tb : null };
  };

  return (
    <Page title={T.costs.title} subtitle={T.costs.subtitle(total - missing, total)}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {missing > 0 ? (
              <Banner tone="warning" title={T.costs.missingBannerTitle(missing)}>
                {T.costs.missingBannerBody}
              </Banner>
            ) : (
              <Banner tone="success">{T.costs.allHaveCost}</Banner>
            )}

            <Card background="bg-surface-secondary">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">{T.costs.sopTitle}</Text>
                <Text as="p" tone="subdued">
                  <strong>1.</strong> {T.costs.sop1}<br />
                  <strong>2.</strong> {T.costs.sop2}<br />
                  <strong>3.</strong> {T.costs.sop3}<br />
                  <strong>4.</strong> {T.costs.sop4}<br />
                  <strong>5.</strong> {T.costs.bundleHint}
                </Text>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    {T.costs.importTitle}
                  </Text>
                  <Text as="p" tone="subdued">
                    {T.costs.importBody}
                  </Text>
                  <InlineStack gap="300" blockAlign="center" wrap>
                    <Button onClick={laddaNerMall}>{T.costs.downloadTemplate}</Button>
                    <Button variant="plain" onClick={() => setVisaMall((x) => !x)}>
                      {visaMall ? T.costs.hideTemplate : T.costs.showAsText}
                    </Button>
                  </InlineStack>

                  {visaMall ? (
                    <TextField
                      label={T.costs.templateLabel}
                      value={mallText}
                      onChange={() => {}}
                      multiline={10}
                      autoComplete="off"
                      readOnly
                      helpText={T.costs.templateHelp}
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
                          {fileName ?? T.costs.pastedText}
                        </Text>
                        <Text as="p" tone="subdued" variant="bodySm">
                          {T.costs.dropReady(csv.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#")).length)}
                        </Text>
                      </BlockStack>
                    </div>
                  ) : (
                    <DropZone.FileUpload
                      actionTitle={T.costs.chooseFile}
                      actionHint={T.costs.dragHint}
                    />
                  )}
                </DropZone>

                <TextField
                  label={T.costs.pasteLabel}
                  value={csv}
                  onChange={(v) => {
                    setCsv(v);
                    setFileName(null);
                  }}
                  multiline={6}
                  autoComplete="off"
                  placeholder={T.costs.pastePlaceholder}
                />
                <TextField
                  label={T.costs.effectiveFromLabel}
                  type="date"
                  value={effectiveFrom}
                  onChange={setEffectiveFrom}
                  autoComplete="off"
                  helpText={T.costs.effectiveFromHelp}
                />
                <Button
                  variant="primary"
                  disabled={!csv.trim()}
                  loading={fetcher.state !== "idle"}
                  onClick={() => fetcher.submit({ csv, effectiveFrom }, { method: "POST" })}
                >
                  {T.costs.writeToShopify}
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
              columnContentTypes={["text", "text", "numeric", "numeric", "numeric", "numeric"]}
              headings={[
                T.costs.thProduct,
                T.costs.thVariant,
                T.costs.thPrice,
                T.costs.thCost,
                T.costs.thCmPerUnit(currency),
                T.costs.thBeRoas,
              ]}
              rows={rows.map((r) => [
                <Link key={r.variantGid} to={`/app/costs/${r.productGid.split("/").pop()}`}>
                  {r.productTitle}
                </Link>,
                r.variantTitle === "Default Title" ? "—" : r.variantTitle,
                nf.format(r.price),
                r.unitCost == null ? "—" : nf.format(r.unitCost),
                (() => {
                  const k = perStyck(r.price, r.unitCost);
                  if (!k) return <Badge key={`tb${r.variantGid}`} tone="critical">{T.costs.missingBadge}</Badge>;
                  return (
                    <Text key={`tb${r.variantGid}`} as="span" tone={k.tb > 0 ? undefined : "critical"}>
                      {nf.format(k.tb)}
                    </Text>
                  );
                })(),
                (() => {
                  const k = perStyck(r.price, r.unitCost);
                  if (!k) return "—";
                  if (k.beRoas == null)
                    return <Badge key={`be${r.variantGid}`} tone="critical">{T.costs.unprofitable}</Badge>;
                  return (
                    <Text key={`be${r.variantGid}`} as="span"
                      tone={k.beRoas <= 2 ? "success" : k.beRoas <= 3 ? undefined : "critical"}>
                      {`${dec(k.beRoas.toFixed(2))}×`}
                    </Text>
                  );
                })(),
              ])}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
