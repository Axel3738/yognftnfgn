// Lägger skördens galleri på produkterna i SE och NO enligt galleri.mjs (förberett av galleri-fix.mjs).
//   node temu/batch11/galleri-bygg.mjs <se|no> [--skarp] [id …]
// Finns produkten (SKU) → nya bilder laddas upp med alt-text, ordnas (QC-fotot först eller sist),
// beskrivningen byggs om i 7-blocksordningen med GIF/bild A, bild B, bild C.
// Finns den inte (VÄNTA → bygg) → skapas komplett: titel, galleri, beskrivning, variant, alla kanaler.
// Idempotent: en bild vars alt-text redan finns på produkten laddas inte upp igen.
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
import { PRIS } from './priser.mjs';
import { GALLERI } from './galleri.mjs';
import { AI } from './ai.mjs';
import { beskrivning, SPRÅK } from './beskrivning.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const UT = '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/galleri';
const AIUT = '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/ai';
const VENDOR = { se: 'Bäverbutiken', no: 'Beverbutikken' };
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const land = process.argv[2], skarp = process.argv.includes('--skarp');
const bara = process.argv.slice(3).filter((a) => !a.startsWith('--'));
if (!['se', 'no'].includes(land)) { console.error('Användning: node temu/batch11/galleri-bygg.mjs <se|no> [--skarp] [id …]'); process.exit(1); }
const COPY = JSON.parse(readFileSync(path.join(HÄR, 'copy.json'), 'utf8'));
// NO får norska alt-texter: alt-no.json = { svensk alt: norsk alt } (galleri.mjs + ai.mjs bär bara svenska). Saknas en översättning används den svenska och det loggas.
const ALT_NO = existsSync(path.join(HÄR, 'alt-no.json')) ? JSON.parse(readFileSync(path.join(HÄR, 'alt-no.json'), 'utf8')) : {};
const saknadAlt = new Set();
const altFor = (alt) => { if (land !== 'no' || !alt) return alt; if (ALT_NO[alt]) return ALT_NO[alt]; saknadAlt.add(alt); return alt; };
const b = new Butik(land); const shop = await b.verifiera();
if ((land === 'se' && shop.currencyCode !== 'SEK') || (land === 'no' && shop.currencyCode !== 'NOK')) throw new Error(`Fel butik: ${shop.name}`);
console.log(`${shop.name} — ${skarp ? 'SKARP KÖRNING' : 'torrkörning'}\n`);
const kanaler = skarp ? await b.kanaler() : [];
const slug = (t) => t.toLowerCase().replace(/[åä]/g, 'a').replace(/ö|ø/g, 'o').replace(/æ/g, 'ae').replace(/é/g, 'e').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const utfil = (id, x) => path.join(UT, id, `${x.ny || x.fil}${x.kie ? '-sv' : ''}.jpg`);

async function väntaMedia(pid, ids) {
  for (let i = 0; ; i++) {
    await sov(3000);
    const s = await b.fraga(`query($id:ID!){product(id:$id){media(first:50){nodes{id status alt ... on MediaImage{image{url}}}}}}`, { id: pid });
    const rel = s.product.media.nodes.filter((n) => ids.includes(n.id));
    if (rel.length === ids.length && rel.every((n) => n.status === 'READY')) return ids.map((m) => { const n = rel.find((x) => x.id === m); return { id: n.id, url: n.image.url, alt: n.alt }; });
    if (rel.some((n) => n.status === 'FAILED')) throw new Error('media FAILED');
    if (i > 60) throw new Error('media tog för lång tid');
  }
}
async function laddaUpp(pid, filer) {   // filer: [{fil, alt, gif}]
  const ut = [];
  for (let start = 0; start < filer.length; start += 8) {           // åtta i taget
    const del = filer.slice(start, start + 8);
    const st = await b.mutera(`mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
      { input: del.map((f) => ({ filename: path.basename(f.fil), mimeType: f.gif ? 'image/gif' : 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(readFileSync(f.fil).length) })) }, 'stagedUploadsCreate');
    for (let i = 0; i < del.length; i++) { const res = await fetch(st.stagedTargets[i].url, { method: 'PUT', headers: { 'content-type': del[i].gif ? 'image/gif' : 'image/jpeg' }, body: readFileSync(del[i].fil) }); if (!res.ok) throw new Error(`PUT ${del[i].fil}: ${res.status}`); }
    const cm = await b.mutera(`mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
      { productId: pid, media: st.stagedTargets.map((t, i) => ({ mediaContentType: 'IMAGE', originalSource: t.resourceUrl, alt: del[i].alt })) }, 'productCreateMedia');
    ut.push(...await väntaMedia(pid, cm.media.map((m) => m.id)));
  }
  return ut;
}

