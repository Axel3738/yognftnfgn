// Värva-en-vän-kortet på tacksidan — logiken, utan Shopify.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { refFor, basFor, lankFor, kortFor, fyll, decimaler } from '../varva/app/extensions/varva-kort/src/logik.js';
import { DATA } from '../varva/app/extensions/varva-kort/src/data.js';
import { kortSprakfiler, SPRAKFIL, KORTSPRAK } from '../varva.mjs';

const data = {
  lankar: { sv: 'https://matstrumpor.se', en: 'https://matstrumpor.com', nb: 'https://matstrumpor.com/nb', 'pt-PT': 'https://matstrumpor.com/pt-pt', 'zh-TW': 'https://matstrumpor.com/zh-tw' },
  valutor: { SEK: { van: 50, kredit: 100 }, GBP: { van: 3.5, kredit: 8 } },
};

test('kortFor: svensk kund får en .se-länk med sitt bekräftelsenummer, aldrig koden', () => {
  const k = kortFor({ data: { ...data, kod: 'VAN-HEMLIG' }, sprak: 'sv', valuta: 'SEK', nummer: 'gr85lghyq' });
  assert.deepEqual(k, { ref: 'GR85LGHYQ', url: 'https://matstrumpor.se/?van=GR85LGHYQ', van: 50, kredit: 100, valuta: 'SEK' });
  assert.ok(!k.url.includes('VAN-HEMLIG'));
});

test('kortFor: utlandet på .com i sitt språk, språk med region matchas', () => {
  assert.equal(kortFor({ data, sprak: 'en-GB', valuta: 'GBP', nummer: 'ABC123' }).url, 'https://matstrumpor.com/?van=ABC123');
  assert.equal(kortFor({ data, sprak: 'pt-PT', valuta: 'GBP', nummer: 'ABC123' }).url, 'https://matstrumpor.com/pt-pt/?van=ABC123');
  assert.equal(kortFor({ data, sprak: 'zh-tw', valuta: 'GBP', nummer: 'ABC123' }).url, 'https://matstrumpor.com/zh-tw/?van=ABC123');
  assert.equal(kortFor({ data, sprak: 'no', valuta: 'GBP', nummer: 'ABC123' }).url, 'https://matstrumpor.com/nb/?van=ABC123');
});

test('kortFor: inget kort utan nummer, i okänd valuta, på okänt språk eller för avbruten order', () => {
  assert.equal(kortFor({ data, sprak: 'sv', valuta: 'SEK', nummer: undefined }), null);
  assert.equal(kortFor({ data, sprak: 'sv', valuta: 'BRL', nummer: 'ABC123' }), null);
  assert.equal(kortFor({ data, sprak: 'ko', valuta: 'SEK', nummer: 'ABC123' }), null);
  assert.equal(kortFor({ data, sprak: 'sv', valuta: 'SEK', nummer: 'ABC123', avbruten: true }), null);
  assert.equal(refFor('<x>'), null);
});

test('fyll + decimaler: platshållarna byts, okända står kvar, halva belopp får två decimaler', () => {
  assert.equal(fyll('Ge en vän {van}, få {kredit}', { van: '50 kr', kredit: '100 kr' }), 'Ge en vän 50 kr, få 100 kr');
  assert.equal(fyll('{okand}', {}), '{okand}');
  assert.equal(decimaler(3.5), 2);
  assert.equal(decimaler(50), 0);
  assert.equal(lankFor('https://matstrumpor.se/', 'A1B2C3'), 'https://matstrumpor.se/?van=A1B2C3');
});

test('data.js: varje språk har en länk och varje valuta ett visat belopp och en kredit', () => {
  assert.match(DATA.kod, /^[A-Z0-9-]+$/);
  assert.ok(Object.keys(DATA.lankar).length >= 14);
  for (const [v, b] of Object.entries(DATA.valutor)) assert.ok(b.van > 0 && b.kredit > 0, v);
  for (const u of Object.values(DATA.lankar)) assert.match(u, /^https:\/\/matstrumpor\.(se|com)(\/[a-z-]+)?$/);
});

test('kortets språkfiler är exakt de som byggs ur sprak.json', () => {
  const vantat = kortSprakfiler(JSON.parse(readFileSync(SPRAKFIL, 'utf8')));
  const filer = readdirSync(KORTSPRAK).filter((f) => f.endsWith('.json')).sort();
  assert.deepEqual(filer, Object.keys(vantat).sort());
  for (const f of filer) assert.deepEqual(JSON.parse(readFileSync(join(KORTSPRAK, f), 'utf8')), vantat[f], f);
});
