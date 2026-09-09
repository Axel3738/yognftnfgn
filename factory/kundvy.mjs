// Kundvy-kontrollen: kollar att butiken SER UT som en butik. Ren logik —
// ingen nätverkstrafik. HTML:en hämtas av kundvy-kor.mjs.
//
// Bakgrunden (Axels bakläxa 2026-09-09, DryTrek): fabrikens QA rapporterade
// "14 gröna, 0 fel" på en butik som hette "My Store 3", saknade logga, visade
// Shopifys default-illustration som hero, hade Dawns meny (Home/Catalog/
// Contact) och stod på engelska. Varenda kontroll läste KONFIGURATION —
// metafält finns, sektioner finns, priser stämmer — och ingen läste sidan
// som en kund ser den.
//
// Regeln: en butik är inte grön förrän startsidans HTML är kontrollerad.
//
// Tre kontroller bor här (KEDJAN.md, kundvy.mjs):
//   kontrolleraKundvy(html, butik, produkt)   startsidan: brand, logga, hero,
//                                             meny, produkt, inga defaultspår
//   strukturkoll(html, { produkt, butik })     produktsidan: opf-sektioner,
//                                             ms-paket, Judge.me, opf-brand.css
//   svenskaMarkorer(html, markorer)            /<locale>: inga svenska ord kvar.
//                                             Orden kommer ur butik.yaml
//                                             (butik.markorer_sv), aldrig härifrån.

// Spår av ett obyggt Shopify-tema. Träff = butiken är inte färdig.
export const DEFAULTSPAR = [
  { monster: /My Store/i, vad: 'butiksnamnet är Shopifys default ("My Store")' },
  { monster: /\/files\/hero-apparel/i, vad: 'hero-bilden är Shopifys placeholder-illustration' },
  { monster: /burst\.shopifycdn\.com/i, vad: 'en Shopify-lagerbild ligger kvar' },
  { monster: /placeholder-svg|placeholder\.svg/i, vad: 'en placeholder-SVG renderas' },
  { monster: />\s*Catalog\s*</, vad: 'menyn är Dawns default ("Catalog")' },
  { monster: /Example Product Title|Exempel på produktnamn/i, vad: 'en exempelprodukt visas' },
];

// HTML escapar &, < och >. En titel som "Väta & Grus" står som "Väta &amp;
// Grus" i sidan, och en rak includes() missar den. Mätt 2026-09-09 på
// DryTrek: produkten SYNTES på startsidan, kontrollen sa nej.
export function htmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Sidan innehåller texten, escapad eller inte.
function harText(h, text) {
  if (!text) return false;
  return h.includes(text) || h.includes(htmlEscape(text));
}

// En riktig, uppladdad bild. TVÅ värdformer räknas:
//   /cdn/shop/files/…    butikens egen domän (det vanliga)
//   cdn.shopify.com/s/files/…   delade CDN:en
// Mätt 2026-09-09: DryTrek serverar allt från sin egen domän, så det gamla
// mönstret gav noll träffar på en sida med 16 riktiga bilder.
const BILDMONSTER = /(?:cdn\.shopify\.com\/s\/files|\/cdn\/shop\/(?:files|products))\/[^"'\s?]+\.(?:jpg|jpeg|png|webp)/i;

// Saker som MÅSTE finnas på en färdig OPS-startsida.
export function byggKrav(butik, produkt) {
  const brand = butik?.butik?.brand ?? '';
  const produktnamn = produkt?.produkt?.namn ?? '';
  return [
    { namn: 'brandnamn', finns: (h) => brand !== '' && harText(h, brand),
      fel: `brandnamnet "${brand}" står ingenstans på startsidan` },
    { namn: 'logga', finns: (h) => /<img[^>]+class="[^"]*header__heading-logo/i.test(h),
      fel: 'ingen logga i headern — bara text' },
    { namn: 'produkt', finns: (h) => harText(h, produktnamn),
      fel: `produkten "${produktnamn}" syns inte på startsidan` },
    { namn: 'produktbild', finns: (h) => BILDMONSTER.test(h),
      fel: 'ingen riktig produktbild laddad' },
    { namn: 'köpknapp', finns: (h) => /Köp|Lägg i varukorg|Kjøp|Legg i handlekurv/i.test(h),
      fel: 'ingen köpknapp på startsidan' },
  ];
}

