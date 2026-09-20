// Tester för spendtjuvsspärren.
//
// De två första testerna är Axels två verkliga fall från 2026-09-14, med
// siffrorna avlästa ur MagiBorsten samma dag. De är regressionstester: går de
// sönder har vi börjat döda kampanjer med lönsam kärna igen.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DOM,
  MAX_RADDNINGAR_14D,
  dranering,
  lasAnnons,
  spendtjuvsdom,
} from '../spendtjuv.mjs';

// Övervakningskameran | BE ROAS 1.57 — 3-dagarsfönstret 2026-09-14.
const OVERVAKNINGSKAMERAN = {
  kampanj_namn: 'Övervakningskameran | BE ROAS 1.57 | Launch 2026-08-21',
  break_even: 1.57,
  spend_3d: '7 738,66 kr (SEK)',
  annonser: [
    { namn: 'Overvakningskamera_SP_2', id: 'a1', spend: '3 442,25 kr (SEK)', kop: 2, roas: '0.62207', status: 'ACTIVE' },
    { namn: 'Overvakningskamera_CS_2', id: 'a2', spend: '1 957,99 kr (SEK)', kop: 2, roas: '1.093632', status: 'ACTIVE' },
    { namn: 'Overvakningskamera_CS_3', id: 'a3', spend: '1 464,08 kr (SEK)', kop: 1, roas: '0.545735', status: 'ACTIVE' },
    { namn: 'Overvakningskamera_CO_2_1', id: 'a4', spend: '185,49 kr (SEK)', kop: 1, roas: '12.758639', status: 'ACTIVE' },
    { namn: 'Overvakningskamera_SP_2_1', id: 'a5', spend: '142,62 kr (SEK)', kop: null, roas: null, status: 'ACTIVE' },
    { namn: 'Overvakningskamera_AU_1_H1', id: 'a6', spend: '100,10 kr (SEK)', kop: null, roas: null, status: 'ACTIVE' },
    { namn: 'Overvakningskamera_LI_1_1', id: 'a7', spend: '86,63 kr (SEK)', kop: null, roas: null, status: 'ACTIVE' },
    { namn: 'Overvakningskamera_CS_4_1', id: 'a8', spend: '42,01 kr (SEK)', kop: 1, roas: '19.019281', status: 'ACTIVE' },
  ],
};

// Adventskalendern Racingbilar | BE ROAS 1.62 — samma fönster.
const ADVENTSKALENDERN = {
  kampanj_namn: 'Adventskalendern Racingbilar | BE ROAS 1.62 | Launch 2026-09-08',
  break_even: 1.62,
  spend_3d: '4 319,97 kr (SEK)',
  annonser: [
    { namn: 'Adventskalender_PD_2_H1', id: 'b1', spend: '3 316,26 kr (SEK)', kop: 5, roas: '0.752354', status: 'ACTIVE' },
    { namn: 'Adventskalender_PD_2_1', id: 'b2', spend: '512,91 kr (SEK)', kop: 1, roas: '0.97288', status: 'ACTIVE' },
    { namn: 'Adventskalender_GT_1_H1', id: 'b3', spend: '413,42 kr (SEK)', kop: 1, roas: '1.207005', status: 'ACTIVE' },
    { namn: 'Adventskalender_CS_2_1', id: 'b4', spend: '23,59 kr (SEK)', kop: 1, roas: '21.153031', status: 'ACTIVE' },
    { namn: 'Adventskalender_PD_1_H1', id: 'b5', spend: '21,98 kr (SEK)', kop: null, roas: null, status: 'ACTIVE' },
  ],
};

test('Övervakningskameran: tre tjuvar pausas, den lönsamma kärnan räddas', () => {
  const utfall = spendtjuvsdom(OVERVAKNINGSKAMERAN);
  assert.equal(utfall.dom, DOM.PAUSA_TJUVAR);
  assert.deepEqual(
    utfall.tjuvar.map((a) => a.namn).sort(),
    ['Overvakningskamera_CS_2', 'Overvakningskamera_CS_3', 'Overvakningskamera_SP_2'],
  );
  // Resten låg på ROAS 3,62 — långt över break-even 1,57.
  assert.ok(utfall.rest.roas > 3.5, `rest-ROAS ${utfall.rest.roas}`);
  assert.ok(utfall.rest.roas > utfall.break_even);
  // CO_2_1 och CS_4_1 är annonserna som hade dött med kampanjen.
  assert.deepEqual(
    utfall.raddade.map((a) => a.namn),
    ['Overvakningskamera_CS_4_1', 'Overvakningskamera_CO_2_1'],
  );
});

