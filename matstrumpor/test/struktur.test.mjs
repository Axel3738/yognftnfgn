import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lasKonfig } from '../kor.mjs';
import {
  regler, adsetNamn, tolkaAdsetNamn, rollFor, levererar, kapacitet, strukturLage,
  lasCopyKort, granskaCopy, ctaTyp, adsetSpec, creativeSpec, kontrolleraAdset,
} from '../struktur.mjs';

const KONFIG = lasKonfig();
const CHAMP = KONFIG.meta.struktur.champions.id;

test('reglerna i konfigen är kursens 3:2:2: 5 adsets, 3 annonser, 2 rubriker, 2 texter, 3 × CPA, 7/14 dagar', () => {
  const r = regler(KONFIG);
  assert.deepEqual([r.max_adsets_totalt, r.annonser_per_adset, r.rubriker_per_annons, r.texter_per_annons, r.cpa_multipel_per_adset, r.test_dagar, r.test_max_dagar], [5, 3, 2, 2, 3, 7, 14]);
  assert.equal(r.champions.namn, '09-17 UGC');
});

test('adsetnamnet bär konceptets löpnummer, vinkeln och video/bild — och läses tillbaka', () => {
  assert.equal(adsetNamn({ nummer: 65, vinkel: 'gift', mediatyp: 'video' }), 'MATSTRUMP_T065_gift_video');
  assert.deepEqual(tolkaAdsetNamn('MATSTRUMP_T065_gift_video'), { nummer: 65, vinkel: 'gift', mediatyp: 'video' });
  assert.equal(tolkaAdsetNamn('broad_advplus_purchase_nya16'), null);
  assert.throws(() => adsetNamn({ nummer: 65, vinkel: 'gift', mediatyp: 'okand' }), /blandas aldrig/);
});

test('rollen: Champions på id, testadset på namnet, allt annat är ett gammalt adset', () => {
  assert.equal(rollFor({ id: CHAMP, namn: '09-17 UGC' }, KONFIG), 'champions');
  assert.equal(rollFor({ id: '9', namn: 'MATSTRUMP_T065_gift_video' }, KONFIG), 'test');
  assert.equal(rollFor({ id: '8', namn: 'broad_advplus_purchase_bilder' }, KONFIG), 'gammal');
});

test('ett adset levererar bara om det är ACTIVE och har en annons som levererar', () => {
  assert.equal(levererar({ effective_status: 'ACTIVE', aktiva_annonser: 1 }), true);
  assert.equal(levererar({ effective_status: 'ACTIVE', aktiva_annonser: 0 }), false);
  assert.equal(levererar({ effective_status: 'PAUSED', aktiva_annonser: 3 }), false);
});

test('kapaciteten: 3 × break-even-CPA per adset och dag — 10 000 kr bär 10, 2 700 kr bär 2', () => {
  assert.equal(kapacitet(10000, 308.48, KONFIG).ryms, 10);
  assert.equal(kapacitet(2700, 308.48, KONFIG).ryms, 2);
  assert.equal(kapacitet(2700, 308.48, KONFIG).per_adset_sek, 925.44);
  assert.equal(kapacitet(null, 308.48, KONFIG).ryms, null);
});

const champ = { id: CHAMP, namn: '09-17 UGC', effective_status: 'ACTIVE', aktiva_annonser: 5 };
const gammal = (i, extra = {}) => ({ id: `g${i}`, namn: `broad_advplus_purchase_g${i}`, effective_status: 'ACTIVE', aktiva_annonser: 4, ...extra });

test('taket är det lägsta av 5 och vad budgeten bär; gamla levererande adsets räknas mot taket', () => {
  const lage = strukturLage({ kampanj: { dagsbudget_sek: 10000 }, adsets: [champ, gammal(1), gammal(2), gammal(3, { aktiva_annonser: 0 })] }, KONFIG, { breakEvenCpa: 308.48 });
  assert.equal(lage.tak, 5);
  assert.equal(lage.antal_levererande, 3, 'ett adset utan levererande annonser räknas inte');
  assert.equal(lage.lediga, 2);
  assert.match(lage.varningar.join(' '), /2 gamla adsets/);
  const snal = strukturLage({ kampanj: { dagsbudget_sek: 2700 }, adsets: [champ] }, KONFIG, { breakEvenCpa: 308.48 });
  assert.equal(snal.tak, 2, 'budgeten bär bara två adsets à 925 kr');
  assert.equal(snal.lediga, 1);
  assert.match(snal.varningar.join(' '), /bär bara 2 adsets/);
});

test('åtta levererande adsets (läget 2026-10-02) ⇒ full struktur, noll lediga, och varför', () => {
  const lage = strukturLage({ kampanj: { dagsbudget_sek: 10000 }, adsets: [champ, ...[1, 2, 3, 4, 5, 6, 7].map((i) => gammal(i))] }, KONFIG, { breakEvenCpa: 308.48 });
  assert.equal(lage.lediga, 0);
  assert.match(lage.skal, /Strukturen är full: 8 adsets levererar och taket är 5/);
});

