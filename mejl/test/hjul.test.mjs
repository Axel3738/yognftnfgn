// Lyckohjulet: datan som bakas in i Shopify-sidan, och sidkroppen runt den.
// Inget nätverk — allt räknas ur produkter.json och konfigen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { valjProdukter } from '../mallar.mjs';
import { hjulData, byggHjulsida, byggHjulForhandsvisning } from '../hjul.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const konfig = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(ROT, 'copy.json'), 'utf8'));
const alla = JSON.parse(readFileSync(join(ROT, 'produkter.json'), 'utf8'));
const produkter = valjProdukter(alla, konfig);
const minsta = konfig.erbjudande.minsta_kop_sek;
// Storsäljare som fixtur: några riktiga produkter, en under gränsen, en
// gratisprodukt och en som inte finns — alla tre sista ska sorteras bort.
const storsaljare = [
  { handle: 'ibc-tankoverdrag-1000-l-stoppar-alger-uv', antal: 90, ordrar: 60, pris: 489 },
  { handle: 'fiskespohallare-4-pack-kraftig-forvaring', antal: 73, ordrar: 40, pris: 289 },
  { handle: 'overvakningskamera-tradlos-dubbellins-ptz-med-ai-sparning', antal: 71, ordrar: 50, pris: 799 },
  { handle: konfig.erbjudande.gratisprodukter[0], antal: 50, ordrar: 50, pris: 199 },
  { handle: 'finns-inte-i-butiken', antal: 40, ordrar: 40, pris: 999 },
  { handle: 'mc-kapell-220-120-regn-damm-uv', antal: 32, ordrar: 30, pris: 349 },
];
const indata = { konfig, copy, produkter, alla, storsaljare };
const D = hjulData(indata);
const kropp = byggHjulsida(indata);

test('vinsterna: alla finns, kan läggas i korgen utan val, och är under taket', () => {
  assert.equal(D.vinster.length, konfig.erbjudande.gratisprodukter.length);
  assert.ok(D.vinster.length >= 6, 'ett hjul behöver fler än en handfull bitar');
  for (const [handle, namn, pris, bildsuffix, variant] of D.vinster) {
    const p = alla.find((x) => x.handle === handle);
    assert.ok(p, `${handle} finns inte bland aktiva produkter`);
    assert.equal(p.en_variant, true, `${handle} har flera varianter — går inte att lägga i korgen från hjulet`);
    assert.ok(variant && /^\d+$/.test(variant), `${handle} saknar variant-id`);
    assert.ok(namn && namn.length <= 42, `${handle}: kortnamnet`);
    assert.ok(pris > 0 && pris < 300, `${handle}: ${pris} kr ligger utanför hjulets prisklass`);
    assert.ok(bildsuffix && !bildsuffix.startsWith('http'), `${handle}: bilden ska vara ett suffix efter cdn`);
    assert.ok(bildsuffix.includes('_240x240'), `${handle}: bilden ska vara förminskad`);
  }
});

test('vinsterna ligger i kollektionen rabatten ger gratis ur', () => {
  // Står en vinst inte i konfigens gratisprodukter kan kollektionen inte
  // innehålla den, och då blir hjulets löfte falskt i kassan.
  assert.deepEqual(
    D.vinster.map((v) => v[0]),
    konfig.erbjudande.gratisprodukter
  );
});

test('komprimeringen: katalog som array, karta som index, gemensamt cdn-prefix', () => {
  assert.ok(D.cdn.startsWith('https://'), 'cdn-prefixet');
  const antal = D.komplement.katalog.length;
  assert.ok(antal > 0);
  for (const [handle, namn, pris, , variant, ev] of D.komplement.katalog) {
    assert.ok(alla.some((p) => p.handle === handle), `${handle} i katalogen men inte i butiken`);
    assert.ok(namn && pris > 0);
    assert.ok(ev === 0 || ev === 1, 'en_variant är 0 eller 1');
    if (ev === 1) assert.ok(/^\d+$/.test(variant), `${handle}: köpbar men utan variant-id`);
    else assert.equal(variant, '', `${handle}: inte direktköpbar, ska sakna variant-id`);
  }
  for (const [handle, lista] of Object.entries(D.komplement.karta)) {
    assert.ok(lista.length > 0, `${handle}: tom lista`);
    for (const i of lista) assert.ok(Number.isInteger(i) && i >= 0 && i < antal, `${handle}: index ${i} utanför katalogen`);
    assert.equal(new Set(lista).size, lista.length, `${handle}: dubbletter`);
    assert.ok(!lista.some((i) => D.komplement.katalog[i][0] === handle), `${handle} föreslår sig själv`);
  }
  for (const i of D.komplement.fallback) assert.ok(Number.isInteger(i) && i >= 0 && i < antal, 'fallback-index');
  assert.ok(D.komplement.fallback.length >= 3, 'fallbacken måste kunna fylla raden');
});

