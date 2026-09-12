// Engångsomkörning för jetvifte_G_2_1 — första passet lämnade svensk text kvar.
import { skapaJobb, vantaPaJobb } from '../../../../bildannonser/kie.mjs';
import { writeFileSync } from 'node:fs';

const url =
  'https://drive.usercontent.google.com/download?id=1lCUr7oE-NBUvq95j06Svw4WH_ZzJi6OD&export=download&confirm=t';

const PROMPT =
  'This photo has bold white headline text overlaid across the top third ' +
  '("DEN PERFEKTA PRESENTEN TILL HONOM SOM REDAN HAR ALLT") and a smaller ' +
  'subheading line below it ("Se hans min när han öppnar den"), all in ' +
  'Swedish. Completely erase every letter of both text lines and reconstruct ' +
  'the blurred warm room background (window, curtain, shelf) underneath them ' +
  'so nothing is left — no ghosting, no faint letters. Keep the gift box, the ' +
  'power tool, the ribbon and the table exactly as they are. Output a clean ' +
  'photo with zero text anywhere.';

const { taskId } = await skapaJobb({ prompt: PROMPT, referensBilder: [url], bildformat: '1:1' });
console.log('taskId', taskId);
const status = await vantaPaJobb(taskId, { timeoutMs: 300000 });
const res = await fetch(status.urler[0]);
writeFileSync(new URL('./img-clean/jetvifte_G_2_1.png', import.meta.url), Buffer.from(await res.arrayBuffer()));
console.log('klart, sparat img-clean/jetvifte_G_2_1.png');
