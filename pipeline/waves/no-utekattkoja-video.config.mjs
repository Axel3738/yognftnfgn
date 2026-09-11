// Kampanj: Isolert Utekattehus NO — videobatch 2026-09-11 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-11 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 809 kr (før 1059 kr = 24 %), matchar originalets claim rakt av.
// BE-ROAS 1,62 = 809/(809 − 28,85 EUR à 10,767213 NOK/EUR = 310,63 kr COGS, batch-sheet #6).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Isolert Utekattehus NO | BE-ROAS 1,62 | 2026-09-11',
  link: 'https://beverbutikken.no/products/isolert-utekattehus-torr-og-vindtett-plass-utendors',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-11/final/utekattkoja', // relativt pipeline/
  adsets: [
    {
      name: 'Isolert Utekattehus NO - CS',
      copy: {
        message: '⏰ Kun i dag – 24 % rabatt på Isolert Utekattehus!\nPrisen er satt ned akkurat nå. Lageret krymper raskt, og tilbudet gjelder bare i dag. Ikke vent – når det er tomt, er det tomt.\n✅ 24 % rabatt – kun i dag\n✅ Få igjen på lager\n✅ Rask levering\nSikre ditt til nedsatt pris før det er for sent. 👇',
        headline: '24 % RABATT – I DAG',
        description: 'Tilbudet gjelder kun i dag – få igjen på lager.',
      },
      ads: [
        { name: 'Utekattehus_NO_CS_1', file: 'NO_utekattkoja_CS_1.mp4' },
        { name: 'Utekattehus_NO_CS_2', file: 'NO_utekattkoja_CS_2.mp4' },
        { name: 'Utekattehus_NO_CS_3', file: 'NO_utekattkoja_CS_3.mp4' },
      ],
    },
    {
      name: 'Isolert Utekattehus NO - G',
      copy: {
        message: 'Du vet nøyaktig hvem som ville elsket denne gaven. 🎁\nMoren din snakker alltid om katten som bor utenfor huset hennes. Se for deg ansiktet hennes når hun åpner pakken og skjønner at du tenkte på det hun bekymrer seg for hver kveld.\n✅ En gave som viser at du faktisk lytter\n✅ Gir trygghet og varme til noen hun bryr seg om\n✅ Enkel å pakke inn, umulig å glemme\nBli den som ga den perfekte gaven i år. Bestill i dag. 👇',
        headline: 'Gaven hun ikke forventer',
        description: 'En gave som varmer – både katten og hjertet.',
      },
      ads: [
        { name: 'Utekattehus_NO_G_1', file: 'NO_utekattkoja_G_1.mp4' },
        { name: 'Utekattehus_NO_G_2', file: 'NO_utekattkoja_G_2.mp4' },
      ],
    },
    {
      name: 'Isolert Utekattehus NO - PD',
      copy: {
        message: 'Katten din fryser ute – uten at du vet det. 🐾\n✅ Holder katten tørr når det regner\n✅ Blokkerer vind og kulde\n✅ Isolert – beholder varmen inne\n✅ Gir katten sin egen trygge plass utendørs\nGi katten din et varmt og trygt hjem – også utendørs. Bestill ditt Isolerte Utekattehus i dag. 👇',
        headline: 'Et varmt hjem – også utendørs',
        description: 'Tørt, vindtett og isolert for katten din.',
      },
      ads: [
        { name: 'Utekattehus_NO_PD_1', file: 'NO_utekattkoja_PD_1.mp4' },
        { name: 'Utekattehus_NO_PD_2', file: 'NO_utekattkoja_PD_2.mp4' },
        { name: 'Utekattehus_NO_PD_3', file: 'NO_utekattkoja_PD_3.mp4' },
      ],
    },
    {
      name: 'Isolert Utekattehus NO - SP',
      copy: {
        message: 'Tusenvis av katteeiere har allerede gitt kattene sine et tryggere liv utendørs. 🐱\n✅ "Katten min sover her hver eneste natt nå"\n✅ Isolert mot kulde, regn og vind\n✅ Enkel å sette opp – klar med en gang\nSe hvorfor så mange katteeiere velger denne før vinteren. Bestill nå. 👇',
        headline: 'Katteeiere elsker den – se hvorfor',
        description: 'Brukt av tusenvis av katteeiere.',
      },
      ads: [
        { name: 'Utekattehus_NO_SP_1', file: 'NO_utekattkoja_SP_1.mp4' },
        { name: 'Utekattehus_NO_SP_2', file: 'NO_utekattkoja_SP_2.mp4' },
        { name: 'Utekattehus_NO_SP_3', file: 'NO_utekattkoja_SP_3.mp4' },
      ],
    },
  ],
};
