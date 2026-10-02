import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planera, planeraKoncept, briefFil, STOPPSKAL } from '../kon.mjs';
import { lasKonfig } from '../kor.mjs';
import { strukturLage } from '../struktur.mjs';

const KONFIG = lasKonfig();

const rad = (namn, extra = {}) => ({
  id: `p-${namn}`, namn, status: 'To be Reviewed', typ: 'Video - Pending Approval',
  filer: [], media: [], drive: [{ url: 'https://drive.google.com/x' }], leverans: 'drive-lank',
  url: `https://notion.so/${namn}`, landning: 'https://matstrumpor.se/products/sushi-strumpor', ...extra,
});
const bildrad = (namn) => rad(namn, { leverans: 'notion-fil', filer: [{ url: `https://x/${namn}.png` }], drive: [], typ: 'Image - Pending Approval' });

// Ett COPY CARD med 2 + 2, i briefens form.
const KORT = { texter: ['Text ett.', 'Text två.'], rubriker: ['Rubrik ett.', 'Rubrik två.'], beskrivning: null, cta: 'Handla nu', lank: 'https://matstrumpor.se/products/sushi-strumpor' };
const kortFor = (namn, k = KORT) => new Map(namn.map((n) => [n, k]));

// Champions + 1 test = 2 levererande, taket 5 ⇒ 3 lediga.
const LAGE = strukturLage({ kampanj: { dagsbudget_sek: 10000 }, adsets: [
  { id: '120251591832340023', namn: '09-17 UGC', effective_status: 'ACTIVE', aktiva_annonser: 5 },
  { id: '1', namn: 'MATSTRUMP_T060_gift_video', effective_status: 'ACTIVE', aktiva_annonser: 3 },
] }, KONFIG, { breakEvenCpa: 308.48 });

const D = '2026-10-05';

test('en uppladdning blir ETT adset med allt som är klart — oavsett koncept och antal hookar (Axels beslut 2026-10-02)', () => {
  const namn = ['MATSTRUMP_sushi_gift_ugc_070_h1_v1', 'MATSTRUMP_sushi_gift_ugc_070_h2_v1', 'MATSTRUMP_sushi_curiosity_ugc_071_h1_v1'];
  const p = planera(namn.map((n) => rad(n)), KONFIG);
  const k = planeraKoncept(p.klara, KONFIG, { kort: kortFor(namn), lage: LAGE, datum: D });
  assert.equal(k.att_bygga.length, 1);
  assert.equal(k.att_bygga[0].adset_namn, 'MATSTRUMP_U261005_mix_video');
  assert.deepEqual(k.att_bygga[0].annonser.map((a) => a.namn), namn);
  assert.deepEqual(k.att_bygga[0].koncept_nycklar, ['070', '071']);
  assert.deepEqual(k.att_bygga[0].annonser[0].copy.rubriker, KORT.rubriker);
});

test('en ensam annons går upp i ett eget adset — ingen väntan på tre hookar', () => {
  const namn = ['MATSTRUMP_sushi_jul_ugc_072_h1_v1'];
  const k = planeraKoncept(planera(namn.map((n) => rad(n)), KONFIG).klara, KONFIG, { kort: kortFor(namn), lage: LAGE, datum: D });
  assert.equal(k.att_bygga.length, 1);
  assert.equal(k.att_bygga[0].adset_namn, 'MATSTRUMP_U261005_jul_video');
});

test('bild och video i samma uppladdning blir två adsets — de blandas aldrig', () => {
  const p = planera([rad('MATSTRUMP_sushi_gift_ugc_073_h1_v1'), bildrad('MATSTRUMP_sushi_gift_static_074_v1')], KONFIG);
  const k = planeraKoncept(p.klara, KONFIG, { kort: kortFor(p.klara.map((a) => a.namn)), lage: LAGE, datum: D });
  assert.deepEqual(k.att_bygga.map((b) => b.adset_namn), ['MATSTRUMP_U261005_gift_video', 'MATSTRUMP_U261005_gift_bild']);
});

