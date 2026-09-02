#!/usr/bin/env node
// notion-till-meta.mjs — laddar upp EN godkänd creative från redigerarna till
// produktens aktiva kampanj i MagiBorsten. Används av /notionkorning.
//
//   node tools/notion-till-meta.mjs --produkt <id> --namn <annonsnamn> --fil <sökväg>
//        --primar "..." --rubrik "..." [--beskrivning "..."] [--lank <url>]
//        [--koncept <kod>] [--aktivera] [--torr]
//
//   node tools/notion-till-meta.mjs --lista --produkt <id>     visa kampanjens adsets/annonser
//
// Kräver env: META_ACCESS_TOKEN (ads_management + ads_read).
//
// SPÄRRAR SOM INTE GÅR ATT FLAGGA BORT:
//  1. Endast MagiBorsten 1867947880635861 (Bäverbutiken). Fel konto = avbryt.
//     Sidan och pixeln ärvs alltid från kampanjen — kopieras aldrig in för hand.
//  2. Allt skapas PAUSED. --aktivera slar pa annonsen och det adset korningen SJALV
//     skapade — aldrig ett befintligt adset eller en befintlig kampanj, oavsett spend.
//  3. Ingenting med lifetime-spend > 0 får någonsin statusändras. PAUSED med spend
//     är ett beslut (Axels, skalningsrondens eller åtgärdstrappans) — heligt.
//     (Incident 2026-08-29/30: ett namnsvep slog på ett dussin avstängda kampanjer.)
//  4. Dubblettspärr på annonsnamn i hela kontot — samma creative laddas aldrig upp två gånger.

