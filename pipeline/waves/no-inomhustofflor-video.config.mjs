// Kampanj: Fôrede Innetøfler NO — videobatch 2026-09-19 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-19 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 429 kr (før 858 = 50 %, jämförpris höjt så CS-
// konceptets "50 % rabatt"-claim stämmer), 30 dagers åpent kjøp OK. Källmappen saknar
// PD_1_H1 (bara PD_1_H2/H3 finns) — bara 11 videor i denna batch.
// BE-ROAS 1,62 = 429/(429 − 15,21 EUR à 10,8095).
// Axels beslut 2026-08-29 (gäller alla NO-launcher): launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Innetøfler NO | BE-ROAS 1,62 | 2026-09-19',
  link: 'https://beverbutikken.no/products/forede-innetofler-kamuflasje-herrestorrelse-40-47',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-19/final/inomhustofflor', // relativt pipeline/
  adsets: [
    {
      name: 'Inomhustofflor NO - CS',
      copy: {
        message: '⚡ 50 % RABATT – I DAG ⚡\nVåre fôrede innetøfler i kamuflasje er nå til halv pris – men bare en kort stund til.\n🔥 Populær modell\n🔥 Få igjen på lager i flere størrelser\n🔥 Rabatten gjelder bare i dag\nIkke gå glipp av sjansen. Bestill før de blir utsolgt 👇',
        headline: '50 % RABATT – KUN I DAG',
        description: 'Fôrede tøfler i kamuflasje – halv pris i dag.',
      },
      ads: [
        { name: 'Inomhustofflor_NO_CS_1_H1', file: 'NO_inomhustofflor_CS_1_H1.mp4' },
        { name: 'Inomhustofflor_NO_CS_1_H2', file: 'NO_inomhustofflor_CS_1_H2.mp4' },
        { name: 'Inomhustofflor_NO_CS_1_H3', file: 'NO_inomhustofflor_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Inomhustofflor NO - GT',
      copy: {
        message: 'Vet du ikke hva du skal gi ham? 🎁\nSe for deg ansiktsuttrykket hans når han åpner pakken og ser at du faktisk har funnet noe han liker – ikke «enda et par kjedelige tøfler».\n✔️ Perfekt til pappa, samboeren eller bestefar\n✔️ Noe han faktisk bruker hver dag\n✔️ Den følelsen av å ha funnet den rette gaven\nBestill før julegaven må være klar 👇',
        headline: 'Gaven han faktisk vil ha',
        description: 'Gi ham den perfekte gaven – varme, gode tøfler.',
      },
      ads: [
        { name: 'Inomhustofflor_NO_GT_1_H1', file: 'NO_inomhustofflor_GT_1_H1.mp4' },
        { name: 'Inomhustofflor_NO_GT_1_H2', file: 'NO_inomhustofflor_GT_1_H2.mp4' },
        { name: 'Inomhustofflor_NO_GT_1_H3', file: 'NO_inomhustofflor_GT_1_H3.mp4' },
      ],
    },
    {
      name: 'Inomhustofflor NO - PD',
      copy: {
        message: 'Lei av iskalde føtter hjemme? 🥶\nVåre fôrede innetøfler i kamuflasje holder føttene varme og gode, uansett hvor kaldt det er ute.\n✔️ Mykt fôret innside\n✔️ Behagelig å gå i hele dagen\n✔️ Slitesterk såle – funker også utenfor døra\nStørrelse 40–47. Bestill dine i dag 👇',
        headline: 'Varme føtter, hver dag hjemme',
        description: 'Fôrede tøfler i kamuflasje – godt, varmt, behagelig.',
      },
      ads: [
        { name: 'Inomhustofflor_NO_PD_1_H2', file: 'NO_inomhustofflor_PD_1_H2.mp4' },
        { name: 'Inomhustofflor_NO_PD_1_H3', file: 'NO_inomhustofflor_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Inomhustofflor NO - SP',
      copy: {
        message: 'Mange kunder beskriver dem som noen av de beste tøflene de har hatt 😊\nFôrede innetøfler i kamuflasje som har blitt en favoritt blant menn som vil ha varme, gode føtter hjemme.\n✔️ Varme med en gang\n✔️ God passform\n✔️ Mange kjøper et par til\nSe selv hvorfor de er så populære 👇',
        headline: 'Varme føtter, satt pris på av kundene',
        description: 'Fôrede tøfler i kamuflasje – foretrukket av menn hjemme.',
      },
      ads: [
        { name: 'Inomhustofflor_NO_SP_1_H1', file: 'NO_inomhustofflor_SP_1_H1.mp4' },
        { name: 'Inomhustofflor_NO_SP_1_H2', file: 'NO_inomhustofflor_SP_1_H2.mp4' },
        { name: 'Inomhustofflor_NO_SP_1_H3', file: 'NO_inomhustofflor_SP_1_H3.mp4' },
      ],
    },
  ],
};
