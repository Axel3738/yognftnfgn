// TankGuard SE — OPS-butikens första videokampanj (FAS2 uppdrag B).
// Byggd på pipeline/waves/no-ibc-video.config.mjs, som är exakt samma produkt
// (IBC-tanköverdrag 1000 L). Körs med pipeline/ops-video-launch.mjs.
//
// KONTOT: MagiBorsten DK 915422744950975 — det GEMENSAMMA OPS-kontot för alla
// OPS-butiker, SE och NO (Axels beslut 2026-09-07). Valutan är SEK, inte DKK
// (avläst i kontot 2026-09-08: currency SEK, min_daily_budget 962).
// ⚠️ Förväxla ALDRIG med MagiBorsten 1867947880635861 (Bäverbutiken) — nästan
// samma namn, olika verksamheter. Kontot bär dessutom Bäverbutikens sex danska
// kampanjer med Bäverbutikens sida och pixel; därför brandprefixet på allt.
//
// NAMNREGELN (spikad 2026-09-08, står nu i factory/PROCESS.md):
//   kampanj  <BRANDPREFIX><Produkt> <MARKNAD> | BE-ROAS <x,xx> | <YYYY-MM-DD>
//   adset    <BRANDPREFIX><Produkt> <MARKNAD> - <KONCEPT>
//   annons   <BRANDPREFIX><MARKNAD>_<KONCEPT>_<batch>_H<hook>
//
// SIFFRORNA kommer ur factory/output/tankoverdraget/STATUS.md (2026-09-08),
// aldrig ur huvudet: pris 489 kr, jämförpris 636 kr, inköp 188 kr,
// marginal 301 kr → break-even-ROAS 1,62 (489/301). Rabatt 23,1 %.
// Recensioner i butiken: 16 synliga, snitt 4,81.
//
// COPY: skriven av copy-subagent (sonnet) 2026-09-08 enligt CLAUDE.md regel 6,
// ur Bäverbutikens SVENSKA IBC-annonser som redan spenderar pengar
// (kampanj 120250001079150291). Tre ändringar mot källan, alla nödvändiga:
// betyget 4,4 → TankGuards egna 4,81 (16 recensioner), inget butiksnamn kvar,
// och CS:ens "IDAG ENDAST / priset går tillbaka imorgon" → introduktionspris
// (en nylanserad butik kan inte hålla ett dygnspåstående).
export default {
  act: 'act_915422744950975',   // MagiBorsten DK — OPS-kontot (SEK!)
  currency: 'SEK',              // kontrolleras mot kontot före körning
  brandPrefix: 'TANKGUARD_',    // kontot bär flera butiker — allt prefixas
  domain: 'tankguard.se',       // länken måste ligga på den här domänen
  country: 'SE',

  // ⚠️ SIDAN FINNS INTE ÄNNU. Verifierat i Graph 2026-09-08: varken me/accounts
  // (39 sidor) eller MagiBorsten-företagets owned_pages (HeimGuard, Bæverbutiken,
  // BeaverShop, MagiBorsten) har någon TankGuard-sida. Den är VA:ns/Axels
  // manuella steg 3 i factory/output/tankoverdraget/STATUS.md, blockerad av att
  // FB-kontot väntar på verifiering (FAS2 blockerartabellen).
  // Sätt id:t här när sidan finns — då bygger ops-video-launch.mjs annonserna.
  // Gissa ALDRIG en sida: fel sida är fel verksamhet.
  page: null,

  // Skapad i OPS-kontot 2026-09-08, ägs av kontot självt (verifierat).
  // Bäverbutikens pixel 1554276343018184 ligger i SAMMA konto — ta aldrig den.
  pixel: '2196132151319625',

  campaignName: 'TANKGUARD_Tanköverdraget SE | BE-ROAS 1,62 | 2026-09-08',
  link: 'https://tankguard.se/products/tankoverdraget',
  dailyBudget: '100000',        // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'PAUSED',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',

  // Brand-swappade svenska videor (FAS2 uppdrag A2). Källan är Bäverbutikens
  // svenska IBC-annonser — INTE den norska batchen, som är dubbad till norska.
  // Alla elva säger "Bäverbutiken" i talet (FAS2 uppdrag A: ibc 11/11), så de
  // måste dubbas om svenska→svenska innan de får laddas upp här.
  videoDir: 'factory/output/tankoverdraget/video',   // relativt repo-roten

  adsets: [
    {
      name: 'TANKGUARD_Tanköverdraget SE - PD',
      copy: {
        message: 'Trött på grönt, algfyllt regnvatten? 💧\n\nDet här överdraget blockerar solljus och UV helt — så vattnet i din IBC-tank hålls klart, och tanken slits inte ut i förtid.\n\n✓ Kraftigt 210D Oxford-tyg\n✓ Enkelt blixtlås — klart på 2 minuter\n✓ Öppning upptill, du kommer åt locket ändå\n\nSkydda din tank idag 👇',
        headline: 'Klart vatten. Ingen alg. Enkelt.',
        description: 'Passar standard 1000L IBC-tank',
      },
      ads: [
        { name: 'TANKGUARD_SE_PD_1_H1', file: 'TANKGUARD_SE_PD_1_H1.mp4', kalla: 'IBC_PD_1_H1' },
        { name: 'TANKGUARD_SE_PD_1_H2', file: 'TANKGUARD_SE_PD_1_H2.mp4', kalla: 'IBC_PD_1_H2' },
        { name: 'TANKGUARD_SE_PD_1_H3', file: 'TANKGUARD_SE_PD_1_H3.mp4', kalla: 'IBC_PD_1_H3' },
      ],
    },
    {
      name: 'TANKGUARD_Tanköverdraget SE - SP',
      copy: {
        message: '"Äntligen klart vatten i tanken — inga alger på hela sommaren!" ⭐⭐⭐⭐⭐\n\nHundratals trädgårdsägare har redan bytt ut sin gamla, algiga tank mot en skyddad en.\n\n✓ Blockerar UV och sol helt\n✓ Sitter perfekt med blixtlås\n✓ Du kommer fortfarande åt locket\n\nSe varför kunderna älskar det 👇',
        headline: 'Klart vatten hela sommaren',
        description: '16 recensioner. 4,81 av 5.',
      },
      ads: [
        { name: 'TANKGUARD_SE_SP_1_H1', file: 'TANKGUARD_SE_SP_1_H1.mp4', kalla: 'IBC_SP_1_H1' },
        { name: 'TANKGUARD_SE_SP_1_H2', file: 'TANKGUARD_SE_SP_1_H2.mp4', kalla: 'IBC_SP_1_H2' },
        { name: 'TANKGUARD_SE_SP_1_H3', file: 'TANKGUARD_SE_SP_1_H3.mp4', kalla: 'IBC_SP_1_H3' },
      ],
    },
    {
      name: 'TANKGUARD_Tanköverdraget SE - CS',
      copy: {
        message: '🔥 INTRODUKTIONSPRIS — 23% RABATT\n\n489 kr istället för 636 kr, så länge lagret räcker.\n\nLagret krymper snabbt — många har redan beställt inför sommaren.\n\nInga alger. Inget spröd plast. Bara ett tjockt, skyddande överdrag till din IBC-tank.\n\nMissa inte det — beställ innan det är slut 👇',
        headline: 'Skydda tanken innan sommaren',
        description: 'Introduktionspris: 489 kr.',
      },
      ads: [
        { name: 'TANKGUARD_SE_CS_1_H2', file: 'TANKGUARD_SE_CS_1_H2.mp4', kalla: 'IBC_CS_1_H2' },
        { name: 'TANKGUARD_SE_CS_1_H3', file: 'TANKGUARD_SE_CS_1_H3.mp4', kalla: 'IBC_CS_1_H3' },
      ],
    },
    {
      name: 'TANKGUARD_Tanköverdraget SE - GT',
      copy: {
        message: 'Vet du någon som klagat på alger i sin IBC-tank i flera somrar?\n210D Oxford-tyg stänger ute solljuset – ingen alg får fäste.\nGe bort skyddet i år. Ingen skrubbning nästa sommar.\n489 kr (ord. 636 kr) · 4,81 av 5 (16 recensioner).',
        headline: 'Ge skyddet i present. Slipp algskrubben.',
        description: 'Present som stoppar algerna.',
      },
      ads: [
        { name: 'TANKGUARD_SE_GT_1_H1', file: 'TANKGUARD_SE_GT_1_H1.mp4', kalla: 'IBC_GT_1_H1' },
        { name: 'TANKGUARD_SE_GT_1_H2', file: 'TANKGUARD_SE_GT_1_H2.mp4', kalla: 'IBC_GT_1_H2' },
        { name: 'TANKGUARD_SE_GT_1_H3', file: 'TANKGUARD_SE_GT_1_H3.mp4', kalla: 'IBC_GT_1_H3' },
      ],
    },
  ],
};
