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
import { fakturanummer, belopp, fakturarader, byggFaktura, kontrolleraFaktura, fakturaText, fakturaHtml, momsregNr, ibanGiltig, svenskKopare } from '../faktura.mjs';
import { tolkaAnnonsinput, jamforAnnons, byggAnnonsfynd, tolkaAntal, exponeringarUr, vardAttJaga, aktivUr } from '../annonsfall.mjs';
import { sidaIdUr, listaUrl, annonserUrHtml, normaliseraAnnons, rackviddUrDetalj, derasDoman, annonsfilUr, antalUrText } from '../adlibrary.mjs';
import { beskrivning500, formularVarden, kodUrText, kvarUrText, referensUrText } from '../anmal-skicka.mjs';
import { cpmUr, summeraInsights, insightsSokvag, hamtaCpm, valjCpm } from '../cpm.mjs';
import { adLibraryToken } from '../sok.mjs';
import { annonsLank, varAdLibraryLank, byggAnmalan, byggAnmalningar, kontrolleraAnmalan, anmalanText, FORSAKRINGAR } from '../anmalan.mjs';
import { markera, bevisbildHtml, verifieringHtml } from '../bevisbild.mjs';
import { rapportSv, rapportEn, arendeMd, kallrader } from '../rapport.mjs';
import { byggSida } from '../sida.mjs';
import { gissaTyp, Bildcache } from '../bild.mjs';
import { dHash, avstand, tid, prefixUrNamn, scener, lanadeRutor, paraRutor, klippSammanfattning, hittaFfmpeg, videoIdn, kontrastAv, bevisStatus, produktForPar, filmdatum, tagningar, lanadeKlipp, skillnadOvre, SAMMA_TAGNING } from '../klipp.mjs';
import { frasUrText, fraserUrText, landUrNamn, sokUrl, annonserUrSvar, andelLika, valjOriginal, hittaOriginal, ledfilm, originalFor, startadeFore, MIN_ANDEL } from '../original.mjs';

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
  // Förhandsbilderna skrivs aldrig i loggen (ORVO 2026-09-29: 1,7 MB per rad, 35 MB på 22 rader) — de bor i arenden/<id>/miniatyrer.json
  sparaArende({ ...skickad, miniatyrer: { 'https://x/y.jpg': 'data:image/jpeg;base64,' + 'A'.repeat(5000) } }, fil);
  assert.doesNotMatch(readFileSync(fil, 'utf8').trim().split('\n').at(-1), /miniatyrer|AAAAAAAAAA/);
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

const KONFIG_MED_KONTO = () => ({ ...KONFIG, faktura: { ...KONFIG.faktura, bankgiro: '1234-5678', iban: '', taxa: { annons: 5000, video: 8000, bild: 3000, produkttext: 5000 } } });
const KONFIG_UTAN_KONTO = () => ({ ...KONFIG, faktura: { ...KONFIG.faktura, bankgiro: '', iban: '' } });

test('faktura: en rad per mätt bevis, taxan ur konfig, stopp utan konto/fel IBAN/köpare, moms 25 % SE och omvänd utomlands, sv/en, HTML utan tomma fält', () => {
  const a = ARENDE();
  assert.equal(fakturanummer('KD-2026-007'), 'F-KD-2026-007-1');
  assert.equal(belopp(25000, 'SEK', 'sv'), '25 000 kr'); assert.equal(belopp(25000, 'SEK', 'en'), '25,000 SEK'); assert.equal(belopp(97.9, 'SEK', 'sv', 1), '97,9 kr'); assert.equal(belopp(100, 'SEK', 'sv', 1), '100 kr');
  assert.equal(momsregNr('559576-2401'), 'SE559576240101'); assert.equal(momsregNr('12'), null);
  assert.equal(ibanGiltig('SE35 9710 0000 0971 0348 9566'), true); assert.equal(ibanGiltig('SE35 9710 0000 0971 0348 9567'), false); assert.equal(ibanGiltig(''), false);
  assert.equal(svenskKopare({ doman: 'kopian.se' }), true); assert.equal(svenskKopare({ doman: 'copy.com' }), false); assert.equal(svenskKopare({ land: 'NO', doman: 'x.se' }), false); assert.equal(svenskKopare({ sprak: 'sv' }), true);
  const rader = fakturarader(a, KONFIG.faktura.taxa, 'sv');
  assert.deepEqual(rader.map((r) => [r.typ, r.antal, r.belopp]), [['produkttext', 1, 5000], ['bild', 1, 3000]]);
  // Utan bankgiro/IBAN: stopp med Axels uppgift, inte en faktura utan konto — och ett felskrivet IBAN stoppar också
  const utanKonto = byggFaktura(a, KONFIG_UTAN_KONTO(), { nu: new Date('2026-09-29T08:00:00Z') });
  assert.match(kontrolleraFaktura(utanKonto).join(), /bankgiro eller IBAN saknas/);
  const felIban = byggFaktura(a, { ...KONFIG, faktura: { ...KONFIG.faktura, bankgiro: '', iban: 'SE35 9710 0000 0971 0348 9567' } });
  assert.match(kontrolleraFaktura(felIban).join(), /klarar inte kontrollsiffran/);
  // Konfigens riktiga IBAN (Axels 2026-09-29) klarar kontrollen och grupperas fyra och fyra
  assert.equal(byggFaktura(a, KONFIG).saljare.iban, 'SE35 9710 0000 0971 0348 9566'); assert.deepEqual(kontrolleraFaktura(byggFaktura(a, KONFIG, { kopare: 'Kopian AB' })), []);
  const f = byggFaktura(a, KONFIG_MED_KONTO(), { nu: new Date('2026-09-29T08:00:00Z'), kopare: 'Kopian AB, Storgatan 1, 111 22 Stockholm' });
  assert.deepEqual(kontrolleraFaktura(f), []);
  assert.equal(f.nr, 'F-KD-2026-007-1'); assert.equal(f.datum, '2026-09-29'); assert.equal(f.forfaller, '2026-10-09');
  // Svensk köpare (kopian.se): 25 % moms ovanpå
  assert.equal(f.netto, 8000); assert.equal(f.momsProcent, 25); assert.equal(f.moms, 2000); assert.equal(f.brutto, 10000); assert.equal(f.omvand, false); assert.equal(f.berakning, 'schablon');
  assert.equal(f.kopare.namn, 'Kopian AB'); assert.equal(f.kopare.adress, 'Storgatan 1, 111 22 Stockholm'); assert.equal(f.kopare.mail, 'info@kopian.se'); assert.equal(f.kopare.svensk, true);
  assert.equal(f.saljare.orgnr, '559576-2401'); assert.equal(f.saljare.momsreg, 'SE559576240101'); assert.equal(f.saljare.mail, 'contact@stonebite.org');
  // Utan --kopare: deras domän som namn räcker inte om inget företag lästs
  const utanNamn = byggFaktura({ ...a, deras: { ...a.deras, doman: null, sidnamn: null } }, KONFIG_MED_KONTO());
  assert.match(kontrolleraFaktura(utanNamn).join(), /köparen saknar namn/);
  const txt = fakturaText(f);
  for (const m of ['FAKTURA F-KD-2026-007-1', 'Produkttext kopierad', '1 × 5 000 kr', 'Att betala: 10 000 kr (Moms 25 %)', 'Bankgiro 1234-5678']) assert.ok(txt.includes(m), `saknar: ${m}`);
  const html = fakturaHtml(f);
  for (const m of ['<title>FAKTURA F-KD-2026-007-1</title>', 'Stonebite Ecom AB', '559576-2401', 'Momsreg.nr SE559576240101', 'Kopian AB', '54 § lagen (1960:729)', 'Moms 25 %', '10 000 kr', '1234-5678', 'Stenkolsgatan 1B']) assert.ok(html.includes(m), `saknar: ${m}`);
  assert.doesNotMatch(html, /undefined|null|Sjöhed|Reverse|Omvänd/);
  // Utländsk näringsidkare: 0 % och omvänd betalningsskyldighet, momsreg.nr med
  const fEn = byggFaktura(a, KONFIG_MED_KONTO(), { sprak: 'en', kopare: 'Copy Ltd', land: 'GB' });
  assert.equal(fEn.momsProcent, 0); assert.equal(fEn.omvand, true); assert.equal(fEn.brutto, 8000); assert.equal(fEn.kopare.svensk, false);
  const en = fakturaHtml(fEn);
  assert.match(en, /<title>INVOICE F-KD-2026-007-1<\/title>/); assert.match(en, /section 54 of the Swedish Act/); assert.match(en, /8,000 SEK/); assert.match(en, /Reverse charge/); assert.match(en, /VAT no\. SE559576240101/);
});

