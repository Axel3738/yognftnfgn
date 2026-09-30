#!/usr/bin/env node
// kor.mjs — översättningsrutinen för Matstrumpor: granskaren + kön + planen.
//
//   node matstrumpor/marknader/oversatt/kor.mjs --marknader          granskaren: läget i varje marknad
//   node matstrumpor/marknader/oversatt/kor.mjs --vinnare            SE-vinnare som borde in i kön
//   node matstrumpor/marknader/oversatt/kor.mjs --vinnare --flytta --skarpt   flyttar dem (bara om någon marknad skalar)
//   node matstrumpor/marknader/oversatt/kor.mjs --plan [--json]      kön × skalande marknader → att göra
//   node matstrumpor/marknader/oversatt/kor.mjs --klar <sid-id> --skarpt       kommentar + FINISHED när alla mål bär annonsen
//
// Läser bara: Meta (META_ACCESS_TOKEN, kontot "nya kungen") och Notion (NOTION_TOKEN, Matstrumpors hub).
// Skriver bara: Notion-status/kommentar (--flytta, --klar, med --skarpt) och oversatt/lage.json.
// ⛔ Rör aldrig budget, aldrig en kampanjs eller ett adsets status — PAUSED är Axels beslut, och att
// skala Matstrumpor är hans (konfig.json → skalning). Själva översättningen och uppladdningen görs av
// sessionen enligt .claude/commands/matstrumpor-oversatt.md (annonser/bygg.mjs --ny-aktiv).

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { api, alla } from '../../../tools/meta-lib.mjs';
import { klaraRader } from '../../../tools/notion-kalla.mjs';
import { idagSE, plusDagar, varde } from '../../meta.mjs';
import { domMarknad, malMarknader, LAGE } from './granskare.mjs';
import { planera, vinnare } from './plan.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const REPO = join(ROT, '../../..');
const K = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
const M = JSON.parse(readFileSync(join(ROT, '../annonser/marknader.json'), 'utf8'));
const MK = JSON.parse(readFileSync(join(ROT, '../konfig.json'), 'utf8'));
const SE = JSON.parse(readFileSync(join(ROT, '../../konfig.json'), 'utf8'));
const arg = process.argv.slice(2);
const har = (f) => arg.includes(f);
const efter = (f) => (arg.includes(f) ? arg[arg.indexOf(f) + 1] : null);
const skarpt = har('--skarpt');
const AW = JSON.stringify(['7d_click']);

const ETIKETT = { av: '⏸ av', testas: '🧪 testas', for_lite: '… för lite data', under: '📉 under break-even', skalar: '🚀 skalar' };

/** Marknadens break-even för sushi 5-par (landad kostnad ur cogs.json + ECB-kurs), annars reserven. */
async function breakEven(kod, k, kurser) {
  const reserv = { roas: K.granskare.break_even_reserv, kalla: 'reserv: Sveriges break-even, marknadens kostnad saknas i cogs.json' };
  if (!kurser || kurser.status !== 'ok') return { ...reserv, kalla: `reserv: ECB-kursen gick inte att hämta (${kurser?.orsak ?? 'okänt'})` };
  const { landadKostnad, breakEvenForMarknad, lasCogs } = await import('../../cogs.mjs');
  const land = k.geo[0];
  const marknad = MK.marknader.find((m) => m.lander.includes(land));
  const pris = marknad?.fasta_priser?.['sushi-strumpor']?.['5 - Par / One Size'];
  if (!pris) return reserv;
  const kost = landadKostnad({ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 1, land }, kurser, lasCogs());
  if (kost.saknas) return reserv;
  const b = breakEvenForMarknad({ pris, valuta: marknad.basvaluta, kostnadSek: kost.sek, kurser });
  return b.break_even_roas ? { roas: b.break_even_roas, kalla: `sushi 5-par ${pris} ${marknad.basvaluta}, landad kostnad ${kost.sek} kr (${land})` } : reserv;
}

