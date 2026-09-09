// Tester för källbutiksskanningen (Axels bakläxa 2026-09-09, DryTrek).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { skannaFil, skannaTema, rapport, KALLORD } from '../kallskanning.mjs';

test('hittar källbutikens hero-text i startsidemallen', () => {
  const traffar = skannaFil('templates/index.json', '"heading": "Strumpor som ser ut som mat"');
  assert.equal(traffar.length, 1);
  assert.ok(traffar[0].ord.includes('strumpor'));
});

test('hittar källbutikens supportmejl i produktmallen', () => {
  const traffar = skannaFil('templates/product.json', 'kundsupport@matstrumpor.se så hjälper vi dig');
  assert.equal(traffar.length, 1);
  assert.ok(traffar[0].ord.includes('matstrumpor'));
});

test('hittar källbutikens kollektionshandle', () => {
  const traffar = skannaFil('templates/index.json', '"collection": "shopify://collections/strumporna"');
  assert.equal(traffar.length, 1);
});

test('en ren fil ger inga träffar', () => {
  assert.deepEqual(skannaFil('templates/index.json', '"heading": "Damasker för vandring"'), []);
});

test('skanningen är skiftlägesokänslig', () => {
  assert.equal(skannaFil('a.json', 'MATSTRUMPOR.SE').length, 1);
});

test('skannaTema är rent bara när varje fil är ren', () => {
  assert.equal(skannaTema({ 'a.json': 'Damasker', 'b.json': 'Torra fötter' }).rent, true);
  assert.equal(skannaTema({ 'a.json': 'Damasker', 'b.json': 'sushi-strumpor' }).rent, false);
});

test('rapporten namnger fil och radnummer', () => {
  const r = rapport(skannaTema({ 'templates/index.json': 'rad ett\nsushi-strumpor' }));
  assert.ok(r.includes('templates/index.json:2'));
  assert.ok(r.includes('får INTE lämnas för publicering'));
});

test('KALLORD täcker alla tre kända smittade mallarna', () => {
  for (const ord of ['matstrumpor', 'strumporna', 'sushi-strumpor']) {
    assert.ok(KALLORD.includes(ord), `saknar ${ord}`);
  }
});
