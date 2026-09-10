// Budgetloggen — nattvaktens minne. En rad per ändring i annonskontot,
// append-only, aldrig redigerad. Filen ligger i repot (factory/budgetlogg.jsonl)
// och pushas av rutinen: en rutin som inte pushar loggen har inte lärt sig
// något, och nästa rond räknar då kadens ur ett tomt minne.
//
// Metas API svarar på vad en budget ÄR, aldrig på när VI senast ändrade den.
// Kadensspärren ("≥ 3 dygn sedan senaste ändring"), max-3-per-rond och
// "andra gången noll köp ⇒ pausa" bygger alla på den här filen.
//
// Radens form (en JSON-rad per ändring):
//   datum          YYYY-MM-DD (rondens --idag, aldrig klockan)
//   ad_account_id  kontot som ändrades
//   butik          registrets nyckel (butik/produkt)
//   entitet_id     kampanj-, adset- eller annons-id i Meta
//   entitet_typ    campaign | adset | ad
//   namn           entitetens namn i kontot
//   atgard         SKALA | RAKET | SNABB | SANK | PAUSA | NOLL_KOP_SANK
//   gammalt        före (kr/dag, eller status för PAUSA)
//   nytt           efter, tillbakaläst ur kontot (kr/dag eller status)
//   motivering     varför, i klartext
//   genomford      true bara när tillbakaläsningen bekräftade ändringen
//   fel            felet i klartext när genomford är false, annars null
//
// Ursprung: agent/logg.mjs på grenen claude/daily-agent-discussion-uos5df
// (dagarSedanAndring, backDagarIRad). Skrivet om här 2026-09-10 med
// entitet_id i stället för kampanj_id, eftersom budgetenheten i OPS-kontot
// kan vara ett adset och en kill kan gälla en annons.

import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const LOGGFIL = join(ROT, 'factory', 'budgetlogg.jsonl');

export const ATGARDER = Object.freeze(['SKALA', 'RAKET', 'SNABB', 'SANK', 'PAUSA', 'NOLL_KOP_SANK']);
export const ENTITETSTYPER = Object.freeze(['campaign', 'adset', 'ad']);
// Åtgärderna som flyttar en BUDGET. PAUSA rör statusen och räknas separat.
export const BUDGETATGARDER = Object.freeze(['SKALA', 'RAKET', 'SNABB', 'SANK', 'NOLL_KOP_SANK']);

const DATUM = /^\d{4}-\d{2}-\d{2}$/;
const tid = (datum) => Date.parse(`${datum}T00:00:00Z`);

/** Läser hela loggen. Trasiga rader hoppas över — en dålig rad ska inte stoppa
 *  dagens rond, men den ska synas: se raknaTrasiga. Tom lista utan fil. */
export function lasLogg(fil = LOGGFIL) {
  if (!existsSync(fil)) return [];
  const rader = [];
  for (const linje of readFileSync(fil, 'utf8').split('\n')) {
    const t = linje.trim();
    if (!t) continue;
    try { rader.push(JSON.parse(t)); } catch { /* räknas i raknaTrasiga */ }
  }
  return rader;
}

/** Antal rader som inte går att tolka, så rapporten kan larma i stället för att tiga. */
export function raknaTrasiga(fil = LOGGFIL) {
  if (!existsSync(fil)) return 0;
  let n = 0;
  for (const linje of readFileSync(fil, 'utf8').split('\n')) {
    if (!linje.trim()) continue;
    try { JSON.parse(linje); } catch { n += 1; }
  }
  return n;
}

/** Bygger en loggrad med alla fält på plats. Kastar hellre än att skriva en rad
 *  som inte går att tolka i efterhand. Ren funktion. */
