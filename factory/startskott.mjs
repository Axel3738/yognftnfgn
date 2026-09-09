// STARTSKOTTET — meddelandet som säger att en produkt klarat testet på
// Bäverbutiken och ska få en egen OPS-butik.
//
// Kravspec: factory/SKALNINGSKUNGEN.md ("Startskottet").
// Ursprung: factory/startskott.mjs på grenen claude/amazing-mccarthy-jlmcm5.
// Ändrat här 2026-09-09: kopplingen till `agent/budgetlogg.jsonl` är borta.
// Den katalogen finns bara på grenen claude/daily-agent-discussion-uos5df, och
// en fil på `main` får inte importera något som inte finns här. Loggraden
// byggs i stället i en neutral form som `factory/produkter/register.json`
// (och budgetloggen, om någon kör den där) kan ta emot.
//
// Den här filen RÄKNAR ALDRIG och HÄMTAR ALDRIG. Den formaterar tal som någon
// annan redan räknat ut, och den vägrar om talen saknas. Ligger räkningen i
// kod blir svaret detsamma varje gång och går att testa — en modell som räknar
// själv hittar förr eller senare på ett tal. Tröskeln räknas i
// factory/skalning.mjs (`troskelkoll`) mot TROSKEL i factory/register.mjs.
//
// Noll beroenden. Inget nätverk, inga skrivningar.
//
//   node factory/startskott.mjs --jobb <fil.json> [--torr]
//
// ⚠️ Meddelandet är på SVENSKA. Det går till Axel eller VA:n, inte till
// redigerarna. Vilken kanal det ska landa i är ett öppet ägarbeslut
// (SKALNINGSKUNGEN-PLAN.md, "Öppna beslut" punkt 2) — landar det i en kanal
// som redigerarna läser ska det översättas till engelska först.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Koden startskottet skriver i loggen. Idempotensen hänger på den. */
export const STARTSKOTT_KOD = 'OPS_STARTSKOTT';

/**
 * Talen som MÅSTE finnas. Saknas ett enda vägrar skriptet — hellre inget
 * meddelande än ett meddelande med ett påhittat tal i.
 */
export const KRAVDA_FALT = [
  'produkt',        // produktnamnet som det heter i Meta
  'kampanj_id',     // kampanjens id eller namn — bär idempotensen
  'spend_total',    // total spend i kronor
  'kop',            // antal köp
  'cpa',            // kostnad per köp i kronor
  'break_even_cpa', // break-even-CPA i kronor
  'roas',           // ROAS
  'vinst_procent',  // vinst i procent av omsättningen
];

/**
 * `kalla_url` (produktsidan på Bäverbutiken) är INTE kravd.
 * Grenen jlmcm5 krävde den, men då blir utfallet tystnad när registret saknar
 * länken — och tystnad är det enda som är sämre än en lucka. Saknas den
 * skrivs en tydlig platshållare som Axel fyller i, och en varning följer med.
 * Ingen länk gissas fram.
 */
export const KALLA_URL_PLATSHALLARE = '<klistra in produktsidans länk på bäverbutiken.se>';

/**
 * Har startskottet redan gått för den här kampanjen?
 * Utan kollen skickas meddelandet varje rond så länge produkten ligger kvar
 * över tröskeln — och ett larm som kommer varje gång slutar folk läsa.
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
 * numrerade saker han ska göra, och kommandot färdigt att klistra in.
 * Rubriken säger vad som HÄNT, inte vad rutinen gjort — han ska kunna läsa
 * första raden på mobilen och veta vad det handlar om.
 */
export function formateraStartskott(jobb) {
  const saknade = saknadeFalt(jobb);
  if (saknade.length > 0) {
    throw new Error(`Startskottet vägrar: saknade fält — ${saknade.join(', ')}`);
  }
  const lank = typeof jobb.kalla_url === 'string' && jobb.kalla_url.trim() !== ''
    ? jobb.kalla_url.trim()
    : KALLA_URL_PLATSHALLARE;

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
    `/ny-ops ${lank}`,
    '```',
    '',
    'Sen är du klar. Jag har gjort resten.',
  ];
  if (lank === KALLA_URL_PLATSHALLARE) {
    rader.push('', '⚠️ Källänken står inte i registret — fyll i produktsidans URL i raden ovan.');
  }
  return rader.join('\n');
}

/**
 * Loggraden. Neutral form: samma fältnamn som budgetloggen på
 * agent-grenen använder, så raden kan skrivas där utan översättning, men utan
 * någon import därifrån.
 *
 * `datum` skickas in — filen läser aldrig klockan själv, så testerna kan köras
 * på ett fast datum och två körningar samma dygn ger samma rad.
 *
 * ⚠️ RADEN FÅR ALDRIG BÄRA `ny_budget`. Kontrollerat mot agent/logg.mjs
 * 2026-09-09: `dagarSedanAndring` räknar bara rader med `genomford: true` OCH
 * ett ändligt `ny_budget`. Lägger någon till fältet här blir startskottet en
 * budgetändring i kadensspärrens ögon, och kampanjen fryses i tre dygn utan
 * att någon rört budgeten.
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
    kalla_url: jobb.kalla_url ?? '',
    motivering: `Klarat testet (${heltal(jobb.spend_total)} kr spenderat, `
      + `${decimal(jobb.vinst_procent, 1)} % vinst). Startskott skickat — `
      + 'OPS-butiken ska byggas med /ny-ops.',
    godkand_av: 'auto — /skalningskungen, tröskeln TROSKEL i factory/register.mjs',
  };
}

// ------------------------------------------------------------------- CLI

function huvud(argv) {
  const i = argv.indexOf('--jobb');
  if (i === -1 || !argv[i + 1]) {
    console.error('Användning: node factory/startskott.mjs --jobb <fil.json> [--torr]');
    console.error(`Jobbfilen måste innehålla: ${KRAVDA_FALT.join(', ')}`);
    process.exit(1);
  }
  let jobb;
  try {
    jobb = JSON.parse(readFileSync(argv[i + 1], 'utf8'));
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
  console.log('\n--- loggrad ---');
  if (!jobb.datum) {
    console.log('(ingen "datum" i jobbfilen — loggraden visas inte, skicka datum: "YYYY-MM-DD")');
  } else {
    console.log(JSON.stringify(byggLoggrad(jobb, { datum: jobb.datum })));
  }
  if (argv.includes('--torr')) console.log('\n[--torr] Ingenting skickades och ingenting skrevs.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud(process.argv.slice(2));
}
