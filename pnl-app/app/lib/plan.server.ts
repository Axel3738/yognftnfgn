/**
 * Vilken plan har butiken? — under Shopify App Pricing (managed pricing).
 *
 * Billing API är förbjudet för StonePNL (det gav 403-sagan i augusti), men
 * AVLÄSNING via Admin GraphQL är tillåten: currentAppInstallation.
 * activeSubscriptions. Bibliotekets billing.check() används INTE — den
 * filtrerar på plannamnen i shopify.server.ts och test-flaggan och säger
 * tyst "ingen plan" när något inte matchar.
 *
 * Regler (docs/ltv-tillagg.md avsnitt 1):
 * - Tjänster utan PLAN_GATE=1 (egna butiker) och undantagna butiker är "pro"
 *   utan något anrop.
 * - Svaret cachas på ShopSettings.plan/planCheckedAt och kontrolleras högst
 *   var 10:e minut. Aldrig blockerande — utom när handlaren själv trycker
 *   "Jag har uppgraderat — läs om" (tvinga).
 * - Fel ⇒ behåll det cachade värdet, markera källan "fel", logga råsvaret.
 *
 * ⚠ Oprövat skarpt: vad StonePNL:s registrering svarar i activeSubscriptions
 * under App Pricing (kan vara tomt — då är Partner API nästa väg). Därför
 * loggas råsvaret vid varje API-avläsning tills det är bekräftat.
 */

import prisma from "../db.server";
import { billingExemptShops } from "../shopify.server";

/**
 * Grinden slås på per tjänst med PLAN_GATE=1 — bara på App Store-tjänsten.
 * BILLING_ENABLED duger inte som signal: den togs bort från StonePNL när
 * managed pricing infördes (Billing API är förbjudet där), och de fem egna
 * butikerna har den aldrig haft. Utan PLAN_GATE är alla butiker "pro" —
 * ingen betalvägg av misstag på egna butiker, och ingen låst sida för
 * externa handlare förrän Axel medvetet slagit på grinden.
 */
export const planGateEnabled = process.env.PLAN_GATE === "1";

export type Plan = "standard" | "pro" | "okand";
export type PlanKalla = "exempt" | "cache" | "api" | "fel";

export interface PlanLasning {
  plan: Plan;
  kalla: PlanKalla;
  checkedAt: Date | null;
  fel?: string;
}

const OMKOLL_MS = 10 * 60 * 1000;

/** Plannamn som räknas som Pro: allt som innehåller "pro", plus env-listan. */
function arPro(namn: string): boolean {
  const extra = (process.env.PRO_PLAN_NAMES ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const n = namn.trim().toLowerCase();
  return /\bpro\b/.test(n) || extra.includes(n);
}

export async function lasPlan(
  admin: { graphql: (q: string, opts?: any) => Promise<Response> },
  shop: string,
  opts: { tvinga?: boolean } = {},
): Promise<PlanLasning> {
  if (!planGateEnabled || billingExemptShops.has(shop.toLowerCase())) {
    return { plan: "pro", kalla: "exempt", checkedAt: null };
  }
  const s = await prisma.shopSettings.findUnique({ where: { shop }, select: { plan: true, planCheckedAt: true } });
  const cachad: Plan = s?.plan === "pro" ? "pro" : s?.plan === "standard" ? "standard" : "okand";
  const farsk = s?.planCheckedAt && Date.now() - s.planCheckedAt.getTime() < OMKOLL_MS;
  if (!opts.tvinga && farsk) return { plan: cachad, kalla: "cache", checkedAt: s!.planCheckedAt };

  try {
    const res = await admin.graphql(`#graphql
      { currentAppInstallation { activeSubscriptions { id name status test } } }`);
    const body: any = await res.json();
    if (body?.errors?.length) throw new Error(body.errors.map((e: any) => e?.message).join("; "));
    const subs: { name?: string; status?: string; test?: boolean }[] =
      body?.data?.currentAppInstallation?.activeSubscriptions ?? [];
    console.log(`Planavläsning för ${shop}: ${JSON.stringify(subs)}`);
    const aktiva = subs.filter((x) => x.status === "ACTIVE");
    const plan: Plan = aktiva.some((x) => arPro(x.name ?? "")) ? "pro" : "standard";
    const now = new Date();
    await prisma.shopSettings.updateMany({ where: { shop }, data: { plan, planCheckedAt: now } });
    return { plan, kalla: "api", checkedAt: now };
  } catch (e) {
    const fel = (e as Error).message ?? String(e);
    console.error(`Planavläsning misslyckades för ${shop}:`, fel);
    /* Stämpla tiden även vid fel, annars ringer varje sidladdning Shopify
       igen tills det lyckas — och en butik med API-strul får en långsam app. */
    await prisma.shopSettings.updateMany({ where: { shop }, data: { planCheckedAt: new Date() } }).catch(() => {});
    return { plan: cachad, kalla: "fel", checkedAt: s?.planCheckedAt ?? null, fel };
  }
}

/** Shopifys planvalssida för butiken — öppnas i toppfönstret, inte i ramen. */
export function planvalsUrl(shop: string): string {
  const handle = shop.replace(/\.myshopify\.com$/i, "");
  const appHandle = process.env.APP_HANDLE?.trim() || "stonepnl";
  return `https://admin.shopify.com/store/${encodeURIComponent(handle)}/charges/${encodeURIComponent(appHandle)}/pricing_plans`;
}
