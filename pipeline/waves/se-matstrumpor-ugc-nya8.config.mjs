// SE Matstrumpor — nytt UGC-adset i MATSTRUMP_SALES_20260826, 2026-08-30.
//
// Åtta nya svenska videor (samma motiv som AU-batchen, svenska original).
// Biblioteksfilerna har rena namn — 012, 012v2, 013, 016, H1, H2, H3 och
// "Meet Matstrumpor" — så media-övertaget ger annonserna kontots namnmönster.
//
// Inställningar lästa ur kampanjens befintliga adsets: sidan Matstrumpor.se,
// svenska produktsidan, kontots pixel, SE-targeting 18–65 med Advantage
// audience, DSA STonebite och kampanjens delade svenska UGC-copy.
// Ingen adsetbudget — kampanjens CBO fördelar. Kampanjen är ACTIVE, så det
// nya adsetet byggs aktivt i linje med de tre befintliga.

const LP = 'https://matstrumpor.se/products/sushi-strumpor';

// Kampanjens delade UGC-copy, ordagrant ur befintliga annonser
const COPY_UGC = {
  message: 'Ingen jublar åt tvättmedel. Ingen sparar en skämtpryl.\nSvaret på båda: en låda som ser ut som riktig takeaway, 5 par rullade som maki, ätpinnar i trä bredvid.\nDen ligger inte kvar i lådan efteråt – den ligger på fötterna, vecka efter vecka.',
  headline: 'Rolig i kväll. På fötterna i morgon.',
  description: '4 sorter. Köp 1, få 1. Fri frakt i Sverige.',
  cta: 'SHOP_NOW', link: LP,
};

export default {
  act: 'act_730973156224390',    // nya kungen (Matstrumpor.se, SEK)
  page: '820358954504320',       // Matstrumpor.se
  pixel: '1785935302094082',     // MATSTRUMPIRUMPIDUMPI
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
          name: 'broad_advplus_purchase_nya8',
          copy: COPY_UGC, link: LP,
          motifs: [
            { name: 'MATSTRUMP_sushi_gift_ugc_012_v1',   media: '012' },
            { name: 'MATSTRUMP_sushi_gift_ugc_012v2_v1', media: '012v2' },
            { name: 'MATSTRUMP_sushi_gift_ugc_013_v1',   media: '013' },
            { name: 'MATSTRUMP_sushi_gift_ugc_016_v1',   media: '016' },
            { name: 'MATSTRUMP_sushi_gift_ugc_h1_v1',    media: 'H1' },
            { name: 'MATSTRUMP_sushi_gift_ugc_h2_v1',    media: 'H2' },
            { name: 'MATSTRUMP_sushi_gift_ugc_h3_v1',    media: 'H3' },
            { name: 'MATSTRUMP_sushi_gift_ugc_meet_v1',  media: 'Meet Matstrumpor' },
          ],
        },
      ],
    },
  ],
};
