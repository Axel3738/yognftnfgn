// Tester för tools/ops-till-meta.mjs — den rena logiken. Inga nätanrop:
// modulen importeras utan att CLI:t körs (vakten på import.meta.url).

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  medietyp, konceptUrNamn, kampanjbas, adsetNamn, kontrolleraMarknad, lankUrSpec,
  plockaLank, plockaDsa, byggSpec, valjEnKampanj, tolkaArgs,
} from '../ops-till-meta.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const KAMPANJ = 'HEIMGUARD_SE_Övervakningskameran | BE-ROAS 2,11 | 2026-09-08';
const PREFIX = ['heimguard_', 'heimguard'];

test('konceptUrNamn: andra fältet, marknadskoden hoppas över, siffror ger null', () => {
  assert.equal(konceptUrNamn('HeimGuard_SP_2_1'), 'SP');
  assert.equal(konceptUrNamn('HeimGuard_NO_SP_2_1'), 'SP');
  assert.equal(konceptUrNamn('HeimGuard_SE_PD_3_H1'), 'PD');
  assert.equal(konceptUrNamn('heimguard_ugc_1_1'), 'UGC');
  assert.equal(konceptUrNamn('TankGuard_1_1'), null, 'siffror är ingen kod');
  assert.equal(konceptUrNamn('HeimGuard_NO_7_1'), null, 'marknadskod följd av siffra är ingen kod');
  assert.equal(konceptUrNamn('HeimGuard'), null);
  assert.equal(konceptUrNamn('HeimGuard_SOCIAL_1'), null, 'fler än 4 bokstäver är inte en kod');
  assert.equal(konceptUrNamn(''), null);
});

test('kampanjbas + adsetNamn: allt före " | ", adset = "<bas> - <KONCEPT>"', () => {
  assert.equal(kampanjbas(KAMPANJ), 'HEIMGUARD_SE_Övervakningskameran');
  assert.equal(kampanjbas('TANKGUARD_NO_Sales'), 'TANKGUARD_NO_Sales', 'utan " | " är hela namnet basen');
  assert.equal(adsetNamn(KAMPANJ, 'SP'), 'HEIMGUARD_SE_Övervakningskameran - SP');
  assert.equal(adsetNamn(KAMPANJ, 'sp'), 'HEIMGUARD_SE_Övervakningskameran - SP', 'konceptet skrivs med versaler');
  // Facit: pipeline/waves/se-heimguard-image.config.mjs:38.
  assert.equal(adsetNamn(KAMPANJ, 'SP'), 'HEIMGUARD_SE_Övervakningskameran - SP');
});

test('kontrolleraMarknad: NO-namn i SE stoppas, SE-namn i NO stoppas, rätt kod släpps igenom', () => {
  assert.equal(kontrolleraMarknad('HeimGuard_SP_2_1', 'SE').ok, true, 'utan kod = SE');
  assert.equal(kontrolleraMarknad('HeimGuard_SE_SP_2_1', 'SE').ok, true);
  assert.equal(kontrolleraMarknad('HeimGuard_NO_SP_2_1', 'NO').ok, true);
  assert.equal(kontrolleraMarknad('HeimGuard_SP_2_1_NO', 'NO').ok, true, 'koden sist i namnet räknas');

  const noISe = kontrolleraMarknad('HeimGuard_NO_SP_2_1', 'SE');
  assert.equal(noISe.ok, false);
  assert.match(noISe.skal, /bär marknadskoden NO/);
  assert.equal(kontrolleraMarknad('HeimGuard_DK_SP_2_1', 'SE').ok, false);
  assert.equal(kontrolleraMarknad('HeimGuard_FI_SP_2_1', 'SE').ok, false);

  const seINo = kontrolleraMarknad('HeimGuard_SP_2_1', 'NO');
  assert.equal(seINo.ok, false, 'ett NO-namn måste bära _NO_');
  assert.match(seINo.skal, /saknar marknadskoden _NO_/);
  assert.equal(kontrolleraMarknad('HeimGuard_SE_SP_2_1', 'NO').ok, false);
  assert.equal(kontrolleraMarknad('HeimGuard_SP_2_1', 'XX').ok, false, 'okänd marknad');
  // Vinkelkoder får aldrig läsas som länder.
  assert.equal(kontrolleraMarknad('HeimGuard_TR_1_1', 'SE').ok, true);
  assert.equal(kontrolleraMarknad('HeimGuard_PD_1_1', 'SE').ok, true);
});

test('medietyp: mp4/mov är video, jpg/jpeg/png är bild, allt annat null', () => {
  assert.equal(medietyp('x/HeimGuard_SP_1_H1.mp4'), 'video');
  assert.equal(medietyp('klipp.MOV'), 'video');
  assert.equal(medietyp('bild.jpg'), 'bild');
  assert.equal(medietyp('bild.JPEG'), 'bild');
  assert.equal(medietyp('bild.png'), 'bild');
  assert.equal(medietyp('fil.gif'), null);
  assert.equal(medietyp('fil.webm'), null);
  assert.equal(medietyp('fil'), null);
  assert.equal(medietyp(undefined), null);
});

