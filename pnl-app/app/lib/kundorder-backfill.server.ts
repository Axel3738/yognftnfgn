/**
 * Bakfyllnad av KundOrder: hämtar orderhistoriken bakåt i fönster om 30
 * dagar med butikens egen offline-nyckel och skriver KundOrder-raderna via
 * samma väg som dagslagret (refreshDaily), så tb räknas likadant.
 *
 * Bakgrund, aldrig awaitad av en sida. En körning per butik åt gången.
 * Går scopen inte att bevisa (read_customers saknas) görs INGET anrop —
 * felet skrivs i klartext på ShopSettings så sidan kan visa varför.
 *
 * Skopet begränsar hur långt bakåt: utan read_all_orders ger Shopify bara
 * 60 dagar, och frågan för äldre fönster kommer tillbaka tom — inte fel.
 * Därför slutar loopen när ett fönster ger noll ordrar två gånger i rad.
 */

import prisma from "../db.server";
import { adminFromToken, giltigToken, refreshDaily, shiftIso } from "./daily.server";
import { butikensScope, harKundScope } from "./kundorder.server";
import { dayInTz } from "./shopify-data.server";

const pagar = new Set<string>();
export const backfillPagar = (shop: string): boolean => pagar.has(shop);

const FONSTER = 30;

export function startaBackfill(shop: string, dagar: number): void {
  if (pagar.has(shop)) return;
  pagar.add(shop);
  void kor(shop, dagar)
    .catch((e) => console.error(`KundOrder-bakfyllnad för ${shop} misslyckades:`, e))
    .finally(() => pagar.delete(shop));
}

async function satt(shop: string, data: { kundOrderBackfillAt?: Date; kundOrderBackfillError?: string | null }) {
  await prisma.shopSettings.updateMany({ where: { shop }, data });
}

async function kor(shop: string, dagar: number): Promise<void> {
  const scope = await butikensScope(shop);
  if (!harKundScope(scope)) {
    await satt(shop, { kundOrderBackfillError: "scope:read_customers" });
    return;
  }
  const token = await giltigToken(shop);
  if (!token) {
    await satt(shop, { kundOrderBackfillError: "ingen giltig Shopify-nyckel" });
    return;
  }
  const settings = await prisma.shopSettings.findUnique({ where: { shop } });
  const tz = settings?.timezone ?? "UTC";
  const idag = dayInTz(new Date(), tz);
  const admin = adminFromToken(shop, token);

  let to = idag;
  let tomma = 0;
  const stopp = shiftIso(idag, -dagar);
  try {
    while (to > stopp) {
      const from = shiftIso(to, -(FONSTER - 1)) > stopp ? shiftIso(to, -(FONSTER - 1)) : stopp;
      const innan = await prisma.kundOrder.count({ where: { shop, dag: { gte: from, lte: to } } });
      await refreshDaily(admin, shop, tz, from, to);
      const efter = await prisma.kundOrder.count({ where: { shop, dag: { gte: from, lte: to } } });
      /* Utan read_all_orders svarar Shopify tomt bortom 60 dagar. Två tomma
         fönster i rad = vi har nått gränsen; sluta i stället för att elda
         bulk-exporter på ingenting. */
      if (efter === innan && efter === 0) tomma++;
      else tomma = 0;
      if (tomma >= 2) break;
      to = shiftIso(from, -1);
    }
    await satt(shop, { kundOrderBackfillAt: new Date(), kundOrderBackfillError: null });
  } catch (e) {
    await satt(shop, { kundOrderBackfillError: String((e as Error).message ?? e).slice(0, 300) });
    throw e;
  }
}
