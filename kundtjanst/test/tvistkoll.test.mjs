// Tester för den dagliga tvistkollen. Rena funktioner: tvister in, larm ut.
// Nätet rörs aldrig — kollaBrand körs mot fixturen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dagarKvar, timmarKvar, klockslag, obesvarad, bradskande, narText, renderaLarm, kollaBrand, LARMGRANS_DAGAR, TVISTFONSTER_DAGAR } from '../tvistkoll.mjs';
import { normaliseraTvist } from '../shopify.mjs';
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
// due date" om #5122, #4446 och #4407 — alla tre `under_review`. En förfallen
// `under_review` som ÄR besvarad läser som ett missat ärende och är avklarad.
// ⚠️ De två testerna här nedanför saknar `bevisSkickat` med flit: så ser gammal
// data ut (fältet lästes inte före 2026-09-28), och då ska domen falla tillbaka
// på statusen precis som förut. Att statusen ensam INTE räcker för färsk data
// bevisas av "en under_review som ingen svarat på" längre ner.
test('en under_review utan avläst bevisfält larmas inte som försenad', () => {
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

// Larmet 2026-09-24 listade tre chargebacks med 6, 9 och 11 dagar kvar och sa
// samtidigt "Everything on this list is inside the submit window — do not wait
// any longer" och "anything it lists is ≤ 3 days out and must be decided now".
// Båda blev falska i samma stund som öppna chargebacks började larmas oavsett
// deadline. Ett larm som säger emot sina egna rader slutar läsas.
test('tidsstrategin ljuger inte om en chargeback med veckor kvar', () => {
  const text = renderaLarm(bradskande([tvist({ evidensSenast: '2026-10-05' })], { nu: NU }), { brand: 'B', nu: NU });
  assert.match(text, /21 days left/, 'raden ska bära sitt riktiga antal dagar');
  assert.doesNotMatch(text, /do not wait any longer/i);
  assert.doesNotMatch(text, /Everything on this list is inside the submit window/i);
  // Den kvarvarande ≤-meningen får bara gälla inquiries, aldrig "anything it lists".
  assert.doesNotMatch(text, /anything\s+it lists is/i);
  assert.match(text, /An inquiry on this list is ≤ 3 days out/);
  assert.match(text, /A chargeback is\s+listed from the day it opens/);
});

// --------------------------------------------------- deadline är en TIDPUNKT
// #5053 (2026-09-28): `evidence_due_by` var `2026-09-28T01:00:00+02:00` — alltså
// klockan ett på natten. Larmet skrev "due 2026-09-28 — 1 day left" på
// söndagsmorgonen, beslutsbladet sa "skicka in på måndagen", och beviset gick
// in 07:10 på måndagen: sex timmar efter att tiden gått ut. Ingen hade fel om
// datumet. Alla läste ett datum där det stod en tidpunkt.

test('deadlinens klockslag följer med ur Shopify', () => {
  const t = normaliseraTvist({
    id: 17773822301, order_id: 1, type: 'inquiry', reason: 'product_not_received',
    status: 'under_review', amount: '348.00', currency: 'SEK',
    evidence_due_by: '2026-09-28T01:00:00+02:00', evidence_sent_on: '2026-09-28T07:10:14+02:00',
  });
  assert.equal(t.evidensSenast, '2026-09-28', 'datumsträngen finns kvar som förut');
  assert.equal(t.evidensSenastTid, '2026-09-28T01:00:00+02:00');
  assert.equal(t.bevisSkickat, '2026-09-28T07:10:14+02:00');
});

test('timmarKvar räknar på tidpunkten, inte på dygnet', () => {
  // Söndag 05:40 CEST, samma minut som rutinen fyrade.
  const nu = new Date('2026-09-27T03:40:00Z');
  const h = timmarKvar('2026-09-28T01:00:00+02:00', nu);
  assert.ok(h > 19 && h < 20, `19-20 timmar kvar, inte ett dygn — fick ${h}`);
  assert.equal(dagarKvar('2026-09-28', nu), 1, 'dygnsräkningen säger fortfarande 1');
  assert.equal(timmarKvar(null, nu), null);
});

test('midnatt får inget klockslag, allt annat får det', () => {
  assert.equal(klockslag('2026-09-28T00:00:00+02:00'), null);
  assert.equal(klockslag('2026-09-28T01:00:00+02:00'), '01:00');
  assert.equal(klockslag(null), null);
});

test('larmet skriver timmar och klockslag när deadline är inom ett dygn', () => {
  const nu = new Date('2026-09-27T03:40:00Z');
  const rad = tvist({
    typ: 'inquiry', ordernamn: '#5053', belopp: 348,
    evidensSenast: '2026-09-28', evidensSenastTid: '2026-09-28T01:00:00+02:00',
  });
  const text = renderaLarm(bradskande([rad], { nu }), { brand: 'B', nu });
  assert.match(text, /due 2026-09-28 at 01:00/, 'klockslaget måste stå i raden');
  assert.match(text, /19h left/, 'timmarna, inte "1 day left"');
  assert.doesNotMatch(text, /1 day left/);
});

test('en passerad tidpunkt samma dygn skrivs som timmar försenad', () => {
  // Måndag 07:41 CEST — då beviset faktiskt gick in.
  const nu = new Date('2026-09-28T05:41:00Z');
  assert.equal(narText(0, timmarKvar('2026-09-28T01:00:00+02:00', nu)), '6h OVERDUE');
});

test('utan tidpunkt beter sig larmet precis som förut', () => {
  assert.equal(narText(3, null), '3 days left');
  assert.equal(narText(0, null), 'due TODAY');
  assert.equal(narText(-2, null), '2 days OVERDUE');
  assert.equal(narText(null, null), 'no deadline read');
  const text = renderaLarm(bradskande([tvist({ evidensSenast: '2026-10-05' })], { nu: NU }), { brand: 'B', nu: NU });
  assert.match(text, /due 2026-10-05 —/, 'inget påhittat klockslag när tidpunkten saknas');
});

test('larmet säger aldrig "submit on the due date"', () => {
  // Deadline står på 01:00 i det här kontot, så "skicka in på förfallodagen"
  // är samma sak som att skicka in sex timmar för sent (#5053, 2026-09-28).
  const text = renderaLarm(bradskande([tvist()], { nu: NU }), { brand: 'B', nu: NU });
  assert.doesNotMatch(text, /Submit\* on the due date/i);
  assert.doesNotMatch(text, /^4\. Submit before the due date/m);
  assert.match(text, /01:00 in the night/);
  assert.match(text, /day BEFORE the due date/);
});

// ------------------------------------- bevisfältet, inte statusen, avgör
// Tvist 17751572829 (order 17584203399517, 508,99 kr, `general`) stod
// `inquiry` / `under_review` med deadline 2026-09-26 och `evidence_sent_on:
// null` — ingen hade svarat. Statusfiltret höll den utanför larmet i flera
// dygn, och 2026-09-29 var den en chargeback med deadline 2026-10-10. Pengarna
// är tagna. Statusen sa "någon har svarat"; bevisfältet sa sanningen.

test('en under_review som ingen svarat på larmas — det är den som blir en chargeback', () => {
  const lista = [
    tvist({ id: 'ingen-svarade', status: 'under_review', bevisSkickat: null, evidensSenast: '2026-09-16' }),
    tvist({ id: 'besvarad', status: 'under_review', bevisSkickat: '2026-09-15T07:10:14+02:00', evidensSenast: '2026-09-16' }),
  ];
  assert.deepEqual(bradskande(lista, { nu: NU }).map((x) => x.id), ['ingen-svarade']);
});

test('ett inskickat bevis tystar tvisten även när statusen står kvar på needs_response', () => {
  // Skickat men Shopify har inte hunnit flytta statusen: VA:n ska inte göra om det.
  const lista = [tvist({ id: 'klar', status: 'needs_response', bevisSkickat: '2026-09-13T09:00:00+02:00' })];
  assert.deepEqual(bradskande(lista, { nu: NU }), []);
});

test('obesvarad följer bevisfältet, med statusen som reserv för gammal data', () => {
  assert.equal(obesvarad({ status: 'needs_response', bevisSkickat: null }), true);
  assert.equal(obesvarad({ status: 'under_review', bevisSkickat: null }), true);
  assert.equal(obesvarad({ status: 'under_review', bevisSkickat: '2026-09-28T07:10:14+02:00' }), false);
  assert.equal(obesvarad({ status: 'won', bevisSkickat: null }), false, 'avgjord är avgjord');
  assert.equal(obesvarad({ status: 'lost', bevisSkickat: null }), false);
  // Gammal data utan fältet: statusen får avgöra, som före 2026-09-29.
  assert.equal(obesvarad({ status: 'under_review' }), false);
  assert.equal(obesvarad({ status: 'needs_response' }), true);
});
