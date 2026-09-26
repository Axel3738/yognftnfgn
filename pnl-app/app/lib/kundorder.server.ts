/**
 * KundOrder — en rad per order med pseudonymiserad kund. Underlaget för
 * kundvärdet (LTV) och ny/återkommande.
 *
 * Skrivs av dagslagret (daily.server) i samma veva som dagsraderna, men BARA
 * när butikens scope innehåller read_customers — utan den finns inget
 * kundfält i orderfrågan, och då skrivs ingenting hit (aldrig gästordrar av
 * misstag för en butik som ännu inte gett behörigheten).
 *
 * Kund-ID lagras aldrig i klartext: `kundHash` (HMAC) räknas här, innan
 * något rör databasen. Bakfyllnaden ligger i kundorder-backfill.server.ts.
 */

import prisma from "../db.server";
import { kundHash } from "./crypto.server";
import { tierCost, type CostTierRow } from "./pnl.server";
import type { KundOrderRa } from "./shopify-data.server";
import { kundOrderErsattning } from "./returkoll";

/** Finns read_customers i en kommaseparerad scope-sträng? */
export function harKundScope(scope: string | null | undefined): boolean {
  return (scope ?? "").split(",").map((s) => s.trim()).includes("read_customers");
}

/** Butikens scope ur offline-sessionen. Null = ingen session. */
export async function butikensScope(shop: string): Promise<string | null> {
  const rad = await prisma.session.findFirst({ where: { shop, isOnline: false }, select: { scope: true } });
  return rad?.scope ?? null;
}

export interface KundOrderRad {
  orderId: string;
  kundHash: string | null;
  dag: string;
  netto: number;
  tb: number | null;
}

/**
 * Täckningsbidrag per order: netto − COGS (flerpack via stegpriser) − tull
 * per order − avgift på totalpriset. Saknar någon rad inköpspris blir tb
 * null — aldrig en gissning som ser ut som en siffra.
 */
export function raknaTb(
  o: KundOrderRa,
  tiers: CostTierRow[],
  settings: { tariffPerOrder: number; feeRate: number },
): number | null {
  let cogs = 0;
  for (const l of o.lines) {
    if (l.unitCost == null) return null;
    if (!(l.quantity > 0)) continue;
    const egna = l.variantGid ? tiers.filter((t) => t.variantGid === l.variantGid) : [];
    cogs += tierCost(l.quantity, l.unitCost, egna);
  }
  return o.netto - cogs - settings.tariffPerOrder - o.totalPrice * settings.feeRate;
}

/** Gör KundOrder-rader av hämtade ordrar. Hashar kunden, räknar tb. */
export function tillKundOrderRader(
  shop: string,
  ordrar: KundOrderRa[],
  tiers: CostTierRow[],
  settings: { tariffPerOrder: number; feeRate: number },
): KundOrderRad[] {
  return ordrar.map((o) => ({
    orderId: o.orderId,
    kundHash: kundHash(shop, o.customerGid),
    dag: o.dag,
    netto: o.netto,
    tb: raknaTb(o, tiers, settings),
  }));
}

/**
 * Ersätter butikens KundOrder-rader för ett hämtat fönster [fran, till]:
 * raderar fönstrets rader (och radernas order-ID var de än ligger) och skriver
 * de nya, allt i EN transaktion. Förut var det en upsert — en order som
 * avbokades efter att den cachades låg då kvar med sitt gamla netto i
 * kohorterna och i CAC för alltid. Planen (vad som raderas, bitarna) byggs i
 * `kundOrderErsattning` i returkoll.ts, där den är testad.
 *
 * Anropas bara efter en LYCKAD hämtning — kastade den kom vi aldrig hit, och
 * ingenting raderas. En tom lista raderar fönstret: det är rätt, för en tom
 * lyckad hämtning betyder att fönstret inte har några räknade ordrar kvar.
 */
export async function ersattKundOrdrar(shop: string, fran: string, till: string, rader: KundOrderRad[]): Promise<void> {
  const plan = kundOrderErsattning(shop, fran, till, rader);
  await prisma.$transaction([
    prisma.kundOrder.deleteMany({ where: { shop, dag: { gte: plan.fran, lte: plan.till } } }),
    ...plan.orderIdBitar.map((ids) => prisma.kundOrder.deleteMany({ where: { shop, orderId: { in: ids } } })),
    ...plan.bitar.map((data) => prisma.kundOrder.createMany({ data })),
  ]);
}

export interface KundOrderLasning {
  orders: { kundHash: string | null; dag: string; netto: number; tb: number | null }[];
  forstaDag: string | null;
  sistaDag: string | null;
  antal: number;
}

/** Hela underlaget för butiken. Tusentals rader per år — ryms i minnet. */
export async function lasKundOrdrar(shop: string): Promise<KundOrderLasning> {
  const rows = await prisma.kundOrder.findMany({
    where: { shop },
    select: { kundHash: true, dag: true, netto: true, tb: true },
    orderBy: { dag: "asc" },
  });
  return {
    orders: rows,
    forstaDag: rows[0]?.dag ?? null,
    sistaDag: rows[rows.length - 1]?.dag ?? null,
    antal: rows.length,
  };
}

/**
 * Antal kunder vars FÖRSTA order (över hela historiken) föll på respektive
 * dag i fönstret — "nya kunder", nämnaren i CPA per ny kund.
 */
export async function nyaKunderPerDag(shop: string, from: string, to: string): Promise<Record<string, number>> {
  const forsta = await prisma.kundOrder.groupBy({
    by: ["kundHash"],
    where: { shop, kundHash: { not: null } },
    _min: { dag: true },
  });
  const ut: Record<string, number> = {};
  for (const f of forsta) {
    const d = f._min.dag;
    if (d && d >= from && d <= to) ut[d] = (ut[d] ?? 0) + 1;
  }
  return ut;
}
