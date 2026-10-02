// kallor.test.mjs — båda etikettloggarna i EN form. Utan git och utan nät:
// läsarna injiceras och raderna kommer ur fixturerna (riktiga rader, kopierade
// 2026-10-02 ur matstrumpor/logg.jsonl och agent-grenens budgetlogg.jsonl).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, existsSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  veckansDatum, veckaFor, plusDagar, verksamhetFor, lasVarumarken, arBedombar, grindUr,
  normaliseraMatstrumpor, normaliseraAgent, annonsnyckel, tolkaJsonl, saknadeFalt,
  hamtaAgentlogg, lasKallor, lasEtiketter, gallande, veckansRader, sammanstall, korCli,
} from '../kallor.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const FIX = join(HAR, 'fixturer');
const MS_TEXT = readFileSync(join(FIX, 'matstrumpor-logg.jsonl'), 'utf8');
const AG_TEXT = readFileSync(join(FIX, 'agent-budgetlogg.jsonl'), 'utf8');
const VARUMARKEN = lasVarumarken();
const GRIND = { spend_sek: 300, kop: 3 };
const MS_KONFIG = { meta: { ad_account_id: '730973156224390', kampanj: { namn: 'MATSTRUMP_SALES_20260826' } } };
const KONFIG = { gren_agent: 'claude/daily-agent-discussion-uos5df', grind: GRIND };

/** Läsare utan I/O: fixturerna i stället för loggarna, ingen git, inga unga. */
function fixturLasare({ unga = () => ({ rader: [], orsak: 'ingen dom-fil i testet' }), agent } = {}) {
  return {
    matstrumpor: () => MS_TEXT,
    matstrumporKonfig: () => MS_KONFIG,
    agent: agent ?? (() => ({ text: AG_TEXT, fran: 'fixtur', ms: 0, fil: null })),
    varumarken: () => VARUMARKEN,
    unga,
  };
}
const msRad = (f) => tolkaJsonl(MS_TEXT).rader.find(f);
const agRad = (f) => tolkaJsonl(AG_TEXT).rader.find(f);

// ─── datum ────────────────────────────────────────────────────────────────

test('veckansDatum: ISO-veckan är måndag till söndag, vecka 1 bär 4 januari', () => {
  assert.deepEqual(veckansDatum('2026-W39'), { vecka: '2026-W39', fran: '2026-09-21', till: '2026-09-27' });
  assert.deepEqual(veckansDatum('2026-W40'), { vecka: '2026-W40', fran: '2026-09-28', till: '2026-10-04' });
  assert.deepEqual(veckansDatum('2026-W01'), { vecka: '2026-W01', fran: '2025-12-29', till: '2026-01-04' });
  assert.throws(() => veckansDatum('W39'), /2026-W39/);
  // 2026 har 53 ISO-veckor (1 januari är en torsdag), 2027 har 52
  assert.deepEqual(veckansDatum('2026-W53'), { vecka: '2026-W53', fran: '2026-12-28', till: '2027-01-03' });
  assert.throws(() => veckansDatum('2027-W53'), /finns inte/);
});

test('veckaFor och plusDagar', () => {
  assert.equal(veckaFor('2026-09-27'), '2026-W39');
  assert.equal(veckaFor('2026-09-28'), '2026-W40');
  assert.equal(veckaFor('2026-09-23T05:14:24.216Z'), '2026-W39');
  assert.equal(veckaFor('trasigt'), null);
  assert.equal(plusDagar('2026-09-21', 6), '2026-09-27');
  assert.equal(plusDagar('2026-09-21', -7), '2026-09-14');
});

// ─── verksamheten ur kontot ───────────────────────────────────────────────

