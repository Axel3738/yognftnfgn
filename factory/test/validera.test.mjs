// Tester för factorys YAML-läsare och produktvalidering.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from '../yaml.mjs';
import { validera, kontrolleraPaket, kontrolleraBonus, kontrolleraBildrad } from '../validera.mjs';
import { sammanfoga } from '../butik.mjs';
import { dummy, rabutik } from './hjalp.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DUMMY = join(ROT, 'produkter', 'dummyprodukten.yaml');

test('yaml: objekt, listor, tal och citerade strängar', () => {
  const data = lasYaml(`
# kommentar
produkt:
  namn: "Nackmagneten"
  id: nackmagneten
ekonomi:
  pris: 399
  aktiv: true
problem:
  - "Stel nacke"
  - Huvudvärk
reviews:
  - namn: "Eva"
    betyg: 5
  - namn: "Mats"
    betyg: 4
leverantor:
  url: "https://exempel.se/produkt#topp"
`);
  assert.equal(data.produkt.namn, 'Nackmagneten');
  assert.equal(data.produkt.id, 'nackmagneten');
  assert.equal(data.ekonomi.pris, 399);
  assert.equal(data.ekonomi.aktiv, true);
  assert.deepEqual(data.problem, ['Stel nacke', 'Huvudvärk']);
  assert.deepEqual(data.reviews, [
    { namn: 'Eva', betyg: 5 },
    { namn: 'Mats', betyg: 4 },
  ]);
  assert.equal(data.leverantor.url, 'https://exempel.se/produkt#topp');
});

test('yaml: kommentar efter värde strippas, tom nyckel blir null', () => {
  const data = lasYaml(`
pris: 399  # kronor
bundle:
lista:   # bara en kommentar efter kolon
  - a
`);
  assert.equal(data.pris, 399);
  assert.equal(data.bundle, null);
  assert.deepEqual(data.lista, ['a']);
});

test('dummyprodukten passerar utan kritiska fel när butikskonfigen vävts in', () => {
  const { fel, nyckeltal } = validera(dummy());
  assert.deepEqual(fel, []);
  assert.equal(nyckeltal.breakEvenRoas, 1.28); // 399 / (399 − 87)
  assert.equal(nyckeltal.breakEvenCpa, 312);
});

test('dummyprodukten varnar om tomma meta-fält', () => {
  const { varningar } = validera(dummy());
  assert.ok(varningar.some((v) => v.includes('meta.pixel_id')));
});

const dummyData = () => dummy();

test('saknat pris ger kritiskt fel', () => {
  const data = dummyData();
  delete data.ekonomi.pris;
  const { fel } = validera(data);
  assert.ok(fel.some((f) => f.includes('ekonomi.pris')));
});

test('pris under inköpskostnad ger kritiskt fel', () => {
  const data = dummyData();
  data.ekonomi.pris = 50;
  const { fel } = validera(data);
  assert.ok(fel.some((f) => f.includes('högre än inköpskostnaden')));
});

test('jämförpris under priset ger kritiskt fel', () => {
  const data = dummyData();
  data.ekonomi.jamforpris = 299;
  const { fel } = validera(data);
  assert.ok(fel.some((f) => f.includes('jamforpris')));
});

test('okänd valuta ger kritiskt fel', () => {
  const data = dummyData();
  data.ekonomi.valuta = 'BTC';
  const { fel } = validera(data);
  assert.ok(fel.some((f) => f.includes('okänd')));
});

test('utan media ger kritiskt fel', () => {
  const data = dummyData();
  data.media = { bilder: [], videor: [] };
  const { fel } = validera(data);
  assert.ok(fel.some((f) => f.includes('media')));
});

test('variant utan namn ger kritiskt fel', () => {
  const data = dummyData();
  data.varianter.push({ sku: 'X' });
  const { fel } = validera(data);
  assert.ok(fel.some((f) => f.includes('varianter[2]')));
});

test('tom fil ger många kritiska fel och stoppar', () => {
  const { fel, nyckeltal } = validera(lasYaml(''));
  assert.ok(fel.length >= 8);
  assert.equal(nyckeltal, null);
});

// --- Fälten kedjan läser (förenat 2026-09-09, KEDJAN.md) ---

