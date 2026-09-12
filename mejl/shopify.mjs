// Bäverbutikens Shopify (SE) för mejlsystemet. Noll beroenden.
//
// Auth: mintar en färsk token via client credentials grant med
// SHOPIFY_CLIENT_ID_SE + SHOPIFY_CLIENT_SECRET_SE + SHOPIFY_SHOP_SE — samma
// väg som tools/shopify-fix-compareat.mjs. Den statiska SHOPIFY_TOKEN_SE är
// fel typ (mätt 2026-09-12: "Invalid API key or access token").
//
// ⚠️ Appen "Bäver uppladdare" har BARA produkt-, lager- och publicerings-
// behörighet (mätt 2026-09-12: read/write_products, read/write_inventory,
// read/write_publications). Rabatter, ordrar, kunder, segment och sidor går
// INTE via den här nyckeln — därför skapas rabattkoden i admin (mejl/README.md).

import { spawnSync } from 'node:child_process';

const API_VERSION = '2025-07';

// Undici läser inte HTTPS_PROXY av sig själv; kör om processen med flaggan
// satt så anropen går genom sessionens proxy. Samma knep som compareat-skriptet.
export function kravProxy() {
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
    const r = spawnSync(process.execPath, process.argv.slice(1), {
      stdio: 'inherit',
      env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
    });
    process.exit(r.status ?? 1);
  }
}

export function kravEnv(env = process.env) {
  const saknas = ['SHOPIFY_SHOP_SE', 'SHOPIFY_CLIENT_ID_SE', 'SHOPIFY_CLIENT_SECRET_SE'].filter((n) => !env[n]);
  if (saknas.length) throw new Error(`Saknade miljövariabler: ${saknas.join(', ')}`);
  return { shop: env.SHOPIFY_SHOP_SE, id: env.SHOPIFY_CLIENT_ID_SE, secret: env.SHOPIFY_CLIENT_SECRET_SE };
}

let tokenCache = null;
async function token() {
  if (tokenCache) return tokenCache;
  const { shop, id, secret } = kravEnv();
  const svar = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: id, client_secret: secret, grant_type: 'client_credentials' }),
  });
  const j = await svar.json();
  if (!j.access_token) throw new Error(`Kunde inte minta Shopify-token: ${JSON.stringify(j).slice(0, 300)}`);
  tokenCache = j.access_token;
  return tokenCache;
}

// Kör en fråga/mutation. Kastar på HTTP-fel, GraphQL-fel och userErrors.
export async function graphql(query, variables = {}) {
  const { shop } = kravEnv();
  const svar = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': await token() },
    body: JSON.stringify({ query, variables }),
  });
  if (!svar.ok) throw new Error(`Shopify svarade ${svar.status}: ${(await svar.text()).slice(0, 400)}`);
  const j = await svar.json();
  if (j.errors) throw new Error(`GraphQL-fel: ${JSON.stringify(j.errors).slice(0, 600)}`);
  for (const [op, payload] of Object.entries(j.data ?? {})) {
    const fel = payload?.userErrors;
    if (Array.isArray(fel) && fel.length) {
      throw new Error(`Shopify avvisade ${op}: ${fel.map((f) => f.message).join('; ')}`);
    }
  }
  return j.data;
}

const num = (gid) => String(gid).split('/').pop();

// Alla aktiva produkter, plattade: id, variant, titel, handle, url, pris,
// jämförpris, lager, lagerpolicy, bild. Sidor om 100 tills slut.
export async function hamtaProdukter() {
  const ut = [];
  let after = null;
  for (;;) {
    const d = await graphql(
      `query($after: String) { products(first: 100, query: "status:active", after: $after) {
        pageInfo { hasNextPage endCursor }
        edges { node { id title handle onlineStoreUrl totalInventory featuredImage { url }
          variants(first: 1) { edges { node { id price compareAtPrice inventoryPolicy } } } } } } }`,
      { after }
    );
    for (const { node: n } of d.products.edges) {
      const v = n.variants.edges[0]?.node ?? {};
      ut.push({
        id: num(n.id),
        variant_id: v.id ? num(v.id) : null,
        titel: n.title,
        handle: n.handle,
        url: n.onlineStoreUrl ?? `https://baverbutiken.se/products/${n.handle}`,
        pris: Number(v.price ?? 0),
        jamforpris: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        lager: n.totalInventory,
        lagerpolicy: v.inventoryPolicy ?? null,
        bild: n.featuredImage?.url ?? null,
      });
    }
    if (!d.products.pageInfo.hasNextPage) break;
    after = d.products.pageInfo.endCursor;
  }
  return ut;
}

export async function hamtaKollektion(handle) {
  const d = await graphql(
    `query($h: String!) { collectionByHandle(handle: $h) { id title handle descriptionHtml
      products(first: 50) { edges { node { id handle } } } } }`,
    { h: handle }
  );
  return d.collectionByHandle;
}

export async function onlineStorePublikation() {
  const d = await graphql(`{ publications(first: 10) { edges { node { id name } } } }`);
  const p = d.publications.edges.map((e) => e.node).find((n) => n.name === 'Online Store');
  if (!p) throw new Error('Hittade ingen publikation som heter "Online Store".');
  return p.id;
}

// Skapar eller uppdaterar kollektionen. Idempotent på handle.
export async function skapaEllerUppdateraKollektion({ handle, titel, beskrivningHtml, produktIds }) {
  const gids = produktIds.map((id) => `gid://shopify/Product/${id}`);
  const finns = await hamtaKollektion(handle);
  if (!finns) {
    const d = await graphql(
      `mutation($input: CollectionInput!) { collectionCreate(input: $input) { collection { id handle } userErrors { field message } } }`,
      { input: { title: titel, handle, descriptionHtml: beskrivningHtml, products: gids } }
    );
    const id = d.collectionCreate.collection.id;
    await graphql(
      `mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
      { id, input: [{ publicationId: await onlineStorePublikation() }] }
    );
    return { id, skapad: true };
  }
  await graphql(
    `mutation($input: CollectionInput!) { collectionUpdate(input: $input) { collection { id } userErrors { field message } } }`,
    { input: { id: finns.id, title: titel, descriptionHtml: beskrivningHtml } }
  );
  const har = new Set(finns.products.edges.map((e) => e.node.id));
  const nya = gids.filter((g) => !har.has(g));
  if (nya.length) {
    await graphql(
      `mutation($id: ID!, $p: [ID!]!) { collectionAddProducts(id: $id, productIds: $p) { userErrors { field message } } }`,
      { id: finns.id, p: nya }
    );
  }
  const bort = [...har].filter((g) => !gids.includes(g));
  if (bort.length) {
    await graphql(
      `mutation($id: ID!, $p: [ID!]!) { collectionRemoveProducts(id: $id, productIds: $p) { userErrors { field message } } }`,
      { id: finns.id, p: bort }
    );
  }
  return { id: finns.id, skapad: false, tillagda: nya.length, borttagna: bort.length };
}
