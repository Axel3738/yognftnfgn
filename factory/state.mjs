// Körstate per butik+produkt: vilka steg som är klara och vad de gav.
//
// Finns för --resume: en körning som avbryts halvvägs ska kunna tas vidare
// utan att göra om det som redan lyckats. Filen innehåller bara id:n och
// statusar — aldrig tokens, aldrig något ur miljön.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const STATE_MAPP = join(dirname(fileURLToPath(import.meta.url)), 'state');

// Nycklar som aldrig får hamna i statefilen, hur de än råkar dyka upp.
const HEMLIGA = /token|secret|key|password|authorization/i;

export function statefil(butiksId, produktId) {
  return join(STATE_MAPP, `${butiksId}--${produktId}.json`);
}

export function lasState(butiksId, produktId) {
  const fil = statefil(butiksId, produktId);
  if (!existsSync(fil)) return { butik: butiksId, produkt: produktId, steg: {} };
  try {
    const data = JSON.parse(readFileSync(fil, 'utf8'));
    return { butik: butiksId, produkt: produktId, steg: {}, ...data };
  } catch {
    // Trasig statefil ska inte stoppa en körning — den byggs om.
    return { butik: butiksId, produkt: produktId, steg: {} };
  }
}

// Plockar bort allt som ser ut som en hemlighet innan något skrivs till disk.
export function rensaHemligheter(varde) {
  if (Array.isArray(varde)) return varde.map(rensaHemligheter);
  if (varde && typeof varde === 'object') {
    const ut = {};
    for (const [nyckel, v] of Object.entries(varde)) {
      if (HEMLIGA.test(nyckel)) continue;
      ut[nyckel] = rensaHemligheter(v);
    }
    return ut;
  }
  return varde;
}

export function skrivState(state) {
  mkdirSync(STATE_MAPP, { recursive: true });
  const rent = rensaHemligheter({ ...state, uppdaterad: new Date().toISOString() });
  writeFileSync(statefil(state.butik, state.produkt), `${JSON.stringify(rent, null, 2)}\n`);
  return rent;
}

export const arKlart = (state, stegId) => state?.steg?.[stegId]?.klar === true;

export function markeraKlart(state, stegId, resultat = {}) {
  state.steg[stegId] = { klar: true, ...rensaHemligheter(resultat) };
  return state;
}
