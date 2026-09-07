// Tester för Discord-steget: kanalplanen och redigerarplockningen (rena funktioner).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggKanalplan, valjNastaRedigerare } from '../discord.mjs';

test('kanalplanen har Axels sex kanaler och konton är privat', () => {
  const plan = byggKanalplan('Hemvakten');
  const kanaler = plan.kategorier.flatMap((k) => k.kanaler);
  assert.deepEqual(kanaler.map((k) => k.namn), [
    'creative-strategy', 'ads-to-do', 'annons-uppladdning', 'ads', 'konton', 'customer-support',
  ]);
  assert.ok(kanaler.find((k) => k.namn === 'konton').privat, 'konton måste vara privat — lösenord');
  assert.ok(!kanaler.find((k) => k.namn === 'ads').privat);
  assert.equal(plan.servernamn, 'Hemvakten — OPS');
});

test('plockningen tar första redo-raden och märker den tilldelad', () => {
  const lista = '| Namn | Kontakt | Status |\n|---|---|---|\n| Anna B | anna@x.se | tilldelad hemvakten 2026-09-01 |\n| Carl D | carl@x.se | redo |\n| Eva F | eva@x.se | redo |';
  const val = valjNastaRedigerare(lista, 'kamerabutiken', '2026-09-07');
  assert.equal(val.namn, 'Carl D');
  assert.ok(val.nyText.includes('| tilldelad kamerabutiken 2026-09-07 |'));
  assert.ok(val.nyText.includes('| Eva F | eva@x.se | redo |'), 'nästa i kön ska stå kvar som redo');
});

test('tom lista ger null, inte krasch', () => {
  assert.equal(valjNastaRedigerare('| Namn | Kontakt | Status |\n|---|---|---|', 'x', '2026-09-07'), null);
});
