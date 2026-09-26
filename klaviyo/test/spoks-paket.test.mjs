// Spoks-paketet: samma innehåll som Klaviyo-mejlen, i Spoks block, flöden och segment.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  fornamnTillSpoks, lankTillSpoks, blockTillSpoks, mejlTillSpoks, flodeTillSpoks, filterTillSpoks,
  ateintradeTillSpoks, vantaMs, segmentTillSpoks, triggerTillSpoks, flodesnamn, paket,
} from '../spoks-paket.mjs';

const brand = {
  id: 'testbutik',
  namn: 'Testbutiken',
  butik_url: 'https://testbutik.se',
  angerratt_text: '30 dagars returrätt',
  sparningssida: 'https://testbutik.se/pages/spara',
  tidszon: 'Europe/Stockholm',
  klubb: { namn: 'Testklubben' },
  kategorier: { sushi: ['sushi'], pizza: ['pizza'] },
};
const produkter = [
  { handle: 'sushi-strumpor', titel: 'Sushi-Strumpor', pris: 399, url: 'https://testbutik.se/products/sushi-strumpor', bild: 'https://cdn/s.jpg' },
  { handle: 'pizza-strumpor', titel: 'Pizza-Strumpor', pris: 449, url: 'https://testbutik.se/products/pizza-strumpor', bild: 'https://cdn/p.jpg' },
  { handle: 'donut-strumpor', titel: 'Donut-strumpor', pris: 299, url: 'https://testbutik.se/products/donut-strumpor', bild: 'https://cdn/d.jpg' },
];
const facit = {
  arbetsyta: { id: '71c2d4c8-b9ec-488a-b15c-5dfe8dbd2226', namn: 'Test' },
  produkter: {
    'sushi-strumpor': { id: '2b2d6bcd-dce7-411f-92f9-936a77a1c64f', externalId: 'gid://shopify/Product/1', bild_id: '572aba92-105a-4a4b-ae80-e9bd48ecbbaa' },
    'pizza-strumpor': { id: 'a70729cd-9bba-4eb7-af6e-f37206b20cde', externalId: 'gid://shopify/Product/2' },
    'donut-strumpor': { id: '18da3b76-d190-4b9f-b07e-0c6008f2bb37', externalId: 'gid://shopify/Product/3' },
  },
};
const recensioner = { 'sushi-strumpor': [{ namn: 'Kent', betyg: 5, text: 'Underbara strumpor' }, { namn: 'Wide P.', betyg: 4, text: 'Jättefina' }, { namn: 'Tre', betyg: 5, text: 'tredje' }] };
const perHandle = new Map(produkter.map((p) => [p.handle, p]));
const ctx = () => ({ brand, facit, produkt: (h) => perHandle.get(h) ?? null, produktlista: produkter, recensioner, stil: null, varningar: [], anmarkningar: new Set(), fel: [] });

test('{{fornamn}} blir Spoks-token med reservord efter var det står', () => {
  assert.equal(fornamnTillSpoks('Hej {{fornamn}},'), "Hej {{ contact.first_name | default: 'du' }},");
  assert.equal(fornamnTillSpoks('{{fornamn}}, julen är över'), "{{ contact.first_name | default: 'Hej' }}, julen är över");
  assert.equal(fornamnTillSpoks('Rad ett\n{{fornamn}}, rad två'), "Rad ett\n{{ contact.first_name | default: 'Hej' }}, rad två");
  assert.equal(fornamnTillSpoks('utan namn'), 'utan namn');
});

test('länkspråket blir riktiga adresser, spårningen utan paketnummer', () => {
  const c = ctx();
  assert.equal(lankTillSpoks('produkt:sushi-strumpor', c), 'https://testbutik.se/products/sushi-strumpor');
  assert.equal(lankTillSpoks('produkt:okand', c), 'https://testbutik.se/products/okand');
  assert.equal(lankTillSpoks('kollektion:alla-produkter', c), 'https://testbutik.se/collections/alla-produkter');
  assert.equal(lankTillSpoks('sparning:', c), 'https://testbutik.se/pages/spara');
  assert.ok([...c.anmarkningar][0].includes('utan paketnummer'));
  assert.equal(lankTillSpoks('sida:/pages/om', c), 'https://testbutik.se/pages/om');
  assert.equal(lankTillSpoks('https://annan.se/x', c), 'https://annan.se/x');
  assert.equal(lankTillSpoks('konstigt', c), 'https://testbutik.se');
  assert.ok(c.varningar.some((v) => v.includes('Okänd länk')));
  assert.ok(!JSON.stringify(c).includes('{%'), 'inget Klaviyo-mallspråk');
});

