// Tacksidan — den rena logiken bakom erbjudandekortet, rabattkoderna och
// produkterna. Inget nät. Kör: node --test factory/tacksida/test/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  STANDARD, installningar, erbjudandeFor, tolkaMarknadsdomaner, adressFor, numId, byggLank, erbjudandepris,
} from '../app/extensions/tacksida-erbjudande/src/logik.js';
import { byggRabattInput, byggUppdateringsInput } from '../rabatter.mjs';
import { byggBeskrivning, byggProduktInput, byggTillaggsmall, byggOversattningsrader } from '../produkter.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(readFileSync(join(HAR, '..', 'produkter.json'), 'utf8'));
const erbj = JSON.parse(readFileSync(join(HAR, '..', 'erbjudande.json'), 'utf8'));

// ---- rundningen: Shopify trunkerar rabattbeloppet (mätt 2026-09-26) ----------

test('erbjudandepriset trunkerar rabatten som Shopify: 35,25 % på 539 ger 349,01, inte 349,00', () => {
  assert.equal(erbjudandepris(539, 35.25), 349.01);
  assert.equal(erbjudandepris(379, 34.3), 249.01);
});

test('de valda procenten ger jämna kronor i SEK (kortet och kassan säger samma sak)', () => {
  const pris = { fonstertermomatta: 539, husbilskalendern: 379 };
  for (const e of erbj.erbjudanden) {
    assert.equal(erbjudandepris(pris[e.produkt], e.rabatt_procent), e.pris_mal_sek, `${e.rabattkod}`);
    assert.equal(Number.isInteger(e.pris_mal_sek), true);
  }
});

test('standardvärdena i kortet är samma koder och procent som erbjudande.json', () => {
  const [m, k] = erbj.erbjudanden;
  assert.equal(STANDARD.kod_1, m.rabattkod);
  assert.equal(STANDARD.procent_1, m.rabatt_procent);
  assert.equal(STANDARD.kod_2, k.rabattkod);
  assert.equal(STANDARD.procent_2, k.rabatt_procent);
  assert.equal(STANDARD.produkt_1, spec.produkter[0].handle);
  assert.equal(STANDARD.produkt_2, spec.produkter[1].handle);
});

test('rabattprocenten får högst två decimaler — Shopify lagrar inte fler', () => {
  assert.throws(() => byggRabattInput({ rabattkod: 'TACKX', rabatt_procent: 35.251 }, ['gid://shopify/Product/1']), /två decimaler/);
  const ok = byggRabattInput({ rabattkod: 'TACKX', rabatt_procent: 34.88 }, ['gid://shopify/Product/1']);
  assert.equal(ok.customerGets.value.percentage, 0.3488);
  assert.equal(ok.appliesOncePerCustomer, true);
  assert.deepEqual(ok.customerGets.items.products.productsToAdd, ['gid://shopify/Product/1']);
  assert.equal(ok.combinesWith.orderDiscounts, false);
});

test('uppdateringen byter produkter som diff, aldrig som svep', () => {
  const u = byggUppdateringsInput({ rabattkod: 'TACKX', rabatt_procent: 20 }, ['gid://p/2'], ['gid://p/1']);
  assert.deepEqual(u.customerGets.items.products, { productsToAdd: ['gid://p/2'], productsToRemove: ['gid://p/1'] });
});

// ---- inställningar och adresser ------------------------------------------------

test('tomma inställningar faller tillbaka på standard, komma i procent tolkas', () => {
  const i = installningar({ produkt_1: '', kod_1: null, procent_1: '34,88', giltig_timmar: '' });
  assert.equal(i.produkt_1, STANDARD.produkt_1);
  assert.equal(i.kod_1, STANDARD.kod_1);
  assert.equal(i.procent_1, 34.88);
  assert.equal(i.giltig_timmar, STANDARD.giltig_timmar);
  assert.equal(i.visa_ordinarie_pris, false);
  assert.equal(installningar({ visa_ordinarie_pris: 'true' }).visa_ordinarie_pris, true);
  assert.deepEqual(erbjudandeFor(i, STANDARD.produkt_2), { kod: STANDARD.kod_2, procent: STANDARD.procent_2 });
  assert.deepEqual(erbjudandeFor(i, 'nagot-annat'), { kod: '', procent: 0 });
});

test('marknadsdomäner: US får carashell.com utan prefix, norska får /nb på .se, svenska inget prefix', () => {
  assert.deepEqual(tolkaMarknadsdomaner('us=https://carashell.com|en, no = https://example.no'), {
    us: { bas: 'https://carashell.com', sprak: 'en' },
    no: { bas: 'https://example.no', sprak: null },
  });
  const inst = installningar({});
  assert.deepEqual(adressFor({ storefrontUrl: 'https://carashell.se/', marknadHandle: 'us', sprak: 'en', inst }), { bas: 'https://carashell.com', prefix: '' });
  assert.deepEqual(adressFor({ storefrontUrl: 'https://carashell.se', marknadHandle: 'no', sprak: 'nb-NO', inst }), { bas: 'https://carashell.se', prefix: '/nb' });
  assert.deepEqual(adressFor({ storefrontUrl: 'https://carashell.se', marknadHandle: 'se', sprak: 'sv', inst }), { bas: 'https://carashell.se', prefix: '' });
});

