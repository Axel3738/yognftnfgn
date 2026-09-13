// Mejlmallarna: Liquid-utdata som Shopify kan tolka, förhandsvisning utan
// Liquid, produktvalet, komplementkartan och erbjudandets villkor. Inget nätverk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
  byggAlla,
  byggMall,
  valjProdukter,
  valjKomplement,
  kortnamn,
  ersatt,
  MALLAR,
  kr,
  exempelSlutdatum,
  exempelPaketdeadline,
  slutdatumLiquid,
  bildLiten,
  gemensamtPrefix,
} from '../mallar.mjs';
import { byggSida } from '../sida.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const konfig = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(ROT, 'copy.json'), 'utf8'));

const p = (handle, pris, extra = {}) => ({
  id: handle, variant_id: '1', titel: `${handle} – Undertitel`, handle, url: `https://x.se/products/${handle}`,
  pris, jamforpris: null, lager: 10, lagerpolicy: 'CONTINUE', bild: `https://cdn/files/${handle}.jpg`, typ: '', taggar: [], kollektioner: ['alla-produkter'], ...extra,
});
// Liten fiktiv butik med egen komplementkarta, så logiken testas utan att
// bero på den riktiga kartan i konfig.json.
const ALLA = [
  ...konfig.erbjudande.gratisprodukter.map((h) => p(h, 169)),
  p('bat-a', 299, { kollektioner: ['alla-produkter', 'bat-marin'] }),
  p('bat-b', 269, { kollektioner: ['alla-produkter', 'bat-marin'] }),
  p('bat-c', 319, { kollektioner: ['alla-produkter', 'bat-marin'] }),
  p('bat-d', 359, { kollektioner: ['alla-produkter', 'bat-marin'] }),
  p('sko-a', 349, { kollektioner: ['alla-produkter', 'skor'] }),
  p('slut', 999, { lager: 0, lagerpolicy: 'DENY' }),
  p('utan-bild', 9999, { bild: null }),
  p('ensam', 49),
];
const KONFIG = {
  ...konfig,
  komplement: {
    antal: 3,
    en_till: true,
    per_handle: { 'bat-a': ['bat-b', 'finns-inte', 'slut', 'utan-bild', konfig.erbjudande.gratisprodukter[0], 'bat-c', 'bat-d'] },
    per_kollektion: { 'bat-marin': ['bat-a', 'bat-b', 'bat-c', 'bat-d'] },
    fallback: ['bat-a', 'sko-a', 'bat-b', 'bat-c'],
  },
};
const produkter = valjProdukter(ALLA, KONFIG);
const indata = { konfig: KONFIG, copy, produkter };

const rakna = (s, re) => (s.match(re) ?? []).length;

test('valjProdukter: gratis i konfigens ordning, okänd handle stoppar', () => {
  assert.deepEqual(produkter.gratis.map((x) => x.handle), konfig.erbjudande.gratisprodukter);
  const fel = { ...KONFIG, erbjudande: { ...konfig.erbjudande, gratisprodukter: ['finns-inte'] } };
  assert.throws(() => valjProdukter(ALLA, fel), /finns-inte/);
});

test('valjKomplement: per_handle vinner, hoppar okänd/slut/utan bild/gratis/sig själv, fyller på ur fallback', () => {
  const km = produkter.komplement;
  assert.deepEqual(km.karta.get('bat-a').lista, ['bat-b', 'bat-c', 'bat-d']);
  assert.equal(km.karta.get('bat-a').kalla, 'per_handle');
  assert.deepEqual(km.okanda, ['finns-inte']);
  // Kollektionen: bat-b får listan minus sig själv, påfylld ur fallback.
  assert.deepEqual(km.karta.get('bat-b').lista, ['bat-a', 'bat-c', 'bat-d']);
  assert.equal(km.karta.get('bat-b').kalla, 'per_kollektion');
  // Utan karta och kollektion: exakt fallbacken ⇒ ingen egen post (else-grenen tar den).
  assert.deepEqual(km.fallback, ['bat-a', 'sko-a', 'bat-b']);
  assert.equal(km.karta.has('ensam'), false);
  assert.equal(km.kallor.fallback >= 1, true);
  // sko-a ligger i fallback: får fallbacken minus sig själv ⇒ egen post.
  assert.deepEqual(km.karta.get('sko-a').lista, ['bat-a', 'bat-b', 'bat-c']);
  // Katalogen bär bara handles som kan visas, aldrig gratisprodukter.
  for (const h of km.katalog.keys()) assert.ok(!konfig.erbjudande.gratisprodukter.includes(h), `gratis i katalogen: ${h}`);
  for (const [, post] of km.karta) for (const h of post.lista) assert.ok(km.katalog.has(h), `${h} saknas i katalogen`);
  assert.ok(km.katalog.get('bat-b').bild.endsWith('_240x240.jpg'), 'katalogbilder är förminskade');
});

