// SE Fiskespöhållaren — Batch 5, 2026-08-25.
//
// Nio videor in i befintliga CBO-kampanjen. Ett nytt adset — samtliga är
// PD-konceptet. Ingen adsetbudget, inget minimum spend.
//
// COPY enligt Notion-hubben "Fish rod holder":
//   PD_5_H1  → egen briefad copy, "När det hugger"-situationen.
//   PD_12_H2, PD_13_H2 (batch #3 DEMO GRIND), PD_21_H1/H2 (batch #4 THE
//     PACKAGE, briefen: "Primary text = the proven winner verbatim") och
//     PD_23_H1/H2 → vinnarcopyn ordagrant.
//   Globala regler: 289 kr enda tillåtna priset, inga procent, inget
//     fraktpåstående (289 < 300 kr-tröskeln).
//
// ⚠️ PD_23:s fullständiga brief ligger i Drive ("Rodholder_PD_23 – Skummet")
// och Drive-kopplingen var nere vid bygget. Notion-sidorna anger bara hook och
// bild, ingen egen copy-card. Vinnarcopyn används därför, vilket är vad varje
// annan DEMO GRIND/THE PACKAGE-annons i hubben uttryckligen kräver. Säg till om
// Drive-briefen har en egen text, så byter jag.
//
// FILNAMN: PD_12_H2 och PD_13_H2 finns i två cuts var ("H1"/"H2" som sista
// token), verifierat olika filer via md5. Annonsnamnen behåller filstrukturen
// så de inte krockar med PD_12_H1/PD_13_H1 i Batch 3.
// 4:5-exporterna används genomgående; de heter "4_5" i den här batchen och
// "4.5" i de äldre.

const LP = 'https://baverbutiken.se/products/fiskespohallare-4-pack-kraftig-forvaring';

const COPY_PD = {   // vinnarcopyn, 23 köp bakom sig
  message: 'Trassliga fiskespön i båten – igen? 🎣\nDen här lilla klämman löser det på 1 sekund.\n✅ Håller ihopfällda spön säkert stängda\n✅ Inga fler trassliga linor\n✅ Passar alla spön\nBeställ ditt 4-pack idag och slipp trasslet för gott. 👇',
  headline: 'Aldrig mer trassliga fiskespön',
  description: 'Fyra kraftiga klämmor – ordning i båten på sekunder.',
  cta: 'SHOP_NOW', link: LP,
};

const COPY_PD5 = {  // "När det hugger" — briefens text ordagrant
  message: 'Det hugger – och tre spön ligger i trassel på däck. 🎣\nKlämman håller de andra spöna stängda medan du landar fisken.\n✅ Håller ihopfällda spön säkert stängda\n✅ Passar alla spön\nBeställ ditt 4-pack för 289 kr och var redo nästa gång det hugger. 👇',
  headline: 'Aldrig mer trassliga fiskespön',
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
          name: 'Fiskespöhållare PD Batch 6',
          link: LP,
          motifs: [
            { name: 'Rodholder_PD_5_H1',     media: 'Rodholder_PD_5_H1 4_5',     copy: COPY_PD5 },
            { name: 'Rodholder_PD_12_H2_H1', media: 'Rodholder_PD_12_H2 H1 4_5', copy: COPY_PD },
            { name: 'Rodholder_PD_12_H2_H2', media: 'Rodholder_PD_12_H2 H2 4_5', copy: COPY_PD },
            { name: 'Rodholder_PD_13_H2_H1', media: 'Rodholder_PD_13_H2 H1 4_5', copy: COPY_PD },
            { name: 'Rodholder_PD_13_H2_H2', media: 'Rodholder_PD_13_H2 H2 4_5', copy: COPY_PD },
            { name: 'Rodholder_PD_21_H1',    media: 'Rodholder_PD_21_H1 4.5',    copy: COPY_PD },
            { name: 'Rodholder_PD_21_H2',    media: 'Rodholder_PD_21_H2 4.5',    copy: COPY_PD },
            { name: 'Rodholder_PD_23_H1',    media: 'Rodholder_PD_23_H1 4.5',    copy: COPY_PD },
            { name: 'Rodholder_PD_23_H2',    media: 'Rodholder_PD_23_H2 4.5',    copy: COPY_PD },
          ],
        },
      ],
    },
  ],
};
