import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  batchNyckel, batcher, roadmapEgenskaper, resultatEgenskaper, loggrader, overviewText, statusFor, statusAttSkriva,
  saddAttSkriva, awarenessAv, lardomText, memoAv, hashAv, RESULTAT, AD_TYPE, FILE_TYPE, ROADMAP, RESULTS, LOG, PLANERING,
} from '../growthguide.mjs';

const matning = (spend, kop, roas, hook = 0.4, hold = 0.1) => ({ datum: '2026-10-02', spend_sek: spend, kop, roas, cpa_sek: kop ? spend / kop : null, hook_rate: hook, hold_rate: hold });
const annons = (namn, over = {}) => ({
  namn, id: `id-${namn}`, marknad: 'SE', vinkel: 'gift', format: 'ugc', typ: 'okänd', koncept: null, foralder: null, playbook: null, kalla: null,
  kreator: null, komponenter: {}, adset: 'nya16', adset_dom: null, d0: '2026-09-21', status: 'ACTIVE', etikett: null, etiketter: [], lardom: null,
  senaste_matning: null, vinstbidrag_14d_sek: null, brief: null, ...over,
});

test('batchnyckeln: hookvarianter och omklipp av samma löpnummer hör ihop, allt annat är sin egen batch', () => {
  assert.equal(batchNyckel('MATSTRUMP_sushi_gift_ugc_056h1_v1').nyckel, batchNyckel('MATSTRUMP_sushi_gift_ugc_056h3_v1').nyckel);
  assert.equal(batchNyckel('MATSTRUMP_sushi_gift_ugc_017v1h1_v1').nyckel, batchNyckel('MATSTRUMP_sushi_gift_ugc_017v2h3_v1').nyckel);
  assert.equal(batchNyckel('MATSTRUMP_sushi_gift_ugc_012v2_v1').titel, 'sushi_gift_ugc_012');
  assert.equal(batchNyckel('MATSTRUMP_sushi_gift_ugc_056h1_v1').batchnr, '#056');
  // haikuh2 och haikuh3 var två olika koncept (lardomar.md) — slås aldrig ihop på en gissning
  assert.notEqual(batchNyckel('MATSTRUMP_sushi_gift_ugc_haikuh2_v1').nyckel, batchNyckel('MATSTRUMP_sushi_gift_ugc_haikuh3_v1').nyckel);
  assert.equal(batchNyckel('MATSTRUMP_NO_sushi_gift_ugc_001_h1_v1').titel, 'NO sushi_gift_ugc_001');
  assert.equal(batchNyckel('MATSTRUMP_NO_sushi_gift_ugc_001_h1_v1').land, 'NO');
  const egen = batchNyckel('09-17 Nathalie captions musik');
  assert.equal(egen.titel, '09-17 Nathalie captions musik'); assert.equal(egen.batchnr, null);
});

test('batcher: bästa etiketten vinner, talen summeras, hook/hold vägs på spend, hubbens Ansvarig blir AUTHOR', () => {
  const hub = new Map([['MATSTRUMP_sushi_gift_ugc_056h1_v1', { ansvariga: ['Gilz Bruce Biazon'], url: 'https://notion/056h1' }], ['MATSTRUMP_sushi_gift_ugc_056h2_v1', { ansvariga: ['Gilz Bruce Biazon'], url: 'https://notion/056h2' }]]);
  const arkiv = { annonser: [
    annons('MATSTRUMP_sushi_gift_ugc_056h1_v1', { etikett: 'LOSER', etiketter: [{ vecka: 1, etikett: 'LOSER' }], senaste_matning: matning(300, 1, 1.0, 0.5, 0.2), vinstbidrag_14d_sek: -100, komponenter: { begar: 'status', avatar: 'presentkoparen', awareness: 'problem' }, koncept: 'nathalie', typ: 'ITER', iteration: 3, foralder: '09-17 Nathalie captions musik', lardom: 'L-x' }),
    annons('MATSTRUMP_sushi_gift_ugc_056h2_v1', { etikett: 'KPI_WINNER', etiketter: [{ vecka: 1, etikett: 'LOSER' }, { vecka: 2, etikett: 'KPI_WINNER' }], senaste_matning: matning(100, 1, 2.0, 0.3, 0.1), vinstbidrag_14d_sek: 50, d0: '2026-09-20' }),
    annons('MATSTRUMP_sushi_gift_ugc_056h3_v1', { etikett: 'INGEN_LEVERANS', senaste_matning: null }),
    annons('09-17 Nathalie captions musik', { vinkel: null, format: null, etikett: 'BREAKTHROUGH', kreator: 'nathalie', senaste_matning: matning(77803, 382, 2.1), vinstbidrag_14d_sek: 31578 }),
  ] };
  const b = batcher(arkiv, { hub, lardomar: '## L-x   (batch #1)\nHooken stoppade ingen.\n\n## L-y\nannat' });
  assert.equal(b.length, 2);
  assert.equal(b[0].titel, '09-17 Nathalie captions musik', 'störst spend först');
  const x = b[1];
  assert.equal(x.titel, 'sushi_gift_ugc_056');
  assert.equal(x.annonser.length, 3);
  assert.equal(x.etikett, 'KPI_WINNER', 'högsta rangen i batchen');
  assert.equal(x.spend_14d_sek, 400); assert.equal(x.kop_14d, 2);
  assert.equal(x.roas_14d, 1.25);
  assert.equal(x.hook_rate, 0.45, 'spendvägt: (0.5·300 + 0.3·100) / 400');
  assert.equal(x.vinstbidrag_14d_sek, -50);
  assert.equal(x.d0, '2026-09-20', 'tidigaste startdagen');
  assert.deepEqual(x.forfattare, ['Gilz Bruce Biazon']);
  assert.equal(x.brief_url, 'https://notion/056h1');
  assert.equal(x.lardom_text, 'Hooken stoppade ingen.');
  assert.deepEqual(x.ids, ['id-MATSTRUMP_sushi_gift_ugc_056h1_v1', 'id-MATSTRUMP_sushi_gift_ugc_056h2_v1', 'id-MATSTRUMP_sushi_gift_ugc_056h3_v1']);
});

