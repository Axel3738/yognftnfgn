// Tester för Evolve-genomgången 2026-10-01 (docs/os/evolve/EVOLVE-GAP-ANALYS.md):
// tillväxten mot veckan före, uppgraderingen vecka 2–3, hit rate, namnets
// iterationskedja, utlandets startdag, arkivet och domen per marknad.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { etikettera, tillvaxt, yttreHandelse, arUppgradering, gallandeEtiketter, hitRate, ETIKETT } from '../etikett.mjs';
import { tolka, bygg, foralderToken, foralderNamn, nastaNummer, adsetNyckel, nastaIterationPa } from '../namn.mjs';
import { startdag, summeraDagar, annonsD0, veckaFonster, utlandskampanjer, byggJobbfil } from '../meta.mjs';
import { matningsrader, laggTillMatningar, lasMatningar, kreatorFor, byggArkiv, arkivMarkdown } from '../arkiv.mjs';
import { lasKonfig, etikettraderFor, korDom } from '../kor.mjs';
import { brytpunkter } from '../ekonomi.mjs';

const konfig = lasKonfig();
const G = konfig.grindar;

// ── etiketterna ──────────────────────────────────────────────────────────────

test('tillväxt mäts på kampanjens spend mot veckan FÖRE annonsen, inte på en budgetknapp', () => {
  assert.equal(tillvaxt({ spend_sek: 11000, spend_w0_sek: 10000 }).vaxte, true, '+10 % räcker');
  assert.equal(tillvaxt({ spend_sek: 10900, spend_w0_sek: 10000 }).vaxte, false, '+9 % räcker inte');
  const r = tillvaxt({ spend_sek: 10000, spend_w0_sek: 10000, budget_d0: 1000, budget_d7: 10000 });
  assert.equal(r.vaxte, false, 'en budgethöjning utan växande spend är ingen tillväxt');
  assert.equal(r.kalla, 'spend mot veckan före');
});

test('utan spend veckan före (ny kampanj) gäller budgetreserven', () => {
  const r = tillvaxt({ spend_sek: 5000, spend_w0_sek: 0, budget_d0: 1000, budget_d7: 2000 });
  assert.equal(r.vaxte, true);
  assert.match(r.kalla, /budgeten/);
  assert.equal(tillvaxt({ spend_sek: 5000 }).vaxte, null, 'inget att mäta ⇒ null, aldrig en gissning');
});

test('en höjning för hand i fönstret står på etiketten som yttre händelse', () => {
  const kamp = { spend_sek: 20000, spend_w0_sek: 7000, roas: 1.4, budgetandringar: [{ tid: '2026-09-23T10:00:00+0200', fran_sek: 1000, till_sek: 10000 }] };
  const e = etikettera({ namn: 'NAT', spend_sek: 12000, kop: 40, roas: 1.8 }, kamp, 1.498, G);
  assert.equal(e.etikett, ETIKETT.BREAKTHROUGH);
  assert.match(e.yttre_handelse, /1000→10000/);
  assert.equal(yttreHandelse([{ tid: 'x', fran_sek: 2000, till_sek: 1000 }]), null, 'en sänkning är ingen yttre medvind');
});

test('break-even okänt (utlandet) ⇒ aldrig BREAKTHROUGH, och det står varför', () => {
  const e = etikettera({ namn: 'NO', spend_sek: 4000, kop: 10, roas: 3 }, { spend_sek: 6000, spend_w0_sek: 1000, roas: 2 }, null, G);
  assert.equal(e.etikett, ETIKETT.SPEND_WINNER);
  assert.equal(e.osaker_breakthrough, true);
  assert.match(e.motivering, /break-even okänt/);
});

test('etiketten går bara uppåt: loser → breakthrough ja, breakthrough → loser aldrig', () => {
  assert.equal(arUppgradering('LOSER', 'BREAKTHROUGH'), true);
  assert.equal(arUppgradering('KPI_WINNER', 'SPEND_WINNER'), true);
  assert.equal(arUppgradering('BREAKTHROUGH', 'LOSER'), false);
  assert.equal(arUppgradering('SPEND_WINNER', 'SPEND_WINNER'), false);
  assert.equal(arUppgradering(null, 'LOSER'), true);
  const g = gallandeEtiketter([{ annons: 'A', etikett: 'KPI_WINNER' }, { annons: 'A', etikett: 'BREAKTHROUGH' }, { annons: 'A', etikett: 'LOSER' }]);
  assert.equal(g.get('A').etikett, 'BREAKTHROUGH', 'högsta loggade etiketten gäller');
});

