// MX — Snark mexico, laclinicadelasador.mx. En kampanj, ett adset, alla annonser.
//
// Copy levererad av Axel, används ordagrant. Pixeln är Grillklinikens (776922878287560),
// delad med MX-kontot 2026-08-12. Sidan är La Clínica del Asador.
//
// OBS: varje video ligger uppladdad TVÅ gånger i biblioteket med olika ID men samma
// filnamn. Skriptet slår ihop på namn, så varje motiv blir en annons — inte två.

const LP = 'https://laclinicadelasador.mx/products/elektrisk-grillborste';

const COPY = {
  message: '¿Sigues posponiendo la limpieza del asador desde el verano pasado?\n\nEl cepillo eléctrico de La Clínica del Asador hace el trabajo por ti: aprietas un botón y la parrilla queda limpia en minutos. Sin tallar, cero esfuerzo.\n\n✔ Inalámbrico y recargable\n✔ Gira 180° — llega a todos los rincones\n✔ Cabezales intercambiables, fáciles de lavar\n\nHaz clic en el enlace y pide el tuyo hoy.',
  headline: 'Parrilla limpia en minutos, sin cerdas.',
  description: 'Cepillo eléctrico para asador con cabezales intercambiables. Inalámbrico, recargable y fácil de usar. Pídelo hoy.',
  cta: 'SHOP_NOW',
  link: LP,
};

export default {
  act: 'act_918424617391896',    // Snark mexico (SEK)
  page: '1334949959694822',      // La Clínica del Asador
  pixel: '776922878287560',      // Grillkliniken
  link: LP,
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['MX'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaigns: [
    {
      campaignName: 'Grillborsten MX',
      create: { objective: 'OUTCOME_SALES', status: 'PAUSED', dailyBudget: '100000' }, // 1000 kr/dag CBO
      adsets: [
        {
          name: 'Grillborste MX - Broad',
          copy: COPY,
          link: LP,
          motifs: [
            'MX_001', 'MX_050',
            'MX_101_H2', 'MX_101_H3',
            'MX_110_H1', 'MX_110_H2 2', 'MX_110_H3 2',
            'MX_128B_H1', 'MX_128B_H2', 'MX_128B_H3', 'MX_128B_H4', 'MX_128B_H5',
            'MX_235_H1 2', 'MX_235_H2 2', 'MX_235_H3 2', 'MX_235_H4 2',
            'MX_Meta_AQO',
          ],
        },
      ],
    },
  ],
};
