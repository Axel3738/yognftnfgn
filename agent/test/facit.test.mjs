import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  tolkaInsiktsrad, tolkaBudgethandelse, byggSerie, summa, beslutUrLogg, andringsIndex, episoder,
  kontrollprov, kontrollfaktor, egenHistorik, placebo, vandring, dommaEpisod, dommaHall, hallUrLogg, breakEvenIndex, hinkar, forslag,
  facitNot, familjForDom, kor, brak, plusDagar, bandFor, zonFor, MIN_KAMPANJER_FORSLAG, KALIBRERING_SCHEMA, REGELVERK, PLACEBO_HOJ, METOD_VERSION, PLACEBO_TOLERANS, forslagId,
  sagtand, placeboSammanfattning, kalibrering, FORSLAG_DAGAR_I_RAD, status, statusEngelska,
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

/** Kontrollprov med känd struktur: y = κ·qh·(q/qh)^ρ (plus valfri störning). */
function strukturProv({ kappa = 0.9, rho = 0.5, n = 60, kop = 10, kampanjer = 8, marknad = 'SE' } = {}) {
  const ut = [];
  for (let i = 0; i < n; i++) {
    const qh = 0.8 + (i % 5) * 0.2;
    const q = qh * Math.exp(((i % 7) - 3) * 0.15);
    ut.push({ kampanj_id: `A${i % kampanjer}`, marknad, q, qh, kop, kop_hist: 20, kop_efter: 10, y: kappa * qh * (q / qh) ** rho, w: 1000 });
  }
  return ut;
}

test('kontrollen (version 3): kampanjens egen nivå veckan innan + den del av avvikelsen som håller i sig — fler köp ⇒ mer av avvikelsen räknas som äkta', () => {
  const prov = strukturProv({ kappa: 0.9, rho: 0.5 });
  const ett = kontrollfaktor(prov, { q: 2, qh: 1, kop: 10, marknad: 'SE', utom: 'A0' });
  assert.ok(!ett.saknas);
  assert.ok(ett.kampanjer <= 7, 'kampanjen som bedöms räknas aldrig in i sin egen kontroll');
  assert.ok(ett.kvot > 0.9 && ett.kvot < 2, `en topp mot den egna nivån faller delvis tillbaka (${ett.kvot})`);
  const fa = kontrollfaktor(prov, { q: 2, qh: 1, kop: 3, marknad: 'SE', utom: 'A0' });
  const manga = kontrollfaktor(prov, { q: 2, qh: 1, kop: 100, marknad: 'SE', utom: 'A0' });
  assert.ok(fa.rho < ett.rho && ett.rho < manga.rho, 'tre köp är mer slump än hundra');
  assert.ok(fa.kvot < manga.kvot);
  // Ingen egen historik ⇒ ingen dom, och orsaken sägs.
  const utan = kontrollfaktor(prov, { q: 2, qh: null, kop: 10, marknad: 'SE' });
  assert.equal(utan.saknas, true);
  assert.match(utan.orsak, /egen historik/);
  // För få andra kampanjer ⇒ saknas (aldrig k = 1 i tysthet).
  const tunn = kontrollfaktor(prov.filter((p) => p.kampanj_id === 'A0'), { q: 2, qh: 1, kop: 10, marknad: 'SE' });
  assert.equal(tunn.saknas, true);
  assert.equal(tunn.k, 1);
});

