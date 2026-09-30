import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  tolkaInsiktsrad, tolkaBudgethandelse, byggSerie, summa, beslutUrLogg, andringsIndex, episoder,
  kontrollprov, kontrollfaktor, regression, dommaEpisod, dommaHall, hallUrLogg, breakEvenIndex, hinkar, forslag,
  facitNot, familjForDom, kor, brak, plusDagar, bandFor, zonFor, MIN_BEDOMBARA_FORSLAG,
} from '../facit.mjs';
import { planera } from '../rond.mjs';

// Inga filer, inget nät. Serien byggs i minnet.
const SE = '1867947880635861';
const K = '120000000000000001';

/** Dygnsrader för en kampanj: [datum, spend, intäkt, köp]. */
const dygn = (kid, rader) => rader.map(([datum, spend, intakt, kop]) => ({ kampanj_id: kid, namn: 'Testkampanjen | BE ROAS 1.5', datum, spend, kop, intakt }));
const dagar = (fran, n, f) => Array.from({ length: n }, (_, i) => f(plusDagar(fran, i), i));
const LOGG = (over = {}) => ({ datum: '2026-09-10', kampanj_id: K, kampanj_namn: 'Testkampanjen | BE ROAS 1.5', ad_account_id: SE, kod: 'SKALA', gammal_budget: 1000, ny_budget: 1200, genomford: true, roas_3d: 3, spend_3d: 3000, kop_3d: 10, break_even: 1.5, ...over });

test('tolkning: köp och intäkt ur 7d_click, aldrig `value` (visningsköpen) — mätt 2026-09-30, 64 av 739 rader skiljer', () => {
  const r = tolkaInsiktsrad({
    campaign_id: '1', date_start: '2026-09-01', spend: '1643.28',
    actions: [{ action_type: 'omni_purchase', value: '8', '7d_click': '6' }],
    action_values: [{ action_type: 'omni_purchase', value: '4496.4', '7d_click': '3798.4' }],
    purchase_roas: [{ action_type: 'omni_purchase', value: '2.736235', '7d_click': '2.311475' }],
  });
  assert.equal(r.kop, 6);
  assert.equal(r.intakt, 3798.4);
  assert.equal(r.spend, 1643.28);
  // Dygn utan köp: ingen omni_purchase-rad ⇒ 0 köp, 0 intäkt — inte null.
  const tom = tolkaInsiktsrad({ campaign_id: '1', date_start: '2026-09-02', spend: '500' });
  assert.equal(tom.kop, 0);
  assert.equal(tom.intakt, 0);
});

test('aktivitetsloggen: öre → kronor, motorn skiljs från handändringar, dygnet i kontots tidszon', () => {
  const extra = JSON.stringify({ old_value: { old_value: 165000 }, new_value: { new_value: 300000, additional_value: 'Per dag' } });
  const a = tolkaBudgethandelse({ event_type: 'update_campaign_budget', event_time: '2026-09-29T22:30:00+0000', object_id: '9', extra_data: extra, application_name: 'Power Editor' }, 'Europe/Stockholm');
  assert.equal(a.fran_sek, 1650);
  assert.equal(a.till_sek, 3000);
  assert.equal(a.motor, false);
  assert.equal(a.datum, '2026-09-30', '22:30 UTC är nästa dygn i Stockholm');
  const m = tolkaBudgethandelse({ event_type: 'update_campaign_budget', event_time: '2026-09-29T05:55:45+0000', object_id: '9', extra_data: extra, application_name: 'ads MCP server' }, 'Europe/Stockholm');
  assert.equal(m.motor, true);
  assert.equal(tolkaBudgethandelse({ event_type: 'ad_account_billing_charge' }, 'Europe/Stockholm'), null);
});

test('summa: en saknad dygnsrad är noll spend (Meta skriver ingen rad utan leverans) och räknas som nolldygn', () => {
  const s = byggSerie(dygn(K, [['2026-09-01', 100, 300, 1], ['2026-09-03', 200, 400, 2]]));
  const f = summa(s, K, '2026-09-01', '2026-09-03');
  assert.equal(f.spend, 300);
  assert.equal(f.intakt, 700);
  assert.equal(f.dagar, 3);
  assert.equal(f.nolldygn, 1);
});

