// Tester för nattvaktens beslutsmotor — varje regel i budgetbeslut.mjs har en
// fixtur. Inga nätanrop, ingen fs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nyBudget, forlustdygnIRad, budgetenheter, beslutaKampanj, beslutaAnnonser, prioritera, besluta,
  GOLV_SEK, TAK_SEK, RAKET_FAKTOR, KADENS_DAGAR, FORLUSTDYGN_FOR_PAUS, MAX_ANDRINGAR, PRIORITET,
} from '../budgetbeslut.mjs';

// TankGuard utan moms (avläst 2026-09-09): break-even ROAS 1,46 · CPA 334 kr.
const ekonomi = { breakEvenRoas: 1.46, breakEvenCpa: 334 };
const idag = '2026-09-10';

const kampanj = (o = {}) => ({ id: 'k1', name: 'TANKGUARD_SALES_2026-09-08', status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '100000', ...o });
const adset = (o = {}) => ({ id: 'a1', name: 'TANKGUARD_broad', status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '100000', campaign_id: 'k1', ...o });
// Vinst % = (1/1,46 − 1/roas) × 100: roas 3 → 35,2 % · roas 2 → 18,5 % · roas 1,6 → 6,0 % · roas 1,2 → −14,8 %.
const ins = (roas, { spend = 1500, kop = 5 } = {}) => ({ spend, kop, roas });
const dygnMed = (roasLista, start = '2026-09-03') => roasLista.map((roas, i) => ({
  datum: new Date(Date.parse(`${start}T00:00:00Z`) + i * 86400000).toISOString().slice(0, 10), spend: 500, roas,
}));
const loggrad = (o = {}) => ({ datum: '2026-09-09', butik: 'tankguard/tankguard', entitet_id: 'k1', entitet_typ: 'campaign', namn: 'x', atgard: 'SKALA', gammalt: 800, nytt: 1000, genomford: true, ...o });

const dom = (o = {}) => beslutaKampanj({ kampanj: kampanj(), d3: ins(2), d7: ins(2), dygn: dygnMed([2, 2, 2, 2, 2, 2, 2]), ekonomi, logg: [], idag, ...o });

// ------------------------------------------------------------ avrundningen

test('nyBudget: jämna 50 kr, nedåt vid höjning och uppåt vid sänkning — steget aldrig större än faktorn', () => {
  assert.equal(nyBudget(1000, 1.2), 1200);
  assert.equal(nyBudget(605, 1.2), 700);       // 726 → 700, inte 750 (+24 %)
  assert.equal(nyBudget(1000, 0.7), 700);
  assert.equal(nyBudget(605, 0.7), 450 < GOLV_SEK ? GOLV_SEK : 450); // 423,5 → golvet
  assert.equal(nyBudget(1230, 0.7), 900);      // 861 → 900 uppåt
  assert.equal(nyBudget(1000, RAKET_FAKTOR), 2000);
  assert.equal(nyBudget(3000, RAKET_FAKTOR), TAK_SEK);
  assert.equal(nyBudget(TAK_SEK, 1.2), null);  // taket nått
  assert.equal(nyBudget(GOLV_SEK, 0.7), null); // golvet nått
  assert.equal(nyBudget(520, 1.2), 600);
  assert.equal(nyBudget(0, 1.2), null);
});

test('forlustdygnIRad: spend utan ROAS är förlust, dygn utan spend bryter, lucka bryter', () => {
  assert.equal(forlustdygnIRad(dygnMed([2, 1, 1, 1, 1, 1]), 1.46), 5);
  assert.equal(forlustdygnIRad(dygnMed([1, 1, 1, 2, 1, 1]), 1.46), 2);
  assert.equal(forlustdygnIRad([...dygnMed([1, 1, 1]), { datum: '2026-09-06', spend: 0, roas: 0 }, ...dygnMed([1, 1], '2026-09-07')], 1.46), 2);
  const medLucka = [...dygnMed([1, 1, 1], '2026-09-01'), ...dygnMed([1, 1], '2026-09-06')];
  assert.equal(forlustdygnIRad(medLucka, 1.46), 2);
  assert.equal(forlustdygnIRad(dygnMed([undefined, undefined]), 1.46), 2); // ROAS saknas = 0 = förlust
  assert.equal(forlustdygnIRad([], 1.46), 0);
  assert.equal(forlustdygnIRad(dygnMed([1]), null), null);
});

