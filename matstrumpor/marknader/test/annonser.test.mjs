// Tester för annonser/bygg.mjs — spärrarna före aktivering (ren logik, inget nät).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { farAktiveras, lankOk, slaIhopLage } from '../annonser/bygg.mjs';

test('slaIhopLage: en körning för en marknad byter bara ut den raden, resten står kvar i marknadsordning', () => {
  const forra = [{ kod: 'NO', annonser: [] }, { kod: 'DK', annonser: [] }, { kod: 'FI', annonser: [] }];
  const nya = [{ kod: 'NO', annonser: [{ id: '1' }] }];
  const ut = slaIhopLage(forra, nya, ['NO', 'DK', 'FI']);
  assert.deepEqual(ut.map((k) => k.kod), ['NO', 'DK', 'FI']);
  assert.equal(ut[0].annonser.length, 1);
  assert.deepEqual(slaIhopLage([], [{ kod: 'FI' }, { kod: 'NO' }], ['NO', 'FI']).map((k) => k.kod), ['NO', 'FI']);
});

const NO = { kampanj: 'MATSTRUMP_NO_SALES', geo: ['NO'], locale: 'nb', budget_beslut: "Axel 2026-09-27: '1000kr per dag'" };
const WW = { kampanj: 'MATSTRUMP_WW_SALES', geo: ['NO', 'DK', 'US'], locale: 'en', budget_beslut: 'EJ GIVEN — platshållare' };

test('lankOk: enlandskampanj kräver locale OCH land, flerlandskampanj bara locale', () => {
  assert.equal(lankOk(NO, 'https://matstrumpor.se/nb/products/sushi-strumpor?country=NO'), true);
  assert.equal(lankOk(NO, 'https://matstrumpor.se/nb/products/sushi-strumpor'), false);
  assert.equal(lankOk(NO, 'https://matstrumpor.se/products/sushi-strumpor?country=NO'), false);
  assert.equal(lankOk(WW, 'https://matstrumpor.se/en/products/sushi-strumpor'), true);
  assert.equal(lankOk(WW, 'https://matstrumpor.se/nb/products/sushi-strumpor'), false);
  assert.equal(lankOk(NO, ''), false);
});

test('farAktiveras: platshållarbudget, tomt adset eller fel länk stoppar', () => {
  const ok = [{ name: 'a', lank: 'https://matstrumpor.se/nb/products/sushi-strumpor?country=NO' }];
  assert.equal(farAktiveras(NO, ok).ok, true);
  assert.match(farAktiveras(WW, [{ name: 'a', lank: 'https://matstrumpor.se/en/products/sushi-strumpor' }]).skal, /platshållare/);
  assert.match(farAktiveras(NO, []).skal, /inga annonser/);
  assert.match(farAktiveras(NO, [{ name: 'b', lank: 'https://matstrumpor.se/products/sushi-strumpor' }]).skal, /länkar fel/);
});

test('farAktiveras: en given budget med ⛔ "tills Axel granskat" stoppar ändå — och det gör marknader.json i dag', async () => {
  const ok = [{ name: 'a', lank: 'https://matstrumpor.se/nb/products/sushi-strumpor?country=NO' }];
  const vantar = { ...NO, budget_beslut: "Axel 2026-09-27: '1000kr per dag'. ⛔ Förblir PAUSED tills Axel granskat annonserna" };
  assert.match(farAktiveras(vantar, ok).skal, /Axels granskning/);
  // Facit är filen: varje kampanj som ännu inte granskats ska stoppas av spärren.
  const { readFileSync } = await import('node:fs');
  const M = JSON.parse(readFileSync(new URL('../annonser/marknader.json', import.meta.url), 'utf8'));
  for (const [kod, k] of Object.entries(M.kampanjer)) {
    const lank = [{ name: kod, lank: k.lank }];
    assert.equal(farAktiveras(k, lank).ok, false, `${kod} skulle kunna aktiveras: ${k.budget_beslut}`);
  }
});
