// Skapar de nio storleksvarianterna på taköverdraget i bäverbutiken.se.
//   node temu/takoverdrag/varianter.mjs            # torrkörning: visar prisstegen
//   node temu/takoverdrag/varianter.mjs --skarp    # skapar varianterna skarpt
//
// ⚠️ KÖRS INTE FÖRRÄN CWD SVARAT. Fyll i LANDAT_USD nedan med offertens
//    "Total tax exclusive" för SWEDEN vid qty 1, per storlek. Skriptet vägrar
//    köra skarpt så länge någon storlek saknar siffra — cogs får aldrig gissas
//    (CLAUDE.md: "COGS sätts från offertens landade kostnad × valutakurs").
//
// Priset räknas som resten av butiken: pris = nio((landat + 2,9 €-avgiften) × 3 × kurs),
// jämförpris = nio(pris × 1,3), cogs = landat × kurs UTAN avgiften.
import { Butik } from '../api.mjs';
import { FX_SEK, AVGIFT_USD, nio, STORLEKAR, PRODUKT_ID, OFFERERAD } from './fakta.mjs';

// Landad kostnad i USD per längd (produkt + frakt, ex moms, qty 1, SWEDEN).
// 6.5 är CWD:s riktiga offertrad. Resten fylls i när svaret kommer.
const LANDAT_USD = {
  5.5: null,
  6.5: OFFERERAD.landat_usd,   // 36.17 — belagd
  7.5: null,
  8.5: null,
  9.5: null,
  10.5: null,
  11.5: null,
  12.5: null,
  13.5: null,
};

const skarp = process.argv.includes('--skarp');
const rad = (s) => {
  const usd = LANDAT_USD[s.langd_m];
  if (usd == null) return { ...s, saknas: true };
  const pris = nio((usd + AVGIFT_USD) * 3 * FX_SEK);
  return { ...s, usd, cogs: +(usd * FX_SEK).toFixed(2), pris, jamfor: nio(pris * 1.3) };
};
const rader = STORLEKAR.map(rad);
const saknade = rader.filter((r) => r.saknas);

console.log('Storlek        Landat USD   Inköp SEK      Pris    Jämför   Kvar');
for (const r of rader) {
  if (r.saknas) { console.log(`${r.namn.padEnd(14)} ——  inköpspris saknas, CWD har inte offererat storleken`); continue; }
  console.log(`${r.namn.padEnd(14)} ${String(r.usd).padStart(7)}   ${String(r.cogs).padStart(8)}   ${String(r.pris).padStart(6)}   ${String(r.jamfor).padStart(6)}   ${String(r.pris - Math.round(r.cogs)).padStart(5)} kr`);
}
if (saknade.length) {
  console.log(`\n⚠️ ${saknade.length} av ${rader.length} storlekar saknar inköpspris: ${saknade.map((r) => r.namn).join(', ')}`);
  console.log('   Fyll i LANDAT_USD överst i den här filen när CWD svarat.');
}
if (!skarp) { console.log('\n(torrkörning — lägg till --skarp för att skapa varianterna)'); process.exit(0); }
if (saknade.length) { console.error('\nAvbryter: skapar inga varianter med gissade inköpspriser.'); process.exit(1); }

const b = new Butik('se');
console.log('\n' + (await b.verifiera()).name);
const q = await b.fraga(`query($id:ID!){product(id:$id){title options{id name} variants(first:20){nodes{id title}}}}`, { id: PRODUKT_ID });
console.log('produkt:', q.product.title, '| options:', JSON.stringify(q.product.options));

// 1. Lägg till storleksdimensionen med alla nio värdena
await b.mutera(
  `mutation($productId:ID!,$options:[OptionCreateInput!]!,$variantStrategy:ProductOptionCreateVariantStrategy){
     productOptionsCreate(productId:$productId,options:$options,variantStrategy:$variantStrategy){userErrors{field message}}}`,
  { productId: PRODUKT_ID, variantStrategy: 'CREATE',
    options: [{ name: 'Storlek', values: rader.map((r) => ({ name: r.namn })) }] },
  'productOptionsCreate');

// 2. Sätt pris, jämförpris, cogs, SKU och lagerpolicy på varje variant
const v = await b.fraga(`query($id:ID!){product(id:$id){variants(first:30){nodes{id title selectedOptions{name value}}}}}`, { id: PRODUKT_ID });
const varianter = v.product.variants.nodes.map((n) => {
  const val = n.selectedOptions.find((o) => o.name === 'Storlek')?.value;
  const r = rader.find((x) => x.namn === val);
  if (!r) throw new Error(`hittar ingen prisrad för varianten "${n.title}"`);
  return { id: n.id, price: String(r.pris), compareAtPrice: String(r.jamfor), taxable: false,
    inventoryPolicy: 'CONTINUE', inventoryItem: { sku: r.sku, tracked: false, cost: String(r.cogs) } };
});
await b.mutera(
  `mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!){productVariantsBulkUpdate(productId:$productId,variants:$variants){userErrors{field message}}}`,
  { productId: PRODUKT_ID, variants: varianter }, 'productVariantsBulkUpdate');

const slut = await b.fraga(`query($id:ID!){product(id:$id){title variants(first:30){nodes{title price compareAtPrice taxable inventoryPolicy inventoryItem{sku unitCost{amount}}}}}}`, { id: PRODUKT_ID });
console.log(`\n✔ ${slut.product.variants.nodes.length} varianter:`);
for (const n of slut.product.variants.nodes)
  console.log(`   ${n.title.padEnd(14)} ${n.price}/${n.compareAtPrice} | cogs ${n.inventoryItem.unitCost?.amount} | sku ${n.inventoryItem.sku} | moms ${n.taxable}`);
