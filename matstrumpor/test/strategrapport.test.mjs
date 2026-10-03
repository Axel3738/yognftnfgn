import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  manniskodel, arManniskotext, arStangd, koRader, delaKo, betade, doneUtanLardom, nyaRader, butiksnamnRader, hubbAktivitet,
  vinnare, veckansUtfall, toppBatch, hitrater, perVecka, matVecka, eskalering, actionNyckel, valjAction,
} from '../strategrapport/matt.mjs';
import { feedbackText, loggradText, rapportAxel, eskaleringText, rensa, forraRad } from '../strategrapport/text.mjs';
import { roadmapRad, hubbRad, kommentarInnehall, richText } from '../strategrapport/notion.mjs';
import { rapportVecka, fonsterFor, snapshotRad, snapshotHubbrad, tolkaArgv, hubbKarta } from '../strategrapport/kor.mjs';
import { kontrollera } from '../../redigerarrapport/post.mjs';
import { SEED_SLUT } from '../growthguide.mjs';

const BRUCE = '1a4d872b-594c-81d8-adf3-0002a95f9e7f';
const BOT = '3cd270ab-908c-8134-83c9-00279f23f18a';
const AXEL = '332d872b-594c-815b-92e8-0002f9c93383';
const STRATEG = { id: 'gilz', namn: 'Gilz Bruce Biazon', fornamn: 'Bruce', notion_user_id: BRUCE };
const bank = JSON.parse(readFileSync(new URL('../strategrapport/actions.json', import.meta.url), 'utf8'));
const SADD = `(seeded from lardomar.md, L-x) Hooken stoppade ingen. ${SEED_SLUT}`;

const rad = (titel, over = {}) => ({
  id: `id-${titel}`, titel, status: 'Learning', results: '❌ Loser', learnings: '', memo: `(seeded from the brief) WHY: x. ${SEED_SLUT}`, desire: 'status', subavatar: 'gift buyer', angles: 'gift', awareness: 'Problem Aware',
  adType: '💡 Ideation', fileType: '🎬 Video', linkBrief: 'https://notion/brief', linkAd: null, batchnr: '#001', dateAdded: '2026-09-20', author: 'Gilz Bruce Biazon', spend: 500, kop: 4, hook: 0.4, hold: 0.1, upvote: null, system: '2026-10-03 · hash:abc',
  created_by: BOT, created_time: '2026-10-03T06:32:00.000Z', last_edited_by: BOT, last_edited_time: '2026-10-03T06:50:00.000Z', ...over,
});
const annons = (namn, over = {}) => ({ namn, id: `ad-${namn}`, status: 'ACTIVE', d0: '2026-09-21', etikett: null, etiketter: [], senaste_matning: { spend_sek: 400, kop: 3, hook_rate: 0.4, hold_rate: 0.1 }, ...over });
const batch = (titel, over = {}) => ({ titel, annonser: [annons(titel)], ids: [`ad-${titel}`], forfattare: [], etikett: null, d0: '2026-09-21', spend_14d_sek: 400, kop_14d: 3, hook_rate: 0.4, hold_rate: 0.1, foralder: null, kreator: null, ...over });

const AKT = { fran: '2026-09-29T00:00:00.000Z', till: '2026-10-06T01:00:00.000Z' };
const FON = { fran: '2026-09-29', till: '2026-10-05' };

test('människotext: tomt och systemets sådd räknas inte, det som står EFTER slutmarkören är människans', () => {
  assert.equal(arManniskotext(''), false);
  assert.equal(arManniskotext(SADD), false);
  assert.equal(arManniskotext('Too little data'), true);
  assert.equal(manniskodel(`${SADD}\n\nCut as briefed. Guess: the first frame.`), 'Cut as briefed. Guess: the first frame.');
  // gammal sådd utan markör: bara SOP:ens ord avslöjar människan
  assert.equal(manniskodel('(seeded from lardomar.md, L-x) Hooken stoppade ingen.'), '');
  assert.equal(arManniskotext('(seeded from lardomar.md, L-x) Hooken.\nToo little data'), true);
  assert.equal(arStangd({ status: 'Learning', learnings: 'Too little data' }), true, '"Too little data" stänger utan Done (SOP steg 1)');
  assert.equal(arStangd({ status: 'Learning', learnings: `${SADD}` }), false);
});

