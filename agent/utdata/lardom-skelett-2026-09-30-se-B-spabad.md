# Lärdomar att skriva — 2026-09-30

1777 etiketterade annonser utan lärdom (SE). Fyll varje [FYLL I], spara, kör `node agent/lardom.mjs --skriv <fil>`. En annons är inte klar förrän raden LARDOM finns.

## Övervakningskameran (120249989799680291)

### Lärdom L-120250333939530291 — Spabadskapell_GT_1_H2 (SPEND_WINNER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | SPEND_WINNER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 914 kr / 2 075 kr (44 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | 0,0 % (0 köp / 64 LPV) |
| Hook rate / hold rate | 42 % / 11 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Har du någon i familjen som älskar sitt spabad? 🎁" · rubrik: "Den perfekta presenten till spabadsägaren"
- VO/captions: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som köper present till en spabadsägare ("någon i familjen") | okänd |
| Vinkel | — (brief saknas i repot) | GT (present) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — "ett kapell som håller spabadet rent" | okänd |
| Mekanism | — (brief saknas i repot) | "håller spabadet rent, utan att de behöver lyfta ett finger" | okänd |
| Tro | — (brief saknas i repot) | presentrisken: "Ingen "ännu en grej i garderoben"" | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Spend winner: läs FÖRST kommentarerna på annonsen (node tools/annonskommentarer.mjs --annons <id>) — vad invänder publiken mot? Sedan konverteringsgraden, sedan manuset. Saknas tro, brådska, insats eller funnel-kongruens? Lägg bara till den delen, bygg inte om hela annonsen.

**Hypotes (gissning):** Gissning: Meta lade 914 kr (44 %) på annonsen på hook rate 42 % och hold rate 11 %, men 64 sidvisningar gav 0 köp — gåvoöppningen fångar tummen, men underlaget är för litet för att säga att den inte säljer.

**Nästa annonser:**
- SLÄPP tills vidare — under grinden (914 kr, 0 köp): Meta gav den mest spend men ingen bedömbar dom finns; kampanjen är pausad (CAMPAIGN_PAUSED) och produkten saknar produktmapp och DNA, så ingen iteration namnges — läs om först om Axel slår på Spabadskapellet igen.

