// Kundvakten: alla trösklar och inställningar på ETT ställe.
//
// Trösklarna är ABSOLUTA, inte relativa — den sämsta produkten i gruppen ska
// inte bli röd bara för att den är sämst. Samma regel som dashboardens.
//
// Chargeback-gränserna nedan är kortnätverkens egna programnivåer, inte
// påhittade siffror: Visa (VDMP) och Mastercard (ECP) sätter in en butik i
// övervakningsprogram runt 0,9–1,0 % av transaktionerna. Betalleverantörer
// reagerar tidigare. Därför ligger gult på 0,5 %.

export const TROSKLAR = {
  // Andel ordrar med tvist, per produkt. Absoluta nivåer.
  rate_gul: 0.005, // 0,5 % — betalleverantören börjar titta
  rate_rod: 0.009, // 0,9 % — kortnätverkens övervakningsprogram

  // Ingen dom får fällas på för lite data. Samma princip som analysmetodens
  // "ingen dom under 300 kr spend eller 3 köp".
  min_ordrar_for_dom: 30,

  // Förvarningar på enskilda ordrar (dagar).
  dagar_obefordrad: 5, // betald men inte skickad
  dagar_utan_leverans: 21, // skickad men aldrig framme
  dagar_kvar_pa_svarsfrist: 5, // tvist vars deadline närmar sig

  // Mail: hur många gånger en kund fått maila utan svar innan det larmar.
  mail_utan_svar: 2,
};

// Hur långt bakåt varje körning tittar.
export const FONSTER = {
  vecka_dagar: 7, // "den här veckan" i rapporten
  jamforelse_dagar: 90, // underlaget för chargeback-rate per produkt
};

// Produkter som aldrig ska rankas — de är inte riktiga produkter.
// "Garanti för säker frakt" är en tilläggstjänst som åker med i korgen och
// skulle annars se ut att ha tvister den inte orsakat.
export const EJ_PRODUKTER = ['Garanti för säker frakt'];

// Shopify: vilken butik. Bäverbutiken är SE.
// ⚠️ Bäverbutiken och Grillkliniken blandas aldrig — kundvakten läser ENBART
// den butik som pekas ut här.
export const SHOPIFY = {
  doman: () => process.env.SHOPIFY_SHOP_SE || process.env.SHOPIFY_STORE_DOMAIN,
  token: () => process.env.SHOPIFY_TOKEN_SE || process.env.SHOPIFY_ADMIN_TOKEN,
  version: () => process.env.SHOPIFY_API_VERSION || '2025-07',
};

// Brevlådan: HTTPS-endpointen som lämnar ut supportmailen som JSON.
// IMAP går inte att nå från rutinens container (mätt 2026-09-09: port 993 och
// 143 ger timeout direkt, och via proxyn stängs tunneln efter 6 sekunder).
// Därför hämtas mailen över HTTPS. Se brevlada.gs.
export const BREVLADA = {
  url: () => process.env.MAIL_BREVLADA_URL,
  nyckel: () => process.env.MAIL_BREVLADA_KEY,
};
