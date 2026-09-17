// Kampanj: Fågelmatare med kamera NO — videobatch 2026-09-17 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-17 ur svenska ADCOPY-docsen i Drive.
// Verifierad mot beverbutikken.no: pris 1919 kr, jämförpris 2499 kr (butikens egna tal,
// ingen justering behövdes — 23,2 % rabatt matchar källcopyns clearance-claim).
// BE-ROAS 1,63 = 1919/(1919 − 68,73 EUR à 10,798486 NOK/EUR = 742,18 kr COGS, batch-sheet #10).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Fågelmatare NO | BE-ROAS 1,63 | 2026-09-17',
  link: 'https://beverbutikken.no/products/fuglemater-med-kamera-og-solcellepanel-se-fuglene-i-appen',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-17/final/fagelmatare', // relativt pipeline/
  adsets: [
    {
      name: 'Fågelmatare NO - CS',
      copy: {
        message: '580 kr rabatt – men bare i dag.\n⏳ Ordinært 2499 kr → nå 1919 kr.\nLageret minker raskt, mange har allerede bestilt sin.\nIkke gå glipp av sjansen før den er tom.\n👉 Slå til nå, før prisen går tilbake.',
        headline: 'Se fuglene – uten å gå glipp av dem',
        description: '1919 kr i dag – 580 kr rabatt, begrenset lager.',
      },
      ads: [
        { name: 'Fagelmatare_NO_CS_1', file: 'NO_fagelmatare_CS_1.mp4' },
        { name: 'Fagelmatare_NO_CS_2', file: 'NO_fagelmatare_CS_2.mp4' },
        { name: 'Fagelmatare_NO_CS_3', file: 'NO_fagelmatare_CS_3.mp4' },
      ],
    },
    {
      name: 'Fågelmatare NO - GT',
      copy: {
        message: 'Leter du etter gaven som faktisk blir brukt?\n🎁 Gi bort en fuglemater med kamera og app – så de kan se hver fugl som lander, rett i mobilen.\nSe for deg ansiktet deres når de ser den første fuglen på skjermen.\nEn gave som gir glede, dag etter dag.\n👉 Finn den perfekte gaven i dag.',
        headline: 'Den perfekte gaven til fugleelskeren',
        description: 'En gave de faktisk kommer til å bruke – hver dag.',
      },
      ads: [
        { name: 'Fagelmatare_NO_GT_1', file: 'NO_fagelmatare_GT_1.mp4' },
        { name: 'Fagelmatare_NO_GT_2', file: 'NO_fagelmatare_GT_2.mp4' },
        { name: 'Fagelmatare_NO_GT_3', file: 'NO_fagelmatare_GT_3.mp4' },
      ],
    },
    {
      name: 'Fågelmatare NO - PD',
      copy: {
        message: 'Du hører dem – men rekker aldri frem i tide.\n🐦 Nå kan du se hvem som lander på sittepinnen, rett i mobilen.\nKamera i huset. Solcellepanel på taket – ingen lading nødvendig.\nPerfekt for deg som elsker fugler, men aldri rekker ut i tide.\n👉 Bestill din egen fuglemater i dag.',
        headline: 'Se fuglene – uten å gå glipp av dem',
        description: 'Kamera + app + solcellepanel, alt i én fuglemater.',
      },
      ads: [
        { name: 'Fagelmatare_NO_PD_1', file: 'NO_fagelmatare_PD_1.mp4' },
        { name: 'Fagelmatare_NO_PD_2', file: 'NO_fagelmatare_PD_2.mp4' },
        { name: 'Fagelmatare_NO_PD_3', file: 'NO_fagelmatare_PD_3.mp4' },
      ],
    },
    {
      name: 'Fågelmatare NO - SP',
      copy: {
        message: '"Jeg ser flere fugler nå enn i hele fjor!"\n⭐⭐⭐⭐⭐ Sier en av våre fornøyde kunder.\nKamera i huset, solcellepanel på taket, app i mobilen.\n30 dagers åpent kjøp – helt risikofritt.\n👉 Se hvorfor så mange elsker den.',
        headline: 'Kundene elsker sine nye fuglebesøk',
        description: 'Verifiserte kunder, ekte fugleopplevelser.',
      },
      ads: [
        { name: 'Fagelmatare_NO_SP_1', file: 'NO_fagelmatare_SP_1.mp4' },
        { name: 'Fagelmatare_NO_SP_2', file: 'NO_fagelmatare_SP_2.mp4' },
        { name: 'Fagelmatare_NO_SP_3', file: 'NO_fagelmatare_SP_3.mp4' },
      ],
    },
  ],
};