test('roadmapEgenskaper: Evolves kolumner, bara systemfält i system och såddfält i sadd', () => {
  const b = batcher({ annonser: [annons('MATSTRUMP_sushi_gift_ugc_056h1_v1', { etikett: 'LOSER', typ: 'ITER', iteration: 3, foralder: 'nat', koncept: 'nathalie', kalla: 'axel', komponenter: { begar: 'status', avatar: 'presentkoparen', awareness: 'problem', hook_typ: 'gåta', mekanism: 'takeaway', tro: 'verklig', urgency: 'lager' }, senaste_matning: matning(400, 2, 1.5), lardom: 'L-x' })] }, { lardomar: '## L-x\nText.' })[0];
  const e = roadmapEgenskaper(b, { adsIds: ['p1'] });
  assert.equal(e.titel, 'sushi_gift_ugc_056');
  for (const k of Object.keys(e.system)) assert.ok(k in ROADMAP.system || k === 'ADS', `${k} är ingen systemkolumn`);
  for (const k of Object.keys(e.sadd)) assert.ok(k in ROADMAP.sadd, `${k} är ingen såddkolumn`);
  assert.equal('UPVOTE' in e.system, false); assert.equal('UPVOTE' in e.sadd, false);
  assert.equal(e.system.RESULTS.select.name, RESULTAT.LOSER);
  assert.equal(e.system['AD TYPE'].select.name, AD_TYPE.ITER);
  assert.equal(e.system['FILE TYPE'].select.name, FILE_TYPE.video);
  assert.equal(e.system['BATCH #'].rich_text[0].text.content, '#056');
  assert.match(e.system['LINK TO AD'].url, /selected_ad_ids=id-MATSTRUMP_sushi_gift_ugc_056h1_v1/);
  assert.deepEqual(e.system.ADS.relation, [{ id: 'p1' }]);
  assert.equal(e.system['SPEND 14D KR'].number, 400);
  assert.equal(e.sadd['AWARENESS LEVEL'].select.name, 'Problem Aware');
  assert.equal(e.sadd['DESIRE/CORE AVATAR'].rich_text[0].text.content, 'status');
  assert.equal(e.sadd['ANGLE(S)'].rich_text[0].text.content, 'gift · hook: gåta');
  assert.match(e.sadd['BREAKTHROUGH MEMO'].rich_text[0].text.content, /^\(seeded from the brief\) WHY: source: axel\. WHAT: concept nathalie, iteration 3 on nat, mechanism takeaway, hook gåta\. HOW: ugc, belief verklig, urgency lager\./);
  assert.equal(memoAv({ lardom_id: 'L-x', format: 'ugc' }), null, 'annonsens egen lärdom är inte ett WHY');
  assert.match(e.sadd.LEARNINGS.rich_text[0].text.content, /^\(seeded from lardomar\.md, L-x\) Text\./);
});

test('bild blir Static, okänd typ blir tom, utan annons blir länken tom', () => {
  const b = batcher({ annonser: [annons('MATSTRUMP_sushi_offer_static_d3_v1', { format: 'static', vinkel: 'offer', id: null })] })[0];
  const e = roadmapEgenskaper(b);
  assert.equal(e.system['FILE TYPE'].select.name, FILE_TYPE.static);
  assert.equal(e.system['AD TYPE'].select, null);
  assert.equal(e.system['LINK TO AD'].url, null);
  assert.equal(e.system.RESULTS.select, null);
  assert.equal(memoAv(b), null, 'inget i briefen ⇒ ingen memo-sådd');
});

