import test from 'node:test';
import assert from 'node:assert/strict';
import { arOppen, oppnaServrar, HEMSERVER } from '../sluten.js';

test('hemservern är öppen, allt annat slutet som default', () => {
  const oppna = oppnaServrar({});
  assert.deepEqual(oppna, [HEMSERVER]);
  assert.equal(arOppen({ guildId: HEMSERVER, oppna }), true);
  assert.equal(arOppen({ guildId: '1432314381114282118', oppna }), false); // Snart nappar de
  assert.equal(arOppen({ guildId: '1546434793317859359', oppna }), false); // Grillkliniken
});

test('DM är alltid sluten, även om listan är tom eller bred', () => {
  assert.equal(arOppen({ guildId: null, oppna: [HEMSERVER] }), false);
  assert.equal(arOppen({ guildId: undefined, oppna: ['1', '2', '3'] }), false);
});

test('DISCORD_OPPNA_SERVRAR styr listan och tål blanksteg', () => {
  const oppna = oppnaServrar({ DISCORD_OPPNA_SERVRAR: ' 111 , 222 ' });
  assert.deepEqual(oppna, ['111', '222']);
  assert.equal(arOppen({ guildId: 222, oppna }), true);
  assert.equal(arOppen({ guildId: HEMSERVER, oppna }), false); // hemma måste stå med om listan sätts
});
