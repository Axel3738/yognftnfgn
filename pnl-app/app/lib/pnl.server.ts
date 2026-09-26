/**
 * Räknemotorn.
 *
 * Portad från artifact-panelen och verifierad mot Bäverbutikens riktiga siffror
 * (juli–augusti 2026). Ren funktion utan I/O — allt som behövs skickas in, så den
 * går att enhetstesta utan Shopify.
 *
 * Grundekvationen:
 *   TB = försäljning − COGS − tull − annonskostnad
 * Tullen är per ORDER, inte per styck. Det är hela poängen med bundles: ett
 * 3-pack betalar tullen en gång.
 */

import { andelUtan, arKostnadOsaker } from "./kostnadstackning.ts";
import { malUtrymmeFor, skalningsKvoter } from "./skalning.ts";

/* Skalningsbeslutet bor i skalning.ts (får importeras av klienten); motorn
   exporterar det vidare så att alla räknar med samma funktion. */
export {
  bidragsBand,
  skalningsBeslut,
  skalningsKvoter,
  MIN_DAGAR_SKALA,
  MIN_ORDRAR_BESLUT,
  type Beslut,
  type BidragsBand,
  type SkalningsBeslut,
} from "./skalning.ts";

export interface SalesDay {
  day: string; // YYYY-MM-DD
  orders: number;
  grossSales: number;
  discounts: number;
  returns: number;
  netSales: number;
  totalSales: number; // inkl. fraktintäkt
  shippingCharges: number;
  /**
   * Dagens FAKTISKA betalavgifter ur ordertransaktionerna (Shopify Payments).
   * Null/saknas = okänt för dagen → motorn räknar den dagen med procentsatsen.
   */
  fees?: number | null;
}

export interface SessionDay {
  day: string;
  sessions: number;
  cartAdditions: number;
  reachedCheckout: number;
  completedCheckout: number;
}

export interface SpendDay {
  day: string;
  spend: number;
  impressions: number;
  clicks: number;
}

/**
 * En dags försäljning och produktmix för EN marknad (landskod). Summan av
 * alla marknaders delar är dagens totalrad. Bor i DailyPnl.markets.
 */
export interface MarknadsDel {
  orders: number;
  grossSales: number;
  discounts: number;
  returns: number;
  netSales: number;
  totalSales: number;
  shippingCharges: number;
  /** Faktiska avgifter för marknadens ordrar den dagen. Null = okänt. */
  fees?: number | null;
  products: ProductRow[];
}

export interface ProductRow {
  productGid: string;
  variantGid: string | null;
  title: string;
  variantTitle: string | null;
  units: number;
  netSales: number;
  /** Nuvarande unitCost från Shopify. Null = kostnad saknas. */
  unitCost: number | null;
  /**
   * Marknaden (landskod) raden såldes på. Sätts när dagsraderna bär en
   * uppdelning per marknad; då räknas COGS med marknadens egen kostnad.
   * Saknas/"" = okänd marknad eller sammanslagen rad → standardkostnaden.
   */
  market?: string;
  /**
   * Antal orderrader per antal i raden: { "1": 40, "2": 6, "3": 1 }.
   * Det är vad flerpackskostnaden räknas på — en rad med tre stycken kostar
   * inte tre gånger styckpriset. Saknas (äldre dagsrader) räknas alla
   * enheter som styckköp.
   */
  lines?: Record<string, number>;
  /**
   * Kostnaden är panelens UPPSKATTNING (X % av priset), inte ett inköpspris.
   * Sätts i panelens loader när butiken valt uppskattad COGS; bärs hela vägen
   * till produkttabellen så att raden visas med "≈" och aldrig läses som
   * riktig.
   */
  estimated?: boolean;
}

/** Totalkostnad för `units` stycken i samma orderrad. Antal 1 = unitCost. */
export interface CostTierRow {
  variantGid: string;
  units: number;
  totalCost: number;
  /** Marknad (landskod) steget gäller. Tom/saknas = standard. */
  market?: string;
}