test('lankUrSpec + plockaLank: bild via link_data.link, video via call_to_action.value.link, ACTIVE nyast först', () => {
  const bild = { page_id: '1', link_data: { link: 'https://heimguard.se/products/a', call_to_action: { type: 'SHOP_NOW', value: { link: 'https://heimguard.se/products/a' } } } };
  const video = { page_id: '1', video_data: { video_id: 'v', call_to_action: { type: 'SHOP_NOW', value: { link: 'https://heimguard.se/products/b' } } } };
  assert.equal(lankUrSpec(bild), 'https://heimguard.se/products/a');
  assert.equal(lankUrSpec(video), 'https://heimguard.se/products/b');
  assert.equal(lankUrSpec({ page_id: '1', video_data: { video_id: 'v' } }), null);
  assert.equal(lankUrSpec(null), null);

  const annonser = [
    { id: '1', status: 'PAUSED', created_time: '2026-09-10T00:00:00+0000', creative: { object_story_spec: { link_data: { link: 'https://gammal.se/' } } } },
    { id: '2', status: 'ACTIVE', created_time: '2026-09-01T00:00:00+0000', creative: { object_story_spec: video } },
    { id: '3', status: 'ACTIVE', created_time: '2026-09-05T00:00:00+0000', creative: { object_story_spec: { link_data: {} } } },
  ];
  assert.equal(plockaLank(annonser), 'https://heimguard.se/products/b', 'nyaste ACTIVE med länk vinner över nyare PAUSED');
  assert.equal(plockaLank([{ id: '9', status: 'PAUSED', creative: { object_story_spec: bild } }]), 'https://heimguard.se/products/a', 'utan ACTIVE tas senaste alls');
  assert.equal(plockaLank([]), null);
  assert.equal(plockaLank([{ id: '9', creative: {} }]), null);
});

test('plockaDsa: återanvänder beneficiary/payor ur en befintlig annons, null när ingen bär dem', () => {
  assert.equal(plockaDsa([{ id: '1', status: 'ACTIVE' }, { id: '2' }]), null);
  assert.deepEqual(
    plockaDsa([{ id: '1', status: 'PAUSED', dsa_beneficiary: 'Stonebite AB', dsa_payor: 'Stonebite AB' }]),
    { beneficiary: 'Stonebite AB', payor: 'Stonebite AB' },
  );
  assert.deepEqual(plockaDsa([{ id: '1', dsa_beneficiary: 'X' }]), { beneficiary: 'X', payor: null });
  assert.equal(plockaDsa([]), null);
});

test('byggSpec bild: samma fältnamn som notion-till-meta.mjs link_data', () => {
  const spec = byggSpec({ typ: 'bild', pageId: 'P', igId: 'IG', media: { hash: 'H' }, primär: 'text', rubrik: 'rubrik', beskrivning: 'besk', länk: 'https://x.se/p' });
  assert.equal(spec.page_id, 'P');
  assert.equal(spec.instagram_actor_id, 'IG');
  assert.deepEqual(spec.link_data, {
    image_hash: 'H', link: 'https://x.se/p', message: 'text', name: 'rubrik', description: 'besk',
    call_to_action: { type: 'SHOP_NOW', value: { link: 'https://x.se/p' } },
  });
  assert.equal('video_data' in spec, false);

  const utan = byggSpec({ typ: 'bild', pageId: 'P', media: { hash: 'H' }, primär: 't', rubrik: 'r', länk: 'https://x.se' });
  assert.equal(utan.link_data.description, undefined, 'tom beskrivning utelämnas');
  assert.equal('instagram_actor_id' in utan, false, 'ingen IG ⇒ inget fält');

  // Facit: fältnamnen i tools/notion-till-meta.mjs link_data-blocket.
  const källa = readFileSync(join(ROT, 'tools', 'notion-till-meta.mjs'), 'utf8');
  const block = källa.slice(källa.indexOf('link_data: {'), källa.indexOf('link_data: {') + 400);
  for (const f of Object.keys(spec.link_data)) assert.ok(block.includes(f), `link_data.${f} saknas i notion-till-meta.mjs`);
  assert.ok(block.includes("type: 'SHOP_NOW'"));
});

test('byggSpec video: samma fältnamn som notion-till-meta.mjs video_data', () => {
  const spec = byggSpec({ typ: 'video', pageId: 'P', igId: null, media: { videoId: 'V', thumb: 'https://thumb' }, primär: 'text', rubrik: 'rubrik', beskrivning: '', länk: 'https://x.se/p' });
  assert.deepEqual(spec.video_data, {
    video_id: 'V', image_url: 'https://thumb', message: 'text', title: 'rubrik', link_description: undefined,
    call_to_action: { type: 'SHOP_NOW', value: { link: 'https://x.se/p' } },
  });
  assert.equal('link_data' in spec, false);
  assert.equal('instagram_actor_id' in spec, false);

  const källa = readFileSync(join(ROT, 'tools', 'notion-till-meta.mjs'), 'utf8');
  const block = källa.slice(källa.indexOf('video_data: {'), källa.indexOf('video_data: {') + 400);
  for (const f of Object.keys(spec.video_data)) assert.ok(block.includes(f), `video_data.${f} saknas i notion-till-meta.mjs`);

  assert.throws(() => byggSpec({ typ: 'gif', pageId: 'P', media: {}, primär: 't', rubrik: 'r', länk: 'https://x' }), /okänd medietyp/);
});

