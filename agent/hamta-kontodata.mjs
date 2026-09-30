#!/usr/bin/env node
// Hämtar rondens kontodata ur Meta med META_ACCESS_TOKEN (läs-bara) och
// skriver den i exakt det format /rond beskriver — ordagrant ur svaret,
// inget avrundat, saknat värde = null.
//
//   node agent/hamta-kontodata.mjs --konto SE        → agent/kontodata.json
//   node agent/hamta-kontodata.mjs --konto NO        → agent/kontodata-no.json
//   node agent/hamta-kontodata.mjs --konto spegel    → agent/spegelbudget.json (bara CARASHELL, bara läst)
//
// Byggd 2026-09-27: de schemalagda rondsessionerna börjar i en tom container
// utan kontodata (filerna är gitignorerade), och att skriva av ~40 kampanjer
// × 14 dygn ur MCP-svaret för hand är exakt den sortens avskrift som ger
// påhittade tal. Samma Graph-klient som agent/etikett-backfill.mjs.
//
// Attribution: anrop 1 (last_3d) och 3 (dygnsserien) med ["7d_click","1d_view"]
// — `7d_click`-nyckeln ger klicktalen (roas_3d, kop_3d, dygn.roas/kop/cpa),
// `value` ger Metas deduplicerade total inkl. visningsköp (roas_3d_visning),
// `1d_view` ger visningsköpen (kop_3d_visning, dygn.kop_visning). Anrop 2
// (maximum) med ["7d_click"]. Rond-auto steg 1.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.META_ACCESS_TOKEN;
const API = 'https://graph.facebook.com/v21.0';

export const KONTON = {
  SE: { id: '1867947880635861', namn: 'MagiBorsten', fil: 'kontodata.json' },
  NO: { id: '1050941584152547', namn: 'Magiborsten NO', fil: 'kontodata-no.json' },
};
export const SPEGEL = {
  '915422744950975': 'MagiBorsten DK (OPS)',
  '1107817401910319': 'Magiborsten UK',
};

const PAUS_MS = 1200;
const BACKOFF_MS = [20000, 40000, 80000, 160000, 300000];
let senast = 0;
const vänta = (ms) => new Promise((r) => setTimeout(r, ms));

export async function api(sökväg, params = {}) {
  if (!TOKEN) throw new Error('META_ACCESS_TOKEN saknas i miljön.');
  const url = new URL(`${API}/${sökväg}`);
  url.searchParams.set('access_token', TOKEN);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  return hamtaUrl(url);
}

/**
 * Ett GET mot en färdig adress (första sidan eller `paging.next`), med samma
 * paus och samma backoff. Ger aldrig upp tyst: tar försöken slut kastas felet.
 */
export async function hamtaUrl(url) {
  for (let f = 0; ; f++) {
    const t = senast + PAUS_MS - Date.now();
    if (t > 0) await vänta(t);
    senast = Date.now();
    const res = await fetch(url);
    const json = await res.json().catch(() => ({}));
    if (res.ok && !json.error) return json;
    const e = json.error || {};
    const strypt = e.code === 17 || e.code === 4 || e.code === 32 || /request limit/i.test(e.message || '');
    if ((strypt || e.is_transient || res.status >= 500) && f < BACKOFF_MS.length) {
      console.error(`  ⏳ Meta ${strypt ? 'stryper' : `fel ${e.code ?? res.status}`} — väntar ${BACKOFF_MS[f] / 1000}s`);
      await vänta(BACKOFF_MS[f]);
      continue;
    }
    throw new Error(`Meta ${res.status}: ${e.message || res.statusText}`);
  }
}