test('verksamhetFor: hela konton, delade konton på kampanjprefix, okänt konto ⇒ null', () => {
  assert.equal(verksamhetFor('730973156224390', null, VARUMARKEN), 'matstrumpor');
  assert.equal(verksamhetFor('act_1867947880635861', 'IBC-Tanköverdraget | BE ROAS 1.51', VARUMARKEN), 'baverbutiken');
  assert.equal(verksamhetFor('1050941584152547', 'Stigestøtte NO', VARUMARKEN), 'baverbutiken');
  // OPS-kontot: CaraShell på prefixet, allt annat övriga OPS
  assert.equal(verksamhetFor('915422744950975', 'CARASHELL_SE_Taköverdraget', VARUMARKEN), 'carashell');
  assert.equal(verksamhetFor('915422744950975', 'HEIMGUARD_SE_Övervakningskamera', VARUMARKEN), 'ops');
  // Magiborsten UK: CaraShells US-kampanjer heter "1 CARASHELL_US_…" och "AU Taköverdrag CARASHELL" (ordet, inte början)
  assert.equal(verksamhetFor('1107817401910319', '1 CARASHELL_US_Taköverdrag Husvagn & Husbil 6,5 × 3 m', VARUMARKEN), 'carashell');
  assert.equal(verksamhetFor('1107817401910319', 'AU LISTICLE Taköverdrag CARASHELL', VARUMARKEN), 'carashell');
  assert.equal(verksamhetFor('1107817401910319', 'Axelbälte UK | BE ROAS 1.72', VARUMARKEN), 'baverbutiken');
  assert.equal(verksamhetFor('999', 'Något', VARUMARKEN), null);
});

// ─── grinden ──────────────────────────────────────────────────────────────

test('arBedombar är OCH: 300 kr och 3 köp, båda krävs', () => {
  assert.equal(arBedombar(300, 3, GRIND), true);
  assert.equal(arBedombar(299.99, 3, GRIND), false);
  assert.equal(arBedombar(5000, 2, GRIND), false);
  assert.equal(arBedombar(null, 9, GRIND), false);
  assert.deepEqual(grindUr({}), { spend_sek: 300, kop: 3 });
  assert.deepEqual(grindUr({ grind: { spend_sek: 500, kop: 2 } }), { spend_sek: 500, kop: 2 });
});

// ─── Matstrumpor-raden ────────────────────────────────────────────────────

test('normaliseraMatstrumpor: en riktig SPEND_WINNER-rad får fönster, d0, konto, kampanj och verksamhet', () => {
  const rad = msRad((r) => r.etikett === 'SPEND_WINNER');
  const u = normaliseraMatstrumpor(rad, { konto: '730973156224390', kampanjnamn: 'MATSTRUMP_SALES_20260826', grind: GRIND, varumarken: VARUMARKEN });
  assert.equal(u.kalla, 'matstrumpor');
  assert.equal(u.verksamhet, 'matstrumpor');
  assert.equal(u.konto, '730973156224390');
  assert.equal(u.kampanj, 'MATSTRUMP_SALES_20260826');
  assert.equal(u.annons, 'MATSTRUMP_sushi_gift_ugc_haikuh3_v1');
  assert.equal(u.annons_id, null);
  assert.equal(u.etikett, 'SPEND_WINNER');
  assert.deepEqual([u.d0, u.fonster_start, u.fonster_slut, u.vecka], ['2026-08-27', '2026-08-27', '2026-09-02', 1]);
  assert.equal(u.spend_sek, 3680.71);
  assert.equal(u.kop, 9);
  assert.equal(u.andel, 0.429);
  assert.equal(u.bedombar, true);
  assert.equal(u.bedombar_rad, true);
  // Finns inte i Matstrumpors logg ⇒ null, aldrig gissat
  assert.equal(u.hook_rate, null);
  assert.equal(u.hold_rate, null);
  assert.equal(u.hook_till_hold, null);
  assert.equal(u.konv_lpv, null);
  assert.equal(u.utford_som_briefad, null);
  assert.equal(u.uppgradering_fran, null);
  assert.equal(u.skrivet, '2026-09-21T19:48:27.831Z');
});

test('normaliseraMatstrumpor: INGEN_LEVERANS saknar andel och roas (mätt: andel bara på de 45 som fick leverans)', () => {
  const il = normaliseraMatstrumpor(msRad((r) => r.etikett === 'INGEN_LEVERANS'), { konto: '730973156224390', grind: GRIND, varumarken: VARUMARKEN });
  assert.equal(il.bedombar, false);
  assert.equal(il.andel, null);
  assert.equal(il.roas, null);
  assert.equal(il.kampanj, null, 'inget kampanjnamn gavs ⇒ null');
  const loser = normaliseraMatstrumpor(msRad((r) => r.etikett === 'LOSER' && r.fonster === '2026-09-21..2026-09-27'), { konto: '730973156224390', grind: GRIND, varumarken: VARUMARKEN });
  assert.equal(loser.andel, 0, 'andel 0 är ett tal, inte saknat');
  assert.equal(loser.etikett, 'LOSER');
  assert.equal(loser.bedombar, false);
});

