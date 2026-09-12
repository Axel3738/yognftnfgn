// se-catcabin-video.config.mjs — CatCabin SVERIGE, byggd av /ny-annonser 2026-09-11.
//
// Källa: Bäverbutikens ACTIVE-annonser i "Isolerade Utekattkojan | BE ROAS 1.62 |
// Launch 2026-09-09" (MagiBorsten 1867947880635861, kampanj 120250147309170291).
// MÅLET är MagiBorsten DK 915422744950975 — OPS Factorys gemensamma konto.
// ⚠️ Kontot heter DK, valutan är SEK, och det bär ALLA OPS-butiker. Därför bär
// kampanjnamnet både brandet och marknaden.
//
// ⚠️ PRISET ÄR INTE OMRÄKNAT, och det är med flit. CatCabin säljer 789 / 1 039 kr
// — samma tal som källans produktsida — så copyn behöver ingen prisändring.
// Det som INTE stämde var det UPPLÄSTA priset i CS-videorna ("från 1059 kronor
// ner till 809"); hela CS-konceptet ligger därför utanför den här konfigen, se
// nedan.
//
// COPYN ÄR KÄLLANS, ORDAGRANT. Brand-detektorn 2026-09-11 gav yta 1 (copy) domen
// "ren" på alla tre koncepten här: ingen nämner Bäverbutiken, inget pris, inga
// villkor. Regeln i /ny-annonser är då uttrycklig — "nämner annonsen varken
// Bäverbutiken eller ett felaktigt pris kopieras den som den är, ingen ny copy"
// — så ingen subagent har skrivit om något. Bara `link` är bytt.
//
// ⚠️ Tre av källans 16 annonser (CS_1_H1, CS_2_H1, CS_3_H1) och bildannonsen
// CS_2_1 är INTE med. CS är ett rabattkoncept: talet läser upp ett pris butiken
// inte har och lovar "bara idag", och CS_2_1 bär en röd banderoll med
// "24% RABATT – IDAG / Endast få kvar i lager" inbränd. Det är inte ett tal att
// byta utan en kampanj butiken inte kör — ägarbeslut, inte ett fix. De står
// namngivna i factory/output/utekattkojan/rakningen.md.
//
// Allt föds PAUSED. Butiken ligger dessutom bakom storefront-lösenordet
// (catcabin.se → /password, mätt 2026-09-11), så ingenting får sättas ACTIVE
// förrän den är öppnad.
export default {
  act: 'act_915422744950975',
  page: '1353362171174302',   // CatCabin — Axels sida, verifierad i owned_pages
  pixel: '1101742182294878',  // CatCabin-pixeln
  country: 'SE',
  campaignName: 'CATCABIN_SE_Utekattkojan | BE-ROAS 1,62 | 2026-09-11',
  link: 'https://catcabin.se/products/utekattkojan',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'PAUSED',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  videoDir: '../factory/output/utekattkojan/bygg', // relativt pipeline/
  adsets: [
    {
      // PD — problem/demo. Källans top spender bor här: Utekattkoja_PD_2_H1,
      // 1 799 kr / 5 köp / ROAS 2,50 mot BE 1,62 (avläst 2026-09-11).
      name: 'CATCABIN_SE_Utekattkojan - PD',
      ads: [
        { name: 'CatCabin_PD_1_H1', file: 'Utekattkoja_PD_1_H1.mp4',
          copy: {
            message: 'Din katt fryser ute – utan att du vet om det. 🐾\n✅ Håller katten torr när det regnar\n✅ Blockerar vind och kyla\n✅ Isolerad – behåller värmen inne\n✅ Ger katten en egen trygg plats utomhus\nGe din katt ett varmt och tryggt hem – även utomhus. Beställ ditt Isolerat Utekattehus idag. 👇',
            headline: 'Ett varmt hem – även utomhus',
            description: 'Torrt, vindtätt och isolerat för din katt.' } },
        { name: 'CatCabin_PD_2_H1', file: 'Utekattkoja_PD_2_H1.mp4',
          copy: {
            message: 'Din katt fryser ute – utan att du vet om det. 🐾\n✅ Håller katten torr när det regnar\n✅ Blockerar vind och kyla\n✅ Isolerad – behåller värmen inne\n✅ Ger katten en egen trygg plats utomhus\nGe din katt ett varmt och tryggt hem – även utomhus. Beställ ditt Isolerat Utekattehus idag. 👇',
            headline: 'Ett varmt hem – även utomhus',
            description: 'Torrt, vindtätt och isolerat för din katt.' } },
        { name: 'CatCabin_PD_3_H1', file: 'Utekattkoja_PD_3_H1.mp4',
          copy: {
            message: 'Din katt fryser ute – utan att du vet om det. 🐾\n✅ Håller katten torr när det regnar\n✅ Blockerar vind och kyla\n✅ Isolerad – behåller värmen inne\n✅ Ger katten en egen trygg plats utomhus\nGe din katt ett varmt och tryggt hem – även utomhus. Beställ ditt Isolerat Utekattehus idag. 👇',
            headline: 'Ett varmt hem – även utomhus',
            description: 'Torrt, vindtätt och isolerat för din katt.' } },
      ],
    },
    {
      // GT — gåvovinkeln. Talet är granskat mot transkriptet: ingen butik, inget
      // pris, inga villkor. Kopieras orört.
      name: 'CATCABIN_SE_Utekattkojan - GT',
      ads: [
        { name: 'CatCabin_GT_1_H1', file: 'Utekattkoja_GT_1_H1.mp4',
          copy: {
            message: 'Du vet exakt vem som skulle älska den här gåvan. 🎁\nDin mamma pratar alltid om katten som bor utanför hennes hus. Föreställ dig hennes ansikte när hon öppnar paketet och förstår att du tänkte på det där hon oroar sig för varje kväll.\n✅ En gåva som visar att du verkligen lyssnar\n✅ Ger trygghet och värme åt någon hon bryr sig om\n✅ Enkel att slå in, omöjlig att glömma\nBli den som gav den perfekta presenten i år. Beställ idag. 👇',
            headline: 'Presenten hon inte förväntar sig',
            description: 'En gåva som värmer – både katten och hjärtat.' } },
        { name: 'CatCabin_GT_2_H1', file: 'Utekattkoja_GT_2_H1.mp4',
          copy: {
            message: 'Du vet exakt vem som skulle älska den här gåvan. 🎁\nDin mamma pratar alltid om katten som bor utanför hennes hus. Föreställ dig hennes ansikte när hon öppnar paketet och förstår att du tänkte på det där hon oroar sig för varje kväll.\n✅ En gåva som visar att du verkligen lyssnar\n✅ Ger trygghet och värme åt någon hon bryr sig om\n✅ Enkel att slå in, omöjlig att glömma\nBli den som gav den perfekta presenten i år. Beställ idag. 👇',
            headline: 'Presenten hon inte förväntar sig',
            description: 'En gåva som värmer – både katten och hjärtat.' } },
        { name: 'CatCabin_GT_3_H1', file: 'Utekattkoja_GT_3_H1.mp4',
          copy: {
            message: 'Du vet exakt vem som skulle älska den här gåvan. 🎁\nDin mamma pratar alltid om katten som bor utanför hennes hus. Föreställ dig hennes ansikte när hon öppnar paketet och förstår att du tänkte på det där hon oroar sig för varje kväll.\n✅ En gåva som visar att du verkligen lyssnar\n✅ Ger trygghet och värme åt någon hon bryr sig om\n✅ Enkel att slå in, omöjlig att glömma\nBli den som gav den perfekta presenten i år. Beställ idag. 👇',
            headline: 'Presenten hon inte förväntar sig',
            description: 'En gåva som värmer – både katten och hjärtat.' } },
      ],
    },
    {
      // SP — socialt bevis. ⚠️ Copyn säger "Tusentals kattägare" och talet
      // "tusentals katter redan använder". Det är ett påstående om PRODUKTEN,
      // inte om butiken, och följer därför med — men CatCabin har 10 recensioner
      // i egen kassa. Axel avgör om formuleringen ska stå kvar; den är oförändrad
      // här eftersom regeln är att inte skriva om det som inte är fel.
      name: 'CATCABIN_SE_Utekattkojan - SP',
      ads: [
        { name: 'CatCabin_SP_1_H1', file: 'Utekattkoja_SP_1_H1.mp4',
          copy: {
            message: 'Tusentals kattägare har redan gett sina katter ett tryggare liv utomhus. 🐱\n✅ "Min katt sover här varje natt nu"\n✅ Isolerad mot kyla, regn och vind\n✅ Enkel att sätta upp – redo direkt\nSe varför så många kattägare väljer det här inför vintern. Beställ nu. 👇',
            headline: 'Kattägare älskar den – se varför',
            description: 'Betrodd av tusentals kattägare i Sverige.' } },
        { name: 'CatCabin_SP_2_H1', file: 'Utekattkoja_SP_2_H1.mp4',
          copy: {
            message: 'Tusentals kattägare har redan gett sina katter ett tryggare liv utomhus. 🐱\n✅ "Min katt sover här varje natt nu"\n✅ Isolerad mot kyla, regn och vind\n✅ Enkel att sätta upp – redo direkt\nSe varför så många kattägare väljer det här inför vintern. Beställ nu. 👇',
            headline: 'Kattägare älskar den – se varför',
            description: 'Betrodd av tusentals kattägare i Sverige.' } },
        { name: 'CatCabin_SP_3_H1', file: 'Utekattkoja_SP_3_H1.mp4',
          copy: {
            message: 'Tusentals kattägare har redan gett sina katter ett tryggare liv utomhus. 🐱\n✅ "Min katt sover här varje natt nu"\n✅ Isolerad mot kyla, regn och vind\n✅ Enkel att sätta upp – redo direkt\nSe varför så många kattägare väljer det här inför vintern. Beställ nu. 👇',
            headline: 'Kattägare älskar den – se varför',
            description: 'Betrodd av tusentals kattägare i Sverige.' } },
      ],
    },
  ],
};
