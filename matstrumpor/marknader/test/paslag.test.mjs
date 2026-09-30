// Tester för paslag.mjs — utan nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { snyggtPris, nyttPris, paslagFor, sattFastPris } from '../paslag.mjs';

const ROT = dirname(dirname(fileURLToPath(import.meta.url)));

test('snyggt pris: kronor på 9, euro och dollar på ,90, yen på 80, Taiwan-dollar på 90 — alltid uppåt', () => {
  assert.equal(snyggtPris(459.4, 'NOK'), 469);
  assert.equal(snyggtPris(469, 'NOK'), 469, 'ett snyggt pris står kvar');
  assert.equal(snyggtPris(57.6, 'NOK'), 59);
  assert.equal(snyggtPris(344.2, 'DKK'), 349);
  assert.equal(snyggtPris(31.64, 'EUR'), 31.9);
  assert.equal(snyggtPris(39.05, 'EUR'), 39.9);
  assert.equal(snyggtPris(5.29, 'EUR'), 5.9);
  assert.equal(snyggtPris(31.95, 'EUR'), 32.9, 'strax över ,90 går till nästa hela');
  assert.equal(snyggtPris(47.9, 'USD'), 47.9);
  assert.equal(snyggtPris(7124, 'JPY'), 7180);
  assert.equal(snyggtPris(7980, 'JPY'), 7980);
  assert.equal(snyggtPris(1622, 'TWD'), 1690);
});

test('nytt pris: höjs till golvet bara om det ligger under, sänks aldrig', () => {
  const kurs = 0.96028; // 1 SEK i NOK, 2026-09-30
  const upp = nyttPris({ sek: 399, nu: 449, kurs, valuta: 'NOK', paslag: 0.2 });
  assert.deepEqual([upp.pris, upp.andrat], [469, true]);
  assert.ok(paslagFor(upp.pris, 399, kurs) >= 20);
  const usa = nyttPris({ sek: 399, nu: 69, kurs: 0.100067, valuta: 'USD', paslag: 0.2 });
  assert.deepEqual([usa.pris, usa.andrat], [69, false], '$69 ligger på +73 % och rörs inte');
  const eur = nyttPris({ sek: 399, nu: 44.9, kurs: 0.088236, valuta: 'EUR', paslag: 0.2 });
  assert.equal(eur.andrat, false, '44,90 € ligger redan på +27 %');
});

test('fasta priser: skrivs per variant eller som tal, strukturen i konfigen behålls', () => {
  const fasta = { 'sushi-strumpor': { '5 - Par / One Size': 449, '3 - Par / One Size': 349 }, 'donut-strumpor': 299 };
  sattFastPris(fasta, 'sushi-strumpor', '3 - Par / One Size', 429);
  sattFastPris(fasta, 'donut-strumpor', 'One Size', 349);
  assert.deepEqual(fasta, { 'sushi-strumpor': { '5 - Par / One Size': 449, '3 - Par / One Size': 429 }, 'donut-strumpor': 349 });
});

test('konfigen bär golvet, och varje utlandsmarknad har fasta priser', () => {
  const k = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
  assert.equal(k.paslag_min, 0.2);
  for (const m of k.marknader) assert.ok(m.fasta_priser, `${m.namn} saknar fasta_priser`);
});
