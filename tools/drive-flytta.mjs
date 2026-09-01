#!/usr/bin/env node
// Flyttar Drive-mappar via Drive-brevlådan (Apps Script-webbappen i
// tools/drive-brevlada.gs — installationen står där).
//
//   DRIVE_UPLOAD_URL=... DRIVE_UPLOAD_KEY=... \
//   node tools/drive-flytta.mjs --till=<mapp-id> <mapp-id> [mapp-id …]
//   node tools/drive-flytta.mjs --lista=<mapp-id>
//
// Varför inte connectorn: nattrutinen kör med enbart Bash och filverktyg —
// inga mcp__*-verktyg finns i dess allowed_tools, så Google Drive-connectorn
// existerar inte där. Webbappen körs som Axels eget konto och har därför
// organiseringsrätt i Products och LAUNCHED även när redigeraren äger
// produktmappen. curl används för att slippa Node-proxystrul.
//
// Idempotent: en mapp som redan ligger i målet rapporteras som "redan där".

import { execFileSync } from 'node:child_process';

const URL = process.env.DRIVE_UPLOAD_URL;
const KEY = process.env.DRIVE_UPLOAD_KEY;
if (!URL || !KEY) {
  console.error('Sätt DRIVE_UPLOAD_URL + DRIVE_UPLOAD_KEY i miljön (se tools/drive-brevlada.gs).');
  process.exit(2);
}

function anrop(params) {
  const q = Object.entries({ key: KEY, ...params })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  const ut = execFileSync('curl', ['-sSL', '--max-time', '120', `${URL}?${q}`], { maxBuffer: 1e7 }).toString();
  let j;
  try { j = JSON.parse(ut); }
  catch { throw new Error('oväntat svar från webbappen: ' + ut.slice(0, 200)); }
  if (!j.ok) throw new Error(j.fel || JSON.stringify(j).slice(0, 200));
  return j;
}

const args = process.argv.slice(2);
const lista = (args.find(a => a.startsWith('--lista=')) || '').slice(8);
const till = (args.find(a => a.startsWith('--till=')) || '').slice(7);
const mappar = args.filter(a => !a.startsWith('--'));

if (lista) {
  try {
    for (const m of anrop({ action: 'lista', folderId: lista }).mappar) {
      console.log(`${m.id}\t${m.namn}`);
    }
  } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
  process.exit(0);
}

if (!till || !mappar.length) {
  console.error('Användning: node tools/drive-flytta.mjs --till=<mapp-id> <mapp-id …>');
  console.error('        el: node tools/drive-flytta.mjs --lista=<mapp-id>');
  process.exit(2);
}

let fel = 0;
for (const id of mappar) {
  try {
    const j = anrop({ action: 'flytta', fileId: id, till });
    console.log(j.redan ? `= ${j.namn} (låg redan i målmappen)` : `✓ ${j.namn} → ${till}`);
  } catch (e) { console.error(`✗ ${id}: ${e.message}`); fel++; }
}
process.exit(fel ? 1 : 0);
