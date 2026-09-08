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

/** Idempotent upsert i batcher. Skriver aldrig något om listan är tom. */
export async function skrivKundOrdrar(shop: string, rader: KundOrderRad[]): Promise<void> {
  const STORLEK = 200;
  for (let i = 0; i < rader.length; i += STORLEK) {
    const del = rader.slice(i, i + STORLEK);
    await prisma.$transaction(
      del.map((r) =>
        prisma.kundOrder.upsert({
          where: { shop_orderId: { shop, orderId: r.orderId } },
          create: { shop, ...r },
          update: { kundHash: r.kundHash, dag: r.dag, netto: r.netto, tb: r.tb },
        }),
      ),
    );
  }
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
