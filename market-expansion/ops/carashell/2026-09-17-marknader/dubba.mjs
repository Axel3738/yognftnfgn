#!/usr/bin/env node
// dubba.mjs — byter TALET i de tre CS-videorna till marknadens pris, utan att röra bilden.
//
// Skillnad mot pipeline/omdubb/elevenlabs-omdubb.mjs (som termoskyddet använde):
// den tajmar om VIDEON efter repliken. Här är uppdraget "ändra inget annat än priset",
// så videon kopieras bit för bit (-c:v copy) och bara ljudspåret byggs om — varje replik
// läggs på ORIGINALETS starttid, hämtad ur Scribes ordtider.
//
//   node dubba.mjs [--marknad NZ] [--bara CS_1_H1] [--torr]
//
// Skriver <marknad>/<namn>.mp4 (nytt ljud, samma bild), <marknad>/<namn>.srt (captions),
// vo-cache i scratchpad, resultat-dubb.json.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { MARKNADER, KODER } from './marknader.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..', '..', '..');
const args = process.argv.slice(2);
const flagga = (f) => { const i = args.indexOf(`--${f}`); return i >= 0 ? args[i + 1] : null; };
const TORR = args.includes('--torr');
const MARKNAD = flagga('marknad');
const BARA = flagga('bara');
const ROST = process.env.DUBB_ROST || 'Chris - Charming, Down-to-Earth';
const MODELL = 'eleven_v3';
const VO_ROT = process.env.VO_ROT || '/tmp/claude-0/-home-user-yognftnfgn/300cb0d9-2208-5742-9d8d-2cce375a61f0/scratchpad/vo-marknader';
const MAX_TEMPO = 1.15;   // rösten får snabbas upp så här mycket för att rymmas i sitt fönster

