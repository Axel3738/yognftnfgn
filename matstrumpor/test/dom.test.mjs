import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lasKonfig } from '../kor.mjs';
import { domAdset, domAdsets, forslagRader, adsetDomRader, nyaRader, summera, malFor, bastaAnnons, DOM } from '../dom.mjs';

const KONFIG = lasKonfig();
const CHAMP = KONFIG.meta.struktur.champions.id;
const BE = 1.498;
const IDAG = '2026-10-20';

const plus = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
/** n dagar från `fran`: varje dag `spend` kr, `kop` köp, ROAS `roas`. */
const serie = (fran, n, spend, kop, roas) => Array.from({ length: n }, (_, i) => ({ d: plus(fran, i), spend_sek: spend, kop, roas }));
/** Kampanjen: 10 000 kr/dag, ROAS `fore` före den 13:e och `under` därefter. */
const kampanj = (fore, under) => [...serie('2026-09-22', 21, 10000, 40, fore), ...serie('2026-10-13', 7, 10000, 40, under)];

const ctx = (extra = {}) => ({ kampanjserie: kampanj(2.0, 2.2), idag: IDAG, breakEven: BE, grindar: KONFIG.grindar, konfig: KONFIG, koVantar: null, annonser: [], ...extra });
const test322 = (extra = {}) => ({ id: '500', namn: 'MATSTRUMP_T070_gift_video', effective_status: 'ACTIVE', skapad: '2026-10-13', aktiva_annonser: 3, serie: [], ...extra });

test('summera: spendvägd ROAS, och en dag med spend men noll köp väger in som ROAS 0 — inte okänt', () => {
  const s = summera([{ d: '2026-10-01', spend_sek: 100, kop: 1, roas: 3 }, { d: '2026-10-02', spend_sek: 300, kop: 0, roas: null }], '2026-10-01', '2026-10-02');
  assert.deepEqual([s.spend_sek, s.kop, s.roas], [400, 1, 0.75]);
  assert.equal(summera([{ d: '2026-10-01', spend_sek: 50, kop: 0, roas: null }], '2026-10-01', '2026-10-01').roas, 0);
  assert.equal(summera([], '2026-10-01', '2026-10-07').roas, null);
});

test('Champions döms aldrig och får aldrig ett förslag', () => {
  const d = domAdset({ id: CHAMP, namn: '09-17 UGC', effective_status: 'ACTIVE', skapad: '2026-09-17', serie: serie('2026-09-22', 28, 9000, 40, 2.1) }, ctx());
  assert.equal(d.dom, DOM.CHAMPIONS);
  assert.equal(d.atgard, null);
});

test('ett pausat adset är ett beslut: AV, ingen dom, inget förslag', () => {
  assert.equal(domAdset(test322({ effective_status: 'PAUSED' }), ctx()).dom, DOM.AV);
});

test('dag 1–2 är för ungt; kursen ger ett test minst tre dagar', () => {
  const d = domAdset(test322({ skapad: '2026-10-18', serie: serie('2026-10-18', 2, 5000, 0, 0) }), ctx());
  assert.equal(d.dom, DOM.FOR_UNG);
  assert.equal(d.atgard, null);
});

test('dag 3–6: tog majoriteten av spenden, under KPI och kampanjen gick ner ⇒ stäng tidigt, med lärdom', () => {
  const ad = test322({ skapad: '2026-10-15', serie: serie('2026-10-15', 5, 6000, 2, 0.8) });
  const fallande = [...serie('2026-09-22', 23, 10000, 40, 2.0), ...serie('2026-10-15', 5, 10000, 20, 1.2)];
  const d = domAdset(ad, ctx({ kampanjserie: fallande }));
  assert.equal(d.dom, DOM.STANG_TIDIGT);
  assert.equal(d.atgard, 'STANG_ADSET');
  assert.equal(d.lardom, true);
  // Samma adset när kampanjen INTE gick ner: vänta till dag 7.
  assert.equal(domAdset(ad, ctx({ kampanjserie: [...serie('2026-09-22', 23, 10000, 40, 1.0), ...serie('2026-10-15', 5, 10000, 40, 1.4)] })).dom, DOM.FOR_UNG);
});

test('dag 7 och svultet (under 300 kr och 3 köp) ⇒ stäng — Metas dom, ingen dom över idén', () => {
  const d = domAdset(test322({ serie: serie('2026-10-13', 7, 10, 0, 0) }), ctx());
  assert.equal(d.dom, DOM.STANG);
  assert.equal(d.svalt, true);
  assert.match(d.motivering, /svält/);
});

