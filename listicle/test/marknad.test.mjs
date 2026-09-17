// Tester för marknadsversionerna (2026-09-16): språklagret, priser i olika
// valutor, copy-granskningen på engelska, marknaden ur butiksfilen,
// översättningen mot en låtsas-klient och tillbakaläsningens språkkrav.
// Allt utan nät.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SPRAK, sprakFor, arKantSprak, konceptForSprak, formateraPris, priserI, prisText, svensktDatum, engelsktDatum, valutaFor, ersattPrisTokens, harPrisTokens, PRIS_TOKEN, JAMFORPRIS_TOKEN } from '../sprak.mjs';
import { tolkaProdukt, produktJsonUrl } from '../produkt.mjs';
import { lasMall, lasKoncept, granskaCopy, byggSida, lasAvSida, copyUrMall, forfattarHtml, sidfotHtml } from '../gempages.mjs';
import { renderaHtml, somDokument } from '../html.mjs';
import { marknadForButik, landForMarknad, marknadsProduktLank, marknadsSidlank, oversattSida, granskaPublikSida, publiceraMarknad, temafiler } from '../butik.mjs';

// ------------------------------------------------------------ länder inom en marknad + prisplatser

test('dollarvalutorna: CAD/AUD/NZD skrivs "$" som Shopify gör på carashell.com, och läses med eller utan landsbokstav', () => {
  assert.equal(formateraPris(284, 'CAD'), '$284');
  assert.equal(formateraPris(355, 'NZD'), '$355');
  assert.deepEqual(priserI('$284 instead of C$356, or 1,065 NZD', 'CAD'), [284, 356, 1065]);
  assert.deepEqual(priserI('A$286 today', 'AUD'), [286]);
  assert.deepEqual(priserI('£152 instead of £191', 'CAD'), []);
});

test('produktJsonUrl behåller ?country= (marknadens valuta) men inte butikens sökparametrar', () => {
  assert.equal(produktJsonUrl('https://carashell.com/products/takskyddet?country=GB'), 'https://carashell.com/products/takskyddet.json?country=GB');
  assert.equal(produktJsonUrl('https://carashell.com/products/takskyddet?country=gb&x=1'), 'https://carashell.com/products/takskyddet.json?country=GB');
  assert.equal(produktJsonUrl('https://baverbutiken.se/products/x?_pos=1&_psq=tak'), 'https://baverbutiken.se/products/x.json');
});

test('ersattPrisTokens byter [[PRIS]]/[[JAMFORPRIS]] rekursivt och lämnar objektet orört', () => {
  const copy = { hero: { rubrik: 'Yours is [[PRIS]] instead of [[JAMFORPRIS]]', sammanfattning: ['[[PRIS]] now', 'later [[JAMFORPRIS]]'] }, punkter: [{ knapp: 'Buy → [[PRIS]]' }] };
  const ut = ersattPrisTokens(copy, { prisText: '£152', jamforprisText: '£191' });
  assert.equal(ut.hero.rubrik, 'Yours is £152 instead of £191');
  assert.deepEqual(ut.hero.sammanfattning, ['£152 now', 'later £191']);
  assert.equal(ut.punkter[0].knapp, 'Buy → £152');
  assert.equal(copy.hero.rubrik, 'Yours is [[PRIS]] instead of [[JAMFORPRIS]]', 'originalet orört');
  assert.ok(harPrisTokens(copy) && !harPrisTokens(ut));
  assert.equal(ersattPrisTokens('[[PRIS]]', { prisText: null }), PRIS_TOKEN, 'utan pristext lämnas platsen');
});

