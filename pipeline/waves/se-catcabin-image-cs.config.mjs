// se-catcabin-image-cs.config.mjs — CatCabins CS-bildannons.
//
// Låg i kön till 2026-09-12, då Axel beslutade att CatCabin kör ett
// tidsbegränsat erbjudande "exakt som Bäverbutiken". Banderollen
// "24% RABATT – IDAG / Endast få kvar i lager" är därmed sann: rabattsatsen
// stämmer mot butikens egna priser (789 av 1039 = 24,06 %) och kampanjen finns.
// Inget pris står i banderollen, så bilden kopieras ORÖRD — bara länken byts.
//
// CS-adsetet skapas här; videorna i samma koncept väntar på omdubb (talet läser
// upp 809 kr, butiken tar 789).
//
//   node no-image-launch.mjs waves/se-catcabin-image-cs.config.mjs \
//     --imgdir=../factory/output/utekattkojan/bygg
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
      name: 'CATCABIN_SE_Utekattkojan - CS',
      ads: [
        { adName: 'CatCabin_CS_2_1', img: 'Utekattkoja_CS_2_1.jpg',
          copy: {
            message: '⏰ Bara idag – 24% rabatt på Isolerat Utekattehus!\nPriset sänkt just nu. Lagret krymper snabbt och det här erbjudandet gäller bara idag. Vänta inte – när det är slut är det slut.\n✅ 24% rabatt – enbart idag\n✅ Få kvar i lager\n✅ Snabb leverans\nSäkra ditt till rabatterat pris innan det är för sent. 👇',
            headline: '24% RABATT – IDAG',
            description: 'Erbjudandet gäller bara idag – få kvar.' } },
      ],
    },
  ],
};
