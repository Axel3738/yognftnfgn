import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  arManniskotext, koRader, delaKo, betade, doneUtanLardom, nyaRader, utanBrief, butiksnamnRader, hubbAktivitet,
  vinnare, veckansUtfall, toppBatch, hitrater, matVecka, eskalering, actionNyckel, valjAction,
} from '../strategrapport/matt.mjs';
import { feedbackText, loggradText, rapportAxel, eskaleringText, rensa, kollRader } from '../strategrapport/text.mjs';
import { roadmapRad, hubbRad, kommentarInnehall, richText } from '../strategrapport/notion.mjs';
import { rapportVecka, fonsterFor, snapshotRad, tolkaArgv, hubbKarta } from '../strategrapport/kor.mjs';
import { kontrollera } from '../../redigerarrapport/post.mjs';

const BRUCE = '1a4d872b-594c-81d8-adf3-0002a95f9e7f';
const BOT = '3cd270ab-908c-8134-83c9-00279f23f18a';
const AXEL = '332d872b-594c-815b-92e8-0002f9c93383';
const STRATEG = { id: 'gilz', namn: 'Gilz Bruce Biazon', fornamn: 'Bruce', notion_user_id: BRUCE };
const bank = JSON.parse(readFileSync(new URL('../strategrapport/actions.json', import.meta.url), 'utf8'));

const rad = (titel, over = {}) => ({
  id: `id-${titel}`, titel, status: 'Learning', results: '❌ Loser', learnings: '', memo: '(seeded from the brief) WHY: x.', desire: 'status', subavatar: 'gift buyer', angles: 'gift', awareness: 'Problem Aware',
  adType: '💡 Ideation', fileType: '🎬 Video', linkBrief: 'https://notion/brief', linkAd: null, batchnr: '#001', dateAdded: '2026-09-20', author: 'Gilz Bruce Biazon', spend: 500, kop: 4, hook: 0.4, hold: 0.1, upvote: null, system: '2026-10-03 · hash:abc',
  created_by: BOT, created_time: '2026-10-03T06:32:00.000Z', last_edited_by: BOT, last_edited_time: '2026-10-03T06:50:00.000Z', ...over,
});
const annons = (namn, over = {}) => ({ namn, id: `ad-${namn}`, status: 'ACTIVE', d0: '2026-09-21', etikett: null, etiketter: [], senaste_matning: { spend_sek: 400, kop: 3, hook_rate: 0.4, hold_rate: 0.1 }, ...over });
const batch = (titel, over = {}) => ({ titel, annonser: [annons(titel)], forfattare: [], etikett: null, d0: '2026-09-21', spend_14d_sek: 400, kop_14d: 3, hook_rate: 0.4, hold_rate: 0.1, foralder: null, kreator: null, ...over });

const AKT = { fran: '2026-09-29T00:00:00.000Z', till: '2026-10-06T01:00:00.000Z' };
const FON = { fran: '2026-09-29', till: '2026-10-05' };

test('människotext: tomt och systemets sådd räknas inte', () => {
  assert.equal(arManniskotext(''), false);
  assert.equal(arManniskotext('(seeded from lardomar.md, L-x) hooken'), false);
  assert.equal(arManniskotext('Too little data'), true);
});

test('kön: rader med utfall som inte är Done, delad på grinden 300 kr OCH 3 köp', () => {
  const rader = [rad('a'), rad('b', { status: 'Done' }), rad('c', { results: null }), rad('d', { spend: 200, kop: 5 }), rad('e', { spend: 900, kop: 2 }), rad('f', { spend: null, kop: null })];
  const ko = koRader(rader);
  assert.deepEqual(ko.map((r) => r.titel), ['a', 'd', 'e', 'f']);
  const { bedombara, tunna } = delaKo(ko);
  assert.deepEqual(bedombara.map((r) => r.titel), ['a']);
  assert.deepEqual(tunna.map((r) => r.titel), ['d', 'e', 'f']);
});

