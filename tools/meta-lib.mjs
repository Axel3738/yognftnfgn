// meta-lib.mjs — gemensamt Meta Graph-lager för verktygen som laddar upp
// annonser i BEFINTLIGA kampanjer (tools/notion-till-marknad.mjs m.fl.).
// Utbrutet ur tools/notion-till-meta.mjs 2026-09-03 så att samma spärrar och
// samma rate limit-hantering går att importera i stället för att kopieras.
// notion-till-meta.mjs (SE-rutinen) är orörd — den har sina egna tester i drift.
//
// Noll beroenden (inbyggd fetch). Kräver env META_ACCESS_TOKEN.
//
// Regler som lagret bär (aldrig valfria):
//  • Allt skapas PAUSED. aktivera() slår bara på annonsen och det adset körningen
//    själv skapade — aldrig ett befintligt adset eller en kampanj.
//  • Ett adset klonas alltid ur ett syskon i samma kampanj. Saknar mallen
//    targeting avbryts det — aldrig en fallback-geo (en SE-fallback i ett NO-konto
//    hade visat annonserna i Sverige på NO-budget).
//  • Sida och Instagram-konto ärvs ur kampanjens befintliga annonser.

import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { spawnSync } from 'node:child_process';

export const API = `https://graph.facebook.com/${process.env.META_API_VERSION || 'v23.0'}`;
const TOKEN = process.env.META_ACCESS_TOKEN;

/** Utan agentproxyn slår Metas Graph-API i ett delat per-IP-tak nästan direkt
 *  ("User request limit reached"). Anropa FÖRST i varje CLI — funktionen startar
 *  om processen med NODE_USE_ENV_PROXY=1 och återvänder aldrig i så fall. */
export function säkerställProxy() {
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
    const r = spawnSync(process.execPath, process.argv.slice(1), {
      stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
    });
    process.exit(r.status ?? 1);
  }
}

const vänta = (ms) => new Promise(r => setTimeout(r, ms));
export const logg = (...a) => console.log(...a);

// Metas samlade "standard_enhancements"-flagga är pensionerad — varje enhancement
// stängs av för sig. Samma lista som pipeline/no-image-ads.mjs, som är facit för
// NO-kontot (alla NO-annonser har dessutom inline_comment OPT_IN).
const ENHANCEMENT_FEATURES = [
  'adapt_to_placement', 'add_text_overlay', 'ads_with_benefits', 'advantage_plus_creative',
  'app_highlights', 'audio', 'biz_ai', 'carousel_to_video', 'catalog_feed_tag',
  'creative_stickers', 'cv_transformation', 'description_automation', 'dha_optimization',
  'dynamic_partner_content', 'enable_ncs_testimonials', 'enhance_cta',
  'feed_caption_optimization', 'generate_cta', 'hide_price', 'ig_glados_feed',
  'ig_video_native_subtitle', 'image_animation', 'image_auto_crop', 'image_background_gen',
  'image_brightness_and_contrast', 'image_enhancement', 'image_templates',
  'image_text_translation', 'image_touchups', 'image_uncrop', 'local_store_extension',
  'media_liquidity_animated_image', 'media_order', 'media_type_automation',
  'multi_photo_to_video', 'pac_relaxation', 'product_browsing', 'product_extensions',
  'product_metadata_automation', 'profile_card', 'replace_media_text',
  'reveal_details_over_time', 'show_destination_blurbs', 'show_summary', 'site_extensions',
  'text_optimizations', 'text_translation', 'translate_voiceover', 'video_auto_crop',
  'video_filtering', 'video_highlight', 'video_highlights', 'video_to_image',
  'video_uncrop', 'wa_mm_image_filtering',
];

/** degrees_of_freedom_spec med alla enhancements OPT_OUT. inlineKommentar=true
 *  lägger till inline_comment OPT_IN (NO-kontots standard). */
export function ingaEnhancements({ inlineKommentar = false } = {}) {
  const spec = Object.fromEntries(ENHANCEMENT_FEATURES.map(f => [f, { enroll_status: 'OPT_OUT' }]));
  if (inlineKommentar) spec.inline_comment = { enroll_status: 'OPT_IN' };
  return { creative_features_spec: spec };
}

// ------------------------------------------------------------------ anrop

let senastAnrop = 0;
const FÖRDRÖJNING_MS = 2500;
// Kontots skrivbudget ("User request limit reached", kod 17) lyfter inte på
// sekunder: mätt 2026-09-03 i Magiborsten NO tog 4 annonser (+ 4 nya adset)
// hela budgeten, och 5+10+20+40+60 s räckte inte för en enda. Vänta i minuter.
const BACKOFF_MS = [30000, 60000, 120000, 240000, 300000, 300000, 300000, 300000];

/** Ett Graph-anrop. GET med params, eller POST med form (objekt eller FormData).
 *  Fast mellanrum + backoff på kod 17 / transienta fel — kontot ligger på
 *  "development access" med ett sekundbaserat tak. */
