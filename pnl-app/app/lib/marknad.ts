/**
 * Marknader — klientsäkra hjälpare (ingen databas, inget nätverk).
 *
 * En marknad är ISO-landskoden (två bokstäver) i orderns leveransadress:
 * "SE", "NO", "US". Tom sträng betyder två olika saker beroende på var den
 * står, och det är avsiktligt:
 *   - som FILTER: "alla marknader" (ingen filtrering)
 *   - på en KOSTNAD: standardkostnaden, den som gäller när marknaden saknar
 *     egen post
 *   - på en ORDER eller KAMPANJ: okänt land / omärkt kampanj
 *
 * Varför landskod och inte Shopify Markets: att läsa butikens Markets-objekt
 * kräver scopen read_markets, och en ny scope tvingar varje installerad butik
 * genom en omauktorisering. Landet i leveransadressen följer med read_orders
 * och är dessutom det som faktiskt avgör fraktkostnaden.
 */

/** Filter-/standardvärdet: alla marknader. */
export const ALLA_MARKNADER = "";

/** Normaliserar en landskod: "se", " NO " och "US" → "SE", "NO", "US". Okänt → "". */
export function marknadskod(v: unknown): string {
  const s = String(v ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(s) ? s : "";
}

/**
 * Landets namn på UI-språket ("Sverige", "Norway"). Faller tillbaka på koden
 * om webbläsaren eller Node saknar namnet. Tom kod = det som anroparen
 * skickar som `tom` ("Alla marknader" / "Okänt land").
 */
export function marknadsnamn(kod: string, lang: "en" | "sv", tom: string): string {
  if (!kod) return tom;
  try {
    const dn = new Intl.DisplayNames([lang === "sv" ? "sv" : "en"], { type: "region" });
    return dn.of(kod) ?? kod;
  } catch {
    return kod;
  }
}

/**
 * Grov gissning av butikens hemland ur valutan — bara för sorteringen, så att
 * "Sverige" står först i en svensk butiks lista. EUR har inget land.
 */
export function hemlandAv(currency: string | null | undefined): string {
  const map: Record<string, string> = {
    SEK: "SE", NOK: "NO", DKK: "DK", USD: "US", GBP: "GB", PLN: "PL", CZK: "CZ",
    CHF: "CH", CAD: "CA", AUD: "AU", NZD: "NZ", JPY: "JP", HUF: "HU", RON: "RO",
  };
  return map[String(currency ?? "").toUpperCase()] ?? "";
}

/** Landskoder i stabil ordning: butikens hemland först om känt, sedan alfabetiskt. */
export function sorteraMarknader(koder: Iterable<string>, hemland = ""): string[] {
  const unika = [...new Set([...koder].map(marknadskod).filter(Boolean))];
  return unika.sort((a, b) => {
    if (a === hemland) return -1;
    if (b === hemland) return 1;
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

export interface Marknadsavgift {
  /** Kortavgift, andel (0.034 = 3,4 %). Null = standardavgiften. */
  feeRate: number | null;
  /** Valutaväxlingsavgift, andel. Null/0 = ingen. */
  fxFeeRate: number | null;
}

/** Städar lagrade avgifter: bara giltiga landskoder och tal mellan 0 och 1. */
export function stadaAvgifter(ra: unknown): Record<string, Marknadsavgift> {
  const ut: Record<string, Marknadsavgift> = {};
  if (!ra || typeof ra !== "object") return ut;
  const tal = (v: unknown) => {
    const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
    return Number.isFinite(n) && n >= 0 && n < 1 ? n : null;
  };
  for (const [k, v] of Object.entries(ra as Record<string, unknown>)) {
    const kod = marknadskod(k);
    if (!kod || !v || typeof v !== "object") continue;
    const o = v as { feeRate?: unknown; fxFeeRate?: unknown };
    const feeRate = tal(o.feeRate);
    const fxFeeRate = tal(o.fxFeeRate);
    if (feeRate == null && fxFeeRate == null) continue;
    ut[kod] = { feeRate, fxFeeRate };
  }
  return ut;
}