test('valjKomplement: för tunn fallback stoppar, ingen komplement-konfig ger null', () => {
  assert.throws(() => valjKomplement(ALLA, { ...KONFIG, komplement: { ...KONFIG.komplement, fallback: ['bat-a'] } }), /fallback/);
  assert.equal(valjKomplement(ALLA, { ...KONFIG, komplement: undefined }), null);
});

test('bildLiten och gemensamtPrefix', () => {
  assert.equal(bildLiten('https://cdn.shopify.com/s/files/1/x/files/a.jpg?v=1'), 'https://cdn.shopify.com/s/files/1/x/files/a_240x240.jpg?v=1');
  assert.equal(bildLiten('https://cdn/x.png'), 'https://cdn/x_240x240.png');
  assert.equal(bildLiten(null), null);
  assert.equal(gemensamtPrefix(['https://cdn/files/a.jpg', 'https://cdn/files/b.jpg']), 'https://cdn/files/');
  assert.equal(gemensamtPrefix([]), '');
});

test('kortnamn klipper vid tankstreck och långa titlar', () => {
  assert.equal(kortnamn('Bäverlampa Pro'), 'Bäverlampa Pro');
  assert.equal(kortnamn('Kepslampa 300 Lumen – Clip-On LED Pannlampa'), 'Kepslampa 300 Lumen');
  assert.equal(kortnamn('Bävertratt - Tanka snabbt utan spill'), 'Bävertratt');
  assert.ok(kortnamn('A'.repeat(60)).endsWith('…'));
});

test('ersatt: platshållare blir Liquid respektive exempel', () => {
  assert.equal(ersatt('Order {{ordernummer}} till {{förnamn}}', 'liquid'), 'Order {{ name }} till {{ fornamn }}');
  assert.equal(ersatt('Order {{ordernummer}} till {{förnamn}}', 'exempel'), 'Order #4821 till Johan');
  assert.equal(ersatt('{{belopp}}', 'exempel'), kr(599));
  assert.equal(ersatt('före {{paketdeadline}}', 'liquid'), 'före kl {{ paket_tid }} den {{ paket_datum }}');
  assert.match(ersatt('före {{paketdeadline}}', 'exempel'), /^före kl \d{2}:\d{2} den \d{1,2} [a-zå]+$/);
});

