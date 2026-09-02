import test from 'node:test';
import assert from 'node:assert/strict';
import {
  byggLeaderboard, toppkampanjer, bastaAnnons, dagensOkning, forraPlatsen,
  dagsrad, laggIHistorik, HISTORIKDAGAR,
} from '../leaderboard.mjs';

const annons = (adNamn, spend, kampanj = 'Motorhöljet') => ({
  adId: `id-${adNamn}`, adNamn, kampanj, spend,
  konto: { id: '1867947880635861', namn: 'MagiBorsten', valuta: 'SEK' },
});

const redigerare = (id, namn, spend, annonser = []) => ({
  id, namn, roll: 'editor',
  spend: { SEK: spend }, commission: { SEK: spend * 0.004 },
  exakt: {}, variant: {}, annonser,
});

const rapport = ({ redigerare: r = [], datum = '2026-09-05', heltMatad = false } = {}) => ({
  kord: `${datum}T04:00:00.000Z`,
  period: { manad: datum.slice(0, 7), fran: `${datum.slice(0, 7)}-01`, till: datum, heltMatad },
  sats: 0.004,
  redigerare: r,
  ejRedigerare: [{ namn: 'Axel Odhner', roll: 'admin', spend: { SEK: 5000 }, commission: { SEK: 20 } }],
  utanMottagare: { spend: { SEK: 800 }, commission: { SEK: 3.2 } },
  okandaAnsvariga: [{ notionUserId: 'abc', spend: { SEK: 22.49 }, commission: { SEK: 0.09 } }],
  konflikter: [],
  totalt: { spend: { SEK: r.reduce((s, e) => s + e.spend.SEK, 0) }, commission: { SEK: r.reduce((s, e) => s + e.commission.SEK, 0) } },
});

// ------------------------------------------------------------- Rangordning

test('rangordnar på spend, störst först', () => {
  const l = byggLeaderboard(rapport({
    redigerare: [redigerare('carl', 'Carl', 3000), redigerare('josh', 'Josh', 9000), redigerare('gilz', 'Gilz', 5000)],
  }));
  assert.deepEqual(l.rader.map((r) => r.namn), ['Josh', 'Gilz', 'Carl']);
  assert.deepEqual(l.rader.map((r) => r.plats), [1, 2, 3]);
});

test('siffrorna kommer ur rapporten, räknas aldrig om', () => {
  const e = redigerare('josh', 'Josh', 10000);
  e.commission = { SEK: 40 };
  const l = byggLeaderboard(rapport({ redigerare: [e] }));
  assert.equal(l.rader[0].spend, 10000);
  assert.equal(l.rader[0].commission, 40);
  assert.equal(l.totalt.commission, 40);
});

test('slutavräkning märks ut', () => {
  const vanlig = byggLeaderboard(rapport({ redigerare: [redigerare('a', 'A', 1)] }));
  assert.equal(vanlig.slutavrakning, false);
  const sista = byggLeaderboard(rapport({ redigerare: [redigerare('a', 'A', 1)], datum: '2026-09-30', heltMatad: true }));
  assert.equal(sista.slutavrakning, true);
});

// ------------------------------------------------------------- Toppkampanjer

test('toppkampanjer summerar per kampanj och tar de största', () => {
  const topp = toppkampanjer([
    annons('A_1', 100, 'Motorhöljet'), annons('A_2', 400, 'Motorhöljet'),
    annons('B_1', 300, 'Axelbältet'), annons('C_1', 50, 'Strandtofflorna'),
    annons('D_1', 10, 'Vaggfästet'),
  ]);
  assert.deepEqual(topp, [
    { namn: 'Motorhöljet', spend: 500 },
    { namn: 'Axelbältet', spend: 300 },
    { namn: 'Strandtofflorna', spend: 50 },
  ]);
});

test('bästa annonsen är den med mest spend', () => {
  assert.deepEqual(bastaAnnons([annons('A', 10), annons('B', 99), annons('C', 50)]), { namn: 'B', spend: 99 });
  assert.equal(bastaAnnons([]), null);
});

// ------------------------------------------------------------- Dagens ökning

test('dagens ökning är skillnaden mot gårdagens mätning', () => {
  const historik = [{ datum: '2026-09-04', manad: '2026-09', per: { josh: 7000 }, platser: { josh: 1 } }];
  assert.equal(dagensOkning(historik, '2026-09', '2026-09-05', 'josh', 9000), 2000);
});

