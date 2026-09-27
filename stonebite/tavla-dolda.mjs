// tavla-dolda.mjs — Axels "rensa" på Laget: dölj en rad i "har legat länge".
//
// Axels revision 2026-09-26: "att jag kan rensa dem därifrån, på något sätt,
// de som är stuck for a while, om jag vet att det bara är någon glitch".
// En rad per tryck, jsonl på volymen, senaste raden per nyckel vinner — samma
// mönster som uppfoljning.mjs. Nyckeln är "<hubb>|<radnamn>" ur tavlan.
// Notion rörs aldrig härifrån.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { datamapp } from '../bonus/kor.mjs';

export const DOLDA = join(datamapp(), 'tavla-dolda.jsonl');

export function giltigNyckel(nyckel) {
  const n = String(nyckel ?? '').trim();
  return n.length > 0 && n.length <= 160 && n.includes('|') && !/[\n\r]/.test(n);
}

/** Map nyckel → { nyckel, dold, tid, av }. Bara rader med dold: true är dolda. */
export function lasDolda(fil = DOLDA) {
  const senaste = new Map();
  if (!existsSync(fil)) return senaste;
  for (const rad of readFileSync(fil, 'utf8').split('\n')) {
    if (!rad.trim()) continue;
    try { const r = JSON.parse(rad); if (r?.nyckel) senaste.set(r.nyckel, r); } catch { /* trasig rad hoppas över */ }
  }
  return senaste;
}

export function skrivDold({ nyckel, dold = true, av = null, nu = new Date() } = {}, fil = DOLDA) {
  if (!giltigNyckel(nyckel)) throw new Error('Raden saknar nyckel. Ladda om sidan och försök igen.');
  const rad = { nyckel: String(nyckel).trim(), dold: Boolean(dold), tid: nu.toISOString(), av: av ? String(av).slice(0, 120) : null };
  mkdirSync(dirname(fil), { recursive: true });
  appendFileSync(fil, `${JSON.stringify(rad)}\n`);
  return rad;
}
