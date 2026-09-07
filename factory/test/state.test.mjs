// Tester för körstatet. Skriver till en riktig fil under factory/state/
// (gitignorerad) och städar efter sig.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import {
  lasState,
  skrivState,
  arKlart,
  markeraKlart,
  rensaHemligheter,
  statefil,
} from '../state.mjs';

const BUTIK = 'teststate-butik';
const PRODUKT = 'teststate-produkt';
const stada = () => rmSync(statefil(BUTIK, PRODUKT), { force: true });

test('state börjar tomt och kommer tillbaka efter skrivning', () => {
  stada();
  const state = lasState(BUTIK, PRODUKT);
  assert.equal(arKlart(state, 'produkt'), false);

  markeraKlart(state, 'produkt', { handle: 'nackmagneten' });
  skrivState(state);

  const tillbaka = lasState(BUTIK, PRODUKT);
  assert.equal(arKlart(tillbaka, 'produkt'), true);
  assert.equal(tillbaka.steg.produkt.handle, 'nackmagneten');
  stada();
});

test('hemligheter når aldrig statefilen', () => {
  stada();
  const state = lasState(BUTIK, PRODUKT);
  markeraKlart(state, 'anslutning', {
    domain: 'x.myshopify.com',
    adminToken: 'shpat_hemligt',
    nested: { API_KEY: 'abc', ofarligt: 'kvar' },
  });
  skrivState(state);
  const rad = readFileSync(statefil(BUTIK, PRODUKT), 'utf8');
  assert.ok(!rad.includes('shpat_hemligt'));
  assert.ok(!rad.includes('abc'));
  assert.ok(rad.includes('kvar'));
  stada();
});

test('rensaHemligheter tar nycklar med token/secret/key/password', () => {
  const rent = rensaHemligheter({
    accessToken: 'a',
    clientSecret: 'b',
    apiKey: 'c',
    password: 'd',
    authorization: 'e',
    namn: 'kvar',
    lista: [{ token: 'f', id: 1 }],
  });
  assert.deepEqual(rent, { namn: 'kvar', lista: [{ id: 1 }] });
});

test('trasig statefil byggs om i stället för att krascha', () => {
  stada();
  const state = lasState(BUTIK, PRODUKT);
  skrivState(state);
  const fil = statefil(BUTIK, PRODUKT);
  assert.ok(existsSync(fil));
  writeFileSync(fil, '{trasig json');
  const om = lasState(BUTIK, PRODUKT);
  assert.deepEqual(om.steg, {});
  stada();
});
