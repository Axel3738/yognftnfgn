// Blockerade prefix i leveransrundans kampanjuppslag (products/prefix-alias.json
// → `blockerade`). 2026-09-29: hubben Fish rod holder flyttades från TackleBay
// till Bäverbutiken, och elva gamla `TackleBayRod_`-rader med tacklebay.se som
// landningssida låg kvar i "To be Reviewed". De får aldrig kopplas till
// Bäverbutikens Fiskespöhållaren-kampanj, inte ens om kontot en dag bär prefixet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { kampanjForPrefix } from '../lib/kampanjval.mjs';

const FISK = { id: '120249850522830291', name: 'Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18', status: 'ACTIVE' };
const blockerade = { tacklebayrod: { orsak: 'TackleBays gamla annonser' } };

test('ett blockerat prefix får ingen kampanj, även när kontot har en', () => {
  const r = kampanjForPrefix('tacklebayrod', { karta: { tacklebayrod: FISK }, blockerade });
  assert.equal(r.kampanj, null);
  assert.equal(r.kalla, 'blockerad');
  assert.match(r.blockerad, /TackleBay/);
});

test('ett blockerat prefix vinner även över ett alias', () => {
  const alias = { tacklebayrod: { kampanj_id: FISK.id, kampanj_namn: FISK.name } };
  assert.equal(kampanjForPrefix('tacklebayrod', { alias, blockerade }).kampanj, null);
});

test('Bäverbutikens egna Rodholder_-rader går som förut, ur kontot', () => {
  const r = kampanjForPrefix('rodholder', { karta: { rodholder: FISK }, blockerade });
  assert.equal(r.kampanj.id, FISK.id);
  assert.equal(r.kalla, 'kontot');
  assert.equal(r.blockerad, undefined);
});

test('ordningen är oförändrad: products.json, kontot, alias, annars ingen kampanj', () => {
  const konfig = { enginecover: { id: 'motorholjet', campaign_ids: ['K1'] } };
  assert.equal(kampanjForPrefix('enginecover', { konfig, karta: { enginecover: FISK } }).kalla, 'products.json');
  const alias = { beltgrinder: { kampanj_id: 'B1', kampanj_namn: 'Bälteslipmaskinen' } };
  assert.deepEqual(kampanjForPrefix('beltgrinder', { alias }).kampanj, { id: 'B1', name: 'Bälteslipmaskinen', status: null });
  assert.deepEqual(kampanjForPrefix('okand', {}), { p: null, kampanj: null, kalla: null });
});

test('repots prefix-alias.json blockerar TackleBayRod_', () => {
  const fil = JSON.parse(readFileSync(new URL('../../products/prefix-alias.json', import.meta.url), 'utf8'));
  assert.ok(fil.blockerade?.tacklebayrod?.orsak, 'blockeringen ska stå i filen med orsak');
});