test('kontrollen: persistensen räknas på båda marknaderna, tröttheten (κ) på marknadens egen', () => {
  const se = strukturProv({ kappa: 0.8, rho: 0.5, marknad: 'SE' });
  const no = strukturProv({ kappa: 1.1, rho: 0.5, marknad: 'NO' }).map((p) => ({ ...p, kampanj_id: `N${p.kampanj_id}` }));
  const kSE = kontrollfaktor([...se, ...no], { q: 1, qh: 1, kop: 10, marknad: 'SE' });
  const kNO = kontrollfaktor([...se, ...no], { q: 1, qh: 1, kop: 10, marknad: 'NO' });
  assert.ok(Math.abs(kSE.kvot - 0.8) < 0.02, `SE κ ${kSE.kvot}`);
  assert.ok(Math.abs(kNO.kvot - 1.1) < 0.02, `NO κ ${kNO.kvot}`);
  assert.equal(kSE.rho, kNO.rho, 'samma C för båda');
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

test('kontrollproven: bara dygn utan ändring D−3..D, och bara med egen historik veckan innan', () => {
  const s = byggSerie(kontrollMarknad());
  const logg = ['K0', 'K1', 'K2', 'K3', 'K4', 'K5'].map((kid) => LOGG({ kampanj_id: kid, kod: 'LAT_VARA', genomford: false }));
  const alla = kontrollprov(s, breakEvenIndex(logg), { marknadFor: () => 'SE', since: '2026-08-20', until: '2026-09-28', h: 7 });
  assert.ok(alla.length > 30);
  assert.ok(alla.every((p) => p.qh > 0 && p.datum >= plusDagar('2026-08-20', 10)), 'egen historik D−10..D−4 krävs');
  const index = andringsIndex([{ kampanj_id: 'K0', datum: '2026-09-10', fran_sek: 1000, till_sek: 1200, motor: false }], []);
  const rena = kontrollprov(s, breakEvenIndex(logg), { marknadFor: () => 'SE', since: '2026-08-20', until: '2026-09-28', h: 7, index });
  const k0 = rena.filter((p) => p.kampanj_id === 'K0').map((p) => p.datum);
  for (const d of ['2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13']) assert.ok(!k0.includes(d), `${d} har en ändring i D−3..D`);
  assert.ok(k0.includes('2026-09-09') && k0.includes('2026-09-14'));
  assert.match(egenHistorik(s, 'K0', '2026-08-25', 1.5, '2026-08-20').saknas, /egen historik/, 'datan räcker inte tio dygn bakåt');
});

function ctxFor(serieRader, logg, { until = '2026-09-29', since = '2026-08-20', prov = null, andringar = [] } = {}) {
  const serie = byggSerie(serieRader);
  const beslut = beslutUrLogg(logg);
  const index = andringsIndex(andringar, beslut);
  const beIndex = breakEvenIndex(logg);
  const p = prov ?? { kort: [], lang: [] };
  return { serie, index, prov: p, vandring: { kort: 0, lang: 0 }, until, since, idag: plusDagar(until, 1), beIndex, beslut };
}

/** Kontrollprov där efter-ROAS = k × den egna nivån (före = veckan innan): en kampanj faller till k × av sig själv. */
const provMedK = (k) => { const p = Array.from({ length: 24 }, (_, i) => { const q = 0.5 + (i % 8) * 0.4; return { kampanj_id: `A${i % 6}`, marknad: 'SE', q, qh: q, kop: 10, kop_hist: 20, kop_efter: 10, y: k * q, w: 1000 }; }); return { kort: p, lang: p }; };
/** Veckan innan beslutet (D−10..D−4 för D = 09-10): samma nivå som före-fönstret. */
const historik = (kid, spend, intakt, kop) => dygn(kid, dagar('2026-08-31', 7, (d) => [d, spend, intakt, kop]));

test('höjning: kontrafaktiskt = före-ROAS × k — de tillagda kronorna jämförs med vad gammal budget hade gett', () => {
  // Före: 1 000 kr/dygn på ROAS 3 (band ≥ 2,0 mot BE 1,5). Efter (D+1..D+7): 2 000 kr/dygn på ROAS 2,4.
  // k = 1 ⇒ gammal budget hade gett 3 000/dygn ⇒ +1 000 kr gav +1 800 kr ⇒ marginal 1,8 ≥ 1,5.
  // 300 köp per dygn: nog för att intervallet ska ligga helt över noll (med 30 är det OSÄKERT — se brustestet).
  const s = [...historik(K, 1000, 3000, 300), ...dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 300]), ...dagar('2026-09-10', 8, (d) => [d, 2000, 4800, 480])])];
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
  const s = [...historik(K, 1000, 3000, 30), ...dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 30]), ...dagar('2026-09-10', 8, (d) => [d, 2000, 3200, 32])])];
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
  const s = [...historik(K, 1000, 3000, 3), ...dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 3]), ...dagar('2026-09-10', 8, (d) => [d, 2000, 4000, 4])])];
  const ctx = ctxFor(s, [LOGG({ gammal_budget: 1000, ny_budget: 2000 })], { prov: provMedK(1) });
  const r = dommaEpisod(episoder(ctx.beslut, ctx.index)[0], 'lang', ctx);
  assert.equal(r.dom, 'OSAKER');
  assert.equal(r.bedombar, true, 'mätt — men osäker');
  assert.ok(r.intervall_80[0] < 0 && r.intervall_80[1] > 0);
});

