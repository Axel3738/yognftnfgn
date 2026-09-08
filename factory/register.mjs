// OPS-produktregistret: uppslagningen butik → produkt → annonskonto → prefix →
// ekonomi → kvot. Noll beroenden.
//
//   node factory/register.mjs                 → hela registret
//   node factory/register.mjs <butik|produkt> → en butik, med ekonomi och kvot
//
// BESLUTET (2026-09-08): OPS-produkter registreras i factory/produkter/register.json,
// ALDRIG i products/products.json. Motiveringen står i registrets `kommentar`.
// Kort: products.json är Bäverbutikens och läses av ett tjugotal skript som antar
// ett enda annonskonto och en enda verksamhet — en OPS-rad där hade tyst dragit
// butiken in i Bäverbutikens commission, kvot och redigerardashboard.
//
// Arbetsdelningen mellan filerna:
//   factory/produkter/<id>.yaml   → produktens sanning (pris, inköp, ekonomi, vinklar)
//   factory/butiker/<id>.yaml     → butikens sanning (bolag, valuta, MOMS, branding)
//   factory/produkter/register.json → kopplingen + driftläget (prefix, kampanj,
//                                     budget, cykel, launches)
// Ekonomin läses alltid ur YAML:en. Står ett break-even-tal på två ställen
// hinner de bli olika, och då dömer nästa körning mot fel linje.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { sammanfoga } from './butik.mjs';
import { ekonomiForProdukt } from './ekonomi.mjs';
import { kvotlage } from '../pipeline/quota.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const REGISTERFIL = join(ROT, 'factory', 'produkter', 'register.json');

// Det gemensamma OPS-kontot (samma konstant som meta-setup.mjs och kontroll.mjs).
export const OPS_ANNONSKONTO = '915422744950975';
// Bäverbutikens konto. Står här bara för att kunna NEKA det — namnen
// "MagiBorsten" och "MagiBorsten DK" är nästan identiska och kontona är
// olika verksamheter.
export const BAVERBUTIKEN_ANNONSKONTO = '1867947880635861';

export function lasRegister() {
  return JSON.parse(readFileSync(REGISTERFIL, 'utf8'));
}

const normalisera = (v) => String(v ?? '').trim().toLowerCase();

/** Slår upp en post på produkt-id, butiks-id eller brandnamn. */
export function hittaPost(nyckel, register = lasRegister()) {
  const n = normalisera(nyckel);
  const post = register.produkter.find(
    (p) => normalisera(p.id) === n || normalisera(p.butik) === n || normalisera(p.brand) === n
  );
  if (!post) {
    const finns = register.produkter.map((p) => `${p.butik}/${p.id} (${p.brand})`).join(', ');
    throw new Error(`Okänd OPS-butik/produkt: "${nyckel}". Registret innehåller: ${finns || '(tomt)'}`);
  }
  return post;
}

/**
 * Spärren som gör att en OPS-körning aldrig kan läsa eller röra Bäverbutikens
 * konto. Kastar hellre än att gissa — fel konto kostar riktiga pengar.
 */
export function sakerstallOpsKonto(post) {
  const konto = String(post?.ad_account_id ?? '');
  if (konto === BAVERBUTIKEN_ANNONSKONTO) {
    throw new Error(
      `STOPP: ${post.butik} pekar på Bäverbutikens konto ${konto}. OPS-butiker kör på ${OPS_ANNONSKONTO}.`
    );
  }
  if (konto !== OPS_ANNONSKONTO) {
    throw new Error(
      `STOPP: ${post.butik} pekar på annonskonto ${konto || '(tomt)'}, men OPS-kontot är ${OPS_ANNONSKONTO}.`
    );
  }
  return konto;
}

/**
 * Brandprefixen som en läsning av det DELADE kontot ska filtreras på.
 * Kontot bär alla OPS-butiker plus Bäverbutikens danska kampanjer, så utan
 * filter läser en skalningsrunda en annan verksamhets annonser.
 */
export function prefixFor(post) {
  const ut = new Set();
  for (const p of [post.kampanjprefix, post.annonsprefix, post.brand]) {
    if (typeof p === 'string' && p.trim()) ut.add(p.trim().toLowerCase());
  }
  if (ut.size === 0) throw new Error(`${post.butik}: inget brandprefix i registret — kan inte filtrera det delade kontot.`);
  return [...ut];
}

