// Samlar alla adventskalendrar i bäverbutiken i en egen kollektion.
//   node temu/kalendrar/kollektion.mjs [--skarp]
// Tar med batchens nio kalendrar OCH de två som redan låg i butiken
// (racingbilar och fiskedrag), så kunden hittar hela sortimentet på ett ställe.
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';

const skarp = process.argv.includes('--skarp');
const TITEL = 'Adventskalendrar';
const HANDLE = 'adventskalendrar';
const b = new Butik('se');
console.log((await b.verifiera()).name, '—', skarp ? 'SKARP' : 'torrkörning');

const idn = [];
for (const [id, f] of Object.entries(FAKTA)) {
  const r = await b.fraga(`query($q:String!){products(first:1,query:$q){nodes{id title}}}`, { q: `sku:${f.sku}` });
  if (r.products.nodes[0]) idn.push(r.products.nodes[0]);
  else console.log(`  - ${id}: finns inte än`);
}
// de två som redan låg i butiken
for (const h of ['adventskalender-racingbilar-24-bilar-bakom-24-luckor', 'adventskalender-fiskedrag-24-drag-bakom-24-luckor']) {
  const r = await b.fraga(`query($q:String!){products(first:1,query:$q){nodes{id title}}}`, { q: `handle:${h}` });
  if (r.products.nodes[0]) idn.push(r.products.nodes[0]);
}
console.log(`${idn.length} kalendrar:`);
for (const p of idn) console.log('   ', p.title);
if (!skarp) process.exit(0);

const finns = await b.fraga(`query($q:String!){collections(first:1,query:$q){nodes{id handle}}}`, { q: `handle:${HANDLE}` });
let cid = finns.collections.nodes[0]?.id;
if (!cid) {
  const c = await b.mutera(
    `mutation($input:CollectionInput!){collectionCreate(input:$input){collection{id handle} userErrors{field message}}}`,
    { input: { title: TITEL, handle: HANDLE, descriptionHtml:
      '<p>Färdigfyllda och tomma adventskalendrar – en lucka om dagen fram till julafton.</p>' } },
    'collectionCreate');
  cid = c.collection.id; console.log('+ kollektion skapad:', c.collection.handle);
} else console.log('= kollektionen finns:', HANDLE);

await b.mutera(`mutation($id:ID!,$productIds:[ID!]!){collectionAddProducts(id:$id,productIds:$productIds){userErrors{field message}}}`,
  { id: cid, productIds: idn.map((p) => p.id) }, 'collectionAddProducts');
const kanaler = await b.kanaler();
await b.mutera(`mutation($id:ID!,$input:[PublicationInput!]!){publishablePublish(id:$id,input:$input){userErrors{field message}}}`,
  { id: cid, input: kanaler.map((k) => ({ publicationId: k.id })) }, 'publishablePublish');
const slut = await b.fraga(`query($id:ID!){collection(id:$id){handle title productsCount{count}}}`, { id: cid });
console.log(`✔ ${slut.collection.title}: ${slut.collection.productsCount.count} produkter — https://baverbutiken.se/collections/${slut.collection.handle}`);
