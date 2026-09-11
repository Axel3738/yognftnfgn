// Gåvoguidens poängmodell (factory/gavoguide.mjs).
//
// Det här är inte en konverteringstest. Två av reglerna är LÖFTEN till
// kunden — ingen alkoholtemakalender till ett barn, inga smådelar till den
// som sagt "under tre år" — och ett löfte som bara finns i en webbläsarfil
// kan ingen bevisa håller. Därför testas modellen som modul, och därför
// bakas samma källkod in i temat i stället för att kopieras dit.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { rangordna, prisTak, poang, taggarOchVikter, UTESLUT, RESULTAT_ANTAL } from '../gavoguide.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Sortimentet som det ser ut när guiden byggdes (2026-09-11). Priserna är
// bara storleksordningar här — det som testas är reglerna, inte prislappen.
const SORTIMENT = [
  { handle: 'racing', pris: 499, quiz: { taggar: ['mottagare:barn', 'alder:3-5', 'alder:6-8', 'intresse:bilar', 'egenskap:varar'], sma_delar: true, alkoholtema: false } },
  { handle: 'dino', pris: 399, quiz: { taggar: ['mottagare:barn', 'alder:3-5', 'alder:6-8', 'intresse:dinosaurier', 'egenskap:varar'], sma_delar: true, alkoholtema: false } },
  { handle: 'barnsmycken', pris: 399, quiz: { taggar: ['mottagare:barn', 'mottagare:tonaring', 'alder:6-8', 'alder:9-12', 'intresse:smycken-barn', 'intresse:pyssel'], sma_delar: true, alkoholtema: false } },
  { handle: 'pussel', pris: 399, quiz: { taggar: ['mottagare:vuxen', 'mottagare:tonaring', 'intresse:pussel', 'egenskap:varar', 'egenskap:brett'], sma_delar: false, alkoholtema: false } },
  { handle: 'gor-din-egen', pris: 349, quiz: { taggar: ['mottagare:vemsomhelst', 'mottagare:barn', 'mottagare:vuxen', 'egenskap:personlig', 'egenskap:fyll-sjalv', 'egenskap:brett'], sma_delar: false, alkoholtema: false } },
  { handle: 'golf', pris: 549, quiz: { taggar: ['mottagare:vuxen', 'intresse:golf', 'egenskap:varar'], sma_delar: false, alkoholtema: false } },
  { handle: 'whisky', pris: 449, quiz: { taggar: ['mottagare:vuxen', 'intresse:whisky', 'egenskap:dekor'], sma_delar: false, alkoholtema: true } },
  { handle: 'cocktail', pris: 449, quiz: { taggar: ['mottagare:vuxen', 'intresse:cocktail', 'egenskap:dekor'], sma_delar: false, alkoholtema: true } },
];

const svar = (...par) => par.map(([taggar, vikt]) => ({ taggar, vikt, etikett: taggar.join('+') }));
const handles = (r) => r.rankade.map((x) => x.produkt.handle);

// ------------------------------------------------------- spärrarna (löftena)

test('en alkoholtemakalender föreslås ALDRIG till ett barn — hur många taggar som än matchar', () => {
  // Värsta tänkbara fallet: kunden väljer barn OCH whisky. Intressetaggen
  // matchar whiskykalendern perfekt. Den ska ändå inte finnas i svaret.
  const r = rangordna(SORTIMENT, svar([['mottagare:barn'], 3], [['intresse:whisky'], 4]));
  assert.equal(handles(r).includes('whisky'), false);
  assert.equal(handles(r).includes('cocktail'), false);
  assert.ok(r.rankade.length > 0, 'guiden ska ändå ge ett svar');
});

test('samma spärr gäller tonåringar', () => {
  const r = rangordna(SORTIMENT, svar([['mottagare:tonaring'], 3], [['intresse:cocktail'], 4]));
  assert.equal(handles(r).some((h) => ['whisky', 'cocktail'].includes(h)), false);
});

