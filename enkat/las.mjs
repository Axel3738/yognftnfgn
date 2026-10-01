#!/usr/bin/env node
// enkat/las.mjs — läser enkätsvaren ur Matstrumpors supportlåda.
//
//   node enkat/las.mjs            torrt: hittar och tolkar svaren, flyttar inget
//   node enkat/las.mjs --skarpt   flyttar svaren till INBOX.ENKAT; ett svar som
//                                 bär ett orderärende flaggas och stannar i
//                                 inkorgen hos VA:n (klagomål göms aldrig)
//   node enkat/las.mjs --mapp ENKAT   läser det som redan flyttats (för kodningen)
//
// Svaren känns igen på markören (ENKAT-v1) i Shopifys kontaktnotis — aldrig på
// ämnet eller svenska etiketter, eftersom notisen skiftar språk. Autosvaret rör
// dem inte: formuläret skickar från noreply@, som arSystem() räknar som
// systemadress (vakttestet i enkat/test/).
//
// ⛔ Råsvaren committas ALDRIG (git kan inte glömma, och GDPR-raden lovar högst
// 12 månader). De ligger i mappen INBOX.ENKAT. Det skriptet sparar är
// enkat/output/ (gitignorerad): strukna svar, vecka i stället för datum.

import { mkdirSync, existsSync, readFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { oppnaBrevlada } from '../kundtjanst/brevlada.mjs';
import { lasKonfig, tolkaFalt, arEnkat, svarUr, arProblem, arSpam, stryk, svarsId, vecka } from './enkat.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const UT = join(HAR, 'output');

const arg = process.argv.slice(2);
const val = (n, std) => { const i = arg.indexOf(n); return i >= 0 ? arg[i + 1] : std; };
const skarpt = arg.includes('--skarpt');

export function tidigareId(fil) {
  if (!existsSync(fil)) return new Set();
  return new Set(readFileSync(fil, 'utf8').split('\n').filter(Boolean).map((r) => { try { return JSON.parse(r).id; } catch { return null; } }).filter(Boolean));
}

async function main() {
  const k = lasKonfig();
  const mapp = val('--mapp', 'INBOX');
  const sidor = Number(val('--sidor', k.sidor_att_lasa));
  const b = oppnaBrevlada(k.brand);
  const ut = { lasta: 0, kandidater: 0, svar: 0, flyttade: 0, problem: 0, spam: 0, tomma: 0, redanSparade: 0 };
  mkdirSync(UT, { recursive: true });
  try {
    for (let sida = 1; sida <= sidor; sida++) {
      const l = await b.lista({ mapp, sida, antal: 50 });
      ut.lasta += l.rader.length;
      for (const rad of l.rader) {
        if (!/shopify/i.test(`${rad.franAdress} ${rad.fran}`)) continue;
        ut.kandidater++;
        let m;
        try { m = await b.las(rad.uid, { mapp }); } catch (e) { if (e.kod === 'MEJL_SAKNAS') continue; throw e; }
        if (!arEnkat(m.helText, k)) continue;
        ut.svar++;
        const falt = tolkaFalt(m.helText);
        const s = svarUr(falt, k);
        const id = svarsId(m.messageId);
        const problem = arProblem(s.svar);
        const spam = arSpam(s.svar);
        if (problem) ut.problem++;
        if (spam) ut.spam++;
        if (s.tomt) ut.tomma++;
        const fil = join(UT, `svar-${vecka(new Date(m.datum ?? Date.now()))}.jsonl`);
        if (tidigareId(fil).has(id)) { ut.redanSparade++; }
        else {
          const rad2 = {
            id, vecka: vecka(new Date(m.datum ?? Date.now())), butik: k.butik, kanal: s.kanal, produkt: s.produkt,
            svar: Object.fromEntries(Object.entries(s.svar).map(([n, v]) => [n, stryk(v, k)])),
            problem, spam, tomt: s.tomt, kalla: 'voc', voc: 'enkat', version: k.version,
          };
          appendFileSync(fil, `${JSON.stringify(rad2)}\n`);
        }
        console.log(`${problem ? '⚠️ ORDERÄRENDE' : spam ? '🗑 spam' : s.tomt ? '· tomt' : '✅'} ${id} · kanal ${s.kanal || '-'} · produkt ${s.produkt || '-'}`);
        if (!skarpt || mapp !== 'INBOX') continue;
        if (problem) { await b.flagga(rad.uid, { mapp }); continue; }
        await b.flytta(rad.uid, { mapp, till: k.mapp, skapa: true });
        ut.flyttade++;
      }
    }
  } finally {
    await b.loggaUt().catch(() => {});
  }
  console.log(`\n${skarpt ? 'SKARPT' : 'TORRT'} · ${mapp}: ${ut.lasta} mejl lästa, ${ut.kandidater} från Shopify, ${ut.svar} enkätsvar (${ut.problem} orderärenden kvar hos VA:n, ${ut.spam} spam, ${ut.tomma} tomma), ${ut.flyttade} flyttade till INBOX.${k.mapp}, ${ut.redanSparade} redan sparade.`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
