// Kampanj: Motorhöljet DK — Magiborsten DK. Struktur byggd, annonser väntar på FB-sida + DK-länk.
export default {
  act: 'act_915422744950975', // Magiborsten DK
  page: null,                 // TODO: dansk FB-sida saknas ännu
  pixel: '1554276343018184',
  country: 'DK',
  prefix: 'DK',
  dsaBeneficiary: 'Axel Odhner', // EU-krav, samma som SE-kontot
  dsaPayor: 'Axel Odhner',
  structureOnly: true,        // sätt false när sida + länk finns
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaignName: 'Motorhöljet DK',
  link: '', // TODO: dansk produktlänk
  dailyBudget: '100000', // öre = 1000 kr/dag
  productRe: /enginecover|motorholje|motorhölje|marin/i,
  concepts: {
    PD: {
      adset: 'Motorhölje DK - PD',
      message: 'Regn, sol og salt slider på din motor hver eneste dag ⛵\n\nDette betræk beskytter den mod vejr og rust.\nUniversal pasform — passer de fleste påhængsmotorer.\nNem at tage af og på.\n\nBeskyt din motor i dag 👇',
      headline: 'Beskyt din motor — år efter år',
      description: 'Kraftigt 420D-stof mod regn, sol og salt.',
    },
    SP: {
      adset: 'Motorhölje DK - SP',
      message: 'Bådejere taler om dette betræk lige nu 🌊\n\nSidder fast selv i storm og kraftig vind.\nHolder din motor helt tør og beskyttet.\nHundredvis af tilfredse kunder allerede.\n\nSe hvorfor selv 👇',
      headline: 'Motorbetrækket bådejere stoler på',
      description: 'Bedømt 5 ud af 5 af verificerede kunder.',
    },
    SO: {
      adset: 'Motorhölje DK - SO',
      message: 'Din motor er for værdifuld til at stå ubeskyttet ⚓\n\nBeskyt den mod regn, sol, salt og rust.\nUniversal pasform, nem at tage på.\n\nPå tilbud lige nu. Bestil før lageret er tomt 👇',
      headline: 'Beskyt din motor — inden vinteren',
      description: 'Kampagnepris lige nu.',
    },
  },
};