// Nästa sida hämtas med samma backoff som första. Förut (t.o.m. 2026-09-30)
// gjorde en strypning (kod 17) mitt i bläddringen `continue` på felsvaret, som
// saknar `paging.next` — loopen tog slut och gav de sidor den hunnit hämta,
// utan ett ord. Hittat av facit-kartläggningen 2026-09-30.
export async function alla(sökväg, params = {}) {
  const ut = [];
  let svar = await api(sökväg, { ...params, limit: params.limit ?? 200 });
  ut.push(...(svar.data || []));
  while (svar.paging?.next) {
    svar = await hamtaUrl(svar.paging.next);
    ut.push(...(svar.data || []));
  }
  return ut;
}

/** Värdet för en action-typ i ett fönster. Saknas raden helt ⇒ null (aldrig 0). */
export const val = (arr, typ, fönster) => {
  const a = (arr || []).find((x) => x.action_type === typ);
  if (!a) return null;
  const v = a[fönster];
  return v === undefined ? null : v;
};
export const tal = (v) => (v === null || v === undefined ? null : Number(v));
/** Budget ur Meta (öre som sträng) → samma form som MCP-verktyget visar. */
const budgetKr = (ore) => (ore === undefined || ore === null || ore === '' ? null : `${(Number(ore) / 100).toFixed(2).replace('.', ',')} kr (SEK)`);
export const spendKr = (s) => (s === undefined || s === null ? null : `${s} kr (SEK)`);

const svensktDatumIdag = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

const AKTIVA = [{ field: 'campaign.effective_status', operator: 'IN', value: ['ACTIVE'] }];

export async function hamtaKonto(konto) {
  const act = `act_${konto.id}`;
  const hamtad = new Date().toISOString();
  console.error(`Hämtar ${konto.namn} (${act}) …`);
  const kampanjer = await alla(`${act}/campaigns`, { fields: 'id,name,effective_status,daily_budget,created_time', effective_status: ['ACTIVE'] });
  console.error(`  ${kampanjer.length} aktiva kampanjer`);
  const tre = await alla(`${act}/insights`, { level: 'campaign', date_preset: 'last_3d', filtering: AKTIVA, fields: 'campaign_id,spend,purchase_roas,actions', action_attribution_windows: ['7d_click', '1d_view'], limit: 500 });
  const max = await alla(`${act}/insights`, { level: 'campaign', date_preset: 'maximum', filtering: AKTIVA, fields: 'campaign_id,spend,purchase_roas,actions', action_attribution_windows: ['7d_click'], limit: 500 });
  const serie = await alla(`${act}/insights`, { level: 'campaign', date_preset: 'last_14d', time_increment: '1', filtering: AKTIVA, fields: 'campaign_id,spend,purchase_roas,actions,cost_per_action_type', action_attribution_windows: ['7d_click', '1d_view'], limit: 1000 });
  const per3 = new Map(tre.map((r) => [r.campaign_id, r]));
  const perMax = new Map(max.map((r) => [r.campaign_id, r]));
  const perSerie = new Map();
  for (const r of serie) { if (!perSerie.has(r.campaign_id)) perSerie.set(r.campaign_id, []); perSerie.get(r.campaign_id).push(r); }

  const ut = kampanjer.map((k) => {
    const t = per3.get(k.id) || {};
    const m = perMax.get(k.id) || {};
    const dygn = (perSerie.get(k.id) || []).sort((a, b) => a.date_start.localeCompare(b.date_start)).map((d) => ({
      datum: d.date_start,
      roas: tal(val(d.purchase_roas, 'omni_purchase', '7d_click')),
      spend: tal(d.spend),
      // Meta utelämnar omni_purchase-raden ett dygn utan köp ⇒ 0, och 1d_view-nyckeln när visningsköpen är 0 ⇒ 0.
      kop: d.spend !== undefined ? (tal(val(d.actions, 'omni_purchase', '7d_click')) ?? 0) : null,
      kop_visning: d.spend !== undefined ? (tal(val(d.actions, 'omni_purchase', '1d_view')) ?? 0) : null,
      cpa: tal(val(d.cost_per_action_type, 'omni_purchase', '7d_click')),
    }));
    return {
      id: k.id,
      namn: k.name,
      effective_status: k.effective_status,
      daily_budget: budgetKr(k.daily_budget),
      created_time: k.created_time ?? null,
      spend_3d: spendKr(t.spend),
      roas_3d: val(t.purchase_roas, 'omni_purchase', '7d_click'),
      roas_3d_visning: val(t.purchase_roas, 'omni_purchase', 'value'),
      kop_3d: t.spend !== undefined ? (tal(val(t.actions, 'omni_purchase', '7d_click')) ?? 0) : null,
      kop_3d_visning: t.spend !== undefined ? (tal(val(t.actions, 'omni_purchase', '1d_view')) ?? 0) : null,
      spend_total: spendKr(m.spend),
      roas_total: val(m.purchase_roas, 'omni_purchase', '7d_click'),
      kop_total: m.spend !== undefined ? (tal(val(m.actions, 'omni_purchase', '7d_click')) ?? 0) : null,
      dygn,
    };
  });
  return { hamtad, attribution: '7d_click', ad_account_id: konto.id, ad_account_namn: konto.namn, idag: svensktDatumIdag(), kampanjer: ut };
}

