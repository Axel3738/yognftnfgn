// SE Matstrumpor — 20 nya UGC-videor i eget adset i MATSTRUMP_SALES_20260826, 2026-09-02.
//
// Samma uppsättning som kampanjens övriga adsets: sidan Matstrumpor.se, svenska
// produktsidan, kontots pixel, SE-targeting 18–65 med Advantage audience,
// DSA STonebite, kampanjens delade svenska UGC-copy. Ingen adsetbudget.
//
// "H2.mov" finns i två versioner i biblioteket: 30 aug (44,6 s, kör redan som
// MATSTRUMP_sushi_gift_ugc_h2_v1) och 2 sep (46,0 s). Dagens pekas ut via
// mediaId (1008061968947645) och namnges 019h2 — längden matchar 019 H1/H3-familjen
// och 019 saknar just H2 i uppladdningen. Byt namn om det är fel.

const LP = 'https://matstrumpor.se/products/sushi-strumpor';

const COPY_UGC = {
  message: 'Ingen jublar åt tvättmedel. Ingen sparar en skämtpryl.\nSvaret på båda: en låda som ser ut som riktig takeaway, 5 par rullade som maki, ätpinnar i trä bredvid.\nDen ligger inte kvar i lådan efteråt – den ligger på fötterna, vecka efter vecka.',
  headline: 'Rolig i kväll. På fötterna i morgon.',
  description: '4 sorter. Köp 1, få 1. Fri frakt i Sverige.',
  cta: 'SHOP_NOW', link: LP,
};

export default {
  act: 'act_730973156224390',    // nya kungen (Matstrumpor.se, SEK)
  page: '820358954504320',       // Matstrumpor.se
  pixel: '1785935302094082',
  link: LP,
  dsaBeneficiary: 'STonebite',
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['SE'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  campaigns: [
    {
      campaignName: 'MATSTRUMP_SALES_20260826',   // befintlig CBO — ingen create
      adsets: [
        {
          name: 'broad_advplus_purchase_nya20',
          copy: COPY_UGC, link: LP,
          motifs: [
            { name: 'MATSTRUMP_sushi_gift_ugc_s005h1_v1',  media: '005 HOOK 1' },
            { name: 'MATSTRUMP_sushi_gift_ugc_s005h2_v1',  media: '005 HOOK 2' },
            { name: 'MATSTRUMP_sushi_gift_ugc_s005h3_v1',  media: '005 HOOK 3' },
            { name: 'MATSTRUMP_sushi_gift_ugc_010v2_v1',   media: '010v2' },
            { name: 'MATSTRUMP_sushi_gift_ugc_011v2_v1',   media: '011v2' },
            { name: 'MATSTRUMP_sushi_gift_ugc_017v1h1_v1', media: '017v1 HOOK 1' },
            { name: 'MATSTRUMP_sushi_gift_ugc_017v1h2_v1', media: '017v1 HOOK 2' },
            { name: 'MATSTRUMP_sushi_gift_ugc_017v1h3_v1', media: '017v1 HOOK 3' },
            { name: 'MATSTRUMP_sushi_gift_ugc_017v2h1_v1', media: '017 v2 H1' },
            { name: 'MATSTRUMP_sushi_gift_ugc_017v2h2_v1', media: '017 v2 H2' },
            { name: 'MATSTRUMP_sushi_gift_ugc_017v2h3_v1', media: '017 v2 H3' },
            { name: 'MATSTRUMP_sushi_gift_ugc_019h1_v1',   media: '019 H1' },
            { name: 'MATSTRUMP_sushi_gift_ugc_019h2_v1',   mediaId: '1008061968947645' },
            { name: 'MATSTRUMP_sushi_gift_ugc_019h3_v1',   media: '019H3' },
            { name: 'MATSTRUMP_sushi_gift_ugc_020h1_v1',   media: '20 H1' },
            { name: 'MATSTRUMP_sushi_gift_ugc_020h2_v1',   media: '20 H2' },
            { name: 'MATSTRUMP_sushi_gift_ugc_020h3_v1',   media: '20 H3' },
            { name: 'MATSTRUMP_sushi_gift_ugc_021h1_v1',   media: '021 HOOK 1' },
            { name: 'MATSTRUMP_sushi_gift_ugc_021h2_v1',   media: '021 HOOK 2' },
            { name: 'MATSTRUMP_sushi_gift_ugc_021h3_v1',   media: '021 HOOK 3' },
          ],
        },
      ],
    },
  ],
};
