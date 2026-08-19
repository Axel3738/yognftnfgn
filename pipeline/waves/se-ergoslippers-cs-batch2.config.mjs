// SE Ergonomiska Tofflorna — CS Batch 2, 2026-08-19.
//
// Tre videor, alla i CS-konceptet (clearance sale). Ett nytt adset, rakt in i
// den befintliga CBO-kampanjen "Ergonomiska Tofflorna" (1000 kr/dag). Ingen
// budget på adsetnivå, inget minimum spend.
//
// COPY — varför den inte är kopierad rakt av:
// Kampanjens befintliga CS-adset innehåller en OIFYLLD mall. Det står ordagrant
// "IDAG ENDAST: [RABATT]% rabatt" och "Ordinarie pris [ORDINARIE PRIS] kr – nu
// bara [REApris] kr" i kontot. Den går inte att ärva.
//
// Notion-sidan "Tofflor ergonomiska REMAKE" (2026-08-18) förklarar varför:
//   "you need to regenerate all of the clearance sale ads and the copy because
//    the prices and everything are not accurate at all."
// De här tre videorna ÄR den remaken, och copyn ska alltså också göras om.
//
// Texten nedan är därför Axels egen CS-struktur — samma som han skrev för NO,
// DK, FI och UK samma dag — med de svenska siffrorna ifyllda och kontrollerade
// mot butiken 2026-08-19: 309 kr mot ordinarie 400 kr, spar 91 kr = 22,75 %.
//
// ⚠️ EN RAD ÄR UTBYTT. Originalmallen har "Lagret krymper snabbt – flera
// storlekar redan slut". Butiken har 14 varianter och NOLL slutsålda just nu,
// så påståendet är falskt. Eftersom hela poängen med remaken är att uppgifterna
// ska stämma är den raden ersatt med en som faktiskt gäller. Blir storlekar
// slutsålda kan originalraden återinföras.

const LP = 'https://baverbutiken.se/products/tofflor-ergonomiska-tjocksulade-for-inne-ute';

const COPY_CS = {
  message: 'IDAG ENDAST: 23 % rabatt ⏰\n✅ Ordinarie pris 400 kr – nu bara 309 kr\n✅ Du sparar 91 kr\n✅ Tjock, stötdämpande sula – lika skön inne som ute\n👉 Säkra dina innan de är slut.',
  headline: '23 % rabatt – idag endast',
  description: 'Priset gäller bara så länge lagret räcker.',
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
      // Befintlig CBO-kampanj, 1000 kr/dag — ingen create, ingen adsetbudget.
      campaignName: 'Ergonomiska Tofflorna',
      adsets: [
        { name: 'Tofflor CS Batch 2', copy: COPY_CS, link: LP,
          motifs: ['Tofflor Ergonomiska_CS1',
                   'Tofflor Ergonomiska_CS2',
                   'Tofflor Ergonomiska_CS3'] },
      ],
    },
  ],
};
