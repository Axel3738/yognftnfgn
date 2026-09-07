// Rensar kvarglömda HTML-kommentarer (platshållare) i alla butiker.
import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
const skarp = process.argv.includes('--skarp');
const K = /<!--[\s\S]*?-->/g;
for (const land of ['se', 'no', 'dk', 'fi', 'uk']) {
  const b = new Butik(land); const shop = await b.verifiera();
  let c = null; const alla = [];
  do {
    const d = await b.fraga(`query($a:String){products(first:100,after:$a){pageInfo{hasNextPage endCursor} nodes{ id title descriptionHtml }}}`, { a: c });
    alla.push(...d.products.nodes);
    c = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
  } while (c);
  const träff = alla.filter((p) => K.test(p.descriptionHtml || '') && (K.lastIndex = 0, true));
  console.log(`${shop.name}: ${träff.length} produkter med HTML-kommentarer`);
  for (const p of träff) {
    if (!skarp) { console.log(`   · ${p.title.slice(0, 55)}  ${JSON.stringify((p.descriptionHtml.match(K) || [])[0]?.slice(0, 60))}`); continue; }
    await b.mutera(`mutation u($input: ProductUpdateInput!) { productUpdate(product: $input) { userErrors { field message } } }`,
      { input: { id: p.id, descriptionHtml: p.descriptionHtml.replace(K, '') } }, 'productUpdate');
    console.log(`   ✔ ${p.title.slice(0, 55)}`);
  }
}