// Kontrollerar startsidans HTML. Returnerar { ok, gron, fel, varningar }.
// `gron` är samma sak som `ok` — äldre namn som DryTrek-körningarna läser.
export function kontrolleraKundvy(html, butik, produkt) {
  const h = String(html);
  const fel = [];
  const varningar = [];
  for (const d of DEFAULTSPAR) {
    if (d.monster.test(h)) fel.push(`DEFAULT KVAR: ${d.vad}`);
  }
  for (const k of byggKrav(butik, produkt)) {
    if (!k.finns(h)) fel.push(`SAKNAS: ${k.fel}`);
  }
  if (h.trim() === '') fel.push('TOM: ingen HTML att kontrollera — sidan kunde inte hämtas');
  const ok = fel.length === 0;
  return { ok, gron: ok, fel, varningar };
}

export function rapport(resultat) {
  if (resultat.ok ?? resultat.gron) return '✅ Kundvyn grön — butiken ser ut som en butik.';
  return [
    `❌ Kundvyn underkänd, ${resultat.fel.length} problem:`,
    ...resultat.fel.map((f) => `  ❌ ${f}`),
    '',
    'Butiken får INTE annonser förrän listan är tom.',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Synlig text — det en kund faktiskt läser. Script, style, kommentarer och
// attribut räknas inte (ett svenskt ord i en data-attribut är ingen läcka).
// ---------------------------------------------------------------------------

const ENTITETER = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ouml: 'ö', auml: 'ä', aring: 'å', Ouml: 'Ö', Auml: 'Ä', Aring: 'Å', oslash: 'ø', aelig: 'æ', Oslash: 'Ø', AElig: 'Æ' };

export function avkodaEntiteter(t) {
  return String(t)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => ENTITETER[n] ?? m);
}

// Judge.me-widgeten visar butikens ALLA recensioner (svenska + norska blandat,
// PROCESS.md fas 3) — den räknas inte som läcka och klipps bort före skanningen.
export function utanJudgeMe(html) {
  // Appytan (ms-app-slot) renderas som <section>, inte <div> (mätt 2026-09-08).
  return String(html)
    .replace(/<(?:div|section) id="shopify-section-[^"]*__judgeme_widget"[\s\S]*?(?=<(?:div|section) id="shopify-section-)/, '')
    .replace(/<div[^>]*class="[^"]*jdgm-[^"]*"[\s\S]*?<\/div>/g, '');
}

// Tar bort allt som inte är synlig text: script, style, kommentarer, attribut.
export function synligText(html) {
  return avkodaEntiteter(
    String(html)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<template[\s\S]*?<\/template>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
  );
}

// ---------------------------------------------------------------------------
// Svenska markörer på en översatt sida. Orden är butikens egna
// (butik.yaml → butik.markorer_sv): de rubriker och knapptexter fabriken
// skriver på svenska och som ALDRIG får stå kvar på /nb, /da …
// Ingen lista här — 'överdrag' är TankGuards ord, inte varje butiks
// (KEDJAN.md regel 7). Saknas fältet returnerar skanningen tomt och
// anroparen rapporterar det som manuellt, aldrig som grönt.
// ---------------------------------------------------------------------------

export const lasMarkorer = (butik) =>
  (Array.isArray(butik?.butik?.markorer_sv) ? butik.butik.markorer_sv : [])
    .map((m) => String(m ?? '').trim())
    .filter(Boolean);

