// SE Magnetfiskesatsen — första kampanjen, 2026-08-17.
//
// ✅ REDAN BYGGD I KONTOT 2026-08-17 via Ads-connectorn (kampanj 120249815379020291,
// allt pausat). Den här konfigen är dokumentation + återkörningsskydd — multi-batch
// hoppar över annonser som redan finns i adsetet.
//
// Ny produkt på MagiBorsten. Axels instruktion: OUTCOME_SALES med CBO 1000 kr/dag,
// ett adset per koncept, bred SE-targeting, allt PAUSAT.
// CBO för test är ett uttryckligt undantag från regel 11 (test-ABO) — Axels beslut
// i uppdraget 2026-08-17.
//
// Copy från Axels ADCOPY-dokument (PD / SP). PD-copyn körs även på G-materialet.
//
// ⚠️ CS-KONCEPTET UTGICK på Axels order 2026-08-17 ("Ta inte med annonsen som
// säger 120 kronor"): SO-copyn lovade "50% rabatt, 240 → 120 kr" men produktsidan
// säljer för 279 kr utan rabatt (kollat i Shopify samma dag). Assets
// Magnetfiskesats_CS + CS_1 ligger kvar oanvända i mediabiblioteket.

const LP = 'https://baverbutiken.se/products/magnetfiskesats-320lb-neodymmagnet-med-10m-rep';

// DEMO — används på PD- och G-materialet.
const COPY_PD = {
  message: 'Tappat något i vattnet? 🧲\nNu kan du få tillbaka det.\n\n✅ 320 pund dragkraft\n✅ 10 meter rep – räcker långt\n✅ Fungerar i sjöar, kanaler och åar\n✅ Enkel att använda – kasta, dra, häv upp\n\nMan vet aldrig vad som fastnar.\n👉 Beställ din magnetfiskesats idag.',
  headline: 'Hitta det du trodde var borta',
  description: '320 pund dragkraft – redo direkt ur lådan.',
  cta: 'SHOP_NOW', link: LP,
};

// SOCIAL PROOF — SP-materialet.
const COPY_SP = {
  message: 'Magnetfiske är hobbyn alla pratar om just nu 🎣\n\n✅ Tusentals svenskar har redan testat\n✅ Hittar allt från verktyg till hela cyklar\n✅ Enkelt kit – inget krångel\n✅ 30 dagars pengarna-tillbaka-garanti\n\n"Trodde inte det var möjligt förrän jag testade själv."\n👉 Se vad du kan hitta.',
  headline: 'Se vad andra redan hittat',
  description: '⭐⭐⭐⭐⭐ Verifierade kunder älskar den.',
  cta: 'SHOP_NOW', link: LP,
};

export default {
  act: 'act_1867947880635861',     // MagiBorsten (SE) — INTE SnarkLös
  page: '678639638662543',         // Bäverbutiken.se
  instagram: '17841474144960111',
  pixel: '1554276343018184',       // PURCHASE-event sätts av multi-batch.mjs
  link: LP,
  dsaBeneficiary: 'Axel Odhner',
  // Bred SE — samma targeting som tidigare SE-kampanjer på kontot.
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['SE'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  // Båda statusfälten explicit — regeln i CLAUDE.md: annars blir annonserna ACTIVE.
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaigns: [
    {
      campaignName: 'Magnetfiskesatsen CBO 08-17',
      create: {
        objective: 'OUTCOME_SALES',
        status: 'PAUSED',
        dailyBudget: '100000',     // CBO 1000 kr/dag (öre)
      },
      adsets: [
        { name: 'Magnetfiskesats PD', copy: COPY_PD, link: LP,
          motifs: ['Magnetfiskesats', 'Magnetfiskesats_PD', 'Magnetfiskesats_PD_1',
                   'Magnetfiskesats_PD_2', 'Magnetfiskesats_PD_3', 'Magnetfiskesats_PD_EXTRA'] },

        { name: 'Magnetfiskesats SP', copy: COPY_SP, link: LP,
          motifs: ['Magnetfiskesats_SP', 'Magnetfiskesats_SP_1',
                   'Magnetfiskesats_SP_2', 'Magnetfiskesats_SP_3'] },

        // PD-copy på G-materialet — Axels mappning.
        { name: 'Magnetfiskesats G', copy: COPY_PD, link: LP,
          motifs: ['Magnetfiskesats_G', 'Magnetfiskesats_G_1',
                   'Magnetfiskesats_G_2', 'Magnetfiskesats_G_3'] },
      ],
    },
  ],
};
