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
import type { MarknadsDel, ProductRow, SalesDay } from "./pnl.server";
import { decrypt } from "./crypto.server";
import { butikensScope, harKundScope, skrivKundOrdrar, tillKundOrderRader } from "./kundorder.server";
import { marknadskod, sorteraMarknader } from "./marknad";

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
  /* Kundfältet följer bara med när butiken faktiskt gett read_customers —
     annars nekar Shopify hela frågan och dagsraderna slutar uppdateras. */
  const kund = harKundScope(await butikensScope(shop));
  const data = await fetchOrderData(admin, from, to, timezone, shop, { kund });
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
        /* Faktiska avgifter; null när Shopify inte lämnade ut dem. */
        fees: s.fees ?? null,
        products,
        /* Uppdelningen per marknad skrivs bredvid totalen. Gick landet inte
           att läsa lämnas fältet orört — en gammal uppdelning är bättre än
           att radera den, och null betyder "exportera om under filter". */
        ...(data.marketsByDay ? { markets: (data.marketsByDay[s.day] ?? {}) as any } : {}),
        /* Timmarna skrivs alltid — de kommer ur createdAt och beror inte på
           om leveransadressen gick att läsa. */
        hoursAt: now,
        fetchedAt: now,
      };
      return prisma.dailyPnl.upsert({
        where: { shop_day: { shop, day: s.day } },
        create: { shop, day: s.day, ...fields },
        update: fields,
      });
    }),
  );

  /* Timraderna. Radera + skriv, inte upsert: en timme som hade en order och
     efter en återbetalning inte har någon måste FÖRSVINNA, och 24 timmar ×
     marknader × 90 dagar hade blivit tiotusentals upsertar.

     ⚠ Chunkat med flit. En kall 90-dagarshämtning med tre marknader är
     90 × 24 × 3 = 6 480 rader à 12 kolumner — långt över Postgres tak på
     65 535 bind-parametrar, och Prisma delar inte createMany åt en. */
  const timrader = data.sales.flatMap((s) =>
    Object.entries(data.hoursByDay[s.day] ?? {}).flatMap(([timme, perLand]) =>
      Object.entries(perLand)
        .filter(([, v]) => v.orders > 0)
        .map(([market, v]) => ({
          shop,
          day: s.day,
          hour: Number(timme),
          market,
          orders: v.orders,
          grossSales: v.grossSales,
          discounts: v.discounts,
          returns: v.returns,
          netSales: v.netSales,
          totalSales: v.totalSales,
          shippingCharges: v.shippingCharges,
          fees: v.fees ?? null,
        })),
    ),
  );
  const dagar = data.sales.map((s) => s.day);
  if (dagar.length) {
    const BIT = 2000;
    await prisma.$transaction([
      prisma.hourlyPnl.deleteMany({ where: { shop, day: { in: dagar } } }),
      ...Array.from({ length: Math.ceil(timrader.length / BIT) }, (_, i) =>
        prisma.hourlyPnl.createMany({ data: timrader.slice(i * BIT, (i + 1) * BIT) }),
      ),
    ]);
  }

  /* KundOrder-raderna EFTER dagsraderna, ur samma hämtning: misslyckas
     hämtningen har vi redan kastat, och ingenting skrivs någonstans. */
  if (kund && data.kundOrdrar.length) {
    /* Kundvärdet räknas på standardkostnaden — bara standardens steg. Ett
       norskt tvåpackspris i den här listan hade prissatt svenska ordrar. */
    const [settings, tierRows] = await Promise.all([
      prisma.shopSettings.findUnique({ where: { shop } }),
      prisma.costTier.findMany({ where: { shop, market: "" } }),
    ]);
    const rader = tillKundOrderRader(
      shop,
      data.kundOrdrar,
      tierRows.map((c) => ({ variantGid: c.variantGid, units: c.units, totalCost: Number(c.totalCost) })),
      { tariffPerOrder: Number(settings?.tariffPerOrder ?? 0), feeRate: Number(settings?.feeRate ?? 0) },
    );
    await skrivKundOrdrar(shop, rader);
  }
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
  /**
   * Under ett marknadsfilter: dagar som finns men saknar uppdelning per
   * marknad även efter en färsk hämtning (Shopify nekade landet). De räknas
   * inte som saknade — då hade varje sidladdning exporterat om dem — utan
   * rapporteras här så panelen kan säga att marknadsvyn är ofullständig.
   */
  daysWithoutMarkets: number;
  /**
   * Omsättning (totalSales) per marknad i intervallet, ur dagsradernas
   * uppdelning. Dagar utan uppdelning hamnar under "". Underlaget för
   * avgifter per marknad i räknemotorn.
   */
  salesByMarket: Record<string, number>;
  /**
   * Antal ordrar per marknad i intervallet. Tullen är ett belopp per order,
   * så den kan inte räknas ur omsättningen — den behöver ordrarna.
   */
  ordersByMarket: Record<string, number>;
}

