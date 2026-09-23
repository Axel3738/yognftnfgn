// Tester för den dagliga tvistkollen. Rena funktioner: tvister in, larm ut.
// Nätet rörs aldrig — kollaBrand körs mot fixturen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dagarKvar, bradskande, narText, renderaLarm, kollaBrand, LARMGRANS_DAGAR, TVISTFONSTER_DAGAR } from '../tvistkoll.mjs';
import { brandUrEgenfil } from '../brands.mjs';
import { lasYaml } from '../../factory/yaml.mjs';

const NU = new Date('2026-09-14T12:00:00Z');
const FIXTUR = join(dirname(fileURLToPath(import.meta.url)), 'fixturer', 'demo');

const tvist = (extra = {}) => ({
  id: 1, orderId: 10, ordernamn: '#1010', typ: 'chargeback', orsak: 'product_not_received',
  status: 'needs_response', belopp: 899, valuta: 'SEK',
  initierad: new Date('2026-09-10T00:00:00Z'), evidensSenast: '2026-09-16', ...extra,
});

// ------------------------------------------------------------------ dagarKvar

test('dagarKvar räknar kalenderdagar och struntar i klockslaget', () => {
  assert.equal(dagarKvar('2026-09-16', NU), 2);
  assert.equal(dagarKvar('2026-09-14', NU), 0);
  assert.equal(dagarKvar('2026-09-12', NU), -2);
  // Samma svar oavsett var på dygnet körningen sker — annars hoppar "days left".
  assert.equal(dagarKvar('2026-09-16', new Date('2026-09-14T23:59:00Z')), 2);
  assert.equal(dagarKvar('2026-09-16', new Date('2026-09-14T00:01:00Z')), 2);
});

test('dagarKvar: ingen eller oläslig deadline ger null, aldrig 0', () => {
  assert.equal(dagarKvar(null, NU), null);
  assert.equal(dagarKvar('', NU), null);
  assert.equal(dagarKvar('inte ett datum', NU), null);
});

// ------------------------------------------------------------------ urvalet

test('bradskande tar bara tvister som väntar på vårt svar — avgjorda rör ingen längre', () => {
  const lista = [
    tvist({ id: 1, status: 'needs_response' }),
    tvist({ id: 2, status: 'under_review' }),
    tvist({ id: 3, status: 'won' }),
    tvist({ id: 4, status: 'lost' }),
    tvist({ id: 5, status: 'accepted' }),
    tvist({ id: 6, status: 'charge_refunded' }),
  ];
  assert.deepEqual(bradskande(lista, { nu: NU }).map((x) => x.id), [1]);
});

// Larmet 2026-09-23 sa "3 open disputes need evidence ... 1 already past the
// due date" om #5122, #4446 och #4407 — alla tre `under_review`, alltså redan
// besvarade och låsta av Shopify. En förfallen `under_review` är det värsta
// fallet: den läser som ett missat ärende och är i själva verket avklarat.
test('en under_review med passerad deadline larmas ALDRIG som försenad', () => {
  const lista = [
    tvist({ id: 'besvarad-sen', status: 'under_review', evidensSenast: '2026-09-10' }),
    tvist({ id: 'obesvarad-sen', status: 'needs_response', evidensSenast: '2026-09-10' }),
  ];
  assert.deepEqual(bradskande(lista, { nu: NU }).map((x) => x.id), ['obesvarad-sen']);
});

test('en under_review utan avläst deadline larmas inte heller', () => {
  const lista = [tvist({ id: 'x', status: 'under_review', evidensSenast: null })];
  assert.deepEqual(bradskande(lista, { nu: NU }), []);
});

test('bradskande larmar innanför gränsen men tiger utanför', () => {
  // Inquiries: en öppen chargeback larmas alltid (eget test nedan).
  const lista = [tvist({ id: 1, typ: 'inquiry', evidensSenast: '2026-09-17' }), tvist({ id: 2, typ: 'inquiry', evidensSenast: '2026-09-18' })];
  assert.deepEqual(bradskande(lista, { nu: NU, grans: 3 }).map((x) => x.id), [1]);
  assert.deepEqual(bradskande(lista, { nu: NU, grans: 4 }).map((x) => x.id), [1, 2]);
});

test('förfallen tvist larmas fortfarande — den är värst, inte passerad', () => {
  const r = bradskande([tvist({ evidensSenast: '2026-09-10' })], { nu: NU });
  assert.equal(r.length, 1);
  assert.equal(r[0].kvar, -4);
});

test('öppen tvist utan avläst deadline larmas — okänt rapporteras aldrig som noll', () => {
  const r = bradskande([tvist({ evidensSenast: null })], { nu: NU });
  assert.equal(r.length, 1);
  assert.equal(r[0].kvar, null);
});

