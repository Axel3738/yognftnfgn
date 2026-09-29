// Tester för Konkurrentdödaren — utan nät, utan Chromium, utan brevlåda.
// Det som kräver nätet (Bing, Meta, Shopify, Chromium) körs mot falska
// fetch-funktioner med de former som mättes 2026-09-27.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { normalisera, ord, gemensammaPassager, jamforText, hamming, jamforBilder, sammanvag, arGenerisk } from '../likhet.mjs';
import { textUrHtml, handleUr, meningar, fingeravtryck, valjProdukter, textUrAnnons, bildUrAnnons, hamtaProdukter, hamtaEgnaAnnonser, hamtaAnnonssidor, egnaDomaner } from '../korpus.mjs';
import { bingUrl, tolkaRss, filtreraTraffar, arEgen, arIgnorerad, sokAdLibrary, sokBing, adLibraryLank } from '../sok.mjs';
import { plockaEpost, plockaOrgnr, upptackPlattform, shopifyJsonUrl, plockaBilder, valjMottagare, hamtaKonkurrent, arIntressantBildUrl } from '../hamta.mjs';
import { STATUS, lasArenden, sparaArende, nyttId, nyckelFor, hittaBefintligt, overgang, nyttArende, uppdateraFynd, oppna } from '../arenden.mjs';
import { valjSprak, byggBrev, bevisrader, kontrolleraBrev, fristText } from '../brev.mjs';
import { skickaBrev, kontrolleraForeSandning, SPARR_ENV, byggSandpaket, registreraSkickat } from '../skicka.mjs';
import { fakturanummer, belopp, fakturarader, byggFaktura, kontrolleraFaktura, fakturaText, fakturaHtml } from '../faktura.mjs';
import { tolkaAnnonsinput, jamforAnnons, byggAnnonsfynd } from '../annonsfall.mjs';
import { rapportSv, rapportEn, arendeMd, kallrader } from '../rapport.mjs';
import { byggSida } from '../sida.mjs';
import { gissaTyp, Bildcache } from '../bild.mjs';

const KONFIG = JSON.parse(readFileSync(new URL('../konfig.json', import.meta.url), 'utf8'));
const FORETAG = KONFIG.brev.foretag;

const VAR_TEXT = `Taket är det du aldrig ser – och det som kostar mest att laga. Regnet, löven och fågelskiten hamnar på taket, och det är precis den ytan du inte går upp och kollar. Vattnet står kvar kring takluckor och skarvar hela vintern, och tätmassan mjuknar. Den dag fukten är inne i taket räcker det inte med en tvätt till våren. Då är det en reparation. Täck bara taket – inte hela vagnen. Ett helöverdrag är tungt att få på plats ensam och sitter och skaver mot lacken hela vintern. Fri frakt inom Sverige och 14 dagars ångerrätt enligt lag.`;
const DERAS_KOPIA = `Välkommen till vår butik! Regnet, löven och fågelskiten hamnar på taket, och det är precis den ytan du inte går upp och kollar. Vattnet står kvar kring takluckor och skarvar hela vintern, och tätmassan mjuknar. Köp nu för 899 kr. Fri frakt inom Sverige och 14 dagars ångerrätt enligt lag.`;
const DERAS_EGEN = `Vårt taköverdrag för husvagn är tillverkat i slitstark väv och skyddar mot regn, snö och UV-strålning under vintern. Enkel montering med spännband. Passar de flesta husvagnar upp till 7 meter. Fri frakt inom Sverige och 14 dagars ångerrätt enligt lag.`;

// ------------------------------------------------------------------ likhet

test('normalisera och ord: HTML bort, typografi normaliserad, korta tecken bort', () => {
  assert.equal(normalisera('<p>Taket &amp; “skarvar” – hela&nbsp;vintern</p>'), 'taket & "skarvar" - hela vintern');
  assert.deepEqual(ord('Taket är det du aldrig ser – 210D-väv!'), ['taket', 'är', 'det', 'du', 'aldrig', 'ser', '210d-väv']);
});

test('gemensammaPassager hittar det kopierade stycket och inte den generiska raden', () => {
  const p = gemensammaPassager(ord(VAR_TEXT), ord(DERAS_KOPIA), { minOrd: 8 });
  assert.ok(p.length >= 1);
  assert.ok(p[0].ord >= 20, `längsta sviten ${p[0].ord} ord`);
  assert.match(p[0].text, /^regnet löven och fågelskiten/);
  // Generiska fraser räknas inte som bevis
  assert.equal(arGenerisk('fri frakt inom sverige och 14 dagars ångerrätt enligt lag', KONFIG.generiska_fraser), true);
  assert.equal(arGenerisk(p[0].text, KONFIG.generiska_fraser), false);
});

test('jamforText: kopian blir stark, en egen text om samma produkt blir ingenting', () => {
  const kopia = jamforText(VAR_TEXT, DERAS_KOPIA, { trosklar: KONFIG.trosklar.text, generiska: KONFIG.generiska_fraser });
  assert.equal(kopia.styrka, 'stark');
  assert.ok(kopia.tackning > 0.2, `täckning ${kopia.tackning}`);
  assert.ok(kopia.passager.every((x) => !/fri frakt/.test(x.text)), 'den generiska raden är inte en passage');
  const egen = jamforText(VAR_TEXT, DERAS_EGEN, { trosklar: KONFIG.trosklar.text, generiska: KONFIG.generiska_fraser });
  assert.equal(egen.styrka, null);
  assert.equal(egen.langsta, 0, 'fri frakt-raden räknas inte');
  assert.equal(jamforText('', DERAS_KOPIA).styrka, null);
});

test('hamming, jamforBilder och sammanvag: varje bild paras högst en gång, identisk ≤ 6, lik ≤ 12', () => {
  assert.equal(hamming('0000000000000000', '0000000000000003'), 2);
  assert.equal(hamming('xyz', '0000000000000000'), 64, 'ogiltig hash är aldrig lik');
  const par = jamforBilder(
    [{ url: 'a', hash: 'dededf3deee31cc0' }, { url: 'b', hash: '07f40787cd5503fd' }],
    [{ url: 'x', hash: 'dededf3dace31cc0' }, { url: 'y', hash: 'dededf2deee31cc0' }, { url: 'z', hash: 'ffffffffffffffff' }],
    KONFIG.trosklar.bild,
  );
  assert.equal(par.length, 1, 'a paras med sin närmaste, b har ingen inom gränsen');
  assert.equal(par[0].egen, 'a'); assert.equal(par[0].grad, 'identisk');
  assert.equal(sammanvag({ text: null, bilder: [par[0]] }).styrka, 'trolig');
  assert.equal(sammanvag({ text: null, bilder: [par[0], { ...par[0], egen: 'b', deras: 'y' }] }).styrka, 'stark');
  const v = sammanvag({ text: { styrka: 'trolig', kopieradeOrd: 12, langsta: 12, tackning: 0.1 }, bilder: [par[0]] });
  assert.equal(v.styrka, 'stark');
  assert.equal(v.skal.length, 2);
  assert.match(v.skalEn[0], /copied verbatim/);
  assert.equal(sammanvag({}).styrka, null);
});

