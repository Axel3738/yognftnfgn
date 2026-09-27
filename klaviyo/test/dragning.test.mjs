// Klubbdragningen: kandidater, deterministisk dragning, skarpa skrivningar och loggen.
// Inget nät — en falsk Shopify-klient räknar anropen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  lasKonfig, sorteraKandidater, dra, kandidatHash, draftOrderInput, korDragning, redanKord, maskera, kundhash,
} from '../klubb/dragning.mjs';

const KONF = {
  antal: 3,
  veckodag: 2,
  land: 'SE',
  vinst: { handle: 'sushi-strumpor', variant_gid: 'gid://shopify/ProductVariant/1', titel: 'Sushi 5 par', varde_kr: 399 },
  tagg_vinnare: 'klubb-vinnare',
  tagg_bild_klar: 'klubb-bild-klar',
  ordertagg: 'klubb-dragning',
  egna_domaner: ['stonebite.org'],
  logg: 'klaviyo/konto/testbutik/dragningar.jsonl',
};
const BRAND = { id: 'testbutik', tidszon: 'Europe/Stockholm', klubb: { namn: 'Testklubben', dragning: KONF } };

const kund = (n, over = {}) => ({
  id: `gid://shopify/Customer/${n}`,
  email: `kund${n}@example.com`,
  firstName: `K${n}`,
  tags: [],
  numberOfOrders: '1',
  emailMarketingConsent: { marketingState: 'SUBSCRIBED' },
  defaultAddress: { address1: `Gatan ${n}`, city: 'Umeå', zip: '90000', countryCodeV2: 'SE' },
  ...over,
});

function falskKlient(rader, { total = '0.00' } = {}) {
  const anrop = [];
  return {
    anrop,
    async graphql(query, vars = {}) {
      if (query.includes('productVariant(')) {
        return { productVariant: { id: vars.id, title: '5 - Par', price: '399.00', availableForSale: true, product: { title: 'Sushi-Strumpor', handle: 'sushi-strumpor', status: 'ACTIVE' } }, shop: { currencyCode: 'SEK' } };
      }
      if (query.includes('customers(')) {
        return { customers: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: rader } };
      }
      if (query.includes('draftOrderCreate')) {
        anrop.push({ typ: 'draftOrderCreate', input: vars.input });
        return { draftOrderCreate: { draftOrder: { id: `gid://shopify/DraftOrder/${anrop.length}`, name: `#D${anrop.length}`, status: 'OPEN', totalPriceSet: { shopMoney: { amount: total } }, shippingAddress: vars.input.useCustomerDefaultAddress ? { city: 'Umeå' } : null }, userErrors: [] } };
      }
      if (query.includes('draftOrderComplete')) {
        anrop.push({ typ: 'draftOrderComplete', id: vars.id });
        return { draftOrderComplete: { draftOrder: { id: vars.id, order: { id: 'gid://shopify/Order/9', name: `#${1000 + anrop.length}` } }, userErrors: [] } };
      }
      if (query.includes('tagsAdd')) {
        anrop.push({ typ: 'tagsAdd', id: vars.id, tags: vars.tags });
        return { tagsAdd: { node: { id: vars.id }, userErrors: [] } };
      }
      throw new Error(`Falska klienten känner inte igen frågan: ${query.slice(0, 60)}`);
    },
  };
}

const tempRot = () => {
  const rot = mkdtempSync(join(tmpdir(), 'dragning-'));
  mkdirSync(join(rot, 'klaviyo', 'brands'), { recursive: true });
  writeFileSync(join(rot, 'klaviyo', 'brands', 'testbutik.json'), JSON.stringify(BRAND));
  return rot;
};

test('brandfilen måste bära klubb.dragning med vinst och taggar', () => {
  const rot = tempRot();
  const { konf } = lasKonfig('testbutik', rot);
  assert.equal(konf.antal, 3);
  assert.equal(konf.land, 'SE');
  writeFileSync(join(rot, 'klaviyo', 'brands', 'tom.json'), JSON.stringify({ id: 'tom', klubb: {} }));
  assert.throws(() => lasKonfig('tom', rot), /klubb\.dragning/);
  assert.throws(() => lasKonfig('finnsinte', rot), /Okänt brand/);
});

