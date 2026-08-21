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
/* Nödfallsgräns: misslyckas hämtningen serveras den senast kända kursen upp
   till så här gammal. En kurs från i morse är ett långt mindre fel än att
   utesluta hela butiken ur gruppsumman — det var precis vad som hände när
   Frankfurter hickade: butiker "försvann" ur den gemensamma vyn. */
const NODFALL_TTL = 7 * 24 * 60 * 60 * 1000;

/** Dagens kurs mellan två valutor. 1 = samma valuta. undefined = okänd. */
export async function rate(from: string, to: string): Promise<number | undefined> {
  if (!from || !to) return undefined;
  if (from === to) return 1;

  const key = `${from}>${to}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.rate;

  // Två försök: enstaka nätverkshickor ska inte synas i UI:t.
  for (let försök = 0; försök < 2; försök++) {
    try {
      const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
      if (!res.ok) continue;
      const body = await res.json();
      const v = body?.rates?.[to];
      if (typeof v !== "number") continue;
      cache.set(key, { rate: v, at: Date.now() });
      return v;
    } catch {
      /* nästa försök, eller nödfallet nedan */
    }
  }

  if (hit && Date.now() - hit.at < NODFALL_TTL) return hit.rate;
  return undefined;
}
