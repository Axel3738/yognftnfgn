// SE Fiskespöhållaren — Batch 2 (PD), 2026-08-22.
//
// Fem videor in i befintliga CBO-kampanjen "Fiskespöhållaren | BE ROAS 1.50 |
// Launch 2026-08-18". Ett nytt adset — alla fem är PD-konceptet. Ingen
// adsetbudget, inget minimum spend.
//
// COPY enligt Notion ("Fish rod holder"-hubben):
//   PD_15/16/17 (batch #3 DEMO GRIND) — briefen: "Primary text: the proven
//     winner verbatim" + rubrik "Aldrig mer trassliga fiskespön". Det är
//     kontots PD-copy, tillbakaläst ordagrant från PD-adsetet.
//   PD_9_H1 ("Garageväggen") — egen briefad copy, väggmontering.
//   PD_10_1 (risk/skydda-investeringen) — egen briefad body; rubriken är inte
//     specad på annonsnivå i briefen, så konceptrubriken används.
//   Globala regler: 289 kr är enda tillåtna priset, inga procent.
//
// MEDIA: PD_15/16/17 finns som _4x5/_9x16 — 4x5-filen används (feedformatet),
// samma val som motorhölje-batchen. PD_9 finns som "4.5"-export och råfil;
// 4:5-exporten används. m.media pekar på filen, annonsnamnet hålls rent.

const LP = 'https://baverbutiken.se/products/fiskespohallare-4-pack-kraftig-forvaring';

// Ordagrant ur adsetet "Fiskespöhållare PD" (vinnarcopyn)
const COPY_PD = {
  message: 'Trassliga fiskespön i båten – igen? 🎣\nDen här lilla klämman löser det på 1 sekund.\n✅ Håller ihopfällda spön säkert stängda\n✅ Inga fler trassliga linor\n✅ Passar alla spön\nBeställ ditt 4-pack idag och slipp trasslet för gott. 👇',
  headline: 'Aldrig mer trassliga fiskespön',
  description: 'Fyra kraftiga klämmor – ordning i båten på sekunder.',
  cta: 'SHOP_NOW', link: LP,
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
          name: 'Fiskespöhållare PD Batch 2',
          link: LP,
          motifs: [
            { name: 'Rodholder_PD_9_H1', media: 'Rodholder_PD_9_H1 4.5', copy: {
              message: 'Fyra spön i ett hörn, lutade mot varandra. 🎣\nFyra klämmor på väggen ger varje spö sin egen plats.\n✅ Skruvas fast på vägg eller i båt\n✅ Passar alla spön\nBeställ ditt 4-pack för 289 kr och ordna väggen. 👇',
              headline: 'Aldrig mer trassliga fiskespön',
              description: '', cta: 'SHOP_NOW', link: LP } },

            { name: 'Rodholder_PD_10_1', copy: {
              message: 'Trassel sliter på linor, beten och spötoppar varje gång de skaver mot varandra. 🎣\nKlämman håller varje spö stängt för sig – inget skaver mot något annat.\n✅ Håller ihopfällda spön säkert stängda\n✅ Passar alla spön\nBeställ ditt 4-pack för 289 kr. 👇',
              headline: 'Aldrig mer trassliga fiskespön',
              description: '', cta: 'SHOP_NOW', link: LP } },

            { name: 'Rodholder_PD_15_H1', media: 'Rodholder_PD_15_H1_4x5', copy: COPY_PD },
            { name: 'Rodholder_PD_16_H1', media: 'Rodholder_PD_16_H1_4x5', copy: COPY_PD },
            { name: 'Rodholder_PD_17_H1', media: 'Rodholder_PD_17_H1_4x5', copy: COPY_PD },
          ],
        },
      ],
    },
  ],
};
