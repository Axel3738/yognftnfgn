#!/usr/bin/env node
// ops-till-meta.mjs — laddar upp EN creative LIVE i en OPS-butiks kampanj i det
// gemensamma OPS-kontot MagiBorsten DK 915422744950975 (SE och NO i samma konto,
// separata kampanjer `<PREFIX>_SE_…` / `<PREFIX>_NO_…`, CBO, ett adset per koncept).
//
//   node tools/ops-till-meta.mjs <nyckel> --marknad SE|NO --namn <annonsnamn> --fil <sökväg>
//        --primar "<primary text>" --rubrik "<headline>" [--beskrivning "<text>"]
//        [--lank <url>] [--kampanj <id>] [--torr] [--json]
//
// Bygger på tools/meta-lib.mjs (samma spärrar som tools/notion-till-marknad.mjs)
// och factory/register.mjs (butiken, kontospärren, prefixet).
//
// SPÄRRAR SOM INTE GÅR ATT FLAGGA BORT:
//  1. Bara OPS-kontot 915422744950975. Bäverbutiken (1867947880635861, "MagiBorsten"
//     utan DK) nekas alltid — namnen är nästan identiska, verksamheterna olika.
//  2. Exakt EN aktiv kampanj för butiken på marknaden. Noll eller flera = stopp.
//     PAUSED med spend är ett beslut (avvecklad) — dit laddas inget upp.
//  3. Marknadskoden i annonsnamnet måste matcha --marknad. NO-namn i SE-kampanj är
//     tyst dataskada: köpen bokförs på fel marknad och analysen blir fel.
//  4. Dubblett på annonsnamn i HELA kontot = redan uppladdad.
//  5. Sida, Instagram, länk och DSA ärvs ur kampanjens befintliga annonser — aldrig
//     hårdkodat, aldrig kopierat mellan butiker.
//  6. Annonsen skapas PAUSED och aktiveras direkt (Axels beslut 2026-09-11: nya
//     annonser går live). Aktiveringen rör bara annonsen och det adset körningen
//     själv skapade — aldrig kampanjen, aldrig ett befintligt adset.
//
// --torr gör alla läsningar och visar exakt vad som skulle skapats. Inget skrivs.
// --json skriver resultatet som SISTA raden på stdout; all logg går på stderr.
//
// Kräver env META_ACCESS_TOKEN. Noll npm-beroenden.

import { existsSync, statSync } from 'node:fs';
import { extname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  säkerställProxy, api, alla, kampanjUtfall, hittaEllerSkapaAdset, laddaUppBild,
  laddaUppVideo, väntaPåThumb, ärvSidaOchIg, skapaAnnons, aktivera, ingaEnhancements,
} from './meta-lib.mjs';
import { laddaButik, sakerstallKonto, tillhorButiken, OPS_ANNONSKONTO } from '../factory/register.mjs';
import { valjKampanjer } from '../factory/budgetrond.mjs';
import { filtreraPaMarknad, marknadskoderI, MARKNADSKODER } from '../factory/skalning.mjs';

// ------------------------------------------------------------- ren logik
// Allt här nedanför är fritt från nät och fs — det är det som testas.

const VIDEO = ['.mp4', '.mov'];
const BILD = ['.jpg', '.jpeg', '.png'];

/** 'video' | 'bild' | null ur filändelsen. Allt annat är stopp. */
export function medietyp(fil) {
  const ä = extname(String(fil ?? '')).toLowerCase();
  if (VIDEO.includes(ä)) return 'video';
  if (BILD.includes(ä)) return 'bild';
  return null;
}

/**
 * Konceptkoden ur annonsnamnet: bokstäverna i andra fältet, med marknadskoden
 * överhoppad. HeimGuard_SP_2_1 → SP · HeimGuard_NO_SP_2_1 → SP · TankGuard_1_1 → null.
 * Gissas ALDRIG fram ur ett numeriskt fält (notion-till-meta.mjs lärde sig det
 * den hårda vägen: konceptet "1" matchade vilket adset som helst med en etta).
 */
export function konceptUrNamn(namn) {
  const fält = String(namn ?? '').split('_').map((f) => f.trim());
  if (fält.length < 2) return null;
  let i = 1;
  if (MARKNADSKODER.includes(fält[i].toUpperCase())) i += 1;
  // Tvådelat prefix (DryTrek_Damasker_PD_14_1, mätt 2026-09-13): ett
  // produktsegment med fem eller fler bokstäver hoppas över när fältet efter
  // det är en kod. Ett numeriskt fält gissas fortfarande aldrig till kod.
  if (/^[A-Za-zÅÄÖåäö]{5,}$/.test(fält[i] ?? '') && /^[A-Za-z]{1,4}$/.test(fält[i + 1] ?? '')) i += 1;
  const kandidat = fält[i] ?? '';
  return /^[A-Za-z]{1,4}$/.test(kandidat) ? kandidat.toUpperCase() : null;
}

