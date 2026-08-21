import test from 'node:test';
import assert from 'node:assert/strict';
import {
  erf, normCdf, normInv, tTestP, betai,
  proportionTest, splitTest, aovTest,
  sampleSize, testLength, verdict
} from '../statistik.mjs';

const nära = (a, b, tol, vad) =>
  assert.ok(Math.abs(a - b) < tol, `${vad}: fick ${a}, väntade ~${b} (tolerans ${tol})`);

/* --- fördelningar mot kända värden -------------------------------------- */

test('erf matchar tabellvärden', () => {
  nära(erf(0), 0, 1e-9, 'erf(0)');
  nära(erf(1), 0.8427008, 1e-6, 'erf(1)');
  nära(erf(-1), -0.8427008, 1e-6, 'erf(-1)');
  nära(erf(2), 0.9953223, 1e-6, 'erf(2)');
});

test('normCdf matchar tabellvärden', () => {
  nära(normCdf(0), 0.5, 1e-9, 'Φ(0)');
  nära(normCdf(1.959964), 0.975, 1e-6, 'Φ(1.96)');
  nära(normCdf(-1.959964), 0.025, 1e-6, 'Φ(-1.96)');
  nära(normCdf(2.575829), 0.995, 1e-6, 'Φ(2.576)');
});

test('normInv är invers till normCdf', () => {
  nära(normInv(0.975), 1.959964, 1e-5, 'z(0.975)');
  nära(normInv(0.8), 0.8416212, 1e-5, 'z(0.80)');
  for (const p of [0.01, 0.1, 0.35, 0.5, 0.66, 0.9, 0.99]) {
    nära(normCdf(normInv(p)), p, 1e-6, `rundtur för p=${p}`);
  }
});

test('normInv avvisar omöjliga sannolikheter', () => {
  assert.throws(() => normInv(0), RangeError);
  assert.throws(() => normInv(1), RangeError);
});

test('betai och t-testet matchar tabellvärden', () => {
  nära(betai(0.5, 0.5, 0.5), 0.5, 1e-6, 'I_0.5(0.5, 0.5)');
  // t = 2.228 med 10 frihetsgrader är den klassiska 5 %-gränsen.
  nära(tTestP(2.228, 10), 0.05, 1e-3, 'p för t=2.228, df=10');
  // t = 1.96 med väldigt många frihetsgrader närmar sig normalfördelningen.
  nära(tTestP(1.959964, 100000), 0.05, 1e-3, 'p för t=1.96, df=1e5');
  nära(tTestP(0, 10), 1, 1e-9, 'p för t=0');
});

/* --- tvåproportionstest -------------------------------------------------- */

test('proportionTest räknar rätt på ett handräknat fall', () => {
  // A: 100/1000 = 10 %, B: 130/1000 = 13 %
  const r = proportionTest({
    aConversions: 100, aVisitors: 1000,
    bConversions: 130, bVisitors: 1000
  });
  nära(r.aRate, 0.10, 1e-12, 'A-frekvens');
  nära(r.bRate, 0.13, 1e-12, 'B-frekvens');
  nära(r.absolutLyft, 0.03, 1e-12, 'absolut lyft');
  nära(r.relativtLyft, 0.30, 1e-12, 'relativt lyft');
  nära(r.z, 2.1027, 1e-3, 'z-värde');
  nära(r.p, 0.0355, 1e-3, 'p-värde');
  assert.ok(r.intervall[0] > 0, 'konfidensintervallet ska ligga helt över noll');
});

test('proportionTest ger p nära 1 när varianterna är identiska', () => {
  const r = proportionTest({
    aConversions: 250, aVisitors: 5000,
    bConversions: 250, bVisitors: 5000
  });
  nära(r.z, 0, 1e-12, 'z');
  nära(r.p, 1, 1e-7, 'p');
  assert.ok(r.intervall[0] < 0 && r.intervall[1] > 0, 'intervallet ska omsluta noll');
});

