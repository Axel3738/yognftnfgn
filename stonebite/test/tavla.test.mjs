// Lagets tavla (2026-09-26, byggordningen efter Evolve, steg 2).
// Inget nät: hubbar och annonser är fejkdata i samma form som hämtningen ger.

import test from 'node:test';
import assert from 'node:assert/strict';
import { byggTavla, kolumnFor, arAnnonsrad } from '../kallor/tavla.mjs';
import { lagetSida } from '../vy/laget.mjs';
import { sattSprak } from '../vy/delar.mjs';
import { farSe, startsidaFor } from '../roller.mjs';

const NU = new Date('2026-09-26T15:00:00Z');
const dagarSedan = (n) => new Date(NU.getTime() - n * 86_400_000).toISOString();

const TEAM = [
  { id: 'carl', name: 'Carl Vicente', role: 'editor', active: true, notionUserId: 'n-carl' },
  { id: 'jasper', name: 'Jasper Tomboc', role: 'editor', active: true, notionUserId: 'n-jasper' },
  { id: 'josh', name: 'Josh Naelga', role: 'editor', active: true, notionUserId: 'n-josh' },
  { id: 'axel', name: 'Axel Odhner', role: 'admin', active: true, notionUserId: 'n-axel' },
];

const HUBBAR = [
  {
    namn: 'Boat motor cover creative hub',
    rader: [
      { namn: 'Batmotor_SP_1_H5 – VIDEO: hook', status: 'Approved', typ: 'Video - Pending Approval', ansvariga: ['n-carl'], skapad: dagarSedan(22) },
      { namn: 'Batmotor_PD_2_H1', status: 'In progress', typ: 'Video - Pending Approval', ansvariga: ['n-carl'], skapad: dagarSedan(12) },
      { namn: 'Batmotor_PD_3_H1', status: 'In progress 2', typ: 'Video - Pending Approval', ansvariga: ['n-jasper'], skapad: dagarSedan(2) },
      { namn: 'Batmotor_PD_4_H1', status: 'To be Reviewed', typ: 'Video - Pending Approval', ansvariga: ['n-jasper'], skapad: dagarSedan(3) },
      { namn: 'Batmotor_PD_5_H1', status: 'Draft', typ: 'Video - Pending Approval', ansvariga: [], skapad: dagarSedan(1) },
      { namn: 'SOP: how to edit', status: 'In progress', typ: 'SOP', ansvariga: ['n-carl'], skapad: dagarSedan(40) },
    ],
  },
];

const ANNONSER = [
  { id: 'a1', adNamn: 'Batmotor_SP_1_H5', skapad: dagarSedan(19), kampanj: 'Båtmotor', konto: { id: '1867947880635861' } },
  { id: 'a2', adNamn: 'Batmotor_PD_4_H1', skapad: dagarSedan(2), kampanj: 'Båtmotor', konto: { id: '1867947880635861' } },
  // En översättning i NO-kontot är inte en ny annons.
  { id: 'a3', adNamn: 'Batmotor_NO_SP_1_H5', skapad: dagarSedan(1), kampanj: 'Båtmotor NO', konto: { id: '1050941584152547' } },
];

const ANDELAR = new Map([
  ['a1', { andel: 0.61, kampanjSpend: 20_000 }],
  ['a2', { andel: 0.05, kampanjSpend: 20_000 }],
]);

test('kolumnFor: "Translation in review" är live, "In progress 2" är revision', () => {
  assert.equal(kolumnFor('Translation in review'), 'klar');
  assert.equal(kolumnFor('SE-ACTIVE to be translated'), 'klar');
  assert.equal(kolumnFor('In progress 2'), 'revision');
  assert.equal(kolumnFor('In progress'), 'pagar');
  assert.equal(kolumnFor('Creative strat review'), 'vantar');
  assert.equal(kolumnFor('Draft'), 'attGora');
});

test('arAnnonsrad: SOP och Guideline räknas aldrig', () => {
  assert.equal(arAnnonsrad({ namn: 'SOP: x', typ: 'SOP' }), false);
  assert.equal(arAnnonsrad({ namn: 'Batmotor_PD_2_H1', typ: 'Video - Pending Approval' }), true);
});

