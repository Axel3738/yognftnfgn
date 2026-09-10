// Tester för fraktupplägget (factory/frakt.mjs). Ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs
//
// Flyttade hit från butik.test.mjs 2026-09-09 när frakt.mjs förenades
// (KEDJAN.md): DryTrek och TankGuard hade var sin lösning på villkorade
// metoder och auto-mergen lade båda ovanpå varandra.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggFraktplan, byggFraktatgarder, fraktraderForKund, FRI_FRAKT } from '../frakt.mjs';
import { rabutik } from './hjalp.mjs';

// --- Fraktplanen ---

test('fri frakt globalt ger fri frakt i alla tre zoner', () => {
  const plan = byggFraktplan(rabutik());
  assert.equal(plan.length, 3);
  assert.equal(plan[0].zon, 'Sverige');
  assert.equal(plan[0].huvudmarknad, true);
  for (const zon of plan) assert.equal(zon.metoder[0].namn, FRI_FRAKT);
});

test('express läggs bara på huvudmarknaden', () => {
  const plan = byggFraktplan(rabutik());
  assert.equal(plan[0].metoder.length, 2);
  assert.equal(plan[0].metoder[1].pris, 99);
  for (const zon of plan.slice(1)) assert.equal(zon.metoder.length, 1);
});

test('huvudmarknaden följer konfigen, inte en hårdkodad lista', () => {
  const b = rabutik();
  b.butik.huvudmarknad = 'Norge';
  b.butik.valuta = 'NOK';
  const plan = byggFraktplan(b);
  assert.equal(plan[0].zon, 'Norge');
  assert.equal(plan[0].metoder[0].valuta, 'NOK');
});

test('betald frakt ger standardpris och fri frakt-gräns', () => {
  const b = { ...rabutik(), frakt: { fri_globalt: false, standardpris: 49, fri_over: 599 } };
  const plan = byggFraktplan(b);
  assert.equal(plan[0].metoder[0].namn, 'Standardfrakt');
  assert.equal(plan[0].metoder[0].pris, 49);
  assert.deepEqual(plan[0].metoder[0].villkor, { friOver: 599 });
});

// --- Skillnaden mot butiken som den ser ut nu ---

const NULAGE = [
  { zon: 'Sverige', metoder: [{ id: 's1', namn: 'Fri frakt', pris: 0 }, { id: 's2', namn: 'Express inom Sverige', pris: 99 }] },
  { zon: 'EU (Europeiska Unionen)', metoder: [{ id: 'e1', namn: 'Fri frakt', pris: 0 }] },
  { zon: 'Internationell', metoder: [{ id: 'i1', namn: 'Fri frakt', pris: 0 }] },
];

test('en butik som redan matchar planen lämnas orörd', () => {
  const r = byggFraktatgarder(NULAGE, byggFraktplan(rabutik()));
  assert.equal(r.orort, true);
});

test('fel pris i en zon ger en uppdatering, inte en nyskapad metod', () => {
  const nulage = structuredClone(NULAGE);
  nulage[1].metoder[0].pris = 299;
  const r = byggFraktatgarder(nulage, byggFraktplan(rabutik()));
  assert.equal(r.attUppdatera.length, 1);
  assert.equal(r.attUppdatera[0].id, 'e1');
  assert.equal(r.attUppdatera[0].metod.pris, 0);
  assert.equal(r.attSkapa.length, 0);
});

test('metod som inte finns i planen tas bort', () => {
  const nulage = structuredClone(NULAGE);
  nulage[0].metoder.push({ id: 's3', namn: 'Standardfrakt', pris: 39 });
  const r = byggFraktatgarder(nulage, byggFraktplan(rabutik()));
  assert.equal(r.attTaBort.length, 1);
  assert.equal(r.attTaBort[0].namn, 'Standardfrakt');
});

