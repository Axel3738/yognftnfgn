// Fiskekalender SE: byt den råa bilden mot de rensade, fyll beskrivning/pris, aktivera.
import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
import { T6_SV } from '/home/user/yognftnfgn/temu/utrullning/texter6.mjs';
import { GARANTI4, RUBRIKER4 } from '/home/user/yognftnfgn/temu/utrullning/texter4.mjs';
import { readFileSync } from 'node:fs';
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const t = T6_SV.fiskekalender;
const PRIS = JSON.parse(readFileSync('/tmp/fix/b6/prismatris.json', 'utf8')).find((r) => r.namn === 'Fishing calendar').land.SE;
const { pid } = JSON.parse(readFileSync('/tmp/fix/b6/fisk-utkast.json', 'utf8'));
const b = new Butik('se'); await b.verifiera();

// 1. Ladda upp de två rensade bilderna
const filer = [['fiskekalender.jpg', t.alt.main], ['fiskekalender-2.jpg', 'Skeddrag och jiggar ur kalendern']];
const st = await b.mutera(
  `mutation s($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl } userErrors { field message } } }`,
  { input: filer.map(([f]) => ({ filename: `b6-${f}`, mimeType: 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(readFileSync(`/tmp/fix/b6/hamtat/${f}`).length) })) },
  'stagedUploadsCreate');
for (let i = 0; i < filer.length; i++) {
  const r = await fetch(st.stagedTargets[i].url, { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: readFileSync(`/tmp/fix/b6/hamtat/${filer[i][0]}`) });
  if (!r.ok) throw new Error(`PUT ${r.status}`);
}
const cm = await b.mutera(
  `mutation m($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { field message } } }`,
  { productId: pid, media: filer.map(([, alt], i) => ({ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[i].resourceUrl, alt })) }, 'productCreateMedia');
const nya = cm.media.map((m) => m.id);
let galleri2;
for (let i = 0; ; i++) {
  await sov(3000);
  const q = await b.fraga(`query($id:ID!){product(id:$id){media(first:10){nodes{id alt status ... on MediaImage{image{url}}}}}}`, { id: pid });
  const rel = q.product.media.nodes.filter((n) => nya.includes(n.id));
  if (rel.length === nya.length && rel.every((n) => n.status === 'READY')) { galleri2 = rel[1].image.url; break; }
  if (rel.some((n) => n.status === 'FAILED') || i > 30) throw new Error('media ej READY');
}

// 2. Radera den råa (vattenstämplade) bilden
const q0 = await b.fraga(`query($id:ID!){product(id:$id){media(first:10){nodes{id alt}}}}`, { id: pid });
const ra = q0.product.media.nodes.filter((n) => n.alt === 'rå').map((n) => n.id);
if (ra.length) await b.mutera(
  `mutation($productId: ID!, $mediaIds: [ID!]!) { productDeleteMedia(productId: $productId, mediaIds: $mediaIds) { userErrors { field message } } }`,
  { productId: pid, mediaIds: ra }, 'productDeleteMedia');

// 3. Beskrivning + aktivera
const r = RUBRIKER4.sv;
const html =
  `<h3>${t.problemH}</h3><p>${t.problemP}</p>` +
  `<h3>${t.losningH}</h3><p>${t.losningP}</p>` +
  `<p><img src="${galleri2}" alt="Skeddrag och jiggar ur kalendern" loading="lazy" style="max-width:100%;height:auto"></p>` +
  `<h3>${r.funktioner}</h3><ul>\n` + t.bullets.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` +
  `<h3>${r.garanti}</h3><p>${GARANTI4.sv}</p>`;
await b.mutera(`mutation u($input: ProductUpdateInput!) { productUpdate(product: $input) { userErrors { field message } } }`,
  { input: { id: pid, descriptionHtml: html, status: 'ACTIVE', title: t.titel, tags: t.taggar } }, 'productUpdate');

// 4. Variant
const v = await b.fraga(`query($id:ID!){product(id:$id){variants(first:3){nodes{id}}}}`, { id: pid });
await b.mutera(`mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { field message } } }`,
  { productId: pid, variants: [{ id: v.product.variants.nodes[0].id, price: String(PRIS.pris), compareAtPrice: String(PRIS.jamfor), taxable: false, inventoryPolicy: 'CONTINUE',
    inventoryItem: { sku: t.sku, tracked: false, cost: String(PRIS.cogs) } }] }, 'productVariantsBulkUpdate');

// 5. Publicera
const kanaler = await b.kanaler();
await b.mutera(`mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
  { id: pid, input: kanaler.map((k) => ({ publicationId: k.id })) }, 'publishablePublish');

await sov(4000);
const slut = await b.fraga(`query($id:ID!){product(id:$id){title handle status media(first:10){nodes{alt status}} variants(first:3){nodes{price compareAtPrice taxable inventoryItem{unitCost{amount}}}} resourcePublicationsCount{count}}}`, { id: pid });
const p = slut.product, vv = p.variants.nodes[0];
console.log(`✔ ${p.title}\n  ${p.status} | ${vv.price}/${vv.compareAtPrice} | moms ${vv.taxable} | cogs ${vv.inventoryItem.unitCost?.amount} | media: ${p.media.nodes.map((m) => m.alt + ':' + m.status).join(', ')} | ${p.resourcePublicationsCount.count} kanaler\n  https://baverbutiken.se/products/${p.handle}`);
const js = await (await fetch(`https://baverbutiken.se/products/${p.handle}.js`)).json().catch(() => null);
console.log('  kundens sida:', js ? (js.available ? 'KÖPBAR ✅' : 'EJ KÖPBAR ❌') : 'kunde inte läsa');