/**
 * Kostnaden för en orderrad med `qty` stycken, givet styckpriset och
 * leverantörens stegpriser. Exakt steg vinner. Annars närmaste lägre steg
 * plus resten till det stegets marginalpris (skillnaden mot steget före).
 */
export function tierCost(qty: number, unitCost: number, tiers: CostTierRow[]): number {
  const steps = [{ units: 1, totalCost: unitCost }, ...tiers.filter((t) => t.units > 1)]
    .sort((a, b) => a.units - b.units);
  let below = steps[0];
  let before: typeof below | null = null;
  for (const s of steps) {
    if (s.units === qty) return s.totalCost;
    if (s.units > qty) break;
    if (s !== below) {
      before = below;
      below = s;
    }
  }
  const marginal = before
    ? (below.totalCost - before.totalCost) / (below.units - before.units)
    : unitCost;
  return below.totalCost + (qty - below.units) * marginal;
}

/** Radens COGS: stegpriser per orderrad när de finns, annars styck × antal. */
export function rowCost(row: ProductRow, unitCost: number, tiers: CostTierRow[]): number {
  if (!tiers.length || !row.lines) return unitCost * row.units;
  let total = 0;
  let covered = 0;
  for (const [q, n] of Object.entries(row.lines)) {
    const qty = Number(q);
    if (!(qty > 0) || !(n > 0)) continue;
    total += tierCost(qty, unitCost, tiers) * n;
    covered += qty * n;
  }
  // Enheter utan radinformation (blandade källor) räknas som styckköp.
  if (row.units > covered) total += (row.units - covered) * unitCost;
  return total;
}

export interface CostChangeRow {
  productGid: string;
  variantGid: string | null;
  unitCost: number;
  effectiveFrom: string; // YYYY-MM-DD
  note?: string | null;
  /**
   * Marknad (landskod) kostnaden gäller. Tom/saknas = standard, den som
   * används för marknader utan egen post. Frakten till USA och till Sverige
   * är två helt olika tal — därför finns den här dimensionen.
   */
  market?: string;
}

export interface Settings {
  tariffPerOrder: number;
  /** Standardavgift, andel av omsättningen. Gäller marknader utan egen post. */
  feeRate: number;
  targetMargin: number;
  /**
   * Avgifter per marknad (landskod). `feeRate` ersätter standardavgiften för
   * marknaden; `fxFeeRate` är valutaväxlingsavgiften (Shopify Payments tar
   * den när kunden betalar i en annan valuta än butikens). Summan tas på
   * marknadens omsättning.
   */
  marketFees?: Record<
    string,
    { feeRate?: number | null; fxFeeRate?: number | null; tariffPerOrder?: number | null }
  >;
}

/** Effektiv avgiftsandel för en marknad: egen post om den finns, annars standard. */
export function feeRateFor(settings: Settings, market: string): number {
  const egen = settings.marketFees?.[market];
  if (!market || !egen) return settings.feeRate;
  return (egen.feeRate ?? settings.feeRate) + (egen.fxFeeRate ?? 0);
}

/**
 * Tull per order för en marknad. Ett BELOPP, inte en andel: en EU-order och
 * en USA-order i samma butik bär helt olika tull, och ingen av dem är en
 * procentsats av ordervärdet.
 */
export function tariffFor(settings: Settings, market: string): number {
  const egen = settings.marketFees?.[market];
  if (!market || !egen || egen.tariffPerOrder == null) return settings.tariffPerOrder;
  return egen.tariffPerOrder;
}

