// Spärren mot budgetfält på annonsnivå. Incident 2026-09-12 (nattvakten,
// AdventLane): pausa() läste tillbaka med budgetfälten, Meta svarade 400
// "(#100) Tried accessing nonexisting field (daily_budget)" på annonsen, och
// pausen genomfördes aldrig fast loggen sa "misslyckad". Statusläsningen ska
// bara fråga efter fält som finns på kampanj, adset OCH annons.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STATUSFÄLT } from '../meta-lib.mjs';

test('STATUSFÄLT bär inga budgetfält — de finns inte på en annons', () => {
  const falt = STATUSFÄLT.split(',');
  assert.ok(falt.includes('status') && falt.includes('effective_status'), 'status och effective_status måste läsas tillbaka');
  assert.ok(!falt.includes('daily_budget') && !falt.includes('lifetime_budget'), 'budgetfält ger 400 på ad-nivå');
});

test('pausa() läser tillbaka via lasStatus, aldrig via lasBudget', () => {
  const kod = readFileSync(new URL('../meta-lib.mjs', import.meta.url), 'utf8');
  const start = kod.indexOf('export async function pausa(');
  const slut = kod.indexOf('\n}', start);
  const kropp = kod.slice(start, slut);
  assert.ok(kropp.includes('lasStatus('), 'pausa ska använda lasStatus');
  assert.ok(!kropp.includes('lasBudget('), 'pausa får inte använda lasBudget');
});

test('valjAdsetForKoncept: exakt namn, annars kampanjens egen konvention (DRYTREK_SE_PD), ACTIVE först', async () => {
  const { valjAdsetForKoncept, nyttAdsetnamn } = await import('../meta-lib.mjs');
  const drytrek = [
    { id: '1', name: 'DRYTREK_SE_SP', status: 'ACTIVE' }, { id: '2', name: 'DRYTREK_SE_PD', status: 'ACTIVE' },
    { id: '3', name: 'DRYTREK_SE_G', status: 'PAUSED' }, { id: '4', name: 'DRYTREK_SE_CS', status: 'ACTIVE' },
  ];
  assert.equal(valjAdsetForKoncept(drytrek, 'DRYTREK_SE_Damasker Vandring - PD', 'PD')?.id, '2');
  assert.equal(valjAdsetForKoncept(drytrek, 'DRYTREK_SE_Damasker Vandring - G', 'G')?.id, '3', 'PAUSED adset hittas också — aktiveras aldrig här');
  assert.equal(valjAdsetForKoncept(drytrek, 'DRYTREK_SE_Damasker Vandring - FO', 'FO'), null, 'nytt koncept → null');
  assert.equal(valjAdsetForKoncept(drytrek, 'DRYTREK_SE_Damasker Vandring - PD', null), null, 'utan koncept bara exakt namn');
  const heimguard = [{ id: '9', name: 'HEIMGUARD_SE_Övervakningskameran - SP', status: 'ACTIVE' }];
  assert.equal(valjAdsetForKoncept(heimguard, 'heimguard_se_övervakningskameran - sp', 'SP')?.id, '9');
  assert.equal(valjAdsetForKoncept(heimguard, 'X - SP', 'SP')?.id, '9', 'suffix " - SP" räcker');
  assert.equal(valjAdsetForKoncept(heimguard, 'X - P', 'P'), null, 'koden måste vara hela suffixet');
  // Nytt adset följer konventionen bara när ALLA befintliga följer samma stam.
  assert.equal(nyttAdsetnamn(drytrek, 'DRYTREK_SE_Damasker Vandring - FO', 'FO'), 'DRYTREK_SE_FO');
  assert.equal(nyttAdsetnamn(heimguard, 'HEIMGUARD_SE_Övervakningskameran - BOF', 'BOF'), 'HEIMGUARD_SE_Övervakningskameran - BOF');
  assert.equal(nyttAdsetnamn([], 'X - FO', 'FO'), 'X - FO');
});
