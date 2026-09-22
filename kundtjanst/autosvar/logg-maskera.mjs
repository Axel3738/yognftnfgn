#!/usr/bin/env node
// logg-maskera.mjs — maskerar en befintlig autosvarslogg i efterhand:
// trådnyckelns adress hashas (som loggnyckel() gör sedan 2026-09-21 kväll),
// kundadressen maskeras, och rader med samma Message-ID slås ihop (behåller
// den senaste). Kördes på Bäverbutikens logg efter att två sessioner skrivit
// varsin logg samma kväll.
//
//   node kundtjanst/autosvar/logg-maskera.mjs kundtjanst/autosvar/logg/baverbutiken.jsonl

import { readFileSync, writeFileSync } from 'node:fs';
import { kundHash } from './logg.mjs';
import { maskeraAdress } from '../maskera.mjs';

export function maskeraRad(r) {
  const ut = { ...r };
  if (typeof ut.tradnyckel === 'string') ut.tradnyckel = ut.tradnyckel.replace(/^([^|]*@[^|]*)/, (adr) => kundHash(adr.replace(/^<|>$/g, '')));
  if (typeof ut.kund === 'string' && /^[^*]*@/.test(ut.kund)) ut.kund = maskeraAdress(ut.kund);
  if (typeof ut.till === 'string' && /^[^*]*@/.test(ut.till)) ut.till = maskeraAdress((ut.till.match(/<([^>]+)>/) ?? [null, ut.till])[1]);
  return ut;
}

export function maskeraLogg(text) {
  const rader = String(text ?? '').split('\n').filter((r) => r.trim()).map((r) => maskeraRad(JSON.parse(r)));
  const perId = new Map();
  for (const r of rader) perId.set(r.messageId || `${r.uid}|${r.tid}`, r);
  return [...perId.values()].sort((a, b) => String(a.tid).localeCompare(String(b.tid))).map((r) => JSON.stringify(r)).join('\n') + '\n';
}

if (process.argv[1] && process.argv[1].endsWith('logg-maskera.mjs')) {
  const fil = process.argv[2];
  if (!fil) { console.error('Ange loggfilen.'); process.exit(2); }
  const fore = readFileSync(fil, 'utf8');
  const efter = maskeraLogg(fore);
  writeFileSync(fil, efter);
  console.log(`${fil}: ${fore.split('\n').filter(Boolean).length} rader → ${efter.split('\n').filter(Boolean).length} rader, maskerade.`);
}
