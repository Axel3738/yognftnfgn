// Testerna kör mot kopior av temats riktiga filer (fixturer/, lästa ur det
// publicerade temat 2026-09-27) — utan nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { byggIndex, byggFooter, byggOmOssMall, NYCKLAR, FOOTER_OM_NYCKEL, FOOTER_FORETAG_TEXT, OM_OSS, MARKORER, HISTORIA_TEXT, VARFOR_TEXT, VILKA_TEXT, recensionerSektion } from '../innehall.mjs';
import { filerLika, temafiler, lagaMiljo, kanonisk } from '../publicera.mjs';
import { valj, namnKort } from '../recensioner.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const strip = (s) => s.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
const lasFixtur = (f) => JSON.parse(strip(readFileSync(join(HAR, 'fixturer', f), 'utf8')));
const REC = [
  { id: 1, handle: 'superkoppling', produkt: 'Bäverkoppling', namn: 'Roger B.', betyg: 5, text: 'Kanon.', datum: '2026-09-01', verifierad: true },
  { id: 2, handle: 'bavertratt-tanka-utan-spill', produkt: 'Bävertratt', namn: 'Anna K.', betyg: 5, text: 'Inget spill.', datum: '2026-09-02', verifierad: false },
];

test('startsidan: sektionerna hamnar efter heron och bästsäljarna i rätt ordning, resten står kvar', () => {
  const fore = lasFixtur('index.json');
  const ut = byggIndex(fore, { bilder: { start: 'shopify://shop_images/x.jpg', omOss: 'shopify://shop_images/b.jpg' }, recensioner: REC });
  const o = ut.order;
  assert.equal(o[0], 'slideshow');
  assert.equal(o[1], NYCKLAR.fortroende);
  const b = o.indexOf('featured_collection_Vh7p9G');
  assert.deepEqual(o.slice(b + 1, b + 4), [NYCKLAR.recensioner, NYCKLAR.historia, NYCKLAR.varfor]);
  assert.ok(o.indexOf(NYCKLAR.varfor) < o.indexOf('featured_collections_qB4VFU'), 'historien före kategorierna');
  assert.ok(o.indexOf('newsletter_QYB4M6') > o.indexOf(NYCKLAR.varfor));
  for (const n of fore.order) assert.ok(o.includes(n), `${n} finns kvar`);
  assert.equal(ut.sections[NYCKLAR.historia].settings.bild, 'shopify://shop_images/x.jpg');
  assert.equal(ut.sections[NYCKLAR.varfor].settings.bild, 'shopify://shop_images/b.jpg');
  assert.equal(ut.sections[NYCKLAR.historia].settings.text, HISTORIA_TEXT, 'hela historien på startsidan');
  assert.equal(ut.sections[NYCKLAR.varfor].settings.vilka_text, VILKA_TEXT);
  assert.equal(ut.sections[NYCKLAR.recensioner].block_order.length, 2);
  assert.equal(ut.sections[NYCKLAR.recensioner].blocks.rec_1.settings.produkt, 'superkoppling');
  assert.equal(ut.sections[NYCKLAR.recensioner].blocks.rec_2.settings.verifierad, false);
  assert.deepEqual(fore.order.includes(NYCKLAR.historia), false, 'originalet rörs inte');
});

test('startsidan: körs den två gånger blir resultatet detsamma (idempotent), utan bild inget bildfält', () => {
  const en = byggIndex(lasFixtur('index.json'), { recensioner: REC });
  const tva = byggIndex(en, { recensioner: REC });
  assert.deepEqual(tva, en);
  assert.equal('bild' in tva.sections[NYCKLAR.historia].settings, false);
  assert.equal('bild' in tva.sections[NYCKLAR.varfor].settings, false);
});

test('startsidan: utan hero och bästsäljare läggs sektionerna före nyhetsbrevet', () => {
  const json = { sections: { a: { type: 'rich-text', settings: {} }, nb: { type: 'newsletter', settings: {} } }, order: ['a', 'nb'] };
  const ut = byggIndex(json);
  assert.deepEqual(ut.order, ['a', NYCKLAR.fortroende, NYCKLAR.recensioner, NYCKLAR.historia, NYCKLAR.varfor, 'nb']);
});

