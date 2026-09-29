// dubba.mjs <KOD> <video> — egen röst på vår granskade text: ElevenLabs text-till-tal per segment med
// en KLON av källans svenska AI-röst, i samma tidsfönster som den svenska meningen, ovanpå källans
// bakgrundsljud (demucs no_vocals). Sedan läggs ljudet på textlagret (textlager.py) →
// annonser/klar/<KOD>_<video>.mp4.
//
//   node matstrumpor/marknader/egna/dubba.mjs DE haikuh3 [--om]
//
// Varför inte ElevenLabs dubbning i manuellt läge (mätt 2026-09-29): POST /v1/dubbing med
// mode=manual kräver dubbing_studio=true, och då blir det bara ett studio-projekt — status "dubbed",
// transkriptet bär vår text, men GET /audio/<språk> svarar 404 "There is no dubbing for language"
// och rendering via /v1/dubbing/resource svarar 403 "closed-beta" för kontot. Automatiskt läge
// översätter själv och får aldrig användas. Därför text-till-tal:
//   POST /v1/text-to-speech/{röst}  (previous_text/next_text för sammanhängande prosodi, fast seed)
//   Rösten: RÖST nedan, klonad 2026-09-29 (instant voice cloning) ur de tre källornas isolerade tal.
// Passning: ett klipp får ta tiden fram till nästa segment. Är det längre görs det om med
// voice_settings.speed (≤ 1,2), och är det ändå längre pressas det med atempo (≤ 1,15). Klippen
// cachas i ut/tts/ (nyckel = text + modell + fart), så en omkörning kostar inga tecken.
// Två spärrar: ett textlager byggt på en annan text stoppar sammanfogningen (text_sha), och bara en
// text med "granskad": true blir annonsfil i annonser/klar/ — ett utkast stannar i ut/.
// Kräver ffmpeg, källans demucs-stammar (ut/sep/htdemucs/<video>/, görs av skriptet om de saknas)
// och ELEVENLABS_API_KEY.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const env = { ...process.env, NODE_USE_ENV_PROXY: '1' };
  if (!env.NODE_EXTRA_CA_CERTS && existsSync('/root/.ccr/ca-bundle.crt')) env.NODE_EXTRA_CA_CERTS = '/root/.ccr/ca-bundle.crt';
  const r = spawnSync(process.execPath, ['--no-warnings', ...process.argv.slice(1)], { stdio: 'inherit', env });
  process.exit(r.status ?? 1);
}

const HAR = dirname(fileURLToPath(import.meta.url));
const KLAR = join(HAR, '../annonser/klar');
const API = 'https://api.elevenlabs.io/v1';
export const SPRAKKOD = { NO: 'no', DK: 'da', FI: 'fi', US: 'en', DE: 'de', FR: 'fr', NL: 'nl', ES: 'es', IT: 'it', PL: 'pl', PT: 'pt' };
export const RÖST = 'lRBvixWrjVcBSKxchtgC'; // "Matstrumpor AI-kvinna (klon ur annonserna)"
// Norska finns inte i eleven_multilingual_v2 — där tar v3 med språkkod över.
export const MODELL = { NO: 'eleven_v3' };
const STANDARDMODELL = 'eleven_multilingual_v2';
const MAXFART = 1.2, MAXTEMPO = 1.15;

/** Ren: tidsfönstret per talat segment — från segmentets start till nästa segments start
 *  (strukna segment räknas som gräns, där är det tyst), sista segmentet till slut − 0,15 s. */
export function fonster(manus, lok, langd) {
  const alla = [...manus].sort((x, y) => x.a - y.a);
  return lok.segment.map((s) => {
    const nasta = alla.find((m) => m.a > s.a + 0.001);
    const slut = nasta ? nasta.a : Math.min(langd - 0.15, s.b + 1.5);
    return { a: s.a, max: +(slut - s.a).toFixed(3) };
  });
}

/** Ren: vilken fart ett klipp på `d` s behöver för att rymmas i `max` s (1 = orört). */
export function fartFor(d, max) {
  if (d <= max) return 1;
  return Math.min(MAXFART, +((d / max) * 1.03).toFixed(3));
}

/** Ren: CSV-raderna för ElevenLabs manuella läge — ett segment per rad, strukna segment utelämnas. */
export function byggCsv(manus, lok) {
  const q = (x) => `"${String(x).replace(/"/g, '""')}"`;
  const utan = manus.filter((m) => !m.stryk);
  if (utan.length !== lok.segment.length) throw new Error(`${lok.segment.length} segment mot ${utan.length} i manuset`);
  const rader = ['speaker,start_time,end_time,transcription,translation'];
  lok.segment.forEach((s, i) => {
    if (Math.abs(s.a - utan[i].a) > 0.001 || Math.abs(s.b - utan[i].b) > 0.001) throw new Error(`segment ${i + 1}: tiderna skiljer sig från manuset`);
    rader.push([q('Berattare'), q(s.a.toFixed(3)), q(s.b.toFixed(3)), q(utan[i].sv), q(s.text)].join(','));
  });
  return rader.join('\n') + '\n';
}

