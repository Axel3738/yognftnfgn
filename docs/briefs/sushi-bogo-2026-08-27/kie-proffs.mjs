// Renderar hela annonsen — typografin inkluderad — i kie.ai, i stället för pålagd SVG-text.
// Två varianter per annons; textrendering är stokastisk och måste QA:as på stavning.
import { writeFileSync } from 'node:fs';

const KEY = process.env.KIE_KEY;
const H = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const CDN = 'https://cdn.shopify.com/s/files/1/0976/7508/4115/files/';
const PACK = CDN + 'WhatsAppImage2025-11-25at08.41.59_5.jpg';
const BOX = CDN + 'Skarmbild2026-01-29190257.png';
const FLAT = CDN + 'WhatsAppImage2025-11-27at03.41.39.jpg';

// Gemensam art direction — det som lyfter från "pålagd text" till "designad annons"
const AD = 'Polished professional advertisement with agency-quality art direction: confident ' +
  'typographic hierarchy, generous balanced negative space, premium studio lighting with soft ' +
  'realistic shadows. All lettering rendered crisply in a bold modern geometric sans-serif ' +
  'typeface, tightly kerned. Spell every Swedish word EXACTLY as given, including the letters ' +
  'ä, ö and å. No spelling changes, no extra words, no other text anywhere in the image. ' +
  'No holiday or seasonal props of any kind.';

const JOBS = [
  { id: 'P1-tva-lador', refs: [PACK, BOX], ratio: '1:1', prompt:
    `Two identical black sushi takeaway boxes filled with the rolled sock sushi pieces from the ` +
    `reference images stand upright side by side on a coral-orange podium against a seamless warm ` +
    `coral background. Centred at the top, a two-line deep near-black headline reading exactly: ` +
    `"Den vänstra ger du bort." / "Den högra blir din." Near the bottom, a rounded deep-red pill ` +
    `badge with crisp white bold uppercase text reading exactly: "KÖP 1 - FÅ 1 GRATIS". ${AD}` },

  { id: 'P2-fotter-box', refs: [PACK, FLAT], ratio: '1:1', prompt:
    `A person's lower legs and feet seen from the side, wearing the orange-and-white diagonally ` +
    `striped salmon sushi socks from the reference images, standing on a seamless soft peach ` +
    `background, with one black sushi box of rolled sock sushi pieces on the floor to the right. ` +
    `In the upper-left corner a deep-red circular badge with white bold uppercase text on three ` +
    `lines reading exactly: "KÖP 1" / "FÅ 1" / "GRATIS". Across the bottom, one line of bold ` +
    `dark-brown text reading exactly: "Skämt i lådan. Strumpa på foten." ${AD}` },

  { id: 'P3-staplade', refs: [PACK, BOX], ratio: '1:1', prompt:
    `Six black sushi takeaway boxes filled with rolled sock sushi pieces from the reference images, ` +
    `stacked in a neat pyramid on a light wooden bench against a seamless bright blue background. ` +
    `At the top, white bold uppercase wordmark reading exactly: "SUSHISTRUMPOR", and directly ` +
    `beneath it a lighter thin line reading exactly: "Ser ut som takeaway. Är 20 par strumpor." ` +
    `Below that, a wide rounded deep-red pill badge with white bold uppercase text reading exactly: ` +
    `"KÖP 2 - FÅ 2 GRATIS". The pill must sit in the empty blue space above the boxes, never ` +
    `covering the product. ${AD}` },

  { id: 'P4-svavande', refs: [PACK, BOX], ratio: '1:1', prompt:
    `One black sushi takeaway box filled with rolled sock sushi pieces from the reference images, ` +
    `floating at a dynamic tilted angle above a solid cube podium against a seamless warm orange ` +
    `background, soft drop shadow. Centred at the top, a two-line deep near-black headline reading ` +
    `exactly: "Ser ut som mat." / "Är tio par strumpor." Near the bottom, a rounded deep-red pill ` +
    `badge with white bold uppercase text reading exactly: "KÖP 1 - FÅ 1 GRATIS". ${AD}` },

  { id: 'P5-transformation', refs: [PACK, BOX], ratio: '1:1', prompt:
    `A split-screen comparison advertisement. A clean white banner strip across the very top holds ` +
    `a bold near-black two-line headline reading exactly: "Sushin är slut ikväll." / "Strumporna ` +
    `finns kvar." Below the banner the frame is split vertically into two equal halves that touch: ` +
    `the LEFT half is a warm photo of a black tray of real fresh sushi on a light wooden living-room ` +
    `table; the RIGHT half is a light grey studio shot of the black sushi box filled with the rolled ` +
    `sock sushi pieces from the reference images, with one unrolled orange striped sock beside it. ` +
    `A single bold black arrow with a white outline points from the left half to the right half ` +
    `across the seam. ${AD}` },

  { id: 'P6-kontrast', refs: [PACK, BOX], ratio: '4:5', prompt:
    `A premium comparison advertisement on a seamless warm off-white background, vertical. ` +
    `On the LEFT, smaller, a plain pair of folded grey socks inside a thin black picture frame, ` +
    `flatly lit and deliberately dull, with bold near-black text above it reading exactly: ` +
    `"Detta är en dammsamlare." On the RIGHT, larger and the clear hero, the black sushi box ` +
    `filled with the rolled sock sushi pieces from the reference images, standing upright and lit ` +
    `by a warm golden glow radiating behind it, with bold near-black text above it reading exactly: ` +
    `"Detta är en reaktion." Centred below both, a thin grey line reading exactly: ` +
    `"Gör present till reaktion." Beneath it a rounded mint-green button with bold dark text ` +
    `reading exactly: "Fixa presenten". At the very bottom, small widely-letterspaced grey ` +
    `text reading exactly: "MATSTRUMPOR.SE". ${AD}` },
];

async function run(j, variant) {
  const id = `${j.id}-v${variant}`;
  const r = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST', headers: H,
    body: JSON.stringify({ model: 'google/nano-banana-edit',
      input: { prompt: j.prompt, image_urls: j.refs, output_format: 'png', image_size: j.ratio } }),
  }).then(r => r.json());
  if (r.code !== 200) { console.log('✗ skapa', id, JSON.stringify(r).slice(0, 160)); return; }
  const taskId = r.data.taskId;
  for (let i = 0; i < 50; i++) {
    await new Promise(s => setTimeout(s, 8000));
    const d = (await fetch('https://api.kie.ai/api/v1/jobs/recordInfo?taskId=' + taskId, { headers: H })
      .then(r => r.json())).data;
    if (d.state === 'success') {
      const u = JSON.parse(d.resultJson).resultUrls[0];
      writeFileSync(new URL('./kie-out/' + id + '.png', import.meta.url),
        Buffer.from(await (await fetch(u)).arrayBuffer()));
      console.log('✓', id); return;
    }
    if (d.state === 'fail') { console.log('✗ FAIL', id, d.failMsg || d.failCode); return; }
  }
  console.log('✗ timeout', id);
}

const alla = [];
for (const j of JOBS) for (const v of [1, 2]) alla.push(run(j, v));
await Promise.all(alla);
console.log('färdigt');
