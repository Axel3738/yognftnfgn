// Axels krav 2026-09-20 på standardvyn, som körbara tester.
//
//   "Standardvyn ska bara visa leveransens milstolpar. Inga utländska
//    terminalnamn eller länder. Allt före Sverige är ett läge. Hela
//    fraktbolagets historik finns kvar bakom Mer information. Ingen rådata
//    raderas eller ändras."
//
// ⚠️ De här testerna finns för att HELA den ändringen kunde göras fel utan
// att en enda av de 115 gamla testerna blev röd (mätt 2026-09-20: både ett
// etikettbyte och en hopslagning 5→4 skeden gav 115/115 grönt). Skedenas
// antal, ordning och etiketter var opinnade, och sammanfattningsvyns
// innehåll testades inte alls — fixturen i sida.test.mjs är `v: 1` utan
// stegfält, så vyn kördes aldrig i sitt normalläge.
//
// Datan är RIKTIG: samma sju paket ur test/fixturer/riktiga-paket.json som
// kontroll.test.mjs använder, hämtade ur 17TRACK 2026-09-19.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { handelserUr, byggData } from '../paketdata.mjs';
import { oversattFras, stadaPlats, landFor } from '../sprak.mjs';
import { packaUppEtt, STEG, I_LANDET_NR, sammanfattning } from '../uppacka.mjs';
import { kontrolleraStandardvyn, kontrollera } from '../kontroll.mjs';
import { byggSidkropp } from '../sida.mjs';

const FIXTUR = JSON.parse(readFileSync(new URL('./fixturer/riktiga-paket.json', import.meta.url), 'utf8'));
const NU = Date.parse('2026-09-19T21:00:00Z');
const LAND = 'Sverige';
const KONFIG = { butik: { support: 'kundsupport@baverbutiken.se' }, frakt: { sparning_vaknar: '2–4 dagar' } };

const somSvar = (p) => ({
  number: p.n,
  carrier: p.c,
  track_info: { tracking: { providers: [{ events: p.ev.map((e) => ({ time_iso: e.t, description: e.d, location: e.l, sub_status: e.s, stage: e.st })) }] } },
});

function byggAllt() {
  const paket = FIXTUR.map((p) => ({
    nummer: p.n,
    bolag: p.c === 190008 ? 'YunExpress' : '4PX',
    statusKod: null,
    handelser: handelserUr(somSvar(p), { oversattFras, stadaPlats, landFor, nu: NU }),
  }));
  const { data } = byggData(paket, { nu: NU, mottagarland: LAND });
  return { paket, data };
}

// ---------------------------------------------------------------- kontraktet

// ⚠️ Det här testet ska bli rött när någon ändrar skedena. Det är meningen.
// Är ändringen avsiktlig: rätta listan här i samma commit, och läs då också
// konstanterna i steg.mjs (BESTALLD…LEVERERAT) — de bär SAMMA ordning, och
// stegnumret ligger dessutom i varje redan byggd datafil.
test('skedenas nycklar, ordning och etiketter är låsta', () => {
  assert.deepEqual(STEG, [
    ['bestalld', 'Beställningen är registrerad'],
    ['pa_vag', 'Internationell transport'],
    ['i_landet', 'Ankommit till {{land}}'],
    ['utkorning', 'Ute för leverans'],
    ['levererat', 'Levererat'],
  ]);
  assert.equal(I_LANDET_NR, 2, 'i_landet ska vara skede 2 — steg.mjs hårdkodar samma tal');
});

test('inget skede före Sverige nämner ett land eller en ort i sin etikett', () => {
  for (let i = 0; i < I_LANDET_NR; i++) {
    const etikett = STEG[i][1];
    assert.ok(!etikett.includes('{{land}}'), `skede ${i} bär landet i etiketten: ${etikett}`);
    assert.ok(!/kina|nederländerna|sverige|norge/i.test(etikett), `skede ${i} nämner ett land: ${etikett}`);
  }
});

// ------------------------------------------------------------ orten i vyn

test('standardvyn visar aldrig en utländsk ort — mätt på riktig data', () => {
  const { paket, data } = byggAllt();
  const sedda = [];
  for (const p of paket) {
    const u = packaUppEtt(data, p.nummer);
    assert.deepEqual(kontrolleraStandardvyn(u, { mottagarland: LAND }), [], `${p.nummer}: krav 5 fälldes`);
    for (const s of u.sammanfattning.steg) if (s.nadd && s.plats) sedda.push(s.plats);
  }
  // De utländska orterna i just den här datan, namngivna så testet fäller
  // med ett begripligt besked om filtret glappar.
  for (const ort of ['Kina', 'Hongqiao', 'Nederländerna', 'Rozenburg', 'Belgien', 'Nancheng']) {
    assert.ok(!sedda.includes(ort), `"${ort}" nådde standardvyn`);
  }
  assert.ok(sedda.length > 0, 'ingen ort alls visas — då mäter testet ingenting');
});

test('svenska orter är kvar — ombudets namn är det kunden behöver', () => {
  const { paket, data } = byggAllt();
  const sedda = new Set();
  for (const p of paket) {
    for (const s of packaUppEtt(data, p.nummer).sammanfattning.steg) if (s.nadd && s.plats) sedda.add(s.plats);
  }
  assert.ok(sedda.has('Umeå'), 'leveransorten försvann ur standardvyn');
  assert.ok([...sedda].some((o) => /ICA|ombud|Gällö/i.test(o)), `utlämningsstället försvann: ${[...sedda].join(', ')}`);
});

