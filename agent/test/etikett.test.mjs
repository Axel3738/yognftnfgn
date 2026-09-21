// Tester för etiketten dag 7 (Axels beslut 2026-09-20, ur Evolve-materialet).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ETIKETT, arBof, breakthroughFrekvens, budgetHojdUrLogg, dagarMellan, etikettera,
  formateraFrekvens, lasEtikettannons, raknaEtiketter, senasteEtikett,
} from '../etikett.mjs';

const kampanj = { spend: 10000, roas: 2.5, breakEven: 1.63, struktur: 'CBO', budgetHojd: true };
const annons = (extra = {}) => lasEtikettannons({ id: 'a', namn: 'Test_PD_1_H1', d0: '2026-09-20', spend: 3500, kop: 10, roas: 3.0, ...extra });

test('BREAKTHROUGH kräver andel ≥ 30 %, budgethöjning OCH ROAS ≥ break-even', () => {
  assert.equal(etikettera(annons(), kampanj).etikett, ETIKETT.BREAKTHROUGH);
  // Ingen höjning ⇒ spend winner.
  assert.equal(etikettera(annons(), { ...kampanj, budgetHojd: false }).etikett, ETIKETT.SPEND_WINNER);
  // Höjning men under break-even ⇒ spend winner, inte breakthrough (KPI-kravet).
  assert.equal(etikettera(annons({ roas: 1.2 }), kampanj).etikett, ETIKETT.SPEND_WINNER);
  // Okänd höjning (null) räknas aldrig som höjning.
  assert.equal(etikettera(annons(), { ...kampanj, budgetHojd: null }).etikett, ETIKETT.SPEND_WINNER);
});

test('KPI_WINNER: under 30 %, minst ett köp, ROAS ≥ kampanjens; annars LOSER', () => {
  assert.equal(etikettera(annons({ spend: 600, kop: 2, roas: 2.6 }), kampanj).etikett, ETIKETT.KPI_WINNER);
  assert.equal(etikettera(annons({ spend: 600, kop: 2, roas: 2.4 }), kampanj).etikett, ETIKETT.LOSER);
  assert.equal(etikettera(annons({ spend: 600, kop: 0, roas: null }), kampanj).etikett, ETIKETT.LOSER);
});

test('INGEN_LEVERANS under 10 kr; INGEN_DATA utan kampanjspend; ABO ger bara KPI/LOSER', () => {
  assert.equal(etikettera(annons({ spend: 4 }), kampanj).etikett, ETIKETT.INGEN_LEVERANS);
  assert.equal(etikettera(annons(), { ...kampanj, spend: null }).etikett, ETIKETT.INGEN_DATA);
  const abo = etikettera(annons(), { ...kampanj, struktur: 'ABO' });
  assert.equal(abo.etikett, ETIKETT.KPI_WINNER);
  assert.equal(abo.andel, null);
});

test('bedombar följer grinden 300 kr / 3 köp; preliminär vid 3–4 köp; etikett sätts ändå', () => {
  const liten = etikettera(annons({ spend: 250, kop: 1, roas: 3 }), kampanj);
  assert.equal(liten.bedombar, false);
  assert.equal(liten.etikett, ETIKETT.KPI_WINNER);
  const prel = etikettera(annons({ spend: 400, kop: 3, roas: 3 }), kampanj);
  assert.equal(prel.bedombar, true);
  assert.equal(prel.preliminar, true);
  assert.equal(etikettera(annons({ kop: 8 }), kampanj).preliminar, false);
});

test('nära 30 %: budgetkriteriet avgör — 28 % med höjning och KPI är breakthrough, 28 % utan är loser/KPI', () => {
  const nara = etikettera(annons({ spend: 2800 }), kampanj);
  assert.equal(nara.nara_grans, true);
  assert.equal(nara.etikett, ETIKETT.BREAKTHROUGH);
  assert.equal(etikettera(annons({ spend: 2800 }), { ...kampanj, budgetHojd: false }).etikett, ETIKETT.KPI_WINNER);
});

