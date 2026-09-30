import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gissningar, monster, monsterNot, monsterText, ratta, beslutFor, andringFor, slumpniva, GISSNING_VERSION, MIN_FALL } from '../monster.mjs';
import { byggSerie, plusDagar } from '../facit.mjs';
import { planera } from '../rond.mjs';

const SE = '1867947880635861';

/** En gissning som den skulle se ut i gissningar.jsonl. */
const g = (i, over = {}) => ({
  version: GISSNING_VERSION, nyckel: `HOJ|K${i}|${plusDagar('2026-09-01', i % 25)}`, datum: plusDagar('2026-09-01', i % 25), kampanj_id: `K${i % 12}`, marknad: 'SE', beslut: 'HOJ',
  drag: { lage: '2,0–3,0 × BE', over_target: '3 eller fler', kop: '30 eller fler', andring: 'ingen', budget: '1 000–2 000', trend: 'bättre än snittet', marknad: 'SE' },
  utfall: 'RATT', ...over,
});

test('gissningen rättas mot det som hände dygn 1–3 efter, i break-even-enheter', () => {
  assert.equal(ratta('HOJ', 1.1, 1.6), 'RATT', 'höjningen gick med vinst');
  assert.equal(ratta('HOJ', 0.9, 1.6), 'FEL');
  assert.equal(ratta('SANK', 1.7, 1.6), 'FEL', 'studsade över target');
  assert.equal(ratta('SANK', 0.8, 1.6), 'RATT');
  assert.equal(ratta('SANK', 1.2, 1.6), 'OKLART');
  assert.equal(ratta('VANTA_HOG', 1.7, 1.6), 'FEL', 'toppen höll — en missad höjning');
  assert.equal(ratta('VANTA_FORLUST', 1.05, 1.6), 'RATT');
  assert.equal(beslutFor('LAT_VARA', 1.2, 1.6), null, 'mellan break-even och target finns ingen tydlig gissning');
  assert.equal(beslutFor('LAT_VARA', 1.7, 1.6), 'VANTA_HOG');
  assert.equal(beslutFor('SKALA', 1.7, 1.6), 'HOJ');
});

test('gissningar ur loggen och serien: bara mogna, en per kampanj och dygn, villkoren är de som var kända vid beslutet', () => {
  const dygn = [];
  for (let i = 0; i < 30; i++) dygn.push({ kampanj_id: 'K', datum: plusDagar('2026-09-01', i), spend: 1000, kop: 10, intakt: i < 20 ? 3000 : 1200 });
  const logg = [
    { datum: '2026-09-21', kampanj_id: 'K', ad_account_id: SE, kod: 'SKALA', genomford: true, roas_3d: 3, kop_3d: 30, gammal_budget: 1000, break_even: 1.5, motivering: '… 4 dygn i rad över target …' },
    { datum: '2026-09-21', kampanj_id: 'K', ad_account_id: SE, kod: 'LAT_VARA', genomford: false, roas_3d: 3, kop_3d: 30, break_even: 1.5 },
    { datum: '2026-09-28', kampanj_id: 'K', ad_account_id: SE, kod: 'SKALA', genomford: true, roas_3d: 3, kop_3d: 30, gammal_budget: 1200, break_even: 1.5 },
    { datum: '2026-09-12', kampanj_id: 'K', ad_account_id: SE, kod: 'SANK', genomford: true, roas_3d: 1, kop_3d: 9, gammal_budget: 1500, break_even: 1.5 },
  ];
  const ut = gissningar(logg, { SE: byggSerie(dygn) }, { until: '2026-09-30' });
  const hoj = ut.filter((x) => x.beslut === 'HOJ');
  assert.equal(hoj.length, 1, '09-28 har inte mognat; hållbeslutet samma dygn som höjningen räknas inte');
  assert.equal(hoj[0].utfall, 'FEL', 'ROAS 1,2 efteråt mot break-even 1,5');
  assert.equal(hoj[0].drag.over_target, '3 eller fler', 'ur motiveringen: 4 dygn i rad');
  assert.equal(hoj[0].drag.andring, 'sänkning', 'motorn sänkte 09-12, veckan innan');
  assert.equal(andringFor(logg, 'K', '2026-09-30'), 'höjning');
});

test('krympningen: två–tre missar i ett läge som brukar fungera blir aldrig en varning', () => {
  const rader = [];
  for (let i = 0; i < 60; i++) rader.push(g(i));
  // Läget "kop under 10": 3 fall, alla fel.
  for (let i = 0; i < 3; i++) rader.push(g(100 + i, { utfall: 'FEL', kampanj_id: `X${i}`, drag: { ...g(0).drag, kop: 'under 10' } }));
  const m = monster(rader, { idag: '2026-09-30' });
  assert.equal(m.monster.filter((x) => x.typ === 'miss').length, 0, `under ${MIN_FALL} fall listas inget`);
});

