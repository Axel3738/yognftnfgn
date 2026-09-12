// Tester för rakning.mjs — steg 9 i `/ny-annonser` som KOD.
// Ingen nätverkstrafik. Kör: node --test factory/test/*.test.mjs
//
// De två fallen som gav bakläxan 2026-09-09 har egna tester längst ned:
// "10 av 33" (TankGuard NO) och "NO-kontot lästes aldrig".

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  segment,
  karna,
  parkoppla,
  normaliseraKalla,
  arAktiv,
  byggRakning,
  byggBlock,
  byggRapport,
  samlaKallor,
  matcharMarknad,
  filtreraUppladdade,
  DOMAR,
  LADDAS_UPP,
} from '../rakning.mjs';

// ---- namnmatchning -----------------------------------------------------------

test('segment delar på fält och kastar kampanjsvansen efter |', () => {
  assert.deepEqual(segment('TANKGUARD_SE_PD_1_H3'), ['tankguard', 'se', 'pd', '1', 'h3']);
  assert.deepEqual(segment('TankGuard_BOF_3_1 | 2026-09-08'), ['tankguard', 'bof', '3', '1']);
  assert.deepEqual(segment(''), []);
  assert.deepEqual(segment(null), []);
});

test('parkoppla matchar trots nytt brandprefix — det är hela poängen', () => {
  assert.equal(parkoppla('Enginecover_PD_1_H3', 'TANKGUARD_SE_PD_1_H3'), true);
  assert.equal(parkoppla('IBC_BOF_3_1', 'TankGuard_BOF_3_1'), true);
  assert.equal(parkoppla('IBC-tanktrekk_NO_RV_3_1', 'TankGuard_NO_RV_3_1'), true);
  assert.equal(parkoppla('RV_3_1', 'TankGuard_RV_3_1'), true, 'kort namn ska matcha fullt namn');
});

test('parkoppla matchar ALDRIG på en ren sifferSvans — BOF_1_1 är inte CS_1_1', () => {
  assert.equal(parkoppla('IBC_BOF_1_1', 'TankGuard_CS_1_1'), false);
  assert.equal(parkoppla('IBC_PD_1_H1', 'TankGuard_PD_1_H2'), false);
  assert.equal(parkoppla('IBC_PD_2_H1', 'TankGuard_CS_2_H1'), false, 'gemensam svans 2_H1 räcker inte');
  assert.equal(parkoppla('IBC_PD_Extra', 'TankGuard_CS_Extra'), false, 'ett enda gemensamt fält räcker inte');
  assert.equal(parkoppla('', 'TankGuard_PD_1_H1'), false);
});

test('parkoppla bryr sig inte om versaler', () => {
  assert.equal(parkoppla('ibc_pd_1_h3', 'TANKGUARD_SE_PD_1_H3'), true);
});

test('karna läser ut angle/format/hook-delen, marknadskoden räknas inte som vinkel', () => {
  assert.equal(karna('TANKGUARD_SE_PD_1_H3'), 'PD_1_H3');
  assert.equal(karna('IBC-tanktrekk_NO_RV_3_1'), 'RV_3_1');
});

// ---- normalisering -----------------------------------------------------------

test('normaliseraKalla läser både brand-detektorns och kallannonsernas fältnamn', () => {
  const a = normaliseraKalla({ annons: 'IBC_PD_1_H1', dom: 'kräver-omdubb', status: 'ACTIVE' });
  assert.equal(a.annons, 'IBC_PD_1_H1');
  assert.equal(a.dom, 'kräver-omdubb');

  const b = normaliseraKalla({ namn: 'IBC-tanktrekk_NO_RV_3_1', kort: 'RV_3_1', seDom: null, marknad: 'no' });
  assert.equal(b.annons, 'IBC-tanktrekk_NO_RV_3_1');
  assert.equal(b.matchnamn, 'RV_3_1');
  assert.equal(b.dom, DOMAR.ODOMD, 'ingen dom är odömd — aldrig ren');
  assert.equal(b.marknad, 'NO');
});

