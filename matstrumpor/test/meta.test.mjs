import { test } from 'node:test';
import assert from 'node:assert/strict';
import { varde, tolkaRad, fonster, budgetHistorik, budgetVid, byggJobbfil, hamtaAvlasning, plusDagar, sammanfattning } from '../meta.mjs';
import { lasKonfig } from '../kor.mjs';

// Ett riktigt insights-svar ur kontot 2026-09-22 (kortat till de typer vi läser).
const RAD = {
  ad_id: '120251217863240023', ad_name: 'MATSTRUMP_sushi_gift_ugc_s001h1_v2',
  spend: '814.02', impressions: '4920', inline_link_clicks: '65',
  actions: [
    { action_type: 'omni_purchase', value: '2', '7d_click': '2' },
    { action_type: 'link_click', value: '65', '7d_click': '65' },
    { action_type: 'omni_landing_page_view', value: '56', '7d_click': '56' },
    { action_type: 'page_engagement', value: '2091', '7d_click': '513' },
  ],
  purchase_roas: [{ action_type: 'omni_purchase', value: '1.634', '7d_click': '1.634' }],
  cost_per_action_type: [{ action_type: 'omni_purchase', value: '407.01', '7d_click': '407.01' }],
  video_play_actions: [{ action_type: 'video_view', value: '4600' }],
  video_thruplay_watched_actions: [{ action_type: 'video_view', value: '900' }],
};

test('varde läser 7d_click-fönstret först och value som reserv — saknad typ ger null, aldrig 0', () => {
  assert.equal(varde(RAD.actions, 'page_engagement'), 513, '7d_click vinner över value');
  assert.equal(varde(RAD.video_play_actions, 'video_view'), 4600, 'videomått har inget fönster ⇒ value');
  assert.equal(varde(RAD.actions, 'finns_inte'), null);
  assert.equal(varde(undefined, 'omni_purchase'), null);
});

test('tolkaRad: spend, köp, ROAS, CPA, hook rate och hold rate ur en rad', () => {
  const r = tolkaRad(RAD);
  assert.equal(r.spend_sek, 814.02);
  assert.equal(r.kop, 2);
  assert.equal(r.roas, 1.634);
  assert.equal(r.cpa_sek, 407.01);
  assert.equal(r.lpv, 56);
  assert.equal(r.konv_lpv, 0.036);
  assert.equal(r.hook_rate, 0.935, 'videostarter / visningar');
  assert.equal(r.hold_rate, 0.196, 'thruplay / videostarter');
});

test('tolkaRad på en tom rad (annons utan data i fönstret): nollor där Meta säger noll, null där inget mättes', () => {
  const r = tolkaRad({});
  assert.equal(r.spend_sek, null);
  assert.equal(r.kop, 0);
  assert.equal(r.roas, null);
  assert.equal(r.cpa_sek, null);
  assert.equal(r.hook_rate, null);
});

test('fonster: annonsens egna första vecka [D0, D0+6], kapad vid gårdagen', () => {
  const helt = fonster('2026-08-27', '2026-09-22');
  assert.deepEqual([helt.since, helt.until, helt.komplett, helt.dagar_med_data], ['2026-08-27', '2026-09-02', true, 7]);
  const ungt = fonster('2026-09-21', '2026-09-22');
  assert.deepEqual([ungt.since, ungt.until, ungt.komplett, ungt.dagar_med_data], ['2026-09-21', '2026-09-21', false, 1], 'i dag finns aldrig i Metas siffror');
  const exaktSju = fonster('2026-09-15', '2026-09-22');
  assert.equal(exaktSju.komplett, true, 'D0+6 = gårdagen ⇒ veckan är slut');
});

