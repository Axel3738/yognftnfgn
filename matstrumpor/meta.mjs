// meta.mjs — avläsningen av "nya kungen" (730973156224390) via META_ACCESS_TOKEN.
//
// LÄSER BARA. Inte en enda POST. Ronden /matstrumporkungen skalar aldrig (Axels
// beslut 2026-09-21), så det här lagret har inga skrivfunktioner alls — det som
// inte finns kan inte köras av misstag.
//
// Varför filen finns: token:en nekades på kontot till och med 2026-09-21
// ("(#200) Ad account owner has NOT granted ads_management"), så ronden läste
// Meta genom Adsmanager-MCP:n — och en schemalagd rutin har inga mcp__*-verktyg.
// 2026-09-22 gav Axel användaren "API LONG TERM" åtkomst till kontot, mätt med
// `GET act_730973156224390?fields=name` → {"name":"nya kungen"}. Sedan dess går
// avläsningen här, via REST, och ronden kan gå som rutin.
//
// Två fönster per annons, precis som kommandofilen kräver:
//   • 14 dagar (last_14d)         — domarna och vinstbidraget
//   • annonsens EGNA första vecka — etiketten (etikett.mjs: aldrig last_7d)
// Plus kampanjens spend i samma fönster och budgethistoriken ur kontots
// aktivitetslogg (activities → update_campaign_budget), så etiketten kan se om
// budgeten höjdes under annonsens första vecka.
//
// Attribution 7d_click, som i kommandofilen. Metas date presets och time_range
// utesluter innevarande dag — "i dag" finns aldrig i siffrorna.
//
// ⛔ VIDEOMÅTTEN LÄSES ALLTID UR `value`, ALDRIG UR `7d_click` (rättat
// 2026-10-01). Med action_attribution_windows satt skickar Meta nyckeln
// `7d_click` även på video_play_actions — ett attribuerat tal, inte antalet
// videostarter. Mätt samma kväll på Nathalie (last_14d): 4 594 under 7d_click
// mot 621 588 i value, och 308 826 tresekundersvisningar. Därför stod hennes
// hook rate som 0,2 % och 012v2:s hold rate som 450 % i lardomar.md.
// Definitionerna följer Evolve (docs/os/evolve/ITERATIONS-PLAYBOOK.md):
//   hook_rate      = tresekundersvisningar (actions: video_view) / visningar
//   hold_rate      = ThruPlay / visningar
//   hook_till_hold = ThruPlay / tresekundersvisningar
//
// Startdagen (D0) är max(annonsens created_time, kampanjens första dag med
// spend) sedan 2026-10-01. En annons som skapas PAUSED i en kampanj som inte
// gått än (utlandets 14 kampanjer: byggda 27–30/9, start 2/10) fick annars
// nolldagar i sin första vecka och blev en falsk INGEN_LEVERANS.
//
// Rena funktioner (varde, vardeUtanFonster, tolkaRad, fonster, startdag,
// summeraDagar, budgetHistorik, budgetVid, byggJobbfil) är testade utan nät.
// hamtaAvlasning() gör anropen via tools/meta-lib.mjs (rate limit-backoff,
// timeout) och tar en injicerbar klient.

import { api, alla } from '../tools/meta-lib.mjs';

export const FONSTER_DAGAR = 7;
export const ATTRIBUTION = ['7d_click'];
export const INSIGHTS_FALT = 'ad_id,ad_name,spend,impressions,cpm,inline_link_clicks,inline_link_click_ctr,actions,purchase_roas,cost_per_action_type,video_play_actions,video_thruplay_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p100_watched_actions,video_avg_time_watched_actions';
export const KAMPANJ_FALT = 'spend,actions,purchase_roas';
/** Veckorna 2 och 3 läses bara för annonser vars D0 ligger inom så här många
 *  dagar — äldre etiketter är avgjorda, och varje fönster kostar ett anrop. */
export const OMPROVNING_DAGAR = 35;

/** Svenskt datum i dag (YYYY-MM-DD, Europe/Stockholm). Rutinen går 07:00
 *  svensk tid — UTC-datumet råkar vara detsamma då, men bara råkar. */
