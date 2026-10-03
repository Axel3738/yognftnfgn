import { test } from 'node:test';
import assert from 'node:assert/strict';
import { etikettera, formateraFrekvens, levandeBreakthrough, ETIKETT } from '../etikett.mjs';
import { validera, brieftak, mix, nastaIteration, konceptStatus, granskaBrief, skelett } from '../lardom.mjs';
import { lasKonfig } from '../kor.mjs';

const G = lasKonfig().grindar;
const KAMPANJ = { spend_sek: 10000, roas: 1.39, budget_d0: 1000, budget_d7: 1200 };

test('under 10 kr på sju dygn = INGEN_LEVERANS', () => {
  const e = etikettera({ namn: 'A', spend_sek: 6.44, kop: 0, roas: null }, KAMPANJ, 1.5, G);
  assert.equal(e.etikett, ETIKETT.INGEN_LEVERANS);
  assert.equal(e.bedombar, false);
});

test('≥ 30 % av spenden + höjd budget + över break-even = BREAKTHROUGH', () => {
  const e = etikettera({ namn: 'B', spend_sek: 4000, kop: 14, roas: 3.1 }, KAMPANJ, 1.5, G);
  assert.equal(e.etikett, ETIKETT.BREAKTHROUGH);
});

test('≥ 30 % men under break-even = SPEND_WINNER, inte breakthrough', () => {
  const e = etikettera({ namn: 'TOP', spend_sek: 7776, kop: 17, roas: 0.93 }, KAMPANJ, 1.5, G);
  assert.equal(e.etikett, ETIKETT.SPEND_WINNER);
  assert.match(e.motivering, /ROAS 0\.93 under break-even 1\.5/);
});

test('liten spend men bättre ROAS än kampanjen = KPI_WINNER', () => {
  const e = etikettera({ namn: 'C', spend_sek: 97, kop: 1, roas: 8.19 }, KAMPANJ, 1.5, G);
  assert.equal(e.etikett, ETIKETT.KPI_WINNER);
});

test('etiketten är ingen dom — bedombar står bredvid', () => {
  const e = etikettera({ namn: 'C', spend_sek: 97, kop: 1, roas: 8.19 }, KAMPANJ, 1.5, G);
  assert.equal(e.bedombar, false, '97 kr och 1 köp är under grinden');
});

test('okänt break-even ger aldrig breakthrough, bara spend winner med osäkerhetsflagga', () => {
  const e = etikettera({ namn: 'D', spend_sek: 4000, kop: 14, roas: 3.1 }, KAMPANJ, null, G);
  assert.equal(e.etikett, ETIKETT.SPEND_WINNER);
  assert.equal(e.osaker_breakthrough, true);
});

test('frekvensen skrivs som bråk, procent först vid tio etiketter', () => {
  assert.equal(formateraFrekvens(3, 21), '3/21 (14 %)');
  assert.equal(formateraFrekvens(1, 4), '1/4 (för få för procent)');
  assert.equal(formateraFrekvens(0, 0), '0/0 (inga etiketterade annonser än)');
});

test('en breakthrough äldre än 28 dagar är inte levande', () => {
  const rader = [
    { namn: 'GAMMAL', etikett: ETIKETT.BREAKTHROUGH, datum: '2026-08-01' },
    { namn: 'NY', etikett: ETIKETT.BREAKTHROUGH, datum: '2026-09-15' },
    { namn: 'PAUSAD', etikett: ETIKETT.BREAKTHROUGH, datum: '2026-09-15', aktiv: false },
  ];
  assert.deepEqual(levandeBreakthrough(rader, '2026-09-21').map((r) => r.namn), ['NY']);
});

