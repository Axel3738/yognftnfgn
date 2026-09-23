/**
 * Chattbubblans server-sida. Resursrutt (ingen default-export): tar bara POST.
 *
 *   intent=ask    { messages: JSON [{role, content}] } → { answer, actions }
 *   intent=apply  { action: JSON set_cost }            → skriver via importCostCsv
 *
 * Kontexten byggs per fråga ur databasen (dagsrader, spend, fasta kostnader)
 * och katalogen — ingen ny Shopify-hämtning utöver katalogens cache, så
 * svaret kommer på sekunder även i en stor butik.
 */

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { loadCatalog } from "../lib/shopify-data.server";
import { kandaMarknader, readDaily, shiftIso } from "../lib/daily.server";
import { hemlandAv, marknadskod } from "../lib/marknad";
import { rowCost, type CostTierRow } from "../lib/pnl.server";
import { importCostCsv } from "../lib/cost-import.server";
import { rate as fxRate } from "../lib/fx.server";
import { lasPlan } from "../lib/plan.server";
import { actionTillCsv, svaraChatt, type ChattAction, type ChattKontext, type ChattMeddelande } from "../lib/ai-chat.server";
import { hamtaKoppling } from "../lib/ai-nyckel.server";
import { asLang, t } from "../lib/texts";

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const settings = await prisma.shopSettings.upsert({ where: { shop: session.shop }, create: { shop: session.shop }, update: {} });
  const lang = asLang(settings.language);
  const T = t(lang);
  /* Butikens egen Claude-nyckel när den kopplat en, annars serverns. */
  const koppling = await hamtaKoppling(session.shop, settings);
  if (!koppling.nyckel) return json({ ok: false, message: T.settings.claude.missing }, { status: 400 });
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "ask");

  if (intent === "apply") {
    let a: ChattAction | null = null;
    try {
      a = JSON.parse(String(form.get("action") ?? "null"));
    } catch {
      a = null;
    }
    if (!a || a.type !== "set_cost") return json({ ok: false, message: "invalid" }, { status: 400 });
    /* Marknad och valuta följer med från förslaget: "motorhöljet i Norge
       kostar 12 usd" ska bli samma sak som om det skrivits i rutan på
       Kostnader — inte en standardkostnad i fel valuta. */
    const market = marknadskod(a.market);
    const valuta = (a.currency ?? "").trim().toUpperCase();
    const butiksValuta = (settings.currency ?? "SEK").toUpperCase();
    let kurs = 1;
    if (valuta && valuta !== butiksValuta) {
      const k = await fxRate(valuta, butiksValuta);
      if (k == null) return json({ ok: false, message: T.costs.currency.noRate(valuta) }, { status: 502 });
      kurs = k;
    }
    const raknad: ChattAction = {
      ...a,
      cost: Math.round(a.cost * kurs * 100) / 100,
      tiers: (a.tiers ?? []).map((n) => Math.round(n * kurs * 100) / 100),
    };
    const res = await importCostCsv(admin, session.shop, prisma, actionTillCsv(raknad), market, T);
    return json({ ok: res.ok && res.applied.length > 0, message: res.applied.length ? T.chat.applied(res.applied.length) : T.chat.applyFailed(res.skipped.join(", ")) });
  }

  let historik: ChattMeddelande[] = [];
  try {
    historik = JSON.parse(String(form.get("messages") ?? "[]"));
  } catch {
    historik = [];
  }
  historik = historik
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!historik.length || historik[historik.length - 1].role !== "user") {
    return json({ ok: false, message: "invalid" }, { status: 400 });
  }

  try {
    const kontext = await byggKontext(admin, session.shop, settings);
    const svar = await svaraChatt({ historik, kontext, lang, apiKey: koppling.nyckel });
    return json({ ok: true, answer: svar.answer, actions: svar.actions });
  } catch (e) {
    console.error("Chatten misslyckades:", e);
    return json({ ok: false, message: T.chat.failed((e as Error).message) }, { status: 500 });
  }
}

/** Senaste 30 dagarna + katalogen. Bara läsning; inga nya Shopify-anrop utöver katalogcachen. */
async function byggKontext(admin: any, shop: string, settings: { currency: string; cogsEstimatePct: number | null }): Promise<ChattKontext> {
  const till = new Date().toISOString().slice(0, 10);
  const fran = shiftIso(till, -29);
  const [daglig, spend, fasta, tiers, katalog, plan, marknader] = await Promise.all([
    readDaily(shop, fran, till),
    prisma.dailySpend.aggregate({ where: { shop, day: { gte: new Date(fran), lte: new Date(till) } }, _sum: { spend: true }, _count: true }),
    prisma.fixedCost.findMany({ where: { shop } }),
    prisma.costTier.findMany({ where: { shop, market: "" } }),
    loadCatalog(admin, shop, prisma),
    lasPlan(admin, shop).catch(() => ({ plan: "okand" as const })),
    kandaMarknader(shop, hemlandAv(settings.currency)).catch(() => [] as string[]),
  ]);
  const tierRader: CostTierRow[] = tiers.map((x) => ({ variantGid: x.variantGid, units: x.units, totalCost: Number(x.totalCost) }));
  const kostnadFor = new Map(katalog.all.map((v) => [v.variantGid, v.unitCost]));
  let cogs = 0;
  let saknad = false;
  for (const p of daglig.products) {
    const uc = (p.variantGid ? kostnadFor.get(p.variantGid) : null) ?? p.unitCost;
    if (uc == null) {
      saknad = true;
      continue;
    }
    cogs += rowCost(p, uc, tierRader.filter((x) => x.variantGid === p.variantGid));
  }
  return {
    currency: settings.currency,
    fonster: `${fran} – ${till}`,
    nettoforsaljning: daglig.sales.reduce((s, d) => s + d.netSales, 0),
    ordrar: daglig.sales.reduce((s, d) => s + d.orders, 0),
    cogs: saknad ? null : cogs,
    annonskostnad: spend._count ? Number(spend._sum.spend ?? 0) : null,
    fastaPerManad: fasta.reduce((s, f) => s + Number(f.monthlyAmount), 0),
    fastaRader: fasta.map((f) => `${f.name} ${Math.round(Number(f.monthlyAmount))}`),
    varianterMedKostnad: katalog.all.filter((v) => v.unitCost != null).length,
    varianterTotalt: katalog.all.length,
    uppskattningPct: settings.cogsEstimatePct,
    flerpackSteg: tiers.length,
    plan: plan.plan,
    marknader,
    produkter: katalog.all.map((v) => ({ productTitle: v.productTitle, variantTitle: v.variantTitle, price: v.price, unitCost: v.unitCost })),
  };
}