test('kön: rader med utfall som inte är stängda, delad på grinden 300 kr OCH 3 köp', () => {
  const rader = [rad('a'), rad('b', { status: 'Done' }), rad('c', { results: null }), rad('d', { spend: 200, kop: 5 }), rad('e', { spend: 900, kop: 2 }), rad('f', { spend: null, kop: null }), rad('g', { learnings: 'Too little data', spend: 20, kop: 0 })];
  const ko = koRader(rader);
  assert.deepEqual(ko.map((r) => r.titel), ['a', 'd', 'e', 'f']);
  const { bedombara, tunna } = delaKo(ko);
  assert.deepEqual(bedombara.map((r) => r.titel), ['a']);
  assert.deepEqual(tunna.map((r) => r.titel), ['d', 'e', 'f']);
});

test('betade: bara nya stängda med människotext sedan förra snapshoten; text under sådden räknas; kvaliteten per rad', () => {
  const forra = { rader: [{ id: 'id-gammal', status: 'Done', learnings: 'Guess: hooken.' }, { id: 'id-ny', status: 'Learning', learnings: '' }] };
  const rader = [
    rad('gammal', { status: 'Done', learnings: 'Guess: hooken.' }),
    rad('ny', { status: 'Done', learnings: 'Cut as briefed. Hook lower than best batch. Guess: the first frame.' }),
    rad('under-sadd', { status: 'Done', learnings: `${SADD}\nAs briefed. Guess: the hook.` }),
    rad('tunn', { status: 'Done', learnings: 'Too little data', spend: 50, kop: 0 }),
    rad('tunn-utan-done', { status: 'Learning', learnings: 'Too little data', spend: 50, kop: 0 }),
    rad('tunn-domd', { status: 'Done', learnings: 'Guess: the angle is wrong.', spend: 50, kop: 0 }),
    rad('utan-guess', { status: 'Done', learnings: 'Hold was fine, hook was not.' }),
    rad('sadd', { status: 'Done', learnings: SADD }),
    rad('oppen', { status: 'Learning', learnings: 'Guess: x' }),
  ];
  const b = betade(rader, forra);
  assert.deepEqual(b.map((x) => x.titel), ['ny', 'under-sadd', 'tunn', 'tunn-utan-done', 'tunn-domd', 'utan-guess']);
  assert.equal(b[0].typ, 'lardom'); assert.equal(b[0].harGuess, true); assert.equal(b[0].namnerHookHold, true); assert.equal(b[0].utanGuess, false);
  assert.equal(b[1].typ, 'lardom', 'texten under sådden är hans');
  assert.equal(b[2].typ, 'too_little'); assert.equal(b[2].tunnMenDomd, false);
  assert.equal(b[3].typ, 'too_little', 'Too little data utan Done räknas som stängd');
  assert.equal(b[4].tunnMenDomd, true, 'under grinden men dömd');
  assert.equal(b[5].utanGuess, true, 'över grinden utan Guess:');
  assert.equal(betade(rader, null).length, 7, 'första körningen: allt stängt med människotext räknas');
  assert.deepEqual(doneUtanLardom([rad('x', { status: 'Done' }), rad('y', { status: 'Done', learnings: 'ok' }), rad('z', { status: 'Done', learnings: SADD })], null).map((r) => r.titel), ['x', 'z']);
  assert.equal(doneUtanLardom([rad('x', { status: 'Done' })], { rader: [{ id: 'id-x', status: 'Done' }] }).length, 0, 'inte ny sedan förra');
});

test('nya rader: bara strategens egna i fönstret, de sex cellerna, sådd räknas inte som ifylld', () => {
  const rader = [
    rad('kodens', { created_by: BOT, created_time: '2026-10-01T00:00:00.000Z' }),
    rad('hans-komplett', { created_by: BRUCE, created_time: '2026-10-05T07:10:00.000Z', memo: 'WHY: parents hate socks. WHAT: unboxing. HOW: ugc.', system: '' }),
    rad('hans-halv', { created_by: BRUCE, created_time: '2026-10-05T07:12:00.000Z', memo: '', awareness: null, adType: null, status: 'Filming', linkBrief: null, system: '' }),
    rad('hans-gammal', { created_by: BRUCE, created_time: '2026-09-20T07:12:00.000Z', system: '' }),
  ];
  const n = nyaRader(rader, { strategId: BRUCE, fran: AKT.fran, till: AKT.till });
  assert.deepEqual(n.map((x) => x.titel), ['hans-komplett', 'hans-halv']);
  assert.equal(n[0].komplett, true);
  assert.deepEqual(n[1].saknas, ['BREAKTHROUGH MEMO', 'AWARENESS LEVEL', 'AD TYPE']);
  assert.equal(n[1].filming, true);
  const s = nyaRader([rad('s', { created_by: BRUCE, created_time: '2026-10-05T07:12:00.000Z' })], { strategId: BRUCE, fran: AKT.fran, till: AKT.till });
  assert.deepEqual(s[0].saknas, ['BREAKTHROUGH MEMO'], 'seeded memo räknas inte som ifylld');
});

