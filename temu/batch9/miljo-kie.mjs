// Batch 9/10 — AI-miljöbilder via KIE (nano-banana-edit), samma regler som temu/ai-bild.mjs:
// referensen är produktens EGEN livebild, produkten ska hållas identisk, inga ansikten,
// 1:1, och varje bild granskas mot räkneorden innan den läggs in. Higgsfield var slut
// (0,61 credits) — KIE hade 15 665 (2026-09-12).
//
//   node temu/batch9/miljo-kie.mjs [id …]        # skapar tasks, pollar, sparar /tmp/b9/ut/<id>/<id>-miljo.jpg (+ ut-no)
//
// Badge-heroer (snoflingor, blockljus, kajakhallare) får inte vara referens — badgen
// skulle "hållas identisk". Referensen laddas upp som TILLFÄLLIG media på SE-produkten
// (badgen bortmålad på vit yta) och raderas efter körningen.
import '../miljo.mjs';
import { Butik } from '../api.mjs';
import sharp from '../node_modules/sharp/dist/index.mjs';
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';

const K = process.env.KIE_API_KEY;
if (!K) { console.error('KIE_API_KEY saknas'); process.exit(1); }
const GUARD = ' Keep the product identical to the reference image: same colors, same shape, same details, same proportions. Photorealistic, natural light, no text, no logos, no watermarks, no people\'s faces.';
const SCEN = {
  spakapell:      'The black round cover from the reference fitted snugly over a wooden hot tub on a Scandinavian garden deck in autumn, a few fallen leaves lying on top of the cover, soft overcast light, no people.',
  vedstallskapell:'The black log-rack cover from the reference over a full firewood rack standing against the red wooden wall of a Swedish house, a light dusting of snow on top of the cover, no people.',
  solcellsladdare:'The solar panel from the reference stuck to the inside of a parked car\'s windshield with its suction cups, seen from inside the car with the cable running down to the dashboard, bright winter sunlight outside, no people.',
  snoblasarkapell:'The black snow-blower cover from the reference over a snow blower parked inside a tidy home garage next to a wall with hanging tools, no people.',
  honsgardsduk:   'The black tarp from the reference stretched over the top of a wire-mesh chicken run in a green garden, two brown hens inside on the grass, no people.',
  snoflingor:     'Close-up on one section of a white residential garage door with several of the snowflake decorations from the reference stuck on it, dusk with a warm porch light, only part of the door visible, no people.',
  vattenskal:     'The heated water bowl from the reference standing on the snowy wooden step of a porch outside a house, a golden retriever seen from behind drinking from it, faint steam rising from the water, no people.',
  atvkapell:      'The black ATV cover from the reference over an ATV parked on gravel beside a red wooden barn in the Swedish countryside, autumn birch trees, no people.',
  snoskyffel:     'The battery snow shovel from the reference, exactly as in the reference with no battery mounted, leaning against the wall of a snowy porch next to a freshly cleared path, morning light, no people.',
  kajakhallare:   'Exactly two of the wall hooks from the reference mounted on a garage wall, holding one green kayak horizontally, seen from the side, no people.',
  motorlas:       'The stainless-steel lock from the reference mounted over the clamp screws of an outboard motor on a small aluminium boat moored at a wooden jetty, calm lake in the evening, no people.',
  varmesits:      'The grey heated seat pad from the reference lying on a wooden bench seat at an outdoor ice rink, a thermos beside it, cold winter light, no people.',
  taljset:        'The whittling set from the reference lying open on a wooden workbench by a cabin window, seen at an angle from a distance, wood shavings and a half-carved wooden spoon in the foreground, warm light, no people.',
  varmeljus:      'A handful of the LED tealights from the reference glowing on a white windowsill in the evening, a snowy garden outside the window, warm cosy light, no remote control anywhere, no people.',
  blockljus:      'Exactly three grey glass LED pillar candles from the reference, lit, standing on a wooden coffee table in a dim cosy living room in the evening, the remote lying beside them, no people.',
};
const TEMP_REF = new Set(['snoflingor', 'blockljus', 'kajakhallare', 'varmeljus']);   // badge-heroer
// Omkörning med annan scen/referens: SCEN_JSON='{"id":"…"}' REF_JSON='{"id":"<url>"}' (referensen måste vara publik).
Object.assign(SCEN, process.env.SCEN_JSON ? JSON.parse(process.env.SCEN_JSON) : {});
const REF_OVR = process.env.REF_JSON ? JSON.parse(process.env.REF_JSON) : {};
const bara = process.argv.slice(2);
const ids = Object.keys(SCEN).filter((id) => !bara.length || bara.includes(id));
const live = JSON.parse(readFileSync('/tmp/b9/live-urls.json', 'utf8'));
const b = new Butik('se');
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const kie = (path, body) => fetch(`https://api.kie.ai/api/v1/${path}`, { method: body ? 'POST' : 'GET',
  headers: { Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }).then((r) => r.json());

// 1. referenser
const ref = {}, tmpMedia = [];
for (const id of ids) {
  if (REF_OVR[id]) { ref[id] = REF_OVR[id]; continue; }
  if (!TEMP_REF.has(id)) { ref[id] = live.find((x) => x.land === 'SE' && x.id === id).hero; continue; }
  const fil = `/tmp/b9/ut/${id}/${id}-ref.jpg`;
  const p = await b.fraga(`query($q:String!){products(first:1,query:$q){nodes{id}}}`, { q: `sku:TEMU-B10-${id.toUpperCase()}` });
  const pid = p.products.nodes[0].id;
  const st = await b.mutera(`mutation s($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl} userErrors{field message}}}`,
    { input: [{ filename: `tmp-ref-${id}.jpg`, mimeType: 'image/jpeg', httpMethod: 'PUT', resource: 'IMAGE', fileSize: String(readFileSync(fil).length) }] }, 'stagedUploadsCreate');
  const put = await fetch(st.stagedTargets[0].url, { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: readFileSync(fil) });
  if (!put.ok) throw new Error('PUT ref ' + id);
  const cm = await b.mutera(`mutation m($productId:ID!,$media:[CreateMediaInput!]!){productCreateMedia(productId:$productId,media:$media){media{id} mediaUserErrors{field message}}}`,
    { productId: pid, media: [{ mediaContentType: 'IMAGE', originalSource: st.stagedTargets[0].resourceUrl, alt: 'tillfällig AI-referens' }] }, 'productCreateMedia');
  const mid = cm.media[0].id; tmpMedia.push({ pid, mid });
  for (let i = 0; i < 30; i++) { await sov(3000);
    const s = await b.fraga(`query($id:ID!){node(id:$id){... on MediaImage{status image{url}}}}`, { id: mid });
    if (s.node.status === 'READY') { ref[id] = s.node.image.url; break; } }
  console.log(`ref ${id}: tillfällig media`);
}

// 2. tasks
const task = {};
for (const id of ids) {
  const r = await kie('jobs/createTask', { model: 'google/nano-banana-edit', input: { prompt: SCEN[id] + GUARD, image_urls: [ref[id]], image_size: '1:1' } });
  if (r.code !== 200) { console.error(`${id}: createTask ${JSON.stringify(r).slice(0, 200)}`); continue; }
  task[id] = r.data.taskId; console.log(`task ${id}: ${task[id]}`);
}

// 3. poll + spara
const kvar = new Set(Object.keys(task)), klart = {};
for (let i = 0; i < 60 && kvar.size; i++) {
  await sov(8000);
  for (const id of [...kvar]) {
    const d = await kie(`jobs/recordInfo?taskId=${task[id]}`);
    const st = d.data?.state;
    if (st === 'success') {
      const url = JSON.parse(d.data.resultJson).resultUrls[0];
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
      mkdirSync(`/tmp/b9/ut/${id}`, { recursive: true }); mkdirSync(`/tmp/b9/ut-no/${id}`, { recursive: true });
      writeFileSync(`/tmp/b9/ut/${id}/${id}-miljo-ra.png`, buf);
      await sharp(buf).resize(1600, 1600, { fit: 'cover', position: 'centre', kernel: 'lanczos3' }).jpeg({ quality: 92 }).toFile(`/tmp/b9/ut/${id}/${id}-miljo.jpg`);
      copyFileSync(`/tmp/b9/ut/${id}/${id}-miljo.jpg`, `/tmp/b9/ut-no/${id}/${id}-miljo.jpg`);
      klart[id] = url; kvar.delete(id); console.log(`✔ ${id}`);
    } else if (st === 'fail') { console.error(`✖ ${id}: ${JSON.stringify(d.data).slice(0, 300)}`); kvar.delete(id); }
  }
}
if (kvar.size) console.error('timeout:', [...kvar].join(', '));

// 4. städa tillfälliga referenser
for (const { pid, mid } of tmpMedia) {
  await b.mutera(`mutation d($productId:ID!,$mediaIds:[ID!]!){productDeleteMedia(productId:$productId,mediaIds:$mediaIds){deletedMediaIds mediaUserErrors{field message}}}`, { productId: pid, mediaIds: [mid] }, 'productDeleteMedia');
}
console.log(`klart: ${Object.keys(klart).length}/${ids.length}`);
