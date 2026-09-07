// Bygger om batch 6:s produktsidor till referensstandard (övervakningskameran):
//   galleri 3–4 bilder · beskrivning problem → GIF → lösning → bild → funktioner → bild → garanti.
//
// Kör: node temu/batch6/bygg-om.mjs <se|no> <mediamapp> [--skarp] [nyckel]
//   <mediamapp> är mappen med gif/ och galleri/ (skördad av sessionen, gitignorerad).
//   Utan --skarp skrivs bara planen. Befintlig huvudbild behålls som första bild.
//
// GIF:arna ligger i temu/batch6/gif-urler.json. Butikstokenen saknar write_files, så
// GIF:en laddas upp EN gång i SE via Shopify-connectorn (stagedUploadsCreate FILE →
// POST → fileCreate) och Norge hotlänkar samma cdn.shopify.com-URL — exakt som
// referenssidan (övervakningskameran) gör.
import { Butik } from '../api.mjs';
import { GARANTI4, RUBRIKER4 } from '../utrullning/texter4.mjs';
import { T6_SV } from '../utrullning/texter6.mjs';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const REPO_BILDER = path.join(HÄR, 'bilder');
const SPRÅK = { se: 'sv', no: 'no' };
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

const land = process.argv[2], mapp = process.argv[3], skarp = process.argv.includes('--skarp');
const bara = process.argv.slice(4).find((a) => !a.startsWith('--')) || null;
if (!['se', 'no'].includes(land) || !mapp) { console.error('Användning: node bygg-om.mjs <se|no> <mediamapp> [--skarp] [nyckel]'); process.exit(1); }
const sp = SPRÅK[land];
const G = (f) => path.join(mapp, 'galleri', f);
const GIF = (k) => path.join(mapp, 'gif', `${k}.gif`);
const GIF_URL = JSON.parse(readFileSync(path.join(HÄR, 'gif-urler.json'), 'utf8'));
const X = (n) => path.join(mapp, 'xlsx', 'xl', 'media', n);

const AI_RAD = { sv: 'Livsstilsbilden är en AI-genererad illustration.', no: 'Livsstilsbildet er en AI-generert illustrasjon.' };

