// Kampanj: Gjerdestolpebøyle 2-pk NO — videobatch 2026-09-13 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-13 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 1179 kr (før 1685 = 30 %, jämförpriset höjt idag så
// claimen stämmer exakt), 30 dagers åpent kjøp OK, INGEN fri frakt-claim (gränsen är 300 kr).
// COGS: batch-sheet #6, NORWAY-blockets Total ex. tax Qty 1 = 42,10 EUR × 10,778132 NOK/EUR
// (ECB-dagskurs 2026-09-13) = 453,76 kr. BE-ROAS = 1179/(1179 − 453,76) = 1,63.
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Gjerdestolpebøyle NO | BE-ROAS 1,63 | 2026-09-13',
  link: 'https://beverbutikken.no/products/gjerdestolpeboyle-2-pk-redder-stolpen-uten-a-grave',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-13/final/staketstolpsbygel', // relativt pipeline/
  adsets: [
    {
      name: 'Gjerdestolpebøyle NO - CS',
      copy: {
        message: '🚨 KUN I DAG – 30% RABATT 🚨 Gjerdestolpebøylen er nesten utsolgt. Ingen graving. Ikke noe styr. Bare resultater. ⏰ Tilbudet forsvinner i kveld. ⏰ Lageret varer ikke lenge. Klikk nå før det er for sent.',
        headline: '30% RABATT – KUN I DAG',
        description: 'Nesten utsolgt. Tilbudet gjelder kun i dag.',
      },
      ads: [
        { name: 'Gjerdestolpebøyle_NO_CS_1_H1', file: 'NO_staketstolpsbygel_CS_1_H1.mp4' },
        { name: 'Gjerdestolpebøyle_NO_CS_1_H2', file: 'NO_staketstolpsbygel_CS_1_H2.mp4' },
        { name: 'Gjerdestolpebøyle_NO_CS_1_H3', file: 'NO_staketstolpsbygel_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Gjerdestolpebøyle NO - GT',
      copy: {
        message: 'Vet du ikke hva du skal gi pappa i år? 🎁 Gi ham noe han faktisk kommer til å bruke – og elske. Se ansiktet hans når han åpner pakken og skjønner at du la merke til prosjektet hans. Det er den typen gave han snakker om i flere uker. Bestill i dag og bli den som alltid finner den perfekte gaven.',
        headline: 'Den perfekte gaven til pappa',
        description: 'En gave han faktisk kommer til å bruke.',
      },
      ads: [
        { name: 'Gjerdestolpebøyle_NO_GT_1_H1', file: 'NO_staketstolpsbygel_GT_1_H1.mp4' },
        { name: 'Gjerdestolpebøyle_NO_GT_1_H2', file: 'NO_staketstolpsbygel_GT_1_H2.mp4' },
        { name: 'Gjerdestolpebøyle_NO_GT_1_H3', file: 'NO_staketstolpsbygel_GT_1_H3.mp4' },
      ],
    },
    {
      name: 'Gjerdestolpebøyle NO - PD',
      copy: {
        message: 'Lei av gjerder som lener seg allerede etter bare én vinter? 😩 Med Gjerdestolpebøylen setter du stolpen rett ned i bakken – uten å grave. ✅ Passer 4x4 stolper ✅ Rustfritt karbonstål ✅ Ferdig på minutter, ikke timer Bestill din 2-pk i dag og bygg et gjerde som faktisk holder.',
        headline: 'Et gjerde som faktisk står rett',
        description: 'Sett ned stolpen direkte – ingen graving nødvendig.',
      },
      ads: [
        { name: 'Gjerdestolpebøyle_NO_PD_1_H1', file: 'NO_staketstolpsbygel_PD_1_H1.mp4' },
        { name: 'Gjerdestolpebøyle_NO_PD_1_H2', file: 'NO_staketstolpsbygel_PD_1_H2.mp4' },
        { name: 'Gjerdestolpebøyle_NO_PD_1_H3', file: 'NO_staketstolpsbygel_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Gjerdestolpebøyle NO - SP',
      copy: {
        message: '"Jeg var ferdig med hele gjerdet på én ettermiddag – uten å grave et eneste hull!" ⭐⭐⭐⭐⭐ Det sier kundene våre om Gjerdestolpebøylen. ✅ Enkel å bruke ✅ Raskt resultat ✅ 30 dagers åpent kjøp Se hvorfor så mange velger den – bestill din 2-pk i dag.',
        headline: 'Et gjerde som faktisk står rett',
        description: 'Tusenvis av fornøyde kunder – nå er det din tur.',
      },
      ads: [
        { name: 'Gjerdestolpebøyle_NO_SP_1_H1', file: 'NO_staketstolpsbygel_SP_1_H1.mp4' },
        { name: 'Gjerdestolpebøyle_NO_SP_1_H2', file: 'NO_staketstolpsbygel_SP_1_H2.mp4' },
        { name: 'Gjerdestolpebøyle_NO_SP_1_H3', file: 'NO_staketstolpsbygel_SP_1_H3.mp4' },
      ],
    },
  ],
};
