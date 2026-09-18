// status --wait + download för alla renderade i state. node heygen-hamta.mjs <state.json> <utmapp>
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const [stateFil, ut] = process.argv.slice(2);
const PIPE = '/home/user/yognftnfgn/pipeline';
const state = JSON.parse(readFileSync(stateFil, 'utf8'));
for (const [namn, s] of Object.entries(state)) {
  if (!s.vid) continue;
  if (s.fil && existsSync(s.fil)) { console.log(`♻️ ${namn} hämtad`); continue; }
  // HeyGen svarar "failed" + "video pending moderation by our team" när en
  // rendering ligger hos deras moderering — det är en väntan, inte ett fel
  // (docs/video-localization.md: släpptes efter ~30 min). Polla upp till 90 min.
  let status = null; let msg = '';
  for (let f = 0; f < 90; f += 1) {
    const st = spawnSync('node', ['localize.mjs', 'status', `--id=${s.vid}`], { cwd: PIPE, encoding: 'utf8' });
    status = /"status": "(\w+)"/.exec(st.stdout)?.[1]; msg = /"failure_message": "([^"]*)"/.exec(st.stdout)?.[1] ?? '';
    if (status === 'success') break;
    if (status === 'failed' && !/moderation/i.test(msg)) break;
    await new Promise((r) => setTimeout(r, 60_000));
  }
  console.log(`${namn}: ${status}${msg ? ` (${msg})` : ''}`);
  if (status !== 'success') { s.fel = `status ${status} ${msg}`; writeFileSync(stateFil, JSON.stringify(state, null, 2)); continue; }
  const d = spawnSync('node', ['localize.mjs', 'download', `--id=${s.vid}`, `--out=${ut}`], { cwd: PIPE, encoding: 'utf8' });
  const fil = /Sparad: (\S+)/.exec(d.stdout)?.[1];
  s.fil = fil ? (fil.startsWith('/') ? fil : `${PIPE}/${fil}`) : null;
  console.log(`  ${s.fil ?? (d.stdout + d.stderr).slice(-200)}`);
  writeFileSync(stateFil, JSON.stringify(state, null, 2));
}