// Per produkt: nya galleribilder (i ordning, efter befintlig huvudbild), GIF-alt,
// och vilka bilder som går in i beskrivningen (bild1 efter lösningen, bild2 efter funktionerna).
// Bilder anges med nyckel; `sv`/`no` är alt-texter.
const PLAN = {
  kattkoja: {
    gif: { sv: 'Katten går in och ut ur kojan', no: 'Katten går inn og ut av huset' },
    bilder: {
      katt: { fil: G('kattkoja-katt.jpg'), sv: 'Katt på väg in i kojan genom öppningen', no: 'Katt på vei inn i huset gjennom åpningen' },
      isolering: { fil: G('kattkoja-isolering.jpg'), sv: 'Isolerande folie på insidan av kojans tak', no: 'Isolerende folie på innsiden av taket' },
    },
    galleri: ['katt', 'isolering'], bild1: 'katt', bild2: 'BEFINTLIG',
  },
  staketbygel: {
    gif: { sv: 'Bygeln slås ner i marken bredvid staketet', no: 'Bøylen slås ned i bakken ved siden av gjerdet' },
    bilder: {
      monterad: { fil: G('staketbygel-monterad.jpg'), sv: 'Två byglar monterade mot staketstolpar', no: 'To bøyler montert mot gjerdestolper' },
      info: { fil: G(`staketbygel-info-${sp}.jpg`), sv: 'Måtten: 80 cm per bygel, 40 cm spett och 40 cm bygel, skruvar och nycklar ingår', no: 'Målene: 80 cm per bøyle, 40 cm spyd og 40 cm bøyle, skruer og nøkler følger med' },
      hand: { fil: G('staketbygel-hand.jpg'), sv: 'Spettet drivs ner i marken intill stolpen', no: 'Spydet drives ned i bakken inntil stolpen' },
    },
    galleri: ['monterad', 'info', 'hand'], bild1: 'monterad', bild2: 'info',
  },
  vedklyv: {
    gif: { sv: 'Tändvedsklyven i gjutjärn', no: 'Tennvedkløyveren i støpejern' },
    bilder: {
      ai: { fil: G('vedklyv-ai.jpg'), ai: true, sv: 'AI-illustration: tändvedsklyven på en stubbe med vedträ i ringen', no: 'AI-illustrasjon: tennvedkløyveren på en stubbe med vedkubbe i ringen' },
      info: { fil: G(`vedklyv-info-${sp}.jpg`), sv: 'Måtten: 27 cm hög, 12,5 cm innerdiameter, 14,5 cm fot, 0,72 kg', no: 'Målene: 27 cm høy, 12,5 cm innvendig diameter, 14,5 cm fot, 0,72 kg' },
    },
    galleri: ['ai', 'info'], bild1: 'ai', bild2: 'info',
  },
  takoverdrag: {
    gif: { sv: 'Överdraget dras över husbilens tak', no: 'Overtrekket trekkes over bobilens tak' },
    bilder: {
      hero: { fil: G('takoverdrag-hero.jpg'), sv: 'Taköverdraget spänt över husbilens tak', no: 'Takovertrekket strammet over bobilens tak' },
      rv: { fil: X('image4.png'), sv: 'Svart taköverdrag på husbil, fäst med remmar runt karossen', no: 'Sort takovertrekk på bobil, festet med stropper rundt karosseriet' },
      garage: { fil: G('takoverdrag-garage.jpg'), sv: 'Överdraget dras på plats över taket', no: 'Overtrekket trekkes på plass over taket' },
    },
    galleri: ['hero', 'rv', 'garage'], bild1: 'hero', bild2: 'rv',
  },
  solpanel: {
    gif: { sv: 'Solpanelen vrids på fästet', no: 'Solpanelet dreies på festet' },
    bilder: {
      faste: { fil: G('solpanel-faste.jpg'), sv: 'Baksidan med ledat fäste och kabel', no: 'Baksiden med leddet feste og kabel' },
      fram: { fil: G('solpanel-fram.jpg'), sv: 'Solpanelen framifrån, vinklad mot ljuset', no: 'Solpanelet forfra, vinklet mot lyset' },
    },
    galleri: ['faste', 'fram'], bild1: 'faste', bild2: 'fram',
  },
  racingkalender: {
    gif: { sv: 'Adventskalendern och de 24 bilarna', no: 'Adventskalenderen og de 24 bilene' },
    bilder: {
      bilar: { fil: X('image10.png'), sv: 'Kartongen med de 24 racingbilarna uppradade framför', no: 'Esken med de 24 racerbilene på rekke foran' },
      ai: { fil: G('racingkalender-ai.jpg'), ai: true, sv: 'AI-illustration: kalendern på köksbordet med tre bilar framför', no: 'AI-illustrasjon: kalenderen på kjøkkenbordet med tre biler foran' },
    },
    galleri: ['bilar', 'ai'], bild1: 'bilar', bild2: 'ai',
  },
  fiskekalender: {
    gif: { sv: 'Adventskalendern och dragen', no: 'Adventskalenderen og slukene' },
    bilder: {
      ai: { fil: G('fiskekalender-ai.jpg'), ai: true, sv: 'AI-illustration: kalendern på en brygga vid sjön med drag bredvid', no: 'AI-illustrasjon: kalenderen på en brygge ved vannet med sluk ved siden av' },
      drag: { fil: path.join(REPO_BILDER, 'fiskekalender-2.jpg'), sv: 'Skeddrag och jiggar ur kalendern', no: 'Skjeer og jigger fra kalenderen' },
    },
    // SE har redan skeddragsbilden i galleriet (läses av på plats), NO saknar den.
    galleri: ['ai', 'drag'], bild1: 'ai', bild2: 'drag',
  },
};

// Norsk copy
let T = T6_SV;
if (land === 'no') T = (await import(path.join(HÄR, '..', 'utrullning', 'texter6-no.mjs'))).T6_NO;

const img = (url, alt, gif = false) =>
  `<p><img src="${url}" alt="${alt.replace(/"/g, '&quot;')}" loading="lazy" style="max-width:100%;height:auto${gif ? ';border-radius:8px' : ''}"></p>`;

const b = new Butik(land);
const shop = await b.verifiera();
console.log(`${shop.name} (${shop.currencyCode}) — ${skarp ? 'SKARP KÖRNING' : 'torrkörning'}\n`);
const r = RUBRIKER4[sp];

async function laddaUppBild(fil, alt, pid) {
  const buf = readFileSync(fil);
  const mime = fil.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const st = await b.mutera(
    `mutation s($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl } userErrors { field message } } }`,
    { input: [{ filename: path.basename(fil), mimeType: mime, httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(buf.length) }] },
    'stagedUploadsCreate');
  const put = await fetch(st.stagedTargets[0].url, { method: 'PUT', headers: { 'content-type': mime }, body: buf });
  if (!put.ok) throw new Error(`PUT ${put.status}`);
  const m = await b.mutera(
    `mutation m($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id } mediaUserErrors { field message } } }`,
    { productId: pid, media: [{ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[0].resourceUrl, alt }] },
    'productCreateMedia');
  return m.media[0].id;
}