export interface ComputeInput {
  from: string;
  to: string;
  /**
   * true = annonskällan svarade utan fel, så dagar utan spendrad är äkta
   * nollor (Meta rapporterar inga rader för dagar utan leverans). false =
   * källan saknas eller felade — då är TB för högt och ska flaggas.
   */
  spendReliable?: boolean;
  /** Summa av alla fasta månadskostnader (abonnemang, löner). Slås ut per dag. */
  fixedMonthlyTotal?: number;
  sales: SalesDay[];
  sessions: SessionDay[];
  spend: SpendDay[];
  products: ProductRow[];
  costChanges: CostChangeRow[];
  /** Flerpackspriser per variant. Tom = allt räknas per styck. */
  costTiers?: CostTierRow[];
  settings: Settings;
  /**
   * Omsättning (totalSales) per marknad för perioden — så avgifterna kan
   * räknas med varje marknads egen sats. Saknas → hela omsättningen på
   * standardavgiften. Summan behöver inte täcka allt: resten tar standard.
   */
  salesByMarket?: Record<string, number>;
  /**
   * Antal ordrar per marknad i intervallet. Underlaget för tull per marknad:
   * tullen är ett belopp per order, så den måste räknas på ordrarna och inte
   * på omsättningen. Ordrar utan marknad tar butikens standardtull.
   */
  ordersByMarket?: Record<string, number>;
  /**
   * Varianter handlaren uttryckligen sagt är gratis (gåvor, prover). En
   * kostnad på 0 räknas då som riktig. Alla andra nollor räknas som saknad
   * kostnad i täckningen — ett 0,00 från en dropship-app eller en CSV är
   * mycket oftare ett tomt fält än en gratis vara.
   */
  freeVariants?: string[];
}

export interface ProductResult extends ProductRow {
  /** Kostnaden som faktiskt användes — kan vara viktad, se `blend`. */
  effectiveCost: number | null;
  cogs: number | null;
  contribution: number | null;
  /** Marginal på radnivå, andel av nettoförsäljning. */
  margin: number | null;
  /** Pris delat med kostnad. Det är "x från total cost". */
  multiple: number | null;
  /**
   * Andel av perioden som använder den nya kostnaden.
   * null = ingen ändring gäller · 1 = helt ny · 0 < b < 1 = viktat snitt.
   */
  blend: number | null;
  blendNote: string | null;
  /**
   * Kostnaden är exakt 0 och varianten är inte kvitterad som gratis.
   * Visas som "0?" i produkttabellen och räknas som saknad i täckningen.
   */
  zeroCost: boolean;
}

export interface Totals {
  orders: number;
  grossSales: number;
  discounts: number;
  netSales: number;
  totalSales: number;
  shipping: number;
  sessions: number;
  cartAdditions: number;
  reachedCheckout: number;
  completedCheckout: number;
  spend: number;
  clicks: number;
  impressions: number;

  aov: number | null;
  cvr: number | null;
  ctr: number | null;
  cpc: number | null;
  cpa: number | null;
  mer: number | null;

  cogs: number;
  tariff: number;
  fees: number;
  grossMargin: number | null;

  /** Täckningsbidrag före kortavgift. */
  contribution: number;
  /** Täckningsbidrag efter kortavgift. Det här är vinsten. */
  netContribution: number;

  /** MER som krävs för att gå plus minus noll. */
  breakEvenMer: number | null;
  /** ROAS som krävs för att gå plus minus noll. */
  breakEvenRoas: number | null;
  /** Max CPA för att nå målmarginalen. */
  maxCpaAtTarget: number | null;
  /**
   * MER som krävs för målmarginalen: omsättning / (bruttovinst − målmarginal
   * × omsättning). Samma tröskel som `maxCpaAtTarget` i MER-form — CPA ≤
   * max-CPA gäller precis när MER ≥ targetMer. Null när målet inte går att nå
   * ens utan annonser.
   */
  targetMer: number | null;
  /** CPA där annonserna äter hela bruttovinsten: bruttovinst / ordrar. Null
   *  när bruttovinsten är ≤ 0 (då finns ingen break-even, precis som MER). */
  breakEvenCpa: number | null;
  /** Evolves tumregel break-even + 1. Bara referens, aldrig beslutsgrund. */
  evolveScaling: number | null;

