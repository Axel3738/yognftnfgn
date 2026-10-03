// Tester för paket-b-sushi.mjs — pakettestets B-block bara på sushisidan (Matstrumpor, 2026-10-03).
// Inget nät: patchen körs på mallen som den såg ut när felet mättes (samma två custom_liquid-strängar).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { patcha, avpatcha, giltigMall, bytExakt, MARKE, SUSHI_PRODUKT, SUSHI_VARIANT } from '../paket-b-sushi.mjs';

const MALL = `/*
 * IMPORTANT: The contents of this file are auto-generated.
 */
{
  "sections": {
    "main": {
      "type": "main-product",
      "blocks": {
        "ms_paket": {
          "type": "custom_liquid",
          "settings": {
            "custom_liquid": "{%- if localization.country.iso_code == 'SE' -%}<div data-ms-ab=\\"paket:a\\">{% render 'ms-paket', product: product, section_id: section.id, variant: 'a' %}</div>{%- else -%}<div>{% render 'ms-paket', product: product, section_id: section.id, variant: 'a' %}</div>{%- endif -%}"
          }
        },
        "ms_paket_b": {
          "type": "custom_liquid",
          "settings": {
            "custom_liquid": "{%- if localization.country.iso_code == 'SE' -%}<div data-ms-ab=\\"paket:b\\" hidden>{% render 'ms-paket', product: product, section_id: block.id, variant: 'paket-b', fast_variant: 52506473365843 %}</div>{%- endif -%}"
          }
        }
      },
      "block_order": ["ms_paket", "ms_paket_b"]
    }
  },
  "order": ["main"]
}
`;

function liquid(kod, block) {
  return JSON.parse(kod.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '')).sections.main.blocks[block].settings.custom_liquid;
}

test('patchen lägger "och sidan är sushin" på båda blocken och rör inget annat', () => {
  const r = patcha(MALL);
  assert.deepEqual(r.hoppade, []);
  assert.equal(r.byten.length, 2);
  assert.ok(giltigMall(r.kod));
  const a = liquid(r.kod, 'ms_paket');
  const b = liquid(r.kod, 'ms_paket_b');
  assert.ok(a.startsWith(`{%- if localization.country.iso_code == 'SE' and product.id == ${SUSHI_PRODUKT} -%}<div data-ms-ab="paket:a">`));
  assert.ok(a.includes(`{%- else -%}<div>{% render 'ms-paket', product: product, section_id: section.id, variant: 'a' %}</div>{%- endif -%}`), 'andra sorter visar väljaren för alla');
  assert.ok(b.startsWith(`{%- if localization.country.iso_code == 'SE' and product.id == ${SUSHI_PRODUKT} -%}<div data-ms-ab="paket:b" hidden>`));
  assert.ok(b.includes(`fast_variant: ${SUSHI_VARIANT}`), 'testets B köper fortfarande 5-parslådan på sushisidan');
  assert.equal(r.kod.split(MARKE).length - 1, 2);
});

test('idempotent och går att backa exakt', () => {
  const en = patcha(MALL);
  const tva = patcha(en.kod);
  assert.deepEqual(tva.byten, []);
  assert.deepEqual(tva.hoppade, ['redan patchad']);
  assert.equal(tva.kod, en.kod);
  const tillbaka = avpatcha(en.kod);
  assert.equal(tillbaka.kod, MALL);
  assert.deepEqual(avpatcha(MALL).hoppade, ['inte patchad']);
});

test('vägrar en mall som inte ser ut som när felet mättes', () => {
  assert.throws(() => patcha(MALL.replace('fast_variant: 52506473365843', 'fast_variant: 1')), /fast_variant/);
  assert.throws(() => patcha(MALL.replace(`<div data-ms-ab=\\"paket:a\\">`, '<div>')), /hittades 0 gånger/);
  assert.throws(() => bytExakt('a a', 'a', 'b', 1), /hittades 2 gånger/);
});

test('giltigMall läser förbi Shopifys kommentarshuvud och fäller trasig JSON', () => {
  assert.ok(giltigMall(MALL));
  assert.ok(!giltigMall(MALL.replace('"order"', 'order')));
});
