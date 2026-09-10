// Tester för OPS-hubb-filtret: Bäverbutikens läsare ska hoppa över OPS-butikernas
// Notion-hubbar PER ID ur factory/produkter/register.json — aldrig på titel.
// Inga nätanrop. Fixturregistret skrivs i en temp-katalog.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  opsHubbar, opsHubbarUrRegister, arOpsHubb, utanOpsHubbar, normaliseraId, loggrad,
  REGISTERFIL,
} from '../lib/ops-hubbar.mjs';

const HEIM = '3cd270ab-908c-81bd-aab8-f19ec3e2d260';
const TANK = '3ce270ab908c8161bed2e22f132a6aba';            // utan bindestreck i registret
const BAVER_AXEL = '3aa270ab-908c-808b-9d87-d1f1a0d70cbc';  // Bäverbutikens egen hub

function fixturRot(poster) {
  const rot = mkdtempSync(join(tmpdir(), 'ops-hubbar-'));
  mkdirSync(join(rot, 'factory', 'produkter'), { recursive: true });
  writeFileSync(join(rot, REGISTERFIL), JSON.stringify({ poster }, null, 2));
  return rot;
}

const POSTER = {
  'baverbutiken/axelbaltet': { lage: 'test', notion: { name: 'Trimmer belt creative hub', database_id: BAVER_AXEL } },
  'baverbutiken/vaggfastet': { lage: 'test', notion: { name: '', database_id: '' } },
  'hemvakten/overvakningskameran': { lage: 'skala', notion: { name: 'Surveillance Camera creative hub', database_id: HEIM } },
  'tankguard/tankguard': { lage: 'skala', notion: { name: 'IBC Tank Cover creative hub', database_id: TANK } },
  'drytrek/damasker': { lage: 'skala', notion: { name: '', database_id: '' } },   // inte ifylld än
  'tacklebay/fiskespohallare-4-pack': { lage: 'skala' },                            // saknar notion helt
};

test('normaliseraId: med/utan bindestreck och versaler blir samma nyckel', () => {
  assert.equal(normaliseraId(HEIM), '3cd270ab908c81bdaab8f19ec3e2d260');
  assert.equal(normaliseraId(HEIM.toUpperCase()), normaliseraId(HEIM));
  assert.equal(normaliseraId(' 3ce270ab908c8161bed2e22f132a6aba '), TANK);
  assert.equal(normaliseraId(''), '');
  assert.equal(normaliseraId(null), '');
});

test('opsHubbarUrRegister: bara OPS-poster med ifyllt id, Bäverbutikens hoppas över', () => {
  const karta = opsHubbarUrRegister({ poster: POSTER });
  assert.equal(karta.size, 2);
  assert.ok(karta.has(normaliseraId(HEIM)));
  assert.ok(karta.has(TANK));
  assert.equal(karta.has(normaliseraId(BAVER_AXEL)), false, 'Bäverbutikens egen hub är inte OPS');
  assert.deepEqual(karta.get(TANK), { nyckel: 'tankguard/tankguard', name: 'IBC Tank Cover creative hub', id: TANK });
});

test('opsHubbar läser registret från disk (temp-fixtur)', () => {
  const rot = fixturRot(POSTER);
  try {
    const karta = opsHubbar(rot);
    assert.equal(karta.size, 2);
    assert.ok(arOpsHubb(HEIM, karta));
    assert.ok(arOpsHubb(HEIM.replace(/-/g, ''), karta), 'id utan bindestreck matchar');
    assert.ok(arOpsHubb('3ce270ab-908c-8161-bed2-e22f132a6aba', karta), 'id med bindestreck matchar registrets utan');
    assert.equal(arOpsHubb(BAVER_AXEL, karta), false);
    assert.equal(arOpsHubb('', karta), false);
  } finally {
    rmSync(rot, { recursive: true, force: true });
  }
});

test('saknad fil eller trasig JSON ger tom Map — filtret får aldrig fälla en rutin', () => {
  const tom = mkdtempSync(join(tmpdir(), 'ops-hubbar-tom-'));
  try {
    assert.equal(opsHubbar(tom).size, 0);
    mkdirSync(join(tom, 'factory', 'produkter'), { recursive: true });
    writeFileSync(join(tom, REGISTERFIL), '{ trasig');
    assert.equal(opsHubbar(tom).size, 0);
    writeFileSync(join(tom, REGISTERFIL), '{}');
    assert.equal(opsHubbar(tom).size, 0);
  } finally {
    rmSync(tom, { recursive: true, force: true });
  }
});

test('utanOpsHubbar tar bort per id (oavsett titel) och loggar varje gång', () => {
  const karta = opsHubbarUrRegister({ poster: POSTER });
  const lista = [
    { id: BAVER_AXEL, titel: 'Trimmer belt creative hub' },
    { id: HEIM, titel: 'Något helt annat namn' },            // titeln spelar ingen roll
    { id: '3ce270ab-908c-8161-bed2-e22f132a6aba', titel: 'IBC Tank Cover creative hub' },
    { id: '3cf270ab-908c-81a0-9b0d-c486f6467ce7', titel: 'Damasker vandring' }, // inte i registret än → kvar
  ];
  const loggat = [];
  const kvar = utanOpsHubbar(lista, karta, { logg: (r) => loggat.push(r) });
  assert.deepEqual(kvar.map((h) => h.id), [BAVER_AXEL, '3cf270ab-908c-81a0-9b0d-c486f6467ce7']);
  assert.equal(loggat.length, 1);
  assert.match(loggat[0], /^OPS-hubbar undantagna: 2 \(/);
  assert.match(loggat[0], /Surveillance Camera creative hub/);
  assert.match(loggat[0], /IBC Tank Cover creative hub/);
});

test('utanOpsHubbar med annat id-fält (idAv) och tyst läge', () => {
  const karta = opsHubbarUrRegister({ poster: POSTER });
  const loggat = [];
  const kvar = utanOpsHubbar(
    [{ database_id: HEIM }, { database_id: BAVER_AXEL }],
    karta,
    { idAv: (h) => h.database_id, logg: null },
  );
  assert.deepEqual(kvar, [{ database_id: BAVER_AXEL }]);
  assert.equal(loggat.length, 0);
});

test('tomt register: filtret är no-op men loggar att spärren kördes', () => {
  const karta = new Map();
  const loggat = [];
  const lista = [{ id: HEIM }, { id: BAVER_AXEL }];
  assert.deepEqual(utanOpsHubbar(lista, karta, { logg: (r) => loggat.push(r) }), lista);
  assert.match(loggat[0], /^OPS-hubbar undantagna: 0/);
  assert.match(loggat[0], /register\.mjs notion/);
  assert.match(loggrad([], karta), /inga OPS-hub-id:n ännu/);
});

test('det riktiga registret går att läsa (no-op tills setup fyllt id:n)', () => {
  const karta = opsHubbar();
  assert.ok(karta instanceof Map);
  for (const h of karta.values()) assert.ok(!h.nyckel.startsWith('baverbutiken/'));
});
