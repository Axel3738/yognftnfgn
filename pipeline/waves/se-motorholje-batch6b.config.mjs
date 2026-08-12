// SE Motorhöljet — påfyllning av Batch 6-adseten, 2026-08-11.
//
// COPY GATE (från Notion-briefsen): Ads Manager autofyller primärtext från en sparad
// preset kopplad till vinkelprefixet i annonsnamnet (PD_/SP_/SO_). Tre batchar i rad
// har gått live med copy ingen briefat. Copyn nedan är COPY CARD:en ordagrant från
// briefen — de skrivs explicit på varje creative så presetet aldrig får slå till.
//
// Ett copy card per vinkel; briefsen delar kort inom samma block:
//   PD: PD_19_1, PD_19_2, PD_21_H1, PD_22_H1, PD_23_H1
//   SP: SP_16_H1 (4 openings), SP_17_H1, SP_18_1  (SP_9_H1 saknar brief — se nedan)
//   SO: SO_16_1..5, SO_17_1, SO_20_1

const LP = 'https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd';

const COPY_PD = {
  message: 'Är din utombordare en av de större på bryggan?\nDet här höljet är gjort för att sitta som gjutet — inte "passar de flesta".\n420D Oxfordtyg och dragsko runt hela kanten håller regn och salt ute.\nPå och av på sekunder.\nHitta din storlek och skydda den. 👇',
  headline: 'Gjord för större motorer',
  description: '',
  link: LP,
};

const COPY_SP = {
  message: 'Din utombordare står ute i alla väder.\nSol bleker plasten. Salt och damm sätter sig i varje skarv.\nMotorhölje i 420D Oxfordtyg, vattenavvisande, med dragsko runt hela kanten.\nPå och av på några sekunder — ingen risk att glömma täcka den.\n30 dagars nöjd-kund-garanti.\nBeställ ditt motorhölje idag.',
  headline: 'Skydd som sitter kvar, i alla väder',
  description: '',
  link: LP,
};

const COPY_SO = {
  message: 'Vi beställde för mycket motorhölje i 420D Oxfordtyg.\nNu säljer vi ut till 299 kr istället för 367 kr.\nVattenavvisande skydd mot regn, sol och damm.\nDragsko runt hela kanten för tät passform.\nPå och av på några sekunder.\nSå länge lagret räcker – beställ ditt hölje nu.',
  headline: '299 kr istället för 367 kr',
  description: '',
  link: LP,
};

export default {
  act: 'act_1867947880635861',     // MagiBorsten (SE)
  page: '678639638662543',         // Bäverbutiken.se
  instagram: '17841474144960111',
  pixel: '1554276343018184',
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['SE'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  campaigns: [
    {
      campaignName: 'Motorhöljet',
      adsets: [
        { name: 'Motorhölje PD Batch 6', copy: COPY_PD,
          motifs: ['Enginecover_PD_19_1', 'Enginecover_PD_19_2',
                   'Enginecover_PD_21_H1', 'Enginecover_PD_22_H1', 'Enginecover_PD_23_H1'] },

        { name: 'Motorhölje SP Batch 6', copy: COPY_SP,
          motifs: ['Enginecover_SP_16_H1 Opening 1', 'Enginecover_SP_16_H1 Opening 2',
                   'Enginecover_SP_16_H1 Opening 3', 'Enginecover_SP_16_H1 Opening 4',
                   'Enginecover_SP_17_H1', 'Enginecover_SP_18_1',
                   // SP_9_H1 saknar brief i Notion — kör SP-blockets copy tills annat sägs
                   'Enginecover_SP_9_H1'] },

        { name: 'Motorhölje SO Batch 6', copy: COPY_SO,
          motifs: ['Enginecover_SO_16_1', 'Enginecover_SO_16_2', 'Enginecover_SO_16_3',
                   'Enginecover_SO_16_4', 'Enginecover_SO_16_5',
                   'Enginecover_SO_17_1', 'Enginecover_SO_20_1'] },
      ],
    },
  ],
};
