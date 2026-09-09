#!/usr/bin/env node
// STARTSKOTTET — meddelandet som säger att en produkt klarat testet på
// Bäverbutiken och ska få en egen OPS-butik.
//
// Kravspec: factory/SKALNINGSKUNGEN.md ("Startskottet").
// Byggplan:  factory/SKALNINGSKUNGEN-PLAN.md steg 3.
//
// ⚠️ UTKAST 2026-09-09. Formateringen och idempotensen är byggda och testade.
// Det som återstår är att koppla in den — se "ATT KOPPLA IN" längst ned.
//
// Den här filen RÄKNAR ALDRIG och HÄMTAR ALDRIG. Den formaterar tal som någon
// annan redan räknat ut, och den vägrar om talen saknas. Skälet står i
// agent/README.md: ligger räkningen i kod blir svaret detsamma varje gång och
// går att testa — och en modell som räknar själv hittar förr eller senare på
// ett tal. Tröskeln räknas av `agent/rond.mjs` (FORSTA_BATCH_SPEND_SEK 1500,
// FORSTA_BATCH_VINST_PROCENT 20).
//
// Noll beroenden. Node ≥ 20. Inget nätverk, inga skrivningar.
//
//   node factory/startskott.mjs --jobb <fil.json> --torr    # visa meddelandet
//   node factory/startskott.mjs --jobb <fil.json>           # visa + exit 0
//
// Jobbfilens fält står i KRAVDA_FALT nedan.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Koden startskottet skriver i budgetloggen. Idempotensen hänger på den. */
export const STARTSKOTT_KOD = 'OPS_STARTSKOTT';

/**
 * Fälten som MÅSTE finnas. Saknas ett enda vägrar skriptet — hellre inget
 * meddelande än ett meddelande med ett påhittat tal i.
 * `kampanj_id` är med för idempotensen, `kalla_url` för att VA:n ska kunna
 * klistra in /ny-ops utan att leta upp produkten.
 */
export const KRAVDA_FALT = [
  'produkt',        // produktnamnet som det heter i Meta
  'kampanj_id',     // kampanjens id i MagiBorsten
  'kalla_url',      // produktsidan på Bäverbutiken — argumentet till /ny-ops
  'spend_total',    // total spend i kronor
  'kop',            // antal köp
  'cpa',            // kostnad per köp i kronor
  'break_even_cpa', // break-even-CPA i kronor
  'roas',           // ROAS
  'vinst_procent',  // vinst i procent av omsättningen (agent/besked.mjs)
];

/**
 * Har startskottet redan gått för den här kampanjen?
 *
 * Samma mönster som `arAvstangd` i agent/rond.mjs: läs bara genomförda rader,
 * senaste vinner. Utan den här kollen skickas meddelandet varje morgon så
 * länge produkten ligger kvar över tröskeln — och ett larm som kommer varje
 * dag slutar folk läsa.
 */
export function startskottHarGatt(logg, kampanjId) {
  if (!Array.isArray(logg)) return false;
  return logg.some((rad) => rad
    && rad.kampanj_id === kampanjId
    && rad.genomford === true
    && rad.kod === STARTSKOTT_KOD);
}

/** Svenskt tal utan decimaler, med tusenmellanslag. */
function heltal(n) {
  return Math.round(Number(n)).toLocaleString('sv-SE');
}

/** Svenskt tal med n decimaler och komma. */
function decimal(n, decimaler = 2) {
  return Number(n).toFixed(decimaler).replace('.', ',');
}

/**
 * Kontrollerar jobbet och returnerar en lista med saknade fält.
 * Tom lista = kör. Tom sträng och null räknas som saknat; 0 gör det INTE
 * (noll köp är ett tal, om än ett dåligt sådant).
 */
export function saknadeFalt(jobb) {
  if (!jobb || typeof jobb !== 'object') return [...KRAVDA_FALT];
  return KRAVDA_FALT.filter((f) => {
    const v = jobb[f];
    if (v === undefined || v === null || v === '') return true;
    if (typeof v === 'number' && !Number.isFinite(v)) return true;
    return false;
  });
}

/**
 * Meddelandet till Axel, i hans svarsformat (CLAUDE.md): en mening per rad,
 * max tio ord, numrerade saker han ska göra, fetstil bara på namn han ska
 * leta efter. Siffrorna ligger i ett eget block så de inte bryter läsflödet.
 *
 * ⚠️ Rubriken säger vad som hänt, inte vad rutinen gjort. Axel ska kunna läsa
 * första raden på mobilen och veta vad det handlar om.
 */
export function formateraStartskott(jobb) {
  const saknade = saknadeFalt(jobb);
  if (saknade.length > 0) {
    throw new Error(`Startskottet vägrar: saknade fält — ${saknade.join(', ')}`);
  }

  const rader = [
    `**KLAR FÖR OPS: ${jobb.produkt}**`,
    '',
    'Produkten har klarat testet på Bäverbutiken.',
    'Nu ska den få en egen butik.',
    '',
    'Siffrorna bakom:',
    `- Spend: ${heltal(jobb.spend_total)} kr`,
    `- Köp: ${heltal(jobb.kop)}`,
    `- CPA: ${heltal(jobb.cpa)} kr (break-even ${heltal(jobb.break_even_cpa)} kr)`,
    `- ROAS: ${decimal(jobb.roas)}`,
    `- Vinst: ${decimal(jobb.vinst_procent, 1)} % av omsättningen`,
    '',
    'Du ska göra 1 sak.',
    '',
    '**Starta bygget**',
    'Öppna en ny chatt.',
    'Klistra in raden nedan.',
    '',
    '```',
    `/ny-ops ${jobb.kalla_url}`,
    '```',
    '',
    'Sen är du klar. Jag har gjort resten.',
  ];
  return rader.join('\n');
}