// Ord som råkar vara likadana på målspråket (Kontakt, Returpolicy …) plockas
// bort: står samma text i sv- och <locale>-underlaget är den ingen läcka.
// `sv` och `oversatt` är översättningsobjekten (nyckel → text).
export function filtreraMarkorer(markorer, sv, oversatt) {
  if (!sv || !oversatt) return [...markorer];
  const samma = new Set(
    Object.keys(sv)
      .filter((k) => typeof oversatt[k] === 'string' && oversatt[k].trim() === String(sv[k]).trim())
      .map((k) => String(sv[k]).trim())
  );
  return markorer.filter((m) => !samma.has(m));
}

export function svenskaMarkorer(html, markorer) {
  const lista = Array.isArray(markorer) ? markorer.map((m) => String(m ?? '').trim()).filter(Boolean) : [];
  if (lista.length === 0) return [];
  const t = synligText(utanJudgeMe(html));
  return lista.filter((m) => t.includes(m));
}

// ---------------------------------------------------------------------------
// Strukturkontrollen på produktsidan: sektionerna fabriken bygger ska finnas
// i det RENDERADE temat — inte bara i temafilerna (curl-läxan 2026-09-07:
// filerna fanns, kunden såg ändå ett annat tema).
// ---------------------------------------------------------------------------

// Axels beslut 2026-09-08: alltid svensk lag, ALDRIG egna köplöften.
// Fabriksregel, inte butiksord — gäller varje butik.
const KOPLOFTEN = /öppet köp|åpent kjøp/i;

export function strukturkoll(html, { produkt, butik } = {}) {
  const h = String(html);
  const produktHandle = produkt?.produkt?.handle ?? produkt?.produkt?.id ?? '';
  const bonusHandle = produkt?.offer?.bonus_produkt?.handle ?? null;
  const har = (s) => h.includes(s);
  const punkter = [];
  const punkt = (namn, ok) => punkter.push({ namn, ok: Boolean(ok) });

  punkt('opf-sektionerna renderas', ['opf-problem', 'opf-losning', 'opf-funktioner', 'opf-garanti', 'opf-faq'].every(har));
  punkt('paketväljaren (ms-paket) finns', har('ms-paket__opt'));
  punkt('A/B-block (data-ms-ab)', har('data-ms-ab="paket:a"') && har('data-ms-ab="paket:b"'));
  punkt('gratis-raden i paketen', har('ms-paket__gava'));
  punkt('Judge.me-widget i Appyta', har('jdgm-widget') || har('judgeme'));
  punkt('sticky köpknapp', har('ms-sticky'));
  punkt('varumärke-strippen (opf-svensk)', har('opf-svensk'));
  punkt('opf-brand.css laddad', har('opf-brand.css'));
  punkt('gallerifilter i head', har('[alt^=') || har('opf-gallerifilter'));
  // Korg-upsellen renderas bara med varor i korgen — den kollas i köptestet.
  if (bonusHandle) punkt('fullpris-kryssrutan (opf-tillagg)', har('opf-tillagg-mall') && har('opf-tillagg__kryss'));
  punkt('inga egna köplöften (öppet köp)', !KOPLOFTEN.test(synligText(h)));
  if (produktHandle) punkt('produktlänken', har(`/products/${produktHandle}`));
  if (butik?.butik?.brand) punkt('brandnamnet på sidan', harText(h, butik.butik.brand));

  const fel = punkter.filter((p) => !p.ok).map((p) => p.namn);
  return { ok: fel.length === 0, fel, punkter };
}

// Huvudspråkets vy: produktnamn och pris ska SYNAS som text på sidan.
export function produktkoll(html, produkt) {
  const t = synligText(html);
  const forvantat = [produkt?.produkt?.namn, produkt?.ekonomi?.pris]
    .map((x) => (x === undefined || x === null ? '' : String(x)))
    .filter(Boolean);
  const fel = forvantat.filter((x) => !t.includes(x)).map((x) => `"${x}" syns inte i huvudspråkets vy`);
  return { ok: fel.length === 0, fel };
}