test('budgetenheter: kampanjen om CBO, annars varje adset med egen budget', () => {
  assert.deepEqual(budgetenheter(kampanj(), [adset()]).map((e) => e.entitet_typ), ['campaign']);
  const abo = budgetenheter(kampanj({ daily_budget: '0' }), [adset(), adset({ id: 'a2', daily_budget: null }), adset({ id: 'a3', campaign_id: 'k9' })]);
  assert.deepEqual(abo.map((e) => e.entitet_id), ['a1']);
  assert.equal(abo[0].budget, 1000);
});

// ------------------------------------------------------------ kampanjreglerna

test('RAKET: ROAS ≥ 5 på 3d och 7d ⇒ dubbla, tillåtet dagen efter en ändring', () => {
  const [r] = dom({ d3: ins(6), d7: ins(5.2), logg: [loggrad()] });
  assert.equal(r.atgard, 'RAKET');
  assert.equal(r.gammalt, 1000);
  assert.equal(r.nytt, 2000);
  // Bara 3d över 5 räcker inte för raketen — men snabbspåret tar den.
  const [s] = dom({ d3: ins(6), d7: ins(3) });
  assert.equal(s.atgard, 'SNABB');
});

test('RAKET stannar vid taket', () => {
  const [r] = dom({ kampanj: kampanj({ daily_budget: '400000' }), d3: ins(6), d7: ins(6) });
  assert.equal(r.atgard, null);
  assert.match(r.sparr, /taket/);
});

test('SNABB: vinst 3d ≥ 25 % och ROAS 3d ≥ 3 ⇒ +20 % trots ändring i går', () => {
  const [r] = dom({ d3: ins(3), d7: ins(1.8), logg: [loggrad()] });
  assert.equal(r.atgard, 'SNABB');
  assert.equal(r.nytt, 1200);
});

test('SKALA: vinst ≥ 25 % på båda fönstren ⇒ +20 %, men spärrad av kadensen inom 3 dygn', () => {
  // ROAS 2,5 → 28,5 % vinst, under snabbspårets ROAS 3.
  const [ok] = dom({ d3: ins(2.5), d7: ins(2.5) });
  assert.equal(ok.atgard, 'SKALA');
  assert.equal(ok.nytt, 1200);
  const [gammal] = dom({ d3: ins(2.5), d7: ins(2.5), logg: [loggrad({ datum: '2026-09-07' })] });
  assert.equal(gammal.atgard, 'SKALA'); // exakt 3 dygn räcker
  const [sparrad] = dom({ d3: ins(2.5), d7: ins(2.5), logg: [loggrad({ datum: '2026-09-08' })] });
  assert.equal(sparrad.atgard, null);
  assert.match(sparrad.sparr, /kadensspärren: 2 dygn/);
  assert.equal(KADENS_DAGAR, 3);
  // 3d bra men 7d inte bekräftat, ROAS under 3 ⇒ håll.
  const [hall] = dom({ d3: ins(2.5), d7: ins(1.8) });
  assert.equal(hall.atgard, null);
  assert.match(hall.sparr, /inte bekräftat/);
});

test('HÅLL: 16 ≤ vinst 3d < 25 ⇒ ingen ändring', () => {
  const [r] = dom({ d3: ins(2), d7: ins(2) }); // 18,5 %
  assert.equal(r.atgard, null);
  assert.match(r.sparr, /Håll/);
});

