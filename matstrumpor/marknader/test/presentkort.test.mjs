// Tester för presentkort.mjs — utan nät. Fixturen är strumpornas product.json i MAIN-temat 2026-09-29, kortad.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { presentkortMall, kvarPaSidan, mainText, BLOCK, utanKommentar } from '../presentkort.mjs';

const PRODUKT = `/*
 * IMPORTANT: The contents of this file are auto-generated.
 */
${JSON.stringify({
  sections: {
    main: {
      type: 'main-product',
      blocks: {
        vendor: { type: 'text', settings: { text: '{{ product.vendor }}', text_style: 'uppercase' } },
        title: { type: 'title', settings: {} },
        judgeme_stjarnor: { type: 'shopify://apps/judge-me-reviews/blocks/preview_badge/x', settings: {} },
        price: { type: 'price', settings: {} },
        variant_picker: { type: 'variant_picker', settings: { picker_type: 'button' } },
        ms_storlek: { type: 'custom_liquid', settings: { custom_liquid: '<p class="ms-storlek">Passar strl 36–44 · stretchigt material</p>' } },
        buy_buttons: { type: 'buy_buttons', settings: { show_dynamic_checkout: false, show_gift_card_recipient: false } },
        ms_delivery: { type: 'custom_liquid', settings: { custom_liquid: 'Beräknad leverans' } },
        share: { type: 'share', settings: { share_label: 'Dela' } },
      },
      block_order: ['vendor', 'title', 'judgeme_stjarnor', 'price', 'variant_picker', 'ms_storlek', 'buy_buttons', 'ms_delivery', 'share'],
      settings: { media_size: 'medium', gallery_layout: 'thumbnail_slider' },
    },
    ms_faq_section: { type: 'ms-faq-section', blocks: {}, block_order: [] },
    judgeme_widget: { type: 'apps', blocks: {}, block_order: [] },
  },
  order: ['main', 'judgeme_widget', 'ms_faq_section'],
}, null, 2)}`;

test('presentkortets mall bär bara titel, pris och köpknappen — inga strumpblock, inga andra sektioner', () => {
  const { text, bortaBlock, bortaSektioner } = presentkortMall(PRODUKT);
  const j = JSON.parse(text);
  assert.deepEqual(j.order, ['main']);
  assert.deepEqual(j.sections.main.block_order, BLOCK);
  assert.deepEqual(Object.keys(j.sections.main.blocks).sort(), [...BLOCK].sort());
  assert.deepEqual(bortaBlock, ['judgeme_stjarnor', 'variant_picker', 'ms_storlek', 'ms_delivery', 'share']);
  assert.deepEqual(bortaSektioner, ['judgeme_widget', 'ms_faq_section']);
  assert.doesNotMatch(text, /36–44|Beräknad leverans|Dela/);
});

test('mottagarformuläret är alltid på och sektionens bildinställningar följer med', () => {
  const j = JSON.parse(presentkortMall(PRODUKT).text);
  assert.equal(j.sections.main.blocks.buy_buttons.settings.show_gift_card_recipient, true);
  assert.equal(j.sections.main.blocks.buy_buttons.settings.show_dynamic_checkout, false);
  assert.deepEqual(j.sections.main.settings, { media_size: 'medium', gallery_layout: 'thumbnail_slider' });
});

test('mallen stannar när strumpornas mall saknar ett block den behöver', () => {
  const trasig = utanKommentar(PRODUKT).replace('"buy_buttons": {', '"kop": {');
  assert.throws(() => presentkortMall(trasig), /saknar blocken buy_buttons/);
});

test('kontrollen läser bara sidinnehållet: annonsraden får säga fri frakt, sidan får inte', () => {
  const ren = '<div class="announcement">Fri frakt i hela Sverige</div><main id="MainContent"><h1>Presentkort</h1><p>150 kr</p></main>';
  assert.deepEqual(kvarPaSidan(ren), []);
  const smutsig = '<main><h1>Presentkort</h1><legend>Valörer</legend><p class="ms-storlek">Passar strl 36–44 · stretchigt material</p><script>var x = "Fri frakt";</script></main>';
  assert.deepEqual(kvarPaSidan(smutsig), ['36–44', 'Valörer']);
  assert.match(mainText(smutsig), /Presentkort/);
  assert.throws(() => kvarPaSidan('<div>ingen main</div>'), /saknar <main>/);
});

test('ätpinnarnas mall: strumpornas storleksrad, paketväljare och FAQ bort — resten av sidan kvar i samma ordning', async () => {
  const { tillbehorMall, STRUMPBLOCK, STRUMPSEKTIONER, PROFILER } = await import('../presentkort.mjs');
  const produkt = `/*\n * auto\n */\n${JSON.stringify({
    sections: {
      main: { type: 'main-product', settings: { media_size: 'large' }, block_order: ['vendor', 'title', 'price', 'ms_storlek', 'ms_sortval', 'ms_paket', 'buy_buttons', 'ms_trust', 'description'],
        blocks: { vendor: { type: 'text' }, title: { type: 'title' }, price: { type: 'price' }, ms_storlek: { type: 'custom_liquid' }, ms_sortval: { type: 'custom_liquid' }, ms_paket: { type: 'custom_liquid' }, buy_buttons: { type: 'buy_buttons', settings: {} }, ms_trust: { type: 'custom_liquid' }, description: { type: 'description' } } },
      judgeme_widget: { type: 'apps' }, ms_faq_section: { type: 'ms-faq-section' }, ms_sticky: { type: 'ms-sticky-atc' },
    },
    order: ['main', 'judgeme_widget', 'ms_faq_section', 'ms_sticky'],
  })}`;
  const r = tillbehorMall(produkt);
  const j = JSON.parse(r.text);
  assert.deepEqual(r.bortaBlock, STRUMPBLOCK);
  assert.deepEqual(r.bortaSektioner, STRUMPSEKTIONER);
  assert.deepEqual(j.sections.main.block_order, ['vendor', 'title', 'price', 'buy_buttons', 'ms_trust', 'description']);
  assert.ok(!j.sections.main.blocks.ms_storlek && !j.sections.ms_faq_section);
  assert.deepEqual(j.order, ['main', 'judgeme_widget', 'ms_sticky']);
  assert.equal(j.sections.main.settings.media_size, 'large');
  // Ingen mottagarformulär-inställning: ätpinnarna är ingen gåva som mejlas.
  assert.equal(j.sections.main.blocks.buy_buttons.settings.show_gift_card_recipient, undefined);
  assert.equal(PROFILER.atpinnar.presentkort, false);
  assert.equal(PROFILER.presentkort.mall, 'templates/product.presentkort.json');
});