test('loggen: bara genomförda rader, TRAPPA_STEG_1 (ändrade inget i Meta) och dubbletter räknas inte', () => {
  const b = beslutUrLogg([
    LOGG(),
    LOGG(), // omkörd rond samma dag
    LOGG({ kod: 'SKALA', genomford: false, datum: '2026-09-11' }),
    LOGG({ kod: 'TRAPPA_STEG_1', datum: '2026-09-12' }),
    LOGG({ kod: 'STANG_AV', datum: '2026-09-13', ny_budget: null }),
  ]);
  assert.deepEqual(b.map((x) => `${x.familj}:${x.datum}`), ['HOJ:2026-09-10', 'STANG:2026-09-13']);
});

test('episoder: höjningar i rad med ≤ 3 dygns mellanrum är EN episod (snabbspåret — 68 av 96 höjningar följdes av en ny inom 3 dygn)', () => {
  const b = beslutUrLogg([
    LOGG({ datum: '2026-09-10', gammal_budget: 1000, ny_budget: 1200 }),
    LOGG({ datum: '2026-09-11', gammal_budget: 1200, ny_budget: 1400 }),
    LOGG({ datum: '2026-09-12', gammal_budget: 1400, ny_budget: 1650 }),
    LOGG({ datum: '2026-09-20', gammal_budget: 1650, ny_budget: 1950 }),
    LOGG({ datum: '2026-09-21', kod: 'SANK', gammal_budget: 1950, ny_budget: 1550 }),
  ]);
  const e = episoder(b, andringsIndex([], b));
  assert.equal(e.length, 3);
  assert.equal(e[0].start, '2026-09-10');
  assert.equal(e[0].slut, '2026-09-12');
  assert.equal(e[0].fran, 1000);
  assert.equal(e[0].till, 1650);
  assert.equal(e[1].familj, 'HOJ');
  assert.equal(e[2].familj, 'SANK');
});

test('episoder: en handändring mellan två höjningar bryter kedjan', () => {
  const b = beslutUrLogg([LOGG({ datum: '2026-09-10' }), LOGG({ datum: '2026-09-12', gammal_budget: 1500, ny_budget: 1800 })]);
  const index = andringsIndex([{ kampanj_id: K, datum: '2026-09-11', fran_sek: 1200, till_sek: 1500, motor: false }], b);
  assert.equal(episoder(b, index).length, 2);
});

test('regression: skärningspunkten är ROAS-driften vid oförändrad spend', () => {
  const r = regression([{ x: 0, y: Math.log(0.5), w: 1 }, { x: Math.log(2), y: Math.log(0.5) + 0.3 * Math.log(2), w: 1 }]);
  assert.ok(Math.abs(Math.exp(r.a) - 0.5) < 1e-9);
  assert.ok(Math.abs(r.b - 0.3) < 1e-9);
  const platt = regression([{ x: 0, y: Math.log(0.8), w: 1 }, { x: 0, y: Math.log(0.8), w: 3 }]);
  assert.equal(platt.b, 0);
});

/** Bygger en marknad med N kontrollkampanjer vars ROAS faller till `drift` × före, oavsett spend. */
function kontrollMarknad({ n = 6, drift = 0.6, roas = 3.2, fran = '2026-08-20', antal = 40 } = {}) {
  const rader = [];
  for (let c = 0; c < n; c++) {
    const kid = `K${c}`;
    rader.push(...dygn(kid, dagar(fran, antal, (d, i) => {
      // Varannan vecka "topp" (roas) och annars roas × drift — ger regression i bandet.
      const topp = Math.floor((i + c) / 4) % 2 === 0;
      const spend = 1000 + 50 * c;
      return [d, spend, spend * (topp ? roas : roas * drift), 5];
    })));
  }
  return rader;
}

test('kontrollen: kampanjen som bedöms räknas aldrig in i sin egen kontroll, och k = 1 sägs öppet när bandet är tomt', () => {
  const s = byggSerie(kontrollMarknad());
  const logg = ['K0', 'K1', 'K2', 'K3', 'K4', 'K5'].map((kid) => LOGG({ kampanj_id: kid, kod: 'LAT_VARA', genomford: false }));
  const prov = kontrollprov(s, breakEvenIndex(logg), { marknadFor: () => 'SE', since: '2026-08-20', until: '2026-09-28', h: 7 });
  assert.ok(prov.length > 30);
  const utan = kontrollfaktor(prov, { band: '≥2,0', marknad: 'SE', utom: 'K0' });
  assert.ok(!utan.saknas);
  assert.ok(utan.kampanjer <= 5, 'K0 räknas inte');
  const tom = kontrollfaktor(prov, { band: '<0,8', marknad: 'NO', utom: null });
  assert.equal(tom.k, 1);
  assert.equal(tom.saknas, true);
});

