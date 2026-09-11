// Skapar batch 8 i bäverbutiken.se och beverbutikken.no.
// Kör:  node temu/batch8/skapa.mjs <se|no> [--skarp] [id]
//
// Underlag:
//   temu/batch8/fakta.mjs     — låsta fakta, SKU och kategori-GID
//   temu/batch8/copy.json     — copy per produkt och språk (byggd av batch8-workflowet)
//   temu/batch8/priser.mjs    — prismatrisen, räknad ur offerten
//   /tmp/b8/ut/<id>/ och /tmp/b8/ut-no/<id>/ — bilderna per språk
//
// Beskrivningens ordning följer CLAUDE.md: problem → GIF → lösning → bild →
// funktioner → faktabild → (varning) → garanti.
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
import { GARANTI4, RUBRIKER4 } from '../utrullning/texter4.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const VENDOR = { se: 'Bäverbutiken', no: 'Beverbutikken' };
const SPRÅK = { se: 'sv', no: 'no' };
const MAPP = { se: '/tmp/b8/ut', no: '/tmp/b8/ut-no' };
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

const land = process.argv[2], skarp = process.argv.includes('--skarp');
const bara = process.argv.slice(3).find((a) => !a.startsWith('--')) || null;
if (!['se', 'no'].includes(land)) { console.error('Användning: node temu/batch8/skapa.mjs <se|no> [--skarp] [id]'); process.exit(1); }

const COPY = JSON.parse(readFileSync(path.join(HÄR, 'copy.json'), 'utf8'));
const PRIS = JSON.parse(execFileSync(process.execPath, [path.join(HÄR, 'priser.mjs'), '/tmp/b8/offert.csv', '--json'], { encoding: 'utf8' }));

// Tofflorna är den enda produkten med varianter: färg × storlek.
const STORLEKAR = FAKTA.tofflor.latt.storlekar.map(String);
const FÄRGKOD = { Khaki: 'KH', Svart: 'SV', Sort: 'SV' };

const b = new Butik(land);
const shop = await b.verifiera();
console.log(`${shop.name} (${shop.currencyCode}) — ${skarp ? 'SKARP KÖRNING' : 'torrkörning'}\n`);
const r = RUBRIKER4[SPRÅK[land]];
const kanaler = skarp ? await b.kanaler() : [];