test('vuxen + whisky ger whiskykalendern — spärren gäller bara barn', () => {
  const r = rangordna(SORTIMENT, svar([['mottagare:vuxen'], 3], [['intresse:whisky'], 4]));
  assert.equal(handles(r)[0], 'whisky');
});

test('smådelar föreslås aldrig när kunden sagt under tre år', () => {
  const r = rangordna(
    SORTIMENT,
    svar([['mottagare:barn'], 3], [['alder:under-3', 'krav:utan-sma-delar'], 3], [['intresse:dinosaurier'], 4])
  );
  // Dinosauriekalendern matchar intresset men bär smådelar.
  assert.equal(handles(r).includes('dino'), false);
  assert.equal(handles(r).includes('racing'), false);
  assert.equal(handles(r).includes('barnsmycken'), false);
});

test('spärrarna är hårda, inte minuspoäng — de går inte att väga upp', () => {
  // Fem träffar på whiskykalendern och ändå noll: det är skillnaden mellan
  // en spärr och en tung minuspoäng.
  const manga = svar(
    [['mottagare:barn'], 3],
    [['intresse:whisky'], 5],
    [['egenskap:dekor'], 5],
    [['mottagare:vuxen'], 5]
  );
  assert.equal(handles(rangordna(SORTIMENT, manga)).includes('whisky'), false);
});

// ------------------------------------------------------------- prisfiltret

test('prisfiltret är MJUKT — kunden lämnas aldrig utan svar', () => {
  const dyrt = [
    { handle: 'golf', pris: 549, quiz: { taggar: ['mottagare:vuxen', 'intresse:golf'] } },
    { handle: 'whisky', pris: 449, quiz: { taggar: ['mottagare:vuxen', 'intresse:whisky'] } },
  ];
  const r = rangordna(dyrt, svar([['mottagare:vuxen'], 3], [['pris:under-400'], 1]));
  assert.equal(r.rankade.length, 2, 'inget låg under 400 — filtret ska släppas');
  assert.equal(r.not, 'budget', 'och kunden ska få veta varför');
});

test('finns något inom budgeten vinner budgeten, utan anmärkning', () => {
  const r = rangordna(SORTIMENT, svar([['mottagare:vuxen'], 3], [['pris:under-400'], 1]));
  assert.equal(r.not, '');
  assert.ok(r.rankade.every((x) => x.produkt.pris <= 400), 'bara produkter under 400 kr');
});

test('prisTak läser spannen', () => {
  assert.equal(prisTak(new Set(['pris:under-400'])), 400);
  assert.equal(prisTak(new Set(['pris:400-600'])), 600);
  assert.equal(prisTak(new Set(['pris:fritt'])), null);
  assert.equal(prisTak(new Set()), null);
});

// ------------------------------------------------------------------- poäng

test('vikten avgör: intressefrågan väger tyngre än "vad är viktigast"', () => {
  const r = rangordna(
    SORTIMENT,
    svar([['mottagare:barn'], 3], [['intresse:dinosaurier'], 4], [['egenskap:varar'], 2])
  );
  assert.equal(handles(r)[0], 'dino');
});

test('samma tagg i två frågor ger högsta vikten, inte summan', () => {
  const { vikter } = taggarOchVikter(svar([['intresse:hockey'], 4], [['intresse:hockey'], 1]));
  assert.equal(vikter['intresse:hockey'], 4);
});

test('lika poäng: billigast först', () => {
  const lika = [
    { handle: 'dyr', pris: 599, quiz: { taggar: ['mottagare:vuxen'] } },
    { handle: 'billig', pris: 299, quiz: { taggar: ['mottagare:vuxen'] } },
  ];
  assert.deepEqual(handles(rangordna(lika, svar([['mottagare:vuxen'], 3]))), ['billig', 'dyr']);
});