test('STATUS: koden föreslår Filming/Working/Learning och rör aldrig Done', () => {
  assert.equal(statusFor({ ids: [], etikett: null }), 'Filming');
  assert.equal(statusFor({ ids: ['a'], etikett: null }), 'Working');
  assert.equal(statusFor({ ids: ['a'], etikett: 'LOSER' }), 'Learning');
  assert.equal(statusAttSkriva({ ids: ['a'], etikett: 'LOSER' }, null), 'Learning');
  assert.equal(statusAttSkriva({ ids: ['a'], etikett: 'LOSER' }, 'Working'), 'Learning');
  assert.equal(statusAttSkriva({ ids: ['a'], etikett: 'LOSER' }, 'Done'), null);
  assert.equal(statusAttSkriva({ ids: ['a'], etikett: 'LOSER' }, 'Learning'), null);
  assert.equal(statusAttSkriva({ ids: ['a'], etikett: null }, 'Learning'), null, 'aldrig nedåt');
});

test('såddregeln: en cell är systemets tills en människa rört den', () => {
  const sadd = { LEARNINGS: { rich_text: [{ text: { content: '(seeded from lardomar.md, L-x) ny text' } }] }, 'SUB AVATAR': { rich_text: [] }, 'AWARENESS LEVEL': { select: { name: 'Unaware' } } };
  assert.deepEqual(Object.keys(saddAttSkriva(sadd, null)).sort(), ['AWARENESS LEVEL', 'LEARNINGS'], 'ny rad: allt med värde');
  assert.deepEqual(Object.keys(saddAttSkriva(sadd, { LEARNINGS: '', 'AWARENESS LEVEL': 'Problem Aware' })), ['LEARNINGS'], 'bara den tomma cellen');
  assert.deepEqual(saddAttSkriva(sadd, { LEARNINGS: 'Bruce skrev det här', 'AWARENESS LEVEL': 'Unaware' }), {}, 'människans text rörs aldrig');
  assert.deepEqual(Object.keys(saddAttSkriva(sadd, { LEARNINGS: '(seeded from lardomar.md, L-x) gammal text', 'AWARENESS LEVEL': 'Unaware' })), ['LEARNINGS'], 'systemets egen sådd får uppdateras när den ändrats');
  assert.deepEqual(saddAttSkriva(sadd, { LEARNINGS: '(seeded from lardomar.md, L-x) ny text', 'AWARENESS LEVEL': 'Unaware' }), {}, 'samma sådd ⇒ inget skrivs');
  const tomSadd = { 'BREAKTHROUGH MEMO': { rich_text: [] }, LEARNINGS: { rich_text: [] } };
  assert.deepEqual(Object.keys(saddAttSkriva(tomSadd, { 'BREAKTHROUGH MEMO': '(seeded from the brief) WHY: builds on L-x.', LEARNINGS: 'Bruce skrev' })), ['BREAKTHROUGH MEMO'], 'systemets gamla sådd töms när briefen inte ger något; människans text står kvar');
  assert.deepEqual(saddAttSkriva(tomSadd, { 'BREAKTHROUGH MEMO': '', LEARNINGS: '' }), {}, 'tomt mot tomt ⇒ inget skrivs');
});

test('resultatEgenskaper: en annons → Ad Results, etiketthistoriken som text', () => {
  const e = resultatEgenskaper(annons('MATSTRUMP_sushi_gift_ugc_056h2_v1', { etikett: 'KPI_WINNER', etiketter: [{ vecka: 1, etikett: 'LOSER' }, { vecka: 2, etikett: 'KPI_WINNER' }], senaste_matning: matning(4389.44, 14, 1.341), vinstbidrag_14d_sek: -459.92, adset_dom: 'STANG' }), 'sushi_gift_ugc_056');
  for (const k of Object.keys(e.system)) assert.ok(k in RESULTS.system, `${k} är ingen Ad Results-kolumn`);
  assert.equal(e.system.RESULT.select.name, RESULTAT.KPI_WINNER);
  assert.equal(e.system['LABEL HISTORY'].rich_text[0].text.content, 'W1 LOSER · W2 KPI_WINNER');
  assert.equal(e.system.BATCH.rich_text[0].text.content, 'sushi_gift_ugc_056');
  assert.equal(e.system['SPEND 14D KR'].number, 4389);
  assert.equal(e.system['PROFIT 14D KR'].number, -460);
  assert.equal(e.system['ADSET VERDICT'].select.name, 'STANG');
  assert.equal(e.system.TYPE.select, null, 'okänd typ blir tom, inte texten "okänd"');
  const tom = resultatEgenskaper(annons('X', { status: 'PAUSED', id: null }), 'X');
  assert.equal(tom.system['SPEND 14D KR'].number, null); assert.equal(tom.system.MEASURED.date, null); assert.equal(tom.system['ADS MANAGER'].url, null);
});

