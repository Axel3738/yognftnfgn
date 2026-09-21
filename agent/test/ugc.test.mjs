// Ren logik i agent/ugc.mjs — UGC-förslaget (CS-KLART punkt 20–22). Inga filer, inget nät.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  deadlineFor, deadlines, formateraDeadlines, bevisadeVinnare, skalasOmFyraVeckor, saknasTro, kandidater, formateraKandidater,
  validateBestallning, bestallning, LEDTID_DAGAR, TESTTID_DAGAR, SASONGER, UGC_BESTALLD, UGC_FORSLAG,
} from '../ugc.mjs';

const ETIK = (over = {}) => ({
  datum: '2026-09-20', kampanj_id: 'K1', kampanj_namn: 'Taköverdraget | BE ROAS 1.63', ad_account_id: '1867947880635861', kod: 'ETIKETT',
  annons_id: '111', annons_namn: 'Takoverdrag_SP_2_1', etikett: 'SPEND_WINNER', bedombar: true, spend_ad: 4000, roas_ad: 1.4, andel: 0.42, hook_text: 'Ett av 16 omdömen', genomford: true, ...over,
});
const LARDOM = (over = {}) => ({ kod: 'LARDOM', kampanj_id: 'K1', annons_id: '111', lardom_id: 'L-111', datum: '2026-09-21', genomford: true, komponent_avvikelser: [], hypotes: 'kunden litar inte på att väven håller — ett riktigt ansikte som säger det skulle ge tillit', nasta: ['`Takoverdrag_SP_9_H1` — UGC'], ...over });

test('deadlineFor + deadlines (punkt 22): Black Friday 27 nov ⇒ sista beställning 23 okt, för sent efter 6 nov; larm 14 dagar före utan beställning', () => {
  assert.equal(LEDTID_DAGAR + TESTTID_DAGAR, 35);
  assert.deepEqual(deadlineFor('2026-11-27'), { sista_bestallning: '2026-10-23', for_sent_efter: '2026-11-06' });
  const bf = SASONGER.find((s) => s.namn === 'Black Friday 2026');
  assert.equal(bf.topp, '2026-11-27');
  const tidigt = deadlines([], { idag: '2026-09-21' }).find((s) => s.namn === 'Black Friday 2026');
  assert.equal(tidigt.dagar_kvar, 32);
  assert.equal(tidigt.larm, false);
  assert.match(tidigt.lage, /32 dagar kvar till sista beställningsdag 2026-10-23/);
  const inne = deadlines([], { idag: '2026-10-10' }).find((s) => s.namn === 'Black Friday 2026');
  assert.equal(inne.larm, true, '13 dagar kvar, inget beställt ⇒ larm');
  const bestalld = deadlines([{ kod: UGC_BESTALLD, datum: '2026-10-11', genomford: true, kampanj_id: 'K1' }], { idag: '2026-10-12' }).find((s) => s.namn === 'Black Friday 2026');
  assert.equal(bestalld.larm, false);
  assert.equal(bestalld.bestallda, 1);
  const passerad = deadlines([], { idag: '2026-10-30' }).find((s) => s.namn === 'Black Friday 2026');
  assert.equal(passerad.larm, true);
  assert.match(passerad.lage, /sista beställningsdagen passerad/);
  const forSent = deadlines([], { idag: '2026-11-07' }).find((s) => s.namn === 'Black Friday 2026');
  assert.equal(forSent.for_sent, true);
  assert.equal(forSent.larm, false, 'för sent = inget larm, bara besked');
  const text = formateraDeadlines(deadlines([], { idag: '2026-10-10' }));
  assert.match(text, /🔴 LARM: Black Friday 2026 \(2026-11-27\): 13 dagar kvar/);
  assert.match(text, /Jul 2026.*datumet är ett antagande/);
});