test('granskaCopy med prisplatser: räknas som produktens pris, stopp när jämförpris saknas', () => {
  const { platser } = lasMall();
  const copy = engelskCopy();
  copy.hero.rubrik = 'We ordered too many roof covers, so yours is [[PRIS]] instead of [[JAMFORPRIS]] while stock lasts';
  copy.riskfritt.knapp = 'Yes, a roof cover for [[PRIS]] → 90-day guarantee';
  const gb = { pris: 152, jamforpris: 191, valuta: 'GBP', prisText: '£152', jamforprisText: '£191', url: 'https://carashell.com/products/takskyddet?country=GB' };
  const g = granskaCopy(copy, gb, platser, { locale: 'en' });
  assert.deepEqual(g.fel.filter((f) => /priset|JAMFORPRIS/.test(f)), []);
  assert.ok(!g.varningar.some((v) => /nämner inte priset|jämförpriset/.test(v)), g.varningar.join('\n'));
  const utanJmf = granskaCopy(copy, { ...gb, jamforpris: null, jamforprisText: null }, platser, { locale: 'en' });
  assert.ok(utanJmf.fel.some((f) => /\[\[JAMFORPRIS\]\] men produktsidan har inget jämförpris/.test(f)), utanJmf.fel.join('\n'));
});

test('byggSida och renderaHtml med prisplatser: GemPages-sidan och förhandsvisningen får dagens pris, butikens body behåller platserna + data-lp-produkt', () => {
  const { mall, platser } = lasMall();
  const copy = engelskCopy();
  copy.hero.rubrik = 'We ordered too many roof covers, so yours is [[PRIS]] instead of [[JAMFORPRIS]] while stock lasts';
  const produkt = { url: 'https://carashell.com/products/takskyddet?country=GB', handle: 'takskyddet', kortTitel: 'Roof Cover', slug: 'takoverdrag-husvagn-husbil-5-5-13-5-m', valuta: 'GBP', prisText: '£152', jamforprisText: '£191' };
  const { sida, rapport } = byggSida({ mall, platser, produkt, copy, datum: '2026-09-17', locale: 'en', handle: 'takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning-gb' });
  assert.equal(rapport.handle, 'takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning-gb', 'handle-flaggan vinner över slugen');
  const texter = lasAvSida(sida).map((r) => String(r.text ?? ''));
  assert.ok(texter.some((t) => /£152 instead of £191/.test(t)), 'GemPages-sidan bär dagens pris');
  assert.ok(!texter.some((t) => /\[\[PRIS\]\]/.test(t)));
  const fasta = Object.fromEntries(['hero', 'punkt1', 'punkt2', 'punkt3', 'punkt4', 'punkt5', 'lyckas', 'arlig'].map((p) => [p, { src: `https://x/${p}.png`, width: 10, height: 10 }]));
  const fv = renderaHtml({ copy, produkt, bilder: {}, fasta, datum: '2026-09-17', locale: 'en', stil: 'inline' });
  assert.match(fv, /£152 instead of £191/);
  assert.match(fv, /<div class="lr" data-lp-produkt="takskyddet">/);
  const body = renderaHtml({ copy, produkt, bilder: {}, fasta, datum: '2026-09-17', locale: 'en', stil: 'ingen', prisTokens: 'behall' });
  assert.match(body, /\[\[PRIS\]\] instead of \[\[JAMFORPRIS\]\]/);
  assert.ok(!/£152/.test(body));
  assert.match(body, /data-lp-produkt="takskyddet"/);
});

test('sidmallen byter prisplatserna med Liquid ur data-lp-produkt', () => {
  const mall = temafiler()['templates/page.listicle.liquid'];
  assert.match(mall, /\{% layout 'listicle' %\}/);
  assert.match(mall, /split: 'data-lp-produkt="'/);
  assert.match(mall, /all_products\[lp_handle\]/);
  assert.match(mall, /replace: '\[\[PRIS\]\]', lp_pris/);
  assert.match(mall, /replace: '\[\[JAMFORPRIS\]\]', lp_jmf/);
  assert.match(mall, /money_without_trailing_zeros/);
  assert.match(mall, /\{\{ lp_innehall \}\}\s*$/);
});

// ------------------------------------------------------------ språk + valuta

test('sprakFor: sv och en finns, en-US → en, okänt språk stoppar', () => {
  assert.equal(sprakFor().locale, 'sv');
  assert.equal(sprakFor('en').av, 'By');
  assert.equal(sprakFor('en-US').reklam, 'Note: this is an advertisement.');
  assert.equal(SPRAK.sv.reklam, 'OBS: Detta är reklam.');
  assert.ok(arKantSprak('EN'));
  assert.ok(!arKantSprak('de'));
  assert.throws(() => sprakFor('de'), /Okänt språk "de"/);
});

