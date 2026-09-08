// Tester för metafälten och temats sektioner. Ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kundUnderrubrik, byggKortBeskrivning } from '../sida.mjs';
import { byggMetafalt, snittbetyg } from '../metafalt.mjs';
import { byggJudgeMeCsv, byggJudgeMeAppCsv, judgeMeDatum, JUDGEME_KOLUMNER, JUDGEME_APP_KOLUMNER } from '../judgeme.mjs';
import { SEKTIONER, SEKTIONSORDNING_TEMA, byggProduktTemplate } from '../tema.mjs';
import { dummy, medButiksfrakt } from './hjalp.mjs';

const falt = (p) => Object.fromEntries(byggMetafalt(p, { kundUnderrubrik }).map((m) => [m.key, m]));

test('metafälten ligger i namespace opf med rätt typer', () => {
  const m = falt(dummy());
  assert.equal(m.benefits.namespace, 'opf');
  assert.equal(m.benefits.type, 'list.single_line_text_field');
  assert.equal(m.problem_rubrik.type, 'single_line_text_field');
  assert.equal(m.problem_text.type, 'multi_line_text_field');
  assert.equal(m.gif_problem.type, 'url');
  assert.equal(m.faq.type, 'json');
});

test('beskrivningsblockens metafält bär text och media ur produktfilen', () => {
  const m = falt(dummy());
  assert.equal(m.problem_rubrik.value, 'Klockan är 15 och nacken är redan stel.');
  assert.ok(m.gif_problem.value.endsWith('nackmagneten-problem.gif'));
  assert.ok(m.media_losning.value.endsWith('nackmagneten-losning.gif'));
  assert.ok(m.bild_lifestyle.value.endsWith('nackmagneten-soffa.jpg'));
});

test('recensioner blir ALDRIG ett metafält — de ägs av Judge.me', () => {
  const m = falt(dummy());
  assert.ok(!('reviews' in m));
});

test('listfält skickas som JSON-arrayer', () => {
  const m = falt(dummy());
  assert.deepEqual(JSON.parse(m.benefits.value), [
    'Löser upp spänningarna på 10 minuter hemma i soffan',
    'Engångskostnad i stället för återkommande massagebesök',
  ]);
});

// Fraktraderna kommer ur butikskonfigen, så testet ändrar den och inte produkten.
test('fraktraderna byggs av butikens betalda frakt och fri frakt-gräns', () => {
  const p = medButiksfrakt({
    leveranstid: '5–8 arbetsdagar',
    fri_globalt: false,
    standardpris: 39,
    fri_over: 499,
    express: { aktiv: true, namn: 'Express', pris: 99, tid: '1–2 arbetsdagar' },
  });
  assert.deepEqual(JSON.parse(falt(p).frakt.value), [
    'Leveranstid: 5–8 arbetsdagar',
    'Frakt: 39 kr',
    'Fri frakt över 499 kr',
    'Express: 99 kr, 1–2 arbetsdagar',
  ]);
});

test('fri frakt globalt skrivs ut som fri frakt, inte 0 kr', () => {
  const p = medButiksfrakt({ leveranstid: '5–8 arbetsdagar', fri_globalt: true });
  const rader = JSON.parse(falt(p).frakt.value);
  assert.ok(rader.includes('Fri frakt till alla länder'));
  assert.ok(!rader.some((r) => r.includes('0 kr')));
});

test('tomma fält skickas inte alls', () => {
  const p = dummy();
  p.features = [];
  p.media.bild_lifestyle = '';
  const m = falt(p);
  assert.ok(!('features' in m));
  assert.ok(!('bild_lifestyle' in m));
});

test('url-metafält kräver riktiga URL:er', () => {
  const p = dummy();
  p.media.gif_problem = 'inte-en-url.gif';
  assert.ok(!('gif_problem' in falt(p)));
});

test('snittbetyget räknas ur recensionerna', () => {
  assert.deepEqual(snittbetyg(dummy()), { snitt: 4.7, antal: 3 });
  assert.equal(snittbetyg({ reviews: [] }), null);
});

// --- Judge.me-underlaget ---

test('judgeme-csv har husets kolumner och en rad per recension', () => {
  const csv = byggJudgeMeCsv(dummy());
  const rader = csv.trim().split('\n');
  assert.equal(rader[0], JUDGEME_KOLUMNER.join(','));
  assert.equal(rader.length, 1 + 3);
  assert.ok(rader[1].includes('"Första natten på månader jag sovit utan värk."'));
  assert.ok(rader[1].includes('"Eva L."'));
});

