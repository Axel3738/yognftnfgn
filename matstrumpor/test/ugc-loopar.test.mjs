// UGC-looparna på matstrumpor.se (matstrumpor/ugc-loopar/live.mjs) — de rena byggarna.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { patchaBanner, patchaRichText, patchaIndex, accentRubrik, byggBeskrivning, byggTexter, byggKallor, ACCENT } from '../ugc-loopar/live.mjs';

const sprak = JSON.parse(readFileSync(new URL('../ugc-loopar/sprak.json', import.meta.url), 'utf8'));
const filer = JSON.parse(readFileSync(new URL('../ugc-loopar/filer.json', import.meta.url), 'utf8'));
const tema = (n) => readFileSync(new URL(`../ugc-loopar/tema/${n}`, import.meta.url), 'utf8');

const BESKRIVNING = `<h3>Rubrik ett</h3>
<p>Text ett.</p>
<p><img src="https://cdn.shopify.com/s/files/1/x/files/ezgif-abc.webp?v=1" alt="Lådan öppnas"></p>
<h3>Ser ut som sushi. Är strumpor.</h3>
<p>Text två.</p>
<h3>Det här får du</h3>
<ul><li>5 par</li></ul>`;

test('beskrivningen: band överst, leverantörens webp ersatt, avslöjandet efter andra rubrikens stycke', () => {
  const ut = byggBeskrivning(BESKRIVNING, 'sv', sprak, filer);
  assert.equal((ut.match(/<video/g) ?? []).length, 5);
  assert.ok(!ut.includes('ezgif'));
  assert.ok(ut.startsWith('<style>'), 'bandet ligger först');
  assert.ok(ut.includes('aria-label="Lådan öppnas"'), 'webp:ens alt-text följer med till videon');
  assert.ok(ut.indexOf(filer.avslojandet.mp4, ut.indexOf('Text två.')) > 0, 'avslöjandet efter stycket under andra rubriken');
  assert.equal(byggBeskrivning(ut, 'sv', sprak, filer), ut, 'idempotent');
});

test('beskrivningen: etiketterna är data-t, aldrig text (meta-beskrivningen tas ur texten)', () => {
  const ut = byggBeskrivning(BESKRIVNING, 'de', sprak, filer);
  const text = ut.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, '');
  assert.ok(!text.includes(sprak.de.ladan));
  assert.ok(ut.includes(`data-t="${sprak.de.ladan}"`));
});

test('beskrivningen: Katarina finns aldrig i produktbeskrivningen (den går inte att villkora på land)', () => {
  for (const l of Object.keys(sprak)) assert.ok(!/_sv|strumpan-sv|reaktionen-sv|tamago-sv/.test(byggBeskrivning(BESKRIVNING, l, sprak, filer)));
});

test('beskrivningen: stoppar hellre än att gissa när strukturen inte stämmer', () => {
  assert.throws(() => byggBeskrivning('<h3>A</h3><p>x</p>', 'sv', sprak, filer), /ezgif/);
});

test('ms-loop.liquid: en *_sv-loop byts utanför Sverige', () => {
  const s = tema('ms-loop.liquid');
  assert.match(s, /if ms_namn contains '_sv'/);
  assert.match(s, /unless localization\.country\.iso_code == 'SE' and request\.locale\.iso_code == 'sv'/);
  for (const n of ['ms-loop-band.liquid', 'ms-loop-grid.liquid']) {
    const sek = tema(n);
    const utanfor = sek.slice(sek.indexOf('{%- else -%}'), sek.indexOf('{%- endif -%}', sek.indexOf('{%- else -%}')));
    assert.ok(!/_sv/.test(utanfor), `${n}: else-grenen (utanför Sverige) bär ingen Katarina-loop`);
  }
});

test('temat: patcharna är idempotenta och stoppar utan ankare', () => {
  const banner = `{%- if section.settings.image != blank -%}\n    <div class="banner__media media x">\n</div>\n</div>\n\n{% schema %}\n{\n  "settings": [\n    {}\n  ]\n}\n{% endschema %}`;
  const b = patchaBanner(banner);
  assert.equal(patchaBanner(b), b);
  JSON.parse(b.slice(b.indexOf('{% schema %}') + 12, b.indexOf('{% endschema %}')));
  assert.throws(() => patchaBanner('ingen banner här {% schema %}'), /ankaret/);
  assert.throws(() => patchaRichText('ingen wrapper'), /ankaret/);
});

test('startsidan: AI-galleriet stängs av men står kvar, bandet kommer efter Trustpilot-raden', () => {
  const index = { sections: { hero: { type: 'image-banner', settings: {} }, trustpilot_rad: { type: 'ms-trustpilot' }, berattelse: { type: 'rich-text', settings: {}, blocks: { h: { settings: { heading: 'Strumpor man aldrig blandar ihop' } } } }, ugc_galleri: { type: 'multicolumn' }, ugc_markning: { type: 'custom-liquid' } }, order: ['hero', 'trustpilot_rad', 'berattelse', 'ugc_galleri', 'ugc_markning'] };
  const ut = patchaIndex(index);
  assert.deepEqual(ut.order, ['hero', 'trustpilot_rad', 'ms_loop_band', 'berattelse', 'ugc_galleri', 'ms_loop_grid', 'ugc_markning']);
  assert.equal(ut.sections.ugc_galleri.disabled, true);
  assert.equal(ut.sections.berattelse.blocks.h.settings.heading, 'Strumpor man <em>aldrig blandar ihop</em>');
  assert.equal(patchaIndex(ut), ut, 'idempotent');
});

test('rubrikens orange del finns för varje språk i sprak.json', () => {
  for (const l of Object.keys(sprak)) assert.ok(ACCENT[l], `ACCENT saknar ${l}`);
  assert.equal(accentRubrik('Socks you\'ll never mix up', 'en'), 'Socks you\'ll <em>never mix up</em>');
  assert.throws(() => accentRubrik('Något helt annat', 'en'));
});

test('texterna och källorna byggs för alla loopar och språk', () => {
  const t = byggTexter(sprak);
  for (const l of Object.keys(sprak).filter((x) => x !== 'sv')) assert.ok(t.includes(`{%- when '${l}' -%}`));
  const k = byggKallor(filer);
  for (const n of ['avslojandet', 'rullen', 'uppackningen', 'ladan', 'soffan', 'strumpan_sv', 'reaktionen_sv', 'tamago_sv']) assert.ok(k.includes(`when '${n}'`));
});
