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
 * Antal dygn i rad, räknat bakåt från det senaste, där ROAS låg under break-even.
 * @param {Array<{datum: string, roas: number}>} dygn  Dygnsserie från Meta
 */
export function backDagarIRad(dygn, breakEven) {
  if (!Array.isArray(dygn) || !Number.isFinite(breakEven)) return null;
  const sorterade = [...dygn]
    .filter((d) => d && typeof d.datum === 'string' && Number.isFinite(d.roas))
    .sort((a, b) => (a.datum < b.datum ? 1 : -1));
  if (sorterade.length === 0) return null;
  let streak = 0;
  for (const dag of sorterade) {
    if (dag.roas < breakEven) streak += 1;
    else break;
  }
  return streak;
}

/**
 * Senaste raden för kampanjen vars kod finns i listan. Används av åtgärds-
 * trappan för att veta vilket steg som redan tagits.
 * @returns {object|null}
 */
export function senasteRadMedKod(logg, kampanjId, koder) {
  let träff = null;
  for (const rad of logg) {
    if (rad.kampanj_id !== kampanjId) continue;
    if (!koder.includes(rad.kod)) continue;
    if (rad.genomford !== true) continue;
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
  await appendFile(fil, `${JSON.stringify(rad)}\n`, 'utf8');
  return rad;
}