test('betade: bara nya Done med människotext sedan förra snapshoten; kvaliteten per rad', () => {
  const forra = { rader: [{ id: 'id-gammal', status: 'Done', learnings: 'Guess: hooken.' }, { id: 'id-ny', status: 'Learning', learnings: '' }] };
  const rader = [
    rad('gammal', { status: 'Done', learnings: 'Guess: hooken.' }),
    rad('ny', { status: 'Done', learnings: 'Cut as briefed. Hook lower than best batch. Guess: the first frame.' }),
    rad('tunn', { status: 'Done', learnings: 'Too little data', spend: 50, kop: 0 }),
    rad('tunn-domd', { status: 'Done', learnings: 'Guess: the angle is wrong.', spend: 50, kop: 0 }),
    rad('utan-guess', { status: 'Done', learnings: 'Hold was fine, hook was not.' }),
    rad('sadd', { status: 'Done', learnings: '(seeded from lardomar.md, L-x) text' }),
    rad('oppen', { status: 'Learning', learnings: 'Guess: x' }),
  ];
  const b = betade(rader, forra);
  assert.deepEqual(b.map((x) => x.titel), ['ny', 'tunn', 'tunn-domd', 'utan-guess']);
  assert.equal(b[0].typ, 'lardom'); assert.equal(b[0].harGuess, true); assert.equal(b[0].namnerHookHold, true); assert.equal(b[0].utanGuess, false);
  assert.equal(b[1].typ, 'too_little'); assert.equal(b[1].tunnMenDomd, false);
  assert.equal(b[2].tunnMenDomd, true, 'under grinden men dömd');
  assert.equal(b[3].utanGuess, true, 'över grinden utan Guess:');
  // första körningen: allt Done med människotext räknas
  assert.equal(betade(rader, null).length, 5);
  assert.deepEqual(doneUtanLardom([rad('x', { status: 'Done' }), rad('y', { status: 'Done', learnings: 'ok' })], null).map((r) => r.titel), ['x']);
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
  // seeded memo räknas inte som ifylld
  const s = nyaRader([rad('s', { created_by: BRUCE, created_time: '2026-10-05T07:12:00.000Z' })], { strategId: BRUCE, fran: AKT.fran, till: AKT.till });
  assert.deepEqual(s[0].saknas, ['BREAKTHROUGH MEMO']);
  // K5: Working-rad äldre än en vecka utan brief, bara hans egna
  const u = utanBrief([rad('gammal-working', { created_by: BRUCE, created_time: '2026-09-20T07:12:00.000Z', status: 'Working', linkBrief: null }), rad('kodens-working', { status: 'Working', linkBrief: null })], { strategId: BRUCE, idag: '2026-10-06' });
  assert.deepEqual(u.map((x) => x.titel), ['gammal-working']);
  assert.equal(u[0].dagar, 16);
});

test('butikens namn: bara i det en människa skrivit', () => {
  const rader = [
    rad('sadd', { memo: '(seeded from the brief) WHY: matstrumpor.' }),
    rad('memo', { memo: 'WHY: Matstrumpor rules.' }),
    rad('lard', { learnings: 'Guess: matstrumpor.se is slow' }),
    rad('Matstrumpor julklapp', { created_by: BRUCE }),
    rad('Matstrumpor kodens', { created_by: BOT }),
  ];
  assert.deepEqual(butiksnamnRader(rader, { strategId: BRUCE }).map((r) => r.titel), ['memo', 'lard', 'Matstrumpor julklapp']);
});

test('hubben: inlämnat i fönstret (skapad eller sist rörd av honom) och kön', () => {
  const hub = [
    { id: '1', namn: '066', status: 'Creative strat review', ansvariga: [BRUCE], created_by: AXEL, created_time: '2026-09-20T00:00:00Z', last_edited_by: BRUCE, last_edited_time: '2026-10-03T04:20:00.000Z' },
    { id: '2', namn: '067', status: 'To be Reviewed', ansvariga: [BRUCE], created_by: BRUCE, created_time: '2026-10-04T04:20:00.000Z', last_edited_by: BOT, last_edited_time: '2026-10-05T04:20:00.000Z' },
    { id: '3', namn: '050', status: 'Approved + Launched in SE', ansvariga: [BRUCE], created_by: BRUCE, created_time: '2026-09-14T00:00:00Z', last_edited_by: BOT, last_edited_time: '2026-10-05T00:00:00Z' },
    { id: '4', namn: 'carls', status: 'Creative strat review', ansvariga: ['carl'], created_by: 'carl', created_time: '2026-10-04T00:00:00Z', last_edited_by: 'carl', last_edited_time: '2026-10-04T00:00:00Z' },
  ];
  const h = hubbAktivitet(hub, { strategId: BRUCE, fran: AKT.fran, till: AKT.till });
  assert.deepEqual(h.inlamnade.map((x) => x.namn), ['066', '067']);
  assert.equal(h.iKo, 2);
  assert.equal(h.egna, 3);
});

