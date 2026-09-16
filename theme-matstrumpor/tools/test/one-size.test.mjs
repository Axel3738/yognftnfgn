import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ALTERNATIV, VÄRDE, FRÅGA_EN, MUTATION_DÖP_OM, MUTATION_LÄGG_TILL,
  harOneSize, planera, utför, variabler, ärStrumpa,
} from '../one-size-plan.mjs';

// Produkterna som de såg ut i butiken 2026-09-16 (läst ur /products.json).
const sushi = () => ({
  id: 'gid://shopify/Product/10286130889043', title: 'Sushi-Strumpor', isGiftCard: false,
  options: [{ id: 'gid://shopify/ProductOption/1', name: 'Par', position: 1, values: ['5 - Par', '3 - Par'],
    optionValues: [{ id: 'gid://shopify/ProductOptionValue/11', name: '5 - Par' }, { id: 'gid://shopify/ProductOptionValue/12', name: '3 - Par' }] }],
  variants: { nodes: [
    { id: 'gid://shopify/ProductVariant/52506473365843', title: '5 - Par', selectedOptions: [{ name: 'Par', value: '5 - Par' }] },
    { id: 'gid://shopify/ProductVariant/52506473398611', title: '3 - Par', selectedOptions: [{ name: 'Par', value: '3 - Par' }] },
  ] },
});
const pizza = () => ({
  id: 'gid://shopify/Product/10314752852307', title: 'Pizza-Strumpor', isGiftCard: false,
  options: [{ id: 'gid://shopify/ProductOption/2', name: 'Title', position: 1, values: ['Default Title'],
    optionValues: [{ id: 'gid://shopify/ProductOptionValue/21', name: 'Default Title' }] }],
  variants: { nodes: [{ id: 'gid://shopify/ProductVariant/52579705225555', title: 'Default Title', selectedOptions: [{ name: 'Title', value: 'Default Title' }] }] },
});
const presentkort = () => ({
  id: 'gid://shopify/Product/10286156513619', title: 'Presentkort', isGiftCard: true,
  options: [{ id: 'gid://shopify/ProductOption/3', name: 'Valörer', values: ['150,00 kr'], optionValues: [{ id: 'v', name: '150,00 kr' }] }],
  variants: { nodes: [{ id: 'x', title: '150,00 kr', selectedOptions: [{ name: 'Valörer', value: '150,00 kr' }] }] },
});
const atpinnar = () => ({
  id: 'gid://shopify/Product/10408204468563', title: 'Äkta ätpinnar i trä', isGiftCard: false,
  options: [{ id: 'o', name: 'Title', values: ['Default Title'], optionValues: [{ id: 'ov', name: 'Default Title' }] }],
  variants: { nodes: [{ id: 'x', title: 'Default Title', selectedOptions: [{ name: 'Title', value: 'Default Title' }] }] },
});

// Så ser sushin ut när Shopify lagt till alternativet.
const sushiEfter = () => {
  const p = sushi();
  p.options.push({ id: 'gid://shopify/ProductOption/9', name: ALTERNATIV, position: 2, values: [VÄRDE], optionValues: [{ id: 'q', name: VÄRDE }] });
  for (const v of p.variants.nodes) {
    v.title += ` / ${VÄRDE}`;
    v.selectedOptions.push({ name: ALTERNATIV, value: VÄRDE });
  }
  return p;
};
const pizzaEfter = () => ({
  ...pizza(),
  options: [{ id: 'gid://shopify/ProductOption/2', name: ALTERNATIV, position: 1, values: [VÄRDE], optionValues: [{ id: 'gid://shopify/ProductOptionValue/21', name: VÄRDE }] }],
  variants: { nodes: [{ id: 'gid://shopify/ProductVariant/52579705225555', title: VÄRDE, selectedOptions: [{ name: ALTERNATIV, value: VÄRDE }] }] },
});

test('bara strumpor räknas — inte presentkortet, inte ätpinnarna', () => {
  assert.equal(ärStrumpa(sushi()), true);
  assert.equal(ärStrumpa(pizza()), true);
  assert.equal(ärStrumpa(presentkort()), false);
  assert.equal(ärStrumpa(atpinnar()), false);
  assert.equal(planera(presentkort()).åtgärd, 'hoppa');
  assert.equal(planera(atpinnar()).åtgärd, 'hoppa');
});

