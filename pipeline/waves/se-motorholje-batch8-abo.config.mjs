// SE Motorhöljet — Batch 8, separat ABO-testkampanj, 2026-08-19.
//
// Sex statiska, alla i SO-konceptet, alla med 1:1 och 4:5.
//
// COPY: alla sex briefar i Notion ("Boat cover 420D creative hub") bär exakt
// samma copy-card, och det är ordagrant den SO-copy kontot redan kör. Axels
// instruktion ("samma copy som vi kört innan på sagt koncept") och briefarna
// säger alltså samma sak. Ingen text är omskriven.
//
// STRUKTUR: briefarna kräver detta ordagrant:
//   "Launcha den här batchen i en separat ABO-kampanj med lika dagsbudget per
//    annons. Cirka 100 kr per annons per dygn i tre dygn räcker för att passera
//    300 kr."
// Skälet står i varje brief: batch #6:s femvägstest fick 735 kr på ena armen och
// 5 kr på den andra — 147 gångers skillnad. Samma strukturfel har förstört samma
// sorts test fyra gånger i rad. Därför ABO, inte CBO i Motorhöljet.
//
// TVÅ ADSETS, för det är två skilda test:
//   SO_26_1–4 — samma fotografi, samma rubrik, enda skillnaden är nedre
//     tredjedelen (mekanik / garanti / _3 / _4). KPI: köp per klick, alla fyra
//     mot varandra och mot SO_16_1:s 3,3 %. Briefen: "De måste ligga i samma
//     adset med lika budget."  → 400 kr/dag på fyra annonser = 100 kr styck.
//   SO_27_1–2 — miljöbild vid bryggan mot den beprövade sortimentsbilden.
//     KPI: vinst per 1 000 kr mot varandra och mot SO_5_1:s 240. Briefen:
//     "Samma adset, lika budget."  → 200 kr/dag på två annonser = 100 kr styck.
// Att lägga alla sex i ETT adset hade satt de två testen att konkurrera om
// samma budget, vilket är precis den svält briefarna vill bort från.
//
// Läs av SO_27 först vid 2 000 kr — briefen är uttrycklig om att inte döma tidigare.

const LP = 'https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd';

// Ordagrant ur copy-cardet, identiskt i alla sex briefar.
const COPY_SO = {
  message: 'Vi beställde för mycket motorhölje i 420D Oxfordtyg.\nNu säljer vi ut till 299 kr istället för 367 kr.\nVattenavvisande skydd mot regn, sol och damm.\nDragsko runt hela kanten för tät passform.\nPå och av på några sekunder.\nSå länge lagret räcker – beställ ditt hölje nu.',
  headline: '299 kr istället för 367 kr',
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
      campaignName: 'Motorhöljet ABO-test 08-19',
      create: { objective: 'OUTCOME_SALES', status: 'ACTIVE' }, // ABO — budget per adset
      adsets: [
        // Nedre tredjedelen: vad ska den bära när priset inte bär den?
        { name: 'Motorhölje SO_26 Batch 8 (ABO)', copy: COPY_SO, link: LP,
          dailyBudget: '40000', // 400 kr/dag = 100 kr per annons
          motifs: ['Enginecover_SO_26_1', 'Enginecover_SO_26_2',
                   'Enginecover_SO_26_3', 'Enginecover_SO_26_4'] },

        // Miljöbild mot sortimentsbild — kontots första statiska fotad utomhus.
        { name: 'Motorhölje SO_27 Batch 8 (ABO)', copy: COPY_SO, link: LP,
          dailyBudget: '20000', // 200 kr/dag = 100 kr per annons
          motifs: ['Enginecover_SO_27_1', 'Enginecover_SO_27_2'] },
      ],
    },
  ],
};
