// Tester för annonser/schemalagg.mjs — starttiden, annonserna som hålls av, länderna och tidsjämförelsen (inget nät).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lasStart, tidOk, delaAnnonser, geoSkiljer, lageFel } from '../annonser/schemalagg.mjs';

const NU = new Date('2026-10-01T11:00:00Z');

test('lasStart: kräver tidszon i texten', () => {
  assert.equal(lasStart('2026-10-02T00:01:00+02:00').toISOString(), '2026-10-01T22:01:00.000Z');
  assert.throws(() => lasStart('2026-10-02T00:01:00'), /tidszon/);
  assert.throws(() => lasStart(undefined), /tidszon/);
  assert.throws(() => lasStart('nonsens+02:00'), /går inte att läsa/);
});

test('tidOk: förbered bara före starten; starta från 2 min före till 6 h efter', () => {
  const start = new Date('2026-10-01T22:01:00Z');
  assert.equal(tidOk('forbered', start, NU).ok, true);
  assert.match(tidOk('forbered', start, new Date('2026-10-01T22:05:00Z')).skal, /passerat/);
  assert.match(tidOk('starta', start, NU).skal, /för tidigt/);
  assert.equal(tidOk('starta', start, new Date('2026-10-01T21:59:30Z')).ok, true, 'en väckning en halv minut för tidigt får starta');
  assert.equal(tidOk('starta', start, new Date('2026-10-01T22:03:00Z')).ok, true);
  assert.match(tidOk('starta', start, new Date('2026-10-02T05:00:00Z')).skal, /för sent/);
});

test('delaAnnonser: hall_av står kvar avstängda med skäl, ett namn som inte finns rapporteras', () => {
  const k = { hall_av: [{ namn: 'B', skal: 'sukker' }, { namn: 'X', skal: 'finns inte' }] };
  const r = delaAnnonser(k, [{ id: '1', name: 'A' }, { id: '2', name: 'B' }]);
  assert.deepEqual(r.pa.map((a) => a.name), ['A']);
  assert.deepEqual(r.av.map((a) => [a.name, a.skal]), [['B', 'sukker']]);
  assert.deepEqual(r.saknas, ['X']);
  assert.deepEqual(delaAnnonser({}, [{ name: 'A' }]).av, []);
});

test('geoSkiljer: ordningen spelar ingen roll, ett land mer eller mindre gör det', () => {
  assert.equal(geoSkiljer({ geo: ['GB', 'CA', 'NZ'] }, { geo_locations: { countries: ['NZ', 'GB', 'CA'] } }), false);
  assert.equal(geoSkiljer({ geo: ['GB', 'CA', 'NZ'] }, { geo_locations: { countries: ['NZ', 'CA', 'GB', 'AU'] } }), true);
  assert.equal(geoSkiljer({ geo: ['NO'] }, {}), true);
});

test('lageFel: kampanjen enligt steget, adsetet på, de avhållna pausade, länderna rätt', () => {
  const k = { geo: ['GB', 'CA', 'NZ'] };
  const bra = { kampanj: { status: 'PAUSED' }, adset: { status: 'ACTIVE', targeting: { geo_locations: { countries: ['NZ', 'CA', 'GB'] } } }, annonser: [{ id: '1', name: 'A', status: 'ACTIVE' }, { id: '2', name: 'B', status: 'PAUSED' }] };
  assert.deepEqual(lageFel(k, bra, 'PAUSED', new Set(['2'])), []);
  assert.deepEqual(lageFel(k, bra, 'ACTIVE', new Set(['2'])), ['kampanjen PAUSED (ska ACTIVE)']);
  assert.deepEqual(lageFel(k, bra, 'PAUSED'), ['B PAUSED (ska ACTIVE)']);
  const au = { ...bra, adset: { status: 'ACTIVE', targeting: { geo_locations: { countries: ['GB', 'CA', 'NZ', 'AU'] } } } };
  assert.match(lageFel(k, au, 'PAUSED', new Set(['2']))[0], /länderna/);
});

test('marknader.json: Norges 007 hålls av i A och B, och WW väntar på Australien', () => {
  const M = JSON.parse(readFileSync(new URL('../annonser/marknader.json', import.meta.url), 'utf8'));
  assert.deepEqual(M.kampanjer.NO.hall_av.map((h) => h.namn), ['MATSTRUMP_NO_sushi_gift_ugc_007_v1']);
  assert.deepEqual(M.kampanjer.NOB.hall_av.map((h) => h.namn), ['MATSTRUMP_NOB_sushi_gift_ugc_007_v1']);
  assert.equal(M.kampanjer.WW.geo.includes('AU'), false);
  assert.ok(M.kampanjer.WW.geo_vantar.AU);
});