/** Kampanjbasen = kampanjnamnet före ` | `. "HEIMGUARD_SE_Övervakningskameran | BE-ROAS 2,11 | 2026-09-08" → "HEIMGUARD_SE_Övervakningskameran". */
export function kampanjbas(kampanjnamn) {
  return String(kampanjnamn ?? '').split(' | ')[0].trim();
}

/** Adsetnamnet för ett koncept: `<kampanjbas> - <KONCEPT>` (pipeline/waves/se-heimguard-image.config.mjs:38). */
export function adsetNamn(kampanjnamn, koncept) {
  return `${kampanjbas(kampanjnamn)} - ${String(koncept).toUpperCase()}`;
}

/**
 * Stämmer annonsnamnets marknadskod med --marknad?
 *   NO  kräver `_NO_` (eller `_NO` sist) och ingen annan marknadskod.
 *   SE  förbjuder varje annan marknadskod (`_NO_`, `_DK_`, `_FI_` …); utan kod = SE.
 * Returnerar { ok, koder, skal }.
 */
export function kontrolleraMarknad(namn, marknad) {
  const vald = String(marknad ?? '').toUpperCase();
  if (!MARKNADSKODER.includes(vald)) return { ok: false, koder: [], skal: `Okänd marknad "${marknad}". Giltiga: ${MARKNADSKODER.join(', ')}.` };
  const koder = marknadskoderI(namn);
  const andra = koder.filter((k) => k !== vald);
  if (andra.length) {
    return { ok: false, koder, skal: `Annonsnamnet "${namn}" bär marknadskoden ${andra.join('/')} men körningen gäller ${vald} — fel marknad i fel kampanj är tyst dataskada.` };
  }
  if (vald !== 'SE' && !koder.includes(vald)) {
    return { ok: false, koder, skal: `Annonsnamnet "${namn}" saknar marknadskoden _${vald}_ — ett ${vald}-namn ska bära koden (utan kod räknas namnet som SE).` };
  }
  return { ok: true, koder, skal: null };
}

/** Landningslänken ur en object_story_spec (bild: link_data.link · video: call_to_action.value.link). */
export function lankUrSpec(spec) {
  if (!spec || typeof spec !== 'object') return null;
  const ld = spec.link_data;
  if (ld?.link) return ld.link;
  if (ld?.call_to_action?.value?.link) return ld.call_to_action.value.link;
  const vd = spec.video_data;
  if (vd?.call_to_action?.value?.link) return vd.call_to_action.value.link;
  return null;
}

/** Aktiva före pausade, nyast först — samma ordning som meta-lib klonar adsets i. */
function ordnaAnnonser(annonser) {
  return [...(annonser ?? [])].sort((a, b) =>
    (b.status === 'ACTIVE') - (a.status === 'ACTIVE')
    || String(b.created_time || '').localeCompare(String(a.created_time || '')));
}

/** Länken ur kampanjens senaste ACTIVE annons (annars senaste annons alls). null om ingen. */
export function plockaLank(annonser) {
  for (const a of ordnaAnnonser(annonser)) {
    const l = lankUrSpec(a?.creative?.object_story_spec);
    if (l) return l;
  }
  return null;
}

/** DSA-fälten ur en befintlig annons i kampanjen: { beneficiary, payor } eller null när ingen bär dem. */
export function plockaDsa(annonser) {
  for (const a of ordnaAnnonser(annonser)) {
    if (a?.dsa_beneficiary || a?.dsa_payor) {
      return { beneficiary: a.dsa_beneficiary ?? null, payor: a.dsa_payor ?? null };
    }
  }
  return null;
}

/**
 * object_story_spec — exakt samma fältnamn som tools/notion-till-meta.mjs:
 *   bild : link_data  { image_hash, link, message, name, description, call_to_action }
 *   video: video_data { video_id, image_url (thumbnail), title, message, link_description, call_to_action.value.link }
 * call_to_action är alltid SHOP_NOW. Tom beskrivning utelämnas.
 */