test('hit rate = (breakthrough + spend winner) / alla, och utan INGEN_LEVERANS i den andra nämnaren', () => {
  const h = hitRate([{ etikett: 'BREAKTHROUGH' }, { etikett: 'SPEND_WINNER' }, { etikett: 'LOSER' }, { etikett: 'INGEN_LEVERANS' }, { etikett: 'INGEN_LEVERANS' }]);
  assert.deepEqual([h.traff, h.alla, h.levererade], [2, 5, 3]);
  assert.match(h.text, /2\/5/);
  assert.match(h.text, /2\/3/);
});

// ── namnets iterationskedja ──────────────────────────────────────────────────

test('namnet bär iterationskedjan: hook, iteration på förälder, imitation — och gamla namn tolkas som förut', () => {
  const n = bygg({ vinkel: 'gift', format: 'ugc', nummer: 65, hook: 2, iteration: 5, foralder: 'nat' }, konfig);
  assert.equal(n, 'MATSTRUMP_sushi_gift_ugc_065_h2_i5pnat_v1');
  const t = tolka(n);
  assert.deepEqual([t.nummer, t.hook, t.typ, t.iteration, t.foralder], [65, 2, 'ITER', 5, 'nat']);
  assert.equal(tolka('MATSTRUMP_sushi_gift_ugc_066_im_v1').typ, 'IMIT');
  const gammal = tolka('MATSTRUMP_sushi_jul_ugc_044h1_v1');
  assert.deepEqual([gammal.nummer, gammal.hook, gammal.typ], [44, 1, null], '044h1 = löpnummer 44, hook 1');
  assert.equal(tolka('MATSTRUMP_sushi_gift_ugc_s001h1_v2').nummer, null);
  assert.throws(() => bygg({ vinkel: 'gift', format: 'ugc', nummer: 1, iteration: 1, foralder: 'okand' }, konfig), /varken ett löpnummer eller ett alias/);
  assert.throws(() => bygg({ vinkel: 'gift', format: 'ugc', nummer: 1, iteration: 1, foralder: 54, imitation: true }, konfig), /inte båda/);
});

test('föräldern slås upp åt båda hållen: löpnummer, alias och Axels fulla namn', () => {
  assert.equal(foralderToken(54, konfig), '054');
  assert.equal(foralderToken('09-17 Nathalie captions musik', konfig), 'nat');
  assert.equal(foralderToken('MATSTRUMP_sushi_gift_ugc_054_v2', konfig), '054');
  assert.equal(foralderNamn('nat', [], konfig), '09-17 Nathalie captions musik');
  assert.equal(foralderNamn('054', ['MATSTRUMP_sushi_gift_ugc_054_h2_v1', 'MATSTRUMP_sushi_gift_ugc_054_v1'], konfig), 'MATSTRUMP_sushi_gift_ugc_054_v1', 'huvudversionen före hookvarianten');
});

test('utlandets namn flyttar inte den svenska numreringen och laddas aldrig upp i ett svenskt adset', () => {
  assert.equal(nastaNummer(['MATSTRUMP_sushi_gift_ugc_064_v1', 'MATSTRUMP_NO_sushi_gift_ugc_099_v1']), 65);
  assert.equal(tolka('MATSTRUMP_NO_sushi_gift_ugc_099_v1').land, 'NO');
  assert.equal(adsetNyckel('MATSTRUMP_NO_sushi_gift_ugc_099_v1', konfig), null);
  assert.equal(adsetNyckel('MATSTRUMP_sushi_gift_ugc_065_h2_i5pnat_v1', konfig), 'video');
});

test('nästa iteration på en förälder räknas ur namnen OCH ur BRIEF-raderna', () => {
  const briefrader = [1, 2, 9].map((i) => ({ kod: 'BRIEF', parent: '09-17 Nathalie captions musik', iteration: i }));
  assert.equal(nastaIterationPa('nat', { briefrader }, konfig), 10, 'nio iterationer briefade före namnregeln');
  assert.equal(nastaIterationPa('nat', { kandaNamn: ['MATSTRUMP_sushi_gift_ugc_070_h1_i12pnat_v1'], briefrader }, konfig), 13);
  assert.equal(nastaIterationPa(54, { kandaNamn: ['MATSTRUMP_sushi_gift_ugc_070_i3pnat_v1'] }, konfig), 1, 'en annan förälder räknas inte');
});

