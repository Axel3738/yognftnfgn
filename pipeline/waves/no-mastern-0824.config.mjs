// SnarkLös NO — Mastern-batch 08-24. Kontot heter "Sushi kanske?" i BM,
// men det ÄR Norge-kontot: kampanjen "NO mastern", norsk pixel, NO-targeting.
// Videorna låg redan uppladdade där.
//
// STRUKTUR enligt kontots egen konvention (176/182/183/185): ett adset per
// koncept mot produktsidan (`<koncept> REV <datum>`) och ett parallellt
// listicle-adset (`<koncept> LISTICLE REV <datum>`) med samma video och samma
// copy — enda skillnaden är destinationen. Annonsnamnen får suffixet " L".
//
// COPY: kampanjens norska standardtext, hämtad ordagrant ur "182 REV 07-07"
// vid generering. Identisk på bas och listicle, så bara länken varierar.
//
// LISTICLE-ROUTING enligt Axel:
//   LP1 (jun-30) → 177 H3, 193 #8 H10, 198 H6, 198 H10
//   LP2 (aug-24) → 050 B2 H2
// 110, 210 och ELECTRIC2 får ingen dublett — de står inte på listan.
//
// EJ BYGGDA HÄR (finns inte bland de 8 filerna): B61, B66, B69 och 279 H1.
// 279 ligger i en egen kampanj med adsetet "279 Listilce brynis" som redan
// pekar mot Brynis-sidan, inte LP1.

