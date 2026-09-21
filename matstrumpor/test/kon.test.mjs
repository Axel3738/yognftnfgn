import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planera, STOPPSKAL } from '../kon.mjs';
import { lasKonfig } from '../kor.mjs';

const KONFIG = lasKonfig();
const ADSETS = { video: 'AS_VIDEO', bild: 'AS_BILD', jul_video: null, jul_bild: null };

const rad = (namn, extra = {}) => ({
  id: `p-${namn}`, namn, status: 'To be Reviewed', typ: 'Video - Pending Approval',
  filer: [], media: [], drive: [{ url: 'https://drive.google.com/x' }], leverans: 'drive-lank',
  url: `https://notion.so/${namn}`, landning: 'https://matstrumpor.se/products/sushi-strumpor', ...extra,
});

test('julvideor och julbilder hamnar i var sitt adset, resten i de vanliga', () => {
  const p = planera([
    rad('MATSTRUMP_sushi_jul_ugc_044_v1'),
    rad('MATSTRUMP_sushi_jul_static_045_v1', { leverans: 'notion-fil', filer: [{ url: 'https://x/f.png' }], drive: [] }),
    rad('MATSTRUMP_sushi_gift_ugc_046_v1'),
    rad('MATSTRUMP_sushi_offer_product_047_v1', { leverans: 'notion-fil', filer: [{ url: 'https://x/g.png' }], drive: [] }),
  ], KONFIG, { adsetIdn: ADSETS });
  assert.deepEqual(p.per_adset, {
    bild: ['MATSTRUMP_sushi_offer_product_047_v1'],
    jul_bild: ['MATSTRUMP_sushi_jul_static_045_v1'],
    jul_video: ['MATSTRUMP_sushi_jul_ugc_044_v1'],
    video: ['MATSTRUMP_sushi_gift_ugc_046_v1'],
  });
  assert.equal(p.stoppade.length, 0);
});

test('jul-adseten flaggas som "måste skapas" när de saknas i kontot', () => {
  const p = planera([rad('MATSTRUMP_sushi_jul_ugc_044_v1')], KONFIG, { adsetIdn: ADSETS });
  assert.deepEqual(p.adsets_att_skapa, ['jul_video']);
  assert.equal(p.klara[0].adset_maste_skapas, true);
  assert.equal(p.klara[0].adset_namn, 'broad_advplus_purchase_jul_video');
});

test('en rad utan fil laddas aldrig upp — den rapporteras', () => {
  const p = planera([rad('MATSTRUMP_sushi_jul_ugc_044_v1', { leverans: 'saknas', drive: [] })], KONFIG, { adsetIdn: ADSETS });
  assert.equal(p.klara.length, 0);
  assert.equal(p.stoppade[0].skal[0], STOPPSKAL.FIL);
});

test('ett namn utanför mönstret stoppas i stället för att gissa adset', () => {
  const p = planera([rad('09-17 Nathalie captions musik')], KONFIG, { adsetIdn: ADSETS });
  assert.equal(p.stoppade[0].skal[0], STOPPSKAL.NAMN);
});

test('pris som avviker mer än 20 % stoppar raden', () => {
  const p = planera([rad('MATSTRUMP_sushi_offer_static_048_v1', { leverans: 'notion-fil', filer: [{ url: 'u' }], drive: [] })],
    KONFIG, { adsetIdn: ADSETS, prisavvikelse: () => -0.31 });
  assert.match(p.stoppade[0].skal[0], /priset i annonsen avviker/);
});

test('18 % avvikelse släpps igenom — gränsen är 20 %, precis som /notionkorning', () => {
  const p = planera([rad('MATSTRUMP_sushi_offer_static_049_v1', { leverans: 'notion-fil', filer: [{ url: 'u' }], drive: [] })],
    KONFIG, { adsetIdn: ADSETS, prisavvikelse: () => -0.18 });
  assert.equal(p.klara.length, 1);
});

test('landningssida till en annan butik stoppar raden (fel pixel = fel bokföring)', () => {
  const p = planera([rad('MATSTRUMP_sushi_gift_ugc_050_v1', { landning: 'https://baverbutiken.se/products/x' })], KONFIG, { adsetIdn: ADSETS });
  assert.match(p.stoppade[0].skal[0], /annan butik/);
});