test('normaliseraMatstrumpor: raden räknas om med OCH även när loggen sa ELLER', () => {
  // Formen är loggens; talen valda för att skilja ELLER från OCH.
  const bas = msRad((r) => r.etikett === 'KPI_WINNER');
  const u = normaliseraMatstrumpor({ ...bas, spend_sek: 500, kop: 1, bedombar: true }, { konto: '730973156224390', grind: GRIND, varumarken: VARUMARKEN });
  assert.equal(u.bedombar_rad, true);
  assert.equal(u.bedombar, false);
});

test('normaliseraMatstrumpor: en vecka 2-rad i kor.mjs rad()-form får d0 sju dagar före fönstret och uppgradering_fran', () => {
  // Formen ur matstrumpor/kor.mjs etikettraderFor → rad(k, fran) (ingen sådan rad fanns i loggen 2026-10-02).
  const rad = { kod: 'ETIKETT', datum: '2026-10-05', annons: 'MATSTRUMP_sushi_jul_ugc_047h2_v1', marknad: 'SE', etikett: 'KPI_WINNER', vecka: 2, bedombar: true, andel: 0.12, tillvaxt: null, fonster: '2026-09-28..2026-10-04', spend_sek: 812.5, kop: 4, roas: 1.9, orsak: 'x', uppgradering_fran: 'LOSER' };
  const u = normaliseraMatstrumpor(rad, { konto: '730973156224390', kampanjnamn: 'MATSTRUMP_SALES_20260826', grind: GRIND, varumarken: VARUMARKEN });
  assert.deepEqual([u.d0, u.fonster_start, u.fonster_slut, u.vecka, u.uppgradering_fran], ['2026-09-21', '2026-09-28', '2026-10-04', 2, 'LOSER']);
  assert.equal(u.skrivet, '2026-10-05', 'utan skrivet-fält faller den på datum');
  const no = normaliseraMatstrumpor({ ...rad, marknad: 'NO' }, { konto: '730973156224390', kampanjnamn: 'MATSTRUMP_SALES_20260826', grind: GRIND, varumarken: VARUMARKEN });
  assert.equal(no.kampanj, null, 'en annan marknad har en annan kampanj som raden inte namnger');
});

// ─── agent-raden ──────────────────────────────────────────────────────────

test('normaliseraAgent: en riktig backfill-LOSER får konv_lpv, hook_till_hold och verksamhet ur kontot', () => {
  const u = normaliseraAgent(agRad((r) => r.annons_namn === 'Fiskespöhållare_PD_EXTRA'), { grind: GRIND, varumarken: VARUMARKEN });
  assert.equal(u.kalla, 'agent');
  assert.equal(u.verksamhet, 'baverbutiken');
  assert.equal(u.konto, '1867947880635861');
  assert.equal(u.kampanj, 'Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18');
  assert.equal(u.annons_id, '120249850564380291');
  assert.deepEqual([u.d0, u.fonster_start, u.fonster_slut, u.vecka], ['2026-08-18', '2026-08-18', '2026-08-24', 1]);
  assert.equal(u.spend_sek, 3687.39);
  assert.equal(u.kop, 21);
  assert.equal(u.roas, 2.383575);
  assert.equal(u.andel, 0.126);
  assert.equal(u.hook_rate, 0.3728);
  assert.equal(u.hold_rate, 0.0663);
  assert.equal(u.hook_till_hold, 0.1778);
  assert.equal(u.konv_lpv, 0.0361);
  assert.equal(u.bedombar, true);
  assert.equal(u.backfill, true);
  assert.equal(u.utford_som_briefad, 'okänd');
  assert.equal(u.skrivet, '2026-09-21', 'agent-loggen har ingen tidsstämpel — datumet gäller');
});