test('byggBrev med faktura: stycket, ämnesraden och "eller betalningen" — påminnelsen bär ingen faktura', () => {
  const a = ARENDE();
  const f = byggFaktura(a, KONFIG_MED_KONTO(), { nu: new Date('2026-09-29T08:00:00Z'), kopare: 'Kopian AB' });
  const b = byggBrev(a, { avsandare: { brand: 'Bäverbutiken', mail: 'contact@stonebite.org', butikUrl: 'https://baverbutiken.se' }, foretag: FORETAG, nu: new Date('2026-09-29T08:00:00Z'), faktura: f });
  assert.equal(b.fran, 'contact@stonebite.org');
  assert.match(b.amne, /och faktura F-KD-2026-007-1/);
  for (const m of ['Bifogat finns faktura F-KD-2026-007-1 på 10 000 kr inklusive moms', '54 § upphovsrättslagen', 'förfallodag 2026-10-09', 'Uteblir borttagningen eller betalningen']) assert.ok(b.text.includes(m), `saknar: ${m}`);
  assert.doesNotMatch(b.text, /exponeringar/);
  const utan = byggBrev(a, { avsandare: { brand: 'Bäverbutiken', mail: 'contact@stonebite.org' }, foretag: FORETAG });
  assert.doesNotMatch(utan.text, /faktura/i); assert.doesNotMatch(utan.amne, /faktura/);
  const en = byggBrev({ ...a, deras: { ...a.deras, lang: 'en', doman: 'copy.com' } }, { avsandare: { brand: 'Bäverbutiken', mail: 'contact@stonebite.org' }, foretag: FORETAG, faktura: byggFaktura(a, KONFIG_MED_KONTO(), { sprak: 'en', kopare: 'Copy Ltd', land: 'GB' }) });
  assert.match(en.text, /Attached is invoice F-KD-2026-007-1 for 8,000 SEK, being/); assert.match(en.text, /removal or the payment/);
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
      { lank: 'https://www.facebook.com/ads/library/?id=1', text: 'Regnet, löven och fågelskiten hamnar på taket, och det är precis den ytan du inte går upp och kollar. Beställ i dag!', exponeringar: '12 345' },
      { lank: 'https://www.facebook.com/ads/library/?id=2', text: 'Täck bara taket – inte hela vagnen. Ett helöverdrag är tungt att få på plats ensam och sitter och skaver mot lacken.', video: true, reach: 8000 },
      { lank: 'https://www.facebook.com/ads/library/?id=3', text: 'Helt egen text om ett annat skydd för en annan vagn, utan något gemensamt alls.' },
    ],
  });
  assert.equal(input.deras.doman, 'kopian.se'); assert.equal(input.annonser.length, 3);
  assert.equal(input.annonser[0].exponeringar, 12345); assert.equal(input.annonser[1].exponeringar, 8000); assert.equal(input.annonser[1].exponeringarKalla, 'reach'); assert.equal(input.annonser[2].exponeringar, null);
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
  // Samma sida i Norge är ett EGET ärende (ORVO 2026-09-29): landet ur annonsfilen hamnar i nyckeln, Sverige behåller den gamla.
  assert.equal(input.land, null);
  const no = tolkaAnnonsinput({ land: 'NO', deras: { sidnamn: 'Kopian', url: 'https://www.kopian.se/' }, annonser: [{ lank: 'https://www.facebook.com/ads/library/?id=1', text: input.annonser[0].text }] });
  assert.equal(no.land, 'NO');
  const fyndNo = byggAnnonsfynd(no, { egnaAnnonser, egnaProdukter, konfig: KONFIG, derasHashar: new Map(), egnaHashar: new Map() });
  assert.notEqual(fyndNo.nyckel, fynd.nyckel); assert.match(fyndNo.nyckel, /annonser-NO$/); assert.equal(fyndNo.land, 'NO');
  assert.equal(tolkaAnnonsinput({ land: 'SE', deras: { sidnamn: 'K', url: 'https://www.kopian.se/' }, annonser: [{ lank: 'x', text: 'y' }] }).land, 'SE');
  assert.equal(byggAnnonsfynd({ ...input, land: 'SE' }, { egnaAnnonser, egnaProdukter, konfig: KONFIG, derasHashar: new Map(), egnaHashar: new Map() }).nyckel, fynd.nyckel, 'SE ger samma nyckel som förut');
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
  assert.match(fynd.skal.join(' '), /20 345 exponeringar enligt Axels avläsning/);
  // Schablon: en rad per annons + skärmdumpen som bildrad, 25 % moms på svensk köpare. Videoannonsen bär bara
  // sin TEXT (klippvalet inte kört, Axel 2026-09-29) ⇒ annonstexttaxan, inte filmtaxan.
  const fSchablon = byggFaktura(arende, { ...KONFIG_MED_KONTO(), faktura: { ...KONFIG_MED_KONTO().faktura, berakning: 'schablon' } }, { nu: new Date('2026-09-29T08:00:00Z') });
  assert.deepEqual(kontrolleraFaktura(fSchablon), []);
  assert.deepEqual(fSchablon.rader.map((r) => [r.typ, r.belopp]).sort(), [['annons', 5000], ['annons', 5000], ['bild', 3000]]); assert.equal(fSchablon.netto, 13000); assert.equal(fSchablon.brutto, 16250);
  // Samma videoannons med rutor ur våra egna klipp ⇒ text + film, filmtaxan
  const medFilm = { ...arende, bevis: { ...arende.bevis, annonser: arende.bevis.annonser.map((t, i) => (i === 1 ? { ...t, klipp: { antal: 3, andel: 60, filmer: ['Takoverdrag_OB_1_H1'] }, klippStatus: 'bevisad' } : t)) } };
  const fFilm = byggFaktura(medFilm, { ...KONFIG_MED_KONTO(), faktura: { ...KONFIG_MED_KONTO().faktura, berakning: 'schablon' } }, { nu: new Date('2026-09-29T08:00:00Z') });
  assert.deepEqual(fFilm.rader.map((r) => [r.typ, r.belopp]).sort(), [['annons', 5000], ['bild', 3000], ['video', 8000]]);
  assert.match(fFilm.rader.find((r) => r.typ === 'video').beskrivning, /^Annonstext och annonsfilm kopierade från våra annonser \(Takoverdrag_PD_1_H1, Takoverdrag_OB_1_H1\)/);
  // … och en film där bara det lånade klippet matchade (klippvalet kört, inga egna rutor) och ingen text bär: ingen rad alls
  const lanad = { ...arende, bevis: { ...arende.bevis, bilder: [], annonser: [{ ...arende.bevis.annonser[1], text: null, bilder: [skarm], klipp: null, klippStatus: 'ej_bevisad', klippFel: 'bara det lånade' }] } };
  assert.deepEqual(byggFaktura(lanad, { ...KONFIG_MED_KONTO(), faktura: { ...KONFIG_MED_KONTO().faktura, berakning: 'schablon' } }).rader, []); assert.equal(fSchablon.kopare.namn, 'Kopian AB'); assert.equal(fSchablon.kopare.orgnr, '556677-8899');
  // Exponeringar (Axels beslut): annons = exponeringar × CPM ÷ 1000; utan CPM stoppar kontrollen, med CPM räknas bilden inuti annonsen inte en gång till
  const utanCpm = byggFaktura(arende, KONFIG_MED_KONTO(), { nu: new Date('2026-09-29T08:00:00Z') });
  assert.match(kontrolleraFaktura(utanCpm).join(), /2 annons\(er\) har exponeringar men ingen CPM/);
  const cpm = { sek: 100, text: 'Bäverbutiken, Meta', period: 'last_30d', matt: '2026-09-29T08:00:00Z' };
  const fExp = byggFaktura(arende, KONFIG_MED_KONTO(), { nu: new Date('2026-09-29T08:00:00Z'), cpm });
  assert.deepEqual(kontrolleraFaktura(fExp), []);
  assert.deepEqual(fExp.rader.map((r) => [r.typ, r.grund, r.belopp]).sort(), [['annons', 'exponeringar', 1235], ['annons', 'exponeringar', 800]]);
  assert.equal(fExp.berakning, 'exponeringar'); assert.equal(fExp.exponeringar, 20345); assert.equal(fExp.netto, 2035); assert.equal(fExp.moms, 509); assert.equal(fExp.brutto, 2544); assert.equal(fExp.cpm.sek, 100);
  assert.match(fExp.rader.find((r) => r.typ === 'annons').beskrivning, /12 345 exponeringar × CPM 100 kr$/);
  const fTxt = fakturaText(fExp); assert.match(fTxt, /Raderna märkta CPM är beräknade på annonsens exponeringar/); assert.match(fTxt, /senaste 30 dagarna/);
  assert.match(fakturaHtml(fExp), /värdet av det annonsutrymme ni fått med vårt material/);
  // Golvet i konfig (minst_per_annons) lyfter en liten annons och märker raden
  const fGolv = byggFaktura(arende, { ...KONFIG_MED_KONTO(), faktura: { ...KONFIG_MED_KONTO().faktura, minst_per_annons: 2000 } }, { cpm });
  assert.deepEqual(fGolv.rader.map((r) => r.belopp).sort(), [2000, 2000]); assert.match(fGolv.rader[0].beskrivning, /minimibelopp/);
  // En annons utan tal går på schablon och märks så, mitt bland exponeringsraderna
  const blandat = { ...arende, bevis: { ...arende.bevis, annonser: arende.bevis.annonser.map((t, i) => (i === 1 ? { ...t, exponeringar: null } : t)) } };
  const fBland = byggFaktura(blandat, KONFIG_MED_KONTO(), { cpm });
  assert.deepEqual(fBland.rader.map((r) => r.grund).sort(), ['exponeringar', 'schablon']); assert.match(fBland.rader.find((r) => r.grund === 'schablon').beskrivning, /schablon, exponeringar okända/);
  // Brevet nämner grunden när fakturan räknats på exponeringar
  const bExp = byggBrev(arende, { avsandare: { brand: 'Bäverbutiken', mail: 'contact@stonebite.org' }, foretag: FORETAG, faktura: fExp });
  assert.match(bExp.text, /faktura F-KD-2026-009-1 på 2 544 kr inklusive moms/); assert.match(bExp.text, /räknat på annonsernas 20 345 exponeringar enligt Metas annonsbibliotek/); assert.match(bExp.text, /CPM 100 kr\)/);
  const html = byggSida({ arenden: [{ ...arende, faktura: { ...fExp, fil: 'x.pdf' } }], datum: '2026-09-29' });
  assert.match(html, /Deras annonser som återger våra — 2 st/); assert.match(html, /Fakturan F-KD-2026-009-1 på <strong>2 544 kr<\/strong> — 20 345 exponeringar × CPM 100 kr, moms 25 %/); assert.match(html, /utkast i din Gmail/);
  assert.doesNotMatch(html, /axels-skarmdump/);
});

