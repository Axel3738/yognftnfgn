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
import type { ProductRow } from "./pnl.server";
import { hourInTz } from "./timmar";
import {
  dayInTz,
  mergeProductRows,
  num,
  paginera,
  parseOrderLines,
  summeraAvgifter,
  type KundOrderRa,
  type OrderData,
} from "./orderrader";

/* Parsern och sidbläddringen bor i orderrader.ts (testbar utan databas och
   SDK). De exporteras vidare härifrån så att ingen anropare behövde ändras. */
export { dayInTz, hourInTz, mergeProductRows, paginera, parseOrderLines, summeraAvgifter };
export type { KundOrderRa, OrderData };

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

const shiftIso = (iso: string, days: number): string => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/**
 * Ordrarna hämtas via Shopifys bulk-export (bulkOperationRunQuery) — den
 * paginerade vägen stryps av API:ts kostnadsmodell: varje sida med orderrader
 * kostar ~900 poäng och budgeten tar slut efter ett par sidor, varpå resten
 * droppar i väntetakt. 30 dagar tog minuter. Bulk-exporten är asynkron, utan
 * kostnadstak, och levererar allt som JSONL på 20–60 sekunder.
 *
 * Approximationer, medvetna och synliga:
 * - Returer bokförs på ORDERNS dag, inte återbetalningsdagen.
 * - Radrabatter ingår i discountedTotal; orderrabatter fördelas inte per rad
 *   i `netSales`. `discountedUnitPriceAfterAllDiscountsSet` (styckpris efter
 *   ALLA rabatter, även ordernivåns koder) ger `netRevenue`/`linesRevenue` —
 *   det produkttabellen och break-even per produkt räknar på. Shopify
 *   beskriver fältet som en approximation (öresavrundningen sprids över
 *   raderna).
 */
const inflight = new Map<string, Promise<OrderData>>();
/** Bulk-exportens tidsgräns för interaktiva anropare (panel, grupp). */
const BULK_TIMEOUT_MS = 90_000;

export function fetchOrderData(
  admin: AdminApiContext,
  from: string,
  to: string,
  timezone: string,
  shopKey = "",
  /**
   * `kund: true` lägger till `customer { id }` i orderfrågan. Får BARA sättas
   * när butikens scope innehåller read_customers — annars nekar Shopify hela
   * frågan (ACCESS_DENIED) och panelen dör för den butiken.
   *
   * `bulkTimeoutMs`: hur länge bulk-exporten får ta. 90 s för interaktiva
   * anropare (en panel ska hellre visa fel än hänga); returkollen i
   * bakgrunden ger 10 min — en stor butiks 45 dagar tar längre än 90 s, och
   * med det interaktiva taket misslyckades den på varje försök.
   */
  opts: { kund?: boolean; bulkTimeoutMs?: number } = {},
): Promise<OrderData> {
  /* Shopify tillåter EN bulk-operation per butik. Utan samordning krockar två
     samtidiga sidladdningar (t.ex. 30d-vyn som fortfarande exporterar när
     användaren klickar 90d) med "already in progress". Samma intervall delar
     promise; olika intervall köar via retry-logiken i runOrdersBulk.
     Tidsgränsen ingår medvetet INTE i nyckeln: hade en panel med samma
     fönster som returkollen startat en egen export hade den bara fått
     "already in progress" och väntat ut returkollens export ändå. */
  const key = `${shopKey}:${from}:${to}:${opts.kund ? "k" : ""}`;
  const existing = inflight.get(key);
  if (existing) return existing;
  const p = doFetchOrderData(admin, from, to, timezone, shopKey, Boolean(opts.kund), opts.bulkTimeoutMs).finally(() =>
    inflight.delete(key),
  );
  inflight.set(key, p);
  return p;
}

