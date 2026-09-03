import test from 'node:test';
import assert from 'node:assert/strict';
import {
  byggLeaderboard, toppkampanjer, bastaAnnons, dagensOkning, forraPlatsen,
  dagsrad, laggIHistorik, HISTORIKDAGAR,
} from '../leaderboard.mjs';
import { tolkaSvar, rimlig, tillUsd } from '../valuta.mjs';

const SATS = 0.004;
const KURS = { kurs: 0.1, datum: '2026-09-01', gammal: false };

const annons = (adNamn, spend, kampanj = 'Motorhöljet') => ({
  adId: `id-${adNamn}`, adNamn, kampanj, spend,
  konto: { id: '1867947880635861', namn: 'MagiBorsten', valuta: 'SEK' },
});

const redigerare = (id, namn, spend, annonser = []) => ({
  id, namn, roll: 'editor',
  spend: { SEK: spend }, commission: { SEK: spend * SATS },
  exakt: {}, variant: {}, annonser,
});

const rapport = ({ redigerare: r = [], datum = '2026-09-05', heltMatad = false } = {}) => ({
  kord: `${datum}T04:00:00.000Z`,
  period: { manad: datum.slice(0, 7), fran: `${datum.slice(0, 7)}-01`, till: datum, heltMatad },
  sats: SATS,
  redigerare: r,
  ejRedigerare: [{ namn: 'Axel Odhner', roll: 'admin', spend: { SEK: 5000 }, commission: { SEK: 20 } }],
  utanMottagare: { spend: { SEK: 800 }, commission: { SEK: 3.2 } },
  okandaAnsvariga: [{ notionUserId: 'abc', spend: { SEK: 500 }, commission: { SEK: 2 } }],
  konflikter: [],
  totalt: {
    spend: { SEK: r.reduce((s, e) => s + e.spend.SEK, 0) },
    commission: { SEK: r.reduce((s, e) => s + e.commission.SEK, 0) },
  },
});

const bygg = (opt, extra = {}) => byggLeaderboard(rapport(opt), { valuta: KURS, ...extra });

// ------------------------------------------------------- Spend visas aldrig

test('varken raderna eller totalen bär spend', () => {
  const l = bygg({ redigerare: [redigerare('josh', 'Josh', 100000, [annons('A_1', 100000)])] });
  const text = JSON.stringify(l);
  assert.equal('spend' in l.totalt, false);
  assert.equal('spend' in l.rader[0], false);
  assert.equal(text.includes('100000'), false, 'spendbeloppet får inte läcka in i datan');
});

test('bara commission summeras, i dollar', () => {
  const l = bygg({ redigerare: [redigerare('josh', 'Josh', 100000), redigerare('carl', 'Carl', 50000)] });
  // 150 000 kr spend → 600 kr commission → 60 USD på kursen 0,10.
  assert.equal(l.totalt.usd, 60);
  assert.equal(l.totalt.redigerare, 2);
  assert.equal(l.valuta.kod, 'USD');
});

// ------------------------------------------------------------- Rangordning

test('rangordnar på commission, störst först', () => {
  const l = bygg({ redigerare: [redigerare('carl', 'Carl', 3000), redigerare('josh', 'Josh', 9000), redigerare('gilz', 'Gilz', 5000)] });
  assert.deepEqual(l.rader.map((r) => r.namn), ['Josh', 'Gilz', 'Carl']);
  assert.deepEqual(l.rader.map((r) => r.plats), [1, 2, 3]);
});

test('utan växelkurs byggs ingen topplista alls', () => {
  assert.throws(() => byggLeaderboard(rapport({ redigerare: [] }), { valuta: null }), /växelkurs/i);
});

// --------------------------------------------------------- Månadsnollning

test('perioden är kalendermånaden — oktober börjar om på noll', () => {
  const sept = bygg({ redigerare: [redigerare('josh', 'Josh', 500000)], datum: '2026-09-30', heltMatad: true });
  assert.equal(sept.manad, '2026-09');
  assert.equal(sept.slutavrakning, true);

  const historik = [{ datum: '2026-09-30', manad: '2026-09', valuta: 'USD', per: { josh: sept.rader[0].usd }, platser: { josh: 1 } }];
  const okt = bygg({ redigerare: [redigerare('josh', 'Josh', 10000)], datum: '2026-10-01' }, { historik });
  assert.equal(okt.manad, '2026-10');
  assert.equal(okt.period.fran, '2026-10-01');
  assert.equal(okt.rader[0].usd, 4);            // bara oktobers egna 10 000 kr
  assert.equal(okt.rader[0].okning, null);      // septembers summa dras aldrig av
  assert.equal(okt.historik.length, 0);         // kurvan börjar om
});

// ------------------------------------------------------------ Detaljerna

test('kampanjerna redovisas som commission, aldrig som spend', () => {
  const topp = toppkampanjer([
    annons('A_1', 100000, 'Motorhöljet'), annons('A_2', 400000, 'Motorhöljet'),
    annons('B_1', 300000, 'Axelbältet'), annons('C_1', 50000, 'Strandtofflorna'),
    annons('D_1', 10000, 'Vaggfästet'),
  ], SATS, 0.1);
  assert.deepEqual(topp, [
    { namn: 'Motorhöljet', usd: 200 },
    { namn: 'Axelbältet', usd: 120 },
    { namn: 'Strandtofflorna', usd: 20 },
  ]);
});

