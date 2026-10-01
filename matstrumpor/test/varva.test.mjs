// Värva en vän — de rena funktionerna, utan nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  dom, lasMinne, refUr, normAdress, kundnyckel, oppenOrderrabatt, planKod, avvikelserVan,
  visningsbelopp, kreditbelopp, byggData, kortdataJs, korttexterJs, KORTTEXTER, temaskript, laggInILayout, rapportRader,
  lasKonfig, KONFIGFIL, KORTDATA, SPRAKFIL, TEMASKRIPT_KALLA, LAYOUT_MARKOR,
} from '../varva.mjs';

const konfig = {
  kod: 'VAN-TEST01', attribut: 'van', tagg_krediterad: 'varva-krediterad', max_per_varvare: 2,
  van_belopp_sek: 50, minsta_ordervarde_sek: 200, paketkoder_monster: '^(SUSHI|STRUMPOR)-K\\dF\\d',
  valutor: { SEK: { van: 50, kredit: 100 }, NOK: { van: 48, kredit: 100 } },
};
const tomtMinne = () => lasMinne('');

const vanOrder = (over = {}) => ({
  id: 'gid://shopify/Order/200', name: '#5300', createdAt: '2026-10-05T10:00:00Z', cancelledAt: null,
  displayFinancialStatus: 'PAID', displayFulfillmentStatus: 'FULFILLED', tags: [], email: 'van@example.com',
  totalRefundedSet: { shopMoney: { amount: '0.0' } }, shippingAddress: { address1: 'Storgatan 1', zip: '411 01' },
  customer: { id: 'gid://shopify/Customer/20', email: 'van@example.com', orders: { nodes: [{ id: 'gid://shopify/Order/200' }] } },
  ...over,
});
const varvOrder = (over = {}) => ({
  id: 'gid://shopify/Order/100', name: '#5209', createdAt: '2026-10-01T10:00:00Z', cancelledAt: null,
  presentmentCurrencyCode: 'SEK', email: 'kund@example.com', shippingAddress: { address1: 'Lillgatan 9', zip: '12345' },
  customer: { id: 'gid://shopify/Customer/10', email: 'kund@example.com' }, ...over,
});

test('dom: vännens första, betalda, skickade köp ger kredit i värvarens valuta', () => {
  assert.deepEqual(dom({ van: vanOrder(), varvare: varvOrder(), minne: tomtMinne(), konfig }),
    { beslut: 'kreditera', orsak: 'vännens första köp är skickat', belopp: 100, valuta: 'SEK' });
  const no = dom({ van: vanOrder(), varvare: varvOrder({ presentmentCurrencyCode: 'NOK' }), minne: tomtMinne(), konfig });
  assert.equal(no.valuta, 'NOK');
});

test('dom: inte skickad eller inte betald väntar till i morgon', () => {
  assert.equal(dom({ van: vanOrder({ displayFulfillmentStatus: 'UNFULFILLED' }), varvare: varvOrder(), minne: tomtMinne(), konfig }).beslut, 'vanta');
  assert.equal(dom({ van: vanOrder({ displayFinancialStatus: 'PENDING' }), varvare: varvOrder(), minne: tomtMinne(), konfig }).beslut, 'vanta');
});

test('dom: egen länk (samma kund, e-post eller adress) ger aldrig kredit', () => {
  const s = (van, varv = {}) => dom({ van: vanOrder(van), varvare: varvOrder(varv), minne: tomtMinne(), konfig });
  assert.equal(s({ customer: { id: 'gid://shopify/Customer/10', orders: { nodes: [{ id: 'gid://shopify/Order/200' }] } } }).orsak, 'samma kund (egen länk)');
  assert.equal(s({ email: ' KUND@example.com' }).orsak, 'samma e-post (egen länk)');
  assert.equal(s({ shippingAddress: { address1: 'Lillgatan 9', zip: '123 45' } }).orsak, 'samma leveransadress (egen länk)');
});

