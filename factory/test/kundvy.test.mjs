// Tester för kundvy-kontrollen (Axels bakläxa 2026-09-09, DryTrek) och de
// HTML-kontroller som flyttade hit ur kolla.mjs (struktur, markörer, synlig
// text) samt de rena delarna av kundvy-kor.mjs (kakburk, bas, vägar).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  kontrolleraKundvy,
  rapport,
  strukturkoll,
  svenskaMarkorer,
  filtreraMarkorer,
  lasMarkorer,
  synligText,
  utanJudgeMe,
  avkodaEntiteter,
  produktkoll,
  jamforprisRenderat,
} from '../kundvy.mjs';
import { Kakburk, byggBas, sidvag, previewTemaId } from '../kundvy-kor.mjs';

const BUTIK = { butik: { brand: 'DryTrek', markorer_sv: ['Köp nu', 'Vanliga frågor', 'Kontakt', 'Lägg i varukorgen'] } };
const PRODUKT = {
  produkt: { namn: 'Damasker Vandring', id: 'damasker' },
  ekonomi: { pris: 389 },
  offer: { bonus_produkt: { handle: 'bonusen', tillagg_kryssruta: true }, paket: { nivaer: [{ antal: 2, gratis_antal: 2 }] } },
};

const FARDIG = `
  <img class="header__heading-logo" src="https://cdn.shopify.com/s/files/1/logo.png">
  <h1>DryTrek</h1>
  <h2>Damasker Vandring</h2>
  <img src="https://cdn.shopify.com/s/files/1/damask.jpg">
  <button>Köp för 389 kr</button>`;

// ---- startsidan ---------------------------------------------------------------

test('en färdig startsida är grön (ok och gron)', () => {
  const r = kontrolleraKundvy(FARDIG, BUTIK, PRODUKT);
  assert.equal(r.ok, true);
  assert.equal(r.gron, true);
  assert.deepEqual(r.varningar, []);
});

test('tom HTML är aldrig grön', () => {
  const r = kontrolleraKundvy('', BUTIK, PRODUKT);
  assert.equal(r.ok, false);
  assert.ok(r.fel.some((f) => f.startsWith('TOM')));
});

test('My Store fångas', () => {
  const r = kontrolleraKundvy(`${FARDIG}<title>My Store 3</title>`, BUTIK, PRODUKT);
  assert.equal(r.gron, false);
  assert.ok(r.fel.some((f) => f.includes('My Store')));
});

test('Shopifys placeholder-hero fångas', () => {
  const r = kontrolleraKundvy(`${FARDIG}<img src="/files/hero-apparel-1.jpg">`, BUTIK, PRODUKT);
  assert.ok(r.fel.some((f) => f.includes('placeholder-illustration')));
});

test('Dawns default-meny fångas', () => {
  const r = kontrolleraKundvy(`${FARDIG}<a> Catalog </a>`, BUTIK, PRODUKT);
  assert.ok(r.fel.some((f) => f.includes('Dawns default')));
});

test('saknad logga fångas', () => {
  const utan = FARDIG.replace(/<img class="header__heading-logo"[^>]*>/, '');
  const r = kontrolleraKundvy(utan, BUTIK, PRODUKT);
  assert.ok(r.fel.some((f) => f.includes('ingen logga')));
});

test('saknad produktbild fångas', () => {
  const r = kontrolleraKundvy('<img class="header__heading-logo" src="x"><h1>DryTrek</h1><h2>Damasker Vandring</h2><button>Köp</button>', BUTIK, PRODUKT);
  assert.ok(r.fel.some((f) => f.includes('produktbild')));
});

test('bild på butikens egen domän (/cdn/shop/files) räknas', () => {
  const egen = FARDIG.replace('https://cdn.shopify.com/s/files/1/damask.jpg', '/cdn/shop/files/damask_abc.webp?v=1');
  assert.equal(kontrolleraKundvy(egen, BUTIK, PRODUKT).ok, true);
});

