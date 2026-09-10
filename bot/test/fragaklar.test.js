import test from 'node:test';
import assert from 'node:assert/strict';
import {
  arFraga, arFragaAnalys, vardAttKlassa, fragaKlarSvar, SVAR, arFragaKlarServer, fragaKlarServrar,
} from '../fragaklar.js';

test('frågetecken räknas alltid som fråga', () => {
  assert.equal(arFraga('får jag fråga en sak?'), true);
  assert.equal(arFraga('nån som vet var man fiskar gädda?'), true);
  assert.equal(arFraga('? '), true);
});

test('frågeord först räknas, utan frågetecken', () => {
  assert.equal(arFraga('vet nån var bryggan är'), true);
  assert.equal(arFraga('kan man fiska där i morgon'), true);
  assert.equal(arFraga('anyone going out tomorrow'), true);
});

test('vanliga påståenden lämnas i fred', () => {
  assert.equal(arFraga('vi drar 06:00'), false);
  assert.equal(arFraga('sjukt bra dag idag'), false);
  assert.equal(arFraga('kan'), false);           // för kort för ett frågeord ensamt
  assert.equal(arFraga(''), false);
});

test('frågor utan frågetecken går till klassaren', async () => {
  let anrop = 0;
  const klassa = async () => { anrop += 1; return true; };
  assert.equal(await arFragaAnalys('ni har väl inga tips på bete till gädda', klassa), true); // inget frågeord först
  assert.equal(anrop, 1);
  // Säkra frågor kostar inget anrop.
  assert.equal(await arFragaAnalys('var ligger bryggan?', klassa), true);
  assert.equal(anrop, 1);
});

test('klassaren får nej-svar, fel och korta meddelanden i fred', async () => {
  assert.equal(await arFragaAnalys('vi drar 06:00', async () => false), false);
  assert.equal(await arFragaAnalys('vi drar 06:00 imorgon', async () => { throw new Error('nere'); }), false);
  assert.equal(await arFragaAnalys('ok', async () => true), false);         // för kort
  assert.equal(await arFragaAnalys('https://x.se/a', async () => true), false); // bara länk
  assert.equal(await arFragaAnalys('vi drar 06:00 imorgon', null), false);  // ingen klassare
  assert.equal(vardAttKlassa('sjukt bra dag idag'), true);
});

test('svaret börjar alltid med Fråga Claude', () => {
  for (const s of SVAR) assert.match(s, /^Fråga Claude/);
  assert.equal(fragaKlarSvar(() => 0), SVAR[0]);
  assert.equal(fragaKlarSvar(() => 0.999), SVAR[SVAR.length - 1]);
});

test('bara de utpekade servrarna, default Snart nappar de', () => {
  assert.deepEqual(fragaKlarServrar({}), ['1432314381114282118']);
  assert.equal(arFragaKlarServer('1432314381114282118'), true);
  assert.equal(arFragaKlarServer('1540322130388983921'), false); // Bäverbutiken
  assert.equal(arFragaKlarServer(null), false);                  // DM
  assert.equal(arFragaKlarServer('999', fragaKlarServrar({ DISCORD_FRAGA_KLAR_SERVRAR: '999' })), true);
});
