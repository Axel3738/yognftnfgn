#!/usr/bin/env node
// rutin.mjs — räknar ut vad en ny Routine ska ha, och vad som är fel om den
// byggs slarvigt. Skriver INGENTING till claude.ai: själva skapandet görs av
// sessionen med create_session + create_trigger, för de är MCP-verktyg och
// inte något ett skript når. Det här är räknandet och spärrarna.
//
//   node factory/rutin.mjs --tid 13:20 --kommando "/notionkorning"
//   node factory/rutin.mjs --tid 07:00 --kommando "/skalningskungen tankguard" --butik tankguard
//   node factory/rutin.mjs --tid 00:01 --kommando "/notionscalercs tankguard" --butik tankguard
//   node factory/rutin.mjs --lista            visar husets sex nattrutiner + skalningsronderna + nattvakterna
//
// Nattvakten (/notionscalercs <butik>, Axels beslut 2026-09-10) går VARJE natt
// 00:01 svensk tid. Det är 22:01 UTC dagen före på sommaren — cronen ligger
// alltså på "fel" dag i UTC, och det är rätt. Vilka nätter som blir
// briefnätter (ons + sön) avgör skriptet (factory/register.mjs), inte cron.
//
// Varför filen finns: tre saker har gått fel varje gång en rutin byggts för
// hand, och alla tre är räknefel eller glömska — inte omdöme.
//
//   1. CRON STÅR I UTC OCH FÖLJER INTE SOMMARTID. En cron satt i juli går en
//      timme fel i november. Räkna alltid om från önskad SVENSK tid; minns
//      aldrig riktningen. (CLAUDE.md-varningen finns för att det hänt.)
//   2. EN RUTIN SOM STARTAR NY SESSION VARJE GÅNG KAN INTE PUSHA. Den saknar
//      repo som källa, så proxyn ger den aldrig något credential: allt den
//      lärde sig dör med containern. Mätt tre gånger (2026-09-03, 09-04,
//      09-05). Rutinen måste bindas till en FAST session.
//   3. RUTINEN KLONAR `main`. Ligger kommandofilen kvar på en gren hittar den
//      ingenting och ger upp direkt.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
// Kommandofilerna. Testerna pekar om katalogen till en fixtur, så ett
// kommando som skrivs parallellt av en annan session aldrig är testets facit.
export const KOMMANDOKATALOG = join(ROT, '.claude', 'commands');
// Markören i en kommandofil som säger att rutinen INTE ska ha några
// connectors: allt går via env-nycklar (NOTION_TOKEN, META_ACCESS_TOKEN,
// DISCORD_WEBHOOK_URL) och REST. Det är hela poängen med nattvakten — inga
// godkännandeklick — så att kommandofilen nämner Notion räcker inte som skäl
// att koppla Notion-connectorn.
export const INGA_CONNECTORS = 'CONNECTORS: inga';

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const kommandonamn = (kommando) => String(kommando || '').trim().split(/\s+/)[0].replace(/^\//, '');

// ------------------------------------------------------------------ tid → cron

/** Är svensk tid CEST (sommartid, UTC+2) vid det här datumet?
 *  EU-regeln: sommartid från sista söndagen i mars 01:00 UTC till sista
 *  söndagen i oktober 01:00 UTC. */
export function arSommartid(datum) {
  const ar = datum.getUTCFullYear();
  const sistaSondagen = (manad) => {
    const d = new Date(Date.UTC(ar, manad + 1, 0)); // sista dagen i månaden
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());   // backa till söndag
    d.setUTCHours(1, 0, 0, 0);
    return d;
  };
  return datum >= sistaSondagen(2) && datum < sistaSondagen(9);
}

/** Svensk klockslag → cron i UTC. Returnerar BÅDA halvåren, för en cron kan
 *  bara stå för ett av dem — och den som glömmer det får en rutin som går fel
 *  timme halva året. */