test('vinnare: levande = etikett ≤ 28 dygn och annonsen kör; iterationer räknas på föräldern; flaggan efter 14 dagar', () => {
  const vinnareBatch = batch('09-17 Nathalie', { etikett: 'BREAKTHROUGH', annonser: [annons('09-17 Nathalie', { etikett: 'BREAKTHROUGH', etiketter: [{ vecka: 1, etikett: 'BREAKTHROUGH', datum: '2026-09-24' }] })] });
  const iter = batch('sushi_gift_ugc_060', { foralder: '09-17 Nathalie', annonser: [annons('MATSTRUMP_sushi_gift_ugc_060_h1_i1pnat_v1')] });
  const gammal = batch('haikuh3', { etikett: 'SPEND_WINNER', annonser: [annons('haikuh3', { status: 'PAUSED', etikett: 'SPEND_WINNER', etiketter: [{ vecka: 1, etikett: 'SPEND_WINNER', datum: '2026-08-01' }] })] });
  const v = vinnare([vinnareBatch, iter, gammal, batch('loser', { etikett: 'LOSER' })], { idag: '2026-10-09' });
  assert.equal(v.length, 2);
  assert.equal(v[0].titel, '09-17 Nathalie'); assert.equal(v[0].levande, true); assert.equal(v[0].dagar, 15); assert.equal(v[0].iterationer, 1); assert.equal(v[0].utanIteration, false); assert.equal(v[0].underTre, true);
  assert.equal(v[1].levande, false);
  const utan = vinnare([vinnareBatch], { idag: '2026-10-09' });
  assert.equal(utan[0].utanIteration, true);
  assert.equal(vinnare([vinnareBatch], { idag: '2026-10-05' })[0].utanIteration, false, 'under 14 dagar: ingen flagga');
});

test('veckans utfall: etiketter med datum i fönstret, bästa först, egen via hubbens Ansvarig', () => {
  const b = [
    batch('sushi_gift_ugc_054', { forfattare: ['Gilz Bruce Biazon'], etikett: 'KPI_WINNER', spend_14d_sek: 4232, kop_14d: 16, annonser: [annons('a', { etiketter: [{ vecka: 1, etikett: 'LOSER', datum: '2026-09-25' }, { vecka: 2, etikett: 'KPI_WINNER', datum: '2026-10-03' }] })] }),
    batch('sushi_gift_ugc_050', { forfattare: ['Gilz Bruce Biazon'], etikett: 'INGEN_LEVERANS', spend_14d_sek: 2, kop_14d: 0, annonser: [annons('b', { etiketter: [{ vecka: 1, etikett: 'INGEN_LEVERANS', datum: '2026-10-03' }] })] }),
    batch('carls', { forfattare: ['Carl Vicente'], etikett: 'LOSER', annonser: [annons('c', { etiketter: [{ vecka: 1, etikett: 'LOSER', datum: '2026-10-01' }] })] }),
    batch('gammal', { forfattare: ['Gilz Bruce Biazon'], etikett: 'LOSER', annonser: [annons('d', { etiketter: [{ vecka: 1, etikett: 'LOSER', datum: '2026-09-10' }] })] }),
  ];
  const u = veckansUtfall(b, { ...FON, strategNamn: 'Gilz Bruce Biazon' });
  assert.deepEqual(u.map((x) => x.titel), ['sushi_gift_ugc_054', 'carls', 'sushi_gift_ugc_050']);
  assert.equal(u[0].etikett, 'KPI_WINNER'); assert.equal(u[0].vecka, 2); assert.equal(u[0].uppgradering, true); assert.equal(u[0].egen, true); assert.equal(u[0].bedombar, true);
  assert.equal(u[1].egen, false);
  assert.equal(toppBatch(b).titel, 'sushi_gift_ugc_054');
  const h = hitrater(b, { strategNamn: 'Gilz Bruce Biazon' });
  assert.equal(h.egen.alla, 3); assert.equal(h.egen.levererade, 2); assert.equal(h.egen.traff, 0);
  assert.equal(h.konto.alla, 4);
});

