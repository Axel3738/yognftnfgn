# Brand-detektor — DryTrek (damasker) · marknad NO

Körd 2026-09-09 av `factory/brand-detektor.mjs` (Uppdrag A i `factory/FAS2.md`).
Läser bara. Inga krediter, ingen HeyGen, ingen kie.ai, inget skrivet i något annonskonto.

**Källa:** https://baverbutiken.se/products/damasker-vandring-haller-sno-vata-grus-ute · annonsprefix `Gamasjer_NO_` · konto `1050941584152547` (Magiborsten NO, Bäverbutiken NO).
**Mål:** konto `915422744950975` (MagiBorsten DK, OPS Factory). Kontrollerat på id, aldrig på namn.

## Läget: 16 källannonser

| Dom | Antal | Vad det kostar |
|---|---|---|
| `ren` | 16 | inget brandarbete — ⚠️ men läs länken och villkoren nedan innan något laddas upp |
| `bara-copy` | 0 | gratis — skriv om texten / kör `pipeline/oversatt-bild.py` |
| `kräver-slutkortsbygge` | 0 | arbetstid — `pipeline/no-precis.py` byter texten i sin egen ruta |
| `kräver-omdubb` | 0 | HeyGen-krediter — blockerat tills plånboken fylls på |
| `okänd` | 0 | en yta gick inte att läsa — står aldrig som "ren" |

⚠️ **Länken gäller alla 16:** varje annons pekar på källbutiken och måste peka på OPS-butiken.
Bytet ingår i kampanjbygget (Uppdrag B) och håller sig därför utanför klassningen — annars blir varje annons `bara-copy` och tabellen slutar säga något.

## Varje annons, alla fyra ytor

👁 = ett öga har läst samma material och kommit fram till samma sak. Utan 👁 är raden bara maskinläst.

| Annons | Typ | 1 copy | 2 tal | 3 inbränd text | 4 bildattribution | Dom | Måste åtgärdas |
|---|---|---|---|---|---|---|---|
| `Gamasjer_NO_CS_1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Gamasjer_NO_CS_2` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Gamasjer_NO_CS_2_1` | bild | ✅ ren | – | – | ✅ ren | **ren** | — |
| `Gamasjer_NO_CS_3` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Gamasjer_NO_G_1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Gamasjer_NO_G_2` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Gamasjer_NO_G_2_1` | bild | ✅ ren | – | – | ✅ ren | **ren** | — |
| `Gamasjer_NO_G_3` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Gamasjer_NO_PD_1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Gamasjer_NO_PD_2` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Gamasjer_NO_PD_2_1` | bild | ✅ ren | – | – | ✅ ren | **ren** | — |
| `Gamasjer_NO_PD_3` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Gamasjer_NO_SP_1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Gamasjer_NO_SP_2` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Gamasjer_NO_SP_2_1` | bild | ✅ ren | – | – | ✅ ren | **ren** | — |
| `Gamasjer_NO_SP_3` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |

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
| `Gamasjer_NO_CS_1` | ren | pris: 300 kr · rabatt: 40 % · frakt: Fri frakt over 300 kr |
| `Gamasjer_NO_CS_2` | ren | pris: 300 kr · rabatt: 40 % · frakt: Fri frakt over 300 kr |
| `Gamasjer_NO_CS_2_1` | ren | pris: 300 kr · rabatt: 40 %, 40% · frakt: Fri frakt over 300 kr |
| `Gamasjer_NO_CS_3` | ren | pris: 300 kr · rabatt: 40 % · frakt: Fri frakt over 300 kr |

## Kampanjer annonserna ligger i

- Gamasjer NO | BE-ROAS 1,64 | 2026-08-30 — 16 annonser

OCR-källa: `factory/output/damasker/brand-ocr-no.json (läst 2026-09-09)`.
