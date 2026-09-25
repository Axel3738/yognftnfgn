// kommentarer/lage.mjs — minnet: vilka kommentarer som redan rapporterats, och
// loggen som trenden räknas ur.
//
//   kommentarer/lage.json            senaste hämtning + sedda kommentars-id (21 dagar)
//   kommentarer/logg/<ÅÅÅÅ-MM>.jsonl  en rad per kommentar, maskerad, klassad
//
// Båda committas: utan dem vet nästa körning inte vad som är nytt, och
// "14 dagar" går inte att räkna. Loggen bär ingen avsändare (Meta ger den inte),
// och taggade namn är redan bytta mot "@…" (maska.mjs). ~70 kommentarer/dygn
// × ~450 byte ≈ 30 kB per dygn (mätt 2026-09-24) — ingen rådata från Meta sparas.

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MAPP = dirname(fileURLToPath(import.meta.url));

export function lasLage(mapp = MAPP) {
  const fil = join(mapp, 'lage.json');
  if (!existsSync(fil)) return { senast_hamtat: null, sedda: {}, korningar: [] };
  const j = JSON.parse(readFileSync(fil, 'utf8'));
  return { senast_hamtat: j.senast_hamtat ?? null, sedda: j.sedda ?? {}, korningar: j.korningar ?? [] };
}

export function sparaLage(lage, mapp = MAPP) {
  // Sorterade nycklar ⇒ en diff per körning som går att läsa.
  const sedda = Object.fromEntries(Object.entries(lage.sedda ?? {}).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(join(mapp, 'lage.json'), `${JSON.stringify({ ...lage, sedda }, null, 1)}\n`);
}

/** Släpp id:n äldre än `dagar` ur minnet. Ren. */
export function rensaSedda(sedda, idag, dagar = 21) {
  const grans = new Date(Date.parse(`${idag}T00:00:00Z`) - dagar * 86_400_000).toISOString().slice(0, 10);
  return Object.fromEntries(Object.entries(sedda ?? {}).filter(([, d]) => d >= grans));
}

/**
 * Sekunden att hämta från. Första körningen: `forstaTimmar` bakåt. Annars förra
 * hämtningen minus en överlapp — kommentarer som Meta visar sent kommer med,
 * och dubbletterna tas bort på id. Ren.
 */
export function sedanUnix({ senast_hamtat }, nuMs, { forstaTimmar = 72, overlappTimmar = 3 } = {}) {
  if (!senast_hamtat) return Math.floor((nuMs - forstaTimmar * 3_600_000) / 1000);
  return Math.floor((Date.parse(senast_hamtat) - overlappTimmar * 3_600_000) / 1000);
}

export const loggfil = (manad, mapp = MAPP) => join(mapp, 'logg', `${manad}.jsonl`);

export function skrivLogg(rader, mapp = MAPP) {
  const perManad = new Map();
  for (const r of rader) {
    const m = String(r.tid).slice(0, 7);
    if (!perManad.has(m)) perManad.set(m, []);
    perManad.get(m).push(JSON.stringify(r));
  }
  for (const [m, rr] of perManad) {
    mkdirSync(join(mapp, 'logg'), { recursive: true });
    appendFileSync(loggfil(m, mapp), `${rr.join('\n')}\n`);
  }
}

/** Loggens rader skrivna (tid) från och med `sedanDatum`. Senaste raden per id vinner. */
export function lasLogg(sedanDatum, mapp = MAPP) {
  const dir = join(mapp, 'logg');
  if (!existsSync(dir)) return [];
  const manader = readdirSync(dir).filter((f) => /^\d{4}-\d{2}\.jsonl$/.test(f) && f.slice(0, 7) >= sedanDatum.slice(0, 7)).sort();
  const perId = new Map();
  for (const f of manader) {
    for (const rad of readFileSync(join(dir, f), 'utf8').split('\n')) {
      if (!rad.trim()) continue;
      try {
        const r = JSON.parse(rad);
        if (String(r.tid).slice(0, 10) >= sedanDatum) perId.set(r.id, r);
      } catch { /* en trasig rad stoppar inte trenden */ }
    }
  }
  return [...perId.values()];
}
