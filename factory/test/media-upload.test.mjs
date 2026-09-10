// Tester för medianamnen i det GEMENSAMMA OPS-annonskontot.
// Kör: node --test factory/test/*.test.mjs
//
// Varför de finns: alla OPS-butiker laddar upp media i samma konto
// (MagiBorsten DK 915422744950975, Axels beslut 2026-09-07). Prefixet stod
// hårdkodat som `DRYTREK_` fram till 2026-09-09 — nästa butiks filer hade
// alltså fått DryTreks namn, och biblioteket gått att skära per butik bara
// för den första butiken som råkade byggas.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brandprefixAv } from '../media-upload.mjs';

test('prefixet kommer ur butikens brand, inte ur modulen', () => {
  assert.equal(brandprefixAv({ brand: { namn: 'TankGuard' } }), 'TANKGUARD');
  assert.equal(brandprefixAv({ brand: { namn: 'DryTrek' } }), 'DRYTREK');
  assert.equal(brandprefixAv({ brand: { namn: 'HeimGuard' } }), 'HEIMGUARD');
});

test('å, ä och ö skrivs om — kampanj- och medianamn bär dem aldrig', () => {
  // Namnregeln (CLAUDE.md): funkar på svenska OCH engelska, aldrig å/ä/ö.
  assert.equal(brandprefixAv({ brand: { namn: 'Bäverbutiken' } }), 'BAVERBUTIKEN');
  assert.equal(brandprefixAv({ brand: { namn: 'Sjöhästen' } }), 'SJOHASTEN');
});

test('mellanslag och tecken faller bort, versaler kvar', () => {
  assert.equal(brandprefixAv({ brand: { namn: 'Tackle Bay' } }), 'TACKLEBAY');
  assert.equal(brandprefixAv({ brand: { namn: 'Heim-Guard 2' } }), 'HEIMGUARD2');
});

test('creative_prefix är reserv när brand saknas', () => {
  assert.equal(brandprefixAv({ creative_prefix: 'TackleBayRod' }), 'TACKLEBAYROD');
});

test('utan brand OCH utan prefix kastar den — den gissar aldrig', () => {
  // Ett gissat prefix hade blandat två butikers media i samma konto.
  assert.throws(() => brandprefixAv({}), /saknar brand\.namn och creative_prefix/);
});

test('två butiker får aldrig samma prefix', () => {
  const a = brandprefixAv({ brand: { namn: 'TankGuard' } });
  const b = brandprefixAv({ brand: { namn: 'DryTrek' } });
  assert.notEqual(a, b);
});
