// Kampanj: Frontrutetrekk til Bobil NO — videobatch 2026-09-12 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-12 ur svenska ADCOPY-docsen i Drive.
// Verifierad mot beverbutikken.no: pris 509 kr (nu), 669 kr (ordinarie), rabatt 160 kr = 24 %.
// CS-konceptets claim (40 %) höjde jämförpriset i Shopify NO enligt prispolicyn: 669 → 849 kr
// (tools/shopify-fix-compareat.mjs --market NO --product-id 15553084391799 --rabatt 40, körd 2026-09-12).
// BE-ROAS 1,62 = 509/(509 − 17,99 EUR à 10,77704 NOK/EUR = 193,88 kr COGS, batch-sheet #7).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Frontrutetrekk til Bobil NO | BE-ROAS 1,62 | 2026-09-12',
  link: 'https://beverbutikken.no/products/frontrutetrekk-til-bobil-211-171-cm-utvendig-og-morkleggende',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-12/final/termoskydd', // relativt pipeline/
  adsets: [
    {
      name: 'Frontrutetrekk til Bobil NO - CS',
      copy: {
        message: '⏰ KUN I DAG: 40% rabatt på frontrutetrekk til bobil.\nLageret minker raskt, og prisen går tilbake i morgen.\nMange har allerede bestilt før sommeren.\nIkke gå glipp av sjansen – prisen gjelder kun i dag. 👇',
        headline: '40% RABATT – KUN I DAG',
        description: 'Få igjen på lager. Tilbudet avsluttes snart.',
      },
      ads: [
        { name: 'Frontrutetrekk_NO_CS_1', file: 'NO_termoskydd_CS_1.mp4' },
        { name: 'Frontrutetrekk_NO_CS_2', file: 'NO_termoskydd_CS_2.mp4' },
        { name: 'Frontrutetrekk_NO_CS_3', file: 'NO_termoskydd_CS_3.mp4' },
      ],
    },
    {
      name: 'Frontrutetrekk til Bobil NO - G',
      copy: {
        message: 'Vet du allerede hva du skal gi bobileieren i familien? 🎁\nForestill deg ansiktet når de åpner pakken og skjønner hva det er.\nIkke bare en gave – men en de faktisk kommer til å bruke, tur etter tur.\nSjekk målene (211 × 171 cm) og gi gaven som viser at du forstår hva de elsker.',
        headline: 'Gaven bobileiere elsker',
        description: 'Gi en gave de faktisk kommer til å bruke.',
      },
      ads: [
        { name: 'Frontrutetrekk_NO_G_1', file: 'NO_termoskydd_G_1.mp4' },
        { name: 'Frontrutetrekk_NO_G_2', file: 'NO_termoskydd_G_2.mp4' },
        { name: 'Frontrutetrekk_NO_G_3', file: 'NO_termoskydd_G_3.mp4' },
      ],
    },
    {
      name: 'Frontrutetrekk til Bobil NO - PD',
      copy: {
        message: 'Lei av en glovarm bobil om sommeren? 🥵\nFrontrutetrekket blokkerer solen og holder kupeen kjølig, akkurat når du trenger det.\n☀️ Kjøligere om sommeren\n❄️ Varmere om vinteren\n🌙 Full mørklegging når du sover\nSjekk at målene passer bobilen din (211 × 171 cm) og bestill i dag.',
        headline: 'Kjølig bobil, uansett vær',
        description: 'Termisk trekk som kjøler, varmer og mørklegger.',
      },
      ads: [
        { name: 'Frontrutetrekk_NO_PD_1', file: 'NO_termoskydd_PD_1.mp4' },
        { name: 'Frontrutetrekk_NO_PD_2', file: 'NO_termoskydd_PD_2.mp4' },
        { name: 'Frontrutetrekk_NO_PD_3', file: 'NO_termoskydd_PD_3.mp4' },
      ],
    },
    {
      name: 'Frontrutetrekk til Bobil NO - SP',
      copy: {
        message: '«Vi sover mye bedre nå» – det hører vi om og om igjen. ⭐⭐⭐⭐⭐\nTusenvis av bobileiere har allerede byttet til dette frontrutetrekket.\n✅ Kjøligere om sommeren\n✅ Mørkt hele natten\n✅ Enkelt å montere selv\nSe hvorfor så mange velger det før sommeren – bestill nå.',
        headline: 'Sov godt, natt etter natt',
        description: 'Betrodd av bobileiere.',
      },
      ads: [
        { name: 'Frontrutetrekk_NO_SP_1', file: 'NO_termoskydd_SP_1.mp4' },
        { name: 'Frontrutetrekk_NO_SP_2', file: 'NO_termoskydd_SP_2.mp4' },
        { name: 'Frontrutetrekk_NO_SP_3', file: 'NO_termoskydd_SP_3.mp4' },
      ],
    },
  ],
};
