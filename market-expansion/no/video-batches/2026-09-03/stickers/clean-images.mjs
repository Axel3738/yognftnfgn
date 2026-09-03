// Rensar svensk text ur soptunneklistermärkenas 4 bildannonser (alla fyra har text).
import { genereraBild } from '../../../../../bildannonser/kie.mjs';
import { writeFileSync } from 'node:fs';
const PROMPT = 'Remove ALL text, letters, numbers, emoji icons and star ratings from this image. Keep the product, people, background, lighting and composition exactly as they are. Keep any buttons as empty shapes with no text inside. The result should be a completely clean image with zero text anywhere.';
const K = { CS:'1vfRqvrQ3yj2dUvN3tT0s4d4a0YYQoYJ9', G:'1bEIQFZ_LK8ghr5LBG1c8IQiHYWqD__2m', PD:'1u-r5qQ1fgm5P7gBkFPRigiaS4IBhd5Vb', SP:'1rKa2N-6uqKQyhTbe3RGOIsTyYYdKUlGw' };
const res = {};
for (const [k, id] of Object.entries(K)) {
  const { urler } = await genereraBild({ prompt: PROMPT, referensBilder: [`https://drive.google.com/uc?export=download&id=${id}`], bildformat: '1:1' });
  res[k] = urler[0]; console.log(k, '->', urler[0]);
}
writeFileSync(new URL('./clean-urls.json', import.meta.url), JSON.stringify(res, null, 2));