test('produkt.handle: tomt är ok, fel tecken stoppar', () => {
  const data = dummyData();
  data.produkt.handle = 'tankoverdraget';
  assert.ok(!validera(data).fel.some((f) => f.includes('handle')));
  data.produkt.handle = 'Tank Överdraget';
  assert.ok(validera(data).fel.some((f) => f.includes('produkt.handle')));
  data.produkt.handle = '';
  assert.ok(!validera(data).fel.some((f) => f.includes('handle')));
});

test('media.bilder tar sträng ELLER { url, alt }; objekt utan url stoppar', () => {
  const data = dummyData();
  data.media.bilder = ['https://exempel.se/a.jpg', { url: 'https://exempel.se/b.jpg', alt: '[NO] Før og etter' }];
  assert.ok(!validera(data).fel.some((f) => f.includes('media.bilder')));
  data.media.bilder = [{ alt: '[NO] utan url' }];
  assert.ok(validera(data).fel.some((f) => f.includes('media.bilder[0]')));
  assert.equal(kontrolleraBildrad({ url: 'x', alt: 5 }, 'p'), 'p: alt måste vara text');
  assert.equal(kontrolleraBildrad('https://exempel.se/a.jpg', 'p'), null);
});

test('vinkel.usp: saknad = varning, för lång = varning, fel typ = fel', () => {
  const data = dummyData();
  assert.ok(validera(data).varningar.some((v) => v.includes('vinkel.usp')));
  data.vinkel.usp = 'Stoppar alger och UV';
  assert.ok(!validera(data).varningar.some((v) => v.includes('vinkel.usp')));
  data.vinkel.usp = 'En alldeles för lång produkt-USP som aldrig ryms';
  assert.ok(validera(data).varningar.some((v) => v.includes('vinkel.usp')));
  data.vinkel.usp = 42;
  assert.ok(validera(data).fel.some((f) => f.includes('vinkel.usp')));
});

const paketOk = () => ({
  bonus_produkt: { handle: 'kranskydd-frost', titel: 'Kranskydd', pris: 199, bilder: ['https://exempel.se/k.jpg'] },
  paket: {
    test: 'paket',
    nivaer: [
      { variant: 'a', antal: 1, rubrik: '1 st' },
      { variant: 'a', antal: 2, rubrik: '2 st', pris: 831, kod: 'PAKET2', gratis_antal: 2, forvald: true },
      { variant: 'a', antal: 3, rubrik: '3 st', pris: 1159, kod: 'PAKET3', gratis_antal: 3 },
    ],
  },
});

test('offer.paket.nivaer: TankGuards nivåer går igenom utan fel', () => {
  const r = kontrolleraPaket(paketOk(), { pris: 489 });
  assert.deepEqual(r.fel, []);
});

test('offer.paket: första nivån förvald, pris utan kod, paketpris över ordinarie och gratis utan bonus stoppar', () => {
  const o = paketOk();
  o.paket.nivaer[0].forvald = true;
  o.paket.nivaer[1].forvald = false;
  assert.ok(kontrolleraPaket(o, { pris: 489 }).fel.some((f) => f.includes('första nivån är förvald')));

  const o2 = paketOk();
  delete o2.paket.nivaer[1].kod;
  assert.ok(kontrolleraPaket(o2, { pris: 489 }).fel.some((f) => f.includes('pris och kod hör ihop')));

  const o3 = paketOk();
  o3.paket.nivaer[2].pris = 2000;
  assert.ok(kontrolleraPaket(o3, { pris: 489 }).fel.some((f) => f.includes('högre än 3 × ordinarie')));

  const o4 = paketOk();
  delete o4.bonus_produkt;
  assert.ok(kontrolleraPaket(o4, { pris: 489 }).fel.some((f) => f.includes('gratis_antal utan offer.bonus_produkt.pris')));

  const o5 = paketOk();
  o5.paket.nivaer[1].variant = 'c';
  assert.ok(kontrolleraPaket(o5, { pris: 489 }).fel.some((f) => f.includes('variant "c"')));
});

