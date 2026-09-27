// Testerna kör mot kopior av temats riktiga filer (fixturer/, lästa ur det
// publicerade temat 2026-09-27) — utan nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { byggIndex, byggFooter, NYCKLAR, FOOTER_OM_NYCKEL, FOOTER_FORETAG_TEXT, OM_OSS, MARKORER, HISTORIA_TEXT_START, HISTORIA_TEXT_OM_OSS } from '../innehall.mjs';
import { filerLika, omOssMall, temafiler, lagaMiljo } from '../publicera.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const strip = (s) => s.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
const lasFixtur = (f) => JSON.parse(strip(readFileSync(join(HAR, 'fixturer', f), 'utf8')));

test('startsidan: de tre sektionerna hamnar efter heron och bästsäljarna, resten står kvar', () => {
  const fore = lasFixtur('index.json');
  const ut = byggIndex(fore, { bild: 'shopify://shop_images/x.jpg' });
  const o = ut.order;
  assert.equal(o[0], 'slideshow');
  assert.equal(o[1], NYCKLAR.fortroende);
  assert.equal(o[o.indexOf('featured_collection_Vh7p9G') + 1], NYCKLAR.historia);
  assert.equal(o[o.indexOf('featured_collection_Vh7p9G') + 2], NYCKLAR.recensioner);
  assert.ok(o.indexOf(NYCKLAR.recensioner) < o.indexOf('featured_collections_qB4VFU'), 'recensionerna före kategorierna');
  assert.ok(o.indexOf('newsletter_QYB4M6') > o.indexOf(NYCKLAR.recensioner));
  for (const n of fore.order) assert.ok(o.includes(n), `${n} finns kvar`);
  assert.equal(ut.sections[NYCKLAR.historia].settings.bild, 'shopify://shop_images/x.jpg');
  assert.equal(ut.sections[NYCKLAR.historia].settings.knapp_lank, `/pages/${OM_OSS.handle}`);
  assert.deepEqual(fore.order.includes(NYCKLAR.historia), false, 'originalet rörs inte');
});

test('startsidan: körs den två gånger blir resultatet detsamma (idempotent)', () => {
  const en = byggIndex(lasFixtur('index.json'), { bild: null });
  const tva = byggIndex(en, { bild: null });
  assert.deepEqual(tva, en);
  assert.equal('bild' in tva.sections[NYCKLAR.historia].settings, false, 'ingen bild ⇒ inget bildfält');
});

test('startsidan: utan hero och bästsäljare läggs sektionerna före nyhetsbrevet', () => {
  const json = { sections: { a: { type: 'rich-text', settings: {} }, nb: { type: 'newsletter', settings: {} } }, order: ['a', 'nb'] };
  const ut = byggIndex(json);
  assert.deepEqual(ut.order, ['a', NYCKLAR.fortroende, NYCKLAR.historia, NYCKLAR.recensioner, 'nb']);
});

test('startsidan: fel form stoppar', () => {
  assert.throws(() => byggIndex({ sections: {} }), /ser inte ut som väntat/);
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

test('texten: inga tankstreck, ingen gammal adress, inget konkurrentnamn, Göteborg finns', () => {
  const allt = [HISTORIA_TEXT_START, HISTORIA_TEXT_OM_OSS, OM_OSS.body, FOOTER_FORETAG_TEXT].join('\n');
  assert.doesNotMatch(allt, /[—–]/, 'inga tankstreck');
  assert.doesNotMatch(allt, /Sjöhed|Harestad/);
  assert.doesNotMatch(allt, /Biltema/i, 'konkurrentens namn står inte på sajten');
  assert.match(allt, /Göteborg/);
  assert.match(OM_OSS.body, /kundsupport@baverbutiken\.se/);
});

test('temafilerna i repot finns och Om oss-mallen får bilden inlagd', () => {
  const filer = temafiler();
  for (const n of ['sections/bb-fortroende.liquid', 'sections/bb-historia.liquid', 'sections/bb-recensioner.liquid', 'templates/page.om-oss.json']) assert.ok(filer[n], n);
  for (const n of Object.keys(filer).filter((x) => x.endsWith('.liquid'))) assert.match(filer[n], /\{% schema %\}/);
  const mall = JSON.parse(omOssMall(filer['templates/page.om-oss.json'], 'shopify://shop_images/b.jpg'));
  assert.equal(mall.sections.historia.settings.bild, 'shopify://shop_images/b.jpg');
  assert.equal(mall.sections.historia.type, 'bb-historia');
  for (const m of MARKORER.omOss.filter((x) => x.startsWith('data-section-type'))) assert.ok(JSON.stringify(mall).includes(m.replace('data-section-type="', '').replace('"', '')), m);
});

test('filerLika: JSON jämförs tolkat (Shopifys kommentar ignoreras), Liquid exakt', () => {
  assert.equal(filerLika('templates/x.json', '/* auto */\n{"a":1}', '{ "a": 1 }\n'), true);
  assert.equal(filerLika('templates/x.json', '{"a":1}', '{"a":2}'), false);
  assert.equal(filerLika('sections/x.liquid', 'a', 'a'), true);
  assert.equal(filerLika('sections/x.liquid', 'a', 'a '), false);
});

test('lagaMiljo: den felstavade hemligheten kopieras till namnet klienten läser', () => {
  const env = { SHOPIFY_SECRET_ID_SE_BAVER_SE: 'h' };
  lagaMiljo(env);
  assert.equal(env.SHOPIFY_CLIENT_SECRET_SE_BAVER_SE, 'h');
  const env2 = { SHOPIFY_CLIENT_SECRET_SE_BAVER_SE: 'a', SHOPIFY_SECRET_ID_SE_BAVER_SE: 'b' };
  lagaMiljo(env2);
  assert.equal(env2.SHOPIFY_CLIENT_SECRET_SE_BAVER_SE, 'a', 'ett riktigt namn vinner');
});
