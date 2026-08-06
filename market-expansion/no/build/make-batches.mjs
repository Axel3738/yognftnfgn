#!/usr/bin/env node
// Delar upp källkatalogen i översättningsbatchar för beverkobling.no.
// Urval: alla ACTIVE + fraktskydds-upsellen (UNLISTED "Garanti för säker frakt").
// Exkluderas: DRAFT, ARCHIVED, app-produkten "Blanda & Spara".
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const src = JSON.parse(readFileSync(new URL('../../source-export/products-all.json', import.meta.url)));
const coll = JSON.parse(readFileSync(new URL('../../source-export/collections.json', import.meta.url)));

const handleToCollection = {};
for (const c of coll.collections) {
  if (c.handle === 'frontpage') continue;
  for (const h of c.productHandles) handleToCollection[h] ??= c.handle;
}

const keep = src.products.filter(p =>
  p.status === 'ACTIVE' ||
  (p.status === 'UNLISTED' && p.handle.startsWith('garanti-for-saker-frakt'))
);

const items = keep.map(p => ({
  handle: p.handle,
  legacyId: p.legacyResourceId,
  status: p.status,
  vendor: p.vendor,
  productType: p.productType,
  tags: p.tags,
  title: p.title,
  descriptionHtml: p.descriptionHtml,
  seo: p.seo,
  collection: handleToCollection[p.handle] ?? null,
  options: p.options,
  variants: p.variants.edges.map(e => ({
    id: e.node.id,
    title: e.node.title,
    sku: e.node.sku,
    price: e.node.price,
    compareAtPrice: e.node.compareAtPrice,
    inventoryQuantity: e.node.inventoryQuantity,
    selectedOptions: e.node.selectedOptions,
  })),
  images: p.images.edges.map(e => ({ url: e.node.url, altText: e.node.altText })),
}));

mkdirSync(new URL('../batches/', import.meta.url), { recursive: true });
const SIZE = 14;
let n = 0;
for (let i = 0; i < items.length; i += SIZE) {
  n++;
  writeFileSync(
    new URL(`../batches/batch-${String(n).padStart(2, '0')}.json`, import.meta.url),
    JSON.stringify({ batch: n, products: items.slice(i, i + SIZE) }, null, 1)
  );
}
console.log(`${items.length} produkter -> ${n} batchar (à ${SIZE})`);
console.log('utan kollektion:', items.filter(i => !i.collection).map(i => i.handle).join(', ') || '(inga)');
