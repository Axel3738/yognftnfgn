/**
 * Allt som hämtas från Shopify Admin API.
 *
 * Viktig upptäckt som formade det här lagret: ShopifyQL (`shopifyqlQuery`)
 * finns INTE i det publika Admin-API:t — verifierat mot 2026-07-schemat via
 * introspektion. Analytics-ytan är intern hos Shopify. Därför aggregeras
 * försäljning och produktmix från ordrarna direkt (read_orders), och
 * sessioner/CVR kan inte levereras alls — de kräver en yta appar inte når.
 *
 * Uppsidan: orderraderna bär produkt- och variant-GID:n, så COGS-matchningen
 * blir exakt istället för titelbaserad.
 */

import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import type { ProductRow, SalesDay } from "./pnl.server";

const num = (v: unknown): number => {
  if (v == null || v === "") return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isNaN(n) ? 0 : n;
};

export interface ShopInfo {
  today: string; // YYYY-MM-DD i butikens tidszon
  timezone: string;
  currency: string;
}

/** Butikens tidszon avgör vad "idag" och dygnsgränserna betyder — aldrig serverns klocka. */
export async function fetchShopInfo(admin: AdminApiContext): Promise<ShopInfo> {
  const res = await admin.graphql(`#graphql\n    { shop { ianaTimezone currencyCode } }`);
  const body = await res.json();
  const timezone = body?.data?.shop?.ianaTimezone ?? "UTC";
  const currency = body?.data?.shop?.currencyCode ?? "SEK";
  return { today: dayInTz(new Date(), timezone), timezone, currency };
}

export const dayInTz = (d: Date, tz: string): string =>
  // sv-SE ger ISO-format (ÅÅÅÅ-MM-DD) direkt.
  new Intl.DateTimeFormat("sv-SE", { timeZone: tz, dateStyle: "short" }).format(d);

const shiftIso = (iso: string, days: number): string => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

interface OrderNode {
  createdAt: string;
  cancelledAt: string | null;
  test: boolean;
  totalPriceSet: { shopMoney: { amount: string } };
  subtotalPriceSet: { shopMoney: { amount: string } };
  totalDiscountsSet: { shopMoney: { amount: string } };
  totalShippingPriceSet: { shopMoney: { amount: string } };
  totalRefundedSet: { shopMoney: { amount: string } };
  lineItems: {
    nodes: {
      title: string;
      variantTitle: string | null;
      quantity: number;
      discountedTotalSet: { shopMoney: { amount: string } };
      product: { id: string } | null;
      variant: { id: string } | null;
    }[];
  };
}

export interface OrderData {
  sales: SalesDay[];
  products: ProductRow[];
  /** Mixen per dag — grunden för dagsraderna i DailyPnl. */
  productsByDay: Record<string, ProductRow[]>;
}

/**
 * Ordrarna hämtas via Shopifys bulk-export (bulkOperationRunQuery) — den
 * paginerade vägen stryps av API:ts kostnadsmodell: varje sida med orderrader
 * kostar ~900 poäng och budgeten tar slut efter ett par sidor, varpå resten
 * droppar i väntetakt. 30 dagar tog minuter. Bulk-exporten är asynkron, utan
 * kostnadstak, och levererar allt som JSONL på 20–60 sekunder.
 *
 * Approximationer, medvetna och synliga:
 * - Returer bokförs på ORDERNS dag, inte återbetalningsdagen.
 * - Radrabatter ingår i discountedTotal; orderrabatter fördelas inte per rad.
 */
const inflight = new Map<string, Promise<OrderData>>();

