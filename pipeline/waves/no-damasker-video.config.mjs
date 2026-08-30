// Kampanj: Gamasjer NO | BE-ROAS 1,64 | 2026-08-30 - morgonbatchen 2026-08-30 (rutinen /translate-no).
// Gamasjer Tur 309 kr (ordinær 515, höjt för 40 %-claim enligt prispolicyn). BE-ROAS 1,64 = 309/(309 - 11,09 EUR à 10,864).
// Norsk copy av copy-subagent (sonnet) 2026-08-30 (adcopy-no-3.json), verifierad mot beverbutikken.no.
// Axels beslut: launcha PÅ (allt ACTIVE), 1000 kr/dag CBO.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: "Gamasjer NO | BE-ROAS 1,64 | 2026-08-30",
  link: "https://beverbutikken.no/products/gamasjer-tur-holder-sno-vaete-grus-ute",
  dailyBudget: '100000',
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-08-29/final/damasker',
  adsets: [
    {
      name: "Gamasjer NO - PD",
      copy: {
        message: "Lei av snø, væte og grus i skoene? 🥾\n✅ Holder snøen ute – hele turen\n✅ Stopper regn og våt mark\n✅ Beskytter mot grus, leire og stein\n✅ På med dem på 10 sekunder\nKlikk og bestill dine i dag 👉",
        headline: "Gå tørrskodd – uansett vær",
        description: "Gamasjer som holder snø, væte og grus ute.",
      },
      ads: [
        { name: "Gamasjer_NO_PD_1", file: "NO_damasker_PD_1.mp4" },
        { name: "Gamasjer_NO_PD_2", file: "NO_damasker_PD_2.mp4" },
        { name: "Gamasjer_NO_PD_3", file: "NO_damasker_PD_3.mp4" },
      ],
    },
    {
      name: "Gamasjer NO - SP",
      copy: {
        message: "«Helt tørre sokker – selv i regn og leire» 👍\n✅ Elsket av tusenvis av turgåere\n✅ Holder tett hele dagen\n✅ Enkle å ta på og av\n✅ 30 dagers åpent kjøp\nSe hvorfor kundene ikke kan slutte å snakke om dem 👉",
        headline: "Kundene elsker tørre føtter",
        description: "Bekreftede kunder – tørre sko, hver gang.",
      },
      ads: [
        { name: "Gamasjer_NO_SP_1", file: "NO_damasker_SP_1.mp4" },
        { name: "Gamasjer_NO_SP_2", file: "NO_damasker_SP_2.mp4" },
        { name: "Gamasjer_NO_SP_3", file: "NO_damasker_SP_3.mp4" },
      ],
    },
    {
      name: "Gamasjer NO - CS",
      copy: {
        message: "⚡ 40 % rabatt – så lenge lageret rekker ⚡\nPrisen gjelder ikke for alltid – snart er den borte.\n✅ Fri frakt over 300 kr\n✅ 30 dagers åpent kjøp\n✅ Lageret krymper – bare noen få igjen\nIkke gå glipp av sjansen. Bestill nå før det er utsolgt 👉",
        headline: "40 % rabatt – så lenge lageret rekker",
        description: "Salget avsluttes snart – få igjen på lager.",
      },
      ads: [
        { name: "Gamasjer_NO_CS_1", file: "NO_damasker_CS_1.mp4" },
        { name: "Gamasjer_NO_CS_2", file: "NO_damasker_CS_2.mp4" },
        { name: "Gamasjer_NO_CS_3", file: "NO_damasker_CS_3.mp4" },
      ],
    },
    {
      name: "Gamasjer NO - G",
      copy: {
        message: "Endelig fant jeg den perfekte gaven til ham 🎁\nHan som alltid er ute – tur, hund, skog, natur.\n✅ En gave han faktisk bruker\n✅ Enkel, praktisk, verdsatt\n✅ Perfekt til jul, bursdag eller bare «en tanke»\nSe ansiktet hans når han åpner pakken 👉",
        headline: "Gaven han faktisk bruker",
        description: "Den perfekte gaven til ham som elsker naturen.",
      },
      ads: [
        { name: "Gamasjer_NO_G_1", file: "NO_damasker_G_1.mp4" },
        { name: "Gamasjer_NO_G_2", file: "NO_damasker_G_2.mp4" },
        { name: "Gamasjer_NO_G_3", file: "NO_damasker_G_3.mp4" },
      ],
    }
  ],
};
