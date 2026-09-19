// Kampanj: Vedklyvborr NO — videobatch 2026-09-19 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-19 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 299 kr (før 598 = 50 %, jämförpris höjt för att
// CS-konceptets "50 % rabatt"-claim ska stämma — se shopify-fix-compareat.mjs-körningen
// samma dag), INGEN fri frakt-claim (299 kr < butikens 300 kr-gräns), 30 dagers åpent kjøp OK.
// BE-ROAS 1,61 = 299/(299 − 10,53 EUR à 10,8095).
// Axels beslut 2026-08-29 (gäller alla NO-launcher): launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Vedkløyverbor NO | BE-ROAS 1,61 | 2026-09-19',
  link: 'https://beverbutikken.no/products/vedkloyver-bor-til-drill-kloyvekjegle-o32-mm-3-fester',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-19/final/vedklyvborr', // relativt pipeline/
  adsets: [
    {
      name: 'Vedklyvborr NO - CS',
      copy: {
        message: '⚡ KUN I DAG: 50 % RABATT ⚡\nLageret er nesten tomt – når det er tomt, er det tomt.\n🔥 50 % rabatt på vedkløyverboret\n🔥 Gjelder kun i dag\nIkke gå glipp av sjansen til å fikse vinterens vedhogst til halv pris.\n👉 Handle nå før tilbudet forsvinner.',
        headline: '50 % RABATT – KUN I DAG',
        description: 'Siste sjanse – lageret tar snart slutt.',
      },
      ads: [
        { name: 'Vedklyvborr_NO_CS_1_H1', file: 'NO_vedklyvborr_CS_1_H1.mp4' },
        { name: 'Vedklyvborr_NO_CS_1_H2', file: 'NO_vedklyvborr_CS_1_H2.mp4' },
        { name: 'Vedklyvborr_NO_CS_1_H3', file: 'NO_vedklyvborr_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Vedklyvborr NO - GT',
      copy: {
        message: 'Vet du fortsatt ikke hva du skal gi ham i år? 🎁\nHan som allerede har alt. Han som elsker verktøyet sitt og veden sin.\nDenne gangen finner du gaven som faktisk blir brukt – om og om igjen.\n✅ Enkel å pakke inn, lett å elske\n✅ Perfekt til pappa, bestefar eller mannen i huset\n✅ Se ansiktet hans når han åpner pakken\nBli den som ga den beste julegaven i år. 🎄\n👉 Bestill gaven i dag.',
        headline: 'Den perfekte gaven til pappa',
        description: 'En gave han faktisk kommer til å bruke.',
      },
      ads: [
        { name: 'Vedklyvborr_NO_GT_1_H1', file: 'NO_vedklyvborr_GT_1_H1.mp4' },
        { name: 'Vedklyvborr_NO_GT_1_H2', file: 'NO_vedklyvborr_GT_1_H2.mp4' },
        { name: 'Vedklyvborr_NO_GT_1_H3', file: 'NO_vedklyvborr_GT_1_H3.mp4' },
      ],
    },
    {
      name: 'Vedklyvborr NO - PD',
      copy: {
        message: 'Fortsatt ute og hugger ved med øks? 🪓\nDet finnes en enklere måte.\n✅ Fest boret i drillen din\n✅ Trykk inn i veden – den sprekker opp med en gang\n✅ Ingen svette, ingen risiko for skader\n✅ Fungerer med de fleste kraftige driller\nGjør vedkløyvingen til det enkleste momentet i vinterforberedelsene.\n👉 Bestill din i dag.',
        headline: 'Kløyv ved uten å løfte en øks',
        description: 'Fest i drillen din – veden sprekker på sekunder.',
      },
      ads: [
        { name: 'Vedklyvborr_NO_PD_1_H1', file: 'NO_vedklyvborr_PD_1_H1.mp4' },
        { name: 'Vedklyvborr_NO_PD_1_H2', file: 'NO_vedklyvborr_PD_1_H2.mp4' },
        { name: 'Vedklyvborr_NO_PD_1_H3', file: 'NO_vedklyvborr_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Vedklyvborr NO - SP',
      copy: {
        message: 'Dette er produktet alle vedfyrere snakker om akkurat nå 🔥\nTusenvis av boligeiere og hytteeiere har allerede byttet ut øksen med denne.\n✅ Enkel å bruke – fest i drillen og trykk\n✅ Sparer tid og kropp\n✅ En favoritt blant fornøyde kunder i hele Norge\nMange som har kjøpt den sier det samme: et av de beste kjøpene før vinteren – sparer både rygg og tid. ⭐⭐⭐⭐⭐\n👉 Se hvorfor så mange velger denne.',
        headline: 'Vedfyrere i hele Norge elsker den',
        description: 'Høyt vurdert av fornøyde kunder.',
      },
      ads: [
        { name: 'Vedklyvborr_NO_SP_1_H1', file: 'NO_vedklyvborr_SP_1_H1.mp4' },
        { name: 'Vedklyvborr_NO_SP_1_H2', file: 'NO_vedklyvborr_SP_1_H2.mp4' },
        { name: 'Vedklyvborr_NO_SP_1_H3', file: 'NO_vedklyvborr_SP_1_H3.mp4' },
      ],
    },
  ],
};