test('escapad produkttitel (&amp;) hittas', () => {
  const p = { produkt: { namn: 'Väta & Grus' } };
  const h = FARDIG.replace('Damasker Vandring', 'Väta &amp; Grus');
  assert.equal(kontrolleraKundvy(h, BUTIK, p).ok, true);
});

test('exempelprodukt fångas', () => {
  const r = kontrolleraKundvy(`${FARDIG}<h2>Exempel på produktnamn</h2>`, BUTIK, PRODUKT);
  assert.ok(r.fel.some((f) => f.includes('exempelprodukt')));
});

test('rapporten säger att butiken inte får annonser', () => {
  const r = rapport(kontrolleraKundvy('<html></html>', BUTIK, PRODUKT));
  assert.ok(r.includes('får INTE annonser'));
});

// ---- synlig text -------------------------------------------------------------

test('synligText tar bort script, style, kommentarer och attribut', () => {
  const t = synligText('<script>var x="Köp nu"</script><style>.a{}</style><!-- Köp nu --><div data-x="Köp nu">Hej &amp; hå</div>');
  assert.equal(t.trim(), 'Hej & hå');
});

test('avkodaEntiteter tar numeriska och namngivna entiteter', () => {
  assert.equal(avkodaEntiteter('&#246;ppet k&ouml;p &#x00E5;'), 'öppet köp å');
});

test('utanJudgeMe klipper bort recensionswidgeten', () => {
  const h = '<section id="shopify-section-x__judgeme_widget">Köp nu på svenska</section><div id="shopify-section-y">Kjøp</div>';
  assert.ok(!utanJudgeMe(h).includes('Köp nu'));
  assert.ok(utanJudgeMe(h).includes('Kjøp'));
});

// ---- markörer -------------------------------------------------------------------

test('svenskaMarkorer hittar bara synliga ord ur listan', () => {
  const h = '<h2>Vanlige spørsmål</h2><button>Köp nu</button><script>"Vanliga frågor"</script>';
  assert.deepEqual(svenskaMarkorer(h, BUTIK.butik.markorer_sv), ['Köp nu']);
});

test('svenskaMarkorer utan lista ger tomt — aldrig ett hårdkodat ord', () => {
  assert.deepEqual(svenskaMarkorer('<p>överdrag Köp nu Kontakt</p>', []), []);
  assert.deepEqual(svenskaMarkorer('<p>överdrag</p>', undefined), []);
});

test('lasMarkorer läser butik.markorer_sv och tål att fältet saknas', () => {
  assert.deepEqual(lasMarkorer(BUTIK), BUTIK.butik.markorer_sv);
  assert.deepEqual(lasMarkorer({ butik: {} }), []);
  assert.deepEqual(lasMarkorer({ butik: { markorer_sv: [' Köp nu ', '', null] } }), ['Köp nu']);
});

test('filtreraMarkorer tar bort ord som är lika på målspråket', () => {
  const sv = { 'a.kontakt': 'Kontakt', 'a.kop': 'Köp nu' };
  const nb = { 'a.kontakt': 'Kontakt', 'a.kop': 'Kjøp nå' };
  assert.deepEqual(filtreraMarkorer(['Köp nu', 'Kontakt'], sv, nb), ['Köp nu']);
  assert.deepEqual(filtreraMarkorer(['Köp nu', 'Kontakt'], null, null), ['Köp nu', 'Kontakt']);
});

// ---- struktur -------------------------------------------------------------------

const PRODUKTSIDA = `
  <link href="/cdn/shop/t/3/assets/opf-brand.css">
  <style>[alt^="[SV]"]{}</style>
  <section class="opf-problem"></section><section class="opf-losning"></section>
  <section class="opf-funktioner"></section><section class="opf-garanti"></section><section class="opf-faq"></section>
  <div data-ms-ab="paket:a"><label class="ms-paket__opt"><span class="ms-paket__gava">Gratis</span></label></div>
  <div data-ms-ab="paket:b"></div>
  <template id="opf-tillagg-mall"></template><input class="opf-tillagg__kryss">
  <div class="jdgm-widget"></div><div class="ms-sticky"></div><div class="opf-svensk">DryTrek</div>
  <a href="/products/damasker">Damasker</a>`;