test('SÄNK: vinst 3d < 16 % ⇒ −30 %, aldrig under golvet, spärrad av kadensen', () => {
  const [r] = dom({ d3: ins(1.6), d7: ins(1.6) }); // 6 %
  assert.equal(r.atgard, 'SANK');
  assert.equal(r.nytt, 700);
  const [forlust] = dom({ d3: ins(1.2), d7: ins(1.2), dygn: dygnMed([1.2, 1.2, 1.2]) }); // −14,8 %, 3 förlustdygn
  assert.equal(forlust.atgard, 'SANK');
  const [golv] = dom({ kampanj: kampanj({ daily_budget: '60000' }), d3: ins(1.6), d7: ins(1.6) });
  assert.equal(golv.atgard, 'SANK');
  assert.equal(golv.nytt, GOLV_SEK); // 420 → golvet 500
  const [paGolvet] = dom({ kampanj: kampanj({ daily_budget: '50000' }), d3: ins(1.6), d7: ins(1.6) });
  assert.equal(paGolvet.atgard, null);
  assert.match(paGolvet.sparr, /golvet/);
  const [kadens] = dom({ d3: ins(1.6), d7: ins(1.6), logg: [loggrad()] });
  assert.equal(kadens.atgard, null);
  assert.match(kadens.sparr, /kadensspärren/);
});

test('FÖRLUSTSERIE: fem förlustdygn i rad ⇒ SÄNK −30 % utan kadens, aldrig kampanjpaus (Axel 2026-09-10)', () => {
  const [r] = dom({ d3: ins(1.2), d7: ins(1.2), dygn: dygnMed([2, 1, 1.1, 0.9, 1, 1.3]), logg: [loggrad({ atgard: 'SANK', nytt: 1000, datum: '2026-09-09' })] });
  assert.equal(r.atgard, 'SANK');
  assert.equal(r.entitet_typ, 'campaign');
  assert.equal(r.nytt, 700);
  assert.match(r.motivering, /5 förlustdygn/);
  assert.match(r.motivering, /Ingen kampanjpaus/);
  assert.equal(FORLUSTDYGN_FOR_PAUS, 5);
  // På golvet: ingen paus, ingen åtgärd — döms på annonsnivå.
  const [golv] = dom({ d3: ins(1.2), d7: ins(1.2), dygn: dygnMed([2, 1, 1.1, 0.9, 1, 1.3]), kampanj: kampanj({ daily_budget: '50000' }) });
  assert.equal(golv.atgard, null);
  assert.match(golv.sparr, /pausas inte/);
  // Fyra räcker inte till förlustserien — men vinst 3d < 16 % sänker ändå (kadens ok).
  const [fyra] = dom({ d3: ins(1.2), d7: ins(1.2), dygn: dygnMed([2, 1, 1, 1, 1]) });
  assert.equal(fyra.atgard, 'SANK');
  assert.doesNotMatch(fyra.motivering, /förlustdygn/);
});

test('NOLL KÖP: −30 % varje gång; PAUSA bara när enheten redan står på golvet utan köp', () => {
  const noll = { d3: ins(0, { spend: 600, kop: 0 }), d7: ins(0, { spend: 1100, kop: 0 }), dygn: dygnMed([0, 0, 0]) };
  const [forsta] = dom(noll);
  assert.equal(forsta.atgard, 'NOLL_KOP_SANK');
  assert.equal(forsta.nytt, 700);
  const [andra] = dom({ ...noll, logg: [loggrad({ atgard: 'NOLL_KOP_SANK', nytt: 700, datum: '2026-09-06' })] });
  assert.equal(andra.atgard, 'NOLL_KOP_SANK'); // andra gången sänks igen — ingen kampanjpaus
  assert.match(andra.motivering, /igen/);
  const [gammalRad] = dom({ ...noll, logg: [loggrad({ atgard: 'NOLL_KOP_SANK', nytt: 700, datum: '2026-09-01' })] });
  assert.equal(gammalRad.atgard, 'NOLL_KOP_SANK'); // 9 dygn — utanför fönstret
  const [golv] = dom({ ...noll, kampanj: kampanj({ daily_budget: '50000' }) });
  assert.equal(golv.atgard, 'PAUSA');
  assert.match(golv.motivering, /golvet/);
  // Under 3 × break-even-CPA (1 002 kr) är det bara "för tidigt".
  const [tidigt] = dom({ d3: ins(0, { spend: 400, kop: 0 }), d7: ins(0, { spend: 900, kop: 0 }) });
  assert.equal(tidigt.atgard, null);
  assert.match(tidigt.sparr, /För tidigt/);
});

