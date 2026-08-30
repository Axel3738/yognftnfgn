// Kampanj: Kranbeskyttelse Frost 420D NO — videobatch 2026-08-29 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-08-29 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 219 kr (før 285 = 23 %), 30 dagers åpent kjøp OK,
// INGEN fri frakt-claim (gränsen är 300 kr). BE-ROAS 1,63 = 219/(219 − 7,8 EUR à 10,86).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
// OBS: uppdatera datumet i campaignName till FAKTISKT launchdatum innan körning.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Kranbeskyttelse Frost NO | BE-ROAS 1,63 | 2026-08-29',
  link: 'https://beverbutikken.no/products/kranbeskyttelse-frost-420d-beskytter-utekranen-i-vinter',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-08-29/final/kranskydd', // relativt pipeline/
  adsets: [
    {
      name: 'Kranbeskyttelse NO - PD',
      copy: {
        message: 'En sprukket vannledning oppdages alltid for sent. 😬\nDen første ordentlige kuldeperioden fryser vannet i utekranen — og isen kan sprenge kran eller rør før du i det hele tatt merker det.\n✅ Isolerende fôr holder frosten unna hele vinteren\n✅ Tåler snø, regn og is (420D Oxford-stoff)\n✅ På plass på 10 sekunder, ingen verktøy\nBeskytt kranen før kulda kommer først. Bestill i dag 👇',
        headline: 'Beskytt utekranen før frosten kommer',
        description: 'Enkelt vern mot frost, kulde og dyre vannskader.',
      },
      ads: [
        { name: 'Kranbeskyttelse_NO_PD_1_H1', file: 'NO_kranskydd_PD_1_H1.mp4' },
        { name: 'Kranbeskyttelse_NO_PD_1_H2', file: 'NO_kranskydd_PD_1_H2.mp4' },
        { name: 'Kranbeskyttelse_NO_PD_1_H3', file: 'NO_kranskydd_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Kranbeskyttelse NO - SP',
      copy: {
        message: '"Jeg slapp en sprukket kran i vinter takket være denne." ⭐⭐⭐⭐⭐\nDet sier en av kundene våre — og hun er ikke alene.\n✅ Sitter tett selv i storm og minusgrader\n✅ Slitesterkt stoff som holder flere vintre\n✅ 30 dagers åpent kjøp, ingenting å tape\nSe hvorfor så mange boligeiere beskytter kranen sin med Kranbeskyttelse Frost 420D. Bestill nå 👇',
        headline: 'Boligeiere stoler på dette vernet',
        description: 'Vurdert av fornøyde kunder hver vinter.',
      },
      ads: [
        { name: 'Kranbeskyttelse_NO_SP_1_H1', file: 'NO_kranskydd_SP_1_H1.mp4' },
        { name: 'Kranbeskyttelse_NO_SP_1_H2', file: 'NO_kranskydd_SP_1_H2.mp4' },
        { name: 'Kranbeskyttelse_NO_SP_1_H3', file: 'NO_kranskydd_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'Kranbeskyttelse NO - CS',
      copy: {
        message: '⏰ Siste dagene av vintersalget!\n23 % rabatt på Kranbeskyttelse Frost 420D — men bare så lenge lageret rekker.\n🥶 Kulda er allerede på vei\n🔄 30 dagers åpent kjøp\n⚠️ Begrenset antall på lager akkurat nå\nIkke gå glipp av sjansen til å beskytte kranen til tilbudspris. Bestill før det tar slutt 👇',
        headline: 'Siste sjanse til vintersalget',
        description: '23 % rabatt — begrenset lager.',
      },
      ads: [
        { name: 'Kranbeskyttelse_NO_CS_1_H1', file: 'NO_kranskydd_CS_1_H1.mp4' },
        { name: 'Kranbeskyttelse_NO_CS_1_H2', file: 'NO_kranskydd_CS_1_H2.mp4' },
        { name: 'Kranbeskyttelse_NO_CS_1_H3', file: 'NO_kranskydd_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Kranbeskyttelse NO - GT',
      copy: {
        message: 'Han fikser alt i huset. I år er det din tur til å gi noe tilbake. 🎁\nIngen dyr gave, bare en som viser at du har lagt merke til det han bryr seg om.\n✅ Liten, praktisk og lett å pakke inn\n✅ Noe han faktisk kommer til å bruke\n✅ Perfekt for ham med enebolig, rekkehus eller hytte\nGi gaven som sier "jeg ser alt du gjør for oss." Bestill i dag 👇',
        headline: 'Den perfekte gaven til ham',
        description: 'En liten gave, en stor tanke bak.',
      },
      ads: [
        { name: 'Kranbeskyttelse_NO_GT_1_H1', file: 'NO_kranskydd_GT_1_H1.mp4' },
        { name: 'Kranbeskyttelse_NO_GT_1_H2', file: 'NO_kranskydd_GT_1_H2.mp4' },
        { name: 'Kranbeskyttelse_NO_GT_1_H3', file: 'NO_kranskydd_GT_1_H3.mp4' },
      ],
    },
  ],
};
