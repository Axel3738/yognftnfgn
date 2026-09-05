/**
 * TILLFÄLLIG diagnosrutt. Tas bort när frågan är besvarad.
 *
 * Hämtar om butikens dagsrader för ett fönster (så att radantalen per
 * orderrad finns) och räknar COGS på två sätt: styck × antal (gamla sättet)
 * och med flerpackspriserna. Skillnaden är vad panelen räknade för högt.
 * Nyckelskyddad, ingen kunddata.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";
import { readDaily, refreshShopDaily, shiftIso } from "../lib/daily.server";
import { rowCost } from "../lib/pnl.server";
import { loadCatalog, applyCurrentCosts } from "../lib/shopify-data.server";
import { adminFromToken, giltigToken } from "../lib/daily.server";

const NYCKEL = "flp-Kd4mZ8qW1-tillfallig";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== NYCKEL) throw new Response("Not found", { status: 404 });
  const shop = url.searchParams.get("shop") ?? "";
  if (!/^[a-z0-9-]+\.myshopify\.com$/.test(shop)) return json({ error: "shop" }, { status: 400 });
  const days = Math.min(parseInt(url.searchParams.get("days") ?? "30", 10) || 30, 90);
  const to = new Date().toISOString().slice(0, 10);
  const from = shiftIso(to, -(days - 1));

  const refreshed = url.searchParams.get("refresh") === "1"
    ? await refreshShopDaily(shop, from, to, { force: true })
    : null;

  const token = await giltigToken(shop);
  if (!token) return json({ error: "ingen nyckel" }, { status: 400 });
  const admin = adminFromToken(shop, token) as any;
  const [daily, catalog, tiers] = await Promise.all([
    readDaily(shop, from, to),
    loadCatalog(admin, shop, prisma),
    prisma.costTier.findMany({ where: { shop } }),
  ]);
  const byVariant = new Map<string, { variantGid: string; units: number; totalCost: number }[]>();
  for (const t of tiers) {
    const l = byVariant.get(t.variantGid) ?? [];
    l.push({ variantGid: t.variantGid, units: t.units, totalCost: Number(t.totalCost) });
    byVariant.set(t.variantGid, l);
  }
  let flat = 0, tiered = 0, unitsWithLines = 0, unitsTotal = 0, multiLines = 0, lines = 0;
  const perProduct: Record<string, number> = {};
  for (const row of applyCurrentCosts(daily.products, catalog)) {
    unitsTotal += row.units;
    if (row.lines) {
      for (const [q, n] of Object.entries(row.lines)) {
        lines += n; unitsWithLines += Number(q) * n;
        if (Number(q) > 1) multiLines += n;
      }
    }
    if (row.unitCost == null) continue;
    const a = row.unitCost * row.units;
    const b = rowCost(row, row.unitCost, row.variantGid ? byVariant.get(row.variantGid) ?? [] : []);
    flat += a; tiered += b;
    if (a - b > 0.005) perProduct[row.title] = (perProduct[row.title] ?? 0) + (a - b);
  }
  return json({
    shop, from, to, refreshed, missingDays: daily.missingDays.length,
    orders: daily.sales.reduce((s, d) => s + d.orders, 0),
    unitsTotal, unitsWithLines, lines, multiLines,
    cogsFlat: Math.round(flat), cogsTiered: Math.round(tiered), saving: Math.round(flat - tiered),
    perProduct: Object.fromEntries(Object.entries(perProduct).sort((x, y) => y[1] - x[1]).map(([k, v]) => [k, Math.round(v)])),
  });
}