function ctxFor(serieRader, logg, { until = '2026-09-29', since = '2026-08-20', prov = null, andringar = [] } = {}) {
  const serie = byggSerie(serieRader);
  const beslut = beslutUrLogg(logg);
  const index = andringsIndex(andringar, beslut);
  const beIndex = breakEvenIndex(logg);
  const p = prov ?? { kort: [], lang: [] };
  return { serie, index, prov: p, until, since, idag: plusDagar(until, 1), beIndex, beslut };
}

test('höjning RÄTT: de tillagda kronorna gav mer än break-even (k = 1 utan kontroll, sägs i raden)', () => {
  // Före: 1 000 kr/dygn på ROAS 3 (band ≥ 2,0 mot BE 1,5). Efter: 2 000 kr/dygn på ROAS 2,4 ⇒ +1 000 kr gav +1 800 kr ⇒ marginal 1,8 ≥ 1,5.
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 10]), ['2026-09-10', 1500, 4000, 12], ...dagar('2026-09-11', 7, (d) => [d, 2000, 4800, 16])]);
  const logg = [LOGG({ gammal_budget: 1000, ny_budget: 2000 })];
  const ctx = ctxFor(s, logg);
  const [ep] = episoder(ctx.beslut, ctx.index);
  const r = dommaEpisod(ep, 'lang', ctx);
  assert.equal(r.dom, 'RATT');
  assert.equal(r.marginal_roas, 1.8);
  assert.equal(r.delta_vinst_kr, Math.round(((1800 / 1.5) - 1000) * 7));
  assert.equal(r.kontroll, 'saknas');
  assert.equal(r.k, 1);
  assert.equal(r.bedombar, true);
  assert.equal('ny_budget' in r, false, 'facit bär aldrig ny_budget');
  assert.equal('gammal_budget' in r, false, 'facit bär aldrig gammal_budget (etikettens budgetHojdUrLogg läser det fältet)');
});

test('höjning FEL: marginal-ROAS under break-even — och kontrollen vänder domen när hela bandet föll lika mycket', () => {
  // Efter: 2 000 kr/dygn på ROAS 1,6 ⇒ intäkt 3 200 mot 3 000 före ⇒ marginal 0,2 (utan kontroll).
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 10]), ['2026-09-10', 1500, 3000, 10], ...dagar('2026-09-11', 7, (d) => [d, 2000, 3200, 11])]);
  const logg = [LOGG({ gammal_budget: 1000, ny_budget: 2000 })];
  const ctx = ctxFor(s, logg);
  const [ep] = episoder(ctx.beslut, ctx.index);
  const utan = dommaEpisod(ep, 'lang', ctx);
  assert.equal(utan.dom, 'FEL');
  // Med en kontroll som säger att kampanjer i bandet faller till 0,4 × av sig själva
  // hade gammal budget gett 1 200 kr/dygn ⇒ de nya 1 000 kr gav 2 000 kr ⇒ marginal 2,0 ⇒ RÄTT.
  const prov = Array.from({ length: 20 }, (_, i) => ({ kampanj_id: `A${i % 6}`, marknad: 'SE', band: '≥2,0', x: 0, y: Math.log(0.4), w: 1000 }));
  const med = dommaEpisod(ep, 'lang', { ...ctx, prov: { kort: prov, lang: prov } });
  assert.equal(med.k, 0.4);
  assert.equal(med.marginal_roas, 2);
  assert.equal(med.dom, 'RATT');
});

