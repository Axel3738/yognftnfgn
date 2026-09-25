// klaviyo/validera.mjs: varje spärr i kontraktet. Inget nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validera, kollaTaggar } from '../validera.mjs';
import { byggMejl } from '../mallar.mjs';
import { BRAND, PRODUKTER, RECENSIONER, KAMPANJ, FLODE, mejl } from './hjalp.mjs';

const kor = (m, extra = {}) => {
  const { html, text } = byggMejl(m, { brand: BRAND, produkter: PRODUKTER, recensioner: RECENSIONER, lage: 'klaviyo' });
  return validera(m, { html, text, produkter: PRODUKTER, brand: BRAND, lage: 'klaviyo', ...extra });
};
const harFel = (r, re) => r.fel.some((f) => re.test(f));

test('fixturerna är gröna', () => {
  assert.deepEqual(kor(KAMPANJ, { kalla: 'kampanj', segment: KAMPANJ.segment }).fel, []);
  for (const st of FLODE.steg.filter((s) => s.typ === 'mejl')) assert.deepEqual(kor(st.mejl, { kalla: 'flode', trigger: FLODE.trigger }).fel, []);
});

test('saknad avregistrering eller adress stoppar', () => {
  const m = mejl();
  const r1 = validera(m, { html: '<html>{{ organization.full_address }}</html>', produkter: PRODUKTER });
  assert.ok(harFel(r1, /unsubscribe/));
  const r2 = validera(m, { html: "<html>{% unsubscribe 'x' %}</html>", produkter: PRODUKTER });
  assert.ok(harFel(r2, /full_address/));
});

test('tankstreck stoppas i ämnesrad, förhandstext och block', () => {
  assert.ok(harFel(kor(mejl({ amnesrader: [{ text: 'Vinter — ute' }, { text: 'B' }, { text: 'C' }] })), /Tankstreck i ämnesrad A/));
  assert.ok(harFel(kor(mejl({ forhandstext: 'Leverans 5–10' })), /Tankstreck i förhandstext/));
  assert.ok(harFel(kor(mejl({ block: [{ typ: 'punkter', punkter: ['ett — två'] }] })), /Tankstreck i block 1/));
});

test('kronbelopp i copyn stoppas, priset ska komma ur produktblocken', () => {
  assert.ok(harFel(kor(mejl({ block: [{ typ: 'text', text: 'Bara 299 kr just nu' }] })), /Kronbelopp/));
  assert.ok(harFel(kor(mejl({ amnesrader: [{ text: 'Nu 1 299 kronor' }, { text: 'B' }, { text: 'C' }] })), /Kronbelopp/));
  assert.ok(harFel(kor(mejl({ forhandstext: 'Endast 199:-' })), /Kronbelopp/));
});

test('falsk brådska stoppas när urgency är ingen, men inte vid säsong', () => {
  const text = [{ typ: 'text', text: 'Sista chansen att fixa båten.' }];
  assert.ok(harFel(kor(mejl({ block: text })), /Falsk brådska/));
  assert.ok(harFel(kor(mejl({ block: [{ typ: 'text', text: 'Bara idag!' }] })), /Falsk brådska/));
  assert.ok(!harFel(kor(mejl({ block: text, taggar: { urgency: 'sasong' } })), /Falsk brådska/));
});

test('förbjudna löften, fel leveranstid och andra verksamheter stoppas', () => {
  assert.ok(harFel(kor(mejl({ block: [{ typ: 'text', text: '30 dagars öppet köp' }] })), /30 dagar/));
  assert.ok(harFel(kor(mejl({ block: [{ typ: 'text', text: 'Full garanti' }] })), /garanti/));
  assert.ok(harFel(kor(mejl({ block: [{ typ: 'text', text: 'Vi garanterar det' }] })), /garanterar/));
  assert.ok(harFel(kor(mejl({ block: [{ typ: 'text', text: 'Leverans 7-14 dagar' }] })), /7-14/));
  assert.ok(harFel(kor(mejl({ block: [{ typ: 'text', text: 'Från Grillkliniken' }] })), /Annan verksamhet/));
});

test('okänd handle stoppar', () => {
  assert.ok(harFel(kor(mejl({ block: [{ typ: 'produkt', handle: 'finns-inte' }] })), /"finns-inte" finns inte/));
  assert.ok(harFel(kor(mejl({ block: [{ typ: 'knapp', text: 'Köp', lank: 'produkt:saknas' }] })), /"saknas" finns inte/));
});

test('spara utan jämförpris över priset stoppar', () => {
  assert.ok(harFel(kor(mejl({ block: [{ typ: 'produkt', handle: 'spohallare-test', text: 'Du sparar massor.' }] })), /spara\/rea/));
  assert.ok(!harFel(kor(mejl({ block: [{ typ: 'produkt', handle: 'motorholje-test', text: 'Du sparar massor.' }] })), /spara\/rea/));
  assert.ok(!harFel(kor(mejl({ block: [{ typ: 'produkt', handle: 'spohallare-test', text: 'Spara tid på sjön.' }] })), /spara\/rea/));
});

