// Finska priset på taköverdraget — majavakauppa.fi.
//   node temu/takoverdrag/fi-priser.mjs          # skriver ut stegen
//
// Axels beslut 2026-09-18: produkten går till FINLAND trots regeln "nya produkter bara
// SE+NO" (CLAUDE.md 2026-09-07). Undantaget gäller bara den här produkten.
//
// Underlag:
//   • CWD-offerten i batch 6-arket har en riktig FINLAND-rad för 6,5 × 3 m:
//     17,42 + 28,34 = 45,76 USD → 126,90 € (samma tal som temu/batch6/README.md).
//     Landat FI/SE = 45,76 / 36,17 = 1,265 — Axel gissade "kanske 20 % högre", det är 26,5 %.
//   • De åtta andra längderna saknar offert (se fakta.mjs). Axel 2026-09-18: "du kanske kan
//     göra en träffsäker gissning … det är bara att kötta in den."
//
// Prisstegen: Axels egen SE-stege (satt för hand i butiken 2026-09-18) × den RIKTIGA
// FI/SE-faktorn ur 6,5 m-raden (126,90 / 1129 = 0,1124), avrundat till X,90.
// Jämförpris = eur(pris × 1,3), samma som alla andra produkter.
//
// Inköpspriset är en MODELL, inte en offert: produkt 2,68 USD/m och FI-frakt 4,36 USD/m,
// båda ur 6,5 m-raden (17,42 / 6,5 resp. 28,34 / 6,5), × längden × kursen 0,856026.
// 6,5 m är den enda raden som är belagd. Byt ut modellen mot CWD:s siffror när de kommer
// (<scratch>/tak/CWD-FORFRAGAN.md) — cogs ur en modell gör vinstrapporten ungefärlig.
import { STORLEKAR } from './fakta.mjs';

export const FX_EUR = 0.856026;
export const AVGIFT_USD = 2.9 / FX_EUR;                 // 2,9 € per ORDER, i priset, inte i cogs
export const eur = (x) => Math.ceil(x) - 0.1 < x ? Math.floor(x) + 1 + 0.9 : Math.floor(x) + 0.9;

export const OFFERT_FI = { langd_m: 6.5, produkt_usd: 17.42, frakt_usd: 28.34, landat_usd: 45.76 };
const PER_M_USD = +(OFFERT_FI.landat_usd / OFFERT_FI.langd_m).toFixed(2);   // 7,04 USD per meter
export const FAKTOR_FI = 0.1124;                          // 126,90 / 1129, avrundat

export const PRIS_FI = STORLEKAR.map((s) => {
  const landat_usd = s.langd_m === OFFERT_FI.langd_m ? OFFERT_FI.landat_usd : +(PER_M_USD * s.langd_m).toFixed(2);
  const pris = s.langd_m === OFFERT_FI.langd_m
    ? eur((landat_usd + AVGIFT_USD) * 3 * FX_EUR)          // 126,90 — riktig offert
    : eur(s.pris_se * FAKTOR_FI);                           // Axels SE-stege × faktorn
  return {
    langd_m: s.langd_m, namn: s.namn, sku: s.sku_se, landat_usd,
    pris, jamfor: eur(pris * 1.3), cogs: +(landat_usd * FX_EUR).toFixed(2),
    offererad: s.langd_m === OFFERT_FI.langd_m,
  };
});

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  console.log('Storlek      SE kr   FI €     jämför €  inköp €   landat USD');
  for (const p of PRIS_FI) {
    const se = STORLEKAR.find((s) => s.langd_m === p.langd_m).pris_se;
    console.log(`${p.namn.padEnd(12)} ${String(se).padStart(5)}  ${p.pris.toFixed(2).padStart(7)}  ${p.jamfor.toFixed(2).padStart(8)}  ${p.cogs.toFixed(2).padStart(7)}  ${p.landat_usd.toFixed(2).padStart(8)}${p.offererad ? '  ← CWD-offert' : '  (modell)'}`);
  }
}
