#!/usr/bin/env node
// bild-kor.mjs — genererar batch #3:s bildbaser för Sushi-Strumpor i kie.ai
// (google/nano-banana-edit med de riktiga produktfotona som referens), samma
// motor som /bildannonser och /ops-bild (bildannonser/kie.mjs). Textlagret
// läggs på efteråt av lager.py — bildmodellen ritar ALDRIG text.
//
//   node products/sushi-strumpor/batch-03/bild-kor.mjs --ut <mapp> [--bara 029,030] [--torr]
//
// Kräver env KIE_API_KEY. Skriver <mapp>/<nummer>.png + <mapp>/manifest.json.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { genereraBild } from '../../../bildannonser/kie.mjs';

const CDN = 'https://cdn.shopify.com/s/files/1/0976/7508/4115/files/';
const REF_BOX_OPEN = CDN + 'Skarmbild2026-01-29190257.png';            // öppen låda, 10 bitar, ätpinnar
const REF_PACK = CDN + 'WhatsAppImage2025-11-25at08.41.59_5.jpg';       // låda + de fem strumporna
const REF_FLAT = CDN + 'WhatsAppImage2025-11-27at03.41.39.jpg';         // strumporna utrullade
const REF_TABLE = CDN + 'WhatsAppImage2025-11-27at03.41.37_80407476-11ab-4ab2-a940-b37398596e88_2.jpg';

const STYLE = 'High-end e-commerce product photograph, soft studio light, crisp fabric detail, natural shadow. The black takeaway sushi box and the rolled sock sushi pieces (salmon nigiri, tamago, maki rolls) must exactly match the reference images — same box, same colours and patterns, wooden chopsticks.';
const NO_TEXT = 'Absolutely no text, no letters, no numbers, no logos, no labels, no watermarks anywhere in the image. No people, no faces, no hands unless stated.';
const NO_SEASON = 'No holiday or seasonal props: no tree, no snow, no ribbons, no hearts, no confetti.';

