// Kampanj: Solcellealarm 2-pk NO — videobatch 2026-09-12 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-12 ur svenska ADCOPY-docsen i Drive.
// Verifierad mot beverbutikken.no: pris 719 kr (nu), 939 kr (ordinarie), rabatt 220 kr = 23 %.
// CS-konceptets claim (50 %) höjde jämförpriset i Shopify NO enligt prispolicyn: 939 → 1438 kr
// (tools/shopify-fix-compareat.mjs --market NO --product-id 15553084064119 --rabatt 50, körd 2026-09-12).
// BE-ROAS 1,62 = 719/(719 − 25,56 EUR à 10,77704 NOK/EUR = 275,46 kr COGS, batch-sheet #7).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Solcellealarm 2-pk NO | BE-ROAS 1,62 | 2026-09-12',
  link: 'https://beverbutikken.no/products/solcellealarm-2-pk-sirene-og-strobelys-ved-bevegelse',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-12/final/solcellslarm', // relativt pipeline/
  adsets: [
    {
      name: 'Solcellealarm 2-pk NO - CS',
      copy: {
        message: '⚡ KUN I DAG: 50 % RABATT på Solcellealarm 2-pk\nPrisen kuttes kraftig – men bare en kort stund.\nLageret minker raskt og fylles ikke på med det første.\nMange venter for lenge og går glipp av sjansen.\n👉 Slå til før det er tomt – rabatten kan forsvinne når som helst',
        headline: '50 % RABATT – KUN I DAG',
        description: 'Lageret minker raskt – slå til nå.',
      },
      ads: [
        { name: 'Solcellealarm_NO_CS_1', file: 'NO_solcellslarm_CS_1.mp4' },
        { name: 'Solcellealarm_NO_CS_2', file: 'NO_solcellslarm_CS_2.mp4' },
        { name: 'Solcellealarm_NO_CS_3', file: 'NO_solcellslarm_CS_3.mp4' },
      ],
    },
    {
      name: 'Solcellealarm 2-pk NO - G',
      copy: {
        message: 'Jeg visste akkurat hva jeg skulle gi ham i år 🎁\nHan bekymrer seg alltid for huset, garasjen eller hytta når han ikke er der.\nSå jeg ga ham noe som gjør at han kan slappe av.\nDu skulle sett ansiktet hans da han skjønte hva det var.\n👉 Finn gaven som faktisk betyr noe',
        headline: 'Solcelledrevet – ingen strøm, oppe på 5 minutter',
        description: 'Gi ham tryggheten til å slappe av – hver dag.',
      },
      ads: [
        { name: 'Solcellealarm_NO_G_1', file: 'NO_solcellslarm_G_1.mp4' },
        { name: 'Solcellealarm_NO_G_2', file: 'NO_solcellslarm_G_2.mp4' },
        { name: 'Solcellealarm_NO_G_3', file: 'NO_solcellslarm_G_3.mp4' },
      ],
    },
    {
      name: 'Solcellealarm 2-pk NO - PD',
      copy: {
        message: 'Hører du noe ute om natten – uten å vite hva det er? 😳\n✅ Alarmerer direkte ved bevegelse – sirene + blitslys\n✅ Solcelledrevet – ingen strøm, ingen kabler\n✅ Tåler regn, snø og kulde\n✅ Montert på 5 minutter, beskytter døgnet rundt\n👉 Bestill ditt Solcellealarm i dag',
        headline: 'Sirene + blitslys – på under 5 minutter',
        description: 'Alarmerer direkte ved bevegelse – ingen strøm nødvendig.',
      },
      ads: [
        { name: 'Solcellealarm_NO_PD_1', file: 'NO_solcellslarm_PD_1.mp4' },
        { name: 'Solcellealarm_NO_PD_2', file: 'NO_solcellslarm_PD_2.mp4' },
        { name: 'Solcellealarm_NO_PD_3', file: 'NO_solcellslarm_PD_3.mp4' },
      ],
    },
    {
      name: 'Solcellealarm 2-pk NO - SP',
      copy: {
        message: 'Dette er produktet alle plutselig snakker om 👀\n✅ Skremmer bort både inntrengere og nysgjerrige dyr\n✅ Hundrevis av fornøyde kunder\n✅ Enkel å montere – ingen tekniker nødvendig\n✅ 30 dagers åpent kjøp hvis du ikke er fornøyd\n👉 Se hvorfor så mange velger Solcellealarmet',
        headline: 'Hundrevis av fornøyde kunder – 30 dagers åpent kjøp',
        description: 'Vurdert av hundrevis av fornøyde kunder.',
      },
      ads: [
        { name: 'Solcellealarm_NO_SP_1', file: 'NO_solcellslarm_SP_1.mp4' },
        { name: 'Solcellealarm_NO_SP_2', file: 'NO_solcellslarm_SP_2.mp4' },
        { name: 'Solcellealarm_NO_SP_3', file: 'NO_solcellslarm_SP_3.mp4' },
      ],
    },
  ],
};