test('ordningen: tidigast deadline först, sedan störst belopp', () => {
  const lista = [
    tvist({ id: 'sen', evidensSenast: '2026-09-16', belopp: 100 }),
    tvist({ id: 'idag-liten', evidensSenast: '2026-09-14', belopp: 100 }),
    tvist({ id: 'idag-stor', evidensSenast: '2026-09-14', belopp: 5000 }),
  ];
  assert.deepEqual(bradskande(lista, { nu: NU }).map((x) => x.id), ['idag-stor', 'idag-liten', 'sen']);
});

test('en öppen chargeback larmas alltid, även med 7 dagar kvar — en inquiry lika långt bort tiger', () => {
  // Mätt 2026-09-23: #4914 (chargeback, 7 dagar kvar) var osynlig i larmet.
  const lista = [tvist({ id: 'cb', typ: 'chargeback', evidensSenast: '2026-09-21' }), tvist({ id: 'inq', typ: 'inquiry', evidensSenast: '2026-09-21' })];
  assert.deepEqual(bradskande(lista, { nu: NU, grans: 3 }).map((x) => x.id), ['cb']);
  // En chargeback vars bevis redan är inne (under_review) larmas inte alls.
  assert.deepEqual(bradskande([tvist({ id: 'cb', evidensSenast: '2026-09-21', status: 'under_review' })], { nu: NU, grans: 3 }), []);
});

test('inquiries larmas också — en obesvarad förfrågan blir ofta en chargeback', () => {
  const r = bradskande([tvist({ typ: 'inquiry' })], { nu: NU });
  assert.equal(r.length, 1);
  assert.equal(r[0].typ, 'inquiry');
});

// ------------------------------------------------------------------ texten

test('narText skiljer förfallen, idag, imorgon och okänd', () => {
  assert.equal(narText(null), 'no deadline read');
  assert.equal(narText(0), 'due TODAY');
  assert.equal(narText(1), '1 day left');
  assert.equal(narText(3), '3 days left');
  assert.equal(narText(-1), '1 day OVERDUE');
  assert.equal(narText(-4), '4 days OVERDUE');
});

test('larmet är på engelska — VA:n läser det', () => {
  const text = renderaLarm(bradskande([tvist()], { nu: NU }), { brand: 'Bäverbutiken', nu: NU });
  // Brandnamnet får bära sina egna bokstäver; själva texten ska vara ren engelska.
  assert.ok(!/[åäöÅÄÖ]/.test(text.replace(/Bäverbutiken/g, '')), `svensk text i larmet:\n${text}`);
  assert.match(text, /Shopify admin → Settings → Payments → Disputes/);
});

