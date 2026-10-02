// Tester för geokoll.mjs — ren logik över Globalping-resultat, inget nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sprakFor, acceptLanguage, tolka, dom, sammaSprak } from '../geokoll.mjs';

const kropp = (lang, land, valuta, pris) => `<!doctype html><html class="js" lang="${lang}"><head><meta property="og:price:amount" content="${pris}"><script>Shopify.currency = {"active":"${valuta}","rate":"0.1"}; Shopify.country = "${land}";</script>`;

test('sprakFor: språkmappen först, annars domänens huvudspråk', () => {
  assert.equal(sprakFor('https://matstrumpor.com/de/products/sushi-strumpor'), 'de');
  assert.equal(sprakFor('https://matstrumpor.com/pt-pt/products/sushi-strumpor?country=PT'), 'pt-PT');
  assert.equal(sprakFor('https://matstrumpor.com/zh-tw/pages/spara'), 'zh-TW');
  assert.equal(sprakFor('https://matstrumpor.com/products/sushi-strumpor'), 'en');
  assert.equal(sprakFor('https://matstrumpor.no/products/sushi-strumpor?country=NO'), 'nb');
  assert.equal(sprakFor('https://matstrumpor.se/'), 'sv');
  // "products" är ingen språkmapp
  assert.equal(sprakFor('https://matstrumpor.se/products/x'), 'sv');
});

test('acceptLanguage: landets variant av språket, engelska sist', () => {
  assert.equal(acceptLanguage('de', 'AT'), 'de-AT,de;q=0.9,en;q=0.5');
  assert.equal(acceptLanguage('pt-PT', 'PT'), 'pt-PT,pt;q=0.9,en;q=0.5');
});

test('tolka: land och valuta ur sidhuvudet, kakorna som reserv, Location vid omdirigering', () => {
  const r = tolka({ statusCode: 200, headers: { 'set-cookie': ['localization=DE; path=/', 'cart_currency=EUR; path=/'] }, rawBody: kropp('de', 'DE', 'EUR', '39,90'), tls: { authorized: true, expiresAt: '2026-12-01T00:00:00.000Z', issuer: { O: "Let's Encrypt" } }, timings: { total: 412 } });
  assert.deepEqual([r.status, r.lang, r.land, r.valuta, r.pris, r.tls.ok, r.ms], [200, 'de', 'DE', 'EUR', '39,90', true, 412]);
  const k = tolka({ statusCode: 200, headers: { 'set-cookie': 'localization=NO; path=/' }, rawBody: '<html lang="nb">' });
  assert.equal(k.land, 'NO');
  const o = tolka({ statusCode: 302, headers: { location: 'https://matstrumpor.com/products/sushi-strumpor' }, rawBody: '' });
  assert.equal(o.location, 'https://matstrumpor.com/products/sushi-strumpor');
  assert.equal(o.lang, null);
});

test('dom: 302 till den engelska sidan är fel även när landet och valutan blir rätt (mätt 2026-10-01, DE-länken)', () => {
  const kampanj = { locale: 'de', geo: ['DE', 'AT', 'CH'] };
  const forsta = tolka({ statusCode: 302, headers: { location: 'https://matstrumpor.com/products/sushi-strumpor' } });
  const slut = tolka({ statusCode: 200, rawBody: kropp('en', 'DE', 'EUR', '39,90') });
  const d = dom({ forsta, slut }, kampanj);
  assert.equal(d.ok, false);
  assert.match(d.varfor, /302/);
  assert.match(d.varfor, /på en, annonsen på de/);
});

test('dom: en österrikare på ?country=DE räknas rätt, för landet ligger i kampanjens geo', () => {
  const r = tolka({ statusCode: 200, rawBody: kropp('de', 'DE', 'EUR', '39,90') });
  assert.deepEqual(dom({ forsta: r, slut: r }, { locale: 'de', geo: ['DE', 'AT', 'CH'] }), { ok: true, varfor: '' });
});

test('dom: landet utanför kampanjens geo är fel, 429 och tomt svar går inte att mäta', () => {
  const r = tolka({ statusCode: 200, rawBody: kropp('fr', 'CZ', 'CZK', '997,00') });
  assert.equal(dom({ forsta: r, slut: r }, { locale: 'fr', geo: ['FR', 'BE', 'LU'] }).ok, false);
  // Proben står i LU enligt Globalping men Shopify placerar den i CZ: ingen dom, bara en notering.
  const lu = { ...r, prob: { land: 'LU' } };
  const d = dom({ forsta: lu, slut: lu }, { locale: 'fr', geo: ['FR', 'BE', 'LU'] });
  assert.equal(d.ok, null);
  assert.match(d.varfor, /placerar proben i CZ/);
  assert.equal(dom({ forsta: tolka({ statusCode: 429 }) }, { locale: 'fr', geo: ['FR'] }).ok, null);
  assert.equal(dom({ forsta: null }, { locale: 'fr', geo: ['FR'] }).ok, null);
  const pt = tolka({ statusCode: 200, rawBody: kropp('pt-PT', 'PT', 'EUR', '39,90') });
  assert.equal(dom({ forsta: pt, slut: pt }, { locale: 'pt-PT', geo: ['PT'] }).ok, true);
});

test('sammaSprak: pt räcker för pt-PT, men nb är inte da', () => {
  assert.equal(sammaSprak('pt-PT', 'pt'), true);
  assert.equal(sammaSprak('pt-PT', 'pt-PT'), true);
  assert.equal(sammaSprak('zh-TW', 'zh-TW'), true);
  assert.equal(sammaSprak('nb', 'da'), false);
  assert.equal(sammaSprak(null, 'de'), false);
});