test('lärdomen kräver hookar, gissningsmärkt hypotes och konkreta nästa annonser', () => {
  const l = skelett({ namn: 'X', etikett: 'LOSER', bedombar: true, spend_sek: 500, kop: 1 }, KAMPANJ);
  const tom = validera(l);
  assert.equal(tom.ok, false);
  assert.ok(tom.fel.some((f) => /Hookarna saknas/.test(f)));
  assert.ok(tom.fel.some((f) => /Hypotesen saknas/.test(f)));
  assert.ok(tom.fel.some((f) => /dagbok/.test(f)));

  l.hookar = [{ text: 'Vänta, är det sushi på foten?', hook_rate: 0.31, hold_rate: 0.08 }];
  l.hypotes = 'Hooken visade produkten för sent (gissning)';
  l.nasta_annonser = [{ namn: 'MATSTRUMP_sushi_jul_ugc_044_v1', beslut: 'BYGG' }];
  assert.equal(validera(l).ok, true);
});

test('hypotes utan gissningsmärkning eller med "bevisar" stoppas', () => {
  const l = skelett({ namn: 'X', etikett: 'LOSER', bedombar: true, spend_sek: 500, kop: 1 }, KAMPANJ);
  l.hookar = [{ text: 'h' }];
  l.nasta_annonser = [{ namn: 'A', beslut: 'BYGG' }];
  l.hypotes = 'Det här bevisar att hooken var fel (gissning)';
  assert.ok(validera(l).fel.some((f) => /bevisa/.test(f)));
});

test('brieftaket: aldrig fler briefer än skrivna lärdomar', () => {
  assert.equal(brieftak({ lardomarSedanForraRonden: 0, kadensAntal: 6 }).antal, 0);
  assert.equal(brieftak({ lardomarSedanForraRonden: 3, kadensAntal: 6 }).antal, 3);
  assert.equal(brieftak({ lardomarSedanForraRonden: 9, kadensAntal: 6 }).antal, 6, 'kadensen är taket uppåt');
});

test('mixen: 80 % vidarebyggen med levande breakthrough, annars 80 % nya vinklar', () => {
  assert.deepEqual(mix(6, true), { vidarebyggen: 5, nya_vinklar: 1, motivering: 'Levande breakthrough finns ⇒ 80 % vidarebyggen (5 av 6).' });
  assert.equal(mix(6, false).nya_vinklar, 5);
});

test('iterationsnumret räknas ur loggen, inte ur briefens egen siffra', () => {
  const rader = [{ koncept: 'julklapp' }, { koncept: 'julklapp' }, { koncept: 'annat' }];
  assert.equal(nastaIteration(rader, 'julklapp'), 3);
  const g = granskaBrief({ typ: 'I', koncept: 'julklapp', parent: 'X', iteration: 7, lardom: 'L-X', kalla: 'voc', avatar: 'a', awareness: 'b', begar: 'c', mekanism: 'd', tro: 'e', urgency: 'f', hook_mekanik: 'g' }, { lardomar: [{ id: 'L-X' }], briefrader: rader });
  assert.ok(g.fel.some((f) => /Loggen vinner/.test(f)));
});

test('en brief utan lärdom skrivs inte', () => {
  const g = granskaBrief({ typ: 'N', koncept: 'k', iteration: 1, lardom: 'L-FINNS-EJ', kalla: 'voc', avatar: 'a', awareness: 'b', begar: 'c', mekanism: 'd', tro: 'e', urgency: 'f', hook_mekanik: 'g' }, { lardomar: [], briefrader: [] });
  assert.equal(g.ok, false);
  assert.ok(g.fel.some((f) => /finns inte i loggen/.test(f)));
});

test('typ=N med samma avatar, begär och mekanism varnas som iteration i förklädnad', () => {
  const g = granskaBrief({ typ: 'N', koncept: 'k', iteration: 1, lardom: 'L-A', kalla: 'voc', avatar: 'sushiälskaren', awareness: 'problem', begar: 'rolig present', mekanism: 'uppackning', tro: 'x', urgency: 'y', hook_mekanik: 'z' },
    { lardomar: [{ id: 'L-A' }], briefrader: [{ koncept: 'annat', avatar: 'sushiälskaren', begar: 'rolig present', mekanism: 'uppackning' }] });
  assert.ok(g.varning.some((v) => /ny vinkel/.test(v)));
});

