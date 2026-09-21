#!/usr/bin/env node
// kor.mjs — räknar månadens bonus och skriver utfallet.
//
//   node bonus/kor.mjs                 # den här månaden
//   node bonus/kor.mjs --manad 2026-08 # en gången månad
//   node bonus/kor.mjs --torr          # räkna och visa, skriv ingen fil
//   node bonus/kor.mjs --utan-nat      # bara det som redan finns i repot
//
// LÄS-BART mot alla källor. Körningen ändrar ingen status, rör inget
// annonskonto och skickar inga pengar — den räknar och skriver en fil.
//
// Utfallet hamnar i bonus/utfall/<manad>.json och läses av sajten. Insatser
// som folk rapporterat in ligger i bonus/insatser.jsonl och räknas först när
// de har status "godkand".

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { raknaUt } from './motor.mjs';
import { judgeMe, trustpilot, kundtjanstMatningar, produkttest, commission, sammanfattaRecensioner, sammanfattaProdukttest } from './kallor.mjs';

export const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const REGLER = join(ROT, 'bonus', 'regler.json');
export const PERSONER = join(ROT, 'bonus', 'personer.json');
export const UTFALL = join(ROT, 'bonus', 'utfall');

/**
 * Föränderliga filer (folk som läggs till på sajten, insatser som rapporteras
 * in) hör INTE hemma i git-registret: en container som startas om skulle
 * skriva över dem, och en deploy skulle radera dem. De hamnar i dataspegeln,
 * som i drift pekar på en volym som överlever en ny version.
 */
export function datamapp(env = process.env, rot = ROT) {
  return env.STONEBITE_DATA || join(rot, 'stonebite', 'data');
}

export const INSATSER = join(datamapp(), 'insatser.jsonl');
export const PERSONER_EXTRA = join(datamapp(), 'personer-extra.json');

/** Notion-databaser som är produkttest-center. Fler butiker = fler rader. */
export const PRODUKTTEST_DB = [
  { id: '3a7270ab-908c-807d-b90d-c55d885cad13', namn: 'Bäverbutiken' },
  { id: '472270ab-908c-83cb-868e-8127667a3eee', namn: 'AdventLane' },
];

export function lasRegler(fil = REGLER) {
  return JSON.parse(readFileSync(fil, 'utf8'));
}

/**
 * Folkregistret: basen i git + tilläggen från sajten. Samma id i båda ⇒
 * tillägget vinner (det är det någon senast klickade in).
 */
export function lasPersoner(fil = PERSONER, extraFil = PERSONER_EXTRA) {
  const bas = JSON.parse(readFileSync(fil, 'utf8')).personer ?? [];
  let extra = [];
  if (existsSync(extraFil)) {
    try { extra = JSON.parse(readFileSync(extraFil, 'utf8')).personer ?? []; } catch { extra = []; }
  }
  const karta = new Map(bas.map((p) => [p.id, p]));
  for (const p of extra) karta.set(p.id, { ...(karta.get(p.id) ?? {}), ...p });
  return [...karta.values()].map((p) => ({
    ...p,
    fornamn: p.fornamn || String(p.namn ?? '').split(/\s+/)[0],
    brands: p.brands ?? [],
    alias: p.alias ?? [],
    extraRoller: p.extraRoller ?? [],
  }));
}

/** Skriver/uppdaterar en person i tilläggsfilen (sajtens register). */
export function sparaPerson(person, extraFil = PERSONER_EXTRA) {
  mkdirSync(dirname(extraFil), { recursive: true });
  let nuvarande = [];
  if (existsSync(extraFil)) {
    try { nuvarande = JSON.parse(readFileSync(extraFil, 'utf8')).personer ?? []; } catch { nuvarande = []; }
  }
  const karta = new Map(nuvarande.map((p) => [p.id, p]));
  karta.set(person.id, { ...(karta.get(person.id) ?? {}), ...person });
  writeFileSync(extraFil, `${JSON.stringify({
    kommentar: 'Personer tillagda eller ändrade på sajten. Basregistret är bonus/personer.json; den här filen vinner vid samma id.',
    personer: [...karta.values()],
  }, null, 2)}\n`);
  return person;
}

/** Inrapporterade insatser. En rad per JSON-objekt; senaste raden per id vinner. */
export function lasInsatser(fil = INSATSER) {
  if (!existsSync(fil)) return [];
  const senaste = new Map();
  for (const rad of readFileSync(fil, 'utf8').split('\n')) {
    if (!rad.trim()) continue;
    try {
      const i = JSON.parse(rad);
      if (i?.id) senaste.set(i.id, i);
    } catch { /* trasig rad hoppas över, aldrig hela filen */ }
  }
  return [...senaste.values()];
}

export function skrivInsats(insats, fil = INSATSER) {
  mkdirSync(dirname(fil), { recursive: true });
  appendFileSync(fil, `${JSON.stringify(insats)}\n`);
  return insats;
}

/** Enkel periodkoll utan att dra in hela motorn. */
function iPeriodenEnkel(datum, period) {
  const d = String(datum ?? '').slice(0, 10);
  return Boolean(d) && d >= period.fran && d <= period.till;
}

export function manadsperiod(manad = null, nu = new Date()) {
  const m = manad ?? `${nu.getFullYear()}-${String(nu.getMonth() + 1).padStart(2, '0')}`;
  const [ar, mm] = m.split('-').map(Number);
  const sista = new Date(Date.UTC(ar, mm, 0)).getUTCDate();
  return { namn: m, fran: `${m}-01`, till: `${m}-${String(sista).padStart(2, '0')}` };
}

