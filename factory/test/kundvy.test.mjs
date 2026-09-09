// Tester för kundvy-kontrollen (Axels bakläxa 2026-09-09, DryTrek).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kontrolleraKundvy, rapport } from '../kundvy.mjs';

const BUTIK = { butik: { brand: 'DryTrek' } };
const PRODUKT = { produkt: { namn: 'Damasker Vandring' } };

const FARDIG = `
  <img class="header__heading-logo" src="https://cdn.shopify.com/s/files/1/logo.png">
  <h1>DryTrek</h1>
  <h2>Damasker Vandring</h2>
  <img src="https://cdn.shopify.com/s/files/1/damask.jpg">
  <button>Köp för 389 kr</button>`;

test('en färdig startsida är grön', () => {
  assert.equal(kontrolleraKundvy(FARDIG, BUTIK, PRODUKT).gron, true);
});

test('My Store fångas', () => {
  const r = kontrolleraKundvy(`${FARDIG}<title>My Store 3</title>`, BUTIK, PRODUKT);
  assert.equal(r.gron, false);
  assert.ok(r.fel.some((f) => f.includes('My Store')));
});

test('Shopifys placeholder-hero fångas', () => {
  const r = kontrolleraKundvy(`${FARDIG}<img src="/files/hero-apparel-1.jpg">`, BUTIK, PRODUKT);
  assert.ok(r.fel.some((f) => f.includes('placeholder-illustration')));
});

test('Dawns default-meny fångas', () => {
  const r = kontrolleraKundvy(`${FARDIG}<a> Catalog </a>`, BUTIK, PRODUKT);
  assert.ok(r.fel.some((f) => f.includes('Dawns default')));
});

test('saknad logga fångas', () => {
  const utan = FARDIG.replace(/<img class="header__heading-logo"[^>]*>/, '');
  const r = kontrolleraKundvy(utan, BUTIK, PRODUKT);
  assert.ok(r.fel.some((f) => f.includes('ingen logga')));
});

test('saknad produktbild fångas', () => {
  const r = kontrolleraKundvy('<img class="header__heading-logo" src="x"><h1>DryTrek</h1><h2>Damasker Vandring</h2><button>Köp</button>', BUTIK, PRODUKT);
  assert.ok(r.fel.some((f) => f.includes('produktbild')));
});

test('exempelprodukt fångas', () => {
  const r = kontrolleraKundvy(`${FARDIG}<h2>Exempel på produktnamn</h2>`, BUTIK, PRODUKT);
  assert.ok(r.fel.some((f) => f.includes('exempelprodukt')));
});

test('rapporten säger att butiken inte får annonser', () => {
  const r = rapport(kontrolleraKundvy('<html></html>', BUTIK, PRODUKT));
  assert.ok(r.includes('får INTE annonser'));
});
