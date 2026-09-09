// Tester för startsidan (templates/index.json + sidfotens bolagsblock).
// Ren logik, ingen nätverkstrafik. Kör: node --test factory/test/*.test.mjs
//
// De tre första flyttades hit från yaml.test.mjs 2026-09-09 när modulen
// förenades (KEDJAN.md). Resten täcker kontraktet: hero-handle in/ut,
// footer-group rör bara bolagsblocket, inga butiksspecifika fallbacks.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from '../yaml.mjs';
import {
  byggStartsida,
  byggFooterGroup,
  startsideRader,
  bilderAttLaddaUpp,
  marknadsnamn,
  tillHtml,
  arBildhandle,
} from '../startsida.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const bygg = (...a) => JSON.parse(byggStartsida(...a));

const butikBas = () => ({
  butik: {
    brand: 'TestBay',
    bolagsnamn: 'TEST AB',
    orgnr: '556000-0001',
    supportmail: 'hello@testbay.se',
    huvudmarknad: 'Sverige',
    marknader: [{ land: 'NO', locale: 'nb', valuta: 'SEK' }],
    kollektion: { handle: 'sortimentet', titel: 'Sortimentet' },
  },
  frakt: { fri_globalt: true },
  retur: { angerratt_dagar: 14 },
  branding: { farger: { accent: '#123456', accent_text: '#FFFFFF' } },
  startsida: {},
});
const produkt = (id, reviews = []) => ({ produkt: { id, namn: id.toUpperCase() }, reviews });

test('startsidans stycken blir riktiga p-taggar, aldrig [object Object]', () => {
  const butik = { ...butikBas(), startsida: { berattelse: { rubrik: 'R', text: ['Ett: med kolon.', 'Två.'] } } };
  const json = bygg(butik, [produkt('a'), produkt('b')]);
  const text = json.sections.berattelse.blocks.t.settings.text;
  assert.ok(!text.includes('[object Object]'), text);
  assert.equal(text, '<p>Ett: med kolon.</p><p>Två.</p>');
});

test('flerproduktsbutik får kollektionen på startsidan, enproduktsbutik en produkt', () => {
  const butik = butikBas();
  const flera = bygg(butik, [produkt('a'), produkt('b')]);
  assert.ok(flera.order.includes('sortiment'));
  assert.ok(!flera.order.includes('produkt'));
  assert.equal(flera.sections.sortiment.settings.collection, 'sortimentet');
  assert.equal(flera.sections.hero.blocks.b.settings.button_link_1, 'shopify://collections/sortimentet');

  const ensam = bygg(butik, [produkt('a')]);
  assert.ok(ensam.order.includes('produkt'));
  assert.ok(!ensam.order.includes('sortiment'));
  assert.equal(ensam.sections.produkt.settings.product, 'a');
  // En enproduktsbutik länkar till produkten — den har ingen kollektion.
  assert.equal(ensam.sections.hero.blocks.b.settings.button_link_1, 'shopify://products/a');
});

test('omdömessektionen döljer sig när riktiga recensioner saknas', () => {
  const butik = butikBas();
  const utan = [produkt('a')];
  const med = [produkt('a', [{ namn: 'Daniel', betyg: 5, text: 'Stabil.' }])];
  assert.equal(bygg(butik, utan).sections.omdomen.settings.visible, false);
  const visad = bygg(butik, med);
  assert.equal(visad.sections.omdomen.settings.visible, true);
  assert.equal(visad.sections.omdomen.blocks.r1.settings.name, 'Daniel');
});

test('kollektionshandle som sträng (äldre ops.mjs) fungerar som förr', () => {
  const butik = { ...butikBas(), butik: { ...butikBas().butik, kollektion: undefined } };
  const json = bygg(butik, [produkt('a'), produkt('b')], 'prylarna');
  assert.equal(json.sections.sortiment.settings.collection, 'prylarna');
});

