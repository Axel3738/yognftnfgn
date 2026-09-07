// Damasker: lägg till 15 färgvarianter + variantbilder i en butik.
// Kör: node damask-rulla.mjs <se|no|dk|fi|uk> [--skarp]
import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
import { readFileSync, readdirSync } from 'node:fs';

const SKU = 'TEMU-601101617191068';
const D = '/tmp/fix/damasker', K = '/tmp/fix/dam-kie-ut';
const f = readdirSync(D).filter((x) => x.endsWith('.jpg')).sort();
const bild = (i) => `${D}/${f[i - 1]}`;

// suffix, bildfil, färgnamn per språk
const NYA = [
  ['SV', `${K}/svart.png`,     { se:'Svart',            no:'Svart',            dk:'Sort',              fi:'Musta',                 uk:'Black' }],
  ['GR', bild(14),             { se:'Grå',              no:'Grå',              dk:'Grå',               fi:'Harmaa',                uk:'Grey' }],
  ['MB', `${K}/marinbla.png`,  { se:'Marinblå',         no:'Marineblå',        dk:'Marineblå',         fi:'Laivastonsininen',      uk:'Navy' }],
  ['BL', bild(4),              { se:'Blå',              no:'Blå',              dk:'Blå',               fi:'Sininen',               uk:'Blue' }],
  ['LB', bild(10),             { se:'Ljusblå',          no:'Lyseblå',          dk:'Lyseblå',           fi:'Vaaleansininen',        uk:'Light Blue' }],
  ['RD', bild(9),              { se:'Röd',              no:'Rød',              dk:'Rød',               fi:'Punainen',              uk:'Red' }],
  ['LI', `${K}/lila.png`,      { se:'Lila',             no:'Lilla',            dk:'Lilla',             fi:'Liila',                 uk:'Purple' }],
  ['RA', bild(17),             { se:'Rosa',             no:'Rosa',             dk:'Rosa',              fi:'Pinkki',                uk:'Pink' }],
  ['BR', `${K}/brun.png`,      { se:'Brun',             no:'Brun',             dk:'Brun',              fi:'Ruskea',                uk:'Brown' }],
  ['VI', bild(8),              { se:'Vit',              no:'Hvit',             dk:'Hvid',              fi:'Valkoinen',             uk:'White' }],
  ['OL', bild(12),             { se:'Olivgrön',         no:'Olivengrønn',      dk:'Olivengrøn',        fi:'Oliivinvihreä',         uk:'Olive Green' }],
  ['KG', bild(7),              { se:'Kamouflage Grön',  no:'Kamuflasje Grønn', dk:'Camouflage Grøn',   fi:'Naamiokuvio Vihreä',    uk:'Camo Green' }],
  ['KS', bild(20),             { se:'Kamouflage Svart', no:'Kamuflasje Svart', dk:'Camouflage Sort',   fi:'Naamiokuvio Musta',     uk:'Camo Black' }],
  ['BN', bild(5),              { se:'Blå/Neongrön',     no:'Blå/Neongrønn',    dk:'Blå/Neongrøn',      fi:'Sininen/Neonvihreä',    uk:'Blue/Neon Green' }],
  ['CN', bild(16),             { se:'Cerise/Neongrön',  no:'Cerise/Neongrønn', dk:'Cerise/Neongrøn',   fi:'Cerise/Neonvihreä',     uk:'Cerise/Neon Green' }],
];
// befintliga färger som saknar variantbild
// NG: leverantörsbilden (bild 19) har kinesisk text — använd den beskurna rena.
const KOMPLETTERA = [['GU', bild(6)], ['NG', `${K}/neongron.jpg`]];
const ALT = { se: (c) => `Damasker i ${c.toLowerCase()}`, no: (c) => `Gamasjer i ${c.toLowerCase()}`,
  dk: (c) => `Gamacher i ${c.toLowerCase()}`, fi: (c) => `Säärystimet – ${c.toLowerCase()}`, uk: (c) => `Gaiters in ${c.toLowerCase()}` };
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

const land = process.argv[2], skarp = process.argv.includes('--skarp');
if (!ALT[land]) { console.error('node damask-rulla.mjs <se|no|dk|fi|uk> [--skarp]'); process.exit(1); }
const b = new Butik(land);
const shop = await b.verifiera();

const d = await b.fraga(`query { products(first: 1, query: "sku:${SKU}*") { nodes { id title
  options { id name optionValues { id name } }
  variants(first: 40) { nodes { id sku title price compareAtPrice image { url } inventoryItem { id unitCost { amount } } } }
  media(first: 40) { nodes { id } } } } }`);
const p = d.products.nodes[0];
if (!p) throw new Error(`${land}: produkten saknas`);
const bef = p.variants.nodes;
const opt = p.options[0];
const mall = bef[0];
const cogs = mall.inventoryItem?.unitCost?.amount ?? null;
console.log(`${shop.name} | ${p.title}`);
console.log(`  ${bef.length} varianter, option "${opt.name}" | pris ${mall.price} (jf ${mall.compareAtPrice}) | cogs ${cogs}`);

