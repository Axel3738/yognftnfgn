// Kampanj: Sätesöverdraget DK — Magiborsten DK. Samma copy på alla ads (som UK/NO).
const COPY = {
  message: 'Sædet på din havetraktor er gennemblødt hver morgen og brandvarmt hver eftermiddag. 😩\n\nVores sædebetræk trækkes direkte over din eksisterende pude:\n✅ Vandafvisende 600D Oxford — tørt sæde selv efter regn\n✅ Polstret indvendigt, så det tager stødene for dig\n✅ Justerbare stropper der ikke glider, selv i ujævnt terræn\n✅ På plads på under 60 sekunder — uden værktøj\n\nPasser de fleste havetraktorer og plæneklippere. Fire farver.\n\n👉 Tryk på linket og se hvor nemt det går på.',
  headline: 'Tørt, behageligt sæde — hele sæsonen',
  description: 'Universal pasform. På plads på under et minut.',
};

export default {
  act: 'act_915422744950975',
  page: '1324465810740336', // Bæverbutiken (DK)
  pixel: '1554276343018184',
  country: 'DK',
  prefix: 'DK',
  dsaBeneficiary: 'Axel Odhner',
  dsaPayor: 'Axel Odhner',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaignName: 'Sätesöverdraget DK',
  link: 'https://baeverbutiken.dk/products/saedebetraek-til-havetraktor-slidstaerkt-600d-oxford',
  dailyBudget: '100000',
  productRe: /seatcover|sätesöverdrag|satesoverdrag/i,
  concepts: {
    PD: { adset: 'Seatcover DK - PD', ...COPY },
    SP: { adset: 'Seatcover DK - SP', ...COPY },
    SO: { adset: 'Seatcover DK - SO', ...COPY },
  },
};
