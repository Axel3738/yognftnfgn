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
 * En genomläsning av ordrarna i fönstret ger både dagsserien och produktmixen.
 *
 * Approximationer, medvetna och synliga:
 * - Returer bokförs på ORDERNS dag, inte återbetalningsdagen.
 * - Radrabatter ingår i discountedTotal; orderrabatter fördelas inte per rad.
 * - Ordrar med fler än 20 rader trunkeras (nästan alla ordrar har 1–3).
 *
 * Fönstret hämtas med en dags marginal åt båda håll och filtreras sedan på
 * butikens tidszon — Shopifys created_at-filter tolkar datum i UTC.
 */
export async function fetchOrderData(
  admin: AdminApiContext,
  from: string,
  to: string,
  timezone: string,
): Promise<OrderData> {
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

  const search = `created_at:>='${shiftIso(from, -1)}' AND created_at:<='${shiftIso(to, 1)}'`;
  let after: string | null = null;

  for (let page = 0; page < 60; page++) {
    const res: Response = await admin.graphql(
      `#graphql
       query Orders($q: String!, $after: String) {
         orders(first: 40, after: $after, query: $q, sortKey: CREATED_AT) {
           pageInfo { hasNextPage endCursor }
           nodes {
             createdAt cancelledAt test
             totalPriceSet { shopMoney { amount } }
             subtotalPriceSet { shopMoney { amount } }
             totalDiscountsSet { shopMoney { amount } }
             totalShippingPriceSet { shopMoney { amount } }
             totalRefundedSet { shopMoney { amount } }
             lineItems(first: 20) {
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
      { variables: { q: search, after } },
    );
    const body = await res.json();
    if (body?.errors?.length) {
      throw new Error(`Orders-frågan misslyckades: ${body.errors.map((e: any) => e.message).join("; ")}`);
    }
    const conn = body?.data?.orders;
    if (!conn) break;

    for (const o of (conn.nodes ?? []) as OrderNode[]) {
      if (o.cancelledAt || o.test) continue;
      const day = dayInTz(new Date(o.createdAt), timezone);
      const bucket = salesBy.get(day);
      if (!bucket) continue; // marginaldag utanför fönstret

      const subtotal = num(o.subtotalPriceSet?.shopMoney?.amount);
      const discounts = num(o.totalDiscountsSet?.shopMoney?.amount);
      const refunded = num(o.totalRefundedSet?.shopMoney?.amount);
      const shipping = num(o.totalShippingPriceSet?.shopMoney?.amount);
      const total = num(o.totalPriceSet?.shopMoney?.amount);

      bucket.orders += 1;
      bucket.grossSales += subtotal + discounts; // subtotal är efter rabatt, före frakt
      bucket.discounts -= 0; bucket.discounts += -discounts;
      bucket.returns += -refunded;
      bucket.netSales += subtotal - refunded;
      bucket.totalSales += total - refunded;
      bucket.shippingCharges += shipping;

      for (const li of o.lineItems?.nodes ?? []) {
        const key = li.variant?.id ?? `${li.title}|${li.variantTitle ?? ""}`;
        const agg = productBy.get(key) ?? {
          productGid: li.product?.id ?? "",
          variantGid: li.variant?.id ?? null,
          title: li.title,
          variantTitle: li.variantTitle === "Default Title" ? null : li.variantTitle,
          units: 0,
          netSales: 0,
        };
        agg.units += li.quantity;
        agg.netSales += num(li.discountedTotalSet?.shopMoney?.amount);
        productBy.set(key, agg);
      }
    }

    if (!conn.pageInfo?.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }

  const costs = await fetchVariantCosts(admin);
  const products: ProductRow[] = [...productBy.values()].map((p) => {
    const hit =
      (p.variantGid ? costs.byGid.get(p.variantGid) : undefined) ??
      costs.byTitle.get(titleKey(p.title, p.variantTitle ?? "Default Title"));
    return { ...p, unitCost: hit?.unitCost ?? null };
  });

  return { sales: [...salesBy.values()], products };
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

/** Alla varianter med sin nuvarande unitCost. Paginerar tills allt är hämtat. */
export async function fetchVariantCosts(admin: AdminApiContext): Promise<VariantCatalog> {
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
  return { byGid, byTitle, all: [...byGid.values()] };
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
