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
import { asLang, localeOf, t } from "../lib/texts";

const gid = (id: string) => `gid://shopify/Product/${id}`;
const num = (v: FormDataEntryValue | null) => parseFloat(String(v ?? "").replace(",", "."));

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const productGid = gid(String(params.id));

  const catalog = await loadCatalog(admin, session.shop, prisma);
  const variants = catalog.all.filter((v) => v.productGid === productGid);
  if (!variants.length) throw redirect("/app/costs");

  const [history, settings] = await Promise.all([
    prisma.costChange.findMany({
      where: { shop: session.shop, productGid },
      orderBy: { effectiveFrom: "desc" },
    }),
    prisma.shopSettings.findUnique({ where: { shop: session.shop } }),
  ]);

  return json({
    lang: asLang(settings?.language),
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
  // Meddelandena visas i UI:t — hämta butikens språk först.
  const settings = await prisma.shopSettings.findUnique({ where: { shop: session.shop } });
  const T = t(asLang(settings?.language));

  if (String(form.get("intent")) === "delete") {
    await prisma.costChange.deleteMany({
      where: { id: String(form.get("id")), shop: session.shop },
    });
    return json({ ok: true, message: T.costDetail.entryDeleted });
  }

  const productCost = num(form.get("productCost"));
  const shippingCost = num(form.get("shippingCost"));
  const effectiveFrom = String(form.get("effectiveFrom") ?? "");
  const variantGid = String(form.get("variantGid") ?? "");

  if (!Number.isFinite(productCost) || !Number.isFinite(shippingCost)) {
    return json({ ok: false, message: T.costDetail.fillBoth }, { status: 400 });
  }
  if (!effectiveFrom) {
    return json({ ok: false, message: T.costDetail.enterDate }, { status: 400 });
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
      note: T.costDetail.costNote(productCost.toFixed(2), shippingCost.toFixed(2)),
    },
  });

  invalidateVariantCosts(session.shop);
  await invalidateCatalog(session.shop, prisma);
  return json({
    ok: !failed.length,
    message: failed.length
      ? T.costDetail.savedPartial(failed.join(", "))
      : T.costDetail.saved(targets.length, total.toFixed(2), effectiveFrom),
  });
}

export default function ProductCost() {
  const { lang, title, variants, history } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const today = new Date().toISOString().slice(0, 10);
  const [v, setV] = useState({
    productCost: "",
    shippingCost: "",
    effectiveFrom: today,
    variantGid: "",
  });
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  const T = t(lang);

  const nf = new Intl.NumberFormat(localeOf(lang), { minimumFractionDigits: 2 });
  const dec = (s: string) => (lang === "sv" ? s.replace(".", ",") : s);
  const p = parseFloat(v.productCost.replace(",", ".")) || 0;
  const f = parseFloat(v.shippingCost.replace(",", ".")) || 0;
  const busy = fetcher.state !== "idle";

  return (
    <Page
      title={title}
      backAction={{ content: T.nav.costs, url: "/app/costs" }}
      subtitle={T.costDetail.subtitle}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">{T.costDetail.newEntry}</Text>
              <Text as="p" tone="subdued">
                {T.costDetail.newEntryBody}
              </Text>

              <InlineStack gap="300" wrap>
                <div style={{ minWidth: 150, flex: 1 }}>
                  <TextField label={T.costDetail.productCostLabel} value={v.productCost}
                    onChange={set("productCost")} autoComplete="off" placeholder="3.15" />
                </div>
                <div style={{ minWidth: 150, flex: 1 }}>
                  <TextField label={T.costDetail.shippingLabel} value={v.shippingCost}
                    onChange={set("shippingCost")} autoComplete="off" placeholder="7.26" />
                </div>
                <div style={{ minWidth: 160 }}>
                  <TextField label={T.costDetail.effectiveFrom} type="date" value={v.effectiveFrom}
                    onChange={set("effectiveFrom")} autoComplete="off" />
                </div>
              </InlineStack>

              {variants.length > 1 ? (
                <Select
                  label={T.costDetail.appliesTo}
                  options={[
                    { label: T.costDetail.allVariants(variants.length), value: "" },
                    ...variants.map((x) => ({ label: x.variantTitle, value: x.variantGid })),
                  ]}
                  value={v.variantGid}
                  onChange={set("variantGid")}
                />
              ) : null}

              <Banner tone={p + f > 0 ? "info" : undefined}>
                {p + f > 0
                  ? T.costDetail.totalBanner(nf.format(p + f), nf.format(p), nf.format(f))
                  : T.costDetail.totalBannerEmpty}
              </Banner>

              <InlineStack>
                <Button variant="primary" loading={busy}
                  onClick={() => fetcher.submit({ ...v, intent: "add" }, { method: "POST" })}>
                  {T.costDetail.saveEntry}
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
              <Text as="h2" variant="headingMd">{T.costDetail.currentCost}</Text>
            </div>
            <DataTable
              columnContentTypes={["text", "numeric", "numeric", "text"]}
              headings={[T.costDetail.thVariant, T.costDetail.thPrice, T.costDetail.thCost, T.costDetail.thMultiple]}
              rows={variants.map((x) => [
                x.variantTitle,
                nf.format(x.price),
                x.unitCost == null ? "—" : nf.format(x.unitCost),
                x.unitCost == null || x.unitCost === 0
                  ? <Badge tone="critical">{T.costDetail.missingBadge}</Badge>
                  : `${dec((x.price / x.unitCost).toFixed(2))}×`,
              ])}
            />
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            <div style={{ padding: "16px 16px 0" }}>
              <Text as="h2" variant="headingMd">{T.costDetail.history}</Text>
            </div>
            {history.length ? (
              <DataTable
                columnContentTypes={["text", "text", "numeric", "numeric", "numeric", "text"]}
                headings={[
                  T.costDetail.thEffectiveFrom,
                  T.costDetail.thApplies,
                  T.costDetail.thGoods,
                  T.costDetail.thShipping,
                  T.costDetail.thTotal,
                  "",
                ]}
                rows={history.map((h) => [
                  h.effectiveFrom,
                  h.variantGid
                    ? variants.find((x) => x.variantGid === h.variantGid)?.variantTitle ?? T.costDetail.aVariant
                    : T.costDetail.allVariantsShort,
                  h.productCost == null ? "—" : nf.format(h.productCost),
                  h.shippingCost == null ? "—" : nf.format(h.shippingCost),
                  nf.format(h.unitCost),
                  <Button key={h.id} variant="plain" tone="critical"
                    onClick={() => fetcher.submit({ intent: "delete", id: h.id }, { method: "POST" })}>
                    {T.costDetail.remove}
                  </Button>,
                ])}
              />
            ) : (
              <div style={{ padding: 16 }}>
                <Text as="p" tone="subdued">
                  {T.costDetail.emptyHistory}
                </Text>
              </div>
            )}
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Link to="/app/costs">
            <Text as="span" variant="bodySm">{T.costDetail.backLink}</Text>
          </Link>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