test('cart-permalinken bär variant, kod, märkning och förifylld kassa i Shopifys syntax', () => {
  const lank = byggLank({
    bas: 'https://carashell.se', prefix: '/nb', variantId: 'gid://shopify/ProductVariant/58952055619916', kod: 'TACKMATTA',
    plats: 'tack', orderNamn: '#1234', email: 'k@example.com',
    adress: { firstName: 'Kari', lastName: 'Nordmann', address1: 'Storgata 1', city: 'Oslo', zip: '0155', countryCode: 'NO', provinceCode: null },
  });
  const u = new URL(lank);
  assert.equal(u.origin + u.pathname, 'https://carashell.se/nb/cart/58952055619916:1');
  assert.equal(u.searchParams.get('discount'), 'TACKMATTA');
  assert.equal(u.searchParams.get('attributes[kalla]'), 'tacksida');
  assert.equal(u.searchParams.get('attributes[plats]'), 'tack');
  assert.equal(u.searchParams.get('attributes[efter_order]'), '#1234');
  assert.equal(u.searchParams.get('checkout[email]'), 'k@example.com');
  assert.equal(u.searchParams.get('checkout[shipping_address][country]'), 'NO');
  assert.equal(u.searchParams.get('checkout[shipping_address][zip]'), '0155');
  assert.equal(u.searchParams.has('checkout[shipping_address][province]'), false);
  assert.equal(numId('gid://shopify/ProductVariant/5'), '5');
});

// ---- produkterna --------------------------------------------------------------

test('produktbeskrivningen bär husets block, AI-raden och 14 dagars ångerrätt — aldrig butikens namn', () => {
  for (const p of spec.produkter) {
    const html = byggBeskrivning(p, { angerratt_text: spec.angerratt_text_sv });
    assert.match(html, /<h3>.*<\/h3>/);
    assert.match(html, /AI-genererade illustrationer/);
    assert.match(html, /14 dagars ångerrätt/);
    assert.doesNotMatch(html, /30 dagar/);
    // butikens namn får inte stå i texten — kontaktadressen hello@carashell.com är undantaget
    assert.doesNotMatch(html.replace(/hello@carashell\.com/g, ''), /CaraShell|Bäverbutiken|baverbutiken/i);
    assert.doesNotMatch(html, /🦫/);
  }
});

test('productSet-input: mallen tillagg, jämförpris över priset, sugproppar/retrobussar utan lager', () => {
  for (const p of spec.produkter) {
    const i = byggProduktInput(spec, p);
    assert.equal(i.templateSuffix, 'tillagg');
    assert.equal(i.status, 'ACTIVE');
    assert.equal(i.variants[0].inventoryPolicy, 'CONTINUE');
    // inget jämförpris förrän produkten sålts till listpris i 30 dagar (PIL 7 a §)
    assert.equal(i.variants[0].compareAtPrice, null);
    assert.ok(i.files.length >= 4);
  }
});

test('lättmallen tar bort paketblocken och opf-sektionerna men behåller köpknappen', () => {
  const bas = `/* kommentar */\n${JSON.stringify({
    sections: {
      main: { type: 'main-product', blocks: { title: { type: 'title' }, ms_paket_a: { type: 'custom_liquid' }, ms_paket_b: { type: 'custom_liquid' }, buy_buttons: { type: 'buy_buttons' } }, block_order: ['title', 'ms_paket_a', 'ms_paket_b', 'buy_buttons'] },
      opf_problem: { type: 'opf-problem' },
      judgeme_widget: { type: 'ms-app-slot' },
    },
    order: ['main', 'opf_problem', 'judgeme_widget'],
  })}`;
  const j = JSON.parse(byggTillaggsmall(bas));
  assert.deepEqual(Object.keys(j.sections.main.blocks), ['title', 'buy_buttons']);
  assert.deepEqual(j.sections.main.block_order, ['title', 'buy_buttons']);
  assert.deepEqual(j.order, ['main', 'judgeme_widget']);
});

test('översättningsrader byggs bara för fält som har text och digest', () => {
  const p = spec.produkter[0];
  const oversattbart = [{ key: 'title', digest: 'd1' }, { key: 'body_html', digest: 'd2' }, { key: 'meta_title', digest: 'd3' }, { key: 'meta_description', digest: 'd4' }];
  const rader = byggOversattningsrader(p, 'nb', spec, oversattbart);
  assert.deepEqual(rader.map((r) => r.key), ['title', 'body_html', 'meta_title', 'meta_description']);
  assert.match(rader[1].value, /Angrerett/);
  const utan = byggOversattningsrader({ ...p, titel: {}, oversattningar: {} }, 'nb', spec, oversattbart);
  assert.deepEqual(utan, []);
});
