// Taköverdrag husvagn/husbil — LÅSTA FAKTA.
// Produkten finns sedan batch 6 i bäverbutiken.se (bara SE, inte NO).
// Handle: takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan
//
// Axel skickade leverantörens svar 2026-09-17 och vill ha alla storlekar som varianter:
//   "Vi måste fixa på hemsidan för taköverdraget så det funkar för Sverige …
//    Ser du alla storleks varianter okej? Vi måste lägga in dom på denna produkten"
//
// ⚠️ PRISET: CWD-offerten (arket "Claude_products_filled 1", 2026-09-05) prissatte BARA
//    6,5 × 3 m — variantrutan säger ordagrant "[210D] Black/silver, 5*3m, 6.5*3m(quote
//    based on this size)". De åtta andra längderna har alltså INGET inköpspris.
//    Frakten är 18,75 av 36,17 USD — mer än halva landade kostnaden — och samma ark visar
//    att frakten för den här produkten slår i "overweight" redan vid qty 3 till Sverige.
//    Att skala fraktkostnaden linjärt till 13,5 m är därför en gissning, inte en beräkning.
//    COGS sätts från offert × kurs (CLAUDE.md) — aldrig ur priset, aldrig ur huvudet.
//    → varianterna skapas när CWD svarat. Se `varianter.mjs`.

export const FX_SEK = 9.4698;
export const AVGIFT_USD = 2.9 / 0.856026;        // 2,9 € per ORDER, ligger i priset, inte i cogs
export const nio = (x) => { const n = Math.ceil(x / 10) * 10 - 1; return n < x ? n + 10 : n; };

export const HANDLE = 'takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan';
export const PRODUKT_ID = 'gid://shopify/Product/16516659937629';

// Leverantörens svar 2026-09-17, via Axel. Allt här är belagt — inget annat får påstås.
export const LATT = {
  bredd_m: 3,                       // alla storlekar är 3 m breda
  tyg: '210D silverbelagd oxfordväv',
  remLangd_m: 2.5,                  // överdragets egna remmar
  remSidor: 4,                      // remmar på fyra sidor, även på sidorna
  justerbar: true,                  // längden på remmarna går att justera
  krok: true,                       // krok i nederkant där remmen hänger
  extraRemmar: { antal: 2, langd_m: 10.5, typ: 'förstärkta spännremmar, ingår utan extra kostnad' },
  forvaringspase: true,             // från batch 6:s bilder (tak-hopvikt.jpg)
  farg: 'svart/silver',
};

// Leverantörens formulering "waterproof and sun-resistant" är ett marknadsföringspåstående.
// Vi säljer på konstruktionen i stället: silverskiktet och 210D-väven är belagda fakta,
// "vattentät" är ett absolut löfte och skrivs aldrig ut. Samma linje som spakapellet.
export const FORBJUDET = ['vattentät', 'vattentätt', '100 %', 'helt tät', 'aldrig läcker'];

// De nio längderna leverantören erbjuder. Alla 3 m breda.
export const STORLEKAR = [5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5].map((l) => ({
  langd_m: l,
  namn: `3 × ${String(l).replace('.', ',')} m`,
  yta_m2: +(3 * l).toFixed(1),
  sku: `TEMU-TAK-3X${String(l).replace('.', '')}`,
  offererad: l === 6.5,             // enda storleken med riktigt inköpspris
}));

// Den enda raden som är belagd: CWD, SWEDEN, qty 1.
export const OFFERERAD = {
  langd_m: 6.5,
  produkt_usd: 17.42,
  frakt_usd: 18.75,
  landat_usd: 36.17,
  cogs_sek: +(36.17 * FX_SEK).toFixed(2),                      // 342,52 — ligger live
  pris_sek: nio((36.17 + 2.9 / 0.856026) * 3 * FX_SEK),        // 1129 — ligger live
  jamfor_sek: nio(nio((36.17 + 2.9 / 0.856026) * 3 * FX_SEK) * 1.3),
};
