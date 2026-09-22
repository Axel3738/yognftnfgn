// Kampanj: Feiesett Med Fleksible Stenger NO — videobatch 2026-09-21 (rutinen /translate-no).
// Källa: "Sotarset Böjliga Stänger" (Bäverbutiken). Norsk copy skriven av copy-subagent
// (sonnet) 2026-09-21 ur svenska ADCOPY-docsen i Drive, verifierad mot beverbutikken.no:
// pris 389 kr (ordinarie 509 kr, ca 24 %), fri frakt over 300 kr, Klarna, 30 dagers åpent
// kjøp (samma mönster som tidigare NO-kampanjer på butiken).
// BE-ROAS = 389/(389 − 13,72 EUR à 10,8046 NOK/EUR) ≈ 1,62 (batch-sheet #8, NORWAY-blocket).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Feiesett NO | BE-ROAS 1,62 | 2026-09-21',
  link: 'https://beverbutikken.no/products/feiesett-med-fleksible-stenger-renser-pipe-og-roykror',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-21/final/sotarset', // relativt pipeline/
  adsets: [
    {
      name: 'Feiesett NO - PD',
      copy: {
        message: 'Peisen trekker dårligere for hver fyring – og du vet hvorfor. 🔥\nSot bygger seg opp i røret, stille i bakgrunnen.\n✅ 9 fleksible stenger følger svingene – setter seg ikke fast\n✅ Renser røykkanal og kaminrør på minutter\n✅ Ingen feier nødvendig mellom de vanlige besøkene\nBestill ditt Feiesett i dag og få tilbake trekket. 👇',
        headline: 'Rent rør, bedre trekk – på minutter',
        description: '9 fleksible stenger renser der en stiv børste setter seg fast.',
      },
      ads: [
        { name: 'Sotarset_NO_PD_1_H1', file: 'NO_sotarset_PD_1_H1.mp4' },
        { name: 'Sotarset_NO_PD_1_H2', file: 'NO_sotarset_PD_1_H2.mp4' },
        { name: 'Sotarset_NO_PD_1_H3', file: 'NO_sotarset_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Feiesett NO - SP',
      copy: {
        message: '"Endelig rent i røret – trekket føles som nytt igjen!" ⭐⭐⭐⭐⭐\nDet sier kundene våre om Feiesett med fleksible stenger.\n✅ Enkelt å skru sammen – klart på minutter\n✅ Følger svingene i røret uten å sette seg fast\n✅ 30 dagers åpent kjøp – helt risikofritt\nSe hvorfor så mange velger å rense selv. 👇',
        headline: 'Kundene elsker sitt rene trekk',
        description: 'Verifiserte kunder – risikofritt kjøp med åpent kjøp.',
      },
      ads: [
        { name: 'Sotarset_NO_SP_1_H1', file: 'NO_sotarset_SP_1_H1.mp4' },
        { name: 'Sotarset_NO_SP_1_H2', file: 'NO_sotarset_SP_1_H2.mp4' },
        { name: 'Sotarset_NO_SP_1_H3', file: 'NO_sotarset_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'Feiesett NO - CS',
      copy: {
        message: '509 kr → 389 kr. 🔥 I dag.\nFeiesett med fleksible stenger til reapris – men lageret er begrenset.\n⏳ Prisen gjelder ikke hvor lenge som helst\n📦 Fri frakt over 300 kr\n💳 Betal trygt med Klarna\nSlå til før det er utsolgt. 👇',
        headline: 'Rent rør, bedre trekk – på minutter',
        description: '389 kr akkurat nå – ordinær pris 509 kr.',
      },
      ads: [
        { name: 'Sotarset_NO_CS_1_H1', file: 'NO_sotarset_CS_1_H1.mp4' },
        { name: 'Sotarset_NO_CS_1_H2', file: 'NO_sotarset_CS_1_H2.mp4' },
        { name: 'Sotarset_NO_CS_1_H3', file: 'NO_sotarset_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Feiesett NO - G',
      copy: {
        message: 'Vet du ikke hva du skal gi ham som allerede har alt? 🎁\nJeg fant gaven han faktisk kommer til å bruke – og det føltes så godt.\n✅ Perfekt til ham med peis, hytte eller enebolig\n✅ Han skrur den sammen og tester den samme kveld\n✅ Det blikket når gaven treffer helt riktig\nGi gaven som virkelig blir satt pris på. 👇',
        headline: 'Gaven han faktisk kommer til å bruke',
        description: 'Se blikket hans når han åpner den – perfekt julegave.',
      },
      ads: [
        { name: 'Sotarset_NO_G_1_H1', file: 'NO_sotarset_G_1_H1.mp4' },
        { name: 'Sotarset_NO_G_1_H2', file: 'NO_sotarset_G_1_H2.mp4' },
        { name: 'Sotarset_NO_G_1_H3', file: 'NO_sotarset_G_1_H3.mp4' },
      ],
    },
  ],
};