test('ingen kontroll ⇒ UNG (aldrig k = 1 i tysthet); ingen egen historik ⇒ UNG med orsak; lanseringsdygn i före-fönstret ⇒ LANSERINGSFAS', () => {
  const s = [...historik(K, 1000, 3000, 30), ...dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 30]), ...dagar('2026-09-10', 8, (d) => [d, 2000, 4800, 48])])];
  const ctx = ctxFor(s, [LOGG({ gammal_budget: 1000, ny_budget: 2000 })]);
  assert.equal(dommaEpisod(episoder(ctx.beslut, ctx.index)[0], 'lang', ctx).dom, 'UNG');
  const ny = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 30]), ...dagar('2026-09-10', 8, (d) => [d, 2000, 4800, 48])]);
  const ctxNy = ctxFor(ny, [LOGG({ gammal_budget: 1000, ny_budget: 2000 })], { prov: provMedK(1) });
  const rNy = dommaEpisod(episoder(ctxNy.beslut, ctxNy.index)[0], 'lang', ctxNy);
  assert.equal(rNy.dom, 'UNG');
  assert.match(rNy.orsak, /egen historik/);
  const lansering = dygn(K, [['2026-09-09', 1000, 3000, 30], ...dagar('2026-09-10', 8, (d) => [d, 2000, 4800, 48])]);
  const ctx2 = ctxFor(lansering, [LOGG({ gammal_budget: 1000, ny_budget: 2000 })], { prov: provMedK(1) });
  assert.equal(dommaEpisod(episoder(ctx2.beslut, ctx2.index)[0], 'lang', ctx2).dom, 'LANSERINGSFAS');
});

test('ett fönster som inte stängt och mognat döms inte (null); en handändring kapar fönstret — under 3 dygn kvar ⇒ STORD', () => {
  const s = [...historik(K, 1000, 3000, 30), ...dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 30]), ...dagar('2026-09-10', 8, (d) => [d, 2000, 4800, 48])])];
  const logg = [LOGG({ gammal_budget: 1000, ny_budget: 2000 })];
  const ctx = ctxFor(s, logg, { until: '2026-09-18', prov: provMedK(1) });
  assert.equal(dommaEpisod(episoder(ctx.beslut, ctx.index)[0], 'lang', ctx), null, 'D+7 = 09-17 + 3 dygns mognad > 09-18');
  const ctx2 = ctxFor(s, logg, { prov: provMedK(1), andringar: [{ kampanj_id: K, datum: '2026-09-13', fran_sek: 2000, till_sek: 4000, motor: false }] });
  const r = dommaEpisod(episoder(ctx2.beslut, ctx2.index)[0], 'lang', ctx2);
  assert.equal(r.dom, 'STORD');
  assert.match(r.orsak, /handändring/);
});

test('motorns egen sänkning inom fönstret ⇒ AVBRUTEN, räknad fram till avbrottet (överlevarfelet: förut föll de bort)', () => {
  const s = [...historik(K, 1000, 3000, 30), ...dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 30]), ...dagar('2026-09-10', 12, (d) => [d, 2000, 2400, 24])])];
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
  assert.equal(h.dygn.reduce((a, [, v]) => a + v, 0), Math.round(1200 / 1.5 - 1000) * 7, 'netto per unikt dygn: intäkt ÷ break-even − spend');
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

