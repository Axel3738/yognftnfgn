// Kontaktregistret: influencers, UGC-kreatörer, leverantörer.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { nyKontakt, uppdateraKontakt, lasKontakter, skrivKontakt, statusnamn, typnamn } from '../kontakter.mjs';

test('ny kontakt kräver namn och varumärke, städar länken', () => {
  assert.throws(() => nyKontakt({ brand: 'carashell', namn: '' }), /namn/i);
  assert.throws(() => nyKontakt({ brand: '', namn: 'X' }), /varumärke/i);
  assert.throws(() => nyKontakt({ brand: 'carashell', namn: 'X', nastaDatum: 'imorgon' }), /ÅÅÅÅ-MM-DD/);
  const k = nyKontakt({ brand: 'carashell', namn: '@husvagnsliv', typ: 'influencer', lank: 'tiktok.com/@husvagnsliv', status: 'kontaktad', nastaDatum: '2026-10-01' });
  assert.equal(k.lank, 'https://tiktok.com/@husvagnsliv');
  assert.equal(k.status, 'kontaktad');
  assert.equal(nyKontakt({ brand: 'x', namn: 'y', lank: 'javascript:alert(1)' }).lank, '', 'bara http(s) släpps igenom');
  assert.equal(nyKontakt({ brand: 'x', namn: 'y', typ: 'påhitt', status: 'påhitt' }).typ, 'annat');
  assert.equal(nyKontakt({ brand: 'x', namn: 'y', typ: 'påhitt', status: 'påhitt' }).status, 'att_kontakta');
});

test('uppdatering ger ny rad med samma id, och lagringen tar senaste', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'kont-'));
  const fil = join(tmp, 'kontakter.jsonl');
  const k = nyKontakt({ brand: 'carashell', namn: 'Leverantören AB', typ: 'leverantor' });
  skrivKontakt(k, fil);
  const ny = uppdateraKontakt(k, { status: 'avtal', nastaSteg: 'skicka PO', nastaDatum: '2026-10-03' });
  skrivKontakt(ny, fil);
  const lasta = lasKontakter(fil);
  assert.equal(lasta.length, 1);
  assert.equal(lasta[0].status, 'avtal');
  assert.equal(lasta[0].nastaSteg, 'skicka PO');
  assert.throws(() => uppdateraKontakt(k, { nastaDatum: 'snart' }), /ÅÅÅÅ-MM-DD/);
  skrivKontakt(uppdateraKontakt(ny, { raderad: true }), fil);
  assert.equal(lasKontakter(fil).length, 0);
  rmSync(tmp, { recursive: true, force: true });
});

test('namnen finns på båda språken', () => {
  assert.equal(statusnamn('att_kontakta', 'sv'), 'Att kontakta');
  assert.equal(statusnamn('att_kontakta', 'en'), 'To contact');
  assert.equal(typnamn('ugc', 'en'), 'UGC creator');
});
