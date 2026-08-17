// Mastern-batch 12, 2026-08-16 — SnarkLös. Koncept 110 REMAKE, 128 REMAKE, 282 V2, 285.
// Allt skapat PAUSED enligt Axels beställning. BASE mot produktsidan + LISTICLE
// mot respektive landningssida, identisk copy (kampanjstandarden), SHOP_NOW.
//
// OBS: batchen är REDAN SKAPAD i kontot (2026-08-17, via Meta-MCP eftersom
// META_ACCESS_TOKEN saknades i sessionen). Kör INTE den här konfigen på nytt utan
// att först kolla att adseten nedan inte redan finns — annars dubbleras annonserna.
// Skapade adset: 110 REMAKE BASE/LISTICLE 120248926760440074/120248926762710074,
// 128 REMAKE 120248926768480074/120248926772680074, 282 V2 120248926780430074/
// 120248926783170074, 285 120248926786040074/120248926789250074.
export default {
  act: 'act_1346450049878358',            // SnarkLös
  campaignId: '120242897371730074',       // Mastern
  templateAdsetId: '120248915527340074',  // 289 BASE 08-15 — senaste batchens mall
  dateSuffix: '08-16',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',

  destinations: {
    PRODUKT:   'https://grillkliniken.se/products/elektrisk-grillborste',
    P110TEK:   'https://grillkliniken.se/pages/110-235-teknikern?_ab=0&key=1786952783940',
    P110:      'https://grillkliniken.se/pages/110?_ab=0&key=1785903544309',
    NR11:      'https://grillkliniken.se/pages/landing-page-blank-jul-3-08-48-08?_ab=0&key=1783091411277',
    BRYNIS279: 'https://grillkliniken.se/pages/brynis-279-sifferversionen1214?_ab=0&key=1786952937636',
  },

  // kampanjens standardcopy (samma som 08-11)
  copy: {
    message: 'Har du skjutit upp grillrengöringen sedan förra sommaren?\n\nGrillklinikens elektriska grillborste gör jobbet åt dig, tryck på en knapp och gallret är rent på minuter. \nIngen skrubbning, noll ansträngning.\n\n✔ Trådlös och laddningsbar\n✔ Roterar 180° — kommer åt överallt\n✔ Utbytbara borsthuvuden, enkla att tvätta\n\nKlicka på länken och beställ din idag.',
    headline: 'Rent galler på minuter — utan ett enda borststrå',
  },

  concepts: [
    { name: '110 REMAKE',
      videos: { H1: '110 Remake H1', H2: '110 Remake H2', H3: '110 Remake H3' },
      hooks:  { H1: 'P110TEK', H2: 'P110TEK', H3: 'P110TEK' } },

    { name: '128 REMAKE',
      videos: { H1: '128_remake_H1', H2: '128_remake_H2', H3: '128_remake_H3' },
      hooks:  { H1: 'P110', H2: 'P110', H3: 'P110' } },

    { name: '282 V2',
      videos: { H1: '282 v2 HOOK 1', H2: '282 v2 HOOK 2', H3: '282 v2 HOOK 3',
                H4: '282 v2 HOOK 4', H5: '282 v2 HOOK 5' },
      hooks:  { H1: 'NR11', H2: 'NR11', H3: 'NR11', H4: 'NR11', H5: 'NR11' } },

    { name: '285',
      videos: { H1: '285_H1', H2: '285_H2', H3: '285_H3' },
      hooks:  { H1: 'BRYNIS279', H2: 'BRYNIS279', H3: 'BRYNIS279' } },
  ],
};
