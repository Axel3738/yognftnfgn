import test from 'node:test';
import assert from 'node:assert/strict';
import { ärTilltalad, utanTilltal } from '../tilltal.js';

const BOT = '1543628123289952277';

test('vanligt meddelande i servern är inte riktat till boten', () => {
  assert.equal(ärTilltalad({ innehåll: 'kolla roasen på kameran', botId: BOT }), false);
  assert.equal(ärTilltalad({ innehåll: 'ok', botId: BOT }), false);
  assert.equal(ärTilltalad({ innehåll: '', botId: BOT }), false);
});

test('tagg i texten, i båda Discord-formerna', () => {
  assert.equal(ärTilltalad({ innehåll: `<@${BOT}> hur går det`, botId: BOT }), true);
  assert.equal(ärTilltalad({ innehåll: `hej <@!${BOT}>`, botId: BOT }), true);
});

test('tagg via mentions-listan, även utan text-matchning', () => {
  assert.equal(ärTilltalad({ innehåll: 'hej', botId: BOT, nämnda: [BOT] }), true);
  assert.equal(ärTilltalad({ innehåll: 'hej', botId: BOT, nämnda: ['999'] }), false);
});

test('svar på botens eget inlägg räknas som tilltal', () => {
  assert.equal(ärTilltalad({ innehåll: 'och sen?', botId: BOT, svarPåBot: true }), true);
});

test('DM räknas alltid', () => {
  assert.equal(ärTilltalad({ innehåll: 'hej', botId: BOT, dm: true }), true);
});

test('@everyone, @here och rolltaggar väcker inte boten', () => {
  assert.equal(ärTilltalad({ innehåll: '@everyone möte 15:00', botId: BOT }), false);
  assert.equal(ärTilltalad({ innehåll: '<@&1234> kolla detta', botId: BOT }), false);
});

test('utanTilltal tar bort taggen och städar blanksteg', () => {
  assert.equal(utanTilltal(`<@${BOT}>  hur går det?`, BOT), 'hur går det?');
  assert.equal(utanTilltal(`hej <@!${BOT}> du`, BOT), 'hej du');
  assert.equal(utanTilltal(`<@${BOT}>`, BOT), '');
  assert.equal(utanTilltal('ingen tagg alls', BOT), 'ingen tagg alls');
});
