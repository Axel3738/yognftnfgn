// lagerpolicy.mjs — sätter CONTINUE + tracked:false på en produkts varianter,
// och läser tillbaka för att bevisa att det tog.
//
//   node factory/lagerpolicy.mjs <produkt-handle> [--torr]
//
// Axels regel 2026-09-09: Shopifys default är `inventoryPolicy: DENY`. Med
// den slutar produkten säljas TYST när saldot tar slut, medan annonserna
// fortsätter kosta pengar. Dropshipping har inget eget lager att ta slut.
//
// Fabriken sätter rätt policy vid nybygge (build-store.mjs), men butiker som
// byggdes innan dess står kvar på DENY. Steg 8 i ops.mjs (KEDJAN.md) kör
// sattContinue(ctx, produktId, { torr }) på varje produkt — idempotent: står
// allt rätt redan skrivs ingenting.

import { pathToFileURL } from 'node:url';
import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';

const RATT = (v) => v?.inventoryPolicy === 'CONTINUE' && v?.inventoryItem?.tracked === false;

// Ren logik: vilka varianter avviker. Returnerar { avvikande, ratt, ok }.
export function planeraLagerpolicy(varianter) {
  const lista = Array.isArray(varianter) ? varianter : [];
  const avvikande = lista.filter((v) => !RATT(v));
  return { avvikande, ratt: lista.filter(RATT), ok: avvikande.length === 0 };
}

// Inputen till productVariantsBulkUpdate för de varianter som ska rättas.
export const byggVariantInput = (varianter) =>
  varianter.map((v) => ({ id: v.id, inventoryPolicy: 'CONTINUE', inventoryItem: { tracked: false } }));

// produktId är handle (fabrikens id) eller ett gid — båda slås upp.
export async function lasVarianter(produktId) {
  const arGid = String(produktId).startsWith('gid://');
  const d = await graphql(
    arGid
      ? `query opsFactoryLagerId($id: ID!) { product(id: $id) { id title status variants(first: 100) { nodes { id title inventoryPolicy inventoryItem { id tracked } } } } }`
      : `query opsFactoryLager($handle: String!) { productByIdentifier(identifier: { handle: $handle }) { id title status variants(first: 100) { nodes { id title inventoryPolicy inventoryItem { id tracked } } } } }`,
    arGid ? { id: produktId } : { handle: String(produktId) }
  );
  const p = arGid ? d.product : d.productByIdentifier;
  if (!p) throw new Error(`Produkten ${produktId} finns inte i butiken.`);
  return p;
}

async function skrivContinue(productGid, varianter) {
  const d = await graphql(
    `mutation opsFactoryLagerpolicy($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants { id inventoryPolicy }
        userErrors { field message }
      }
    }`,
    { productId: productGid, variants: byggVariantInput(varianter) }
  );
  const fel = d.productVariantsBulkUpdate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Lagerpolicyn: ${fel.map((f) => f.message).join('; ')}`);
  return d.productVariantsBulkUpdate.productVariants;
}

// sattContinue(ctx, produktId, { torr }) → { andrade, verifierade, produkt, status }
//   andrade      varianttitlar som skrevs (tomt när allt redan stod rätt)
//   verifierade  varianttitlar som efter tillbakaläsning står CONTINUE + tracked:false
// Kastar om något står kvar fel efter skrivningen — en skrivning utan
// tillbakaläsning är inte gjord. ctx används inte i dag; kontraktet bär det
// så steget kan få butikskontexten utan att signaturen ändras.
export async function sattContinue(ctx, produktId, { torr = false } = {}) {
  const p = await lasVarianter(produktId);
  const plan = planeraLagerpolicy(p.variants?.nodes ?? []);
  const titlar = (l) => l.map((v) => v.title ?? v.id);
  if (plan.ok) {
    return { andrade: [], verifierade: titlar(plan.ratt), produkt: p.title, status: p.status, torr, redanRatt: true };
  }
  if (torr) {
    return { andrade: titlar(plan.avvikande), verifierade: [], produkt: p.title, status: p.status, torr: true, redanRatt: false };
  }
  await skrivContinue(p.id, plan.avvikande);

  // Läs TILLBAKA.
  const efter = await lasVarianter(p.id);
  const kvar = planeraLagerpolicy(efter.variants?.nodes ?? []);
  if (!kvar.ok) {
    throw new Error(`${kvar.avvikande.length} varianter står kvar fel efter skrivningen: ${titlar(kvar.avvikande).join(', ')}`);
  }
  return { andrade: titlar(plan.avvikande), verifierade: titlar(kvar.ratt), produkt: efter.title, status: efter.status, torr: false, redanRatt: false };
}

async function huvud() {
  laddaEnv();
  const arg = process.argv.slice(2);
  const handle = arg.find((a) => !a.startsWith('--'));
  const torr = arg.includes('--torr');
  if (!handle) throw new Error('Ange produkt-handle: node factory/lagerpolicy.mjs <handle> [--torr]');

  const r = await sattContinue({}, handle, { torr });
  console.log(`${r.produkt} (${r.status}) — ${r.andrade.length + r.verifierade.length} varianter`);
  if (r.redanRatt) { console.log(`✅ Redan rätt: ${r.verifierade.length} varianter CONTINUE + tracked:false.`); return; }
  if (r.torr) { console.log(`${r.andrade.length} avviker: ${r.andrade.join(', ')}\n(torrkörning — inget ändrat)`); return; }
  console.log(`✅ ${r.andrade.length} rättade, ${r.verifierade.length} varianter CONTINUE + tracked:false — tillbakaläst.`);
  console.log(`   Produkten är fortfarande ${r.status}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
