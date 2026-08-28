// US Matstrumpor — "nya kungen" (act_730973156224390), 2026-08-28.
//
// Spegel av den svenska flaggskeppskampanjen MATSTRUMP_SALES_20260826:
// tre adsets (statics + två UGC-videoset), samma struktur, EN-media,
// all copy översatt till engelska. En CBO på 1000 kr/dag, ALLT PAUSAT
// enligt instruktion. Targeting: USA. Pixel: kontots enda
// (MATSTRUMPIRUMPIDUMPI, 1785935302094082).
//
// ÖVERSÄTTNINGSPRINCIPER:
//   · Trogen översättning av varje svensk annons text, rubrik och beskrivning.
//   · "Fri frakt i Sverige" är struket ur alla beskrivningar — påståendet är
//     inte verifierat för USA-ordrar.
//   · "Onesize 36–44" återges som "One size EU 36–44" så måttet inte läses
//     som US-storlek.
//   · Prisannonsen (b003) behåller 399 kr eftersom butiken prissätter i SEK.
//     Se varningen nedan.
//
// ⚠️ INNAN AKTIVERING:
//   1. LÖST 2026-08-28: annonserna pekar nu på sushisock.com (engelsk butik,
//      USD) och kör sidan Sushisock.com. Omkopplat på alla 49 annonser via API.
//   2. Prisannonsen säger "399 kr" — kolla att butiken visar rimlig valuta för
//      US-besökare innan den får spend.
//   3. EN_s008h1 finns inte i biblioteket (h2/h3 finns) — den svenska
//      motsvarigheten hoppas över tills filen laddas upp.
//
// Extramaterial i biblioteket som svenska kampanjen INTE kör (hjartius a/b,
// balansen, femanledningar, pask, asmr5050) är avsiktligt utelämnat ur spegeln.

const LP = 'https://sushisock.com/products/sushi-socks';   // engelska butiken (USD)

// Delad UGC-copy — översättning av "Ingen jublar åt tvättmedel..."
const COPY_UGC = {
  message: 'Nobody cheers for laundry detergent. Nobody keeps a gag gift.\nThe answer to both: a box that looks like real takeaway, 5 pairs rolled like maki, wooden chopsticks on the side.\nIt doesn\'t stay in the box afterwards — it stays on your feet, week after week.',
  headline: 'Funny tonight. On your feet tomorrow.',
  description: '4 designs. Buy 1, get 1.',
  cta: 'SHOP_NOW', link: LP,
};

const ad = (name, media, copy) => ({ name, media, copy: { ...copy, cta: 'SHOP_NOW', link: LP } });