async function doFetchOrderData(
  admin: AdminApiContext,
  from: string,
  to: string,
  timezone: string,
  shopKey = "",
  kund = false,
  bulkTimeoutMs = BULK_TIMEOUT_MS,
): Promise<OrderData> {
  /* Korta fönster (dagens siffror, morgonens nya dagar) går via vanlig
     paginering: 1–2 sekunder istället för bulk-exportens halvminut, och de
     upptar inte butikens enda bulk-plats. Långa fönster stryps av API:ts
     kostnadsmodell och måste ta bulk-vägen. */
  const dayCount = (Date.parse(to) - Date.parse(from)) / 86_400_000 + 1;
  /* Landet i leveransadressen ger marknaden. Skulle Shopify neka just det
     fältet (skyddade kundfält) får ordrarna ändå hämtas — utan land, hellre
     en panel utan marknadsuppdelning än ingen panel alls. */
  /* Avgifterna läses ur ordertransaktionerna (Shopify Payments skriver sina
     avgifter per transaktion). Nekar Shopify det fältet hämtas utan — då
     räknar motorn med procentsatsen i stället för att stanna panelen. */
  let medLand = true;
  let medAvgifter = true;
  let jsonl: any[] | null = null;
  for (let forsok = 0; forsok < 3 && jsonl == null; forsok++) {
    try {
      const falt = { kund, land: medLand, avgifter: medAvgifter };
      if (dayCount <= 7) {
        const sidor = await runOrdersPaginated(admin, shiftIso(from, -1), shiftIso(to, 1), falt);
        /* Sidtaket nått (eller en order med fler rader än frågan tog): det
           halva resultatet får ALDRIG skrivas — det var så en butik med 150
           ordrar/dag tyst tappade en fjärdedel av 7d-vyns ordrar medan
           annonskostnaden var komplett. Samma fönster tas om via bulk-
           exporten, som saknar tak. Taket i sig kastar inte: den synkrona
           fyllningen awaitas i panelens loader, och ett kast där hade gett
           varje högvolymsbutik felsidan varje gång. Bara om bulk-exporten
           själv misslyckas kastas felet vidare. */
        jsonl = sidor.trunkerad
          ? await runOrdersBulk(admin, shiftIso(from, -1), shiftIso(to, 1), falt, bulkTimeoutMs)
          : sidor.lines;
        if (sidor.trunkerad) {
          console.log(`Sidtaket nåddes för ${shopKey || "butiken"} (${from}–${to}) — hämtade via bulk-exporten.`);
        }
      } else {
        jsonl = await runOrdersBulk(admin, shiftIso(from, -1), shiftIso(to, 1), falt, bulkTimeoutMs);
      }
    } catch (e) {
      if (medAvgifter && arAvgiftNekad(e)) {
        console.error(`Transaktionsavgifterna nekades för ${shopKey || "butiken"} — hämtar utan:`, (e as Error).message);
        medAvgifter = false;
      } else if (medLand && arAdressNekad(e)) {
        console.error(`Leveransadressen nekades för ${shopKey || "butiken"} — hämtar utan marknad:`, (e as Error).message);
        medLand = false;
      } else {
        throw e;
      }
    }
  }
  const data = parseOrderLines(jsonl ?? [], from, to, timezone, medLand, medAvgifter);

  const costs = await fetchVariantCosts(admin, shopKey);
  /* Kostnaden per orderrad sätts här, med samma katalog som produktmixen —
     tb per order i kundorder.server räknar sedan på exakt det panelen ser. */
  const kundOrdrar: KundOrderRa[] = kund
    ? data.kundOrdrar.map((o) => ({
        ...o,
        lines: o.lines.map((l) => ({
          ...l,
          unitCost: (l.variantGid ? costs.byGid.get(l.variantGid)?.unitCost : undefined) ?? null,
        })),
      }))
    : [];
  return {
    sales: data.sales,
    products: applyCurrentCosts(data.products, costs),
    productsByDay: Object.fromEntries(
      Object.entries(data.productsByDay).map(([d, rows]) => [d, applyCurrentCosts(rows, costs)]),
    ),
    marketsByDay: data.marketsByDay
      ? Object.fromEntries(
          Object.entries(data.marketsByDay).map(([d, perMarknad]) => [
            d,
            Object.fromEntries(
              Object.entries(perMarknad).map(([m, del]) => [m, { ...del, products: applyCurrentCosts(del.products, costs) }]),
            ),
          ]),
        )
      : null,
    /* Timmarna bär inga produktrader, så det finns inga kostnader att lägga
       på — de går rakt igenom. */
    hoursByDay: data.hoursByDay,
    kundOrdrar,
  };
}

/** Shopify nekade adressfältet (skyddad kunddata) — inte ett allmänt fel. */
const arAdressNekad = (e: unknown) =>
  /ACCESS_DENIED|not approved|protected customer|shippingAddress|billingAddress/i.test(String((e as Error)?.message ?? e));
/** Shopify nekade eller känner inte fältet `fees` på transaktionerna. */
const arAvgiftNekad = (e: unknown) => /\bfees\b|transactions|TransactionFee/i.test(String((e as Error)?.message ?? e));



/**
 * Hämtar korta fönster via vanlig paginering och returnerar samma radformat
 * som bulk-exporten, så båda vägarna delar parser. Sidstorleken är vald så att
 * begärd frågekostnad ryms i API:ts budget (50 ordrar × 25 rader).
 */