test('orten filtreras på SKEDET, inte på landet', () => {
  // Mätt 2026-09-20: landFor() känner bara de orter som stått i datan, så
  // både "Luleå" (svensk) och "Hongqiao" (kinesisk) ger land = null. En ren
  // landsregel hade därför tystat den ena och släppt igenom den andra.
  assert.equal(landFor('LULEÅ PAKETTERMINAL LULEÅ'), null, 'mätningen har ändrats — läs om regeln i uppacka.ortFor');
  assert.equal(landFor('Hongqiao'), null, 'mätningen har ändrats — läs om regeln i uppacka.ortFor');

  const handelser = [
    { tid: null, iso: '2026-09-17T10:00', text: 'Levererat', plats: 'Luleå', land: null, steg: 4 },
    { tid: null, iso: '2026-09-12T10:00', text: 'Upphämtat', plats: 'Hongqiao', land: null, steg: 1 },
  ];
  const s = sammanfattning(handelser, LAND).steg;
  assert.equal(s[4].plats, 'Luleå', 'en svensk ort utan känt land ska visas');
  assert.equal(s[1].plats, null, 'en ort före ankomsten ska aldrig visas, känt land eller ej');
});

test('landets eget namn är ingen ort', () => {
  const handelser = [{ tid: null, iso: '2026-09-17T10:00', text: 'Ankommit', plats: 'Sverige', land: 'Sverige', steg: 2 }];
  assert.equal(sammanfattning(handelser, LAND).steg[2].plats, null, '"Ankommit till Sverige · Sverige" hjälper ingen');
});

// ------------------------------------------------------ rörelsen syns ändå

test('det aktiva skedet bär den senaste skanningen, inte bara den första', () => {
  // 544 av 1 055 paket (51,6 %) stod i internationell transport när det
  // mättes 2026-09-19, och den sträckan tar 4–9 dygn. Utan den här raden
  // står sidan stilla hela tiden för varannan kund.
  const { paket, data } = byggAllt();
  const u = packaUppEtt(data, '4PX3003158126858CN');
  const aktivt = u.sammanfattning.steg[u.sammanfattning.nu];
  assert.ok(aktivt.nadd, 'det aktiva skedet ska vara nått');
  assert.ok(aktivt.senastIso > aktivt.iso, 'paketet har rört sig sedan skedet nåddes — då ska senastIso vara nyare');
  assert.equal(aktivt.iso, '2026-09-15T17:25:00.000Z', 'skedets egen tid ska vara oförändrad (kontroll.mjs krav 3 matchar på den)');
  assert.ok(paket.length > 0);
});

// --------------------------------------------------------------- sidan

test('sidan: knappen heter "Mer information" och historiken ligger kvar bakom den', () => {
  const { data } = byggAllt();
  const kropp = byggSidkropp(data, KONFIG);
  assert.ok(kropp.includes('<summary>Mer information</summary>'), 'knappens namn har ändrats');
  assert.ok(/<details[^>]*id="bbs-mer"/.test(kropp), 'historiken ska ligga bakom en <details>');
  assert.ok(kropp.includes('med ort och land'), 'hjälpraden som förklarar vad som finns bakom knappen är borta');
  assert.ok(kropp.includes('id="bbs-lista"'), 'historiklistan saknas');
});

test('sidan: datan bär fortfarande varje skanning, ort och land', () => {
  // Kravet "ingen rådata raderas" mäts på datan i sidan, inte på vyn.
  const { paket, data } = byggAllt();
  const kropp = byggSidkropp(data, KONFIG);
  for (const p of paket) {
    const u = packaUppEtt(data, p.nummer);
    assert.equal(u.handelser.length, p.handelser.length, `${p.nummer}: skanningar försvann`);
  }
  const u = packaUppEtt(data, 'YT2625400704778854');
  const lander = new Set(u.handelser.map((h) => h.land).filter(Boolean));
  for (const l of ['Kina', 'Nederländerna', 'Sverige']) {
    assert.ok(lander.has(l), `${l} går inte att hitta i historiken`);
  }
  assert.ok(kropp.includes('Rozenburg'), 'transitorten ska finnas kvar i sidans data');
});

test('hela kontrollen är grön på riktig data, med krav 5 inräknat', () => {
  const { paket, data } = byggAllt();
  const r = kontrollera(paket, data, { mottagarland: LAND });
  assert.equal(r.ok, true, `kontrollen fälldes:\n${r.problem.map((p) => `${p.nummer}: ${p.text}`).join('\n')}`);
  assert.ok(r.kollade >= 7, 'för få paket kollades');
});

// ⚠️ Motprov. En kontroll som aldrig kan bli röd bevisar ingenting.
test('krav 5 FÄLLER en standardvy som visar en utländsk ort', () => {
  const { data } = byggAllt();
  const u = packaUppEtt(data, 'YT2625400704778854');
  // Peta in Kina på det internationella skedet, som om filtret glappat.
  u.sammanfattning.steg[1].plats = 'Kina';
  u.sammanfattning.steg[1].land = 'Kina';
  const problem = kontrolleraStandardvyn(u, { mottagarland: LAND });
  assert.equal(problem.length, 1, 'kontrollen märkte inte att Kina stod i standardvyn');
  assert.equal(problem[0].krav, 5);
  assert.match(problem[0].text, /Kina/);
});