test('"Så når du 299 kr" visar bara produkter som själva når gränsen', () => {
  // Rubriken lovar vägen till 299 kr. En vara för 189 kr gör inte det
  // (Axel 2026-09-13: "alla produkter kostar inte ens 299 kr där").
  for (const [handle, lista] of Object.entries(D.komplement.karta)) {
    for (const i of lista) assert.ok(D.komplement.katalog[i][2] >= minsta, `${handle} föreslår ${D.komplement.katalog[i][0]} för ${D.komplement.katalog[i][2]} kr`);
  }
  for (const i of D.komplement.fallback) assert.ok(D.komplement.katalog[i][2] >= minsta, `fallback under gränsen: ${D.komplement.katalog[i][0]}`);
  for (const i of D.komplement.storsaljare) assert.ok(D.komplement.katalog[i][2] >= minsta, `storsäljare under gränsen: ${D.komplement.katalog[i][0]}`);
});

test('storsäljarna: ordning ur ordrarna, under gränsen/gratis/okända bort, fallbacken = storsäljarna', () => {
  const handles = D.komplement.storsaljare.map((i) => D.komplement.katalog[i][0]);
  assert.deepEqual(handles, [
    'ibc-tankoverdrag-1000-l-stoppar-alger-uv',
    'overvakningskamera-tradlos-dubbellins-ptz-med-ai-sparning',
    'mc-kapell-220-120-regn-damm-uv',
  ]);
  assert.deepEqual(D.komplement.fallback, D.komplement.storsaljare, 'med storsäljare är de fallbacken');
  // Storsäljare som inte fanns i komplementkatalogen har lagts till med variant-id.
  const ibc = D.komplement.katalog[D.komplement.storsaljare[0]];
  assert.equal(ibc[0], 'ibc-tankoverdrag-1000-l-stoppar-alger-uv');
  assert.ok(ibc[1] && ibc[3].includes('_240x240'), 'namn och förminskad bild');
});

test('"Visa fler" tar hela katalogen, inte bara fallbacken', () => {
  // Kön i skriptet är: en till + kartans lista + fallbacken + resten av
  // katalogen blandad. Utan sista ledet tog den slut efter tolv förslag och
  // knappen gick bara att klicka två gånger (Axel 2026-09-14).
  const skript = byggHjulsida({ konfig, copy, produkter, alla, storsaljare });
  assert.match(skript, /resten\.forEach/, 'resten av katalogen läggs aldrig i kön');
  assert.match(skript, /Math\.floor\(Math\.random\(\) \* \(r \+ 1\)\)/, 'resten ska blandas per besök');
  const klick = Math.ceil(D.komplement.katalog.length / D.perVisning) - 1;
  assert.ok(klick >= 5, `katalogen räcker bara till ${klick} klick på Visa fler`);
});

test('utan storsäljare faller sidan tillbaka på mejlets lista, filtrerad på priset', () => {
  const D2 = hjulData({ konfig, copy, produkter, alla, storsaljare: [] });
  assert.deepEqual(D2.komplement.storsaljare, []);
  assert.ok(D2.komplement.fallback.length >= 1, 'något måste finnas att visa');
  for (const i of D2.komplement.fallback) assert.ok(D2.komplement.katalog[i][2] >= minsta);
});

test('kartan känner igen storsäljarna och ger dem rätt komplement', () => {
  const axel = D.komplement.karta['axelbalte-for-trimmer-justerbart-nylonbalte'];
  assert.ok(axel, 'axelbältet saknas i kartan');
  const handles = axel.map((i) => D.komplement.katalog[i][0]);
  assert.ok(handles.includes('staltradsborsthuvuden-for-trimmer-kraftiga-ogras-mossrojare'), 'borsthuvudena ska föreslås till axelbältet');
});