test('förslag: en konstant, från A till B — kräver nog med kampanjer, intervall på ena sidan om noll, samma tecken utan största kampanjen och i kort horisont, ingen kampanj över 40 %', () => {
  const b = (kampanjer, over = {}) => ({ familj: 'HOJ', dimension: 'trappa', varde: '1,0–1,5', episoder: 12, bedomda: 12, bedomda_kampanjer: kampanjer, ratt: 6, fel: 1, osakra: 5, delta_vinst_kr: 5000, intervall_80: [1000, 9000], median_kr: 300, utan_storsta_kr: 2000, storsta_andel: 0.3, tecken_haller: true, marginal_roas: 2.2, marginal_roas_tillagda: 2.2, break_even_viktad: 1.6, kr_per_kampanjvecka: 700, ...over });
  const nyckel = 'HOJ|trappa|1,0–1,5';
  const kort = { [nyckel]: { delta_vinst_kr: 800 } };
  const f = (hink, k = kort) => forslag({ hinkarNya: { [nyckel]: hink }, hinkarNyaKort: k, hall: {} });
  assert.equal(f(b(4)).length, 0, 'för få olika kampanjer');
  assert.equal(f(b(8, { intervall_80: [-500, 9000] })).length, 0, 'intervallet korsar noll');
  assert.equal(f(b(8, { utan_storsta_kr: -10 })).length, 0, 'vilar på en kampanj');
  assert.equal(f(b(8, { storsta_andel: 0.6 })).length, 0, 'en kampanj bär mer än 40 %');
  assert.equal(f(b(8), { [nyckel]: { delta_vinst_kr: -1 } }).length, 0, 'kort horisont säger emot');
  assert.equal(f(b(8, { marginal_roas_tillagda: 1.8 })).length, 0, 'plus, men marginalen under 1,25 × break-even räcker inte för att skala mer');
  assert.equal(f(b(8, { marginal_roas: 6.9, marginal_roas_tillagda: 1.4 })).length, 0, 'nettokvoten blåses upp av höjningar där spenden föll — grinden räknar bara tillagda kronor');
  const [x] = f(b(8));
  assert.match(x.konstant, /TRAPPA/);
  assert.equal(x.fran, '×1,2');
  assert.equal(x.till, '×1,3');
  assert.deepEqual(x.matare, [...PLACEBO_HOJ], 'förslaget bygger på mätaren där motorn höjer');
  const [ner] = f(b(8, { delta_vinst_kr: -5000, intervall_80: [-9000, -1000], utan_storsta_kr: -2000, marginal_roas: 0.4, marginal_roas_tillagda: 0.4 }), { [nyckel]: { delta_vinst_kr: -800 } });
  assert.equal(ner.till, '×1,1');
});

test(`ett förslag når Axel först efter ${FORSLAG_DAGAR_I_RAD} morgnar i rad, med stabilt id, med mätaren bevisat rak totalt OCH där motorn höjer, och aldrig på en delvis dag`, () => {
  const nu = REGELVERK[REGELVERK.length - 1].namn;
  const rad = (kampanj_id, v) => ({ familj: 'HOJ', horisont: 'lang', metod: METOD_VERSION, kampanj_id, trappa: '1,0–1,5', forsta_steg: '+≤25 %', zon: '1 000–2 000', band: '≥2,0', marknad: 'SE', total: '+≤25 %', kedja: '1 steg', regelverk: nu, produkt: kampanj_id, dom: 'RATT', bedombar: true, delta_vinst_kr: v, flyttat_kr: 1000, delta_spend_kr: 1000, delta_intakt_kr: 2500, break_even: 1.5, efter: { dagar: 7 } });
  const alla = Array.from({ length: 10 }, (_, i) => [rad(`K${i}`, 1000 + i), { ...rad(`K${i}`, 800), horisont: 'kort' }]).flat();
  // Mätaren håller: medelfel ±0,05 × BE per kampanj, i båda lägena där motorn höjer.
  const bra = PLACEBO_HOJ.flatMap((lage) => Array.from({ length: 20 }, (_, i) => ({ kampanj_id: `P${i % 10}`, fel_kr: i % 2 ? 50 : -50, w: 1000, lage })));
  let kal = null;
  for (let dag = 1; dag <= FORSLAG_DAGAR_I_RAD; dag++) {
    kal = kalibrering(alla, { kort: [], lang: [] }, { idag: plusDagar('2026-10-01', dag), placeboRader: bra, tidigare: kal });
    assert.ok(kal.kandidater.length > 0, `dag ${dag}: kandidaten finns`);
    assert.equal(kal.forslag.length, dag >= FORSLAG_DAGAR_I_RAD ? kal.kandidater.length : 0, `dag ${dag}`);
  }
  const id = kal.forslag[0].id;
  assert.equal(id, forslagId(kal.forslag[0].nyckel), 'id:t kommer ur nyckeln — samma förslag får samma id varje morgon');
  assert.match(id, /^F\d{4}$/);
  const txt = status(kal, { idag: kal.skapad }).join('\n');
  assert.ok(txt.includes(`⚑ Förslag ${id}: TRAPPA`) && txt.includes(`från ×1,2 till ×1,3.`) && txt.includes(`Svara JA ${id} eller NEJ ${id}.`), txt);
  assert.doesNotMatch(status(kal, { idag: plusDagar(kal.skapad, 1) }).join('\n'), /⚑/, 'en gammal kalibrering visar inga förslag');
  const delvis = kalibrering(alla, { kort: [], lang: [] }, { idag: plusDagar('2026-10-01', 8), placeboRader: bra, tidigare: kal, delvis: true });
  assert.equal(delvis.forslag.length, 0);
  const skevt = kalibrering(alla, { kort: [], lang: [] }, { idag: plusDagar('2026-10-01', 8), placeboRader: bra.map((p) => ({ ...p, fel_kr: -900 })), tidigare: kal });
  assert.equal(skevt.placebo.godkant, false);
  assert.equal(skevt.forslag.length, 0, 'underkänd mätare ⇒ inga förslag');
  // Lägen som tar ut varandra i summan: ekvivalenstestet underkänner ändå
  // (granskningen 2026-09-30: toppläget stod som godkänt med medelfel −0,24).
  const mitt = Array.from({ length: 20 }, (_, i) => ({ kampanj_id: `M${i % 10}`, fel_kr: 300, w: 1000, lage: 'BE–1,5 × BE' }));
  const topp = PLACEBO_HOJ.flatMap((l) => Array.from({ length: 10 }, (_, i) => ({ kampanj_id: `T${l}${i}`, fel_kr: -300, w: 1000, lage: l })));
  const lage = kalibrering(alla, { kort: [], lang: [] }, { idag: plusDagar('2026-10-01', 8), placeboRader: [...mitt, ...topp], tidigare: kal });
  assert.ok(Math.abs(lage.placebo.summa_kr) < 1, 'summan är noll');
  assert.equal(lage.placebo.lagen[PLACEBO_HOJ[0]].godkant, false, 'men i läget där motorn höjer är medelfelet −0,3 × BE');
  assert.match(lage.placebo.lagen[PLACEBO_HOJ[0]].orsak, /medelfelet/);
  assert.equal(lage.forslag.length, 0);
  assert.match(lage.kandidater[0].sparrad, /mätaren .* vid ROAS\/BE/);
  // Ett läge utan prov spärrar höjningsförslaget även när resten håller.
  const bara15 = bra.filter((r) => r.lage === PLACEBO_HOJ[0]);
  const utanTopp = kalibrering(alla, { kort: [], lang: [] }, { idag: plusDagar('2026-10-01', 8), placeboRader: bara15, tidigare: kal });
  assert.equal(utanTopp.placebo.godkant, true);
  assert.match(utanTopp.kandidater[0].sparrad, new RegExp(PLACEBO_HOJ[1].replace(/[×()]/g, '.')));
  assert.ok(PLACEBO_TOLERANS > 0);
});

