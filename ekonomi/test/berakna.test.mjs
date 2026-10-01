import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orderrader, markeraNya, periodtal, kohorter, stresstest, aterkopsbidrag90, cogsAndel, manadsavstand } from '../berakna.mjs';

const order = (datum, kund, belopp, rader = [{ variant_id: 1, current_quantity: 1 }], extra = {}) => ({
  created_at: `${datum}T10:00:00Z`, customer: kund === null ? null : { id: kund }, current_total_price: String(belopp), current_total_tax: '0', line_items: rader, ...extra,
});
const KOSTNAD = new Map([[1, 30], [2, 100]]);
const kostnadFor = (v) => KOSTNAD.get(v) ?? null;

test('orderraden: netto utan moms, varukostnad × antal, avbrutna och nollordrar bort', () => {
  const r = orderrader([
    order('2026-09-01', 1, 125, [{ variant_id: 1, current_quantity: 2 }], { current_total_tax: '25' }),
    order('2026-09-02', 2, 100, [{ variant_id: 1, current_quantity: 1 }], { cancelled_at: '2026-09-02' }),
    order('2026-09-03', 3, 0),
  ], { kostnadFor, tullSek: 30, avgiftsandel: 0.03 });
  assert.equal(r.length, 1);
  assert.equal(r[0].netto, 100);
  assert.equal(r[0].cogs, 60);
  assert.equal(r[0].avgift, 3);
  assert.equal(r[0].tull, 30);
});

test('en rad utan kostnad gör orderns varukostnad okänd, inte noll', () => {
  const r = orderrader([order('2026-09-01', 1, 200, [{ variant_id: 1, current_quantity: 1 }, { variant_id: 9, current_quantity: 1 }])], { kostnadFor });
  assert.equal(r[0].cogs, null);
  assert.deepEqual(cogsAndel(r), { andel: null, tackning: 0 });
});

test('landad kostnad per land vinner över Cost per item', () => {
  const r = orderrader([order('2026-09-01', 1, 500, [{ variant_id: 1, current_quantity: 2 }], { shipping_address: { country_code: 'US' } })], {
    kostnadFor, kostnadPerLand: (li, land, antal) => (land === 'US' ? { kostnadSek: 50 * antal } : null),
  });
  assert.equal(r[0].cogs, 100);
});

test('valutan räknas om till kronor', () => {
  const r = orderrader([order('2026-09-01', 1, 10)], { kostnadFor, kurs: 11 });
  assert.equal(r[0].netto, 110);
  assert.equal(r[0].cogs, 330);
});

test('nya kunder: första ordern, men bara när historiken räcker bakåt', () => {
  const r = orderrader([
    order('2026-01-05', 'a', 100), order('2026-08-01', 'a', 100), order('2026-08-02', 'b', 100), order('2026-08-03', null, 100),
  ], { kostnadFor });
  const { bedombarFran } = markeraNya(r, { forstaDag: '2026-01-01', minHistorikDagar: 180 });
  assert.equal(bedombarFran, '2026-06-30');
  assert.deepEqual(r.map((x) => x.ny), [null, false, true, null]);
});

test('periodtal: nCAC = reklam ÷ nya kunder, och första ordern bär hela reklamen', () => {
  const r = orderrader([
    order('2026-09-01', 'a', 100), order('2026-09-02', 'b', 100), order('2026-09-10', 'a', 200, [{ variant_id: 2, current_quantity: 1 }]),
  ], { kostnadFor, tullSek: 10, avgiftsandel: 0 });
  markeraNya(r, { forstaDag: '2026-09-01', minHistorikDagar: 0 });
  const p = periodtal(r, { fran: '2026-09-01', till: '2026-09-30', spend: 80 });
  assert.equal(p.nya, 2);
  assert.equal(p.aterkop, 1);
  assert.equal(p.ncac, 40);
  assert.equal(p.bidragForeReklamNy, 100 - 30 - 10);
  assert.equal(p.bidragForstaOrder, 60 - 40);
  assert.equal(p.bidragAterkop, 200 - 100 - 10);
  assert.equal(p.mer, 400 / 80);
  assert.equal(p.roasMotNya, 100 / 40);
});

test('saknas varukostnaden i alla ordrar blir bidraget null, aldrig en gissning', () => {
  const r = orderrader([order('2026-09-01', 'a', 100, [{ variant_id: 9, current_quantity: 1 }])], { kostnadFor });
  markeraNya(r, { forstaDag: '2026-09-01', minHistorikDagar: 0 });
  const p = periodtal(r, { fran: '2026-09-01', till: '2026-09-30', spend: 50 });
  assert.equal(p.bidragForeReklamNy, null);
  assert.equal(p.bidragForstaOrder, null);
});

test('kohorter: bara hela månader, kumulativt per kund, och när CAC är tillbaka', () => {
  const r = orderrader([
    order('2026-07-01', 'a', 100), order('2026-07-02', 'b', 100), order('2026-08-15', 'a', 200), order('2026-09-20', 'c', 100),
  ], { kostnadFor, tullSek: 0 });
  markeraNya(r, { forstaDag: '2026-07-01', minHistorikDagar: 0 });
  const k = kohorter(r, { spendPerManad: { '2026-07': 200, '2026-09': 50 }, idag: '2026-09-25', cogsProcent: 0.3 });
  const juli = k.find((x) => x.manad === '2026-07');
  assert.equal(juli.kunder, 2);
  assert.equal(juli.cac, 100);
  assert.equal(juli.avslutadeManader, 2, 'september pågår och räknas inte');
  assert.deepEqual(juli.kumBidrag, [70, 70 + 170 / 2]);
  assert.equal(juli.paybackManad, 1);
  const sep = k.find((x) => x.manad === '2026-09');
  assert.equal(sep.avslutadeManader, 0);
  assert.equal(sep.paybackManad, null);
});

test('stresstestet: CAC +20 %, LTV −20 %, varukostnad +5 procentenheter', () => {
  const bas = { ncac: 100, bidragForeReklamNy: 150, aovNy: 400 };
  const s = stresstest(bas, { ltvExtra: 50 });
  assert.deepEqual(s.map((x) => [x.namn, x.forstaOrder, x.nittioDagar]), [
    ['Som nu', 50, 100],
    ['CAC +20 %', 30, 80],
    ['LTV −20 %', 50, 90],
    ['Varukostnad +5 procentenheter', 30, 80],
  ]);
  assert.equal(stresstest({ ncac: null, bidragForeReklamNy: 1, aovNy: 1 }), null);
});

test('återköpsbidrag inom 90 dagar per ny kund, bara kunder som hunnit 90 dagar', () => {
  const r = orderrader([
    order('2026-05-01', 'a', 100), order('2026-06-01', 'a', 100), order('2026-05-02', 'b', 100), order('2026-09-01', 'c', 100), order('2026-09-02', 'c', 100),
  ], { kostnadFor });
  markeraNya(r, { forstaDag: '2026-05-01', minHistorikDagar: 0 });
  const a = aterkopsbidrag90(r, { idag: '2026-09-25', cogsProcent: 0.3 });
  assert.equal(a.kunder, 2);
  assert.equal(a.perKund, 70 / 2);
});

test('månadsavstånd över årsskiftet', () => {
  assert.equal(manadsavstand('2025-12', '2026-02'), 2);
  assert.equal(manadsavstand('2026-09', '2026-09'), 0);
});