test('kandidater: egna domäner, redan vunna, andra länder och utan samtycke sorteras bort; utan adress är med', () => {
  const rader = [
    kund(1),
    kund(2, { email: 'axel@stonebite.org' }),
    kund(3, { tags: ['klubb-vinnare', 'klubb-vinnare-2026-09-29'] }),
    kund(4, { defaultAddress: { address1: 'Karl Johans gate 1', city: 'Oslo', zip: '0154', countryCodeV2: 'NO' } }),
    kund(5, { emailMarketingConsent: { marketingState: 'UNSUBSCRIBED' } }),
    kund(6, { defaultAddress: null, numberOfOrders: '0' }),
    kund(7, { email: '' }),
  ];
  const { kandidater, bort } = sorteraKandidater(rader, KONF);
  assert.deepEqual(kandidater.map((k) => k.id.split('/').pop()), ['1', '6']);
  assert.equal(kandidater[1].adress, null);
  assert.deepEqual(bort, { ej_samtycke: 1, utan_epost: 1, egen_doman: 1, redan_vunnit: 1, annat_land: 1 });
});

test('--test tar bara den kunden, även på egen domän, och säger varför när den inte går', () => {
  const rader = [kund(1), kund(2, { email: 'axel@stonebite.org', defaultAddress: null })];
  const { kandidater } = sorteraKandidater(rader, KONF, { test: 'Axel@stonebite.org' });
  assert.equal(kandidater.length, 1);
  assert.equal(kandidater[0].test, true);
  assert.throws(() => sorteraKandidater(rader, KONF, { test: 'ingen@example.com' }), /finns inte bland prenumeranterna/);
  assert.throws(() => sorteraKandidater([kund(9, { tags: ['klubb-vinnare'] })], KONF, { test: 'kund9@example.com' }), /bär redan taggen/);
});

test('dragningen är deterministisk på fröet och tar exakt antal', () => {
  const kandidater = Array.from({ length: 40 }, (_, i) => ({ id: `gid://shopify/Customer/${i + 1}` }));
  const a = dra(kandidater, { antal: 10, fro: 'abc123' });
  const b = dra(kandidater, { antal: 10, fro: 'abc123' });
  const c = dra(kandidater, { antal: 10, fro: 'annat' });
  assert.equal(a.length, 10);
  assert.equal(new Set(a.map((k) => k.id)).size, 10);
  assert.deepEqual(a.map((k) => k.id), b.map((k) => k.id));
  assert.notDeepEqual(a.map((k) => k.id), c.map((k) => k.id));
  // Ordningen på kandidatlistan spelar ingen roll — samma frö, samma vinnare.
  const d = dra([...kandidater].reverse(), { antal: 10, fro: 'abc123' });
  assert.deepEqual(d.map((k) => k.id).sort(), a.map((k) => k.id).sort());
  assert.equal(kandidatHash(kandidater), kandidatHash([...kandidater].reverse()));
  assert.throws(() => dra(kandidater, { antal: 0, fro: 'x' }), /Ogiltigt antal/);
  assert.throws(() => dra(kandidater, { antal: 3 }), /frö/);
});

test('draft order: 100 % rabatt, frakt 0, kundens adress, ordertaggen, ingen kod', () => {
  const v = { id: 'gid://shopify/Customer/1', adress: { address1: 'Gatan 1' } };
  const i = draftOrderInput(v, KONF, { datum: '2026-09-29', valuta: 'SEK', klubbnamn: 'Testklubben' });
  assert.deepEqual(i.purchasingEntity, { customerId: 'gid://shopify/Customer/1' });
  assert.equal(i.useCustomerDefaultAddress, true);
  assert.deepEqual(i.lineItems, [{ variantId: 'gid://shopify/ProductVariant/1', quantity: 1 }]);
  assert.equal(i.appliedDiscount.value, 100);
  assert.equal(i.appliedDiscount.valueType, 'PERCENTAGE');
  assert.equal(i.shippingLine.priceWithCurrency.amount, 0);
  assert.deepEqual(i.tags, ['klubb-dragning', 'klubb-dragning-2026-09-29']);
  assert.equal(i.acceptAutomaticDiscounts, false);
  assert.equal(i.allowDiscountCodesInCheckout, false);
  const u = draftOrderInput({ ...v, adress: null }, KONF, { datum: '2026-09-29', valuta: 'SEK', klubbnamn: 'Testklubben' });
  assert.equal(u.useCustomerDefaultAddress, false);
  assert.match(u.note, /ADRESS SAKNAS/);
});

