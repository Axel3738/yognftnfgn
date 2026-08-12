// Batch 4 i befintliga SE-kampanjen "Axelbältet" (MagiBorsten, svenska marknaden).
// Copy = exakt samma PD-copy som Batch 3 kör. Targeting speglar Batch 3 (SE broad).
export default {
  act: 'act_1867947880635861', // MagiBorsten (SE)
  campaignName: 'Axelbältet',
  page: '678639638662543',   // Bäverbutiken.se
  pixel: '1554276343018184',
  link: 'https://baverbutiken.se/products/axelbalte-for-trimmer-justerbart-nylonbalte',
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['SE'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 }, // samma som Batch 3
  },
  media: {
    PD: [
      'Trimmerbelt_PD_1_2_H1',
      'Trimmerbelt_PD_1_3_H1',
      'Trimmerbelt_PD_8_1_H2',
      'Trimmerbelt_PD_1_1_H5',
      'Trimmerbelt_PD_1_1_H4',
      'Trimmerbelt_PD_7_1',
    ],
  },
  adsets: { PD: 'Axelbälte PD Batch 4' },
  copy: {
    PD: {
      message: 'Ont i axlarna efter en dag i trädgården? 😩\n\nDet här bältet fördelar vikten från trimmern jämnt över axeln.\nMindre press på armar, nacke och rygg.\nJusterbart så det passar precis dig.\n\nTrimma längre, utan att det gör ont. 👇 Beställ ditt idag.',
      headline: 'Trimma utan ont i axlarna',
      description: 'Vadderat, justerbart axelbälte för trimmer.',
    },
  },
};
