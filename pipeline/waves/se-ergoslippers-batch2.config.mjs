// SE Ergonomiska Tofflorna — Batch 2, 2026-08-19.
//
// Sju statiska, alla med 1:1 och 4:5. Tre nya adsets, utspritt efter koncept.
//
// STRUKTUR enligt Axels instruktion: rakt in i den befintliga CBO-kampanjen
// "Ergonomiska Tofflorna" (1000 kr/dag). Ingen budget på adsetnivå, inget
// minimum spend — kampanjen fördelar.
//
// COPY: briefarna i Notions "Tofflor Ergonomiska" specificerar bara texten som
// ska brännas in i BILDEN, inte annonstexten i Ads Manager. Alltså gäller Axels
// instruktion: samma copy som kontot redan kör på respektive koncept.
//   PD → ordagrant från adsetet "Tofflor PD"
//   SP → ordagrant från adsetet "Tofflor SP"
//   SO → se nedan
//
// ⚠️ SO-copyn är NY, för det finns ingen tidigare SO-copy att ärva. Kampanjens
// enda offer-adset är "Tofflor CS", och dess text är en oifylld mall — den står
// bokstavligen "IDAG ENDAST: [RABATT]% rabatt" och "Ordinarie pris [ORDINARIE
// PRIS] kr – nu bara [REApris] kr" i kontot. Den går inte att kopiera. Texten
// nedan är därför skriven på briefarnas tillåtna fakta och i samma röst som PD
// och SP: bara talen 309, 400 och 91, inga procent, ingen nedräkning, inga
// omdömen. Priserna kontrollerade mot butiken 2026-08-19: 309 kr mot 400 kr.

const LP = 'https://baverbutiken.se/products/tofflor-ergonomiska-tjocksulade-for-inne-ute';

// Ordagrant ur adsetet "Tofflor PD"
const COPY_PD = {
  message: 'Mina fötter tackade mig efter fem minuter i de här 🦶\n✅ Tjock sula som tar upp varje steg\n✅ Lätta som ingenting – du glömmer att du har dem på\n✅ Fungerar lika bra inne som ute\n👉 Beställ dina nu och känn skillnaden själv.',
  headline: 'Skönaste stegen du tar hemma',
  description: 'Tjock sula. Skön känsla. Varje dag.',
  cta: 'SHOP_NOW', link: LP,
};

// Ordagrant ur adsetet "Tofflor SP"
const COPY_SP = {
  message: 'Okej, nu förstår jag varför alla pratar om de här 👀\n✅ Tusentals nöjda kunder – och det märks\n✅ Skön dämpning, inga ömma fötter\n✅ Fungerar precis lika bra på altanen som i vardagsrummet\n👉 Se varför så många väljer om och om igen.',
  headline: 'Fötter som äntligen får vila',
  description: 'Älskade av tusentals kunder i Sverige.',
  cta: 'SHOP_NOW', link: LP,
};

// Ny — ingen tidigare SO-copy finns i kampanjen. Se noten överst.
const COPY_SO = {
  message: 'Tjocksulade tofflor för inne och ute – nu 309 kr istället för 400 kr 🦶\n✅ Du sparar 91 kr\n✅ Tjock, stötdämpande sula som tar upp varje steg\n✅ Fungerar lika bra på altanen som i vardagsrummet\n👉 Beställ dina nu.',
  headline: '309 kr istället för 400 kr',
  description: 'Klarna och 30 dagars öppet köp.',
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
      // Befintlig CBO-kampanj, 1000 kr/dag — ingen create, inga adsetbudgetar.
      campaignName: 'Ergonomiska Tofflorna',
      adsets: [
        { name: 'Tofflor PD Batch 2', copy: COPY_PD, link: LP,
          motifs: ['Ergoslippers_PD_7_1', 'Ergoslippers_PD_8_1',
                   'Ergoslippers_PD_9_1', 'Ergoslippers_PD_10_1'] },

        { name: 'Tofflor SO Batch 2', copy: COPY_SO, link: LP,
          motifs: ['Ergoslippers_SO_2_1', 'Ergoslippers_SO_3_1'] },

        { name: 'Tofflor SP Batch 2', copy: COPY_SP, link: LP,
          motifs: ['Ergoslippers_SP_5_1'] },
      ],
    },
  ],
};