test('arAktiv: pausad källa är ett beslut, saknad status stryker aldrig en annons', () => {
  assert.equal(arAktiv({ status: 'ACTIVE', adsetStatus: 'ACTIVE' }), true);
  assert.equal(arAktiv({ status: 'PAUSED', adsetStatus: 'ACTIVE' }), false);
  assert.equal(arAktiv({ status: 'ACTIVE', adsetStatus: 'PAUSED' }), false);
  assert.equal(arAktiv({ status: null, adsetStatus: null }), true);
});

// ---- byggRakning -------------------------------------------------------------

const kalla = (annons, dom, extra = {}) => ({ annons, dom, marknad: 'SE', status: 'ACTIVE', ...extra });
const uppe = (namn, extra = {}) => ({
  namn,
  kampanj: 'TANKGUARD_SE_Tanköverdraget | 2026-09-08',
  marknad: 'SE',
  status: 'PAUSED',
  ...extra,
});

test('byggRakning: allt uppe ger klart, och forvantade räknar aldrig med okänd', () => {
  const r = byggRakning({
    kallor: [
      kalla('IBC_BOF_1_1', 'ren'),
      kalla('IBC_PD_1_H1', 'kräver-omdubb'),
      kalla('IBC_GT_3_H1', 'kräver-slutkortsbygge'),
      kalla('IBC_PD_Extra', 'okänd'),
    ],
    uppladdade: [uppe('TankGuard_BOF_1_1'), uppe('TankGuard_PD_1_H1'), uppe('TankGuard_GT_3_H1')],
    marknad: 'SE',
  });
  assert.equal(r.forvantade, 3);
  assert.equal(r.traffade, 3);
  assert.equal(r.per_dom['okänd'], 1);
  assert.deepEqual(r.saknade, []);
  assert.deepEqual(r.overtaliga, []);
  assert.equal(r.klart, true);
});

test('byggRakning: en saknad annons utan orsak får orsaken "orsak saknas — måste namnges"', () => {
  const r = byggRakning({
    kallor: [kalla('IBC_BOF_1_1', 'ren'), kalla('IBC_CS_1_H2', 'kräver-omdubb')],
    uppladdade: [uppe('TankGuard_BOF_1_1')],
    marknad: 'SE',
  });
  assert.equal(r.klart, false);
  assert.deepEqual(r.saknade, [
    { annons: 'IBC_CS_1_H2', dom: 'kräver-omdubb', orsak: 'orsak saknas — måste namnges' },
  ]);
});

test('byggRakning: en namngiven orsak i indata behålls ordagrant', () => {
  const r = byggRakning({
    kallor: [kalla('IBC_CS_1_H2', 'kräver-omdubb', { orsak: 'väntar på HeyGen-krediter' })],
    uppladdade: [],
    marknad: 'SE',
  });
  assert.equal(r.saknade[0].orsak, 'väntar på HeyGen-krediter');
});

test('byggRakning: uppladdad okänd dom blockerar när den är ACTIVE, men inte när den är pausad', () => {
  const bas = { kallor: [kalla('IBC_BOF_1_1', 'ren'), kalla('IBC_PD_Extra', 'okänd')], marknad: 'SE' };

  const pausad = byggRakning({
    ...bas,
    uppladdade: [uppe('TankGuard_BOF_1_1'), uppe('TankGuard_PD_Extra', { status: 'PAUSED' })],
  });
  assert.equal(pausad.overtaliga.length, 1);
  assert.equal(pausad.overtaliga[0].blockerar, false);
  assert.equal(pausad.klart, true);

  const aktiv = byggRakning({
    ...bas,
    uppladdade: [uppe('TankGuard_BOF_1_1'), uppe('TankGuard_PD_Extra', { status: 'ACTIVE' })],
  });
  assert.equal(aktiv.overtaliga[0].blockerar, true);
  assert.equal(aktiv.klart, false);
});

test('byggRakning: pausad källannons blir utesluten och NAMNGIVEN, aldrig saknad', () => {
  const r = byggRakning({
    kallor: [kalla('IBC_BOF_1_1', 'ren'), kalla('IBC_SP_9_1', 'ren', { status: 'PAUSED' })],
    uppladdade: [uppe('TankGuard_BOF_1_1')],
    marknad: 'SE',
  });
  assert.equal(r.forvantade, 1);
  assert.deepEqual(r.saknade, []);
  assert.equal(r.uteslutna.length, 1);
  assert.equal(r.uteslutna[0].annons, 'IBC_SP_9_1');
  assert.match(r.uteslutna[0].orsak, /PAUSED/);
  assert.equal(r.klart, true);
});