test('Adventskalendern: bara videon är tjuv — den statiska tvillingen dränerar för lite', () => {
  const utfall = spendtjuvsdom(ADVENTSKALENDERN);
  assert.deepEqual(utfall.tjuvar.map((a) => a.namn), ['Adventskalender_PD_2_H1']);
  // PD_2_1 dränerar 205 kr på ETT köp i fönstret och har livstids-ROAS 3,04.
  // Den är brus, inte en tjuv — grinden TJUV_MIN_DRANERING_SEK stoppar den.
  assert.ok(!utfall.tjuvar.some((a) => a.namn === 'Adventskalender_PD_2_1'));
  // GT_1_H1 tog 9,6 % av spenden — under andelsgrinden, rörs inte.
  assert.ok(!utfall.tjuvar.some((a) => a.namn === 'Adventskalender_GT_1_H1'));
  // Utan videon ligger resten på 1,49 mot break-even 1,62 — kampanjen bär sig
  // inte av egen kraft, så utan ägarskydd är domen avstängning.
  assert.equal(utfall.dom, DOM.STANG_AV);
});

test('ägarskyddet: en kampanj ägaren startat om i dag stängs aldrig av', () => {
  const utfall = spendtjuvsdom({ ...ADVENTSKALENDERN, agarbeslut_idag: true });
  assert.equal(utfall.dom, DOM.PAUSA_TJUVAR);
  assert.equal(utfall.agarskydd, true);
  assert.deepEqual(utfall.tjuvar.map((a) => a.namn), ['Adventskalender_PD_2_H1']);
  assert.match(utfall.motivering, /ÄGARSKYDD/);
});

test('ägarskyddet utan tjuvar rör ingenting alls', () => {
  const utfall = spendtjuvsdom({
    break_even: 2,
    spend_3d: 1000,
    agarbeslut_idag: true,
    annonser: [{ namn: 'Liten', id: '1', spend: 1000, kop: 2, roas: 1.9, status: 'ACTIVE' }],
  });
  assert.equal(utfall.dom, DOM.ROR_INGENTING);
  assert.equal(utfall.agarskydd, true);
});

test('en tjuv som gått plus över livstiden märks som trött vinnare', () => {
  const utfall = spendtjuvsdom({
    ...OVERVAKNINGSKAMERAN,
    annonser: OVERVAKNINGSKAMERAN.annonser.map((a) => (
      a.namn === 'Overvakningskamera_SP_2' ? { ...a, roas_livstid: '2.409417' } : a
    )),
  });
  const sp2 = utfall.tjuvar.find((a) => a.namn === 'Overvakningskamera_SP_2');
  assert.equal(sp2.trott_vinnare, true, 'livstids-ROAS 2,41 ligger över break-even 1,57');
  // Den pausas ändå — den blöder nu och svälter ut ersättarna.
  assert.equal(utfall.dom, DOM.PAUSA_TJUVAR);
});

test('en liten dränering är brus även om ROAS ser hemsk ut', () => {
  const utfall = spendtjuvsdom({
    break_even: 1.6,
    spend_3d: 3000,
    annonser: [
      // 400 kr spend, ROAS 0,2 → dränerar bara 350 kr. Under grinden.
      { namn: 'Liten usling', id: '1', spend: 400, kop: 1, roas: 0.2, status: 'ACTIVE' },
      { namn: 'Bra', id: '2', spend: 2600, kop: 9, roas: 2.4, status: 'ACTIVE' },
    ],
  });
  assert.equal(utfall.dom, DOM.INGEN_TJUV);
});

test('den gamla regeln hade fällt båda fallen — tjuvarna har köp', () => {
  // Gamla potentialkollen krävde en spendtjuv med NOLL köp. Ingen av tjuvarna
  // i de två verkliga fallen hade noll köp. Det var därför kampanjerna dog.
  for (const jobb of [OVERVAKNINGSKAMERAN, ADVENTSKALENDERN]) {
    const utfall = spendtjuvsdom(jobb);
    assert.ok(utfall.tjuvar.every((a) => a.kop > 0));
  }
});

