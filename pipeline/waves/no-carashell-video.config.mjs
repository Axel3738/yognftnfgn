// no-carashell-video.config.mjs — CaraShell NO, byggd av /ny-annonser 2026-09-11.
//
// Källa: Bäverbutikens 12 ACTIVE-annonser i "Takovertrekk Campingvogn NO |
// BE-ROAS 1,62 | 2026-09-11" (Magiborsten NO 1050941584152547, kampanj
// 120252183519570233). Produkten heter INTE samma sak på norska —
// `Takovertrekk_NO_*` mot svenskans `Takoverdrag_*` — därför bär produktfilen
// ett eget kalla.no_kampanjmonster. Utan det faller kallannonser.mjs tillbaka
// på DryTreks mönster och läser fel produkt.
//
// ⚠️ MÅLET är samma konto som den svenska kampanjen: MagiBorsten DK
// 915422744950975 (SEK). Skillnaden mot SE är geo, språk och landningssida.
//
// ⚠️ NIO ANNONSER, INTE TOLV. CS-konceptets tre videor (CS_1, CS_2, CS_3) är
// HÅLLNA. De läser upp och visar en NOK-pris ("Ordinær pris 1469 kroner. I dag
// 1129 kroner", annonstexten säger 1549 → 1189) och lovar "Tretti dagers åpent
// kjøp". CaraShells norska marknad har ännu inga NOK-paketnivåer — butiken
// säljer i SEK på /nb (factory/butiker/carashell.yaml: marknader[0].valuta SEK)
// — och butiken har 14 dagars ångerrätt, inte 30. Ett NOK-tal i en norsk annons
// räknar alltså fel mot landningssidan. De tre står namngivna i räkningen med
// orsak; de laddas upp när Axel slagit på NOK och satt paketnivåerna.
//
// Copyn är skriven på BOKMÅL av en copy-subagent (sonnet) mot
// docs/copy-regler.md — aldrig översatt rakt av från svenskan. Tre-frågorstestet
// redovisas i factory/output/takskyddet/copy-no.md. Ingen norsk annons nämner
// pris, eftersom butiken inte har satt något i NOK.
//
// Allt föds PAUSED.
export default {
  act: 'act_915422744950975', // MagiBorsten DK = OPS Factory (SEK) — samma som SE
  page: '1381171778405935',   // CaraShell — samma sida som SE
  pixel: '28589207184025756', // CaraShell-pixeln — samma pixel som SE
  country: 'NO',
  campaignName: 'CARASHELL_NO_Takovertrekket | BE-ROAS 1,63 | 2026-09-11',
  link: 'https://carashell.se/nb/products/takskyddet',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO. Kontots valuta är SEK.
  campaignStatus: 'PAUSED',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  videoDir: '../.scratch/carashell/no/video',
  adsets: [
    {
      // PD — problem/demo.
      name: 'CARASHELL_NO_Takovertrekket - PD',
      ads: [
        { name: 'CaraShellRoof_NO_PD_1', file: 'CaraShellRoof_NO_PD_1.mp4',
          copy: { message: 'Taket på campingvogna er flaten du aldri sjekker – og den som koster mest å reparere. 🏕️\n✅ Beskytter mot regn, snø og UV hele vinteren\n✅ Elastiske stropper med plasthaker hektes under karosseriens kant – klart på minutter\n✅ Én person klarer det helt alene\n✅ Dekker hele takflaten, med kanten hengende ca. 30–40 cm ned over sidene\nBeskytt campingvogntaket før vinteren gjør det dyrt. 👇',
            headline: 'Campingvogntaket – helt beskyttet i vinter', description: '' } },
        { name: 'CaraShellRoof_NO_PD_3', file: 'CaraShellRoof_NO_PD_3.mp4',
          copy: { message: 'Taket på campingvogna er flaten du aldri sjekker – og den som koster mest å reparere. 🏕️\n✅ Beskytter mot regn, snø og UV hele vinteren\n✅ Elastiske stropper med plasthaker hektes under karosseriens kant – klart på minutter\n✅ Én person klarer det helt alene\n✅ Dekker hele takflaten, med kanten hengende ca. 30–40 cm ned over sidene\nBeskytt campingvogntaket før vinteren gjør det dyrt. 👇',
            headline: 'Campingvogntaket – helt beskyttet i vinter', description: '' } },
        { name: 'CaraShellRoof_NO_PD_2', file: 'CaraShellRoof_NO_PD_2.mp4',
          copy: { message: 'Taket på campingvogna er flaten du aldri sjekker – og den som koster mest å reparere. 🏕️\n✅ Beskytter mot regn, snø og UV hele vinteren\n✅ Elastiske stropper med plasthaker hektes under karosseriens kant – klart på minutter\n✅ Én person klarer det helt alene\n✅ Dekker hele takflaten, med kanten hengende ca. 30–40 cm ned over sidene\nBeskytt campingvogntaket før vinteren gjør det dyrt. 👇',
            headline: 'Campingvogntaket – helt beskyttet i vinter', description: '' } },
      ],
    },
    {
      // SP — sosialt bevis. Sitatet og angreretten byttet.
      name: 'CARASHELL_NO_Takovertrekket - SP',
      ads: [
        { name: 'CaraShellRoof_NO_SP_1', file: 'CaraShellRoof_NO_SP_1.mp4',
          copy: { message: '"Veldig fornøyd. God beskyttelse når campingvogna står ute." – Johan 🙌\nDet er ikke bare Johan – vi har 10 anmeldelser, alle på 5 av 5 stjerner.\n✅ Beskytter taket mot regn, snø og skitt\n✅ Én person setter det på selv – ingen hjelp nødvendig\n✅ 14 dagers angrerett hvis du ikke er fornøyd\nLes hvorfor campingvogneiere velger dette før hver vinter. 👇',
            headline: '10 av 10 anmeldelser: 5 stjerner', description: '' } },
        { name: 'CaraShellRoof_NO_SP_2', file: 'CaraShellRoof_NO_SP_2.mp4',
          copy: { message: '"Veldig fornøyd. God beskyttelse når campingvogna står ute." – Johan 🙌\nDet er ikke bare Johan – vi har 10 anmeldelser, alle på 5 av 5 stjerner.\n✅ Beskytter taket mot regn, snø og skitt\n✅ Én person setter det på selv – ingen hjelp nødvendig\n✅ 14 dagers angrerett hvis du ikke er fornøyd\nLes hvorfor campingvogneiere velger dette før hver vinter. 👇',
            headline: '10 av 10 anmeldelser: 5 stjerner', description: '' } },
        { name: 'CaraShellRoof_NO_SP_3', file: 'CaraShellRoof_NO_SP_3.mp4',
          copy: { message: '"Veldig fornøyd. God beskyttelse når campingvogna står ute." – Johan 🙌\nDet er ikke bare Johan – vi har 10 anmeldelser, alle på 5 av 5 stjerner.\n✅ Beskytter taket mot regn, snø og skitt\n✅ Én person setter det på selv – ingen hjelp nødvendig\n✅ 14 dagers angrerett hvis du ikke er fornøyd\nLes hvorfor campingvogneiere velger dette før hver vinter. 👇',
            headline: '10 av 10 anmeldelser: 5 stjerner', description: '' } },
      ],
    },
    {
      // G — gaven. Copyen URØRT: ingen merkevare, ingen pris, ingen vilkår.
      name: 'CARASHELL_NO_Takovertrekket - G',
      ads: [
        { name: 'CaraShellRoof_NO_G_2', file: 'CaraShellRoof_NO_G_2.mp4',
          copy: { message: 'Han snakker om campingvogna som om den var et kjæledyr. 😅 I år fant jeg endelig noe han faktisk blir glad for.\n🎁 Et takovertrekk som beskytter campingvogna hele vinteren\n🎁 Noe han faktisk bruker – gang på gang\n🎁 Leveres rett hjem, klart til å pakkes inn\nGi en gave som viser at du skjønner hva han bryr seg om. 👇',
            headline: 'Gaven han faktisk blir glad for', description: '' } },
        { name: 'CaraShellRoof_NO_G_3', file: 'CaraShellRoof_NO_G_3.mp4',
          copy: { message: 'Han snakker om campingvogna som om den var et kjæledyr. 😅 I år fant jeg endelig noe han faktisk blir glad for.\n🎁 Et takovertrekk som beskytter campingvogna hele vinteren\n🎁 Noe han faktisk bruker – gang på gang\n🎁 Leveres rett hjem, klart til å pakkes inn\nGi en gave som viser at du skjønner hva han bryr seg om. 👇',
            headline: 'Gaven han faktisk blir glad for', description: '' } },
        { name: 'CaraShellRoof_NO_G_1', file: 'CaraShellRoof_NO_G_1.mp4',
          copy: { message: 'Han snakker om campingvogna som om den var et kjæledyr. 😅 I år fant jeg endelig noe han faktisk blir glad for.\n🎁 Et takovertrekk som beskytter campingvogna hele vinteren\n🎁 Noe han faktisk bruker – gang på gang\n🎁 Leveres rett hjem, klart til å pakkes inn\nGi en gave som viser at du skjønner hva han bryr seg om. 👇',
            headline: 'Gaven han faktisk blir glad for', description: '' } },
      ],
    },
  ],
};
