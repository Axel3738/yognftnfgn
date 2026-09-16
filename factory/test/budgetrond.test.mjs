// Tester för nattvaktens kampanjfilter (budgetrond.valjKampanjer) — den rena
// delen. Inga nätanrop.
//
// Bakgrund (mätt 2026-09-11 på tacklebay/fiskespohallare-4-pack): kampanjen
// heter `TACKLEBAY_SE_Spöhållaren | BE-ROAS 1,67 | 2026-09-10` (brandet, som
// FLERPRODUKT.md regel 1 säger) medan annonserna heter `TackleBayRod_…`
// (produkten). Ett filter som bara läste kampanjnamnet fann 0 av 16 kampanjer
// och ronden gjorde ingenting — varje natt, utan fel.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { valjKampanjer } from '../budgetrond.mjs';
import { prefixFor } from '../register.mjs';

const spo = prefixFor({
  nyckel: 'tacklebay/fiskespohallare-4-pack', brand: 'TackleBay',
  annonsprefix: 'TackleBayRod', kampanjprefix: 'TACKLEBAYROD_', enprodukt: false,
});

const kampanjer = [
  { id: '1', name: 'TACKLEBAY_SE_Spöhållaren | BE-ROAS 1,67 | 2026-09-10' },
  { id: '2', name: 'TACKLEBAY_NO_Spöhållaren | BE-ROAS 1,67 | 2026-09-10' },
  { id: '3', name: 'TACKLEBAY_SE_Kalendern | 2026-10-01' },
  { id: '4', name: 'HEIMGUARD_SE_Övervakningskameran | BE-ROAS 2,11 | 2026-09-08' },
  { id: '5', name: 'TACKLEBAYROD_SALES_20260920' },
];

test('en kampanj som bär produktens annonser är butikens även om namnet bär brandet', () => {
  const annonser = [
    { ad_name: 'TackleBayRod_PD_1_H1', campaign_id: '1' },
    { ad_name: 'TackleBayRod_PD_6_1', campaign_id: '1' },
    { ad_name: 'TackleBayRod_NO_PD_1_H1', campaign_id: 2 },   // id som tal ska också gå
  ];
  const v = valjKampanjer(kampanjer, spo, annonser);
  assert.deepEqual(v.butikens.map((k) => k.id), ['1', '2', '5']);
  assert.deepEqual(v.slangda, [kampanjer[3].name, kampanjer[2].name].sort());
  // Det som bara matchade via annonserna rapporteras — inte tyst. Sorterat på namn.
  assert.deepEqual(v.baraViaAnnons, [
    `${kampanjer[1].name} (1 annons med prefixet)`,
    `${kampanjer[0].name} (2 annonser med prefixet)`,
  ]);
});

test('grannproduktens kampanj i samma butik släpps ALDRIG in via brandet', () => {
  // Kalenderns kampanj bär brandet TACKLEBAY men inga TackleBayRod-annonser.
  const v = valjKampanjer(kampanjer, spo, [{ ad_name: 'TackleBayRod_PD_1_H1', campaign_id: '1' }]);
  assert.equal(v.butikens.some((k) => k.id === '3'), false);
});

test('utan annonsrader gäller bara kampanjnamnet — som förut', () => {
  const v = valjKampanjer(kampanjer, spo);
  assert.deepEqual(v.butikens.map((k) => k.id), ['5']);
  assert.deepEqual(v.baraViaAnnons, []);
});

test('rader utan campaign_id och tomma listor kraschar inte', () => {
  const v = valjKampanjer(kampanjer, spo, [{ ad_name: 'TackleBayRod_x' }, { campaign_id: '' }, null]);
  assert.deepEqual(v.butikens.map((k) => k.id), ['5']);
  assert.deepEqual(valjKampanjer([], spo, []).butikens, []);
  assert.deepEqual(valjKampanjer(undefined, spo, []).butikens, []);
});

test('valjKampanjer: kampanjbaser fångar en TOM kampanj (noll annonser) — rapporterad i baraViaBas, skiftlägesokänsligt', () => {
  const kampanjer = [
    { id: '1', name: 'CARASHELL_US_Taköverdrag Husvagn & Husbil 6,5 × 3 m | BE-ROAS 1.63 | 2026-09-16' },
    { id: '2', name: 'CARASHELL_US_Termoskydd Husbil 211 × 171 cm | BE-ROAS 1.61 | 2026-09-16' },
    { id: '3', name: 'CaraShellRoof_SE_test' },
  ];
  const v = valjKampanjer(kampanjer, ['carashellroof_', 'carashellroof'], [], ['carashell_us_taköverdrag husvagn & husbil 6,5 × 3 m']);
  assert.deepEqual(v.butikens.map((k) => k.id), ['1', '3']);
  assert.deepEqual(v.baraViaBas, [kampanjer[0].name]);
  assert.deepEqual(v.slangda, [kampanjer[1].name]);
  assert.deepEqual(valjKampanjer(kampanjer, ['carashellroof_', 'carashellroof']).baraViaBas, []);
});