import { readFileSync, existsSync, statSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';

const API = `https://graph.facebook.com/${process.env.META_API_VERSION || 'v23.0'}`;
const TOKEN = process.env.META_ACCESS_TOKEN;
const BAVERBUTIKEN_ACT = '1867947880635861';   // MagiBorsten (SEK) — enda tillåtna kontot
const ROT = new URL('..', import.meta.url).pathname;

const args = process.argv.slice(2);
const flagga = (namn, standard = null) => {
  const i = args.indexOf(`--${namn}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : standard;
};
const finns = (namn) => args.includes(`--${namn}`);
const TORR = finns('torr');

function dö(msg) { console.error(`✗ ${msg}`); process.exit(1); }
const logg = (...a) => console.log(...a);

// ---------------------------------------------------------------- Meta API

async function api(sökväg, { method = 'GET', params = {}, form = null } = {}) {
  if (!TOKEN) dö('META_ACCESS_TOKEN saknas i miljön.');
  const url = new URL(`${API}/${sökväg}`);
  let body;
  if (form) {
    body = form instanceof FormData ? form : new URLSearchParams(form);
    body.append('access_token', TOKEN);
  } else {
    url.searchParams.set('access_token', TOKEN);
  }
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  const res = await fetch(url, { method: form ? 'POST' : method, body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error || {};
    throw new Error(`Meta ${res.status}: ${e.message || res.statusText}${e.error_user_msg ? ` — ${e.error_user_msg}` : ''}`);
  }
  return json;
}

/** Alla sidor av ett edge-anrop. Kontot har fler än 25 annonser. */
async function alla(sökväg, params) {
  const ut = [];
  let svar = await api(sökväg, { params: { ...params, limit: 200 } });
  ut.push(...(svar.data || []));
  while (svar.paging?.next) {
    const res = await fetch(svar.paging.next);
    svar = await res.json();
    if (svar.error) break;
    ut.push(...(svar.data || []));
  }
  return ut;
}

/** Lifetime-spend för ett objekt. 0 = har aldrig kommit igång. Fel = anta "har spenderat". */
async function spend(id) {
  try {
    const r = await api(`${id}/insights`, { params: { date_preset: 'maximum', fields: 'spend' } });
    return Number(r.data?.[0]?.spend ?? 0);
  } catch {
    return Infinity;   // kan vi inte läsa spenden rör vi aldrig statusen
  }
}

// ------------------------------------------------------------- Produkten

function laddaProdukt(id) {
  const fil = resolve(ROT, 'products/products.json');
  const { products } = JSON.parse(readFileSync(fil, 'utf8'));
  const p = products.find(x => x.id === id);
  if (!p) dö(`Okänd produkt "${id}". Finns: ${products.map(x => x.id).join(', ')}`);
  if (p.ad_account_id !== BAVERBUTIKEN_ACT) {
    dö(`${id} pekar på konto ${p.ad_account_id}, inte Bäverbutikens ${BAVERBUTIKEN_ACT}. Avbryter — fel annonskonto kostar riktiga pengar.`);
  }
  if (!p.campaign_ids?.length) dö(`${id} saknar campaign_ids i products.json — ingen kampanj att ladda upp i.`);
  return p;
}

/** Konceptkoden ur annonsnamnet: Enginecover_SP_6_H1 → "SP", Kranskydd_CI_1_1 → "CI".
 *
 *  Koden ar bokstaverna i ANDRA faltet. Den far ALDRIG gissas fram ur ett numeriskt
 *  falt: en tidigare version foll tillbaka pa delar[2] och gav konceptet "1" for
 *  Kranskydd_CI_1_1, vilket matchade vilket adset som helst med en etta i namnet —
 *  och nar inget matchade skapades ett skrapadset som hette "1 | Notionrunda".
 *  Kontot innehaller minst CS GT PD SP SO CI UG G SAG SF REA; en fast lista blir
 *  alltid inaktuell. Bokstaver = kod, siffror = ingen kod. */
function konceptUrNamn(namn) {
  const fält = namn.split('_');
  if (fält.length < 2) return null;
  const kandidat = fält[1].trim();
  return /^[A-Za-z]{1,4}$/.test(kandidat) ? kandidat.toUpperCase() : null;
}

// --------------------------------------------------------- Adset i CBO:n

/** Adset för konceptet i kampanjen. Finns inget: klona ett befintligt adsets
 *  inställningar (targeting, pixel, optimering) — gissa aldrig ihop dem själv. */
async function hittaEllerSkapaAdset(kampanjId, koncept, produkt) {
  const adsets = await alla(`${kampanjId}/adsets`, {
    fields: 'name,status,created_time,optimization_goal,billing_event,targeting,promoted_object,attribution_spec,destination_type,daily_budget',
  });
  if (!adsets.length) dö(`Kampanj ${kampanjId} har inga adsets att härma. Bygg första adsetet för hand innan rutinen kör.`);

  // Nyast först, aktiva före pausade. Kontot har flera batcher per koncept
  // ("Motorhölje SP Batch 5" och "... Batch 6") — nya creatives ska aldrig
  // hamna i en gammal avstängd batch bara för att den råkade komma först.
  const ordnade = [...adsets].sort((a, b) =>
    (b.status === 'ACTIVE') - (a.status === 'ACTIVE') ||
    String(b.created_time || '').localeCompare(String(a.created_time || '')));

  const re = new RegExp(`(^|[^a-zA-Z])${koncept}([^a-zA-Z]|$)`, 'i');
  const träff = ordnade.find(a => re.test(a.name));
  if (träff) {
    if (träff.status !== 'ACTIVE') {
      logg(`  ⚠ Enda adsetet för koncept "${koncept}" är ${träff.status}: "${träff.name}". Annonsen hamnar bakom det.`);
    }
    return { adset: träff, skapad: false };
  }

  const mall = ordnade[0];
  const namn = `${koncept.toUpperCase()} | Notionrunda ${new Date().toISOString().slice(0, 10)}`;
  logg(`  · Inget adset för koncept "${koncept}" — klonar inställningar från "${mall.name}"`);

  if (TORR) return { adset: { id: 'TORR-ADSET', name: namn, ...mall }, skapad: true };

  const kropp = {
    name: namn,
    campaign_id: kampanjId,
    status: 'PAUSED',
    billing_event: mall.billing_event || 'IMPRESSIONS',
    optimization_goal: mall.optimization_goal || 'OFFSITE_CONVERSIONS',
    targeting: JSON.stringify(mall.targeting || { geo_locations: { countries: ['SE'] } }),
  };
  // CBO: budgeten bor på kampanjen. Ett adset med egen budget bryter kampanjen.
  if (mall.promoted_object) kropp.promoted_object = JSON.stringify(mall.promoted_object);
  if (mall.attribution_spec) kropp.attribution_spec = JSON.stringify(mall.attribution_spec);
  if (mall.destination_type) kropp.destination_type = mall.destination_type;

  const r = await api(`act_${produkt.ad_account_id}/adsets`, { form: kropp });
  return { adset: { id: r.id, name: namn }, skapad: true };
}

// ---------------------------------------------------------- Uppladdning

async function laddaUppVideo(act, fil) {
  const form = new FormData();
  form.append('source', new Blob([readFileSync(fil)]), basename(fil));
  form.append('title', basename(fil));
  const r = await api(`act_${act}/advideos`, { form });
  if (!r.id) throw new Error('Metas advideos gav ingen video-id.');
  return r.id;
}

/** Metas thumbnail dyker upp först när videon processats. Vänta max ~2 min. */
async function väntaPåThumb(videoId) {
  for (let i = 0; i < 24; i++) {
    const r = await api(videoId, { params: { fields: 'status,thumbnails' } });
    const t = (r.thumbnails?.data || []).find(x => x.is_preferred) || r.thumbnails?.data?.[0];
    if (t?.uri) return t.uri;
    if (r.status?.video_status === 'error') throw new Error('Meta kunde inte processa videon.');
    await new Promise(s => setTimeout(s, 5000));
  }
  throw new Error('Metas video-thumbnail kom aldrig — annonsen skapas inte utan den.');
}

async function laddaUppBild(act, fil) {
  const r = await api(`act_${act}/adimages`, { form: { bytes: readFileSync(fil).toString('base64') } });
  const bild = Object.values(r.images || {})[0];
  if (!bild?.hash) throw new Error('Metas adimages gav ingen image_hash.');
  return bild.hash;
}

/** Sida och Instagram-konto ärvs från en befintlig creative i kampanjen.
 *  Hårdkodas ALDRIG — fel pixel/sida bokför köpen på fel verksamhet. */
async function ärvSidaOchIg(kampanjId) {
  const annonser = await alla(`${kampanjId}/ads`, { fields: 'creative{object_story_spec,effective_object_story_id}' });
  for (const a of annonser) {
    const spec = a.creative?.object_story_spec;
    if (spec?.page_id) return { pageId: spec.page_id, igId: spec.instagram_actor_id || spec.instagram_user_id || null };
  }
  dö(`Kunde inte läsa sida/Instagram ur någon befintlig annons i kampanj ${kampanjId}. Avbryter hellre än gissar — fel sida är fel verksamhet.`);
}

// ------------------------------------------------------------------ Main

async function lista(produkt) {
  for (const kid of produkt.campaign_ids) {
    const k = await api(kid, { params: { fields: 'name,status,daily_budget,effective_status' } });
    logg(`\nKampanj ${k.name} [${k.status}] budget ${(Number(k.daily_budget || 0) / 100).toFixed(0)} kr/dag`);
    for (const a of await alla(`${kid}/adsets`, { fields: 'name,status' })) {
      const annonser = await alla(`${a.id}/ads`, { fields: 'name,status' });
      logg(`  ${a.name} [${a.status}] — ${annonser.length} annonser`);
      for (const ad of annonser) logg(`      ${ad.status === 'ACTIVE' ? '▶' : '⏸'} ${ad.name}`);
    }
  }
}

async function main() {
  const produktId = flagga('produkt');
  const kampanjFlagga = flagga('kampanj');
  if (!produktId && !kampanjFlagga) dö('Ange --produkt <id> eller --kampanj <kampanj-id>.');

  // Nya produkter dyker upp standigt i Baverbutiken och star inte i products.json.
  // Da anges kampanjen direkt — leveranskon.mjs har redan hittat ratt kampanj ur
  // kontot. Kontokontrollen gors anda: kampanjen maste ligga i MagiBorsten.
  let produkt;
  if (produktId) {
    produkt = laddaProdukt(produktId);
  } else {
    const k = await api(kampanjFlagga, { params: { fields: 'name,account_id' } });
    if (k.account_id !== BAVERBUTIKEN_ACT) {
      dö(`Kampanj ${kampanjFlagga} ligger på konto ${k.account_id}, inte Bäverbutikens ${BAVERBUTIKEN_ACT}. Avbryter — fel annonskonto kostar riktiga pengar.`);
    }
    produkt = { id: k.name, ad_account_id: BAVERBUTIKEN_ACT, campaign_ids: [kampanjFlagga] };
  }
  const act = produkt.ad_account_id;

  if (finns('lista')) return lista(produkt);

  const namn = flagga('namn');
  const fil = flagga('fil');
  const primär = flagga('primar');
  const rubrik = flagga('rubrik');
  const beskrivning = flagga('beskrivning', '');
  // Lanken MASTE anges. Tidigare foll den tillbaka pa produkt.landing_url (ett falt
  // som inte finns pa en enda produkt i repot) och sedan pa butikens startsida — sa
  // varje uppladdad annons hade skickat trafiken till forstasidan i stallet for
  // produktsidan, varje natt, utan felmeddelande. Hellre avbryta an gissa.
  const länk = flagga('lank', produkt.landing_url || null);
  if (!länk) {
    dö(`Ingen landningssida angiven för "${namn}". Ange --lank <produktsidans url>.\n`
     + `   Notion-raden bär den i fältet "Landing page"; leveranskon.mjs skriver ut den.\n`
     + `   Utan den skulle annonsen peka på butikens startsida.`);
  }
  if (!/^https?:\/\//.test(länk)) dö(`--lank måste vara en full URL, fick: ${länk}`);
  if (!namn) dö('Ange --namn <annonsnamn enligt docs/naming-convention.md>.');
  if (!fil || !existsSync(fil)) dö(`Filen finns inte: ${fil}`);
  if (!primär || !rubrik) dö('Ange både --primar och --rubrik (ad copy ur briefen).');

  const kampanjId = produkt.campaign_ids[0];
  const kampanj = await api(kampanjId, { params: { fields: 'name,status,daily_budget' } });
  logg(`Produkt ${produkt.id} → kampanj "${kampanj.name}" (${kampanjId}) på MagiBorsten ${act}`);

  // SPÄRR 0 — en avstängd kampanj som har spenderat ar avvecklad, inte tom.
  // Nya creatives ska inte in dar: de begravs bakom en pausad kampanj, forsvinner
  // ur konet (dubblettsparren ser dem som gjorda) och kan bli aktiverade av misstag
  // den dag nagon slar pa kampanjen igen. Rapportera i stallet.
  // (Axels reaktion 2026-08-30: motorhoIjets hub var dessutom arkiverad i Notion.)
  if (kampanj.status !== 'ACTIVE') {
    const s = await spend(kampanjId);
    if (s > 0) {
      logg(`⏭  "${kampanj.name}" är ${kampanj.status} med ${s} kr spend — avstängd med flit.`);
      logg(`   Laddar INTE upp "${namn}" här. Produkten ligger på hyllan.`);
      logg(`   Vill du ändå: aktivera kampanjen först, eller kör med --anda.`);
      if (!finns('anda')) return;
      logg(`   --anda angivet: fortsätter ändå.`);
    }
  }

  // Spärr 4 — dubblett. Samma annonsnamn någonstans i kontot = redan uppladdad.
  const befintliga = await alla(`act_${act}/ads`, { fields: 'name,status,adset_id' });
  const dubblett = befintliga.find(a => a.name.trim().toLowerCase() === namn.trim().toLowerCase());
  if (dubblett) {
    logg(`⏭  "${namn}" finns redan i kontot (${dubblett.id}, ${dubblett.status}). Laddar inte upp igen.`);
    return;
  }

  const koncept = flagga('koncept') || konceptUrNamn(namn);
  if (!koncept) {
    dö(`Kan inte läsa konceptkoden ur "${namn}" — andra fältet är inte bokstäver.\n`
     + `   Ange --koncept <kod> explicit. Verktyget gissar aldrig: en felgissad kod\n`
     + `   lägger annonsen i fel adset eller skapar ett skräpadset.`);
  }

  const { adset, skapad } = await hittaEllerSkapaAdset(kampanjId, koncept, produkt);
  logg(`  · Adset: ${adset.name} (${adset.id})${skapad ? ' — nyskapat' : ''}`);

  const ärVideo = ['.mp4', '.mov', '.m4v'].includes(extname(fil).toLowerCase());
  logg(`  · Laddar upp ${ärVideo ? 'video' : 'bild'} (${(statSync(fil).size / 1048576).toFixed(1)} MB)`);

  if (TORR) {
    logg(`\n[TORRKÖRNING] Skulle skapa annons "${namn}" i adset ${adset.name}.`);
    logg(`  primärtext: ${primär.slice(0, 80)}…\n  rubrik: ${rubrik}\n  länk: ${länk}`);
    logg(`  status: ${finns('aktivera') ? 'ACTIVE efter grön QA' : 'PAUSED'}`);
    return;
  }

  const { pageId, igId } = await ärvSidaOchIg(kampanjId);
  logg(`  · Ärver sida ${pageId}${igId ? ` + IG ${igId}` : ''} från kampanjens befintliga annonser`);

  let spec;
  if (ärVideo) {
    const videoId = await laddaUppVideo(act, fil);
    const thumb = await väntaPåThumb(videoId);
    spec = {
      page_id: pageId,
      video_data: {
        video_id: videoId, image_url: thumb, message: primär, title: rubrik,
        link_description: beskrivning || undefined,
        call_to_action: { type: 'SHOP_NOW', value: { link: länk } },
      },
    };
  } else {
    const hash = await laddaUppBild(act, fil);
    spec = {
      page_id: pageId,
      link_data: {
        image_hash: hash, link: länk, message: primär, name: rubrik,
        description: beskrivning || undefined,
        call_to_action: { type: 'SHOP_NOW', value: { link: länk } },
      },
    };
  }
  if (igId) spec.instagram_actor_id = igId;

  const creative = await api(`act_${act}/adcreatives`, {
    form: {
      name: namn,
      object_story_spec: JSON.stringify(spec),
      // Inga creative enhancements — samma linje som launch.md.
      degrees_of_freedom_spec: JSON.stringify({ creative_features_spec: { standard_enhancements: { enroll_status: 'OPT_OUT' } } }),
    },
  });

  const annons = await api(`act_${act}/ads`, {
    form: {
      name: namn, adset_id: adset.id,
      creative: JSON.stringify({ creative_id: creative.id }),
      status: 'PAUSED',    // spärr 2 — allt föds pausat
    },
  });
  logg(`✓ Annons skapad PAUSED: ${namn} (${annons.id})`);

  if (!finns('aktivera')) {
    logg('  Lämnas PAUSED (ingen --aktivera).');
    return;
  }

  // Spärr 3 — aktivera BARA det körningen sjalv skapat.
  //
  // Tidigare rackte det att lifetime-spend var 0 kr for att ett befintligt adset
  // eller en befintlig kampanj skulle slas pa. Det ar fel: en kampanj kan vara
  // byggd och medvetet aldrig launchad, och da borjar den spendera sin dagsbudget
  // kl 00:01 utan att nagon bett om det. 0 kr spend betyder "har aldrig kommit
  // igang", inte "far startas". Axels regel i CLAUDE.md sager samma sak:
  // aktivering galler enbart det korningen sjalv skapat.
  const ändringar = [];
  if (skapad) {
    await api(adset.id, { form: { status: 'ACTIVE' } });
    ändringar.push(`adset ${adset.name}: PAUSED → ACTIVE (nyskapat av körningen)`);
  } else {
    const a = await api(adset.id, { params: { fields: 'name,status' } });
    if (a.status !== 'ACTIVE') {
      logg(`  ⚠ Adset "${a.name}" är ${a.status} och skapades inte av den här körningen — RÖRS INTE.`);
      logg(`     Annonsen ligger pausad bakom det. Slå på adsetet själv om den ska rulla.`);
    }
  }
  if (kampanj.status !== 'ACTIVE') {
    logg(`  ⚠ Kampanj "${kampanj.name}" är ${kampanj.status} — RÖRS INTE (skapades inte av körningen).`);
    logg(`     Annonsen spenderar ingenting förrän du slår på kampanjen.`);
  }

  await api(annons.id, { form: { status: 'ACTIVE' } });
  ändringar.push(`annons ${namn}: PAUSED → ACTIVE`);

  // Tillbakaläsning — Meta tvångspausar vid struktur-/budgetändringar.
  const efter = await api(annons.id, { params: { fields: 'name,status,effective_status' } });
  logg(`✓ Aktiverad. Tillbakaläsning: ${efter.status} / effective ${efter.effective_status}`);
  logg(`Statusändringar:\n${ändringar.map(x => `  - ${x}`).join('\n')}`);
}

main().catch(e => dö(e.message));