test('grinden gäller deltat: flyttade kronor under 3 × break-even-CPA ⇒ FOR_LITE_DATA; spenden steg inte ⇒ UTAN_EFFEKT', () => {
  // AOV 300 ⇒ break-even-CPA 200 ⇒ grinden 600 kr. +50 kr/dygn × 7 = 350 kr flyttat.
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 10]), ['2026-09-10', 1000, 3000, 10], ...dagar('2026-09-11', 7, (d) => [d, 1050, 3000, 10])]);
  const ctx = ctxFor(s, [LOGG()]);
  const r = dommaEpisod(episoder(ctx.beslut, ctx.index)[0], 'lang', ctx);
  assert.equal(r.dom, 'FOR_LITE_DATA');
  assert.equal(r.bedombar, false);
  const s2 = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 10]), ...dagar('2026-09-10', 8, (d) => [d, 980, 2900, 10])]);
  const ctx2 = ctxFor(s2, [LOGG()]);
  assert.equal(dommaEpisod(episoder(ctx2.beslut, ctx2.index)[0], 'lang', ctx2).dom, 'UTAN_EFFEKT');
});

test('ett fönster som inte stängt döms inte (null), och en handändring i fönstret kapar det — under 3 dygn kvar ⇒ STORD', () => {
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 10]), ...dagar('2026-09-10', 8, (d) => [d, 2000, 4800, 16])]);
  const logg = [LOGG({ gammal_budget: 1000, ny_budget: 2000 })];
  const ctx = ctxFor(s, logg, { until: '2026-09-15' });
  const [ep] = episoder(ctx.beslut, ctx.index);
  assert.equal(dommaEpisod(ep, 'lang', ctx), null, 'D+7 = 09-17 har inte hänt');
  const ctx2 = ctxFor(s, logg, { andringar: [{ kampanj_id: K, datum: '2026-09-12', fran_sek: 2000, till_sek: 4000, motor: false }] });
  const r = dommaEpisod(episoder(ctx2.beslut, ctx2.index)[0], 'lang', ctx2);
  assert.equal(r.dom, 'STORD');
  assert.match(r.orsak, /handändring/);
});

test('avstängning: kontrafaktiskt och märkt osäker; återstartad kampanj syns i raden', () => {
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 900, 3]), ['2026-09-10', 400, 300, 1], ['2026-09-14', 500, 1500, 4]]);
  const logg = [LOGG({ kod: 'STANG_AV', ny_budget: null })];
  const ctx = ctxFor(s, logg);
  const r = dommaEpisod(episoder(ctx.beslut, ctx.index)[0], 'lang', ctx);
  assert.equal(r.dom, 'RATT', 'ROAS 0,9 mot break-even 1,5 — de borttagna kronorna gick back');
  assert.match(r.osaker, /kontrafaktiskt/);
  assert.equal(r.aterstartad.spend, 500);
});

test('hållbeslut: över target / mellan / i förlust, fönstret kapas vid nästa ändring', () => {
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 1700, 6]), ...dagar('2026-09-10', 8, (d) => [d, 1000, 1200, 4])]);
  const logg = [LOGG({ kod: 'LAT_VARA', genomford: false, ny_budget: null })];
  const ctx = ctxFor(s, logg);
  const [h] = dommaHall(hallUrLogg(logg), 7, ctx);
  assert.equal(h.familj, 'HALL_MELLAN', 'ROAS 1,7 ligger mellan break-even 1,5 och target 2,5');
  assert.equal(h.utfall, 'FOLL_UNDER');
  assert.ok(h.forlust_kr > 0);
});

test('hinkarna: bara bedömbara episoder bär kronor, och bråket skrivs utan procent under 10 fall', () => {
  const rad = (over) => ({ familj: 'HOJ', horisont: 'lang', kampanj_id: K, zon: '1 000–2 000', band: '≥2,0', marknad: 'SE', dom: 'RATT', bedombar: true, delta_vinst_kr: 100, flyttat_kr: 1000, delta_spend_dag: 100, delta_intakt_dag: 200, break_even: 1.5, efter: { dagar: 7 }, ...over });
  const h = hinkar([rad(), rad({ dom: 'FEL', delta_vinst_kr: -50 }), rad({ dom: 'FOR_LITE_DATA', bedombar: false, delta_vinst_kr: 999 })]);
  const b = h['HOJ|alla|alla'];
  assert.equal(b.episoder, 3);
  assert.equal(b.bedombara, 2);
  assert.equal(b.delta_vinst_kr, 50);
  assert.equal(b.for_lite_data, 1);
  assert.equal(brak(7, 9), '7/9');
  assert.equal(brak(7, 10), '7/10 (70 %)');
});

