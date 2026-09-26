/**
 * Skalningsbeslutet — ren logik utan I/O och utan beroenden.
 *
 * Varför en egen fil: panelen (MER-rutan, annonsrutan, uppdelningen),
 * gruppens tabell och LTV-sidan ska fatta SAMMA beslut på SAMMA tal. Räknas
 * det på tre ställen med tre formler ser handlaren en röd ruta bredvid en
 * grön. Klientkomponenter får importera härifrån (inget här är `.server`),
 * och testerna (`node --experimental-strip-types`) läser filen direkt.
 * `pnl.server.ts` och `ltv.server.ts` exporterar funktionerna vidare.
 *
 * Grundregeln kommer ur Axels egna regler (rot-CLAUDE.md regel 4): ett
 * kill-beslut mäts mot BREAK-EVEN, aldrig mot målnivån. Räkneexempel från
 * granskningen: 300 000 kr omsättning, break-even 1,81×, MER 1,95×, fasta
 * 20 000 kr. Nettovinsten är −8 100 kr och röd — men annonserna ger
 * +11 900 kr. Den som drar ner annonserna "för att stoppa förlusten" landar
 * på −20 000 kr. Rätt besked är "håll": annonserna bär sig, det är de fasta
 * kostnaderna som är gapet.
 */

export type Beslut = "pull" | "hold" | "push";

/**
 * Kvoterna ett skalningsbeslut vilar på. En enda formel, så att MER-rutan,
 * gruppens rader och max-CPA aldrig kan säga olika saker:
 *   breakEvenMer = omsättning / bruttovinst
 *   targetMer    = omsättning / (bruttovinst − målmarginal × omsättning)
 * Bruttovinsten är omsättning − COGS − tull − avgifter (före annonser och
 * fasta). `targetMer` är exakt samma tröskel som max-CPA vid målmarginalen:
 * CPA ≤ max-CPA gäller precis när MER ≥ targetMer.
 */
export interface Kvoter {
  mer: number | null;
  breakEvenMer: number | null;
  targetMer: number | null;
  /** Evolves tumregel "break-even + 1". Bara en dämpad referens — ägaren har
   *  inte valt skalningslinje, så beslutet går på målmarginalen. */
  evolveScaling: number | null;
}

export function skalningsKvoter(x: {
  totalSales: number;
  spend: number;
  grossProfit: number;
  targetMargin: number;
}): Kvoter {
  const breakEvenMer = x.grossProfit > 0 ? x.totalSales / x.grossProfit : null;
  const malUtrymme = malUtrymmeFor(x.grossProfit, x.targetMargin, x.totalSales);
  return {
    mer: x.spend > 0 ? x.totalSales / x.spend : null,
    breakEvenMer,
    targetMer: malUtrymme > 0 ? x.totalSales / malUtrymme : null,
    evolveScaling: breakEvenMer != null ? breakEvenMer + 1 : null,
  };
}

/**
 * Det annonserna får kosta för att målmarginalen ska stå kvar: bruttovinst −
 * målmarginal × omsättning. Täljaren i både max-CPA och targetMer — samma
 * uttryck på båda ställena, så att flyttalen inte kan skilja dem åt.
 */
export function malUtrymmeFor(grossProfit: number, targetMargin: number, totalSales: number): number {
  return grossProfit - targetMargin * totalSales;
}

/** Det beslutet behöver ur en periodsumma (Totals eller en grupprad). */
export interface BeslutsUnderlag {
  spendComplete: boolean;
  spend: number;
  orders: number;
  mer: number | null;
  breakEvenMer: number | null;
  targetMer: number | null;
}

export interface BeslutsFlaggor {
  /** Mer än 2 % av försäljningen utan riktig kostnad — eller, i gruppen,
   *  en butik utan annonskonto. Break-even är då en undre gräns och varje
   *  beslut vilar på en vinst som inte finns. */
  kostnadOsaker: boolean;
  /** Tullen är butikens startvärde, aldrig bekräftat av handlaren. */
  tullOkvitterad: boolean;
  /** Antal säljdagar i perioden. */
  dagar: number;
}

export interface SkalningsBeslut {
  niva: Beslut;
  /** Perioden är under 7 dagar och hade annars sagt "skala". Ett "skala" på
   *  en enda dags MER är brus — texten säger att läsa 7+ dagar först. */
  kortPeriod: boolean;
  /** Beslutet räknar med standardtullen — texten säger det. */
  standardTull: boolean;
}

/** Husregeln (rot-CLAUDE.md regel 3): ingen dom under 3 köp. */
export const MIN_ORDRAR_BESLUT = 3;
/** Kortare perioder än så får aldrig säga "skala". */
export const MIN_DAGAR_SKALA = 7;

/**
 * Ett skalningsbeslut, eller null när underlaget inte bär ett.
 *
 * Null när annonskostnaden är ofullständig (vinsten är för hög), när ingen
 * annonskostnad finns, under 3 ordrar, när break-even inte finns (bruttovinst
 * ≤ 0) eller när kostnaden är osäker. Annars:
 *   pull — MER under break-even: annonserna förlorar pengar på varje order.
 *   hold — lönsamt men under målet (eller målet går inte att nå alls).
 *   push — MER på eller över målet.
 * "Dra ner" knyts BARA till break-even, aldrig till målet.
 */
