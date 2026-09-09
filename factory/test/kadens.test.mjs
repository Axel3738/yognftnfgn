// Tester för produktionstakten. Kör: node --test factory/test/*.test.mjs
//
// Axels tal 2026-09-09: 7 videor per dag per OPS-butik, hälften nya koncept
// och hälften varianter av det som redan vunnit, en redigerare per butik.
// Testerna vaktar två saker som är lätta att tappa: att en variant alltid
// pekar på en NAMNGIVEN förälder, och att ett koncept utan källa märks som
// gissning i stället för att smyga med som om det vore grundat.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  byggKadens, delaHalvor, delaNamn, variantnamn, skrivKadens,
  VIDEOR_PER_DAG, RONDDAGAR, VARIABLER, KONCEPTKALLOR,
} from '../kadens.mjs';

const vinnare = (namn, extra = {}) => ({ namn, kop: 12, cpa: 180, vinstbidrag: 4300, ...extra });
const koncept = (ide, typ, referens) => ({ ide, kalla: { typ, referens } });

// ------------------------------------------------------------------ halvorna

test('Axels tal: 7 per dag i 3 dagar = 21 per rond', () => {
  assert.equal(VIDEOR_PER_DAG, 7);
  assert.equal(RONDDAGAR, 3);
  const plan = byggKadens({ vinnare: [vinnare('a_b_pain_ugc_hook_v1')] });
  assert.equal(plan.total, 21);
  assert.equal(plan.perDagText, '7 videor/dag × 3 dagar');
});

test('udda total: den extra platsen går till VARIANTHALVAN', () => {
  const h = delaHalvor(21, true);
  assert.equal(h.varianter, 11);
  assert.equal(h.koncept, 10);
  assert.equal(h.extraTill, 'varianter');
  assert.equal(h.varianter + h.koncept, 21);
});

test('jämn total delas exakt i två, och ingen halva pekas ut', () => {
  const h = delaHalvor(20, true);
  assert.equal(h.varianter, 10);
  assert.equal(h.koncept, 10);
  assert.equal(h.extraTill, null);
});

test('utan bevisad vinnare blir HELA ronden nya koncept', () => {
  // Det finns inget att iterera på, och en "variant" utan förälder vore en
  // gissning med finare namn.
  const h = delaHalvor(21, false);
  assert.equal(h.varianter, 0);
  assert.equal(h.koncept, 21);

  const plan = byggKadens({ vinnare: [] });
  assert.equal(plan.varianter.length, 0);
  assert.equal(plan.nyaKoncept.length, 21);
  assert.ok(plan.varningar.some((v) => /Ingen bevisad vinnare/.test(v)));
});

test('delaHalvor vägrar en total som inte är ett heltal > 0', () => {
  assert.throws(() => delaHalvor(0, true), /heltal > 0/);
  assert.throws(() => delaHalvor(-3, true), /heltal > 0/);
  assert.throws(() => delaHalvor(2.5, true), /heltal > 0/);
});

// ------------------------------------------------------------------ namnen

test('delaNamn läser namnkonventionens sex fält', () => {
  const d = delaNamn('MAGI_brush_pain_beforeafter_stains_v1');
  assert.deepEqual(d, { brand: 'MAGI', produkt: 'brush', angle: 'pain', format: 'beforeafter', hook: 'stains', marknad: null, version: 1 });
});

test('delaNamn känner igen marknadskoden och vägrar namn utanför konventionen', () => {
  const no = delaNamn('GRILL_mastern_pain_comparison_ruinsgrill_no_v1');
  assert.equal(no.marknad, 'no');
  assert.equal(no.hook, 'ruinsgrill');
  // Namn från tiden före konventionen finns i kontot — de ska ge null, inte
  // en gissad uppdelning.
  assert.equal(delaNamn('Annons 1 kopia (2)'), null);
  assert.equal(delaNamn('HEIMGUARD_SALES_20260910'), null);
  assert.equal(delaNamn(''), null);
  assert.equal(delaNamn(null), null);
});