test('poäng räknar bara taggar produkten faktiskt bär', () => {
  const q = { taggar: ['a', 'b'] };
  assert.equal(poang(new Set(['a', 'b', 'c']), { a: 3, b: 2, c: 9 }, q), 5);
  assert.equal(poang(new Set(['c']), { c: 9 }, q), 0);
});

// --------------------------------------------------------------- gränsfall

test('en produkt utan quiz-taggar kraschar inte modellen', () => {
  const r = rangordna([{ handle: 'tom', pris: 399, quiz: {} }], svar([['mottagare:vuxen'], 3]));
  assert.equal(r.rankade.length, 1);
  assert.equal(r.rankade[0].poang, 0);
});

test('inga svar alls ger hela sortimentet, inte ett tomt resultat', () => {
  assert.equal(rangordna(SORTIMENT, []).rankade.length, SORTIMENT.length);
});

test('tomt sortiment ger tomt svar utan att kasta', () => {
  assert.deepEqual(rangordna([], svar([['mottagare:barn'], 3])).rankade, []);
});

test('"fyll själv" lämnar bara kalendrar som går att fylla', () => {
  const r = rangordna(SORTIMENT, svar([['krav:fyll-sjalv'], 3]));
  assert.deepEqual(handles(r), ['gor-din-egen']);
});

// ------------------------------------------------- modellen NÅR webbläsaren

test('temats asset bär samma poängmodell — ingen kopia som kan glida isär', async () => {
  const { TEMAFILER } = await import('../tema.mjs');
  const asset = TEMAFILER['assets/ms-gavoguide.js'];
  assert.ok(asset, 'assets/ms-gavoguide.js ska finnas i TEMAFILER');
  assert.equal(asset.includes('{{ poangmodell }}'), false, 'platshållaren ska vara ersatt');
  assert.ok(asset.includes('function rangordna('), 'modellen ska vara inbakad');
  assert.ok(asset.includes('alkohol-till-barn'), 'spärren ska följa med till temat');
  assert.equal(/^\s*export /m.test(asset), false, 'export-syntax fungerar inte i en script-tagg');
  // Källfilens regler ska finnas ORDAGRANT i assetet, inte i en omskriven form.
  const kalla = readFileSync(join(ROT, 'gavoguide.mjs'), 'utf8');
  for (const rad of ['q.alkoholtema === true', "taggar.has('krav:utan-sma-delar')"]) {
    assert.ok(kalla.includes(rad), `källan ska bära ${rad}`);
    assert.ok(asset.includes(rad), `assetet ska bära ${rad}`);
  }
});

test('sektionen finns i temat och läser kollektionen, inte en produktlista', async () => {
  const { TEMAFILER } = await import('../tema.mjs');
  const sektion = TEMAFILER['sections/ms-gavoguide.liquid'];
  assert.ok(sektion, 'sections/ms-gavoguide.liquid ska finnas i TEMAFILER');
  assert.ok(sektion.includes('collections[section.settings.kollektion]'), 'produkterna kommer ur kollektionen');
  assert.ok(sektion.includes('p.metafields.opf.quiz'), 'och bär sina egna taggar');
  assert.ok(sektion.includes('data-guide-fallback'), 'utan JS ska en länk till kollektionen stå kvar');
  assert.ok(sektion.includes('{% schema %}') && sektion.includes('{% endschema %}'));
  // Inga hårdkodade produkthandles — samma regel som resten av fabriken.
  assert.equal(/adventskalender-racingbilar|dinosaurie/.test(sektion), false);
});

test('RESULTAT_ANTAL är en träff plus två alternativ', () => {
  assert.equal(RESULTAT_ANTAL, 3);
});

test('varje uteslutningsregel bär en motivering', () => {
  for (const r of UTESLUT) {
    assert.ok(r.id && r.varfor && typeof r.test === 'function', `regeln ${r.id} är ofullständig`);
  }
});