test('dom: bara vännens FÖRSTA köp, aldrig avbrutet eller återbetalt', () => {
  const s = (van) => dom({ van: vanOrder(van), varvare: varvOrder(), minne: tomtMinne(), konfig });
  assert.equal(s({ customer: { id: 'gid://shopify/Customer/20', orders: { nodes: [{ id: 'gid://shopify/Order/150' }] } } }).orsak, 'inte vännens första köp');
  assert.equal(s({ cancelledAt: '2026-10-06T00:00:00Z' }).beslut, 'nej');
  assert.equal(s({ totalRefundedSet: { shopMoney: { amount: '50.00' } } }).beslut, 'nej');
  assert.equal(s({ createdAt: '2026-09-01T00:00:00Z' }).orsak, 'vännens order är äldre än länken');
});

test('dom: länk utan order, okänd valuta och taket', () => {
  assert.equal(dom({ van: vanOrder(), varvare: null, minne: tomtMinne(), konfig }).beslut, 'nej');
  assert.equal(dom({ van: vanOrder(), varvare: varvOrder({ presentmentCurrencyCode: 'BRL' }), minne: tomtMinne(), konfig }).beslut, 'kolla');
  const nyckel = kundnyckel('gid://shopify/Customer/10');
  const minne = lasMinne([1, 2].map((i) => JSON.stringify({ van_order: `9${i}`, varvare: nyckel, status: 'klar' })).join('\n'));
  assert.match(dom({ van: vanOrder(), varvare: varvOrder(), minne, konfig }).orsak, /taket/);
});

test('dom: aldrig två gånger — klar i minnet, taggad i Shopify, eller påbörjad utan kvitto', () => {
  const klar = lasMinne(JSON.stringify({ van_order: '200', varvare: 'x', status: 'forsok' }) + '\n' + JSON.stringify({ van_order: '200', varvare: 'x', status: 'klar' }));
  assert.equal(dom({ van: vanOrder(), varvare: varvOrder(), minne: klar, konfig }).beslut, 'klar');
  assert.equal(dom({ van: vanOrder({ tags: ['varva-krediterad'] }), varvare: varvOrder(), minne: tomtMinne(), konfig }).beslut, 'klar');
  const halv = lasMinne(JSON.stringify({ van_order: '200', varvare: 'x', status: 'forsok' }));
  assert.equal(dom({ van: vanOrder(), varvare: varvOrder(), minne: halv, konfig }).beslut, 'kolla');
});

test('refUr: bara ett rimligt bekräftelsenummer, versaler', () => {
  assert.equal(refUr([{ key: 'van', value: 'gr85lghyq' }]), 'GR85LGHYQ');
  assert.equal(refUr([{ key: 'van', value: '<script>' }]), null);
  assert.equal(refUr([{ key: 'annat', value: 'GR85LGHYQ' }]), null);
  assert.equal(refUr(null), null);
});

test('normAdress: mellanslag och skiljetecken spelar ingen roll, tomt ger tomt', () => {
  assert.equal(normAdress({ address1: 'Storgatan 1', zip: '411 01' }), normAdress({ address1: 'storgatan 1.', zip: '41101' }));
  assert.equal(normAdress({ address1: '', zip: '41101' }), '');
});

