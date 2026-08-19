// DK Tofflorna — Magiborsten DK, bæverbutiken.dk. Launch 2026-08-19.
//
// Copy ordagrant ur ADCOPY_{PD,SP,CS,G}_DK.docx.
// Konceptkoder: PD = Demo, SP = Social proof, CS = Clearance sale, G = Gave.
// Bilderna sorteras efter motiv: 1-presenten → G, 2-lagerrensning → CS,
// 3-onda-fotter → PD, 4-kundcitat → SP, 5-utan-text → PD (Axels regel).
//
// BREAK-EVEN ROAS 1,64
//   Inköp 10,45 USD × 6,4581 = 67,49 DKK + 2,90 EUR × 7,4759 = 21,68 DKK → 89,17 DKK
//   Pris 229 DKK → 229 / (229 − 89,17) = 1,6378        (FX 2026-08-18)
// CS-copyns priser kontrollerade mot butiken: 229 mot ordinarie 340 = 32,6 % ✓
//
// ⚠️ VIDEORNA SAKNAS. DK_Tofflor_{CS1-3,G_1-3,PD_1-3,SP_1-3}.mp4 finns inte i
// något av Metas bibliotek — bara NO-videorna blev uppladdade. Bilderna kopierade
// från NO-kontot 2026-08-19. Motiven ligger kvar i listan: ladda upp videorna och
// kör om konfigen, så byggs bara de som saknas (duplikatskydd per adset).

const LP = 'https://xn--bverbutiken-98a.dk/products/ergonomiske-hjemmesko-tyk-sal-til-inde-ude';

const PD = {
  message: 'Mine fødder takkede mig efter fem minutter i dem her 🦶\n✅ Tyk sål, der absorberer hvert skridt\n✅ Så lette, at du glemmer, du har dem på\n✅ Fungerer lige godt inde som ude\n👉 Bestil dine nu, og mærk selv forskellen.',
  headline: 'De mest behagelige skridt derhjemme',
  description: 'Tyk sål. Behagelig følelse. Hver dag.',
  cta: 'SHOP_NOW', link: LP,
};
const SP = {
  message: 'Okay, nu forstår jeg, hvorfor alle taler om dem her 👀\n✅ Tusindvis af tilfredse kunder – og det kan mærkes\n✅ Behagelig stødabsorbering, ingen ømme fødder\n✅ Fungerer lige så godt på terrassen som i stuen\n👉 Se, hvorfor så mange vælger dem igen og igen.',
  headline: 'Fødder, der endelig får ro',
  description: 'Elsket af tusindvis af kunder i Sverige.',
  cta: 'SHOP_NOW', link: LP,
};
const CS = {
  message: 'KUN I DAG: 33 % rabat ⏰\n✅ Normalpris 340 kr. – nu kun 229 kr.\n✅ Lageret svinder hurtigt – flere størrelser er allerede udsolgt\n✅ Denne pris kommer ikke tilbage i morgen\n👉 Sikr dig dine, før de er udsolgt.',
  headline: '33 % rabat – kun i dag',
  description: 'Prisen gælder kun, så længe lager haves.',
  cta: 'SHOP_NOW', link: LP,
};
const G = {
  message: 'Jeg ledte efter en gave, der rent faktisk ville blive brugt 🎁\n✅ Ikke noget, der ender i en skuffe og bliver glemt\n✅ Han smilede, tog dem på med det samme – og har haft dem på hver dag siden\n✅ Nogle gange er den enkleste gave den bedste\n👉 Find det samme smil til en, du holder af.',
  headline: 'Gaven, der får dem til at smile',
  description: 'Enkel gave. Stor reaktion.',
  cta: 'SHOP_NOW', link: LP,
};

export default {
  act: 'act_915422744950975',    // Magiborsten DK (SEK)
  page: '1324465810740336',      // Bæverbutiken (DK)
  pixel: '1554276343018184',
  link: LP,
  dsaBeneficiary: 'Axel Odhner', // EU-krav
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['DK'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaigns: [
    {
      campaignName: 'Tofflorna DK | BE-ROAS 1,64 | 2026-08-19',
      create: { objective: 'OUTCOME_SALES', status: 'PAUSED', dailyBudget: '100000' },
      adsets: [
        { name: 'Tofflor DK - PD', copy: PD, link: LP,
          motifs: ['DK_Tofflor_PD_1', 'DK_Tofflor_PD_2', 'DK_Tofflor_PD_3',
                   '3-onda-fotter-dk', '5-utan-text'] },

        { name: 'Tofflor DK - SP', copy: SP, link: LP,
          motifs: ['DK_Tofflor_SP_1', 'DK_Tofflor_SP_2', 'DK_Tofflor_SP_3',
                   '4-kundcitat-dk'] },

        { name: 'Tofflor DK - CS', copy: CS, link: LP,
          motifs: ['DK_Tofflor_CS1', 'DK_Tofflor_CS2', 'DK_Tofflor_CS3',
                   '2-lagerrensning-dk'] },

        { name: 'Tofflor DK - G', copy: G, link: LP,
          motifs: ['DK_Tofflor_G_1', 'DK_Tofflor_G_2', 'DK_Tofflor_G_3',
                   '1-presenten-dk'] },
      ],
    },
  ],
};
