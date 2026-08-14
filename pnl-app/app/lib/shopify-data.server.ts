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

const dayInTz = (d: Date, tz: string): string =>
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
  const jsonl = await runOrdersBulk(admin, shiftIso(from, -1), shiftIso(to, 1));

  const salesBy = new Map<string, SalesDay>();
  for (let d = from; d <= to; d = shiftIso(d, 1)) {
    salesBy.set(d, {
      day: d, orders: 0, grossSales: 0, discounts: 0, returns: 0,
      netSales: 0, totalSales: 0, shippingCharges: 0,
    });
  }

  interface Agg { productGid: string; variantGid: string | null; title: string;
    variantTitle: string | null; units: number; netSales: number; }
  const productBy = new Map<string, Agg>();
  /* Ordrar som räknas — radrader vars förälder skippats (avbruten/test/utanför
     fönstret) ska inte in i mixen. */
  const counted = new Set<string>();

  for (const line of jsonl) {
    if (!line.__parentId) {
      // Orderrad
      if (line.cancelledAt || line.test) continue;
      const day = dayInTz(new Date(line.createdAt), timezone);
      const bucket = salesBy.get(day);
      if (!bucket) continue;
      counted.add(line.id);

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
      if (!counted.has(line.__parentId)) continue;
      const key = line.variant?.id ?? `${line.title}|${line.variantTitle ?? ""}`;
      const agg = productBy.get(key) ?? {
        productGid: line.product?.id ?? "",
        variantGid: line.variant?.id ?? null,
        title: line.title,
        variantTitle: line.variantTitle === "Default Title" ? null : line.variantTitle,
        units: 0,
        netSales: 0,
      };
      agg.units += line.quantity ?? 0;
      agg.netSales += num(line.discountedTotalSet?.shopMoney?.amount);
      productBy.set(key, agg);
    }
  }

  const costs = await fetchVariantCosts(admin, shopKey);
  return {
    sales: [...salesBy.values()],
    products: applyCurrentCosts([...productBy.values()] as ProductRow[], costs),
  };
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
    throw new Error(`Kunde inte starta orderexporten: ${lastErr}`);
  }
  if (lastErr) {
    throw new Error(
      "En annan orderexport pågår fortfarande — vänta en halv minut och ladda om sidan.",
    );
  }

  const url = await waitForBulk(admin, 90_000);
  if (!url) return []; // export klar men noll objekt

  const dl = await fetch(url);
  if (!dl.ok) throw new Error(`Kunde inte hämta exportfilen (HTTP ${dl.status}).`);
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
    if (!op) throw new Error("Ingen bulk-operation hittades.");
    if (op.status === "COMPLETED") return op.url ?? null;
    if (op.status === "FAILED" || op.status === "CANCELED") {
      throw new Error(`Orderexporten misslyckades: ${op.errorCode ?? op.status}`);
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error("Orderexporten tog för lång tid — prova att ladda om om en stund.");
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