test('hero-handle från ops.mjs hamnar i temat; filnamn och URL gör det aldrig', () => {
  const handle = 'shopify://shop_images/hero_3ecbd654-1234.jpg';
  const butik = { ...butikBas(), startsida: { hero: { bild: 'https://cdn.example.com/files/hero.jpg' } } };

  // Handlen in → handlen ut.
  const med = bygg(butik, [produkt('a')], { hero: handle });
  assert.equal(med.sections.hero.settings.image, handle);

  // Utan handle: tom sträng = temats platshållare — aldrig käll-URL:en.
  const utan = bygg(butik, [produkt('a')], {});
  assert.equal(utan.sections.hero.settings.image, '');

  // En handle som redan står i konfigen duger.
  const ikonf = { ...butikBas(), startsida: { hero: { bild: handle } } };
  assert.equal(bygg(ikonf, [produkt('a')]).sections.hero.settings.image, handle);

  // Samma form för trygghet och galleri via `bilder`.
  const g = { ...butikBas(), startsida: { galleri: { rubrik: 'G', kolumner: [{ titel: 'Ett', bild: 'a.jpg' }, { titel: 'Två', bild: 'b.jpg' }] }, trygghet: { bild: 'c.jpg' } } };
  const json = bygg(g, [produkt('a')], { bilder: { trygghet: 'shopify://shop_images/c_1.jpg', galleri: ['shopify://shop_images/a_1.jpg'] } });
  assert.equal(json.sections.trygghet.settings.image, 'shopify://shop_images/c_1.jpg');
  assert.equal(json.sections.galleri.blocks.g1.settings.image, 'shopify://shop_images/a_1.jpg');
  assert.equal(json.sections.galleri.blocks.g2.settings.image, '', 'saknad handle = platshållare, aldrig filnamnet');
  assert.ok(json.order.includes('galleri'));
  assert.deepEqual(bilderAttLaddaUpp(g), { hero: null, trygghet: 'c.jpg', galleri: ['a.jpg', 'b.jpg'] });
  assert.ok(arBildhandle(handle));
  assert.ok(!arBildhandle('shopify://shop_images/utan-andelse'));
});

test('galleri och statement utelämnas när konfigen inte har dem', () => {
  const json = bygg(butikBas(), [produkt('a')]);
  assert.ok(!json.order.includes('galleri'));
  assert.ok(!json.order.includes('statement'));
  assert.ok(!json.order.includes('ms_faq'));
  // Ordningen är bas-temats, och varje sektion i order finns i sections.
  for (const id of json.order) assert.ok(json.sections[id], `sektionen ${id} saknas`);
  assert.deepEqual(json.order, ['hero', 'ms_usp', 'ms_marquee', 'produkt', 'berattelse', 'omdomen', 'trygghet', 'ms_guarantee']);
});

test('inga butiksspecifika fallbacks: accent ur branding, marknadstext ur marknader', () => {
  const json = bygg(butikBas(), [produkt('a')]);
  assert.equal(json.sections.ms_marquee.settings.background, '#123456');
  assert.equal(json.sections.ms_usp.settings.items, 'truck:Fri frakt – Sverige & Norge|shield:14 dagars ångerrätt');
  assert.match(json.sections.trygghet.blocks.t.settings.text, /Sverige och Norge/);

  // Utan branding: ingen färg alls i temat, aldrig en annan butiks hex.
  const utanFarg = { ...butikBas(), branding: null };
  const j2 = bygg(utanFarg, [produkt('a')]);
  assert.equal(j2.sections.ms_marquee.settings.background, undefined);
  assert.ok(!JSON.stringify(j2).includes('#D9A441'), 'TackleBays mässing får inte ligga i koden');

  // Marknadstexten följer konfigen — en butik med bara Danmark säger så.
  const dk = { ...butikBas(), butik: { ...butikBas().butik, marknader: [{ land: 'DK', locale: 'da' }] } };
  assert.deepEqual(marknadsnamn(dk), ['Sverige', 'Danmark']);
  assert.ok(!JSON.stringify(bygg(dk, [produkt('a')])).includes('Norge'));

  // Källbutikens ord får aldrig sitta i en neutral default.
  const allt = JSON.stringify(json);
  for (const ord of ['Matstrumpor', 'sushi', 'strumpor', 'presentklart', 'tusentals svenskar', 'Bästsäljaren']) {
    assert.ok(!allt.includes(ord), `källordet "${ord}" hittades`);
  }
});

test('produktetiketten sätts bara ur konfigen', () => {
  const utan = bygg(butikBas(), [produkt('a')]);
  assert.ok(!('etikett' in utan.sections.produkt.blocks));
  const med = bygg({ ...butikBas(), startsida: { produkt_etikett: 'Vandringsdamask' } }, [produkt('a')]);
  assert.equal(med.sections.produkt.blocks.etikett.settings.text, 'Vandringsdamask');
  assert.equal(med.sections.produkt.block_order[0], 'etikett');
});

