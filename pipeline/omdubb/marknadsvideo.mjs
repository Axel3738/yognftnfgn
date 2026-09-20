// marknadsvideo.mjs — en källvideo → en färdig annonsvideo för EN marknad.
//
// Kedjan fanns som lösa steg i tre olika mappar. Det här är den som helhet, och
// den bygger på tre mätningar från 2026-09-20 (CaraShell → Danmark):
//
//  1. SLUTKORTET MÅSTE KLIPPAS BORT FÖRE OMDUBBNINGEN. `elevenlabs-omdubb.mjs`
//     tempo-anpassar varje videosegment efter repliken, och det SISTA segmentet
//     sträcker sig till filmens slut — alltså genom slutkortet. Mätt på
//     CaraShellRoof_CO_101_H1: sista cuen hade fått 135 % fart, så det 3,0 s
//     långa slutkortet hade snabbspolats till 2,4 s. Klipper man i stället
//     källan vid kortets starttid, dubbar, och lägger på ett NYTT kort efteråt,
//     behåller kortet sin längd och sitt språk.
//  2. Källans slutkort bär källbutikens logga och pris. Åtta av Bäverbutikens
//     taköverdrags-videor gick live i Norge med bäverhuvudet kvar, eftersom
//     ingen spärr tittade på bildrutorna (`factory/bildbrand.mjs` täpper det
//     hålet, `factory/slutkort.py` bygger ersättaren).
//  3. Rösten är marknadens, ur `factory/opsmarknader.mjs` (`rost`). Dubba
//     aldrig ett språk med ett annat språks röst.
//
//  4. KÄLLANS INBRÄNDA TEXT MÅSTE BYTAS FÖRE KLIPPNINGEN, av samma skäl som
//     punkt 1. Mätt med OCR på den färdiga CaraShellRoof_DK_CO_101_H1
//     2026-09-20: svensk text stod kvar i BILDEN — ordcaptions hela filmen,
//     "1129 KR"/"1 469 KR" vid 17–19 s och "FRI FRAKT"/"30 DAGARS ÖPPET KÖP"
//     vid 19–22 s. Fel språk, fel pris OCH fel villkor (30 dagars öppet köp är
//     källbutikens löfte, inte den här butikens). `--inbrand` kör
//     `inbrand.mjs` på källan innan något annat händer.
//
//   node pipeline/omdubb/marknadsvideo.mjs --kalla=<mp4> --srt=<marknadens.srt> \
//        --marknad=DK --produkt=factory/produkter/takskyddet.yaml \
//        --butik=factory/butiker/carashell.yaml --ut=<mp4> \
//        [--inbrand] [--produktbild=<png>] [--slutkort=<png>] [--captions] [--torr]
//
//   --inbrand      byter källans inbrända svenska text mot marknadens FÖRE
//                  klippningen (pipeline/omdubb/inbrand.mjs). Kräver
//                  --produkt och --butik.
//   --produktbild  frilagd produktbild till slutkortet (skickas till slutkort.py)
//   --slutkort     färdigt kort i rätt bredd; hoppar över slutkort.py
//   --captions     bränner in marknadens captions efteråt (no-captions.py)
//   --torr         visar planen, rör ingen fil och drar inga krediter
//
// Skriver <ut>, <ut>.srt (nya cue-tider) och <ut>.rapport.json.
// Kräver ffmpeg. ⚠️ Använder ALDRIG `ffprobe -select_streams` — shimmen i
// containern stöder inte flaggan (mätt 2026-09-20); längden läses ur
// `ffmpeg -i`:s stderr.

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { marknadFor } from '../../factory/opsmarknader.mjs';
import { SLUTKORTSMARGINAL } from './inbrand.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const kor = (argv, { tillat = false } = {}) => {
  const r = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status !== 0 && !tillat) {
    throw new Error(`${argv[0]} misslyckades (${r.status}): ${String(r.stderr ?? r.error?.message ?? '').slice(-700)}`);
  }
  return r;
};

/** Videons längd och upplösning ur `ffmpeg -i` (stderr). ffprobe-shimmen i
 *  containern klarar inte -select_streams, så den används inte. */
