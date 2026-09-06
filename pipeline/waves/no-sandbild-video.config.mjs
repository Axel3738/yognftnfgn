// Kampanj: 3D-sandbilde NO — videobatch 2026-09-06 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-06 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 399 kr (før 798 = 50 %, jämförpris höjt i Shopify NO
// per prispolicyn 2026-09-06 för att matcha annonsens 50%-claim). BE-ROAS 1,62 = 399/(399 − 14,20 EUR à 10,806953).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Sandbilde NO | BE-ROAS 1,62 | 2026-09-06',
  link: 'https://beverbutikken.no/products/3d-sandbilde-20-cm-nytt-landskap-hver-gang-du-snur-den',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-06/final/sandbild', // relativt pipeline/
  adsets: [
    {
      name: 'Sandbilde NO - CS',
      copy: {
        message: 'KUN I DAG: 50 % rabatt på 3D-sandbildet. ⏰\nLageret er nesten tomt.\nPrisen går tilbake i morgen.\nDette er siste sjanse til å få den til denne prisen.\nIkke gå glipp av det – mange har allerede bestilt.\n👉 Handle nå før den er utsolgt.',
        headline: '50 % RABATT – KUN I DAG',
        description: 'Nesten utsolgt – tilbudet gjelder bare i dag.',
      },
      ads: [
        { name: 'Sandbilde_NO_CS_1_H1', file: 'NO_sandbild_CS_1_H1.mp4' },
        { name: 'Sandbilde_NO_CS_1_H2', file: 'NO_sandbild_CS_1_H2.mp4' },
        { name: 'Sandbilde_NO_CS_1_H3', file: 'NO_sandbild_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Sandbilde NO - GT',
      copy: {
        message: 'Du vet den følelsen når du finner den perfekte gaven? 🎁\nIkke enda en genser. Ikke enda et duftlys.\nNoe de aldri har sett før – og som de vil huske.\nSe for deg ansiktet deres når de åpner pakken.\nOg hver gang de snur den hjemme – tenker de på deg.\n👉 Gi bort noe som faktisk føles spesielt.',
        headline: 'Gaven de faktisk husker',
        description: 'Den perfekte gaven til noen du bryr deg om.',
      },
      ads: [
        { name: 'Sandbilde_NO_GT_1_H1', file: 'NO_sandbild_GT_1_H1.mp4' },
        { name: 'Sandbilde_NO_GT_1_H2', file: 'NO_sandbild_GT_1_H2.mp4' },
        { name: 'Sandbilde_NO_GT_1_H3', file: 'NO_sandbild_GT_1_H3.mp4' },
      ],
    },
    {
      name: 'Sandbilde NO - PD',
      copy: {
        message: 'Snu den. Se hva som skjer. 🌊\nSanden glir sakte nedover og skaper et helt nytt landskap – hver gang.\nAldri samme bilde to ganger.\nAvslappende å se på, pent å ha fremme.\nPerfekt på skrivebordet, hyllen eller nattbordet.\n👉 Bestill ditt 3D-sandbilde i dag.',
        headline: 'Et nytt landskap hver gang du snur den',
        description: 'Avslappende skrivebordsdekorasjon som aldri ser lik ut to ganger.',
      },
      ads: [
        { name: 'Sandbilde_NO_PD_1_H1', file: 'NO_sandbild_PD_1_H1.mp4' },
        { name: 'Sandbilde_NO_PD_1_H2', file: 'NO_sandbild_PD_1_H2.mp4' },
        { name: 'Sandbilde_NO_PD_1_H3', file: 'NO_sandbild_PD_1_H3.mp4' },
      ],
    },
    {
      name: 'Sandbilde NO - SP',
      copy: {
        message: '«Jeg klarer ikke å slutte å snu den.» ⭐⭐⭐⭐⭐\nDet er hva kundene sier om dette sandbildet.\nEt nytt landskap hver gang du snur det.\nAvslappende, vakkert og helt annerledes enn vanlig dekorasjon.\nTusenvis av fornøyde kunder har allerede en hjemme.\n👉 Se hvorfor alle snakker om det.',
        headline: 'Elsket av tusenvis av fornøyde kunder',
        description: 'Anmeldelsene taler for seg selv – prøv risikofritt.',
      },
      ads: [
        { name: 'Sandbilde_NO_SP_1_H1', file: 'NO_sandbild_SP_1_H1.mp4' },
        { name: 'Sandbilde_NO_SP_1_H2', file: 'NO_sandbild_SP_1_H2.mp4' },
        { name: 'Sandbilde_NO_SP_1_H3', file: 'NO_sandbild_SP_1_H3.mp4' },
      ],
    },
  ],
};
