# Lärdomar — Täljsetet 30 Delar

En per etiketterad annons (docs/os/CS-KLART.md punkt 1–5). Skrivs normalt av `node agent/lardom.mjs --skriv`; varje brief pekar på ett id här (`lardom=L-…`). **De första blocken nedan är preliminära** (skrivna för hand 2026-09-27 på Axels beslut att bygga förstabatchen före dag 7-etiketten) och ersätts av dag 7-lärdomarna 2026-10-01.

### Lärdom L-120250349207730291 — Taljset_PD_3 (PRELIMINÄR, ingen etikett än — dag 4 av 7, skriven 2026-09-27 på Axels beslut "NU")

**Etikett 2026-10-01: KPI_WINNER, bedömbar** (första veckan 24–30/9, 7d_click: 4 597 kr = 26 % av kampanjens 17 562 kr, 18 köp, ROAS 3,40 mot kampanjens 2,98, CPA 255 kr mot break-even-CPA 613 kr, vinstbidrag (613 − 255) × 18 = 6 444 kr, konverteringsgrad 1,9 % (18 köp / 925 LPV), hook rate 43,7 %, hold rate 15,7 %). Inte BREAKTHROUGH, för PD_1 tog budgethöjningen (58 % av spenden); PD_3 säljer lika bra per klick (1,9 mot 1,7 %) — konverteringsskillnaden från dag 2 (3,0 mot 1,3 %) var brus. Det preliminära blocket nedan står kvar som det skrevs; id och nästa-raderna är oförändrade.

> ⚠️ **Preliminär lärdom.** Annonsen har ingen etikett (dag 7 = 2026-10-01). Axel beslutade 2026-09-27 att förstabatchen skrivs nu ("1. NU"), och CS-KLART punkt 6 kräver att varje brief pekar på en lärdom. Det här blocket är därför skrivet för hand ur Metas livstidsdata (`agent/hamta-annonser`-uttag 2026-09-27 07:30 UTC, 7d_click), inte av `lardom.mjs --skriv`, och **ersätts av dag 7-lärdomen 2026-10-01** (samma id). Inget här är en dom — allt är hypotes.

| Fält | Värde |
|---|---|
| Batch | 0 (produkttestet, launch 2026-09-24) |
| Utfall | PRELIMINÄR — högst vinstbidrag dygn 1–2, förälder för förstabatchen; över grinden 300 kr / 3 köp men etikett saknas |
| Fönster | 2026-09-24 – 2026-09-27 07:30 UTC (dag 1–4, 7d_click) |
| Spend annons / kampanj | 1,781 kr / 3,857 kr (46 %) |
| Köp | 8 |
| ROAS / CPA | 3.90 / 223 kr — kampanjens ROAS 4.34; break-even-CPA 612 kr (AOV ÷ 1,52) |
| Konverteringsgrad | 1.8 % (8 köp / 434 LPV) — 3,0 % dygn 1–2 |
| Hook rate / hold rate | ej läsbar (Meta ger starter, inte 3-sekundersvisningar) / 18 % (thruplay ÷ visningar) |
| Bedömbar | ja på volym, nej på etikett |

**Koncept:** PD produktdemonstration · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringen 2026-09-24 (briefen ligger i Product test center i Notion, inte i repot)

**Hookar (ordagrant):**
- Primärtext, rad 1 (live 2026-09-27): "Alltid velat prova tälja, men inte vetat vilka verktyg du behöver? 🪵" · rubrik: "Börja tälja redan i helgen"
- Första frame (thumbnail, läst 2026-09-26): en hand håller upp ett litet järn med trähandtag över en grön skärmatta, en större kniv med kopparholk ligger under — verktyget i handen, inget paket
- VO/inbränd text i videon: okänd — manuset finns inte i repot och videon är inte transkriberad (ingen ffmpeg i containern)

**Planerat mot utfört** (lanseringsbriefen finns inte i repot — bara den live annonsen går att läsa):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | okänd (PTC-raden) | läst ur copyn: nybörjaren som "alltid velat prova" resp. den som köper till golfaren | okänd |
| Vinkel | PD | PD enligt namnkoden och copyn | ja |
| Medvetandenivå | okänd | problem-medveten (copyn öppnar på längtan/konflikten) | okänd |
| Mekanism | okänd | ur copyn: innehållslistan ("allt i ett" / "24 luckor med …") | okänd |
| Tro | okänd | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | okänd | produkt, inte pris | okänd |
| Brådska | okänd | ingen i copyn | okänd |

**Utförandet föll:** okänd

