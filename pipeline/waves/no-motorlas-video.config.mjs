// Kampanj: Motorlås NO — videobatch 2026-10-01 (rutinen /translate-no, röst ElevenLabs).
// Källa: Drive "Motorlås utombordare" (1WB5MRRsjgutClZ1aHbSQgg-8BDdHLUk3). Norsk copy av sonnet ur de svenska ADCOPY-docsen,
// verifierad mot beverbutikken.no: 1079 kr (før 1409 = 23,4 %), 30 dagers åpent kjøp. Fri frakt/Klarna ej belagt på sidan, ej med.
// COGS: batch-sheet #10, NORWAY Qty1 Total ex. tax 38,56 EUR × 10,9005 = 420,3 NOK ⇒ BE-ROAS 1079/(1079−420,3) = 1,64.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Motorlås NO | BE-ROAS 1,64 | 2026-10-01',
  link: 'https://beverbutikken.no/products/motorlas-i-rustfritt-stal-laser-pahengsmotorens-festskruer',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-10-01/motorlas/final', // relativt pipeline/
  adsets: [
    {
      name: 'Motorlås NO - PD',
      copy: {
        message: "Noen få skruer. Det er alt som holder motoren fast. 😳\nMotorlås i rustfritt stål dekker festskruene helt – festskruene går ikke an å skru løs uten nøkkelen.\n✅ Festskruene kan ellers løsnes på et par minutter med riktig verktøy\n✅ Rustfritt stål, laget for å sitte ute ved bryggen\n✅ Nøkkelringen flyter hvis den havner i vannet\nTrykk på knappen under 👇",
        headline: "Sov trygt – motoren sitter fast",
        description: "Rustfritt stål. Låser festskruene direkte.",
      },
      ads: [
        { name: 'Motorlas_NO_PD_1_H1', file: 'NO_motorlas_PD_1_H1.mp4' },
        { name: 'Motorlas_NO_PD_1_H2', file: 'NO_motorlas_PD_1_H2.mp4' },
        { name: 'Motorlas_NO_PD_1_H3', file: 'NO_motorlas_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Motorlås NO - SP',
      copy: {
        message: "Motorlås i rustfritt stål låser påhengsmotorens festskruer.\n✅ Uten nøkkelen går festskruene ikke an å skru løs\n✅ Rustfritt stål, laget for å sitte ute ved bryggen\n✅ 30 dagers åpent kjøp\nTrykk på knappen under 👇",
        headline: "Sov trygt – motoren sitter fast",
        description: "Rustfritt stål. 30 dagers åpent kjøp.",
      },
      ads: [
        { name: 'Motorlas_NO_SP_1_H1', file: 'NO_motorlas_SP_1_H1.mp4' },
        { name: 'Motorlas_NO_SP_1_H2', file: 'NO_motorlas_SP_1_H2.mp4' },
        { name: 'Motorlas_NO_SP_1_H3', file: 'NO_motorlas_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'Motorlås NO - CS',
      copy: {
        message: "Spar 330 kr på motorlås i rustfritt stål\n1079 kr istedenfor 1409 kr – over 23 % rabatt.\nFestskruene går ikke an å skru løs uten nøkkelen.\nTrykk på knappen under 👇",
        headline: "Sov trygt – motoren sitter fast",
        description: "Spar 330 kr på motorlås i rustfritt stål",
      },
      ads: [
        { name: 'Motorlas_NO_CS_1_H1', file: 'NO_motorlas_CS_1_H1.mp4' },
        { name: 'Motorlas_NO_CS_1_H2', file: 'NO_motorlas_CS_1_H2.mp4' },
        { name: 'Motorlas_NO_CS_1_H3', file: 'NO_motorlas_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Motorlås NO - GT',
      copy: {
        message: "Har han alt han trenger på båten? 🎁\nMotorlås i rustfritt stål låser påhengsmotorens festskruer – uten nøkkelen går de ikke an å skru løs.\nTo nøkler følger med, én til deg og én i reserve.\n1079 kr (før 1409 kr) – spar 330 kr.\nTrykk på knappen under 👇",
        headline: "Presenten som låser motoren",
        description: "Lås festskruene med to nøkler",
      },
      ads: [
        { name: 'Motorlas_NO_GT_1_H1', file: 'NO_motorlas_GT_1_H1.mp4' },
        { name: 'Motorlas_NO_GT_1_H2', file: 'NO_motorlas_GT_1_H2.mp4' },
        { name: 'Motorlas_NO_GT_1_H3', file: 'NO_motorlas_GT_1_H3.mp4' },
      ],
    },
  ],
};
