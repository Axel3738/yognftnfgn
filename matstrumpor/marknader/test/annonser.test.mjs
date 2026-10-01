// Tester för annonser/bygg.mjs — spärrarna före aktivering (ren logik, inget nät).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arVerifieringsfel, farAktiveras, identitetSkillnad, lankOk, lankSkillnad, mediaSkillnad, regionalFalt, slaIhopLage, textSkillnad } from '../annonser/bygg.mjs';
import { readFileSync } from 'node:fs';
import { tillB, VARUMARKESRAD } from '../annonser/nob.mjs';

test('slaIhopLage: en körning för en marknad byter bara ut den raden, resten står kvar i marknadsordning', () => {
  const forra = [{ kod: 'NO', annonser: [] }, { kod: 'DK', annonser: [] }, { kod: 'FI', annonser: [] }];
  const nya = [{ kod: 'NO', annonser: [{ id: '1' }] }];
  const ut = slaIhopLage(forra, nya, ['NO', 'DK', 'FI']);
  assert.deepEqual(ut.map((k) => k.kod), ['NO', 'DK', 'FI']);
  assert.equal(ut[0].annonser.length, 1);
  assert.deepEqual(slaIhopLage([], [{ kod: 'FI' }, { kod: 'NO' }], ['NO', 'FI']).map((k) => k.kod), ['NO', 'FI']);
});

const NO = { kampanj: 'MATSTRUMP_NO_SALES', geo: ['NO'], locale: 'nb', budget_beslut: "Axel 2026-09-27: '1000kr per dag'" };
const WW = { kampanj: 'MATSTRUMP_WW_SALES', geo: ['NO', 'DK', 'US'], locale: 'en', budget_beslut: 'EJ GIVEN — platshållare' };

test('lankOk: enlandskampanj kräver locale OCH land, flerlandskampanj bara locale', () => {
  assert.equal(lankOk(NO, 'https://matstrumpor.se/nb/products/sushi-strumpor?country=NO'), true);
  assert.equal(lankOk(NO, 'https://matstrumpor.se/nb/products/sushi-strumpor'), false);
  assert.equal(lankOk(NO, 'https://matstrumpor.se/products/sushi-strumpor?country=NO'), false);
  assert.equal(lankOk(WW, 'https://matstrumpor.se/en/products/sushi-strumpor'), true);
  assert.equal(lankOk(WW, 'https://matstrumpor.se/nb/products/sushi-strumpor'), false);
  assert.equal(lankOk(NO, ''), false);
});

test('farAktiveras: platshållarbudget, tomt adset eller fel länk stoppar', () => {
  const ok = [{ name: 'a', lank: 'https://matstrumpor.se/nb/products/sushi-strumpor?country=NO' }];
  assert.equal(farAktiveras(NO, ok).ok, true);
  assert.match(farAktiveras(WW, [{ name: 'a', lank: 'https://matstrumpor.se/en/products/sushi-strumpor' }]).skal, /platshållare/);
  assert.match(farAktiveras(NO, []).skal, /inga annonser/);
  assert.match(farAktiveras(NO, [{ name: 'b', lank: 'https://matstrumpor.se/products/sushi-strumpor' }]).skal, /länkar fel/);
});

test('farAktiveras: en given budget med ⛔ "tills Axel granskat" stoppar ändå — och det gör marknader.json i dag', async () => {
  const ok = [{ name: 'a', lank: 'https://matstrumpor.se/nb/products/sushi-strumpor?country=NO' }];
  const vantar = { ...NO, budget_beslut: "Axel 2026-09-27: '1000kr per dag'. ⛔ Förblir PAUSED tills Axel granskat annonserna" };
  assert.match(farAktiveras(vantar, ok).skal, /Axels granskning/);
  // Facit är filen: varje kampanj som ännu inte granskats ska stoppas av spärren.
  const { readFileSync } = await import('node:fs');
  const M = JSON.parse(readFileSync(new URL('../annonser/marknader.json', import.meta.url), 'utf8'));
  for (const [kod, k] of Object.entries(M.kampanjer)) {
    const lank = [{ name: kod, lank: k.lank }];
    assert.equal(farAktiveras(k, lank).ok, false, `${kod} skulle kunna aktiveras: ${k.budget_beslut}`);
  }
});