// Aktivitetsloggen som kontot faktiskt skrev 2026-09-08 och 2026-09-10 (öre).
const AKTIVITETER = [
  { event_type: 'update_campaign_run_status', event_time: '2026-09-10T16:59:39+0000', object_id: '120251217860260023', extra_data: '{"run_status":{"old_value":17,"new_value":1}}' },
  { event_type: 'update_campaign_budget', event_time: '2026-09-10T16:59:21+0000', object_id: '120251217860260023', object_name: 'MATSTRUMP_SALES_20260826', extra_data: '{"old_value":{"type":"payment_amount","currency":"SEK","old_value":200000},"new_value":{"type":"payment_amount","currency":"SEK","new_value":100000},"type":"composite_data"}' },
  { event_type: 'update_campaign_budget', event_time: '2026-09-08T13:03:31+0000', object_id: '120251217860260023', object_name: 'MATSTRUMP_SALES_20260826', extra_data: '{"old_value":{"old_value":100000},"new_value":{"new_value":200000}}' },
  { event_type: 'update_campaign_budget', event_time: '2026-09-09T10:00:00+0000', object_id: 'annan-kampanj', extra_data: '{"old_value":{"old_value":1},"new_value":{"new_value":2}}' },
];

test('budgetHistorik: bara kampanjens egna budgetändringar, äldst först, i kronor', () => {
  const h = budgetHistorik(AKTIVITETER, '120251217860260023');
  assert.deepEqual(h.map((x) => [x.tid.slice(0, 10), x.fran_sek, x.till_sek]), [['2026-09-08', 1000, 2000], ['2026-09-10', 2000, 1000]]);
});

test('budgetVid: budgeten som gällde en viss dag — före, mellan och efter ändringarna', () => {
  const h = budgetHistorik(AKTIVITETER, '120251217860260023');
  assert.equal(budgetVid(h, '2026-09-01', 1000), 1000, 'före första ändringen: dess gamla värde');
  assert.equal(budgetVid(h, '2026-09-08', 1000), 2000, 'samma dag som höjningen: höjd');
  assert.equal(budgetVid(h, '2026-09-09', 1000), 2000);
  assert.equal(budgetVid(h, '2026-09-15', 1000), 1000, 'efter sänkningen');
  assert.equal(budgetVid([], '2026-09-15', 1000), 1000, 'utan historik: nuvarande');
  assert.equal(budgetVid([], '2026-09-15'), null, 'utan historik och utan nuvarande: null, aldrig påhittat');
});

test('byggJobbfil: 14-dagarstalen på raden, första veckan i forsta_vecka, budget_d0/d7 ur historiken', () => {
  const h = budgetHistorik(AKTIVITETER, '120251217860260023');
  const jobb = byggJobbfil({
    idag: '2026-09-22',
    konto: '730973156224390',
    kampanj: { id: '120251217860260023', name: 'MATSTRUMP_SALES_20260826', status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '100000' },
    annonser: [
      { id: '120251217863240023', name: 'MATSTRUMP_sushi_gift_ugc_s001h1_v2', created_time: '2026-08-27T04:49:55+0200', status: 'ACTIVE', effective_status: 'ACTIVE', adset: { id: 'a1', name: 'broad_advplus_purchase_nya16' } },
      { id: '9', name: 'MATSTRUMP_sushi_jul_ugc_044h1_v1', created_time: '2026-09-21T21:00:00+0200', status: 'ACTIVE', effective_status: 'ACTIVE', adset: { id: 'a2', name: 'broad_advplus_purchase_jul_video' } },
    ],
    insikter14: [RAD],
    kampanj14: { spend: '17031.37', actions: [{ action_type: 'omni_purchase', value: '51', '7d_click': '51' }], purchase_roas: [{ action_type: 'omni_purchase', value: '1.392', '7d_click': '1.392' }] },
    perFonster: {
      '2026-08-27': { since: '2026-08-27', until: '2026-09-02', komplett: true, dagar_med_data: 7, annonser: new Map([[RAD.ad_id, { ...RAD, spend: '400.00' }]]), kampanj: { spend: '3000.00', purchase_roas: [{ action_type: 'omni_purchase', value: '1.1', '7d_click': '1.1' }] } },
      '2026-09-21': { since: '2026-09-21', until: '2026-09-21', komplett: false, dagar_med_data: 1, annonser: new Map(), kampanj: null },
    },
    historik: h,
    hamtat: '2026-09-22T05:00:00.000Z',
  });
  assert.equal(jobb.datum, '2026-09-22');
  assert.equal(jobb.kampanj.dagsbudget_sek, 1000);
  assert.equal(jobb.kampanj.spend_sek, 17031.37);
  assert.equal(jobb.kampanj.kop, 51);
  assert.equal(jobb.kampanj.roas, 1.392);
  assert.equal(jobb.kampanj.budget_d0, 2000, '14 dagar bakåt är 2026-09-08, och vid slutet av den dagen var budgeten höjd till 2 000');
  assert.equal(jobb.kampanj.budget_d7, 1000, 'nuvarande dagsbudget');
});

