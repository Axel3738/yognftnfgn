// Rensar svensk text ur de 8 källbilderna (Fas 3.2, /translate-no) med Kie AI
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
  fagelmatare_CS_2_1: '199q8ozeTRhokS-sdOlPBPB7GkX0Wgns9',
  fagelmatare_GT_2_1: '1sCBDXJbvjc7rkn_Elqquqalbx34m7kHk',
  fagelmatare_PD_2_1: '1nI_m3fX1elJcRbu2FBk_Wpq2HyhD19Cm',
  fagelmatare_SP_2_1: '1hkmPo-GNMrTINfUOn71KKbyEYd6VSpbC',
  solcellslampa_CS_2_1: '1bCy5wLKNXtgn-1Lm1SxgT4j6IbC9Mgbi',
  solcellslampa_G_2_1: '1cqj1TqsJZ2jpF3PDQxglVPw8Vh_vKJ-W',
  solcellslampa_PD_2_1: '1Y9WveCuUGG3rqocWdFHxrjGswGvPBarN',
  solcellslampa_SP_2_1: '1WU1uOFvbX91Xrq5lqtgWjKKYJy8gHVox',
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
