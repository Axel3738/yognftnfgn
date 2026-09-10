#!/usr/bin/env node
// STARTSKOTTET — larmet som säger att en produkt klarat testet på
// Bäverbutiken och ska få en egen OPS-butik.
//
// **Axels beslut 2026-09-10.** Ronden slutar göra briefer. Tidigare byggde
// den en hel creative-batch och en ny Notion-hub varje gång en produkt
// passerade testet. Nu gör den EN sak i stället: postar det här meddelandet
// i Discord-kanalen #ops-startskott. Ingen creative strategy, inga nya
// Notion-databaser, inga brief-rundor. Budgethalvan av ronden är oförändrad.
//
// Skriptet RÄKNAR ALDRIG. Det formaterar tal som `agent/rond.mjs` redan
// räknat ut, och vägrar om ett tal saknas. Skälet står i agent/README.md:
// ligger räkningen i kod blir svaret detsamma varje gång och går att testa.
// Tröskeln är FORSTA_BATCH_SPEND_SEK (1 500 kr) och
// FORSTA_BATCH_VINST_PROCENT (20 %) i agent/rond.mjs — rör dem inte här.
//
//   node agent/startskott.mjs --jobb <fil.json> --torr   # visa, skicka inget
//   node agent/startskott.mjs --jobb <fil.json>          # posta i Discord
//   node agent/startskott.mjs --test --torr              # provlarmet, torrt
//   node agent/startskott.mjs --test                     # provlarmet, skarpt
//
// Noll beroenden. Node ≥ 20.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { skicka } from './discord-post.mjs';
import {
  arAvstangd,
  FORSTA_BATCH_SPEND_SEK,
  FORSTA_BATCH_VINST_PROCENT,
} from './rond.mjs';

/** Koden startskottet skriver i budgetloggen. Idempotensen hänger på den. */
export const STARTSKOTT_KOD = 'OPS_STARTSKOTT';

/**
 * Produkten har redan en OPS-butik — larma aldrig för den.
 *
 * Behövs för produkter som fick sin butik innan startskottet fanns
 * (Övervakningskameran → HeimGuard, IBC-Tanköverdraget → TankGuard). Utan
 * raden hade de larmat en gång i onödan, för de ligger stadigt över tröskeln.
 */
export const FINNS_REDAN_KOD = 'OPS_FINNS_REDAN';

/**
 * Kanalen. Axel skapade den 2026-09-10 för just det här larmet
 * (id 1547549671239720990 i servern Bäverbutiken).
 *
 * ⚠️ Det här är den ENDA kanal som skrivs på SVENSKA. Alla andra rutinposter
 * är engelska för att redigerarna läser samma kanaler (agent/discord.json,
 * Axels order 2026-09-02). #ops-startskott läses av Axel och VA:n, och Axel
 * skrev mallen på svenska i sitt eget svarsformat 2026-09-10. Översätt den
 * inte "för konsekvensens skull" — formatet är hans.
 */
export const KANAL = 'ops-startskott';

/**
 * Fälten som MÅSTE finnas. Saknas ett enda vägrar skriptet — hellre inget
 * larm än ett larm med ett påhittat tal i.
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
 * Samma mönster som `arAvstangd` i agent/rond.mjs: bara genomförda rader.
 * Utan kollen postas larmet varje morgon så länge produkten ligger kvar över
 * tröskeln — och ett larm som kommer varje dag slutar folk läsa.
 */
export function startskottHarGatt(logg, kampanjId) {
  if (!Array.isArray(logg)) return false;
  return logg.some((rad) => rad
    && rad.kampanj_id === kampanjId
    && rad.genomford === true
    && (rad.kod === STARTSKOTT_KOD || rad.kod === FINNS_REDAN_KOD));
}

