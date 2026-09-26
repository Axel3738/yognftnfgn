// Riktig vinst per verksamhet (2026-09-26, byggordningen efter Evolve, steg 1b).
//
// vinstbidrag = försäljning utan moms − varukostnad (Cost per item) − betalavgifter − reklam
// Inget nät: ordrarna och snapshoten är fejkdata i samma form som hämtningen ger.

import test from 'node:test';
import assert from 'node:assert/strict';
import { summeraOrdrar, kostnadFor } from '../kallor/vinst.mjs';
import { verksamheter, merTotalt } from '../data.mjs';
import { oversiktSida } from '../vy/oversikt.mjs';
import { sattSprak } from '../vy/delar.mjs';

const NU = new Date('2026-09-26T15:00:00Z');
const VECKAN = ['2026-09-19', '2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25'];

const KOSTNADER = new Map([
  ['gid://v/1', { kostnad: 100, titel: 'Motorhölje · L' }],
  ['sku:ABC', { kostnad: 40, titel: 'Borste' }],
  ['namn:borste|', { kostnad: 40, titel: 'Borste' }],
]);

const order = (extra) => ({
  createdAt: '2026-09-24T10:00:00Z', cancelledAt: null, test: false,
  currentTotalPriceSet: { shopMoney: { amount: '500' } },
  currentTotalTaxSet: { shopMoney: { amount: '0' } },
  lineItems: { nodes: [{ currentQuantity: 2, originalUnitPriceSet: { shopMoney: { amount: '250' } }, variant: { id: 'gid://v/1' }, title: 'Motorhölje', variantTitle: 'L' }] },
  transactions: [{ gateway: 'shopify_payments', kind: 'SALE', status: 'SUCCESS', fees: [{ amount: { amount: '9.5', currencyCode: 'SEK' } }] }],
  ...extra,
});

test('summeraOrdrar: netto utan moms, varukostnad × antal, avgifter — avbrutna och testordrar räknas aldrig', () => {
  const { dagar } = summeraOrdrar([
    order(),
    order({ currentTotalTaxSet: { shopMoney: { amount: '100' } } }),
    order({ cancelledAt: '2026-09-24T11:00:00Z' }),
    order({ test: true }),
  ], KOSTNADER, { dagar: 8, nu: NU, valuta: 'SEK' });
  const d = dagar.find((x) => x.datum === '2026-09-24');
  assert.equal(d.ordrar, 2);
  assert.equal(d.netto, 900, '500 + (500 − 100 moms)');
  assert.equal(d.varukostnad, 400, '2 ordrar × 2 st × 100 kr');
  assert.equal(d.avgifter, 19);
  assert.equal(d.utanKostnad, 0);
});

test('summeraOrdrar: en variant utan Cost per item räknas som saknad — med belopp och namn, aldrig som noll', () => {
  const { dagar, saknarKostnad } = summeraOrdrar([
    order({ lineItems: { nodes: [{ currentQuantity: 1, originalUnitPriceSet: { shopMoney: { amount: '199' } }, variant: { id: 'gid://v/okand' }, title: 'Ätpinnar', variantTitle: null }] } }),
  ], KOSTNADER, { dagar: 8, nu: NU, valuta: 'SEK' });
  const d = dagar.find((x) => x.datum === '2026-09-24');
  assert.equal(d.varukostnad, 0);
  assert.equal(d.utanKostnad, 199);
  assert.deepEqual(saknarKostnad, [{ titel: 'Ätpinnar', intakt: 199 }]);
});

test('summeraOrdrar: betalt utan avgiftsdata (PayPal) syns som utanAvgift; avgifter i annan valuta hålls isär', () => {
  const { dagar } = summeraOrdrar([
    order({ transactions: [{ gateway: 'paypal', kind: 'SALE', status: 'SUCCESS', fees: [] }] }),
    order({ transactions: [{ gateway: 'shopify_payments', kind: 'SALE', status: 'SUCCESS', fees: [{ amount: { amount: '2', currencyCode: 'EUR' } }] }] }),
  ], KOSTNADER, { dagar: 8, nu: NU, valuta: 'SEK' });
  const d = dagar.find((x) => x.datum === '2026-09-24');
  assert.equal(d.utanAvgift, 500);
  assert.deepEqual(d.avgifterAnnanValuta, { EUR: 2 });
});

test('kostnadFor: variant-id först, sedan SKU, sedan produktens namn (appen utan read_products)', () => {
  assert.equal(kostnadFor({ variant: { id: 'gid://v/1' } }, KOSTNADER).kostnad, 100);
  assert.equal(kostnadFor({ sku: 'ABC' }, KOSTNADER).kostnad, 40);
  assert.equal(kostnadFor({ title: 'Borste', variantTitle: 'Default Title' }, KOSTNADER).kostnad, 40);
  assert.equal(kostnadFor({ title: 'Okänd' }, KOSTNADER), null);
});

const dag = (datum, v) => ({ datum, ordrar: 1, netto: 0, varukostnad: 0, avgifter: 0, avgifterAnnanValuta: {}, utanKostnad: 0, utanAvgift: 0, ...v });

