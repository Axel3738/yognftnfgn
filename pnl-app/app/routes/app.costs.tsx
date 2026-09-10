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

import { useEffect, useState } from "react";
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
  Select,
  Text,
  TextField,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { invalidateCatalog, invalidateVariantCosts, loadCatalog, setUnitCost } from "../lib/shopify-data.server";
import { importCostCsv } from "../lib/cost-import.server";
import { aiKostnadEnabled, lasKostnaderMedAi, lasOffertMedAi, tillCsv, type Bild } from "../lib/ai-kostnad.server";
import { rate as fxRate } from "../lib/fx.server";
import { asLang, localeOf, t } from "../lib/texts";

/** Axels Loom: "Example: how to import from Juicy". Embed-adressen, inte delningslänken. */
const LOOM_JUICY = "https://www.loom.com/embed/7d1e94bea6fa491ba4f1f50d9cc799f6?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true";

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
  /* Stegen med sitt antal, för att kunna VISA "2 st 134,22 totalt (67,11/st)"
     i listan. Utan antalet går det inte att skriva ut vad appen faktiskt vet. */
  const stegByVariant = new Map<string, { units: number; totalCost: number }[]>();
  for (const t of tierRows) {
    const list = stegByVariant.get(t.variantGid) ?? [];
    list.push({ units: t.units, totalCost: Number(t.totalCost) });
    stegByVariant.set(t.variantGid, list);
  }
  const rows = [...costs.all].map((v) => ({
    ...v,
    tiers: stegByVariant.get(v.variantGid) ?? [],
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
    /* Kortet "Kommer du från Juicy?" — läge A (allt finns redan) eller B
       (släpp filen). Dolt när handlaren tryckt "Ser rätt ut". */
    juicyDismissed: Boolean(settings.juicyCardDismissedAt),
    cogsEstimatePct: settings.cogsEstimatePct ?? null,
    aiEnabled: aiKostnadEnabled,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  if (intent === "juicy-dismiss") {
    await prisma.shopSettings.update({ where: { shop: session.shop }, data: { juicyCardDismissedAt: new Date() } });
    return json({ ok: true, message: "" });
  }
  /* Uppskattad COGS i % av pris för varianter utan kostnad. 0 = av. */
  if (intent === "estimate") {
    const pct = Math.round(Number(form.get("pct")));
    await prisma.shopSettings.update({
      where: { shop: session.shop },
      data: { cogsEstimatePct: Number.isFinite(pct) && pct > 0 && pct < 100 ? pct : null },
    });
    return json({ ok: true, message: "" });
  }
  /* Snabbfältet: en kostnad rakt in i Shopify för en eller flera varianter
     (produktnivå = alla varianter). Inga mallar, ingen fil. */
  if (intent === "set-cost") {
    const cost = parseFloat(String(form.get("cost") ?? "").replace(/\s/g, "").replace(",", "."));
    const targets = String(form.get("targets") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!Number.isFinite(cost) || cost < 0 || !targets.length) {
      return json({ ok: false, message: "invalid" }, { status: 400 });
    }
    const fel: string[] = [];
    for (const gid of targets) {
      const r = await setUnitCost(admin, gid, cost);
      if (!r.ok) fel.push(r.error ?? gid);
    }
    invalidateVariantCosts(session.shop);
    await invalidateCatalog(session.shop, prisma);
    return json({ ok: fel.length === 0, message: fel.join("; ") });
  }
  /* Offertraden handlaren valt produkt för: styckpris till Shopify, ev.
     flerpacksteg till CostTier (ersätter variantens tidigare steg). */
  if (intent === "quote-apply") {
    const cost = parseFloat(String(form.get("cost") ?? "").replace(/\s/g, "").replace(",", "."));
    const inv = String(form.get("inv") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const variants = String(form.get("variants") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    /* Packpriser som "antal:totalpris" — aldrig en positionslista. En offert
       staffar ofta 1/50/100, och att anta 2, 3, 4 i rad hade lagt 50-packets
       pris på ett tvåpack. */
    const tiers = String(form.get("tiers") ?? "")
      .split(",")
      .map((par) => par.split(":").map((x) => parseFloat(x.trim())))
      .filter(([u, tot]) => Number.isFinite(u) && u >= 2 && Number.isFinite(tot) && tot > 0)
      .map(([units, totalCost]) => ({ units: Math.round(units), totalCost }));
    if (!Number.isFinite(cost) || cost < 0 || !inv.length) {
      return json({ ok: false, message: "invalid" }, { status: 400 });
    }
    const fel: string[] = [];
    for (const gid of inv) {
      const r = await setUnitCost(admin, gid, cost);
      if (!r.ok) fel.push(r.error ?? gid);
    }
    if (tiers.length && variants.length) {
      for (const variantGid of variants) {
        await prisma.costTier.deleteMany({ where: { shop: session.shop, variantGid } });
        await prisma.costTier.createMany({
          data: tiers.map((s) => ({ shop: session.shop, variantGid, units: s.units, totalCost: s.totalCost })),
        });
      }
    }
    invalidateVariantCosts(session.shop);
    await invalidateCatalog(session.shop, prisma);
    return json({ ok: fel.length === 0, message: fel.join("; ") });
  }
  // Meddelandena visas i UI:t — hämta butikens språk först.
  const settings = await prisma.shopSettings.findUnique({ where: { shop: session.shop } });
  const T = t(asLang(settings?.language));

  /* Leverantörsoffert: AI plockar ut raderna, kursen räknas här, handlaren
     väljer produkt i UI:t. Inget skrivs till Shopify i det här steget. */
  if (intent === "quote-read") {
    if (!aiKostnadEnabled) return json({ ok: false, message: "AI is not enabled on this server." }, { status: 400 });
    let bilder: Bild[] = [];
    try {
      bilder = JSON.parse(String(form.get("bilder") ?? "[]"));
    } catch {
      bilder = [];
    }
    const text = String(form.get("text") ?? "");
    if (!bilder.length && !text.trim()) return json({ ok: false, message: T.costs.quote.failed("empty") }, { status: 400 });
    try {
      const katalog = await loadCatalog(admin, session.shop, prisma);
      const svar = await lasOffertMedAi({
        bilder: bilder.slice(0, 6),
        text,
        produkter: katalog.all.map((v) => ({ productTitle: v.productTitle, variantTitle: v.variantTitle })),
      });
      const butikensValuta = (settings?.currency ?? "SEK").toUpperCase();
      /* Valutan gissas ALDRIG till butikens. En leverantörsoffert är nästan
         alltid i USD eller CNY, och en offert i dollar som lästes som kronor
         gör varje inköpspris tiofalt fel. Ser AI:n ingen valuta får handlaren
         välja i en lista — därför skickas kurserna för alla valbara valutor
         med, så bytet räknas om direkt utan en ny AI-läsning. */
      const upptackt = (svar.items.find((i) => i.currency)?.currency ?? "")
        .toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
      const valutor = [...new Set([upptackt, "USD", "CNY", "EUR", "GBP", butikensValuta].filter(Boolean))];
      const kurser: Record<string, number | null> = {};
      await Promise.all(
        valutor.map(async (c) => {
          kurser[c] = c === butikensValuta ? 1 : ((await fxRate(c, butikensValuta)) ?? null);
        }),
      );
      const items = svar.items.map((it) => ({
        label: it.label,
        unitCost: it.unit_cost,
        tiers: it.tiers,
        moq: it.moq,
        suggestedProduct: it.suggested_product,
        suggestedVariant: it.suggested_variant,
      }));
      return json({
        ok: true,
        message: items.length ? T.costs.quote.found(items.length) : T.costs.quote.empty,
        quote: { items, notes: svar.notes, detected: upptackt, valutor, kurser, shopCurrency: butikensValuta },
      });
    } catch (e) {
      console.error("AI-offertläsning misslyckades:", e);
      return json({ ok: false, message: T.costs.quote.failed((e as Error).message) }, { status: 500 });
    }
  }

  /* AI läser av skärmbild/text → vårt CSV-format → samma import som filen. */
  if (intent === "ai-import") {
    if (!aiKostnadEnabled) return json({ ok: false, message: "AI is not enabled on this server." }, { status: 400 });
    let bilder: Bild[] = [];
    try {
      bilder = JSON.parse(String(form.get("bilder") ?? "[]"));
    } catch {
      bilder = [];
    }
    const text = String(form.get("text") ?? "");
    if (!bilder.length && !text.trim()) return json({ ok: false, message: T.costs.ai.failed("empty") }, { status: 400 });
    try {
      const katalog = await loadCatalog(admin, session.shop, prisma);
      const svar = await lasKostnaderMedAi({
        bilder: bilder.slice(0, 6),
        text,
        produkter: katalog.all.map((v) => ({ productTitle: v.productTitle, variantTitle: v.variantTitle, price: v.price })),
        currency: settings?.currency ?? "SEK",
      });
      const csv = tillCsv(svar);
      const res = csv ? await importCostCsv(admin, session.shop, prisma, csv, "", T) : { ok: true, message: "", applied: [], skipped: [] };
      const unmatched = [...svar.unmatched, ...res.skipped];
      const currencyNote =
        svar.currency_seen && svar.currency_seen.toUpperCase() !== (settings?.currency ?? "SEK").toUpperCase()
          ? T.costs.ai.currencyNote(svar.currency_seen, settings?.currency ?? "SEK")
          : "";
      return json({
        ok: true,
        message: T.costs.ai.result(res.applied.length, unmatched.length),
        ai: { unmatched, notes: [svar.notes, currencyNote].filter(Boolean).join(" ") },
      });
    } catch (e) {
      console.error("AI-kostnadsläsning misslyckades:", e);
      return json({ ok: false, message: T.costs.ai.failed((e as Error).message) }, { status: 500 });
    }
  }
  // Excel och vår egen mall skriver BOM först i filen — annars ser rad ett ut
  // som data istället för kommentar och tolkningen börjar snett.
  const csv = String(form.get("csv") ?? "").replace(/^\ufeff/, "");
  const effectiveFrom = String(form.get("effectiveFrom") ?? "");

  const res = await importCostCsv(admin, session.shop, prisma, csv, effectiveFrom, T);
  return json({ ok: res.ok, message: res.message }, { status: res.ok ? 200 : 400 });
}

export default function Costs() {
  const { lang, rows, missing, total, tariffPerOrder, feeRate, currency, juicyDismissed, cogsEstimatePct, aiEnabled } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const juicyFetcher = useFetcher<typeof action>();
  const estimateFetcher = useFetcher<typeof action>();
  const aiFetcher = useFetcher<typeof action>();
  const [aiBilder, setAiBilder] = useState<{ name: string; mediaType: string; base64: string }[]>([]);
  const [aiText, setAiText] = useState("");
  const aiData = aiFetcher.data as { ok: boolean; message: string; ai?: { unmatched: string[]; notes: string } } | undefined;
  const quoteFetcher = useFetcher<typeof action>();
  const [quoteBilder, setQuoteBilder] = useState<{ name: string; mediaType: string; base64: string }[]>([]);
  const [quoteText, setQuoteText] = useState("");
  const quoteData = quoteFetcher.data as unknown as
    | {
        ok: boolean;
        message: string;
        quote?: {
          items: OffertItem[];
          notes: string;
          /** Valutan AI:n faktiskt SÅG i offerten. Tom = ingen syntes. */
          detected: string;
          valutor: string[];
          kurser: Record<string, number | null>;
          shopCurrency: string;
        };
      }
    | undefined;
  /* Valutan i offerten väljs här, inte på servern: leverantörsofferter är
     nästan alltid i USD, och att falla tillbaka på butikens valuta gjorde
     varje inköpspris tiofalt fel. Syns ingen valuta i offerten är USD
     förvalt — aldrig SEK. */
  const [offertValuta, setOffertValuta] = useState("USD");
  useEffect(() => {
    if (quoteData?.quote) setOffertValuta(quoteData.quote.detected || "USD");
  }, [quoteData]);
  /* Under en deploy kan en öppen sida ha gammal JS och prata med en ny
     server (eller tvärtom). Listan och kurserna får därför aldrig antas
     finnas — ett tomt fält är begripligt, ordet "undefined" är det inte. */
  const offertValutor = quoteData?.quote?.valutor?.length
    ? quoteData.quote.valutor
    : ["USD", "EUR", "CNY", "GBP", currency];
  const offertKurs = quoteData?.quote?.kurser?.[offertValuta] ?? null;
  const [visaImport, setVisaImport] = useState(false);
  const [visaVideo, setVisaVideo] = useState(false);
  /* Bilder → base64 i webbläsaren. Delas av AI-kortet och offertkortet. */
  const lasBilder = (setter: typeof setAiBilder) => (_all: File[], accepted: File[]) => {
    for (const file of accepted.slice(0, 6)) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result ?? "");
        const base64 = url.split(",")[1] ?? "";
        setter((b) => [...b, { name: file.name, mediaType: file.type || "image/png", base64 }]);
      };
      reader.readAsDataURL(file);
    }
  };
  /* Produktgrupper för snabbfältet: en rad per produkt, varianterna under. */
  const produkter = (() => {
    const m = new Map<string, typeof rows>();
    for (const r of rows) (m.get(r.productGid) ?? m.set(r.productGid, []).get(r.productGid)!).push(r);
    return [...m.values()].sort((a, b) => {
      const am = a.some((r) => r.unitCost == null), bm = b.some((r) => r.unitCost == null);
      if (am !== bm) return am ? -1 : 1;
      return a[0].productTitle.localeCompare(b[0].productTitle, lang === "sv" ? "sv" : "en");
    });
  })();
  /* Täckning ≥ 90 % ⇒ läge A: kostnaderna finns redan (Juicy eller handlaren
     skrev till Shopifys fält) — noll klick. Annars läge B: släpp exporten. */
  const tackning = total ? (total - missing) / total : 0;
  const visaJuicy = !juicyDismissed && juicyFetcher.state === "idle" && !juicyFetcher.data;
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
            {visaJuicy ? (
              <Card background="bg-surface-secondary">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">{tackning >= 0.9 ? T.juicy.titleA : T.juicy.titleB}</Text>
                  <Text as="p">{tackning >= 0.9 ? T.juicy.bodyA(total - missing, total) : T.juicy.bodyB}</Text>
                  {tackning >= 0.9 ? <Text as="p" tone="subdued" variant="bodySm">{T.juicy.noteA}</Text> : null}
                  <InlineStack gap="300">
                    {tackning >= 0.9 ? (
                      <>
                        <Button
                          variant="primary"
                          loading={juicyFetcher.state !== "idle"}
                          onClick={() => juicyFetcher.submit({ intent: "juicy-dismiss" }, { method: "POST" })}
                        >
                          {T.juicy.ctaA}
                        </Button>
                        <Button url="#import">{T.juicy.ctaA2}</Button>
                      </>
                    ) : (
                      <Button variant="primary" url="#import">{T.juicy.ctaB}</Button>
                    )}
                  </InlineStack>
                </BlockStack>
              </Card>
            ) : null}
            {missing > 0 ? (
              <Banner tone="warning" title={T.costs.missingBannerTitle(missing)}>
                {T.costs.missingBannerBody}
              </Banner>
            ) : (
              <Banner tone="success">{T.costs.allHaveCost}</Banner>
            )}

            {/* AI läser av skärmbild av Juicy (eller vad som helst). */}
            {aiEnabled ? (
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">{T.costs.ai.title}</Text>
                  <Text as="p" tone="subdued">{T.costs.ai.body}</Text>
                  {/* Axels Loom-inspelning (2026-09-08): skärmbild i Juicy → släpp → läs av. */}
                  <Button variant="plain" disclosure={visaVideo ? "up" : "down"} onClick={() => setVisaVideo((v) => !v)}>
                    {visaVideo ? T.costs.ai.hideVideo : T.costs.ai.video}
                  </Button>
                  {visaVideo ? (
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden" }}>
                      <iframe
                        src={LOOM_JUICY}
                        title={T.costs.ai.video}
                        allowFullScreen
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                      />
                    </div>
                  ) : null}
                  <DropZone
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    type="image"
                    allowMultiple
                    onDrop={lasBilder(setAiBilder)}
                  >
                    {aiBilder.length ? (
                      <div style={{ padding: 16 }}>
                        <Text as="p" fontWeight="semibold">{aiBilder.map((b) => b.name).join(", ")}</Text>
                      </div>
                    ) : (
                      <DropZone.FileUpload actionTitle={T.costs.ai.drop} actionHint={T.costs.ai.dropHint} />
                    )}
                  </DropZone>
                  <TextField label={T.costs.ai.pasteLabel} value={aiText} onChange={setAiText} multiline={4} autoComplete="off" />
                  <InlineStack gap="300" blockAlign="center">
                    <Button
                      variant="primary"
                      disabled={!aiBilder.length && !aiText.trim()}
                      loading={aiFetcher.state !== "idle"}
                      onClick={() =>
                        aiFetcher.submit(
                          { intent: "ai-import", bilder: JSON.stringify(aiBilder.map(({ mediaType, base64 }) => ({ mediaType, base64 }))), text: aiText },
                          { method: "POST" },
                        )
                      }
                    >
                      {aiFetcher.state !== "idle" ? T.costs.ai.reading : T.costs.ai.run}
                    </Button>
                    {aiBilder.length ? <Button variant="plain" onClick={() => setAiBilder([])}>×</Button> : null}
                  </InlineStack>
                  {aiData ? (
                    <Banner tone={aiData.ok ? "success" : "critical"}>
                      <p>{aiData.message}</p>
                      {aiData.ai?.notes ? <p>{aiData.ai.notes}</p> : null}
                      {aiData.ai?.unmatched.length ? (
                        <>
                          <p><strong>{T.costs.ai.unmatchedTitle}</strong></p>
                          <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {aiData.ai.unmatched.slice(0, 20).map((u) => <li key={u}>{u}</li>)}
                          </ul>
                        </>
                      ) : null}
                    </Banner>
                  ) : null}
                </BlockStack>
              </Card>
            ) : null}

            {/* Leverantörsoffert: AI läser priserna, handlaren väljer produkt. */}
            {aiEnabled ? (
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">{T.costs.quote.title}</Text>
                  <Text as="p" tone="subdued">{T.costs.quote.body}</Text>
                  <DropZone
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    type="image"
                    allowMultiple
                    onDrop={lasBilder(setQuoteBilder)}
                  >
                    {quoteBilder.length ? (
                      <div style={{ padding: 16 }}>
                        <Text as="p" fontWeight="semibold">{quoteBilder.map((b) => b.name).join(", ")}</Text>
                      </div>
                    ) : (
                      <DropZone.FileUpload actionTitle={T.costs.quote.drop} actionHint={T.costs.quote.dropHint} />
                    )}
                  </DropZone>
                  <TextField label={T.costs.quote.pasteLabel} value={quoteText} onChange={setQuoteText} multiline={3} autoComplete="off" />
                  <InlineStack gap="300" blockAlign="center">
                    <Button
                      variant="primary"
                      disabled={!quoteBilder.length && !quoteText.trim()}
                      loading={quoteFetcher.state !== "idle"}
                      onClick={() =>
                        quoteFetcher.submit(
                          { intent: "quote-read", bilder: JSON.stringify(quoteBilder.map(({ mediaType, base64 }) => ({ mediaType, base64 }))), text: quoteText },
                          { method: "POST" },
                        )
                      }
                    >
                      {quoteFetcher.state !== "idle" ? T.costs.quote.reading : T.costs.quote.run}
                    </Button>
                    {quoteBilder.length ? <Button variant="plain" onClick={() => setQuoteBilder([])}>×</Button> : null}
                  </InlineStack>
                  {quoteData ? (
                    <Banner tone={quoteData.ok ? (quoteData.quote?.items.length ? "info" : "warning") : "critical"}>
                      <p>{quoteData.message}</p>
                      {quoteData.quote?.notes ? <p>{quoteData.quote.notes}</p> : null}
                    </Banner>
                  ) : null}
                  {quoteData?.quote?.items.length ? (
                    <BlockStack gap="300">
                      <div style={{ maxWidth: 260 }}>
                        <Select
                          label={T.costs.quote.currencyLabel}
                          options={offertValutor.map((c) => ({ label: c, value: c }))}
                          value={offertValuta}
                          onChange={setOffertValuta}
                          helpText={
                            quoteData.quote.detected
                              ? T.costs.quote.detected(quoteData.quote.detected)
                              : T.costs.quote.notDetected
                          }
                        />
                      </div>
                      <Text as="p" tone="subdued" variant="bodySm">{T.costs.bundle.explain}</Text>
                      <BlockStack gap="200">
                        {quoteData.quote.items.map((it, i) => (
                          <OffertRad
                            key={`${i}-${it.label}`}
                            it={it}
                            rows={rows}
                            T={T}
                            nf={nf}
                            currency={currency}
                            valuta={offertValuta}
                            kurs={offertKurs}
                          />
                        ))}
                      </BlockStack>
                    </BlockStack>
                  ) : null}
                </BlockStack>
              </Card>
            ) : null}

            {/* Uppskattning tills riktiga kostnader finns — ett klick. */}
            {missing > 0 || cogsEstimatePct ? (
              <Card background="bg-surface-secondary">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">{T.costs.estimate.title}</Text>
                  <Text as="p" tone="subdued">{T.costs.estimate.body}</Text>
                  {cogsEstimatePct ? (
                    <InlineStack gap="300" blockAlign="center" wrap>
                      <Badge tone="info">{`≈ ${T.costs.estimate.active(cogsEstimatePct)}`}</Badge>
                      <Button variant="plain" tone="critical" loading={estimateFetcher.state !== "idle"}
                        onClick={() => estimateFetcher.submit({ intent: "estimate", pct: "0" }, { method: "POST" })}>
                        {T.costs.estimate.off}
                      </Button>
                    </InlineStack>
                  ) : (
                    <InlineStack gap="200" wrap>
                      {[25, 35, 50].map((p) => (
                        <Button key={p} loading={estimateFetcher.state !== "idle"}
                          onClick={() => estimateFetcher.submit({ intent: "estimate", pct: String(p) }, { method: "POST" })}>
                          {`${T.costs.estimate.set} ${T.costs.estimate.option(p)}`}
                        </Button>
                      ))}
                    </InlineStack>
                  )}
                </BlockStack>
              </Card>
            ) : null}

            {/* Snabbfältet: skriv kostnaden per produkt, Enter sparar. */}
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">{T.costs.quick.title}</Text>
                <Text as="p" tone="subdued">{T.costs.quick.body}</Text>
                <BlockStack gap="200">
                  {produkter.map((grupp) => (
                    <Produktrad key={grupp[0].productGid} grupp={grupp} T={T} nf={nf} currency={currency} />
                  ))}
                </BlockStack>
              </BlockStack>
            </Card>

            <Button variant="plain" disclosure={visaImport ? "up" : "down"} onClick={() => setVisaImport((v) => !v)}>
              {visaImport ? T.costs.quick.hideAdvanced : T.costs.quick.advanced}
            </Button>

            {visaImport ? (
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd" id="import">
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
            ) : null}
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

type Rad = {
  productGid: string;
  variantGid: string;
  inventoryItemGid: string;
  productTitle: string;
  variantTitle: string;
  price: number;
  unitCost: number | null;
  /** Packpriser: totalkostnad för `units` stycken i samma orderrad. */
  tiers: { units: number; totalCost: number }[];
};

/** "1 st 88,34 kr · 2 st 134,22 kr totalt (67,11/st)" — vad appen räknar med. */
function stegText(
  unitCost: number | null,
  tiers: { units: number; totalCost: number }[],
  T: ReturnType<typeof t>,
  nf: Intl.NumberFormat,
  currency: string,
): string {
  if (!tiers.length) return "";
  return [
    ...(unitCost != null ? [T.costs.bundle.single(`${nf.format(unitCost)} ${currency}`)] : []),
    ...tiers.map((s) =>
      T.costs.bundle.line(s.units, `${nf.format(s.totalCost)} ${currency}`, `${nf.format(s.totalCost / s.units)} ${currency}`),
    ),
  ].join(" · ");
}

type OffertItem = {
  label: string;
  /** Pris för 1 st i OFFERTENS valuta — aldrig omräknat på servern. */
  unitCost: number;
  /** Packpriser i offertens valuta: totalpris för `units` stycken. */
  tiers: { units: number; total: number }[];
  moq: number;
  suggestedProduct: string;
  suggestedVariant: string;
};

/**
 * En rad ur offerten: priserna, produktval, variantval, "Lägg in".
 *
 * Omräkningen sker HÄR, med kursen för den valuta handlaren valt i kortet —
 * inte på servern. Då kan valutan bytas i en rullista och alla rader räknas
 * om direkt, utan att offerten måste läsas av AI:n en gång till.
 *
 * Flerpacken skrivs ut med både totalpris och styckpris, så det syns att
 * 2 st för 15 är 15 totalt och inte 2 × 10.
 */
function OffertRad({
  it, rows, T, nf, currency, valuta, kurs,
}: {
  it: OffertItem;
  rows: Rad[];
  T: ReturnType<typeof t>;
  nf: Intl.NumberFormat;
  currency: string;
  valuta: string;
  kurs: number | null;
}) {
  const fetcher = useFetcher<typeof action>();
  const produkter = (() => {
    const m = new Map<string, Rad[]>();
    for (const r of rows) (m.get(r.productGid) ?? m.set(r.productGid, []).get(r.productGid)!).push(r);
    return [...m.values()].sort((a, b) => a[0].productTitle.localeCompare(b[0].productTitle));
  })();
  const forslag = produkter.find((g) => g[0].productTitle.trim().toLowerCase() === it.suggestedProduct.trim().toLowerCase());
  const [productGid, setProductGid] = useState(forslag?.[0].productGid ?? "");
  const grupp = produkter.find((g) => g[0].productGid === productGid) ?? [];
  const forslagVariant = grupp.find((r) => r.variantTitle.trim().toLowerCase() === it.suggestedVariant.trim().toLowerCase());
  const [variantGid, setVariantGid] = useState(forslagVariant?.variantGid ?? "");
  const rund = (n: number) => Math.round(n * 100) / 100;
  const iButik = (n: number) => (kurs == null ? null : rund(n * kurs));
  /* Packpriserna normaliseras: ett steg utan antal (gammalt svarsformat) är
     inte tolkningsbart och släpps hellre än att gissa ett antal. */
  const steg = ((it.tiers ?? []) as unknown[])
    .map((s) => {
      const o = s as { units?: unknown; total?: unknown };
      return { units: Math.round(Number(o?.units) || 0), total: Number(o?.total) || 0 };
    })
    .filter((s) => s.units >= 2 && s.total > 0);
  const [kostnad, setKostnad] = useState(() => {
    const v = iButik(it.unitCost);
    return v == null ? "" : String(v);
  });
  /* Byter handlaren valuta i kortet ska beloppet följa med direkt. Ett
     handskrivet belopp skrivs över — det var skrivet i den gamla valutan. */
  useEffect(() => {
    const v = kurs == null ? null : rund(it.unitCost * kurs);
    setKostnad(v == null ? "" : String(v));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kurs, valuta]);
  const stegButik = kurs == null ? [] : steg.map((s) => ({ units: s.units, total: rund(s.total * kurs) }));
  const sparad = fetcher.data?.ok === true;

  /* Priserna som de STÅR i offerten: 1 st, sedan varje packpris med sitt
     styckpris inom parentes. Poängen är att 2 st för 15 ska läsas som 15
     totalt, inte som 2 × styckpriset. */
  const prisrader = [
    T.costs.bundle.single(`${nf.format(it.unitCost)} ${valuta}`),
    ...steg.map((s) =>
      T.costs.bundle.line(s.units, `${nf.format(s.total)} ${valuta}`, `${nf.format(s.total / s.units)} ${valuta}`),
    ),
  ].join(" · ");

  const mal = variantGid ? grupp.filter((r) => r.variantGid === variantGid) : grupp;
  const laggIn = () => {
    if (!mal.length || !kostnad.trim()) return;
    fetcher.submit(
      {
        intent: "quote-apply",
        cost: kostnad,
        inv: mal.map((r) => r.inventoryItemGid).join(","),
        variants: mal.map((r) => r.variantGid).join(","),
        tiers: stegButik.map((s) => `${s.units}:${s.total}`).join(","),
      },
      { method: "POST" },
    );
  };

  return (
    <div style={{ borderTop: "1px solid #e3e3e3", paddingTop: 8 }}>
      <BlockStack gap="150">
        <InlineStack gap="200" blockAlign="center" wrap>
          <Text as="span" fontWeight="semibold">{it.label}</Text>
          {it.moq ? <Badge>{T.costs.quote.moq(it.moq)}</Badge> : null}
          {steg.length ? <Badge tone="info">{T.costs.bundle.badge}</Badge> : null}
        </InlineStack>
        <Text as="p" tone="subdued" variant="bodySm">{prisrader}</Text>
        {kurs == null ? (
          <Text as="p" tone="critical" variant="bodySm">{T.costs.quote.noRate(valuta)}</Text>
        ) : kurs !== 1 ? (
          <Text as="p" tone="subdued" variant="bodySm">
            {T.costs.quote.converted(valuta, currency, kurs)}
            {stegButik.length
              ? ` · ${[T.costs.bundle.single(`${nf.format(rund(it.unitCost * kurs))} ${currency}`), ...stegButik.map((s) => T.costs.bundle.line(s.units, `${nf.format(s.total)} ${currency}`, `${nf.format(s.total / s.units)} ${currency}`))].join(" · ")}`
              : ""}
          </Text>
        ) : null}
        <InlineStack gap="200" blockAlign="end" wrap>
          <div style={{ flex: 2, minWidth: 220 }}>
            <Select
              label={T.costs.quote.product}
              options={[{ label: T.costs.quote.pick, value: "" }, ...produkter.map((g) => ({ label: g[0].productTitle, value: g[0].productGid }))]}
              value={productGid}
              onChange={(v) => { setProductGid(v); setVariantGid(""); }}
            />
          </div>
          {grupp.length > 1 ? (
            <div style={{ flex: 1, minWidth: 160 }}>
              <Select
                label={T.costs.quote.variant}
                options={[{ label: T.costs.quote.allVariants, value: "" }, ...grupp.map((r) => ({ label: r.variantTitle, value: r.variantGid }))]}
                value={variantGid}
                onChange={setVariantGid}
              />
            </div>
          ) : null}
          <div style={{ width: 140 }}>
            <TextField label={T.costs.thCost} value={kostnad} onChange={setKostnad} autoComplete="off" suffix={currency} />
          </div>
          <Button variant="primary" disabled={!mal.length || !kostnad.trim() || sparad} loading={fetcher.state !== "idle"} onClick={laggIn}>
            {sparad ? T.costs.quote.applied : T.costs.quote.apply}
          </Button>
          {fetcher.data && !fetcher.data.ok ? <Badge tone="critical">{fetcher.data.message}</Badge> : null}
        </InlineStack>
      </BlockStack>
    </div>
  );
}

/**
 * En produkt i snabbfältet. Ett fält på produktnivå som skriver samma kostnad
 * till alla varianter (så ser en leverantörsprislista oftast ut); "Sätt per
 * variant" fäller ut ett fält per variant. Enter eller lämna fältet sparar.
 */
function Produktrad({ grupp, T, nf, currency }: { grupp: Rad[]; T: ReturnType<typeof t>; nf: Intl.NumberFormat; currency: string }) {
  const fetcher = useFetcher<typeof action>();
  const [open, setOpen] = useState(false);
  const kostnader = grupp.map((r) => r.unitCost);
  const alla = kostnader.every((k) => k != null);
  const lika = alla && kostnader.every((k) => k === kostnader[0]);
  const saknas = kostnader.filter((k) => k == null).length;
  const [v, setV] = useState(lika && kostnader[0] != null ? String(kostnader[0]) : "");
  const [sparat, setSparat] = useState(false);

  const spara = (targets: string[], value: string) => {
    if (!value.trim()) return;
    fetcher.submit({ intent: "set-cost", cost: value, targets: targets.join(",") }, { method: "POST" });
    setSparat(true);
    setTimeout(() => setSparat(false), 2500);
  };
  const onKey = (targets: string[], value: string) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") spara(targets, value);
  };
  const p = grupp[0];
  const pris = grupp.length > 1 && grupp.some((r) => r.price !== p.price)
    ? `${nf.format(Math.min(...grupp.map((r) => r.price)))}–${nf.format(Math.max(...grupp.map((r) => r.price)))}`
    : nf.format(p.price);

  /* Packpriserna skrivs ut, annars är de osynliga tills man öppnar produkten
     — och då går det inte att se att appen VET att 2 st kostar 15 och inte
     2 × 10. Skiljer sig stegen mellan varianterna hänvisas till produkten. */
  const medSteg = grupp.filter((r) => r.tiers.length);
  const stegNyckel = (r: Rad) => r.tiers.map((s) => `${s.units}:${s.totalCost}`).join("|");
  const sammaSteg = medSteg.length === grupp.length && new Set(grupp.map(stegNyckel)).size === 1;
  const stegRad =
    medSteg.length === 0
      ? ""
      : sammaSteg
        ? stegText(p.unitCost, medSteg[0].tiers, T, nf, currency)
        : T.costs.bundle.perVariant(medSteg.length);

  return (
    <div style={{ borderBottom: "1px solid #e3e3e3", paddingBottom: 8 }}>
      <InlineStack gap="300" blockAlign="center" wrap>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Text as="span" fontWeight="semibold">{p.productTitle}</Text>
          <Text as="span" tone="subdued" variant="bodySm">{`  · ${pris} ${currency}${grupp.length > 1 ? ` · ${T.costs.quick.variants(grupp.length)}` : ""}`}</Text>
        </div>
        <div style={{ width: 150 }} onKeyDown={onKey(grupp.map((r) => r.inventoryItemGid), v)}>
          <TextField
            label={T.costs.thCost}
            labelHidden
            value={v}
            onChange={setV}
            onBlur={() => { if (v && String(kostnader[0] ?? "") !== v) spara(grupp.map((r) => r.inventoryItemGid), v); }}
            autoComplete="off"
            placeholder={!alla ? T.costs.quick.placeholder : !lika ? T.costs.quick.mixed : ""}
            suffix={currency}
            disabled={!lika && alla && !open}
          />
        </div>
        {saknas ? <Badge tone="critical">{T.costs.missingBadge}</Badge> : sparat || fetcher.state !== "idle" ? <Badge tone="success">{fetcher.state !== "idle" ? T.costs.quick.saving : T.costs.quick.saved}</Badge> : null}
        {grupp.length > 1 ? (
          <Button variant="plain" size="slim" onClick={() => setOpen((o) => !o)}>
            {open ? T.costs.quick.hideVariants : T.costs.quick.showVariants}
          </Button>
        ) : null}
        <Link to={`/app/costs/${p.productGid.split("/").pop()}`}><Text as="span" variant="bodySm">→</Text></Link>
      </InlineStack>
      {stegRad ? (
        <div style={{ paddingTop: 2 }}>
          <Badge tone="info">{T.costs.bundle.badge}</Badge>{" "}
          <Text as="span" tone="subdued" variant="bodySm">{stegRad}</Text>
        </div>
      ) : null}
      {open ? (
        <div style={{ paddingLeft: 16, paddingTop: 6 }}>
          <BlockStack gap="100">
            {grupp.map((r) => <Variantrad key={r.variantGid} r={r} T={T} currency={currency} nf={nf} />)}
          </BlockStack>
        </div>
      ) : null}
    </div>
  );
}

function Variantrad({ r, T, currency, nf }: { r: Rad; T: ReturnType<typeof t>; currency: string; nf: Intl.NumberFormat }) {
  const fetcher = useFetcher<typeof action>();
  const [v, setV] = useState(r.unitCost != null ? String(r.unitCost) : "");
  const spara = () => {
    if (!v.trim() || String(r.unitCost ?? "") === v) return;
    fetcher.submit({ intent: "set-cost", cost: v, targets: r.inventoryItemGid }, { method: "POST" });
  };
  const steg = stegText(r.unitCost, r.tiers, T, nf, currency);
  return (
    <BlockStack gap="100">
      <InlineStack gap="300" blockAlign="center" wrap>
        <div style={{ flex: 1, minWidth: 160 }}>
          <Text as="span" variant="bodySm">{r.variantTitle === "Default Title" ? "—" : r.variantTitle}</Text>
          <Text as="span" variant="bodySm" tone="subdued">{`  · ${nf.format(r.price)} ${currency}`}</Text>
        </div>
        <div style={{ width: 150 }} onKeyDown={(e) => { if (e.key === "Enter") spara(); }}>
          <TextField label={T.costs.thCost} labelHidden value={v} onChange={setV} onBlur={spara} autoComplete="off" placeholder={T.costs.quick.placeholder} suffix={currency} />
        </div>
        {r.unitCost == null && !v ? <Badge tone="critical">{T.costs.missingBadge}</Badge> : fetcher.state !== "idle" ? <Badge tone="success">{T.costs.quick.saving}</Badge> : null}
      </InlineStack>
      {steg ? <Text as="p" tone="subdued" variant="bodySm">{steg}</Text> : null}
    </BlockStack>
  );
}
