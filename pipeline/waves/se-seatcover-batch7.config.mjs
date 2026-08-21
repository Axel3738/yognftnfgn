// SE Sätesöverdraget — Batch 7 (video), 2026-08-21.
//
// Fem videor rakt in i den befintliga CBO-kampanjen "Sätesöverdragaren"
// (3000 kr/dag). Två nya adsets efter koncept, ingen adsetbudget, inget
// minimum spend. Alla fem briefs i Notions "Mower seat creative hub" har
// status Approved och eget copy-card — texterna nedan är ordagranna.
//
// PD_18_H1 finns bara som _4x5/_9x16-filer i biblioteket; m.media pekar på
// 4x5-versionen och annonsnamnet hålls rent.
//
// PD_22_H1 är ad-objekttestet: identisk creative som PD_1_3_H1, uppladdad som
// ny fil. Briefen: pausa INTE originalet — jämförelsen kräver att alla tre
// (original, kopian, denna) kör samtidigt.

const LP = 'https://baverbutiken.se/products/satesoverdrag-for-akgrasklippare-slittaligt-600d-oxford';

export default {
  act: 'act_1867947880635861',     // MagiBorsten (SE)
  page: '678639638662543',         // Bäverbutiken.se
  instagram: '17841474144960111',
  pixel: '1554276343018184',
  link: LP,
  dsaBeneficiary: 'Axel Odhner',
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['SE'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  campaigns: [
    {
      campaignName: 'Sätesöverdragaren',   // befintlig CBO — ingen create
      adsets: [
        {
          name: 'Seatcover PD Batch 7',
          link: LP,
          motifs: [
            { name: 'Seatcover_PD_16_H1', copy: {
              message: 'Vaken av ett kallt, blött säte igen? Eller så bränner det i solen på eftermiddagen. Vårt sätesöverdrag i 600D Oxford löser båda delarna – dra det bara över din befintliga dyna. ✅ Vattenavvisande tyg ✅ Vadderad insida ✅ Justerbara remmar som sitter kvar ✅ Klart på under 60 sekunder, inga verktyg 👉 Tryck på länken och se hur enkelt det sitter på.',
              headline: 'Torrt och skönt säte – på 60 sekunder',
              description: '', cta: 'SHOP_NOW', link: LP } },

            { name: 'Seatcover_PD_18_H1', media: 'Seatcover_PD_18_H1_4x5', copy: {
              message: 'Lägger du en handduk på sätet innan du kör din åkgräsklippare? Den håller ungefär en dag. Ett sätesöverdrag i slittåligt 600D Oxford-tyg håller väder efter väder – och kostar 649 kr, jämfört med flera tusenlappar för ett nytt säte. Vadderad insida, justerbara remmar och på plats på under 60 sekunder utan verktyg. Handla nu – fri frakt och nöjd-kund-garanti.',
              headline: 'Sätesöverdrag för åkgräsklippare – 649 kr',
              description: '', cta: 'SHOP_NOW', link: LP } },

            { name: 'Seatcover_PD_19_H1', copy: {
              message: 'Lägger du en jacka eller filt på sätet innan du sätter dig på åkgräsklipparen? Det hjälper knappt alls. Vårt sätesöverdrag i vattenavvisande 600D Oxford-tyg med vadderad insida sitter kvar och håller sätet torrt, oavsett väder. Trä det över dynan på under 60 sekunder, helt utan verktyg. Handla nu – fri frakt, Klarna och 30 dagars öppet köp.',
              headline: 'Sätesöverdrag som faktiskt håller torrt',
              description: '', cta: 'SHOP_NOW', link: LP } },

            { name: 'Seatcover_PD_22_H1', copy: {
              message: 'Ett torrt, bekvämt säte varje gång du sätter dig på åkgräsklipparen, det är vad vårt sätesöverdrag ger dig. Vadderat på insidan, vattenavvisande på utsidan och sytt i slittåligt 600D Oxfordtyg som tål alla säsonger. Justerbara remmar ger universell passform, och du sätter det på plats på under 60 sekunder utan verktyg. Vi beställde in för många och säljer nu ut till 649 kr istället för ordinarie 811 kr, med fri frakt, Klarna och 30 dagars öppet köp. Beställ ditt sätesöverdrag nu.',
              headline: 'Torrt säte, nu 649 kr',
              description: '', cta: 'SHOP_NOW', link: LP } },
          ],
        },
        {
          name: 'Seatcover SP Batch 7',
          link: LP,
          motifs: [
            { name: 'Seatcover_SP_8_H1', copy: {
              message: 'Ligger det fortfarande en handduk på sätet på åkgräsklipparen? Ett nytt säte kostar flera tusenlappar, men ett bra överdrag kostar betydligt mindre. Vårt sätesöverdrag är sytt i slittåligt 600D Oxfordtyg, vattenavvisande och vadderat på insidan, med justerbara remmar för universell passform. Du trär det över den befintliga sätesdynan på under 60 sekunder, helt utan verktyg. Nu 649 kr istället för ordinarie 811 kr, med fri frakt, Klarna och 30 dagars öppet köp. Byt ut handduken mot ett riktigt överdrag nu.',
              headline: 'Släng handduken. Nu 649 kr.',
              description: '', cta: 'SHOP_NOW', link: LP } },
          ],
        },
      ],
    },
  ],
};