test('byggRakning: en annons ur en annan marknad räknas aldrig med', () => {
  const r = byggRakning({
    kallor: [kalla('IBC_BOF_1_1', 'ren'), { annons: 'IBC-tanktrekk_NO_BOF_1_1', dom: 'ren', marknad: 'NO', status: 'ACTIVE' }],
    uppladdade: [
      uppe('TankGuard_BOF_1_1'),
      { namn: 'TankGuard_NO_BOF_1_1', kampanj: 'TANKGUARD_NO_Tanktrekket | 2026-09-09', marknad: 'NO', status: 'PAUSED' },
    ],
    marknad: 'SE',
  });
  assert.equal(r.forvantade, 1);
  assert.equal(r.uppladdade, 1);
  assert.equal(r.klart, true);
  assert.equal(r.anmarkningar.filter((a) => /annan marknad/.test(a)).length, 2);
});

test('byggRakning: uppladdad annons utan källa blir övertalig men blockerar inte', () => {
  const r = byggRakning({
    kallor: [kalla('IBC_BOF_1_1', 'ren')],
    uppladdade: [uppe('TankGuard_BOF_1_1'), uppe('TankGuard_XX_9_9')],
    marknad: 'SE',
  });
  assert.equal(r.overtaliga.length, 1);
  assert.equal(r.overtaliga[0].namn, 'TankGuard_XX_9_9');
  assert.equal(r.overtaliga[0].blockerar, false);
  assert.equal(r.klart, true);
});

test('byggRakning: noll källannonser är inte klart — det är en marknad att bekräfta', () => {
  const r = byggRakning({ kallor: [], uppladdade: [], marknad: 'NO' });
  assert.equal(r.kallor_lasta, true);
  assert.equal(r.forvantade, 0);
  assert.equal(r.klart, false);
  assert.match(r.anmarkningar.join(' '), /noll källannonser för NO/);
});

test('BAKLÄXAN 1 — "10 av 33": TankGuard NO byggde 10 annonser och kallade det klart', () => {
  const no = (namn, dom, extra = {}) => ({ namn, kort: namn, seDom: dom, marknad: 'NO', status: 'ACTIVE', ...extra });
  const kallor = [
    // 10 bilder med ren media — de som faktiskt byggdes
    ...['BOF_3_1', 'BOF_4_1', 'BOF_5_1', 'CO_1_1', 'GT_2_1', 'PD_2_1', 'PD_3_1', 'PD_4_1', 'PD_5_1', 'SP_2_1'].map((n) =>
      no(n, 'ren')
    ),
    // 10 bilder med källbutikens pris/villkor inbränt — ska FIXAS, inte slängas
    ...['BOF_1_1', 'BOF_2_1', 'BOF_6_1', 'CS_2_1', 'CS_3_1', 'CS_4_1', 'RV_1_1', 'RV_2_1', 'RV_3_1', 'RV_4_1'].map((n) =>
      no(n, 'bara-copy', { orsak: 'inbränt pris/villkor — väntar på bildfix (pipeline/oversatt-bild.py)' })
    ),
    // 13 videor som aldrig blev grindade — ingen dom alls
    ...[
      'CS_1_H2', 'CS_1_H3', 'GT_1_H1', 'GT_1_H2', 'GT_1_H3', 'GT_3_H1',
      'PD_1_H1', 'PD_1_H2', 'PD_1_H3', 'PD_3_H1', 'SP_1_H1', 'SP_1_H2', 'SP_1_H3',
    ].map((n) => no(n, null)),
  ];
  const uppladdade = ['BOF_3_1', 'BOF_4_1', 'BOF_5_1', 'CO_1_1', 'GT_2_1', 'PD_2_1', 'PD_3_1', 'PD_4_1', 'PD_5_1', 'SP_2_1'].map(
    (n) => ({ namn: `TankGuard_NO_${n}`, kampanj: 'TANKGUARD_NO_Tanktrekket | 2026-09-09', marknad: 'NO', status: 'PAUSED' })
  );

  const r = byggRakning({ kallor, uppladdade, marknad: 'NO' });
  assert.equal(kallor.length, 33);
  assert.equal(r.uppladdade, 10);
  assert.equal(r.traffade, 10);
  assert.equal(r.forvantade, 20, '13 odömda videor får inte laddas upp — men de räknas som saknade');
  assert.equal(r.per_dom[DOMAR.ODOMD], 13);
  assert.equal(r.saknade.length, 23);
  assert.equal(r.klart, false, '10 av 33 är aldrig klart');
  // Varje saknad annons är namngiven med sin orsak — "resten misslyckades" finns inte.
  assert.ok(r.saknade.every((s) => s.annons && s.orsak));
  assert.ok(r.saknade.some((s) => s.annons === 'PD_1_H3' && /ingen dom/.test(s.orsak)));

  const md = byggRapport([r]);
  assert.match(md, /DELVIS KLART/);
  assert.match(md, /PD_1_H3/);
  assert.doesNotMatch(md, /\*\*KLART\*\*/);
});