test('judgeme-csv hittar aldrig på datum eller mejl — fälten lämnas tomma', () => {
  const csv = byggJudgeMeCsv(dummy());
  const kolumner = csv.trim().split('\n')[1].split('","');
  const datum = kolumner[JUDGEME_KOLUMNER.indexOf('review_date')];
  const mejl = kolumner[JUDGEME_KOLUMNER.indexOf('reviewer_email')];
  assert.equal(datum, '');
  assert.equal(mejl, '');
});

test('judgeme-csv klämmer betyg till 1–5 och citerar citattecken', () => {
  const p = dummy();
  p.reviews = [{ namn: 'X', betyg: 9, text: 'Sa "wow" direkt' }];
  const csv = byggJudgeMeCsv(p);
  assert.ok(csv.includes('"5"'));
  assert.ok(csv.includes('"Sa ""wow"" direkt"'));
});

test('judgeme-csv är null utan recensioner', () => {
  assert.equal(byggJudgeMeCsv({ produkt: { id: 'x' }, reviews: [] }), null);
});

// Appens importfil: originaldatum i dd/mm/yyyy, produkt-id + handle, och de
// översatta raderna i samma fil. Utan datum stoppar den — aldrig "nyss".
test('judgeme-app-csv skriver källans datum som dd/mm/yyyy med produkt-id och handle', () => {
  const p = { produkt: { id: 'tankoverdraget' }, reviews: [{ namn: 'Anders', betyg: 5, text: 'Bra', titel: 'Bra produkt', datum: '2026-08-10' }] };
  const csv = byggJudgeMeAppCsv(p, { produktId: '15989715108184', oversattningar: { nb: { 'recension.0.text': 'Bra trekk', 'recension.0.namn': 'Kari' } } });
  const rader = csv.trim().split('\n');
  assert.equal(rader[0], JUDGEME_APP_KOLUMNER.join(','));
  assert.equal(rader.length, 3);
  assert.ok(rader[1].includes('"10/08/2026"') && rader[1].includes('"15989715108184"') && rader[1].includes('"tankoverdraget"'));
  assert.ok(rader[2].includes('"Kari"') && rader[2].includes('"Bra trekk"') && rader[2].includes('"10/08/2026"'));
});

test('judgeme-app-csv stoppar på en recension utan originaldatum', () => {
  const p = { produkt: { id: 'x' }, reviews: [{ namn: 'Utan', betyg: 5, text: 'Hej' }] };
  assert.throws(() => byggJudgeMeAppCsv(p), /saknar originaldatum/);
  assert.equal(judgeMeDatum('2026-08-19T08:00:00.000Z'), '19/08/2026');
  assert.equal(judgeMeDatum('nyss'), null);
  assert.equal(judgeMeDatum('2026-13-01'), null);
});

// --- Temafilerna ---

