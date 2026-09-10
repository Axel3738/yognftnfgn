// Tester för brand-detektorn (Uppdrag A i factory/FAS2.md).
// Kör: node --test factory/test/*.test.mjs
//
// Allt här är rena funktioner — inget nätverk, inget annonskonto, ingen OCR.
// Det som testas är exakt det som får kosta pengar om det blir fel:
// hittar vi brandnamnet, och blir domen den dyraste ytan?

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { sökBrand, normalisera, avstånd } from '../brandord.mjs';
import {
  copyFält, länkAv, mediaAv, klassa, transkriptFör, läsTranskript, replikerMedBrand,
  attGöra, sökVillkor, vägSamman, källaViaTitel, villkorstexter,
} from '../brand-detektor.mjs';
import { lasYaml } from '../yaml.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- brandord

test('normalisera plattar å/ä/ö och skiljetecken', () => {
  assert.equal(normalisera('BÄVERBUTIKEN.se'), 'baverbutikense');
  assert.equal(normalisera('Bäver-butiken!'), 'baverbutiken');
});

test('hittar brandnamnet i alla kända skrivningar', () => {
  for (const s of ['Bäverbutiken', 'baverbutiken.se', 'hos BÄVERBUTIKEN idag', 'Beverbutikken']) {
    assert.equal(sökBrand(s).träff, true, s);
  }
});

test('hittar HeyGens felhörningar — även en som inte står i listan', () => {
  // De två mätta felhörningarna står i listan …
  assert.equal(sökBrand('Köp hos Bawebutiken nu').träff, true);
  assert.equal(sökBrand('finns på Spavebutiken').träff, true);
  // … men "Babe-butiken" (motocentric_GT_1_H1) gör det inte. Den fastnar bara
  // om fuzzy-passet finns kvar. Tas det bort missas nästa felhörning tyst.
  const r = sökBrand('Ge honom friheten att packa mer hos Babe-butiken.');
  assert.equal(r.träff, true);
  assert.match(r.fynd[0].sätt, /^fuzzy\(\d\)$/);
});

test('vanlig svenska ger inga falska träffar', () => {
  const texter = [
    'Trött på grönt, algfyllt regnvatten? Skydda din tank idag.',
    'Passar standard 1000L IBC-tank. Kraftigt 210D Oxford-tyg.',
    'Klart vatten. Ingen alg. Enkelt.',
    'Beställ i webbutiken innan lagret tar slut.',   // "butiken" utan brand
    'Butiken har öppet till klockan sex.',
  ];
  for (const t of texter) assert.equal(sökBrand(t).träff, false, t);
});

test('fyndet redovisas ordagrant, så en fuzzy-träff går att granska', () => {
  const r = sökBrand('Köp hos Babe-butiken.');
  assert.equal(r.fynd[0].ord, 'Babe-butiken.');
  assert.equal(r.fynd[0].form, 'baverbutiken');
});

test('avstånd avbryter över taket i stället för att räkna klart', () => {
  assert.equal(avstånd('baverbutiken', 'baverbutiken'), 0);
  assert.equal(avstånd('bawebutiken', 'baverbutiken'), 2);
  assert.ok(avstånd('kranskydd', 'baverbutiken') > 3);
});

test('extra_brandord tas emot från produktfilen', () => {
  assert.equal(sökBrand('Levereras av Bäverbolaget').träff, false);
  assert.equal(sökBrand('Levereras av Bäverbolaget', ['Bäverbolaget']).träff, true);
});

// ------------------------------------------------------- creative-läsningen

const videoAnnons = {
  name: 'IBC_PD_1_H1',
  creative: {
    name: 'Klart vatten – PD_1_H1',
    video_id: '826839650518396',
    object_story_spec: {
      page_id: '678639638662543',
      video_data: {
        video_id: '1367356292221497',
        title: 'Klart vatten. Ingen alg. Enkelt.',
        message: 'Trött på grönt, algfyllt regnvatten?',
        link_description: 'Passar standard 1000L IBC-tank.',
        call_to_action: { type: 'SHOP_NOW', value: { link: 'https://baverbutiken.se/products/ibc-tankoverdrag-1000-l-stoppar-alger-uv' } },
      },
    },
  },
};

const bildAnnons = {
  name: 'IBC_BOF_1_1',
  creative: {
    image_hash: '4e065a3a',
    image_url: 'https://www.facebook.com/ads/image/?d=abc',
    object_story_spec: { link_data: { link: 'https://baverbutiken.se/products/ibc-tankoverdrag-1000-l-stoppar-alger-uv', message: 'Klart vatten hela sommaren' } },
  },
};

