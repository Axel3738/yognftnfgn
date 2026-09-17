import { skapaJobb, hamtaJobb } from '../../../../bildannonser/kie.mjs';
import { writeFileSync } from 'node:fs';

const PROMPT =
  'Remove ALL text from this image, including any text inside the red rounded button ' +
  'at the bottom of the image. The button must become a plain empty red rounded ' +
  'rectangle shape with absolutely no letters inside it. Also remove the small ' +
  'white label/tag text near the gift bag. Keep the photo, lighting and composition ' +
  'identical otherwise. Do not add any new text.';

const { taskId } = await skapaJobb({
  prompt: PROMPT,
  referensBilder: ['https://drive.usercontent.google.com/download?id=1sCBDXJbvjc7rkn_Elqquqalbx34m7kHk&export=download&confirm=t'],
  bildformat: '1:1',
});
console.log('skickat', taskId);
let status;
do {
  await new Promise(r => setTimeout(r, 6000));
  status = await hamtaJobb(taskId);
  console.log(status.lage);
} while (!status.klar && !status.misslyckad);
if (status.misslyckad) { console.error('FEL', status.felmeddelande); process.exit(1); }
const res = await fetch(status.urler[0]);
writeFileSync('img-clean/fagelmatare_GT_2_1.png', Buffer.from(await res.arrayBuffer()));
console.log('klar, sparad');
