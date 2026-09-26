/**
 * Orderrader → dagsaggregat. Den rena delen av orderhämtningen: parsern som
 * gör Shopifys order-JSONL till försäljning per dag, marknad och timme, plus
 * sidbläddringen för korta fönster.
 *
 * Egen fil med explicita `.ts`-importer: testerna körs med
 * `node --experimental-strip-types`, som inte kan lösa upp importer utan
 * filändelse — och det var därför parsern, som ALLA intäktssiffror går
 * igenom, saknade tester helt. `shopify-data.server.ts` exporterar allt
 * härifrån vidare, så ingen anropare behövde ändras.
 */

import type { MarknadsDel, ProductRow, SalesDay } from "./pnl.server.ts";
import { marknadskod } from "./marknad.ts";
import { hourInTz } from "./timmar.ts";
import { INGEN_GATEWAY, SP_GATEWAY } from "./avgifter.ts";

export const num = (v: unknown): number => {
  if (v == null || v === "") return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isNaN(n) ? 0 : n;
};

export const dayInTz = (d: Date, tz: string): string =>
  // sv-SE ger ISO-format (ÅÅÅÅ-MM-DD) direkt.
  new Intl.DateTimeFormat("sv-SE", { timeZone: tz, dateStyle: "short" }).format(d);

