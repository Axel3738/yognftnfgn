// Skapar batch 6 i bäverbutiken.se och beverbutikken.no.
// Kör: node temu/batch6/skapa.mjs <se|no> [--skarp] [nyckel]
import { Butik } from '../api.mjs';
import { GARANTI4, RUBRIKER4 } from '../utrullning/texter4.mjs';
import { T6_SV } from '../utrullning/texter6.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const PRIS = JSON.parse(readFileSync(path.join(HÄR, 'prismatris.json'), 'utf8'));
const BILD = { kattkoja: 'isolerad-utekattkoja-i-oxford-tyg-hopfal', staketbygel: 'staketstolps-reparationsbygel-med-marksp',
  vedklyv: 'tandvedsklyv-i-gjutjarn-ring-kil', takoverdrag: 'takoverdrag-till-husvagn-husbil',
  solpanel: 'solpanel-till-atelkamera-viltkamera', racingkalender: 'car-racing-calendar' };
const OFFERTNAMN = { kattkoja: 'Isolerad utekattkoja', staketbygel: 'Staketstolps-reparationsbygel', vedklyv: 'Tändvedsklyv',
  takoverdrag: 'Taköverdrag', solpanel: 'Solpanel', racingkalender: 'car racing calendar' };
const VENDOR = { se: 'Bäverbutiken', no: 'Beverbutikken' };
const SPRÅK = { se: 'sv', no: 'no' };
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

const land = process.argv[2], skarp = process.argv.includes('--skarp');
const bara = process.argv[4] && !process.argv[4].startsWith('--') ? process.argv[4] : null;
if (!['se', 'no'].includes(land)) { console.error('Användning: node skapa.mjs <se|no> [--skarp] [nyckel]'); process.exit(1); }

// Norsk copy läses ur texter6-no.mjs när den finns; annars körs bara SE.
let T = T6_SV;
if (land === 'no') {
  const f = path.join(HÄR, '..', 'utrullning', 'texter6-no.mjs');
  if (!existsSync(f)) { console.error('texter6-no.mjs saknas — kör den norska översättningen först'); process.exit(1); }
  T = (await import(f)).T6_NO;
}

const prisAv = (nyckel) => {
  const namn = OFFERTNAMN[nyckel];
  const rad = PRIS.find((r) => r.namn.toLowerCase().includes(namn.toLowerCase()));
  if (!rad) throw new Error(`hittar ingen prisrad för ${nyckel} (${namn})`);
  const l = rad.land[land.toUpperCase()];
  if (!l) throw new Error(`${nyckel}: inget pris för ${land}`);
  return l;
};

const b = new Butik(land);
const shop = await b.verifiera();
console.log(`${shop.name} (${shop.currencyCode}) — ${skarp ? 'SKARP KÖRNING' : 'torrkörning'}\n`);
const r = RUBRIKER4[SPRÅK[land]];
const kanaler = skarp ? await b.kanaler() : [];

