import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  kategorisera,
  hotniva,
  hittaOrdernummer,
  toppArenden,
  normalisera,
} from '../kategorisering.mjs';

test('normalisera drar ihop blanksteg och sänker versaler', () => {
  assert.equal(normalisera('  VAR   är\nMIN order '), 'var är min order');
});

test('kategoriserar "var är min order" som leveransärende', () => {
  const k = kategorisera({ amne: 'Var är min order?', text: 'Beställde för 3 veckor sedan.' });
  assert.equal(k.id, 'leverans');
});

test('kategoriserar utan svenska tecken också', () => {
  const k = kategorisera({ amne: 'Var ar min order', text: '' });
  assert.equal(k.id, 'leverans');
});

test('fel storlek blir storleksärende, inte defekt', () => {
  const k = kategorisera({ amne: 'Fel storlek', text: 'Skorna passar inte, för liten.' });
  assert.equal(k.id, 'storlek');
});

test('dubbeldrag blir betalningsärende och går före leverans', () => {
  const k = kategorisera({
    amne: 'Dubbeldrag',
    text: 'Ni har dragit två gånger för min leverans.',
  });
  assert.equal(k.id, 'betalning');
});

test('trasig vara blir defekt', () => {
  const k = kategorisera({ amne: 'Trasig', text: 'Produkten kom sönder.' });
  assert.equal(k.id, 'defekt');
});

test('okänt mail hamnar i övrigt i stället för att försvinna', () => {
  const k = kategorisera({ amne: 'Hej', text: 'Tack för sist.' });
  assert.equal(k.id, 'ovrigt');
});

test('mail utan innehåll kraschar inte', () => {
  assert.equal(kategorisera({}).id, 'ovrigt');
  assert.equal(hotniva({}).niva, null);
});

test('bank-hot ger akut nivå', () => {
  const h = hotniva({ amne: 'Sista varningen', text: 'Jag kontaktar banken imorgon.' });
  assert.equal(h.niva, 'akut');
  assert.ok(h.ord.includes('kontaktar banken'));
});

test('bestrider betalningen ger akut nivå', () => {
  assert.equal(hotniva({ text: 'Jag bestrider betalningen.' }).niva, 'akut');
});

test('arg kund utan bank ger varning, inte akut', () => {
  assert.equal(hotniva({ text: 'Det här är ju rena bluffen.' }).niva, 'varning');
});

test('vanligt mail ger ingen hotnivå', () => {
  assert.equal(hotniva({ text: 'Hej, när kommer paketet?' }).niva, null);
});

test('akut slår varning när båda finns', () => {
  const h = hotniva({ text: 'Rena bluffen, jag bestrider köpet.' });
  assert.equal(h.niva, 'akut');
});

test('hittar ordernummer i båda skrivsätten', () => {
  assert.deepEqual(hittaOrdernummer({ amne: 'Order #5435', text: '' }), ['#5435']);
  assert.deepEqual(hittaOrdernummer({ text: 'ordernummer 4971' }), ['#4971']);
});

test('samma ordernummer räknas en gång', () => {
  const funna = hittaOrdernummer({ amne: '#5435', text: 'gäller order 5435' });
  assert.deepEqual(funna, ['#5435']);
});

test('toppArenden rankar på antal och räknar trend mot förra veckan', () => {
  const mail = [
    { amne: 'Var är min order' },
    { amne: 'Leverans försenad' },
    { amne: 'Trasig produkt' },
  ];
  const topp = toppArenden(mail, { leverans: 1, defekt: 5 });
  assert.equal(topp[0].id, 'leverans');
  assert.equal(topp[0].antal, 2);
  assert.equal(topp[0].forandring, 1);
  const defekt = topp.find((t) => t.id === 'defekt');
  assert.equal(defekt.forandring, -4);
});

test('toppArenden ger tom trend när förra veckan saknas', () => {
  const topp = toppArenden([{ amne: 'Var är min order' }]);
  assert.equal(topp[0].forandring, null);
  assert.equal(topp[0].forra, null);
});