const finns = new Set(bef.map((v) => v.sku));
const attSkapa = NYA.filter(([s]) => !finns.has(`${SKU}-${s}`));
const attKomplettera = KOMPLETTERA.filter(([s]) => { const v = bef.find((x) => x.sku === `${SKU}-${s}`); return v && !v.image; });
console.log(`  → skapar ${attSkapa.length} nya färger, kompletterar ${attKomplettera.length} befintliga med bild`);
if (!skarp) { attSkapa.forEach(([s, , n]) => console.log(`     ${s}  ${n[land]}`)); process.exit(0); }
if (!attSkapa.length && !attKomplettera.length) { console.log('  inget att göra'); process.exit(0); }

// 1. Ladda upp bilderna
const jobb = [...attSkapa.map(([s, fil, n]) => ({ s, fil, namn: n[land] })), ...attKomplettera.map(([s, fil]) => ({ s, fil, namn: bef.find((x) => x.sku === `${SKU}-${s}`).title }))];
const input = jobb.map((j) => ({ filename: `damask-${land}-${j.s}${j.fil.endsWith('.png') ? '.png' : '.jpg'}`,
  mimeType: j.fil.endsWith('.png') ? 'image/png' : 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(readFileSync(j.fil).length) }));
const st = await b.mutera(`mutation s($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl } userErrors { field message } } }`, { input }, 'stagedUploadsCreate');
for (let i = 0; i < jobb.length; i++) {
  const r = await fetch(st.stagedTargets[i].url, { method: 'PUT', headers: { 'content-type': input[i].mimeType }, body: readFileSync(jobb[i].fil) });
  if (!r.ok) throw new Error(`PUT ${jobb[i].s}: ${r.status}`);
}
const cm = await b.mutera(`mutation m($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { field message } } }`,
  { productId: p.id, media: jobb.map((j, i) => ({ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[i].resourceUrl, alt: ALT[land](j.namn) })) }, 'productCreateMedia');
const mediaId = Object.fromEntries(jobb.map((j, i) => [j.s, cm.media[i].id]));

for (let i = 0; i < 60; i++) {
  await sov(3500);
  const q = await b.fraga(`query($id: ID!) { product(id: $id) { media(first: 60) { nodes { id status } } } }`, { id: p.id });
  const rel = q.product.media.nodes.filter((n) => Object.values(mediaId).includes(n.id));
  if (rel.length === jobb.length && rel.every((n) => n.status === 'READY')) break;
  if (rel.some((n) => n.status === 'FAILED')) throw new Error('media FAILED');
  if (i === 59) throw new Error('media blev inte READY');
}
console.log(`  ✔ ${jobb.length} bilder uppladdade och READY`);

// 2. Lägg till optionsvärdena
if (attSkapa.length) {
  await b.mutera(`mutation($productId: ID!, $option: OptionUpdateInput!, $optionValuesToAdd: [OptionValueCreateInput!]) {
      productOptionUpdate(productId: $productId, option: $option, optionValuesToAdd: $optionValuesToAdd, variantStrategy: LEAVE_AS_IS) {
        userErrors { field message } } }`,
    { productId: p.id, option: { id: opt.id }, optionValuesToAdd: attSkapa.map(([, , n]) => ({ name: n[land] })) }, 'productOptionUpdate');

  // 3. Skapa varianterna
  await b.mutera(`mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkCreate(productId: $productId, variants: $variants) { userErrors { field message } } }`,
    { productId: p.id, variants: attSkapa.map(([s, , n]) => ({
        optionValues: [{ optionName: opt.name, name: n[land] }],
        price: mall.price, compareAtPrice: mall.compareAtPrice, taxable: false, inventoryPolicy: 'CONTINUE',
        inventoryItem: { sku: `${SKU}-${s}`, tracked: false, ...(cogs ? { cost: cogs } : {}) },
      })) }, 'productVariantsBulkCreate');
  console.log(`  ✔ ${attSkapa.length} varianter skapade à ${mall.price}${cogs ? ` (cogs ${cogs})` : ''}`);
}

// 4. Koppla variantbilder
const dv = await b.fraga(`query($id: ID!) { product(id: $id) { variants(first: 40) { nodes { id sku } } } }`, { id: p.id });
const idAvSku = Object.fromEntries(dv.product.variants.nodes.map((v) => [v.sku, v.id]));
await b.mutera(`mutation($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
    productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) { userErrors { field message } } }`,
  { productId: p.id, variantMedia: jobb.map((j) => ({ variantId: idAvSku[`${SKU}-${j.s}`], mediaIds: [mediaId[j.s]] })) }, 'productVariantAppendMedia');
console.log(`  ✔ ${jobb.length} variantbilder kopplade`);

const slut = await b.fraga(`query($id: ID!) { product(id: $id) { variants(first: 40) { nodes { sku title price image { url } inventoryItem { unitCost { amount } } } } } }`, { id: p.id });
const utanBild = slut.product.variants.nodes.filter((v) => !v.image);
console.log(`  SLUT: ${slut.product.variants.nodes.length} varianter, ${utanBild.length} utan bild${utanBild.length ? ': ' + utanBild.map((v) => v.title).join(', ') : ''}`);
