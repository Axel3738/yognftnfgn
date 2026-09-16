// Skapar adventlane-kalendrarna i bäverbutiken.se.
//   node temu/kalendrar/skapa.mjs [--skarp] [id …]
//
// Underlag:
//   temu/kalendrar/fakta.mjs   — pris, jämförpris, cogs, SKU, offertrad
//   temu/kalendrar/copy.json   — rippad copy per kalender (adventlane.se, granskad)
//   <SCRATCH>/advent/bilder/   — nedladdade originalbilder från Adventlanes CDN
//
// Beskrivningen sätts ihop i Bäverbutikens ordning:
//   problem → lösning → bild → funktioner (✓-punkter) → specar → FAQ → garanti
// Adventlanes egna småetiketter ("Känner du igen det?", "Lösningen") är temachrome och
// följer inte med. Garantiblocket är ALLTID Bäverbutikens (GARANTI4) — Adventlanes
// "14 dagars ångerrätt / 5–10 arbetsdagar / fri frakt" är struket i rippen.
import { Butik } from '../api.mjs';
import { FAKTA, cogs } from './fakta.mjs';
import { GARANTI4, RUBRIKER4 } from '../utrullning/texter4.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const BILDER = process.env.KALENDER_BILDER
  || '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/advent/bilder';
const KATEGORI = 'gid://shopify/TaxonomyCategory/hg-3-58-1';   // Decor > Seasonal > Advent Calendars
const VENDOR = 'Bäverbutiken';
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const skarp = process.argv.includes('--skarp');
const bara = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const COPY = JSON.parse(readFileSync(path.join(HÄR, 'copy.json'), 'utf8'));
const r = RUBRIKER4.sv;

const b = new Butik('se');
const shop = await b.verifiera();
console.log(`${shop.name} (${shop.currencyCode}) — ${skarp ? 'SKARP KÖRNING' : 'torrkörning'}\n`);
const kanaler = skarp ? await b.kanaler() : [];