/** En timme på dygnet, summerad över alla dagar i intervallet. */
export interface Timrad {
  hour: number;
  orders: number;
  totalSales: number;
  netSales: number;
}

export interface HourlyReadResult {
  /** Alltid 24 rader, 0–23, även timmar utan försäljning. */
  timmar: Timrad[];
  /** Dagar i intervallet som FAKTISKT är timuppdelade — ROAS-nämnaren. */
  dagarMedTimmar: string[];
  /** Dagar som finns men hämtades före timgrafen. Sägs rakt ut i panelen. */
  dagarUtanTimmar: number;
}

/**
 * Försäljning per timme på dygnet över ett intervall.
 *
 * Egen läsning, inte en utbyggnad av `readDaily`: den gör ett oselekterat
 * `findMany` som varenda sida i appen går igenom, och timmarna angår bara
 * panelens timgraf. Här är det en grupperad SQL-fråga i stället.
 *
 * ⚠ `dagarMedTimmar` är inte kosmetik. Annonskostnaden per timme måste
 * summeras över EXAKT samma dagar som försäljningen, annars delas 30 dagars
 * spend med 12 dagars omsättning och ROAS ser ut att vara en tredjedel.
 */
export async function readHourly(
  shop: string,
  from: string,
  to: string,
  opts: { market?: string } = {},
): Promise<HourlyReadResult> {
  const market = marknadskod(opts.market);
  const [grupper, dagar] = await Promise.all([
    prisma.hourlyPnl.groupBy({
      by: ["hour"],
      where: { shop, day: { gte: from, lte: to }, market },
      _sum: { orders: true, totalSales: true, netSales: true },
    }),
    prisma.dailyPnl.findMany({
      where: { shop, day: { gte: from, lte: to } },
      select: { day: true, hoursAt: true },
    }),
  ]);

  const per = new Map(grupper.map((g) => [g.hour, g._sum]));
  const timmar: Timrad[] = Array.from({ length: 24 }, (_, hour) => {
    const g = per.get(hour);
    return {
      hour,
      orders: g?.orders ?? 0,
      totalSales: g?.totalSales ?? 0,
      netSales: g?.netSales ?? 0,
    };
  });

  const medTimmar = dagar.filter((d) => d.hoursAt != null).map((d) => d.day);
  return {
    timmar,
    dagarMedTimmar: medTimmar,
    dagarUtanTimmar: dagar.length - medTimmar.length,
  };
}

export interface ReadDailyOpts {
  /**
   * Marknad (landskod) att läsa. Tom/undefined = hela butiken. Med filter
   * läses dagens del för just den marknaden; en dag som saknar uppdelning
   * (skriven före 2026-09-17) räknas som ohämtad och exporteras om.
   */
  market?: string;
  /**
   * Utan filter: dela produktmixen per marknad när uppdelningen finns, så
   * att räknemotorn kan använda marknadens egen kostnad per rad. Dagar utan
   * uppdelning bidrar med sin sammanslagna mix (standardkostnad). Panelen och
   * gruppsumman sätter den; andra läsare får den gamla, sammanslagna listan.
   */
  perMarknad?: boolean;
}

const tomDel = (): MarknadsDel => ({
  orders: 0, grossSales: 0, discounts: 0, returns: 0, netSales: 0, totalSales: 0, shippingCharges: 0, products: [],
});

