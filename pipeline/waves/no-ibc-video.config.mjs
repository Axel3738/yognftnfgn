// Kampanj: IBC-tanktrekk 1000 L NO — videobatch 2026-08-29 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-08-29 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 439 kr (før 571 = 23 %), fri frakt OK (över 300 kr),
// 210D Oxford (INTE 420D). BE-ROAS 1,63 = 439/(439 − 15,63 EUR à 10,86).
// Svenska CS-priserna 489/636 ersatta med verkliga norska 439/571.
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
// OBS: uppdatera datumet i campaignName till FAKTISKT launchdatum innan körning.
// OBS: CS_1_H1 saknas i Drive-mappen (bara H2+H3 uppladdade av redigerarna).
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'IBC-tanktrekk NO | BE-ROAS 1,63 | 2026-08-29',
  link: 'https://beverbutikken.no/products/ibc-tanktrekk-1000-l-stopper-alger-uv',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-08-29/final/ibc', // relativt pipeline/
  adsets: [
    {
      name: 'IBC-tanktrekk NO - PD',
      copy: {
        message: 'Lei av grønt, algefylt regnvann? 💧\nDette trekket blokkerer sollys og UV helt — så vannet i IBC-tanken din holdes klart, og tanken slites ikke ut før tiden.\n✓ Kraftig 210D Oxford-stoff\n✓ Enkel glidelås — klart på 2 minutter\n✓ Åpning på toppen, du kommer fortsatt til lokket\nBeskytt tanken din i dag 👇',
        headline: 'Klart vann. Ingen alger. Enkelt.',
        description: 'Passer standard 1000 L IBC-tank.',
      },
      ads: [
        { name: 'IBC-tanktrekk_NO_PD_1_H1', file: 'NO_ibc_PD_1_H1.mp4' },
        { name: 'IBC-tanktrekk_NO_PD_1_H2', file: 'NO_ibc_PD_1_H2.mp4' },
        { name: 'IBC-tanktrekk_NO_PD_1_H3', file: 'NO_ibc_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'IBC-tanktrekk NO - SP',
      copy: {
        message: '"Endelig klart vann i tanken — ingen alger hele sommeren!" ⭐⭐⭐⭐⭐\nHundrevis av hageeiere har allerede byttet ut den gamle, algete tanken sin mot en beskyttet en.\n✓ Blokkerer UV og sol helt\n✓ Sitter perfekt med glidelås\n✓ Du kommer fortsatt til lokket\nSe hvorfor kundene elsker det 👇',
        headline: 'Klart vann hele sommeren',
        description: 'Vurdert av ekte hageeiere.',
      },
      ads: [
        { name: 'IBC-tanktrekk_NO_SP_1_H1', file: 'NO_ibc_SP_1_H1.mp4' },
        { name: 'IBC-tanktrekk_NO_SP_1_H2', file: 'NO_ibc_SP_1_H2.mp4' },
        { name: 'IBC-tanktrekk_NO_SP_1_H3', file: 'NO_ibc_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'IBC-tanktrekk NO - CS',
      copy: {
        message: '⏰ TIDSBEGRENSET TILBUD — 23 % RABATT\n439 kr i stedet for 571 kr. Tilbudet gjelder en begrenset periode.\nLageret krymper raskt — mange har allerede bestilt før sommeren.\nIngen alger. Ingen sprø plast. Bare et tykt, beskyttende trekk til IBC-tanken din.\nIkke gå glipp av det — bestill før det er tomt 👇',
        headline: 'Beskytt tanken før sommeren',
        description: '439 kr nå — ordinær pris 571 kr.',
      },
      ads: [
        { name: 'IBC-tanktrekk_NO_CS_1_H2', file: 'NO_ibc_CS_1_H2.mp4' },
        { name: 'IBC-tanktrekk_NO_CS_1_H3', file: 'NO_ibc_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'IBC-tanktrekk NO - GT',
      copy: {
        message: 'Kjenner du noen som har klaget på alger i IBC-tanken sin i flere somre? 🎁\nJeg ga mannen min dette trekket — uten å si noe. Han trodde jeg hadde glemt problemet.\nNå viser han frem tanken til alle naboene.\nNoen ganger er den beste gaven den som løser noe de allerede har brydd seg om lenge.\nFinn den perfekte gaven 👇',
        headline: 'Gaven han faktisk bruker',
        description: 'Enkel gave. Stor verdsettelse.',
      },
      ads: [
        { name: 'IBC-tanktrekk_NO_GT_1_H1', file: 'NO_ibc_GT_1_H1.mp4' },
        { name: 'IBC-tanktrekk_NO_GT_1_H2', file: 'NO_ibc_GT_1_H2.mp4' },
        { name: 'IBC-tanktrekk_NO_GT_1_H3', file: 'NO_ibc_GT_1_H3.mp4' },
      ],
    },
  ],
};