test('taket räknar försök MED UTFALL: tre loser-etiketter, svag källa ⇒ SLÄPP; stark källa ⇒ fortsätt', () => {
  const briefer = [{ koncept: 'k', annons: 'A1', lardom: 'L1' }, { koncept: 'k', annons: 'A2', lardom: 'L2' }, { koncept: 'k', annons: 'A3', lardom: 'L3' }];
  const etiketter = ['A1', 'A2', 'A3'].map((annons) => ({ kod: 'ETIKETT', annons, etikett: 'LOSER' }));
  assert.equal(konceptStatus('k', briefer, etiketter, { kalla: 'gissning' }).beslut, 'SLAPP');
  assert.equal(konceptStatus('k', briefer, etiketter, { kalla: 'voc' }).beslut, 'FORTSATT');
  assert.equal(konceptStatus('k', briefer.slice(0, 2), etiketter, { kalla: 'gissning' }).beslut, 'FORTSATT', 'två försök är under taket');
});

test('tre briefer UTAN etikett släpps aldrig — då väntar konceptet på utfall (2026-10-01: före det dömdes briefer som aldrig gått live)', () => {
  const briefer = [{ koncept: 'k', annons: 'A1' }, { koncept: 'k', annons: 'A2' }, { koncept: 'k', annons: 'A3' }];
  const s = konceptStatus('k', briefer, [], { kalla: 'gissning' });
  assert.equal(s.beslut, 'VANTA_UTFALL');
  assert.equal(s.med_utfall, 0);
});

test('ribban är förälderns etikett: en spend winner under en breakthrough-förälder räcker inte', () => {
  const briefer = [{ koncept: 'k', annons: 'A1', parent: 'P' }, { koncept: 'k', annons: 'A2', parent: 'P' }, { koncept: 'k', annons: 'A3', parent: 'P' }];
  const etiketter = [{ annons: 'P', etikett: 'BREAKTHROUGH' }, { annons: 'A1', etikett: 'SPEND_WINNER' }, { annons: 'A2', etikett: 'LOSER' }, { annons: 'A3', etikett: 'KPI_WINNER' }];
  const s = konceptStatus('k', briefer, etiketter, { kalla: 'gissning' });
  assert.equal(s.foralder, 'BREAKTHROUGH');
  assert.equal(s.beslut, 'SLAPP');
  const lyft = konceptStatus('k', briefer, [...etiketter, { annons: 'A2', etikett: 'BREAKTHROUGH' }], { kalla: 'gissning' });
  assert.equal(lyft.beslut, 'FORTSATT', 'en iteration som når förälderns nivå bär konceptet vidare');
});

test('omdöpta annonser följer med: etiketten på det nya namnet räknas för den gamla briefen', () => {
  const briefer = [{ koncept: 'k', annons: 'GAMMAL' }];
  const s = konceptStatus('k', briefer, [{ annons: 'NY', etikett: 'SPEND_WINNER' }], { omdopt: [{ fran: 'GAMMAL', till: 'NY' }] });
  assert.equal(s.beslut, 'FORTSATT');
  assert.equal(s.utfall[0].annons, 'NY');
});

