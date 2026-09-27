/**
 * Google Ads: den rena logiken, utan databas och utan nätverk.
 *
 * Egen fil för att den ska gå att testa. Den bär de två räknefel som kostar
 * riktiga pengar om de smyger sig in — kontoprefixet och miljondelarna — och
 * de ska ha ett test var, inte ett resonemang.
 */

/**
 * Prefixet som håller Googles kundnummer isär från Metas konto-id i den
 * delade `DailySpend`-tabellen.
 *
 * Båda är rena siffror. Utan prefixet kunde ett Google-kundnummer krocka med
 * ett Meta-annonskonto-id, och de två kontona skrivit över varandras dagar
 * utan att något såg fel ut.
 */
export const PREFIX = "g:";

export const somKonto = (customerId: string): string => `${PREFIX}${String(customerId).replace(/\D/g, "")}`;
export const arGoogle = (account: string): boolean => account.startsWith(PREFIX);

export interface GoogleSpendRad {
  day: string;
  /** null i dagsläget, 0–23 när timvis efterfrågats. */
  hour: number | null;
  spend: number;
  impressions: number;
  clicks: number;
}

/**
 * Googles GAQL-rader → dag- (eller tim-) hinkar, i kontots valuta.
 *
 * ⚠️ `cost_micros` är MILJONDELAR av kontots valuta. Utan delningen blir
 * annonskostnaden en miljon gånger för hög och vinsten lika mycket för låg.
 *
 * ⚠️ Ett timvis svar utan timme får inte falla ner i dagshinken: då hade
 * samma kostnad räknats både som dag och som timme, och timgrafens summa
 * sagt emot dagssiffran.
 *
 * Fältnamnen kommer i båda stavningarna beroende på hur svaret serialiseras
 * (`costMicros` i JSON, `cost_micros` i GAQL-namn), så båda läses.
 */
export function tolkaSpend(rader: any[], timvis = false): GoogleSpendRad[] {
  const per = new Map<string, GoogleSpendRad>();
  for (const r of rader ?? []) {
    const day = String(r?.segments?.date ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;

    const rat = timvis ? Number(r?.segments?.hour) : NaN;
    const hour = Number.isInteger(rat) && rat >= 0 && rat <= 23 ? rat : null;
    if (timvis && hour == null) continue;

    const nyckel = `${day}|${hour ?? ""}`;
    const h = per.get(nyckel) ?? { day, hour, spend: 0, impressions: 0, clicks: 0 };
    h.spend += Number(r?.metrics?.costMicros ?? r?.metrics?.cost_micros ?? 0) / 1_000_000;
    h.impressions += parseInt(String(r?.metrics?.impressions ?? "0"), 10) || 0;
    h.clicks += parseInt(String(r?.metrics?.clicks ?? "0"), 10) || 0;
    per.set(nyckel, h);
  }
  return [...per.values()].sort((a, b) => a.day.localeCompare(b.day) || (a.hour ?? 0) - (b.hour ?? 0));
}

/**
 * `searchStream` svarar med en LISTA av batchar, inte ett objekt.
 *
 * Läses bara den första batchen tappas allt efter de första tusen raderna —
 * tyst, och annonskostnaden blir för låg utan att något ser fel ut.
 */
export function platta(body: any): any[] {
  const batchar = Array.isArray(body) ? body : [body];
  return batchar.flatMap((b: any) => b?.results ?? []);
}

/**
 * Googles felmeddelande ur ett svar. Google lägger det på tre olika ställen
 * beroende på om anropet var en ström eller inte; utan alla tre blir ett
 * begripligt fel till "Google svarade 400".
 */
export function felText(body: any): string {
  const f = body?.error ?? body?.[0]?.error;
  const detalj = f?.details?.[0]?.errors?.[0]?.message;
  return String(detalj || f?.message || "");
}

export interface GoogleKonto {
  customerId: string;
  name: string;
  currency: string;
  timezone: string;
  /** Chefskontot som anropen måste gå via, null när kontot nås direkt. */
  loginCustomerId: string | null;
}

/**
 * En GAQL-rad ur `customer` eller `customer_client` → ett valbart konto.
 *
 * Null för chefskonton: de har ingen egen annonskostnad, de är mappar, och
 * en koppling till en mapp hade alltid rapporterat noll.
 */
export function kontoUrRad(c: any, reservId: string, loginCustomerId: string | null): GoogleKonto | null {
  if (!c || c.manager === true) return null;
  const id = String(c.id ?? reservId).replace(/\D/g, "");
  if (!id) return null;
  return {
    customerId: id,
    name: String(c.descriptiveName ?? c.descriptive_name ?? id),
    currency: String(c.currencyCode ?? c.currency_code ?? ""),
    timezone: String(c.timeZone ?? c.time_zone ?? ""),
    loginCustomerId: loginCustomerId ? loginCustomerId.replace(/\D/g, "") : null,
  };
}

/**
 * Samma konto kan nås både direkt och via ett chefskonto. Den direkta vägen
 * vinner: den kräver inget `login-customer-id` och slutar inte fungera om
 * någon tar bort chefskontots länk.
 */
export function slaIhopKonton(konton: GoogleKonto[]): GoogleKonto[] {
  const per = new Map<string, GoogleKonto>();
  for (const k of konton) {
    const fore = per.get(k.customerId);
    if (!fore || (fore.loginCustomerId && !k.loginCustomerId)) per.set(k.customerId, k);
  }
  return [...per.values()];
}
