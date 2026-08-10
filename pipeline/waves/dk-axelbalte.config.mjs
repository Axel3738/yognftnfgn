// Kampanj: Axelbältet DK — Magiborsten DK. Struktur byggd, annonser väntar på FB-sida + DK-länk.
export default {
  act: 'act_915422744950975',
  page: null,
  pixel: '1554276343018184',
  country: 'DK',
  prefix: 'DK',
  dsaBeneficiary: 'Axel Odhner',
  dsaPayor: 'Axel Odhner',
  structureOnly: true,
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaignName: 'Axelbältet DK',
  link: '', // TODO: dansk produktlänk
  dailyBudget: '100000',
  productRe: /shoulder-?belt|axelbalte|axelbälte|trimmerbelt/i,
  aliases: { SF: 'SP' },
  forceConcept: { 'DK_Shoulder-Belt': 'PD' },
  concepts: {
    PD: {
      adset: 'Axelbälte DK - PD',
      message: 'Ondt i skuldrene efter en dag i haven? 😩\n\nDette bælte fordeler vægten fra trimmeren jævnt over skulderen.\nMindre belastning på arme, nakke og ryg.\nJusterbart så det passer lige dig.\n\nTrim længere, uden at det gør ondt.\n👇 Bestil dit i dag.',
      headline: 'Trim uden ondt i skuldrene',
      description: 'Polstret, justerbart skulderbælte til trimmer.',
    },
    SP: {
      adset: 'Axelbälte DK - SP',
      message: '"Det bedste jeg har købt til haven i år." ⭐⭐⭐⭐⭐\n\nTusindvis af tilfredse kunder stoler allerede på dette skulderbælte.\nFordeler vægten fra trimmeren — skåner skuldre og ryg.\nJusterbart, polstret og bygget til at holde.\n\nSe hvorfor så mange vælger det. 👇',
      headline: 'Trim uden ondt i skuldrene',
      description: 'Anbefalet af tusindvis af haveejere.',
    },
    SO: {
      adset: 'Axelbälte DK - SO',
      message: 'Havesæsonen er her 🌿\n\nStop med at bære hele trimmerens vægt selv.\nDette bælte fordeler trykket jævnt over skulderen.\nJusterbart — passer dig, uanset størrelse.\n\nPå tilbud nu. Bestil før lageret er tomt. 👇',
      headline: 'Trim uden ondt i skuldrene',
      description: 'Kampagnepris lige nu — begrænset antal.',
    },
  },
};
