// Larmet för OPS-hubbar som inte står i registret.
//
// Mätt 2026-09-13: "Carashell creative hub" och "catcabin creative hub" dök upp
// på workspace-nivå med andra id:n än de registrerade. Bäverbutikens leveransrunda
// läste dem. Alla fyra databaserna var tomma, så inget laddades upp i fel konto —
// men ingenting hade sagt ifrån om de inte varit tomma.
//
// Larmet går på TITEL. Filtret gör det aldrig — se toppen av ops-hubbar.mjs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { misstankaDubbletter, utanOpsHubbar, opsHubbarUrRegister } from '../lib/ops-hubbar.mjs';

const register = {
  poster: {
    'baverbutiken/motorholjet': { notion: { name: 'Boat cover 420D creative hub', database_id: 'aaa' } },
    'carashell/takskyddet': { notion: { name: 'CaraShell creative hub', database_id: '3d9270ab-908c-819d-be0f-c6cb71320871' } },
    'catcabin/utekattkojan': { notion: { name: 'CatCabin creative hub', database_id: '3d9270ab-908c-8145-8538-d55aaaf4a7e2' } },
  },
};
const karta = opsHubbarUrRegister(register);

test('samma titel, annat id → larm som namnger båda id:na', () => {
  const kvar = [{ id: '3da270ab-908c-80c4-80d1-fbdb3fefd3b4', titel: 'Carashell creative hub' }];
  const rader = misstankaDubbletter(kvar, karta);
  assert.equal(rader.length, 1);
  assert.match(rader[0], /OPS-HUB UTAN REGISTRERING/);
  assert.match(rader[0], /3da270ab-908c-80c4-80d1-fbdb3fefd3b4/);
  assert.match(rader[0], /3d9270ab-908c-819d-be0f-c6cb71320871/);
  assert.match(rader[0], /carashell\/takskyddet/);
});

test('skiftläge och skiljetecken spelar ingen roll för larmet', () => {
  const kvar = [{ id: 'nytt', titel: 'catcabin  CREATIVE-hub' }];
  assert.equal(misstankaDubbletter(kvar, karta).length, 1);
});

test('Bäverbutikens egna hubbar larmar aldrig', () => {
  const kvar = [{ id: 'annat', titel: 'Boat cover 420D creative hub' }];
  assert.deepEqual(misstankaDubbletter(kvar, karta), []);
});

test('en hubb med okänd titel larmar inte', () => {
  const kvar = [{ id: 'x', titel: 'Kranskydd Frost 420D creative hub' }];
  assert.deepEqual(misstankaDubbletter(kvar, karta), []);
});

test('en registrerad hubb filtreras bort och larmar därför inte', () => {
  const rader = [];
  const kvar = utanOpsHubbar(
    [{ id: '3d9270ab-908c-819d-be0f-c6cb71320871', titel: 'CaraShell creative hub' }],
    karta,
    { logg: (r) => rader.push(r) },
  );
  assert.deepEqual(kvar, []);
  assert.equal(rader.filter(r => /UTAN REGISTRERING/.test(r)).length, 0);
});

test('utanOpsHubbar loggar larmet tillsammans med den vanliga raden', () => {
  const rader = [];
  utanOpsHubbar(
    [{ id: 'nytt-id', titel: 'CaraShell creative hub' }],
    karta,
    { logg: (r) => rader.push(r) },
  );
  assert.match(rader[0], /OPS-hubbar undantagna: 0/);
  assert.match(rader[1], /OPS-HUB UTAN REGISTRERING/);
});

test('tomt register ger inga larm', () => {
  const tom = opsHubbarUrRegister({ poster: {} });
  assert.deepEqual(misstankaDubbletter([{ id: 'x', titel: 'CaraShell creative hub' }], tom), []);
});
