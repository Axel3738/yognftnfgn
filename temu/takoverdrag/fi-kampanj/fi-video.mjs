#!/usr/bin/env node
// Finsk version av taköverdragets SE-videor — ElevenLabs eleven_v3-voiceover (samma finska röst i alla),
// finska captions exakt där de svenska pillren satt (pipeline/no-precis.py), svensk grafik suddad/ersatt
// med finska PNG-lager, ljudspåret BYTT (aldrig svensk röst kvar). Inget HeyGen.
//
//   node temu/takoverdrag/fi-kampanj/fi-video.mjs --arbete <mapp> [--bara NAMN] [--steg tts|bygg|alla]
//
// Läser i <mapp>:  src/<namn>.mp4 (SE-originalen), vo/fi-manus.json (sonnet-subagentens manus),
//                  vo/grafik-fi.json, lager/ (PNG från lager-fi.py), precis/ (konfig per video)
// Skriver:         vo/<namn>.mp3 + .align.json + .fi.srt, ut/FI_<namn>.mp4 (+ QA-ark), resultat.json
//
// Röst: Martti (paqSK057kuKFy1kq3bdZ, finsk, manlig, lugn) — vald 2026-09-18 bland kontots två finska
// röster (Henry Aflecht talar ~12 % långsammare). Alla klipp: eleven_v3, stability 0.5.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const args = process.argv.slice(2);
const val = (f, d = null) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : d; };
const A = path.resolve(val('--arbete', '.'));
const bara = val('--bara');
const steg = val('--steg', 'alla');
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
export const ROST = { id: 'paqSK057kuKFy1kq3bdZ', namn: 'Martti - Calm & relaxed' };
const KEY = process.env.ELEVENLABS_API_KEY;

