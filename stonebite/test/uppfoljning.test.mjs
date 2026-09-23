// Bocken på AI-botens svar (stonebite/uppfoljning.mjs): senaste raden per
// nyckel vinner, bara loggens nycklar släpps in, botens logg rörs aldrig.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lasUppfoljning, skrivUppfoljning, giltigNyckel } from '../uppfoljning.mjs';
import { fallNyckel } from '../../kundtjanst/autosvar/oversikt.mjs';

const tmp = mkdtempSync(join(tmpdir(), 'uppfoljning-'));
test.after(() => rmSync(tmp, { recursive: true, force: true }));

test('nyckeln ur loggen: sha256 av Message-ID (16 hex), reserven uid|tid — och båda godtas', () => {
  const n = fallNyckel({ messageId: '<CAMbFKHU@mail.gmail.com>', uid: 1691, tid: '2026-09-22T00:04:16.009Z' });
  assert.match(n, /^[0-9a-f]{16}$/);
  assert.equal(n, fallNyckel({ messageId: '<CAMbFKHU@mail.gmail.com>', uid: 9999 }), 'samma mejl efter en flytt (nytt uid) ⇒ samma nyckel');
  assert.doesNotMatch(n, /gmail/, 'nyckeln bär inte adressens domän');
  assert.equal(fallNyckel({ uid: 1691, tid: '2026-09-22T00:04:16.009Z' }), '1691|2026-09-22T00:04:16.009Z');
  assert.ok(giltigNyckel(n));
  assert.ok(giltigNyckel('1691|2026-09-22T00:04:16.009Z'));
  assert.ok(!giltigNyckel(''));
  assert.ok(!giltigNyckel('a b'));
  assert.ok(!giltigNyckel('<script>'));
  assert.ok(!giltigNyckel('x'.repeat(121)));
});

test('senaste raden per nyckel vinner; ångra är en rad med uppfoljd: false', () => {
  const fil = join(tmp, 'bock.jsonl');
  assert.equal(lasUppfoljning(fil).size, 0, 'ingen fil ⇒ tom, inget kast');
  const nu = new Date('2026-09-23T14:02:00Z');
  skrivUppfoljning({ nyckel: 'c3c3c3c3c3c3c3c3', brand: 'baverbutiken', order: '6912', uppfoljd: true, av: 'Mechile', nu }, fil);
  skrivUppfoljning({ nyckel: 'd4d4d4d4d4d4d4d4', brand: 'baverbutiken', order: '7001', uppfoljd: true, av: 'Mechile', nu }, fil);
  let m = lasUppfoljning(fil);
  assert.equal(m.size, 2);
  assert.deepEqual(m.get('c3c3c3c3c3c3c3c3'), { nyckel: 'c3c3c3c3c3c3c3c3', brand: 'baverbutiken', order: '6912', uppfoljd: true, tid: '2026-09-23T14:02:00.000Z', av: 'Mechile' });
  skrivUppfoljning({ nyckel: 'c3c3c3c3c3c3c3c3', uppfoljd: false, av: 'Axel', nu: new Date('2026-09-23T15:00:00Z') }, fil);
  m = lasUppfoljning(fil);
  assert.equal(m.get('c3c3c3c3c3c3c3c3').uppfoljd, false);
  assert.equal(m.get('c3c3c3c3c3c3c3c3').av, 'Axel');
  assert.equal(readFileSync(fil, 'utf8').trim().split('\n').length, 3, 'append-only: raderna står kvar');
});

test('en ogiltig nyckel kastar och skriver ingenting', () => {
  const fil = join(tmp, 'ren.jsonl');
  assert.throws(() => skrivUppfoljning({ nyckel: 'a b<c', uppfoljd: true }, fil), /saknar nyckel/);
  assert.throws(() => skrivUppfoljning({ uppfoljd: true }, fil), /saknar nyckel/);
  assert.ok(!existsSync(fil));
});
