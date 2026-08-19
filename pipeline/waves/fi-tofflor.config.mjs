// FI Tofflorna — Magiborsten FI, majavakauppa.fi. Launch 2026-08-19.
//
// Copy ordagrant ur ADCOPY_{PD,SP,CS,G}_FI.docx.
// Konceptkoder: PD = Demo, SP = Social proof, CS = Clearance sale, G = Lahja.
// Bilderna sorteras efter motiv: 1-presenten → G, 2-lagerrensning → CS,
// 3-onda-fotter → PD, 4-kundcitat → SP, 5-utan-text → PD (Axels regel).
//
// BREAK-EVEN ROAS 1,85
//   Inköp 12,08 USD × 0,86386 = 10,44 EUR + 2,90 EUR → 13,34 EUR
//   Pris 28,95 EUR → 28,95 / (28,95 − 13,34) = 1,8540    (FX 2026-08-18)
// CS-copyns priser kontrollerade mot butiken: 28,95 mot ordinarie 40,00 = 27,6 % ✓
//
// Majavakauppa saknar Instagram-identitet → noFormatCustomization.
//
// ⚠️ VIDEORNA SAKNAS. FI_Tofflor_*.mp4 finns inte i något av Metas bibliotek —
// bara NO-videorna blev uppladdade. Bilderna kopierade från NO-kontot 2026-08-19.
// Ladda upp videorna och kör om konfigen, så byggs bara de som saknas.

const LP = 'https://majavakauppa.fi/products/ergonomiset-tossut-paksupohjaiset-sisa-ja-ulkokayttoon';

const PD = {
  message: 'Jalkani kiittivät minua jo viiden minuutin jälkeen 🦶\n✅ Paksu pohja vaimentaa jokaisen askeleen\n✅ Niin kevyet, että unohdat pitäväsi niitä jalassa\n✅ Toimivat yhtä hyvin sisällä kuin ulkona\n👉 Tilaa omasi nyt ja tunne ero itse.',
  headline: 'Mukavimmat askeleet kotona',
  description: 'Paksu pohja. Mukava tunne. Joka päivä.',
  cta: 'SHOP_NOW', link: LP,
};
const SP = {
  message: 'Okei, nyt ymmärrän, miksi kaikki puhuvat näistä 👀\n✅ Tuhansia tyytyväisiä asiakkaita – ja sen huomaa\n✅ Mukava vaimennus, ei kipeitä jalkoja\n✅ Toimivat yhtä hyvin terassilla kuin olohuoneessa\n👉 Katso, miksi niin moni valitsee ne yhä uudelleen.',
  headline: 'Jalat saavat vihdoin levätä',
  description: 'Tuhansien asiakkaiden rakastamat Ruotsissa.',
  cta: 'SHOP_NOW', link: LP,
};
const CS = {
  message: 'VAIN TÄNÄÄN: 28 % alennus ⏰\n✅ Normaalihinta 40 € – nyt vain 28,95 €\n✅ Varasto hupenee nopeasti – useita kokoja on jo loppuunmyyty\n✅ Tämä hinta ei palaa huomenna\n👉 Varmista omasi ennen kuin ne loppuvat.',
  headline: '28 % alennus – vain tänään',
  description: 'Hinta on voimassa vain niin kauan kuin varastoa riittää.',
  cta: 'SHOP_NOW', link: LP,
};
const G = {
  message: 'Etsin lahjaa, joka tulisi oikeasti käyttöön 🎁\n✅ En jotain, joka päätyy laatikkoon ja unohtuu sinne\n✅ Hän hymyili, laittoi ne heti jalkaan – ja on käyttänyt niitä joka päivä siitä lähtien\n✅ Joskus yksinkertaisin lahja on paras\n👉 Löydä sama hymy jollekulle, jota rakastat.',
  headline: 'Lahja, joka saa heidät hymyilemään',
  description: 'Yksinkertainen lahja. Suuri reaktio.',
  cta: 'SHOP_NOW', link: LP,
};

export default {
  act: 'act_1619718346388201',   // Magiborsten FI (SEK)
  page: '1317870104733246',      // Majavakauppa — inget IG-konto kopplat
  pixel: '1554276343018184',
  link: LP,
  noFormatCustomization: true,
  dsaBeneficiary: 'Axel Odhner', // EU-krav
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['FI'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaigns: [
    {
      campaignName: 'Tofflorna FI | BE-ROAS 1,85 | 2026-08-19',
      create: { objective: 'OUTCOME_SALES', status: 'PAUSED', dailyBudget: '100000' },
      adsets: [
        { name: 'Tofflor FI - PD', copy: PD, link: LP,
          motifs: ['FI_Tofflor_PD_1', 'FI_Tofflor_PD_2', 'FI_Tofflor_PD_3',
                   '3-onda-fotter-fi', '5-utan-text'] },

        { name: 'Tofflor FI - SP', copy: SP, link: LP,
          motifs: ['FI_Tofflor_SP_1', 'FI_Tofflor_SP_2', 'FI_Tofflor_SP_3',
                   '4-kundcitat-fi'] },

        { name: 'Tofflor FI - CS', copy: CS, link: LP,
          motifs: ['FI_Tofflor_CS1', 'FI_Tofflor_CS2', 'FI_Tofflor_CS3',
                   '2-lagerrensning-fi'] },

        { name: 'Tofflor FI - G', copy: G, link: LP,
          motifs: ['FI_Tofflor_G_1', 'FI_Tofflor_G_2', 'FI_Tofflor_G_3',
                   '1-presenten-fi'] },
      ],
    },
  ],
};
