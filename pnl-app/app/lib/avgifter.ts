/**
 * Betalavgifterna: vilken omsättning har FAKTISKA avgifter och vilken ska
 * räknas med handlarens sats.
 *
 * Bakgrund (2026-09-26): Shopify skriver `fees` på transaktionerna bara för
 * Shopify Payments. En order betald med PayPal, direkt-Klarna eller manuellt
 * har inga `fees` alls — och förut räknades hela dagens omsättning ändå som
 * "faktisk" så fort fältet frågats efter. Satsen i Inställningar gällde då
 * aldrig de ordrarna, och den "uppmätta" satsen på Kostnader blev ett snitt
 * med nollor i. En butik helt utan Shopify Payments visade avgifter 0 överallt
 * och break-even för lågt (1,80× i stället för 1,92× i planens exempel), så en
 * produkt på 1,85× såg lönsam ut.
 *
 * Nu bär varje dag `feesCoveredSales` = omsättningen i ordrar som gick genom
 * Shopify Payments. Bara den räknas som faktisk; resten får satsen.
 *
 * Ren fil utan beroenden — får importeras av klienten och av testerna
 * (`node --experimental-strip-types` löser inte upp importer utan filändelse).
 */

/** Gatewaynamnet Shopify ger Shopify Payments på `OrderTransaction.gateway`. */
export const SP_GATEWAY = "shopify_payments";

/** Nyckeln för ordrar utan någon transaktion alls (0-ordrar, obetalda). */
export const INGEN_GATEWAY = "";

/** Det en dag (eller en marknads del av en dag) behöver för avgiftsräkningen. */
export interface AvgiftsDag {
  totalSales: number;
  /** Faktiska avgifter. Null = okänt (fältet nekades eller äldre rad). */
  fees?: number | null;
  /**
   * Omsättning i ordrar betalda genom Shopify Payments — den del som `fees`
   * faktiskt täcker. Null/saknas = raden skrevs före 2026-09-26: då räknas
   * hela omsättningen som täckt, precis som förut, tills dagen hämtas om.
   */
  feesCoveredSales?: number | null;
  /** Omsättning per betalväg: { shopify_payments: 6000, paypal: 4000 }. */
  gatewaySales?: Record<string, number> | null;
}

/** Omsättningen med faktiska avgifter. 0 när dagens avgifter är okända. */
export function tacktOms(d: AvgiftsDag): number {
  if (d.fees == null) return 0;
  return d.feesCoveredSales ?? d.totalSales;
}

/**
 * Betalvägar Shopify INTE tar tredjepartsavgift på: manuella betalsätt
 * (postförskott, bankinsättning, postanvisning), presentkort och Shopifys
 * egna delbetalningar. Nycklarna är normaliserade (gemener, allt utom a–z/0–9
 * blir "_"), så "Cash on Delivery (COD)" och "cash_on_delivery" träffar båda.
 * En egen manuell betalmetod med påhittat namn ("Faktura") känns inte igen
 * och räknas som extern — ett känt glapp åt det försiktiga hållet.
 */
const INTE_TREDJEPART = new Set([
  "manual",
  "cash_on_delivery",
  "cash_on_delivery_cod",
  "cod",
  "bank_deposit",
  "money_order",
  "gift_card",
  "shopify_installments",
]);

const normVag = (g: string) => g.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

/**
 * Går pengarna genom en EXTERN betalväxel som Shopify tar tredjepartsavgift
 * på? Shopify Payments nej (även en order som bara är reserverad hittills
 * bokförs där), ingen betalning nej, manuella betalsätt nej.
 */
export function arExternBetalvag(gateway: string): boolean {
  if (gateway === SP_GATEWAY || gateway === INGEN_GATEWAY) return false;
  const n = normVag(gateway);
  return n !== "" && n !== SP_GATEWAY && !INTE_TREDJEPART.has(n);
}

/**
 * Omsättning som BEVISLIGEN gick via en extern betalväxel — avgifterna
 * hämtades, dagen vet vad som var täckt, och betalvägen per order finns.
 * Bara den får Shopifys avgift för externa betalväxlar. Förut räknades all
 * otäckt omsättning dit, och då fick en reserverad-men-inte-dragen Shopify
 * Payments-order, en postförskottsorder och en order utan betalning en
 * påhittad Shopify-avgift. En äldre dag utan uppdelning, eller en dag vars
 * avgifter nekades, kan lika gärna vara Shopify Payments och ger 0.
 */
export function kandExtern(d: AvgiftsDag): number {
  if (d.fees == null || d.feesCoveredSales == null || !d.gatewaySales) return 0;
  let extern = 0;
  for (const [g, belopp] of Object.entries(d.gatewaySales)) {
    if (arExternBetalvag(g) && belopp > 0) extern += belopp;
  }
  /* Aldrig mer än det otäckta: en order som både är täckt och bokförd på en
     extern väg kan inte finnas, men ett tak kostar inget. */
  return Math.min(extern, Math.max(0, d.totalSales - d.feesCoveredSales));
}

/**
 * Omsättningen och den täckta omsättningen per marknad, så att den otäckta
 * delen får satsen för den marknad den faktiskt kom ifrån.
 */
