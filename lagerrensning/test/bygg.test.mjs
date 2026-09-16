// Tester för bygg.mjs:s rena delar. Inga nätanrop.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { hittaDna } from '../bygg.mjs';

function fejkRot() {
  const rot = mkdtempSync(join(tmpdir(), 'lagerrensning-dna-'));
  const p = join(rot, 'products');
  mkdirSync(join(p, 'motorholjet'), { recursive: true });
  mkdirSync(join(p, 'carashell', 'takskyddet'), { recursive: true });
  mkdirSync(join(p, 'carashell', 'termoskyddet'), { recursive: true });
  writeFileSync(join(p, 'products.json'), JSON.stringify({ products: [{ id: 'motorholjet' }] }));
  writeFileSync(join(p, 'motorholjet', 'dna.md'), '# Motorhöljet\nhttps://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd\n');
  writeFileSync(join(p, 'carashell', 'takskyddet', 'dna.md'), '# CaraShell\nlänk https://carashell.se/nb/products/takskyddet?country=NO\n');
  writeFileSync(join(p, 'carashell', 'termoskyddet', 'dna.md'), '# Termoskyddet\n/products/termoskyddet\n');
  return rot;
}

test('hittaDna hittar Bäverbutikens minne via products.json', () => {
  const rot = fejkRot();
  try {
    assert.deepEqual(hittaDna('marin-motorholje-420d-universellt-skydd', rot), { id: 'motorholjet', fil: 'products/motorholjet/dna.md' });
  } finally { rmSync(rot, { recursive: true, force: true }); }
});

test('hittaDna hittar OPS-produkternas minne två nivåer ner, utan products.json-rad', () => {
  const rot = fejkRot();
  try {
    assert.deepEqual(hittaDna('takskyddet', rot), { id: 'carashell/takskyddet', fil: 'products/carashell/takskyddet/dna.md' });
    assert.deepEqual(hittaDna('termoskyddet', rot), { id: 'carashell/termoskyddet', fil: 'products/carashell/termoskyddet/dna.md' });
    assert.equal(hittaDna('finns-inte', rot), null);
  } finally { rmSync(rot, { recursive: true, force: true }); }
});

test('hittaDna tål en rot utan products-mapp', () => {
  const rot = mkdtempSync(join(tmpdir(), 'lagerrensning-tom-'));
  try { assert.equal(hittaDna('x', rot), null); } finally { rmSync(rot, { recursive: true, force: true }); }
});
