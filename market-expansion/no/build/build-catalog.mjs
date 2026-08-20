#!/usr/bin/env node
// Monterar norska katalogen för beverbutikken.no:
//   batches/*.json (källdata) + translations/*.no.json (norsk copy)
//   -> output/catalog.no.json  (komplett norsk katalog, API-vänlig)
//   -> output/shopify-import.csv (Shopify produktimport, status=draft)
//   -> output/build-report.md  (avvikelser, flags, kontrollsummor)
//
// Regler (grovjobb — slipas av Axel):
//   PRIS   : NOK = samma tal som SEK (1:1). Källpriserna slutar redan på 9/0.
//   SKU    : BEVER-<KAT>-<NNN>[-<V>]  (NNN = löpnr i katalogordning, V = variantnr)
//            Temu-SKU bevaras i metafältkolumnen supplier_sku i JSON-outputen.
//   HANDLE : slugifierad norsk titel.
//   LAGER  : qty klampas till >= 0, policy deny, tracker shopify.
//   STATUS : draft (aktiveras efter godkännande).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const dir = new URL('../batches/', import.meta.url);
const tdir = new URL('../translations/', import.meta.url);

const CAT_BY_COLLECTION = {
  'tradgard-utomhus': 'HAGE',
  'bil-verktyg-garage': 'BIL',
  'camping-friluft': 'CAMP',
  'lantbruk-djur': 'LAND',
  'bat-marin': 'MARIN',
  'tillbehor-ovrigt': 'DIV',
  'fordon-belysning': 'KJT',
};
const CAT_BY_TYPE = {
  'Camping': 'CAMP', 'Friluft': 'CAMP', 'Golf': 'DIV', 'Skor': 'DIV',
  'Mobiltillbehör': 'DIV', 'Tillbehör': 'DIV', 'Verktyg': 'BIL',
  'Trädgård & Utomhus': 'HAGE', 'Trädgård': 'HAGE', 'Båt & Marin': 'MARIN',
  'Förvaring': 'DIV', 'Kläder': 'CAMP', 'Belysning': 'KJT', 'Fordon': 'KJT',
};