export async function hamtaSpegel() {
  const hamtad = new Date().toISOString();
  const konton = {};
  for (const [id, namn] of Object.entries(SPEGEL)) {
    const act = `act_${id}`;
    console.error(`Hämtar spegelkampanjer i ${namn} (${act}) …`);
    const kampanjer = await alla(`${act}/campaigns`, { fields: 'id,name,effective_status,daily_budget', filtering: [{ field: 'name', operator: 'CONTAIN', value: 'CARASHELL' }] });
    const tre = await alla(`${act}/insights`, { level: 'campaign', date_preset: 'last_3d', filtering: [{ field: 'campaign.name', operator: 'CONTAIN', value: 'CARASHELL' }], fields: 'campaign_id,spend,purchase_roas,actions', action_attribution_windows: ['7d_click'], limit: 500 });
    const per3 = new Map(tre.map((r) => [r.campaign_id, r]));
    konton[id] = {
      namn,
      kampanjer: kampanjer.map((k) => {
        const t = per3.get(k.id) || {};
        return {
          id: k.id,
          namn: k.name,
          effective_status: k.effective_status,
          daily_budget: k.daily_budget ? `${Number(k.daily_budget) / 100} kr (SEK)` : null,
          spend_3d: spendKr(t.spend),
          roas_3d: val(t.purchase_roas, 'omni_purchase', '7d_click'),
          kop_3d: t.spend !== undefined ? (tal(val(t.actions, 'omni_purchase', '7d_click')) ?? 0) : null,
        };
      }),
    };
    console.error(`  ${konton[id].kampanjer.length} CARASHELL-kampanjer`);
  }
  return { hamtad, attribution: '7d_click', konton };
}

async function main(argv) {
  const i = argv.indexOf('--konto');
  const konto = i >= 0 ? argv[i + 1] : null;
  if (konto === 'spegel') {
    const fil = join(HÄR, 'spegelbudget.json');
    const gammal = JSON.parse(readFileSync(fil, 'utf8'));
    const ny = await hamtaSpegel();
    writeFileSync(fil, `${JSON.stringify({ kommentar: gammal.kommentar, ...ny }, null, 2)}\n`);
    console.error(`Skrev ${fil}`);
    return;
  }
  const k = KONTON[konto];
  if (!k) { console.error('Ange --konto SE | NO | spegel'); process.exit(2); }
  const data = await hamtaKonto(k);
  const fil = join(HÄR, k.fil);
  writeFileSync(fil, `${JSON.stringify(data, null, 2)}\n`);
  console.error(`Skrev ${fil}: ${data.kampanjer.length} kampanjer, ${data.kampanjer.filter((c) => c.dygn.length).length} med dygnsserie`);
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main(process.argv.slice(2)).catch((e) => { console.error(`HÄMTNINGEN AVBRÖTS: ${e.message}`); process.exit(2); });
}
