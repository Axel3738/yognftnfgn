// Kampanj: Stigestøtte 2-pk NO — videobatch 2026-09-11 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-11 ur svenska ADCOPY-docsen i Drive.
// Verifierad mot beverbutikken.no: pris 1329 kr (nu), 1729 kr (ordinarie), rabatt 400 kr = 23 %.
// BE-ROAS 1,63 = 1329/(1329 − 47,51 EUR à 10,767213 NOK/EUR = 511,55 kr COGS, batch-sheet #7).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Stigestøtte 2-pk NO | BE-ROAS 1,63 | 2026-09-11',
  link: 'https://beverbutikken.no/products/stigestotte-2-pk-stigen-slutter-a-skli-sidelengs',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-11/final/stegstod', // relativt pipeline/
  adsets: [
    {
      name: 'Stigestøtte 2-pk NO - CS',
      copy: {
        message: 'I dag: 23 % rabatt på Stigestøtte 2-pk. ⏳\nTilbudet gjelder kun en begrenset periode.\nLageret krymper raskt – når det er tomt, er det tomt.\nIkke gå glipp av sjansen til å sikre stabiliteten din til nedsatt pris.\nBestill nå før prisen går opp igjen.',
        headline: 'Stigen sklir aldri sidelengs igjen',
        description: '23 % rabatt – kun i dag, begrenset antall.',
      },
      ads: [
        { name: 'Stigestotte_NO_CS_1', file: 'NO_stegstod_CS_1.mp4' },
        { name: 'Stigestotte_NO_CS_2', file: 'NO_stegstod_CS_2.mp4' },
        { name: 'Stigestotte_NO_CS_3', file: 'NO_stegstod_CS_3.mp4' },
      ],
    },
    {
      name: 'Stigestøtte 2-pk NO - G',
      copy: {
        message: 'Jeg visste ikke hva jeg skulle gi pappa i år. 🎁\nSå fant jeg denne – og den ble perfekt.\n✅ Noe han faktisk trenger og bruker\n✅ En liten gave som betyr mye\n✅ Han ble genuint rørt\nGi ham tryggheten han fortjener – bestill Stigestøtte 2-pk i dag.',
        headline: 'Gaven som viser at du bryr deg',
        description: 'Den gaven han faktisk setter pris på.',
      },
      ads: [
        { name: 'Stigestotte_NO_G_1', file: 'NO_stegstod_G_1.mp4' },
        { name: 'Stigestotte_NO_G_2', file: 'NO_stegstod_G_2.mp4' },
        { name: 'Stigestotte_NO_G_3', file: 'NO_stegstod_G_3.mp4' },
      ],
    },
    {
      name: 'Stigestøtte 2-pk NO - PD',
      copy: {
        message: 'Ustabil stige igjen? 😬\nSånn slutter den å skli sidelengs – for godt.\n✅ Ekstra grep mot bakken\n✅ Holder stødig selv på vått underlag\n✅ To enkle støtter, klare på minutter\nBestill din Stigestøtte 2-pk i dag og klatre trygt hver gang.',
        headline: 'Stigen sklir aldri sidelengs igjen',
        description: 'Stødig stige, tryggere jobb – hver gang.',
      },
      ads: [
        { name: 'Stigestotte_NO_PD_1', file: 'NO_stegstod_PD_1.mp4' },
        { name: 'Stigestotte_NO_PD_2', file: 'NO_stegstod_PD_2.mp4' },
        { name: 'Stigestotte_NO_PD_3', file: 'NO_stegstod_PD_3.mp4' },
      ],
    },
    {
      name: 'Stigestøtte 2-pk NO - SP',
      copy: {
        message: 'Tusenvis har allerede sluttet å bekymre seg for stigen sin. 🙌\n✅ "Endelig føles det trygt å klatre igjen"\n✅ Enkel å feste, holder stødig\n✅ Fungerer på de fleste underlag\nSe hvorfor så mange allerede har byttet til Stigestøtte 2-pk – bestill nå.',
        headline: 'Stigen kundene stoler på',
        description: 'Betrodd av tusenvis av fornøyde kunder.',
      },
      ads: [
        { name: 'Stigestotte_NO_SP_1', file: 'NO_stegstod_SP_1.mp4' },
        { name: 'Stigestotte_NO_SP_2', file: 'NO_stegstod_SP_2.mp4' },
        { name: 'Stigestotte_NO_SP_3', file: 'NO_stegstod_SP_3.mp4' },
      ],
    },
  ],
};