export function tillCron(svenskTid, { dagar = '*', datum = new Date() } = {}) {
  const m = String(svenskTid).match(/^(\d{1,2})[:.](\d{2})$/);
  if (!m) throw new Error(`Tiden "${svenskTid}" går inte att läsa — skriv den som HH:MM svensk tid.`);
  const [tim, min] = [Number(m[1]), Number(m[2])];
  if (tim > 23 || min > 59) throw new Error(`"${svenskTid}" är ingen giltig tid.`);

  const cronFor = (offset) => {
    // Dras timmen under noll hamnar körningen dagen före — det syns i
    // veckodagsfältet och får aldrig tappas bort tyst.
    const utcTim = tim - offset;
    const dagskifte = utcTim < 0 ? -1 : utcTim > 23 ? 1 : 0;
    return {
      cron: `${min} ${((utcTim % 24) + 24) % 24} * * ${dagar}`,
      dagskifte,
    };
  };

  const sommar = cronFor(2); // CEST, UTC+2
  const vinter = cronFor(1); // CET,  UTC+1
  const nuSommar = arSommartid(datum);

  return {
    svenskTid,
    galler: nuSommar ? 'CEST (sommartid, UTC+2)' : 'CET (vintertid, UTC+1)',
    cron: nuSommar ? sommar.cron : vinter.cron,
    cronSommar: sommar.cron,
    cronVinter: vinter.cron,
    dagskifte: nuSommar ? sommar.dagskifte : vinter.dagskifte,
    // Samma cron kan inte gälla båda halvåren. Den som sätter en rutin i juli
    // måste öka timmen med ett i november — annars går den 12:20 i stället
    // för 13:20.
    maste_andras_vid_omstallning: sommar.cron !== vinter.cron,
    omstallning: nuSommar
      ? `Vid vinteromställningen (sista söndagen i oktober): ändra till "${vinter.cron}".`
      : `Vid sommaromställningen (sista söndagen i mars): ändra till "${sommar.cron}".`,
  };
}

// ------------------------------------------------------------------ spärrarna

/** Vad som måste stämma innan en rutin skapas. Varje punkt har gått fel
 *  minst en gång. Returnerar { ok, hinder[], varningar[] }. */
export function granska({ kommando, butik = null, gren = null, rutiner = [], katalog = KOMMANDOKATALOG }) {
  const hinder = [];
  const varningar = [];

  // 1. Kommandofilen måste finnas — och den måste finnas på main.
  const namn = kommandonamn(kommando);
  if (!namn) hinder.push('Inget kommando angivet.');
  else {
    const fil = join(katalog, `${namn}.md`);
    if (!existsSync(fil)) {
      hinder.push(`.claude/commands/${namn}.md finns inte i trädet — rutinen skulle klona main och inte hitta något att köra.`);
    }
  }
  if (gren && gren !== 'main') {
    hinder.push(`Du står på grenen "${gren}". Rutiner klonar main — merga dit först, annars är rutinen schemalagd men inte igång.`);
  }

  // 2. Butiken måste finnas om kommandot tar en.
  if (butik) {
    const b = join(ROT, 'factory', 'butiker', `${butik}.yaml`);
    if (!existsSync(b)) hinder.push(`factory/butiker/${butik}.yaml finns inte — rutinen skulle köra mot en butik som inte är byggd.`);
  }

  // 3. Dubbletter. Två rutiner med samma jobb kör båda, och den ena upptäcks
  //    först när något gjorts två gånger. (Hände 2026-09-08.)
  //    Kommandonamnet matchas med ORDGRÄNS: "/cs" är inte "/notionscalercs",
  //    och är en butik angiven räknas bara rutiner som också nämner butiken —
  //    butik A:s nattvakt är ingen dubblett av butik B:s.
  const ordgrans = namn ? new RegExp(`(^|\\s|/)${escapeRegex(namn)}(\\s|$)`) : null;
  const butiksgrans = butik ? new RegExp(`(^|[\\s:/])${escapeRegex(butik)}(\\s|$)`, 'i') : null;
  const likadana = rutiner.filter((r) => {
    const text = `${r.prompt || ''} ${r.name || ''}`;
    if (!ordgrans || !ordgrans.test(text)) return false;
    return butiksgrans ? butiksgrans.test(text) : true;
  });
  if (likadana.length) {
    hinder.push(
      `Det finns redan ${likadana.length} rutin${likadana.length > 1 ? 'er' : ''} som kör "${namn}": ` +
      likadana.map((r) => `${r.name || '(namnlös)'} (${r.id || 'utan id'})`).join(', ') +
      '. Uppdatera den i stället för att skapa en till.'
    );
  }

  // 4. Connectors ärvs inte. Det är ingen blockad, men det är det som gör att
  //    en rutin kan starta, se glad ut och ändå inte kunna läsa Notion.
  if (harIngaConnectors(namn, katalog)) {
    varningar.push('Rutinen behöver INGA connectors — Notion/Meta/Discord går via env-nycklar (NOTION_TOKEN, META_ACCESS_TOKEN, DISCORD_WEBHOOK_URL). Koppla ingen connector: det är så den slipper godkännandeklick.');
  } else {
    const behover = connectorsFor(namn, { katalog });
    if (behover.length) {
      varningar.push(
        `Rutinen behöver ${behover.join(', ')}. Connectors ärvs INTE från sessionen — ` +
        'koppla dem på själva rutinen i Routines-vyn, annars står den helt utan mcp-verktyg.'
      );
    }
  }
  const nycklar = nycklarFor(namn, { katalog });
  const saknade = nycklar.filter((n) => !process.env[n]);
  if (saknade.length) {
    varningar.push(`Env-nycklar som saknas här: ${saknade.join(', ')}. Rutinens container behöver dem, inte den här sessionen.`);
  }

  return { ok: hinder.length === 0, hinder, varningar };
}

