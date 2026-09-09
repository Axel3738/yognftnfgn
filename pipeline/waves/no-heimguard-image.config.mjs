// no-heimguard-image.config.mjs — HeimGuard NORGE, byggd av /ny-annonser 2026-09-09.
//
// Källa: Bäverbutikens ACTIVE-annonser i "Overvåkingskamera NO | BE-ROAS 1,40"
// (Magiborsten NO 1050941584152547). MÅLET är MagiBorsten DK 915422744950975 —
// OPS Factorys gemensamma konto, samma som den svenska kampanjen.
// ⚠️ Kontot heter DK, valutan är SEK, och det bär ALLA OPS-butiker.
//
// ⚠️ PRISET ÄR OMRÄKNAT. Källan säljer 899 / 1 169 NOK på beverbutikken.no.
// HeimGuards norska sida tar 799 / 1 000 kr (läst ur
// heimguard.se/nb/products/overvakningskameran.json 2026-09-09) — och gör det
// fortfarande i SEK, inte NOK. All copy använder butikens egna tal, aldrig
// källans. "Spar 270 kr" är omräknat till "spar 201 kr".
// ⚠️ NOK är ännu inte påslaget i Shopify: norrmän ser "799,00 kr" och betalar
// SEK. Slås NOK på ändras talen på sidan och copyn måste räknas om.
//
// Fraktgränsen "over 300 kr" är struken — HeimGuard har fri frakt till Norge
// utan beloppsgräns. Tre källannonser sa "en kunde hos baverbutiken.se";
// den attributionen är borta.
//
// Copyn skriven på bokmål av copy-subagent (sonnet) mot docs/copy-regler.md.
// Allt föds PAUSED — VA:n granskar och sätter ACTIVE.
export default {
  act: 'act_915422744950975',
  page: '1262406533629248',   // HeimGuard — samma sida som den svenska kampanjen
  pixel: '1125401473242596',  // HeimGuard-pixeln
  country: 'NO',
  campaignName: 'HEIMGUARD_NO_Overvåkingskamera | BE-ROAS 2,11 | 2026-09-09',
  link: 'https://heimguard.se/nb/products/overvakningskameran',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO
  campaignStatus: 'PAUSED',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  adsets: [
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - SP', // SP — sosialt bevis
      ads: [
        { adName: "HeimGuard_NO_SP_2_1", img: "HeimGuard_NO_SP_2_1.jpg",
          copy: { message: "Falske alarmer stjeler nattesøvn. Ekte AI-sporing gir den tilbake.\n✅ To linser som dekker hele tomten\n✅ AI som bare varsler når det gjelder\n✅ Direkte varsling i mobilen uansett hvor du er\n✅ 30 dagers åpent kjøp\n\nAI-en skiller mennesker fra dyr og greiner – varselet betyr noe når det kommer.\nSe hele tomten – handle nå.",
                  headline: "", description: "" } },
        { adName: "HeimGuard_NO_SP_7_1", img: "HeimGuard_NO_SP_7_1.jpg",
          copy: { message: "Lyden om natten kjenner du igjen på skjermen, ikke i mørket.\nAI-sporingen skiller menneske fra katt — færre falske alarmer.\n799 kr. 30 dagers garanti.",
                  headline: "", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - PD', // PD — problem/løsning
      ads: [
        { adName: "HeimGuard_NO_PD_4_1", img: "HeimGuard_NO_PD_4_1.jpg",
          copy: { message: "Én linse for dagslys, én for mørke — like skarpt begge ganger. 355° dekning betyr at den svinger dit bevegelsen er. 799 kr. 30 dagers garanti.",
                  headline: "", description: "" } },
        { adName: "HeimGuard_NO_PD_2_1", img: "HeimGuard_NO_PD_2_1.jpg",
          copy: { message: "En lyd på tomten klokken tre om natten. Er det katten – eller noe annet?\n✅ To linser, 355° dekning – ingen blindsoner\n✅ AI som skiller mennesker fra katter og greiner\n✅ Varsler bare ved reelle trusler – ingen falske alarmer\n✅ Direkte varsling i mobilen uansett hvor du er\n\nSlutt å gjette hva som skjer hjemme. Se det.\nBestill din i dag.",
                  headline: "", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - G', // G — gave
      ads: [
        { adName: "HeimGuard_NO_G_2_1", img: "HeimGuard_NO_G_2_1.jpg",
          copy: { message: "Jeg visste akkurat hva han ville bli glad for.\nHan har snakket om et kamera ved garasjen i månedsvis. Jeg lyttet – og bestilte et til ham.\n✅ Ingen komplisert installasjon – bare app, wifi, ferdig\n✅ En gave han faktisk trenger\n✅ 30 dagers åpent kjøp\n\nNå får han varsel i mobilen med en gang noen er ved garasjen – ikke en gjetning lenger.\nGi bort trygghet i dag.",
                  headline: "", description: "" } },
      ],
    },
  ],
};
