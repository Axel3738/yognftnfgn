// notion-kalla.mjs ska hoppa över OPS-butikernas hubbar per id (register.json),
// aldrig på titel. Testet går på den rena filterfunktionen — inga nätanrop.

import test from 'node:test';
import assert from 'node:assert/strict';
import { filtreraOpsHubbar, ÄR_HUB } from '../notion-kalla.mjs';
import { opsHubbarUrRegister } from '../lib/ops-hubbar.mjs';

const HEIM = '3cd270ab-908c-81bd-aab8-f19ec3e2d260';
const BAVER = '3b0270ab-908c-80a7-8793-fa11d8c0f6e4';

test('filtreraOpsHubbar tar bort OPS-hubben per id och behåller Bäverbutikens', () => {
  const karta = opsHubbarUrRegister({ poster: {
    'hemvakten/overvakningskameran': { notion: { name: 'Surveillance Camera creative hub', database_id: HEIM } },
  } });
  const loggat = [];
  const kvar = filtreraOpsHubbar([
    { id: BAVER.replace(/-/g, ''), titel: 'Boat cover 420D creative hub', kalla: 'products.json' },
    { id: HEIM, titel: 'Surveillance Camera creative hub', kalla: 'sök' },
  ], karta, { logg: (r) => loggat.push(r) });
  assert.deepEqual(kvar.map((h) => h.titel), ['Boat cover 420D creative hub']);
  assert.equal(loggat.length, 1);
  assert.match(loggat[0], /OPS-hubbar undantagna: 1 \(Surveillance Camera creative hub\)/);
});

test('ÄR_HUB rör inte OPS-frågan — titeln avgör bara mallen', () => {
  assert.equal(ÄR_HUB('Surveillance Camera creative hub'), true);
  assert.equal(ÄR_HUB('Creative hub MALL'), false);
});
