// Lägger in AI-miljöbild och/eller GIF på batch 9/10-produkterna i efterhand.
//   node temu/batch9/miljo-in.mjs <se|no> bild [id …]   # laddar upp <id>-miljo.jpg som media, plats 2 i galleriet
//   node temu/batch9/miljo-in.mjs <se|no> gif  [id …]   # laddar upp <id>-miljo.gif sist i galleriet + skriver om beskrivningen:
//                                                       #   GIF (eller miljöbilden om GIF saknas) efter problemblocket, AI-raden före garantin
// Idempotent: media som redan finns (filnamn b<batch>-<id>-miljo-<land>.<ext>) laddas inte upp igen,
// och beskrivningen skrivs bara om när AI-raden saknas.
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
import { RUBRIKER4 } from '../utrullning/texter4.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const [land, lage, ...bara] = process.argv.slice(2);
if (!['se', 'no'].includes(land) || !['bild', 'gif'].includes(lage)) { console.error('Användning: node temu/batch9/miljo-in.mjs <se|no> <bild|gif> [id …]'); process.exit(1); }
const SPRÅK = { se: 'sv', no: 'no' }[land];
const MAPP = { se: '/tmp/b9/ut', no: '/tmp/b9/ut-no' }[land];
const COPY = JSON.parse(readFileSync(path.join(HÄR, 'copy.json'), 'utf8'));
const r = RUBRIKER4[SPRÅK];
const sov = (ms) => new Promise((res) => setTimeout(res, ms));
const b = new Butik(land);
const shop = await b.verifiera();
console.log(`${shop.name} — ${lage}\n`);

for (const [id, f] of Object.entries(FAKTA)) {
  if (bara.length && !bara.includes(id)) continue;
  const t = COPY[id][SPRÅK];
  const q = await b.fraga(`query($q:String!){products(first:1,query:$q){nodes{id status descriptionHtml media(first:20){nodes{id alt ... on MediaImage{image{url}}}}}}}`, { q: `sku:${f.sku}` });
  const p = q.products.nodes[0];
  if (!p) { console.log(`- ${id}: finns inte i ${land.toUpperCase()}`); continue; }
  const ext = lage === 'gif' ? 'gif' : 'jpg';
  const fil = `${MAPP}/${id}/${id}-miljo.${ext}`;
  const filnamn = `b${f.batch}-${id}-miljo-${land}.${ext}`;
  const harMedia = (namn) => p.media.nodes.find((m) => (m.image?.url || '').includes(namn));
  let media = harMedia(filnamn);
  if (!media) {
    if (!existsSync(fil)) { console.log(`- ${id}: ${fil} saknas`); if (lage === 'bild') continue; }
    else {
      const st = await b.mutera(`mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
        { input: [{ filename: filnamn, mimeType: ext === 'gif' ? 'image/gif' : 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(readFileSync(fil).length) }] }, 'stagedUploadsCreate');
      const put = await fetch(st.stagedTargets[0].url, { method: 'PUT', headers: { 'content-type': ext === 'gif' ? 'image/gif' : 'image/jpeg' }, body: readFileSync(fil) });
      if (!put.ok) throw new Error(`PUT ${id}: ${put.status}`);
      const alt = ext === 'gif' ? (t.alt?.gif || t.alt?.miljo || t.titel) : (t.alt?.miljo || t.titel);
      const cm = await b.mutera(`mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
        { productId: p.id, media: [{ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[0].resourceUrl, alt }] }, 'productCreateMedia');
      const mid = cm.media[0].id;
      for (let i = 0; i < 40; i++) { await sov(3000);
        const s = await b.fraga(`query($id:ID!){node(id:$id){... on MediaImage{status image{url}}}}`, { id: mid });
        if (s.node.status === 'READY') { media = { id: mid, image: { url: s.node.image.url } }; break; }
        if (s.node.status === 'FAILED') throw new Error(`${id}: media FAILED`); }
      if (!media) throw new Error(`${id}: media tog för lång tid`);
      if (lage === 'bild') {   // plats 2: hero, miljö, detalj, fakta
        const ordning = [p.media.nodes[0].id, mid, ...p.media.nodes.slice(1).map((m) => m.id)];
        await b.mutera(`mutation o($id:ID!,$moves:[MoveInput!]!){productReorderMedia(id:$id,moves:$moves){userErrors{field message}}}`,
          { id: p.id, moves: ordning.map((mId, i) => ({ id: mId, newPosition: String(i) })) }, 'productReorderMedia');
      }
      console.log(`+ ${id}: ${filnamn} uppladdad`);
    }
  } else console.log(`= ${id}: ${filnamn} finns redan`);

  if (lage === 'gif') {
    // beskrivningen: GIF (eller miljöbild) efter problemblocket, AI-raden före garantin
    let html = p.descriptionHtml;
    if (/AI-genererade|AI-genererte/.test(html)) { console.log(`= ${id}: beskrivningen har redan AI-raden`); continue; }
    const gifUrl = media?.image?.url, jpg = harMedia(`b${f.batch}-${id}-miljo-${land}.jpg`)?.image?.url;
    const url = gifUrl || jpg; if (!url) { console.log(`- ${id}: varken GIF eller miljöbild att sätta in`); continue; }
    const alt = gifUrl ? (t.alt?.gif || t.alt?.miljo || t.titel) : (t.alt?.miljo || t.titel);
    const block = `<p><img src="${url}" alt="${alt}" loading="lazy" style="max-width:100%;height:auto${gifUrl ? ';border-radius:8px' : ''}"></p>`;
    const slut = html.indexOf('</p>');                       // problemstycket är första <p>
    html = html.slice(0, slut + 4) + block + html.slice(slut + 4);
    const g = html.indexOf(`<h3>${r.garanti}</h3>`);
    html = html.slice(0, g) + `<p><em>${t.aiRad}</em></p>` + html.slice(g);
    await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`, { input: { id: p.id, descriptionHtml: html } }, 'productUpdate');
    console.log(`  ${id}: beskrivning omskriven (${gifUrl ? 'GIF' : 'miljöbild'} + AI-rad)`);
  }
}
