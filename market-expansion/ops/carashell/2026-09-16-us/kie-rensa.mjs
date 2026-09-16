#!/usr/bin/env node
// kie-rensa.mjs — tar bort den svenska texten som sitter DIREKT PÅ FOTOT i tre av
// takskyddets ärvda batch #1-bilder (CS_2_1, PD_2_1, GT_2_1) med Kie
// (google/nano-banana-edit), samma prompt som /translate-no Fas 3.2
// (market-expansion/no/video-batches/2026-09-16/kie-clean.mjs). SP_2_1 har texten
// på en enfärgad platta och går den krediitfria vägen (pipeline/oversatt-bild.py).
// Källbildernas publika URL:er är Metas CDN-länkar ur kallmedia.json (signerade,
// kortlivade — hämtade samma körning). Skriver bas-rensad/<namn>.png.
//   node kie-rensa.mjs            # skicka + polla + ladda ner
//   node kie-rensa.mjs --status   # bara polla sparade taskIds
import { skapaJobb, hamtaJobb } from '../../../../bildannonser/kie.mjs';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';

const HAR = new URL('./', import.meta.url);
const OUT = new URL('./bas-rensad/', import.meta.url);
mkdirSync(OUT, { recursive: true });
const STATE = new URL('./kie-rensa.state.json', import.meta.url);
const media = JSON.parse(readFileSync(new URL('./kallmedia.json', HAR), 'utf8'));
const NAMN = ['CaraShellRoof_CS_2_1', 'CaraShellRoof_PD_2_1', 'CaraShellRoof_GT_2_1'];
const PROMPT =
  'Remove ALL text, letters and numbers from this image. Keep the photo, ' +
  'lighting and composition identical. Keep buttons as empty rounded shapes ' +
  'with no text inside them. Do not add any new text.';
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {};
const spara = () => writeFileSync(STATE, JSON.stringify(state, null, 2));
const baraStatus = process.argv.includes('--status');

if (!baraStatus) {
  for (const n of NAMN) {
    if (state[n]?.taskId) { console.log(`${n}: redan skickad (${state[n].taskId})`); continue; }
    const url = media[n]?.url;
    if (!url) throw new Error(`${n}: ingen publik url i kallmedia.json`);
    const { taskId, modell } = await skapaJobb({ prompt: PROMPT, referensBilder: [url], bildformat: '1:1' });
    state[n] = { taskId, modell, klar: false };
    console.log(`${n}: skickad → ${taskId} (${modell})`);
    spara();
  }
}
let kvar = Object.entries(state).filter(([, v]) => !v.klar);
while (kvar.length) {
  for (const [n, v] of kvar) {
    const s = await hamtaJobb(v.taskId);
    if (s.klar) {
      const r = await fetch(s.urler[0]);
      writeFileSync(new URL(`./${n}.png`, OUT), Buffer.from(await r.arrayBuffer()));
      state[n].klar = true; state[n].url = s.urler[0];
      console.log(`${n}: KLAR → bas-rensad/${n}.png`);
    } else if (s.misslyckad) {
      state[n].klar = true; state[n].fel = s.felmeddelande;
      console.log(`${n}: MISSLYCKADES — ${s.felmeddelande}`);
    } else console.log(`${n}: ${s.lage}`);
  }
  spara();
  kvar = Object.entries(state).filter(([, v]) => !v.klar);
  if (kvar.length) await new Promise((r) => setTimeout(r, 6000));
}
console.log('klart');