/** Läser dagsrader ur databasen. Ingen nätverkstrafik — det är poängen. */
export async function readDaily(
  shop: string,
  from: string,
  to: string,
  opts: ReadDailyOpts = {},
): Promise<DailyReadResult> {
  const market = marknadskod(opts.market);
  const rows = await prisma.dailyPnl.findMany({
    where: { shop, day: { gte: from, lte: to } },
    orderBy: { day: "asc" },
  });
  const have = new Set(rows.map((r) => r.day));
  const missingDays: string[] = [];
  for (let d = from; d <= to; d = shiftIso(d, 1)) if (!have.has(d)) missingDays.push(d);

  let oldest: Date | null = null;
  for (const r of rows) if (!oldest || r.fetchedAt < oldest) oldest = r.fetchedAt;

  const uppdelning = (r: (typeof rows)[number]) =>
    (r.markets as unknown as Record<string, MarknadsDel> | null) ?? null;

  if (market) {
    /* Marknadsfilter: bara den marknadens del av varje dag. Dagar utan
       uppdelning läggs till de saknade — de finns i databasen, men inte i
       den form filtret behöver, och att servera totalen som om den vore
       Norges hade varit en lögn i rätt valuta. */
    const sales: SalesDay[] = [];
    const products: ProductRow[] = [];
    let utanUppdelning = 0;
    /* En rad som hämtades för mindre än en timme sedan och ÄNDÅ saknar
       uppdelning kommer inte att få en av en ny hämtning (landet nekades).
       Att markera den saknad hade startat en ny export på varje sidladdning. */
    const NYSS_MS = 60 * 60 * 1000;
    for (const r of rows) {
      const per = uppdelning(r);
      if (per == null) {
        if (Date.now() - r.fetchedAt.getTime() > NYSS_MS) missingDays.push(r.day);
        else utanUppdelning++;
        continue;
      }
      const del = per[market] ?? tomDel();
      sales.push({ day: r.day, ...utanProdukter(del) });
      products.push(...del.products.map((p) => ({ ...p, market })));
    }
    missingDays.sort();
    return {
      sales,
      products: mergeProductRows(products),
      missingDays,
      oldestFetchedAt: oldest,
      lastDayFetchedAt: rows.length ? rows[rows.length - 1].fetchedAt : null,
      daysWithoutMarkets: utanUppdelning,
      salesByMarket: { [market]: sales.reduce((a, s) => a + s.totalSales, 0) },
      ordersByMarket: { [market]: sales.reduce((a, s) => a + s.orders, 0) },
    };
  }

  const products: ProductRow[] = [];
  const salesByMarket: Record<string, number> = {};
  const ordersByMarket: Record<string, number> = {};
  for (const r of rows) {
    const per = uppdelning(r);
    if (per) {
      for (const [m, del] of Object.entries(per)) {
        salesByMarket[m] = (salesByMarket[m] ?? 0) + del.totalSales;
        ordersByMarket[m] = (ordersByMarket[m] ?? 0) + del.orders;
      }
    } else {
      salesByMarket[""] = (salesByMarket[""] ?? 0) + r.totalSales;
      ordersByMarket[""] = (ordersByMarket[""] ?? 0) + r.orders;
    }
    if (per && opts.perMarknad) {
      for (const [m, del] of Object.entries(per)) products.push(...del.products.map((p) => ({ ...p, market: m })));
    } else {
      products.push(...(((r.products as unknown as ProductRow[]) ?? []).map((p) => ({ ...p, market: "" }))));
    }
  }

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
      fees: r.fees ?? null,
    })),
    products: mergeProductRows(products),
    missingDays,
    oldestFetchedAt: oldest,
    lastDayFetchedAt: rows.length ? rows[rows.length - 1].fetchedAt : null,
    daysWithoutMarkets: 0,
    salesByMarket,
    ordersByMarket,
  };
}

const utanProdukter = (d: MarknadsDel): Omit<MarknadsDel, "products"> => {
  const { products: _p, ...rest } = d;
  return rest;
};

/**
 * Marknaderna butiken faktiskt sålt till de senaste 90 dagarna, plus dem som
 * redan har en egen kostnad eller en märkt kampanj — så en marknad man just
 * börjat annonsera mot går att välja innan första ordern kommit.
 * Butikens hemland (ur valutan, grovt) först, sedan alfabetiskt.
 */
/**
 * Bara marknaderna butiken faktiskt SÅLT till de senaste 90 dagarna — det är
 * dem en variant måste ha kostnad för. En felskriven landskod ("SW") som
 * bara finns som kostnadspost ska inte få en produkt att räknas som
 * "saknar kostnad".
 */
export async function marknaderMedOrdrar(shop: string): Promise<string[]> {
  const sedan = shiftIso(new Date().toISOString().slice(0, 10), -90);
  const rader = await prisma.dailyPnl.findMany({ where: { shop, day: { gte: sedan } }, select: { markets: true } });
  const koder: string[] = [];
  for (const r of rader) {
    const per = r.markets as unknown as Record<string, MarknadsDel> | null;
    if (!per) continue;
    for (const [m, del] of Object.entries(per)) if (m && del.orders > 0) koder.push(m);
  }
  return sorteraMarknader(koder);
}

