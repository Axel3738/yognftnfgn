// klaviyo/samtyckesruta.mjs: kassans samtyckestext per språk — reglerna för
// raden, locale-filen och planen, allt utan nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kontrolleraRad, samtyckeVarden, nyLocaleFil, planeraByten, NYCKEL } from '../samtyckesruta.mjs';

const KOMMENTAR = '/*\n * IMPORTANT: The contents of this file are auto-generated.\n */\n';
const LOCALE = `${KOMMENTAR}{
  "general": { "password_page": { "login_form_heading": "Gå in i butiken med lösenord:" } },
  "newsletter": {
    "label": "E-post",
    "button_label": "Prenumerera"
  }
}
`;
const LOKALER = [
  { locale: 'sv', primary: true, published: true },
  { locale: 'nb', primary: false, published: true },
  { locale: 'da', primary: false, published: true },
  { locale: 'fi', primary: false, published: true },
  { locale: 'de', primary: false, published: false },
];

test('kontrolleraRad: tom, tankstreck, siffror, saknat mejl- eller erbjudandeord stoppar; en rätt rad går igenom', () => {
  assert.deepEqual(kontrolleraRad('sv', ''), ['sv: tom']);
  assert.ok(kontrolleraRad('sv', 'Ja, mejla mig erbjudanden — och tips').some((f) => /tankstreck/.test(f)));
  assert.ok(kontrolleraRad('sv', 'Ja, mejla mig 3 erbjudanden').some((f) => /siffror/.test(f)));
  assert.ok(kontrolleraRad('sv', 'Ja, skicka mig erbjudanden').some((f) => /mejl/.test(f)));
  assert.ok(kontrolleraRad('sv', 'Ja, mejla mig tipsen om taket').some((f) => /erbjudanden/.test(f)));
  assert.ok(kontrolleraRad('sv', 'x'.repeat(101) + ' mejl erbjudanden').some((f) => /tecken/.test(f)));
  assert.deepEqual(kontrolleraRad('sv', 'Ja, mejla mig tipsen om överdraget i blåst och erbjudandena.'), []);
  assert.deepEqual(kontrolleraRad('da', 'Ja, send mig mails med tips om betrækket og tilbud.'), []);
  assert.deepEqual(kontrolleraRad('en', 'Yes, email me the tips on keeping the cover on in wind, and offers.'), []);
});

test('samtyckeVarden: saknat block stoppar, kommentarsnycklar hoppas, texten trimmas, ett fel i en rad stoppar allt', () => {
  assert.throws(() => samtyckeVarden({}), /saknar samtycke_kassan/);
  assert.throws(() => samtyckeVarden({ samtycke_kassan: { comment: 'bara kommentar' } }), /saknar samtycke_kassan/);
  const ok = samtyckeVarden({ samtycke_kassan: { comment: 'x', sv_comment: 'y', sv: '  Ja, mejla mig erbjudanden och tipsen. ', nb: 'Ja, send meg tilbud og tips på e-post.' } });
  assert.deepEqual(ok, { sv: 'Ja, mejla mig erbjudanden och tipsen.', nb: 'Ja, send meg tilbud og tips på e-post.' });
  assert.throws(() => samtyckeVarden({ samtycke_kassan: { sv: 'Ja, mejla mig erbjudanden.', nb: 'Ja, send meg tips.' } }), /nb: ordet erbjudanden/);
});

test('nyLocaleFil: nyckeln läggs till under shopify → checkout → marketing, resten av filen står kvar, kommentaren släpps', () => {
  const r = nyLocaleFil(LOCALE, NYCKEL, 'Ja, mejla mig erbjudanden.');
  assert.equal(r.gammal, null);
  assert.ok(!r.text.startsWith('/*'), 'Shopifys kommentar skrivs av Shopify själv');
  const obj = JSON.parse(r.text);
  assert.equal(obj.shopify.checkout.marketing.accept_marketing_checkbox_label, 'Ja, mejla mig erbjudanden.');
  assert.deepEqual(obj.newsletter, { label: 'E-post', button_label: 'Prenumerera' });
  assert.equal(obj.general.password_page.login_form_heading, 'Gå in i butiken med lösenord:');
  const igen = nyLocaleFil(r.text, NYCKEL, 'Ja, mejla mig erbjudanden.');
  assert.equal(igen.gammal, 'Ja, mejla mig erbjudanden.', 'andra varvet ser det gamla värdet');
  assert.equal(igen.text, r.text, 'idempotent');
});

test('nyLocaleFil: trasig JSON och en nyckel som inte är ett objekt stoppar utan att skriva', () => {
  assert.throws(() => nyLocaleFil('{ "a": ', NYCKEL, 'x'), /inte JSON/);
  assert.throws(() => nyLocaleFil('{ "shopify": "text" }', NYCKEL, 'x'), /"shopify" i locale-filen är inte ett objekt/);
  assert.throws(() => nyLocaleFil('[]', NYCKEL, 'x'), /inte ett JSON-objekt/);
});

test('planeraByten: huvudspråket via temafilen, andra via översättning, opublicerat hoppas, språk utan text behåller standarden', () => {
  const varden = { sv: 'Ja, mejla mig erbjudanden.', nb: 'Ja, send meg tilbud på e-post.', da: 'Ja, send mig mails med tilbud.', de: 'Ja, E-Mail mit Angeboten.' };
  const plan = planeraByten({ varden, lokaler: LOKALER, huvudsprakVarde: 'Skicka mig nyheter och erbjudanden via e-post', oversattningar: { nb: 'Send meg nyheter og tilbud på e-post', da: 'Ja, send mig mails med tilbud.', fi: 'Lähetä minulle uutisia' } });
  assert.equal(plan.primar, 'sv');
  const per = Object.fromEntries(plan.rader.map((r) => [r.sprak, r]));
  assert.equal(per.sv.typ, 'huvudsprak'); assert.equal(per.sv.andras, true); assert.equal(per.sv.fore, 'Skicka mig nyheter och erbjudanden via e-post');
  assert.equal(per.nb.typ, 'oversattning'); assert.equal(per.nb.andras, true);
  assert.equal(per.da.typ, 'oversattning'); assert.equal(per.da.andras, false, 'står redan rätt');
  assert.equal(per.de.typ, 'ej_publicerad'); assert.equal(per.de.andras, false);
  assert.equal(per.fi.typ, 'utan_text'); assert.equal(per.fi.fore, 'Lähetä minulle uutisia'); assert.equal(per.fi.andras, false);
});
