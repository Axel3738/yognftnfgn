// Tester för tvistdomen. Rena funktioner, inget nät.
// Fallen är Bäverbutikens VERKLIGA tvister avlästa 2026-09-20 — ändrar någon
// logiken så att ett av dem byter beslut ska ett test gå sönder.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dom, dagarKvar, arChargeback, rendera } from '../tvistfakta.mjs';

const NU = new Date('2026-09-20T12:00:00Z');
const order = (p = {}) => ({
  namn: '#0000', skapad: '2026-08-01T00:00:00Z', betald: 'paid', fulfillment: 'fulfilled',
  total: 348, valuta: 'SEK', land: 'SE', stad: 'Test', adressmatch: true,
  produkter: [{ titel: 'Testprodukt', antal: 1 }], aterbetalningar: [], ...p,
});
const levererad = (datum = '2026-09-10T00:00:00Z') => ({ nummer: 'YT123', bolag: 'YunExpress', huvudstatus: 'Delivered', levereratDatum: datum, sistaHandelse: datum });
const fast = () => ({ nummer: 'YT123', bolag: 'YunExpress', huvudstatus: 'InfoReceived', levereratDatum: null, sistaHandelse: '2026-08-20T00:00:00Z' });
const utanNummer = () => ({ nummer: null, bolag: null, huvudstatus: null, levereratDatum: null });
const tvist = (p = {}) => ({ typ: 'inquiry', orsak: 'product_not_received', status: 'needs_response', belopp: 348, valuta: 'SEK', evidensSenast: '2026-09-28', ...p });

// --------------------------------------------------- product_not_received

test('not received + leveransskanning → FIGHT, starkt (#5418, #5053, #5289)', () => {
  const d = dom({ tvist: tvist(), order: order(), sparning: levererad('2026-09-11T00:00:00Z'), nu: NU });
  assert.equal(d.beslut, 'FIGHT');
  assert.equal(d.styrka, 'strong');
  assert.ok(d.bevis.some((b) => /Delivery scan/.test(b)), 'leveransskanningen ska ligga först i bevispaketet');
  assert.ok(d.varfor.some((v) => /DELIVERED on 2026-09-11/.test(v)));
});

test('not received + paketet står stilla → REFUND, slåss aldrig (#5584)', () => {
  const d = dom({ tvist: tvist({ typ: 'chargeback' }), order: order(), sparning: fast(), nu: NU });
  assert.equal(d.beslut, 'REFUND');
  assert.equal(d.styrka, 'lost');
  assert.ok(d.varfor.some((v) => /NOT delivered/.test(v)));
  assert.ok(/cheaper than losing later/.test(d.risk));
});

test('inget spårnummer alls → ESCALATE, inte FIGHT', () => {
  const d = dom({ tvist: tvist(), order: order(), sparning: utanNummer(), nu: NU });
  assert.equal(d.beslut, 'ESCALATE');
  assert.match(d.risk, /Fulfilment is broken/);
});

// --------------------------------------------------- credit_not_processed

test('credit not processed + återbetalning finns → FIGHT med kvittot', () => {
  const d = dom({
    tvist: tvist({ orsak: 'credit_not_processed' }),
    order: order({ aterbetalningar: [{ belopp: 348, skapad: '2026-09-01' }] }),
    sparning: levererad(), nu: NU,
  });
  assert.equal(d.beslut, 'FIGHT');
  assert.equal(d.styrka, 'strong');
  assert.ok(d.bevis.some((b) => /Refund receipt: 348/.test(b)));
});

test('credit not processed + INGEN återbetalning + levererad → FIGHT (#4446, 1262 kr)', () => {
  const d = dom({
    tvist: tvist({ orsak: 'credit_not_processed', belopp: 1262.2 }),
    order: order({ total: 1262.2 }), sparning: levererad('2026-08-13T00:00:00Z'), nu: NU,
  });
  assert.equal(d.beslut, 'FIGHT');
  assert.equal(d.styrka, 'strong');
  assert.ok(d.varfor.some((v) => /No refund was ever promised or issued/.test(v)));
  // Den enda vägen att förlora: support lovade något i ett mejl ingen läst.
  assert.match(d.risk, /Search the inbox for the order number first/);
});

test('credit not processed + ingen återbetalning + ej levererad → REFUND', () => {
  const d = dom({ tvist: tvist({ orsak: 'credit_not_processed' }), order: order(), sparning: fast(), nu: NU });
  assert.equal(d.beslut, 'REFUND');
});

