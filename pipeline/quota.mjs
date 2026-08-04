#!/usr/bin/env node
// Brief-kvoten: 20% av daglig budget / target-CPA × 3 = creatives som ska launchas var 3:e dag.
// Läser products/products.json och skriver ut plus/minus-läget per produkt.
//
//   node pipeline/quota.mjs                  → statusrapport
//   node pipeline/quota.mjs log mastern 4    → logga 4 launchade creatives idag på produkten "mastern"
//   node pipeline/quota.mjs log mastern 4 2026-08-06   → logga med explicit datum

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '..', 'products', 'products.json');
const CYCLE_DAYS = 3;

const db = JSON.parse(readFileSync(FILE, 'utf8'));

const [, , cmd, prodId, countArg, dateArg] = process.argv;

if (cmd === 'log') {
  const p = db.products.find(x => x.id === prodId);
  if (!p) { console.error(`Okänd produkt: ${prodId}. Finns: ${db.products.map(x => x.id).join(', ')}`); process.exit(1); }
  const count = Number(countArg);
  if (!Number.isFinite(count) || count <= 0) { console.error('Ange antal launchade creatives, t.ex: node pipeline/quota.mjs log mastern 4'); process.exit(1); }
  const date = dateArg ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { console.error(`Ogiltigt datum: ${date} (använd YYYY-MM-DD)`); process.exit(1); }
  p.launches.push({ date, count });
  writeFileSync(FILE, JSON.stringify(db, null, 2) + '\n');
  console.log(`Loggat: ${count} creatives på ${p.name} (${date})`);
}

const today = new Date(new Date().toISOString().slice(0, 10));
const lines = [];

for (const p of db.products.filter(x => x.status === 'aktiv')) {
  const perCycle = Math.ceil((p.daily_budget_sek * 0.2 / p.target_cpa_sek) * CYCLE_DAYS);
  const start = new Date(p.cycle_start);
  const daysElapsed = Math.max(0, Math.floor((today - start) / 86400000));
  const cyclesDue = Math.floor(daysElapsed / CYCLE_DAYS) + 1; // innevarande cykel räknas
  const due = cyclesDue * perCycle;
  const launched = p.launches.reduce((s, l) => s + l.count, 0);
  const balance = launched - due;
  const inCycleDay = (daysElapsed % CYCLE_DAYS) + 1;
  const icon = balance >= 0 ? '🟢' : '🔴';

  lines.push([
    `${icon} ${p.name}`,
    `   Budget: ${p.daily_budget_sek.toLocaleString('sv-SE')} kr/dag · Target-CPA: ${p.target_cpa_sek} kr`,
    `   Kvot: ${perCycle} creatives per 3-dagarscykel (${(perCycle / CYCLE_DAYS).toFixed(1)}/dag) · Dag ${inCycleDay} av 3 i cykel ${cyclesDue}`,
    `   Skulle ha launchat t.o.m. denna cykel: ${due} · Faktiskt launchat: ${launched}`,
    `   LÄGE: ${balance >= 0 ? '+' : ''}${balance} creatives ${balance >= 0 ? 'FÖRE' : 'EFTER'} plan`,
    '',
  ].join('\n'));
}

console.log('\n=== BRIEF-KVOTEN (' + today.toISOString().slice(0, 10) + ') ===\n');
console.log(lines.join('\n') || 'Inga aktiva produkter i products/products.json');