export interface MarknadsUnderlag {
  oms: Record<string, number>;
  tackt: Record<string, number>;
  /** Satsen för en marknad (egen post, annars standard). */
  satsFor: (marknad: string) => number;
  /** Standardsatsen, för otäckt omsättning utan marknad. */
  standard: number;
}

export interface AvgiftsUnderlag {
  sales: AvgiftsDag[];
  totalSales: number;
  /**
   * Avgiften för HELA omsättningen om allt räknats med satsen (per marknad).
   * Motorn räknar ut den; här tas bara den okända andelen av den. Används
   * bara när `perMarknad` saknas.
   */
  satsBaserat: number;
  /**
   * Finns den räknas satsen per marknad på just den marknadens otäckta
   * omsättning (`satsPaOtackt`), i stället för periodens marknadsmix gånger
   * den okända andelen.
   */
  perMarknad?: MarknadsUnderlag;
  /** Shopifys avgift på ordrar som inte betalats med Shopify Payments. */
  thirdPartyFeeRate?: number;
}

export interface AvgiftsResultat {
  fees: number;
  /** Summan av faktiska avgifter. */
  faktiska: number;
  /** Omsättning med faktiska avgifter. */
  omsMedFaktiska: number;
  /** Shopifys avgift på externa betalväxlar (ingår i `fees`). */
  tredjepart: number;
  /** Dagar vars avgifter är hämtade (även om de bara täcker en del). */
  kandaDagar: number;
  /** Andel av omsättningen med faktiska avgifter. Null utan omsättning. */
  faktiskAndel: number | null;
  /** Betalvägar utanför Shopify Payments, störst omsättning först. */
  andraBetalvagar: string[];
}

/**
 * Periodens avgifter: det som faktiskt drogs, plus satsen på omsättningen
 * utan faktisk avgift, plus Shopifys tredjepartsavgift på den omsättning som
 * bevisligen gick via en annan betalväxel.
 */
export function raknaAvgifter(u: AvgiftsUnderlag): AvgiftsResultat {
  let faktiska = 0;
  let omsMedFaktiska = 0;
  let extern = 0;
  let kandaDagar = 0;
  const perVag: Record<string, number> = {};
  for (const s of u.sales) {
    if (s.fees == null) continue;
    faktiska += s.fees;
    omsMedFaktiska += tacktOms(s);
    extern += kandExtern(s);
    kandaDagar++;
    for (const [g, belopp] of Object.entries(s.gatewaySales ?? {})) {
      if (g === SP_GATEWAY || g === INGEN_GATEWAY) continue;
      perVag[g] = (perVag[g] ?? 0) + belopp;
    }
  }
  const { totalSales } = u;
  /* Satsen gäller bara den del av omsättningen som saknar faktisk avgift. */
  const otackt = Math.max(0, totalSales - omsMedFaktiska);
  const satsDel = u.perMarknad
    ? satsPaOtackt(otackt, u.perMarknad)
    : totalSales > 0
      ? u.satsBaserat * (otackt / totalSales)
      : 0;
  const tredjepart = extern * (u.thirdPartyFeeRate ?? 0);
  return {
    fees: faktiska + satsDel + tredjepart,
    faktiska,
    omsMedFaktiska,
    tredjepart,
    kandaDagar,
    faktiskAndel: totalSales > 0 ? Math.min(1, omsMedFaktiska / totalSales) : null,
    andraBetalvagar: Object.entries(perVag)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([g]) => g),
  };
}

/**
 * Satsen på den otäckta omsättningen, marknad för marknad. Förut fick den
 * otäckta delen periodens SNITTSATS: Sverige helt via Shopify Payments och
 * USA helt via PayPal gav USA-omsättningen halva USA-satsen och halva den
 * svenska — en procentenhet för lite i avgifter och ett för lågt break-even.
 *
 * Den otäckta omsättningen per marknad är oms − täckt. Summan stäms av mot
 * periodens otäckta omsättning (`otackt`, räknad ur dagarna): blir den för
 * stor — en äldre marknadsdel utan avgiftsdata på en dag som har det —
 * skalas den ner, och det som blir över (omsättning utan marknad) tar
 * standardsatsen. Satsen läggs alltså aldrig på mer eller mindre omsättning
 * än den som saknar faktisk avgift.
 */
export function satsPaOtackt(otackt: number, m: MarknadsUnderlag): number {
  if (!(otackt > 0)) return 0;
  const perMarknad: [string, number][] = [];
  let summa = 0;
  for (const [marknad, oms] of Object.entries(m.oms)) {
    const u = Math.max(0, oms - (m.tackt[marknad] ?? 0));
    if (!(u > 0)) continue;
    perMarknad.push([marknad, u]);
    summa += u;
  }
  const k = summa > otackt ? otackt / summa : 1;
  let avgift = 0;
  for (const [marknad, u] of perMarknad) avgift += u * k * m.satsFor(marknad);
  return avgift + Math.max(0, otackt - summa * k) * m.standard;
}