test('butikens namn: hans konceptnamn och en människoskriven memo, aldrig en lärdom eller sådden', () => {
  const rader = [
    rad('sadd', { memo: `(seeded from the brief) WHY: matstrumpor. ${SEED_SLUT}` }),
    rad('memo', { memo: 'WHY: Matstrumpor rules.' }),
    rad('lard', { learnings: 'Guess: matstrumpor.se is slow' }),
    rad('Matstrumpor julklapp', { created_by: BRUCE }),
    rad('Matstrumpor kodens', { created_by: BOT }),
  ];
  assert.deepEqual(butiksnamnRader(rader, { strategId: BRUCE }).map((r) => r.titel), ['memo', 'Matstrumpor julklapp']);
});

test('hubben: rörda rader i fönstret, gick live sedan förra snapshoten, och kön', () => {
  const hub = [
    { id: '1', namn: '066', status: 'Creative strat review', ansvariga: [BRUCE], created_by: AXEL, created_time: '2026-09-20T00:00:00Z', last_edited_by: BRUCE, last_edited_time: '2026-10-03T04:20:00.000Z' },
    { id: '2', namn: '067', status: 'To be Reviewed', ansvariga: [BRUCE], created_by: BRUCE, created_time: '2026-10-04T04:20:00.000Z', last_edited_by: BOT, last_edited_time: '2026-10-05T04:20:00.000Z' },
    { id: '3', namn: '050', status: 'Approved + Launched in SE', ansvariga: [BRUCE], created_by: BRUCE, created_time: '2026-09-14T00:00:00Z', last_edited_by: BOT, last_edited_time: '2026-10-05T00:00:00Z' },
    { id: '4', namn: 'carls', status: 'Creative strat review', ansvariga: ['carl'], created_by: 'carl', created_time: '2026-10-04T00:00:00Z', last_edited_by: 'carl', last_edited_time: '2026-10-04T00:00:00Z' },
    { id: '5', namn: '054', status: 'Approved + Launched in SE', ansvariga: [BRUCE], created_by: BOT, created_time: '2026-09-27T00:00:00Z', last_edited_by: BOT, last_edited_time: '2026-10-01T14:31:00Z' },
  ];
  const h = hubbAktivitet(hub, { strategId: BRUCE, fran: AKT.fran, till: AKT.till });
  assert.deepEqual(h.inlamnade.map((x) => x.namn), ['066', '067']);
  assert.equal(h.iKo, 2); assert.equal(h.egna, 4);
  assert.equal(h.gickLiveMatt, false); assert.deepEqual(h.gickLive, []);
  const h2 = hubbAktivitet(hub, { strategId: BRUCE, fran: AKT.fran, till: AKT.till, forraHub: [{ id: '5', status: 'Creative strat review' }, { id: '3', status: 'Approved + Launched in SE' }] });
  assert.deepEqual(h2.gickLive.map((x) => x.namn), ['054'], 'bara den som INTE var live i förra snapshoten');
  assert.equal(h2.gickLiveMatt, true);
});

test('vinnare: levande = etikett ≤ 28 dygn och annonsen kör; bara LIVE iterationer räknas mot tre; flaggan efter 14 dagar', () => {
  const vinnareBatch = batch('09-17 Nathalie', { etikett: 'BREAKTHROUGH', annonser: [annons('09-17 Nathalie', { etikett: 'BREAKTHROUGH', etiketter: [{ vecka: 1, etikett: 'BREAKTHROUGH', datum: '2026-09-24' }] })] });
  const iter = batch('sushi_gift_ugc_060', { foralder: '09-17 Nathalie', annonser: [annons('MATSTRUMP_sushi_gift_ugc_060_h1_i1pnat_v1')] });
  const briefad = batch('sushi_gift_ugc_066', { foralder: '09-17 Nathalie', ids: [], annonser: [annons('MATSTRUMP_sushi_gift_ugc_066_h1_i1pnat_v1', { id: null })] });
  const gammal = batch('haikuh3', { etikett: 'SPEND_WINNER', annonser: [annons('haikuh3', { status: 'PAUSED', etikett: 'SPEND_WINNER', etiketter: [{ vecka: 1, etikett: 'SPEND_WINNER', datum: '2026-08-01' }] })] });
  const v = vinnare([vinnareBatch, iter, briefad, gammal, batch('loser', { etikett: 'LOSER' })], { idag: '2026-10-09' });
  assert.equal(v.length, 2);
  assert.equal(v[0].titel, '09-17 Nathalie'); assert.equal(v[0].levande, true); assert.equal(v[0].dagar, 15);
  assert.equal(v[0].iterationer, 1, 'den briefade utan annons-id räknas inte'); assert.equal(v[0].briefade, 1);
  assert.equal(v[0].utanIteration, false); assert.equal(v[0].underTre, true);
  assert.equal(v[1].levande, false);
  const bara = vinnare([vinnareBatch, briefad], { idag: '2026-10-09' });
  assert.equal(bara[0].utanIteration, true, 'bara briefade iterationer ⇒ ingen live ⇒ flagga');
  assert.equal(vinnare([vinnareBatch], { idag: '2026-10-05' })[0].utanIteration, false, 'under 14 dagar: ingen flagga');
});

