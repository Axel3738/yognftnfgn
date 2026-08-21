// Public read-side: no auth needed. The Kaching app embed server-renders its full
// config into every product page, and the deal_blocks shop metafield is readable
// through the store's own public Storefront API token (that token is itself printed
// in the page's kaching-bundles-config JSON).

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) kaching-cli';

async function getText(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

function extractJsonScript(html, attrPattern) {
  const re = new RegExp(`<script[^>]*${attrPattern}[^>]*>([\\s\\S]*?)</script>`);
  const m = html.match(re);
  if (!m) return null;
  try { return JSON.parse(m[1].trim()); } catch { return null; }
}

export function baseUrl(storeInfo) {
  return storeInfo.publicUrl || `https://${storeInfo.myshopify}`;
}

// Find a product page and pull the kaching-bundles-config out of it.
export async function resolveStorefrontConfig(storeInfo) {
  const base = baseUrl(storeInfo);
  const productsRaw = await getText(`${base}/products.json?limit=10`);
  let products;
  try { products = JSON.parse(productsRaw).products; }
  catch { throw new Error(`${base}/products.json gav inte JSON — lösenordsskyddad butik? Använd admin-vägen.`); }
  if (!products?.length) throw new Error(`${base} har inga publika produkter`);
  for (const p of products) {
    const html = await getText(`${base}/products/${p.handle}`);
    const config = extractJsonScript(html, 'id="kaching-bundles-config"');
    if (config?.storefrontAccessToken) return { config, products, html, productHandle: p.handle };
  }
  throw new Error('hittade ingen kaching-bundles-config på någon produktsida — är app-embedden på?');
}

export async function fetchDealBlocks(storeInfo) {
  const { config } = await resolveStorefrontConfig(storeInfo);
  const res = await fetch(`https://${config.shopifyDomain}/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-shopify-storefront-access-token': config.storefrontAccessToken,
    },
    body: JSON.stringify({
      query: `{ shop { metafield(namespace: "app--2935586817--kaching_bundles", key: "deal_blocks") { value updatedAt } } }`,
    }),
  });
  const json = await res.json();
  const mf = json?.data?.shop?.metafield;
  if (!mf?.value) throw new Error(`deal_blocks-metafältet saknas/tomt: ${JSON.stringify(json).slice(0, 300)}`);
  return { dealBlocks: JSON.parse(mf.value), updatedAt: mf.updatedAt, config };
}

// What a specific live product page actually renders (post-CDN-cache truth).
export async function fetchProductPageSettings(storeInfo, productHandle) {
  const base = baseUrl(storeInfo);
  const html = await getText(`${base}/products/${productHandle}`);
  const blocks = [];
  const re = /<script class="kaching-bundles-deal-block-settings"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try { blocks.push(JSON.parse(m[1].trim())); } catch { /* skip unparsable */ }
  }
  return blocks;
}

export function summarizeDealBlock(b) {
  const bars = (b.dealBars || []).map((bar) =>
    `    bar ${bar.id} | ${bar.dealBarType} | qty ${bar.quantity} | ${bar.discountType}=${bar.discountValue} | "${bar.title}" / "${bar.subtitle}"${bar.badgeText ? ` | badge "${bar.badgeText}"` : ''}`,
  );
  const ab = b.abTestVariantNumber ? ` | A/B-variant ${b.abTestVariantNumber}/${b.abTestVariantsCount}` : '';
  return [
    `  block ${b.id} (nano ${b.nanoId}) | "${b.blockTitle}" | ${b.blockVisibility} | products [${(b.selectedProductIds || []).join(', ')}] | skipCart=${b.skipCart}${ab}`,
    ...bars,
  ].join('\n');
}

// Sanity checks. errors = almost certainly wrong (the MX two-pair default/0 bug);
// notes = worth eyeballing but can be deliberate (Oscar's 2-pair full-price anchor).
export function lintDealBlock(b) {
  const errors = [];
  const notes = [];
  for (const bar of b.dealBars || []) {
    // Widget source: any discountType other than specific/percentage/amount renders
    // full price x qty and silently ignores discountValue (the MX two-pair bug).
    if (bar.dealBarType === 'quantity-break' && !['specific', 'percentage', 'amount'].includes(bar.discountType)) {
      errors.push(`bar "${bar.title}" (qty ${bar.quantity}): discountType=${bar.discountType} => renderas som FULLPRIS x ${bar.quantity}${bar.discountValue ? ` och angivna värdet ${bar.discountValue} IGNORERAS tyst` : ''} — medvetet ankare eller MX-buggen?`);
    }
  }
  const qtys = (b.dealBars || []).filter((x) => x.dealBarType === 'quantity-break').map((x) => x.quantity);
  if (new Set(qtys).size !== qtys.length) errors.push(`dubblerade quantity-nivåer: ${qtys.join(',')}`);
  const priced = (b.dealBars || [])
    .filter((x) => x.dealBarType === 'quantity-break' && x.discountType === 'specific' && x.discountValue > 0 && x.quantity > 0)
    .sort((a, z) => a.quantity - z.quantity);
  for (let i = 1; i < priced.length; i++) {
    const prevUnit = priced[i - 1].discountValue / priced[i - 1].quantity;
    const unit = priced[i].discountValue / priced[i].quantity;
    if (unit > prevUnit) {
      notes.push(`bar "${priced[i].title}" (qty ${priced[i].quantity}): styckpris ${unit.toFixed(0)} > nivån under (${prevUnit.toFixed(0)}) — ankarpris eller fel?`);
    }
  }
  return { errors, notes };
}