// ── utlandets startdag ───────────────────────────────────────────────────────

const dag = (date_start, spend, kop = 0, roas = null) => ({ date_start, spend: String(spend), actions: kop ? [{ action_type: 'omni_purchase', value: String(kop), '7d_click': String(kop) }] : [], purchase_roas: roas ? [{ action_type: 'omni_purchase', value: String(roas), '7d_click': String(roas) }] : [] });

test('D0 = max(annonsen skapad, kampanjens första spenddag) — en annons byggd PAUSED räknas från starten', () => {
  const serie = [dag('2026-09-28', 0), dag('2026-10-02', 1000)];
  assert.equal(startdag(serie), '2026-10-02');
  assert.equal(startdag([dag('2026-09-28', 0)]), null, 'ingen spend ⇒ ingen startdag');
  assert.equal(annonsD0('2026-09-28T10:00:00+0200', '2026-10-02'), '2026-10-02');
  assert.equal(annonsD0('2026-10-05T10:00:00+0200', '2026-10-02'), '2026-10-05');
  assert.equal(annonsD0('2026-09-28T10:00:00+0200', null), null, 'kampanjen har inte startat');
  assert.equal(annonsD0('2026-09-28T10:00:00+0200', undefined), '2026-09-28', 'äldre jobbfil utan kampanjstart');
});

test('summeraDagar: kampanjens spend, köp och spendvägd ROAS i ett fönster', () => {
  const serie = [dag('2026-09-01', 1000, 2, 1), dag('2026-09-02', 3000, 6, 2), dag('2026-09-09', 500)];
  const s = summeraDagar(serie, '2026-09-01', '2026-09-07');
  assert.deepEqual([s.spend_sek, s.kop, s.roas], [4000, 8, 1.75]);
  assert.deepEqual(veckaFonster('2026-09-01', '2026-09-30', 2).since, '2026-09-08');
});

test('utlandskampanjer: bara kampanjer med annonser, landskoden följer med', () => {
  const lage = { kampanjer: [
    { kod: 'NO', kampanj: { id: '1', name: 'MATSTRUMP_NO_SALES' }, annonser: [{ id: 'a' }] },
    { kod: 'TW', kampanj: { id: '2', name: 'MATSTRUMP_TW_SALES' }, annonser: [] },
    { kod: 'DE', kampanj: { id: '3' }, annonser: [{ id: 'b' }] },
  ] };
  assert.deepEqual(utlandskampanjer(lage), [{ id: '1', namn: 'MATSTRUMP_NO_SALES', marknad: 'NO' }]);
});

test('byggJobbfil: en kampanj som inte spenderat ger inga etiketter — annonserna står som unga med orsak', () => {
  const jobb = byggJobbfil({
    idag: '2026-10-08', konto: '730973156224390', marknad: 'NO',
    kampanj: { id: 'k', name: 'MATSTRUMP_NO_SALES', effective_status: 'PAUSED', daily_budget: '100000' },
    annonser: [{ id: '1', name: 'MATSTRUMP_NO_sushi_gift_ugc_001_v1', created_time: '2026-09-28T10:00:00+0200', effective_status: 'PAUSED', adset: { id: 'x', name: 'a' } }],
    insikter14: [], kampanj14: {}, perFonster: {}, perVecka: {}, dagserie: [], kampanjStart: null, historik: [],
  });
  const a = jobb.annonser[0];
  assert.equal(a.d0, null);
  assert.equal(a.forsta_vecka.komplett, false);
  assert.equal(a.marknad, 'NO');
  const { etiketter, unga } = etikettraderFor(jobb, { logg: [], breakEven: null, grindar: G, idag: '2026-10-08' });
  assert.equal(etiketter.length, 0, 'aldrig INGEN_LEVERANS på en annons vars kampanj inte startat');
  assert.equal(unga.length, 1);
});