test('saknas Champions i kampanjen står det som en varning, aldrig tyst', () => {
  const lage = strukturLage({ kampanj: { dagsbudget_sek: 10000 }, adsets: [gammal(1)] }, KONFIG, { breakEvenCpa: 308.48 });
  assert.match(lage.varningar.join(' '), /finns inte i kampanjen/);
});

test('COPY CARD ur repots brief.md: två texter, två rubriker, beskrivning, knapp, länk', () => {
  const k = lasCopyKort(readFileSync(new URL('./fixtur-brief-322.md', import.meta.url), 'utf8'));
  assert.deepEqual(k.texter, ['Ingen jublar åt tvättmedel. Ingen sparar en skämtpryl.', 'En låda som ser ut som sushi och är fem par strumpor.']);
  assert.deepEqual(k.rubriker, ['Rolig i kväll. På fötterna i morgon.', 'Sushi som aldrig blir gammal.']);
  assert.equal(k.beskrivning, 'Fem par strumpor i en sushilåda. Ätpinnar ingår.');
  assert.equal(ctaTyp(k.cta), 'SHOP_NOW');
  assert.equal(k.lank, 'https://matstrumpor.se/products/sushi-strumpor');
});

test('COPY CARD ur Notion-sidans text, där etiketterna kan stå på samma rad (mätt 2026-10-02 på 066)', () => {
  const text = [
    'COPY CARD (goes in Ads Manager, not in the creative)',
    'Primary text 1:',
    'Ingen jublar åt tvättmedel.',
    'Primary text 2:',
    'Fem par strumpor i en låda.',
    'Headline 1: Rolig i kväll. Headline 2: Sushi utan fisk. Description: Ätpinnar ingår. CTA button: Handla nu (Shop Now) Destination: https://matstrumpor.se/products/sushi-strumpor',
    '(Copy card = the live copy on every UGC ad in the account.)',
    'Primary KPI',
    'CPA mot break-even.',
  ].join('\n');
  const k = lasCopyKort(text);
  assert.deepEqual(k.texter, ['Ingen jublar åt tvättmedel.', 'Fem par strumpor i en låda.']);
  assert.deepEqual(k.rubriker, ['Rolig i kväll.', 'Sushi utan fisk.']);
  assert.equal(k.beskrivning, 'Ätpinnar ingår.');
  assert.equal(k.lank, 'https://matstrumpor.se/products/sushi-strumpor');
});

test('den gamla briefen (en text, en rubrik) läses — och granskningen säger att den andra saknas', () => {
  const k = lasCopyKort('## COPY CARD\n**Primary text:**\n> En text.\n\n**Headline:** `En rubrik.`\n**Description:** `X.`\n\n## Primary KPI\nY');
  assert.deepEqual([k.texter.length, k.rubriker.length], [1, 1]);
  const g = granskaCopy(k, KONFIG);
  assert.equal(g.ok, false);
  assert.equal(g.fel.length, 2);
  assert.equal(lasCopyKort('ingen kortrubrik här'), null);
});

test('granskaCopy: butikens namn i en text, två likadana rubriker eller en främmande länk stoppar', () => {
  const bas = { texter: ['A.', 'B.'], rubriker: ['C.', 'D.'], beskrivning: null, cta: null, lank: 'https://matstrumpor.se/products/sushi-strumpor' };
  assert.equal(granskaCopy(bas, KONFIG).ok, true);
  assert.match(granskaCopy({ ...bas, texter: ['Köp på Matstrumpor.se.', 'B.'] }, KONFIG).fel.join(' '), /butikens namn/);
  assert.match(granskaCopy({ ...bas, rubriker: ['C.', 'c.'] }, KONFIG).fel.join(' '), /samma text/);
  assert.match(granskaCopy({ ...bas, lank: 'https://baverbutiken.se/x' }, KONFIG).fel.join(' '), /fel pixel/);
  const tre = granskaCopy({ ...bas, texter: ['A.', 'B.', 'E.'] }, KONFIG);
  assert.equal(tre.ok, true);
  assert.deepEqual(tre.copy.texter, ['A.', 'B.']);
  assert.match(tre.anm[0], /de 2 första/);
});

const MALL = { targeting: { geo_locations: { countries: ['SE'] }, age_min: 18, age_max: 65 }, optimization_goal: 'OFFSITE_CONVERSIONS', billing_event: 'IMPRESSIONS', promoted_object: { pixel_id: '1785935302094082', custom_event_type: 'PURCHASE' }, attribution_spec: [{ event_type: 'CLICK_THROUGH', window_days: 7 }] };

