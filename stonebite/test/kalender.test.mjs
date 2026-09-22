// Kalendern: datumorden, valideringen och det systemet härleder.
// Axels krav: "väldigt lätt att lägga in vad det är man ska planera och när".
// Det här testet är beviset på att "imorgon kl 14" faktiskt blir i morgon kl 14.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { tolkaNar, nyHandelse, harleddaHandelser, manadsdagar, idag, plusDagar, lasHandelser, skrivHandelse } from '../kalender.mjs';

// Tisdag 22 september 2026, 10:00 svensk tid.
const NU = new Date('2026-09-22T08:00:00Z');

test('idag räknas i svensk tid', () => {
  assert.equal(idag(NU), '2026-09-22');
  // 23:30 UTC är redan nästa dag i Stockholm (CEST)
  assert.equal(idag(new Date('2026-09-22T23:30:00Z')), '2026-09-23');
});

test('"imorgon kl 14" blir i morgon klockan 14 och orden försvinner ur titeln', () => {
  const r = tolkaNar('Ring leverantören imorgon kl 14', { nu: NU });
  assert.equal(r.datum, '2026-09-23');
  assert.equal(r.tid, '14:00');
  assert.equal(r.titel, 'Ring leverantören');
});

test('veckodag är nästa sådan dag — och "fredag" på en fredag är nästa fredag', () => {
  assert.equal(tolkaNar('Byt kort på banken fredag', { nu: NU }).datum, '2026-09-25');
  assert.equal(tolkaNar('Möte tisdag', { nu: NU }).datum, '2026-09-29');
  assert.equal(tolkaNar('Möte nästa fredag', { nu: NU }).datum, '2026-10-02');
});

test('datum i olika former', () => {
  assert.equal(tolkaNar('Lansera julkampanjen 15/10', { nu: NU }).datum, '2026-10-15');
  assert.equal(tolkaNar('Möte 2026-11-02 09:30', { nu: NU }).datum, '2026-11-02');
  assert.equal(tolkaNar('Möte 2026-11-02 09:30', { nu: NU }).tid, '09:30');
  assert.equal(tolkaNar('Faktura den 3 januari', { nu: NU }).datum, '2027-01-03', 'ett passerat datum utan år är nästa år');
  assert.equal(tolkaNar('Skicka prover om 3 dagar', { nu: NU }).datum, '2026-09-25');
  assert.equal(tolkaNar('Uppföljning om två veckor', { nu: NU }).datum, '2026-10-06');
  assert.equal(tolkaNar('Städa lagret idag', { nu: NU }).datum, '2026-09-22');
  assert.equal(tolkaNar('Planera Q4 nästa vecka', { nu: NU }).datum, '2026-09-28');
});

test('utan datumord blir datum null — formulärets fält gäller', () => {
  const r = tolkaNar('Bara en vanlig sak', { nu: NU });
  assert.equal(r.datum, null);
  assert.equal(r.tid, null);
  assert.equal(r.titel, 'Bara en vanlig sak');
});

test('nyHandelse kräver titel och riktigt datum', () => {
  assert.throws(() => nyHandelse({ titel: '', datum: '2026-10-01' }), /vad som ska hända/i);
  assert.throws(() => nyHandelse({ titel: 'x', datum: '1/10' }), /ÅÅÅÅ-MM-DD/);
  assert.throws(() => nyHandelse({ titel: 'x', datum: '2026-10-01', tid: 'kl 14' }), /14:00/);
  const h = nyHandelse({ titel: 'Ring', datum: '2026-10-01', tid: '9:05', brand: 'carashell', typ: 'larm', nu: NU });
  assert.equal(h.tid, '09:05');
  assert.equal(h.typ, 'larm');
  assert.equal(h.klar, false);
  assert.ok(h.id);
});

test('okänd typ blir plan, lagringen tar senaste raden per id', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'kal-'));
  const fil = join(tmp, 'kalender.jsonl');
  const h = nyHandelse({ titel: 'A', datum: '2026-10-01', typ: 'påhitt', nu: NU });
  assert.equal(h.typ, 'plan');
  skrivHandelse(h, fil);
  skrivHandelse({ ...h, klar: true }, fil);
  const lasta = lasHandelser(fil);
  assert.equal(lasta.length, 1);
  assert.equal(lasta[0].klar, true);
  skrivHandelse({ ...h, raderad: true }, fil);
  assert.equal(lasHandelser(fil).length, 0, 'raderad rad syns inte');
  rmSync(tmp, { recursive: true, force: true });
});

