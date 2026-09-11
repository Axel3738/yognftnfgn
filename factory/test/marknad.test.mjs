// Tester för marknad.mjs (värdematchning, digest, tema-id:n, läckfilter),
// oversattning.mjs (nyckelbygge, underlaget) och oversattning-granska.mjs
// (ren granskning). Ingen nätverkstrafik. Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { norm, byggKarta, paraResurs, temaResursIds, typUrResursId, arLacka, landsnamn } from '../marknad.mjs';
import { malltexter, produktTexter, byggUnderlagObjekt, byggMinimalKontext, underlagsfil } from '../oversattning.mjs';
import { granskaNoder, filtreraPaTema, arMaskinvarde, arAppcache, digestFor } from '../oversattning-granska.mjs';
import { rabutik, raprodukt } from './hjalp.mjs';

// ---- marknad.mjs -------------------------------------------------------------

test('norm jämnar ut det Shopify normaliserar: radbrytningar mellan taggar och blanksteg', () => {
  assert.equal(norm('<p>a</p>\n  <p>b</p>'), '<p>a</p><p>b</p>');
  assert.equal(norm('  två   ord \r\n'), 'två ord');
  assert.equal(norm(null), '');
});

test('byggKarta: svensk text → översättning, lika ord samlas som samma, konflikt rapporteras', () => {
  const sv = { 'a.title': 'Hej', 'b.title': 'Kontakt', 'c.x': 'Hej', '_om': 'anteckning', 'd.tom': 'Tom', 'e.lista': 'Lista' };
  const nb = { 'a.title': 'Hei', 'b.title': 'Kontakt', 'c.x': 'Hallo', '_om': 'x', 'd.tom': '', 'e.lista': ['fel'] };
  const { karta, samma, konflikter } = byggKarta(sv, nb);
  assert.equal(karta.get('Hej'), 'Hei');            // första vinner
  assert.ok(samma.has('Kontakt'));
  assert.equal(karta.has('Kontakt'), false);
  assert.deepEqual(konflikter.map((k) => k.nyckel), ['c.x']);
  assert.equal(karta.has('Tom'), false);              // tom översättning = ingen
  assert.equal(karta.has('Lista'), false);            // icke-sträng = ingen
});

test('paraResurs matchar på VÄRDE och bär digesten från samma läsning', () => {
  const { karta } = byggKarta({ k: 'Fri frakt', h: '<p>Hej</p>' }, { k: 'Gratis frakt', h: '<p>Hei</p>' });
  const innehall = [
    { key: 'sections.hero.heading:abc', value: 'Fri frakt', digest: 'd1' },
    { key: 'body_html', value: '<p>Hej</p>\n', digest: 'd2' },
    { key: 'handle', value: 'fri-frakt', digest: 'd3' },
    { key: 'tom', value: '', digest: 'd4' },
  ];
  const { rader, kvar } = paraResurs(innehall, karta);
  assert.deepEqual(rader, [
    { key: 'sections.hero.heading:abc', value: 'Gratis frakt', digest: 'd1' },
    { key: 'body_html', value: '<p>Hei</p>', digest: 'd2' },
  ]);
  assert.deepEqual(kvar, [{ key: 'handle', value: 'fri-frakt' }]);
});

test('paraResurs hoppar över redan registrerad identisk rad men skickar om en outdated', () => {
  const { karta } = byggKarta({ a: 'Hej', b: 'Tack' }, { a: 'Hei', b: 'Takk' });
  const innehall = [
    { key: 'title', value: 'Hej', digest: 'd1' },
    { key: 'sub', value: 'Tack', digest: 'd2' },
  ];
  const befintliga = new Map([
    ['title', { value: 'Hei', outdated: false }],
    ['sub', { value: 'Takk', outdated: true }],
  ]);
  const { rader } = paraResurs(innehall, karta, befintliga);
  assert.deepEqual(rader, [{ key: 'sub', value: 'Takk', digest: 'd2' }]);
});

test('temaResursIds bygger JsonTemplate-/SectionGroup-id:n med theme_id ur fillistan', () => {
  const ids = temaResursIds('gid://shopify/OnlineStoreTheme/123', [
    'templates/index.json',
    'templates/product.json',
    'templates/product.liquid',
    'sections/header-group.json',
    'sections/main-product.liquid',
    'config/settings_data.json',
  ]);
  assert.deepEqual(ids, [
    'gid://shopify/OnlineStoreThemeJsonTemplate/index?theme_id=123',
    'gid://shopify/OnlineStoreThemeJsonTemplate/product?theme_id=123',
    'gid://shopify/OnlineStoreThemeSectionGroup/header-group?theme_id=123',
    'gid://shopify/OnlineStoreThemeSettingsDataSections/123',
  ]);
});

