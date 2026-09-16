// apply-srt + render för alla proofread-sessioner i en logg. Skriver state-json.
// node heygen-apply-render.mjs <marknad SE|NO> <loggfil> <srt-mapp> <state.json>
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const [marknad, logg, srtMapp, stateFil] = process.argv.slice(2);
const PIPE = '/home/user/yognftnfgn/pipeline';
const OUT = logg.replace(/-proofread\.log$/, '');
const text = readFileSync(logg, 'utf8');
const block = text.split(/^=== /m).slice(1);
const state = existsSync(stateFil) ? JSON.parse(readFileSync(stateFil, 'utf8')) : {};
const cues = (srt) => srt.replace(/\r/g, '').trim().split(/\n\s*\n/).map((b) => { const r = b.split('\n'); return { tid: r[1], text: r.slice(2).join('\n') }; });
for (const b of block) {
  const namn = b.split('\n')[0].trim();
  const pid = /Proofread-session skapad[^:]*: (\S+)/.exec(b)?.[1];
  if (!pid || !/SRT nedladdad/.test(b)) { console.log(`⏭ ${namn}: proofread inte klar`); continue; }
  if (state[namn]?.vid) { console.log(`♻️ ${namn}: redan renderad ${state[namn].vid}`); continue; }
  const kalla = namn.replace(/^Termoskydd_|^Frontrutetrekk_NO_/, '');
  const nySrt = `${srtMapp}/termoskydd_${kalla}.srt`;
  const fresh = `${OUT}/${namn}-translated.srt`;
  if (!existsSync(nySrt) || !existsSync(fresh)) { console.log(`❌ ${namn}: saknar ${nySrt} eller ${fresh}`); continue; }
  const f = cues(readFileSync(fresh, 'utf8')); const n = cues(readFileSync(nySrt, 'utf8'));
  let ut;
  if (f.length === n.length) ut = f.map((c, i) => `${i + 1}\n${c.tid}\n${n[i].text}`).join('\n\n') + '\n';
  else {
    // HeyGen kräver EXAKT sitt eget antal segment. Fördela manusets meningar
    // över HeyGens cues efter tid: varje mening hamnar i den HeyGen-cue vars
    // tidsintervall täcker meningens starttid (proportionellt inom vår cue).
    const sek = (t) => { const m = /(\d+):(\d+):(\d+)[,.](\d+)/.exec(t); return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000; };
    const span = (tid) => tid.split('-->').map((x) => sek(x.trim()));
    const meningar = [];
    for (const c of n) {
      const [a, b] = span(c.tid);
      const delar = c.text.replace(/\n/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean);
      delar.forEach((d, i) => meningar.push({ t: a + (b - a) * (i / delar.length), text: d }));
    }
    const hink = f.map(() => []);
    for (const m of meningar) {
      let i = f.findIndex((c) => { const [a, b] = span(c.tid); return m.t >= a - 0.05 && m.t < b; });
      if (i === -1) { const st = f.map((c) => span(c.tid)[0]); i = st.reduce((best, s0, k) => (s0 <= m.t ? k : best), 0); }
      hink[i].push(m.text);
    }
    // En tom HeyGen-cue får låna sista meningen från närmaste fyllda granne.
    for (let i = 0; i < hink.length; i += 1) if (!hink[i].length) { const g = hink[i - 1]?.length > 1 ? i - 1 : hink[i + 1]?.length > 1 ? i + 1 : null; if (g !== null) hink[i].push(g < i ? hink[g].pop() : hink[g].shift()); }
    console.log(`⚠️ ${namn}: ${f.length} cues hos HeyGen mot ${n.length} i manuset — omfördelat på HeyGens cues (${hink.map((h) => h.length).join('/')} meningar)`);
    ut = f.map((c, i) => `${i + 1}\n${c.tid}\n${hink[i].join(' ')}`).join('\n\n') + '\n';
  }
  const slut = `${OUT}/${namn}-ny.srt`; writeFileSync(slut, ut);
  const a = spawnSync('node', ['localize.mjs', 'apply-srt', `--id=${pid}`, `--srt=${slut}`], { cwd: PIPE, encoding: 'utf8' });
  console.log(`${namn} apply: ${(a.stdout + a.stderr).trim().split('\n').slice(-2).join(' | ')}`);
  if (a.status !== 0) { state[namn] = { pid, fel: 'apply' }; continue; }
  const r = spawnSync('node', ['localize.mjs', 'render', `--id=${pid}`], { cwd: PIPE, encoding: 'utf8' });
  const vid = /Rendering startad: (\S+)/.exec(r.stdout)?.[1];
  console.log(`${namn} render: ${vid ?? (r.stdout + r.stderr).trim().slice(-200)}`);
  state[namn] = { pid, vid: vid ?? null, srt: slut, fel: vid ? null : 'render' };
  writeFileSync(stateFil, JSON.stringify(state, null, 2));
}
writeFileSync(stateFil, JSON.stringify(state, null, 2));
