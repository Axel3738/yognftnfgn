// SE Axelbältet — Batch 6, 2026-08-12.
//
// Alla nio har fullständiga briefs i Notions "Trimmer belt creative hub", var och en
// med egen primärtext, rubrik och CTA. Varje brief slutar med regeln:
//   "Use the primary text and headline exactly as written in this brief."
// Texterna nedan är därför ordagranna kopior — inget block delas mellan annonser.
//
// Prisregel i samtliga briefs: 599 kr · ord. 678 kr · spara 79 kr (11,65 %).
// Aldrig 509/636/"20 %". Förbjudet: "tusentals kunder", uppdiktade citat,
// medicinska påståenden, AI-genererade ansikten.

const LP = 'https://baverbutiken.se/products/axelbalte-for-trimmer-justerbart-nylonbalte';

export default {
  act: 'act_1867947880635861',     // MagiBorsten (SE)
  page: '678639638662543',         // Bäverbutiken.se
  instagram: '17841474144960111',
  pixel: '1554276343018184',
  link: LP,
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['SE'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  campaigns: [
    {
      campaignName: 'Axelbältet',
      adsets: [
        {
          name: 'Axelbälte PD Batch 6',
          link: LP,
          motifs: [
            { name: 'Trimmerbelt_PD_13_1', copy: {
              message: 'Ont i axeln varje gång du klipper häcken?\nBältet flyttar trimmerns vikt från armen till hela axeln, så belastningen sprids ut och du orkar längre.\nJusterbart så det passar precis dig.\n4,75 av 5 i snittbetyg – fri frakt och 30 dagars öppet köp.',
              headline: 'Trädgårdsarbete utan ont i axeln',
              description: '', cta: 'SHOP_NOW', link: LP } },

            { name: 'Trimmerbelt_PD_14_1', copy: {
              message: 'Så här sitter bältet i praktiken.\nDet fördelar trimmerns vikt över axeln istället för att armen bär allt själv.\nJusterbart med enkla spännen, så det ställs in efter din kropp på sekunder.\nFri frakt och 30 dagars öppet köp – beställ idag.',
              headline: 'Så sitter det när du jobbar',
              description: '', cta: 'SHOP_NOW', link: LP } },

            { name: 'Trimmerbelt_PD_15_1', copy: {
              message: 'Utan bälte hänger hela trimmerns vikt i armarna.\nMed Axelbältet fördelas vikten istället jämnt över axel och rygg.\nVadderade remmar och snabbkoppling gör att du knappt märker att du har det på dig.\nJusterbart så det passar precis din kropp.\nFri frakt och 30 dagars öppet köp. Se skillnaden på bilden.',
              headline: 'Utan bälte. Med bälte. Se skillnaden.',
              description: '', cta: 'SHOP_NOW', link: LP } },

            { name: 'Trimmerbelt_PD_16_1', copy: {
              message: 'Kör du röjsåg en hel arbetsdag, inte bara 20 minuter i trädgården?\nAxelbältet fördelar maskinens vikt jämnt över axel och rygg istället för att den vilar i armarna hela dagen.\nVadderade remmar och en stadig höftplatta håller vikten stilla även vid tyngre pass.\nJusterbart så det sitter rätt genom hela dagen.\nFri frakt och 30 dagars öppet köp. Beställ idag.',
              headline: 'Byggt för en hel arbetsdag med röjsågen',
              description: '', cta: 'SHOP_NOW', link: LP } },

            { name: 'Trimmerbelt_PD_17_1', copy: {
              message: 'Det här får du i paketet:\nVadderade axelremmar, en svart höftplatta och en röd snabbkoppling i metall fördelar tillsammans trimmerns vikt jämnt över axel och rygg.\nSnabbkopplingen gör att du kopplar loss maskinen på sekunden, utan krångel.\nJusterbart så det passar dig.\nFri frakt och 30 dagars öppet köp. Beställ idag.',
              headline: '3 delar som avlastar hela kroppen',
              description: '', cta: 'SHOP_NOW', link: LP } },

            // OBS: briefen anger CTA "Läs mer" (LEARN_MORE), inte Handla nu
            { name: 'Trimmerbelt_PD_7_2', copy: {
              message: 'Passar den min trimmer?\nAxelbältet fördelar maskinens vikt jämnt över axel och rygg, så du slipper bära allt i armarna.\nDet är justerbart och passar de flesta grästrimmers och röjsågar, med snabbkoppling så du enkelt kopplar loss maskinen.\nFri frakt och 30 dagars öppet köp. Beställ idag.',
              headline: 'Passar de flesta trimmers och röjsågar',
              description: '', cta: 'LEARN_MORE', link: LP } },
          ],
        },
        {
          name: 'Axelbälte SO Batch 6',
          link: LP,
          motifs: [
            { name: 'Trimmerbelt_SO_2_8', copy: {
              message: 'Ordinarie pris 678 kr – just nu 599 kr, en besparing på 79 kr.\nBältet fördelar trimmerns vikt jämnt över axeln så armar, nacke och rygg slipper bära allt.\nJusterbart så det passar precis dig.\nFri frakt och 30 dagars öppet köp – beställ idag.',
              headline: 'Spara 79 kr på ditt axelbälte',
              description: '', cta: 'SHOP_NOW', link: LP } },

            // OBS: briefen anger CTA "Köp nu" (BUY_NOW)
            { name: 'Trimmerbelt_SO_2_9', copy: {
              message: 'Trött i axlarna redan efter en timme?\nAxelbältet fördelar trimmerns vikt jämnt över axel och rygg, så du slipper bära allt i armarna.\nNu 599 kr istället för 678 kr – du sparar 79 kr.\nJusterbart så det passar dig.\nFri frakt och 30 dagars öppet köp. Beställ idag.',
              headline: 'Spara 79 kr på Axelbältet just nu',
              description: '', cta: 'BUY_NOW', link: LP } },
          ],
        },
        {
          name: 'Axelbälte SP Batch 6',
          link: LP,
          motifs: [
            { name: 'Trimmerbelt_SP_6_1', copy: {
              message: '4,75 av 5 i snittbetyg efter 8 recensioner.\nAxelbältet fördelar trimmerns vikt jämnt över axel och rygg, istället för att den vilar i armarna.\nSå tycker de som redan testat det.\nJusterbart så det passar dig, oavsett storlek.\nFri frakt och 30 dagars öppet köp. Beställ ditt idag.',
              headline: '4,75 av 5 i betyg – 8 recensioner',
              description: '', cta: 'SHOP_NOW', link: LP } },
          ],
        },
      ],
    },
  ],
};