const shiftIso = (iso: string, days: number): string => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export interface OrderNode {
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

/**
 * En order med sin kund (som GID, hashas i kundorder.server innan lagring)
 * och sina rader med nuvarande inköpspris — underlaget för kundvärdet.
 * Fylls BARA när frågan ställdes med kund (scopen read_customers), annars tom.
 */
export interface KundOrderRa {
  orderId: string;
  customerGid: string | null;
  dag: string;
  /** Subtotal − återbetalning, som SalesDay.netSales. */
  netto: number;
  /** Totalpris efter återbetalning — det avgiften räknas på. */
  totalPrice: number;
  lines: { variantGid: string | null; quantity: number; unitCost: number | null }[];
}

export interface OrderData {
  sales: SalesDay[];
  products: ProductRow[];
  /** Mixen per dag — grunden för dagsraderna i DailyPnl. */
  productsByDay: Record<string, ProductRow[]>;
  /**
   * Samma dagar uppdelade per marknad (landskod ur leveransadressen):
   * { "2026-09-17": { "SE": {...}, "NO": {...} } }. Ordrar utan land ligger
   * under "". Null när landet inte gick att läsa (fältet nekades) — då
   * skrivs ingen uppdelning, hellre än en där allt ligger under "okänt".
   */
  marketsByDay: Record<string, Record<string, MarknadsDel>> | null;
  /**
   * Samma dagar uppdelade per TIMME på dygnet (0–23) i butikens tidszon, och
   * per marknad inom timmen: { "2026-09-17": { "14": { "": {...}, "SE": {...} } } }.
   * Marknaden "" är alltid hela timmen — den finns även när landet är okänt.
   * Aldrig null: timmen kommer ur createdAt och kan alltid räknas ut.
   * Bara skalärer, ingen produktmix — se HourlyPnl i schemat.
   */
  hoursByDay: Record<string, Record<string, Record<string, Omit<MarknadsDel, "products">>>>;
  /** Per order med kund — tom när frågan ställdes utan kundfältet. */
  kundOrdrar: KundOrderRa[];
}

/** Bygger dags- och produktaggregat ur JSONL-rader (ordrar + radartiklar). */
export function parseOrderLines(
  jsonl: any[],
  from: string,
  to: string,
  timezone: string,
  medLand = true,
  medAvgifter = true,
): OrderData {
  const salesBy = new Map<string, SalesDay>();
  for (let d = from; d <= to; d = shiftIso(d, 1)) {
    salesBy.set(d, {
      day: d, orders: 0, grossSales: 0, discounts: 0, returns: 0,
      netSales: 0, totalSales: 0, shippingCharges: 0,
      /* Noll när avgifterna hämtas (en dag utan ordrar har noll avgift);
         null när fältet nekades — då ska motorn räkna med satsen. Samma
         sak för den täckta omsättningen: utan avgifter täcker de ingenting. */
      fees: medAvgifter ? 0 : null,
      feesCoveredSales: medAvgifter ? 0 : null,
      gatewaySales: medAvgifter ? {} : null,
    });
  }

  interface Agg { productGid: string; variantGid: string | null; title: string;
    variantTitle: string | null; units: number; netSales: number; lines: Record<string, number>; }
  /* Ordrar som räknas, med sin dag — radrader vars förälder skippats
     (avbruten/test/utanför fönstret) ska inte in i mixen. */
  const counted = new Map<string, string>();
  /* Timmen på dygnet per order. Ligger UTANFÖR landsspärren med flit:
     timmen kommer ur createdAt och har inget med leveransadressen att göra,
     så en butik utan adressbehörighet ska ändå få sin timgraf. */
  const timmePerOrder = new Map<string, number>();
  const salesByTimme = new Map<string, Map<number, Map<string, SalesDay>>>();
  const timHink = (day: string, timme: number, land: string): SalesDay => {
    const perTimme = salesByTimme.get(day) ?? new Map<number, Map<string, SalesDay>>();
    salesByTimme.set(day, perTimme);
    const perLand = perTimme.get(timme) ?? new Map<string, SalesDay>();
    perTimme.set(timme, perLand);
    const hink = perLand.get(land) ?? {
      day, orders: 0, grossSales: 0, discounts: 0, returns: 0,
      netSales: 0, totalSales: 0, shippingCharges: 0, fees: medAvgifter ? 0 : null,
      feesCoveredSales: medAvgifter ? 0 : null, gatewaySales: medAvgifter ? {} : null,
    };
    perLand.set(land, hink);
    return hink;
  };
  const productByDay = new Map<string, Map<string, Agg>>();
  /* Per marknad: samma aggregat en gång till, nyckel dag → land. Landet är
     leveransadressens; saknas den (digital vara, upphämtning) tas fakturans.
     Ordrar utan något land alls hamnar under "". */
  const landPerOrder = new Map<string, string>();
  const salesByMarknad = new Map<string, Map<string, SalesDay>>();
  const productByDayMarknad = new Map<string, Map<string, Map<string, Agg>>>();
  const marknadsHink = (day: string, land: string): SalesDay => {
    const perLand = salesByMarknad.get(day) ?? new Map<string, SalesDay>();
    salesByMarknad.set(day, perLand);
    const hink = perLand.get(land) ?? {
      day, orders: 0, grossSales: 0, discounts: 0, returns: 0,
      netSales: 0, totalSales: 0, shippingCharges: 0, fees: medAvgifter ? 0 : null,
      feesCoveredSales: medAvgifter ? 0 : null, gatewaySales: medAvgifter ? {} : null,
    };
    perLand.set(land, hink);
    return hink;
  };
  const laggPaMix = (dayMap: Map<string, Agg>, key: string, line: any) => {
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
  };
  /* Per order, för kundvärdet. Fylls för alla räknade ordrar; anroparen
     avgör om kundfältet fanns med i frågan (customer saknas ⇒ gästorder). */
  const kundOrdrar = new Map<string, KundOrderRa>();

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

      kundOrdrar.set(line.id, {
        orderId: String(line.id),
        customerGid: line.customer?.id ? String(line.customer.id) : null,
        dag: day,
        netto: subtotal - refunded,
        totalPrice: num(line.totalPriceSet?.shopMoney?.amount) - refunded,
        lines: [],
      });

      const total = num(line.totalPriceSet?.shopMoney?.amount) - refunded;
      const frakt = num(line.totalShippingPriceSet?.shopMoney?.amount);
      /* Orderns faktiska avgifter: summan av fees på alla lyckade
         transaktioner (försäljning, capture; en återbetalning kan bära en
         negativ avgift när Shopify återför den). `sp` säger om ordern gick
         genom Shopify Payments — bara då täcker avgiften orderns omsättning.
         En PayPal-order har inga fees, och räknades den som täckt blev dess
         avgift 0 i stället för handlarens sats. */
      const betalning = medAvgifter ? summeraAvgifter(line.transactions) : null;
      const avgift = betalning?.avgift ?? 0;
      const fyll = (b: SalesDay) => {
        b.orders += 1;
        b.grossSales += subtotal + discounts;
        b.discounts += -discounts;
        b.returns += -refunded;
        b.netSales += subtotal - refunded;
        b.totalSales += total;
        b.shippingCharges += frakt;
        if (b.fees != null) b.fees += avgift;
        if (b.feesCoveredSales != null && betalning?.sp) b.feesCoveredSales += total;
        if (b.gatewaySales && betalning) {
          b.gatewaySales[betalning.gateway] = (b.gatewaySales[betalning.gateway] ?? 0) + total;
        }
      };
      fyll(bucket);
      const land = medLand
        ? marknadskod(line.shippingAddress?.countryCodeV2 ?? line.billingAddress?.countryCodeV2)
        : "";
      if (medLand) {
        landPerOrder.set(line.id, land);
        fyll(marknadsHink(day, land));
      }
      /* Samma `fyll` som dagen och marknaden — då kan timmarna inte summera
         till något annat än dagen, för det är samma aritmetik. Marknaden ""
         är alltid med, så totalen finns även när landet är okänt. */
      const timme = hourInTz(new Date(line.createdAt), timezone);
      timmePerOrder.set(line.id, timme);
      fyll(timHink(day, timme, ""));
      if (medLand && land) fyll(timHink(day, timme, land));
    } else {
      // Orderrad-artikel
      const day = counted.get(line.__parentId);
      if (!day) continue;
      const key = line.variant?.id ?? `${line.title}|${line.variantTitle ?? ""}`;
      const dayMap = productByDay.get(day) ?? new Map<string, Agg>();
      laggPaMix(dayMap, key, line);
      productByDay.set(day, dayMap);
      if (medLand) {
        const land = landPerOrder.get(line.__parentId) ?? "";
        const perLand = productByDayMarknad.get(day) ?? new Map<string, Map<string, Agg>>();
        const landMap = perLand.get(land) ?? new Map<string, Agg>();
        laggPaMix(landMap, key, line);
        perLand.set(land, landMap);
        productByDayMarknad.set(day, perLand);
      }
      kundOrdrar.get(line.__parentId)?.lines.push({
        variantGid: line.variant?.id ?? null,
        quantity: line.quantity ?? 0,
        unitCost: null,
      });
    }
  }

  const productsByDay: Record<string, ProductRow[]> = {};
  for (const [day, m] of productByDay) productsByDay[day] = [...m.values()] as ProductRow[];

  /* Uppdelningen per marknad. Dagar utan ordrar får ett tomt objekt — det
     skiljer "uppdelad, men inget sålt" från "aldrig uppdelad" (null). */
  let marketsByDay: OrderData["marketsByDay"] = null;
  if (medLand) {
    marketsByDay = {};
    for (const d of salesBy.keys()) {
      const perLand: Record<string, MarknadsDel> = {};
      for (const [land, s] of salesByMarknad.get(d) ?? []) {
        const { day: _dag, ...rest } = s;
        perLand[land] = {
          ...rest,
          products: [...(productByDayMarknad.get(d)?.get(land)?.values() ?? [])] as ProductRow[],
        };
      }
      marketsByDay[d] = perLand;
    }
  }

  /* Timmarna. Varje dag i fönstret får ett objekt även när inget såldes —
     det skiljer "hämtad, tom timme" från "dagen är inte timuppdelad än". */
  const hoursByDay: OrderData["hoursByDay"] = {};
  for (const d of salesBy.keys()) {
    const perTimme: Record<string, Record<string, Omit<MarknadsDel, "products">>> = {};
    for (const [timme, perLand] of salesByTimme.get(d) ?? []) {
      const rader: Record<string, Omit<MarknadsDel, "products">> = {};
      for (const [land, sd] of perLand) {
        const { day: _dag, ...rest } = sd;
        rader[land] = rest;
      }
      perTimme[String(timme)] = rader;
    }
    hoursByDay[d] = perTimme;
  }

  return {
    sales: [...salesBy.values()],
    products: mergeProductRows(Object.values(productsByDay).flat()),
    productsByDay,
    marketsByDay,
    hoursByDay,
    kundOrdrar: [...kundOrdrar.values()],
  };
}

