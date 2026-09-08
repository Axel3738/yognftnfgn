// Kampanj: Benkehylle med Uttrekkbar Kurv NO — videobatch 2026-09-08 (rutinen /translate-no).
// Norsk copy skriven av copy-subagent (sonnet) 2026-09-08 ur svenska ADCOPY-docsen i Drive,
// verifierad mot beverbutikken.no: pris 939 kr (før 1221 kr = 23 %), fri frakt over 300 kr,
// 30 dagers åpent kjøp OK, Klarna OK. BE-ROAS 1,63 = 939/(939 − 33,83 EUR à 10,78 NOK/EUR).
// OBS: HeyGens maskinöversättning i CS-videorna hade fel pris (849/1104, kopierat rakt av
// från svenska SEK) — rättat till 939/1221 NOK i SRT innan render (docs/video-localization.md).
// Axels beslut 2026-08-29: launcha PÅ (allt ACTIVE) med 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Benkehylle NO | BE-ROAS 1,63 | 2026-09-08',
  link: 'https://beverbutikken.no/products/benkehylle-med-uttrekkbar-kurv-dobbel-plass-pa-samme-benk',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå (Temu-flödets struktur)
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-08/final/bankhylla', // relativt pipeline/
  adsets: [
    {
      name: 'Benkehylle NO - CS',
      copy: {
        message: 'I DAG: 23 % RABATT ⏰\nBenkehylle med uttrekkbar kurv – fra 1221 kr til 939 kr.\n🔥 Begrenset lager – når den er tom, er den tom\n🔥 Prisen gjelder kun i dag\n🔥 Fri frakt over 300 kr\nIkke vent til den er utsolgt – legg den i handlekurven nå. 👉',
        headline: 'Dobbelt så mye benkeplass — i dag med 23 % rabatt',
        description: '939 kr i stedet for 1221 kr – kun i dag.',
      },
      ads: [
        { name: 'Benkehylle_NO_CS_1', file: 'NO_bankhylla_CS_1.mp4' },
        { name: 'Benkehylle_NO_CS_2', file: 'NO_bankhylla_CS_2.mp4' },
        { name: 'Benkehylle_NO_CS_3', file: 'NO_bankhylla_CS_3.mp4' },
      ],
    },
    {
      name: 'Benkehylle NO - G',
      copy: {
        message: 'Har du sett hvor full mammas kjøkkenbenk alltid er? 🥹\nJeg fant endelig en gave som faktisk løser problemet – ikke bare nok en ting hun ikke trenger.\n✔️ Gir henne dobbelt så mye plass på kjøkkenet\n✔️ Ingen boring – hun slipper styr\n✔️ Passer perfekt uansett anledning\nJeg vet allerede hvilken hun får. Bestill din til noen du er glad i. 👉',
        headline: 'Gaven som dobler mammas benkeplass',
        description: 'En gave som faktisk brukes – hver dag, på kjøkkenet.',
      },
      ads: [
        { name: 'Benkehylle_NO_G_1', file: 'NO_bankhylla_G_1.mp4' },
        { name: 'Benkehylle_NO_G_2', file: 'NO_bankhylla_G_2.mp4' },
        { name: 'Benkehylle_NO_G_3', file: 'NO_bankhylla_G_3.mp4' },
      ],
    },
    {
      name: 'Benkehylle NO - PD',
      copy: {
        message: 'Benkeplassen tar aldri slutt igjen. 😌\nSkap en ekstra etasje – uten å bygge om kjøkkenet.\n✔️ Dobbelt så mye oppbevaring på samme plass\n✔️ Kurven glir ut som en skuff\n✔️ Ingen boring, ingen hull i veggen\nBestill din i dag og få orden på kjøkkenet allerede i helgen. 👉',
        headline: 'Dobbelt så mye benkeplass — uten ombygging',
        description: 'Fri frakt over 300 kr. Betal enkelt med Klarna.',
      },
      ads: [
        { name: 'Benkehylle_NO_PD_1', file: 'NO_bankhylla_PD_1.mp4' },
        { name: 'Benkehylle_NO_PD_2', file: 'NO_bankhylla_PD_2.mp4' },
        { name: 'Benkehylle_NO_PD_3', file: 'NO_bankhylla_PD_3.mp4' },
      ],
    },
    {
      name: 'Benkehylle NO - SP',
      copy: {
        message: '"Endelig ser jeg benken min igjen." ⭐⭐⭐⭐⭐\nDette er grunnen til at så mange allerede har byttet ut det rotete kjøkkenskapet.\n✔️ Enkel å montere – ingen verktøy nødvendig\n✔️ Gir kjøkkenet en ryddig, samlet følelse\n✔️ 30 dagers åpent kjøp\nSe hvorfor den har blitt en av våre mest kjøpte produkter. 👉',
        headline: '«Ser benken min igjen» – 5/5',
        description: 'Bekreftede kunder elsker den – prøv helt risikofritt i 30 dager.',
      },
      ads: [
        { name: 'Benkehylle_NO_SP_1', file: 'NO_bankhylla_SP_1.mp4' },
        { name: 'Benkehylle_NO_SP_2', file: 'NO_bankhylla_SP_2.mp4' },
        { name: 'Benkehylle_NO_SP_3', file: 'NO_bankhylla_SP_3.mp4' },
      ],
    },
  ],
};
