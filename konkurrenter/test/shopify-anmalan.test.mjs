// Shopify-anmälan (MatSokker 2026-10-01): måttet, paren, fälten, kortet och Cowork-avsnittet. Inget nät, ingen ffmpeg.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { raknaTraffar, arBevisad, valjBildpar, cropUttryck, byggShopifyAnmalan, kontrolleraShopify, shopifyText, shopifyCowork, shopifyBevisHtml, SHOPIFY_FORMULAR, TRAFF_MIN } from '../shopify-anmalan.mjs';
import { kortShopify, attGora, statusFor, byggGranskning, sammanfattning } from '../granskning.mjs';
import { beskrivning500 } from '../anmal-skicka.mjs';

// 64-bitars hashar som hex-strängar (klipp.mjs avstand räknar på hex). Ett bitbyte = 1/64.
const H = (n) => n.toString(16).padStart(16, '0');
const ruta = (i, hash, kontrast = 30) => ({ i, t: i / 4, hash, kontrast });

test('raknaTraffar: identiska rutor räknas, platta rutor aldrig, andelen och sekunderna stämmer', () => {
  const deras = [ruta(0, H(0x0f0f0f0f0f0f0f0fn)), ruta(4, H(0xff00ff00ff00ff00n)), ruta(8, H(0x123456789abcdef0n)), ruta(9, H(0n), 2)];
  const vara = [ruta(20, H(0x0f0f0f0f0f0f0f0en)), ruta(24, H(0xff00ff00ff00ff00n)), ruta(30, H(0xfedcba9876543210n))];
  const m = raknaTraffar(deras, vara);
  assert.equal(m.antal, 3, 'den platta rutan räknas inte');
  assert.equal(m.traffar.length, 2);
  assert.deepEqual(m.traffar.map((x) => [x.i, x.egenI, x.avstand]), [[0, 20, 1], [4, 24, 0]]);
  assert.equal(m.sekunder, 2);
  assert.equal(arBevisad(m), false, `${TRAFF_MIN} träffar krävs`);
  assert.equal(arBevisad({ traffar: [1, 2, 3].map((t) => ({ t })), sekunder: 3, andel: 0.65 }), true);
  assert.equal(arBevisad({ traffar: [1, 2, 3].map((t) => ({ t })), sekunder: 1, andel: 0.65 }), false, 'tre rutor ur samma sekund räcker inte');
});

test('valjBildpar: tre par ur olika sekunder, bästa avståndet i varje', () => {
  const traffar = [0, 0.25, 1, 2, 2.5, 3, 4, 5, 6].map((t, k) => ({ i: k, t, egenI: 100 + k, avstand: t === 2.5 ? 0 : 3 }));
  const par = valjBildpar(traffar);
  assert.equal(par.length, 3);
  assert.equal(new Set(par.map((p) => Math.floor(p.t))).size, 3);
  assert.deepEqual(par.map((p) => Math.floor(p.t)), [0, 3, 6]);
  assert.equal(valjBildpar(traffar.filter((x) => x.t === 2 || x.t === 2.5)).length, 1, 'en sekund ger ett par');
  assert.equal(valjBildpar(traffar.filter((x) => x.t === 2 || x.t === 2.5))[0].avstand, 0, 'bästa avståndet inom sekunden');
});

test('cropUttryck: kvadraten tas ur topp, mitt eller botten av den stående filmen', () => {
  assert.match(cropUttryck('topp'), /:0$/);
  assert.match(cropUttryck('mitt'), /\(ih-min\(iw\\,ih\)\)\/2$/);
  assert.match(cropUttryck('botten'), /ih-min\(iw\\,ih\)$/);
});

