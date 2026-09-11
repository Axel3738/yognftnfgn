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

// --------------------------------------------------------------- utskrivna tal
// ⚠️ Mätt 2026-09-11 på takoverdrag_CS_1/2/3 (CaraShell): HeyGens transkript
// stavar ut talet — "Trettio dagars öppet köp om du ångrar dig" — och
// sifferregeln hittade ingenting. Tre videor med ett UTTALAT villkorsfel gick
// igenom som rena. Talytan är den dyraste att rätta, så missen kostar mest där.

const CARASHELL = {
  frakt: { fri_globalt: true, leveranstid: '5–10 arbetsdagar' },
  retur: { oppet_kop_dagar: 14, angerratt_dagar: 14 },
};

test('utskrivet tal i talytan fångas: "trettio dagars öppet köp"', () => {
  const f = skannaVillkor([{ yta: 'tal', text: 'Fri frakt ingår. Trettio dagars öppet köp om du ångrar dig.' }], CARASHELL);
  assert.equal(f.length, 1);
  assert.equal(f[0].regel, 'öppet köp');
  assert.equal(f[0].yta, 'tal');
  assert.match(f[0].fel, /säger 30 dagar — butiken har 14/);
});

test('utskrivet tal som STÄMMER larmar inte', () => {
  assert.deepEqual(skannaVillkor([{ yta: 'tal', text: 'Fjorton dagars öppet köp.' }], CARASHELL), []);
});

test('norsk böjning "30 dagers åpent kjøp" fångas', () => {
  const f = skannaVillkor([{ yta: 'copy', text: '✅ 30 dagers åpent kjøp hvis du ikke er fornøyd' }], CARASHELL);
  assert.equal(f.length, 1);
  assert.equal(f[0].regel, 'öppet köp');
});

test('svensk böjning "30 dagars" fångas fortfarande', () => {
  const f = skannaVillkor([{ yta: 'copy', text: '30 dagars öppet köp om du inte är nöjd' }], CARASHELL);
  assert.equal(f.length, 1);
});

// ------------------------------------------------------- OCR utan diakriter
// ⚠️ Mätt 2026-09-11 på Takoverdrag_SP_2_1: den lokala OCR:en läste bildbandet
// som "30 dagars oppet kop - full aterbetalning" — utan ö och å. Regeln krävde
// "öppet köp" och matchade inte, så ett INBRÄNT villkorsfel gick igenom tyst
// medan exakt samma fel i copyn fångades. Inbränd text kan bara läsas via OCR,
// så ytan var blind för villkor.

test('OCR-text utan ö/å fångas ändå (inbränd yta)', () => {
  const f = skannaVillkor([{ yta: 'inbränd', text: '30 dagars oppet kop - full aterbetalning' }], CARASHELL);
  assert.equal(f.length, 1);
  assert.equal(f[0].regel, 'öppet köp');
  assert.equal(f[0].yta, 'inbränd');
});

test('norsk OCR-text utan å/ø fångas ändå', () => {
  const f = skannaVillkor([{ yta: 'inbränd', text: '30 dagers apent kjop' }], CARASHELL);
  assert.equal(f.length, 1);
});

test('ångerrätt utan diakriter fångas när den är fel', () => {
  const f = skannaVillkor([{ yta: 'inbränd', text: '30 dagars angerratt' }], CARASHELL);
  assert.equal(f.length, 1);
  assert.equal(f[0].regel, 'ångerrätt');
});

test('RÄTT antal dagar larmar inte, med eller utan diakriter', () => {
  assert.deepEqual(skannaVillkor([{ yta: 'inbränd', text: '14 dagars angerratt' }], CARASHELL), []);
  assert.deepEqual(skannaVillkor([{ yta: 'inbränd', text: '14 dagars ångerrätt' }], CARASHELL), []);
  assert.deepEqual(skannaVillkor([{ yta: 'inbränd', text: '14 dagars oppet kop' }], CARASHELL), []);
});
