/**
 * Växelkurser från Frankfurter (ECB:s publicerade kurser). Gratis, utan nyckel.
 *
 * Används på två ställen: annonskostnad som betalas i en annan valuta än
 * butiken säljer i, och sammanslagningen av flera butiker till en gemensam
 * siffra. Båda kräver att kursen går att lita på — vi gissar aldrig, och när
 * kursen inte går att hämta säger anropande kod ifrån istället för att räkna
 * vidare på ett påhittat tal.
 */

const cache = new Map<string, { rate: number; at: number }>();
const TTL = 6 * 60 * 60 * 1000; // kurser rör sig inte snabbt nog för tätare

/** Dagens kurs mellan två valutor. 1 = samma valuta. undefined = okänd. */
export async function rate(from: string, to: string): Promise<number | undefined> {
  if (!from || !to) return undefined;
  if (from === to) return 1;

  const key = `${from}>${to}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.rate;

  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
    if (!res.ok) return undefined;
    const body = await res.json();
    const v = body?.rates?.[to];
    if (typeof v !== "number") return undefined;
    cache.set(key, { rate: v, at: Date.now() });
    return v;
  } catch {
    return undefined;
  }
}
