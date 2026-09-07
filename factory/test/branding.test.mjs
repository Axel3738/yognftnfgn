// Tester för brand-steget: varje butik brandas från noll ur sin egen config.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from '../yaml.mjs';
import { sammanfoga } from '../butik.mjs';
import { byggSidaHtml } from '../sida.mjs';
import {
  hamtaTokens,
  byggBrandCss,
  byggSettingsPatch,
  laggInBrandCss,
  valideraBranding,
  hexTillRgb,
  NEUTRAL,
} from '../branding.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const hemvakten = () => lasYaml(readFileSync(join(ROT, 'butiker', 'hemvakten.yaml'), 'utf8'));

test('utan branding används neutrala tokens — förra butikens look ärvs aldrig', () => {
  const t = hamtaTokens(null);
  assert.equal(t.farger.accent, NEUTRAL.farger.accent);
  const css = byggBrandCss(null);
  assert.ok(!css.includes('#dd821d'), 'matstrumpor-accenten får aldrig vara fallback');
  assert.ok(!css.includes('#DD821D'));
});

test('brand-css:en genereras ur butikens tokens och överstyr bastemats knapp', () => {
  const css = byggBrandCss(hemvakten().branding);
  assert.ok(css.includes('--ms-accent: #16324F'));
  assert.ok(css.includes('--ms-surface-2: #F5F7F9'));
  assert.ok(css.includes('.product-form__submit.button'));
  assert.ok(css.includes(`--color-button: ${hexTillRgb('#16324F')}`));
  assert.ok(!css.includes('\\'), 'backslash-escaper förvanskas på vägen till Shopify');
});

test('settings-patchen bygger alla sex färgscheman plus typsnitt och radier', () => {
  const patch = byggSettingsPatch(hemvakten().branding);
  assert.equal(Object.keys(patch.color_schemes).length, 6);
  assert.equal(patch.color_schemes['scheme-1'].settings.button, '#16324F');
  assert.equal(patch.color_schemes['scheme-6'].settings.background, '#0F1D2E');
  assert.equal(patch.type_header_font, 'ibm_plex_sans_n6');
  assert.equal(patch.type_body_font, 'ibm_plex_sans_n4');
  assert.equal(patch.buttons_radius, 6);
  assert.equal(patch.card_corner_radius, 10);
});

test('hexTillRgb räknar rätt', () => {
  assert.equal(hexTillRgb('#16324F'), '22, 50, 79');
  assert.equal(hexTillRgb('#FFFFFF'), '255, 255, 255');
});

test('brand-css:en läggs in sist i ms-head och aldrig två gånger', () => {
  const msHead = "{{ 'ms-cro.css' | asset_url | stylesheet_tag }}\n{{ 'ms-tema.css' | asset_url | stylesheet_tag }}";
  const en = laggInBrandCss(msHead);
  assert.ok(en.indexOf('opf-brand.css') > en.indexOf('ms-tema.css'));
  assert.equal(laggInBrandCss(en), en);
});

test('valideringen varnar på saknad branding och trasiga färger', () => {
  assert.ok(valideraBranding(null).some((v) => v.includes('neutrala')));
  const trasig = { positionering: 'x', tonalitet: 'x', kansla: 'x', farger: { accent: 'grön', mork: '#0F1D2E', text: '#111111' }, stil: {} };
  assert.ok(valideraBranding(trasig).some((v) => v.includes('ingen hex-färg')));
  assert.deepEqual(valideraBranding(hemvakten().branding), []);
});

test('förhandsvisningen tar sina tokens ur butikens branding', () => {
  const butik = hemvakten();
  const produkt = lasYaml(readFileSync(join(ROT, 'produkter', 'overvakningskameran.yaml'), 'utf8'));
  const html = byggSidaHtml(sammanfoga(butik, produkt));
  assert.ok(html.includes('--ms-accent: #16324F'));
  assert.ok(!html.includes('#dd821d'));
});
