#!/usr/bin/env node
// ai-rad.mjs — den lilla inbrända raden "Contains AI-generated content" på
// videor för de engelskspråkiga marknaderna (US, GB, CA, AU, NZ).
//
// Axels beslut 2026-09-21 (docs/os/CS-KLART.md punkt 27): raden läggs på i
// US-översättningssteget, ALDRIG på de svenska eller norska filerna. Den är
// obligatorisk när creativen innehåller en AI-genererad person eller AI-röst,
// frivillig på rena produktanimationer/AI-bild. Briefen säger vilket
// ("AI content: person | voice | image only | none"); saknas raden i briefen
// behandlas videon som person — hellre en rad för mycket än ett brott.
//
//   node tools/ai-rad.mjs <in.mp4> [--ut <ut.mp4>] [--ai person|rost|bild|ingen] [--tvinga] [--torr]
//   node tools/ai-rad.mjs --brief <brief.md>            # läser bara av vad briefen säger
//
// Placeringen: en 9:16-video beskärs till 4:5 i feeden (14,8 % bort upptill
// och nedtill) och Reels-gränssnittet täcker de nedersta ~17,7 %. Raden
// läggs därför på 82,5–84,5 % av höjden — synlig i båda. Liten (1,7 % av
// höjden), vit text med svart halvgenomskinlig platta ⇒ läsbar mot ljus och
// mörk bakgrund. Ingen ny pipeline: en ffmpeg drawtext-rad i samma steg som
// redan renderar de engelska versionerna.

