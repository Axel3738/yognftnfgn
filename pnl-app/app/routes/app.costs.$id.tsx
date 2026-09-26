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
import { loadCatalog, patchaKostnader, setUnitCost } from "../lib/shopify-data.server";
import { butikensMer, kandaMarknader, readDaily, shiftIso } from "../lib/daily.server";
import { beTon, beUnderlag, tunntPris } from "../lib/produktintakt";
import { hemlandAv, marknadskod, marknadsnamn } from "../lib/marknad";
import { mixBreakEven, radUtfall } from "../lib/breakeven.server";
import { rate as fxRate } from "../lib/fx.server";
import { dayInTz } from "../lib/shopify-data.server";
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
  const marknader = await kandaMarknader(session.shop, hemlandAv(settings?.currency));

  /* Break-even per packstorlek, på standardkostnaden och standardstegen, plus
     den faktiska mixen de senaste 90 dagarna. Ett tvåpack betalar tullen en
     gång och får packpriset — därför skiljer sig raderna, och därför är
     mixraden det tal annonserna faktiskt måste slå. */
  const idag = dayInTz(new Date(), settings?.timezone ?? "UTC");
  const [mix90, merLas] = await Promise.all([
    readDaily(session.shop, shiftIso(idag, -89), idag).catch(() => null),
    /* Butikens MER (30 stängda dagar) — färgen på break-even. Ingen = ingen färg. */
    butikensMer(session.shop, idag).catch(() => ({ mer: null, from: "", to: "" })),
  ]);
  const tariffPerOrder = Number(settings?.tariffPerOrder ?? 0);
  const feeRate = Number(settings?.feeRate ?? 0);
  const breakEven = variants.map((v) => {
    const egnaSteg = tierRows
      .filter((r) => r.variantGid === v.variantGid && (r.market ?? "") === "")
      .map((r) => ({ variantGid: v.variantGid, units: r.units, totalCost: Number(r.totalCost) }));
    /* Utan marknadsfilter är det en rad per variant (marknad ""). Priset
       per antal är det kunderna betalade efter alla rabatter; storlekar utan
       sålda rader med pris räknas på listpris och märks. */
    const rad = mix90?.products.find((p) => p.variantGid === v.variantGid);
    const indata = {
      price: v.price, unitCost: v.unitCost, tiers: egnaSteg, lines: rad?.lines ?? null,
      linesRevenue: rad?.linesRevenue ?? null, linesPriced: rad?.linesPriced ?? null,
      tariffPerOrder, feeRate,
    };
    const storlekar = [1, ...egnaSteg.map((t) => t.units)].sort((a, b) => a - b);
    return {
      variantGid: v.variantGid,
      variantTitle: v.variantTitle === "Default Title" ? "—" : v.variantTitle,
      rader: storlekar.map((q) => radUtfall(q, indata)).filter((r): r is NonNullable<typeof r> => r != null),
      mix: mixBreakEven(indata),
    };
  });

  const costCurrency = (settings?.costCurrency ?? settings?.currency ?? "SEK").toUpperCase();
  const butiksValuta = settings?.currency ?? "SEK";
  const kurs = costCurrency === butiksValuta ? 1 : (await fxRate(costCurrency, butiksValuta)) ?? null;

  return json({
    lang: asLang(settings?.language),
    marknader,
    breakEven,
    storeMer: merLas.mer,
    currency: butiksValuta,
    costCurrency,
    kurs,
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
      market: r.market ?? "",
    })),
    history: history.map((h) => ({
      id: h.id,
      variantGid: h.variantGid,
      market: h.market ?? "",
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
    const market = marknadskod(form.get("market"));
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
          where: { shop_variantGid_units_market: { shop: session.shop, variantGid: v.variantGid, units, market } },
          create: { shop: session.shop, variantGid: v.variantGid, units, totalCost, market },
          update: { totalCost },
        }),
      ),
    );
    return json({ ok: true, message: T.costDetail.tierSaved(targets.length, units, `${totalCost.toFixed(2)} ${settings?.currency ?? "SEK"}`) });
  }

  if (String(form.get("intent")) === "delete") {
    await prisma.costChange.deleteMany({
      where: { id: String(form.get("id")), shop: session.shop },
    });
    return json({ ok: true, message: T.costDetail.entryDeleted });
  }

  /* Beloppen kan vara i en annan valuta (leverantören offererar i USD).
     Räknas om med dagens ECB-kurs — ingen kurs, ingen skrivning. */
  const butiksValuta = settings?.currency ?? "SEK";
  const inValuta = String(form.get("currency") ?? "").trim().toUpperCase() || butiksValuta;
  const kurs = inValuta === butiksValuta ? 1 : await fxRate(inValuta, butiksValuta);
  if (kurs == null) return json({ ok: false, message: T.costs.currency.noRate(inValuta) }, { status: 502 });
  const rund = (n: number) => Math.round(n * kurs * 100) / 100;
  const productCost = rund(num(form.get("productCost")));
  const shippingCost = rund(num(form.get("shippingCost")));
  const effectiveFrom = String(form.get("effectiveFrom") ?? "");
  const variantGid = String(form.get("variantGid") ?? "");
  /* Marknad: tom = standard, skrivs även till Shopify. Satt = bara vår post,
     Shopify har inget fält för "kostnad till Norge". */
  const market = marknadskod(form.get("market"));

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
  /* Vad som faktiskt skrevs — katalogen uppdateras med det i stället för att
     slängas och pagineras om från Shopify. */
  const kostnadsandringar = new Map<string, number | null>();
  if (!market) {
    for (const t of targets) {
      const res = await setUnitCost(admin, t.inventoryItemGid, total);
      if (!res.ok) failed.push(`${t.variantTitle}: ${res.error}`);
      else kostnadsandringar.set(t.inventoryItemGid, total);
    }
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
      market,
    },
  });

  await patchaKostnader(session.shop, prisma, kostnadsandringar);
  return json({
    ok: !failed.length,
    message: failed.length
      ? T.costDetail.savedPartial(failed.join(", "))
      : T.costDetail.saved(targets.length, `${total.toFixed(2)} ${butiksValuta}`, effectiveFrom),
  });
}

