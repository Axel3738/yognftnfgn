// Spärren mot listicle-kampanjer i leveransrundans kampanjuppslag.
//
// ⚠️ Axels order 2026-09-22: "Ladda aldrig upp någonting i listicle-kampanjerna
// utan min tillsägelse." Bakgrunden, mätt samma dag i MagiBorsten: Taköverdragets
// listicle-kampanj hade 64 annonser med prefixet `Takoverdrag_` mot huvudkampanjens
// 34. prefixKarta() väljer kampanjen med FLEST annonser, så rundan valde
// listicle-kampanjen — och försprånget växte för varje leverans den lade dit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prefixKarta, arListiclekampanj, LISTICLE_MONSTER } from '../lib/kampanjval.mjs';

const annons = (namn, kid, knamn, status = 'ACTIVE') =>
  ({ name: namn, campaign: { id: kid, name: knamn, status } });

test('listicle-kampanjen vinner ALDRIG, ens med flest annonser', () => {
  const annonser = [
    ...Array.from({ length: 64 }, (_, i) => annons(`Takoverdrag_PD_${i}_1`, 'L', 'Taköverdraget LISTICLE LAGERRENSNING')),
    ...Array.from({ length: 34 }, (_, i) => annons(`Takoverdrag_CS_${i}_1`, 'H', 'Taköverdraget för Husvagn 6,5 × 3 m | BE ROAS 1.63')),
  ];
  const karta = prefixKarta(annonser);
  assert.equal(karta.takoverdrag.id, 'H', 'huvudkampanjen ska vinna trots färre annonser');
  assert.equal(karta._uteslutna.takoverdrag.L.antal, 64, 'uteslutningen ska räknas och kunna skrivas ut');
});

test('en produkt som BARA har en listicle-kampanj får ingen kampanj alls', () => {
  // Hellre en rapporterad lucka än en leverans i fel kampanj.
  const karta = prefixKarta([annons('Nyprodukt_PD_1_1', 'L', 'Nyprodukt LISTICLE LAGERRENSNING')]);
  assert.equal(karta.nyprodukt, undefined);
  assert.equal(karta._uteslutna.nyprodukt.L.antal, 1);
});

test('mönstret fångar alla fyra landningssidekoncepten, men inte vanliga namn', () => {
  for (const n of ['Taköverdraget LISTICLE LAGERRENSNING', 'Motorhöljet Lagerrensingsrea',
    'X vi-testade', 'Y ANLEDNINGAR', 'Termoskyddet LISTICLE LAGERRENSNING']) {
    assert.ok(arListiclekampanj(n), `skulle uteslutits: ${n}`);
  }
  for (const n of ['Taköverdraget för Husvagn 6,5 × 3 m | BE ROAS 1.63 | Launch 2026-09-09',
    'IBC-Tanköverdraget | BE ROAS 1.51', 'Takovertrekk Campingvogn NO', 'Sätesöverdragaren']) {
    assert.ok(!arListiclekampanj(n), `skulle INTE uteslutits: ${n}`);
  }
  assert.ok(!arListiclekampanj(null) && !arListiclekampanj(undefined));
});

test('oavgjort mellan två riktiga kampanjer bryts fortfarande av ACTIVE', () => {
  const karta = prefixKarta([
    annons('P_CS_1_1', 'A', 'P gammal', 'PAUSED'),
    annons('P_CS_2_1', 'B', 'P ny', 'ACTIVE'),
  ]);
  assert.equal(karta.p.id, 'B');
});
