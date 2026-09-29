// Läser hela katalogen i en butik och listar produktsidor som bryter mot sidreglerna i CLAUDE.md:
// ingen GIF, färre än 4 bilder, GIF först i galleriet, ingen bild i beskrivningen. Bara läsning.
//   node temu/sidkoll.mjs <se|no> [--alla]      (--alla = skriv ut varje produkt, annars bara summering + värsta)
import { Butik } from './api.mjs';
const land = process.argv[2] || 'se', alla = process.argv.includes('--alla');
const b = new Butik(land); await b.verifiera();
const rader = [];
for (let after = null; ;) {
  const d = await b.fraga(`query($a:String){products(first:100,after:$a,query:"status:active"){pageInfo{hasNextPage endCursor} nodes{title handle descriptionHtml media(first:50){nodes{... on MediaImage{image{url}}}}}}}`, { a: after });
  for (const p of d.products.nodes) {
    const urls = p.media.nodes.map((m) => m.image?.url || '');
    const gif = urls.findIndex((u) => /\.gif/i.test(u));
    rader.push({ t: p.title, h: p.handle, bilder: urls.filter((u) => !/\.gif/i.test(u)).length, gif: gif >= 0, gifForst: gif === 0 && urls.length > 1, text: (p.descriptionHtml.match(/<img/g) || []).length });
  }
  if (!d.products.pageInfo.hasNextPage) break; after = d.products.pageInfo.endCursor;
}
const utanGif = rader.filter((r) => !r.gif), fa = rader.filter((r) => r.bilder < 4), först = rader.filter((r) => r.gifForst), utanText = rader.filter((r) => !r.text);
console.log(`${land.toUpperCase()}: ${rader.length} aktiva produkter · utan GIF ${utanGif.length} · färre än 4 bilder ${fa.length} · GIF först i galleriet ${först.length} · ingen bild i texten ${utanText.length}`);
const värst = rader.filter((r) => !r.gif && r.bilder < 4).sort((a, b) => a.bilder - b.bilder);
console.log(`utan GIF OCH färre än 4 bilder: ${värst.length}`);
for (const r of (alla ? rader : värst)) console.log(`  ${String(r.bilder).padStart(2)} bilder · gif ${r.gif ? 'ja' : 'nej'} · text ${r.text} · ${r.t.slice(0, 60)} · /${r.h}`);
