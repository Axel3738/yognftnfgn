// Kampanj: Verktøyhylle NO — videobatch 2026-09-29 (rutinen /translate-no, röst ElevenLabs).
// Norsk copy skriven direkt av huvudsessionen (inget Agent-verktyg tillgängligt i
// den här körningen) ur svenska ADCOPY-docsen i Drive, verifierad mot beverbutikken.no:
// pris 1139 kr (før 1489 = 23 %), fri frakt over 300 kr OK, 30 dagers åpent kjøp OK.
// Källans "50 % RABATT" stämmer INTE mot butiken (23 %) — copyn säger 23 %; jämförpriset
// i butiken är inte ändrat (ägarbeslut enligt prispolicyn i docs/temu-launch-flow.md).
// Overifierade påståenden i källan borttagna: "mest sålda", "få kvar i lager",
// "verifierad kund", "hinn fram innan julafton", "garageägare över hela Sverige".
// COGS: batch-sheet #11, NORWAY Qty 1 Total ex. tax 40,66 EUR × 10,8367 = 440,62 kr
// ⇒ BE-ROAS 1139/(1139−440,62) = 1,63.
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Verktøyhylle NO | BE-ROAS 1,63 | 2026-09-29',
  link: 'https://beverbutikken.no/products/vegghengt-verktoyhylle-plass-til-4-elektroverktoy',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-29/maskinhyllan/final', // relativt pipeline/
  adsets: [
    {
      name: 'Verktoyhylle NO - PD',
      copy: {
        message: 'Fire elektroverktøy. Én hylle. Null kaos. 🔧\nLei av å lete etter drillen i garasjen?\n✅ Plass til 4 elektroverktøy som henger i sine egne håndtak\n✅ Hylle til batterier og skuffer rett over\n✅ Skrus fast i veggen – 42 × 20 × 35 cm\nFrigjør benken. Få orden én gang for alle.\n👉 Bestill din i dag.',
        headline: 'Endelig orden på verktøyet',
        description: 'Plass til 4 elektroverktøy og batterier – alt på én vegg.',
      },
      ads: [
        { name: 'Verktoyhylle_NO_PD_1_H1', file: 'NO_maskinhyllan_PD_1_H1.mp4' },
        { name: 'Verktoyhylle_NO_PD_1_H2', file: 'NO_maskinhyllan_PD_1_H2.mp4' },
        { name: 'Verktoyhylle_NO_PD_1_H3', file: 'NO_maskinhyllan_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Verktoyhylle NO - SP',
      copy: {
        message: 'Drillen på gulvet, skrutrekkeren på benken, batteriene et helt annet sted? 🙌\nMed verktøyhyllen henger alt på veggen.\n✅ Fire maskiner, én fast plass hver\n✅ Batteriene samlet på hyllen over\n✅ Ledig benk igjen\nSe hvorfor garasjeeiere velger den.\n👉 Handle trygt med 30 dagers åpent kjøp.',
        headline: 'Fire maskiner på veggen – benken ledig igjen',
        description: '30 dagers åpent kjøp.',
      },
      ads: [
        { name: 'Verktoyhylle_NO_SP_1_H1', file: 'NO_maskinhyllan_SP_1_H1.mp4' },
        { name: 'Verktoyhylle_NO_SP_1_H2', file: 'NO_maskinhyllan_SP_1_H2.mp4' },
        { name: 'Verktoyhylle_NO_SP_1_H3', file: 'NO_maskinhyllan_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'Verktoyhylle NO - CS',
      copy: {
        message: '⚡ 23 % RABATT – BARE I DAG ⚡\nVerktøyhyllen for 4 elektroverktøy: nå 1139 kr, før 1489 kr.\n⏰ Gjelder bare i dag\n📦 Fri frakt\n🔁 30 dagers åpent kjøp\nIkke gå glipp av sjansen.\n👉 Bestill før tilbudet er over.',
        headline: '23 % RABATT – bare i dag',
        description: 'Nå 1139 kr, før 1489 kr. Fri frakt.',
      },
      ads: [
        { name: 'Verktoyhylle_NO_CS_1_H1', file: 'NO_maskinhyllan_CS_1_H1.mp4' },
        { name: 'Verktoyhylle_NO_CS_1_H2', file: 'NO_maskinhyllan_CS_1_H2.mp4' },
        { name: 'Verktoyhylle_NO_CS_1_H3', file: 'NO_maskinhyllan_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Verktoyhylle NO - GT',
      copy: {
        message: 'Vet du ikke hva du skal gi ham i år? 🎁\nIkke et slips. Ikke sokker.\nNoe han faktisk kommer til å bruke – hver helg i garasjen.\n✅ Drillene hans på veggen, hver på sin plass\n✅ Batteriene samlet på hyllen over\n✅ Se ansiktet hans når han åpner pakken\nBli den som ga årets beste gave.\n👉 Bestill i dag.',
        headline: 'Den perfekte gaven til ham',
        description: 'En gave han faktisk bruker – igjen og igjen.',
      },
      ads: [
        { name: 'Verktoyhylle_NO_GT_1_H1', file: 'NO_maskinhyllan_GT_1_H1.mp4' },
        { name: 'Verktoyhylle_NO_GT_1_H2', file: 'NO_maskinhyllan_GT_1_H2.mp4' },
        { name: 'Verktoyhylle_NO_GT_1_H3', file: 'NO_maskinhyllan_GT_1_H3.mp4' },
      ],
    },
  ],
};
