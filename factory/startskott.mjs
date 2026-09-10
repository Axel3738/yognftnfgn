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
//   node factory/startskott.mjs --jobb <fil.json> [--torr] [--discord]
//
// --discord (Axels beslut 2026-09-10): boten sköter allt själv. Den letar
// upp servern (STARTSKOTT_SERVER, default "Bäverbutiken" — det är där
// produkterna testas), hittar eller SKAPAR kanalen (STARTSKOTT_KANAL,
// default "ops-startskott") och pingar serverns ÄGARE. Ingen människa
// skapar någon kanal och ingen kopierar något id ("vi har ju boten för det").
// Överstyrning i miljön: DISCORD_STARTSKOTT_SERVER (namn eller id),
// DISCORD_STARTSKOTT_KANAL (kanalnamn), DISCORD_AXEL_ID (ping i stället för
// ägaren). Det är HELA larmet — inga Notion-sidor, inga briefer. Kräver
// DISCORD_BOT_TOKEN; saknas den skrivs texten bara i chatten, aldrig tyst.
//
// ⚠️ Meddelandet är på SVENSKA. Det går till Axel eller VA:n, inte till
// redigerarna. Vilken kanal det ska landa i är ett öppet ägarbeslut
// (SKALNINGSKUNGEN-PLAN.md, "Öppna beslut" punkt 2) — landar det i en kanal
// som redigerarna läser ska det översättas till engelska först.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Discords tak för ett meddelande. */
export const DISCORD_MAXLANGD = 2000;
/** Servern larmet går till om inget annat sägs — där Bäverbutikens produkter testas. */
export const STARTSKOTT_SERVER = 'Bäverbutiken';
/** Kanalen boten skapar om den saknas. */
export const STARTSKOTT_KANAL = 'ops-startskott';

/**
 * Väljer servern ur botens lista. `onskad` är ett namn eller ett id; utan
 * önskemål gäller STARTSKOTT_SERVER. Ingen träff = null — aldrig "första
 * bästa", boten sitter i sex servrar (mätt 2026-09-10) och fel server är
 * fel människa.
 */
export function valjServer(guilds, onskad = STARTSKOTT_SERVER) {
  const lista = Array.isArray(guilds) ? guilds : [];
  const o = String(onskad ?? '').trim().toLowerCase();
  if (!o) return null;
  return lista.find((g) => g.id === o) ?? lista.find((g) => String(g.name).toLowerCase() === o) ?? null;
}

/**
 * Texten som postas i Discord: pingen först (så Axel får en notis), sen
 * startskottet ordagrant. Saknas ping-id:t går texten ändå — men med en rad
 * som säger det, så tystnaden inte döljs. Kapas aldrig tyst.
 */
export function byggDiscordText(text, { pingId = null } = {}) {
  const huvud = pingId ? `<@${pingId}>\n` : '⚠️ DISCORD_AXEL_ID saknas — ingen ping.\n';
  let ut = huvud + String(text ?? '');
  if (ut.length > DISCORD_MAXLANGD) {
    const svans = '\n… [kapad]';
    ut = ut.slice(0, DISCORD_MAXLANGD - svans.length) + svans;
  }
  return ut;
}

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

async function huvud(argv) {
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
  if (argv.includes('--torr')) {
    console.log('\n[--torr] Ingenting skickades och ingenting skrevs.');
    return;
  }
  if (argv.includes('--discord')) {
    const svar = await skickaStartskott(text);
    console.log(`\n✅ Discord: postat i #${svar.kanal.name} på ${svar.server.name}`
      + `${svar.kanal.skapad ? ' (kanalen skapades nu)' : ''}, ping till ${svar.pingId} (meddelande ${svar.id})`);
  }
}

/**
 * Hela Discord-steget: server → kanal (skapas vid behov) → ping → post.
 * Kastar med klartext om boten inte sitter i servern — larmet får aldrig
 * försvinna tyst, så CLI:t skriver texten i chatten FÖRE det här anropet.
 */
export async function skickaStartskott(text) {
  if (!process.env.DISCORD_BOT_TOKEN) {
    throw new Error('DISCORD_BOT_TOKEN saknas i miljön — larmet står bara i chatten.');
  }
  const { hamtaGuilds, hamtaGuild, hittaEllerSkapaKanal, skickaMeddelande } = await import('./discord.mjs');
  const onskad = process.env.DISCORD_STARTSKOTT_SERVER || STARTSKOTT_SERVER;
  const guilds = await hamtaGuilds();
  const vald = valjServer(guilds, onskad);
  if (!vald) {
    throw new Error(`Boten sitter inte i servern "${onskad}". Den sitter i: ${guilds.map((g) => g.name).join(', ') || 'ingen'}.`);
  }
  const server = await hamtaGuild(vald.id);
  const kanal = await hittaEllerSkapaKanal(server.id, process.env.DISCORD_STARTSKOTT_KANAL || STARTSKOTT_KANAL);
  const pingId = process.env.DISCORD_AXEL_ID || server.owner_id;
  const svar = await skickaMeddelande(kanal.id, byggDiscordText(text, { pingId }));
  return { id: svar.id, server, kanal, pingId };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud(process.argv.slice(2)).catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