**Hypotes (gissning):** Samma primärtext som PD_1 och PD_2; videon är variabeln. PD_3:s första bild är verktyget i handen (thumbnail) och den konverterade 3,0 % av LPV de två första dygnen mot PD_1:s 1,3 % — dag fyra är båda på 1,8 %, så skillnaden kan vara brus. Hypotes: verktyget i arbete säljer, paketet lockar klick. Prövas av PD_1_H4 (snittet först) mot PD_1:s unboxing.

**Nästa (namngivna platser — förstabatchen, Axels beslut 2026-09-27):**
- `Taljset_PD_1_H4` (typ I, iteration 1 på PD_3): ny hook — första snittet i övningsbiten, handsken på; resten som föräldern
- `Taljset_PD_1_H5` (typ I, iteration 2): längre problemdel — kökslådan (sidans 'letar efter rätt kniv i lådan') före väskan
- `Taljset_PD_1_H6` (typ I, iteration 3): in media res — den snittade övningsbiten först
- `Taljset_SO_1_H1`, `Taljset_OB_1_H1`, `Taljset_GT_4_H1`, `Taljset_PD_4_H1`, `Taljset_PD_5_H1`, `Taljset_SP_4_H1` (typ N, kalla=backlog): sex nya videokoncept ur backlog.md — gissningar tills egen etikett
- `Taljset_PD_4_1`, `Taljset_SO_1_1`, `Taljset_LI_1_1`, `Taljset_CS_4_1`, `Taljset_OB_1_1`, `Taljset_GT_4_1` (typ N, statiska): demo, jämförelse, listicle, pris utan brådska, risk, present — jobbet är att validera formatet
- `Taljset_BOF_1_1`, `Taljset_BOF_2_1`, `Taljset_OB_2_1`: pris, ångerrätt, nybörjarinvändningen — bara retargeting
- Ingen review-bild: sidans 8 recensioner är importrader (dna.md)

### Lärdom L-120250349195630291 — Taljset_PD_1 (PRELIMINÄR, ingen etikett än — dag 4 av 7, skriven 2026-09-27 på Axels beslut "NU")

**Etikett 2026-10-01: BREAKTHROUGH bekräftad** (första veckan 24–30/9, 7d_click: 10 251 kr = 58 % av kampanjens 17 562 kr, 31 köp, ROAS 2,82 mot kampanjens 2,98, CPA 331 kr mot break-even-CPA 613 kr (AOV 932 kr ÷ 1,52), konverteringsgrad 1,7 % (31 köp / 1 859 LPV), hook rate 40,9 %, hold rate 15,9 %, budget dag 0 → dag 7: 1 000 → 4 000 kr/dag — ronden ×2 26/9 och ×2 27/9). Det preliminära blocket nedan står kvar som det skrevs; id och nästa-raderna är oförändrade. Komponentkartan: `dna.md` → "Komponentkarta Taljset_PD_1". LARDOM-raden 2026-09-27 är märkt `preliminar: true` — `lardom.mjs --skriv` vägrar en andra lärdom på samma id, så dag 7-datan står här i stället.

> ⚠️ **Preliminär lärdom.** Annonsen har ingen etikett (dag 7 = 2026-10-01). Axel beslutade 2026-09-27 att förstabatchen skrivs nu ("1. NU"), och CS-KLART punkt 6 kräver att varje brief pekar på en lärdom. Det här blocket är därför skrivet för hand ur Metas livstidsdata (`agent/hamta-annonser`-uttag 2026-09-27 07:30 UTC, 7d_click), inte av `lardom.mjs --skriv`, och **ersätts av dag 7-lärdomen 2026-10-01** (samma id). Inget här är en dom — allt är hypotes.

| Fält | Värde |
|---|---|
| Batch | 0 (produkttestet, launch 2026-09-24) |
| Utfall | PRELIMINÄR — top spender = benchmark; över grinden 300 kr / 3 köp men etikett saknas |
| Fönster | 2026-09-24 – 2026-09-27 07:30 UTC (dag 1–4, 7d_click) |
| Spend annons / kampanj | 1,850 kr / 3,857 kr (48 %) |
| Köp | 8 |
| ROAS / CPA | 4.35 / 231 kr — kampanjens ROAS 4.34; break-even-CPA 612 kr (AOV ÷ 1,52) |
| Konverteringsgrad | 1.8 % (8 köp / 440 LPV) — 1,3 % dygn 1–2 |
| Hook rate / hold rate | ej läsbar (Meta ger starter, inte 3-sekundersvisningar) / 17 % (thruplay ÷ visningar) |
| Bedömbar | ja på volym, nej på etikett |

**Koncept:** PD produktdemonstration · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringen 2026-09-24 (briefen ligger i Product test center i Notion, inte i repot)

