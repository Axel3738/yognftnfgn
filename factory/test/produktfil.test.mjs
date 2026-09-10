import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hittaProduktfil, lasProduktfil } from '../produktfil.mjs';

test('hittaProduktfil: filnamnet först, annars produkt.id (tacklebay-spohallaren → fiskespohallare-4-pack)', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'ops-produktfil-'));
  writeFileSync(join(mapp, 'tankguard.yaml'), 'produkt:\n  id: "tankguard"\n');
  writeFileSync(join(mapp, 'tacklebay-spohallaren.yaml'), 'produkt:\n  id: "fiskespohallare-4-pack"\n');
  writeFileSync(join(mapp, 'trasig.yaml'), 'produkt: [\n');
  assert.equal(hittaProduktfil('tankguard', { mapp }), join(mapp, 'tankguard.yaml'));
  assert.equal(hittaProduktfil('fiskespohallare-4-pack', { mapp }), join(mapp, 'tacklebay-spohallaren.yaml'));
  assert.equal(hittaProduktfil('finns-inte', { mapp }), null);
  assert.throws(() => lasProduktfil('finns-inte', { mapp }), /Ingen produktfil/);
  assert.equal(lasProduktfil('fiskespohallare-4-pack', { mapp }).p.produkt.id, 'fiskespohallare-4-pack');
  rmSync(mapp, { recursive: true, force: true });
});
