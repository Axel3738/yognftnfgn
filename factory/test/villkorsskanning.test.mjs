import { test } from 'node:test';
import assert from 'node:assert/strict';
import { skannaVillkor } from '../villkorsskanning.mjs';

// HeimGuards riktiga villkor, ur factory/butiker/hemvakten.yaml.
const BUTIK = {
  frakt: { fri_globalt: true, leveranstid: '5–10 arbetsdagar' },
  retur: { oppet_kop_dagar: 30, angerratt_dagar: 14 },
};

test('fraktgränsen fångas i copy — butiken har fri frakt utan gräns', () => {
  const f = skannaVillkor([{ yta: 'copy', text: 'Fri frakt över 300 kr' }], BUTIK);
  assert.equal(f.length, 1);
  assert.equal(f[0].regel, 'fraktgräns');
});

test('fraktgränsen fångas på norska', () => {
  const f = skannaVillkor([{ yta: 'inbränd', text: 'Gratis frakt over 300 kr' }], BUTIK);
  assert.equal(f.length, 1);
});

test('fraktgränsen fångas när den SÄGS i ord', () => {
  // Så här står den i transkriptet för CS_2 och CS_3 — siffran finns inte.
  const f = skannaVillkor([{ yta: 'tal', text: 'Få den nu, betala sen. Fri frakt över trehundra kronor.' }], BUTIK);
  assert.equal(f.length, 1);
  assert.equal(f[0].yta, 'tal');
});

test('fri frakt UTAN gräns är inget fel', () => {
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: 'Fri frakt i hela Sverige' }], BUTIK), []);
});

test('30 dagars öppet köp stämmer med butiken och larmar inte', () => {
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: '30 dagars öppet köp' }], BUTIK), []);
});

test('fel antal dagar fångas', () => {
  const f = skannaVillkor([{ yta: 'copy', text: '14 dagars öppet köp' }], BUTIK);
  assert.equal(f.length, 1);
  assert.equal(f[0].regel, 'öppet köp');
});

test('fel leveranstid fångas', () => {
  const f = skannaVillkor([{ yta: 'copy', text: 'Leverans 2–4 arbetsdagar' }], BUTIK);
  assert.equal(f.length, 1);
  assert.equal(f[0].regel, 'leveranstid');
});

test('rätt leveranstid larmar inte', () => {
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: '5–10 arbetsdagar med fri frakt' }], BUTIK), []);
});

test('en butik som HAR fraktgräns får inget larm för den', () => {
  const medGrans = { frakt: { fri_globalt: false }, retur: { oppet_kop_dagar: 30 } };
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: 'Fri frakt över 300 kr' }], medGrans), []);
});

test('brådska och lagerpåståenden fångas på alla ytor — en OPS-butik lovar aldrig tidsbegränsning', () => {
  // AdventLane 2026-09-10: hela CS-konceptet bar det i tal ("Lagret är
  // begränsat och priset gäller inte länge"), inbränt ("BEGRÄNSAT LAGER –
  // SLUT INNAN JUL") och copy ("23% rabatt – bara idag") utan att någon regel slog till.
  for (const [yta, text] of [
    ['copy', '23% rabatt – bara idag 🎄'],
    ['inbränd', 'BEGRÄNSAT LAGER – SLUT INNAN JUL'],
    ['inbränd', 'KÖP INNAN DEN TAR SLUT'],
    ['tal', 'Lagret är begränsat och priset gäller inte länge.'],
    ['tal', 'Sista chansen innan lagret tar slut.'],
    ['copy', 'Bestill før den er utsolgt'],
  ]) {
    const f = skannaVillkor([{ yta, text }], BUTIK);
    assert.equal(f.length, 1, `${yta}: ${text}`);
    assert.equal(f[0].regel, 'brådska');
    assert.equal(f[0].yta, yta);
  }
  // Priset i sig är inget brådskepåstående.
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: '649 kr → 499 kr, spara 150 kr' }], BUTIK), []);
});

test('tomma texter ger inga fynd', () => {
  assert.deepEqual(skannaVillkor([], BUTIK), []);
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: '' }], BUTIK), []);
});