const ARENDE = { id: 'KD-2026-099', verksamhet: 'Matstrumpor', deras: { sidnamn: 'Kopian', sidaId: '1', doman: 'kopian.shop' }, var: { produkt: { titel: 'Sushi-Strumpor', url: 'https://matstrumpor.se/products/sushi-strumpor', butik: 'https://matstrumpor.se' } } };
const KONFIG = { brev: { foretag: { namn: 'Stonebite Ecom AB', orgnr: '559576-2401', adress: 'Stenkolsgatan 1B, 417 07 Göteborg' } }, anmalan: { undertecknare: { namn: 'Test Testsson', roll: 'CEO', epost: 'test@example.com', adress: 'Stenkolsgatan 1B, 417 07 Göteborg, Sweden' } } };
const MATT = { traffar: Array.from({ length: 20 }, (_, k) => ({ t: k / 3 })), antal: 26, andel: 20 / 26, sekunder: 7 };

function bygg(over = {}) {
  return byggShopifyAnmalan({ arende: ARENDE, konfig: KONFIG, sida: 'https://kopian.shop/products/sushi-sokker', fil: 'https://cdn.shopify.com/files/gif2.gif', film: { namn: '09-17 Nathalie captions musik', skapad: '2026-09-17T12:00:00+0200' }, matt: MATT, beskarning: 'mitt', original: ['https://www.facebook.com/ads/library/?id=2127001151229429'], bevisbildUrl: 'https://cdn.shopify.com/files/bevis.png', nu: '2026-10-01T12:00:00Z', ...over });
}

test('byggShopifyAnmalan: fälten på engelska, butiken med namn, inget saknas', () => {
  const an = bygg();
  assert.deepEqual(an.fel, []);
  assert.equal(an.formular, SHOPIFY_FORMULAR);
  assert.equal(an.falt.butik, 'https://kopian.shop');
  assert.deepEqual(an.falt.sidor, ['https://kopian.shop/products/sushi-sokker', 'https://cdn.shopify.com/files/gif2.gif']);
  assert.match(an.falt.verk, /our store Matstrumpor \(matstrumpor\.se\)/);
  assert.match(an.falt.verk, /20 of its 26 sampled frames are identical/);
  assert.match(an.falt.verk, /published by us on 17 September 2026/);
  assert.equal(an.falt.foretag, 'Stonebite Ecom AB (reg. no. 559576-2401)');
  assert.deepEqual(an.falt.original, ['https://www.facebook.com/ads/library/?id=2127001151229429', 'https://matstrumpor.se/products/sushi-strumpor']);
  assert.equal(an.forsakringar.length, 2);
  assert.match(shopifyText(an), /Statements:\n- I have a good faith belief/);
});

test('kontrolleraShopify: ett mått som inte räcker och saknade fält stoppar', () => {
  const svag = bygg({ matt: { traffar: [{ t: 0 }, { t: 0.25 }], antal: 26, andel: 2 / 26, sekunder: 1 } });
  assert.ok(svag.fel.some((f) => /måttet räcker inte/.test(f)));
  const utanNamn = bygg({ konfig: { ...KONFIG, anmalan: { undertecknare: {} } } });
  assert.ok(utanNamn.fel.includes('ditt namn saknas'));
  assert.ok(kontrolleraShopify({ ...bygg(), falt: { ...bygg().falt, original: [] } }).includes('länken till vårt original saknas'));
});

test('shopifyCowork: formuläret, aldrig ett nytt konto, stopp vid säkerhetskontroll och vid fält som saknas', () => {
  const t = shopifyCowork({ arende: 'KD-2026-099', an: bygg() });
  assert.match(t, /KD-2026-099 · SHOPIFY-ANMÄLAN \(butiken https:\/\/kopian\.shop\)/);
  assert.match(t, /Skapa aldrig ett nytt konto/);
  assert.match(t, /säkerhetskontroll: STANNA/);
  assert.match(t, /STANNA och fråga Axel/);
  assert.match(t, /Electronic signature: Test Testsson/);
});

test('shopifyBevisHtml: rutorna sida vid sida, och sidans text kan inte bryta sig ur HTML:en', () => {
  const html = shopifyBevisHtml({ sida: 'https://kopian.shop/<script>', bild: 'x', film: { namn: 'Film "1"', skapad: '2026-09-17' }, par: [{ egen: 'data:a', deras: 'data:b', t: 2.25, egenT: 5.25, avstand: 2 }], matt: MATT, beskarning: 'mitt', butik: 'kopian.shop' });
  assert.ok(!html.includes('<script>'));
  assert.match(html, /Ours · 0:05\.25/);
  assert.match(html, /Theirs · 0:02\.25/);
  assert.match(html, /20 of the 26 sampled frames/);
});

