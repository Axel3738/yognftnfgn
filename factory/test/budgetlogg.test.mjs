// Tester för budgetloggen — nattvaktens minne. Inga nätanrop; fs bara mot
// en tempfil för skriv/läs-rundan.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  byggLoggrad, skrivRad, lasLogg, raknaTrasiga,
  dagarSedanAndring, andringarIdag, harRad, senasteRad, ATGARDER,
} from '../budgetlogg.mjs';

const rad = (o = {}) => ({
  datum: '2026-09-07', ad_account_id: '915422744950975', butik: 'tankguard/tankguard',
  entitet_id: 'k1', entitet_typ: 'campaign', namn: 'TANKGUARD_SALES', atgard: 'SKALA',
  gammalt: 1000, nytt: 1200, motivering: 'test', genomford: true, fel: null, ...o,
});

test('byggLoggrad kräver datum, id, namn, känd åtgärd och känd typ', () => {
  assert.ok(byggLoggrad(rad()).genomford);
  assert.throws(() => byggLoggrad(rad({ datum: '7/9' })), /YYYY-MM-DD/);
  assert.throws(() => byggLoggrad(rad({ entitet_id: '' })), /entitet_id/);
  assert.throws(() => byggLoggrad(rad({ atgard: 'HALVERA' })), /Okänd åtgärd/);
  assert.throws(() => byggLoggrad(rad({ entitet_typ: 'kampanj' })), /Okänd entitetstyp/);
  assert.deepEqual([...ATGARDER], ['SKALA', 'RAKET', 'SNABB', 'SANK', 'PAUSA', 'NOLL_KOP_SANK']);
});

test('en genomförd budgetändring utan nytt belopp vägras — kadensspärren skulle bli blind', () => {
  assert.throws(() => byggLoggrad(rad({ nytt: null })), /osynlig för kadensspärren/);
  // PAUSA bär status, inte belopp — får ha text.
  assert.equal(byggLoggrad(rad({ atgard: 'PAUSA', gammalt: 'ACTIVE', nytt: 'PAUSED' })).nytt, 'PAUSED');
});

test('en misslyckad rad måste bära felet', () => {
  assert.throws(() => byggLoggrad(rad({ genomford: false, fel: null })), /måste bära felet/);
  const r = byggLoggrad(rad({ genomford: false, fel: 'Meta 400' }));
  assert.equal(r.genomford, false);
  assert.equal(r.fel, 'Meta 400');
});

test('skrivRad + lasLogg är en rundresa, och trasiga rader räknas i stället för att stoppa', () => {
  const fil = join(mkdtempSync(join(tmpdir(), 'budgetlogg-')), 'logg.jsonl');
  skrivRad(rad(), fil);
  skrivRad(rad({ datum: '2026-09-08', atgard: 'SANK', nytt: 850 }), fil);
  writeFileSync(fil, 'inte json\n', { flag: 'a' });
  const rader = lasLogg(fil);
  assert.equal(rader.length, 2);
  assert.equal(rader[1].atgard, 'SANK');
  assert.equal(raknaTrasiga(fil), 1);
  assert.deepEqual(lasLogg(join(tmpdir(), 'finns-inte.jsonl')), []);
});

test('dagarSedanAndring räknar hela dygn från senaste GENOMFÖRDA raden — förslag bromsar inte', () => {
  const logg = [
    rad({ datum: '2026-09-01' }),
    rad({ datum: '2026-09-07' }),
    rad({ datum: '2026-09-09', genomford: false, fel: 'Meta 400' }), // rörde inte kontot
    rad({ datum: '2026-09-09', entitet_id: 'k2' }),                  // en annan enhet
  ];
  assert.equal(dagarSedanAndring(logg, 'k1', '2026-09-10'), 3);
  assert.equal(dagarSedanAndring(logg, 'k2', '2026-09-10'), 1);
  assert.equal(dagarSedanAndring(logg, 'k3', '2026-09-10'), null);
  assert.equal(dagarSedanAndring([], 'k1', '2026-09-10'), null);
  assert.throws(() => dagarSedanAndring(logg, 'k1', 'igår'), /Ogiltigt datum/);
});

test('andringarIdag ser bara butikens genomförda rader med dagens datum', () => {
  const logg = [
    rad({ datum: '2026-09-10' }),
    rad({ datum: '2026-09-10', entitet_id: 'k2' }),
    rad({ datum: '2026-09-10', genomford: false, fel: 'x' }),
    rad({ datum: '2026-09-10', butik: 'drytrek/damasker' }),
    rad({ datum: '2026-09-09' }),
  ];
  assert.equal(andringarIdag(logg, 'tankguard/tankguard', '2026-09-10').length, 2);
  assert.equal(andringarIdag(logg, 'drytrek/damasker', '2026-09-10').length, 1);
});

test('harRad: en genomförd åtgärd inom fönstret, aldrig utanför', () => {
  const logg = [rad({ datum: '2026-09-05', atgard: 'NOLL_KOP_SANK', nytt: 700 })];
  assert.equal(harRad(logg, 'k1', 'NOLL_KOP_SANK', 7, '2026-09-10'), true);
  assert.equal(harRad(logg, 'k1', 'NOLL_KOP_SANK', 7, '2026-09-13'), false); // 8 dygn
  assert.equal(harRad(logg, 'k1', 'SANK', 7, '2026-09-10'), false);
  assert.equal(harRad(logg, 'k1', 'NOLL_KOP_SANK'), true); // utan fönster: hela loggen
  assert.equal(harRad([rad({ atgard: 'NOLL_KOP_SANK', nytt: 700, genomford: false, fel: 'x' })], 'k1', 'NOLL_KOP_SANK', 7, '2026-09-10'), false);
  assert.throws(() => harRad(logg, 'k1', 'NOLL_KOP_SANK', 7), /ange idag/);
});

test('senasteRad ger den senast genomförda raden för enheten', () => {
  const logg = [rad({ datum: '2026-09-01' }), rad({ datum: '2026-09-08', atgard: 'SANK', nytt: 850 }), rad({ datum: '2026-09-09', genomford: false, fel: 'x' })];
  assert.equal(senasteRad(logg, 'k1').atgard, 'SANK');
  assert.equal(senasteRad(logg, 'k9'), null);
});