### Lärdom L-120250333939140291 — Spabadskapell_CS_1_H3 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 549 kr / 2 075 kr (26 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | 0,0 % (0 köp / 44 LPV) |
| Hook rate / hold rate | 28 % / 4 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "⏰ IDAG ENDAST – 23% RABATT!" · rubrik: "Ett rent spabad, utan att lyfta ett finger"
- VO/captions: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | spabadsägare som ser ett pris — ingen person i copyn | okänd |
| Vinkel | — (brief saknas i repot) | CS (pris/rabatt) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — produktnamnet och priset direkt | okänd |
| Mekanism | — (brief saknas i repot) | ingen mekanism i copyn — bara priset och "Ingen kod behövs" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | 809 kr → 619 kr, "23% rabatt" (priset stämmer mot produktkartan: 619 kr, jämförpris 809 kr) | okänd |
| Brådska | — (brief saknas i repot) | "IDAG ENDAST" och "Lagret tar snart slut" — brådska i copyn som inte gått att kontrollera mot verkligheten (ingen brief, ingen produktmapp) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 549 kr av kampanjens 2 075 kr utan köp på hook rate 28 % är en observation under grinden — för litet för att säga något om idén (CS-copyn).

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (549 kr, 0 köp); kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333939180291 — Spabadskapell_CS_2_1 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 177 kr / 2 075 kr (9 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | 0,0 % (0 köp / 7 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "⏰ IDAG ENDAST – 23% RABATT!" · rubrik: "Ett rent spabad, utan att lyfta ett finger"
- Bilden och dess text: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | spabadsägare som ser ett pris — ingen person i copyn | okänd |
| Vinkel | — (brief saknas i repot) | CS (pris/rabatt) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — produktnamnet och priset direkt | okänd |
| Mekanism | — (brief saknas i repot) | ingen mekanism i copyn — bara priset och "Ingen kod behövs" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | 809 kr → 619 kr, "23% rabatt" (priset stämmer mot produktkartan: 619 kr, jämförpris 809 kr) | okänd |
| Brådska | — (brief saknas i repot) | "IDAG ENDAST" och "Lagret tar snart slut" — brådska i copyn som inte gått att kontrollera mot verkligheten (ingen brief, ingen produktmapp) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 177 kr av kampanjens 2 075 kr utan köp på hook rate okänd är en observation under grinden — för litet för att säga något om idén (CS-copyn).

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (177 kr, 0 köp); kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333939850291 — Spabadskapell_GT_2_1 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 115 kr / 2 075 kr (6 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | 0,0 % (0 köp / 14 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Har du någon i familjen som älskar sitt spabad? 🎁" · rubrik: "Den perfekta presenten till spabadsägaren"
- Bilden och dess text: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som köper present till en spabadsägare ("någon i familjen") | okänd |
| Vinkel | — (brief saknas i repot) | GT (present) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — "ett kapell som håller spabadet rent" | okänd |
| Mekanism | — (brief saknas i repot) | "håller spabadet rent, utan att de behöver lyfta ett finger" | okänd |
| Tro | — (brief saknas i repot) | presentrisken: "Ingen "ännu en grej i garderoben"" | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 115 kr av kampanjens 2 075 kr utan köp på hook rate okänd är en observation under grinden — för litet för att säga något om idén (GT-copyn).

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (115 kr, 0 köp); kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333939620291 — Spabadskapell_GT_1_H3 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 93 kr / 2 075 kr (4 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | 29 % / 5 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Har du någon i familjen som älskar sitt spabad? 🎁" · rubrik: "Den perfekta presenten till spabadsägaren"
- VO/captions: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som köper present till en spabadsägare ("någon i familjen") | okänd |
| Vinkel | — (brief saknas i repot) | GT (present) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — "ett kapell som håller spabadet rent" | okänd |
| Mekanism | — (brief saknas i repot) | "håller spabadet rent, utan att de behöver lyfta ett finger" | okänd |
| Tro | — (brief saknas i repot) | presentrisken: "Ingen "ännu en grej i garderoben"" | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 93 kr av kampanjens 2 075 kr utan köp på hook rate 29 % är en observation under grinden — för litet för att säga något om idén (GT-copyn).

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (93 kr, 0 köp); kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333940190291 — Spabadskapell_PD_1_H2 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 59 kr / 2 075 kr (3 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | 0,0 % (0 köp / 2 LPV) |
| Hook rate / hold rate | 20 % / 3 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Löv i spabadet igen? 🍂" · rubrik: "Ett rent spabad, utan att lyfta ett finger"
- VO/captions: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | spabadsägare som plockar löv — problemet i första raden | okänd |
| Vinkel | — (brief saknas i repot) | PD (produkt/problem) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem-medveten — öppnar på lövproblemet | okänd |
| Mekanism | — (brief saknas i repot) | "håller du löv, smuts och skräp borta – helt automatiskt"; "Tål regn, vind och sol, år efter år" är ett materialpåstående som inte kontrollerats mot produktsidan | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 59 kr av kampanjens 2 075 kr utan köp på hook rate 20 % är en observation under grinden — för litet för att säga något om idén (PD-copyn).

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (59 kr, 0 köp); kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333940360291 — Spabadskapell_PD_1_H3 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 38 kr / 2 075 kr (2 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | 35 % / 8 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Löv i spabadet igen? 🍂" · rubrik: "Ett rent spabad, utan att lyfta ett finger"
- VO/captions: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | spabadsägare som plockar löv — problemet i första raden | okänd |
| Vinkel | — (brief saknas i repot) | PD (produkt/problem) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem-medveten — öppnar på lövproblemet | okänd |
| Mekanism | — (brief saknas i repot) | "håller du löv, smuts och skräp borta – helt automatiskt"; "Tål regn, vind och sol, år efter år" är ett materialpåstående som inte kontrollerats mot produktsidan | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 38 kr av kampanjens 2 075 kr utan köp på hook rate 35 % är en observation under grinden — för litet för att säga något om idén (PD-copyn).

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (38 kr, 0 köp); kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333940660291 — Spabadskapell_PD_2_1 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 31 kr / 2 075 kr (2 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Löv i spabadet igen? 🍂" · rubrik: "Ett rent spabad, utan att lyfta ett finger"
- Bilden och dess text: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | spabadsägare som plockar löv — problemet i första raden | okänd |
| Vinkel | — (brief saknas i repot) | PD (produkt/problem) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem-medveten — öppnar på lövproblemet | okänd |
| Mekanism | — (brief saknas i repot) | "håller du löv, smuts och skräp borta – helt automatiskt"; "Tål regn, vind och sol, år efter år" är ett materialpåstående som inte kontrollerats mot produktsidan | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 31 kr av kampanjens 2 075 kr utan köp på hook rate okänd är en observation under grinden — för litet för att säga något om idén (PD-copyn).

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (31 kr, 0 köp); kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333941260291 — Spabadskapell_SP_1_H3 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 29 kr / 2 075 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | 36 % / 9 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Det här säger våra kunder ⭐⭐⭐⭐⭐" · rubrik: "Därför älskar kunderna sitt spabadskapell"
- VO/captions: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | spabadsägare som vill se andras omdöme | okänd |
| Vinkel | — (brief saknas i repot) | SP (social proof) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — recension av produkten | okänd |
| Mekanism | — (brief saknas i repot) | "Håller löv, smuts och väder borta – utan krångel" | okänd |
| Tro | — (brief saknas i repot) | citatet ("Fantastisk kvalitet, sitter perfekt …") och "Tusentals spabadsägare i Sverige har redan bytt" — varken citatet eller "tusentals" är kontrollerat mot recensionsdata här | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 29 kr av kampanjens 2 075 kr utan köp på hook rate 36 % är en observation under grinden — för litet för att säga något om idén (SP-copyn).

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (29 kr, 0 köp); kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333939920291 — Spabadskapell_PD_1_H1 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 18 kr / 2 075 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | 57 % / 13 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Löv i spabadet igen? 🍂" · rubrik: "Ett rent spabad, utan att lyfta ett finger"
- VO/captions: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | spabadsägare som plockar löv — problemet i första raden | okänd |
| Vinkel | — (brief saknas i repot) | PD (produkt/problem) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem-medveten — öppnar på lövproblemet | okänd |
| Mekanism | — (brief saknas i repot) | "håller du löv, smuts och skräp borta – helt automatiskt"; "Tål regn, vind och sol, år efter år" är ett materialpåstående som inte kontrollerats mot produktsidan | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 18 kr av kampanjens 2 075 kr utan köp på hook rate 57 % är en observation under grinden — för litet för att säga något om idén (PD-copyn).

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (18 kr, 0 köp); kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333941580291 — Spabadskapell_SP_2_1 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 16 kr / 2 075 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Det här säger våra kunder ⭐⭐⭐⭐⭐" · rubrik: "Därför älskar kunderna sitt spabadskapell"
- Bilden och dess text: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | spabadsägare som vill se andras omdöme | okänd |
| Vinkel | — (brief saknas i repot) | SP (social proof) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — recension av produkten | okänd |
| Mekanism | — (brief saknas i repot) | "Håller löv, smuts och väder borta – utan krångel" | okänd |
| Tro | — (brief saknas i repot) | citatet ("Fantastisk kvalitet, sitter perfekt …") och "Tusentals spabadsägare i Sverige har redan bytt" — varken citatet eller "tusentals" är kontrollerat mot recensionsdata här | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 16 kr av kampanjens 2 075 kr utan köp på hook rate okänd är en observation under grinden — för litet för att säga något om idén (SP-copyn).

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (16 kr, 0 köp); kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333941060291 — Spabadskapell_SP_1_H2 (LOSER, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 11 kr / 2 075 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 29 % / 3 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Det här säger våra kunder ⭐⭐⭐⭐⭐" · rubrik: "Därför älskar kunderna sitt spabadskapell"
- VO/captions: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | spabadsägare som vill se andras omdöme | okänd |
| Vinkel | — (brief saknas i repot) | SP (social proof) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — recension av produkten | okänd |
| Mekanism | — (brief saknas i repot) | "Håller löv, smuts och väder borta – utan krångel" | okänd |
| Tro | — (brief saknas i repot) | citatet ("Fantastisk kvalitet, sitter perfekt …") och "Tusentals spabadsägare i Sverige har redan bytt" — varken citatet eller "tusentals" är kontrollerat mot recensionsdata här | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 11 kr av kampanjens 2 075 kr utan köp på hook rate 29 % är en observation under grinden — för litet för att säga något om idén (SP-copyn).

**Nästa annonser:**
- SLÄPP — LOSER under grinden: en observation, ingen dom (11 kr, 0 köp); kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333940760291 — Spabadskapell_SP_1_H1 (INGEN_LEVERANS, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 8 kr / 2 075 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 64 % / 9 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Det här säger våra kunder ⭐⭐⭐⭐⭐" · rubrik: "Därför älskar kunderna sitt spabadskapell"
- VO/captions: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | spabadsägare som vill se andras omdöme | okänd |
| Vinkel | — (brief saknas i repot) | SP (social proof) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — recension av produkten | okänd |
| Mekanism | — (brief saknas i repot) | "Håller löv, smuts och väder borta – utan krångel" | okänd |
| Tro | — (brief saknas i repot) | citatet ("Fantastisk kvalitet, sitter perfekt …") och "Tusentals spabadsägare i Sverige har redan bytt" — varken citatet eller "tusentals" är kontrollerat mot recensionsdata här | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen 8 kr av kampanjens 2 075 kr — hook rate 64 % är mätt på för få visningar för att tolkas, så utfallet säger att den aldrig fick tävla, inte något om idén.

**Nästa annonser:**
- SLÄPP — INGEN_LEVERANS (8 kr, Metas dom, aldrig ABO): kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333939500291 — Spabadskapell_GT_1_H1 (INGEN_LEVERANS, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 7 kr / 2 075 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 48 % / 3 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "Har du någon i familjen som älskar sitt spabad? 🎁" · rubrik: "Den perfekta presenten till spabadsägaren"
- VO/captions: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som köper present till en spabadsägare ("någon i familjen") | okänd |
| Vinkel | — (brief saknas i repot) | GT (present) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — "ett kapell som håller spabadet rent" | okänd |
| Mekanism | — (brief saknas i repot) | "håller spabadet rent, utan att de behöver lyfta ett finger" | okänd |
| Tro | — (brief saknas i repot) | presentrisken: "Ingen "ännu en grej i garderoben"" | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad i copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen 7 kr av kampanjens 2 075 kr — hook rate 48 % är mätt på för få visningar för att tolkas, så utfallet säger att den aldrig fick tävla, inte något om idén.

**Nästa annonser:**
- SLÄPP — INGEN_LEVERANS (7 kr, Metas dom, aldrig ABO): kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333939000291 — Spabadskapell_CS_1_H2 (INGEN_LEVERANS, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 5 kr / 2 075 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 37 % / 10 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "⏰ IDAG ENDAST – 23% RABATT!" · rubrik: "Ett rent spabad, utan att lyfta ett finger"
- VO/captions: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | spabadsägare som ser ett pris — ingen person i copyn | okänd |
| Vinkel | — (brief saknas i repot) | CS (pris/rabatt) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — produktnamnet och priset direkt | okänd |
| Mekanism | — (brief saknas i repot) | ingen mekanism i copyn — bara priset och "Ingen kod behövs" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | 809 kr → 619 kr, "23% rabatt" (priset stämmer mot produktkartan: 619 kr, jämförpris 809 kr) | okänd |
| Brådska | — (brief saknas i repot) | "IDAG ENDAST" och "Lagret tar snart slut" — brådska i copyn som inte gått att kontrollera mot verkligheten (ingen brief, ingen produktmapp) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen 5 kr av kampanjens 2 075 kr — hook rate 37 % är mätt på för få visningar för att tolkas, så utfallet säger att den aldrig fick tävla, inte något om idén.

**Nästa annonser:**
- SLÄPP — INGEN_LEVERANS (5 kr, Metas dom, aldrig ABO): kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

### Lärdom L-120250333938720291 — Spabadskapell_CS_1_H1 (INGEN_LEVERANS, etikett 2026-09-30)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-23 – 2026-09-29 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 5 kr / 2 075 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS okänd |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 25 % / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-30): "⏰ IDAG ENDAST – 23% RABATT!" · rubrik: "Ett rent spabad, utan att lyfta ett finger"
- VO/captions: ej läst (ingen brief i repot, ingen ram dragen).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | spabadsägare som ser ett pris — ingen person i copyn | okänd |
| Vinkel | — (brief saknas i repot) | CS (pris/rabatt) enligt namnkoden och copyn | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — produktnamnet och priset direkt | okänd |
| Mekanism | — (brief saknas i repot) | ingen mekanism i copyn — bara priset och "Ingen kod behövs" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | 809 kr → 619 kr, "23% rabatt" (priset stämmer mot produktkartan: 619 kr, jämförpris 809 kr) | okänd |
| Brådska | — (brief saknas i repot) | "IDAG ENDAST" och "Lagret tar snart slut" — brådska i copyn som inte gått att kontrollera mot verkligheten (ingen brief, ingen produktmapp) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen 5 kr av kampanjens 2 075 kr — hook rate 25 % är mätt på för få visningar för att tolkas, så utfallet säger att den aldrig fick tävla, inte något om idén.

**Nästa annonser:**
- SLÄPP — INGEN_LEVERANS (5 kr, Metas dom, aldrig ABO): kampanjen är pausad och produkten saknar produktmapp och DNA, så ingen ny annons namnges.

## Medicinasken i Fickformat (120250053730340291)

