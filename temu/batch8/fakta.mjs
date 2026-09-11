// Batch 8 — LÅSTA FAKTA per produkt (offert "9", 2026-09-11).
//
// Varje siffra här är läst ur offertens inbäddade leverantörsbilder eller ur
// CWD:s variantsträng. Står något inte här får det inte påstås i copyn.
// Kategori-GID:na är UPPSLAGNA mot taxonomy{categories(search:)} och verifierade
// med node(id:) — aldrig gissade.
//
// ⛔ Två produkter i arket byggs INTE:
//   - "Professional Telescopic Boat Cover Support Pole" — ingen quote
//     (CWD: "Oversized items will result in high shipping costs").
//   - "Gutter Cleaner MAX" — offerten har pris men INGEN bild, och AliExpress
//     svarar med ett tomt JS-skal mot molnet (5 URL-former × 2 UA testade).
//     Produkten är dessutom en skopa + koppling till en 3/4" ACME-gängad stång
//     (amerikansk standard, stången ingår inte) — behöver Axels besked.

export const FAKTA = {
  sotarset: {
    sku: 'TEMU-B8-SOTARSET',
    kategori: 'gid://shopify/TaxonomyCategory/ha-15-7',        // Hardware > Tools > Chimney Brushes
    kalla: 'bilder/image3.jpg',
    // CWD:s variantsträng: "9 x 410mm brush handles + 1 x 100mm brush head + 1 x hexagonal brush handle"
    latt: {
      stanger: 9, stangLangdMm: 410, rackviddM: 3.69,          // 9 × 41 cm
      borsthuvudMm: 100, borstMaterial: 'nylon', adapter: 'sexkantsadapter',
    },
    obs: 'Bilden visar SEX stänger, offerten nio — illustrera aldrig "9 stänger" med den bilden.',
    varning: null,
  },
  vedborr: {
    sku: 'TEMU-B8-VEDBORR',
    kategori: 'gid://shopify/TaxonomyCategory/ha-14-28-3',     // Tool Accessories > Wedge Tools > Splitting Wedges
    kalla: 'bilder/image5.jpg',
    // CWD: "32mm (Three types of handles in plastic case set)". Måtten står på bilden.
    latt: {
      konDiameterMm: 32, konHojdMm: 85,
      skaft: 3, skaftLangdMm: 65, skaftDiameterMm: 10,
      skafttyper: ['rund', 'SDS', 'sexkant'],
      askMm: [100, 35],
    },
    obs: 'Måtten står på engelska/metriskt i källbilden — ingen text behöver bort.',
    varning: 'Roterande verktyg. Använd aldrig med slagborr eller slagfunktion.',
  },
  tofflor: {
    sku: 'TEMU-B8-TOFFLOR',
    kategori: 'gid://shopify/TaxonomyCategory/aa-8-7',         // Apparel & Accessories > Shoes > Slippers
    kalla: 'bilder/image8.png (khaki) + t-tofflor.jpg (svart, 1200 px, Temus top_gallery_url)',
    // CWD: "size:40-47" + "Khaki, black"
    latt: {
      storlekar: [40, 41, 42, 43, 44, 45, 46, 47], farger: ['Khaki', 'Svart'],
      typ: 'foppatoffel med plyschfoder och hälrem', monster: 'kamouflage',
    },
    obs: 'Båda färgerna är kamouflagetryck — khaki i ljusa toner, svart i mörka.',
    varning: null,
  },
  solcellslampa: {
    sku: 'TEMU-B8-SOLCELLSLAMPA',
    kategori: 'gid://shopify/TaxonomyCategory/hg-2-5',         // Home & Garden > Business & Home Security > Security Lights
    kalla: 'bilder/image2.jpg (748 px) + t-lampa.jpeg (1200 px, visar TVÅ lampor)',
    // CWD: "210 LED Solar Triple Head Light [1200mAh]"
    latt: { lysdioder: 210, batteriMah: 1200, huvuden: 3, sensor: 'rörelsesensor', drift: 'solcell' },
    obs: '⚠️ bilder/image7.png visar 74-LED-varianten (glesare dioder) och dess MÅTT — den bilden '
       + 'och de måtten hör INTE till den offererade 210-LED-lampan och får inte användas. '
       + 'Temu-bilden visar två lampor; vi säljer EN — beskär till en enhet.',
    varning: null,
  },
  bilborste: {
    sku: 'TEMU-B8-BILBORSTE',
    kategori: 'gid://shopify/TaxonomyCategory/vp-1-5-2-1',     // Vehicle Cleaning > Car Wash Brushes
    kalla: 'bilder/image4.jpg',
    // CWD: "Small stainless steel rod". Måtten står på bilden (kinesisk text).
    latt: { totalLangdCm: 100, borsthuvudCm: 25, viktG: 335, skaft: 'rostfritt stål, teleskop', borstar: 2, farg: 'grå mikrofiber' },
    obs: 'Kinesisk text på bilden (双刷头拖把灰色 / 小号不锈钢杆 335g / 全长100CM) måste bort. '
       + 'Skaftet är 100 cm — påstå ALDRIG att den når taket på en stor bil eller husbil.',
    varning: null,
  },
  fonsterlarm: {
    sku: 'TEMU-B8-FONSTERLARM',
    kategori: 'gid://shopify/TaxonomyCategory/hg-2',           // Home & Garden > Business & Home Security
    kalla: 'bilder/image1.jpg',
    latt: { ljudnivaDb: 110, sensor: 'vibrationssensor', fjarrkontroll: true, monteras: 'dörr, fönster, cykel' },
    obs: 'Röd rubrik "Anti-Theft Alarm" och cyan "Factory Supply In Stock" måste beskäras bort.',
    varning: null,
  },
};

export const EJ_BYGGDA = {
  hangrannerensare: 'Ingen bild i offerten och AliExpress är blockerat från molnet. '
    + 'Dessutom: skopa + koppling till 3/4" ACME-gängad stång (amerikansk standard), stång ingår inte.',
  batstangen: 'Ingen quote — CWD: "Oversized items will result in high shipping costs".',
};
