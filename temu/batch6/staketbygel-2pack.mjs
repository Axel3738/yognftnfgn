// Gör 2-packet omöjligt att missa på staketbygeln: titel, en fetstilsrad överst,
// första bulleten, och en "2 ST INGÅR"-etikett på huvudbilden.
import { Butik } from '/home/user/yognftnfgn/temu/api.mjs';
import { readFileSync } from 'node:fs';

const SKU = 'TEMU-5040027499285';
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const S = {
  se: {
    titel: 'Staketstolpsbygel 2-pack – Räddar Två Stolpar Utan Att Gräva',
    rad: '<p><strong>2 byglar i förpackningen.</strong> Ett köp räcker till två stolpar – du behöver inte lägga en till i varukorgen.</p>',
    gammalBullet: '<strong>Räcker till två stolpar</strong> – 2-pack, 80 cm per bygel: 40 cm ner i marken och 40 cm upp längs stolpen',
    nyBullet: '<strong>Två byglar för ett pris</strong> – 2-pack, 80 cm per bygel: 40 cm ner i marken och 40 cm upp längs stolpen',
    alt: 'Staketstolpsbygel i svart stål med markspett – 2 st ingår',
  },
  no: {
    titel: 'Gjerdestolpebøyle 2-pk – Redder To Stolper uten å Grave',
    rad: '<p><strong>2 bøyler i pakken.</strong> Ett kjøp rekker til to stolper – du trenger ikke legge en til i handlekurven.</p>',
    gammalBullet: '<strong>Rekker til to stolper</strong> – 2-pk, 80 cm per bøyle: 40 cm ned i bakken og 40 cm opp langs stolpen',
    nyBullet: '<strong>To bøyler for én pris</strong> – 2-pk, 80 cm per bøyle: 40 cm ned i bakken og 40 cm opp langs stolpen',
    alt: 'Gjerdestolpebøyle i svart stål med spett til bakken – 2 stk følger med',
  },
};

for (const [land, t] of Object.entries(S)) {
  const b = new Butik(land);
  const shop = await b.verifiera();
  const d = await b.fraga(`query($q:String!){products(first:1,query:$q){nodes{id handle title descriptionHtml
    media(first:10){nodes{id alt ... on MediaImage{image{url}}}}}}}`, { q: `sku:${SKU}*` });
  const p = d.products.nodes[0];

  // 1. Ny huvudbild med etikett (om den inte redan ligger där)
  let nyId = p.media.nodes.find((m) => /-2st\./.test(m.image?.url || ''))?.id;
  if (!nyId) {
    const buf = readFileSync(`/tmp/fix/b6fix/hero-${land}.jpg`);
    const st = await b.mutera(
      `mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
      { input: [{ filename: `staketbygel-${land}-2st.jpg`, mimeType: 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(buf.length) }] }, 'stagedUploadsCreate');
    const put = await fetch(st.stagedTargets[0].url, { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: buf });
    if (!put.ok) throw new Error(`PUT ${put.status}`);
    const cm = await b.mutera(
      `mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
      { productId: p.id, media: [{ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[0].resourceUrl, alt: t.alt }] }, 'productCreateMedia');
    nyId = cm.media[0].id;
    for (let i = 0; ; i++) {
      const q = await b.fraga(`query($id:ID!){product(id:$id){media(first:10){nodes{id status}}}}`, { id: p.id });
      const m = q.product.media.nodes.find((n) => n.id === nyId);
      if (m?.status === 'READY') break;
      if (m?.status === 'FAILED' || i > 40) throw new Error(`media ${m?.status}`);
      await sov(3000);
    }
    // Lägg den först, radera den gamla omärkta
    const q2 = await b.fraga(`query($id:ID!){product(id:$id){media(first:10){nodes{id}}}}`, { id: p.id });
    const alla = q2.product.media.nodes.map((n) => n.id);
    await b.mutera(`mutation o($id:ID!,$moves:[MoveInput!]!){productReorderMedia(id:$id,moves:$moves){mediaUserErrors{field message}}}`,
      { id: p.id, moves: [nyId, ...alla.filter((x) => x !== nyId)].map((id, i) => ({ id, newPosition: String(i) })) }, 'productReorderMedia');
    await b.mutera(`mutation($productId:ID!,$mediaIds:[ID!]!){productDeleteMedia(productId:$productId,mediaIds:$mediaIds){userErrors{field message}}}`,
      { productId: p.id, mediaIds: [p.media.nodes[0].id] }, 'productDeleteMedia');
  }

  // 2. Titel + beskrivning
  let html = p.descriptionHtml;
  if (!html.includes('<strong>2 byglar') && !html.includes('<strong>2 bøyler')) {
    html = html.replace(/(<h3>)/, t.rad + '$1');
  }
  html = html.replace(t.gammalBullet, t.nyBullet);
  // Flytta antalsbulleten först
  const li = `<li>${t.nyBullet}</li>`;
  if (html.includes(li)) html = html.replace(li + '\n', '').replace('<ul>\n', `<ul>\n${li}\n`);
  await b.mutera(`mutation u($input:ProductUpdateInput!){productUpdate(product:$input){product{title} userErrors{field message}}}`,
    { input: { id: p.id, title: t.titel, descriptionHtml: html } }, 'productUpdate');

  const slut = await b.fraga(`query($id:ID!){product(id:$id){title handle descriptionHtml media(first:10){nodes{alt}}}}`, { id: p.id });
  console.log(`✔ ${shop.name}\n   ${slut.product.title}\n   ${slut.product.media.nodes.length} media, första alt: "${slut.product.media.nodes[0].alt}"\n   antalsrad överst: ${/<strong>2 (byglar|bøyler)/.test(slut.product.descriptionHtml) ? 'ja' : 'NEJ ⚠️'}`);
}