test('normaliseraAgent: INGEN_DATA utan spend är inte bedömbar, färsk rad är inte backfill, delade konton går rätt', () => {
  const id = normaliseraAgent(agRad((r) => r.etikett === 'INGEN_DATA'), { grind: GRIND, varumarken: VARUMARKEN });
  assert.equal(id.spend_sek, null);
  assert.equal(id.bedombar, false);
  assert.equal(id.konv_lpv, null);
  const bt = normaliseraAgent(agRad((r) => r.etikett === 'BREAKTHROUGH'), { grind: GRIND, varumarken: VARUMARKEN });
  assert.equal(bt.backfill, false);
  assert.equal(bt.bedombar, true);
  assert.equal(bt.hook_rate, null, 'hook_rate saknas på många Bäver-rader');
  const ops = normaliseraAgent(agRad((r) => r.ad_account_id === '915422744950975'), { grind: GRIND, varumarken: VARUMARKEN });
  assert.equal(ops.verksamhet, 'carashell');
  const us = normaliseraAgent(agRad((r) => /^1 CARASHELL_US/.test(r.kampanj_namn)), { grind: GRIND, varumarken: VARUMARKEN });
  assert.equal(us.verksamhet, 'carashell');
  const au = normaliseraAgent(agRad((r) => /^AU /.test(r.kampanj_namn)), { grind: GRIND, varumarken: VARUMARKEN });
  assert.equal(au.verksamhet, 'carashell');
  const no = normaliseraAgent(agRad((r) => r.ad_account_id === '1050941584152547'), { grind: GRIND, varumarken: VARUMARKEN });
  assert.equal(no.verksamhet, 'baverbutiken');
});

test('normaliseraAgent: en ETIKETT_UPPGRADERAD-rad bär uppgradering_fran ur den tidigare raden och ingen vecka', () => {
  const bas = agRad((r) => r.annons_namn === 'IBC_PD_9_1');
  const tidigare = normaliseraAgent(bas, { grind: GRIND, varumarken: VARUMARKEN });
  const u = normaliseraAgent({ ...bas, kod: 'ETIKETT_UPPGRADERAD', datum: '2026-09-29', etikett: 'BREAKTHROUGH' }, { grind: GRIND, varumarken: VARUMARKEN, tidigare });
  assert.equal(u.uppgradering_fran, 'KPI_WINNER');
  assert.equal(u.vecka, null, 'koden på grenen skriver ingen vecka på uppgraderingen');
  assert.equal(u.skrivet, '2026-09-29');
});

test('annonsnyckel: annons_id vinner, Matstrumpor utan id får konto + namn', () => {
  assert.equal(annonsnyckel({ konto: '1', annons: 'A', annons_id: '42' }), '1|id:42');
  assert.equal(annonsnyckel({ konto: '730973156224390', annons: 'MATSTRUMP_x', annons_id: null }), '730973156224390|MATSTRUMP_x');
});

test('tolkaJsonl och saknadeFalt', () => {
  const t = tolkaJsonl('{"a":1}\n\ntrasig\n{"a":null}\n');
  assert.equal(t.rader.length, 2);
  assert.equal(t.trasiga, 1);
  assert.deepEqual(saknadeFalt(t.rader, ['a', 'b']), { a: 1, b: 2 });
});

// ─── läsarna ──────────────────────────────────────────────────────────────

