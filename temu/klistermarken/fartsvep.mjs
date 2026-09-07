// Letar hastighetslöften i alla butikers produktbeskrivningar.
import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
const M = /snabb\s+lever|snabb\s+frakt|rask\s+lever|hurtig\s+lever|nopea\s+toimitus|fast\s+deliver|fast\s+shipping|express\s+lever|24\s*h|1-3\s*(vardagar|dager|hverdage|arki|working)/i;
for (const land of ['se', 'no', 'dk', 'fi', 'uk']) {
  const b = new Butik(land); const shop = await b.verifiera();
  let c = null; const träff = []; let n = 0;
  do {
    const d = await b.fraga(`query($a:String){products(first:100,after:$a){pageInfo{hasNextPage endCursor}
      nodes{ title handle descriptionHtml }}}`, { a: c });
    for (const p of d.products.nodes) { n++; const m = M.exec(p.descriptionHtml || ''); if (m) träff.push([p.title, m[0]]); }
    c = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
  } while (c);
  console.log(`\n${shop.name}: ${träff.length} av ${n} produkter med hastighetslöfte`);
  träff.slice(0, 40).forEach(([t, m]) => console.log(`   "${m}"  ${t.slice(0, 60)}`));
  if (träff.length > 40) console.log(`   … +${träff.length - 40} till`);
}
