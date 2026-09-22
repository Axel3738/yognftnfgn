// Funnelläget vid dagsbudget över 10 000 kr (Axels beslut 2026-09-22):
// invändningsmatrisen läses, tomma rutor går före lärdomar, täckningen står i
// rapporten och en obesvarad invändning över 25 % skrivs ut i höjningsdomen.
// Ren logik — inga filer utom Taköverdragets riktiga matris som fixtur.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { matrisUrText, tackning, tackningText, funnellage, rutorAttBygga, storstaObesvarade, matrisFull, cpaDiagnos, tackningRad, lasMatris, FUNNEL_BUDGET_SEK, BRIEF_ANDEL, VARNING_ANDEL } from '../invandningar.mjs';
import { provaMatris, provaBriefkvot, briefRad } from '../lardom.mjs';
import { besked } from '../besked.mjs';
import { annonsbehov, bedomKampanj, rapport } from '../rond.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TAK = readFileSync(join(ROT, 'products', 'takoverdraget-husvagn', 'invandningar.md'), 'utf8');
const matris = () => { const m = matrisUrText(TAK); return { fil: 'x', rader: m.rader, tackning: tackning(m.rader) }; };

test('kontraktet: Taköverdragets matris läses, fukt är obesvarad med 38 % och tre tomma rutor', () => {
  const m = matris();
  const fukt = m.tackning.find((t) => t.kort === 'fukt');
  assert.ok(fukt, 'raden fukt finns');
  assert.equal(fukt.andel, 0.38);
  assert.equal(fukt.live, 0);
  assert.equal(fukt.obesvarad, true);
  assert.ok(fukt.tomma.length >= 3);
  assert.match(tackningText(fukt), /^fukt 0 av 4 format/);
  assert.equal(lasMatris('products/takoverdraget-husvagn', { rot: ROT }).rader.length, m.rader.length);
  assert.equal(lasMatris('products/finns-inte', { rot: ROT }), null);
});

test('funnelläge: över 10 000 kr, aldrig på 10 000 eller under; rutorAttBygga kräver ≥ 10 % OCH en tom ruta; obesvarad ≥ 25 % för varningen', () => {
  assert.equal(FUNNEL_BUDGET_SEK, 10000);
  assert.equal(funnellage(16000), true);
  assert.equal(funnellage(10000), false);
  assert.equal(funnellage(null), false);
  const m = matris();
  const bygg = rutorAttBygga(m);
  assert.ok(bygg.length >= 1 && bygg[0].kort === 'fukt', 'fukt (38 %) först');
  assert.ok(bygg.every((t) => t.andel >= BRIEF_ANDEL && t.tomma.length > 0));
  assert.equal(storstaObesvarade(m).kort, 'fukt');
  assert.ok(VARNING_ANDEL === 0.25);
  // En rad med live-svar är inte obesvarad, hur stor andelen än är.
  const svarad = { tackning: [{ kort: 'fukt', andel: 0.5, live: 1, tomma: ['statisk'], obesvarad: false }] };
  assert.equal(storstaObesvarade(svarad), null);
  assert.equal(matrisFull(m), false);
  const full = { tackning: [{ kort: 'fukt', andel: 0.38, live: 4, tomma: [], obesvarad: false }, { kort: 'pris', andel: 0.03, live: 0, tomma: ['video'], obesvarad: true }] };
  assert.equal(matrisFull(full), true, 'raden under 10 % räknas inte');
  assert.equal(cpaDiagnos(m, { dagar: 3 }), 'bygg');
  assert.equal(cpaDiagnos(full, { dagar: 2 }), 'matt');
  assert.equal(cpaDiagnos(m, { dagar: 1 }), null);
  assert.equal(cpaDiagnos(null, { dagar: 3 }), null);
  assert.match(tackningRad(m), /fukt 0 av 4 format/);
});