test('majoriteten av spenden vid KPI och kampanjen förbättrades ⇒ VINNARE, flytta bästa annonsen till Champions', () => {
  const annonser = [
    { id: 'a1', namn: 'MATSTRUMP_sushi_gift_ugc_070_h1_v1', adset_id: '500', spend_sek: 9000, kop: 30, roas: 1.6 },
    { id: 'a2', namn: 'MATSTRUMP_sushi_gift_ugc_070_h2_v1', adset_id: '500', spend_sek: 20000, kop: 70, roas: 2.4 },
    { id: 'a3', namn: 'MATSTRUMP_sushi_gift_ugc_070_h3_v1', adset_id: '500', spend_sek: 30000, kop: 10, roas: 0.9 },
  ];
  const d = domAdset(test322({ serie: serie('2026-10-13', 7, 6000, 30, 2.4) }), ctx({ annonser }));
  assert.equal(d.dom, DOM.VINNARE);
  assert.equal(d.atgard, 'FLYTTA_TILL_CHAMPIONS');
  assert.equal(d.till.namn, '09-17 UGC');
  assert.equal(d.basta_annons.id, 'a2', 'bästa = över break-even med köp, sedan mest spend — inte bara mest spend');
  assert.equal(d.andel, 0.6);
});

test('20–50 % av spenden vid KPI ⇒ FLYTTA (kursens flyttgräns), och majoritet när kampanjen föll är ingen vinnare', () => {
  const bevisad = [{ id: 'b1', namn: 'MATSTRUMP_sushi_gift_ugc_070_h1_v1', adset_id: '500', spend_sek: 15000, kop: 60, roas: 1.9, effective_status: 'ACTIVE' }];
  // 25 % vid KPI men kampanjen förbättrades inte ⇒ flytta, men ingen vinnare.
  const flytt = domAdset(test322({ serie: serie('2026-10-13', 7, 2500, 12, 1.9) }), ctx({ kampanjserie: kampanj(2.2, 2.1), annonser: bevisad }));
  assert.equal(flytt.dom, DOM.FLYTTA);
  // Samma andel när kampanjen förbättrades ⇒ vinnare (kursens andra fråga).
  assert.equal(domAdset(test322({ serie: serie('2026-10-13', 7, 2500, 12, 1.9) }), ctx({ annonser: bevisad })).dom, DOM.VINNARE);
  const foll = domAdset(test322({ serie: serie('2026-10-13', 7, 6000, 30, 1.8) }), ctx({ kampanjserie: kampanj(2.4, 1.9), annonser: bevisad }));
  assert.equal(foll.dom, DOM.FLYTTA);
  assert.match(foll.motivering, /ingen vinnare än/);
});

test('bra ROAS men lite spend: stäng om ett koncept väntar på platsen, annars får den stå', () => {
  const ad = test322({ skapad: '2026-10-12', serie: serie('2026-10-12', 8, 500, 3, 2.0) });
  assert.equal(domAdset(ad, ctx({ koVantar: 2 })).dom, DOM.STANG);
  assert.equal(domAdset(ad, ctx({ koVantar: 0 })).dom, DOM.LAT_STA);
  const okand = domAdset(ad, ctx({ koVantar: null }));
  assert.equal(okand.dom, DOM.LAT_STA);
  assert.match(okand.motivering, /kön lästes inte/);
});

test('under KPI men tar spend och kampanjen förbättrades ⇒ vänta till dag 14; efter 14 dagar stängs den', () => {
  const ung = domAdset(test322({ skapad: '2026-10-11', serie: serie('2026-10-11', 9, 3000, 8, 1.2) }), ctx({ kampanjserie: [...serie('2026-09-20', 21, 10000, 40, 1.6), ...serie('2026-10-11', 9, 10000, 40, 2.0)] }));
  assert.equal(ung.dom, DOM.VANTA);
  assert.equal(ung.atgard, null);
  const gammal = domAdset(test322({ skapad: '2026-09-30', serie: serie('2026-09-30', 20, 3000, 8, 1.2) }), ctx({ kampanjserie: [...serie('2026-09-15', 28, 10000, 40, 1.6), ...serie('2026-10-13', 7, 10000, 40, 2.0)] }));
  assert.equal(gammal.dom, DOM.STANG);
  assert.equal(gammal.lardom, true, 'den fick spend av ett skäl — lärdomen skrivs');
});

