/**
 * Break-even ROAS per produkt — räknat på hur produkten FAKTISKT säljs.
 *
 * Den gamla siffran antog en enhet per order. Säljer man flerpack är det
 * fel åt det pessimistiska hållet: ett tvåpack betalar tullen en gång och får
 * leverantörens packpris, så break-even ligger lägre än styckräkningen säger.
 * Här vägs orderraderna efter mixen (hur många rader med 1, 2, 3 … st) från de
 * senaste 90 dagarna, så att talet speglar butikens riktiga ordrar.
 *
 * Omsättningen per packstorlek är det kunderna FAKTISKT betalade för den
 * storleken (styckpris efter alla rabatter × antal, `linesRevenue`) — inte
 * listpris × antal. Mängdrabatter ("2 för 499"), rabattkoder och automatiska
 * rabatter syntes förut inte alls, och tvåpacket fick break-even 1,41× där
 * verkligheten var 1,52×. Listpriset används bara för storlekar utan
 * försäljning med pris, eller där för få av storlekens rader bär priset, och
 * det märks (`listpris`, `delvisListpris`). Röd "olönsam" och färg kräver
 * minst tre prisade rader (`prisade`, `tunntPris`). Debiterad frakt
 * räknas inte som produktens intäkt: talet blir försiktigt, aldrig för snällt.
 *
 * Ren modul: inga databas- eller nätverksanrop, så den går att testa. Heter
 * .server för att den drar in pnl.server — texthjälparen som klienten behöver
 * bor i breakeven-text.ts.
 */

import { tierCost, type CostTierRow } from "./pnl.server.ts";
import { MIN_RADER_BE } from "./produktintakt.ts";
export { mixText } from "./breakeven-text.ts";

export interface RadUtfall {
  qty: number;
  /** Andel av orderraderna med det här antalet, 0–1. */
  share: number;
  /** Omsättning per orderrad: realiserad när storleken sålts, annars listpris × antal. */
  revenue: number;
  /** Omsättningen är listpris × antal — storleken har ingen såld rad med pris. */
  listpris: boolean;
  /**
   * Orderrader som bär det realiserade priset (0 på listpris). Ett snitt på en
   * enda rad kan vara en influencerorder med 100 %-kod — under MIN_RADER_BE
   * (produktintakt.ts) får talet visas men aldrig bli en dom (röd "olönsam",
   * färg).
   */
  prisade: number;
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
  /**
   * Någon såld packstorlek saknar realiserat pris (bara äldre dagsrader utan
   * pris efter rabatter) och räknades på listpris. Aldrig satt när `antagen`
   * — då är allt listpris och det säger `antagen` redan.
   */
  delvisListpris: boolean;
  /** Σ orderrader bakom de realiserade priserna i mixen. 0 = allt listpris. */
  prisade: number;
}

export interface BreakEvenIndata {
  /** Pris per ENHET i butikens valuta (Shopifys variantpris). */
  price: number;
  unitCost: number | null;
  tiers: CostTierRow[];
  /** Orderrader per antal: { "1": 40, "2": 6 }. Tom/saknas = antag 1 st. */
  lines?: Record<string, number> | null;
  /**
   * Vad kunderna betalade per antal, efter alla rabatter: { "2": 499 }.
   * Delas med `linesPriced[q]` (orderraderna som bär priset) — eller med
   * `lines[q]` när `linesPriced` saknas. Saknas en storlek här: listpris.
   */
  linesRevenue?: Record<string, number> | null;
  linesPriced?: Record<string, number> | null;
  tariffPerOrder: number;
  feeRate: number;
}

/** En orderrad med `qty` stycken: omsättning, kostnad, TB och break-even. */
export function radUtfall(qty: number, d: BreakEvenIndata, share = 1): RadUtfall | null {
  if (d.unitCost == null || !(qty > 0)) return null;
  /* Realiserat pris per orderrad när storleken sålts med pris, annars
     listpris × antal (märkt). Räkningen är orderraderna som BÄR priset —
     inte alla rader: en äldre dag utan pris hade annars dragit ner snittet
     och gjort break-even för hög.
     Ett snitt på en eller två prisade rader står bara för storleken när de är
     ALLA dess rader. En prisad rad av 40 (resten äldre dagar) kan vara en
     giveaway med 100 %-kod — den hade annars satt priset för alla 40 och
     gjort varianten "olönsam" i rött. Då: listpris, märkt, tills minst
     MIN_RADER_BE rader bär priset. */
  const q = String(qty);
  const betalt = d.linesRevenue?.[q];
  const antal = d.linesPriced ? d.linesPriced[q] : d.lines?.[q];
  const alla = Number(d.lines?.[q]) || 0;
  const realiserad =
    betalt != null && Number.isFinite(betalt) && antal != null && antal > 0 &&
    (antal >= MIN_RADER_BE || antal >= alla);
  const revenue = realiserad ? betalt / antal : d.price * qty;
  const cogs = tierCost(qty, d.unitCost, d.tiers);
  /* Tullen tas ut per ORDER, en gång oavsett antal — det är hela poängen med
     flerpack. Avgiften följer omsättningen. */
  const tb = revenue - cogs - d.tariffPerOrder - revenue * d.feeRate;
  return {
    qty, share, revenue, listpris: !realiserad, prisade: realiserad ? antal : 0,
    cogs, tb, beRoas: tb > 0 && revenue > 0 ? revenue / tb : null,
  };
}

/**
 * Break-even ROAS viktat över mixen. Utan försäljningsdata antas ett
 * styckköp och `antagen` sätts — siffran ska då märkas i UI:t, inte se ut
 * som om den byggde på riktiga ordrar.
 */
export function mixBreakEven(d: BreakEvenIndata): MixBreakEven {
  const tomt: MixBreakEven = {
    beRoas: null, tb: null, revenue: null, mix: [], lines: 0, antagen: true, olonsamNagon: false, delvisListpris: false, prisade: 0,
  };
  if (d.unitCost == null) return tomt;

  const rader = Object.entries(d.lines ?? {})
    .map(([q, n]) => ({ qty: Number(q), n: Number(n) || 0 }))
    .filter((r) => r.qty > 0 && r.n > 0);
  const totalt = rader.reduce((a, r) => a + r.n, 0);

  if (!totalt) {
    const en = radUtfall(1, d, 1)!;
    return { beRoas: en.beRoas, tb: en.tb, revenue: en.revenue, mix: [en], lines: 0, antagen: true, olonsamNagon: en.beRoas == null, delvisListpris: false, prisade: 0 };
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
    delvisListpris: mix.some((r) => r.listpris),
    prisade: mix.reduce((a, r) => a + r.prisade, 0),
  };
}

