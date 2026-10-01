#!/usr/bin/env node
// fakturor-hamta.mjs — hämtar en månads fakturor från sajten till en mapp.
//
//   node stonebite/fakturor-hamta.mjs --manad 2026-09            # lista + hämta
//   node stonebite/fakturor-hamta.mjs --manad 2026-09 --bara-lista
//   node stonebite/fakturor-hamta.mjs --manad 2026-09 --till /tmp/fakturor
//
// Det här är vägen Claude tar när Axel säger "samla ihop septembers fakturor
// och skicka dem till redovisningsbyrån" (2026-10-01): filerna laddas ner hit,
// sedan bifogas de i ett mejl (Gmail-connectorn i Axels session). Skriptet
// skickar ingenting själv.
//
// Kräver `STONEBITE_API_NYCKEL` i miljön — samma nyckel som på Railway — och
// valfritt `STONEBITE_URL` (standard https://www.stonebite.org).

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const arg = (namn) => { const i = argv.indexOf(namn); return i > -1 ? argv[i + 1] : null; };
const manad = arg('--manad');
if (!/^\d{4}-\d{2}$/.test(String(manad))) {
  console.error('Ange månaden: --manad ÅÅÅÅ-MM');
  process.exit(2);
}
const nyckel = process.env.STONEBITE_API_NYCKEL;
if (!nyckel) {
  console.error('STONEBITE_API_NYCKEL saknas i miljön — samma nyckel som sajten har på Railway.');
  process.exit(2);
}
const bas = (process.env.STONEBITE_URL ?? 'https://www.stonebite.org').replace(/\/+$/, '');
const till = arg('--till') ?? join(process.cwd(), 'stonebite', 'output', 'fakturor', manad);
const huvud = { Authorization: `Bearer ${nyckel}` };

const svar = await fetch(`${bas}/api/fakturor?manad=${manad}`, { headers: huvud });
if (!svar.ok) {
  console.error(`Sajten svarade ${svar.status}: ${await svar.text()}`);
  process.exit(1);
}
const { fakturor } = await svar.json();
console.log(`${fakturor.length} fakturor för ${manad}:`);
const perPerson = new Map();
for (const f of fakturor) perPerson.set(f.person, (perPerson.get(f.person) ?? 0) + 1);
for (const [p, n] of perPerson) console.log(`  ${p}: ${n}`);
if (argv.includes('--bara-lista') || !fakturor.length) process.exit(0);

mkdirSync(till, { recursive: true });
for (const f of fakturor) {
  const r = await fetch(`${bas}${f.fil}`, { headers: huvud });
  if (!r.ok) { console.error(`  ⚠️ ${f.person} ${f.namn}: ${r.status}`); continue; }
  const namn = `${f.manad} ${f.person} - ${f.namn}`.replace(/[\\/:*?"<>|]+/g, '_');
  writeFileSync(join(till, namn), Buffer.from(await r.arrayBuffer()));
  console.log(`  ✓ ${namn}`);
}
console.log(`\nSparat i ${till}`);