/** Kommandofilens text, eller '' om den inte finns. */
function kommandotext(namn, katalog = KOMMANDOKATALOG) {
  const fil = join(katalog, `${namn}.md`);
  return existsSync(fil) ? readFileSync(fil, 'utf8') : '';
}

/** true om kommandofilen uttryckligen säger `CONNECTORS: inga`. */
export function harIngaConnectors(namn, katalog = KOMMANDOKATALOG) {
  return kommandotext(namn, katalog).includes(INGA_CONNECTORS);
}

/** Vilka connectors ett kommando faktiskt behöver, läst ur kommandofilen.
 *  Undantaget: står `CONNECTORS: inga` i filen är svaret [] oavsett vad
 *  texten i övrigt nämner — rutinen går via env-nycklar och REST. */
export function connectorsFor(namn, { katalog = KOMMANDOKATALOG } = {}) {
  const text = kommandotext(namn, katalog);
  if (!text || text.includes(INGA_CONNECTORS)) return [];
  const ut = [];
  if (/notion/i.test(text)) ut.push('Notion');
  if (/\bdrive\b|google.?drive/i.test(text)) ut.push('Google Drive');
  if (/\bslack\b/i.test(text)) ut.push('Slack');
  if (/shopify/i.test(text) && !/shopify-mcp.*förbjuden|FÖRBJUDEN/i.test(text)) ut.push('Shopify');
  return ut;
}

/** Env-nycklar kommandot nämner. Rutinen kör i en egen container — den ärver
 *  inte den här sessionens miljö heller. */
export function nycklarFor(namn, { katalog = KOMMANDOKATALOG } = {}) {
  const text = kommandotext(namn, katalog);
  if (!text) return [];
  return [...new Set([...text.matchAll(/\b([A-Z][A-Z0-9_]{5,})\b/g)].map((m) => m[1]))]
    .filter((n) => /TOKEN|KEY|SECRET|WEBHOOK|PASSWORD/.test(n));
}

// ------------------------------------------------------------------ förslaget

/** Hela underlaget för en rutin: cron, namn, taggar och de MCP-anrop
 *  sessionen ska göra. Ingenting skapas här. */
export function byggForslag({ kommando, tid, butik = null, gren = null, rutiner = [], datum = new Date(), katalog = KOMMANDOKATALOG }) {
  const tider = tillCron(tid, { datum });
  const kontroll = granska({ kommando, butik, gren, rutiner, katalog });
  const namn = kommandonamn(kommando);
  // Nattvakten heter det den är, per butik — så listan i Routines-vyn går att
  // läsa utan att veta vad "notionscalercs" betyder.
  // Samma sak för butikens leveransrunda och NO-översättning (Axels beslut
  // 2026-09-11: tre rutiner per OPS-butik, alla byggda av /notionscalercs setup).
  const BUTIKSRUTINER = { notionscalercs: 'Nattvakten', 'ops-leverans': 'Leveransrundan', 'ops-oversatt': 'Översättning NO' };
  const butiksrutin = butik ? BUTIKSRUTINER[namn] ?? null : null;
  const etikett = butiksrutin ? `${butiksrutin}: ${butik}` : butik ? `${namn} — ${butik}` : namn;
  const sessionstitel = butiksrutin ? `Rutin: ${butiksrutin} ${butik}` : `Rutin: ${etikett}`;
  const taggar = [`routine:${namn}`, butik ? `butik:${butik}` : null].filter(Boolean);

  return {
    ...tider,
    kommando,
    butik,
    rutinnamn: etikett,
    sessionstitel,
    taggar,
    kontroll,
    // Ordningen är inte utbytbar: sessionen måste finnas innan triggern kan
    // bindas till den, och utan bindningen kan rutinen inte pusha.
    steg: [
      {
        verktyg: 'create_session',
        varfor: 'En rutin utan fast session får inget credential och kan aldrig pusha — allt den lär sig dör med containern.',
        argument: {
          title: sessionstitel,
          source_url: 'https://github.com/Axel3738/yognftnfgn',
          outcome_branch: 'main',
          tags: taggar,
        },
      },
      {
        verktyg: 'create_trigger',
        varfor: 'persistent_session_id binder rutinen till sessionen ovan. Utan det startar den en tom container.',
        argument: {
          name: etikett,
          cron_expression: tiderCron(tider),
          persistent_session_id: '<id från steget ovan>',
          prompt: kommando,
          initiation: 'human_request',
        },
      },
    ],
  };
}

