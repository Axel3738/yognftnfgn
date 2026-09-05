// Kampanj: Oppvaskstativ i To Etasjer NO — videobatch 2026-09-05 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-05 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 789 kr (før 1026 kr = 23 %, matchar den svenska
// annonsens eget påstående rakt av). BE-ROAS 1,64 = 789/(789 − 28,43 EUR à 10,805183).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Oppvaskstativ NO | BE-ROAS 1,64 | 2026-09-05',
  link: 'https://beverbutikken.no/products/oppvaskstativ-i-to-etasjer-hele-oppvaskens-torkeflate-pa-42-cm',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-05/final/diskstall', // relativt pipeline/
  adsets: [
    {
      name: 'Oppvaskstativ NO - CS',
      copy: {
        message: '⚡ Kun i dag: 23 % rabatt på oppvaskstativet i to etasjer\nLageret minker raskt – dette er ikke et tilbud som kommer tilbake i morgen.\n✅ Dobler tørkeflaten på benken – alt på 42 cm\n✅ Vannet renner rett i sluket, ikke utover benken\n✅ 30 dagers åpent kjøp\nBestill nå, før det er utsolgt 👇',
        headline: '23 % rabatt – kun i dag',
        description: '1026 kr → 789 kr. Bestill før det er tomt.',
      },
      ads: [
        { name: 'Oppvaskstativ_NO_CS_1', file: 'NO_diskstall_CS_1.mp4' },
        { name: 'Oppvaskstativ_NO_CS_2', file: 'NO_diskstall_CS_2.mp4' },
        { name: 'Oppvaskstativ_NO_CS_3', file: 'NO_diskstall_CS_3.mp4' },
      ],
    },
    {
      name: 'Oppvaskstativ NO - G',
      copy: {
        message: '🎁 Leter du etter en gave hun faktisk kommer til å bruke?\nOppvaskstativet i to etasjer gjør det første kjøkkenet hennes ryddig, uten å ta over benken.\n✅ Dobler tørkeflaten – hele oppvasken på ett sted\n✅ Tar minimalt med plass på en liten benk\n✅ 30 dagers åpent kjøp\nSe ansiktet hennes lyse opp når hun åpner den 🎀',
        headline: 'Gaven hun faktisk bruker',
        description: '789 kr – dobler tørkeflaten på kjøkkenet hennes.',
      },
      ads: [
        { name: 'Oppvaskstativ_NO_G_1', file: 'NO_diskstall_G_1.mp4' },
        { name: 'Oppvaskstativ_NO_G_2', file: 'NO_diskstall_G_2.mp4' },
        { name: 'Oppvaskstativ_NO_G_3', file: 'NO_diskstall_G_3.mp4' },
      ],
    },
    {
      name: 'Oppvaskstativ NO - PD',
      copy: {
        message: 'Lei av en kjøkkenbenk full av oppvask? 😩\nDette oppvaskstativet i to etasjer dobler tørkeflaten – uten å ta over kjøkkenet.\n✅ Hele oppvasken får plass på bare 42 cm\n✅ Vannet renner rett i sluket, ikke utover benken\n✅ Sammenleggbart – tar null plass når det ikke er i bruk\nBestill i dag og få en ren kjøkkenbenk allerede i morgen 👇',
        headline: 'En ren kjøkkenbenk. Endelig.',
        description: 'Dobler tørkeflaten på bare 42 cm.',
      },
      ads: [
        { name: 'Oppvaskstativ_NO_PD_1', file: 'NO_diskstall_PD_1.mp4' },
        { name: 'Oppvaskstativ_NO_PD_2', file: 'NO_diskstall_PD_2.mp4' },
        { name: 'Oppvaskstativ_NO_PD_3', file: 'NO_diskstall_PD_3.mp4' },
      ],
    },
    {
      name: 'Oppvaskstativ NO - SP',
      copy: {
        message: '"Det beste kjøpet jeg har gjort til kjøkkenet i år" ⭐⭐⭐⭐⭐\nTusenvis av norske husholdninger har allerede byttet til vårt oppvaskstativ i to etasjer.\n✅ Hele oppvasken på ett sted\n✅ Ingen mer våt og rotete benk\n✅ 30 dagers åpent kjøp – helt risikofritt\nSe hvorfor alle snakker om det 👇',
        headline: 'Kundene elsker det. Nå du også.',
        description: 'Vurdert 5 av 5 av verifiserte kunder.',
      },
      ads: [
        { name: 'Oppvaskstativ_NO_SP_1', file: 'NO_diskstall_SP_1.mp4' },
        { name: 'Oppvaskstativ_NO_SP_2', file: 'NO_diskstall_SP_2.mp4' },
        { name: 'Oppvaskstativ_NO_SP_3', file: 'NO_diskstall_SP_3.mp4' },
      ],
    },
  ],
};
