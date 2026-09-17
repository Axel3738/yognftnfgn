// Skriver om taköverdragets produktsida i bäverbutiken.se.
//   node temu/takoverdrag/sida.mjs            # torrkörning, läget i dag (en storlek)
//   node temu/takoverdrag/sida.mjs --skarp    # skarpt
//   node temu/takoverdrag/sida.mjs --nio --skarp   # efter att varianter.mjs skapat de nio
//
// ⚠️ --nio får köras FÖRST när de nio varianterna finns. Skriptet kontrollerar det och
//    vägrar annars: en sida som lovar nio längder men bara säljer en är ett löfte
//    butiken inte kan hålla. Storlekstabellen läggs in i samma körning.
//
// Bildordningen i beskrivningen behålls från batch 6: GIF efter problemet, takbilden
// efter lösningen, den hopvikta efter funktionerna. Storlekstabellen läggs sist av
// bilderna, precis före garantin.
import { Butik } from '../api.mjs';
import { PRODUKT_ID, STORLEKAR } from './fakta.mjs';
import { GARANTI4, RUBRIKER4 } from '../utrullning/texter4.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const TAB = process.env.TAK_UT || '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/tak';
const skarp = process.argv.includes('--skarp');
const nio = process.argv.includes('--nio');
const COPY = JSON.parse(readFileSync(path.join(HÄR, 'copy.json'), 'utf8'));
const t = nio ? COPY.nioStorlekar : COPY.enStorlek;
const r = RUBRIKER4.sv;
const esc = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sov = (ms) => new Promise((x) => setTimeout(x, ms));

const b = new Butik('se');
console.log(`${(await b.verifiera()).name} — ${nio ? 'NIO STORLEKAR' : 'en storlek'}, ${skarp ? 'SKARP' : 'torrkörning'}\n`);
const q = await b.fraga(`query($id:ID!){product(id:$id){title handle status descriptionHtml
  variants(first:30){nodes{id title selectedOptions{name value}}}
  media(first:20){nodes{id status ... on MediaImage{image{url altText}}}}}}`, { id: PRODUKT_ID });
const p = q.product;
const antalVarianter = p.variants.nodes.length;
console.log(`nuvarande: "${p.title}" · ${antalVarianter} variant${antalVarianter === 1 ? '' : 'er'} · ${p.media.nodes.length} media`);

if (nio && antalVarianter < STORLEKAR.length) {
  console.error(`\nAvbryter: --nio kräver ${STORLEKAR.length} varianter, produkten har ${antalVarianter}.`);
  console.error('Kör temu/takoverdrag/varianter.mjs --skarp först (den behöver CWD:s inköpspriser).');
  process.exit(1);
}

// Bilderna hittas på filnamn — FÖRST i produktens media, sedan i den nuvarande
// beskrivningen. GIF:en ligger bara i beskrivningen (den är aldrig kopplad som
// produktmedia), så utan det andra steget tappas den vid varje omskrivning.
const iTexten = [...p.descriptionHtml.matchAll(/<img[^>]+src="([^"]+)"[^>]*?(?:alt="([^"]*)")?/g)]
  .map((m) => ({ image: { url: m[1], altText: m[2] || null } }));
const bild = (frag) => p.media.nodes.find((m) => (m.image?.url || '').includes(frag))
  || iTexten.find((m) => m.image.url.includes(frag));
const gif = bild('b6-takoverdrag-4.gif'), van = bild('tak-van'), hopvikt = bild('tak-hopvikt');
let tabell = bild('tak-storlekar');

// storlekstabellen laddas upp vid --nio om den inte redan finns
if (nio && !tabell && skarp) {
  const fil = `${TAB}/tak-storlekar.jpg`;
  if (!existsSync(fil)) { console.error(`Avbryter: ${fil} saknas — kör bilder-storlekstabell.mjs`); process.exit(1); }
  const st = await b.mutera(
    `mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
    { input: [{ filename: 'tak-storlekar.jpg', mimeType: 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE',
        fileSize: String(readFileSync(fil).length) }] }, 'stagedUploadsCreate');
  const put = await fetch(st.stagedTargets[0].url, { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: readFileSync(fil) });
  if (!put.ok) throw new Error('PUT storlekstabell: ' + put.status);
  const cm = await b.mutera(
    `mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
    { productId: PRODUKT_ID, media: [{ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[0].resourceUrl,
        alt: t.alt?.storlekstabell || 'Storlekstabell' }] }, 'productCreateMedia');
  for (let i = 0; i < 40; i++) { await sov(3000);
    const s = await b.fraga(`query($id:ID!){node(id:$id){... on MediaImage{status image{url}}}}`, { id: cm.media[0].id });
    if (s.node.status === 'READY') { tabell = { image: { url: s.node.image.url } }; break; }
    if (s.node.status === 'FAILED') throw new Error('storlekstabell: media FAILED'); }
  console.log('+ storlekstabellen uppladdad');
}

const img = (m, alt, extra = '') => m?.image?.url
  ? `<p><img src="${m.image.url}" alt="${esc(alt || m.image.altText || t.titel)}" loading="lazy" style="max-width:100%;height:auto${extra}"></p>` : '';
const html =
  `<h3>${esc(t.problemH)}</h3><p>${esc(t.problemP)}</p>` +
  img(gif, 'Taköverdraget på husbilen, hopvikt och med spännen', ';border-radius:8px') +
  `<h3>${esc(t.losningH)}</h3><p>${esc(t.losningP)}</p>` +
  img(van, 'Taköverdraget spänt över husbilens tak, framifrån') +
  `<h3>${r.funktioner}</h3><ul>\n` + t.bullets.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` +
  img(hopvikt, 'Överdraget hopvikt, med spännen och tygdetalj') +
  (nio && t.storleksrad ? `<p>${esc(t.storleksrad)}</p>` + img(tabell, t.alt?.storlekstabell) : '') +
  `<h3>${r.garanti}</h3><p>${GARANTI4.sv}</p>`;

if (!skarp) {
  console.log(`\ntitel:  ${t.titel}`);
  console.log(`seo:    ${t.seoTitel}  |  ${t.seoText}`);
  console.log(`bullets (${t.bullets.length}):`);
  for (const x of t.bullets) console.log('   ', x.replace(/<[^>]+>/g, ''));
  console.log(`bilder i texten: ${[gif && 'gif', van && 'tak-van', hopvikt && 'tak-hopvikt', nio && tabell && 'tak-storlekar'].filter(Boolean).join(', ')}`);
  console.log('\n(torrkörning — lägg till --skarp)');
  process.exit(0);
}

await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){userErrors{field message}}}`,
  { input: { id: PRODUKT_ID, title: t.titel, descriptionHtml: html, tags: t.taggar,
      seo: { title: t.seoTitel, description: t.seoText } } }, 'productUpdate');
await sov(2000);
const s = await b.fraga(`query($id:ID!){product(id:$id){title handle status seo{title description} tags
  variants(first:30){nodes{title price}} media(first:20){nodes{status}}}}`, { id: PRODUKT_ID });
console.log(`\n✔ ${s.product.title}`);
console.log(`   seo: ${s.product.seo.title || '(ärver titeln)'} | ${s.product.seo.description?.length} tecken`);
console.log(`   ${s.product.variants.nodes.length} variant(er), ${s.product.media.nodes.length} media`);
console.log(`   https://baverbutiken.se/products/${s.product.handle}`);
