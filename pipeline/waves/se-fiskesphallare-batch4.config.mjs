// SE Fiskespöhållaren — Batch 4, 2026-08-24.
//
// Åtta videor in i befintliga CBO-kampanjen. Två nya adsets efter koncept:
// sju PD och en GT. Ingen adsetbudget, inget minimum spend.
//
// COPY enligt Notion-hubben "Fish rod holder":
//   Vinnarcopyn ordagrant (briefkrav): PD_3_H2 (båda cuts), PD_4_H1
//     ("use the proven winner verbatim, same as PD_3_H1's table"),
//     PD_15_H2 och PD_16_H2 (batch #3 DEMO GRIND).
//   Egen briefad copy: PD_18 "Hårsnodden" (samma text på H1 och H2 — syskon
//     till PD_8 där briefen uttryckligen delar text mellan hookarna) och
//     GT_3_H1 (present­vinkeln).
//   Globala regler: 289 kr enda tillåtna priset, inga procent, inget
//     fraktpåstående (289 < 300 kr-tröskeln).
//
// FILNAMN: "Rodholder_PD_3_H2 H1/H2" följer samma mönster som PD_8_H2 —
// basnamnet bär variantsuffixet och sista token är hooken. Två skilda filer
// (md5 9f3e66925983 respektive cbb4bc3db01f), båda 10,986 s. Annonsnamnen
// behåller filstrukturen (PD_3_H2_H1/_H2) så de inte krockar med de befintliga
// PD_3_H1/PD_3_H2 i Batch 3.
// "4.5"-exporterna används genomgående (feedformatet).

const LP = 'https://baverbutiken.se/products/fiskespohallare-4-pack-kraftig-forvaring';

const COPY_PD = {   // vinnarcopyn, 23 köp bakom sig
  message: 'Trassliga fiskespön i båten – igen? 🎣\nDen här lilla klämman löser det på 1 sekund.\n✅ Håller ihopfällda spön säkert stängda\n✅ Inga fler trassliga linor\n✅ Passar alla spön\nBeställ ditt 4-pack idag och slipp trasslet för gott. 👇',
  headline: 'Aldrig mer trassliga fiskespön',
  description: 'Fyra kraftiga klämmor – ordning i båten på sekunder.',
  cta: 'SHOP_NOW', link: LP,
};

const COPY_PD18 = { // "Hårsnodden" — briefens text ordagrant
  message: 'Hårsnodden runt spöet – strular igen? 🎣\nDen här klämman löser det på 1 sekund.\n✅ Håller ihopfällda spön säkert stängda\n✅ Inga fler hårsnoddar som fastnar i linan\nBeställ ditt 4-pack för 289 kr och slipp snodden för gott. 👇',
  headline: 'Slipp hårsnoddarna',
  description: '', cta: 'SHOP_NOW', link: LP,
};

const COPY_GT3 = {  // presentvinkeln — briefens text ordagrant
  message: 'Han har tre spön och ingen ordning på dem. 🎣\nFyra klämmor håller varje spö stängt och på sin plats – i bilen, båten eller förrådet.\n✅ Håller ihopfällda spön säkert stängda\n✅ Passar alla spön\n289 kr för ett 4-pack. Beställ till nästa fisketur. 👇',
  headline: 'Presenten han faktiskt kommer använda',
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
          name: 'Fiskespöhållare PD Batch 5',
          link: LP,
          motifs: [
            { name: 'Rodholder_PD_3_H2_H1', media: 'Rodholder_PD_3_H2 H1 4.5', copy: COPY_PD },
            { name: 'Rodholder_PD_3_H2_H2', media: 'Rodholder_PD_3_H2 H2 4.5', copy: COPY_PD },
            { name: 'Rodholder_PD_4_H1',    media: 'Rodholder_PD_4_H1 4.5',    copy: COPY_PD },
            { name: 'Rodholder_PD_15_H2',   media: 'Rodholder_PD_15_H2 4.5',   copy: COPY_PD },
            { name: 'Rodholder_PD_16_H2',   media: 'Rodholder_PD_16_H2 4.5',   copy: COPY_PD },
            { name: 'Rodholder_PD_18_H1',   media: 'Rodholder_PD_18_H1 4.5',   copy: COPY_PD18 },
            { name: 'Rodholder_PD_18_H2',   media: 'Rodholder_PD_18_H2 4.5',   copy: COPY_PD18 },
          ],
        },
        {
          name: 'Fiskespöhållare GT Batch 2',
          link: LP,
          motifs: [
            { name: 'Rodholder_GT_3_H1', media: 'Rodholder_GT_3_H1 4.5', copy: COPY_GT3 },
          ],
        },
      ],
    },
  ],
};
