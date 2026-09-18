// Tester för bygg.mjs:s rena delar. Inga nätanrop.
// hittaDna-testerna är porterade från sessionen som byggde takskyddets sida 2026-09-16.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { hittaDna, arBaverLank, valjButik, opsHandleForKalla } from '../bygg.mjs';

function fejkRot() {
  const rot = mkdtempSync(join(tmpdir(), 'listicle-dna-'));
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
  const rot = mkdtempSync(join(tmpdir(), 'listicle-tom-'));
  try { assert.equal(hittaDna('x', rot), null); } finally { rmSync(rot, { recursive: true, force: true }); }
});

test('arBaverLank och valjButik: Bäverbutiken ur länken, annars --butik', () => {
  assert.ok(arBaverLank('https://baverbutiken.se/products/x') && arBaverLank('https://www.baverbutiken.se/products/x'));
  assert.ok(!arBaverLank('https://carashell.se/products/takskyddet') && !arBaverLank('skräp'));
  assert.equal(valjButik([], 'https://baverbutiken.se/products/x'), 'baverbutiken');
  assert.equal(valjButik(['--butik', 'SE'], 'https://x.se/p'), 'baverbutiken');
  assert.equal(valjButik(['--butik', 'CaraShell'], 'https://carashell.se/p'), 'carashell');
  assert.equal(valjButik([], 'https://carashell.se/products/y'), null);
});

test('opsHandleForKalla läser OPS-handlen ur en produktfil med kalla.produkt_handle', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'listicle-produkter-'));
  try {
    writeFileSync(join(mapp, 'takskyddet.yaml'), 'produkt:\n  namn: "Taköverdrag"\n  id: "takskyddet"\n\nkalla:\n  butik: "baverbutiken.se"\n  produkt_handle: "takoverdrag-husvagn-6-5-3-m"\n');
    writeFileSync(join(mapp, 'annan.yaml'), 'produkt:\n  id: "annan"\nkalla:\n  produkt_handle: "nagot-annat"\n');
    assert.equal(opsHandleForKalla('takoverdrag-husvagn-6-5-3-m', { produkterMapp: mapp }), 'takskyddet');
    assert.equal(opsHandleForKalla('finns-inte', { produkterMapp: mapp }), null);
    assert.equal(opsHandleForKalla('x', { produkterMapp: join(mapp, 'saknas') }), null);
  } finally { rmSync(mapp, { recursive: true, force: true }); }
});