// ------------------------------------------------------------------ korpus

test('textUrHtml, handleUr, meningar och fingeravtryck (7–16 ord, inga siffror, inget butiksnamn)', () => {
  assert.equal(textUrHtml('<h3>Taket</h3><p>Regnet &amp; löven.<br>Nästa rad</p>'), 'Taket\nRegnet & löven.\nNästa rad');
  assert.equal(handleUr('https://x.se/nb/products/Tak%C3%B6verdrag-1?variant=2'), 'taköverdrag-1');
  assert.equal(handleUr('https://x.se/pages/spara'), null);
  assert.ok(meningar(VAR_TEXT).length >= 6);
  const f = fingeravtryck(VAR_TEXT, { antal: 2, undvik: ['Bäverbutiken'] });
  assert.equal(f.length, 2);
  for (const x of f) { const n = x.split(/\s+/).length; assert.ok(n >= 7 && n <= 16, x); assert.doesNotMatch(x, /\d/); assert.doesNotMatch(x, /[.!?]$/); }
  assert.deepEqual(fingeravtryck('Bäverbutiken säljer det här överdraget till alla som vill ha det.', { undvik: ['Bäverbutiken'] }), [], 'butiksnamnet stoppar');
  assert.deepEqual(fingeravtryck('Kort.'), []);
});

test('valjProdukter: annonserade först, nyss kollade hoppas, rotation på äldst kollad', () => {
  const p = (h) => ({ butik: 'https://b.se', handle: h, titel: h, text: 'x', bilder: [] });
  const nu = Date.parse('2026-09-27T06:00:00Z');
  const lage = { kollade: { 'https://b.se|a': '2026-09-26T06:00:00Z', 'https://b.se|c': '2026-09-01T06:00:00Z', 'https://b.se|d': '2026-09-26T06:00:00Z' } };
  const val = valjProdukter({ produkter: [p('a'), p('b'), p('c'), p('d'), p('e')], annonserade: new Set(['d']), bevaka: ['A'], lage, max: 3, kollaOmDagar: 5, nu });
  assert.deepEqual(val.map((x) => x.handle), ['a', 'd', 'b'], 'a (bevakad, äldst av prio) och d (annonserad) först, sedan b (aldrig kollad); c/e ryms inte, a:s nyliga koll räknas inte mot prio');
  assert.equal(val[0].prioriterad, true); assert.equal(val[2].prioriterad, false);
  const val2 = valjProdukter({ produkter: [p('a'), p('b'), p('c')], lage, max: 5, kollaOmDagar: 5, nu });
  assert.deepEqual(val2.map((x) => x.handle), ['b', 'c'], 'a kollades i går och hoppas utan prio');
});

test('textUrAnnons/bildUrAnnons läser alla tre creative-formerna', () => {
  assert.equal(textUrAnnons({ body: 'A', object_story_spec: { link_data: { message: 'B' } } }), 'A');
  assert.equal(textUrAnnons({ object_story_spec: { video_data: { message: 'V' } } }), 'V');
  assert.equal(textUrAnnons({ asset_feed_spec: { bodies: [{ text: 'F' }] } }), 'F');
  assert.equal(bildUrAnnons({ object_story_spec: { video_data: { image_url: 'https://i/v.jpg' } } }), 'https://i/v.jpg');
});

test('hamtaProdukter bläddrar tills sidan är kort och bygger produktraderna', async () => {
  const sida = (n, fran) => ({ products: Array.from({ length: n }, (_, i) => ({ handle: `P${fran + i}`, title: `Produkt ${fran + i}`, body_html: '<p>Text</p>', images: [{ src: 'https://cdn/x.png' }, { src: 'https://cdn/x.png' }], variants: [{ price: '99.00', compare_at_price: null }], updated_at: 't' })) });
  const anrop = [];
  const fetchFn = async (url) => { anrop.push(url); const p = Number(new URL(url).searchParams.get('page')); return { ok: true, status: 200, json: async () => (p === 1 ? sida(250, 0) : sida(3, 250)) }; };
  const r = await hamtaProdukter('https://b.se/', { fetchFn });
  assert.equal(r.length, 253); assert.equal(anrop.length, 2);
  assert.equal(r[0].handle, 'p0'); assert.equal(r[0].url, 'https://b.se/products/P0'); assert.deepEqual(r[0].bilder, ['https://cdn/x.png']); assert.equal(r[0].pris, '99.00');
  await assert.rejects(() => hamtaProdukter('https://b.se', { fetchFn: async () => ({ ok: false, status: 404 }) }), /HTTP 404/);
});

test('hamtaAnnonssidor: "reduce the amount of data" halverar sidan, prefixet filtrerar delade konton', async () => {
  const loggar = [];
  const klient = { get: async (u) => {
    const limit = Number(u.match(/limit=(\d+)/)[1]);
    if (limit > 25) { const e = new Error('Meta'); e.meta = { code: 1, message: "Please reduce the amount of data you're asking for, then retry your request" }; throw e; }
    return { data: [
      { id: '1', name: 'CaraShellRoof_PD_1_H1', campaign: { name: 'CARASHELL_SE_Tak' }, creative: { body: 'Vår text', object_story_spec: { link_data: { link: 'https://carashell.se/products/takskyddet' } } } },
      { id: '2', name: 'Annan_1', campaign: { name: 'HEIMGUARD_SE' }, creative: { body: 'Annan' } },
    ], paging: {} };
  } };
  const rader = await hamtaAnnonssidor(klient, 'act_1', { limit: 50, logg: (s) => loggar.push(s) });
  assert.equal(rader.length, 2); assert.equal(loggar.length, 1);
  const r = await hamtaEgnaAnnonser([{ id: '1', namn: 'OPS', prefix: 'CARASHELL_' }], { klient, sov: async () => {} });
  assert.equal(r.annonser.length, 1); assert.equal(r.annonser[0].handle, 'takskyddet'); assert.equal(r.annonser[0].text, 'Vår text');
  assert.equal(r.status[0].annonser, 1);
});

test('egnaDomaner tar med konfig, spårningsregistret och kommentarernas domäner', () => {
  const d = egnaDomaner(KONFIG);
  for (const x of ['baverbutiken.se', 'carashell.com', 'matstrumpor.se', 'beverbutikken.no', 'majavakauppa.fi']) assert.ok(d.includes(x), x);
});

// ------------------------------------------------------------------ sök