test('byggJobbfil: annonsraden bär både 14-dagarstalen och sin egen första vecka', () => {
  const h = budgetHistorik(AKTIVITETER, '120251217860260023');
  const jobb = byggJobbfil({
    idag: '2026-09-22', konto: '730973156224390',
    kampanj: { id: '120251217860260023', name: 'K', daily_budget: '100000' },
    annonser: [
      { id: '120251217863240023', name: 'GAMMAL', created_time: '2026-09-05T04:49:55+0200', effective_status: 'ACTIVE', adset: { name: 'x' } },
      { id: '9', name: 'UNG', created_time: '2026-09-21T21:00:00+0200', effective_status: 'ACTIVE', adset: { name: 'y' } },
    ],
    insikter14: [RAD],
    kampanj14: {},
    perFonster: {
      '2026-09-05': { since: '2026-09-05', until: '2026-09-11', komplett: true, dagar_med_data: 7, annonser: new Map([[RAD.ad_id, { ...RAD, spend: '400.00' }]]), kampanj: { spend: '3000.00', purchase_roas: [{ action_type: 'omni_purchase', value: '1.1', '7d_click': '1.1' }] } },
      '2026-09-21': { since: '2026-09-21', until: '2026-09-21', komplett: false, dagar_med_data: 1, annonser: new Map(), kampanj: null },
    },
    historik: h,
  });
  const [gammal, ung] = jobb.annonser;
  assert.equal(gammal.spend_sek, 814.02, '14 dagar på raden');
  assert.equal(gammal.d0, '2026-09-05');
  assert.equal(gammal.forsta_vecka.spend_sek, 400, 'första veckan i forsta_vecka');
  assert.equal(gammal.forsta_vecka.kampanj_spend_sek, 3000);
  assert.equal(gammal.forsta_vecka.kampanj_roas, 1.1);
  assert.equal(gammal.forsta_vecka.budget_d0, 1000, 'D0 2026-09-05: före höjningen 09-08');
  assert.equal(gammal.forsta_vecka.budget_d7, 1000, 'D0+6 = 2026-09-11: höjd 09-08 och sänkt igen 09-10 ⇒ 1 000 vid veckans slut');
  assert.equal(ung.forsta_vecka.komplett, false);
});

test('byggJobbfil: en ung annons har forsta_vecka.komplett=false och inga påhittade 14-dagarstal', () => {
  const jobb = byggJobbfil({
    idag: '2026-09-22', konto: '730973156224390',
    kampanj: { id: 'K', name: 'K', daily_budget: '100000' },
    annonser: [{ id: '9', name: 'UNG', created_time: '2026-09-21T21:00:00+0200', effective_status: 'ACTIVE', adset: { name: 'y' } }],
    insikter14: [], kampanj14: {},
    perFonster: { '2026-09-21': { since: '2026-09-21', until: '2026-09-21', komplett: false, dagar_med_data: 1, annonser: new Map(), kampanj: null } },
    historik: [],
  });
  const [ung] = jobb.annonser;
  assert.equal(ung.forsta_vecka.komplett, false);
  assert.equal(ung.spend_sek, null, 'ingen rad i last_14d ⇒ null, inte 0');
  assert.equal(ung.forsta_vecka.spend_sek, null);
  assert.equal(ung.forsta_vecka.budget_d0, 1000, 'utan historik: nuvarande budget');
});

