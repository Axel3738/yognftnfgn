// Tester för Discord-steget: kanalplanen och redigerarplockningen (rena funktioner).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggKanalplan, valjNastaRedigerare, hittaGuildForBrand } from '../discord.mjs';

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

test('hittaGuildForBrand hittar servern ur botens egen lista — inget id för hand', async () => {
  // Riktiga namn ur botens /users/@me/guilds 2026-09-13.
  const guilds = [
    { id: '1540322130388983921', name: 'Bäverbutiken' },
    { id: '1547541533476257803', name: 'AdventLane' },
    { id: '1547844745412350012', name: 'CatCabin — OPS' },
    { id: '1548401659703468133', name: 'FjordCover — OPS' },
  ];
  assert.equal((await hittaGuildForBrand('FjordCover', guilds)).id, '1548401659703468133');
  // Servern kan heta bara brandet (AdventLane) — planens "— OPS" är inte ett krav.
  assert.equal((await hittaGuildForBrand('AdventLane', guilds)).id, '1547541533476257803');
  // Tankstreck, bindestreck och versaler ska inte spela roll.
  assert.equal((await hittaGuildForBrand('catcabin', guilds)).id, '1547844745412350012');
  assert.equal(await hittaGuildForBrand('Okänt', guilds), null);
  assert.equal(await hittaGuildForBrand('', guilds), null);
});