test('copyFält plockar message, headline och description ur video_data', () => {
  const fält = copyFält(videoAnnons).map((f) => f.fält);
  assert.deepEqual(fält.sort(), ['creative.name', 'description', 'headline', 'message']);
});

test('copyFält läser även asset_feed_spec (Advantage+-creatives)', () => {
  const a = { name: 'X', creative: { asset_feed_spec: { bodies: [{ text: 'Köp hos Bäverbutiken' }], titles: [{ text: 'Klart vatten' }] } } };
  const texter = copyFält(a).map((f) => f.text);
  assert.ok(texter.includes('Köp hos Bäverbutiken'));
});

test('länken hittas i både video_data och link_data', () => {
  assert.match(länkAv(videoAnnons), /baverbutiken\.se/);
  assert.match(länkAv(bildAnnons), /baverbutiken\.se/);
});

test('mediaAv skiljer video från bild', () => {
  assert.equal(mediaAv(videoAnnons).typ, 'video');
  assert.equal(mediaAv(bildAnnons).typ, 'bild');
});

// ----------------------------------------------------------- transkripten

test('transkriptFör provar alla slug i listan', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'srt-'));
  mkdirSync(join(tmp, 'a', 'srt-orig'), { recursive: true });
  writeFileSync(join(tmp, 'a', 'srt-orig', 'ibc_PD_1_H1.orig.srt'), '1\n00:00:01,000 --> 00:00:02,000\nhej\n');
  writeFileSync(join(tmp, 'a', 'srt-orig', 'ibc-tanktrekk_GT_3_H1.orig.srt'), '1\n00:00:01,000 --> 00:00:02,000\nhej\n');
  const index = läsTranskript(tmp);
  const kalla = { annonsprefix: 'IBC', srt_slug: ['ibc', 'ibc-tanktrekk'] };
  assert.ok(transkriptFör('IBC_PD_1_H1', kalla, index));
  assert.ok(transkriptFör('IBC_GT_3_H1', kalla, index));   // norska slugget
  assert.equal(transkriptFör('IBC_PD_Extra', kalla, index), null);
});

test('replikerMedBrand ger tidkoden och repliken som belägg', () => {
  const srt = '1\n00:00:00,000 --> 00:00:03,000\nTrött på alger?\n\n2\n00:00:20,000 --> 00:00:24,000\nFinns hos Bäverbutiken.\n';
  const r = replikerMedBrand(srt);
  assert.equal(r.length, 1);
  assert.equal(r[0].tid, '00:00:20,000 --> 00:00:24,000');
  assert.match(r[0].text, /Bäverbutiken/);
});

// ------------------------------------------------------------------ domen

const ytaRen = { tillämplig: true, träff: false, fynd: [] };
const ytaTräff = { tillämplig: true, träff: true, fynd: [{ ord: 'Bäverbutiken' }] };
const ytaOkänd = { tillämplig: true, träff: null, fynd: [], dom: 'okänd (media inte hämtad)' };
const ytaEj = { tillämplig: false, träff: null, dom: 'ej tillämplig (bildannons)' };

test('ren när alla lästa ytor är rena', () => {
  assert.equal(klassa({ copy: ytaRen, tal: ytaRen, inbränd: ytaRen, bild: ytaEj }), 'ren');
});

test('dyraste ytan bestämmer domen', () => {
  // Talet kostar HeyGen-krediter och slår allt annat.
  assert.equal(klassa({ copy: ytaTräff, tal: ytaTräff, inbränd: ytaTräff, bild: ytaEj }), 'kräver-omdubb');
  // Slutkort kostar arbetstid och slår copy.
  assert.equal(klassa({ copy: ytaTräff, tal: ytaRen, inbränd: ytaTräff, bild: ytaEj }), 'kräver-slutkortsbygge');
  // Copy och bildattribution är gratis att fixa.
  assert.equal(klassa({ copy: ytaTräff, tal: ytaRen, inbränd: ytaRen, bild: ytaEj }), 'bara-copy');
  assert.equal(klassa({ copy: ytaRen, tal: ytaEj, inbränd: ytaEj, bild: ytaTräff }), 'bara-copy');
});

test('en oläst yta blir okänd — aldrig ren', () => {
  assert.equal(klassa({ copy: ytaRen, tal: ytaRen, inbränd: ytaOkänd, bild: ytaEj }), 'okänd');
  // … men en läst träff på en dyrare yta står kvar även om något är oläst.
  assert.equal(klassa({ copy: ytaRen, tal: ytaTräff, inbränd: ytaOkänd, bild: ytaEj }), 'kräver-omdubb');
});

// -------------------------------------------------- alla ytor, inte bara domen

