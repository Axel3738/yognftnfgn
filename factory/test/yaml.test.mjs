// Tester för den minimala YAML-läsaren. Ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lasYaml } from '../yaml.mjs';

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

test('tomma flow-värden [] och {} blir tom lista och tomt objekt, inte strängar', () => {
  // TankGuards produktfil skrev `videor: []` — det blev strängen "[]" och
  // build-store kraschade på .filter (2026-09-09).
  const d = lasYaml(['media:', '  videor: []', '  extra: {}', '  namn: "[]"'].join('\n'));
  assert.deepEqual(d.media.videor, []);
  assert.deepEqual(d.media.extra, {});
  assert.equal(d.media.namn, '[]'); // citerat förblir text
});

test('listobjekt med url + alt läses som objekt bredvid rena strängar', () => {
  const d = lasYaml(
    [
      'bilder:',
      '  - "https://exempel.se/a.jpg"',
      '  - url: "https://exempel.se/no.jpg"',
      '    alt: "[NO] Før og etter – tank uten og med trekk"',
    ].join('\n')
  );
  assert.equal(d.bilder[0], 'https://exempel.se/a.jpg');
  assert.deepEqual(d.bilder[1], { url: 'https://exempel.se/no.jpg', alt: '[NO] Før og etter – tank uten og med trekk' });
});

// Startsidans tester (stycken utan [object Object], kollektion vs produkt,
// omdömen) bor i factory/test/startsida.test.mjs sedan 2026-09-09.