test('provaMatris: en fylld ruta fylls aldrig igen, okänd rad stoppas, rutan ur namnet eller ruta=, samma ruta två gånger stoppas', () => {
  const m = matris();
  // Video-rutan för fukt är fylld (OB_4_H1 briefad) — stopp. Statisk är tom — ok.
  const r1 = provaMatris(m, [{ namn: 'Takoverdrag_OB_7_H1', invandning: 'fukt / kondens / självdrag' }]);
  assert.equal(r1.ok, false);
  assert.match(r1.fel[0], /redan fylld/);
  const r2 = provaMatris(m, [{ namn: 'Takoverdrag_OB_7_1', invandning: 'fukt / kondens / självdrag' }]);
  assert.equal(r2.ok, true, r2.fel.join(' '));
  assert.deepEqual(r2.byggda, [{ namn: 'Takoverdrag_OB_7_1', rad: 'fukt / kondens / självdrag', ruta: 'statisk' }]);
  const r3 = provaMatris(m, [{ namn: 'Takoverdrag_OB_7_H1', invandning: 'fukt', ruta: 'demo' }]);
  assert.equal(r3.ok, true, 'kortnamnet räcker som rad, ruta= vinner över namnet');
  assert.equal(r3.byggda[0].ruta, 'demo');
  const r4 = provaMatris(m, [{ namn: 'Takoverdrag_OB_8_H1', invandning: 'kaffe' }]);
  assert.match(r4.fel[0], /finns inte som rad/);
  const r5 = provaMatris(m, [{ namn: 'Takoverdrag_OB_7_1', invandning: 'fukt' }, { namn: 'Takoverdrag_OB_8_1', invandning: 'fukt' }]);
  assert.match(r5.fel[0], /tas redan av Takoverdrag_OB_7_1/);
  const r6 = provaMatris(null, [{ namn: 'X_OB_1_1', invandning: 'fukt' }]);
  assert.match(r6.fel[0], /ingen invändningsmatris/);
  assert.equal(provaMatris(null, [{ namn: 'X_PD_1_1' }]).ok, true, 'utan matris och utan invandning= händer inget');
});

test('provaMatris: tomma rutor före lärdomar — stopp i funnelläge, varning under, tyst när manifestet bygger en ruta', () => {
  const m = matris();
  const iteration = [{ namn: 'Takoverdrag_CS_2_H4', typ: 'I' }];
  const f = provaMatris(m, iteration, { funnellage: true });
  assert.equal(f.ok, false);
  assert.match(f.fel[0], /^FUNNELLÄGE/);
  assert.match(f.fel[0], /fukt 0 av 4 format/);
  const u = provaMatris(m, iteration, { funnellage: false });
  assert.equal(u.ok, true);
  assert.equal(u.varningar.length, 1);
  const med = provaMatris(m, [...iteration, { namn: 'Takoverdrag_OB_7_1', invandning: 'fukt' }], { funnellage: true });
  assert.equal(med.ok, true, med.fel.join(' '));
  assert.equal(med.varningar.length, 0);
  // Ett manifest med BARA matrisbriefer stoppas aldrig av regeln.
  assert.equal(provaMatris(m, [{ namn: 'Takoverdrag_OB_7_1', invandning: 'fukt' }], { funnellage: true }).ok, true);
});

test('provaBriefkvot: en brief på en tom ruta är fri mot brieftaket, precis som en namngiven plats', () => {
  const logg = [
    { kod: 'ETIKETT', kampanj_id: 'K1', annons_id: '1', annons_namn: 'Takoverdrag_SP_4_H1', etikett: 'SPEND_WINNER', datum: '2026-09-20', genomford: true },
    { kod: 'CS_BATCH_KLAR', kampanj_id: 'K1', datum: '2026-09-20', genomford: true },
  ];
  // Tak 0 (ingen lärdom sedan batchen) — en vanlig brief stoppas, en matrisbrief går.
  const utan = provaBriefkvot(logg, 'K1', [{ namn: 'Takoverdrag_CS_9_H1' }], { idag: '2026-09-22' });
  assert.equal(utan.ok, false);
  const med = provaBriefkvot(logg, 'K1', [{ namn: 'Takoverdrag_OB_7_1', invandning: 'fukt' }], { idag: '2026-09-22' });
  assert.equal(med.ok, true, med.fel.join(' '));
  assert.deepEqual(med.matris, ['Takoverdrag_OB_7_1']);
  assert.deepEqual(med.fria, []);
});

