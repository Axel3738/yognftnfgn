// Tester för empty-state-QA:n och det datadrivna temat. Ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from '../yaml.mjs';
import { sammanfoga } from '../butik.mjs';
import { validera } from '../validera.mjs';
import { byggForhandsvisning, kundUnderrubrik } from '../sida.mjs';
import { byggMetafalt } from '../metafalt.mjs';
import { SEKTIONER, SEKTIONSKRAV, sektionerSomVisas } from '../tema.mjs';
import { qaSektionsfiler, qaRenderadSida } from '../tema-qa.mjs';
import { dummy, rabutik } from './hjalp.mjs';

const MINIMAL = join(dirname(fileURLToPath(import.meta.url)), 'fixturer', 'minimal.yaml');
const minimal = () => sammanfoga(rabutik(), lasYaml(readFileSync(MINIMAL, 'utf8')));
const nycklar = (p) => byggMetafalt(p, { kundUnderrubrik }).map((m) => m.key);

// --- Mallfilerna ---

test('alla sektionsfiler passerar empty-state-QA', () => {
  assert.deepEqual(qaSektionsfiler(SEKTIONER), []);
});

test('varje sektion har ett dölj-krav registrerat', () => {
  for (const namn of Object.keys(SEKTIONER)) {
    const typ = namn.replace('sections/', '').replace('.liquid', '');
    assert.ok(typ in SEKTIONSKRAV, `${typ} saknas i SEKTIONSKRAV`);
  }
});

test('QA:n fångar en sektion utan villkor', () => {
  const fel = qaSektionsfiler({ 'sections/opf-dalig.liquid': '<div class="opf-sec"><h2>Rubrik</h2></div>\n{% schema %}{}{% endschema %}' });
  assert.ok(fel.some((f) => f.includes('villkor')));
});

test('QA:n fångar produkttext, platshållare och tomma knappar i mallen', () => {
  const fel = qaSektionsfiler({
    'sections/a.liquid': '{%- if x -%}<div>Nackmagneten löser nacken</div>{%- endif -%}{% schema %}{}{% endschema %}',
    'sections/b.liquid': '{%- if x -%}<div>lorem ipsum</div>{%- endif -%}{% schema %}{}{% endschema %}',
    'sections/c.liquid': '{%- if x -%}<div><a class="opf-cta"></a></div>{%- endif -%}{% schema %}{}{% endschema %}',
  });
  assert.ok(fel.some((f) => f.includes('specifik produkt')));
  assert.ok(fel.some((f) => f.includes('platshållartext')));
  assert.ok(fel.some((f) => f.includes('tom knapp')));
});

// --- Den renderade sidan ---

test('dummyproduktens sida passerar QA:n', () => {
  assert.deepEqual(qaRenderadSida(byggForhandsvisning(dummy())), []);
});

test('QA:n fångar undefined, tom bild, tom knapp och tom sektion', () => {
  assert.ok(qaRenderadSida('<p>pris: undefined kr</p>').length > 0);
  assert.ok(qaRenderadSida('<img src="">').some((f) => f.includes('bild')));
  assert.ok(qaRenderadSida('<a class="opf-cta"></a>').some((f) => f.includes('köpknapp')));
  assert.ok(qaRenderadSida('<section id="x"> </section>').some((f) => f.includes('sektion')));
  assert.ok(qaRenderadSida('<h2></h2>').some((f) => f.includes('rubrik')));
  assert.ok(qaRenderadSida('<p>Org.nr [FYLL I]</p>').some((f) => f.includes('platshållartext')));
});

// --- Minimal produkt: tomma sektioner ska försvinna, inte renderas tomma ---

test('minimala produkten validerar (bara kritiska fält)', () => {
  const { fel } = validera(minimal());
  assert.deepEqual(fel, []);
});

test('minimala produkten får inga metafält för det som saknas', () => {
  const n = nycklar(minimal());
  for (const saknat of ['reviews', 'faq', 'erbjudande', 'bundle', 'features']) {
    assert.ok(!n.includes(saknat), `${saknat} borde saknas`);
  }
  // Butikskonfigen bidrar ändå med frakt och garanti.
  assert.ok(n.includes('frakt'));
  assert.ok(n.includes('garantier'));
});

test('sektioner utan data döljer sig, resten visas', () => {
  const { visas, doljs } = sektionerSomVisas(nycklar(minimal()));
  // Minimal saknar beskrivning, media och faq — de blocken döljer sig.
  assert.deepEqual(doljs, ['opf-problem', 'opf-losning', 'opf-lifestyle', 'opf-faq']);
  assert.ok(visas.includes('opf-funktioner')); // benefits är kritiskt fält
  assert.ok(visas.includes('opf-garanti')); // butikens basgaranti ärvs
});

test('minimala produktens förhandsvisning saknar de tomma sektionerna och passerar QA:n', () => {
  const html = byggForhandsvisning(minimal());
  assert.deepEqual(qaRenderadSida(html), []);
  for (const id of ['opf-problem', 'opf-losning', 'opf-lifestyle', 'opf-faq']) {
    assert.ok(!html.includes(`id="${id}"`), `${id} borde inte renderas`);
  }
  assert.ok(html.includes('id="opf-hero"'));
  assert.ok(html.includes('id="opf-garanti"')); // butikens basgaranti ärvs
  assert.ok(!html.includes('källa:')); // interna källhänvisningen läcker inte
});

test('problem-sektionen i temat läser beskrivningens metafält och villkorar gif:en', () => {
  const liquid = SEKTIONER['sections/opf-problem.liquid'];
  assert.ok(liquid.includes('product.metafields.opf.problem_rubrik'));
  assert.ok(liquid.includes('product.metafields.opf.gif_problem'));
  assert.ok(liquid.includes('{%- if gif != blank -%}'));
});

test('garanti-sektionen i temat läser garantierna och renderar aldrig utan data', () => {
  const liquid = SEKTIONER['sections/opf-garanti.liquid'];
  assert.ok(liquid.includes('product.metafields.opf.garantier'));
  assert.ok(liquid.includes('{%- if garantier.size > 0 -%}'));
});