import { existsSync, statSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const TEXT = 'Contains AI-generated content';
/** Marknader som får raden (engelskspråkiga). */
export const MARKNADER_MED_RAD = Object.freeze(['US', 'GB', 'UK', 'CA', 'AU', 'NZ']);
/** Vad briefen kan säga, och om raden är obligatorisk. */
export const AI_INNEHALL = Object.freeze({ person: { obligatorisk: true }, rost: { obligatorisk: true }, bild: { obligatorisk: false }, ingen: { obligatorisk: false } });
/** Radens läge i procent av höjden — innanför både 4:5-beskärningen (≤ 85,2 %) och Reels bottenfält (≥ 82,3 %). */
export const Y_ANDEL = 0.825;
export const FONT_ANDEL = 0.017;

const FONTER = [
  '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
  '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf',
  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  '/usr/share/fonts/TTF/DejaVuSans.ttf',
];

/** "AI content: …"-raden i en brief → person | rost | bild | ingen | null. Engelska och svenska ord. */
export function aiInnehallUr(text) {
  const m = /^\s*(?:\*\*)?(?:AI[- ]?(?:content|innehåll|innehall))(?:\*\*)?\s*:\s*(.+)$/im.exec(String(text ?? ''));
  if (!m) return null;
  const v = m[1].replace(/\*\*/g, '').trim().toLowerCase();
  if (/person|avatar|face|ansikte|människa|manniska|human|presenter/.test(v)) return 'person';
  if (/voice|röst|rost|vo\b|speech|tal\b/.test(v)) return 'rost';
  if (/image|bild|still|animation|render|product only|produkt/.test(v)) return 'bild';
  if (/none|ingen|no ai|inget/.test(v)) return 'ingen';
  return null;
}

/** Ska raden läggas på? Obligatorisk vid person/röst; okänt ⇒ ja (säkra sidan). `tvinga` lägger på den även på bild/ingen. */
export function skaHaRad(ai, { tvinga = false } = {}) {
  if (tvinga) return { ja: true, skal: 'tvingad (--tvinga)' };
  if (!ai) return { ja: true, skal: 'briefen säger inget om AI-innehåll — behandlas som person' };
  const o = AI_INNEHALL[ai]?.obligatorisk;
  return { ja: Boolean(o), skal: o ? `obligatorisk: ${ai}` : `frivillig: ${ai} — utelämnad` };
}

export function font() {
  return FONTER.find((f) => existsSync(f)) ?? null;
}

/** ffmpeg-binären: PATH först, annars imageio-ffmpeg:s (samma reserv som pipeline/no-captions.py). */
export function ffmpegBin() {
  const w = spawnSync('sh', ['-c', 'command -v ffmpeg'], { encoding: 'utf8' });
  if (w.status === 0 && w.stdout.trim()) return w.stdout.trim();
  const p = spawnSync('python3', ['-c', 'import imageio_ffmpeg,sys;sys.stdout.write(imageio_ffmpeg.get_ffmpeg_exe())'], { encoding: 'utf8' });
  if (p.status === 0 && p.stdout.trim()) return p.stdout.trim();
  return null;
}

/**
 * Raden bränns in som en enradig undertext via libass (`subtitles`-filtret) —
 * samma väg som pipeline/localize.mjs använder för captions. drawtext finns
 * inte i imageio-ffmpeg:s statiska binär (mätt 2026-09-21: "No such filter:
 * 'drawtext'"), men libass gör det. ASS räknar i en 288 px hög rityta:
 * FontSize 5 ≈ 1,7 % av höjden, MarginV 44 ≈ 15,3 % från botten ⇒ radens
 * underkant på ~84,7 % och överkant ~82,5 % (innanför 4:5-beskärningen
 * 85,2 % och ovanför Reels bottenfält 82,3 %). Ren: bara strängen.
 */
export const ASS_HOJD = 288;
export const FONTSIZE_ASS = 5;
export const MARGINV_ASS = 44;
export function forceStyle({ font = 'Liberation Sans' } = {}) {
  return `FontName=${font},Bold=0,FontSize=${FONTSIZE_ASS},PrimaryColour=&H00FFFFFF,BorderStyle=4,BackColour=&H70000000,Outline=1,Shadow=0,MarginV=${MARGINV_ASS},MarginL=10,MarginR=10,Alignment=2`;
}

/** SRT-texten: en rad hela videon. Ren. */
export function srtText(text = TEXT) {
  return `1\n00:00:00,000 --> 99:59:59,000\n${text}\n`;
}

/** subtitles-filtret för en SRT-fil. Ren. */
export function subtitlesFilter(srtFil, { font } = {}) {
  const esc = srtFil.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\\'");
  return `subtitles=${esc}:force_style='${forceStyle({ font })}'`;
}

/** Lägger på raden. Returnerar { ut, kommando } eller kastar. */
export function laggPaRad(inFil, { ut = null, torr = false } = {}) {
  if (!existsSync(inFil)) throw new Error(`filen finns inte: ${inFil}`);
  const utFil = ut ?? inFil.replace(/\.mp4$/i, '') + '-ai.mp4';
  const srtFil = utFil.replace(/\.mp4$/i, '') + '.ai-rad.srt';
  const fontNamn = font() && /DejaVu/.test(font()) ? 'DejaVu Sans' : 'Liberation Sans';
  const args = ['-y', '-v', 'error', '-i', inFil, '-vf', subtitlesFilter(srtFil, { font: fontNamn }), '-c:a', 'copy', '-movflags', '+faststart', utFil];
  const kommando = `ffmpeg ${args.map((a) => (/[\s'()]/.test(a) ? `"${a}"` : a)).join(' ')}`;
  if (torr) return { ut: utFil, kommando, torr: true };
  const bin = ffmpegBin();
  if (!bin) throw new Error('ffmpeg saknas — apt-get install -y ffmpeg (eller pip install imageio-ffmpeg)');
  writeFileSync(srtFil, srtText());
  try {
    const r = spawnSync(bin, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    if (r.error?.code === 'ENOENT') throw new Error('ffmpeg saknas — apt-get install -y ffmpeg');
    if (r.status !== 0) throw new Error(`ffmpeg misslyckades (exit ${r.status})`);
    if (!existsSync(utFil) || statSync(utFil).size === 0) throw new Error('ffmpeg skrev ingen fil');
  } finally {
    try { unlinkSync(srtFil); } catch { /* redan borta */ }
  }
  return { ut: utFil, kommando };
}

function huvud(argv) {
  const flagga = (n, s = null) => { const i = argv.indexOf(`--${n}`); return i !== -1 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : s; };
  const finns = (n) => argv.includes(`--${n}`);
  if (flagga('brief')) {
    const ai = aiInnehallUr(readFileSync(flagga('brief'), 'utf8'));
    const s = skaHaRad(ai);
    console.log(JSON.stringify({ ai, rad: s.ja, skal: s.skal }));
    return;
  }
  const inFil = argv.find((a) => !a.startsWith('--') && /\.(mp4|mov|m4v)$/i.test(a));
  if (!inFil) { console.error('Användning: node tools/ai-rad.mjs <in.mp4> [--ut <ut.mp4>] [--ai person|rost|bild|ingen] [--tvinga] [--torr] | --brief <brief.md>'); process.exit(2); }
  const ai = flagga('ai');
  if (ai && !AI_INNEHALL[ai]) { console.error(`✗ --ai ska vara person, rost, bild eller ingen (fick "${ai}")`); process.exit(2); }
  const s = skaHaRad(ai, { tvinga: finns('tvinga') });
  if (!s.ja) { console.log(`ingen rad: ${s.skal}`); return; }
  const r = laggPaRad(inFil, { ut: flagga('ut'), torr: finns('torr') });
  console.log(`${r.torr ? '[--torr] ' : ''}${s.skal} → ${r.ut}`);
  if (r.torr) console.log(r.kommando);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { huvud(process.argv.slice(2)); } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
}
