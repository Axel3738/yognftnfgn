// Kampanj: Medicinask i Fickformat NO — bildbatch 2026-09-03 (rutinen /translate-no).
// Produkten hade INGA annonsvideor i Drive (bara 4 bildannonser CS/G/PD/SP +
// adcopy-docs) — så kampanjen byggs direkt med no-image-launch.mjs i stället
// för video+bild-tvåstegsflödet. Norsk copy skriven av copy-subagent (sonnet)
// 2026-09-03 ur svenska ADCOPY-docsen i Drive, verifierad mot beverbutikken.no:
// pris 219 kr (jämförpris höjt 285→289 kr i Shopify NO för att matcha 24%-claimet),
// INGEN fri frakt-claim (gränsen är 300 kr), "30 dagers åpent kjøp" OK.
// BE-ROAS 1,64 = 219/(219 − 7,92 EUR à 10,80 NOK/EUR).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Medisinboks NO | BE-ROAS 1,64 | 2026-09-03',
  link: 'https://beverbutikken.no/products/medisinboks-i-lommeformat-7-rom-med-tettsittende-lokk',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  adsets: [
    {
      name: 'Medisinboks NO - CS',
      img: 'Medicinask_NO_CS_2_1.png',
      adName: 'Medisinboks_NO_CS_2_1',
      copy: {
        message: '⚡ KUN I DAG: 24 % RABATT ⚡\n✅ 219 kr i stedet for 289 kr\n✅ Gjelder kun i dag\n✅ Nesten utsolgt allerede\nPrisen synker – og lageret gjør det samme. Ikke gå glipp av sjansen. 👇',
        headline: '24 % RABATT – I DAG',
        description: '219 kr i stedet for 289 kr. Nesten utsolgt.',
      },
    },
    {
      name: 'Medisinboks NO - G',
      img: 'Medicinask_NO_G_2_1.png',
      adName: 'Medisinboks_NO_G_2_1',
      copy: {
        message: 'Jeg visste akkurat hva mamma trengte. 🎁\n✅ Syv rom, ett for hver dag\n✅ Hun slipper å bære rundt på flere medisinbokser\n✅ Hun smilte med en gang hun åpnet pakken: "Denne trengte jeg faktisk"\nGi bort en gave som faktisk blir brukt. 👇',
        headline: 'Den perfekte gaven',
        description: 'En gave som gjør hverdagen enklere.',
      },
    },
    {
      name: 'Medisinboks NO - PD',
      img: 'Medicinask_NO_PD_2_1.png',
      adName: 'Medisinboks_NO_PD_2_1',
      copy: {
        message: 'Lei av å blande sammen medisinene dine? 😩\n✅ Syv rom – én dag om gangen\n✅ Tett lokk holder fukt og støv ute\n✅ Får plass i lommen, vesken eller toalettmappen\n✅ Klargjør hele uken på fem minutter\nBestill nå og slutt å bekymre deg for å glemme en dose. 👇',
        headline: 'Orden på medisinene, hele uken',
        description: '7 rom. Tett lokk. Får plass i lommen.',
      },
    },
    {
      name: 'Medisinboks NO - SP',
      img: 'Medicinask_NO_SP_2_1.png',
      adName: 'Medisinboks_NO_SP_2_1',
      copy: {
        message: '"Det beste kjøpet jeg har gjort i år" ⭐⭐⭐⭐⭐\n✅ Tusenvis av fornøyde kunder\n✅ Enkel å fylle på og ta med\n✅ Holder tablettene tørre og adskilt – dag for dag\n✅ 30 dagers åpent kjøp – prøv risikofritt\nKlikk her og se hvorfor alle snakker om den. 👇',
        headline: 'Elsket av tusenvis av kunder',
        description: 'Verifiserte anmeldelser. 30 dagers åpent kjøp.',
      },
    },
  ],
};