export async function api(sökväg, { method = 'GET', params = {}, form = null } = {}) {
  if (!TOKEN) throw new Error('META_ACCESS_TOKEN saknas i miljön.');
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
  for (let försök = 0; ; försök++) {
    const väntaTill = senastAnrop + FÖRDRÖJNING_MS;
    if (väntaTill > Date.now()) await vänta(väntaTill - Date.now());
    senastAnrop = Date.now();

    const res = await fetch(url, { method: form ? 'POST' : method, body });
    const json = await res.json().catch(() => ({}));
    if (res.ok && !json.error) return json;

    const e = json.error || {};
    const rateLimited = e.code === 17 || /user request limit reached/i.test(e.message || '');
    const transient = e.is_transient || e.code === 2 || res.status >= 500;
    if ((rateLimited || transient) && försök < BACKOFF_MS.length) {
      logg(`  ⏳ Meta ${rateLimited ? 'rate limit' : `fel ${e.code ?? res.status}`} (försök ${försök + 1}/${BACKOFF_MS.length}) — väntar ${BACKOFF_MS[försök] / 1000}s`);
      await vänta(BACKOFF_MS[försök]);
      continue;
    }
    throw new Error(`Meta ${res.status}: ${e.message || res.statusText}${e.error_user_msg ? ` — ${e.error_user_msg}` : ''}`);
  }
}

/** Alla sidor av ett edge-anrop. limit 100 — med nästlade fält (creative{…})
 *  svarar Meta "Please reduce the amount of data" på 200. */
export async function alla(sökväg, params = {}, limit = 100) {
  const ut = [];
  let svar = await api(sökväg, { params: { ...params, limit } });
  ut.push(...(svar.data || []));
  while (svar.paging?.next) {
    const väntaTill = senastAnrop + FÖRDRÖJNING_MS;
    if (väntaTill > Date.now()) await vänta(väntaTill - Date.now());
    senastAnrop = Date.now();
    const res = await fetch(svar.paging.next);
    svar = await res.json().catch(() => ({}));
    if (svar.error) {
      if (svar.error.code === 17) { await vänta(20000); continue; }
      throw new Error(`Meta paging: ${svar.error.message}`);
    }
    ut.push(...(svar.data || []));
  }
  return ut;
}

/** Lifetime-spend för ett objekt. 0 = har aldrig kommit igång.
 *  Fel = anta "har spenderat" (Infinity) — kan vi inte läsa spenden rör vi inget. */
export async function spend(id) {
  try {
    const r = await api(`${id}/insights`, { params: { date_preset: 'maximum', fields: 'spend' } });
    return Number(r.data?.[0]?.spend ?? 0);
  } catch {
    return Infinity;
  }
}

/** Kampanjens fyra utfall (samma som /notionkorning):
 *  ACTIVE · PAUSED utan spend · PAUSED med spend (= avvecklad) · saknas. */
export async function kampanjUtfall(kampanjId) {
  let k;
  try {
    k = await api(kampanjId, { params: { fields: 'id,name,status,effective_status,account_id,daily_budget' } });
  } catch (e) {
    return { utfall: 'SAKNAS', kampanj: null, fel: e.message };
  }
  if (k.status === 'ACTIVE') return { utfall: 'ACTIVE', kampanj: k, spend: null };
  const s = await spend(kampanjId);
  return { utfall: s > 0 ? 'AVVECKLAD' : 'PAUSAD_TOM', kampanj: k, spend: s };
}

// ------------------------------------------------------------- uppladdning

export async function laddaUppVideo(act, fil) {
  const form = new FormData();
  form.append('source', new Blob([readFileSync(fil)]), basename(fil));
  form.append('title', basename(fil));
  const r = await api(`act_${act}/advideos`, { form });
  if (!r.id) throw new Error('Metas advideos gav ingen video-id.');
  return r.id;
}

/** Metas thumbnail dyker upp först när videon processats. Vänta max ~2 min. */
export async function väntaPåThumb(videoId) {
  for (let i = 0; i < 24; i++) {
    const r = await api(videoId, { params: { fields: 'status,thumbnails' } });
    const t = (r.thumbnails?.data || []).find(x => x.is_preferred) || r.thumbnails?.data?.[0];
    if (t?.uri) return t.uri;
    if (r.status?.video_status === 'error') throw new Error('Meta kunde inte processa videon.');
    await vänta(5000);
  }
  throw new Error('Metas video-thumbnail kom aldrig — annonsen skapas inte utan den.');
}

export async function laddaUppBild(act, fil) {
  const r = await api(`act_${act}/adimages`, { form: { bytes: readFileSync(fil).toString('base64') } });
  const bild = Object.values(r.images || {})[0];
  if (!bild?.hash) throw new Error('Metas adimages gav ingen image_hash.');
  return bild.hash;
}

/** Sida och Instagram-konto ärvs från en befintlig creative i kampanjen.
 *  Hårdkodas ALDRIG — fel sida är fel verksamhet. */