test('torrt: inga skrivningar, en loggrad utan personuppgifter', async () => {
  const rot = tempRot();
  const rader = [kund(1), kund(2), kund(3), kund(4), kund(5)];
  const klient = falskKlient(rader);
  const loggat = [];
  const r = await korDragning({ klient, brand: BRAND, konf: KONF, brandId: 'testbutik', rot, datum: '2026-09-29', fro: 'fro1', antal: 3, logg: (t) => loggat.push(t) });
  assert.equal(klient.anrop.length, 0, 'torrt skriver ingenting');
  assert.equal(r.vinnare.length, 3);
  assert.equal(r.vaFil, null);
  const logg = readFileSync(join(rot, KONF.logg), 'utf8');
  assert.ok(!logg.includes('@'), 'loggen bär ingen e-post');
  assert.ok(!logg.includes('Umeå'), 'loggen bär ingen stad');
  assert.ok(!logg.includes('Gatan'), 'loggen bär ingen adress');
  const rad = JSON.parse(logg.trim());
  assert.equal(rad.torr, true);
  assert.equal(rad.fro, 'fro1');
  assert.equal(rad.vinnare[0].kund, kundhash(r.vinnare[0].id, 'testbutik'));
  assert.ok(loggat.some((t) => t.includes('TORRT')));
  assert.ok(loggat.every((t) => !t.includes('kund1@example.com')), 'utskriften maskerar e-posten');
});

test('skarpt: order → slutförd när adress finns, utkast utan adress, taggen sist; VA-listan i output; samma datum vägras', async () => {
  const rot = tempRot();
  const rader = [kund(1), kund(2, { defaultAddress: null }), kund(3)];
  const klient = falskKlient(rader);
  const r = await korDragning({ klient, brand: BRAND, konf: KONF, brandId: 'testbutik', rot, datum: '2026-09-29', fro: 'fro1', antal: 3, skarpt: true });
  assert.equal(r.fel.length, 0);
  const typer = klient.anrop.map((a) => a.typ);
  assert.equal(typer.filter((t) => t === 'draftOrderCreate').length, 3);
  assert.equal(typer.filter((t) => t === 'draftOrderComplete').length, 2, 'bara vinnare med adress slutförs');
  assert.equal(typer.filter((t) => t === 'tagsAdd').length, 3, 'alla vinnare taggas');
  for (let i = 0; i < typer.length - 1; i++) {
    if (typer[i] === 'tagsAdd') assert.notEqual(typer[i + 1], 'draftOrderComplete', 'ordern skapas före taggen');
  }
  const tagg = klient.anrop.find((a) => a.typ === 'tagsAdd');
  assert.deepEqual(tagg.tags, ['klubb-vinnare', 'klubb-vinnare-2026-09-29']);
  const utanAdress = r.rad.vinnare.find((v) => !v.adress);
  assert.equal(utanAdress.order, null);
  assert.match(utanAdress.utkast, /^#D/);
  assert.ok(existsSync(r.vaFil));
  const csv = readFileSync(r.vaFil, 'utf8');
  assert.ok(csv.includes('kund2@example.com;K2;;NEJ;;#D'), csv);
  assert.ok(r.vaFil.includes(join('klaviyo', 'output', 'testbutik')));
  // Samma datum en gång till: nej, utan --igen.
  const klient2 = falskKlient(rader);
  await assert.rejects(
    () => korDragning({ klient: klient2, brand: BRAND, konf: KONF, brandId: 'testbutik', rot, datum: '2026-09-29', fro: 'fro2', antal: 3, skarpt: true }),
    /finns redan/
  );
  assert.equal(klient2.anrop.length, 0);
  assert.equal(redanKord([r.rad], 'testbutik', '2026-09-29'), true);
  assert.equal(redanKord([r.rad], 'testbutik', '2026-10-06'), false);
});

test('en total som inte är 0 stoppar slutförandet och taggen', async () => {
  const rot = tempRot();
  const klient = falskKlient([kund(1)], { total: '399.00' });
  const r = await korDragning({ klient, brand: BRAND, konf: KONF, brandId: 'testbutik', rot, datum: '2026-09-29', fro: 'fro1', antal: 1, skarpt: true });
  assert.equal(r.fel.length, 1);
  assert.match(r.fel[0], /inte 0/);
  assert.deepEqual(klient.anrop.map((a) => a.typ), ['draftOrderCreate']);
});

test('maskeringen visar bara två tecken och domänen', () => {
  assert.equal(maskera('karin.svensson@gmail.com'), 'ka***@gmail.com');
  assert.equal(maskera(''), '***');
});
