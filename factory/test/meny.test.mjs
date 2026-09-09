// Tester för meny.mjs — huvudmenyn. Ren logik, ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { huvudmenyRader, kortnamn, menytitel, produkturl } from '../meny.mjs';
import { dummy, rabutik } from './hjalp.mjs';

test('kortnamn: texten före tankstrecket, bindestreck inne i ord lämnas', () => {
  assert.equal(kortnamn('Damasker – håller benen torra'), 'Damasker');
  assert.equal(kortnamn('IBC-överdraget — stoppar alger'), 'IBC-överdraget');
  assert.equal(kortnamn('Nackmagneten - 10 minuter'), 'Nackmagneten');
  assert.equal(kortnamn('DryTrek-damasker'), 'DryTrek-damasker');
  assert.equal(kortnamn('  Spöhållaren  '), 'Spöhållaren');
});

test('menytitel: menynamn vinner över kortnamnet', () => {
  assert.equal(menytitel({ produkt: { namn: 'Spöhållaren – 4-pack', menynamn: 'Spöhållaren' } }), 'Spöhållaren');
  assert.equal(menytitel({ produkt: { namn: 'Spöhållaren – 4-pack', menynamn: '' } }), 'Spöhållaren');
});

test('produkturl: handle före id, kastar utan någotdera', () => {
  assert.equal(produkturl({ produkt: { id: 'a', handle: 'b' } }), '/products/b');
  assert.equal(produkturl({ produkt: { id: 'a' } }), '/products/a');
  assert.throws(() => produkturl({ produkt: { namn: 'X' } }), /saknar handle\/id/);
});

test('enproduktsbutik: Hem / produkten / Frakt & retur / Kontakt — aldrig /collections/all', () => {
  const rader = huvudmenyRader(rabutik(), dummy());
  assert.deepEqual(rader, [
    { titel: 'Hem', url: '/' },
    { titel: 'Nackmagneten', url: '/products/nackmagneten' },
    { titel: 'Frakt & retur', url: '/pages/fraktpolicy' },
    { titel: 'Kontakt', url: '/pages/contact' },
  ]);
  assert.ok(rader.every((r) => !r.url.includes('/collections/all')));
});

test('flerproduktsbutik: kollektionsraden ur butik.yaml + en rad per produkt', () => {
  const butik = { ...rabutik(), butik: { ...rabutik().butik, kollektion: { handle: 'fiske', titel: 'Fiskeprylarna' } } };
  const p1 = dummy();
  const p2 = { ...p1, produkt: { ...p1.produkt, id: 'fiskekalendern', namn: 'Fiskekalendern – 2027', menynamn: 'Kalendern' } };
  const rader = huvudmenyRader(butik, [p1, p2]);
  assert.deepEqual(rader.map((r) => `${r.titel}|${r.url}`), [
    'Hem|/',
    'Fiskeprylarna|/collections/fiske',
    'Nackmagneten|/products/nackmagneten',
    'Kalendern|/products/fiskekalendern',
    'Frakt & retur|/pages/fraktpolicy',
    'Kontakt|/pages/contact',
  ]);
});

test('flerprodukt utan kollektionsblock faller tillbaka på sortimentet, "all" stoppas', () => {
  const p = dummy();
  const p2 = { ...p, produkt: { ...p.produkt, id: 'annan', namn: 'Annan' } };
  const rader = huvudmenyRader(rabutik(), [p, p2]);
  assert.equal(rader[1].url, '/collections/sortimentet');
  const butik = { ...rabutik(), butik: { ...rabutik().butik, kollektion: { handle: 'all' } } };
  assert.throws(() => huvudmenyRader(butik, [p, p2]), /collections\/all/);
});

test('dubbla produkter ger fel, tom lista ger fel', () => {
  const p = dummy();
  assert.throws(() => huvudmenyRader(rabutik(), [p, p]), /dubbla adresser/);
  assert.throws(() => huvudmenyRader(rabutik(), []), /inga produkter/);
});
