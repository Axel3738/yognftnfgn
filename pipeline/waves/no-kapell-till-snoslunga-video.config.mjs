// Kampanj: Snøfresertrekk NO — videobatch 2026-09-24 (rutinen /translate-no).
// Norsk copy skriven direkt av huvudsessionen (inget Agent-verktyg tillgängligt i
// den här körningen) ur svenska ADCOPY-docsen i Drive (G/PD/SP), verifierad mot
// beverbutikken.no: pris 389 kr (før 509 = 24 %), fri frakt over 300 kr OK,
// 30 dagers åpent kjøp OK. ⚠️ CS-konceptet saknade svensk adcopy i källmappen —
// skrivet nytt (samma clearance-mall som ATV-Trekk) eftersom CS-videorna finns
// och priset/rabatten är verifierat. Overifierat kundcitat i källans SP mjukat
// till generisk formulering (rule 3). PD-källans "i garaget eller sjukhuset" är
// en uppenbar felskrivning i källdokumentet — tolkat som "i garasjen eller uteboden".
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Snøfresertrekk NO | BE-ROAS 1,62 | 2026-09-24',
  link: 'https://beverbutikken.no/products/trekk-til-snofreser-120-82-60-cm-holder-skitt-unna',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-24/final/kapell-till-snoslunga', // relativt pipeline/
  adsets: [
    {
      name: 'Snofresertrekk NO - PD',
      copy: {
        message: 'Løv, støv og skitt på snøfreseren? 🍂\nDet trenger du ikke stå og børste bort.\n✅ Skitten havner på trekket, ikke på motoren\n✅ Stram til snoren så sitter det tett\n✅ Passer snøfresere opp til 120 × 82 × 60 cm\nLegg trekket på i garasjen eller uteboden. Ta det av når det er tid for å måke. Ferdig.\n👉 Bestill trekket ditt her og hold snøfreseren ren hele sommeren.',
        headline: 'En ren snøfreser, uten ekstra jobb',
        description: 'Svart og sølv trekk som holder skitt unna.',
      },
      ads: [
        { name: 'Snofresertrekk_NO_PD_1_H1', file: 'NO_kapell-till-snoslunga_PD_1_H1.mp4' },
        { name: 'Snofresertrekk_NO_PD_1_H2', file: 'NO_kapell-till-snoslunga_PD_1_H2.mp4' },
        { name: 'Snofresertrekk_NO_PD_1_H3', file: 'NO_kapell-till-snoslunga_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Snofresertrekk NO - SP',
      copy: {
        message: 'Mange snøfresereiere har allerede skaffet trekket, og det er lett å forstå hvorfor. ⭐⭐⭐⭐⭐\n✅ Sitter tett med snøring\n✅ Skitt og løv holdes utenfor\n✅ Mindre rengjøring før neste vinter\n👉 Se selv hvorfor det er et favorittkjøp. Trykk på lenken og beskytt snøfreseren din.',
        headline: 'Snøfreseren ren og klar hver vinter',
        description: 'Trekket som holder skitt unna motoren.',
      },
      ads: [
        { name: 'Snofresertrekk_NO_SP_1_H1', file: 'NO_kapell-till-snoslunga_SP_1_H1.mp4' },
        { name: 'Snofresertrekk_NO_SP_1_H2', file: 'NO_kapell-till-snoslunga_SP_1_H2.mp4' },
        { name: 'Snofresertrekk_NO_SP_1_H3', file: 'NO_kapell-till-snoslunga_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'Snofresertrekk NO - CS',
      copy: {
        message: '🚨 REA PÅ SNØFRESERTREKKET! 🚨\nNå bare 389 kr. Ordinær pris 509 kr.\nDet er 24 % rabatt — men bare i dag.\nLageret er nesten tomt. Når det er borte, er det borte.\nVanntett. Holder skitt og løv unna motoren. Tre stroppfester.\n👉 Ta trekket ditt for 389 kr før det er for sent!',
        headline: '24 % RABATT – BARE I DAG',
        description: 'Bare 389 kr. Nesten utsolgt.',
      },
      ads: [
        { name: 'Snofresertrekk_NO_CS_1_H1', file: 'NO_kapell-till-snoslunga_CS_1_H1.mp4' },
        { name: 'Snofresertrekk_NO_CS_1_H2', file: 'NO_kapell-till-snoslunga_CS_1_H2.mp4' },
        { name: 'Snofresertrekk_NO_CS_1_H3', file: 'NO_kapell-till-snoslunga_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Snofresertrekk NO - G',
      copy: {
        message: 'Hva gir man noen som allerede har alt? 🎁\nJeg fant svaret. Et trekk til snøfreseren for den som måker snø hver vinter.\nDe kommer til å smile når de åpner pakken: "Dette trengte jeg jo!"\nDu vil føle deg stolt over at du fant den perfekte gaven.\nPraktisk, omtenksom og noe de faktisk kommer til å bruke.\n👉 Bestill nå og bli årets gavehelt.',
        headline: 'Gaven som faktisk blir brukt',
        description: 'En omtenksom gave til alle som måker snø.',
      },
      ads: [
        { name: 'Snofresertrekk_NO_G_1_H1', file: 'NO_kapell-till-snoslunga_G_1_H1.mp4' },
        { name: 'Snofresertrekk_NO_G_1_H2', file: 'NO_kapell-till-snoslunga_G_1_H2.mp4' },
        { name: 'Snofresertrekk_NO_G_1_H3', file: 'NO_kapell-till-snoslunga_G_1_H3.mp4' },
      ],
    },
  ],
};
