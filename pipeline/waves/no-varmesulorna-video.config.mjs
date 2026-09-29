// Kampanj: Varmesåler NO — videobatch 2026-09-29 (rutinen /translate-no, ElevenLabs-rösten).
// Norsk copy av sonnet (claude-sonnet-5 via API — Agent-verktyget fanns inte i körningen) ur
// svenska ADCOPY-docsen i Drive, verifierad mot beverbutikken.no: 799 kr (før 1039 = 23 %),
// 3 varmenivåer, fjernkontroll, 30 dagers åpent kjøp. Borttaget ur källan (ej belagt):
// "bara idag", "få kvar i lager", kundcitat med stjärnor, "tusentals svenskar"; 24 % → 23 %.
// COGS: batch-sheet #12, NORWAY Qty 1 = 28,51 EUR × 10,8367 = 308,95 NOK ⇒ BE-ROAS 1,63.
// Axels beslut 2026-08-29: allt ACTIVE, 1000 kr/dag CBO.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Varmesåler NO | BE-ROAS 1,63 | 2026-09-29',
  link: 'https://beverbutikken.no/products/varmesaler-med-fjernkontroll-varme-fotter-pa-jaktposten',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-29/varmesulorna/final', // relativt pipeline/
  adsets: [
    {
      name: 'Varmesaler NO - PD',
      copy: {
        message: "Kalde føtter ødelegger hele dagen. 🥶\nIkke lenger.\nVarmesåler med fjernkontroll gir deg varme føtter — direkte, uten å ta av skoene.\n✅ Tre varmenivåer\n✅ Opptil 8 timers varme\n✅ Styr alt med fjernkontrollen\nPerfekt for skibakken, jobben eller kampen på søndag.\n👉 Trykk på knappen under.",
        headline: "Varme føtter — hele dagen",
        description: "Lad, legg i skoene, trykk på knappen.",
      },
      ads: [
        { name: 'Varmesaler_NO_PD_1_H1', file: 'NO_varmesulorna_PD_1_H1.mp4' },
        { name: 'Varmesaler_NO_PD_1_H2', file: 'NO_varmesulorna_PD_1_H2.mp4' },
        { name: 'Varmesaler_NO_PD_1_H3', file: 'NO_varmesulorna_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Varmesaler NO - SP',
      copy: {
        message: "Varmesåler med tre varmenivåer og fjernkontroll.\n799 kr (før 1039 kr) – spar 23 %.\n✅ Enkelt å bruke\n✅ Holder varmen i timevis\n✅ 30 dagers åpent kjøp\nSlutt å fryse på føttene. 🔥\n👉 Trykk på knappen under.",
        headline: "799 kr – varme hele dagen",
        description: "30 dagers åpent kjøp. Spar 23 %.",
      },
      ads: [
        { name: 'Varmesaler_NO_SP_1_H1', file: 'NO_varmesulorna_SP_1_H1.mp4' },
        { name: 'Varmesaler_NO_SP_1_H2', file: 'NO_varmesulorna_SP_1_H2.mp4' },
        { name: 'Varmesaler_NO_SP_1_H3', file: 'NO_varmesulorna_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'Varmesaler NO - CS',
      copy: {
        message: "⚡ 23 % RABATT ⚡\nVarmesåler med fjernkontroll — nå 799 kr (før 1039 kr).\n🔥 Spar 240 kr\n🔥 Tre varmenivåer\n🔥 30 dagers åpent kjøp\n👉 Trykk på knappen under.",
        headline: "799 kr – spar 23 %",
        description: "Før 1039 kr, nå 799 kr. Spar 240 kr.",
      },
      ads: [
        { name: 'Varmesaler_NO_CS_1_H1', file: 'NO_varmesulorna_CS_1_H1.mp4' },
        { name: 'Varmesaler_NO_CS_1_H2', file: 'NO_varmesulorna_CS_1_H2.mp4' },
        { name: 'Varmesaler_NO_CS_1_H3', file: 'NO_varmesulorna_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Varmesaler NO - G',
      copy: {
        message: "Han fryser på føttene hver vinter. Han klager aldri — men jeg ser det. 🥹\nI år fant jeg endelig den perfekte julegaven.\n✅ Noe han faktisk trenger\n✅ Enkelt å forstå — og å elske\n✅ Gaven han ikke visste han ville ha\nSe ansiktet hans når han åpner den. 🎁\n👉 Trykk på knappen under.",
        headline: "Gaven han faktisk trenger",
        description: "En julegave han bruker igjen og igjen.",
      },
      ads: [
        { name: 'Varmesaler_NO_G_1_H1', file: 'NO_varmesulorna_G_1_H1.mp4' },
        { name: 'Varmesaler_NO_G_1_H2', file: 'NO_varmesulorna_G_1_H2.mp4' },
        { name: 'Varmesaler_NO_G_1_H3', file: 'NO_varmesulorna_G_1_H3.mp4' },
      ],
    },
  ],
};