/** Väntar tills alla media-id:n är READY och returnerar id → bild-URL. */
async function vantaKlar(ids) {
  for (let i = 0; i < 40; i++) {
    const d = await b.fraga(
      `query($ids:[ID!]!){ nodes(ids:$ids){ ... on MediaImage { id fileStatus image { url } } } }`, { ids });
    const kvar = d.nodes.filter((n) => !n || n.fileStatus !== 'READY');
    if (!kvar.length) return Object.fromEntries(d.nodes.map((n) => [n.id, n.image.url]));
    if (d.nodes.some((n) => n?.fileStatus === 'FAILED')) throw new Error('media FAILED: ' + JSON.stringify(d.nodes));
    await sov(4000);
  }
  throw new Error('media blev aldrig READY: ' + ids.join(','));
}

for (const [nyckel, plan] of Object.entries(PLAN)) {
  if (bara && nyckel !== bara) continue;
  const t = T[nyckel];
  const sku = T6_SV[nyckel].sku;
  const q = await b.fraga(
    `query($q:String!){products(first:2,query:$q){nodes{id title handle onlineStoreUrl descriptionHtml
      media(first:10){nodes{id alt mediaContentType status ... on MediaImage{image{url}}}}}}}`, { q: `sku:${sku}*` });
  const p = q.products.nodes[0];
  if (!p) { console.log(`✗ ${nyckel}: finns inte i ${land}`); continue; }
  const befintliga = p.media.nodes;
  const gifFil = GIF(nyckel), gifUrl = GIF_URL[nyckel];
  const saknas = plan.galleri.map((k) => plan.bilder[k].fil).filter((f) => !existsSync(f));
  if (saknas.length) { console.log(`✗ ${nyckel}: saknar filer ${saknas.join(', ')}`); continue; }
  if (!gifUrl) { console.log(`✗ ${nyckel}: ingen GIF-URL i gif-urler.json`); continue; }

  // Bilder som redan ligger uppe (samma alt) laddas inte upp igen.
  const attLaddaUpp = plan.galleri.filter((k) => !befintliga.some((m) => m.alt === plan.bilder[k][sp]));
  console.log(`${skarp ? '+' : '·'} ${nyckel}: ${p.handle}`);
  console.log(`    befintligt galleri ${befintliga.length} · nya ${attLaddaUpp.length} (${attLaddaUpp.join(', ')}) · GIF ${existsSync(gifFil) ? (readFileSync(gifFil).length / 1e6).toFixed(2) + ' MB' : gifUrl.split('/').pop()}`);
  if (!skarp) continue;

  // 1. Ladda upp
  const nyaId = {};
  for (const k of attLaddaUpp) nyaId[k] = await laddaUppBild(plan.bilder[k].fil, plan.bilder[k][sp], p.id);
  const urler = Object.keys(nyaId).length ? await vantaKlar(Object.values(nyaId)) : {};
  const urlAv = (k) => {
    if (k === 'BEFINTLIG') return befintliga[0].image.url;
    if (nyaId[k]) return urler[nyaId[k]];
    return befintliga.find((m) => m.alt === plan.bilder[k][sp]).image.url;
  };
  const altAv = (k) => (k === 'BEFINTLIG' ? befintliga[0].alt : plan.bilder[k][sp]);
  const aiRad = (k) => (k !== 'BEFINTLIG' && plan.bilder[k].ai ? `<p><em>${AI_RAD[sp]}</em></p>` : '');

  // 2. Beskrivning i referensens ordning
  const html =
    `<h3>${t.problemH}</h3><p>${t.problemP}</p>` +
    img(gifUrl, plan.gif[sp], true) +
    `<h3>${t.losningH}</h3><p>${t.losningP}</p>` +
    img(urlAv(plan.bild1), altAv(plan.bild1)) + aiRad(plan.bild1) +
    `<h3>${r.funktioner}</h3><ul>\n` + t.bullets.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` +
    (t.varning ? `<p><em>${t.varning}</em></p>` : '') +
    img(urlAv(plan.bild2), altAv(plan.bild2)) + aiRad(plan.bild2) +
    `<h3>${r.garanti}</h3><p>${GARANTI4[sp]}</p>`;
  await b.mutera(
    `mutation($product: ProductUpdateInput!) { productUpdate(product: $product) { product { id } userErrors { field message } } }`,
    { product: { id: p.id, descriptionHtml: html } }, 'productUpdate');

  // 3. Läs tillbaka
  const slut = await b.fraga(`query($id:ID!){product(id:$id){handle onlineStoreUrl descriptionHtml media(first:10){nodes{status alt}}}}`, { id: p.id });
  const m = slut.product.media.nodes;
  const antalImg = (slut.product.descriptionHtml.match(/<img /g) || []).length;
  console.log(`    ✓ galleri ${m.length} (${m.map((x) => x.status).join(',')}) · beskrivning ${antalImg} bilder (1 GIF) · ${slut.product.onlineStoreUrl}`);
}
