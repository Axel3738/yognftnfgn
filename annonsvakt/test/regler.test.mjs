// Reglerna dömer utan nät; minnet stoppar dubbletter; texten är engelsk och
// pingar Axel bara på 🔴. Fallen är tagna ur mätningen 2026-09-27.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  bedomKonton, bedomObjekt, bedomSpend, lasfel, sammanfoga, formulera, delaText, skapaBreakEvenFor,
  breakEvenUrNamn, menadAttKora, riktigaFel, heltal, kod, KONTOSTATUS, DISABLE_REASON, dagStockholm, timmeStockholm, tidText,
} from '../regler.mjs';
import { normaliseraKonto, arTokenFel } from '../meta.mjs';
import { slackText } from '../posta.mjs';
import { serUtSomSvenska } from '../../tools/lib/engelska.mjs';

const KONFIG = JSON.parse(readFileSync(new URL('../konfig.json', import.meta.url), 'utf8'));
const NU = new Date('2026-09-27T14:44:00Z');
const UK = { id: '1107817401910319', namn: 'Magiborsten UK', valuta: 'SEK', account_status: 1, disable_reason: 0 };
const kamp = (id, name, extra = {}) => ({ id, name, status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '800000', ...extra });
const annons = (id, name, effective_status, extra = {}) => ({
  id, name, status: 'ACTIVE', effective_status, updated_time: '2026-09-27T10:00:00+0200',
  campaign: { id: 'k1', name: 'CARASHELL_US_Taköverdrag | BE-ROAS 1.63 | 2026-09-16', status: 'ACTIVE', effective_status: 'ACTIVE' },
  adset: { id: 's1', name: 'CARASHELL_US_Taköverdrag - CO', status: 'ACTIVE', effective_status: 'ACTIVE' },
  ...extra,
});
const rad = (ad_id, ad_name, spend, kop, roas, extra = {}) => ({
  ad_id, ad_name, adset_id: 's1', adset_name: 'CO', campaign_id: 'k1', campaign_name: 'CARASHELL_US_Taköverdrag | BE-ROAS 1.63 | 2026-09-16',
  spend: String(spend), actions: kop ? [{ action_type: 'omni_purchase', value: String(kop) }] : [], purchase_roas: roas != null ? [{ action_type: 'omni_purchase', value: String(roas) }] : [], ...extra,
});

// ------------------------------------------------------------------ kontona

test('kontona: ACTIVE tiger, DISABLED med orsak är 🔴, oåtkomligt konto är 🔴, token som dött är det enda som sägs', () => {
  const inget = bedomKonton({ konton: [UK], olasta: [] });
  assert.deepEqual(inget, []);

  const ned = bedomKonton({ konton: [{ ...UK, account_status: 2, disable_reason: 1 }], olasta: [] }, { verksamhetFor: () => 'Bäverbutiken / CaraShell' });
  assert.equal(ned.length, 1);
  assert.equal(ned[0].niva, 'rod');
  assert.equal(ned[0].nyckel, 'konto:1107817401910319:status:2');
  assert.match(ned[0].text, /is DISABLED/);
  assert.match(ned[0].text, /ADS_INTEGRITY_POLICY/);
  assert.match(ned[0].text, /Bäverbutiken \/ CaraShell/);

  const borta = bedomKonton({ konton: [], olasta: [{ id: '730973156224390', namn: 'nya kungen', fel: '(#200) Ad account owner has NOT grant ads_management or ads_read permission' }] });
  assert.equal(borta[0].nyckel, 'konto:730973156224390:oatkomlig');
  assert.match(borta[0].text, /can no longer be read/);

  const token = bedomKonton({ konton: [{ ...UK, account_status: 2 }], olasta: [{ id: 'x', fel: 'y' }], tokenFel: 'Error validating access token: Session has expired' });
  assert.equal(token.length, 1, 'när token:en är död sägs bara det');
  assert.equal(token[0].nyckel, 'token:ogiltig');
  assert.equal(token[0].typ, 'token');
});

