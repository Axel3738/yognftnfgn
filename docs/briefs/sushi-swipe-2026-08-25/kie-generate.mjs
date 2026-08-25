// Generera sushi-strumpe-baser via kie.ai (nano-banana-edit) med riktiga produktfoton som referens.
// API-nyckel läses ur env KIE_KEY — aldrig i repot.
import { writeFileSync } from 'node:fs';

const KEY = process.env.KIE_KEY;
if (!KEY) throw new Error('KIE_KEY saknas');
const H = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const CDN = 'https://cdn.shopify.com/s/files/1/0976/7508/4115/files/';
const REF_PACK = CDN + 'WhatsAppImage2025-11-25at08.41.59_5.jpg';   // box + 5 par (alla designer)
const REF_FLAT = CDN + 'WhatsAppImage2025-11-27at03.41.39.jpg';     // strumpor utrullade platt
const REF_BOX  = CDN + 'Skarmbild2026-01-29190257.png';             // stängd box, svart bg

const STYLE = 'Professional e-commerce ad photograph, soft even studio lighting, crisp fabric detail, vertical composition. The sock designs must exactly match the socks in the reference images — same colors, stripes and patterns. No text, no logos, no watermarks.';

const JOBS = [
  { id: 'B1-fotter-bla', refs: [REF_PACK, REF_FLAT], prompt:
    `A person's lower legs crossed at the ankles, feet raised playfully, wearing the orange-and-white diagonally striped salmon sushi crew socks from the reference images, against a solid light blue studio background. ${STYLE}` },
  { id: 'B2-fotter-rosa', refs: [REF_PACK, REF_FLAT], prompt:
    `A person's lower legs seen from the side, wearing the white maki roll crew socks with black dots, wide black band and green toe from the reference images, against a solid pastel pink studio background, one knee slightly bent. ${STYLE}` },
  { id: 'B3-fotter-gul', refs: [REF_PACK, REF_FLAT], prompt:
    `Two feet resting on a coffee table edge, wearing the yellow tamago sushi crew socks with wide black band from the reference images, solid warm pastel yellow studio background. ${STYLE}` },
  { id: 'B4-presentogonblick', refs: [REF_PACK, REF_BOX], prompt:
    `Two hands holding the open black sushi takeaway box from the reference images toward the camera, showing the rolled sock sushi pieces inside exactly as in the reference, lid tilted open, bright warm home interior softly blurred in the background, gift-giving moment. ${STYLE}` },
  { id: 'B5-flatlay-rosa', refs: [REF_PACK, REF_BOX], prompt:
    `Top-down flat lay: the open black sushi box with rolled sock sushi pieces from the reference images centered on a solid pastel pink background, a pair of wooden chopsticks beside it, minimal and clean. ${STYLE}` },
];

async function createTask(j) {
  const r = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST', headers: H,
    body: JSON.stringify({ model: 'google/nano-banana-edit',
      input: { prompt: j.prompt, image_urls: j.refs, output_format: 'png', image_size: '3:4' } }),
  }).then(r => r.json());
  if (r.code !== 200) throw new Error(j.id + ': ' + JSON.stringify(r));
  return r.data.taskId;
}

async function poll(taskId) {
  const r = await fetch('https://api.kie.ai/api/v1/jobs/recordInfo?taskId=' + taskId, { headers: H })
    .then(r => r.json());
  return r.data;
}

const tasks = [];
for (const j of JOBS) { const t = await createTask(j); tasks.push({ ...j, taskId: t }); console.log('skickad:', j.id, t); }

const done = new Set();
for (let i = 0; i < 40 && done.size < tasks.length; i++) {
  await new Promise(r => setTimeout(r, 10000));
  for (const t of tasks) {
    if (done.has(t.id)) continue;
    const d = await poll(t.taskId);
    if (d.state === 'success') {
      const urls = JSON.parse(d.resultJson).resultUrls;
      const buf = Buffer.from(await (await fetch(urls[0])).arrayBuffer());
      writeFileSync(new URL('./kie-out/' + t.id + '.png', import.meta.url), buf);
      done.add(t.id); console.log('✓ klar:', t.id);
    } else if (d.state === 'fail') {
      done.add(t.id); console.log('✗ FAIL:', t.id, d.failMsg || d.failCode);
    }
  }
}
console.log('färdig:', done.size, '/', tasks.length);
