// Radiostyrd offroadbil 1:16 — tre färgvarianter i SE och NO.
// Axel 2026-09-23: "Rc bilen finns i svart blå och orange". Produkten låg med en enda
// "Default Title"-variant i båda butikerna (SE sedan 2026-07-22, NO klonad 2026-09-22).
//   node temu/batch11/rc-farger.mjs <se|no> [--skarp]
// Gör, i ordning: (1) optionen Färg/Farge med Blå/Svart/Orange — den befintliga varianten
// blir Blå och BEHÅLLER sin SKU (TEMU-601099746858349, samma i SE och NO, och skapa.mjs
// sätter den på variant[0]); (2) raderar den tomma "Title"-optionen om den ligger kvar;
// (3) skapar Svart och Orange med samma pris/jämförpris/cogs, SKU -SVART/-ORANGE, moms av;
// (4) kopplar varje färg till den befintliga bild som visar färgen — NO:s bilder klonades
// från SE:s CDN så filnamnsstammen är densamma; (5) lägger färg-bulleten (copy-rc-farg.json)
// sist i Funktioner-listan om den saknas. Idempotent: går att köra om utan dubbletter.
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
import { PRIS } from './priser.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const land = process.argv[2], skarp = process.argv.includes('--skarp');
if (!['se', 'no'].includes(land)) { console.error('Användning: node temu/batch11/rc-farger.mjs <se|no> [--skarp]'); process.exit(1); }
const f = FAKTA.rcoffroad, p = PRIS.find((x) => x.id === 'rcoffroad').land[land.toUpperCase()];
const OPTION = { se: 'Färg', no: 'Farge' }[land];
const FÄRGER = { se: ['Blå', 'Svart', 'Orange'], no: ['Blå', 'Svart', 'Oransje'] }[land];
const SUFFIX = ['', '-SVART', '-ORANGE'];               // Blå behåller grund-SKU:n
// Bildens filnamnsstam → färgindex. Kontaktark rc-se.jpg 2026-09-23: bild 1 blå (livsstil),
// 2 blå (infografik), 3 svart (infografik), 4 blå (mått), 5 orange (mått + kartong).
const BILD = { c666d942: 0, '25128b41': 1, f3dfea26: 2 };
const bulletFil = path.join(HÄR, 'copy-rc-farg.json');
const BULLET = existsSync(bulletFil) ? JSON.parse(readFileSync(bulletFil, 'utf8')).rcoffroad.bullet5_farg[{ se: 'sv', no: 'no' }[land]] : null;

const b = new Butik(land); const shop = await b.verifiera();
if ((land === 'se' && shop.currencyCode !== 'SEK') || (land === 'no' && shop.currencyCode !== 'NOK')) throw new Error(`Fel butik: ${shop.name}`);
console.log(`${shop.name} — ${skarp ? 'SKARP KÖRNING' : 'torrkörning'}\n`);

const Q = `query($q:String!){products(first:2,query:$q){nodes{id title descriptionHtml options{id name values}
  variants(first:10){nodes{id sku price compareAtPrice selectedOptions{name value} media(first:1){nodes{id}}}}
  media(first:10){nodes{id ... on MediaImage{image{url}}}}}}}`;
const läs = async () => (await b.fraga(Q, { q: `sku:${f.sku}` })).products.nodes[0];
let q = await läs();
if (!q) throw new Error('produkten hittas inte på SKU ' + f.sku);
const bildId = (i) => q.media.nodes.find((m) => Object.entries(BILD).some(([stam, idx]) => idx === i && m.image?.url.includes(stam)))?.id;
const färgOption = () => q.options.find((o) => o.name === OPTION);
const titleOption = () => q.options.find((o) => o.name === 'Title');
const variantFör = (färg) => q.variants.nodes.find((v) => v.selectedOptions.some((s) => s.name === OPTION && s.value === färg));
const visa = () => { console.log(`${q.title}\n  optioner: ${q.options.map((o) => `${o.name}[${o.values.join('/')}]`).join(', ')}`);
  for (const v of q.variants.nodes) console.log(`  ${v.selectedOptions.map((s) => s.value).join('/')}: ${v.sku} · ${v.price}/${v.compareAtPrice} · bild ${v.media.nodes[0]?.id?.split('/').pop() || '—'}`); };

