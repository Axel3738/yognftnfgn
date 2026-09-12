// Rensar svensk text ur de 11 källbilderna (Fas 3.2, /translate-no) med Kie AI
// (google/nano-banana-edit). Behåll för nästa körning — samma teknik, byt bara
// URL-listan. Kräver env KIE_API_KEY.
//
// Körs så här:
//   node kie-clean.mjs           # skickar alla jobb, pollar, laddar ner till img-clean/
//   node kie-clean.mjs --status  # kollar statusen för sparade taskIds utan att skicka nya
import { skapaJobb, hamtaJobb, vantaPaJobb } from '../../../../bildannonser/kie.mjs';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';

const OUT = new URL('./img-clean/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const STATE_FIL = new URL('./kie-clean.state.json', import.meta.url);

// Publika Drive-URL:er för källbilderna (id:n från uppdraget).
const BILDER = {
  jetvifte_G_2_1: '1lCUr7oE-NBUvq95j06Svw4WH_ZzJi6OD',
  jetvifte_PD_2_1: '1DvW5KvqFATB5yk5ufA1zeCcoUqBYTNEH',
  jetvifte_SP_2_1: '1HFFbmHGz9TLgxsZ_HbL6_qMrVG9YQqkd',
  solcellslarm_CS_2_1: '1YzxeqAYgaYZ_AmcEYh0dOe9kSMX9E3cC',
  solcellslarm_G_2_1: '19W5XFXTdc4xX4GzUdN2AVw5PJ-4uZuJH',
  solcellslarm_PD_2_1: '18GKb-ua5GCl1Lssoitt7psmkowY4e1SD',
  solcellslarm_SP_2_1: '1mfvGOFqgB_GTc04V-ApOkz4lQfZ9v6GN',
  termoskydd_CS_2_1: '1vJIfN6ZcirA-jXeWeAg-REDaYrsY2neE',
  termoskydd_G_2_1: '1lPnDQLzKQygPZdNOJGpHyPhoVlIJkAAQ',
  termoskydd_PD_2_1: '1k_dzcczIHCmSAz3bSaMX5iorlO_4mhYW',
  termoskydd_SP_2_1: '1tzyulhY60lCNFMzYzET15HM70MSBiVNJ',
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

  // Polla alla som inte är klara än.
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
