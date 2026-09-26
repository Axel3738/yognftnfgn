// kallor/valuta.mjs — växelkurserna till kronor, ur Europeiska centralbanken. LÄS-BARA.
//
// Behövs för EN sak: MER per verksamhet (all försäljning ÷ all reklam). Reklamen
// betalas i kronor men de norska, danska och finska butikerna säljer i sin egen
// valuta. Kvoten går inte att räkna utan att försäljningen räknas om.
//
// Reglerna:
//   • Kursen gissas aldrig. Den kommer ur ECB:s dagliga referenskurser och bär
//     sitt eget datum, som sidan visar bredvid talet.
//   • Valutor SUMMERAS fortfarande aldrig på sidan: varje butiks försäljning
//     står i sin egen valuta. Omräkningen används bara i MER-kvoten och i
//     "kvar efter reklam", och sidan säger det varje gång.
//   • Ett svar utanför rimliga gränser är ett trasigt API, inte en kursrörelse.
//
// Källa: https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml
// (mätt 2026-09-26: Frankfurter svarade 520/522 från containern, ECB svarade.)

export const ECB = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';

/** Kronor per euro har legat mellan 8 och 13 i modern tid. */
const RIMLIG_SEK_PER_EUR = { min: 7, max: 15 };

/**
 * ECB:s XML → { datum, eur: { SEK: 11.02, NOK: 11.7, … } } (enheter per euro).
 * null om svaret inte går att lita på.
 */
export function tolkaEcb(xml) {
  const text = String(xml ?? '');
  const datum = text.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/)?.[1] ?? null;
  const eur = { EUR: 1 };
  for (const m of text.matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)) {
    const v = Number(m[2]);
    if (Number.isFinite(v) && v > 0) eur[m[1]] = v;
  }
  const sek = eur.SEK;
  if (!datum || !(sek > RIMLIG_SEK_PER_EUR.min && sek < RIMLIG_SEK_PER_EUR.max)) return null;
  return { datum, eur };
}

/**
 * Kronor per en enhet av varje valuta: { SEK: 1, EUR: 11.02, NOK: 0.94, … }.
 * Räknas genom euron, som ECB:s kurser står i.
 */
export function kronorPer(eur) {
  const sek = eur?.SEK;
  if (!sek) return {};
  const ut = { SEK: 1 };
  for (const [valuta, perEur] of Object.entries(eur)) {
    if (valuta === 'SEK') continue;
    ut[valuta] = Math.round((sek / perEur) * 1e6) / 1e6;
  }
  return ut;
}

/**
 * Hämtar dagens kurser. Aldrig ett undantag: ett fel blir { status: 'fel', orsak }
 * så att sidan kan säga varför MER saknas.
 */
export async function hamtaKurser({ fetchFn = fetch, nu = new Date() } = {}) {
  try {
    const svar = await fetchFn(ECB, { signal: AbortSignal.timeout(20000) });
    if (!svar.ok) return { status: 'fel', orsak: `ECB svarade ${svar.status}`, kalla: ECB };
    const tolkad = tolkaEcb(await svar.text());
    if (!tolkad) return { status: 'fel', orsak: 'ECB:s svar gick inte att tolka, eller kursen var orimlig', kalla: ECB };
    return { status: 'ok', orsak: null, datum: tolkad.datum, hamtad: nu.toISOString(), kalla: ECB, sekPer: kronorPer(tolkad.eur) };
  } catch (e) {
    return { status: 'fel', orsak: `ECB gick inte att nå: ${e.message}`, kalla: ECB };
  }
}