test('jämnt fördelad förlust ger ingen tjuv — kampanjen är problemet', () => {
  const utfall = spendtjuvsdom({
    break_even: 2,
    spend_3d: 4000,
    annonser: [
      { namn: 'A', id: '1', spend: 1000, kop: 2, roas: 1.0, status: 'ACTIVE' },
      { namn: 'B', id: '2', spend: 1000, kop: 2, roas: 1.1, status: 'ACTIVE' },
      { namn: 'C', id: '3', spend: 1000, kop: 2, roas: 0.9, status: 'ACTIVE' },
      { namn: 'D', id: '4', spend: 1000, kop: 2, roas: 1.0, status: 'ACTIVE' },
    ],
  });
  // Fyra tjuvar ryms under taket, men resten blir tom → ingen kärna att rädda.
  assert.equal(utfall.dom, DOM.STANG_AV);
});

test('för många tjuvar är ett kampanjproblem', () => {
  const annonser = Array.from({ length: 6 }, (_, i) => ({
    namn: `A${i}`, id: String(i), spend: 1000, kop: 1, roas: 0.5, status: 'ACTIVE',
  }));
  annonser.push({ namn: 'Vinnare', id: 'v', spend: 1000, kop: 3, roas: 5, status: 'ACTIVE' });
  const utfall = spendtjuvsdom({ break_even: 1.6, spend_3d: 7000, annonser });
  assert.equal(utfall.dom, DOM.STANG_AV);
  assert.match(utfall.motivering, /kampanjproblem/);
});

test('resten måste själv vara bedömbar', () => {
  const utfall = spendtjuvsdom({
    break_even: 1.6,
    spend_3d: 3200,
    annonser: [
      { namn: 'Tjuv', id: '1', spend: 3000, kop: 1, roas: 0.4, status: 'ACTIVE' },
      // Resten: 200 kr — under grinden 300 kr, ingen dom går att fälla.
      { namn: 'Liten', id: '2', spend: 200, kop: 1, roas: 9, status: 'ACTIVE' },
    ],
  });
  assert.equal(utfall.dom, DOM.STANG_AV);
  assert.match(utfall.motivering, /inte bedömbar/);
});

test('taket på räddningar hindrar en zombiekampanj', () => {
  const utfall = spendtjuvsdom({ ...ADVENTSKALENDERN, raddningar_14d: MAX_RADDNINGAR_14D });
  assert.equal(utfall.dom, DOM.STANG_AV);
  assert.match(utfall.motivering, /taket/);
});

test('en annons strax under break-even är brus, inte en tjuv', () => {
  const utfall = spendtjuvsdom({
    break_even: 1.6,
    spend_3d: 2000,
    annonser: [
      // 1,55 är 3 % under break-even — inom marginalen, rörs inte.
      { namn: 'Nära', id: '1', spend: 1000, kop: 3, roas: 1.55, status: 'ACTIVE' },
      { namn: 'Bra', id: '2', spend: 1000, kop: 4, roas: 2.5, status: 'ACTIVE' },
    ],
  });
  assert.equal(utfall.dom, DOM.INGEN_TJUV);
});

test('stor spend utan ett enda köp är en tjuv', () => {
  const utfall = spendtjuvsdom({
    break_even: 1.6,
    spend_3d: 2000,
    annonser: [
      { namn: 'Noll', id: '1', spend: 1000, kop: null, roas: null, status: 'ACTIVE' },
      { namn: 'Bra', id: '2', spend: 1000, kop: 4, roas: 3.2, status: 'ACTIVE' },
    ],
  });
  assert.equal(utfall.dom, DOM.PAUSA_TJUVAR);
  assert.deepEqual(utfall.tjuvar.map((a) => a.namn), ['Noll']);
});