test('DELVIS återbetalning flaggas som risk — kunden kan bestrida resten', () => {
  const d = dom({
    tvist: tvist({ orsak: 'credit_not_processed' }),
    order: order({ total: 909, aterbetalningar: [{ belopp: 100, skapad: '2026-09-19' }] }),
    sparning: levererad(), nu: NU,
  });
  assert.equal(d.beslut, 'FIGHT');
  assert.match(d.risk, /PARTIAL/);
});

// --------------------------------------------------- product_unacceptable

test('unacceptable + levererad → FIGHT men bara medium, och risken sägs rakt ut', () => {
  const d = dom({ tvist: tvist({ orsak: 'product_unacceptable' }), order: order(), sparning: levererad(), nu: NU });
  assert.equal(d.beslut, 'FIGHT');
  assert.equal(d.styrka, 'medium');
  assert.match(d.risk, /we deserve to lose/);
  assert.ok(d.bevis.some((b) => /product page as it looked at purchase/.test(b)));
});

test('unacceptable + redan helt återbetald → FIGHT, inget kvar att kräva', () => {
  const d = dom({
    tvist: tvist({ orsak: 'product_unacceptable' }),
    order: order({ total: 348, aterbetalningar: [{ belopp: 348, skapad: '2026-09-05' }] }),
    sparning: levererad(), nu: NU,
  });
  assert.equal(d.beslut, 'FIGHT');
  assert.equal(d.styrka, 'strong');
});

// --------------------------------------------------- fraud / unrecognized

test('fraud + adressen matchar → FIGHT', () => {
  const d = dom({ tvist: tvist({ orsak: 'fraudulent' }), order: order({ adressmatch: true }), sparning: levererad(), nu: NU });
  assert.equal(d.beslut, 'FIGHT');
  assert.equal(d.styrka, 'strong');
});

test('fraud + adressen matchar INTE → REFUND och blockera, slåss aldrig', () => {
  const d = dom({ tvist: tvist({ orsak: 'fraudulent' }), order: order({ adressmatch: false }), sparning: levererad(), nu: NU });
  assert.equal(d.beslut, 'REFUND');
  assert.match(d.risk, /block the customer/);
});

// --------------------------------------------------- chargeback-påslaget

test('en chargeback vi slåss om får en extra varning om att förlusten är slutgiltig', () => {
  const inq = dom({ tvist: tvist({ typ: 'inquiry' }), order: order(), sparning: levererad(), nu: NU });
  const cb = dom({ tvist: tvist({ typ: 'chargeback' }), order: order(), sparning: levererad(), nu: NU });
  assert.doesNotMatch(inq.risk, /real CHARGEBACK/);
  assert.match(cb.risk, /real CHARGEBACK/);
  assert.equal(arChargeback({ typ: 'chargeback' }), true);
  assert.equal(arChargeback({ typ: 'inquiry' }), false);
});

test('duplicate går alltid till människa', () => {
  const d = dom({ tvist: tvist({ orsak: 'duplicate' }), order: order(), sparning: levererad(), nu: NU });
  assert.equal(d.beslut, 'ESCALATE');
});

test('okänd orsak faller tillbaka utan att hitta på något', () => {
  const d = dom({ tvist: tvist({ orsak: 'nagot_nytt_2027' }), order: order(), sparning: levererad(), nu: NU });
  assert.equal(d.beslut, 'FIGHT');
  assert.ok(d.varfor.some((v) => /no specific playbook/.test(v)));
});

// --------------------------------------------------- deadline + utskrift

test('dagarKvar: idag är 0, passerad är negativ', () => {
  assert.equal(dagarKvar('2026-09-20', NU), 0);
  assert.equal(dagarKvar('2026-09-23', NU), 3);
  assert.equal(dagarKvar('2026-09-17', NU), -3);
  assert.equal(dagarKvar(null, NU), null);
});

test('utskriften är engelsk, bär beslutet först och pekar på SOP:en', () => {
  const t = tvist({ typ: 'chargeback', orsak: 'credit_not_processed', evidensSenast: '2026-09-23', belopp: 348 });
  const text = rendera({ tvist: t, order: order({ namn: '#5584' }), sparning: fast(), domen: dom({ tvist: t, order: order(), sparning: fast(), nu: NU }), nu: NU });
  assert.match(text, /🔴 CHARGEBACK — order #5584/);
  assert.match(text, /DECISION: REFUND/);
  assert.match(text, /3 day\(s\) left/);
  assert.match(text, /kundtjanst\/sop\/00-MASTER\.md/);
  assert.ok(!/[åäöÅÄÖ]/.test(text), `svensk text i VA-utskriften:\n${text}`);
});