test('strukturkoll är grön på en komplett produktsida', () => {
  const r = strukturkoll(PRODUKTSIDA, { produkt: PRODUKT, butik: BUTIK });
  assert.deepEqual(r.fel, []);
  assert.equal(r.ok, true);
  assert.ok(r.punkter.some((p) => p.namn.includes('opf-tillagg')));
});

test('strukturkoll fångar saknad paketväljare, köplöften och fel produktlänk', () => {
  const trasig = PRODUKTSIDA.replace('ms-paket__opt', 'x').replace('/products/damasker', '/products/annan') + '<p>30 dagars öppet köp</p>';
  const r = strukturkoll(trasig, { produkt: PRODUKT, butik: BUTIK });
  assert.equal(r.ok, false);
  assert.ok(r.fel.some((f) => f.includes('ms-paket')));
  assert.ok(r.fel.some((f) => f.includes('köplöften')));
  assert.ok(r.fel.includes('produktlänken'));
});

test('strukturkoll utan bonusprodukt kräver varken kryssruta eller gratis-rad', () => {
  // Gratis-raden (ms-paket__gava) finns bara när en bonus ligger i paketen —
  // utan bonusprodukt är den saknade raden rätt (AdventLane 2026-09-10).
  const utanTillagg = PRODUKTSIDA.replace('opf-tillagg-mall', '').replace('opf-tillagg__kryss', '').replace('ms-paket__gava', 'ms-paket__x');
  const r = strukturkoll(utanTillagg, { produkt: { produkt: { id: 'damasker' } }, butik: BUTIK });
  assert.equal(r.ok, true, r.fel.join(' | '));
  // Med gratis bonus i nivåerna + kryssruta begärd krävs båda.
  const med = strukturkoll(utanTillagg, { produkt: PRODUKT, butik: BUTIK });
  assert.ok(med.fel.includes('gratis-raden i paketen'));
  assert.ok(med.fel.includes('fullpris-kryssrutan (opf-tillagg)'));
  // Betald korg-upsell (handle satt, ingen gratis i nivåerna, ingen kryssruta)
  // = varken gratis-rad eller kryssruta krävs (TackleBay 2026-09-10).
  const upsell = { produkt: { id: 'damasker' }, offer: { bonus_produkt: { handle: 'andra-produkten', pris: 469, i_paket: '' } } };
  const r2 = strukturkoll(utanTillagg, { produkt: upsell, butik: BUTIK });
  assert.equal(r2.ok, true, r2.fel.join(' | '));
});

test('produktkoll kräver namn och pris i synlig text', () => {
  assert.equal(produktkoll('<h1>Damasker Vandring</h1><span>389 kr</span>', PRODUKT).ok, true);
  const r = produktkoll('<h1>Damasker Vandring</h1><script>389</script>', PRODUKT);
  assert.equal(r.ok, false);
  assert.ok(r.fel[0].includes('389'));
});

test('produktkoll kräver att JÄMFÖRPRISET syns — annars ser kunden ingen rabatt', () => {
  // FjordCover 2026-09-12: admin hade compareAtPrice 965 på alla nio varianter,
  // men storefronten svarade null och temats <s>-tagg renderades tom. Trippel-
  // kollen läser admin och var grön; bara kundvyn kan fånga det.
  const p = { produkt: { namn: 'Motorskyddet' }, ekonomi: { pris: 579, jamforpris: 965 } };
  assert.equal(produktkoll('<h1>Motorskyddet</h1><span>579,00 kr</span><s>965,00 kr</s>', p).ok, true);
  const tom = produktkoll('<h1>Motorskyddet</h1><span>579,00 kr</span><s> </s>', p);
  assert.equal(tom.ok, false);
  assert.ok(tom.fel.some((f) => f.includes('965') && f.includes('rabatt')), tom.fel.join(' | '));
  // ⚠️ Talet i en SÄLJTEXT får inte rädda kollen. Produktens punktlista på
  // FjordCover säger "579 kr i stället för 965 kr" medan prisblocket är tomt —
  // första versionen av kollen blev grön på just den raden (mätt 2026-09-13).
  const saljtext = produktkoll(
    '<h1>Motorskyddet</h1><span>579,00 kr</span><s> </s><li>579 kr i stället för 965 kr</li>',
    p
  );
  assert.equal(saljtext.ok, false, 'en mening om priset är inte ett renderat jämförpris');
  // Utan jämförpris i filen krävs ingenting.
  const utan = { produkt: { namn: 'Motorskyddet' }, ekonomi: { pris: 579, jamforpris: 0 } };
  assert.equal(produktkoll('<h1>Motorskyddet</h1><span>579,00 kr</span>', utan).ok, true);
});