test('typUrResursId känner igen alla resurstyper kedjan översätter', () => {
  assert.equal(typUrResursId('gid://shopify/Product/1'), 'produkt');
  assert.equal(typUrResursId('gid://shopify/Metafield/1'), 'metafält');
  assert.equal(typUrResursId('gid://shopify/ProductOptionValue/1'), 'variant');
  assert.equal(typUrResursId('gid://shopify/OnlineStoreThemeJsonTemplate/index?theme_id=1'), 'temamall');
  assert.equal(typUrResursId('gid://shopify/OnlineStoreThemeSectionGroup/header-group?theme_id=1'), 'sektionsgrupp');
  assert.equal(typUrResursId('gid://shopify/OnlineStoreThemeSettingsDataSections/1'), 'temainställning');
  assert.equal(typUrResursId('gid://shopify/OnlineStoreThemeLocaleContent/1?theme_id=1'), 'temasträng');
  assert.equal(typUrResursId('gid://shopify/Metaobject/1'), 'paket');
  assert.equal(typUrResursId('gid://shopify/Collection/1'), 'kollektion');
  assert.equal(typUrResursId('gid://shopify/Link/1'), 'menylänk');
});

test('arLacka: tekniska värden, lika ord och Shopifys egna rader är inga läckor', () => {
  const samma = new Set(['Kontakt']);
  assert.equal(arLacka({ typ: 'temamall', key: 'x', value: 'shopify://shop_images/a.png' }, samma), false);
  assert.equal(arLacka({ typ: 'temamall', key: 'x', value: 'scheme-1' }, samma), false);
  assert.equal(arLacka({ typ: 'paket', key: 'rabattkod', value: 'ROD2A' }, samma), false);
  assert.equal(arLacka({ typ: 'menylänk', key: 'title', value: 'Kontakt' }, samma), false);
  assert.equal(arLacka({ typ: 'menylänk', key: 'title', value: 'Orders' }, samma), false);
  assert.equal(arLacka({ typ: 'policy', key: 'body', value: '<p>{{ shop.name }}</p>' }, samma), false);
  assert.equal(arLacka({ typ: 'variant', key: 'name', value: 'Default Title' }, samma), false);
  assert.equal(arLacka({ typ: 'produkt', key: 'title', value: 'Fiskespöhållare 4-Pack' }, samma), true);
  assert.equal(arLacka({ typ: 'temamall', key: 'x', value: 'Vad kunderna säger' }, samma), true);
});

test('landsnamn: kända koder på svenska, okända som versal kod', () => {
  assert.equal(landsnamn('no'), 'Norge');
  assert.equal(landsnamn('DK'), 'Danmark');
  assert.equal(landsnamn('xx'), 'XX');
});

// ---- oversattning.mjs --------------------------------------------------------

test('malltexter plockar text ur sektioner och block, hoppar layoutord, länkar och filer', () => {
  const mall = {
    sections: {
      hero: {
        type: 'image-banner',
        blocks: { h: { settings: { heading: 'Rubrik', heading_size: 'h1' } }, b: { settings: { button_label_1: 'Köp', button_link_1: 'shopify://collections/x' } } },
        settings: { image: 'shopify://shop_images/a.jpg', color_scheme: 'scheme-1', desktop_content_position: 'middle-center' },
      },
      usp: { settings: { items: 'truck:Fri frakt|shield:14 dagars ångerrätt', background: '#fff' } },
    },
    order: ['hero', 'usp'],
  };
  assert.deepEqual(malltexter('index', mall), {
    'index.sections.hero.blocks.h.settings.heading': 'Rubrik',
    'index.sections.hero.blocks.b.settings.button_label_1': 'Köp',
    'index.sections.usp.settings.items': 'truck:Fri frakt|shield:14 dagars ångerrätt',
  });
  // tål Shopifys /* kommentar */ överst i en JSON-sträng
  assert.deepEqual(malltexter('x', '/* notis */\n{"sections":{"a":{"settings":{"heading":"Hej"}}}}'), { 'x.sections.a.settings.heading': 'Hej' });
});

test('produktTexter nycklar per handle ur build-store-planen, aldrig Default Title', () => {
  const p = { produkt: { id: 'prylen', namn: 'Prylen' } };
  const plan = { input: { title: 'Prylen', descriptionHtml: '<p>x</p>', seo: { title: 'Prylen – B', description: 'd' }, productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }] } };
  assert.deepEqual(produktTexter(p, plan), {
    'produkt.prylen.title': 'Prylen',
    'produkt.prylen.body_html': '<p>x</p>',
    'produkt.prylen.meta_title': 'Prylen – B',
    'produkt.prylen.meta_description': 'd',
  });
  const plan2 = { input: { title: 'P', productOptions: [{ name: 'Variant', values: [{ name: 'Grå' }, { name: 'Svart' }] }] } };
  assert.equal(produktTexter(p, plan2)['produkt.prylen.variant.Grå'], 'Grå');
});