test('Bing: adressen citerar frasen, RSS:en tolkas, egna och ignorerade domäner faller bort', async () => {
  const u = new URL(bingUrl('Taket är "det" du ser', { antal: 8 }));
  assert.equal(u.searchParams.get('q'), '"Taket är det du ser"'); assert.equal(u.searchParams.get('format'), 'rss');
  const xml = `<?xml version="1.0"?><rss version="2.0"><channel><title>Bing: x</title><item><title><![CDATA[Kopian &amp; co]]></title><link>https://www.kopian.se/products/tak?x=1</link><description>Regnet &amp; l&#246;ven</description></item><item><title>Vår</title><link>https://baverbutiken.se/products/tak</link></item><item><title>Amazon</title><link>https://www.amazon.se/dp/1</link></item><item><title>Dubbel</title><link>https://kopian.se/products/tak</link></item></channel></rss>`;
  const traffar = tolkaRss(xml);
  assert.equal(traffar.length, 4); assert.equal(traffar[0].titel, 'Kopian & co'); assert.equal(traffar[0].beskrivning, 'Regnet & löven');
  const f = filtreraTraffar(traffar.map((t) => ({ ...t, doman: new URL(t.url).hostname.replace(/^www\./, '') })), { egna: ['baverbutiken.se'], ignorera: KONFIG.ignorera_domaner });
  assert.equal(f.kvar.length, 1); assert.equal(f.egna, 1); assert.equal(f.ignorerade, 1);
  assert.equal(arEgen('shop.carashell.com', ['carashell.com']), true);
  assert.equal(arIgnorerad('amazon.co.uk', ['amazon.']), true);
  assert.equal(arIgnorerad('notamazon.se', ['amazon.']), false);
  const s = await sokBing('x', { fetchFn: async () => ({ ok: true, status: 200, text: async () => '<html>captcha</html>' }) });
  assert.match(s.fel, /ingen RSS/);
});

test('Ad Library: 2332002 blir "saknar behörighet" med Axels steg; ett ok-svar mappas och egna sidor sorteras bort', async () => {
  const nekad = await sokAdLibrary('tak', { token: 't', fetchFn: async () => ({ json: async () => ({ error: { message: 'Application does not have permission for this action', type: 'OAuthException', code: 10, error_subcode: 2332002, error_user_msg: 'För att få åtkomst till API måste du följa stegen på facebook.com/ads/library/api.' } }) }) });
  assert.equal(nekad.status, 'saknar_behorighet'); assert.match(nekad.hjalp, /facebook\.com\/ID/);
  const ok = await sokAdLibrary('tak', { token: 't', egnaSidor: new Set(['678639638662543']), fetchFn: async (u) => { assert.match(u, /ads_archive\?/); assert.match(decodeURIComponent(u), /ad_reached_countries=\["SE","NO"\]/); return { json: async () => ({ data: [
    { id: 'a1', page_id: 678639638662543, page_name: 'Bäverbutiken.se', ad_creative_bodies: ['vår'], ad_creative_link_captions: ['baverbutiken.se'] },
    { id: 'a2', page_id: 999, page_name: 'Kopian', ad_creative_bodies: ['Regnet, löven och fågelskiten'], ad_creative_link_titles: ['Tak'], ad_creative_link_captions: ['KOPIAN.SE'], ad_snapshot_url: 'https://www.facebook.com/ads/archive/render_ad/?id=a2', ad_delivery_start_time: '2026-09-20' },
  ] }) }; }, lander: ['SE', 'NO'] });
  assert.equal(ok.status, 'ok'); assert.equal(ok.annonser.length, 1);
  assert.deepEqual(ok.annonser[0].domaner, ['kopian.se']); assert.equal(ok.annonser[0].sidaId, '999');
  assert.equal((await sokAdLibrary('tak', { token: '' })).status, 'saknar_token');
  assert.match(adLibraryLank('taköverdrag husvagn', 'SE'), /country=SE&q=tak%C3%B6verdrag%20husvagn/);
});

// ------------------------------------------------------------------ hämta

test('plockaEpost, plockaOrgnr, upptackPlattform, shopifyJsonUrl, valjMottagare', () => {
  const html = '<a href="mailto:Info@Kopian.se">mejla</a> kontakt [at] kopian.se · noreply@kopian.se · bild@2x.png · hej@baverbutiken.se · x@example.com · order&#64;kopian.se';
  assert.deepEqual(plockaEpost(html, { egna: ['baverbutiken.se'] }).sort(), ['info@kopian.se', 'kontakt@kopian.se', 'order@kopian.se']);
  assert.deepEqual(plockaOrgnr('Org.nr 559576-2401. CVR: 12345678. Org.nr: 987 654 321 MVA. Y-tunnus: 1234567-8').map((o) => o.typ), ['SE', 'NO', 'DK', 'FI']);
  assert.equal(upptackPlattform('<script src="https://cdn.shopify.com/s/x.js">'), 'shopify');
  assert.equal(upptackPlattform('<link href="/wp-content/plugins/woocommerce/x.css">'), 'woocommerce');
  assert.equal(shopifyJsonUrl('https://kopian.se/nb/products/tak-1?variant=9'), 'https://kopian.se/products/tak-1.json');
  assert.equal(shopifyJsonUrl('https://kopian.se/pages/om'), null);
  assert.equal(valjMottagare(['x@gmail.com', 'info@kopian.se', 'support@kopian.se'], 'www.kopian.se'), 'info@kopian.se');
  assert.equal(valjMottagare(['x@gmail.com', 'butik@annan.se'], 'kopian.se'), 'butik@annan.se');
  assert.equal(valjMottagare([], 'kopian.se'), null);
  assert.equal(arIntressantBildUrl('https://cdn/logo.svg'), false); assert.equal(arIntressantBildUrl('https://cdn/files/payment-icons.png'), false); assert.equal(arIntressantBildUrl('https://cdn/files/tak-1.jpg?v=1'), true);
  const bilder = plockaBilder('<meta property="og:image" content="/og.jpg"><img src="/a.jpg" srcset="/a-200.jpg 200w, /a-800.jpg 800w"><img data-src="/b.png"><img src="/icons/logo.png">', 'https://kopian.se/products/x');
  assert.deepEqual(bilder, ['https://kopian.se/og.jpg', 'https://kopian.se/a.jpg', 'https://kopian.se/a-800.jpg', 'https://kopian.se/b.png']);
});