test('oppenOrderrabatt + planKod: paketkoderna öppnas, GLÖMD stängs, vännens kod rörs inte', () => {
  const koder = [
    { id: '1', __typename: 'DiscountCodeBxgy', title: 'Sushi K1F1', status: 'ACTIVE', discountClasses: ['PRODUCT'], codes: { nodes: [{ code: 'SUSHI-K1F1' }] }, combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: false } },
    { id: '2', __typename: 'DiscountCodeBxgy', title: 'Mix', status: 'ACTIVE', discountClasses: ['PRODUCT'], codes: { nodes: [{ code: 'STRUMPOR-K2F2-P3' }] }, combinesWith: { orderDiscounts: true, productDiscounts: false, shippingDiscounts: false } },
    { id: '3', __typename: 'DiscountCodeBasic', title: 'GLÖMD', status: 'ACTIVE', discountClasses: ['ORDER'], codes: { nodes: [{ code: 'GLÖMD' }] }, combinesWith: { orderDiscounts: true, productDiscounts: true, shippingDiscounts: true } },
    { id: '4', __typename: 'DiscountCodeBasic', title: 'Vän', status: 'ACTIVE', discountClasses: ['ORDER'], codes: { nodes: [{ code: 'VAN-TEST01' }] }, combinesWith: { orderDiscounts: false, productDiscounts: true, shippingDiscounts: true } },
    { id: '5', __typename: 'DiscountCodeBasic', title: 'KLUBB10', status: 'ACTIVE', discountClasses: ['ORDER'], codes: { nodes: [{ code: 'KLUBB10' }] }, combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: false } },
    { id: '6', __typename: 'DiscountCodeBxgy', title: 'Gammal', status: 'EXPIRED', discountClasses: ['PRODUCT'], codes: { nodes: [{ code: 'SUSHI-K1F1-GAMMAL' }] }, combinesWith: { orderDiscounts: false } },
  ];
  const auto = [{ id: 'a', __typename: 'DiscountAutomaticBasic', title: 'Black Week', status: 'SCHEDULED', discountClasses: ['ORDER'], combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: true } }];
  const p = planKod({ koder, automatiska: auto, konfig });
  assert.equal(p.van.id, '4');
  assert.deepEqual(p.paket.map((d) => d.id), ['1', '2']);
  assert.deepEqual(p.oppna.map((d) => d.id), ['1']);
  assert.deepEqual(p.stang.map((d) => d.id), ['3']);
});

test('avvikelserVan: allt som avgör pengarna kontrolleras', () => {
  const rätt = {
    status: 'ACTIVE', appliesOncePerCustomer: true, combinesWith: { orderDiscounts: false, productDiscounts: true, shippingDiscounts: true },
    customerGets: { value: { __typename: 'DiscountAmount', amount: { amount: '50.0' }, appliesOnEachItem: false }, items: { __typename: 'AllDiscountItems' } },
    minimumRequirement: { greaterThanOrEqualToSubtotal: { amount: '200.0' } },
  };
  assert.deepEqual(avvikelserVan(rätt, konfig), []);
  assert.deepEqual(avvikelserVan({ ...rätt, appliesOncePerCustomer: false }, konfig), ['en gång per kund']);
  assert.deepEqual(avvikelserVan({ ...rätt, combinesWith: { ...rätt.combinesWith, productDiscounts: false } }, konfig), ['kombinationerna']);
  assert.deepEqual(avvikelserVan(null, konfig), ['koden finns inte']);
});

test('visningsbelopp: aldrig mer än kassan ger, butikens valuta exakt, aldrig en 4 i JPY/TWD', () => {
  assert.equal(visningsbelopp(50, 'SEK'), 50);
  assert.equal(visningsbelopp(49, 'NOK'), 48);
  assert.equal(visningsbelopp(3.84, 'GBP'), 3.5);
  assert.equal(visningsbelopp(5.09, 'USD'), 5);
  assert.equal(visningsbelopp(1647.47, 'HUF'), 1600);
  for (const [m, v] of [[801, 'JPY'], [162.34, 'TWD'], [450, 'JPY'], [4500, 'JPY']]) {
    const b = visningsbelopp(m, v);
    assert.ok(!String(b).includes('4'), `${v} ${b}`);
    assert.ok(b <= m, `${v} ${b} > ${m}`);
  }
  assert.equal(visningsbelopp(0, 'SEK'), null);
});

test('kreditbelopp: runt och nära målet, aldrig en 4 i JPY/TWD', () => {
  assert.equal(kreditbelopp(98, 'NOK'), 100);
  assert.equal(kreditbelopp(8.98, 'EUR'), 9);
  assert.equal(kreditbelopp(1602, 'JPY'), 1600);
  assert.ok(!String(kreditbelopp(324.68, 'TWD')).includes('4'));
  assert.ok(!String(kreditbelopp(1440, 'JPY')).includes('4'));
});