test('proportionTest är symmetriskt när A och B byter plats', () => {
  const ab = proportionTest({ aConversions: 80, aVisitors: 900, bConversions: 110, bVisitors: 950 });
  const ba = proportionTest({ aConversions: 110, aVisitors: 950, bConversions: 80, bVisitors: 900 });
  nära(ab.p, ba.p, 1e-12, 'p ska vara oberoende av ordningen');
  nära(ab.z, -ba.z, 1e-12, 'z ska byta tecken');
});

test('proportionTest avvisar noll besökare', () => {
  assert.throws(() => proportionTest({
    aConversions: 0, aVisitors: 0, bConversions: 1, bVisitors: 10
  }), RangeError);
});

/* --- binomialtest -------------------------------------------------------- */

test('splitTest ser ingen skillnad vid jämn fördelning', () => {
  const r = splitTest({ aOrders: 100, bOrders: 100 });
  nära(r.z, 0, 1e-12, 'z');
  nära(r.p, 1, 1e-7, 'p');
});

test('splitTest flaggar en tydlig snedfördelning', () => {
  // 40 mot 80 av 120 ordrar är långt från 50/50.
  const r = splitTest({ aOrders: 40, bOrders: 80 });
  assert.ok(r.p < 0.001, `väntade p < 0.001, fick ${r.p}`);
  nära(r.andelB, 2 / 3, 1e-12, 'andel B');
  nära(r.relativtLyft, 1.0, 1e-12, 'relativt lyft');
});

test('splitTest kallar inte små tal för en vinst', () => {
  // 12 mot 15 köp ser ut som +25 %, men är brus.
  const r = splitTest({ aOrders: 12, bOrders: 15 });
  assert.ok(r.p > 0.05, `12 mot 15 får inte bli signifikant, fick p = ${r.p}`);
});

test('splitTest klarar viktad utrullning', () => {
  // 90/10-utrullning: 900 mot 100 ordrar är precis vad man väntar sig.
  const r = splitTest({ aOrders: 900, bOrders: 100, expectedShareB: 0.1 });
  assert.ok(r.p > 0.9, `väntade högt p, fick ${r.p}`);
});

/* --- snittordervärde ----------------------------------------------------- */

test('aovTest ser ingen skillnad mellan identiska serier', () => {
  const xs = [399, 369, 399, 449, 299, 399, 369];
  const r = aovTest(xs, xs.slice());
  nära(r.t, 0, 1e-12, 't');
  nära(r.p, 1, 1e-7, 'p');
});

test('aovTest hittar en tydlig höjning av ordervärdet', () => {
  const a = Array.from({ length: 60 }, (_, i) => 300 + (i % 5) * 10);
  const b = Array.from({ length: 60 }, (_, i) => 420 + (i % 5) * 10);
  const r = aovTest(a, b);
  assert.ok(r.p < 0.001, `väntade p < 0.001, fick ${r.p}`);
  nära(r.skillnad, 120, 1e-9, 'skillnad i snittordervärde');
});

test('aovTest vägrar döma på för få ordrar', () => {
  const r = aovTest([399], [449]);
  assert.equal(r.tillräckligt, false);
  assert.equal(r.p, 1);
});

/* --- planering ----------------------------------------------------------- */

test('sampleSize matchar den vedertagna formeln', () => {
  // 5 % baslinje, vi vill kunna se +20 % relativt.
  const n = sampleSize({ baseline: 0.05, mde: 0.20 });
  assert.ok(n > 8000 && n < 8300, `väntade ~8156 per variant, fick ${n}`);
});

test('sampleSize växer när lyftet man vill se krymper', () => {
  const stort = sampleSize({ baseline: 0.05, mde: 0.30 });
  const litet = sampleSize({ baseline: 0.05, mde: 0.10 });
  assert.ok(litet > stort * 4,
    `att halvera lyftet ska mångdubbla underlaget: ${stort} → ${litet}`);
});

