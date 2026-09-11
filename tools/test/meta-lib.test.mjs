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