test('veckans utfall: etiketter med datum i fönstret, bästa först, egen via hubbens Ansvarig; hit rate med iterationer för sig', () => {
  const b = [
    batch('sushi_gift_ugc_054', { forfattare: ['Gilz Bruce Biazon'], etikett: 'KPI_WINNER', spend_14d_sek: 4232, kop_14d: 16, annonser: [annons('a', { etiketter: [{ vecka: 1, etikett: 'LOSER', datum: '2026-09-25' }, { vecka: 2, etikett: 'KPI_WINNER', datum: '2026-10-03' }] })] }),
    batch('sushi_gift_ugc_050', { forfattare: ['Gilz Bruce Biazon'], etikett: 'INGEN_LEVERANS', spend_14d_sek: 2, kop_14d: 0, annonser: [annons('b', { etiketter: [{ vecka: 1, etikett: 'INGEN_LEVERANS', datum: '2026-10-03' }] })] }),
    batch('carls', { forfattare: ['Carl Vicente'], etikett: 'LOSER', annonser: [annons('c', { etiketter: [{ vecka: 1, etikett: 'LOSER', datum: '2026-10-01' }] })] }),
    batch('gammal', { forfattare: ['Gilz Bruce Biazon'], etikett: 'LOSER', annonser: [annons('d', { etiketter: [{ vecka: 1, etikett: 'LOSER', datum: '2026-09-10' }] })] }),
    batch('iter-vinst', { forfattare: ['Gilz Bruce Biazon'], etikett: 'SPEND_WINNER', foralder: '09-17 Nathalie', annonser: [annons('e', { etiketter: [{ vecka: 1, etikett: 'SPEND_WINNER', datum: '2026-09-12' }] })] }),
  ];
  const u = veckansUtfall(b, { ...FON, strategNamn: 'Gilz Bruce Biazon' });
  assert.deepEqual(u.map((x) => x.titel), ['sushi_gift_ugc_054', 'carls', 'sushi_gift_ugc_050']);
  assert.equal(u[0].etikett, 'KPI_WINNER'); assert.equal(u[0].vecka, 2); assert.equal(u[0].uppgradering, true); assert.equal(u[0].egen, true); assert.equal(u[0].bedombar, true); assert.equal(u[0].iteration, false);
  assert.equal(u[1].egen, false);
  assert.equal(toppBatch(b).titel, 'sushi_gift_ugc_054');
  const h = hitrater(b, { strategNamn: 'Gilz Bruce Biazon' });
  assert.equal(h.egen.alla, 4); assert.equal(h.egen.levererade, 3); assert.equal(h.egen.traff, 1); assert.equal(h.egen.iter, 1);
  assert.equal(h.konto.alla, 5);
});

test('perVecka: sista raden per vecka vinner, bara veckor före den som mäts', () => {
  const h = [{ vecka: '2026-W40', a: 1 }, { vecka: '2026-W40', a: 2 }, { vecka: '2026-W41', a: 3 }, { vecka: '2026-W39', a: 0 }];
  assert.deepEqual(perVecka(h).map((x) => x.a), [0, 2, 3]);
  assert.deepEqual(perVecka(h, '2026-W41').map((x) => x.a), [0, 2]);
});

