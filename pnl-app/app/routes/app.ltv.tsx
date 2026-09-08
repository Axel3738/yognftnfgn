/**
 * Kundvärde (LTV) — Pro-fliken.
 *
 * Låst bakom planen "Pro" under Shopify App Pricing (plan.server.ts). Egna
 * butiker och custom-tjänster ser den direkt. På Standard visas mognads-
 * mätaren och återköpsgraden, så handlaren ser att datan finns innan hen
 * betalar — kurva, kohorttabell och LTV-baserad max-CPA är Pro.
 *
 * Underlaget är KundOrder (skrivs av dagslagret). Saknas historik startas
 * bakfyllnaden i bakgrunden — sidan väntar aldrig på Shopify.
 */

import { Suspense, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { defer, json } from "@remix-run/node";
import { Await, Link, useFetcher, useLoaderData } from "@remix-run/react";
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
  ProgressBar,
  Select,
  Spinner,
  Text,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { dayInTz, fetchShopInfo } from "../lib/shopify-data.server";
import { computeLtv, type LtvResult } from "../lib/ltv.server";
import { HORISONTER, STANDARD_HORISONT, MIN_KOHORT, type Horisont } from "../lib/ltv-konstanter";
import { butikensScope, harKundScope, lasKundOrdrar, nyaKunderPerDag } from "../lib/kundorder.server";
import { backfillPagar, startaBackfill } from "../lib/kundorder-backfill.server";
import { lasPlan, planvalsUrl, type PlanLasning } from "../lib/plan.server";
import { evaluateTips, type Tip } from "../lib/tips.server";
import { asLang, localeOf, t, type Lang } from "../lib/texts";

const shiftIso = (iso: string, days: number) => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

interface Sida {
  fatal: string | null;
  lang: Lang;
  currency: string;
  plan: PlanLasning;
  upgradeUrl: string;
  horizon: Horisont;
  result: LtvResult | null;
  cpaNew: number | null;
  spend30: number | null;
  newCustomers30: number;
  aov30: number | null;
  tackning: { antal: number; backfillAt: string | null; backfillError: string | null; pagar: boolean; scopeOk: boolean };
  tips: Tip[];
}

async function laddaSida(admin: any, shop: string, url: URL): Promise<Sida> {
  const settings = await prisma.shopSettings.upsert({ where: { shop }, create: { shop }, update: {} });
  const lang = asLang(settings.language);
  const horizon = (HORISONTER as readonly number[]).includes(settings.ltvHorizon ?? -1)
    ? (settings.ltvHorizon as Horisont)
    : STANDARD_HORISONT;
  const tvinga = url.searchParams.get("refresh") === "1";
  const upgradeUrl = planvalsUrl(shop);
  try {
    const plan = await lasPlan(admin, shop, { tvinga });

    let tz = settings.timezone ?? null;
    if (!tz) {
      try { tz = (await fetchShopInfo(admin)).timezone; } catch { tz = "UTC"; }
    }
    const today = dayInTz(new Date(), tz);

    const scope = await butikensScope(shop);
    const scopeOk = harKundScope(scope);
    const lasning = await lasKundOrdrar(shop);

    /* Historik saknas eller är tunn: starta bakfyllnaden i bakgrunden. Den
       vägrar själv om scopen saknas och skriver orsaken på butiken. */
    const pagar = backfillPagar(shop);
    const behovs = lasning.antal < 50 || !settings.kundOrderBackfillAt;
    if (scopeOk && behovs && !pagar && (tvinga || !settings.kundOrderBackfillError || settings.kundOrderBackfillError === "scope:read_customers")) {
      startaBackfill(shop, 400);
    }

    const result = computeLtv({ orders: lasning.orders, today, targetMargin: Number(settings.targetMargin) });

    /* CPA per ny kund senaste 30 dagarna: annonskostnad (DailySpend.spend är
       redan i butikens valuta) delat på kunder vars första order föll i
       fönstret. Utan annonskostnad visas "—", aldrig en CPA på noll. */
    const from30 = shiftIso(today, -29);
    const [spendRows, nya, ordrar30] = await Promise.all([
      prisma.dailySpend.findMany({ where: { shop, day: { gte: new Date(from30), lte: new Date(today) } }, select: { spend: true } }),
      nyaKunderPerDag(shop, from30, today),
      prisma.kundOrder.findMany({ where: { shop, dag: { gte: from30, lte: today } }, select: { netto: true } }),
    ]);
    const spend30 = spendRows.length ? spendRows.reduce((a, r) => a + Number(r.spend), 0) : null;
    const newCustomers30 = Object.values(nya).reduce((a, b) => a + b, 0);
    const cpaNew = spend30 != null && spend30 > 0 && newCustomers30 > 0 ? spend30 / newCustomers30 : null;
    const aov30 = ordrar30.length ? ordrar30.reduce((a, r) => a + r.netto, 0) / ordrar30.length : null;

    const mc = result.maxCpa[horizon];
    const tips = evaluateTips(
      {
        repeat_rate: result.aterkopsgrad ?? undefined,
        customers: result.totalKunder,
        cohort_customers: result.pool[horizon]?.kunder,
        ltv_60: result.maxCpa[60]?.ltv.mid,
        ltv_90: result.maxCpa[90]?.ltv.mid,
        ltv_180: result.maxCpa[180]?.ltv.mid,
        aov: aov30 ?? undefined,
        cpa_new: cpaNew ?? undefined,
        max_cpa: mc?.maxCpa.mid,
        new_customers: newCustomers30,
        days: 30,
      },
      lang,
    );

    return {
      fatal: null,
      lang,
      currency: settings.currency,
      plan,
      upgradeUrl,
      horizon,
      result,
      cpaNew,
      spend30,
      newCustomers30,
      aov30,
      tackning: {
        antal: lasning.antal,
        backfillAt: settings.kundOrderBackfillAt?.toISOString() ?? null,
        backfillError: settings.kundOrderBackfillError ?? null,
        pagar: pagar || (scopeOk && behovs && !settings.kundOrderBackfillError),
        scopeOk,
      },
      tips,
    };
  } catch (e) {
    console.error("Loader-fel /app/ltv:", e);
    return {
      fatal: e instanceof Error ? e.message : String(e),
      lang,
      currency: settings.currency,
      plan: { plan: "okand", kalla: "fel", checkedAt: null },
      upgradeUrl,
      horizon,
      result: null,
      cpaNew: null,
      spend30: null,
      newCustomers30: 0,
      aov30: null,
      tackning: { antal: 0, backfillAt: null, backfillError: null, pagar: false, scopeOk: false },
      tips: [],
    };
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const settings = await prisma.shopSettings.findUnique({ where: { shop: session.shop }, select: { language: true } });
  return defer({ lang: asLang(settings?.language), sida: laddaSida(admin, session.shop, url) });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  if (String(form.get("intent")) === "horizon") {
    const h = Number(form.get("horizon"));
    if ((HORISONTER as readonly number[]).includes(h)) {
      await prisma.shopSettings.update({ where: { shop: session.shop }, data: { ltvHorizon: h } });
    }
  }
  return json({ ok: true });
}

export default function Ltv() {
  const { lang, sida } = useLoaderData<typeof loader>();
  const T = t(lang);
  return (
    <Suspense
      fallback={
        <Page title={T.ltv.title}>
          <Card>
            <BlockStack gap="300" inlineAlign="center">
              <Spinner size="large" />
              <Text as="p" tone="subdued">{T.ltv.loading}</Text>
            </BlockStack>
          </Card>
        </Page>
      }
    >
      <Await resolve={sida}>{(s) => <LtvVy s={s as unknown as Sida} />}</Await>
    </Suspense>
  );
}

function LtvVy({ s }: { s: Sida }) {
  const T = t(s.lang);
  const fetcher = useFetcher<typeof action>();
  const [h, setH] = useState<Horisont>(s.horizon);
  const nf0 = new Intl.NumberFormat(localeOf(s.lang), { maximumFractionDigits: 0 });
  const money = (v: number | null | undefined) => (v == null || !Number.isFinite(v) ? "—" : `${nf0.format(Math.round(v))} ${s.currency}`);
  const pct = (v: number | null | undefined) => (v == null ? "—" : `${(v * 100).toFixed(0)} %`);

  if (s.fatal || !s.result) {
    return (
      <Page title={T.ltv.title}>
        <Banner tone="critical" title={T.ltv.fatalTitle}>
          <p style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{s.fatal}</p>
        </Banner>
      </Page>
    );
  }
  const r = s.result;
  const pro = s.plan.plan === "pro";
  const pool = r.pool[s.horizon];
  const mc = r.maxCpa[s.horizon];

  /* Datakvalitetsraden. */
  const dataRad = (
    <Card>
      <BlockStack gap="200">
        <Text as="h2" variant="headingMd">{T.ltv.dataTitle}</Text>
        {!s.tackning.scopeOk ? <Banner tone="warning">{T.ltv.scopeMissing}</Banner> : null}
        {s.tackning.backfillError && s.tackning.backfillError !== "scope:read_customers" ? (
          <Banner tone="critical">{T.ltv.backfillError(s.tackning.backfillError)}</Banner>
        ) : null}
        <Text as="p" tone="subdued">
          {r.dataFrom && r.dataTo ? T.ltv.dataRange(r.dataFrom, r.dataTo) : T.ltv.dataNone}{" "}
          {r.totalOrdrar ? T.ltv.guestShare(pct(r.guestShare)) : ""} {T.ltv.refundNote}
        </Text>
        <Text as="p" tone="subdued">
          {s.tackning.pagar
            ? T.ltv.backfillRunning
            : s.tackning.backfillAt
              ? T.ltv.backfillDone(new Date(s.tackning.backfillAt).toLocaleString(localeOf(s.lang)))
              : ""}
        </Text>
      </BlockStack>
    </Card>
  );

  /* Mognadsmätaren — visas för alla planer. */
  const mognad = (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingMd">{T.ltv.maturityTitle}</Text>
        <Text as="p" tone="subdued">{T.ltv.maturityBody}</Text>
        {HORISONTER.map((hh) => {
          const p = r.pool[hh];
          const delar = [
            [p.saknas.kohorter, T.ltv.needCohorts] as const,
            [p.saknas.kunder, T.ltv.needCustomers] as const,
            [p.saknas.aterkop, T.ltv.needRepeats] as const,
          ];
          const andel = Math.min(1, ...delar.map(([[have, need]]) => (need ? have / need : 1)));
          const historikKort = r.dataFrom != null && r.today != null && daysBetween(r.dataFrom, r.today) < hh;
          return (
            <BlockStack key={hh} gap="100">
              <InlineStack align="space-between">
                <Text as="span" fontWeight="semibold">{T.ltv.daysUnit(hh)}</Text>
                <Badge tone={p.ok ? "success" : "attention"}>{p.ok ? `✓ ${T.ltv.ready}` : `${Math.round(andel * 100)} %`}</Badge>
              </InlineStack>
              <ProgressBar progress={Math.round(andel * 100)} size="small" tone={p.ok ? "success" : "primary"} />
              <Text as="span" variant="bodySm" tone="subdued">
                {delar.map(([[have, need], f]) => f(have, need)).join(" · ")}
                {historikKort && !p.ok ? ` · ${T.ltv.needHistory(hh)}` : ""}
              </Text>
            </BlockStack>
          );
        })}
      </BlockStack>
    </Card>
  );

  const aterkop = (
    <Card>
      <BlockStack gap="100">
        <Text as="span" variant="bodySm" tone="subdued">{T.ltv.kpiRepeat}</Text>
        <Text as="p" variant="headingLg">{pct(r.aterkopsgrad)}</Text>
        <Text as="span" variant="bodySm" tone="subdued">{`${T.ltv.kpiRepeatSub} · ${nf0.format(r.totalKunder)}`}</Text>
      </BlockStack>
    </Card>
  );

  if (!pro) {
    return (
      <Page title={T.ltv.title}>
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              {s.plan.plan === "okand" ? (
                <Banner tone="warning" title={T.ltv.planUnknownTitle}>
                  {T.ltv.planUnknownBody(s.plan.fel ?? "?")}
                </Banner>
              ) : null}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">{T.ltv.lockedTitle}</Text>
                  <Text as="p">{T.ltv.lockedBody}</Text>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {T.ltv.lockedBullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                  <InlineStack gap="300" blockAlign="center" wrap>
                    <Button variant="primary" url={s.upgradeUrl} target="_top" external>{T.ltv.upgrade}</Button>
                    <Link to="/app/ltv?refresh=1"><Text as="span">{T.ltv.refreshPlan}</Text></Link>
                    <Text as="span" tone="subdued" variant="bodySm">{T.ltv.upgradeHint}</Text>
                  </InlineStack>
                  <Text as="p" tone="subdued" variant="bodySm">{T.ltv.standardPreview}</Text>
                </BlockStack>
              </Card>
              {dataRad}
              <InlineGrid columns={{ xs: 1, md: 2 }} gap="300">
                {aterkop}
                {mognad}
              </InlineGrid>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  /* --- Pro --- */
  const iv = (x: { mid: number; low: number; high: number } | null | undefined) =>
    x ? `${money(x.mid)} (${T.ltv.range(nf0.format(Math.round(x.low)), nf0.format(Math.round(x.high)))})` : "—";
  const verdikt = !mc
    ? T.ltv.notEnough
    : s.cpaNew == null
      ? T.ltv.verdictNoCpa
      : s.cpaNew <= mc.maxCpa.mid
        ? T.ltv.verdictUnder(money(s.cpaNew), money(mc.maxCpa.mid), s.horizon)
        : T.ltv.verdictOver(money(s.cpaNew), money(mc.maxCpa.mid), s.horizon);

  const kurvMax = Math.max(1, ...HORISONTER.map((hh) => r.maxCpa[hh]?.ltv.high ?? r.pool[hh].aov1 ?? 0));

  return (
    <Page title={T.ltv.title} subtitle={T.ltv.subtitle(r.totalKunder, r.totalOrdrar)}>
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {dataRad}

            <InlineGrid columns={{ xs: 1, md: 3 }} gap="300">
              <Kpi label={T.ltv.kpiLtv(s.horizon)} value={mc ? money(mc.ltv.mid) : "—"} sub={mc ? `${T.ltv.range(money(mc.ltv.low), money(mc.ltv.high))} · ${T.ltv.confidence[mc.konfidens]}` : T.ltv.notEnough} />
              <Kpi
                label={T.ltv.kpiMaxCpa(s.horizon)}
                value={mc && mc.konfidens !== "hidden" ? money(mc.maxCpa.mid) : "—"}
                sub={mc ? `${T.ltv.range(money(mc.maxCpa.low), money(mc.maxCpa.high))} · ${T.ltv.firstOrderMaxCpa(money(mc.firstOrderMaxCpa))}` : T.ltv.notEnough}
                tone={mc && s.cpaNew != null ? (s.cpaNew <= mc.maxCpa.mid ? "success" : "critical") : undefined}
              />
              <Kpi label={T.ltv.kpiCpaNew} value={money(s.cpaNew)} sub={`${money(s.spend30)} / ${nf0.format(s.newCustomers30)}`} />
            </InlineGrid>
            <Banner tone={!mc ? "info" : s.cpaNew == null ? "info" : s.cpaNew <= mc.maxCpa.mid ? "success" : "critical"}>{verdikt}</Banner>

            {s.tips.length ? (
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">{T.tips.title}</Text>
                  <Text as="p" tone="subdued" variant="bodySm">{T.tips.intro}</Text>
                  {s.tips.map((tip) => (
                    <InlineStack key={tip.id} gap="200" blockAlign="start" wrap={false}>
                      <Badge tone={tip.severity === "critical" ? "critical" : tip.severity === "warning" ? "attention" : tip.severity === "good" ? "success" : "info"}>
                        {T.tips.severity[tip.severity]}
                      </Badge>
                      <BlockStack gap="050">
                        <Text as="span">{tip.text}</Text>
                        <Text as="span" variant="bodySm" tone="subdued">{`${T.tips.source}: ${tip.source}`}</Text>
                      </BlockStack>
                    </InlineStack>
                  ))}
                </BlockStack>
              </Card>
            ) : null}

            <InlineGrid columns={{ xs: 1, md: 2 }} gap="300">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">{T.ltv.curveTitle}</Text>
                  <Text as="p" tone="subdued" variant="bodySm">{T.ltv.curveBody}</Text>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 170, paddingTop: 8 }}>
                    {HORISONTER.map((hh) => {
                      const m = r.maxCpa[hh];
                      const ltv = m?.ltv.mid ?? null;
                      const tb = m?.breakEven.mid ?? null;
                      return (
                        <div key={hh} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 11 }}>{ltv == null ? "—" : nf0.format(ltv)}</span>
                          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", width: "100%", height: 120 }}>
                            <div title={`${T.ltv.curveRevenue}: ${money(ltv)}`} style={{ flex: 1, height: ltv == null ? 2 : Math.max(2, (ltv / kurvMax) * 120), background: ltv == null ? "#e3e3e3" : "#005bd3", borderRadius: 3 }} />
                            <div title={`${T.ltv.curveTb}: ${money(tb)}`} style={{ flex: 1, height: tb == null ? 2 : Math.max(2, (Math.max(0, tb) / kurvMax) * 120), background: tb == null ? "#e3e3e3" : "repeating-linear-gradient(45deg,#1f8a4c 0 4px,#7dcf9a 4px 8px)", borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: "#616161" }}>{T.ltv.daysUnit(hh)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <InlineStack gap="200">
                    <Badge tone="info">{`■ ${T.ltv.curveRevenue}`}</Badge>
                    <Badge tone="success">{`▨ ${T.ltv.curveTb}`}</Badge>
                  </InlineStack>
                  {pool.ok ? (
                    <Text as="p" variant="bodySm" tone="subdued">{T.ltv.borrowedNote(pool.kohorter, pool.kunder, s.horizon)}</Text>
                  ) : null}
                </BlockStack>
              </Card>
              <BlockStack gap="300">
                {mognad}
                <Card>
                  <BlockStack gap="200">
                    <Select
                      label={T.ltv.horizonLabel}
                      options={HORISONTER.map((hh) => ({ label: T.ltv.daysUnit(hh), value: String(hh) }))}
                      value={String(h)}
                      onChange={(v) => setH(Number(v) as Horisont)}
                      helpText={T.ltv.horizonHelp}
                    />
                    <InlineStack gap="200" blockAlign="center">
                      <Button
                        loading={fetcher.state !== "idle"}
                        disabled={h === s.horizon}
                        onClick={() => fetcher.submit({ intent: "horizon", horizon: String(h) }, { method: "POST" })}
                      >
                        {T.ltv.saveHorizon}
                      </Button>
                      {fetcher.data?.ok && h === s.horizon ? <Text as="span" tone="subdued">{T.ltv.saved}</Text> : null}
                    </InlineStack>
                  </BlockStack>
                </Card>
              </BlockStack>
            </InlineGrid>

            <Card padding="0">
              <DataTable
                columnContentTypes={["text", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric", "numeric"]}
                headings={[
                  T.ltv.thCohort, T.ltv.thCustomers, T.ltv.thAov1,
                  T.ltv.thRepeat(30), T.ltv.thRepeat(60), T.ltv.thRepeat(90), T.ltv.thRepeat(180),
                  T.ltv.thLtv(30), T.ltv.thLtv(90), T.ltv.thLtv(180), T.ltv.thLtvTb(s.horizon),
                ]}
                rows={r.kohorter.map((k) => {
                  if (k.tooSmall) {
                    return [k.manad, <Badge key={k.manad} tone="attention">{T.ltv.tooSmall(k.n)}</Badge>, "—", "—", "—", "—", "—", "—", "—", "—", "—"];
                  }
                  const cell = (hh: Horisont, f: (x: number) => string) => {
                    const v = k.perH[hh];
                    if (!v.ltv) return "—";
                    return v.est ? <em key={`ltv${k.manad}${hh}`}>{`${f(v.ltv.mid)} ${T.ltv.curveEst}`}</em> : f(v.ltv.mid);
                  };
                  const rep = (hh: Horisont) => {
                    const v = k.perH[hh];
                    if (!v.R) return "—";
                    return v.est ? <em key={`${k.manad}${hh}`}>{`${pct(v.R.mid)} ${T.ltv.curveEst}`}</em> : pct(v.R.mid);
                  };
                  const tbv = k.perH[s.horizon];
                  return [
                    k.manad,
                    nf0.format(k.n),
                    money(k.aov1),
                    rep(30), rep(60), rep(90), rep(180),
                    cell(30, money), cell(90, money), cell(180, money),
                    tbv.ltvTb ? (tbv.est ? <em key={`tb${k.manad}`}>{`${money(tbv.ltvTb.mid)} ${T.ltv.curveEst}`}</em> : money(tbv.ltvTb.mid)) : "—",
                  ];
                })}
              />
            </Card>
            <Text as="p" variant="bodySm" tone="subdued">{T.ltv.tableNote}</Text>
            {r.kohorter.some((k) => k.tb1Saknas > 0) ? (
              <Text as="p" variant="bodySm" tone="subdued">
                {T.ltv.tbMissing(pct(Math.max(...r.kohorter.map((k) => k.tb1Saknas))))}
              </Text>
            ) : null}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
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
