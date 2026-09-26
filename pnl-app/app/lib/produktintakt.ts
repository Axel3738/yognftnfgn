/**
 * Produktens intäkt = det kunderna FAKTISKT betalade för varan, efter alla
 * rabatter — inte listpris × antal.
 *
 * Varför: break-even per produkt räknades på Shopifys listpris gånger antal,
 * och produkttabellen på radens `discountedTotal`, som bara drar radrabatter.
 * Ordernivåns koder (10 % i popupen, WELCOME) och mängdrabatter ("2 för 499")
 * syntes ingenstans. Räkneexempel: 299 kr styck sålt som 2 för 499, COGS 134
 * för två, tull 27,50, avgift 2 %. Listpriset gav omsättning 598, TB 424,50
 * och break-even 1,41×. Verkligheten är 499 − 134 − 27,50 − 10 = 327,50, alltså
 * 1,52×. Produkten sköts på 1,45× och förlorade ~5 % av annonspengarna.
 *
 * Ren modul utan beroenden: klienten får importera den (produkttabellen,
 * Kostnader-färgen) och testerna läser den direkt. `orderrader.ts` och
 * `pnl.server.ts` slår ihop fälten med SAMMA funktion här, så en rad som slås
 * ihop per dag och sedan per marknad inte kan tappa eller dubbla intäkten.
 */

/** Intäktsfälten på en produktrad (samma namn som i `ProductRow`). */
export interface Intaktsfalt {
  netSales: number;
  units: number;
  lines?: Record<string, number>;
  /** Σ styckpris efter ALLA rabatter × antal. Saknas = någon del av raden
   *  kom från en äldre export utan fältet — då är summan inte hel. */
  netRevenue?: number;
  /** Samma intäkt per antal i raden: { "1": 897, "2": 1497 }. */
  linesRevenue?: Record<string, number>;
  /** Antal orderrader bakom `linesRevenue` per antal. Skiljer sig från
   *  `lines` så länge äldre dagsrader (utan pris) ingår i summan. */
  linesPriced?: Record<string, number>;
}

/** Radens intäkt i produkttabellen: efter alla rabatter när den finns, annars
 *  radens discountedTotal (äldre dagsrader, före ordernivåns rabatter). */
export const radIntakt = (r: Pick<Intaktsfalt, "netSales" | "netRevenue">): number =>
  r.netRevenue ?? r.netSales;

const summera = (a: Record<string, number> | undefined, b: Record<string, number>): Record<string, number> => {
  const ut = { ...(a ?? {}) };
  for (const [q, n] of Object.entries(b)) ut[q] = (ut[q] ?? 0) + (Number(n) || 0);
  return ut;
};

/** Kopior av intäktsfälten för den FÖRSTA raden i en hopslagning — källraden
 *  får aldrig muteras när nästa del läggs till. */
export function kopieraIntakt<T extends Intaktsfalt>(r: T): Pick<Intaktsfalt, "linesRevenue" | "linesPriced"> {
  return {
    linesRevenue: r.linesRevenue ? { ...r.linesRevenue } : undefined,
    linesPriced: r.linesPriced ? { ...r.linesPriced } : undefined,
  };
}

/**
 * Lägger `r`:s intäktsfält på `a` (muterar `a`). Två olika regler, med flit:
 * - `netRevenue` är allt-eller-inget. Saknar EN del fältet är summan bara en
 *   del av produktens intäkt, och tabellen hade visat för lite. Då faller
 *   raden tillbaka på `netSales` (hela, men före ordernivåns rabatter).
 * - `linesRevenue` summeras bara där det finns, och `linesPriced` räknar hur
 *   många orderrader som bär det. Break-even delar med DEN räkningen, inte med
 *   `lines` — annars hade en gammal dag utan pris dragit ner priset per rad
 *   och gjort break-even för hög. Äldre dagar före 60-dagarsgränsen skrivs
 *   aldrig om, så allt-eller-inget hade låst 90-dagarsmixen på listpris i
 *   90 dagar.
 */
