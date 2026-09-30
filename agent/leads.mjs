#!/usr/bin/env node
// leads.mjs — kommentarsleadsen in i briefsteget (Axels beslut 2026-09-30, alternativ A:
// "kollar du någonsin på kommentarerna?" — svaret var nej, ronden läste dem inte).
//
// Kommentarsgranskningen (/kommentarer, 05:40 varje dag, på `main`) skriver
// `kommentarer/leads.md`: en rad per lead med produkt/prefix, typ (invändning,
// köpfråga, förtroende …), vad kunderna säger, ett förslag och belägg
// (kommentars-id:n). Ronden kör på en annan gren, så filen läses ur
// `origin/main` med `git show` — aldrig en gammal kopia i arbetsträdet.
//
// Varje lead får ett stabilt id `VOC-<första belägget>`. En brief som bygger på
// en lead bär taggen `lead=VOC-…` (+ `kalla=voc`); `lardom.mjs --brief` loggar
// den på BRIEF-raden, och då räknas leaden som använd — ingen andra brief på
// samma lead. Leadsfilen på `main` rörs aldrig härifrån.
//
//   node agent/leads.mjs --prefix Takoverdrag        # öppna leads för prefixet (+ speglade, se SPEGEL)
//   node agent/leads.mjs --alla                      # antal öppna per prefix, till rapporten
//   node agent/leads.mjs --prefix Taljset --json
//   node agent/leads.mjs --fil <leads.md>            # läs en lokal fil i stället för origin/main
//
// Ren logik exporteras och testas i agent/test/leads.test.mjs.
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, '..');

/**
 * Speglade prefix: Bäverbutikens briefer på Taköverdraget och Termoskyddet
 * speglas till CaraShell (/ops-spegla), så CaraShells kundröster gäller samma
 * brief. Kommentarerna på CaraShellRoof-annonserna är Taköverdragets publik.
 */
export const SPEGEL = Object.freeze({
  takoverdrag: ['carashellroof'],
  termoskydd: ['carashellfront'],
});

/**
 * Förslag som uttryckligen säger att det INTE är en brief (en sidfix, en fråga
 * till Axel, eller en brief som väntar på något som inte finns). Sessionen
 * läser ändå varje lead — det här sorterar bara listan.
 */
const EJ_BRIEF = [
  /ingen brief/i, /ingen ny brief/i, /ingen ob-brief förrän/i, /^\s*axel:/i, /^\s*sidfix/i,
  /när distansprodukten finns/i, /fram till dess ingen annons/i, /brief först när sidan är rättad/i,
  /när leverantören (svarat|bekräftat)/i, /när kitet finns/i,
];