test('hamtaKonkurrent: Shopify-produkt via JSON, kort JSON-text faller tillbaka på sidan, kontaktsidan ger mottagaren', async () => {
  const svar = (html, typ = 'text/html', status = 200) => ({ ok: status < 300, status, url: '', headers: { get: () => typ }, text: async () => html });
  const fetchFn = async (url) => {
    if (url === 'https://kopian.se/products/tak') return svar(`<html lang="sv"><head><title>Tak – Kopian</title></head><body><main><h1>Tak</h1><p>${DERAS_KOPIA}</p><img src="https://cdn.shopify.com/s/files/1/k/tak.jpg"></main><footer>Kopian AB</footer><script src="https://cdn.shopify.com/s/x.js"></script></body></html>`);
    if (url === 'https://kopian.se/products/tak.json') return svar(JSON.stringify({ product: { title: 'Tak', body_html: '<p>Kort text.</p>', images: [{ src: 'https://cdn.shopify.com/s/files/1/k/tak.jpg' }, { src: 'https://cdn.shopify.com/s/files/1/k/tak2.jpg' }], variants: [{ price: '899.00' }], vendor: 'Kopian' } }), 'application/json');
    if (url === 'https://kopian.se/pages/contact') return svar('<p>Mejla oss: info@kopian.se · Org.nr 556677-8899</p>');
    return svar('', 'text/html', 404);
  };
  const k = await hamtaKonkurrent('https://kopian.se/products/tak', { fetchFn, egna: ['baverbutiken.se'] });
  assert.equal(k.ok, true); assert.equal(k.plattform, 'shopify'); assert.equal(k.lang, 'sv'); assert.equal(k.titel, 'Tak – Kopian');
  assert.equal(k.produkt.titel, 'Tak'); assert.equal(k.produkt.pris, '899.00');
  assert.match(k.text, /Regnet, löven/, 'JSON-texten var för kort — sidans huvudtext används');
  assert.doesNotMatch(k.text, /Kopian AB/, 'sidfoten räknas inte');
  assert.deepEqual(k.bilder.slice(0, 2), ['https://cdn.shopify.com/s/files/1/k/tak.jpg', 'https://cdn.shopify.com/s/files/1/k/tak2.jpg']);
  assert.equal(k.mottagare, 'info@kopian.se'); assert.deepEqual(k.orgnr, [{ typ: 'SE', nr: '556677-8899' }]);
  assert.deepEqual(k.kontakt.kallor, ['https://kopian.se/pages/contact']);
  const borta = await hamtaKonkurrent('https://kopian.se/borta', { fetchFn, medKontakt: false });
  assert.equal(borta.ok, false); assert.equal(borta.status, 404);
});

// ------------------------------------------------------------------ ärenden

test('ärenden: id per år, nyckel, logg där senaste raden vinner, övergångar och spärren mot rutinen', () => {
  const dir = mkdtempSync(join(tmpdir(), 'kd-'));
  const fil = join(dir, 'arenden.jsonl');
  const arenden = lasArenden(fil);
  assert.equal(nyttId(arenden, new Date('2026-09-27')), 'KD-2026-001');
  const nyckel = nyckelFor({ typ: 'webb', doman: 'www.Kopian.se', handle: 'tak' });
  assert.equal(nyckel, 'webb|doman:kopian.se|tak');
  const a = nyttArende({ id: 'KD-2026-001', nyckel, verksamhet: 'Bäverbutiken', typ: 'webb', var: { produkt: { handle: 'tak', titel: 'Tak' } }, deras: { doman: 'kopian.se', url: 'https://kopian.se/products/tak' }, bevis: {}, styrka: 'stark', skal: ['x'], skalEn: ['x'], brev: { mottagare: 'info@kopian.se' } });
  sparaArende(a, fil);
  assert.throws(() => overgang(a, STATUS.SKICKAD), /Bara Axel/);
  assert.throws(() => overgang(a, STATUS.ATGARDAD, { av: 'axel' }), /kan inte gå/);
  const skickad = overgang(a, STATUS.SKICKAD, { av: 'axel', not: 'brev', extra: { brev: { ...a.brev, skickat: { nar: 'nu' } } } });
  sparaArende(skickad, fil);
  const igen = lasArenden(fil);
  assert.equal(igen.size, 1); assert.equal(igen.get('KD-2026-001').status, 'skickad'); assert.equal(igen.get('KD-2026-001').historik.length, 2);
  assert.equal(nyttId(igen, new Date('2026-09-28')), 'KD-2026-002');
  assert.equal(nyttId(igen, new Date('2027-01-01')), 'KD-2027-001');
  assert.equal(hittaBefintligt(igen, nyckel).id, 'KD-2026-001'); assert.equal(hittaBefintligt(igen, 'annan'), null);
  const upp = uppdateraFynd(igen.get('KD-2026-001'), { deras: { titel: 'ny' }, bevis: { x: 1 }, styrka: 'trolig', skal: [], skalEn: [] });
  assert.equal(upp.sedd_ganger, 2); assert.equal(upp.status, 'skickad'); assert.equal(upp.deras.url, 'https://kopian.se/products/tak');
  assert.equal(oppna(igen).length, 1);
  assert.equal(overgang(skickad, STATUS.ATGARDAD).status, 'atgardad');
  assert.equal(overgang(skickad, STATUS.AVFARDAD, { av: 'axel' }).status, 'avfardad');
});

// ------------------------------------------------------------------ brevet

const ARENDE = () => ({
  id: 'KD-2026-007', verksamhet: 'Bäverbutiken', typ: 'webb', status: 'ny', skapad: '2026-09-27T08:00:00Z',
  var: { produkt: { handle: 'takoverdrag', titel: 'Taköverdrag Husvagn', url: 'https://baverbutiken.se/products/takoverdrag' } },
  deras: { url: 'https://kopian.se/products/tak', doman: 'kopian.se', lang: 'sv', plattform: 'shopify', mottagare: 'info@kopian.se' },
  bevis: { text: { styrka: 'stark', kopieradeOrd: 46, langsta: 25, tackning: 0.31, passager: [{ ord: 25, text: 'regnet löven och fågelskiten hamnar på taket och det är precis den ytan du inte går upp och kollar vattnet står kvar kring takluckor' }, { ord: 9, text: 'täck bara taket inte hela vagnen ett helöverdrag' }] }, bilder: [{ egen: 'https://cdn/v1.png', deras: 'https://kopian.se/cdn/k1.jpg', avstand: 1, grad: 'identisk' }], skarmdump: { fil: 'output/x.jpg' } },
  styrka: 'stark', skal: ['46 ord'], skalEn: ['46 words'], brev: { mottagare: 'info@kopian.se', fran: 'kundsupport@baverbutiken.se' },
});

test('valjSprak och fristText', () => {
  assert.equal(valjSprak({ lang: 'sv', doman: 'kopian.com' }), 'sv');
  assert.equal(valjSprak({ lang: 'en', doman: 'kopian.se' }), 'sv');
  assert.equal(valjSprak({ lang: 'da', doman: 'kopi.dk' }), 'en');
  assert.equal(valjSprak({ lang: 'sv', tvinga: 'en' }), 'en');
  assert.match(fristText('2026-09-27T08:00:00Z', 48, 'sv'), /tisdag 29 september 2026 kl\. 10:00/);
  assert.match(fristText('2026-09-27T08:00:00Z', 48, 'en'), /Tuesday,? 29 September 2026 at 10:00/);
});

