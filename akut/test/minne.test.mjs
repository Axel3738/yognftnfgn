// Larmets minne: ett larm en gång, ett tillstånd tills det är löst, och
// butikerna i drift som avgör vad som mäts.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { lasMinne, sparaMinne, rensa, redanPostat, olosta, markeraPostat, markeraLost, butikerIDrift, slaIhopButiker, arTillstand, TILLSTAND } from '../minne.mjs';

const NU = new Date('2026-09-27T14:00:00Z');
const larm = (typ, nyckel) => ({ typ, nyckel, verksamhet: 'baverbutiken', rubrik: `r ${nyckel}`, rader: [], gor: [] });

test('tillstånd mot händelse', () => {
  assert.deepEqual([...TILLSTAND], ['butik', 'konto', 'spendcap', 'backend', 'rutin', 'nyckel']);
  assert.ok(arTillstand('butik') && !arTillstand('pengar') && !arTillstand('tvistgrad'));
});

test('tomt minne utan fil, rundtur på disk', () => {
  const rot = mkdtempSync(join(tmpdir(), 'akut-minne-'));
  try {
    assert.deepEqual(lasMinne(rot), { skickade: [], butiker: {}, senasteKorning: null });
    const m = lasMinne(rot);
    markeraPostat(m, larm('butik', 'butik:x'), { nu: NU, text: 'rubrik' });
    m.butiker = { x: { namn: 'X', senastOk: NU.toISOString(), ordrar7d: 3 } };
    m.senasteKorning = NU.toISOString();
    const fil = sparaMinne(m, rot);
    assert.ok(existsSync(fil) && fil.endsWith('akut/data/larm.json'));
    const igen = lasMinne(rot);
    assert.equal(igen.skickade.length, 1);
    assert.equal(igen.skickade[0].lost, null);
    assert.equal(igen.butiker.x.ordrar7d, 3);
    assert.equal(igen.senasteKorning, NU.toISOString());
  } finally { rmSync(rot, { recursive: true, force: true }); }
});

test('redanPostat: en händelse blockeras av sin nyckel, ett tillstånd bara medan det är olöst — och markeraPostat dubblerar aldrig', () => {
  const m = { skickade: [], butiker: {} };
  markeraPostat(m, larm('pengar', 'pengar:1:a:2026-09-27'), { nu: NU });
  markeraPostat(m, larm('butik', 'butik:x'), { nu: NU });
  markeraPostat(m, larm('butik', 'butik:x'), { nu: NU });
  assert.equal(m.skickade.length, 2);
  assert.ok(redanPostat(m.skickade, larm('pengar', 'pengar:1:a:2026-09-27')));
  assert.ok(!redanPostat(m.skickade, larm('pengar', 'pengar:1:a:2026-09-28')));
  assert.ok(redanPostat(m.skickade, larm('butik', 'butik:x')));
  assert.deepEqual(olosta(m.skickade).map((s) => s.nyckel), ['butik:x']);
  markeraLost(m, 'butik:x', { nu: NU });
  assert.ok(!redanPostat(m.skickade, larm('butik', 'butik:x')), 'löst ⇒ kan larma igen');
  assert.deepEqual(olosta(m.skickade), []);
  markeraPostat(m, larm('butik', 'butik:x'), { nu: NU });
  assert.equal(m.skickade.length, 3, 'nytt tillstånd efter det lösta');
});

test('rensa: gamla händelser och gamla lösta tillstånd glöms, ett olöst tillstånd aldrig', () => {
  const gammal = new Date(NU.getTime() - 40 * 86_400_000).toISOString();
  const skickade = [
    { typ: 'pengar', nyckel: 'p', tid: gammal, lost: null },
    { typ: 'butik', nyckel: 'b-olost', tid: gammal, lost: null },
    { typ: 'butik', nyckel: 'b-lost-gammal', tid: gammal, lost: gammal },
    { typ: 'butik', nyckel: 'b-lost-ny', tid: gammal, lost: NU.toISOString() },
    { typ: 'pengar', nyckel: 'p-ny', tid: NU.toISOString(), lost: null },
  ];
  assert.deepEqual(rensa(skickade, { nu: NU, dagar: 30 }).map((s) => s.nyckel), ['b-olost', 'b-lost-ny', 'p-ny']);
});

test('butikerIDrift: ordrar de senaste sju dygnen, bara lästa butiker; slaIhopButiker glömmer gamla', () => {
  const butiker = [
    { id: 'a', namn: 'A', url: 'https://a.se', shop: 'a.myshopify.com', status: 'ok', dagar: [{ datum: '2026-09-10', ordrar: 50 }, { datum: '2026-09-26', ordrar: 2 }] },
    { id: 'b', namn: 'B', url: 'https://b.se', status: 'ok', dagar: [{ datum: '2026-09-10', ordrar: 50 }] },
    { id: 'c', namn: 'C', url: 'https://c.se', status: 'fel', dagar: [] },
    { id: 'd', namn: 'D', url: 'https://d.se', status: 'av', dagar: [] },
  ];
  const drift = butikerIDrift(butiker, { byggd: '2026-09-27T13:00:00Z', nu: NU });
  assert.deepEqual(Object.keys(drift), ['a']);
  assert.equal(drift.a.ordrar7d, 2);
  assert.equal(drift.a.senastOk, '2026-09-27T13:00:00Z');
  const ihop = slaIhopButiker({ a: { namn: 'A gammal', senastOk: '2026-09-20T00:00:00Z' }, z: { namn: 'Z', senastOk: '2026-09-01T00:00:00Z' } }, drift, { nu: NU, dagar: 14 });
  assert.deepEqual(Object.keys(ihop), ['a']);
  assert.equal(ihop.a.namn, 'A', 'snapshotens rad vinner');
});