for (const [id, f] of Object.entries(FAKTA)) {
  if (bara.length && !bara.includes(id)) continue;
  const t = COPY[id];
  if (!t) { console.log(`- ${id}: ingen copy — hoppar`); continue; }

  const bildfil = (n) => path.join(BILDER, n);
  const galleri = (t.galleri || []).filter((n) => existsSync(bildfil(n)));
  const saknas = (t.galleri || []).filter((n) => !existsSync(bildfil(n)));
  if (saknas.length) console.log(`  ! ${id}: bilder saknas på disk: ${saknas.join(', ')}`);

  const finns = await b.fraga(`query($q:String!){products(first:2,query:$q){nodes{id title handle}}}`, { q: `sku:${f.sku}` });
  if (finns.products.nodes.length) { console.log(`= ${id}: finns redan (${finns.products.nodes[0].handle}) — hoppar`); continue; }

  if (!skarp) {
    console.log(`+ ${id}: ${t.titel}`);
    console.log(`    ${f.pris} / ${f.jamfor} kr · cogs ${cogs(id)} · ${t.checkmarks.length} ✓ · ${(t.specar || []).length} specar · ${(t.faq || []).length} FAQ`);
    console.log(`    bilder: ${galleri.join(', ') || 'INGA ⚠️'} · i texten: ${t.losningBild || galleri[1] || galleri[0] || '—'}`);
    console.log(`    taggar: ${t.taggar.join(', ')}`);
    continue;
  }
  if (!galleri.length) { console.log(`! ${id}: inga bilder — hoppar`); continue; }

  // 1. produkten (utan beskrivning — bild-URL:erna finns inte förrän media är READY)
  const skapad = await b.mutera(
    `mutation($product: ProductCreateInput!) { productCreate(product: $product) { product { id } userErrors { field message } } }`,
    { product: { title: t.titel, vendor: VENDOR, status: 'DRAFT', templateSuffix: 'claudeprodukter',
        category: KATEGORI, tags: t.taggar, seo: { title: t.seoTitel, description: t.seoText } } },
    'productCreate');
  const pid = skapad.product.id;

  // 2. media — originalfilerna från Adventlanes CDN, oförändrade
  const st = await b.mutera(
    `mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
    { input: galleri.map((n) => ({ filename: n, mimeType: n.endsWith('.png') ? 'image/png' : 'image/jpeg',
        httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(readFileSync(bildfil(n)).length) })) },
    'stagedUploadsCreate');
  for (let i = 0; i < galleri.length; i++) {
    const n = galleri[i];
    const res = await fetch(st.stagedTargets[i].url, { method: 'PUT',
      headers: { 'content-type': n.endsWith('.png') ? 'image/png' : 'image/jpeg' }, body: readFileSync(bildfil(n)) });
    if (!res.ok) throw new Error(`PUT ${id}/${n}: ${res.status}`);
  }
  const cm = await b.mutera(
    `mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
    { productId: pid, media: galleri.map((n) => ({ mediaContentType: 'IMAGE',
        originalSource: st.stagedTargets[galleri.indexOf(n)].resourceUrl, alt: t.alt?.[n] || t.titel })) },
    'productCreateMedia');
  const nya = cm.media.map((m) => m.id);
  const url = {};
  for (let i = 0; ; i++) {
    await sov(3000);
    const s = await b.fraga(`query($id:ID!){product(id:$id){media(first:20){nodes{id status ... on MediaImage{image{url}}}}}}`, { id: pid });
    const rel = s.product.media.nodes.filter((n) => nya.includes(n.id));
    if (rel.length === nya.length && rel.every((n) => n.status === 'READY')) {
      nya.forEach((mid, j) => { url[galleri[j]] = rel.find((n) => n.id === mid).image.url; });
      break;
    }
    if (rel.some((n) => n.status === 'FAILED')) throw new Error(`${id}: media FAILED`);
    if (i > 40) throw new Error(`${id}: media tog för lång tid`);
  }

  // 3. beskrivningen
  const iTexten = t.losningBild || galleri[1] || galleri[0];
  const bild = (n) => url[n] ? `<p><img src="${url[n]}" alt="${esc(t.alt?.[n] || t.titel)}" loading="lazy" style="max-width:100%;height:auto"></p>` : '';
  const html =
    `<h3>${esc(t.problemH)}</h3><p>${esc(t.problemP)}</p>` +
    `<h3>${esc(t.losningH)}</h3><p>${esc(t.losningP)}</p>` +
    bild(iTexten) +
    `<h3>${esc(t.funktionerH || r.funktioner)}</h3><ul>\n` +
      t.checkmarks.map((x) => `<li>${esc(x)}</li>`).join('\n') + `\n</ul>` +
    ((t.specar || []).length ? `<ul>\n` + t.specar.map((x) => `<li>${esc(x)}</li>`).join('\n') + `\n</ul>` : '') +
    ((t.faq || []).length ? `<h3>Vanliga frågor</h3>\n` +
      t.faq.map((q) => `<p><strong>${esc(q.f)}</strong><br>${esc(q.s)}</p>`).join('\n') : '') +
    `<h3>${r.garanti}</h3><p>${GARANTI4.sv}</p>`;
  await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
    { input: { id: pid, descriptionHtml: html, status: 'ACTIVE' } }, 'productUpdate');

  // 4. variant: pris, jämförpris, cogs, moms av, säljs slut = fortsätt
  const v = await b.fraga(`query($id:ID!){product(id:$id){variants(first:3){nodes{id}}}}`, { id: pid });
  await b.mutera(
    `mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!){productVariantsBulkUpdate(productId:$productId,variants:$variants){userErrors{field message}}}`,
    { productId: pid, variants: [{ id: v.product.variants.nodes[0].id, price: String(f.pris),
        compareAtPrice: String(f.jamfor), taxable: false, inventoryPolicy: 'CONTINUE',
        inventoryItem: { sku: f.sku, tracked: false, cost: String(cogs(id)) } }] },
    'productVariantsBulkUpdate');

  // 5. publicera på alla kanaler
  await b.mutera(`mutation($id:ID!,$input:[PublicationInput!]!){publishablePublish(id:$id,input:$input){userErrors{field message}}}`,
    { id: pid, input: kanaler.map((k) => ({ publicationId: k.id })) }, 'publishablePublish');

  await sov(2500);
  const slut = await b.fraga(`query($id:ID!){product(id:$id){title handle status resourcePublicationsCount{count}
    variants(first:3){nodes{price compareAtPrice taxable inventoryItem{sku unitCost{amount}}}}
    media(first:20){nodes{status}}}}`, { id: pid });
  const q = slut.product, v0 = q.variants.nodes[0];
  console.log(`+ ${id}: ${q.title}`);
  console.log(`    ${q.status} | ${v0.price}/${v0.compareAtPrice} | moms ${v0.taxable} | cogs ${v0.inventoryItem.unitCost?.amount} | ${q.media.nodes.length} media (${q.media.nodes.filter((m) => m.status === 'READY').length} READY) | ${q.resourcePublicationsCount.count} kanaler`);
  console.log(`    https://baverbutiken.se/products/${q.handle}`);
}
