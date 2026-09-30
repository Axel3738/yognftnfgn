import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  tolkaInsiktsrad, tolkaBudgethandelse, byggSerie, summa, beslutUrLogg, andringsIndex, episoder,
  kontrollprov, kontrollfaktor, regression, dommaEpisod, dommaHall, hallUrLogg, breakEvenIndex, hinkar, forslag,
  facitNot, familjForDom, kor, brak, plusDagar, bandFor, zonFor, MIN_KAMPANJER_FORSLAG, KALIBRERING_SCHEMA,
  sagtand, placeboSammanfattning, kalibrering, FORSLAG_DAGAR_I_RAD, statusEngelska,
} from '../facit.mjs';
import { planera, laddaFacit } from '../rond.mjs';

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

test('regression: efter-ROAS = a + b·(ROAS före) + c·(spendens flytt) — b < 1 är regressionen mot medelvärdet', () => {
  const prov = [];
  for (const q of [0.6, 1, 1.4, 2, 2.6, 3.2]) for (const x of [0, 0.4, -0.2]) prov.push({ q, x, y: 0.2 + 0.5 * q + 0.1 * x, w: 1 + q });
  const r = regression(prov);
  assert.ok(Math.abs(r.a - 0.2) < 1e-9);
  assert.ok(Math.abs(r.b - 0.5) < 1e-9);
  assert.ok(Math.abs(r.c - 0.1) < 1e-9);
  const platt = regression([{ q: 1, x: 0, y: 0.8, w: 1 }, { q: 1, x: 0, y: 0.8, w: 3 }, { q: 1, x: 0, y: 0.8, w: 2 }]);
  assert.equal(platt.b, 0);
  assert.ok(Math.abs(platt.a - 0.8) < 1e-9);
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
  const utan = kontrollfaktor(prov, { q: 2, marknad: 'SE', utom: 'K0' });
  assert.ok(!utan.saknas);
  assert.ok(utan.kampanjer <= 5, 'K0 räknas inte');
  assert.ok(utan.kvot < 2, 'en topp förväntas falla tillbaka');
  const tom = kontrollfaktor(prov.filter((p) => p.kampanj_id === 'K0'), { q: 2, marknad: 'NO', utom: null });
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

/** Kontrollprov där efter-ROAS = k × före-ROAS (a = 0, b = k): en kampanj faller till k × av sig själv. */
const provMedK = (k) => { const p = Array.from({ length: 24 }, (_, i) => { const q = 0.5 + (i % 8) * 0.4; return { kampanj_id: `A${i % 6}`, marknad: 'SE', band: '—', x: 0, q, y: k * q, w: 1000 }; }); return { kort: p, lang: p }; };

test('höjning: kontrafaktiskt = före-ROAS × k — de tillagda kronorna jämförs med vad gammal budget hade gett', () => {
  // Före: 1 000 kr/dygn på ROAS 3 (band ≥ 2,0 mot BE 1,5). Efter (D+1..D+7): 2 000 kr/dygn på ROAS 2,4.
  // k = 1 ⇒ gammal budget hade gett 3 000/dygn ⇒ +1 000 kr gav +1 800 kr ⇒ marginal 1,8 ≥ 1,5.
  // 300 köp per dygn: nog för att intervallet ska ligga helt över noll (med 30 är det OSÄKERT — se brustestet).
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 300]), ...dagar('2026-09-10', 8, (d) => [d, 2000, 4800, 480])]);
  const ctx = ctxFor(s, [LOGG({ gammal_budget: 1000, ny_budget: 2000 })], { prov: provMedK(1) });
  const r = dommaEpisod(episoder(ctx.beslut, ctx.index)[0], 'lang', ctx);
  assert.equal(r.efter.fran, '2026-09-11', 'efter-fönstret börjar dagen efter första steget');
  assert.equal(r.marginal_roas, 1.8);
  assert.equal(r.delta_vinst_kr, Math.round((1800 / 1.5 - 1000) * 7));
  assert.ok(r.intervall_80[0] < r.delta_vinst_kr && r.delta_vinst_kr < r.intervall_80[1]);
  assert.equal(r.dom, 'RATT', 'med 480 köp per dygn är intervallet smalt');
  assert.equal('ny_budget' in r, false, 'facit bär aldrig ny_budget');
  assert.equal('gammal_budget' in r, false, 'facit bär aldrig gammal_budget (etikettens budgetHojdUrLogg läser det fältet)');
});

