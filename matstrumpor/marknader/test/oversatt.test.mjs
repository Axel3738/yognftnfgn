// Översättningsrutinen för Matstrumpor: granskaren (vilka marknader skalar) och planen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { domMarknad, malMarknader, dygnMellan, LAGE } from '../oversatt/granskare.mjs';
import { planera, marknadsNamn, basNyckel, seNamnUr, vinnare } from '../oversatt/plan.mjs';
import { farNyAktiv } from '../annonser/bygg.mjs';

const g = { test_dagar: 3, min_spend_sek: 300, min_kop: 3, fonster_dagar: 7 };
const be = { roas: 1.5, kalla: 'test' };
const aktiv = { kod: 'DE', effective_status: 'ACTIVE' };
const dygn = (fran, n) => Array.from({ length: n }, (_, i) => ({ datum: new Date(Date.parse(`${fran}T00:00:00Z`) + i * 86400000).toISOString().slice(0, 10), spend: 500 }));

test('dygnMellan räknar kalenderdygn', () => assert.equal(dygnMellan('2026-09-30', '2026-10-03'), 3));

test('pausad kampanj är av, oavsett tal', () => {
  const d = domMarknad({ k: { kod: 'DE', effective_status: 'PAUSED' }, dagar: dygn('2026-09-20', 10), fonster: { spend: 9000, kop: 40, roas: 3 }, be, g, idag: '2026-10-05' });
  assert.equal(d.lage, LAGE.AV);
});

test('testas tills tre HELA dygn gått — dagens halva räknas inte', () => {
  const idag = '2026-10-03';
  const d = domMarknad({ k: aktiv, dagar: dygn('2026-10-01', 3), fonster: { spend: 5000, kop: 20, roas: 3 }, be, g, idag });
  assert.equal(d.lage, LAGE.TESTAS);
  assert.equal(d.hela_dygn, 2);
  const e = domMarknad({ k: aktiv, dagar: dygn('2026-09-30', 4), fonster: { spend: 5000, kop: 20, roas: 3 }, be, g, idag });
  assert.equal(e.lage, LAGE.SKALAR);
});

test('under grinden efter testen ⇒ för lite, aldrig skalar', () => {
  const d = domMarknad({ k: aktiv, dagar: dygn('2026-09-25', 8), fonster: { spend: 2000, kop: 2, roas: 4 }, be, g, idag: '2026-10-03' });
  assert.equal(d.lage, LAGE.FOR_LITE);
});

test('under break-even ⇒ under; saknad ROAS ⇒ ingen dom', () => {
  const bas = { k: aktiv, dagar: dygn('2026-09-25', 8), be, g, idag: '2026-10-03' };
  assert.equal(domMarknad({ ...bas, fonster: { spend: 3000, kop: 8, roas: 1.2 } }).lage, LAGE.UNDER);
  assert.equal(domMarknad({ ...bas, fonster: { spend: 3000, kop: 8, roas: null } }).lage, LAGE.FOR_LITE);
});

test('Axels ord vinner över mätningen', () => {
  const d = domMarknad({ k: { kod: 'DE', effective_status: 'PAUSED' }, be, g, idag: '2026-10-03', manuellt: { lage: 'skalar', datum: '2026-10-03', citat: 'kör Tyskland' } });
  assert.equal(d.lage, LAGE.SKALAR);
  assert.equal(d.manuellt, true);
});

test('A/B-partnern följer med när den går, aldrig annars', () => {
  const kampanjer = { NO: { ab: { mot: 'NOB' } }, NOB: { ab: { mot: 'NO' } }, DK: {} };
  const domar = [{ kod: 'NO', lage: 'skalar', motivering: 'x' }, { kod: 'NOB', lage: 'testas', effective_status: 'ACTIVE' }, { kod: 'DK', lage: 'under' }];
  assert.deepEqual(malMarknader(domar, kampanjer).map((m) => m.kod), ['NO', 'NOB']);
  domar[1].effective_status = 'PAUSED'; domar[1].lage = 'av';
  assert.deepEqual(malMarknader(domar, kampanjer).map((m) => m.kod), ['NO']);
});

test('namnen: marknadskoden in, hookvarianten ut', () => {
  assert.equal(marknadsNamn('MATSTRUMP_sushi_gift_ugc_052_v1', 'DE'), 'MATSTRUMP_DE_sushi_gift_ugc_052_v1');
  assert.equal(marknadsNamn('025', 'DE'), null);
  assert.equal(basNyckel('MATSTRUMP_sushi_gift_ugc_049h1_v1'), basNyckel('MATSTRUMP_sushi_gift_ugc_049_v1'));
  assert.notEqual(basNyckel('MATSTRUMP_sushi_gift_ugc_049_v1'), basNyckel('MATSTRUMP_sushi_gift_ugc_049_v2'));
  assert.equal(seNamnUr('MATSTRUMP_DE_sushi_gift_ugc_052_v1', 'DE'), 'MATSTRUMP_sushi_gift_ugc_052_v1');
});