test('offer.paket som saknas eller är tomt är inget fel (paket.mjs tar standardnivåerna)', () => {
  assert.deepEqual(kontrolleraPaket({}, { pris: 489 }).fel, []);
  assert.deepEqual(kontrolleraPaket({ paket: { test: 'paket', nivaer: null } }, { pris: 489 }).fel, []);
});

test('offer.bonus_produkt: alla Q4-fält accepteras; saknad bild är varning (steg 9 manuellt), fel typ är fel', () => {
  const ok = kontrolleraBonus({
    titel: 'Kranskydd Frost 420D',
    handle: 'kranskydd-frost',
    produkt_id: '15989725593944',
    variant_id: '58420897481048',
    pris: 199,
    i_paket: '2 st i 2-pack',
    tillagg_kryssruta: true,
    kortnamn: 'Kranskydd Frost',
    sku: 'TEMU-1',
    bilder: ['https://exempel.se/k.jpg', { url: 'https://exempel.se/k2.jpg', alt: '[NO] Kranbeskytter' }],
  });
  assert.deepEqual(ok.fel, []);
  assert.deepEqual(ok.varningar, []);

  const utanBild = kontrolleraBonus({ titel: 'K', handle: 'kranskydd-frost', pris: 199 });
  assert.deepEqual(utanBild.fel, []);
  assert.ok(utanBild.varningar.some((v) => v.includes('bilder')));

  const felTyp = kontrolleraBonus({ handle: 'Kran Skydd', tillagg_kryssruta: 'ja', pris: 199, titel: 'K', bilder: ['x'] });
  assert.ok(felTyp.fel.some((f) => f.includes('bonus_produkt.handle')));
  assert.ok(felTyp.fel.some((f) => f.includes('tillagg_kryssruta')));

  assert.deepEqual(kontrolleraBonus(undefined), { fel: [], varningar: [] });
});

test('reviews[].datum: saknas = VARNING, aldrig stopp; fel format = varning', () => {
  const data = dummyData();
  const r = validera(data);
  assert.deepEqual(r.fel, []);
  assert.ok(r.varningar.some((v) => v.includes('reviews[0]') && v.includes('datum')));
  data.reviews = data.reviews.map((x, i) => ({ ...x, datum: i === 0 ? '10/8 2026' : '2026-08-10' }));
  const r2 = validera(data);
  assert.deepEqual(r2.fel, []);
  assert.ok(r2.varningar.some((v) => v.includes('reviews[0]') && v.includes('YYYY-MM-DD')));
  assert.ok(!r2.varningar.some((v) => v.includes('reviews[1]')));
});

test('moms_i_pris: nettotalen visas BREDVID break-even rakt på priset, aldrig i stället (BESLUT-VANTAR #1)', () => {
  const p = dummy(); // testbutiken: moms_i_pris true
  const { nyckeltal } = validera(p);
  assert.equal(nyckeltal.breakEvenRoas, 1.28);
  assert.ok(nyckeltal.medMoms);
  assert.equal(nyckeltal.medMoms.netto, 319.2); // 399 / 1,25
  assert.equal(nyckeltal.medMoms.breakEvenRoas, 1.72); // 399 / (319,2 − 87)
  const b = rabutik();
  b.butik.moms_i_pris = false;
  assert.equal(validera(sammanfoga(b, lasYaml(readFileSync(DUMMY, 'utf8')))).nyckeltal.medMoms, undefined);
});

test('TankGuards förenade produktfil validerar utan fel ihop med butiksfilen', () => {
  const butik = lasYaml(readFileSync(join(ROT, 'butiker', 'tankguard.yaml'), 'utf8'));
  const rad = lasYaml(readFileSync(join(ROT, 'produkter', 'tankguard.yaml'), 'utf8'));
  assert.equal(rad.produkt.id, 'tankguard');
  assert.equal(rad.produkt.handle, 'tankoverdraget');
  assert.deepEqual(rad.media.videor, []);
  const { fel, varningar, nyckeltal } = validera(sammanfoga(butik, rad));
  assert.deepEqual(fel, []);
  assert.deepEqual(varningar, []);
  assert.equal(nyckeltal.breakEvenRoas, 1.46);
  assert.equal(nyckeltal.medMoms.breakEvenRoas, 2.07); // filens break_even_roas, räknat på 155
});