export function byggSpec({ typ, pageId, igId = null, media, primär, rubrik, beskrivning = '', länk }) {
  const cta = { type: 'SHOP_NOW', value: { link: länk } };
  let spec;
  if (typ === 'video') {
    spec = {
      page_id: pageId,
      video_data: {
        video_id: media.videoId, image_url: media.thumb, message: primär, title: rubrik,
        link_description: beskrivning || undefined,
        call_to_action: cta,
      },
    };
  } else if (typ === 'bild') {
    spec = {
      page_id: pageId,
      link_data: {
        image_hash: media.hash, link: länk, message: primär, name: rubrik,
        description: beskrivning || undefined,
        call_to_action: cta,
      },
    };
  } else {
    throw new Error(`byggSpec: okänd medietyp "${typ}".`);
  }
  if (igId) spec.instagram_actor_id = igId;
  return spec;
}

/**
 * Exakt EN aktiv kampanj för butiken på marknaden. Ren funktion.
 *   kampanjer    alla kampanjer i kontot ({id,name,status,…})
 *   prefix       butikens prefix (register.prefixFor)
 *   annonsrader  butikens annonser ({campaign_id}) — flerproduktsbutikernas väg in
 *   marknad      SE | NO | …
 * Returnerar { kampanj, kandidater, skal }: kampanj är null när valet inte är entydigt.
 */
export function valjEnKampanj({ kampanjer, prefix, annonsrader = [], marknad }) {
  const val = valjKampanjer(kampanjer ?? [], prefix, annonsrader);
  const m = filtreraPaMarknad(val.butikens.map((k) => ({ ...k, campaign_name: k.name })), marknad);
  const paMarknad = m.behall;
  const aktiva = paMarknad.filter((k) => k.status === 'ACTIVE');
  const lista = (l) => l.map((k) => `${k.name} (${k.id}, ${k.status})`).join(' · ');
  if (aktiva.length === 1) {
    return { kampanj: aktiva[0], kandidater: paMarknad, butikens: val.butikens, baraViaAnnons: val.baraViaAnnons, skal: null };
  }
  if (aktiva.length === 0) {
    const skal = paMarknad.length
      ? `Ingen ACTIVE kampanj för butiken på marknad ${marknad}. Hittade bara: ${lista(paMarknad)}. PAUSED är ett beslut — ange --kampanj <id> om en av dem ändå ska bära annonsen.`
      : `Ingen kampanj för butiken (prefix ${prefix.join(' / ')}) på marknad ${marknad} i kontot${val.butikens.length ? ` — butikens kampanjer ligger på annan marknad: ${lista(val.butikens)}` : ''}.`;
    return { kampanj: null, kandidater: paMarknad, butikens: val.butikens, baraViaAnnons: val.baraViaAnnons, skal };
  }
  return {
    kampanj: null, kandidater: paMarknad, butikens: val.butikens, baraViaAnnons: val.baraViaAnnons,
    skal: `${aktiva.length} ACTIVE kampanjer för butiken på marknad ${marknad} — vet inte vilken. Ange --kampanj <id>: ${lista(aktiva)}`,
  };
}

/** Enkel argumenttolkning: positional nyckel + --flaggor. Flaggvärden räknas aldrig som positional. */
export function tolkaArgs(argv) {
  const BOOL = new Set(['torr', 'json']);
  const ut = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const n = a.slice(2);
      if (BOOL.has(n)) { ut[n] = true; continue; }
      const v = argv[i + 1];
      if (v !== undefined && !v.startsWith('--')) { ut[n] = v; i += 1; } else { ut[n] = null; }
    } else {
      ut._.push(a);
    }
  }
  return ut;
}

// ------------------------------------------------------------------ CLI

const KAMPANJFÄLT = 'id,name,status,effective_status,account_id,daily_budget,lifetime_budget,created_time';
const ANNONSFÄLT_KAMPANJ = 'id,name,status,effective_status,created_time,creative{object_story_spec}';

function dö(msg, json) {
  console.error(`✗ ${msg}`);
  if (json) process.stdout.write(`${JSON.stringify({ ok: false, fel: msg })}\n`);
  process.exit(1);
}