function mattExempel(over = {}) {
  const roadmap = [
    rad('sushi_gift_ugc_054', { spend: 4232, kop: 16 }),
    rad('sushi_gift_ugc_050', { spend: 50, kop: 0 }),
    rad('done-nu', { status: 'Done', learnings: 'As briefed. Hook under best batch. Guess: the first frame is a product shot.' }),
    rad('hans-ny', { created_by: BRUCE, created_time: '2026-10-05T07:10:00.000Z', memo: 'WHY: x. WHAT: y. HOW: z.', status: 'Working', results: null, system: '' }),
  ];
  const forra = { skrivet: AKT.fran, rader: [snapshotRad(rad('sushi_gift_ugc_054', { spend: 4232, kop: 16 })), snapshotRad(rad('sushi_gift_ugc_050', { spend: 50, kop: 0 })), snapshotRad(rad('done-nu'))], hub: [] };
  const hub = [{ id: '1', namn: 'MATSTRUMP_sushi_gift_ugc_066_h1_v1', status: 'Creative strat review', ansvariga: [BRUCE], ansvariga_namn: ['Gilz Bruce Biazon'], created_by: BRUCE, created_time: '2026-10-03T04:20:00.000Z', last_edited_by: BRUCE, last_edited_time: '2026-10-03T04:20:00.000Z' }];
  const batchar = [
    batch('sushi_gift_ugc_054', { forfattare: ['Gilz Bruce Biazon'], etikett: 'KPI_WINNER', spend_14d_sek: 4232, kop_14d: 16, hook_rate: 0.46, hold_rate: 0.09, annonser: [annons('a', { etiketter: [{ vecka: 2, etikett: 'KPI_WINNER', datum: '2026-10-03' }] })] }),
    batch('sushi_gift_ugc_050', { forfattare: ['Gilz Bruce Biazon'], etikett: 'INGEN_LEVERANS', spend_14d_sek: 2, kop_14d: 0, annonser: [annons('b', { etiketter: [{ vecka: 1, etikett: 'INGEN_LEVERANS', datum: '2026-10-03' }] })] }),
    batch('09-17 Nathalie captions musik', { etikett: 'BREAKTHROUGH', spend_14d_sek: 77803, kop_14d: 382, hook_rate: 0.52, hold_rate: 0.12, annonser: [annons('09-17 Nathalie captions musik', { etiketter: [{ vecka: 1, etikett: 'BREAKTHROUGH', datum: '2026-09-24' }] })] }),
  ];
  return matVecka({ roadmap, forra, hub, batchar, strateg: STRATEG, idag: '2026-10-06', vecka: '2026-W41', fonster: FON, aktivitet: AKT, konfig: {}, ...over });
}

test('matVecka: hela mätningen hänger ihop; måndagskollen är stängda rader eller ny rad, aldrig hubbarbete', () => {
  const M = mattExempel();
  assert.equal(M.ko.start, 3); assert.equal(M.ko.startBedombara, 2);
  assert.equal(M.ko.slut, 2); assert.deepEqual(M.ko.bedombaraKvar, ['sushi_gift_ugc_054']);
  assert.equal(M.betade.length, 1); assert.equal(M.betade[0].typ, 'lardom');
  assert.equal(M.nyaRader.length, 1); assert.equal(M.nyaRader[0].komplett, true);
  assert.equal(M.hubb.inlamnade.length, 1); assert.equal(M.hubb.gickLiveMatt, true);
  assert.equal(M.utfall.filter((u) => u.egen).length, 2);
  assert.equal(M.vinnare[0].levande, true); assert.equal(M.vinnare[0].dagar, 12);
  assert.equal(M.topp.titel, '09-17 Nathalie captions musik');
  assert.equal(M.gjordeKollen, true);
  assert.equal(M.forsta, false);
  const baraHubb = { ...M, betade: [], nyaRader: [] };
  assert.equal(matVecka({ roadmap: [rad('x')], forra: null, hub: mattExempel().hubb ? [] : [], batchar: [], strateg: STRATEG, idag: '2026-10-06', vecka: '2026-W41', fonster: FON, aktivitet: AKT }).gjordeKollen, false);
  assert.ok(baraHubb);
});

test('eskalering: ingen koll två distinkta veckor i rad, vinnare utan live iteration — annars tyst; aldrig på butiksnamn', () => {
  const M = mattExempel();
  assert.equal(eskalering(M, []).tillAxel, false);
  const tyst = { ...M, gjordeKollen: false };
  assert.equal(eskalering(tyst, []).tillAxel, false, 'en vecka: ingen eskalering');
  assert.equal(eskalering(tyst, [{ vecka: '2026-W40', gjordeKollen: false }]).tillAxel, true, 'två i rad');
  assert.equal(eskalering(tyst, [{ vecka: '2026-W41', gjordeKollen: false }]).tillAxel, false, 'samma vecka (--igen) räknas inte som en föregående');
  assert.equal(eskalering(tyst, [{ vecka: '2026-W40', gjordeKollen: false }, { vecka: '2026-W40', gjordeKollen: true }]).tillAxel, false, 'sista raden per vecka vinner');
  assert.equal(eskalering(tyst, [{ vecka: '2026-W39', gjordeKollen: false }, { vecka: '2026-W40', gjordeKollen: true }]).tillAxel, false, 'bruten svit');
  const vin = { ...M, vinnare: [{ ...M.vinnare[0], utanIteration: true, dagar: 15 }] };
  assert.equal(eskalering(vin, []).orsaker[0].kod, 'vinnare_utan_iteration');
  assert.equal(eskalering({ ...M, butiksnamn: ['x'] }, []).tillAxel, false);
});

