// Tester för LAUNCH-verifieringen. Ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from '../yaml.mjs';
import { kontrolleraLaunch } from '../kontroll.mjs';
import { dummy, medButiksfrakt, raprodukt } from './hjalp.mjs';


// En produktfil där allt som krävs för launch är ifyllt.
function launchklarProdukt() {
  const p = dummy();
  p.meta.pixel_id = '111111111111111';
  p.meta.ad_account_id = '915422744950975';
  p.meta.page_id = '222222222222222';
  return p;
}

const SHOP = {
  name: 'Nackmagneten',
  myshopifyDomain: 'nackmagneten.myshopify.com',
  currencyCode: 'SEK',
  primaryDomain: { host: 'nackmagneten.se', sslEnabled: true },
};

const PRODUKT = {
  id: 'gid://shopify/Product/1',
  handle: 'nackmagneten',
  title: 'Nackmagneten',
  status: 'DRAFT',
  media: { nodes: [{ id: 'gid://shopify/MediaImage/1' }] },
  variants: {
    nodes: [
      { id: 'v1', title: 'Grå', price: '399.00', compareAtPrice: '599.00' },
      { id: 'v2', title: 'Svart', price: '399.00', compareAtPrice: '599.00' },
    ],
  },
};

const POLICYER = [
  { type: 'REFUND_POLICY', body: '<p>retur</p>' },
  { type: 'SHIPPING_POLICY', body: '<p>frakt</p>' },
  { type: 'TERMS_OF_SERVICE', body: '<p>villkor</p>' },
  { type: 'PRIVACY_POLICY', body: '<p>integritet</p>' },
];

const namn = (r) => r.kritiska.map((k) => k.namn);

test('allt ifyllt ger grön launch', () => {
  const r = kontrolleraLaunch(launchklarProdukt(), { shop: SHOP, produkt: PRODUKT, policyer: POLICYER });
  assert.equal(r.gron, true, `kritiska: ${JSON.stringify(namn(r))}`);
  assert.ok(r.manuella.length >= 3);
});

test('fel annonskonto stoppar launchen', () => {
  const p = launchklarProdukt();
  p.meta.ad_account_id = '1867947880635861'; // Bäverbutiken — fel verksamhet
  const r = kontrolleraLaunch(p, { shop: SHOP, produkt: PRODUKT, policyer: POLICYER });
  assert.equal(r.gron, false);
  assert.ok(namn(r).includes('tracking'));
});

test('produkt saknas i Shopify stoppar launchen', () => {
  const r = kontrolleraLaunch(launchklarProdukt(), { shop: SHOP, produkt: null, policyer: POLICYER });
  assert.equal(r.gron, false);
  assert.ok(namn(r).includes('produkt'));
});

test('pris i butiken som avviker från filen stoppar launchen', () => {
  const produkt = structuredClone(PRODUKT);
  produkt.variants.nodes[1].price = '349.00';
  const r = kontrolleraLaunch(launchklarProdukt(), { shop: SHOP, produkt, policyer: POLICYER });
  assert.equal(r.gron, false);
  assert.ok(namn(r).includes('priser'));
});

test('fel antal varianter stoppar launchen', () => {
  const produkt = structuredClone(PRODUKT);
  produkt.variants.nodes.pop();
  const r = kontrolleraLaunch(launchklarProdukt(), { shop: SHOP, produkt, policyer: POLICYER });
  assert.ok(namn(r).includes('varianter'));
});

test('produkt utan uppladdad media stoppar launchen', () => {
  const produkt = structuredClone(PRODUKT);
  produkt.media.nodes = [];
  const r = kontrolleraLaunch(launchklarProdukt(), { shop: SHOP, produkt, policyer: POLICYER });
  assert.ok(namn(r).includes('bilder'));
});

test('för få recensioner stoppar launchen', () => {
  const p = launchklarProdukt();
  p.reviews = p.reviews.slice(0, 2);
  const r = kontrolleraLaunch(p, { shop: SHOP, produkt: PRODUKT, policyer: POLICYER });
  assert.ok(namn(r).includes('reviews'));
});

test('saknad pixel stoppar launchen', () => {
  const p = launchklarProdukt();
  p.meta.pixel_id = '';
  const r = kontrolleraLaunch(p, { shop: SHOP, produkt: PRODUKT, policyer: POLICYER });
  assert.ok(namn(r).includes('tracking'));
});

test('myshopify-domän räknas inte som riktig domän', () => {
  const shop = { ...SHOP, primaryDomain: { host: 'nackmagneten.myshopify.com', sslEnabled: true } };
  const r = kontrolleraLaunch(launchklarProdukt(), { shop, produkt: PRODUKT, policyer: POLICYER });
  assert.ok(namn(r).includes('doman'));
});

test('domän utan SSL stoppar launchen', () => {
  const shop = { ...SHOP, primaryDomain: { host: 'nackmagneten.se', sslEnabled: false } };
  const r = kontrolleraLaunch(launchklarProdukt(), { shop, produkt: PRODUKT, policyer: POLICYER });
  assert.ok(namn(r).includes('doman'));
});

test('valuta som inte matchar butiken stoppar launchen', () => {
  const shop = { ...SHOP, currencyCode: 'NOK' };
  const r = kontrolleraLaunch(launchklarProdukt(), { shop, produkt: PRODUKT, policyer: POLICYER });
  assert.ok(namn(r).includes('checkout'));
});

test('saknad frakttid och garanti stoppar launchen', () => {
  const p = launchklarProdukt();
  p.shipping.tid = '';
  p.garantier = [];
  const r = kontrolleraLaunch(p, { shop: SHOP, produkt: PRODUKT, policyer: POLICYER });
  assert.ok(namn(r).includes('frakt'));
  assert.ok(namn(r).includes('guarantee'));
});

test('theme är alltid en manuell punkt', () => {
  const r = kontrolleraLaunch(launchklarProdukt(), { shop: SHOP, produkt: PRODUKT, policyer: POLICYER });
  assert.ok(r.manuella.some((m) => m.namn === 'theme'));
});