test('hamtaAgentlogg: fetch + show skriver cachen; misslyckad fetch tar cachen; utan cache fel', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'kallor-'));
  const cachefil = join(mapp, 'output', 'budgetlogg.jsonl');
  const anrop = [];
  const korOk = (cmd, args) => { anrop.push(args.join(' ')); return args[0] === 'show' ? AG_TEXT : ''; };
  const r1 = hamtaAgentlogg({ rot: mapp, gren: 'g', hamta: true, cachefil, kor: korOk });
  assert.equal(r1.fran, 'fetch');
  assert.equal(r1.text, AG_TEXT);
  assert.ok(existsSync(cachefil));
  assert.deepEqual(anrop, ['fetch --depth 1 origin g', 'show origin/g:agent/budgetlogg.jsonl']);
  assert.ok(!anrop.some((a) => /checkout|switch/.test(a)), 'grenen checkas aldrig ut');
  const korFel = () => { throw new Error('fatal: could not read from remote'); };
  const r2 = hamtaAgentlogg({ rot: mapp, gren: 'g', hamta: true, cachefil, kor: korFel });
  assert.equal(r2.fran, 'cache efter misslyckad fetch');
  assert.match(r2.orsak, /could not read/);
  assert.equal(r2.text, AG_TEXT);
  const r3 = hamtaAgentlogg({ rot: mapp, gren: 'g', hamta: false, cachefil, kor: korFel });
  assert.equal(r3.fran, 'cache');
  rmSync(mapp, { recursive: true, force: true });
  assert.throws(() => hamtaAgentlogg({ rot: mapp, gren: 'g', hamta: true, cachefil, kor: korFel }), /ingen cache/);
  assert.throws(() => hamtaAgentlogg({ rot: mapp, gren: 'g', hamta: false, cachefil, kor: korFel }), /--utan-fetch kräver cachen/);
});

test('lasKallor: båda källorna i en lista, bara etikettkoderna, utan git', () => {
  const k = lasKallor({ konfig: KONFIG, lasare: fixturLasare() });
  assert.equal(k.kallor.matstrumpor.rader, 6, 'UPPLADDAD-raden räknas inte');
  assert.equal(k.kallor.matstrumpor.rader_i_loggen, 7);
  assert.equal(k.kallor.agent.rader, 11, 'FOR_LITE_DATA-raden räknas inte');
  assert.equal(k.kallor.agent.fran, 'fixtur');
  assert.equal(k.kallor.agent.gren, 'claude/daily-agent-discussion-uos5df');
  assert.equal(k.kallor.agent.backfill, 8);
  assert.equal(k.rader.length, 17);
  assert.deepEqual(k.grind, GRIND);
  assert.equal(k.kallor.matstrumpor.saknas.hook_rate, 6, 'hook_rate finns inte i Matstrumpors logg');
  assert.equal(k.kallor.matstrumpor.saknas.vecka, 6);
  assert.equal(k.kallor.agent.saknas.vecka, 11, 'vecka finns inte i agent-loggen');
  assert.equal(k.kallor.agent.saknas.spend_ad, 1);
  assert.ok(k.rader.every((r) => r.verksamhet), 'alla fixturens konton står i varumarken.json');
  assert.deepEqual(k.varningar, []);
  assert.equal(k.unga.orsak, 'ingen dom-fil i testet');
  assert.equal(lasEtiketter({ konfig: KONFIG, lasare: fixturLasare() }).length, 17);
});

test('lasKallor: okänt konto blir en varning och verksamhet null, trasiga rader räknas', () => {
  const lasare = fixturLasare({ agent: () => ({ text: `${AG_TEXT}\n{"kod":"ETIKETT","datum":"2026-09-30","ad_account_id":"555","annons_id":"1","annons_namn":"X","d0":"2026-09-20","d6":"2026-09-26","spend_ad":10,"kop":0,"etikett":"LOSER"}\ntrasig\n`, fran: 'fixtur', ms: 0 }) });
  const k = lasKallor({ konfig: KONFIG, lasare });
  const x = k.rader.find((r) => r.annons === 'X');
  assert.equal(x.verksamhet, null);
  assert.equal(x.konv_lpv, null);
  assert.ok(k.varningar.some((v) => /555/.test(v)));
  assert.ok(k.varningar.some((v) => /1 rader gick inte att tolka/.test(v)));
});

test('lasKallor utan gren och utan konfig stoppar', () => {
  assert.throws(() => lasKallor({ konfig: {}, lasare: fixturLasare() }), /gren_agent/);
});

// ─── urval ────────────────────────────────────────────────────────────────

