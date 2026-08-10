// Kampanj: Strandtofflorna DK — Magiborsten DK. UGC-videon → SP (som i NO).
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
  campaignName: 'Strandtofflorna DK',
  link: '', // TODO: dansk produktlänk
  dailyBudget: '100000',
  productRe: /beachslippers|strandtofflor/i,
  forceConcept: { 'DK_Strandtofflor': 'PD', 'DK_Strandtofflor_UGC_1': 'SP' },
  concepts: {
    PD: {
      adset: 'Beachslippers DK - PD',
      message: 'Glider du stadig på den våde terrasse? 😬\n\nDisse sandaler har en skridsikker sål der griber på vådt træ, fugtigt græs og glat sten.\n✅ Blødt EVA-materiale — behagelige hele dagen\n✅ På fødderne på 2 sekunder, ingen snørebånd\n✅ Hurtigtørrende og nemme at skylle rene\n\nBestil dine i dag og stop med at bekymre dig om næste skridt 👇',
      headline: 'Skridsikre sko til haven & terrassen',
      description: 'Greb og komfort, uanset underlag.',
    },
    SP: {
      adset: 'Beachslippers DK - SP',
      message: '"Jeg gled ikke én eneste gang — og mine fødder havde det stadig fint efter en hel dag udenfor." 🙌\n\nHundredvis af mænd er allerede skiftet til disse skridsikre sandaler i sommer.\n✅ En skridsikker sål der faktisk holder\n✅ Lette og behagelige hele dagen\n✅ 30 dages tilfredshedsgaranti\n\nSe hvorfor de er blevet et hit i haven og ved poolen 👇',
      headline: 'Skoene alle taler om i sommer',
      description: 'Skridsikre, behagelige og elsket af vores kunder.',
    },
    SO: {
      adset: 'Beachslippers DK - SO',
      message: 'Stop med at glide på våde overflader i sommer ☀️\n\nDisse sandaler griber sikkert på terrassen, plænen og ved poolen.\n✅ Blødt, letvægts EVA-materiale\n✅ Hurtigtørrende og nemme at rengøre\n✅ Fri fragt + Klarna\n\nPå tilbud nu — begrænset antal 👇',
      headline: 'Skridsikre sko til sommerens eventyr',
      description: 'Kampagnepris nu — begrænset antal.',
    },
  },
};
