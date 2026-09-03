// Kampanj: Klistremerker til Søppeldunken NO — videobatch 2026-09-03 (rutinen /translate-no,
// på Axels order i chatten efter att norska sidan publicerades 08:21).
// Norsk copy av copy-subagent (sonnet) ur svenska ADCOPY-docsen, verifierad mot beverbutikken.no:
// pris 199 kr, CS-claim "50 %" → jämförpris höjt 259→398 kr i Shopify NO per prispolicyn,
// INGEN fri frakt (gräns 300 kr), "30 dagers åpent kjøp" OK, Sverige-referenser generaliserade.
// BE-ROAS: __BEROAS__ — Norge-COGS saknas i batch-sheet #1–#5.1, inväntar Axel. Launcha inte
// förrän kampanjnamnet har ett riktigt tal.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Søppeldunk-klistremerker NO | BE-ROAS __BEROAS__ | 2026-09-03',
  link: 'https://beverbutikken.no/products/klistremerker-til-soppeldunken-4-pak-med-tegnede-ansikter',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-03/final/stickers', // relativt pipeline/
  adsets: [
    {
      name: 'Klistremerker NO - CS',
      copy: {
        message: '⚡ KUN I DAG: 199 kr ⚡\nKlistremerker til søppeldunken – hele pakken med 4 motiver til kraftig redusert pris.\nLageret krymper raskt, og når det er tomt, er det tomt.\nIngen grunn til å vente – til denne prisen varer de ikke lenge.\nBestill før de er utsolgt 👇',
        headline: '199 kr – kun i dag',
        description: 'Begrenset lager. Slå til før tilbudet forsvinner.',
      },
      ads: [
        { name: 'Klistremerker_NO_CS_1', file: 'NO_stickers_CS_1.mp4' },
        { name: 'Klistremerker_NO_CS_2', file: 'NO_stickers_CS_2.mp4' },
        { name: 'Klistremerker_NO_CS_3', file: 'NO_stickers_CS_3.mp4' },
      ],
    },
    {
      name: 'Klistremerker NO - G',
      copy: {
        message: 'Noen ganger er det de små tingene som gjør størst inntrykk 🥰\nSe for deg ansiktet deres når søppeldunken plutselig har morsomme figurer på seg – noe som er helt "deres".\n✅ En enkel gave som faktisk merkes\n✅ Perfekt liten overraskelse til barnebarn, nieser/nevøer eller vennenes barn\n✅ Noe ingen andre kommer på å gi bort\nBli den som fant den perfekte lille gaven 👇',
        headline: 'Den perfekte lille gaven',
        description: 'En enkel gave som gir store smil.',
      },
      ads: [
        { name: 'Klistremerker_NO_G_1', file: 'NO_stickers_G_1.mp4' },
        { name: 'Klistremerker_NO_G_2', file: 'NO_stickers_G_2.mp4' },
        { name: 'Klistremerker_NO_G_3', file: 'NO_stickers_G_3.mp4' },
      ],
    },
    {
      name: 'Klistremerker NO - PD',
      copy: {
        message: 'Søppeldunken din trenger ikke være kjedelig lenger 🗑️✨\nKlistremerker til søppeldunken – 4 morsomme, tegnede motiver i én pakke.\n✅ Settes på raskt og enkelt\n✅ Passer kjøkken, garasje, terrasse eller barnerom\n✅ Barna kaster søppelet med glede i stedet for gnål\nBestill pakken din i dag 👇',
        headline: 'Gi søppeldunken litt personlighet',
        description: '4 tegnede motiver som pigger opp hvilken som helst søppeldunk.',
      },
      ads: [
        { name: 'Klistremerker_NO_PD_1', file: 'NO_stickers_PD_1.mp4' },
        { name: 'Klistremerker_NO_PD_2', file: 'NO_stickers_PD_2.mp4' },
        { name: 'Klistremerker_NO_PD_3', file: 'NO_stickers_PD_3.mp4' },
      ],
    },
    {
      name: 'Klistremerker NO - SP',
      copy: {
        message: 'Dette er produktet foreldre ikke klarer å slutte å snakke om 😍\nTusenvis av hjem har allerede byttet ut den kjedelige søppeldunken med en full av farge og glede.\n✅ Elsket av foreldre og barnehager\n✅ Gjør kildesortering morsommere for barna\n✅ 4 motiver i hver pakke\nBli en av familiene som allerede har byttet 👇',
        headline: 'Familienes nye favoritt',
        description: 'Se hvorfor tusenvis av hjem allerede har klistremerkene hjemme.',
      },
      ads: [
        { name: 'Klistremerker_NO_SP_1', file: 'NO_stickers_SP_1.mp4' },
        { name: 'Klistremerker_NO_SP_2', file: 'NO_stickers_SP_2.mp4' },
        { name: 'Klistremerker_NO_SP_3', file: 'NO_stickers_SP_3.mp4' },
      ],
    },
  ],
};