export function langdOchStorlek(fil) {
  const r = kor(['ffmpeg', '-hide_banner', '-i', fil], { tillat: true });
  const txt = String(r.stderr ?? '');
  const d = /Duration:\s*(\d+):(\d+):(\d+\.?\d*)/.exec(txt);
  const s = /,\s(\d{2,5})x(\d{2,5})[,\s]/.exec(txt);
  if (!d) throw new Error(`Kunde inte läsa längden ur ffmpeg -i ${basename(fil)}`);
  return {
    langd: Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]),
    bredd: s ? Number(s[1]) : null,
    hojd: s ? Number(s[2]) : null,
  };
}

/** Slutkortets starttid, eller null. OSÄKER behandlas som "inget kort" men
 *  namnges av anroparen — en gissning här hade klippt bort riktig film. */
export function slutkortsStart(fil) {
  const r = kor(['python3', join(ROT, 'factory', 'slutkortskoll.py'), fil, '--json'], { tillat: true });
  let j;
  try { j = JSON.parse(r.stdout)[0]; } catch { return { dom: 'FEL', fran: null, skal: String(r.stderr ?? '').slice(-200) }; }
  return { dom: j?.dom ?? 'FEL', fran: j?.dom === 'JA' ? Number(j.slutkort_fran_s) : null, langd: j?.slutkort_langd_s ?? null, skal: j?.skal ?? '' };
}

/** Sista cuens sluttid ur en SRT — klipppunkten får aldrig ligga före talet. */
export function sistaCueSlut(srtFil) {
  const t = readFileSync(srtFil, 'utf8');
  const tider = [...t.matchAll(/-->\s*(\d+):(\d+):(\d+)[,.](\d+)/g)]
    .map((m) => Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 1000);
  if (!tider.length) throw new Error(`${basename(srtFil)} har inga cue-tider`);
  return Math.max(...tider);
}

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = /^--([^=]+)(?:=(.*))?$/.exec(a); return m ? [m[1], m[2] ?? true] : [a, true];
}));