test('sektionerna är exakt beskrivningsstrukturens sex filer', () => {
  assert.deepEqual(Object.keys(SEKTIONER).sort(), [
    'sections/opf-faq.liquid',
    'sections/opf-funktioner.liquid',
    'sections/opf-garanti.liquid',
    'sections/opf-lifestyle.liquid',
    'sections/opf-losning.liquid',
    'sections/opf-problem.liquid',
  ]);
  for (const [namn, innehall] of Object.entries(SEKTIONER)) {
    assert.ok(innehall.includes('{% schema %}'), `${namn} saknar schema`);
    assert.ok(/"name":\s*"OPF/.test(innehall), `${namn} saknar namn`);
  }
});

test('det finns ingen egen recensionssektion och ingen egen sticky', () => {
  assert.ok(!('sections/opf-reviews.liquid' in SEKTIONER));
  assert.ok(!('sections/opf-sticky-atc.liquid' in SEKTIONER));
  for (const innehall of Object.values(SEKTIONER)) {
    assert.ok(!innehall.includes('opf.reviews'), 'en sektion läser reviews-metafältet');
  }
});

test('sektionerna läser opf-metafälten och använder temats ms-klasser', () => {
  assert.ok(SEKTIONER['sections/opf-problem.liquid'].includes('product.metafields.opf.problem_rubrik'));
  assert.ok(SEKTIONER['sections/opf-losning.liquid'].includes('product.metafields.opf.media_losning'));
  assert.ok(SEKTIONER['sections/opf-faq.liquid'].includes('product.metafields.opf.faq'));
  for (const [namn, innehall] of Object.entries(SEKTIONER)) {
    assert.ok(innehall.includes('ms-scope'), `${namn} saknar ms-scope (temats designtokens)`);
  }
});

test('media-sektionerna döljer sig utan media i stället för att rendera trasigt', () => {
  const lifestyle = SEKTIONER['sections/opf-lifestyle.liquid'];
  assert.ok(/if bild != blank/.test(lifestyle));
  const problem = SEKTIONER['sections/opf-problem.liquid'];
  assert.ok(/if gif != blank/.test(problem), 'gif:en ska villkoras, aldrig tom src');
});

test('produkttemplaten lägger innehållsblocken efter main och FAQ:n efter Judge.me', () => {
  const original = JSON.stringify({
    sections: {
      main: { type: 'main-product', settings: {} },
      judgeme_widget: { type: 'apps', settings: {} },
      ms_sticky: { type: 'ms-sticky-atc', settings: {} },
    },
    order: ['main', 'judgeme_widget', 'ms_sticky'],
  });
  const ut = JSON.parse(byggProduktTemplate(original));
  assert.deepEqual(ut.order, [
    'main',
    'opf_problem',
    'opf_losning',
    'opf_funktioner',
    'opf_lifestyle',
    'opf_garanti',
    'judgeme_widget',
    'opf_faq',
    'ms_sticky',
  ]);
  assert.equal(ut.sections.ms_sticky.type, 'ms-sticky-atc');
});

test('produkttemplaten städar bort temats hårdkodade FAQ och gamla opf-sektioner', () => {
  const original = JSON.stringify({
    sections: {
      main: { type: 'main-product', settings: {} },
      ms_faq_section: { type: 'ms-faq-section', blocks: {}, settings: {} },
      opf_reviews: { type: 'opf-reviews', settings: {} },
    },
    order: ['main', 'opf_reviews', 'ms_faq_section'],
  });
  const ut = JSON.parse(byggProduktTemplate(original));
  assert.ok(!('ms_faq_section' in ut.sections));
  assert.ok(!('opf_reviews' in ut.sections));
  assert.equal(ut.order.filter((id) => id === 'opf_faq').length, 1);
});

test('produkttemplaten klarar Shopifys autogenererade kommentar och körs om utan dubbletter', () => {
  const original = `/*\n * auto-generated\n */\n${JSON.stringify({
    sections: { main: { type: 'main-product', settings: {} } },
    order: ['main'],
  })}`;
  const forsta = byggProduktTemplate(original);
  const andra = JSON.parse(byggProduktTemplate(forsta));
  assert.equal(andra.order.filter((id) => id === 'opf_faq').length, 1);
  assert.equal(andra.order.length, 1 + SEKTIONSORDNING_TEMA.length);
});

test('produktbeskrivningen är kort och dubblerar inte sektionerna', () => {
  const html = byggKortBeskrivning(dummy());
  assert.ok(html.includes('Stel nacke efter en dag vid skärmen'));
  assert.ok(!html.includes('Vanliga frågor'));
  assert.ok(!html.includes('opf-sticky'));
  assert.ok(html.length < 500);
});

test('sektionerna innehåller inga backslash-escaper', () => {
  // En CSS-escape som "\2212" blir "\\2212" på vägen genom JSON till Shopify
  // och renderas då som text. Använd literala tecken i stället.
  for (const [namn, innehall] of Object.entries(SEKTIONER)) {
    assert.ok(!innehall.includes('\\'), `${namn} innehåller en backslash`);
  }
});

test('hårdkodad icon-with-text plockas bort ur produktmallen', () => {
  const original = JSON.stringify({
    sections: {
      main: {
        type: 'main-product',
        blocks: {
          price: { type: 'price', settings: {} },
          'icon-row': { type: 'icon-with-text', settings: { heading_1: 'Fri frakt över 499 kr' } },
        },
        block_order: ['price', 'icon-row'],
        settings: {},
      },
    },
    order: ['main'],
  });
  const ut = JSON.parse(byggProduktTemplate(original));
  assert.ok(!('icon-row' in ut.sections.main.blocks));
  // Svensk varumärkes-strip (opf_svensk) läggs alltid till i main-blocken.
  assert.deepEqual(ut.sections.main.block_order, ['price', 'opf_svensk']);
});
