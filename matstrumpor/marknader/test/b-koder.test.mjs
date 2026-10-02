// Tester för b-koder.mjs — utan nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beloppPerVara, gavanGratis } from '../b-koder.mjs';

test('B-paketen: rabatten per vara ger paketets pris och gratis ätpinnar', () => {
  // Uppmätt 2026-10-02: lådan 399 kr, ätpinnarna 50 kr, paketen 499 och 799 kr.
  assert.deepEqual(beloppPerVara({ antal: '2', fastpris: '499.0', ladaPris: '399.00', gavaPris: '50.00' }), { belopp: 149.5, perLada: 249.5 });
  assert.deepEqual(beloppPerVara({ antal: '4', fastpris: '799.0', ladaPris: '399.00', gavaPris: '50.00' }), { belopp: 199.25, perLada: 199.75 });
  // Summan blir exakt fastpriset, i hela ören.
  for (const [antal, fastpris] of [[2, 499], [4, 799]]) {
    const { perLada } = beloppPerVara({ antal, fastpris, ladaPris: 399, gavaPris: 50 });
    assert.equal(Math.round(perLada * 100) * antal, fastpris * 100);
  }
});

test('B-paketen: stoppar hellre än att räkna fel', () => {
  // En gåva dyrare än rabatten per vara hade inte blivit gratis.
  assert.throws(() => beloppPerVara({ antal: 2, fastpris: 700, ladaPris: 399, gavaPris: 50 }), /gåvan kostar 50/);
  // Ett fastpris som inte är lägre än lådorna är ingen rabatt.
  assert.throws(() => beloppPerVara({ antal: 2, fastpris: 798, ladaPris: 399, gavaPris: 0 }), /inte lägre/);
  // En rabatt som inte går att dela i hela ören.
  assert.throws(() => beloppPerVara({ antal: 3, fastpris: 1000, ladaPris: 399, gavaPris: 50 }), /hela ören/);
});

const GAVA = 'gid://shopify/Product/10408204468563';
const LADA = 'gid://shopify/Product/10286130889043';

test('gåvan gratis: köp X, få Y med gåvan bland "få"-varorna och 100 %', () => {
  const bxgy = (procent, produkter = [LADA, GAVA]) => ({
    __typename: 'DiscountCodeBxgy',
    customerGets: { value: { effect: { __typename: 'DiscountPercentage', percentage: procent } }, items: { products: { nodes: produkter.map((id) => ({ id })) } } },
  });
  assert.equal(gavanGratis(bxgy(1), { gavaProdukt: GAVA, gavaPris: '50.00' }).ok, true);
  assert.equal(gavanGratis(bxgy(0.5), { gavaProdukt: GAVA, gavaPris: '50.00' }).ok, false);
  assert.equal(gavanGratis(bxgy(1, [LADA]), { gavaProdukt: GAVA, gavaPris: '50.00' }).ok, false);
});

test('gåvan gratis: ett belopp en gång per order sprids på raderna (S-025), ett belopp per vara gör det inte', () => {
  const basic = (amount, appliesOnEachItem) => ({
    __typename: 'DiscountCodeBasic',
    customerGets: {
      value: { __typename: 'DiscountAmount', amount: { amount }, appliesOnEachItem },
      items: { productVariants: { nodes: [{ product: { id: LADA } }, { product: { id: GAVA } }] } },
    },
  });
  const fore = gavanGratis(basic('399.0', false), { gavaProdukt: GAVA, gavaPris: '50.00' });
  assert.equal(fore.ok, false);
  assert.match(fore.orsak, /en gång per order/);
  assert.equal(gavanGratis(basic('149.5', true), { gavaProdukt: GAVA, gavaPris: '50.00' }).ok, true);
  assert.equal(gavanGratis(basic('40.0', true), { gavaProdukt: GAVA, gavaPris: '50.00' }).ok, false);
  assert.equal(gavanGratis(null, { gavaProdukt: GAVA, gavaPris: '50.00' }).ok, false);
});
