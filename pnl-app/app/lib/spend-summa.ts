/**
 * Summering av annonskostnad över flera annonskonton.
 *
 * Egen modul utan databas- eller nätverksberoenden, så räknelogiken går att
 * testa direkt. Den är värd tester: en butik med två annonskonton får två
 * rader per dag, och ett fel här visar sig som en för LÅG annonskostnad och
 * därmed en för hög vinst — den dyraste sortens fel i hela appen.
 */

export interface SummerbarRad {
  /** YYYY-MM-DD. */
  day: string;
  /** Annonskontot raden kommer från, siffrorna utan act_-prefix. */
  account: string;
  /** Alltid i BUTIKENS valuta — därför går konton i olika valutor att lägga ihop. */
  spend: number;
  impressions: number;
  clicks: number;
}

export interface Dagssumma {
  day: string;
  spend: number;
  impressions: number;
  clicks: number;
}

/**
 * Slår ihop raderna till en post per dag.
 *
 * `dolda` är dagar som inte får serveras alls: ett av kontona har en död
 * nyckel och dagen skulle ha hämtats om. Att servera de ÖVRIGA kontonas
 * kostnad för den dagen vore att visa en halv annonskostnad som om den vore
 * hel — panelen ska hellre säga att dagen saknas.
 */
export function summeraDagar(rader: SummerbarRad[], dolda?: Set<string>): Dagssumma[] {
  const per = new Map<string, Dagssumma>();
  for (const r of rader) {
    if (dolda?.has(r.day)) continue;
    const a = per.get(r.day) ?? { day: r.day, spend: 0, impressions: 0, clicks: 0 };
    a.spend += Number(r.spend) || 0;
    a.impressions += Number(r.impressions) || 0;
    a.clicks += Number(r.clicks) || 0;
    per.set(r.day, a);
  }
  return [...per.values()].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
}
