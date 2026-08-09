// Kampanj: Axelbältet NO — Magiborsten NO, beverbutikken.no. ALLT AVSTÄNGT vid skapande.
// SF tolkas som SP (samma som UK). Kodlösa NO_Shoulder-Belt.png → PD.
export default {
  act: 'act_1050941584152547',
  page: '879054088633562',
  pixel: '1554276343018184',
  country: 'NO',
  prefix: 'NO',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaignName: 'Axelbältet NO',
  link: 'https://beverbutikken.no/products/skulderbelte-for-trimmer-justerbart-nylonbelte?_pos=1&_psq=trimmer&_psid=8c59e89fc&_ss=e',
  dailyBudget: '100000',
  productRe: /shoulder-?belt|axelbalte|axelbälte|trimmerbelt/i,
  aliases: { SF: 'SP' },
  forceConcept: { 'NO_Shoulder-Belt': 'PD' },
  concepts: {
    PD: {
      adset: 'Axelbälte NO - PD',
      message: 'Vondt i skuldrene etter en dag i hagen? 😩\n\nDette beltet fordeler vekten fra trimmeren jevnt over skulderen.\nMindre belastning på armer, nakke og rygg.\nJusterbart så det passer akkurat deg.\n\nTrim lenger, uten at det gjør vondt.\n👇 Bestill ditt i dag.',
      headline: 'Trim uten vondt i skuldrene',
      description: 'Polstret, justerbart skulderbelte for trimmer.',
    },
    SP: {
      adset: 'Axelbälte NO - SP',
      message: '"Det beste jeg har kjøpt til hagen i år." ⭐⭐⭐⭐⭐\n\nTusenvis av fornøyde kunder stoler allerede på dette skulderbeltet.\nFordeler vekten fra trimmeren — sparer skuldre og rygg.\nJusterbart, polstret og bygget for å vare.\n\nSe hvorfor så mange velger det. 👇',
      headline: 'Trim uten vondt i skuldrene',
      description: 'Anbefalt av tusenvis av hageeiere.',
    },
    SO: {
      adset: 'Axelbälte NO - SO',
      message: 'Hagesesongen er her 🌿\n\nSlutt å bære hele vekten av trimmeren selv.\nDette beltet fordeler trykket jevnt over skulderen.\nJusterbart — passer deg, uansett størrelse.\n\nPå salg nå. Bestill før det blir utsolgt. 👇',
      headline: 'Trim uten vondt i skuldrene',
      description: 'Kampanjepris akkurat nå — begrenset antall.',
    },
  },
};