export async function kandaMarknader(shop: string, hemland = ""): Promise<string[]> {
  const sedan = shiftIso(new Date().toISOString().slice(0, 10), -90);
  const [rader, kostnader, steg, konton] = await Promise.all([
    prisma.dailyPnl.findMany({ where: { shop, day: { gte: sedan } }, select: { markets: true } }),
    prisma.costChange.findMany({ where: { shop }, select: { market: true }, distinct: ["market"] }),
    prisma.costTier.findMany({ where: { shop }, select: { market: true }, distinct: ["market"] }),
    prisma.metaAdAccount.findMany({ where: { shop }, select: { campaignMarkets: true } }),
  ]);
  const koder: string[] = [];
  for (const r of rader) {
    const per = r.markets as unknown as Record<string, MarknadsDel> | null;
    if (!per) continue;
    for (const [m, del] of Object.entries(per)) if (m && del.orders > 0) koder.push(m);
  }
  for (const k of kostnader) koder.push(k.market);
  for (const s of steg) koder.push(s.market);
  for (const k of konton) {
    const map = (k.campaignMarkets as unknown as Record<string, string> | null) ?? {};
    for (const m of Object.values(map)) koder.push(m);
  }
  return sorteraMarknader(koder, hemland);
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
/**
 * Butikernas riktiga namn, cachade i ShopSettings.shopName.
 *
 * Myshopify-handtaget ("1acuam-s5") säger ingenting för en människa, och en
 * gruppsumma med tio sådana rader går inte att läsa. Namnet hämtas en gång
 * per butik med butikens egen sparade nyckel och ändras i praktiken aldrig.
 * Misslyckas det får raden falla tillbaka på handtaget — namnet är kosmetik,
 * det får aldrig stoppa en summa.
 */
export async function fyllButiksnamn(shops: string[]): Promise<void> {
  await Promise.all(
    shops.map(async (shop) => {
      try {
        const token = await giltigToken(shop);
        if (!token) return;
        const res = await adminFromToken(shop, token).graphql(`#graphql\n { shop { name } }`);
        const body: any = await res.json();
        const namn = body?.data?.shop?.name;
        if (typeof namn === "string" && namn.trim()) {
          await prisma.shopSettings.updateMany({ where: { shop }, data: { shopName: namn.trim() } });
        }
      } catch (e) {
        console.error(`Kunde inte läsa butiksnamnet för ${shop}:`, (e as Error).message);
      }
    }),
  );
}

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

export interface UppmattAvgift {
  /** Avgifter ÷ omsättning, de senaste 90 dagarna. */
  rate: number;
  /** Omsättning underlaget bygger på (för att bedöma om talet betyder något). */
  sales: number;
  days: number;
}

/**
 * Vad Shopify Payments FAKTISKT tog, per marknad, de senaste 90 dagarna —
 * ur dagsradernas `fees`. Nyckeln "" är hela butiken. Marknader utan
 * uppdelning eller utan avgiftsdata saknas i svaret. Det här är svaret på
 * "jag vet ju inte avgifterna": ingen behöver slå upp dem, de står i
 * ordrarna.
 */
export async function uppmattaAvgifter(shop: string): Promise<Record<string, UppmattAvgift>> {
  const sedan = shiftIso(new Date().toISOString().slice(0, 10), -90);
  const rader = await prisma.dailyPnl.findMany({
    where: { shop, day: { gte: sedan }, fees: { not: null } },
    select: { fees: true, totalSales: true, markets: true },
  });
  const summa: Record<string, { fees: number; sales: number; days: number }> = {};
  const lagg = (m: string, fees: number, sales: number) => {
    const a = (summa[m] ??= { fees: 0, sales: 0, days: 0 });
    a.fees += fees;
    a.sales += sales;
    a.days++;
  };
  for (const r of rader) {
    lagg("", r.fees ?? 0, r.totalSales);
    const per = r.markets as unknown as Record<string, MarknadsDel> | null;
    if (!per) continue;
    for (const [m, del] of Object.entries(per)) {
      if (!m || del.fees == null || !(del.totalSales > 0)) continue;
      lagg(m, del.fees, del.totalSales);
    }
  }
  const ut: Record<string, UppmattAvgift> = {};
  for (const [m, a] of Object.entries(summa)) {
    if (a.sales > 0) ut[m] = { rate: a.fees / a.sales, sales: a.sales, days: a.days };
  }
  return ut;
}
