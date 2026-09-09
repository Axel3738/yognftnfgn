// Hämtar veckans supportmail och klassar dem.
//
// ⚠️ VARFÖR INTE IMAP DIREKT MOT LOOPIA:
// Mätt 2026-09-09 i den container rutinerna körs i: port 993 och 143 mot
// mailcluster.loopia.se ger timeout, och tunnlat genom agent-proxyn stängs
// förbindelsen efter 6 sekunder. Bara HTTPS på 443 går ut. En IMAP-klient här
// skulle alltså aldrig kunna köras av veckorutinen.
//
// Därför hämtas mailen över HTTPS från en brevlåda — samma mönster som
// tools/drive-brevlada.gs redan använder för Drive. Se brevlada.gs.

import { BREVLADA } from './konfig.mjs';
import { kategorisera, hotniva, hittaOrdernummer } from './kategorisering.mjs';

// Hämtar rå mailrader ur brevlådan. Kastar hellre än att returnera tomt —
// noll mail och "kunde inte läsa mailen" är olika saker, och rapporten måste
// kunna skilja dem åt.
export async function hamtaMail({ dagar = 7 } = {}) {
  const url = BREVLADA.url();
  const nyckel = BREVLADA.nyckel();
  if (!url || !nyckel) {
    throw new Error(
      'Brevlådan är inte kopplad. Sätt MAIL_BREVLADA_URL och ' +
        'MAIL_BREVLADA_KEY i miljön (se kundvakten/brevlada.gs).'
    );
  }
  const svar = await fetch(
    `${url}?key=${encodeURIComponent(nyckel)}&dagar=${dagar}&action=lista`,
    { redirect: 'follow' }
  );
  if (!svar.ok) {
    throw new Error(`Brevlådan svarade ${svar.status}: ${(await svar.text()).slice(0, 200)}`);
  }
  const data = await svar.json();
  if (!data.ok) throw new Error(`Brevlådan: ${data.fel || 'okänt fel'}`);
  return data.mail || [];
}

// Klassar en lista råa mail. Ren funktion — går att köra på sparad data.
export function berikaMail(raa) {
  return raa.map((m) => ({
    ...m,
    kategori: kategorisera(m),
    hot: hotniva(m),
    ordernummer: hittaOrdernummer(m),
  }));
}
