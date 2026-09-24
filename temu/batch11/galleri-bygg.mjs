// Lägger skördens galleri på produkterna i SE och NO enligt galleri.mjs (förberett av galleri-fix.mjs).
//   node temu/batch11/galleri-bygg.mjs <se|no> [--skarp] [id …]
// Finns produkten (SKU) → nya bilder laddas upp med alt-text, ordnas (QC-fotot först eller sist),
// beskrivningen byggs om i 7-blocksordningen med GIF/bild A, bild B, bild C.
// Finns den inte (VÄNTA → bygg) → skapas komplett: titel, galleri, beskrivning, variant, alla kanaler.
// Idempotent: en bild vars alt-text redan finns på produkten laddas inte upp igen.
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
import { PRIS } from './priser.mjs';
import { GALLERI } from './galleri.mjs';
import { beskrivning, SPRÅK } from './beskrivning.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const UT = '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/galleri';
const VENDOR = { se: 'Bäverbutiken', no: 'Beverbutikken' };
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const land = process.argv[2], skarp = process.argv.includes('--skarp');
const bara = process.argv.slice(3).filter((a) => !a.startsWith('--'));
if (!['se', 'no'].includes(land)) { console.error('Användning: node temu/batch11/galleri-bygg.mjs <se|no> [--skarp] [id …]'); process.exit(1); }
const COPY = JSON.parse(readFileSync(path.join(HÄR, 'copy.json'), 'utf8'));
const b = new Butik(land); const shop = await b.verifiera();
if ((land === 'se' && shop.currencyCode !== 'SEK') || (land === 'no' && shop.currencyCode !== 'NOK')) throw new Error(`Fel butik: ${shop.name}`);
console.log(`${shop.name} — ${skarp ? 'SKARP KÖRNING' : 'torrkörning'}\n`);
const kanaler = skarp ? await b.kanaler() : [];
const utfil = (id, x) => path.join(UT, id, `${x.ny || x.fil}${x.kie ? '-sv' : ''}.jpg`);

async function väntaMedia(pid, ids) {
  for (let i = 0; ; i++) {
    await sov(3000);
    const s = await b.fraga(`query($id:ID!){product(id:$id){media(first:50){nodes{id status alt ... on MediaImage{image{url}}}}}}`, { id: pid });
    const rel = s.product.media.nodes.filter((n) => ids.includes(n.id));
    if (rel.length === ids.length && rel.every((n) => n.status === 'READY')) return ids.map((m) => { const n = rel.find((x) => x.id === m); return { id: n.id, url: n.image.url, alt: n.alt }; });
    if (rel.some((n) => n.status === 'FAILED')) throw new Error('media FAILED');
    if (i > 60) throw new Error('media tog för lång tid');
  }
}
async function laddaUpp(pid, filer) {   // filer: [{fil, alt, gif}]
  const ut = [];
  for (let start = 0; start < filer.length; start += 8) {           // åtta i taget
    const del = filer.slice(start, start + 8);
    const st = await b.mutera(`mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
      { input: del.map((f) => ({ filename: path.basename(f.fil), mimeType: f.gif ? 'image/gif' : 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(readFileSync(f.fil).length) })) }, 'stagedUploadsCreate');
    for (let i = 0; i < del.length; i++) { const res = await fetch(st.stagedTargets[i].url, { method: 'PUT', headers: { 'content-type': del[i].gif ? 'image/gif' : 'image/jpeg' }, body: readFileSync(del[i].fil) }); if (!res.ok) throw new Error(`PUT ${del[i].fil}: ${res.status}`); }
    const cm = await b.mutera(`mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
      { productId: pid, media: st.stagedTargets.map((t, i) => ({ mediaContentType: 'IMAGE', originalSource: t.resourceUrl, alt: del[i].alt })) }, 'productCreateMedia');
    ut.push(...await väntaMedia(pid, cm.media.map((m) => m.id)));
  }
  return ut;
}