test('3:2:2: tre hookar på samma löpnummer är ETT försök i taket, inte tre', async () => {
  const { konceptStatus, nastaIteration, koncepttak, vantandeKoncept } = await import('../lardom.mjs');
  const { tolka } = await import('../namn.mjs');
  const brief = (annons) => ({ kod: 'BRIEF', annons, koncept: 'nytt', parent: 'ingen' });
  const rader = ['MATSTRUMP_sushi_gift_ugc_090_h1_v1', 'MATSTRUMP_sushi_gift_ugc_090_h2_v1', 'MATSTRUMP_sushi_gift_ugc_090_h3_v1'].map(brief);
  const etiketter = [
    { kod: 'ETIKETT', annons: rader[0].annons, etikett: 'LOSER', datum: '2026-10-10' },
    { kod: 'ETIKETT', annons: rader[1].annons, etikett: 'INGEN_LEVERANS', datum: '2026-10-10' },
    { kod: 'ETIKETT', annons: rader[2].annons, etikett: 'INGEN_LEVERANS', datum: '2026-10-10' },
  ];
  const s = konceptStatus('nytt', rader, etiketter, { kalla: 'gissning' });
  assert.equal(s.iterationer, 1);
  assert.equal(s.med_utfall, 1);
  assert.equal(s.beslut, 'FORTSATT', 'ett test av tre — taket döms först efter tre');
  assert.equal(s.utfall[0].etikett, 'LOSER', 'försökets utfall = hookarnas bästa etikett');
  assert.equal(nastaIteration(rader, 'nytt'), 2);
  const t = koncepttak({ lardomarSedanForraRonden: 5, kadensBriefer: 6, hookarPerKoncept: 3, vantandeKoncept: 3, testplatser: 4 });
  assert.equal(t.antal, 1, 'platserna sätter taket: 4 testplatser − 3 koncept på väg');
  assert.equal(t.briefer, 3);
  assert.equal(koncepttak({ lardomarSedanForraRonden: 5, kadensBriefer: 6, hookarPerKoncept: 3 }).antal, 2, 'kadensen: 6 briefer = 2 koncept');
  const logg = [...rader.map((r) => ({ ...r, datum: '2026-10-03' })), { kod: 'BRIEF', annons: 'MATSTRUMP_sushi_gift_ugc_091_h1_v1', datum: '2026-10-03', status: 'Väntar på råklipp (NEW FOOTAGE)' }];
  assert.deepEqual(vantandeKoncept(logg, { sedan: '2026-10-02', tolka }), [90], 'en inspelning som väntar på råklipp väntar inte på en plats');
});

// Platstaket räknar hubbens kö också (2026-10-03, Axels fråga "att den inte gör
// för många briefer"): Bruces briefer har ingen BRIEF-rad i loggen.
const koAnnons = (nr, hook) => ({ namn: `MATSTRUMP_sushi_gift_ugc_${String(nr).padStart(3, '0')}_h${hook}_v1` });
const koPlan = (...koncept) => ({ datum: '2026-10-03', koncept });

test('platstaket: ett koncept som bara finns i hubbens kö (Bruces) räknas som väntande', async () => {
  const { vantandeKonceptUrKo, vantandeKonceptTotalt } = await import('../lardom.mjs');
  const plan = koPlan({ nyckel: '095', nummer: 95, status: 'vantar_copy', annonser: [koAnnons(95, 1), koAnnons(95, 2), koAnnons(95, 3)] });
  assert.deepEqual(vantandeKonceptUrKo(plan).nycklar, [95], 'tre hookar på samma löpnummer = ett koncept');
  const vt = vantandeKonceptTotalt([], plan, { sedan: '2026-10-02' });
  assert.deepEqual(vt.alla, [95]);
  assert.deepEqual(vt.kungens, []);
  assert.deepEqual(vt.bara_kon, [95]);
  assert.equal(vt.ko_last, true);
  // En uppladdningspost (nyckel utan löpnummer) som bär två löpnummer = två koncept.
  const batch = koPlan({ nyckel: 'U20261003', uppladdning: true, nummer: null, adset_namn: 'MATSTRUMP_U20261003_mix_video', status: 'vantar_plats', annonser: [koAnnons(96, 1), koAnnons(97, 1)] });
  assert.deepEqual(vantandeKonceptUrKo(batch).nycklar, [96, 97]);
});

test('platstaket: ett koncept i både loggen och kön räknas en gång', async () => {
  const { vantandeKonceptTotalt } = await import('../lardom.mjs');
  const logg = [1, 2, 3].map((h) => ({ kod: 'BRIEF', annons: koAnnons(92, h).namn, datum: '2026-10-03' }));
  const plan = koPlan({ nyckel: '092', nummer: 92, status: 'klar', annonser: [koAnnons(92, 1), koAnnons(92, 2), koAnnons(92, 3)] }, { nyckel: '095', nummer: 95, status: 'vantar_plats', annonser: [koAnnons(95, 1)] });
  const vt = vantandeKonceptTotalt(logg, plan, { sedan: '2026-10-02' });
  assert.deepEqual(vt.alla, [92, 95], '092 i båda, 095 bara i kön');
  assert.deepEqual(vt.kungens, [92]);
  assert.deepEqual(vt.kon, [92, 95]);
  assert.deepEqual(vt.bara_kon, [95]);
  const utanKo = vantandeKonceptTotalt(logg, null, { sedan: '2026-10-02' });
  assert.deepEqual(utanKo.alla, [92], 'utan kö: bara loggen, som förut');
  assert.equal(utanKo.ko_last, false);
});

