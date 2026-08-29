#!/usr/bin/env node
// Granskar en Kaching deal_block-payload INNAN den skrivs till en skarp butik.
// Kräver ingen inloggning och rör inget nätverk — kör den var som helst.
//
//   node validate-payload.mjs payloads/min-bundle.json
//
// Fällorna nedan är hämtade ur api-map.json och START-HÄR.md. Var och en har
// orsakat riktiga prisfel i skarpa butiker, och ingen av dem ger felmeddelande
// från Kachings API — de går igenom tyst och visar fel pris för kunden.

import fs from 'node:fs';

const GILTIGA_RABATTYPER = ['specific', 'percentage', 'amount'];
const GILTIG_SYNLIGHET = ['all-products', 'selected-products', 'selected-collections'];

const fel = [];
const varningar = [];

function granska(p) {
  // --- Rabattyp: den dyraste fällan -------------------------------------
  // Allt utom specific/percentage/amount (t.ex. "default") gör att raden visar
  // fullpris gånger antalet och att discountValue ignoreras helt tyst.
  for (const [i, bar] of (p.dealBars || []).entries()) {
    const namn = `rad ${i} ("${bar.title ?? ''}")`;
    if (!GILTIGA_RABATTYPER.includes(bar.discountType)) {
      fel.push(`${namn}: discountType "${bar.discountType}" är ogiltig. Måste vara en av ${GILTIGA_RABATTYPER.join(', ')} — annars visas fullpris × antal och discountValue ignoreras tyst.`);
    }
    if (typeof bar.discountValue !== 'number' || Number.isNaN(bar.discountValue)) {
      fel.push(`${namn}: discountValue måste vara ett tal, är ${JSON.stringify(bar.discountValue)}.`);
    }
    if (!Number.isInteger(bar.quantity) || bar.quantity < 1) {
      fel.push(`${namn}: quantity måste vara ett heltal ≥ 1, är ${JSON.stringify(bar.quantity)}.`);
    }
    if (bar.discountType === 'percentage' && (bar.discountValue < 0 || bar.discountValue > 100)) {
      fel.push(`${namn}: percentage ${bar.discountValue} ligger utanför 0–100.`);
    }
    if (!bar.id) fel.push(`${namn}: saknar id.`);
  }

  // --- Unika rad-id + förvald rad ---------------------------------------
  const ids = (p.dealBars || []).map((b) => b.id);
  const dubbletter = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dubbletter.length) fel.push(`dealBar-id måste vara unika. Dubbletter: ${[...new Set(dubbletter)].join(', ')}`);
  if (p.preselectedDealBarId && !ids.includes(p.preselectedDealBarId)) {
    fel.push(`preselectedDealBarId "${p.preselectedDealBarId}" matchar ingen dealBar (finns: ${ids.join(', ')}). Ingen rad blir förvald.`);
  }
  if (!p.preselectedDealBarId) varningar.push('preselectedDealBarId saknas — ingen rad blir förvald i widgeten.');

  // --- "specific" = TOTALPRIS för hela antalet, inte styckpris -----------
  // Skrivs styckpriset in i stället blir bundlen absurt billig och det syns
  // inte förrän någon har handlat.
  const spec = (p.dealBars || [])
    .filter((b) => b.discountType === 'specific' && typeof b.discountValue === 'number' && b.quantity >= 1)
    .map((b) => ({ ...b, styck: b.discountValue / b.quantity }))
    .sort((a, b) => a.quantity - b.quantity);

  for (let i = 1; i < spec.length; i++) {
    const föregående = spec[i - 1];
    const denna = spec[i];
    if (denna.discountValue <= föregående.discountValue) {
      fel.push(`rad "${denna.title}" (${denna.quantity} st) har totalpris ${denna.discountValue} som inte är högre än "${föregående.title}" (${föregående.quantity} st, ${föregående.discountValue}). Med discountType "specific" är discountValue TOTALPRIS för hela antalet, inte styckpris — det här ser ut som ett inskrivet styckpris.`);
    }
    if (denna.styck > föregående.styck) {
      varningar.push(`rad "${denna.title}": styckpriset ${denna.styck.toFixed(2)} är HÖGRE än på ${föregående.quantity} st (${föregående.styck.toFixed(2)}). Kunden betalar mer per styck för att köpa fler.`);
    }
  }

  // --- Produkter --------------------------------------------------------
  if (!GILTIG_SYNLIGHET.includes(p.blockVisibility)) {
    varningar.push(`blockVisibility "${p.blockVisibility}" är inte en av de kända (${GILTIG_SYNLIGHET.join(', ')}).`);
  }
  if (p.blockVisibility === 'selected-products' && !(p.selectedProducts || []).length) {
    fel.push('blockVisibility är "selected-products" men selectedProducts är tom — bundlen syns ingenstans.');
  }
  for (const prod of p.selectedProducts || []) {
    if (!/^gid:\/\/shopify\/Product\/\d+$/.test(prod.id || '')) {
      fel.push(`selectedProducts innehåller "${prod.id}" som inte är ett giltigt produkt-GID (gid://shopify/Product/<siffror>).`);
    }
  }

  // --- Kvarglömda platshållare -----------------------------------------
  const rå = JSON.stringify(p);
  for (const platshållare of ['BYT-MOT', 'FYLL I', 'TODO', 'XXX']) {
    if (rå.includes(platshållare)) fel.push(`payloaden innehåller kvarglömd platshållartext "${platshållare}".`);
  }

  // --- Layout -----------------------------------------------------------
  // spacing är en multiplikator, inte pixlar. 1 är tajt, 8 blir enormt.
  if (typeof p.spacing === 'number' && p.spacing > 3) {
    varningar.push(`spacing ${p.spacing} är en multiplikator, inte pixlar — 1 är tajt och snyggt, 8 blir enormt.`);
  }

  // --- Överstruket pris -------------------------------------------------
  if (p.useProductCompareAtPrice) {
    varningar.push('useProductCompareAtPrice är på: det överstrukna priset kommer från produktens compare_at_price × antalet. Stämmer inte jämförpriset i Shopify blir den överstrukna siffran fel.');
  }

  if (p.endTimestamp != null && p.startTimestamp != null && p.endTimestamp <= p.startTimestamp) {
    fel.push('endTimestamp ligger före eller på startTimestamp — bundlen blir aldrig aktiv.');
  }
}

const sökväg = process.argv[2];
if (!sökväg) {
  console.error('Användning: node validate-payload.mjs <payload.json>');
  process.exit(2);
}
granska(JSON.parse(fs.readFileSync(sökväg, 'utf8')));

for (const f of fel) console.log(`FEL      ${f}`);
for (const v of varningar) console.log(`VARNING  ${v}`);

if (fel.length) {
  console.log(`\n${fel.length} fel, ${varningar.length} varningar. Skriv INTE den här payloaden till en skarp butik.`);
  process.exit(1);
}
console.log(`\nInga fel${varningar.length ? `, ${varningar.length} varning(ar) att titta på` : ''}. Payloaden är säker att skicka.`);