test('hamtaAvlasning gör bara GET-anrop, ett fönster per distinkt D0, och vägrar fel konto', async () => {
  const konfig = lasKonfig();
  const anrop = [];
  const klient = {
    api: async (sokvag, opt = {}) => {
      anrop.push(['api', sokvag, opt.method ?? 'GET', opt.params]);
      if (opt.form || (opt.method && opt.method !== 'GET')) throw new Error('SKRIVNING — får aldrig ske');
      if (sokvag === konfig.meta.kampanj.id) return { id: konfig.meta.kampanj.id, name: konfig.meta.kampanj.namn, status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '100000' };
      if (sokvag.endsWith('/insights')) return { data: [{ spend: '100.00', actions: [], purchase_roas: [] }] };
      throw new Error(`oväntat anrop ${sokvag}`);
    },
    alla: async (sokvag, params) => {
      anrop.push(['alla', sokvag, 'GET', params]);
      if (sokvag.endsWith('/ads')) return [
        { id: '1', name: 'A', created_time: '2026-08-27T04:49:55+0200', effective_status: 'ACTIVE', adset: { id: 'x', name: 'nya16' } },
        { id: '2', name: 'B', created_time: '2026-08-27T09:00:00+0200', effective_status: 'ACTIVE', adset: { id: 'x', name: 'nya16' } },
        { id: '3', name: 'C', created_time: '2026-09-02T09:00:00+0200', effective_status: 'PAUSED', adset: { id: 'y', name: 'bilder' } },
      ];
      if (sokvag.endsWith('/insights')) return [{ ad_id: '1', spend: '50.00', actions: [], purchase_roas: [] }];
      if (sokvag.endsWith('/activities')) return AKTIVITETER;
      throw new Error(`oväntat anrop ${sokvag}`);
    },
  };
  const jobb = await hamtaAvlasning(konfig, { idag: '2026-09-22', klient, logg: () => {} });
  assert.equal(jobb.konto, '730973156224390');
  assert.equal(jobb.annonser.length, 3);
  assert.ok(anrop.every((a) => a[2] === 'GET'), 'inte en enda skrivning');
  const fonsterAnrop = anrop.filter((a) => a[1].endsWith('/insights') && a[3]?.time_range);
  assert.equal(fonsterAnrop.length, 4, 'två distinkta D0 × (ad-nivå + kampanjnivå)');
  assert.equal(jobb.annonser[0].forsta_vecka.since, '2026-08-27');
  assert.equal(jobb.annonser[2].forsta_vecka.since, '2026-09-02');
  assert.equal(jobb.budgethistorik.length, 2);
  assert.match(sammanfattning(jobb), /3 annonser/);

  const felKonto = { ...konfig, meta: { ...konfig.meta, ad_account_id: '1867947880635861' } };
  await assert.rejects(() => hamtaAvlasning(felKonto, { idag: '2026-09-22', klient, logg: () => {} }), /nya kungen/);
});

test('hamtaAvlasning stoppar om kampanjen i kontot inte heter det konfigen säger', async () => {
  const konfig = lasKonfig();
  const klient = {
    api: async () => ({ id: konfig.meta.kampanj.id, name: 'NÅGOT ANNAT', daily_budget: '100000' }),
    alla: async () => [],
  };
  await assert.rejects(() => hamtaAvlasning(konfig, { idag: '2026-09-22', klient, logg: () => {} }), /stämmer inte/);
});

test('plusDagar räknar över månadsskiftet', () => {
  assert.equal(plusDagar('2026-08-27', 6), '2026-09-02');
  assert.equal(plusDagar('2026-09-01', -1), '2026-08-31');
});