test('BAKLÄXAN 2 — NO-kontot lästes aldrig: oläst rapporteras som oläst, aldrig som noll', () => {
  const se = byggRakning({
    kallor: [kalla('IBC_BOF_1_1', 'ren')],
    uppladdade: [uppe('TankGuard_BOF_1_1')],
    marknad: 'SE',
  });
  const no = byggRakning({ kallor: null, uppladdade: null, marknad: 'NO' });

  assert.equal(no.kallor_lasta, false);
  assert.equal(no.konto_last, false);
  assert.equal(no.klart, false);
  assert.match(no.anmarkningar.join(' '), /marknaden inte läst/);
  assert.match(no.anmarkningar.join(' '), /målkontot inte läst/);

  assert.equal(se.klart, true);
  const md = byggRapport([se, no]);
  assert.match(md, /## NO — MARKNADEN INTE LÄST/);
  assert.match(md, /DELVIS KLART/);
  assert.match(md, /NO: marknaden inte läst · målkontot inte läst/);
});

// ---- rapporten ---------------------------------------------------------------

test('byggBlock skriver steg 9:s block med riktiga tal', () => {
  const r = byggRakning({
    kallor: [
      ...Array.from({ length: 20 }, (_, i) => kalla(`IBC_R_${i}_1`, 'ren')),
      ...Array.from({ length: 11 }, (_, i) => kalla(`IBC_O_${i}_H1`, 'kräver-omdubb')),
      kalla('IBC_GT_3_H1', 'kräver-slutkortsbygge'),
      kalla('IBC_PD_3_H1', 'kräver-slutkortsbygge'),
      kalla('IBC_PD_Extra', 'okänd'),
    ],
    uppladdade: [],
    marknad: 'SE',
  });
  const block = byggBlock(r);
  assert.match(block, /Källannonser:\s+34/);
  assert.match(block, /rena\s+20\s+→ ska bli 20 annonser/);
  assert.match(block, /kräver-omdubb\s+11\s+→ ska bli 11 annonser/);
  assert.match(block, /slutkortsbygge\s+2\s+→ ska bli 2 annonser/);
  assert.match(block, /okänd\s+1\s+→ ska INTE laddas upp/);
  assert.match(block, /Uppladdade i kontot:\s+0\s+← läst ur Meta, inte ur minnet/);
});

test('byggBlock säger KONTOT INTE LÄST i stället för att skriva en nolla', () => {
  const r = byggRakning({ kallor: [kalla('IBC_BOF_1_1', 'ren')], uppladdade: null, marknad: 'SE' });
  assert.match(byggBlock(r), /Uppladdade i kontot:\s+\?\s+← KONTOT INTE LÄST/);
  assert.equal(r.klart, false);
  // Ett oläst konto ger ingen lista över vad som saknas — bara en lucka.
  assert.equal(r.saknade[0].orsak, 'målkontot inte läst — annonsen kan varken bekräftas uppe eller saknad');
  const md = byggRapport([r]);
  assert.match(md, /SE: målkontot inte läst — ingenting kan bekräftas uppe/);
  assert.doesNotMatch(md, /1 saknas: IBC_BOF_1_1/);
});

test('byggRapport: en tabell per marknad, och KLART bara när varje marknad är klar', () => {
  const se = byggRakning({
    kallor: [kalla('IBC_BOF_1_1', 'ren')],
    uppladdade: [uppe('TankGuard_BOF_1_1')],
    marknad: 'SE',
  });
  const no = byggRakning({
    kallor: [{ annons: 'IBC-tanktrekk_NO_BOF_1_1', dom: 'ren', marknad: 'NO', status: 'ACTIVE' }],
    uppladdade: [{ namn: 'TankGuard_NO_BOF_1_1', kampanj: 'TANKGUARD_NO_X', marknad: 'NO', status: 'PAUSED' }],
    marknad: 'NO',
  });
  const md = byggRapport([se, no], { produkt: 'tankguard', konto: '915422744950975', datum: '2026-09-09' });

  assert.match(md, /# Räkningen — tankguard · 2026-09-09/);
  assert.match(md, /act_915422744950975\/ads/);
  assert.match(md, /aldrig ur `advideos`\/`adimages`/);
  assert.equal((md.match(/^## /gm) || []).length, 2, 'en rubrik per marknad');
  assert.equal((md.match(/^\| Dom \| Källa \| Ska bli \| Uppe \| Saknas \|$/gm) || []).length, 2);
  assert.match(md, /\*\*KLART\*\*/);
});

test('byggRapport: DELVIS KLART namnger varje saknad annons', () => {
  const r = byggRakning({
    kallor: [kalla('IBC_BOF_1_1', 'ren'), kalla('IBC_CS_1_H2', 'kräver-omdubb'), kalla('IBC_SP_1_H1', 'kräver-omdubb')],
    uppladdade: [uppe('TankGuard_BOF_1_1')],
    marknad: 'SE',
  });
  const md = byggRapport([r]);
  assert.match(md, /\*\*DELVIS KLART\*\*/);
  assert.match(md, /SE: 2 saknas: IBC_CS_1_H2, IBC_SP_1_H1/);
  assert.match(md, /### Saknas i kontot — 2 st, var och en namngiven/);
});

test('byggRapport utan marknader är aldrig KLART', () => {
  assert.match(byggRapport([]), /DELVIS KLART/);
});

// ---- indata ------------------------------------------------------------------

test('samlaKallor: en norsk annons ärver ALDRIG en svensk systerannons dom', () => {
  const brandDetektor = {
    kalla: { annonskonto: '1867947880635861' },
    annonser: [{ annons: 'IBC_RV_3_1', dom: 'ren', status: 'ACTIVE' }],
  };
  const kallannonser = [
    { marknad: 'SE', namn: 'IBC_RV_3_1', kort: 'RV_3_1', status: 'ACTIVE' },
    { marknad: 'NO', namn: 'IBC-tanktrekk_NO_RV_3_1', kort: 'RV_3_1', status: 'ACTIVE', seDom: null },
  ];
  const ut = samlaKallor({ brandDetektor, kallannonser });
  assert.equal(ut.SE[0].dom, 'ren');
  assert.equal(ut.NO[0].dom, DOMAR.ODOMD, 'oläst är aldrig ren');
});

test('samlaKallor: utan kallannonser.json läses bara källkontots egen marknad', () => {
  const ut = samlaKallor({
    brandDetektor: {
      kalla: { annonskonto: '1867947880635861' },
      annonser: [{ annons: 'IBC_BOF_1_1', dom: 'ren', status: 'ACTIVE' }],
    },
  });
  assert.equal(ut.SE.length, 1);
  assert.equal(ut.NO, undefined, 'NO är inte läst — och odefinierat blir "marknaden inte läst"');
  assert.equal(byggRakning({ kallor: ut.NO ?? null, uppladdade: [], marknad: 'NO' }).kallor_lasta, false);
});

test('samlaKallor läser även kallannonser.mjs eget format { SE: { annonser } }', () => {
  const ut = samlaKallor({
    kallannonser: {
      SE: { konto: { id: '1867947880635861' }, annonser: [{ namn: 'IBC_BOF_1_1', status: 'ACTIVE' }] },
      NO: { konto: { id: '1050941584152547' }, annonser: [] },
    },
  });
  assert.equal(ut.SE.length, 1);
  assert.deepEqual(ut.NO, [], 'läst men tom är [] — inte null');
});

// ---- målkontot ---------------------------------------------------------------

test('matcharMarknad kräver marknadskoden som eget fält i kampanjnamnet', () => {
  assert.equal(matcharMarknad('TANKGUARD_SE_Tanköverdraget | 2026-09-08', 'SE'), true);
  assert.equal(matcharMarknad('TANKGUARD_SE_Tanköverdraget | 2026-09-08', 'NO'), false);
  assert.equal(matcharMarknad('TANKGUARD_NO_Tanktrekket | 2026-09-09', 'NO'), true);
  assert.equal(matcharMarknad('HEIMGUARD_NORDIC_kampanj', 'NO'), false, '"NO" inuti ett ord är inte marknaden');
  assert.equal(matcharMarknad('', 'SE'), false);
});

test('filtreraUppladdade skiljer butikens annonser från Bäverbutikens i SAMMA konto', () => {
  const kontot = [
    { namn: 'TankGuard_BOF_1_1', kampanj: 'TANKGUARD_SE_Tanköverdraget | 2026-09-08', status: 'PAUSED' },
    { namn: 'TankGuard_NO_BOF_1_1', kampanj: 'TANKGUARD_NO_Tanktrekket | 2026-09-09', status: 'PAUSED' },
    { namn: 'Motorholje_PD_1_H3', kampanj: 'DK-Motorhöljet | 2026-08-01', status: 'ACTIVE' },
    { namn: 'TankGuard_CS_9_1', kampanj: 'TANKGUARD_Tanköverdraget utan marknad', status: 'PAUSED' },
  ];
  const se = filtreraUppladdade(kontot, 'TankGuard', 'SE');
  assert.deepEqual(se.traffar.map((a) => a.namn), ['TankGuard_BOF_1_1']);
  assert.equal(se.frammande, 1, 'Bäverbutikens danska annons räknas aldrig med');
  assert.deepEqual(se.utan_marknad.map((a) => a.namn), ['TankGuard_CS_9_1']);

  const no = filtreraUppladdade(kontot, 'TankGuard', 'NO');
  assert.deepEqual(no.traffar.map((a) => a.namn), ['TankGuard_NO_BOF_1_1']);
});

test('LADDAS_UPP innehåller aldrig okänd eller odömd', () => {
  assert.equal(LADDAS_UPP.includes(DOMAR.OKAND), false);
  assert.equal(LADDAS_UPP.includes(DOMAR.ODOMD), false);
});

// --------------------------------------------------------- uteslutna.json
// CatCabin 2026-09-11: fyra CS-annonser hölls tillbaka på ett ägarbeslut.
// Rapporten skrev "orsak saknas — måste namnges" trots att orsaken var känd,
// eftersom brand-detektor.json och kallannonser.json skrivs om vid varje
// körning av sina verktyg. Orsaken bor därför i en egen fil.

test('en namngiven orsak följer med källraden in i rapporten', () => {
  const r = byggRakning({
    kallor: [kalla('Utekattkoja_CS_1_H1', 'kräver-omdubb', { orsak: 'VÄNTAR PÅ ÄGARBESLUT — hela vinkeln är en kampanj butiken inte kör' })],
    uppladdade: [],
    marknad: 'SE',
  });
  assert.equal(r.saknade.length, 1);
  assert.match(r.saknade[0].orsak, /ÄGARBESLUT/);
  assert.doesNotMatch(r.saknade[0].orsak, /orsak saknas/);
});

test('utan orsak står det fortfarande att den MÅSTE namnges', () => {
  const r = byggRakning({
    kallor: [kalla('Utekattkoja_CS_1_H1', 'kräver-omdubb')],
    uppladdade: [],
    marknad: 'SE',
  });
  assert.equal(r.saknade.length, 1);
  assert.match(r.saknade[0].orsak, /orsak saknas — måste namnges/);
});