test('byggBrev (svenska): bolaget, org.nr, deras adress, passagerna, bilderna, fristen, Shopify, lagrummen — och inget tomt fält', () => {
  const b = byggBrev(ARENDE(), { avsandare: { brand: 'Bäverbutiken', mail: 'kundsupport@baverbutiken.se', butikUrl: 'https://baverbutiken.se' }, foretag: FORETAG, nu: new Date('2026-09-27T08:00:00Z'), fristTimmar: 48 });
  assert.equal(b.sprak, 'sv'); assert.equal(b.mottagare, 'info@kopian.se'); assert.equal(b.fran, 'kundsupport@baverbutiken.se');
  assert.match(b.amne, /^Upphovsrättsintrång på kopian\.se – krav på borttagning inom 48 timmar \(ärende KD-2026-007\)$/);
  for (const m of ['Stonebite Ecom AB', '559576-2401', 'https://kopian.se/products/tak', 'regnet löven och fågelskiten', '46 ord löpande text', '1 av bilderna', 'https://kopian.se/cdn/k1.jpg', 'tisdag 29 september 2026 kl. 10:00', 'och till Shopify', '1960:729', '2008:486', '54 §', 'Patent- och marknadsdomstolen', 'tidsstämplade skärmdumpar', 'Stenkolsgatan 1B', 'Ärende: KD-2026-007']) assert.ok(b.text.includes(m), `saknar: ${m}`);
  assert.doesNotMatch(b.text, /undefined|null|Sjöhed/);
  assert.deepEqual(kontrolleraBrev(b, { egna: ['baverbutiken.se'] }), []);
});

test('byggBrev (engelska) och påminnelsen, bevisraderna bär bara det som mättes', () => {
  const a = ARENDE(); a.deras = { ...a.deras, lang: 'en', doman: 'copycat.com', url: 'https://copycat.com/products/cover', plattform: 'woocommerce' }; a.bevis.bilder = []; a.bevis.skarmdump = null;
  const b = byggBrev(a, { avsandare: { brand: 'CaraShell', mail: 'hello@carashell.com', butikUrl: 'https://carashell.se' }, foretag: FORETAG, nu: new Date('2026-09-27T08:00:00Z') });
  assert.equal(b.sprak, 'en');
  assert.match(b.amne, /^Copyright infringement on copycat\.com/);
  for (const m of ['Swedish company reg. no. 559576-2401', 'Berne Convention', 'and to your e-commerce platform', 'Patent and Market Court', 'section 54', 'with copies of your pages', 'Case: KD-2026-007']) assert.ok(b.text.includes(m), `saknar: ${m}`);
  assert.doesNotMatch(b.text, /Images:|Shopify|screenshots/);
  const rader = bevisrader(a, 'en');
  assert.equal(rader.filter((r) => r.startsWith('•')).length, 1, 'bara textbeviset');
  const skickad = { ...a, status: 'skickad', brev: { ...a.brev, skickat: { nar: '2026-09-27T08:00:00Z' } }, uppfoljning: { nar: '2026-09-30T08:00:00Z', kvar: true } };
  const p = byggBrev(skickad, { avsandare: { brand: 'CaraShell', mail: 'hello@carashell.com' }, foretag: FORETAG, nu: new Date('2026-09-30T08:00:00Z'), paminnelse: true });
  assert.match(p.amne, /^Reminder: copyright infringement/);
  assert.match(p.text, /deadline expired .*29 September 2026/);
  assert.match(p.text, /final deadline of .*1 October 2026/);
});

test('kontrolleraBrev stoppar tom mottagare, egen domän och tomma fält', () => {
  assert.match(kontrolleraBrev({ mottagare: '', text: 'x', amne: 'y', fran: 'a@b.se' }).join(), /ingen mottagare/);
  assert.match(kontrolleraBrev({ mottagare: 'info@baverbutiken.se', text: 'x', amne: 'y', fran: 'a@b.se' }, { egna: ['baverbutiken.se'] }).join(), /egna adresser/);
  assert.match(kontrolleraBrev({ mottagare: 'info@kopian.se', text: 'Hej undefined', amne: 'y', fran: 'a@b.se' }).join(), /tomt fält/);
  assert.match(kontrolleraBrev({ mottagare: 'info@kopian.se', text: 'x', amne: '', fran: '' }).join(), /ämnesraden är tom.*ingen avsändaradress/);
});

// ------------------------------------------------------------------ sändningen

test('skickaBrev: utan --ja visas bara brevet, med spärren i miljön stannar den, med --ja går det via brevlådan och ger ett kvitto', async () => {
  const a = ARENDE();
  const brev = byggBrev(a, { avsandare: { brand: 'Bäverbutiken', mail: 'kundsupport@baverbutiken.se' }, foretag: FORETAG });
  const skickade = [];
  const oppna = () => ({ skickaNytt: async (x) => { skickade.push(x); return { typ: x.utkast ? 'utkast' : 'skickat', fran: 'Kundsupport <kundsupport@baverbutiken.se>', utkastUid: x.utkast ? 77 : null }; }, loggaUt: async () => {} });
  const utan = await skickaBrev(a, brev, { brand: 'baverbutiken', oppna, env: {} });
  assert.equal(utan.skickat, false); assert.match(utan.orsak, /inget --ja/); assert.equal(skickade.length, 0);
  const sparr = await skickaBrev(a, brev, { brand: 'baverbutiken', ja: true, oppna, env: { [SPARR_ENV]: '1' } });
  assert.equal(sparr.skickat, false); assert.equal(sparr.sparr, true); assert.equal(skickade.length, 0);
  const utkast = await skickaBrev(a, brev, { brand: 'baverbutiken', ja: true, utkast: true, oppna, env: {} });
  assert.equal(utkast.utkast, true); assert.equal(utkast.skickat, false); assert.equal(utkast.kvitto.utkastUid, 77);
  const ja = await skickaBrev(a, brev, { brand: 'baverbutiken', ja: true, oppna, env: {}, nu: () => '2026-09-27T09:00:00Z' });
  assert.equal(ja.skickat, true); assert.equal(ja.kvitto.till, 'info@kopian.se'); assert.equal(ja.kvitto.nar, '2026-09-27T09:00:00Z');
  assert.equal(skickade.length, 2); assert.equal(skickade[1].amne, brev.amne);
  // Redan skickat ⇒ första brevet går aldrig igen; påminnelsen kräver skickad
  const skickad = { ...a, status: 'skickad' };
  assert.match(kontrolleraForeSandning(skickad, brev).join(), /första brevet går bara från "ny"/);
  assert.deepEqual(kontrolleraForeSandning(skickad, brev, { paminnelse: true }), []);
  assert.match(kontrolleraForeSandning(a, brev, { paminnelse: true }).join(), /påminnelsen går bara efter/);
  assert.match(kontrolleraForeSandning(a, { ...brev, mottagare: 'x@carashell.com' }, { egna: ['carashell.com'] }).join(), /egna adresser/);
  const utanBrevlada = await skickaBrev(a, brev, { brand: 'baverbutiken', ja: true, env: {}, oppna: () => { throw new Error('saknar KUNDTJANST_MAIL_PASS_BAVERBUTIKEN'); } });
  assert.match(utanBrevlada.orsak, /går inte att öppna: saknar KUNDTJANST_MAIL_PASS_BAVERBUTIKEN/);
});

