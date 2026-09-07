// Minimal .env-läsare (noll beroenden). Läser factory/.env om den finns.
// Sätter aldrig över variabler som redan finns i miljön.
// Tokens hårdkodas ALDRIG — .env är gitignorerad, .env.example är mallen.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

export function laddaEnv() {
  const sokvag = join(dirname(fileURLToPath(import.meta.url)), '.env');
  if (!existsSync(sokvag)) return;
  for (const rad of readFileSync(sokvag, 'utf8').split(/\r?\n/)) {
    const trimmad = rad.trim();
    if (!trimmad || trimmad.startsWith('#')) continue;
    const i = trimmad.indexOf('=');
    if (i === -1) continue;
    const nyckel = trimmad.slice(0, i).trim();
    let varde = trimmad.slice(i + 1).trim();
    if (
      varde.length >= 2 &&
      (varde[0] === '"' || varde[0] === "'") &&
      varde[varde.length - 1] === varde[0]
    ) {
      varde = varde.slice(1, -1);
    }
    if (!(nyckel in process.env)) process.env[nyckel] = varde;
  }
}