test('signifikansgrinden: under 300 kr eller 3 köp på 3d ⇒ ingen dom', () => {
  const [a] = dom({ d3: ins(6, { spend: 250, kop: 5 }), d7: ins(6) });
  assert.match(a.sparr, /För tidigt/);
  const [b] = dom({ d3: ins(6, { spend: 900, kop: 2 }), d7: ins(6) });
  assert.match(b.sparr, /För tidigt/);
});

test('test-ABO (namnet matchar /test/i) får varken budgetändring eller kampanjpaus', () => {
  const rader = dom({ kampanj: kampanj({ name: 'TANKGUARD_TEST_2026-09-09' }), d3: ins(6), d7: ins(6), dygn: dygnMed([1, 1, 1, 1, 1, 1]) });
  assert.equal(rader.length, 1);
  assert.equal(rader[0].atgard, null);
  assert.match(rader[0].sparr, /Test-ABO/);
});

test('PAUSED rörs aldrig — och aktiveras aldrig — hur bra siffrorna än ser ut', () => {
  const [r] = dom({ kampanj: kampanj({ status: 'PAUSED', effective_status: 'PAUSED' }), d3: ins(6), d7: ins(6) });
  assert.equal(r.atgard, null);
  assert.match(r.sparr, /PAUSED/);
  const [issues] = dom({ kampanj: kampanj({ effective_status: 'WITH_ISSUES' }), d3: ins(6), d7: ins(6) });
  assert.equal(issues.atgard, null);
  // Ett pausat adset i en ABO-kampanj rörs inte heller.
  const abo = dom({ kampanj: kampanj({ daily_budget: null }), adsets: [adset(), adset({ id: 'a2', status: 'PAUSED', effective_status: 'PAUSED' })], d3: ins(6), d7: ins(6) });
  assert.deepEqual(abo.map((r) => r.atgard), ['RAKET', null]);
  assert.match(abo[1].sparr, /PAUSED\/PAUSED — rörs inte/);
});

test('ABO: budgetenheten är adsetet, inte kampanjen', () => {
  const rader = dom({ kampanj: kampanj({ daily_budget: null }), adsets: [adset({ daily_budget: '80000' }), adset({ id: 'a2', name: 'TANKGUARD_lal', daily_budget: '60000' })], d3: ins(3), d7: ins(3) });
  assert.deepEqual(rader.map((r) => [r.entitet_typ, r.entitet_id, r.atgard, r.nytt]), [['adset', 'a1', 'SNABB', 950], ['adset', 'a2', 'SNABB', 700]]);
});

test('utan break-even (momsbeslutet obeslutat) fälls ingen dom', () => {
  const [r] = dom({ ekonomi: { breakEvenRoas: null, breakEvenCpa: null }, d3: ins(6), d7: ins(6) });
  assert.equal(r.atgard, null);
  assert.match(r.sparr, /Break-even saknas/);
});

// ------------------------------------------------------------ annonskills

const annons = (o = {}) => ({ ad_id: 'ad1', namn: 'TANKGUARD_PD_1_H1', kampanj: 'TANKGUARD_SALES', amount_spent: 1200, kop: 3, cpa: 400, effective_status: 'ACTIVE', dom: { klass: 'forlorare', vinst_generos: -198 }, ...o });

test('annonskill: förlorare på 14d OCH 7d-CPA över break-even ⇒ PAUSA; vänder trenden ⇒ ingen kill', () => {
  const [haller] = beslutaAnnonser({ annonser: [annons()], annonser7d: { ad1: { amount_spent: 500, kop: 1, cpa: 500 } }, ekonomi });
  assert.equal(haller.atgard, 'PAUSA');
  assert.equal(haller.entitet_typ, 'ad');
  const [vander] = beslutaAnnonser({ annonser: [annons()], annonser7d: { ad1: { amount_spent: 600, kop: 3, cpa: 200 } }, ekonomi });
  assert.equal(vander.atgard, null);
  assert.match(vander.sparr, /trenden vänder/);
  const [nollSpend7] = beslutaAnnonser({ annonser: [annons()], annonser7d: {}, ekonomi });
  assert.equal(nollSpend7.atgard, null);
  const [nollKop7] = beslutaAnnonser({ annonser: [annons()], annonser7d: { ad1: { amount_spent: 400, kop: 0, cpa: null } }, ekonomi });
  assert.equal(nollKop7.atgard, 'PAUSA');
});

