// Kampanj: Jetvifte NO — videobatch 2026-09-12 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-12 ur svenska ADCOPY-docsen i Drive.
// Verifierad mot beverbutikken.no: pris 679 kr (nu), 883 kr (ordinarie), rabatt 204 kr = 23 %.
// BE-ROAS 1,63 = 679/(679 − 24,36 EUR à 10,77704 NOK/EUR = 262,53 kr COGS, batch-sheet #5.1).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Jetvifte NO | BE-ROAS 1,63 | 2026-09-12',
  link: 'https://beverbutikken.no/products/jetvifte-for-makita-batteri-blas-rent-uten-ledning',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-12/final/jetvifte', // relativt pipeline/
  adsets: [
    {
      name: 'Jetvifte NO - CS',
      copy: {
        message: '⏰ KUN I DAG: 23 % rabatt på Jetviften!\n883 kr → 679 kr – men bare så lenge lageret rekker.\n✅ Perfekt hvis du allerede har Makita-batterier hjemme\n✅ Tilbudet gjelder kun i dag\n✅ Begrenset lager – slutt når det er tomt\nIkke gå glipp av sjansen – bestill før den er borte 👇',
        headline: '883 kr → 679 kr – kun i dag',
        description: 'Begrenset tilbud – gjelder kun i dag.',
      },
      ads: [
        { name: 'Jetvifte_NO_CS_1', file: 'NO_jetvifte_CS_1.mp4' },
        { name: 'Jetvifte_NO_CS_2', file: 'NO_jetvifte_CS_2.mp4' },
        { name: 'Jetvifte_NO_CS_3', file: 'NO_jetvifte_CS_3.mp4' },
      ],
    },
    {
      name: 'Jetvifte NO - G',
      copy: {
        message: 'Jeg visste ikke hva jeg skulle gi ham i år. 🎁\nSå fant jeg denne – og den ble perfekt.\n✅ Noe han faktisk bruker i garasjen, ikke i en skuff\n✅ Passer rett på Makita-batteriet han allerede har\n✅ Han ble genuint overrasket\nGi ham en gave han faktisk bruker – bestill Jetviften i dag 👇',
        headline: 'Gaven Makita-eiere faktisk bruker',
        description: 'En gave som passer batteriet han allerede har.',
      },
      ads: [
        { name: 'Jetvifte_NO_G_1', file: 'NO_jetvifte_G_1.mp4' },
        { name: 'Jetvifte_NO_G_2', file: 'NO_jetvifte_G_2.mp4' },
        { name: 'Jetvifte_NO_G_3', file: 'NO_jetvifte_G_3.mp4' },
      ],
    },
    {
      name: 'Jetvifte NO - PD',
      copy: {
        message: 'Lei av å støvsuge garasjen for hånd? 😤\n✅ Blås rent støv, sagflis og løv på sekunder\n✅ Fungerer rett med Makita-batteriet ditt – ingenting nytt å kjøpe\n✅ Kraftig børsteløs motor, ledningsfri frihet\n✅ Perfekt for garasje, hage, bil og verksted\nBestill din i dag og gjør rent på halve tiden 👇',
        headline: 'Ren garasje med batteriet du alt har',
        description: 'Kraftig ledningsfri vifte – fungerer med Makita-batteriet ditt.',
      },
      ads: [
        { name: 'Jetvifte_NO_PD_1', file: 'NO_jetvifte_PD_1.mp4' },
        { name: 'Jetvifte_NO_PD_2', file: 'NO_jetvifte_PD_2.mp4' },
        { name: 'Jetvifte_NO_PD_3', file: 'NO_jetvifte_PD_3.mp4' },
      ],
    },
    {
      name: 'Jetvifte NO - SP',
      copy: {
        message: '«Hvorfor kjøpte jeg ikke denne før?» 🌟\n✅ Hundrevis av fornøyde kunder som allerede har Makita-batterier\n✅ Enkel å bruke – bare koble til og kjør\n✅ 30 dagers åpent kjøp, ingen krøll\nSe selv hvorfor den er blitt en favoritt blant Makita-eiere 👇',
        headline: 'Makita-eiere trenger ikke nytt batteri',
        description: 'Betrodd av kunder som allerede eier Makita-verktøy.',
      },
      ads: [
        { name: 'Jetvifte_NO_SP_1', file: 'NO_jetvifte_SP_1.mp4' },
        { name: 'Jetvifte_NO_SP_2', file: 'NO_jetvifte_SP_2.mp4' },
        { name: 'Jetvifte_NO_SP_3', file: 'NO_jetvifte_SP_3.mp4' },
      ],
    },
  ],
};
