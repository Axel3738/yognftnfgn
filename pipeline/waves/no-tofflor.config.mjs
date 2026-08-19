// NO Tofflorna — Magiborsten NO, beverbutikken.no. Launch 2026-08-19.
//
// Copy ordagrant ur ADCOPY_{PD,SP,CS,G}_NO.docx. Radbrytningarna följer docxens
// <w:br/>, dvs en rad per bullet.
//
// Konceptkoderna i filnamnen: PD = Demo, SP = Social proof, CS = Clearance sale,
// G = Gave. Bilderna saknar kod och sorteras efter sitt eget motiv:
//   1-presenten → G, 2-lagerrensning → CS, 3-onda-fotter → PD, 4-kundcitat → SP.
//   5-utan-text har varken kod eller vinkel → PD, enligt Axels regel.
//
// BREAK-EVEN ROAS 1,45
//   Inköp 10,21 USD × 9,4182 (USD/NOK 2026-08-18) = 96,16 NOK
//   Pris 309 NOK → 309 / (309 − 96,16) = 1,4517
// Prisuppgifterna i CS-copyn är kontrollerade mot butiken: 309 kr mot ordinarie
// 400 kr = 22,75 %, dvs "23 % rabatt" håller.

const LP = 'https://beverbutikken.no/products/tofler-ergonomiske-tykksalede-for-inne-ute';

const PD = {
  message: 'Føttene mine takket meg etter fem minutter i disse 🦶\n✅ Tykk såle som demper hvert steg\n✅ Så lette at du glemmer at du har dem på\n✅ Fungerer like godt inne som ute\n👉 Bestill dine nå og kjenn forskjellen selv.',
  headline: 'De behageligste stegene du tar hjemme',
  description: 'Tykk såle. Behagelig følelse. Hver dag.',
  cta: 'SHOP_NOW', link: LP,
};
const SP = {
  message: 'Ok, nå skjønner jeg hvorfor alle snakker om disse 👀\n✅ Tusenvis av fornøyde kunder – og det merkes\n✅ Behagelig demping, ingen ømme føtter\n✅ Fungerer like godt på terrassen som i stua\n👉 Se hvorfor så mange velger dem igjen og igjen.',
  headline: 'Føtter som endelig får hvile',
  description: 'Elsket av tusenvis av kunder i Sverige.',
  cta: 'SHOP_NOW', link: LP,
};
const CS = {
  message: 'KUN I DAG: 23 % rabatt ⏰\n✅ Ordinær pris 400 kr – nå kun 309 kr\n✅ Lageret krymper raskt – flere størrelser er allerede utsolgt\n✅ Denne prisen kommer ikke tilbake i morgen\n👉 Sikre deg dine før de blir utsolgt.',
  headline: '23 % rabatt – kun i dag',
  description: 'Prisen gjelder bare så lenge lageret rekker.',
  cta: 'SHOP_NOW', link: LP,
};
const G = {
  message: 'Jeg lette etter en gave som faktisk kom til å bli brukt 🎁\n✅ Ikke noe som havner i en skuff og blir glemt\n✅ Han smilte, tok dem på med én gang – og har brukt dem hver dag siden\n✅ Noen ganger er den enkleste gaven den beste\n👉 Finn det samme smilet til noen du er glad i.',
  headline: 'Gaven som får dem til å smile',
  description: 'Enkel gave. Stor reaksjon.',
  cta: 'SHOP_NOW', link: LP,
};

export default {
  act: 'act_1050941584152547',   // Magiborsten NO (SEK)
  page: '879054088633562',       // Beverbutikken.no
  pixel: '1554276343018184',
  link: LP,
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['NO'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaigns: [
    {
      campaignName: 'Tofflorna NO | BE-ROAS 1,45 | 2026-08-19',
      create: { objective: 'OUTCOME_SALES', status: 'PAUSED', dailyBudget: '100000' }, // 1000 kr/dag CBO
      adsets: [
        { name: 'Tofflor NO - PD', copy: PD, link: LP,
          motifs: ['NO_Tofflor_PD_1', 'NO_Tofflor_PD_2', 'NO_Tofflor_PD_3',
                   '3-onda-fotter-no', '5-utan-text'] },

        { name: 'Tofflor NO - SP', copy: SP, link: LP,
          motifs: ['NO_Tofflor_SP_1', 'NO_Tofflor_SP_2', 'NO_Tofflor_SP_3',
                   '4-kundcitat-no'] },

        { name: 'Tofflor NO - CS', copy: CS, link: LP,
          motifs: ['NO_Tofflor_CS1', 'NO_Tofflor_CS2', 'NO_Tofflor_CS3',
                   '2-lagerrensning-no'] },

        { name: 'Tofflor NO - G', copy: G, link: LP,
          motifs: ['NO_Tofflor_G_1', 'NO_Tofflor_G_2', 'NO_Tofflor_G_3',
                   '1-presenten-no'] },
      ],
    },
  ],
};
