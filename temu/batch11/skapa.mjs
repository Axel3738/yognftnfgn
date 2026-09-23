// Skapar batch 11–13 i bäverbutiken.se och beverbutikken.no.
//   node temu/batch11/skapa.mjs <se|no> [--skarp] [id …]
// Underlag: fakta.mjs (status 'bygg'), copy.json (sv/no), priser.mjs, bilder i
//   <scratch>/b11/ut/<id>/ (SE) och ut-no/<id>/ (NO): <id>-hero.jpg, <id>-detalj.jpg.
// Specialfall rcoffroad: finns redan i SE (fakta.seFinns) → SE = uppdatera sidan/varianten,
//   NO = skapa med SE:s befintliga CDN-bilder som originalSource.
// Beskrivning (CLAUDE.md): problem → lösning → hero → funktioner → detalj → (varning) → garanti.
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
import { PRIS } from './priser.mjs';
import { GARANTI4, RUBRIKER4 } from '../utrullning/texter4.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const VENDOR = { se: 'Bäverbutiken', no: 'Beverbutikken' };
const SPRÅK = { se: 'sv', no: 'no' };
const MAPP = { se: '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/b11/ut', no: '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/b11/ut-no' };
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const land = process.argv[2], skarp = process.argv.includes('--skarp');
const bara = process.argv.slice(3).filter((a) => !a.startsWith('--'));
if (!['se', 'no'].includes(land)) { console.error('Användning: node temu/batch11/skapa.mjs <se|no> [--skarp] [id …]'); process.exit(1); }
const COPY = JSON.parse(readFileSync(path.join(HÄR, 'copy.json'), 'utf8'));
const b = new Butik(land);
const shop = await b.verifiera();
if ((land === 'se' && shop.currencyCode !== 'SEK') || (land === 'no' && shop.currencyCode !== 'NOK')) throw new Error(`Fel butik: ${shop.name} ${shop.currencyCode}`);
console.log(`${shop.name} (${shop.currencyCode}) — ${skarp ? 'SKARP KÖRNING' : 'torrkörning'}\n`);
const r = RUBRIKER4[SPRÅK[land]];
const kanaler = skarp ? await b.kanaler() : [];

const bildHtml = (u, alt, t) => u ? `<p><img src="${u}" alt="${esc(alt || t.titel)}" loading="lazy" style="max-width:100%;height:auto"></p>` : '';
const beskrivning = (t, url) =>
  `<h3>${esc(t.problemH)}</h3><p>${esc(t.problemP)}</p>` +
  `<h3>${esc(t.losningH)}</h3><p>${esc(t.losningP)}</p>` +
  bildHtml(url.hero, t.alt?.hero, t) +
  `<h3>${r.funktioner}</h3><ul>\n` + t.bullets.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` +
  bildHtml(url.detalj, t.alt?.detalj, t) +
  (t.varning ? `<p><em>${esc(t.varning)}</em></p>` : '') +
  `<h3>${r.garanti}</h3><p>${GARANTI4[SPRÅK[land]]}</p>`;

async function väntaMedia(pid, ids) {
  for (let i = 0; ; i++) {
    await sov(3000);
    const s = await b.fraga(`query($id:ID!){product(id:$id){media(first:20){nodes{id status ... on MediaImage{image{url}}}}}}`, { id: pid });
    const rel = s.product.media.nodes.filter((n) => ids.includes(n.id));
    if (rel.length === ids.length && rel.every((n) => n.status === 'READY')) return ids.map((m) => rel.find((n) => n.id === m).image.url);
    if (rel.some((n) => n.status === 'FAILED')) throw new Error('media FAILED');
    if (i > 40) throw new Error('media tog för lång tid');
  }
}
async function laddaUpp(pid, filer, alts) {
  const st = await b.mutera(`mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
    { input: filer.map((f) => ({ filename: path.basename(f), mimeType: 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(readFileSync(f).length) })) }, 'stagedUploadsCreate');
  for (let i = 0; i < filer.length; i++) { const res = await fetch(st.stagedTargets[i].url, { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: readFileSync(filer[i]) }); if (!res.ok) throw new Error(`PUT ${filer[i]}: ${res.status}`); }
  const cm = await b.mutera(`mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
    { productId: pid, media: st.stagedTargets.map((t, i) => ({ mediaContentType: 'IMAGE', originalSource: t.resourceUrl, alt: alts[i] })) }, 'productCreateMedia');
  return väntaMedia(pid, cm.media.map((m) => m.id));
}
async function mediaFrånUrl(pid, urls, alts) {
  const cm = await b.mutera(`mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
    { productId: pid, media: urls.map((u, i) => ({ mediaContentType: 'IMAGE', originalSource: u, alt: alts[i] })) }, 'productCreateMedia');
  return väntaMedia(pid, cm.media.map((m) => m.id));
}
async function sättVariant(pid, p, f) {
  const v = await b.fraga(`query($id:ID!){product(id:$id){variants(first:3){nodes{id}}}}`, { id: pid });
  await b.mutera(`mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!){productVariantsBulkUpdate(productId:$productId,variants:$variants){userErrors{field message}}}`,
    { productId: pid, variants: [{ id: v.product.variants.nodes[0].id, price: String(p.pris), compareAtPrice: String(p.jamfor), taxable: false, inventoryPolicy: 'CONTINUE',
        inventoryItem: { sku: f.sku, tracked: false, cost: String(p.cogs) } }] }, 'productVariantsBulkUpdate');
}
async function slutläs(id, pid) {
  await sov(2000);
  const q = (await b.fraga(`query($id:ID!){product(id:$id){title handle status resourcePublicationsCount{count} variants(first:3){nodes{sku price compareAtPrice taxable inventoryItem{unitCost{amount}}}} media(first:20){nodes{status}}}}`, { id: pid })).product;
  const v0 = q.variants.nodes[0];
  console.log(`+ ${id}: ${q.title}\n    ${q.status} | ${v0.price}/${v0.compareAtPrice} | moms ${v0.taxable} | cogs ${v0.inventoryItem.unitCost?.amount} | ${v0.sku} | ${q.media.nodes.filter((m) => m.status === 'READY').length}/${q.media.nodes.length} media | ${q.resourcePublicationsCount.count} kanaler\n    ${land === 'se' ? 'https://baverbutiken.se' : 'https://beverbutikken.no'}/products/${q.handle}`);
}

