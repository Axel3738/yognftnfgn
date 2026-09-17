// Kampanj: Solcellslampa 210 LED Sensor NO — videobatch 2026-09-17 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-17 ur svenska ADCOPY-docsen i Drive.
// Verifierad mot beverbutikken.no: pris 559 kr, jämförpris 729 kr (butikens egna tal,
// ingen justering behövdes — 23,3 % rabatt matchar källcopyns clearance-claim ~24 %).
// BE-ROAS 1,62 = 559/(559 − 19,78 EUR à 10,798486 NOK/EUR = 213,59 kr COGS, batch-sheet #8).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
// OBS: källmappen saknar CS_1 och G_2 (bara 2 hooks per de koncepten) — inget problem,
// annonserna launchas med de hooks som finns.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Solcellslampa NO | BE-ROAS 1,62 | 2026-09-17',
  link: 'https://beverbutikken.no/products/solcellelampe-med-bevegelsessensor-tre-hoder-210-led',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-17/final/solcellslampa', // relativt pipeline/
  adsets: [
    {
      name: 'Solcellslampa NO - CS',
      copy: {
        message: '⚡ REA: 23% rabatt – i dag er siste dagen.\nSolcellelampen med bevegelsessensor – nå 559 kr i stedet for 729 kr.\n🔥 Lageret krymper raskt\n⏰ Prisen går tilbake i morgen\n✅ Ingen ledning, ingen elektriker – bare monter\nIkke gå glipp av denne prisen. Bestill før den er utsolgt. 👉',
        headline: '23% RABATT – I DAG',
        description: '559 kr i stedet for 729 kr. Kun i dag.',
      },
      ads: [
        { name: 'Solcellslampa_NO_CS_2', file: 'NO_solcellslampa_CS_2.mp4' },
        { name: 'Solcellslampa_NO_CS_3', file: 'NO_solcellslampa_CS_3.mp4' },
      ],
    },
    {
      name: 'Solcellslampa NO - G',
      copy: {
        message: '🎁 Visste ikke hva jeg skulle gi ham – helt til jeg fant denne.\nHan fikser alltid alt hjemme. Nå er det min tur.\n✅ Praktisk gave han faktisk bruker – hver kveld\n✅ Enkel å montere, ingen elektriker\n✅ Han legger merke til den hver gang han kommer hjem\nAnsiktsuttrykket hans da han prøvde den var verdt alt. Gi bort den perfekte gaven. 👉',
        headline: 'Den perfekte gaven til ham',
        description: 'En gave han vil tenke på hver kveld.',
      },
      ads: [
        { name: 'Solcellslampa_NO_G_1', file: 'NO_solcellslampa_G_1.mp4' },
        { name: 'Solcellslampa_NO_G_3', file: 'NO_solcellslampa_G_3.mp4' },
      ],
    },
    {
      name: 'Solcellslampa NO - PD',
      copy: {
        message: '🌙 Mørk oppkjørsel hver kveld? Det finnes en enkel løsning.\nSolcellelampe med bevegelsessensor – tennes automatisk når du kommer hjem.\n✅ Ingen ledning, ingen elektriker\n✅ 210 LED, lys over 270 grader\n✅ Vanntett – klarer norske vintre\nBestill din i dag og slutt å famle i mørket. 👉',
        headline: 'Utelys – uten ledning eller elektriker',
        description: 'Tennes automatisk. Lader seg selv i sola.',
      },
      ads: [
        { name: 'Solcellslampa_NO_PD_1', file: 'NO_solcellslampa_PD_1.mp4' },
        { name: 'Solcellslampa_NO_PD_2', file: 'NO_solcellslampa_PD_2.mp4' },
        { name: 'Solcellslampa_NO_PD_3', file: 'NO_solcellslampa_PD_3.mp4' },
      ],
    },
    {
      name: 'Solcellslampa NO - SP',
      copy: {
        message: '⭐️ «Beste kjøpet jeg har gjort til huset i år.»\nSå mange av kundene våre sier det samme om solcellelampen vår med bevegelsessensor.\n✅ Enkel å montere – ingen elektriker nødvendig\n✅ Lyser opp hele oppkjørselen på sekunder\n✅ 30 dagers åpent kjøp\nSe hvorfor tusenvis av norske hjem allerede har den. 👉',
        headline: 'Kundene elsker sitt nye utelys',
        description: 'Vurdert 5/5 av verifiserte kunder.',
      },
      ads: [
        { name: 'Solcellslampa_NO_SP_1', file: 'NO_solcellslampa_SP_1.mp4' },
        { name: 'Solcellslampa_NO_SP_2', file: 'NO_solcellslampa_SP_2.mp4' },
        { name: 'Solcellslampa_NO_SP_3', file: 'NO_solcellslampa_SP_3.mp4' },
      ],
    },
  ],
};
