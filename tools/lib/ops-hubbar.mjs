#!/usr/bin/env node
// ops-hubbar.mjs — vilka Notion-hubbar som tillhör OPS-butikerna, så att
// Bäverbutikens läsare kan hoppa över dem PER ID.
//
// Bakgrund (2026-09-10): OPS-butikernas creative hubs (HeimGuard, TankGuard,
// DryTrek, AdventLane, TackleBay …) flyttades från teamspacet Bäverbutiken till
// egna teamspaces, men SAMMA integration ("Bäverbutiken RUTINER", NOTION_TOKEN)
// är inbjuden till dem. Notions REST-sök kan inte fråga på teamspace, så
// "alla databaser integrationen ser" (tools/notion-kalla.mjs) fångar OPS-hubbarna
// också — och Leveransrundan skulle då ladda upp deras rader i Bäverbutikens
// konto 1867947880635861, commission skulle räkna dem, översättningen ta dem.
// OPS-butikerna kör i kontot 915422744950975 med egen rutin.
//
// Källan är factory/produkter/register.json → poster → notion.database_id.
// Registret fylls av setup-kommandot (`node factory/register.mjs notion <nyckel>
// <id>`). Är fälten tomma är filtret en no-op — men det LOGGAR varje gång, så
// det syns i rapporten att spärren finns och vad den undantog.
//
// Filtret går ALDRIG på titel. Titlar byts, id:n består.
//
//   node tools/lib/ops-hubbar.mjs        listar OPS-hubbarna i registret
//
// Inga beroenden, inga nätanrop.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
export const REGISTERFIL = 'factory/produkter/register.json';

/** Bäverbutikens egna poster i registret har nyckeln `baverbutiken/<id>`.
 *  Allt annat är en OPS-butik (butik/produkt). */
export const BAVERBUTIKEN_PREFIX = 'baverbutiken/';

/** Notion-id:n skrivs både med och utan bindestreck (och ibland versaler).
 *  Jämför alltid på den här formen. Tomt in = tomt ut. */
export function normaliseraId(id) {
  return String(id ?? '').trim().toLowerCase().replace(/-/g, '');
}

/** Ren kärna: registret som objekt → Map(normaliserat id → { nyckel, name, id }).
 *  Poster utan database_id hoppas över (registret är tomt tills setup fyllt det). */
export function opsHubbarUrRegister(register) {
  const karta = new Map();
  const poster = register?.poster ?? {};
  for (const [nyckel, post] of Object.entries(poster)) {
    if (nyckel.startsWith(BAVERBUTIKEN_PREFIX)) continue;
    const id = normaliseraId(post?.notion?.database_id);
    if (!id) continue;
    if (!karta.has(id)) {
      karta.set(id, { nyckel, name: post.notion?.name ?? '', id: post.notion.database_id });
    }
  }
  return karta;
}

/** Läser registret från disk. Saknad fil eller trasig JSON = tom Map, aldrig krasch:
 *  filtret får inte fälla en rutin, det ska bara undanta det det känner till. */
export function opsHubbar(rot = ROT) {
  const fil = join(rot, REGISTERFIL);
  if (!existsSync(fil)) return new Map();
  try {
    return opsHubbarUrRegister(JSON.parse(readFileSync(fil, 'utf8')));
  } catch {
    return new Map();
  }
}

/** Är det här databas-id:t en OPS-hub? */
export function arOpsHubb(id, karta) {
  return karta.has(normaliseraId(id));
}

/** Tar bort OPS-hubbarna ur en hubblista och loggar det — VARJE gång, även när
 *  noll undantogs, så det syns i rapporten att spärren kördes.
 *  `idAv` säger var id:t sitter i listans objekt (default `h.id`).
 *  `logg` = null tystar (för hjälplistor som redan loggats en gång). */
export function utanOpsHubbar(hubbar, karta, { idAv = (h) => h.id, logg = console.error } = {}) {
  const bort = [];
  const kvar = [];
  for (const h of hubbar ?? []) {
    const träff = karta.get(normaliseraId(idAv(h)));
    if (träff) bort.push(träff.name || träff.nyckel);
    else kvar.push(h);
  }
  if (logg) logg(loggrad(bort, karta));
  return kvar;
}

/** Loggraden: "OPS-hubbar undantagna: N (namn…)". */
export function loggrad(bortNamn, karta) {
  if (!karta.size) {
    return `OPS-hubbar undantagna: 0 (registret ${REGISTERFIL} har inga OPS-hub-id:n ännu — fylls av \`node factory/register.mjs notion <nyckel> <id>\`)`;
  }
  const namn = bortNamn.length ? bortNamn.join(', ') : 'ingen i den här listan';
  return `OPS-hubbar undantagna: ${bortNamn.length} (${namn}) · registret känner ${karta.size}`;
}

// ------------------------------------------------------------- fristående CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const karta = opsHubbar();
  if (!karta.size) {
    console.log(`Inga OPS-hubbar i ${REGISTERFIL} ännu (alla notion.database_id är tomma utanför Bäverbutiken).`);
    console.log('Fyll i med: node factory/register.mjs notion <nyckel> <database-id>');
  } else {
    console.log(`${karta.size} OPS-hub(bar) som Bäverbutikens rutiner hoppar över:`);
    for (const h of karta.values()) console.log(`  ${h.nyckel.padEnd(40)} ${h.name || '(namn saknas)'}  ${h.id}`);
  }
}
