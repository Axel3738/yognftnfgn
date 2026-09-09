// Lägger AI-miljöbilden i galleriet och bygger om beskrivningen enligt strukturen
// problem → bild → lösning → bild → funktioner → bild → garanti.
// AI-bilderna märks i alt-texten enligt ärlighetsregeln i CLAUDE.md.
import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
import { GARANTI4, RUBRIKER4 } from '/home/user/yognftnfgn/temu/utrullning/texter4.mjs';
import { T7_SV } from '/home/user/yognftnfgn/temu/utrullning/texter7.mjs';
import { readFileSync, existsSync } from 'node:fs';

const land = process.argv[2] || 'se';
const SPRÅK = { se: 'sv', no: 'no' };
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const AI_ALT = { sv: 'Miljöbild (AI-genererad illustration) – ', no: 'Miljøbilde (AI-generert illustrasjon) – ' };

let T = T7_SV;
if (land === 'no') T = (await import('/home/user/yognftnfgn/temu/utrullning/texter7-no.mjs')).T7_NO;

const b = new Butik(land);
const shop = await b.verifiera();
const r = RUBRIKER4[SPRÅK[land]];
console.log(`${shop.name}\n`);

for (const [nyckel, t] of Object.entries(T)) {
  const sku = T7_SV[nyckel].sku;
  const aiFil = `/tmp/fix/b7/ai/${nyckel}.png`;
  const d = await b.fraga(`query($q:String!){products(first:1,query:$q){nodes{id handle
    media(first:20){nodes{id alt ... on MediaImage{image{url}}}}}}}`, { q: `sku:${sku}` });
  const p = d.products.nodes[0];
  if (!p) { console.log(`✘ ${nyckel}: saknas`); continue; }

  const altMain0 = t.altMain || t.alt?.main || t.titel;
  const laddaUpp = async (fil, marke, alt) => {
    const redan = p.media.nodes.find((m) => new RegExp(`-${marke}\\.`).test(m.image?.url || ''));
    if (redan) return redan.image.url;
    if (!existsSync(fil)) return null;
    const buf = readFileSync(fil);
    const st = await b.mutera(
      `mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
      { input: [{ filename: `b7-${nyckel}-${marke}.png`, mimeType: 'image/png', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(buf.length) }] }, 'stagedUploadsCreate');
    const put = await fetch(st.stagedTargets[0].url, { method: 'PUT', headers: { 'content-type': 'image/png' }, body: buf });
    if (!put.ok) throw new Error(`PUT ${put.status}`);
    const cm = await b.mutera(
      `mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
      { productId: p.id, media: [{ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[0].resourceUrl, alt }] }, 'productCreateMedia');
    for (let i = 0; ; i++) {
      const q = await b.fraga(`query($id:ID!){product(id:$id){media(first:20){nodes{id status ... on MediaImage{image{url}}}}}}`, { id: p.id });
      const m = q.product.media.nodes.find((n) => n.id === cm.media[0].id);
      if (m?.status === 'READY') return m.image.url;
      if (m?.status === 'FAILED' || i > 40) throw new Error(`media ${m?.status}`);
      await sov(3000);
    }
  };
  const aiUrl = await laddaUpp(aiFil, 'miljo', AI_ALT[SPRÅK[land]] + altMain0);
  const ai2Url = await laddaUpp(`/tmp/fix/b7/ai2/${nyckel}.png`, 'detalj', AI_ALT[SPRÅK[land]] + altMain0);

  const huvud = p.media.nodes[0].image.url;
  const bild = (u, a) => `<p><img src="${u}" alt="${a}" loading="lazy" style="max-width:100%;height:auto"></p>`;
  const altMain = t.altMain || t.alt?.main || t.titel;
  const html =
    `<h3>${t.problemH}</h3><p>${t.problemP}</p>` +
    (aiUrl ? bild(aiUrl, AI_ALT[SPRÅK[land]] + altMain) : '') +
    `<h3>${t.losningH}</h3><p>${t.losningP}</p>` +
    bild(huvud, altMain) +
    `<h3>${r.funktioner}</h3><ul>\n` + t.bullets.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` +
    (ai2Url ? bild(ai2Url, AI_ALT[SPRÅK[land]] + altMain) : '') +
    `<h3>${r.garanti}</h3><p>${GARANTI4[SPRÅK[land]]}</p>` +
    (aiUrl ? `<p><small>${SPRÅK[land] === 'sv' ? 'Miljöbilderna är AI-genererade illustrationer. Produktfotot visar varan som den är.' : 'Miljøbildene er AI-genererte illustrasjoner. Produktbildet viser varen som den er.'}</small></p>` : '');

  await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
    { input: { id: p.id, descriptionHtml: html } }, 'productUpdate');
  console.log(`✔ ${nyckel.padEnd(14)} ${[aiUrl && 'miljöbild', ai2Url && 'detaljbild'].filter(Boolean).join(' + ')} + beskrivning  (${p.handle})`);
}
