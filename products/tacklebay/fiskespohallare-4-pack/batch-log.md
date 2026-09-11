# Batch-logg — TackleBay, Fiskespöhållare 4-Pack

OPS-butik nr 5 (flerproduktsbutik, produkt 1 av 2). Nyckel
`tacklebay/fiskespohallare-4-pack`, brand **TackleBay**, tacklebay.se.

Annonskonto: **MagiBorsten DK `915422744950975`** (OPS Factorys gemensamma
konto, SEK). Sida `1283919631474370`. Pixel `1079980541064515`.
⚠️ Förväxla aldrig med MagiBorsten `1867947880635861` = Bäverbutiken.

Hub: **Fish rod holder** `3c3270ab-908c-80f8-824d-eed3c4aa94e1` (delad
historia med Bäverbutiken — se dna.md).

---

## Batch #0 (ÄRVD) — Bäverbutiken SE, launch 2026-08-18

Kampanj `Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18` (MagiBorsten
`1867947880635861`, **LÄSES bara**), prefix `Rodholder_`. Avläst 2026-09-11,
`date_preset: maximum`: **73 annonser, 20 149 kr, 85 köp, ROAS 1,84, verklig
AOV 437 kr.** Åtta batcher i källan (adsetnamnen `Batch 2`–`Batch 8`); deras
hypoteser finns bara i hubbens briefer, inte i något repo — de två som lästes
står nedan, resten `hypotes: ej loggad`.

Bara annonser över grinden (≥ 300 kr OCH ≥ 3 köp) får en dom. TackleBays
linjer (Axels tal 2026-09-11, per order på AOV 437 kr): **BE-CPA 294 kr /
BE-ROAS 1,49** — se dna.md "Ekonomin".

| Källannons | Format | Spend | Köp | CPA | ROAS | Vinstbidrag mot 294 kr | Hypotes i källans brief | Utfall |
|---|---|--:|--:|--:|--:|--:|---|---|
| `Rodholder_PD_15_H1` | video | 9 268 kr | 39 | 238 kr | 1,94 | **+2 184 kr** | "Skaka-testet: spöt upp och ner, skakas — invändningen 'håller den?' dödad utan ett ord" | **Höll.** Bästa hooken i kontot (52,0 %), 46 % av all spend, lönsam på båda linjerna. Hold 16,4 % lägst av de bedömbara — det är var den tappar. |
| `Rodholder_PD_6_1` | bild | 2 801 kr | 20 | 140 kr | 3,02 | **+3 080 kr** | "Demo-vinkeln konverterar som statisk när den får budget; isolerad variabel: format" | **Höll.** Störst vinstbidrag av allt, på 13 % av spenden. |
| `Rodholder_PD_16_H1` | video | 2 651 kr | 10 | 265 kr | 1,52 | +290 kr | ej loggad | Strax över BE. Bäst hold av videorna (23,3 %). |
| `Rodholder_PD_11_H2` | video | 1 922 kr | 6 | 320 kr | 1,49 | −156 kr | ej loggad | På break-even. Ingen förlorare på 6 köp. |
| `Rodholder_SO_4_1` | bild | 808 kr | 3 | 269 kr | 1,44 | +75 kr | ej loggad | Preliminär (3 köp). Enda bedömbara som inte är demo. |

Övriga 68 ligger under grinden — **ingen dom.** Bland dem: `CS_3_1` 647 kr /
2 köp (CTR 4,01 %, högst i kontot — klickar men konverterar inte, för tidigt),
`SO_3_H1` 335 kr / 2 köp (hold 28,1 %, bäst hold av allt), `PD_7_1` 331 kr / 1 köp.

**Vad datan säger:** PD-vinkeln bär 91 % av köpen. Video tar volymen, den enda
statiska demon tar effektiviteten. Se dna.md mönster 1–4.

---

## Batch #1 — 2026-09-10 · ÄRVD från Bäverbutiken (`/ny-annonser`, brand-swap)

**Inte en ny batch i vanlig mening.** Kampanj
`TACKLEBAY_SE_Spöhållaren | BE-ROAS 1,67 | 2026-09-10`, 4 adsets (PD, SP, CS,
GT), 23 annonser, CBO 500 kr/dag. Plus `TACKLEBAY_NO_Spöhållaren` med 9
annonser (döms separat, `--marknad NO`).

Annonser i SE-kampanjen (avläst 2026-09-11, last_90d, alla ACTIVE):
`PD_1_H1` (86 kr) · `PROD_V04` (23) · `PD_7_1` (17) · `PROD_V02` (16) ·
`SP_1_H3` (11) · `PD_6_1` (5) · `PROD_V01` (5) · `PD_23_H1` (4) · `SP_1_H1` (2)
· `CS_3_1`, `PD_2_1`, `SP_1_H2`, `PD_15_H2`, `PD_3_H2` (1 kr var) · `GT_3_H1`,
`REA_V02`, `PROD_V05/V06/V07/V08/V10`, `GT_2_1`, `REA_V08` (0 kr).
**Totalt 177 kr, 0 köp. Bedömbara: 0.**

⚠️ Källans tre största videor (`PD_15_H1`, `PD_16_H1`, `PD_11_H2`) är inte med.
Skälet står inte i repot — `hypotes: ej loggad`. Ligger i backloggen som arbete.

### Hypoteser att pröva i första `/notionscalercs`-briefronden

1. Håller den bevisade statiska demon (`PD_6_1`, ROAS 3,02) när länken går
   till en ny butik med sju recensioner i stället för Bäverbutikens sortiment?
