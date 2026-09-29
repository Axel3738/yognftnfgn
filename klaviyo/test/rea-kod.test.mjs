// Tester för rea-kod.mjs utan nät: rabatt-blocket och grupperingen av en kod som bärs av
// flera mejl (Axels 30 %-rea 2026-09-29: FARSDAG30 i elva mejl, BAT30 i två).
import test from 'node:test';
import assert from 'node:assert/strict';
import { rabattUr, grupperaPerKod, handlesI } from '../rea-kod.mjs';

const r = (over = {}) => ({ typ: 'kod', kod: 'FARSDAG30', procent: 30, start: '2026-10-04T06:00:00Z', slut: '2026-10-19T21:59:59Z', ...over });

test('rabattUr tar mejlets produkter när handles saknas', () => {
  const m = { id: 'k26-x', rabatt: r(), block: [
    { typ: 'hero', knapp: { text: 'Se', lank: 'produkt:a' } },
    { typ: 'produkt', handle: 'b' },
    { typ: 'produktrad', handles: ['c', 'a'] },
  ] };
  assert.deepEqual(handlesI(m).sort(), ['a', 'b', 'c']);
  assert.deepEqual(rabattUr(m).handles.sort(), ['a', 'b', 'c']);
});

test('rabattUr vägrar fel kod, procent och tider', () => {
  assert.throws(() => rabattUr({ id: 'k1', rabatt: r({ kod: 'far-dag' }), block: [{ typ: 'produkt', handle: 'a' }] }), /A-Z0-9/);
  assert.throws(() => rabattUr({ id: 'k1', rabatt: r({ procent: 0 }), block: [{ typ: 'produkt', handle: 'a' }] }), /procent/);
  assert.throws(() => rabattUr({ id: 'k1', rabatt: r({ slut: '2026-10-01T00:00:00Z' }), block: [{ typ: 'produkt', handle: 'a' }] }), /före start/);
  assert.equal(rabattUr({ id: 'k1', rabatt: 'black_week', block: [] }), null);
});

test('samma kod i flera mejl blir en rabatt med unionen av produkterna', () => {
  const g = grupperaPerKod([
    { id: 'k26-lista', r: { ...r(), handles: ['motorlas', 'balteslip'] } },
    { id: 'k28-verkstad', r: { ...r(), handles: ['balteslip', 'taljset'] } },
    { id: 'k25-frost', r: { ...r({ kod: 'FROST30', start: '2026-10-03T06:00:00Z', slut: '2026-10-07T21:59:59Z' }), handles: ['kranskydd'] } },
  ]);
  assert.equal(g.length, 2);
  const f = g.find((x) => x.kod === 'FARSDAG30');
  assert.deepEqual(f.handles, ['motorlas', 'balteslip', 'taljset']);
  assert.deepEqual(f.mejl, ['k26-lista', 'k28-verkstad']);
  assert.match(f.titel, /FARSDAG30: 30 % \(mejl K26, K28\)/);
});

test('samma kod med olika slut eller procent stoppar hela körningen', () => {
  assert.throws(() => grupperaPerKod([
    { id: 'k02', r: { ...r({ kod: 'BAT30' }), handles: ['a'] } },
    { id: 'k24', r: { ...r({ kod: 'BAT30', slut: '2026-10-05T21:59:59Z' }), handles: ['b'] } },
  ]), /BAT30: k02 och k24/);
  assert.throws(() => grupperaPerKod([
    { id: 'k02', r: { ...r({ kod: 'BAT30' }), handles: ['a'] } },
    { id: 'k24', r: { ...r({ kod: 'BAT30', procent: 25 }), handles: ['b'] } },
  ]), /olika procent/);
});