// ------------------------------------------------------------------ faktura, Gmail-vägen och annonsfallet

const KONFIG_MED_KONTO = () => ({ ...KONFIG, faktura: { ...KONFIG.faktura, bankgiro: '1234-5678', taxa: { annons: 5000, video: 8000, bild: 3000, produkttext: 5000 } } });

test('faktura: en rad per mätt bevis, taxan ur konfig, stopp utan bankgiro/köpare, sv/en, HTML utan tomma fält', () => {
  const a = ARENDE();
  assert.equal(fakturanummer('KD-2026-007'), 'F-KD-2026-007-1');
  assert.equal(belopp(25000, 'SEK', 'sv'), '25 000 kr'); assert.equal(belopp(25000, 'SEK', 'en'), '25,000 SEK');
  const rader = fakturarader(a, KONFIG.faktura.taxa, 'sv');
  assert.deepEqual(rader.map((r) => [r.typ, r.antal, r.belopp]), [['produkttext', 1, 5000], ['bild', 1, 3000]]);
  // Utan bankgiro/IBAN: stopp med Axels uppgift, inte en faktura utan konto
  const utanKonto = byggFaktura(a, KONFIG, { nu: new Date('2026-09-29T08:00:00Z') });
  assert.match(kontrolleraFaktura(utanKonto).join(), /bankgiro eller IBAN saknas/);
  const f = byggFaktura(a, KONFIG_MED_KONTO(), { nu: new Date('2026-09-29T08:00:00Z'), kopare: 'Kopian AB, Storgatan 1, 111 22 Stockholm' });
  assert.deepEqual(kontrolleraFaktura(f), []);
  assert.equal(f.nr, 'F-KD-2026-007-1'); assert.equal(f.datum, '2026-09-29'); assert.equal(f.forfaller, '2026-10-09');
  assert.equal(f.netto, 8000); assert.equal(f.moms, 0); assert.equal(f.brutto, 8000);
  assert.equal(f.kopare.namn, 'Kopian AB'); assert.equal(f.kopare.adress, 'Storgatan 1, 111 22 Stockholm'); assert.equal(f.kopare.mail, 'info@kopian.se');
  assert.equal(f.saljare.orgnr, '559576-2401'); assert.equal(f.saljare.mail, 'contact@stonebite.org');
  // Utan --kopare: deras domän som namn räcker inte om inget företag lästs
  const utanNamn = byggFaktura({ ...a, deras: { ...a.deras, doman: null, sidnamn: null } }, KONFIG_MED_KONTO());
  assert.match(kontrolleraFaktura(utanNamn).join(), /köparen saknar namn/);
  const txt = fakturaText(f);
  for (const m of ['FAKTURA F-KD-2026-007-1', 'Produkttext kopierad', '1 × 5 000 kr', 'Att betala: 8 000 kr', 'Bankgiro 1234-5678']) assert.ok(txt.includes(m), `saknar: ${m}`);
  const html = fakturaHtml(f);
  for (const m of ['<title>FAKTURA F-KD-2026-007-1</title>', 'Stonebite Ecom AB', '559576-2401', 'Kopian AB', '54 § lagen (1960:729)', '8 000 kr', '1234-5678', 'Stenkolsgatan 1B']) assert.ok(html.includes(m), `saknar: ${m}`);
  assert.doesNotMatch(html, /undefined|null|Sjöhed/);
  const en = fakturaHtml(byggFaktura(a, KONFIG_MED_KONTO(), { sprak: 'en', kopare: 'Copy Ltd' }));
  assert.match(en, /<title>INVOICE F-KD-2026-007-1<\/title>/); assert.match(en, /section 54 of the Swedish Act/); assert.match(en, /8,000 SEK/);
});

test('byggBrev med faktura: stycket, ämnesraden och "eller betalningen" — påminnelsen bär ingen faktura', () => {
  const a = ARENDE();
  const f = byggFaktura(a, KONFIG_MED_KONTO(), { nu: new Date('2026-09-29T08:00:00Z'), kopare: 'Kopian AB' });
  const b = byggBrev(a, { avsandare: { brand: 'Bäverbutiken', mail: 'contact@stonebite.org', butikUrl: 'https://baverbutiken.se' }, foretag: FORETAG, nu: new Date('2026-09-29T08:00:00Z'), faktura: f });
  assert.equal(b.fran, 'contact@stonebite.org');
  assert.match(b.amne, /och faktura F-KD-2026-007-1/);
  for (const m of ['Bifogat finns faktura F-KD-2026-007-1 på 8 000 kr', '54 § upphovsrättslagen', 'förfallodag 2026-10-09', 'Uteblir borttagningen eller betalningen']) assert.ok(b.text.includes(m), `saknar: ${m}`);
  const utan = byggBrev(a, { avsandare: { brand: 'Bäverbutiken', mail: 'contact@stonebite.org' }, foretag: FORETAG });
  assert.doesNotMatch(utan.text, /faktura/i); assert.doesNotMatch(utan.amne, /faktura/);
  const en = byggBrev({ ...a, deras: { ...a.deras, lang: 'en', doman: 'copy.com' } }, { avsandare: { brand: 'Bäverbutiken', mail: 'contact@stonebite.org' }, foretag: FORETAG, faktura: byggFaktura(a, KONFIG_MED_KONTO(), { sprak: 'en', kopare: 'Copy Ltd' }) });
  assert.match(en.text, /Attached is invoice F-KD-2026-007-1 for 8,000 SEK/); assert.match(en.text, /removal or the payment/);
});

