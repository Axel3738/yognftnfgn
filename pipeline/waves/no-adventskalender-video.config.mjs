// Kampanj: Adventskalender Racerbiler NO — videobatch 2026-09-09 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-09 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 439 kr (før 579 = 24 %), 30 dagers åpent kjøp OK,
// INGEN fri frakt-claim (gränsen är 300 kr), inga leveranstidsclaims, ingen social proof-siffra
// (produkten är ny i Norge, inga norska recensioner finns).
// BE-ROAS 1,62 = 439/(439 − 15,69 EUR à 10,739949 NOK) — COGS ur batch-sheet #6, NORWAY-blocket.
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Adventskalender NO | BE-ROAS 1,62 | 2026-09-09',
  link: 'https://beverbutikken.no/products/adventskalender-racerbiler-24-biler-bak-24-luker',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-09/final/adventskalender', // relativt pipeline/
  adsets: [
    {
      name: 'Adventskalender NO - CS',
      copy: {
        message: '🎄 579 kr ned til 439 kr – 24 % rabatt\n🚗 24 biler bak 24 luker, én ny hver morgen i desember\n⏰ Begrenset lager, prisen gjelder ikke lenge\n✅ 30 dagers åpent kjøp\n👉 Bestill før den er utsolgt',
        headline: '579 kr → 439 kr i dag',
        description: '439 kr i dag, før 579 kr – 24 % rabatt',
      },
      ads: [
        { name: 'Adventskalender_NO_CS_1', file: 'NO_adventskalender_CS_1.mp4' },
        { name: 'Adventskalender_NO_CS_2', file: 'NO_adventskalender_CS_2.mp4' },
        { name: 'Adventskalender_NO_CS_3', file: 'NO_adventskalender_CS_3.mp4' },
      ],
    },
    {
      name: 'Adventskalender NO - G',
      copy: {
        message: '🎁 24 racerbiler i en fin gaveeske\n🎄 Klar til å legges rett under treet\n🌅 Ny bil bak luken hver morgen i desember\n😊 Et nytt smil, hver dag frem til julaften\n✅ 30 dagers åpent kjøp\n👉 Bestill julegaven i dag',
        headline: 'Julegaven med 24 biler i en eske',
        description: '24 biler i en gaveeske, klar til jul – 439 kr',
      },
      ads: [
        { name: 'Adventskalender_NO_G_1', file: 'NO_adventskalender_G_1.mp4' },
        { name: 'Adventskalender_NO_G_2', file: 'NO_adventskalender_G_2.mp4' },
        { name: 'Adventskalender_NO_G_3', file: 'NO_adventskalender_G_3.mp4' },
      ],
    },
    {
      name: 'Adventskalender NO - PD',
      copy: {
        message: '🚗 24 ekte racerbiler, én bak hver luke\n🍫 Ingen sjokolade som er borte på ti sekunder\n🎉 Dag 1: bilen kjører på kjøkkenbordet\n🚙 Dag 24: den stiller seg ved siden av de 23 andre\n✅ 30 dagers åpent kjøp\n👉 Se alle 24 bilene her',
        headline: '24 ekte biler, ikke sjokolade',
        description: '24 ekte biler bak lukene – kun 439 kr',
      },
      ads: [
        { name: 'Adventskalender_NO_PD_1', file: 'NO_adventskalender_PD_1.mp4' },
        { name: 'Adventskalender_NO_PD_2', file: 'NO_adventskalender_PD_2.mp4' },
        { name: 'Adventskalender_NO_PD_3', file: 'NO_adventskalender_PD_3.mp4' },
      ],
    },
    {
      name: 'Adventskalender NO - SP',
      copy: {
        message: '🍫 Sjokoladekalenderen er ofte tom 2. desember\n🚗 Denne varer helt frem til julaften – 24 biler, 24 luker\n🧒 Foreldre velger biler fordi barna faktisk leker med dem\n🌅 Ny bil bak luken hver morgen i desember\n✅ 30 dagers åpent kjøp\n👉 Bestill julekalenderen med biler',
        headline: '24 biler varer til jul, ikke bare dag 2',
        description: 'Sjokoladen tom dag 2 – denne varer til jul, 439 kr',
      },
      ads: [
        { name: 'Adventskalender_NO_SP_1', file: 'NO_adventskalender_SP_1.mp4' },
        { name: 'Adventskalender_NO_SP_2', file: 'NO_adventskalender_SP_2.mp4' },
        { name: 'Adventskalender_NO_SP_3', file: 'NO_adventskalender_SP_3.mp4' },
      ],
    },
  ],
};
