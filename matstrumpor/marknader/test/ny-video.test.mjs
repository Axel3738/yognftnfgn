// Tester för annonser/ny-video.mjs — en färdig video utan tal och text till varje marknad (ren logik, inget nät).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nastaNummer, annonsNamn, referensText, planera } from '../annonser/ny-video.mjs';
import { tillB } from '../annonser/nob.mjs';

const vid = (kod, nr, extra = {}) => ({ namn: `MATSTRUMP_${kod}_sushi_gift_ugc_${String(nr).padStart(3, '0')}_v1`, video: `klar/${kod}_${nr}.mp4`, title: `${kod} rubrik`, message: `${kod} text\nEt svensk merke.`, link_description: `${kod} länk`, ...extra });
const bild = (kod, nr) => ({ namn: `MATSTRUMP_${kod}_sushi_offer_static_${String(nr).padStart(3, '0')}_v1`, bild: 'klar/x.jpg', title: 'Köp 2', message: 'bild', link_description: 'bild' });

test('nastaNummer: räknas per marknad ur filens namn, nästa efter det högsta', () => {
  assert.equal(nastaNummer([vid('NO', 1), vid('NO', 7), bild('NO', 8)]), 9);
  assert.equal(nastaNummer([]), 1);
  assert.equal(nastaNummer([{ namn: 'Sofie H1' }, vid('DK', 3)]), 4);
});

test('annonsNamn: följer namnmotorns mönster, med _im för en lånad video', () => {
  assert.equal(annonsNamn({ kod: 'NO', vinkel: 'gift', format: 'ugc', nummer: 9, im: true }), 'MATSTRUMP_NO_sushi_gift_ugc_009_im_v1');
  assert.equal(annonsNamn({ kod: 'NOB', vinkel: 'gift', format: 'ugc', nummer: 12 }), 'MATSTRUMP_NOB_sushi_gift_ugc_012_v1');
  assert.throws(() => annonsNamn({ kod: 'NO', vinkel: 'gift', format: 'ugc', nummer: 'x' }));
});

test('referensText: marknadens annons 001 bär standardtexten, aldrig en bildannons', () => {
  const t = referensText([bild('US', 8), vid('US', 2, { title: 'annan' }), vid('US', 1)]);
  assert.equal(t.fran, 'MATSTRUMP_US_sushi_gift_ugc_001_v1');
  assert.equal(t.title, 'US rubrik');
  assert.throws(() => referensText([bild('US', 8)]), /ingen videoannons/);
});

test('planera: första marknaden bär filen, de andra lånar dess video, NOB rörs aldrig här', () => {
  const filer = { NO: { annonser: [vid('NO', 1), bild('NO', 8)] }, NOB: { annonser: [] }, DK: { annonser: [vid('DK', 1), vid('DK', 4)] } };
  const plan = planera({ filer, vinkel: 'gift', format: 'ugc', im: true, kalla: 'Axels fil.', fil: 'temu.mp4', marknader: ['NO', 'NOB', 'DK'] });
  assert.deepEqual(plan.map((p) => p.kod), ['NO', 'DK']);
  assert.equal(plan[0].post.namn, 'MATSTRUMP_NO_sushi_gift_ugc_009_im_v1');
  assert.equal(plan[0].post.video, 'klar/temu.mp4');
  assert.equal(plan[1].post.namn, 'MATSTRUMP_DK_sushi_gift_ugc_005_im_v1');
  assert.equal(plan[1].post.video_fran, plan[0].post.namn);
  assert.equal(plan[1].post.video, undefined);
  assert.equal(plan[1].post.title, 'DK rubrik');
  assert.match(plan[1].post.kalla, /MATSTRUMP_DK_sushi_gift_ugc_001_v1/);
});

test('planera → nob.mjs: B-annonsen härleds ur A:s nya post utan varumärkesraden', () => {
  const filer = { NO: { annonser: [vid('NO', 1)] } };
  const [no] = planera({ filer, vinkel: 'gift', format: 'ugc', im: true, kalla: 'k', fil: 'f.mp4', marknader: ['NO'] });
  const b = tillB(no.post);
  assert.equal(b.namn, 'MATSTRUMP_NOB_sushi_gift_ugc_002_im_v1');
  assert.equal(b.video_fran, no.post.namn);
  assert.ok(!b.message.includes('Et svensk merke.'));
});

test('planera: ett namn som redan finns stoppar hellre än skriver en dubblett', () => {
  // Två poster med samma löpnummer kan bara uppstå om filen redan bär det nya namnet.
  const filer = { NO: { annonser: [vid('NO', 1), { ...vid('NO', 2), namn: 'MATSTRUMP_NO_sushi_gift_ugc_003_im_v1' }] } };
  const plan = planera({ filer, vinkel: 'gift', format: 'ugc', im: true, kalla: 'k', fil: 'f.mp4', marknader: ['NO'] });
  assert.equal(plan[0].post.namn, 'MATSTRUMP_NO_sushi_gift_ugc_004_im_v1');
});