test('datumraden per språk', () => {
  assert.equal(svensktDatum('2026-09-16'), '16 september 2026');
  assert.equal(engelsktDatum('2026-09-16'), 'September 16, 2026');
  assert.equal(SPRAK.sv.datumrad('2026-09-16'), 'Senast uppdaterad 16 september 2026.');
  assert.equal(SPRAK.en.datumrad('2026-01-05'), 'Last updated January 5, 2026.');
  assert.throws(() => engelsktDatum('2026-13-01'), /Ogiltigt datum/);
});

test('formateraPris: kr med mellanslag, dollar med komma och punkt', () => {
  assert.equal(prisText(1129), '1 129 kr');
  assert.equal(formateraPris(1129), '1 129 kr');
  assert.equal(formateraPris(599, 'NOK'), '599 kr');
  assert.equal(formateraPris(199, 'USD'), '$199');
  assert.equal(formateraPris(1129, 'USD'), '$1,129');
  assert.equal(formateraPris(99.5, 'USD'), '$99.50');
  assert.equal(formateraPris(249, 'GBP'), '£249');
  assert.equal(formateraPris(249, 'EUR'), '€249');
  assert.equal(formateraPris('x', 'USD'), '');
  assert.throws(() => valutaFor('XYZ'), /Okänd valuta "XYZ"/);
});

test('priserI läser talen i rätt valuta och ignorerar de andra', () => {
  assert.deepEqual(priserI('299 kr, 1 129 kr och 367:-'), [299, 1129, 367]);
  assert.deepEqual(priserI('1 129 kr istället för 1 469 kr'), [1129, 1469]);
  assert.deepEqual(priserI('$199 instead of $249, or 1,129 USD, or 30 dollars', 'USD'), [199, 249, 1129, 30]);
  assert.deepEqual(priserI('$199 instead of $249'), [], 'utan valuta läses svenska kronor — dollar är inga priser då');
  assert.deepEqual(priserI('30–40 cm (12–16 in), 210D fabric, 90 days', 'USD'), []);
  assert.deepEqual(priserI('$199 instead of $249', 'USD'), [199, 249]);
  // "$99.50" är ett pris med cent; "599 kr" är inte ett dollarpris.
  assert.deepEqual(priserI('$99.50 and 599 kr', 'USD'), [99.5]);
  assert.deepEqual(priserI('$99.50 and 599 kr', 'SEK'), [599]);
});

test('konceptForSprak: svenska rakt igenom, engelska ur konceptets sprak.en, stopp när språket saknas', () => {
  const k = lasKoncept('lagerrensning');
  assert.equal(konceptForSprak(k, 'sv'), k);
  const en = konceptForSprak(k, 'en');
  assert.equal(en.forfattare_obrandad, 'Anders from the warehouse');
  assert.match(en.sidtitel, /clearance sale/);
  assert.equal(en.id, 'lagerrensning');
  assert.equal(en.suffix, k.suffix);
  assert.equal(konceptForSprak(lasKoncept('vi-testade'), 'en').forfattare_obrandad, 'Anders, who tested it himself');
  assert.match(konceptForSprak(lasKoncept('anledningar'), 'en').sidnamn, /\{n\} reasons/);
  assert.throws(() => konceptForSprak({ ...k, sprak: {} }, 'en'), /saknar texterna för språket "en"/);
  assert.throws(() => konceptForSprak({ ...k, sprak: { en: { sidnamn: 'x' } } }, 'en'), /saknar "sidtitel"/);
});

// ------------------------------------------------------------ produkten i marknadens valuta

const JSON_US = {
  product: {
    id: 1, handle: 'takskyddet', title: 'Roof Cover for Travel Trailers & Motorhomes up to 21 ft (6.5 × 3 m)', body_html: '<p>A roof cover.</p>',
    variants: [{ id: 11, title: 'Default Title', price: '199.00', compare_at_price: '249.00' }],
    images: [{ src: 'https://cdn.shopify.com/s/files/1/1092/3107/9756/files/image4.png?v=1', width: 800, height: 800 }],
    options: [],
  },
};

