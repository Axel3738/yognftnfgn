// Engångsomkörning för infartslarm_G_2_1 — första passet lämnade svensk text kvar.
import { skapaJobb, vantaPaJobb } from '../../../../bildannonser/kie.mjs';
import { writeFileSync } from 'node:fs';

const url =
  'https://drive.usercontent.google.com/download?id=1kTHk-17qqahDL4ckc5b_IqIOPITaiVUU&export=download&confirm=t';

const PROMPT =
  'This photo has bold gold headline text overlaid across the top third ' +
  '("DEN PERFEKTA PRESENTEN TILL MAMMA & PAPPA") and a smaller white subheading ' +
  'line below it ("Se dem le av tacksamhet varje gång bilen svänger in."), all in ' +
  'Swedish. Completely erase every letter of both text lines and reconstruct ' +
  'the cozy autumn/christmas living room background (pictures on the wall, wreath, ' +
  'fireplace, window) underneath them so nothing is left — no ghosting, no faint ' +
  'letters. Keep the gift box, the wireless sensor device, the wall outlet, the ' +
  'candles, the pumpkins and the wooden table exactly as they are. Output a clean ' +
  'photo with zero text anywhere.';

const { taskId } = await skapaJobb({ prompt: PROMPT, referensBilder: [url], bildformat: '1:1' });
console.log('taskId', taskId);
const status = await vantaPaJobb(taskId, { timeoutMs: 300000 });
const res = await fetch(status.urler[0]);
writeFileSync(new URL('./img-clean/infartslarm_G_2_1.png', import.meta.url), Buffer.from(await res.arrayBuffer()));
console.log('klart, sparat img-clean/infartslarm_G_2_1.png');