test('byggJobbfil: en annons som startade i dag får ingen etikett på 14-dagarstalen', () => {
  const jobb = byggJobbfil({
    idag: '2026-10-01', konto: '730973156224390',
    kampanj: { id: 'k', name: 'MATSTRUMP_SALES_20260826', effective_status: 'ACTIVE', daily_budget: '1000000' },
    annonser: [{ id: '1', name: 'MATSTRUMP_sushi_gift_ugc_066_v1', created_time: '2026-10-01T08:00:00+0200', effective_status: 'ACTIVE' }],
    insikter14: [{ ad_id: '1', spend: '40.00', actions: [], purchase_roas: [] }], kampanj14: { spend: '20000' },
    perFonster: {}, perVecka: {}, dagserie: [dag('2026-08-27', 1000)], kampanjStart: '2026-08-27', historik: [],
  });
  assert.equal(jobb.annonser[0].d0, '2026-10-01');
  assert.equal(jobb.annonser[0].forsta_vecka.komplett, false);
  const { etiketter, unga } = etikettraderFor(jobb, { logg: [], breakEven: 1.498, grindar: G, idag: '2026-10-01' });
  assert.equal(etiketter.length, 0);
  assert.match(unga[0].skal, /inga siffror/);
});

// ── domen och loggen ─────────────────────────────────────────────────────────

const JOBB = {
  datum: '2026-10-01', konto: '730973156224390', marknad: 'SE',
  kampanj: { namn: 'MATSTRUMP_SALES_20260826', spend_sek: 20000, kop: 50, roas: 1.4, fonster: 'last_14d' },
  annonser: [
    { namn: 'A', spend_sek: 9000, kop: 25, roas: 1.6, d0: '2026-09-10',
      forsta_vecka: { since: '2026-09-10', until: '2026-09-16', komplett: true, spend_sek: 2000, kop: 5, roas: 1.6, kampanj_spend_sek: 10000, kampanj_roas: 1.4, kampanj_spend_w0_sek: 9000 },
      veckor: { 2: { since: '2026-09-17', until: '2026-09-23', komplett: true, spend_sek: 6000, kop: 18, roas: 1.7, kampanj_spend_sek: 15000, kampanj_roas: 1.5, kampanj_spend_w0_sek: 10000 } } },
    { namn: 'B', spend_sek: 50, kop: 0, roas: null, d0: '2026-09-28', forsta_vecka: { since: '2026-09-28', until: '2026-09-30', komplett: false, dagar_med_data: 3 } },
  ],
};

test('etikettraderFor: vecka 1 loggas en gång, vecka 2 bara som uppgradering', () => {
  const forsta = etikettraderFor(JOBB, { logg: [], breakEven: 1.498, grindar: G, idag: '2026-10-01' });
  const a = forsta.etiketter.find((e) => e.namn === 'A');
  assert.equal(a.etikett, ETIKETT.KPI_WINNER, 'vecka 1: 20 % av spenden, ROAS över kampanjens');
  assert.deepEqual(a.att_logga.map((r) => [r.vecka, r.etikett, r.uppgradering_fran ?? null]), [[1, 'KPI_WINNER', null], [2, 'BREAKTHROUGH', 'KPI_WINNER']]);
  assert.equal(forsta.unga[0].namn, 'B');

  const logg = a.att_logga.map((r) => ({ ...r }));
  const andra = etikettraderFor(JOBB, { logg, breakEven: 1.498, grindar: G, idag: '2026-10-02' });
  assert.equal(andra.etiketter.find((e) => e.namn === 'A').att_logga.length, 0, 'inget skrivs två gånger');

  const gammal = [{ kod: 'ETIKETT', annons: 'A', etikett: 'LOSER', datum: '2026-09-17' }];
  const tredje = etikettraderFor(JOBB, { logg: gammal, breakEven: 1.498, grindar: G, idag: '2026-10-01' });
  assert.deepEqual(tredje.etiketter.find((e) => e.namn === 'A').att_logga.map((r) => r.etikett), ['BREAKTHROUGH'], 'vecka 1 skrivs aldrig om, uppgraderingen skrivs');
});