test('tolkaProdukt med valuta: prisText i dollar, valutan följer med, länken behålls', () => {
  const p = tolkaProdukt(JSON_US, { lank: 'https://carashell.com/products/takskyddet?country=US', valuta: 'USD' });
  assert.equal(p.valuta, 'USD');
  assert.equal(p.prisText, '$199');
  assert.equal(p.jamforprisText, '$249');
  assert.equal(p.url, 'https://carashell.com/products/takskyddet');
  assert.equal(p.kortTitel, 'Roof Cover for Travel Trailers & Motorhomes up to 21 ft (6.5 × 3 m)');
  const sv = tolkaProdukt({ product: { ...JSON_US.product, variants: [{ id: 1, title: 'x', price: '1129.00', compare_at_price: '1469.00' }] } });
  assert.equal(sv.valuta, 'SEK');
  assert.equal(sv.prisText, '1 129 kr');
});

// ------------------------------------------------------------ granskaCopy på engelska

function engelskCopy(overrides = {}) {
  const { mall, platser } = lasMall();
  const copy = copyUrMall(mall, platser);
  // Byt mallens egna priser (lägsta = priset, högsta = jämförpriset) mot dollar och rubriken mot engelska.
  const mallPriser = [...new Set(priserI(JSON.stringify(copy)))].sort((a, b) => a - b);
  // Mallens copy är brandad (nämner Bäverbutiken) — en obrandad engelsk copy säger "us".
  const ersatt = (s) => String(s).replace(/Bäverbutikens?/g, 'us').replace(/(\d[\d   ]*(?:[.,]\d{1,2})?)\s?(?:kr\b|:-)/gi, (m, tal) => {
    const n = Number(String(tal).replace(/[   ]/g, '').replace(',', '.'));
    return n === mallPriser[mallPriser.length - 1] && mallPriser.length > 1 ? '$249' : '$199';
  });
  const gaIgenom = (v) => (Array.isArray(v) ? v.map(gaIgenom) : typeof v === 'string' ? ersatt(v) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, gaIgenom(x)])) : v);
  const ut = gaIgenom(copy);
  ut.hero.rubrik = 'We ordered too many roof covers, so yours is $199 instead of $249 while stock lasts';
  return { ...ut, ...overrides };
}

const PRODUKT_US = { pris: 199, jamforpris: 249, valuta: 'USD', prisText: '$199', jamforprisText: '$249', url: 'https://carashell.com/products/takskyddet?country=US' };

test('granskaCopy på engelska: dollarpriser mot marknadens sida, engelska förbjudna fraser, källbutiken stoppas', () => {
  const { platser } = lasMall();
  const ok = granskaCopy(engelskCopy(), PRODUKT_US, platser, { locale: 'en' });
  assert.deepEqual(ok.fel.filter((f) => /priset|förbjuden|nämner/.test(f)), []);
  assert.ok(!ok.varningar.some((v) => /nämner inte priset|jämförpriset/.test(v)), ok.varningar.join('\n'));

  const felPris = engelskCopy();
  felPris.punkter[0].text += ' Only $179 today.';
  const g1 = granskaCopy(felPris, PRODUKT_US, platser, { locale: 'en' });
  assert.ok(g1.fel.some((f) => /priset \$179 finns inte på produktsidan \(tillåtet: \$199 \/ \$249\)/.test(f)), g1.fel.join('\n'));

  const fras = engelskCopy();
  fras.riskfritt.text += ' Order before stock runs out.';
  const g2 = granskaCopy(fras, PRODUKT_US, platser, { locale: 'en' });
  assert.ok(g2.fel.some((f) => /"before stock runs out" är förbjuden — write "while stock lasts"/.test(f)), g2.fel.join('\n'));

  const butik = engelskCopy();
  butik.arlig.stycken = [`${butik.arlig.stycken[0]} Here at CaraShell we care.`, ...butik.arlig.stycken.slice(1)];
  const g3 = granskaCopy(butik, PRODUKT_US, platser, { locale: 'en' });
  assert.ok(g3.fel.some((f) => /källbutiken carashell\.com/.test(f)), g3.fel.join('\n'));

  // Svenska "kr"-tal i en dollar-copy läses inte som priser — de fångas som text av ögat, inte av spärren.
  const kr = engelskCopy();
  kr.punkter[1].text += ' In Sweden it costs 1 129 kr.';
  assert.deepEqual(granskaCopy(kr, PRODUKT_US, platser, { locale: 'en' }).fel.filter((f) => /priset/.test(f)), []);
});

