// Mejlmallarna: Liquid-utdata som Shopify kan tolka, förhandsvisning utan
// Liquid, produktvalet, komplementkartan och erbjudandets villkor. Inget nätverk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
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
  EXEMPEL,
  BAVER_LIQUID,
} from '../mallar.mjs';
import { byggSida } from '../sida.mjs';
import { bavernummer } from '../../sparning/bavernummer.mjs';

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

test('krediten ligger i rätt mallar och bär KREDIT100-knappen och komplementen', () => {
  const kd = konfig.kredit;
  const url = `${konfig.butik.url}/discount/${kd.kod}?redirect=${encodeURIComponent(kd.landning)}`;
  assert.equal(url, 'https://baverbutiken.se/discount/KREDIT100?redirect=%2Fcollections%2Fall');
  for (const meta of MALLAR) {
    const m = byggMall(meta.id, { ...indata, lage: 'liquid' });
    assert.equal(m.html.includes(`href="${url}"`), meta.erbjudande, `${meta.id}: kreditknappen ${meta.erbjudande ? 'saknas' : 'ska inte vara med'}`);
    assert.equal(m.html.includes(copy.komplement.rubrik), meta.erbjudande, `${meta.id}: komplementblocket`);
    if (meta.erbjudande) {
      // Den godkända texten, med beloppen ur konfigen.
      for (const t of ['Din rabatt väntar', '100 kr rabatt på nästa köp', 'Handla för minst 299 kr och dra av 100 kr. Rabatten gäller en gång per kund.', 'HÄMTA MIN RABATT', 'Gäller köp från 299 kr, en gång per kund. Koden KREDIT100 läggs på automatiskt eller skrivs in i kassan.']) {
        assert.ok(m.html.includes(t), `${meta.id}: saknar "${t}"`);
      }
      assert.ok(!/\{\{kredit_/.test(m.html), `${meta.id}: kreditplatshållare kvar`);
      // Ingen tidsgräns på krediten.
      assert.ok(!m.html.includes('slut_passerat') && !m.html.includes('{{ slutdatum }}') && !m.html.includes('Gäller i 7 dagar'), `${meta.id}: tidsgräns kvar`);
      // Radkällan: orderns line_items i orderbekräftelsen, fraktens rader i de andra.
      const rad = meta.id === 'orderbekraftelse' ? 'line' : 'line.line_item';
      assert.ok(m.html.includes(`{% assign lh = ${rad}.product.handle | default: ${rad}.product.title %}`), `${meta.id}: produktnyckeln`);
      assert.ok(m.html.includes(`{{ ${rad} | img_url: 'compact_cropped' }}`), `${meta.id}: en till-kortets bild`);
      assert.ok(m.html.includes(copy.komplement.en_till), `${meta.id}: en till-etiketten`);
      assert.ok(m.html.includes(copy.komplement.fallback_rubrik), `${meta.id}: fallback-rubriken`);
      assert.ok(m.html.includes("{% when 'bat-a' or 'bat-a – Undertitel' %}"), `${meta.id}: bat-a i kartan`);
      assert.ok(/\{% assign k = 'bat-b\|bat-b_240x240\.jpg\|269 kr\|bat-b' %\}/.test(m.html), `${meta.id}: katalogposten för bat-b`);
      assert.ok(m.html.includes("{% assign k_cdn = 'https://cdn/files/' %}"), `${meta.id}: CDN-prefixet`);
    }
  }
});

test('lyckohjulet är borta ur alla byggda mejl, i båda lägena (Axels beslut 2026-09-26)', () => {
  for (const lage of ['liquid', 'exempel']) {
    for (const m of byggAlla({ ...indata, lage })) {
      for (const ord of [/hjul/i, /snurr/i, /vinn/i, /TACKIGEN/i, /din-gratisprodukt/i, /gratisprodukt/i, /gåvokod/i]) {
        assert.ok(!ord.test(m.html), `${lage}/${m.id}: "${ord.source}" finns kvar`);
        assert.ok(!ord.test(m.amne), `${lage}/${m.id}: "${ord.source}" i ämnesraden`);
      }
    }
  }
  // Inga tankstreck i den nya kredittexten.
  for (const [n, t] of Object.entries(copy.kredit)) {
    if (n !== 'comment') assert.ok(!/[—–]/.test(t), `tankstreck i kredittexten: ${t}`);
  }
  // Knappen finns i exempelläget också.
  const ex = byggMall('levererad', { ...indata, lage: 'exempel' });
  assert.ok(ex.html.includes('https://baverbutiken.se/discount/KREDIT100?redirect=%2Fcollections%2Fall'), 'KREDIT100-knappen i förhandsvisningen');
});

test('krediten ligger överst (före orderknappen) och bär samma-paket-rad och logga', () => {
  const m = byggMall('orderbekraftelse', { ...indata, lage: 'liquid' });
  assert.ok(m.html.indexOf('Erbjudandet:') < m.html.indexOf('{{ order_status_url }}'), 'erbjudandet ska komma före Följ din order');
  assert.ok(m.html.indexOf('Erbjudandet:') < m.html.indexOf('Vad händer nu?'), 'erbjudandet ska komma före tidslinjen');
  assert.ok(m.html.includes("{% assign start_ts = created_at | date: '%s' %}"), 'samma paket utgår från orderns created_at');
  assert.ok(m.html.includes('{% assign paket_ts = start_ts | plus: 64800 %}'), 'samma paket: ordertid + 18 timmar');
  assert.ok(m.html.includes('{% if paket_passerat == false %}'), 'samma-paket-raden döljs när tiden gått');
  assert.ok(m.html.includes('kl {{ paket_tid }} den {{ paket_datum }}'), 'samma-paket-raden bär tid och datum');
  assert.ok(m.html.includes(`src="${konfig.butik.logga_url}"`), 'loggan i sidhuvudet');
  assert.ok(m.html.includes('Impact'), 'rubriktypsnitt som finns i mejlklienter');
  // Frakt- och levererat-mejlen räknar ingen tid alls längre.
  for (const id of ['fraktbekraftelse', 'levererad']) {
    const f = byggMall(id, { ...indata, lage: 'liquid' });
    assert.ok(!f.html.includes('paket_ts') && !f.html.includes('slut_ts'), `${id}: ingen tidslogik`);
  }
  const ex = byggMall('orderbekraftelse', { ...indata, lage: 'exempel' });
  assert.match(ex.html, /Beställ före kl \d{2}:\d{2} den \d{1,2} [a-zå]+/);
  assert.ok(ex.html.includes(copy.komplement.en_till), 'en till-kortet i exempel');
  assert.ok(ex.html.includes(copy.komplement.rubrik) || ex.html.includes(copy.komplement.fallback_rubrik), 'komplementrubriken i exempel');
});

test('utan kredit i konfigen byggs mallarna utan blocket', () => {
  const k = { ...KONFIG };
  delete k.kredit;
  const m = byggMall('orderbekraftelse', { ...indata, konfig: k, lage: 'liquid' });
  assert.ok(!m.html.includes('Erbjudandet:') && !m.html.includes('paket_ts'));
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
  assert.match(konfig.kredit.kod, /^[A-Z0-9]+$/);
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
  // ⚠️ Fraktbolagets nummer står INTE i mejlet (Axels beslut 2026-09-20:
  // "maska med ett eget bävernummer så de inte ser YT nr"). Numret börjar på
  // YT eller 4PX och skvallrar om varifrån paketet kommer. Mejlet visar i
  // stället bävernumret, räknat av Liquid med samma SHA-256-kedja som sidan.
  assert.ok(!frakt.html.includes('{{ fulfillment.tracking_number }}'),
    'fraktbolagets nummer får inte stå som text i mejlet');
  assert.ok(!frakt.html.includes('url_encode'), 'numret ska inte längre gå rakt in i adressen');
  assert.ok(!frakt.html.includes('tracking_url'), 'spårningsnumret får inte länka till fraktbolaget');
  assert.ok(!frakt.html.includes('tracking_company'), 'fraktbolagets NAMN avslöjar ursprunget lika mycket som numret');
  // Knappen och raden under bär bävernumret — annars hittar kunden inte
  // sitt paket när hen klickar, och kan inte läsa upp det för kundtjänst.
  assert.ok(frakt.html.includes(`pages/spara?nummer=${BAVER_LIQUID}`), 'knappen ska ta med bävernumret i adressen');
  assert.ok(frakt.html.includes(`Ditt paketnummer: <strong`), 'bävernumret ska stå i klartext under knappen');
  assert.equal(frakt.html.split(BAVER_LIQUID).length - 1, 2, 'bävernumret räknas två gånger: knappen och raden');
  // Förhandsvisningen visar ett riktigt räknat bävernummer, inte platshållaren.
  const exempel = byggMall('fraktbekraftelse', { ...indata, lage: 'exempel' });
  assert.ok(exempel.html.includes(`Ditt paketnummer: <strong`));
  assert.ok(exempel.html.includes(bavernummer(EXEMPEL.sparningsnummer)), 'exempelmejlet bär exempelnumrets bävernummer');
  assert.ok(!exempel.html.includes(EXEMPEL.sparningsnummer), 'exempelmejlet visar inte fraktbolagets nummer');
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

test('leveransfönstret: datumen räknas vid utskick, plus packtiden i orderbekräftelsen', () => {
  // Axels beslut 2026-09-18. Inga leveransevent kommer från YunExpress/4PX,
  // så datumet räknas i Liquid vid utskick i stället för att läsas.
  // Talen i konfig.frakt är KALENDERDAGAR (7/14) och styr bara datumen;
  // kundtexten säger samma fönster i arbetsdagar (5–10), Axels order 2026-09-21.
  const f = konfig.frakt;
  const order = byggMall('orderbekraftelse', { ...indata, lage: 'liquid' });
  const frakt = byggMall('fraktbekraftelse', { ...indata, lage: 'liquid' });
  const sek = (d) => d * 86400;
  assert.ok(order.html.includes(`lev_fran_ts = lev_bas | plus: ${sek(f.leverans_dagar_min + f.packas_dagar)}`), 'orderbekräftelsen lägger på packtiden');
  assert.ok(order.html.includes(`lev_till_ts = lev_bas | plus: ${sek(f.leverans_dagar_max + f.packas_dagar)}`));
  assert.ok(frakt.html.includes(`lev_fran_ts = lev_bas | plus: ${sek(f.leverans_dagar_min)}`), 'fraktmejlet räknar från skickdagen');
  assert.ok(frakt.html.includes('{{ lev_fran_datum }}–{{ lev_till_datum }}'), 'fraktmejlet visar fönstret');
  assert.ok(order.html.includes('{{ lev_fran_datum }}–{{ lev_till_datum }}'), 'orderbekräftelsen visar fönstret i tidslinjen');
  for (const m of byggAlla({ ...indata, lage: 'liquid' })) {
    assert.ok(!m.html.includes('svenska lager'), `${m.id}: gamla leveranslöftet kvar`);
    assert.ok(!m.html.includes('7–14 dagar'), `${m.id}: kalenderdagar i kundtext — löftet skrivs i arbetsdagar`);
    assert.ok(!m.html.includes('{{leverans_'), `${m.id}: oersatt platshållare`);
  }
  const ex = byggMall('fraktbekraftelse', { ...indata, lage: 'exempel' });
  assert.match(ex.html, /Beräknad leverans/);
  assert.match(ex.html, /\d{1,2} [a-zå]+–\d{1,2} [a-zå]+/, 'exemplet visar två datum');
});

test('v10: "Spåra paketet" går till butikens egen spårningssida, med orderstatussidan som reserv', () => {
  const frakt = byggMall('fraktbekraftelse', { ...indata, lage: 'liquid' });
  // Knappen ska bära numret (bävernumret sedan v11), så kunden aldrig behöver skriva något.
  assert.ok(frakt.html.includes(`/pages/spara?nummer=${BAVER_LIQUID}`));
  // Utan spårningsnummer finns inget att slå upp — då orderstatussidan.
  assert.ok(frakt.html.includes('{% if fulfillment.tracking_number %}'));
  assert.ok(frakt.html.includes('{% else %}{{ order_status_url }}{% endif %}'));
  for (const id of ['fraktuppdatering', 'ute_for_leverans']) {
    assert.ok(byggMall(id, { ...indata, lage: 'liquid' }).html.includes('/pages/spara?nummer='), id);
  }
  // Orderbekräftelsen har ingen leverans än och rör inte spårningssidan.
  assert.ok(!byggMall('orderbekraftelse', { ...indata, lage: 'liquid' }).html.includes('/pages/spara'));
});

test('v11: Liquid och Node ger samma bävernummer', () => {
  // Kedjan i BAVER_LIQUID körs här steg för steg som Shopify gör det
  // (upcase → replace → sha256 → slice → upcase → prepend). Ger den något
  // annat än bavernummer() hittar kunden inte sitt paket från mejlet.
  const liquid = (nr) => {
    const filter = BAVER_LIQUID.replace(/^\{\{\s*fulfillment\.tracking_number\s*\|\s*/, '').replace(/\s*\}\}$/, '').split('|').map((f) => f.trim());
    let v = nr;
    for (const f of filter) {
      const [namn, args = ''] = f.split(/:(.*)/s);
      const a = args.split(',').map((x) => x.trim().replace(/^'(.*)'$/, '$1'));
      if (namn === 'upcase') v = v.toUpperCase();
      else if (namn === 'replace') v = v.split(a[0]).join(a[1]);
      else if (namn === 'sha256') v = createHash('sha256').update(v, 'utf8').digest('hex');
      else if (namn === 'slice') v = v.slice(Number(a[0]), Number(a[0]) + Number(a[1]));
      else if (namn === 'prepend') v = a[0] + v;
      else throw new Error('okänt Liquid-filter i BAVER_LIQUID: ' + namn);
    }
    return v;
  };
  for (const nr of ['YT2626100708674690', '4PX3003149907008CN', 'ua123456789se', 'YT 2626-1007 08674690']) {
    assert.equal(liquid(nr), bavernummer(nr), nr);
  }
  assert.match(bavernummer('YT2626100708674690'), /^BB-[0-9A-F]{8}$/);
});