test('attGöra listar VARJE yta som kräver arbete, inte bara den dyraste', () => {
  // Fallet som gav regeln: IBC_SP_1_H2 är "kräver-omdubb" på grund av talet OCH
  // bär en inbränd brandrad. Läser någon bara domen kommer annonsen tillbaka
  // från HeyGen med Bäverbutiken kvar i bild.
  const ytor = { copy: ytaRen, tal: ytaTräff, inbränd: ytaTräff, bild: ytaEj };
  assert.equal(klassa(ytor), 'kräver-omdubb');
  assert.deepEqual(attGöra(ytor), ['tal', 'inbränd text']);
});

test('attGöra märker ut olästa ytor så de inte försvinner tyst', () => {
  assert.deepEqual(attGöra({ copy: ytaRen, tal: ytaTräff, inbränd: ytaOkänd, bild: ytaEj }),
    ['tal', 'inbränd text (oläst)']);
  assert.deepEqual(attGöra({ copy: ytaRen, tal: ytaRen, inbränd: ytaRen, bild: ytaEj }), []);
});

// -------------------------------------------------- sjätte ytan: villkoren
//
// Bakläxan 2026-09-09 (HeimGuard): brand-detektorn letade bara efter
// brandNAMNET och friade 38 av 40 svenska annonser. Fem bar Bäverbutikens
// "fri frakt över 300 kr" — två av dem bevisade vinnare. Domen sa `ren`,
// annonserna laddades upp, och OPS-butiken lovade en fraktgräns den inte har.

const alltRent = { copy: ytaRen, tal: ytaRen, inbränd: ytaRen, bild: ytaEj };

test('en annons med villkorsfel blir ALDRIG ren', () => {
  const fel = [{ regel: 'fraktgräns', yta: 'copy', rad: 'Fri frakt över 300 kr', fel: 'lovar fraktgräns "Fri frakt över 300 kr" — butiken har fri frakt UTAN gräns' }];
  assert.equal(klassa({ ...alltRent, villkorsfel: fel }), 'bara-copy');
  // Utan villkorsfel är exakt samma annons ren — det är villkoren som fäller den.
  assert.equal(klassa({ ...alltRent, villkorsfel: [] }), 'ren');
});

test('ytan där villkorsfelet står bestämmer vad det kostar att rätta', () => {
  const påTal = [{ regel: 'fraktgräns', yta: 'tal', rad: 'fri frakt över trehundra kronor', fel: '…' }];
  const påInbränd = [{ regel: 'öppet köp', yta: 'inbränd', rad: '30 dagars öppet köp', fel: '…' }];
  // Talet kräver HeyGen-krediter, precis som ett uttalat brandnamn.
  assert.equal(klassa({ ...alltRent, villkorsfel: påTal }), 'kräver-omdubb');
  // Inbränd text kräver ett nytt slutkort.
  assert.equal(klassa({ ...alltRent, villkorsfel: påInbränd }), 'kräver-slutkortsbygge');
});

test('villkorsfelet står i attGöra med sin egen förklaring', () => {
  const ytor = { ...alltRent, villkorsfel: [{ regel: 'fraktgräns', yta: 'copy', rad: '…', fel: 'lovar fraktgräns "Fri frakt över 300 kr" — butiken har fri frakt UTAN gräns' }] };
  assert.deepEqual(attGöra(ytor), ['fraktgräns i copy: lovar fraktgräns "Fri frakt över 300 kr" — butiken har fri frakt UTAN gräns']);
});

test('villkorstexter märker varje text med ytan den står på', () => {
  const annons = { name: 'X_PD_1_H1', creative: { body: 'Fri frakt över 300 kr', title: 'Rubrik' } };
  const ocrPost = { filer: [{ texter: [{ text: '30 dagars öppet köp' }] }] };
  const texter = villkorstexter(annons, ocrPost, ['fri frakt över trehundra kronor']);
  const ytor = texter.map((t) => t.yta);
  assert.ok(ytor.includes('copy'), 'copyfälten ska med');
  assert.ok(ytor.includes('inbränd'), 'OCR-texten ska med');
  assert.ok(ytor.includes('tal'), 'transkriptet ska med');
  // Utan OCR och utan transkript finns bara copy — och det ska sägas, inte gissas.
  assert.deepEqual(villkorstexter(annons, null, []).map((t) => t.yta), ['copy', 'copy']);
});

// ---------------------------------------------- källbutikens villkor (yta 5)

