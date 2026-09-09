// Kundvy-kontrollen: kollar att butiken SER UT som en butik.
//
// Bakgrunden (Axels bakläxa 2026-09-09, DryTrek): fabrikens QA rapporterade
// "14 gröna, 0 fel" på en butik som hette "My Store 3", saknade logga, visade
// Shopifys default-illustration som hero, hade Dawns meny (Home/Catalog/
// Contact) och stod på engelska. Varenda kontroll läste KONFIGURATION —
// metafält finns, sektioner finns, priser stämmer — och ingen läste sidan
// som en kund ser den.
//
// Regeln: en butik är inte grön förrän startsidans HTML är kontrollerad.

// Spår av ett obyggt Shopify-tema. Träff = butiken är inte färdig.
export const DEFAULTSPAR = [
  { monster: /My Store/i, vad: 'butiksnamnet är Shopifys default ("My Store")' },
  { monster: /\/files\/hero-apparel/i, vad: 'hero-bilden är Shopifys placeholder-illustration' },
  { monster: /burst\.shopifycdn\.com/i, vad: 'en Shopify-lagerbild ligger kvar' },
  { monster: /placeholder-svg|placeholder\.svg/i, vad: 'en placeholder-SVG renderas' },
  { monster: />\s*Catalog\s*</, vad: 'menyn är Dawns default ("Catalog")' },
  { monster: /Example Product Title|Exempel på produktnamn/i, vad: 'en exempelprodukt visas' },
];

// Saker som MÅSTE finnas på en färdig OPS-startsida.
export function byggKrav(butik, produkt) {
  const brand = butik?.butik?.brand ?? '';
  const produktnamn = produkt?.produkt?.namn ?? '';
  return [
    { namn: 'brandnamn', finns: (h) => brand !== '' && h.includes(brand),
      fel: `brandnamnet "${brand}" står ingenstans på startsidan` },
    { namn: 'logga', finns: (h) => /<img[^>]+class="[^"]*header__heading-logo/i.test(h),
      fel: 'ingen logga i headern — bara text' },
    { namn: 'produkt', finns: (h) => produktnamn !== '' && h.includes(produktnamn),
      fel: `produkten "${produktnamn}" syns inte på startsidan` },
    { namn: 'produktbild', finns: (h) => /cdn\.shopify\.com\/s\/files\/[^"']+\.(jpg|jpeg|png|webp)/i.test(h),
      fel: 'ingen riktig produktbild laddad' },
    { namn: 'köpknapp', finns: (h) => /Köp|Lägg i varukorg|Kjøp|Legg i handlekurv/i.test(h),
      fel: 'ingen köpknapp på startsidan' },
  ];
}

// Kontrollerar startsidans HTML. Returnerar { gron, fel: [...] }.
export function kontrolleraKundvy(html, butik, produkt) {
  const h = String(html);
  const fel = [];
  for (const d of DEFAULTSPAR) {
    if (d.monster.test(h)) fel.push(`DEFAULT KVAR: ${d.vad}`);
  }
  for (const k of byggKrav(butik, produkt)) {
    if (!k.finns(h)) fel.push(`SAKNAS: ${k.fel}`);
  }
  return { gron: fel.length === 0, fel };
}

export function rapport(resultat) {
  if (resultat.gron) return '✅ Kundvyn grön — butiken ser ut som en butik.';
  return [
    `❌ Kundvyn underkänd, ${resultat.fel.length} problem:`,
    ...resultat.fel.map((f) => `  ❌ ${f}`),
    '',
    'Butiken får INTE annonser förrän listan är tom.',
  ].join('\n');
}