test('ett läge som går fel om och om igen, på många kampanjer, blir en återkommande miss — med text utan förbud', () => {
  const rader = [];
  for (let i = 0; i < 60; i++) rader.push(g(i));
  for (let i = 0; i < 10; i++) rader.push(g(200 + i, { utfall: i < 8 ? 'FEL' : 'RATT', kampanj_id: `Y${i}`, drag: { ...g(0).drag, lage: '1,6–2,0 × BE' } }));
  const m = monster(rader, { idag: '2026-09-30' });
  const miss = m.monster.find((x) => x.typ === 'miss' && x.villkor.lage === '1,6–2,0 × BE');
  assert.ok(miss, JSON.stringify(m.monster.map((x) => [x.typ, x.villkor])));
  assert.equal(miss.ratt, 2);
  assert.equal(miss.fall, 10);
  const txt = monsterText(miss);
  assert.match(txt, /gick med vinst de tre dygnen efter 2 av 10 gånger/);
  assert.match(txt, /inget förbud/);
  assert.doesNotMatch(txt, /förbjud|aldrig höj|stoppa/i);
});

test('glömskan: samma missar för länge sedan väger mindre än samma missar i dag', () => {
  const bas = Array.from({ length: 60 }, (_, i) => g(i));
  const miss = (datum) => Array.from({ length: 8 }, (_, i) => g(300 + i, { utfall: 'FEL', kampanj_id: `Z${i}`, datum, nyckel: `HOJ|Z${i}|${datum}`, drag: { ...g(0).drag, budget: '≥4 000' } }));
  const nu = monster([...bas, ...miss('2026-09-28')], { idag: '2026-09-30' }).monster.find((x) => x.villkor.budget === '≥4 000' && Object.keys(x.villkor).length === 1);
  const forr = monster([...bas, ...miss('2026-06-01')], { idag: '2026-09-30' }).monster.find((x) => x.villkor.budget === '≥4 000' && Object.keys(x.villkor).length === 1);
  assert.ok(nu && nu.typ === 'miss');
  assert.ok(!forr || forr.andel > nu.andel, 'fyra månader gamla missar drar mindre');
});

test('noten bredvid dagens beslut ändrar aldrig domen, och planen är densamma med och utan mönster', () => {
  const rader = [];
  for (let i = 0; i < 60; i++) rader.push(g(i));
  for (let i = 0; i < 10; i++) rader.push(g(200 + i, { utfall: i < 8 ? 'FEL' : 'RATT', kampanj_id: `Y${i}`, drag: { ...g(0).drag, lage: '1,6–2,0 × BE' } }));
  const minne = monster(rader, { idag: '2026-09-30' });
  const rad = () => ({ id: 'Q', namn: 'Q | BE ROAS 1.5', budget: 1500, roas3d: 2.6, kop3d: 40, dagarOverTarget: 3, dom: { kod: 'SKALA', rubrik: 'Skala', motivering: 'm', nyBudget: 1800, kraverGodkannande: true, naraGrans: false, breakEven: 1.5 } });
  const r = rad();
  const fore = JSON.stringify(r.dom);
  const not = monsterNot(minne, r, { logg: [], idag: '2026-10-01', marknad: 'SE' });
  assert.equal(JSON.stringify(r.dom), fore);
  assert.match(not.text, /^Mönster: Höjning när ROAS mot break-even 1,6–2,0 × BE/);
  const med = rad(); med.dom.monster = not;
  assert.deepEqual(planera([med], { logg: [], idag: '2026-10-01' }), planera([rad()], { logg: [], idag: '2026-10-01' }));
  assert.equal(monsterNot(minne, { ...rad(), roas3d: 4 }, { idag: '2026-10-01', marknad: 'SE' }), null, 'annat läge ⇒ ingen not');
});

test('slumpnivån: med helt slumpade utfall hittas nästan inga mönster', () => {
  let a = 1; const r = () => { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return a / 4294967296; };
  const lagen = ['1,0–1,3 × BE', '1,3–1,6 × BE', '1,6–2,0 × BE', '2,0–3,0 × BE'];
  const rader = Array.from({ length: 120 }, (_, i) => g(i, { kampanj_id: `K${i % 20}`, utfall: r() < 0.75 ? 'RATT' : 'FEL', drag: { ...g(0).drag, lage: lagen[i % 4], kop: i % 3 ? '10–29' : '30 eller fler' } }));
  const sl = slumpniva(rader, { idag: '2026-09-30', omblandningar: 30 });
  assert.ok(sl.miss < 1.5 && sl.styrka < 1.5, JSON.stringify(sl));
});