test('Gmail-vägen: sändpaketet bär brev + bilaga, kvittot flyttar ärendet och kräver en riktig adress', () => {
  const a = { ...ARENDE(), faktura: { nr: 'F-KD-2026-007-1', brutto: 8000, valuta: 'SEK', forfaller: '2026-10-09', fil: 'arenden/KD-2026-007/faktura-F-KD-2026-007-1.pdf' } };
  const brev = byggBrev(a, { avsandare: { brand: 'Bäverbutiken', mail: 'contact@stonebite.org' }, foretag: FORETAG });
  const p = byggSandpaket(a, brev, { faktura: a.faktura, via: 'gmail' });
  assert.equal(p.via, 'gmail'); assert.equal(p.till, 'info@kopian.se'); assert.equal(p.fran, 'contact@stonebite.org'); assert.equal(p.amne, brev.amne);
  assert.deepEqual(p.bilagor, ['arenden/KD-2026-007/faktura-F-KD-2026-007-1.pdf']); assert.equal(p.faktura.nr, 'F-KD-2026-007-1');
  const s = registreraSkickat(a, { nar: '2026-09-29T10:00:00Z', fristTimmar: 48 });
  assert.equal(s.status, STATUS.SKICKAD); assert.equal(s.brev.skickat.via, 'gmail'); assert.equal(s.brev.skickat.till, 'info@kopian.se'); assert.equal(s.brev.skickat.faktura, 'F-KD-2026-007-1');
  assert.equal(s.brev.frist, '2026-10-01T10:00:00.000Z'); assert.equal(s.historik.at(-1).av, 'axel');
  const pm = registreraSkickat(s, { nar: '2026-10-02T10:00:00Z', paminnelse: true, paminnelseTimmar: 24 });
  assert.equal(pm.status, STATUS.PAMIND); assert.equal(pm.brev.frist, '2026-10-03T10:00:00.000Z'); assert.equal(pm.brev.skickat.via, 'gmail');
  assert.throws(() => registreraSkickat({ ...a, brev: {} }, {}), /ingen giltig mejladress/);
  assert.throws(() => registreraSkickat(a, { till: 'inte en adress' }), /ingen giltig mejladress/);
  // Kvittot går aldrig två gånger: skickad → skickad är ingen tillåten övergång
  assert.throws(() => registreraSkickat(s, {}), /kan inte gå från skickad till skickad/);
});

test('annonsfallet: deras annonser mot våra annonstexter + produkttexter, en rad per träff, två träffar = stark, faktura per annons', () => {
  assert.throws(() => tolkaAnnonsinput({ annonser: [{ text: 'x' }] }), /sidnamn/);
  assert.throws(() => tolkaAnnonsinput({ deras: { sidnamn: 'Kopian' }, annonser: [{ lank: 'x' }] }), /inga annonser/);
  const input = tolkaAnnonsinput({
    deras: { sidnamn: 'Kopian', url: 'https://www.kopian.se/', mottagare: 'info@kopian.se', foretag: 'Kopian AB', orgnr: '556677-8899' },
    annonser: [
      { lank: 'https://www.facebook.com/ads/library/?id=1', text: 'Regnet, löven och fågelskiten hamnar på taket, och det är precis den ytan du inte går upp och kollar. Beställ i dag!' },
      { lank: 'https://www.facebook.com/ads/library/?id=2', text: 'Täck bara taket – inte hela vagnen. Ett helöverdrag är tungt att få på plats ensam och sitter och skaver mot lacken.', video: true },
      { lank: 'https://www.facebook.com/ads/library/?id=3', text: 'Helt egen text om ett annat skydd för en annan vagn, utan något gemensamt alls.' },
    ],
  });
  assert.equal(input.deras.doman, 'kopian.se'); assert.equal(input.annonser.length, 3);
  const egnaAnnonser = [{ id: '1', namn: 'Takoverdrag_PD_1_H1', verksamhet: 'Bäverbutiken', handle: 'takoverdrag', text: VAR_TEXT, bild: 'https://cdn/ann1.png' }];
  const egnaProdukter = [{ verksamhet: 'Bäverbutiken', handle: 'takoverdrag', titel: 'Taköverdrag Husvagn', url: 'https://baverbutiken.se/products/takoverdrag', butik: 'https://baverbutiken.se', text: VAR_TEXT, bilder: ['https://cdn/p1.png'] }];
  const j = jamforAnnons(input.annonser[0], { egnaAnnonser, egnaProdukter, konfig: KONFIG });
  assert.ok(j.text?.styrka, 'annons 1 ska matcha'); assert.equal(j.varAnnons.namn, 'Takoverdrag_PD_1_H1');
  const fynd = byggAnnonsfynd(input, { egnaAnnonser, egnaProdukter, konfig: KONFIG, derasHashar: new Map(), egnaHashar: new Map(), nu: '2026-09-29T08:00:00Z' });
  assert.equal(fynd.typ, 'annons'); assert.equal(fynd.styrka, 'stark'); assert.equal(fynd.verksamhet, 'Bäverbutiken');
  assert.equal(fynd.bevis.annonser.length, 2); assert.deepEqual(fynd.bevis.annonser.map((t) => t.nr).sort(), [1, 2]);
  assert.equal(fynd.deras.mottagare, 'info@kopian.se'); assert.equal(fynd.deras.foretag, 'Kopian AB'); assert.deepEqual(fynd.deras.orgnr, [{ typ: 'SE', nr: '556677-8899' }]);
  assert.equal(fynd.var.produkt.handle, 'takoverdrag');
  assert.match(fynd.skal[0], /2 av deras annonser återger våra annonstexter ordagrant/);
  // Ingen träff alls ⇒ null, aldrig ett påhittat ärende
  assert.equal(byggAnnonsfynd({ ...input, annonser: [input.annonser[2]] }, { egnaAnnonser, egnaProdukter, konfig: KONFIG, derasHashar: new Map(), egnaHashar: new Map() }), null);
  // Brevet räknar upp annonserna, fakturan tar en rad per annons (video dyrare)
  const skarm = { egen: 'https://cdn/ann1.png', deras: '/tmp/axels-skarmdump.png', avstand: 0, grad: 'identisk' };
  const arende = { ...fynd, id: 'KD-2026-009', status: 'ny', skapad: '2026-09-29T08:00:00Z', brev: { mottagare: 'info@kopian.se' }, bevis: { ...fynd.bevis, bilder: [skarm], annonser: fynd.bevis.annonser.map((t, i) => (i === 0 ? { ...t, bilder: [skarm] } : t)) } };
  const b = byggBrev(arende, { avsandare: { brand: 'Bäverbutiken', mail: 'contact@stonebite.org' }, foretag: FORETAG });
  assert.match(b.text, /2 av era annonser på Facebook\/Instagram återger våra annonser \(text och\/eller bild\)/); assert.match(b.text, /1 bild\(er\) identiska med våra/);
  // Annonsfallet pekar på annonserna och Facebook-sidan, aldrig på en sajt som kan vara ren
  assert.match(b.text, /dokumenterat att ni i\n\n    era annonser på Facebook och Instagram \(sidan "Kopian"\)/); assert.doesNotMatch(b.text, /https:\/\/kopian\.se\n/);
  assert.match(b.text, /från alla era annonser, er webbplats/); assert.match(b.text, /kopior av annonserna och deras länkar i Metas annonsbibliotek/);
  const bEn = byggBrev({ ...arende, deras: { ...arende.deras, lang: 'en', doman: 'copy.com' } }, { avsandare: { brand: 'Bäverbutiken', mail: 'contact@stonebite.org' }, foretag: FORETAG });
  assert.match(bEn.text, /documented that in\n\n    your ads on Facebook and Instagram \(page "Kopian"\)/);
  // Axels lokala skärmdump står aldrig i brevet, och ingen rad om "bilderna på er sida"
  assert.doesNotMatch(b.text, /axels-skarmdump|på er sida är våra egna produktbilder/);
  const f = byggFaktura(arende, KONFIG_MED_KONTO(), { nu: new Date('2026-09-29T08:00:00Z') });
  assert.deepEqual(kontrolleraFaktura(f), []);
  // Raderna följer bevisordningen (starkaste träffen först) — videon hade den längsta sviten; skärmdumpen ger en bildrad
  assert.deepEqual(f.rader.map((r) => [r.typ, r.belopp]).sort(), [['annons', 5000], ['bild', 3000], ['video', 8000]]); assert.equal(f.brutto, 16000); assert.equal(f.kopare.namn, 'Kopian AB'); assert.equal(f.kopare.orgnr, '556677-8899');
  const html = byggSida({ arenden: [{ ...arende, faktura: { ...f, fil: 'x.pdf' } }], datum: '2026-09-29' });
  assert.match(html, /Deras annonser som återger våra — 2 st/); assert.match(html, /Fakturan F-KD-2026-009-1 på <strong>16 000 kr<\/strong>/); assert.match(html, /utkast i din Gmail/);
  assert.doesNotMatch(html, /axels-skarmdump/);
});

