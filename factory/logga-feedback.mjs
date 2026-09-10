// logga-feedback.mjs — den interna feedbackloopen för loggorna.
//
// Axels beslut 2026-09-10: varje gång någon väljer en av de tre loggorna
// ska valet loggas, så nästa butiks tre varianter byggs på vad som faktiskt
// valts — inte på samma tre gissningar varje gång. Loggen är en markdown-
// tabell i factory/LOGGA-FEEDBACK.md; /ny-ops läser sammanfattningen INNAN
// varianterna genereras och skriver en rad EFTER valet.
//
//   node factory/logga-feedback.mjs <butik-id> <a|b|c> [--motiv droppe|lucka|ingen]
//        [--kommentar "…"] [--datum YYYY-MM-DD] [--torr]
//   node factory/logga-feedback.mjs --sammanfatta
//
// Noll beroenden. Ren logik exporterad, filskrivning bara i CLI:t.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
export const FEEDBACK_FIL = join(FACTORY_ROT, 'LOGGA-FEEDBACK.md');
export const VARIANTER = ['a', 'b', 'c'];

export const RUBRIK = `# Loggfeedback — vad som valdes, butik för butik

Skrivs av \`node factory/logga-feedback.mjs\` efter varje val (Axels beslut
2026-09-10). Läs sammanfattningen (\`--sammanfatta\`) innan nästa butiks tre
varianter genereras: den variant som vinner oftast är utgångsläget, den som
aldrig väljs ska bytas ut mot något nytt — inte visas en gång till.

Varianterna: **a** = ordmärket på mörk platta med motivet ovanför ·
**b** = ordet delat på två rader med motivet litet ovanför ·
**c** = ordmärket ensamt, ljust.

| Datum | Butik | Vald | Motiv | Kommentar |
|---|---|---|---|---|
`;

/** En tabellrad. Kastar på ogiltig variant — en rad utan val är ingen feedback. */
export function byggRad({ butik, vald, motiv = 'droppe', kommentar = '', datum }) {
  if (!butik || typeof butik !== 'string') throw new Error('byggRad kräver ett butik-id.');
  const v = String(vald ?? '').toLowerCase();
  if (!VARIANTER.includes(v)) throw new Error(`Okänd variant "${vald}" — välj ${VARIANTER.join(', ')}.`);
  if (!datum || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) throw new Error('byggRad kräver datum YYYY-MM-DD.');
  const k = String(kommentar ?? '').replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
  return `| ${datum} | ${butik} | ${v} | ${motiv} | ${k} |`;
}

/** Lägger raden sist i filens innehåll. Tom/saknad fil får rubriken först. */
export function laggTill(innehall, rad) {
  const bas = innehall && innehall.trim() !== '' ? innehall.replace(/\s+$/, '') + '\n' : RUBRIK;
  return bas + rad + '\n';
}

/**
 * Räknar valen per variant ur filens tabell. Ger också per motiv, så
 * sessionen kan se om "lucka" någonsin valts. Läser bara rader som börjar
 * med "| 20" (datumkolumnen) — rubriker och tomrader hoppas över.
 */
export function sammanfatta(innehall) {
  const perVariant = { a: 0, b: 0, c: 0 };
  const perMotiv = {};
  const rader = [];
  for (const rad of String(innehall ?? '').split('\n')) {
    const m = rad.match(/^\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*([^|]+?)\s*\|\s*([abc])\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|/);
    if (!m) continue;
    const [, datum, butik, vald, motiv, kommentar] = m;
    perVariant[vald] += 1;
    if (motiv) perMotiv[motiv] = (perMotiv[motiv] ?? 0) + 1;
    rader.push({ datum, butik, vald, motiv, kommentar });
  }
  const antal = rader.length;
  const vinnare = antal === 0 ? null
    : VARIANTER.reduce((a, b) => (perVariant[b] > perVariant[a] ? b : a));
  const aldrigValda = antal === 0 ? [] : VARIANTER.filter((v) => perVariant[v] === 0);
  return { antal, perVariant, perMotiv, vinnare, aldrigValda, rader };
}

/** Sammanfattningen som text till chatten — en mening per rad. */
export function formateraSammanfattning(s) {
  if (s.antal === 0) return 'Ingen loggfeedback loggad än — alla tre varianter är lika sannolika.';
  const rader = [
    `${s.antal} val loggade: a ${s.perVariant.a}, b ${s.perVariant.b}, c ${s.perVariant.c}.`,
    `Oftast vald: ${s.vinnare} — utgå från den.`,
  ];
  if (s.aldrigValda.length > 0) rader.push(`Aldrig vald: ${s.aldrigValda.join(', ')} — byt ut den varianten mot något nytt.`);
  const medKommentar = s.rader.filter((r) => r.kommentar);
  for (const r of medKommentar.slice(-5)) rader.push(`${r.butik} (${r.vald}): ${r.kommentar}`);
  return rader.join('\n');
}

// ------------------------------------------------------------------- CLI

function flagga(argv, namn) {
  const i = argv.indexOf(namn);
  return i === -1 ? null : argv[i + 1] ?? null;
}

function huvud(argv) {
  const innehall = existsSync(FEEDBACK_FIL) ? readFileSync(FEEDBACK_FIL, 'utf8') : '';
  if (argv.includes('--sammanfatta')) {
    console.log(formateraSammanfattning(sammanfatta(innehall)));
    return;
  }
  const [butik, vald] = argv.filter((a) => !a.startsWith('--') && !argv.includes(`--${a}`));
  const datum = flagga(argv, '--datum') ?? new Date().toISOString().slice(0, 10);
  let rad;
  try {
    rad = byggRad({
      butik, vald, datum,
      motiv: flagga(argv, '--motiv') ?? 'droppe',
      kommentar: flagga(argv, '--kommentar') ?? '',
    });
  } catch (e) {
    console.error(`❌ ${e.message}`);
    console.error('Användning: node factory/logga-feedback.mjs <butik-id> <a|b|c> [--motiv …] [--kommentar "…"] [--datum YYYY-MM-DD] [--torr]');
    process.exit(1);
  }
  if (argv.includes('--torr')) {
    console.log(rad);
    console.log('[--torr] Ingenting skrevs.');
    return;
  }
  writeFileSync(FEEDBACK_FIL, laggTill(innehall, rad));
  console.log(`✅ Loggat i factory/LOGGA-FEEDBACK.md: ${rad}`);
  console.log(formateraSammanfattning(sammanfatta(readFileSync(FEEDBACK_FIL, 'utf8'))));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud(process.argv.slice(2));
}