test('loggrader: en rad per dag med det rutinen gjorde', () => {
  const logg = [
    { kod: 'ETIKETT', datum: '2026-09-30', annons: 'a', etikett: 'LOSER' }, { kod: 'ETIKETT', datum: '2026-09-30', annons: 'b', etikett: 'INGEN_LEVERANS' },
    { kod: 'FORSLAG', datum: '2026-09-30', atgard: 'PAUSA', objekt: 'x', orsak: 'vinstbidrag −396 kr' }, { kod: 'ROND_KLAR', datum: '2026-09-30' },
    { kod: 'BRIEF', datum: '2026-10-02', annons: 'MATSTRUMP_sushi_curiosity_ugc_068_v1' }, { kod: 'UPPLADDAD', datum: '2026-09-21', annons: 'c' },
    { kod: 'KO', datum: '2026-09-30' }, { kod: 'BESLUT' },
  ];
  const r = loggrader(logg);
  assert.deepEqual(r.map((x) => x.titel), ['2026-09-21 Mon', '2026-09-30 Wed', '2026-10-02 Fri']);
  assert.equal(r[1].system, 'Labels: 2 (LOSER 1, INGEN_LEVERANS 1) · Proposals to Axel: PAUSA x (vinstbidrag −396 kr) · Round completed');
  assert.equal(r[0].system, 'Uploaded: 1');
  assert.equal(r[2].system, 'Briefs: MATSTRUMP_sushi_curiosity_ugc_068_v1');
});

test('overview: Evolves hit rate med två nämnare och utfallen räknade', () => {
  const arkiv = { annonser: [annons('a', { etikett: 'BREAKTHROUGH' }), annons('b', { etikett: 'LOSER' }), annons('c', { etikett: 'INGEN_LEVERANS' }), annons('d')] };
  const t = overviewText(arkiv, [{ titel: 'a', etikett: 'BREAKTHROUGH' }], '2026-10-03');
  assert.match(t, /^AD HIT RATE: 1 of 3 labelled ads \(33 %\) · 1 of 2 that got delivery \(50 %\)/);
  assert.match(t, /🏆 Breakthrough 1 {3}💸 Spend Winner 0 {3}🎯 KPI Winner 0 {3}❌ Loser 1 {3}⚪ No delivery 1/);
  assert.match(t, /Batches: 1 · Ads: 4 · Breakthroughs: a\./);
  assert.match(overviewText({ annonser: [] }, [], '2026-10-03'), /0 of 0 labelled ads \(0 %\)/);
});

test('awareness, lärdomstext och hash', () => {
  assert.equal(awarenessAv('problem'), 'Problem Aware'); assert.equal(awarenessAv('most-aware'), 'Most Aware'); assert.equal(awarenessAv(null), null); assert.equal(awarenessAv('promo'), null);
  const md = '# Lärdomar\n## L-a   (batch #1 · LOSER)\n*Rad 1.*\n\nRad `2`.\n### L-batch-0a-ugc   (x)\nBatchtext.\n## L-b\nAnnat.';
  assert.equal(lardomText('L-a', md), 'Rad 1.\n\nRad 2.', 'markdown-tecken strippas');
  assert.equal(lardomText('L-batch-0a-ugc', md), 'Batchtext.');
  assert.equal(lardomText('L-saknas', md), null);
  assert.equal(hashAv({ a: 1 }), hashAv({ a: 1 })); assert.notEqual(hashAv({ a: 1 }), hashAv({ a: 2 }));
});

test('schemana: människornas kolumner finns inte bland systemets, och planeringsflikarna bär SOURCE', () => {
  for (const k of Object.keys(ROADMAP.manniska)) assert.equal(k in ROADMAP.system, false);
  for (const k of Object.keys(ROADMAP.sadd)) assert.equal(k in ROADMAP.system, false);
  assert.equal('NOTES' in LOG.system, false);
  for (const p of Object.values(PLANERING)) assert.ok('SOURCE' in p.kolumner, `${p.rubrik} saknar SOURCE`);
  assert.equal(ROADMAP.titel, 'AD CONCEPT'); assert.equal(RESULTS.titel, 'AD'); assert.equal(LOG.titel, 'DAY');
});
