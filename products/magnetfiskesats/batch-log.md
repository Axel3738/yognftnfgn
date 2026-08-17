# Magnetfiskesatsen — batch-logg

Produkt: Magnetfiskesats 320lb – Neodymmagnet med 10m rep
LP: https://baverbutiken.se/products/magnetfiskesats-320lb-neodymmagnet-med-10m-rep
Pris: 279 kr (Shopify, avläst 2026-08-17). Ingen dna.md ännu — första datan saknas.

## Batch 1 — 2026-08-17 (LAUNCHAD I KONTOT, allt pausat)

Byggd direkt i Meta via Ads-connectorn. Konfigen
`pipeline/waves/se-magnetfiskesats.config.mjs` speglar strukturen och fungerar
som återkörningsskydd.

- Kampanj: **Magnetfiskesatsen CBO 08-17** — id `120249815379020291`,
  OUTCOME_SALES, CBO 1 000 kr/dag, LOWEST_COST_WITHOUT_CAP, **PAUSED**.
  MagiBorsten `1867947880635861`. CBO för test = uttryckligt undantag från
  regel 11, Axels beslut i uppdraget.
- 3 adsets (bred SE 18–65, Advantage+ audience på, pixel `1554276343018184`
  PURCHASE, SHOP_NOW, sida `678639638662543`, IG `17841474144960111`,
  alla creative enhancements OPT_OUT, video-thumbnails explicit, allt PAUSED):

| Adset | Id | Copy | Annonser |
|---|---|---|---|
| Magnetfiskesats PD | `120249815386260291` | PD (demo) | Magnetfiskesats (bild), _PD (bild), _PD_1, _PD_2, _PD_3, _PD_EXTRA |
| Magnetfiskesats SP | `120249815388480291` | SP (social proof) | _SP (bild), _SP_1, _SP_2, _SP_3 |
| Magnetfiskesats G | `120249815391790291` | PD (demo) | _G (bild), _G_1, _G_2, _G_3 |

14 annonser totalt. Copyn ordagrant ur Axels ADCOPY-dokument (PD/SP),
mappningen PD→G är Axels.

### CS-konceptet utgick (Axels beslut 2026-08-17)
SO-copyn (rabattvinkeln) lovade "50 % rabatt, 240 → 120 kr" — sajten säljer för
**279 kr utan rabatt**. Axel: "Ta inte med annonsen som säger 120 kronor."
Assets `Magnetfiskesats_CS` + `_CS_1` ligger oanvända i mediabiblioteket och kan
byggas senare om priset/copyn rättas.

### Öppna punkter
- Ingen break-even-ROAS/CPA satt — produkten finns inte i `products/products.json`.
  Måste in innan första avläsningen.
- Video-thumbnails sattes explicit från Metas egna förhandsbilder (160 px).
  Vill Axel ha snyggare covers: byt i Ads Manager innan aktivering.

### Utfall
Ej aktiverad ännu — allt ligger PAUSED och väntar på Axels aktivering.