for (const [id, f] of Object.entries(FAKTA)) {
  if (bara.length && !bara.includes(id)) continue;
  if (f.status !== 'bygg') continue;
  const t = COPY[id]?.[SPRÅK[land]];
  if (!t) { console.log(`- ${id}: ingen ${SPRÅK[land]}-copy — hoppar`); continue; }
  const p = PRIS.find((x) => x.id === id).land[land.toUpperCase()];
  const mapp = path.join(MAPP[land], id);
  const hero = path.join(mapp, `${id}-hero.jpg`), detalj = path.join(mapp, `${id}-detalj.jpg`);
  const filer = [hero, detalj].filter(existsSync);

  // ── rcoffroad i SE: uppdatera den befintliga produkten i stället för att skapa ──
  if (land === 'se' && f.seFinns) {
    const q = (await b.fraga(`query($id:ID!){product(id:$id){id title media(first:10){nodes{... on MediaImage{image{url}}}}}}`, { id: f.seFinns })).product;
    const urls = q.media.nodes.map((m) => m.image?.url).filter(Boolean);
    if (!skarp) { console.log(`~ ${id}: UPPDATERAR ${q.title} → "${t.titel}" · ${p.pris}/${p.jamfor} · cogs ${p.cogs} · ${urls.length} befintliga bilder`); continue; }
    await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
      { input: { id: f.seFinns, title: t.titel, descriptionHtml: beskrivning(t, { hero: urls[0], detalj: urls[1] }), tags: t.taggar, category: f.kategori, templateSuffix: 'claudeprodukter',
          seo: { title: t.seoTitel, description: t.seoText } } }, 'productUpdate');
    await sättVariant(f.seFinns, p, f);
    await slutläs(id, f.seFinns); continue;
  }

  const finns = await b.fraga(`query($q:String!){products(first:2,query:$q){nodes{id handle}}}`, { q: `sku:${f.sku}` });
  if (finns.products.nodes.length) { console.log(`= ${id}: finns redan (${finns.products.nodes[0].handle}) — hoppar`); continue; }
  const seUrls = f.seFinns ? (await new Butik('se').fraga(`query($id:ID!){product(id:$id){media(first:10){nodes{... on MediaImage{image{url}}}}}}`, { id: f.seFinns })).product.media.nodes.map((m) => m.image?.url).filter(Boolean) : null;
  if (!skarp) {
    console.log(`+ ${id}: ${t.titel}\n    ${p.pris} / ${p.jamfor} · cogs ${p.cogs} · ${t.bullets.length} bullets · bilder: ${seUrls ? seUrls.length + ' från SE-CDN' : filer.map((x) => path.basename(x)).join(', ') || 'INGA ⚠️'}`);
    continue;
  }
  if (!seUrls && !filer.length) { console.log(`! ${id}: inga bilder — hoppar`); continue; }

  const skapad = await b.mutera(`mutation($product: ProductCreateInput!) { productCreate(product: $product) { product { id } userErrors { field message } } }`,
    { product: { title: t.titel, vendor: VENDOR[land], status: 'DRAFT', templateSuffix: 'claudeprodukter', category: f.kategori, tags: t.taggar, seo: { title: t.seoTitel, description: t.seoText } } }, 'productCreate');
  const pid = skapad.product.id;
  const alts = seUrls ? seUrls.map((_, i) => i === 0 ? t.alt?.hero || t.titel : t.alt?.detalj || t.titel) : filer.map((x) => x.includes('-hero') ? t.alt?.hero || t.titel : t.alt?.detalj || t.titel);
  const urls = seUrls ? await mediaFrånUrl(pid, seUrls, alts) : await laddaUpp(pid, filer, alts);
  await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
    { input: { id: pid, descriptionHtml: beskrivning(t, { hero: urls[0], detalj: urls[1] }), status: 'ACTIVE' } }, 'productUpdate');
  await sättVariant(pid, p, f);
  await b.mutera(`mutation($id:ID!,$input:[PublicationInput!]!){publishablePublish(id:$id,input:$input){userErrors{field message}}}`, { id: pid, input: kanaler.map((k) => ({ publicationId: k.id })) }, 'publishablePublish');
  await slutläs(id, pid);
}