export default function ProductCost() {
  const { lang, marknader, breakEven, storeMer, currency, costCurrency, kurs, title, variants, history, tiers } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const tierFetcher = useFetcher<typeof action>();
  const [tier, setTier] = useState({ units: "2", totalCost: "", variantGid: "", market: "" });
  const setTierField = (k: keyof typeof tier) => (val: string) => setTier((s) => ({ ...s, [k]: val }));
  const today = new Date().toISOString().slice(0, 10);
  const [v, setV] = useState({
    productCost: "",
    shippingCost: "",
    effectiveFrom: today,
    variantGid: "",
    market: "",
    currency: costCurrency,
  });
  const valutor = [...new Set([currency, "USD", "EUR", "CNY", "GBP", "NOK", "DKK", "PLN"])];
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  const T = t(lang);
  const marknadsval = [
    { label: T.costs.market.standard, value: "" },
    ...marknader.map((m) => ({ label: `${marknadsnamn(m, lang, m)} (${m})`, value: m })),
  ];
  const marknadsetikett = (m: string) => (m ? `${marknadsnamn(m, lang, m)} (${m})` : T.costs.market.standardShort);

  const nf = new Intl.NumberFormat(localeOf(lang), { minimumFractionDigits: 2 });
  const dec = (s: string) => (lang === "sv" ? s.replace(".", ",") : s);
  const p = parseFloat(v.productCost.replace(",", ".")) || 0;
  const f = parseFloat(v.shippingCost.replace(",", ".")) || 0;
  const busy = fetcher.state !== "idle";
  const dec2 = (n: number) => `${dec(n.toFixed(2))}×`;
  /* Alla belopp med valuta — nakna tal i tabellerna gick inte att läsa. */
  const kr = (n: number, valuta: string = currency) => `${nf.format(n)} ${valuta}`;

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

              <InlineStack gap="300" wrap>
                {variants.length > 1 ? (
                  <div style={{ minWidth: 200, flex: 1 }}>
                    <Select
                      label={T.costDetail.appliesTo}
                      options={[
                        { label: T.costDetail.allVariants(variants.length), value: "" },
                        ...variants.map((x) => ({ label: x.variantTitle, value: x.variantGid })),
                      ]}
                      value={v.variantGid}
                      onChange={set("variantGid")}
                    />
                  </div>
                ) : null}
                <div style={{ minWidth: 200, flex: 1 }}>
                  <Select
                    label={T.costs.market.label}
                    options={marknadsval}
                    value={v.market}
                    onChange={set("market")}
                    helpText={v.market ? T.costs.market.entryHelpMarket : T.costs.market.entryHelpStandard}
                  />
                </div>
                <div style={{ minWidth: 160 }}>
                  <Select
                    label={T.costs.currency.label}
                    options={valutor.map((c) => ({ label: c === currency ? `${c} (${T.costs.currency.shop})` : c, value: c }))}
                    value={v.currency}
                    onChange={set("currency")}
                    helpText={v.currency !== currency && v.currency === costCurrency && kurs ? T.costs.currency.rateNote(v.currency, currency, kurs) : undefined}
                  />
                </div>
              </InlineStack>

              <Banner tone={p + f > 0 ? "info" : undefined}>
                {p + f > 0
                  ? T.costDetail.totalBanner(kr(p + f, v.currency), kr(p, v.currency), kr(f, v.currency))
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
                kr(x.price),
                x.unitCost == null ? "—" : kr(x.unitCost),
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
              <Text as="h2" variant="headingMd">{T.costs.be.title}</Text>
              <Text as="p" tone="subdued">{T.costs.be.body}</Text>
              <Text as="p" variant="bodySm" tone="subdued">{T.costs.be.revenueNote}</Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {storeMer != null ? T.costs.be.merNote(dec(storeMer.toFixed(2))) : T.costs.be.merNone}
              </Text>
              {breakEven.map((b) => (
                <BlockStack key={b.variantGid} gap="100">
                  {variants.length > 1 ? <Text as="h3" variant="headingSm">{b.variantTitle}</Text> : null}
                  {b.rader.length ? (
                    <DataTable
                      columnContentTypes={["text", "numeric", "numeric", "numeric", "numeric", "numeric"]}
                      headings={[T.costs.be.thQty, T.costs.be.thShare, T.costs.be.thRevenue, T.costs.be.thCost, T.costs.be.thCm, T.costs.thBeRoas]}
                      rows={[
                        ...b.rader.map((r) => {
                          const andel = b.mix.mix.find((m) => m.qty === r.qty)?.share;
                          /* Orderrader bakom storleken — färg bara på tre eller fler.
                             På realiserat pris räknas raderna som BÄR priset. */
                          const antal = b.mix.antagen || andel == null ? 0 : Math.round(andel * b.mix.lines);
                          /* Realiserat pris på under tre rader (en giveaway med
                             100 %-kod räcker för att TB ska gå minus): talet visas,
                             men ingen röd TB och ingen "olönsam" — ingen dom på
                             tunn data. Listpris är kostnadsstrukturens dom, som förut. */
                          const tunn = !r.listpris && tunntPris(r.prisade);
                          return [
                            r.listpris ? `${r.qty} ${T.costs.be.unit} · ${T.costs.be.listShort}` : `${r.qty} ${T.costs.be.unit}`,
                            b.mix.antagen || andel == null ? "—" : `${Math.round(andel * 100)} %`,
                            kr(r.revenue),
                            kr(r.cogs),
                            <Text key={`tb${r.qty}`} as="span" tone={r.tb > 0 || tunn ? undefined : "critical"}>{kr(r.tb)}</Text>,
                            r.beRoas == null
                              ? tunn ? "—" : <Badge key={`be${r.qty}`} tone="critical">{T.costs.unprofitable}</Badge>
                              : <Text key={`be${r.qty}`} as="span" tone={r.listpris ? undefined : beTon(r.beRoas, storeMer, Math.min(antal, r.prisade))}>{dec2(r.beRoas)}</Text>,
                          ];
                        }),
                        [
                          <Text key="mix" as="span" fontWeight="semibold">{T.costs.be.mixRow}</Text>,
                          b.mix.antagen ? "—" : `${b.mix.lines}`,
                          b.mix.revenue == null ? "—" : kr(b.mix.revenue),
                          "",
                          b.mix.tb == null ? "—" : <Text key="mixtb" as="span" fontWeight="semibold" tone={b.mix.tb > 0 || tunntPris(b.mix.prisade) ? undefined : "critical"}>{kr(b.mix.tb)}</Text>,
                          b.mix.beRoas == null
                            ? tunntPris(b.mix.prisade) ? "—" : <Badge key="mixbe" tone="critical">{T.costs.unprofitable}</Badge>
                            : <Text key="mixbe" as="span" fontWeight="semibold" tone={beTon(b.mix.beRoas, storeMer, beUnderlag(b.mix))}>{dec2(b.mix.beRoas)}</Text>,
                        ],
                      ]}
                    />
                  ) : (
                    <Text as="p" tone="subdued">{T.costDetail.missingBadge}</Text>
                  )}
                  {b.mix.antagen && b.rader.length ? <Text as="p" variant="bodySm" tone="subdued">{T.costs.be.noSales}</Text> : null}
                  {b.rader.length ? (
                    <Text as="p" variant="bodySm" tone="subdued">
                      {b.mix.antagen ? T.costs.be.priceList : b.mix.delvisListpris ? T.costs.be.pricePartly : T.costs.be.priceRealized}
                    </Text>
                  ) : null}
                  {/* Varför en olönsam storlek står som "—" i stället för rött. */}
                  {b.rader.some((r) => !r.listpris && tunntPris(r.prisade)) ? (
                    <Text as="p" variant="bodySm" tone="subdued">{T.costs.be.thinPrice}</Text>
                  ) : null}
                </BlockStack>
              ))}
            </BlockStack>
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
                <div style={{ minWidth: 180 }}>
                  <Select label={T.costs.market.label} options={marknadsval} value={tier.market} onChange={setTierField("market")} />
                </div>
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
                  columnContentTypes={["text", "text", "numeric", "numeric", "numeric", "text"]}
                  headings={[T.costDetail.thVariant, T.costs.market.label, T.costDetail.thUnits, T.costDetail.thTotal, T.costDetail.thPerUnit, ""]}
                  rows={variants.flatMap((x) => {
                    const mine = tiers.filter((r) => r.variantGid === x.variantGid);
                    if (!mine.length) return [];
                    return [
                      [x.variantTitle, T.costs.market.standardShort, T.costDetail.oneUnit, x.unitCost == null ? "—" : kr(x.unitCost),
                        x.unitCost == null ? "—" : kr(x.unitCost), ""],
                      ...mine.map((r) => [
                        x.variantTitle,
                        marknadsetikett(r.market),
                        String(r.units),
                        kr(r.totalCost),
                        kr(r.totalCost / r.units),
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
                columnContentTypes={["text", "text", "text", "numeric", "numeric", "numeric", "text"]}
                headings={[
                  T.costDetail.thEffectiveFrom,
                  T.costDetail.thApplies,
                  T.costs.market.label,
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
                  marknadsetikett(h.market),
                  h.productCost == null ? "—" : kr(h.productCost),
                  h.shippingCost == null ? "—" : kr(h.shippingCost),
                  kr(h.unitCost),
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
