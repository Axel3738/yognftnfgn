#!/usr/bin/env node
// Höjer jämförpriset (compare_at_price) på en Bäverbutiken-produkt så att en
// procentclaim i annonserna stämmer. Axels policy 2026-08-29: säger annonsen
// "40 % RABATT" och verkligheten är 23 % ändrar vi INTE annonsen — vi höjer
// jämförpriset tills claimen stämmer. Noll beroenden.
//
//   node tools/shopify-fix-compareat.mjs --product-id 16443175731549 --rabatt 40 [--dry]
//
// Jämförpris = ceil(pris / (1 − rabatt/100)) per variant — avrundat uppåt så
// att den verkliga rabatten alltid är ≥ claimen, aldrig under.
//
// Auth: mintar en färsk shpat-token via client credentials grant med
// SHOPIFY_CLIENT_ID_SE + SHOPIFY_CLIENT_SECRET_SE (+ SHOPIFY_SHOP_SE).
// Den statiska SHOPIFY_TOKEN_SE behövs inte och är i skrivande stund fel typ.

import { spawnSync } from 'node:child_process';
if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(r.status ?? 1);
}

const SHOP = process.env.SHOPIFY_SHOP_SE;
const ID = process.env.SHOPIFY_CLIENT_ID_SE;
const SECRET = process.env.SHOPIFY_CLIENT_SECRET_SE;

const args = process.argv.slice(2);
const productId = args[args.indexOf('--product-id') + 1];
const rabatt = Number(args[args.indexOf('--rabatt') + 1]);
const dry = args.includes('--dry');

if (!SHOP || !ID || !SECRET) { console.error('Saknar env SHOPIFY_SHOP_SE / SHOPIFY_CLIENT_ID_SE / SHOPIFY_CLIENT_SECRET_SE.'); process.exit(2); }
if (args.indexOf('--product-id') < 0 || args.indexOf('--rabatt') < 0 || !(rabatt > 0 && rabatt < 90)) {
  console.error('Användning: node tools/shopify-fix-compareat.mjs --product-id <numeriskt id> --rabatt <procent 1-89> [--dry]');
  process.exit(2);
}

const tokenResp = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ client_id: ID, client_secret: SECRET, grant_type: 'client_credentials' }),
});
if (!tokenResp.ok) { console.error(`Token-mint misslyckades: ${tokenResp.status} ${(await tokenResp.text()).slice(0, 200)}`); process.exit(1); }
const TOKEN = (await tokenResp.json()).access_token;

async function gql(query, variables) {
  const r = await fetch(`https://${SHOP}/admin/api/2025-07/graphql.json`, {
    method: 'POST', headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const d = await r.json();
  if (d.errors) { console.error('GraphQL-fel:', JSON.stringify(d.errors).slice(0, 300)); process.exit(1); }
  return d.data;
}

const gid = `gid://shopify/Product/${productId}`;
const prod = (await gql(`query($id: ID!) { product(id: $id) { title variants(first: 100) { nodes { id title price compareAtPrice } } } }`, { id: gid })).product;
if (!prod) { console.error(`Ingen produkt med id ${productId} i ${SHOP}.`); process.exit(1); }

console.log(`${prod.title} — mål: ${rabatt} % rabatt${dry ? ' (DRY)' : ''}`);
const variants = [];
for (const v of prod.variants.nodes) {
  const pris = Number(v.price);
  const nytt = Math.ceil(pris / (1 - rabatt / 100));
  const verklig = ((nytt - pris) / nytt * 100).toFixed(1);
  console.log(`  ${v.title}: ${v.price} / ${v.compareAtPrice ?? '—'} -> ${nytt}.00 (${verklig} %)`);
  variants.push({ id: v.id, compareAtPrice: `${nytt}.00` });
}
if (dry) { console.log('DRY — inget skrivet.'); process.exit(0); }

const out = (await gql(`mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
    productVariants { id compareAtPrice } userErrors { field message }
  } }`, { productId: gid, variants })).productVariantsBulkUpdate;

if (out.userErrors.length) { console.error('FEL:', JSON.stringify(out.userErrors)); process.exit(1); }
console.log(`${out.productVariants.length} varianter uppdaterade och verifierade i svaret.`);
