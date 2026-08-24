// SE Fiskespöhållaren — batch 2-statics, 2026-08-24.
//
// Fyra statiska (1x1 + 4x5) in i befintliga CBO:n. Copyn ordagrant ur
// ANNONSTEXTER.md, som i sin tur är ordagrann ur briefarna i "Fish rod holder".
//
// Adsets efter koncept: PD_6_1/PD_7_1 får ett nytt PD-adset (PD Batch 3 ligger
// på 9 annonser och taket är 10), CS_3_1 får kampanjens första CS-batchadset,
// SO_4_1 läggs i dagens "Fiskespöhållare SO Batch 2" — samma produktionsbatch
// som SO_3_H1 och samma offer-body, skapat idag.
//
// Annonsrubriker: offer-annonserna kör SO_3_H1:s briefade "289 kr för 4 st",
// PD-annonserna konceptets "Aldrig mer trassliga fiskespön". (Briefarnas
// "Headline ⭐" är texten i bilden, inte Meta-fältet.)
//
// SP_3_1 är INTE med — briefen är märkt BLOCKED tills äkta recensionstext
// finns. Se LÄS_MIG.md.

const LP = 'https://baverbutiken.se/products/fiskespohallare-4-pack-kraftig-forvaring';

// offer/värde-body — identisk på CS_3_1 och SO_4_1 enligt briefarna
const COPY_OFFER = {
  message: 'Inget rabattpris — bara det verkliga priset. 🎣\n289 kr för ett 4-pack, det blir 72,25 kr per hållare.\n✅ Klarna finns\n✅ 30 dagars nöjd-kund-garanti\nBeställ ditt 4-pack idag. 👇',
  headline: '289 kr för 4 st',
  description: '', cta: 'SHOP_NOW', link: LP,
};

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
      campaignName: 'Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18',  // befintlig CBO
      adsets: [
        {
          name: 'Fiskespöhållare PD Batch 4',
          link: LP,
          motifs: [
            { name: 'Rodholder_PD_6_1', copy: {   // demo-body, vinnaren
              message: 'Trassliga fiskespön i båten – igen? 🎣\nDen här lilla klämman löser det på 1 sekund.\n✅ Håller ihopfällda spön säkert stängda\n✅ Inga fler trassliga linor\n✅ Passar alla spön\nBeställ ditt 4-pack idag och slipp trasslet för gott. 👇',
              headline: 'Aldrig mer trassliga fiskespön',
              description: 'Fyra kraftiga klämmor – ordning i båten på sekunder.',
              cta: 'SHOP_NOW', link: LP } },

            { name: 'Rodholder_PD_7_1', copy: {   // skydds-body
              message: 'Trassel sliter på linor, beten och spötoppar varje gång de skaver mot varandra. 🎣\nKlämman håller varje spö stängt för sig – inget skaver mot något annat.\n✅ Håller ihopfällda spön säkert stängda\n✅ Passar alla spön\nBeställ ditt 4-pack för 289 kr. 👇',
              headline: 'Aldrig mer trassliga fiskespön',
              description: '', cta: 'SHOP_NOW', link: LP } },
          ],
        },
        {
          name: 'Fiskespöhållare CS Batch 2',
          link: LP,
          motifs: [ { name: 'Rodholder_CS_3_1', copy: COPY_OFFER } ],
        },
        {
          name: 'Fiskespöhållare SO Batch 2',   // återanvänds — samma batch som SO_3_H1
          link: LP,
          motifs: [ { name: 'Rodholder_SO_4_1', copy: COPY_OFFER } ],
        },
      ],
    },
  ],
};
