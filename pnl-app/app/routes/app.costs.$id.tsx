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

  const [history, settings, tierRows] = await Promise.all([
    prisma.costChange.findMany({
      where: { shop: session.shop, productGid },
      orderBy: { effectiveFrom: "desc" },
    }),
    prisma.shopSettings.findUnique({ where: { shop: session.shop } }),
    prisma.costTier.findMany({
      where: { shop: session.shop, variantGid: { in: variants.map((v) => v.variantGid) } },
      orderBy: { units: "asc" },
    }),
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
    tiers: tierRows.map((r) => ({
      id: r.id,
      variantGid: r.variantGid,
      units: r.units,
      totalCost: Number(r.totalCost),
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

  if (String(form.get("intent")) === "tierDelete") {
    await prisma.costTier.deleteMany({
      where: { id: String(form.get("id")), shop: session.shop },
    });
    return json({ ok: true, message: T.costDetail.tierDeleted });
  }

  if (String(form.get("intent")) === "tier") {
    /* Flerpack: totalpris för N stycken i samma orderrad. Skrivs inte till
       Shopify — där finns bara ETT styckpris. Appen äger stegen. */
    const units = Math.round(num(form.get("units")));
    const totalCost = num(form.get("totalCost"));
    const forVariant = String(form.get("variantGid") ?? "");
    if (!(units >= 2) || !Number.isFinite(totalCost) || totalCost < 0) {
      return json({ ok: false, message: T.costDetail.tierInvalid }, { status: 400 });
    }
    const catalog = await loadCatalog(admin, session.shop, prisma);
    const targets = catalog.all.filter(
      (v) => v.productGid === productGid && (forVariant === "" || v.variantGid === forVariant),
    );
    await prisma.$transaction(
      targets.map((v) =>
        prisma.costTier.upsert({
          where: { shop_variantGid_units: { shop: session.shop, variantGid: v.variantGid, units } },
          create: { shop: session.shop, variantGid: v.variantGid, units, totalCost },
          update: { totalCost },
        }),
      ),
    );
    return json({ ok: true, message: T.costDetail.tierSaved(targets.length, units, totalCost.toFixed(2)) });
  }

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
  const { lang, title, variants, history, tiers } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const tierFetcher = useFetcher<typeof action>();
  const [tier, setTier] = useState({ units: "2", totalCost: "", variantGid: "" });
  const setTierField = (k: keyof typeof tier) => (val: string) => setTier((s) => ({ ...s, [k]: val }));
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
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">{T.costDetail.tiersTitle}</Text>
              <Text as="p" tone="subdued">{T.costDetail.tiersBody}</Text>

              <InlineStack gap="300" wrap blockAlign="end">
                <div style={{ minWidth: 110 }}>
                  <TextField label={T.costDetail.tierUnits} type="number" min={2} value={tier.units}
                    onChange={setTierField("units")} autoComplete="off" />
                </div>
                <div style={{ minWidth: 150, flex: 1 }}>
                  <TextField label={T.costDetail.tierTotal} value={tier.totalCost}
                    onChange={setTierField("totalCost")} autoComplete="off" placeholder="134.22" />
                </div>
                {variants.length > 1 ? (
                  <div style={{ minWidth: 200, flex: 1 }}>
                    <Select
                      label={T.costDetail.appliesTo}
                      options={[
                        { label: T.costDetail.allVariants(variants.length), value: "" },
                        ...variants.map((x) => ({ label: x.variantTitle, value: x.variantGid })),
                      ]}
                      value={tier.variantGid}
                      onChange={setTierField("variantGid")}
                    />
                  </div>
                ) : null}
                <Button variant="primary" loading={tierFetcher.state !== "idle"}
                  onClick={() => tierFetcher.submit({ ...tier, intent: "tier" }, { method: "POST" })}>
                  {T.costDetail.tierAdd}
                </Button>
              </InlineStack>

              {tierFetcher.data ? (
                <Banner tone={tierFetcher.data.ok ? "success" : "critical"}>{tierFetcher.data.message}</Banner>
              ) : null}

              {tiers.length ? (
                <DataTable
                  columnContentTypes={["text", "numeric", "numeric", "numeric", "text"]}
                  headings={[T.costDetail.thVariant, T.costDetail.thUnits, T.costDetail.thTotal, T.costDetail.thPerUnit, ""]}
                  rows={variants.flatMap((x) => {
                    const mine = tiers.filter((r) => r.variantGid === x.variantGid);
                    if (!mine.length) return [];
                    return [
                      [x.variantTitle, T.costDetail.oneUnit, x.unitCost == null ? "—" : nf.format(x.unitCost),
                        x.unitCost == null ? "—" : nf.format(x.unitCost), ""],
                      ...mine.map((r) => [
                        x.variantTitle,
                        String(r.units),
                        nf.format(r.totalCost),
                        nf.format(r.totalCost / r.units),
                        <Button key={r.id} variant="plain" tone="critical"
                          onClick={() => tierFetcher.submit({ intent: "tierDelete", id: r.id }, { method: "POST" })}>
                          {T.costDetail.remove}
                        </Button>,
                      ]),
                    ];
                  })}
                />
              ) : (
                <Text as="p" tone="subdued">{T.costDetail.tiersEmpty}</Text>
              )}
            </BlockStack>
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
