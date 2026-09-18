// Kampanj: Infartslarm Trådlöst NO — videobatch 2026-09-16 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-16 ur svenska ADCOPY-docsen i Drive.
// Verifierad mot beverbutikken.no: pris 429 kr, jämförpris höjt 559 -> 858 kr (prispolicyn,
// 2026-08-29) för att matcha CS-konceptets 50%-claim i den svenska källcopyn.
// BE-ROAS 1,61 = 429/(429 − 15,02 EUR à 10,784912 NOK/EUR = 161,99 kr COGS, batch-sheet #7).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
// Sittkäpp Hopfällbar hoppades över samma natt — saknar Norge-frakt i batch-sheet #7.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Infartslarm NO | BE-ROAS 1,61 | 2026-09-16',
  link: 'https://beverbutikken.no/products/tradlos-innkjorselsalarm-du-horer-nar-noen-svinger-inn',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-16/final/infartslarm', // relativt pipeline/
  adsets: [
    {
      name: 'Infartslarm NO - CS',
      copy: {
        message: '⚡ 50 % RABATT – KUN I DAG ⚡\nTrådløs Innkjørselsalarm til halv pris. Ingen kode trengs – prisen er allerede satt ned i kassen.\n🚨 429 kr i stedet for 858 kr\n🚨 Tilbudet gjelder kun i dag\n🚨 Gratis frakt inkludert\nIkke vent til i morgen.\n👉 Sikre deg ditt før dagen er over.',
        headline: '50 % rabatt – kun i dag',
        description: '429 kr i stedet for 858 kr. Bestill før tilbudet er over.',
      },
      ads: [
        { name: 'Infartslarm_NO_CS_1', file: 'NO_infartslarm_CS_1.mp4' },
        { name: 'Infartslarm_NO_CS_2', file: 'NO_infartslarm_CS_2.mp4' },
        { name: 'Infartslarm_NO_CS_3', file: 'NO_infartslarm_CS_3.mp4' },
      ],
    },
    {
      name: 'Infartslarm NO - G',
      copy: {
        message: 'Har du noen som virker å ha alt? 🎁\nJeg visste ikke hva jeg skulle gi foreldrene mine i år – helt til jeg fant denne.\nEn liten sensor ved oppkjørselen. En mottaker inne i huset. Nå hører de med en gang når jeg svinger inn på besøk.\nMan så det i ansiktet med en gang – det blikket som sier «så smart, det hadde jeg aldri tenkt på». 😊\nNoen ganger er det de enkle gavene som betyr mest.\n👉 Gi tryggheten som gave.',
        headline: 'Gaven de faktisk kommer til å bruke',
        description: 'Perfekt til foreldre eller partner med enebolig eller lang oppkjørsel.',
      },
      ads: [
        { name: 'Infartslarm_NO_G_1', file: 'NO_infartslarm_G_1.mp4' },
        { name: 'Infartslarm_NO_G_2', file: 'NO_infartslarm_G_2.mp4' },
        { name: 'Infartslarm_NO_G_3', file: 'NO_infartslarm_G_3.mp4' },
      ],
    },
    {
      name: 'Infartslarm NO - PD',
      copy: {
        message: 'Hører du når noen kjører inn på oppkjørselen din? 🚗\nDe fleste merker ikke besøk før dørklokken ringer.\n✅ Sensor ved oppkjørselen, mottaker inne i huset\n✅ Ingen kabling – klart på minutter\n✅ Hør biler, leveranser og besøkende med en gang\nSlipp å stå ved vinduet. Slipp å sjekke kameraet unødvendig.\n👉 Bestill din Trådløse Innkjørselsalarm i dag.',
        headline: 'Hør alltid når noen kjører inn',
        description: 'Trådløs innkjørselsalarm – enkel å installere, klar på minutter.',
      },
      ads: [
        { name: 'Infartslarm_NO_PD_1', file: 'NO_infartslarm_PD_1.mp4' },
        { name: 'Infartslarm_NO_PD_2', file: 'NO_infartslarm_PD_2.mp4' },
        { name: 'Infartslarm_NO_PD_3', file: 'NO_infartslarm_PD_3.mp4' },
      ],
    },
    {
      name: 'Infartslarm NO - SP',
      copy: {
        message: 'Har du sluttet å sjekke kameraet hver gang du hører en lyd utenfor?\nMed en sensor ved oppkjørselen og en mottaker inne i huset vet du med en gang når noen faktisk kjører inn – bil, levering eller besøk.\n✅ Hører det med en gang bilen svinger inn\n✅ Installasjon på minutter, ingen kabling\n✅ 30 dagers åpent kjøp – ingen risiko\nSe om det passer din oppkjørsel. 👇',
        headline: 'Trygghet du faktisk kan høre',
        description: 'Trådløs innkjørselsalarm, klar på minutter. 30 dagers åpent kjøp.',
      },
      ads: [
        { name: 'Infartslarm_NO_SP_1', file: 'NO_infartslarm_SP_1.mp4' },
        { name: 'Infartslarm_NO_SP_2', file: 'NO_infartslarm_SP_2.mp4' },
        { name: 'Infartslarm_NO_SP_3', file: 'NO_infartslarm_SP_3.mp4' },
      ],
    },
  ],
};