test('gallande: högsta etiketten per annons, samma namn i två kampanjer hålls isär, INGEN_DATA faller bort', () => {
  const k = lasKallor({ konfig: KONFIG, lasare: fixturLasare() });
  const g = gallande(k.rader);
  const termo = [...g.values()].filter((r) => r.annons === 'Termoskydd_SP_2');
  assert.equal(termo.length, 2, 'Termoskydd_SP_2 ligger i två kampanjer i samma konto — två annonser');
  assert.ok(![...g.values()].some((r) => r.etikett === 'INGEN_DATA'));
  // En Matstrumpor-annons med vecka 1 LOSER och vecka 2 KPI_WINNER ⇒ KPI_WINNER gäller
  const bas = k.rader.find((r) => r.kalla === 'matstrumpor' && r.etikett === 'LOSER');
  const g2 = gallande([bas, { ...bas, etikett: 'KPI_WINNER', vecka: 2, uppgradering_fran: 'LOSER' }]);
  assert.equal(g2.size, 1);
  assert.equal(g2.get(annonsnyckel(bas)).etikett, 'KPI_WINNER');
  assert.equal(g2.get(annonsnyckel(bas)).vecka, 2);
});

test('veckansRader: första veckan slut i veckan, uppgraderingar på skrivet, unga när källan finns', () => {
  const k = lasKallor({ konfig: KONFIG, lasare: fixturLasare() });
  const v = veckansRader(k.rader, { vecka: '2026-W39', unga: k.unga });
  assert.deepEqual([v.fran, v.till], ['2026-09-21', '2026-09-27']);
  const namn = v.forsta.map((r) => r.annons).sort();
  assert.deepEqual(namn, ['09-17 Nathalie captions musik', 'CaraShellRoof_PD_2_1', 'CaraShellRoof_US_CS_2_1', 'CaraShellRoof_US_SP_2_1', 'IBC_PD_9_1', 'MATSTRUMP_sushi_curiosity_product_038_v1', 'MATSTRUMP_sushi_jul_ugc_047h2_v1', 'Sofie H1 Sushi Captions Ingen musik', 'Takoverdrag_SP_4_H1', 'Termoskydd_SP_2']);
  assert.ok(!v.forsta.some((r) => r.annons === 'Fiskespöhållare_PD_EXTRA'), 'första veckan slutade i augusti');
  assert.equal(v.uppgraderingar.length, 0);
  assert.deepEqual(v.unga, [], 'källan fanns men var tom');
  assert.equal(v.unga_orsak, 'ingen dom-fil i testet');

  // En uppgradering skriven i veckan räknas, en skriven veckan efter inte
  const bas = k.rader.find((r) => r.annons === 'Fiskespöhållare_PD_EXTRA');
  const upp = { ...bas, etikett: 'KPI_WINNER', vecka: 2, uppgradering_fran: 'LOSER', skrivet: '2026-09-25' };
  const sen = { ...upp, skrivet: '2026-09-29T07:00:00.000Z' };
  const v2 = veckansRader([bas, upp, sen], { vecka: '2026-W39' });
  assert.equal(v2.forsta.length, 0);
  assert.deepEqual(v2.uppgraderingar.map((r) => r.skrivet), ['2026-09-25']);
  assert.equal(v2.unga, null);
  assert.equal(v2.unga_orsak, 'ingen källa för unga annonser gavs');

  // Unga: d0 inom veckan men fönstret inte komplett vid veckans slut
  const unga = { rader: [
    { verksamhet: 'matstrumpor', annons: 'U1', d0: '2026-09-25' },
    { verksamhet: 'matstrumpor', annons: 'U2', d0: '2026-09-21' },
    { verksamhet: 'matstrumpor', annons: 'U3', d0: '2026-09-28' },
    { verksamhet: 'matstrumpor', annons: 'U4', d0: null },
  ], orsak: null };
  const v3 = veckansRader([], { vecka: { fran: '2026-09-21', till: '2026-09-27' }, unga });
  assert.deepEqual(v3.unga.map((u) => u.annons), ['U1']);
  assert.equal(v3.vecka, '2026-W39');
  assert.throws(() => veckansRader([], { vecka: {} }), /kräver vecka/);
});