export default {
  act: 'act_1550615276530638',   // "Sushi kanske?" = SnarkLös NO
  page: '1025275534009559',      // Grillklinikken NO
  instagram: '17841431071172772',
  pixel: '776922878287560',
  link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt",
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['NO'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  campaigns: [
    {
      campaignName: 'NO mastern',   // befintlig CBO 1000 kr/dag — ingen create
      adsets: [
        { name: "050 B2 REV 08-24",
          copy: { message: "Har du utsatt grillrengjøringen siden fjoråret?\n\nGrillklinikkens elektriske grillbørste gjør jobben for deg, trykk på en knapp og risten er ren på minutter. \nIngen skrubbing, null anstrengelse.\n\n✓ Trådløs og oppladbar\n✓ Roterer 180° — kommer til overalt\n✓ Utskiftbare børstehoder, enkle å vaske\n\nKlikk på lenken og bestill din i dag.",
      headline: "Ren rist på minutter — uten et eneste børstehår", description: "", cta: 'SHOP_NOW', link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt" },
          link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt",
          motifs: [
            { name: "NO 050 B2 H2", media: "NO_050_B2_H2" },
          ] },

        { name: "110 REV 08-24",
          copy: { message: "Har du utsatt grillrengjøringen siden fjoråret?\n\nGrillklinikkens elektriske grillbørste gjør jobben for deg, trykk på en knapp og risten er ren på minutter. \nIngen skrubbing, null anstrengelse.\n\n✓ Trådløs og oppladbar\n✓ Roterer 180° — kommer til overalt\n✓ Utskiftbare børstehoder, enkle å vaske\n\nKlikk på lenken og bestill din i dag.",
      headline: "Ren rist på minutter — uten et eneste børstehår", description: "", cta: 'SHOP_NOW', link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt" },
          link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt",
          motifs: [
            { name: "NO 110 H1", media: "NO_110_H1" },
          ] },

        { name: "177 REV 08-24",
          copy: { message: "Har du utsatt grillrengjøringen siden fjoråret?\n\nGrillklinikkens elektriske grillbørste gjør jobben for deg, trykk på en knapp og risten er ren på minutter. \nIngen skrubbing, null anstrengelse.\n\n✓ Trådløs og oppladbar\n✓ Roterer 180° — kommer til overalt\n✓ Utskiftbare børstehoder, enkle å vaske\n\nKlikk på lenken og bestill din i dag.",
      headline: "Ren rist på minutter — uten et eneste børstehår", description: "", cta: 'SHOP_NOW', link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt" },
          link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt",
          motifs: [
            { name: "NO 177 H3", media: "NO_177_H3" },
          ] },

        { name: "193 #8 REV 08-24",
          copy: { message: "Har du utsatt grillrengjøringen siden fjoråret?\n\nGrillklinikkens elektriske grillbørste gjør jobben for deg, trykk på en knapp og risten er ren på minutter. \nIngen skrubbing, null anstrengelse.\n\n✓ Trådløs og oppladbar\n✓ Roterer 180° — kommer til overalt\n✓ Utskiftbare børstehoder, enkle å vaske\n\nKlikk på lenken og bestill din i dag.",
      headline: "Ren rist på minutter — uten et eneste børstehår", description: "", cta: 'SHOP_NOW', link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt" },
          link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt",
          motifs: [
            { name: "NO 193 #8 H10", media: "NO_193_8_H10" },
          ] },

        { name: "198 REV 08-24",
          copy: { message: "Har du utsatt grillrengjøringen siden fjoråret?\n\nGrillklinikkens elektriske grillbørste gjør jobben for deg, trykk på en knapp og risten er ren på minutter. \nIngen skrubbing, null anstrengelse.\n\n✓ Trådløs og oppladbar\n✓ Roterer 180° — kommer til overalt\n✓ Utskiftbare børstehoder, enkle å vaske\n\nKlikk på lenken og bestill din i dag.",
      headline: "Ren rist på minutter — uten et eneste børstehår", description: "", cta: 'SHOP_NOW', link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt" },
          link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt",
          motifs: [
            { name: "NO 198 H6", media: "NO_198_H6" },
            { name: "NO 198 H10", media: "NO_198_H10" },
          ] },

        { name: "210 REV 08-24",
          copy: { message: "Har du utsatt grillrengjøringen siden fjoråret?\n\nGrillklinikkens elektriske grillbørste gjør jobben for deg, trykk på en knapp og risten er ren på minutter. \nIngen skrubbing, null anstrengelse.\n\n✓ Trådløs og oppladbar\n✓ Roterer 180° — kommer til overalt\n✓ Utskiftbare børstehoder, enkle å vaske\n\nKlikk på lenken og bestill din i dag.",
      headline: "Ren rist på minutter — uten et eneste børstehår", description: "", cta: 'SHOP_NOW', link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt" },
          link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt",
          motifs: [
            { name: "NO 210 H7", media: "NO_210_H7" },
          ] },

        { name: "ELECTRIC2 REV 08-24",
          copy: { message: "Har du utsatt grillrengjøringen siden fjoråret?\n\nGrillklinikkens elektriske grillbørste gjør jobben for deg, trykk på en knapp og risten er ren på minutter. \nIngen skrubbing, null anstrengelse.\n\n✓ Trådløs og oppladbar\n✓ Roterer 180° — kommer til overalt\n✓ Utskiftbare børstehoder, enkle å vaske\n\nKlikk på lenken og bestill din i dag.",
      headline: "Ren rist på minutter — uten et eneste børstehår", description: "", cta: 'SHOP_NOW', link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt" },
          link: "https://grillklinikken.no/products/mastern-risten-skinner-olet-er-kaldt",
          motifs: [
            { name: "NO ELECTRIC2 H2", media: "NO_ELECTRIC2_H2" },
          ] },

        { name: "177 LISTICLE REV 08-24",
          copy: { message: "Har du utsatt grillrengjøringen siden fjoråret?\n\nGrillklinikkens elektriske grillbørste gjør jobben for deg, trykk på en knapp og risten er ren på minutter. \nIngen skrubbing, null anstrengelse.\n\n✓ Trådløs og oppladbar\n✓ Roterer 180° — kommer til overalt\n✓ Utskiftbare børstehoder, enkle å vaske\n\nKlikk på lenken og bestill din i dag.",
      headline: "Ren rist på minutter — uten et eneste børstehår", description: "", cta: 'SHOP_NOW', link: "https://grillklinikken.no/pages/landing-page-blank-jun-30-22-15-14?_ab=0&key=1787566243755" },
          link: "https://grillklinikken.no/pages/landing-page-blank-jun-30-22-15-14?_ab=0&key=1787566243755",
          motifs: [
            { name: "NO 177 H3 L", media: "NO_177_H3" },
          ] },

        { name: "193 #8 LISTICLE REV 08-24",
          copy: { message: "Har du utsatt grillrengjøringen siden fjoråret?\n\nGrillklinikkens elektriske grillbørste gjør jobben for deg, trykk på en knapp og risten er ren på minutter. \nIngen skrubbing, null anstrengelse.\n\n✓ Trådløs og oppladbar\n✓ Roterer 180° — kommer til overalt\n✓ Utskiftbare børstehoder, enkle å vaske\n\nKlikk på lenken og bestill din i dag.",
      headline: "Ren rist på minutter — uten et eneste børstehår", description: "", cta: 'SHOP_NOW', link: "https://grillklinikken.no/pages/landing-page-blank-jun-30-22-15-14?_ab=0&key=1787566243755" },
          link: "https://grillklinikken.no/pages/landing-page-blank-jun-30-22-15-14?_ab=0&key=1787566243755",
          motifs: [
            { name: "NO 193 #8 H10 L", media: "NO_193_8_H10" },
          ] },

        { name: "198 LISTICLE REV 08-24",
          copy: { message: "Har du utsatt grillrengjøringen siden fjoråret?\n\nGrillklinikkens elektriske grillbørste gjør jobben for deg, trykk på en knapp og risten er ren på minutter. \nIngen skrubbing, null anstrengelse.\n\n✓ Trådløs og oppladbar\n✓ Roterer 180° — kommer til overalt\n✓ Utskiftbare børstehoder, enkle å vaske\n\nKlikk på lenken og bestill din i dag.",
      headline: "Ren rist på minutter — uten et eneste børstehår", description: "", cta: 'SHOP_NOW', link: "https://grillklinikken.no/pages/landing-page-blank-jun-30-22-15-14?_ab=0&key=1787566243755" },
          link: "https://grillklinikken.no/pages/landing-page-blank-jun-30-22-15-14?_ab=0&key=1787566243755",
          motifs: [
            { name: "NO 198 H6 L", media: "NO_198_H6" },
            { name: "NO 198 H10 L", media: "NO_198_H10" },
          ] },

        { name: "050 B2 LISTICLE REV 08-24",
          copy: { message: "Har du utsatt grillrengjøringen siden fjoråret?\n\nGrillklinikkens elektriske grillbørste gjør jobben for deg, trykk på en knapp og risten er ren på minutter. \nIngen skrubbing, null anstrengelse.\n\n✓ Trådløs og oppladbar\n✓ Roterer 180° — kommer til overalt\n✓ Utskiftbare børstehoder, enkle å vaske\n\nKlikk på lenken og bestill din i dag.",
      headline: "Ren rist på minutter — uten et eneste børstehår", description: "", cta: 'SHOP_NOW', link: "https://grillklinikken.no/pages/landing-page-blank-aug-24-12-01-40?_ab=0&key=1787566237323" },
          link: "https://grillklinikken.no/pages/landing-page-blank-aug-24-12-01-40?_ab=0&key=1787566237323",
          motifs: [
            { name: "NO 050 B2 H2 L", media: "NO_050_B2_H2" },
          ] },
      ],
    },
  ],
};
