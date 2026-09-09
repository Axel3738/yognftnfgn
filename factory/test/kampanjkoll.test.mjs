// Tester för kampanjkoll.mjs — trippelkollen i steg 10 av `/ny-annonser`.
// Bara de rena delarna: ingen nätverkstrafik, ingen vågkonfig läses från disk.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  vantatAntal,
  samstammiga,
  lankAv,
  kontrolleraKampanj,
  kontrolleraAdsets,
  kontrolleraAnnonser,
  antalFel,
} from '../kampanjkoll.mjs';

const cfg = {
  act: 'act_915422744950975',
  page: '1399193996606775',
  pixel: '2196132151319625',
  country: 'SE',
  link: 'https://tankguard.se/products/tankoverdraget',
  campaignName: 'TANKGUARD_SE_Tanköverdraget | 2026-09-08',
  campaignStatus: 'PAUSED',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  dailyBudget: '100000',
  adsets: [
    { name: 'PD', ads: [{}, {}] },
    { name: 'BOF', ads: [{}] },
  ],
};

const adset = (namn, extra = {}) => ({
  name: namn,
  status: 'PAUSED',
  promoted_object: { pixel_id: cfg.pixel },
  targeting: { geo_locations: { countries: ['SE'] } },
  ...extra,
});

const annons = (namn, extra = {}) => ({
  name: namn,
  status: 'PAUSED',
  creative: { object_story_spec: { page_id: cfg.page, link_data: { link: cfg.link } } },
  ...extra,
});

test('vantatAntal räknar annonser och adsets ur konfigarna', () => {
  assert.deepEqual(vantatAntal([cfg]), { annonser: 3, adsets: 2 });
  // Ett adset utan ads-lista räknas som en annons — samma regel som förut.
  assert.deepEqual(vantatAntal([{ adsets: [{ name: 'CO' }] }]), { annonser: 1, adsets: 1 });
  // Samma adsetnamn i två konfigar (video + bild) är ETT adset.
  assert.equal(vantatAntal([cfg, { adsets: [{ name: 'PD', ads: [{}] }] }]).adsets, 2);
});

test('samstammiga kräver samma kampanj OCH samma konto', () => {
  assert.equal(samstammiga([cfg, { ...cfg }]), true);
  assert.equal(samstammiga([cfg, { ...cfg, campaignName: 'ANNAT' }]), false);
  assert.equal(samstammiga([cfg, { ...cfg, act: 'act_1867947880635861' }]), false);
});

test('lankAv läser länken ur både video- och bildcreatives', () => {
  assert.equal(lankAv(annons('a')), cfg.link);
  assert.equal(
    lankAv({ creative: { object_story_spec: { video_data: { call_to_action: { value: { link: 'https://x.se' } } } } } }),
    'https://x.se'
  );
  assert.equal(lankAv({}), '');
});

test('kontrolleraKampanj: saknad kampanj är ett fel, fel budget är ett fel', () => {
  assert.deepEqual(kontrolleraKampanj(cfg, null), [{ ok: false, text: 'hittades inte i kontot' }]);

  const grön = kontrolleraKampanj(cfg, { status: 'PAUSED', daily_budget: '100000' });
  assert.equal(antalFel(grön), 0);

  const röd = kontrolleraKampanj(cfg, { status: 'ACTIVE', daily_budget: '50000' });
  assert.equal(antalFel(röd), 2);
});

test('kontrolleraAdsets fångar fel pixel och fel geo — en SE-geo i NO är dyr', () => {
  const rader = kontrolleraAdsets(
    cfg,
    [
      adset('PD'),
      adset('BOF', { promoted_object: { pixel_id: '1554276343018184' } }),
      adset('CO', { targeting: { geo_locations: { countries: ['NO'] } } }),
    ],
    3
  );
  assert.equal(rader[0].ok, true, 'rätt antal adsets');
  assert.equal(rader[1].ok, true);
  assert.match(rader[2].text, /pixel 1554276343018184/);
  assert.match(rader[3].text, /geo NO/);
  assert.equal(antalFel(rader), 2);
});

test('kontrolleraAnnonser kollar ANTALET först — en tom kampanj är aldrig grön', () => {
  const tom = kontrolleraAnnonser(cfg, [], 3);
  assert.equal(tom.length, 1, 'inga fler kontroller på noll annonser');
  assert.equal(tom[0].ok, false);
  assert.match(tom[0].text, /3 annonser \(är: 0\)/);
  assert.equal(antalFel(tom), 1);
});

test('kontrolleraAnnonser fångar fel sida, fel länk och fel status', () => {
  const rader = kontrolleraAnnonser(
    cfg,
    [
      annons('TankGuard_PD_1_H1'),
      annons('TankGuard_PD_1_H2', { status: 'ACTIVE' }),
      annons('TankGuard_BOF_1_1', {
        creative: { object_story_spec: { page_id: '1324465810740336', link_data: { link: 'https://baverbutiken.se/x' } } },
      }),
    ],
    3
  );
  assert.equal(rader[0].ok, true, 'rätt antal');
  assert.equal(antalFel(rader), 3, 'status, sida och länk');
  assert.match(rader.map((r) => r.text).join(' | '), /avvikande: 1/);
});

test('helt grön kampanj ger noll fel', () => {
  const rader = [
    ...kontrolleraKampanj(cfg, { status: 'PAUSED', daily_budget: '100000' }),
    ...kontrolleraAdsets(cfg, [adset('PD'), adset('BOF')], 2),
    ...kontrolleraAnnonser(cfg, [annons('a'), annons('b'), annons('c')], 3),
  ];
  assert.equal(antalFel(rader), 0);
});