/**
 * Vilka produkter ska få ett startskott i dag?
 *
 * ⚠️ **Läser tröskeln DIREKT, inte via `annonsbehov`.** Det är hela poängen.
 * `annonsbehov` ger `forsta_batch` bara till produkter som ALDRIG haft en
 * batch — den som redan fått en hamnar för alltid i `brief_runda` i stället.
 * Byggde man larmet på `forsta_batch` skulle det därför bara utlösas för
 * splitternya produkter, medan de 14 bevisade produkter som redan fått
 * briefer under det gamla systemet aldrig fick något larm alls.
 * *(Mätt i budgetloggen 2026-09-10: 45 SE-kampanjer, 14 med batch — bland dem
 * Fiskespöhållaren, Båtmotorskyddet 420D och MC-Kapellet.)*
 *
 * Villkoret är Axels och är oförändrat: passerad total spend OCH vinstkravet.
 * Talen importeras ur `rond.mjs` — de får aldrig skrivas av här.
 *
 * @param {Array} rader utfallet ur `bedomKampanj` (id, namn, spendTotal, dom)
 * @returns {Array<{kampanj_id: string, namn: string, spendTotal: number, vinstProcent: number}>}
 */
export function startskottsbehov(rader, { logg = [], marknad = 'SE' } = {}) {
  // Bara Sverige. Norska annonser är svenska annonser översatta i ett eget
  // flöde — en norsk kampanj ska aldrig utlösa en ny butik.
  if (marknad !== 'SE') return [];
  if (!Array.isArray(rader)) return [];

  const behov = [];
  for (const r of rader) {
    if (!r || !r.id) continue;
    // Fryst = datan går inte att lita på. Avstängd eller på väg till trappan =
    // produkten är på väg ut, inte in i en egen butik.
    const kod = r.dom?.kod;
    if (kod === 'FRYST' || kod === 'STANG_AV' || kod === 'ATGARDSTRAPPAN') continue;
    // ...och aldrig en kampanj ronden redan HAR stängt av, oavsett dagens dom.
    if (arAvstangd(logg, r.id)) continue;
    // Larmet går en gång per produkt. Aldrig igen.
    if (startskottHarGatt(logg, r.id)) continue;

    const vinst = r.dom?.vinstProcent;
    if (!Number.isFinite(r.spendTotal) || r.spendTotal < FORSTA_BATCH_SPEND_SEK) continue;
    if (!Number.isFinite(vinst) || vinst < FORSTA_BATCH_VINST_PROCENT) continue;

    behov.push({
      kampanj_id: r.id,
      namn: r.namn,
      spendTotal: r.spendTotal,
      vinstProcent: vinst,
    });
  }
  // Störst spend först — den mest bevisade produkten är den som är mest värd
  // en egen butik.
  return behov.sort((a, b) => b.spendTotal - a.spendTotal);
}

/** Svenskt heltal med tusenmellanslag. */
function heltal(n) {
  return Math.round(Number(n)).toLocaleString('sv-SE');
}

/** Svenskt decimaltal med komma. */
function decimal(n, decimaler = 2) {
  return Number(n).toFixed(decimaler).replace('.', ',');
}

/**
 * Kontrollerar jobbet. Tom lista = kör.
 * Tom sträng, null och NaN räknas som saknat; 0 gör det INTE — noll köp är
 * ett tal, om än ett dåligt.
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
 * Meddelandet, i Axels mall (hans egen text 2026-09-10) och hans svarsformat:
 * en mening per rad, max tio ord, numrerade saker han ska göra.
 *
 * Rubriken skickas separat — discord-post.mjs fetstilar den själv, så den
 * ska INTE bära asterisker här.
 *
 * @returns {{rubrik: string, text: string}}
 */
export function formateraStartskott(jobb) {
  const saknade = saknadeFalt(jobb);
  if (saknade.length > 0) {
    throw new Error(`Startskottet vägrar: saknade fält — ${saknade.join(', ')}`);
  }

  const text = [
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
  ].join('\n');

  return { rubrik: `KLAR FÖR OPS: ${jobb.produkt}`, text };
}

