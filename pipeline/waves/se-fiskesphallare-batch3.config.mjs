// SE Fiskespöhållaren — Batch 3, 2026-08-24.
//
// Tio annonser in i befintliga CBO-kampanjen. Två nya adsets (PD + SO), ingen
// adsetbudget. Copy enligt Notion-hubben "Fish rod holder":
//
//   Vinnarcopyn ordagrant (briefkrav): PD_3_H1/H2 (nya råklipp, batch #2),
//     PD_11 (Klicket), PD_12, PD_13 (batch #3 DEMO GRIND).
//   Egen briefad copy: PD_8 (Trasselbollen — samma text på alla tre cuts,
//     briefen: "same captions, same primary text") och SO_3_H1 (ärlig
//     prismekanik, 72,25 kr/hållare — ersätter det pensionerade falska
//     40%-konceptet).
//
// FILNAMNSTOLKNING (verifierad mot längd/md5):
//   "Rodholder_PD_3_H1 H1/H2"  → annonserna PD_3_H1 och PD_3_H2 (Notion har
//     båda som egna items; basnamnet råkade få _H1).
//   "Rodholder_PD_8_H2 H1/H2"  → samma film i två öppningsrader (36,07 mot
//     36,74 s) — exakt vad PD_8-briefen beskriver. Behåller filernas namn i
//     annonsnamnen (PD_8_H2_H1/H2) i stället för att gissa om numreringen.
//   "Rodholder_PD_11_H12"      → tolkad som PD_11_H2 (H1-syskonet finns,
//     briefen säger "This item = H1", H12 är rimligen ett skrivfel).
//   "4.5"-exporter används där de finns (feedformatet), annars grundfilen.

const LP = 'https://baverbutiken.se/products/fiskespohallare-4-pack-kraftig-forvaring';

const COPY_PD = {   // vinnarcopyn, 23 köp bakom sig — ordagrann enligt briefarna
  message: 'Trassliga fiskespön i båten – igen? 🎣\nDen här lilla klämman löser det på 1 sekund.\n✅ Håller ihopfällda spön säkert stängda\n✅ Inga fler trassliga linor\n✅ Passar alla spön\nBeställ ditt 4-pack idag och slipp trasslet för gott. 👇',
  headline: 'Aldrig mer trassliga fiskespön',
  description: 'Fyra kraftiga klämmor – ordning i båten på sekunder.',
  cta: 'SHOP_NOW', link: LP,
};

const COPY_PD8 = {  // Trasselbollen — briefens body, samma på H1 och H2
  message: 'Det här väntar i botten av lådan om spöna inte hålls stängda. 🎣\nKlämman stänger varje spö för sig – ingen härva, inga trassliga linor.\n✅ Håller ihopfällda spön säkert stängda\n✅ Fyra hållare, en plats var\nBeställ ditt 4-pack för 289 kr och slipp trasselbollen. 👇',
  headline: 'Aldrig mer trassliga fiskespön',
  description: '', cta: 'SHOP_NOW', link: LP,
};

const COPY_SO3 = {  // ärlig prismekanik — briefens text ordagrant
  message: 'Inget rabattpris här – bara det verkliga priset. 🎣\n289 kr för ett 4-pack, 72,25 kr per hållare.\n✅ Klarna finns\n✅ 30 dagars nöjd-kund-garanti\nHandla för 300 kr och frakten är fri. Beställ idag. 👇',
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
          name: 'Fiskespöhållare PD Batch 3',
          link: LP,
          motifs: [
            { name: 'Rodholder_PD_3_H1',    media: 'Rodholder_PD_3_H1 H1',   copy: COPY_PD },
            { name: 'Rodholder_PD_3_H2',    media: 'Rodholder_PD_3_H1 H2',   copy: COPY_PD },
            { name: 'Rodholder_PD_8_H1',    media: 'Rodholder_PD_8_H1 4.5',  copy: COPY_PD8 },
            { name: 'Rodholder_PD_8_H2_H1', media: 'Rodholder_PD_8_H2 H1',   copy: COPY_PD8 },
            { name: 'Rodholder_PD_8_H2_H2', media: 'Rodholder_PD_8_H2 H2',   copy: COPY_PD8 },
            { name: 'Rodholder_PD_11_H1',                                    copy: COPY_PD },
            { name: 'Rodholder_PD_11_H2',   media: 'Rodholder_PD_11_H12',    copy: COPY_PD },
            { name: 'Rodholder_PD_12_H1',   media: 'Rodholder_PD_12_H1 4.5', copy: COPY_PD },
            { name: 'Rodholder_PD_13_H1',   media: 'Rodholder_PD_13_H1 4.5', copy: COPY_PD },
          ],
        },
        {
          name: 'Fiskespöhållare SO Batch 2',
          link: LP,
          motifs: [
            { name: 'Rodholder_SO_3_H1', media: 'Rodholder_SO_3_H1 4.5', copy: COPY_SO3 },
          ],
        },
      ],
    },
  ],
};
