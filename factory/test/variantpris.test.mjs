// Tester för variantpris.mjs — pris per variant i butikens valuta och i
// marknadsvalutorna, plus spärren mot en halv prisstege. Ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  variantNamn,
  variantPriser,
  prisKarta,
  prisForVariant,
  harPrisstege,
  granskaVariantpriser,
} from '../variantpris.mjs';

const utanStege = {
  produkt: { id: 'termoskyddet' },
  ekonomi: { pris: 559, jamforpris: 932, valuta: 'SEK', marknadspriser: [{ valuta: 'EUR', pris: 62.9, jamforpris: 104.9 }] },
};

const medStege = {
  produkt: { id: 'takskyddet' },
  ekonomi: { pris: 1129, jamforpris: 1469, valuta: 'SEK', marknadspriser: [{ valuta: 'EUR', pris: 126.9, jamforpris: 165.9 }] },
  varianter: [
    { namn: '5,5 × 3 m', pris: 1129, jamforpris: 1469, marknadspriser: [{ valuta: 'EUR', pris: 126.9, jamforpris: 165.9 }] },
    { namn: '7,5 × 3 m', pris: 1289, jamforpris: 1679, marknadspriser: [{ valuta: 'EUR', pris: 144.9, jamforpris: 188.9 }] },
  ],
};

test('utan varianter: en rad med ekonomi-blockets pris, precis som före stegen', () => {
  assert.deepEqual(variantNamn(utanStege), ['Default Title']);
  assert.deepEqual(variantPriser(utanStege), [{ namn: 'Default Title', pris: 559, jamforpris: 932, eget: false }]);
  assert.equal(harPrisstege(utanStege), false);
  assert.deepEqual(granskaVariantpriser(utanStege), []);
});

test('varianter utan egna priser ärver referenspriset — inget beteende ändras', () => {
  const p = { ...utanStege, varianter: [{ namn: 'Svart' }, { namn: 'Grå' }] };
  assert.deepEqual(
    variantPriser(p).map((r) => [r.namn, r.pris, r.jamforpris]),
    [['Svart', 559, 932], ['Grå', 559, 932]]
  );
  assert.equal(harPrisstege(p), false);
  assert.deepEqual(granskaVariantpriser(p), []);
  // Samma sak i marknadsvalutan
  assert.deepEqual(prisForVariant(p, 'Grå', 'EUR'), { pris: 62.9, jamforpris: 104.9 });
});

test('prisstege: varje variant bär sitt eget pris i både SEK och EUR', () => {
  assert.equal(harPrisstege(medStege), true);
  assert.deepEqual(prisForVariant(medStege, '7,5 × 3 m'), { pris: 1289, jamforpris: 1679 });
  assert.deepEqual(prisForVariant(medStege, '7,5 × 3 m', 'EUR'), { pris: 144.9, jamforpris: 188.9 });
  const karta = prisKarta(medStege, 'EUR');
  assert.equal(karta.get('5,5 × 3 m').pris, 126.9);
  assert.equal(karta.size, 2);
  assert.deepEqual(granskaVariantpriser(medStege), []);
});

test('okänt variantnamn faller tillbaka på referenspriset, aldrig på noll', () => {
  assert.deepEqual(prisForVariant(medStege, 'finns inte'), { pris: 1129, jamforpris: 1469 });
  assert.deepEqual(prisForVariant(medStege, 'finns inte', 'EUR'), { pris: 126.9, jamforpris: 165.9 });
});

test('halv stege i butiksvalutan stoppas — den saknade varianten namnges', () => {
  const p = { ...medStege, varianter: [medStege.varianter[0], { namn: '13,5 × 3 m' }] };
  const fel = granskaVariantpriser(p);
  // Halv stege i BÅDA nivåerna: SEK och EUR. Båda namnger varianten som saknas.
  assert.equal(fel.length, 2);
  assert.ok(fel.every((f) => /13,5 × 3 m/.test(f) && /referenspriset/.test(f)));
  assert.ok(fel.some((f) => /EUR/.test(f)));
});

test('stege i SEK men inte i EUR stoppas — annars kostar alla storlekar lika i den marknaden', () => {
  const p = {
    ...medStege,
    varianter: medStege.varianter.map((v) => ({ namn: v.namn, pris: v.pris, jamforpris: v.jamforpris })),
  };
  const fel = granskaVariantpriser(p);
  assert.equal(fel.length, 1);
  assert.match(fel[0], /EUR/);
});

test('jämförpris under priset och dubbla variantnamn är fel, inte varningar', () => {
  const p = {
    produkt: { id: 'x' },
    ekonomi: { pris: 100, valuta: 'SEK' },
    varianter: [
      { namn: 'A', pris: 100, jamforpris: 90 },
      { namn: 'A', pris: 200, jamforpris: 300 },
    ],
  };
  const fel = granskaVariantpriser(p);
  assert.ok(fel.some((f) => /två varianter heter "A"/.test(f)));
  assert.ok(fel.some((f) => /jämförpris 90/.test(f)));
});
