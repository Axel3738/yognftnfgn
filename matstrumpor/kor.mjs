#!/usr/bin/env node
// kor.mjs — Matstrumpors CLI. Räknar, läser och planerar. Skriver ALDRIG i Meta.
//
// Varför inte: META_ACCESS_TOKEN nekas på kontot "nya kungen" 730973156224390
// (mätt 2026-09-21: "(#200) Ad account owner has NOT granted ads_management").
// Uppladdningen går därför via Adsmanager-MCP:n i kommandot /matstrumpor, och
// det här skriptet gör allt annat — så att räkningen är testbar och svaret blir
// detsamma varje gång.
//
//   node matstrumpor/kor.mjs --kolla            vad som finns och vad som saknas
//   node matstrumpor/kor.mjs --ekonomi          break-even, båda momslinjerna
//   node matstrumpor/kor.mjs --aov [--dagar 30] mät AOV ur Shopify på riktigt
//   node matstrumpor/kor.mjs --ko [--json]      Notion "To be Reviewed" → uppladdningsplan
//   node matstrumpor/kor.mjs --namn <vinkel> <format> [antal]   nästa lediga namn
//   node matstrumpor/kor.mjs --dom <fil.json>   döm annonser ur en avläsning (Meta via MCP)
//   node matstrumpor/kor.mjs --status           lärdomar, briefer, brieftak, mix

import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { brytpunkter, rangordna, dom } from './ekonomi.mjs';
import { etikettera, formateraFrekvens, levandeBreakthrough, ETIKETT } from './etikett.mjs';
import { brieftak, mix, skelett } from './lardom.mjs';
import { nastaNummer_flera, bygg, tolka, adsetNyckel } from './namn.mjs';
import { hamtaKo, planera } from './kon.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
export const KONFIGFIL = join(ROT, 'konfig.json');
export const LOGGFIL = join(ROT, 'logg.jsonl');
export const LARDOMSFIL = join(ROT, '..', 'products', 'matstrumpor', 'lardomar.md');

export function lasKonfig(fil = KONFIGFIL) {
  return JSON.parse(readFileSync(fil, 'utf8'));
}

export function lasLogg(fil = LOGGFIL) {
  if (!existsSync(fil)) return [];
  return readFileSync(fil, 'utf8').split('\n').filter(Boolean).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
}

export function skrivRad(rad, fil = LOGGFIL) {
  mkdirSync(dirname(fil), { recursive: true });
  appendFileSync(fil, `${JSON.stringify({ ...rad, skrivet: new Date().toISOString() })}\n`);
  return rad;
}

/** Döper om en Notion-rad (titeln). Namnet ÄR routingen, så det ska stå på ETT
 *  ställe — raden — inte bara i uppladdarens huvud. Läser tillbaka och
 *  kontrollerar; ett namnbyte som inte gick igenom är värre än inget. */
export async function dopOm(sidId, nyttNamn, fetchFn = fetch) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN saknas.');
  const huvud = { Authorization: `Bearer ${token}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' };
  const sida = await (await fetchFn(`https://api.notion.com/v1/pages/${sidId}`, { headers: huvud })).json();
  if (sida.object === 'error') throw new Error(`Notion: ${sida.message}`);
  const titelFalt = Object.entries(sida.properties).find(([, v]) => v.type === 'title')?.[0];
  if (!titelFalt) throw new Error('Raden har inget titelfält.');
  const svar = await (await fetchFn(`https://api.notion.com/v1/pages/${sidId}`, {
    method: 'PATCH', headers: huvud,
    body: JSON.stringify({ properties: { [titelFalt]: { title: [{ text: { content: nyttNamn } }] } } }),
  })).json();
  if (svar.object === 'error') throw new Error(`Notion: ${svar.message}`);
  const las = svar.properties[titelFalt].title.map((t) => t.plain_text).join('');
  if (las !== nyttNamn) throw new Error(`Namnbytet gick inte igenom: raden heter "${las}".`);
  return las;
}

/** AOV och antal strumpprodukter per order ur Shopify. Mäter, gissar aldrig. */
export async function matAov(dagar = 30) {
  const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
  const butik = lasButik('matstrumpor');
  const k = await skapaKlient(butik);
  const fran = new Date(Date.now() - dagar * 86400000).toISOString().slice(0, 10);
  const q = `query($c:String){orders(first:250,after:$c,query:"created_at:>=${fran} financial_status:paid"){pageInfo{hasNextPage endCursor} nodes{totalPriceSet{shopMoney{amount}} lineItems(first:10){nodes{quantity title}}}}}`;
  let c = null, n = 0, tot = 0, produkter = 0;
  do {
    const r = await k.graphql(q, { c });
    for (const o of r.orders.nodes) {
      n++;
      tot += Number(o.totalPriceSet.shopMoney.amount);
      for (const li of o.lineItems.nodes) if (/strumpor/i.test(li.title)) produkter += li.quantity;
    }
    c = r.orders.pageInfo.hasNextPage ? r.orders.pageInfo.endCursor : null;
  } while (c);
  if (!n) throw new Error(`Noll betalda ordrar de senaste ${dagar} dagarna — AOV går inte att mäta, och ska då INTE skrivas.`);
  return { ordrar: n, dagar, aov_sek: Math.round((tot / n) * 100) / 100, produkter_per_order: Math.round((produkter / n) * 100) / 100 };
}