for (const [id, f] of Object.entries(FAKTA)) {
  if (bara && id !== bara) continue;
  const t = COPY[id]?.[SPRÅK[land]];
  if (!t) { console.log(`- ${id}: ingen copy för ${SPRÅK[land]} — hoppar`); continue; }
  const p = PRIS.find((x) => x.id === id)?.land[land.toUpperCase()];
  if (!p || p.blockerad) { console.log(`- ${id}: inget pris för ${land.toUpperCase()} (${p?.blockerad || 'saknas'}) — hoppar`); continue; }

  const mapp = path.join(MAPP[land], id);
  const bildfil = (roll, ext = 'jpg') => path.join(mapp, `${id}-${roll}.${ext}`);
  const finnsBild = (roll, ext) => existsSync(bildfil(roll, ext));

  const finns = await b.fraga(`query($q:String!){products(first:2,query:$q){nodes{id title handle}}}`, { q: `sku:${f.sku}*` });
  if (finns.products.nodes.length) { console.log(`= ${id}: finns redan (${finns.products.nodes[0].handle}) — hoppar`); continue; }

  const media = [
    ['hero', 'jpg', t.alt?.hero], ['miljo', 'jpg', t.alt?.miljo], ['detalj', 'jpg', t.alt?.detalj],
    ['fakta', 'jpg', t.alt?.fakta], ['miljo', 'gif', t.alt?.gif],
  ].filter(([roll, ext]) => finnsBild(roll, ext));

  if (!skarp) {
    console.log(`+ ${id}: ${t.titel}`);
    console.log(`    ${p.pris} / ${p.jamfor} · cogs ${p.cogs} · ${t.bullets.length} bullets · ${id === 'tofflor' ? STORLEKAR.length * FAKTA.tofflor.latt.farger.length + ' varianter' : '1 variant'}`);
    console.log(`    media: ${media.map(([roll, ext]) => roll + '.' + ext).join(', ') || 'INGA ⚠️'}`);
    continue;
  }
  if (!media.length) { console.log(`! ${id}: inga bilder i ${mapp} — hoppar`); continue; }

  // 1. Produkt (utan beskrivning — bild-URL:erna finns inte förrän media är READY)
  const harVarianter = id === 'tofflor';
  const skapad = await b.mutera(
    `mutation($product: ProductCreateInput!) { productCreate(product: $product) { product { id } userErrors { field message } } }`,
    { product: { title: t.titel, vendor: VENDOR[land], status: 'DRAFT', templateSuffix: 'claudeprodukter',
        category: f.kategori, tags: t.taggar, seo: { title: t.seoTitel, description: t.seoText },
        ...(harVarianter ? { productOptions: [
          { name: t.optionNamn || (land === 'se' ? 'Färg' : 'Farge'), values: (t.optionVarden || FAKTA.tofflor.latt.farger).map((n) => ({ name: n })) },
          { name: land === 'se' ? 'Storlek' : 'Størrelse', values: STORLEKAR.map((n) => ({ name: n })) },
        ] } : {}) } },
    'productCreate');
  const pid = skapad.product.id;

  // 2. Media
  const st = await b.mutera(
    `mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
    { input: media.map(([roll, ext]) => ({ filename: `b8-${id}-${roll}-${land}.${ext}`,
        mimeType: ext === 'gif' ? 'image/gif' : 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE',
        fileSize: String(readFileSync(bildfil(roll, ext)).length) })) },
    'stagedUploadsCreate');
  for (let i = 0; i < media.length; i++) {
    const [roll, ext] = media[i];
    const res = await fetch(st.stagedTargets[i].url, { method: 'PUT',
      headers: { 'content-type': ext === 'gif' ? 'image/gif' : 'image/jpeg' }, body: readFileSync(bildfil(roll, ext)) });
    if (!res.ok) throw new Error(`PUT ${id}/${roll}.${ext}: ${res.status}`);
  }
  const cm = await b.mutera(
    `mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
    { productId: pid, media: media.map(([roll, ext, alt], i) => ({ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[i].resourceUrl, alt: alt || t.titel })) },
    'productCreateMedia');
  const nya = cm.media.map((m) => m.id);
  const url = {};
  for (let i = 0; ; i++) {
    await sov(3000);
    const s = await b.fraga(`query($id:ID!){product(id:$id){media(first:20){nodes{id status ... on MediaImage{image{url}}}}}}`, { id: pid });
    const rel = s.product.media.nodes.filter((n) => nya.includes(n.id));
    if (rel.length === nya.length && rel.every((n) => n.status === 'READY')) {
      nya.forEach((mid, j) => { url[media[j][0] + '.' + media[j][1]] = rel.find((n) => n.id === mid).image.url; });
      break;
    }
    if (rel.some((n) => n.status === 'FAILED')) throw new Error(`${id}: media FAILED`);
    if (i > 40) throw new Error(`${id}: media tog för lång tid`);
  }

  // 3. Beskrivning med de skarpa bild-URL:erna
  const bild = (nyckel, alt, extra = '') => url[nyckel]
    ? `<p><img src="${url[nyckel]}" alt="${alt || t.titel}" loading="lazy" style="max-width:100%;height:auto${extra}"></p>` : '';
  const html =
    `<h3>${t.problemH}</h3><p>${t.problemP}</p>` +
    (bild('miljo.gif', t.alt?.gif, ';border-radius:8px') || bild('miljo.jpg', t.alt?.miljo)) +
    `<h3>${t.losningH}</h3><p>${t.losningP}</p>` +
    bild('hero.jpg', t.alt?.hero) +
    `<h3>${r.funktioner}</h3><ul>\n` + t.bullets.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` +
    bild('fakta.jpg', t.alt?.fakta) +
    (url['miljo.gif'] || url['miljo.jpg'] ? `<p><em>${t.aiRad}</em></p>` : '') +
    (t.varning ? `<p><em>${t.varning}</em></p>` : '') +
    `<h3>${r.garanti}</h3><p>${GARANTI4[SPRÅK[land]]}</p>`;
  await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
    { input: { id: pid, descriptionHtml: html, status: 'ACTIVE' } }, 'productUpdate');

  // 4. Varianter
  const gemensamt = { price: String(p.pris), compareAtPrice: String(p.jamfor), taxable: false, inventoryPolicy: 'CONTINUE' };
  if (harVarianter) {
    const färgNamn = t.optionNamn || (land === 'se' ? 'Färg' : 'Farge');
    const storlekNamn = land === 'se' ? 'Storlek' : 'Størrelse';
    const färger = t.optionVarden || FAKTA.tofflor.latt.farger;
    const varianter = [];
    for (const färg of färger) for (const storlek of STORLEKAR) varianter.push({
      ...gemensamt,
      optionValues: [{ optionName: färgNamn, name: färg }, { optionName: storlekNamn, name: storlek }],
      inventoryItem: { sku: `${f.sku}-${FÄRGKOD[färg] || färg.slice(0, 2).toUpperCase()}-${storlek}`, tracked: false, cost: String(p.cogs) },
    });
    for (let i = 0; i < varianter.length; i += 24) {
      await b.mutera(
        `mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!,$strategy:ProductVariantsBulkCreateStrategy){
           productVariantsBulkCreate(productId:$productId,variants:$variants,strategy:$strategy){userErrors{field message}}}`,
        { productId: pid, strategy: i === 0 ? 'REMOVE_STANDALONE_VARIANT' : 'DEFAULT', variants: varianter.slice(i, i + 24) },
        'productVariantsBulkCreate');
    }
  } else {
    const v = await b.fraga(`query($id:ID!){product(id:$id){variants(first:3){nodes{id}}}}`, { id: pid });
    await b.mutera(
      `mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!){productVariantsBulkUpdate(productId:$productId,variants:$variants){userErrors{field message}}}`,
      { productId: pid, variants: [{ id: v.product.variants.nodes[0].id, ...gemensamt,
          inventoryItem: { sku: f.sku, tracked: false, cost: String(p.cogs) } }] },
      'productVariantsBulkUpdate');
  }

  // 5. Publicera på alla kanaler
  await b.mutera(`mutation($id:ID!,$input:[PublicationInput!]!){publishablePublish(id:$id,input:$input){userErrors{field message}}}`,
    { id: pid, input: kanaler.map((k) => ({ publicationId: k.id })) }, 'publishablePublish');

  await sov(2500);
  const slut = await b.fraga(`query($id:ID!){product(id:$id){title handle status resourcePublicationsCount{count}
    variants(first:30){nodes{sku price compareAtPrice taxable inventoryItem{unitCost{amount}}}}
    media(first:20){nodes{status}}}}`, { id: pid });
  const q = slut.product, v0 = q.variants.nodes[0];
  console.log(`+ ${id}: ${q.title}`);
  console.log(`    ${q.status} | ${v0.price}/${v0.compareAtPrice} | moms ${v0.taxable} | cogs ${v0.inventoryItem.unitCost?.amount} | ${q.variants.nodes.length} var | ${q.media.nodes.length} media (${q.media.nodes.filter((m) => m.status === 'READY').length} READY) | ${q.resourcePublicationsCount.count} kanaler`);
  console.log(`    ${q.handle}`);
}