export function laggTillIntakt(a: Intaktsfalt, r: Intaktsfalt): void {
  a.netRevenue = a.netRevenue != null && r.netRevenue != null ? a.netRevenue + r.netRevenue : undefined;
  if (r.linesRevenue && r.linesPriced) {
    a.linesRevenue = summera(a.linesRevenue, r.linesRevenue);
    a.linesPriced = summera(a.linesPriced, r.linesPriced);
  }
}

/** Orderrader bakom produktraden. Äldre rader utan `lines`: enheterna. */
export function radLinjer(r: Pick<Intaktsfalt, "lines" | "units">): number {
  if (!r.lines) return Math.max(0, r.units);
  let n = 0;
  for (const v of Object.values(r.lines)) n += Number(v) || 0;
  return n;
}

/** Under så här många orderrader visar produkttabellen ingen break-even.
 *  Samma golv som skalningsbeslutet (MIN_ORDRAR_BESLUT i skalning.ts). */
export const MIN_RADER_BE = 3;

/**
 * Realiserat pris på för få orderrader för att döma på: minst en storlek
 * räknas på det kunderna betalade, men färre än MIN_RADER_BE rader bär priset.
 * En enda influencerorder med 100 %-kod ger annars "olönsam" i rött på en
 * variant som är lönsam på varje riktig order. Talet får visas, domen inte.
 * 0 prisade rader = allt listpris: då är domen kostnadsstrukturens, som förut.
 */
export const tunntPris = (prisade: number): boolean => prisade > 0 && prisade < MIN_RADER_BE;

/**
 * Orderrader en break-even-färg på mixen vilar på. Vilar talet på realiserade
 * priser är det raderna som BÄR priserna som räknas — 50 rader i mixen men en
 * enda med pris (resten äldre dagar) är ett snitt på en order, inte på 50.
 * Antagen mix (ingen försäljning) = 0, alltså aldrig färg.
 */
export function beUnderlag(x: { antagen: boolean; lines: number; prisade?: number }): number {
  if (x.antagen) return 0;
  const p = x.prisade ?? 0;
  return p > 0 ? Math.min(p, x.lines) : x.lines;
}

export type BeStatus = "ok" | "olonsam" | "tunn" | "saknas";

export interface FordeladRad {
  intakt: number;
  linjer: number;
  tull: number;
  avgifter: number;
  /** Break-even ROAS för produktens annonser. Null utom när status är "ok". */
  beRoas: number | null;
  status: BeStatus;
  /**
   * Raden saknar intäkt efter ordernivåns rabatter (minst en dag i perioden
   * skrevs innan fältet fanns — dagar bortom 45-dagarsomsynken skrivs aldrig
   * om). Netto och break-even står då FÖRE koder som WELCOME och popupens
   * 10 %, och break-even blir för snäll. Tabellen märker cellerna.
   */
  foreOrderrabatt: boolean;
}

export interface Fordelning {
  rader: FordeladRad[];
  /** Σ produktintäkt. */
  intakt: number;
  /** Omsättningsrutan minus produkterna: frakt, returer, moms och — för
   *  äldre dagsrader — ordernivåns rabatter. Produkter + detta = rutan. */
  oallokerat: number;
  /** Minst en rad står före ordernivåns rabatter — de ligger då i `oallokerat`. */
  nagonForeOrderrabatt: boolean;
}

/**
 * Break-even ROAS per produktrad i panelens tabell:
 *   intäkt / (intäkt − COGS − fördelad tull − fördelade avgifter)
 * Tullen är ett belopp per ORDER och fördelas efter radens andel av
 * orderraderna; avgifterna följer omsättningen (periodens `effFeeRate`).
 * Frakt räknas inte som produktintäkt — talet blir försiktigt (högre), aldrig
 * för snällt. "—" (status tunn/saknas) när kostnaden saknas, är en misstänkt
 * nolla, eller raden bär färre än tre orderrader: en dom på två ordrar är
 * ingen dom.
 */
