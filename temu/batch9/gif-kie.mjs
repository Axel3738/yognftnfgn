// AI-video → GIF via KIE (veo3_fast, 8 s, 720p) med den GODKÄNDA miljöbilden som referens,
// så att produkten i rörelse är samma som i stillbilden. GIF-receptet är batch 8:s
// (fps 10, 480 px, palettegen/paletteuse, mål < 4 MB). Kräver ffmpeg-static i /tmp/gifjobb.
//   node temu/batch9/gif-kie.mjs [id …]
// Referensen är SE-produktens miljöbild på Shopifys CDN (miljo-in.mjs se bild måste ha körts).
import '../miljo.mjs';
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
import sharp from '../node_modules/sharp/dist/index.mjs';
import { writeFileSync, copyFileSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const K = process.env.KIE_API_KEY;
const FF = (await import('/tmp/gifjobb/node_modules/ffmpeg-static/index.js')).default;
const GUARD = ' Static camera, the product stays exactly as in the image, nothing is added or removed. Photorealistic, no text, no people\'s faces.';
const RORELSE = {
  vedstallskapell:'Light snow falls slowly onto the cover and the ground; the cover does not move.',
  solcellsladdare:'Sunlight flickers softly through the trees outside the windshield; the panel stays fixed to the glass.',
  snoblasarkapell:'Very slow, gentle push-in towards the covered snow blower in the garage.',
  honsgardsduk:   'The two hens peck at the grass and walk slowly inside the run; the tarp stays still.',
  snoflingor:     'The warm porch light slowly brightens as dusk deepens; the snowflakes stay fixed on the door.',
  vattenskal:     'The dog drinks from the bowl, a little steam rises from the water, its tail moves slightly.',
  atvkapell:      'A light breeze moves the birch trees and a few yellow leaves drift down past the covered ATV.',
  snoskyffel:     'Light snow falls softly in the background; the tool stays leaning against the post.',
  kajakhallare:   'Very slow, gentle push-in towards the kayak resting on the two wall hooks.',
  motorlas:       'The lake water ripples gently and the boat sways very slightly at the jetty; the lock stays in place.',
  varmesits:      'Light snow falls; skaters glide slowly in the blurred background; the seat pad and thermos stay still.',
  taljset:        'Very slow, gentle push-in towards the knife and the carved spoon; a few shavings settle.',
  varmeljus:      'The LED tealights glow steadily with a very gentle flicker on the windowsill; outside the window light snow falls slowly. Quiet room ambience, no music.',
  blockljus:      'The three LED candle flames flicker gently in the dim room; nothing else moves.',
};
// Omkörning med annan rörelse: RORELSE_JSON='{"id":"…"}'
Object.assign(RORELSE, process.env.RORELSE_JSON ? JSON.parse(process.env.RORELSE_JSON) : {});
const bara = process.argv.slice(2);
const ids = Object.keys(RORELSE).filter((id) => !bara.length || bara.includes(id));
const h = { Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const b = new Butik('se');

const task = {};
for (const id of ids) {
  const f = FAKTA[id];
  const q = await b.fraga(`query($q:String!){products(first:1,query:$q){nodes{media(first:20){nodes{... on MediaImage{image{url}}}}}}}`, { q: `sku:${f.sku}` });
  const ref = q.products.nodes[0]?.media.nodes.map((m) => m.image?.url).find((u) => (u || '').includes(`b${f.batch}-${id}-miljo-se.jpg`));
  if (!ref) { console.error(`${id}: ingen miljöbild på SE-produkten — kör miljo-in.mjs se bild först`); continue; }
  const r = await fetch('https://api.kie.ai/api/v1/veo/generate', { method: 'POST', headers: h, body: JSON.stringify({
    prompt: RORELSE[id] + GUARD, imageUrls: [ref], model: 'veo3_fast', aspectRatio: '16:9', generationType: 'REFERENCE_2_VIDEO' }) }).then((x) => x.json());
  if (r.code !== 200) { console.error(`${id}: generate ${JSON.stringify(r).slice(0, 200)}`); continue; }
  task[id] = r.data.taskId; console.log(`task ${id}: ${task[id]}`);
}
const kvar = new Set(Object.keys(task));
for (let i = 0; i < 80 && kvar.size; i++) {
  await sov(15000);
  for (const id of [...kvar]) {
    const d = await fetch(`https://api.kie.ai/api/v1/veo/record-info?taskId=${task[id]}`, { headers: h }).then((x) => x.json());
    const st = d.data?.successFlag;
    if (st === 1) {
      const url = (d.data.response.resultUrls || d.data.response.result_urls)[0];
      const mp4 = `/tmp/b9/ut/${id}/${id}-miljo.mp4`;
      writeFileSync(mp4, Buffer.from(await (await fetch(url)).arrayBuffer()));
      await gif(id, mp4); kvar.delete(id);
    } else if (st === 2 || st === 3) { console.error(`✖ ${id}: ${JSON.stringify(d.data).slice(0, 300)}`); kvar.delete(id); }
  }
}
if (kvar.size) console.error('timeout:', [...kvar].join(', '));

async function gif(id, video, fps = 10, bredd = 480) {
  const pal = `/tmp/b9/ut/${id}/${id}-palett.png`, ut = `/tmp/b9/ut/${id}/${id}-miljo.gif`;
  const filter = `fps=${fps},scale=${bredd}:-1:flags=lanczos`;
  execFileSync(FF, ['-y', '-v', 'error', '-i', video, '-vf', `${filter},palettegen=max_colors=200:stats_mode=diff`, '-frames:v', '1', '-update', '1', pal]);
  execFileSync(FF, ['-y', '-v', 'error', '-i', video, '-i', pal, '-lavfi', `${filter}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle`, '-loop', '0', ut]);
  const m = await sharp(ut, { animated: true }).metadata();
  const mb = statSync(ut).size / 1048576;
  copyFileSync(ut, `/tmp/b9/ut-no/${id}/${id}-miljo.gif`);
  console.log(`✔ ${id}-miljo.gif — ${m.pages} rutor, ${mb.toFixed(2)} MB${mb > 4 ? ' ⚠️ > 4 MB' : ''}`);
}