/** Parsar leads.md → [{ id, datum, verksamhet, prefix, typ, text, forslag, belagg[], status, bockad, briefbar }]. */
export function parseLeads(text) {
  const ut = [];
  let datum = null;
  const rader = String(text ?? '').split('\n');
  for (let i = 0; i < rader.length; i++) {
    const r = rader[i];
    const d = r.match(/^##\s+(\d{4}-\d{2}-\d{2})/);
    if (d) { datum = d[1]; continue; }
    const m = r.match(/^- \[( |x)\] \*\*(.+?)\s*·\s*(.+?)\*\*\s*·\s*([^—]+?)\s+—\s+(.*)$/);
    if (!m) continue;
    const [, kryss, verksamhet, prefix, typ, rest] = m;
    const [text2, forslag = ''] = rest.split(/\s+→\s+/);
    const detalj = rader[i + 1] && /^\s+- /.test(rader[i + 1]) ? rader[i + 1] : '';
    const belagg = (detalj.match(/belägg:\s*([^·]+)/)?.[1] ?? '').split(',').map((x) => x.trim()).filter(Boolean);
    const status = (detalj.match(/status:\s*(.+?)\s*$/)?.[1] ?? '').trim() || null;
    const id = belagg.length ? `VOC-${belagg[0]}` : `VOC-${datum}-${prefix.trim().toLowerCase()}-${ut.length}`;
    ut.push({
      id, datum, verksamhet: verksamhet.trim(), prefix: prefix.trim(), typ: typ.trim(),
      text: text2.trim(), forslag: forslag.trim(), belagg, status,
      bockad: kryss === 'x', briefbar: !EJ_BRIEF.some((re) => re.test(forslag)),
    });
  }
  return ut;
}

/** Lead-id:n som en BRIEF-rad redan bär (lead=VOC-…) — de är använda. */
export function anvandaLeads(logg) {
  const s = new Set();
  for (const r of logg ?? []) if (r?.kod === 'BRIEF' && r.lead) for (const id of String(r.lead).split(/\s*[,+]\s*/)) s.add(id.trim());
  return s;
}

/**
 * Öppna leads för ett annonsprefix (skiftlägesokänsligt, med speglade prefix):
 * inte bockade på main, inte använda i en BRIEF-rad. Nyaste först (filens ordning).
 */
export function oppnaLeads(leads, prefix, { logg = [], spegel = true } = {}) {
  const p = String(prefix ?? '').toLowerCase().replace(/_$/, '');
  const prefix2 = new Set([p, ...(spegel ? SPEGEL[p] ?? [] : [])]);
  const anv = anvandaLeads(logg);
  return leads.filter((l) => prefix2.has(l.prefix.toLowerCase()) && !l.bockad && !anv.has(l.id))
    .map((l) => ({ ...l, speglad: l.prefix.toLowerCase() !== p }));
}

/** Läser leads.md ur origin/main (färsk fetch), eller en lokal fil. Returnerar { text, kalla } eller kastar. */
export function lasLeadsText({ fil = null, rot = ROT } = {}) {
  if (fil) return { text: readFileSync(fil, 'utf8'), kalla: fil };
  try { execFileSync('git', ['-C', rot, 'fetch', '-q', 'origin', 'main'], { stdio: 'ignore', timeout: 60000 }); } catch { /* läs det som finns */ }
  const text = execFileSync('git', ['-C', rot, 'show', 'origin/main:kommentarer/leads.md'], { encoding: 'utf8', maxBuffer: 20e6 });
  return { text, kalla: 'origin/main:kommentarer/leads.md' };
}

function lasLogg(rot = ROT) {
  const fil = join(rot, 'agent', 'budgetlogg.jsonl');
  if (!existsSync(fil)) return [];
  return readFileSync(fil, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const flagga = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? (process.argv[i + 1] ?? true) : null; };
  let las;
  try { las = lasLeadsText({ fil: flagga('fil') }); } catch (e) {
    console.error(`LEADS GICK INTE ATT LÄSA: ${e.message.split('\n')[0]} — skriv det i rapporten; briefa ändå, men utan kundrösterna.`);
    process.exit(2);
  }
  const leads = parseLeads(las.text);
  const logg = lasLogg();
  if (flagga('alla')) {
    const per = new Map();
    for (const l of leads) {
      if (l.bockad || anvandaLeads(logg).has(l.id)) continue;
      const k = `${l.verksamhet} · ${l.prefix}`;
      const v = per.get(k) ?? { oppna: 0, briefbara: 0, senast: l.datum };
      v.oppna++; if (l.briefbar) v.briefbara++;
      per.set(k, v);
    }
    if (flagga('json')) { console.log(JSON.stringify(Object.fromEntries(per), null, 2)); process.exit(0); }
    console.log(`Kommentarsleads (${las.kalla}): ${leads.length} totalt`);
    for (const [k, v] of per) console.log(`  ${k}: ${v.oppna} öppna, ${v.briefbara} briefbara (senast ${v.senast})`);
    process.exit(0);
  }
  const prefix = flagga('prefix');
  if (!prefix || prefix === true) { console.error('Ange --prefix <Annonsprefix> eller --alla'); process.exit(2); }
  const oppna = oppnaLeads(leads, prefix, { logg });
  if (flagga('json')) { console.log(JSON.stringify(oppna, null, 2)); process.exit(0); }
  console.log(`Öppna kommentarsleads för ${prefix} (${las.kalla}): ${oppna.length} (${oppna.filter((l) => l.briefbar).length} briefbara)`);
  for (const l of oppna) {
    console.log(`\n${l.briefbar ? '🟢 BRIEFA' : '⏸  INTE BRIEF'} ${l.id}  [${l.datum} · ${l.typ}${l.speglad ? ` · speglad från ${l.prefix}` : ''}]`);
    console.log(`  Kunderna: ${l.text}`);
    console.log(`  Förslag:  ${l.forslag || '—'}`);
    console.log(`  Belägg:   ${l.belagg.length} kommentarer`);
  }
  if (!oppna.length) console.log('  (inga — skriv "0 öppna leads" i rapporten)');
}
