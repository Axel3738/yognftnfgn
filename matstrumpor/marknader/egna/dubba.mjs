// dubba.mjs <KOD> <video> — ElevenLabs-dubbning i MANUELLT läge: vår granskade text per segment,
// i samma tidsfönster som den svenska, rösten klonad ur källans svenska AI-röst, musiken kvar.
// Sedan läggs dubbens ljud på textlagret (textlager.py) → annonser/klar/<KOD>_<video>.mp4.
//
//   node matstrumpor/marknader/egna/dubba.mjs DE haikuh3 [--status] [--om]
//
// Kräver ELEVENLABS_API_KEY. State i ut/<KOD>_<video>.dub.json (dubbing_id) — körs om utan att
// skapa en ny dubbning; --om skapar en ny. API:t (elevenlabs.io/docs, läst 2026-09-29):
//   POST /v1/dubbing  multipart: file, csv_file, mode=manual, source_lang, target_lang, num_speakers, watermark
//   CSV-kolumner: speaker, start_time, end_time, transcription, translation (sekunder, citattecken)
//   GET  /v1/dubbing/{id}                     → status: dubbing | dubbed | failed (+ error)
//   GET  /v1/dubbing/{id}/audio/{språkkod}    → dubbad mp4 (videoinput) / mp3
// ⚠️ Manuellt läge är "experimental" enligt ElevenLabs. Skrivet innan nyckeln fanns i en session —
// första körningen ska läsas noga (status, error, lyssna.py) innan resten körs.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

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
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

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

async function main() {
  const [kod, video] = [process.argv[2]?.toUpperCase(), process.argv[3]];
  const lang = SPRAKKOD[kod];
  if (!lang || !video) { console.error('node dubba.mjs <KOD> <video>'); process.exit(2); }
  if (!process.env.ELEVENLABS_API_KEY) { console.error('Saknar ELEVENLABS_API_KEY i miljön.'); process.exit(1); }
  const manus = JSON.parse(readFileSync(join(HAR, `${video}.manus.json`), 'utf8'));
  const lok = JSON.parse(readFileSync(join(HAR, kod, `${video}.json`), 'utf8'));
  mkdirSync(join(HAR, 'ut'), { recursive: true });
  const bas = join(HAR, 'ut', `${kod}_${video}`);
  writeFileSync(`${bas}.srt`, byggSrt(lok));
  const stateFil = `${bas}.dub.json`;
  let st = existsSync(stateFil) && !process.argv.includes('--om') ? JSON.parse(readFileSync(stateFil, 'utf8')) : {};
  if (!st.dubbing_id) {
    const fd = new FormData();
    fd.append('file', new Blob([readFileSync(join(HAR, 'kalla', `${video}.mp4`))], { type: 'video/mp4' }), `${video}.mp4`);
    fd.append('csv_file', new Blob([byggCsv(manus, lok)], { type: 'text/csv' }), `${kod}_${video}.csv`);
    for (const [k, v] of Object.entries({ mode: 'manual', source_lang: 'sv', target_lang: lang, num_speakers: '1', watermark: 'false', name: `MATSTRUMP_${kod}_${video}` })) fd.append(k, v);
    const svar = await (await api('/dubbing', { method: 'POST', body: fd })).json();
    st = { dubbing_id: svar.dubbing_id, forvantat_s: svar.expected_duration_sec, skapad: new Date().toISOString(), lang };
    writeFileSync(stateFil, JSON.stringify(st, null, 1));
    console.log(`dubbning skapad ${st.dubbing_id} (${lang}), väntat ${st.forvantat_s} s`);
  }
  for (let i = 0; ; i++) {
    const m = await (await api(`/dubbing/${st.dubbing_id}`)).json();
    if (process.argv.includes('--status')) { console.log(JSON.stringify(m)); return; }
    if (m.status === 'dubbed') break;
    if (m.status === 'failed') throw new Error(`dubbningen föll: ${m.error ?? 'okänt fel'}`);
    if (i % 6 === 0) console.log(`status: ${m.status} …`);
    await sov(10000);
  }
  const b = Buffer.from(await (await api(`/dubbing/${st.dubbing_id}/audio/${lang}`)).arrayBuffer());
  writeFileSync(`${bas}.dub.mp4`, b);
  console.log(`hämtad ${bas}.dub.mp4 (${b.length} byte)`);
  // dubbens ljud på textlagret — videon ur textlager.py, ljudet ur ElevenLabs
  const text = `${bas}.text.mp4`;
  if (!existsSync(text)) throw new Error(`textlagret saknas: ${text} (kör textlager.py först)`);
  const ut = `${bas}.mp4`;
  const r = spawnSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-i', text, '-i', `${bas}.dub.mp4`, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', ut]);
  if (r.status) throw new Error(`ffmpeg: ${r.stderr}`);
  mkdirSync(KLAR, { recursive: true });
  copyFileSync(ut, join(KLAR, `${kod}_${video}.mp4`));
  console.log(`klar: ${join(KLAR, `${kod}_${video}.mp4`)}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
