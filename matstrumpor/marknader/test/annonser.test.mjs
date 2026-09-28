// Tester för annonser/bygg.mjs — spärrarna före aktivering (ren logik, inget nät).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { farAktiveras, lankOk } from '../annonser/bygg.mjs';

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
