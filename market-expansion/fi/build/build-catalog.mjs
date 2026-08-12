#!/usr/bin/env node
// Monterar finska katalogen för Majavakauppa:
//   batches/*.json (källdata) + translations/*.fi.json (finsk copy, nyckel "fi")
//   -> output/catalog.fi.json  (komplett finsk katalog, API-vänlig)
//   -> output/shopify-import.csv (Shopify produktimport, status=draft)
//   -> output/build-report.md  (avvikelser, flags, kontrollsummor)
//
// Regler (grovjobb — slipas av Axel):
//   PRIS   : EUR = SEK / 11,5, avrundat till närmaste hela euro, minus 0,05
//            → psykologiskt X,95-pris. Minst 2,95. compareAt släpps om <= pris.
//   SKU    : MAJAVA-<KAT>-<NNN>[-<V>]  (NNN = löpnr, V = variantnr)
//            Temu-SKU bevaras i metafältet supplier_sku.
//   HANDLE : slugifierad finsk titel (ä/ö → a/o).
//   LAGER  : qty klampas till >= 0.
//   STATUS : draft (aktiveras efter godkännande).
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';

const dir = new URL('../batches/', import.meta.url);
const tdir = new URL('../translations/', import.meta.url);

const CAT_BY_COLLECTION = {
  'tradgard-utomhus': 'GARD',
  'bil-verktyg-garage': 'CAR',
  'camping-friluft': 'CAMP',
  'lantbruk-djur': 'FARM',
  'bat-marin': 'MARINE',
  'tillbehor-ovrigt': 'MISC',
  'fordon-belysning': 'VEH',
};
const CAT_BY_TYPE = {
  'Camping': 'CAMP', 'Friluft': 'CAMP', 'Golf': 'MISC', 'Skor': 'MISC',
  'Mobiltillbehör': 'MISC', 'Tillbehör': 'MISC', 'Verktyg': 'CAR',
  'Trädgård & Utomhus': 'GARD', 'Trädgård': 'GARD', 'Båt & Marin': 'MARINE',
  'Förvaring': 'MISC', 'Kläder': 'CAMP', 'Belysning': 'VEH', 'Fordon': 'VEH',
};

// Specialmallar per källhandle (sätts inline i productSet)
const TEMPLATE_BY_SOURCE = {
  'baverlampa-pro': 'beverlam',
  'bavertratt-tanka-utan-spill': 'snabbtrratter',
  'strandtofflor-for-herr-halkfria-tradgardsskor': 'strandtofflor',
  'garanti-for-saker-frakt': null, // standardmall
};
const DEFAULT_TEMPLATE = 'claudeprodukter';

const eur = n => {
  if (n == null || n === '') return null;
  const v = parseFloat(n) / 11.5;
  const r = Math.max(2.95, Math.round(v) - 0.05);
  return r.toFixed(2);
};