  /** Fasta kostnader för perioden: (månadssumma × 12 / 365) × antal dagar. */
  fixedCosts: number;
  /** Omsättning − COGS − tull − avgifter. Före annonser och fasta. */
  grossProfit: number;
  /** Det som faktiskt blir kvar: bruttovinst − annonser − fasta kostnader. */
  netProfit: number;

  unitsWithoutCost: number;
  /**
   * Nettoförsäljning på rader UTAN kostnad (null). De bidrar 0 till COGS, så
   * vinsten är för hög med hela deras verkliga varukostnad.
   */
  netSalesWithoutCost: number;
  /** Nettoförsäljning och enheter på rader med kostnad exakt 0 som inte är
   *  kvitterade som gratis (`freeVariants`). Samma effekt som saknad kostnad. */
  netSalesZeroCost: number;
  unitsZeroCost: number;
  /** Summan av produktradernas (positiva) nettoförsäljning — nämnaren i
   *  täckningen. Gruppsumman behöver den för att väga ihop butikerna. */
  productNetSales: number;
  /**
   * Andel av produktraderna nettoförsäljning som har en riktig kostnad:
   * 1 − (utan kostnad + otillåtna nollor) / nettoförsäljning. Null när
   * nettoförsäljningen är noll — då finns inget att döma.
   */
  cogsCoverage: number | null;
  /**
   * Mer än KOSTNAD_TROSKEL (2 %) av nettoförsäljningen saknar riktig kostnad.
   * Då är vinsten en ÖVRE gräns och break-even en UNDRE — ingen grön hjälte,
   * ingen konfetti, ingen grön vinstruta.
   */
  kostnadOsaker: boolean;
  /** Dagar med försäljning men utan annonsdata. TB blir för högt när den inte är tom. */
  missingSpendDays: string[];
  spendComplete: boolean;
  /** Dagar vars avgifter är FAKTISKA (ur ordertransaktionerna), av periodens dagar. */
  feesKnownDays: number;
  /** Avgifter som andel av omsättningen, faktiskt + sats för resten. */
  effFeeRate: number;
}

export interface ComputeResult {
  from: string;
  to: string;
  days: string[];
  sales: SalesDay[];
  sessions: SessionDay[];
  spendByDay: Record<string, SpendDay>;
  products: ProductResult[];
  totals: Totals;
  /** Kostnadsändringar som påverkade perioden → vikt. För UI-noten. */
  appliedCostChanges: { note: string; weight: number }[];
}

const inRange = (day: string, from: string, to: string) => day >= from && day <= to;
const sum = <T,>(xs: T[], f: (x: T) => number) => xs.reduce((a, x) => a + f(x), 0);
const div = (a: number, b: number) => (b > 0 ? a / b : null);

/**
 * Vilken kostnadsändring gäller för en variant vid ett givet datum?
 *
 * Radens MARKNAD går först: finns en post för just det landet vinner den,
 * oavsett datum — den beskriver vad varan kostar att få dit. Först därefter
 * standardposterna (market ""). Inom samma marknad: senaste giltiga datum
 * vinner, och på samma datum slår variantspecifik produktbred.
 */
export function resolveChange(
  changes: CostChangeRow[],
  row: ProductRow,
  onOrAfter: string,
): CostChangeRow | null {
  const marknad = row.market ?? "";
  const candidates = changes.filter(
    (c) =>
      c.productGid === row.productGid &&
      (c.variantGid === null || c.variantGid === row.variantGid) &&
      c.effectiveFrom <= onOrAfter &&
      ((c.market ?? "") === "" || (c.market ?? "") === marknad),
  );
  if (!candidates.length) return null;
  candidates.sort((a, b) => {
    const am = (a.market ?? "") === marknad && marknad !== "" ? 1 : 0;
    const bm = (b.market ?? "") === marknad && marknad !== "" ? 1 : 0;
    if (am !== bm) return bm - am;
    if (a.effectiveFrom !== b.effectiveFrom) return a.effectiveFrom < b.effectiveFrom ? 1 : -1;
    // samma datum: variantspecifik vinner över produktbred
    return (b.variantGid ? 1 : 0) - (a.variantGid ? 1 : 0);
  });
  return candidates[0];
}