test('pausade annonser räknas inte med', () => {
  const utfall = spendtjuvsdom({
    break_even: 1.6,
    spend_3d: 1400,
    annonser: [
      { namn: 'Redan pausad', id: '1', spend: 5000, kop: 0, roas: 0, status: 'PAUSED' },
      { namn: 'Tjuv', id: '2', spend: 1000, kop: 1, roas: 0.4, status: 'ACTIVE' },
      { namn: 'Bra', id: '3', spend: 400, kop: 2, roas: 4, status: 'ACTIVE' },
    ],
  });
  assert.equal(utfall.dom, DOM.PAUSA_TJUVAR);
  assert.deepEqual(utfall.tjuvar.map((a) => a.namn), ['Tjuv']);
});

test('utan break-even fälls ingen dom', () => {
  const utfall = spendtjuvsdom({ spend_3d: 3000, annonser: [] });
  assert.equal(utfall.dom, DOM.STANG_AV);
  assert.match(utfall.motivering, /Break-even saknas/);
});

test('lasAnnons tål Metas egna strängar ordagrant', () => {
  const a = lasAnnons({ name: 'X', amount_spent: '3 316,26 kr (SEK)', purchase_roas: '0.752354', omni_purchase: '5', effective_status: 'ACTIVE' });
  assert.equal(a.namn, 'X');
  assert.ok(Math.abs(a.spend - 3316.26) < 0.01);
  assert.ok(Math.abs(a.roas - 0.752354) < 0.000001);
  assert.equal(a.kop, 5);
  assert.ok(Math.abs(a.intakt - 3316.26 * 0.752354) < 0.01);
});

test('dranering är noll exakt vid break-even', () => {
  const a = lasAnnons({ name: 'X', amount_spent: 1000, purchase_roas: 1.6, omni_purchase: 2 });
  assert.ok(Math.abs(dranering(a, 1.6)) < 0.0001);
});

// ---------------------------------------------------------------------------
// Grönt läge (Axels beslut 2026-09-20): spärren i kampanjer som går plus.
// ---------------------------------------------------------------------------

const GRON = {
  lage: 'gron', idag: '2026-09-27',
  kampanj_namn: 'Taköverdraget | BE ROAS 1.63 | Launch 2026-09-01',
  break_even: 1.63, break_even_cpa: 700, spend_3d: '48 000,00 kr (SEK)',
  annonser: [
    { id: 'v', namn: 'Takoverdrag_PD_10_H1', spend: '30 000,00 kr (SEK)', kop: 150, roas: '4.5', status: 'ACTIVE' },
    // ≥ 3 köp under break-even × 0,9 och dränerar: tjuv (UNDER_BE)
    { id: 't1', namn: 'Takoverdrag_CS_5_H1', spend: '6 000,00 kr (SEK)', kop: 5, roas: '0.9', status: 'ACTIVE' },
    // 0 köp över 3 × BE-CPA (2 100 kr): tjuv (NOLL_KOP)
    { id: 't2', namn: 'Takoverdrag_SP_6_1', spend: '5 000,00 kr (SEK)', kop: 0, roas: null, status: 'ACTIVE' },
    // 2 köp under break-even: brus i en grön kampanj — INTE tjuv
    { id: 'b', namn: 'Takoverdrag_PD_7_H1', spend: '5 000,00 kr (SEK)', kop: 2, roas: '0.8', status: 'ACTIVE' },
    // 0 köp men under 3 × BE-CPA: inte tjuv
    { id: 'u', namn: 'Takoverdrag_G_8_1', spend: '1 900,00 kr (SEK)', kop: 0, roas: null, status: 'ACTIVE' },
  ],
};

test('grönt läge: Axels grind — ≥ 3 köp under BE eller 0 köp över 3 × BE-CPA; 1–2 köp är brus', () => {
  const u = spendtjuvsdom(GRON);
  assert.equal(u.dom, DOM.TJUV_I_GRON);
  assert.deepEqual(u.tjuvar.map((a) => a.id).sort(), ['t1', 't2']);
  assert.equal(u.tjuvar.find((a) => a.id === 't1').orsak, 'UNDER_BE');
  assert.equal(u.tjuvar.find((a) => a.id === 't2').orsak, 'NOLL_KOP');
  assert.match(u.motivering, /kampanjen rörs inte/);
});

test('grönt läge: utan break_even_cpa döms inga 0-köpsannonser, och det står i rapporten', () => {
  const u = spendtjuvsdom({ ...GRON, break_even_cpa: undefined });
  assert.deepEqual(u.tjuvar.map((a) => a.id), ['t1']);
  assert.match(u.noteringar.join(' '), /break_even_cpa saknas/);
});

