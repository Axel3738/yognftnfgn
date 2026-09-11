// se-carashell-video.config.mjs — CaraShell SE, byggd av /ny-annonser 2026-09-11.
//
// Källa: Bäverbutikens 16 ACTIVE-annonser i "Taköverdraget för Husvagn
// 6,5 × 3 m | BE ROAS 1.63 | Launch 2026-09-09" (MagiBorsten 1867947880635861,
// kampanj 120250147343350291). Samma bevisade creatives, ommärkta för
// CaraShell: egen sida, egen pixel, egen produktsida, egen copy.
// ⚠️ MÅLET är MagiBorsten DK 915422744950975 — OPS Factorys gemensamma konto.
// Kontot heter DK men bär alla OPS-butiker, och dess valuta är SEK.
// Förväxla ALDRIG med MagiBorsten 1867947880635861 (Bäverbutiken, källan).
//
// PRISET ÄR IDENTISKT: källan säljer 1 129 kr (jämförpris 1 469 kr, 23 %) och
// CaraShell gör detsamma (factory/produkter/takskyddet.yaml). Inga pristal har
// därför ändrats — varken i copy eller i bild. TankGuards fall (489/636 mot
// eget pris) är undantaget, inte regeln.
//
// DET SOM ÄNDRATS, yta för yta (factory/output/takskyddet/brand-detektor.md):
//   yta 1 copy   — "30 dagars öppet köp" → 14 dagars ångerrätt (SP-blocket),
//                  påhittat kundcitat → Lars riktiga recension, "fler och fler
//                  husvagnsägare" → 10 recensioner alla fem stjärnor,
//                  obelagda produktpåståenden ("rem och dragsko",
//                  "medföljande förvaringspåse") → belagd fästmetod och mått,
//                  falsk lagerbrist i CS → betalsätt, ångerrätt, leveranstid.
//                  Skriven av copy-subagent (sonnet) mot docs/copy-regler.md,
//                  tre-frågorstestet redovisat i output/takskyddet/copy-se.md.
//   yta 2 tal    — 0 av 12 svenska transkript säger "Bäverbutiken". CS_1/2/3
//                  sa "Trettio dagars öppet köp" och påstod lagerbrist —
//                  OMDUBBADE sv→sv 2026-09-11, röstkoll ✅ 3/3.
//   yta 3 inbränd— 0 av 12 videor bär brandtext (OCR var 0,3 s). Samma tre
//                  CS-videor bar däremot villkoren INBRÄNT i captionpillret;
//                  bytt med pipeline/no-precis.py, OCR-verifierat efteråt.
//   yta 4 bild   — 0 av 4 bildannonser tillskriver källbutiken. Ögongranskade.
//
// BE-ROAS 1,51 = 1129 / (1129 − 379,07), räknat UTAN moms enligt produktfilens
// ekonomi.moms_antagen: false (factory/ekonomi.mjs; butik.moms_i_pris styr
// prisvisningen och får aldrig avgöra en kill-linje).
// ✅ Inköpspriset är KVITTERAT av Axel 2026-09-11: 348,73 kr vara + 2,70 EUR
// tull (30,34 kr på ECB-dagskursen 11,2373) = 379,07 kr. Kampanjen hette
// "BE-ROAS 1,63" fram till dess — det talet var baklängesräknat ur källans
// namn och 57 kr för strängt. Namnet är ändå bara en etikett: budgetrond.mjs
// och skalning.mjs läser break-even ur produktfilen, aldrig ur kampanjnamnet.
//
// Allt föds PAUSED — VA:n granskar och Axel skriver "Launch: CaraShell".
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
  videoDir: '../.scratch/carashell/se/video',
  adsets: [
    {
      // PD — problem/demo. Källans toppspender (PD_2_H1: 1 799 kr, 6 köp, ROAS 3,77).
      name: 'CARASHELL_SE_Taköverdraget - PD',
      ads: [
        { name: 'CaraShellRoof_PD_2_H1', file: 'CaraShellRoof_PD_2_H1.mp4',
          copy: { message: 'Taket på husvagnen är den ytan du aldrig kollar – och den som kostar mest att laga. 🏕️\n✅ Skyddar mot regn, snö och UV hela vintern\n✅ Spänns fast med elastiska spännband som hakar under karossens kant – klart på minuter\n✅ En person klarar det helt själv\n✅ Täcker hela taket – kanten hänger ner 30–40 cm över sidorna\nSkydda husvagnens tak innan vintern gör det dyrt. 👇',
            headline: 'Husvagnstaket – helt skyddat i vinter', description: '' } },
        { name: 'CaraShellRoof_PD_1_H1', file: 'CaraShellRoof_PD_1_H1.mp4',
          copy: { message: 'Taket på husvagnen är den ytan du aldrig kollar – och den som kostar mest att laga. 🏕️\n✅ Skyddar mot regn, snö och UV hela vintern\n✅ Spänns fast med elastiska spännband som hakar under karossens kant – klart på minuter\n✅ En person klarar det helt själv\n✅ Täcker hela taket – kanten hänger ner 30–40 cm över sidorna\nSkydda husvagnens tak innan vintern gör det dyrt. 👇',
            headline: 'Husvagnstaket – helt skyddat i vinter', description: '' } },
        { name: 'CaraShellRoof_PD_3_H1', file: 'CaraShellRoof_PD_3_H1.mp4',
          copy: { message: 'Taket på husvagnen är den ytan du aldrig kollar – och den som kostar mest att laga. 🏕️\n✅ Skyddar mot regn, snö och UV hela vintern\n✅ Spänns fast med elastiska spännband som hakar under karossens kant – klart på minuter\n✅ En person klarar det helt själv\n✅ Täcker hela taket – kanten hänger ner 30–40 cm över sidorna\nSkydda husvagnens tak innan vintern gör det dyrt. 👇',
            headline: 'Husvagnstaket – helt skyddat i vinter', description: '' } },
      ],
    },
    {
      // GT — presenten. Copyn ORÖRD: inget brandnamn, inget pris, inga villkor.
      name: 'CARASHELL_SE_Taköverdraget - GT',
      ads: [
        { name: 'CaraShellRoof_GT_2_H1', file: 'CaraShellRoof_GT_2_H1.mp4',
          copy: { message: 'Han pratar om husvagnen som om den vore ett husdjur. 😅 I år hittade jag äntligen något han faktiskt blir glad för.\n🎁 Ett taköverdrag som skyddar hans husvagn hela vintern\n🎁 Något han faktiskt använder – om och om igen\n🎁 Levereras enkelt hem, klart att slå in\nGe en present som visar att du fattar vad han bryr sig om. 👇',
            headline: 'Presenten han faktiskt blir glad för', description: '' } },
        { name: 'CaraShellRoof_GT_1_H1', file: 'CaraShellRoof_GT_1_H1.mp4',
          copy: { message: 'Han pratar om husvagnen som om den vore ett husdjur. 😅 I år hittade jag äntligen något han faktiskt blir glad för.\n🎁 Ett taköverdrag som skyddar hans husvagn hela vintern\n🎁 Något han faktiskt använder – om och om igen\n🎁 Levereras enkelt hem, klart att slå in\nGe en present som visar att du fattar vad han bryr sig om. 👇',
            headline: 'Presenten han faktiskt blir glad för', description: '' } },
        { name: 'CaraShellRoof_GT_3_H1', file: 'CaraShellRoof_GT_3_H1.mp4',
          copy: { message: 'Han pratar om husvagnen som om den vore ett husdjur. 😅 I år hittade jag äntligen något han faktiskt blir glad för.\n🎁 Ett taköverdrag som skyddar hans husvagn hela vintern\n🎁 Något han faktiskt använder – om och om igen\n🎁 Levereras enkelt hem, klart att slå in\nGe en present som visar att du fattar vad han bryr sig om. 👇',
            headline: 'Presenten han faktiskt blir glad för', description: '' } },
      ],
    },
    {
      // SP — social proof. Citatet och villkoret bytta; talet är rent.
      name: 'CARASHELL_SE_Taköverdraget - SP',
      ads: [
        { name: 'CaraShellRoof_SP_2_H1', file: 'CaraShellRoof_SP_2_H1.mp4',
          copy: { message: '"Passar bra och skyddar taket mot väder." – Lars 🙌\nEtt av 16 omdömen om vårt taköverdrag – alla fem stjärnor.\n✅ Skyddar taket mot regn, snö och smuts\n✅ En person sätter på det själv – ingen hjälp behövs\n✅ 14 dagars ångerrätt enligt svensk lag\nLäs varför husvagnsägare väljer det här inför varje vinter. 👇',
            headline: 'Taköverdraget kunderna ger 5 stjärnor', description: '' } },
        { name: 'CaraShellRoof_SP_3_H1', file: 'CaraShellRoof_SP_3_H1.mp4',
          copy: { message: '"Passar bra och skyddar taket mot väder." – Lars 🙌\nEtt av 16 omdömen om vårt taköverdrag – alla fem stjärnor.\n✅ Skyddar taket mot regn, snö och smuts\n✅ En person sätter på det själv – ingen hjälp behövs\n✅ 14 dagars ångerrätt enligt svensk lag\nLäs varför husvagnsägare väljer det här inför varje vinter. 👇',
            headline: 'Taköverdraget kunderna ger 5 stjärnor', description: '' } },
        { name: 'CaraShellRoof_SP_1_H1', file: 'CaraShellRoof_SP_1_H1.mp4',
          copy: { message: '"Passar bra och skyddar taket mot väder." – Lars 🙌\nEtt av 16 omdömen om vårt taköverdrag – alla fem stjärnor.\n✅ Skyddar taket mot regn, snö och smuts\n✅ En person sätter på det själv – ingen hjälp behövs\n✅ 14 dagars ångerrätt enligt svensk lag\nLäs varför husvagnsägare väljer det här inför varje vinter. 👇',
            headline: 'Taköverdraget kunderna ger 5 stjärnor', description: '' } },
      ],
    },
    {
      // CS — erbjudandet. ALLA TRE ÄR OMDUBBADE 2026-09-11, inte kopierade:
      // källans tal sa "Trettio dagars öppet köp" (CaraShell har 14 dagars
      // ångerrätt) och påstod lagerbrist butiken inte har — och samma rader
      // stod INBRÄNDA i captionpillret. HeyGen byter bara ljudet, så båda
      // ytorna åtgärdades: sv→sv-omdubb via pipeline/translate-batch.mjs
      // (proofread → rättad SRT → render) + pipeline/no-precis.py som bytte
      // captiontexten i sin egen ruta. Priset 1469→1129 kr är ORÖRT.
      // Röstkoll ✅ 3/3 (pipeline/rostkoll.py), OCR bekräftar att "30 dagars
      // öppet köp", "lagret" och "slut i lager" är borta ur bild.
      // ⚠️ Grönt röstkoll är inte "godkänd" — någon måste LYSSNA före launch.
      name: 'CARASHELL_SE_Taköverdraget - CS',
      ads: [
        { name: 'CaraShellRoof_CS_2_H1', file: 'CaraShellRoof_CS_2_H1.mp4',
          copy: { message: '🔥 23% RABATT PÅ HUSVAGNENS TAKÖVERDRAG – IDAG 🔥\n1469 kr → 1129 kr\nBetala med Klarna, kort, Apple Pay eller Google Pay – och 14 dagars ångerrätt om det inte passar.\nVintern kommer oavsett – se till att taket är skyddat innan det är för sent.\nBeställ nu – leverans på 5–10 arbetsdagar. 👇',
            headline: 'Husvagnstaket – helt skyddat i vinter', description: '' } },
        { name: 'CaraShellRoof_CS_1_H1', file: 'CaraShellRoof_CS_1_H1.mp4',
          copy: { message: '🔥 23% RABATT PÅ HUSVAGNENS TAKÖVERDRAG – IDAG 🔥\n1469 kr → 1129 kr\nBetala med Klarna, kort, Apple Pay eller Google Pay – och 14 dagars ångerrätt om det inte passar.\nVintern kommer oavsett – se till att taket är skyddat innan det är för sent.\nBeställ nu – leverans på 5–10 arbetsdagar. 👇',
            headline: 'Husvagnstaket – helt skyddat i vinter', description: '' } },
        { name: 'CaraShellRoof_CS_3_H1', file: 'CaraShellRoof_CS_3_H1.mp4',
          copy: { message: '🔥 23% RABATT PÅ HUSVAGNENS TAKÖVERDRAG – IDAG 🔥\n1469 kr → 1129 kr\nBetala med Klarna, kort, Apple Pay eller Google Pay – och 14 dagars ångerrätt om det inte passar.\nVintern kommer oavsett – se till att taket är skyddat innan det är för sent.\nBeställ nu – leverans på 5–10 arbetsdagar. 👇',
            headline: 'Husvagnstaket – helt skyddat i vinter', description: '' } },
      ],
    },
  ],
};