export default {
  act: 'act_730973156224390',    // nya kungen (Matstrumpor.se, SEK)
  page: '1229557150250240',      // Sushisock.com
  pixel: '1785935302094082',     // MATSTRUMPIRUMPIDUMPI
  link: LP,
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['US'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaigns: [
    {
      campaignName: 'MATSTRUMP_SALES_US_20260828',
      create: { objective: 'OUTCOME_SALES', status: 'PAUSED', dailyBudget: '100000' }, // 1000 kr/dag CBO
      adsets: [
        {
          name: 'us_broad_advplus_purchase_bilder',
          link: LP,
          motifs: [
            ad('MATSTRUMP_US_sushi_skamt_static_c_v1', 'C-sushi-socks-EN', {
              message: 'Sushi restaurants close for the night.\nThis box stays open.\nFive pairs of sushi socks, rolled like maki.\nOrder whenever you like. One size EU 36–44.',
              headline: 'Shop after the restaurant closes',
              description: 'Five pairs of sushi socks, rolled like maki, in a box that looks like takeaway. One size EU 36–44, wooden chopsticks included.' }),

            ad('MATSTRUMP_US_sushi_offer_static_d1_v1', 'D1-two-boxes-bogo-EN', {
              message: 'You don\'t have to choose between giving and keeping.\nBuy 1 — get 1 free: one box to give, one to keep.\nFive pairs of sushi socks per box, rolled like maki.\nOne size EU 36–44.',
              headline: 'Buy 1, get 1 free — one for you',
              description: 'Buy 1, get 1 free: one box to give away, one to keep. Five pairs of sushi socks per box, rolled like maki, one size EU 36–44.' }),

            ad('MATSTRUMP_US_sushi_gift_static_b001_v1', 'B001-no-text', {
              message: 'The person who says: "Don\'t get me anything."\nGet them this anyway.\nSushi socks, five pairs in the box. Wooden chopsticks included.\nOne size EU 36–44.',
              headline: 'Socks disguised as sushi',
              description: 'Sushi socks in a box that looks like takeaway. Five pairs, wooden chopsticks, one size EU 36–44.' }),

            ad('MATSTRUMP_US_sushi_position_static_f_v1', 'F-dustcollector-reaction-EN', {
              message: 'Most gifts get one laugh — at the unwrapping.\nThis one gets the laugh, then gets worn every day.\nFive pairs of sushi socks, rolled like maki.\nOne size EU 36–44.',
              headline: 'A laugh when opened, worn every day',
              description: 'Sushi socks in a box that looks like takeaway. Five pairs, rolled like maki, wooden chopsticks included. One size EU 36–44.' }),

            ad('MATSTRUMP_US_sushi_anvandning_static_b002_v1', 'b002-no-text', {
              message: 'Five pairs in the box.\nNot a gadget you display once and forget.\nSocks you put on again tomorrow, and the day after.\nOne size EU 36–44.',
              headline: 'Sushi socks you\'ll wear again tomorrow',
              description: 'Sushi socks in a box that looks like takeaway sushi. Five pairs in one size EU 36–44, wooden chopsticks in the box.' }),

            ad('MATSTRUMP_US_sushi_offer_static_d2_v1', 'D2-feet-box-bogo-EN', {
              message: 'The box is the joke.\nTen pairs of socks are what you actually get.\nBuy 1 — get 1 free. Five pairs per box, rolled like maki.\nOne size EU 36–44.',
              headline: 'Buy 1, get 1 free — ten pairs total',
              description: 'Buy 1, get 1 free: two boxes, ten pairs of sushi socks total, rolled like maki. One size EU 36–44, wooden chopsticks in every box.' }),

            ad('MATSTRUMP_US_sushi_vandning_static_b005_v1', 'b005-no-text', {
              message: 'Count the pieces in the box.\nAll of them are socks. None of them are sushi.\nFive pairs, rolled like maki. Wooden chopsticks included.\nOne size EU 36–44.',
              headline: 'Count the pieces. None are sushi.',
              description: 'The sushi box from above — every piece is a sock, not food. Five pairs, rolled like maki, one size EU 36–44. Wooden chopsticks included.' }),

            // ⚠️ SEK-pris — se varning i filhuvudet
            ad('MATSTRUMP_US_sushi_pris_static_b003_v1', 'b003-no-text', {
              message: '399 kr. Five pairs in the box.\nUnder 80 kr per pair — the chopsticks thrown in.\nA gift and everyday socks in the same box.\nOne size EU 36–44.',
              headline: 'Five pairs for 399 kr — chopsticks included',
              description: '399 kr for five pairs of sushi socks in one size EU 36–44, wooden chopsticks included. Under 80 kr per pair.' }),

            ad('MATSTRUMP_US_sushi_offer_static_d4_v1', 'D4-floating-box-bogo-EN', {
              message: 'One box in the picture.\nTwo arrive at your door.\nBuy 1 — get 1 free. Ten pairs of sushi socks total, rolled like maki.\nOne size EU 36–44.',
              headline: 'Buy 1, get 1 free. Ten pairs land at home.',
              description: 'Buy 1, get 1 free: two boxes, ten pairs of sushi socks total, rolled like maki. Wooden chopsticks included. One size EU 36–44.' }),

            ad('MATSTRUMP_US_sushi_offer_static_d3_v1', 'D3-stacked-boxes-bogo-EN', {
              message: 'Four boxes on the table.\nBuy 2 — get 2 free, twenty pairs of socks total.\nRolled like maki, wooden chopsticks in every box.\nOne size EU 36–44.',
              headline: 'Buy 2, get 2 free — four boxes',
              description: 'Buy 2, get 2 free: four boxes, twenty pairs of sushi socks total, rolled like maki. Wooden chopsticks in every box. One size EU 36–44.' }),

            ad('MATSTRUMP_US_sushi_vandning_static_b004_v1', 'b004-no-text', {
              message: 'The chopsticks are ready.\nStill nothing to eat.\nFive pairs of sushi socks, rolled like maki, in a box that looks like takeaway.\nOne size EU 36–44.',
              headline: 'Chopsticks ready. Nothing to eat.',
              description: 'A box that looks like takeaway sushi. Open it and find five pairs of socks, rolled like maki, plus wooden chopsticks. One size EU 36–44.' }),
          ],
        },
        {
          // ALLA videor i ett adset enligt Axels instruktion 2026-08-28
          // (ersätter de tidigare ugc_1/ugc_2-speglarna, raderade före omkörning).
          // Inkluderar även de sex som svenska kampanjen inte kör:
          // hjartius_a/b, balansen, femanledningar, pask, asmr5050.
          // EN_s008h1 finns fortfarande inte i biblioteket.
          name: 'us_broad_advplus_purchase_ugc',
          copy: COPY_UGC, link: LP,
          motifs: [
            { name: 'MATSTRUMP_US_sushi_ugc_november_v1', media: 'EN_november' },
            { name: 'MATSTRUMP_US_sushi_ugc_somneth1_v1', media: 'EN_somneth1' },
            { name: 'MATSTRUMP_US_sushi_ugc_somneth2_v1', media: 'EN_somneth2' },
            { name: 'MATSTRUMP_US_sushi_ugc_somneth3_v1', media: 'EN_somneth3' },
            { name: 'MATSTRUMP_US_sushi_ugc_haikuh1_v1', media: 'EN_haikuh1' },
            { name: 'MATSTRUMP_US_sushi_ugc_haikuh2_v1', media: 'EN_haikuh2' },
            { name: 'MATSTRUMP_US_sushi_ugc_haikuh3_v1', media: 'EN_haikuh3' },
            { name: 'MATSTRUMP_US_sushi_ugc_s009h1_v1', media: 'EN_s009h1' },
            { name: 'MATSTRUMP_US_sushi_ugc_s009h2_v1', media: 'EN_s009h2' },
            { name: 'MATSTRUMP_US_sushi_ugc_s009h3_v1', media: 'EN_s009h3' },
            { name: 'MATSTRUMP_US_sushi_ugc_trodde_v1', media: 'EN_trodde' },
            { name: 'MATSTRUMP_US_sushi_ugc_s008h2_v1', media: 'EN_s008h2' },
            { name: 'MATSTRUMP_US_sushi_ugc_s008h3_v1', media: 'EN_s008h3' },
            { name: 'MATSTRUMP_US_sushi_ugc_julstrumpa_v1', media: 'EN_julstrumpa' },
            { name: 'MATSTRUMP_US_sushi_ugc_opush1_v1', media: 'EN_opush1' },
            { name: 'MATSTRUMP_US_sushi_ugc_s001h1_v1', media: 'EN_s001h1' },
            { name: 'MATSTRUMP_US_sushi_ugc_s002h1_v1', media: 'EN_s002h1' },
            { name: 'MATSTRUMP_US_sushi_ugc_s002h2_v1', media: 'EN_s002h2' },
            { name: 'MATSTRUMP_US_sushi_ugc_s002h3_v1', media: 'EN_s002h3' },
            { name: 'MATSTRUMP_US_sushi_ugc_s003h1_v1', media: 'EN_s003h1' },
            { name: 'MATSTRUMP_US_sushi_ugc_s003h2_v1', media: 'EN_s003h2' },
            { name: 'MATSTRUMP_US_sushi_ugc_s003h3_v1', media: 'EN_s003h3' },
            { name: 'MATSTRUMP_US_sushi_ugc_s004h1_v1', media: 'EN_s004h1' },
            { name: 'MATSTRUMP_US_sushi_ugc_s004h2_v1', media: 'EN_s004h2' },
            { name: 'MATSTRUMP_US_sushi_ugc_s004h3_v1', media: 'EN_s004h3' },
            { name: 'MATSTRUMP_US_sushi_ugc_s004h4_v1', media: 'EN_s004h4' },
            { name: 'MATSTRUMP_US_sushi_ugc_s006h1_v1', media: 'EN_s006h1' },
            { name: 'MATSTRUMP_US_sushi_ugc_s006h2_v1', media: 'EN_s006h2' },
            { name: 'MATSTRUMP_US_sushi_ugc_s006h3_v1', media: 'EN_s006h3' },
            { name: 'MATSTRUMP_US_sushi_ugc_s007h1_v1', media: 'EN_s007h1' },
            { name: 'MATSTRUMP_US_sushi_ugc_s007h2_v1', media: 'EN_s007h2' },
            { name: 'MATSTRUMP_US_sushi_ugc_s007h3_v1', media: 'EN_s007h3' },
            { name: 'MATSTRUMP_US_sushi_ugc_hjartius_a_v1', media: 'EN_hjartius_a' },
            { name: 'MATSTRUMP_US_sushi_ugc_hjartius_b_v1', media: 'EN_hjartius_b' },
            { name: 'MATSTRUMP_US_sushi_ugc_balansen_v1', media: 'EN_balansen' },
            { name: 'MATSTRUMP_US_sushi_ugc_femanledningar_v1', media: 'EN_femanledningar' },
            { name: 'MATSTRUMP_US_sushi_ugc_pask_v1', media: 'EN_pask' },
            { name: 'MATSTRUMP_US_sushi_ugc_asmr5050_v1', media: 'EN_asmr5050' },
          ],
        },
      ],
    },
  ],
};