**Hookar (ordagrant):**
- Primärtext, rad 1 (live 2026-09-27): "Alltid velat prova tälja, men inte vetat vilka verktyg du behöver? 🪵" · rubrik: "Börja tälja redan i helgen"
- Första frame (thumbnail, läst 2026-09-26): två händer öppnar en kraftpappskartong, den svarta väskan med orange kantsöm skymtar under, verkstadsbord med träverktyg i bakgrunden — unboxing
- VO/inbränd text i videon: okänd — manuset finns inte i repot och videon är inte transkriberad (ingen ffmpeg i containern)

**Planerat mot utfört** (lanseringsbriefen finns inte i repot — bara den live annonsen går att läsa):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | okänd (PTC-raden) | läst ur copyn: nybörjaren som "alltid velat prova" resp. den som köper till golfaren | okänd |
| Vinkel | PD | PD enligt namnkoden och copyn | ja |
| Medvetandenivå | okänd | problem-medveten (copyn öppnar på längtan/konflikten) | okänd |
| Mekanism | okänd | ur copyn: innehållslistan ("allt i ett" / "24 luckor med …") | okänd |
| Tro | okänd | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | okänd | produkt, inte pris | okänd |
| Brådska | okänd | ingen i copyn | okänd |

**Utförandet föll:** okänd

**Hypotes (gissning):** Top spender med unboxingen som första bild. Lika många köp som PD_3 på dag fyra (8/8) men lägre vinstbidrag första två dygnen. Hypotes: kartongen som öppnas vinner auktionen (klick), verktyget i handen (PD_3) vinner köpet. Ingen dom förrän etiketten.