function visaEkonomi(konfig) {
  const b = brytpunkter(konfig);
  console.log(`AOV ${b.aov_sek} kr · kostnad per order ${b.kostnad_per_order_sek} kr (${konfig.ekonomi.kostnad_per_order_sek} inköp + ${konfig.ekonomi.tull_eur} EUR tull × ${konfig.ekonomi.eur_sek})`);
  console.log(`  UTAN moms: täckningsbidrag ${b.utan_moms.tackningsbidrag} kr ⇒ break-even-ROAS ${b.utan_moms.break_even_roas} · break-even-CPA ${b.utan_moms.break_even_cpa_sek} kr`);
  console.log(`  MED moms:  täckningsbidrag ${b.med_moms.tackningsbidrag} kr ⇒ break-even-ROAS ${b.med_moms.break_even_roas} · break-even-CPA ${b.med_moms.break_even_cpa_sek} kr`);
  if (b.oppen_fraga) console.log('⚠️  moms_antagen är inte satt — en annons MELLAN linjerna får domen BEROR_PA_MOMS och rörs inte. Sätt ekonomi.moms_antagen i matstrumpor/konfig.json när Axel svarat.');
  else console.log(`Gällande linje: ${b.moms_antagen ? 'MED' : 'UTAN'} moms ⇒ break-even-ROAS ${b.gallande.break_even_roas}`);
  return b;
}