test('hero: bild ur mediebiblioteket, h1, stycken, knapp', () => {
  const c = ctx();
  const ut = blockTillSpoks({ block: [{ typ: 'hero', rubrik: 'Ser ut som sushi', text: 'Hej {{fornamn}},\n\nAndra stycket.', bild: 'produkt:sushi-strumpor', knapp: { text: 'Se lådan', lank: 'produkt:sushi-strumpor' } }] }, c);
  assert.deepEqual(ut.map((b) => b.type), ['image', 'h1', 'regular', 'regular', 'link']);
  assert.equal(ut[0].fileId, '572aba92-105a-4a4b-ae80-e9bd48ecbbaa');
  assert.equal(ut[0].urlRedirect, 'https://testbutik.se/products/sushi-strumpor');
  assert.equal(ut[1].alignment, 'center');
  assert.equal(ut[2].text, "Hej {{ contact.first_name | default: 'du' }},");
  assert.equal(ut[4].style, 'button');
});

test('hero utan bild-id i facit blir ett produktkort utan knapp', () => {
  const c = ctx();
  const ut = blockTillSpoks({ block: [{ typ: 'hero', rubrik: 'R', bild: 'produkt:pizza-strumpor' }] }, c);
  assert.equal(ut[0].type, 'products');
  assert.equal(ut[0].productVisibilitySettings.isButtonVisible, false);
  assert.equal(ut[0].buttonText, null);
  assert.equal(ut[0].products[0].id, 'a70729cd-9bba-4eb7-af6e-f37206b20cde');
});

test('produkt, produktrad, punkter, text och citat', () => {
  const c = ctx();
  const ut = blockTillSpoks({ block: [
    { typ: 'produkt', handle: 'sushi-strumpor', text: 'Fem par.', knapp: 'Till lådan' },
    { typ: 'produktrad', rubrik: 'Andra sorter', handles: ['pizza-strumpor', 'donut-strumpor', 'sushi-strumpor'] },
    { typ: 'punkter', rubrik: 'Lådan', punkter: ['a', 'b'] },
    { typ: 'text', rubrik: 'Rubrik', text: 'Ett.\n\nTvå.' },
    { typ: 'citat', handle: 'sushi-strumpor', antal: 2 },
  ] }, c);
  assert.deepEqual(ut.map((b) => b.type), ['regular', 'products', 'h2', 'products', 'h2', 'list', 'list', 'h2', 'regular', 'regular', 'quote', 'quote']);
  assert.equal(ut[1].products[0].button, 'Till lådan');
  assert.equal(ut[1].productsPerRow, 1);
  assert.equal(ut[3].productsPerRow, 3);
  assert.equal(ut[3].productVisibilitySettings.isButtonVisible, false);
  assert.equal(ut[3].selectionMode, 'manual');
  assert.equal(ut[3].dynamicCriteria, null);
  assert.equal(ut[10].text, '★★★★★ "Underbara strumpor"\nKent, verifierad kund');
  assert.equal(ut[11].text, '★★★★ "Jättefina"\nWide P., verifierad kund');
});

test('citat utan recensioner utgår med varning, produkt utan Spoks-id ger fel', () => {
  const c = ctx();
  const ut = blockTillSpoks({ block: [{ typ: 'citat', handle: 'pizza-strumpor' }, { typ: 'produkt', handle: 'okand' }] }, c);
  assert.equal(ut.length, 0);
  assert.ok(c.varningar.some((v) => v.includes('Inga riktiga recensioner')));
  assert.ok(c.fel.some((f) => f.includes('saknar Spoks-id')));
});

