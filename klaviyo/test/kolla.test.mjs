// klaviyo/kolla.mjs: inventeringen och provmätningarna. Falsk Klaviyo, inget nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KlaviyoKlient } from '../klient.mjs';
import { kolla } from '../kolla.mjs';
import { ORDER_PRODUKTFALT } from '../ladda-upp.mjs';
import { falskKlaviyo } from './falsk.mjs';
import { BRAND } from './hjalp.mjs';

test('kolla --prov listar Placed Orders egenskaper (fältet produkt_innehaller filtrerar på)', async () => {
  const f = falskKlaviyo();
  const k = new KlaviyoKlient({ nyckel: 'pk_test', fetchFn: f.fetchFn, paus: 0, sov: async () => {} });
  const { lage } = await kolla({ brand: BRAND, klient: k, prov: true });
  const po = lage.prov.placed_order_egenskaper;
  assert.ok(Array.isArray(po.egenskaper) && po.egenskaper.length);
  assert.equal(po.ladda_upp_anvander, ORDER_PRODUKTFALT);
  assert.equal(typeof po.produktfalt_finns, 'boolean');
  assert.ok(f.anrop.some((a) => a.sokvag === '/api/metrics/M_PO/metric-properties'));
});

test('kolla varnar när båda kassametrikerna finns', async () => {
  const f = falskKlaviyo({ metriker: [['M_PO', 'Placed Order'], ['M_SC', 'Started Checkout'], ['M_CS', 'Checkout Started'], ['M_VP', 'Viewed Product'], ['M_OP', 'Ordered Product']] });
  const k = new KlaviyoKlient({ nyckel: 'pk_test', fetchFn: f.fetchFn, paus: 0, sov: async () => {} });
  const { varningar } = await kolla({ brand: BRAND, klient: k });
  assert.ok(varningar.some((v) => /Started Checkout", "Checkout Started/.test(v)));
});

test('mätt 2026-09-25: Placed Order-fältet är Items, Ordered Product-fältet är Name, provet klarar additional-fields', async () => {
  const { PRODUKTNAMN_EGENSKAP } = await import('../segment.mjs');
  assert.equal(ORDER_PRODUKTFALT, 'Items');
  assert.equal(PRODUKTNAMN_EGENSKAP, 'Name');
  const f = falskKlaviyo();
  const k = new KlaviyoKlient({ nyckel: 'pk_test', fetchFn: f.fetchFn, paus: 0, sov: async () => {} });
  const { lage } = await kolla({ brand: BRAND, klient: k, prov: true });
  assert.equal(lage.prov.placed_order_egenskaper.fel, undefined);
  assert.equal(lage.prov.placed_order_egenskaper.produktfalt_finns, true);
  assert.equal(lage.prov.ordered_product_egenskaper.produktnamn_finns, true);
});