test('budgetHojdUrLogg: SKALA i fönstret, eller sista kända budget > första; annars null', () => {
  const logg = [
    { datum: '2026-09-20', kampanj_id: 'K', kod: 'LAT_VARA', genomford: false, gammal_budget: 1000, ny_budget: null },
    { datum: '2026-09-24', kampanj_id: 'K', kod: 'LAT_VARA', genomford: false, gammal_budget: 1000, ny_budget: null },
  ];
  assert.equal(budgetHojdUrLogg(logg, 'K', '2026-09-20', '2026-09-27'), false);
  assert.equal(budgetHojdUrLogg([...logg, { datum: '2026-09-25', kampanj_id: 'K', kod: 'SKALA', genomford: true, gammal_budget: 1000, ny_budget: 1200 }], 'K', '2026-09-20', '2026-09-27'), true);
  // Axels egen höjning syns bara som gammal_budget som växer.
  assert.equal(budgetHojdUrLogg([...logg, { datum: '2026-09-26', kampanj_id: 'K', kod: 'MANUELL', genomford: false, gammal_budget: 16000, ny_budget: null }], 'K', '2026-09-20', '2026-09-27'), true);
  assert.equal(budgetHojdUrLogg([], 'K', '2026-09-20', '2026-09-27'), null);
  // Rader utanför fönstret räknas inte.
  assert.equal(budgetHojdUrLogg([{ datum: '2026-09-28', kampanj_id: 'K', kod: 'SKALA', genomford: true, ny_budget: 1200 }], 'K', '2026-09-20', '2026-09-27'), null);
});

test('raknaEtiketter: bara annonser ≥ 7 dygn, aldrig två gånger, ny_budget aldrig med', () => {
  const jobb = {
    datum: '2026-09-27', ad_account_id: 'act_1867947880635861', kampanj_id: 'K', kampanj_namn: 'Test | BE ROAS 1.63',
    break_even: 1.63, kampanj: { spend: '10 000,00 kr (SEK)', roas: '2.5' }, budget_d0: 1000, budget_d7: 1200,
    annonser: [
      { id: 'a1', namn: 'Test_PD_1_H1', d0: '2026-09-20', spend: '3 500,00 kr (SEK)', kop: 10, roas: '3.0', batch: 2, typ: 'N' },
      { id: 'a2', namn: 'Test_PD_1_H2', d0: '2026-09-22', spend: '900,00 kr (SEK)', kop: 1, roas: '1.0' },
      { id: 'a3', namn: 'Test_BOF_2_1', d0: '2026-09-19', spend: '2,00 kr (SEK)', kop: 0 },
    ],
  };
  const { rader, hoppade } = raknaEtiketter(jobb, []);
  assert.equal(rader.length, 2);
  assert.equal(hoppade.length, 1);
  assert.match(hoppade[0].orsak, /5 dygn/);
  const bt = rader.find((r) => r.annons_id === 'a1');
  assert.equal(bt.etikett, ETIKETT.BREAKTHROUGH);
  assert.equal(bt.kod, 'ETIKETT');
  assert.equal(bt.ad_account_id, '1867947880635861');
  assert.equal(bt.d6, '2026-09-26');
  assert.equal(bt.budget_hojd, true);
  assert.equal(bt.bedombar, true);
  assert.equal(bt.genomford, true);
  assert.equal('ny_budget' in bt, false);
  const bof = rader.find((r) => r.annons_id === 'a3');
  assert.equal(bof.etikett, ETIKETT.INGEN_LEVERANS);
  assert.equal(bof.bof, true);
  // Andra körningen: redan etiketterade hoppas.
  const igen = raknaEtiketter(jobb, rader);
  assert.equal(igen.rader.length, 0);
  assert.equal(igen.hoppade.filter((h) => /redan etiketterad/.test(h.orsak)).length, 2);
  // Uppgradering: en SPEND_WINNER som nu är BREAKTHROUGH får en ny rad; en BREAKTHROUGH får ingen.
  const gammal = [{ ...bt, etikett: ETIKETT.SPEND_WINNER, datum: '2026-09-27' }];
  const upp = raknaEtiketter({ ...jobb, datum: '2026-10-04' }, gammal, { uppgradering: true });
  assert.equal(upp.rader.filter((r) => r.kod === 'ETIKETT_UPPGRADERAD').length, 1);
  // Är a1 redan BREAKTHROUGH uppgraderas inget — men a2 (5 dygn första gången) får nu sin första etikett.
  const senare = raknaEtiketter({ ...jobb, datum: '2026-10-04' }, rader, { uppgradering: true });
  assert.equal(senare.rader.filter((r) => r.kod === 'ETIKETT_UPPGRADERAD').length, 0);
  assert.deepEqual(senare.rader.map((r) => r.annons_id), ['a2']);
});

