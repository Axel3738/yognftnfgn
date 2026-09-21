// Ren logik i agent/lardom.mjs — lärdomen per etiketterad annons (CS-KLART.md).
// Inga filer, inget nät: loggen är en array, briefen en sträng.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  lardomId, KOMPONENTER, taggarUrBrief, komponentVarde, normaliseraTaggar, oskrivna, brieftak, mix, MIX, levandeBreakthroughs,
  vidarebyggBehov, konceptStatus, nastaIteration, skelett, delaBlock, validera, lardomRad, briefRad, status, formateraStatus, diagnos, RESEARCH_KALLOR,
} from '../lardom.mjs';

const ETIK = (over = {}) => ({
  datum: '2026-09-21', kampanj_id: 'K1', kampanj_namn: 'IBC-Tanköverdraget | BE ROAS 1.89', ad_account_id: '1867947880635861', kod: 'ETIKETT',
  annons_id: '111', annons_namn: 'IBC_PD_1_H1', batch: 1, typ: 'okänd', d0: '2026-08-28', d6: '2026-09-03', spend_ad: 7739, spend_kampanj: 8900, andel: 0.87, kop: 38, roas_ad: 3.07, roas_kampanj: 2.92,
  hook_rate: 0.31, hold_rate: 0.09, hook_text: 'Solljus in i tanken. Alger i vattnet.', hook_vo: null, etikett: 'BREAKTHROUGH', bedombar: true, genomford: true, ...over,
});
const BRIEF = `# IBC_PD_1_H1 — x

**VARIABELTAGGAR:** vinkel=\`PD problem/lösning\` · hook-typ=\`påstående\` · typ=\`N\` · koncept=\`PD alger\` · kalla=\`voc\` · avatar=\`tankagaren\` · awareness=\`problem\` · begar=\`skydda-det-jag-ager\` · mekanism=\`visa algerna, sedan skyddet\` · tro=\`ljus ger alger\` · urgency=\`sasong\` · hook-mekanik=\`none\` · confidence=\`high\`
`;

const LARDOM_OK = `### Lärdom L-111 — IBC_PD_1_H1 (BREAKTHROUGH, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | BREAKTHROUGH |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 7 739 kr / 8 900 kr (87 %) |
| Köp | 38 |
| ROAS / CPA | 3,07 / 204 kr — kampanjens ROAS 2,92 |
| Konverteringsgrad | 4,1 % (38 köp / 920 LPV) |
| Hook rate / hold rate | 31 % / 9 % |
| Bedömbar | ja |

**Koncept:** PD alger · **Typ:** N · **Parent:** — · **Iteration:** — · **Källa:** voc

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Bild/text: "Solljus in i tanken. Alger i vattnet." (källa: brief)

**Planerat mot utfört** (briefens taggar mot den live annonsen):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | tankagaren | tankägare med IBC i trädgården | ja |
| Vinkel | PD problem/lösning | PD | ja |
| Medvetandenivå | problem | problem | ja |
| Mekanism | visa algerna, sedan skyddet | algerna först, sedan skyddet | ja |
| Tro | ljus ger alger | ljus ger alger | ja |
| Positionering | skyddet som löser algerna | samma | ja |
| Brådska | sasong | ingen brådska i annonsen | nej |
**Utförandet föll:** ja · utford_som_briefad: ja

**Diagnos:** Breakthrough.

**Hypotes (gissning):** algerna i första bilden gör problemet synligt innan produkten visas — det bär hooken, inte texten.

**Nästa annonser:**
- \`IBC_PD_1_H2\` — typ I, parent IBC_PD_1_H1: samma video, ny hook "Grönt vatten i tanken?"
- \`IBC_PD_1_H3\` — typ I, parent IBC_PD_1_H1: längre problemdel (5 s alger) innan skyddet
`;

