// Kampanj: Tribuneponcho NO — videobatch 2026-09-30 (rutinen /translate-no, röst ElevenLabs).
// Norsk copy av sonnet ur svenska ADCOPY-docsen, verifierad mot beverbutikken.no: pris 679 kr (før 889),
// 30 dagers åpent kjøp OK. Overifierat i källan (bara idag, nästan slutsåld, kundcitat/stjärnor,
// "kunder pratar om", tvättbar, clearance) borttaget. Powerbank följer inte med (står i copyn).
// COGS: batch-sheet, NORWAY Qty 1 = 24,07 EUR × 10,8367 = 260,85 NOK ⇒ BE-ROAS 1,63.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Tribuneponcho NO | BE-ROAS 1,63 | 2026-09-30',
  link: 'https://beverbutikken.no/products/tribuneponcho-med-varme-tre-varmenivaer-via-usb',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-30/laktarponcho/final', // relativt pipeline/
  adsets: [
    {
      name: 'Tribuneponcho NO - PD',
      copy: {
        message: "Fryser du på tribunen? Du trenger ikke pledd lenger. 🧣\nTribuneponchoen har innebygd varme via USB.\nDu velger selv mellom tre varmenivåer.\nHendene er helt frie hele kampen.\nPerfekt for tribunen, jaktposten og sofaen.\n(Powerbank følger ikke med.)\nTrykk på knappen under. 👇",
        headline: "Varm hele kampen. Hendene frie.",
        description: "Tre varmenivåer. Drives via USB.",
      },
      ads: [
        { name: 'Tribuneponcho_NO_PD_1_H1', file: 'NO_tribuneponcho_PD_1_H1.mp4' },
        { name: 'Tribuneponcho_NO_PD_1_H2', file: 'NO_tribuneponcho_PD_1_H2.mp4' },
        { name: 'Tribuneponcho_NO_PD_1_H3', file: 'NO_tribuneponcho_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Tribuneponcho NO - SP',
      copy: {
        message: "Varm når andre fryser. 🔥\nTribuneponchoen har innebygd varme du styrer selv, med tre nivåer.\nDu bærer den, så du slipper å holde i et pledd.\nTa den med hvor som helst – drives via USB.\n(Powerbank følger ikke med.)\nTrykk på knappen under. 👇",
        headline: "Vær den som er varm når alle fryser",
        description: "Tre varmenivåer du styrer selv via USB.",
      },
      ads: [
        { name: 'Tribuneponcho_NO_SP_1_H1', file: 'NO_tribuneponcho_SP_1_H1.mp4' },
        { name: 'Tribuneponcho_NO_SP_1_H2', file: 'NO_tribuneponcho_SP_1_H2.mp4' },
        { name: 'Tribuneponcho_NO_SP_1_H3', file: 'NO_tribuneponcho_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'Tribuneponcho NO - CS',
      copy: {
        message: "🚨 24 % rabatt på tribuneponchoen med varme!\nFør 889 kr. Nå 679 kr – du sparer 210 kr.\nTre varmenivåer du styrer selv, via USB.\n(Powerbank følger ikke med.)\n30 dagers åpent kjøp.\nTrykk på knappen under. 👇",
        headline: "24 % rabatt på tribuneponcho",
        description: "Spar 210 kr. Tre varmenivåer via USB.",
      },
      ads: [
        { name: 'Tribuneponcho_NO_CS_1_H1', file: 'NO_tribuneponcho_CS_1_H1.mp4' },
        { name: 'Tribuneponcho_NO_CS_1_H2', file: 'NO_tribuneponcho_CS_1_H2.mp4' },
        { name: 'Tribuneponcho_NO_CS_1_H3', file: 'NO_tribuneponcho_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Tribuneponcho NO - G',
      copy: {
        message: "Hva gir du den som alltid fryser? 🎁\nDenne. Se ansiktet når pakken åpnes.\nEn tribuneponcho med innebygd varme – tre nivåer du styrer selv, via USB.\nPå tribunen, på jaktposten eller i sofaen.\n(Powerbank følger ikke med.)\nDu fant den perfekte gaven. Finn den her. 👇",
        headline: "Gaven som varmer hver gang",
        description: "Tre varmenivåer via USB. Powerbank følger ikke med.",
      },
      ads: [
        { name: 'Tribuneponcho_NO_G_1_H1', file: 'NO_tribuneponcho_G_1_H1.mp4' },
        { name: 'Tribuneponcho_NO_G_1_H2', file: 'NO_tribuneponcho_G_1_H2.mp4' },
        { name: 'Tribuneponcho_NO_G_1_H3', file: 'NO_tribuneponcho_G_1_H3.mp4' },
      ],
    },
  ],
};
