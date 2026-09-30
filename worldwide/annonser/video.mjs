// video.mjs — de engelska videoannonserna: samma kedja som Bäverbutikens norska (/translate-no,
// Axels beslut 2026-09-29: ElevenLabs, inte HeyGen), med engelskt manus och engelsk röst.
//
//   node worldwide/annonser/video.mjs                    # torrt: vilka videor, vilket manus, hur många tecken
//   node worldwide/annonser/video.mjs --skarpt           # rendera alla med manus (DRAR ElevenLabs-tecken)
//   node worldwide/annonser/video.mjs --skarpt --bara Sotarset_PD_1_H2 [--rost "<namn>"]
//
// Per video (källan = MagiBorstens svenska annons, hämtad till --kallor):
//   1. manus-en/<fil>.srt  engelska repliker, samma cues och tider som transkript/<fil>.srt
//      (Whisper lokalt → sonnet mot REGLER-VIDEO.md)
//   2. pipeline/omdubb/elevenlabs-omdubb.mjs  röst per cue, filmen tempo-anpassad, källans ljud bort
//   3. pipeline/no-captions.py (bandläget)     suddar källans textband över hela bredden och
//                                               bränner in de engelska replikerna (--rutor: bara rutan)
//      ⚠️ Text utanför bandet (checklistor, prisskyltar i bild, som Batmotor_SP_1_H5) stoppar
//      med exit 3 — den videon behöver pipeline/textboxar.py + textbyte.py, inte den här kedjan.
//   4. pipeline/rostkoll.py                     tyst spår, längddrift, avhugget slut, tappat tal
// En video med ❌ i röstkollen eller exit ≠ 0 i något steg blir aldrig "klar" i media.json.
//
// ⚠️ ElevenLabs-kvoten: mätt 2026-09-30 06:30 — 89 019 av 100 017 tecken använda (Creator,
// nollställs ~23 okt), och /translate-no (04:15 varje natt) drar från samma konto. Alla 60 videor
// behöver ~25 000 tecken. Skriptet räknar tecknen före körningen och vägrar om kvoten inte räcker.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ROT = dirname(fileURLToPath(import.meta.url));
const REPO = join(ROT, '..', '..');
const U = JSON.parse(readFileSync(join(ROT, '..', 'urval.json'), 'utf8'));
const lasJson = (f, def) => (existsSync(join(ROT, f)) ? JSON.parse(readFileSync(join(ROT, f), 'utf8')) : def);
const log = (s) => console.log(s);
export const filnamn = (namn) => namn.replace(/[^A-Za-z0-9_.-]+/g, '_');
export const STANDARDROST = 'CJ - Young Swedish Male';
export const ROST_BESLUT = 'Engelska med svensk brytning (ElevenLabs "CJ - Young Swedish Male", finns på kontot) — sessionens val för vinkeln "A Swedish brand". Alternativet är "Chris - Charming, Down-to-Earth" (amerikansk). Axel väljer efter provvideorna.';

/** Repliktexten ur en SRT (för teckenräkningen). */
export function srtText(srt) {
  return String(srt).replace(/\r/g, '').split(/\n\n+/).map((b) => b.split('\n').slice(2).join(' ').trim()).filter(Boolean);
}

/** Samma cues och tider i manus som i källan? */
export function sammaTider(kallSrt, manusSrt) {
  const tider = (s) => [...String(s).matchAll(/\d\d:\d\d:\d\d,\d{3} --> \d\d:\d\d:\d\d,\d{3}/g)].map((m) => m[0]);
  const a = tider(kallSrt), b = tider(manusSrt);
  return a.length === b.length && a.every((t, i) => t === b[i]);
}

function kor(argv) {
  const r = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'pipe'] });
  return { kod: r.status, ut: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

async function kvot() {
  const r = await fetch('https://api.elevenlabs.io/v1/user/subscription', { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '' } });
  const j = await r.json();
  return { anvant: j.character_count, tak: j.character_limit, kvar: j.character_limit - j.character_count };
}