export function byggLoggrad({
  datum, ad_account_id, butik, entitet_id, entitet_typ, namn, atgard,
  gammalt = null, nytt = null, motivering = '', genomford = false, fel = null,
}) {
  if (!DATUM.test(String(datum ?? ''))) throw new Error(`Loggradens datum "${datum}" är inte YYYY-MM-DD — kadensspärren skulle bli blind för raden.`);
  for (const [falt, varde] of Object.entries({ ad_account_id, butik, entitet_id, namn })) {
    if (varde === undefined || varde === null || String(varde).trim() === '') {
      throw new Error(`Loggraden saknar "${falt}" — vägrar skriva en rad som inte går att tolka i efterhand.`);
    }
  }
  if (!ATGARDER.includes(atgard)) throw new Error(`Okänd åtgärd "${atgard}" — tillåtna: ${ATGARDER.join(', ')}.`);
  if (!ENTITETSTYPER.includes(entitet_typ)) throw new Error(`Okänd entitetstyp "${entitet_typ}" — tillåtna: ${ENTITETSTYPER.join(', ')}.`);
  if (genomford === true && BUDGETATGARDER.includes(atgard) && !Number.isFinite(nytt)) {
    throw new Error(`En genomförd ${atgard} utan nytt belopp gör ändringen osynlig för kadensspärren — vägrar.`);
  }
  if (genomford !== true && !fel) {
    throw new Error('En rad som inte genomfördes måste bära felet (fel) — annars går det inte att se varför.');
  }
  return {
    datum, ad_account_id: String(ad_account_id), butik, entitet_id: String(entitet_id), entitet_typ,
    namn, atgard, gammalt, nytt, motivering, genomford: genomford === true, fel: genomford === true ? null : fel,
  };
}

/** Skriver en rad (validerad via byggLoggrad). Returnerar raden. */
export function skrivRad(rad, fil = LOGGFIL) {
  const klar = byggLoggrad(rad);
  appendFileSync(fil, `${JSON.stringify(klar)}\n`, 'utf8');
  return klar;
}

/** Raderna som faktiskt rörde kontot: genomförda, med giltigt datum. */
const genomforda = (rader) => (Array.isArray(rader) ? rader : [])
  .filter((r) => r && r.genomford === true && DATUM.test(String(r.datum ?? '')));

/**
 * Hela dygn sedan VI senast ändrade entiteten (budget eller status).
 * Bara genomförda rader räknas — ett förslag som aldrig nådde kontot har inte
 * rört Metas inlärning och ska inte bromsa nästa rond.
 * @returns {number|null} null = aldrig ändrad av oss
 */
export function dagarSedanAndring(rader, entitetId, idag) {
  const nu = tid(idag);
  if (!Number.isFinite(nu)) throw new Error(`Ogiltigt datum "${idag}" (använd YYYY-MM-DD).`);
  let senaste = null;
  for (const r of genomforda(rader)) {
    if (String(r.entitet_id) !== String(entitetId)) continue;
    const nar = tid(r.datum);
    if (senaste === null || nar > senaste) senaste = nar;
  }
  return senaste === null ? null : Math.floor((nu - senaste) / 86400000);
}

/** Genomförda ändringar för butiken i dag — så en omkörning samma dag inte
 *  dubblar max-3-spärren. */
export function andringarIdag(rader, butik, idag) {
  return genomforda(rader).filter((r) => r.butik === butik && r.datum === idag);
}

/**
 * Finns en genomförd rad med åtgärden för entiteten inom de senaste `dagar`
 * dygnen (räknat från `idag`, inklusive i dag)? Utan `dagar` söks hela loggen.
 * Används för "andra gången noll köp ⇒ pausa".
 */
export function harRad(rader, entitetId, atgard, dagar = null, idag = null) {
  let nu = null;
  if (dagar !== null && dagar !== undefined) {
    nu = tid(idag);
    if (!Number.isFinite(nu)) throw new Error('harRad: ange idag (YYYY-MM-DD) när dagar är satt.');
  }
  return genomforda(rader).some((r) => {
    if (String(r.entitet_id) !== String(entitetId) || r.atgard !== atgard) return false;
    if (nu === null) return true;
    const alder = (nu - tid(r.datum)) / 86400000;
    return alder >= 0 && alder <= dagar;
  });
}

/** Senaste genomförda raden för entiteten, eller null. */
export function senasteRad(rader, entitetId) {
  let traff = null;
  for (const r of genomforda(rader)) {
    if (String(r.entitet_id) !== String(entitetId)) continue;
    if (traff === null || String(r.datum) >= String(traff.datum)) traff = r;
  }
  return traff;
}
