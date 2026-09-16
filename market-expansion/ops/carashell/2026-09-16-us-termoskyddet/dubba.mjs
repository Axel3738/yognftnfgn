#!/usr/bin/env node
// dubba.mjs — termoskyddets 12 SE-videor → amerikansk engelska med ElevenLabs
// (samma väg som SE/NO-omdubben 2026-09-16 kväll: pipeline/omdubb/elevenlabs-omdubb.mjs,
// repliken styr klipplängden) + engelska captions i bandet (pipeline/no-captions.py)
// + röstkoll (pipeline/rostkoll.py --omtajmad).
//
//   node market-expansion/ops/carashell/2026-09-16-us-termoskyddet/dubba.mjs [--torr] [--bara CS_1,PD_2]
//
// Läser  oversatt-output.json (subagentens engelska rader, cue-tiderna ur SE-videons SRT)
//        se/CaraShellFront_<X>.mp4 (OPS-kontots SE-videor, 720×1280, svenska captions i bandet)
// Skriver us/CaraShellFront_US_<X>.srt (manus till ElevenLabs), us/<namn>.dub.mp4 (utan captions),
//        us/<namn>.mp4 (med captions = den som laddas upp), us/<namn>.mp4.qa-N.png, resultat-dubb.json
// Röstcachen (mp3/wav) ligger UTANFÖR repot (scratchpad) — den ska aldrig committas.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { voText, captionText } from './dubba-text.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..', '..', '..');
const args = process.argv.slice(2);
const TORR = args.includes('--torr');
const baraIdx = args.indexOf('--bara');
const BARA = baraIdx >= 0 ? args[baraIdx + 1].split(',').map((s) => s.trim()) : null;
const ut = JSON.parse(readFileSync(join(HAR, 'oversatt-output.json'), 'utf8'));
const ROST = ut.rost;
const VO_ROT = process.env.VO_ROT || '/tmp/claude-0/-home-user-yognftnfgn/300cb0d9-2208-5742-9d8d-2cce375a61f0/scratchpad/vo';
// Bandet: SE-videornas vita captionruta sitter på rad ~954–1045 av 1280 (mätt 2026-09-16,
// 2 fps-skanning); 940:1084 täcker den med marginal och rymmer två rader à 31 px.
const BAND = '940:1084';
// CS_3: SE-versionen fick bandet 885:1084 (källans captions gick på två rader upp till
// rad 885) — med 940:1084 flaggade no-captions.py "text ovanför bandet (rad 880–936, 26 %)".
// PD_1–3 flaggade samma sak, och med 860:1084 flyttade flaggan bara med (rad 800–856, 61 %):
// det är det silvriga täcket som fyller bilden, inte text — kollen är en OCR-flagga, inte en
// dom (FAS2 2026-09-16). Ögonläst i qa/pd-remsor.png, se GRANSKAD_OK.
const BAND_PER_VIDEO = { CS_3: '880:1084' };
// Videor där kollen "text ovanför bandet" ögonlästs som falskt larm (bara ljusa fotoytor).
const GRANSKAD_OK = new Set(['PD_1', 'PD_2', 'PD_3']);
mkdirSync(join(HAR, 'us'), { recursive: true });

const kor = (argv, opts = {}) => spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'pipe'], ...opts });
const resultat = existsSync(join(HAR, 'resultat-dubb.json')) ? JSON.parse(readFileSync(join(HAR, 'resultat-dubb.json'), 'utf8')) : {};