test('valjEnKampanj: exakt en ACTIVE på marknaden — annars null med skäl och listan', () => {
  const kampanjer = [
    { id: '10', name: KAMPANJ, status: 'ACTIVE', effective_status: 'ACTIVE' },
    { id: '11', name: 'HEIMGUARD_NO_Overvakingskamera | BE-ROAS 2,11', status: 'ACTIVE', effective_status: 'ACTIVE' },
    { id: '12', name: 'HEIMGUARD_SE_Gammal | 2026-08-01', status: 'PAUSED', effective_status: 'PAUSED' },
    { id: '20', name: 'TANKGUARD_SE_Sales', status: 'ACTIVE', effective_status: 'ACTIVE' },
    { id: '30', name: 'Heimdal_SE_annan butik', status: 'ACTIVE', effective_status: 'ACTIVE' },
  ];
  const se = valjEnKampanj({ kampanjer, prefix: PREFIX, marknad: 'SE' });
  assert.equal(se.kampanj?.id, '10');
  assert.equal(se.skal, null);
  assert.deepEqual(se.kandidater.map((k) => k.id), ['10', '12'], 'kandidaterna är butikens på marknaden, även pausade');
  assert.deepEqual(se.butikens.map((k) => k.id), ['10', '11', '12'], 'grannbutiker och Heimdal (ordgräns) är borta');

  const no = valjEnKampanj({ kampanjer, prefix: PREFIX, marknad: 'NO' });
  assert.equal(no.kampanj?.id, '11');

  // Noll aktiva: bara den pausade finns.
  const bara = valjEnKampanj({ kampanjer: [kampanjer[2]], prefix: PREFIX, marknad: 'SE' });
  assert.equal(bara.kampanj, null);
  assert.match(bara.skal, /Ingen ACTIVE kampanj/);
  assert.match(bara.skal, /HEIMGUARD_SE_Gammal/);

  // Ingen kampanj alls på marknaden — men butiken finns på en annan.
  const fel = valjEnKampanj({ kampanjer: [kampanjer[1]], prefix: PREFIX, marknad: 'SE' });
  assert.equal(fel.kampanj, null);
  assert.match(fel.skal, /annan marknad/);

  // Två aktiva: stopp med båda namnen.
  const tva = valjEnKampanj({ kampanjer: [...kampanjer, { id: '13', name: 'HEIMGUARD_SE_Ny | 2026-09-11', status: 'ACTIVE' }], prefix: PREFIX, marknad: 'SE' });
  assert.equal(tva.kampanj, null);
  assert.match(tva.skal, /2 ACTIVE kampanjer/);
  assert.match(tva.skal, /HEIMGUARD_SE_Ny/);
  assert.match(tva.skal, /--kampanj/);
});

test('valjEnKampanj: flerproduktsbutik hittas via annonserna (TACKLEBAY_SE_… bär TackleBayRod_…)', () => {
  const kampanjer = [{ id: '40', name: 'TACKLEBAY_SE_Spöhållaren | 2026-09-10', status: 'ACTIVE' }];
  const prefix = ['tacklebayrod_', 'tacklebayrod'];
  assert.equal(valjEnKampanj({ kampanjer, prefix, marknad: 'SE' }).kampanj, null, 'utan annonsrader: namnet bär inte prefixet');
  const val = valjEnKampanj({ kampanjer, prefix, annonsrader: [{ id: 'a', name: 'TackleBayRod_SP_1_1', campaign_id: '40' }], marknad: 'SE' });
  assert.equal(val.kampanj?.id, '40');
  assert.equal(val.baraViaAnnons.length, 1);
});

test('tolkaArgs: positional nyckel, flaggvärden räknas aldrig som positional, torr/json är booleska', () => {
  const a = tolkaArgs(['hemvakten', '--marknad', 'SE', '--namn', 'HeimGuard_SP_99_1', '--torr', '--primar', 'text med mellanslag', '--json']);
  assert.deepEqual(a._, ['hemvakten']);
  assert.equal(a.marknad, 'SE');
  assert.equal(a.namn, 'HeimGuard_SP_99_1');
  assert.equal(a.primar, 'text med mellanslag');
  assert.equal(a.torr, true);
  assert.equal(a.json, true);
  assert.equal(tolkaArgs(['--namn', '--torr']).namn, null, 'flagga utan värde');
  assert.equal(tolkaArgs([]).torr, undefined);
});
