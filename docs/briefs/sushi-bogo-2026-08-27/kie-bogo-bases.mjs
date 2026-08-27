// Tema-fria baser (D-setet) för BOGO-annonserna. Referens = riktiga produktfoton.
// INGA högtidsattribut: inga ballonger, hjärtan, tinsel, glitter, snö, granris.
import { writeFileSync } from 'node:fs';

const KEY = process.env.KIE_KEY;
const H = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const CDN = 'https://cdn.shopify.com/s/files/1/0976/7508/4115/files/';
const REF_PACK = CDN + 'WhatsAppImage2025-11-25at08.41.59_5.jpg';
const REF_BOX = CDN + 'Skarmbild2026-01-29190257.png';
const REF_FLAT = CDN + 'WhatsAppImage2025-11-27at03.41.39.jpg';

const NO_THEME = 'Strictly no holiday or seasonal props of any kind: no balloons, no hearts, no tinsel, no glitter, no snow, no fir branches, no ribbons, no confetti. Clean evergreen commercial product photo. No text, no logos, no watermarks.';
const STYLE = 'High-end e-commerce product photograph, soft studio lighting, crisp fabric detail, subtle shadow. The sock sushi pieces must exactly match the reference images — same colors and patterns.';

const JOBS = [
  { id: 'D1-tva-lador', refs: [REF_PACK, REF_BOX], prompt:
    `Two identical black sushi takeaway boxes filled with the rolled sock sushi pieces from the reference images, standing upright side by side at a slight angle on a simple solid-color podium, seamless solid warm coral-orange background, centered square composition with generous empty space at the top. ${STYLE} ${NO_THEME}` },
  { id: 'D2-fotter-box', refs: [REF_PACK, REF_FLAT], prompt:
    `A person's lower legs and feet from the side wearing the orange-and-white diagonally striped salmon sushi crew socks from the reference images, standing on a seamless solid soft peach background, with one black sushi box of rolled sock sushi pieces resting on the floor to the right of the feet. Square composition, clean and minimal. ${STYLE} ${NO_THEME}` },
  { id: 'D3-staplade-lador', refs: [REF_PACK, REF_BOX], prompt:
    `Four black sushi takeaway boxes filled with rolled sock sushi pieces from the reference images, arranged in a neat pyramid stack on a plain light wooden bench, seamless solid bright blue background, square composition with empty space at the top for a headline. ${STYLE} ${NO_THEME}` },
  { id: 'D4-box-svavande', refs: [REF_PACK, REF_BOX], prompt:
    `One black sushi takeaway box filled with rolled sock sushi pieces from the reference images, floating at a dynamic tilted angle above a simple solid-color cube podium, seamless solid warm orange background, soft drop shadow, centered square composition with generous empty space above the box. ${STYLE} ${NO_THEME}` },
];

async function run(j) {
  const r = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST', headers: H,
    body: JSON.stringify({ model: 'google/nano-banana-edit',
      input: { prompt: j.prompt, image_urls: j.refs, output_format: 'png', image_size: '1:1' } }),
  }).then(r => r.json());
  if (r.code !== 200) { console.log('✗ skapa', j.id, JSON.stringify(r)); return; }
  const id = r.data.taskId;
  for (let i = 0; i < 45; i++) {
    await new Promise(res => setTimeout(res, 8000));
    const d = (await fetch('https://api.kie.ai/api/v1/jobs/recordInfo?taskId=' + id, { headers: H }).then(r => r.json())).data;
    if (d.state === 'success') {
      const url = JSON.parse(d.resultJson).resultUrls[0];
      writeFileSync(new URL('./kie-out/' + j.id + '.png', import.meta.url),
        Buffer.from(await (await fetch(url)).arrayBuffer()));
      console.log('✓', j.id); return;
    }
    if (d.state === 'fail') { console.log('✗ FAIL', j.id, d.failMsg || d.failCode); return; }
  }
  console.log('✗ timeout', j.id);
}

await Promise.all(JOBS.map(run));
