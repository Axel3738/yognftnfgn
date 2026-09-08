// Tester för factorys YAML-läsare och produktvalidering.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from '../yaml.mjs';
import { validera } from '../validera.mjs';
import { dummy } from './hjalp.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DUMMY = join(ROT, 'produkter', 'dummyprodukten.yaml');

test('yaml: objekt, listor, tal och citerade strängar', () => {
  const data = lasYaml(`
# kommentar
produkt:
  namn: "Nackmagneten"
  id: nackmagneten
ekonomi:
  pris: 399
  aktiv: true
problem:
  - "Stel nacke"
  - Huvudvärk
reviews:
  - namn: "Eva"
    betyg: 5
  - namn: "Mats"
    betyg: 4
leverantor:
  url: "https://exempel.se/produkt#topp"
`);
  assert.equal(data.produkt.namn, 'Nackmagneten');
  assert.equal(data.produkt.id, 'nackmagneten');
  assert.equal(data.ekonomi.pris, 399);
  assert.equal(data.ekonomi.aktiv, true);
  assert.deepEqual(data.problem, ['Stel nacke', 'Huvudvärk']);
  assert.deepEqual(data.reviews, [
    { namn: 'Eva', betyg: 5 },
    { namn: 'Mats', betyg: 4 },
  ]);
  assert.equal(data.leverantor.url, 'https://exempel.se/produkt#topp');
});

test('yaml: kommentar efter värde strippas, tom nyckel blir null', () => {
  const data = lasYaml(`
pris: 399  # kronor
bundle:
lista:   # bara en kommentar efter kolon
  - a
`);
  assert.equal(data.pris, 399);
  assert.equal(data.bundle, null);
  assert.deepEqual(data.lista, ['a']);
});

test('dummyprodukten passerar utan kritiska fel när butikskonfigen vävts in', () => {
  const { fel, nyckeltal } = validera(dummy());
  assert.deepEqual(fel, []);
  // Nyckeltalen räknas MED butikens moms sedan 2026-09-08 (factory/ekonomi.mjs).
  // Tidigare stod här 1,28 / 312 — marginalen rakt på priset, utan moms. Det
  // talet gäller bara en butik som säljer utan moms (Bäverbutiken); testbutiken
  // har moms_i_pris true, och då är den gamla räkningen 25 % för generös.
  assert.equal(nyckeltal.breakEvenRoas, 1.72); // 399 / (399/1,25 − 87)
  assert.equal(nyckeltal.breakEvenCpa, 232);
  assert.equal(nyckeltal.targetRoas, 2.62);
  assert.equal(nyckeltal.targetCpa, 152);
});

test('dummyprodukten varnar om tomma meta-fält', () => {
  const { varningar } = validera(dummy());
  assert.ok(varningar.some((v) => v.includes('meta.pixel_id')));
});

const dummyData = () => dummy();

test('saknat pris ger kritiskt fel', () => {
  const data = dummyData();
  delete data.ekonomi.pris;
  const { fel } = validera(data);
  assert.ok(fel.some((f) => f.includes('ekonomi.pris')));
});

test('pris under inköpskostnad ger kritiskt fel', () => {
  const data = dummyData();
  data.ekonomi.pris = 50;
  const { fel } = validera(data);
  assert.ok(fel.some((f) => f.includes('högre än inköpskostnaden')));
});

test('jämförpris under priset ger kritiskt fel', () => {
  const data = dummyData();
  data.ekonomi.jamforpris = 299;
  const { fel } = validera(data);
  assert.ok(fel.some((f) => f.includes('jamforpris')));
});

test('okänd valuta ger kritiskt fel', () => {
  const data = dummyData();
  data.ekonomi.valuta = 'BTC';
  const { fel } = validera(data);
  assert.ok(fel.some((f) => f.includes('okänd')));
});

test('utan media ger kritiskt fel', () => {
  const data = dummyData();
  data.media = { bilder: [], videor: [] };
  const { fel } = validera(data);
  assert.ok(fel.some((f) => f.includes('media')));
});

test('variant utan namn ger kritiskt fel', () => {
  const data = dummyData();
  data.varianter.push({ sku: 'X' });
  const { fel } = validera(data);
  assert.ok(fel.some((f) => f.includes('varianter[2]')));
});

test('tom fil ger många kritiska fel och stoppar', () => {
  const { fel, nyckeltal } = validera(lasYaml(''));
  assert.ok(fel.length >= 8);
  assert.equal(nyckeltal, null);
});
