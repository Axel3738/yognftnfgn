// Tester för behörigheterna. De här är de viktigaste testerna i mappen:
// går en av dem sönder ser fel person fel siffror.

import test from 'node:test';
import assert from 'node:assert/strict';
import { farSe, harRatt, menyFor, startsidaFor, SIDOR, ROLLER, ROLLNYCKLAR, roll, personIdFor } from '../roller.mjs';

const agare = { id: '1', namn: 'Axel', roll: 'agare' };
const chef = { id: '2', namn: 'Anna', roll: 'chef' };
const redigerare = { id: '3', namn: 'Josh', roll: 'redigerare', personId: 'josh' };
const va = { id: '4', namn: 'VA', roll: 'kundtjanst' };

test('ägaren når allt', () => {
  for (const s of SIDOR) assert.equal(farSe(agare, s.nyckel), true, `ägaren ska nå ${s.nyckel}`);
});

test('redigeraren ser ALDRIG spend eller pengar', () => {
  assert.equal(harRatt(redigerare, 'spend'), false);
  assert.equal(harRatt(redigerare, 'pengar'), false);
  assert.equal(harRatt(redigerare, 'marginal'), false);
  assert.equal(farSe(redigerare, 'annonser'), false);
  assert.equal(farSe(redigerare, 'butiker'), false);
  assert.equal(farSe(redigerare, 'oversikt'), false);
});

test('redigeraren ser sin egen sida och topplistan', () => {
  assert.equal(farSe(redigerare, 'mig'), true);
  assert.equal(farSe(redigerare, 'redigerare'), true);
});

test('kundtjänst ser drift men ingen ekonomi', () => {
  assert.equal(farSe(va, 'kundtjanst'), true);
  assert.equal(farSe(va, 'leverans'), true);
  assert.equal(farSe(va, 'annonser'), false);
  assert.equal(farSe(va, 'butiker'), false);
  assert.equal(harRatt(va, 'pengar'), false);
});

test('bara ägaren får röra konton', () => {
  assert.equal(harRatt(agare, 'konton'), true);
  assert.equal(harRatt(chef, 'konton'), false);
  assert.equal(farSe(chef, 'konton'), false);
  assert.equal(farSe(redigerare, 'konton'), false);
  assert.equal(farSe(va, 'konton'), false);
});

test('chefen ser ekonomin men inte kontona', () => {
  assert.equal(harRatt(chef, 'pengar'), true);
  assert.equal(harRatt(chef, 'spend'), true);
  assert.equal(farSe(chef, 'oversikt'), true);
});

test('okänd roll ser ingenting', () => {
  const spok = { id: 'x', namn: 'Spöket', roll: 'chefsdirektör' };
  assert.equal(menyFor(spok).length, 0);
  for (const s of SIDOR) assert.equal(farSe(spok, s.nyckel), false);
  assert.equal(harRatt(spok, 'pengar'), false);
});

test('ingen roll alls ser ingenting', () => {
  assert.equal(farSe(null, 'oversikt'), false);
  assert.equal(farSe({}, 'oversikt'), false);
  assert.equal(harRatt(undefined, 'spend'), false);
});

test('okänd sida släpps aldrig igenom, ens för ägaren', () => {
  assert.equal(farSe(agare, 'hemliga-sidan'), false);
  assert.equal(farSe(agare, ''), false);
});

test('menyn är samma som rollens sidor, i sidordningen', () => {
  for (const nyckel of ROLLNYCKLAR) {
    const meny = menyFor({ roll: nyckel });
    assert.deepEqual(meny.map((s) => s.nyckel).sort(), [...ROLLER[nyckel].sidor].sort());
    const ordning = SIDOR.map((s) => s.nyckel);
    const index = meny.map((s) => ordning.indexOf(s.nyckel));
    assert.deepEqual(index, [...index].sort((a, b) => a - b), 'menyn ska följa sidordningen');
  }
});

test('startsidan är första sidan rollen får se', () => {
  assert.equal(startsidaFor(agare), '/app');
  assert.equal(startsidaFor(chef), '/app');
  assert.equal(startsidaFor(redigerare), '/app/redigerare');
  assert.equal(startsidaFor(va), '/app/kundtjanst');
  assert.equal(startsidaFor({ roll: 'okänd' }), '/app/mig');
});

test('varje roll har bara sidnycklar som finns', () => {
  const nycklar = new Set(SIDOR.map((s) => s.nyckel));
  for (const nyckel of ROLLNYCKLAR) {
    for (const s of ROLLER[nyckel].sidor) assert.ok(nycklar.has(s), `${nyckel} pekar på okänd sida ${s}`);
  }
});

test('personkopplingen är tom när den inte är satt', () => {
  assert.equal(personIdFor(redigerare), 'josh');
  assert.equal(personIdFor({ roll: 'redigerare' }), null);
  assert.equal(personIdFor({ roll: 'redigerare', personId: '  ' }), null);
});

test('rollnamn slås upp oberoende av versaler och mellanslag', () => {
  assert.equal(roll('AGARE').namn, 'Ägare');
  assert.equal(roll(' chef ').namn, 'Chef');
  assert.equal(roll('finns-inte'), null);
});
