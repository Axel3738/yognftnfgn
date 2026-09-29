// Tester för ab-norge.mjs — utan nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { klassaOrder, pVarde, jamfor, rapport } from '../annonser/ab-norge.mjs';

const order = (last, first = last, utm = null) => ({ customerJourneySummary: { lastVisit: { landingPage: last, utmParameters: utm ? { campaign: utm } : null }, firstVisit: { landingPage: first } } });

test('ordern delas på landningssidan: .no är B, .se/nb är A, kassalänk och svenska sidan är okända', () => {
  assert.equal(klassaOrder(order('https://matstrumpor.no/products/sushi-strumpor?country=NO')), 'B');
  assert.equal(klassaOrder(order('https://www.matstrumpor.no/')), 'B');
  assert.equal(klassaOrder(order('https://matstrumpor.se/nb/products/sushi-strumpor?country=NO')), 'A');
  assert.equal(klassaOrder(order('https://matstrumpor.se/nb')), 'A');
  assert.equal(klassaOrder(order('https://matstrumpor.se/products/sushi-strumpor')), null);
  assert.equal(klassaOrder(order('https://matstrumpor.se/nbx/sida')), null);
  assert.equal(klassaOrder(order('https://matstrumpor.no/checkouts/cn/abc/nb-no', 'https://matstrumpor.no/checkouts/cn/abc')), null);
  assert.equal(klassaOrder({}), null);
});

test('kampanjens id i utm_campaign vinner över landningssidan', () => {
  assert.equal(klassaOrder(order('https://matstrumpor.no/', 'https://matstrumpor.no/', '111'), { kampanjA: '111', kampanjB: '222' }), 'A');
  assert.equal(klassaOrder(order('https://matstrumpor.se/nb/', 'https://matstrumpor.se/nb/', '222'), { kampanjA: '111', kampanjB: '222' }), 'B');
});

test('p-värdet: samma andel ger 1, stor skillnad på mycket data ger nära 0, ingen data ger null', () => {
  assert.ok(pVarde(10, 100, 10, 100) > 0.9999);
  assert.ok(pVarde(10, 1000, 40, 1000) < 0.001);
  assert.equal(pVarde(1, 0, 1, 10), null);
  const p = pVarde(12, 400, 20, 400);
  assert.ok(p > 0.1 && p < 0.2, `p = ${p}`); // 3 % mot 5 %: inte säkert på 400 sidvisningar
});

test('ingen dom under 300 kr eller 3 köp per variant', () => {
  const lite = jamfor({ spend_sek: 250, kop: 5, lpv: 100, roas: 3 }, { spend_sek: 900, kop: 9, lpv: 300, roas: 2 });
  assert.equal(lite.lage, 'for_lite');
  assert.match(lite.text, /A: 250 kr, 5 köp/);
  assert.equal(jamfor({ spend_sek: 900, kop: 2, lpv: 100, roas: 1 }, { spend_sek: 900, kop: 9, lpv: 300, roas: 2 }).lage, 'for_lite');
});

test('domen säger vem som leder bara när skillnaden är säker', () => {
  const osaker = jamfor({ spend_sek: 7000, kop: 12, lpv: 400, roas: 1.4 }, { spend_sek: 7000, kop: 16, lpv: 400, roas: 1.9 });
  assert.equal(osaker.lage, 'ingen_saker');
  assert.equal(osaker.ledare, 'B');
  assert.match(osaker.text, /kan vara slumpen/);
  const saker = jamfor({ spend_sek: 7000, kop: 20, lpv: 2000, roas: 1.2 }, { spend_sek: 7000, kop: 60, lpv: 2000, roas: 3.1 });
  assert.equal(saker.lage, 'saker');
  assert.match(saker.text, /B \(norsk sida, \.no\) vinner/);
});

test('rapporten håller Metas köp och Shopifys ordrar isär och säger att kostnaden saknas', () => {
  const A = { spend_sek: 7000, impressions: 90000, klick: 900, lpv: 700, kop: 14, roas: 1.6, cpa_sek: 500 };
  const B = { spend_sek: 7000, impressions: 88000, klick: 950, lpv: 760, kop: 18, roas: 2.0, cpa_sek: 388.89 };
  const text = rapport({ fran: '2026-10-01', till: '2026-10-14', A, B, ordrar: { A: { antal: 13, sek: 5400, nok: 5837 }, B: { antal: 17, sek: 7100, nok: 7633 }, okand: { antal: 2 } }, dom: jamfor(A, B) });
  assert.match(text, /A · svenskt varumärke \(.se\/nb\) \| 7[\s ]000 kr/);
  assert.match(text, /B \(.no\): 17 ordrar/);
  assert.match(text, /Okänd .*: 2 ordrar/);
  assert.match(text, /landade kostnad saknas/);
});