test('facitNot ändrar aldrig domen, och planera ger samma plan med och utan facit', () => {
  const kal = { hinkar: { lang: { 'HOJ|zon|1 000–2 000': { familj: 'HOJ', dimension: 'zon', varde: '1 000–2 000', bedomda: 6, bedomda_kampanjer: 5, ratt: 4, fel: 1, osakra: 1, delta_vinst_kr: 1200, intervall_80: [200, 2400], marginal_roas: 1.9 } } }, hall: { lang: {} }, forslag: [{ nyckel: 'TRAPPA|×1,3', konstant: 'TRAPPA', fran: '×1,2', till: '×1,3', nr: 1 }] };
  const rad = { id: K, namn: 'Testkampanjen | BE ROAS 1.5', budget: 1500, roas3d: 4, dom: { kod: 'SKALA', rubrik: 'Skala', motivering: 'm', nyBudget: 1800, kraverGodkannande: true, naraGrans: false, breakEven: 1.5 } };
  const fore = JSON.stringify(rad.dom);
  const not = facitNot(kal, rad);
  assert.equal(JSON.stringify(rad.dom), fore, 'facitNot är ren');
  assert.match(not.text, /4 rätt, 1 fel, 1 för jämna att döma, på 5 kampanjer/);
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
  assert.equal(u.kalibrering.statistik.SE.handandringar, 1, 'den skapade budgeten är ingen handändring');
});

test('Discord-raden på engelska bär inga kronor och ingen break-even (redigerarna läser #scaling)', () => {
  const kal = { skapad: '2026-10-01', hinkar: { lang: { 'HOJ|alla|alla': { bedomda: 9, bedomda_kampanjer: 8, ratt: 1, fel: 2, osakra: 6, delta_vinst_kr: -12850 } } }, sagtand: { 'alla|alla': { vande: 20, hojningar: 29 } }, forslag: [] };
  const txt = statusEngelska(kal).join('\n');
  assert.doesNotMatch(txt, /SEK|kr\b|break-even|ROAS|12[ ,.]?850/);
  assert.match(txt, /1 paid off, 2 did not, 6 too close to call/);
});

