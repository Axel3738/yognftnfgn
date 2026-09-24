// Uppdaterar "## Images"-stycket på batch 11–13:s live-kort i Notion när gallerierna är byggda.
//   node temu/batch11/notion-bilder.mjs [--skarp] [namndel …]   (kräver NOTION_TOKEN; utan namndel: alla batchens kort)
// Hittar kortets stycke som börjar "The store currently has the factory QC photo" (skrivet av notion-kort.mjs
// 2026-09-23) och byter det mot en rad som beskriver det som ligger skarpt i SE nu: antal bilder, GIF, AI-märkning,
// norsk länk. Kort utan det stycket (elcykeljackan, trädansiktet — redan omskrivna) hoppas över.
import { Butik } from '../api.mjs';
const T = process.env.NOTION_TOKEN; if (!T) throw new Error('NOTION_TOKEN saknas');
const skarp = process.argv.includes('--skarp'); const bara = process.argv.slice(2).filter((a) => !a.startsWith('--'));   // valfria namndelar: bara de korten
const DB = '3a7270ab908c807db90dc55d885cad13';
const H = { Authorization: `Bearer ${T}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' };
const n = async (metod, väg, body) => { const r = await fetch(`https://api.notion.com/v1${väg}`, { method: metod, headers: H, body: body ? JSON.stringify(body) : undefined }); const d = await r.json(); if (!r.ok) throw new Error(`${väg}: ${d.message}`); return d; };
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. korten
const kort = [];
for (let cursor; ;) {
  const d = await n('POST', `/databases/${DB}/query`, { filter: { or: ['11 ', '12 ', '13 '].map((p) => ({ property: 'Namn', title: { starts_with: p } })) }, start_cursor: cursor, page_size: 100 });
  kort.push(...d.results); if (!d.has_more) break; cursor = d.next_cursor;
}
// 2. skarpt läge i SE + NO per SKU
const se = new Butik('se'), no = new Butik('no');
const läge = async (b, sku) => { const q = await b.fraga(`query($q:String!){products(first:1,query:$q){nodes{handle media(first:50){nodes{alt ... on MediaImage{image{url}}}}}}}`, { q: `sku:${sku}` }); const p = q.products.nodes[0]; if (!p) return null;
  const m = p.media.nodes; return { handle: p.handle, bilder: m.filter((x) => !x.image?.url.includes('.gif')).length, gif: m.some((x) => x.image?.url.includes('.gif')), ai: m.filter((x) => /\(AI-illustration\)/.test(x.alt || '')).length }; };
let ändrade = 0;
for (const k of kort) {
  const namn = k.properties.Namn.title.map((t) => t.plain_text).join('');
  if (bara.length && !bara.some((x) => namn.includes(x))) continue;
  const lp = k.properties['Landing page']; const url = lp?.type === 'url' ? lp.url : (lp?.rich_text || []).map((t) => t.plain_text).join('').trim(); if (!url) continue;   // VÄNTA-kort (Landing page är rich_text i hubben)
  const handle = url.split('/products/')[1];
  const block = (await n('GET', `/blocks/${k.id}/children?page_size=100`)).results.find((b) => b.type === 'paragraph' && (b.paragraph.rich_text.map((t) => t.plain_text).join('').startsWith('The store currently has the factory QC photo') || b.paragraph.rich_text.map((t) => t.plain_text).join('').startsWith('Gallery complete (')));   // körs om → uppdaterar sitt eget stycke
  if (!block) { console.log(`= ${namn}: inget QC-stycke (redan omskrivet)`); continue; }
  const sku = (await se.fraga(`query($h:String!){productByHandle(handle:$h){variants(first:1){nodes{sku}}}}`, { h: handle })).productByHandle?.variants.nodes[0]?.sku;
  if (!sku) { console.log(`! ${namn}: ingen produkt på handle ${handle}`); continue; }
  const s = await läge(se, sku), o = await läge(no, sku);
  const text = `Gallery complete (2026-09-24): ${s.bilder} images${s.gif ? ' + 1 GIF (shown first in the description, last in the gallery)' : ', no GIF (still image instead)'}${s.ai ? `; ${s.ai} image${s.ai > 1 ? 's are' : ' is'} AI-made from a real product photo and labelled "(AI-illustration)" in the alt text` : ''}. Norway: ${o ? `https://beverbutikken.no/products/${o.handle}` : 'not yet'}. Use only what is visible on the page and in Locked facts — do not invent details.`;
  console.log(`${skarp ? '~' : '·'} ${namn}: ${text.slice(0, 110)}…`);
  if (skarp) { await n('PATCH', `/blocks/${block.id}`, { paragraph: { rich_text: [{ type: 'text', text: { content: text } }] } }); ändrade++; await sov(350); }
}
console.log(`\n${kort.length} kort lästa, ${ändrade} stycken ${skarp ? 'uppdaterade' : 'skulle uppdateras (torrkörning)'}`);