test('lardomId, taggar och komponentvärden', () => {
  assert.equal(lardomId('111'), 'L-111');
  assert.equal(lardomId('L-111'), 'L-111');
  const t = taggarUrBrief(BRIEF);
  assert.equal(t.typ, 'N');
  assert.equal(t.kalla, 'voc');
  assert.equal(komponentVarde(t, 'medvetandenivå'), 'problem');
  assert.equal(komponentVarde(t, 'brådska'), 'sasong');
  assert.equal(komponentVarde(t, 'tro'), 'ljus ger alger');
  assert.equal(komponentVarde(t, 'positionering'), null);
  const n = normaliseraTaggar({ type: 'iteration', desire: 'trygghet', belief: 'x', learning: 'L-1' });
  assert.deepEqual(n, { typ: 'I', begar: 'trygghet', tro: 'x', lardom: 'L-1' });
  assert.equal(normaliseraTaggar({ typ: 'imiterad' }).typ, 'IM');
  assert.deepEqual(KOMPONENTER, ['avatar', 'vinkel', 'medvetandenivå', 'mekanism', 'tro', 'positionering', 'brådska']);
});

test('oskrivna: etiketterade annonser utan LARDOM-rad — punkt 5; uppgraderingen ersätter etiketten', () => {
  const logg = [ETIK(), ETIK({ annons_id: '222', annons_namn: 'IBC_SP_2_1', etikett: 'LOSER', bedombar: false, spend_ad: 40 }), { kod: 'LARDOM', annons_id: '222', lardom_id: 'L-222', datum: '2026-09-21', kampanj_id: 'K1' }];
  const o = oskrivna(logg);
  assert.deepEqual(o.map((e) => e.annons_id), ['111']);
  assert.equal(oskrivna(logg, { baraBedombara: true }).length, 1);
  assert.equal(oskrivna(logg, { kampanjId: 'K2' }).length, 0);
  const upp = [...logg, ETIK({ kod: 'ETIKETT_UPPGRADERAD', datum: '2026-09-28', annons_id: '222', etikett: 'BREAKTHROUGH' })];
  assert.equal(oskrivna(upp).length, 1, 'uppgraderad rad byter inte på lärdomskravet — samma annons, en lärdom');
});

