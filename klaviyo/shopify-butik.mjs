// Produktdata ur en butik i sparning/butiker.json, i samma form som
// mejl/shopify.mjs hamtaProdukter() ger för Bäverbutiken. Byggd 2026-09-25 för
// Matstrumpor (1r46tp-qx): brandfilen pekar hit med
//   "shopify": { "modul": "klaviyo/shopify-butik.mjs", "butik": "matstrumpor" }
// och produkter.mjs skickar hela `brand.shopify` som argument.
//
// Klienten är sparning/butik.mjs skapaKlient(): registret bär domänen
// (SHOPIFY_SHOP_<suffix> i miljön kan vara fel, mätt 2026-09-21 för
// Matstrumpor), nycklarna heter SHOPIFY_CLIENT_ID_<suffix> + SECRET.
// Läs-bart: bara products- och orders-frågor.

import { lasButik, skapaKlient } from '../sparning/butik.mjs';

const num = (gid) => String(gid).split('/').pop();

function kravButik(butik) {
  if (!butik) throw new Error('klaviyo/shopify-butik.mjs: brand.shopify.butik saknas (butikens id i sparning/butiker.json).');
  return lasButik(butik);
}

/**
 * Alla aktiva produkter, plattade som mejl/shopify.mjs: id, variant_id, titel,
 * handle, url, pris, jamforpris, lager, lagerpolicy, bild, typ, taggar,
 * kollektioner, en_variant, kopbar. Första varianten bär priset (Matstrumpors
 * sushi: "5 - Par" 399 kr först, "3 - Par" 369 kr sedan, mätt 2026-09-25).
 */
export async function hamtaProdukter({ butik, klient = null } = {}) {
  const b = kravButik(butik);
  const k = klient ?? (await skapaKlient(b));
  const ut = [];
  let after = null;
  for (;;) {
    const d = await k.graphql(
      `query($after: String) { products(first: 50, query: "status:active", after: $after) {
        pageInfo { hasNextPage endCursor }
        edges { node { id title handle onlineStoreUrl totalInventory productType tags hasOnlyDefaultVariant featuredImage { url }
          collections(first: 10) { edges { node { handle } } }
          variants(first: 1) { edges { node { id price compareAtPrice inventoryPolicy availableForSale } } } } } } }`,
      { after }
    );
    for (const { node: n } of d.products.edges) {
      const v = n.variants.edges[0]?.node ?? {};
      ut.push({
        id: num(n.id),
        variant_id: v.id ? num(v.id) : null,
        titel: n.title,
        handle: n.handle,
        url: n.onlineStoreUrl ?? `${b.url}/products/${n.handle}`,
        pris: Number(v.price ?? 0),
        jamforpris: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        lager: n.totalInventory,
        lagerpolicy: v.inventoryPolicy ?? null,
        bild: n.featuredImage?.url ?? null,
        typ: n.productType ?? '',
        taggar: n.tags ?? [],
        kollektioner: (n.collections?.edges ?? []).map((e) => e.node.handle),
        en_variant: Boolean(n.hasOnlyDefaultVariant),
        kopbar: v.availableForSale !== false,
      });
    }
    if (!d.products.pageInfo.hasNextPage) break;
    after = d.products.pageInfo.endCursor;
  }
  return ut;
}

/**
 * Mest sålda produkterna de senaste `dagar` dagarna, i sålda enheter över alla
 * ordrar som inte annullerats. Kräver read_orders. [{ handle, antal, ordrar, pris }]
 * fallande. Topplistan i välkomstmejlet kommer härifrån, aldrig ur tycke.
 */
export async function hamtaStorsaljare({ butik, dagar = 60, klient = null } = {}) {
  const b = kravButik(butik);
  const k = klient ?? (await skapaKlient(b));
  const sedan = new Date(Date.now() - dagar * 86400 * 1000).toISOString().slice(0, 10);
  const per = new Map();
  let after = null;
  for (let sida = 0; sida < 40; sida++) {
    const d = await k.graphql(
      `query($q: String!, $after: String) { orders(first: 250, query: $q, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { cancelledAt lineItems(first: 20) { nodes { quantity product { handle } variant { price } } } } } }`,
      { q: `created_at:>=${sedan}`, after }
    );
    for (const o of d.orders.nodes) {
      if (o.cancelledAt) continue;
      for (const li of o.lineItems.nodes) {
        if (!li.product?.handle) continue;
        const p = per.get(li.product.handle) ?? { handle: li.product.handle, antal: 0, ordrar: 0, pris: Number(li.variant?.price ?? 0) };
        p.antal += li.quantity;
        p.ordrar += 1;
        per.set(li.product.handle, p);
      }
    }
    if (!d.orders.pageInfo.hasNextPage) break;
    after = d.orders.pageInfo.endCursor;
  }
  return [...per.values()].sort((a, b) => b.antal - a.antal || b.ordrar - a.ordrar);
}
