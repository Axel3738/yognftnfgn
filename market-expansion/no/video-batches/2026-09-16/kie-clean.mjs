// Rensar svensk text ur de 4 källbilderna (Fas 3.2, /translate-no) med Kie AI
// (google/nano-banana-edit). Kräver env KIE_API_KEY.
//
//   node kie-clean.mjs           # skickar alla jobb, pollar, laddar ner till img-clean/
//   node kie-clean.mjs --status  # kollar statusen för sparade taskIds utan att skicka nya
import { skapaJobb, hamtaJobb } from '../../../../bildannonser/kie.mjs';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';

const OUT = new URL('./img-clean/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const STATE_FIL = new URL('./kie-clean.state.json', import.meta.url);

const BILDER = {
  infartslarm_CS_2_1: '1NKWet90tnpjM1EVbikwQFKybPm5VbyTD',
  infartslarm_G_2_1: '1kTHk-17qqahDL4ckc5b_IqIOPITaiVUU',
  infartslarm_PD_2_1: '1QYPhBED1wYR14EEUblEwTPvILckdzhEK',
  infartslarm_SP_2_1: '11gtNTnV_SjbjWjYizDxjh8bGYO4j8dvw',
};

const driveUrl = (id) =>
  `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;

const PROMPT =
  'Remove ALL text, letters and numbers from this image. Keep the photo, ' +
  'lighting and composition identical. Keep buttons as empty rounded shapes ' +
  'with no text inside them. Do not add any new text.';

function lasState() {
  try {
    return JSON.parse(readFileSync(STATE_FIL, 'utf8'));
  } catch {
    return {};
  }
}
function skrivState(s) {
  writeFileSync(STATE_FIL, JSON.stringify(s, null, 2));
}

async function ladda(namn, url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`nedladdning ${namn} gav HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(new URL(`./${namn}.png`, OUT), buf);
}

const bara = process.argv.includes('--status');

async function main() {
  const state = lasState();

  if (!bara) {
    for (const [namn, id] of Object.entries(BILDER)) {
      if (state[namn]?.taskId) {
        console.log(`${namn}: redan skickat (${state[namn].taskId}), hoppar`);
        continue;
      }
      const { taskId, modell } = await skapaJobb({
        prompt: PROMPT,
        referensBilder: [driveUrl(id)],
        bildformat: '1:1',
      });
      state[namn] = { taskId, modell, klar: false };
      console.log(`${namn}: skickat -> ${taskId}`);
      skrivState(state);
    }
  }

  let kvar = Object.entries(state).filter(([, v]) => !v.klar);
  while (kvar.length) {
    for (const [namn, v] of kvar) {
      const status = await hamtaJobb(v.taskId);
      if (status.klar) {
        await ladda(namn, status.urler[0]);
        state[namn].klar = true;
        state[namn].url = status.urler[0];
        console.log(`${namn}: KLAR -> img-clean/${namn}.png`);
      } else if (status.misslyckad) {
        state[namn].klar = true;
        state[namn].fel = status.felmeddelande;
        console.log(`${namn}: MISSLYCKADES -- ${status.felmeddelande}`);
      } else {
        console.log(`${namn}: ${status.lage}`);
      }
    }
    skrivState(state);
    kvar = Object.entries(state).filter(([, v]) => !v.klar);
    if (kvar.length) await new Promise((r) => setTimeout(r, 6000));
  }

  console.log('Alla jobb slutförda.');
}

main().catch((e) => {
  console.error('FEL:', e.message);
  process.exit(1);
});