test('larmet bär ordernummer, belopp, deadline och vad som ska göras', () => {
  const text = renderaLarm(bradskande([tvist()], { nu: NU }), { brand: 'Bäverbutiken', nu: NU });
  assert.match(text, /#1010/);
  assert.match(text, /899 SEK/);
  assert.match(text, /due 2026-09-16/);
  assert.match(text, /2 days left/);
  assert.match(text, /delivery scan/);
});

test('larmet blir rött och säger "past the due date" när något är förfallet', () => {
  const inq = (extra) => tvist({ typ: 'inquiry', ...extra });
  const gult = renderaLarm(bradskande([inq()], { nu: NU }), { brand: 'B', nu: NU });
  const rott = renderaLarm(bradskande([inq({ evidensSenast: '2026-09-11' })], { nu: NU }), { brand: 'B', nu: NU });
  assert.ok(gult.startsWith('🟡'), gult.slice(0, 20));
  assert.ok(rott.startsWith('🔴'), rott.slice(0, 20));
  assert.match(rott, /1 already past the due date/);
});

// ------------------------------------------------- chargeback före inquiry
// Mätt 2026-09-20 på Bäverbutikens 50 tvister: 29 av 29 avgjorda INQUIRIES
// vunna (100 %), chargebacks 1 av 4 — alla tre förluster någonsin var
// chargebacks. Larmet måste därför skilja på dem.

test('en chargeback gör larmet rött även med flera dagar kvar', () => {
  const cb = renderaLarm(bradskande([tvist({ typ: 'chargeback', evidensSenast: '2026-09-17' })], { nu: NU }), { brand: 'B', nu: NU });
  assert.ok(cb.startsWith('🔴'), cb.slice(0, 20));
  assert.match(cb, /1 real chargeback/);
  assert.match(cb, /🔴 CHARGEBACK/);
});

test('chargebacks sorteras före inquiries även när inquiryn förfaller tidigare', () => {
  const lista = [
    tvist({ id: 'inq-idag', typ: 'inquiry', evidensSenast: '2026-09-14' }),
    tvist({ id: 'cb-senare', typ: 'chargeback', evidensSenast: '2026-09-17' }),
  ];
  assert.deepEqual(bradskande(lista, { nu: NU }).map((x) => x.id), ['cb-senare', 'inq-idag']);
});

test('larmet påstår ALDRIG att en obesvarad tvist förloras automatiskt', () => {
  // Det stod så i larmet 2026-09-15..20 och är falskt för inquiries.
  const text = renderaLarm(bradskande([tvist({ typ: 'inquiry' })], { nu: NU }), { brand: 'B', nu: NU });
  assert.doesNotMatch(text, /lost automatically/i);
  assert.match(text, /can escalate into a chargeback/);
});

test('larmet säger åt VA:n att kolla trackingen först vid "not received"', () => {
  const text = renderaLarm(bradskande([tvist({ orsak: 'product_not_received' })], { nu: NU }), { brand: 'B', nu: NU });
  assert.match(text, /CHECK THE TRACKING FIRST/);
  assert.match(text, /Stuck or no scan → refund, do not fight/);
});

test('en tvist som förfaller IDAG kallas aldrig passerad — den går att vinna', () => {
  // NU är 2026-09-14; deadline samma dag = 0 dagar kvar, inte förfallen.
  const text = renderaLarm(bradskande([tvist({ evidensSenast: '2026-09-14' })], { nu: NU }), { brand: 'B', nu: NU });
  assert.ok(text.startsWith('🔴'), 'brådskan är verklig, rubriken ska vara röd');
  assert.match(text, /1 due today/);
  assert.doesNotMatch(text, /past the due date/);
  assert.match(text, /due TODAY/);
});

test('förfallen och förfaller-idag räknas var för sig i samma larm', () => {
  const text = renderaLarm(bradskande([
    tvist({ id: 1, evidensSenast: '2026-09-11' }),   // förfallen
    tvist({ id: 2, evidensSenast: '2026-09-14' }),   // idag
    tvist({ id: 3, evidensSenast: '2026-09-16' }),   // om 2 dagar
  ], { nu: NU }), { brand: 'B', nu: NU });
  assert.match(text, /1 already past the due date, 1 due today/);
});

test('larmet böjer sig rätt på en enda tvist', () => {
  const text = renderaLarm(bradskande([tvist()], { nu: NU }), { brand: 'B', nu: NU });
  assert.match(text, /1 open dispute needs evidence — every open chargeback, and inquiries due within 3 days/);
});

test('utan avläst deadline säger larmet det rakt ut', () => {
  const text = renderaLarm(bradskande([tvist({ evidensSenast: null })], { nu: NU }), { brand: 'B', nu: NU });
  assert.match(text, /due date unknown/);
  assert.match(text, /no deadline read/);
});

test('tvist utan ordernamn faller tillbaka på id, inte på tomt', () => {
  const text = renderaLarm(bradskande([tvist({ ordernamn: null, orderId: 77 })], { nu: NU }), { brand: 'B', nu: NU });
  assert.match(text, /order 77/);
});

// ------------------------------------------------------------------ ett brand

test('kollaBrand mot fixturen: läser tvisten och larmar innanför gränsen', async () => {
  const brand = brandUrEgenfil(lasYaml(readFileSync(join(FIXTUR, 'demobutiken', 'brand.yaml'), 'utf8')), 'demobutiken');
  // Fixturens tvist har deadline 2026-09-20.
  const nara = await kollaBrand(brand, { nu: new Date('2026-09-18T12:00:00Z'), fixtur: FIXTUR });
  assert.equal(nara.tillganglig, true);
  assert.equal(nara.lista.length, 1);
  assert.equal(nara.bradskande.length, 1);

  // Fixturens tvist är en öppen CHARGEBACK — den larmas alltid, även 19 dagar bort.
  const langt = await kollaBrand(brand, { nu: new Date('2026-09-01T12:00:00Z'), fixtur: FIXTUR });
  assert.equal(langt.tillganglig, true);
  assert.equal(langt.bradskande.length, 1, 'en öppen chargeback larmas oavsett dagar kvar');
  assert.equal(langt.bradskande[0].kvar, 19);
});

test('brand utan Shopify: tvisterna är OKÄNDA med orsak, inte noll', async () => {
  const brand = brandUrEgenfil({ brand: 'Utan', id: 'utan' }, 'utan');
  const r = await kollaBrand(brand, { nu: NU, env: {} });
  assert.equal(r.tillganglig, false);
  assert.equal(r.bradskande.length, 0);
  assert.match(r.orsak, /Shopify inte kopplat/);
});

// ------------------------------------------------------------------ konstanter

test('fönstret bakåt är mycket bredare än larmgränsen', () => {
  // En tvist som startade för två månader sedan kan ha deadline i morgon.
  assert.ok(TVISTFONSTER_DAGAR >= 90, `fönstret ${TVISTFONSTER_DAGAR} dagar är för kort`);
  assert.equal(LARMGRANS_DAGAR, 3);
});
