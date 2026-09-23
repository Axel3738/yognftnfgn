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
// Rena funktioner (varde, tolkaRad, fonster, budgetHistorik, budgetVid,
// byggJobbfil) är testade utan nät. hamtaAvlasning() gör anropen via
// tools/meta-lib.mjs (rate limit-backoff, timeout) och tar en injicerbar klient.

import { api, alla } from '../tools/meta-lib.mjs';

export const FONSTER_DAGAR = 7;
export const ATTRIBUTION = ['7d_click'];
export const INSIGHTS_FALT = 'ad_id,ad_name,spend,impressions,inline_link_clicks,actions,purchase_roas,cost_per_action_type,video_play_actions,video_thruplay_watched_actions';
export const KAMPANJ_FALT = 'spend,actions,purchase_roas';

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

/** En insights-rad (ad-nivå eller kampanjnivå) → våra fältnamn. Ren.
 *  hook_rate = videostarter / visningar, hold_rate = thruplay / videostarter —
 *  samma två tal ronden alltid skrivit i lärdomarna, namngivna så att ingen
 *  läser dem som något annat. */
export function tolkaRad(rad = {}) {
  const spend = num(rad.spend);
  const kop = varde(rad.actions, 'omni_purchase') ?? 0;
  const roas = varde(rad.purchase_roas, 'omni_purchase');
  const impressions = num(rad.impressions);
  const klick = num(rad.inline_link_clicks);
  const lpv = varde(rad.actions, 'omni_landing_page_view') ?? varde(rad.actions, 'landing_page_view');
  const videostarter = varde(rad.video_play_actions, 'video_view');
  const thruplay = varde(rad.video_thruplay_watched_actions, 'video_view');
  return {
    spend_sek: r2(spend),
    kop,
    roas: roas === null ? null : r3(roas),
    cpa_sek: kop > 0 ? r2(spend / kop) : null,
    impressions: impressions ?? null,
    klick: klick ?? null,
    lpv,
    konv_lpv: lpv && kop >= 0 ? r3(kop / lpv) : null,
    videostarter,
    thruplay,
    hook_rate: videostarter !== null && impressions ? r3(videostarter / impressions) : null,
    hold_rate: thruplay !== null && videostarter ? r3(thruplay / videostarter) : null,
  };
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
export function byggJobbfil({ idag, konto, kampanj, annonser, insikter14, kampanj14, perFonster, historik, hamtat = new Date().toISOString() }) {
  const dagsbudget = kampanj?.daily_budget ? Number(kampanj.daily_budget) / 100 : null;
  const k14 = tolkaRad(kampanj14 ?? {});
  const via = new Map((insikter14 ?? []).map((r) => [String(r.ad_id), r]));
  const rader = (annonser ?? []).map((a) => {
    const d0 = String(a.created_time ?? '').slice(0, 10);
    const f = perFonster?.[d0] ?? null;
    const egen = f?.annonser?.get?.(String(a.id)) ?? f?.annonser?.[String(a.id)] ?? null;
    const kamp = f?.kampanj ? tolkaRad(f.kampanj) : { spend_sek: 0, roas: null, kop: 0 };
    const fv = f ? {
      since: f.since, until: f.until, komplett: f.komplett, dagar_med_data: f.dagar_med_data,
      ...tolkaRad(egen ?? {}),
      kampanj_spend_sek: kamp.spend_sek,
      kampanj_roas: kamp.roas,
      kampanj_kop: kamp.kop,
      budget_d0: budgetVid(historik, d0, dagsbudget),
      budget_d7: budgetVid(historik, plusDagar(d0, FONSTER_DAGAR - 1), dagsbudget),
    } : null;
    return {
      id: String(a.id),
      namn: a.name,
      adset: a.adset?.name ?? null,
      adset_id: a.adset?.id ?? null,
      status: a.status ?? null,
      effective_status: a.effective_status ?? null,
      d0,
      fonster: 'last_14d',
      ...tolkaRad(via.get(String(a.id)) ?? {}),
      forsta_vecka: fv,
    };
  });
  const sedan14 = plusDagar(idag, -14);
  return {
    datum: idag,
    hamtat,
    kalla: `META_ACCESS_TOKEN via Graph API, level=ad, action_attribution_windows ${ATTRIBUTION.join(',')}. Domarna på last_14d, etiketten på annonsens egna första vecka [D0, D0+6]. Budgethistoriken ur act/activities (update_campaign_budget). hook_rate = video_play_actions / impressions, hold_rate = video_thruplay_watched_actions / video_play_actions, konv_lpv = omni_purchase / omni_landing_page_view.`,
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
export async function hamtaAvlasning(konfig, { idag = idagSE(), klient = { api, alla }, logg = (s) => console.error(s) } = {}) {
  const konto = String(konfig.meta.ad_account_id);
  const kampanjId = String(konfig.meta.kampanj.id);
  if (konto !== '730973156224390') throw new Error(`ad_account_id ${konto} är inte "nya kungen" 730973156224390 — vägrar läsa ett annat konto ur Matstrumpors konfig.`);

  const kampanj = await klient.api(kampanjId, { params: { fields: 'id,name,status,effective_status,daily_budget,lifetime_budget,created_time' } });
  if (String(kampanj.name ?? '') !== String(konfig.meta.kampanj.namn)) {
    throw new Error(`Kampanj ${kampanjId} heter "${kampanj.name}" i kontot, konfigen säger "${konfig.meta.kampanj.namn}" — stämmer inte, avbryter.`);
  }
  logg(`  · kampanj ${kampanj.name}: ${kampanj.effective_status}, ${Number(kampanj.daily_budget) / 100} kr/dag`);

  const annonser = await klient.alla(`${kampanjId}/ads`, { fields: 'id,name,created_time,status,effective_status,adset{id,name}' }, 200);
  logg(`  · ${annonser.length} annonser i kampanjen`);

  const insikter14 = await klient.alla(`${kampanjId}/insights`, { level: 'ad', date_preset: 'last_14d', action_attribution_windows: ATTRIBUTION, fields: INSIGHTS_FALT }, 500);
  const k14 = await klient.api(`${kampanjId}/insights`, { params: { date_preset: 'last_14d', action_attribution_windows: ATTRIBUTION, fields: KAMPANJ_FALT } });
  const kampanj14 = k14?.data?.[0] ?? {};
  logg(`  · last_14d: ${insikter14.length} annonser med data, kampanjen ${kampanj14.spend ?? 0} kr`);

  const d0s = [...new Set(annonser.map((a) => String(a.created_time ?? '').slice(0, 10)).filter(Boolean))].sort();
  const perFonster = {};
  for (const d0 of d0s) {
    const f = fonster(d0, idag);
    const rader = await klient.alla(`${kampanjId}/insights`, { level: 'ad', time_range: { since: f.since, until: f.until }, action_attribution_windows: ATTRIBUTION, fields: INSIGHTS_FALT }, 500);
    const kamp = await klient.api(`${kampanjId}/insights`, { params: { time_range: { since: f.since, until: f.until }, action_attribution_windows: ATTRIBUTION, fields: KAMPANJ_FALT } });
    perFonster[d0] = { ...f, annonser: new Map(rader.map((r) => [String(r.ad_id), r])), kampanj: kamp?.data?.[0] ?? null };
    logg(`  · D0 ${d0}: fönster ${f.since}..${f.until}${f.komplett ? '' : ' (INTE komplett — ingen etikett än)'}, ${rader.length} annonser med data`);
  }

  let historik = [];
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

  return byggJobbfil({ idag, konto, kampanj, annonser, insikter14, kampanj14, perFonster, historik });
}

/** Kort sammanfattning för terminalen. Ren. */
export function sammanfattning(jobb) {
  const a = jobb.annonser ?? [];
  const medSpend = a.filter((x) => (x.spend_sek ?? 0) > 0).length;
  const unga = a.filter((x) => x.forsta_vecka && !x.forsta_vecka.komplett).length;
  return [
    `Avläst ${jobb.datum} — konto ${jobb.konto}, kampanj ${jobb.kampanj.namn} (${jobb.kampanj.effective_status}, ${jobb.kampanj.dagsbudget_sek} kr/dag)`,
    `  last_14d: ${jobb.kampanj.spend_sek} kr · ${jobb.kampanj.kop} köp · ROAS ${jobb.kampanj.roas ?? 'okänd'}`,
    `  ${a.length} annonser, ${medSpend} med spend de senaste 14 dagarna, ${unga} vars första vecka inte är slut (ingen etikett än)`,
    `  budgethistorik: ${jobb.budgethistorik.length} ändringar${jobb.budgethistorik.length ? ' — ' + jobb.budgethistorik.map((h) => `${h.tid.slice(0, 10)} ${h.fran_sek}→${h.till_sek}`).join(', ') : ''}`,
  ].join('\n');
}

const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
const r2 = (v) => (v === null || v === undefined ? null : Math.round(v * 100) / 100);
const r3 = (v) => (v === null || v === undefined ? null : Math.round(v * 1000) / 1000);
