/**
 * Dagslagret: en färdig rad per butik och dag i DailyPnl.
 *
 * Det här är hela snabbhetsmodellen. Orderexporten körs EN gång per dag(ar)
 * och skrivs som dagsrader; varje datumintervall därefter är en ren
 * databasläsning på millisekunder. Tidigare cachades hela intervall under
 * nycklar som "2026-07-18:2026-08-16" — och eftersom "30 dagar" flyttar sig
 * varje midnatt var alla vyer kalla varje morgon, med en halvminuts export
 * som straff. Dagar flyttar sig aldrig.
 *
 * Rader skrivs även för dagar utan ordrar. "Saknas" betyder därmed "aldrig
 * hämtad" — inte "såldes inget" — och det är skillnaden som avgör om vi
 * behöver exportera eller bara summera.
 */

import prisma from "../db.server";
import { fetchOrderData, mergeProductRows } from "./shopify-data.server";
import type { ProductRow, SalesDay } from "./pnl.server";
import { decrypt } from "./crypto.server";

const API_VERSION = "2026-07";

export const shiftIso = (iso: string, days: number): string => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/* Högst en bakgrundshämtning per butik och minut — Shopify tillåter en
   bulk-export åt gången, och utan spärr åt panelbesöken upp exportplatsen
   för varandra. Delas av panelen och gruppsummeringen. */
const senasteBakgrund = new Map<string, number>();
export function farStartaBakgrund(shop: string): boolean {
  const t = senasteBakgrund.get(shop) ?? 0;
  if (Date.now() - t < 60_000) return false;
  senasteBakgrund.set(shop, Date.now());
  return true;
}

/** Exporterar ordrar för fönstret och skriver om dagsraderna. */
export async function refreshDaily(
  admin: any,
  shop: string,
  timezone: string,
  from: string,
  to: string,
): Promise<void> {
  const data = await fetchOrderData(admin, from, to, timezone, shop);
  const now = new Date();
  /* En transaktion per dag vore 90 rundresor; en enda med alla upserts är en. */
  await prisma.$transaction(
    data.sales.map((s) => {
      const products = (data.productsByDay[s.day] ?? []) as any;
      const fields = {
        orders: s.orders,
        grossSales: s.grossSales,
        discounts: s.discounts,
        returns: s.returns,
        netSales: s.netSales,
        totalSales: s.totalSales,
        shippingCharges: s.shippingCharges,
        products,
        fetchedAt: now,
      };
      return prisma.dailyPnl.upsert({
        where: { shop_day: { shop, day: s.day } },
        create: { shop, day: s.day, ...fields },
        update: fields,
      });
    }),
  );
}

export interface DailyReadResult {
  sales: SalesDay[];
  products: ProductRow[];
  /** Dagar i intervallet som aldrig hämtats. */
  missingDays: string[];
  /** Äldsta hämtningstid bland raderna. Null = inga rader alls. */
  oldestFetchedAt: Date | null;
  /** Hämtningstid för intervallets sista dag (den som rör sig). */
  lastDayFetchedAt: Date | null;
}

/** Läser dagsrader ur databasen. Ingen nätverkstrafik — det är poängen. */
export async function readDaily(shop: string, from: string, to: string): Promise<DailyReadResult> {
  const rows = await prisma.dailyPnl.findMany({
    where: { shop, day: { gte: from, lte: to } },
    orderBy: { day: "asc" },
  });
  const have = new Set(rows.map((r) => r.day));
  const missingDays: string[] = [];
  for (let d = from; d <= to; d = shiftIso(d, 1)) if (!have.has(d)) missingDays.push(d);

  let oldest: Date | null = null;
  for (const r of rows) if (!oldest || r.fetchedAt < oldest) oldest = r.fetchedAt;

  return {
    sales: rows.map((r) => ({
      day: r.day,
      orders: r.orders,
      grossSales: r.grossSales,
      discounts: r.discounts,
      returns: r.returns,
      netSales: r.netSales,
      totalSales: r.totalSales,
      shippingCharges: r.shippingCharges,
    })),
    products: mergeProductRows(rows.flatMap((r) => (r.products as unknown as ProductRow[]) ?? [])),
    missingDays,
    oldestFetchedAt: oldest,
    lastDayFetchedAt: rows.length ? rows[rows.length - 1].fetchedAt : null,
  };
}

/**
 * Ett admin-objekt av en sparad offline-nyckel — samma .graphql-yta som
 * bibliotekets, så datahämtarna kan återanvändas rakt av. Det är så grupp-
 * summeringen kan fylla på ANDRA butikers dagar utan att någon öppnar deras
 * panel: alla tjänster delar databas, och nycklarna ligger i Session-tabellen.
 */
function adminFromToken(shop: string, accessToken: string) {
  return {
    graphql: (query: string, opts?: { variables?: unknown }) =>
      fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query, variables: opts?.variables }),
      }),
  };
}

/**
 * Bakgrundsuppdatering av en annan butiks dagar. Misslyckas tyst — summan
 * visar under tiden vad som finns, och nästa sidladdning har raderna.
 */
export async function refreshShopDaily(shop: string, from: string, to: string): Promise<void> {
  if (!farStartaBakgrund(shop)) return;
  try {
    const [session, settings] = await Promise.all([
      prisma.session.findFirst({ where: { shop, isOnline: false } }),
      prisma.shopSettings.findUnique({ where: { shop } }),
    ]);
    const token = session?.accessToken ? decrypt(session.accessToken) : null;
    if (!token) return;
    await refreshDaily(adminFromToken(shop, token), shop, settings?.timezone ?? "UTC", from, to);
  } catch (e) {
    console.error(`Bakgrundshämtning för ${shop} misslyckades:`, e);
  }
}
