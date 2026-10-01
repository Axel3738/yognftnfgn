// Kampanj: Kamadotrekk NO — videobatch 2026-10-01 (rutinen /translate-no, röst ElevenLabs).
// Källa: Drive "Kamadohuven" (1zZrDGa6qTV3a5gp0GUOieMX3yq-5guiB). Norsk copy av sonnet ur de svenska ADCOPY-docsen, verifierad mot beverbutikken.no:
// 629 kr (før 819 = 23,2 %, spar 190 kr), 30 dagers åpent kjøp OK. Bara REGN är belagt som beskyttelse (inte smuss/sol).
// COGS: batch-sheet #11, NORWAY Qty 1 = 7,85+14,62 = 22,47 EUR × 10,9005 = 244,9 NOK ⇒ BE-ROAS 629/(629−244,9) = 1,64.
// Konceptet C1 = rabatt (källans CS-adcopy/CS-bild). Axels beslut 2026-08-29: allt ACTIVE, 1000 kr/dag CBO.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Kamadotrekk NO | BE-ROAS 1,64 | 2026-10-01',
  link: 'https://beverbutikken.no/products/kamadotrekk-80-102-cm-med-oppbevaringspose',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-10-01/kamado/final', // relativt pipeline/
  adsets: [
    {
      name: 'Kamadotrekk NO - C1',
      copy: {
        message: "🔥 NÅ 629 KR!\nFør pris 819 kr.\n✓ Spar 190 kr (23%)\n✓ Kamadotrekk i sort 600D-stoff, 80 × 102 cm\n✓ Holder regnet unna lokket og ventilen\nTrykk på knappen under.",
        headline: "190 kr rabatt – nå 629 kr",
        description: "Spar 190 kr på kamadotrekk i sort 600D-stoff.",
      },
      ads: [
        { name: 'Kamado_NO_C1_1_H1', file: 'NO_kamado_C1_1_H1.mp4' },
        { name: 'Kamado_NO_C1_1_H2', file: 'NO_kamado_C1_1_H2.mp4' },
        { name: 'Kamado_NO_C1_1_H3', file: 'NO_kamado_C1_1_H3.mp4' },
      ],
    },
    {
      name: 'Kamadotrekk NO - G',
      copy: {
        message: "🎁 Leter du etter en gave til en grilleier?\n✓ Kamadotrekk i sort 600D-stoff, 80 × 102 cm\n✓ Oppbevaringspose følger med\n✓ Holder regnet unna lokket og ventilen\nSettes på etter hver grilling.\nTrykk på knappen under.",
        headline: "Gave til en grilleier",
        description: "629 kr – kamadotrekk i sort 600D-stoff.",
      },
      ads: [
        { name: 'Kamado_NO_G_1_H1', file: 'NO_kamado_G_1_H1.mp4' },
        { name: 'Kamado_NO_G_1_H2', file: 'NO_kamado_G_1_H2.mp4' },
        { name: 'Kamado_NO_G_1_H3', file: 'NO_kamado_G_1_H3.mp4' },
      ],
    },
    {
      name: 'Kamadotrekk NO - PD',
      copy: {
        message: "🛡️ Står grillen ute?\n✓ Holder regnet unna lokket og ventilen\n✓ Enkel å ta av og legge i oppbevaringsposen\n✓ Sort 600D-stoff, 80 × 102 cm (mål grillen før kjøp)\nTrykk på knappen under.",
        headline: "Regnbeskyttelse for kamado",
        description: "Holder regnet unna lokk og ventil.",
      },
      ads: [
        { name: 'Kamado_NO_PD_1_H1', file: 'NO_kamado_PD_1_H1.mp4' },
        { name: 'Kamado_NO_PD_1_H2', file: 'NO_kamado_PD_1_H2.mp4' },
        { name: 'Kamado_NO_PD_1_H3', file: 'NO_kamado_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Kamadotrekk NO - SP',
      copy: {
        message: "⭐ Har du en kamado som står ute?\n✓ Trekket tas enkelt av etter grilling\n✓ Holder regnet unna lokket og ventilen\n✓ Snøring i underkant holder trekket på plass i vind\nTrykk på knappen under.",
        headline: "Kamadotrekk for utendørsbruk",
        description: "Tas enkelt av, holder regnet unna.",
      },
      ads: [
        { name: 'Kamado_NO_SP_1_H1', file: 'NO_kamado_SP_1_H1.mp4' },
        { name: 'Kamado_NO_SP_1_H2', file: 'NO_kamado_SP_1_H2.mp4' },
        { name: 'Kamado_NO_SP_1_H3', file: 'NO_kamado_SP_1_H3.mp4' },
      ],
    },
  ],
};
