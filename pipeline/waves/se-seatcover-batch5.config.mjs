// SE Sätesöverdragaren — Batch 5, 2026-08-12.
// Copy hämtad ordagrant ur Notion-briefsen. Till skillnad från motorhöljet delar
// dessa INTE copy per vinkel — varje annons har en egen briefad text.
//
// SO_5_1 (typografi), SO_6_1 (autentiskt foto) och SO_7_1 (budskap) angriper samma
// CTR-problem från tre håll och ska enligt briefsen köra tillsammans i samma adset.

const LP = 'https://baverbutiken.se/products/satesoverdrag-for-akgrasklippare-slittaligt-600d-oxford';

export default {
  act: 'act_1867947880635861',     // MagiBorsten (SE)
  page: '678639638662543',         // Bäverbutiken.se
  instagram: '17841474144960111',
  pixel: '1554276343018184',
  link: LP,
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['SE'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  campaigns: [
    {
      campaignName: 'Sätesöverdragaren',
      adsets: [
        {
          name: 'Seatcover PD Batch 5',
          link: LP,
          motifs: [
            { name: 'Seatcover_PD_20_1', copy: {
              message: 'Handduken på sätet håller typ en dag – sen är du tillbaka på ruta ett. Vårt sätesöverdrag i 600D Oxford-tyg är byggt för att faktiskt hålla vattnet borta. ✅ Vattenavvisande 600D Oxford-tyg ✅ Vadderad insida ✅ På plats på under 60 sekunder, inga verktyg. Handla nu för 649 kr – fri frakt och nöjd-kund-garanti.',
              headline: 'Sätesöverdrag som håller vad handduken inte gör',
              description: '', link: LP } },
          ],
        },
        {
          name: 'Seatcover SO Batch 5',
          link: LP,
          motifs: [
            { name: 'Seatcover_SO_5_1', copy: {
              message: 'Ett nytt säte till åkgräsklipparen kan kosta flera tusenlappar. Vårt sätesöverdrag i 600D Oxford ger samma skydd för en bråkdel av priset. Det träs rakt över din befintliga dyna – klart på under 60 sekunder. ✅ Vattenavvisande tyg, torrt säte oavsett väder ✅ Vadderad insida för skonsam körning ✅ Passar de flesta åkgräsklippare och trädgårdstraktorer 👉 Tryck på länken och se hur enkelt det sitter på.',
              headline: 'Spara tusenlappar – 649 kr',
              description: '', link: LP } },

            { name: 'Seatcover_SO_6_1', copy: {
              message: 'Ute på gräsmattan märks skillnaden direkt. Istället för att byta ut hela sätet räcker det att lägga sätesöverdraget ovanpå. 600D Oxford-tyget håller borta fukt och grus, och det sitter på plats på under en minut. ✅ Vattenavvisande, håller sätet torrt ✅ Vadderad insida, skönare att sitta på ✅ Fyra färger att välja mellan 👉 Tryck på länken och se hur enkelt det sitter på.',
              headline: 'Samma säte, torrare sittning – 649 kr',
              description: '', link: LP } },

            { name: 'Seatcover_SO_7_1', copy: {
              message: 'Ett nytt säte till åkgräsklipparen kostar snabbt flera tusenlappar. Vårt sätesöverdrag i slittåligt 600D Oxford-tyg skyddar sätet du redan har – för 649 kr istället för ordinarie 811 kr. ✅ Vattenavvisande 600D Oxford-tyg ✅ Vadderad insida med justerbara remmar ✅ På plats på under 60 sekunder. Handla nu – fri frakt och nöjd-kund-garanti.',
              headline: '649 kr istället för ett nytt säte',
              description: '', link: LP } },
          ],
        },
      ],
    },
  ],
};