function mattExempel(over = {}) {
  const roadmap = [
    rad('sushi_gift_ugc_054', { spend: 4232, kop: 16 }),
    rad('sushi_gift_ugc_050', { spend: 50, kop: 0 }),
    rad('done-nu', { status: 'Done', learnings: 'As briefed. Hook under best batch. Guess: the first frame is a product shot.' }),
    rad('hans-ny', { created_by: BRUCE, created_time: '2026-10-05T07:10:00.000Z', memo: 'WHY: x. WHAT: y. HOW: z.', status: 'Working', results: null, system: '' }),
  ];
  const forra = { skrivet: AKT.fran, rader: [snapshotRad(rad('sushi_gift_ugc_054', { spend: 4232, kop: 16 })), snapshotRad(rad('sushi_gift_ugc_050', { spend: 50, kop: 0 })), snapshotRad(rad('done-nu'))] };
  const hub = [{ id: '1', namn: 'MATSTRUMP_sushi_gift_ugc_066_h1_v1', status: 'Creative strat review', ansvariga: [BRUCE], ansvariga_namn: ['Gilz Bruce Biazon'], created_by: BRUCE, created_time: '2026-10-03T04:20:00.000Z', last_edited_by: BRUCE, last_edited_time: '2026-10-03T04:20:00.000Z' }];
  const batchar = [
    batch('sushi_gift_ugc_054', { forfattare: ['Gilz Bruce Biazon'], etikett: 'KPI_WINNER', spend_14d_sek: 4232, kop_14d: 16, hook_rate: 0.46, hold_rate: 0.09, annonser: [annons('a', { etiketter: [{ vecka: 2, etikett: 'KPI_WINNER', datum: '2026-10-03' }] })] }),
    batch('sushi_gift_ugc_050', { forfattare: ['Gilz Bruce Biazon'], etikett: 'INGEN_LEVERANS', spend_14d_sek: 2, kop_14d: 0, annonser: [annons('b', { etiketter: [{ vecka: 1, etikett: 'INGEN_LEVERANS', datum: '2026-10-03' }] })] }),
    batch('09-17 Nathalie captions musik', { etikett: 'BREAKTHROUGH', spend_14d_sek: 77803, kop_14d: 382, hook_rate: 0.52, hold_rate: 0.12, annonser: [annons('09-17 Nathalie captions musik', { etiketter: [{ vecka: 1, etikett: 'BREAKTHROUGH', datum: '2026-09-24' }] })] }),
  ];
  return matVecka({ roadmap, forra, hub, batchar, strateg: STRATEG, idag: '2026-10-06', vecka: '2026-W41', fonster: FON, aktivitet: AKT, konfig: {}, ...over });
}

test('matVecka: hela mätningen hänger ihop', () => {
  const M = mattExempel();
  assert.equal(M.ko.start, 3); assert.equal(M.ko.startBedombara, 2);
  assert.equal(M.ko.slut, 2); assert.deepEqual(M.ko.bedombaraKvar, ['sushi_gift_ugc_054']);
  assert.equal(M.betade.length, 1); assert.equal(M.betade[0].typ, 'lardom');
  assert.equal(M.nyaRader.length, 1); assert.equal(M.nyaRader[0].komplett, true);
  assert.equal(M.hubb.inlamnade.length, 1);
  assert.equal(M.utfall.filter((u) => u.egen).length, 2);
  assert.equal(M.vinnare[0].levande, true); assert.equal(M.vinnare[0].dagar, 12);
  assert.equal(M.topp.titel, '09-17 Nathalie captions musik');
  assert.equal(M.gjordeKollen, true);
  assert.equal(M.forsta, false);
});