function snapshot(vinst) {
  return {
    byggd: NU.toISOString(),
    valutakurser: { status: 'ok', datum: '2026-09-25', sekPer: { SEK: 1, NOK: 1.04 } },
    varumarken: [
      { id: 'bav', namn: 'Bäverbutiken', butiker: ['se', 'no'], konton: [{ id: '1', namn: 'SE', hela: true }] },
      { id: 'mat', namn: 'Matstrumpor', butiker: ['mat'], konton: [{ id: '2', namn: 'Mat', hela: true }] },
    ],
    butiker: [
      { id: 'se', namn: 'SE', valuta: 'SEK', status: 'ok', dagar: VECKAN.map((datum) => ({ datum, omsattning: 10_000, ordrar: 10 })) },
      { id: 'no', namn: 'NO', valuta: 'NOK', status: 'ok', dagar: VECKAN.map((datum) => ({ datum, omsattning: 1_000, ordrar: 1 })) },
      { id: 'mat', namn: 'Mat', valuta: 'SEK', status: 'ok', dagar: VECKAN.map((datum) => ({ datum, omsattning: 1_000, ordrar: 1 })) },
    ],
    annonskonton: [
      { id: '1', namn: 'SE', valuta: 'SEK', status: 'ok', dagar: VECKAN.map((datum) => ({ datum, spend: 3_000 })), kampanjer: [] },
      { id: '2', namn: 'Mat', valuta: 'SEK', status: 'ok', dagar: VECKAN.map((datum) => ({ datum, spend: 300 })), kampanjer: [] },
    ],
    vinst,
  };
}

const VINST = [
  { id: 'se', status: 'ok', valuta: 'SEK', dagar: VECKAN.map((d) => dag(d, { netto: 10_000, varukostnad: 3_000, avgifter: 200 })), saknarKostnad: [] },
  { id: 'no', status: 'ok', valuta: 'NOK', dagar: VECKAN.map((d) => dag(d, { netto: 1_000, varukostnad: 300, avgifter: 20 })), saknarKostnad: [] },
  { id: 'mat', status: 'ok', valuta: 'SEK', dagar: VECKAN.map((d) => dag(d, { netto: 1_000, varukostnad: 100, avgifter: 10, utanKostnad: 400 })), saknarKostnad: [{ titel: 'Ätpinnar', intakt: 2_800 }] },
];

test('vinst per verksamhet: netto − varukostnad − avgifter − reklam, NOK omräknat, dagen i dag räknas inte', () => {
  const extra = VINST.map((v) => (v.id === 'se' ? { ...v, dagar: [...v.dagar, dag('2026-09-26', { netto: 99_999 })] } : v));
  const bav = verksamheter(snapshot(extra), { nu: NU }).find((v) => v.id === 'bav');
  // Netto: 70 000 + 7 000 NOK × 1,04 = 77 280. Varukostnad: 21 000 + 2 100 × 1,04 = 23 184.
  // Avgifter: 1 400 + 140 × 1,04 = 1 545,6. Reklam: 21 000.
  assert.equal(bav.vinst.status, 'ok');
  assert.equal(Math.round(bav.vinst.netto), 77_280);
  assert.equal(Math.round(bav.vinst.bidrag), Math.round(77_280 - 23_184 - 1_545.6 - 21_000));
  assert.ok(Math.abs(bav.vinst.marginal - bav.vinst.bidrag / 77_280) < 1e-9);
});

test('vinsten räknas inte när mer än 1 % av försäljningen saknar Cost per item — produkterna att fylla i följer med', () => {
  const mat = verksamheter(snapshot(VINST), { nu: NU }).find((v) => v.id === 'mat');
  assert.equal(mat.vinst.status, 'saknas');
  assert.equal(mat.vinst.bidrag, undefined);
  assert.match(mat.vinst.orsak, /40 % av försäljningen/);
  assert.equal(mat.vinst.saknarKostnad[0].titel, 'Ätpinnar');
});

test('utan vinstunderlag i snapshoten står orsaken — aldrig en nolla', () => {
  const bav = verksamheter(snapshot(undefined), { nu: NU }).find((v) => v.id === 'bav');
  assert.equal(bav.vinst.status, 'saknas');
  assert.match(bav.vinst.orsak, /vinstunderlaget hämtades inte/);
});

test('merTotalt summerar vinsten bara över verksamheter som gick att räkna', () => {
  const t = merTotalt(verksamheter(snapshot(VINST), { nu: NU }));
  assert.deepEqual(t.vinstMed.map((v) => v.id), ['bav']);
  assert.deepEqual(t.vinstUtan.map((v) => v.id), ['mat']);
  assert.equal(t.bidrag, t.vinstMed[0].vinst.bidrag);
});

test('Översikt visar vinsttabellen och vinstkortet för ägaren, med vad som ska fyllas i', () => {
  sattSprak('sv');
  const html = oversiktSida({ snapshot: snapshot(VINST), anvandare: { roll: 'agare', namn: 'Axel' }, nu: NU }).innehall;
  assert.match(html, /Riktig vinst per verksamhet, 7 dagar/);
  assert.match(html, /Vinstbidrag 7 dagar/);
  assert.match(html, /40 % saknar Cost per item\. Fyll i: Ätpinnar/);
  assert.match(html, /Löner, appar och andra fasta kostnader är inte avdragna/);
});

test('Vinsten syns aldrig för redigerare, VA eller Head of support', () => {
  sattSprak('sv');
  for (const roll of ['redigerare', 'va', 'support_chef', 'produkttest']) {
    const html = oversiktSida({ snapshot: snapshot(VINST), anvandare: { roll, namn: 'X' }, nu: NU }).innehall;
    assert.doesNotMatch(html, /Riktig vinst|Vinstbidrag 7 dagar/, roll);
  }
});
