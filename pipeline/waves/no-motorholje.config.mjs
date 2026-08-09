// Kampanj: Motorhöljet NO — Magiborsten NO, beverbutikken.no. ALLT AVSTÄNGT vid skapande.
// Copy: norsk översättning av etablerade koncept-texterna (inget separat NO-dokument fanns).
export default {
  act: 'act_1050941584152547', // Magiborsten NO
  page: '879054088633562',     // Beverbutikken (ingen IG-koppling)
  pixel: '1554276343018184',
  country: 'NO',
  prefix: 'NO',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaignName: 'Motorhöljet NO',
  link: 'https://beverbutikken.no/products/marint-motortrekk-420d-universell-beskyttelse?_pos=2&_psq=motor&_psid=85b89a0d5&_ss=e',
  dailyBudget: '100000', // öre = 1000 kr/dag
  productRe: /enginecover|motorholje|motorhölje|marin/i,
  concepts: {
    PD: {
      adset: 'Motorhölje NO - PD',
      message: 'Regn, sol og salt sliter på motoren din hver eneste dag ⛵\n\nDette trekket beskytter den mot vær og rust.\nUniversell passform — passer de fleste påhengsmotorer.\nEnkelt å ta på og av.\n\nBeskytt motoren din i dag 👇',
      headline: 'Beskytt motoren din — år etter år',
      description: 'Slitesterkt 420D-stoff mot regn, sol og salt.',
    },
    SP: {
      adset: 'Motorhölje NO - SP',
      message: 'Båteiere snakker om dette trekket akkurat nå 🌊\n\nSitter godt selv i storm og kraftig vind.\nHolder motoren helt tørr og beskyttet.\nHundrevis av fornøyde kunder allerede.\n\nSe hvorfor selv 👇',
      headline: 'Motortrekket båteiere stoler på',
      description: 'Vurdert 5 av 5 av verifiserte kunder.',
    },
    SO: {
      adset: 'Motorhölje NO - SO',
      message: 'Motoren din er verdt for mye til å stå ubeskyttet ⚓\n\nBeskytt den mot regn, sol, salt og rust.\nUniversell passform, enkel å ta på.\n\nPå salg akkurat nå. Bestill før det blir utsolgt 👇',
      headline: 'Beskytt motoren din — før vinteren',
      description: 'Kampanjepris akkurat nå.',
    },
  },
};
