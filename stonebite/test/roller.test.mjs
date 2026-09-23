// Tester för behörigheterna. De här är de viktigaste testerna i mappen:
// går en av dem sönder ser fel person fel siffror.

import test from 'node:test';
import assert from 'node:assert/strict';
import { farSe, harRatt, menyFor, startsidaFor, SIDOR, ROLLER, ROLLNYCKLAR, roll, personIdFor, bonusrollerFor } from '../roller.mjs';

const agare = { id: '1', namn: 'Axel', roll: 'agare' };
const chef = { id: '2', namn: 'Anna', roll: 'chef' };
const redigerare = { id: '3', namn: 'Josh', roll: 'redigerare', personId: 'josh' };
const va = { id: '4', namn: 'Maria', roll: 'va', personId: 'maria' };
const supportChef = { id: '5', namn: 'Hanna', roll: 'support_chef', personId: 'hanna' };
const produkttest = { id: '6', namn: 'Pia', roll: 'produkttest', personId: 'pia' };

test('de sex rollerna finns och har var sin beskrivning', () => {
  assert.deepEqual(ROLLNYCKLAR, ['agare', 'chef', 'produkttest', 'redigerare', 'support_chef', 'va']);
  for (const r of ROLLNYCKLAR) {
    assert.ok(ROLLER[r].namn?.length > 2, `${r} saknar namn`);
    assert.ok(ROLLER[r].beskrivning?.length > 15, `${r} saknar beskrivning`);
    assert.ok(ROLLER[r].sidor.length >= 2, `${r} når för få sidor`);
  }
});

test('ägaren når allt', () => {
  for (const s of SIDOR) assert.equal(farSe(agare, s.nyckel), true, `ägaren ska nå ${s.nyckel}`);
});

test('redigeraren ser ALDRIG spend, pengar eller andra roller', () => {
  for (const r of ['spend', 'pengar', 'marginal', 'bonus-alla', 'godkanna', 'konton']) {
    assert.equal(harRatt(redigerare, r), false, `redigeraren ska inte ha ${r}`);
  }
  for (const s of ['annonser', 'butiker', 'oversikt', 'kundtjanst', 'recensioner', 'bonus', 'system', 'konton', 'produkttest']) {
    assert.equal(farSe(redigerare, s), false, `redigeraren ska inte nå ${s}`);
  }
  assert.equal(farSe(redigerare, 'redigerare'), true);
  assert.equal(farSe(redigerare, 'mig'), true);
});

test('produkttestaren ser sin pipeline och sin egen sida — inget annat', () => {
  assert.equal(farSe(produkttest, 'produkttest'), true);
  assert.equal(farSe(produkttest, 'mig'), true);
  for (const s of ['oversikt', 'butiker', 'annonser', 'kundtjanst', 'bonus', 'konton', 'redigerare']) {
    assert.equal(farSe(produkttest, s), false, `produkttest ska inte nå ${s}`);
  }
  assert.equal(harRatt(produkttest, 'pengar'), false);
});

test('vanlig VA ser kundtjänst, recensioner och paket — men ingen ekonomi', () => {
  for (const s of ['kundtjanst', 'recensioner', 'leverans', 'mig']) {
    assert.equal(farSe(va, s), true, `VA ska nå ${s}`);
  }
  for (const s of ['oversikt', 'butiker', 'annonser', 'bonus', 'konton', 'system', 'produkttest', 'redigerare']) {
    assert.equal(farSe(va, s), false, `VA ska inte nå ${s}`);
  }
  assert.equal(harRatt(va, 'pengar'), false);
  assert.equal(harRatt(va, 'bonus-alla'), false, 'en VA ser bara sina egna pengar');
  assert.equal(harRatt(va, 'godkanna'), false, 'en VA godkänner aldrig sina egna insatser');
});

test('Head of support ser teamets bonus och får godkänna — men ingen ekonomi', () => {
  assert.equal(farSe(supportChef, 'bonus'), true);
  assert.equal(harRatt(supportChef, 'bonus-alla'), true);
  assert.equal(harRatt(supportChef, 'godkanna'), true);
  assert.equal(harRatt(supportChef, 'pengar'), false);
  assert.equal(harRatt(supportChef, 'spend'), false);
  assert.equal(farSe(supportChef, 'annonser'), false);
  assert.equal(farSe(supportChef, 'konton'), false);
});

test('bara ägaren får röra konton', () => {
  assert.equal(harRatt(agare, 'konton'), true);
  for (const a of [chef, redigerare, va, supportChef, produkttest]) {
    assert.equal(harRatt(a, 'konton'), false, `${a.roll} ska inte röra konton`);
    assert.equal(farSe(a, 'konton'), false);
  }
});

test('chefen ser ekonomin men inte kontona', () => {
  assert.equal(harRatt(chef, 'pengar'), true);
  assert.equal(harRatt(chef, 'spend'), true);
  assert.equal(harRatt(chef, 'godkanna'), true);
  assert.equal(farSe(chef, 'oversikt'), true);
  assert.equal(farSe(chef, 'konton'), false);
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
  assert.equal(startsidaFor(supportChef), '/app/kundtjanst');
  assert.equal(startsidaFor(produkttest), '/app/produkttest');
  assert.equal(startsidaFor({ roll: 'okänd' }), '/app/mig');
});

test('varje roll har bara sidnycklar som finns', () => {
  const nycklar = new Set(SIDOR.map((s) => s.nyckel));
  for (const nyckel of ROLLNYCKLAR) {
    for (const s of ROLLER[nyckel].sidor) assert.ok(nycklar.has(s), `${nyckel} pekar på okänd sida ${s}`);
  }
});

test('alla roller når Min sida — det är där pengarna står', () => {
  for (const nyckel of ROLLNYCKLAR) {
    assert.equal(farSe({ roll: nyckel }, 'mig'), true, `${nyckel} måste nå sin egen sida`);
  }
});

test('personkopplingen är tom när den inte är satt', () => {
  assert.equal(personIdFor(redigerare), 'josh');
  assert.equal(personIdFor({ roll: 'redigerare' }), null);
  assert.equal(personIdFor({ roll: 'redigerare', personId: '  ' }), null);
});

test('bonusrollerna är primärrollen plus extra', () => {
  assert.deepEqual(bonusrollerFor(redigerare), ['redigerare']);
  assert.deepEqual(bonusrollerFor(redigerare, { extraRoller: ['produkttest'] }), ['redigerare', 'produkttest']);
  assert.deepEqual(bonusrollerFor(va, { extraRoller: [] }), ['va']);
});

test('rollnamn slås upp oberoende av versaler och mellanslag', () => {
  assert.equal(roll('AGARE').namn, 'Ägare');
  assert.equal(roll(' chef ').namn, 'Chef — ser ALL ekonomi');
  assert.equal(roll('finns-inte'), null);
});

test('bara ägare och chef ser all ekonomi — och namnen säger det själva', async () => {
  const { serEkonomi, ekonomiVarning, ROLLER } = await import('../roller.mjs');
  assert.equal(serEkonomi('agare'), true);
  assert.equal(serEkonomi('chef'), true);
  for (const r of ['produkttest', 'redigerare', 'support_chef', 'va', 'finns-inte']) assert.equal(serEkonomi(r), false, r);
  // 2026-09-23: "Chef" och "Head of customer support" låg bredvid varandra i
  // listan och Mechile fick fel roll. Namnen bär skillnaden nu.
  assert.match(ROLLER.chef.namn, /ekonomi/i);
  assert.match(ROLLER.support_chef.namn, /ingen ekonomi/i);
  assert.match(ekonomiVarning('chef'), /Kryssa i/);
});