test('en variant byter ETT fält och får ett nytt namn — föräldern döps aldrig om', () => {
  // naming-convention regel 2 (en variabel i taget) och regel 3 (döp aldrig om
  // en annons som fått data).
  const n = variantnamn('MAGI_brush_pain_beforeafter_stains_v1', 'hook', 'grossout');
  assert.equal(n.namn, 'MAGI_brush_pain_beforeafter_grossout_v1');
  assert.equal(n.skal, null);

  const angle = variantnamn('MAGI_brush_pain_beforeafter_stains_v1', 'angle', 'social');
  assert.equal(angle.namn, 'MAGI_brush_social_beforeafter_stains_v1');

  // Marknadskoden följer med.
  const no = variantnamn('GRILL_mastern_pain_comparison_ruinsgrill_no_v1', 'format', 'ugc');
  assert.equal(no.namn, 'GRILL_mastern_pain_ugc_ruinsgrill_no_v1');
});

test('samma fältvärde bumpar versionen i stället för att skapa en dubblett', () => {
  const n = variantnamn('MAGI_brush_pain_beforeafter_stains_v1', 'hook', 'stains');
  assert.equal(n.namn, 'MAGI_brush_pain_beforeafter_stains_v2');
});

test('okänt fältvärde ger en mall, inte ett påhittat namn', () => {
  const n = variantnamn('MAGI_brush_pain_beforeafter_stains_v1', 'hook');
  assert.equal(n.namn, null);
  assert.match(n.mall, /<nytt hook>/);
  assert.match(n.skal, /bestäms i ronden/);
});

test('en förälder utanför namnkonventionen ger mallen och en anmärkning', () => {
  const n = variantnamn('Annons 1 kopia', 'hook', 'grossout');
  assert.equal(n.namn, null);
  assert.match(n.skal, /följer inte namnkonventionen/);
  assert.match(n.mall, /\{BRAND\}/);
});

test('variantnamn vägrar en variabel utanför vokabulären', () => {
  assert.deepEqual(VARIABLER, ['hook', 'angle', 'format']);
  assert.throws(() => variantnamn('MAGI_brush_pain_beforeafter_stains_v1', 'talare', 'x'), /okänd variabel/);
});

// ------------------------------------------------------------------ planen

test('varje variant pekar på en NAMNGIVEN förälder och en isolerad variabel', () => {
  const plan = byggKadens({ vinnare: [vinnare('A_p_pain_ugc_h1_v1'), vinnare('B_p_benefit_lifestyle_h2_v1')] });
  assert.equal(plan.varianter.length, 11);
  for (const v of plan.varianter) {
    assert.ok(v.foralder, 'en variant utan förälder är inget variant');
    assert.ok(VARIABLER.includes(v.variabel));
    assert.equal(v.hall_konstant.length, 2, 'exakt en variabel ändras, resten hålls konstant');
    assert.equal(v.hall_konstant.includes(v.variabel), false);
  }
});

test('varianterna fördelas jämnt över vinnarna och roterar variabeln', () => {
  const plan = byggKadens({ vinnare: [vinnare('A_p_pain_ugc_h1_v1'), vinnare('B_p_benefit_lifestyle_h2_v1')] });
  const forsta = plan.varianter.slice(0, 4);
  assert.deepEqual(forsta.map((v) => v.foralder), ['A_p_pain_ugc_h1_v1', 'B_p_benefit_lifestyle_h2_v1', 'A_p_pain_ugc_h1_v1', 'B_p_benefit_lifestyle_h2_v1']);
  // Två varianter av SAMMA förälder testar aldrig samma variabel i samma rond
  // — annars går datan inte att läsa per variabel.
  assert.deepEqual(forsta.map((v) => v.variabel), ['hook', 'hook', 'angle', 'angle']);
  const perForalder = plan.varianter.filter((v) => v.foralder === 'A_p_pain_ugc_h1_v1');
  assert.ok(perForalder.length >= 5);
});

test('en vinnarrad utan annonsnamn kan inte bli förälder — den räknas inte', () => {
  const plan = byggKadens({ vinnare: [vinnare('A_p_pain_ugc_h1_v1'), { kop: 9, cpa: 150 }] });
  assert.ok(plan.varningar.some((v) => /saknar annonsnamn/.test(v)));
  for (const v of plan.varianter) assert.equal(v.foralder, 'A_p_pain_ugc_h1_v1');
});

test('varianten bär förälderns utfall så briefen vet vad den itererar på', () => {
  const plan = byggKadens({ vinnare: [vinnare('A_p_pain_ugc_h1_v1', { kop: 34, cpa: 161, vinstbidrag: 3724 })] });
  assert.deepEqual(plan.varianter[0].foralderns_utfall, { kop: 34, cpa: 161, vinstbidrag: 3724 });
});