test('sampleSize avvisar omöjliga indata', () => {
  assert.throws(() => sampleSize({ baseline: 0, mde: 0.2 }), RangeError);
  assert.throws(() => sampleSize({ baseline: 0.05, mde: 0 }), RangeError);
  assert.throws(() => sampleSize({ baseline: 0.9, mde: 0.5 }), RangeError);
});

test('testLength räknar om till dagar', () => {
  const r = testLength({ baseline: 0.05, mde: 0.20, visitorsPerDay: 500 });
  assert.equal(r.total, r.perVariant * 2);
  assert.equal(r.days, Math.ceil(r.total / 500));
});

test('testLength ger oändligt vid noll trafik', () => {
  const r = testLength({ baseline: 0.05, mde: 0.2, visitorsPerDay: 0 });
  assert.equal(r.days, Infinity);
});

/* --- dom ----------------------------------------------------------------- */

test('verdict vägrar döma när det är för få köp', () => {
  const v = verdict({
    p: 0.001, relativtLyft: 0.5,
    enoughData: false, minOutcomes: 25, observedOutcomes: 6
  });
  assert.equal(v.beslut, 'fortsätt');
  assert.match(v.text, /6 av 25/);
});

test('verdict utropar en vinnare även innan planerat underlaget nåtts', () => {
  // Det här är hela poängen: hittar man ett lyft som är mycket större än det
  // man planerade för, är svaret redan klart. Att vänta ut kalendern då vore
  // att slänga bort en vinst.
  const v = verdict({
    p: 0.003, relativtLyft: 0.60,
    enoughData: true, powerReached: false,
    minOutcomes: 25, observedOutcomes: 60,
    minSample: 14631, observed: 2080
  });
  assert.equal(v.beslut, 'b vinner');
});

test('verdict skiljer "vet inte" från "ingen skillnad"', () => {
  const vetInte = verdict({
    p: 0.42, relativtLyft: 0.05,
    enoughData: true, powerReached: false,
    minOutcomes: 25, observedOutcomes: 40,
    minSample: 14631, observed: 3000, enhet: 'besökare'
  });
  assert.equal(vetInte.beslut, 'fortsätt');
  assert.match(vetInte.text, /vet inte/);

  const pårikigt = verdict({
    p: 0.42, relativtLyft: 0.05,
    enoughData: true, powerReached: true,
    minOutcomes: 25, observedOutcomes: 900,
    minSample: 14631, observed: 15000
  });
  assert.equal(pårikigt.beslut, 'oavgjort');
});

test('verdict utser rätt vinnare åt båda hållen', () => {
  const bas = { enoughData: true, powerReached: true, minOutcomes: 25, observedOutcomes: 300 };
  assert.equal(verdict({ ...bas, p: 0.01, relativtLyft: 0.22 }).beslut, 'b vinner');
  assert.equal(verdict({ ...bas, p: 0.01, relativtLyft: -0.22 }).beslut, 'a vinner');
});

test('p-värden håller sig inom [0, 1] även vid extrema indata', () => {
  const fall = [
    proportionTest({ aConversions: 0, aVisitors: 10, bConversions: 10, bVisitors: 10 }),
    proportionTest({ aConversions: 5000, aVisitors: 5000, bConversions: 0, bVisitors: 5000 }),
    splitTest({ aOrders: 1, bOrders: 100000 }),
    splitTest({ aOrders: 1, bOrders: 1 })
  ];
  for (const r of fall) {
    assert.ok(r.p >= 0 && r.p <= 1, `p utanför intervallet: ${r.p}`);
  }
  assert.ok(tTestP(1e9, 5) >= 0, 't-testets p får inte bli negativt');
  assert.ok(tTestP(0, 5) <= 1, 't-testets p får inte överstiga 1');
});