test('granskaCopy per språk: period- och antalsorden är språkets', () => {
  const { platser } = lasMall();
  const en = engelskCopy();
  en.hero.rubrik = 'We tested the roof cover for a whole winter — here is what happened';
  const gVi = granskaCopy(en, PRODUKT_US, platser, { locale: 'en', koncept: 'vi-testade' });
  assert.ok(!gVi.varningar.some((v) => /saknar testperioden/.test(v)), gVi.varningar.join('\n'));
  en.hero.rubrik = 'We tested the roof cover — here is what happened';
  assert.ok(granskaCopy(en, PRODUKT_US, platser, { locale: 'en', koncept: 'vi-testade' }).varningar.some((v) => /saknar testperioden/.test(v)));
  en.hero.rubrik = 'Five reasons to get a roof cover before winter';
  const gAnl = granskaCopy(en, PRODUKT_US, platser, { locale: 'en', koncept: 'anledningar' });
  assert.ok(!gAnl.varningar.some((v) => /nämner inte antalet/.test(v)), gAnl.varningar.join('\n'));
  en.hero.rubrik = 'Reasons to get a roof cover before winter';
  assert.ok(granskaCopy(en, PRODUKT_US, platser, { locale: 'en', koncept: 'anledningar' }).varningar.some((v) => /nämner inte antalet \(5\/five\)/.test(v)));
});

// ------------------------------------------------------------ sidan på engelska

