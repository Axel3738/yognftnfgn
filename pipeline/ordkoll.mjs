// Läser tillbaka en dubbad video och jämför ORDEN mot manuset.
//
// Varför den finns: `rostkoll.py` mäter tyst spår, längddrift och avhugget
// slut — men den hör inte VAD som sägs. Mätt 2026-10-01 på den norska rösten
// (`Martin - Clear and Comforting`, eleven_v3): i första generationen lästes
// "Taket" som "Pake" och "D-duk" som "Dedok". Samma text, genererad på nytt
// några minuter senare, lästes helt rätt — sex av sex.
//
// ⚠️ **Felet är slumpmässigt, inte systematiskt.** Det går alltså inte att
// mäta bort en gång för alla genom att välja rätt röst eller skriva om texten:
// det måste kontrolleras på VARJE renderad video. Och det var "Taket" som föll
// — produktens eget ord, först i repliken.
//
// Transkriberingen är inte heller ofelbar, så ett utslag är ett SKÄL ATT
// LYSSNA, inte en dom. Men en cue som avviker levereras aldrig oläst: generera
// om den (radera dess mp3 i `<utmapp>/vo/<namn>/<i>.mp3`, kör `elevenlabs-omdubb`
// igen) och kör ordkollen på nytt.
//
//   node pipeline/ordkoll.mjs <video.mp4> <manus.srt> --sprak no [--json]
//
// Exit 0 = inga avvikelser. Exit 1 = minst en cue avviker (läs listan).
// Exit 2 = kunde inte mätas (ingen nyckel, inget ljudspår) — aldrig "grön".

import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { ljudspar, transkribera } from './scribe.mjs';

/** Jämförelsens normalisering. Bindestreck blir mellanslag — "åtti-ni" och
 *  "åtti ni" är samma uppläsning, och utan det förskjuts hela raden och en
 *  perfekt replik ser ut att ha tolv fel (mätt 2026-10-01). */
export function normalisera(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[-–—]/g, ' ')
    .replace(/[.,!?:;"'()«»…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const ord = (s) => (normalisera(s) ? normalisera(s).split(' ') : []);

/** SRT → [{nr, start, slut, text}] */
export function lasSrt(text) {
  const tid = (t) => {
    const m = /(\d+):(\d+):(\d+)[,.](\d+)/.exec(t);
    return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000 : null;
  };
  return String(text).split(/\r?\n\r?\n/).map((block, k) => {
    const rader = block.split(/\r?\n/).filter((r) => r.trim());
    if (rader.length < 2) return null;
    const i = rader.findIndex((r) => r.includes('-->'));
    if (i < 0) return null;
    const [a, b] = rader[i].split('-->');
    return {
      nr: Number(rader[0]) || k + 1,
      start: tid(a), slut: tid(b),
      text: rader.slice(i + 1).join(' ').trim(),
    };
  }).filter(Boolean);
}

/**
 * Jämför manusets cues mot transkriptets ord, cue för cue.
 * Orden tilldelas den cue vars tidsfönster de ligger i; hamnar ett ord utanför
 * alla fönster räknas det till närmaste cue, för rösten flyttar gränserna
 * någon tiondel.
 */
export function jamfor(cuesIn, transkriptOrd, { marginal = 0.6 } = {}) {
  return cuesIn.map((c) => {
    const inom = transkriptOrd.filter((o) =>
      o.slut >= c.start - marginal && o.start <= c.slut + marginal);
    const vantat = ord(c.text);
    const hord = ord(inom.map((o) => o.text).join(' '));
    const avvik = [];
    for (let i = 0; i < Math.max(vantat.length, hord.length); i++) {
      if (vantat[i] !== hord[i]) avvik.push({ vantat: vantat[i] ?? '—', hord: hord[i] ?? '—' });
    }
    return { nr: c.nr, start: c.start, text: c.text, hord: inom.map((o) => o.text).join(' '),
             ord: vantat.length, avvikelser: avvik };
  });
}

async function main() {
  const a = process.argv.slice(2);
  const fri = a.filter((x) => !x.startsWith('--'));
  const flagga = (n, d = null) => { const i = a.indexOf(`--${n}`); return i >= 0 ? a[i + 1] : d; };
  const [video, srt] = fri;
  if (!video || !srt) {
    console.error('Användning: node pipeline/ordkoll.mjs <video.mp4> <manus.srt> --sprak no [--json]');
    return 2;
  }
  for (const f of [video, srt]) if (!existsSync(f)) { console.error(`finns inte: ${f}`); return 2; }

  let resultat;
  try {
    const ljud = `${process.env.TMPDIR || '/tmp'}/${basename(video).replace(/\.[^.]+$/, '')}.ordkoll.mp3`;
    ljudspar(video, ljud);
    const r = await transkribera(ljud, { sprak: flagga('sprak', 'no') });
    resultat = jamfor(lasSrt(readFileSync(srt, 'utf8')), r.ord);
  } catch (e) {
    console.error(`⚠️ KUNDE INTE MÄTAS: ${e.message}`);
    console.error('   Det är inte ett godkännande — videon är okontrollerad.');
    return 2;
  }

  const trasiga = resultat.filter((c) => c.avvikelser.length);
  if (a.includes('--json')) {
    console.log(JSON.stringify({ fil: basename(video), cues: resultat.length, trasiga: trasiga.length, resultat }, null, 1));
  } else {
    console.log(`${basename(video)}: ${resultat.length} cues, ${trasiga.length} med avvikelse`);
    for (const c of trasiga) {
      console.log(`\n  cue ${c.nr} @ ${c.start?.toFixed(1)}s`);
      console.log(`    manus: ${c.text}`);
      console.log(`    hörs:  ${c.hord}`);
      console.log(`    ${c.avvikelser.slice(0, 6).map((x) => `${x.vantat} → ${x.hord}`).join(' | ')}`);
    }
    if (trasiga.length) {
      console.log('\n⚠️ Generera om de cuesarna (radera deras mp3 i <utmapp>/vo/<namn>/) och kör igen.');
      console.log('   Transkriberingen kan ha fel — lyssna innan du dömer, men leverera inte oläst.');
    }
  }
  const utfil = flagga('ut');
  if (utfil) writeFileSync(utfil, JSON.stringify(resultat, null, 1));
  return trasiga.length ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((k) => process.exit(k)).catch((e) => { console.error(String(e.message || e)); process.exit(2); });
}
