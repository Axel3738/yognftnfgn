// Tester för kundvy.mjs lasSida — ren logik över HTML, inget nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lasSida, MARKORER_SV } from '../kundvy.mjs';

const huvud = (lang, land, valuta) => `<html lang="${lang}"><head><script>Shopify.country = "${land}"; Shopify.currency = {"active":"${valuta}","rate":"1.0"}; Shopify.locale = "${lang}";</script></head><body>`;

test('vanlig sida: svensk löptext på ett annat språk är en läcka, egennamn i URL:er är det inte', () => {
  const html = `${huvud('nb', 'NO', 'NOK')}<a href="/products/sushi-strumpor">Sushi-sokker</a><span class="price-item price-item--regular"> 391,00 kr </span><p>Spåra paket</p></body></html>`;
  const r = lasSida(html, { sprak: 'nb', land: 'NO' });
  assert.equal(r.lang, 'nb');
  assert.equal(r.country, 'NO');
  assert.equal(r.active, 'NOK');
  assert.equal(r.pris, '391,00 kr');
  assert.deepEqual(r.lackor, ['Spåra paket']);
  assert.ok(MARKORER_SV.includes('Spåra paket'));
});

test('spårningssidan: svenskan i källkoden räknas inte — språkpaketet avgör', () => {
  const med = `${huvud('nb', 'NO', 'NOK')}<div id="bb-spar"><h1>Spåra paket</h1></div><script id="bb-spar-copy" type="application/json">{"rubrik":"Spåra paket","sprak":{"nb":{"tz":"Europe/Oslo","rubrik":"Spor pakken"},"en":{"tz":"auto"}}}</script></body></html>`;
  assert.deepEqual(lasSida(med, { sprak: 'nb', land: 'NO' }).lackor, []);
  assert.deepEqual(lasSida(med, { sprak: 'en', land: 'US' }).lackor, []);
  const utanFi = lasSida(med, { sprak: 'fi', land: 'FI' }).lackor;
  assert.equal(utanFi.length, 1);
  assert.match(utanFi[0], /saknar språkpaket fi/);
  const bara = `${huvud('da', 'DK', 'DKK')}<div id="bb-spar"><h1>Spåra paket</h1></div><script id="bb-spar-copy" type="application/json">{"rubrik":"Spåra paket"}</script></body></html>`;
  assert.match(lasSida(bara, { sprak: 'da', land: 'DK' }).lackor[0], /saknar språkpaket da/);
});

test('svenska vyn har aldrig läckor', () => {
  const html = `${huvud('sv', 'SE', 'SEK')}<p>Spåra paket · Köp 1 – Få 1 GRATIS</p></body></html>`;
  const r = lasSida(html, { sprak: 'sv', land: 'SE' });
  assert.deepEqual(r.lackor, []);
  assert.equal(r.paket, 'Köp 1 – Få 1 GRATIS');
});
