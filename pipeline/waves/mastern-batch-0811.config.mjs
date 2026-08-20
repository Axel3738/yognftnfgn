// Mastern-batch 2026-08-11 — SnarkLös. Koncept 256, 276, 277, 278, 279, 282.
// Destinationer enligt Axels routing; 277 splittas per hook (H1/H2 overstock → Brynis,
// H3 gåvovinkel → #12). BASE-adset mot produktsidan för varje koncept.
export default {
  act: 'act_1346450049878358',            // SnarkLös
  campaignId: '120242897371730074',       // Mastern
  templateAdsetId: '120248735622250074',  // 253 LISTICLE 08-09 — klonas
  dateSuffix: '08-11',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',

  destinations: {
    PRODUKT: 'https://grillkliniken.se/products/elektrisk-grillborste',
    P110:    'https://grillkliniken.se/pages/110?_ab=0&key=1782984181039',
    BRYNIS:  'https://grillkliniken.se/pages/landing-page-blank-jun-23-22-43-04?_ab=0&key=1782984238906',
    NR11:    'https://grillkliniken.se/pages/landing-page-blank-jul-3-08-48-08?_ab=0&key=1783091411277',
    NR12:    'https://grillkliniken.se/pages/landing-page-blank-jul-3-09-12-32?_ab=0&key=1783091419032',
  },
  // används bara när ett koncept splittas på flera destinationer
  destLabels: { NR12: 'GIFT', BRYNIS: 'OVERSTOCK' },

  // kampanjens standardcopy (515 av 541 befintliga annonser kör den)
  copy: {
    message: 'Har du skjutit upp grillrengöringen sedan förra sommaren?\n\nGrillklinikens elektriska grillborste gör jobbet åt dig, tryck på en knapp och gallret är rent på minuter. \nIngen skrubbning, noll ansträngning.\n\n✔ Trådlös och laddningsbar\n✔ Roterar 180° — kommer åt överallt\n✔ Utbytbara borsthuvuden, enkla att tvätta\n\nKlicka på länken och beställ din idag.',
    headline: 'Rent galler på minuter — utan ett enda borststrå',
  },

  concepts: [
    { name: '256',
      videos: { H1: '256 HOOK 1', H2: '256 HOOK 2', H3: '256 HOOK 3', H4: '256 HOOK 4' },
      hooks:  { H1: 'P110', H2: 'P110', H3: 'P110', H4: 'P110' } },

    { name: '276',
      videos: { H1: '276 HOOK 1', H2: '276 HOOK 2', H3: '276 HOOK 3' },
      hooks:  { H1: 'NR12', H2: 'NR12', H3: 'NR12' } },

    // H1/H2 = overstock-hooks → Brynis · H3 = fars dag/gåva → #12
    { name: '277',
      videos: { H1: '277_H1', H2: '277_H2', H3: '277_H3' },
      hooks:  { H1: 'BRYNIS', H2: 'BRYNIS', H3: 'NR12' } },

    { name: '278',
      videos: { H1: '278 HOOK 1', H2: '278 HOOK 2', H3: '278 HOOK 3' },
      hooks:  { H1: 'NR12', H2: 'NR12', H3: 'NR12' } },

    { name: '279',
      videos: { H1: '279_H1', H2: '279_H2', H3: '279_H3' },
      hooks:  { H1: 'BRYNIS', H2: 'BRYNIS', H3: 'BRYNIS' } },

    { name: '282',
      videos: { H1: '282 HOOK 1', H2: '282 HOOK 2', H3: '282 HOOK 3' },
      hooks:  { H1: 'NR11', H2: 'NR11', H3: 'NR11' } },
  ],
};
