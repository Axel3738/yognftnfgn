#!/usr/bin/env node
// kampanjkoll.mjs — trippelkollen för en OPS-kampanj (steg 10 i /ny-annonser).
//
//   node factory/kampanjkoll.mjs pipeline/waves/se-<butik>-video.config.mjs [--vantat 38]
//
// Läser TILLBAKA hela strukturen ur Meta och jämför mot vågkonfigen: konto,
// sida, pixel, budget, länk, geo och status på alla tre nivåer. Läser bara.
//
// ⚠️ Varför `--vantat` finns: en TOM kampanj klarar varje annonskontroll utan
// att någonsin köra den, och rapporten blir grön på noll annonser. Det höll på
// att hända 2026-09-08 när sidbehörigheten stoppade annonsskapandet men
// kampanj och adset redan fanns. Antalet kollas därför FÖRST.
// Utan flaggan räknas det ur konfigen.
//
// ⚠️ Antalet här är kampanjens EGEN kontroll mot vågkonfigen. Räkningen mot
// KÄLLANNONSERNA — "33 av 33, ingen saknas" — är en annan fråga och görs av
// factory/rakning.mjs (steg 9). En grön trippelkoll säger ingenting om hur
// många källannonser som aldrig blev byggda.
//
// Alla Graph-anrop går genom tools/meta-lib.mjs. Egna fetch-anrop mot
// graph.facebook.com finns inte här: spärrarna och backoffen i lagret är
// dyrköpta, och en kopia av dem åldras i tysthet.

import path from 'node:path';
import { säkerställProxy, api, alla } from '../tools/meta-lib.mjs';

// ------------------------------------------------------------------ rena delar

/** Antalet annonser och adsets vågkonfigarna säger att kampanjen ska ha. */
export function vantatAntal(cfgs) {
  return {
    annonser: cfgs.reduce((s, x) => s + x.adsets.reduce((n, a) => n + (a.ads?.length ?? 1), 0), 0),
    adsets: new Set(cfgs.flatMap((x) => x.adsets.map((a) => a.name))).size,
  };
}

/** Alla konfigar ska peka på SAMMA kampanj i SAMMA konto — video och bild
 *  bygger i samma struktur. Gör de inte det räknas antalet fel. */
export function samstammiga(cfgs) {
  const [c, ...resten] = cfgs;
  return resten.every((x) => x.campaignName === c.campaignName && x.act === c.act);
}

/** Länken en annons faktiskt pekar på, oavsett om creativen är video eller bild. */
export function lankAv(annons) {
  const oss = annons?.creative?.object_story_spec || {};
  const dd = oss.video_data || oss.link_data || {};
  return dd.call_to_action?.value?.link || dd.link || '';
}

const rad = (ok, text) => ({ ok, text });

export function kontrolleraKampanj(cfg, kampanj) {
  if (!kampanj) return [rad(false, 'hittades inte i kontot')];
  return [
    rad(kampanj.status === cfg.campaignStatus, `status ${cfg.campaignStatus} (är: ${kampanj.status})`),
    rad(
      kampanj.daily_budget === cfg.dailyBudget,
      `budget ${Number(cfg.dailyBudget) / 100} kr/dag (är: ${Number(kampanj.daily_budget) / 100})`
    ),
  ];
}

export function kontrolleraAdsets(cfg, adsets, vantatAdsets) {
  const ut = [rad(adsets.length === vantatAdsets, `${vantatAdsets} adsets (är: ${adsets.length})`)];
  for (const a of adsets) {
    const geo = a.targeting?.geo_locations?.countries?.join(',') || '(ingen)';
    const brister = [];
    if (a.status !== cfg.adsetStatus) brister.push('status ' + a.status);
    if (a.promoted_object?.pixel_id !== cfg.pixel) brister.push('pixel ' + a.promoted_object?.pixel_id);
    if (geo !== cfg.country) brister.push('geo ' + geo);
    ut.push(rad(brister.length === 0, `${a.name}${brister.length ? ' → ' + brister.join(', ') : ''}`));
  }
  return ut;
}

export function kontrolleraAnnonser(cfg, ads, vantatAnnonser) {
  const ut = [rad(ads.length === vantatAnnonser, `${vantatAnnonser} annonser (är: ${ads.length})`)];
  if (!ads.length) return ut;

  let sidfel = 0, lankfel = 0, statusfel = 0;
  const sidor = new Set(), lankar = new Set();
  for (const a of ads) {
    const oss = a.creative?.object_story_spec || {};
    const lank = lankAv(a);
    sidor.add(oss.page_id);
    lankar.add(lank);
    if (a.status !== cfg.adStatus) statusfel++;
    if (oss.page_id !== cfg.page) sidfel++;
    if (lank !== cfg.link) lankfel++;
  }
  ut.push(rad(statusfel === 0, `alla ${cfg.adStatus} (avvikande: ${statusfel})`));
  ut.push(rad(sidfel === 0, `alla på sida ${cfg.page} (sedda: ${[...sidor].join(', ')})`));
  ut.push(rad(lankfel === 0, `alla länkar till ${cfg.link} (avvikande: ${lankfel})`));
  return ut;
}