test('startsidan: fel form stoppar', () => {
  assert.throws(() => byggIndex({ sections: {} }), /ser inte ut som väntat/);
});

test('recensionsblocket: ett kort per recension, trasiga rader hoppas, texten oförändrad', () => {
  const s = recensionerSektion([...REC, { id: 3, handle: '', text: 'x' }, { id: 4, handle: 'a', text: '' }]);
  assert.equal(s.block_order.length, 2);
  assert.equal(s.blocks.rec_1.settings.text, 'Kanon.');
  assert.equal(s.settings.visa_karusell, false);
  assert.equal(recensionerSektion([]).block_order.length, 0);
});

test('urvalet ur Judge.me: bara publicerade 5-stjärniga med text, en per produkt, verifierade först, aldrig leveransklagomål', () => {
  const r = (n, extra) => ({ id: n, published: true, hidden: false, curated: 'ok', rating: 5, product_handle: `p${n}`, product_title: `Produkt ${n}`, body: 'Riktigt bra pryl som gör precis det den ska, rekommenderas varmt till alla.', verified: 'nothing', source: 'web', has_published_pictures: false, created_at: '2026-09-0' + (n % 9 + 1), reviewer: { name: 'Anna Karlsson' }, ...extra });
  const alla = [
    r(1, {}), r(2, { verified: 'buyer' }), r(3, { product_handle: 'p2', verified: 'buyer', created_at: '2026-09-09' }),
    r(4, { rating: 4 }), r(5, { published: false }), r(6, { body: 'Bra' }), r(7, { body: 'Tog ett tag innan jag fick det, annars bra.' }),
    r(8, { product_title: 'Judge.me Shop Reviews', product_handle: '' }), r(9, { curated: 'spam' }),
  ];
  const ut = valj(alla, { antal: 12 });
  assert.deepEqual(ut.map((x) => x.id), [3, 1], 'verifierad först, en per produkt, resten bort');
  assert.equal(ut[0].verifierad, true);
  assert.equal(ut[0].namn, 'Anna K.');
  assert.equal(valj(alla, { antal: 1 }).length, 1);
  assert.equal(namnKort('roger'), 'Roger');
  assert.equal(namnKort(''), 'Kund');
});

test('om oss-mallen byggs ur samma sektioner, utan knappar och med bilderna', () => {
  const m = byggOmOssMall({ bilder: { start: 'shopify://shop_images/x.jpg', omOss: 'shopify://shop_images/b.jpg' }, recensioner: REC });
  assert.deepEqual(m.order, ['historia', 'varfor', 'fortroende', 'recensioner']);
  assert.equal(m.sections.historia.settings.knapp_text, '');
  assert.equal(m.sections.varfor.settings.knapp_text, '');
  assert.equal(m.sections.historia.settings.bild, 'shopify://shop_images/x.jpg');
  assert.equal(m.sections.varfor.settings.bild, 'shopify://shop_images/b.jpg');
  assert.equal(m.sections.historia.settings.overrad, 'Om Bäverbutiken');
  for (const mk of MARKORER.omOss.filter((x) => x.startsWith('data-section-type'))) assert.ok(JSON.stringify(m).includes(mk.replace('data-section-type="', '').replace('"', '')), mk);
});

test('sidfoten: nytt Om-block, adressen i företagsblocket, bredderna går jämnt ut', () => {
  const ut = byggFooter(lasFixtur('settings_data.json'));
  const f = ut.current.sections.footer;
  assert.equal(f.blocks[FOOTER_OM_NYCKEL].type, 'custom');
  assert.match(f.blocks[FOOTER_OM_NYCKEL].settings.text, /Läs vår historia/);
  assert.match(f.blocks[FOOTER_OM_NYCKEL].settings.text, new RegExp(`/pages/${OM_OSS.handle}`));
  assert.equal(f.blocks.custom_6fi8YE.settings.text, FOOTER_FORETAG_TEXT);
  assert.match(FOOTER_FORETAG_TEXT, /Stenkolsgatan 1B/);
  assert.doesNotMatch(FOOTER_FORETAG_TEXT, /Sjöhed/);
  const rad1 = f.block_order.slice(0, 4).reduce((s, id) => s + f.blocks[id].settings.container_width, 0);
  assert.equal(rad1, 100);
  assert.equal(f.blocks[f.block_order[4]].type, 'logo_social');
  assert.equal(f.blocks['1494292487693'].settings.title, 'Bäverbutikens kundklubb', 'BODYSHAPER CLUB byts');
});

