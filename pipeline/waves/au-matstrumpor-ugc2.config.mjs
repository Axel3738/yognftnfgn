// AU Matstrumpor — nytt UGC-adset i befintliga MATSTRUMP_SALES AU, 2026-08-29.
//
// Åtta AU-videor i ett nytt adset. Samma inställningar som kampanjens
// befintliga adsets (lästa ur kontot): sidan Sushisock.com, sushisock.com-
// länken, kontots pixel, AU-targeting 18–65 med Advantage audience, och den
// delade engelska UGC-copyn. Kampanjen är ACTIVE (1000 kr/dag CBO) och de
// befintliga adseten kör, så det nya byggs aktivt.
//
// "AU_fable_h1 2"/"AU_fable_h2 2" är biblioteksfilernas faktiska namn
// (mellanslag och allt) — annonsnamnen hålls rena via media-övertaget.

const LP = 'https://sushisock.com/products/sushi-socks';

const COPY_UGC = {
  message: 'Nobody cheers for laundry detergent. Nobody keeps a gag gift.\nThe answer to both: a box that looks like real takeaway, 5 pairs rolled like maki, wooden chopsticks on the side.\nIt doesn\'t stay in the box afterwards — it stays on your feet, week after week.',
  headline: 'Funny tonight. On your feet tomorrow.',
  description: '4 designs. Buy 1, get 1.',
  cta: 'SHOP_NOW', link: LP,
};

export default {
  act: 'act_730973156224390',    // nya kungen (Matstrumpor.se, SEK)
  page: '1229557150250240',      // Sushisock.com
  pixel: '1785935302094082',     // MATSTRUMPIRUMPIDUMPI
  link: LP,
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['AU'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  campaigns: [
    {
      campaignName: 'MATSTRUMP_SALES AU',   // befintlig CBO — ingen create
      adsets: [
        {
          name: 'au_broad_advplus_purchase_ugc_2',
          copy: COPY_UGC, link: LP,
          motifs: [
            { name: 'MATSTRUMP_AU_sushi_ugc_012_v1',      media: 'AU_012' },
            { name: 'MATSTRUMP_AU_sushi_ugc_012v2_v1',    media: 'AU_012v2' },
            { name: 'MATSTRUMP_AU_sushi_ugc_a013_v1',     media: 'AU_a013' },
            { name: 'MATSTRUMP_AU_sushi_ugc_a016_v1',     media: 'AU_a016' },
            { name: 'MATSTRUMP_AU_sushi_ugc_fable_h1_v1', media: 'AU_fable_h1 2' },
            { name: 'MATSTRUMP_AU_sushi_ugc_fable_h2_v1', media: 'AU_fable_h2 2' },
            { name: 'MATSTRUMP_AU_sushi_ugc_fable_h3_v1', media: 'AU_fable_h3' },
            { name: 'MATSTRUMP_AU_sushi_ugc_meet_v1',     media: 'AU_meet' },
          ],
        },
      ],
    },
  ],
};