for (const [mal, v] of Object.entries(ut.videor)) {
  const se = mal.replace('_US_', '_');
  const kort = se.replace('CaraShellFront_', '');
  if (BARA && !BARA.includes(kort)) continue;
  const kalla = join(HAR, 'se', `${se}.mp4`);
  if (!existsSync(kalla)) { resultat[mal] = { status: 'FEL', skal: `källa saknas: ${kalla}` }; console.log(`${mal}: källa saknas`); continue; }
  // 1. Engelskt manus med SE-videons cue-tider
  const srt = join(HAR, 'us', `${mal}.srt`);
  const svenskt = v.cues.filter((c) => /[åäöÅÄÖ]|\bkr\b|kronor/.test(c.en));
  if (svenskt.length) { resultat[mal] = { status: 'FEL', skal: `svenska kvar i manuset: ${svenskt.map((c) => c.en).join(' | ')}` }; console.log(`${mal}: svenska kvar`); continue; }
  const siffror = v.cues.filter((c) => /\d|\$/.test(c.en));
  if (siffror.length) { resultat[mal] = { status: 'FEL', skal: `siffror/dollartecken i manuset (ElevenLabs läser fel): ${siffror.map((c) => c.en).join(' | ')}` }; console.log(`${mal}: siffror i manus`); continue; }
  // Rösten läser "CaraShell" som "Caroshell" (Scribe-mätt 2026-09-16 med Chris); "Cara Shell"
  // i två ord hörs som "Carashell". Namnet "Per" läses som "pur" (prepositionen) — "Pair" ger
  // det svenska uttalet (Scribe: "Pair" 2 av 2). VO-manuset bär uttalsformerna, captions originalen.
  writeFileSync(srt, v.cues.map((c, i) => `${i + 1}\n${c.start} --> ${c.slut}\n${voText(c.en)}\n`).join('\n'));
  const dub = join(HAR, 'us', `${mal}.dub.mp4`);
  const cap = join(HAR, 'us', `${mal}.mp4`);
  const vo = join(VO_ROT, mal);
  console.log(`\n=== ${mal} (${v.cues.length} cues)`);
  // 2. Tidslinje (torr) — ⚠️ = manuset för långt för filmen
  const t = kor(['node', join(ROT, 'pipeline', 'omdubb', 'elevenlabs-omdubb.mjs'), `--kalla=${kalla}`, `--srt=${srt}`, `--ut=${dub}`, `--rost=${ROST}`, `--vo=${vo}`, '--torr']);
  process.stdout.write(t.stdout);
  if (t.status !== 0) { resultat[mal] = { status: 'FEL', steg: 'torr', skal: (t.stderr || '').slice(-600) }; console.log(t.stderr.slice(-600)); continue; }
  const varning = /⚠️/.test(t.stdout);
  if (TORR) { resultat[mal] = { status: 'TORR', varning, srt: `us/${mal}.srt` }; continue; }
  // 3. Rendering
  const r = kor(['node', join(ROT, 'pipeline', 'omdubb', 'elevenlabs-omdubb.mjs'), `--kalla=${kalla}`, `--srt=${srt}`, `--ut=${dub}`, `--rost=${ROST}`, `--vo=${vo}`]);
  if (r.status !== 0 || !existsSync(dub)) { resultat[mal] = { status: 'FEL', steg: 'render', skal: (r.stderr || r.stdout || '').slice(-600) }; console.log(`${mal}: render FEL ${(r.stderr || '').slice(-400)}`); continue; }
  const langd = /ny video ([\d.]+) s/.exec(r.stdout)?.[1];
  // 3b. Captionmanuset får brandet i ett ord igen (VO-formen "Cara Shell" är bara för rösten)
  writeFileSync(`${dub}.srt`, captionText(readFileSync(`${dub}.srt`, 'utf8')));
  // 3c. Uttalskoll med Scribe per cue-mp3 (samma metod som SE/NO-omgången): ordjämförelse mot manuset
  const scribe = [];
  for (let i = 0; i < v.cues.length; i++) {
    const mp3 = join(vo, `${i}.mp3`);
    if (!existsSync(mp3) || !process.env.ELEVENLABS_API_KEY) continue;
    const s = kor(['curl', '-sS', '-m', '90', 'https://api.elevenlabs.io/v1/speech-to-text', '-H', `xi-api-key: ${process.env.ELEVENLABS_API_KEY}`, '-F', 'model_id=scribe_v1', '-F', 'language_code=en', '-F', `file=@${mp3}`]);
    let hort = '';
    try { hort = JSON.parse(s.stdout).text ?? ''; } catch { hort = '(scribe svarade inte)'; }
    // Scribe skriver tal som siffror ("83 by 67") och namnet Per som "Pair" — de räknas inte som fel.
    const norm = (t) => String(t).toLowerCase().replace(/cara ?shell/g, 'carashell').replace(/\bpair\b/g, 'per').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w && !/^(eighty|three|sixty|seven|ninety|nine|one|hundred|twenty|four|fourteen|by)$/.test(w));
    const manus = norm(v.cues[i].en), hordes = norm(hort);
    const saknas = manus.filter((w) => !hordes.includes(w));
    scribe.push({ cue: i + 1, manus: v.cues[i].en, hort, saknas });
  }
  const uttalsfel = scribe.filter((s) => s.saknas.length);
  if (uttalsfel.length) console.log(`   ⚠ Scribe: ${uttalsfel.map((s) => `cue ${s.cue} saknar "${s.saknas.join(' ')}" (hörde: ${s.hort})`).join(' · ')}`);
  // 4. Captions i bandet (engelska), QA-bilder
  const band = BAND_PER_VIDEO[kort] ?? BAND;
  const c = kor(['python3', join(ROT, 'pipeline', 'no-captions.py'), dub, `${dub}.srt`, cap, `--band=${band}`, '--font-px=31', '--max-chars=30'], { stdio: ['ignore', 'pipe', 'pipe'] });
  const capOk = (c.status === 0 || (c.status === 3 && GRANSKAD_OK.has(kort))) && existsSync(cap);
  // 5. Röstkoll mot källan (SE-videon), omtajmad med flit
  const k = kor(['python3', join(ROT, 'pipeline', 'rostkoll.py'), '--kalla', kalla, '--ny', cap, '--srt', `${dub}.srt`, '--kallsrt', srt, '--omtajmad', '--json']);
  let rost = null;
  try { rost = JSON.parse(k.stdout); } catch { rost = { raw: (k.stdout || k.stderr || '').slice(-400) }; }
  resultat[mal] = {
    status: capOk && k.status === 0 ? 'OK' : 'FEL',
    varning, langd_s: langd ? Number(langd) : null, srt: `us/${mal}.srt`, fil: `us/${mal}.mp4`,
    captions: { exit: c.status, band, ogonlast_ok: c.status === 3 && GRANSKAD_OK.has(kort), utskrift: (c.stderr || c.stdout || '').trim().split('\n').slice(-3).join(' | ') },
    rostkoll: { exit: k.status, resultat: rost },
    scribe: { cues: scribe.length, avvikelser: uttalsfel },
  };
  console.log(`${mal}: ${resultat[mal].status} · ${langd} s · captions exit ${c.status} · röstkoll exit ${k.status}`);
  writeFileSync(join(HAR, 'resultat-dubb.json'), JSON.stringify(resultat, null, 2));
}
writeFileSync(join(HAR, 'resultat-dubb.json'), JSON.stringify(resultat, null, 2));
const fel = Object.entries(resultat).filter(([, r]) => r.status === 'FEL');
console.log(`\nKlart: ${Object.values(resultat).filter((r) => r.status === 'OK').length} OK, ${fel.length} FEL${fel.length ? ` (${fel.map(([n]) => n).join(', ')})` : ''}`);
