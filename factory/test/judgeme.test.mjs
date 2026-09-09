// Tester för Judge.me-underlaget: datumformatet, husets CSV, appens CSV och
// den översatta delmängden. Ren logik — inga nätverksanrop.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  byggJudgeMeCsv,
  byggJudgeMeAppCsv,
  byggJudgeMeCsvOversatt,
  judgeMeDatum,
  JUDGEME_KOLUMNER,
  JUDGEME_APP_KOLUMNER,
} from '../judgeme.mjs';

const produkt = () => ({
  produkt: { namn: 'Testprylen', id: 'testprylen' },
  reviews: [
    { titel: 'Toppen', text: 'Funkar "perfekt", varje dag.', betyg: 5, namn: 'Anna B', datum: '2026-08-10' },
    { titel: 'Bra', text: 'Gör vad den ska.', betyg: 4, namn: 'Carl D', datum: '2026-07-01T08:00:00.000Z' },
  ],
});

test('judgeMeDatum: ISO-datum → appens dd/mm/yyyy, allt annat → null', () => {
  assert.equal(judgeMeDatum('2026-08-10'), '10/08/2026');
  assert.equal(judgeMeDatum('2026-08-19T08:00:00.000Z'), '19/08/2026');
  assert.equal(judgeMeDatum('2026-08-19 08:00:00 UTC'), '19/08/2026');
  assert.equal(judgeMeDatum('nyss'), null, 'text är inte ett datum');
  assert.equal(judgeMeDatum('2026-13-01'), null, 'månad 13 finns inte');
  assert.equal(judgeMeDatum('2026-02-30'), null, '30 februari finns inte');
  assert.equal(judgeMeDatum(''), null);
  assert.equal(judgeMeDatum(null), null);
  assert.equal(judgeMeDatum('10/08/2026'), null, 'redan appformat gissas aldrig om');
});

test('byggJudgeMeCsv: husets kolumner, citering och tomma fält som lämnas tomma', () => {
  const csv = byggJudgeMeCsv(produkt());
  const rader = csv.trimEnd().split('\n');
  assert.equal(rader[0], JUDGEME_KOLUMNER.join(','));
  assert.equal(rader.length, 3);
  // Inre citattecken dubbleras, betyget klipps till 1–5, handle följer med.
  assert.ok(rader[1].includes('"Funkar ""perfekt"", varje dag."'));
  assert.ok(rader[1].includes('"5"'));
  assert.ok(rader[1].endsWith(',"","testprylen","",""'), 'mejl tom, product_id tom, handle, reply/bilder tomma');
  assert.equal(byggJudgeMeCsv({ produkt: { id: 'x' }, reviews: [] }), null, 'utan recensioner: null');
  assert.equal(byggJudgeMeCsv({ produkt: { id: 'x' } }), null);
});

test('byggJudgeMeCsv: betyget klipps till 1–5 och saknat betyg blir 5', () => {
  const csv = byggJudgeMeCsv({
    produkt: { id: 'x' },
    reviews: [{ betyg: 9, namn: 'A' }, { betyg: 0, namn: 'B' }, { namn: 'C' }],
  });
  const betyg = csv.trimEnd().split('\n').slice(1).map((r) => r.split(',')[2]);
  assert.deepEqual(betyg, ['"5"', '"5"', '"5"']);
});

test('byggJudgeMeAppCsv: appens kolumner, dd/mm/yyyy, produkt-id + handle på varje rad', () => {
  const csv = byggJudgeMeAppCsv(produkt(), { produktId: '15989715108184', produktUrl: 'https://testprylen.se/products/testprylen' });
  const rader = csv.trimEnd().split('\n');
  assert.equal(rader[0], JUDGEME_APP_KOLUMNER.join(','));
  assert.equal(rader.length, 3);
  assert.ok(rader[1].includes('"10/08/2026"'), 'datumet i appens format');
  assert.ok(rader[2].includes('"01/07/2026"'), 'ISO-tidsstämpel → bara datumet');
  for (const rad of rader.slice(1)) {
    assert.ok(rad.endsWith(',"15989715108184","testprylen"'), `product_id + handle sist: ${rad}`);
    assert.ok(rad.includes('"https://testprylen.se/products/testprylen"'));
  }
});

test('byggJudgeMeAppCsv: översatt delmängd i SAMMA fil med lokala namn och källans datum', () => {
  const csv = byggJudgeMeAppCsv(produkt(), {
    produktId: '1',
    oversattningar: { nb: { 'recension.0.text': 'Fungerer perfekt', 'recension.0.namn': 'Kari' } },
  });
  const rader = csv.trimEnd().split('\n');
  assert.equal(rader.length, 4, 'två original + en översatt');
  const nb = rader[3];
  assert.ok(nb.includes('"Fungerer perfekt"') && nb.includes('"Kari"'));
  assert.ok(nb.includes('"10/08/2026"'), 'översättningen bär källrecensionens datum');
  assert.ok(nb.includes('"Toppen"'), 'saknad översatt titel faller tillbaka på originalet');
  assert.ok(nb.includes('"5"'), 'betyget är källrecensionens');
});

test('byggJudgeMeAppCsv: recension utan originaldatum stoppar — aldrig påhittat', () => {
  const p = produkt();
  p.reviews[1].datum = '';
  assert.throws(() => byggJudgeMeAppCsv(p, { produktId: '1' }), /saknar originaldatum/);
  const p2 = produkt();
  p2.reviews[0].datum = 'för 3 dagar sedan';
  assert.throws(() => byggJudgeMeAppCsv(p2, { produktId: '1' }), /Anna B/);
  assert.equal(byggJudgeMeAppCsv({ produkt: { id: 'x' }, reviews: [] }), null);
});

test('byggJudgeMeCsvOversatt: bara rader med både text och namn, annars null', () => {
  const csv = byggJudgeMeCsvOversatt(produkt(), {
    'recension.0.titel': 'Topp',
    'recension.0.text': 'Fungerer perfekt',
    'recension.0.namn': 'Kari',
    'recension.1.text': 'Gjør jobben', // namn saknas → hoppas över
  });
  const rader = csv.trimEnd().split('\n');
  assert.equal(rader[0], JUDGEME_KOLUMNER.join(','));
  assert.equal(rader.length, 2);
  assert.ok(rader[1].startsWith('"Topp","Fungerer perfekt","5","2026-08-10","Kari"'));
  assert.equal(byggJudgeMeCsvOversatt(produkt(), {}), null);
  assert.equal(byggJudgeMeCsvOversatt(produkt(), undefined), null);
});
