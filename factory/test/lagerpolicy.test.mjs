// Tester för lagerpolicyns rena del: planen (vilka varianter avviker) och
// mutationsinputen. Skrivningen och tillbakaläsningen kräver Shopify och
// testas inte här.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planeraLagerpolicy, byggVariantInput } from '../lagerpolicy.mjs';

const ratt = (id) => ({ id, title: id, inventoryPolicy: 'CONTINUE', inventoryItem: { tracked: false } });

test('alla rätt ⇒ ok, inget att ändra', () => {
  const p = planeraLagerpolicy([ratt('v1'), ratt('v2')]);
  assert.equal(p.ok, true);
  assert.deepEqual(p.avvikande, []);
  assert.equal(p.ratt.length, 2);
});

test('DENY, tracked:true och saknat inventoryItem avviker', () => {
  const p = planeraLagerpolicy([
    ratt('v1'),
    { id: 'v2', title: 'DENY', inventoryPolicy: 'DENY', inventoryItem: { tracked: false } },
    { id: 'v3', title: 'tracked', inventoryPolicy: 'CONTINUE', inventoryItem: { tracked: true } },
    { id: 'v4', title: 'utan item', inventoryPolicy: 'CONTINUE' },
  ]);
  assert.equal(p.ok, false);
  assert.deepEqual(p.avvikande.map((v) => v.id), ['v2', 'v3', 'v4']);
});

test('tom eller saknad lista är ok (inget att rätta)', () => {
  assert.equal(planeraLagerpolicy([]).ok, true);
  assert.equal(planeraLagerpolicy(undefined).ok, true);
});

test('mutationsinputen sätter CONTINUE + tracked:false per variant', () => {
  assert.deepEqual(byggVariantInput([{ id: 'v2' }]), [{ id: 'v2', inventoryPolicy: 'CONTINUE', inventoryItem: { tracked: false } }]);
});
