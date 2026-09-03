// Omtag: första rensningen tog bort de tecknade ansiktena på tunnorna (det ÄR produkten).
import { genereraBild } from '../../../../../bildannonser/kie.mjs';
import { writeFileSync } from 'node:fs';
const PROMPT = 'Remove ONLY the typographic text: all headlines, words, letters, numbers, emoji icons, star-rating icons and button labels. Keep any buttons as empty shapes. IMPORTANT: keep the cartoon faces (eyes, mouths, tongues, tears) printed on the trash bins exactly as they are — they are the product being advertised, not text. Keep the bins, people, background, lighting and composition unchanged.';
const K = { CS:'1vfRqvrQ3yj2dUvN3tT0s4d4a0YYQoYJ9', PD:'1u-r5qQ1fgm5P7gBkFPRigiaS4IBhd5Vb', SP:'1rKa2N-6uqKQyhTbe3RGOIsTyYYdKUlGw' };
const res = {};
for (const [k, id] of Object.entries(K)) {
  const { urler } = await genereraBild({ prompt: PROMPT, referensBilder: [`https://drive.google.com/uc?export=download&id=${id}`], bildformat: '1:1' });
  res[k] = urler[0]; console.log(k, '->', urler[0]);
}
writeFileSync(new URL('./clean-urls-2.json', import.meta.url), JSON.stringify(res, null, 2));
