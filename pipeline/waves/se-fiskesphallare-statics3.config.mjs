// SE Fiskespöhållaren — statics REA/PROD, 2026-08-25.
//
// Tjugo statiska (1x1 + 4x5) in i befintliga CBO:n, uppdelade i två adsets
// efter bildfamilj enligt Axels instruktion. Ingen adsetbudget.
//
// De två familjerna är samma layout med EN skillnad, verifierad genom att
// granska bilderna:
//   PROD_V01–V10 → ingen lagerchip, footer "4-pack 289 kr – 30 dagars
//     nöjd-kund-garanti". Ren produkt/demo-vinkel → PD-lanen.
//   REA_V01–V10  → chip "Vi säljer ut lagret", footer "4-pack 289 kr – så
//     långt lagret räcker". Lagerrensningsvinkel → CS-lanen.
//
// COMPLIANCE (granskat i bild, inte antaget): ingen procentsats, inget
// överstruket pris, ingen nedräkning. Enda priset är 289 kr. Butiken har
// INGET jämförpris, så ett rabattpåstående hade varit obelagt — bilderna
// undviker det korrekt och copyn nedan gör detsamma.
//
// COPY: ingen REA/PROD-brief finns i Notion-hubben, så texten matchar vad
// respektive bildfamilj själv säger.
//   PROD → vinnarcopyn ordagrant (demo-vinkeln, 23 köp bakom sig).
//   REA  → ny lagerrensningstext. Kontots befintliga offer-body (SO_3_H1)
//     inleds med "Inget rabattpris — bara det verkliga priset", vilket
//     motsäger chipet "Vi säljer ut lagret" i bilden. Texten nedan bygger
//     bara på verifierbara fakta: 289 kr, 72,25 kr per hållare, Klarna,
//     30 dagars garanti, "så långt lagret räcker".

const LP = 'https://baverbutiken.se/products/fiskespohallare-4-pack-kraftig-forvaring';

const COPY_PROD = {   // vinnarcopyn
  message: 'Trassliga fiskespön i båten – igen? 🎣\nDen här lilla klämman löser det på 1 sekund.\n✅ Håller ihopfällda spön säkert stängda\n✅ Inga fler trassliga linor\n✅ Passar alla spön\nBeställ ditt 4-pack idag och slipp trasslet för gott. 👇',
  headline: 'Aldrig mer trassliga fiskespön',
  description: 'Fyra kraftiga klämmor – ordning i båten på sekunder.',
  cta: 'SHOP_NOW', link: LP,
};

const COPY_REA = {    // lagerrensning — matchar bildens chip och footer
  message: 'Vi säljer ut lagret av fiskespöhållare. 🎣\n289 kr för ett 4-pack, det blir 72,25 kr per hållare.\n✅ Håller ihopfällda spön säkert stängda\n✅ Passar alla spön\n✅ Klarna och 30 dagars nöjd-kund-garanti\nBeställ ditt 4-pack så långt lagret räcker. 👇',
  headline: '4-pack 289 kr – så långt lagret räcker',
  description: '', cta: 'SHOP_NOW', link: LP,
};

const serie = (prefix) => Array.from({ length: 10 }, (_, i) =>
  `Rodholder_${prefix}_V${String(i + 1).padStart(2, '0')}`);

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
        { name: 'Fiskespöhållare PD Batch 7 - PROD-bilder',
          copy: COPY_PROD, link: LP, motifs: serie('PROD') },

        { name: 'Fiskespöhållare CS Batch 3 - REA-bilder',
          copy: COPY_REA, link: LP, motifs: serie('REA') },
      ],
    },
  ],
};