test('byggTavla: kön per person, över 10 dagar, live, vinnare och ledtid', () => {
  const t = byggTavla({ hubbar: HUBBAR, annonser: ANNONSER, andelar: ANDELAR, team: TEAM, nu: NU });
  const carl = t.personer.find((p) => p.id === 'carl');
  const jasper = t.personer.find((p) => p.id === 'jasper');
  assert.deepEqual(carl.ko, { attGora: 0, pagar: 1, revision: 0, vantar: 0 });
  assert.equal(carl.forsenade, 1, 'PD_2 har pågått i 12 dagar');
  assert.equal(carl.vinnare, 1);
  assert.equal(carl.ledtidMedian, 3, 'raden skapad för 22 dagar sedan, live för 19');
  assert.equal(jasper.ko.revision, 1);
  assert.equal(jasper.live7, 1);
  assert.equal(jasper.vinnare, 0, '5 % av kampanjen är ingen vinnare');
  assert.equal(t.lag.attGora, 1, 'briefen utan ansvarig väntar på en redigerare');
  assert.equal(t.lag.lanserade, 2, 'översättningen i NO-kontot räknas inte');
  assert.deepEqual(t.vinnare, [{ annons: 'Batmotor_SP_1_H5', person: 'Carl', andel: 0.61, dagar: 19 }]);
  assert.deepEqual(t.utanAnnonser, ['Josh'], 'Josh har inget annonsarbete — ingen nolla i tabellen');
});

test('en vinnare kräver en kampanj som spenderar på riktigt', () => {
  const t = byggTavla({ hubbar: HUBBAR, annonser: ANNONSER, andelar: new Map([['a1', { andel: 0.9, kampanjSpend: 200 }]]), team: TEAM, nu: NU });
  assert.equal(t.vinnare.length, 0);
});

const snapshot = () => ({ byggd: NU.toISOString(), tavla: { status: 'ok', meta: 'ok', troskel: { vinnarandel: 0.2, forsenadDagar: 10 }, ...byggTavla({ hubbar: HUBBAR, annonser: ANNONSER, andelar: ANDELAR, team: TEAM, nu: NU }) } });

test('alla roller ser Laget, men startsidan är oförändrad', () => {
  for (const roll of ['agare', 'chef', 'redigerare', 'produkttest', 'support_chef', 'va']) assert.equal(farSe({ roll }, 'laget'), true, roll);
  assert.equal(startsidaFor({ roll: 'redigerare' }), '/app/redigerare');
  assert.equal(startsidaFor({ roll: 'va' }), '/app/kundtjanst');
});

test('redigeraren ser tavlan på engelska, med vinnaren — och aldrig kronor eller andra personers ledtid', () => {
  sattSprak('en');
  const html = lagetSida({ snapshot: snapshot(), anvandare: { roll: 'redigerare', namn: 'Carl' } }).innehall;
  assert.match(html, /Winners this week/);
  assert.match(html, /Batmotor_SP_1_H5/);
  assert.match(html, /Takes 61 % of its campaign/);
  assert.doesNotMatch(html, /\bkr\b|SEK|spend/i);
  assert.doesNotMatch(html, /Brief to live<\/th>/, 'ledtid per person är ledningens');
  sattSprak('sv');
});

test('ägaren ser ledtid och andel vinnare per person', () => {
  sattSprak('sv');
  const html = lagetSida({ snapshot: snapshot(), anvandare: { roll: 'agare', namn: 'Axel' } }).innehall;
  assert.match(html, /Veckans vinnare/);
  assert.match(html, /Brief till live<\/th>/);
  assert.match(html, /Har legat länge/);
});

test('utan tavla i snapshoten står orsaken', () => {
  sattSprak('sv');
  const html = lagetSida({ snapshot: { tavla: { status: 'saknas', orsak: 'NOTION_TOKEN saknas' } }, anvandare: { roll: 'agare' } }).innehall;
  assert.match(html, /Tavlan är inte hämtad än/);
  assert.match(html, /NOTION_TOKEN saknas/);
});