/** Granskaren live: varje kampanj i marknader.json → dom. */
export async function granska() {
  const konto = await api(`act_${M.konto}`, { params: { fields: 'name' } });
  if (konto.name !== M.konto_namn) throw new Error(`Kontot heter "${konto.name}", marknader.json säger "${M.konto_namn}" — fel konto, stopp.`);
  const idag = idagSE();
  const { hamtaKurser } = await import('../../../stonebite/kallor/valuta.mjs');
  const kurser = await hamtaKurser().catch((e) => ({ status: 'fel', orsak: e.message }));
  const kampanjer = await alla(`act_${M.konto}/campaigns`, { fields: 'id,name,effective_status' }, 200);
  const domar = [];
  const finns = {};
  for (const [kod, k] of Object.entries(M.kampanjer)) {
    const c = kampanjer.find((x) => x.name === k.kampanj);
    const be = await breakEven(kod, k, kurser);
    const bas = { kod, kampanj: k.kampanj, effective_status: c?.effective_status ?? 'SAKNAS' };
    finns[kod] = new Set();
    if (!c) { domar.push(domMarknad({ k: bas, be, g: K.granskare, idag, manuellt: K.manuellt[kod] })); continue; }
    let dagar = [], fonster = null;
    if (c.effective_status === 'ACTIVE' || K.manuellt[kod]) {
      // Annonsnamnen behövs bara där något kan översättas — sparar Metas kvot (kod 17).
      for (const a of await alla(`${c.id}/ads`, { fields: 'name' }, 200)) finns[kod].add(a.name);
      const d = await api(`${c.id}/insights`, { params: { time_range: JSON.stringify({ since: plusDagar(idag, -30), until: idag }), time_increment: 1, fields: 'spend' } });
      dagar = (d.data ?? []).map((r) => ({ datum: r.date_start, spend: Number(r.spend) }));
      const forsta = dagar.filter((x) => x.datum < idag && x.spend > 0).map((x) => x.datum).sort()[0];
      if (forsta) {
        const since = [forsta, plusDagar(idag, -K.granskare.fonster_dagar)].sort().at(-1);
        const f = (await api(`${c.id}/insights`, { params: { time_range: JSON.stringify({ since, until: plusDagar(idag, -1) }), fields: 'spend,actions,purchase_roas', action_attribution_windows: AW } })).data?.[0];
        fonster = f ? { spend: Number(f.spend), kop: varde(f.actions, 'omni_purchase') ?? 0, roas: varde(f.purchase_roas, 'omni_purchase'), since } : { spend: 0, kop: 0, roas: null, since };
      }
    }
    domar.push({ ...domMarknad({ k: bas, dagar, fonster, be, g: K.granskare, idag, manuellt: K.manuellt[kod] }), fonster_fran: fonster?.since ?? null });
  }
  const mal = malMarknader(domar, M.kampanjer);
  writeFileSync(join(ROT, 'lage.json'), JSON.stringify({ _om: 'Skrivet av oversatt/kor.mjs (granskaren). Läs, ändra aldrig för hand — Axels ord skrivs i konfig.json → manuellt.', idag, skrivet: new Date().toISOString(), mal: mal.map((m) => m.kod), domar }, null, 1) + '\n');
  return { idag, domar, mal, finns };
}

function visaMarknader({ idag, domar, mal }) {
  console.log(`Granskaren ${idag} (Metas dygn; test ${K.granskare.test_dagar} hela dygn, sedan ${K.granskare.fonster_dagar} dygns fönster, grind ${K.granskare.min_spend_sek} kr + ${K.granskare.min_kop} köp)`);
  for (const d of domar) console.log(`  ${d.kod.padEnd(4)} ${(ETIKETT[d.lage] ?? d.lage).padEnd(20)} ${d.motivering}${d.spend_sek !== undefined ? ` · ${d.spend_sek} kr, ${d.kop} köp sedan ${d.fonster_fran}` : ''}${d.manuellt ? ' (Axel)' : ''}`);
  console.log(mal.length ? `➡️  Översätts till: ${mal.map((m) => m.kod).join(', ')}` : '➡️  Ingen marknad skalar — inget översätts i dag.');
}

/** Sidans text (egenskaperna + blocken högst upp) — för spärren "aldrig utomlands" (Katarina). Utan den
 *  prövade spärren bara radnamnet, och ett MATSTRUMP_-namn nämner aldrig kreatören (fel hittat 2026-09-30). */