test('en uppgradering vecka 2–3 måste bära: ett köp för 18 kr gör ingen KPI winner av en loser', () => {
  const jobb = { ...JOBB, annonser: [{ namn: 'D2', d0: '2026-09-02',
    forsta_vecka: { since: '2026-08-27', until: '2026-09-02', komplett: true, spend_sek: 40, kop: 0, roas: null, kampanj_spend_sek: 10000, kampanj_roas: 1.4 },
    veckor: { 2: { since: '2026-09-03', until: '2026-09-09', komplett: true, spend_sek: 18, kop: 1, roas: 44, kampanj_spend_sek: 10000, kampanj_roas: 1.4 },
              3: { since: '2026-09-10', until: '2026-09-16', komplett: true, spend_sek: 320, kop: 3, roas: 2.1, kampanj_spend_sek: 10000, kampanj_roas: 1.4 } } }] };
  const { etiketter } = etikettraderFor(jobb, { logg: [{ kod: 'ETIKETT', annons: 'D2', etikett: 'LOSER', datum: '2026-09-04' }], breakEven: 1.498, grindar: G, idag: '2026-10-01' });
  assert.deepEqual(etiketter[0].att_logga.map((r) => [r.vecka, r.etikett]), [[3, 'KPI_WINNER']], 'vecka 2 är brus, vecka 3 är över grinden');
});

test('ett läst fönster utan rad för annonsen = 0 kr (INGEN_LEVERANS), inte "spend saknas"', () => {
  const jobb = byggJobbfil({
    idag: '2026-10-01', konto: '730973156224390',
    kampanj: { id: 'k', name: 'MATSTRUMP_SALES_20260826', effective_status: 'ACTIVE', daily_budget: '1000000' },
    annonser: [{ id: '1', name: 'X', created_time: '2026-09-02T08:00:00+0200' }, { id: '2', name: 'Y', created_time: '2026-09-02T08:00:00+0200' }],
    insikter14: [], kampanj14: {},
    perFonster: { '2026-09-02': { since: '2026-09-02', until: '2026-09-08', komplett: true, dagar_med_data: 7, annonser: new Map([['2', { ad_id: '2', spend: '500', actions: [], purchase_roas: [] }]]), kampanj: { spend: '7000' } } },
    perVecka: {}, dagserie: [dag('2026-08-27', 1000)], kampanjStart: '2026-08-27', historik: [],
  });
  assert.equal(jobb.annonser[0].forsta_vecka.spend_sek, 0);
  const { etiketter } = etikettraderFor(jobb, { logg: [], breakEven: 1.498, grindar: G, idag: '2026-10-01' });
  assert.equal(etiketter.find((e) => e.namn === 'X').etikett, ETIKETT.INGEN_LEVERANS);
});

test('korDom skriver ETIKETT-raderna med --logga, aldrig dubbelt, och domen per marknad', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'kordom-'));
  const loggfil = join(mapp, 'logg.jsonl');
  const bryt = brytpunkter(konfig);
  const d = korDom(JOBB, konfig, bryt, { json: null, logga: true, loggfil, utmapp: mapp, tyst: true });
  assert.equal(d.att_logga.length, 2);
  const rader = readFileSync(loggfil, 'utf8').trim().split('\n').map((r) => JSON.parse(r));
  assert.deepEqual(rader.map((r) => [r.annons, r.etikett, r.marknad]), [['A', 'KPI_WINNER', 'SE'], ['A', 'BREAKTHROUGH', 'SE']]);
  assert.ok(existsSync(join(mapp, 'dom-2026-10-01.json')));
  const igen = korDom(JOBB, konfig, bryt, { json: false, logga: true, loggfil, utmapp: mapp, tyst: true });
  assert.equal(igen.att_logga.length, 0);
  assert.equal(readFileSync(loggfil, 'utf8').trim().split('\n').length, 2);

  const no = korDom({ ...JOBB, marknad: 'NO' }, konfig, bryt, { json: null, logga: false, loggfil: join(mapp, 'no.jsonl'), utmapp: mapp, tyst: true });
  assert.equal(no.ranking, null, 'inget vinstbidrag utan break-even per marknad');
  assert.equal(no.break_even_roas, null);
  assert.notEqual(no.etiketter.find((e) => e.namn === 'A').att_logga.at(-1).etikett, 'BREAKTHROUGH', 'utlandet kan inte bli breakthrough utan break-even');
  assert.ok(existsSync(join(mapp, 'dom-2026-10-01-NO.json')));
  assert.throws(() => korDom({ ...JOBB, konto: '1867947880635861' }, konfig, bryt, { tyst: true }), /fel konto/);
});

