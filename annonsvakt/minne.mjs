// annonsvakt/minne.mjs — minnet (annonsvakt/minne.json, committas av rutinen).
//
//   konton    — kontona vakten någon gång läst: id → { namn, valuta, forstSedd }.
//               Försvinner ett ur token:ens räckvidd larmas det (bedomKonton →
//               `konto:<id>:oatkomlig`). Tas bort för hand när Axel avsiktligt
//               tagit bort ett konto.
//   oppna     — pågående problem: nyckel → { typ, niva, rubrik, konto, forst, larmat }.
//   handelser — skickade spend-larm de senaste handelser_dagar dagarna.
//   hjartslag — datumet dagens hjärtslag postades.
//
// Filen skrivs BARA när innehållet ändrats (likaMinne) — annars hade varje
// timkörning gett en commit. Att den skrivs är rutinens signal att committa.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MAPP = dirname(fileURLToPath(import.meta.url));
export const MINNESFIL = join(MAPP, 'minne.json');

export function tomtMinne() {
  return { uppdaterad: null, konton: {}, oppna: {}, handelser: [], hjartslag: null };
}

export function lasMinne(fil = MINNESFIL) {
  if (!existsSync(fil)) return tomtMinne();
  try {
    const d = JSON.parse(readFileSync(fil, 'utf8'));
    return {
      ...tomtMinne(),
      ...d,
      konton: d.konton && typeof d.konton === 'object' ? d.konton : {},
      oppna: d.oppna && typeof d.oppna === 'object' ? d.oppna : {},
      handelser: Array.isArray(d.handelser) ? d.handelser : [],
    };
  } catch {
    return tomtMinne();
  }
}

export function sparaMinne(minne, fil = MINNESFIL, { nu = new Date() } = {}) {
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, `${JSON.stringify({ ...minne, uppdaterad: nu.toISOString() }, null, 1)}\n`);
  return fil;
}

/** Samma innehåll bortsett från tidsstämpeln? */
export function likaMinne(a, b) {
  const s = (m) => JSON.stringify({ ...(m ?? {}), uppdaterad: null });
  return s(a) === s(b);
}
