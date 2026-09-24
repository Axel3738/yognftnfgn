// Trädansiktet — fem ansikten som varianter i SE och NO (samma pris på alla, Axel 2026-09-24).
//   node temu/batch11/tradansikte.mjs <se|no> [--skarp]
// Körs EFTER galleri-bygg.mjs (som skapar produkten med en "Default Title"-variant och alla bilder).
// Gör, i ordning: (1) optionen Ansikte/Ansikt med fem värden — den befintliga varianten blir Storögd och
// behåller grund-SKU:n; (2) tar bort den tomma Title-optionen; (3) skapar de fyra andra varianterna med samma
// pris/jämförpris/cogs, SKU -SKAGGIG/-PUTMUN/-MOSSIG/-MUSTASCH, moms av; (4) kopplar varje variant till bilden
// vars alt-text börjar med "Ansiktet <namn>". Idempotent.
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
import { PRIS } from './priser.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const land = process.argv[2], skarp = process.argv.includes('--skarp');
if (!['se', 'no'].includes(land)) { console.error('Användning: node temu/batch11/tradansikte.mjs <se|no> [--skarp]'); process.exit(1); }
const f = FAKTA.tradansikte, p = PRIS.find((x) => x.id === 'tradansikte').land[land.toUpperCase()];
const OPTION = { se: 'Ansikte', no: 'Ansikt' }[land];
const ANSIKTEN = { se: ['Storögd', 'Skäggig', 'Putmun', 'Mossigt leende', 'Mustasch'], no: ['Storøyd', 'Skjeggete', 'Trutmunn', 'Mosegrodd smil', 'Bart'] }[land];
const SUFFIX = ['', '-SKAGGIG', '-PUTMUN', '-MOSSIG', '-MUSTASCH'];   // Storögd behåller grund-SKU:n
const ALT_NO = existsSync(path.join(HÄR, 'alt-no.json')) ? JSON.parse(readFileSync(path.join(HÄR, 'alt-no.json'), 'utf8')) : {};
const SV = ['Storögd', 'Skäggig', 'Putmun', 'Mossigt leende', 'Mustasch'];
const altFör = (i) => { const sv = `Ansiktet ${SV[i]}`; if (land === 'se') return sv; const k = Object.keys(ALT_NO).find((x) => x.startsWith(sv)); return k ? ALT_NO[k].split(' – ')[0].split(' på ')[0] : sv; };

const b = new Butik(land); const shop = await b.verifiera();
if ((land === 'se' && shop.currencyCode !== 'SEK') || (land === 'no' && shop.currencyCode !== 'NOK')) throw new Error(`Fel butik: ${shop.name}`);
console.log(`${shop.name} — ${skarp ? 'SKARP KÖRNING' : 'torrkörning'}\n`);

const Q = `query($q:String!){products(first:2,query:$q){nodes{id title options{id name values}
  variants(first:10){nodes{id sku price compareAtPrice selectedOptions{name value} media(first:1){nodes{id}}}}
  media(first:30){nodes{id alt}}}}}`;
const läs = async () => (await b.fraga(Q, { q: `sku:${f.sku}` })).products.nodes[0];
let q = await läs();
if (!q) throw new Error('produkten hittas inte på SKU ' + f.sku + ' — kör galleri-bygg.mjs först');
const bildId = (i) => q.media.nodes.find((m) => (m.alt || '').startsWith(altFör(i)))?.id;
const option = () => q.options.find((o) => o.name === OPTION);
const titleOption = () => q.options.find((o) => o.name === 'Title');
const variantFör = (namn) => q.variants.nodes.find((v) => v.selectedOptions.some((s) => s.name === OPTION && s.value === namn));
const visa = () => { console.log(`${q.title}\n  optioner: ${q.options.map((o) => `${o.name}[${o.values.join('/')}]`).join(', ')}`);
  for (const v of q.variants.nodes) console.log(`  ${v.selectedOptions.map((s) => s.value).join('/')}: ${v.sku} · ${v.price}/${v.compareAtPrice} · bild ${v.media.nodes[0]?.id?.split('/').pop() || '—'}`); };

visa();
console.log(`  bilder per ansikte: ${ANSIKTEN.map((c, i) => `${c}=${bildId(i)?.split('/').pop() || 'SAKNAS'}`).join(' ')}`);
ANSIKTEN.forEach((c, i) => { if (!bildId(i)) throw new Error(`bild saknas för ${c} (alt "${altFör(i)}…")`); });
if (!skarp) { console.log(`\nPlan: option ${OPTION} (${ANSIKTEN.join('/')}) · befintlig variant → ${ANSIKTEN[0]} · skapa ${ANSIKTEN.slice(1).join(' + ')} à ${p.pris}/${p.jamfor}, cogs ${p.cogs} · variantbilder`); process.exit(0); }

if (!option()) {
  await b.mutera(`mutation($productId:ID!,$options:[OptionCreateInput!]!,$strategy:ProductOptionCreateVariantStrategy){productOptionsCreate(productId:$productId,options:$options,variantStrategy:$strategy){userErrors{field message code}}}`,
    { productId: q.id, options: [{ name: OPTION, values: ANSIKTEN.map((name) => ({ name })) }], strategy: 'LEAVE_AS_IS' }, 'productOptionsCreate');
  q = await läs(); console.log('+ option ' + OPTION);
}
if (titleOption() && q.options.length > 1) {
  await b.mutera(`mutation($productId:ID!,$options:[ID!]!){productOptionsDelete(productId:$productId,options:$options,strategy:DEFAULT){userErrors{field message code}}}`,
    { productId: q.id, options: [titleOption().id] }, 'productOptionsDelete');
  q = await läs(); console.log('- option Title');
}
const saknas = ANSIKTEN.map((c, i) => [c, i]).filter(([c]) => !variantFör(c));
if (saknas.length) {
  await b.mutera(`mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!){productVariantsBulkCreate(productId:$productId,variants:$variants){userErrors{field message code}}}`,
    { productId: q.id, variants: saknas.map(([c, i]) => ({ optionValues: [{ optionName: OPTION, name: c }], price: String(p.pris), compareAtPrice: String(p.jamfor), taxable: false, inventoryPolicy: 'CONTINUE', mediaId: bildId(i),
        inventoryItem: { sku: f.sku + SUFFIX[i], tracked: false, cost: String(p.cogs) } })) }, 'productVariantsBulkCreate');
  q = await läs(); console.log('+ varianter ' + saknas.map(([c]) => c).join(', '));
}
const upd = ANSIKTEN.map((c, i) => ({ v: variantFör(c), i })).filter(({ v, i }) => v && v.media.nodes[0]?.id !== bildId(i)).map(({ v, i }) => ({ id: v.id, mediaId: bildId(i) }));
if (upd.length) {
  await b.mutera(`mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!){productVariantsBulkUpdate(productId:$productId,variants:$variants){userErrors{field message code}}}`,
    { productId: q.id, variants: upd }, 'productVariantsBulkUpdate');
  console.log('~ variantbilder: ' + upd.length);
}
q = await läs(); console.log(''); visa();
