// ElevenLabs-omdubb med omtajmad video (Axels beslut 2026-09-16: "klipp, snabbspola
// eller långsamma ner klippen något, klipp bort tomrum i voiceovern").
//
// Idén: manuset (SRT med HeyGens cue-tider) styr. Varje cue läses in av ElevenLabs,
// tystnad i början/slutet klipps bort, och VIDEOSEGMENTET för cuen (från cue-start
// till nästa cue-start i källan) tempo-anpassas så det blir precis så långt som
// repliken + en liten paus. Videon behåller alltså sin klippordning men får ny längd.
// Källans ljud (röst + musik ihopmixat) kastas — resultatet är röst utan musik.
//
//   node elevenlabs-omdubb.mjs --kalla=<källa.mp4> --srt=<manus.srt> --ut=<ut.mp4> \
//        [--rost="Martin - Warm, Confident and Relatable"] [--modell=eleven_v3] \
//        [--vo=<mapp för mp3-cache>] [--syntetisk] [--torr]
//
//   --syntetisk : ingen ElevenLabs — pipton med rimlig längd per cue (test av tajmningen)
//   --torr      : bara tidslinjen, ingen rendering
//
// Skriver <ut>.srt med de NYA cue-tiderna (för pipeline/no-captions.py) och
// <ut>.tidslinje.json. Kräver ffmpeg + ffprobe (shimmen i den här mappen duger).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = /^--([^=]+)(?:=(.*))?$/.exec(a); return m ? [m[1], m[2] ?? true] : [a, true]; }));
const KALLA = args.kalla, SRT = args.srt, UT = args.ut;
if (!KALLA || !SRT || !UT) { console.error('Ange --kalla --srt --ut'); process.exit(2); }
const ROST = args.rost ?? 'Martin - Warm, Confident and Relatable';
const MODELL = args.modell ?? 'eleven_v3';
const VO = args.vo ?? join(dirname(UT), 'vo', basename(UT, '.mp4'));
mkdirSync(VO, { recursive: true });

// Tajmningsregler (sekunder / faktorer)
const PAUS = 0.25;          // luft efter varje replik
const SLUTPAUS = 0.6;       // luft efter sista repliken
const VIDEO_MIN = 0.7;      // videon får saktas ner till 70 % …
const VIDEO_MAX = 1.35;     // … och snabbas upp till 135 %
const VO_MAX_TEMPO = 1.12;  // rösten får snabbas upp max 12 % (hörs knappt)
const TYST_DB = '-42dB';