export function fetchOrderData(
  admin: AdminApiContext,
  from: string,
  to: string,
  timezone: string,
  shopKey = "",
): Promise<OrderData> {
  /* Shopify tillåter EN bulk-operation per butik. Utan samordning krockar två
     samtidiga sidladdningar (t.ex. 30d-vyn som fortfarande exporterar när
     användaren klickar 90d) med "already in progress". Samma intervall delar
     promise; olika intervall köar via retry-logiken i runOrdersBulk. */
  const key = `${shopKey}:${from}:${to}`;
  const existing = inflight.get(key);
  if (existing) return existing;
  const p = doFetchOrderData(admin, from, to, timezone, shopKey).finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

async function doFetchOrderData(
  admin: AdminApiContext,
  from: string,
  to: string,
  timezone: string,
  shopKey = "",
): Promise<OrderData> {
  /* Korta fönster (dagens siffror, morgonens nya dagar) går via vanlig
     paginering: 1–2 sekunder istället för bulk-exportens halvminut, och de
     upptar inte butikens enda bulk-plats. Långa fönster stryps av API:ts
     kostnadsmodell och måste ta bulk-vägen. */
  const dayCount = (Date.parse(to) - Date.parse(from)) / 86_400_000 + 1;
  const jsonl =
    dayCount <= 7
      ? await runOrdersPaginated(admin, shiftIso(from, -1), shiftIso(to, 1))
      : await runOrdersBulk(admin, shiftIso(from, -1), shiftIso(to, 1));
  const data = parseOrderLines(jsonl, from, to, timezone);

  const costs = await fetchVariantCosts(admin, shopKey);
  return {
    sales: data.sales,
    products: applyCurrentCosts(data.products, costs),
    productsByDay: Object.fromEntries(
      Object.entries(data.productsByDay).map(([d, rows]) => [d, applyCurrentCosts(rows, costs)]),
    ),
  };
}

/** Bygger dags- och produktaggregat ur JSONL-rader (ordrar + radartiklar). */
function parseOrderLines(
  jsonl: any[],
  from: string,
  to: string,
  timezone: string,
): OrderData {
  const salesBy = new Map<string, SalesDay>();
  for (let d = from; d <= to; d = shiftIso(d, 1)) {
    salesBy.set(d, {
      day: d, orders: 0, grossSales: 0, discounts: 0, returns: 0,
      netSales: 0, totalSales: 0, shippingCharges: 0,
    });
  }

  interface Agg { productGid: string; variantGid: string | null; title: string;
    variantTitle: string | null; units: number; netSales: number; lines: Record<string, number>; }
  /* Ordrar som räknas, med sin dag — radrader vars förälder skippats
     (avbruten/test/utanför fönstret) ska inte in i mixen. */
  const counted = new Map<string, string>();
  const productByDay = new Map<string, Map<string, Agg>>();

  for (const line of jsonl) {
    if (!line.__parentId) {
      // Orderrad
      if (line.cancelledAt || line.test) continue;
      const day = dayInTz(new Date(line.createdAt), timezone);
      const bucket = salesBy.get(day);
      if (!bucket) continue;
      counted.set(line.id, day);

      const subtotal = num(line.subtotalPriceSet?.shopMoney?.amount);
      const discounts = num(line.totalDiscountsSet?.shopMoney?.amount);
      const refunded = num(line.totalRefundedSet?.shopMoney?.amount);

      bucket.orders += 1;
      bucket.grossSales += subtotal + discounts;
      bucket.discounts += -discounts;
      bucket.returns += -refunded;
      bucket.netSales += subtotal - refunded;
      bucket.totalSales += num(line.totalPriceSet?.shopMoney?.amount) - refunded;
      bucket.shippingCharges += num(line.totalShippingPriceSet?.shopMoney?.amount);
    } else {
      // Orderrad-artikel
      const day = counted.get(line.__parentId);
      if (!day) continue;
      const key = line.variant?.id ?? `${line.title}|${line.variantTitle ?? ""}`;
      const dayMap = productByDay.get(day) ?? new Map<string, Agg>();
      const agg = dayMap.get(key) ?? {
        productGid: line.product?.id ?? "",
        variantGid: line.variant?.id ?? null,
        title: line.title,
        variantTitle: line.variantTitle === "Default Title" ? null : line.variantTitle,
        units: 0,
        netSales: 0,
        lines: {} as Record<string, number>,
      };
      agg.units += line.quantity ?? 0;
      /* Hur många stycken låg i just den här raden? Det avgör flerpacks-
         kostnaden — tre i en rad delar frakten, tre i tre ordrar gör det inte. */
      if (line.quantity > 0) agg.lines[String(line.quantity)] = (agg.lines[String(line.quantity)] ?? 0) + 1;
      agg.netSales += num(line.discountedTotalSet?.shopMoney?.amount);
      dayMap.set(key, agg);
      productByDay.set(day, dayMap);
    }
  }

  const productsByDay: Record<string, ProductRow[]> = {};
  for (const [day, m] of productByDay) productsByDay[day] = [...m.values()] as ProductRow[];
  return {
    sales: [...salesBy.values()],
    products: mergeProductRows(Object.values(productsByDay).flat()),
    productsByDay,
  };
}

/** Slår ihop produktrader (samma variant över flera dagar) till en per variant. */
export function mergeProductRows(rows: ProductRow[]): ProductRow[] {
  const by = new Map<string, ProductRow>();
  for (const r of rows) {
    const key = r.variantGid ?? `${r.title}|${r.variantTitle ?? ""}`;
    const agg = by.get(key);
    if (agg) {
      agg.units += r.units;
      agg.netSales += r.netSales;
      if (agg.unitCost == null) agg.unitCost = r.unitCost;
      if (r.lines) {
        agg.lines = { ...(agg.lines ?? {}) };
        for (const [q, n] of Object.entries(r.lines)) agg.lines[q] = (agg.lines[q] ?? 0) + n;
      }
    } else {
      by.set(key, { ...r, lines: r.lines ? { ...r.lines } : undefined });
    }
  }
  return [...by.values()];
}

/**
 * Hämtar korta fönster via vanlig paginering och returnerar samma radformat
 * som bulk-exporten, så båda vägarna delar parser. Sidstorleken är vald så att
 * begärd frågekostnad ryms i API:ts budget (50 ordrar × 25 rader).
 */
async function runOrdersPaginated(
  admin: AdminApiContext,
  fromExclusive: string,
  toInclusive: string,
): Promise<any[]> {
  const lines: any[] = [];
  let after: string | null = null;
  for (let page = 0; page < 20; page++) {
    const res: Response = await admin.graphql(
      `#graphql
       query Orders($after: String, $q: String!) {
         orders(first: 50, after: $after, query: $q) {
           pageInfo { hasNextPage endCursor }
           nodes {
             id createdAt cancelledAt test
             totalPriceSet { shopMoney { amount } }
             subtotalPriceSet { shopMoney { amount } }
             totalDiscountsSet { shopMoney { amount } }
             totalShippingPriceSet { shopMoney { amount } }
             totalRefundedSet { shopMoney { amount } }
             lineItems(first: 25) {
               nodes {
                 title variantTitle quantity
                 discountedTotalSet { shopMoney { amount } }
                 product { id }
                 variant { id }
               }
             }
           }
         }
       }`,
      { variables: { after, q: `created_at:>='${fromExclusive}' AND created_at:<='${toInclusive}'` } },
    );
    const body = await res.json();
    const throttled = (body?.errors ?? []).some(
      (e: any) => e?.extensions?.code === "THROTTLED",
    );
    if (throttled) { await sleep(2000); page--; continue; }
    /* Ett fel här FÅR inte bli en tom lista. Det var precis vad som hände:
       saknad orderbehörighet (ACCESS_DENIED) eller en död nyckel gav
       `data.orders === null`, loopen bröt, och noll rader skrevs ner som
       "butiken sålde ingenting idag" — med annonskostnaden kvar. Gruppvyn
       visade då 0 kr försäljning och ren förlust för friska butiker.
       Ett fel ska kastas: då skrivs ingenting, och den som frågade får
       säga ifrån istället för att visa en nolla som ser äkta ut. */
    if (body?.errors?.length) {
      const msg = body.errors.map((e: any) => e?.message ?? String(e)).join("; ");
      throw new Error(`Order query failed: ${msg}`);
    }
    const conn = body?.data?.orders;
    if (!conn) {
      throw new Error(
        `Order query returned no data (HTTP ${res.status}) — the access token may lack read_orders.`,
      );
    }
    for (const o of conn.nodes ?? []) {
      lines.push({ ...o, lineItems: undefined });
      for (const li of o.lineItems?.nodes ?? []) lines.push({ ...li, __parentId: o.id });
    }
    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return lines;
}

/**
 * Slår om produktradernas unitCost mot en färsk katalog.
 *
 * Aggregaten cachas i timmar, och bar tidigare den kostnad som gällde när de
 * hämtades. Följden: man skrev in ett inköpspris, laddade om, och panelen sa
 * fortfarande "saknar inköpspris" — importen såg trasig ut fast den lyckats.
 * Kostnaden hör inte hemma i cachen; den läses om vid varje sidladdning.
 */
export function applyCurrentCosts(products: ProductRow[], costs: VariantCatalog): ProductRow[] {
  return products.map((p) => {
    const hit =
      (p.variantGid ? costs.byGid.get(p.variantGid) : undefined) ??
      costs.byTitle.get(titleKey(p.title, p.variantTitle ?? "Default Title"));
    return { ...p, unitCost: hit?.unitCost ?? null };
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Startar bulk-exporten, väntar in den och returnerar parsade JSONL-rader. */
async function runOrdersBulk(
  admin: AdminApiContext,
  fromExclusive: string,
  toInclusive: string,
): Promise<any[]> {
  const inner = `{
    orders(query: "created_at:>='${fromExclusive}' AND created_at:<='${toInclusive}'") {
      edges { node {
        id createdAt cancelledAt test
        totalPriceSet { shopMoney { amount } }
        subtotalPriceSet { shopMoney { amount } }
        totalDiscountsSet { shopMoney { amount } }
        totalShippingPriceSet { shopMoney { amount } }
        totalRefundedSet { shopMoney { amount } }
        lineItems {
          edges { node {
            id title variantTitle quantity
            discountedTotalSet { shopMoney { amount } }
            product { id }
            variant { id }
          } }
        }
      } }
    }
  }`;

  // En bulk-operation i taget per butik — vänta ut en pågående innan start.
  let lastErr = "";
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await admin.graphql(
      `#graphql
       mutation Run($q: String!) {
         bulkOperationRunQuery(query: $q) {
           bulkOperation { id status }
           userErrors { field message }
         }
       }`,
      { variables: { q: inner } },
    );
    const body = await res.json();
    const errs = body?.data?.bulkOperationRunQuery?.userErrors ?? [];
    if (!errs.length) { lastErr = ""; break; }
    lastErr = errs.map((e: any) => e.message).join("; ");
    if (/already in progress/i.test(lastErr)) {
      // Någon annans export (annat intervall) kör — vänta ut den och försök igen.
      await waitForBulk(admin, 120_000).catch(() => {});
      continue;
    }
    throw new Error(`Could not start the order export: ${lastErr}`);
  }
  if (lastErr) {
    throw new Error(
      "Another order export is still running — wait half a minute and reload the page.",
    );
  }

  const url = await waitForBulk(admin, 90_000);
  if (!url) return []; // export klar men noll objekt

  const dl = await fetch(url);
  if (!dl.ok) throw new Error(`Could not download the export file (HTTP ${dl.status}).`);
  const text = await dl.text();
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
}

/** Pollar tills bulk-operationen är klar. Returnerar nedladdnings-URL (null = tomt resultat). */
async function waitForBulk(admin: AdminApiContext, timeoutMs: number): Promise<string | null> {
  const start = Date.now();
  for (;;) {
    await sleep(2500);
    const res = await admin.graphql(
      `#graphql
       { currentBulkOperation { id status errorCode url objectCount } }`,
    );
    const body = await res.json();
    const op = body?.data?.currentBulkOperation;
    if (!op) throw new Error("No bulk operation found.");
    if (op.status === "COMPLETED") return op.url ?? null;
    if (op.status === "FAILED" || op.status === "CANCELED") {
      throw new Error(`The order export failed: ${op.errorCode ?? op.status}`);
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error("The order export took too long — try reloading in a moment.");
    }
  }
}

const titleKey = (product: string, variant: string) =>
  `${product.trim().toLowerCase()} ${variant.trim().toLowerCase()}`;

export interface VariantCost {
  productGid: string;
  variantGid: string;
  inventoryItemGid: string;
  productTitle: string;
  variantTitle: string;
  price: number;
  unitCost: number | null;
}

export interface VariantCatalog {
  byGid: Map<string, VariantCost>;
  byTitle: Map<string, VariantCost>;
  all: VariantCost[];
}

/* Katalogen ändras sällan men hämtades på varje sidladdning — flera sekunder
   i onödan. 5 min minnescache; kostnadsskrivningar invaliderar direkt. */
const catalogCache = new Map<string, { cat: VariantCatalog; at: number }>();
export function invalidateVariantCosts(cacheKey: string) {
  catalogCache.delete(cacheKey);
}

const DB_TTL = 30 * 60 * 1000;

/** Bygger om uppslagstabellerna ur en lagrad lista. */
function katalogAv(all: VariantCost[]): VariantCatalog {
  const byGid = new Map<string, VariantCost>();
  const byTitle = new Map<string, VariantCost>();
  for (const v of all) {
    byGid.set(v.variantGid, v);
    byTitle.set(titleKey(v.productTitle, v.variantTitle), v);
  }
  return { byGid, byTitle, all };
}

/**
 * Katalogen med två cachelager: processminne (snabbast) och databas
 * (överlever omstarter). Minnescachen ensam gav flera sekunders ompaginering
 * varje gång containern startats om, vilket för en Railway-tjänst är ofta.
 *
 * Är den lagrade kopian gammal serveras den ändå, och en färsk hämtning körs
 * i bakgrunden — inköpspriser ändras i veckotakt, inte i sekundtakt, och att
 * vänta på dem vore att betala samma pris som förut.
 */
export async function loadCatalog(
  admin: AdminApiContext,
  shop: string,
  prisma: any,
): Promise<VariantCatalog> {
  const minne = catalogCache.get(shop);
  if (minne && Date.now() - minne.at < 5 * 60 * 1000) return minne.cat;

  const rad = await prisma.catalogCache.findUnique({ where: { shop } }).catch(() => null);
  if (rad) {
    const cat = katalogAv(rad.payload as VariantCost[]);
    catalogCache.set(shop, { cat, at: Date.now() });
    if (Date.now() - rad.fetchedAt.getTime() > DB_TTL) void uppdateraKatalog(admin, shop, prisma);
    return cat;
  }
  return uppdateraKatalog(admin, shop, prisma);
}

async function uppdateraKatalog(
  admin: AdminApiContext,
  shop: string,
  prisma: any,
): Promise<VariantCatalog> {
  const cat = await fetchVariantCosts(admin);
  catalogCache.set(shop, { cat, at: Date.now() });
  await prisma.catalogCache
    .upsert({
      where: { shop },
      create: { shop, payload: cat.all as any },
      update: { payload: cat.all as any, fetchedAt: new Date() },
    })
    .catch(() => {});
  return cat;
}

/** Efter en kostnadsskrivning måste båda lagren bort, inte bara minnet. */
export async function invalidateCatalog(shop: string, prisma: any) {
  catalogCache.delete(shop);
  await prisma.catalogCache.deleteMany({ where: { shop } }).catch(() => {});
}

/** Alla varianter med sin nuvarande unitCost. Paginerar tills allt är hämtat. */
export async function fetchVariantCosts(
  admin: AdminApiContext,
  cacheKey = "",
): Promise<VariantCatalog> {
  if (cacheKey) {
    const hit = catalogCache.get(cacheKey);
    if (hit && Date.now() - hit.at < 5 * 60 * 1000) return hit.cat;
  }
  const byGid = new Map<string, VariantCost>();
  const byTitle = new Map<string, VariantCost>();
  let after: string | null = null;

  for (let page = 0; page < 40; page++) {
    const res: Response = await admin.graphql(
      `#graphql
       query Variants($after: String) {
         productVariants(first: 250, after: $after) {
           pageInfo { hasNextPage endCursor }
           nodes {
             id title price
             product { id title }
             inventoryItem { id unitCost { amount } }
           }
         }
       }`,
      { variables: { after } },
    );
    const body = await res.json();
    const conn = body?.data?.productVariants;
    if (!conn) break;

    for (const v of conn.nodes ?? []) {
      const rec: VariantCost = {
        productGid: v.product.id,
        variantGid: v.id,
        inventoryItemGid: v.inventoryItem.id,
        productTitle: v.product.title,
        variantTitle: v.title,
        price: num(v.price),
        unitCost: v.inventoryItem.unitCost ? num(v.inventoryItem.unitCost.amount) : null,
      };
      byGid.set(rec.variantGid, rec);
      byTitle.set(titleKey(rec.productTitle, rec.variantTitle), rec);
    }
    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  const cat: VariantCatalog = { byGid, byTitle, all: [...byGid.values()] };
  if (cacheKey) catalogCache.set(cacheKey, { cat, at: Date.now() });
  return cat;
}

/** Skriver unitCost på en variant. Kostnaden ska vara vara + frakt, utan tull. */
export async function setUnitCost(
  admin: AdminApiContext,
  inventoryItemGid: string,
  cost: number,
): Promise<{ ok: boolean; error?: string }> {
  const res = await admin.graphql(
    `#graphql
     mutation SetCost($id: ID!, $input: InventoryItemInput!) {
       inventoryItemUpdate(id: $id, input: $input) {
         inventoryItem { id unitCost { amount } }
         userErrors { field message }
       }
     }`,
    { variables: { id: inventoryItemGid, input: { cost: cost.toFixed(2) } } },
  );
  const body = await res.json();
  const errs = body?.data?.inventoryItemUpdate?.userErrors ?? [];
  if (errs.length) return { ok: false, error: errs.map((e: any) => e.message).join("; ") };
  return { ok: true };
}