test('bevisadeVinnare (villkor 1): BREAKTHROUGH/SPEND_WINNER, bedömbar, inom 42 dagar, inte tjuvpausad', () => {
  const idag = '2026-09-21';
  assert.equal(bevisadeVinnare([ETIK()], 'K1', { idag }).length, 1);
  assert.equal(bevisadeVinnare([ETIK({ etikett: 'KPI_WINNER' })], 'K1', { idag }).length, 0);
  assert.equal(bevisadeVinnare([ETIK({ bedombar: false })], 'K1', { idag }).length, 0, 'hopp räknas inte');
  assert.equal(bevisadeVinnare([ETIK({ datum: '2026-07-01' })], 'K1', { idag }).length, 0);
  assert.equal(bevisadeVinnare([ETIK(), { kod: 'TJUV_PAUSAD', annons_id: '111', genomford: true, kampanj_id: 'K1', datum: '2026-09-21' }], 'K1', { idag }).length, 0);
});

test('skalasOmFyraVeckor (villkor 2) är en bedömning med skäl: avstängd/sänkt ⇒ nej; skalad eller lönsam ⇒ sannolikt; kort säsong ⇒ nej', () => {
  const idag = '2026-09-21';
  const rad = { id: 'K1', budget: 3000, dom: { vinstProcent: 35 } };
  const lonsam = skalasOmFyraVeckor([], 'K1', { idag, rad });
  assert.equal(lonsam.sannolikt, true);
  assert.match(lonsam.skal.join(';'), /35 % vinst på 3000 kr\/dag/);
  const skalad = skalasOmFyraVeckor([{ kampanj_id: 'K1', kod: 'SKALA', genomford: true, datum: '2026-09-15', ny_budget: 3000 }], 'K1', { idag, rad: null });
  assert.equal(skalad.sannolikt, true);
  assert.match(skalad.skal.join(';'), /skalad 1 gång/);
  assert.equal(skalasOmFyraVeckor([{ kampanj_id: 'K1', kod: 'STANG_AV', genomford: true, datum: '2026-09-15' }], 'K1', { idag, rad }).sannolikt, false);
  const sankt = skalasOmFyraVeckor([{ kampanj_id: 'K1', kod: 'SANK', genomford: true, datum: '2026-09-15', ny_budget: 2000 }], 'K1', { idag, rad });
  assert.equal(sankt.sannolikt, false);
  assert.match(sankt.skal.join(';'), /sänkt\/trappa senaste 14 dagarna \(SANK\)/);
  assert.equal(skalasOmFyraVeckor([], 'K1', { idag, rad: { id: 'K1', budget: 500, dom: { vinstProcent: 5 } } }).sannolikt, false);
  const sasong = skalasOmFyraVeckor([], 'K1', { idag, rad, karta: { sasong_slut: '2026-10-15' } });
  assert.equal(sasong.sannolikt, false);
  assert.match(sasong.skal.join(';'), /säsongen slutar 2026-10-15/);
});

test('saknasTro (villkor 3) läses ur lärdomen — utan lärdom okänd, aldrig gissad', () => {
  assert.equal(saknasTro([], '111').ja, null);
  assert.equal(saknasTro([LARDOM()], '111').ja, true);
  assert.match(saknasTro([LARDOM()], '111').skal, /lärdomen nämner/);
  assert.equal(saknasTro([LARDOM({ hypotes: 'hooken tappar efter tre sekunder', nasta: ['`X_PD_1_H2` — ny hook'], komponent_avvikelser: ['brådska'] })], '111').ja, false);
  assert.equal(saknasTro([LARDOM({ hypotes: 'bilden bär', komponent_avvikelser: ['tro'] })], '111').ja, true);
});

