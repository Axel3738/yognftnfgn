// no-heimguard-no-video.config.mjs — HeimGuard NORGE, byggd av /ny-annonser 2026-09-09.
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
  videoDir: '../.scratch/heimguard/no/video',
  adsets: [
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - CS', // CS — tilbudet
      ads: [
        { name: "HeimGuard_NO_CS_6_H1", file: "HeimGuard_NO_CS_6_H1.mp4",
          copy: { message: "Tre personer i bildet. En hund ved siden av.\nKameraet varsler for personene – ikke for hunden.\nTo linser. Tre hundre og femtifem grader. Hele tomten.\n799 kr i stedet for 1 000 kr.",
                  headline: "Varsler for folk. Ikke for hunden.", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - AU', // AU — autoritet
      ads: [
        { name: "HeimGuard_NO_AU_1_H1", file: "HeimGuard_NO_AU_1_H1.mp4",
          copy: { message: "To linser, 355° dekning, AI som skiller mennesker fra dyr.\nKobles til WiFi 2,4 og 5 GHz — ikke mobilnett.\n799 kr i stedet for 1 000 kr. 30 dagers åpent kjøp.",
                  headline: "Teknikeren viser hva du faktisk får", description: "" } },
        { name: "HeimGuard_NO_AU_2_H1", file: "HeimGuard_NO_AU_2_H1.mp4",
          copy: { message: "3 ting jeg sjekker før jeg setter opp et overvåkingskamera. 355° dekning fra dobbeltlinsen — ingen døde vinkler i hagen. AI-en skiller menneske fra kjæledyr, ikke bare bevegelse. Varsel rett i telefonen, ikke neste dag. 799 kr (før 1 000 kr), 30 dagers åpent kjøp.",
                  headline: "355° dekning. AI ser forskjellen.", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - SP', // SP — sosialt bevis
      ads: [
        { name: "HeimGuard_NO_SP_1", file: "HeimGuard_NO_SP_1.mp4",
          copy: { message: "Et kamera på vakt hele natten – ingen grunn til å ligge og lure.\n✅ To linser som dekker hele tomten\n✅ AI som bare varsler når det gjelder\n✅ Direkte varsling i mobilen uansett hvor du er\n✅ 30 dagers åpent kjøp\n\nEt kamera som vet forskjell på trussel og hverdagslyd.\nKjøp nå.",
                  headline: "Vet forskjell på trussel og hverdagslyd", description: "AI-sporing som skiller mennesker fra dyr. 30 dagers åpent kjøp." } },
        { name: "HeimGuard_NO_SP_2", file: "HeimGuard_NO_SP_2.mp4",
          copy: { message: "Et kamera på vakt hele natten – ingen grunn til å ligge og lure.\n✅ To linser som dekker hele tomten\n✅ AI som bare varsler når det gjelder\n✅ Direkte varsling i mobilen uansett hvor du er\n✅ 30 dagers åpent kjøp\n\nEt kamera som vet forskjell på trussel og hverdagslyd.\nKjøp nå.",
                  headline: "Vet forskjell på trussel og hverdagslyd", description: "AI-sporing som skiller mennesker fra dyr. 30 dagers åpent kjøp." } },
        { name: "HeimGuard_NO_SP_5_H1", file: "HeimGuard_NO_SP_5_H1.mp4",
          copy: { message: "Jeg sluttet å sjekke døren før jeg la meg.\nKameraet ser 355° rundt huset og skiller mennesker fra dyr.\n799 kr, 30 dagers åpent kjøp om jeg angrer meg.",
                  headline: "Jeg sover bedre siden jeg satte den opp", description: "" } },
        { name: "HeimGuard_NO_SP_3", file: "HeimGuard_NO_SP_3.mp4",
          copy: { message: "Et kamera på vakt hele natten – ingen grunn til å ligge og lure.\n✅ To linser som dekker hele tomten\n✅ AI som bare varsler når det gjelder\n✅ Direkte varsling i mobilen uansett hvor du er\n✅ 30 dagers åpent kjøp\n\nEt kamera som vet forskjell på trussel og hverdagslyd.\nKjøp nå.",
                  headline: "Vet forskjell på trussel og hverdagslyd", description: "AI-sporing som skiller mennesker fra dyr. 30 dagers åpent kjøp." } },
        { name: "HeimGuard_NO_SP_6_H1", file: "HeimGuard_NO_SP_6_H1.mp4",
          copy: { message: "Tre naboer i gaten min har allerede skaffet dette kameraet.\nAI-en skiller mennesker fra dyr — færre falske alarmer, mer søvn.\nKjøp nå for 799 kr i dag. 30 dagers åpent kjøp.",
                  headline: "Tre naboer i gaten har skaffet den", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - CO', // CO — sammenligning
      ads: [
        { name: "HeimGuard_NO_CO_1_H1", file: "HeimGuard_NO_CO_1_H1.mp4",
          copy: { message: "Det gamle kameraet filmet ett hjørne, i det uendelige.\nDette vrir seg 355° og følger bevegelsen dit den går.\n799 kr (ord. 1 000 kr). 30 dagers åpent kjøp.",
                  headline: "Det gamle kameraet mot dette", description: "" } },
      ],
    },
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - PD', // PD — problem/løsning
      ads: [
        { name: "HeimGuard_NO_PD_2", file: "HeimGuard_NO_PD_2.mp4",
          copy: { message: "En lyd på tomten klokken tre om natten. Er det katten – eller noe annet?\n✅ To linser, 355° dekning – ingen blindsoner\n✅ AI som skiller mennesker fra katter og greiner\n✅ Varsler bare ved reelle trusler – ingen falske alarmer\n✅ Direkte varsling i mobilen uansett hvor du er\n\nSlutt å gjette hva som skjer hjemme. Se det.\nBestill din i dag.",
                  headline: "Se hele tomten – uten falske alarmer", description: "AI-sporing som skiller mennesker fra katter og greiner." } },
        { name: "HeimGuard_NO_PD_3", file: "HeimGuard_NO_PD_3.mp4",
          copy: { message: "En lyd på tomten klokken tre om natten. Er det katten – eller noe annet?\n✅ To linser, 355° dekning – ingen blindsoner\n✅ AI som skiller mennesker fra katter og greiner\n✅ Varsler bare ved reelle trusler – ingen falske alarmer\n✅ Direkte varsling i mobilen uansett hvor du er\n\nSlutt å gjette hva som skjer hjemme. Se det.\nBestill din i dag.",
                  headline: "Se hele tomten – uten falske alarmer", description: "AI-sporing som skiller mennesker fra katter og greiner." } },
        { name: "HeimGuard_NO_PD_1", file: "HeimGuard_NO_PD_1.mp4",
          copy: { message: "En lyd på tomten klokken tre om natten. Er det katten – eller noe annet?\n✅ To linser, 355° dekning – ingen blindsoner\n✅ AI som skiller mennesker fra katter og greiner\n✅ Varsler bare ved reelle trusler – ingen falske alarmer\n✅ Direkte varsling i mobilen uansett hvor du er\n\nSlutt å gjette hva som skjer hjemme. Se det.\nBestill din i dag.",
                  headline: "Se hele tomten – uten falske alarmer", description: "AI-sporing som skiller mennesker fra katter og greiner." } },
      ],
    },
    {
      name: 'HEIMGUARD_NO_Overvåkingskamera - G', // G — gave
      ads: [
        { name: "HeimGuard_NO_G_1", file: "HeimGuard_NO_G_1.mp4",
          copy: { message: "Jeg visste akkurat hva han ville bli glad for.\nHan har snakket om et kamera ved garasjen i månedsvis. Jeg lyttet – og bestilte et til ham.\n✅ Ingen komplisert installasjon – bare app, wifi, ferdig\n✅ En gave han faktisk trenger\n✅ 30 dagers åpent kjøp\n\nDen første kvelden varslet kameraet ham i mobilen da noen gikk forbi garasjen – ikke da katten gjorde det.\nGi bort trygghet i dag.",
                  headline: "Den perfekte gaven til ham", description: "Enkel å sette opp. En gave han faktisk trenger." } },
        { name: "HeimGuard_NO_G_3", file: "HeimGuard_NO_G_3.mp4",
          copy: { message: "Jeg visste akkurat hva han ville bli glad for.\nHan har snakket om et kamera ved garasjen i månedsvis. Jeg lyttet – og bestilte et til ham.\n✅ Ingen komplisert installasjon – bare app, wifi, ferdig\n✅ En gave han faktisk trenger\n✅ 30 dagers åpent kjøp\n\nDen første kvelden varslet kameraet ham i mobilen da noen gikk forbi garasjen – ikke da katten gjorde det.\nGi bort trygghet i dag.",
                  headline: "Den perfekte gaven til ham", description: "Enkel å sette opp. En gave han faktisk trenger." } },
        { name: "HeimGuard_NO_G_2", file: "HeimGuard_NO_G_2.mp4",
          copy: { message: "Jeg visste akkurat hva han ville bli glad for.\nHan har snakket om et kamera ved garasjen i månedsvis. Jeg lyttet – og bestilte et til ham.\n✅ Ingen komplisert installasjon – bare app, wifi, ferdig\n✅ En gave han faktisk trenger\n✅ 30 dagers åpent kjøp\n\nDen første kvelden varslet kameraet ham i mobilen da noen gikk forbi garasjen – ikke da katten gjorde det.\nGi bort trygghet i dag.",
                  headline: "Den perfekte gaven til ham", description: "Enkel å sette opp. En gave han faktisk trenger." } },
      ],
    },
  ],
};
