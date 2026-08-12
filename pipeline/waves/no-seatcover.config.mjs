// Kampanj: Sätesöverdraget NO — Magiborsten NO, beverbutikken.no. ALLT AVSTÄNGT vid skapande.
// Samma copy på alla ads (som UK-motsvarigheten).
const COPY = {
  message: 'Setet på ridegressklipperen din er gjennomvått hver morgen og glovarmt hver ettermiddag. 😩\n\nSeteovertrekket vårt trekkes rett over den eksisterende puten:\n✅ Vannavvisende 600D Oxford — tørt sete selv etter regn\n✅ Polstret innside som tar støtene for deg\n✅ Justerbare stropper som ikke sklir, selv i ulendt terreng\n✅ På plass på under 60 sekunder — uten verktøy\n\nPasser de fleste ridegressklippere og hagetraktorer. Fire farger.\n\n👉 Trykk på lenken og se hvor enkelt det er.',
  headline: 'Tørt, komfortabelt sete — hele sesongen',
  description: 'Universell passform. På plass på under ett minutt.',
};

export default {
  act: 'act_1050941584152547',
  page: '879054088633562',
  pixel: '1554276343018184',
  country: 'NO',
  prefix: 'NO',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaignName: 'Sätesöverdraget NO',
  link: 'https://beverbutikken.no/products/seteovertrekk-for-ridegressklipper-slitesterkt-600d-oxford?_pos=1&_psq=600&_psid=75b7da35b&_ss=e',
  dailyBudget: '100000',
  productRe: /seatcover|sätesöverdrag|satesoverdrag/i,
  concepts: {
    PD: { adset: 'Seatcover NO - PD', ...COPY },
    SP: { adset: 'Seatcover NO - SP', ...COPY },
    SO: { adset: 'Seatcover NO - SO', ...COPY },
  },
};
