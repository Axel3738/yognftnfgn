// Textspärren före rendering (verifiera.py): ordet rea släpps bara igenom när
// ägarens beslut står i skrift i briefen. Fars dag-batchen 2026-09-28.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKRIPT = join(dirname(fileURLToPath(import.meta.url)), '..', 'verifiera.py');

function kor(brief, block) {
  const mapp = mkdtempSync(join(tmpdir(), 'verifiera-'));
  const briefar = join(mapp, 'briefar');
  mkdirSync(briefar);
  writeFileSync(join(briefar, 'Takoverdrag_FD_2_1.txt'), brief);
  const spec = join(mapp, 'spec.json');
  writeFileSync(spec, JSON.stringify({ bild: 'in.png', ut: 'Takoverdrag_FD_2_1.png', block }));
  return spawnSync('python3', [SKRIPT, '--spec', spec, '--briefar', briefar], { encoding: 'utf8' });
}

const BRIEF = '| Badge | Fars dag-rea | Father\'s Day sale |\n| Bottom line | Beställ senast 19 oktober | Order by 19 October |\nFars dag-rea bara idag\n';
const REA = [{ text: 'Fars dag-rea', zon: 'topp', stil: 'badge' }];

test('ordet rea stoppas när ägarens beslut inte står i briefen', () => {
  const r = kor(BRIEF, REA);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /ordet rea/);
});

test('ordet rea släpps igenom när briefen bär REA BESLUTAD AV ÄGAREN', () => {
  const r = kor(`${BRIEF}REA BESLUTAD AV ÄGAREN 2026-09-28: rean är produktsidans jämförpris.\n`, REA);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('beslutet släpper bara ordet rea, påhittad knapphet stoppas ändå', () => {
  const r = kor(`${BRIEF}REA BESLUTAD AV ÄGAREN 2026-09-28: rean är produktsidans jämförpris.\n`,
    [{ text: 'Fars dag-rea bara idag', zon: 'topp', stil: 'badge' }]);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /påhittad knapphet/);
  assert.doesNotMatch(r.stdout, /ordet rea/);
});

test('beslutet måste stå först på en egen rad, inte mitt i en mening', () => {
  const r = kor(`${BRIEF}Här står inget REA BESLUTAD AV ÄGAREN mitt i texten.\n`, REA);
  assert.equal(r.status, 1, r.stdout);
});