test('byggData + kortdataJs: bara hela valutarader följer med', () => {
  const d = byggData({ ...konfig, lankar: { sv: 'https://matstrumpor.se' }, valutor: { SEK: { van: 50, kredit: 100 }, XXX: { van: null, kredit: 5 } } });
  assert.deepEqual(Object.keys(d.valutor), ['SEK']);
  assert.match(kortdataJs(d), /^\/\/ GENERERAD/);
  assert.match(kortdataJs(d), /"VAN-TEST01"/);
});

test('laggInILayout: en rad före </body>, en gång', () => {
  const l = '<html><body>x</body></html>';
  const en = laggInILayout(l);
  assert.ok(en.includes(LAYOUT_MARKOR));
  assert.equal(laggInILayout(en), en);
  assert.ok(en.indexOf(LAYOUT_MARKOR) < en.indexOf('</body>'));
  assert.throws(() => laggInILayout('<html></html>'));
});

test('rapportRader: torrt säger "hade", läckan och det som kräver en människa syns', () => {
  const r = rapportRader({ kandidater: 3, klara: 1, krediterade: [{ belopp: 100, valuta: 'SEK', varvare: '#5209', van: '#5300' }], vantar: [], nej: [], kolla: [{ van: '#5301', orsak: 'x' }], lackor: 2 }, { skarpt: false }).join('\n');
  assert.match(r, /\(torrt\) hade krediterat 100 SEK/);
  assert.match(r, /kräver en människa/);
  assert.match(r, /utan länk/);
});

// ---- Facit i repot: konfigen, språken, kortets data och temaskriptet hänger ihop ----

test('konfig.json: varje valuta har ett visat belopp som inte överstiger det mätta, och en kredit', () => {
  const k = lasKonfig(KONFIGFIL);
  assert.match(k.kod, /^[A-Z0-9-]+$/);
  for (const [v, r] of Object.entries(k.valutor)) {
    assert.ok(r.van > 0 && r.kredit > 0, v);
    assert.ok(r.van <= r.matt, `${v}: visar ${r.van} men kassan gav ${r.matt}`);
    if (['JPY', 'TWD'].includes(v)) assert.ok(!/4/.test(`${r.van}${r.kredit}`), v);
  }
});

test('sprak.json: alla språk i länkarna har alla nycklar, belopp bara som platshållare', () => {
  if (!existsSync(SPRAKFIL)) return;
  const k = lasKonfig(KONFIGFIL);
  const sprak = JSON.parse(readFileSync(SPRAKFIL, 'utf8'));
  const nycklar = Object.keys(sprak.sv);
  for (const s of Object.keys(k.lankar)) {
    assert.ok(sprak[s], `språket ${s} saknas`);
    for (const n of nycklar) {
      assert.ok(String(sprak[s][n] ?? '').trim(), `${s}.${n} saknas`);
      assert.ok(!/\d/.test(String(sprak[s][n]).replace(/\{[a-z_]+\}/g, '')), `${s}.${n} har en siffra utanför platshållarna`);
      assert.ok(!/[—–]/.test(sprak[s][n]), `${s}.${n} har ett tankstreck`);
    }
  }
});

test('kortets data.js är byggd ur den nuvarande konfigen', () => {
  if (!existsSync(KORTDATA)) return;
  assert.equal(readFileSync(KORTDATA, 'utf8'), kortdataJs(byggData(lasKonfig(KONFIGFIL))));
});

test('kortets texter.js är byggd ur den nuvarande sprak.json', () => {
  if (!existsSync(KORTTEXTER)) return;
  assert.equal(readFileSync(KORTTEXTER, 'utf8'), korttexterJs(JSON.parse(readFileSync(SPRAKFIL, 'utf8'))));
});

test('temaskriptet: datan och texterna bakas in, inga platshållare kvar', () => {
  if (!existsSync(SPRAKFIL) || !existsSync(TEMASKRIPT_KALLA)) return;
  const k = lasKonfig(KONFIGFIL);
  const js = temaskript(readFileSync(TEMASKRIPT_KALLA, 'utf8'), byggData(k), JSON.parse(readFileSync(SPRAKFIL, 'utf8')));
  assert.ok(!js.includes('/*__DATA__*/') && !js.includes('/*__TEXT__*/'));
  assert.ok(js.includes(k.kod));
});
