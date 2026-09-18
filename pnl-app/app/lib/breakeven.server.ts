/**
 * Break-even ROAS per produkt — räknat på hur produkten FAKTISKT säljs.
 *
 * Den gamla siffran antog en enhet per order. Säljer man flerpack är det
 * fel åt det pessimistiska hållet: ett tvåpack betalar tullen en gång och får
 * leverantörens packpris, så break-even ligger lägre än styckräkningen säger.
 * Här vägs orderraderna efter mixen (hur många rader med 1, 2, 3 … st) från de
 * senaste 90 dagarna, så att talet speglar butikens riktiga ordrar.
 *
 * Ren modul: inga databas- eller nätverksanrop, så den går att testa. Heter
 * .server för att den drar in pnl.server — texthjälparen som klienten behöver
 * bor i breakeven-text.ts.
 */

import { tierCost, type CostTierRow } from "./pnl.server.ts";
export { mixText } from "./breakeven-text.ts";

export interface RadUtfall {
  qty: number;
  /** Andel av orderraderna med det här antalet, 0–1. */
  share: number;
  revenue: number;
  cogs: number;
  /** TB efter tull och avgift. */
  tb: number;
  /** Break-even ROAS för en order med bara den här raden. Null = olönsam. */
  beRoas: number | null;
}

export interface MixBreakEven {
  /** Viktat över mixen. Null = kostnad saknas. */
  beRoas: number | null;
  /** Viktat TB per orderrad. */
  tb: number | null;
  /** Viktad omsättning per orderrad. */
  revenue: number | null;
  /** Mixen som användes, störst andel först. Tom = ingen försäljning → 1 st antogs. */
  mix: RadUtfall[];
  /** Antal orderrader mixen bygger på. 0 = antagen (1 st). */
  lines: number;
  /** Räknat på ett antaget styckköp, för att mixen saknades. */
  antagen: boolean;
  /** Olönsam på minst en av de sålda packstorlekarna. */
  olonsamNagon: boolean;
}

export interface BreakEvenIndata {
  /** Pris per ENHET i butikens valuta (Shopifys variantpris). */
  price: number;
  unitCost: number | null;
  tiers: CostTierRow[];
  /** Orderrader per antal: { "1": 40, "2": 6 }. Tom/saknas = antag 1 st. */
  lines?: Record<string, number> | null;
  tariffPerOrder: number;
  feeRate: number;
}

/** En orderrad med `qty` stycken: omsättning, kostnad, TB och break-even. */
export function radUtfall(qty: number, d: BreakEvenIndata, share = 1): RadUtfall | null {
  if (d.unitCost == null || !(qty > 0)) return null;
  const revenue = d.price * qty;
  const cogs = tierCost(qty, d.unitCost, d.tiers);
  /* Tullen tas ut per ORDER, en gång oavsett antal — det är hela poängen med
     flerpack. Avgiften följer omsättningen. */
  const tb = revenue - cogs - d.tariffPerOrder - revenue * d.feeRate;
  return { qty, share, revenue, cogs, tb, beRoas: tb > 0 ? revenue / tb : null };
}

/**
 * Break-even ROAS viktat över mixen. Utan försäljningsdata antas ett
 * styckköp och `antagen` sätts — siffran ska då märkas i UI:t, inte se ut
 * som om den byggde på riktiga ordrar.
 */
export function mixBreakEven(d: BreakEvenIndata): MixBreakEven {
  const tomt: MixBreakEven = {
    beRoas: null, tb: null, revenue: null, mix: [], lines: 0, antagen: true, olonsamNagon: false,
  };
  if (d.unitCost == null) return tomt;

  const rader = Object.entries(d.lines ?? {})
    .map(([q, n]) => ({ qty: Number(q), n: Number(n) || 0 }))
    .filter((r) => r.qty > 0 && r.n > 0);
  const totalt = rader.reduce((a, r) => a + r.n, 0);

  if (!totalt) {
    const en = radUtfall(1, d, 1)!;
    return { beRoas: en.beRoas, tb: en.tb, revenue: en.revenue, mix: [en], lines: 0, antagen: true, olonsamNagon: en.beRoas == null };
  }

  const mix = rader
    .map((r) => radUtfall(r.qty, d, r.n / totalt)!)
    .sort((a, b) => b.share - a.share || a.qty - b.qty);
  const revenue = mix.reduce((a, r) => a + r.revenue * r.share, 0);
  const tb = mix.reduce((a, r) => a + r.tb * r.share, 0);
  return {
    beRoas: tb > 0 ? revenue / tb : null,
    tb,
    revenue,
    mix,
    lines: totalt,
    antagen: false,
    olonsamNagon: mix.some((r) => r.beRoas == null),
  };
}

