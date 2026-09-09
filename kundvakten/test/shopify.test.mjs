import { test } from 'node:test';
import assert from 'node:assert/strict';

import { tolkaVolymrader } from '../shopify.mjs';

// Exakt det API:t svarade 2026-09-09. Kopierat, inte påhittat.
const SVAR = [
  {
    product_title: 'Marin Motorhölje 420D – Universellt Skydd',
    orders: '529',
    net_sales: '175304.46',
    average_order_value: '331.388',
  },
  {
    product_title: 'Fiskespöhållare 4-Pack – Kraftig Förvaring',
    orders: '369',
    net_sales: '148381.6',
    average_order_value: '402.118',
  },
];

test('tolkar ShopifyQL-rader som objekt med kolumnnamn', () => {
  const rader = tolkaVolymrader(SVAR);
  assert.equal(rader[0].produkt, 'Marin Motorhölje 420D – Universellt Skydd');
  assert.equal(rader[0].ordrar, 529);
  assert.equal(rader[0].netto, 175304.46);
  assert.equal(rader[1].ordrar, 369);
});

test('talen kommer som strängar och blir tal', () => {
  const rader = tolkaVolymrader(SVAR);
  assert.equal(typeof rader[0].ordrar, 'number');
  assert.equal(typeof rader[0].aov, 'number');
});

// Regressionsskydd: koden läste först raderna med index (r[0], r[1]). Det gav
// undefined rakt igenom — ordervolym 0 på varje produkt, alltså varje rate
// antingen noll eller oändlig, utan att något kastade ett fel.
test('rader lästa som arrayer skulle ha gett noll — det får inte hända igen', () => {
  const rader = tolkaVolymrader(SVAR);
  assert.notEqual(rader[0].ordrar, 0);
  assert.ok(rader.every((r) => r.produkt !== undefined));
});

test('tom eller saknad tabell ger tom lista i stället för att krascha', () => {
  assert.deepEqual(tolkaVolymrader([]), []);
  assert.deepEqual(tolkaVolymrader(undefined), []);
  assert.deepEqual(tolkaVolymrader(null), []);
});