// ── Simuleringen med känt facit (provbänken som valde modellen, agent/FACIT.md) ──
function lcg(fro) { let a = fro >>> 0; return () => { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return a / 4294967296; }; }
function normal(r) { return Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r()); }
function poisson(l, r) { if (l > 30) return Math.max(0, Math.round(l + Math.sqrt(l) * normal(r))); const L = Math.exp(-l); let k = 0; let p = 1; do { k++; p *= r(); } while (p > L); return k - 1; }
/**
 * 40 kampanjer på 45 dygn. Varje kampanj har en sann nivå (spridning mellan kampanjer),
 * trötthet, en slumpvandring, avtagande avkastning (ROAS faller när spenden ökar) och
 * Poisson-köp. En motor höjer på tre dygns ROAS ≥ 1,4 × break-even och sänker under 0,85
 * — alltså ofta på slump. Oraklet vet den sanna förväntade intäkten vid oförändrad budget.
 */
function simulera(fro, { elastic = 0.8, trott = -0.006, sprid = 0.35, rw = 0.03 } = {}) {
  const r = lcg(fro); const since = '2026-08-16'; const until = plusDagar(since, 44);
  const rader = []; const sann = new Map(); const logg = [];
  for (let c = 0; c < 40; c++) {
    const kid = `K${c}`; const be = Math.round((1.5 + 0.3 * r()) * 100) / 100; const S0 = Math.round(400 + 1200 * r());
    const namn = `P${c % 8} | BE ROAS ${be}`;
    let lr = sprid * normal(r); const drift = trott + 0.004 * normal(r);
    let budget = S0; let senast = -99; const hist = [];
    const start = Math.floor(r() * 10);
    for (let i = start; i < 45; i++) {
      const d = plusDagar(since, i);
      const rad = { datum: d, kampanj_id: kid, kampanj_namn: namn, ad_account_id: SE, break_even: be, gammal_budget: budget };
      if (i - start >= 3) {
        const t3 = hist.slice(-3); const q3 = t3.reduce((x, y) => x + y.intakt, 0) / t3.reduce((x, y) => x + y.spend, 0) / be;
        if (i - senast >= 3 && i < 44 && q3 >= 1.4) { const f = q3 >= 2 ? 1.5 : 1.2; logg.push({ ...rad, kod: 'SKALA', ny_budget: Math.round(budget * f), genomford: true }); budget = Math.round(budget * f); senast = i; }
        else if (i - senast >= 3 && i < 44 && q3 < 0.85) { logg.push({ ...rad, kod: 'SANK', ny_budget: Math.round(budget * 0.7), genomford: true }); budget = Math.round(budget * 0.7); senast = i; }
        else logg.push({ ...rad, kod: i - senast < 3 ? 'VANTA_KADENS' : 'LAT_VARA', ny_budget: null, genomford: false, budget });
      }
      const spend = budget * (0.85 + 0.15 * r());
      const kop = poisson((Math.exp(lr) * be * spend ** elastic * S0 ** (1 - elastic)) / 500, r);
      let intakt = 0; for (let j = 0; j < kop; j++) intakt += 500 * Math.exp(0.4 * normal(r) - 0.08);
      rader.push({ kampanj_id: kid, namn, datum: d, spend, kop, intakt });
      hist.push({ spend, intakt });
      sann.set(`${kid}|${d}`, { lr, be, S0 });
      lr += drift + rw * normal(r);
    }
  }
  const u = kor({ logg, data: { SE: { dygn: rader, budgetandringar: [], since, until } }, idag: plusDagar(until, 1) });
  // Oraklet: samma fönster, den SANNA förväntade intäkten vid den gamla spenden.
  const orakel = (x) => {
    const Scf = (x.fore.spend / x.fore.dagar) * x.efter.dagar; let rev = 0;
    for (let t = x.efter.fran; t <= x.efter.till; t = plusDagar(t, 1)) { const z = sann.get(`${x.kampanj_id}|${t}`); rev += Math.exp(z.lr) * z.be * (Scf / x.efter.dagar) ** elastic * z.S0 ** (1 - elastic); }
    return (x.efter.intakt - rev) / x.break_even - (x.efter.spend - Scf);
  };
  return { u, orakel };
}
function summera(varldar, fron) {
  const ut = { HOJ: { matt: 0, orakel: 0, naiv: 0, flyttat: 0, ratt: 0, rattSann: 0, fel: 0, felSann: 0, z: [] }, SANK: { matt: 0, orakel: 0, naiv: 0, flyttat: 0, ratt: 0, rattSann: 0, fel: 0, felSann: 0, z: [] } };
  for (const fro of fron) {
    const { u, orakel } = simulera(fro, varldar);
    for (const fam of ['HOJ', 'SANK']) {
      const b = ut[fam]; let d = 0; let msd = 0;
      for (const x of u.nya.filter((r) => r.bedombar && r.horisont === 'kort' && r.familj === fam)) {
        const o = orakel(x); const Scf = (x.fore.spend / x.fore.dagar) * x.efter.dagar;
        b.matt += x.delta_vinst_kr; b.orakel += o; b.flyttat += Math.abs(x.delta_spend_kr);
        b.naiv += (x.efter.intakt - x.fore.roas * Scf) / x.break_even - (x.efter.spend - Scf); // kontrafaktiskt = före-ROAS rakt av
        if (x.dom === 'RATT') { b.ratt++; if (o > 0) b.rattSann++; }
        if (x.dom === 'FEL') { b.fel++; if (o < 0) b.felSann++; }
        d += x.delta_vinst_kr - o; msd += x.modell_sd_kr;
      }
      b.z.push(d / msd);
    }
  }
  return ut;
}