const manus = JSON.parse(readFileSync(join(HAR, 'manus.json'), 'utf8'));
const videor = Object.keys(manus).filter((k) => !k.startsWith('_'));
const kor = (argv, opts = {}) => spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', maxBuffer: 1 << 28, ...opts });
const langd = (f) => Number(kor(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f]).stdout.trim());
const fmt = (t) => { const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60), ms = Math.round((t % 1) * 1000); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`; };

const resultat = existsSync(join(HAR, 'resultat-dubb.json')) ? JSON.parse(readFileSync(join(HAR, 'resultat-dubb.json'), 'utf8')) : {};

for (const kod of (MARKNAD ? [MARKNAD] : KODER)) {
  const m = MARKNADER[kod];
  mkdirSync(join(HAR, kod), { recursive: true });
  resultat[kod] = resultat[kod] ?? {};
  for (const namn of videor) {
    if (BARA && !namn.includes(BARA)) continue;
    const kalla = join(HAR, 'kalla', `${namn}.mp4`);
    if (!existsSync(kalla)) { console.log(`${kod} ${namn}: källa saknas`); continue; }
    const v = manus[namn];
    const fyll = (t) => String(t).replace(/\{pris_tal\}/g, m.pris_tal).replace(/\{jamforpris_tal\}/g, m.jamforpris_tal)
      .replace(/\{spar_tal\}/g, m.spar_tal).replace(/\{land\}/g, m.land)
      .replace(/\{pris\}/g, m.pris).replace(/\{jamforpris\}/g, m.jamforpris).replace(/\{spar\}/g, m.spar);
    // text = vad rösten säger (tal i ord); caption = vad som står i bild (pris som siffra)
    const cues = v.cues.map((c) => ({ ...c, text: fyll(c.text), caption: fyll(c.caption ?? c.text) }));
    const vlangd = langd(kalla);
    const vo = join(VO_ROT, kod, namn);
    mkdirSync(vo, { recursive: true });
    console.log(`\n=== ${kod} ${namn} (${vlangd.toFixed(2)} s, ${cues.length} repliker, röst "${ROST}")`);

    // 1. Röst per replik (cache per marknad+video+index)
    const delar = [];
    for (let i = 0; i < cues.length; i++) {
      const mp3 = join(vo, `${i}.mp3`);
      if (!existsSync(mp3) && !TORR) {
        const { generateVoiceover } = await import(join(ROT, 'voiceover', 'elevenlabs.mjs'));
        writeFileSync(mp3, await generateVoiceover(cues[i].text, { voiceName: ROST, modelId: MODELL }));
      }
      if (TORR) { delar.push({ i, d: null }); continue; }
      // trimma tystnad i början/slutet
      const wav = join(vo, `${i}.wav`);
      kor(['ffmpeg', '-y', '-v', 'error', '-i', mp3, '-af',
        'silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.03,areverse',
        '-ar', '44100', '-ac', '2', wav]);
      delar.push({ i, wav, d: langd(wav) });
    }
    if (TORR) { console.log(`   (torr: ${cues.length} repliker skulle genereras)`); continue; }

    // 2. Tidsplan: varje replik på ORIGINALETS starttid. Fönstret är fram till nästa
    //    repliks start (sista: till videons slut). För lång replik → snabba upp, max 15 %.
    let varningar = [];
    // Sista repliken måste tystna före sista bildrutan: originalet slutar i tystnad, och
    // rostkoll.py läser ljud i de sista 100 ms som "rösten hinner inte tala klart".
    const SLUTTYSTNAD = 0.45;
    for (let i = 0; i < delar.length; i++) {
      const start = cues[i].start;
      const fonster = (i + 1 < cues.length ? cues[i + 1].start : vlangd - SLUTTYSTNAD) - start;
      const d = delar[i];
      d.start = start; d.fonster = fonster; d.tempo = 1;
      if (d.d > fonster) {
        d.tempo = Math.min(MAX_TEMPO, d.d / fonster);
        const kvar = d.d / d.tempo;
        if (kvar > fonster + 0.25) varningar.push(`replik ${i + 1} är ${(kvar - fonster).toFixed(2)} s längre än sitt fönster`);
      }
      d.dNy = d.d / d.tempo;
    }
    // 3. Bygg ljudspåret. Första ingången är TYSTNAD med exakt videons längd: den sätter
    //    spårets längd, så resultatet aldrig kan bli kortare än bilden. (Utan den blev
    //    varje video 0,16–0,44 s kortare än källan — `-shortest` klippte bort slutet,
    //    och uppdraget var att inte röra bilden alls. Mätt 2026-09-17.)
    const inp = ['-f', 'lavfi', '-t', vlangd.toFixed(3), '-i', 'anullsrc=r=44100:cl=stereo',
      ...delar.flatMap((d) => ['-i', d.wav])];
    const filter = delar.map((d, k) => {
      const tempo = d.tempo > 1.001 ? `,atempo=${d.tempo.toFixed(4)}` : '';
      return `[${k + 1}:a]aresample=44100${tempo},adelay=${Math.round(d.start * 1000)}|${Math.round(d.start * 1000)}[a${k}]`;
    }).join(';') + `;[0:a]${delar.map((_, k) => `[a${k}]`).join('')}amix=inputs=${delar.length + 1}:duration=first:normalize=0,alimiter=limit=0.95[ut]`;
    const ljud = join(vo, 'spar.wav');
    const r1 = kor(['ffmpeg', '-y', '-v', 'error', ...inp, '-filter_complex', filter, '-map', '[ut]', '-ar', '44100', '-ac', '2', ljud], { timeout: 180000 });
    if (r1.status !== 0) { console.log(`   ✗ ljudbygget: ${(r1.stderr || '').slice(-300)}`); resultat[kod][namn] = { status: 'FEL', steg: 'ljud', skal: (r1.stderr || '').slice(-300) }; continue; }
    // 4. Muxa: VIDEON KOPIERAS BIT FÖR BIT (-c:v copy), bara ljudet är nytt
    const utan = join(HAR, kod, `${namn}.utan-cap.mp4`);
    // Inget -shortest: videon ska behålla sin exakta längd, ljudet är redan lika långt.
    const r2 = kor(['ffmpeg', '-y', '-v', 'error', '-i', kalla, '-i', ljud, '-map', '0:v:0', '-map', '1:a:0',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', utan]);
    if (r2.status !== 0) { console.log(`   ✗ mux: ${(r2.stderr || '').slice(-300)}`); resultat[kod][namn] = { status: 'FEL', steg: 'mux', skal: (r2.stderr || '').slice(-300) }; continue; }
    // 5. Captions: samma text som talet, på originalets tider
    const srt = join(HAR, kod, `${namn}.srt`);
    writeFileSync(srt, cues.map((c, k) => `${k + 1}\n${fmt(c.start)} --> ${fmt(Math.min(c.start + delar[k].dNy, c.start + delar[k].fonster))}\n${c.caption}\n`).join('\n'));
    const ut = join(HAR, kod, `${namn}.mp4`);
    const bandflagga = v.band && v.band !== 'auto' ? [`--band=${v.band}`] : [];
    const r3 = kor(['python3', join(ROT, 'pipeline', 'no-captions.py'), utan, srt, ut, ...bandflagga, '--font-px=34', '--max-chars=32'], { stdio: ['ignore', 'pipe', 'pipe'] });
    const capOk = existsSync(ut);
    // 6. Röstkoll mot originalet (längden är oförändrad, så ingen --omtajmad)
    const k = kor(['python3', join(ROT, 'pipeline', 'rostkoll.py'), '--kalla', kalla, '--ny', ut, '--srt', srt, '--json']);
    // rostkoll.py skriver läsbar text före JSON:en — plocka ut JSON-objektet.
    let rost = null;
    try { const s = k.stdout; rost = JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1)); }
    catch { rost = { raw: (k.stdout || k.stderr || '').slice(-400) }; }
    const rostOk = k.status === 0;
    // Bilden får inte ha ändrat längd: mer än 50 ms drift betyder att något klippte videon.
    const nyLangd = langd(ut || utan);
    const langdOk = Math.abs(nyLangd - vlangd) <= 0.05;
    resultat[kod][namn] = {
      // En video med ❌ i röstkollen laddas ALDRIG upp (Axels regel 2026-09-08).
      status: capOk && rostOk && langdOk ? 'OK' : 'FEL',
      langd_avvikelse: Number((nyLangd - vlangd).toFixed(3)),
      langd_kalla: vlangd, langd_ny: nyLangd,
      repliker: delar.map((d, i) => ({ i: i + 1, text: cues[i].text, sek: d.d, fonster: d.fonster, tempo: Number(d.tempo.toFixed(3)) })),
      varningar, captions: { exit: r3.status, utskrift: (r3.stderr || r3.stdout || '').trim().split('\n').slice(-2).join(' | ') },
      rostkoll: { exit: k.status, resultat: rost },
    };
    console.log(`   ${capOk && rostOk && langdOk ? "✓" : "✗"} ${vlangd.toFixed(2)} s → ${nyLangd.toFixed(2)} s · captions exit ${r3.status} · röstkoll ${rostOk ? '✅' : `❌ ${(k.stdout || '').split('\n').find((l) => l.includes('dB') || l.includes('tappat')) ?? 'se resultat-dubb.json'}`}${varningar.length ? ` · ⚠ ${varningar.join('; ')}` : ''}`);
    writeFileSync(join(HAR, 'resultat-dubb.json'), JSON.stringify(resultat, null, 2));
  }
}
writeFileSync(join(HAR, 'resultat-dubb.json'), JSON.stringify(resultat, null, 2));
const fel = Object.entries(resultat).flatMap(([k, v]) => Object.entries(v).filter(([, r]) => r.status !== 'OK').map(([n]) => `${k}/${n}`));
console.log(`\n${fel.length ? `FEL: ${fel.join(', ')}` : 'Alla videor klara.'}`);