test('fakta blir två kolumner, medlemskortet en sektion, knappen med spårning får raden om MS-numret', () => {
  const c = ctx();
  const ut = blockTillSpoks({ block: [{ typ: 'fakta' }, { typ: 'medlemskort', etikett: 'Medlemskort', fotnot: 'Fotnot.' }, { typ: 'knapp', text: 'Följ ditt paket', lank: 'sparning:' }] }, c);
  assert.equal(ut[0].type, 'columns');
  assert.equal(ut[0].columns.length, 2);
  assert.equal(ut[0].columns[1].blocks[1].text, '[Följ det hela vägen](https://testbutik.se/pages/spara)');
  assert.equal(ut[1].type, 'section');
  assert.equal(ut[1].blocks[0].text, 'MEDLEMSKORT');
  assert.equal(ut[1].blocks[1].text, "{{ contact.first_name | default: 'Medlem' }}");
  assert.equal(ut[1].blocks[2].text, 'Medlem i Testklubben');
  assert.equal(ut[2].type, 'link');
  assert.equal(ut[2].url, 'https://testbutik.se/pages/spara');
  assert.ok(ut[3].text.includes('MS'));
});

test('dynamiska block: kassan blir abandonedCart (kräver checkout-trigger), visad produkt blir recently_viewed', () => {
  const c = ctx();
  const ut = blockTillSpoks({ block: [{ typ: 'dynamisk', kalla: 'checkout_rader' }, { typ: 'dynamisk', kalla: 'visad_produkt' }, { typ: 'dynamisk', kalla: 'order_rader' }] }, c);
  assert.equal(ut[0].type, 'abandonedCart');
  assert.equal(c.kravTrigger, 'checkout_created');
  assert.equal(ut[1].selectionMode, 'dynamic');
  assert.equal(ut[1].dynamicCriteria, 'recently_viewed');
  assert.equal(ut.length, 2);
  assert.ok(c.varningar.some((v) => v.includes('order_rader')));
});

test('mejlTillSpoks: ämne, förhandstext, titel — och inget Klaviyo-mallspråk kvar', () => {
  const r = mejlTillSpoks({ id: 'k01', amnesrader: [{ text: 'Ämne {{fornamn}}' }], forhandstext: 'Förhand', block: [{ typ: 'text', text: 'Hej {{fornamn}}, x' }] }, ctx(), { titel: 'K01 · x' });
  assert.equal(r.post.title, 'K01 · x');
  assert.equal(r.post.customizedNotification.emailTitle, "Ämne {{ contact.first_name | default: 'du' }}");
  assert.equal(r.post.customizedNotification.emailDescription, 'Förhand');
  assert.equal(r.post.deliveryChannel, 'email');
  assert.deepEqual(r.fel, []);
  assert.ok(!JSON.stringify(r.post).includes('{{fornamn}}'));
  const tomt = mejlTillSpoks({ id: 'x', amnesrader: [{ text: 'a' }], block: [] }, ctx(), { titel: 't' });
  assert.ok(tomt.fel.some((f) => f.includes('inga block')));
});

test('väntetider och återinträde', () => {
  assert.equal(vantaMs({ enhet: 'hours', varde: 3 }), 10_800_000);
  assert.equal(vantaMs({ enhet: 'days', varde: 90 }), 7_776_000_000);
  assert.throws(() => vantaMs({ enhet: 'år', varde: 1 }));
  assert.deepEqual(ateintradeTillSpoks({ varaktighet: null, enhet: 'alltime' }), { reenrollEnabled: false, allowReenrolmentAfter: null });
  assert.deepEqual(ateintradeTillSpoks({ varaktighet: 7, enhet: 'day' }), { reenrollEnabled: true, allowReenrolmentAfter: 'P7D' });
  assert.deepEqual(ateintradeTillSpoks({ varaktighet: 400, enhet: 'day' }), { reenrollEnabled: true, allowReenrolmentAfter: 'P365D' });
});

test('filternycklarna: samtycke/kundundantag på triggern, sedan-start på stegen', () => {
  const a = filterTillSpoks(['samtycke', 'ej_kopt_sedan_start']);
  assert.equal(a.trigger.operator, 'and');
  assert.deepEqual(a.trigger.filters[0].value, ['subscribed']);
  assert.equal(a.steg.operator, 'or');
  assert.equal(a.steg.filters[0].operator, 'nis');
  assert.equal(a.steg.filters[1].value, '__flow_triggered__');
  const b = filterTillSpoks(['kundundantag']);
  assert.deepEqual(b.trigger.filters[0].value, ['subscribed', 'not_subscribed']);
  assert.equal(b.steg, null);
  const c = filterTillSpoks(['samtycke', 'ej_kopt_sedan_start', 'ej_checkout_sedan_start']);
  assert.equal(c.steg.operator, 'and');
  assert.equal(c.steg.filters[1].filters[0].field, 'lastCheckout');
  assert.throws(() => filterTillSpoks(['påhittad']));
});