test('adsetSpec: mallen är Champions, ingen budget, ingen budstrategi, aldrig dynamic creative', () => {
  const s = adsetSpec({ namn: 'MATSTRUMP_T065_gift_video', mall: MALL, kampanjId: '120251217860260023', kontoId: '730973156224390' });
  assert.equal(s.campaign_id, '120251217860260023');
  assert.equal(s.is_dynamic_creative, false);
  assert.equal('daily_budget' in s || 'bid_strategy' in s, false);
  assert.deepEqual(JSON.parse(s.targeting), MALL.targeting);
  assert.deepEqual(JSON.parse(s.promoted_object), MALL.promoted_object);
  assert.throws(() => adsetSpec({ namn: 'nya_hinken', mall: MALL, kampanjId: '1', kontoId: '2' }), /3:2:2-adsetnamn/);
  assert.throws(() => adsetSpec({ namn: 'MATSTRUMP_T065_gift_video', mall: { ...MALL, targeting: null }, kampanjId: '1', kontoId: '2' }), /målgrupp/);
});

const COPY = { texter: ['T1.', 'T2.'], rubriker: ['R1.', 'R2.'], beskrivning: 'B.', cta: 'SHOP_NOW' };

test('creativeSpec: en vanlig annons, första texten i object_story_spec, båda i asset_feed_spec (DEGREES_OF_FREEDOM)', () => {
  const c = creativeSpec({ namn: 'X', mediatyp: 'video', video_id: '123', thumbnail_url: 'https://cdn/x.jpg', copy: COPY, lank: 'https://matstrumpor.se/products/sushi-strumpor', sida_id: '820358954504320', instagram_id: '17841479011543544' });
  assert.equal(c.object_story_spec.page_id, '820358954504320');
  assert.equal(c.object_story_spec.video_data.message, 'T1.');
  assert.equal(c.object_story_spec.video_data.title, 'R1.');
  assert.equal(c.object_story_spec.video_data.call_to_action.value.link, 'https://matstrumpor.se/products/sushi-strumpor');
  assert.deepEqual(c.asset_feed_spec.bodies.map((b) => b.text), ['T1.', 'T2.']);
  assert.deepEqual(c.asset_feed_spec.titles.map((b) => b.text), ['R1.', 'R2.']);
  assert.equal(c.asset_feed_spec.optimization_type, 'DEGREES_OF_FREEDOM');
  const b = creativeSpec({ namn: 'Y', mediatyp: 'bild', image_hash: 'h', copy: COPY, lank: 'https://matstrumpor.se/x', sida_id: '1' });
  assert.equal(b.object_story_spec.link_data.image_hash, 'h');
  assert.throws(() => creativeSpec({ namn: 'Z', mediatyp: 'video', video_id: '1', copy: COPY, lank: 'l', sida_id: '1' }), /miniatyr/);
  assert.throws(() => creativeSpec({ namn: 'Z', mediatyp: 'video', video_id: '1', thumbnail_url: 'u', copy: { ...COPY, rubriker: ['bara en'] }, lank: 'l', sida_id: '1' }), /2 primärtexter och 2 rubriker/);
});

const lasAd = (namn, extra = {}) => ({ id: namn, name: namn, effective_status: 'ACTIVE', creative: { object_story_spec: { page_id: '820358954504320', video_data: { call_to_action: { value: { link: 'https://matstrumpor.se/products/sushi-strumpor' } } } }, asset_feed_spec: { bodies: [{ text: 'T1.' }, { text: 'T2.' }], titles: [{ text: 'R1.' }, { text: 'R2.' }] } }, ...extra });