// ------------------------------------------------------------------ rapport och sida

test('rapportSv: nya ärenden med kommandon, källorna, och Axels uppgifter numrerade sist; rapportEn bara när något finns', () => {
  const a = ARENDE();
  const korning = { sok: { produkter: 12 }, bing: { fraser: 24, traffar: 90, kandidater: 31, fel: [] }, adLibrary: { status: 'saknar_behorighet' }, bilder: { status: 'ok', hashade: 140 } };
  const r = rapportSv({ datum: '2026-09-27', korning, nya: [a], oppna: [a], sidaUrl: 'https://claude.ai/artifact/x' });
  assert.match(r, /\*\*KD-2026-007\*\*/); assert.match(r, /\/konkurrentdodaren skicka KD-2026-007/); assert.match(r, /avfarda KD-2026-007/);
  assert.match(r, /SAKNAR BEHÖRIGHET/); assert.match(r, /140 bilder jämförda/);
  const uppgifter = r.split('## Dina uppgifter')[1];
  assert.match(uppgifter, /^\n1\. Öppna granskningssidan/); assert.match(uppgifter, /2\. KD-2026-007/); assert.match(uppgifter, /3\. Ad Library/);
  const tom = rapportSv({ datum: '2026-09-27', korning: { ...korning, adLibrary: { status: 'ok', termer: 3, annonser: 40 } } });
  assert.match(tom, /Inga nya kopior i dag/); assert.match(tom, /Inget för dig i dag\./);
  assert.equal(rapportEn({ datum: '2026-09-27' }), null);
  const en = rapportEn({ datum: '2026-09-27', nya: [a], sidaUrl: 'https://claude.ai/artifact/x' });
  assert.match(en, /1 new suspected copy/); assert.match(en, /KD-2026-007/); assert.match(en, /Nothing is sent/);
  assert.equal(kallrader(korning).length, 3);
});

test('arendeMd och byggSida: bevisen står ordagrant, HTML escapas, inga externa bilder, båda teman, kommandot på sidan', () => {
  const a = ARENDE(); a.deras.titel = '<script>alert(1)</script>Tak';
  const md = arendeMd(a);
  assert.match(md, /^# KD-2026-007 — Taköverdrag Husvagn ← kopian\.se/); assert.match(md, /## Kopierad text — 46 ord/); assert.match(md, /\| https:\/\/cdn\/v1\.png \| https:\/\/kopian\.se\/cdn\/k1\.jpg \| 1\/64 \| identisk \|/);
  const html = byggSida({ arenden: [a, { ...a, id: 'KD-2026-006', status: 'avfardad' }], datum: '2026-09-27', korning: { adLibrary: { status: 'saknar_behorighet' } }, kallrader: ['Bing: x'], miniatyr: (u) => (u === 'https://cdn/v1.png' ? 'data:image/jpeg;base64,AAAA' : null), skarmdump: () => 'data:image/jpeg;base64,BBBB', brevtext: () => ({ sprak: 'sv', amne: 'Ämne', text: 'Brev <b>' }) });
  assert.match(html, /^<title>Konkurrentdödaren<\/title>/);
  assert.match(html, /id="KD-2026-007"/); assert.match(html, /\/konkurrentdodaren skicka KD-2026-007/); assert.match(html, /avfarda KD-2026-007/);
  assert.match(html, /1 kopia väntar på ditt beslut/);
  assert.doesNotMatch(html, /<script>alert/); assert.match(html, /&lt;script&gt;alert\(1\)/);
  assert.match(html, /Brev &lt;b&gt;/);
  assert.ok(!/<img src="http/.test(html), 'inga externa bilder — bara data-URI:er');
  assert.match(html, /data:image\/jpeg;base64,AAAA/); assert.match(html, /data:image\/jpeg;base64,BBBB/);
  assert.match(html, /prefers-color-scheme: dark/); assert.match(html, /\[data-theme="dark"\]/); assert.match(html, /body\{background:var\(--bg\)/);
  assert.match(html, /Avslutade \(senaste 1\)/);
  assert.match(html, /identiteten är bekräftad hos Meta/);
});

// ------------------------------------------------------------------ bild (utan Chromium)

test('gissaTyp och Bildcache utan fil', () => {
  assert.equal(gissaTyp(Buffer.from([0xff, 0xd8, 0xff])), 'image/jpeg');
  assert.equal(gissaTyp(Buffer.from([0x89, 0x50, 0x4e])), 'image/png');
  assert.equal(gissaTyp(Buffer.from('RIFF0000WEBPVP8 ')), 'image/webp');
  const dir = mkdtempSync(join(tmpdir(), 'kd-bild-'));
  const c = new Bildcache(join(dir, 'cache.json'));
  assert.equal(c.get('u'), null);
  c.set('u', { hash: 'ff', bredd: 1, hojd: 1 }); c.spara();
  assert.ok(existsSync(join(dir, 'cache.json')));
  assert.equal(new Bildcache(join(dir, 'cache.json')).get('u').hash, 'ff');
});
