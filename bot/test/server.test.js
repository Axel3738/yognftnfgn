// validera() är enda skyddet mellan "Claude föreslog något" och "servern
// byggdes om". Den testas hårt; utfor() ringer Discord och testas inte här.

import test from 'node:test';
import assert from 'node:assert/strict';
import { validera, beskriv, kanalnamn, MAX_PER_KATEGORI, MAX_NAMNBYTEN } from '../server.js';

const LÄGE = {
  skyddade: ['skalning', 'ads-to-edit'],
  kategorier: [{ namn: 'Produkter' }],
  kanaler: [
    { namn: 'skalning', kategori: '' },
    { namn: 'ads-to-edit', kategori: '' },
    { namn: 'gammalt-skrap', kategori: '' },
    { namn: 'motorholjet', kategori: 'Produkter' },
  ],
};

const plan = (...atgarder) => ({ sammanfattning: 't', atgarder });

test('kanalnamn städas till något Discord accepterar', () => {
  assert.equal(kanalnamn('Nya Produkter!'), 'nya-produkter');
  assert.equal(kanalnamn('  a   b  '), 'a-b');
  assert.equal(kanalnamn('---x---'), 'x');
  assert.equal(kanalnamn('bälteslipmaskinen'), 'bälteslipmaskinen');
  assert.equal(kanalnamn('🔥🔥'), '');
  assert.equal(kanalnamn('x'.repeat(200)).length, 100);
});

test('skyddade kanaler går inte att röra — rutinen postar där', () => {
  const ut = validera(plan(
    { typ: 'byt_namn', namn: 'skalning', nytt_namn: 'skalningen', motiv: '' },
    { typ: 'arkivera', namn: 'ads-to-edit', motiv: '' },
    { typ: 'flytta', namn: 'skalning', kategori: 'Produkter', motiv: '' },
  ), LÄGE);

  assert.equal(ut.atgarder.length, 0, 'ingen av dem får släppas igenom');
  assert.equal(ut.avvisade.length, 3);
  for (const a of ut.avvisade) assert.match(a.varfor, /skyddad/);
});

test('åtgärder på kanaler som inte finns avvisas i stället för att krascha', () => {
  const ut = validera(plan(
    { typ: 'byt_namn', namn: 'finns-inte', nytt_namn: 'x', motiv: '' },
    { typ: 'arkivera', namn: 'inte-heller', motiv: '' },
  ), LÄGE);
  assert.equal(ut.atgarder.length, 0);
  assert.equal(ut.avvisade.length, 2);
});

test('en kategori som skapas i planen räknas som befintlig för senare steg', () => {
  const ut = validera(plan(
    { typ: 'skapa_kategori', namn: 'Tester', motiv: '' },
    { typ: 'skapa_kanal', namn: 'Nytt Test', kategori: 'Tester', motiv: '' },
  ), LÄGE);
  assert.equal(ut.atgarder.length, 2, 'kanalen ska inte avvisas för att kategorin är ny');
  assert.equal(ut.atgarder[1].namn, 'nytt-test');
});

test('kanal i en kategori som inte finns avvisas', () => {
  const ut = validera(plan(
    { typ: 'skapa_kanal', namn: 'x', kategori: 'Finns Inte', motiv: '' },
  ), LÄGE);
  assert.equal(ut.atgarder.length, 0);
  assert.match(ut.avvisade[0].varfor, /finns inte/);
});

test('dubbletter fångas — både mot servern och inom samma plan', () => {
  const ut = validera(plan(
    { typ: 'skapa_kanal', namn: 'motorholjet', motiv: '' },
    { typ: 'skapa_kanal', namn: 'helt-ny', motiv: '' },
    { typ: 'skapa_kanal', namn: 'Helt Ny', motiv: '' },
  ), LÄGE);
  assert.equal(ut.atgarder.length, 1);
  assert.equal(ut.avvisade.length, 2);
  for (const a of ut.avvisade) assert.match(a.varfor, /finns redan/);
});

test('namnbyte frigör det gamla namnet och tar det nya', () => {
  const ut = validera(plan(
    { typ: 'byt_namn', namn: 'gammalt-skrap', nytt_namn: 'nytt-namn', motiv: '' },
    { typ: 'skapa_kanal', namn: 'gammalt-skrap', motiv: '' },
    { typ: 'skapa_kanal', namn: 'nytt-namn', motiv: '' },
  ), LÄGE);
  assert.equal(ut.atgarder.length, 2, 'gamla namnet blir ledigt, nya blir upptaget');
  assert.equal(ut.avvisade.length, 1);
  assert.equal(ut.avvisade[0].namn, 'nytt-namn');
  assert.match(ut.avvisade[0].varfor, /finns redan/);
});

test('Discords tak på namnbyten per kanal respekteras', () => {
  const kedja = [];
  for (let i = 0; i < MAX_NAMNBYTEN + 2; i += 1) {
    kedja.push({ typ: 'byt_namn', namn: i === 0 ? 'gammalt-skrap' : `steg-${i - 1}`, nytt_namn: `steg-${i}`, motiv: '' });
  }
  const ut = validera(plan(...kedja), LÄGE);
  // Kedjan följer SAMMA kanal genom alla namn. Räknas taket på nuvarande namn
  // nollställs det vid varje byte och alla släpps igenom — då köar Discord
  // anropen i tysthet i tiotals minuter.
  assert.equal(ut.atgarder.length, MAX_NAMNBYTEN, 'taket räknas per kanal, inte per namn');
  assert.match(ut.avvisade[0].varfor, /namnbyten/);
});

test('kategorier fylls inte över Discords gräns', () => {
  const fulla = Array.from({ length: MAX_PER_KATEGORI }, (_, i) => ({ namn: `k${i}`, kategori: 'Produkter' }));
  const ut = validera(
    plan({ typ: 'skapa_kanal', namn: 'en-till', kategori: 'Produkter', motiv: '' }),
    { ...LÄGE, kanaler: fulla },
  );
  assert.equal(ut.atgarder.length, 0);
  assert.match(ut.avvisade[0].varfor, new RegExp(`${MAX_PER_KATEGORI}`));
});

test('okända åtgärdstyper släpps aldrig igenom', () => {
  // Viktigast av alla: hittar Claude på "radera" ska den dö här.
  const ut = validera(plan(
    { typ: 'radera', namn: 'gammalt-skrap', motiv: '' },
    { typ: 'ban_alla', namn: 'gammalt-skrap', motiv: '' },
  ), LÄGE);
  assert.equal(ut.atgarder.length, 0);
  assert.equal(ut.avvisade.length, 2);
});

test('beskriv redovisar både det som körs och det som ströks', () => {
  const ut = validera(plan(
    { typ: 'skapa_kanal', namn: 'ny-kanal', motiv: '' },
    { typ: 'arkivera', namn: 'skalning', motiv: '' },
  ), LÄGE);
  const text = beskriv(ut);
  assert.match(text, /ny-kanal/);
  assert.match(text, /Struket/, 'en tyst bortsållad åtgärd ser ut som att den kördes');
  assert.match(text, /skalning/);
  assert.match(text, /Inget raderas/);
});

test('tom plan går att beskriva utan att krascha', () => {
  const text = beskriv(validera(plan(), LÄGE));
  assert.match(text, /Ingenting att göra/);
  assert.doesNotMatch(beskriv({ atgarder: [], avvisade: [] }), /undefined/);
});