test('farAktiveras: lansering_stopp stoppar marknaden även med given budget och rätt länkar — Taiwan bär det', async () => {
  const ok = [{ name: 'a', lank: 'https://matstrumpor.com/zh-tw/products/sushi-strumpor?country=TW' }];
  const TW = { locale: 'zh-TW', geo: ['TW'], doman: 'matstrumpor.com', sprakmapp: 'zh-tw', budget_beslut: 'Axel: 1000 kr/dag', lansering_stopp: 'tull-ID i kassan' };
  assert.equal(farAktiveras({ ...TW, lansering_stopp: undefined }, ok).ok, true, 'utan stoppet hade den gått');
  assert.match(farAktiveras(TW, ok).skal, /får inte lanseras än \(tull-ID i kassan\)/);
  const { readFileSync } = await import('node:fs');
  const M = JSON.parse(readFileSync(new URL('../annonser/marknader.json', import.meta.url), 'utf8'));
  assert.match(M.kampanjer.TW.lansering_stopp ?? '', /tull/i, 'Taiwan ska bära stoppet tills Axel sagt annat');
});

test('lankOk: B-kampanjen på egen domän måste gå dit, aldrig till .se', () => {
  const NOB = { locale: 'nb', geo: ['NO'], doman: 'matstrumpor.no' };
  assert.equal(lankOk(NOB, 'https://matstrumpor.no/products/sushi-strumpor?country=NO'), true);
  assert.equal(lankOk(NOB, 'https://matstrumpor.se/nb/products/sushi-strumpor?country=NO'), false);
  assert.equal(lankOk(NOB, 'https://matstrumpor.no/products/sushi-strumpor'), false, 'enlandskampanj kräver landet');
  assert.equal(lankOk(NOB, 'https://www.matstrumpor.no.example.com/products/x?country=NO'), false);
});

test('lankOk: matstrumpor.com bär språkmappen utom för engelskan, /pt-pt/ via sprakmapp, och .se duger inte längre', () => {
  const com = (k) => ({ doman: 'matstrumpor.com', ...k });
  assert.equal(lankOk(com({ locale: 'nb', geo: ['NO'] }), 'https://matstrumpor.com/nb/products/sushi-strumpor?country=NO'), true);
  assert.equal(lankOk(com({ locale: 'nb', geo: ['NO'] }), 'https://matstrumpor.se/nb/products/sushi-strumpor?country=NO'), false);
  assert.equal(lankOk(com({ locale: 'en', geo: ['US'] }), 'https://matstrumpor.com/products/sushi-strumpor?country=US'), true);
  assert.equal(lankOk(com({ locale: 'en', geo: ['GB', 'AU', 'CA', 'NZ'] }), 'https://matstrumpor.com/products/sushi-strumpor'), true);
  assert.equal(lankOk(com({ locale: 'de', geo: ['DE', 'AT', 'CH'] }), 'https://matstrumpor.com/products/sushi-strumpor'), false, 'tyskan kräver /de/');
  assert.equal(lankOk(com({ locale: 'pt', sprakmapp: 'pt-pt', geo: ['PT'] }), 'https://matstrumpor.com/pt-pt/products/sushi-strumpor?country=PT'), true);
  assert.equal(lankOk(com({ locale: 'pt', sprakmapp: 'pt-pt', geo: ['PT'] }), 'https://matstrumpor.com/pt/products/sushi-strumpor?country=PT'), false);
});

