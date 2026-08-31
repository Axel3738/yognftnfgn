#!/usr/bin/env node
// Synkar budgetloggen från dashboardens inbäddade minne.
//
// De schemalagda körningarna kan LÄSA repot men inte pusha till det. Därför
// bor det färskaste minnet i dashboard-artefakten (som varje körning kan läsa
// och publicera om), och git-kopian släpar efter tills en session med
// push-rättighet kommer ikapp.
//
//   node agent/minne.mjs <sparad-dashboard.html>
//
// Regel: den källa som har FLEST rader vinner. Har artefakten fler rader än
// repots budgetlogg.jsonl skrivs filen över; annars behålls repots och en
// varning skrivs. Exitkod 0 = synkat, 2 = kunde inte tolka.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasLogg, LOGGFIL } from './logg.mjs';

const HÄR = dirname(fileURLToPath(import.meta.url));
const REPOROT = join(HÄR, '..');

/**
 * Filutkorgen: minnesfiler en schemalagd körning lade i dashboarden i stället
 * för att pusha. Bara ofarliga relativa sökvägar accepteras.
 */
export function extraheraFiler(html) {
  const träff = String(html).match(
    /<script type="application\/json" id="filutkorg">([\s\S]*?)<\/script>/,
  );
  if (!träff) return {};
  try {
    const filer = JSON.parse(träff[1]);
    if (filer === null || typeof filer !== 'object' || Array.isArray(filer)) return {};
    const rena = {};
    for (const [sokvag, innehall] of Object.entries(filer)) {
      if (typeof innehall !== 'string') continue;
      if (!/^(products|docs|agent)\//.test(sokvag)) continue;
      if (sokvag.includes('..') || sokvag.includes('\\')) continue;
      rena[sokvag] = innehall;
    }
    return rena;
  } catch {
    return {};
  }
}

export function extraheraLogg(html) {
  const träff = String(html).match(
    /<script type="application\/json" id="budgetlogg">([\s\S]*?)<\/script>/,
  );
  if (!träff) return null;
  try {
    const logg = JSON.parse(träff[1]);
    return Array.isArray(logg) ? logg : null;
  } catch {
    return null;
  }
}

async function main() {
  const fil = process.argv[2];
  if (!fil) {
    console.error('Användning: node agent/minne.mjs <sparad-dashboard.html>');
    process.exit(2);
  }
  const html = await readFile(fil, 'utf8');
  const urArtefakt = extraheraLogg(html);
  if (urArtefakt === null) {
    console.error('MINNESSYNK MISSLYCKADES: hittade inget budgetlogg-block i HTML-filen. Kör INTE ronden på repots (möjligen gamla) logg utan att förstå varför.');
    process.exit(2);
  }
  const urRepo = await lasLogg();
  if (urArtefakt.length >= urRepo.length) {
    const rader = urArtefakt.map((r) => JSON.stringify(r)).join('\n');
    await writeFile(LOGGFIL, rader.length ? `${rader}\n` : '', 'utf8');
    console.log(`minnet synkat: ${urArtefakt.length} rader från dashboarden (repot hade ${urRepo.length})`);
  } else {
    console.log(`VARNING: repots logg (${urRepo.length} rader) är längre än dashboardens (${urArtefakt.length}) — behåller repots. Publicera om dashboarden så den kommer ikapp.`);
  }

  // Filutkorgen: skriv filerna till arbetskopian OCH spegla till agent/utkorg/
  // så de överlever nästa dashboard-ombyggnad tills en push-session committat
  // dem och tömt utkorgen.
  const filer = extraheraFiler(html);
  const skrivna = [];
  const hoppade = [];
  for (const [sokvag, innehall] of Object.entries(filer)) {
    const varfor = await varforInteSkriva(sokvag, innehall);
    if (varfor) { hoppade.push(`${sokvag} (${varfor})`); continue; }
    for (const mal of [join(REPOROT, sokvag), join(HÄR, 'utkorg', sokvag)]) {
      await mkdir(dirname(mal), { recursive: true });
      await writeFile(mal, innehall, 'utf8');
    }
    skrivna.push(sokvag);
  }
  if (skrivna.length > 0) {
    console.log(`filutkorg: ${skrivna.length} fil(er) utskrivna: ${skrivna.join(', ')}`);
    console.log('En session med push-rättighet: committa filerna, töm agent/utkorg/ och publicera om dashboarden.');
  }
  for (const h of hoppade) console.log(`VARNING: hoppade över ${h}`);
}

/**
 * Utkorgen skrev tidigare över ALLT rakt av. Det kostade produktkartan 11
 * kampanjer två gånger: dashboardens inbäddade kopia är från körningen som
 * publicerade den, och har ingen aning om vad som lagts till i repot sedan
 * dess. Budgetloggen hade en spärr mot att krympa; kartan hade ingen.
 *
 * Returnerar en anledning att INTE skriva, eller null när det är säkert.
 */
async function varforInteSkriva(sokvag, nyttInnehall) {
  const mal = join(REPOROT, sokvag);
  let gammalt;
  try { gammalt = await readFile(mal, 'utf8'); } catch { return null; } // ny fil, alltid ok
  if (gammalt === nyttInnehall) return null;
  if (!sokvag.endsWith('.json')) return null;

  let a; let b;
  try { a = JSON.parse(gammalt); b = JSON.parse(nyttInnehall); } catch { return null; }

  // En lista som krymper är nästan alltid en äldre kopia som skriver över en
  // nyare. Hellre en varning än tyst dataförlust.
  for (const nyckel of Object.keys(a)) {
    if (!Array.isArray(a[nyckel])) continue;
    const fore = a[nyckel].length;
    const efter = Array.isArray(b?.[nyckel]) ? b[nyckel].length : 0;
    if (efter < fore) {
      return `${nyckel} skulle krympa ${fore} → ${efter} — dashboardens kopia är äldre`;
    }
  }
  return null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e.message); process.exit(2); });
}
