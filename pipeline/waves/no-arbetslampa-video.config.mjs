// Kampanj: Arbeidslampe NO — videobatch 2026-09-06 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-06 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 339 kr (før 678 = 50 %, jämförpris höjt i Shopify NO
// per prispolicyn 2026-09-06 för att matcha annonsens 50%-claim). BE-ROAS 1,63 = 339/(339 − 12,08 EUR à 10,806953).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Arbeidslampe NO | BE-ROAS 1,63 | 2026-09-06',
  link: 'https://beverbutikken.no/products/arbeidslampe-for-makita-batteri-15-led-med-usb-uttak',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-06/final/arbetslampa', // relativt pipeline/
  adsets: [
    {
      name: 'Arbeidslampe NO - CS',
      copy: {
        message: '⚡ 50 % RABATT – KUN I DAG ⚡\nVi senker prisen på vår populære arbeidslampe, men bare i 24 timer.\n🔥 Halv pris, samme kvalitet\n🔥 Lageret minker raskt\n🔥 Når det er tomt, er det tomt\nIkke gå glipp av sjansen – bestill før midnatt.',
        headline: '50 % RABATT – KUN I DAG',
        description: 'Tilbudet gjelder kun i dag – begrenset lager.',
      },
      ads: [
        { name: 'Arbeidslampe_NO_CS_1_H1', file: 'NO_arbetslampa_CS_1_H1.mp4' },
        { name: 'Arbeidslampe_NO_CS_1_H2', file: 'NO_arbetslampa_CS_1_H2.mp4' },
        { name: 'Arbeidslampe_NO_CS_1_H3', file: 'NO_arbetslampa_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Arbeidslampe NO - GT',
      copy: {
        message: 'Vet du ikke hva du skal gi ham i julegave? 🎁\nHan har allerede verktøyene. Gi ham det han faktisk mangler – og se blikket når han åpner pakken.\n✅ Passer rett på hans Makita-batteri\n✅ Praktisk gave han faktisk kommer til å bruke\n✅ Perfekt til jul, bursdag eller farsdag\nGi gaven som viser at du virkelig tenkte gjennom det.',
        headline: 'Passer rett på hans Makita-batteri',
        description: 'En gave han faktisk kommer til å bruke.',
      },
      ads: [
        { name: 'Arbeidslampe_NO_GT_1_H1', file: 'NO_arbetslampa_GT_1_H1.mp4' },
        { name: 'Arbeidslampe_NO_GT_1_H2', file: 'NO_arbetslampa_GT_1_H2.mp4' },
        { name: 'Arbeidslampe_NO_GT_1_H3', file: 'NO_arbetslampa_GT_1_H3.mp4' },
      ],
    },
    {
      name: 'Arbeidslampe NO - PD',
      copy: {
        message: 'Mørkt i garasjen igjen? 🔦\nDenne lampen kjører rett på ditt Makita-batteri – ingenting nytt å kjøpe, ingen krøll.\n✅ 15 sterke LED-lys\n✅ Innebygd USB-uttak for mobillading\n✅ Perfekt i garasjen, verkstedet eller på byggeplassen\nBestill din i dag og slutt å jobbe i mørket.',
        headline: 'Kjører rett på ditt Makita-batteri',
        description: '15 sterke LED-lys – ingen ny batteripakke å kjøpe.',
      },
      ads: [
        { name: 'Arbeidslampe_NO_PD_1_H1', file: 'NO_arbetslampa_PD_1_H1.mp4' },
        { name: 'Arbeidslampe_NO_PD_1_H2', file: 'NO_arbetslampa_PD_1_H2.mp4' },
        { name: 'Arbeidslampe_NO_PD_1_H3', file: 'NO_arbetslampa_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Arbeidslampe NO - SP',
      copy: {
        message: '"Beste lampen jeg har kjøpt til verkstedet." ⭐⭐⭐⭐⭐\nFlere og flere håndverkere bytter til denne lampen – og det er lett å forstå hvorfor.\n✅ Sterkt lys som varer lenge\n✅ Kjører på batteriet du allerede har\n✅ USB-uttak inkludert\nSe selv hvorfor så mange velger den. Bestill nå.',
        headline: 'Vurdert 5 av 5 av ekte kunder',
        description: 'Håndverkere velger denne lampen om og om igjen.',
      },
      ads: [
        { name: 'Arbeidslampe_NO_SP_1_H1', file: 'NO_arbetslampa_SP_1_H1.mp4' },
        { name: 'Arbeidslampe_NO_SP_1_H2', file: 'NO_arbetslampa_SP_1_H2.mp4' },
        { name: 'Arbeidslampe_NO_SP_1_H3', file: 'NO_arbetslampa_SP_1_H3.mp4' },
      ],
    },
  ],
};