const sh = (cmd, a, opts = {}) => {
  const r = spawnSync(cmd, a, { encoding: 'utf8', maxBuffer: 1 << 28, ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${a.slice(0, 3).join(' ')}…: ${(r.stderr || r.stdout || '').slice(-800)}`);
  return r.stdout;
};
const dur = (f) => parseFloat(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));

// ---- 1. TTS med tidsstämplar
export async function tts(text, out) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ROST.id}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'xi-api-key': KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ text, model_id: 'eleven_v3', language_code: 'fi', voice_settings: { stability: 0.5, similarity_boost: 0.75, use_speaker_boost: true } }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const j = await res.json();
  writeFileSync(`${out}.mp3`, Buffer.from(j.audio_base64, 'base64'));
  const al = j.alignment;
  writeFileSync(`${out}.align.json`, JSON.stringify({ text, alignment: al }));
  return al;
}

// ---- 2. SRT ur teckenjusteringen: ett block per mening (punkt/utrop/fråga), långa meningar delas vid komma
const srtT = (t) => { const ms = Math.round(t * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000), s = Math.floor(ms % 60000 / 1000), r = ms % 1000; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(r).padStart(3, '0')}`; };
export function srtFranAlign(al, varp = (t) => t, maxLen = 64) {
  const ch = al.characters, st = al.character_start_times_seconds, en = al.character_end_times_seconds;
  const block = []; let cur = [];
  const flush = () => { if (cur.length) { block.push(cur); cur = []; } };
  for (let i = 0; i < ch.length; i++) {
    cur.push(i);
    const c = ch[i];
    const text = cur.map((k) => ch[k]).join('');
    if (/[.!?…]/.test(c) && (i + 1 >= ch.length || ch[i + 1] === ' ')) flush();
    else if (c === ',' && text.trim().length >= maxLen * 0.6 && !(/\d/.test(ch[i - 1] || '') && /\d/.test(ch[i + 1] || ''))) flush();   // aldrig mitt i "126,90"
    else if (c === ' ' && text.trim().length >= maxLen) flush();
  }
  flush();
  const cues = block.map((idx) => {
    const text = idx.map((k) => ch[k]).join('').trim();
    const first = idx.find((k) => ch[k] !== ' '), last = [...idx].reverse().find((k) => ch[k] !== ' ');
    return { start: varp(st[first]), end: varp(en[last]), text };
  }).filter((c) => c.text);
  return cues.map((c, i) => `${i + 1}\n${srtT(c.start)} --> ${srtT(c.end)}\n${c.text}\n`).join('\n') + '\n';
}

// ---- 2b. Pauser: hitta tystnader i VO:n (silencedetect) och klipp varje > MIN_TYST ner till BEHALL sekunder
const MIN_TYST = 0.30, BEHALL = 0.25;
export function hittaTystnader(fil) {
  const r = spawnSync('ffmpeg', ['-v', 'info', '-i', fil, '-af', `silencedetect=n=-40dB:d=${MIN_TYST}`, '-f', 'null', '-'], { encoding: 'utf8' });
  const ut = []; let start = null;
  for (const m of (r.stderr || '').matchAll(/silence_(start|end): ([0-9.]+)/g)) {
    if (m[1] === 'start') start = parseFloat(m[2]); else if (start != null) { ut.push([start, parseFloat(m[2])]); start = null; }
  }
  if (start != null) ut.push([start, dur(fil)]);           // tystnad ända till slutet
  return ut;
}
export function klippPlan(tystnader, langd) {
  const klipp = [];
  for (const [a, b] of tystnader) {
    if (b >= langd - 0.02) klipp.push([Math.max(0, a + 0.10), langd]);       // svansen: behåll 0,10 s
    else if (a <= 0.02) klipp.push([0, Math.max(0, b - 0.10)]);              // inledningen: behåll 0,10 s
    else if (b - a > MIN_TYST) klipp.push([a + BEHALL / 2, b - BEHALL / 2]);
  }
  return klipp;
}
export function varpAv(klipp) {
  return (t) => { let bort = 0; for (const [a, b] of klipp) { if (t >= b) bort += b - a; else if (t > a) { bort += t - a; break; } else break; } return t - bort; };
}
function klippLjud(inn, klipp, out) {
  const uttr = klipp.length ? `not(${klipp.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join('+')})` : '1';
  sh('ffmpeg', ['-y', '-v', 'error', '-i', inn, '-af', `aselect='${uttr}',asetpts=N/SR/TB`, '-ar', '44100', out]);
}

// ---- 3. Ljudet: FI-VO (ev. atempo ≤ 1,10) läggs vid SE-talets start, loudnorm, tystnad runt om, video-längd
function byggLjud(vo, offsetS, tempo, langd, out) {
  const kedja = [`atempo=${tempo.toFixed(4)}`, 'loudnorm=I=-16:TP=-1.5:LRA=11', `adelay=${Math.round(offsetS * 1000)}|${Math.round(offsetS * 1000)}`, 'apad', `atrim=0:${langd.toFixed(3)}`];
  sh('ffmpeg', ['-y', '-v', 'error', '-i', vo, '-af', kedja.join(','), '-ar', '44100', '-ac', '2', '-c:a', 'aac', '-b:a', '160k', out]);
}

async function main() {
  const manus = JSON.parse(readFileSync(`${A}/vo/fi-manus.json`, 'utf8'));
  const seT = JSON.parse(readFileSync(`${A}/vo/se-transkript.json`, 'utf8'));
  const resultatFil = `${A}/resultat.json`;
  const resultat = existsSync(resultatFil) ? JSON.parse(readFileSync(resultatFil, 'utf8')) : {};
  mkdirSync(`${A}/ut`, { recursive: true }); mkdirSync(`${A}/precis`, { recursive: true });
  for (const [namn, m] of Object.entries(manus)) {
    if (bara && namn !== bara) continue;
    const src = `${A}/src/${namn}.mp4`;
    const r = resultat[namn] || {};
    try {
      const langd = dur(src);
      const start = Math.max(0.05, seT[namn].tal_start);
      // --- TTS
      if (steg !== 'bygg') {
        if (!existsSync(`${A}/vo/${namn}.align.json`)) {
          const text = m.manus.trim();
          await tts(text, `${A}/vo/${namn}`);
        }
      }
      const al = JSON.parse(readFileSync(`${A}/vo/${namn}.align.json`, 'utf8')).alignment;
      const raLangd = dur(`${A}/vo/${namn}.mp3`);
      const klipp = klippPlan(hittaTystnader(`${A}/vo/${namn}.mp3`), raLangd);
      const klippt = `${A}/vo/${namn}.klippt.wav`;
      klippLjud(`${A}/vo/${namn}.mp3`, klipp, klippt);
      const voLangd = dur(klippt);
      const varp0 = varpAv(klipp);
      const fri = langd - start - 0.25;
      let tempo = 1;
      if (voLangd > fri) tempo = voLangd / fri;
      if (tempo > 1.10) { r.status = 'FÖR LÅNG'; r.skal = `VO ${voLangd.toFixed(1)} s (rå ${raLangd.toFixed(1)}) ryms inte i ${fri.toFixed(1)} s (tempo ${tempo.toFixed(2)} > 1,10) — korta manuset`; resultat[namn] = r; writeFileSync(resultatFil, JSON.stringify(resultat, null, 1)); console.log(`✗ ${namn}: ${r.skal}`); continue; }
      r.vo_ra_s = +raLangd.toFixed(2); r.vo_s = +voLangd.toFixed(2); r.tempo = +tempo.toFixed(3); r.tecken = m.manus.trim().length; r.pauser_klippta = klipp.length;
      // --- SRT (samma varp som ljudet: pausklipp → tempo → offset)
      const srt = srtFranAlign(al, (t) => varp0(t) / tempo + start);
      writeFileSync(`${A}/vo/${namn}.fi.srt`, srt);
      if (steg === 'tts') { r.status = 'TTS KLAR'; resultat[namn] = r; console.log(`✓ ${namn}: ${voLangd.toFixed(1)} s, tempo ${tempo.toFixed(2)}`); continue; }
      // --- precis-konfig (captions + ev. blur/lager per video)
      const konf = JSON.parse(readFileSync(`${A}/precis/${namn}.json`, 'utf8'));
      konf.in = src; konf.srt = `${A}/vo/${namn}.fi.srt`; konf.ut = `${A}/ut/tmp_${namn}.mp4`; konf.qa = `${A}/ut/qa`;
      for (const L of konf.lager || []) L.png = path.resolve(A, L.png);
      const kf = `${A}/precis/${namn}.kor.json`;
      writeFileSync(kf, JSON.stringify(konf, null, 1));
      const pre = spawnSync('python3', [`${REPO}/pipeline/no-precis.py`, kf], { encoding: 'utf8', maxBuffer: 1 << 26 });
      if (pre.status !== 0) throw new Error(`no-precis: ${(pre.stderr || pre.stdout).slice(-600)}`);
      r.precis = pre.stdout.trim().split('\n').slice(0, 2).join(' | ');
      // --- ljud
      const ljud = `${A}/ut/ljud_${namn}.m4a`;
      byggLjud(klippt, start, tempo, langd, ljud);
      const ut = `${A}/ut/FI_${namn}.mp4`;
      sh('ffmpeg', ['-y', '-v', 'error', '-i', konf.ut, '-i', ljud, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', ut]);
      // --- rostkoll (gratis, bara ffmpeg)
      const rk = spawnSync('python3', [`${REPO}/pipeline/rostkoll.py`, '--kalla', src, '--ny', ut, '--srt', `${A}/vo/${namn}.fi.srt`], { encoding: 'utf8' });
      r.rostkoll = (rk.stdout + rk.stderr).trim().split('\n').slice(-3).join(' | ');
      r.rostkoll_ok = rk.status === 0;
      r.fil = ut; r.langd = +dur(ut).toFixed(2); r.status = rk.status === 0 ? 'KLAR' : 'ROSTKOLL ❌';
      console.log(`${rk.status === 0 ? '✓' : '✗'} ${namn}: VO ${voLangd.toFixed(1)} s, tempo ${tempo.toFixed(2)}, ${r.precis}`);
    } catch (e) {
      r.status = 'FEL'; r.skal = e.message.slice(0, 500); console.log(`✗ ${namn}: ${r.skal}`);
    }
    resultat[namn] = r;
    writeFileSync(resultatFil, JSON.stringify(resultat, null, 1));
  }
}
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) await main();