async function sidText(id) {
  const H = { Authorization: `Bearer ${process.env.NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' };
  const bitar = [];
  const sida = await (await fetch(`https://api.notion.com/v1/pages/${id}`, { headers: H })).json();
  for (const p of Object.values(sida.properties ?? {})) for (const t of p.rich_text ?? p.title ?? []) bitar.push(t.plain_text);
  const b = await (await fetch(`https://api.notion.com/v1/blocks/${id}/children?page_size=100`, { headers: H })).json();
  if (b.object === 'error') throw new Error(`Notion svarade ${b.status} på sidan ${id} — spärren kan inte prövas`);
  for (const x of b.results ?? []) for (const t of x[x.type]?.rich_text ?? []) bitar.push(t.plain_text);
  return bitar.join(' ');
}

async function ko(status, { medText = false } = {}) {
  const rader = await klaraRader({ id: K.hub_id, titel: 'Matstrumpor creative hub' }, { statusar: [status.toLowerCase()], typ: new RegExp(K.typ_regex, 'i') });
  if (medText) for (const r of rader) r.text = await sidText(r.id);
  return rader;
}

function notionSkriv(sid, kommentar, status) {
  const a = ['tools/notion-aterkoppling.mjs', sid, '--kommentar', kommentar, ...(status ? ['--status', status] : []), ...(skarpt ? [] : ['--torr'])];
  console.log(execFileSync('node', a, { cwd: REPO, encoding: 'utf8' }).trim());
}

async function seVinnare() {
  const { brytpunkter } = await import('../../ekonomi.mjs');
  const be = brytpunkter(SE).gallande?.break_even_roas ?? K.granskare.break_even_reserv;
  const rows = await alla(`${SE.meta.kampanj.id}/insights`, { level: 'ad', date_preset: K.vinnare.fonster, fields: 'ad_name,spend,actions,purchase_roas', action_attribution_windows: AW }, 200);
  const insikt = new Map();
  for (const r of rows) {
    const g = insikt.get(r.ad_name) ?? { spend: 0, kop: 0, varde: 0 };
    const s = Number(r.spend), k = varde(r.actions, 'omni_purchase') ?? 0, ro = varde(r.purchase_roas, 'omni_purchase');
    insikt.set(r.ad_name, { spend: g.spend + s, kop: g.kop + k, varde: g.varde + (ro ?? 0) * s });
  }
  // ROAS per namn ur Metas egna tal (en annons per namn i normalfallet; flera ⇒ spendvägt).
  for (const [n, v] of insikt) insikt.set(n, { ...v, roas: v.spend ? v.varde / v.spend : null });
  const rader = await ko(K.status.launchad_se);
  return { be, rader, lista: vinnare(rader, insikt, be, K.vinnare) };
}

async function huvud() {
  if (har('--marknader')) { visaMarknader(await granska()); return; }

  if (har('--vinnare')) {
    const { be, rader, lista } = await seVinnare();
    console.log(`SE-vinnare i "${K.status.launchad_se}" (${rader.length} rader, ${K.vinnare.fonster}, grind ${K.vinnare.min_spend_sek} kr + ${K.vinnare.min_kop} köp, ROAS ≥ ${be}):`);
    for (const v of lista) console.log(`  🏆 ${v.namn}: ${v.spend_sek} kr, ${v.kop} köp, ROAS ${v.roas.toFixed(2)} — i kontot: ${v.hookar.map((h) => `${h.namn} ${h.spend_sek} kr/${h.kop} köp`).join(', ')}`);
    if (!lista.length) console.log('  (inga)');
    if (!har('--flytta')) return;
    const g = await granska();
    if (!g.mal.length) { console.log('Ingen marknad skalar — vinnarna ligger kvar (inget att översätta till).'); return; }
    for (const v of lista) notionSkriv(v.id, `SE winner (${K.vinnare.fonster}: ${v.spend_sek} kr, ${v.kop} purchases, ROAS ${v.roas.toFixed(2)} vs break-even ${be}). Queued for translation to the scaling markets: ${g.mal.map((m) => m.kod).join(', ')}.`, K.status.ko);
    return;
  }

  if (har('--plan')) {
    const g = await granska();
    const rader = await ko(K.status.ko, { medText: true });
    const p = planera(rader, g.mal, g.finns, K);
    if (har('--json')) { console.log(JSON.stringify({ ...g, finns: undefined, rader: rader.length, ...p }, null, 1)); return; }
    visaMarknader(g);
    console.log(`\nKön "${K.status.ko}": ${rader.length} rader`);
    for (const r of p.klara) console.log(`  ✅ klar i alla mål (${r.marknader.join(', ')}): ${r.namn} → kör --klar ${r.id} --skarpt`);
    for (const a of p.att_gora) console.log(`  🔤 ${a.rad.namn} → ${a.kod}: ${a.namn} (${a.rad.leverans}, ${M.kampanjer[a.kod].locale})`);
    for (const a of p.over_taket) console.log(`  ⏭ över taket ${K.tak_per_korning}, nästa körning: ${a.namn}`);
    for (const s of p.stoppade) console.log(`  ⛔ ${s.rad.namn}: ${s.skal}`);
    if (!g.mal.length && rader.length) console.log('  (raderna väntar — ingen marknad skalar)');
    return;
  }

  const sid = efter('--klar');
  if (sid) {
    const g = await granska();
    if (!g.mal.length) throw new Error('Ingen marknad skalar — raden kan inte vara klar i "alla mål".');
    const rad = (await ko(K.status.ko, { medText: true })).find((r) => r.id.replace(/-/g, '') === sid.replace(/-/g, ''));
    if (!rad) throw new Error(`Raden ${sid} ligger inte i "${K.status.ko}".`);
    const p = planera([rad], g.mal, g.finns, { ...K, tak_per_korning: Infinity });
    if (!p.klara.length) throw new Error(`${rad.namn} saknas fortfarande i: ${p.att_gora.map((a) => a.kod).join(', ') || p.stoppade.map((s) => s.skal).join('; ')}`);
    notionSkriv(rad.id, `Live in every scaling market: ${g.mal.map((m) => `${m.kod} (MATSTRUMP_${m.kod}_…)`).join(', ')}. Translated and uploaded by the translation routine.`, K.status.klar);
    return;
  }
  console.error('Ange --marknader, --vinnare [--flytta], --plan [--json] eller --klar <sid-id>. Skrivningar kräver --skarpt.');
  process.exit(2);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
