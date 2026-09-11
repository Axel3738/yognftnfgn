# Brand-detektor — CaraShell (takskyddet)

Körd 2026-09-11 av `factory/brand-detektor.mjs` (Uppdrag A i `factory/FAS2.md`).
Läser bara. Inga krediter, ingen HeyGen, ingen kie.ai, inget skrivet i något annonskonto.

**Källa:** https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan · annonsprefix `Takoverdrag_` · konto `1867947880635861` (MagiBorsten, Bäverbutiken SE).
**Mål:** konto `915422744950975` (MagiBorsten DK, OPS Factory). Kontrollerat på id, aldrig på namn.

## Läget: 16 källannonser

| Dom | Antal | Vad det kostar |
|---|---|---|
| `ren` | 9 | inget brandarbete — ⚠️ men läs länken och villkoren nedan innan något laddas upp |
| `bara-copy` | 3 | gratis — skriv om texten / kör `pipeline/oversatt-bild.py` |
| `kräver-slutkortsbygge` | 1 | arbetstid — `pipeline/no-precis.py` byter texten i sin egen ruta |
| `kräver-omdubb` | 3 | HeyGen-krediter — blockerat tills plånboken fylls på |
| `okänd` | 0 | en yta gick inte att läsa — står aldrig som "ren" |

⚠️ **Länken gäller alla 16:** varje annons pekar på källbutiken och måste peka på OPS-butiken.
Bytet ingår i kampanjbygget (Uppdrag B) och håller sig därför utanför klassningen — annars blir varje annons `bara-copy` och tabellen slutar säga något.

## Varje annons, alla fyra ytor

👁 = ett öga har läst samma material och kommit fram till samma sak. Utan 👁 är raden bara maskinläst.

| Annons | Typ | 1 copy | 2 tal | 3 inbränd text | 4 bildattribution | Dom | Måste åtgärdas |
|---|---|---|---|---|---|---|---|
| `Takoverdrag_CS_1_H1` | video | ✅ ren | ✅ ren | ✅ ren | – | **kräver-omdubb** | öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i tal: säger 30 dagar — butiken har 14 |
| `Takoverdrag_CS_2_1` | bild | ✅ ren | – | – | ✅ ren 👁 | **ren** | — |
| `Takoverdrag_CS_2_H1` | video | ✅ ren | ✅ ren | ✅ ren | – | **kräver-omdubb** | öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i tal: säger 30 dagar — butiken har 14 |
| `Takoverdrag_CS_3_H1` | video | ✅ ren | ✅ ren | ✅ ren | – | **kräver-omdubb** | öppet köp i tal: säger 30 dagar — butiken har 14 |
| `Takoverdrag_GT_1_H1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Takoverdrag_GT_2_1` | bild | ✅ ren | – | – | ✅ ren 👁 | **ren** | — |
| `Takoverdrag_GT_2_H1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Takoverdrag_GT_3_H1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Takoverdrag_PD_1_H1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Takoverdrag_PD_2_1` | bild | ✅ ren | – | – | ✅ ren 👁 | **ren** | — |
| `Takoverdrag_PD_2_H1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Takoverdrag_PD_3_H1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Takoverdrag_SP_1_H1` | video | ✅ ren | ✅ ren | ✅ ren | – | **bara-copy** | öppet köp i copy: säger 30 dagar — butiken har 14 |
| `Takoverdrag_SP_2_1` | bild | ✅ ren | – | – | ✅ ren 👁 | **kräver-slutkortsbygge** | öppet köp i copy: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 |
| `Takoverdrag_SP_2_H1` | video | ✅ ren | ✅ ren | ✅ ren | – | **bara-copy** | öppet köp i copy: säger 30 dagar — butiken har 14 |
| `Takoverdrag_SP_3_H1` | video | ✅ ren | ✅ ren | ✅ ren | – | **bara-copy** | öppet köp i copy: säger 30 dagar — butiken har 14 |

