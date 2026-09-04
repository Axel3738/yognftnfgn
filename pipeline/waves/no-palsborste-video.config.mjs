// Kampanj: Pelsbørste til Dyson-støvsuger NO — videobatch 2026-09-04 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-04 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 479 kr (før 623 kr = 23 %, matchar originalets claim
// rakt av). Inget butiksnamn nämns i copyn (matchar det svenska originalet).
// BE-ROAS 1,64 = 479/(479 − 17,30 EUR à 10,799272 NOK/EUR = 186,83 kr COGS, batch-sheet #5.1).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Pelsbørste NO | BE-ROAS 1,64 | 2026-09-04',
  link: 'https://beverbutikken.no/products/pelsborste-til-dyson-stovsuger-borst-og-sug-i-samme-bevegelse',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-04/final/palsborste', // relativt pipeline/
  adsets: [
    {
      name: 'Pelsbørste NO - CS',
      copy: {
        message: 'KUN I DAG: 23 % RABATT 🔥\n623 kr → 479 kr\nLageret minker raskt, og prisen går opp igjen i morgen.\n✅ Spar 144 kr – kun i dag\n✅ Mest populære produkt akkurat nå\n✅ Få igjen på lager\nIkke gå glipp av sjansen – bestill før den er utsolgt. ⏰',
        headline: 'Børst uten å fylle hjemmet med pels',
        description: '23 % rabatt i dag – begrenset lager.',
      },
      ads: [
        { name: 'Pelsbørste_NO_CS_1', file: 'NO_palsborste_CS_1.mp4' },
        { name: 'Pelsbørste_NO_CS_2', file: 'NO_palsborste_CS_2.mp4' },
        { name: 'Pelsbørste_NO_CS_3', file: 'NO_palsborste_CS_3.mp4' },
      ],
    },
    {
      name: 'Pelsbørste NO - G',
      copy: {
        message: 'Jeg visste med en gang at jeg hadde funnet den perfekte gaven. 🎁\nHan elsker hunden sin, men klager alltid over pelsen – så jeg overrasket ham med denne.\n✅ Et smil jeg ikke glemmer\n✅ En gave han faktisk bruker hver dag\n✅ Enkel å pakke inn, umulig å ikke like\nGi bort gleden av et renere hjem – han kommer til å takke deg hver gang han børster hunden. 🐾',
        headline: 'Den perfekte gaven til ham',
        description: 'Se ansiktet hans når pelsen forsvinner.',
      },
      ads: [
        { name: 'Pelsbørste_NO_G_1', file: 'NO_palsborste_G_1.mp4' },
        { name: 'Pelsbørste_NO_G_2', file: 'NO_palsborste_G_2.mp4' },
        { name: 'Pelsbørste_NO_G_3', file: 'NO_palsborste_G_3.mp4' },
      ],
    },
    {
      name: 'Pelsbørste NO - PD',
      copy: {
        message: 'Pelsen ligger overalt igjen? 😩\nVi har løsningen for deg som er lei av å støvsuge etter hver børsting.\n✅ Børst og sug opp pelsen i samme bevegelse\n✅ Klikker rett på din Dyson\n✅ Fungerer i sofaen, bilen og på hunden eller katten din\n✅ Ikke mer pels som flyr rundt i hjemmet\nBestill pelsbørsten din i dag og gjør børstingen til én enkel ting. 🐾',
        headline: 'Børst uten å fylle hjemmet med pels',
        description: 'Fest på Dysonen din – klar på sekunder.',
      },
      ads: [
        { name: 'Pelsbørste_NO_PD_1', file: 'NO_palsborste_PD_1.mp4' },
        { name: 'Pelsbørste_NO_PD_2', file: 'NO_palsborste_PD_2.mp4' },
        { name: 'Pelsbørste_NO_PD_3', file: 'NO_palsborste_PD_3.mp4' },
      ],
    },
    {
      name: 'Pelsbørste NO - SP',
      copy: {
        message: '"Endelig slipper jeg å støvsuge etter hver børsting!" ⭐⭐⭐⭐⭐\nTusenvis av hundeeiere i Norge har allerede byttet til Pelsbørsten.\n✅ Enkel å feste på din Dyson\n✅ Suger opp pelsen med en gang – ingen mer rot\n✅ Elsket av både hunde- og katteeiere\n✅ 30 dagers fornøyd-kunde-garanti\nSe hvorfor så mange allerede har kjøpt sin egen. 🐶',
        headline: 'Et rent hjem, hver gang du børster',
        description: 'Verifiserte kunder elsker resultatet.',
      },
      ads: [
        { name: 'Pelsbørste_NO_SP_1', file: 'NO_palsborste_SP_1.mp4' },
        { name: 'Pelsbørste_NO_SP_2', file: 'NO_palsborste_SP_2.mp4' },
        { name: 'Pelsbørste_NO_SP_3', file: 'NO_palsborste_SP_3.mp4' },
      ],
    },
  ],
};