// ── arkivet ──────────────────────────────────────────────────────────────────

test('mätningarna: en rad per annons och dag, bara annonser med spend, aldrig dubbelt', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'arkiv-'));
  const fil = join(mapp, 'matningar.jsonl');
  const jobb = { datum: '2026-10-01', marknad: 'SE', annonser: [{ id: '1', namn: 'A', spend_sek: 100, kop: 1, roas: 2, hook_rate: 0.3 }, { id: '2', namn: 'B', spend_sek: 0 }] };
  assert.equal(matningsrader(jobb).length, 1);
  assert.equal(laggTillMatningar(jobb, fil), 1);
  assert.equal(laggTillMatningar(jobb, fil), 0);
  const [rad] = lasMatningar(fil);
  assert.equal(rad.hook_rate, 0.3);
  assert.equal(rad.cpm_sek, null, 'saknat tal är null, aldrig 0');
});

test('kreatören läses ur namnet, briefen eller föräldern', () => {
  assert.equal(kreatorFor('09-17 Nathalie captions musik', {}, konfig), 'nathalie');
  assert.equal(kreatorFor('MATSTRUMP_sushi_gift_ugc_070_v1', { brief: { kreator: 'Katarina Kruger' } }, konfig), 'katarina');
  assert.equal(kreatorFor('MATSTRUMP_sushi_gift_ugc_071_i1pnat_v1', { foralder: '09-17 Nathalie captions musik' }, konfig), 'nathalie');
  assert.equal(kreatorFor('MATSTRUMP_sushi_gift_static_072_v1', {}, konfig), null);
});

test('byggArkiv räknar kedjor, varianter, koncept och hit rate ur loggen + mätningarna', () => {
  const logg = [
    { kod: 'ETIKETT', annons: '09-17 Nathalie captions musik', etikett: 'BREAKTHROUGH', datum: '2026-09-24' },
    { kod: 'ETIKETT', annons: 'MATSTRUMP_sushi_gift_ugc_065_i1pnat_v1', etikett: 'LOSER', datum: '2026-10-08' },
    { kod: 'ETIKETT', annons: 'MATSTRUMP_sushi_gift_ugc_065_h2_i2pnat_v1', etikett: 'SPEND_WINNER', datum: '2026-10-08' },
    { kod: 'BRIEF', annons: 'MATSTRUMP_sushi_gift_ugc_065_i1pnat_v1', koncept: 'nat-kopia', brieftyp: 'I', parent: '09-17 Nathalie captions musik', iteration: 1, playbook: 'S1' },
    { kod: 'UPPLADDAD', annons: 'MATSTRUMP_sushi_gift_ugc_065_h2_i2pnat_v1', annons_id: '1', adset: 'video' },
  ];
  const matningar = [{ datum: '2026-10-08', marknad: 'SE', id: '9', namn: '09-17 Nathalie captions musik', spend_sek: 12000, kop: 40, roas: 1.8 }];
  const a = byggArkiv({ konfig, logg, matningar, idag: '2026-10-08' });
  assert.equal(a.annonser_totalt, 3);
  assert.match(a.hit_rate, /2\/3/);
  assert.deepEqual(a.breakthroughs, ['09-17 Nathalie captions musik']);
  const kedja = a.kedjor.find((k) => k.foralder === '09-17 Nathalie captions musik');
  assert.equal(kedja.barn.length, 2);
  assert.equal(kedja.foralder_etikett, 'BREAKTHROUGH');
  assert.equal(a.varianter.find((v) => v.lopnummer === '065').antal, 2);
  assert.equal(a.per_variabel.kreator.nathalie.annonser, 3, 'iterationer på Nathalies film räknas till henne');
  assert.equal(a.per_variabel.typ.ITER.annonser, 2);
  const nat = a.annonser.find((x) => x.namn === '09-17 Nathalie captions musik');
  assert.ok(Number.isFinite(nat.vinstbidrag_14d_sek), 'vinstbidraget räknas för Sverige');
  assert.equal(a.koncept[0].koncept, 'nat-kopia');
  const md = arkivMarkdown(a);
  assert.match(md, /Kedjorna/);
  assert.match(md, /#2 MATSTRUMP_sushi_gift_ugc_065_h2_i2pnat_v1/);
});
