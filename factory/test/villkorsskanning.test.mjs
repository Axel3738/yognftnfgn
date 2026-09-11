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

// --------------------------------------------------------------- CatCabin 2026-09-11
// Alla 16 källannonser fick domen `ren` medan tre av dem läste upp fel pris och
// en fjärde bar källans "30 dagars öppet köp". Varje test här motsvarar ett fel
// som slank igenom den dagen.

const PRODUKT = { ekonomi: { pris: 789, jamforpris: 1039 } };

test('fel UPPLÄST pris fångas — 809 när butiken säljer för 789', () => {
  const f = skannaVillkor(
    [{ yta: 'tal', text: 'Från 1059 kronor ner till 809, torrt och varmt för din katt.' }],
    BUTIK, PRODUKT
  );
  const pris = f.filter((x) => x.regel === 'pris');
  assert.equal(pris.length, 2, 'både 1059 och 809 ska fällas');
  assert.equal(pris[0].yta, 'tal');
  assert.match(pris[0].fel, /butiken säljer för 789 kr/);
});

test('butikens EGET pris och jämförpris larmar aldrig', () => {
  const f = skannaVillkor(
    [{ yta: 'copy', text: '789 kr istället för 1039 kr — fri frakt.' }],
    BUTIK, PRODUKT
  );
  assert.deepEqual(f.filter((x) => x.regel === 'pris'), []);
});

test('paketpriser som skickats in som tillåtna larmar inte', () => {
  const f = skannaVillkor(
    [{ yta: 'copy', text: '2-pack för 1341 kr' }],
    BUTIK, PRODUKT, [1341]
  );
  assert.deepEqual(f.filter((x) => x.regel === 'pris'), []);
});

test('tal UTAN valutaord är inget prisfynd — "1000 liter" är en produktspec', () => {
  const f = skannaVillkor(
    [{ yta: 'copy', text: 'Passar IBC-tankar på 1000 liter' }],
    BUTIK, PRODUKT
  );
  assert.deepEqual(f.filter((x) => x.regel === 'pris'), []);
});

test('utan produkt körs ingen prisregel — men resten av skanningen lever', () => {
  const f = skannaVillkor([{ yta: 'tal', text: 'Bara 809 kr i dag!' }], BUTIK);
  assert.deepEqual(f.filter((x) => x.regel === 'pris'), []);
});

test('tidsbegränsat erbjudande fångas — butiken har ingen kampanj', () => {
  const f = skannaVillkor(
    [{ yta: 'tal', text: 'Erbjudandet gäller bara idag. Beställ nu innan det är slut.' }],
    BUTIK, PRODUKT
  );
  assert.equal(f.filter((x) => x.regel === 'tidsbegränsat erbjudande').length, 1);
});

test('en butik som HAR ett tidsbegränsat erbjudande larmar inte', () => {
  const medKampanj = { ...BUTIK, erbjudande: { tidsbegransat: true } };
  const f = skannaVillkor([{ yta: 'tal', text: 'Bara i dag!' }], medKampanj, PRODUKT);
  assert.deepEqual(f.filter((x) => x.regel === 'tidsbegränsat erbjudande'), []);
});

// CatCabin ger 14 dagar; källan (Bäverbutiken) lovar 30. Just det paret var
// felet som OCR:ens teckenförlust dolde.
const BUTIK_14 = { frakt: { fri_globalt: true }, retur: { oppet_kop_dagar: 14 } };

test('OCR utan ö fångas ändå — "30 dagars oppet kop" är samma fel som med ö', () => {
  const f = skannaVillkor([{ yta: 'inbränd', text: '30 dagars oppet kop - helt riskfri' }], BUTIK_14);
  assert.equal(f.filter((x) => x.regel === 'öppet köp').length, 1,
    'teckenförlust i OCR får aldrig göra ett äkta villkorsfel osynligt');
});

test('normaliseringen bryter inte den vanliga stavningen', () => {
  const f = skannaVillkor([{ yta: 'copy', text: '30 dagars öppet köp' }], BUTIK_14);
  assert.equal(f.filter((x) => x.regel === 'öppet köp').length, 1);
});

test('samma fel i flera frames redovisas EN gång', () => {
  const rader = Array.from({ length: 7 }, () => ({ yta: 'inbränd', text: '30 dagars oppet kop' }));
  const f = skannaVillkor(rader, BUTIK_14);
  assert.equal(f.filter((x) => x.regel === 'öppet köp').length, 1,
    'OCR ser raden i varje frame — det är ett fel att rätta, inte sju');
});

test('samma regel på OLIKA ytor är olika fel och slås inte ihop', () => {
  const f = skannaVillkor([
    { yta: 'copy', text: '30 dagars oppet kop' },
    { yta: 'inbränd', text: '30 dagars oppet kop' },
  ], BUTIK_14);
  assert.equal(f.filter((x) => x.regel === 'öppet köp').length, 2,
    'copy är gratis att rätta, inbränd kräver slutkortsbygge — de får aldrig slås ihop');
});
