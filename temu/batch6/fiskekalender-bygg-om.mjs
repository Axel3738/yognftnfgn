// Fiskekalendern SE + NO: byter hela galleriet och beskrivningen.
//
// Bakgrund (2026-09-10): sidan hade tre bilder, varav en var en utsträckt
// remsa med kvarsittande vattenstämpel, och "GIF:en" var en övertoning mellan
// samma tre stillbilder — ingen rörelse alls. Axel: "denna kan vi göra sjukt
// mycket bättre, kanske någon bild eller gif på när någon tar emot den också".
//
// Kör:  node temu/batch6/fiskekalender-bygg-om.mjs <bildmapp>
// Bildmappen ska innehålla:
//   fiskekalender-hero.jpg  fiskekalender-alla.jpg  fiskekalender-sorter.jpg
//   fiskekalender-present.jpg  fiskekalender-present.gif  fiskekalender-present.mp4
import { Butik } from '../api.mjs';
import { FISK, RUBRIK } from './fiskekalender-copy.mjs';
import { GARANTI4 } from '../utrullning/texter4.mjs';
import { readFileSync } from 'node:fs';

const MAPP = process.argv[2] || '/tmp/fisk/ut';
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const SKU = 'TEMU-B6-FISKEKALENDER';

const mime = (f) => f.endsWith('.gif') ? 'image/gif' : f.endsWith('.png') ? 'image/png' : f.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';

async function staged(b, filer) {
  const st = await b.mutera(
    `mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl parameters{name value}} userErrors{field message}}}`,
    { input: filer.map((f) => ({
        filename: f.fil, mimeType: mime(f.fil), httpMethod: f.video ? 'POST' : 'PUT',
        resource: f.video ? 'VIDEO' : 'IMAGE', fileSize: String(readFileSync(`${MAPP}/${f.fil}`).length) })) },
    'stagedUploadsCreate');
  for (let i = 0; i < filer.length; i++) {
    const mål = st.stagedTargets[i], buf = readFileSync(`${MAPP}/${filer[i].fil}`);
    if (filer[i].video) {
      const fd = new FormData();
      for (const p of mål.parameters) fd.append(p.name, p.value);
      fd.append('file', new Blob([buf], { type: 'video/mp4' }), filer[i].fil);
      const r = await fetch(mål.url, { method: 'POST', body: fd });
      if (!r.ok) throw new Error(`POST ${filer[i].fil}: ${r.status} ${await r.text()}`);
    } else {
      const r = await fetch(mål.url, { method: 'PUT', headers: { 'content-type': mime(filer[i].fil) }, body: buf });
      if (!r.ok) throw new Error(`PUT ${filer[i].fil}: ${r.status}`);
    }
  }
  return st.stagedTargets.map((t) => t.resourceUrl);
}

// Appen saknar write_files-scope, så fileCreate går inte att använda.
// GIF:en laddas därför upp som vanlig produktbild och får ligga sist i
// galleriet — den fyller dubbel funktion: rörelse i galleriet och i texten.

async function kör(land) {
  const b = new Butik(land === 'sv' ? 'se' : 'no');
  await b.verifiera();
  const t = FISK[land], r = RUBRIK[land];
  const q = await b.fraga(`{ products(first:3, query:"sku:${SKU}") { nodes { id title
      media(first:20){nodes{id mediaContentType ... on MediaImage{ image{url altText} }}} } } }`);
  const p = q.products.nodes[0];
  if (!p) throw new Error(`hittar inte ${SKU} i ${land}`);
  const gamla = p.media.nodes.map((n) => n.id);
  console.log(`${land}: ${p.title} — ${gamla.length} gamla mediaobjekt`);

  // 1. Ladda upp det nya galleriet (bryggbilden behålls inte — den ersätts av presentbilden)
  const filer = [
    { fil: 'fiskekalender-hero.jpg', alt: t.alt.hero },
    { fil: 'fiskekalender-present.jpg', alt: t.alt.present },
    { fil: 'fiskekalender-alla.jpg', alt: t.alt.alla },
    { fil: 'fiskekalender-sorter.jpg', alt: t.alt.sorter },
    { fil: 'fiskekalender-brygga.jpg', alt: t.alt.brygga },
  ];
  filer.push({ fil: 'fiskekalender-present.gif', alt: t.alt.present });
  const källor = await staged(b, filer);
  const cm = await b.mutera(
    `mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
    { productId: p.id, media: filer.map((f, i) => ({ mediaContentType: 'IMAGE', originalSource: källor[i], alt: f.alt })) },
    'productCreateMedia');
  const nya = cm.media.map((m) => m.id);

  // 2. Vänta ut READY och läs ut de skarpa URL:erna
  let url = {};
  for (let i = 0; ; i++) {
    await sov(3000);
    const s = await b.fraga(`query($id:ID!){product(id:$id){media(first:40){nodes{id status ... on MediaImage{image{url altText}}}}}}`, { id: p.id });
    const rel = s.product.media.nodes.filter((n) => nya.includes(n.id));
    if (rel.length === nya.length && rel.every((n) => n.status === 'READY')) {
      for (let j = 0; j < nya.length; j++) url[filer[j].fil] = rel.find((n) => n.id === nya[j]).image.url;
      break;
    }
    if (rel.some((n) => n.status === 'FAILED')) throw new Error('media FAILED');
    if (i > 40) throw new Error('media tog för lång tid');
  }

  // 3. Beskrivning: problem → GIF → lösning → alla dragen → funktioner → sorterna → garanti
  const bild = (u, alt, extra = '') => `<p><img src="${u}" alt="${alt}" loading="lazy" style="max-width:100%;height:auto${extra}"></p>`;
  const html =
    `<h3>${t.problemH}</h3><p>${t.problemP}</p>` +
    bild(url['fiskekalender-present.gif'], t.alt.present, ';border-radius:8px') +
    `<h3>${t.losningH}</h3><p>${t.losningP}</p>` +
    bild(url['fiskekalender-alla.jpg'], t.alt.alla) +
    `<h3>${r.funktioner}</h3><ul>\n` + t.bullets.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` +
    bild(url['fiskekalender-sorter.jpg'], t.alt.sorter) +
    `<p><em>${t.aiRad}</em></p>` +
    `<h3>${r.garanti}</h3><p>${GARANTI4[land]}</p>`;
  await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
    { input: { id: p.id, title: t.titel, descriptionHtml: html,
      seo: { title: t.seoTitel, description: t.seoText } } }, 'productUpdate');

  // 4. Galleriordning: hero, present, alla, sorter, brygga (GIF:en ligger bara i texten)
  const galleri = nya;
  await b.mutera(`mutation o($id:ID!,$moves:[MoveInput!]!){productReorderMedia(id:$id,moves:$moves){mediaUserErrors{field message}}}`,
    { id: p.id, moves: galleri.map((id, i) => ({ id, newPosition: String(i) })) }, 'productReorderMedia');

  // 5. Radera de gamla bilderna och GIF:en (utsträckt remsa med vattenstämpel + övertoning)
  await b.mutera(`mutation($productId:ID!,$mediaIds:[ID!]!){productDeleteMedia(productId:$productId,mediaIds:$mediaIds){userErrors{field message}}}`,
    { productId: p.id, mediaIds: gamla }, 'productDeleteMedia');

  console.log(`✔ ${land}: galleri ${galleri.length} bilder, ny beskrivning, SEO satt`);
  return { land, id: p.id, url };
}

for (const land of (process.env.BARA ? [process.env.BARA] : ['sv', 'no'])) await kör(land);
