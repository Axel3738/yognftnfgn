// Kampanj: Iskrembokser NO — videobatch 2026-09-06 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-06 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 449 kr (før 749 = 40 %, jämförpris höjt i Shopify NO
// per prispolicyn 2026-09-06 för att matcha annonsens 40%-claim). BE-ROAS 1,64 = 449/(449 − 16,16 EUR à 10,806953).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Iskrembokser NO | BE-ROAS 1,64 | 2026-09-06',
  link: 'https://beverbutikken.no/products/iskrembokser-med-lokk-2-pk-lag-isen-rett-i-boksen',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-06/final/glasspints', // relativt pipeline/
  adsets: [
    {
      name: 'Iskrembokser NO - CS',
      copy: {
        message: '⏳ KUN I DAG: 40 % rabatt på iskrembokser med lokk 2-pk\nLageret tømmes raskt — når det er tomt, er det tomt.\nIngen kode nødvendig, rabatten er allerede aktivert i kassen.\nIkke gå glipp av sjansen — handle før de blir utsolgt 👇',
        headline: '40 % RABATT — KUN I DAG',
        description: 'Tilbudet gjelder kun i dag. Begrenset lager.',
      },
      ads: [
        { name: 'Iskrembokser_NO_CS_1_H1', file: 'NO_glasspints_CS_1_H1.mp4' },
        { name: 'Iskrembokser_NO_CS_1_H2', file: 'NO_glasspints_CS_1_H2.mp4' },
        { name: 'Iskrembokser_NO_CS_1_H3', file: 'NO_glasspints_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Iskrembokser NO - GT',
      copy: {
        message: 'Kjenner du noen som alltid prøver nye iskremsmaker? 🎁\nDenne lille gaven får dem til å si «akkurat det jeg trengte!»\n✅ Liten, smart og alltid satt pris på\n✅ Perfekt til iskremmaskinen de allerede elsker\n✅ Føles gjennomtenkt — ikke bare en gave i siste liten\nBli den som fant den perfekte gaven.\nBestill i dag 👇',
        headline: 'Gaven de faktisk kommer til å bruke',
        description: 'Liten gave, stort smil.',
      },
      ads: [
        { name: 'Iskrembokser_NO_GT_1_H1', file: 'NO_glasspints_GT_1_H1.mp4' },
        { name: 'Iskrembokser_NO_GT_1_H2', file: 'NO_glasspints_GT_1_H2.mp4' },
        { name: 'Iskrembokser_NO_GT_1_H3', file: 'NO_glasspints_GT_1_H3.mp4' },
      ],
    },
    {
      name: 'Iskrembokser NO - PD',
      copy: {
        message: 'Lei av klissete, iskrystallfylt hjemmelaget iskrem? 🍦\nMed riktige bokser blir det enkelt:\n✅ Hell iskremmiksen rett i boksen\n✅ Sett på lokket\n✅ Sett i fryseren — ferdig\nTo bokser, to smaker samtidig. Perfekt porsjonsstørrelse, perfekt for fryseren.\nBestill ditt 2-pk i dag 👇',
        headline: 'Perfekt hjemmelaget iskrem, hver gang',
        description: 'Lag, oppbevar og nyt — rett i boksen.',
      },
      ads: [
        { name: 'Iskrembokser_NO_PD_1_H1', file: 'NO_glasspints_PD_1_H1.mp4' },
        { name: 'Iskrembokser_NO_PD_1_H2', file: 'NO_glasspints_PD_1_H2.mp4' },
        { name: 'Iskrembokser_NO_PD_1_H3', file: 'NO_glasspints_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Iskrembokser NO - SP',
      copy: {
        message: '«Endelig iskrem som ikke blir en isklump.» ⭐⭐⭐⭐⭐\nSlik beskriver kundene våre sine nye iskrembokser.\n✅ Passer perfekt til iskremmaskinen din\n✅ Sikre lokk som holder iskremen fersk\n✅ Enkelt å lage, enkelt å oppbevare\nTrygt å prøve.\nBestill ditt 2-pk i dag 👇',
        headline: 'Elsket av hjemmelagede iskrem-fans',
        description: 'Vurdert 5 av 5 av kundene våre.',
      },
      ads: [
        { name: 'Iskrembokser_NO_SP_1_H1', file: 'NO_glasspints_SP_1_H1.mp4' },
        { name: 'Iskrembokser_NO_SP_1_H2', file: 'NO_glasspints_SP_1_H2.mp4' },
        { name: 'Iskrembokser_NO_SP_1_H3', file: 'NO_glasspints_SP_1_H3.mp4' },
      ],
    },
  ],
};