visa();
console.log(`  bilder per färg: ${FÄRGER.map((c, i) => `${c}=${bildId(i)?.split('/').pop() || 'SAKNAS'}`).join(' ')}\n  bullet: ${BULLET || 'SAKNAS (copy-rc-farg.json)'}`);
FÄRGER.forEach((c, i) => { if (!bildId(i)) throw new Error('bild saknas för ' + c); });
if (!skarp) { console.log(`\nPlan: option ${OPTION} (${FÄRGER.join('/')}) · befintlig variant → ${FÄRGER[0]} · skapa ${FÄRGER.slice(1).join(' + ')} à ${p.pris}/${p.jamfor}, cogs ${p.cogs} · variantbilder · bullet sist i listan`); process.exit(0); }
if (!BULLET) throw new Error('copy-rc-farg.json saknas');

// 1. optionen — den befintliga varianten får första värdet (Blå)
if (!färgOption()) {
  await b.mutera(`mutation($productId:ID!,$options:[OptionCreateInput!]!,$strategy:ProductOptionCreateVariantStrategy){productOptionsCreate(productId:$productId,options:$options,variantStrategy:$strategy){userErrors{field message code}}}`,
    { productId: q.id, options: [{ name: OPTION, values: FÄRGER.map((name) => ({ name })) }], strategy: 'LEAVE_AS_IS' }, 'productOptionsCreate');
  q = await läs(); console.log('+ option ' + OPTION);
}
// 2. bort med den tomma Title-optionen
if (titleOption() && q.options.length > 1) {
  await b.mutera(`mutation($productId:ID!,$options:[ID!]!){productOptionsDelete(productId:$productId,options:$options,strategy:DEFAULT){userErrors{field message code}}}`,
    { productId: q.id, options: [titleOption().id] }, 'productOptionsDelete');
  q = await läs(); console.log('- option Title');
}
// 3. varianterna som saknas
const saknas = FÄRGER.map((c, i) => [c, i]).filter(([c]) => !variantFör(c));
if (saknas.length) {
  await b.mutera(`mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!){productVariantsBulkCreate(productId:$productId,variants:$variants){userErrors{field message code}}}`,
    { productId: q.id, variants: saknas.map(([c, i]) => ({ optionValues: [{ optionName: OPTION, name: c }], price: String(p.pris), compareAtPrice: String(p.jamfor), taxable: false, inventoryPolicy: 'CONTINUE', mediaId: bildId(i),
        inventoryItem: { sku: f.sku + SUFFIX[i], tracked: false, cost: String(p.cogs) } })) }, 'productVariantsBulkCreate');
  q = await läs(); console.log('+ varianter ' + saknas.map(([c]) => c).join(', '));
}
// 4. rätt bild på varje variant (den befintliga blå saknar bild)
const upd = FÄRGER.map((c, i) => ({ v: variantFör(c), i })).filter(({ v, i }) => v && v.media.nodes[0]?.id !== bildId(i)).map(({ v, i }) => ({ id: v.id, mediaId: bildId(i) }));
if (upd.length) {
  await b.mutera(`mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!){productVariantsBulkUpdate(productId:$productId,variants:$variants){userErrors{field message code}}}`,
    { productId: q.id, variants: upd }, 'productVariantsBulkUpdate');
  console.log('~ variantbilder: ' + upd.length);
}
// 5. bulleten
if (!q.descriptionHtml.includes(BULLET)) {
  const html = q.descriptionHtml.replace('</ul>', `\n<li>${BULLET}</li>\n</ul>`);
  if (html === q.descriptionHtml) throw new Error('hittar ingen </ul> i beskrivningen');
  await b.mutera(`mutation($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`, { input: { id: q.id, descriptionHtml: html } }, 'productUpdate');
  console.log('+ bullet');
}
q = await läs(); console.log(''); visa();