test('briefRad: invandning= ersätter lardom=, raden bär invandning och ruta, kalla≠voc varnas', () => {
  const brief = '# Takoverdrag_OB_7_1\n\nVARIABELTAGGAR: typ=N · koncept=invandning-fukt · kalla=voc · avatar=agare · awareness=solution · begar=skydda · mekanism=sidorna-oppna · tro=helovertrag-kapslar-in · urgency=sasong · hook-mekanik=freeze · invandning=fukt / kondens / självdrag · ruta=statisk\n';
  const r = briefRad({ namn: 'Takoverdrag_OB_7_1', typ: 'image', text: brief }, { logg: [], kampanj: { id: 'K1', namn: 'Tak' }, idag: '2026-09-22' });
  assert.equal(r.ok, true, r.fel.join(' '));
  assert.equal(r.rad.invandning, 'fukt / kondens / självdrag');
  assert.equal(r.rad.ruta, 'statisk');
  assert.equal(r.rad.lardom, null);
  const utanVoc = briefRad({ namn: 'Takoverdrag_OB_7_1', typ: 'image', text: brief.replace('kalla=voc', 'kalla=swipe') }, { logg: [], kampanj: { id: 'K1', namn: 'Tak' }, idag: '2026-09-22' });
  assert.ok(utanVoc.varningar.some((w) => /kalla=swipe/.test(w)));
  // Utan invandning= krävs lardom= som förut.
  const vanlig = briefRad({ namn: 'Takoverdrag_CS_9_H1', typ: 'video', text: brief.replace(/ · invandning=[^·]+ · ruta=statisk/, '') }, { logg: [], kampanj: { id: 'K1', namn: 'Tak' }, idag: '2026-09-22' });
  assert.ok(vanlig.fel.some((f) => /lardom= saknas/.test(f)));
});

test('besked: i funnelläge skrivs en obesvarad invändning över 25 % ut i SKALA-domen — höjningen sker ändå', () => {
  const bas = { namn: 'Tak | BE ROAS 1.52', lage: 'test', roas3d: 4.0, spend3d: 30000, kop3d: 60, spendTotal: 100000, roasTotal: 3.5, budget: 12000, dagarSedanAndring: 10, backDagarIRad: 0, dagarOverTarget: 3, harVinnare: true, klickandel: { andel: 0.9, klick: 54, visning: 6 }, cpaStiger: { stiger: false, dagar: 0, serie: [] } };
  const utan = besked(bas);
  assert.equal(utan.kod, 'SKALA');
  assert.doesNotMatch(utan.motivering, /Funnelläge/);
  const med = besked({ ...bas, obesvarad: { kort: 'fukt', andel: 0.38, av: 4, briefade: 1 } });
  assert.equal(med.kod, 'SKALA', 'varning, aldrig spärr');
  assert.equal(med.nyBudget, utan.nyBudget);
  assert.match(med.motivering, /⚠ Funnelläge: invändningen «fukt» \(38 % av kommentarerna\) saknar svar i alla 4 format \(1 briefad, ingen live\) — höjer ändå/);
  assert.deepEqual(med.obesvarad, { kort: 'fukt', andel: 0.38 });
});

