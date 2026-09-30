// Kampanj: Spikkesett NO — videobatch 2026-09-29 (rutinen /translate-no, ElevenLabs-röst — Axels beslut 2026-09-29, ingen HeyGen).
// Källa: Drive "Täljset 30 delar" (1IBXKtwHEdjFsTTAtNuIMoJ_ESTO8CmSP). Norsk copy skriven av sonnet (claude-sonnet-5 via API)
// ur de svenska ADCOPY-docsen, verifierad mot beverbutikken.no: 1039 kr (før 1359 = 24 %), 30 dagers åpent kjøp.
// Overifierade rader i källan ([Om sant: …], kundcitat, antal kunder) borttagna. Inget butiksnamn.
// COGS: batch-sheet #10, NORWAY Qty 1 Total ex. tax 37,02 EUR × 10,8367 = 401,17 NOK ⇒ BE-ROAS 1039/(1039−401,17) = 1,63.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Spikkesett NO | BE-ROAS 1,63 | 2026-09-29',
  link: 'https://beverbutikken.no/products/spikkesett-30-deler-6-kniver-og-6-jern',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-29/taljset/final', // relativt pipeline/
  adsets: [
    {
      name: 'Spikkesett NO - PD',
      copy: {
        message: "Alltid ønsket å prøve å spikke, men ikke visst hvilke verktøy du trenger? 🪵\nMed spikkesett 30 deler får du alt i ett:\n✔️ 6 kniver for å forme og skjære\n✔️ 6 jern for å hule ut og ta frem detaljer\n✔️ Totalt 30 deler, så du kan begynne direkte\nPerfekt for skjeer, figurer og dekorasjoner.\n👉 Trykk på knappen under for å bestille settet ditt.",
        headline: "Alt du trenger for å spikke",
        description: "Et komplett sett, ingen gjetting.",
      },
      ads: [
        { name: 'Spikkesett_NO_PD_1_H1', file: 'NO_taljset_PD_1_H1.mp4' },
        { name: 'Spikkesett_NO_PD_1_H2', file: 'NO_taljset_PD_1_H2.mp4' },
        { name: 'Spikkesett_NO_PD_1_H3', file: 'NO_taljset_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Spikkesett NO - SP',
      copy: {
        message: "Flere og flere oppdager hvor godt det er å spikke. 🪵\n• Seks kniver og seks jern i samme sett\n• Alt du trenger for å komme i gang\n• Et avslappende hobbyprosjekt for hjemme, hytta eller terrassen\n👉 Trykk på knappen under for å se hvorfor de ble hekta.",
        headline: "Din nye favoritthobby venter",
        description: "30 dagers åpent kjøp. Alt i én veske.",
      },
      ads: [
        { name: 'Spikkesett_NO_SP_1_H1', file: 'NO_taljset_SP_1_H1.mp4' },
        { name: 'Spikkesett_NO_SP_1_H2', file: 'NO_taljset_SP_1_H2.mp4' },
        { name: 'Spikkesett_NO_SP_1_H3', file: 'NO_taljset_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'Spikkesett NO - CS',
      copy: {
        message: "🚨 REA på spikkesett 30 deler!\n❌ Ordinær pris: 1 359 kr\n✅ Nå: 1 039 kr\nDu sparer 320 kroner, cirka 24 %. 🔥\n30 deler. 6 kniver. 6 jern. Alt du trenger for å begynne å spikke.\n👉 Trykk på knappen under for å handle nå.",
        headline: "Begynn å spikke allerede i helgen",
        description: "Spar 320 kr, nå 1 039 kr.",
      },
      ads: [
        { name: 'Spikkesett_NO_CS_1_H1', file: 'NO_taljset_CS_1_H1.mp4' },
        { name: 'Spikkesett_NO_CS_1_H2', file: 'NO_taljset_CS_1_H2.mp4' },
        { name: 'Spikkesett_NO_CS_1_H3', file: 'NO_taljset_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Spikkesett NO - G',
      copy: {
        message: "Hva gir man mannen som allerede har alt? 🎁\nDu vet følelsen når du finner den perfekte gaven? Han pakker den opp. Blir stille et sekund. Så kommer smilet.\nSpikkesett 30 deler er gaven som blir en hobby, ikke en greie som ender i en skuff.\n• Seks kniver og seks jern\n• Perfekt for pappa, samboeren eller bestefar\n• Noe han får skape med sine egne hender\nBli den som fant den perfekte gaven. 🪵\n👉 Trykk på knappen under for å finne gaven.",
        headline: "Gaven han faktisk bruker",
        description: "Et sett som gir ham en ny hobby.",
      },
      ads: [
        { name: 'Spikkesett_NO_G_1_H1', file: 'NO_taljset_G_1_H1.mp4' },
        { name: 'Spikkesett_NO_G_1_H2', file: 'NO_taljset_G_1_H2.mp4' },
        { name: 'Spikkesett_NO_G_1_H3', file: 'NO_taljset_G_1_H3.mp4' },
      ],
    },
  ],
};
