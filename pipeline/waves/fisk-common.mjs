// Fiskespöhållaren till NO/DK/FI/UK — gemensam byggare, 2026-08-20.
//
// Copyn är marknadsanpassade översättningar av SE-kampanjens copy per koncept
// (kampanj "Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18"), med tre
// medvetna avvikelser, samma disciplin som tidigare vågor:
//   1. CS: SE-copyn påstår "40% RABATT" och "priset går tillbaka till ordinarie
//      imorgon". Ingen av de fyra butikerna har något jämförpris (NO:s är
//      trasigt: 148,75 under priset 269). Procentsatsen och "ordinarie" är
//      alltså overifierbara — CS kör lagerrensning + riktigt pris i stället.
//   2. SO: SE-raderna "Fri frakt över 300 kr" och "Betala sen med Klarna" är
//      SE-specifika villkor som inte är verifierade i de andra butikerna.
//      Ersatta med 30 dagars öppet köp, som gäller överallt.
//   3. Alla priser är butikernas verkliga: 269 NOK / 209 DKK / 27,90 EUR / £20.99.
//
// BE-ROAS = pris / (pris − inköp), FX 2026-08-20 (USD→NOK 9,3335, USD→DKK 6,40,
// USD→EUR 0,85609, USD→GBP 0,73388, EUR→DKK 7,4758):
//   NO: 7,70 USD = 71,87 NOK  → 269/197,13  = 1,36
//   DK: 7,80 USD + 2,90 EUR = 71,60 DKK → 209/137,40 = 1,52
//   FI: 8,60 USD + 2,90 EUR = 10,26 EUR → 27,90/17,64 = 1,58
//   UK: 6,50 USD = 4,77 GBP  → 20,99/16,22 = 1,29

export function marknad({ m, act, page, lp, country, produkt, pris, beRoas, dsa, extra = {}, texts }) {
  const bild = suffix => `Fiskespöhållare_${suffix}_2_1_${m}`;
  const video = (k, h) => `${m}_${k}_1_H${h}`;
  const adset = (k, copy) => ({
    name: `Fiskespöhållare ${m} - ${k}`, copy: { ...copy, cta: 'SHOP_NOW', link: lp }, link: lp,
    motifs: [video(k, 1), video(k, 2), video(k, 3), bild(k)],
  });
  return {
    act, page, pixel: '1554276343018184', link: lp,
    ...(dsa ? { dsaBeneficiary: 'Axel Odhner' } : {}),
    ...extra,
    targeting: {
      age_min: 18, age_max: 65,
      geo_locations: { countries: [country], location_types: ['home', 'recent'] },
      targeting_automation: { advantage_audience: 1 },
    },
    adsetStatus: 'ACTIVE', adStatus: 'ACTIVE',
    campaigns: [{
      campaignName: `Fiskespöhållaren ${m} | BE-ROAS ${beRoas} | 2026-08-20`,
      create: { objective: 'OUTCOME_SALES', status: 'ACTIVE', dailyBudget: '100000' }, // 1000 kr/dag CBO
      adsets: [
        adset('PD', texts.PD), adset('SO', texts.SO), adset('SP', texts.SP),
        adset('CS', texts.CS), adset('GT', texts.GT),
      ],
    }],
  };
}