/**
 * Flerpackstegen för en rad: marknadens egna om den har några, annars
 * standardens. Blandas aldrig — ett norskt tvåpackspris bredvid ett svenskt
 * trepackspris hade gett en trappa som inte finns hos någon leverantör.
 */
export function tiersFor(tiers: CostTierRow[], variantGid: string, market: string): CostTierRow[] {
  const mina = tiers.filter((t) => t.variantGid === variantGid);
  if (market) {
    const egna = mina.filter((t) => (t.market ?? "") === market);
    if (egna.length) return egna;
  }
  return mina.filter((t) => (t.market ?? "") === "");
}

export function compute(input: ComputeInput): ComputeResult {
  const { from, to, settings } = input;

  const sales = input.sales.filter((s) => inRange(s.day, from, to));
  const sessions = input.sessions.filter((s) => inRange(s.day, from, to));

  const spendByDay: Record<string, SpendDay> = {};
  for (const s of input.spend) {
    if (!inRange(s.day, from, to)) continue;
    const b = (spendByDay[s.day] ??= { day: s.day, spend: 0, impressions: 0, clicks: 0 });
    b.spend += s.spend;
    b.impressions += s.impressions;
    b.clicks += s.clicks;
  }

  const netTotal = sum(sales, (s) => s.netSales);

  /**
   * Produktmixen kommer aggregerad för hela perioden, inte per dag — så en
   * kostnadsändring mitt i perioden går inte att applicera exakt. Vi viktar
   * efter omsättning per dag: andelen av periodens nettoförsäljning som ligger
   * på eller efter brytdatumet. Approximationen redovisas i UI:t.
   */
  const weightSince = (isoDate: string): number => {
    if (to < isoDate) return 0;
    if (from >= isoDate) return 1;
    if (netTotal <= 0) return 0;
    return sum(sales.filter((s) => s.day >= isoDate), (s) => s.netSales) / netTotal;
  };

  const appliedNotes = new Map<string, number>();
  const allaTiers = input.costTiers ?? [];
  const fria = new Set(input.freeVariants ?? []);
  let cogs = 0;
  let unitsWithoutCost = 0;
  /* Täckningen räknas på produktradernas EGEN nettoförsäljning — samma
     underlag i täljare och nämnare. Dagsradernas netSales drar dessutom av
     returer, som produktraderna inte gör; blandas de hade andelen glidit. */
  let underlag = 0;
  let netSalesWithoutCost = 0;
  let netSalesZeroCost = 0;
  let unitsZeroCost = 0;

  const products: ProductResult[] = input.products
    .map((row): ProductResult => {
      let cost = row.unitCost;
      let blend: number | null = null;
      let blendNote: string | null = null;

      const change = resolveChange(input.costChanges, row, to);
      if (change) {
        const w = weightSince(change.effectiveFrom);
        if (w > 0) {
          cost = cost != null ? cost * (1 - w) + change.unitCost * w : change.unitCost;
          blend = w;
          blendNote = change.note ?? `ny kostnad från ${change.effectiveFrom}`;
          appliedNotes.set(blendNote, w);
        }
      }

      const tiers = row.variantGid ? tiersFor(allaTiers, row.variantGid, row.market ?? "") : [];
      const rowCogs = cost != null ? rowCost(row, cost, tiers) : null;
      if (rowCogs != null) cogs += rowCogs;
      else unitsWithoutCost += row.units;

      /* Negativa rader (en order som krediterats mer än den sålde) får inte
         dra ner underlaget och ge täckning över 100 %. */
      const oms = Math.max(0, row.netSales);
      underlag += oms;
      /* En nolla är bara misstänkt om hela radens COGS blev noll: ett
         styckpris 0 med riktiga flerpackspriser har en kostnad inlagd. */
      const zeroCost =
        rowCogs === 0 && cost === 0 && !(row.variantGid != null && fria.has(row.variantGid));
      if (rowCogs == null) netSalesWithoutCost += oms;
      else if (zeroCost) {
        netSalesZeroCost += oms;
        unitsZeroCost += row.units;
      }

      const contribution = rowCogs != null ? row.netSales - rowCogs : null;
      return {
        ...row,
        effectiveCost: cost,
        cogs: rowCogs,
        contribution,
        margin: rowCogs != null && row.netSales > 0 ? (contribution as number) / row.netSales : null,
        multiple:
          cost != null && cost > 0 && row.units > 0 ? row.netSales / row.units / cost : null,
        blend,
        blendNote,
        zeroCost,
      };
    })
    .sort((a, b) => b.netSales - a.netSales);

  const andelUtanKostnad = andelUtan(netSalesWithoutCost + netSalesZeroCost, underlag);

  const orders = sum(sales, (s) => s.orders);
  const totalSales = sum(sales, (s) => s.totalSales);
  const netSales = sum(sales, (s) => s.netSales);
  const spend = sum(Object.values(spendByDay), (s) => s.spend);
  const clicks = sum(Object.values(spendByDay), (s) => s.clicks);
  const impressions = sum(Object.values(spendByDay), (s) => s.impressions);
  const sess = sum(sessions, (s) => s.sessions);
  const completed = sum(sessions, (s) => s.completedCheckout);

  /* Tullen per marknad: varje marknads ordrar bär sin egen tull, och ordrar
     som inte är fördelade på marknad bär butikens standard. En butik som
     säljer både till EU och till Nordamerika har två helt olika tal. */
  let tariff = 0;
  let ordrarFordelade = 0;
  for (const [m, antal] of Object.entries(input.ordersByMarket ?? {})) {
    tariff += antal * tariffFor(settings, m);
    ordrarFordelade += antal;
  }
  tariff += Math.max(0, orders - ordrarFordelade) * settings.tariffPerOrder;
  /* Avgifterna. Först det som FAKTISKT drogs: dagar med `fees` ur
     ordertransaktionerna räknas rakt av — kortavgift, växlingsavgift,
     utländskt kort, allt Shopify Payments tog. Dagar utan känd avgift
     (äldre rader, eller Shopify lämnade inte ut fältet) räknas med satsen
     per marknad: USA-ordrar bär USA:s kortavgift plus växlingsavgiften,
     svenska ordrar standarden. Omsättning som inte är fördelad på marknad
     tar standardsatsen. */
  let faktiska = 0;
  let omsMedFaktiska = 0;
  let feesKnownDays = 0;
  for (const s of sales) {
    if (s.fees == null) continue;
    faktiska += s.fees;
    omsMedFaktiska += s.totalSales;
    feesKnownDays++;
  }
  let satsBaserat = 0;
  let fordelad = 0;
  for (const [m, belopp] of Object.entries(input.salesByMarket ?? {})) {
    satsBaserat += belopp * feeRateFor(settings, m);
    fordelad += belopp;
  }
  satsBaserat += Math.max(0, totalSales - fordelad) * settings.feeRate;
  /* Satsen gäller bara den del av omsättningen som saknar faktisk avgift. */
  const okandAndel = totalSales > 0 ? Math.max(0, totalSales - omsMedFaktiska) / totalSales : 0;
  const fees = faktiska + satsBaserat * okandAndel;
  /* Den blandade satsen — det break-even och max-CPA ska räkna med. */
  const effFeeRate = totalSales > 0 ? fees / totalSales : settings.feeRate;
  const contribution = totalSales - cogs - tariff - spend;

  // Rörlig kostnad exkl. annons. Break-even är där annonsbudgeten äter upp resten.
  const variableCost = cogs + tariff + fees;
  const grossContribution = totalSales - variableCost;

  const dayCount = sales.length;
  const fixedCosts = ((input.fixedMonthlyTotal ?? 0) * 12 / 365) * dayCount;
  const grossProfit = totalSales - cogs - tariff - fees;

  /* Skalningskvoterna ur EN funktion (skalning.ts) — gruppens rader räknar
     med samma, så MER-rutan och tabellen kan inte döma olika. */
  const kvoter = skalningsKvoter({ totalSales, spend, grossProfit, targetMargin: settings.targetMargin });
  /* Max-CPA och targetMer delar täljare. Förut stod max-CPA som
     omsättning × (1 − mål − avgiftssats) − COGS − tull: matematiskt samma
     sak, men flyttalen kunde skilja sig på sista decimalen, och då hade
     CPA-rutan och MER-rutan kunnat säga olika precis på gränsen. */
  const malUtrymme = malUtrymmeFor(grossProfit, settings.targetMargin, totalSales);

  const missingSpendDays = input.spendReliable
    ? []
    : sales.filter((s) => s.totalSales > 0 && !spendByDay[s.day]).map((s) => s.day);

  const totals: Totals = {
    orders,
    grossSales: sum(sales, (s) => s.grossSales),
    discounts: sum(sales, (s) => s.discounts),
    netSales,
    totalSales,
    shipping: sum(sales, (s) => s.shippingCharges),
    sessions: sess,
    cartAdditions: sum(sessions, (s) => s.cartAdditions),
    reachedCheckout: sum(sessions, (s) => s.reachedCheckout),
    completedCheckout: completed,
    spend,
    clicks,
    impressions,

    aov: div(totalSales, orders),
    cvr: div(completed, sess),
    ctr: div(clicks, impressions),
    cpc: div(spend, clicks),
    cpa: div(spend, orders),
    mer: div(totalSales, spend),

    cogs,
    tariff,
    fees,
    grossMargin: netSales > 0 ? (netSales - cogs) / netSales : null,

    contribution,
    netContribution: contribution - fees,

    breakEvenMer: kvoter.breakEvenMer,
    breakEvenRoas: grossContribution > 0 ? totalSales / grossContribution : null,
    maxCpaAtTarget: orders > 0 ? malUtrymme / orders : null,
    targetMer: kvoter.targetMer,
    breakEvenCpa: orders > 0 && grossProfit > 0 ? grossProfit / orders : null,
    evolveScaling: kvoter.evolveScaling,

    fixedCosts,
    grossProfit,
    netProfit: grossProfit - spend - fixedCosts,

    unitsWithoutCost,
    netSalesWithoutCost,
    netSalesZeroCost,
    unitsZeroCost,
    productNetSales: underlag,
    cogsCoverage: andelUtanKostnad == null ? null : 1 - andelUtanKostnad,
    kostnadOsaker: arKostnadOsaker(andelUtanKostnad),
    missingSpendDays,
    spendComplete: missingSpendDays.length === 0,
    feesKnownDays,
    effFeeRate,
  };

  return {
    from,
    to,
    days: sales.map((s) => s.day),
    sales,
    sessions,
    spendByDay,
    products,
    totals,
    appliedCostChanges: [...appliedNotes].map(([note, weight]) => ({ note, weight })),
  };
}

