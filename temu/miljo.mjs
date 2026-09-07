// Läser en .env-fil in i process.env så skripten funkar på Axels Mac,
// där molnmiljöns variabler inte finns. Inga beroenden.
//
// Letar i den här ordningen och tar den första som finns:
//   <repo>/.env          ← rekommenderad plats
//   <repo>/temu/.env
// Redan satta variabler skrivs ALDRIG över — molnmiljön vinner alltid,
// så samma kod fungerar både lokalt och här.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const härUppe = dirname(fileURLToPath(import.meta.url)); // …/temu
const KANDIDATER = [join(härUppe, '..', '.env'), join(härUppe, '.env')];

let laddad = null;

export function laddaEnv() {
  if (laddad) return laddad;
  const fil = KANDIDATER.find((f) => existsSync(f));
  if (!fil) return (laddad = { fil: null, antal: 0 });

  let antal = 0;
  for (const rad of readFileSync(fil, 'utf8').split(/\r?\n/)) {
    const r = rad.trim();
    if (!r || r.startsWith('#')) continue;
    const i = r.indexOf('=');
    if (i < 1) continue;
    const nyckel = r.slice(0, i).trim();
    let värde = r.slice(i + 1).trim();
    // Tillåt "citerat värde" och 'citerat värde'
    if ((värde.startsWith('"') && värde.endsWith('"')) || (värde.startsWith("'") && värde.endsWith("'"))) {
      värde = värde.slice(1, -1);
    }
    if (process.env[nyckel] === undefined) { process.env[nyckel] = värde; antal++; }
  }
  return (laddad = { fil, antal });
}

laddaEnv();