const slug = s => s.toLowerCase()
  .replaceAll('ä', 'a').replaceAll('ö', 'o').replaceAll('å', 'a')
  .replaceAll('æ', 'ae').replaceAll('ø', 'o').replaceAll('é', 'e').replaceAll('è', 'e')
  .replace(/["'’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);

const batches = readdirSync(dir).filter(f => f.endsWith('.json')).sort();
const report = [];
const products = [];
let missingTranslations = [];

for (const bf of batches) {
  const b = JSON.parse(readFileSync(new URL(bf, dir)));
  let t = { products: [] };
  try { t = JSON.parse(readFileSync(new URL(bf.replace('.json', '.fi.json'), tdir))); }
  catch { report.push(`SAKNAS: översättningsfil för ${bf}`); }
  const tByHandle = Object.fromEntries(t.products.map(p => [p.handle, p]));
  for (const p of b.products) {
    const tr = tByHandle[p.handle];
    if (!tr) { missingTranslations.push(p.handle); continue; }
    products.push({ src: p, fi: tr.fi, flags: tr.flags ?? [] });
  }
}

const seen = new Set();
let seq = 0;
const out = [];
for (const { src, fi, flags } of products) {
  seq++;
  const cat = src.handle === 'garanti-for-saker-frakt'
    ? 'SERV'
    : CAT_BY_COLLECTION[src.collection] ?? CAT_BY_TYPE[src.productType] ?? 'MISC';
  const skuBase = `MAJAVA-${cat}-${String(seq).padStart(3, '0')}`;
  let handle = slug(fi.title);
  while (seen.has(handle)) handle += '-2';
  seen.add(handle);

  const trVar = Object.fromEntries((fi.variants ?? []).map(v => [v.id, v]));
  const variants = src.variants.map((v, i) => {
    const tv = trVar[v.id];
    const price = eur(v.price);
    let compareAt = eur(v.compareAtPrice);
    if (compareAt != null && parseFloat(compareAt) <= parseFloat(price)) compareAt = null;
    // Shopifys tekniska sentinel får aldrig översättas
    const isDefault = v.title === 'Default Title';
    return {
      sourceVariantId: v.id,
      title: isDefault ? 'Default Title' : (tv?.title ?? v.title),
      selectedOptions: isDefault ? v.selectedOptions : (tv?.selectedOptions ?? v.selectedOptions),
      sku: src.variants.length === 1 ? skuBase : `${skuBase}-${i + 1}`,
      supplier_sku: v.sku,
      price,
      compareAtPrice: compareAt,
      inventoryQuantity: Math.max(0, v.inventoryQuantity ?? 0),
    };
  });

  out.push({
    sourceHandle: src.handle,
    handle,
    collection: src.collection,
    category: cat,
    templateSuffix: src.handle in TEMPLATE_BY_SOURCE ? TEMPLATE_BY_SOURCE[src.handle] : DEFAULT_TEMPLATE,
    title: fi.title,
    descriptionHtml: fi.descriptionHtml,
    vendor: 'Majavakauppa',
    productType: fi.productType,
    tags: fi.tags,
    status: 'DRAFT',
    seo: fi.seo,
    options: (src.options.length === 1 && src.options[0].name === 'Title')
      ? src.options
      : (fi.options ?? src.options),
    variants,
    images: src.images.map((im, i) => ({ url: im.url, altText: fi.imagesAlt?.[i] ?? im.altText })),
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
      r[`Option${oi + 1} Name`] = o.name ?? optNames[oi];
      r[`Option${oi + 1} Value`] = o.value;
    });
    Object.assign(r, {
      'Variant SKU': v.sku, 'Variant Inventory Tracker': 'shopify',
      'Variant Inventory Qty': v.inventoryQuantity, 'Variant Inventory Policy': 'continue',
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
mkdirSync(odir, { recursive: true });
writeFileSync(new URL('catalog.fi.json', odir), JSON.stringify({ products: out }, null, 1));
writeFileSync(new URL('shopify-import.csv', odir), rows.join('\n') + '\n');

const allFlags = out.filter(p => p.flags.length).map(p => `- ${p.handle}: ${p.flags.join(' | ')}`);
report.unshift(
  `# Byggrapport finsk katalog (${new Date().toISOString().slice(0,10)})`,
  `Produkter: ${out.length} · Varianter: ${out.reduce((a,p)=>a+p.variants.length,0)} · Bilder: ${out.reduce((a,p)=>a+p.images.length,0)}`,
  `Prisregel: EUR = SEK / 11,5 → närmaste hela euro − 0,05 (GRANSKAS AV AXEL)`,
  `Moms: Finland 25,5 % standardsats, priser inkl. moms.`,
  missingTranslations.length ? `SAKNADE ÖVERSÄTTNINGAR (${missingTranslations.length}): ${missingTranslations.join(', ')}` : 'Alla produkter har översättning.',
  '', '## Flags (juridik/anpassning)', ...(allFlags.length ? allFlags : ['(inga)'])
);
writeFileSync(new URL('build-report.md', odir), report.join('\n') + '\n');
console.log(`OK: ${out.length} produkter, ${rows.length - 1} CSV-rader. Flags: ${allFlags.length}. Saknade övers.: ${missingTranslations.length}`);