test('eskalering: ingen koll två veckor i rad, vinnare utan iteration, butiksnamn — annars tyst', () => {
  const M = mattExempel();
  assert.equal(eskalering(M, []).tillAxel, false);
  const tyst = { ...M, gjordeKollen: false };
  assert.equal(eskalering(tyst, []).tillAxel, false, 'en vecka: ingen eskalering');
  assert.equal(eskalering(tyst, [{ gjordeKollen: false }]).tillAxel, true, 'två i rad');
  assert.equal(eskalering(tyst, [{ gjordeKollen: false }, { gjordeKollen: true }]).tillAxel, false, 'bruten svit');
  const vin = { ...M, vinnare: [{ ...M.vinnare[0], utanIteration: true, dagar: 15 }] };
  assert.equal(eskalering(vin, []).orsaker[0].kod, 'vinnare_utan_iteration');
  const namn = { ...M, butiksnamn: ['x'] };
  assert.equal(eskalering(namn, []).orsaker[0].kod, 'butiksnamn');
});

test('action: läget väljer nyckeln, minnet väljer index, aldrig samma två gånger förrän listan är slut', () => {
  const M = mattExempel();
  assert.equal(actionNyckel(M), 'ko_bedombar_kvar');
  const a1 = valjAction(M, [], bank);
  assert.equal(a1.index, 0);
  const a2 = valjAction(M, [{ action: { nyckel: 'ko_bedombar_kvar', index: 0 } }], bank);
  assert.equal(a2.index, 1);
  const alla = bank.per_lage.ko_bedombar_kvar.map((_, i) => ({ action: { nyckel: 'ko_bedombar_kvar', index: i } }));
  assert.equal(valjAction(M, alla, bank).index, 0, 'listan slut ⇒ börja om');
  const utanKo = { ...M, ko: { ...M.ko, bedombaraKvar: [] }, nyaRader: [] };
  assert.equal(actionNyckel(utanKo), 'ingen_ny_rad');
  const medRad = { ...utanKo, nyaRader: [{ komplett: true }] };
  assert.equal(actionNyckel(medRad), 'vinnare_utan_iteration', 'levande vinnare med under tre iterationer');
  const klar = { ...medRad, vinnare: [], kvalitet: { ...M.kvalitet, doneUtanLardom: [] } };
  assert.equal(actionNyckel(klar), 'KPI_WINNER', 'bästa egna utfallet');
  assert.equal(actionNyckel({ ...klar, utfall: [] }), 'allmant');
  for (const [k, lista] of Object.entries(bank.per_lage)) for (const it of lista) assert.doesNotThrow(() => kontrollera(it.text_en), `${k}: ${it.text_en}`);
});