test('footer-group rör bara bolagsblocket', () => {
  const befintlig = `/*\n * rör inte\n */\n${JSON.stringify({
    sections: {
      footer: {
        type: 'footer',
        blocks: {
          brand: { type: 'brand_information', settings: { heading: 'Om oss' } },
          snabblankar: { type: 'link_list', settings: { heading: 'Snabblänkar', menu: 'footer' } },
          foretaget: { type: 'text', settings: { heading: 'Företaget', subtext: '<p>Matstrumpor.se drivs av<br/>X</p><p>kundsupport@matstrumpor.se</p>' } },
        },
        block_order: ['brand', 'snabblankar', 'foretaget'],
        settings: { color_scheme: 'scheme-3' },
      },
      ms_cookies: { type: 'ms-cookies', settings: {} },
    },
    order: ['footer', 'ms_cookies'],
  })}`;
  const ut = JSON.parse(byggFooterGroup(befintlig, butikBas()));
  const f = ut.sections.footer;
  assert.equal(f.blocks.foretaget.settings.heading, 'Företaget');
  assert.equal(
    f.blocks.foretaget.settings.subtext,
    '<p>TestBay drivs av<br/>TEST AB<br/>Org.nr 556000-0001</p><p>hello@testbay.se</p>'
  );
  // Allt annat oförändrat: övriga block, block_order, sektionens settings, andra sektioner, order.
  assert.deepEqual(f.blocks.brand, { type: 'brand_information', settings: { heading: 'Om oss' } });
  assert.deepEqual(f.blocks.snabblankar.settings, { heading: 'Snabblänkar', menu: 'footer' });
  assert.deepEqual(f.block_order, ['brand', 'snabblankar', 'foretaget']);
  assert.deepEqual(f.settings, { color_scheme: 'scheme-3' });
  assert.deepEqual(ut.sections.ms_cookies, { type: 'ms-cookies', settings: {} });
  assert.deepEqual(ut.order, ['footer', 'ms_cookies']);
  assert.ok(!JSON.stringify(ut).includes('matstrumpor'));
});

test('tillHtml: stycken, färdig HTML och tomt', () => {
  assert.equal(tillHtml(['A', '', 'B']), '<p>A</p><p>B</p>');
  assert.equal(tillHtml('<p>Redan HTML</p>'), '<p>Redan HTML</p>');
  assert.equal(tillHtml('Rad ett\nRad två'), '<p>Rad ett</p><p>Rad två</p>');
  assert.equal(tillHtml(undefined), '');
});

test('DryTreks yaml bygger samma startsida som förr ur startsidor/drytrek.json', () => {
  const butik = lasYaml(readFileSync(join(ROT, 'butiker', 'drytrek.yaml'), 'utf8'));
  const p = lasYaml(readFileSync(join(ROT, 'produkter', 'damasker.yaml'), 'utf8'));
  const json = bygg(butik, [p], { hero: 'shopify://shop_images/benskydd-benskydd-08_abc.jpg' });
  assert.equal(json.sections.hero.blocks.h.settings.heading, 'Kilometer fyra. Fortfarande torra fötter.');
  assert.equal(json.sections.hero.settings.image, 'shopify://shop_images/benskydd-benskydd-08_abc.jpg');
  assert.equal(json.sections.produkt.settings.product, 'damasker');
  assert.equal(json.sections.produkt.blocks.etikett.settings.text, 'Vandringsdamask');
  assert.equal(json.sections.ms_marquee.settings.background, '#C25617');
  assert.equal(json.sections.galleri.block_order.length, 3);
  assert.equal(json.sections.galleri.settings.title, 'På tur, oavsett terräng');
  assert.equal(json.sections.ms_faq.block_order.length, 4);
  assert.match(json.sections.ms_faq.blocks.q1.settings.a, /^<p>Ja\. En storlek/);
  assert.equal(json.sections.statement.blocks.b.settings.button_link, 'shopify://products/damasker');
  assert.equal(json.sections.omdomen.settings.visible, false, 'damasker har noll riktiga recensioner');
  // Käll-URL:erna i konfigen skrivs aldrig in i temat.
  assert.ok(!JSON.stringify(json).includes('cdn.shopify.com'));
  assert.deepEqual(Object.keys(bilderAttLaddaUpp(butik)), ['hero', 'trygghet', 'galleri']);
  assert.equal(bilderAttLaddaUpp(butik).galleri.length, 3);
  const rader = startsideRader(butik, [p], {});
  assert.ok(rader.some((r) => r.includes('4 frågor')), rader.join('\n'));
});

test('butik-mall.yaml läses och ger en giltig startsida med neutrala defaults', () => {
  const mall = lasYaml(readFileSync(join(ROT, 'butik-mall.yaml'), 'utf8'));
  assert.ok(mall.startsida, 'mallen saknar startsida:-blocket');
  assert.ok(mall.butik.kollektion, 'mallen saknar kollektion:-blocket');
  const json = bygg({ ...mall, butik: { ...mall.butik, brand: 'Mallbutiken' } }, [produkt('a')]);
  assert.equal(json.sections.hero.blocks.h.settings.heading, 'Mallbutiken');
  assert.ok(!json.order.includes('galleri'));
  assert.ok(!json.order.includes('ms_faq'));
  assert.equal(json.sections.ms_guarantee.settings.title, '14 dagars ångerrätt');
});
