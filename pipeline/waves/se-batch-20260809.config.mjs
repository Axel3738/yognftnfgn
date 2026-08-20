// SE-batch 2026-08-09 — nya batch-adsets i befintliga kampanjer på MagiBorsten (SE).
// Motiv med _1x1/_4x5/_9x16-varianter blir EN annons med placeringsanpassning.
// Copy hämtas live från käll-adsetet (senaste batchen per koncept).
export default {
  act: 'act_1867947880635861', // MagiBorsten (SE)
  page: '678639638662543',     // Bäverbutiken.se
  instagram: '17841474144960111', // Bäverbutiken-IG — krävs av placeringsanpassade annonser
  pixel: '1554276343018184',
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['SE'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  campaigns: [
    {
      campaignName: 'Motorhöljet',
      adsets: [
        { name: 'Motorhölje PD Batch 6', copyFrom: 'Motorhölje PD Batch 5',
          motifs: ['Enginecover_PD_16_1', 'Enginecover_PD_17_1'] },
        { name: 'Motorhölje SO Batch 6', copyFrom: 'Motorhölje SO Batch 5',
          motifs: ['Enginecover_SO_14_1', 'Enginecover_SO_14_2', 'Enginecover_SO_15_1'] },
        { name: 'Motorhölje SP Batch 6', copyFrom: 'Motorhölje SP Batch 5',
          motifs: ['Enginecover_SP_12_1', 'Enginecover_SP_12_2', 'Enginecover_SP_12_3', 'Enginecover_SP_14_1'] },
      ],
    },
    {
      campaignName: 'Axelbältet',
      adsets: [
        { name: 'Axelbälte PD Batch 5', copyFrom: 'Axelbälte PD Batch 4',
          motifs: ['Trimmerbelt_PD_2_5', 'Trimmerbelt_PD_9_1', 'Trimmerbelt_PD_10_1'] },
        { name: 'Axelbälte SO Batch 5', copyFrom: 'Axelbälte SO Batch 3',
          motifs: ['Trimmerbelt_SO_2_7'] },
      ],
    },
    {
      campaignName: 'Sätesöverdragaren',
      adsets: [
        { name: 'Seatcover PD Batch 4', copyFrom: 'Seatcover PD Batch 3',
          motifs: ['Seatcover_PD_13_H1', 'Seatcover_PD_14_1', 'Seatcover_PD_15_H1'] },
        { name: 'Seatcover SO Batch 4', copyFrom: 'Seatcover SO Batch 3',
          motifs: ['Seatcover_SO_4_1'] },
      ],
    },
    {
      campaignName: 'Strandtofflorna',
      adsets: [
        { name: 'Strandtofflor PD Batch 4', copyFrom: 'Strandtofflor PD Batch 3',
          motifs: ['Beachslippers_PD_8_2', 'Beachslippers_PD_8_3', 'Beachslippers_PD_13_11',
                   'Beachslippers_PD_13_12', 'Beachslippers_PD_13_13', 'Beachslippers_PD_14_1',
                   'Beachslippers_PD_15_1', 'Beachslippers_PD_16_1'] },
      ],
    },
  ],
};
