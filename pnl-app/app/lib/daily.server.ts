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
export function adminFromToken(shop: string, accessToken: string) {
  return {
    graphql: (query: string, opts?: { variables?: unknown }) =>
      fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query, variables: opts?.variables }),
        /* Gruppsumman awaitar de här anropen — utan timeout blir ett hängt
           svar från Shopify en panel som aldrig laddar för NÅGON butik. */
        signal: AbortSignal.timeout(20_000),
      }),
  };
}

/**
 * Uppdatering av en annan butiks dagar med butikens egen sparade nyckel.
 * Misslyckas tyst (false) — summan visar under tiden vad som finns.
 *
 * `force` hoppar över minutspärren: används när anroparen VÄNTAR på svaret
 * (korta fönster via paginerings-snabbvägen, ett par sekunder) — dubbla
 * samtidiga hämtningar av samma fönster slås ändå ihop i fetchOrderData.
 */
/* Pågående bakgrundshämtningar. Panelen behöver veta att EN hämtning är i
   luften — inte bara att just den här requesten startade den — annars slutar
   självomladdningen polla efter första försöket medan exporten fortfarande
   kör, och skärmen fastnar på gamla siffror. */
const pagaende = new Set<string>();
export const bakgrundPagar = (shop: string): boolean => pagaende.has(shop);
export function markeraPagaende<T>(shop: string, p: Promise<T>): Promise<T> {
  pagaende.add(shop);
  return p.finally(() => pagaende.delete(shop));
}

/* Senaste misslyckade hämtningen per butik. En butik med död nyckel (401)
   ska inte betala ett nytt dömt API-anrop på varje gruppladdning — fem
   minuters paus mellan försöken, som force inte får kringgå. */
const senasteFel = new Map<string, number>();

/**
 * Butikens offline-nyckel, förnyad när den behöver det.
 *
 * Sedan `expiringOfflineAccessTokens` slogs på är nycklarna färskvara. Men
 * biblioteket förnyar dem bara i `authenticate.admin` — alltså när NÅGON
 * öppnar just den butikens panel. Gruppsummeringen läser nycklarna direkt ur
 * Session-tabellen och kringgår den vägen, så en butik ingen besökte fick sin
 * nyckel att tyst gå ut: Norge och Finland svarade 401 mitt på dagen och
 * försäljningen såg ut som noll. Här förnyas nyckeln med refresh-token innan
 * den används, precis som biblioteket gör åt den inloggade butiken.
 *
 * `tvinga` används efter ett 401: nyckeln kan vara ogiltig långt före sitt
 * utgångsdatum (ominstallation, ändrade scopes).
 */
export async function giltigToken(shop: string, tvinga = false): Promise<string | null> {
  const rad = await prisma.session.findFirst({ where: { shop, isOnline: false } });
  if (!rad) return null;

  const token = rad.accessToken ? decrypt(rad.accessToken) : null;
  const kvar = rad.expires ? rad.expires.getTime() - Date.now() : Infinity;
  // Samma marginal som bibliotekets egen: förnya innan den faktiskt gått ut.
  if (!tvinga && token && kvar > 5 * 60 * 1000) return token;

  const refresh = rad.refreshToken ? decrypt(rad.refreshToken) : null;
  if (!refresh) return token; // inget att förnya med — försök med den vi har

  /* Anropet görs direkt mot Shopifys OAuth-endpoint i stället för via
     bibliotekets hjälpare: den ligger bakom en typad yta som inte exponerar
     `api` för den här distributionen, och kontraktet här (refresh_token-grant)
     är stabilt och lätt att läsa. */
  try {
    const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        refresh_token: refresh,
        grant_type: "refresh_token",
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      senasteFornyelseFel.set(shop, `HTTP ${res.status}: ${text.slice(0, 300)}`);
      console.error(`Nyckelförnyelse för ${shop} nekades: HTTP ${res.status} ${text.slice(0, 200)}`);
      return token;
    }
    const body: any = await res.json();
    if (!body?.access_token) return token;

    const sekunder = (n: unknown) =>
      typeof n === "number" ? new Date(Date.now() + n * 1000) : undefined;
    await prisma.session.update({
      where: { id: rad.id },
      data: {
        accessToken: body.access_token,
        ...(body.scope ? { scope: body.scope } : {}),
        ...(sekunder(body.expires_in) ? { expires: sekunder(body.expires_in) } : {}),
        ...(body.refresh_token
          ? {
              refreshToken: body.refresh_token,
              ...(sekunder(body.refresh_token_expires_in)
                ? { refreshTokenExpires: sekunder(body.refresh_token_expires_in) }
                : {}),
            }
          : {}),
      },
    });
    senasteFornyelseFel.delete(shop);
    console.log(`Offline-nyckeln för ${shop} förnyades.`);
    return body.access_token as string;
  } catch (e) {
    senasteFornyelseFel.set(shop, `KASTADE: ${(e as Error).message}`);
    console.error(`Kunde inte förnya offline-nyckeln för ${shop}:`, e);
    return token;
  }
}

/** Senaste förnyelsefelet per butik. Behålls för felsökning via loggarna. */
const senasteFornyelseFel = new Map<string, string>();

const arObehorig = (e: unknown) => /\b401\b|Invalid API key or access token/i.test(String(e));

export async function refreshShopDaily(
  shop: string,
  from: string,
  to: string,
  opts?: { force?: boolean },
): Promise<boolean> {
  if (Date.now() - (senasteFel.get(shop) ?? 0) < 5 * 60 * 1000) return false;
  if (!opts?.force && !farStartaBakgrund(shop)) return false;
  try {
    const [token, settings] = await Promise.all([
      giltigToken(shop),
      prisma.shopSettings.findUnique({ where: { shop } }),
    ]);
    if (!token) return false;
    const tz = settings?.timezone ?? "UTC";
    try {
      await refreshDaily(adminFromToken(shop, token), shop, tz, from, to);
    } catch (e) {
      /* 401 kan komma före utgångsdatumet. Tvinga fram en ny nyckel och gör
         ett försök till — annars krävs ett manuellt besök i butikens admin
         för något som går att laga av sig självt. */
      if (!arObehorig(e)) throw e;
      const ny = await giltigToken(shop, true);
      if (!ny || ny === token) throw e;
      await refreshDaily(adminFromToken(shop, ny), shop, tz, from, to);
    }
    senasteFel.delete(shop);
    return true;
  } catch (e) {
    senasteFel.set(shop, Date.now());
    console.error(`Bakgrundshämtning för ${shop} misslyckades:`, e);
    return false;
  }
}
