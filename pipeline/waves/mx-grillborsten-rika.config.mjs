// MX — dubblett av "Grillborsten MX", identisk i allt utom GEO.
//
// Exakt samma konto, sida, pixel, länk, copy, motiv, budget och status som
// mx-grillborsten.config.mjs. Enda skillnaden: targetingen är inte hela Mexiko
// utan enbart de rikaste städerna, kommunerna och stadsdelarna.
//
// OBS: Meta har ingen inkomst-/förmögenhetstargeting utanför USA. Geografi är
// alltså den enda spaken som finns för "rikast" på den här marknaden — därav
// listan nedan. Alla 20 nycklarna är verifierade mot Metas adgeolocationmeta
// 2026-08-14 (rätt land, rätt typ, rätt region).
//
// Urvalet, i korthet:
//   Nuevo León  — San Pedro Garza García (Mexikos rikaste kommun), Lomas del
//                 Valle, Zona Valle Oriente, Monterrey (metroområdet med
//                 landets högsta medelinkomst)
//   CDMX        — Miguel Hidalgo (Polanco/Lomas), Polanco, Lomas de
//                 Chapultepec, Benito Juárez, Del Valle, Coyoacán,
//                 Cuajimalpa, Santa Fe
//   Edomex      — Huixquilucan (Interlomas/Bosque Real), Metepec
//   Jalisco     — Zapopan (Puerta de Hierro/Andares)
//   Querétaro   — Querétaro Arteaga
//   Yucatán     — Mérida (norra Mérida är landets snabbast växande välstånd)
//   Turism/2:a hem — Cancún, Playa del Carmen, Los Cabos

const LP = 'https://laclinicadelasador.mx/products/elektrisk-grillborste';

const COPY = {
  message: '¿Sigues posponiendo la limpieza del asador desde el verano pasado?\n\nEl cepillo eléctrico de La Clínica del Asador hace el trabajo por ti: aprietas un botón y la parrilla queda limpia en minutos. Sin tallar, cero esfuerzo.\n\n✔ Inalámbrico y recargable\n✔ Gira 180° — llega a todos los rincones\n✔ Cabezales intercambiables, fáciles de lavar\n\nHaz clic en el enlace y pide el tuyo hoy.',
  headline: 'Parrilla limpia en minutos, sin cerdas.',
  description: 'Cepillo eléctrico para asador con cabezales intercambiables. Inalámbrico, recargable y fácil de usar. Pídelo hoy.',
  cta: 'SHOP_NOW',
  link: LP,
};

const GEO_RIKAST = {
  cities: [
    { key: '1551489' }, // San Pedro Garza García, Nuevo León
    { key: '1536363' }, // Monterrey, Nuevo León
    { key: '1560749' }, // Zapopan, Jalisco
    { key: '1535436' }, // Metepec, State of Mexico
    { key: '1542608' }, // Querétaro Arteaga
    { key: '1535184' }, // Mérida, Yucatán
    { key: '1508006' }, // Cancún, Quintana Roo
    { key: '1540930' }, // Playa del Carmen, Quintana Roo
  ],
  medium_geo_areas: [
    { key: '1523842' }, // Huixquilucan (Interlomas), State of Mexico
    { key: '688614'  }, // Los Cabos, Baja California Sur
  ],
  subcities: [
    { key: '1506139' }, // Benito Juárez, CDMX
    { key: '1512787' }, // Cuajimalpa de Morelos, CDMX
    { key: '2856652' }, // Santa Fe Cuajimalpa, CDMX
    { key: '1512476' }, // Coyoacán, CDMX
  ],
  neighborhoods: [
    { key: '2810794' }, // Miguel Hidalgo, CDMX
    { key: '2866883' }, // Polanco, CDMX
    { key: '1532104' }, // Lomas de Chapultepec, CDMX
    { key: '2866882' }, // Colonia del Valle, CDMX
    { key: '2819907' }, // Lomas del Valle, San Pedro Garza García
    { key: '2819848' }, // Zona Valle Oriente, Nuevo León
  ],
  location_types: ['home', 'recent'],
};

export default {
  act: 'act_918424617391896',    // Snark mexico (SEK)
  page: '1334949959694822',      // La Clínica del Asador
  pixel: '776922878287560',      // Grillkliniken
  link: LP,
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: GEO_RIKAST,
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaigns: [
    {
      campaignName: 'Grillborsten MX - Rikaste områdena',
      create: { objective: 'OUTCOME_SALES', status: 'PAUSED', dailyBudget: '100000' }, // 1000 kr/dag CBO
      adsets: [
        {
          name: 'Grillborste MX - Rikaste områdena',
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