/** Ren: SRT ur segmenten (för rostkoll.py och lyssna.py). */
export function byggSrt(lok) {
  const tid = (x) => { const ms = Math.round(x * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  return lok.segment.map((s, i) => `${i + 1}\n${tid(s.a)} --> ${tid(s.b)}\n${s.text}\n`).join('\n');
}

async function api(path, opts = {}) {
  const r = await fetch(API + path, { ...opts, headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, ...(opts.headers || {}) } });
  if (!r.ok) throw new Error(`ElevenLabs ${path} → HTTP ${r.status}: ${(await r.text()).slice(0, 400)}`);
  return r;
}

function kor(cmd, args) {
  const r = spawnSync(cmd, args, { maxBuffer: 1 << 28 });
  if (r.status) throw new Error(`${cmd}: ${String(r.stderr).slice(-600)}`);
  return r.stdout;
}
const langdAv = (fil) => parseFloat(String(kor('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', fil])));

/** RMS över ramar med tal (20 ms, över −40 dBFS) — för att lägga klonen på källans nivå. */
function talnivå(fil) {
  const b = kor('ffmpeg', ['-nostdin', '-v', 'error', '-i', fil, '-ac', '1', '-ar', '16000', '-f', 's16le', '-']);
  const x = new Int16Array(b.buffer, b.byteOffset, Math.floor(b.length / 2));
  let sum = 0, n = 0;
  for (let i = 0; i + 320 <= x.length; i += 320) {
    let e = 0; for (let j = i; j < i + 320; j++) e += (x[j] / 32768) ** 2;
    e /= 320; if (e > 1e-4) { sum += e; n++; }
  }
  return n ? Math.sqrt(sum / n) : 0;
}

async function tts(text, lang, modell, fart, prev, next, fil) {
  if (existsSync(fil)) return;
  const kropp = { text, model_id: modell, seed: 29,
    voice_settings: { stability: 0.5, similarity_boost: 0.85, style: 0, use_speaker_boost: true, speed: fart } };
  if (modell !== STANDARDMODELL) kropp.language_code = lang;
  else { if (prev) kropp.previous_text = prev; if (next) kropp.next_text = next; }
  const r = await api(`/text-to-speech/${RÖST}?output_format=mp3_44100_192`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(kropp) });
  const rå = `${fil}.ra.mp3`;
  writeFileSync(rå, Buffer.from(await r.arrayBuffer()));
  // tystnad före och efter bort, så klippet börjar när segmentet börjar
  const tyst = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03';
  kor('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-i', rå, '-af', `${tyst},areverse,${tyst},areverse`, '-ar', '44100', '-ac', '1', fil.replace(/\.mp3$/, '.wav')]);
  kor('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-i', fil.replace(/\.mp3$/, '.wav'), '-b:a', '192k', fil]);
}

