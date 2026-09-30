// Kampanj: Dør- og Vindusalarm NO — videobatch 2026-09-30 (rutinen /translate-no, röst ElevenLabs).
// Källa: Drive "Dörr- och Fönsterlarm 110 dB" (1lAxadMeq4DcA05sE0R2EWeKRCisKmRTu). Norsk copy av sonnet (claude-sonnet-5 via API)
// ur de svenska ADCOPY-docsen, verifierad mot beverbutikken.no: 389 kr (før 509 = 23,6 %), 30 dagers åpent kjøp OK.
// Overifierat i källan (bara idag, begränsat lager, kundcitat, stjärnor, "hundratals hem", 14 dagars öppet köp) borttaget.
// COGS: batch-sheet, NORWAY Qty 1 = 13,79 EUR × 10,8367 = 149,43 NOK ⇒ BE-ROAS 389/(389−149,43) = 1,62 (Axels uppgift 1,63).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Dør- og Vindusalarm NO | BE-ROAS 1,63 | 2026-09-30',
  link: 'https://beverbutikken.no/products/dor-og-vindusalarm-110-db-tradlos-fjernkontroll',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-30/dorrlarm/final', // relativt pipeline/
  adsets: [
    {
      name: 'Dør- og Vindusalarm NO - PD',
      copy: {
        message: "Vet du alltid når noen åpner døren hjemme? 🚪\nMed denne alarmen gjør du det.\n🔊 110 dB — hørbart i hele huset\n📡 Fjernkontroll — slå av/på uten å gå dit\n🛠️ Ingen app, ikke noe abonnement, ingen elektriker\n👉 Trykk på knappen under",
        headline: "Hør direkte når døren åpnes",
        description: "110 dB alarm med trådløs fjernkontroll",
      },
      ads: [
        { name: 'DorLarm_NO_PD_1_H1', file: 'NO_dorrlarm_PD_1_H1.mp4' },
        { name: 'DorLarm_NO_PD_1_H2', file: 'NO_dorrlarm_PD_1_H2.mp4' },
        { name: 'DorLarm_NO_PD_1_H3', file: 'NO_dorrlarm_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Dør- og Vindusalarm NO - SP',
      copy: {
        message: "🔔 Hør direkte når noen rører døren, vinduet eller sykkelen.\n✅ Vibrasjonssensor varsler ved bevegelse\n✅ 110 dB — hørbart i hele huset\n✅ Trådløs fjernkontroll inkludert\n✅ 30 dagers åpent kjøp\n👉 Trykk på knappen under",
        headline: "110 dB varsel i hele huset",
        description: "Trådløs fjernkontroll – ingen app nødvendig",
      },
      ads: [
        { name: 'DorLarm_NO_SP_1_H1', file: 'NO_dorrlarm_SP_1_H1.mp4' },
        { name: 'DorLarm_NO_SP_1_H2', file: 'NO_dorrlarm_SP_1_H2.mp4' },
        { name: 'DorLarm_NO_SP_1_H3', file: 'NO_dorrlarm_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'Dør- og Vindusalarm NO - CS',
      copy: {
        message: "🔒 -24% på dør- og vindusalarm.\n389 kr istedenfor 509 kr — spar 120 kr.\n🔥 Trådløs fjernkontroll inkludert\n🔥 Ingen app, ikke noe abonnement, ingen elektriker\n👉 Trykk på knappen under",
        headline: "Spar 120 kr på dørlarm",
        description: "389 kr (før 509 kr) – trådløs fjernkontroll",
      },
      ads: [
        { name: 'DorLarm_NO_CS_1_H1', file: 'NO_dorrlarm_CS_1_H1.mp4' },
        { name: 'DorLarm_NO_CS_1_H2', file: 'NO_dorrlarm_CS_1_H2.mp4' },
        { name: 'DorLarm_NO_CS_1_H3', file: 'NO_dorrlarm_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Dør- og Vindusalarm NO - G',
      copy: {
        message: "🎁 En gave som faktisk brukes.\nIngen kabler, ingen app, ingen elektriker.\nVibrasjonssensor varsler når noen rører døren, vinduet eller sykkelen — 110 dB, hørbart i hele huset.\nTrådløs fjernkontroll slår alarmen av og på.\n👉 Trykk på knappen under",
        headline: "Gaven som faktisk brukes",
        description: "Dør- og vindusalarm, 389 kr – under 500 kr",
      },
      ads: [
        { name: 'DorLarm_NO_G_1_H1', file: 'NO_dorrlarm_G_1_H1.mp4' },
        { name: 'DorLarm_NO_G_1_H2', file: 'NO_dorrlarm_G_1_H2.mp4' },
        { name: 'DorLarm_NO_G_1_H3', file: 'NO_dorrlarm_G_1_H3.mp4' },
      ],
    },
  ],
};
