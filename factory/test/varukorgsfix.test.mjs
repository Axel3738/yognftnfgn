// Tester för varukorgsfixen — den rena logiken, ingen nätverkstrafik.
// Kör: node --test factory/test/varukorgsfix.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { valjLiveTema, jamforFil } from '../varukorgsfix.mjs';
import { TEMAFILER } from '../tema.mjs';

test('valjLiveTema: exakt ett MAIN-tema väljs, oavsett skiftläge på rollen', () => {
  const teman = [
    { id: 'gid://shopify/OnlineStoreTheme/1', name: 'Horizon', role: 'UNPUBLISHED' },
    { id: 'gid://shopify/OnlineStoreTheme/2', name: 'TankGuard – CRO v1', role: 'main' },
  ];
  assert.equal(valjLiveTema(teman).id, 'gid://shopify/OnlineStoreTheme/2');
});

test('valjLiveTema: stopp utan publicerat tema och stopp vid flera', () => {
  assert.throws(() => valjLiveTema([{ name: 'A', role: 'UNPUBLISHED' }]), /0 st/);
  assert.throws(() => valjLiveTema([]), /inga teman/);
  assert.throws(
    () => valjLiveTema([{ name: 'A', role: 'MAIN' }, { name: 'B', role: 'MAIN' }]),
    /2 st/
  );
});

test('jamforFil: fabrikens egen fil bär båda halvorna av fixen', () => {
  const fabrik = TEMAFILER['assets/ms-paket.js'];
  const j = jamforFil(fabrik, fabrik);
  assert.equal(j.identisk, true);
  assert.equal(j.harEnSubmit, true, 'stopImmediatePropagation saknas i fabrikens ms-paket.js');
  assert.equal(j.harVarornaForst, true, 'fabrikens ms-paket.js lägger inte varorna före koden');
});

test('jamforFil: den gamla filen (koden före varorna, dubbel submit) känns igen som fel', () => {
  // Den minifierade koden tankguard.se serverade 2026-09-10 — kärnan i kop().
  const gammal =
    'document.addEventListener("submit",this.kop.bind(this),!0)' +
    'var koden=kod?fetch(rutt+"discount/"+encodeURIComponent(kod)+"?redirect=/cart.js"):Promise.resolve();' +
    'koden.then(function(){fetch(rutt+"cart/add.js",{method:"POST"})})';
  const j = jamforFil(gammal, TEMAFILER['assets/ms-paket.js']);
  assert.equal(j.identisk, false);
  assert.equal(j.harEnSubmit, false);
  assert.equal(j.harVarornaForst, false);
  assert.equal(j.liveByte, Buffer.byteLength(gammal, 'utf8'));
});

test('jamforFil: tom eller saknad livefil kraschar inte', () => {
  const j = jamforFil(null, 'x');
  assert.equal(j.identisk, false);
  assert.equal(j.liveByte, 0);
});

test('fabrikens ms-paket.js på disk är den som TEMAFILER bär', () => {
  const disk = readFileSync(new URL('../tema/assets/ms-paket.js', import.meta.url), 'utf8');
  assert.equal(TEMAFILER['assets/ms-paket.js'], disk);
});