/**
 * Slår ihop produktresultat som bara skiljer sig på marknad till en rad per
 * variant — för produkttabellen i vyn "alla marknader". COGS och TB summeras
 * (de är redan räknade med rätt kostnad per marknad); kostnad per styck och
 * multipel räknas om ur summorna. Blend-noten behålls bara när alla delar
 * har samma.
 */
export function slaIhopMarknader(rows: ProductResult[]): ProductResult[] {
  const by = new Map<string, ProductResult>();
  for (const r of rows) {
    const key = r.variantGid ?? `${r.title}|${r.variantTitle ?? ""}`;
    const a = by.get(key);
    if (!a) {
      by.set(key, { ...r, market: undefined, lines: r.lines ? { ...r.lines } : undefined });
      continue;
    }
    a.units += r.units;
    a.netSales += r.netSales;
    if (r.lines) {
      a.lines = { ...(a.lines ?? {}) };
      for (const [q, n] of Object.entries(r.lines)) a.lines[q] = (a.lines[q] ?? 0) + n;
    }
    /* Saknar någon del kostnad saknar summan det — en halv COGS är ingen COGS. */
    a.cogs = a.cogs != null && r.cogs != null ? a.cogs + r.cogs : null;
    a.contribution = a.cogs != null ? a.netSales - a.cogs : null;
    a.margin = a.cogs != null && a.netSales > 0 ? (a.contribution as number) / a.netSales : null;
    a.effectiveCost = a.cogs != null && a.units > 0 ? a.cogs / a.units : null;
    a.multiple =
      a.effectiveCost != null && a.effectiveCost > 0 && a.units > 0 ? a.netSales / a.units / a.effectiveCost : null;
    if (a.unitCost == null) a.unitCost = r.unitCost;
    /* En enda uppskattad eller misstänkt nollad del märker hela raden —
       annars försvinner märkningen i vyn "alla marknader". */
    a.estimated = Boolean(a.estimated || r.estimated) || undefined;
    a.zeroCost = a.zeroCost || r.zeroCost;
    if (a.blendNote !== r.blendNote) {
      a.blend = null;
      a.blendNote = null;
    }
  }
  return [...by.values()].sort((a, b) => b.netSales - a.netSales);
}