test('bedomKampanj + rapport + annonsbehov: matrisen läses bara i funnelläge, täckningen står per produkt, rundan får rutorna före lärdomar', () => {
  const dygn = ['2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21'].map((d, i) => ({ datum: d, spend: 15000, roas: 3.5, kop: 40 - i, kop_visning: 2, cpa: 330 + i * 40 }));
  const kampanj = { id: 'K1', namn: 'Tak | BE ROAS 1.52', daily_budget: 16000, spend_3d: 45000, roas_3d: 3.5, kop_3d: 120, spend_total: 100000, roas_total: 3.5, dygn };
  const logg = [
    { kod: 'ETIKETT', kampanj_id: 'K1', annons_id: '1', annons_namn: 'Takoverdrag_SP_4_H1', etikett: 'SPEND_WINNER', datum: '2026-09-15', genomford: true },
    { kod: 'CS_BATCH_KLAR', kampanj_id: 'K1', datum: '2026-09-18', genomford: true },
  ];
  const karta = { K1: { campaign_id: 'K1', produkt: 'Tak', lage: 'test', minne: 'products/takoverdraget-husvagn' } };
  const matriser = { K1: matris() };
  const r = bedomKampanj(kampanj, { logg, idag: '2026-09-22', karta, fx: null, matriser });
  assert.equal(r.funnellage, true);
  assert.match(r.invandningar.rad, /fukt 0 av 4 format/);
  assert.ok(r.invandningar.bygg.includes('fukt'));
  assert.equal(r.invandningar.diagnos, 'bygg', 'CPA 330 → 370 → 410 → 450 stiger tre dygn + tomma rutor');
  assert.equal(r.dom.kod, 'CPA_STIGER', 'hälsomåttet stoppar höjningen — matrisen är en varning, inte en dom');
  // Under 10 000 kr läses matrisen inte alls.
  const liten = bedomKampanj({ ...kampanj, daily_budget: 4000 }, { logg, idag: '2026-09-22', karta, fx: null, matriser });
  assert.equal(liten.funnellage, false);
  assert.equal(liten.invandningar, null);
  // Funnelläge utan matris: saknas-flaggan, inte ett tyst null.
  const utanFil = bedomKampanj(kampanj, { logg, idag: '2026-09-22', karta, fx: null, matriser: {} });
  assert.deepEqual(utanFil.invandningar, { saknas: true });

  const text = rapport([r, liten], { idag: '2026-09-22', hamtad: 'nu', varningar: [] }, annonsbehov([r], { logg, idag: '2026-09-22' }));
  assert.match(text, /## 🧱 Invändningstäckning — funnelläge över 10.000 kr\/dag \(1\)/);
  assert.match(text, /⬜ \*\*Tak\*\* — fukt 0 av 4 format[^\n]*att bygga: fukt[^\n]*CPA stiger \+ tomma rutor ⇒ bygg rutorna/);
  assert.ok(text.indexOf('## 🩺 CPA-trend') < text.indexOf('## 🧱 Invändningstäckning'), 'CPA-trenden först, täckningen direkt efter');
  const utanFilText = rapport([utanFil], { idag: '2026-09-22', hamtad: 'nu', varningar: [] });
  assert.match(utanFilText, /⚠ \*\*Tak\*\* — matrisen saknas/);

  const behov = annonsbehov([r], { logg, idag: '2026-09-22' });
  const runda = behov.find((b) => b.typ === 'brief_runda');
  assert.ok(runda, 'fyra dagar sedan batchen ⇒ brief_runda');
  assert.equal(runda.funnellage, true);
  assert.ok(runda.rundaAntal >= 1, 'tak 0 (ingen lärdom sedan batchen) men rutorna är fria — rundan är minst antalet rutor');
  assert.match(runda.orsak, /FUNNELLÄGE: tomma rutor FÖRE lärdomar — fukt/);
  assert.match(runda.orsak, /CPA stiger \+ tomma rutor ⇒ bygg rutorna/);
});

test('ägarens kampanjer (Axels order 2026-09-22): listicle/lagerrensning får AGARENS — ingen höjning, ingen sänkning, ingen paus, inga briefer, ingen spendtjuv, och de står i rapporten', async () => {
  const { surfBesked } = await import('../besked.mjs');
  const { raknaGron } = await import('../spendtjuv.mjs');
  const { arListiclekampanj } = await import('../kampanjval.mjs');
  for (const n of ['Taköverdraget LISTICLE LAGERRENSNING', 'Motorhöljet Lagerrensingsrea', 'X vi-testade', 'Y ANLEDNINGAR']) assert.ok(arListiclekampanj(n), n);
  assert.ok(!arListiclekampanj('Taköverdraget för Husvagn 6,5 × 3 m | BE ROAS 1.63'));
  const bas = { lage: 'test', spend3d: 6000, kop3d: 30, spendTotal: 6500, roasTotal: 3.2, budget: 2000, dagarSedanAndring: 10, backDagarIRad: 0, dagarOverTarget: 3, harVinnare: true, klickandel: { andel: 0.9, klick: 27, visning: 3 }, cpaStiger: { stiger: false, dagar: 0, serie: [] } };
  // Samma siffror som torrkörningen 22/9: ROAS 4,03 mot break-even 1,52 gav SKALA → 3 000.
  const skalar = besked({ ...bas, namn: 'Taköverdraget för Husvagn | BE ROAS 1.52', roas3d: 4.03, breakEven: 1.52 });
  assert.equal(skalar.kod, 'SKALA');
  const listicle = besked({ ...bas, namn: 'Taköverdraget LISTICLE LAGERRENSNING', roas3d: 4.03, breakEven: 1.52 });
  assert.equal(listicle.kod, 'AGARENS');
  assert.equal(listicle.nyBudget, null);
  assert.equal(listicle.kraverGodkannande, false);
  assert.match(listicle.motivering, /Axels order 2026-09-22/);
  // Går den back: fortfarande AGARENS — ingen trappa, ingen halvering.
  assert.equal(besked({ ...bas, namn: 'Termoskyddet LISTICLE LAGERRENSNING', roas3d: 0.8, breakEven: 1.51, spendTotal: 20000 }).kod, 'AGARENS');
  // Surf-läget också.
  assert.equal(surfBesked({ namn: 'Taköverdraget LISTICLE LAGERRENSNING', budget: 2000, spendIdag: 500, roasIdag: 5, kopIdag: 4, spendIgar: 2000, breakEven: 1.52, efterMidnatt: false }).kod, 'AGARENS');
  // Spendtjuven rör ingenting.
  const tjuv = raknaGron({ kampanj_namn: 'Taköverdraget LISTICLE LAGERRENSNING', break_even: 1.52, spend_3d: 6000, break_even_cpa: 740, annonser: [{ name: 'Takoverdrag_PD_1_1', spend: 3000, purchases: 0, roas: 0, status: 'ACTIVE' }] });
  assert.equal(tjuv.tjuvar.length, 0);
  assert.match(tjuv.motivering, /Ägarens kampanj/);
  // Rapporten skriver ut den, och inga briefer flaggas.
  const rad = { id: 'L', namn: 'Taköverdraget LISTICLE LAGERRENSNING', budget: 2000, roas3d: 4.03, dom: listicle, cpaTrend: null };
  const text = rapport([rad], { idag: '2026-09-22', hamtad: 'nu', varningar: [] }, annonsbehov([rad], { logg: [], idag: '2026-09-22' }));
  assert.match(text, /## 🛑 Ägarens kampanjer — rörs aldrig av motorn \(1\)/);
  assert.match(text, /\*\*Taköverdraget LISTICLE LAGERRENSNING\*\* — 2.000 kr\/dag · ROAS 3d 4,03 · break-even 1,52 · dom AGARENS/);
  assert.equal(annonsbehov([{ ...rad, spendTotal: 6500 }], { logg: [], idag: '2026-09-22' }).length, 0, 'inga briefer till ägarens kampanj');
});