async function huvud() {
  const a = process.argv.slice(2);
  const skarpt = a.includes('--skarpt');
  const bara = a.includes('--bara') ? a[a.indexOf('--bara') + 1] : null;
  const rost = a.includes('--rost') ? a[a.indexOf('--rost') + 1] : STANDARDROST;
  const kallor = a.includes('--kallor') ? a[a.indexOf('--kallor') + 1] : join(ROT, 'kallor');
  const media = lasJson('media.json', {});
  const copy = lasJson('copy-en.json', {});
  // Flera spår (--del k/n) kan köra samtidigt: läs filen igen och skriv bara in den egna posten.
  const spara = (namn) => {
    const pa = lasJson('media.json', {});
    if (namn) pa[namn] = media[namn];
    writeFileSync(join(ROT, 'media.json'), JSON.stringify(namn ? pa : media, null, 1));
  };
  const del = a.includes('--del') ? a[a.indexOf('--del') + 1].split('/').map(Number) : null;
  const videor = U.produkter.filter((p) => !p.under).flatMap((p) => p.annonser.filter((x) => x.typ === 'video').map((x) => ({ ...x, produkt: p.id })));
  const jobb = [];
  let tecken = 0;
  for (const v of videor) {
    if (bara && v.namn !== bara) continue;
    if (del && videor.indexOf(v) % del[1] !== del[0] - 1) continue;
    const f = filnamn(v.namn);
    const kallSrt = join(ROT, 'transkript', `${f}.srt`);
    const manus = join(ROT, 'manus-en', `${f}.srt`);
    const kalla = join(kallor, `${f}.mp4`);
    if (copy[v.namn]?.hoppa) { log(`· ${v.namn}: hoppas (copy-en.json: ${copy[v.namn].hoppa.slice(0, 80)}…)`); continue; }
    if (!existsSync(manus)) { log(`· ${v.namn}: inget engelskt manus än`); continue; }
    if (!sammaTider(readFileSync(kallSrt, 'utf8'), readFileSync(manus, 'utf8'))) { log(`❌ ${v.namn}: manuset har inte källans cues/tider — skriv om det`); continue; }
    const rader = srtText(readFileSync(manus, 'utf8'));
    if (!rader.length) { log(`· ${v.namn}: manuset är tomt (ingen röst i källan) — hoppas`); continue; }
    if (media[v.namn]?.fil && !a.includes('--om')) { log(`✓ ${v.namn}: klar (${media[v.namn].fil})`); continue; }
    tecken += rader.join(' ').length;
    jobb.push({ v, f, kalla, manus });
  }
  log(`\n${jobb.length} videor att rendera, ~${tecken} tecken ElevenLabs, röst "${rost}"`);
  if (!skarpt) return;
  const k = await kvot();
  log(`ElevenLabs: ${k.anvant} av ${k.tak} använda, ${k.kvar} kvar`);
  if (k.kvar < tecken + 2000) { log(`⛔ kvoten räcker inte (${tecken} + 2 000 i marginal för /translate-no). Stopp.`); process.exit(3); }
  const ut = join(ROT, 'klar');
  mkdirSync(ut, { recursive: true });
  for (const { v, f, kalla, manus } of jobb) {
    if (!existsSync(kalla)) { log(`⚠️ ${v.namn}: källan saknas (${kalla}) — hämta med node worldwide/annonser/hamta-kallor.mjs`); continue; }
    const mellan = join(ut, `${f}.dub.mp4`);
    const slut = join(ut, `${filnamn(v.namn)}.mp4`);
    log(`\n─── ${v.namn}`);
    let r = kor(['node', join(REPO, 'pipeline/omdubb/elevenlabs-omdubb.mjs'), `--kalla=${kalla}`, `--srt=${manus}`, `--ut=${mellan}`, `--rost=${rost}`, '--modell=eleven_v3']);
    if (r.kod !== 0 || !existsSync(mellan)) { log(`❌ omdubben: ${r.ut.slice(-600)}`); continue; }
    // Bandläget (hela bredden suddas) är standard här, inte --rutor: mätt 2026-09-30 på
    // Motorhölje_PD_1_H3 lämnade --rutor kanter av källans vita karaoke-rutor med svenska
    // bokstäver ("S…", "…t.") bredvid den engelska texten — och kontrollen såg dem inte.
    // --rutor finns kvar som val (--rutor på video.mjs), men då tittar sessionen på varje ruta.
    r = kor(['python3', join(REPO, 'pipeline/no-captions.py'), mellan, `${mellan}.srt`, slut, ...(a.includes('--rutor') ? ['--rutor'] : [])]);
    if (r.kod !== 0 || !existsSync(slut)) { log(`❌ captions (exit ${r.kod}): ${r.ut.slice(-600)}`); continue; }
    r = kor(['python3', join(REPO, 'pipeline/rostkoll.py'), '--kalla', kalla, '--ny', slut, '--srt', `${mellan}.srt`, '--kallsrt', manus, '--omtajmad']);
    const gron = r.kod === 0 && !/❌/.test(r.ut);
    log(r.ut.split('\n').slice(-6).join('\n'));
    if (!gron) { log(`❌ ${v.namn}: röstkollen — levereras inte`); continue; }
    media[v.namn] = { fil: slut.slice(REPO.length + 1), sha256: createHash('sha256').update(readFileSync(slut)).digest('hex'), rost, granskad: false, qa: [1, 2, 3].map((n) => `${slut}.qa-${n}.png`.slice(REPO.length + 1)) };
    spara(v.namn);
    log(`✅ ${v.namn}: ${media[v.namn].fil} — titta på QA-bilderna, sätt "granskad": true`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}