/** Datumfönster för de förvalda intervallen, relativt en ankardag. */
/**
 * Är det ett datum, eller något någon klistrat in i adressfältet?
 *
 * Kontrollen går fram och tillbaka: `Date.parse` accepterar "2026-02-31" och
 * rullar tyst fram till 3 mars, så panelen hade visat en annan dag än den
 * som stod i adressen. Bara datum som kommer tillbaka som sig själva duger.
 */
const arDatum = (s: unknown): s is string => {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T12:00:00Z`);
  /* Måste kollas FÖRE toISOString — den kastar på ett ogiltigt datum, och
     "2026-13-01" i adressen hade blivit ett femhundrafel. */
  if (Number.isNaN(d.getTime())) return false;
  return d.toISOString().slice(0, 10) === s;
};

/**
 * Egna datum ur adressen. De kommer från webbläsaren och får aldrig gå rakt
 * in i en databasfråga: ett ogiltigt datum blev `new Date("abc")` och tog ner
 * hela panelen. Skräp faller tillbaka på idag, bakvända datum vänds rätt,
 * framtiden klipps vid idag, och spannet begränsas till ett år bakåt (en
 * treårig period hade startat en orderexport som aldrig blev klar).
 */
export function egnaDatum(
  custom: { from: string; to: string } | undefined,
  anchor: string,
  shift: (iso: string, days: number) => string,
) {
  let from = arDatum(custom?.from) ? custom!.from : anchor;
  let to = arDatum(custom?.to) ? custom!.to : anchor;
  if (from > to) [from, to] = [to, from];
  if (to > anchor) to = anchor;
  if (from > to) from = to;
  const aldst = shift(to, -364);
  if (from < aldst) from = aldst;
  return [from, to] as const;
}

export function rangeWindow(key: string, anchor: string, custom?: { from: string; to: string }) {
  const shift = (iso: string, days: number) => {
    const d = new Date(iso + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };
  switch (key) {
    case "custom":
      return egnaDatum(custom, anchor, shift);
    case "today":
      return [anchor, anchor] as const;
    case "yesterday": {
      const y = shift(anchor, -1);
      return [y, y] as const;
    }
    case "7d":
      return [shift(anchor, -6), anchor] as const;
    case "90d":
      return [shift(anchor, -89), anchor] as const;
    default:
      return [shift(anchor, -29), anchor] as const;
  }
}