test('regressionen mot medelvärdet: samma utfall är FEL utan kontroll och RÄTT när bandet föll lika mycket av sig självt', () => {
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 30]), ...dagar('2026-09-10', 8, (d) => [d, 2000, 3200, 32])]);
  const logg = [LOGG({ gammal_budget: 1000, ny_budget: 2000 })];
  const utan = dommaEpisod(episoder(beslutUrLogg(logg), andringsIndex([], beslutUrLogg(logg)))[0], 'lang', ctxFor(s, logg, { prov: provMedK(1) }));
  assert.equal(utan.dom, 'FEL');
  // Kampanjer i bandet faller till 0,4 × av sig själva ⇒ gammal budget hade gett 1 200/dygn ⇒ de nya 1 000 kr gav 2 000 ⇒ marginal 2,0.
  const med = dommaEpisod(episoder(beslutUrLogg(logg), andringsIndex([], beslutUrLogg(logg)))[0], 'lang', ctxFor(s, logg, { prov: provMedK(0.4) }));
  assert.equal(med.k, 0.4);
  assert.equal(med.marginal_roas, 2);
  assert.equal(med.dom, 'RATT');
});

test('bruset: få köp ⇒ OSÄKER, aldrig en dom på slantsingling (kritiken 2026-09-30: 2 av 15 höjningar hade ett intervall som uteslöt break-even)', () => {
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 3]), ...dagar('2026-09-10', 8, (d) => [d, 2000, 4000, 4])]);
  const ctx = ctxFor(s, [LOGG({ gammal_budget: 1000, ny_budget: 2000 })], { prov: provMedK(1) });
  const r = dommaEpisod(episoder(ctx.beslut, ctx.index)[0], 'lang', ctx);
  assert.equal(r.dom, 'OSAKER');
  assert.equal(r.bedombar, true, 'mätt — men osäker');
  assert.ok(r.intervall_80[0] < 0 && r.intervall_80[1] > 0);
});

test('ingen kontroll i bandet ⇒ UNG (aldrig k = 1 i tysthet); lanseringsdygn i före-fönstret ⇒ LANSERINGSFAS', () => {
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 30]), ...dagar('2026-09-10', 8, (d) => [d, 2000, 4800, 48])]);
  const ctx = ctxFor(s, [LOGG({ gammal_budget: 1000, ny_budget: 2000 })]);
  assert.equal(dommaEpisod(episoder(ctx.beslut, ctx.index)[0], 'lang', ctx).dom, 'UNG');
  const lansering = dygn(K, [['2026-09-09', 1000, 3000, 30], ...dagar('2026-09-10', 8, (d) => [d, 2000, 4800, 48])]);
  const ctx2 = ctxFor(lansering, [LOGG({ gammal_budget: 1000, ny_budget: 2000 })], { prov: provMedK(1) });
  assert.equal(dommaEpisod(episoder(ctx2.beslut, ctx2.index)[0], 'lang', ctx2).dom, 'LANSERINGSFAS');
});

