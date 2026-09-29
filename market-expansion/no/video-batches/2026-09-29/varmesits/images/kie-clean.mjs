// Rensar svensk text ur Värmesits 4 bildannonser (Fas 3.2) med Kie nano-banana-edit.
import { skapaJobb, vantaPaJobb } from '../../../../../../bildannonser/kie.mjs';
import { writeFileSync } from 'node:fs';
const BILDER = { CS: '1Q1ZmhuD_EViPKnvWHcPdjbpUBkBIyR3f', G: '1deZQzela6kGm5Le_6J9EkwbZ6c8pFZKZ', PD: '1xgLGADIiy2KjJhIXqnSoSBLXLZUIRl1x', SP: '12UWVbEn786J1YPhT_xQs9_ihucqHiOGm' };
const PROMPT = 'Remove ALL text, letters, numbers, stars, badges and quotation marks from this image. Keep the photo, product, lighting, colors, decorative ribbon, underline and composition identical. Keep buttons as empty rounded shapes with no text inside them. Fill the removed text areas with the surrounding background. Do not add any new text.';
const kor = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(BILDER);
await Promise.all(kor.map(async (k) => {
  const { taskId } = await skapaJobb({ prompt: PROMPT, referensBilder: [`https://drive.usercontent.google.com/download?id=${BILDER[k]}&export=download&confirm=t`], bildformat: '1:1' });
  console.log(k, taskId);
  const s = await vantaPaJobb(taskId, { timeoutMs: 600000 });
  const buf = Buffer.from(await (await fetch(s.urler[0])).arrayBuffer());
  writeFileSync(new URL(`./clean/${k}.png`, import.meta.url), buf); console.log(k, 'klar');
}));
