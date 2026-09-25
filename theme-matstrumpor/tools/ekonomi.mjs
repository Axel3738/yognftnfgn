#!/usr/bin/env node
// Ekonomiläget för matstrumpor.se ur Shopify: inköpspris per låda, ordermix per
// paketkod, täckningsbidrag och break-even-ROAS per nivå. Bara läsning.
//
//   node theme-matstrumpor/tools/ekonomi.mjs [--sedan 2026-08-26]
//
// ⚠️ Appen under SHOPIFY_*_MATSTRUMPOR har bara produkter öppna. Ordrar och
// rapporter kräver appen 1r46tp_qx, och saknas SHOPIFY_SHOP_1r46tp_qx i
// environmentet (så var det 2026-09-25) körs skriptet så här:
//   SHOPIFY_SHOP_MATSTRUMPOR= SHOPIFY_SHOP_1r46tp_qx=1r46tp-qx.myshopify.com node theme-matstrumpor/tools/ekonomi.mjs
//
// Antaganden som INTE kommer ur Shopify (ändra här när Axel gett besked):
//   · betalavgift 2,7 % + 3 kr per order (Shopify Payments, ungefärlig sats)
//   · pizza/hamburgare/donut saknar inköpspris i Shopify → antas kosta som sushi 5-par
//   · ätpinnarna saknar inköpspris → räknas som 0 kr (se docs/matstrumpor-ekonomi.md)
//   · ingen moms: Shopify tar inte ut moms på ordrarna (0 kr på alla), se docs
import { gql, kontrolleraButik } from './shopify.mjs';

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const sedan = arg('--sedan', new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10));
const AVGIFT = o => 0.027 * o + 3;

const butik = await kontrolleraButik();
console.log(`Butik: ${butik.name} · ${butik.primaryDomain.host} · ordrar sedan ${sedan}\n`);

// Inköpspris per variant, rakt ur Shopify (Inställningar → produkt → variant → Kostnad per artikel)
const p = await gql('{ products(first: 50, query: "status:active") { nodes { title variants(first: 10) { nodes { title price inventoryItem { unitCost { amount } } } } } } }');
const inköp = {};
console.log('Inköpspris per variant (Shopify):');
for (const pr of p.products.nodes) for (const v of pr.variants.nodes) {
  const c = v.inventoryItem.unitCost?.amount;
  if (c) inköp[`${pr.title}|${v.title.split(' / ')[0]}`] = Number(c);
  console.log(`  ${pr.title} · ${v.title} · pris ${v.price} · inköp ${c ?? 'SAKNAS'}`);
}
const SUSHI5 = inköp['Sushi-Strumpor|5 - Par'];
if (!SUSHI5) throw new Error('Sushi 5-par saknar inköpspris i Shopify — kan inte räkna.');
const kostRad = li => {
  if (/ätpinnar|presentkort/i.test(li.title)) return 0;
  const nyckel = `${li.title}|${(li.variantTitle ?? '').split(' / ')[0]}`;
  return (inköp[nyckel] ?? SUSHI5) * li.quantity;
};

let cursor = null; const ordrar = [];
for (let i = 0; i < 20; i++) {
  const r = await gql(`query($c: String, $q: String!) { orders(first: 250, after: $c, query: $q) { pageInfo { hasNextPage endCursor } nodes { name createdAt discountCodes totalPriceSet { shopMoney { amount } } totalTaxSet { shopMoney { amount } } totalShippingPriceSet { shopMoney { amount } } totalRefundedSet { shopMoney { amount } } lineItems(first: 20) { nodes { title variantTitle quantity } } } } }`, { c: cursor, q: `created_at:>=${sedan}` });
  ordrar.push(...r.orders.nodes);
  if (!r.orders.pageInfo.hasNextPage) break;
  cursor = r.orders.pageInfo.endCursor;
}
const kr = x => Number(x.shopMoney.amount);
const rad = (namn, arr) => {
  if (!arr.length) return;
  const I = arr.reduce((s, o) => s + kr(o.totalPriceSet), 0);
  const K = arr.reduce((s, o) => s + o.lineItems.nodes.reduce((t, li) => t + kostRad(li), 0), 0);
  const A = arr.reduce((s, o) => s + AVGIFT(kr(o.totalPriceSet)), 0);
  const TB = I - K - A;
  console.log(`  ${namn.padEnd(16)} ${String(arr.length).padStart(4)} ordrar · intäkt ${I.toFixed(0).padStart(7)} · lådor ${K.toFixed(0).padStart(6)} · avgift ${A.toFixed(0).padStart(5)} · TB ${(TB / arr.length).toFixed(0).padStart(4)} kr/order · break-even ROAS ${(I / TB).toFixed(2)}`);
};
const kod = o => (o.discountCodes[0] ?? '(ingen kod)').replace(/-P\d$/, '');
console.log(`\nOrdrar: ${ordrar.length} · moms ${ordrar.reduce((s, o) => s + kr(o.totalTaxSet), 0).toFixed(0)} kr · fraktintäkt ${ordrar.reduce((s, o) => s + kr(o.totalShippingPriceSet), 0).toFixed(0)} kr · återbetalt ${ordrar.reduce((s, o) => s + kr(o.totalRefundedSet), 0).toFixed(0)} kr`);
console.log('\nTäckningsbidrag per paketkod (ätpinnar ej medräknade):');
rad('ALLA', ordrar);
const koder = [...new Set(ordrar.map(kod))].sort((a, b) => ordrar.filter(o => kod(o) === b).length - ordrar.filter(o => kod(o) === a).length);
for (const k of koder) rad(k, ordrar.filter(o => kod(o) === k));

console.log('\nScenarier för Köp 1 Få 1, sushi 5-par à 399 kr:');
const be = ({ pris = 399, lådor = 2, låda = SUSHI5, frakt = 0, pinnar = 0 }) => { const I = pris + frakt; const TB = I - lådor * låda - 2 * pinnar - AVGIFT(I); return `TB ${TB.toFixed(0)} kr · break-even ${(I / TB).toFixed(2)}`; };
for (const [namn, s] of [
  ['i dag', {}], ['ätpinnar 5 kr/par utöver lådan', { pinnar: 5 }], ['ätpinnar 10 kr/par utöver lådan', { pinnar: 10 }],
  ['lådan −10 kr', { låda: SUSHI5 - 10 }], ['lådan −20 kr', { låda: SUSHI5 - 20 }],
  ['fraktavgift 29 kr', { frakt: 29 }], ['fraktavgift 49 kr', { frakt: 49 }], ['lådan −10 kr + frakt 39 kr', { låda: SUSHI5 - 10, frakt: 39 }],
  ['pris 449 kr', { pris: 449 }], ['pris 499 kr', { pris: 499 }],
]) console.log(`  ${namn.padEnd(34)} ${be(s)}`);
console.log(`\nLådpris som ensamt ger 1,50 vid 399 kr: ${((399 - 399 / 1.5 - AVGIFT(399)) / 2).toFixed(1)} kr`);
console.log(`Om 25 % moms ska redovisas på 399 kr: break-even ${(399 / (399 / 1.25 - 2 * SUSHI5 - AVGIFT(399))).toFixed(2)}`);