test('ett fönster som inte stängt och mognat döms inte (null); en handändring kapar fönstret — under 3 dygn kvar ⇒ STORD', () => {
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 30]), ...dagar('2026-09-10', 8, (d) => [d, 2000, 4800, 48])]);
  const logg = [LOGG({ gammal_budget: 1000, ny_budget: 2000 })];
  const ctx = ctxFor(s, logg, { until: '2026-09-18', prov: provMedK(1) });
  assert.equal(dommaEpisod(episoder(ctx.beslut, ctx.index)[0], 'lang', ctx), null, 'D+7 = 09-17 + 3 dygns mognad > 09-18');
  const ctx2 = ctxFor(s, logg, { prov: provMedK(1), andringar: [{ kampanj_id: K, datum: '2026-09-13', fran_sek: 2000, till_sek: 4000, motor: false }] });
  const r = dommaEpisod(episoder(ctx2.beslut, ctx2.index)[0], 'lang', ctx2);
  assert.equal(r.dom, 'STORD');
  assert.match(r.orsak, /handändring/);
});

test('motorns egen sänkning inom fönstret ⇒ AVBRUTEN, räknad fram till avbrottet (överlevarfelet: förut föll de bort)', () => {
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 30]), ...dagar('2026-09-10', 12, (d) => [d, 2000, 2400, 24])]);
  const logg = [LOGG({ gammal_budget: 1000, ny_budget: 2000 }), LOGG({ datum: '2026-09-15', kod: 'SANK', gammal_budget: 2000, ny_budget: 1600 })];
  const ctx = ctxFor(s, logg, { prov: provMedK(1) });
  const hoj = episoder(ctx.beslut, ctx.index).find((e) => e.familj === 'HOJ');
  const r = dommaEpisod(hoj, 'lang', ctx);
  assert.equal(r.avbruten, true);
  assert.equal(r.efter.till, '2026-09-14');
  assert.equal(r.dom, 'FEL', '1 000 extra kr gav −600 kr per dygn');
});

test('avstängning: ingen kontrafaktisk dom — bara det som faktiskt hände (återstart och utfallet efter)', () => {
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 900, 3]), ['2026-09-10', 400, 300, 1], ['2026-09-14', 500, 1500, 4]]);
  const logg = [LOGG({ kod: 'STANG_AV', ny_budget: null })];
  const ctx = ctxFor(s, logg, { prov: provMedK(1.5) });
  const r = dommaEpisod(episoder(ctx.beslut, ctx.index)[0], 'lang', ctx);
  assert.equal(r.dom, 'REGISTRERAD');
  assert.equal(r.bedombar, false);
  assert.equal(r.aterstartad.spend, 500);
  assert.equal(r.aterstartad.vinst_kr, Math.round(1500 / 1.5 - 500));
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

test('hinkarna: bara mätta episoder bär kronor; median, "utan största kampanjen" och klusterintervall — och bråk utan procent under 10 fall', () => {
  const rad = (over) => ({ familj: 'HOJ', horisont: 'lang', kampanj_id: K, zon: '1 000–2 000', band: '≥2,0', marknad: 'SE', dom: 'RATT', bedombar: true, delta_vinst_kr: 100, flyttat_kr: 1000, delta_spend_kr: 1000, delta_intakt_kr: 2000, break_even: 1.5, ...over });
  const h = hinkar([rad(), rad({ dom: 'FEL', delta_vinst_kr: -50, kampanj_id: 'B' }), rad({ dom: 'OSAKER', delta_vinst_kr: 5000, kampanj_id: 'C' }), rad({ dom: 'LANSERINGSFAS', bedombar: false, delta_vinst_kr: 999 })]);
  const b = h['HOJ|alla|alla'];
  assert.equal(b.episoder, 4);
  assert.equal(b.bedomda, 3);
  assert.equal(b.ej_bedomda, 1);
  assert.equal(b.delta_vinst_kr, 5050);
  assert.equal(b.utan_storsta_kr, 50, 'den största kampanjen (C, +5 000) räknas bort');
  assert.equal(b.median_kr, 100);
  assert.equal(b.bedomda_kampanjer, 3);
  assert.ok(Array.isArray(b.intervall_80));
  assert.equal(brak(7, 9), '7/9');
  assert.equal(brak(7, 10), '7/10 (70 %)');
});