export const antalFel = (rader) => rader.filter((r) => !r.ok).length;

// ------------------------------------------------------------------------ CLI

async function hamta(sokvag, params = {}) {
  try {
    return await alla(sokvag, params);
  } catch (e) {
    console.error('  FEL', sokvag, e.message);
    return null;
  }
}

async function kor() {
  const argv = process.argv.slice(2);
  const konfigar = argv.filter((a) => !a.startsWith('--'));
  if (!konfigar.length) { console.error('Ange minst en vågkonfig.'); process.exit(1); }
  const iVantat = argv.indexOf('--vantat');
  const vantatFlagga = iVantat >= 0 ? Number(argv[iVantat + 1]) : null;

  const cfgs = [];
  for (const f of konfigar) cfgs.push((await import(path.resolve(f))).default);
  const c = cfgs[0];
  if (!samstammiga(cfgs)) {
    console.error('✗ Konfigarna pekar på olika kampanjer/konton — de ska bygga i samma struktur.');
    process.exit(1);
  }
  const vantat = vantatAntal(cfgs);
  const vantatAnnonser = vantatFlagga ?? vantat.annonser;

  let fel = 0;
  const skriv = (rader) => {
    for (const r of rader) {
      console.log((r.ok ? '  ✅ ' : '  ❌ ') + r.text);
      if (!r.ok) fel++;
    }
  };

  // ⚠️ `act` i vågkonfigarna bär redan prefixet ("act_915422744950975") —
  // lägg aldrig på ett eget, då blir sökvägen act_act_….
  const kampanjer = await hamta(`${c.act}/campaigns`, { fields: 'id,name,status,daily_budget,objective' });
  const k = kampanjer?.find((x) => x.name === c.campaignName);
  console.log(`\n=== 1. KAMPANJEN — ${c.campaignName} ===`);
  if (!k) { console.log('  ❌ hittades inte i kontot'); process.exit(1); }
  skriv(kontrolleraKampanj(c, k));

  const adsets = (await hamta(`${k.id}/adsets`, { fields: 'id,name,status,promoted_object,targeting' })) || [];
  console.log('\n=== 2. ADSETS ===');
  skriv(kontrolleraAdsets(c, adsets, vantat.adsets));

  const ads = (await hamta(`${k.id}/ads`, { fields: 'id,name,status,creative{object_story_spec}' })) || [];
  console.log('\n=== 3. ANNONSER ===');
  skriv(kontrolleraAnnonser(c, ads, vantatAnnonser));

  console.log('\n=== 4. KONTOTS ÖVRIGA KAMPANJER ===');
  // ⚠️ En ACTIVE kampanj här är INTE ett fel. Launch-skripten skapar allt PAUSED
  // och aktiverar aldrig något — står en annan kampanj på ACTIVE har en människa
  // slagit på den. Att kalla det "väckt av körningen" är att skylla ägarens eget
  // beslut på skriptet, och det gjorde kollen 2026-09-09: Axel satte igång den
  // svenska kampanjen, och den norska körningen rapporterades som misslyckad för
  // det. Raden är därför upplysning, inte grind.
  const andra = (kampanjer || []).filter((x) => x.name !== c.campaignName);
  const aktiva = andra.filter((x) => x.status === 'ACTIVE');
  console.log(`  · ${andra.length} andra kampanjer i kontot, varav ${aktiva.length} ACTIVE`);
  for (const a of aktiva) console.log(`      ACTIVE: ${a.name}`);
  console.log('    (körningen aktiverar aldrig något — en ACTIVE kampanj är någons beslut)');

  console.log('\n=== 5. RÄKNINGEN MOT KÄLLANNONSERNA ===');
  console.log('  · görs inte här — kör `node factory/rakning.mjs <butik-id>` (steg 9).');
  console.log('    En grön trippelkoll säger ingenting om hur många källannonser som aldrig blev byggda.');

  console.log(fel === 0 ? '\n✅ TRIPPELKOLLEN GRÖN.' : `\n❌ ${fel} avvikelse(r) — delvis klart heter delvis klart.`);
  process.exit(fel === 0 ? 0 : 1);
}

if (process.argv[1] && process.argv[1].endsWith('kampanjkoll.mjs')) {
  säkerställProxy();
  if (!process.env.META_ACCESS_TOKEN) { console.error('✗ META_ACCESS_TOKEN saknas.'); process.exit(1); }
  await kor();
}