test('varje mall i liquid-läge: balanserade taggar, inga platshållare kvar, assign-rad först', () => {
  for (const m of byggAlla({ ...indata, lage: 'liquid' })) {
    assert.ok(m.html.startsWith('{% assign fornamn'), `${m.id}: assign-raden ska vara först`);
    assert.equal(rakna(m.html, /\{%\s*if\b/g), rakna(m.html, /\{%\s*endif\b/g), `${m.id}: if/endif`);
    assert.equal(rakna(m.html, /\{%\s*for\b/g), rakna(m.html, /\{%\s*endfor\b/g), `${m.id}: for/endfor`);
    assert.equal(rakna(m.html, /\{%\s*case\b/g), rakna(m.html, /\{%\s*endcase\b/g), `${m.id}: case/endcase`);
    assert.ok(!/\{\{(förnamn|ordernummer|fraktbolag|belopp|slutdatum|paketdeadline)\}\}/.test(m.html), `${m.id}: platshållare kvar`);
    assert.ok(!/\{\{(förnamn|ordernummer|fraktbolag|belopp)\}\}/.test(m.amne), `${m.id}: platshållare i ämnet`);
    assert.ok(m.html.includes('kundsupport@baverbutiken.se'), `${m.id}: supportadressen`);
    // Incident 2026-09-12: default: "fraktbolaget" blev default: &quot;fraktbolaget&quot;
    for (const tagg of m.html.match(/\{\{[^}]*\}\}|\{%[^%]*%\}/g) ?? []) {
      assert.ok(!tagg.includes('&quot;') && !tagg.includes('&#'), `${m.id}: HTML-eskapning inuti Liquid: ${tagg}`);
      assert.ok(!tagg.includes('"'), `${m.id}: dubbla citattecken inuti Liquid: ${tagg}`);
    }
    for (const tagg of m.amne.match(/\{\{[^}]*\}\}|\{%[^%]*%\}/g) ?? []) {
      assert.ok(!tagg.includes('&quot;'), `${m.id}: HTML-eskapning i ämnesraden: ${tagg}`);
    }
  }
});

test('exempel-läget innehåller ingen Liquid alls', () => {
  for (const m of byggAlla({ ...indata, lage: 'exempel' })) {
    assert.ok(!m.html.includes('{{') && !m.html.includes('{%'), `${m.id}: Liquid i förhandsvisningen`);
    assert.ok(m.html.includes('Johan'), `${m.id}: exempelkunden`);
  }
});

test('erbjudandet ligger i rätt mallar och bär kod, kollektionslänk, fyra gratis och komplementen', () => {
  const e = konfig.erbjudande;
  for (const meta of MALLAR) {
    const m = byggMall(meta.id, { ...indata, lage: 'liquid' });
    const har = m.html.includes(`/discount/${e.kod}?redirect=%2Fcollections%2F${e.kollektion_handle}`);
    assert.equal(har, meta.erbjudande, `${meta.id}: erbjudande ${meta.erbjudande ? 'saknas' : 'ska inte vara med'}`);
    assert.equal(m.html.includes(copy.komplement.rubrik), meta.erbjudande, `${meta.id}: komplementblocket`);
    if (meta.erbjudande) {
      for (const g of produkter.gratis) assert.ok(m.html.includes(g.url), `${meta.id}: gratis ${g.handle}`);
      assert.ok(m.html.includes(String(e.minsta_kop_sek)), `${meta.id}: minsta köp`);
      // Radkällan: orderns line_items i orderbekräftelsen, fraktens rader i de andra.
      const rad = meta.id === 'orderbekraftelse' ? 'line' : 'line.line_item';
      assert.ok(m.html.includes(`{% assign lh = ${rad}.product.handle | default: ${rad}.product.title %}`), `${meta.id}: produktnyckeln`);
      assert.ok(m.html.includes(`{{ ${rad} | img_url: 'compact_cropped' }}`), `${meta.id}: en till-kortets bild`);
      assert.ok(m.html.includes(copy.komplement.en_till), `${meta.id}: en till-etiketten`);
      assert.ok(m.html.includes(copy.komplement.fallback_rubrik), `${meta.id}: fallback-rubriken`);
      // Kartan: bat-a har en egen gren med både handle och titel som nyckel.
      assert.ok(m.html.includes("{% when 'bat-a' or 'bat-a – Undertitel' %}"), `${meta.id}: bat-a i kartan`);
      // Katalogen bär namn|bild|pris|handle för varje visbar produkt, och nummer i kartan.
      assert.ok(/\{% assign k = 'bat-b\|bat-b_240x240\.jpg\|269 kr\|bat-b' %\}/.test(m.html), `${meta.id}: katalogposten för bat-b`);
      assert.ok(m.html.includes("{% assign k_cdn = 'https://cdn/files/' %}"), `${meta.id}: CDN-prefixet`);
      // Ingen gratisprodukt i katalogen.
      for (const g of e.gratisprodukter) assert.ok(!m.html.includes(`|${g}' %}`), `${meta.id}: gratis ${g} i katalogen`);
      // De tre dyraste är borta (Axels beslut 2026-09-13).
      assert.ok(!m.html.includes('Passa på när du ändå får en gratis'), `${meta.id}: dyra-blocket finns kvar`);
    }
  }
});

test('erbjudandet ligger överst (före orderknappen) och bär sista datum, samma-paket-rad, logga och urgency', () => {
  const m = byggMall('orderbekraftelse', { ...indata, lage: 'liquid' });
  assert.ok(m.html.indexOf('Erbjudandet:') < m.html.indexOf('{{ order_status_url }}'), 'erbjudandet ska komma före Följ din order');
  assert.ok(m.html.indexOf('Erbjudandet:') < m.html.indexOf('Vad händer nu?'), 'erbjudandet ska komma före tidslinjen');
  assert.ok(m.html.includes("{% assign start_ts = created_at | date: '%s' %}"), 'slutdatum utgår från orderns created_at, inte utskickstiden');
  assert.ok(m.html.includes('{% assign slut_ts = start_ts | plus: 604800 %}'), 'slutdatum räknas ur orderdagen + 7 dagar');
  assert.ok(!m.html.includes("{% assign slut_ts = 'now'"), "'now' får inte längre vara basen för slutdatumet");
  assert.ok(m.html.includes('{{ slutdatum }}'), 'urgency-raden bär slutdatum');
  assert.ok(m.html.includes('{% if slut_passerat == false %}'), 'urgency-raden döljs när datumet passerat');
  assert.ok(m.html.includes('{% assign paket_ts = start_ts | plus: 64800 %}'), 'samma paket: ordertid + 18 timmar');
  assert.ok(m.html.includes('{% if paket_passerat == false %}'), 'samma-paket-raden döljs när tiden gått');
  assert.ok(m.html.includes('kl {{ paket_tid }} den {{ paket_datum }}'), 'samma-paket-raden bär tid och datum');
  assert.ok(m.html.includes(`src="${konfig.butik.logga_url}"`), 'loggan i sidhuvudet');
  assert.ok(m.html.includes('Impact'), 'rubriktypsnitt som finns i mejlklienter');
  const ex = byggMall('orderbekraftelse', { ...indata, lage: 'exempel' });
  assert.match(ex.html, /till \d{1,2} (januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december)/);
  assert.match(ex.html, /Beställ före kl \d{2}:\d{2} den \d{1,2} [a-zå]+/);
  // Exempelläget visar en till + tre komplement till exempelordern.
  assert.ok(ex.html.includes(copy.komplement.en_till), 'en till-kortet i exempel');
  assert.ok(ex.html.includes(copy.komplement.rubrik) || ex.html.includes(copy.komplement.fallback_rubrik), 'komplementrubriken i exempel');
});

test('samma_paket_timmar 0 tar bort raden, i båda lägena', () => {
  const k = { ...KONFIG, erbjudande: { ...KONFIG.erbjudande, samma_paket_timmar: 0 } };
  for (const lage of ['liquid', 'exempel']) {
    const m = byggMall('orderbekraftelse', { ...indata, konfig: k, lage });
    assert.ok(!m.html.includes('Beställ före'), `${lage}: raden ska vara borta`);
    assert.ok(!m.html.includes('paket_passerat'), `${lage}: ingen paketlogik`);
  }
});

test('exempelSlutdatum, exempelPaketdeadline och slutdatumLiquid: 7 dagar, svensk månad, alla tolv månader i case-satsen', () => {
  assert.equal(konfig.erbjudande.giltig_dagar, 7, 'Axels beslut 2026-09-13: sju dagar, inte trettio');
  assert.equal(exempelSlutdatum(7, new Date(2026, 8, 13)), '20 september');
  assert.equal(exempelSlutdatum(7, new Date(2026, 11, 28)), '4 januari');
  assert.equal(exempelPaketdeadline(18, new Date(2026, 8, 13, 8, 21)), 'kl 02:21 den 14 september');
  const l = slutdatumLiquid(14);
  assert.ok(l.includes('plus: 1209600'));
  assert.ok(l.includes('{% if created_at %}'), 'orderdatumet är basen');
  assert.ok(l.includes("{% else %}{% assign start_ts = 'now' | date: '%s' %}{% endif %}"), "'now' bara som reserv");
  assert.ok(!l.includes('paket_ts'), 'ingen paketlogik utan timmar');
  for (const m of ['januari', 'december']) assert.ok(l.includes(`'${m}'`));
  assert.equal((l.match(/\{% when /g) ?? []).length, 12);
  const lp = slutdatumLiquid(7, 18);
  assert.ok(lp.includes('{% assign paket_ts = start_ts | plus: 64800 %}'));
  assert.equal((lp.match(/\{% when /g) ?? []).length, 24, 'månadstabellen två gånger: slut och paket');
});

test('rabattkoden följer namnregeln: versaler, inga å/ä/ö, inga mellanslag', () => {
  assert.match(konfig.erbjudande.kod, /^[A-Z0-9]+$/);
});

test('orderbekräftelsen använder Shopifys ordervariabler', () => {
  const m = byggMall('orderbekraftelse', { ...indata, lage: 'liquid' });
  for (const v of ['{{ order_status_url }}', '{% for line in line_items %}', '{{ subtotal_price | money }}', '{{ total_price | money }}', '{% for shipping_method in shipping_methods %}', '{% if shipping_address %}']) {
    assert.ok(m.html.includes(v), `saknar ${v}`);
  }
});

test('fraktmallarna använder fulfillment, övergiven kassa använder url, återbetalning amount', () => {
  const frakt = byggMall('fraktbekraftelse', { ...indata, lage: 'liquid' });
  assert.ok(frakt.html.includes('{% for line in fulfillment.fulfillment_line_items %}'));
  assert.ok(frakt.html.includes('fulfillment.tracking_url'));
  const kassa = byggMall('overgiven_kassa', { ...indata, lage: 'liquid' });
  assert.ok(kassa.html.includes('href="{{ url }}"'));
  const ater = byggMall('aterbetalning', { ...indata, lage: 'liquid' });
  assert.ok(ater.html.includes('{{ amount | money }}'));
  assert.ok(ater.html.includes('{% for line in refund_line_items %}'));
});

test('sidan bakar in alla mallar med kopiera-knappar, förhandsvisningar och klistra-om-markering', () => {
  const liquid = byggAlla({ ...indata, lage: 'liquid' });
  const exempel = byggAlla({ ...indata, lage: 'exempel' });
  const sida = byggSida({ liquid, exempel, konfig: KONFIG, produkter, byggd: '2026-09-12 16:00' });
  assert.ok(sida.startsWith('<title>'));
  assert.equal(rakna(sida, /data-mal="liquid-/g), MALLAR.length);
  assert.equal(rakna(sida, /<iframe /g), MALLAR.length);
  assert.ok(sida.includes(konfig.erbjudande.kod));
  assert.ok(!sida.includes('</script>{'), 'mallkoden får inte bryta script-taggen');
  assert.equal(rakna(sida, /Klistra om\./g), Object.keys(konfig.lage.inklistrade_aldre ?? {}).length, 'en klistra-om-markering per mall med äldre version');
});

// Riktiga butiken (mejl/produkter.json committas efter varje bygge): kartan
// ska ge rätt komplement för storsäljarna och mallarna ska hålla storleken.
test('riktig katalog: axelbältet får borsthuvudena, mallarna under 100 kB', { skip: !existsSync(join(ROT, 'produkter.json')) }, () => {
  const alla = JSON.parse(readFileSync(join(ROT, 'produkter.json'), 'utf8'));
  const prod = valjProdukter(alla, konfig);
  const km = prod.komplement;
  assert.ok(km.karta.get('axelbalte-for-trimmer-justerbart-nylonbalte').lista.includes('staltradsborsthuvuden-for-trimmer-kraftiga-ogras-mossrojare'), 'axelbälte ↔ borsthuvuden (25 ordrar tillsammans)');
  assert.deepEqual(km.okanda, [], `handles i konfigen som inte finns i butiken: ${km.okanda.join(', ')}`);
  for (const [h, post] of km.karta) {
    assert.ok(!post.lista.includes(h), `${h} föreslår sig själv`);
    assert.equal(post.lista.length, km.antal, `${h} har ${post.lista.length} komplement`);
  }
  for (const m of byggAlla({ konfig, copy, produkter: prod, lage: 'liquid' })) {
    assert.ok(m.html.length < 100 * 1024, `${m.id}: ${(m.html.length / 1024).toFixed(0)} kB`);
  }
});
