// Utekattkojan SE + NO: byter galleri och beskrivning till det riktiga huset.
//
// Bakgrund (2026-09-10): galleriet bestod av tre AI-hus utan ben och en
// infografik — inte en enda riktig produktbild — och copyn nämnde inte
// stativet. Temu-listningens huvudbild (den CWD offererade) visar kojan på
// ett svart metallstativ med fyra ben och en lös liggmatta. Axel: "original-
// produkten har sånna stödben, det har inte den andra. Det är enda skillnaden."
//
// Kör:  node temu/batch6/kattkoja-bygg-om.mjs <bildmapp-sv> <bildmapp-no>
// Bildmapparna ska innehålla: kattkoja-hero.jpg kattkoja-regn.jpg
//   kattkoja-sover.jpg kattkoja-sno.jpg kattkoja-fakta.jpg kattkoja-farger.jpg
//   kattkoja-regn.gif
import { Butik } from '../api.mjs';
import { KATT, RUBRIK } from './kattkoja-copy.mjs';
import { GARANTI4 } from '../utrullning/texter4.mjs';
import { readFileSync } from 'node:fs';

const MAPP = { sv: process.argv[2] || '/tmp/katt/ut', no: process.argv[3] || '/tmp/katt/ut-no' };
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const SKU = 'TEMU-5030003647894';
const mime = (f) => f.endsWith('.gif') ? 'image/gif' : f.endsWith('.png') ? 'image/png' : 'image/jpeg';

async function staged(b, mapp, filer) {
  const st = await b.mutera(
    `mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
    { input: filer.map((f) => ({ filename: f.fil, mimeType: mime(f.fil), httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(readFileSync(`${mapp}/${f.fil}`).length) })) },
    'stagedUploadsCreate');
  for (let i = 0; i < filer.length; i++) {
    const r = await fetch(st.stagedTargets[i].url, { method: 'PUT', headers: { 'content-type': mime(filer[i].fil) }, body: readFileSync(`${mapp}/${filer[i].fil}`) });
    if (!r.ok) throw new Error(`PUT ${filer[i].fil}: ${r.status}`);
  }
  return st.stagedTargets.map((t) => t.resourceUrl);
}

async function kör(land) {
  const b = new Butik(land === 'sv' ? 'se' : 'no');
  await b.verifiera();
  const t = KATT[land], r = RUBRIK[land], mapp = MAPP[land];
  const q = await b.fraga(`{ products(first:3, query:"sku:${SKU}*") { nodes { id title
      media(first:20){nodes{id}} } } }`);
  const p = q.products.nodes[0];
  if (!p) throw new Error(`hittar inte ${SKU} i ${land}`);
  const gamla = p.media.nodes.map((n) => n.id);
  console.log(`${land}: ${p.title} — ${gamla.length} gamla mediaobjekt`);

  // 1. Nytt galleri (hero = riktig produktbild; GIF:en sist, den används i texten)
  const filer = [
    { fil: 'kattkoja-hero.jpg', alt: t.alt.hero },
    { fil: 'kattkoja-regn.jpg', alt: t.alt.regn },
    { fil: 'kattkoja-fakta.jpg', alt: t.alt.fakta },
    { fil: 'kattkoja-sover.jpg', alt: t.alt.sover },
    { fil: 'kattkoja-sno.jpg', alt: t.alt.sno },
    { fil: 'kattkoja-farger.jpg', alt: t.alt.farger },
    { fil: 'kattkoja-regn.gif', alt: t.alt.gif },
  ];
  const källor = await staged(b, mapp, filer);
  const cm = await b.mutera(
    `mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
    { productId: p.id, media: filer.map((f, i) => ({ mediaContentType: 'IMAGE', originalSource: källor[i], alt: f.alt })) }, 'productCreateMedia');
  const nya = cm.media.map((m) => m.id);

  // 2. Vänta ut READY, läs skarpa URL:er
  const url = {};
  for (let i = 0; ; i++) {
    await sov(3000);
    const s = await b.fraga(`query($id:ID!){product(id:$id){media(first:40){nodes{id status ... on MediaImage{image{url}}}}}}`, { id: p.id });
    const rel = s.product.media.nodes.filter((n) => nya.includes(n.id));
    if (rel.length === nya.length && rel.every((n) => n.status === 'READY')) {
      nya.forEach((id, j) => { url[filer[j].fil] = rel.find((n) => n.id === id).image.url; });
      break;
    }
    if (rel.some((n) => n.status === 'FAILED')) throw new Error('media FAILED');
    if (i > 40) throw new Error('media tog för lång tid');
  }

  // 3. Beskrivning: problem → GIF → lösning → riktig produktbild → funktioner → infografik → garanti
  const bild = (u, alt, extra = '') => `<p><img src="${u}" alt="${alt}" loading="lazy" style="max-width:100%;height:auto${extra}"></p>`;
  const html =
    `<h3>${t.problemH}</h3><p>${t.problemP}</p>` +
    bild(url['kattkoja-regn.gif'], t.alt.gif, ';border-radius:8px') +
    `<h3>${t.losningH}</h3><p>${t.losningP}</p>` +
    bild(url['kattkoja-hero.jpg'], t.alt.hero) +
    `<h3>${r.funktioner}</h3><ul>\n` + t.bullets.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` +
    bild(url['kattkoja-fakta.jpg'], t.alt.fakta) +
    `<p><em>${t.aiRad}</em></p>` +
    `<h3>${r.garanti}</h3><p>${GARANTI4[land]}</p>`;
  await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
    { input: { id: p.id, title: t.titel, descriptionHtml: html, seo: { title: t.seoTitel, description: t.seoText } } }, 'productUpdate');

  // 4. Ordning = uppladdningsordningen, sedan bort med de gamla
  await b.mutera(`mutation o($id:ID!,$moves:[MoveInput!]!){productReorderMedia(id:$id,moves:$moves){mediaUserErrors{field message}}}`,
    { id: p.id, moves: nya.map((id, i) => ({ id, newPosition: String(i) })) }, 'productReorderMedia');
  await b.mutera(`mutation($productId:ID!,$mediaIds:[ID!]!){productDeleteMedia(productId:$productId,mediaIds:$mediaIds){userErrors{field message}}}`,
    { productId: p.id, mediaIds: gamla }, 'productDeleteMedia');
  console.log(`✔ ${land}: galleri ${nya.length}, ny beskrivning, SEO satt`);
}

for (const land of (process.env.BARA ? [process.env.BARA] : ['sv', 'no'])) await kör(land);
