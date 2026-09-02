#!/usr/bin/env node
// Laddar upp lokala filer till en Drive-mapp via Drive-brevlådan
// (Apps Script-webbappen i tools/drive-brevlada.gs — se installationen där).
//
//   DRIVE_UPLOAD_URL=... DRIVE_UPLOAD_KEY=... \
//   node drive-push.mjs --folder=<drive-mapp-id> <fil1.mp4> [fil2.png ADCOPY_NO_CS.txt …]
//
// Apps Script tar emot ~50 MB per anrop — komprimera större filer först.
// Skickar base64 i POST-kroppen; curl används för att slippa Node-proxystrul.

import { execFileSync } from 'node:child_process';
import { readFileSync, statSync, writeFileSync, rmSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { tmpdir } from 'node:os';

// MIME-typ efter filändelse — videor, bildannonser och adcopy går samma väg.
const MIME = {
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.txt': 'text/plain', '.md': 'text/plain', '.json': 'application/json',
  '.csv': 'text/csv', '.srt': 'text/plain', '.zip': 'application/zip',
};

const URL = process.env.DRIVE_UPLOAD_URL;
const KEY = process.env.DRIVE_UPLOAD_KEY;
if (!URL || !KEY) { console.error('Sätt DRIVE_UPLOAD_URL + DRIVE_UPLOAD_KEY i miljön (se tools/drive-brevlada.gs).'); process.exit(2); }

const args = process.argv.slice(2);
const folder = (args.find(a => a.startsWith('--folder=')) || '').slice(9);
const files = args.filter(a => !a.startsWith('--'));
if (!folder || !files.length) { console.error('Användning: node drive-push.mjs --folder=<mapp-id> <filer…>'); process.exit(2); }

let fel = 0;
for (const f of files) {
  const mb = statSync(f).size / 1e6;
  const b64 = readFileSync(f).toString('base64');
  const tmp = `${tmpdir()}/drive-push-${process.pid}.b64`;
  writeFileSync(tmp, b64);
  const mime = MIME[extname(f).toLowerCase()] || 'application/octet-stream';
  const u = `${URL}?key=${encodeURIComponent(KEY)}&folderId=${encodeURIComponent(folder)}&name=${encodeURIComponent(basename(f))}&mimeType=${encodeURIComponent(mime)}`;
  try {
    // Apps Script svarar 302 → echo-URL som ska hämtas med GET (curl behåller POST
    // vid 302, därför två steg i stället för -L).
    const head = execFileSync('curl', ['-sS', '-X', 'POST', '--data-binary', `@${tmp}`, '-H', 'Content-Type: text/plain', '-o', '/dev/null', '-D', '-', u], { maxBuffer: 1e7 }).toString();
    const loc = (head.match(/^location:\s*(\S+)/im) || [])[1];
    if (!loc) throw new Error('ingen redirect från webbappen: ' + head.split('\n').slice(0, 3).join(' '));
    const res = execFileSync('curl', ['-sSL', loc], { maxBuffer: 1e7 }).toString();
    const j = JSON.parse(res);
    if (!j.ok) throw new Error(j.fel || res.slice(0, 200));
    console.log(`✓ ${basename(f)} (${mb.toFixed(1)} MB) → ${j.id}`);
  } catch (e) { console.error(`✗ ${basename(f)}: ${e.message}`); fel++; }
  finally { rmSync(tmp, { force: true }); }
}
process.exit(fel ? 1 : 0);
