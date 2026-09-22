import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpaPerDag, stigandeDagar, cpaStiger, klickandel, dagarOver, cpaText, CPA_STIG_DAGAR, KLICK_MIN_ANDEL } from '../trend.mjs';

// Taköverdraget SE 10–21 september 2026, ordagrant ur kontot (cost_per_action_type
// → omni_purchase, 7d_click). Axels serie samma dag.
const TAK = [
  ['2026-09-10', 1352, 9], ['2026-09-11', 3071, 18], ['2026-09-12', 3376, 23], ['2026-09-13', 6463, 20],
  ['2026-09-14', 4927, 21], ['2026-09-15', 8113, 25], ['2026-09-16', 6464, 24], ['2026-09-17', 7420, 20],
  ['2026-09-18', 13301, 40], ['2026-09-19', 15184, 37], ['2026-09-20', 15990, 38], ['2026-09-21', 13052, 28],
].map(([datum, spend, kop]) => ({ datum, spend, kop, roas: 3 }));

test('cpaPerDag: uttrycklig cpa vinner, annars spend/köp; spend utan köp är oändlig; utan spend null', () => {
  const s = cpaPerDag([
    { datum: '2026-09-02', spend: 100, kop: 0 },
    { datum: '2026-09-01', spend: 400, kop: 2, cpa: 210 },
    { datum: '2026-09-03', spend: 0, kop: 0 },
    { datum: '2026-09-04', spend: 300, kop: 3 },
  ]);
  assert.deepEqual(s.map((d) => [d.datum, d.cpa]), [['2026-09-01', 210], ['2026-09-02', Infinity], ['2026-09-03', null], ['2026-09-04', 100]]);
});

test('stigandeDagar på Taköverdraget: tre stigningar i rad 18 → 21 sep (333 → 410 → 421 → 466)', () => {
  const s = stigandeDagar(TAK, { tillOchMed: '2026-09-21' });
  assert.equal(s.dagar, 3);
  assert.equal(cpaText(s.serie), '333 → 410 → 421 → 466 kr');
  assert.equal(cpaStiger(TAK, { tillOchMed: '2026-09-21' }).stiger, true);
  // Dagen innan: 371 → 333 föll, så 20/9 hade bara två stigningar (333 → 410 → 421).
  assert.equal(stigandeDagar(TAK, { tillOchMed: '2026-09-20' }).dagar, 2);
  assert.equal(cpaStiger(TAK, { tillOchMed: '2026-09-20' }).stiger, false);
  // 19/9: 333 → 410 = en stigning. 17/9: 269 → 371 = en.
  assert.equal(stigandeDagar(TAK, { tillOchMed: '2026-09-19' }).dagar, 1);
  assert.equal(stigandeDagar(TAK, { tillOchMed: '2026-09-17' }).dagar, 1);
  assert.equal(CPA_STIG_DAGAR, 3);
});

test('stigandeDagar: dagens ofullständiga dygn räknas inte när tillOchMed är gårdagen; lucka bryter serien', () => {
  const med = [...TAK, { datum: '2026-09-22', spend: 10749, kop: 16, roas: 2 }];
  assert.equal(stigandeDagar(med, { tillOchMed: '2026-09-21' }).dagar, 3);
  assert.equal(stigandeDagar(med).dagar, 4, 'utan tillOchMed räknas 672 kr in');
  const lucka = TAK.filter((d) => d.datum !== '2026-09-20');
  assert.equal(stigandeDagar(lucka, { tillOchMed: '2026-09-21' }).dagar, 0, '19 → 21 är ingen dagsföljd');
  const nollspend = TAK.map((d) => (d.datum === '2026-09-20' ? { ...d, spend: 0 } : d));
  assert.equal(stigandeDagar(nollspend, { tillOchMed: '2026-09-21' }).dagar, 0, 'ett dygn utan spend är en lucka');
});

