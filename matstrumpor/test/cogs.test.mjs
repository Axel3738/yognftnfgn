import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lasCogs, kostnadsnyckel, blockFor, tillSek, landadKostnad, orderKostnad, breakEvenForMarknad } from '../cogs.mjs';

const COGS = lasCogs();
const KURSER = { sekPer: { SEK: 1, USD: 9.9009, EUR: 11.29 } };

test('cogs.json: varje produkt i blocken har rader för alla Big 5-länder', () => {
  for (const [nyckel, lander] of Object.entries(COGS.big5.rader)) {
    for (const l of COGS.big5.lander) assert.ok(Array.isArray(lander[l]) && lander[l].length > 0, `${nyckel} saknar ${l}`);
  }
  assert.deepEqual(Object.keys(COGS.sverige.kostnad).sort(), ['atpinnar', 'donut', 'hamburgare', 'pizza', 'presentkort', 'sushi-3', 'sushi-5']);
});

test('kostnadsnyckel: varianttitel, joker och första ledet', () => {
  assert.equal(kostnadsnyckel(COGS, 'sushi-strumpor', '5 - Par / One Size'), 'sushi-5');
  assert.equal(kostnadsnyckel(COGS, 'sushi-strumpor', '3 - Par'), 'sushi-3');
  assert.equal(kostnadsnyckel(COGS, 'donut-strumpor', 'One Size'), 'donut');
  assert.equal(kostnadsnyckel(COGS, 'okand', 'x'), null);
});

test('blockFor och tillSek', () => {
  assert.equal(blockFor(COGS, 'SE'), 'sverige');
  assert.equal(blockFor(COGS, 'us'), 'big5');
  assert.equal(blockFor(COGS, 'NO'), 'norden');
  assert.equal(blockFor(COGS, 'DE'), null);
  assert.equal(tillSek(10, 'USD', KURSER), 99.009);
  assert.throws(() => tillSek(10, 'GBP', KURSER), /Ingen kurs/);
});

test('Sverige: Cost per item × antal; saknad kostnad blir orsak, aldrig noll', () => {
  const k = landadKostnad({ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 2, land: 'SE' }, KURSER, COGS);
  assert.equal(k.sek, 160.46);
  const s = landadKostnad({ handle: 'donut-strumpor', variantTitel: 'One Size', antal: 1, land: 'SE' }, KURSER, COGS);
  assert.ok(s.saknas && /Cost per item/.test(s.saknas));
});

test('Big 5: arkets rad för antalet vinner, fler lådor skalas linjärt och märks', () => {
  const en = landadKostnad({ handle: 'donut-strumpor', variantTitel: 'One Size', antal: 1, land: 'US' }, KURSER, COGS);
  assert.equal(en.belopp, 9.1);
  assert.equal(en.sek, Math.round(9.1 * 9.9009 * 100) / 100);
  const tva = landadKostnad({ handle: 'donut-strumpor', variantTitel: 'One Size', antal: 2, land: 'US' }, KURSER, COGS);
  assert.equal(tva.belopp, 14.2);
  const fyra = landadKostnad({ handle: 'donut-strumpor', variantTitel: 'One Size', antal: 4, land: 'US' }, KURSER, COGS);
  assert.equal(fyra.belopp, 28.4);
  assert.ok(/linjärt/.test(fyra.kalla));
  const sushi = landadKostnad({ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 1, land: 'GB' }, KURSER, COGS);
  assert.equal(sushi.belopp, 8.3);
});

test('Norden: ingen kostnad ⇒ saknas med orsak', () => {
  const k = landadKostnad({ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 1, land: 'NO' }, KURSER, COGS);
  assert.ok(k.saknas && /Norge/.test(k.saknas));
});

test('orderKostnad: tull bara i Sverige, blandad Big 5-order anmärks', () => {
  const se = orderKostnad([{ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 2 }], 'SE', KURSER, { tullSek: 32.74, cogs: COGS });
  assert.equal(se.sek, Math.round((160.46 + 32.74) * 100) / 100);
  assert.equal(se.komplett, true);
  const us = orderKostnad([{ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 1 }, { handle: 'pizza-strumpor', variantTitel: 'One Size', antal: 1 }], 'US', KURSER, { tullSek: 32.74, cogs: COGS });
  assert.ok(!us.delar.some((d) => d.tull));
  assert.ok(/blandad/.test(us.anmarkning));
  const no = orderKostnad([{ handle: 'donut-strumpor', variantTitel: 'One Size', antal: 1 }], 'NO', KURSER, { cogs: COGS });
  assert.equal(no.komplett, false);
});

test('breakEvenForMarknad: USD-priset räknas om till SEK, ROAS mot landad kostnad', () => {
  const b = breakEvenForMarknad({ pris: 59, valuta: 'USD', kostnadSek: 104.95, kurser: KURSER });
  assert.equal(b.pris_sek, 584.15);
  assert.equal(b.break_even_cpa_sek, 479.2);
  assert.equal(b.break_even_roas, 1.219);
  const d = breakEvenForMarknad({ pris: 5, valuta: 'USD', kostnadSek: 104.95, kurser: KURSER });
  assert.equal(d.break_even_roas, null);
});