test('flöden: lista → contact_created, väntesteg före varje sändsteg, produkt_innehaller → triggerFilter', () => {
  const c = ctx();
  const mejl = new Map();
  const f1 = flodeTillSpoks({ id: 'f01-valkomst', namn: 'FLOW_lista_valkomst_v3', trigger: { typ: 'lista', lista: 'Email List' }, filter: ['samtycke', 'ej_kopt_sedan_start'], ateintrade: { varaktighet: null, enhet: 'alltime' }, steg: [
    { typ: 'mejl', mejl: { id: 'f01-valkomst-e1' } }, { typ: 'vanta', enhet: 'days', varde: 2 }, { typ: 'mejl', mejl: { id: 'f01-valkomst-e2' } },
  ] }, c, mejl);
  assert.equal(f1.namn, 'F01 Välkomst (Matstrumpor-klubben) · FLOW_lista_valkomst_v3');
  assert.equal(f1.create.trigger.event, 'contact_created');
  assert.equal(f1.create.reenrollEnabled, false);
  assert.deepEqual(f1.steg.map((s) => s.typ), ['delay', 'send', 'delay', 'send']);
  assert.equal(f1.steg[0].delay, 0);
  assert.equal(f1.steg[2].delay, 172_800_000);
  assert.equal(f1.steg[1].filter.operator, 'or');
  const f7 = flodeTillSpoks({ id: 'f07-aterkop-sushi', namn: 'FLOW_order_aterkop-sushi_v3', trigger: { typ: 'metrik', metrik: ['Placed Order'], produkt_innehaller: ['Sushi-Strumpor'] }, filter: ['kundundantag', 'ej_kopt_sedan_start'], ateintrade: { varaktighet: 60, enhet: 'day' }, steg: [
    { typ: 'vanta', enhet: 'days', varde: 21 }, { typ: 'mejl', mejl: { id: 'f07-aterkop-sushi-e1' } },
  ] }, c, mejl);
  assert.equal(f7.create.trigger.event, 'order_created');
  assert.deepEqual(f7.create.trigger.triggerFilter, { type: 'filter', field: 'externalId', operator: 'in', value: ['gid://shopify/Product/1'] });
  assert.equal(f7.create.allowReenrolmentAfter, 'P60D');
  assert.equal(f7.steg[0].delay, 1_814_400_000);
  const f6 = flodeTillSpoks({ id: 'f06-sunset', namn: 'FLOW_segment_sunset_v3', trigger: { typ: 'segment', segment: 'SEG_oengagerade_180d' }, filter: ['samtycke'], steg: [{ typ: 'mejl', mejl: { id: 'f06-sunset-e1' } }] }, c, mejl);
  assert.deepEqual(f6.kampanjerIstallet, ['f06-sunset-e1']);
  assert.equal(f6.create, undefined);
  assert.throws(() => triggerTillSpoks({ typ: 'metrik', metrik: ['Okänd'] }, c));
  assert.throws(() => triggerTillSpoks({ typ: 'metrik', metrik: ['Placed Order'], produkt_innehaller: ['Finns inte'] }, c));
  assert.equal(flodesnamn({ id: 'f09-nytt-flode', namn: 'FLOW_x_v1' }), 'F09 nytt flode · FLOW_x_v1');
});

test('kassablock i ett flöde utan checkout-trigger ger anmärkning', () => {
  const c = ctx();
  const mejl = new Map([['m1', { kravTrigger: 'checkout_created' }]]);
  const f = flodeTillSpoks({ id: 'f02-overgiven-kassa', namn: 'FLOW_checkout_overgiven_v3', trigger: { typ: 'metrik', metrik: ['Placed Order'] }, filter: ['samtycke'], steg: [{ typ: 'mejl', mejl: { id: 'm1' } }] }, c, mejl);
  assert.ok(f.anmarkningar.some((a) => a.includes('kassablock')));
});

