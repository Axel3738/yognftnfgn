// Rensar svensk text ur Adventskalenderns 4 bildannonser via Kie AI (nano-banana-edit).
import { genereraBild } from '../../../../../bildannonser/kie.mjs';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);

const PROMPT = 'Remove ALL text, letters and numbers from this image. Keep the product, ' +
  'background, lighting and layout exactly as shown. Where a button or colored bar with ' +
  'text was, keep it as an empty shape with the same color and rounded corners. Do not ' +
  'add any new text or watermark.';

const IMAGES = {
  CS_2_1: '1om2PUT-oQITcbYD9rthzh65kf3R75Cbv',
  G_2_1: '18kBFLZghf1VCMT6TwtQAmJJS1nCX-0cz',
  PD_2_1: '1bH3LDlcieoSx5H0fM7LXsDTgH37vUJmP',
  SP_2_1: '1WladAH6CPvZP_UpKRsS8gGkIvL8hZ3IS',
};

for (const [name, id] of Object.entries(IMAGES)) {
  const url = `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;
  console.log(`skapar jobb för ${name} …`);
  try {
    const { urler } = await genereraBild(
      { prompt: PROMPT, referensBilder: [url], bildformat: '4:5' },
      { timeoutMs: 300000 },
    );
    const imgResp = await fetch(urler[0]);
    const buf = Buffer.from(await imgResp.arrayBuffer());
    writeFileSync(path.join(HERE, `img-clean-${name}.png`), buf);
    console.log(`  ✓ ${name} rensad`);
  } catch (e) {
    console.error(`  ✗ ${name}:`, e.message);
  }
}
