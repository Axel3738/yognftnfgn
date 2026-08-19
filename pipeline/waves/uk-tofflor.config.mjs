// UK Tofflorna — Magiborsten UK, beavershop.co.uk. Launch 2026-08-19.
//
// Copy ordagrant ur ADCOPY_{PD,SP,CS,G}_UK.docx.
// Konceptkoder: PD = Demo, SP = Social proof, CS = Clearance sale, G = Gift.
// Bilderna sorteras efter motiv: 1-presenten → G, 2-lagerrensning → CS,
// 3-onda-fotter → PD, 4-kundcitat → SP, 5-utan-text → PD (Axels regel).
//
// BREAK-EVEN ROAS 1,35
//   Inköp 8,40 USD × 0,73933 = 6,21 GBP
//   Pris 23,95 GBP → 23,95 / (23,95 − 6,21) = 1,3501    (FX 2026-08-18)
// CS-copyns priser kontrollerade mot butiken: Shopify-basen är SEK (310 kr mot
// ordinarie 491 kr = 36,9 %), vilket i GBP-presentation blir 23,95 mot 38 ✓
//
// BeaverShop-sidan saknar Instagram-identitet → noFormatCustomization.
//
// ⚠️ VIDEORNA SAKNAS. UK_Tofflor_*.mp4 finns inte i något av Metas bibliotek —
// bara NO-videorna blev uppladdade. Bilderna kopierade från NO-kontot 2026-08-19.
// Ladda upp videorna och kör om konfigen, så byggs bara de som saknas.

const LP = 'https://beavershop.co.uk/products/ergonomic-slippers-thick-soled-for-indoors-outdoors';

const PD = {
  message: 'My feet thanked me after five minutes in these 🦶\n✅ Thick sole that cushions every step\n✅ So light you\'ll forget you\'re wearing them\n✅ Works just as well indoors as outdoors\n👉 Order yours now and feel the difference for yourself.',
  headline: 'Your comfiest steps at home',
  description: 'Thick sole. Comfortable feel. Every day.',
  cta: 'SHOP_NOW', link: LP,
};
const SP = {
  message: 'Okay, now I get why everyone\'s talking about these 👀\n✅ Thousands of happy customers – and you can feel why\n✅ Comfortable cushioning, no sore feet\n✅ Works just as well on the patio as in the living room\n👉 See why so many choose them again and again.',
  headline: 'Feet that finally get a rest',
  description: 'Loved by thousands of customers in Sweden.',
  cta: 'SHOP_NOW', link: LP,
};
const CS = {
  message: 'TODAY ONLY: 37% off ⏰\n✅ Regular price £38 – now only £23.95\n✅ Stock is going fast – several sizes are already sold out\n✅ This price won\'t be back tomorrow\n👉 Get yours before they\'re gone.',
  headline: '37% off – today only',
  description: 'This price only lasts while stocks last.',
  cta: 'SHOP_NOW', link: LP,
};
const G = {
  message: 'I was looking for a gift they\'d actually use 🎁\n✅ Not something that ends up in a drawer and gets forgotten\n✅ He smiled, put them on straight away – and has worn them every day since\n✅ Sometimes the simplest gift is the best\n👉 Bring the same smile to someone you love.',
  headline: 'The gift that makes them smile',
  description: 'Simple gift. Big reaction.',
  cta: 'SHOP_NOW', link: LP,
};

export default {
  act: 'act_1107817401910319',   // Magiborsten UK (SEK)
  page: '1305042582683792',      // BeaverShop — ingen IG-koppling
  pixel: '1554276343018184',
  link: LP,
  noFormatCustomization: true,
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['GB'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaigns: [
    {
      campaignName: 'Tofflorna UK | BE-ROAS 1,35 | 2026-08-19',
      create: { objective: 'OUTCOME_SALES', status: 'PAUSED', dailyBudget: '100000' },
      adsets: [
        { name: 'Tofflor UK - PD', copy: PD, link: LP,
          motifs: ['UK_Tofflor_PD_1', 'UK_Tofflor_PD_2', 'UK_Tofflor_PD_3',
                   '3-onda-fotter-uk', '5-utan-text'] },

        { name: 'Tofflor UK - SP', copy: SP, link: LP,
          motifs: ['UK_Tofflor_SP_1', 'UK_Tofflor_SP_2', 'UK_Tofflor_SP_3',
                   '4-kundcitat-uk'] },

        { name: 'Tofflor UK - CS', copy: CS, link: LP,
          motifs: ['UK_Tofflor_CS1', 'UK_Tofflor_CS2', 'UK_Tofflor_CS3',
                   '2-lagerrensning-uk'] },

        { name: 'Tofflor UK - G', copy: G, link: LP,
          motifs: ['UK_Tofflor_G_1', 'UK_Tofflor_G_2', 'UK_Tofflor_G_3',
                   '1-presenten-uk'] },
      ],
    },
  ],
};
