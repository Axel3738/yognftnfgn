// Rensar svensk text ur de tre bildannonserna som behöver det (CS, PD, SP).
// G har ingen svensk text och hoppas över. Samma teknik som tidigare NO-batcher.
import { genereraBild } from '../../../../../bildannonser/kie.mjs';
import { writeFileSync } from 'node:fs';

const PROMPT = 'Remove ALL text, letters and numbers from this image. Keep the product, background, lighting and composition exactly as they are. Keep any buttons as empty shapes with no text inside. The result should be a completely clean image with zero text anywhere.';

const KALLOR = {
  CS: 'https://drive.google.com/uc?export=download&id=1Eu3SxS_kXbE2srbkK0NnQpbQcB3i-G5w',
  PD: 'https://drive.google.com/uc?export=download&id=1iflBjcp1fiptCwoj-7CW-KK9nJHeo9As',
  SP: 'https://drive.google.com/uc?export=download&id=1nipoev6FQ7KTUky2kse-Eo18QsAkLx2e',
};

const resultat = {};
for (const [k, url] of Object.entries(KALLOR)) {
  console.log(`Rensar ${k}...`);
  const { urler } = await genereraBild({ prompt: PROMPT, referensBilder: [url], bildformat: '1:1' });
  resultat[k] = urler[0];
  console.log(`  ${k} -> ${urler[0]}`);
}
writeFileSync(new URL('./clean-urls.json', import.meta.url), JSON.stringify(resultat, null, 2));
console.log('klart');