const slug = s => s.toLowerCase()
  .replaceAll('æ', 'ae').replaceAll('ø', 'o').replaceAll('å', 'a')
  .replaceAll('ä', 'a').replaceAll('ö', 'o').replaceAll('é', 'e').replaceAll('è', 'e')
  .replace(/["'’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);

const batches = readdirSync(dir).filter(f => f.endsWith('.json')).sort();
const report = [];
const products = [];
let missingTranslations = [];

for (const bf of batches) {
  const b = JSON.parse(readFileSync(new URL(bf, dir)));
  let t = { products: [] };
  try { t = JSON.parse(readFileSync(new URL(bf.replace('.json', '.no.json'), tdir))); }
  catch { report.push(`SAKNAS: översättningsfil för ${bf}`); }
  const tByHandle = Object.fromEntries(t.products.map(p => [p.handle, p]));
  for (const p of b.products) {
    const tr = tByHandle[p.handle];
    if (!tr) { missingTranslations.push(p.handle); continue; }
    products.push({ src: p, no: tr.no, flags: tr.flags ?? [] });
  }
}

const seen = new Set();
let seq = 0;
const out = [];
for (const { src, no, flags } of products) {
  seq++;
  const cat = src.handle === 'garanti-for-saker-frakt'
    ? 'SERV'
    : CAT_BY_COLLECTION[src.collection] ?? CAT_BY_TYPE[src.productType] ?? 'DIV';
  const skuBase = `BEVER-${cat}-${String(seq).padStart(3, '0')}`;
  let handle = slug(no.title);
  while (seen.has(handle)) handle += '-2';
  seen.add(handle);

  const trVar = Object.fromEntries((no.variants ?? []).map(v => [v.id, v]));
  const variants = src.variants.map((v, i) => {
    const tv = trVar[v.id];
    return {
      sourceVariantId: v.id,
      title: tv?.title ?? v.title,
      selectedOptions: tv?.selectedOptions ?? v.selectedOptions,
      sku: src.variants.length === 1 ? skuBase : `${skuBase}-${i + 1}`,
      supplier_sku: v.sku,
      price: v.price,             // 1:1 SEK -> NOK
      compareAtPrice: v.compareAtPrice,
      inventoryQuantity: Math.max(0, v.inventoryQuantity ?? 0),
    };
  });

  out.push({
    sourceHandle: src.handle,
    handle,
    collection: src.collection,
    category: cat,
    title: no.title,
    descriptionHtml: no.descriptionHtml,
    vendor: 'Beverbutikken',
    productType: no.productType,
    tags: no.tags,
    status: 'DRAFT',
    seo: no.seo,
    options: no.options ?? src.options,
    variants,
    images: src.images.map((im, i) => ({ url: im.url, altText: no.imagesAlt?.[i] ?? im.altText })),
    flags,
  });
}

// ---------- CSV ----------
const esc = v => v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replaceAll('"', '""')}"` : String(v);
const cols = ['Handle','Title','Body (HTML)','Vendor','Type','Tags','Published',
  'Option1 Name','Option1 Value','Option2 Name','Option2 Value','Option3 Name','Option3 Value',
  'Variant SKU','Variant Inventory Tracker','Variant Inventory Qty','Variant Inventory Policy',
  'Variant Fulfillment Service','Variant Price','Variant Compare At Price',
  'Variant Requires Shipping','Variant Taxable','Image Src','Image Position','Image Alt Text',
  'Gift Card','SEO Title','SEO Description','Status'];
const rows = [cols.join(',')];
for (const p of out) {
  const optNames = (p.options ?? []).map(o => o.name);
  p.variants.forEach((v, vi) => {
    const r = {};
    if (vi === 0) {
      Object.assign(r, {
        'Title': p.title, 'Body (HTML)': p.descriptionHtml, 'Vendor': p.vendor,
        'Type': p.productType, 'Tags': p.tags.join(', '), 'Published': 'FALSE',
        'Gift Card': 'FALSE', 'SEO Title': p.seo?.title, 'SEO Description': p.seo?.description,
        'Status': 'draft',
        'Image Src': p.images[0]?.url, 'Image Position': p.images[0] ? 1 : '',
        'Image Alt Text': p.images[0]?.altText,
      });
    }
    r['Handle'] = p.handle;
    (v.selectedOptions ?? []).slice(0, 3).forEach((o, oi) => {
      r[`Option${oi + 1} Name`] = vi === 0 ? (o.name ?? optNames[oi]) : (o.name ?? optNames[oi]);
      r[`Option${oi + 1} Value`] = o.value;
    });
    Object.assign(r, {
      'Variant SKU': v.sku, 'Variant Inventory Tracker': 'shopify',
      'Variant Inventory Qty': v.inventoryQuantity, 'Variant Inventory Policy': 'deny',
      'Variant Fulfillment Service': 'manual', 'Variant Price': v.price,
      'Variant Compare At Price': v.compareAtPrice ?? '',
      'Variant Requires Shipping': 'TRUE', 'Variant Taxable': 'TRUE',
    });
    rows.push(cols.map(c => esc(r[c])).join(','));
  });
  p.images.slice(1).forEach((im, i) => {
    const r = { 'Handle': p.handle, 'Image Src': im.url, 'Image Position': i + 2, 'Image Alt Text': im.altText };
    rows.push(cols.map(c => esc(r[c])).join(','));
  });
}

// ---------- skriv ----------
const odir = new URL('../output/', import.meta.url);
import { mkdirSync } from 'node:fs';
mkdirSync(odir, { recursive: true });
writeFileSync(new URL('catalog.no.json', odir), JSON.stringify({ products: out }, null, 1));
writeFileSync(new URL('shopify-import.csv', odir), rows.join('\n') + '\n');

const allFlags = out.filter(p => p.flags.length).map(p => `- ${p.handle}: ${p.flags.join(' | ')}`);
report.unshift(
  `# Byggrapport norsk katalog (${new Date().toISOString().slice(0,10)})`,
  `Produkter: ${out.length} · Varianter: ${out.reduce((a,p)=>a+p.variants.length,0)} · Bilder: ${out.reduce((a,p)=>a+p.images.length,0)}`,
  missingTranslations.length ? `SAKNADE ÖVERSÄTTNINGAR (${missingTranslations.length}): ${missingTranslations.join(', ')}` : 'Alla produkter har översättning.',
  '', '## Flags (juridik/anpassning)', ...(allFlags.length ? allFlags : ['(inga)'])
);
writeFileSync(new URL('build-report.md', odir), report.join('\n') + '\n');
console.log(`OK: ${out.length} produkter, ${rows.length - 1} CSV-rader. Flags: ${allFlags.length}. Saknade övers.: ${missingTranslations.length}`);
