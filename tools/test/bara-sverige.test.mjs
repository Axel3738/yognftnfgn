import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baraSverige, vinkelkod } from '../lib/bara-sverige.mjs';
import { bedom } from '../ops-spegla.mjs';

test('fars dag-annonser (FD) stannar i Sverige, video och bild', () => {
  for (const namn of ['Takoverdrag_FD_1_H1', 'Sotarset_FD_2_1', 'MC-Kapell_FD_1_H2', 'CaraShellRoof_FD_101_H1']) {
    assert.match(baraSverige(namn) ?? '', /bara Sverige/, namn);
  }
});

test('andra vinklar får översättas som förut', () => {
  for (const namn of ['Takoverdrag_GT_2_H1', 'IBC_PD_1_H1', 'Batmotor_SP_1_H5', 'Termoskydd_CS_13_1']) {
    assert.equal(baraSverige(namn), null, namn);
  }
});

test('regeln läser vinkelfältet, inte bokstäver i prefixet eller numret', () => {
  assert.equal(baraSverige('FDprodukt_PD_1_H1'), null);
  assert.equal(baraSverige('Takoverdrag_PD_1_FD'), null);
  assert.equal(baraSverige('Takoverdrag_FD'), null, 'för kort namn ⇒ ingen vinkel');
  assert.equal(vinkelkod('Takoverdrag_fd_3_1'), 'FD');
});

test('speglingen stoppar en FD-rad även när allt annat är grönt', () => {
  const rad = { namn: 'Takoverdrag_FD_1_H1', spegel: 'CaraShellRoof_FD_101_H1', brand: [], paritet_se: { ok: true }, kampanj_se: {}, finns_i_meta: { SE: true }, no: null, kampanj_no: {} };
  const b = bedom(rad);
  assert.equal(b.se.ok, false);
  assert.match(b.se.skal.join(' '), /bara Sverige/);
  const annan = bedom({ ...rad, namn: 'Takoverdrag_GT_2_H1', spegel: 'CaraShellRoof_GT_102_H1' });
  assert.equal(annan.se.ok, true);
});
