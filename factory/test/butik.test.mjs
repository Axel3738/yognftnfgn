// Tester för butikskonfigen (validering + sammanvävning). Ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs
// Fraktplanens tester bor i frakt.test.mjs sedan 2026-09-09.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { valideraButik, sammanfoga, kontrolleraMarknader, kontrolleraStartsida } from '../butik.mjs';
import { rabutik, raprodukt, dummy, medButiksfrakt } from './hjalp.mjs';

test('testbutiken validerar utan kritiska fel', () => {
  assert.deepEqual(valideraButik(rabutik()).fel, []);
});

test('saknade bolagsuppgifter stoppar butikskonfigen', () => {
  const b = rabutik();
  delete b.butik.orgnr;
  delete b.butik.supportmail;
  const { fel } = valideraButik(b);
  assert.ok(fel.some((f) => f.includes('butik.orgnr')));
  assert.ok(fel.some((f) => f.includes('butik.supportmail')));
});

test('felstavad supportmail och okänd valuta fångas', () => {
  const b = rabutik();
  b.butik.supportmail = 'hej(at)exempel';
  b.butik.valuta = 'BTC';
  const { fel } = valideraButik(b);
  assert.ok(fel.some((f) => f.includes('supportmail')));
  assert.ok(fel.some((f) => f.includes('okänd')));
});

test('exempeluppgifter varnar men stoppar inte bygget', () => {
  const { fel, varningar } = valideraButik(rabutik());
  assert.deepEqual(fel, []);
  assert.ok(varningar.some((v) => v.includes('exempeluppgift')));
});

test('supportmail som inte är hello@ stoppar konfigen', () => {
  const b = rabutik();
  b.butik.supportmail = 'hej@nackmagneten.se';
  assert.ok(valideraButik(b).fel.some((f) => f.includes('hello@')));
});

test('betald frakt utan pris stoppar konfigen', () => {
  const b = rabutik();
  b.frakt = { fri_globalt: false };
  assert.ok(valideraButik(b).fel.some((f) => f.includes('standardpris')));
});

// --- Fälten resten av kedjan läser (KEDJAN.md regel 7) ---

test('moms_i_pris måste vara true/false; saknas den blir det en varning', () => {
  const b = rabutik();
  b.butik.moms_i_pris = 'ja';
  assert.ok(valideraButik(b).fel.some((f) => f.includes('moms_i_pris')));
  delete b.butik.moms_i_pris;
  const r = valideraButik(b);
  assert.ok(!r.fel.some((f) => f.includes('moms_i_pris')));
  assert.ok(r.varningar.some((v) => v.includes('moms_i_pris')));
});

test('markorer_sv: lista med ord accepteras, fel form stoppar, saknad varnar', () => {
  const b = rabutik();
  b.butik.markorer_sv = ['Köp nu', 'Fri frakt'];
  let r = valideraButik(b);
  assert.ok(!r.fel.some((f) => f.includes('markorer_sv')));
  assert.ok(!r.varningar.some((v) => v.includes('markorer_sv')));
  b.butik.markorer_sv = 'Köp nu';
  assert.ok(valideraButik(b).fel.some((f) => f.includes('markorer_sv')));
  delete b.butik.markorer_sv;
  r = valideraButik(b);
  assert.ok(r.varningar.some((v) => v.includes('markorer_sv')));
});

test('marknader: NO/nb/SEK går igenom, fel landkod och okänd valuta stoppar', () => {
  assert.deepEqual(kontrolleraMarknader([{ land: 'NO', locale: 'nb', valuta: 'SEK' }]).fel, []);
  const r = kontrolleraMarknader([{ land: 'Norge', locale: 'nb', valuta: 'BTC' }]);
  assert.ok(r.fel.some((f) => f.includes('tvåbokstavskod')));
  assert.ok(r.fel.some((f) => f.includes('okänd')));
  assert.ok(kontrolleraMarknader('NO').fel.length === 1);
});

test('marknader som saknas är en varning (steget marknad stoppar), inte ett fel', () => {
  const r = kontrolleraMarknader(undefined);
  assert.deepEqual(r.fel, []);
  assert.ok(r.varningar.some((v) => v.includes('marknader')));
  const b = rabutik();
  b.butik.marknader = [{ land: 'NO', locale: 'nb', valuta: 'SEK' }];
  assert.ok(!valideraButik(b).varningar.some((v) => v.includes('marknader')));
});

