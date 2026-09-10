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

test('tomma texter ger inga fynd', () => {
  assert.deepEqual(skannaVillkor([], BUTIK), []);
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: '' }], BUTIK), []);
});

// Priset och rabatten (TackleBay 2026-09-10): källvideor sa "149 kronor"
// (gammalt pris) och "40 % rabatt" — inget av det finns hos butiken.
test('fel kronbelopp fångas mot produktens pris; pris, styckpris och paketsumma släpps', () => {
  const butik = { frakt: { fri_globalt: true }, retur: { oppet_kop_dagar: 14 } };
  const produkt = { ekonomi: { pris: 289, jamforpris: 0 } };
  const f = (t) => skannaVillkor([{ yta: 'tal', text: t }], butik, { produkt });
  assert.equal(f('just nu för 149 kronor').length, 1);
  assert.match(f('just nu för 149 kronor')[0].fel, /149 kr — butikens pris är 289/);
  assert.equal(f('289 kr för ett 4-pack, 72,25 kr per hållare').length, 0);
  assert.equal(f('två 4-pack för 578 kr').length, 0);
  assert.equal(f('Fri frakt om du handlar för över 300 kronor')[0].regel, 'fraktgräns');
  assert.equal(f('Handla för 300 kr och frakten är fri').length, 0, '300 som fraktgräns i copy fångas av copy-regeln, inte som pris');
});

test('rabatt i procent är ett fel när produkten saknar jämförpris', () => {
  const butik = { frakt: { fri_globalt: true } };
  const fynd = skannaVillkor([{ yta: 'tal', text: 'IDAG ENDAST – 40% RABATT' }], butik, { produkt: { ekonomi: { pris: 289 } } });
  assert.deepEqual(fynd.map((f) => f.regel).sort(), ['brådska', 'rabatt'], 'rabatten OCH brådskan fångas');
  assert.equal(skannaVillkor([{ yta: 'tal', text: 'just nu till kraftigt rabatterat pris' }], butik, { produkt: { ekonomi: { pris: 289 } } })[0].regel, 'rabatt-ord');
  assert.equal(skannaVillkor([{ yta: 'inbränd', text: 'så långt lagret räcker' }], butik)[0].regel, 'brådska');
  assert.equal(skannaVillkor([{ yta: 'tal', text: '40% rabatt' }], butik, { produkt: { ekonomi: { pris: 289, jamforpris: 480 } } }).length, 0);
  assert.equal(skannaVillkor([{ yta: 'tal', text: '40% rabatt' }], butik).length, 0, 'utan produkt ingen prisregel');
});