test('KONTOSTATUS och DISABLE_REASON är Metas koder', () => {
  assert.equal(KONTOSTATUS[1], 'ACTIVE');
  assert.equal(KONTOSTATUS[2], 'DISABLED');
  assert.equal(KONTOSTATUS[9], 'IN_GRACE_PERIOD');
  assert.equal(DISABLE_REASON[3], 'RISK_PAYMENT');
  assert.equal(normaliseraKonto({ account_id: '1', name: 'x', currency: 'SEK', account_status: '1', balance: '730201' }).balance, 7302.01);
  assert.equal(arTokenFel({ meta: { code: 190 } }), true);
  assert.equal(arTokenFel({ meta: { code: 200 } }), false);
});

// ------------------------------------------------------------------ objekten

test('annonser: DISAPPROVED i aktiv kampanj är 🔴 med Metas skäl; i pausad kampanj tiger vakten', () => {
  const aktiv = annons('a1', 'CaraShellRoof_US_CO_103_H1', 'DISAPPROVED', { ad_review_feedback: { global: { 'Unacceptable business practices': 'It looks like your ad …' } } });
  const [p] = bedomObjekt({ konto: UK, annonser: [aktiv] }, { nu: NU, konfig: KONFIG });
  assert.equal(p.niva, 'rod');
  assert.equal(p.nyckel, 'annons:a1:DISAPPROVED');
  assert.match(p.text, /was DISAPPROVED by Meta — `Unacceptable business practices`/);
  assert.match(p.text, /account `Magiborsten UK`/);

  // Mätt 2026-09-27: UK_Trimmerbelt_SO_2_6 DISAPPROVED, kampanjen PAUSED, adsetet CAMPAIGN_PAUSED.
  const pausad = annons('a2', 'UK_Trimmerbelt_SO_2_6', 'DISAPPROVED', { campaign: { id: 'k2', name: 'UK', status: 'PAUSED', effective_status: 'PAUSED' }, adset: { id: 's2', name: 'x', status: 'ACTIVE', effective_status: 'CAMPAIGN_PAUSED' } });
  assert.equal(menadAttKora(pausad), false);
  assert.deepEqual(bedomObjekt({ konto: UK, annonser: [pausad] }, { nu: NU, konfig: KONFIG }), []);
  // Och en annons som själv är PAUSED räknas aldrig, hur kampanjen än mår.
  assert.deepEqual(bedomObjekt({ konto: UK, annonser: [annons('a3', 'x', 'DISAPPROVED', { status: 'PAUSED' })] }, { nu: NU, konfig: KONFIG }), []);
});

test('WITH_ISSUES: kod 4469003 (not delivering) ignoreras, andra koder är 🔴 — på annons, adset och kampanj', () => {
  const ignorerad = annons('a1', 'IBC_GT_1_H1', 'WITH_ISSUES', { issues_info: [{ level: 'AD', error_code: 4469003, error_summary: 'Ad not delivering', error_message: 'Ad not delivering: …' }] });
  assert.deepEqual(bedomObjekt({ konto: UK, annonser: [ignorerad] }, { nu: NU, konfig: KONFIG }), []);
  assert.deepEqual(riktigaFel(ignorerad.issues_info, KONFIG.ignorera_felkoder), []);

  const sida = annons('a2', 'TankGuard_NO_RV_3_1', 'WITH_ISSUES', { issues_info: [{ level: 'AD', error_code: 2446095, error_summary: 'Page not published', error_message: 'Page not published: …' }] });
  const [p] = bedomObjekt({ konto: UK, annonser: [sida] }, { nu: NU, konfig: KONFIG });
  assert.equal(p.niva, 'rod');
  assert.equal(p.nyckel, 'annons:a2:WITH_ISSUES:2446095');
  assert.match(p.text, /`Page not published` \(code 2446095\)/);

  const ut = bedomObjekt({
    konto: UK,
    kampanjer: [kamp('k1', 'MATSTRUMP_SALES', { issues_info: [{ level: 'CAMPAIGN', error_code: 1815857, error_summary: 'Pixel issue' }] }), kamp('k9', 'Fin', { issues_info: [{ level: 'CAMPAIGN', error_code: 4469003, error_summary: 'Ad not delivering' }] })],
    adsets: [{ id: 's7', name: 'ELECTRIC 2 LISTICLE', status: 'ACTIVE', effective_status: 'WITH_ISSUES', campaign_id: 'k1', issues_info: [{ level: 'AD_SET', error_code: 1487114, error_summary: 'Audience too small' }] }, { id: 's8', name: 'ok', status: 'ACTIVE', effective_status: 'ACTIVE', campaign_id: 'k1', issues_info: [{ level: 'AD_SET', error_code: 4469003, error_summary: 'Ad not delivering' }] }],
  }, { nu: NU, konfig: KONFIG });
  assert.deepEqual(ut.map((p) => p.nyckel), ['kampanj:k1:issues:1815857', 'adset:s7:issues:1487114']);
  assert.match(ut[1].text, /Ad set `ELECTRIC 2 LISTICLE` in `MATSTRUMP_SALES`/);
});