test('härledda rader: tvister med deadline, rutiner som ska köra, kontakter att följa upp', () => {
  const snapshot = {
    oppnaTvister: [
      { order: '#5584', brand: 'baverbutiken', typ: 'chargeback', belopp: 348, valuta: 'SEK', deadline: '2026-09-23', oppen: true },
      { order: '#1', brand: 'baverbutiken', typ: 'inquiry', belopp: 1, valuta: 'SEK', deadline: '2027-01-01', oppen: true },
    ],
    rutiner: { rutiner: [
      { id: 'x', namn: 'Nattvakten', brand: 'carashell', status: 'ok', schema: { typ: 'dag', tid: '00:41' }, schematext: '00:41 varje dag', nasta: '2026-09-22T22:41:00.000Z' },
      { id: 'y', namn: 'Spårningen', brand: 'carashell', status: 'ok', schema: { typ: 'timme', minut: 24 }, nasta: '2026-09-22T09:24:00.000Z' },
      { id: 'z', namn: 'Speglingen', brand: 'carashell', status: 'saknas', ord: 'inget spår på 14 dagar', schema: { typ: 'dag', tid: '16:45' }, schematext: '16:45 varje dag', nasta: '2026-09-22T14:45:00.000Z' },
      { id: 'w', namn: 'Briefgranskningen', brand: 'baverbutiken', status: 'ok', schema: { typ: 'vecka', tid: '07:00', veckodagar: [1, 4] }, schematext: '07:00 mån + tors', nasta: '2026-09-24T05:00:00.000Z' },
    ] },
  };
  const kontakter = [{ id: 'k1', brand: 'carashell', namn: '@husvagnsliv', status: 'kontaktad', nastaSteg: 'skicka produkt', nastaDatum: '2026-09-24' }];
  const alla = harleddaHandelser({ snapshot, kontakter, nu: NU, dagar: 30 });
  assert.ok(alla.some((h) => h.kalla === 'tvist' && h.titel.includes('#5584')), 'chargebacken syns');
  assert.ok(!alla.some((h) => h.titel.includes('#1')), 'en deadline om fyra månader ligger utanför fönstret');
  assert.ok(!alla.some((h) => h.titel.startsWith('Nattvakten')), 'en daglig rutin som kör som den ska är brus och hoppas');
  assert.ok(!alla.some((h) => h.titel.startsWith('Spårningen')), 'timrutiner är brus och hoppas');
  const spegling = alla.find((h) => h.titel.startsWith('Speglingen'));
  assert.ok(spegling, 'en daglig rutin som SAKNAS syns — den ska bevakas');
  assert.equal(spegling.typ, 'larm');
  assert.ok(alla.some((h) => h.titel.startsWith('Briefgranskningen')), 'veckorutiner syns alltid');
  assert.ok(alla.some((h) => h.kalla === 'kontakt' && h.titel.includes('husvagnsliv')), 'kontaktens nästa steg syns');
  assert.ok(alla.some((h) => h.id === 'commission:2026-09-25'), 'commissions kördag den 25:e');

  const bara = harleddaHandelser({ snapshot, kontakter, nu: NU, dagar: 30, brand: 'carashell' });
  assert.ok(!bara.some((h) => h.kalla === 'tvist'), 'Bäverbutikens tvist hör inte till CaraShell');
  assert.ok(bara.some((h) => h.kalla === 'kontakt'));

  // Shopifys interna 14-siffriga id kortas — det säger ingenting för den som ska leta upp ordern.
  const langt = harleddaHandelser({ snapshot: { oppnaTvister: [{ order: '17684837138781', brand: 'baverbutiken', typ: 'inquiry', belopp: 348, valuta: 'SEK', deadline: '2026-09-23', oppen: true }] }, nu: NU });
  assert.match(langt.find((h) => h.kalla === 'tvist').titel, /order-id …138781/);
});

test('månadsrutnätet börjar på rätt veckodag', () => {
  const m = manadsdagar(2026, 10);
  assert.equal(m.antal, 31);
  assert.equal(m.startVeckodag, 3, '1 oktober 2026 är en torsdag ⇒ index 3 när måndag är 0');
  assert.equal(plusDagar('2026-09-30', 1), '2026-10-01');
});