test('segmenten: samtycke i varje, kategorierna ur brandet, oengagerade aldrig kampanjpublik', () => {
  const s = segmentTillSpoks(brand);
  assert.equal(s.length, 12);
  for (const x of s) assert.ok(JSON.stringify(x.filter).includes('"emailMarketingConsent","operator":"in","value":["subscribed"]'), x.namn);
  assert.equal(s.find((x) => x.namn === 'SEG_oengagerade_180d').kampanjOk, false);
  const sushi = s.find((x) => x.namn === 'SEG_kategori_sushi');
  // Ett ensamt kategoriord blir en bar eventFilter — Spoks tar ingen konjunktion med en nod.
  assert.equal(sushi.filter.filters[2].type, 'eventFilter');
  assert.equal(sushi.filter.filters[2].conditionFilter.value, 'sushi');
  const upp = s.find((x) => x.namn === 'SEG_uppvarmning_steg1');
  assert.equal(upp.filter.filters[2].filters[0].timeFilter.value, 'P30D');
});

test('paket(): skriver ett JSON per mejl, floden.json och PAKET.json ur en fixtur', async () => {
  const rot = mkdtempSync(join(tmpdir(), 'spoks-'));
  mkdirSync(join(rot, 'klaviyo', 'brands'), { recursive: true });
  mkdirSync(join(rot, 'klaviyo', 'konto', 'testbutik'), { recursive: true });
  const inn = join(rot, 'innehall');
  mkdirSync(join(inn, 'kampanjer'), { recursive: true });
  mkdirSync(join(inn, 'floden'), { recursive: true });
  writeFileSync(join(rot, 'klaviyo', 'brands', 'testbutik.json'), JSON.stringify(brand));
  writeFileSync(join(rot, 'klaviyo', 'konto', 'testbutik', 'spoks.json'), JSON.stringify(facit));
  writeFileSync(join(inn, 'kampanjer', 'k01-test.json'), JSON.stringify({ id: 'k01-test', namn: 'MAIL_x', amnesrader: [{ text: 'Ämne' }], forhandstext: 'F', planerad: '2026-09-29T18:00:00+02:00', segment: ['SEG_samtycke'], exkludera: [], status_plan: 'klar', block: [{ typ: 'hero', rubrik: 'R', bild: 'produkt:sushi-strumpor' }, { typ: 'fakta' }] }));
  writeFileSync(join(inn, 'floden', 'f04-efter-kop.json'), JSON.stringify({ id: 'f04-efter-kop', namn: 'FLOW_order_efterkop_v3', memo: 'm', trigger: { typ: 'metrik', metrik: ['Fulfilled Order'] }, filter: ['kundundantag'], ateintrade: { varaktighet: 30, enhet: 'day' }, steg: [{ typ: 'vanta', enhet: 'days', varde: 3 }, { typ: 'mejl', mejl: { id: 'f04-efter-kop-e1', amnesrader: [{ text: 'På väg' }], forhandstext: 'x', block: [{ typ: 'knapp', text: 'Följ', lank: 'sparning:' }] } }] }));
  const ut = join(rot, 'ut');
  const r = await paket({ brandId: 'testbutik', rot, innehallDir: inn, utDir: ut, produkter, recensioner });
  assert.ok(existsSync(join(ut, 'k01-test.json')));
  assert.ok(existsSync(join(ut, 'f04-efter-kop-e1.json')));
  const m = JSON.parse(readFileSync(join(ut, 'PAKET.json'), 'utf8'));
  assert.equal(m.arbetsyta.id, facit.arbetsyta.id);
  assert.equal(m.mejl.length, 2);
  assert.equal(m.kampanjer[0].kort, 'K01');
  assert.equal(m.floden[0].create.trigger.event, 'order_created');
  assert.equal(m.floden[0].steg[0].delay, 259_200_000);
  assert.ok(m.anmarkningar.some((a) => a.includes('Fulfilled Order')));
  assert.ok(m.anmarkningar.some((a) => a.includes('utan paketnummer')));
  assert.deepEqual(m.fel, []);
  assert.equal(JSON.parse(readFileSync(join(ut, 'k01-test.json'), 'utf8')).title, 'K01 · 29/9 · samtycke · Ämne');
  await assert.rejects(() => paket({ brandId: 'testbutik', rot, innehallDir: inn, utDir: ut, produkter, recensioner, facit: {} }), /Facit saknas/);
});