const tiderCron = (t) => t.cron;

// ------------------------------------------------------------------ CLI

function flagga(namn) {
  const i = process.argv.indexOf(`--${namn}`);
  return i > -1 ? process.argv[i + 1] : null;
}

function lista() {
  console.log('\nHusets rutiner (svensk tid → cron):\n');
  const kanda = [
    ['04:15', '/translate-no', 'Daglig NO-videobatch'],
    ['05:30', '/no-recensioner', 'Norska recensioner'],
    ['06:00', '/commission', 'Commission (skriptet avgör kördag)'],
    ['13:20', '/notionkorning', 'Leveransrundan'],
    ['15:00', '/oversatt NO', 'Översättning till Norge'],
    ['20:00', '/bildannonser', 'Bildannonser'],
  ];
  const butiker = existsSync(join(ROT, 'factory', 'butiker'))
    ? readdirSync(join(ROT, 'factory', 'butiker')).filter((f) => f.endsWith('.yaml') && f !== 'testbutiken.yaml')
    : [];
  for (const b of butiker) kanda.push(['07:00', `/skalningskungen ${b.replace('.yaml', '')}`, 'Skalningsronden (var tredje dag, skriptet avgör)']);
  for (const b of butiker) kanda.push(['00:01', `/notionscalercs ${b.replace('.yaml', '')}`, 'Nattvakten (varje natt; briefer ons+sön, skriptet avgör)']);
  // Butikens leverans och NO-översättning ligger efter Bäverbutikens (13:20 /
  // 15:00) så inte alla containrar startar samtidigt.
  for (const b of butiker) kanda.push(['13:40', `/ops-leverans ${b.replace('.yaml', '')}`, 'Leveransrundan OPS (To be Reviewed → live i SE-kampanjen)']);
  for (const b of butiker) kanda.push(['15:40', `/ops-oversatt ${b.replace('.yaml', '')}`, 'Översättning NO OPS (SE-ACTIVE to be translated → live i NO-kampanjen)']);

  for (const [tid, kmd, vad] of kanda) {
    const t = tillCron(tid);
    const skifte = t.dagskifte ? `  (dagen ${t.dagskifte < 0 ? 'före' : 'efter'} i UTC — rätt)` : '';
    console.log(`  ${tid}  ${t.cron.padEnd(16)} ${kmd.padEnd(32)} ${vad}${skifte}`);
  }
  console.log('\n⚠️ Cronen ovan gäller ' + tillCron('12:00').galler + '.');
  console.log('   Vid omställningen ändras varje rad — se --tid för den enskilda.\n');
}

if (process.argv[1] && process.argv[1].endsWith('rutin.mjs')) {
  if (process.argv.includes('--lista')) {
    lista();
  } else {
    const tid = flagga('tid');
    const kommando = flagga('kommando');
    if (!tid || !kommando) {
      console.error('Ange --tid HH:MM (svensk tid) och --kommando "/nagot". Eller --lista.');
      process.exit(2);
    }
    let gren = null;
    try {
      gren = readFileSync(join(ROT, '.git', 'HEAD'), 'utf8').trim().replace('ref: refs/heads/', '');
    } catch { /* ingen git — spärren hoppas över, och det syns nedan */ }

    const f = byggForslag({ kommando, tid, butik: flagga('butik'), gren });

    console.log(`\nRutin: ${f.rutinnamn}`);
    console.log(`  ${f.svenskTid} svensk tid  →  cron "${f.cron}"  (${f.galler})`);
    if (f.dagskifte) console.log(`  ⚠️ Omräkningen korsar midnatt: cronen ligger dagen ${f.dagskifte > 0 ? 'efter' : 'före'} i UTC — det är rätt, rör den inte.`);
    if (f.maste_andras_vid_omstallning) console.log(`  ⚠️ ${f.omstallning}`);

    if (f.kontroll.hinder.length) {
      console.log('\nSTOPP:');
      for (const h of f.kontroll.hinder) console.log(`  ❌ ${h}`);
    }
    for (const v of f.kontroll.varningar) console.log(`\n  ⚠️ ${v}`);

    console.log('\nSessionen gör sen, i den här ordningen:');
    for (const s of f.steg) {
      console.log(`\n  ${s.verktyg}`);
      console.log(`    varför: ${s.varfor}`);
      console.log(`    ${JSON.stringify(s.argument)}`);
    }
    console.log('');
    process.exit(f.kontroll.ok ? 0 : 1);
  }
}