test('Axels kriterier (vardAttJaga): EN annons över 10 000 i räckvidd ELLER tio live — annars under tröskeln, och inget nytt ärende', () => {
  const t = (nr, exp, aktiv = true) => ({ nr, exponeringar: exp, aktiv });
  const en = vardAttJaga([t(1, 100)]);
  assert.equal(en.vard, false); assert.match(en.orsak, /1 kopierande annons\(er\) live \(färre än 10\) och största räckvidden 100 \(inte över 10 000\)/);
  assert.equal(vardAttJaga([t(1, 10000)]).vard, false, '10 000 är inte ÖVER 10 000');
  const v = vardAttJaga([t(1, 10001), t(2, 50)]); assert.equal(v.vard, true); assert.equal(v.viaRackvidd, true); assert.equal(v.storstNr, 1); assert.match(v.orsak, /annons 1 har 10 001 i räckvidd \(över 10 000\)/); assert.match(v.orsakEn, /ad 1 reached 10,001 people/);
  const tio = Array.from({ length: 10 }, (_, i) => t(i + 1, null)); const a = vardAttJaga(tio); assert.equal(a.vard, true); assert.equal(a.viaAntal, true); assert.match(a.orsak, /10 kopierande annonser live \(minst 10\)/);
  const nio = [...tio.slice(0, 9), t(10, null, false)]; const n = vardAttJaga(nio); assert.equal(n.vard, false); assert.equal(n.live, 9); assert.match(n.orsak, /9 kopierande annons\(er\) live .*största räckvidden okänd .*10 annons\(er\) utan räckvidd/);
  assert.equal(vardAttJaga([t(1, 20000)], { min_rackvidd_en_annons: 30000, min_antal_live: 1 }).vard, true, 'konfig styr: en live räcker');
  assert.equal(aktivUr({ aktiv: false }), false); assert.equal(aktivUr({ is_active: true }), true); assert.equal(aktivUr({ status: 'Active' }), true); assert.equal(aktivUr({ status: 'inaktiv' }), false); assert.equal(aktivUr({}), null);
  assert.equal(KONFIG.trosklar.annons.min_rackvidd_en_annons, 10000); assert.equal(KONFIG.trosklar.annons.min_antal_live, 10);
  // Fyndet bär domen: en general store med en enda kopierande annons på ~100 räckvidd
  const egnaAnnonser = [{ id: '1', namn: 'Takoverdrag_PD_1_H1', verksamhet: 'Bäverbutiken', handle: 'takoverdrag', text: VAR_TEXT, bild: null }];
  const egnaProdukter = [{ verksamhet: 'Bäverbutiken', handle: 'takoverdrag', titel: 'Taköverdrag Husvagn', url: 'https://baverbutiken.se/products/takoverdrag', butik: 'https://baverbutiken.se', text: VAR_TEXT, bilder: [] }];
  const input = tolkaAnnonsinput({ deras: { sidnamn: 'General Store', sida_id: '42' }, annonser: [{ lank: 'https://www.facebook.com/ads/library/?id=901', text: 'Regnet, löven och fågelskiten hamnar på taket, och det är precis den ytan du inte går upp och kollar.', reach: 100, aktiv: true }] });
  const fynd = byggAnnonsfynd(input, { egnaAnnonser, egnaProdukter, konfig: KONFIG, derasHashar: new Map(), egnaHashar: new Map(), nu: '2026-09-29T08:00:00Z', kalla: 'adlibrary' });
  assert.equal(fynd.varde.vard, false); assert.match(fynd.skal.at(-1), /^under Axels tröskel: 1 kopierande annons/); assert.match(fynd.skalEn.at(-1), /^below the threshold/); assert.match(fynd.skal.join(' '), /100 exponeringar enligt annonsbibliotekets EU-ruta/); assert.equal(fynd.bevis.annonser[0].aktiv, true);
  const r = rapportSv({ datum: '2026-09-29', ejVarda: [fynd] });
  assert.match(r, /## Under din tröskel — inget ärende \(1\)/); assert.match(r, /General Store \(Bäverbutiken\): 1 annons\(er\) återger vårt, men 1 kopierande annons\(er\) live/); assert.match(r, /--rapport --tvinga/); assert.match(r, /## Inga nya kopior i dag/);
  // Över tröskeln via räckvidden ⇒ värd att jaga, skälet sist
  const stor = byggAnnonsfynd(tolkaAnnonsinput({ deras: { sidnamn: 'Stor' }, annonser: [{ lank: 'https://www.facebook.com/ads/library/?id=902', text: input.annonser[0].text, reach: '12,3 tn' }] }), { egnaAnnonser, egnaProdukter, konfig: KONFIG, derasHashar: new Map(), egnaHashar: new Map() });
  assert.equal(stor.varde.vard, true); assert.match(stor.skal.at(-1), /^värd att jaga: annons 1 har 12 300 i räckvidd/);
});

test('adlibrary: sid-id ur länk, annonserna ur den inbäddade JSON:en, normalisering, räckvidd ur detaljsvaret, annonsfilen rakt in i annonsfallet', () => {
  assert.equal(sidaIdUr('1299101096626433'), '1299101096626433');
  assert.equal(sidaIdUr('https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=SE&view_all_page_id=1299101096626433&x=1'), '1299101096626433');
  assert.equal(sidaIdUr('orvo'), null); assert.equal(sidaIdUr(''), null);
  assert.match(listaUrl('1', { status: 'inactive', media: 'video' }), /active_status=inactive.*media_type=video.*view_all_page_id=1$/);
  const nod = (id, extra = {}) => ({ ad_archive_id: id, is_active: true, start_date: 1790233200, end_date: 1790578800, page_id: '1299101096626433', page_name: 'ORVO', publisher_platform: ['FACEBOOK', 'INSTAGRAM'], collation_count: 2, snapshot: { body: { text: 'Regnet slår på taket.' }, title: 'Skyddar taket', link_url: 'https://orvo.se/products/takskydd', cta_text: 'Shop now', display_format: 'VIDEO', images: [], videos: [{ video_hd_url: 'https://video/hd.mp4', video_preview_image_url: 'https://scontent/poster.jpg' }], cards: [] }, ...extra });
  const inbaddat = { require: [['ScheduledServerJS', 'handle', null, [{ __bbox: { result: { data: { ad_library_main: { search_results_connection: { edges: [{ node: { collated_results: [nod('111'), nod('222', { is_active: false, snapshot: { body: { markup: { __html: 'Rad ett<br>Rad två &amp; tre' } }, images: [{ original_image_url: 'https://scontent/bild.jpg' }], cards: [{ body: 'Kortet', title: 'Kortrubrik', link_url: 'https://orvo.se/products/blad', original_image_url: 'https://scontent/kort.jpg' }] } })] } }] } } } } } }]]] };
  const html = `<html><head><script type="application/json" data-content-len="1">${JSON.stringify(inbaddat)}</script><script type="application/json">{"x":1}</script></head></html>`;
  const raa = annonserUrHtml(html + html); // samma annons i två skript räknas en gång
  assert.equal(raa.length, 2);
  const a = normaliseraAnnons(raa[0]);
  assert.equal(a.id, '111'); assert.equal(a.lank, 'https://www.facebook.com/ads/library/?id=111'); assert.equal(a.aktiv, true); assert.equal(a.start, '2026-09-24'); assert.equal(a.slut, '2026-09-28');
  assert.equal(a.text, 'Regnet slår på taket.'); assert.equal(a.rubrik, 'Skyddar taket'); assert.equal(a.doman, 'orvo.se'); assert.deepEqual(a.bilder, ['https://scontent/poster.jpg']); assert.equal(a.video, true); assert.equal(a.videoUrl, 'https://video/hd.mp4'); assert.equal(a.varianter, 2); assert.equal(a.sida, 'ORVO');
  const b = normaliseraAnnons(raa[1]);
  assert.equal(b.aktiv, false); assert.equal(b.text, 'Rad ett\nRad två & tre\n\nKortet'); assert.equal(b.rubrik, 'Kortrubrik'); assert.deepEqual(b.bilder, ['https://scontent/bild.jpg', 'https://scontent/kort.jpg']); assert.equal(b.video, false);
  assert.equal(antalUrText('Filters\n~37 results\nSort'), 37); assert.equal(antalUrText('1 234 resultat'), 1234); assert.equal(antalUrText('inget'), null);
  const detalj = rackviddUrDetalj({ data: { ad_library_main: { ad_details: { advertiser: { page: { about: { text: 'Tools' } }, ad_library_page_info: { page_info: { page_name: 'ORVO', page_category: 'Tools/Equipment', ig_username: 'orvogear', likes: 1, page_profile_uri: 'https://www.facebook.com/61594472230799/' } } }, transparency_by_location: { eu_transparency: { targets_eu: true, eu_total_reach: 3948, location_audience: [{ name: 'Sweden', excluded: false }, { name: 'Norway', excluded: true }] } } } } } });
  assert.equal(detalj.rackvidd, 3948); assert.deepEqual(detalj.lander, ['Sweden']); assert.equal(detalj.sidinfo.instagram, 'orvogear'); assert.equal(detalj.sidinfo.om, 'Tools'); assert.equal(detalj.fel, null);
  assert.match(rackviddUrDetalj({}).fel, /ad_details/);
  assert.equal(derasDoman([a, b, { doman: 'facebook.com' }, { doman: null }]), 'orvo.se');
  const fil = annonsfilUr({ sidaId: '1299101096626433', annonser: [a, b], sidinfo: detalj.sidinfo, rackvidd: new Map([['111', { rackvidd: 3948, lander: ['Sweden'] }]]), hamtad: '2026-09-29T10:00:00Z', antal: { active: 1, inactive: 1 } });
  assert.equal(fil.deras.sidnamn, 'ORVO'); assert.equal(fil.deras.sida_id, '1299101096626433'); assert.equal(fil.deras.doman, 'orvo.se'); assert.equal(fil.deras.url, 'https://orvo.se'); assert.match(fil.deras.ad_library, /view_all_page_id=1299101096626433/);
  assert.equal(fil.annonser[0].exponeringar, 3948); assert.equal(fil.annonser[0].exponeringar_kalla, 'eu_total_reach'); assert.equal(fil.annonser[1].exponeringar, null); assert.equal(fil.annonser[1].exponeringar_kalla, null);
  assert.deepEqual(fil.antal, { active: 1, inactive: 1, lasta: 2, aktiva: 1, inaktiva: 1, rackvidd_last: 1, rackvidd_saknas: 1 }); assert.equal(fil.kalla, 'adlibrary');
  const input = tolkaAnnonsinput(fil);
  assert.equal(input.deras.doman, 'orvo.se'); assert.equal(input.annonser.length, 2); assert.equal(input.annonser[0].aktiv, true); assert.equal(input.annonser[1].aktiv, false); assert.equal(input.annonser[0].exponeringar, 3948); assert.equal(input.annonser[1].exponeringar, null);
});

test('anmal-skicka: formulärets fält ur anmälan (produkt per annons, beskrivning ≤ 500), koden ur mejlet, kvar-räknaren och referensen ur kvittot', () => {
  const arende = { id: 'KD-2026-011', verksamhet: 'Bäverbutiken', typ: 'annons', status: 'ny', deras: { sidnamn: 'ORVO', sidaId: '1299101096626433' }, var: { produkt: { handle: 'ibc', titel: 'IBC-tanköverdrag', url: 'https://baverbutiken.se/products/ibc' } }, brev: null };
  const annons = { nr: 2, lank: 'https://www.facebook.com/ads/library/?id=2011809009499730', aktiv: true, exponeringar: 3364, video: true, start: '2026-09-24', text: { styrka: 'trolig', kopieradeOrd: 7, langsta: 7, passager: [{ text: 'stänger ute ljuset som får algerna att' }] }, varAnnons: { id: '1', namn: 'Takoverdrag_PD_3_H1', handle: 'takoverdrag' }, produkt: { handle: 'takoverdrag', titel: 'Taköverdrag Husvagn', url: 'https://baverbutiken.se/products/takoverdrag', verksamhet: 'Bäverbutiken' }, bilder: [{ egen: 'https://cdn/a.jpg', deras: 'https://scontent/b.jpg', avstand: 1, grad: 'identisk' }] };
  const an = byggAnmalan(arende, annons, KONFIG, { nr: 1, antal: 10, nu: '2026-09-29T10:00:00Z', bevisbildUrl: 'https://cdn.shopify.com/s/files/bevis-1.png' });
  // Produkten PER ANNONS vinner över ärendets (en sida kan kopiera flera av våra produkter)
  // Exemplet på vårt verk är aldrig produktsidan (Axel 2026-09-29) — utan eget original är det vår sidas lista i annonsbiblioteket
  assert.match(an.falt.contentDescription, /for the product "Taköverdrag Husvagn"/); assert.equal(an.falt.originalWorkUrls[0], varAdLibraryLank(KONFIG, 'Bäverbutiken')); assert.equal(an.falt.originalWorkUrls[1], 'https://baverbutiken.se/products/takoverdrag');
  const b = beskrivning500(an);
  // En films miniatyr kan vara ett lånat klipp (Axel 2026-09-29) — när texten bär beviset görs inget anspråk på bilden
  assert.ok(b.length <= 500, `beskrivningen är ${b.length} tecken`); assert.match(b, /7 consecutive identical words/); assert.doesNotMatch(b, /our own advertising image/); assert.match(b, /our ad "Takoverdrag_PD_3_H1"/); assert.match(b, /bevis-1\.png/); assert.match(b, /Ref KD-2026-011 1\/10\.$/);
  const lang = byggAnmalan(arende, { ...annons, text: { ...annons.text, langsta: 80, kopieradeOrd: 80, passager: [{ text: 'ord '.repeat(200).trim() }] } }, KONFIG, { nr: 1, antal: 1, bevisbildUrl: 'https://cdn/x.png' });
  assert.ok(beskrivning500(lang).length <= 500, 'en lång passage kortas tills 500 håller');
  const v = formularVarden(an);
  assert.deepEqual(v.fel, []); assert.equal(v.ratt, 'Copyright'); assert.equal(v.plattform, 'Facebook'); assert.equal(v.land, 'Sweden'); assert.equal(v.ombud, true);
  assert.equal(v.rattighetshavare, 'Stonebite Ecom AB'); assert.equal(v.urls, an.lank); assert.equal(v.original, varAdLibraryLank(KONFIG, 'Bäverbutiken')); assert.ok(v.original.length <= 250); assert.equal(v.namn, 'Axel Odhner'); assert.equal(v.epost, KONFIG.anmalan.undertecknare.epost); assert.equal(v.signatur, 'Axel Odhner');
  assert.match(formularVarden({ ...an, falt: { ...an.falt, reporter: { ...an.falt.reporter, email: 'fel' } } }).fel.join(), /e-postadressen/);
  assert.equal(kodUrText('Your Meta verification code is 482913. Enter it within 10 minutes.'), '482913'); assert.equal(kodUrText('Kod: 1234'), '1234'); assert.equal(kodUrText('Hej! 55555555 är ditt tal'), '55555555'); assert.equal(kodUrText('ingen kod här'), null);
  assert.equal(kvarUrText('Foo 6 required fields remaining Submit'), 6); assert.equal(kvarUrText('1 required field remaining'), 1); assert.equal(kvarUrText('Submit'), 0);
  assert.equal(referensUrText('Thank you. Your report number is 1234567890123. We will'), '1234567890123'); assert.equal(referensUrText('Reference #: 98765432'), '98765432'); assert.equal(referensUrText('Thanks, nothing here 12'), null);
});

test('tolkaAntal och exponeringarUr: Axels avlästa tal i alla former', () => {
  assert.equal(tolkaAntal(12345), 12345); assert.equal(tolkaAntal('12 345'), 12345); assert.equal(tolkaAntal('12.345'), 12345); assert.equal(tolkaAntal('12,3 tn'), 12300);
  assert.equal(tolkaAntal('12.3K'), 12300); assert.equal(tolkaAntal('1,2 M'), 1200000); assert.equal(tolkaAntal('abc'), null); assert.equal(tolkaAntal(0), null); assert.equal(tolkaAntal(''), null); assert.equal(tolkaAntal(null), null);
  assert.deepEqual(exponeringarUr({ reach: '9 800' }), { antal: 9800, kalla: 'reach' }); assert.deepEqual(exponeringarUr({ exponeringar: 5, visningar: 9 }), { antal: 5, kalla: 'exponeringar' }); assert.deepEqual(exponeringarUr({}), { antal: null, kalla: null });
});

test('cpm: cpmUr, summeraInsights med prefix, insightsSokvag, hamtaCpm mot falsk klient (hoppar cpm:false, tål ett trasigt konto), valjCpm-ordningen', async () => {
  assert.equal(cpmUr(734244, 7500569), 97.9); assert.equal(cpmUr(0, 0), null); assert.equal(cpmUr(100, 2000), 50);
  assert.deepEqual(summeraInsights([{ campaign_name: 'CARASHELL_SE_x', spend: '10', impressions: '100' }, { campaign_name: 'DRYTREK_SE', spend: '99', impressions: '9' }], 'CARASHELL_'), { spend: 10, visningar: 100, kampanjer: 1 });
  assert.equal(insightsSokvag({ id: '1' }), 'act_1/insights?fields=spend,impressions&date_preset=last_30d');
  assert.match(insightsSokvag({ id: 'act_2', prefix: 'CARASHELL_' }, 'last_7d'), /^act_2\/insights\?level=campaign.*date_preset=last_7d.*CONTAIN.*CARASHELL_/);
  const anrop = [];
  const klient = { get: async (s) => { anrop.push(s); if (s.startsWith('act_9/')) throw new Error('Meta act_9/insights: (190) token'); return s.includes('level=campaign') ? { data: [{ campaign_name: 'CARASHELL_SE', spend: '200', impressions: '1000' }, { campaign_name: 'ANNAT', spend: '5', impressions: '1' }] } : { data: [{ spend: '100', impressions: '2000' }] }; } };
  const m = await hamtaCpm([{ id: '1', namn: 'A' }, { id: '2', namn: 'B', prefix: 'CARASHELL_' }, { id: '3', namn: 'US', prefix: 'CARASHELL_', cpm: false }, { id: '9', namn: 'Trasigt' }], { klient, nu: () => '2026-09-29T08:00:00Z' });
  assert.equal(m.sek, 100); assert.equal(m.spend, 300); assert.equal(m.visningar, 3000); assert.equal(m.period, 'last_30d');
  assert.equal(m.konton.length, 4); assert.equal(m.konton[1].kampanjer, 1); assert.match(m.konton[2].hoppad, /^cpm: false/); assert.match(m.konton[3].fel, /190/); assert.equal(anrop.length, 3);
  const utan = await hamtaCpm([{ id: '1', namn: 'A' }], { klient: null, token: null }); assert.equal(utan.sek, null); assert.match(utan.fel, /saknas/);
  assert.deepEqual(valjCpm({ override: 120, konfig: KONFIG, verksamhet: 'Bäverbutiken' }), { sek: 120, text: 'Bäverbutiken, Meta', period: null, kalla: 'axel', matt: null });
  const mattVal = valjCpm({ matt: { sek: 97.9, period: 'last_30d', matt: '2026-09-29T08:00:00Z' }, konfig: KONFIG, verksamhet: 'Bäverbutiken' }); assert.equal(mattVal.kalla, 'matt'); assert.equal(mattVal.sek, 97.9);
  const reserv = valjCpm({ konfig: KONFIG, verksamhet: 'Bäverbutiken' }); assert.equal(reserv.kalla, 'reserv'); assert.equal(reserv.sek, 97.9); assert.equal(reserv.matt, '2026-09-29');
  assert.equal(valjCpm({ konfig: { faktura: {} }, verksamhet: 'X' }), null);
  // Konfigens konton: CaraShells US-konto räknas inte in i CPM:en
  assert.equal(KONFIG.verksamheter.CaraShell.konton.find((k) => k.id === '1107817401910319').cpm, false);
});

test('Meta-anmälan: en per annons med länk, alla fält ifyllda på engelska, stopp utan undertecknare/bevis, texten och verifieringssidan', () => {
  assert.deepEqual(annonsLank('https://www.facebook.com/ads/library/?active_status=all&id=123456789012345&x=1'), { lank: 'https://www.facebook.com/ads/library/?id=123456789012345', libraryId: '123456789012345' });
  assert.deepEqual(annonsLank(''), { lank: null, libraryId: null });
  assert.match(varAdLibraryLank(KONFIG, 'Bäverbutiken'), /view_all_page_id=678639638662543$/); assert.equal(varAdLibraryLank(KONFIG, 'Okänd'), null);
  const t1 = { nr: 1, lank: 'https://www.facebook.com/ads/library/?id=111', exponeringar: 12345, start: '2026-09-01', text: { styrka: 'stark', kopieradeOrd: 31, langsta: 31, passager: [{ ord: 31, text: 'regnet löven och fågelskiten hamnar på taket' }] }, varAnnons: { namn: 'Takoverdrag_PD_1_H1', text: VAR_TEXT }, bilder: [], derasText: 'Regnet, löven och fågelskiten hamnar på taket! Köp nu.' };
  const t2 = { nr: 2, lank: null, text: { styrka: 'stark', kopieradeOrd: 9, langsta: 9, passager: [] }, bilder: [] };
  const t3 = { nr: 3, lank: 'https://www.facebook.com/ads/library/?id=333', video: true, text: null, bilder: [{ egen: 'https://cdn/ann.png', deras: '/tmp/skarm3.png', avstand: 1, grad: 'identisk' }], derasText: '' };
  const arende = { id: 'KD-2026-011', verksamhet: 'Bäverbutiken', typ: 'annons', status: 'ny', var: { produkt: { titel: 'Taköverdrag Husvagn', url: 'https://baverbutiken.se/products/takoverdrag', butik: 'https://baverbutiken.se', bilder: ['https://cdn/p1.png'] }, annons: { bild: 'https://cdn/ann.png' } }, deras: { sidnamn: 'Kopian', sidaId: '1299101096626433', doman: 'kopian.se' }, bevis: { annonser: [t1, t2, t3] }, brev: { skickat: { nar: '2026-09-29T10:00:00Z' } }, faktura: { nr: 'F-KD-2026-011-1' } };
  const { anmalningar, hoppade } = byggAnmalningar(arende, KONFIG, { nu: '2026-09-29T12:00:00Z', bevisbilder: { 1: { fil: 'arenden/KD-2026-011/anmalan/bevis-1.png', url: 'https://cdn.shopify.com/s/files/x/bevis-1.png' }, 3: { fil: 'arenden/KD-2026-011/anmalan/bevis-2.png', url: null } } });
  assert.equal(anmalningar.length, 2); assert.deepEqual(hoppade, [{ nr: 2, orsak: 'ingen Ad Library-länk' }]);
  const a1 = anmalningar[0];
  assert.equal(a1.nr, 1); assert.equal(a1.antal, 2); assert.equal(a1.libraryId, '111'); assert.equal(a1.formular, 'https://www.facebook.com/help/contact/1758255661104383');
  assert.equal(a1.falt.reporter.fullName, 'Axel Odhner'); assert.equal(a1.falt.reporter.email, KONFIG.anmalan.undertecknare.epost); assert.match(a1.falt.reporter.address, /Göteborg, Sweden$/);
  assert.equal(a1.falt.rightsOwner.name, 'Stonebite Ecom AB'); assert.equal(a1.falt.rightsOwner.registrationNumber, '559576-2401'); assert.match(a1.falt.rightsOwner.relationship, /^CEO of the rights owner Stonebite Ecom AB/);
  assert.deepEqual(a1.falt.contentUrls, ['https://www.facebook.com/ads/library/?id=111']);
  for (const m of ['Facebook page "Kopian" (page ID 1299101096626433)', '31 words of our advertising copy appear verbatim', '31 consecutive words: "regnet löven och fågelskiten hamnar på taket"', 'running since 1 September 2026', 'approximately 12,345 people in the EU', 'our ad "Takoverdrag_PD_1_H1" for the product "Taköverdrag Husvagn"', 'report 1 of 2', 'each ad is reported separately']) assert.ok(a1.falt.contentDescription.includes(m), `saknar: ${m}`);
  assert.deepEqual(a1.falt.originalWorkUrls, [varAdLibraryLank(KONFIG, 'Bäverbutiken'), 'https://baverbutiken.se/products/takoverdrag']);
  assert.match(a1.falt.additionalInfo, /https:\/\/cdn\.shopify\.com\/s\/files\/x\/bevis-1\.png/); assert.match(a1.falt.additionalInfo, /Internal reference: KD-2026-011, report 1\/2/); assert.match(a1.falt.additionalInfo, /cease-and-desist letter with invoice F-KD-2026-011-1 was sent to the advertiser on 29 September 2026/);
  assert.deepEqual(a1.falt.declarations, [...FORSAKRINGAR]); assert.equal(a1.falt.signature, 'Axel Odhner'); assert.equal(a1.bevisbildUrl, 'https://cdn.shopify.com/s/files/x/bevis-1.png');
  assert.deepEqual(kontrolleraAnmalan(a1), []);
  const a3 = anmalningar[1];
  assert.equal(a3.nr, 2); assert.equal(a3.libraryId, '333'); assert.match(a3.falt.contentDescription, /1 image in the ad is our own copyrighted advertising image — a still frame or photo taken from our own ad \(perceptual-hash comparison: identical, distance 1\/64\)/); assert.match(a3.falt.contentDescription, /The ad is a video/); assert.match(a3.falt.additionalInfo, /attached to this report/);
  assert.doesNotMatch(JSON.stringify(a3), /skarm3\.png/); // Axels lokala fil står aldrig i anmälan
  // Stopp: ingen undertecknare, ingen bevisbild
  const utan = byggAnmalan(arende, t1, { ...KONFIG, anmalan: { ...KONFIG.anmalan, undertecknare: {} } }, { nr: 1, antal: 1 });
  assert.match(kontrolleraAnmalan(utan).join(), /undertecknare saknas/); assert.match(kontrolleraAnmalan(utan).join(), /ingen bevisbild/);
  const txt = anmalanText(a1);
  for (const m of ['REPORT 1/2 — case KD-2026-011', 'Reported ad (URL): https://www.facebook.com/ads/library/?id=111', 'Full name: Axel Odhner', 'Rights owner: Stonebite Ecom AB (reg. no. 559576-2401)', '[x] I have a good faith belief', 'Electronic signature: Axel Odhner', 'Attachment: arenden/KD-2026-011/anmalan/bevis-1.png']) assert.ok(txt.includes(m), `saknar: ${m}`);
  // Bevisbilden: båda kolumnerna, passagen markerad hos dem, inga externa bilder
  assert.equal(markera('Regnet, löven och fågelskiten hamnar på taket! Köp nu.', 'regnet löven och fågelskiten hamnar på taket'), '<mark>Regnet, löven och fågelskiten hamnar på taket</mark>! Köp nu.');
  assert.equal(markera('helt annan text', 'regnet löven och fågelskiten'), 'helt annan text'); assert.equal(markera('a & b', null), 'a &amp; b');
  const html = bevisbildHtml(arende, t1, { miniatyr: (u) => (u === 'https://cdn/ann.png' ? 'data:image/png;base64,AAAA' : null), nu: '2026-09-29T12:00:00Z', nr: 1, antal: 2 });
  assert.match(html, /Copyright infringement evidence — case KD-2026-011, ad 1 of 2/); assert.match(html, /Our original — Takoverdrag_PD_1_H1/); assert.match(html, /Reported ad — page "Kopian"/); assert.match(html, /<mark>Regnet, löven och fågelskiten hamnar på taket<\/mark>/); assert.match(html, /EU reach ≈ 12,345/); assert.match(html, /31 words copied verbatim/);
  assert.match(html, /src="data:image\/png;base64,AAAA"/); assert.match(html, /No image in this ad/); assert.doesNotMatch(html, /src="http/);
  const v = verifieringHtml({ arende, anmalningar, bilder: { 1: 'data:image/png;base64,BBBB' }, uppdaterad: '2026-09-29T12:00:00Z' });
  assert.match(v, /<title>Anmälningar KD-2026-011<\/title>/); assert.match(v, /2 anmälningar till Meta — en per annons/); assert.match(v, /kör anmälningarna KD-2026-011/); assert.match(v, /Anmälan 1 av 2 — annons 111/); assert.match(v, /Anmälan 2 av 2 — annons 333/); assert.match(v, /Ingen bevisbild — anmälan går utan skärmdump/); assert.match(v, /Axel Odhner/); assert.doesNotMatch(v, /undefined|null/);
});

test('adLibraryToken: den verifierade personens användartoken först, sedan den vanliga', () => {
  assert.equal(adLibraryToken({ META_ACCESS_TOKEN: 'sys' }), 'sys'); assert.equal(adLibraryToken({ META_ACCESS_TOKEN: 'sys', META_ACCESS_TOKEN_ADLIBRARY: 'person' }), 'person'); assert.equal(adLibraryToken({}), null);
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

// ------------------------------------------------------------------ klipp (rutorna ur våra egna klipp, Axel 2026-09-29)

const H0 = '0000000000000000'; const H1 = 'ffffffffffffffff'; const H0b = '0000000000000001'; const HC = '00000000ffffffff'; const HE = '0f0f0f0f0f0f0f0f';
const RUTA = (t, hash) => ({ i: Math.round(t * 2), t, hash });
const KLIPP_ANNONS = () => ({ nr: 2, lank: 'https://www.facebook.com/ads/library/?id=2011809009499730', video: true, aktiv: true, exponeringar: 3364, start: '2026-09-24', text: null, bilder: [{ egen: 'https://cdn/v1.png', deras: 'https://kopian.se/cdn/k1.jpg', avstand: '8', grad: 'lik' }], varAnnons: { id: '1', namn: 'CaraShellRoof_DK_PD_1_H1' }, derasText: 'Regnet slår på taket.', klipp: { antal: 2, andel: 74, traffar: 50, rutor: 68, filmer: ['Takoverdrag_PD_2_H1', 'Takoverdrag_OB_1_H1'], jamforda: 131, par: [{ bokstav: 'A', derasT: 15, egenT: 11, avstand: 0, film: 'Takoverdrag_PD_2_H1' }, { bokstav: 'B', derasT: 23, egenT: 8, avstand: 0, film: 'Takoverdrag_OB_1_H1' }] } });
const KLIPP = () => ({ val: [{ bokstav: 'A', derasT: 15, egenT: 11, avstand: 0, egenFilm: { id: 'f1', namn: 'Takoverdrag_PD_2_H1' }, scen: { tFran: 14.5, tTill: 16 }, egenData: 'data:image/jpeg;base64,EGEN1', derasData: 'data:image/jpeg;base64,DERAS1' }, { bokstav: 'B', derasT: 23, egenT: 8, avstand: 0, egenFilm: { id: 'f2', namn: 'Takoverdrag_OB_1_H1' }, scen: { tFran: 22.5, tTill: 24 }, egenData: 'data:image/jpeg;base64,EGEN2', derasData: 'data:image/jpeg;base64,DERAS2' }], statistik: { andel: 74, traffar: 50, derasRutor: 68, filmer: 131 }, uteslutna: [{ derasT: 0, egenT: 0, avstand: 2, orsak: 'lånat klipp — utesluten ruta i scenen', egenData: 'data:image/jpeg;base64,LANAT1', derasData: 'data:image/jpeg;base64,LANAT2' }] });

test('klipp: dHash, avstand, tid, prefix och video-id-ordningen är rena och deterministiska', () => {
  const stigande = Buffer.from(Array.from({ length: 72 }, (_, i) => i % 9)); // varje rad 0..8: mörkare än grannen till höger ⇒ alla bitar 1
  const fallande = Buffer.from(Array.from({ length: 72 }, (_, i) => 8 - (i % 9)));
  assert.equal(dHash(stigande), H1); assert.equal(dHash(fallande), H0);
  assert.equal(avstand(H0, H1), 64); assert.equal(avstand(H0, H0b), 1); assert.equal(avstand(HC, HC), 0); assert.equal(avstand(H0, HC), 32);
  assert.equal(tid(7), '0:07'); assert.equal(tid(65.5), '1:05'); assert.equal(tid(null), '?');
  assert.equal(prefixUrNamn('Takoverdrag_RI_1_H1'), 'Takoverdrag_'); assert.equal(prefixUrNamn('CaraShellRoof_DK_PD_1_H1'), 'CaraShellRoof_'); assert.equal(prefixUrNamn('x'), null);
  assert.deepEqual(videoIdn({ video_id: 'reel', object_story_spec: { video_data: { video_id: 'story' } }, asset_feed_spec: { videos: [{ video_id: 'feed' }, { video_id: 'story' }] } }), ['story', 'reel', 'feed']);
});

test('klipp: scener, lånade rutor med fönster, och paren ur olika scener och filmer — det lånade klippet kastas och räknas inte', () => {
  const sc = scener([RUTA(0, H0), RUTA(0.5, H0), RUTA(1, H1), RUTA(1.5, H1)]);
  assert.equal(sc.length, 2); assert.deepEqual([sc[0].fran, sc[0].till, sc[1].fran, sc[1].tTill], [0, 1, 2, 1.5]);
  const lanade = lanadeRutor([RUTA(0, H0), RUTA(0.5, HC), RUTA(1, H1), RUTA(1.5, HC), RUTA(2, HC), RUTA(3, HC)], [H1], { fonsterS: 0.6 });
  assert.deepEqual([...lanade].sort((x, y) => x - y), [1, 2, 3], 'rutan vid 1 s och ± 0,6 s runt den');
  const film1 = { id: 'f1', namn: 'Takoverdrag_OB_1_H1', rutor: [RUTA(0, H0), RUTA(0.5, H0), RUTA(1, H0b), RUTA(6, H1)] };
  const film2 = { id: 'f2', namn: 'CaraShellRoof_PD_5_H1', rutor: [RUTA(0, HC), RUTA(0.5, HC), RUTA(1, HC)] };
  const deras = [RUTA(0, H0), RUTA(0.5, H0), RUTA(1, HE), RUTA(1.5, HC), RUTA(2, HC), RUTA(6, H1)];
  const p = paraRutor([film1, film2], deras, { uteslut: [H1], antal: 3 });
  assert.equal(p.val.length, 2, 'två scener hos dem matchar våra klipp — den tredje är det lånade klippet');
  assert.deepEqual(p.val.map((v) => v.bokstav), ['A', 'B']);
  assert.ok(p.val[0].derasT < p.val[1].derasT, 'i tidsordning');
  assert.deepEqual(p.val.map((v) => v.egenFilm.namn), ['Takoverdrag_OB_1_H1', 'CaraShellRoof_PD_5_H1']);
  assert.ok(p.val.every((v) => v.avstand === 0));
  assert.equal(p.uteslutna.length, 1); assert.match(p.uteslutna[0].orsak, /lånat klipp/); assert.equal(p.uteslutna[0].derasT, 6);
  assert.deepEqual([p.statistik.traffar, p.statistik.lanadeRutor, p.statistik.andel, p.statistik.uteslutnaScener, p.statistik.filmer], [4, 1, 67, 1, 2]);
  assert.deepEqual(p.statistik.perFilm, { Takoverdrag_OB_1_H1: 2, CaraShellRoof_PD_5_H1: 2 });
  const q = paraRutor(film1.rutor, deras, { antal: 3 }); // en platt rutlista = en film; utan uteslutning är det lånade klippet med
  assert.equal(q.uteslutna.length, 0); assert.equal(q.statistik.lanadeRutor, 0); assert.ok(q.val.some((v) => v.derasT === 6));
  assert.match(klippSammanfattning({ val: p.val, statistik: p.statistik }), /2 rutor ur olika scener/);
  assert.match(klippSammanfattning({ antal: 3, andel: 80 }, { sprak: 'en' }), /80% of its frames/);
  assert.match(klippSammanfattning({ antal: 1, andel: 33 }), /klippt ur våra: 1 ruta identisk med vår, 33 %/); assert.match(klippSammanfattning({ antal: 1, andel: 33 }, { sprak: 'en' }), /: 1 frame identical to ours, 33%/);
});

test('klipp: platta rutor bär aldrig ett par, bara filmer publicerade före deras annons, och lika nära ⇒ vår äldsta film', () => {
  const R = (t, hash, kontrast = 30) => ({ i: Math.round(t * 2), t, hash, kontrast });
  assert.equal(kontrastAv(Buffer.alloc(72, 7)), 0); assert.ok(kontrastAv(Buffer.from(Array.from({ length: 72 }, (_, i) => (i % 2 ? 0 : 200)))) > 90);
  const gammal = { id: 'g', namn: 'Takoverdrag_GL_1_H1', skapad: '2026-09-01T10:00:00+0200', rutor: [R(0, H0)] };
  const mellan = { id: 'm', namn: 'Takoverdrag_ML_1_H1', skapad: '2026-09-10T10:00:00+0200', rutor: [R(0, H0), R(5, HC)] };
  const ny = { id: 'n', namn: 'Takoverdrag_NY_1_H1', skapad: '2026-09-25T10:00:00+0200', rutor: [R(0, H0), R(1, HE)] };
  const deras = [R(0, H0), R(3, HC), R(6, HE)];
  const p = paraRutor([mellan, ny, gammal], deras, { fore: '2026-09-24' });
  assert.equal(p.statistik.filmerSenare, 1, 'filmen från 25/9 kan inte vara originalet till en annons som startade 24/9'); assert.equal(p.statistik.filmer, 2);
  assert.equal(p.val.length, 2, 'rutan som bara finns i den senare filmen blir inget par');
  assert.equal(p.val.find((v) => v.derasT === 0).egenFilm.namn, 'Takoverdrag_GL_1_H1', 'lika nära ⇒ den äldsta filmen'); assert.equal(p.val.find((v) => v.derasT === 0).egenFilm.skapad, '2026-09-01T10:00:00+0200');
  assert.equal(paraRutor([mellan, ny, gammal], deras, {}).val.length, 3, 'utan startdatum räknas alla filmer');
  const platt = paraRutor([gammal], [R(0, H0, 2)], {});
  assert.equal(platt.val.length, 0, 'en svart övertoning matchar varje annan svart ruta — den räknas aldrig'); assert.equal(platt.statistik.utanInnehall, 1);
  assert.equal(paraRutor([{ ...gammal, rutor: [R(0, H0, 3)] }], [R(0, H0)], {}).val.length, 0, 'en platt ruta hos oss räknas inte heller');
  // Produkten och datumen för paren
  const karta = new Map([['Takoverdrag_', { handle: 'takoverdrag' }], ['CaraShellRoof_', { handle: 'takskyddet' }]]);
  assert.equal(produktForPar([{ egenFilm: { namn: 'Takoverdrag_A_1' } }, { egenFilm: { namn: 'CaraShellRoof_B_1' } }, { egenFilm: { namn: 'Takoverdrag_C_1' } }], karta).handle, 'takoverdrag');
  assert.equal(produktForPar([{ egenFilm: { namn: 'Okand_A' } }], karta, { handle: 'reserv' }).handle, 'reserv');
  assert.deepEqual(filmdatum([{ egenFilm: { skapad: '2026-09-18T10:00:00+0200' } }, { egenFilm: { skapad: '2026-09-09T10:00:00+0200' } }]), { forsta: '2026-09-09', sista: '2026-09-18' }); assert.equal(filmdatum([]), null);
});

test('klipp: tagningarna ur klippbytena, och det lånade klippet spritt över HELA tagningen — hos dem och i våra filmer', () => {
  const R = (t, hash, kontrast = 30) => ({ i: Math.round(t * 2), t, hash, kontrast });
  const rutor = [R(0, H0), R(0.5, HE), R(1, H1), R(1.5, HC), R(2, H0b)];
  const tg = tagningar(rutor, [0.9, 1.9]);
  assert.deepEqual(tg.map((x) => [x.fran, x.till]), [[0, 1], [2, 3], [4, 4]]);
  assert.ok(scener(rutor).length > tg.length, 'hashhoppen delar skakig film i en scen per ruta — tagningen håller ihop den');
  assert.deepEqual(tagningar([{ i: 0, t: null, hash: H0 }, { i: 1, t: null, hash: H0 }]).length, 2, 'utan tid (thumbnails) är varje ruta en egen tagning');
  // Frö vid 0 s i annons 1 (förhandsbilden) ⇒ hela tagningen 0–0,5 s; samma lånade klipp i annons 3 ⇒ dess tagning också;
  // i vår film bara rutan som liknar det lånade (± 1 s) — och vår film sprider ALDRIG tillbaka till annons 2
  const a1r = [R(0, H0), R(0.5, HE), R(1, HE), R(1.5, H1)]; const fr = [R(0, HE), R(0.5, HC), R(3, H1)]; const a2r = [R(0, H1), R(0.5, HC)]; const a3r = [R(0, HC), R(0.5, H0b), R(1, H0b)];
  const lan = lanadeKlipp([{ nr: 1, rutor: a1r, fron: [0], scener: tagningar(a1r, [1.4]) }, { nr: 2, rutor: a2r, scener: tagningar(a2r, [0.4]) }, { nr: 3, rutor: a3r, scener: tagningar(a3r, [0.4]) }], [{ id: 'f', rutor: fr }]);
  assert.deepEqual([...lan.deras.get(1)].sort(), [0, 1, 2], 'tagningen 0–1 s, inte rutan vid 1,5 s');
  // Kantrutan (sista rutan före ett klippbyte) utesluts men sprider inte — den kan visa grannklippet
  const kant = lanadeKlipp([{ nr: 1, rutor: [R(0, H0), R(0.5, H1), R(1, HC)], fron: [0], scener: tagningar([R(0, H0), R(0.5, H1), R(1, HC)], [0.9]) }, { nr: 2, rutor: [R(0, H1), R(0.5, H1)] }], []);
  assert.equal(kant.deras.has(2), false, 'H1 var kantrutan i annons 1 — annons 2 som bär H1 märks inte');
  // En enstaka lik ruta räcker inte: tagningen behöver två träffar
  const en = lanadeKlipp([{ nr: 1, rutor: [R(0, H0), R(0.5, H0)], fron: [0], scener: tagningar([R(0, H0), R(0.5, H0)], []) }, { nr: 2, rutor: [R(0, H0b), R(0.5, HE), R(1, HC)], scener: tagningar([R(0, H0b), R(0.5, HE), R(1, HC)], []) }], []);
  assert.equal(en.deras.has(2), false, 'bara en av tre rutor liknar det lånade');
  assert.deepEqual([...lan.deras.get(3)].sort(), [1, 2], 'annons 3 bär samma lånade klipp (H0b ~ H0) i tagningen 0,5–1 s');
  assert.deepEqual([...lan.egna.get('f')].sort(), [0, 1], 'vår film: rutan som liknar det lånade + 1 s runt den, inte rutan vid 3 s');
  assert.equal(lan.deras.has(2), false, 'vår film sprider aldrig tillbaka (HC hos oss ligger bredvid det lånade, men är inte lånat)');
  assert.deepEqual([...lanadeKlipp([], [{ id: 'f', rutor: fr }], { fronEgna: [{ id: 'f', t: 0.5 }] }).egna.get('f')].sort(), [0, 1], '--lanat pekar ut rutan i vår film (± 1 s)');
  assert.equal(lanadeKlipp([{ nr: 1, rutor: [R(0, H0, 2)], fron: [0] }], [{ id: 'g', rutor: [R(0, H0, 2)] }]).egna.size, 0, 'platta rutor sprider aldrig');
  // paraRutor: en lånad ruta i en tagning hos dem utesluter HELA tagningen
  const deras = [R(0, H0), R(0.5, HE), R(1, HC)];
  const p = paraRutor([{ id: 'g', namn: 'Takoverdrag_X_1_H1', rutor: [R(0, H0), R(0.5, HE), R(1, HC)] }], deras, { derasScener: tagningar(deras, [0.9]), lanadeDerasExtra: new Set([0]) });
  assert.ok(p.val.length >= 1 && p.val.every((v) => v.derasT >= 1), 'bara tagningen vid 1 s får bära ett par');
});

test('brevet och Meta-anmälan: går anmälningarna in samtidigt säger brevet det rakt ut — och hotar inte med dem som villkor', () => {
  const t = { nr: 1, lank: 'https://www.facebook.com/ads/library/?id=1', text: { styrka: 'stark', kopieradeOrd: 12, langsta: 12, passager: [{ ord: 12, text: 'regnet löven och fågelskiten hamnar på taket och det är precis den ytan' }] }, bilder: [] };
  const a = { id: 'KD-2026-012', typ: 'annons', verksamhet: 'Bäverbutiken', skapad: '2026-09-29T08:00:00Z', deras: { sidnamn: 'Kopian', doman: 'kopian.se', plattform: 'shopify', mottagare: 'info@kopian.se' }, bevis: { annonser: [t] }, anmalan: { antal: 3, baraAktiva: true, rapporter: [{ nr: 1 }, { nr: 2 }, { nr: 3 }] } };
  const opt = { avsandare: { brand: 'Bäverbutiken', mail: 'contact@stonebite.org' }, foretag: FORETAG, nu: new Date('2026-09-29T10:00:00Z') };
  const villkor = byggBrev(a, opt).text;
  assert.match(villkor, /– anmäla intrånget till Meta \(Facebook och Instagram\) och till Shopify/); assert.doesNotMatch(villkor, /anmäls samtidigt/);
  const nu = byggBrev(a, { ...opt, anmalanSamtidigt: true }).text;
  assert.match(nu, /De 3 aktiva annonserna anmäls samtidigt till Meta \(Facebook och Instagram\) för upphovsrättsintrång, en anmälan per annons\./);
  assert.match(nu, /– anmäla intrånget till Shopify enligt/); assert.doesNotMatch(nu, /– anmäla intrånget till Meta/);
  const en = byggBrev({ ...a, deras: { ...a.deras, lang: 'en', doman: 'copy.com' } }, { ...opt, anmalanSamtidigt: true }).text;
  assert.match(en, /The 3 active ads are being reported at the same time to Meta/);
  // Redan inskickade: påminnelsen hotar inte med Meta igen
  const inne = { ...a, status: 'skickad', brev: { skickat: { nar: '2026-09-29T10:00:00Z' } }, anmalan: { ...a.anmalan, rapporter: [{ nr: 1, inskickad: '2026-09-29T10:05:00Z', referens: '123456789' }] } };
  const pam = byggBrev(inne, { ...opt, paminnelse: true, nu: new Date('2026-10-01T12:00:00Z') }).text;
  assert.match(pam, /Annonserna är redan anmälda till Meta\. Därefter anmäler vi intrånget till Shopify/);
});

test('bevisStatus: text, film ur våra klipp, en bildannons bild — en films miniatyr bär aldrig ensam', () => {
  const vid = { video: true, bilder: [{ egen: 'e', deras: 'd' }] };
  assert.deepEqual([bevisStatus({ text: { styrka: 'stark' } }).grund, bevisStatus({ text: { styrka: 'stark' } }).bevisad], ['text', true]);
  assert.equal(bevisStatus({ ...vid, klipp: { antal: 3 }, klippStatus: 'bevisad' }).grund, 'film');
  assert.equal(bevisStatus({ ...vid, text: { styrka: 'trolig' }, klipp: { antal: 3 }, klippStatus: 'bevisad' }).grund, 'text+film');
  assert.equal(bevisStatus({ video: false, bilder: [{ egen: 'e', deras: 'd' }] }).grund, 'bild');
  const ov = bevisStatus(vid); assert.equal(ov.grund, 'miniatyr'); assert.equal(ov.overifierad, true);
  const lanad = bevisStatus({ ...vid, klippStatus: 'ej_bevisad', klippFel: 'alla matchande scener bär den uteslutna (lånade) rutan' });
  assert.equal(lanad.bevisad, false); assert.match(lanad.orsak, /^bara lånat material matchar — alla matchande scener/);
  assert.equal(bevisStatus({ ...vid, text: { styrka: 'trolig' }, klippStatus: 'ej_bevisad' }).grund, 'text', 'texten bär även när klippen bara hittade det lånade');
  assert.match(bevisStatus({ ...vid, klippStatus: 'fel', klippFel: '404' }).orsak, /klippjämförelsen gick inte: 404/);
  assert.equal(bevisStatus({}).bevisad, false);
});

test('bevisbildHtml: länken till vårt original per par bara när vår annons startade före deras', () => {
  const a = ARENDE(); const annons = { ...KLIPP_ANNONS(), start: '2026-09-24' }; const klipp = KLIPP();
  const original = { Takoverdrag_PD_2_H1: { lank: 'https://fb/?id=TIDIG', start: '2026-09-18' }, Takoverdrag_OB_1_H1: { lank: 'https://fb/?id=SEN', start: '2026-09-27' } };
  const html = bevisbildHtml(a, annons, { miniatyr: () => null, nu: '2026-09-29T10:00:00Z', nr: 1, antal: 10, klipp, original });
  assert.match(html, /our original in the Ad Library: https:\/\/fb\/\?id=TIDIG/);
  assert.doesNotMatch(html, /id=SEN/, 'vår annons som startade efter deras visas aldrig som original');
  assert.equal(startadeFore({ start: '2026-09-24' }, '2026-09-24'), false, 'samma dag räknas inte');
  assert.equal(startadeFore({ start: '2026-09-23' }, '2026-09-24T08:00:00Z'), true);
  assert.equal(startadeFore({}, '2026-09-24'), true, 'okänt datum hos oss kan inte dömas');
});

test('klipp: hittaFfmpeg tar första binären som klarar H.264 och redovisar dem som inte gör det', () => {
  const finns = () => true; const lasMapp = () => { throw new Error('inget'); };
  const a = hittaFfmpeg({ env: { FFMPEG: '/x/utan' }, hem: '/ingen', kolla: () => false, finns, lasMapp });
  assert.equal(a.bin, null); assert.ok(a.provade.includes('/x/utan'));
  const b = hittaFfmpeg({ env: { FFMPEG: '/x/med' }, hem: '/ingen', kolla: (k) => k === '/x/med', finns, lasMapp });
  assert.equal(b.bin, '/x/med');
});

test('bevisbildHtml och verifieringHtml med klipp: paren ur våra filmer, aldrig miniatyrträffen, det lånade klippet utpekat', () => {
  const a = ARENDE(); const annons = KLIPP_ANNONS(); const klipp = KLIPP();
  const html = bevisbildHtml(a, annons, { miniatyr: () => 'data:image/jpeg;base64,MINI', nu: '2026-09-29T10:00:00Z', nr: 1, antal: 10, klipp });
  assert.match(html, /cut from our own advertising films \("Takoverdrag_PD_2_H1", "Takoverdrag_OB_1_H1"\)/);
  assert.match(html, /Pair A · perceptual-hash distance 0\/64 · scene 0:14–0:16/); assert.match(html, /Our film — Takoverdrag_OB_1_H1 · 0:08/); assert.match(html, /Reported ad · 0:23/);
  assert.match(html, /74% of the reported video's sampled frames \(50 of 68\) match our films frame for frame \(compared against 131 of our films\)/);
  assert.doesNotMatch(html, /MINI/, 'miniatyrträffen (det lånade klippet) visas aldrig när klippen finns'); assert.doesNotMatch(html, /Our original/);
  assert.match(html, /EGEN1/); assert.match(html, /DERAS2/);
  const utan = bevisbildHtml(a, annons, { miniatyr: () => 'data:image/jpeg;base64,MINI', nr: 1, antal: 10 });
  assert.doesNotMatch(utan, /MINI/, 'en film med klipp visar aldrig miniatyren, inte ens utan rutorna'); assert.match(utan, /Our original/);
  const overifierad = bevisbildHtml(a, { ...annons, klipp: null }, { miniatyr: () => 'data:image/jpeg;base64,MINI', nr: 1, antal: 10 });
  assert.match(overifierad, /MINI/, 'klippvalet aldrig kört: miniatyren är det enda — kor.mjs stoppar anmälan tills --klipp körts');
  const an = byggAnmalan(a, annons, KONFIG, { undertecknare: { namn: 'Axel Odhner', epost: 'axel.odhner@stonebite.org', roll: 'CEO' }, nr: 1, antal: 10, nu: '2026-09-29T10:00:00Z', bevisbild: 'arenden/x/anmalan/bevis-1.png' });
  const v = verifieringHtml({ arende: a, anmalningar: [an], bilder: { 1: 'data:image/png;base64,PNG' }, klippen: { 2: klipp }, uppdaterad: '2026-09-29T10:00:00Z' });
  assert.match(v, /Rutorna på bevisbilden är ur våra egna klipp:/); assert.match(v, /A = deras 0:15 ↔ vår Takoverdrag_PD_2_H1 0:11 \(0\/64\)/);
  assert.match(v, /Lånat klipp som INTE används/); assert.match(v, /LANAT2/); assert.match(v, /ruta B är lånad/);
});

test('byggAnmalan och beskrivning500 med klipp: filmen klippt ur våra, tiderna och andelen — miniatyrträffen nämns inte', () => {
  const a = ARENDE(); const annons = KLIPP_ANNONS();
  const an = byggAnmalan(a, annons, KONFIG, { undertecknare: { namn: 'Axel Odhner', epost: 'axel.odhner@stonebite.org', roll: 'CEO' }, nr: 3, antal: 10, nu: '2026-09-29T10:00:00Z', bevisbildUrl: 'https://cdn.shopify.com/s/files/x/bevis-3.png' });
  assert.match(an.falt.contentDescription, /The ad's video is cut from our own ad films "Takoverdrag_PD_2_H1", "Takoverdrag_OB_1_H1": 2 still frames from different scenes of the reported video \(at 0:15, 0:23\) are identical to frames of our films \(perceptual-hash distance 0, 0\/64\), and 74% of the reported video's sampled frames match our films frame for frame \(compared against 131 of our films\)\./);
  assert.doesNotMatch(an.falt.contentDescription, /our own copyrighted advertising image/); assert.doesNotMatch(an.falt.contentDescription, /The ad is a video that uses our material/);
  assert.match(an.falt.additionalInfo, /frames from our film on the left, the same frames in the reported ad on the right/);
  const b = beskrivning500(an);
  assert.ok(b.length <= 500, String(b.length));
  assert.match(b, /Its video is cut from our own ad films: 2 stills from different scenes \(at 0:15, 0:23\) are identical to ours; 74% of its frames match our films\./);
  assert.match(b, /Original: our ad films "Takoverdrag_PD_2_H1", "Takoverdrag_OB_1_H1" for "/); assert.doesNotMatch(b, /CaraShellRoof_DK_PD_1_H1/, 'miniatyrens annons nämns aldrig');
  // Filmernas datum: publicerade före deras annons
  const medDatum = byggAnmalan(a, { ...annons, klipp: { ...annons.klipp, datum: { forsta: '2026-08-12', sista: '2026-09-02' } } }, KONFIG, { undertecknare: { namn: 'Axel Odhner', epost: 'axel.odhner@stonebite.org', roll: 'CEO' }, nr: 3, antal: 10, nu: '2026-09-29T10:00:00Z', bevisbildUrl: 'https://cdn.shopify.com/s/files/x/bevis-3.png' });
  assert.match(medDatum.falt.contentDescription, /\(published by us between 12 August 2026 and 2 September 2026, before this ad started running on 24 September 2026\)/);
  assert.match(medDatum.falt.originalWorkDescription, /^Original advertising films produced by/); assert.deepEqual(medDatum.filmer, ['Takoverdrag_PD_2_H1', 'Takoverdrag_OB_1_H1']);
  assert.match(b, /Ref KD-2026-007 3\/10\./);
  // Tre långa filmnamn + CDN-länken: texten kortas i steg, referensen i slutet klipps aldrig
  const lang = beskrivning500({ ...an, filmer: ['CaraShellRoof_OB_101_H1', 'Takoverdrag_OB_1_H1', 'Takoverdrag_SP_4_H1'], produkt: 'Taköverdrag Husvagn – Skyddar Den Dyraste Ytan', bevisbildUrl: 'https://cdn.shopify.com/s/files/1/0976/7508/4115/files/bevis-1_ec5b0e36-a63f-44eb-b297-ed5cfd0ec94b.png?v=1790682335' });
  assert.ok(lang.length <= 500, String(lang.length)); assert.match(lang, /Ref KD-2026-007 3\/10\.$/);
});

test('samma tagning: skillnadOvre räknar bara de övre raderna (textrutan längst ner räknas inte), tröskeln skiljer mätta fall', () => {
  const a = Buffer.alloc(576, 100);
  assert.equal(skillnadOvre(a, Buffer.from(a)), 0);
  const nedre = Buffer.from(a); for (let i = 14 * 32; i < 576; i++) nedre[i] = 255; // bara textrutans rader skiljer
  assert.equal(skillnadOvre(a, nedre), 0);
  assert.equal(skillnadOvre(a, Buffer.alloc(576, 130)), 30);
  assert.equal(skillnadOvre(null, a), null);
  // Mätt 2026-09-29: samma bild 1,1–15,6 och annons 9 B/C 11,7 (under), olika par 29,1+ (över)
  assert.ok(11.7 < SAMMA_TAGNING && 15.6 < SAMMA_TAGNING && 29.1 > SAMMA_TAGNING);
});

test('original: fraserna, landet, sökningen, svaren ur annonsbiblioteket, jämförelsen och valet', () => {
  const text = 'Tror du att du måste täcka hela husvagnstaket? Det är allt det tar. Spänns fast med rem och dragsko i kanten, klart på tio minuter. 210D-väv i 5 storlekar.';
  // Kroken först, sedan de längsta; under 5 ord och siffror bort
  assert.deepEqual(fraserUrText(text), ['Tror du att du måste täcka hela husvagnstaket', 'Spänns fast med rem och dragsko i kanten', 'Det är allt det tar']);
  assert.equal(frasUrText(text), 'Tror du att du måste täcka hela husvagnstaket'); assert.deepEqual(fraserUrText(text, { max: 1 }), [frasUrText(text)]);
  assert.equal(frasUrText('Köp nu! 199 kr.'), null); assert.deepEqual(fraserUrText(''), []);
  assert.equal(fraserUrText('ett två tre fyra fem sex sju åtta nio tio elva tolv')[0].split(' ').length, 10);
  assert.equal(landUrNamn('CaraShellRoof_NO_UG_101_H1'), 'NO'); assert.equal(landUrNamn('CaraShellRoof_UK_PD_1'), 'GB'); assert.equal(landUrNamn('Takoverdrag_SP_4_H1'), 'SE');
  const u = sokUrl('rem och dragsko', { land: 'NO' });
  assert.match(u, /country=NO/); assert.match(u, /search_type=keyword_exact_phrase/); assert.match(u, /active_status=all/); assert.match(u, /q=%22rem%20och%20dragsko%22/);
  const svar = `for (;;);{"data":{"x":[{"ad_archive_id":"1","snapshot":{}},{"ad_archive_id":"1","snapshot":{}}]}}\ninte json\n{"y":{"ad_archive_id":"2","snapshot":{"body":{}}}}`;
  assert.deepEqual(annonserUrSvar(svar).map((x) => x.ad_archive_id), ['1', '2']);
  const H0 = '0000000000000000'; const H1 = 'ffffffffffffffff';
  const film = [{ hash: H0, kontrast: 20 }, { hash: H1, kontrast: 20 }];
  const annons = [{ hash: '0000000000000003', kontrast: 20 }, { hash: 'f0f0f0f0f0f0f0f0', kontrast: 20 }, { hash: H0, kontrast: 2 }];
  assert.equal(andelLika(annons, film), 0.5, 'den platta rutan räknas inte'); assert.equal(andelLika(film, annons), 0.5); assert.equal(andelLika([], film), 0);
  const k = [{ id: 'a', andel: 0.95, tackning: 0.95, sidaId: 'CS', start: '2026-09-10' }, { id: 'b', andel: 0.9, tackning: 0.9, sidaId: 'BB', start: '2026-09-15' }, { id: 'c', andel: 0.3, tackning: 0.9, sidaId: 'BB', start: '2026-09-01' }];
  assert.equal(valjOriginal(k, { egenSida: 'BB' }).id, 'b', 'filmens egen sida först'); assert.equal(valjOriginal(k).id, 'a', 'annars tidigast'); assert.equal(valjOriginal([k[2]]), null, `lika < ${MIN_ANDEL} åt ett håll räknas aldrig`);
  // Ledfilmen: flest matchade rutor, annars flest par, annars ordningen
  const klipp = { filmer: ['A', 'B', 'C'], perFilm: { A: 2, B: 10, C: 1 }, par: [{ film: 'A' }, { film: 'A' }, { film: 'C' }] };
  assert.equal(ledfilm(klipp), 'B'); assert.equal(ledfilm({ ...klipp, perFilm: undefined }), 'A'); assert.equal(ledfilm({ filmer: [] }), null);
  assert.deepEqual(originalFor(klipp, { A: { lank: 'LA' }, B: { lank: 'LB' }, C: { fel: 'x' } }).map((o) => [o.film, o.lank]), [['B', 'LB'], ['A', 'LA']]);
  // Vår annons som startade samma dag som deras eller senare är aldrig exemplet (ORVO Norge: vår US-annons 27/9, deras 24/9)
  const org = { A: { lank: 'LA', start: '2026-09-18' }, B: { lank: 'LB', start: '2026-09-27' }, C: { lank: 'LC', start: '2026-09-24' } };
  assert.deepEqual(originalFor(klipp, org, { fore: '2026-09-24' }).map((o) => o.film), ['A'], 'B (27/9) och C (samma dag) faller bort');
  assert.deepEqual(originalFor(klipp, org).map((o) => o.film), ['B', 'A', 'C'], 'utan deras startdatum: ledfilmen först som förut');
  assert.deepEqual(originalFor(klipp, { B: { lank: 'LB' } }, { fore: '2026-09-24' }).map((o) => o.film), ['B'], 'okänt startdatum hos oss kan inte dömas och står kvar');
});

test('hittaOriginal: fras för fras, bara våra sidor, bara en film som ÄR vår — aldrig en träff som bara delar texten', async () => {
  const H0 = '0000000000000000'; const H1 = 'ffffffffffffffff';
  const vara = [{ hash: H0, kontrast: 20 }, { hash: H1, kontrast: 20 }];
  const annan = [{ hash: 'f0f0f0f0f0f0f0f0', kontrast: 20 }];
  const sokt = [];
  const sokFn = async (_p, fras) => { sokt.push(fras); return fras.startsWith('Tror') ? [{ id: '1', lank: 'L1', sidaId: '999', videoUrl: 'v1' }, { id: '2', lank: 'L2', sidaId: 'BB', videoUrl: 'v2', start: '2026-09-15' }] : [{ id: '2', lank: 'L2', sidaId: 'BB', videoUrl: 'v2' }, { id: '3', lank: 'L3', sidaId: 'BB', videoUrl: 'v3', start: '2026-09-16', sida: 'Bäverbutiken.se' }]; };
  const hamtade = [];
  const opt = { film: { namn: 'Takoverdrag_UG_1_H1', rutor: vara, sida: 'BB' }, text: 'Tror du att du måste täcka hela husvagnstaket? Spänns fast med rem och dragsko i kanten. Det är allt det tar.', varaSidor: ['BB', 'CS'], ffmpeg: 'ff', mapp: mkdtempSync(join(tmpdir(), 'orig-')), sokFn, hamtaFn: async (url) => { hamtade.push(url); }, rutorFn: (_ff, fil) => (fil.includes('bibl-3') ? vara : annan) };
  const r = await hittaOriginal(null, opt);
  assert.equal(r.arkivId, '3'); assert.equal(r.lank, 'L3'); assert.equal(r.sida, 'Bäverbutiken.se'); assert.equal(r.andel, 1); assert.equal(r.tackning, 1);
  assert.equal(r.fras, 'Spänns fast med rem och dragsko i kanten'); assert.equal(sokt.length, 2, 'den tredje frasen söks aldrig när den andra gav träffen');
  assert.deepEqual(hamtade, ['v2', 'v3'], 'annan sida hämtas aldrig, och samma kandidat laddas bara ner en gång');
  assert.ok(existsSync(join(opt.mapp, 'bibl-2.json')), 'rutorna cachas per arkiv-id');
  const ingen = await hittaOriginal(null, { ...opt, sokFn: async () => [] });
  assert.match(ingen.fel, /ingen videoannons på våra sidor med fraserna "Tror du/); assert.equal(ingen.land, 'SE'); assert.equal(ingen.provade, 0);
  const falsk = await hittaOriginal(null, { ...opt, mapp: mkdtempSync(join(tmpdir(), 'orig-')), rutorFn: () => annan });
  assert.match(falsk.fel, /2 träff\(ar\) på våra sidor, men ingen film var Takoverdrag_UG_1_H1/);
  assert.match((await hittaOriginal(null, { ...opt, text: 'Köp nu!' })).fel, /ingen fras/);
});

test('byggAnmalan med originalen: exemplet är vår annons i annonsbiblioteket, länkarna i beskrivningen, aldrig produktsidan först', () => {
  const a = ARENDE(); const annons = KLIPP_ANNONS();
  const PD2 = 'https://www.facebook.com/ads/library/?id=2000363993957496'; const OB1 = 'https://www.facebook.com/ads/library/?id=1619798969500412';
  const original = { Takoverdrag_OB_1_H1: { lank: OB1, arkivId: '1619798969500412', sida: 'Bäverbutiken.se', start: '2026-09-18' }, Takoverdrag_PD_2_H1: { lank: PD2, arkivId: '2000363993957496', sida: 'Bäverbutiken.se', start: '2026-09-15' } };
  const u = { undertecknare: { namn: 'Axel Odhner', epost: 'axel.odhner@stonebite.org', roll: 'CEO' }, nr: 3, antal: 10, nu: '2026-09-29T10:00:00Z', bevisbildUrl: 'https://cdn.shopify.com/s/files/1/0976/7508/4115/files/bevis-1_ec5b0e36-a63f-44eb-b297-ed5cfd0ec94b.png?v=1790682335' };
  const an = byggAnmalan(a, annons, KONFIG, { ...u, original });
  assert.deepEqual(an.falt.originalWorkUrls.slice(0, 2), [PD2, OB1]); assert.equal(an.falt.originalWorkUrls.at(-1), 'https://baverbutiken.se/products/takoverdrag');
  assert.deepEqual(an.originaler.map((o) => o.film), ['Takoverdrag_PD_2_H1', 'Takoverdrag_OB_1_H1']);
  assert.match(an.falt.contentDescription, /Our original ads are public in Meta's Ad Library: "Takoverdrag_PD_2_H1" https:\/\/www\.facebook\.com\/ads\/library\/\?id=2000363993957496, "Takoverdrag_OB_1_H1" /);
  assert.match(an.falt.originalWorkDescription, /public in Meta's Ad Library, run by our page Bäverbutiken\.se \(links below\)/);
  assert.equal(formularVarden(an).original, PD2);
  const b = beskrivning500(an);
  assert.ok(b.length <= 500, String(b.length)); assert.match(b, /Original: our ads? in the Ad Library https:\/\/www\.facebook\.com\/ads\/library\/\?id=2000363993957496/); assert.doesNotMatch(b, /"Takoverdrag_PD_2_H1"/); assert.match(b, /Ref KD-2026-007 3\/10\.$/);
  const tre = beskrivning500({ ...an, originaler: [...an.originaler, { film: 'X', lank: 'https://www.facebook.com/ads/library/?id=1402118762047171' }], produkt: 'Taköverdrag Husvagn – Skyddar Den Dyraste Ytan' });
  assert.ok(tre.length <= 500, String(tre.length)); assert.match(tre, /id=2000363993957496/); assert.match(tre, /Ref KD-2026-007 3\/10\.$/);
  // Utan original: vår sidas lista i annonsbiblioteket först, produktsidan sist
  const utan = byggAnmalan(a, annons, KONFIG, u);
  assert.equal(utan.falt.originalWorkUrls[0], varAdLibraryLank(KONFIG, 'Bäverbutiken')); assert.deepEqual(utan.originaler, []); assert.doesNotMatch(utan.falt.contentDescription, /public in Meta's Ad Library/);
});

test('brevet och ärenderapporten med klipp: filmen är klippt ur vår — inte "bild(er) identiska"', () => {
  const a = ARENDE(); a.bevis.annonser = [KLIPP_ANNONS()];
  const sv = [].concat(bevisrader(a, 'sv')).join('\n');
  assert.match(sv, /film klippt ur våra egna reklamfilmer/); assert.match(sv, /filmen är klippt ur våra: 2 rutor ur olika scener identiska med våra, 74 % av er film matchar våra filmer ruta för ruta/); assert.doesNotMatch(sv, /bild\(er\) identiska/);
  assert.match(sv, /← Takoverdrag_PD_2_H1, Takoverdrag_OB_1_H1 ·/); assert.doesNotMatch(sv, /CaraShellRoof_DK_PD_1_H1/, 'miniatyrens annons nämns aldrig');
  const en = [].concat(bevisrader(a, 'en')).join('\n');
  assert.match(en, /the video is cut from ours: 2 frames from different scenes identical to ours, 74% of your video matches our films frame for frame/);
  // En film där bara det lånade klippet matchade står inte i brevet alls
  const b2 = ARENDE(); b2.bevis.annonser = [KLIPP_ANNONS(), { ...KLIPP_ANNONS(), nr: 9, lank: 'https://www.facebook.com/ads/library/?id=9', klipp: null, klippStatus: 'ej_bevisad', klippFel: 'bara det lånade' }];
  const sv2 = [].concat(bevisrader(b2, 'sv')).join('\n');
  assert.match(sv2, /• Annonser: 1 av era annonser/); assert.doesNotMatch(sv2, /id=9/);
  const md = arendeMd(a);
  assert.match(md, /## Rutorna ur våra egna klipp \(1 annonser\)/); assert.match(md, /A 0:15 ↔ Takoverdrag_PD_2_H1 0:11 \(0\/64\)/); assert.match(md, /74 % \(131 filmer jämförda\)/); assert.match(md, /lånat klipp och används inte som bevis/);
});
