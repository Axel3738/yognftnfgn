# Brand-detektor — DryTrek (damasker)

Körd 2026-09-09 av `factory/brand-detektor.mjs` (Uppdrag A i `factory/FAS2.md`).
Läser bara. Inga krediter, ingen HeyGen, ingen kie.ai, inget skrivet i något annonskonto.

**Källa:** https://baverbutiken.se/products/damasker-vandring-haller-sno-vata-grus-ute · annonsprefix `Damasker_` · konto `1867947880635861` (MagiBorsten, Bäverbutiken SE).
**Mål:** konto `915422744950975` (MagiBorsten DK, OPS Factory). Kontrollerat på id, aldrig på namn.

## Läget: 18 källannonser

| Dom | Antal | Vad det kostar |
|---|---|---|
| `ren` | 16 | inget brandarbete — ⚠️ men läs länken och villkoren nedan innan något laddas upp |
| `bara-copy` | 0 | gratis — skriv om texten / kör `pipeline/oversatt-bild.py` |
| `kräver-slutkortsbygge` | 0 | arbetstid — `pipeline/no-precis.py` byter texten i sin egen ruta |
| `kräver-omdubb` | 0 | HeyGen-krediter — blockerat tills plånboken fylls på |
| `okänd` | 2 | en yta gick inte att läsa — står aldrig som "ren" |

⚠️ **Länken gäller alla 18:** varje annons pekar på källbutiken och måste peka på OPS-butiken.
Bytet ingår i kampanjbygget (Uppdrag B) och håller sig därför utanför klassningen — annars blir varje annons `bara-copy` och tabellen slutar säga något.

## Varje annons, alla fyra ytor

👁 = ett öga har läst samma material och kommit fram till samma sak. Utan 👁 är raden bara maskinläst.

| Annons | Typ | 1 copy | 2 tal | 3 inbränd text | 4 bildattribution | Dom | Måste åtgärdas |
|---|---|---|---|---|---|---|---|
| `Damasker_CS_1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Damasker_CS_2` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Damasker_CS_2_1` | bild | ✅ ren | – | – | ✅ ren | **ren** | — |
| `Damasker_CS_3` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Damasker_FO_1_H1` | video | ✅ ren | ❔ okänd | ✅ ren | – | **okänd** | tal (oläst) |
| `Damasker_G_1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Damasker_G_2` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Damasker_G_2_1` | bild | ✅ ren | – | – | ✅ ren | **ren** | — |
| `Damasker_G_3` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Damasker_PD_1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Damasker_PD_2` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Damasker_PD_2_1` | bild | ✅ ren | – | – | ✅ ren | **ren** | — |
| `Damasker_PD_3` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Damasker_SP_1` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Damasker_SP_2` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Damasker_SP_2_1` | bild | ✅ ren | – | – | ✅ ren | **ren** | — |
| `Damasker_SP_3` | video | ✅ ren | ✅ ren | ✅ ren | – | **ren** | — |
| `Damasker_SP_4_H1` | video | ✅ ren | ❔ okänd | ✅ ren | – | **okänd** | tal (oläst) |

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

**`Damasker_FO_1_H1`** — okänd
- yta 2 · okänd (inget transkript i repot)

**`Damasker_SP_4_H1`** — okänd
- yta 2 · okänd (inget transkript i repot)

## Källbutikens villkor i materialet (utanför FAS2:s fyra ytor)

⚠️ **`ren` betyder brandfri — inte "går att köra som den är".** Det här är pris, rabatt, frakt,
betalsätt, öppet köp och recensionsantal som gäller KÄLLBUTIKEN. Stämmer de inte med OPS-butikens
egna villkor måste de bytas innan annonsen körs, precis som brandnamnet.

| Annons | Dom | Villkor som står i materialet |
|---|---|---|
| `Damasker_CS_1` | ren | rabatt: 40% · öppet köp: 30 dagars öppet köp |
| `Damasker_CS_2` | ren | rabatt: 40% · öppet köp: 30 dagars öppet köp |
| `Damasker_CS_2_1` | ren | rabatt: 40% · öppet köp: 30 dagars öppet köp |
| `Damasker_CS_3` | ren | rabatt: 40% · öppet köp: 30 dagars öppet köp |
| `Damasker_FO_1_H1` | okänd | pris: 389 kr |
| `Damasker_SP_1` | ren | öppet köp: 30 dagars öppet köp |
| `Damasker_SP_2` | ren | öppet köp: 30 dagars öppet köp |
| `Damasker_SP_2_1` | ren | öppet köp: 30 dagars öppet köp, 30 dagars oppet kop |
| `Damasker_SP_3` | ren | öppet köp: 30 dagars öppet köp |

## Kvar att läsa

- `Damasker_FO_1_H1`: tal (oläst) — yta 2 · okänd (inget transkript i repot)
- `Damasker_SP_4_H1`: tal (oläst) — yta 2 · okänd (inget transkript i repot)

Ingen av dem får räknas som `ren` förrän ytan faktiskt lästs.

## Kampanjer annonserna ligger i

- Damasker Vandring | BE ROAS 1.60 | Launch 2026-08-29 — 18 annonser

OCR-källa: `factory/output/damasker/brand-ocr.json (läst 2026-09-09)`.
