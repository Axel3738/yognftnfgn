// Tester för b-koder.mjs — utan nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beloppPerVara, gavanGratis, gavaPlan } from '../b-koder.mjs';

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

test('en gåva per låda: enlådspaketet i variant B får ätpinnarna och en egen kod (Axel 2026-10-02)', () => {
  // Paketnivåerna som de stod i Shopify 2026-10-02 (ms_paketniva).
  const nivaer = [
    { handle: 'sushi-2', produkt: LADA, ab_variant: 'a', antal: '2', fastpris: '399.0', gratis_produkt: GAVA, gratis_antal: '2', gratis_text: 'Äkta ätpinnar i trä (2 par)', rabattkod: 'SUSHI-K1F1' },
    { handle: 'sushi-paket-1', produkt: LADA, ab_variant: 'paket-b', antal: '1', fastpris: '399.0' },
    { handle: 'sushi-paket-2', produkt: LADA, ab_variant: 'paket-b', antal: '2', fastpris: '499.0', gratis_produkt: GAVA, gratis_antal: '2', gratis_text: 'Äkta ätpinnar i trä (2 par)', rabattkod: 'SUSHI-2FOR499' },
    { handle: 'sushi-paket-4', produkt: LADA, ab_variant: 'paket-b', antal: '4', fastpris: '799.0', gratis_produkt: GAVA, gratis_antal: '4', gratis_text: 'Äkta ätpinnar i trä (4 par)', rabattkod: 'SUSHI-4FOR799' },
  ];
  const plan = gavaPlan(nivaer);
  assert.equal(plan.length, 1);
  assert.deepEqual(plan[0], {
    handle: 'sushi-paket-1', kod: 'SUSHI-1FOR399', nyKod: true,
    falt: { rabattkod: 'SUSHI-1FOR399', gratis_produkt: GAVA, gratis_antal: '1', gratis_text: 'Äkta ätpinnar i trä (1 par)' },
    fore: { rabattkod: null, gratis_produkt: null, gratis_antal: null, gratis_text: null },
  });
  // Syskonet hämtas bara ur samma A/B-variant: utan B-syskon finns inget att utgå från.
  const utanSyskon = gavaPlan([nivaer[0], nivaer[1]]);
  assert.match(utanSyskon[0].fel, /inget syskon/);
  // Alla paket med en gåva per låda: ingen plan.
  assert.deepEqual(gavaPlan([nivaer[0], nivaer[2], nivaer[3]]), []);
});
