// Kampanj: Varmesete 45 × 90 cm NO — videobatch 2026-09-29 (rutinen /translate-no, ElevenLabs-röst).
// Norsk copy skriven direkt av huvudsessionen (Agent-verktyget avstängt i den här körningen)
// ur svenska ADCOPY-docsen i Drive, verifierad mot beverbutikken.no: pris 719 kr (før 939 = 23 %),
// fri frakt over 300 kr OK, 30 dagers åpent kjøp OK, powerbank følger ikke med.
// Obelagt i källan borttaget: "bara idag", "lagret nästan slut", påhittat kundcitat/betyg (SP).
// COGS NO 25,76 EUR (batch-sheet #10, NORWAY Qty 1) × 10,8367 = 279,15 NOK ⇒ BE-ROAS 1,63.
// Axels beslut 2026-08-29: allt ACTIVE, 1000 kr/dag CBO per produkt.
export default {
  act: 'act_1050941584152547', // Magiborsten NO (valuta SEK!)
  page: '879054088633562',     // Beverbutikken
  pixel: '1554276343018184',
  country: 'NO',
  campaignName: 'Varmesete NO | BE-ROAS 1,63 | 2026-09-29',
  link: 'https://beverbutikken.no/products/varmesete-45-90-cm-4-varmesoner-usb-drevet',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO på kampanjnivå
  campaignStatus: 'ACTIVE',
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  videoDir: '../market-expansion/no/video-batches/2026-09-29/varmesits/final', // relativt pipeline/
  adsets: [
    {
      name: 'Varmesete NO - PD',
      copy: {
        message: "Står du og fryser på sidelinjen? 🥶\nLegg dette i stolen, så blir det varmt.\n🔥 4 varmesoner som dekker både sete og rygg\n⚡ 3 varmenivåer, du velger selv med en knapp\n🔌 Drives med USB – fungerer med powerbank (følger ikke med)\n🎒 Brettes sammen og får plass i sekken\nPerfekt til fotballkampen, campingen eller fisketuren.\nSlutt å fryse. Trykk på knappen og bestill ditt.",
        headline: "Sitt varmt, også når det er kaldt ute",
        description: "Varmesete 45 × 90 cm med 4 varmesoner.",
      },
      ads: [
        { name: 'Varmesete_NO_PD_2', file: 'NO_varmesits_PD_2.mp4' },
        { name: 'Varmesete_NO_PD_3', file: 'NO_varmesits_PD_3.mp4' },
      ],
    },
    {
      name: 'Varmesete NO - SP',
      copy: {
        message: "Flere og flere finner dette varmesetet før den kalde sesongen. 🥶\n🔥 4 varmesoner\n⚡ 3 varmenivåer\n🔌 Drives med USB\nSe hvorfor så mange tar det med til tribunen, båten og jaktposten.\nVil du også slutte å fryse? Klikk og bestill.",
        headline: "Aldri mer kald rumpe på tribunen",
        description: "30 dagers åpent kjøp – pengene tilbake.",
      },
      ads: [
        { name: 'Varmesete_NO_SP_1_H1', file: 'NO_varmesits_SP_1_H1.mp4' },
        { name: 'Varmesete_NO_SP_1_H2', file: 'NO_varmesits_SP_1_H2.mp4' },
        { name: 'Varmesete_NO_SP_1_H3', file: 'NO_varmesits_SP_1_H3.mp4' },
      ],
    },
    {
      name: 'Varmesete NO - CS',
      copy: {
        message: "🚨 SALG PÅ VARMESETET! 🚨\nFør: 939 kr\nNå: 719 kr\nDu sparer 220 kr – det er 23 % rabatt.\nFire varmesoner. Tre varmenivåer. Drives med USB.\n30 dagers åpent kjøp – liker du det ikke, får du pengene tilbake.\nIkke sitt og frys en kveld til. Trykk på knappen og sikre deg ditt 👇",
        headline: "Sitt varmt hele vinteren",
        description: "719 kr i stedet for 939 kr.",
      },
      ads: [
        { name: 'Varmesete_NO_CS_1_H1', file: 'NO_varmesits_CS_1_H1.mp4' },
        { name: 'Varmesete_NO_CS_1_H2', file: 'NO_varmesits_CS_1_H2.mp4' },
        { name: 'Varmesete_NO_CS_1_H3', file: 'NO_varmesits_CS_1_H3.mp4' },
      ],
    },
    {
      name: 'Varmesete NO - G',
      copy: {
        message: "Hva gir man mannen som allerede har alt? 🎁\nJeg vet hvordan det er. Han sier aldri hva han vil ha, og du vil likevel gi ham noe som betyr noe.\nDette varmesetet er svaret. Han kan ta det med på isen, på post i jakta og på sidelinjen.\nTenk deg når han åpner pakken og skjønner at du har tenkt på vinteren hans.\nDet er gaven han faktisk bruker. Og det er du som får æren.\nFinn den perfekte gaven i dag 👇",
        headline: "Gaven som varmer, også når du ikke er der",
        description: "Julegaven han kommer til å bruke hele vinteren.",
      },
      ads: [
        { name: 'Varmesete_NO_G_1_H1', file: 'NO_varmesits_G_1_H1.mp4' },
        { name: 'Varmesete_NO_G_1_H2', file: 'NO_varmesits_G_1_H2.mp4' },
        { name: 'Varmesete_NO_G_1_H3', file: 'NO_varmesits_G_1_H3.mp4' },
      ],
    },
  ],
};
