import test from 'node:test';
import assert from 'node:assert/strict';
import { byggPost, diagnos, klippRad, mattRad, valjAction, hogstaEtikett, kontrollera, procent, lasBank } from '../post.mjs';

const VECKA = { iso: '2026-W40', fran: '2026-09-28', till: '2026-10-04' };
const RED = { id: 'carl', fornamn: 'Carl' };
const TOPP = { annons: 'Takoverdrag_SP_1_H1', hook_rate: 0.47, hold_rate: 0.15 };

const rad = (over = {}) => ({
  annons: 'Takoverdrag_PD_6_H1', etikett: 'KPI_WINNER', vecka: 1, uppgradering_fran: null,
  andel: 0.08, hook_rate: 0.41, hold_rate: 0.12, bedombar: true, utford_som_briefad: true,
  spend_sek: 12345, kop: 7, roas: 2.31, topp: TOPP, ...over,
});

test('posten bär aldrig kronor, köp, ROAS eller ett annat namn', () => {
  const text = byggPost({ redigerare: RED, vecka: VECKA, annonser: [rad()], hitrate: { traff: 1, levererade: 7, alla: 9, iter: 0 }, action: valjAction('KPI_WINNER') });
  assert.ok(!text.includes('12345') && !text.includes('12 345'), 'spenden får inte läcka');
  assert.ok(!/\b7 purchases\b|\bköp\b|ROAS|SEK|\bkr\b/.test(text), text);
  assert.ok(!/[—–]/.test(text), 'inga tankstreck');
  assert.match(text, /Weekly ad report, week 40 \(Sep 28 to Oct 4\), for Carl/);
  assert.match(text, /Best first: Takoverdrag_PD_6_H1\. Label: KPI Winner \(week 1\)\./);
  assert.match(text, /Share of its campaign's budget in its first 7 days: 8 %\./);
  assert.match(text, /Hook rate 41 %, hold 12 %\. The campaign's top ad sits at 47 % \/ 15 %\./);
  assert.match(text, /Cut as briefed: yes/);
  assert.match(text, /One thing for this week: .+ Reply here by Thursday\./);
  assert.match(text, /Your hit rate, last 5 weeks: 1\/7/);
  assert.ok(!text.includes('%)') || !/1\/7 \(\d+ %\)/.test(text), 'procent först vid tio etiketter');
});

test('bästa först, en förlorare, resten som en rad, unga och ingen leverans', () => {
  const text = byggPost({
    redigerare: RED, vecka: VECKA,
    annonser: [
      rad({ annons: 'A_SP_1_H1', etikett: 'LOSER', andel: 0.03, hook_rate: 0.22 }),
      rad({ annons: 'A_SP_2_H1', etikett: 'SPEND_WINNER', andel: 0.35 }),
      rad({ annons: 'A_SP_3_H1', etikett: 'LOSER', andel: 0.01 }),
      rad({ annons: 'A_SP_4_H1', etikett: 'KPI_WINNER', andel: 0.05, uppgradering_fran: 'LOSER', vecka: 2 }),
      rad({ annons: 'A_SP_5_H1', etikett: 'INGEN_LEVERANS', andel: 0, bedombar: false }),
    ],
    unga: [{ annons: 'A_SP_6_H1', d0: '2026-10-01' }],
  });
  const iBasta = text.indexOf('Best first: A_SP_2_H1');
  const iForl = text.indexOf('One loser we can learn from: A_SP_1_H1');
  assert.ok(iBasta > 0 && iForl > iBasta, 'spend winnern först, sedan förloraren med störst andel');
  assert.match(text, /Also labelled this week: A_SP_4_H1 \(KPI Winner, up from Loser\); A_SP_3_H1 \(Loser\)\./);
  assert.match(text, /up from Loser/);
  assert.match(text, /Not finished yet: A_SP_6_H1 \(launched Thursday\)\. Label next Monday\./);
  assert.match(text, /No delivery: A_SP_5_H1\. Meta never showed it/);
  assert.match(text, /hook rate 22 % is under the 30 % line/);
});

test('förlusten är konceptets när klippet följde regin, klippet när det avvek', () => {
  assert.match(klippRad({ utford_som_briefad: true }), /learning about the concept, not about your cut/);
  assert.match(klippRad({ utford_som_briefad: false }), /tells us about the execution, not the concept/);
  assert.match(klippRad({ utford_som_briefad: null }), /not measured yet/);
  assert.equal(diagnos(rad({ utford_som_briefad: false, hook_rate: 0.1 })), null, 'klippraden säger det redan, ingen dubbel dom');
});

test('hook och hold visas bara när annonsen är bedömbar', () => {
  assert.match(mattRad(rad({ bedombar: false })), /too little data/);
  assert.equal(diagnos(rad({ bedombar: false, hook_rate: 0.05 })), null);
});

test('diagnosen följer ordningen spend → KPI → mjuka mått', () => {
  assert.match(diagnos(rad({ etikett: 'SPEND_WINNER' })), /belief, urgency or the landing page/);
  assert.equal(diagnos(rad({ etikett: 'BREAKTHROUGH' })), null);
  assert.match(diagnos(rad({ etikett: 'LOSER', hook_rate: 0.2 })), /first 3 seconds did not stop enough people/);
  assert.match(diagnos(rad({ etikett: 'LOSER', hook_rate: 0.45, hold_rate: 0.05 })), /hold 5 % is well under the campaign's top ad/);
  assert.match(diagnos(rad({ etikett: 'LOSER', hook_rate: 0.45, hold_rate: 0.14 })), /did not buy, which points at belief, urgency or the page/);
  assert.equal(diagnos(rad({ etikett: 'INGEN_LEVERANS' })), null);
});

test('action: ett item, första ogjorda, ur banken', () => {
  const bank = lasBank();
  for (const u of ['BREAKTHROUGH', 'SPEND_WINNER', 'KPI_WINNER', 'LOSER', 'INGEN_LEVERANS']) assert.ok(bank.per_utfall[u]?.length >= 3, u);
  const a0 = valjAction('LOSER', []);
  const a1 = valjAction('LOSER', [0]);
  assert.equal(a0.index, 0); assert.equal(a1.index, 1);
  assert.notEqual(a0.text_en, a1.text_en);
  assert.ok(!/[—–]/.test(a0.text_en));
  assert.equal(hogstaEtikett([rad({ etikett: 'LOSER' }), rad({ etikett: 'SPEND_WINNER' }), rad({ etikett: 'KPI_WINNER' })]), 'SPEND_WINNER');
});

test('spärren kastar på kronor, ROAS och tankstreck', () => {
  assert.throws(() => kontrollera('Spend: 1 200 SEK'), /förbjudet/);
  assert.throws(() => kontrollera('ROAS 2.1'), /förbjudet/);
  assert.throws(() => kontrollera('hook — hold'), /förbjudet/);
  assert.ok(kontrollera('Hook rate 41 %, hold 12 %.'));
  assert.equal(procent(0.4123), '41 %');
  assert.equal(procent(null), 'n/a');
});

test('ingen färdig etikett ger en ärlig rad, aldrig en tom post', () => {
  const text = byggPost({ redigerare: RED, vecka: VECKA, annonser: [], unga: [{ annons: 'X', d0: '2026-10-02' }] });
  assert.match(text, /No finished labels this week\. One ad launched and get/);
  const text2 = byggPost({ redigerare: RED, vecka: VECKA, annonser: [], unga: [] });
  assert.match(text2, /No ads of yours finished their first 7 days this week\./);
});
