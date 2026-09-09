// Minimal .env-läsare (noll beroenden). Läser factory/.env om den finns.
// Sätter aldrig över variabler som redan finns i miljön.
// Tokens hårdkodas ALDRIG — .env är gitignorerad, .env.example är mallen.
//
// Det här är den ENDA .env-parsern i fabriken: token.mjs (som också skriver
// filen) läser genom `lasEnvFil` härifrån, så formatet tolkas på ett ställe.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

export const ENV_FIL = join(dirname(fileURLToPath(import.meta.url)), '.env');

// Tolkar en rad `NYCKEL=värde` → [nyckel, värde] eller null (tom rad, kommentar,
// rad utan '='). Citattecken runt värdet skalas av.
export function tolkaEnvRad(rad) {
  const trimmad = String(rad ?? '').trim();
  if (!trimmad || trimmad.startsWith('#')) return null;
  const i = trimmad.indexOf('=');
  if (i === -1) return null;
  const nyckel = trimmad.slice(0, i).trim();
  if (!nyckel) return null;
  let varde = trimmad.slice(i + 1).trim();
  if (
    varde.length >= 2 &&
    (varde[0] === '"' || varde[0] === "'") &&
    varde[varde.length - 1] === varde[0]
  ) {
    varde = varde.slice(1, -1);
  }
  return [nyckel, varde];
}

// Läser en .env-fil till ett objekt. Saknas filen: tomt objekt.
export function lasEnvFil(sokvag = ENV_FIL) {
  const ut = {};
  if (!existsSync(sokvag)) return ut;
  for (const rad of readFileSync(sokvag, 'utf8').split(/\r?\n/)) {
    const par = tolkaEnvRad(rad);
    if (par) ut[par[0]] = par[1];
  }
  return ut;
}

export function laddaEnv(sokvag = ENV_FIL) {
  for (const [nyckel, varde] of Object.entries(lasEnvFil(sokvag))) {
    if (!(nyckel in process.env)) process.env[nyckel] = varde;
  }
}
