// Rutinvakten: dömer spåren mot schemat utan att röra git.
// "En rutin som bara finns i dokumentationen ser precis ut som en som
// fungerar, ända tills någon läser loggarna" (CLAUDE.md). Det här är läsaren.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bedomRutin, intervall, nastaKorning, schematext } from '../kallor/rutiner.mjs';

const NU = new Date('2026-09-22T08:00:00Z'); // 10:00 svensk tid

const timrutin = { id: 'sp', namn: 'Spårningen', schema: { typ: 'timme', minut: 16 }, spar: { typ: 'git', monster: '^sparning:' } };
const dagrutin = { id: 'nv', namn: 'Nattvakten', schema: { typ: 'dag', tid: '00:41' }, spar: { typ: 'git', monster: '^Nattvakten' } };

test('intervallen', () => {
  assert.equal(intervall({ typ: 'timme' }), 3_600_000);
  assert.equal(intervall({ typ: 'dag' }), 86_400_000);
  assert.equal(intervall({ typ: 'vecka', veckodagar: [1, 4] }), 3.5 * 86_400_000);
});

test('ok, sen och saknas efter ålder på senaste spåret', () => {
  const spar = (minSedan) => [{ tid: new Date(NU.getTime() - minSedan * 60_000).toISOString(), rubrik: 'sparning: runda' }];
  assert.equal(bedomRutin(timrutin, spar(40), { nu: NU }).status, 'ok');
  assert.equal(bedomRutin(timrutin, spar(120), { nu: NU }).status, 'sen');
  assert.equal(bedomRutin(timrutin, spar(400), { nu: NU }).status, 'saknas');
  const inget = bedomRutin(timrutin, [{ tid: NU.toISOString(), rubrik: 'något annat' }], { nu: NU });
  assert.equal(inget.status, 'saknas');
  assert.match(inget.ord, /inget spår/);
});

test('mönstret matchar bara rätt rubriker och räknar antalet', () => {
  const spar = [
    { tid: '2026-09-22T07:50:00Z', rubrik: 'Nattvakten DryTrek 2026-09-22, körning nr 11' },
    { tid: '2026-09-21T22:21:00Z', rubrik: 'Nattvakten DryTrek 2026-09-21' },
    { tid: '2026-09-21T20:00:00Z', rubrik: 'sparning: runda' },
  ];
  const d = bedomRutin(dagrutin, spar, { nu: NU });
  assert.equal(d.status, 'ok');
  assert.equal(d.antal, 2);
  assert.equal(d.senast, '2026-09-22T07:50:00Z');
});

test('avstängd rutin utan spår är avstängd — men ett färskt spår vinner över flaggan', () => {
  const av = { ...dagrutin, avstangd: true, avstangd_orsak: 'Axels beslut' };
  assert.equal(bedomRutin(av, [], { nu: NU }).status, 'avstangd');
  const korde = bedomRutin(av, [{ tid: '2026-09-22T07:00:00Z', rubrik: 'Nattvakten x' }], { nu: NU });
  assert.equal(korde.status, 'ok');
  assert.match(korde.ord, /flaggan är gammal/);
});

test('en nybyggd rutin utan spår är "ny", inte "saknas" — tills första intervallet gått', () => {
  const ny = { ...timrutin, fran: new Date(NU.getTime() - 20 * 60_000).toISOString() };
  assert.equal(bedomRutin(ny, [], { nu: NU }).status, 'ny');
  const gammal = { ...timrutin, fran: new Date(NU.getTime() - 3 * 3_600_000).toISOString() };
  assert.equal(bedomRutin(gammal, [], { nu: NU }).status, 'saknas', 'efter 1,5 intervall gäller vanliga regler');
});

test('omätbar rutin säger varför', () => {
  const r = bedomRutin({ id: 't', namn: 'Tvistkollen', schema: { typ: 'dag', tid: '07:30' }, spar: { typ: 'ingen', orsak: 'pushar aldrig' } }, [], { nu: NU });
  assert.equal(r.status, 'omatbar');
  assert.equal(r.ord, 'pushar aldrig');
});

test('sökvägsspår döms på tiden som skickas in', () => {
  const r = { id: 'k', namn: 'Kundtjänst', schema: { typ: 'vecka', tid: '07:00', veckodagar: [1] }, spar: { typ: 'sokvag', sokvag: 'kundtjanst/korningar' } };
  assert.equal(bedomRutin(r, [], { nu: NU, sokvagTid: '2026-09-21T05:10:00Z' }).status, 'ok');
  assert.equal(bedomRutin(r, [], { nu: NU, sokvagTid: '2026-09-01T05:10:00Z' }).status, 'saknas');
  assert.equal(bedomRutin(r, [], { nu: NU, sokvagTid: null }).status, 'saknas');
});

test('nästa körning räknas i svensk tid', () => {
  // 10:00 svensk tid; 00:41 är i natt = 22:41 UTC i dag (CEST)
  assert.equal(nastaKorning({ typ: 'dag', tid: '00:41' }, { nu: NU }), '2026-09-22T22:41:00.000Z');
  // 13:20 svensk tid i dag = 11:20 UTC
  assert.equal(nastaKorning({ typ: 'dag', tid: '13:20' }, { nu: NU }), '2026-09-22T11:20:00.000Z');
  // varje timme :16 ⇒ 08:16 UTC
  assert.equal(nastaKorning({ typ: 'timme', minut: 16 }, { nu: NU }), '2026-09-22T08:16:00.000Z');
  // måndag + torsdag 07:00: tisdag ⇒ torsdag 24/9 07:00 = 05:00 UTC
  assert.equal(nastaKorning({ typ: 'vecka', tid: '07:00', veckodagar: [1, 4] }, { nu: NU }), '2026-09-24T05:00:00.000Z');
  assert.equal(schematext({ typ: 'vecka', tid: '07:00', veckodagar: [1, 4] }), '07:00 mån + tors');
});

test('rutiner.json är läsbar och varje mönster är ett giltigt regex', () => {
  const { rutiner } = JSON.parse(readFileSync(new URL('../rutiner.json', import.meta.url), 'utf8'));
  assert.ok(rutiner.length >= 30);
  const ids = new Set();
  for (const r of rutiner) {
    assert.ok(!ids.has(r.id), `dubblett: ${r.id}`);
    ids.add(r.id);
    assert.ok(r.brand, `${r.id} saknar brand`);
    if (r.spar?.typ === 'git') assert.doesNotThrow(() => new RegExp(r.spar.monster), `${r.id}: ogiltigt mönster`);
  }
  // Varumärkesregistret pekar bara på rutiner som finns.
  const { varumarken } = JSON.parse(readFileSync(new URL('../varumarken.json', import.meta.url), 'utf8'));
  for (const vm of varumarken) for (const id of vm.rutiner ?? []) assert.ok(ids.has(id), `${vm.id} pekar på okänd rutin ${id}`);
});