async function main() {
  const arg = process.argv.slice(2);
  const har = (f) => arg.includes(f);
  const varde = (f, d = null) => { const i = arg.indexOf(f); return i > -1 ? arg[i + 1] : d; };
  const konfig = lasKonfig();

  if (har('--ekonomi')) { visaEkonomi(konfig); return; }

  if (har('--aov')) {
    const m = await matAov(Number(varde('--dagar', 30)));
    console.log(`${m.ordrar} betalda ordrar / ${m.dagar} dagar · AOV ${m.aov_sek} kr · ${m.produkter_per_order} strumpprodukter per order`);
    console.log(`Skriv in i konfig.json: "aov_sek": ${m.aov_sek}  (och notera datum + antal ordrar i aov_comment)`);
    return;
  }

  if (har('--namn')) {
    const i = arg.indexOf('--namn');
    const vinkel = arg[i + 1], format = arg[i + 2];
    const antal = Number(arg[i + 3] ?? 1);
    const kanda = [...lasLogg().filter((r) => r.kod === 'UPPLADDAD').map((r) => r.annons), ...(existsSync(join(ROT, 'kanda-namn.json')) ? JSON.parse(readFileSync(join(ROT, 'kanda-namn.json'), 'utf8')) : [])];
    if (!kanda.length) console.error('⚠️  Inga kända namn på disk — kör /matstrumpor som läser kontot + hubben först, annars kan numret krocka.');
    for (const n of nastaNummer_flera(kanda, antal)) console.log(bygg({ vinkel, format, nummer: n }, konfig));
    return;
  }

  if (har('--dop')) {
    const i = arg.indexOf('--dop');
    const sida = arg[i + 1];
    const nytt = arg[i + 2];
    if (!sida || !nytt) throw new Error('--dop vill ha <notion-sid-id> <nytt namn>.');
    const g = (await import('./namn.mjs')).granska(nytt, [], konfig);
    if (!g.ok) throw new Error(`Namnet duger inte: ${g.fel.join(' · ')}`);
    await dopOm(sida, nytt);
    console.log(`Raden heter nu ${nytt} ⇒ adset ${konfig.meta.adsets[adsetNyckel(nytt, konfig)].namn}`);
    return;
  }

  if (har('--ko')) {
    const { rader, plan } = await hamtaKo(konfig);
    if (har('--json')) { console.log(JSON.stringify({ rader: rader.length, ...plan }, null, 2)); return; }
    console.log(`Hubben "${konfig.notion.hub_namn}": ${rader.length} rader i ${konfig.notion.ko_status}`);
    for (const [nyckel, namn] of Object.entries(plan.per_adset)) {
      console.log(`  → ${konfig.meta.adsets[nyckel].namn}${konfig.meta.adsets[nyckel].id ? '' : '  (MÅSTE SKAPAS)'}: ${namn.length} st`);
      for (const n of namn) console.log(`      ${n}`);
    }
    for (const s of plan.stoppade) console.log(`  ${s.behover_namn ? '🏷️ ' : '⛔'} ${s.namn} — ${s.behover_namn ? 'odöpt rad med fil: titta på creativen, välj vinkel + format, döp den (--namn), kör om' : s.skal.join(' · ')}`);
    if (!rader.length) console.log('  (kön är tom)');
    return;
  }

  if (har('--dom')) {
    const jobb = JSON.parse(readFileSync(varde('--dom'), 'utf8'));
    const b = visaEkonomi(konfig);
    const be = b.gallande?.break_even_roas ?? null;
    console.log('');
    const rank = rangordna(jobb.annonser ?? [], b, konfig.grindar);
    console.log(`Vinstbidrag (${rank.rader.length} bedömbara, ${rank.for_tidigt.length} för tidigt):`);
    for (const r of rank.rader) {
      console.log(`  ${(r.vinstbidrag_sek ?? 0).toFixed(0).padStart(7)} kr  ${r.namn}  CPA ${r.cpa_sek ?? '—'} · ${r.dom}${r.benchmark ? '  ★ BENCHMARK — dödas aldrig' : ''}`);
    }
    if (rank.for_tidigt.length) console.log(`  För tidigt: ${rank.for_tidigt.join(', ')}`);
    const etiketter = (jobb.annonser ?? []).map((a) => etikettera(a, jobb.kampanj ?? {}, be, konfig.grindar));
    console.log('');
    console.log(`Etiketter: ${formateraFrekvens(etiketter.filter((e) => e.etikett === ETIKETT.BREAKTHROUGH).length, etiketter.length)} breakthrough`);
    for (const e of etiketter) console.log(`  ${e.etikett.padEnd(15)} ${e.namn}  ${e.motivering}`);
    return;
  }

  if (har('--status')) {
    const logg = lasLogg();
    const lardomar = logg.filter((r) => r.kod === 'LARDOM');
    const briefer = logg.filter((r) => r.kod === 'BRIEF');
    const sedanRond = logg.findLastIndex?.((r) => r.kod === 'ROND_KLAR') ?? -1;
    const nya = sedanRond > -1 ? logg.slice(sedanRond).filter((r) => r.kod === 'LARDOM').length : lardomar.length;
    const tak = brieftak({ lardomarSedanForraRonden: nya, kadensAntal: konfig.kadens.briefer_per_rond });
    const levande = levandeBreakthrough(logg.filter((r) => r.kod === 'ETIKETT'), new Date().toISOString().slice(0, 10));
    console.log(`Lärdomar totalt: ${lardomar.length} · sedan förra ronden: ${nya}`);
    console.log(`Briefer totalt: ${briefer.length} · på lärdom: ${briefer.filter((b) => b.lardom).length}`);
    console.log(`Brieftak: ${tak.antal} — ${tak.orsak}`);
    console.log(`Mix: ${JSON.stringify(mix(tak.antal, levande.length > 0))}`);
    return;
  }

  // --kolla (standard)
  console.log(`Matstrumpor — ${konfig.butik}`);
  console.log(`Konto:    ${konfig.meta.ad_account_namn} (${konfig.meta.ad_account_id})`);
  console.log(`Kampanj:  ${konfig.meta.kampanj.namn} (${konfig.meta.kampanj.id}) · ${konfig.meta.kampanj.typ} ${konfig.meta.kampanj.dagsbudget_sek} kr/dag`);
  for (const [k, v] of Object.entries(konfig.meta.adsets)) console.log(`  adset ${k.padEnd(10)} ${v.namn}${v.id ? ` (${v.id})` : '  ⚠️ finns inte än'}`);
  console.log(`Hub:      ${konfig.notion.hub_namn} (${konfig.notion.hub_id})`);
  console.log('');
  const nycklar = { NOTION_TOKEN: 'Notion-kön', META_ACCESS_TOKEN: 'Meta (⚠️ nekas på det här kontot — MCP gäller)', SHOPIFY_CLIENT_ID_1r46tp_qx: 'AOV ur Shopify', DISCORD_BOT_TOKEN: 'rapporten' };
  for (const [n, vad] of Object.entries(nycklar)) console.log(`${process.env[n] ? '✅' : '❌'} ${n.padEnd(30)} ${vad}`);
  console.log('');
  visaEkonomi(konfig);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => { console.error(`FEL: ${e.message}`); process.exit(1); });
}

export { brytpunkter, rangordna, dom, etikettera, planera, adsetNyckel, tolka, skelett };