for (const [id, g] of Object.entries(GALLERI)) {
  if (bara.length && !bara.includes(id)) continue;
  const f = FAKTA[id], t = COPY[id]?.[SPRÅK[land]], p = PRIS.find((x) => x.id === id)?.land[land.toUpperCase()];
  if (!t) { console.log(`- ${id}: ingen ${SPRÅK[land]}-copy — hoppar`); continue; }
  const nya = g.bilder.map((x) => ({ fil: utfil(id, x), alt: x.alt })).filter((x) => existsSync(x.fil) || console.log(`  ! ${id}: saknar ${path.basename(x.fil)} (KIE ej klar?) — hoppas`));
  const gif = g.gif && existsSync(path.join(UT, id, 'video.gif')) ? { fil: path.join(UT, id, 'video.gif'), alt: g.gif.alt, gif: true } : null;
  if (!nya.length && !gif) { console.log(`- ${id}: inga nya bilder`); continue; }

  const finns = (await b.fraga(`query($q:String!){products(first:2,query:$q){nodes{id title handle status media(first:50){nodes{id alt ... on MediaImage{image{url}}}}}}}`, { q: `sku:${f.sku}` })).products.nodes[0];
  if (!finns && f.status !== 'bygg') { console.log(`- ${id}: finns inte och status ${f.status} — hoppar`); continue; }
  const gamla = finns ? finns.media.nodes.map((m) => ({ id: m.id, url: m.image?.url, alt: m.alt })) : [];
  const attLadda = [...(gif ? [gif] : []), ...nya].filter((x) => !gamla.some((m) => m.alt === x.alt));
  if (!skarp) { console.log(`${finns ? '~' : '+'} ${id}: ${finns ? finns.title : t.titel}\n    ${gamla.length} befintliga, ${attLadda.length} nya (${nya.length} bilder${gif ? ' + gif' : ''}), QC ${g.qc || 'sist'}${finns ? '' : ` · SKAPAS ${p.pris}/${p.jamfor} cogs ${p.cogs}`}`); continue; }

  let pid = finns?.id;
  if (!pid) {
    pid = (await b.mutera(`mutation($product: ProductCreateInput!) { productCreate(product: $product) { product { id } userErrors { field message } } }`,
      { product: { title: t.titel, vendor: VENDOR[land], status: 'DRAFT', templateSuffix: 'claudeprodukter', category: f.kategori, tags: t.taggar, seo: { title: t.seoTitel, description: t.seoText } } }, 'productCreate')).product.id;
  }
  const uppl = attLadda.length ? await laddaUpp(pid, attLadda) : [];
  // alla media i önskad ordning: [gif?, nya…] + QC, eller QC + [nya…] (gif ligger alltid först bland de nya)
  const alla = (await b.fraga(`query($id:ID!){product(id:$id){media(first:50){nodes{id alt ... on MediaImage{image{url}}}}}}`, { id: pid })).product.media.nodes.map((m) => ({ id: m.id, url: m.image?.url, alt: m.alt }));
  const byAlt = (alt) => alla.find((m) => m.alt === alt);
  const nyaM = [...(gif ? [byAlt(gif.alt)] : []), ...nya.map((x) => byAlt(x.alt))].filter(Boolean);
  const qcM = alla.filter((m) => !nyaM.includes(m));
  const ordning = g.qc === 'forst' ? [...qcM, ...nyaM] : [...nyaM, ...qcM];
  const moves = ordning.map((m, i) => ({ id: m.id, newPosition: String(i) })).filter((mv, i) => alla[i]?.id !== mv.id);
  if (moves.length) await b.mutera(`mutation($id:ID!,$moves:[MoveInput!]!){productReorderMedia(id:$id,moves:$moves){userErrors{field message}}}`, { id: pid, moves }, 'productReorderMedia');
  // beskrivningens tre bildplatser: A = gif eller första nya bilden, B = nästa, C = nästa (annars QC)
  const bilderNya = nya.map((x) => byAlt(x.alt)).filter(Boolean);
  const gifM = gif ? byAlt(gif.alt) : null;
  const pool = [...bilderNya, ...qcM];
  const A = gifM ? { ...gifM, gif: true } : pool.shift(); if (!gifM) {} else {}
  const B = pool.shift() || null, C = pool.shift() || null;
  await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
    { input: { id: pid, descriptionHtml: beskrivning(t, { a: A, b: B, c: C }, land), ...(finns ? {} : { status: 'ACTIVE' }) } }, 'productUpdate');
  if (!finns) {
    const v = await b.fraga(`query($id:ID!){product(id:$id){variants(first:3){nodes{id}}}}`, { id: pid });
    await b.mutera(`mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!){productVariantsBulkUpdate(productId:$productId,variants:$variants){userErrors{field message}}}`,
      { productId: pid, variants: [{ id: v.product.variants.nodes[0].id, price: String(p.pris), compareAtPrice: String(p.jamfor), taxable: false, inventoryPolicy: 'CONTINUE', inventoryItem: { sku: f.sku, tracked: false, cost: String(p.cogs) } }] }, 'productVariantsBulkUpdate');
    await b.mutera(`mutation($id:ID!,$input:[PublicationInput!]!){publishablePublish(id:$id,input:$input){userErrors{field message}}}`, { id: pid, input: kanaler.map((k) => ({ publicationId: k.id })) }, 'publishablePublish');
  }
  await sov(1500);
  const q = (await b.fraga(`query($id:ID!){product(id:$id){title handle status resourcePublicationsCount{count} variants(first:1){nodes{sku price compareAtPrice}} media(first:50){nodes{status}}}}`, { id: pid })).product;
  console.log(`${finns ? '~' : '+'} ${id}: ${q.title}\n    ${q.status} | ${q.variants.nodes[0].price}/${q.variants.nodes[0].compareAtPrice} | ${q.media.nodes.filter((m) => m.status === 'READY').length}/${q.media.nodes.length} media | ${q.resourcePublicationsCount.count} kanaler | ${uppl.length} uppladdade\n    ${land === 'se' ? 'https://baverbutiken.se' : 'https://beverbutikken.no'}/products/${q.handle}`);
}