test('byggUnderlagObjekt: testbutiken ger stabila nycklar för produkt, metafält, sidor, meny och startsida', () => {
  const ctx = byggMinimalKontext(rabutik(), [raprodukt()]);
  const ut = byggUnderlagObjekt(ctx);
  assert.equal(ut['produkt.nackmagneten.title'], 'Nackmagneten');
  assert.ok(ut['produkt.nackmagneten.body_html'].startsWith('<p>'));
  // list-metafält står som JSON-sträng, samma form som i Shopify
  assert.ok(ut['metafalt.nackmagneten.opf.benefits'].startsWith('["'));
  assert.deepEqual(JSON.parse(ut['metafalt.nackmagneten.opf.faq'])[0] && Object.keys(JSON.parse(ut['metafalt.nackmagneten.opf.faq'])[0]), ['fraga', 'svar']);
  assert.equal('metafalt.nackmagneten.opf.gif_problem' in ut, false); // url-fält översätts aldrig
  assert.equal(ut['sida.returpolicy.title'], 'Returpolicy');
  assert.equal(ut['sida.contact.title'], 'Kontakt');
  assert.equal(ut['meny.main-menu.0'], 'Nackmagneten');
  assert.equal(ut['meny.footer.3'], 'Kontakt');
  assert.ok(Object.keys(ut).some((k) => k.startsWith('index.sections.')));
  assert.ok(Object.keys(ut).some((k) => k.startsWith('paket.')));
  assert.equal(ut['tema.share'], 'Dela');
  // Sticky-knappen, sidfotens rubrik och temats engelska defaults ska med —
  // matchningen sker på värde, så källtexten är exakt temats (AdventLane 2026-09-10).
  assert.equal(ut['tema.sticky'], 'Köp nu');
  // Trust-raden (custom_liquid) locale-branchas ur nb['liquid.trust.<i>'].
  assert.ok(/^Fri frakt/.test(ut['liquid.trust.0']), ut['liquid.trust.0']);
  assert.ok(/ångerrätt$/.test(ut['liquid.trust.1']), ut['liquid.trust.1']);
  assert.equal(ut['liquid.delivery.text'], 'Beräknad leverans');
  assert.equal(ut['tema.default.share'], 'Share');
  assert.equal(ut['tema.default.home_page'], 'Home page');
  assert.equal(ut['footer.sections.footer.blocks.foretaget.settings.heading'], 'Företaget');
  // enproduktsbutik: ingen kollektion
  assert.equal(Object.keys(ut).some((k) => k.startsWith('kollektion.')), false);
  // allt är strängar utom anteckningarna
  for (const [k, v] of Object.entries(ut)) if (!k.startsWith('_')) assert.equal(typeof v, 'string', k);
  if (ut._varningar) assert.ok(Array.isArray(ut._varningar));
});

test('byggUnderlagObjekt: flerproduktsbutik får kollektion, en menyrad per produkt och nycklar per handle', () => {
  const butik = rabutik();
  butik.butik.kollektion = { handle: 'sortimentet', titel: 'Sortimentet', beskrivning: '<p>Allt.</p>' };
  const p1 = raprodukt();
  const p2 = raprodukt();
  p2.produkt = { ...p2.produkt, id: 'andra-prylen', namn: 'Andra prylen' };
  const ut = byggUnderlagObjekt(byggMinimalKontext(butik, [p1, p2]));
  assert.equal(ut['kollektion.sortimentet.title'], 'Sortimentet');
  assert.equal(ut['kollektion.sortimentet.body_html'], '<p>Allt.</p>');
  assert.equal(ut['meny.main-menu.0'], 'Sortimentet');
  assert.equal(ut['meny.main-menu.1'], 'Nackmagneten');
  assert.equal(ut['meny.main-menu.2'], 'Andra prylen');
  assert.equal(ut['produkt.andra-prylen.title'], 'Andra prylen');
  assert.ok(ut['metafalt.andra-prylen.opf.problem_rubrik']);
});

test('byggUnderlagObjekt bär positioneringen som tema.settings.brand_description (läckte på /nb, TackleBay 2026-09-10)', () => {
  const butik = rabutik();
  butik.branding = { ...(butik.branding ?? {}), positionering: 'Fiskebutiken för den som redan har spöna' };
  const ut = byggUnderlagObjekt(byggMinimalKontext(butik, [raprodukt()]));
  assert.equal(ut['tema.settings.brand_description'], '<p>Fiskebutiken för den som redan har spöna</p>');
});