test(`förslag kräver ${MIN_BEDOMBARA_FORSLAG} bedömbara episoder och pekar på en konstant — facit verkställer aldrig`, () => {
  const b = (n, ratt, vinst) => ({ familj: 'HOJ', dimension: 'forsta_steg', varde: '+>60 %', episoder: n, bedombara: n, ratt, fel: n - ratt, delta_vinst_kr: vinst, flyttat_kr: 10000, marginal_roas: 2.2, break_even_viktad: 1.6 });
  assert.equal(forslag({ hinkar: { x: b(MIN_BEDOMBARA_FORSLAG - 1, 7, 5000) }, hall: {} }).length, 0);
  const [f] = forslag({ hinkar: { x: b(MIN_BEDOMBARA_FORSLAG, 7, 5000) }, hall: {} });
  assert.equal(f.typ, 'GASA');
  assert.match(f.konstant, /TRAPPA/);
});

test('facitNot ändrar aldrig domen, och planera ger samma plan med och utan facit', () => {
  const kal = { hinkar: { lang: { 'HOJ|zon|1 000–2 000': { familj: 'HOJ', dimension: 'zon', varde: '1 000–2 000', bedombara: 6, ratt: 4, delta_vinst_kr: 1200, marginal_roas: 1.9 } } }, hall: { lang: {} }, forslag: [] };
  const rad = { id: K, namn: 'Testkampanjen | BE ROAS 1.5', budget: 1500, roas3d: 4, dom: { kod: 'SKALA', rubrik: 'Skala', motivering: 'm', nyBudget: 1800, kraverGodkannande: true, naraGrans: false, breakEven: 1.5 } };
  const fore = JSON.stringify(rad.dom);
  const not = facitNot(kal, rad);
  assert.equal(JSON.stringify(rad.dom), fore, 'facitNot är ren');
  assert.match(not.text, /4\/6 rätt/);
  const med = { ...rad, dom: { ...rad.dom, facit: not } };
  const utanPlan = planera([rad], { logg: [], idag: '2026-09-30' });
  const medPlan = planera([med], { logg: [], idag: '2026-09-30' });
  assert.equal(utanPlan.atgarder.length, 1);
  assert.equal(utanPlan.atgarder[0].till_sek, 1800);
  assert.deepEqual(medPlan, utanPlan, 'hela planen är identisk med och utan facit');
});

test('familjen för dagens dom: höjning, sänkning, avstängning och de tre väntelägena', () => {
  const r = (kod, roas3d) => ({ roas3d, dom: { kod, breakEven: 1.5 } });
  assert.equal(familjForDom(r('SKALA', 4)), 'HOJ');
  assert.equal(familjForDom(r('HALVERA', 1)), 'SANK');
  assert.equal(familjForDom(r('ATGARDSTRAPPAN', 1)), 'STANG');
  assert.equal(familjForDom(r('LAT_VARA', 3)), 'HALL_HOG');
  assert.equal(familjForDom(r('LAT_VARA', 1.8)), 'HALL_MELLAN');
  assert.equal(familjForDom(r('RAKNA_BACKDAGAR', 1)), 'HALL_FORLUST');
  assert.equal(familjForDom(r('FOR_LITE_DATA', 1)), null, 'för lite data är inget val');
});

test('hela körningen: en episod skrivs en gång per horisont — sparade nycklar hoppas', () => {
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 10]), ...dagar('2026-09-10', 20, (d) => [d, 2000, 4800, 16])]);
  const data = { SE: { dygn: s, budgetandringar: [], since: '2026-08-20', until: '2026-09-29' } };
  const logg = [LOGG({ gammal_budget: 1000, ny_budget: 2000 })];
  const forsta = kor({ logg, data, idag: '2026-09-30' });
  assert.deepEqual(forsta.nya.map((r) => r.horisont).sort(), ['kort', 'lang']);
  const andra = kor({ logg, data, idag: '2026-09-30', sparade: forsta.nya });
  assert.equal(andra.nya.length, 0);
  assert.ok(forsta.kalibrering.hinkar.lang['HOJ|alla|alla']);
});

test('band och zon följer motorns gränser', () => {
  assert.equal(bandFor(3, 1.5), '≥2,0');
  assert.equal(bandFor(1.4, 1.5), '0,8–1,0');
  assert.equal(bandFor(null, 1.5), 'okänd');
  assert.equal(zonFor(4000), '≥4 000');
  assert.equal(zonFor(999), '<1 000');
});