test('ny annons-regeln: 14d spend ≥ 3 × target-CPA och inte lönsam ⇒ PAUSA; lönsam eller under spenden ⇒ inget', () => {
  // Utan target-CPA mäts mot break-even (334 kr ⇒ 1 002 kr).
  const [dod] = beslutaAnnonser({ annonser: [annons({ kop: 0, cpa: null, amount_spent: 1010, dom: { klass: 'for_tidigt', vinst_generos: null } })], ekonomi });
  assert.equal(dod.atgard, 'PAUSA');
  assert.match(dod.motivering, /Dödvikt: 0 köp/);
  assert.match(dod.motivering, /target saknas/);
  const [lever] = beslutaAnnonser({ annonser: [annons({ kop: 0, cpa: null, amount_spent: 900, dom: { klass: 'for_tidigt', vinst_generos: null } })], ekonomi });
  assert.equal(lever.atgard, null);
  // Med target-CPA 200 kr går gränsen vid 600 kr (Axel 2026-09-10: "3 gånger target cpa").
  const medTarget = { ...ekonomi, targetCpa: 200 };
  const [tidig] = beslutaAnnonser({ annonser: [annons({ kop: 0, cpa: null, amount_spent: 650, dom: { klass: 'for_tidigt', vinst_generos: null } })], ekonomi: medTarget });
  assert.equal(tidig.atgard, 'PAUSA');
  assert.match(tidig.motivering, /target-CPA 200 kr/);
  // Två köp till CPA över break-even är "inte lönsam" — pausas trots att grinden (3 köp) inte nåtts.
  const [tvaKop] = beslutaAnnonser({ annonser: [annons({ kop: 2, cpa: 400, amount_spent: 800, dom: { klass: 'for_tidigt', vinst_generos: null } })], ekonomi: medTarget });
  assert.equal(tvaKop.atgard, 'PAUSA');
  assert.match(tvaKop.motivering, /2 köp till CPA 400 kr över break-even/);
  // Två köp UNDER break-even är lönsamma — rörs inte, hur mycket den än spenderat.
  const [lonsam] = beslutaAnnonser({ annonser: [annons({ kop: 2, cpa: 300, amount_spent: 800, dom: { klass: 'for_tidigt', vinst_generos: null } })], ekonomi: medTarget });
  assert.equal(lonsam.atgard, null);
});

test('benchmarkskydd: annonsen med > 30 % av det positiva vinstbidraget döms aldrig; pausade annonser rörs inte', () => {
  const rader = beslutaAnnonser({
    annonser: [
      annons({ ad_id: 'top', namn: 'TOP', kop: 40, cpa: 250, amount_spent: 10000, dom: { klass: 'forlorare', vinst_generos: 3360 } }), // 100 % av positiva
      annons({ ad_id: 'ad2', namn: 'B', effective_status: 'PAUSED' }),
      annons({ ad_id: 'ad3', namn: 'C', dom: { klass: 'vinnare', vinst_generos: 0 } }),
    ],
    annonser7d: { top: { amount_spent: 3000, kop: 5, cpa: 600 }, ad2: { amount_spent: 500, kop: 1 } },
    ekonomi,
  });
  assert.deepEqual(rader.map((r) => r.atgard), [null, null, null]);
  assert.match(rader[0].sparr, /Benchmarken/);
  assert.match(rader[1].sparr, /PAUSED/);
  assert.match(rader[2].sparr, /ingen kill-kandidat/);
});

// ------------------------------------------------------------ max 3 + prioritet

