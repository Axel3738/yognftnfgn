import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lasCogs, kostnadsnyckel, blockFor, tillSek, landadKostnad, orderKostnad, breakEvenForMarknad, tullGaller } from '../cogs.mjs';

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

test('Sverige: Cost per item × arkets paketkvot; saknad kostnad blir orsak, aldrig noll', () => {
  const k = landadKostnad({ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 2, land: 'SE' }, KURSER, COGS);
  assert.equal(k.sek, 120.35, 'två lådor i ett paket: 80,23 × 12,3/8,2 — Axels 120,92');
  assert.ok(/arket: 2 set/.test(k.kalla));
  const en = landadKostnad({ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 1, land: 'SE' }, KURSER, COGS);
  assert.equal(en.sek, 80.23);
  const fyra = landadKostnad({ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 4, land: 'SE' }, KURSER, COGS);
  assert.equal(fyra.sek, 240.69, 'fyra lådor: största raden (2 set) skalad linjärt');
  const utanArk = { ...COGS, sverige: { ...COGS.sverige, ark_usd: undefined } };
  assert.equal(landadKostnad({ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 2, land: 'SE' }, KURSER, utanArk).sek, 160.46);
  const d = landadKostnad({ handle: 'donut-strumpor', variantTitel: 'One Size', antal: 1, land: 'SE' }, KURSER, COGS);
  assert.equal(d.sek, 73.42);
  const utan = { ...COGS, sverige: { ...COGS.sverige, kostnad: { ...COGS.sverige.kostnad, donut: null } } };
  const s = landadKostnad({ handle: 'donut-strumpor', variantTitel: 'One Size', antal: 1, land: 'SE' }, KURSER, utan);
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

test('Norden: arkets rad per land, 2 set i ett paket, pris-kolumnen vinner', () => {
  const k = landadKostnad({ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 1, land: 'NO' }, KURSER, COGS);
  assert.equal(k.belopp, 9.4);
  assert.equal(k.valuta, 'USD');
  const tva = landadKostnad({ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 2, land: 'FI' }, KURSER, COGS);
  assert.equal(tva.belopp, 15.3);
  const nz = landadKostnad({ handle: 'donut-strumpor', variantTitel: 'One Size', antal: 1, land: 'NZ' }, KURSER, COGS);
  assert.equal(nz.belopp, 8.7, 'arkets pris 8,7 vinner över 2,6 + 6,2');
  assert.ok(/pris/.test(nz.kalla));
  const okand = landadKostnad({ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 1, land: 'JP' }, KURSER, COGS);
  assert.ok(okand.saknas && /kostnadsblock/.test(okand.saknas));
});

test('orderKostnad: tull i Sverige och inte i USA, blandad arkorder anmärks', () => {
  const se = orderKostnad([{ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 2 }], 'SE', KURSER, { tullSek: 32.74, cogs: COGS });
  assert.equal(se.sek, Math.round((120.35 + 32.74) * 100) / 100);
  assert.equal(se.komplett, true);
  const us = orderKostnad([{ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 1 }, { handle: 'pizza-strumpor', variantTitel: 'One Size', antal: 1 }], 'US', KURSER, { tullSek: 32.74, cogs: COGS });
  assert.ok(!us.delar.some((d) => d.tull));
  assert.ok(/blandad/.test(us.anmarkning));
  const no = orderKostnad([{ handle: 'donut-strumpor', variantTitel: 'One Size', antal: 1 }], 'NO', KURSER, { cogs: COGS });
  assert.equal(no.komplett, true, 'Norge har arkets kostnad sedan 2026-10-03');
  const jp = orderKostnad([{ handle: 'donut-strumpor', variantTitel: 'One Size', antal: 1 }], 'JP', KURSER, { cogs: COGS });
  assert.equal(jp.komplett, false);
});

test('breakEvenForMarknad: USD-priset räknas om till SEK, ROAS mot landad kostnad', () => {
  const b = breakEvenForMarknad({ pris: 59, valuta: 'USD', kostnadSek: 104.95, kurser: KURSER });
  assert.equal(b.pris_sek, 584.15);
  assert.equal(b.break_even_cpa_sek, 479.2);
  assert.equal(b.break_even_roas, 1.219);
  const d = breakEvenForMarknad({ pris: 5, valuta: 'USD', kostnadSek: 104.95, kurser: KURSER });
  assert.equal(d.break_even_roas, null);
});

test('tullGaller: EU-tullen på SE, DK och FI — aldrig på NO eller Big 5', () => {
  assert.equal(tullGaller(COGS, 'SE'), true);
  assert.equal(tullGaller(COGS, 'DK'), true);
  assert.equal(tullGaller(COGS, 'fi'), true);
  assert.equal(tullGaller(COGS, 'NO'), false);
  assert.equal(tullGaller(COGS, 'US'), false);
  assert.equal(tullGaller(COGS, 'JP'), false);
  const dk = orderKostnad([{ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 2 }], 'DK', KURSER, { tullSek: 32.7, cogs: COGS });
  assert.ok(dk.delar.some((d) => d.tull));
  const no = orderKostnad([{ handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 2 }], 'NO', KURSER, { tullSek: 32.7, cogs: COGS });
  assert.ok(!no.delar.some((d) => d.tull));
});

test('orderKostnad: samma variant på två rader (Köp 1, få 1 som gåvorad) räknas som ett tvåpaket', () => {
  const tva = orderKostnad([
    { handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 1 },
    { handle: 'sushi-strumpor', variantTitel: '5 - Par / One Size', antal: 1 },
    { handle: 'sushipinnar-i-akta-tra', variantTitel: 'Default Title', antal: 2 },
  ], 'SE', KURSER, { cogs: COGS });
  assert.equal(tva.sek, 120.35);
  assert.equal(tva.delar.filter((d) => !d.tull).length, 2, 'sushi + ätpinnar = två delar');
});