test('kandidater (punkt 20): förslag bara när alla tre villkor är sanna; tystas efter förslag och efter beställning', () => {
  const idag = '2026-09-21';
  const rader = [{ id: 'K1', budget: 3000, dom: { vinstProcent: 35 } }];
  const alla = kandidater([ETIK(), LARDOM()], { idag, rader });
  assert.equal(alla.length, 1);
  assert.equal(alla[0].forslag, true);
  assert.equal(kandidater([ETIK()], { idag, rader })[0].forslag, false, 'utan lärdom är villkor 3 okänt ⇒ inget förslag');
  assert.equal(kandidater([ETIK(), LARDOM()], { idag, rader: [{ id: 'K1', budget: 500, dom: { vinstProcent: 2 } }] })[0].forslag, false);
  const tyst = kandidater([ETIK(), LARDOM(), { kod: UGC_FORSLAG, kampanj_id: 'K1', datum: '2026-09-15', genomford: true }], { idag, rader });
  assert.equal(tyst[0].forslag, false);
  assert.match(tyst[0].tystat, /föreslagen 2026-09-15/);
  assert.equal(kandidater([ETIK(), LARDOM(), { kod: UGC_FORSLAG, kampanj_id: 'K1', datum: '2026-09-15', genomford: true }], { idag, rader, alla: true })[0].forslag, true);
  const bestalld = kandidater([ETIK(), LARDOM(), { kod: UGC_BESTALLD, kampanj_id: 'K1', datum: '2026-09-18', genomford: true }], { idag, rader });
  assert.match(bestalld[0].tystat, /redan beställd/);
  const text = formateraKandidater(alla, { idag });
  assert.match(text, /✅ FÖRESLÅ Taköverdraget — vinnare Takoverdrag_SP_2_1 \(SPEND_WINNER/);
  assert.match(text, /2 skalas om fyra veckor: sannolikt \(bedömning:/);
  assert.match(text, /3 saknas tro\/auktoritet\/tillit: ja/);
  assert.match(formateraKandidater([], { idag }), /ingen kampanj har en bevisad vinnare/);
});

test('bestallning (punkt 21): alla fält krävs, engelska, Evolve-receptet vid flera videor', () => {
  const b = {
    produkt: 'Taköverdraget', kampanj_id: 'K1', sasong: 'Black Friday 2026',
    vinnare: { namn: 'Takoverdrag_SP_2_1', etikett: 'SPEND_WINNER', spend: '4 000', roas: '1,4', hook: 'Ett av 16 omdömen – alla fem stjärnor' },
    komponenter: { avatar: 'caravan owner, 55+, storing over winter', vinkel: 'social proof', mekanism: 'a real owner shows the cover on a real caravan in rain', tro: 'the fabric keeps water off the roof all winter', urgency: 'season — first frost', awareness: 'product' },
    manus: [{ sv: 'Ett av 16 omdömen – alla fem stjärnor.', en: 'One of 16 reviews – all five stars.' }, { sv: 'Vattnet stannar på väven.', en: 'The water stays on the fabric.' }],
    pa_kameran: ['the cover being pulled over the roof', 'rain on the fabric, dry roof underneath', 'the creator\'s face while saying line 1'],
    deadline: '2026-10-12', antal: 3, iteration_andring: 'same script, hook replaced with "Regnet kom. Taket är torrt."', viral_referens: 'the "I bought this so you don\'t have to" format from @caravanlife (link in Notion)',
  };
  assert.deepEqual(validateBestallning(b), []);
  const text = bestallning(b, { idag: '2026-09-21' });
  assert.match(text, /^\*\*UGC order — Taköverdraget\*\* \(ordered 2026-09-21, deadline for the finished file: 2026-10-12 — needed for Black Friday 2026\)/);
  assert.match(text, /Build on our winning ad:\*\* Takoverdrag_SP_2_1 \(SPEND_WINNER, 4 000 SEK spend, ROAS 1,4\)/);
  assert.match(text, /- Belief the viewer must end up with: the fabric keeps water off the roof all winter/);
  assert.match(text, /\| 1 \| Ett av 16 omdömen – alla fem stjärnor\. \| One of 16 reviews – all five stars\. \|/);
  assert.match(text, /- rain on the fabric, dry roof underneath/);
  assert.match(text, /1\. Copy of the winner — the script above word for word\./);
  assert.match(text, /2\. Iteration on it — same script, hook replaced/);
  assert.match(text, /3\. Imitation of a viral ad — the "I bought this/);
  assert.match(text, /never name the store/);
  const fel = validateBestallning({ ...b, komponenter: { ...b.komponenter, tro: '' }, pa_kameran: [], antal: 2, iteration_andring: '' });
  assert.ok(fel.includes('komponenter.tro saknas'));
  assert.ok(fel.includes('fältet "pa_kameran" saknas'));
  assert.ok(fel.some((f) => /iteration_andring saknas/.test(f)));
  assert.throws(() => bestallning({ ...b, deadline: '' }, { idag: '2026-09-21' }), /inte komplett/);
});