/** Orderns betalning: faktiska avgifter, Shopify Payments eller ej, betalväg. */
export interface Betalning {
  avgift: number;
  /**
   * Ordern betalades genom Shopify Payments: en lyckad SALE/CAPTURE med
   * gateway `shopify_payments` — eller som bär `fees` (bara Shopify Payments
   * skriver dem, så en avgift bevisar det även om gatewaynamnet skulle
   * skilja sig). Då täcker `avgift` orderns omsättning.
   */
  sp: boolean;
  /** Betalvägen omsättningen bokförs på i `gatewaySales` ("" = ingen). */
  gateway: string;
}

/* Transaktionstyper där pengarna faktiskt dras. AUTHORIZATION räknas INTE som
   täckt: en reservation som ännu inte dragits har inga avgifter än, och en
   täckt order med avgift 0 är exakt den nolla fixen finns för. Den räknas med
   satsen tills capture kommer (returkollen hämtar om 45 dagar var 6:e timme). */
const DRAGNING = new Set(["SALE", "CAPTURE"]);

/**
 * Summerar `fees` på en orders transaktioner. Bulk-exporten ger dem som
 * `transactions` (lista) på orderraden; pagineringen likaså. Bara lyckade
 * transaktioner räknas — en nekad betalning har ingen avgift som drogs.
 */
