// 018 Lagerbilden — briefens prompt, körd med de riktiga produktfotona som referens.
// Produktnoggrannhet är briefens enda hårda krav, därför nano-banana-EDIT och inte ren text2img.
import { writeFileSync } from 'node:fs';

const KEY = process.env.KIE_KEY;
const H = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const CDN = 'https://cdn.shopify.com/s/files/1/0976/7508/4115/files/';
const REFS = [
  CDN + 'WhatsAppImage2025-11-25at08.41.59_5.jpg',   // box + 5 par, alla designer
  CDN + 'Skarmbild2026-01-29190257.png',             // stängd box
];

// Briefens prompt, ordagrant, plus en referensmening som binder produkten till fotona.
const BAS =
  'Photorealistic candid workplace photo, shot on a phone, natural indoor light from a window. ' +
  'A small Swedish e-commerce packing room: a plain work table covered with stacks of ' +
  'takeaway-style sushi boxes, each box containing five rolled sock "maki" rolls exactly ' +
  'matching the reference images, with a pair of wooden chopsticks lying on the table beside them. ' +
  'Open cardboard shipping boxes and a roll of packing tape on the table, a few shipping labels ' +
  'and a printed picking list. One person in a plain dark t-shirt, seen from the side, hands busy ' +
  'packing a box, face not visible, not looking at the camera. Modest room, ordinary shelving ' +
  'along one wall, a few stacked cartons — a small operation, not a large warehouse. ' +
  'Slightly imperfect framing, mild motion in the hands, real textures, visible dust and creases ' +
  'in the cardboard. The sock sushi pieces must match the reference images exactly in colour and ' +
  'pattern. No text, no logos, no graphics, no studio lighting, no glossy retouching.';

// Briefens negativa prompt, formulerad som uteslutningar modellen förstår.
const NEG = ' Absolutely no text, no watermark, no logo, no christmas decorations, no forklift, ' +
  'no pallet racking, no huge warehouse, no studio lighting, no glossy finish, no stock-photo look, ' +
  'no posed model, no face looking at the camera, no cartoon, no illustration.';

// Fyra varianter: olika kameravinkel/avstånd, samma innehåll och samma avgränsningar.
const VARIANTER = [
  ' Camera at table height, seen from directly BEHIND the packer so only their back and shoulders are visible and no face at all appears in frame, the stacked sushi boxes closest to the lens.',
  ' Camera a little further back over the packer\'s shoulder from behind, the table and shelving visible.',
  ' Camera low and close, looking along the work table past the boxes towards the packing hands.',
  ' Camera standing slightly above the table, looking down at the boxes, cardboard and picking list.',
];

async function run(i) {
  const namn = `018_lager_4x5_v${i + 1}`;
  const r = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST', headers: H,
    body: JSON.stringify({ model: 'google/nano-banana-edit',
      input: { prompt: BAS + VARIANTER[i] + NEG, image_urls: REFS,
               output_format: 'png', image_size: '4:5' } }),
  }).then(r => r.json());
  if (r.code !== 200) { console.log('✗ skapa', namn, JSON.stringify(r).slice(0, 150)); return; }
  const t = r.data.taskId;
  for (let n = 0; n < 50; n++) {
    await new Promise(s => setTimeout(s, 8000));
    const d = (await fetch('https://api.kie.ai/api/v1/jobs/recordInfo?taskId=' + t, { headers: H })
      .then(r => r.json())).data;
    if (d.state === 'success') {
      const u = JSON.parse(d.resultJson).resultUrls[0];
      writeFileSync(new URL('./kie-out/' + namn + '.png', import.meta.url),
        Buffer.from(await (await fetch(u)).arrayBuffer()));
      console.log('✓', namn); return;
    }
    if (d.state === 'fail') { console.log('✗ FAIL', namn, d.failMsg || d.failCode); return; }
  }
  console.log('✗ timeout', namn);
}

await Promise.all([0].map(run));
console.log('färdigt');