test('byggSida och renderaHtml på engelska: By, Last updated, Summary, reklammärkningen, engelskt sidnamn', () => {
  const { mall, platser } = lasMall();
  const copy = engelskCopy();
  const produkt = { url: 'https://carashell.com/products/takskyddet?country=US', kortTitel: 'Roof Cover for Travel Trailers', slug: 'takoverdrag-husvagn-husbil-6-5-3-m', valuta: 'USD' };
  const { sida, rapport } = byggSida({ mall, platser, produkt, copy, datum: '2026-09-16', locale: 'en' });
  assert.equal(rapport.namn, 'Roof Cover for Travel Trailers – Clearance sale (listicle)');
  assert.equal(rapport.handle, 'takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning');
  assert.equal(rapport.brand.forfattare, 'Anders from the warehouse');
  const texter = lasAvSida(sida).map((r) => String(r.text ?? ''));
  assert.ok(texter.includes('By **Anders from the warehouse.**'), texter.join('\n'));
  assert.ok(texter.includes('Last updated September 16, 2026.'));
  assert.ok(texter.includes('Note: this is an advertisement.'));
  assert.ok(!texter.some((t) => /Senast uppdaterad|OBS: Detta är reklam|^Av \*\*/.test(t)));
  assert.equal(forfattarHtml({ forfattare: 'Anders' }, 'en'), '<p>By <strong>Anders.</strong></p>');
  assert.match(sidfotHtml({}, 'en'), /Note: this is an advertisement\./);

  const html = renderaHtml({ copy, produkt, bilder: {}, fasta: Object.fromEntries(['hero', 'punkt1', 'punkt2', 'punkt3', 'punkt4', 'punkt5', 'lyckas', 'arlig'].map((p) => [p, { src: `https://x/${p}.png`, width: 10, height: 10 }])), datum: '2026-09-16', locale: 'en', stil: 'ingen' });
  assert.match(html, /<p>By <strong>Anders from the warehouse\.<\/strong><\/p>/);
  assert.match(html, /Last updated September 16, 2026\./);
  assert.match(html, /<strong>Summary:<\/strong>/);
  assert.match(html, /Note: this is an advertisement\./);
  assert.match(html, /alt="The warehouse"/);
  assert.match(html, /– point 3"/);
  assert.ok(!/Sammanfattning|Senast uppdaterad|OBS: Detta/.test(html));
  assert.match(somDokument('<div class="lr"></div>', { lang: 'en' }), /<html lang="en">/);
  // Svenska sidan är oförändrad.
  const sv = renderaHtml({ copy: copyUrMall(mall, platser), produkt: { ...produkt, kortTitel: 'Motorhölje' }, bilder: {}, fasta: Object.fromEntries(['hero', 'punkt1', 'punkt2', 'punkt3', 'punkt4', 'punkt5', 'lyckas', 'arlig'].map((p) => [p, { src: `https://x/${p}.png`, width: 10, height: 10 }])), datum: '2026-09-16', stil: 'ingen' });
  assert.match(sv, /<p>Av <strong>Anders på lagret\.<\/strong><\/p>/);
  assert.match(sv, /<strong>Sammanfattning:<\/strong>/);
});

// ------------------------------------------------------------ marknaden ur butiksfilen

function butikerMapp() {
  const mapp = mkdtempSync(join(tmpdir(), 'lp-butiker-'));
  writeFileSync(join(mapp, 'carashell.yaml'), [
    'butik:',
    '  id: carashell',
    '  myshopify: "yitrbk-m3.myshopify.com"',
    '  supportmail: "hello@carashell.se"',
    '  marknader:',
    '    - land: NO',
    '      locale: nb',
    '      valuta: SEK',
    '    - land: US',
    '      locale: en',
    '      valuta: USD',
    '      doman: carashell.com',
    '',
  ].join('\n'));
  writeFileSync(join(mapp, 'drytrek.yaml'), 'butik:\n  id: drytrek\n  supportmail: "hello@drytrek.se"\n  marknader:\n    - land: NO\n');
  return mapp;
}

test('marknadForButik: USA med egen domän, Norge på butikens domän, okänd marknad och Bäverbutiken stoppar', () => {
  const mapp = butikerMapp();
  const us = marknadForButik('carashell', 'us', { butikerMapp: mapp });
  assert.deepEqual({ kod: us.kod, locale: us.locale, valuta: us.valuta, doman: us.doman, egen: us.egen, namn: us.namn }, { kod: 'US', locale: 'en', valuta: 'USD', doman: 'carashell.com', egen: true, namn: 'USA' });
  assert.equal(marknadsProduktLank(us, 'takskyddet'), 'https://carashell.com/products/takskyddet?country=US');
  assert.equal(marknadsSidlank(us, 'takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning'), 'https://carashell.com/pages/takoverdrag-husvagn-husbil-6-5-3-m-lagerrensning?country=US');
  const no = marknadForButik('carashell', 'NO', { butikerMapp: mapp });
  assert.deepEqual({ locale: no.locale, valuta: no.valuta, doman: no.doman, egen: no.egen }, { locale: 'nb', valuta: 'SEK', doman: 'carashell.se', egen: false });
  assert.equal(marknadsProduktLank(no, 'takskyddet'), 'https://carashell.se/nb/products/takskyddet?country=NO');
  assert.equal(marknadsSidlank(no, 'x-lagerrensning'), 'https://carashell.se/nb/pages/x-lagerrensning?country=NO');
  // Raden utan locale/valuta får landets standard (lander.mjs).
  const dt = marknadForButik('drytrek', 'NO', { butikerMapp: mapp });
  assert.deepEqual({ locale: dt.locale, valuta: dt.valuta }, { locale: 'nb', valuta: 'NOK' });
  // Ett land inom marknaden: egen valuta ur landstabellen, egen ?country=, egen sida.
  const gb = landForMarknad(us, 'gb');
  assert.deepEqual({ kod: gb.kod, land: gb.land, valuta: gb.valuta, namn: gb.namn, landEn: gb.landEn, egetLand: gb.egetLand, doman: gb.doman }, { kod: 'US', land: 'GB', valuta: 'GBP', namn: 'Storbritannien', landEn: 'United Kingdom', egetLand: true, doman: 'carashell.com' });
  assert.equal(marknadsProduktLank(gb, 'takskyddet'), 'https://carashell.com/products/takskyddet?country=GB');
  assert.equal(marknadsSidlank(gb, 'x-lagerrensning-gb'), 'https://carashell.com/pages/x-lagerrensning-gb?country=GB');
  assert.equal(landForMarknad(us, 'NZ').valuta, 'NZD');
  assert.equal(landForMarknad(us, 'CA').namn, 'Kanada');
  assert.equal(landForMarknad(us, 'US'), us, 'marknadens eget land är marknaden själv');
  assert.throws(() => landForMarknad(us, 'XX'), /Okänt land "XX"/);
  assert.throws(() => marknadForButik('carashell', 'DK', { butikerMapp: mapp }), /ingen marknad DK .*marknader: NO, US/);
  assert.throws(() => marknadForButik('baverbutiken', 'US', { butikerMapp: mapp }), /Bäverbutiken har inga marknader/);
  assert.throws(() => marknadForButik('okand', 'US', { butikerMapp: mapp }), /ingen factory\/butiker\/okand\.yaml/);
  assert.throws(() => marknadForButik('carashell', '', { butikerMapp: mapp }), /marknadskod saknas/);
});

// ------------------------------------------------------------ översättningen mot en låtsas-klient

function latsasKlient({ scopes = ['write_themes', 'write_content', 'write_translations'], sida = { id: 'gid://shopify/Page/1', handle: 'x-lagerrensning', title: 'X – lagerrensning', templateSuffix: 'listicle', isPublished: true } } = {}) {
  const anrop = [];
  const lagrade = new Map();
  const graphql = async (query, variables) => {
    anrop.push({ query, variables });
    if (/translatableResource\(resourceId/.test(query) && /translatableContent/.test(query)) {
      return { translatableResource: { resourceId: variables.id, translatableContent: [
        { key: 'title', value: 'X – lagerrensning', digest: 'd-title', locale: 'sv' },
        { key: 'body_html', value: '<div class="lr">sv</div>', digest: 'd-body', locale: 'sv' },
        { key: 'meta_title', value: '', digest: 'd-meta', locale: 'sv' },
      ] } };
    }
    if (/translations\(locale/.test(query)) return { translatableResource: { translations: [...lagrade.values()] } };
    if (/translationsRegister/.test(query)) {
      for (const t of variables.translations) lagrade.set(t.key, { key: t.key, value: t.value, outdated: false });
      return { translationsRegister: { translations: variables.translations.map((t) => ({ key: t.key, locale: t.locale })), userErrors: [] } };
    }
    if (/pages\(first/.test(query)) return { pages: { nodes: sida ? [sida] : [] } };
    throw new Error(`oväntad fråga: ${query.slice(0, 60)}`);
  };
  return { graphql, scopes, shop: 'yitrbk-m3.myshopify.com', namn: 'CaraShell', bas: 'https://carashell.se', butik: { losenord: '' }, anrop, lagrade };
}

test('oversattSida registrerar title + body_html med digest på rätt locale och läser tillbaka', async () => {
  const k = latsasKlient();
  const logg = [];
  const r = await oversattSida(k, { sidaId: 'gid://shopify/Page/1', locale: 'en', titel: 'X – clearance sale', body: '<div class="lr">en</div>', logg: (x) => logg.push(x) });
  assert.deepEqual(r, { registrerade: ['title', 'body_html'], torr: false });
  const reg = k.anrop.find((a) => /translationsRegister/.test(a.query));
  assert.deepEqual(reg.variables.translations, [
    { key: 'title', value: 'X – clearance sale', locale: 'en', translatableContentDigest: 'd-title' },
    { key: 'body_html', value: '<div class="lr">en</div>', locale: 'en', translatableContentDigest: 'd-body' },
  ]);
  assert.ok(logg.some((l) => /översättning en registrerad .*title \+ body_html/.test(l)), logg.join('\n'));
});

test('oversattSida: torr registrerar inget; utan write_translations stopp; saknat fält stopp; olik tillbakaläsning stopp', async () => {
  const torr = latsasKlient();
  const r = await oversattSida(torr, { sidaId: 'gid://shopify/Page/1', locale: 'en', titel: 't', body: 'b', torr: true });
  assert.deepEqual(r, { registrerade: [], torr: true });
  assert.ok(!torr.anrop.some((a) => /translationsRegister/.test(a.query)));

  const utanScope = latsasKlient({ scopes: ['write_themes', 'write_content'] });
  await assert.rejects(oversattSida(utanScope, { sidaId: 'gid://shopify/Page/1', locale: 'en', titel: 't', body: 'b' }), /saknar write_translations/);

  const utanFalt = latsasKlient();
  const ursprung = utanFalt.graphql;
  utanFalt.graphql = async (q, v) => (/translatableContent/.test(q) ? { translatableResource: { resourceId: v.id, translatableContent: [{ key: 'title', value: 'x', digest: 'd', locale: 'sv' }] } } : ursprung(q, v));
  await assert.rejects(oversattSida(utanFalt, { sidaId: 'gid://shopify/Page/1', locale: 'en', titel: 't', body: 'b' }), /fälten body_html finns inte/);

  const olik = latsasKlient();
  const u2 = olik.graphql;
  olik.graphql = async (q, v) => (/translations\(locale/.test(q) ? { translatableResource: { translations: [{ key: 'title', value: 'annat', outdated: false }, { key: 'body_html', value: 'b', outdated: false }] } } : u2(q, v));
  await assert.rejects(oversattSida(olik, { sidaId: 'gid://shopify/Page/1', locale: 'en', titel: 't', body: 'b' }), /lästes inte tillbaka lika: title/);
});

test('granskaPublikSida med språkkrav: den engelska rubriken måste finnas, den svenska får inte', () => {
  const bas = '<html><head><link href="//x/listicle.css"></head><body class="listicle-sida"><div class="lr"><h1 class="lr-h1">We ordered too many roof covers</h1><footer class="lr-sidfot"></footer></div></body></html>';
  assert.deepEqual(granskaPublikSida(bas, { maste: ['We ordered too many roof covers'], farInte: ['Vi beställde in för många'] }), { ok: true, fel: [] });
  const sv = bas.replace('We ordered too many roof covers', 'Vi beställde in för många taköverdrag');
  const g = granskaPublikSida(sv, { maste: ['We ordered too many roof covers'], farInte: ['Vi beställde in för många'] });
  assert.equal(g.ok, false);
  assert.ok(g.fel.some((f) => /saknas — sidan visar inte den versionen/.test(f)), g.fel.join('\n'));
  assert.ok(g.fel.some((f) => /finns på sidan — fel språk renderas/.test(f)), g.fel.join('\n'));
});

test('publiceraMarknad: stoppar när den svenska sidan saknas eller har fel mall (utan att röra nätet)', async () => {
  const env = { SHOPIFY_SHOP_yitrbk_m3: 'yitrbk-m3.myshopify.com', SHOPIFY_CLIENT_ID_yitrbk_m3: 'id', SHOPIFY_CLIENT_SECRET_yitrbk_m3: 'hemlig' };
  const marknad = { kod: 'US', land: 'US', locale: 'en', valuta: 'USD', doman: 'carashell.com', egen: true, namn: 'USA' };
  // fetchFn: token-mintningen + shop-frågan + sidfrågan, inget mer.
  const fetchFn = async (url, init) => {
    if (/oauth\/access_token/.test(url)) return { ok: true, status: 200, json: async () => ({ access_token: 'tok', expires_in: 3600 }), text: async () => '' };
    const body = JSON.parse(init.body);
    if (/currentAppInstallation/.test(body.query)) return { ok: true, status: 200, json: async () => ({ data: { shop: { name: 'CaraShell', myshopifyDomain: 'yitrbk-m3.myshopify.com', primaryDomain: { url: 'https://carashell.se' } }, currentAppInstallation: { app: { title: 'Fabriken' }, accessScopes: [{ handle: 'write_themes' }, { handle: 'write_content' }, { handle: 'write_translations' }] } } }) };
    if (/pages\(first/.test(body.query)) return { ok: true, status: 200, json: async () => ({ data: { pages: { nodes: [] } } }) };
    throw new Error(`oväntat anrop: ${body.query.slice(0, 40)}`);
  };
  await assert.rejects(
    publiceraMarknad({ butik: 'carashell', marknad, handle: 'x-lagerrensning', titel: 't', body: '<div class="lr"></div>', env, fetchFn, logg: () => {} }),
    /finns inte i CaraShell — bygg den svenska sidan först/
  );
  await assert.rejects(
    publiceraMarknad({ butik: 'carashell', marknad: { kod: 'US' }, handle: 'x', titel: 't', body: 'b', env, fetchFn, logg: () => {} }),
    /marknaden behöver kod, locale och doman/
  );
});
