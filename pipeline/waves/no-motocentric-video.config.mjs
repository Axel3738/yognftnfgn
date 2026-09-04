// Kampanj: Motocentric Bakveske 37 L NO — videobatch 2026-09-04 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-04 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 1049 kr (før 1364 kr = 23 %, matchar originalets claim
// rakt av). Fri frakt-claim äkta (produkten > 300 kr), 30 dagers åpent kjøp OK.
// BE-ROAS 1,64 = 1049/(1049 − 37,77 EUR à 10,799272 NOK/EUR = 407,90 kr COGS, batch-sheet #5.1).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Motocentric NO | BE-ROAS 1,64 | 2026-09-04',
  link: 'https://beverbutikken.no/products/motocentric-bakveske-37-l-hjelmen-gar-i-vesken',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-04/final/motocentric', // relativt pipeline/
  adsets: [
    {
      name: 'Motocentric NO - CS',
      copy: {
        message: '23 % rabatt – i dag. ⏳\nMotocentric Bakveske 37 L: 1364 kr → 1049 kr.\n🔥 Begrenset lager – mange har allerede slått til\n🔥 Fri frakt over 300 kr\n🔥 Betal senere med Klarna\nNår den er tom, er den tom. Sikre din nå.',
        headline: 'Hjelmen får endelig sin egen plass',
        description: '23 % rabatt akkurat nå – begrenset lager.',
      },
      ads: [
        { name: 'Motocentric_NO_CS_1_H1', file: 'NO_motocentric_CS_1_H1.mp4' },
        { name: 'Motocentric_NO_CS_1_H2', file: 'NO_motocentric_CS_1_H2.mp4' },
        { name: 'Motocentric_NO_CS_1_H3', file: 'NO_motocentric_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Motocentric NO - GT',
      copy: {
        message: 'Vet du ikke hva du skal gi ham i år? 🎁\nJeg fant endelig en gave han faktisk kommer til å bruke – hver eneste tur.\n💙 Løser et problem han har klaget på i evigheter\n💙 Enkel å pakke inn, umulig å bli skuffet over\n💙 Se ansiktet hans når han skjønner hva det er\nGi ham friheten til å pakke mer. Bestill i dag.',
        headline: 'Gaven han faktisk kommer til å bruke',
        description: 'Den perfekte julegaven til motorsykkelentusiasten i livet ditt.',
      },
      ads: [
        { name: 'Motocentric_NO_GT_1_H1', file: 'NO_motocentric_GT_1_H1.mp4' },
        { name: 'Motocentric_NO_GT_1_H2', file: 'NO_motocentric_GT_1_H2.mp4' },
        { name: 'Motocentric_NO_GT_1_H3', file: 'NO_motocentric_GT_1_H3.mp4' },
      ],
    },
    {
      name: 'Motocentric NO - PD',
      copy: {
        message: 'Slutt å bære hjelmen i hånden etter hver tur. 🏍️\nDenne bakveska sluker hele hjelmen – med god margin.\n✅ 37 liter oppbevaring, rett på motorsykkelen\n✅ Plass til regntøy, hansker og kjettinglås også\n✅ Enkel å montere og ta av\nKlikk og pakk smartere allerede i dag.',
        headline: 'Hjelmen får endelig sin egen plass',
        description: '37 liter ekstra oppbevaring – uten en plasskrevende toppboks.',
      },
      ads: [
        { name: 'Motocentric_NO_PD_1_H1', file: 'NO_motocentric_PD_1_H1.mp4' },
        { name: 'Motocentric_NO_PD_1_H2', file: 'NO_motocentric_PD_1_H2.mp4' },
        { name: 'Motocentric_NO_PD_1_H3', file: 'NO_motocentric_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Motocentric NO - SP',
      copy: {
        message: '"Endelig slapp jeg å slepe på hjelmen." 🙌\nDet sier stadig flere norske motorsyklister om denne veska.\n⭐️ 37 liter oppbevaring, plass til en hel hjelm\n⭐️ Elsket av pendlere og langturskjørere\n⭐️ 30 dagers åpent kjøp – helt risikofritt\nSe hvorfor den har blitt en favoritt. Bestill nå.',
        headline: 'Elsket av norske motorsyklister',
        description: 'Full-face-hjelm, hansker og regntøy – alt får plass.',
      },
      ads: [
        { name: 'Motocentric_NO_SP_1_H1', file: 'NO_motocentric_SP_1_H1.mp4' },
        { name: 'Motocentric_NO_SP_1_H2', file: 'NO_motocentric_SP_1_H2.mp4' },
        { name: 'Motocentric_NO_SP_1_H3', file: 'NO_motocentric_SP_1_H3.mp4' },
      ],
    },
  ],
};