export const JOBB = [
  { n: '029', refs: [REF_BOX_OPEN, REF_PACK], format: '4:5', prompt:
    `One open black sushi takeaway box filled with the rolled sock sushi pieces from the references, seen from about 30 degrees above, wooden chopsticks resting on the edge of the box. The box fills the lower two thirds of the frame. Seamless solid pale sky-blue background, generous empty space in the top third for a headline. ${STYLE} ${NO_TEXT} ${NO_SEASON}` },
  { n: '030', refs: [REF_BOX_OPEN, REF_FLAT], format: '4:5', prompt:
    `Portrait 4:5 photo, split vertically into two halves by a thin divider line, both halves filling the frame completely from top edge to bottom edge with no borders or bands. LEFT HALF: close-up of the open black sushi box with one orange-and-white striped salmon nigiri sock piece lifted slightly by wooden chopsticks. RIGHT HALF: the very same orange-and-white diagonally striped crew sock unrolled and laid flat, on the same seamless pale cream background and same light, so both halves read as one photo. Empty space at the top for a headline. ${STYLE} ${NO_TEXT} ${NO_SEASON}` },
  { n: '031', refs: [REF_BOX_OPEN, REF_PACK], format: '4:5', prompt:
    `Cosy living room, light wooden coffee table with the open black sushi box of rolled sock sushi pieces on it. Beside the table, in the same frame, an adult's feet and ankles only, wearing dark blue jeans rolled at the ankle and the orange-and-white diagonally striped salmon crew socks from the references, ankles crossed, resting on the edge of the sofa. Nothing above the knee is visible. Feet and box roughly equal in size. Warm daylight. Empty space at the top for a headline. ${STYLE} ${NO_TEXT} ${NO_SEASON} No faces, no upper body.` },
  { n: '032', refs: [REF_BOX_OPEN], format: '4:5', prompt:
    `Split comparison, thin vertical divider. LEFT HALF: a plain blank grey gift card lying in an open plain grey envelope on a flat grey surface, flat dull light, desaturated, deliberately boring, the card completely blank. RIGHT HALF: the open black sushi box of rolled sock sushi pieces with wooden chopsticks, full colour, warm light, on a warm cream surface. The box is larger in frame than the envelope. Empty space at the top for a headline. ${STYLE} ${NO_TEXT} ${NO_SEASON}` },
  { n: '033', refs: [REF_BOX_OPEN], format: '4:5', prompt:
    `The black sushi takeaway box with the lid half open showing the rolled sock sushi pieces, centred in the lower half of the frame on a seamless deep forest-green background, a single small sprig of pine lying beside the box, soft spotlight. The top half of the frame is empty dark green space for a very large number. ${STYLE} ${NO_TEXT} No tree, no snow, no ribbons, no ornaments.` },
  { n: '034', refs: [REF_BOX_OPEN, REF_PACK], format: '4:5', prompt:
    `Macro close-up: wooden chopsticks lifting the orange-and-white striped salmon nigiri sock piece up out of the open black sushi box, the rest of the box and the other pieces softly out of focus below. Warm light, seamless neutral warm-grey background, empty space at the top for a headline. ${STYLE} ${NO_TEXT} ${NO_SEASON} The chopsticks enter from the top right edge of the frame and the hand holding them is completely outside the frame — not even a fingertip is visible.` },
  { n: '035', refs: [REF_PACK, REF_BOX_OPEN], format: '4:5', prompt:
    `Four black sushi takeaway boxes filled with rolled sock sushi pieces from the references, exactly FOUR boxes and no more: three boxes side by side on the bottom row and one single box centred on top of them, on a plain light wooden bench, seamless solid bright blue background filling the entire frame edge to edge with no borders, empty space at the top for a headline. ${STYLE} ${NO_TEXT} ${NO_SEASON}` },
  { n: '036', refs: [REF_BOX_OPEN, REF_PACK], format: '4:5', prompt:
    `A classic red knitted Christmas stocking hanging from a wooden mantelpiece, and the black sushi takeaway box of rolled sock sushi pieces tucked into the top of the stocking with the lid open so the pieces are clearly visible. Warm string lights softly out of focus behind, cosy evening light. The stocking and box fill the lower two thirds; empty space at the top for a headline. ${STYLE} ${NO_TEXT} No people, no Santa, no tree.` },
  { n: '038', refs: [REF_BOX_OPEN, REF_PACK], format: '4:5', prompt:
    `The black sushi takeaway box seen straight from above, lid closed but transparent so the rolled sock sushi pieces show through, wooden chopsticks lying beside it, on a seamless solid pale cream background. The box fills about 65 percent of the frame, centred, with empty space above and below it. ${STYLE} ${NO_TEXT} ${NO_SEASON} No stickers, no labels on the lid.` },
];

const arg = (f) => { const i = process.argv.indexOf(f); return i === -1 ? null : process.argv[i + 1]; };
const ut = arg('--ut');
if (!ut) { console.error('Ange --ut <mapp>'); process.exit(1); }
mkdirSync(ut, { recursive: true });
const bara = arg('--bara')?.split(',').map((s) => s.trim());
const torr = process.argv.includes('--torr');
const jobb = JOBB.filter((j) => !bara || bara.includes(j.n));
const manifest = [];

await Promise.all(jobb.map(async (j) => {
  const fil = join(ut, `${j.n}.png`);
  if (existsSync(fil) && !process.argv.includes('--igen')) { console.log('finns redan', j.n); manifest.push({ n: j.n, fil, lage: 'fanns' }); return; }
  if (torr) { console.log('TORR', j.n, j.format, j.refs.length, 'refs'); manifest.push({ n: j.n, lage: 'torr', prompt: j.prompt }); return; }
  try {
    const r = await genereraBild({ prompt: j.prompt, referensBilder: j.refs, bildformat: j.format, filformat: 'png' }, { timeoutMs: 420000 });
    const buf = Buffer.from(await (await fetch(r.urler[0])).arrayBuffer());
    writeFileSync(fil, buf);
    console.log('✓', j.n, r.modell, r.taskId, Math.round(buf.length / 1024), 'kB');
    manifest.push({ n: j.n, fil, lage: 'klar', taskId: r.taskId, modell: r.modell, url: r.urler[0], prompt: j.prompt, refs: j.refs });
  } catch (e) {
    console.log('✗', j.n, e.message);
    manifest.push({ n: j.n, lage: 'fel', fel: e.message, prompt: j.prompt });
  }
}));
writeFileSync(join(ut, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`klart: ${manifest.filter((m) => m.lage === 'klar').length} genererade, ${manifest.filter((m) => m.lage === 'fel').length} fel`);