test('under KPI och liten andel ⇒ stäng', () => {
  const d = domAdset(test322({ serie: serie('2026-10-13', 7, 300, 1, 0.9) }), ctx());
  assert.equal(d.dom, DOM.STANG);
  assert.equal(d.atgard, 'STANG_ADSET');
});

test('ett gammalt adset (före 3:2:2) döms på de senaste sju dagarna — inte på hela livet', () => {
  const ad = { id: '120251218829760023', namn: 'broad_advplus_purchase_bilder', effective_status: 'ACTIVE', skapad: '2026-08-27', aktiva_annonser: 11, serie: [...serie('2026-09-22', 21, 50, 0, 0), ...serie('2026-10-13', 7, 530, 2, 1.6)] };
  const d = domAdset(ad, ctx({ koVantar: 0 }));
  assert.equal(d.roll, 'gammal');
  assert.equal(d.fonster, '2026-10-13..2026-10-19');
  assert.equal(d.dom, DOM.LAT_STA);
  assert.match(d.motivering, /före 3:2:2/);
});

test('ett gammalt adset som FUNGERAR stängs aldrig för köns skull — kursens versaler: stäng inte det som fungerar', () => {
  const ad = { id: '120251218829760023', namn: 'broad_advplus_purchase_bilder', effective_status: 'ACTIVE', skapad: '2026-08-27', aktiva_annonser: 11, serie: serie('2026-09-22', 28, 530, 2, 1.6) };
  const d = domAdset(ad, ctx({ koVantar: 2 }));
  assert.equal(d.dom, DOM.LAT_STA);
  assert.equal(d.atgard, null);
  // Ett TESTadset med samma tal och en kö stängs däremot (kursens köregel).
  assert.equal(domAdset(test322({ skapad: '2026-10-12', serie: serie('2026-10-12', 8, 500, 3, 2.0) }), ctx({ koVantar: 2 })).dom, DOM.STANG);
});

test('zooma ut: ett gammalt adset under break-even senaste veckan men över på 28 dagar står kvar; under på båda stängs', () => {
  const dok = { id: 'g1', namn: 'broad_advplus_purchase_nya16', effective_status: 'ACTIVE', skapad: '2026-08-27', aktiva_annonser: 40, serie: [...serie('2026-09-22', 21, 800, 4, 2.2), ...serie('2026-10-13', 7, 200, 1, 1.2)] };
  const d = domAdset(dok, ctx({ koVantar: 2 }));
  assert.equal(d.dom, DOM.LAT_STA);
  assert.match(d.motivering, /zoomat ut/);
  const dalig = { ...dok, serie: [...serie('2026-09-22', 21, 800, 1, 0.9), ...serie('2026-10-13', 7, 200, 1, 1.2)] };
  assert.equal(domAdset(dalig, ctx()).dom, DOM.STANG);
});

test('flyttkandidaten är en BEVISAD annons: aktiv, över grinden, över break-even och minst 20 % av adsetets spend', () => {
  const ann = [
    { id: 'p', namn: 'pausad', adset_id: '500', spend_sek: 9000, kop: 40, roas: 2.6, effective_status: 'PAUSED' },
    { id: 's', namn: 'liten', adset_id: '500', spend_sek: 150, kop: 1, roas: 3.0, effective_status: 'ACTIVE' },
    { id: 'u', namn: 'under', adset_id: '500', spend_sek: 9000, kop: 20, roas: 1.2, effective_status: 'ACTIVE' },
    { id: 'v', namn: 'vinnare', adset_id: '500', spend_sek: 6000, kop: 30, roas: 2.0, effective_status: 'ACTIVE' },
  ];
  assert.equal(bastaAnnons('500', ann, BE, { grindar: KONFIG.grindar, flyttAndel: 0.2 }).id, 'v');
  assert.equal(bastaAnnons('500', ann.filter((x) => x.id !== 'v'), BE, { grindar: KONFIG.grindar, flyttAndel: 0.2 }), null, 'pausad = beslut, liten = obevisad, under = under break-even');
  // Adsetet vinner men ingen annons är bevisad ⇒ vänta, inget flyttförslag.
  const d = domAdset(test322({ serie: serie('2026-10-13', 7, 6000, 30, 2.4) }), ctx({ annonser: ann.filter((x) => x.id !== 'v') }));
  assert.equal(d.dom, DOM.VANTA);
  assert.equal(d.atgard, null);
});