/**
 * Loggraden. Samma fältform som agent/budgetlogg.jsonl, så den kan skrivas
 * med `skrivRad` i agent/logg.mjs utan översättning.
 *
 * `datum` skickas in — skriptet läser aldrig klockan själv, så testerna kan
 * köras på ett fast datum och två körningar samma dygn ger identisk rad.
 *
 * ⚠️ RADEN FÅR ALDRIG BÄRA `ny_budget`. Kontrollerat mot agent/logg.mjs
 * 2026-09-09: `dagarSedanAndring` räknar bara rader med `genomford: true` OCH
 * ett ändligt `ny_budget`. Läggs fältet till blir startskottet en
 * budgetändring i kadensspärrens ögon, och kampanjen fryses i tre dygn utan
 * att någon rört budgeten.
 *
 * Övriga läsare är kontrollerade och säkra som koden ser ut i dag:
 *   arAvstangd (rond.mjs)   — läser bara STANG_AV och ATERAKTIVERA
 *   annonsbehov KLAR-listan — bara FORSTA_BATCH_KLAR och CS_BATCH_KLAR
 *   senasteRadMedKod        — tar en uttrycklig kodlista
 * `OPS_STARTSKOTT` krockar inte med någon av de 20 koder som fanns i
 * budgetloggen 2026-09-09 (374 rader).
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
      + `${decimal(jobb.vinst_procent, 1)} % vinst). Startskott postat i `
      + `#${KANAL} — OPS-butiken ska byggas med /ny-ops.`,
    godkand_av: 'auto — Axels beslut 2026-09-10, tröskeln i agent/rond.mjs',
  };
}

/**
 * Postar larmet. Använder husets postare (agent/discord-post.mjs) — skriv
 * aldrig egen curl-kod mot Discord.
 *
 * @returns {Promise<{skickat: boolean, kanal: string, rubrik: string, text: string}>}
 */
export async function skickaStartskott(jobb, { torr = false, kanal = KANAL } = {}) {
  const { rubrik, text } = formateraStartskott(jobb);
  if (torr) return { skickat: false, kanal, rubrik, text };
  await skicka({ rubrik, text, kanal });
  return { skickat: true, kanal, rubrik, text };
}

/**
 * Provlarmet. Axels egen testtext 2026-09-10 — den finns för att kunna
 * kontrollera hela kedjan (token, kanal, format) utan att vänta på att en
 * riktig produkt passerar tröskeln.
 *
 * ⚠️ Talen här är PÅHITTADE och märkta som test i produktnamnet. De får
 * aldrig kopieras in i en riktig körning.
 */
export const PROVLARM = Object.freeze({
  produkt: 'TEST av larmet — inte en riktig produkt',
  kampanj_id: 'TEST-INGEN-KAMPANJ',
  kalla_url: 'https://bäverbutiken.se/products/test',
  spend_total: 1500,
  kop: 10,
  cpa: 150,
  break_even_cpa: 300,
  roas: 3.2,
  vinst_procent: 25,
});

// --------------------------------------------------------------------------
// CLI
// --------------------------------------------------------------------------

async function huvud(argv) {
  const torr = argv.includes('--torr');
  let jobb;

  if (argv.includes('--test')) {
    jobb = { ...PROVLARM };
  } else {
    const i = argv.indexOf('--jobb');
    if (i === -1 || !argv[i + 1]) {
      console.error('Användning: node agent/startskott.mjs --jobb <fil.json> [--torr]');
      console.error('            node agent/startskott.mjs --test [--torr]');
      console.error(`Jobbfilen måste innehålla: ${KRAVDA_FALT.join(', ')}`);
      process.exit(2);
    }
    try {
      jobb = JSON.parse(readFileSync(argv[i + 1], 'utf8'));
    } catch (e) {
      console.error(`Kunde inte läsa jobbfilen: ${e.message}`);
      process.exit(1);
    }
  }

  let utfall;
  try {
    utfall = await skickaStartskott(jobb, { torr });
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  console.log(`**${utfall.rubrik}**`);
  console.log(utfall.text);
  console.log('');
  if (utfall.skickat) console.log(`✅ Postat i #${utfall.kanal}.`);
  else console.log(`[--torr] Ingenting postades i #${utfall.kanal}.`);

  if (jobb.datum) {
    console.log('');
    console.log('--- loggrad till agent/budgetlogg.jsonl ---');
    console.log(JSON.stringify(byggLoggrad(jobb, { datum: jobb.datum })));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud(process.argv.slice(2)).catch((fel) => {
    console.error(`Startskottet misslyckades: ${fel.message}`);
    process.exit(1);
  });
}
