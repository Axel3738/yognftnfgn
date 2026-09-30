#!/usr/bin/env node
/* ==========================================================================
   kor.mjs — A/B-avläsningen för matstrumpor.se i ETT kommando, utan
   Shopify-connectorn: ordrar.mjs (Admin GraphQL via appen Fabriken) →
   analys.mjs (statistiken). Rapporten skrivs ut oförändrad.

     node matstrumpor/ab/kor.mjs --test sortval --sedan "#4786" --till "#5098" \
       --koder "a=SUSHI-*,PIZZA-*,HAMBURGARE-*,DONUT-*;b=STRUMPOR-K1F1-P*,STRUMPOR-K2F2-P*"

     node matstrumpor/ab/kor.mjs --tester                    # vilka tester temat kör just nu (publika sidan)
     node matstrumpor/ab/kor.mjs --planera --baslinje 0.053 --trafik 80   # ingen Shopify alls

   Till ordrar.mjs:  --test --sedan --till --koder --ut
   Till analys.mjs:  --besokare-a --besokare-b --baslinje --mde --trafik (planera)
   Steg 0 är alltid butikskollen: k.kolla() → domänen ska vara matstrumpor.se,
   annars stannar allt innan en enda order hämtas. LÄS-BART hela vägen.
   ========================================================================== */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tolkaArgs, kravMatstrumpor, standardUtfil, BUTIK_ID, BUTIK_DOMAN } from './ordrar.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const ORDRAR = join(ROT, 'ordrar.mjs');
const ANALYS = join(ROT, 'analys.mjs');
const PUBLIK_SIDA = `https://${BUTIK_DOMAN}/?country=SE`;

const TILL_ORDRAR = ['sedan', 'till', 'koder', 'ut', 'json'];
const TILL_ANALYS = ['besokare-a', 'besokare-b', 'baslinje', 'mde', 'trafik', 'trafik-per-dag'];

function plocka(a, nycklar) {
  const ut = [];
  for (const n of nycklar) {
    if (a[n] === undefined) continue;
    ut.push(`--${n}`);
    if (a[n] !== true) ut.push(String(a[n]));
  }
  return ut;
}

function spawna(skript, args) {
  const r = spawnSync(process.execPath, [skript, ...args], { stdio: 'inherit' });
  if (r.error) throw r.error;
  return r.status ?? 1;
}

/** Testerna temat kör just nu, lästa ur den publika sidans <script id="ms-ab-config">. */
export function tolkaAbKonfig(html) {
  const m = /<script[^>]*id="ms-ab-config"[^>]*>([\s\S]*?)<\/script>/i.exec(String(html));
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

export async function hamtaTester(fetchFn = fetch) {
  const r = await fetchFn(PUBLIK_SIDA, { headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0 (matstrumpor/ab/kor.mjs)' } });
  if (!r.ok) throw new Error(`${PUBLIK_SIDA} svarade ${r.status}`);
  const cfg = tolkaAbKonfig(await r.text());
  if (!cfg) throw new Error('hittade inte <script id="ms-ab-config"> på sidan — temat saknar A/B-motorn eller sidan ser annorlunda ut');
  return cfg;
}

function skrivTester(cfg) {
  const tests = Array.isArray(cfg.tests) ? cfg.tests : [];
  console.log(`Tester i temat just nu (${PUBLIK_SIDA}): ${tests.length ? '' : 'inga — ms_ab_tests är tom eller bara #-rader'}`);
  for (const t of tests) {
    const id = typeof t === 'string' ? t : t.id;
    const vikter = t && t.weights ? ` vikter ${t.weights.join(':')}` : '';
    console.log(`  ${id}${vikter}`);
  }
  console.log(`Kakan lever ${cfg.cookieDays ?? 30} dagar.`);
}

export async function main(argv = process.argv.slice(2)) {
  const a = tolkaArgs(argv);

  if (a.tester) {
    skrivTester(await hamtaTester());
    return 0;
  }

  if (a.planera) {
    // Ingen Shopify: bara statistiken. --baslinje och --trafik är Axels egna tal.
    return spawna(ANALYS, ['--planera', ...plocka(a, ['baslinje', 'mde', 'trafik', 'trafik-per-dag'])]);
  }

  const testId = a.test && a.test !== true ? String(a.test).trim() : null;
  if (!testId) {
    console.error('Ange testet: --test <id> (eller --tester för att se vilka som rullar, --planera för planering).');
    return 2;
  }
  if (!a.sedan || a.sedan === true) {
    console.error('Ange starttiden: --sedan <ISO-tid eller #ordernummer>. Testets första order står i products/matstrumpor/batch-log.md — gissa aldrig.');
    return 2;
  }

  // 0. Butiken — innan något hämtas.
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  const k = await skapaKlient(lasButik(BUTIK_ID));
  const info = await kravMatstrumpor(k);
  console.log(`Butik verifierad: ${info.namn} — ${info.doman} (appen ${info.app}). Läs-bart.`);

  // Testerna just nu, för sammanhanget (fel här stoppar inget).
  try { skrivTester(await hamtaTester()); } catch (e) { console.log(`(kunde inte läsa temats testlista: ${e.message})`); }

  // 1. Ordrarna → filen.
  const fil = a.ut && a.ut !== true ? resolve(String(a.ut)) : standardUtfil(testId);
  const ordrarArgs = ['--test', testId, ...plocka(a, TILL_ORDRAR.filter((n) => n !== 'ut')), '--ut', fil];
  const s1 = spawna(ORDRAR, ordrarArgs);
  if (s1 !== 0) { console.error(`ordrar.mjs avbröt (exit ${s1}) — ingen analys.`); return s1; }

  // 2. Statistiken, oförändrad.
  return spawna(ANALYS, ['--test', testId, '--ordrar', fil, ...plocka(a, TILL_ANALYS)]);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().then((kod) => process.exit(kod)).catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
