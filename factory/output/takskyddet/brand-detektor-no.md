# Brand-detektor — CaraShell (takskyddet)

Körd 2026-09-11 av `factory/brand-detektor.mjs` (Uppdrag A i `factory/FAS2.md`).
Läser bara. Inga krediter, ingen HeyGen, ingen kie.ai, inget skrivet i något annonskonto.

**Källa:** https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan · annonsprefix `Takovertrekk_NO_` · konto `1050941584152547` (MagiBorsten, Bäverbutiken SE).
**Mål:** konto `915422744950975` (MagiBorsten DK, OPS Factory). Kontrollerat på id, aldrig på namn.

## Läget: 12 källannonser

| Dom | Antal | Vad det kostar |
|---|---|---|
| `ren` | 6 | inget brandarbete — ⚠️ men läs länken och villkoren nedan innan något laddas upp |
| `bara-copy` | 3 | gratis — skriv om texten / kör `pipeline/oversatt-bild.py` |
| `kräver-slutkortsbygge` | 0 | arbetstid — `pipeline/no-precis.py` byter texten i sin egen ruta |
| `kräver-omdubb` | 3 | HeyGen-krediter — blockerat tills plånboken fylls på |
| `okänd` | 0 | en yta gick inte att läsa — står aldrig som "ren" |

⚠️ **Länken gäller alla 12:** varje annons pekar på källbutiken och måste peka på OPS-butiken.
Bytet ingår i kampanjbygget (Uppdrag B) och håller sig därför utanför klassningen — annars blir varje annons `bara-copy` och tabellen slutar säga något.

## Varje annons, alla fyra ytor

👁 = ett öga har läst samma material och kommit fram till samma sak. Utan 👁 är raden bara maskinläst.

| Annons | Typ | 1 copy | 2 tal | 3 inbränd text | 4 bildattribution | Dom | Måste åtgärdas |
|---|---|---|---|---|---|---|---|
| `Takovertrekk_NO_CS_1` | video | ✅ ren | ✅ ren | ✅ ren | – | **kräver-omdubb** | öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i tal: säger 30 dagar — butiken har 14 |
| `Takovertrekk_NO_CS_2` | video | ✅ ren | ✅ ren | ✅ ren | – | **kräver-omdubb** | öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i tal: säger 30 dagar — butiken har 14 |
| `Takovertrekk_NO_CS_3` | video | ✅ ren | ✅ ren | ✅ ren | – | **kräver-omdubb** | öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i inbränd: säger 30 dagar — butiken har 14 + öppet köp i tal: säger 30 dagar — butiken har 14 |
| `Takovertrekk_NO_G_1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Takovertrekk_NO_G_2` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Takovertrekk_NO_G_3` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Takovertrekk_NO_PD_1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Takovertrekk_NO_PD_2` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Takovertrekk_NO_PD_3` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Takovertrekk_NO_SP_1` | video | ✅ ren | ✅ ren | ✅ ren | – | **bara-copy** | öppet köp i copy: säger 30 dagar — butiken har 14 |
| `Takovertrekk_NO_SP_2` | video | ✅ ren | ✅ ren | ✅ ren | – | **bara-copy** | öppet köp i copy: säger 30 dagar — butiken har 14 |
| `Takovertrekk_NO_SP_3` | video | ✅ ren | ✅ ren | ✅ ren | – | **bara-copy** | öppet köp i copy: säger 30 dagar — butiken har 14 |

## Hur säkra siffrorna är

| Yta | Hur den lästes | Vad den inte ser |
|---|---|---|
| 1 copy | Meta Graph, live | inget — texten är exakt den som ligger i kontot |
| 2 tal | svenska transkript i `market-expansion/**/srt-orig/` | annonser utan transkript blir `okänd`, aldrig `ren` |
| 3 inbränd text | frames var 0.3 s + lokal OCR | en textrad som visas kortare än 0.3 s kan hamna mellan två frames |
| 4 bildattribution | lokal OCR på bildannonsen | OCR läser inte en logotyp utan text — bara ögat gör det |

⚠️ **Ingen ögongranskning gjord.** Yta 3 och 4 vilar då enbart på OCR — som varken ser en logotyp utan text
eller en textrad mellan två frames. Lägg `brand-syn.json` bredvid rapporten när materialet är sett.

## Belägg

## Källbutikens villkor i materialet (utanför FAS2:s fyra ytor)

⚠️ **`ren` betyder brandfri — inte "går att köra som den är".** Det här är pris, rabatt, frakt,
betalsätt, öppet köp och recensionsantal som gäller KÄLLBUTIKEN. Stämmer de inte med OPS-butikens
egna villkor måste de bytas innan annonsen körs, precis som brandnamnet.

| Annons | Dom | Villkor som står i materialet |
|---|---|---|
| `Takovertrekk_NO_CS_1` | kräver-omdubb | pris: 1549 kr, 1189 kr · rabatt: 23% · frakt: Fri frakt, Fri frakt erinkludert |
| `Takovertrekk_NO_CS_2` | kräver-omdubb | pris: 1549 kr, 1189 kr · rabatt: 23% · frakt: Fri frakt, Fri frakt er inkludert |
| `Takovertrekk_NO_CS_3` | kräver-omdubb | pris: 1549 kr, 1189 kr · rabatt: 23% · frakt: Fri frakt, Fri frakt erinkludert |
| `Takovertrekk_NO_G_1` | ren | frakt: Fri frakt |
| `Takovertrekk_NO_G_2` | ren | frakt: Fri frakt |
| `Takovertrekk_NO_G_3` | ren | frakt: Fri frakt |
| `Takovertrekk_NO_PD_1` | ren | frakt: Fri frakt |
| `Takovertrekk_NO_PD_2` | ren | frakt: Fri frakt |
| `Takovertrekk_NO_PD_3` | ren | frakt: Fri frakt |
| `Takovertrekk_NO_SP_1` | bara-copy | frakt: Fri frakt |
| `Takovertrekk_NO_SP_2` | bara-copy | frakt: Fri frakt |
| `Takovertrekk_NO_SP_3` | bara-copy | frakt: Fri frakt |

## Kampanjer annonserna ligger i

- Takovertrekk Campingvogn NO | BE-ROAS 1,62 | 2026-09-11 — 12 annonser

OCR-källa: `factory/output/takskyddet/brand-ocr-no.json (läst 2026-09-11)`.
