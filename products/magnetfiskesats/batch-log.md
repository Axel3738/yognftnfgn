# Magnetfiskesatsen — batch-logg

Produkt: Magnetfiskesats 320lb – Neodymmagnet med 10m rep
LP: https://baverbutiken.se/products/magnetfiskesats-320lb-neodymmagnet-med-10m-rep
Pris: 279 kr (Shopify, avläst 2026-08-17). Ingen dna.md ännu — första datan saknas.

## Batch 1 — 2026-08-17 (kampanjstruktur byggd, ej aktiverad)

Konfig: `pipeline/waves/se-magnetfiskesats.config.mjs`, körs med
`node pipeline/multi-batch.mjs waves/se-magnetfiskesats.config.mjs` (kräver
`META_ACCESS_TOKEN`). Allt skapas PAUSAT.

- Kampanj: **Magnetfiskesatsen CBO 08-17** — OUTCOME_SALES, CBO 1000 kr/dag,
  MagiBorsten `1867947880635861`. CBO för test = uttryckligt undantag från
  regel 11, Axels beslut i uppdraget.
- 4 adsets (bred SE, pixel `1554276343018184` PURCHASE, SHOP_NOW,
  sida `678639638662543`, inga creative enhancements):

| Adset | Copy | Assets (mediabibliotekets namn) |
|---|---|---|
| Magnetfiskesats PD | PD (demo) | Magnetfiskesats, _PD, _PD_1, _PD_2, _PD_3, _PD_EXTRA |
| Magnetfiskesats SP | SP (social proof) | _SP, _SP_1, _SP_2, _SP_3 |
| Magnetfiskesats CS | SO (rabatt) | _CS, _CS_1 |
| Magnetfiskesats G | PD (demo) | _G, _G_1, _G_2, _G_3 |

16 annonser totalt. Copyn kommer ur Axels ADCOPY-dokument (PD/SP/SO),
mappningen SO→CS och PD→G är Axels.

### ⚠️ Öppna flaggor
- **Prisglapp:** SO-copyn (CS-adsetet) lovar "50 % rabatt, 240 → 120 kr".
  Sajten säljer för **279 kr utan rabatt**. Aktivera inte CS-adsetet innan
  sajtens pris/rabatt stämmer med copyn.
- Ingen break-even-ROAS/CPA satt för produkten ännu — den finns inte i
  `products/products.json`. Måste in innan första avläsningen.

### Utfall
Ej launchad ännu (byggd pausad, väntar på Meta-åtkomst + Axels aktivering).
