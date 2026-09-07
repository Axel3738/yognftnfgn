// Lägger hjältebilden först i galleriet (productReorderMedia). Kör: node temu/batch6/ordna-galleri.mjs <se|no>
import { Butik } from '../api.mjs';
import { T6_SV } from '../utrullning/texter6.mjs';
const HERO = { staketbygel: /^(Staketstolpslagare 2-pack|Gjerdestolpebøyle 2-pk)/, kattkoja: /^(Isolerad utekattkoja i Oxford|Isolert utekattehus i Oxford)/, takoverdrag: /^(Svart taköverdrag på husbil|Sort takovertrekk på bobil)/ };
const b = new Butik(process.argv[2]);
console.log((await b.verifiera()).name);
for (const [k, re] of Object.entries(HERO)) {
  const q = await b.fraga(`query($q:String!){products(first:1,query:$q){nodes{id handle media(first:10){nodes{id alt}}}}}`, { q: `sku:${T6_SV[k].sku}*` });
  const p = q.products.nodes[0];
  const i = p.media.nodes.findIndex((m) => re.test(m.alt || ''));
  if (i <= 0) { console.log(`= ${k}: hero ${i === 0 ? 'ligger redan först' : 'saknas'}`); continue; }
  await b.mutera(`mutation($id:ID!,$moves:[MoveInput!]!){productReorderMedia(id:$id,moves:$moves){job{id} userErrors{field message}}}`, { id: p.id, moves: [{ id: p.media.nodes[i].id, newPosition: '0' }] }, 'productReorderMedia');
  console.log(`~ ${k}: hero flyttad från plats ${i + 1} till 1`);
}