**Nästa (namngivna platser — förstabatchen, Axels beslut 2026-09-27):**
- Ingen egen plats — PD_1 är benchmark (top spender). Iterationerna byggs på PD_3 (högst vinstbidrag första två dygnen, verktyget i handen som första bild). Dag 7-etiketten avgör om PD_1 tar över som förälder.
### Lärdom L-120250349211060291 — Taljset_SP_1 (KPI_WINNER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 436 kr / 17 562 kr (2 %) |
| Köp | 2 |
| ROAS / CPA | 3,99 / 218 kr — kampanjens ROAS 2,98 |
| Konverteringsgrad | 4,7 % (2 köp / 43 LPV) |
| Hook rate / hold rate | 26 % / 10 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "⭐⭐⭐⭐⭐ \"Bra set med många verktyg. Knivarna känns bra i handen.\"" (importraden Anders Nilsson ur REVIEW-arket — dna.md, får inte ärvas) · rubrik: "Din nya favorithobby väntar"
- VO: okänd (videon inte transkriberad; ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | stug-/altanmänniskan som vill ha en lugn syssla ("hemma, stugan eller altanen") och litar på andras omdöme | okänd |
| Vinkel | — (brief saknas i repot) | SP: femstjärnigt citat → "fler och fler upptäcker" → tre punkter → "Se varför de fastnade" | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösnings-medveten: hobbyn och setet, inget problem byggs | okänd |
| Mekanism | — (brief saknas i repot) | "Sex knivar och sex järn i samma set" + "allt du behöver för att komma igång" | okänd |
| Tro | — (brief saknas i repot) | social proof via ett importcitat (ej verifierad kund) + "fler och fler" (obelagt) | okänd |
| Positionering | — (brief saknas i repot) | "din nya favorithobby" — avkoppling, inte pris | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: 2 köp på 43 LPV (4,7 %) och CPA 218 kr mot break-even-CPA 613 kr ser bra ut men vilar på två köp; hook 26 % / hold 10 % ligger klart under PD_1:s 41 % / 16 %, så öppningen (ett citat) är det som gör att Meta ger den 2 % — och citatet är en importrad.

**Nästa annonser:**
- `SLÄPP` tills vidare — KPI_WINNER under grinden (436 kr, 2 köp): läs om dag 14 (--uppgradering); ingen iteration namnges på två köp. SP-vinkeln utan citat testas redan av `Taljset_SP_4_H1` i hubben (batch #1), och ingen ny SP får ärva importcitatet.

### Lärdom L-120250349204930291 — Taljset_PD_2 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 277 kr / 17 562 kr (2 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,98 |
| Konverteringsgrad | 0,0 % (0 köp / 32 LPV) |
| Hook rate / hold rate | 27 % / 8 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "Alltid velat prova tälja, men inte vetat vilka verktyg du behöver? 🪵" · rubrik: "Börja tälja redan i helgen" — identisk med breakthroughen Taljset_PD_1 och PD_3, videon är enda skillnaden
- VO: okänd (videon inte transkriberad; ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | nybörjaren som "alltid velat prova tälja" — samma copy som PD_1 | okänd |
| Vinkel | — (brief saknas i repot) | PD: längtan + osäkerhet → "allt i ett" → 6 knivar, 6 järn, 30 delar → CTA, inget pris | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem-medveten: "inte vetat vilka verktyg du behöver" | okänd |
| Mekanism | — (brief saknas i repot) | innehållslistan: 6 knivar att forma och skära, 6 järn att gröpa ur, 30 delar "så du kan börja direkt" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts ("Perfekt för skedar, figurer och dekorationer" står inte på sidan — dna.md) | okänd |
| Positionering | — (brief saknas i repot) | produkt, inte pris | okänd |
| Brådska | — (brief saknas i repot) | ingen ("redan i helgen" är en tidsram, ingen deadline) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 277 kr, 32 LPV och 0 köp mot PD_1:s 1,7 % konverteringsgrad (väntat värde ~0,5 köp på 32 LPV) är brus, inte ett tecken på att den här klippningen säljer sämre; hook 27 % mot PD_1:s 41 % säger däremot att öppningen stoppar färre, och det är därför Meta ger den 2 %.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden (277 kr, 0 köp, 32 LPV): en observation, ingen dom. Breakthroughen Taljset_PD_1 (58 %) och KPI-vinnaren Taljset_PD_3 (26 %) tog 84 % av kampanjens spend första veckan, och vidarebyggena ligger redan i hubben (PD_1_H4/H5/H6); tredje videon på samma manus tillför ingen variabel utöver H4–H6. Ingen ny iteration ur brus.

### Lärdom L-120250349208380291 — Taljset_PD_2_1 (KPI_WINNER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 200 kr / 17 562 kr (1 %) |
| Köp | 2 |
| ROAS / CPA | 8,70 / 100 kr — kampanjens ROAS 2,98 |
| Konverteringsgrad | 15,4 % (2 köp / 13 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "Alltid velat prova tälja, men inte vetat vilka verktyg du behöver? 🪵" · rubrik: "Börja tälja redan i helgen" — identisk med breakthroughen Taljset_PD_1 och PD_3, bilden är enda skillnaden
- VO: ingen VO (bild); bildens text ej avläst (Drive `PD_2_1.png`, inte visuellt granskad)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | nybörjaren som "alltid velat prova tälja" — samma copy som PD_1 | okänd |
| Vinkel | — (brief saknas i repot) | PD: längtan + osäkerhet → "allt i ett" → 6 knivar, 6 järn, 30 delar → CTA, inget pris | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem-medveten: "inte vetat vilka verktyg du behöver" | okänd |
| Mekanism | — (brief saknas i repot) | innehållslistan: 6 knivar att forma och skära, 6 järn att gröpa ur, 30 delar "så du kan börja direkt" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts ("Perfekt för skedar, figurer och dekorationer" står inte på sidan — dna.md) | okänd |
| Positionering | — (brief saknas i repot) | produkt, inte pris | okänd |
| Brådska | — (brief saknas i repot) | ingen ("redan i helgen" är en tidsram, ingen deadline) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: 2 köp på 13 LPV (15,4 %, ROAS 8,70) på 200 kr — PD-texten som stillbild konverterar den som klickar, men två köp är ingen dom och Meta ger bilden 1 % bredvid videorna; om det håller på dag 14 är formatet värt en egen statisk serie.

**Nästa annonser:**
- `SLÄPP` tills vidare — KPI_WINNER under grinden (200 kr, 2 köp): läs om dag 14 (--uppgradering); PD som statisk bild valideras redan av `Taljset_PD_4_1` (30 delar utlagda, batch #1, hubben) — ingen andra stillbild på samma text förrän den fått etikett.

### Lärdom L-120250349214770291 — Taljset_SP_3 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 76 kr / 17 562 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,98 |
| Konverteringsgrad | 0,0 % (0 köp / 9 LPV) |
| Hook rate / hold rate | 43 % / 14 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "⭐⭐⭐⭐⭐ \"Bra set med många verktyg. Knivarna känns bra i handen.\"" (importraden Anders Nilsson ur REVIEW-arket — dna.md, får inte ärvas) · rubrik: "Din nya favorithobby väntar"
- VO: okänd (videon inte transkriberad; ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | stug-/altanmänniskan som vill ha en lugn syssla ("hemma, stugan eller altanen") och litar på andras omdöme | okänd |
| Vinkel | — (brief saknas i repot) | SP: femstjärnigt citat → "fler och fler upptäcker" → tre punkter → "Se varför de fastnade" | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösnings-medveten: hobbyn och setet, inget problem byggs | okänd |
| Mekanism | — (brief saknas i repot) | "Sex knivar och sex järn i samma set" + "allt du behöver för att komma igång" | okänd |
| Tro | — (brief saknas i repot) | social proof via ett importcitat (ej verifierad kund) + "fler och fler" (obelagt) | okänd |
| Positionering | — (brief saknas i repot) | "din nya favorithobby" — avkoppling, inte pris | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 76 kr, 9 LPV, 0 köp — hook 43 % / hold 14 % är i nivå med PD_1 men mätt på ett par hundra visningar; Meta gav klippet ingen chans bredvid PD_1/PD_3, och utfallet är fördelning, inte vinkel.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden (76 kr, 0 köp, 9 LPV): en observation, ingen dom. Breakthroughen Taljset_PD_1 (58 %) och KPI-vinnaren Taljset_PD_3 (26 %) tog 84 % av kampanjens spend första veckan, och vidarebyggena ligger redan i hubben (PD_1_H4/H5/H6); SP utan importcitatet lever i `Taljset_SP_4_H1`. Ingen ny iteration ur brus.

### Lärdom L-120250349175110291 — Taljset_CS_2 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 11 kr / 17 562 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,98 |
| Konverteringsgrad | 0,0 % (0 köp / 2 klick) |
| Hook rate / hold rate | 71 % / 23 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "🚨 REA på Täljset 30 Delar!" · rubrik: "Börja tälja redan i helgen" (samma rubrik som PD) · sista rad: "Handla nu innan priset går upp igen." (påhittad brådska — dna.md, får inte ärvas)
- VO: okänd (videon inte transkriberad; ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | prisjägaren som redan vet vad ett täljset är | okänd |
| Vinkel | — (brief saknas i repot) | CS: prisankare 1 139 → 869 kr, "spara 270 kronor, cirka 24 %" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt-medveten: rabatt på en namngiven produkt | okänd |
| Mekanism | — (brief saknas i repot) | ingen — "30 delar. 6 knivar. 6 järn. Allt du behöver för att börja tälja." | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts | okänd |
| Positionering | — (brief saknas i repot) | pris (rabatten är hela argumentet) | okänd |
| Brådska | — (brief saknas i repot) | påhittad: "innan priset går upp igen" — rean har legat sedan launch | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 11 kr och 2 klick — hook 71 % / hold 23 % är mätt på ett par dussin visningar och säger inget; prisvinkeln svalt i CBO:n och bär dessutom påhittad brådska som inte får följa med.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden (11 kr, 0 köp): en observation, ingen dom. Breakthroughen Taljset_PD_1 (58 %) och KPI-vinnaren Taljset_PD_3 (26 %) tog 84 % av kampanjens spend första veckan, och vidarebyggena ligger redan i hubben (PD_1_H4/H5/H6); prisvinkeln utan brådska testas av `Taljset_CS_4_1` (batch #1, hubben). Ingen ny iteration ur brus.

### Lärdom L-120250349176920291 — Taljset_CS_3 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 6 kr / 17 562 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 71 % / 14 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "🚨 REA på Täljset 30 Delar!" · rubrik: "Börja tälja redan i helgen" (samma rubrik som PD) · sista rad: "Handla nu innan priset går upp igen." (påhittad brådska — dna.md, får inte ärvas)
- VO: okänd (videon inte transkriberad; ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | prisjägaren som redan vet vad ett täljset är | okänd |
| Vinkel | — (brief saknas i repot) | CS: prisankare 1 139 → 869 kr, "spara 270 kronor, cirka 24 %" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt-medveten: rabatt på en namngiven produkt | okänd |
| Mekanism | — (brief saknas i repot) | ingen — "30 delar. 6 knivar. 6 järn. Allt du behöver för att börja tälja." | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts | okänd |
| Positionering | — (brief saknas i repot) | pris (rabatten är hela argumentet) | okänd |
| Brådska | — (brief saknas i repot) | påhittad: "innan priset går upp igen" — rean har legat sedan launch | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: INGEN_LEVERANS (6 kr) — Metas dom i CBO:n; hook 71 % på en handfull visningar är brus.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS under grinden (6 kr, 0 köp): en observation, ingen dom. Breakthroughen Taljset_PD_1 (58 %) och KPI-vinnaren Taljset_PD_3 (26 %) tog 84 % av kampanjens spend första veckan, och vidarebyggena ligger redan i hubben (PD_1_H4/H5/H6); Metas dom, aldrig ABO; pris utan brådska är `Taljset_CS_4_1`. Ingen ny iteration ur brus.

### Lärdom L-120250349213070291 — Taljset_SP_2 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 4 kr / 17 562 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 13 % / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "⭐⭐⭐⭐⭐ \"Bra set med många verktyg. Knivarna känns bra i handen.\"" (importraden Anders Nilsson ur REVIEW-arket — dna.md, får inte ärvas) · rubrik: "Din nya favorithobby väntar"
- VO: okänd (videon inte transkriberad; ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | stug-/altanmänniskan som vill ha en lugn syssla ("hemma, stugan eller altanen") och litar på andras omdöme | okänd |
| Vinkel | — (brief saknas i repot) | SP: femstjärnigt citat → "fler och fler upptäcker" → tre punkter → "Se varför de fastnade" | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösnings-medveten: hobbyn och setet, inget problem byggs | okänd |
| Mekanism | — (brief saknas i repot) | "Sex knivar och sex järn i samma set" + "allt du behöver för att komma igång" | okänd |
| Tro | — (brief saknas i repot) | social proof via ett importcitat (ej verifierad kund) + "fler och fler" (obelagt) | okänd |
| Positionering | — (brief saknas i repot) | "din nya favorithobby" — avkoppling, inte pris | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: INGEN_LEVERANS (4 kr, hook 13 %) — Meta avvisade öppningen direkt; ett klipp som börjar på ett citat ger ingen scrollstoppare, och citatet är en importrad.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS under grinden (4 kr, 0 köp): en observation, ingen dom. Breakthroughen Taljset_PD_1 (58 %) och KPI-vinnaren Taljset_PD_3 (26 %) tog 84 % av kampanjens spend första veckan, och vidarebyggena ligger redan i hubben (PD_1_H4/H5/H6); Metas dom, aldrig ABO; SP utan citat lever i `Taljset_SP_4_H1`. Ingen ny iteration ur brus.

### Lärdom L-120250349174060291 — Taljset_CS_1 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 3 kr / 17 562 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 56 % / 22 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "🚨 REA på Täljset 30 Delar!" · rubrik: "Börja tälja redan i helgen" (samma rubrik som PD) · sista rad: "Handla nu innan priset går upp igen." (påhittad brådska — dna.md, får inte ärvas)
- VO: okänd (videon inte transkriberad; ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | prisjägaren som redan vet vad ett täljset är | okänd |
| Vinkel | — (brief saknas i repot) | CS: prisankare 1 139 → 869 kr, "spara 270 kronor, cirka 24 %" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt-medveten: rabatt på en namngiven produkt | okänd |
| Mekanism | — (brief saknas i repot) | ingen — "30 delar. 6 knivar. 6 järn. Allt du behöver för att börja tälja." | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts | okänd |
| Positionering | — (brief saknas i repot) | pris (rabatten är hela argumentet) | okänd |
| Brådska | — (brief saknas i repot) | påhittad: "innan priset går upp igen" — rean har legat sedan launch | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: INGEN_LEVERANS (3 kr) — Metas dom; hook 56 % / hold 22 % på ett par dussin visningar är brus.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS under grinden (3 kr, 0 köp): en observation, ingen dom. Breakthroughen Taljset_PD_1 (58 %) och KPI-vinnaren Taljset_PD_3 (26 %) tog 84 % av kampanjens spend första veckan, och vidarebyggena ligger redan i hubben (PD_1_H4/H5/H6); Metas dom, aldrig ABO; pris utan brådska är `Taljset_CS_4_1`. Ingen ny iteration ur brus.

### Lärdom L-120250349186070291 — Taljset_G_2 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 3 kr / 17 562 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 25 % / 17 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "Vad ger man mannen som redan har allt? 🎁" · rubrik: "Presenten han faktiskt använder" · rad 3: "presenten som blir en hobby, inte en grej som hamnar i en låda"
- VO: okänd (videon inte transkriberad; ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | presentköparen till pappa, sambon eller farfar ("Bli den som hittade den perfekta presenten") | okänd |
| Vinkel | — (brief saknas i repot) | G (= GT present): presentfrågan → uppackningsögonblicket → "blir en hobby, inte en grej i en låda" | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem-medveten: "mannen som redan har allt" | okänd |
| Mekanism | — (brief saknas i repot) | "Sex knivar och sex järn" + "något han får skapa med sina egna händer" | okänd |
| Tro | — (brief saknas i repot) | "han har redan allt" medges och vänds (presenten blir en hobby) | okänd |
| Positionering | — (brief saknas i repot) | present, inte pris | okänd |
| Brådska | — (brief saknas i repot) | ingen (ingen jul- eller fars dag-ram i copyn) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: INGEN_LEVERANS (3 kr, hook 25 %) — presentvinkeln svalt i CBO:n; G-copyns rad "presenten som blir en hobby" är stark och lever i GT_4_H1/GT_4_1, så utfallet är fördelning, inte vinkel.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS under grinden (3 kr, 0 köp): en observation, ingen dom. Breakthroughen Taljset_PD_1 (58 %) och KPI-vinnaren Taljset_PD_3 (26 %) tog 84 % av kampanjens spend första veckan, och vidarebyggena ligger redan i hubben (PD_1_H4/H5/H6); Metas dom, aldrig ABO; presentvinkeln (GT) testas av `Taljset_GT_4_H1` och `Taljset_GT_4_1`; G räknas som samma vinkel. Ingen ny iteration ur brus.

### Lärdom L-120250349177800291 — Taljset_CS_2_1 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 3 kr / 17 562 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "🚨 REA på Täljset 30 Delar!" · rubrik: "Börja tälja redan i helgen" (samma rubrik som PD) · sista rad: "Handla nu innan priset går upp igen." (påhittad brådska — dna.md, får inte ärvas)
- VO: ingen VO (bild); bildens text ej avläst (Drive `CS_2_1.png`, inte visuellt granskad)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | prisjägaren som redan vet vad ett täljset är | okänd |
| Vinkel | — (brief saknas i repot) | CS: prisankare 1 139 → 869 kr, "spara 270 kronor, cirka 24 %" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt-medveten: rabatt på en namngiven produkt | okänd |
| Mekanism | — (brief saknas i repot) | ingen — "30 delar. 6 knivar. 6 järn. Allt du behöver för att börja tälja." | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts | okänd |
| Positionering | — (brief saknas i repot) | pris (rabatten är hela argumentet) | okänd |
| Brådska | — (brief saknas i repot) | påhittad: "innan priset går upp igen" — rean har legat sedan launch | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: INGEN_LEVERANS (3 kr) — en prisbild utan problem och med påhittad brådska fick ingen leverans bredvid PD-videorna; bilden är inte avläst.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS under grinden (3 kr, 0 köp): en observation, ingen dom. Breakthroughen Taljset_PD_1 (58 %) och KPI-vinnaren Taljset_PD_3 (26 %) tog 84 % av kampanjens spend första veckan, och vidarebyggena ligger redan i hubben (PD_1_H4/H5/H6); Metas dom, aldrig ABO; pris utan brådska som bild är `Taljset_CS_4_1`. Ingen ny iteration ur brus.

### Lärdom L-120250349181920291 — Taljset_G_1 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 17 562 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "Vad ger man mannen som redan har allt? 🎁" · rubrik: "Presenten han faktiskt använder" · rad 3: "presenten som blir en hobby, inte en grej som hamnar i en låda"
- VO: okänd (videon inte transkriberad; ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | presentköparen till pappa, sambon eller farfar ("Bli den som hittade den perfekta presenten") | okänd |
| Vinkel | — (brief saknas i repot) | G (= GT present): presentfrågan → uppackningsögonblicket → "blir en hobby, inte en grej i en låda" | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem-medveten: "mannen som redan har allt" | okänd |
| Mekanism | — (brief saknas i repot) | "Sex knivar och sex järn" + "något han får skapa med sina egna händer" | okänd |
| Tro | — (brief saknas i repot) | "han har redan allt" medges och vänds (presenten blir en hobby) | okänd |
| Positionering | — (brief saknas i repot) | present, inte pris | okänd |
| Brådska | — (brief saknas i repot) | ingen (ingen jul- eller fars dag-ram i copyn) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: INGEN_LEVERANS (0 kr) — aldrig levererad; inget i klippet har lästs av publiken, så utfallet säger bara att Meta valde PD-videorna första dygnet.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS under grinden (0 kr, 0 köp): en observation, ingen dom. Breakthroughen Taljset_PD_1 (58 %) och KPI-vinnaren Taljset_PD_3 (26 %) tog 84 % av kampanjens spend första veckan, och vidarebyggena ligger redan i hubben (PD_1_H4/H5/H6); Metas dom, aldrig ABO; GT lever i `Taljset_GT_4_H1`. Ingen ny iteration ur brus.

### Lärdom L-120250349214880291 — Taljset_SP_2_1 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 17 562 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "⭐⭐⭐⭐⭐ \"Bra set med många verktyg. Knivarna känns bra i handen.\"" (importraden Anders Nilsson ur REVIEW-arket — dna.md, får inte ärvas) · rubrik: "Din nya favorithobby väntar"
- VO: ingen VO (bild); bildens text ej avläst (Drive `SP_2_1.png`, inte visuellt granskad)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | stug-/altanmänniskan som vill ha en lugn syssla ("hemma, stugan eller altanen") och litar på andras omdöme | okänd |
| Vinkel | — (brief saknas i repot) | SP: femstjärnigt citat → "fler och fler upptäcker" → tre punkter → "Se varför de fastnade" | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösnings-medveten: hobbyn och setet, inget problem byggs | okänd |
| Mekanism | — (brief saknas i repot) | "Sex knivar och sex järn i samma set" + "allt du behöver för att komma igång" | okänd |
| Tro | — (brief saknas i repot) | social proof via ett importcitat (ej verifierad kund) + "fler och fler" (obelagt) | okänd |
| Positionering | — (brief saknas i repot) | "din nya favorithobby" — avkoppling, inte pris | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: INGEN_LEVERANS (0 kr) — aldrig levererad; en stillbild med ett importcitat som enda argument har inget Meta kan leverera på.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS under grinden (0 kr, 0 köp): en observation, ingen dom. Breakthroughen Taljset_PD_1 (58 %) och KPI-vinnaren Taljset_PD_3 (26 %) tog 84 % av kampanjens spend första veckan, och vidarebyggena ligger redan i hubben (PD_1_H4/H5/H6); Metas dom, aldrig ABO; ingen SP-bild förrän riktiga recensioner finns. Ingen ny iteration ur brus.

### Lärdom L-120250349188540291 — Taljset_G_3 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 17 562 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "Vad ger man mannen som redan har allt? 🎁" · rubrik: "Presenten han faktiskt använder" · rad 3: "presenten som blir en hobby, inte en grej som hamnar i en låda"
- VO: okänd (videon inte transkriberad; ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | presentköparen till pappa, sambon eller farfar ("Bli den som hittade den perfekta presenten") | okänd |
| Vinkel | — (brief saknas i repot) | G (= GT present): presentfrågan → uppackningsögonblicket → "blir en hobby, inte en grej i en låda" | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem-medveten: "mannen som redan har allt" | okänd |
| Mekanism | — (brief saknas i repot) | "Sex knivar och sex järn" + "något han får skapa med sina egna händer" | okänd |
| Tro | — (brief saknas i repot) | "han har redan allt" medges och vänds (presenten blir en hobby) | okänd |
| Positionering | — (brief saknas i repot) | present, inte pris | okänd |
| Brådska | — (brief saknas i repot) | ingen (ingen jul- eller fars dag-ram i copyn) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: INGEN_LEVERANS (0 kr) — aldrig levererad (0 kr redan 2026-09-26); utfallet är Metas val, inte publikens.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS under grinden (0 kr, 0 köp): en observation, ingen dom. Breakthroughen Taljset_PD_1 (58 %) och KPI-vinnaren Taljset_PD_3 (26 %) tog 84 % av kampanjens spend första veckan, och vidarebyggena ligger redan i hubben (PD_1_H4/H5/H6); Metas dom, aldrig ABO; GT lever i `Taljset_GT_4_H1`. Ingen ny iteration ur brus.

### Lärdom L-120250349191360291 — Taljset_G_2_1 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 17 562 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "Vad ger man mannen som redan har allt? 🎁" · rubrik: "Presenten han faktiskt använder" · rad 3: "presenten som blir en hobby, inte en grej som hamnar i en låda"
- VO: ingen VO (bild); bildens text ej avläst (Drive `G_2_1.png`, inte visuellt granskad)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | presentköparen till pappa, sambon eller farfar ("Bli den som hittade den perfekta presenten") | okänd |
| Vinkel | — (brief saknas i repot) | G (= GT present): presentfrågan → uppackningsögonblicket → "blir en hobby, inte en grej i en låda" | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem-medveten: "mannen som redan har allt" | okänd |
| Mekanism | — (brief saknas i repot) | "Sex knivar och sex järn" + "något han får skapa med sina egna händer" | okänd |
| Tro | — (brief saknas i repot) | "han har redan allt" medges och vänds (presenten blir en hobby) | okänd |
| Positionering | — (brief saknas i repot) | present, inte pris | okänd |
| Brådska | — (brief saknas i repot) | ingen (ingen jul- eller fars dag-ram i copyn) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: INGEN_LEVERANS (0 kr) — aldrig levererad (0 kr redan 2026-09-26); bilden är inte avläst och inget går att säga om den.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS under grinden (0 kr, 0 köp): en observation, ingen dom. Breakthroughen Taljset_PD_1 (58 %) och KPI-vinnaren Taljset_PD_3 (26 %) tog 84 % av kampanjens spend första veckan, och vidarebyggena ligger redan i hubben (PD_1_H4/H5/H6); Metas dom, aldrig ABO; presentvinkeln som bild är `Taljset_GT_4_1`. Ingen ny iteration ur brus.