test('planen: bara skalande marknader, hoppar det som finns, stoppar Katarina och odöpta, taket håller', () => {
  const rader = [
    { id: '1', namn: 'MATSTRUMP_sushi_gift_ugc_052_v1', leverans: 'drive-lank' },
    { id: '2', namn: 'MATSTRUMP_sushi_jul_ugc_048_v1', leverans: 'drive-lank', text: 'Katarina jul' },
    { id: '3', namn: '025', leverans: 'drive-lank' },
    { id: '4', namn: 'MATSTRUMP_sushi_gift_ugc_049_v1', leverans: 'drive-lank' },
  ];
  const finns = { DE: new Set(['MATSTRUMP_DE_sushi_gift_ugc_049h1_v1']), US: new Set(['MATSTRUMP_US_sushi_gift_ugc_049_v1']) };
  const p = planera(rader, [{ kod: 'DE' }, { kod: 'US' }], finns, { aldrig_utomlands: ['katarina'], tak_per_korning: 2 });
  assert.deepEqual(p.klara.map((r) => r.id), ['4']);
  assert.deepEqual(p.att_gora.map((a) => a.namn), ['MATSTRUMP_DE_sushi_gift_ugc_052_v1', 'MATSTRUMP_US_sushi_gift_ugc_052_v1']);
  assert.equal(p.stoppade.length, 2);
  assert.equal(planera(rader, [], finns, {}).att_gora.length, 0);
});

test('vinnare kräver grind OCH break-even, hookarna räknas ihop', () => {
  const insikt = new Map([
    ['MATSTRUMP_sushi_gift_ugc_049h1_v1', { spend: 200, kop: 2, roas: 2 }],
    ['MATSTRUMP_sushi_gift_ugc_049h2_v1', { spend: 200, kop: 2, roas: 2 }],
    ['MATSTRUMP_sushi_gift_ugc_050_v1', { spend: 900, kop: 5, roas: 1.2 }],
  ]);
  const rader = [{ id: 'a', namn: 'MATSTRUMP_sushi_gift_ugc_049_v1' }, { id: 'b', namn: 'MATSTRUMP_sushi_gift_ugc_050_v1' }];
  const v = vinnare(rader, insikt, 1.498, { min_spend_sek: 300, min_kop: 3 });
  assert.deepEqual(v.map((x) => x.id), ['a']);
  assert.equal(v[0].hookar.length, 2);
});

test('--ny-aktiv slår bara på i en skalande marknad med dagens dom och aktiv kampanj + adset', () => {
  const granskare = { idag: '2026-10-03', mal: ['DE'] };
  const ok = { kod: 'DE', granskare, idag: '2026-10-03', kampanjStatus: 'ACTIVE', adsetStatus: 'ACTIVE' };
  assert.equal(farNyAktiv(ok).ok, true);
  assert.equal(farNyAktiv({ ...ok, kod: 'FR' }).ok, false);
  assert.equal(farNyAktiv({ ...ok, idag: '2026-10-04' }).ok, false);
  assert.equal(farNyAktiv({ ...ok, kampanjStatus: 'PAUSED' }).ok, false);
  assert.equal(farNyAktiv({ ...ok, granskare: null }).ok, false);
});

test('Typ-regeln tar både Pending Approval och Approved, aldrig SOP/Guideline', async () => {
  const { readFileSync } = await import('node:fs');
  const K = JSON.parse(readFileSync(new URL('../oversatt/konfig.json', import.meta.url), 'utf8'));
  const re = new RegExp(K.typ_regex, 'i');
  for (const t of ['Video - Pending Approval', 'Image - Pending Approval', 'Video - Approved']) assert.ok(re.test(t), t);
  for (const t of ['SOP', 'Guideline', 'Feedback', 'Winning Creative', '']) assert.ok(!re.test(t), t);
});

test('Axels skalar på en pausad kampanj säger att annonserna blir pausade', () => {
  const d = domMarknad({ k: { kod: 'DE', effective_status: 'PAUSED' }, be, g, idag: '2026-10-03', manuellt: { lage: 'skalar' } });
  assert.match(d.motivering, /PAUSADE/);
});
