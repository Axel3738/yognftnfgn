#!/usr/bin/env node
// rost-brand.mjs — eleven_v3 läser brandnamnet olika från gång till gång: i tre renderade
// SP-videor hörde Scribe "Carosha", "Car Shop" och "Carousel" i sista cuen, medan samma
// mening i tio testanrop blev "Carashell" varje gång. Örat finns inte i containern, så
// Scribe får vara örat: varje cue som bär brandnamnet eller namnet Per genereras om tills
// Scribe hör rätt ord (max 5 försök), och mp3:an läggs i röstcachen. Sedan renderar
// dubba.mjs om videon ur cachen (bara den cuen är ny).
//
//   node market-expansion/ops/carashell/2026-09-16-us-termoskyddet/rost-brand.mjs [--bara CS_1,SP_2]
//
// Kör ALDRIG medan dubba.mjs renderar — de delar cachen.
import { readFileSync, writeFileSync, existsSync, renameSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { generateVoiceover } from '../../../../voiceover/elevenlabs.mjs';
import { voText } from './dubba-text.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const baraIdx = args.indexOf('--bara');
const BARA = baraIdx >= 0 ? args[baraIdx + 1].split(',').map((s) => s.trim()) : null;
const ut = JSON.parse(readFileSync(join(HAR, 'oversatt-output.json'), 'utf8'));
const VO_ROT = process.env.VO_ROT || '/tmp/claude-0/-home-user-yognftnfgn/300cb0d9-2208-5742-9d8d-2cce375a61f0/scratchpad/vo';
const KEY = process.env.ELEVENLABS_API_KEY;
const MAX = 5;

// "Kara Shell" hörs likadant som "Cara Shell" — samma uttal, godkänns.
const norm = (t) => String(t).toLowerCase().replace(/[ck]ara ?shell/g, 'carashell').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
function scribe(fil) {
  const r = spawnSync('curl', ['-sS', '-m', '90', 'https://api.elevenlabs.io/v1/speech-to-text', '-H', `xi-api-key: ${KEY}`, '-F', 'model_id=scribe_v1', '-F', 'language_code=en', '-F', `file=@${fil}`], { encoding: 'utf8' });
  try { return JSON.parse(r.stdout).text ?? ''; } catch { return ''; }
}
/** Orden Scribe MÅSTE höra i cuen: brandet, och "pair" (namnet Per) om det finns. */
function krav(text) {
  const k = [];
  if (/Cara Shell/.test(text)) k.push('carashell');
  if (/\bPair\b/.test(text)) k.push('pair');
  return k;
}

const resultat = {};
for (const [mal, v] of Object.entries(ut.videor)) {
  const kort = mal.replace('CaraShellFront_US_', '');
  if (BARA && !BARA.includes(kort)) continue;
  const vo = join(VO_ROT, mal);
  mkdirSync(vo, { recursive: true });
  for (let i = 0; i < v.cues.length; i++) {
    const text = voText(v.cues[i].en);
    const maste = krav(text);
    if (!maste.length) continue;
    const mp3 = join(vo, `${i}.mp3`);
    let forsok = 0, hort = '', ok = false;
    // Först: godkänn den som redan ligger i cachen om Scribe hör rätt.
    if (existsSync(mp3)) { hort = scribe(mp3); ok = maste.every((w) => norm(hort).includes(w)); }
    while (!ok && forsok < MAX) {
      forsok += 1;
      if (existsSync(mp3)) renameSync(mp3, join(vo, `${i}.underkand-${Date.now()}.mp3`));
      const wav = join(vo, `${i}.wav`);
      if (existsSync(wav)) renameSync(wav, join(vo, `${i}.underkand-${Date.now()}.wav`));
      const buf = await generateVoiceover(text, { voiceName: ut.rost, modelId: 'eleven_v3' });
      writeFileSync(mp3, buf);
      hort = scribe(mp3);
      ok = maste.every((w) => norm(hort).includes(w));
    }
    resultat[`${mal}#${i + 1}`] = { text, maste, ok, forsok, hort };
    console.log(`${mal} cue ${i + 1}: ${ok ? '✓' : '✗'} efter ${forsok} omgenereringar — Scribe: "${hort}"`);
  }
}
writeFileSync(join(HAR, 'resultat-rost-brand.json'), JSON.stringify(resultat, null, 2));
const kvar = Object.entries(resultat).filter(([, r]) => !r.ok);
console.log(`\n${Object.keys(resultat).length} cues kontrollerade, ${kvar.length} fortfarande fel${kvar.length ? `: ${kvar.map(([k]) => k).join(', ')}` : ''}`);
process.exit(kvar.length ? 1 : 0);