test('simulering med känt facit, heterogena kampanjer: felet ≤ 25 % av de flyttade kronorna, domarna RÄTT/FEL stämmer, och modellens osäkerhet är ärlig', () => {
  const fron = [11, 22, 33, 44, 55, 66];
  for (const [namn, varld] of [['olika kampanjer, trötthet, avtagande avkastning', { elastic: 0.8, trott: -0.006, sprid: 0.35 }], ['bara slump — alla kampanjer lika', { elastic: 1, trott: 0, sprid: 0, rw: 0 }]]) {
    const ut = summera(varld, fron);
    for (const fam of ['HOJ', 'SANK']) {
      const b = ut[fam];
      const fel = (b.matt - b.orakel) / b.flyttat;
      assert.ok(Math.abs(fel) < 0.25, `${namn}, ${fam}: mätarens fel ${Math.round(100 * fel)} % av ${Math.round(b.flyttat)} kr flyttat`);
      // Minst 80 % rätt, men en miss tillåts när domarna är få.
      assert.ok(b.rattSann >= Math.min(b.ratt - 1, 0.8 * b.ratt), `${namn}, ${fam}: RÄTT stämmer ${b.rattSann}/${b.ratt}`);
      assert.ok(b.felSann >= Math.min(b.fel - 1, 0.8 * b.fel), `${namn}, ${fam}: FEL stämmer ${b.felSann}/${b.fel}`);
      const inne = b.z.filter((z) => Math.abs(z) < 2.5).length;
      assert.ok(inne >= fron.length - 1, `${namn}, ${fam}: modellens osäkerhet är för smal (z ${b.z.map((z) => z.toFixed(1)).join(' ')})`);
    }
    if (varld.sprid > 0) {
      // Utan kontrollen (före-ROAS rakt av) ser höjningar på slumptoppar ut som stora förluster.
      const h = ut.HOJ;
      assert.ok(Math.abs(h.naiv - h.orakel) > 2 * Math.abs(h.matt - h.orakel), `den naiva jämförelsen ska ligga långt ifrån sanningen (naiv ${Math.round(h.naiv)}, mätt ${Math.round(h.matt)}, orakel ${Math.round(h.orakel)})`);
    }
  }
});

test('mätarens prov (placebo): en kampanj i taget, borttagen ur sin egen kontroll — felet är intäkten mätaren hittar på', () => {
  const prov = strukturProv({ kappa: 0.9, rho: 0.5 });
  const rader = placebo(prov);
  assert.equal(rader.length, prov.length);
  assert.ok(rader.every((r) => Math.abs(r.fel_kr) < 0.2 * 1000), 'en modell som nästan stämmer hittar på lite intäkt per dygn');
  const sk = placeboSammanfattning(rader);
  assert.ok(Math.abs(sk.summa_kr) < 100, `och nästan ingen totalt (${sk.summa_kr})`);
  assert.equal(sk.godkant, true);
  assert.ok(Object.keys(sk.lagen).length >= 2);
  // Vandringen: ingen utöver bruset när modellen stämmer exakt.
  assert.ok(vandring(rader) < 0.05);
});

