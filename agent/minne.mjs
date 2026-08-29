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

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasLogg, LOGGFIL } from './logg.mjs';

const HÄR = dirname(fileURLToPath(import.meta.url));

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
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(e.message); process.exit(2); });
}