test('skelett: datan ifylld ur etikettraden + briefens taggar, luckorna märkta, CVR okänd när klick saknas', () => {
  const s = skelett(ETIK(), { brief: BRIEF, briefFil: 'products/ibc-tankoverdraget/batch-01/video-ads-briefs/IBC_PD_1_H1/brief.md' });
  assert.match(s, /^### Lärdom L-111 — IBC_PD_1_H1 \(BREAKTHROUGH, etikett 2026-09-21\)/);
  assert.match(s, /\| Spend annons \/ kampanj \| 7 739 kr \/ 8 900 kr \(87 %\) \|/);
  assert.match(s, /\| ROAS \/ CPA \| 3,07 \/ 204 kr/);
  assert.match(s, /\| Konverteringsgrad \| okänd — hämta inline_link_clicks/);
  assert.match(s, /\| Hook rate \/ hold rate \| 31 % \/ 9 % \|/);
  assert.match(s, /- Bild\/text: "Solljus in i tanken\. Alger i vattnet\."/);
  assert.match(s, /\| Medvetandenivå \| problem \| \[FYLL I/);
  assert.match(s, /\| Positionering \| — \(taggen saknas i briefen\) \|/);
  assert.match(s, /\*\*Hypotes \(gissning\):\*\* \[FYLL I/);
  assert.match(s, /\*\*Nästa annonser:\*\*/);
  assert.match(s, /Diagnos:\*\* Breakthrough: tre iterationer inom 14 dagar/);
  const medCvr = skelett(ETIK({ cvr: 0.041, lpv: 920, backfill: true }), {});
  assert.match(medCvr, /\| Konverteringsgrad \| 4,1 % \(38 köp \/ 920 LPV\) \|/);
  const backfill = skelett(ETIK({ backfill: true }), {});
  assert.match(backfill, /okänd — backfillad före 2026-09-21/);
  assert.match(backfill, /brief saknas i repot/);
  const sw = skelett(ETIK({ etikett: 'SPEND_WINNER', roas_ad: 1.1 }), {});
  assert.match(sw, /läs FÖRST kommentarerna på annonsen/);
  assert.match(diagnos('LOSER'), /Iterera BARA om idén kom ur research/);
  assert.match(diagnos('KPI_WINNER'), /hook rate, sedan hold rate/);
});

test('validera: ett komplett block går igenom; varje saknat fält, ofylld lucka, omärkt hypotes och tom "nästa" stoppar', () => {
  const ok = validera(LARDOM_OK);
  assert.deepEqual(ok.fel, [], JSON.stringify(ok.fel));
  assert.equal(ok.lardom.lardom_id, 'L-111');
  assert.equal(ok.lardom.annons_id, '111');
  assert.equal(ok.lardom.utfall, 'BREAKTHROUGH');
  assert.equal(ok.lardom.utford, 'ja');
  assert.deepEqual(ok.lardom.avvikelser, ['brådska']);
  assert.equal(ok.lardom.nasta.length, 2);
  assert.ok(validera(LARDOM_OK.replace('| Konverteringsgrad | 4,1 % (38 köp / 920 LPV) |\n', '')).fel.some((f) => /Konverteringsgrad/.test(f)));
  assert.ok(validera(LARDOM_OK.replace('| tankägare med IBC i trädgården |', '| [FYLL I: ur den live annonsen] |')).fel.some((f) => /avatar.*utfört är tomt/.test(f)));
  assert.ok(validera(LARDOM_OK.replace('**Hypotes (gissning):**', '**Hypotes:**')).fel.some((f) => /märkt gissning/.test(f)));
  assert.ok(validera(LARDOM_OK.replace('det bär hooken, inte texten.', 'det bevisar att bilden bär.')).fel.some((f) => /skrivs som fakta/.test(f)));
  assert.ok(validera(LARDOM_OK.replace(/- `IBC_PD_1_H[23]`[^\n]*\n/g, '')).fel.some((f) => /"Nästa annonser" är tom/.test(f)));
  assert.ok(validera(LARDOM_OK.replace('- `IBC_PD_1_H3` — typ I, parent IBC_PD_1_H1: längre problemdel (5 s alger) innan skyddet', '- testa fler hookar')).fel.some((f) => /inget annonsnamn/.test(f)));
  assert.ok(validera(LARDOM_OK.replace('**Utförandet föll:** ja', '**Utförandet föll:** nej')).fel.some((f) => /komponenter avviker \(brådska\)/.test(f)));
  const slapp = validera(LARDOM_OK.replace(/- `IBC_PD_1_H2`[\s\S]*$/, '- `SLÄPP` — imiterad format-kopia utan research, 3 iterationer med lärdom slog inte originalet\n'));
  assert.deepEqual(slapp.fel, [], JSON.stringify(slapp.fel));
  assert.ok(validera(LARDOM_OK.replace(/- `IBC_PD_1_H2`[\s\S]*$/, '- SLÄPP\n')).fel.some((f) => /SLÄPP utan skäl/.test(f)));
  assert.ok(validera(LARDOM_OK.replace(/\| Tro \|[^\n]*\n/, '')).fel.some((f) => /komponentraden "tro" saknas/.test(f)));
  const block = delaBlock(`${LARDOM_OK}\n${LARDOM_OK.replace('L-111', 'L-112').replace('IBC_PD_1_H1 (', 'IBC_PD_1_H2 (')}`);
  assert.equal(block.length, 2);
  assert.equal(validera(block[1].text).lardom.lardom_id, 'L-112');
});

test('lardomRad: bär id, utfall, avvikelser, hypotes, nästa — aldrig ny_budget', () => {
  const v = validera(LARDOM_OK).lardom;
  const r = lardomRad(v, ETIK(), { idag: '2026-09-21', fil: 'products/ibc-tankoverdraget/lardomar.md' });
  assert.equal(r.kod, 'LARDOM');
  assert.equal(r.lardom_id, 'L-111');
  assert.equal(r.annons_id, '111');
  assert.deepEqual(r.komponent_avvikelser, ['brådska']);
  assert.equal(r.nasta.length, 2);
  assert.equal(r.ny_budget, undefined);
  assert.equal(r.genomford, true);
});

test('brieftak (punkt 8): briefer ≤ lärdomar skrivna sedan förra batchen; noll lärdomar ⇒ tak 0 med antalet som väntar', () => {
  const logg = [ETIK(), ETIK({ annons_id: '222', annons_namn: 'IBC_SP_2_1', etikett: 'LOSER' }), { kod: 'CS_BATCH_KLAR', kampanj_id: 'K1', datum: '2026-09-17', genomford: true }];
  assert.deepEqual(brieftak(logg, 'K1', { idag: '2026-09-21' }), { tak: 0, lardomar: [], sedan: '2026-09-17', etiketterade_utan_lardom: 2 });
  const med = [...logg, { kod: 'LARDOM', kampanj_id: 'K1', annons_id: '111', lardom_id: 'L-111', datum: '2026-09-21', genomford: true }, { kod: 'LARDOM', kampanj_id: 'K1', annons_id: '999', lardom_id: 'L-999', datum: '2026-09-10', genomford: true }];
  const t = brieftak(med, 'K1', { idag: '2026-09-21' });
  assert.equal(t.tak, 1, 'lärdomen från före batchen räknas inte');
  assert.deepEqual(t.lardomar, ['L-111']);
  assert.equal(t.etiketterade_utan_lardom, 1);
});

test('mix (punkt 7) och levande breakthroughs: 80/20 vidarebyggen med levande breakthrough, annars 80 nya; pausad tjuv och gammal etikett räknas inte', () => {
  const idag = '2026-09-21';
  assert.deepEqual(mix([ETIK({ etikett: 'SPEND_WINNER' })], 'K1', { idag }), { ...MIX.utanVinnare, skal: 'ingen levande breakthrough', breakthroughs: [] });
  const m = mix([ETIK()], 'K1', { idag });
  assert.equal(m.vidarebyggen, 0.8);
  assert.equal(m.nya, 0.2);
  assert.match(m.skal, /IBC_PD_1_H1/);
  assert.equal(levandeBreakthroughs([ETIK({ datum: '2026-08-01' })], 'K1', { idag }).length, 0, 'äldre än 28 dagar');
  assert.equal(levandeBreakthroughs([ETIK(), { kod: 'TJUV_PAUSAD', annons_id: '111', genomford: true, kampanj_id: 'K1', datum: '2026-09-22' }], 'K1', { idag }).length, 0, 'pausad tjuv');
});

test('vidarebyggBehov (punkt 9): tre iterationer inom 14 dagar, räknade ur BRIEF-rader med parent', () => {
  const idag = '2026-09-25';
  const logg = [ETIK({ datum: '2026-09-21' }), { kod: 'BRIEF', kampanj_id: 'K1', annons_namn: 'IBC_PD_1_H2', parent: 'IBC_PD_1_H1', koncept: 'PD alger', typ: 'I', datum: '2026-09-22' }];
  const v = vidarebyggBehov(logg, 'K1', { idag });
  assert.equal(v.length, 1);
  assert.equal(v[0].iterationer, 1);
  assert.equal(v[0].kvar, 2);
  assert.equal(v[0].deadline, '2026-10-05');
  assert.equal(v[0].forsent, false);
  assert.equal(v[0].har_lardom, false);
  const tre = [...logg, ...[3, 4].map((n) => ({ kod: 'BRIEF', kampanj_id: 'K1', annons_namn: `IBC_PD_1_H${n}`, parent: 'IBC_PD_1_H1', koncept: 'PD alger', typ: 'I', datum: '2026-09-23' }))];
  assert.equal(vidarebyggBehov(tre, 'K1', { idag }).length, 0, 'tre iterationer ⇒ inget behov');
  assert.equal(vidarebyggBehov(logg, 'K1', { idag: '2026-10-08' })[0].forsent, true);
});

test('nastaIteration + konceptStatus (punkt 14, 18): numret räknas ur loggen; taket släpper svag forskning, låter stark fortsätta', () => {
  const brief = (n, over = {}) => ({ kod: 'BRIEF', kampanj_id: 'K1', annons_namn: `IBC_PD_1_H${n}`, koncept: 'PD alger', typ: n === 1 ? 'N' : 'I', parent: n === 1 ? null : 'IBC_PD_1_H1', datum: '2026-09-2' + n, kalla: n === 1 ? 'voc' : null, ...over });
  const etik = (id, namn, over = {}) => ETIK({ annons_id: id, annons_namn: namn, etikett: 'LOSER', roas_ad: 1.0, andel: 0.05, ...over });
  const logg = [brief(1), brief(2), brief(3), brief(4), etik('111', 'IBC_PD_1_H1', { etikett: 'SPEND_WINNER', roas_ad: 2.0, andel: 0.4 }), etik('112', 'IBC_PD_1_H2'), etik('113', 'IBC_PD_1_H3'), etik('114', 'IBC_PD_1_H4'),
    ...['112', '113', '114'].map((id) => ({ kod: 'LARDOM', annons_id: id, lardom_id: `L-${id}`, kampanj_id: 'K1', datum: '2026-09-30' }))];
  assert.equal(nastaIteration(logg, 'K1', 'PD alger'), 5);
  assert.equal(nastaIteration(logg, 'K1', 'nytt'), 1);
  const s = konceptStatus(logg, 'K1', 'PD alger');
  assert.equal(s.iterationer, 3);
  assert.equal(s.med_lardom, 3);
  assert.equal(s.slar_original, false);
  assert.equal(s.forskning, 'stark');
  assert.match(s.rekommendation, /fler försök tillåtna \(stark forskning: voc\) — iteration 4/);
  const svag = konceptStatus(logg.map((r) => (r.kod === 'BRIEF' && r.typ === 'N' ? { ...r, typ: 'IM', kalla: 'axel' } : r)), 'K1', 'PD alger');
  assert.match(svag.rekommendation, /^SLÄPP — 3 iterationer med lärdom/);
  const utanLardom = konceptStatus(logg.filter((r) => r.kod !== 'LARDOM'), 'K1', 'PD alger');
  assert.match(utanLardom.rekommendation, /skriv lärdomarna först \(0 av 3/);
  const slar = konceptStatus([...logg.filter((r) => r.annons_id !== '114'), etik('114', 'IBC_PD_1_H4', { etikett: 'BREAKTHROUGH' })], 'K1', 'PD alger');
  assert.equal(slar.slar_original, true);
  assert.match(konceptStatus([brief(1), brief(2)], 'K1', 'PD alger').rekommendation, /^iterera \(1 av 3/);
  assert.ok(RESEARCH_KALLOR.includes('voc'));
});

test('briefRad (punkt 6, 13, 14, 19): lärdomen måste finnas, taggarna måste finnas, iterationsnumret räknas, ny vinkel utan nytt löfte varnas', () => {
  const kampanj = { id: 'K1', namn: 'IBC', ad_account_id: '1867947880635861' };
  const logg = [ETIK(), { kod: 'LARDOM', annons_id: '111', lardom_id: 'L-111', kampanj_id: 'K1', datum: '2026-09-21' }, { kod: 'BRIEF', kampanj_id: 'K1', annons_namn: 'IBC_PD_1_H1', koncept: 'PD alger', typ: 'N', avatar: 'tankagaren', begar: 'skydda-det-jag-ager', mekanism: 'visa algerna, sedan skyddet', datum: '2026-09-01' }];
  const text = (taggar) => `# IBC_PD_1_H2 — x\n\n**VARIABELTAGGAR:** ${taggar}\n`;
  const bra = briefRad({ namn: 'IBC_PD_1_H2', typ: 'video', text: text('typ=`I` · parent=`IBC_PD_1_H1` · koncept=`PD alger` · avatar=`tankagaren` · awareness=`problem` · begar=`skydda-det-jag-ager` · mekanism=`x` · tro=`y` · urgency=`sasong` · hook-mekanik=`freeze` · lardom=`L-111` · kalla=`parent`') }, { logg, kampanj, idag: '2026-09-22', batch: 8 });
  assert.deepEqual(bra.fel, [], JSON.stringify(bra.fel));
  assert.equal(bra.rad.kod, 'BRIEF');
  assert.equal(bra.rad.iteration_nr, 2);
  assert.equal(bra.rad.lardom, 'L-111');
  assert.equal(bra.rad.batch, 8);
  assert.equal(bra.rad.ny_budget, undefined);
  const utanLardom = briefRad({ namn: 'IBC_PD_1_H2', typ: 'video', text: text('typ=`I` · parent=`IBC_PD_1_H1` · koncept=`PD alger` · avatar=`a` · awareness=`problem` · begar=`b` · mekanism=`x` · tro=`y` · urgency=`sasong` · hook-mekanik=`freeze`') }, { logg, kampanj, idag: '2026-09-22' });
  assert.ok(utanLardom.fel.some((f) => /taggen lardom= saknas/.test(f)));
  const felId = briefRad({ namn: 'IBC_PD_1_H2', typ: 'video', text: text('typ=`I` · parent=`IBC_PD_1_H1` · koncept=`PD alger` · avatar=`a` · awareness=`problem` · begar=`b` · mekanism=`x` · tro=`y` · urgency=`sasong` · hook-mekanik=`freeze` · lardom=`L-999`') }, { logg, kampanj, idag: '2026-09-22' });
  assert.ok(felId.fel.some((f) => /lardom=L-999 finns inte i loggen/.test(f)));
  const nyUtanNyttLofte = briefRad({ namn: 'IBC_PD_9_H1', typ: 'video', text: text('typ=`N` · koncept=`PD alger 2` · avatar=`tankagaren` · awareness=`problem` · begar=`skydda-det-jag-ager` · mekanism=`visa algerna, sedan skyddet` · tro=`y` · urgency=`sasong` · hook-mekanik=`freeze` · lardom=`L-111`') }, { logg, kampanj, idag: '2026-09-22' });
  assert.deepEqual(nyUtanNyttLofte.fel, []);
  assert.ok(nyUtanNyttLofte.varningar.some((w) => /samma löfte med nya ord är en iteration/.test(w)));
  const nyMedParent = briefRad({ namn: 'IBC_PD_9_H1', typ: 'video', text: text('typ=`N` · parent=`IBC_PD_1_H1` · koncept=`x` · avatar=`a` · awareness=`problem` · begar=`b` · mekanism=`m` · tro=`y` · urgency=`sasong` · hook-mekanik=`freeze` · lardom=`L-111`') }, { logg, kampanj, idag: '2026-09-22' });
  assert.ok(nyMedParent.fel.some((f) => /typ=N med parent/.test(f)));
  const iterUtanParent = briefRad({ namn: 'IBC_PD_1_H3', typ: 'video', text: text('typ=`I` · koncept=`PD alger` · avatar=`a` · awareness=`problem` · begar=`b` · mekanism=`m` · tro=`y` · urgency=`sasong` · hook-mekanik=`freeze` · lardom=`L-111`') }, { logg, kampanj, idag: '2026-09-22' });
  assert.ok(iterUtanParent.fel.some((f) => /typ=I utan parent/.test(f)));
  const felIter = briefRad({ namn: 'IBC_PD_1_H3', typ: 'video', text: text('typ=`I` · parent=`IBC_PD_1_H1` · koncept=`PD alger` · iteration=`7` · avatar=`a` · awareness=`problem` · begar=`b` · mekanism=`m` · tro=`y` · urgency=`sasong` · hook-mekanik=`freeze` · lardom=`L-111`') }, { logg, kampanj, idag: '2026-09-22' });
  assert.ok(felIter.varningar.some((w) => /iteration=7, loggen räknar 2/.test(w)));
});

test('status + formateraStatus (punkt 15, 16): lärdomar i dag, briefer på lärdom, utan lärdom per kampanj, frekvensen som bråk', () => {
  const idag = '2026-09-21';
  const logg = [ETIK(), ETIK({ annons_id: '222', annons_namn: 'IBC_SP_2_1', etikett: 'LOSER', bedombar: false }),
    { kod: 'LARDOM', annons_id: '111', lardom_id: 'L-111', kampanj_id: 'K1', datum: idag },
    { kod: 'BRIEF', kampanj_id: 'K1', annons_namn: 'IBC_PD_1_H2', koncept: 'PD alger', typ: 'I', parent: 'IBC_PD_1_H1', lardom: 'L-111', datum: idag },
    { kod: 'BRIEF', kampanj_id: 'K1', annons_namn: 'IBC_PD_1_H3', koncept: 'PD alger', typ: 'I', parent: 'IBC_PD_1_H1', lardom: null, datum: idag }];
  const s = status(logg, { idag });
  assert.equal(s.lardomar_idag, 1);
  assert.equal(s.briefer_idag, 2);
  assert.equal(s.briefer_pa_lardom, 1);
  assert.equal(s.etiketterade_utan_lardom, 1);
  assert.equal(s.brieftak.K1.tak, 1);
  assert.equal(s.mix.K1.vidarebyggen, 0.8);
  assert.equal(s.vidarebygg[0].kvar, 1);
  const text = formateraStatus(s);
  assert.match(text, /Lärdomar skrivna i dag: 1\. Etiketterade annonser utan lärdom: 1 \(varav bedömbara 0\)/);
  assert.match(text, /Briefer i dag: 2, varav på en lärdom: 1 ⚠ briefer utan lärdom får inte skrivas/);
  assert.match(text, /IBC-Tanköverdraget: 1\/2/);
  assert.match(text, /IBC_PD_1_H1: 2 av 3 iterationer, 1 kvar/);
});
