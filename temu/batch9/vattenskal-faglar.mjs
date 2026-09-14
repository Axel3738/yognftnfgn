// Vattenskålen vinklas om från husdjur till VILDA FÅGLAR (Axels beslut 2026-09-14).
//   node temu/batch9/vattenskal-faglar.mjs <se|no> bild   # byter miljöbild + GIF (hund → fåglar) i galleriet
//   node temu/batch9/vattenskal-faglar.mjs <se|no> copy   # ny titel/seo/taggar/kategori (Bird Baths) + ny beskrivning ur copyn
// Copyn ligger i /tmp/b9/copy/vattenskal-faglar.json (Sonnet) och skrivs in i temu/batch9/copy.json av "copy"-läget.
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
import { GARANTI4, RUBRIKER4 } from '../utrullning/texter4.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const [land, lage] = process.argv.slice(2);
if (!['se', 'no'].includes(land) || !['bild', 'copy'].includes(lage)) { console.error('Användning: <se|no> <bild|copy>'); process.exit(1); }
const SPRÅK = { se: 'sv', no: 'no' }[land], MAPP = { se: '/tmp/b9/ut', no: '/tmp/b9/ut-no' }[land];
const f = FAKTA.vattenskal, sov = (ms) => new Promise((r) => setTimeout(r, ms));
const b = new Butik(land);
console.log((await b.verifiera()).name, '—', lage);
const q = await b.fraga(`query($q:String!){products(first:1,query:$q){nodes{id descriptionHtml media(first:20){nodes{id alt ... on MediaImage{image{url}}}}}}}`, { q: `sku:${f.sku}` });
const p = q.products.nodes[0];
const hitta = (namn) => p.media.nodes.find((m) => (m.image?.url || '').includes(namn));

async function laddaUpp(fil, filnamn, alt, ext) {
  const mime = ext === 'gif' ? 'image/gif' : 'image/jpeg';
  const st = await b.mutera(`mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
    { input: [{ filename: filnamn, mimeType: mime, httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(readFileSync(fil).length) }] }, 'stagedUploadsCreate');
  const put = await fetch(st.stagedTargets[0].url, { method: 'PUT', headers: { 'content-type': mime }, body: readFileSync(fil) });
  if (!put.ok) throw new Error(`PUT ${filnamn}: ${put.status}`);
  const cm = await b.mutera(`mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
    { productId: p.id, media: [{ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[0].resourceUrl, alt }] }, 'productCreateMedia');
  const mid = cm.media[0].id;
  for (let i = 0; i < 40; i++) { await sov(3000);
    const s = await b.fraga(`query($id:ID!){node(id:$id){... on MediaImage{status image{url}}}}`, { id: mid });
    if (s.node.status === 'READY') return { id: mid, url: s.node.image.url };
    if (s.node.status === 'FAILED') throw new Error(`${filnamn}: FAILED`); }
  throw new Error(`${filnamn}: tog för lång tid`);
}

if (lage === 'bild') {
  // 1. bort med hundbilden och hund-GIF:en
  const gamla = ['jpg', 'gif'].map((e) => hitta(`b10-vattenskal-miljo-${land}.${e}`)).filter(Boolean);
  if (gamla.length) await b.mutera(`mutation d($productId:ID!,$mediaIds:[ID!]!){productDeleteMedia(productId:$productId,mediaIds:$mediaIds){deletedMediaIds mediaUserErrors{field message}}}`, { productId: p.id, mediaIds: gamla.map((m) => m.id) }, 'productDeleteMedia');
  console.log(`- ${gamla.length} gamla media raderade`);
  // 2. ny fågelbild, plats 2 — filnamnet får versionssuffix så CDN-cachen inte ger den gamla
  const ny = await laddaUpp(`${MAPP}/vattenskal/vattenskal-miljo.jpg`, `b10-vattenskal-miljo-faglar-${land}.jpg`, 'AI-genererad bild: blåmesar dricker ur den uppvärmda vattenskålen i snön bredvid ett fågelbord', 'jpg');
  const kvar = p.media.nodes.filter((m) => !gamla.includes(m)).map((m) => m.id);
  const ordning = [kvar[0], ny.id, ...kvar.slice(1)];
  await b.mutera(`mutation o($id:ID!,$moves:[MoveInput!]!){productReorderMedia(id:$id,moves:$moves){userErrors{field message}}}`,
    { id: p.id, moves: ordning.map((mId, i) => ({ id: mId, newPosition: String(i) })) }, 'productReorderMedia');
  console.log(`+ miljöbild (fåglar) uppladdad: ${ny.url.replace(/\?.*/, '')}`);
}

