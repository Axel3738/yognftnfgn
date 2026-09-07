// Tar bort galleribilder som kom ur Temu-videorna (Axel 2026-09-07: fel produkt/variant i videon).
// Matchar på alt-text, aldrig svep. Kör: node temu/batch6/ta-bort-videobilder.mjs <se|no>
import { Butik } from '../api.mjs';
import { T6_SV } from '../utrullning/texter6.mjs';
const BORT = {
  kattkoja: ['Katt på väg in i kojan genom öppningen', 'Isolerande folie på insidan av kojans tak', 'Katt på vei inn i huset gjennom åpningen', 'Isolerende folie på innsiden av taket'],
  staketbygel: ['Två byglar monterade mot staketstolpar', 'Spettet drivs ner i marken intill stolpen', 'To bøyler montert mot gjerdestolper', 'Spydet drives ned i bakken inntil stolpen'],
  takoverdrag: ['Överdraget dras på plats över taket', 'Overtrekket trekkes på plass over taket'],
  solpanel: ['Baksidan med ledat fäste och kabel', 'Solpanelen framifrån, vinklad mot ljuset', 'Baksiden med leddet feste og kabel', 'Solpanelet forfra, vinklet mot lyset'],
};
const b = new Butik(process.argv[2]);
console.log((await b.verifiera()).name);
for (const [k, alts] of Object.entries(BORT)) {
  const q = await b.fraga(`query($q:String!){products(first:1,query:$q){nodes{id handle media(first:10){nodes{id alt}}}}}`, { q: `sku:${T6_SV[k].sku}*` });
  const p = q.products.nodes[0];
  const ids = p.media.nodes.filter((m) => alts.includes(m.alt)).map((m) => m.id);
  if (!ids.length) { console.log(`= ${k}: inget att ta bort`); continue; }
  await b.mutera(`mutation($productId:ID!,$mediaIds:[ID!]!){productDeleteMedia(productId:$productId,mediaIds:$mediaIds){deletedMediaIds mediaUserErrors{field message}}}`, { productId: p.id, mediaIds: ids }, 'productDeleteMedia');
  console.log(`- ${k}: tog bort ${ids.length}`);
}
