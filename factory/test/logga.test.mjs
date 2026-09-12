// Tester för logga.mjs (settings-logiken) och logga-generera.mjs (SVG-källorna,
// utan sharp). Ingen nätverkstrafik. Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lasSettings, sattLoggaISettings, serialiseraSettings, STANDARDBREDD } from '../logga.mjs';
import { byggLoggaSvg, typsnittUrHandle, orddelar, VARIANTER } from '../logga-generera.mjs';
import { rabutik } from './hjalp.mjs';

const LOGO = 'shopify://shop_images/testbutiken-logga.png';
const FAV = 'shopify://shop_images/testbutiken-favicon.png';

test('lasSettings skalar av Shopifys /* kommentar */ överst', () => {
  const s = lasSettings('/*\n * Kommentar\n */\n{"current":{"logo":"x"},"presets":{}}');
  assert.equal(s.current.logo, 'x');
  assert.throws(() => lasSettings(null), /settings_data\.json/);
});

test('sattLoggaISettings sätter logo, favicon och bredd — resten orört', () => {
  const in_ = { current: { logo: 'shopify://shop_images/bas-temats.png', brand_description: 'kvar', logo_width: 90 }, presets: { a: 1 } };
  const ut = sattLoggaISettings(in_, { logo: LOGO, favicon: FAV, bredd: 160 });
  assert.equal(ut.current.logo, LOGO);
  assert.equal(ut.current.favicon, FAV);
  assert.equal(ut.current.logo_width, 160);
  assert.equal(ut.current.brand_description, 'kvar');
  assert.deepEqual(ut.presets, { a: 1 });
  // indata muteras inte
  assert.equal(in_.current.logo, 'shopify://shop_images/bas-temats.png');
});

test('bredd: angiven vinner, annars temats, annars standard', () => {
  assert.equal(sattLoggaISettings({ current: { logo_width: 120 } }, { logo: LOGO }).current.logo_width, 120);
  assert.equal(sattLoggaISettings({ current: {} }, { logo: LOGO }).current.logo_width, STANDARDBREDD);
  assert.equal(sattLoggaISettings({}, { logo: LOGO, bredd: '200' }).current.logo_width, 200);
  assert.equal(sattLoggaISettings({ current: { logo_width: 0 } }, { logo: LOGO }).current.logo_width, STANDARDBREDD);
});

test('utan favicon lämnas fältet orört; utan logga kastas', () => {
  const ut = sattLoggaISettings({ current: { favicon: 'gammal' } }, { logo: LOGO });
  assert.equal(ut.current.favicon, 'gammal');
  assert.throws(() => sattLoggaISettings({ current: {} }, { logo: null }), /Ingen logga/);
});

test('serialiseraSettings ger giltig JSON med radslut', () => {
  const text = serialiseraSettings({ current: { logo: LOGO } });
  assert.ok(text.endsWith('\n'));
  assert.equal(JSON.parse(text).current.logo, LOGO);
});

test('byggLoggaSvg ger tre varianter + favicon utan sharp, med brandnamnet i', () => {
  const jobb = byggLoggaSvg(rabutik());
  assert.deepEqual(jobb.map((j) => j.namn), ['logga-a', 'logga-b', 'logga-c', 'favicon']);
  assert.deepEqual(jobb.map((j) => j.px), [1024, 1024, 1024, 256]);
  for (const j of jobb) assert.ok(j.svg.startsWith('<svg'), j.namn);
  const brand = rabutik().butik.brand.toUpperCase();
  assert.ok(jobb[0].svg.includes(brand));
  assert.equal(byggLoggaSvg(rabutik(), { variant: 'b' }).length, 2);
  assert.equal(Object.keys(VARIANTER).join(''), 'abc');
});

test('typsnittUrHandle och orddelar', () => {
  assert.deepEqual(typsnittUrHandle('archivo_n7'), { familj: 'Archivo', vikt: 700 });
  assert.deepEqual(typsnittUrHandle('ibm_plex_sans_n6'), { familj: 'Ibm Plex Sans', vikt: 600 });
  assert.deepEqual(typsnittUrHandle(''), { familj: 'DejaVu Sans', vikt: 700 });
  assert.deepEqual(orddelar('TankGuard'), ['TANK', 'GUARD']);
  assert.deepEqual(orddelar('Hemvakten'), ['HEMVAKTEN']);
});

test('a är bandet och b den delade disken — inte emblemet och sigillet', () => {
  // ⚠️ Kompositionerna byttes 2026-09-12 (EdgeBench): de gamla a (emblem med
  // tunn ring) och b (sigill med tjock ring, ordmärket i två rader) hade
  // valts 0 gånger av 3 i factory/LOGGA-FEEDBACK.md. Testet finns för att
  // ingen ska råka lägga tillbaka dem utan att läsa feedbacken.
  const [a, b] = byggLoggaSvg(rabutik(), { motiv: 'egg' });
  const brand = rabutik().butik.brand.toUpperCase();
  // a: diagonalbandet i accentfärgen, ordmärket lutar med det
  assert.ok(a.svg.includes('rotate(-16 512 512)'), 'a saknar bandets lutning');
  assert.ok(a.svg.includes(brand), 'a bär ordmärket');
  assert.ok(!a.svg.includes('r="452"'), 'a ska inte ha emblemets tunna ring');
  // b: två fält med en accentskarv, ordmärket på EN rad
  assert.ok(b.svg.includes('y="596"'), 'b saknar skarven mellan fälten');
  assert.ok(!b.svg.includes('stroke-width="34"'), 'b ska inte ha sigillets tjocka ring');
  assert.equal(b.svg.match(new RegExp(brand, 'g')).length, 1, 'b bär ordmärket på en rad');
});

test('motiv egg: klingan ritas i alla tre varianter + favicon', () => {
  const jobb = byggLoggaSvg(rabutik(), { motiv: 'egg' });
  for (const j of jobb) assert.ok(j.svg.includes('class="egg"'), `${j.namn} saknar klingan`);
});

test('motiv koja: kojan ritas i alla tre varianter + favicon, och c blir motiv-ledd i stället för monogram', () => {
  const jobb = byggLoggaSvg(rabutik(), { motiv: 'koja' });
  for (const j of jobb) assert.ok(j.svg.includes('class="koja"'), `${j.namn} saknar kojan`);
  const c = jobb.find((j) => j.namn === 'logga-c').svg;
  const brand = rabutik().butik.brand.toUpperCase();
  assert.ok(c.includes(brand), 'c bär ordmärket');
  assert.ok(!c.includes('font-size="400"'), 'c ska inte rita monogrammet när brandet har ett eget motiv');
  // Standarddroppen ändrar inget: c är fortfarande monogrammet.
  const gammalC = byggLoggaSvg(rabutik(), { variant: 'c' })[0].svg;
  assert.ok(gammalC.includes('font-size="400"'));
  assert.throws(() => byggLoggaSvg(rabutik(), { motiv: 'hund' }), /Okänt motiv/);
});