test(`förslag kräver ${MIN_KAMPANJER_FORSLAG} OLIKA kampanjer, intervall på ena sidan om noll, samma tecken utan största kampanjen och i kort horisont — och verkställs aldrig`, () => {
  const b = (kampanjer, over = {}) => ({ familj: 'HOJ', dimension: 'forsta_steg', varde: '+>60 %', episoder: 12, bedomda: 12, bedomda_kampanjer: kampanjer, ratt: 6, fel: 1, osakra: 5, delta_vinst_kr: 5000, intervall_80: [1000, 9000], median_kr: 300, utan_storsta_kr: 2000, marginal_roas: 2.2, break_even_viktad: 1.6, ...over });
  const kort = { 'HOJ|forsta_steg|+>60 %': { delta_vinst_kr: 800 } };
  assert.equal(forslag({ hinkar: { x: b(MIN_KAMPANJER_FORSLAG - 1) }, hinkarKort: kort, hall: {} }).length, 0, 'för få olika kampanjer');
  assert.equal(forslag({ hinkar: { x: b(MIN_KAMPANJER_FORSLAG, { intervall_80: [-500, 9000] }) }, hinkarKort: kort, hall: {} }).length, 0, 'intervallet korsar noll');
  assert.equal(forslag({ hinkar: { x: b(MIN_KAMPANJER_FORSLAG, { utan_storsta_kr: -10 }) }, hinkarKort: kort, hall: {} }).length, 0, 'vilar på en kampanj');
  assert.equal(forslag({ hinkar: { x: b(MIN_KAMPANJER_FORSLAG) }, hinkarKort: { 'HOJ|forsta_steg|+>60 %': { delta_vinst_kr: -1 } }, hall: {} }).length, 0, 'kort horisont säger emot');
  const [f] = forslag({ hinkar: { x: b(MIN_KAMPANJER_FORSLAG) }, hinkarKort: kort, hall: {} });
  assert.equal(f.typ, 'GASA');
  assert.match(f.konstant, /TRAPPA/);
});

test(`ett förslag når Axel först efter ${FORSLAG_DAGAR_I_RAD} morgnar i rad, med godkänt placebo, och aldrig på en delvis dag`, () => {
  const rad = (kampanj_id, v) => ({ familj: 'HOJ', horisont: 'lang', kampanj_id, forsta_steg: '+≤25 %', zon: '1 000–2 000', band: '≥2,0', marknad: 'SE', total: '+≤25 %', kedja: '1 steg', regelverk: 'x', produkt: kampanj_id, dom: 'RATT', bedombar: true, delta_vinst_kr: v, flyttat_kr: 1000, delta_spend_kr: 1000, delta_intakt_kr: 2500, break_even: 1.5 });
  const alla = Array.from({ length: 10 }, (_, i) => [rad(`K${i}`, 1000 + i), { ...rad(`K${i}`, 800), horisont: 'kort' }]).flat();
  const bra = Array.from({ length: 20 }, (_, i) => ({ kampanj_id: `P${i % 10}`, delta_vinst_kr: i % 2 ? 50 : -50, dom: 'OSAKER' }));
  let kal = null;
  for (let dag = 1; dag <= FORSLAG_DAGAR_I_RAD; dag++) {
    kal = kalibrering(alla, { kort: [], lang: [] }, { idag: plusDagar('2026-10-01', dag), placeboRader: bra, tidigare: kal });
    assert.equal(kal.forslag.length, dag >= FORSLAG_DAGAR_I_RAD ? kal.kandidater.length : 0, `dag ${dag}`);
  }
  assert.ok(kal.forslag.length > 0);
  const delvis = kalibrering(alla, { kort: [], lang: [] }, { idag: plusDagar('2026-10-01', 8), placeboRader: bra, tidigare: kal, delvis: true });
  assert.equal(delvis.forslag.length, 0);
  const skevt = kalibrering(alla, { kort: [], lang: [] }, { idag: plusDagar('2026-10-01', 8), placeboRader: bra.map((p) => ({ ...p, delta_vinst_kr: -900 })), tidigare: kal });
  assert.equal(skevt.placebo.godkant, false);
  assert.equal(skevt.forslag.length, 0, 'underkänt placebo ⇒ inga förslag');
});