test('breakthroughFrekvens: per kampanj och batch, BOF utanför nämnaren, uppgradering räknas, procent först vid 10', () => {
  const rad = (annons_id, etikett, batch = 1, extra = {}) => ({ kod: 'ETIKETT', datum: '2026-09-27', ad_account_id: '1', kampanj_id: 'K', kampanj_namn: 'Test | BE', annons_id, annons_namn: `Test_PD_${annons_id}_1`, etikett, batch, ...extra });
  const logg = [
    rad('1', 'BREAKTHROUGH'), rad('2', 'LOSER'), rad('3', 'KPI_WINNER'), rad('4', 'INGEN_LEVERANS', 2),
    rad('5', 'SPEND_WINNER', 2), { ...rad('5', 'BREAKTHROUGH', 2), kod: 'ETIKETT_UPPGRADERAD', datum: '2026-10-04' },
    { ...rad('6', 'LOSER', 2), annons_namn: 'Test_BOF_6_1', bof: true },
  ];
  const [g] = breakthroughFrekvens(logg);
  assert.equal(g.antal, 5);
  assert.equal(g.breakthroughs, 2);
  assert.equal(g.frekvens, '2/5');
  assert.deepEqual(g.batcher.map((b) => b.frekvens), ['1/3', '1/2']);
  assert.equal(formateraFrekvens(3, 21), '3/21 (14 %)');
  assert.equal(formateraFrekvens(0, 0), '0/0');
  assert.equal(senasteEtikett(logg, '5').kod, 'ETIKETT_UPPGRADERAD');
});

test('hjälpare: dagarMellan, arBof, hook/hold ur råa fält', () => {
  assert.equal(dagarMellan('2026-09-20', '2026-09-27'), 7);
  assert.equal(arBof('Takoverdrag_BOF_3_1'), true);
  assert.equal(arBof('Takoverdrag_PD_3_1'), false);
  const a = lasEtikettannons({ id: 'x', namn: 'N', d0: '2026-09-20T07:00:00+0000', spend: '1 000,00 kr (SEK)', impressions: 20000, video_3s: 5000, thruplay: 1000 });
  assert.equal(a.d0, '2026-09-20');
  assert.equal(a.hook_rate, 0.25);
  assert.equal(a.hold_rate, 0.05);
  assert.equal(a.roas, 0);
});

test('osäker: spend winner med KPI men utan budgethistorik märks, gissas aldrig upp till breakthrough', () => {
  const e = etikettera(annons(), { ...kampanj, budgetHojd: null });
  assert.equal(e.etikett, ETIKETT.SPEND_WINNER);
  assert.equal(e.osaker_breakthrough, true);
  // Under break-even: vanlig spend winner, inte osäker.
  assert.equal(etikettera(annons({ roas: 1.2 }), { ...kampanj, budgetHojd: null }).osaker_breakthrough, undefined);
  const logg = [
    { kod: 'ETIKETT', datum: '2026-09-21', ad_account_id: '1', kampanj_id: 'K', kampanj_namn: 'T | BE', annons_id: 'x', annons_namn: 'T_PD_1_1', etikett: 'SPEND_WINNER', osaker_breakthrough: true },
    { kod: 'ETIKETT', datum: '2026-09-21', ad_account_id: '1', kampanj_id: 'K', kampanj_namn: 'T | BE', annons_id: 'y', annons_namn: 'T_PD_2_1', etikett: 'LOSER' },
  ];
  const [g] = breakthroughFrekvens(logg);
  assert.equal(g.osakra, 1);
  assert.equal(g.frekvens, '0/2');
});