test('kortShopify + attGora: Ja på kortets version ger Shopify i Cowork-prompten, kvittot stänger det', () => {
  const an = bygg();
  const k = kortShopify({ status: 'utkast' }, an, { bild: 'bilder/bevis-shopify.jpg' });
  assert.equal(k.typ, 'shopify');
  assert.equal(k.nyckel, 'shopify');
  assert.ok(k.falt.some((f) => f.etikett === 'Vårt verk' && /20 of its 26/.test(f.varde)));
  const g = byggGranskning({ a: ARENDE, kort: [k] });
  assert.equal(attGora({ granskning: g, beslut: { svar: { shopify: { svar: 'ja', version: k.version } } }, status: { kort: {} } }).shopify, true);
  assert.equal(attGora({ granskning: g, beslut: { svar: { shopify: { svar: 'ja', version: 'gammal' } } }, status: { kort: {} } }).shopify, false, 'ett ja på en äldre version gäller inte');
  const status = statusFor({ ...ARENDE, shopify: { status: 'inskickad', inskickad: '2026-10-02T09:00:00Z', referens: 'SH-1' } });
  assert.deepEqual(status.kort.shopify, { lage: 'inskickad', referens: 'SH-1', nar: '2026-10-02T09:00:00Z' });
  assert.equal(attGora({ granskning: g, beslut: { svar: { shopify: { svar: 'ja', version: k.version } } }, status }).shopify, false, 'aldrig två gånger');
});

test('beskrivning500: en bildannons är en annonsbild, inte en stillbild ur en video — och en delbild säger att texten är omsatt', () => {
  const bas = { arende: 'KD-2026-099', nr: 1, antal: 2, bevisbildUrl: 'https://cdn/x.png' };
  const hel = beskrivning500({ ...bas, falt: { contentDescription: 'This advertisement … 1 image in the ad is our own copyrighted advertising image — a still frame or photo taken from our own ad. It copies our ad "A" for the product "P", which …' } });
  assert.match(hel, /It uses our own advertising image, identical to the image in our ad\./);
  assert.doesNotMatch(hel, /still frame from our ad video/);
  const del = beskrivning500({ ...bas, falt: { contentDescription: 'This advertisement … The ad\'s image is our own advertising image with its text re-set in another language: the picture under the text is identical to our ad (perceptual-hash comparison of that part: distance 2/64, fine check 20/256). It copies our ad "D4" for the product "P", which …' } });
  assert.match(del, /^Its image is our own advertising image with the text re-set in another language/);
  assert.ok(del.length <= 500);
  // 036 och d3 (7–8/64): anmälan säger "near-identical", då säger de 500 tecknen och kortet aldrig "identical".
  const nara = beskrivning500({ ...bas, falt: { contentDescription: 'This advertisement … 1 image in the ad is our own copyrighted advertising image — a still frame or photo taken from our own ad (perceptual-hash comparison: near-identical, distance 7/64). It copies our ad "036" for the product "P", which …' } });
  assert.match(nara, /It uses our own advertising image, nearly identical to the image in our ad\./);
  const blandat = beskrivning500({ ...bas, falt: { contentDescription: 'This advertisement … 2 images in the ad are our own copyrighted advertising images — a still frame or photo taken from our own ad (perceptual-hash comparison: identical, distance 0/64; near-identical, distance 7/64). It copies our ad "A" …' } });
  assert.match(blandat, /It uses our own advertising image, identical to the image in our ad\./, 'en identisk bild bär ordet');
  assert.match(sammanfattning({ falt: { contentDescription: 'x 1 image in the ad is our own copyrighted advertising image — … (perceptual-hash comparison: near-identical, distance 8/64).' } }), /nästan identisk/);
  assert.doesNotMatch(sammanfattning({ falt: { contentDescription: 'x 1 image in the ad is our own copyrighted advertising image — … (perceptual-hash comparison: identical, distance 0/64).' } }), /nästan/);
});
