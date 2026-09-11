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

test('citattecken inne i en sträng klipper inte texten', () => {
  // Regression 2026-09-11 (AdventLane): naiv indexOf efter slutcitatet gjorde
  //   - "Locktexten på lådan är på engelska: \"Merry Christmas\""
  // till `Locktexten på lådan är på engelska: \` — en halv mening med ett löst
  // bakstreck, live i butikens specifikationslista på tre produkter.
  const d = lasYaml(
    [
      'a: "Locktexten: \\"Merry Christmas\\" slut"',
      'features:',
      '  - "Flaskorna är 3D (leverantörens ord: \\"Stereoscopic\\"), inte platta"',
      '  - "Kartongask 27,94 cm, tryckt \\"BEER 2025\\" i guld"',
      'b: "citat \\"mitt i\\""  # kommentar efteråt',
      'c: "bakstreck \\\\ och radbrytning \\ntvå"',
    ].join('\n')
  );
  assert.equal(d.a, 'Locktexten: "Merry Christmas" slut');
  assert.deepEqual(d.features, [
    'Flaskorna är 3D (leverantörens ord: "Stereoscopic"), inte platta',
    'Kartongask 27,94 cm, tryckt "BEER 2025" i guld',
  ]);
  assert.equal(d.b, 'citat "mitt i"');
  assert.equal(d.c, 'bakstreck \\ och radbrytning \ntvå');
});

test('apostrofsträngar: dubblad apostrof är ett tecken, bakstreck är text', () => {
  const d = lasYaml(["a: 'det är O''Brien'", "b: 'sökväg C:\\temp'"].join('\n'));
  assert.equal(d.a, "det är O'Brien");
  assert.equal(d.b, 'sökväg C:\\temp');
});
