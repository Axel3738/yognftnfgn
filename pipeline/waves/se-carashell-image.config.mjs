// se-carashell-image.config.mjs — CaraShell SE, bildhalvan. /ny-annonser 2026-09-11.
//
// Körs mot SAMMA campaignName och SAMMA adsetnamn som se-carashell-video.config.mjs
// — båda skripten återanvänder kampanj och adsets på namn, så bild och video
// hamnar i samma adset i stället för i två parallella strukturer (FAS2 uppdrag B).
//
// Fyra bildannonser, en per koncept. Två är kopierade ORÖRDA, två är fixade:
//   CaraShellRoof_PD_2_1  ren  — "REGNET SKA INTE FÅ FÖRSTÖRA TAKET" — orörd
//   CaraShellRoof_GT_2_1  ren  — "DEN PERFEKTA PRESENTEN…"          — orörd
//   CaraShellRoof_SP_2_1  FIXAD — bandet lovade "30 dagars öppet köp – full
//        återbetalning" (CaraShell har 14 dagars ångerrätt) och bar ett citat
//        från "Verifierad kund, 58 år" som inte finns bland butikens tio
//        recensioner. Båda bytta; gröna CTA-knappen orörd.
//        QA före/efter: factory/output/takskyddet/bilder/*.qa.png
//   CaraShellRoof_CS_2_1  FIXAD — "Begränsat lager – slut när det är slut" och
//        "[ Köp innan det tar slut ]" är påståenden butiken inte kan stå bakom
//        (ingen lagerbegränsning) och som butikens egen brandkonfig förbjuder.
//        Bytta mot butikens verkliga villkor. PRISET 1469→1129 kr är ORÖRT —
//        det är identiskt med CaraShells eget.
export default {
  act: 'act_915422744950975', // MagiBorsten DK = OPS Factory (SEK)
  page: '1381171778405935',   // CaraShell
  pixel: '28589207184025756', // CaraShell-pixeln
  country: 'SE',
  campaignName: 'CARASHELL_SE_Taköverdraget | BE-ROAS 1,51 | 2026-09-11',
  link: 'https://carashell.se/products/takskyddet',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO
  campaignStatus: 'PAUSED',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  adsets: [
    {
      name: 'CARASHELL_SE_Taköverdraget - PD',
      ads: [
        { adName: 'CaraShellRoof_PD_2_1', img: 'CaraShellRoof_PD_2_1.jpg',
          copy: { message: 'Taket på husvagnen är den ytan du aldrig kollar – och den som kostar mest att laga. 🏕️\n✅ Skyddar mot regn, snö och UV hela vintern\n✅ Spänns fast med elastiska spännband som hakar under karossens kant – klart på minuter\n✅ En person klarar det helt själv\n✅ Täcker hela taket – kanten hänger ner 30–40 cm över sidorna\nSkydda husvagnens tak innan vintern gör det dyrt. 👇',
            headline: 'Husvagnstaket – helt skyddat i vinter', description: 'Enkelt taköverdrag, 6,5 × 3 m. Fri frakt.' } },
      ],
    },
    {
      name: 'CARASHELL_SE_Taköverdraget - GT',
      ads: [
        { adName: 'CaraShellRoof_GT_2_1', img: 'CaraShellRoof_GT_2_1.jpg',
          copy: { message: 'Han pratar om husvagnen som om den vore ett husdjur. 😅 I år hittade jag äntligen något han faktiskt blir glad för.\n🎁 Ett taköverdrag som skyddar hans husvagn hela vintern\n🎁 Något han faktiskt använder – om och om igen\n🎁 Levereras enkelt hem, klart att slå in\nGe en present som visar att du fattar vad han bryr sig om. 👇',
            headline: 'Presenten han faktiskt blir glad för', description: 'Perfekt present till husvagnsägaren. Fri frakt.' } },
      ],
    },
    {
      name: 'CARASHELL_SE_Taköverdraget - SP',
      ads: [
        { adName: 'CaraShellRoof_SP_2_1', img: 'CaraShellRoof_SP_2_1.jpg',
          copy: { message: '"Passar bra och skyddar taket mot väder." – Lars 🙌\nEtt av 10 omdömen om vårt taköverdrag – alla fem stjärnor.\n✅ Skyddar taket mot regn, snö och smuts\n✅ En person sätter på det själv – ingen hjälp behövs\n✅ 14 dagars ångerrätt enligt svensk lag\nLäs varför husvagnsägare väljer det här inför varje vinter. 👇',
            headline: 'Taköverdraget kunderna ger 5 stjärnor', description: 'Betygsatt av riktiga kunder. Fri frakt.' } },
      ],
    },
    {
      // CS-adsetet skapas HÄR. De tre CS-videorna läggs till i samma adset när
      // omdubbningen är klar — aldrig i ett nytt adset bredvid.
      name: 'CARASHELL_SE_Taköverdraget - CS',
      ads: [
        { adName: 'CaraShellRoof_CS_2_1', img: 'CaraShellRoof_CS_2_1.jpg',
          copy: { message: '🔥 23% RABATT PÅ HUSVAGNENS TAKÖVERDRAG – IDAG 🔥\n1469 kr → 1129 kr\nBetala med Klarna, kort, Apple Pay eller Google Pay – och 14 dagars ångerrätt om det inte passar.\nVintern kommer oavsett – se till att taket är skyddat innan det är för sent.\nBeställ nu – leverans på 5–10 arbetsdagar. 👇',
            headline: 'Husvagnstaket – helt skyddat i vinter', description: '23% rabatt just nu. Fri frakt till Sverige och Norge.' } },
      ],
    },
  ],
};
