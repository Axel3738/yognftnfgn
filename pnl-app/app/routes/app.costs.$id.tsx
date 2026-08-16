/**
 * Kostnadshistorik för en enskild produkt.
 *
 * CSV-importen sätter *nuvarande* kostnad på hela katalogen på en gång. Den
 * här sidan är för det som kommer efter: en ny förhandling, en ny fraktoffert,
 * en ny leverantör. Varje post har ett startdatum, så en prisändring i augusti
 * inte skriver om vad juli kostade.
 *
 * Varan och frakten hålls isär eftersom de förhandlas var för sig och rör sig
 * olika — frakten är oftast den större posten och den enda som ändras när man
 * går från styckorder till flerpack.
 */

import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  DataTable,
  InlineStack,
  Layout,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { fetchVariantCosts, invalidateCatalog, invalidateVariantCosts, loadCatalog, setUnitCost } from "../lib/shopify-data.server";

const gid = (id: string) => `gid://shopify/Product/${id}`;
const num = (v: FormDataEntryValue | null) => parseFloat(String(v ?? "").replace(",", "."));

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const productGid = gid(String(params.id));

  const catalog = await loadCatalog(admin, session.shop, prisma);
  const variants = catalog.all.filter((v) => v.productGid === productGid);
  if (!variants.length) throw redirect("/app/costs");

  const history = await prisma.costChange.findMany({
    where: { shop: session.shop, productGid },
    orderBy: { effectiveFrom: "desc" },
  });

  return json({
    title: variants[0].productTitle,
    variants: variants.map((v) => ({
      variantGid: v.variantGid,
      variantTitle: v.variantTitle === "Default Title" ? "—" : v.variantTitle,
      price: v.price,
      unitCost: v.unitCost,
    })),
    history: history.map((h) => ({
      id: h.id,
      variantGid: h.variantGid,
      unitCost: Number(h.unitCost),
      productCost: h.productCost == null ? null : Number(h.productCost),
      shippingCost: h.shippingCost == null ? null : Number(h.shippingCost),
      effectiveFrom: h.effectiveFrom.toISOString().slice(0, 10),
      note: h.note,
    })),
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const productGid = gid(String(params.id));
  const form = await request.formData();

  if (String(form.get("intent")) === "delete") {
    await prisma.costChange.deleteMany({
      where: { id: String(form.get("id")), shop: session.shop },
    });
    return json({ ok: true, message: "Posten togs bort. Nuvarande kostnad i Shopify är oförändrad." });
  }

  const productCost = num(form.get("productCost"));
  const shippingCost = num(form.get("shippingCost"));
  const effectiveFrom = String(form.get("effectiveFrom") ?? "");
  const variantGid = String(form.get("variantGid") ?? "");

  if (!Number.isFinite(productCost) || !Number.isFinite(shippingCost)) {
    return json({ ok: false, message: "Fyll i både produktpris och frakt." }, { status: 400 });
  }
  if (!effectiveFrom) {
    return json({ ok: false, message: "Ange från vilket datum kostnaden gäller." }, { status: 400 });
  }

  const total = productCost + shippingCost;
  const catalog = await loadCatalog(admin, session.shop, prisma);
  const targets = catalog.all.filter(
    (v) => v.productGid === productGid && (variantGid === "" || v.variantGid === variantGid),
  );

  const failed: string[] = [];
  for (const t of targets) {
    const res = await setUnitCost(admin, t.inventoryItemGid, total);
    if (!res.ok) failed.push(`${t.variantTitle}: ${res.error}`);
  }

  await prisma.costChange.create({
    data: {
      shop: session.shop,
      productGid,
      variantGid: variantGid || null,
      unitCost: total,
      productCost,
      shippingCost,
      effectiveFrom: new Date(effectiveFrom),
      note: `vara ${productCost.toFixed(2)} + frakt ${shippingCost.toFixed(2)}`,
    },
  });

  invalidateVariantCosts(session.shop);
  await invalidateCatalog(session.shop, prisma);
  return json({
    ok: !failed.length,
    message: failed.length
      ? `Posten sparades, men kostnaden kunde inte skrivas till Shopify för: ${failed.join(", ")}`
      : `Sparat. ${targets.length} variant(er) kostar nu ${total.toFixed(2)} från och med ${effectiveFrom}.`,
  });
}

export default function ProductCost() {
  const { title, variants, history } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const today = new Date().toISOString().slice(0, 10);
  const [v, setV] = useState({
    productCost: "",
    shippingCost: "",
    effectiveFrom: today,
    variantGid: "",
  });
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));

  const nf = new Intl.NumberFormat("sv-SE", { minimumFractionDigits: 2 });
  const p = parseFloat(v.productCost.replace(",", ".")) || 0;
  const f = parseFloat(v.shippingCost.replace(",", ".")) || 0;
  const busy = fetcher.state !== "idle";

  return (
    <Page
      title={title}
      backAction={{ content: "Kostnader", url: "/app/costs" }}
      subtitle="Inköpspris per enhet — vara och frakt var för sig"
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">Ny post</Text>
              <Text as="p" tone="subdued">
                Skriv in vad varan och frakten kostar från och med ett visst datum. Perioder före
                datumet räknas fortfarande på den gamla kostnaden, så gammal statistik förblir sann.
              </Text>

              <InlineStack gap="300" wrap>
                <div style={{ minWidth: 150, flex: 1 }}>
                  <TextField label="Produktpris" value={v.productCost}
                    onChange={set("productCost")} autoComplete="off" placeholder="3.15" />
                </div>
                <div style={{ minWidth: 150, flex: 1 }}>
                  <TextField label="Frakt" value={v.shippingCost}
                    onChange={set("shippingCost")} autoComplete="off" placeholder="7.26" />
                </div>
                <div style={{ minWidth: 160 }}>
                  <TextField label="Gäller från" type="date" value={v.effectiveFrom}
                    onChange={set("effectiveFrom")} autoComplete="off" />
                </div>
              </InlineStack>

              {variants.length > 1 ? (
                <Select
                  label="Gäller"
                  options={[
                    { label: `Alla ${variants.length} varianter`, value: "" },
                    ...variants.map((x) => ({ label: x.variantTitle, value: x.variantGid })),
                  ]}
                  value={v.variantGid}
                  onChange={set("variantGid")}
                />
              ) : null}

              <Banner tone={p + f > 0 ? "info" : undefined}>
                {p + f > 0
                  ? `Total inköpskostnad: ${nf.format(p + f)} per enhet — ${nf.format(p)} vara + ${nf.format(f)} frakt. Tullen ligger per order i Inställningar och ska inte in här.`
                  : "Totalen visas här när du fyllt i båda fälten. Tull ska inte ingå — den räknas per order."}
              </Banner>

              <InlineStack>
                <Button variant="primary" loading={busy}
                  onClick={() => fetcher.submit({ ...v, intent: "add" }, { method: "POST" })}>
                  Spara post
                </Button>
              </InlineStack>

              {fetcher.data ? (
                <Banner tone={fetcher.data.ok ? "success" : "critical"}>{fetcher.data.message}</Banner>
              ) : null}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            <div style={{ padding: "16px 16px 0" }}>
              <Text as="h2" variant="headingMd">Nuvarande kostnad i Shopify</Text>
            </div>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric", "text"]}
              headings={["Variant", "Pris", "Inköp", "Multipel"]}
              rows={variants.map((x) => [
                x.variantTitle,
                nf.format(x.price),
                x.unitCost == null ? "—" : nf.format(x.unitCost),
                x.unitCost == null || x.unitCost === 0
                  ? <Badge tone="critical">saknas</Badge>
                  : `${(x.price / x.unitCost).toFixed(2).replace(".", ",")}×`,
              ])}
            />
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            <div style={{ padding: "16px 16px 0" }}>
              <Text as="h2" variant="headingMd">Historik</Text>
            </div>
            {history.length ? (
              <DataTable
                columnContentTypes={["text", "text", "numeric", "numeric", "numeric", "text"]}
                headings={["Gäller från", "Gäller", "Vara", "Frakt", "Totalt", ""]}
                rows={history.map((h) => [
                  h.effectiveFrom,
                  h.variantGid
                    ? variants.find((x) => x.variantGid === h.variantGid)?.variantTitle ?? "en variant"
                    : "alla varianter",
                  h.productCost == null ? "—" : nf.format(h.productCost),
                  h.shippingCost == null ? "—" : nf.format(h.shippingCost),
                  nf.format(h.unitCost),
                  <Button key={h.id} variant="plain" tone="critical"
                    onClick={() => fetcher.submit({ intent: "delete", id: h.id }, { method: "POST" })}>
                    Ta bort
                  </Button>,
                ])}
              />
            ) : (
              <div style={{ padding: 16 }}>
                <Text as="p" tone="subdued">
                  Inga daterade poster än. Kostnaden som ligger i Shopify gäller då hela perioden.
                  Lägg till en post när priset ändras, så räknas gamla perioder på gamla priset.
                </Text>
              </div>
            )}
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Link to="/app/costs">
            <Text as="span" variant="bodySm">← Tillbaka till alla kostnader</Text>
          </Link>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