2. Håller skaka-testets hook (52 %) med TackleBays transport-vinkel, och går
   holden (16,4 %) att lyfta utan att tappa hooken?
3. `SP_1_H3` (hook 43 %, hold 46 % på 11 kr) — brus tills 300 kr, men första
   raden att läsa.
4. Kalendern som betald upsell i varukorgen (Q4-ramverket) — syns det i AOV?

### Utfall — avläst 2026-09-12 (körning nr 2, last_14d, `factory/budgetrond.mjs` + `skalning.mjs`)

**52 annonser, 768 kr, 1 köp, 6 348 visningar — 0 bedömbara. KALLSTART.**
Två dygn i kampanjen (180,99 kr · 586,90 kr/1 köp). Budgetronden: 0 ändringar.

| Hypotes | Utfall | Data |
|---|---|---|
| 1. `PD_6_1` som statisk håller på ny butik | **Ingen dom** — 5 kr på 14 d | för tidigt |
| 2. Skaka-testets hook på transportvinkeln | **Ingen dom** — `PD_15_H1` ligger inte i kampanjen (`PD_15_H2` 0 kr) | för tidigt; ärvs som variant i batch #2 (`PD_42_H1`) |
| 3. `SP_1_H3` första raden att läsa | **Pekar fortfarande** — 83 kr, hook 39,0 %, hold 31,9 %, CTR 3,11 %, 0 köp | för tidigt, ingen dom |
| 4. Kalendern som upsell syns i AOV | **Ingen dom** — 1 köp (289 kr, ingen kalender) | för tidigt |

Enda köpet: `PD_22_H1`, 14 kr — brus. `PD_16_H2` hook 49,4 % på 61 kr — pekare.

---

## Batch #2 — 2026-09-12 · första briefronden (`/notionscalercs`, körning nr 2)

**Kallstart:** ingen feedback-loop, allt bygger på ärvd DNA + backloggen.
7 briefer (ingen redigerare tilldelad ⇒ 7, inte kadensens 21): 3 varianter
av ärvda vinnare, 2 nya koncept med källa, 2 gissningar. Copy A/B: Fable 3,
Sonnet 3, ärvd 1. Upp i hubben **Fish rod holder** som `Draft` 2026-09-12
(`factory/output/tacklebay/notion-batch-02-2026-09-12.json`).

| Annons | Typ | Förälder / källa | Isolerad variabel | Hypotes | Hook | Copy | Variabeltaggar |
|---|---|---|---|---|---|---|---|
| `TackleBayRod_PD_42_H1` | video | variant av ärvd `PD_15_H1` (39 köp) | mitten 3–12 s: mekanism-macro i stället för mer skakande | holden lyfter över 16,4 % utan att hooken (52 %) tappar | "Skakat upp och ner. Inget öppnar sig. Varför?" | fable | vinkel=demo/mekanism · hook=visuellt test · format=video captions · proof=demo+mekanism · offer=pris slutkort · talare=ingen |
| `TackleBayRod_PD_43_1` | bild | variant av ärvd `PD_6_1` (20 köp, ROAS 3,02) | scenen: brygga → baksäte | scenen är utbytbar, texten bär | "Ett klick. Spöet stängt." (ärvd) | ärvd | vinkel=demo · hook=påstående · format=statisk demo · proof=demo · offer=pris · textmängd=rubrik+underrubrik+pris |
| `TackleBayRod_PD_44_1` | bild | variant av ärvd `PD_6_1` | rubriken: stängningslöfte → transportlöfte | rubriken är inte bäraren | "Håller stängt genom varje sväng." | sonnet | vinkel=demo/transport · hook=påstående · format=statisk demo · proof=demo · offer=pris |
| `TackleBayRod_PD_45_H1` | video | nytt: winning line (85 köp) + `vinkel.huvudvinkel` | — | problem-först i bilen stoppar scrollen som produkt-först | "Trasslet började i baksätet, inte vid vattnet." | fable | vinkel=problem/lösning transport · hook=påstående · format=video captions · proof=demo · offer=pris slutkort |
| `TackleBayRod_PD_46_H1` | video | nytt: leverantörens låssekvens + dna mönster 3 | — | enhandslåset ensamt bär en 8 s-annons | "En hand. Två klick. Låst." | sonnet | vinkel=demo/enhandslås · hook=siffra · format=video 8 s captions · proof=demo · offer=pris slutkort |
| `TackleBayRod_SO_8_1` | bild | **gissning** — SO ej över grinden i källan; Judge.me 7 st | — | sju riktiga femstjärniga säljer en 289-kr-klämma | "Sju av sju ger fem stjärnor." | fable | vinkel=social proof · hook=siffra/recension · format=recensionskort+produkt · proof=recension verbatim · offer=pris litet |
| `TackleBayRod_CS_7_1` | bild | **gissning** — Q4-ramverket, `offer.bonus_produkt` | — | present-kroken lyfter ordervärdet (andel order med kalender) | "Spöhållaren nu. Dragen i december." | sonnet | vinkel=erbjudande/present · hook=påstående · format=split produkt+kalender · proof=inget · offer=båda priser, ingen rabatt |

Pris verifierat 2026-09-12: 289 kr (inget jämförpris), kalendern 469 kr.
Tre-frågorstestet står per rad i varje brief (sektion 8); ❌ finns bara på
ärvda rader som briefen kräver ordagranna (winning line) och på Mikaels
ordagranna recension — inga nyskrivna rader med ❌.

### Utfall

*Fylls i vid nästa briefrond när annonserna passerat grinden.*
