// Kampanj: ATV-Trekk 3XL NO — videobatch 2026-09-24 (rutinen /translate-no).
// Norsk copy skriven direkt av huvudsessionen (inget Agent-verktyg tillgängligt i
// den här körningen) ur svenska ADCOPY-docsen i Drive, verifierad mot beverbutikken.no:
// pris 539 kr (før 709 = 24 %), fri frakt over 300 kr OK, 30 dagers åpent kjøp OK.
// Overifierat kundcitat/antal i källan (SE) mjukat till generisk formulering (rule 3:
// hitta aldrig på data — samma praxis som tidigare batcher, se docs/video-localization.md).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'ATV-Trekk NO | BE-ROAS 1,62 | 2026-09-24',
  link: 'https://beverbutikken.no/products/atv-trekk-storrelse-3xl-256-110-120-cm-svart',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-24/final/atv-kapell', // relativt pipeline/
  adsets: [
    {
      name: 'ATVTrekk NO - PD',
      copy: {
        message: 'ATV-en din fortjener bedre enn å stå ute og ta skade av været. 🌧️\n✅ Vanntett, vindtett og UV-beskyttet\n✅ Passer de fleste merker – Polaris, Honda, Yamaha, Can-Am\n✅ Ingen mer skraping eller vasking før du kjører\nBare dra på trekket og glem været.\n👉 Bestill ATV-trekket ditt i dag.',
        headline: 'Beskytt ATV-en din – hele året',
        description: 'Vanntett trekk som beskytter mot regn, snø og sol.',
      },
      ads: [
        { name: 'ATVTrekk_NO_PD_1_H1', file: 'NO_atv-kapell_PD_1_H1.mp4' },
        { name: 'ATVTrekk_NO_PD_1_H2', file: 'NO_atv-kapell_PD_1_H2.mp4' },
        { name: 'ATVTrekk_NO_PD_1_H3', file: 'NO_atv-kapell_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'ATVTrekk NO - SP',
      copy: {
        message: 'Mange ATV-eiere har allerede valgt trekket som holder ATV-en ren og tørr. ⭐⭐⭐⭐⭐\n✅ Vanntett og tykt Oxford-stoff\n✅ Beskyttelse mot sol, støv og skitt\n✅ Sitter trygt med tre stroppfester\nSe hvorfor så mange har valgt det. 👉 Trykk på knappen under.',
        headline: 'Det ATV-eiere stoler på',
        description: 'Vanntett og slitesterkt. 30 dagers åpent kjøp.',
      },
      ads: [
        { name: 'ATVTrekk_NO_SP_1_H1', file: 'NO_atv-kapell_SP_1_H1.mp4' },
        { name: 'ATVTrekk_NO_SP_1_H2', file: 'NO_atv-kapell_SP_1_H2.mp4' },
        { name: 'ATVTrekk_NO_SP_1_H3', file: 'NO_atv-kapell_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'ATVTrekk NO - CS',
      copy: {
        message: '🚨 REA PÅ ATV-TREKKET! 🚨\nNå bare 539 kr. Ordinær pris 709 kr.\nDet er 24 % rabatt — men bare i dag.\nLageret er nesten tomt. Når det er borte, er det borte.\nVanntett. Solskjerming. Støvbeskyttelse. Tre stroppfester.\n👉 Ta trekket ditt for 539 kr før det er for sent!',
        headline: '24 % RABATT – BARE I DAG',
        description: 'Bare 539 kr. Nesten utsolgt.',
      },
      ads: [
        { name: 'ATVTrekk_NO_CS_1_H1', file: 'NO_atv-kapell_CS_1_H1.mp4' },
        { name: 'ATVTrekk_NO_CS_1_H2', file: 'NO_atv-kapell_CS_1_H2.mp4' },
        { name: 'ATVTrekk_NO_CS_1_H3', file: 'NO_atv-kapell_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'ATVTrekk NO - G',
      copy: {
        message: 'Hva gir du til den som elsker ATV-en sin mer enn noe annet? 🎁\nJeg fant svaret. Og jeg ser smilet hans for meg allerede.\nEt ATV-trekk som beskytter stoltheten hans i regn, sol og snø. En gave som viser at du faktisk har lagt merke til hva han bryr seg om.\nVær den som finner den perfekte gaven.\n👉 Trykk på knappen under.',
        headline: 'Gaven han faktisk blir glad for',
        description: 'En gave til ATV-eieren som har alt.',
      },
      ads: [
        { name: 'ATVTrekk_NO_G_1_H1', file: 'NO_atv-kapell_G_1_H1.mp4' },
        { name: 'ATVTrekk_NO_G_1_H2', file: 'NO_atv-kapell_G_1_H2.mp4' },
        { name: 'ATVTrekk_NO_G_1_H3', file: 'NO_atv-kapell_G_1_H3.mp4' },
      ],
    },
  ],
};
