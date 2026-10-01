import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rangordna } from '../inkopsvarde.mjs';

test('inköpsvärdet rangordnas i kronor, varianter matchas och saknad kostnad räknas för sig', () => {
  const kostnader = new Map([['taköverdrag|6,5 m', 400], ['taköverdrag|8 m', 500], ['tratt|', 60]]);
  const r = rangordna([
    { produkt: 'Taköverdrag', variant: '6,5 m', enheter: 10 },
    { produkt: 'Taköverdrag', variant: '8 m', enheter: 2 },
    { produkt: 'Tratt', variant: 'Default Title', enheter: 5 },
    { produkt: 'Okänd', variant: '', enheter: 3 },
  ], kostnader, { kurs: 1 });
  assert.equal(r.lista[0].produkt, 'Taköverdrag');
  assert.equal(r.lista[0].inkop, 10 * 400 + 2 * 500);
  assert.equal(r.lista[1].inkop, 300);
  assert.equal(r.utanKostnad, 3);
  assert.equal(r.total, 5300);
  assert.equal(r.lista[1].kumulativ, 1);
});

test('kursen räknar om en butik i annan valuta', () => {
  const r = rangordna([{ produkt: 'A', variant: '', enheter: 2 }], new Map([['a|', 10]]), { kurs: 1.04 });
  assert.equal(r.total, 20.8);
});