test('bästa annonsen är den som gett mest commission', () => {
  assert.deepEqual(bastaAnnons([annons('A', 10000), annons('B', 99000), annons('C', 50000)], SATS, 0.1),
    { namn: 'B', usd: 39.6 });
  assert.equal(bastaAnnons([], SATS, 0.1), null);
});

// --------------------------------------------------------- Dagens ökning

test('dagens ökning är skillnaden mot gårdagens mätning', () => {
  const historik = [{ datum: '2026-09-04', manad: '2026-09', valuta: 'USD', per: { josh: 28 }, platser: { josh: 1 } }];
  assert.equal(dagensOkning(historik, '2026-09', '2026-09-05', 'josh', 36), 8);
});

test('en ny redigerare räknas från noll, inte som saknad', () => {
  const historik = [{ datum: '2026-09-04', manad: '2026-09', valuta: 'USD', per: { josh: 28 }, platser: { josh: 1 } }];
  assert.equal(dagensOkning(historik, '2026-09', '2026-09-05', 'ny', 6), 6);
});

// ----------------------------------------------------- Platsförändringen

test('flytt visar hur många placeringar personen gått upp', () => {
  const historik = [{ datum: '2026-09-04', manad: '2026-09', valuta: 'USD', per: { a: 1, b: 2 }, platser: { a: 3, b: 1 } }];
  assert.equal(forraPlatsen(historik, '2026-09-05', 'a'), 3);
  const l = bygg({ redigerare: [redigerare('a', 'A', 900000), redigerare('b', 'B', 10000)] }, { historik });
  assert.equal(l.rader[0].flytt, 2);   // 3 → 1
  assert.equal(l.rader[1].flytt, -1);  // 1 → 2
});

test('den som inte funnits förut får flytt 0, inte en falsk klättring', () => {
  const l = bygg({ redigerare: [redigerare('ny', 'Ny', 5000)] }, { historik: [] });
  assert.equal(l.rader[0].forraPlats, null);
  assert.equal(l.rader[0].flytt, 0);
});

// ------------------------------------------------------------ Historiken

test('dygnsraden bär dollar, plats och valutamärkning', () => {
  const l = bygg({ redigerare: [redigerare('josh', 'Josh', 900000), redigerare('carl', 'Carl', 10000)] });
  const rad = dagsrad(l);
  assert.deepEqual(rad.per, { josh: 360, carl: 4 });
  assert.deepEqual(rad.platser, { josh: 1, carl: 2 });
  assert.equal(rad.valuta, 'USD');
});

test('samma datum skrivs över i stället för att dubbleras', () => {
  const rad = (datum, usd) => ({ datum, manad: datum.slice(0, 7), valuta: 'USD', per: { a: usd }, platser: { a: 1 } });
  let h = laggIHistorik([], rad('2026-09-05', 10));
  h = laggIHistorik(h, rad('2026-09-05', 25));
  assert.equal(h.length, 1);
  assert.equal(h[0].per.a, 25);
});

test('historiken kapas till taket och behåller de senaste dygnen', () => {
  let h = [];
  for (let d = 1; d <= HISTORIKDAGAR + 5; d++) {
    h = laggIHistorik(h, { datum: `2026-09-${String(d).padStart(2, '0')}`, manad: '2026-09', valuta: 'USD', per: {}, platser: {} });
  }
  assert.equal(h.length, HISTORIKDAGAR);
  assert.equal(h.at(-1).datum, `2026-09-${HISTORIKDAGAR + 5}`);
});

// ------------------------------------------------------------ Obetald del

test('commission som ingen får redovisas separat, aldrig i topplistan', () => {
  const l = bygg({ redigerare: [redigerare('josh', 'Josh', 900000)] });
  assert.equal(l.rader.length, 1);
  assert.equal(l.obetald.utanAnsvarig, 0.32);
  assert.equal(l.obetald.okanda, 0.2);
  assert.deepEqual(l.obetald.ejRedigerare, [{ namn: 'Axel Odhner', roll: 'admin', usd: 2 }]);
});

// ---------------------------------------------------------------- Valutan

test('växelkursen läses ur ECB-svaret med sitt datum', () => {
  assert.deepEqual(tolkaSvar('{"amount":1.0,"base":"SEK","date":"2026-09-01","rates":{"USD":0.10428}}'),
    { kurs: 0.10428, datum: '2026-09-01' });
});

test('orimliga eller trasiga kurssvar avvisas i stället för att användas', () => {
  assert.equal(tolkaSvar('inte json'), null);
  assert.equal(tolkaSvar('{"rates":{}}'), null);
  assert.equal(tolkaSvar('{"rates":{"USD":1.9}}'), null, 'en krona är inte två dollar');
  assert.equal(tolkaSvar('{"rates":{"USD":0}}'), null);
  assert.equal(rimlig(0.104), true);
});

test('kursen märks ut på sidan, inklusive när den är en sparad gammal kurs', () => {
  const l = byggLeaderboard(rapport({ redigerare: [redigerare('a', 'A', 10000)] }),
    { valuta: { kurs: 0.10428, datum: '2026-08-29', gammal: true } });
  assert.equal(l.valuta.datum, '2026-08-29');
  assert.equal(l.valuta.gammal, true);
  assert.equal(l.rader[0].usd, tillUsd(40, 0.10428));
});