test('sammanstall: per verksamhet × etikett, bedömbara med OCH, INGEN_LEVERANS och unga', () => {
  const k = lasKallor({ konfig: KONFIG, lasare: fixturLasare() });
  const unga = { rader: [{ verksamhet: 'matstrumpor', annons: 'U1', d0: '2026-09-25' }], orsak: null };
  const per = sammanstall(veckansRader(k.rader, { vecka: '2026-W39', unga }));
  assert.deepEqual(Object.keys(per).sort(), ['baverbutiken', 'carashell', 'matstrumpor']);
  assert.equal(per.baverbutiken.rader, 3);
  assert.deepEqual(per.baverbutiken.etiketter, { BREAKTHROUGH: 1, KPI_WINNER: 1, LOSER: 1 });
  assert.equal(per.baverbutiken.bedombara, 1, 'Takoverdrag_SP_4_H1; IBC_PD_9_1 har 2 köp, Termoskydd_SP_2 14 kr');
  assert.equal(per.carashell.rader, 3);
  assert.equal(per.carashell.bedombara, 2);
  assert.equal(per.matstrumpor.rader, 4);
  assert.equal(per.matstrumpor.ingen_leverans, 0);
  assert.equal(per.matstrumpor.unga, 1);
  assert.equal(per.matstrumpor.bedombara, 1, 'BREAKTHROUGH-raden; de tre andra ligger under grinden');
});

// ─── CLI ──────────────────────────────────────────────────────────────────

test('korCli skriver sammanställningen utan git och stoppar utan --vecka', () => {
  const rader = [];
  const skriv = (s = '') => rader.push(String(s));
  assert.equal(korCli([], { skriv }), 2);
  assert.match(rader[0], /--vecka 2026-W39/);
  rader.length = 0;
  assert.equal(korCli(['--vecka', '2026-W39', '--utan-fetch'], { skriv, lasare: fixturLasare() }), 0);
  const text = rader.join('\n');
  assert.match(text, /Matstrumpor 6 ETIKETT-rader/);
  assert.match(text, /agent 11 ETIKETT-rader/);
  assert.match(text, /Vecka 2026-W39 \(2026-09-21\.\.2026-09-27\): 10 annonser/);
  assert.match(text, /baverbutiken\s+3 rader — KPI_WINNER 1 · BREAKTHROUGH 1 · LOSER 1 {2}\| bedömbara \(OCH\) 1 · INGEN_LEVERANS 0/);
  assert.match(text, /carashell\s+3 rader — SPEND_WINNER 2 · LOSER 1 {2}\| bedömbara \(OCH\) 2/);
  assert.match(text, /matstrumpor\s+4 rader — LOSER 2 · BREAKTHROUGH 1 · KPI_WINNER 1 {2}\| bedömbara \(OCH\) 1/);
  assert.match(text, /Unga \(fönstret inte komplett 2026-09-27\): 0 — ingen dom-fil i testet/);
  rader.length = 0;
  assert.equal(korCli(['--vecka', '2026-W40', '--json'], { skriv, lasare: fixturLasare() }), 0);
  const j = JSON.parse(rader.join('\n'));
  assert.equal(j.vecka, '2026-W40');
  assert.equal(j.kallor.agent.fran, 'fixtur');
  assert.deepEqual(j.grind, GRIND);
});

test('korCli: en dom-fil i matstrumpor/output ger unga ur for_unga (tempmapp, aldrig repots)', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'kallor-unga-'));
  const ut = join(mapp, 'matstrumpor', 'output');
  mkdirSync(ut, { recursive: true });
  writeFileSync(join(ut, 'dom-2026-09-26.json'), JSON.stringify({ datum: '2026-09-26', for_unga: [{ namn: 'MATSTRUMP_ung_1', d0: '2026-09-24', until: '2026-09-25', dagar: 2 }] }));
  writeFileSync(join(ut, 'dom-2026-09-26-NO.json'), JSON.stringify({ datum: '2026-09-26', for_unga: [{ namn: 'MATSTRUMP_NO_ung', d0: '2026-09-20', until: '2026-09-25', dagar: 6 }] }));
  const lasare = fixturLasare();
  delete lasare.unga; // standardläsaren för unga läser <rot>/matstrumpor/output
  const rader = [];
  const kod = korCli(['--vecka', '2026-W39', '--utan-fetch'], { skriv: (s = '') => rader.push(String(s)), rot: mapp, konfig: KONFIG, lasare });
  assert.equal(kod, 0);
  assert.match(rader.join('\n'), /Unga \(fönstret inte komplett 2026-09-27\): 1$/m, 'bara den vars fönster inte var komplett 27/9');
  rmSync(mapp, { recursive: true, force: true });
});
