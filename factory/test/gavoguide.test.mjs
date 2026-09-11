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

import { rangordna, prisTak, poang, taggarOchVikter, UTESLUT, RESULTAT_ANTAL, BUDGETPOANG } from '../gavoguide.mjs';

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

test('budgeten får ALDRIG slå ut intresset — den svarar på fel fråga då', () => {
  // Provkört i webbläsare 2026-09-11: med budgeten som filter fick den som
  // svarade "golf" och "under 400 kr" hockeykalendern, för golfkalendern
  // kostar 549 och föll bort helt. Att svara på fel fråga är värre än att
  // visa ett för dyrt pris.
  const r = rangordna(SORTIMENT, svar([['mottagare:vuxen'], 3], [['intresse:golf'], 4], [['pris:under-400'], 1]));
  assert.equal(handles(r)[0], 'golf', 'intresset väger tyngre än prisspannet');
  assert.equal(r.not, 'over-budget', 'men kunden ska få veta att den kostar mer');
  assert.ok(r.billigast, 'och se den bäst rankade som faktiskt ryms');
  assert.ok(r.billigast.produkt.pris <= 400);
});

test('ligger träffen inom budgeten sägs ingenting om pris', () => {
  const r = rangordna(SORTIMENT, svar([['mottagare:barn'], 3], [['intresse:dinosaurier'], 4], [['pris:under-400'], 1]));
  assert.equal(handles(r)[0], 'dino');
  assert.equal(r.not, '');
  assert.equal(r.billigast, null);
});

test('budgetpoängen bryter lika lägen till det billigare', () => {
  // Två produkter, lika på allt utom priset: den inom budget ska vinna.
  const lika = [
    { handle: 'dyr', pris: 549, quiz: { taggar: ['mottagare:vuxen', 'intresse:golf'] } },
    { handle: 'billig', pris: 349, quiz: { taggar: ['mottagare:vuxen', 'intresse:golf'] } },
  ];
  const r = rangordna(lika, svar([['mottagare:vuxen'], 3], [['intresse:golf'], 4], [['pris:under-400'], 1]));
  assert.equal(handles(r)[0], 'billig');
  assert.equal(r.not, '');
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

test('budgetpoängen väger lättare än intressefrågan — annars vore den ett filter igen', () => {
  assert.ok(BUDGETPOANG < 4, `budgetpoängen ${BUDGETPOANG} får inte nå intressets vikt 4`);
});

test('varje uteslutningsregel bär en motivering', () => {
  for (const r of UTESLUT) {
    assert.ok(r.id && r.varfor && typeof r.test === 'function', `regeln ${r.id} är ofullständig`);
  }
});

// ---------------------------------------- taggarna får aldrig översättas

test('etiketter och taggar ligger i var sitt fält — en översatt tagg matchar ingenting', async () => {
  const { lasYaml } = await import('../yaml.mjs');
  const { byggStartsida } = await import('../startsida.mjs');
  const { malltexter } = await import('../oversattning.mjs');
  const butik = lasYaml(readFileSync(join(ROT, 'butiker/kalender.yaml'), 'utf8'));
  const p = lasYaml(readFileSync(join(ROT, 'produkter/adventskalender-racingbilar.yaml'), 'utf8'));
  const ra = byggStartsida(butik, [p, p], { kollektion: 'kalendrarna' });
  const mall = JSON.parse(String(ra).replace(/^\s*\/\*[\s\S]*?\*\//, '').trim());

  const g = mall.sections.gavoguide;
  assert.ok(g, 'gåvoguiden ska ligga i startsidan');
  assert.equal(mall.order.indexOf('gavoguide') < mall.order.indexOf('sortiment'), true, 'guiden står ovanför katalogen');

  const f1 = g.blocks[g.block_order[0]].settings;
  assert.equal(f1.svar.includes('|'), false, 'svarsfältet ska bara bära etiketter');
  assert.equal(f1.svar.split('\n').length, f1.taggar.split('\n').length, 'en taggrad per svarsrad');
  assert.ok(f1.taggar.includes('mottagare:barn'));

  // Det som faktiskt skickas till översättning får inte innehålla en enda tagg.
  const texter = malltexter('mall.index', mall);
  for (const [nyckel, varde] of Object.entries(texter)) {
    assert.equal(/mottagare:|intresse:|alder:|krav:|egenskap:|pris:/.test(varde), false,
      `${nyckel} bär en maskintagg ut i översättningen: ${varde}`);
  }
  // Men etiketterna SKA med, annars står guiden på svenska för norska kunder.
  assert.ok(Object.values(texter).some((v) => v.includes('Vem ska du köpa till?')));
  assert.ok(Object.values(texter).some((v) => v.includes('Ett barn')));
});

// --------------------------------------------- Liquid-taggarna måste gå ihop

test('varje sektion fabriken äger har balanserade Liquid-taggar', async () => {
  // Mätt 2026-09-11: gåvoguiden saknade sitt yttersta {%- endif -%} och
  // Shopify svarade "'if' tag was never closed" först vid uppladdning. Det
  // felet ska fångas här, inte av butiken.
  const { SEKTIONER, TEMAFILER } = await import('../tema.mjs');
  const PAR = { if: 'endif', for: 'endfor', unless: 'endunless', case: 'endcase', form: 'endform', paginate: 'endpaginate' };
  const filer = Object.entries({ ...SEKTIONER, ...TEMAFILER }).filter(([n]) => n.endsWith('.liquid'));
  assert.ok(filer.length >= 7, `förväntade minst 7 liquid-filer, fick ${filer.length}`);

  for (const [namn, innehall] of filer) {
    // {% schema %} är JSON, inte Liquid — och {%- liquid -%}-blocken bär sina
    // egna taggar utan procenttecken. Båda hanteras för sig.
    const utanSchema = innehall.replace(/\{%\s*schema\s*%\}[\s\S]*?\{%\s*endschema\s*%\}/g, '');
    const stack = [];
    const taggar = [...utanSchema.matchAll(/\{%-?\s*(\w+)/g)].map((m) => m[1]);
    for (const t of taggar) {
      if (t === 'liquid') continue; // inline-blocket räknas separat nedan
      if (PAR[t]) stack.push(t);
      else if (Object.values(PAR).includes(t)) {
        const oppen = stack.pop();
        assert.equal(PAR[oppen], t, `${namn}: ${t} stänger ${oppen ?? '(ingenting)'}`);
      }
    }
    assert.deepEqual(stack, [], `${namn}: ${stack.join(', ')} stängs aldrig`);

    // {%- liquid … -%}: samma par, men taggarna står som rena ord på egen rad.
    for (const block of utanSchema.matchAll(/\{%-?\s*liquid\b([\s\S]*?)-?%\}/g)) {
      const inre = [];
      for (const rad of block[1].split('\n')) {
        const ord = rad.trim().split(/\s+/)[0];
        if (PAR[ord]) inre.push(ord);
        else if (Object.values(PAR).includes(ord)) {
          const oppen = inre.pop();
          assert.equal(PAR[oppen], ord, `${namn} (liquid-block): ${ord} stänger ${oppen ?? '(ingenting)'}`);
        }
      }
      assert.deepEqual(inre, [], `${namn} (liquid-block): ${inre.join(', ')} stängs aldrig`);
    }
  }
});
