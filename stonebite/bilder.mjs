#!/usr/bin/env node
// bilder.mjs — genererar den publika sidans bilder via kie.ai och lägger dem
// i stonebite/webb/bilder/. Läser stonebite/bilder.json.
//
//   node stonebite/bilder.mjs            # bara de som saknas
//   node stonebite/bilder.mjs --igen hero   # gör om en bild (kostar en credit)
//   node stonebite/bilder.mjs --torr     # visa planen, anropa inget
//
// Bilderna committas — sajten har inga externa anrop, så de måste ligga i
// repot. JPEG från kie.ai landar på ~130 kB vid 1248 px, det räcker för en
// hero. Det finns ingen bildbehandling i containern (varken ffmpeg, Pillow
// eller sharp), så filen används som den kommer. Kräver KIE_API_KEY.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { skapaJobb, vantaPaJobb } from '../bildannonser/kie.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const MAPP = join(HAR, 'webb', 'bilder');
const KONFIG = JSON.parse(readFileSync(join(HAR, 'bilder.json'), 'utf8'));

const arg = process.argv.slice(2);
const torr = arg.includes('--torr');
const igen = new Set();
for (let i = 0; i < arg.length; i++) if (arg[i] === '--igen' && arg[i + 1]) igen.add(arg[i + 1]);

mkdirSync(MAPP, { recursive: true });

let gjorda = 0;
for (const bild of KONFIG.bilder) {
  const fil = join(MAPP, `${bild.id}.jpg`);
  if (existsSync(fil) && !igen.has(bild.id)) {
    console.log(`⏭  ${bild.id}.jpg finns redan`);
    continue;
  }
  if (torr) {
    console.log(`🧪 ${bild.id} (${bild.format}) — skulle genereras`);
    continue;
  }
  const { taskId } = await skapaJobb({
    prompt: bild.prompt,
    bildformat: bild.format,
    filformat: 'jpeg',
    modell: KONFIG.modell,
  });
  process.stdout.write(`⏳ ${bild.id} (${taskId}) …`);
  const status = await vantaPaJobb(taskId, { intervallMs: 4000, timeoutMs: 300000 });
  const svar = await fetch(status.urler[0]);
  if (!svar.ok) throw new Error(`Kunde inte hämta ${bild.id}: HTTP ${svar.status}`);
  const buf = Buffer.from(await svar.arrayBuffer());
  writeFileSync(fil, buf);
  console.log(` klar, ${Math.round(buf.length / 1024)} kB`);
  gjorda++;
}
console.log(`${gjorda} bilder genererade → ${MAPP}`);
