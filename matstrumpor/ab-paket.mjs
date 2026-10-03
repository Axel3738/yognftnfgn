#!/usr/bin/env node
// ab-paket.mjs — läser av A/B-testet "paket" i Matstrumpor (Sverige, sushisidan).
//   A = Köp 1 få 1: 2 lådor 399 kr, 4 lådor 798 kr (SUSHI-K1F1 / SUSHI-K2F2)
//   B = fasta paket: 1 låda 399, 2 lådor 499, 4 lådor 799 (SUSHI-1FOR399 / -2FOR499 / -4FOR799)
// Stämpeln "AB paket" på ordern (assets/ms-ab.js). Testet startade 2026-09-30 14:34 UTC
// (första stämplade order #5201). Bara ordrar till Sverige: B visas bara där.
//
// Bruttovinst = intäkt − återbetalt − sushilådornas landade kostnad (cogs.json → sverige)
// − tull 2,9 EUR per order (konfig.json, ECB-kurs). Pizza/hamburgare/donut saknar kostnad i
// Shopify (mätt 2026-09-27), därför också en jämförelse med bara sushiordrar. Annonskostnaden
// är lika för båda varianterna (besökarna delas 50/50), så skillnaden i bruttovinst är
// skillnaden i vinst. Frakt till kund och betalavgifter ingår inte.
//
//   node matstrumpor/ab-paket.mjs        # hämtar, räknar, skriver output/ab-paket.json
// Statistiken (p-värdet): theme-matstrumpor/ab/analys.mjs på grenen
//   claude/build-shrinepro-like-theme-pfalsx: --test paket --ordrar matstrumpor/output/ab-paket.json

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasButik, skapaKlient } from '../sparning/butik.mjs';
import { hamtaKurser } from '../stonebite/kallor/valuta.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const SORTER = ['sushi-strumpor', 'pizza-strumpor', 'hamburger-strumpor', 'donut-strumpor'];
const ANDRA = SORTER.slice(1);

async function hamtaOrdrar(fran = '2026-09-30') {
  const k = await skapaKlient(lasButik('matstrumpor'));
  let after = null; const alla = [];
  do {
    const d = await k.graphql(`query($a: String) { orders(first: 100, after: $a, sortKey: CREATED_AT, query: "created_at:>=${fran}") { pageInfo { hasNextPage endCursor }
      nodes { name createdAt cancelledAt test
        totalPriceSet { shopMoney { amount } } totalRefundedSet { shopMoney { amount } }
        shippingAddress { countryCodeV2 } billingAddress { countryCodeV2 }
        customAttributes { key value } discountCodes
        lineItems(first: 20) { nodes { title quantity product { handle } } } } } }`, { a: after });
    alla.push(...d.orders.nodes); after = d.orders.pageInfo.hasNextPage ? d.orders.pageInfo.endCursor : null;
  } while (after);
  return alla;
}

export function rakna(alla, { cogs, tull = 0 }) {
  const v = (o) => o.customAttributes.find((a) => a.key === 'AB paket')?.value ?? null;
  const forced = (o) => o.customAttributes.some((a) => a.key === 'AB paket forced');
  const forsta = alla.find((o) => v(o))?.createdAt;
  const se = alla.filter((o) => forsta && o.createdAt >= forsta && (o.shippingAddress?.countryCodeV2 ?? o.billingAddress?.countryCodeV2) === 'SE');
  const tom = () => ({ ordrar: 0, intakt: 0, aterbetalt: 0, lador: 0, kostnad: 0, utanKostnad: 0, utanSushi: 0, koder: {}, paket: {} });
  const res = { start: forsta, okand: 0, tvingad: 0, annullerad: 0, alla: { a: tom(), b: tom() }, sushi: { a: tom(), b: tom() } };
  const filUt = [];
  for (const o of se) {
    const x = v(o);
    if (!x) { res.okand++; continue; }
    if (forced(o)) { res.tvingad++; continue; }
    if (o.cancelledAt || o.test) { res.annullerad++; continue; }
    if (!res.alla[x]) continue;
    const tot = Number(o.totalPriceSet.shopMoney.amount);
    const ref = Number(o.totalRefundedSet.shopMoney.amount);
    let lador = 0, sushiKost = 0, harSushi = false, harAndra = false, utanKostnad = 0;
    for (const li of o.lineItems.nodes) {
      const h = li.product?.handle;
      if (!SORTER.includes(h)) continue;
      lador += li.quantity;
      if (h === 'sushi-strumpor') { harSushi = true; sushiKost += li.quantity * (/\b3\b/.test(li.title) ? cogs['sushi-3'] : cogs['sushi-5']); }
      else { harAndra = true; utanKostnad += li.quantity; }
    }
    const lagg = (r) => {
      r.ordrar++; r.intakt += tot; r.aterbetalt += ref; r.lador += lador; r.kostnad += sushiKost + tull; r.utanKostnad += utanKostnad;
      if (!harSushi) r.utanSushi++;
      for (const c of o.discountCodes) r.koder[c] = (r.koder[c] || 0) + 1;
      r.paket[lador] = (r.paket[lador] || 0) + 1;
    };
    lagg(res.alla[x]);
    if (harSushi && !harAndra) lagg(res.sushi[x]);
    filUt.push({ name: o.name, totalPrice: tot, attributes: { 'AB paket': x } });
  }
  for (const grupp of [res.alla, res.sushi]) for (const r of Object.values(grupp)) {
    r.snitt = r.ordrar ? r.intakt / r.ordrar : 0;
    r.vinst = r.intakt - r.aterbetalt - r.kostnad;
    r.vinstPerOrder = r.ordrar ? r.vinst / r.ordrar : 0;
  }
  return { res, filUt };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cogs = JSON.parse(readFileSync(join(HAR, 'cogs.json'), 'utf8')).sverige.kostnad;
  const tullEur = JSON.parse(readFileSync(join(HAR, 'konfig.json'), 'utf8')).ekonomi?.tull_eur ?? 2.9;
  const kurs = await hamtaKurser();
  const eur = kurs?.sekPer?.EUR;
  if (!eur) console.log(`⚠️ ECB-kursen saknas (${kurs?.orsak}) — tullen räknas inte`);
  const alla = await hamtaOrdrar();
  const { res, filUt } = rakna(alla, { cogs, tull: eur ? tullEur * eur : 0 });
  mkdirSync(join(HAR, 'output'), { recursive: true });
  writeFileSync(join(HAR, 'output', 'ab-paket.json'), JSON.stringify(filUt));
  const kr = (n) => `${Math.round(n).toLocaleString('sv-SE')} kr`;
  console.log(`Start ${res.start} · okända ${res.okand} · tvingade ${res.tvingad} · annullerade ${res.annullerad} · EUR ${eur ?? '–'} kr`);
  for (const [namn, g] of [['Alla ordrar till Sverige', res.alla], ['Bara sushiordrar', res.sushi]]) {
    console.log(`\n${namn}`);
    for (const x of ['a', 'b']) {
      const r = g[x];
      console.log(`  ${x.toUpperCase()}: ${r.ordrar} ordrar · ${kr(r.intakt)} · snitt ${kr(r.snitt)} · ${r.lador} lådor (${(r.lador / (r.ordrar || 1)).toFixed(2)}/order) · bruttovinst ${kr(r.vinst)} (${kr(r.vinstPerOrder)}/order)${r.utanKostnad ? ` · ${r.utanKostnad} lådor utan kostnad i Shopify` : ''}`);
      console.log(`     paket ${JSON.stringify(r.paket)} · koder ${JSON.stringify(r.koder)}`);
    }
  }
}
