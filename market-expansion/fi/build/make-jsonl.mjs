#!/usr/bin/env node
// Genererar JSONL med productSet-inputs för Majavakauppa.
// Förbättring mot Norge-körningen: inventoryPolicy CONTINUE + templateSuffix sätts INLINE.
import { readFileSync, writeFileSync } from 'node:fs';

const LOCATION = 'gid://shopify/Location/126371955037';
const COLL = {
  'tradgard-utomhus': 'gid://shopify/Collection/720966877533',   // Garden & Outdoors
  'bil-verktyg-garage': 'gid://shopify/Collection/720966910301', // Car, Tools & Garage
  'camping-friluft': 'gid://shopify/Collection/720966943069',    // Camping & Outdoor Life
  'lantbruk-djur': 'gid://shopify/Collection/720966975837',      // Farming & Animals
  'bat-marin': 'gid://shopify/Collection/720967008605',          // Boat & Marine
  'tillbehor-ovrigt': 'gid://shopify/Collection/720967041373',   // Accessories & More
  'fordon-belysning': 'gid://shopify/Collection/720967074141',   // Vehicles & Lighting
};
const FRONTPAGE = 'gid://shopify/Collection/720947151197';

const cat = JSON.parse(readFileSync(new URL('../output/catalog.fi.json', import.meta.url)));
const lines = [];

for (const p of cat.products) {
  const optNames = [];
  const optValues = {};
  for (const v of p.variants) {
    for (const o of v.selectedOptions ?? []) {
      if (!optNames.includes(o.name)) { optNames.push(o.name); optValues[o.name] = []; }
      if (!optValues[o.name].includes(o.value)) optValues[o.name].push(o.value);
    }
  }
  if (optNames.length === 0) { optNames.push('Title'); optValues['Title'] = ['Default Title']; }

  const collections = [];
  if (COLL[p.collection]) collections.push(COLL[p.collection]);
  if (p.sourceHandle === 'baverlampa-pro') collections.push(FRONTPAGE);

  const input = {
    title: p.title,
    handle: p.handle,
    descriptionHtml: p.descriptionHtml,
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags,
    status: 'DRAFT',
    templateSuffix: p.templateSuffix ?? undefined,
    seo: p.seo?.title || p.seo?.description ? { title: p.seo.title, description: p.seo.description } : undefined,
    collections: collections.length ? collections : undefined,
    productOptions: optNames.map((n, i) => ({ name: n, position: i + 1, values: optValues[n].map(name => ({ name })) })),
    files: p.images.slice(0, 30).map(im => ({
      originalSource: im.url,
      alt: im.altText ?? undefined,
      contentType: 'IMAGE',
      duplicateResolutionMode: 'APPEND_UUID',
    })),
    variants: p.variants.map(v => ({
      optionValues: (v.selectedOptions?.length ? v.selectedOptions : [{ name: 'Title', value: 'Default Title' }])
        .map(o => ({ optionName: o.name, name: o.value })),
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? undefined,
      sku: v.sku,
      inventoryPolicy: 'CONTINUE',
      inventoryItem: { tracked: true, requiresShipping: true },
      inventoryQuantities: [{ locationId: LOCATION, name: 'available', quantity: v.inventoryQuantity }],
      metafields: v.supplier_sku
        ? [{ namespace: 'custom', key: 'supplier_sku', type: 'single_line_text_field', value: v.supplier_sku }]
        : undefined,
    })),
  };
  lines.push(JSON.stringify({ input }));
}

writeFileSync(new URL('../output/products-bulk.jsonl', import.meta.url), lines.join('\n') + '\n');
console.log(`${lines.length} rader JSONL skrivna.`);
