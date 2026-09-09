// Tester för källbutiksskanningen (Axels bakläxa 2026-09-09, DryTrek).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { skannaFil, skannaTema, rapport, KALLORD, avbrandaSektionsgrupp, skannaSektionsgrupp } from '../kallskanning.mjs';

test('hittar källbutikens hero-text i startsidemallen', () => {
  const traffar = skannaFil('templates/index.json', '"heading": "Strumpor som ser ut som mat"');
  assert.equal(traffar.length, 1);
  assert.ok(traffar[0].ord.includes('strumpor som ser ut som mat'));
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

test('hittar källbutikens hela hero-citat', () => {
  assert.equal(skannaFil('a.json', '"heading": "Strumpor man aldrig blandar ihop"').length, 1);
});

test('en ren fil ger inga träffar', () => {
  assert.deepEqual(skannaFil('templates/index.json', '"heading": "Damasker för vandring"'), []);
});

test('vanliga produktord larmar INTE — "torr strumpa" är giltig nytta för damasker', () => {
  assert.deepEqual(skannaFil('templates/index.json', '"heading": "Kilometer fyra. Fortfarande torr strumpa."'), []);
  assert.deepEqual(skannaFil('a.json', 'Håller strumporna torra i snö och väta'), []);
});

test('skanningen är skiftlägesokänslig', () => {
  assert.equal(skannaFil('a.json', 'MATSTRUMPOR.SE').length, 1);
});

test('skannaTema är rent bara när varje fil är ren', () => {
  assert.equal(skannaTema({ 'a.json': 'Damasker', 'b.json': 'Torra fötter' }).rent, true);
  assert.equal(skannaTema({ 'a.json': 'Damasker', 'b.json': 'sushi-strumpor' }).rent, false);
  assert.equal(skannaTema({ 'a.json': 'torra strumpor i väta' }).rent, true);
});

test('rapporten namnger fil och radnummer', () => {
  const r = rapport(skannaTema({ 'templates/index.json': 'rad ett\nsushi-strumpor' }));
  assert.ok(r.includes('templates/index.json:2'));
  assert.ok(r.includes('får INTE lämnas för publicering'));
});

test('KALLORD täcker alla tre kända smittade mallarna', () => {
  for (const ord of ['matstrumpor', 'collections/strumporna', 'sushi-strumpor']) {
    assert.ok(KALLORD.includes(ord), `saknar ${ord}`);
  }
});

// --- Källsektionerna (Axels bakläxa 2026-09-09: skrapkortet dök upp igen) ---

test('avbrandaSektionsgrupp tar bort skrapkort, cookieruta och nyhetsbrev', () => {
  const grupp = {
    sections: {
      footer: { type: 'footer' },
      ms_cookies: { type: 'ms-cookies' },
      ms_skrapkort: { type: 'ms-skrapkort' },
    },
    order: ['footer', 'ms_cookies', 'ms_skrapkort'],
  };
  const { json, borttagna } = avbrandaSektionsgrupp(grupp);
  assert.deepEqual(Object.keys(json.sections), ['footer']);
  assert.deepEqual(json.order, ['footer']);
  assert.equal(borttagna.length, 2);
});

test('avbrandaSektionsgrupp rör inte butikens egna sektioner', () => {
  const grupp = { sections: { footer: { type: 'footer' }, opf_usp: { type: 'opf-usp' } }, order: ['footer', 'opf_usp'] };
  const { borttagna } = avbrandaSektionsgrupp(grupp);
  assert.equal(borttagna.length, 0);
});

test('skannaSektionsgrupp hittar källsektioner utan att ändra', () => {
  const traffar = skannaSektionsgrupp('sections/footer-group.json', {
    sections: { ms_skrapkort: { type: 'ms-skrapkort' } },
  });
  assert.equal(traffar.length, 1);
  assert.ok(traffar[0].text.includes('ms-skrapkort'));
});