if (process.argv[1]?.endsWith('marknadsvideo.mjs')) {
  for (const k of ['kalla', 'srt', 'marknad', 'ut']) {
    if (!args[k]) { console.error(`--${k} saknas. Läs huvudet i filen.`); process.exit(2); }
  }
  const marknaden = marknadFor(args.marknad);
  if (!marknaden.rost) {
    console.error(`Marknaden ${marknaden.kod} har ingen röst i factory/opsmarknader.mjs (rost: null).\n`
      + 'Dubba aldrig ett språk med ett annat språks röst — välj rösten först.');
    process.exit(2);
  }
  const kalla = String(args.kalla), srt = String(args.srt), ut = String(args.ut);
  const tmp = `${ut}.arbete`;
  const rapport = { kalla, srt, marknad: marknaden.kod, rost: marknaden.rost, steg: [] };

  const k = langdOchStorlek(kalla);
  const kort = slutkortsStart(kalla);
  const talSlut = sistaCueSlut(srt);
  rapport.kalla_langd = k.langd; rapport.upplosning = `${k.bredd}x${k.hojd}`;
  rapport.slutkort = kort;

  // Klipppunkten: slutkortets start, men aldrig före talets slut. Ligger de
  // omlott är detektorn eller manuset fel — säg det, klipp inte.
  //
  // ⚠️ MARGINALEN ÄR INTE KOSMETIK. `slutkortskoll.py` säger när kortet STÅR
  // STILL, och kortet skalas in några bildrutor innan dess. Mätt 2026-09-20 på
  // CaraShellRoof_CO_101_H1: detektorn säger 22,91 s, men OCR läser
  // "BÄVERBUTIKEN" redan i bildrutan 22,67 s — och i den färdiga danska videon
  // blinkade hela Bäverbutikens slutkort (logga, svensk flagga, 1 129 kr)
  // förbi i 0,34 s vid 18,3 s, efter omtajmningen. Klipp därför ett halvt
  // steg tidigare, men aldrig in i talet.
  let klippVid = null;
  if (kort.dom === 'JA') {
    if (kort.fran < talSlut - 0.05) {
      console.error(`STOPP: slutkortet börjar ${kort.fran}s men talet slutar ${talSlut.toFixed(2)}s — de överlappar.`);
      process.exit(3);
    }
    klippVid = Math.max(talSlut + 0.05, kort.fran - SLUTKORTSMARGINAL);
    if (klippVid > kort.fran - SLUTKORTSMARGINAL + 0.001) {
      console.log(`  ⚠️ talet slutar ${talSlut.toFixed(2)} s, så klippet kan inte läggas hela `
        + `${SLUTKORTSMARGINAL} s före kortet — titta på övergången, källans kort kan blinka förbi.`);
    }
  }

  console.log(`${basename(kalla)}: ${k.langd.toFixed(2)} s, ${k.bredd}×${k.hojd}`);
  console.log(`  slutkort: ${kort.dom}${kort.fran != null ? ` från ${kort.fran} s (${kort.langd} s)` : ''} — ${kort.skal.slice(0, 90)}`);
  console.log(`  talet slutar ${talSlut.toFixed(2)} s · röst "${marknaden.rost}" (${marknaden.sprak})`);
  console.log(klippVid != null
    ? `  → klipper källan vid ${klippVid} s, dubbar, och lägger på ett nytt ${marknaden.kod}-slutkort`
    : '  → inget slutkort att byta; hela källan dubbas');
  if (kort.dom === 'OSÄKER') console.log('  ⚠️ detektorn är OSÄKER — ingen klippning gjord, titta på slutet själv');
  if (args.inbrand) {
    if (!args.produkt || !args.butik) {
      console.error('--inbrand kräver --produkt och --butik: marknadens pris och villkor läses ur filerna, aldrig ur en översättning.');
      process.exit(2);
    }
    console.log('  → byter källans inbrända svenska text mot marknadens FÖRE klippningen (--inbrand)');
  } else {
    console.log('  ⚠️ --inbrand är AV: källans inbrända svenska text (ordcaptions, pris, villkor) följer med i bilden');
  }

  if (args.torr) { console.log('\n(torr: inget renderat, inga krediter)'); process.exit(0); }

  mkdirSync(tmp, { recursive: true });
  try {
    // 0. Byt källans inbrända text. MÅSTE ske före klippningen och före
    //    dubbningen: omdubben tempo-anpassar varje segment, så rutor och
    //    tider mätta i källan stämmer inte efteråt.
    let kallfil = kalla;
    if (args.inbrand) {
      const inbrandUt = join(tmp, 'inbrand.mp4');
      const ib = kor(['node', join(ROT, 'pipeline', 'omdubb', 'inbrand.mjs'),
        `--kalla=${kalla}`, `--ut=${inbrandUt}`, `--marknad=${marknaden.kod}`,
        `--produkt=${args.produkt}`, `--butik=${args.butik}`,
        // Kortets NOMINELLA start, inte klipppunkten: `inbrand.mjs` drar av
        // samma SLUTKORTSMARGINAL internt, så mätningen slutar exakt där
        // klippet går. Skickas klipppunkten i stället uppstår ett glapp på
        // marginalens längd där källans text står kvar oförändrad.
        ...(kort.dom === 'JA' ? [`--till=${kort.fran}`] : []),
        ...(args.inbrandFps ? [`--fps=${args.inbrandFps}`] : [])], { tillat: true });
      console.log(ib.stdout.split('\n').filter((r) => /^(PLAN|  pop|  pillerband|      "|  ❌|  ✅|  ⚠️)/.test(r)).join('\n'));
      if (!existsSync(inbrandUt)) {
        throw new Error(`inbrand.mjs skrev ingen fil (kod ${ib.status}):\n${String(ib.stderr ?? '').slice(-800)}`);
      }
      let ibRapport = {};
      try { ibRapport = JSON.parse(readFileSync(`${inbrandUt}.inbrand.json`, 'utf8')); } catch { /* rapporten är extra */ }
      rapport.inbrand = { dom: ibRapport.dom ?? `exit ${ib.status}`, exit: ib.status,
        plan: ibRapport.plan?.block?.flatMap((b) => b.rader.map((r) => ({ kalla: r.text, ny: r.ny, roll: r.roll }))) ?? [],
        kvar: ibRapport.kvar ?? [], utan_ersattning: ibRapport.utan_ersattning ?? [] };
      rapport.steg.push(`bytte inbränd text (${rapport.inbrand.dom})`);
      kallfil = inbrandUt;
    }

    // 1. Klipp bort källans slutkort.
    const dubbIn = klippVid != null ? join(tmp, 'utan-kort.mp4') : kallfil;
    if (klippVid != null) {
      kor(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', kallfil, '-t', String(klippVid),
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-c:a', 'aac', '-movflags', '+faststart', dubbIn]);
      rapport.steg.push(`klippte källan vid ${klippVid} s`);
    }

    // 2. Omdubbningen — marknadens röst, marknadens manus.
    const dubbUt = join(tmp, 'dubbad.mp4');
    const d = kor(['node', join(ROT, 'pipeline', 'omdubb', 'elevenlabs-omdubb.mjs'),
      `--kalla=${dubbIn}`, `--srt=${srt}`, `--ut=${dubbUt}`, `--rost=${marknaden.rost}`,
      `--modell=${args.modell ?? 'eleven_v3'}`, `--vo=${join(tmp, 'vo')}`]);
    console.log(d.stdout.split('\n').slice(-6).join('\n'));
    rapport.steg.push('omdubbad med ElevenLabs');

    // 3. Nytt slutkort i marknadens språk, med marknadens pris.
    let slutkortPng = args.slutkort ? String(args.slutkort) : null;
    if (klippVid != null && !slutkortPng) {
      if (!args.produkt || !args.butik) throw new Error('Slutkort ska byggas men --produkt/--butik saknas.');
      slutkortPng = join(tmp, `slutkort-${k.bredd}.png`);
      kor(['python3', join(ROT, 'factory', 'slutkort.py'),
        '--produkt', String(args.produkt), '--butik', String(args.butik),
        '--marknad', marknaden.kod, '--bredd', String(k.bredd),
        ...(args.produktbild ? ['--produktbild', String(args.produktbild)] : []),
        '--ut', slutkortPng]);
      rapport.steg.push('byggde nytt slutkort');
    }

    let farsk = dubbUt;
    if (klippVid != null && slutkortPng) {
      // Kortet blir en egen videosnutt med tyst ljudspår, i samma format som
      // den dubbade filmen — annars vägrar concat att sy ihop dem.
      const kortLangd = Number(kort.langd ?? 3);
      const kortMp4 = join(tmp, 'slutkort.mp4');
      kor(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-loop', '1', '-i', slutkortPng,
        '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
        '-t', String(kortLangd), '-vf', `scale=${k.bredd}:${k.hojd},fps=30,format=yuv420p`,
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-c:a', 'aac', '-shortest',
        '-movflags', '+faststart', kortMp4]);
      // Omkodning till samma parametrar före concat — demuxern kräver identiska
      // strömmar, och den dubbade filen kommer ur ett annat ffmpeg-anrop.
      const likaMp4 = join(tmp, 'dubbad-lika.mp4');
      kor(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', dubbUt,
        '-vf', `scale=${k.bredd}:${k.hojd},fps=30,format=yuv420p`, '-c:v', 'libx264', '-preset', 'medium',
        '-crf', '18', '-c:a', 'aac', '-ar', '44100', '-ac', '2', '-movflags', '+faststart', likaMp4]);
      const lista = join(tmp, 'concat.txt');
      writeFileSync(lista, `file '${likaMp4}'\nfile '${kortMp4}'\n`);
      const ihop = join(tmp, 'ihop.mp4');
      kor(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0',
        '-i', lista, '-c', 'copy', '-movflags', '+faststart', ihop]);
      farsk = ihop;
      rapport.steg.push(`la på slutkortet (${kortLangd} s)`);
    }

    // 4. Captions (opt-in). SRT:n med de NYA tiderna kommer ur omdubben.
    //
    // ⚠️ BANDET MÅSTE ANGES när --inbrand har körts. `no-captions.py` letar
    // själv rätt på bandet genom att skanna efter LJUSA TEXTRADER — men efter
    // `inbrand.mjs` finns ingen text kvar att hitta, och autodetekteringen
    // räknade då fram höjden −82 px ("Invalid too big or non positive size",
    // mätt 2026-09-20). Rutan som faktiskt suddades står i inbrand-rapporten,
    // och den är rätt svar: captionen hamnar exakt där källans ordcaption satt.
    const nySrt = `${dubbUt}.srt`;
    if (args.captions && existsSync(nySrt)) {
      const capUt = join(tmp, 'cap.mp4');
      const bandFlagga = [];
      const rapportFil = `${join(tmp, 'inbrand.mp4')}.inbrand.json`;
      if (existsSync(rapportFil)) {
        try {
          const r = JSON.parse(readFileSync(rapportFil, 'utf8'));
          const rect = (r.plan?.atgarder ?? []).find((a) => a.typ === 'sudda')?.rect;
          if (rect) bandFlagga.push(`--band=${rect[1]}:${rect[3]}`);
        } catch { /* ingen rapport att läsa: låt no-captions mäta själv */ }
      }
      const c = kor(['python3', join(ROT, 'pipeline', 'no-captions.py'), farsk, nySrt, capUt, ...bandFlagga], { tillat: true });
      // ffmpeg skriver en TOM fil när filtergrafen faller — `existsSync` ensam
      // släppte igenom en trasig video som "brände in captions" (mätt samma dag).
      const ok = c.status === 0 && existsSync(capUt) && statSync(capUt).size > 10_000;
      if (ok) { farsk = capUt; rapport.steg.push(`brände in captions${bandFlagga.length ? ` (band ${bandFlagga[0].slice(7)})` : ''}`); }
      else {
        const varfor = String(c.stderr || c.stdout || '').trim().split('\n').slice(-1)[0] || `exit ${c.status}`;
        rapport.steg.push(`captions MISSLYCKADES (${varfor}) — videon levereras utan`);
        console.log(`  ⚠️ captions misslyckades: ${varfor}`);
      }
    }

    kor(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', farsk, '-c', 'copy', '-movflags', '+faststart', ut]);
    if (existsSync(nySrt)) writeFileSync(`${ut}.srt`, readFileSync(nySrt, 'utf8'));

    // 5. Röstkollen — Axels regel 2026-09-08: ingen video går ut med keff röst.
    const rk = kor(['python3', join(ROT, 'pipeline', 'rostkoll.py'), '--kalla', kalla, '--ny', ut,
      ...(existsSync(`${ut}.srt`) ? ['--srt', `${ut}.srt`, '--omtajmad'] : [])], { tillat: true });
    rapport.rostkoll = { exit: rk.status, utskrift: String(rk.stdout ?? '').trim().split('\n').slice(-12) };
    console.log(String(rk.stdout ?? '').trim().split('\n').slice(-12).join('\n'));

    const slut = langdOchStorlek(ut);
    rapport.ny_langd = slut.langd;
    // En video med källans språk kvar i BILDEN är aldrig klar (CLAUDE.md:
    // "skriv aldrig en mätning som en evig lag" gäller åt andra hållet också —
    // ett mätt fel får inte tystna i en grön slutrad).
    const bildFel = rapport.inbrand && rapport.inbrand.dom !== 'REN' && rapport.inbrand.dom !== 'REN (inget mätt)';
    console.log(`\n${bildFel ? '❌' : '✅'} ${basename(ut)} — ${slut.langd.toFixed(2)} s (källan ${k.langd.toFixed(2)} s), ${rapport.steg.join(' · ')}`);
    if (bildFel) {
      console.log(`❌ INBRÄND TEXT: ${rapport.inbrand.dom} — ${rapport.inbrand.kvar.length} rad(er) svensk text kvar, `
        + `${rapport.inbrand.utan_ersattning.length} utan ersättning. Ladda INTE upp; läs ${basename(ut)}.rapport.json.`);
    }
    if (rk.status !== 0) console.log('⚠️ rostkoll.py gav utslag — läs raderna ovan INNAN videon laddas upp.');
    writeFileSync(`${ut}.rapport.json`, `${JSON.stringify(rapport, null, 1)}\n`);
  } finally {
    if (!args.behall) rmSync(tmp, { recursive: true, force: true });
  }
}
