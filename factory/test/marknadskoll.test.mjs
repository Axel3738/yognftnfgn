// Tester för factory/marknadskoll.mjs — marknadsvakten (Axels order 2026-09-27:
// "kör bara flöden på fb och ig" + "du behöver hålla koll på det"). Ren logik,
// inget nät: placeringsjämförelsen, insights-mappningen, svenskdetektorn,
// landningslänkarna och rapporten.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tillatnaPlaceringar, placeringsAvvikelse, nyTargeting, spendUtanfor, svenskaRader, svenskDetektor, landningslankar, byggRapport, byggJobb } from '../marknadskoll.mjs';
import { OPS_MARKNADER } from '../opsmarknader.mjs';

const FLODET = OPS_MARKNADER.US.placeringar;

test('tillatnaPlaceringar: Metas targeting-namn blir insights-namn — instagram "stream" är "feed" i breakdownen', () => {
  const t = tillatnaPlaceringar(FLODET);
  assert.deepEqual([...t].sort(), ['facebook/feed', 'instagram/feed']);
  // En plattform utan positionslista betyder alla dess positioner.
  assert.ok(tillatnaPlaceringar({ publisher_platforms: ['facebook'] }).has('facebook/*'));
});

test('placeringsAvvikelse: samma mängder i annan ordning avviker inte; Advantage+ (tomt) och Stories avviker', () => {
  const ratt = { geo_locations: { countries: ['US'] }, publisher_platforms: ['instagram', 'facebook'], facebook_positions: ['feed'], instagram_positions: ['stream'] };
  assert.equal(placeringsAvvikelse(ratt, FLODET).avviker, false);
  const advantage = { geo_locations: { countries: ['US'] }, targeting_automation: { advantage_audience: 1 } };
  const a = placeringsAvvikelse(advantage, FLODET);
  assert.equal(a.avviker, true);
  assert.ok(a.skillnader.some((s) => s.startsWith('publisher_platforms:')));
  const stories = { ...ratt, instagram_positions: ['stream', 'story'] };
  assert.equal(placeringsAvvikelse(stories, FLODET).avviker, true);
  const an = { ...ratt, audience_network_positions: ['classic'] };
  assert.ok(placeringsAvvikelse(an, FLODET).skillnader.some((s) => s.includes('audience_network_positions')));
});

test('nyTargeting: behåller geo/ålder, byter placeringarna, tar bort främmande plattformars positioner', () => {
  const gammal = { geo_locations: { countries: ['US'] }, age_min: 25, age_max: 65, publisher_platforms: ['facebook', 'instagram', 'audience_network'], facebook_positions: ['feed', 'story'], instagram_positions: ['stream', 'story'], audience_network_positions: ['classic'], messenger_positions: ['story'] };
  const ny = nyTargeting(gammal, FLODET);
  assert.deepEqual(ny.geo_locations, { countries: ['US'] });
  assert.equal(ny.age_min, 25);
  assert.deepEqual(ny.publisher_platforms, ['facebook', 'instagram']);
  assert.deepEqual(ny.facebook_positions, ['feed']);
  assert.deepEqual(ny.instagram_positions, ['stream']);
  assert.equal('audience_network_positions' in ny, false);
  assert.equal('messenger_positions' in ny, false);
  // Källan rörs inte.
  assert.deepEqual(gammal.facebook_positions, ['feed', 'story']);
});

test('spendUtanfor: Stories-kronor larmas, flödet och "unknown" inte, noll spend räknas inte', () => {
  const rader = [
    { publisher_platform: 'facebook', platform_position: 'feed', spend: '443' },
    { publisher_platform: 'instagram', platform_position: 'feed', spend: '580' },
    { publisher_platform: 'instagram', platform_position: 'instagram_stories', spend: '16654' },
    { publisher_platform: 'facebook', platform_position: 'facebook_reels', spend: '0' },
    { publisher_platform: 'unknown', platform_position: 'unknown', spend: '12' },
  ];
  const ut = spendUtanfor(rader, tillatnaPlaceringar(FLODET));
  assert.deepEqual(ut.map((r) => `${r.publisher_platform}/${r.platform_position}`), ['instagram/instagram_stories']);
});

test('svenskaRader: svenska rader på en engelsk sida hittas, engelska och valutaväljaren inte', () => {
  const rader = ['Track your parcel', 'Spåra paket', 'Verified purchase', 'Verifierat köp', 'Enkel lösning och bra passform.', 'Sweden (SEK kr)', 'United States (USD $)', 'SEK kr', 'Roof cover for travel trailers', '$199.00', 'Free shipping to the US',
    // Engelska rader som första torrkörningen flaggade på "over"/"under" — aldrig igen.
    'The edge hangs about 30–40 cm (12–16 in) down over the sides', 'They stop putting it off and cover the one surface that actually sits under the rain', 'Wait till spring and the sealant is soft'];
  assert.deepEqual(svenskaRader(rader, 'en'), ['Spåra paket', 'Verifierat köp', 'Enkel lösning och bra passform.']);
});