/** En dagsrad som den ligger i DailyPnl, för den uppmätta satsen. */
export interface UppmattRad extends AvgiftsDag {
  markets?: Record<string, AvgiftsDag> | null;
}

export interface UppmattAvgift {
  /** Faktiska avgifter ÷ omsättningen de TÄCKER (Shopify Payments-satsen). */
  rate: number;
  /** Omsättningen med faktiska avgifter — underlaget för `rate`. */
  sales: number;
  /** All omsättning på dagar med hämtade avgifter. */
  totalSales: number;
  /** Omsättning som bevisligen gick via en annan betalväxel. */
  extern: number;
  days: number;
}

/**
 * Vad Shopify Payments faktiskt tog, per marknad ("" = hela butiken).
 *
 * Delar med den TÄCKTA omsättningen, inte hela: förut delades avgifterna med
 * all omsättning, och varje PayPal-order drog ner "faktiskt taget" mot noll —
 * en uppmätt sats byggd på nollor. Marknader och dagar utan täckt omsättning
 * ger ingen sats (en sats ur noll kronor betyder ingenting); finns det
 * ändå omsättning på dagar med hämtade avgifter står marknaden kvar med
 * `sales` 0, så att Kostnader kan räkna den med satsen.
 */
export function uppmattAvgift(rader: UppmattRad[]): Record<string, UppmattAvgift> {
  type Summa = { fees: number; sales: number; total: number; extern: number; days: number };
  const tom = (): Summa => ({ fees: 0, sales: 0, total: 0, extern: 0, days: 0 });
  /* Två högar per marknad: rader med uppdelning (vet vad som var täckt) och
     äldre rader utan (räknar hela omsättningen som täckt). En äldre rad med
     PayPal-omsättning bär avgift 0 på den — blandas den in blir satsen ett
     snitt med nollor igen, och 90-dagarsfönstret behåller sådana rader länge
     (rader före 60-dagarsgränsen skrivs aldrig om). Så fort det finns EN rad
     med uppdelning räknas bara de; de äldre används bara när inget annat finns. */
  const summa: Record<string, { ny: Summa; aldre: Summa }> = {};
  const lagg = (m: string, d: AvgiftsDag) => {
    if (d.fees == null || !(d.totalSales > 0)) return;
    const hog = (summa[m] ??= { ny: tom(), aldre: tom() });
    const a = d.feesCoveredSales != null ? hog.ny : hog.aldre;
    a.fees += d.fees;
    a.sales += tacktOms(d);
    a.total += d.totalSales;
    a.extern += kandExtern(d);
    a.days++;
  };
  for (const r of rader) {
    lagg("", r);
    for (const [m, del] of Object.entries(r.markets ?? {})) if (m) lagg(m, del);
  }
  const ut: Record<string, UppmattAvgift> = {};
  for (const [m, hog] of Object.entries(summa)) {
    const a = hog.ny.days > 0 ? hog.ny : hog.aldre;
    if (!(a.total > 0)) continue;
    ut[m] = { rate: a.sales > 0 ? a.fees / a.sales : 0, sales: a.sales, totalSales: a.total, extern: a.extern, days: a.days };
  }
  return ut;
}

/**
 * Satsen break-even ska räkna med: Shopify Payments-satsen på den täckta
 * delen, handlarens sats (plus tredjepartsavgiften för det som bevisligen
 * gick externt) på resten. En butik med 60 % Shopify Payments och 40 % PayPal
 * fick förut 60 %-delens sats på allt — och i värsta fall 0 %.
 */
export function blandadSats(
  matt: Pick<UppmattAvgift, "rate" | "sales" | "totalSales" | "extern">,
  sats: number,
  thirdPartyFeeRate = 0,
): number {
  if (!(matt.totalSales > 0)) return sats;
  const ovrigt = Math.max(0, matt.totalSales - matt.sales);
  return (matt.rate * matt.sales + sats * ovrigt + thirdPartyFeeRate * Math.min(ovrigt, matt.extern)) / matt.totalSales;
}

export interface Betalvag {
  gateway: string;
  sales: number;
  share: number;
}

/** Betalvägarnas andel av omsättningen, störst först. Negativa/nollor bort. */
export function betalvagar(rader: Pick<AvgiftsDag, "gatewaySales">[]): Betalvag[] {
  const per: Record<string, number> = {};
  for (const r of rader) {
    for (const [g, v] of Object.entries(r.gatewaySales ?? {})) per[g] = (per[g] ?? 0) + v;
  }
  const lista = Object.entries(per).filter(([, v]) => v > 0);
  const total = lista.reduce((a, [, v]) => a + v, 0);
  return lista
    .sort((a, b) => b[1] - a[1])
    .map(([gateway, sales]) => ({ gateway, sales, share: total > 0 ? sales / total : 0 }));
}

/** Läsbart namn på en betalväxel. Shopify ger råa nycklar ("shopify_payments"). */
export function betalvagNamn(gateway: string, ingen: string): string {
  if (gateway === SP_GATEWAY) return "Shopify Payments";
  if (gateway === INGEN_GATEWAY) return ingen;
  return gateway.replace(/_/g, " ");
}
