// Budgetloggen — systemets minne.
//
// Metas API kan svara på vad en budget ÄR, aldrig på när den senast ändrades
// (aktivitetsloggen är inte påslagen för MagiBorsten). Reglerna "högst var
// tredje dag" och "7 dygn i rad back" bygger på gårdagen, så det måste skrivas
// ner någonstans. Här. En rad per beslut, append-only, aldrig redigerad.

import { appendFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
export const LOGGFIL = join(HÄR, 'budgetlogg.jsonl');

/** Läser hela loggen. Trasiga rader hoppas över — en dålig rad ska inte stoppa dagens rond. */
export async function lasLogg(fil = LOGGFIL) {
  if (!existsSync(fil)) return [];
  const rå = await readFile(fil, 'utf8');
  const rader = [];
  for (const linje of rå.split('\n')) {
    const trimmad = linje.trim();
    if (!trimmad) continue;
    try {
      rader.push(JSON.parse(trimmad));
    } catch {
      // Hoppa över, men tyst bara här — rond.mjs räknar och redovisar antalet.
    }
  }
  return rader;
}

/** Antal trasiga rader i loggen, så att rond.mjs kan larma i stället för att tiga. */
export async function raknaTrasigaRader(fil = LOGGFIL) {
  if (!existsSync(fil)) return 0;
  const rå = await readFile(fil, 'utf8');
  let trasiga = 0;
  for (const linje of rå.split('\n')) {
    if (!linje.trim()) continue;
    try {
      JSON.parse(linje);
    } catch {
      trasiga += 1;
    }
  }
  return trasiga;
}

/**
 * Hur många hela dygn sedan budgeten för kampanjen senast ÄNDRADES av oss.
 * Bara rader med `genomford: true` och en ny budget räknas — ett förslag som
 * aldrig godkändes har inte rört kontot och ska inte bromsa nästa rond.
 * @returns {number|null} null när vi aldrig ändrat den
 */
export function dagarSedanAndring(logg, kampanjId, idagISO) {
  const idag = Date.parse(`${idagISO}T00:00:00Z`);
  if (!Number.isFinite(idag)) throw new Error(`Ogiltigt datum "${idagISO}"`);
  let senaste = null;
  for (const rad of logg) {
    if (rad.kampanj_id !== kampanjId) continue;
    if (rad.genomford !== true) continue;
    if (!Number.isFinite(rad.ny_budget)) continue;
    const när = Date.parse(`${rad.datum}T00:00:00Z`);
    if (!Number.isFinite(när)) continue;
    if (senaste === null || när > senaste) senaste = när;
  }
  if (senaste === null) return null;
  return Math.floor((idag - senaste) / 86400000);
}

/**
 * Antal dygn i rad, räknat bakåt från senaste dygnet, där kampanjen spenderade
 * utan att nå break-even.
 *
 * Tre regler efter granskningen 2026-08-29:
 * - Ett dygn med spend men UTAN mätbar ROAS räknas som back-dygn — noll köp är
 *   per definition under break-even. (Metas API utelämnar purchase_roas de
 *   dygn inget säljs, och det är precis de värsta dygnen.)
 * - Ett dygn utan spend, eller en lucka i kalendern, BRYTER streaken — då körde
 *   kampanjen inte, och "7 dagar back i rad" ska betyda sju körda dygn.
 * - Äldre serier utan spend-fält behandlas som att spend fanns.
 *
 * @param {Array<{datum: string, roas?: number, spend?: number}>} dygn
 */
export function backDagarIRad(dygn, breakEven) {
  if (!Array.isArray(dygn) || !Number.isFinite(breakEven)) return null;
  const rader = dygn.filter((d) => d && /^\d{4}-\d{2}-\d{2}$/.test(String(d.datum ?? '')));
  if (rader.length === 0) return null;
  const sorterade = [...rader].sort((a, b) => (a.datum < b.datum ? 1 : -1));
  let streak = 0;
  let vantat = null;
  for (const dag of sorterade) {
    if (vantat !== null && dag.datum !== vantat) break; // lucka i kalendern
    const harSpend = dag.spend === undefined
      ? true
      : Number.isFinite(dag.spend) && dag.spend > 0;
    if (!harSpend) break;
    if (Number.isFinite(dag.roas) && dag.roas >= breakEven) break;
    streak += 1;
    vantat = new Date(Date.parse(`${dag.datum}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
  }
  return streak;
}

/**
 * Senaste raden för kampanjen vars kod finns i listan. Används av åtgärds-
 * trappan för att veta vilket steg som redan tagits.
 * @returns {object|null}
 */
export function senasteRadMedKod(logg, kampanjId, koder, { maxAlderDagar = null, idag = null } = {}) {
  let träff = null;
  for (const rad of logg) {
    if (rad.kampanj_id !== kampanjId) continue;
    if (!koder.includes(rad.kod)) continue;
    if (rad.genomford !== true) continue;
    if (maxAlderDagar !== null && idag !== null) {
      const alder = (Date.parse(`${idag}T00:00:00Z`) - Date.parse(`${rad.datum}T00:00:00Z`)) / 86400000;
      if (!Number.isFinite(alder) || alder > maxAlderDagar) continue; // för gammal — hör till en tidigare cykel
    }
    if (träff === null || String(rad.datum) > String(träff.datum)) träff = rad;
  }
  return träff;
}

/**
 * Skriver en rad. Allt som behövs för att i efterhand kunna svara på
 * "varför gjorde den så här" utan att gissa.
 */
export async function skrivRad(rad, fil = LOGGFIL) {
  const obligatoriska = ['datum', 'kampanj_id', 'kampanj_namn', 'ad_account_id', 'kod'];
  for (const nyckel of obligatoriska) {
    if (rad[nyckel] === undefined || rad[nyckel] === null || rad[nyckel] === '') {
      throw new Error(`Loggraden saknar "${nyckel}" — vägrar skriva en rad som inte går att tolka i efterhand`);
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(rad.datum))) {
    throw new Error(`Loggradens datum "${rad.datum}" är inte YYYY-MM-DD — kadensspärren skulle bli blind för raden`);
  }
  if (['SKALA', 'SANK', 'HALVERA'].includes(rad.kod) && rad.genomford === true
      && !Number.isFinite(rad.ny_budget)) {
    throw new Error(`En genomförd ${rad.kod} utan ny_budget gör ändringen osynlig för kadensspärren — vägrar`);
  }
  await appendFile(fil, `${JSON.stringify(rad)}\n`, 'utf8');
  return rad;
}
