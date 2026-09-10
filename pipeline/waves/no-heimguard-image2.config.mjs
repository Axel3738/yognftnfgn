// no-heimguard-image2.config.mjs — HeimGuard NORGE, omgång 2: de bildannonser
// vars INBRÄNDA pris och fraktgräns rättats 2026-09-09.
//
// Källbilderna visade 899 / 1 169 kr och "Gratis frakt over 300 kr". Butiken tar
// 799 / 1 000 kr och har fri frakt utan beloppsgräns. Texten byttes med
// pipeline/oversatt-bild.py och BOXMETODEN — {"box":[x0,y0,x1,y1]} rör bara sin
// egen rektangel, så noll pixlar utanför ändrades. Varje bild är granskad av en
// oberoende agent mot originalet.
//
// ⚠️ Använd ALDRIG {"form":N,"rad":K} här: den suddar hela formen och ritar om
// varje rad, vilket flyttar texten några pixlar och lämnar de gröna bockarna
// hängande ovanför sin rad. Sex bilder underkändes på exakt det.
//
// Tre bilder kom INTE med och ligger i factory/output/overvakningskameran/
// KO-ATERSTAR.md: CS_4_1, CS_5_1 och BOF_2_1 — suddet lämnade spökbilder eller
// deformerade en glyf. De sitter med text direkt på fotot utan platta, vilket är
// kie.ai-reservens fall, inte formdetektorns.
//
// Samma kampanj och adsetnamn som no-heimguard-video.config.mjs — skripten
// återanvänder båda på namn, så annonserna hamnar i den befintliga strukturen.
export default {
  act: 'act_915422744950975',
  page: '1262406533629248',
  pixel: '1125401473242596',
  country: 'NO',
  campaignName: 'HEIMGUARD_NO_Overvåkingskamera | BE-ROAS 2,11 | 2026-09-09',
  link: 'https://heimguard.se/nb/products/overvakningskameran',
  dailyBudget: '100000',
  campaignStatus: 'PAUSED',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  adsets: [
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - LI', // LI — lista
      ads: [
        { adName: "HeimGuard_NO_LI_1_1", img: "HeimGuard_NO_LI_1_1.jpg",
          copy: { message: "De fleste kameraer klarer ett eller to av punktene.\nDette har dobbel linse, AI-sporing, varsel, værbeskyttelse og garanti — samtidig.\n799 kr (ord. 1 000 kr).",
                  headline: "", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - CO', // CO — sammenligning
      ads: [
        { adName: "HeimGuard_NO_CO_2_1", img: "HeimGuard_NO_CO_2_1.jpg",
          copy: { message: "Et fast kamera filmer det samme hjørnet i evighet.\nDette svinger 355° og følger bevegelsen dit den går.\n799 kr (ord. 1 000 kr). 30 dagers garanti.",
                  headline: "", description: "" } },
        { adName: "HeimGuard_NO_CO_3_1", img: "HeimGuard_NO_CO_3_1.jpg",
          copy: { message: "Gammelt kamera mot AI-kamera. To linser, 355° dekning, skiller menneske fra kjæledyr. 30 dagers garanti. Se forskjellen i din egen hage.",
                  headline: "", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - CS', // CS — tilbudet
      ads: [
        { adName: "HeimGuard_NO_CS_2_1", img: "HeimGuard_NO_CS_2_1.jpg",
          copy: { message: "799 kr i stedet for 1 000 kr — for et kamera som skiller mennesker fra dyr, ikke bare bevegelse.\n✅ 20 % rabatt fra normalpris\n✅ Klarna – få det nå, betal senere\n✅ Fri frakt\n✅ 30 dagers åpent kjøp\n\nIngen kode, ingen krøll – bare fast lav pris.\nKjøp nå.",
                  headline: "", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - BOF', // BOF — garanti
      ads: [
        { adName: "HeimGuard_NO_BOF_1_1", img: "HeimGuard_NO_BOF_1_1.jpg",
          copy: { message: "799 kr i stedet for 1 000 kr. Kameraet har to linser og AI som skiller mellom mennesker og kjæledyr.",
                  headline: "", description: "" } },
        { adName: "HeimGuard_NO_BOF_3_1", img: "HeimGuard_NO_BOF_3_1.jpg",
          copy: { message: "To linser, 355° dekning og en AI som skiller menneske fra dyr. Ikke fornøyd likevel? Send kameraet tilbake innen 30 dager – du får hele summen tilbake.",
                  headline: "", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - RI', // RI — varselet
      ads: [
        { adName: "HeimGuard_NO_RI_2_1", img: "HeimGuard_NO_RI_2_1.jpg",
          copy: { message: "Varselet kommer før du rekker å lure.\nDobbel linse og AI-sporing ser det øyet går glipp av.\n799 kr (ord. 1 000 kr). 30 dagers garanti.",
                  headline: "", description: "" } },
      ],
    },
  ],
};