test('PENDING_REVIEW: 🟡 först efter granskning_timmar, aldrig före', () => {
  const ny = annons('a1', 'x', 'PENDING_REVIEW', { updated_time: '2026-09-27T12:00:00+0200' });
  assert.deepEqual(bedomObjekt({ konto: UK, annonser: [ny] }, { nu: NU, konfig: KONFIG }), []);
  const gammal = annons('a2', 'Takoverdrag_SP_9_H1', 'PENDING_REVIEW', { updated_time: '2026-09-25T12:00:00+0200' });
  const [p] = bedomObjekt({ konto: UK, annonser: [gammal] }, { nu: NU, konfig: KONFIG });
  assert.equal(p.niva, 'gul');
  assert.equal(p.nyckel, 'granskning:a2');
  assert.match(p.text, /waiting for Meta's review for 52 hours/);
});

test('läsfel på ett konto är 🟡 med kontots namn', () => {
  const p = lasfel(UK, 'Meta act_x/ads: (17) User request limit reached');
  assert.equal(p.nyckel, 'konto:1107817401910319:lasfel');
  assert.equal(p.niva, 'gul');
  assert.match(p.text, /Could not read the ads in `Magiborsten UK`/);
});

// ------------------------------------------------------------------ spenden

test('spend: 0 köp larmas från spend_min på fördubblingsnivåer; under gränsen tiger vakten', () => {
  const be = skapaBreakEvenFor({ standard: 1.6 });
  const konfig = KONFIG;
  // Mätt 2026-09-27 16:00 UTC: CaraShellRoof_US_CO_103_H1 17 307 kr / 0 köp, 80 % av kontots 21 665 kr.
  const idag = [rad('a1', 'CaraShellRoof_US_CO_103_H1', 17307, 0, null), rad('a2', 'CaraShellRoof_US_CS_3_H1', 3080, 0, null), rad('a3', 'CaraShellRoof_US_SP_2_1', 356, 0, null), rad('a4', 'annat', 922, 2, 1.9)];
  const ut = bedomSpend({ konto: UK, idag, kampanjer: [kamp('k1', 'CARASHELL_US_Taköverdrag | BE-ROAS 1.63 | 2026-09-16')] }, { konfig, datum: '2026-09-27', breakEvenFor: be });
  const spend = ut.filter((p) => p.typ === 'spend');
  assert.deepEqual(spend.map((p) => p.nyckel), ['spend:a1:2026-09-27:3', 'spend:a2:2026-09-27:1']);
  assert.equal(spend[0].niva, 'rod');
  assert.equal(spend[0].slag, 'handelse');
  assert.match(spend[0].text, /17 307 SEK spent today, 0 purchases — 80 % of everything `Magiborsten UK` spent today/);
  assert.match(spend[0].text, /daily budget 8 000 SEK/);
  // Kampanjen 21 665 kr mot 8 000 kr budget ⇒ 2,7× ⇒ 🟡 overspend.
  const over = ut.filter((p) => p.typ === 'overspend');
  assert.equal(over.length, 1);
  assert.equal(over[0].niva, 'gul');
  assert.equal(over[0].nyckel, 'overspend:kampanj:k1:2026-09-27');
  assert.match(over[0].text, /21 665 SEK today against a daily budget of 8 000 SEK \(2\.7×\)/);
});

test('spend: med köp krävs 2 × spend_min OCH ROAS under halva break-even; källan till break-even står i texten', () => {
  const be = skapaBreakEvenFor({ produkter: [{ id: 'motorholjet', creative_prefix: 'Enginecover_', break_even_roas: 1.63 }], matstrumpor: { kontoId: '730973156224390', ekonomi: { aov_sek: 462.1, kostnad_per_order_sek: 120.92, tull_eur: 2.9, eur_sek: 11.275 } }, standard: 1.6 });
  const MS = { id: '730973156224390', namn: 'nya kungen', valuta: 'SEK' };
  // Ur kampanjnamnet.
  assert.deepEqual(be({ kampanjNamn: 'Båtmotorskyddet 420D | BE ROAS 1.62 | Launch', adNamn: 'Batmotor_SP_1_H5' }, UK), { varde: 1.62, kalla: 'from the campaign name' });
  // Ur products.json på prefixet.
  assert.deepEqual(be({ kampanjNamn: 'Motorhöljet', adNamn: 'Enginecover_PD_22_H1' }, UK), { varde: 1.63, kalla: 'from products.json' });
  // Matstrumpor: räknat ur ekonomiblocket (1,498), aldrig ett tal ur minnet.
  const ms = be({ kampanjNamn: 'MATSTRUMP_SALES_20260826', adNamn: '09-17 Nathalie' }, MS);
  assert.equal(ms.kalla, 'from matstrumpor/konfig.json');
  assert.equal(ms.varde.toFixed(3), '1.498');
  // Standard.
  assert.deepEqual(be({ kampanjNamn: 'Grillklubbor', adNamn: 'Golfare' }, UK), { varde: 1.6, kalla: 'default break-even' });

  const konfig = KONFIG;
  // 1 köp på 2 000 kr (ROAS 0,25) — under 2 × spend_min ⇒ inget larm, ROAS är brusig med ett köp.
  assert.deepEqual(bedomSpend({ konto: UK, idag: [rad('a1', 'x', 2000, 1, 0.25)] }, { konfig, datum: '2026-09-27', breakEvenFor: be }), []);
  // 3 100 kr, 2 köp, ROAS 0,31 mot 1,63 ⇒ 🔴 nivå 1.
  const [p] = bedomSpend({ konto: UK, idag: [rad('a1', 'Takoverdrag_SP_4_H1', 3100, 2, 0.31)] }, { konfig, datum: '2026-09-27', breakEvenFor: be });
  assert.equal(p.nyckel, 'spend:a1:2026-09-27:1');
  assert.match(p.text, /ROAS 0\.31 against break-even 1\.63 \(from the campaign name\)/);
  // 3 100 kr, 2 köp, ROAS 1,40 — under break-even men över hälften ⇒ inget larm (det är nattvaktens sak).
  assert.deepEqual(bedomSpend({ konto: UK, idag: [rad('a1', 'x', 3100, 4, 1.4)] }, { konfig, datum: '2026-09-27', breakEvenFor: be }), []);
});

test('overspend på ABO-adset räknas mot adsetets budget; utan budget ingen dom', () => {
  const ut = bedomSpend({
    konto: UK,
    idag: [rad('a1', 'x', 900, 1, 2.0, { adset_id: 's5' }), rad('a2', 'y', 700, 1, 2.0, { adset_id: 's5' })],
    kampanjer: [kamp('k1', 'ABO', { daily_budget: '0' })],
    adsets: [{ id: 's5', name: 'Broad', status: 'ACTIVE', effective_status: 'ACTIVE', campaign_id: 'k1', daily_budget: '50000' }],
  }, { konfig: KONFIG, datum: '2026-09-27' });
  assert.deepEqual(ut.map((p) => p.nyckel), ['overspend:adset:s5:2026-09-27']);
  assert.match(ut[0].text, /1 600 SEK today against a daily budget of 500 SEK \(3\.2×\)/);
});

// ------------------------------------------------------------------ minnet

test('sammanfoga: nytt larmas en gång, påminns efter paminn_timmar, löses med ✅ — och en händelse sägs aldrig två gånger', () => {
  const konto = { id: 'k', namn: 'K', valuta: 'SEK' };
  const tillstand = { nyckel: 'annons:1:DISAPPROVED', typ: 'annons', niva: 'rod', slag: 'tillstand', konto, rubrik: 'Ad `x` DISAPPROVED', text: 't' };
  const handelse = { nyckel: 'spend:1:2026-09-27:0', typ: 'spend', niva: 'rod', slag: 'handelse', konto, rubrik: 'h', text: 'h' };
  const tomt = { konton: {}, oppna: {}, handelser: [], hjartslag: null };

  const r1 = sammanfoga({ problem: [tillstand, handelse], minne: tomt, nu: NU, konfig: KONFIG, lasta: new Set(['k']) });
  assert.deepEqual(r1.nya.map((p) => p.nyckel), ['annons:1:DISAPPROVED']);
  assert.deepEqual(r1.handelser.map((p) => p.nyckel), ['spend:1:2026-09-27:0']);
  assert.equal(r1.minne.oppna['annons:1:DISAPPROVED'].forst, NU.toISOString());
  assert.deepEqual(tomt.oppna, {}, 'minnet in muteras inte');

  // En timme senare: samma sak — tystnad.
  const r2 = sammanfoga({ problem: [tillstand, handelse], minne: r1.minne, nu: new Date(NU.getTime() + 3_600_000), konfig: KONFIG, lasta: new Set(['k']) });
  assert.deepEqual([r2.nya, r2.handelser, r2.paminnelser, r2.losta], [[], [], [], []]);

  // Åtta dygn senare: påminnelse (annons: 168 h).
  const r3 = sammanfoga({ problem: [tillstand], minne: r2.minne, nu: new Date(NU.getTime() + 8 * 86_400_000), konfig: KONFIG, lasta: new Set(['k']) });
  assert.deepEqual(r3.paminnelser.map((p) => p.nyckel), ['annons:1:DISAPPROVED']);
  assert.equal(r3.paminnelser[0].forst, NU.toISOString());

  // Sedan borta ur kontot: löst.
  const r4 = sammanfoga({ problem: [], minne: r3.minne, nu: new Date(NU.getTime() + 9 * 86_400_000), konfig: KONFIG, lasta: new Set(['k']) });
  assert.deepEqual(r4.losta.map((l) => l.nyckel), ['annons:1:DISAPPROVED']);
  assert.deepEqual(r4.minne.oppna, {});
  // Händelsen glöms efter handelser_dagar (14) — nyckeln bär datumet, så den kan ändå inte komma igen.
  assert.equal(r4.minne.handelser.length, 1);
  const r5 = sammanfoga({ problem: [], minne: r4.minne, nu: new Date(NU.getTime() + 15 * 86_400_000), konfig: KONFIG, lasta: new Set(['k']) });
  assert.equal(r5.minne.handelser.length, 0);
});

test('sammanfoga: ett konto som inte lästes den här timmen får sina problem varken lösta eller påminda; token död ⇒ inget löses alls', () => {
  const konto = { id: 'k', namn: 'K', valuta: 'SEK' };
  const minne = { konton: {}, oppna: {
    'annons:1:DISAPPROVED': { typ: 'annons', niva: 'rod', rubrik: 'x', konto: 'k', forst: '2026-09-01T00:00:00Z', larmat: '2026-09-01T00:00:00Z' },
    'konto:z:status:2': { typ: 'konto', niva: 'rod', rubrik: 'y', konto: 'z', forst: '2026-09-01T00:00:00Z', larmat: '2026-09-01T00:00:00Z' },
  }, handelser: [], hjartslag: null };
  // Kontot k lästes inte (rate limit): annonsproblemet står kvar orört. Kontoproblemet på z löses (kontonivån vet vi alltid).
  const r = sammanfoga({ problem: [], minne, nu: NU, konfig: KONFIG, lasta: new Set(['annat']) });
  assert.deepEqual(r.losta.map((l) => l.nyckel), ['konto:z:status:2']);
  assert.ok(r.minne.oppna['annons:1:DISAPPROVED']);
  assert.deepEqual(r.paminnelser, []);
  // Token död: lasta null ⇒ inget löses.
  const t = sammanfoga({ problem: [], minne, nu: NU, konfig: KONFIG, lasta: null });
  assert.deepEqual(t.losta, []);
  assert.equal(Object.keys(t.minne.oppna).length, 2);
});

// ------------------------------------------------------------------ texten

test('formulera: 🔴 pingar Axels två konton, 🟡 och ✅ pingar ingen, tomt ger null — och texten är engelsk trots svenska namn', () => {
  const konto = { id: '1107817401910319', namn: 'Magiborsten UK', valuta: 'SEK' };
  const rod = { nyckel: 'a', typ: 'annons', niva: 'rod', slag: 'tillstand', konto, rubrik: 'Ad `Takoverdrag_SP_4_H1` DISAPPROVED', text: 'Ad `Takoverdrag_SP_4_H1` in `Taköverdraget för Husvagn 6,5 × 3 m | BE ROAS 1.63 | Launch 2026-09-09` was DISAPPROVED by Meta. It is not delivering. Fix or appeal it in Ads Manager (account `MagiBorsten`).' };
  const gul = { nyckel: 'b', typ: 'overspend', niva: 'gul', slag: 'handelse', konto, rubrik: 'x', text: 'Campaign `Båtmotorskyddet 420D | BE ROAS 1.62 | Launch` has spent 4 100 SEK today against a daily budget of 2 000 SEK (2.1×). Meta normally stays within +75 % — was the budget changed today?' };

  assert.equal(formulera({ nu: NU }, KONFIG), null);

  const r = formulera({ nya: [rod], handelser: [gul], losta: [{ nyckel: 'c', rubrik: 'Ad `IBC_GT_1_H1` has an issue' }], nu: NU }, KONFIG);
  assert.deepEqual(r.mentions, ['1469423029783236689', '1543537450335477836']);
  assert.match(r.text, /^🔴 \*\*AD ALERT — 27 Sept? 16:44\*\*\n<@1469423029783236689> <@1543537450335477836>\n1\. Ad `Takoverdrag_SP_4_H1`/);
  assert.match(r.text, /🟡 \*\*Warnings — 27 Sept? 16:44\*\*\n• Campaign/);
  assert.match(r.text, /✅ \*\*Resolved since last check\*\*\n• Ad `IBC_GT_1_H1` has an issue — no longer flagged by Meta\./);
  assert.equal(serUtSomSvenska(r.text), false, 'svenska namn i kodspann räknas inte som svenska');

  const bara = formulera({ handelser: [gul], nu: NU }, KONFIG);
  assert.deepEqual(bara.mentions, []);
  assert.ok(!bara.text.includes('<@'));

  const paminn = formulera({ paminnelser: [{ ...rod, forst: '2026-09-20T05:00:00Z' }], nu: NU }, KONFIG);
  assert.deepEqual(paminn.mentions, ['1469423029783236689', '1543537450335477836'], 'en 🔴 påminnelse pingar också');
  assert.match(paminn.text, /⏰ \*\*Still open\*\* \(reminder, <@1469423029783236689> <@1543537450335477836>\)\n• Ad `Takoverdrag_SP_4_H1`.*Open since 20 Sept? 07:00\./);

  const hj = formulera({ hjartslag: { konton: 7, oppna: 0, olasta: 0 }, nu: NU }, KONFIG);
  assert.equal(hj.text, `💓 Daily check ${tidText(NU)}: 7 ad accounts read, 0 open problems. All quiet.`);
  assert.equal(tidText(NU), '27 Sept 16:44');
  assert.deepEqual(hj.mentions, []);
});

test('hjälparna: tid i Stockholm, tusenmellanslag, kodspann, textdelning, Slack-form', () => {
  assert.equal(dagStockholm(new Date('2026-09-27T22:30:00Z')), '2026-09-28');
  assert.equal(timmeStockholm(new Date('2026-09-27T05:44:00Z')), 7);
  assert.equal(heltal(17307.4), '17 307');
  assert.equal(kod('a `b`  c'), "`a 'b' c`");
  assert.equal(breakEvenUrNamn('IBC | BE-ROAS 1,51 | x'), 1.51);
  assert.equal(breakEvenUrNamn('Mastern'), null);
  const lang = Array.from({ length: 60 }, (_, i) => `rad ${i} ${'x'.repeat(50)}`).join('\n');
  const delar = delaText(lang, 500);
  assert.ok(delar.length > 1);
  assert.ok(delar.every((d) => d.length <= 500));
  assert.equal(delar.join('\n'), lang);
  assert.equal(slackText('🔴 **AD ALERT**\n<@1> <@2>\n1. x'), '🔴 *AD ALERT*\n1. x');
});