export async function kor({ manad = null, utanNat = false, rot = ROT, env = process.env, nu = new Date(), logg = console.log } = {}) {
  const regler = lasRegler(join(rot, 'bonus', 'regler.json'));
  const personer = lasPersoner(join(rot, 'bonus', 'personer.json'), join(datamapp(env, rot), 'personer-extra.json'));
  const insatser = lasInsatser(join(datamapp(env, rot), 'insatser.jsonl'));
  const period = manadsperiod(manad, nu);
  const kallor = [];

  logg(`Bonus för ${period.namn} (${period.fran} – ${period.till})`);
  logg(`  ${personer.length} personer i registret, ${insatser.length} inrapporterade insatser`);

  const kt = kundtjanstMatningar(rot);
  kallor.push({ id: 'kundtjanst', status: kt.status, orsak: kt.orsak, antal: kt.tvister.length });

  const com = commission(rot);
  kallor.push({ id: 'commission', status: com.status, orsak: com.orsak, antal: com.rader.length });

  let recensioner = [];
  let produkttestrader = [];
  if (utanNat) {
    kallor.push({ id: 'recensioner', status: 'hoppad', orsak: 'kördes med --utan-nat', antal: 0 });
    kallor.push({ id: 'produkttest', status: 'hoppad', orsak: 'kördes med --utan-nat', antal: 0 });
  } else {
    const jm = await judgeMe({ env, logg });
    kallor.push({ id: 'judge.me', status: jm.status, orsak: jm.orsak, antal: jm.recensioner.length });
    const tp = await trustpilot({ env, logg });
    kallor.push({ id: 'trustpilot', status: tp.status, orsak: tp.orsak, antal: tp.recensioner.length });
    recensioner = [...jm.recensioner, ...tp.recensioner];

    const pt = await produkttest({ env, databaser: PRODUKTTEST_DB, logg });
    kallor.push({ id: 'produkttest', status: pt.status, orsak: pt.orsak, antal: pt.rader.length });
    produkttestrader = pt.rader;
  }

  // Godkända recensioner som rapporterats in för hand räknas som mätningar:
  // texten bär personens namn så motorn hittar den precis som en hämtad.
  for (const i of insatser) {
    if (i.uppdrag !== 'recension_med_namn' || i.status !== 'godkand') continue;
    const person = personer.find((p) => p.id === i.personId);
    recensioner.push({
      kalla: i.kalla ?? 'Inrapporterad',
      butik: i.butik ?? '',
      betyg: Number(i.betyg) || 5,
      kund: i.kund ?? '',
      text: `${i.text ?? ''} ${person?.fornamn ?? ''}`.trim(),
      datum: i.datum,
      lank: i.lank ?? '',
      inrapporterad: true,
    });
  }

  const matningar = {
    recensioner,
    tvister: kt.tvister,
    kundtjanst: kt.veckor,
    produkttest: produkttestrader,
    commission: com.rader,
  };

  const utfall = raknaUt({ regler, personer, matningar, insatser, period });
  utfall.kallor = kallor;
  utfall.matningar = {
    recensioner: recensioner.length,
    tvister: kt.tvister.length,
    veckor: kt.veckor.length,
    produkttest: produkttestrader.length,
  };
  // Sammanfattningarna är det sajten ritar. Rådatan (1 900 recensioner) följer
  // ALDRIG med in i en sparad fil — den blir megabyte i git för ingenting.
  utfall.detaljer = {
    recensioner: sammanfattaRecensioner(recensioner, personer),
    produkttest: sammanfattaProdukttest(produkttestrader),
    tvister: kt.tvister.filter((t) => t.oppen).slice(0, 60),
    program: regler.program,
    insatser: insatser.filter((i) => iPeriodenEnkel(i.datum, period)),
  };

  logg('');
  for (const p of utfall.personer) {
    if (p.summa <= 0) continue;
    logg(`  ${p.namn.padEnd(22)} ${String(p.summa).padStart(8)} ${utfall.valuta}  (${p.rader.map((r) => `${r.namn} ×${r.antal}`).join(', ')})`);
  }
  const utan = utfall.personer.filter((p) => p.summa <= 0);
  if (utan.length) logg(`  ${utan.length} personer utan bonus den här perioden.`);
  if (utfall.otilldelat.length) logg(`  ⚠️ ${utfall.otilldelat.length} träffar kunde inte kopplas till en person — se utfallet.`);
  logg(`  Summa: ${utfall.summa} ${utfall.valuta}`);

  return utfall;
}

export function spara(utfall, mapp = UTFALL) {
  mkdirSync(mapp, { recursive: true });
  const fil = join(mapp, `${utfall.period.namn}.json`);
  // Utbetalningsunderlaget sparas; detaljerna (recensionstexter, produktlistor)
  // hör hemma i snapshoten som sajten läser, inte i utbetalningsarkivet.
  const { detaljer, ...kvitto } = utfall;
  writeFileSync(fil, `${JSON.stringify(kvitto, null, 1)}\n`);
  return fil;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--manad');
  const manad = i > -1 ? argv[i + 1] : null;
  const utfall = await kor({ manad, utanNat: argv.includes('--utan-nat') });
  if (argv.includes('--torr')) {
    console.log('\n--torr: inget skrevs.');
  } else {
    console.log(`\nSkrev ${spara(utfall)}`);
  }
}