export function skalningsBeslut(t: BeslutsUnderlag, q: BeslutsFlaggor): SkalningsBeslut | null {
  if (!t.spendComplete) return null;
  if (!(t.spend > 0) || t.mer == null) return null;
  if (t.orders < MIN_ORDRAR_BESLUT) return null;
  if (t.breakEvenMer == null) return null;
  if (q.kostnadOsaker) return null;

  let niva: Beslut;
  if (t.mer < t.breakEvenMer) niva = "pull";
  else if (t.targetMer == null || t.mer < t.targetMer) niva = "hold";
  else niva = "push";

  const kortPeriod = niva === "push" && q.dagar < MIN_DAGAR_SKALA;
  return { niva: kortPeriod ? "hold" : niva, kortPeriod, standardTull: q.tullOkvitterad };
}

/**
 * Vilken beslutstext badgen ska visa. En kort period som annars sagt "skala"
 * har nivån "hold" (tonen och grupptabellens "Håll"), men får ALDRIG den
 * fulla hold-texten "Lönsamt, under målet": MER-rutan står då på t.ex. 5,00×
 * med "mål 3,31×" bredvid, och en badge som påstår motsatsen gör att
 * handlaren slutar lita på båda. "holdShort" säger det som är sant — över
 * målet, men för få dagar för att skala på.
 */
export type BeslutsText = Beslut | "holdShort";

export function beslutsText(b: SkalningsBeslut): BeslutsText {
  return b.kortPeriod ? "holdShort" : b.niva;
}

/**
 * Bidraget efter annonser som andel av omsättningen, i Evolves band
 * (10–20 % är sunt). Gränserna: under 0 förlorar annonserna pengar, [0, 10 %)
 * tunt, [10 %, 20 %] sunt, över 20 % starkt.
 *
 * Övre bandet heter "starkt", inte "utrymme att skala": bidrag efter
 * annonser ≥ målmarginalen är exakt samma villkor som beslutet "push". Med
 * målmarginalen 25 % hade ett band som sa "skala" vid 22 % stått bredvid en
 * badge som säger "håll". Skala-ordet bor bara i beslutet.
 */
export type BidragsBand = "forlust" | "tunt" | "sunt" | "starkt";

export function bidragsBand(andel: number): BidragsBand {
  if (andel < 0) return "forlust";
  if (andel < 0.1) return "tunt";
  if (andel <= 0.2) return "sunt";
  return "starkt";
}

/* ------------------------------------------------------------------------ */
/* LTV-sidan: CAC mot kundvärdet                                              */
/* ------------------------------------------------------------------------ */

/** Det cacBeslut behöver ur LTV-motorns MaxCpa (strukturell typ, så att
 *  filen inte drar in ltv.server). */
export interface CacTrosklar {
  /** LTVtb(h) − målmarginal × LTV(h) — kundvärdet vid målmarginalen. */
  maxCpa: { mid: number };
  /** LTVtb(h) — täckningsbidraget per kund inom h dagar, noll vinst. */
  breakEven: { mid: number };
  /** "hidden" = intervallet är för brett för att döma på. */
  konfidens?: "good" | "low" | "hidden";
}

/**
 * CAC per ny kund mot kundvärdet, i tre band:
 *   push — CAC ≤ max-CPA vid målmarginalen: över målet, utrymme att skala.
 *   hold — CAC ≤ break-even (täckningsbidraget inom h dagar): lönsamt, under
 *          målmarginalen.
 *   pull — över break-even: varje ny kund förlorar pengar inom h dagar.
 * Förut jämfördes bara mot max-CPA och allt över den kallades "betalar inte
 * tillbaka". LTV90 600 kr, TB-LTV90 240 kr ⇒ max-CPA 90 kr; vid CAC 180 kr
 * ger varje kund +60 kr inom 90 dagar. Rådet "pausa" kastade ~30 000 kr/mån
 * vid 500 nya kunder i månaden.
 * Null utan CAC, utan kundvärde, när intervallet är för brett, eller under
 * 3 nya kunder (husregeln, samma MIN_ORDRAR_BESLUT som panelen). En CAC på
 * en eller två kunder är brus: en ny butik eller en nyss återkopplad Meta
 * hade annars fått ett rött "dra ner" på en enda kund.
 */
export function cacBeslut(
  cpaNew: number | null | undefined,
  mc: CacTrosklar | null | undefined,
  nyaKunder: number,
): Beslut | null {
  if (cpaNew == null || !Number.isFinite(cpaNew) || !mc) return null;
  if (!(nyaKunder >= MIN_ORDRAR_BESLUT)) return null;
  if (mc.konfidens === "hidden") return null;
  if (cpaNew <= mc.maxCpa.mid) return "push";
  if (cpaNew <= mc.breakEven.mid) return "hold";
  return "pull";
}
