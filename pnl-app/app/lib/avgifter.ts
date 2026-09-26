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
 * Omsättning som BEVISLIGEN gick utanför Shopify Payments — avgifterna
 * hämtades och dagen vet vad som var täckt. Bara den får Shopifys avgift för
 * externa betalväxlar: en äldre dag utan uppdelning, eller en dag vars
 * avgifter nekades, kan lika gärna vara Shopify Payments.
 */
export function kandExtern(d: AvgiftsDag): number {
  if (d.fees == null || d.feesCoveredSales == null) return 0;
  return Math.max(0, d.totalSales - d.feesCoveredSales);
}

export interface AvgiftsUnderlag {
  sales: AvgiftsDag[];
  totalSales: number;
  /**
   * Avgiften för HELA omsättningen om allt räknats med satsen (per marknad).
   * Motorn räknar ut den; här tas bara den okända andelen av den.
   */
  satsBaserat: number;
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
  const okandAndel = totalSales > 0 ? Math.max(0, totalSales - omsMedFaktiska) / totalSales : 0;
  const tredjepart = extern * (u.thirdPartyFeeRate ?? 0);
  return {
    fees: faktiska + u.satsBaserat * okandAndel + tredjepart,
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
  const summa: Record<string, { fees: number; sales: number; total: number; extern: number; days: number }> = {};
  const lagg = (m: string, d: AvgiftsDag) => {
    if (d.fees == null || !(d.totalSales > 0)) return;
    const a = (summa[m] ??= { fees: 0, sales: 0, total: 0, extern: 0, days: 0 });
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
  for (const [m, a] of Object.entries(summa)) {
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