test('kontrolleraAdset: tre annonser med 2 + 2 i rätt adset är grönt — varje avvikelse namnges', () => {
  const adset = { name: 'MATSTRUMP_T065_gift_video', campaign_id: KONFIG.meta.kampanj.id, is_dynamic_creative: false };
  const plan = { adset_namn: 'MATSTRUMP_T065_gift_video', annonser: ['a', 'b', 'c'].map((n) => ({ namn: n, copy: COPY })) };
  assert.equal(kontrolleraAdset({ adset, annonser: [lasAd('a'), lasAd('b'), lasAd('c')] }, KONFIG, { forvantat: plan }).ok, true);
  const tva = kontrolleraAdset({ adset, annonser: [lasAd('a'), lasAd('b')] }, KONFIG, { forvantat: plan });
  assert.match(tva.fel.join(' '), /2 annonser i adsetet/);
  const enText = lasAd('c', { creative: { ...lasAd('c').creative, asset_feed_spec: { bodies: [{ text: 'T1.' }], titles: [{ text: 'R1.' }, { text: 'R2.' }] } } });
  assert.match(kontrolleraAdset({ adset, annonser: [lasAd('a'), lasAd('b'), enText] }, KONFIG, { forvantat: plan }).fel.join(' '), /1 primärtexter/);
  assert.match(kontrolleraAdset({ adset: { ...adset, is_dynamic_creative: true }, annonser: [lasAd('a'), lasAd('b'), lasAd('c')] }, KONFIG).fel.join(' '), /dynamic creative/);
  assert.match(kontrolleraAdset({ adset: { ...adset, daily_budget: '50000' }, annonser: [lasAd('a'), lasAd('b'), lasAd('c')] }, KONFIG).fel.join(' '), /egen budget/);
  const bild = lasAd('c', { creative: { object_story_spec: { page_id: '820358954504320', link_data: { link: 'https://matstrumpor.se/x' } }, asset_feed_spec: lasAd('c').creative.asset_feed_spec } });
  assert.match(kontrolleraAdset({ adset, annonser: [lasAd('a'), lasAd('b'), bild] }, KONFIG).fel.join(' '), /bild och video i samma adset/);
  const fel = kontrolleraAdset({ adset, annonser: [lasAd('a'), lasAd('b'), lasAd('c', { creative: { ...lasAd('c').creative, asset_feed_spec: { bodies: [{ text: 'Annat.' }, { text: 'T2.' }], titles: [{ text: 'R1.' }, { text: 'R2.' }] } } })] }, KONFIG, { forvantat: plan });
  assert.match(fel.fel.join(' '), /primärtexterna i Meta är inte briefens/);
});

test('primärtexten behåller sina rader (korta stycken) — rubrikerna blir en rad', () => {
  const k = lasCopyKort('## COPY CARD\n**Primary text 1:**\n> Ingen jublar åt tvättmedel.\n> Den här sålde slut.\n>\n> Köp 1 – Få 1.\n\n**Primary text 2:**\n> En rad.\n**Headline 1:** `R1`\n**Headline 2:** `R2`\n\n## Primary KPI\nx');
  assert.equal(k.texter[0], 'Ingen jublar åt tvättmedel.\nDen här sålde slut.\n\nKöp 1 – Få 1.');
  assert.equal(k.texter[1], 'En rad.');
  assert.deepEqual(k.rubriker, ['R1', 'R2']);
});

test('ett adset i WITH_ISSUES eller IN_PROCESS med levererande annonser räknas mot taket', () => {
  const lage = strukturLage({ kampanj: { dagsbudget_sek: 10000 }, adsets: [champ, { id: 'a', namn: 'MATSTRUMP_T090_gift_video', effective_status: 'WITH_ISSUES', aktiva_annonser: 3 }, { id: 'b', namn: 'MATSTRUMP_T091_gift_video', effective_status: 'IN_PROCESS', aktiva_annonser: 3 }] }, KONFIG, { breakEvenCpa: 308.48 });
  assert.equal(lage.antal_levererande, 3);
  assert.equal(lage.lediga, 2);
});

test('kontrolleraAdset: ett avstängt adset, en pausad annons, fel pixel eller en saknad planerad annons är rött', () => {
  const adset = { name: 'MATSTRUMP_T065_gift_video', campaign_id: KONFIG.meta.kampanj.id, status: 'ACTIVE', effective_status: 'ACTIVE', promoted_object: { pixel_id: KONFIG.meta.pixel_id } };
  const plan = { adset_namn: 'MATSTRUMP_T065_gift_video', annonser: ['a', 'b', 'c'].map((n) => ({ namn: n, copy: COPY })) };
  const tre = [lasAd('a', { status: 'ACTIVE' }), lasAd('b', { status: 'ACTIVE' }), lasAd('c', { status: 'ACTIVE' })];
  assert.equal(kontrolleraAdset({ adset, annonser: tre }, KONFIG, { forvantat: plan }).ok, true);
  assert.match(kontrolleraAdset({ adset: { ...adset, status: 'PAUSED', effective_status: 'PAUSED' }, annonser: tre }, KONFIG).fel.join(' '), /står PAUSED/);
  assert.match(kontrolleraAdset({ adset, annonser: [tre[0], tre[1], lasAd('c', { status: 'PAUSED', effective_status: 'PAUSED' })] }, KONFIG).fel.join(' '), /c: står PAUSED/);
  assert.match(kontrolleraAdset({ adset, annonser: [tre[0], tre[1], lasAd('c', { effective_status: 'DISAPPROVED' })] }, KONFIG).fel.join(' '), /levererar inte \(DISAPPROVED\)/);
  assert.match(kontrolleraAdset({ adset: { ...adset, promoted_object: { pixel_id: '1554276343018184' } }, annonser: tre }, KONFIG).fel.join(' '), /pixel/);
  assert.match(kontrolleraAdset({ adset, annonser: [tre[0], tre[1], lasAd('x')] }, KONFIG, { forvantat: plan }).fel.join(' '), /c: planens annons finns inte/);
});