test('fler annonser än taket per uppladdning blir ett adset till (b), och ett upptaget namn hoppas över', () => {
  const namn = [1, 2, 3, 4, 5, 6, 7].map((h) => `MATSTRUMP_sushi_gift_ugc_075_h${h}_v1`);
  const lage = { ...LAGE, adsets: [...LAGE.adsets, { id: '8', namn: 'MATSTRUMP_U261005_gift_video', effective_status: 'ACTIVE' }] };
  const k = planeraKoncept(planera(namn.map((n) => rad(n)), KONFIG).klara, KONFIG, { kort: kortFor(namn), lage, datum: D });
  assert.deepEqual(k.att_bygga.map((b) => [b.adset_namn, b.annonser.length]), [['MATSTRUMP_U261005b_gift_video', 6], ['MATSTRUMP_U261005c_gift_video', 1]]);
});

test('copy med bara 1 rubrik + 1 text (gamla briefen) väntar på copy — ingen annons går upp med en rubrik', () => {
  const namn = ['MATSTRUMP_sushi_gift_ugc_076_h1_v1', 'MATSTRUMP_sushi_gift_ugc_076_h2_v1'];
  const enkel = { ...KORT, texter: ['Bara en.'], rubriker: ['Bara en.'] };
  const k = planeraKoncept(planera(namn.map((n) => rad(n)), KONFIG).klara, KONFIG, { kort: kortFor(namn, enkel), lage: LAGE, datum: D });
  assert.equal(k.att_bygga.length, 0);
  assert.equal(k.koncept[0].status, 'vantar_copy');
  assert.match(k.koncept[0].skal.join(' '), /2 \("Primary text 1:"/);
  assert.match(k.koncept[0].skal.join(' '), /sonnet/);
});

test('ett syskons COPY CARD gäller när en hookvariant saknar eget kort', () => {
  const namn = ['MATSTRUMP_sushi_gift_ugc_077_h1_v1', 'MATSTRUMP_sushi_gift_ugc_077_h2_v1', 'MATSTRUMP_sushi_gift_ugc_077_h3_v1'];
  const kort = new Map([[namn[0], KORT], [namn[1], null], [namn[2], null]]);
  const k = planeraKoncept(planera(namn.map((n) => rad(n)), KONFIG).klara, KONFIG, { kort, lage: LAGE, datum: D });
  assert.equal(k.att_bygga[0].status, 'klar');
  assert.deepEqual(k.att_bygga[0].annonser.map((a) => a.copy_kalla), ['egen', 'syskon', 'syskon']);
});

test('ett sjätte adset vägras: över taket väntar uppladdningen på en plats', () => {
  const full = strukturLage({ kampanj: { dagsbudget_sek: 10000 }, adsets: [
    { id: '120251591832340023', namn: '09-17 UGC', effective_status: 'ACTIVE', aktiva_annonser: 5 },
    ...[1, 2, 3, 4].map((i) => ({ id: String(i), namn: `MATSTRUMP_T06${i}_gift_video`, effective_status: 'ACTIVE', aktiva_annonser: 3 })),
  ] }, KONFIG, { breakEvenCpa: 308.48 });
  assert.equal(full.lediga, 0);
  const namn = ['MATSTRUMP_sushi_gift_ugc_078_h1_v1'];
  const k = planeraKoncept(planera(namn.map((n) => rad(n)), KONFIG).klara, KONFIG, { kort: kortFor(namn), lage: full, datum: D });
  assert.equal(k.koncept[0].status, 'vantar_plats');
  assert.equal(k.att_bygga.length, 0);
  assert.match(k.koncept[0].skal.join(' '), /vägrar ett adset till/);
});

test('utan strukturen ur Meta laddas inget upp', () => {
  const namn = ['MATSTRUMP_sushi_gift_ugc_079_h1_v1'];
  const k = planeraKoncept(planera(namn.map((n) => rad(n)), KONFIG).klara, KONFIG, { kort: kortFor(namn), lage: null, datum: D });
  assert.equal(k.koncept[0].status, 'vantar_struktur');
  assert.equal(k.att_bygga.length, 0);
});

test('en rad med tre hookfiler (--hookrad) blir tre annonser _h1 _h2 _h3', () => {
  const r = rad('MATSTRUMP_sushi_gift_ugc_079_v1');
  const p = planera([r], KONFIG, { hookrader: new Set([r.id]) });
  assert.deepEqual(p.klara.map((a) => [a.namn, a.fil_hook]), [['MATSTRUMP_sushi_gift_ugc_079_h1_v1', 1], ['MATSTRUMP_sushi_gift_ugc_079_h2_v1', 2], ['MATSTRUMP_sushi_gift_ugc_079_h3_v1', 3]]);
  const k = planeraKoncept(p.klara, KONFIG, { kort: new Map(p.klara.map((a) => [a.namn, KORT])), lage: LAGE });
  assert.equal(k.att_bygga[0].annonser.length, 3);
});

test('en rad utan fil laddas aldrig upp — den rapporteras', () => {
  const p = planera([rad('MATSTRUMP_sushi_jul_ugc_044_v1', { leverans: 'saknas', drive: [] })], KONFIG);
  assert.equal(p.klara.length, 0);
  assert.equal(p.stoppade[0].skal[0], STOPPSKAL.FIL);
});

test('ett namn utanför mönstret stoppas i stället för att gissa', () => {
  const p = planera([rad('09-17 Nathalie captions musik')], KONFIG);
  assert.equal(p.stoppade[0].skal[0], STOPPSKAL.NAMN);
  assert.equal(p.stoppade[0].behover_namn, true);
});

test('utlandets namn laddas aldrig upp av den svenska uppladdaren', () => {
  const p = planera([rad('MATSTRUMP_NO_sushi_gift_ugc_007_v1')], KONFIG);
  assert.equal(p.stoppade[0].skal[0], STOPPSKAL.UTLAND);
});

test('pris som avviker mer än 20 % stoppar raden', () => {
  const p = planera([bildrad('MATSTRUMP_sushi_offer_static_048_v1')], KONFIG, { prisavvikelse: () => -0.31 });
  assert.match(p.stoppade[0].skal[0], /priset i annonsen avviker/);
});

test('18 % avvikelse släpps igenom — gränsen är 20 %, precis som /notionkorning', () => {
  const p = planera([bildrad('MATSTRUMP_sushi_offer_static_049_v1')], KONFIG, { prisavvikelse: () => -0.18 });
  assert.equal(p.klara.length, 1);
});

test('landningssida till en annan butik stoppar raden (fel pixel = fel bokföring)', () => {
  const p = planera([rad('MATSTRUMP_sushi_gift_ugc_050_v1', { landning: 'https://baverbutiken.se/products/x' })], KONFIG);
  assert.match(p.stoppade[0].skal[0], /annan butik/);
});

test('briefFil hittar briefen på namnet, på det omdöpta namnet, och syskonets på samma löpnummer', () => {
  const logg = [
    { kod: 'BRIEF', annons: 'MATSTRUMP_sushi_gift_ugc_080_h1_v1', brief: 'matstrumpor/test/fixtur-brief-322.md' },
    { kod: 'OMDOPT', fran: 'MATSTRUMP_sushi_gift_ugc_081_v1', till: 'MATSTRUMP_sushi_gift_ugc_082_v1' },
    { kod: 'BRIEF', annons: 'MATSTRUMP_sushi_gift_ugc_081_v1', brief: 'matstrumpor/test/fixtur-brief-322.md' },
  ];
  assert.match(briefFil('MATSTRUMP_sushi_gift_ugc_080_h1_v1', logg), /COPY CARD/);
  assert.match(briefFil('MATSTRUMP_sushi_gift_ugc_080_h3_v1', logg), /COPY CARD/, 'hookvarianten läser syskonets brief');
  assert.match(briefFil('MATSTRUMP_sushi_gift_ugc_082_v1', logg), /COPY CARD/, 'omdöpt rad hittar sin brief');
  assert.equal(briefFil('MATSTRUMP_sushi_gift_ugc_099_v1', logg), null);
});

test('en annons som redan byggts byggs aldrig igen: uppladdad, publicerad men ologgad, eller i ett opublicerat bygge', () => {
  const namn = ['MATSTRUMP_sushi_gift_ugc_083_h1_v1', 'MATSTRUMP_sushi_gift_ugc_083_h2_v1'];
  const klara = planera(namn.map((n) => rad(n)), KONFIG).klara;
  const skapad = { kod: 'ADSET_SKAPAD', adset_id: '9', adset_namn: 'MATSTRUMP_U261004_gift_video', koncept: 'U261004', annonser: namn, datum: '2026-10-04' };
  // Opublicerat bygge: annonserna hålls, aldrig Approved.
  const b = planeraKoncept(klara, KONFIG, { kort: kortFor(namn), lage: LAGE, logg: [skapad], datum: D });
  assert.equal(b.att_bygga.length, 0);
  assert.equal(b.stopp[0].utkast_opublicerat, true);
  assert.match(b.stopp[0].skal.join(' '), /--adset-kasserat 9/);
  // Kvitterat som kasserat ⇒ byggs igen.
  const kass = planeraKoncept(klara, KONFIG, { kort: kortFor(namn), lage: LAGE, logg: [skapad, { kod: 'ADSET_KASSERAT', adset_id: '9', datum: D }], datum: D });
  assert.equal(kass.att_bygga.length, 1);
  // Axel publicerade det (syns i kampanjen) men inget loggat: kontroll, inte nytt bygge.
  const iKampanjen = { ...LAGE, adsets: [...LAGE.adsets, { id: '9', namn: skapad.adset_namn, effective_status: 'ACTIVE' }] };
  const pub = planeraKoncept(klara, KONFIG, { kort: kortFor(namn), lage: iKampanjen, logg: [skapad], datum: D });
  assert.equal(pub.att_bygga.length, 0);
  assert.match(pub.stopp[0].skal.join(' '), /--kontroll 9/);
  // Uppladdad annons ⇒ bara den andra går upp.
  const c = planeraKoncept(klara, KONFIG, { kort: kortFor(namn), lage: LAGE, logg: [{ kod: 'UPPLADDAD', annons: namn[1], annons_id: '77' }], datum: D });
  assert.deepEqual(c.att_bygga[0].annonser.map((a) => a.namn), [namn[0]]);
});

test('ett namn utan löpnummer (s010h1, haikuh3) stoppas synligt — det försvinner aldrig tyst ur kön', () => {
  const p = planera([rad('MATSTRUMP_sushi_gift_ugc_s010h1_v1')], KONFIG);
  assert.equal(p.klara.length, 0);
  assert.equal(p.stoppade[0].skal[0], STOPPSKAL.NUMMER);
  assert.equal(p.stoppade[0].behover_namn, true);
});

test('--hookrad tar id:t med eller utan bindestreck, eller hela länken, och säger till när det inte träffar', () => {
  const r = rad('MATSTRUMP_sushi_gift_ugc_084_v1', { id: '3ed270ab-908c-81f6-bd39-fa33a209f382' });
  assert.equal(planera([r], KONFIG, { hookrader: new Set(['3ED270AB908C81F6BD39FA33A209F382']) }).klara.length, 3);
  assert.equal(planera([r], KONFIG, { hookrader: new Set(['https://www.notion.so/MATSTRUMP-084-3ed270ab908c81f6bd39fa33a209f382']) }).klara.length, 3);
  const miss = planera([r], KONFIG, { hookrader: new Set(['ffffffffffffffffffffffffffffffff']) });
  assert.deepEqual(miss.hookrader_utan_traff, ['ffffffffffffffffffffffffffffffff']);
  const okandVinkel = planera([rad('MATSTRUMP_sushi_okand_ugc_085_v1', { id: 'x1' })], KONFIG, { hookrader: new Set(['x1']) });
  assert.equal(okandVinkel.klara.length, 0, 'en vinkel som inte står i konfigen stoppar raden, inte hela kön');
  assert.match(okandVinkel.stoppade[0].skal[0], /--hookrad/);
});

test('en hookvariants EGET underkända kort håller just den annonsen — syskonen går upp', () => {
  const namn = ['MATSTRUMP_sushi_gift_ugc_086_h1_v1', 'MATSTRUMP_sushi_gift_ugc_086_h2_v1', 'MATSTRUMP_sushi_gift_ugc_086_h3_v1'];
  const kort = new Map([[namn[0], KORT], [namn[1], { ...KORT, texter: ['Köp på Matstrumpor nu.', 'B.'] }], [namn[2], KORT]]);
  const k = planeraKoncept(planera(namn.map((n) => rad(n)), KONFIG).klara, KONFIG, { kort, lage: LAGE, datum: D });
  assert.deepEqual(k.att_bygga[0].annonser.map((a) => a.namn), [namn[0], namn[2]]);
  const v = k.koncept.find((x) => x.status === 'vantar_copy');
  assert.match(v.skal.join(' '), /_086_h2_v1: butikens namn/);
});
