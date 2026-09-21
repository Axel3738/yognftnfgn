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
  assert.match(e.motivering, /ROAS under break-even/);
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

test('taket: tre iterationer med lärdom, ingen slår originalet, svag källa ⇒ SLÄPP', () => {
  const briefer = [{ koncept: 'k', lardom: 'L1' }, { koncept: 'k', lardom: 'L2' }, { koncept: 'k', lardom: 'L3' }];
  assert.equal(konceptStatus('k', briefer, [], { kalla: 'gissning' }).beslut, 'SLAPP');
  assert.equal(konceptStatus('k', briefer, [], { kalla: 'voc' }).beslut, 'FORTSATT');
  assert.equal(konceptStatus('k', briefer.slice(0, 2), [], { kalla: 'gissning' }).beslut, 'FORTSATT');
});
