// Kampanj: Ukedosett 21 Rom NO — videobatch 2026-09-05 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-05 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 319 kr (før 415 kr = 23 %). CS-konceptets svenska
// källa påstod felaktigt 50 % rabatt — rättat till verklig 23 % genomgående (se STATUS.md).
// BE-ROAS 1,63 = 319/(319 − 11,37 EUR à 10,805183). Axels beslut 2026-08-29: allt ACTIVE.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Ukedosett NO | BE-ROAS 1,63 | 2026-09-05',
  link: 'https://beverbutikken.no/products/ukedosett-21-rom-morgen-middag-og-kveld-i-syv-dager',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-05/final/veckodosett', // relativt pipeline/
  adsets: [
    {
      name: 'Ukedosett NO - CS',
      copy: {
        message: '⏰ KUN I DAG: 23 % rabatt på ukedosetten!\nI morgen er prisen tilbake til 415 kr – ikke gå glipp av sjansen.\n🔥 23 % rabatt – kun i dag\n🔥 Lageret minker raskt\n🔥 Fri frakt ved bestilling i dag\nSikre deg en før den er utsolgt. Bestill nå 👇',
        headline: '23 % rabatt – kun i dag',
        description: 'Tilbudet gjelder kun i dag – lageret tar snart slutt.',
      },
      ads: [
        { name: 'Ukedosett_NO_CS_1', file: 'NO_veckodosett_CS_1.mp4' },
        { name: 'Ukedosett_NO_CS_2', file: 'NO_veckodosett_CS_2.mp4' },
        { name: 'Ukedosett_NO_CS_3', file: 'NO_veckodosett_CS_3.mp4' },
      ],
    },
    {
      name: 'Ukedosett NO - G',
      copy: {
        message: 'Leter du etter en gave som virkelig betyr noe? ❤️\nJeg ga denne til moren min – og jeg glemmer aldri ansiktet hennes da hun skjønte hvor mye enklere hverdagen skulle bli.\n✅ En gave som viser at du bryr deg\n✅ Hjelper dem å holde styr på medisinene – hver dag\n✅ Perfekt til mamma, pappa eller den du er glad i\nGi bort omtanke i dag – bestill nå 👇',
        headline: 'En gave hun bruker hver dag',
        description: 'Fylles én gang i uken – enklere hverdag for den du er glad i.',
      },
      ads: [
        { name: 'Ukedosett_NO_G_1', file: 'NO_veckodosett_G_1.mp4' },
        { name: 'Ukedosett_NO_G_2', file: 'NO_veckodosett_G_2.mp4' },
        { name: 'Ukedosett_NO_G_3', file: 'NO_veckodosett_G_3.mp4' },
      ],
    },
    {
      name: 'Ukedosett NO - PD',
      copy: {
        message: 'Glemmer du om du har tatt medisinen din? 🤔\nDenne ukedosetten gjør det umulig å gå glipp av en dose.\n✅ 21 rom – morgen, middag og kveld for hele uken\n✅ Fyll den én gang i uken, så er du klar\n✅ Sikkert lokk – ingenting faller ut i vesken\n✅ Tydelige rom, enkle å lese\nBestill din i dag og slutt å bekymre deg for medisinen. 👇',
        headline: 'Gå aldri glipp av en dose igjen',
        description: '21 rom for hele ukens medisin – enkelt og trygt.',
      },
      ads: [
        { name: 'Ukedosett_NO_PD_1', file: 'NO_veckodosett_PD_1.mp4' },
        { name: 'Ukedosett_NO_PD_2', file: 'NO_veckodosett_PD_2.mp4' },
        { name: 'Ukedosett_NO_PD_3', file: 'NO_veckodosett_PD_3.mp4' },
      ],
    },
    {
      name: 'Ukedosett NO - SP',
      copy: {
        message: '"Endelig slipper jeg å bekymre meg for om jeg har tatt medisinen." ⭐⭐⭐⭐⭐\nDet sier en av våre tusenvis av fornøyde kunder.\n✅ Enkel å fylle – én gang i uken\n✅ Tydelige rom for morgen, middag og kveld\n✅ Elsket av kunder i alle aldre\nSe hvorfor så mange har byttet til denne dosetten. 👇',
        headline: 'Tusenvis har byttet til denne',
        description: 'Vurdert av tusenvis av fornøyde kunder i Norge.',
      },
      ads: [
        { name: 'Ukedosett_NO_SP_1', file: 'NO_veckodosett_SP_1.mp4' },
        { name: 'Ukedosett_NO_SP_2', file: 'NO_veckodosett_SP_2.mp4' },
        { name: 'Ukedosett_NO_SP_3', file: 'NO_veckodosett_SP_3.mp4' },
      ],
    },
  ],
};