test('ett koncept med giltig källa är inte en gissning', () => {
  const plan = byggKadens({
    vinnare: [vinnare('A_p_pain_ugc_h1_v1')],
    koncept: [
      koncept('före/efter på smutsig motor', 'playbook', 'docs/playbook.md: beforeafter slår ugc'),
      koncept('"stoppar alger på 3 sekunder"', 'winning-line', 'docs/winning-lines.md rad 12'),
      koncept('konkurrentens split-screen', 'swipe', 'docs/swipes/ibc-2026-08.png'),
    ],
  });
  const grundade = plan.nyaKoncept.filter((k) => !k.gissning);
  assert.equal(grundade.length, 3);
  assert.deepEqual(grundade.map((k) => k.kalla.typ), KONCEPTKALLOR);
  for (const k of grundade) assert.equal(k.anmarkning, null);
});

test('ett koncept utan källa MÄRKS gissning — det göms aldrig', () => {
  // CLAUDE.md: ett koncept får aldrig födas ur tomma intet. Kan det inte peka
  // på en playbook-vinnare, en winning line eller en swipe är det en gissning,
  // och då ska det märkas som en.
  const plan = byggKadens({ vinnare: [vinnare('A_p_pain_ugc_h1_v1')] });
  assert.equal(plan.nyaKoncept.length, 10);
  assert.equal(plan.nyaKoncept.every((k) => k.gissning), true);
  assert.ok(plan.varningar.some((v) => /10 av 10 nya koncept saknar källa/.test(v)));
});

test('en påhittad källtyp godkänns inte som källa', () => {
  const plan = byggKadens({
    vinnare: [vinnare('A_p_pain_ugc_h1_v1')],
    koncept: [
      koncept('kändes rätt', 'magkänsla', 'ingen'),
      { ide: 'utan källblock' },
      koncept('tom referens', 'playbook', ''),
    ],
  });
  for (const k of plan.nyaKoncept.slice(0, 3)) {
    assert.equal(k.gissning, true);
    assert.match(k.anmarkning, /källan saknas eller är okänd|ingen konceptkandidat/);
  }
});

test('ingen redigerare tilldelad nämner ALDRIG en person', () => {
  // factory/redigerare/standby.md har noll rader (avläst 2026-09-09).
  const utan = byggKadens({ vinnare: [vinnare('A_p_pain_ugc_h1_v1')] });
  assert.equal(utan.redigerare, null);
  assert.ok(utan.varningar.some((v) => /Ingen redigerare tilldelad/.test(v)));
  const text = skrivKadens(utan);
  assert.match(text, /Redigerare: ingen redigerare tilldelad/);

  const med = byggKadens({ vinnare: [vinnare('A_p_pain_ugc_h1_v1')], redigerare: 'Josh' });
  assert.equal(med.redigerare, 'Josh');
  assert.equal(med.varningar.some((v) => /Ingen redigerare/.test(v)), false);
});

test('kadensen räknas om när Axel ändrar takten', () => {
  const plan = byggKadens({ antalPerDag: 4, dagar: 3, vinnare: [vinnare('A_p_pain_ugc_h1_v1')] });
  assert.equal(plan.total, 12);
  assert.equal(plan.fordelning.varianter, 6);
  assert.equal(plan.fordelning.koncept, 6);
  assert.throws(() => byggKadens({ antalPerDag: 0 }), /antalPerDag/);
  assert.throws(() => byggKadens({ dagar: 0 }), /dagar/);
});

test('skrivKadens visar varje plats, källan och variabeln', () => {
  const text = skrivKadens(byggKadens({
    antalPerDag: 1, dagar: 2,
    vinnare: [vinnare('MAGI_brush_pain_beforeafter_stains_v1')],
    koncept: [koncept('idé', 'swipe', 'docs/swipes/x.png')],
    redigerare: 'Josh',
  }));
  assert.match(text, /2 creatives den här ronden/);
  assert.match(text, /MAGI_brush_pain_beforeafter_stains_v1/);
  assert.match(text, /håll angle \+ format konstant/);
  assert.match(text, /swipe: docs\/swipes\/x\.png/);
});
