// lagerpolicy.mjs — sätter CONTINUE + tracked:false på en produkts varianter.
//
//   node factory/lagerpolicy.mjs <produkt-handle> [--torr]
//
// Axels regel 2026-09-09: Shopifys default är `inventoryPolicy: DENY`. Med
// den slutar produkten säljas TYST när saldot tar slut, medan annonserna
// fortsätter kosta pengar. Dropshipping har inget eget lager att ta slut.
//
// Fabriken sätter rätt policy vid nybygge sedan samma dag, men butiker som
// byggdes innan dess står kvar på DENY. Det här skriptet rättar dem, och
// läser tillbaka för att bevisa att det tog.

import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';

export async function lasVarianter(handle) {
  const d = await graphql(
    `query opsFactoryLager($handle: String!) {
      productByIdentifier(identifier: { handle: $handle }) {
        id title status
        variants(first: 100) {
          nodes { id title inventoryPolicy inventoryItem { id tracked } }
        }
      }
    }`,
    { handle }
  );
  if (!d.productByIdentifier) throw new Error(`Produkten ${handle} finns inte i butiken.`);
  return d.productByIdentifier;
}

export async function sattContinue(productId, varianter) {
  const d = await graphql(
    `mutation opsFactoryLagerpolicy($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants { id inventoryPolicy }
        userErrors { field message }
      }
    }`,
    {
      productId,
      variants: varianter.map((v) => ({
        id: v.id,
        inventoryPolicy: 'CONTINUE',
        inventoryItem: { tracked: false },
      })),
    }
  );
  const fel = d.productVariantsBulkUpdate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Lagerpolicyn: ${fel.map((f) => f.message).join('; ')}`);
  return d.productVariantsBulkUpdate.productVariants;
}

if (process.argv[1] && process.argv[1].endsWith('lagerpolicy.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const handle = arg.find((a) => !a.startsWith('--'));
  const torr = arg.includes('--torr');
  if (!handle) throw new Error('Ange produkt-handle: node factory/lagerpolicy.mjs <handle>');

  const p = await lasVarianter(handle);
  const fel = p.variants.nodes.filter(
    (v) => v.inventoryPolicy !== 'CONTINUE' || v.inventoryItem?.tracked !== false
  );
  console.log(`${p.title} (${p.status}) — ${p.variants.nodes.length} varianter`);
  console.log(`${fel.length} avviker från CONTINUE + tracked:false`);
  if (fel.length === 0) { console.log('✅ Redan rätt.'); process.exit(0); }
  if (torr) { console.log('(torrkörning — inget ändrat)'); process.exit(0); }

  await sattContinue(p.id, fel);

  // Läs TILLBAKA. En skrivning utan tillbakaläsning är inte gjord.
  const efter = await lasVarianter(handle);
  const kvar = efter.variants.nodes.filter(
    (v) => v.inventoryPolicy !== 'CONTINUE' || v.inventoryItem?.tracked !== false
  );
  if (kvar.length > 0) {
    throw new Error(`${kvar.length} varianter står kvar fel efter skrivningen: ${kvar.map((v) => v.title).join(', ')}`);
  }
  console.log(`✅ ${efter.variants.nodes.length} varianter: CONTINUE + tracked:false — tillbakaläst.`);
  console.log(`   Produkten är fortfarande ${efter.status}.`);
}
