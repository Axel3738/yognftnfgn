// SE Strandtofflorna — Batch 5, 2026-08-12.
//
// Notion-items finns för alla nio men är tomma skal (Drive-länk + titel, ingen copy
// card, ingen adset-anvisning). Titlarna visar att samtliga är bildvariationstester
// — variabeln är bilden, inte texten. Enligt Axels beslut kör de därför kontots
// etablerade copy per vinkel, avläst ordagrant ur befintliga annonser:
//   PD ← Beachslippers_PD_14_1 (Strandtofflor PD Batch 4)
//   SP ← Strandtofflor_SP_2_1 (Strandtofflor SP)
//
// OBS: hubben innehåller två uttryckliga copy-tester — SP_5_2 (lo-fi + PD-copy) och
// SP_8_1 (studio + SP-copy). Ingen av dem ingår i den här bunten.

const LP = 'https://baverbutiken.se/products/strandtofflor-for-herr-halkfria-tradgardsskor';

const COPY_PD = {
  message: 'Halkar du fortfarande på blöta altanen? 😬\nDessa tofflor har halkfri sula som greppar på blött däck, våt gräsmatta och hala stenar.\n✅ Mjukt EVA-material – skönt hela dagen\n✅ Kliv i på 2 sekunder, inga snören\n✅ Torkar snabbt, lätta att skölja rena\nBeställ dina idag och sluta oroa dig för nästa steg 👇',
  headline: 'Halkfria skor för trädgården & altanen',
  description: 'Grepp och komfort, oavsett underlag.',
  link: LP,
};

const COPY_SP = {
  message: '"Jag halkade aldrig med dessa – och fötterna var fortfarande sköna efter en hel dag ute." 🙌\nHundratals män har redan bytt till dessa halkfria strandtofflor i sommar.\n✅ Halkfri sula som faktiskt håller\n✅ Lätta, sköna hela dagen\n✅ 30 dagars nöjd-kund-garanti\nSe varför de blivit ett måste i trädgården och vid poolen 👇',
  headline: 'Skorna alla pratar om i sommar',
  description: 'Halkfria, sköna och älskade av våra kunder.',
  link: LP,
};

export default {
  act: 'act_1867947880635861',     // MagiBorsten (SE)
  page: '678639638662543',         // Bäverbutiken.se
  instagram: '17841474144960111',
  pixel: '1554276343018184',
  link: LP,
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['SE'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  campaigns: [
    {
      campaignName: 'Strandtofflorna',
      adsets: [
        { name: 'Strandtofflor PD Batch 5', copy: COPY_PD,
          motifs: ['Beachslippers_PD_2_5', 'Beachslippers_PD_2_6', 'Beachslippers_PD_13_14',
                   'Beachslippers_PD_13_15', 'Beachslippers_PD_13_16'] },

        { name: 'Strandtofflor SP Batch 5', copy: COPY_SP,
          motifs: ['Beachslippers_SP_5_3', 'Beachslippers_SP_5_4', 'Beachslippers_SP_5_5',
                   'Beachslippers_SP_7_1'] },
      ],
    },
  ],
};
