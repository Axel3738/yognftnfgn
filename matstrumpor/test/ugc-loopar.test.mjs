// UGC-looparna på matstrumpor.se (matstrumpor/ugc-loopar/live.mjs) — de rena byggarna.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { patchaBanner, patchaRichText, patchaIndex, accentRubrik, byggBeskrivning, byggTexter, byggKallor, ACCENT, utanBand, loopUrPoster, beskrivningsfel } from '../ugc-loopar/live.mjs';
import { loopar, filnamnFor } from '../ugc-loopar/filer.mjs';

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

test('beskrivningen: leverantörens webp ersatt, avslöjandet efter andra rubrikens stycke, inget band', () => {
  const ut = byggBeskrivning(BESKRIVNING, 'sv', filer);
  assert.equal((ut.match(/<video/g) ?? []).length, 2);
  assert.ok(!ut.includes('ezgif'));
  assert.ok(!ut.includes('ms-loop-mini'), 'bandet med tre små loopar är borttaget (Axel 2026-10-01)');
  assert.ok(ut.startsWith('<h3>'), 'beskrivningen börjar med sin egen text igen');
  assert.ok(ut.includes('aria-label="Lådan öppnas"'), 'webp:ens alt-text följer med till videon');
  assert.ok(ut.indexOf(filer.avslojandet.mp4, ut.indexOf('Text två.')) > 0, 'avslöjandet efter stycket under andra rubriken');
  assert.deepEqual(beskrivningsfel(ut, filer), []);
  assert.equal(byggBeskrivning(ut, 'sv', filer), ut, 'idempotent');
});

// Så som den låg live 2026-10-01 kväll: bandet överst (Shopify radbryter mellan rutorna) och v1-adresserna.
const GAMMAL = (lok) => `<style>.ms-loop-mini [data-t]::after{content:attr(data-t);display:block}</style>
<div class="ms-loop-mini" style="display:flex;gap:8px">
<div data-t="Lådan" style="flex:1 1 0"><video autoplay muted loop playsinline poster="https://cdn.shopify.com/s/files/1/x/files/ms-loop-ladan.jpg?v=1"><source src="https://cdn.shopify.com/videos/c/o/v/gammal1.mp4" type="video/mp4"></video></div>
<div data-t="Avslöjandet" style="flex:1 1 0"><video autoplay muted loop playsinline poster="https://cdn.shopify.com/s/files/1/x/files/ms-loop-avslojandet.jpg?v=1"><source src="https://cdn.shopify.com/videos/c/o/v/gammal2.mp4" type="video/mp4"></video></div>
<div data-t="Reaktionen" style="flex:1 1 0"><video autoplay muted loop playsinline poster="https://cdn.shopify.com/s/files/1/x/files/ms-loop-uppackningen.jpg?v=1"><source src="https://cdn.shopify.com/videos/c/o/v/gammal3.mp4" type="video/mp4"></video></div>
</div>
<h3>Rubrik ett</h3>
<p>Text ett.</p>
<div class="ms-loop-beskr" style="margin:14px 0 18px"><video autoplay muted loop playsinline poster="https://cdn.shopify.com/s/files/1/x/files/ms-loop-uppackningen.jpg?v=1" aria-label="${lok}"><source src="https://cdn.shopify.com/videos/c/o/v/gammal3.mp4" type="video/mp4"></video></div>
<h3>Ser ut som sushi. Är strumpor.</h3>
<p>Text två.</p>
<div class="ms-loop-beskr" style="margin:14px 0 18px"><video autoplay muted loop playsinline poster="https://cdn.shopify.com/s/files/1/x/files/ms-loop-avslojandet.jpg?v=1"><source src="https://cdn.shopify.com/videos/c/o/v/gammal2.mp4" type="video/mp4"></video></div>
<h3>Det här får du</h3>`;

test('beskrivningen som redan är live: bandet bort, looparna får filer.json:s adresser, texten orörd', () => {
  const ut = byggBeskrivning(GAMMAL('Lådan öppnas'), 'sv', filer);
  assert.ok(!ut.includes('ms-loop-mini') && !ut.includes('data-t='));
  assert.ok(!/gammal\d/.test(ut), 'inga gamla videoadresser kvar');
  assert.deepEqual(beskrivningsfel(ut, filer), []);
  assert.ok(ut.startsWith('<h3>Rubrik ett</h3>'));
  assert.ok(ut.includes('aria-label="Lådan öppnas"'));
  assert.equal(utanBand(ut), ut);
  assert.equal(byggBeskrivning(ut, 'sv', filer), ut, 'idempotent');
});

test('posterns filnamn ger loopen, med eller utan version', () => {
  assert.equal(loopUrPoster('https://cdn.shopify.com/s/files/1/x/files/ms-loop-uppackningen-v2.jpg?v=9'), 'uppackningen');
  assert.equal(loopUrPoster('https://cdn.shopify.com/s/files/1/x/files/ms-loop-strumpan-sv.jpg?v=9'), 'strumpan_sv');
  assert.equal(loopUrPoster('https://cdn.shopify.com/s/files/1/x/files/annat.jpg'), null);
});

test('beskrivningen: Katarina finns aldrig i produktbeskrivningen (den går inte att villkora på land)', () => {
  for (const html of [BESKRIVNING, GAMMAL('x')]) assert.ok(!/_sv|-sv\.|strumpan|reaktionen-sv|tamago/.test(byggBeskrivning(html, 'sv', filer)));
});

test('loopar.txt: nio kolumner, version ≥ 1, och filnamnet bär versionen från 2', () => {
  const l = loopar();
  assert.ok(l.some((x) => x.namn === 'plocka'));
  for (const x of l) assert.equal(filer[x.namn]?.v ?? 1, x.v, `filer.json bär inte ${x.namn} v${x.v} — kör filer.mjs --skarpt`);
  assert.equal(filnamnFor('uppackningen', 1, 'mp4'), 'ms-loop-uppackningen.mp4');
  assert.equal(filnamnFor('strumpan_sv', 2, 'jpg'), 'ms-loop-strumpan-sv-v2.jpg');
  assert.throws(() => loopar('rullen nathalie 0 2 0 0 720 2.0'), /nio kolumner/);
});

test('beskrivningen: stoppar hellre än att gissa när strukturen inte stämmer', () => {
  assert.throws(() => byggBeskrivning('<h3>A</h3><p>x</p>', 'sv', filer), /ezgif/);
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
  for (const n of ['avslojandet', 'rullen', 'uppackningen', 'plocka', 'ladan', 'soffan', 'strumpan_sv', 'reaktionen_sv', 'tamago_sv']) assert.ok(k.includes(`when '${n}'`));
});