test('sidkroppen: en rot, datan inbakad, inga otillåtna taggar, rimlig storlek', () => {
  assert.ok(kropp.startsWith('<div id="bb-hjul">'), 'en rot som all CSS är avgränsad till');
  assert.ok(kropp.trim().endsWith('</div>'));
  assert.ok(kropp.includes('id="bbh-data"'), 'datan');
  assert.ok(kropp.includes('id="bbh-svg"'), 'hjulet');
  // Shopifys sidredigerare är en WYSIWYG: inga hela dokument i sidkroppen.
  for (const tagg of ['<html', '<head', '<body', '<!DOCTYPE']) {
    assert.ok(!kropp.includes(tagg), `sidkroppen får inte innehålla ${tagg}`);
  }
  // </script> inuti JSON-datan skulle stänga script-taggen i förtid.
  const json = kropp.match(/id="bbh-data">([\s\S]*?)<\/script>/)[1];
  assert.ok(!json.includes('</script'), 'json-datan bryter script-taggen');
  assert.doesNotThrow(() => JSON.parse(json.replace(/<\\\//g, '</')), 'datan ska vara giltig JSON');
  assert.ok(kropp.length < 120 * 1024, `sidkroppen är ${(kropp.length / 1024).toFixed(0)} kB`);
});

test('all text kommer ur copy.json, inga hårdkodade kundtexter', () => {
  for (const nyckel of ['forrubrik', 'intro', 'knapp_snurra', 'knapp_lagg', 'knapp_kassa', 'knapp_visa_fler', 'finstilt']) {
    assert.ok(copy.hjul[nyckel], `copy.hjul.${nyckel} saknas`);
    assert.ok(kropp.includes(copy.hjul[nyckel].replace(/&/g, '&amp;')), `copy.hjul.${nyckel} syns inte på sidan`);
  }
  // Texter med platshållare renderas av skriptet och ligger bara i datan.
  for (const nyckel of ['vann_rubrik', 'vann_text', 'korg_under', 'korg_klar', 'redan_text']) {
    assert.ok(D.copy[nyckel], `copy.hjul.${nyckel} saknas i datan`);
  }
  for (const [nyckel, text] of Object.entries(copy.hjul)) {
    assert.ok(!text.includes('"'), `copy.hjul.${nyckel} innehåller raka citattecken`);
  }
});

test('platshållarna i copyn matchar dem skriptet fyller i', () => {
  const tillatna = { vann_rubrik: ['produkt'], vann_text: ['produkt', 'pris'], redan_rubrik: [], redan_text: ['produkt'], korg_under: ['summa', 'kvar', 'produkt'], korg_klar: ['produkt'], korg_tillagd: ['produkt'], korg_forklaring: ['produkt'] };
  for (const [nyckel, falt] of Object.entries(tillatna)) {
    const funna = [...copy.hjul[nyckel].matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
    for (const f of funna) assert.ok(falt.includes(f), `copy.hjul.${nyckel}: {{${f}}} fylls aldrig i av skriptet`);
  }
  // Ingen annan text får bära platshållare — de skulle visas som de är.
  for (const [nyckel, text] of Object.entries(copy.hjul)) {
    if (tillatna[nyckel]) continue;
    assert.ok(!/\{\{/.test(text), `copy.hjul.${nyckel} har en platshållare som ingen fyller i`);
  }
});

test('korgflödet: koden läggs på efter varorna, temats låda öppnas, förklaringen finns', () => {
  const js = kropp.slice(kropp.lastIndexOf('<script>'));
  assert.ok(js.indexOf("'/cart/add.js'") < js.indexOf("'/discount/' + encodeURIComponent(D.kod)"), 'varorna först, koden efter (fabrikens mätning 2026-09-09)');
  assert.ok(js.includes("encodeURIComponent('/cart.js')"), 'koden läggs på via redirect till cart.js, ingen sidladdning');
  assert.ok(js.includes("new CustomEvent('ajaxProduct:added'"), 'temats varukorgslåda ritas om och öppnas');
  assert.ok(kropp.includes('id="bbh-forklaring"'), 'förklaringen om fullt pris tills 299 kr');
  assert.ok(kropp.includes('id="bbh-fler"'), 'visa fler-knappen');
});

test('länkarna: kassan lägger på koden, inga länkar till fel butik', () => {
  assert.ok(kropp.includes(`/discount/${konfig.erbjudande.kod}?redirect=%2Fcheckout`), 'kassaknappen lägger på koden');
  const lankar = [...kropp.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  for (const l of lankar) assert.ok(l.startsWith(konfig.butik.url), `länk utanför butiken: ${l}`);
});

test('förhandsvisningen är ett helt dokument och har autoklicket', () => {
  const f = byggHjulForhandsvisning(indata);
  assert.ok(f.startsWith('<!DOCTYPE html>'));
  assert.ok(f.includes('bbh-snurra'), 'snurrknappen');
  assert.ok(f.includes("location.search.indexOf('auto')"), 'autoklicket för skärmdumpar');
  assert.ok(!kropp.includes("location.search.indexOf('auto')"), 'autoklicket får inte följa med till Shopify');
});

test('mejlets knapp pekar på hjulet, inte på kollektionen', { skip: !existsSync(join(ROT, 'output', 'orderbekraftelse.liquid')) }, () => {
  const m = readFileSync(join(ROT, 'output', 'orderbekraftelse.liquid'), 'utf8');
  assert.ok(m.includes(`/pages/${konfig.hjul.handle}`), 'mejlet ska länka till hjulsidan');
  assert.ok(m.includes('?produkt={{ line.product.handle }}'), 'mejlet ska skicka med produkten kunden köpte');
  assert.ok(!m.includes(`?redirect=%2Fcollections%2F${konfig.erbjudande.kollektion_handle}`), 'den gamla kollektionslänken ska vara borta');
});