test('platstaket: ett stoppat koncept i kön räknas inte', async () => {
  const { vantandeKonceptUrKo } = await import('../lardom.mjs');
  const plan = koPlan({ nyckel: '093', nummer: 93, status: 'stopp', skal: ['samma annonsnamn två gånger i kön'], annonser: [koAnnons(93, 1), koAnnons(93, 1)] });
  assert.deepEqual(vantandeKonceptUrKo(plan).nycklar, []);
  assert.equal(vantandeKonceptUrKo(plan).antal, 0);
});

test('platstaket: ett koncept vars annonser alla är UPPLADDAD räknas inte', async () => {
  const { vantandeKonceptUrKo, vantandeKonceptTotalt } = await import('../lardom.mjs');
  const plan = koPlan({ nyckel: '094', nummer: 94, status: 'vantar_plats', annonser: [koAnnons(94, 1), koAnnons(94, 2), koAnnons(94, 3)] });
  const uppe = [1, 2, 3].map((h) => ({ kod: 'UPPLADDAD', annons: koAnnons(94, h).namn.toUpperCase(), annons_id: `1${h}`, datum: '2026-10-03' }));
  assert.deepEqual(vantandeKonceptUrKo(plan, { uppladdade: uppe }).nycklar, [], 'namnen jämförs utan skiftläge');
  assert.deepEqual(vantandeKonceptTotalt(uppe, plan, { sedan: '2026-10-02' }).alla, []);
  // En hook kvar i kön ⇒ konceptet väntar fortfarande på en plats.
  assert.deepEqual(vantandeKonceptUrKo(plan, { uppladdade: uppe.slice(0, 2) }).nycklar, [94]);
});

test('platstaket: odöpta rader i kön räknas som ett golv, ceil(rader ÷ hookar) koncept', async () => {
  const { vantandeKonceptUrKo, vantandeKonceptTotalt, koncepttak } = await import('../lardom.mjs');
  const odopt = (id, namn) => ({ id, namn, leverans: 'bilaga', skal: ['namnet följer inte mönstret'], behover_namn: true });
  const plan = koPlan({ nyckel: '095', nummer: 95, status: 'vantar_plats', annonser: [koAnnons(95, 1)] });
  plan.behover_namn = [odopt('a', '022'), odopt('b', '023'), odopt('c', '024'), odopt('d', '025')];
  const ko = vantandeKonceptUrKo(plan, { hookarPerKoncept: 3 });
  assert.deepEqual(ko.nycklar, [95]);
  assert.deepEqual(ko.odopta, { rader: 4, koncept: 2 }, 'fyra rader ⇒ två koncept (golvet avrundar uppåt)');
  assert.equal(ko.antal, 3);
  // Samma rad två gånger räknas en gång; en äldre plan utan behover_namn läser flaggan på de stoppade.
  assert.deepEqual(vantandeKonceptUrKo({ koncept: [], behover_namn: [odopt('a', '022'), odopt('a', '022')] }).odopta, { rader: 1, koncept: 1 });
  assert.deepEqual(vantandeKonceptUrKo({ koncept: [], stoppade: [odopt('a', '022'), { id: 'x', skal: ['ingen fil'], behover_namn: false }] }).odopta, { rader: 1, koncept: 1 });
  const vt = vantandeKonceptTotalt([], plan, { sedan: '2026-10-02', hookarPerKoncept: 3 });
  assert.equal(vt.antal, 3, '095 + två koncept odöpta rader');
  assert.deepEqual(vt.alla, [95], 'de odöpta har inget löpnummer och står bara i odopta');
  assert.equal(koncepttak({ lardomarSedanForraRonden: 5, kadensBriefer: 6, hookarPerKoncept: 3, vantandeKoncept: vt.antal, testplatser: 4 }).antal, 1, '4 testplatser − 3 väntande = 1 koncept');
  assert.deepEqual(vantandeKonceptTotalt([], null).odopta, { rader: 0, koncept: 0 });
});
