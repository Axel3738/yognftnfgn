#!/usr/bin/env node
// Genererar startsidans collagebilder via kie.ai ur collage.json.
//
//   node matstrumpor/marknader/collage/bilder.mjs          # bara de som saknas
//   node matstrumpor/marknader/collage/bilder.mjs --igen se  # gör om en bild
//   node matstrumpor/marknader/collage/bilder.mjs --torr   # visa planen
//
// Bilderna committas i bilder/ — de är källan som tema.mjs laddar upp.
// Kräver KIE_API_KEY. Jobben körs parallellt (kie kör ändå asynkront).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { skapaJobb, vantaPaJobb } from '../../../bildannonser/kie.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const MAPP = join(HAR, 'bilder');
const K = JSON.parse(readFileSync(join(HAR, 'collage.json'), 'utf8'));

const arg = process.argv.slice(2);
const torr = arg.includes('--torr');
const igen = new Set();
for (let i = 0; i < arg.length; i++) if (arg[i] === '--igen' && arg[i + 1]) igen.add(arg[i + 1]);

mkdirSync(MAPP, { recursive: true });

const jobb = [
  { id: K.karta.id, prompt: `${K.karta.prompt}` },
  ...K.rutor.map((r) => ({ id: r.id, prompt: `${r.prompt} ${K.stil}` })),
];

async function gor(j) {
  const fil = join(MAPP, `${j.id}.jpg`);
  if (existsSync(fil) && !igen.has(j.id)) return `⏭  ${j.id}.jpg finns redan`;
  if (torr) return `🧪 ${j.id} — skulle genereras`;
  const { taskId } = await skapaJobb({
    prompt: j.prompt, referensBilder: K.referenser, bildformat: '1:1', filformat: 'jpeg', modell: K.modell,
  });
  const status = await vantaPaJobb(taskId, { intervallMs: 5000, timeoutMs: 600000 });
  const svar = await fetch(status.urler[0]);
  if (!svar.ok) throw new Error(`${j.id}: HTTP ${svar.status}`);
  const buf = Buffer.from(await svar.arrayBuffer());
  writeFileSync(fil, buf);
  return `✓ ${j.id}.jpg ${Math.round(buf.length / 1024)} kB (${taskId})`;
}

const utfall = await Promise.allSettled(jobb.map(gor));
let fel = 0;
utfall.forEach((u, i) => {
  if (u.status === 'fulfilled') console.log(u.value);
  else { fel++; console.log(`✗ ${jobb[i].id}: ${u.reason?.message ?? u.reason}`); }
});
if (fel) process.exit(1);
