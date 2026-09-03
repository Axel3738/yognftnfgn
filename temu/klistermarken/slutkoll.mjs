import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
const SKU = 'TEMU-601102867393554';
const FART = /snabb\s+lever|rask\s+lever|hurtig\s+lever|nopea\s+toimitus|fast\s+deliver|fast\s+shipping/i;
for (const land of ['se', 'no', 'dk', 'fi', 'uk']) {
  const b = new Butik(land); const shop = await b.verifiera();
  const d = await b.fraga(`query { products(first:1, query:"sku:${SKU}*") { nodes { title handle status templateSuffix
    category { name } tags descriptionHtml resourcePublicationsCount { count }
    variants(first:5){nodes{ sku price compareAtPrice taxable inventoryPolicy inventoryItem{ tracked unitCost{amount} } }}
    media(first:20){nodes{ status alt ... on MediaImage { image { url } } }} } } }`);
  const p = d.products.nodes[0];
  if (!p) { console.log(`\n${shop.name}: SAKNAS ⚠️`); continue; }
  const v = p.variants.nodes[0];
  const urls = [...p.descriptionHtml.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
  const koder = await Promise.all(urls.map(async (u) => (await fetch(u, { method: 'HEAD' })).status));
  const bullets = [...p.descriptionHtml.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
  console.log(`\n${shop.name} — ${p.title}`);
  console.log(`  ${p.status} | mall ${p.templateSuffix} | ${p.category?.name} | ${p.resourcePublicationsCount.count} kanaler | taggar: ${p.tags.length}`);
  console.log(`  ${v.price}/${v.compareAtPrice} | moms ${v.taxable} | ${v.inventoryPolicy} | spårning ${v.inventoryItem.tracked} | cogs ${v.inventoryItem.unitCost?.amount ?? 'SAKNAS ⚠️'}`);
  console.log(`  ${p.media.nodes.length} media (${p.media.nodes.filter((m) => m.status === 'READY').length} READY, ${p.media.nodes.filter((m) => !m.alt).length} utan alt)`);
  console.log(`  beskrivning: ${urls.length} bilder [${koder.join(' ')}] | ${bullets.length} bullets, ${bullets.filter((x) => x.includes('<strong>')).length} med fetstil`);
  console.log(`  hastighetslöfte: ${FART.test(p.descriptionHtml) ? 'JA ⚠️' : 'nej'} | HTML-kommentar: ${/<!--/.test(p.descriptionHtml) ? 'JA ⚠️' : 'nej'} | "20 × 20": ${/20\s*×\s*20/.test(p.descriptionHtml) ? 'ja' : 'nej'}`);
}