export function fordelaProdukter(
  rows: (Intaktsfalt & { cogs: number | null; zeroCost?: boolean })[],
  x: { tariff: number; effFeeRate: number; totalSales: number },
): Fordelning {
  const allaLinjer = rows.reduce((a, r) => a + radLinjer(r), 0);
  let intakt = 0;
  const rader = rows.map((r): FordeladRad => {
    const oms = radIntakt(r);
    intakt += oms;
    const linjer = radLinjer(r);
    const tull = allaLinjer > 0 ? x.tariff * (linjer / allaLinjer) : 0;
    const avgifter = oms * x.effFeeRate;
    const bas = { intakt: oms, linjer, tull, avgifter, foreOrderrabatt: r.netRevenue == null };
    if (r.cogs == null || r.zeroCost) return { ...bas, beRoas: null, status: "saknas" };
    if (linjer < MIN_RADER_BE) return { ...bas, beRoas: null, status: "tunn" };
    const tb = oms - r.cogs - tull - avgifter;
    if (!(tb > 0) || !(oms > 0)) return { ...bas, beRoas: null, status: "olonsam" };
    return { ...bas, beRoas: oms / tb, status: "ok" };
  });
  return { rader, intakt, oallokerat: x.totalSales - intakt, nagonForeOrderrabatt: rader.some((r) => r.foreOrderrabatt) };
}

/**
 * Butikens MER de senaste stängda dagarna — det Kostnader-sidan färgar
 * break-even mot i stället för de fasta gränserna ≤ 2 / ≤ 3. En produkt med
 * break-even 2,4× är lönsam i en butik som går på 3× och en förlustaffär i en
 * som går på 1,8×; en fast gräns säger samma sak till båda.
 *
 * Null (ingen färg, aldrig en gissning) när underlaget är tunt eller
 * annonskostnaden inte är hel: ingen spend, färre än 3 ordrar, färre än 7
 * säljdagar, eller en dag med försäljning som saknar spendrad (panelen har
 * inte hämtat den — då är MER för hög och break-even hade sett för grön ut).
 */
export function merUrDagar(
  saljdagar: { day: string; totalSales: number; orders: number }[],
  spenddagar: { day: string; spend: number }[],
  golv: { minOrdrar: number; minDagar: number } = { minOrdrar: 3, minDagar: 7 },
): number | null {
  const spendPer = new Map<string, number>();
  for (const s of spenddagar) spendPer.set(s.day, (spendPer.get(s.day) ?? 0) + (Number(s.spend) || 0));
  let oms = 0;
  let ordrar = 0;
  let dagar = 0;
  for (const d of saljdagar) {
    if (!(d.totalSales > 0)) continue;
    if (!spendPer.has(d.day)) return null;
    oms += d.totalSales;
    ordrar += d.orders;
    dagar += 1;
  }
  let spend = 0;
  for (const v of spendPer.values()) spend += v;
  if (!(spend > 0) || ordrar < golv.minOrdrar || dagar < golv.minDagar) return null;
  return oms / spend;
}

/**
 * Färgen på en break-even-cell mot butikens MER. Grön bara med minst 10 %
 * marginal under MER (annonserna på butikens snittnivå tjänar pengar på
 * produkten), gul mellan 90 % och 100 % av MER (på kanten), röd över MER.
 * Ingen färg utan MER eller på tunt underlag (under tre orderrader, eller
 * listpris utan försäljning) — ingen dom på tunn data.
 */
export function beTon(
  beRoas: number | null,
  mer: number | null,
  rader: number,
): "success" | "caution" | "critical" | undefined {
  if (beRoas == null || mer == null || !(mer > 0) || rader < MIN_RADER_BE) return undefined;
  if (beRoas <= mer * 0.9) return "success";
  if (beRoas <= mer) return "caution";
  return "critical";
}