test('stigandeDagar: oändlig CPA räknas som stigning från ett tal, oförändrad från oändligt', () => {
  const d = [
    { datum: '2026-09-01', spend: 100, kop: 2 }, { datum: '2026-09-02', spend: 100, kop: 1 },
    { datum: '2026-09-03', spend: 100, kop: 0 }, { datum: '2026-09-04', spend: 100, kop: 0 },
  ];
  assert.equal(stigandeDagar(d, { tillOchMed: '2026-09-03' }).dagar, 2);
  assert.equal(stigandeDagar(d, { tillOchMed: '2026-09-04' }).dagar, 0, '∞ → ∞ är ingen stigning, och den bryter räkningen');
  assert.equal(stigandeDagar([], {}).dagar, 0);
  assert.equal(stigandeDagar(null, {}).dagar, 0);
});

test('klickandel: klick / (klick + visning) över de senaste 3 dygnen; null utan visningstal', () => {
  const d = [
    { datum: '2026-09-18', kop: 40, kop_visning: 0 }, { datum: '2026-09-19', kop: 37, kop_visning: 3 },
    { datum: '2026-09-20', kop: 38, kop_visning: 2 }, { datum: '2026-09-21', kop: 28, kop_visning: 6 },
  ];
  const k = klickandel(d, { tillOchMed: '2026-09-21' });
  assert.equal(k.klick, 103); assert.equal(k.visning, 11); assert.equal(k.dygn, 3);
  assert.ok(Math.abs(k.andel - 103 / 114) < 1e-9);
  assert.equal(klickandel([{ datum: '2026-09-21', kop: 5 }]), null, 'inget visningstal — ingen dom');
  assert.equal(klickandel([{ datum: '2026-09-21', kop: 0, kop_visning: 0 }]), null);
  assert.equal(KLICK_MIN_ANDEL, 0.6);
  const mest = klickandel([{ datum: '2026-09-21', kop: 3, kop_visning: 7 }]);
  assert.ok(mest.andel < KLICK_MIN_ANDEL);
});

test('dagarOver: dygn i rad med dags-ROAS på eller över gränsen, bakåt från senaste dygnet', () => {
  const d = [
    { datum: '2026-09-18', roas: 2.1, spend: 100 }, { datum: '2026-09-19', roas: 3.2, spend: 100 },
    { datum: '2026-09-20', roas: 2.9, spend: 100 }, { datum: '2026-09-21', roas: 3.5, spend: 100 },
  ];
  assert.equal(dagarOver(d, 2.75, { tillOchMed: '2026-09-21' }), 3);
  assert.equal(dagarOver(d, 3.0, { tillOchMed: '2026-09-21' }), 1);
  assert.equal(dagarOver(d, 4.0), 0);
  assert.equal(dagarOver([{ datum: '2026-09-21', spend: 100 }], 2), null, 'ingen roas i serien');
  assert.equal(dagarOver(d, null), null);
});

test('rättelser 2026-09-22: kop null med spend är oändlig CPA, och en trend som inte når fram till gårdagen är inaktuell', () => {
  // Meta utelämnar omni_purchase-raden ett dygn utan köp ⇒ kop null i kontodatan.
  const d = [
    { datum: '2026-09-18', spend: 400, kop: 2 }, { datum: '2026-09-19', spend: 500, kop: 2 },
    { datum: '2026-09-20', spend: 600, kop: 2 }, { datum: '2026-09-21', spend: 1000, kop: null },
  ];
  const s = stigandeDagar(d, { tillOchMed: '2026-09-21' });
  assert.equal(s.dagar, 3, 'spend utan köp är en stigning, inte en lucka');
  assert.equal(s.serie.at(-1).cpa, Infinity);
  // Serien slutar 19/9, tillOchMed 21/9: stigningarna 16–19/9 är gamla nyheter.
  const gammal = [
    { datum: '2026-09-16', spend: 100, kop: 2 }, { datum: '2026-09-17', spend: 150, kop: 2 },
    { datum: '2026-09-18', spend: 200, kop: 2 }, { datum: '2026-09-19', spend: 250, kop: 2 },
  ];
  const g = stigandeDagar(gammal, { tillOchMed: '2026-09-21' });
  assert.equal(g.dagar, 0);
  assert.equal(g.inaktuell, '2026-09-19');
  assert.equal(stigandeDagar(gammal, { tillOchMed: '2026-09-19' }).dagar, 3);
});