async function huvud() {
  const args = tolkaArgs(process.argv.slice(2));
  const JSONUT = Boolean(args.json);
  const TORR = Boolean(args.torr);
  // All logg på stderr — även meta-lib:s (rate limit-rader m.m.) — så att
  // --json alltid är sista och enda raden på stdout.
  console.log = (...a) => console.error(...a);
  const logg = (...a) => console.error(...a);
  const stopp = (m) => dö(m, JSONUT);

  const nyckel = args._[0];
  if (!nyckel) stopp('Ange butikens nyckel först: node tools/ops-till-meta.mjs <nyckel> --marknad SE|NO --namn … --fil … --primar … --rubrik …');
  if (!process.env.META_ACCESS_TOKEN) stopp('META_ACCESS_TOKEN saknas i miljön.');

  const marknad = String(args.marknad ?? '').toUpperCase();
  if (!MARKNADSKODER.includes(marknad)) stopp(`Ange --marknad SE|NO (fick "${args.marknad ?? ''}").`);
  const namn = args.namn;
  const fil = args.fil;
  const primär = args.primar;
  const rubrik = args.rubrik;
  const beskrivning = args.beskrivning ?? '';
  if (!namn) stopp('Ange --namn <annonsnamn enligt docs/naming-convention.md>.');
  if (!fil || !existsSync(fil)) stopp(`Filen finns inte: ${fil}`);
  if (!primär || !rubrik) stopp('Ange både --primar och --rubrik (ad copy ur briefen).');
  const typ = medietyp(fil);
  if (!typ) stopp(`Okänd filtyp "${extname(fil)}" — bara ${[...VIDEO, ...BILD].join(' ')} laddas upp.`);
  if (args.lank && !/^https?:\/\//.test(args.lank)) stopp(`--lank måste vara en full URL, fick: ${args.lank}`);

  // 1. Butiken + kontospärren. sakerstallKonto körs redan i laddaButik, men
  //    OPS-kravet står här en gång till med klartext — det här verktyget skriver.
  const butik = laddaButik(nyckel);
  const { post } = butik;
  const konto = sakerstallKonto(post);
  if (konto !== OPS_ANNONSKONTO) stopp(`${post.nyckel} pekar på konto ${konto}, inte OPS-kontot ${OPS_ANNONSKONTO}. Avbryter — fel annonskonto kostar riktiga pengar.`);
  if (!butik.prefix) stopp(`${post.nyckel}: ${butik.prefixfel}`);
  logg(`\n=== ops-till-meta — ${post.brand} (${post.nyckel}) · marknad ${marknad} · konto ${konto}${TORR ? ' · TORRKÖRNING (inget skrivs)' : ''} ===`);
  logg(`1. Butik: prefix ${butik.prefix.join(' · ')} · annons "${namn}" · ${typ} ${basename(fil)} (${(statSync(fil).size / 1048576).toFixed(2)} MB)`);

  // 3. Marknadskoll på namnet — före något nätanrop, den är gratis.
  const mk = kontrolleraMarknad(namn, marknad);
  if (!mk.ok) stopp(mk.skal);
  logg(`3. Marknadskoll: "${namn}" ${mk.koder.length ? `bär ${mk.koder.join('/')}` : 'saknar marknadskod (= SE)'} — ok för ${marknad}`);

  // 5a. Konceptet — också gratis, och ett stopp här sparar alla anrop nedan.
  const koncept = konceptUrNamn(namn);
  if (!koncept) stopp(`Kan inte läsa konceptkoden ur "${namn}" — fältet efter brand (och marknadskod) är inte 1–4 bokstäver. Verktyget gissar aldrig.`);

  // 2. Kampanjen. Kontots annonser läses EN gång: butikens (via prefixet) pekar
  //    ut kampanjen i flerproduktsbutiker, och hela listan är dubblettspärren.
  const allaAnnonser = await alla(`act_${konto}/ads`, { fields: 'id,name,campaign_id,effective_status' });
  const butikens = allaAnnonser.filter((a) => tillhorButiken(a.name, butik.prefix));
  let kampanj;
  if (args.kampanj) {
    kampanj = await api(String(args.kampanj), { params: { fields: KAMPANJFÄLT } });
    if (String(kampanj.account_id) !== OPS_ANNONSKONTO) stopp(`Kampanj ${args.kampanj} ligger på konto ${kampanj.account_id}, inte OPS-kontot ${OPS_ANNONSKONTO}. Avbryter.`);
    const v = valjKampanjer([kampanj], butik.prefix, butikens);
    if (!v.butikens.length) stopp(`Kampanj "${kampanj.name}" (${kampanj.id}) tillhör inte ${post.brand}: namnet börjar inte med ${butik.prefix.join(' / ')} och ingen annons med prefixet ligger där.`);
    const m = filtreraPaMarknad([{ ...kampanj, campaign_name: kampanj.name }], marknad);
    if (!m.behall.length) stopp(`Kampanj "${kampanj.name}" ligger på marknad ${Object.keys(m.bortfiltrerade).join('/')}, inte ${marknad}.`);
    logg(`2. Kampanj (--kampanj): "${kampanj.name}" (${kampanj.id}) ${kampanj.status}/${kampanj.effective_status}${v.baraViaAnnons.length ? ' — matchar via annonserna, inte namnet' : ''}`);
  } else {
    const kampanjer = await alla(`act_${konto}/campaigns`, { fields: KAMPANJFÄLT });
    const val = valjEnKampanj({ kampanjer, prefix: butik.prefix, annonsrader: butikens, marknad });
    logg(`2. Kampanjer: ${kampanjer.length} i kontot · ${val.butikens.length} är ${post.brand}s · ${val.kandidater.length} på marknad ${marknad}${val.baraViaAnnons.length ? ` · via annonserna: ${val.baraViaAnnons.join(' · ')}` : ''}`);
    for (const k of val.kandidater) logg(`   ${k.status === 'ACTIVE' ? '▶' : '⏸'} ${k.name} (${k.id}) ${k.status}/${k.effective_status}`);
    if (!val.kampanj) stopp(val.skal);
    kampanj = val.kampanj;
    logg(`   → vald: "${kampanj.name}" (${kampanj.id})`);
  }
  const bas = kampanjbas(kampanj.name);

  // Utfallet läses live: PAUSED med spend är avvecklad — dit laddas inget upp.
  const u = await kampanjUtfall(kampanj.id);
  if (u.utfall === 'SAKNAS') stopp(`Kampanjen ${kampanj.id} gick inte att läsa: ${u.fel}`);
  if (u.utfall === 'AVVECKLAD') stopp(`"${kampanj.name}" är PAUSED med ${u.spend} kr spend — avvecklad. PAUSED med spend är ett beslut; laddar inte upp "${namn}" där.`);
  if (u.utfall === 'PAUSAD_TOM') logg(`   ⚠ "${kampanj.name}" är PAUSED utan spend. Kampanjen RÖRS INTE — annonsen spenderar inget förrän en människa slår på den.`);
  const budgetÖre = Number(kampanj.daily_budget || 0) || Number(kampanj.lifetime_budget || 0);
  if (!budgetÖre) stopp(`"${kampanj.name}" saknar kampanjbudget (daily_budget/lifetime_budget) — inte CBO. Ett nytt adset hade då behövt egen budget, och det klonar meta-lib aldrig. Bygg adsetet för hand eller gör kampanjen till CBO.`);
  logg(`   CBO: ${kampanj.daily_budget ? `${(Number(kampanj.daily_budget) / 100).toFixed(0)} kr/dag` : `lifetime ${(Number(kampanj.lifetime_budget) / 100).toFixed(0)} kr`} · kampanjbas "${bas}"`);

  // 4. Dubblett i hela kontot.
  const dubblett = allaAnnonser.find((a) => a.name.trim().toLowerCase() === namn.trim().toLowerCase());
  if (dubblett) stopp(`"${namn}" finns redan i kontot: ad_id ${dubblett.id} (${dubblett.effective_status}, kampanj ${dubblett.campaign_id}). Laddar inte upp igen.`);
  logg(`4. Dubblett: "${namn}" finns inte bland kontots ${allaAnnonser.length} annonser — ok`);

  // 5b. Adsetet: exakt namn, annars klon av nyaste syskonet (född PAUSED).
  const adsetnamn = adsetNamn(kampanj.name, koncept);
  // koncept: hittar även kampanjens egen konvention (DRYTREK_SE_PD) och döper
  // ett nytt adset efter den, så ett koncept aldrig får två adsets.
  const { adset, skapad, mall } = await hittaEllerSkapaAdset({ kampanjId: kampanj.id, act: konto, namn: adsetnamn, koncept, torr: TORR });
  logg(`5. Koncept ${koncept} → adset "${adset.name}" (${adset.id})${skapad ? ` — ${TORR ? 'skulle skapas' : 'nyskapat'} som klon av "${mall}", föds PAUSED` : ` — finns, ${adset.status}`}`);

  // 6. Sida + IG, länk och DSA ur kampanjens befintliga annonser.
  const { pageId, igId } = await ärvSidaOchIg(kampanj.id);
  let kampanjensAnnonser;
  let dsaLäst = true;
  try {
    kampanjensAnnonser = await alla(`${kampanj.id}/ads`, { fields: `${ANNONSFÄLT_KAMPANJ},dsa_beneficiary,dsa_payor` }, 50);
  } catch (e) {
    dsaLäst = false;
    logg(`   ⚠ DSA-fälten gick inte att läsa (${e.message}) — läser om utan dem`);
    kampanjensAnnonser = await alla(`${kampanj.id}/ads`, { fields: ANNONSFÄLT_KAMPANJ }, 50);
  }
  const länk = args.lank || plockaLank(kampanjensAnnonser);
  if (!länk) stopp(`Ingen landningssida: --lank saknas och ingen annons i "${kampanj.name}" bär en länk. Ange --lank <produktsidans url>.`);
  const dsa = dsaLäst ? plockaDsa(kampanjensAnnonser) : null;
  logg(`6. Sida ${pageId}${igId ? ` + IG ${igId}` : ' (ingen IG)'} · länk ${länk}${args.lank ? ' (--lank)' : ' (ärvd)'} · DSA ${dsa ? `beneficiary "${dsa.beneficiary}" / payor "${dsa.payor}" (ärvd)` : 'saknas — skickar inget'}`);

  // 7–8. Media + spec.
  let media;
  if (TORR) {
    media = typ === 'video' ? { videoId: '<torr-video-id>', thumb: '<torr-thumbnail-url>' } : { hash: '<torr-image-hash>' };
    logg(`7. Media: skulle ladda upp ${typ} ${basename(fil)} (torr — ingen uppladdning)`);
  } else if (typ === 'video') {
    const videoId = await laddaUppVideo(konto, fil);
    const thumb = await väntaPåThumb(videoId);
    media = { videoId, thumb };
    logg(`7. Media: video ${videoId} uppladdad, thumbnail klar`);
  } else {
    media = { hash: await laddaUppBild(konto, fil) };
    logg(`7. Media: bild uppladdad, image_hash ${media.hash}`);
  }
  const spec = byggSpec({ typ, pageId, igId, media, primär, rubrik, beskrivning, länk });
  const enhancements = ingaEnhancements();
  logg(`8. Creative-spec (SHOP_NOW, alla enhancements OPT_OUT):\n${JSON.stringify(spec, null, 2).replace(/^/gm, '   ')}`);

  const ut = {
    ok: true, butik: post.brand, nyckel: post.nyckel, konto, marknad,
    kampanj: { id: kampanj.id, namn: kampanj.name, bas },
    adset: { id: adset.id, namn: adset.name, skapad },
    annons: { id: null, namn, status: null, effective_status: null },
    creative_id: null,
    media: typ === 'video' ? { typ, id: media.videoId } : { typ, hash: media.hash },
    lank: länk, dsa, torr: TORR,
  };

  if (TORR) {
    logg(`\n[TORRKÖRNING] Skulle skapa annons "${namn}" PAUSED i "${adset.name}" och sedan aktivera annonsen${skapad ? ' + det nya adsetet' : ''}. Kampanjen rörs aldrig. Inget skrevs.`);
    ut.annons.status = 'TORR';
    if (JSONUT) process.stdout.write(`${JSON.stringify(ut)}\n`);
    return;
  }

  const { creativeId, annonsId } = await skapaAnnons({ act: konto, adsetId: adset.id, namn, spec, enhancements, dsa });
  ut.creative_id = creativeId;
  ut.annons.id = annonsId;
  logg(`8. Annons skapad PAUSED: ${namn} (${annonsId}), creative ${creativeId}`);

  // 9. Live direkt (Axels beslut 2026-09-11). aktivera() rör bara annonsen och
  //    det adset körningen själv skapade — aldrig kampanjen.
  const { efter, ändringar } = await aktivera({ annonsId, adset, skapad });
  ut.annons.status = efter.status;
  ut.annons.effective_status = efter.effective_status;
  logg(`9. Aktiverad: ${ändringar.join('; ')}`);
  logg(`   Tillbakaläsning: ${efter.name} → ${efter.status} / effective ${efter.effective_status} (adset ${efter.adset_id})`);
  if (efter.status !== 'ACTIVE') logg('   ⚠ Statusen är inte ACTIVE efter aktiveringen — en människa måste titta.');
  if (u.utfall === 'PAUSAD_TOM') logg(`   ⚠ Kampanjen "${kampanj.name}" är fortfarande PAUSED (rörs aldrig av körningen).`);

  if (JSONUT) process.stdout.write(`${JSON.stringify(ut)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  säkerställProxy();
  huvud().catch((e) => dö(e.message, process.argv.includes('--json')));
}