/* Kundfältet är det ENDA fältet i orderfrågorna som kräver en extra scope
   (read_customers). Det får bara med när anroparen vet att scopen finns. */
const kundFalt = (kund: boolean) => (kund ? "customer { id }" : "");
/* Landet i leveransadressen = marknaden. Bara landskoden begärs — inga namn,
   gator eller postnummer, som är skyddade kundfält. Faktureringsadressen är
   reserv för ordrar utan leverans (digitalt, upphämtning). */
const landFalt = (land: boolean) =>
  land ? "shippingAddress { countryCodeV2 } billingAddress { countryCodeV2 }" : "";
/* Faktiska avgifter per transaktion: det Shopify Payments drog — kortavgift,
   växlingsavgift, utländskt kort. Det enda talet som stämmer. `gateway` säger
   vilken betalväxel pengarna gick genom: bara Shopify Payments skriver fees,
   så en PayPal-order utan fees är INTE en order utan avgift — dess omsättning
   ska räknas med satsen (summeraAvgifter i orderrader.ts). Samma fält i den
   paginerade vägen och i bulk-exporten, via den här enda strängen. */
const avgiftFalt = (avgifter: boolean) =>
  avgifter ? "transactions(first: 20) { status kind gateway fees { amount { amount } type rateName } }" : "";

interface Orderfalt {
  kund: boolean;
  land: boolean;
  avgifter: boolean;
}

