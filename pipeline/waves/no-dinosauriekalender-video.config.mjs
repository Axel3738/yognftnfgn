// Kampanj: Dinosaur Adventskalender NO — videobatch 2026-09-19 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-19 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 449 kr (før 599 = 25 %, jämförpris redan rätt, ingen
// justering behövdes), fri frakt sann (449 kr > butikens 300 kr-gräns).
// PD_1_H2 struken ur batchen — källjudet var trasigt/icke-tal, ingen giltig norsk text gick
// att skriva. Bara 11 videor i denna batch (CS/G/SP har alla tre, PD har bara två).
// BE-ROAS 1,46 = 449/(449 − 13,02 EUR à 10,8095).
// Axels beslut 2026-08-29 (gäller alla NO-launcher): launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Dinosaur Adventskalender NO | BE-ROAS 1,46 | 2026-09-19',
  link: 'https://beverbutikken.no/products/dinosaur-adventskalender-24-dinosaurer',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-19/final/dinosauriekalender', // relativt pipeline/
  adsets: [
    {
      name: 'Dinosauriekalender NO - CS',
      copy: {
        message: '🚨 SISTE SJANSE PÅ ÅRETS JULEKALENDER! 🎄\n🔥 Begrenset antall igjen til nedsatt pris.\n🦖 24 dinosauroverraskelser i samme kalender.\n⏰ Når lageret er tomt, er det tomt!\n👉 Slå til før de tar slutt!',
        headline: 'REA: Siste sjanse! 🚨',
        description: 'Begrenset lager til ekstra god pris.',
      },
      ads: [
        { name: 'Dinosauriekalender_NO_CS_1_H1', file: 'NO_dinosauriekalender_CS_1_H1.mp4' },
        { name: 'Dinosauriekalender_NO_CS_1_H2', file: 'NO_dinosauriekalender_CS_1_H2.mp4' },
        { name: 'Dinosauriekalender_NO_CS_1_H3', file: 'NO_dinosauriekalender_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Dinosauriekalender NO - G',
      copy: {
        message: '🎁 Du vet følelsen når du finner gaven som gir et stort WOW! 🦖\n24 små dinosauroverraskelser å åpne i desember.\n🎄 Perfekt for barnet som elsker dinosaurer.\n😍 En liten overraskelse som kan gjøre hele dagen.\n👉 Gi bort en adventskalender de kommer til å huske!',
        headline: 'Gaven som gir et stort WOW! 🎁',
        description: 'En morsom julegave for små dinosaurfans.',
      },
      ads: [
        { name: 'Dinosauriekalender_NO_G_1_H1', file: 'NO_dinosauriekalender_G_1_H1.mp4' },
        { name: 'Dinosauriekalender_NO_G_1_H2', file: 'NO_dinosauriekalender_G_1_H2.mp4' },
        { name: 'Dinosauriekalender_NO_G_1_H3', file: 'NO_dinosauriekalender_G_1_H3.mp4' },
      ],
    },
    {
      name: 'Dinosauriekalender NO - PD',
      copy: {
        message: '🎄 En adventskalender som gjør hver dag litt mer spennende!\n🦖 Åpne en ny dinosaur hver dag.\n🎁 Perfekt for små dinosaurfans.\n👉 Gi julen en ekstra morsom start!',
        headline: 'En ny dinosaur hver dag 🦖',
        description: '24 dager fylt med dinosauroverraskelser.',
      },
      ads: [
        { name: 'Dinosauriekalender_NO_PD_1_H1', file: 'NO_dinosauriekalender_PD_1_H1.mp4' },
        { name: 'Dinosauriekalender_NO_PD_1_H3', file: 'NO_dinosauriekalender_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Dinosauriekalender NO - SP',
      copy: {
        message: '🦖 Barna elsker å åpne dagens dinosaur!\n🎄 En morsom liten overraskelse hver dag.\n✨ Enkelt, spennende og perfekt før jul.\n👉 Gjør desember ekstra morsom!',
        headline: 'Gjør hver desemberdag spennende',
        description: 'En adventskalender for alle små dinosaurfans.',
      },
      ads: [
        { name: 'Dinosauriekalender_NO_SP_1_H1', file: 'NO_dinosauriekalender_SP_1_H1.mp4' },
        { name: 'Dinosauriekalender_NO_SP_1_H2', file: 'NO_dinosauriekalender_SP_1_H2.mp4' },
        { name: 'Dinosauriekalender_NO_SP_1_H3', file: 'NO_dinosauriekalender_SP_1_H3.mp4' },
      ],
    },
  ],
};