test('grönt läge: nåd för etiketterad BREAKTHROUGH med livstid över break-even — takad', () => {
  const bt = { id: 't1', namn: 'Takoverdrag_CS_5_H1', spend: '6 000,00 kr (SEK)', kop: 5, roas: '0.9', status: 'ACTIVE', roas_livstid: '2.4', etikett: 'BREAKTHROUGH', etikett_datum: '2026-09-20' };
  const bara = (a) => ({ ...GRON, annonser: [GRON.annonser[0], a] });
  // Nåd: inga 7-dygnstal ⇒ väntar.
  let u = spendtjuvsdom(bara(bt));
  assert.equal(u.dom, DOM.INGEN_TJUV);
  assert.equal(u.vantar.length, 1);
  assert.match(u.vantar[0].vantar_orsak, /nåd/);
  // Nåden bryts: dränering 7 d ≥ 3 × BE-CPA (2 100 kr).
  u = spendtjuvsdom(bara({ ...bt, spend_7d: 9000, roas_7d: 0.9 }));
  assert.equal(u.dom, DOM.TJUV_I_GRON);
  assert.equal(u.tjuvar[0].nad_bruten, true);
  assert.equal(u.tjuvar[0].orsak, 'TROTT_VINNARE');
  // Nåden bryts: 5 back-dygn i rad.
  u = spendtjuvsdom(bara({ ...bt, backdagar_i_rad: 5 }));
  assert.equal(u.dom, DOM.TJUV_I_GRON);
  // Etiketten äldre än 14 dygn ⇒ ingen nåd.
  u = spendtjuvsdom(bara({ ...bt, etikett_datum: '2026-09-01' }));
  assert.equal(u.dom, DOM.TJUV_I_GRON);
  // SPEND_WINNER får ingen nåd — bara BREAKTHROUGH.
  u = spendtjuvsdom(bara({ ...bt, etikett: 'SPEND_WINNER' }));
  assert.equal(u.dom, DOM.TJUV_I_GRON);
});

test('grönt läge: ung annons med liten dränering väntar; utan tjuvar ⇒ INGEN_TJUV; för många ⇒ ROR_INGENTING', () => {
  const ung = { id: 'y', namn: 'Takoverdrag_PD_9_H1', spend: '5 000,00 kr (SEK)', kop: 0, roas: null, status: 'ACTIVE', alder_dagar: 3 };
  // Dränering 5 000 kr ≥ 1 000 ⇒ ingen ungdomsrabatt.
  let u = spendtjuvsdom({ ...GRON, annonser: [GRON.annonser[0], ung] });
  assert.equal(u.dom, DOM.TJUV_I_GRON);
  // Mindre dränering (0 köp, 2 200 kr — över 3 × BE-CPA men 2 200 kr dränering ≥ 1 000) ⇒ fortfarande tjuv;
  // med 3 köp ROAS 1,3 på 2 200 kr dränerar den ~445 kr — under 500-grinden, ingen tjuv alls.
  u = spendtjuvsdom({ ...GRON, annonser: [GRON.annonser[0], { ...ung, spend: '2 200,00 kr (SEK)', kop: 3, roas: '1.3' }] });
  assert.equal(u.dom, DOM.INGEN_TJUV);
  // 6 tjuvar i en grön kampanj: datan stämmer inte — rör ingenting.
  const manga = Array.from({ length: 6 }, (_, i) => ({ id: `m${i}`, namn: `Takoverdrag_X_${i}_1`, spend: '5 000,00 kr (SEK)', kop: 4, roas: '0.5', status: 'ACTIVE' }));
  u = spendtjuvsdom({ ...GRON, spend_3d: '40 000,00 kr (SEK)', annonser: manga });
  assert.equal(u.dom, DOM.ROR_INGENTING);
});

test('trappan behåller den gamla grinden: Övervakningskamerans tjuvar (1–2 köp) pausas fortfarande', () => {
  const u = spendtjuvsdom(OVERVAKNINGSKAMERAN);
  assert.equal(u.dom, DOM.PAUSA_TJUVAR);
  assert.equal(u.tjuvar.length, 3);
  assert.ok(u.tjuvar.every((a) => a.orsak === 'UNDER_BE'));
});