test('memo, ämnesrader, förhandstext och tre-frågorstestet', () => {
  assert.ok(harFel(kor(mejl({ memo: '' })), /Memo saknas/));
  assert.ok(harFel(kor(mejl({ amnesrader: [{ text: 'A' }, { text: 'B' }] })), /minst 3/));
  assert.ok(harFel(kor(mejl({ amnesrader: [{ text: 'x'.repeat(71) }, { text: 'B' }, { text: 'C' }] })), /71 tecken, max 70/));
  assert.ok(kor(mejl({ amnesrader: [{ text: 'x'.repeat(55), begar: 'y' }, { text: 'B', begar: 'y' }, { text: 'C', begar: 'y' }] })).varningar.some((v) => /55 tecken/.test(v)));
  assert.ok(harFel(kor(mejl({ forhandstext: '  ' })), /Förhandstexten är tom/));
  assert.ok(harFel(kor(mejl({ tretest: [{ rad: 'rubrik', visualisera: true, falsifiera: false, ingen_annan: true }] })), /falsifiera/));
});

test('mallspråk i copyn och kvarlämnad platshållare stoppas', () => {
  assert.ok(harFel(kor(mejl({ block: [{ typ: 'text', text: 'Hej {{ person.email }}' }] })), /Mallspråk i copyn/));
  const r = validera(mejl(), { html: "<p>{{fornamn}}</p>{% unsubscribe %}{{ organization.full_address }}", produkter: PRODUKTER });
  assert.ok(harFel(r, /\{\{fornamn\}\} står kvar/));
});

test('obalanserade Django-taggar hittas', () => {
  assert.deepEqual(kollaTaggar('{% if a %}x{% endif %}{% for i in l %}{% endfor %}'), []);
  assert.ok(kollaTaggar('{% if a %}x').some((f) => /stängs aldrig/.test(f)));
  assert.ok(kollaTaggar('{% for i in l %}{% endif %}').length > 0);
  assert.ok(kollaTaggar('{% endfor %}').some((f) => /utan öppnande/.test(f)));
});

test('HTML över 100 kB stoppas', () => {
  const html = "{% unsubscribe %}{{ organization.full_address }}" + 'x'.repeat(101 * 1024);
  assert.ok(harFel(validera(mejl(), { html, produkter: PRODUKTER }), /Gmail klipper/));
});

test('dynamiska block stoppas i kampanjer', () => {
  assert.ok(harFel(kor(mejl({ block: [{ typ: 'dynamisk', kalla: 'checkout_rader' }] }), { kalla: 'kampanj', segment: ['SEG_samtycke'] }), /bara i metrikstyrda flöden/));
});

test('erbjudandet varnar utanför köparsegment och Placed Order-flöden', () => {
  const m = mejl({ block: [{ typ: 'erbjudande', text: 'Tack för sist.' }] });
  assert.ok(kor(m, { kalla: 'kampanj', segment: ['SEG_engagerade_60d'] }).varningar.some((v) => /bara köpare/.test(v)));
  assert.ok(!kor(m, { kalla: 'kampanj', segment: ['SEG_kopare_30d'] }).varningar.some((v) => /bara köpare/.test(v)));
  assert.ok(kor(m, { kalla: 'flode', trigger: FLODE.trigger }).varningar.some((v) => /Placed Order/.test(v)));
  assert.ok(!kor(m, { kalla: 'flode', trigger: { typ: 'metrik', metrik: ['Placed Order'] } }).varningar.some((v) => /Placed Order/.test(v)));
});

test('format "rentext": bara text, knapp (högst en), grundare, fakta, erbjudande', () => {
  const ok = mejl({ format: 'rentext', block: [{ typ: 'text', text: 'Hej {{fornamn}}.' }, { typ: 'knapp', text: 'Till butiken', lank: 'sida:/' }, { typ: 'grundare', text: 'Axel här.' }, { typ: 'fakta' }] });
  assert.deepEqual(kor(ok).fel.filter((f) => /rentext|knappar/i.test(f)), []);
  const hero = mejl({ format: 'rentext', block: [{ typ: 'hero', rubrik: 'X', text: 'Y' }, { typ: 'produktrad', handles: [] }] });
  const r = kor(hero);
  assert.ok(harFel(r, /Block 1 \(hero\) får inte stå i ett rentext-mejl/));
  assert.ok(harFel(r, /Block 2 \(produktrad\) får inte stå i ett rentext-mejl/));
  const tva = mejl({ format: 'rentext', block: [{ typ: 'knapp', text: 'A', lank: 'sida:/' }, { typ: 'knapp', text: 'B', lank: 'sida:/' }] });
  assert.ok(harFel(kor(tva), /2 knappar, högst en/));
  assert.ok(harFel(kor(mejl({ format: 'fetstil' })), /Okänt format/));
});