test('marknader.json: varje kampanjs länk klarar sin egen kontroll, och allt utland går via matstrumpor.com utom B-sidan', () => {
  const M = JSON.parse(readFileSync(new URL('../annonser/marknader.json', import.meta.url), 'utf8'));
  for (const [kod, k] of Object.entries(M.kampanjer)) {
    assert.equal(lankOk(k, k.lank), true, `${kod}: ${k.lank}`);
    if (kod === 'NOB') assert.ok(k.lank.startsWith('https://matstrumpor.no/'), 'B-sidan i A/B-testet ligger på .no');
    else assert.ok(k.lank.startsWith('https://matstrumpor.com/'), `${kod} länkar inte via .com: ${k.lank}`);
  }
});

test('lankSkillnad: gammal .se-länk i video eller bild ger "länk", rätt länk ger inget', () => {
  const k = { lank: 'https://matstrumpor.com/da/products/sushi-strumpor?country=DK' };
  const video = (l) => ({ video_data: { call_to_action: { type: 'SHOP_NOW', value: { link: l } } } });
  const bild = (l, cta = l) => ({ link_data: { link: l, call_to_action: { type: 'SHOP_NOW', value: { link: cta } } } });
  assert.deepEqual(lankSkillnad(k, video('https://matstrumpor.se/da/products/sushi-strumpor?country=DK')), ['länk']);
  assert.deepEqual(lankSkillnad(k, video(k.lank)), []);
  assert.deepEqual(lankSkillnad(k, bild(k.lank)), []);
  assert.deepEqual(lankSkillnad(k, bild(k.lank, 'https://matstrumpor.se/da/x')), ['länk'], 'knappen räknas också');
  assert.deepEqual(lankSkillnad(k, {}), ['länk'], 'ingen länk alls i annonsen är också fel');
});

test('nob: B-annonsen är A-annonsen utan varumärkesraden, med samma video/bild och rubrik', () => {
  const a = { namn: 'MATSTRUMP_NO_sushi_gift_ugc_001_v1', video: 'klar/NO_nathalie.mp4', title: 'T', message: `Rad ett.\nRad två.\n${VARUMARKESRAD}`, link_description: 'L' };
  const b = tillB(a);
  assert.equal(b.namn, 'MATSTRUMP_NOB_sushi_gift_ugc_001_v1');
  assert.equal(b.video_fran, a.namn);
  assert.equal(b.video, undefined, 'ingen ny uppladdning — samma Meta-video');
  assert.equal(b.message, 'Rad ett.\nRad två.');
  assert.equal(b.title, a.title);
  assert.equal(b.link_description, a.link_description);
  const bild = tillB({ ...a, namn: 'MATSTRUMP_NO_sushi_offer_static_008_v1', video: undefined, bild: 'klar/NO_d3.jpg' });
  assert.equal(bild.bild_fran, 'MATSTRUMP_NO_sushi_offer_static_008_v1');
  assert.throws(() => tillB({ ...a, message: 'Utan raden.' }), /sista raden/);
});

test('--byt-text: bara de fält som skiljer mot annonsens creative byts, video och bild läses rätt', () => {
  const an = { title: 'Rubrik', message: 'Rad 1\nRad 2', link_description: '4 sortes. 1 acheté – 1 offert. Livraison gratuite.' };
  const video = { video_data: { title: 'Rubrik', message: 'Rad 1\nRad 2', link_description: '4 sortes. Achetez-en 1 – Recevez-en 1 GRATUIT. Livraison gratuite.' } };
  assert.deepEqual(textSkillnad(an, video), ['link_description']);
  const bild = { link_data: { name: 'Rubrik', message: 'Rad 1\nRad 2', description: an.link_description } };
  assert.deepEqual(textSkillnad(an, bild), []);
  assert.deepEqual(textSkillnad(an, {}), ['title', 'message', 'link_description']);
});

