import { lasButik, skapaKlient } from '/home/user/yognftnfgn/sparning/butik.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const SKARPT = process.argv.includes('--skarpt');
const k = await skapaKlient(lasButik('matstrumpor'));
const tema = 'gid://shopify/OnlineStoreTheme/207180890451';
const B = '/home/user/yognftnfgn/matstrumpor/erbjudanden/output/tema-original/2026-09-30-13-47/';
const BK = '/home/user/yognftnfgn/matstrumpor/erbjudanden/output/tema-original/fore-av-2026-10-03/';
mkdirSync(BK+'templates', { recursive: true }); mkdirSync(BK+'config', { recursive: true });
const huvud = s => (s.match(/^\s*\/\*[\s\S]*?\*\/\s*/)||[''])[0];
const strip = s => JSON.parse(s.slice(huvud(s).length));
const las = async (f) => (await k.graphql(`query($id:ID!,$f:[String!]){ theme(id:$id){ files(filenames:$f, first:1){ nodes{ body{ ... on OnlineStoreThemeFileBodyText{ content } } } } } }`, { id: tema, f: [f] })).theme.files.nodes[0].body.content;
const skriv = async (f, text) => { const r = await k.graphql(`mutation($id:ID!,$files:[OnlineStoreThemeFilesUpsertFileInput!]!){ themeFilesUpsert(themeId:$id, files:$files){ userErrors{ message } } }`, { id: tema, files: [{ filename: f, body: { type: 'TEXT', value: text } }] }); if (r.themeFilesUpsert.userErrors.length) throw new Error(JSON.stringify(r.themeFilesUpsert.userErrors)); };

// 1. settings: testet av
const S = 'config/settings_data.json'; const s = await las(S); writeFileSync(BK+S, s);
if (!s.includes('paket:50:50')) throw new Error('settings: hittar inte paket:50:50');
const sNy = s.replace('paket:50:50', '# paket:50:50');
console.log('1. settings: paket:50:50 → # paket:50:50');
// 2. nivåerna
const niv = (await k.graphql(`{ metaobjects(type:"ms_paketniva", first:30){ nodes{ id handle fields{ key value } } } }`)).metaobjects.nodes.filter(m=>['sushi-2','sushi-4'].includes(m.handle));
console.log('2. nivåer → ab_variant "":', niv.map(m=>m.handle).join(', '));
// 3. product.json: ms_paket ur backup, ms_paket_b bort
const P = 'templates/product.json'; const p = await las(P); writeFileSync(BK+P, p);
const pL = strip(p), pO = strip(readFileSync(B+P,'utf8'));
pL.sections.main.blocks.ms_paket = pO.sections.main.blocks.ms_paket;
delete pL.sections.main.blocks.ms_paket_b;
pL.sections.main.block_order = pL.sections.main.block_order.filter(b=>b!=='ms_paket_b');
const pNy = huvud(p) + JSON.stringify(pL, null, 2);
console.log('3. product.json: ms_paket =', JSON.stringify(pO.sections.main.blocks.ms_paket).slice(0,160), '· ms_paket_b bort');
// 4. index.json: blocket paket ur backup
const I = 'templates/index.json'; const i = await las(I); writeFileSync(BK+I, i);
const iL = strip(i), iO = strip(readFileSync(B+I,'utf8'));
iL.sections.produkt.blocks.paket = iO.sections.produkt.blocks.paket;
const iNy = huvud(i) + JSON.stringify(iL, null, 2);
console.log('4. index.json: produkt/paket =', JSON.stringify(iO.sections.produkt.blocks.paket).slice(0,200));
if (!SKARPT) { console.log('torrt'); process.exit(0); }
await skriv(S, sNy); console.log('✅ 1 skriven');
for (const m of niv) { const r = await k.graphql(`mutation($id:ID!,$m:MetaobjectUpdateInput!){ metaobjectUpdate(id:$id, metaobject:$m){ userErrors{ message } } }`, { id: m.id, m: { fields: [{ key: 'ab_variant', value: '' }] } }); if (r.metaobjectUpdate.userErrors.length) throw new Error(JSON.stringify(r.metaobjectUpdate.userErrors)); }
console.log('✅ 2 skrivna');
await skriv(P, pNy); console.log('✅ 3 skriven');
await skriv(I, iNy); console.log('✅ 4 skriven');
// tillbakaläsning
const s2 = await las(S), p2 = strip(await las(P)), i2 = strip(await las(I));
const n2 = (await k.graphql(`{ metaobjects(type:"ms_paketniva", first:30){ nodes{ handle fields{ key value } } } }`)).metaobjects.nodes.filter(m=>['sushi-2','sushi-4'].includes(m.handle)).map(m=>m.handle+':'+JSON.stringify(m.fields.find(f=>f.key==='ab_variant')?.value));
console.log('tillbaka:', s2.includes('# paket:50:50'), !p2.sections.main.blocks.ms_paket_b, JSON.stringify(p2.sections.main.blocks.ms_paket)===JSON.stringify(pO.sections.main.blocks.ms_paket), JSON.stringify(i2.sections.produkt.blocks.paket)===JSON.stringify(iO.sections.produkt.blocks.paket), n2.join(' '));