async function runOrdersPaginated(
  admin: AdminApiContext,
  fromExclusive: string,
  toInclusive: string,
  falt: Orderfalt,
): Promise<{ lines: any[]; trunkerad: boolean }> {
  const { kund, land, avgifter } = falt;
  return paginera(async (after) => {
    for (;;) {
      const res: Response = await admin.graphql(
        `#graphql
         query Orders($after: String, $q: String!) {
           orders(first: 50, after: $after, query: $q) {
             pageInfo { hasNextPage endCursor }
             nodes {
               id createdAt cancelledAt test
               ${kundFalt(kund)}
               ${landFalt(land)}
               ${avgiftFalt(avgifter)}
               totalPriceSet { shopMoney { amount } }
               subtotalPriceSet { shopMoney { amount } }
               totalDiscountsSet { shopMoney { amount } }
               totalShippingPriceSet { shopMoney { amount } }
               totalRefundedSet { shopMoney { amount } }
               lineItems(first: 25) {
                 pageInfo { hasNextPage }
                 nodes {
                   title variantTitle quantity
                   discountedTotalSet { shopMoney { amount } }
                   discountedUnitPriceAfterAllDiscountsSet { shopMoney { amount } }
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
      if (throttled) { await sleep(2000); continue; }
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
      return conn;
    }
  }, 20);
}

/**
 * Ser butiken ordrar äldre än 60 dagar? En order skapad före idag − 61 som
 * faktiskt kommer tillbaka bevisar det (read_all_orders, eller en äldre
 * registrering som Shopify låtit behålla full historik). Ett tomt svar är
 * säkert åt båda håll: antingen ingen åtkomst, eller inget äldre att hämta —
 * i båda fallen finns inget bortom horisonten som en hämtning kunde skriva.
 * Fel kastas; anroparen skriver då ingenting (ingen gissning sparas).
 */
export async function harFullOrderhistorik(admin: AdminApiContext, idag: string): Promise<boolean> {
  const grans = shiftIso(idag, -61);
  const res: Response = await admin.graphql(
    `#graphql
     query Historik($q: String!) { orders(first: 1, query: $q) { nodes { id } } }`,
    { variables: { q: `created_at:<'${grans}'` } },
  );
  const body = await res.json();
  if (body?.errors?.length) {
    throw new Error(`Order history probe failed: ${body.errors.map((e: any) => e?.message ?? String(e)).join("; ")}`);
  }
  const conn = body?.data?.orders;
  if (!conn) throw new Error(`Order history probe returned no data (HTTP ${res.status}).`);
  return (conn.nodes ?? []).length > 0;
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
  falt: Orderfalt,
  timeoutMs: number = BULK_TIMEOUT_MS,
): Promise<any[]> {
  const { kund, land, avgifter } = falt;
  const inner = `{
    orders(query: "created_at:>='${fromExclusive}' AND created_at:<='${toInclusive}'") {
      edges { node {
        id createdAt cancelledAt test
        ${kundFalt(kund)}
        ${landFalt(land)}
        ${avgiftFalt(avgifter)}
        totalPriceSet { shopMoney { amount } }
        subtotalPriceSet { shopMoney { amount } }
        totalDiscountsSet { shopMoney { amount } }
        totalShippingPriceSet { shopMoney { amount } }
        totalRefundedSet { shopMoney { amount } }
        lineItems {
          edges { node {
            id title variantTitle quantity
            discountedTotalSet { shopMoney { amount } }
            discountedUnitPriceAfterAllDiscountsSet { shopMoney { amount } }
            product { id }
            variant { id }
          } }
        }
      } }
    }
  }`;

  // En bulk-operation i taget per butik — vänta ut en pågående innan start.
  let lastErr = "";
  /* ID:t på exporten VI startade. Vi följer den och ingen annan: pollades
     `currentBulkOperation` kunde en annan export mot samma butik (panelen i
     en annan tjänst, returkollen) hinna starta mellan två pollningar, och då
     laddade vi ner DEN filen som vår. parseOrderLines nollfyller varje dag i
     vårt fönster — en 30-dagarsfil tolkad som 45 dagar skrev 0 kr försäljning
     på 15 riktiga dagar och raderade deras KundOrder-rader. */
  let egetId: string | null = null;
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
    if (!errs.length) {
      egetId = body?.data?.bulkOperationRunQuery?.bulkOperation?.id ?? null;
      if (!egetId) throw new Error("The order export started without an id — reload the page.");
      lastErr = "";
      break;
    }
    lastErr = errs.map((e: any) => e.message).join("; ");
    if (/already in progress/i.test(lastErr)) {
      /* Någon annans export (annat intervall) kör — vänta ut den och försök
         igen. Här räcker `currentBulkOperation`: vi läser aldrig dess fil,
         vi väntar bara tills platsen är ledig. */
      await vantaUtAnnanBulk(admin, 120_000).catch(() => {});
      continue;
    }
    throw new Error(`Could not start the order export: ${lastErr}`);
  }
  if (lastErr) {
    throw new Error(
      "Another order export is still running — wait half a minute and reload the page.",
    );
  }

  const url = await waitForBulk(admin, egetId!, timeoutMs);
  if (!url) return []; // export klar men noll objekt

  const dl = await fetch(url);
  if (!dl.ok) throw new Error(`Could not download the export file (HTTP ${dl.status}).`);
  const text = await dl.text();
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
}

/**
 * Pollar VÅR egen bulk-operation (via `node(id:)`) tills den är klar.
 * Returnerar nedladdnings-URL (null = tomt resultat). Följer aldrig
 * `currentBulkOperation` — den kan vara en annan process export.
 */
async function waitForBulk(admin: AdminApiContext, id: string, timeoutMs: number): Promise<string | null> {
  const start = Date.now();
  for (;;) {
    await sleep(2500);
    const res = await admin.graphql(
      `#graphql
       query Bulk($id: ID!) {
         node(id: $id) { ... on BulkOperation { id status errorCode url objectCount } }
       }`,
      { variables: { id } },
    );
    const body = await res.json();
    const op = body?.data?.node;
    /* Fel eller främmande id ska kasta, aldrig ge en tom lista: en tom lista
       nollfyller hela fönstret i DailyPnl och tömmer KundOrder. */
    if (!op || op.id !== id) throw new Error("The order export could not be found — reload the page.");
    if (op.status === "COMPLETED") return op.url ?? null;
    if (op.status === "FAILED" || op.status === "CANCELED" || op.status === "EXPIRED") {
      throw new Error(`The order export failed: ${op.errorCode ?? op.status}`);
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error("The order export took too long — try reloading in a moment.");
    }
  }
}

/** Väntar tills en ANNAN pågående bulk-operation mot butiken är klar. Läser aldrig dess fil. */
async function vantaUtAnnanBulk(admin: AdminApiContext, timeoutMs: number): Promise<void> {
  const start = Date.now();
  for (;;) {
    await sleep(2500);
    const res = await admin.graphql(
      `#graphql
       { currentBulkOperation { id status } }`,
    );
    const body = await res.json();
    const op = body?.data?.currentBulkOperation;
    if (!op || (op.status !== "CREATED" && op.status !== "RUNNING" && op.status !== "CANCELING")) return;
    if (Date.now() - start > timeoutMs) throw new Error("Another order export is still running.");
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
    if (Date.now() - rad.fetchedAt.getTime() > DB_TTL) void uppdateraKatalog(admin, shop, prisma).catch(() => {});
    return cat;
  }
  /* Misslyckas hämtningen ska sidan INTE dö. Hellre gammalt än tomt, och
     hellre tomt än ett fel — men ingenting av det sparas, så nästa anrop
     försöker igen. (Det gamla felet var det motsatta: ett halvt resultat
     sparades i en halvtimme och produkterna försvann tyst.) */
  return uppdateraKatalog(admin, shop, prisma).catch((e) => {
    console.error(`Katalogen kunde inte hämtas för ${shop}:`, e);
    return catalogCache.get(shop)?.cat ?? katalogAv([]);
  });
}

/* En omhämtning åt gången per butik. Två samtidiga (sidans omladdning plus
   nästa inmatning) paginerade 40 sidor var, Shopify strypte anropen och
   båda misslyckades. Nu delar de på samma hämtning. */
const pagande = new Map<string, Promise<VariantCatalog>>();

async function uppdateraKatalog(
  admin: AdminApiContext,
  shop: string,
  prisma: any,
): Promise<VariantCatalog> {
  const igang = pagande.get(shop);
  if (igang) return igang;

  const jobb = (async () => {
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
  })().finally(() => pagande.delete(shop));

  pagande.set(shop, jobb);
  return jobb;
}

/**
 * Efter en kostnadsskrivning vet vi exakt vilka varianter som ändrades och
 * till vad. Att slänga hela katalogen för den vetskapens skull tvingade fram
 * en ompaginering av upp till 40 sidor från Shopify — och den omhämtningen
 * krockade med nästa inmatning. *(Axel 2026-09-18: "man kan inte köra två i
 * raken", sidan måste laddas om och skärmbilden släppas igen.)*
 *
 * Nycklarna får vara variantens eller lagerpostens GID — anropsställena har
 * olika, och båda pekar på samma variant. Värdet `null` betyder att
 * kostnaden togs bort.
 */
export async function patchaKostnader(
  shop: string,
  prisma: any,
  andringar: Map<string, number | null>,
): Promise<void> {
  if (!andringar.size) return;
  const nyKostnad = (v: VariantCost): number | null | undefined =>
    andringar.has(v.inventoryItemGid)
      ? andringar.get(v.inventoryItemGid)
      : andringar.has(v.variantGid)
        ? andringar.get(v.variantGid)
        : undefined;

  const minne = catalogCache.get(shop);
  if (minne) {
    /* Samma objekt ligger i byGid, byTitle och all — en ändring räcker. */
    for (const v of minne.cat.all) {
      const n = nyKostnad(v);
      if (n !== undefined) v.unitCost = n;
    }
  }

  const rad = await prisma.catalogCache.findUnique({ where: { shop } }).catch(() => null);
  if (!rad) return;
  const all = (rad.payload as VariantCost[]).map((v) => {
    const n = nyKostnad(v);
    return n === undefined ? v : { ...v, unitCost: n };
  });
  /* fetchedAt rörs inte: bakgrundsuppdateringen ska ske på sitt schema. */
  await prisma.catalogCache.update({ where: { shop }, data: { payload: all as any } }).catch(() => {});
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
  let forsok = 0;

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
    /* Strypt av Shopify, eller ett tillfälligt fel. Att bryta här och spara
       det halva resultatet gjorde katalogen tom i en halvtimme: produkterna
       försvann ur appen utan ett enda felmeddelande. Vänta och försök igen,
       och ge hellre upp högt än tyst. */
    if (!conn) {
      if (forsok < 3) {
        forsok++;
        await new Promise((r) => setTimeout(r, 800 * forsok));
        page--;
        continue;
      }
      const fel = body?.errors?.[0]?.message ?? body?.errors?.message ?? "";
      throw new Error(`Could not read products from Shopify${fel ? `: ${fel}` : ""}`);
    }
    forsok = 0;

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

/**
 * Skriver unitCost på en variant. Kostnaden ska vara vara + frakt, utan tull.
 * `null` RENSAR fältet — det är så en felinlagd kostnad tas bort, så att
 * varianten åter räknas som "saknar kostnad" i stället för att kosta noll.
 */
export async function setUnitCost(
  admin: AdminApiContext,
  inventoryItemGid: string,
  cost: number | null,
): Promise<{ ok: boolean; error?: string }> {
  const res = await admin.graphql(
    `#graphql
     mutation SetCost($id: ID!, $input: InventoryItemInput!) {
       inventoryItemUpdate(id: $id, input: $input) {
         inventoryItem { id unitCost { amount } }
         userErrors { field message }
       }
     }`,
    { variables: { id: inventoryItemGid, input: { cost: cost == null ? null : cost.toFixed(2) } } },
  );
  const body = await res.json();
  const errs = body?.data?.inventoryItemUpdate?.userErrors ?? [];
  if (errs.length) return { ok: false, error: errs.map((e: any) => e.message).join("; ") };
  return { ok: true };
}