/**
 * Loggraden. Samma fältform som agent/budgetlogg.jsonl så den kan skrivas med
 * `skrivRad` i agent/logg.mjs utan översättning.
 *
 * `datum` skickas in — skriptet läser aldrig klockan själv, så testerna kan
 * köras på ett fast datum och två körningar samma dygn ger samma rad.
 */
export function byggLoggrad(jobb, { datum, adAccountId = '1867947880635861' } = {}) {
  if (!datum) throw new Error('byggLoggrad kräver ett datum (YYYY-MM-DD).');
  const saknade = saknadeFalt(jobb);
  if (saknade.length > 0) {
    throw new Error(`byggLoggrad vägrar: saknade fält — ${saknade.join(', ')}`);
  }
  return {
    datum,
    kampanj_id: jobb.kampanj_id,
    kampanj_namn: jobb.produkt,
    ad_account_id: adAccountId,
    kod: STARTSKOTT_KOD,
    genomford: true,
    spend_total: jobb.spend_total,
    kop_total: jobb.kop,
    cpa: jobb.cpa,
    break_even_cpa: jobb.break_even_cpa,
    roas: jobb.roas,
    vinst_procent: jobb.vinst_procent,
    kalla_url: jobb.kalla_url,
    motivering: `Klarat testet (${heltal(jobb.spend_total)} kr spenderat, `
      + `${decimal(jobb.vinst_procent, 1)} % vinst). Startskott skickat — `
      + 'OPS-butiken ska byggas med /ny-ops.',
    godkand_av: 'auto — Skalningskungen, tröskeln i agent/rond.mjs',
  };
}

// --------------------------------------------------------------------------
// CLI
// --------------------------------------------------------------------------

function huvud(argv) {
  const jobbIndex = argv.indexOf('--jobb');
  if (jobbIndex === -1 || !argv[jobbIndex + 1]) {
    console.error('Användning: node factory/startskott.mjs --jobb <fil.json> [--torr]');
    console.error(`Jobbfilen måste innehålla: ${KRAVDA_FALT.join(', ')}`);
    process.exit(1);
  }
  let jobb;
  try {
    jobb = JSON.parse(readFileSync(argv[jobbIndex + 1], 'utf8'));
  } catch (e) {
    console.error(`Kunde inte läsa jobbfilen: ${e.message}`);
    process.exit(1);
  }

  let text;
  try {
    text = formateraStartskott(jobb);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  console.log(text);
  console.log('');
  console.log('--- loggrad som ska skrivas i agent/budgetlogg.jsonl ---');
  const datum = jobb.datum ?? null;
  if (!datum) {
    console.log('(ingen "datum" i jobbfilen — loggraden visas inte, skicka datum: "YYYY-MM-DD")');
  } else {
    console.log(JSON.stringify(byggLoggrad(jobb, { datum })));
  }
  if (argv.includes('--torr')) console.log('\n[--torr] Ingenting skickades och ingenting skrevs.');
}

// Samma idiom som resten av factory/ (validera.mjs, discord.mjs) — pathToFileURL
// normaliserar sökvägen så filen kan importeras av testerna utan att CLI:t kör.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud(process.argv.slice(2));
}

// --------------------------------------------------------------------------
// ATT KOPPLA IN — det som återstår (Axel/nästa session)
// --------------------------------------------------------------------------
//
// 1. `agent/rond.mjs`: låt `forsta_batch`-behovet bära med sig `kalla_url`
//    (produktsidan på Bäverbutiken). Talet för tröskeln ändras INTE.
//
// 2. `.claude/commands/rond-auto.md` steg 4b: när ett `forsta_batch`-behov
//    dyker upp och `startskottHarGatt(logg, kampanj_id)` är false —
//    a) bygg jobbet av rondens egna siffror,
//    b) kör `formateraStartskott(jobb)`,
//    c) posta med `node agent/discord-post.mjs --kanal <kanal> "KLAR FÖR OPS" "<text>"`,
//    d) skriv `byggLoggrad(...)` i budgetloggen och pusha.
//
// 3. 🖐 Axels beslut som saknas:
//    - Vilken kanal? Startskottet är till Axel/VA:n. Discord-kanalerna läses
//      av det engelsktalande teamet, och rond-auto kräver ENGELSKA i alla tre
//      kanalerna. Ska startskottet vara svenskt behöver det en egen kanal.
//    - Ska tröskeln för OPS ligga på samma nivå som `forsta_batch`
//      (1 500 kr + 20 %) eller lägre? TRAPPAN.md varnar för att sätta den
//      för högt.
//
// 4. Ingen av punkterna ovan får utföras utan att `npm test` och
//    `node --test agent/test/*.test.mjs` är gröna efteråt.