export async function ärvSidaOchIg(kampanjId) {
  const annonser = await alla(`${kampanjId}/ads`, { fields: 'creative{object_story_spec,effective_object_story_id}' }, 50);
  for (const a of annonser) {
    const spec = a.creative?.object_story_spec;
    if (spec?.page_id) return { pageId: spec.page_id, igId: spec.instagram_actor_id || spec.instagram_user_id || null };
  }
  throw new Error(`Kunde inte läsa sida/Instagram ur någon befintlig annons i kampanj ${kampanjId}. Avbryter hellre än gissar.`);
}

// ---------------------------------------------------------------- adsets

/** Adsetet med EXAKT namnet, annars en klon av ett syskon. Syskonet väljs
 *  aktivt före pausat, nyast först. Klonen får inte egen budget (CBO) och
 *  föds PAUSED. Returnerar { adset, skapad }. */
export async function hittaEllerSkapaAdset({ kampanjId, act, namn, torr = false }) {
  const adsets = await alla(`${kampanjId}/adsets`, {
    fields: 'name,status,created_time,optimization_goal,billing_event,targeting,promoted_object,attribution_spec,destination_type,daily_budget,bid_strategy',
  }, 50);
  if (!adsets.length) throw new Error(`Kampanj ${kampanjId} har inga adsets att härma.`);

  const träff = adsets.find(a => a.name.trim().toLowerCase() === namn.trim().toLowerCase());
  if (träff) return { adset: träff, skapad: false };

  const ordnade = [...adsets].sort((a, b) =>
    (b.status === 'ACTIVE') - (a.status === 'ACTIVE') ||
    String(b.created_time || '').localeCompare(String(a.created_time || '')));
  const mall = ordnade[0];
  if (!mall.targeting) {
    throw new Error(`Syskonadsetet "${mall.name}" saknar targeting — vägrar klona (en fallback-geo hade kunnat visa annonserna i fel land).`);
  }
  if (mall.daily_budget && Number(mall.daily_budget) > 0) {
    throw new Error(`Syskonadsetet "${mall.name}" har egen budget (${mall.daily_budget}) — kampanjen är inte CBO. Bygg adsetet för hand.`);
  }
  logg(`  · Inget adset "${namn}" — klonar inställningar från "${mall.name}"`);
  if (torr) return { adset: { id: 'TORR-ADSET', name: namn, status: 'PAUSED' }, skapad: true, mall: mall.name };

  const kropp = {
    name: namn,
    campaign_id: kampanjId,
    status: 'PAUSED',
    billing_event: mall.billing_event || 'IMPRESSIONS',
    optimization_goal: mall.optimization_goal || 'OFFSITE_CONVERSIONS',
    targeting: JSON.stringify(mall.targeting),
  };
  if (mall.promoted_object) kropp.promoted_object = JSON.stringify(mall.promoted_object);
  if (mall.attribution_spec) kropp.attribution_spec = JSON.stringify(mall.attribution_spec);
  if (mall.destination_type) kropp.destination_type = mall.destination_type;
  if (mall.bid_strategy) kropp.bid_strategy = mall.bid_strategy;

  const r = await api(`act_${act}/adsets`, { form: kropp });
  return { adset: { id: r.id, name: namn, status: 'PAUSED' }, skapad: true, mall: mall.name };
}

// --------------------------------------------------------------- annonser

/** Skapar creative + annons (PAUSED). spec = object_story_spec. */
export async function skapaAnnons({ act, adsetId, namn, spec, enhancements, dsa = null }) {
  const form = {
    name: namn,
    object_story_spec: JSON.stringify(spec),
    degrees_of_freedom_spec: JSON.stringify(enhancements),
  };
  const creative = await api(`act_${act}/adcreatives`, { form });
  const annonsForm = {
    name: namn, adset_id: adsetId,
    creative: JSON.stringify({ creative_id: creative.id }),
    status: 'PAUSED',
  };
  // EU-konton (DK/FI …) kräver DSA-fälten; NO gör det inte.
  if (dsa?.beneficiary) annonsForm.dsa_beneficiary = dsa.beneficiary;
  if (dsa?.payor) annonsForm.dsa_payor = dsa.payor;
  const annons = await api(`act_${act}/ads`, { form: annonsForm });
  return { creativeId: creative.id, annonsId: annons.id };
}

/** Slår på annonsen och — bara om körningen själv skapade det — adsetet.
 *  Befintliga adsets och kampanjer rörs aldrig. Läser tillbaka statusen. */
export async function aktivera({ annonsId, adset, skapad }) {
  const ändringar = [];
  if (skapad) {
    await api(adset.id, { form: { status: 'ACTIVE' } });
    ändringar.push(`adset ${adset.name}: PAUSED → ACTIVE (nyskapat av körningen)`);
  } else if (adset.status && adset.status !== 'ACTIVE') {
    logg(`  ⚠ Adset "${adset.name}" är ${adset.status} och skapades inte av körningen — RÖRS INTE.`);
  }
  await api(annonsId, { form: { status: 'ACTIVE' } });
  ändringar.push(`annons ${annonsId}: PAUSED → ACTIVE`);
  const efter = await api(annonsId, { params: { fields: 'name,status,effective_status,adset_id' } });
  return { efter, ändringar };
}
