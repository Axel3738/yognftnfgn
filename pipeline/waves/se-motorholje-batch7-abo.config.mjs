// SE Motorhöljet — Batch 7, separat ABO-testkampanj, 2026-08-12.
//
// Samtliga briefs i batchen kräver detta ordagrant:
//   "Launch in a separate ABO test campaign with equal daily budget per ad."
// Skälet: PD_1_H3 tar 42 % av CBO-budgeten och batch #5:s trevägstest fick
// 5,70 kr på ena armen och 159,76 kr på den andra — testet blev oläsbart.
//
// Diagnos bakom hela batchen (teardown 2026-08-12): CPA 291 kr mot break-even 236,
// frekvens 2,83, alla annonser föll 9–12 aug. Problemet bedöms vara PUBLIKEN, inte
// kreativen — därför testar varje annons en ny situation eller målgrupp.
//
// SO_23_1 och SO_23_2 ingår INTE här. De är retargeting och briefen har en spärr:
// "do not launch this into a cold ad set ... If the ad set cannot be created, leave
// this brief unbuilt and say so." Kontot saknar custom audiences.

const LP = 'https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd';

const COPY_PD = {
  message: 'Är din utombordare en av de större på bryggan?\nDet här höljet är gjort för att sitta som gjutet — inte "passar de flesta".\n420D Oxfordtyg och dragsko runt hela kanten håller regn och salt ute.\nPå och av på sekunder.\nHitta din storlek och skydda den. 👇',
  headline: 'Gjord för större motorer',
  description: '', cta: 'SHOP_NOW', link: LP,
};

const COPY_SO = {
  message: 'Vi beställde för mycket motorhölje i 420D Oxfordtyg.\nNu säljer vi ut till 299 kr istället för 367 kr.\nVattenavvisande skydd mot regn, sol och damm.\nDragsko runt hela kanten för tät passform.\nPå och av på några sekunder.\nSå länge lagret räcker – beställ ditt hölje nu.',
  headline: '299 kr istället för 367 kr',
  description: '', cta: 'SHOP_NOW', link: LP,
};

export default {
  act: 'act_1867947880635861',     // MagiBorsten (SE)
  page: '678639638662543',         // Bäverbutiken.se
  instagram: '17841474144960111',
  pixel: '1554276343018184',
  link: LP,
  dsaBeneficiary: 'Axel Odhner',
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['SE'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  campaigns: [
    {
      campaignName: 'Motorhöljet ABO-test 08-12',
      create: { objective: 'OUTCOME_SALES', status: 'ACTIVE' }, // ABO — budget per adset
      adsets: [
        { name: 'Motorhölje PD Batch 7 (ABO)', copy: COPY_PD, link: LP,
          dailyBudget: '30000', // 300 kr/dag
          motifs: ['Enginecover_PD_24_1', 'Enginecover_PD_24_2', 'Enginecover_PD_24_3'] },

        { name: 'Motorhölje SO Batch 7 (ABO)', copy: COPY_SO, link: LP,
          dailyBudget: '30000', // 300 kr/dag
          motifs: ['Enginecover_SO_22_1', 'Enginecover_SO_22_2', 'Enginecover_SO_24_1'] },

        // Retargeting — briefens spärr uppfylld: publiken finns nu (sidbesökare 180 dagar).
        // Advantage+ audience AV, annars expanderar Meta ut ur retargeting-poolen.
        { name: 'Motorhölje Retargeting', copy: COPY_SO, link: LP,
          dailyBudget: '30000', // 300 kr/dag
          targeting: {
            age_min: 18, age_max: 65,
            geo_locations: { countries: ['SE'], location_types: ['home', 'recent'] },
            custom_audiences: [{ id: '120249703629180291' }],
            targeting_automation: { advantage_audience: 0 },
          },
          motifs: ['Enginecover_SO_23_1', 'Enginecover_SO_23_2'] },
      ],
    },
  ],
};