/** true om namnet BÖRJAR med något av butikens prefix (skiftlägesokänsligt). */
export function tillhorButiken(namn, prefix) {
  const n = normalisera(namn);
  return prefix.some((p) => n.startsWith(p));
}

/** Hela bilden av en OPS-butik: register + butikskonfig + produktfil + ekonomi. */
export function laddaButik(nyckel, register = lasRegister()) {
  const post = hittaPost(nyckel, register);
  const butik = lasYaml(readFileSync(join(ROT, post.butiksfil), 'utf8'));
  const raProdukt = lasYaml(readFileSync(join(ROT, post.produktfil), 'utf8'));
  const produkt = sammanfoga(butik, raProdukt);
  const ekonomi = ekonomiForProdukt(produkt);

  return {
    post,
    butik,
    produkt,
    ekonomi,
    prefix: prefixFor(post),
    // Kvoten kräver en target-CPA och en cykelstart. Saknas de har butiken
    // inte börjat testa — då finns ingen kvot att vara efter med.
    kvot:
      ekonomi?.targetCpa && post.cycle_start
        ? kvotlage({
            daily_budget_sek: post.daily_budget_sek,
            target_cpa_sek: ekonomi.targetCpa,
            cycle_start: post.cycle_start,
            launches: post.launches,
          })
        : null,
  };
}

/** Loggar launchade creatives på en OPS-butik (motsvarigheten till quota.mjs log). */
export function loggaLaunch(nyckel, antal, datum = new Date().toISOString().slice(0, 10)) {
  if (!Number.isFinite(antal) || antal <= 0) throw new Error('Ange antal launchade creatives som ett tal > 0.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) throw new Error(`Ogiltigt datum: ${datum} (använd YYYY-MM-DD)`);
  const register = lasRegister();
  const post = hittaPost(nyckel, register);
  post.launches.push({ date: datum, count: antal });
  // Första loggningen startar cykeln — annars räknas kvoten från ett tomt fält.
  if (!post.cycle_start) post.cycle_start = datum;
  if (post.status === 'forberedd') post.status = 'aktiv';
  writeFileSync(REGISTERFIL, `${JSON.stringify(register, null, 2)}\n`);
  return post;
}

// ------------------------------------------------------------------- CLI

function skrivButik(nyckel) {
  const { post, ekonomi, prefix, kvot } = laddaButik(nyckel);
  console.log(`\n${post.namn}  ·  butik ${post.butik}  ·  brand ${post.brand}`);
  console.log(`  Annonskonto:  ${post.ad_account_id} (delat OPS-konto — filtrera på prefix)`);
  console.log(`  Brandprefix:  ${prefix.join(' · ')}`);
  console.log(`  Status:       ${post.status}${post.cycle_start ? ` · cykelstart ${post.cycle_start}` : ' · ingen cykel startad'}`);
  console.log(`  Dagsbudget:   ${post.daily_budget_sek} kr`);
  if (ekonomi) {
    console.log(`  Break-even:   ROAS ${ekonomi.breakEvenRoas} · CPA ${ekonomi.breakEvenCpa} kr   ← KILL-linjen`);
    console.log(`  Target:       ROAS ${ekonomi.targetRoas ?? '—'} · CPA ${ekonomi.targetCpa ?? '—'} kr   ← skalningsnivån`);
    console.log(`  Räknad på:    AOV ${ekonomi.brutto} kr, moms ${ekonomi.momsProcent} %, varukostnad ${ekonomi.varukostnad} kr`);
  } else {
    console.log('  ⚠️ Ekonomin går inte att räkna — pris/inköp saknas i produktfilen.');
  }
  if (kvot) {
    console.log(`  Kvot:         ${kvot.perCycle} creatives / 3 dagar · läge ${kvot.balance >= 0 ? '+' : ''}${kvot.balance}`);
  } else {
    console.log('  Kvot:         ingen — butiken har inte startat sin cykel än.');
  }
  console.log('');
}

function huvud() {
  const nyckel = process.argv[2];
  if (nyckel && !nyckel.startsWith('--')) {
    skrivButik(nyckel);
    return;
  }
  const register = lasRegister();
  console.log(`\nOPS-produktregistret (${register.produkter.length} butiker) — konto ${register.ops_annonskonto}\n`);
  for (const p of register.produkter) skrivButik(p.id);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    huvud();
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }
}