for (const [id, g] of Object.entries(GALLERI)) {
  if (bara.length && !bara.includes(id)) continue;
  const f = FAKTA[id], t = COPY[id]?.[SPRÅK[land]], p = PRIS.find((x) => x.id === id)?.land[land.toUpperCase()];
  if (!t) { console.log(`- ${id}: ingen ${SPRÅK[land]}-copy — hoppar`); continue; }
  // ordning: AI-hero → skördebilder → övriga AI-bilder. AI-filer ligger i <scratch>/ai/<id>/<namn>.jpg (ai-kor.mjs)
  const aiB = (AI[id]?.bilder || []).map((x) => ({ fil: path.join(AIUT, id, `${x.namn}.jpg`), alt: altFor(x.alt), altSv: x.alt, hero: x.plats === 'hero' })).filter((x) => existsSync(x.fil) || console.log(`  ! ${id}: AI-bild ${path.basename(x.fil)} saknas — hoppas`));
  const nya = [...aiB.filter((x) => x.hero), ...g.bilder.map((x) => ({ fil: utfil(id, x), alt: altFor(x.alt), altSv: x.alt })).filter((x) => existsSync(x.fil) || console.log(`  ! ${id}: saknar ${path.basename(x.fil)} (KIE ej klar?) — hoppas`)), ...aiB.filter((x) => !x.hero)];
  const gifAlt = altFor(g.gif?.alt) || (AI[id]?.video ? (land === 'no' ? 'Produktet i bevegelse (AI-illustrasjon)' : 'Produkten i rörelse (AI-illustration)') : null);
  const gif = gifAlt && existsSync(path.join(UT, id, 'video.gif')) ? { fil: path.join(UT, id, 'video.gif'), alt: gifAlt, altSv: g.gif?.alt || gifAlt, gif: true } : null;
  if (!nya.length && !gif) { console.log(`- ${id}: inga nya bilder`); continue; }

  const finns = (await b.fraga(`query($q:String!){products(first:2,query:$q){nodes{id title handle status media(first:50){nodes{id alt ... on MediaImage{image{url}}}}}}}`, { q: `sku:${f.sku}` })).products.nodes[0];
  if (!finns && f.status !== 'bygg') { console.log(`- ${id}: finns inte och status ${f.status} — hoppar`); continue; }
  let gamla = finns ? finns.media.nodes.map((m) => ({ id: m.id, url: m.image?.url, alt: m.alt })) : [];
  // NO: medier som laddades upp med svensk alt-text får den norska via fileUpdate i stället för att laddas om (idempotensen bygger på alt).
  const byt = land === 'no' ? [...nya, ...(gif ? [gif] : [])].filter((x) => x.altSv !== x.alt && !gamla.some((m) => m.alt === x.alt)).map((x) => ({ m: gamla.find((m) => m.alt === x.altSv), alt: x.alt })).filter((r) => r.m) : [];
  if (byt.length) { if (skarp) await b.mutera(`mutation($files:[FileUpdateInput!]!){fileUpdate(files:$files){files{id} userErrors{field message}}}`, { files: byt.map((r) => ({ id: r.m.id, alt: r.alt })) }, 'fileUpdate'); for (const r of byt) r.m.alt = r.alt; }
  // qc:'bort' → gamla medier som inte hör till det nya galleriet tas bort (fel QC-foto). ersatt → bilder med samma alt laddas om.
  const bort = gamla.filter((m) => (g.qc === 'bort' && !nya.some((x) => x.alt === m.alt) && m.alt !== gif?.alt) || (g.ersatt === true && (nya.some((x) => x.alt === m.alt) || m.alt === gif?.alt)) || (Array.isArray(g.ersatt) && g.ersatt.some((e) => (m.alt || '').includes(e))));
  if (bort.length && skarp) { await b.mutera(`mutation($productId:ID!,$mediaIds:[ID!]!){productDeleteMedia(productId:$productId,mediaIds:$mediaIds){deletedMediaIds mediaUserErrors{field message}}}`, { productId: finns.id, mediaIds: bort.map((m) => m.id) }, 'productDeleteMedia'); gamla = gamla.filter((m) => !bort.includes(m)); console.log(`  - ${id}: ${bort.length} gamla medier borttagna`); }
  const attLadda = [...(gif ? [gif] : []), ...nya].filter((x) => !gamla.some((m) => m.alt === x.alt));
  if (!skarp) { console.log(`${finns ? '~' : '+'} ${id}: ${finns ? finns.title : t.titel}\n    ${gamla.length} befintliga (${bort.length} tas bort, ${byt.length} alt→no), ${attLadda.length} nya (${nya.length} bilder varav ${aiB.length} AI${gif ? ' + gif' : ''}), QC ${g.qc || 'sist'}${finns ? '' : ` · SKAPAS ${p.pris}/${p.jamfor} cogs ${p.cogs}`}`); continue; }

  let pid = finns?.id;
  if (!pid) {
    pid = (await b.mutera(`mutation($product: ProductCreateInput!) { productCreate(product: $product) { product { id } userErrors { field message } } }`,
      { product: { title: t.titel, vendor: VENDOR[land], status: 'DRAFT', templateSuffix: 'claudeprodukter', category: f.kategori, tags: t.taggar, seo: { title: t.seoTitel, description: t.seoText } } }, 'productCreate')).product.id;
  }
  const uppl = attLadda.length ? await laddaUpp(pid, attLadda) : [];
  // alla media i önskad ordning: [gif?, nya…] + QC, eller QC + [nya…] (gif ligger alltid först bland de nya)
  const alla = (await b.fraga(`query($id:ID!){product(id:$id){media(first:50){nodes{id alt ... on MediaImage{image{url}}}}}}`, { id: pid })).product.media.nodes.map((m) => ({ id: m.id, url: m.image?.url, alt: m.alt }));
  const byAlt = (alt) => alla.find((m) => m.alt === alt);
  // galleriordning (Axel 2026-09-24: GIF:en aldrig först — den ligger sist, beskrivningen visar den ändå)
  const gifM = gif ? byAlt(gif.alt) : null;
  const nyaM = nya.map((x) => byAlt(x.alt)).filter(Boolean);
  const qcM = alla.filter((m) => !nyaM.includes(m) && m !== gifM);
  const ordning = [...(g.qc === 'forst' ? [...qcM, ...nyaM] : [...nyaM, ...qcM]), ...(gifM ? [gifM] : [])];
  const moves = ordning.map((m, i) => ({ id: m.id, newPosition: String(i) })).filter((mv, i) => alla[i]?.id !== mv.id);
  if (moves.length) await b.mutera(`mutation($id:ID!,$moves:[MoveInput!]!){productReorderMedia(id:$id,moves:$moves){userErrors{field message}}}`, { id: pid, moves }, 'productReorderMedia');
  // beskrivningens tre bildplatser: A = gif eller första nya bilden, B = nästa, C = nästa (annars QC)
  // beskrivningens tre platser: A = GIF (annars första bilden), B och C = nästa två — C faller tillbaka på B/A så
  // det alltid ligger en bild mellan funktioner och garanti (Axel 2026-09-24)
  const pool = [...nyaM, ...qcM];
  const A = gifM ? { ...gifM, gif: true } : pool.shift();
  const B = pool.shift() || (gifM ? nyaM[0] : null) || null;
  const C = pool.shift() || (B && B !== nyaM[0] ? nyaM[0] : null) || B || (gifM ? null : A) || null;
  await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
    { input: { id: pid, descriptionHtml: beskrivning(t, { a: A, b: B, c: C }, land), ...(finns ? {} : { status: 'ACTIVE' }), ...(g.omskriven ? { title: t.titel, handle: slug(t.titel), tags: t.taggar, seo: { title: t.seoTitel, description: t.seoText } } : {}) } }, 'productUpdate');
  if (!finns) {
    const v = await b.fraga(`query($id:ID!){product(id:$id){variants(first:3){nodes{id}}}}`, { id: pid });
    await b.mutera(`mutation($productId:ID!,$variants:[ProductVariantsBulkInput!]!){productVariantsBulkUpdate(productId:$productId,variants:$variants){userErrors{field message}}}`,
      { productId: pid, variants: [{ id: v.product.variants.nodes[0].id, price: String(p.pris), compareAtPrice: String(p.jamfor), taxable: false, inventoryPolicy: 'CONTINUE', inventoryItem: { sku: f.sku, tracked: false, cost: String(p.cogs) } }] }, 'productVariantsBulkUpdate');
    await b.mutera(`mutation($id:ID!,$input:[PublicationInput!]!){publishablePublish(id:$id,input:$input){userErrors{field message}}}`, { id: pid, input: kanaler.map((k) => ({ publicationId: k.id })) }, 'publishablePublish');
  }
  await sov(1500);
  const q = (await b.fraga(`query($id:ID!){product(id:$id){title handle status resourcePublicationsCount{count} variants(first:1){nodes{sku price compareAtPrice}} media(first:50){nodes{status}}}}`, { id: pid })).product;
  console.log(`${finns ? '~' : '+'} ${id}: ${q.title}\n    ${q.status} | ${q.variants.nodes[0].price}/${q.variants.nodes[0].compareAtPrice} | ${q.media.nodes.filter((m) => m.status === 'READY').length}/${q.media.nodes.length} media | ${q.resourcePublicationsCount.count} kanaler | ${uppl.length} uppladdade\n    ${land === 'se' ? 'https://baverbutiken.se' : 'https://beverbutikken.no'}/products/${q.handle}`);
}
if (saknadAlt.size) console.log(`\n! ${saknadAlt.size} alt-texter saknar norsk översättning i alt-no.json (svensk användes):\n  ${[...saknadAlt].join('\n  ')}`);