test('max 3 ändringar per rond i prioritetsordning PAUSA > SÄNK > RAKET > SNABB > SKALA; resten väntar på Axel', () => {
  const rader = [
    { entitet_id: '1', namn: 'skala', atgard: 'SKALA', gammalt: 1000, nytt: 1200 },
    { entitet_id: '2', namn: 'raket', atgard: 'RAKET', gammalt: 1000, nytt: 2000 },
    { entitet_id: '3', namn: 'pausa', atgard: 'PAUSA', gammalt: 'ACTIVE', nytt: 'PAUSED' },
    { entitet_id: '4', namn: 'sank', atgard: 'SANK', gammalt: 1000, nytt: 700 },
    { entitet_id: '5', namn: 'snabb', atgard: 'SNABB', gammalt: 1000, nytt: 1200 },
    { entitet_id: '6', namn: 'hall', atgard: null, sparr: 'Håll' },
  ];
  const plan = prioritera(rader, { max: 3, logg: [], butik: 'tankguard/tankguard', idag });
  assert.deepEqual(plan.genomfor.map((r) => r.atgard), ['PAUSA', 'SANK', 'RAKET']);
  assert.deepEqual(plan.vantar.map((r) => r.atgard), ['SNABB', 'SKALA']);
  assert.match(plan.vantar[0].sparr, /väntar på Axel/);
  assert.equal(MAX_ANDRINGAR, 3);
  assert.ok(PRIORITET.PAUSA < PRIORITET.SANK && PRIORITET.SANK < PRIORITET.RAKET && PRIORITET.RAKET < PRIORITET.SNABB && PRIORITET.SNABB < PRIORITET.SKALA);
  // Redan gjorda ändringar i dag räknas av — en omkörning dubblar inte.
  const igen = prioritera(rader, { max: 3, logg: [loggrad({ datum: idag }), loggrad({ datum: idag, entitet_id: 'k2' })], butik: 'tankguard/tankguard', idag });
  assert.equal(igen.genomfor.length, 1);
  assert.equal(igen.genomfor[0].atgard, 'PAUSA');
});

test('besluta: hela butiken — förlustserien sänker kampanjen, annonserna döms var för sig, max 3 med prioritet', () => {
  const ut = besluta({
    kampanjer: [kampanj(), kampanj({ id: 'k2', name: 'TANKGUARD_SALES_2', daily_budget: '80000' })],
    insikter: { k1: { d3: ins(1.2), d7: ins(1.2) }, k2: { d3: ins(3), d7: ins(3) } },
    dygn: { k1: dygnMed([1, 1, 1, 1, 1, 1]), k2: dygnMed([3, 3, 3]) },
    annonser: [annons({ kampanj: 'TANKGUARD_SALES_2026-09-08' }), annons({ ad_id: 'ad2', kampanj: 'TANKGUARD_SALES_2' })],
    annonser7d: { ad1: { amount_spent: 500, kop: 1 }, ad2: { amount_spent: 500, kop: 1 } },
    ekonomi, logg: [], idag, butik: 'tankguard/tankguard',
  });
  // Sex förlustdygn ⇒ SÄNK, aldrig kampanjpaus (Axel 2026-09-10).
  assert.deepEqual(ut.kampanjrader.map((r) => r.atgard), ['SANK', 'SNABB']);
  assert.deepEqual(ut.annonsrader.map((r) => r.atgard), ['PAUSA', 'PAUSA']);
  assert.deepEqual(ut.plan.genomfor.map((r) => `${r.atgard}:${r.entitet_typ}`), ['PAUSA:ad', 'PAUSA:ad', 'SANK:campaign']);
  assert.deepEqual(ut.plan.vantar.map((r) => r.atgard), ['SNABB']);
});

test('besluta: annonser i en kampanj som pausas (golvet utan köp) följer med i stället för egen kill', () => {
  const ut = besluta({
    kampanjer: [kampanj({ daily_budget: '50000' })],
    insikter: { k1: { d3: ins(0, { spend: 600, kop: 0 }), d7: ins(0, { spend: 1100, kop: 0 }) } },
    dygn: { k1: dygnMed([0, 0, 0]) },
    annonser: [annons({ kampanj: 'TANKGUARD_SALES_2026-09-08', kop: 0, cpa: null, amount_spent: 1100, dom: { klass: 'for_tidigt', vinst_generos: null } })],
    annonser7d: { ad1: { amount_spent: 1100, kop: 0 } },
    ekonomi, logg: [], idag, butik: 'tankguard/tankguard',
  });
  assert.deepEqual(ut.kampanjrader.map((r) => r.atgard), ['PAUSA']);
  assert.deepEqual(ut.annonsrader.map((r) => r.atgard), [null]);
  assert.match(ut.annonsrader[0].sparr, /följer med/);
});
