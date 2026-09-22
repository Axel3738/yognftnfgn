// Ren logik i tools/invandningsmatris.mjs: matrisen läses, räknas, byggs och
// renderas utan nät. Förlagan är Taköverdragets fil 2026-09-22.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  matrisUrText, tackning, tackningText, raknaInvandningar, byggMatris, rendera, formatUrNamn, arOb,
  invandningUrBrief, sammaAnnons, nyckelUrEtikett, kortnamn, cellTom, cellLive, FORMAT,
} from '../invandningsmatris.mjs';
import { sokMejl, kundmejl } from '../../kundtjanst/mail.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TAK = readFileSync(join(ROT, 'products', 'takoverdraget-husvagn', 'invandningar.md'), 'utf8');

test('matrisUrText läser förlagan: fem rader, fyra format, fyllda och tomma rutor, andelen ur etiketten', () => {
  const m = matrisUrText(TAK);
  assert.equal(m.finns, true);
  assert.deepEqual(m.kolumner, FORMAT.map((f) => f.rubrik));
  assert.equal(m.rader.length, 5);
  const fukt = m.rader[0];
  assert.equal(fukt.nyckel, 'fukt / kondens / självdrag');
  assert.equal(fukt.andel, 0.38);
  assert.equal(fukt.celler.video, '`OB_4_H1` briefad, ej live');
  assert.equal(fukt.celler.statisk, null);
  assert.match(m.efter, /## Varför det här är produktens viktigaste lucka/, 'sessionens sektioner efter tabellen bevaras');
  assert.match(m.fore, /## Vad kunderna invänder/);
  assert.equal(matrisUrText('# Tom fil\n').finns, false);
});

test('tackning: live räknas som svar, briefad räknas som fylld (fylls inte igen), tomma är nästa brief', () => {
  const t = tackning(matrisUrText(TAK).rader);
  const fukt = t[0];
  assert.equal(fukt.live, 0); assert.equal(fukt.fyllda, 1); assert.equal(fukt.briefade, 1); assert.equal(fukt.obesvarad, true);
  assert.deepEqual(fukt.tomma, ['statisk', 'demo', 'jamforelse']);
  assert.equal(tackningText(fukt), 'fukt 0 av 4 format (+1 briefad) (38 %)');
  const blaser = t[1];
  assert.equal(blaser.live, 1); assert.equal(blaser.obesvarad, false);
  assert.equal(tackningText(blaser), 'blåser 1 av 4 format');
  assert.equal(cellLive('`OB_1_H1` live'), true);
  assert.equal(cellLive('`OB_4_H1` briefad, ej live'), false);
  assert.equal(cellTom('⬜'), true); assert.equal(cellTom('—'), true); assert.equal(cellTom(''), true);
});

test('formatUrNamn, arOb, sammaAnnons, nyckel och kortnamn', () => {
  assert.equal(formatUrNamn('Takoverdrag_OB_4_H1'), 'video');
  assert.equal(formatUrNamn('MC-Kapell_OB_3_1'), 'statisk');
  assert.equal(formatUrNamn('Takoverdrag_OB'), null);
  assert.equal(arOb('Takoverdrag_OB_4_H1'), true);
  assert.equal(arOb('Takoverdrag_BOF_4_1'), false);
  assert.equal(sammaAnnons('Takoverdrag_OB_4_H1', 'OB_4_H1'), true);
  assert.equal(sammaAnnons('Takoverdrag_OB_14_H1', 'OB_4_H1'), false, '_14 slutar inte på _4');
  assert.equal(nyckelUrEtikett('**Fukt / kondens / självdrag** (38 %)'), 'fukt / kondens / självdrag');
  assert.equal(kortnamn('**Fukt / kondens / självdrag** (38 %)'), 'fukt');
});

test('raknaInvandningar: klustren ur annonskommentarer.mjs, andel på ALLA poster, beröm och taggar räknas inte som invändning', () => {
  const kommentarer = [
    ...Array.from({ length: 11 }, (_, i) => ({ message: i % 2 ? 'Att täcka så där välkomnar du kondens och fukt.' : 'Taket torkar inte om man stänger in fukt, blir mögel' })),
    { message: 'Blåser det inte sönder??' }, { message: 'Skräp' }, { message: 'Täcker för lite, väggarna tar stryk' },
    ...Array.from({ length: 12 }, () => ({ message: 'Anna Andersson' })),
    { message: 'Toppen, nöjd!' }, { message: 'Var köper man den?' }, { message: 'Hur mycket kostar den?' },
  ];
  const mejl = [{ amne: 'Fråga om taköverdraget', text: 'Blir det inte fukt under den?' }];
  const r = raknaInvandningar({ kommentarer, mejl });
  assert.equal(r.total, 30); assert.equal(r.kommentarer, 29); assert.equal(r.mejl, 1);
  const fukt = r.poster.find((p) => p.kluster === 'fukt/mögel/ventilation');
  assert.equal(fukt.antal, 12); assert.equal(fukt.kommentarer, 11); assert.equal(fukt.mejl, 1);
  assert.equal(Math.round(fukt.andel * 100), 40);
  assert.ok(!r.poster.some((p) => ['beröm', 'tagg/vän', 'var köpa'].includes(p.kluster)));
  assert.ok(r.poster.some((p) => p.kluster === 'pris' && p.antal === 1));
});

test('byggMatris: befintliga rader och fyllda rutor bevaras, andelen skrivs om, kontots OB-annonser sätter status, briefer fyller bara tomma rutor', () => {
  const bef = matrisUrText(TAK).rader;
  const invandningar = [
    { kluster: 'fukt/mögel/ventilation', antal: 11, andel: 0.38 },
    { kluster: 'storlek/passform', antal: 2, andel: 0.07 },
    { kluster: 'pris', antal: 3, andel: 0.1 },
    { kluster: 'retur/garanti', antal: 1, andel: 0.03 },
  ];
  const annonser = [
    { name: 'Takoverdrag_OB_1_H1', status: 'ACTIVE' }, { name: 'Takoverdrag_OB_2_H1', status: 'PAUSED' },
    { name: 'Takoverdrag_OB_4_H1', status: 'ACTIVE' }, { name: 'Takoverdrag_OB_5_1', status: 'ACTIVE' }, { name: 'Takoverdrag_CS_2_1', status: 'ACTIVE' },
  ];
  const briefer = [
    { namn: 'Takoverdrag_OB_6_1', invandning: 'fukt / kondens / självdrag', ruta: null },
    { namn: 'Takoverdrag_OB_7_H1', invandning: 'fukt', ruta: 'video' },
    { namn: 'Takoverdrag_OB_8_H1', invandning: 'kaffe', ruta: null },
  ];
  const m = byggMatris({ befintliga: bef, invandningar, annonser, briefer });
  const rad = (n) => m.rader.find((r) => r.nyckel === n);
  assert.equal(rad('fukt / kondens / självdrag').andel, 0.38);
  assert.equal(rad('täcker för lite').andel, 0.07, 'storlek/passform matchar radens "täcker"');
  assert.deepEqual(m.nya, ['Pris'], 'pris (3) får ny rad; retur/garanti (1) bara i räkningen');
  assert.equal(rad('fukt / kondens / självdrag').celler.video, '`Takoverdrag_OB_4_H1` live', 'kontot säger live — cellen uppdateras, aldrig skrivs över med annat namn');
  assert.equal(rad('förvaring').celler.video, '`Takoverdrag_OB_2_H1` paused i kontot');
  assert.equal(rad('fukt / kondens / självdrag').celler.statisk, '`Takoverdrag_OB_6_1` briefad, ej live', 'briefen fyller den tomma statiska rutan');
  assert.ok(m.varningar.some((v) => /OB_7_H1.*redan fylld/.test(v)), 'video-rutan är fylld — fylls inte igen');
  assert.ok(m.varningar.some((v) => /OB_8_H1.*matchar ingen rad/.test(v)));
  assert.deepEqual(m.omappade.map((a) => a.name), ['Takoverdrag_OB_5_1'], 'OB utan rad listas; CS-annonsen räknas inte');
  const t = tackning(m.rader);
  assert.equal(tackningText(t.find((x) => x.kort === 'fukt')), 'fukt 1 av 4 format (+1 briefad) (38 %)');
});

test('rendera: filen går att läsa tillbaka med samma rader, och sektionerna efter matrisen följer med orörda', () => {
  const bef = matrisUrText(TAK);
  const rakning = raknaInvandningar({ kommentarer: [{ message: 'blir det inte mögel?' }, { message: 'Anna B' }] });
  const m = byggMatris({ befintliga: bef.rader, invandningar: rakning.poster, annonser: [], briefer: [] });
  const text = rendera({ produkt: 'Taköverdraget för Husvagn', idag: '2026-09-22', kallor: ['Källa: test.'], rakning, rader: m.rader, omappade: m.omappade, varningar: ['Supportmejlen är INTE med.'], efter: bef.efter });
  const igen = matrisUrText(text);
  assert.equal(igen.rader.length, bef.rader.length);
  assert.equal(igen.rader[0].celler.video, '`OB_4_H1` briefad, ej live');
  assert.equal(igen.rader[0].andel, 0.5, 'andelen skrivs om ur räkningen (1 av 2 poster)');
  assert.match(text, /\*\*Täckning:\*\* fukt 0 av 4 format \(\+1 briefad\) \(50 %\)/);
  assert.match(igen.efter, /## Varför det här är produktens viktigaste lucka/);
  assert.match(igen.efter, /## Evolve-testet som matrisen är svaret på/);
  assert.match(text, /⚠️ Supportmejlen är INTE med\./);
  // Andra körningen ger samma sak — täckningsraden dubbleras inte.
  const m2 = byggMatris({ befintliga: igen.rader, invandningar: rakning.poster, annonser: [], briefer: [] });
  const text2 = rendera({ produkt: 'Taköverdraget för Husvagn', idag: '2026-09-23', kallor: ['Källa: test.'], rakning, rader: m2.rader, omappade: [], varningar: [], efter: igen.efter });
  assert.equal((text2.match(/\*\*Täckning:\*\*/g) ?? []).length, 1);
});

test('invandningUrBrief läser invandning= och ruta= ur taggraden; sokMejl och kundmejl filtrerar rätt', () => {
  const brief = '# X\n\nVARIABELTAGGAR: typ=N · koncept=fukt · invandning=fukt / kondens / självdrag · ruta=demo · kalla=voc\n';
  assert.deepEqual(invandningUrBrief(brief), { invandning: 'fukt / kondens / självdrag', ruta: 'demo' });
  assert.equal(invandningUrBrief('VARIABELTAGGAR: typ=N · kalla=voc'), null);
  const brand = { supportmail: 'kundsupport@baverbutiken.se' };
  const mejl = [
    { fran: { adress: 'kalle@gmail.com' }, amne: 'Husvagn', text: 'Passar den min husvagn på 7 m?', datum: new Date('2026-09-20') },
    { fran: { adress: 'kundsupport@baverbutiken.se' }, amne: 'Re: Husvagn', text: 'Ja', datum: new Date('2026-09-20') },
    { fran: { adress: 'no-reply@shopify.com' }, amne: 'Order husvagn', text: 'x' },
    { fran: { adress: 'lisa@hotmail.com' }, amne: 'Retur', text: 'Vill returnera tofflorna', datum: new Date('2026-09-19') },
    { fran: { adress: 'auto@x.se' }, amne: 'Automatiskt svar', text: 'husvagn', autosvar: true },
  ];
  const kunder = kundmejl(mejl, brand);
  assert.equal(kunder.length, 2);
  const t = sokMejl(kunder, 'husvagn,taköverdrag');
  assert.equal(t.length, 1);
  assert.equal(t[0].datum, '2026-09-20');
  assert.doesNotMatch(JSON.stringify(t), /kalle@gmail/);
});
