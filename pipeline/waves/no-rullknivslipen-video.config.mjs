// Kampanj: Rulleknivsliper NO — videobatch 2026-09-29 (rutinen /translate-no, röst ElevenLabs).
// Norsk copy skriven direkt av huvudsessionen (inget Agent-verktyg tillgängligt i
// den här körningen) ur svenska ADCOPY-docsen i Drive, verifierad mot beverbutikken.no:
// pris 519 kr (før 679 = 23 %), fri frakt over 300 kr OK, 30 dagers åpent kjøp OK.
// Fakta ur produktsidan: magnetisk vinkelblokk merket 20°, rull med 2 diamantskiver,
// blokk og rull i tre, svart eske med bruksanvisning.
// Overifierade påståenden i källan borttagna: "bara idag", "få kvar i lager", "priset
// går tillbaka upp imorgon", kundcitatet ⭐⭐⭐⭐⭐, "tusentals nöjda hem", "skär som ny".
// COGS: batch-sheet #13, NORWAY Qty 1 Total ex. tax 18,38 EUR × 10,8367 = 199,18 kr
// ⇒ BE-ROAS 519/(519−199,18) = 1,62.
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Rulleknivsliper NO | BE-ROAS 1,62 | 2026-09-29',
  link: 'https://beverbutikken.no/products/rulleknivsliperen-i-tre-20-vinkelen-er-allerede-satt',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-29/rullknivslipen/final', // relativt pipeline/
  adsets: [
    {
      name: 'Rulleknivsliper NO - PD',
      copy: {
        message: 'Sliper du kniven og får ujevnt resultat hver gang? 🔪\nMed rulleknivsliperen i tre holder den magnetiske blokken kniven i 20° vinkel.\nDu ruller bare trerullen med de to diamantskivene langs eggen – vinkelen er allerede satt.\n✅ Ingen slipestein\n✅ Ingen gjetting\n👉 Bestill din i dag.',
        headline: 'Skarp kniv – uten å kunne slipe',
        description: 'Fast 20° vinkel gjør jobben for deg.',
      },
      ads: [
        { name: 'Rulleknivsliper_NO_PD_1_H1', file: 'NO_rullknivslipen_PD_1_H1.mp4' },
        { name: 'Rulleknivsliper_NO_PD_1_H2', file: 'NO_rullknivslipen_PD_1_H2.mp4' },
        { name: 'Rulleknivsliper_NO_PD_1_H3', file: 'NO_rullknivslipen_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Rulleknivsliper NO - SP',
      copy: {
        message: 'Hånden gjetter vinkelen hver gang du sliper på stein. Denne gjør det ikke. ⭐\nRulleknivsliperen i tre: en magnetisk blokk merket 20° og en rull med to diamantskiver.\nIngen slipestein. Ingen øvelse. Legg kniven mot blokken og rull.\n👉 Prøv selv – 30 dagers åpent kjøp.',
        headline: 'Knivene dine fortjener å være skarpe',
        description: '30 dagers åpent kjøp.',
      },
      ads: [
        { name: 'Rulleknivsliper_NO_SP_1_H1', file: 'NO_rullknivslipen_SP_1_H1.mp4' },
        { name: 'Rulleknivsliper_NO_SP_1_H2', file: 'NO_rullknivslipen_SP_1_H2.mp4' },
        { name: 'Rulleknivsliper_NO_SP_1_H3', file: 'NO_rullknivslipen_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'Rulleknivsliper NO - CS',
      copy: {
        message: '⏰ Nå 519 kr, før 679 kr – 23 % rabatt.\nRulleknivsliperen i tre til nedsatt pris.\n✅ Fast 20° vinkel\n✅ To diamantskiver på rullen\n📦 Fri frakt\n🔁 30 dagers åpent kjøp\n👉 Bestill din nå.',
        headline: 'Skarpe kniver – til lavere pris',
        description: 'Nå 519 kr, før 679 kr. Fri frakt.',
      },
      ads: [
        { name: 'Rulleknivsliper_NO_CS_1_H1', file: 'NO_rullknivslipen_CS_1_H1.mp4' },
        { name: 'Rulleknivsliper_NO_CS_1_H2', file: 'NO_rullknivslipen_CS_1_H2.mp4' },
        { name: 'Rulleknivsliper_NO_CS_1_H3', file: 'NO_rullknivslipen_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Rulleknivsliper NO - GT',
      copy: {
        message: 'Leter du etter gaven han faktisk kommer til å bruke? 🎁\nSlipesteinen han fikk sist ligger fortsatt i skapet.\nRulleknivsliperen i tre er fin nok til å stå fremme og enkel nok til å bli brukt hver uke: legg kniven mot blokken, rull, ferdig.\nSe for deg ansiktet hans når han åpner den svarte esken.\n👉 Gi en gave han faktisk bruker.',
        headline: 'Gaven han faktisk kommer til å bruke',
        description: 'I tre, i svart eske – klar til å gis bort.',
      },
      ads: [
        { name: 'Rulleknivsliper_NO_GT_1_H1', file: 'NO_rullknivslipen_GT_1_H1.mp4' },
        { name: 'Rulleknivsliper_NO_GT_1_H2', file: 'NO_rullknivslipen_GT_1_H2.mp4' },
        { name: 'Rulleknivsliper_NO_GT_1_H3', file: 'NO_rullknivslipen_GT_1_H3.mp4' },
      ],
    },
  ],
};