test('vinnaren redan i Champions: inget nytt flyttförslag; levererar kopian lämnar testadsetet platsen', () => {
  const vinn = { id: 'v', namn: 'MATSTRUMP_sushi_gift_ugc_070_h2_v1', adset_id: '500', spend_sek: 20000, kop: 70, roas: 2.4, effective_status: 'ACTIVE' };
  const ad = test322({ serie: serie('2026-10-13', 7, 6000, 30, 2.4) });
  const vantar = domAdset(ad, ctx({ annonser: [vinn, { id: 'c', namn: 'MATSTRUMP_sushi_gift_ugc_070_h2_v1 - Kopia', adset_id: CHAMP, spend_sek: 0 }] }));
  assert.equal(vantar.dom, DOM.FLYTTAD);
  assert.equal(vantar.atgard, null);
  const klar = domAdset(ad, ctx({ annonser: [vinn, { id: 'c', namn: 'MATSTRUMP_sushi_gift_ugc_070_h2_v1 – Copy', adset_id: CHAMP, spend_sek: 900 }] }));
  assert.equal(klar.dom, DOM.STANG);
  assert.equal(klar.flyttad, true);
});

test('en flytt föreslås en gång: samma annons och testadset i loggen ⇒ ingen ny FORSLAG-rad', () => {
  const vinn = { id: 'v', namn: 'MATSTRUMP_sushi_gift_ugc_070_h2_v1', adset_id: '500', spend_sek: 20000, kop: 70, roas: 2.4, effective_status: 'ACTIVE' };
  const domar = [domAdset(test322({ serie: serie('2026-10-13', 7, 6000, 30, 2.4) }), ctx({ annonser: [vinn] }))];
  assert.equal(forslagRader(domar, IDAG).length, 1);
  assert.equal(forslagRader(domar, '2026-10-23', { logg: [{ kod: 'FORSLAG', atgard: 'FLYTTA_TILL_CHAMPIONS', adset_id: '500', annons_id: 'v', datum: IDAG }] }).length, 0);
});

test('benchmarken dödas aldrig: ett adset som bär annonsen med > 30 % av vinsten får inget stängningsförslag', () => {
  const ad = test322({ serie: serie('2026-10-13', 7, 300, 1, 0.9) });
  const ann = [{ id: 'b', namn: 'benchmarken', adset_id: '500', spend_sek: 300, kop: 1, roas: 0.9 }];
  assert.equal(domAdset(ad, ctx({ annonser: ann })).dom, DOM.STANG);
  const skyddad = domAdset(ad, ctx({ annonser: ann, skyddade: new Set(['benchmarken']) }));
  assert.equal(skyddad.dom, DOM.LAT_STA);
  assert.equal(skyddad.atgard, null);
  assert.match(skyddad.motivering, /benchmarken/);
});

test('under grinden men köp över break-even och tom kö: ingen dom, får stå; med kö eller noll köp: stäng (svält)', () => {
  const ad = test322({ serie: serie('2026-10-13', 7, 40, 0.3, 3.3) });
  assert.equal(domAdset(ad, ctx({ koVantar: 0 })).dom, DOM.LAT_STA);
  assert.equal(domAdset(ad, ctx({ koVantar: 1 })).dom, DOM.STANG);
  assert.equal(domAdset(ad, ctx({ koVantar: null })).dom, DOM.STANG);
});

test('ett adset som Meta visar som IN_PROCESS eller WITH_ISSUES döms — bara PAUSED och liknande är AV', () => {
  assert.notEqual(domAdset(test322({ effective_status: 'WITH_ISSUES', serie: serie('2026-10-13', 7, 300, 1, 0.9) }), ctx()).dom, DOM.AV);
  assert.equal(domAdset(test322({ effective_status: 'CAMPAIGN_PAUSED' }), ctx()).dom, DOM.AV);
});

test('en bildvinnare flyttas aldrig in bland videorna: Champions för bild saknas och det sägs', () => {
  const m = malFor({ namn: 'MATSTRUMP_T071_offer_bild' }, KONFIG);
  assert.equal(m.saknas, true);
  assert.match(m.namn, /bild/);
  assert.equal(malFor({ namn: 'broad_advplus_purchase_bilder' }, KONFIG).saknas, true);
  assert.equal(malFor({ namn: 'MATSTRUMP_T070_gift_video' }, KONFIG).id, CHAMP);
});