// ── Granskningen 2026-09-30: fynden låsta som tester ──

test('hållbeslut som följs av en ändring inom 3 dygn faller aldrig bort — de blir ANDRAD_<typ> och räknas i nästa morgon', () => {
  const s = dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 10]), ...dagar('2026-09-10', 10, (d) => [d, 1000, 3000, 10])]);
  const logg = [LOGG({ kod: 'LAT_VARA', genomford: false, ny_budget: null }), LOGG({ datum: '2026-09-12', gammal_budget: 1000, ny_budget: 1200 })];
  const [h] = dommaHall(hallUrLogg(logg), 7, ctxFor(s, logg));
  assert.equal(h.familj, 'HALL_HOG');
  assert.equal(h.utfall, 'ANDRAD_UPP');
  assert.equal(h.nasta_morgon_over_target, true);
});

test('grinden: flyttade spenden färre kronor än tre köp vid break-even blir det FLYTTADE_INTE, aldrig RÄTT eller FEL', () => {
  const s = [...historik(K, 1000, 3000, 30), ...dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 30]), ...dagar('2026-09-10', 8, (d) => [d, 1020, 3100, 31])])];
  const ctx = ctxFor(s, [LOGG({ gammal_budget: 1000, ny_budget: 1200 })], { prov: provMedK(1) });
  const r = dommaEpisod(episoder(ctx.beslut, ctx.index)[0], 'lang', ctx);
  assert.equal(r.dom, 'FLYTTADE_INTE');
  assert.equal(r.bedombar, false);
});

test('en ny metodversion dömer om allt i datafönstret — gamla rader hoppas inte', () => {
  const s = [...historik(K, 1000, 3000, 10), ...dygn(K, [...dagar('2026-09-07', 3, (d) => [d, 1000, 3000, 10]), ...dagar('2026-09-10', 20, (d) => [d, 2000, 4800, 16])])];
  const data = { SE: { dygn: s, budgetandringar: [], since: '2026-08-20', until: '2026-09-29' } };
  const logg = [LOGG({ gammal_budget: 1000, ny_budget: 2000 })];
  const forsta = kor({ logg, data, idag: '2026-09-30' });
  const gamla = forsta.nya.map((r) => ({ ...r, metod: METOD_VERSION - 1, nyckel: r.nyckel.replace(/^\d+\|/, `${METOD_VERSION - 1}|`) }));
  assert.equal(kor({ logg, data, idag: '2026-09-30', sparade: gamla }).nya.length, forsta.nya.length);
});

test('dina ändringar samma dygn slås ihop i tidsordning (aktivitetsloggen kommer nyast först)', () => {
  const s = dygn(K, dagar('2026-09-01', 25, (d) => [d, 1000, 3000, 30]));
  const data = { SE: { dygn: s, since: '2026-08-20', until: '2026-09-29', budgetandringar: [
    { kampanj_id: K, datum: '2026-09-15', tid: '2026-09-15T11:18:00+0000', fran_sek: 2000, till_sek: 4000, app: 'Power Editor', motor: false },
    { kampanj_id: K, datum: '2026-09-15', tid: '2026-09-15T04:58:00+0000', fran_sek: 1000, till_sek: 2000, app: 'Power Editor', motor: false },
  ] } };
  const u = kor({ logg: [LOGG({ kod: 'LAT_VARA', genomford: false, ny_budget: null })], data, idag: '2026-09-30' });
  const axel = u.nya.filter((r) => r.familj === 'AXEL_HOJ' && r.horisont === 'lang');
  assert.equal(axel.length, 1);
  assert.equal(axel[0].beslut_fran_sek, 1000);
  assert.equal(axel[0].beslut_till_sek, 4000);
  assert.equal(axel[0].zon, '1 000–2 000');
});

test('ett konto ensamt är alltid DELVIS — inga förslag, ingen dag i rad', () => {
  const s = dygn(K, dagar('2026-09-01', 25, (d) => [d, 1000, 3000, 30]));
  const u = kor({ logg: [], data: { SE: { dygn: s, budgetandringar: [], since: '2026-08-20', until: '2026-09-29' } }, idag: '2026-09-30', forvantadeKonton: ['SE'] });
  assert.equal(u.kalibrering.delvis, true);
});