test('mediaSkillnad: en lånad annons (NOB) som bär A-annonsens GAMLA video eller bild märks, samma media gör det inte', () => {
  assert.deepEqual(mediaSkillnad({ video_id: '2' }, { video_data: { video_id: '1' } }), ['media']);
  assert.deepEqual(mediaSkillnad({ video_id: '1' }, { video_data: { video_id: '1' } }), []);
  assert.deepEqual(mediaSkillnad({ image_hash: 'b' }, { link_data: { image_hash: 'a' } }), ['media']);
  assert.deepEqual(mediaSkillnad({ image_hash: 'a' }, { link_data: { image_hash: 'a' } }), []);
  // Okänt åt något håll ⇒ ingen dom (hellre en tom jämförelse än en creative byggd på gissning).
  assert.deepEqual(mediaSkillnad(undefined, { video_data: { video_id: '1' } }), []);
  assert.deepEqual(mediaSkillnad({ video_id: '1' }, {}), []);
});

test('--byt-text byter också sidan: utlandsannonserna visas som sidan Matstrumpor, aldrig Matstrumpor.se', () => {
  const M = JSON.parse(readFileSync(new URL('../annonser/marknader.json', import.meta.url), 'utf8'));
  // Axel 2026-09-29 kväll: sidan 1285064981363590 "Matstrumpor". 820358954504320 är Matstrumpor.se (Sverige).
  assert.equal(M.sida, '1285064981363590');
  assert.notEqual(M.sida, '820358954504320');
  assert.notEqual(M.instagram_user_id, '17841479011543544', 'Instagram-kontot matstrumpor.se visar .se');
  const gammal = { page_id: '820358954504320', instagram_user_id: '17841479011543544', video_data: {} };
  assert.deepEqual(identitetSkillnad(M, gammal), ['sida', 'instagram']);
  assert.deepEqual(identitetSkillnad(M, { page_id: M.sida, instagram_user_id: M.instagram_user_id }), []);
  assert.deepEqual(identitetSkillnad(M, {}), ['sida', 'instagram']);
});

test('regionalFalt: Taiwan skickar TAIWAN_UNIVERSAL, identiteterna bara när id:na finns, andra marknader inget', async () => {
  const M = JSON.parse(readFileSync(new URL('../annonser/marknader.json', import.meta.url), 'utf8'));
  // Mätt 2026-09-30: utan kategorin 400 "Värde för regionalt reglerade kategorier krävs".
  assert.deepEqual(JSON.parse(regionalFalt(M.kampanjer.TW).regional_regulated_categories), ['TAIWAN_UNIVERSAL']);
  assert.equal(regionalFalt({ regional_regulated_categories: ['TAIWAN_UNIVERSAL'], regional_regulation_identities: { taiwan_universal_beneficiary: null, taiwan_universal_payer: null } }).regional_regulation_identities, undefined);
  const med = regionalFalt({ regional_regulated_categories: ['TAIWAN_UNIVERSAL'], regional_regulation_identities: { taiwan_universal_beneficiary: '111', taiwan_universal_payer: '222' } });
  assert.deepEqual(JSON.parse(med.regional_regulation_identities), { taiwan_universal_beneficiary: '111', taiwan_universal_payer: '222' });
  for (const kod of ['NO', 'US', 'DE', 'JP']) assert.deepEqual(regionalFalt(M.kampanjer[kod]), {}, kod);
});

test('arVerifieringsfel: Metas svar om verifierad annonsör känns igen, andra fel släpps igenom', () => {
  assert.ok(arVerifieringsfel('Meta 400: Invalid parameter — Annonsör saknas: ange verifierad annonsör så att annonser i annonsuppsättningen kan levereras till målgrupper i Taiwan.'));
  assert.ok(arVerifieringsfel('Meta 400: Invalid parameter — Värde för regionalt reglerade kategorier krävs.'));
  assert.ok(arVerifieringsfel('Meta 400: Invalid parameter — Beneficiary is missing'));
  assert.equal(arVerifieringsfel('Meta 400: (#100) Invalid parameter — pixel_id'), false);
});