test('förslagen: bara adsetnivå (stäng / flytta), sorterade på kronor — aldrig en paus per annons', () => {
  const jobb = {
    datum: IDAG,
    kampanj_serie: kampanj(2.0, 2.2),
    annonser: [{ id: 'a2', namn: 'MATSTRUMP_sushi_gift_ugc_070_h2_v1', adset_id: '500', spend_sek: 20000, kop: 70, roas: 2.4 }],
    adsets: [
      { id: CHAMP, namn: '09-17 UGC', effective_status: 'ACTIVE', skapad: '2026-09-17', aktiva_annonser: 5, serie: serie('2026-09-22', 28, 3000, 20, 2.0) },
      test322({ serie: serie('2026-10-13', 7, 6000, 30, 2.4) }),
      test322({ id: '501', namn: 'MATSTRUMP_T072_pain_video', serie: serie('2026-10-13', 7, 300, 1, 0.9) }),
      test322({ id: '502', namn: 'MATSTRUMP_T073_identity_video', serie: serie('2026-10-13', 7, 10, 0, 0) }),
    ],
  };
  jobb.annonser[0].effective_status = 'ACTIVE';
  const domar = domAdsets(jobb, KONFIG, { breakEven: BE, koVantar: 1 });
  assert.equal(domar[0].atgard, 'FLYTTA_TILL_CHAMPIONS', 'flytten först');
  const f = forslagRader(domar, IDAG);
  assert.deepEqual(f.map((x) => x.atgard), ['FLYTTA_TILL_CHAMPIONS', 'STANG_ADSET', 'STANG_ADSET']);
  assert.ok(f.every((x) => x.niva === 'adset' && x.beslut === 'Axel' && x.adset_id));
  assert.equal(f[0].objekt, 'MATSTRUMP_sushi_gift_ugc_070_h2_v1');
  assert.equal(f[0].till_id, CHAMP);
  assert.ok(f[1].kronor >= f[2].kronor, 'på kronor, mest först');
  assert.ok(!f.some((x) => /PAUSA/.test(x.atgard)), 'aldrig en paus per annons');
  const rader = adsetDomRader(domar, IDAG);
  assert.equal(rader.length, 4);
  assert.equal(rader.find((r) => r.adset_id === CHAMP).dom, DOM.CHAMPIONS);
});

test('loggen får varje ADSET_DOM och adsetförslag en gång per dag', () => {
  const r = [{ kod: 'ADSET_DOM', datum: IDAG, adset_id: '500', dom: 'STANG' }, { kod: 'FORSLAG', niva: 'adset', datum: IDAG, adset_id: '500', atgard: 'STANG_ADSET' }];
  assert.equal(nyaRader(r, []).length, 2);
  assert.equal(nyaRader(r, r).length, 0);
  assert.equal(nyaRader(r, [{ ...r[0], datum: '2026-10-19' }]).length, 2, 'en ny dag är en ny rad');
});

test('bastaAnnons: null när adsetet inte har någon annons med spend', () => {
  assert.equal(bastaAnnons('500', [{ id: 'x', adset_id: '500', spend_sek: 0 }], BE), null);
});

test('koVantar ur dagens kö: färdiga koncept minus lediga platser; okänd struktur ⇒ null, aldrig ett påhittat 0', async () => {
  const { koVantarUr } = await import('../kor.mjs');
  assert.equal(koVantarUr({ summa: { klara: 1, vantar_plats: 0, lediga: 2 } }), 0, 'ett klart koncept har redan sin plats');
  assert.equal(koVantarUr({ summa: { klara: 0, vantar_plats: 2, lediga: 0 } }), 2);
  assert.equal(koVantarUr({ summa: { klara: 0, vantar_copy: 1, lediga: 0 } }), 1, 'filerna är klara, bara copyn saknas — den vill ha en plats');
  assert.equal(koVantarUr({ summa: { vantar_struktur: 2, lediga: null }, struktur_fel: '(#17)' }), null);
  assert.equal(koVantarUr({ summa: {} }), 0);
});

test('ett gammalt adset som SVÄLTER (bra snitt förr, ingen spend nu) står bara om inget väntar — det fungerar inte nu', () => {
  const ad = { id: 'g17', namn: 'broad_advplus_purchase_alla17', effective_status: 'ACTIVE', skapad: '2026-08-27', aktiva_annonser: 17, serie: [...serie('2026-09-22', 21, 56, 0.25, 2.4), ...serie('2026-10-13', 7, 0.1, 0, null)] };
  assert.equal(domAdset(ad, ctx({ koVantar: 0 })).dom, DOM.LAT_STA);
  assert.equal(domAdset(ad, ctx({ koVantar: 1 })).dom, DOM.STANG);
});
