// Kampanj: Magnetplater i Stort Format NO — videobatch 2026-09-04 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-04 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 409 kr (46 deler, før 682 kr = 40 %), 60-delersvarianten
// 469 kr (før 782 kr = 40 %). Jämförpriset höjt i Shopify NO för att matcha CS-annonsens
// "40 % RABATT"-claim (var 23 %, tools/shopify-fix-compareat.mjs --market NO --rabatt 40).
// BE-ROAS 1,62 = 409/(409 − 14,55 EUR à 10,799272 NOK/EUR = 157,13 kr COGS, batch-sheet #5.1).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Magnetplater NO | BE-ROAS 1,62 | 2026-09-04',
  link: 'https://beverbutikken.no/products/magnetplater-i-stort-format-byggesett-i-kasse-med-handtak',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-04/final/magnetplattor', // relativt pipeline/
  adsets: [
    {
      name: 'Magnetplater NO - CS',
      copy: {
        message: '⏰ KUN I DAG: 40 % rabatt på Magnetplater i Stort Format!\nNå: 409 kr (ordinært 682 kr).\nLageret tømmes — og når det er tomt, er denne prisen borte for godt.\nPerfekt gave, perfekt anledning til å slå til.\nIkke gå glipp av sjansen — dette kommer ikke tilbake i morgen.\n👉 Sikre din før den er utsolgt.',
        headline: '40 % RABATT — KUN I DAG',
        description: 'Få igjen på lager. Tilbudet gjelder kun i dag.',
      },
      ads: [
        { name: 'Magnetplater_NO_CS_1_H1', file: 'NO_magnetplattor_CS_1_H1.mp4' },
        { name: 'Magnetplater_NO_CS_1_H2', file: 'NO_magnetplattor_CS_1_H2.mp4' },
        { name: 'Magnetplater_NO_CS_1_H3', file: 'NO_magnetplattor_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Magnetplater NO - GT',
      copy: {
        message: 'Du vet den følelsen når du finner PRESIS riktig gave? 🎁\nDenne er den.\nSe for deg ansiktet til barnebarnet når de åpner boksen — og timene med glede som følger.\nIkke bare enda et leketøy som glemmes i et hjørne, men noe de faktisk kommer til å elske å bygge med.\n👉 Bli favoritten i familien denne gangen — bestill i dag.',
        headline: 'Gaven som gjør deg til favoritten',
        description: 'Den perfekte gaven for kreativ lek som varer.',
      },
      ads: [
        { name: 'Magnetplater_NO_GT_1_H1', file: 'NO_magnetplattor_GT_1_H1.mp4' },
        { name: 'Magnetplater_NO_GT_1_H2', file: 'NO_magnetplattor_GT_1_H2.mp4' },
        { name: 'Magnetplater_NO_GT_1_H3', file: 'NO_magnetplattor_GT_1_H3.mp4' },
      ],
    },
    {
      name: 'Magnetplater NO - PD',
      copy: {
        message: 'Lei av å finne LEGO-biter i støvsugeren? 😅\nMagnetplatene er store, lette å gripe og klikker sammen med en gang — perfekt for små hender.\nBarna bygger tårn, hus og kjøretøy helt på egen hånd.\nIngen stress, ingen frustrasjon — bare kreativ lek som holder dem opptatt i timevis.\nOg når leken er over, går alt rett ned i esken med håndtak. 🧲\n👉 Bestill din i dag hos Beverbutikken.',
        headline: 'Byggelek uten bråk og små deler',
        description: 'Store magnetplater for enkel, kreativ lek – uten stress.',
      },
      ads: [
        { name: 'Magnetplater_NO_PD_1_H1', file: 'NO_magnetplattor_PD_1_H1.mp4' },
        { name: 'Magnetplater_NO_PD_1_H2', file: 'NO_magnetplattor_PD_1_H2.mp4' },
        { name: 'Magnetplater_NO_PD_1_H3', file: 'NO_magnetplattor_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Magnetplater NO - SP',
      copy: {
        message: '"Det beste kjøpet vi har gjort til barna våre" — det er hva kundene våre sier. 🌟\nTusenvis av norske familier har allerede byttet skjermtid mot kreativ byggelek.\nStore, trygge plater som barna elsker å bygge med, om og om igjen.\nRask opprydding, raskt i gang igjen — perfekt for hverdagen.\n👉 Se hvorfor så mange foreldre anbefaler Magnetplater i Stort Format.',
        headline: 'Leketøyet foreldre ikke slutter å snakke om',
        description: 'Betrodd av tusenvis av familier over hele Norge.',
      },
      ads: [
        { name: 'Magnetplater_NO_SP_1_H1', file: 'NO_magnetplattor_SP_1_H1.mp4' },
        { name: 'Magnetplater_NO_SP_1_H2', file: 'NO_magnetplattor_SP_1_H2.mp4' },
        { name: 'Magnetplater_NO_SP_1_H3', file: 'NO_magnetplattor_SP_1_H3.mp4' },
      ],
    },
  ],
};
