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

export interface SalesDay {
  day: string; // YYYY-MM-DD
  orders: number;
  grossSales: number;
  discounts: number;
  returns: number;
  netSales: number;
  totalSales: number; // inkl. fraktintäkt
  shippingCharges: number;
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

export interface ProductRow {
  productGid: string;
  variantGid: string | null;
  title: string;
  variantTitle: string | null;
  units: number;
  netSales: number;
  /** Nuvarande unitCost från Shopify. Null = kostnad saknas. */
  unitCost: number | null;
}

export interface CostChangeRow {
  productGid: string;
  variantGid: string | null;
  unitCost: number;
  effectiveFrom: string; // YYYY-MM-DD
  note?: string | null;
}

export interface Settings {
  tariffPerOrder: number;
  feeRate: number;
  targetMargin: number;
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
  sales: SalesDay[];
  sessions: SessionDay[];
  spend: SpendDay[];
  products: ProductRow[];
  costChanges: CostChangeRow[];
  settings: Settings;
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

  unitsWithoutCost: number;
  /** Dagar med försäljning men utan annonsdata. TB blir för högt när den inte är tom. */
  missingSpendDays: string[];
  spendComplete: boolean;
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
 * Variantspecifik slår produktbred. Senaste giltiga datum vinner.
 */
function resolveChange(
  changes: CostChangeRow[],
  row: ProductRow,
  onOrAfter: string,
): CostChangeRow | null {
  const candidates = changes.filter(
    (c) =>
      c.productGid === row.productGid &&
      (c.variantGid === null || c.variantGid === row.variantGid) &&
      c.effectiveFrom <= onOrAfter,
  );
  if (!candidates.length) return null;
  candidates.sort((a, b) => {
    if (a.effectiveFrom !== b.effectiveFrom) return a.effectiveFrom < b.effectiveFrom ? 1 : -1;
    // samma datum: variantspecifik vinner över produktbred
    return (b.variantGid ? 1 : 0) - (a.variantGid ? 1 : 0);
  });
  return candidates[0];
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
  let cogs = 0;
  let unitsWithoutCost = 0;

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

      const rowCogs = cost != null ? cost * row.units : null;
      if (rowCogs != null) cogs += rowCogs;
      else unitsWithoutCost += row.units;

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
      };
    })
    .sort((a, b) => b.netSales - a.netSales);

  const orders = sum(sales, (s) => s.orders);
  const totalSales = sum(sales, (s) => s.totalSales);
  const netSales = sum(sales, (s) => s.netSales);
  const spend = sum(Object.values(spendByDay), (s) => s.spend);
  const clicks = sum(Object.values(spendByDay), (s) => s.clicks);
  const impressions = sum(Object.values(spendByDay), (s) => s.impressions);
  const sess = sum(sessions, (s) => s.sessions);
  const completed = sum(sessions, (s) => s.completedCheckout);

  const tariff = orders * settings.tariffPerOrder;
  const fees = totalSales * settings.feeRate;
  const contribution = totalSales - cogs - tariff - spend;

  // Rörlig kostnad exkl. annons. Break-even är där annonsbudgeten äter upp resten.
  const variableCost = cogs + tariff + fees;
  const grossContribution = totalSales - variableCost;

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

    breakEvenMer: grossContribution > 0 ? totalSales / grossContribution : null,
    breakEvenRoas: grossContribution > 0 ? totalSales / grossContribution : null,
    maxCpaAtTarget:
      orders > 0
        ? (totalSales * (1 - settings.targetMargin - settings.feeRate) - cogs - tariff) / orders
        : null,

    unitsWithoutCost,
    missingSpendDays,
    spendComplete: missingSpendDays.length === 0,
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

/** Datumfönster för de förvalda intervallen, relativt en ankardag. */
export function rangeWindow(key: string, anchor: string, custom?: { from: string; to: string }) {
  const shift = (iso: string, days: number) => {
    const d = new Date(iso + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  };
  switch (key) {
    case "custom":
      return [custom!.from, custom!.to] as const;
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