test('svenskaRader: på en norsk sida stoppar bara svenska ord — "Verifisert kjøp" och "med"/"eller" är norska', () => {
  const rader = ['Verifisert kjøp', 'Spor pakken', 'Verifierat köp', 'Godt vern for taket og lett å bruke.', 'Gratis frakt til Norge', 'Passer med eller uten markise', 'Skyddar husvagnen bra mot regn och smuts.'];
  assert.deepEqual(svenskaRader(rader, 'nb'), ['Verifierat köp', 'Skyddar husvagnen bra mot regn och smuts.']);
  assert.equal(svenskDetektor('sv'), null);
  assert.deepEqual(svenskaRader(rader, 'sv'), []);
});

test('landningslankar: unika länkar ur link_data, video_data-knappen och asset_feed_spec', () => {
  const annonser = [
    { creative: { object_story_spec: { link_data: { link: 'https://carashell.com/pages/x?country=US' } } } },
    { creative: { object_story_spec: { video_data: { call_to_action: { value: { link: 'https://carashell.com/pages/x?country=US' } } } } } },
    { creative: { asset_feed_spec: { link_urls: [{ website_url: 'https://carashell.com/products/takskyddet?country=US' }] } } },
    { creative: {} },
  ];
  assert.deepEqual(landningslankar(annonser), ['https://carashell.com/pages/x?country=US', 'https://carashell.com/products/takskyddet?country=US']);
});

test('byggRapport + byggJobb: rättat adset under gjort, svensk rad och fel land under ACTION, inget problem ⇒ problem false', () => {
  const bas = {
    brand: 'CaraShell', butik: 'carashell', marknad: 'US', datum: '2026-09-27', act: '1', prefix: 'CARASHELL_US_', country: 'US', placeringar: FLODET, torr: false,
    kampanjer: [{ id: 'k1', name: '1 CARASHELL_US_Tak', daily_budget: 800000, adsets: [{}, {}], annonser: 22 }],
    adsets: [{ id: 'a1', name: 'CARASHELL_US_CO', avviker: false, skillnader: [], rattad: false, fel: null }],
    spend: { 'i går': [{ publisher_platform: 'facebook', platform_position: 'feed', spend: '7291' }] },
    spendUtanfor: { 'i går': [] },
    sidor: { fel: null, lasta: [{ typ: 'startsida', url: 'https://carashell.com/?country=US', lang: 'en', rader: 200, svenska: [], fel: null }], kassa: { url: 'https://carashell.com/checkouts/x', lang: 'en-US', land: 'US', svenska: [], fel: null } },
  };
  const lugn = byggJobb(bas);
  assert.equal(lugn.problem, false);
  assert.ok(byggRapport(bas).some((r) => r.includes('✅ alla 1 adsets')));

  const stok = {
    ...bas,
    adsets: [{ id: 'a1', name: 'CARASHELL_US_CO', avviker: true, skillnader: ['instagram_positions: stream,story ska vara stream'], rattad: true, fel: null }],
    spendUtanfor: { 'i går': [{ publisher_platform: 'instagram', platform_position: 'instagram_stories', spend: '2570' }] },
    sidor: { fel: null, lasta: [{ typ: 'produktsida', url: 'https://carashell.com/products/takskyddet?country=US', lang: 'en', rader: 300, svenska: ['Verifierat köp'], fel: null }], kassa: { url: 'https://carashell.com/checkouts/x', lang: 'en-US', land: 'SE', svenska: [], fel: null } },
  };
  const jobb = byggJobb(stok);
  assert.equal(jobb.problem, true);
  assert.equal(jobb.gjort.length, 1);
  assert.ok(jobb.varningar[0].includes('instagram_stories'));
  assert.ok(jobb.action_axel.some((r) => r.includes('Verifierat köp')));
  assert.ok(jobb.action_axel.some((r) => r.includes('preselects SE')));
  assert.equal(jobb.lage, 'oversatt');
  assert.equal(jobb.kanal, 'annons-uppladdning');
  const rapport = byggRapport(stok);
  assert.ok(rapport.some((r) => r.startsWith('🔧 CARASHELL_US_CO')));
  assert.ok(rapport.some((r) => r.includes('UTANFÖR flödet')));
});