test('zon som saknas i butiken planeras för skapande med sina länder', () => {
  const r = byggFraktatgarder([NULAGE[0]], byggFraktplan(rabutik()));
  assert.deepEqual(r.saknadeZoner, ['EU (Europeiska Unionen)', 'Internationell']);
  assert.equal(r.orort, false);
  assert.deepEqual(r.attSkapaZoner.map((z) => z.zon), ['EU (Europeiska Unionen)', 'Internationell']);
  const eu = r.attSkapaZoner[0];
  assert.ok(eu.lander.includes('DK') && eu.lander.includes('DE'), 'EU-zonen bär EU-länderna');
  assert.ok(!eu.lander.includes('SE'), 'hemlandet ligger inte i EU-zonen — ett land får bara ligga i EN zon');
  assert.deepEqual(r.attSkapaZoner[1].lander, ['*'], 'Internationell = resten av världen');
  assert.deepEqual(eu.metoder.map((m) => m.namn), ['Fri frakt']);
  assert.deepEqual(r.attTaBortZoner, [], 'inga främmande zoner att riva');
});

test('trialens egna zoner (Domestic PH, International) rivs BARA när planens zoner ska skapas', () => {
  // TackleBay 2026-09-10: butiken skapades i Filippinerna och bar
  // Domestic=PH + International med SE/NO inuti. Länderna måste frigöras.
  const trial = [
    { zon: 'Domestic', zonId: 'gid://z/ph', metoder: [{ id: 'gid://m/1', namn: 'Standard', pris: 165 }] },
    { zon: 'International', zonId: 'gid://z/int', metoder: [{ id: 'gid://m/2', namn: 'International', pris: 1200 }] },
  ];
  const r = byggFraktatgarder(trial, byggFraktplan(rabutik()));
  assert.deepEqual(r.attSkapaZoner.map((z) => z.zon), ['Sverige', 'EU (Europeiska Unionen)', 'Internationell']);
  assert.deepEqual(r.attSkapaZoner[0].lander, ['SE']);
  assert.deepEqual(r.attTaBortZoner, [{ zon: 'Domestic', id: 'gid://z/ph' }, { zon: 'International', id: 'gid://z/int' }]);
  // En butik som redan stämmer rör inga zoner.
  const ratt = byggFraktatgarder(NULAGE, byggFraktplan(rabutik()));
  assert.deepEqual(ratt.attTaBortZoner, []);
});

// Villkorade metoder ("fri frakt över X") kan inte uppdateras via
// deliveryProfileUpdate (mätt 2026-09-08) — de rivs och byggs om.
test('villkorad metod med fel pris rivs och byggs om, uppdateras aldrig', () => {
  const nulage = structuredClone(NULAGE);
  nulage[1].metoder[0] = { id: 'e1', namn: 'Fri frakt', pris: 299, villkorad: true };
  const r = byggFraktatgarder(nulage, byggFraktplan(rabutik()));
  assert.equal(r.attUppdatera.length, 0);
  assert.deepEqual(r.attTaBort.map((x) => x.id), ['e1']);
  assert.equal(r.attSkapa.length, 1);
  assert.equal(r.attSkapa[0].zon, 'EU (Europeiska Unionen)');
  assert.equal(r.attSkapa[0].metod.pris, 0);
});

test('villkorad metod rivs även när namn och pris råkar stämma — villkoret är felet', () => {
  const nulage = structuredClone(NULAGE);
  nulage[2].metoder[0] = { id: 'i1', namn: 'Fri frakt', pris: 0, villkorad: true };
  const r = byggFraktatgarder(nulage, byggFraktplan(rabutik()));
  assert.equal(r.orort, false);
  assert.deepEqual(r.attTaBort.map((x) => x.id), ['i1']);
  assert.equal(r.attSkapa.length, 1);
  assert.equal(r.attUppdatera.length, 0);
});

test('en villkorad metod ger exakt EN rivning och EN nybyggnad, aldrig dubbelt', () => {
  const nulage = structuredClone(NULAGE);
  nulage[0].metoder[0] = { id: 's1', namn: 'Standardfrakt', pris: 39, villkorad: true };
  const r = byggFraktatgarder(nulage, byggFraktplan(rabutik()));
  assert.equal(r.attTaBort.filter((x) => x.id === 's1').length, 1);
  assert.equal(r.attSkapa.filter((x) => x.zon === 'Sverige').length, 1);
});

// --- Kundraderna ---

test('kundraderna säger samma sak som zonerna', () => {
  const rader = fraktraderForKund(rabutik(), '5–8 arbetsdagar');
  assert.deepEqual(rader, [
    'Leveranstid: 5–8 arbetsdagar',
    'Fri frakt till alla länder',
    'Express inom Sverige: 99 kr, 1–2 arbetsdagar',
  ]);
});
