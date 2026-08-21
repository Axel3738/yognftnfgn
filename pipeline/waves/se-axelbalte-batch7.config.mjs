// SE Axelbältet — Batch 7 (ägar-UGC med hookar), 2026-08-21.
//
// Sju videor in i den befintliga CBO-kampanjen "Axelbältet", ett nytt adset,
// ingen adsetbudget. Briefarna (Approved, "Trimmer belt creative hub"):
//
//   PD_18_1_H1–H4 — kontots bästa annons någonsin (Axel UGC AXELBÄLTE,
//     CPA 104 kr, +2 127 kr per 1 000) med fyra inspelade öppningsrader
//     framför samma footage. Isolerad variabel: de första sekunderna.
//   PD_18_2_H1–H3 — andra inspelningen: röjsåg på ojämn mark, tre hookar.
//     Byggd för att lanen inte ska hänga på en enda fil, och för att nå en
//     annan tittare (kampanjfrekvens 3,41).
//
// COPY: briefarnas globala regel #1 — "Copy is deliberately held constant" på
// kontots pain-text och rubriken "Trimma utan ont i axlarna". Texten nedan är
// tillbakaläst ordagrant från Axel UGC AXELBÄLTE/PD_1_H1, som båda kör den.
// Hookarna jämförs mot varandra och mot det hooklösa originalet, så copyn får
// inte variera. Originalet lämnas orört.
//
// Biblioteksfilerna heter "Trimmerbelt_PD_18_1 H1.mp4" (mellanslag) —
// m.media pekar på filen, annonsnamnet får understreck.

const LP = 'https://baverbutiken.se/products/axelbalte-for-trimmer-justerbart-nylonbalte';

const COPY_PAIN = {
  message: 'Ont i axlarna efter en dag i trädgården? 😩\n\nDet här bältet fördelar vikten från trimmern jämnt över axeln.\nMindre press på armar, nacke och rygg.\nJusterbart så det passar precis dig.\n\nTrimma längre, utan att det gör ont. 👇 Beställ ditt idag.',
  headline: 'Trimma utan ont i axlarna',
  description: 'Vadderat, justerbart axelbälte för trimmer.',
  cta: 'SHOP_NOW', link: LP,
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
      campaignName: 'Axelbältet',   // befintlig CBO — ingen create
      adsets: [
        {
          name: 'Axelbälte PD Batch 7',
          copy: COPY_PAIN, link: LP,
          motifs: [
            { name: 'Trimmerbelt_PD_18_1_H1', media: 'Trimmerbelt_PD_18_1 H1' },
            { name: 'Trimmerbelt_PD_18_1_H2', media: 'Trimmerbelt_PD_18_1 H2' },
            { name: 'Trimmerbelt_PD_18_1_H3', media: 'Trimmerbelt_PD_18_1 H3' },
            { name: 'Trimmerbelt_PD_18_1_H4', media: 'Trimmerbelt_PD_18_1 H4' },
            { name: 'Trimmerbelt_PD_18_2_H1', media: 'Trimmerbelt_PD_18_2 H1' },
            { name: 'Trimmerbelt_PD_18_2_H2', media: 'Trimmerbelt_PD_18_2 H2' },
            { name: 'Trimmerbelt_PD_18_2_H3', media: 'Trimmerbelt_PD_18_2 H3' },
          ],
        },
      ],
    },
  ],
};