test('sidfoten: idempotent och stoppar på fel form', () => {
  const en = byggFooter(lasFixtur('settings_data.json'));
  assert.deepEqual(byggFooter(en), en);
  assert.throws(() => byggFooter({ current: {} }), /ser inte ut som väntat/);
});

test('texten: inga tankstreck, ingen gammal adress, inget konkurrentnamn, Göteborg finns, rätt ordning på produkterna', () => {
  const allt = [HISTORIA_TEXT, VARFOR_TEXT, VILKA_TEXT, OM_OSS.body, FOOTER_FORETAG_TEXT].join('\n');
  assert.doesNotMatch(allt, /[—–]/, 'inga tankstreck');
  assert.doesNotMatch(allt, /Sjöhed|Harestad/);
  assert.doesNotMatch(allt, /Biltema/i, 'konkurrentens namn står inte på sajten');
  assert.match(allt, /Göteborg/);
  assert.match(VILKA_TEXT, /kundsupport@baverbutiken\.se/);
  assert.ok(HISTORIA_TEXT.indexOf('Bäverlampan') < HISTORIA_TEXT.indexOf('Bävertratten'), 'lampan kom före tratten (Shopify: 2026-03-03 mot 2026-04-02)');
  assert.doesNotMatch(HISTORIA_TEXT, /över 250/, 'sajten räknar 240+, texten säger över 200');
});

test('temafilerna i repot finns, har schema, och den gamla mallfilen är borta (mallen byggs ur innehall.mjs)', () => {
  const filer = temafiler();
  for (const n of ['sections/bb-fortroende.liquid', 'sections/bb-historia.liquid', 'sections/bb-varfor.liquid', 'sections/bb-recensioner.liquid']) assert.ok(filer[n], n);
  for (const n of Object.keys(filer).filter((x) => x.endsWith('.liquid'))) assert.match(filer[n], /\{% schema %\}/);
  assert.equal(Object.keys(filer).some((x) => x.startsWith('templates/')), false);
  assert.match(filer['sections/bb-recensioner.liquid'], /Verifierat köp/);
  assert.match(filer['sections/bb-recensioner.liquid'], /all_products\[block\.settings\.produkt\]/);
});

test('filerLika: JSON jämförs tolkat oavsett nyckelordning (Shopifys kommentar ignoreras), Liquid exakt', () => {
  assert.equal(filerLika('templates/x.json', '/* auto */\n{"a":1,"b":{"c":2,"d":3}}', '{ "b": { "d": 3, "c": 2 }, "a": 1 }\n'), true);
  assert.equal(filerLika('templates/x.json', '{"a":1}', '{"a":2}'), false);
  assert.equal(filerLika('sections/x.liquid', 'a', 'a'), true);
  assert.equal(filerLika('sections/x.liquid', 'a', 'a '), false);
  assert.equal(kanonisk({ b: [1, { z: 1, a: 2 }], a: 'x' }), '{"a":"x","b":[1,{"a":2,"z":1}]}');
});

test('lagaMiljo: den felstavade hemligheten kopieras till namnet klienten läser', () => {
  const env = { SHOPIFY_SECRET_ID_SE_BAVER_SE: 'h' };
  lagaMiljo(env);
  assert.equal(env.SHOPIFY_CLIENT_SECRET_SE_BAVER_SE, 'h');
  const env2 = { SHOPIFY_CLIENT_SECRET_SE_BAVER_SE: 'a', SHOPIFY_SECRET_ID_SE_BAVER_SE: 'b' };
  lagaMiljo(env2);
  assert.equal(env2.SHOPIFY_CLIENT_SECRET_SE_BAVER_SE, 'a', 'ett riktigt namn vinner');
});