const kor = (argv, opts = {}) => { const r = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', maxBuffer: 1 << 26, ...opts }); if (r.status !== 0 && !opts.tillat) throw new Error(`${argv[0]} misslyckades: ${r.stderr?.slice(-800)}`); return r; };
const langd = (f) => parseFloat(kor(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f]).stdout.trim());
const tid = (s) => { const m = /(\d+):(\d+):(\d+)[,.](\d+)/.exec(s); return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000; };
const fmt = (t) => { const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = Math.floor(t % 60), ms = Math.round((t % 1) * 1000); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`; };

// 1. Manus
const cues = readFileSync(SRT, 'utf8').replace(/\r/g, '').trim().split(/\n\s*\n/).map((b) => { const r = b.split('\n'); const [a, e] = r[1].split('-->'); return { start: tid(a), slut: tid(e), text: r.slice(2).join(' ').trim() }; }).filter((c) => c.text);
const kallaLangd = langd(KALLA);
console.log(`${basename(KALLA)}: ${kallaLangd.toFixed(2)} s, ${cues.length} cues, röst "${ROST}" (${MODELL})`);

// 2. Röst per cue (cache: <vo>/<i>.mp3 → <i>.wav trimmad)
async function tts(i, text) {
  const mp3 = join(VO, `${i}.mp3`);
  if (existsSync(mp3)) return mp3;
  if (args.syntetisk) {
    // ~14 tecken/sekund svenskt tal — pipton som placeholder
    const d = Math.max(0.6, text.length / 14);
    kor(['ffmpeg', '-y', '-v', 'error', '-f', 'lavfi', '-i', `sine=frequency=330:duration=${d.toFixed(2)}`, '-af', 'apad=pad_dur=0.2', mp3]);
    return mp3;
  }
  const { generateVoiceover } = await import('/home/user/yognftnfgn/voiceover/elevenlabs.mjs');
  const buf = await generateVoiceover(text, { voiceName: ROST, modelId: MODELL });
  writeFileSync(mp3, buf);
  return mp3;
}
const segment = [];
for (let i = 0; i < cues.length; i++) {
  const mp3 = await tts(i, cues[i].text);
  const wav = join(VO, `${i}.wav`);
  // klipp tystnad i början och slutet
  kor(['ffmpeg', '-y', '-v', 'error', '-i', mp3, '-af', `silenceremove=start_periods=1:start_threshold=${TYST_DB}:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=${TYST_DB}:start_silence=0.05,areverse`, '-ar', '44100', '-ac', '2', wav]);
  segment.push({ i, text: cues[i].text, vo: wav, d: langd(wav) });
}

// 3. Tidslinjen: videosegment i = [start_i, start_{i+1}) i källan
let t = 0;
for (let i = 0; i < segment.length; i++) {
  const s = segment[i];
  s.kStart = cues[i].start;
  s.kSlut = i + 1 < cues.length ? cues[i + 1].start : kallaLangd;
  s.L = s.kSlut - s.kStart;
  const paus = i + 1 < segment.length ? PAUS : SLUTPAUS;
  let tempo = 1;
  let mal = s.d + paus;
  let f = s.L / mal;
  if (f < VIDEO_MIN) {            // repliken är för lång för klippet: snabba upp rösten lite först
    tempo = Math.min(VO_MAX_TEMPO, (s.d / (s.L / VIDEO_MIN - paus)));
    if (!(tempo > 1)) tempo = 1;
    mal = s.d / tempo + paus;
    f = Math.max(s.L / mal, VIDEO_MIN * 0.85); // aldrig under ~60 %
  }
  if (f > VIDEO_MAX) f = VIDEO_MAX;   // hellre lite tystnad än superfart
  s.tempo = tempo; s.f = f; s.T = s.L / f; s.dNy = s.d / tempo;
  s.ut = t; t += s.T;
}
const nyLangd = t;
console.log('\n cue | källklipp | replik | video-fart | rösttempo | ny längd | text');
for (const s of segment) console.log(` ${String(s.i + 1).padStart(3)} | ${s.L.toFixed(2).padStart(6)} s | ${s.d.toFixed(2).padStart(5)} s | ${(s.f * 100).toFixed(0).padStart(4)} % | ${(s.tempo * 100).toFixed(0).padStart(4)} % | ${s.T.toFixed(2).padStart(5)} s | ${s.text.slice(0, 48)}`);
console.log(`\nKällan ${kallaLangd.toFixed(2)} s → ny video ${nyLangd.toFixed(2)} s (${((nyLangd / kallaLangd - 1) * 100).toFixed(0)} %)`);
writeFileSync(`${UT}.tidslinje.json`, JSON.stringify({ kalla: KALLA, srt: SRT, rost: ROST, modell: MODELL, kallaLangd, nyLangd, segment }, null, 2));
// Ny SRT med de nya tiderna (captionsteget)
writeFileSync(`${UT}.srt`, segment.map((s, k) => `${k + 1}\n${fmt(s.ut)} --> ${fmt(s.ut + s.dNy)}\n${s.text}\n`).join('\n'));
if (args.torr) { console.log('(torr: ingen rendering)'); process.exit(0); }

// 4. Rendering: video = concat av tempo-anpassade segment, ljud = replikerna på sina platser
const inputs = ['-i', KALLA];
for (const s of segment) inputs.push('-i', s.vo);
const fc = [];
for (const s of segment) fc.push(`[0:v]trim=start=${s.kStart.toFixed(3)}:end=${s.kSlut.toFixed(3)},setpts=(PTS-STARTPTS)/${s.f.toFixed(4)}[v${s.i}]`);
fc.push(`${segment.map((s) => `[v${s.i}]`).join('')}concat=n=${segment.length}:v=1:a=0,fps=30,format=yuv420p[v]`);
for (const s of segment) fc.push(`[${s.i + 1}:a]${s.tempo !== 1 ? `atempo=${s.tempo.toFixed(4)},` : ''}adelay=${Math.round(s.ut * 1000)}|${Math.round(s.ut * 1000)}[a${s.i}]`);
fc.push(`${segment.map((s) => `[a${s.i}]`).join('')}amix=inputs=${segment.length}:normalize=0:dropout_transition=0,apad,atrim=end=${nyLangd.toFixed(3)},loudnorm=I=-16:TP=-1.5:LRA=11[a]`);
kor(['ffmpeg', '-y', '-v', 'error', ...inputs, '-filter_complex', fc.join(';'), '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', UT]);
console.log(`✓ ${UT}  (${langd(UT).toFixed(2)} s)  +  ${UT}.srt`);