async function main() {
  const [kod, video] = [process.argv[2]?.toUpperCase(), process.argv[3]];
  const lang = SPRAKKOD[kod];
  if (!lang || !video) { console.error('node dubba.mjs <KOD> <video>'); process.exit(2); }
  if (!process.env.ELEVENLABS_API_KEY) { console.error('Saknar ELEVENLABS_API_KEY i miljön.'); process.exit(1); }
  const manus = JSON.parse(readFileSync(join(HAR, `${video}.manus.json`), 'utf8'));
  const lokFil = join(HAR, kod, `${video}.json`);
  const lok = JSON.parse(readFileSync(lokFil, 'utf8'));
  const textSha = createHash('sha256').update(readFileSync(lokFil)).digest('hex');
  byggCsv(manus, lok); // kontrollerar att segmenten och tiderna följer manuset
  const bas = join(HAR, 'ut', `${kod}_${video}`);
  mkdirSync(join(HAR, 'ut', 'tts'), { recursive: true });
  writeFileSync(`${bas}.srt`, byggSrt(lok));

  // textlagret först — ingen röst görs på en text som lagret inte bär
  const text = `${bas}.text.mp4`;
  if (!existsSync(text)) throw new Error(`textlagret saknas: ${text} (kör textlager.py först)`);
  const lager = existsSync(`${text}.sha.json`) ? JSON.parse(readFileSync(`${text}.sha.json`, 'utf8')).lok_sha : null;
  if (lager !== textSha) throw new Error(`textlagret ${text} är byggt på en annan text än ${lokFil} — kör textlager.py ${kod} ${video} igen`);

  // källans stammar: bakgrunden (musik, effekter) och talet (för nivån)
  const sep = join(HAR, 'ut', 'sep');
  const stam = join(sep, 'htdemucs', video);
  if (!existsSync(join(stam, 'no_vocals.wav'))) {
    mkdirSync(sep, { recursive: true });
    kor('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-i', join(HAR, 'kalla', `${video}.mp4`), '-vn', '-ac', '2', '-ar', '44100', join(sep, `${video}.wav`)]);
    kor('python3', ['-m', 'demucs', '--two-stems=vocals', '-n', 'htdemucs', '-o', sep, join(sep, `${video}.wav`)]);
  }
  const langd = langdAv(join(HAR, 'kalla', `${video}.mp4`));
  const fon = fonster(manus, lok, langd);
  const modell = MODELL[kod] ?? STANDARDMODELL;
  const logg = [];
  let tecken = 0;
  for (let i = 0; i < lok.segment.length; i++) {
    const s = lok.segment[i];
    const prev = lok.segment.slice(Math.max(0, i - 2), i).map((x) => x.text).join(' ');
    const next = lok.segment[i + 1]?.text ?? '';
    const klipp = (fart) => join(HAR, 'ut', 'tts', `${kod}_${video}_${String(i + 1).padStart(2, '0')}_${createHash('sha256').update(`${modell}|${fart}|${prev}|${s.text}|${next}`).digest('hex').slice(0, 10)}.mp3`);
    let fart = 1, fil = klipp(1);
    if (!existsSync(fil)) tecken += s.text.length;
    await tts(s.text, lang, modell, 1, prev, next, fil);
    let d = langdAv(fil.replace(/\.mp3$/, '.wav'));
    const f = fartFor(d, fon[i].max);
    if (f > 1) {
      fart = f; fil = klipp(f);
      if (!existsSync(fil)) tecken += s.text.length;
      await tts(s.text, lang, modell, f, prev, next, fil);
      d = langdAv(fil.replace(/\.mp3$/, '.wav'));
    }
    let tempo = 1;
    if (d > fon[i].max) tempo = Math.min(MAXTEMPO, +(d / fon[i].max).toFixed(3));
    const wav = fil.replace(/\.mp3$/, '.wav');
    let slutfil = wav;
    if (tempo > 1) { slutfil = wav.replace(/\.wav$/, `.t${tempo}.wav`); kor('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-i', wav, '-af', `atempo=${tempo}`, slutfil]); }
    const dUt = langdAv(slutfil);
    logg.push({ seg: i + 1, a: s.a, max: fon[i].max, d: +dUt.toFixed(2), fart, tempo, over: dUt > fon[i].max + 0.05 });
    lok.segment[i]._fil = slutfil;
  }
  // nivån: klonens tal läggs på källans talnivå, bakgrunden som den var
  const klippNiva = lok.segment.map((s) => talnivå(s._fil)).reduce((x, y) => x + y, 0) / lok.segment.length;
  const kallNiva = talnivå(join(stam, 'vocals.wav'));
  const gain = kallNiva && klippNiva ? Math.min(4, kallNiva / klippNiva) : 1;
  const inn = ['-nostdin', '-y', '-v', 'error', '-i', join(stam, 'no_vocals.wav')];
  const filt = [];
  lok.segment.forEach((s, i) => { inn.push('-i', s._fil); const ms = Math.round(s.a * 1000); filt.push(`[${i + 1}:a]aresample=44100,volume=${gain.toFixed(3)},adelay=${ms}|${ms},aformat=channel_layouts=stereo[v${i}]`); });
  filt.push(`[0:a]${lok.segment.map((_, i) => `[v${i}]`).join('')}amix=inputs=${lok.segment.length + 1}:duration=first:normalize=0,alimiter=limit=0.95[ut]`);
  const dub = `${bas}.dub.m4a`;
  kor('ffmpeg', [...inn, '-filter_complex', filt.join(';'), '-map', '[ut]', '-c:a', 'aac', '-b:a', '192k', dub]);
  writeFileSync(`${bas}.dub.json`, JSON.stringify({ vag: 'tts', rost: RÖST, modell, text_sha: textSha, gain: +gain.toFixed(3), tecken_denna_korning: tecken, segment: logg, skapad: new Date().toISOString() }, null, 1));
  const over = logg.filter((x) => x.over);
  console.log(`${kod} ${video}: ${logg.length} segment, modell ${modell}, ${tecken} nya tecken, fart>1 på ${logg.filter((x) => x.fart > 1).length}, atempo på ${logg.filter((x) => x.tempo > 1).length}${over.length ? `, ⚠️ ${over.length} går över fönstret: ${over.map((x) => x.seg).join(', ')}` : ''}`);

  const ut = `${bas}.mp4`;
  kor('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-i', text, '-i', dub, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', ut]);
  // bara granskad text blir en annonsfil — ett utkast (t.ex. piloten) stannar i ut/
  if (lok.granskad !== true) { console.log(`utkast (granskad ≠ true): ${ut} — inte till annonser/klar/`); return; }
  mkdirSync(KLAR, { recursive: true });
  copyFileSync(ut, join(KLAR, `${kod}_${video}.mp4`));
  console.log(`klar: ${join(KLAR, `${kod}_${video}.mp4`)}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