test('facitNot ändrar aldrig domen, och planera ger samma plan med och utan facit', () => {
  const kal = { hinkar: { lang: { 'HOJ|zon|1 000–2 000': { familj: 'HOJ', dimension: 'zon', varde: '1 000–2 000', bedomda: 6, bedomda_kampanjer: 5, ratt: 4, fel: 1, osakra: 1, delta_vinst_kr: 1200, intervall_80: [200, 2400], marginal_roas: 1.9 } } }, hall: { lang: {} }, forslag: [{ nyckel: 'HOJ|zon|1 000–2 000', typ: 'GASA' }] };
  const rad = { id: K, namn: 'Testkampanjen | BE ROAS 1.5', budget: 1500, roas3d: 4, dom: { kod: 'SKALA', rubrik: 'Skala', motivering: 'm', nyBudget: 1800, kraverGodkannande: true, naraGrans: false, breakEven: 1.5 } };
  const fore = JSON.stringify(rad.dom);
  const not = facitNot(kal, rad);
  assert.equal(JSON.stringify(rad.dom), fore, 'facitNot är ren');
  assert.match(not.text, /4 rätt, 1 fel, 1 osäkra på 5 kampanjer/);
  assert.doesNotMatch(not.text, /GASA|BROMSA|förslag|⚑|skala mer|sänk/i, 'noten är rena siffror — inga förslag eller verb bredvid dagens beslut');
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

test('laddaFacit kastar aldrig: skräpkalibrering, fel schema och en modul som kastar ger en varning — och planen är identisk (kritiken 2026-09-30: `forslag: {}` gav RONDEN AVBRÖTS)', async () => {
  const rad = () => ({ id: K, namn: 'Testkampanjen | BE ROAS 1.5', budget: 1500, roas3d: 4, dom: { kod: 'SKALA', rubrik: 'Skala', motivering: 'm', nyBudget: 1800, kraverGodkannande: true, naraGrans: false, breakEven: 1.5 } });
  const utanPlan = planera([rad()], { logg: [], idag: '2026-09-30' });
  const skrap = [
    { schema: KALIBRERING_SCHEMA, skapad: '2026-09-30', hinkar: { lang: { 'HOJ|zon|1 000–2 000': { bedomda_kampanjer: 9 } } }, hall: { lang: { 'HALL_HOG|kod|LAT_VARA': { kampanjdygn: 99 } } }, forslag: {} },
    { schema: 1, skapad: '2026-09-30', hinkar: { lang: {} } },
    { schema: KALIBRERING_SCHEMA, skapad: '2026-01-01', hinkar: { lang: {} } },
    { schema: KALIBRERING_SCHEMA, skapad: '2026-09-30', hinkar: { lang: null } },
    null,
  ];
  for (const kal of skrap) {
    const rader = [rad()];
    const varningar = [];
    await assert.doesNotReject(() => laddaFacit(rader, '2026-09-30', varningar, { kal }));
    assert.deepEqual(planera(rader, { logg: [], idag: '2026-09-30' }), utanPlan);
  }
  const varningar = [];
  const ut = await laddaFacit([rad()], '2026-09-30', varningar, { kal: skrap[0], modul: { KALIBRERING_SCHEMA, facitNot: () => { throw new Error('bom'); }, status: () => { throw new Error('bom'); } } });
  assert.ok(ut, 'ronden får ett facit-block även när en rad felar');
  assert.ok(varningar.some((v) => /bom/.test(v)));
});

test('sågtanden: höjning följd av motorns egen sänkning inom 7 dygn räknas — en handändring räknas inte som motorns', () => {
  const logg = [LOGG({ datum: '2026-09-10' }), LOGG({ datum: '2026-09-14', kod: 'SANK', gammal_budget: 1200, ny_budget: 960 }), LOGG({ kampanj_id: 'B', datum: '2026-09-10' })];
  const b = beslutUrLogg(logg);
  const index = andringsIndex([{ kampanj_id: 'B', datum: '2026-09-12', fran_sek: 1200, till_sek: 900, motor: false }], b);
  const r = sagtand(episoder(b, index), index, { until: '2026-09-29', marknad: 'SE' });
  assert.equal(r.find((x) => x.kampanj_id === K).vande, true);
  assert.equal(r.find((x) => x.kampanj_id === K).dagar, 4);
  assert.equal(r.find((x) => x.kampanj_id === 'B').vande, false, 'Axels egen sänkning är inte motorns vändning');
});

test('motorn = ändringen som står i budgetloggen, inte appens namn; en skapad budget är varken höjning eller störning', () => {
  const s = dygn(K, dagar('2026-09-01', 20, (d) => [d, 1000, 3000, 30]));
  const data = { SE: { dygn: s, since: '2026-08-20', until: '2026-09-29', budgetandringar: [
    { kampanj_id: K, datum: '2026-09-10', fran_sek: 1000, till_sek: 1200, app: 'ads MCP server', motor: true },
    { kampanj_id: K, datum: '2026-09-12', fran_sek: 1200, till_sek: 2400, app: 'ads MCP server', motor: true }, // annan session, inte i loggen
    { kampanj_id: 'NY', datum: '2026-09-12', fran_sek: null, till_sek: 1000, app: 'ads MCP server', motor: true, skapad: true },
  ] } };
  const u = kor({ logg: [LOGG()], data, idag: '2026-09-30' });
  assert.equal(data.SE.budgetandringar[0].motor, true);
  assert.equal(data.SE.budgetandringar[1].motor, false, 'inte i budgetloggen ⇒ inte motorns');
  assert.equal(data.SE.budgetandringar[2].motor, false);
  assert.equal(u.kalibrering.statistik.SE.handandringar, 2);
});

test('Discord-raden på engelska bär inga kronor och ingen break-even (redigerarna läser #scaling)', () => {
  const kal = { skapad: '2026-10-01', hinkar: { lang: { 'HOJ|alla|alla': { bedomda: 9, bedomda_kampanjer: 8, ratt: 1, fel: 2, osakra: 6, delta_vinst_kr: -12850 } } }, sagtand: { 'alla|alla': { vande: 20, hojningar: 29 } }, forslag: [] };
  const txt = statusEngelska(kal).join('\n');
  assert.doesNotMatch(txt, /SEK|kr\b|break-even|ROAS|12[ ,.]?850/);
  assert.match(txt, /1 paid off, 2 did not, 6 too close to call/);
});

/** Deterministisk Poisson (Knuth) med seedad slump. */
function poisson(lambda, r) { const L = Math.exp(-lambda); let k = 0; let p = 1; do { k += 1; p *= r(); } while (p > L); return k - 1; }
function lcg(fro) { let a = fro >>> 0; return () => { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return a / 4294967296; }; }

test('simulering med känt facit: sann marginal-ROAS = break-even (sann vinst 0) — mätaren hamnar nära noll, medan den naiva jämförelsen (k = 1) kallar höjningarna förlust', () => {
  // 16 kampanjer, sann ROAS exakt break-even 1,5 för varje krona — varje höjning är värd 0 kr.
  // Köpen är Poisson-brus (AOV 600, ~2,5 köp per dygn). Motorn höjer +50 % när tre dygns ROAS ≥ 2,4 (target) —
  // alltså på brustoppar. Då ska mätaren säga ≈ 0, inte "fel".
  const r = lcg(20260930);
  const AOV = 600; const BE = 1.5;
  const rader = []; const logg = [];
  for (let c = 0; c < 16; c++) {
    const kid = `S${c}`;
    let budget = 1000; let senast = -99; const hist = [];
    for (let i = 0; i < 45; i++) {
      const d = plusDagar('2026-08-16', i);
      const kop = poisson((budget * BE) / AOV, r);
      rader.push({ kampanj_id: kid, namn: `${kid} | BE ROAS 1.5`, datum: d, spend: budget, kop, intakt: kop * AOV });
      hist.push({ spend: budget, intakt: kop * AOV });
      const tre = hist.slice(-3);
      const roas3 = tre.reduce((s, x) => s + x.intakt, 0) / tre.reduce((s, x) => s + x.spend, 0);
      const imorgon = plusDagar(d, 1);
      const rad = { datum: imorgon, kampanj_id: kid, kampanj_namn: `${kid} | BE ROAS 1.5`, ad_account_id: SE, break_even: BE, gammal_budget: budget };
      if (i >= 3 && roas3 >= 2.4 && i - senast >= 10 && i < 40) { logg.push({ ...rad, kod: 'SKALA', ny_budget: budget * 1.5, genomford: true }); budget *= 1.5; senast = i; } else logg.push({ ...rad, kod: 'LAT_VARA', ny_budget: null, genomford: false });
      if (i - senast === 8 && senast > 0) { logg.push({ ...rad, datum: plusDagar(imorgon, 0), kod: 'SANK', ny_budget: budget / 1.5, genomford: true }); budget /= 1.5; }
    }
  }
  const data = { SE: { dygn: rader, budgetandringar: [], since: '2026-08-16', until: '2026-09-29' } };
  const u = kor({ logg, data, idag: '2026-09-30' });
  const hoj = u.nya.filter((x) => x.horisont === 'kort' && x.familj === 'HOJ' && x.bedombar);
  assert.ok(hoj.length >= 8, `för få mätta höjningar i simuleringen (${hoj.length})`);
  const mat = hoj.reduce((s, x) => s + x.delta_vinst_kr, 0);
  // Naivt: kontrafaktiskt = före-ROAS utan kontroll (k = 1).
  const naiv = hoj.reduce((s, x) => { const Scf = (x.fore.spend / x.fore.dagar) * x.efter.dagar; return s + ((x.efter.intakt - x.fore.roas * Scf) / BE - (x.efter.spend - Scf)); }, 0);
  const flyttat = hoj.reduce((s, x) => s + Math.abs(x.delta_spend_kr), 0);
  // Orakel: samma fönster, men med det SANNA kontrafaktiska (ROAS = break-even). Skillnaden
  // mellan oraklet och 0 är ren tur i efter-fönstren; skillnaden mellan mätaren och oraklet är mätarens fel.
  const orakel = hoj.reduce((s, x) => { const Scf = (x.fore.spend / x.fore.dagar) * x.efter.dagar; return s + ((x.efter.intakt - BE * Scf) / BE - (x.efter.spend - Scf)); }, 0);
  assert.ok(naiv - orakel < -0.5 * flyttat, `den naiva jämförelsen ska se en stor förlust som inte finns (naiv ${Math.round(naiv)}, orakel ${Math.round(orakel)}, ${Math.round(flyttat)} kr flyttat)`);
  assert.ok(Math.abs(mat - orakel) < 0.15 * flyttat, `mätarens eget fel ska vara litet (mätt ${Math.round(mat)}, orakel ${Math.round(orakel)}, ${Math.round(flyttat)} kr flyttat)`);
  assert.ok(Math.abs(mat - orakel) < Math.abs(naiv - orakel) / 5, 'mätaren ska ligga minst fem gånger närmare sanningen än den naiva');
  assert.equal(hoj.filter((x) => x.dom === 'FEL').length <= Math.ceil(hoj.length * 0.25), true, 'högst var fjärde höjning får dömas FEL när sanningen är 0');
});