test('jamforprisRenderat läser <s> och compare-klasser, inte sidans text', () => {
  assert.equal(jamforprisRenderat('<s class="price-item">1 039,00 kr</s>', 1039), true);
  assert.equal(jamforprisRenderat('<span class="price-compare">965 kr</span>', 965), true);
  assert.equal(jamforprisRenderat('<p>ord. 965 kr</p><s> </s>', 965), false);
  assert.equal(jamforprisRenderat('', 965), false);
});

test('produktkoll godtar pris med tusentalsavstånd (1 129,00 kr) — CaraShell 2026-09-10', () => {
  const p = { produkt: { namn: 'Taköverdrag' }, ekonomi: { pris: 1129 } };
  assert.equal(produktkoll('<h1>Taköverdrag</h1><span>1 129,00 kr</span>', p).ok, true);
  assert.equal(produktkoll('<h1>Taköverdrag</h1><span>1&nbsp;129 kr</span>', p).ok, true);
  assert.equal(produktkoll('<h1>Taköverdrag</h1><span>1.129 kr</span>', p).ok, true);
  assert.equal(produktkoll('<h1>Taköverdrag</h1><span>999 kr</span>', p).ok, false);
});

// ---- kundvy-kor: rena delar --------------------------------------------------------

test('Kakburk behåller ALLA kakor, även _shopify_essential', () => {
  const b = new Kakburk();
  b.ta(['_shopify_essential=abc; Path=/; HttpOnly', 'localization=SE; Path=/']);
  b.ta(['localization=NO; Path=/']);
  assert.equal(b.antal, 2);
  assert.equal(b.header(), '_shopify_essential=abc; localization=NO');
});

test('Kakburk läser Set-Cookie ur ett svar och tål svar utan kakor', () => {
  const b = new Kakburk();
  b.ta({ headers: { getSetCookie: () => ['a=1'] } });
  b.ta({ headers: { get: () => null } });
  assert.equal(b.header(), 'a=1');
});

test('byggBas tar riktig domän först, sen myshopify, och kräver något', () => {
  assert.equal(byggBas({ primaryDomain: { url: 'https://drytrek.se/' }, myshopifyDomain: 'x.myshopify.com' }), 'https://drytrek.se');
  assert.equal(byggBas({ primaryDomain: { host: 'drytrek.se' } }), 'https://drytrek.se');
  assert.equal(byggBas({ myshopifyDomain: 'x.myshopify.com' }), 'https://x.myshopify.com');
  assert.equal(byggBas(null, 'https://annan.se/'), 'https://annan.se');
  assert.throws(() => byggBas({}), /Ingen butiksadress/);
});

test('sidvag lägger locale-prefix', () => {
  assert.equal(sidvag('/', null), '/');
  assert.equal(sidvag('/', 'nb'), '/nb/');
  assert.equal(sidvag('/products/x', 'nb'), '/nb/products/x');
  assert.equal(sidvag('products/x', ''), '/products/x');
});

test('previewTemaId: numret ur gid, null för MAIN', () => {
  assert.equal(previewTemaId('gid://shopify/OnlineStoreTheme/123'), '123');
  assert.equal(previewTemaId(456), '456');
  assert.equal(previewTemaId({ id: 'gid://shopify/OnlineStoreTheme/789', role: 'UNPUBLISHED' }), '789');
  assert.equal(previewTemaId({ id: 'gid://shopify/OnlineStoreTheme/789', role: 'MAIN' }), null);
  assert.equal(previewTemaId(null), null);
});