## Hur säkra siffrorna är

| Yta | Hur den lästes | Vad den inte ser |
|---|---|---|
| 1 copy | Meta Graph, live | inget — texten är exakt den som ligger i kontot |
| 2 tal | svenska transkript i `market-expansion/**/srt-orig/` | annonser utan transkript blir `okänd`, aldrig `ren` |
| 3 inbränd text | frames var 0.3 s + lokal OCR + ögongranskning | en textrad som visas kortare än 0.3 s kan hamna mellan två frames |
| 4 bildattribution | lokal OCR på bildannonsen + ögongranskning | OCR läser inte en logotyp utan text — bara ögat gör det |

**Ögongranskning 2026-09-11:** 4 annonser bekräftade, 0 träffar som BARA ögat hittade, 0 oenigheter kvar.

## Belägg

## Källbutikens villkor i materialet (utanför FAS2:s fyra ytor)

⚠️ **`ren` betyder brandfri — inte "går att köra som den är".** Det här är pris, rabatt, frakt,
betalsätt, öppet köp och recensionsantal som gäller KÄLLBUTIKEN. Stämmer de inte med OPS-butikens
egna villkor måste de bytas innan annonsen körs, precis som brandnamnet.

| Annons | Dom | Villkor som står i materialet |
|---|---|---|
| `Takoverdrag_CS_1_H1` | kräver-omdubb | pris: 1469 kr, 1129 kr · rabatt: 23% · frakt: Fri frakt inom Sverige, Fri frakt ingar · öppet köp: 30 dagars oppet kop |
| `Takoverdrag_CS_2_1` | ren | pris: 1469 kr, 1129 kr · rabatt: 23% · frakt: Fri frakt inom Sverige |
| `Takoverdrag_CS_2_H1` | kräver-omdubb | pris: 1469 kr, 1129 kr · rabatt: 23% · frakt: Fri frakt inom Sverige, Fri frakt ingar · öppet köp: 30 dagars oppet kop |
| `Takoverdrag_CS_3_H1` | kräver-omdubb | pris: 1469 kr, 1129 kr · rabatt: 23% · frakt: Fri frakt inom Sverige, Fri frakt ingar · öppet köp: 30 dagar koper |
| `Takoverdrag_GT_1_H1` | ren | frakt: Fri frakt |
| `Takoverdrag_GT_2_1` | ren | frakt: Fri frakt |
| `Takoverdrag_GT_2_H1` | ren | frakt: Fri frakt |
| `Takoverdrag_GT_3_H1` | ren | frakt: Fri frakt |
| `Takoverdrag_PD_1_H1` | ren | frakt: Fri frakt |
| `Takoverdrag_PD_2_1` | ren | frakt: Fri frakt |
| `Takoverdrag_PD_2_H1` | ren | frakt: Fri frakt |
| `Takoverdrag_PD_3_H1` | ren | frakt: Fri frakt |
| `Takoverdrag_SP_1_H1` | bara-copy | öppet köp: 30 dagars öppet köp om du inte är · frakt: Fri frakt |
| `Takoverdrag_SP_2_1` | kräver-slutkortsbygge | öppet köp: 30 dagars öppet köp om du inte är, 30 dagars oppet kop - full aterbet · frakt: Fri frakt · recensioner: Verifierad kund |
| `Takoverdrag_SP_2_H1` | bara-copy | öppet köp: 30 dagars öppet köp om du inte är · frakt: Fri frakt |
| `Takoverdrag_SP_3_H1` | bara-copy | öppet köp: 30 dagars öppet köp om du inte är · frakt: Fri frakt |

## Kampanjer annonserna ligger i

- Taköverdraget för Husvagn 6,5 × 3 m | BE ROAS 1.63 | Launch 2026-09-09 — 16 annonser

OCR-källa: `factory/output/takskyddet/brand-ocr.json (läst 2026-09-11)`.
Ögongranskning: `factory/output/takskyddet/brand-syn.json`.
