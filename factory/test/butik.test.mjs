// Tester för butikskonfigen och fraktupplägget. Ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { valideraButik, sammanfoga } from '../butik.mjs';
import { byggFraktplan, byggFraktatgarder, fraktraderForKund, FRI_FRAKT } from '../frakt.mjs';
import { rabutik, raprodukt, dummy, medButiksfrakt } from './hjalp.mjs';

const namn = (r) => r.fel;

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

// --- Sammanvävningen ---

test('produkten ärver bolagsuppgifter, valuta och frakt från butiken', () => {
  const p = dummy();
  assert.equal(p.brand.org_namn, 'Exempelbolaget AB');
  assert.equal(p.brand.kontakt_epost, 'hello@nackmagneten.se');
  assert.equal(p.ekonomi.valuta, 'SEK');
  assert.equal(p.shipping.kostnad, 0);
  assert.equal(p.shipping.alternativ[0].namn, 'Express inom Sverige');
});

test('produktfilen bär ingen butiksdata längre', () => {
  const rap = raprodukt();
  assert.equal(rap.brand.orgnr, undefined);
  assert.equal(rap.ekonomi.valuta, undefined);
  assert.equal(rap.shipping, undefined);
});

test('butikens garantier läggs före produktens, utan dubbletter', () => {
  assert.deepEqual(dummy().garantier, [
    '30 dagars öppet köp',
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

// --- Fraktplanen ---

test('fri frakt globalt ger fri frakt i alla tre zoner', () => {
  const plan = byggFraktplan(rabutik());
  assert.equal(plan.length, 3);
  assert.equal(plan[0].zon, 'Sverige');
  assert.equal(plan[0].huvudmarknad, true);
  for (const zon of plan) assert.equal(zon.metoder[0].namn, FRI_FRAKT);
});

test('express läggs bara på huvudmarknaden', () => {
  const plan = byggFraktplan(rabutik());
  assert.equal(plan[0].metoder.length, 2);
  assert.equal(plan[0].metoder[1].pris, 99);
  for (const zon of plan.slice(1)) assert.equal(zon.metoder.length, 1);
});

test('huvudmarknaden följer konfigen, inte en hårdkodad lista', () => {
  const b = rabutik();
  b.butik.huvudmarknad = 'Norge';
  b.butik.valuta = 'NOK';
  const plan = byggFraktplan(b);
  assert.equal(plan[0].zon, 'Norge');
  assert.equal(plan[0].metoder[0].valuta, 'NOK');
});

test('betald frakt ger standardpris och fri frakt-gräns', () => {
  const b = { ...rabutik(), frakt: { fri_globalt: false, standardpris: 49, fri_over: 599 } };
  const plan = byggFraktplan(b);
  assert.equal(plan[0].metoder[0].namn, 'Standardfrakt');
  assert.equal(plan[0].metoder[0].pris, 49);
  assert.deepEqual(plan[0].metoder[0].villkor, { friOver: 599 });
});

// --- Skillnaden mot butiken som den ser ut nu ---

const NULAGE = [
  { zon: 'Sverige', metoder: [{ id: 's1', namn: 'Fri frakt', pris: 0 }, { id: 's2', namn: 'Express inom Sverige', pris: 99 }] },
  { zon: 'EU (Europeiska Unionen)', metoder: [{ id: 'e1', namn: 'Fri frakt', pris: 0 }] },
  { zon: 'Internationell', metoder: [{ id: 'i1', namn: 'Fri frakt', pris: 0 }] },
];

test('en butik som redan matchar planen lämnas orörd', () => {
  const r = byggFraktatgarder(NULAGE, byggFraktplan(rabutik()));
  assert.equal(r.orort, true);
});

test('fel pris i en zon ger en uppdatering, inte en nyskapad metod', () => {
  const nulage = structuredClone(NULAGE);
  nulage[1].metoder[0].pris = 299;
  const r = byggFraktatgarder(nulage, byggFraktplan(rabutik()));
  assert.equal(r.attUppdatera.length, 1);
  assert.equal(r.attUppdatera[0].id, 'e1');
  assert.equal(r.attUppdatera[0].metod.pris, 0);
  assert.equal(r.attSkapa.length, 0);
});

test('metod som inte finns i planen tas bort', () => {
  const nulage = structuredClone(NULAGE);
  nulage[0].metoder.push({ id: 's3', namn: 'Standardfrakt', pris: 39 });
  const r = byggFraktatgarder(nulage, byggFraktplan(rabutik()));
  assert.equal(r.attTaBort.length, 1);
  assert.equal(r.attTaBort[0].namn, 'Standardfrakt');
});

test('zon som saknas i butiken rapporteras i stället för att gissas', () => {
  const r = byggFraktatgarder([NULAGE[0]], byggFraktplan(rabutik()));
  assert.deepEqual(r.saknadeZoner, ['EU (Europeiska Unionen)', 'Internationell']);
});

test('kundraderna säger samma sak som zonerna', () => {
  const rader = fraktraderForKund(rabutik(), '5–8 arbetsdagar');
  assert.deepEqual(rader, [
    'Leveranstid: 5–8 arbetsdagar',
    'Fri frakt till alla länder',
    'Express inom Sverige: 99 kr, 1–2 arbetsdagar',
  ]);
});