test('första dagen i en månad har ingen ökning att visa', () => {
  const historik = [{ datum: '2026-08-31', manad: '2026-08', per: { josh: 180000 }, platser: { josh: 1 } }];
  // Augustis siffra får aldrig dras från septembers — perioden nollställs.
  assert.equal(dagensOkning(historik, '2026-09', '2026-09-01', 'josh', 4000), null);
});

test('en ny redigerare räknas från noll, inte som saknad', () => {
  const historik = [{ datum: '2026-09-04', manad: '2026-09', per: { josh: 7000 }, platser: { josh: 1 } }];
  assert.equal(dagensOkning(historik, '2026-09', '2026-09-05', 'ny', 1500), 1500);
});

// ------------------------------------------------------------- Platsförändring

test('flytt visar hur många placeringar personen gått upp', () => {
  const historik = [{ datum: '2026-09-04', manad: '2026-09', per: { a: 1, b: 2 }, platser: { a: 3, b: 1 } }];
  assert.equal(forraPlatsen(historik, '2026-09-05', 'a'), 3);
  const l = byggLeaderboard(rapport({
    redigerare: [redigerare('a', 'A', 9000), redigerare('b', 'B', 100)],
  }), { historik });
  assert.equal(l.rader[0].flytt, 2);   // 3 → 1
  assert.equal(l.rader[1].flytt, -1);  // 1 → 2
});

test('den som inte funnits förut får flytt 0, inte en falsk klättring', () => {
  const l = byggLeaderboard(rapport({ redigerare: [redigerare('ny', 'Ny', 500)] }), { historik: [] });
  assert.equal(l.rader[0].forraPlats, null);
  assert.equal(l.rader[0].flytt, 0);
});

// ------------------------------------------------------------- Historiken

test('samma datum skrivs över i stället för att dubbleras', () => {
  const rad = (datum, spend) => ({ datum, manad: datum.slice(0, 7), per: { a: spend }, platser: { a: 1 } });
  let h = laggIHistorik([], rad('2026-09-05', 100));
  h = laggIHistorik(h, rad('2026-09-05', 250));
  assert.equal(h.length, 1);
  assert.equal(h[0].per.a, 250);
});

test('historiken kapas till taket och behåller de senaste dagarna', () => {
  let h = [];
  for (let d = 1; d <= HISTORIKDAGAR + 5; d++) {
    h = laggIHistorik(h, { datum: `2026-09-${String(d).padStart(2, '0')}`, manad: '2026-09', per: {}, platser: {} });
  }
  assert.equal(h.length, HISTORIKDAGAR);
  assert.equal(h.at(-1).datum, `2026-09-${HISTORIKDAGAR + 5}`);
});

test('dagsraden bär både spend och placering', () => {
  const l = byggLeaderboard(rapport({ redigerare: [redigerare('josh', 'Josh', 9000), redigerare('carl', 'Carl', 100)] }));
  const rad = dagsrad(l);
  assert.deepEqual(rad.per, { josh: 9000, carl: 100 });
  assert.deepEqual(rad.platser, { josh: 1, carl: 2 });
  assert.equal(rad.manad, '2026-09');
});

// ------------------------------------------------------------- Obetald spend

test('spend som ingen får redovisas separat, aldrig i topplistan', () => {
  const l = byggLeaderboard(rapport({ redigerare: [redigerare('josh', 'Josh', 9000)] }));
  assert.equal(l.rader.length, 1);
  assert.equal(l.obetald.utanAnsvarig, 800);
  assert.equal(l.obetald.okanda, 22.49);
  assert.deepEqual(l.obetald.ejRedigerare, [{ namn: 'Axel Odhner', roll: 'admin', spend: 5000 }]);
});

test('annan valuta än SEK smugglas aldrig in i topplistans kronor', () => {
  const e = redigerare('josh', 'Josh', 1000);
  e.spend = { SEK: 1000, USD: 500 };
  const l = byggLeaderboard(rapport({ redigerare: [e] }));
  assert.equal(l.rader[0].spend, 1000);
  assert.deepEqual(l.rader[0].ovriga, [{ valuta: 'USD', belopp: 500 }]);
});