test('sökVillkor hittar pris, rabatt, frakt, betalsätt och recensioner', () => {
  const funna = sökVillkor([
    '489 kr istället för 636 kr',
    'Spara 23 % nu',
    'Fri frakt över 300 kr',
    'Klarna — betala sen',
    '30 dagars öppet köp',
    '10 recensioner',
  ]);
  const namn = funna.map((f) => f.namn).sort();
  assert.deepEqual(namn, ['betalsätt', 'frakt', 'pris', 'rabatt', 'recensioner', 'öppet köp']);
  assert.ok(funna.find((f) => f.namn === 'pris').värden.includes('489 kr'));
});

test('sökVillkor hittar inget i text utan erbjudande', () => {
  assert.deepEqual(sökVillkor(['Klart vatten. Ingen alg. Enkelt.']), []);
});

// ------------------------------------------------------- ögongranskningen

test('ögat kan lägga till en träff maskinen missade', () => {
  const vägd = vägSamman(ytaRen, { syns: true, var: 'inbränd text', ordagrant: 'från Bäbebutiken.', sekund: '11.6' });
  assert.equal(vägd.träff, true);
  assert.equal(vägd.källa, 'syn');
  assert.equal(vägd.fynd.at(-1).ord, 'från Bäbebutiken.');
});

test('ögat får aldrig radera en maskinträff — oenighet flaggas i stället', () => {
  const vägd = vägSamman(ytaTräff, { syns: false, var: 'ingenstans' });
  assert.equal(vägd.träff, true, 'träffen ska stå kvar');
  assert.equal(vägd.oenig, true);
});

test('ögat kan läsa en yta maskinen inte kunde läsa', () => {
  // IBC_PD_Extra: OCR gav en teckenartefakt på 31 frames — oskiljbart från
  // trasig OCR, alltså "okänd". En granskare gick igenom hela videon och såg
  // varken text, logotyp eller sajt. Då är ytan läst, och den är ren.
  const vägd = vägSamman(ytaOkänd, { syns: false, var: 'ingenstans' });
  assert.equal(vägd.träff, false);
  assert.equal(vägd.källa, 'syn');
  assert.equal(vägd.dom, undefined, 'okänd-domen ska försvinna när ytan blivit läst');
});

test('samstämmig läsning märks som bekräftad', () => {
  assert.equal(vägSamman(ytaRen, { syns: false }).bekräftad_av_syn, true);
  assert.equal(vägSamman(ytaTräff, { syns: true }).bekräftad_av_syn, true);
});

test('utan ögongranskning ändras ingenting', () => {
  assert.equal(vägSamman(ytaRen, null).syn, null);
  assert.equal(vägSamman(ytaRen, null).träff, false);
});

// ------------------------------------------------------ videokällan i kontot

test('källaViaTitel matchar redigerarens filnamn mot annonsnamnet', () => {
  const index = new Map([
    ['titel:ibc-tanköverdrag_pd_1_h1', 'https://exempel/1.mp4'],
    ['titel:ibc_gt_3_h1', 'https://exempel/2.mp4'],
  ]);
  // Exakt titel först …
  assert.equal(källaViaTitel(index, 'IBC_GT_3_H1', 'IBC'), 'https://exempel/2.mp4');
  // … annars samma svans efter prefixet ("IBC" ↔ "IBC-tanköverdrag").
  assert.equal(källaViaTitel(index, 'IBC_PD_1_H1', 'IBC'), 'https://exempel/1.mp4');
  assert.equal(källaViaTitel(index, 'IBC_SP_9_H9', 'IBC'), null);
});

// -------------------------------------------------------- källkopplingen

test('TankGuards produktfil bär källkopplingen maskinläsbart', () => {
  const p = lasYaml(readFileSync(join(ROT, 'produkter', 'tankguard.yaml'), 'utf8'));
  assert.equal(p.kalla.annonsprefix, 'IBC');
  assert.equal(p.kalla.produkt_id, '16454828654941');
  // Källkontot är Bäverbutiken, målkontot OPS Factory. Blir de samma är något
  // katastrofalt fel — då laddas OPS-annonser upp i Bäverbutikens konto.
  assert.equal(p.kalla.annonskonto, '1867947880635861');
  assert.equal(p.meta.ad_account_id, '915422744950975');
  assert.notEqual(p.kalla.annonskonto, p.meta.ad_account_id);
});

test('varje produktfil med kalla-block pekar på rätt källkonto', () => {
  for (const id of ['tankguard', 'overvakningskameran', 'dummyprodukten']) {
    const p = lasYaml(readFileSync(join(ROT, 'produkter', `${id}.yaml`), 'utf8'));
    assert.equal(p.kalla.annonskonto, '1867947880635861', id);
    assert.ok(p.kalla.annonsprefix, `${id} saknar annonsprefix`);
  }
});