test('kollektion: handle och titel krävs när blocket finns', () => {
  const b = rabutik();
  b.butik.kollektion = { handle: 'sortimentet', titel: 'Sortimentet', beskrivning: '' };
  assert.ok(!valideraButik(b).fel.some((f) => f.includes('kollektion')));
  b.butik.kollektion = { handle: 'Sortimentet!' };
  const { fel } = valideraButik(b);
  assert.ok(fel.some((f) => f.includes('kollektion.handle')));
  assert.ok(fel.some((f) => f.includes('kollektion.titel')));
});

test('startsida: formen kontrolleras — max 3 gallerikolumner, faq med fraga, listor är listor', () => {
  const ok = kontrolleraStartsida({
    usp: ['truck:Fri frakt'],
    hero: { rubrik: '', text: '', knapp: '', bild: '' },
    berattelse: { rubrik: '', text: ['Ett stycke.'] },
    galleri: { rubrik: 'G', kolumner: [{ titel: 'a', bild: '' }, { titel: 'b', bild: '' }] },
    faq: [{ fraga: 'Passar den?', svar: 'Ja.' }],
  });
  assert.deepEqual(ok.fel, []);
  const dalig = kontrolleraStartsida({
    usp: 'truck:Fri frakt',
    galleri: { kolumner: [{}, {}, {}, {}] },
    faq: [{ svar: 'utan fråga' }],
    berattelse: { text: { nej: true } },
  });
  assert.ok(dalig.fel.some((f) => f.includes('startsida.usp')));
  assert.ok(dalig.fel.some((f) => f.includes('max 3')));
  assert.ok(dalig.fel.some((f) => f.includes('faq[0]')));
  assert.ok(dalig.fel.some((f) => f.includes('berattelse.text')));
});

test('startsida som saknas är en varning; blocket accepteras på toppnivå i butiksfilen', () => {
  const b = rabutik();
  assert.ok(valideraButik(b).varningar.some((v) => v.includes('startsida')));
  b.startsida = { hero: { rubrik: 'Hej' } };
  const r = valideraButik(b);
  assert.deepEqual(r.fel, []);
  assert.ok(!r.varningar.some((v) => v.includes('startsida')));
});

// --- Sammanvävningen ---

test('produkten ärver bolagsuppgifter, valuta och frakt från butiken', () => {
  const p = dummy();
  assert.equal(p.brand.org_namn, 'Exempelbolaget AB');
  assert.equal(p.brand.kontakt_epost, 'hello@nackmagneten.se');
  assert.equal(p.ekonomi.valuta, 'SEK');
  assert.equal(p.shipping.kostnad, 0);
  assert.equal(p.shipping.alternativ[0].namn, 'Express inom Sverige');
});

test('moms_i_pris följer med i ekonomin — bara som flagga, aldrig som ett nytt break-even', () => {
  const p = dummy();
  assert.equal(p.ekonomi.moms_i_pris, true);
  const b = rabutik();
  delete b.butik.moms_i_pris;
  assert.equal(sammanfoga(b, raprodukt()).ekonomi.moms_i_pris, undefined);
});

test('fraktländerna kommer ur huvudmarknad + marknader, i klartext och utan dubbletter', () => {
  const b = rabutik();
  b.butik.marknader = [{ land: 'NO', locale: 'nb', valuta: 'SEK' }, { land: 'SE', locale: 'sv' }];
  const p = sammanfoga(b, raprodukt());
  assert.deepEqual(p.shipping.lander, ['Sverige', 'Norge']);
  assert.deepEqual(dummy().shipping.lander, ['Sverige']);
});

test('produktfilen bär ingen butiksdata längre', () => {
  const rap = raprodukt();
  assert.equal(rap.brand.orgnr, undefined);
  assert.equal(rap.ekonomi.valuta, undefined);
  assert.equal(rap.shipping, undefined);
});

test('butikens garantier läggs före produktens, utan dubbletter', () => {
  assert.deepEqual(dummy().garantier, [
    '14 dagars ångerrätt',
    'Full återbetalning om du inte känner skillnad',
  ]);
});

test('produktens leveranstid vinner över butikens standard', () => {
  const p = sammanfoga(rabutik(), { ...raprodukt(), leveranstid: '2–3 arbetsdagar' });
  assert.equal(p.shipping.tid, '2–3 arbetsdagar');
});

test('utan express i butiken får produkten inga extra fraktsätt', () => {
  const p = medButiksfrakt({ fri_globalt: true, leveranstid: '5 dagar' });
  assert.deepEqual(p.shipping.alternativ, []);
});
