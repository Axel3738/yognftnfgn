// se-catcabin-image.config.mjs — CatCabin SVERIGE, bildannonserna.
// Byggd av /ny-annonser 2026-09-11, körs EFTER se-catcabin-video.config.mjs.
//
// Samma kampanj och samma adsetnamn som videokonfigen — launch-skripten är
// idempotenta på namn, så de tre bilderna läggs I BEFINTLIGA adsets i stället
// för att skapa en kampanj bredvid. Strukturen är den låsta: EN CBO-kampanj per
// marknad, ett adset per källkoncept, annonserna i sitt koncepts adset.
//
//   node no-image-launch.mjs waves/se-catcabin-image.config.mjs \
//     --imgdir=../factory/output/utekattkojan/bygg
//
// ⚠️ Utekattkoja_SP_2_1 är ÅTGÄRDAD, inte källans fil. Källan bär
// "30 dagars öppet köp – helt riskfritt" inbränt i den vita plattan; CatCabin
// ger 14 dagars ångerrätt. Raden är utbytt mot "14 dagars ångerrätt – enligt
// svensk lag" med QA före/efter i factory/output/utekattkojan/bildfix/.
// Filen i bygg/ är den fixade — OCR-verifierad efter kopieringen.
//
// ⚠️ Bildannonsen CS_2_1 saknas med flit: den bär en röd banderoll med
// "24% RABATT – IDAG / Endast få kvar i lager" inbränd i 45 graders vinkel.
// OCR läste noll tecken ur den; ögongranskningen hittade den. Rabattsatsen
// stämmer mot butikens priser, men "IDAG" och lagerlarmet är en kampanj
// CatCabin inte kör. Står namngiven i rakningen.md.
//
// Copyn är källans, ordagrant — yta 1 fick domen "ren". Bara link är bytt.
export default {
  act: 'act_915422744950975',
  page: '1353362171174302',
  pixel: '1101742182294878',
  country: 'SE',
  campaignName: 'CATCABIN_SE_Utekattkojan | BE-ROAS 1,62 | 2026-09-11',
  link: 'https://catcabin.se/products/utekattkojan',
  dailyBudget: '100000',
  campaignStatus: 'PAUSED',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  adsets: [
    {
      name: 'CATCABIN_SE_Utekattkojan - PD',
      ads: [
        { adName: 'CatCabin_PD_2_1', img: 'Utekattkoja_PD_2_1.jpg',
          copy: {
            message: 'Din katt fryser ute – utan att du vet om det. 🐾\n✅ Håller katten torr när det regnar\n✅ Blockerar vind och kyla\n✅ Isolerad – behåller värmen inne\n✅ Ger katten en egen trygg plats utomhus\nGe din katt ett varmt och tryggt hem – även utomhus. Beställ ditt Isolerat Utekattehus idag. 👇',
            headline: 'Ett varmt hem – även utomhus',
            description: 'Torrt, vindtätt och isolerat för din katt.' } },
      ],
    },
    {
      name: 'CATCABIN_SE_Utekattkojan - GT',
      ads: [
        { adName: 'CatCabin_GT_2_1', img: 'Utekattkoja_GT_2_1.jpg',
          copy: {
            message: 'Du vet exakt vem som skulle älska den här gåvan. 🎁\nDin mamma pratar alltid om katten som bor utanför hennes hus. Föreställ dig hennes ansikte när hon öppnar paketet och förstår att du tänkte på det där hon oroar sig för varje kväll.\n✅ En gåva som visar att du verkligen lyssnar\n✅ Ger trygghet och värme åt någon hon bryr sig om\n✅ Enkel att slå in, omöjlig att glömma\nBli den som gav den perfekta presenten i år. Beställ idag. 👇',
            headline: 'Presenten hon inte förväntar sig',
            description: 'En gåva som värmer – både katten och hjärtat.' } },
      ],
    },
    {
      name: 'CATCABIN_SE_Utekattkojan - SP',
      ads: [
        { adName: 'CatCabin_SP_2_1', img: 'Utekattkoja_SP_2_1.jpg',
          copy: {
            message: 'Tusentals kattägare har redan gett sina katter ett tryggare liv utomhus. 🐱\n✅ "Min katt sover här varje natt nu"\n✅ Isolerad mot kyla, regn och vind\n✅ Enkel att sätta upp – redo direkt\nSe varför så många kattägare väljer det här inför vintern. Beställ nu. 👇',
            headline: 'Kattägare älskar den – se varför',
            description: 'Betrodd av tusentals kattägare i Sverige.' } },
      ],
    },
  ],
};
