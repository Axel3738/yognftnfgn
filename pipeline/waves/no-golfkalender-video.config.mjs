// Kampanj: Golfkalender NO — videobatch 2026-09-29 (rutinen /translate-no, röst ElevenLabs).
// Norsk copy av sonnet (claude-sonnet-5 via API, Agent-verktyget fanns inte) ur svenska
// ADCOPY-docsen i Drive, verifierad mot beverbutikken.no: pris 619 kr (før 809 = 23 %),
// 30 dagers åpent kjøp OK. Overifierat i källan (bara i dag, nästan slutsåld, [X] golfare,
// kundcitat, stjärnor, favorit) borttaget.
// COGS: Kalenderkungen Batch, NORWAY Qty 1 = 18,58 EUR × 10,8367 = 201,35 NOK ⇒ BE-ROAS 1,48.
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Golfkalender NO | BE-ROAS 1,48 | 2026-09-29',
  link: 'https://beverbutikken.no/products/golf-adventskalender-24-golftilbehor',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-29/golfkalender/final', // relativt pipeline/
  adsets: [
    {
      name: 'Golfkalender NO - PD',
      copy: {
        message: "Glem sjokoladekalenderen. Dette er for golfspilleren. ⛳\n24 luker med 24 golftilbehør.\nTees, ballmarkører, greenreparatør, køllebørste, håndkle og mer.\nEn liten overraskelse hver dag frem til julaften.\nAlt kommer til nytte på banen.\nTrykk på knappen under og bestill i dag 👇",
        headline: "24 dager med golfglede",
        description: "Åpne en luke hver dag frem til jul.",
      },
      ads: [
        { name: 'Golfkalender_NO_PD_1_H1', file: 'NO_golfkalender_PD_1_H1.mp4' },
        { name: 'Golfkalender_NO_PD_1_H2', file: 'NO_golfkalender_PD_1_H2.mp4' },
        { name: 'Golfkalender_NO_PD_1_H3', file: 'NO_golfkalender_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Golfkalender NO - SP',
      copy: {
        message: "24 luker fylt med golftilbehør de faktisk bruker.\nGolfballer, tees, ballmarkører, køllebørste og håndkle.\nEn ny liten glede hver morgen i desember.\n30 dagers åpent kjøp.\nTrykk på knappen under og bestill 👇",
        headline: "Golfgaven med 24 luker",
        description: "24 luker, ferdig fylt med golftilbehør.",
      },
      ads: [
        { name: 'Golfkalender_NO_SP_1_H1', file: 'NO_golfkalender_SP_1_H1.mp4' },
        { name: 'Golfkalender_NO_SP_1_H2', file: 'NO_golfkalender_SP_1_H2.mp4' },
        { name: 'Golfkalender_NO_SP_1_H3', file: 'NO_golfkalender_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'Golfkalender NO - CS',
      copy: {
        message: "🚨 Spar 190 kr på golf-adventskalenderen!\nOrdinær pris: 809 kr\nNå: 619 kr\nDu sparer 190 kr (23 %).\n24 luker, ferdig fylt med golftilbehør til jul.\n30 dagers åpent kjøp.\nTrykk på knappen under og bestill 👇",
        headline: "24 luker, spar 190 kr",
        description: "Ordinær 809 kr. Nå 619 kr. Spar 23 %.",
      },
      ads: [
        { name: 'Golfkalender_NO_CS_1_H1', file: 'NO_golfkalender_CS_1_H1.mp4' },
        { name: 'Golfkalender_NO_CS_1_H2', file: 'NO_golfkalender_CS_1_H2.mp4' },
        { name: 'Golfkalender_NO_CS_1_H3', file: 'NO_golfkalender_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Golfkalender NO - G',
      copy: {
        message: "Hva gir du en golfspiller som har alt? 🎁\nDu fant svaret.\n24 luker fylt med golftilbehør, én luke om dagen frem til julaften.\nGolfballer, tees, ballmarkører, køllebørste og håndkle.\nIngen slips. Ingen genser. Noe han faktisk blir glad for.\nTrykk på knappen under og bestill 👇",
        headline: "Perfekt julegave til golfspilleren",
        description: "24 grunner for ham til å smile i desember.",
      },
      ads: [
        { name: 'Golfkalender_NO_G_1_H1', file: 'NO_golfkalender_G_1_H1.mp4' },
        { name: 'Golfkalender_NO_G_1_H2', file: 'NO_golfkalender_G_1_H2.mp4' },
        { name: 'Golfkalender_NO_G_1_H3', file: 'NO_golfkalender_G_1_H3.mp4' },
      ],
    },
  ],
};