export function summeraAvgifter(transaktioner: unknown): Betalning {
  const lista: any[] = Array.isArray(transaktioner)
    ? transaktioner
    : Array.isArray((transaktioner as any)?.nodes)
      ? (transaktioner as any).nodes
      : Array.isArray((transaktioner as any)?.edges)
        ? (transaktioner as any).edges.map((e: any) => e?.node)
        : [];
  let summa = 0;
  let sp = false;
  let dragVag: string | null = null;
  let reservVag: string | null = null;
  let nagonVag: string | null = null;
  for (const t of lista) {
    if (!t) continue;
    const vag = typeof t.gateway === "string" ? t.gateway.toLowerCase() : null;
    nagonVag ??= vag;
    if (t.status && t.status !== "SUCCESS") continue;
    const avgifter: any[] = Array.isArray(t.fees) ? t.fees : [];
    for (const f of avgifter) summa += num(f?.amount?.amount);
    /* Saknas kind (äldre testfixturer) räknas transaktionen som en dragning,
       samma milda regel som för status ovan. */
    const drar = !t.kind || DRAGNING.has(String(t.kind).toUpperCase());
    if (drar && (vag === SP_GATEWAY || avgifter.length > 0)) sp = true;
    if (drar) dragVag ??= vag;
    else if (String(t.kind).toUpperCase() === "AUTHORIZATION") reservVag ??= vag;
  }
  return {
    avgift: summa,
    sp,
    gateway: sp ? SP_GATEWAY : (dragVag ?? reservVag ?? nagonVag ?? INGEN_GATEWAY),
  };
}

/**
 * Slår ihop produktrader (samma variant över flera dagar) till en per variant.
 * Bär raderna en marknad hålls marknaderna isär — samma variant såld till
 * Sverige och Norge blir två rader, för de ska räknas på olika kostnad.
 */
export function mergeProductRows(rows: ProductRow[]): ProductRow[] {
  const by = new Map<string, ProductRow>();
  for (const r of rows) {
    const key = `${r.market ?? ""}\u0000${r.variantGid ?? `${r.title}|${r.variantTitle ?? ""}`}`;
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

/** En sida ur `orders(first: 50)`: noderna och sidinfo, som GraphQL ger dem. */
export interface Ordersida {
  nodes?: any[] | null;
  pageInfo?: { hasNextPage?: boolean | null; endCursor?: string | null } | null;
}

/**
 * Bläddrar igenom ordersidor och plattar ut dem till samma radformat som
 * bulk-exporten (order, sedan dess radartiklar med `__parentId`), så båda
 * vägarna delar parser.
 *
 * `trunkerad` är hela poängen. Förut slutade loopen efter `maxSidor` och
 * returnerade det den hade, utan flagga — och `refreshDaily` skrev resultatet
 * som sanning. En butik med 150 ordrar/dag som öppnade 7d (nio dagar med
 * marginalen, ~1 350 ordrar) tappade tyst en fjärdedel av ordrarna och deras
 * COGS medan annonskostnaden var komplett. Trunkerad betyder:
 * - `hasNextPage` är fortfarande sant efter sista tillåtna sidan, eller
 * - någon order har fler radartiklar än frågan tog (`lineItems.pageInfo`).
 * Anroparen avgör vad som händer då (bulk-exporten, som saknar tak). Vid
 * radtrunkering avbryts bläddringen direkt — resultatet kastas ändå, och
 * varje sida kostar ur API-budgeten.
 *
 * `hamtaSida` ska själv hantera strypning och kasta på fel: ett fel här får
 * aldrig bli en tom lista (se misstagsloggen om Norge och Finland).
 */
export async function paginera(
  hamtaSida: (after: string | null) => Promise<Ordersida>,
  maxSidor = 20,
): Promise<{ lines: any[]; trunkerad: boolean }> {
  const lines: any[] = [];
  let after: string | null = null;
  for (let sida = 0; sida < maxSidor; sida++) {
    const conn = await hamtaSida(after);
    let radTrunkerad = false;
    for (const o of conn.nodes ?? []) {
      lines.push({ ...o, lineItems: undefined });
      for (const li of o.lineItems?.nodes ?? []) lines.push({ ...li, __parentId: o.id });
      if (o.lineItems?.pageInfo?.hasNextPage) radTrunkerad = true;
    }
    if (radTrunkerad) return { lines, trunkerad: true };
    if (!conn.pageInfo?.hasNextPage) return { lines, trunkerad: false };
    after = conn.pageInfo.endCursor ?? null;
  }
  return { lines, trunkerad: true };
}