test('sushi med Par-alternativ får Storlek som alternativ nummer två', () => {
  const plan = planera(sushi());
  assert.equal(plan.åtgärd, 'lägg-till');
  assert.equal(plan.position, 2);
  assert.deepEqual(variabler(plan), {
    productId: 'gid://shopify/Product/10286130889043',
    options: [{ name: ALTERNATIV, position: 2, values: [{ name: VÄRDE }] }],
  });
});

test('pizza utan alternativ får Title/Default Title omdöpt i stället för ett andra alternativ', () => {
  const plan = planera(pizza());
  assert.equal(plan.åtgärd, 'döp-om');
  assert.deepEqual(variabler(plan), {
    productId: 'gid://shopify/Product/10314752852307',
    option: { id: 'gid://shopify/ProductOption/2', name: ALTERNATIV },
    varden: [{ id: 'gid://shopify/ProductOptionValue/21', name: VÄRDE }],
  });
});

test('en omkörning gör ingenting med strumpor som redan har One Size', () => {
  assert.equal(harOneSize(sushiEfter()), true);
  assert.equal(harOneSize(pizzaEfter()), true);
  assert.equal(planera(sushiEfter()).åtgärd, 'klar');
  assert.equal(planera(pizzaEfter()).åtgärd, 'klar');
});

test('Title som ligger kvar bredvid Storlek räknas inte som klart', () => {
  const p = pizzaEfter();
  p.options.unshift({ id: 't', name: 'Title', values: ['Default Title'], optionValues: [{ id: 'tv', name: 'Default Title' }] });
  assert.equal(harOneSize(p), false);
});

test('ett Storlek-alternativ med andra värden rörs inte — det är ett ägarbeslut', () => {
  const p = sushi();
  p.options.push({ id: 's', name: 'Storlek', values: ['36-40', '41-45'], optionValues: [] });
  const plan = planera(p);
  assert.equal(plan.åtgärd, 'hoppa');
  assert.match(plan.skäl, /36-40/);
});

test('tre alternativ är Shopifys tak — då hoppas produkten över', () => {
  const p = sushi();
  p.options.push({ id: 'a', name: 'Färg', values: ['Röd'], optionValues: [] }, { id: 'b', name: 'Material', values: ['Bomull'], optionValues: [] });
  assert.equal(planera(p).åtgärd, 'hoppa');
});

// En låtsasbutik: svarar på mutationer enligt ett manus och på avläsningen med en given produkt.
function låtsasButik({ svar, efter }) {
  const anrop = [];
  const gql = async (fråga, variabler) => {
    anrop.push({ fråga, variabler });
    if (fråga === FRÅGA_EN) return { product: efter };
    const s = svar.shift() ?? [];
    const nyckel = fråga === MUTATION_DÖP_OM ? 'productOptionUpdate' : 'productOptionsCreate';
    return { [nyckel]: { userErrors: s } };
  };
  return { gql, anrop };
}

test('utför: sushi läggs till, läses tillbaka och godkänns bara om varje variant fick One Size', async () => {
  const butik = låtsasButik({ svar: [[]], efter: sushiEfter() });
  const r = await utför(planera(sushi()), butik.gql);
  assert.equal(r.ok, true);
  assert.equal(butik.anrop[0].fråga, MUTATION_LÄGG_TILL);
  assert.equal(butik.anrop[1].fråga, FRÅGA_EN);
  assert.deepEqual(r.varianter, ['5 - Par / One Size', '3 - Par / One Size']);
  assert.deepEqual(r.alternativ, ['Par: 5 - Par / 3 - Par', 'Storlek: One Size']);
});

test('utför: går omdöpningen inte läggs Storlek till som första alternativ i stället', async () => {
  const butik = låtsasButik({ svar: [[{ code: 'INVALID_NAME', message: 'nope' }], []], efter: pizzaEfter() });
  const r = await utför(planera(pizza()), butik.gql);
  assert.equal(r.ok, true);
  assert.equal(butik.anrop[0].fråga, MUTATION_DÖP_OM);
  assert.equal(butik.anrop[1].fråga, MUTATION_LÄGG_TILL);
  assert.equal(butik.anrop[1].variabler.options[0].position, 1);
  assert.match(r.steg[0], /INVALID_NAME/);
});

test('utför: ett "ok" från Shopify räcker inte — saknas One Size i avläsningen är det ett fel', async () => {
  const butik = låtsasButik({ svar: [[]], efter: sushi() });
  const r = await utför(planera(sushi()), butik.gql);
  assert.equal(r.ok, false);
  assert.match(r.steg.at(-1), /saknas fortfarande/);
});
