// Tester för den minimala YAML-läsaren. Ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lasYaml } from '../yaml.mjs';
import { byggStartsida } from '../startsida.mjs';

test('citerad listrad med kolon är en sträng, inte ett objekt', () => {
  // Regressionen från 2026-09-09: LISTOBJEKT-regexens `[^:]+`-alternativ vann
  // över den citerade strängen, raden blev ett objekt och renderades som
  // "[object Object]" på TackleBays startsida.
  const d = lasYaml(['text:', '  - "Vi säljer det som löser något konkret: spön som inte trasslar."'].join('\n'));
  assert.equal(typeof d.text[0], 'string');
  assert.equal(d.text[0], 'Vi säljer det som löser något konkret: spön som inte trasslar.');
});

test('kolon i benefits och features överlever läsningen', () => {
  const d = lasYaml(
    ['benefits:', '  - "Ordning: varje spö får sin plats."', 'features:', '  - "Mått: 4 hållare"'].join('\n')
  );
  assert.equal(d.benefits[0], 'Ordning: varje spö får sin plats.');
  assert.equal(d.features[0], 'Mått: 4 hållare');
});

test('riktiga listobjekt läses fortfarande som objekt', () => {
  const d = lasYaml(['faq:', '  - fraga: "Passar den?"', '    svar: "Ja."'].join('\n'));
  assert.deepEqual(d.faq, [{ fraga: 'Passar den?', svar: 'Ja.' }]);
});

test('ociterad listrad med kolon läses som objekt, som förr', () => {
  const d = lasYaml(['rader:', '  - nyckel: värde'].join('\n'));
  assert.deepEqual(d.rader, [{ nyckel: 'värde' }]);
});

test('startsidans stycken blir riktiga p-taggar, aldrig [object Object]', () => {
  const butik = {
    butik: { brand: 'TestBay', kollektion: { handle: 'sortimentet' } },
    startsida: { berattelse: { rubrik: 'R', text: ['Ett: med kolon.', 'Två.'] } },
  };
  const produkter = [
    { produkt: { id: 'a', namn: 'A' }, reviews: [] },
    { produkt: { id: 'b', namn: 'B' }, reviews: [] },
  ];
  const json = JSON.parse(byggStartsida(butik, produkter, 'sortimentet'));
  const text = json.sections.berattelse.blocks.t.settings.text;
  assert.ok(!text.includes('[object Object]'), text);
  assert.equal(text, '<p>Ett: med kolon.</p><p>Två.</p>');
});

test('flerproduktsbutik får kollektionen på startsidan, enproduktsbutik en produkt', () => {
  const butik = { butik: { brand: 'TestBay' }, startsida: {} };
  const tva = [
    { produkt: { id: 'a', namn: 'A' }, reviews: [] },
    { produkt: { id: 'b', namn: 'B' }, reviews: [] },
  ];
  const en = [{ produkt: { id: 'a', namn: 'A' }, reviews: [] }];
  const flera = JSON.parse(byggStartsida(butik, tva, 'sortimentet'));
  assert.ok(flera.order.includes('sortiment'));
  assert.equal(flera.sections.sortiment.settings.collection, 'sortimentet');
  const ensam = JSON.parse(byggStartsida(butik, en, 'sortimentet'));
  assert.ok(ensam.order.includes('produkt'));
  assert.equal(ensam.sections.produkt.settings.product, 'a');
});

test('omdömessektionen döljer sig när riktiga recensioner saknas', () => {
  const butik = { butik: { brand: 'TestBay' }, startsida: {} };
  const utan = [{ produkt: { id: 'a', namn: 'A' }, reviews: [] }];
  const med = [
    { produkt: { id: 'a', namn: 'A' }, reviews: [{ namn: 'Daniel', betyg: 5, text: 'Stabil.' }] },
  ];
  assert.equal(JSON.parse(byggStartsida(butik, utan, 's')).sections.omdomen.settings.visible, false);
  assert.equal(JSON.parse(byggStartsida(butik, med, 's')).sections.omdomen.settings.visible, true);
});