export function idagSE(nu = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(nu);
}

/** YYYY-MM-DD + n dagar. Ren. */
export function plusDagar(datum, n) {
  const t = Date.parse(`${datum}T00:00:00Z`);
  if (!Number.isFinite(t)) throw new Error(`Datumet "${datum}" går inte att läsa — skriv YYYY-MM-DD.`);
  return new Date(t + n * 86400000).toISOString().slice(0, 10);
}

/** Värdet för en action_type i en av Metas listor (actions, purchase_roas,
 *  cost_per_action_type …). Med action_attribution_windows satt ligger
 *  fönstrets tal under nyckeln "7d_click"; saknas den (videomått) gäller value.
 *  Saknas typen helt: null — aldrig 0, en nolla ser ut som en mätning. */
export function varde(lista, typ, fonster = ATTRIBUTION[0]) {
  const rad = (Array.isArray(lista) ? lista : []).find((x) => x?.action_type === typ);
  if (!rad) return null;
  const v = rad[fonster] ?? rad.value;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Värdet UTAN attributionsfönster — `value`, aldrig `7d_click`. För allt som
 *  räknar visningar av videon (hook, hold, kvartilerna): de är händelser på
 *  annonsen, inte konverteringar, och 7d_click-talet är något annat (mätt
 *  2026-10-01, se huvudet). */
export function vardeUtanFonster(lista, typ = 'video_view') {
  const rad = (Array.isArray(lista) ? lista : []).find((x) => x?.action_type === typ);
  if (!rad) return null;
  const n = Number(rad.value);
  return Number.isFinite(n) ? n : null;
}

/** En insights-rad (ad-nivå eller kampanjnivå) → våra fältnamn. Ren.
 *  Hook och hold enligt Evolve: per VISNING, så talen går att jämföra med
 *  kursens riktmärken (hook under ~25 % och hold under ~5 % är lågt). */
export function tolkaRad(rad = {}) {
  const spend = num(rad.spend);
  const kop = varde(rad.actions, 'omni_purchase') ?? 0;
  const roas = varde(rad.purchase_roas, 'omni_purchase');
  const impressions = num(rad.impressions);
  const klick = num(rad.inline_link_clicks);
  const lpv = varde(rad.actions, 'omni_landing_page_view') ?? varde(rad.actions, 'landing_page_view');
  const videostarter = vardeUtanFonster(rad.video_play_actions);
  const visningar3s = vardeUtanFonster(rad.actions, 'video_view');
  const thruplay = vardeUtanFonster(rad.video_thruplay_watched_actions);
  const kvartil = (f) => vardeUtanFonster(rad[f]);
  const snitt = vardeUtanFonster(rad.video_avg_time_watched_actions);
  return {
    spend_sek: r2(spend),
    kop,
    roas: roas === null ? null : r3(roas),
    cpa_sek: kop > 0 ? r2(spend / kop) : null,
    impressions: impressions ?? null,
    cpm_sek: num(rad.cpm) === null ? (spend !== null && impressions ? r2((spend / impressions) * 1000) : null) : r2(num(rad.cpm)),
    klick: klick ?? null,
    ctr_lank: num(rad.inline_link_click_ctr) === null ? (klick !== null && impressions ? r3((klick / impressions) * 100) : null) : r3(num(rad.inline_link_click_ctr)),
    lpv,
    konv_lpv: lpv && kop >= 0 ? r3(kop / lpv) : null,
    videostarter,
    visningar_3s: visningar3s,
    thruplay,
    p25: kvartil('video_p25_watched_actions'),
    p50: kvartil('video_p50_watched_actions'),
    p75: kvartil('video_p75_watched_actions'),
    p100: kvartil('video_p100_watched_actions'),
    snitt_speltid_s: snitt,
    hook_rate: visningar3s !== null && impressions ? r3(visningar3s / impressions) : null,
    hold_rate: thruplay !== null && impressions ? r3(thruplay / impressions) : null,
    hook_till_hold: thruplay !== null && visningar3s ? r3(thruplay / visningar3s) : null,
  };
}

/** Kampanjens första dag med spend ur en dagserie (time_increment=1).
 *  null = kampanjen har aldrig spenderat. Ren. */
export function startdag(dagserie) {
  const dagar = (dagserie ?? []).filter((d) => (num(d.spend) ?? 0) > 0).map((d) => String(d.date_start)).sort();
  return dagar[0] ?? null;
}

/** Kampanjens tal i ett fönster ur dagserien: spend, köp och ROAS (spendvägd).
 *  Ren. Används för veckan FÖRE annonsen (W0) och veckorna 2–3 — så de inte
 *  kostar egna anrop. */
export function summeraDagar(dagserie, since, until) {
  let spend = 0, varde_ = 0, kop = 0, medRoas = 0;
  for (const d of dagserie ?? []) {
    const dag = String(d.date_start);
    if (dag < since || dag > until) continue;
    const s = num(d.spend) ?? 0;
    spend += s;
    kop += varde(d.actions, 'omni_purchase') ?? 0;
    const r = varde(d.purchase_roas, 'omni_purchase');
    if (r !== null) { varde_ += r * s; medRoas += s; }
  }
  return { since, until, spend_sek: r2(spend), kop, roas: medRoas > 0 ? r3(varde_ / medRoas) : null };
}

/** Vecka n (1, 2, 3 …) räknat från D0. Ren. */
export function veckaFonster(d0, idag, vecka) {
  return fonster(plusDagar(d0, FONSTER_DAGAR * (vecka - 1)), idag);
}

/** Annonsens startdag: max(created, kampanjens första spenddag). Ren.
 *  kampanjStart === undefined ⇒ okänd (äldre jobbfiler) ⇒ created_time gäller.
 *  kampanjStart === null ⇒ kampanjen har inte spenderat ⇒ ingen startdag än. */
export function annonsD0(createdTime, kampanjStart) {
  const skapad = String(createdTime ?? '').slice(0, 10) || null;
  if (kampanjStart === undefined) return skapad;
  if (kampanjStart === null) return null;
  if (!skapad) return kampanjStart;
  return skapad > kampanjStart ? skapad : kampanjStart;
}

/** Annonsens egna första vecka [D0, D0+6], kapad vid gårdagen (Meta har inga
 *  siffror för i dag). komplett=false ⇒ veckan är inte slut, ingen etikett. */
export function fonster(d0, idag, dagar = FONSTER_DAGAR) {
  const slut = plusDagar(d0, dagar - 1);
  const igar = plusDagar(idag, -1);
  const until = slut <= igar ? slut : igar;
  return { since: d0, until, komplett: slut <= igar, dagar_med_data: Math.max(0, Math.round((Date.parse(`${until}T00:00:00Z`) - Date.parse(`${d0}T00:00:00Z`)) / 86400000) + 1) };
}

/** Kampanjens budgetändringar ur kontots aktivitetslogg, äldst först.
 *  Meta skriver beloppen i öre (100000 = 1 000 kr). Ren. */
export function budgetHistorik(activities, kampanjId) {
  return (activities ?? [])
    .filter((a) => String(a?.object_id) === String(kampanjId) && a?.event_type === 'update_campaign_budget')
    .map((a) => {
      let x = a.extra_data;
      if (typeof x === 'string') { try { x = JSON.parse(x); } catch { x = null; } }
      const fran = Number(x?.old_value?.old_value);
      const till = Number(x?.new_value?.new_value);
      return { tid: a.event_time, fran_sek: fran / 100, till_sek: till / 100 };
    })
    .filter((h) => Number.isFinite(h.fran_sek) && Number.isFinite(h.till_sek))
    .sort((a, b) => Date.parse(a.tid) - Date.parse(b.tid));
}

/** Dagsbudgeten i kronor vid slutet av dagen `datum`: senaste ändringen före
 *  dess; före första kända ändringen gällde dess gamla värde; utan historik
 *  gäller den nuvarande. Dygnsgränsen räknas i UTC — händelsen i loggen bär
 *  +0000 — så en ändring 22:30 svensk tid hamnar på rätt dag ändå. Ren. */
export function budgetVid(historik, datum, nuvarandeSek = null) {
  const t = Date.parse(`${datum}T23:59:59Z`);
  const fore = (historik ?? []).filter((h) => Date.parse(h.tid) <= t);
  if (fore.length) return fore[fore.length - 1].till_sek;
  if (historik?.length) return historik[0].fran_sek;
  return nuvarandeSek;
}

/** Jobbfilen `--dom` läser: siffrorna ORDAGRANT ur Meta, aldrig räknade i
 *  huvudet. Ren — tar de råa svaren och bygger strukturen. */
export function byggJobbfil({ idag, konto, kampanj, annonser, insikter14, kampanj14, perFonster, perVecka = {}, dagserie = null, kampanjStart, marknad = 'SE', historik, hamtat = new Date().toISOString() }) {
  const dagsbudget = kampanj?.daily_budget ? Number(kampanj.daily_budget) / 100 : null;
  const k14 = tolkaRad(kampanj14 ?? {});
  const via = new Map((insikter14 ?? []).map((r) => [String(r.ad_id), r]));
  const rader = (annonser ?? []).map((a) => {
    const d0 = annonsD0(a.created_time, kampanjStart);
    const f = d0 ? perFonster?.[d0] ?? null : null;
    const egen = f?.annonser?.get?.(String(a.id)) ?? f?.annonser?.[String(a.id)] ?? null;
    const kamp = f?.kampanj ? tolkaRad(f.kampanj) : { spend_sek: 0, roas: null, kop: 0 };
    // W0 = kampanjens vecka FÖRE annonsen. Breakthrough enligt Evolve: kampanjens
    // spend växte vecka för vecka på grund av annonsen (etikett.mjs).
    const w0 = d0 && dagserie ? summeraDagar(dagserie, plusDagar(d0, -FONSTER_DAGAR), plusDagar(d0, -1)) : null;
    const andringar = d0 ? (historik ?? []).filter((h) => { const dag = String(h.tid).slice(0, 10); return dag >= d0 && dag <= plusDagar(d0, FONSTER_DAGAR - 1); }) : [];
    const fv = f ? {
      since: f.since, until: f.until, komplett: f.komplett, dagar_med_data: f.dagar_med_data,
      ...tolkaRad(egen ?? {}),
      // Ett HELT fönster lästes men annonsen har ingen rad ⇒ Meta visade den inte: 0 kr,
      // inte "saknas" (Meta utelämnar rader utan visningar). Före 2026-10-01 blev
      // det INGEN_DATA i stället för INGEN_LEVERANS.
      ...(egen || !f.komplett ? {} : { spend_sek: 0, kop: 0, ingen_rad: true }),
      kampanj_spend_sek: kamp.spend_sek,
      kampanj_roas: kamp.roas,
      kampanj_kop: kamp.kop,
      kampanj_spend_w0_sek: w0 ? w0.spend_sek : null,
      budget_d0: budgetVid(historik, d0, dagsbudget),
      budget_d7: budgetVid(historik, plusDagar(d0, FONSTER_DAGAR - 1), dagsbudget),
      budgetandringar: andringar,
    } : { komplett: false, dagar_med_data: 0, skal: d0 === null ? 'kampanjen har inte spenderat en krona än — veckan har inte börjat' : `D0 ${d0} — Meta har inga siffror för veckan än (i dag finns aldrig)` };
    // Veckorna 2 och 3 (Evolve: en etikett kan uppgraderas vecka 2–3).
    const veckor = {};
    for (const n of [2, 3]) {
      const v = d0 ? perVecka[`${d0}|${n}`] : null;
      if (!v) continue;
      const egenV = v.annonser?.get?.(String(a.id)) ?? v.annonser?.[String(a.id)] ?? null;
      const kampV = dagserie ? summeraDagar(dagserie, v.since, v.until) : (v.kampanj ? tolkaRad(v.kampanj) : { spend_sek: null, roas: null, kop: null });
      veckor[n] = {
        since: v.since, until: v.until, komplett: v.komplett,
        ...tolkaRad(egenV ?? {}),
        ...(egenV || !v.komplett ? {} : { spend_sek: 0, kop: 0, ingen_rad: true }),
        kampanj_spend_sek: kampV.spend_sek,
        kampanj_roas: kampV.roas,
        kampanj_spend_w0_sek: w0 ? w0.spend_sek : null,
        budget_d0: budgetVid(historik, d0, dagsbudget),
        budget_d7: budgetVid(historik, v.until, dagsbudget),
      };
    }
    return {
      id: String(a.id),
      namn: a.name,
      marknad,
      adset: a.adset?.name ?? null,
      adset_id: a.adset?.id ?? null,
      status: a.status ?? null,
      effective_status: a.effective_status ?? null,
      skapad: String(a.created_time ?? '').slice(0, 10) || null,
      d0,
      fonster: 'last_14d',
      ...tolkaRad(via.get(String(a.id)) ?? {}),
      forsta_vecka: fv,
      veckor,
    };
  });
  const sedan14 = plusDagar(idag, -14);
  return {
    datum: idag,
    hamtat,
    marknad,
    kampanj_start: kampanjStart === undefined ? 'okänd (created_time gäller)' : kampanjStart,
    kalla: `META_ACCESS_TOKEN via Graph API, level=ad, action_attribution_windows ${ATTRIBUTION.join(',')}. Domarna på last_14d, etiketten på annonsens egna första vecka [D0, D0+6] där D0 = max(created_time, kampanjens första spenddag), omprövning vecka 2 och 3. Budgethistoriken ur act/activities (update_campaign_budget), kampanjens dagserie (time_increment=1) för veckan före annonsen. Videomåtten ur value, aldrig 7d_click: hook_rate = actions:video_view (3 s) / impressions, hold_rate = video_thruplay_watched_actions / impressions, hook_till_hold = thruplay / 3 s-visningar, konv_lpv = omni_purchase / omni_landing_page_view.`,
    konto,
    kampanj: {
      id: String(kampanj?.id ?? ''),
      namn: kampanj?.name ?? null,
      status: kampanj?.status ?? null,
      effective_status: kampanj?.effective_status ?? null,
      dagsbudget_sek: dagsbudget,
      fonster: 'last_14d',
      spend_sek: k14.spend_sek,
      kop: k14.kop,
      roas: k14.roas,
      budget_d0: budgetVid(historik, sedan14, dagsbudget),
      budget_d7: dagsbudget,
    },
    budgethistorik: historik ?? [],
    annonser: rader,
  };
}

/**
 * Hela avläsningen. klient = { api, alla } (tools/meta-lib.mjs som standard —
 * fast mellanrum, backoff på kod 17, timeout så tystnad blir ett fel).
 * Anropen, i ordning: kampanjen · annonserna · last_14d per annons · last_14d
 * för kampanjen · per distinkt D0: fönstret på ad-nivå + kampanjnivå ·
 * aktivitetsloggen. Annonser laddas upp i batcher, så antalet distinkta D0 är
 * litet (fem på 96 annonser 2026-09-22).
 */
export async function hamtaAvlasning(konfig, { idag = idagSE(), klient = { api, alla }, logg = (s) => console.error(s), kampanjKalla = null } = {}) {
  const konto = String(konfig.meta.ad_account_id);
  const mal = kampanjKalla ?? { id: konfig.meta.kampanj.id, namn: konfig.meta.kampanj.namn, marknad: 'SE' };
  const kampanjId = String(mal.id);
  if (konto !== '730973156224390') throw new Error(`ad_account_id ${konto} är inte "nya kungen" 730973156224390 — vägrar läsa ett annat konto ur Matstrumpors konfig.`);

  const kampanj = await klient.api(kampanjId, { params: { fields: 'id,name,status,effective_status,daily_budget,lifetime_budget,created_time,account_id' } });
  if (String(kampanj.name ?? '') !== String(mal.namn)) {
    throw new Error(`Kampanj ${kampanjId} heter "${kampanj.name}" i kontot, källan säger "${mal.namn}" — stämmer inte, avbryter.`);
  }
  if (kampanj.account_id && String(kampanj.account_id) !== konto) throw new Error(`Kampanj ${kampanjId} ligger i konto ${kampanj.account_id}, inte ${konto} — avbryter.`);
  logg(`  · [${mal.marknad}] kampanj ${kampanj.name}: ${kampanj.effective_status}, ${Number(kampanj.daily_budget) / 100} kr/dag`);

  const annonser = await klient.alla(`${kampanjId}/ads`, { fields: 'id,name,created_time,status,effective_status,adset{id,name}' }, 200);
  logg(`  · ${annonser.length} annonser i kampanjen`);

  const insikter14 = await klient.alla(`${kampanjId}/insights`, { level: 'ad', date_preset: 'last_14d', action_attribution_windows: ATTRIBUTION, fields: INSIGHTS_FALT }, 500);
  const k14 = await klient.api(`${kampanjId}/insights`, { params: { date_preset: 'last_14d', action_attribution_windows: ATTRIBUTION, fields: KAMPANJ_FALT } });
  const kampanj14 = k14?.data?.[0] ?? {};
  logg(`  · last_14d: ${insikter14.length} annonser med data, kampanjen ${kampanj14.spend ?? 0} kr`);

  // Kampanjens dagserie från skapandet till i går: startdagen (första spend),
  // veckan före varje annons (W0) och kampanjens tal för veckorna 2–3.
  const igar = plusDagar(idag, -1);
  const skapadK = String(kampanj.created_time ?? '').slice(0, 10) || plusDagar(idag, -90);
  let dagserie = [];
  if (skapadK <= igar) {
    dagserie = await klient.alla(`${kampanjId}/insights`, { time_range: { since: skapadK, until: igar }, time_increment: 1, action_attribution_windows: ATTRIBUTION, fields: KAMPANJ_FALT }, 100);
  }
  const kampanjStart = startdag(dagserie);
  logg(`  · kampanjens första spenddag: ${kampanjStart ?? 'INGEN — kampanjen har inte spenderat, inga annonser får etikett än'} (${dagserie.length} dagar i serien)`);

  const d0s = [...new Set(annonser.map((a) => annonsD0(a.created_time, kampanjStart)).filter(Boolean))].sort();
  const perFonster = {};
  const perVecka = {};
  for (const d0 of d0s) {
    // En annons som startade i dag har inget fönster: Meta har inga siffror för
    // i dag, och [D0, i går] svarar "(#100) since must be less than or equal to
    // until" (mätt 2026-10-01 på Gilz uppladdning samma morgon).
    if (d0 > igar) { logg(`  · D0 ${d0}: startade i dag — läses i morgon`); continue; }
    const f = fonster(d0, idag);
    const rader = await klient.alla(`${kampanjId}/insights`, { level: 'ad', time_range: { since: f.since, until: f.until }, action_attribution_windows: ATTRIBUTION, fields: INSIGHTS_FALT }, 500);
    const kamp = await klient.api(`${kampanjId}/insights`, { params: { time_range: { since: f.since, until: f.until }, action_attribution_windows: ATTRIBUTION, fields: KAMPANJ_FALT } });
    perFonster[d0] = { ...f, annonser: new Map(rader.map((r) => [String(r.ad_id), r])), kampanj: kamp?.data?.[0] ?? null };
    logg(`  · D0 ${d0}: fönster ${f.since}..${f.until}${f.komplett ? '' : ' (INTE komplett — ingen etikett än)'}, ${rader.length} annonser med data`);
    // Omprövningen vecka 2 och 3 — bara för unga grupper, och bara veckor som börjat.
    if (dagarMellanIso(d0, idag) > OMPROVNING_DAGAR) continue;
    for (const n of [2, 3]) {
      const v = veckaFonster(d0, idag, n);
      if (v.since > igar) continue;
      const vr = await klient.alla(`${kampanjId}/insights`, { level: 'ad', time_range: { since: v.since, until: v.until }, action_attribution_windows: ATTRIBUTION, fields: INSIGHTS_FALT }, 500);
      perVecka[`${d0}|${n}`] = { ...v, annonser: new Map(vr.map((r) => [String(r.ad_id), r])) };
      logg(`    vecka ${n}: ${v.since}..${v.until}${v.komplett ? '' : ' (pågår)'}, ${vr.length} annonser med data`);
    }
  }

  let historik = [];
  // Ingen annons med startdag (kampanjen har inte spenderat) ⇒ inget att
  // etikettera och ingen budget att jämföra — aktivitetsloggen läses inte.
  // Sparar ett tungt anrop per utlandskampanj före start (14 st 2026-10-01).
  if (!d0s.length) return byggJobbfil({ idag, konto, kampanj, annonser, insikter14, kampanj14, perFonster, perVecka, dagserie, kampanjStart, marknad: mal.marknad, historik });
  try {
    // 50 per sida, inte 200: med 200 svarade Meta "Please reduce the amount of
    // data you're asking for" på sidan efter den första (mätt 2026-09-23,
    // 5 min backoff för ingenting). extra_data är tungt.
    const activities = await klient.alla(`act_${konto}/activities`, { fields: 'event_type,event_time,object_id,object_name,extra_data', since: plusDagar(d0s[0] ?? idag, -1), until: idag }, 50);
    historik = budgetHistorik(activities, kampanjId);
    logg(`  · budgethistorik: ${historik.length} ändringar på kampanjen`);
  } catch (e) {
    logg(`  ⚠️ aktivitetsloggen gick inte att läsa (${e.message}) — budget_d0/budget_d7 blir nuvarande budget, etiketten kan då inte se en höjning`);
  }

  return byggJobbfil({ idag, konto, kampanj, annonser, insikter14, kampanj14, perFonster, perVecka, dagserie, kampanjStart, marknad: mal.marknad, historik });
}

/** Utlandets kampanjer i kontot, ur annonser/lage.json (skrivet av bygg.mjs
 *  efter tillbakaläsning). Bara kampanjer med minst en annons. Ren. */
export function utlandskampanjer(lage) {
  return (lage?.kampanjer ?? [])
    .filter((k) => k?.kampanj?.id && k?.kampanj?.name && (k.annonser ?? []).length > 0)
    .map((k) => ({ id: String(k.kampanj.id), namn: k.kampanj.name, marknad: String(k.kod) }));
}

function dagarMellanIso(a, b) {
  return Math.floor((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

/** Kort sammanfattning för terminalen. Ren. */
export function sammanfattning(jobb) {
  const a = jobb.annonser ?? [];
  const medSpend = a.filter((x) => (x.spend_sek ?? 0) > 0).length;
  const unga = a.filter((x) => x.forsta_vecka && !x.forsta_vecka.komplett).length;
  return [
    `Avläst ${jobb.datum} — konto ${jobb.konto}, [${jobb.marknad ?? 'SE'}] kampanj ${jobb.kampanj.namn} (${jobb.kampanj.effective_status}, ${jobb.kampanj.dagsbudget_sek} kr/dag), första spenddag ${jobb.kampanj_start === null ? 'ingen än (kampanjen har inte startat)' : jobb.kampanj_start ?? 'okänd'}`,
    `  last_14d: ${jobb.kampanj.spend_sek} kr · ${jobb.kampanj.kop} köp · ROAS ${jobb.kampanj.roas ?? 'okänd'}`,
    `  ${a.length} annonser, ${medSpend} med spend de senaste 14 dagarna, ${unga} vars första vecka inte är slut (ingen etikett än)`,
    `  budgethistorik: ${jobb.budgethistorik.length} ändringar${jobb.budgethistorik.length ? ' — ' + jobb.budgethistorik.map((h) => `${h.tid.slice(0, 10)} ${h.fran_sek}→${h.till_sek}`).join(', ') : ''}`,
  ].join('\n');
}

const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
const r2 = (v) => (v === null || v === undefined ? null : Math.round(v * 100) / 100);
const r3 = (v) => (v === null || v === undefined ? null : Math.round(v * 1000) / 1000);
