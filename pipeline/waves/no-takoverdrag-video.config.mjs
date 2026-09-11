// Kampanj: Takovertrekk til Campingvogn NO — videobatch 2026-09-11 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-11 ur svenska ADCOPY-docsen i Drive.
// ⚠️ De svenska ADCOPY-beloppen (1469/1129 kr) var SEK, inte NOK — rättade till verifierade
// norska priser: 1189 kr (nu), 1549 kr (ordinarie/jämförpris), rabatt 360 kr = 23 %.
// BE-ROAS 1,62 = 1189/(1189 − 42,27 EUR à 10,767213 NOK/EUR = 455,13 kr COGS, batch-sheet #6).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Takovertrekk Campingvogn NO | BE-ROAS 1,62 | 2026-09-11',
  link: 'https://beverbutikken.no/products/takovertrekk-til-campingvogn-6-5-3-m-beskytter-den-dyreste-flaten',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-11/final/takoverdrag', // relativt pipeline/
  adsets: [
    {
      name: 'Takovertrekk Campingvogn NO - CS',
      copy: {
        message: '🔥 23% RABATT PÅ TAKOVERTREKKET TIL CAMPINGVOGNEN – I DAG 🔥\n1549 kr → 1189 kr\nLageret er begrenset, og prisen gjelder bare en liten stund til.\nVinteren kommer uansett – sørg for at taket er beskyttet før det er for sent.\nSikre ditt før det blir utsolgt. 👇',
        headline: 'Campingvogntaket – helt beskyttet i vinter',
        description: '23% rabatt akkurat nå. Fri frakt.',
      },
      ads: [
        { name: 'Takovertrekk_NO_CS_1', file: 'NO_takoverdrag_CS_1.mp4' },
        { name: 'Takovertrekk_NO_CS_2', file: 'NO_takoverdrag_CS_2.mp4' },
        { name: 'Takovertrekk_NO_CS_3', file: 'NO_takoverdrag_CS_3.mp4' },
      ],
    },
    {
      name: 'Takovertrekk Campingvogn NO - G',
      copy: {
        message: 'Han snakker om campingvogna som om den var et kjæledyr. 😅 I år fant jeg endelig noe han faktisk blir glad for.\n🎁 Et takovertrekk som beskytter campingvogna hele vinteren\n🎁 Noe han faktisk bruker – gang på gang\n🎁 Leveres rett hjem, klart til å pakkes inn\nGi en gave som viser at du skjønner hva han bryr seg om. 👇',
        headline: 'Gaven han faktisk blir glad for',
        description: 'Perfekt gave til campingvogneieren. Fri frakt.',
      },
      ads: [
        { name: 'Takovertrekk_NO_G_1', file: 'NO_takoverdrag_G_1.mp4' },
        { name: 'Takovertrekk_NO_G_2', file: 'NO_takoverdrag_G_2.mp4' },
        { name: 'Takovertrekk_NO_G_3', file: 'NO_takoverdrag_G_3.mp4' },
      ],
    },
    {
      name: 'Takovertrekk Campingvogn NO - PD',
      copy: {
        message: 'Taket på campingvogna er flaten du aldri sjekker – og den som koster mest å reparere. 🏕️\n✅ Beskytter mot regn, snø og UV hele vinteren\n✅ Spennes fast med stropp og strammer – klart på minutter\n✅ Én person klarer det helt alene\n✅ Får plass i egen oppbevaringspose når den ikke er i bruk\nBeskytt campingvogntaket før vinteren gjør det dyrt. 👇',
        headline: 'Campingvogntaket – helt beskyttet i vinter',
        description: 'Enkelt takovertrekk, 6,5 × 3 m. Fri frakt.',
      },
      ads: [
        { name: 'Takovertrekk_NO_PD_1', file: 'NO_takoverdrag_PD_1.mp4' },
        { name: 'Takovertrekk_NO_PD_2', file: 'NO_takoverdrag_PD_2.mp4' },
        { name: 'Takovertrekk_NO_PD_3', file: 'NO_takoverdrag_PD_3.mp4' },
      ],
    },
    {
      name: 'Takovertrekk Campingvogn NO - SP',
      copy: {
        message: '"Skulle ønske jeg hadde kjøpt dette i fjor vinter." 🙌\nDet sier flere og flere campingvogneiere om takovertrekket vårt.\n✅ Beskytter taket mot regn, snø og skitt\n✅ Én person setter det på selv – ingen hjelp nødvendig\n✅ 30 dagers åpent kjøp hvis du ikke er fornøyd\nLes hvorfor campingvogneiere velger dette før hver vinter. 👇',
        headline: 'Campingvogneiere elsker denne beskyttelsen',
        description: 'Vurdert av ekte kunder. Fri frakt.',
      },
      ads: [
        { name: 'Takovertrekk_NO_SP_1', file: 'NO_takoverdrag_SP_1.mp4' },
        { name: 'Takovertrekk_NO_SP_2', file: 'NO_takoverdrag_SP_2.mp4' },
        { name: 'Takovertrekk_NO_SP_3', file: 'NO_takoverdrag_SP_3.mp4' },
      ],
    },
  ],
};
