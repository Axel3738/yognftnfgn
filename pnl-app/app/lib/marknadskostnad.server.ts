/**
 * Kostnad per marknad — det som skiljer "vad varan kostar att få till Norge"
 * från standardkostnaden i Shopify.
 *
 * Standardkostnaden (marknad "") bor i Shopifys InventoryItem.unitCost och är
 * butikens egendom. En MARKNADSKOSTNAD kan Shopify inte hålla — där finns
 * bara ett tal per variant — så den bor uteslutande i CostChange/CostTier med
 * `market` satt, och räknemotorn föredrar den för rader sålda på den
 * marknaden (se resolveChange/tiersFor i pnl.server.ts).
 */

import prisma from "../db.server";
import { marknadskod } from "./marknad";

export interface Marknadskostnad {
  /** Gällande kostnad per variant-GID på marknaden. Saknas = ärver standard. */
  unitCost: Map<string, number>;
  /** Flerpacksteg per variant-GID på marknaden. */
  tiers: Map<string, { units: number; totalCost: number }[]>;
}

/**
 * Gällande marknadskostnad per variant: senaste effectiveFrom ≤ idag vinner,
 * variantspecifik slår produktbred. Bara poster med exakt den marknaden —
 * standardposter är Shopifys sak och läses ur katalogen.
 */
export async function lasMarknadskostnad(
  shop: string,
  market: string,
  varianter: { variantGid: string; productGid: string }[],
): Promise<Marknadskostnad> {
  const m = marknadskod(market);
  const ut: Marknadskostnad = { unitCost: new Map(), tiers: new Map() };
  if (!m) return ut;
  const idag = new Date().toISOString().slice(0, 10);
  const [poster, steg] = await Promise.all([
    prisma.costChange.findMany({
      where: { shop, market: m, effectiveFrom: { lte: new Date(idag) } },
      orderBy: { effectiveFrom: "desc" },
    }),
    prisma.costTier.findMany({ where: { shop, market: m }, orderBy: { units: "asc" } }),
  ]);
  for (const v of varianter) {
    const traff =
      poster.find((p) => p.variantGid === v.variantGid) ??
      poster.find((p) => p.variantGid == null && p.productGid === v.productGid);
    if (traff) ut.unitCost.set(v.variantGid, Number(traff.unitCost));
  }
  for (const s of steg) {
    const list = ut.tiers.get(s.variantGid) ?? [];
    list.push({ units: s.units, totalCost: Number(s.totalCost) });
    ut.tiers.set(s.variantGid, list);
  }
  return ut;
}

/**
 * Skriver en marknadskostnad för en eller flera varianter: en CostChange-post
 * per variant, daterad idag, och (om steg skickas) marknadens flerpacksteg
 * ersatta i sin helhet. Rör aldrig Shopify.
 */
export async function skrivMarknadskostnad(
  shop: string,
  market: string,
  mal: { variantGid: string; productGid: string }[],
  unitCost: number,
  tiers: { units: number; totalCost: number }[] | null,
  note: string,
  effectiveFrom?: string,
): Promise<void> {
  const m = marknadskod(market);
  if (!m || !mal.length) return;
  const datum = new Date(effectiveFrom || new Date().toISOString().slice(0, 10));
  const ops = [];
  for (const v of mal) {
    ops.push(
      prisma.costChange.create({
        data: { shop, productGid: v.productGid, variantGid: v.variantGid, unitCost, effectiveFrom: datum, note, market: m },
      }),
    );
    if (tiers) {
      ops.push(prisma.costTier.deleteMany({ where: { shop, variantGid: v.variantGid, market: m } }));
      if (tiers.length) {
        ops.push(
          prisma.costTier.createMany({
            data: tiers.map((t) => ({ shop, variantGid: v.variantGid, units: t.units, totalCost: t.totalCost, market: m })),
          }),
        );
      }
    }
  }
  await prisma.$transaction(ops);
}