if (lage === 'copy') {
  const ny = JSON.parse(readFileSync('/tmp/b9/copy/vattenskal-faglar.json', 'utf8'));
  const t = ny[SPRÅK], r = RUBRIKER4[SPRÅK];
  // GIF:en (fåglar) laddas upp här om den finns och inte redan ligger uppe
  let gif = hitta(`b10-vattenskal-miljo-faglar-${land}.gif`);
  const gifFil = `${MAPP}/vattenskal/vattenskal-miljo.gif`;
  if (!gif && existsSync(gifFil)) { gif = await laddaUpp(gifFil, `b10-vattenskal-miljo-faglar-${land}.gif`, t.alt.gif, 'gif'); console.log('+ GIF (fåglar) uppladdad'); }
  const url = { hero: hitta(`b10-vattenskal-hero-${land}`)?.image.url, fakta: hitta(`b10-vattenskal-fakta-${land}`)?.image.url,
    miljo: hitta(`b10-vattenskal-miljo-faglar-${land}.jpg`)?.image.url, gif: gif?.image?.url || gif?.url };
  const bild = (u, alt, extra = '') => u ? `<p><img src="${u}" alt="${alt}" loading="lazy" style="max-width:100%;height:auto${extra}"></p>` : '';
  const html =
    `<h3>${t.problemH}</h3><p>${t.problemP}</p>` +
    (bild(url.gif, t.alt.gif, ';border-radius:8px') || bild(url.miljo, t.alt.miljo)) +
    `<h3>${t.losningH}</h3><p>${t.losningP}</p>` + bild(url.hero, t.alt.hero) +
    `<h3>${r.funktioner}</h3><ul>\n` + t.bullets.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` +
    bild(url.fakta, t.alt.fakta) + `<p><em>${t.aiRad}</em></p>` +
    (t.varning ? `<p><em>${t.varning}</em></p>` : '') + `<h3>${r.garanti}</h3><p>${GARANTI4[SPRÅK]}</p>`;
  await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
    { input: { id: p.id, title: t.titel, descriptionHtml: html, tags: t.taggar, seo: { title: t.seoTitel, description: t.seoText },
      category: 'gid://shopify/TaxonomyCategory/hg-3-11' } }, 'productUpdate');   // Home & Garden > Decor > Bird Baths
  // alt-texter på hero/detalj/fakta
  const alts = [['hero', t.alt.hero], ['detalj', t.alt.detalj], ['fakta', t.alt.fakta], ['miljo-faglar', t.alt.miljo]]
    .map(([k, alt]) => ({ id: hitta(`b10-vattenskal-${k}-${land}`)?.id, alt })).filter((x) => x.id);
  await b.mutera(`mutation a($productId:ID!,$media:[UpdateMediaInput!]!){productUpdateMedia(productId:$productId,media:$media){mediaUserErrors{field message}}}`, { productId: p.id, media: alts }, 'productUpdateMedia');
  // skriv in i copy.json
  const copy = JSON.parse(readFileSync(path.join(HÄR, 'copy.json'), 'utf8'));
  copy.vattenskal = { sv: ny.sv, no: ny.no };
  writeFileSync(path.join(HÄR, 'copy.json'), JSON.stringify(copy, null, 2) + '\n');
  console.log(`✔ ${t.titel} — beskrivning, seo, taggar, kategori Bird Baths, alt-texter`);
}