test('action: läget väljer nyckeln, minnet väljer index (en rad per vecka), aldrig samma två gånger förrän listan är slut', () => {
  const M = mattExempel();
  assert.equal(actionNyckel(M), 'ko_bedombar_kvar');
  const a1 = valjAction(M, [], bank);
  assert.equal(a1.index, 0); assert.equal(a1.rubrik_sv, 'stänga raderna med nog data');
  const a2 = valjAction(M, [{ vecka: '2026-W40', action: { nyckel: 'ko_bedombar_kvar', index: 0 } }], bank);
  assert.equal(a2.index, 1);
  const dubbel = [{ vecka: '2026-W40', action: { nyckel: 'ko_bedombar_kvar', index: 0 } }, { vecka: '2026-W40', action: { nyckel: 'ko_bedombar_kvar', index: 1 } }];
  assert.equal(valjAction(M, dubbel, bank).index, 0, '--igen-dubbletten räknas som en vecka: bara sista raden (index 1) är given, så 0 är ledigt');
  const alla = bank.per_lage.ko_bedombar_kvar.map((_, i) => ({ vecka: `2026-W${30 + i}`, action: { nyckel: 'ko_bedombar_kvar', index: i } }));
  assert.equal(valjAction(M, alla, bank).index, 0, 'listan slut ⇒ börja om');
  const utanKo = { ...M, ko: { ...M.ko, bedombaraKvar: [] }, nyaRader: [] };
  assert.equal(actionNyckel(utanKo), 'ingen_ny_rad');
  const medRad = { ...utanKo, nyaRader: [{ komplett: true }] };
  assert.equal(actionNyckel(medRad), 'vinnare_utan_iteration', 'levande vinnare med under tre iterationer');
  const klar = { ...medRad, vinnare: [], kvalitet: { ...M.kvalitet, doneUtanLardom: [] } };
  assert.equal(actionNyckel(klar), 'KPI_WINNER', 'bästa egna utfallet');
  assert.equal(actionNyckel({ ...klar, utfall: [] }), 'allmant');
  for (const [k, lista] of Object.entries(bank.per_lage)) { assert.ok(bank.rubrik_sv[k], `rubrik_sv saknas för ${k}`); for (const it of lista) assert.doesNotThrow(() => kontrollera(it.text_en), `${k}: ${it.text_en}`); }
});