test('feedbacktexten: engelska, klarar spärren, bär alla delar, aldrig butiksnamn ur en titel', () => {
  const M = mattExempel();
  M.butiksnamn = ['Matstrumpor julklapp'];
  M.nyaRader[0].titel = 'Matstrumpor – unboxing';
  const action = valjAction(M, [], bank);
  const t = feedbackText(M, { action, forra: { text_en: 'Close the rows.', svar: null } });
  assert.doesNotThrow(() => kontrollera(t));
  assert.match(t, /^Weekly strategy review, week 41 \(Sep 29 to Oct 5\), for Bruce/);
  assert.match(t, /Last week's one thing was: Close the rows\./);
  assert.match(t, /Your Monday check/);
  assert.match(t, /at the start of the week: 3 \(2 with enough data, 1 too little data\)/);
  assert.match(t, /You closed 1: 1 with a learning, 0 as too little data\./);
  assert.match(t, /first to close: sushi_gift_ugc_054/);
  assert.match(t, /New concept row: the store - unboxing, with memo/);
  assert.match(t, /Briefs you handed in to the hub: 1/);
  assert.match(t, /The store's name appears in the store julklapp/);
  assert.match(t, /Best first: sushi_gift_ugc_054, KPI Winner \(week 2, upgraded\)/);
  assert.match(t, /Hook rate 46 %, hold 9 %\. The account's top batch sits at 52 % \/ 12 %/);
  assert.match(t, /No delivery: sushi_gift_ugc_050/);
  assert.match(t, /09-17 Nathalie captions musik: Breakthrough 12 days ago, 0 iterations so far/);
  assert.match(t, /Your hit rate, all your concepts: 0 of 1 that got delivery \(0 of 2 counting no delivery\)\. The account: 1 of 2\./);
  assert.match(t, /One thing for this week: Close the rows with enough data first/);
  assert.doesNotMatch(t, /matstrumpor/i);
  // svaret på förra veckans item
  const t2 = feedbackText(M, { action, forra: { text_en: 'x', svar: 'Done, closed four rows' } });
  assert.match(t2, /you wrote in NOTES "Done, closed four rows"/);
  // ingen koll alls
  const tom = { ...M, betade: [], nyaRader: [], hubb: { inlamnade: [], iKo: 0, egna: 0 }, utfall: [], vinnare: [], gjordeKollen: false, kvalitet: { tunnMenDomd: [], utanGuess: [], doneUtanLardom: [], utanBrief: [] }, butiksnamn: [] };
  const t3 = feedbackText(tom, { action: null });
  assert.match(t3, /You closed none\./); assert.match(t3, /New concept row: none this week/); assert.match(t3, /No concept of yours got a label this week\./); assert.match(t3, /No winner alive right now/);
});

test('Log-raden under 1 900 tecken, Axels rapport svensk med en sak per rad, eskaleringstexten bara när det behövs', () => {
  const M = mattExempel();
  const action = valjAction(M, [], bank);
  const l = loggradText(M, action);
  assert.ok(l.length <= 1900);
  assert.match(l, /^Weekly review 2026-W41 · queue at start 3 \(2 with enough data\) · closed 1 \(1 learnings, 0 too little data\)/);
  assert.match(l, /Monday check: done$/);
  const r = rapportAxel(M, { action, eskalering: eskalering(M, []) });
  assert.match(r, /^Strategrapporten vecka 41 för Bruce\.\nHan gjorde sin måndagskoll\./);
  assert.match(r, /Inget som kräver dig\./);
  assert.match(r, /Torrt: inget skrivet i Notion\./);
  assert.equal(eskaleringText(M, eskalering(M, [])), null);
  const esk = eskalering({ ...M, gjordeKollen: false }, [{ gjordeKollen: false }]);
  assert.match(eskaleringText(M, esk), /Ingen måndagskoll 2 veckor i rad\./);
  assert.match(rapportAxel({ ...M, gjordeKollen: false }, { eskalering: esk, skarpt: true, lank: 'https://notion/x' }), /Till dig: Ingen måndagskoll 2 veckor i rad\./);
});

test('rensa tar bort butiksnamn och tankstreck ur titlar', () => {
  assert.equal(rensa('Matstrumpor – julen'), 'the store - julen');
  assert.equal(rensa('sushi_gift_ugc_056'), 'sushi_gift_ugc_056');
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
});

test('kor: veckan är måndagens ISO-vecka, fönstret de sju dygnen före, flaggorna', () => {
  assert.equal(rapportVecka('2026-10-06'), '2026-W41');
  assert.equal(rapportVecka('2026-10-05'), '2026-W40', 'måndag ⇒ gårdagens (söndagens) vecka');
  assert.deepEqual(fonsterFor('2026-10-06'), { fran: '2026-09-29', till: '2026-10-05' });
  assert.deepEqual(tolkaArgv(['--skarpt', '--idag', '2026-10-06', '--cache']), { skarpt: true, idag: '2026-10-06', cache: true, utanArkiv: false, igen: false, kolla: false });
  assert.throws(() => tolkaArgv(['--discord']), /Okänd flagga/);
  const s = snapshotRad(rad('x', { learnings: 'a'.repeat(500) }));
  assert.equal(s.learnings.length, 400); assert.equal(s.created_by, BOT);
});
