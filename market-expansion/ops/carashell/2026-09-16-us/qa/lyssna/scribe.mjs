// scribe.mjs — "lyssna"-kontrollen på de amerikanska dubbarna: ElevenLabs Scribe
// transkriberar det renderade ljudet och ordjämförs mot dubbmanuset (srt-us).
// Mäter uttal/tappade ord som ffmpeg inte hör (FAS2-lärdomen från termoskyddet).
//   node qa/lyssna/scribe.mjs GT_2_H1 PD_2_H1 …
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
const KEY = process.env.ELEVENLABS_API_KEY; if (!KEY) throw new Error('ELEVENLABS_API_KEY saknas');
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
for (const n of process.argv.slice(2)) {
  const mp4 = `video/render/carashell_${n}.mp4`, mp3 = `qa/lyssna/${n}.mp3`;
  if (!existsSync(mp3)) execSync(`ffmpeg -y -nostdin -v error -i ${mp4} -vn -ac 1 -ar 16000 -b:a 64k ${mp3} </dev/null`);
  const fd = new FormData(); fd.append('file', new Blob([readFileSync(mp3)], { type: 'audio/mpeg' }), `${n}.mp3`); fd.append('model_id', 'scribe_v1'); fd.append('language_code', 'en');
  const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': KEY }, body: fd });
  const j = await r.json(); if (!r.ok) { console.log(n, 'FEL', r.status, JSON.stringify(j).slice(0, 200)); continue; }
  const hört = norm(j.text || '');
  const manus = norm(readFileSync(`video/srt-us/carashell_${n}.srt`, 'utf8').split('\n').filter((l) => l && !/^\d+$/.test(l) && !/-->/.test(l)).join(' '));
  const mw = manus.split(' '), hw = new Set(hört.split(' '));
  const saknas = mw.filter((w) => !hw.has(w));
  console.log(`\n=== ${n} · manus ${mw.length} ord · hört ${hört.split(' ').length} ord · saknade manusord: ${saknas.length} (${(100 * saknas.length / mw.length).toFixed(0)} %)`);
  console.log('HÖRT:', hört); if (saknas.length) console.log('SAKNAS:', saknas.join(' '));
}