test('byggUnderlagObjekt kastar utan butik.id; underlagsfil pekar på output/<butik>/', () => {
  assert.throws(() => byggUnderlagObjekt({ butik: {} }), /butik\.id/);
  assert.match(underlagsfil('tacklebay', 'nb'), /output[\\/]tacklebay[\\/]oversattning-nb\.json$/);
});

// ---- oversattning-granska.mjs ------------------------------------------------

test('granskaNoder räknar källor/översatta, hoppar maskinvärden och räknar outdated som saknad', () => {
  const noder = [
    {
      resourceId: 'gid://shopify/Product/1',
      translatableContent: [
        { key: 'title', value: 'Prylen', digest: 'a' },
        { key: 'handle', value: 'prylen', digest: 'b' },
        { key: 'body_html', value: '<p>x</p>', digest: 'c' },
      ],
      translations: [{ key: 'title', value: 'Dingsen', outdated: false }, { key: 'body_html', value: '<p>y</p>', outdated: true }],
    },
    { resourceId: 'gid://shopify/Metafield/9', translatableContent: [{ key: 'value', value: 'cache', digest: 'd' }], translations: [] },
    { resourceId: 'gid://shopify/Metafield/10', namespace: 'opf', translatableContent: [{ key: 'value', value: 'Rubrik', digest: 'e' }], translations: [] },
  ];
  const r = granskaNoder(noder);
  assert.equal(r.kallor, 3);
  assert.equal(r.oversatta, 1);
  assert.deepEqual(r.saknade.map((s) => [s.key, s.outdated]), [['body_html', true], ['value', false]]);
  assert.equal(granskaNoder(noder, { allt: true }).kallor, 5);
  assert.equal(digestFor(noder, 'gid://shopify/Product/1', 'body_html'), 'c');
  assert.equal(digestFor(noder, 'gid://shopify/Product/2', 'title'), null);
});

test('filtreraPaTema behåller vårt tema och rader utan theme_id', () => {
  const noder = [
    { resourceId: 'gid://shopify/OnlineStoreThemeJsonTemplate/index?theme_id=1' },
    { resourceId: 'gid://shopify/OnlineStoreThemeJsonTemplate/index?theme_id=2' },
    { resourceId: 'gid://shopify/Page/5' },
  ];
  assert.deepEqual(filtreraPaTema(noder, 'gid://shopify/OnlineStoreTheme/1').map((n) => n.resourceId), [noder[0].resourceId, noder[2].resourceId]);
  assert.equal(filtreraPaTema(noder, null).length, 3);
});

test('arMaskinvarde och arAppcache', () => {
  assert.equal(arMaskinvarde('shopify://shop_images/a.png'), true);
  assert.equal(arMaskinvarde('{{ shop.name }}'), true);
  assert.equal(arMaskinvarde(''), true);
  assert.equal(arMaskinvarde('Hej'), false);
  assert.equal(arAppcache('gid://shopify/Metafield/1'), true);
  assert.equal(arAppcache('gid://shopify/Metafield/1', 'opf'), false);
  assert.equal(arAppcache('gid://shopify/Product/1'), false);
});

// ---- primärmarknaden -----------------------------------------------------------
//
// CatCabin 2026-09-11: Norge blev primärmarknad efter checklistans avsnitt 2 och
// varje variant blev otillgänglig i kundvyn, medan huvudmarknad-steget var grönt
// (det kontrollerade bara valutan). Ren logik över hamtaLage().marknader.

test('kontrolleraPrimarmarknad: rätt land grönt, fel land 🖐 med klicket, ingen primär 🖐', async () => {
  const { kontrolleraPrimarmarknad } = await import('../marknad.mjs');
  const m = (name, primary, koder) => ({ name, primary, conditions: { regionsCondition: { regions: { nodes: koder.map((code) => ({ code })) } } } });
  const ok = kontrolleraPrimarmarknad([m('Norge', false, ['NO']), m('Sweden', true, ['SE'])], 'SE');
  assert.equal(ok.ok, true);
  assert.equal(ok.primar.name, 'Sweden');

  const fel = kontrolleraPrimarmarknad([m('Norge', true, ['NO']), m('Sweden', false, ['SE'])], 'se');
  assert.equal(fel.ok, false);
  assert.match(fel.skal, /"Norge" \(NO\), inte SE/);
  assert.match(fel.skal, /Set as primary/);
  assert.match(fel.skal, /Kan inte sättas via API/);

  const ingen = kontrolleraPrimarmarknad([m('Norge', false, ['NO'])], 'SE');
  assert.equal(ingen.ok, false);
  assert.match(ingen.skal, /ingen marknad är markerad som primär/);

  assert.equal(kontrolleraPrimarmarknad([m('Sweden', true, ['SE'])], '').ok, false);
});
