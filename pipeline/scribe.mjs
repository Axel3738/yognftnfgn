// Tal till text med ElevenLabs Scribe. Två jobb i samma fil:
//
//   1. **Källmanuset.** För att dubba om en voiceover-video till norska behöver
//      vi den svenska repliken med tider. Den kom förut ur HeyGens proofread —
//      alltså ur det verktyg vi försöker sluta betala för. Scribe ger samma sak
//      på vårt eget ElevenLabs-konto.
//   2. **Röstkontrollen.** En genererad röst läses tillbaka och jämförs med
//      manuset. Avvikelsen ÄR felläsningen. Det var så den danska rösten valdes
//      2026-09-20 (Søren, 0 ordfel av 45) och det är enda sättet att kontrollera
//      ett språk ingen i teamet talar.
//
// Kräver `ELEVENLABS_API_KEY` (alias `XI_API_KEY`) och ffmpeg för ljudspåret —
// `imageio-ffmpeg` räknas som ffmpeg, samma reserv som resten av pipelinen.
//
//   node pipeline/scribe.mjs <fil.mp4|fil.mp3> --sprak sv [--srt ut.srt] [--json]
//
// ⚠️ Scribe hittar på interpunktion men aldrig ord. Står det ett annat ord i
// transkriptet än i manuset har rösten läst fel — det är hela poängen med (2),
// så "städa" aldrig transkriptet innan jämförelsen.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename } from 'node:path';

const API = 'https://api.elevenlabs.io/v1';
const MODELL = 'scribe_v1';

function nyckel() {
  const k = process.env.ELEVENLABS_API_KEY || process.env.XI_API_KEY;
  if (!k) throw new Error('ELEVENLABS_API_KEY saknas i miljön');
  return k;
}

/** ffmpeg-binären: PATH först, annars imageio-ffmpeg (samma som no-captions.py). */
export function ffmpeg() {
  for (const kandidat of ['ffmpeg']) {
    try {
      execFileSync(kandidat, ['-version'], { stdio: 'ignore' });
      return kandidat;
    } catch { /* nästa */ }
  }
  try {
    return execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'],
      { encoding: 'utf8' }).trim();
  } catch {
    throw new Error('ffmpeg saknas (pip install imageio-ffmpeg)');
  }
}

/** Drar ut ljudspåret som mono 16 kHz mp3 — allt Scribe behöver. */
export function ljudspar(video, ut) {
  execFileSync(ffmpeg(), ['-y', '-i', video, '-vn', '-ac', '1', '-ar', '16000',
    '-b:a', '64k', ut], { stdio: 'pipe' });
  return ut;
}

/**
 * Transkriberar en ljud- eller videofil.
 * @returns {Promise<{text:string, ord:Array<{text:string,start:number,slut:number}>}>}
 */
export async function transkribera(fil, { sprak = 'sv' } = {}) {
  if (!existsSync(fil)) throw new Error(`filen finns inte: ${fil}`);
  const fd = new FormData();
  fd.append('file', new Blob([readFileSync(fil)]), basename(fil));
  fd.append('model_id', MODELL);
  fd.append('language_code', sprak);
  fd.append('timestamps_granularity', 'word');
  const r = await fetch(`${API}/speech-to-text`, {
    method: 'POST', headers: { 'xi-api-key': nyckel() }, body: fd,
  });
  if (!r.ok) {
    let d = '';
    try { d = JSON.stringify(await r.json()); } catch { d = await r.text(); }
    throw new Error(`Scribe ${r.status}: ${d.slice(0, 300)}`);
  }
  const j = await r.json();
  const ord = (j.words || [])
    .filter((o) => o.type !== 'spacing')
    .map((o) => ({ text: o.text, start: o.start, slut: o.end }));
  return { text: (j.text || '').trim(), ord };
}

const tid = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  const sek = Math.floor(s % 60), ms = Math.round((s % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:`
       + `${String(sek).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
};

/**
 * Ord med tider → SRT. Bryter på mening, och på paus ≥ `paus` sekunder.
 * Cue-tiderna är källans — de är det `elevenlabs-omdubb.mjs` bygger om filmen
 * kring, så de får aldrig avrundas bort.
 */
export function tillSrt(ord, { maxTecken = 90, paus = 0.55 } = {}) {
  const cues = [];
  let nu = [];
  const stang = () => {
    if (!nu.length) return;
    cues.push({ start: nu[0].start, slut: nu[nu.length - 1].slut, text: nu.map((o) => o.text).join(' ') });
    nu = [];
  };
  for (const o of ord) {
    const langd = nu.reduce((n, x) => n + x.text.length + 1, 0);
    const lucka = nu.length ? o.start - nu[nu.length - 1].slut : 0;
    if (nu.length && (langd + o.text.length > maxTecken || lucka >= paus)) stang();
    nu.push(o);
    if (/[.!?]$/.test(o.text)) stang();
  }
  stang();
  return cues.map((c, i) => `${i + 1}\n${tid(c.start)} --> ${tid(c.slut)}\n${c.text}\n`).join('\n');
}

async function main() {
  const a = process.argv.slice(2);
  const fil = a.find((x) => !x.startsWith('--'));
  const flagga = (n, d = null) => {
    const i = a.indexOf(`--${n}`);
    return i >= 0 ? a[i + 1] : d;
  };
  if (!fil) {
    console.error('Användning: node pipeline/scribe.mjs <fil> --sprak sv [--srt ut.srt] [--json]');
    process.exit(2);
  }
  let ljud = fil;
  if (/\.(mp4|mov|webm|mkv)$/i.test(fil)) {
    ljud = `${process.env.TMPDIR || '/tmp'}/${basename(fil).replace(/\.[^.]+$/, '')}.scribe.mp3`;
    ljudspar(fil, ljud);
  }
  const r = await transkribera(ljud, { sprak: flagga('sprak', 'sv') });
  const srtFil = flagga('srt');
  if (srtFil) {
    writeFileSync(srtFil, tillSrt(r.ord), 'utf8');
    console.error(`SRT skriven: ${srtFil} (${r.ord.length} ord)`);
  }
  if (a.includes('--json')) console.log(JSON.stringify(r, null, 1));
  else console.log(r.text);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(String(e.message || e)); process.exit(1); });
}