for (const [nyckel, t] of Object.entries(T)) {
  if (bara && nyckel !== bara) continue;
  const sku = T6_SV[nyckel].sku;          // SKU är gemensam mellan butikerna
  const kategori = T6_SV[nyckel].kategori;
  const p = prisAv(nyckel);
  const bildfil = path.join(HÄR, 'bilder', `${BILD[nyckel]}.jpg`);

  const finns = await b.fraga(`query($q:String!){products(first:2,query:$q){nodes{id title handle}}}`, { q: `sku:${sku}*` });
  if (finns.products.nodes.length) { console.log(`= ${nyckel}: finns redan (${finns.products.nodes[0].handle}) — hoppar`); continue; }
  if (!skarp) {
    console.log(`+ ${nyckel}: ${t.titel}`);
    console.log(`    ${p.pris} / ${p.jamfor} · cogs ${p.cogs} · ${t.bullets.length} bullets · ${T6_SV[nyckel].varden ? T6_SV[nyckel].varden.length + ' varianter' : '1 variant'} · bild ${existsSync(bildfil) ? 'ok' : 'SAKNAS ⚠️'}`);
    continue;
  }

  // Beskrivning: problem → bild → lösning → funktioner → garanti
  const html =
    `<h3>${t.problemH}</h3><p>${t.problemP}</p>` +
    `<h3>${t.losningH}</h3><p>${t.losningP}</p>` +
    `<h3>${r.funktioner}</h3><ul>\n` + t.bullets.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` +
    (t.varning ? `<p><em>${t.varning}</em></p>` : '') +
    `<h3>${r.garanti}</h3><p>${GARANTI4[SPRÅK[land]]}</p>`;

  const harVarianter = Array.isArray(t.varden) && t.varden.length > 1;
  const skapad = await b.mutera(
    `mutation($product: ProductCreateInput!) { productCreate(product: $product) { product { id title handle } userErrors { field message } } }`,
    { product: { title: t.titel, descriptionHtml: html, vendor: VENDOR[land], status: 'ACTIVE',
        templateSuffix: 'claudeprodukter', category: kategori, tags: t.taggar,
        ...(harVarianter ? { productOptions: [{ name: t.option, values: t.varden.map((n) => ({ name: n })) }] } : {}) } },
    'productCreate');
  const pid = skapad.product.id;

  // Bild
  const buf = readFileSync(bildfil);
  const st = await b.mutera(
    `mutation s($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl } userErrors { field message } } }`,
    { input: [{ filename: `b6-${nyckel}-${land}.jpg`, mimeType: 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(buf.length) }] },
    'stagedUploadsCreate');
  const put = await fetch(st.stagedTargets[0].url, { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: buf });
  if (!put.ok) throw new Error(`PUT ${put.status}`);
  await b.mutera(
    `mutation m($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { field message } } }`,
    { productId: pid, media: [{ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[0].resourceUrl, alt: t.altMain || t.alt?.main || t.titel }] },
    'productCreateMedia');

  // Varianter / pris
  const gemensamt = { price: String(p.pris), compareAtPrice: String(p.jamfor), taxable: false, inventoryPolicy: 'CONTINUE' };
  if (harVarianter) {
    await b.mutera(
      `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!, $strategy: ProductVariantsBulkCreateStrategy) {
         productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: $strategy) { userErrors { field message } } }`,
      { productId: pid, strategy: 'REMOVE_STANDALONE_VARIANT',
        variants: t.varden.map((namn, i) => ({ ...gemensamt, optionValues: [{ optionName: t.option, name: namn }],
          inventoryItem: { sku: sku + T6_SV[nyckel].suffix[i], tracked: false, cost: String(p.cogs) } })) },
      'productVariantsBulkCreate');
  } else {
    const v = await b.fraga(`query($id:ID!){product(id:$id){variants(first:3){nodes{id}}}}`, { id: pid });
    await b.mutera(
      `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { field message } } }`,
      { productId: pid, variants: [{ id: v.product.variants.nodes[0].id, ...gemensamt,
          inventoryItem: { sku, tracked: false, cost: String(p.cogs) } }] },
      'productVariantsBulkUpdate');
  }

  await b.mutera(
    `mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { field message } } }`,
    { id: pid, input: kanaler.map((k) => ({ publicationId: k.id })) }, 'publishablePublish');

  await sov(2500);
  const slut = await b.fraga(`query($id:ID!){product(id:$id){title handle status resourcePublicationsCount{count}
    variants(first:10){nodes{sku price compareAtPrice taxable inventoryItem{unitCost{amount}}}}
    media(first:5){nodes{status}}}}`, { id: pid });
  const q = slut.product, v0 = q.variants.nodes[0];
  console.log(`+ ${nyckel}: ${q.title}`);
  console.log(`    ${q.status} | ${v0.price}/${v0.compareAtPrice} | moms ${v0.taxable} | cogs ${v0.inventoryItem.unitCost?.amount} | ${q.variants.nodes.length} var | ${q.media.nodes.length} media | ${q.resourcePublicationsCount.count} kanaler`);
  console.log(`    ${q.handle}`);
}
