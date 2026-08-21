// SE Motorhöljet — ny CBO-kampanj 2026-08-20. Åtta videor, ETT adset.
//
// STRUKTUR enligt Axels uttryckliga instruktion: ny CBO-kampanj, 1000 kr/dag,
// ett enda adset med allting, ingen adsetbudget, inget minimum spend.
// Briefarna ber om separat ABO — Axels instruktion åsidosätter det medvetet
// den här gången ("håll inte på att kötta ABO ... ett ad set och bara köra in
// allting").
//
// COPY per annons ordagrant från respektive copy-card i Notions "Boat cover
// 420D creative hub" (alla åtta har status Approved):
//   PD_25_H1, PD_26_H1     → PD-cardet ("Gjord för större motorer")
//   SO_21_H1–H4            → SO-cardet ("299 kr istället för 367 kr")
//   SP_19_H3, SP_20_H1     → SP-cardet ("Skydd som sitter kvar, i alla väder")
// Varje brief varnar för att Ads Manager annars autofyller från preset — SP-
// presetens "Hundratals nöjda kunder" och SO-presetens vinterrubrik är bannade.
//
// MEDIA: SO_21-hookarna ligger bara som "_4x5"-filer i biblioteket (plus 9x16-
// och råvarianter). m.media pekar ut filen; annonsnamnet hålls rent.
// "Enginecover_PD_26_H1 3.4" och "SO_21_H1 3.4"/.mov-dubbletterna används inte.

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
const COPY_SP = {
  message: 'Din utombordare står ute i alla väder.\nSol bleker plasten. Salt och damm sätter sig i varje skarv.\nMotorhölje i 420D Oxfordtyg, vattenavvisande, med dragsko runt hela kanten.\nPå och av på några sekunder — ingen risk att glömma täcka den.\n30 dagars nöjd-kund-garanti.\nBeställ ditt motorhölje idag.',
  headline: 'Skydd som sitter kvar, i alla väder',
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
      campaignName: 'Motorhöljet CBO 2026-08-20',
      create: { objective: 'OUTCOME_SALES', status: 'ACTIVE', dailyBudget: '100000' }, // 1000 kr/dag CBO
      adsets: [
        {
          name: 'Motorhölje Batch 9 - Alla',
          link: LP,
          motifs: [
            { name: 'Enginecover_PD_25_H1', copy: COPY_PD },
            { name: 'Enginecover_PD_26_H1', copy: COPY_PD },
            { name: 'Enginecover_SO_21_H1', media: 'Enginecover_SO_21_H1_4x5', copy: COPY_SO },
            { name: 'Enginecover_SO_21_H2', media: 'Enginecover_SO_21_H2_4x5', copy: COPY_SO },
            { name: 'Enginecover_SO_21_H3', media: 'Enginecover_SO_21_H3_4x5', copy: COPY_SO },
            { name: 'Enginecover_SO_21_H4', media: 'Enginecover_SO_21_H4_4x5', copy: COPY_SO },
            { name: 'Enginecover_SP_19_H3', copy: COPY_SP },
            { name: 'Enginecover_SP_20_H1', copy: COPY_SP },
          ],
        },
      ],
    },
  ],
};