test('feedbacktexten: engelska, klarar spärren, bär alla delar, aldrig butiksnamn ur en titel', () => {
  const M = mattExempel();
  M.butiksnamn = ['Matstrumpor julklapp'];
  M.nyaRader[0].titel = 'Matstrumpor – unboxing';
  const action = valjAction(M, [], bank);
  const t = feedbackText(M, { action, forra: { text_en: 'Close the rows.', svar: '' } });
  assert.doesNotThrow(() => kontrollera(t));
  assert.match(t, /^Weekly strategy review, week 41 \(Sep 29 to Oct 5\), for Bruce/);
  assert.match(t, /Last week's one thing was: Close the rows\. Nothing in NOTES on that row yet\./);
  assert.match(t, /Your Monday check/);
  assert.match(t, /at the start of the week: 3 \(2 with enough data, 1 too little data\)/);
  assert.match(t, /You closed 1: 1 with a learning, 0 as too little data\./);
  assert.match(t, /first to close: sushi_gift_ugc_054/);
  assert.match(t, /New concept row: the store - unboxing, with memo/);
  assert.match(t, /Hub rows you worked on this week: 1 \(MATSTRUMP_sushi_gift_ugc_066_h1_v1\)\. Went live this week: 0\. Waiting in the review queue: 1\./);
  assert.match(t, /The store's name is in the store julklapp\. Keep it out of the concept name and the memo/);
  assert.match(t, /Best first: sushi_gift_ugc_054, KPI Winner \(week 2, upgraded\)/);
  assert.match(t, /Hook rate 46 %, hold 9 %\. The account's top batch sits at 52 % \/ 12 %/);
  assert.match(t, /No delivery: sushi_gift_ugc_050/);
  assert.match(t, /09-17 Nathalie captions musik: Breakthrough 12 days ago, 0 live iterations so far\. The course asks for three live within 14 days\./);
  assert.match(t, /Your hit rate, all your concepts: 0 of 1 that got delivery, 0 of 2 counting no delivery\. The account: 1 of 2\./);
  assert.match(t, /One thing for this week: Close the rows with enough data first/);
  assert.doesNotMatch(t, /matstrumpor/i);
  // hans NOTES-svar med förbjudna ord fäller aldrig körningen
  assert.match(forraRad({ text_en: 'x', svar: 'Done, closed four rows, ROAS was 1.2 on d3 and CPA high, see matstrumpor.se' }), /you wrote in NOTES "Done, closed four rows, return on spend was 1.2 on d3 and cost per purchase high, see the store site"/);
  assert.match(forraRad({ text_en: 'x', svar: null }), /I could not read NOTES on that row this time/);
  assert.equal(forraRad(null), null);
  M.ko.bedombaraKvar = ['Köp 2 få 2 static', 'Sushi 499kr static', 'Rea 1 299 kr – julen'];
  const t2 = feedbackText(M, { action });
  assert.match(t2, /first to close: purchases 2 få 2 static, Sushi static, Rea - julen\./);
  // ingen koll alls
  const tom = { ...M, betade: [], nyaRader: [], hubb: { inlamnade: [], gickLive: [], gickLiveMatt: false, iKo: 0, egna: 0 }, utfall: [], vinnare: [], gjordeKollen: false, kvalitet: { tunnMenDomd: [], utanGuess: [], doneUtanLardom: [] }, butiksnamn: [] };
  const t3 = feedbackText(tom, { action: null });
  assert.match(t3, /You closed none\./); assert.match(t3, /New concept row: none this week/); assert.match(t3, /Hub rows you worked on this week: none\. Waiting/); assert.match(t3, /No concept of yours got a label this week\./); assert.match(t3, /No winner alive right now/);
});

test('Log-raden under 1 900 tecken, Axels rapport svensk med en sak per rad, eskaleringstexten bara när det behövs', () => {
  const M = mattExempel();
  const action = valjAction(M, [], bank);
  const l = loggradText(M, action);
  assert.ok(l.length <= 1900);
  assert.match(l, /^Weekly review 2026-W41 · queue at start 3 \(2 with enough data\) · closed 1 \(1 learnings, 0 too little data\)/);
  assert.match(l, /hub rows worked on 1, went live 0/);
  assert.match(l, /Monday check: done$/);
  const r = rapportAxel(M, { action, eskalering: eskalering(M, []) });
  assert.match(r, /^Strategrapporten vecka 41 för Bruce\.\nHan gjorde sin måndagskoll\./);
  assert.match(r, /Veckans sak till honom: stänga raderna med nog data\./);
  assert.match(r, /Inget som kräver dig\./);
  assert.match(r, /Torrt: inget skrivet i Notion\./);
  assert.doesNotMatch(r, /Close the rows/);
  assert.equal(eskaleringText(M, eskalering(M, [])), null);
  const tyst = { ...M, gjordeKollen: false };
  const esk = eskalering(tyst, [{ vecka: '2026-W40', gjordeKollen: false }]);
  assert.match(eskaleringText(M, esk), /Ingen måndagskoll 2 veckor i rad\./);
  assert.match(rapportAxel(tyst, { eskalering: esk, skarpt: true, lank: 'https://notion/x' }), /Han gjorde ingen måndagskoll, men rörde 1 hubbrader\.[\s\S]*Till dig: Ingen måndagskoll 2 veckor i rad\./);
});

test('rensa tvättar allt spärren fäller ur en människas ord', () => {
  assert.equal(rensa('Matstrumpor – julen'), 'the store - julen');
  assert.equal(rensa('sushi_gift_ugc_056'), 'sushi_gift_ugc_056');
  assert.equal(rensa('sold at 499kr, ROAS 2, CPA ok, 3 köp, 500 SEK, bäverbutiken.se'), 'sold at, return on spend 2, cost per purchase ok, 3 purchases, 500, the store site');
  assert.doesNotThrow(() => kontrollera(rensa('Köp 2 få 2 – 1 299 kr ROAS CPA SEK matstrumpor.se')));
});

test('notion: sida → kompakt rad, hubbrad med id och namn, kommentarens rich_text med mention', () => {
  const sida = { id: 'p1', url: 'https://notion/p1', created_by: { id: BRUCE }, created_time: '2026-10-05T07:00:00.000Z', last_edited_by: { id: BOT }, last_edited_time: '2026-10-06T07:00:00.000Z', properties: {
    'AD CONCEPT': { type: 'title', title: [{ plain_text: 'sushi_gift_ugc_054' }] }, STATUS: { select: { name: 'Done' } }, RESULTS: { select: { name: '🎯 KPI Winner' } }, LEARNINGS: { rich_text: [{ plain_text: 'Guess: ' }, { plain_text: 'x' }] },
    'BREAKTHROUGH MEMO': { rich_text: [] }, 'SPEND 14D KR': { number: 4232 }, 'PURCHASES 14D': { number: 16 }, 'HOOK RATE': { number: 0.46 }, 'LINK TO BRIEF': { url: 'https://n/b' }, 'AWARENESS LEVEL': { select: null }, UPVOTE: { number: null }, SYSTEM: { rich_text: [{ plain_text: '2026-10-03 · hash:x' }] },
  } };
  const r = roadmapRad(sida);
  assert.equal(r.titel, 'sushi_gift_ugc_054'); assert.equal(r.status, 'Done'); assert.equal(r.results, '🎯 KPI Winner'); assert.equal(r.learnings, 'Guess: x'); assert.equal(r.spend, 4232); assert.equal(r.kop, 16); assert.equal(r.hook, 0.46); assert.equal(r.linkBrief, 'https://n/b'); assert.equal(r.awareness, null); assert.equal(r.created_by, BRUCE); assert.equal(r.last_edited_by, BOT);
  const h = hubbRad({ id: 'h1', url: 'u', created_by: { id: AXEL }, created_time: 't', last_edited_by: { id: BRUCE }, last_edited_time: 't2', properties: { Namn: { type: 'title', title: [{ plain_text: '066' }] }, Status: { status: { name: 'Creative strat review' } }, Ansvarig: { people: [{ id: BRUCE, name: 'Gilz Bruce Biazon' }] } } });
  assert.deepEqual(h, { id: 'h1', url: 'u', namn: '066', status: 'Creative strat review', typ: null, ansvariga: [BRUCE], ansvariga_namn: ['Gilz Bruce Biazon'], created_by: AXEL, created_time: 't', last_edited_by: BRUCE, last_edited_time: 't2' });
  const k = kommentarInnehall([{ mention: BRUCE }, { text: ' ' + 'a'.repeat(2500) }]);
  assert.equal(k[0].type, 'mention'); assert.equal(k[0].mention.user.id, BRUCE);
  assert.equal(k.length, 3); assert.equal(k[1].text.content.length, 1900);
  assert.equal(richText('').rich_text.length, 0);
  assert.deepEqual(hubbKarta([h]).get('066'), { ansvariga: ['Gilz Bruce Biazon'], url: 'u' });
  assert.deepEqual(snapshotHubbrad(h), { id: 'h1', namn: '066', status: 'Creative strat review' });
});

test('kor: veckan är måndagens ISO-vecka, fönstret tar vid efter förra körningen och är aldrig längre än 28 dagar', () => {
  assert.equal(rapportVecka('2026-10-06'), '2026-W41');
  assert.equal(rapportVecka('2026-10-05'), '2026-W40', 'måndag ⇒ gårdagens (söndagens) vecka');
  assert.deepEqual(fonsterFor('2026-10-06'), { fran: '2026-09-29', till: '2026-10-05' });
  assert.deepEqual(fonsterFor('2026-10-13', '2026-10-05'), { fran: '2026-10-06', till: '2026-10-12' }, 'tar vid dagen efter förra fönstret');
  assert.deepEqual(fonsterFor('2026-10-20', '2026-10-05'), { fran: '2026-10-06', till: '2026-10-19' }, 'en missad tisdag ⇒ två veckor');
  assert.deepEqual(fonsterFor('2026-12-01', '2026-10-05'), { fran: '2026-11-03', till: '2026-11-30' }, 'aldrig längre bakåt än 28 dagar');
  assert.deepEqual(fonsterFor('2026-10-06', '2026-10-06'), { fran: '2026-10-05', till: '2026-10-05' }, 'aldrig ett bakvänt fönster');
  assert.deepEqual(tolkaArgv(['--skarpt', '--idag', '2026-10-06', '--cache']), { skarpt: true, idag: '2026-10-06', cache: true, utanArkiv: false, igen: false, kolla: false });
  assert.throws(() => tolkaArgv(['--discord']), /Okänd flagga/);
  const s = snapshotRad(rad('x', { learnings: 'a'.repeat(500) }));
  assert.equal(s.learnings.length, 500, 'LEARNINGS sparas hel'); assert.equal(s.created_by, BOT);
});
