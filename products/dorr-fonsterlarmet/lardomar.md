# Lärdomar — Dörr- och Fönsterlarmet 110 dB

En per etiketterad annons (docs/os/CS-KLART.md punkt 1–5). Skrivs av `node agent/lardom.mjs --skriv`; varje brief pekar på ett id här (`lardom=L-…`).

### Lärdom L-120250349243860291 — Dorrlarm_PD_1 (SPEND_WINNER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | SPEND_WINNER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 524 kr / 2 283 kr (67 %) |
| Köp | 3 |
| ROAS / CPA | 1,50 / 508 kr — kampanjens ROAS 1,20 |
| Konverteringsgrad | 2,8 % (3 köp / 108 LPV) |
| Hook rate / hold rate | 36 % / 10 % |
| Bedömbar | ja |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Hör direkt när dörren öppnas" · primärtext rad 1: "Vet du alltid när nån öppnar dörren hemma? 🚪"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | husägaren som inte hör när altandörren eller källarfönstret öppnas | okänd |
| Vinkel | — (brief saknas i repot) | PD enligt namnkoden — frågan om dörren, sedan larmet | okänd |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten in, produktmedveten ut (tre funktionsrader) | okänd |
| Mekanism | — (brief saknas i repot) | 110 dB hörs i hela huset, fjärrkontroll på/av utan att gå dit, ingen app, inget abonnemang, ingen elektriker | okänd |
| Tro | — (brief saknas i repot) | "Sätt upp på 5 minuter. Sov lugnare i natt." | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | "Sov lugnare i natt" (mild) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Spend winner: läs FÖRST kommentarerna på annonsen (node tools/annonskommentarer.mjs --annons <id>) — vad invänder publiken mot? Sedan konverteringsgraden, sedan manuset. Saknas tro, brådska, insats eller funnel-kongruens? Lägg bara till den delen, bygg inte om hela annonsen.

**Hypotes (gissning):** Gissning: kommentarerna gav inget (0 leads, "inga kundröster"), konverteringsgraden 2,8 % (3 köp / 108 LPV) ligger i nivå med kampanjens andra PD-rader, och ROAS 1,50 ligger 0,02 under break-even 1,52 — så det som saknas är troligen inte tro (110 dB, fjärrkontroll, ingen app står alla i copyn) utan hållningen: hook 36 % men hold 10 %, publiken tappar videon innan larmets funktion visas, och VO:n är inte transkriberad så manuset efter hooken går inte att döma.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Diagnos i spend winner-ordningen: (1) kommentarer: 0 leads på Dorrlarm (node agent/leads.mjs --prefix Dorrlarm) — inget att bemöta; (2) konverteringsgrad 2,8 % på 108 LPV, 3 köp, CPA 508 kr mot break-even-CPA ~295 kr (449 kr ÷ 1,52) — säljer, men för dyrt; (3) manuset: VO okänd, hold 10 % mot hook 36 %. Observation för en omstart: PD_1 bar 67 % av spenden och 3 av veckans 4 köp på ROAS 1,50 — den enda bedömbara annonsen i alla fyra testkampanjerna; en iteration som förlänger problemdelen (dörren som öppnas utan att någon hör) före funktionsraderna är den första att pröva, men bara om Axel slår på kampanjen igen.

### Lärdom L-120250349253770291 — Dorrlarm_SP_2 (KPI_WINNER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 222 kr / 2 283 kr (10 %) |
| Köp | 1 |
| ROAS / CPA | 2,03 / 222 kr — kampanjens ROAS 1,20 |
| Konverteringsgrad | 5,6 % (1 köp / 18 LPV) |
| Hook rate / hold rate | 38 % / 15 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Trygghet tusentals redan valt" · primärtext rad 1: ""Jag hör direkt om nån öppnar altandörren — även när jag sover på övervåningen." ⭐⭐⭐⭐⭐"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | villaägaren som sover på övervåningen och vill höra altandörren | okänd |
| Vinkel | — (brief saknas i repot) | SP enligt namnkoden — kundcitat med fem stjärnor | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten | okänd |
| Mekanism | — (brief saknas i repot) | enkelt att sätta upp själv, trådlös fjärrkontroll ingår | okänd |
| Tro | — (brief saknas i repot) | citatet + "hundratals svenska hem" i texten och "tusentals" i rubriken (obelagt och motsägande: lanserad 2026-09-24) | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad; "14 dagars öppet köp" | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: 1 köp på 18 sidvisningar (222 kr, ROAS 2,03, hook 38 %, hold 15 %) på citatet om altandörren — hållningen är högre än PD_1:s, men CBO:n valde PD_1; ett köp är ingen dom och citatet står inte på sidan.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Observation: SP_2 hade kampanjens bästa hold (15 %) och ROAS över break-even på ett köp — "tusentals"/"hundratals" i rubrik och text är obelagt och måste bort innan den någonsin visas igen.

### Lärdom L-120250349248630291 — Dorrlarm_PD_3 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 170 kr / 2 283 kr (7 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | 0,0 % (0 köp / 8 LPV) |
| Hook rate / hold rate | 32 % / 10 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Hör direkt när dörren öppnas" · primärtext rad 1: "Vet du alltid när nån öppnar dörren hemma? 🚪"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | husägaren som inte hör när altandörren eller källarfönstret öppnas | okänd |
| Vinkel | — (brief saknas i repot) | PD enligt namnkoden — frågan om dörren, sedan larmet | okänd |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten in, produktmedveten ut (tre funktionsrader) | okänd |
| Mekanism | — (brief saknas i repot) | 110 dB hörs i hela huset, fjärrkontroll på/av utan att gå dit, ingen app, inget abonnemang, ingen elektriker | okänd |
| Tro | — (brief saknas i repot) | "Sätt upp på 5 minuter. Sov lugnare i natt." | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | "Sov lugnare i natt" (mild) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: samma PD-copy som PD_1 men en annan video — 170 kr, 8 sidvisningar, 0 köp, hook 32 % / hold 10 %; Meta valde syskonet PD_1 med samma text.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Under 300 kr: observation, ingen dom — ingen iteration på en imiterad format-kopia utan research (CS-KLART punkt 12).

### Lärdom L-120250349234470291 — Dorrlarm_CS_2_1 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 99 kr / 2 283 kr (4 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | 0,0 % (0 köp / 4 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Skydda hemmet — snart öppnas dörren" · primärtext rad 1: "⏳ Bara i dag: -24% på vårt dörr- och fönsterlarm."
- VO: ingen VO (bild) — bildens egen text inte läst (ingen bild hämtad).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som redan vill ha ett larm och väntar på rätt pris | okänd |
| Vinkel | — (brief saknas i repot) | CS enligt namnkoden — rea, priset först (bild — samma copy som videosyskonen) | okänd |
| Medvetandenivå | — (brief saknas i repot) | mest medveten | okänd |
| Mekanism | — (brief saknas i repot) | ingen — bara "Trådlös fjärrkontroll ingår" | okänd |
| Tro | — (brief saknas i repot) | 449 kr i stället för 589 kr (stämmer med sidan 449 / 589) | okänd |
| Positionering | — (brief saknas i repot) | -24 %, 449 kr mot 589 kr, fri frakt över 300 kr, Klarna | okänd |
| Brådska | — (brief saknas i repot) | "Bara i dag", "lagret är begränsat och priset gäller inte länge till" (obelagt) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 99 kr, 4 sidvisningar och 0 köp på rea-copyn — för lite för en dom; hook okänd / hold okänd säger bara att Meta hittade ett syskon med samma text som den hellre visade.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Under 300 kr: observation, ingen dom — ingen iteration på en imiterad format-kopia utan research (CS-KLART punkt 12).

### Lärdom L-120250349236090291 — Dorrlarm_G_1 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 83 kr / 2 283 kr (4 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | 0,0 % (0 köp / 6 LPV) |
| Hook rate / hold rate | 45 % / 14 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Den present han faktiskt använder" · primärtext rad 1: "Jag visste inte vad jag skulle ge honom i år. Sen hittade jag det här. 🎁"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som ger present till "honom" (partner/pappa med garage) | okänd |
| Vinkel | — (brief saknas i repot) | G enligt namnkoden — presentvinkel berättad i jag-form | okänd |
| Medvetandenivå | — (brief saknas i repot) | presentletaren är omedveten om produkten; larmet nämns inte vid namn | okänd |
| Mekanism | — (brief saknas i repot) | ingen — "Satte upp det på garaget samma kväll" är det enda om produkten | okänd |
| Tro | — (brief saknas i repot) | "Han blev faktiskt rörd" / "jag vill att du ska känna dig trygg" | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | "i år" | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 83 kr, 6 sidvisningar och 0 köp på present-copyn — för lite för en dom; hook 45 % / hold 14 % säger bara att Meta hittade ett syskon med samma text som den hellre visade.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Under 300 kr: observation, ingen dom — ingen iteration på en imiterad format-kopia utan research (CS-KLART punkt 12).

### Lärdom L-120250349249120291 — Dorrlarm_PD_2_1 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 70 kr / 2 283 kr (3 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Hör direkt när dörren öppnas" · primärtext rad 1: "Vet du alltid när nån öppnar dörren hemma? 🚪"
- VO: ingen VO (bild) — bildens egen text inte läst (ingen bild hämtad).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | husägaren som inte hör när altandörren eller källarfönstret öppnas | okänd |
| Vinkel | — (brief saknas i repot) | PD enligt namnkoden — frågan om dörren, sedan larmet (bild — samma copy som videosyskonen) | okänd |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten in, produktmedveten ut (tre funktionsrader) | okänd |
| Mekanism | — (brief saknas i repot) | 110 dB hörs i hela huset, fjärrkontroll på/av utan att gå dit, ingen app, inget abonnemang, ingen elektriker | okänd |
| Tro | — (brief saknas i repot) | "Sätt upp på 5 minuter. Sov lugnare i natt." | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | "Sov lugnare i natt" (mild) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 70 kr, 3 sidvisningar och 0 köp på PD-copyn — för lite för en dom; hook okänd / hold okänd säger bara att Meta hittade ett syskon med samma text som den hellre visade.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Under 300 kr: observation, ingen dom — ingen iteration på en imiterad format-kopia utan research (CS-KLART punkt 12).

### Lärdom L-120250349238910291 — Dorrlarm_G_3 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 35 kr / 2 283 kr (2 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 35 % / 10 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Den present han faktiskt använder" · primärtext rad 1: "Jag visste inte vad jag skulle ge honom i år. Sen hittade jag det här. 🎁"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som ger present till "honom" (partner/pappa med garage) | okänd |
| Vinkel | — (brief saknas i repot) | G enligt namnkoden — presentvinkel berättad i jag-form | okänd |
| Medvetandenivå | — (brief saknas i repot) | presentletaren är omedveten om produkten; larmet nämns inte vid namn | okänd |
| Mekanism | — (brief saknas i repot) | ingen — "Satte upp det på garaget samma kväll" är det enda om produkten | okänd |
| Tro | — (brief saknas i repot) | "Han blev faktiskt rörd" / "jag vill att du ska känna dig trygg" | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | "i år" | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 35 kr, okänt antal sidvisningar och 0 köp på present-copyn — för lite för en dom; hook 35 % / hold 10 % säger bara att Meta hittade ett syskon med samma text som den hellre visade.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Under 300 kr: observation, ingen dom — ingen iteration på en imiterad format-kopia utan research (CS-KLART punkt 12).

### Lärdom L-120250349229050291 — Dorrlarm_CS_1 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 18 kr / 2 283 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | 47 % / 21 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Skydda hemmet — snart öppnas dörren" · primärtext rad 1: "⏳ Bara i dag: -24% på vårt dörr- och fönsterlarm."
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som redan vill ha ett larm och väntar på rätt pris | okänd |
| Vinkel | — (brief saknas i repot) | CS enligt namnkoden — rea, priset först | okänd |
| Medvetandenivå | — (brief saknas i repot) | mest medveten | okänd |
| Mekanism | — (brief saknas i repot) | ingen — bara "Trådlös fjärrkontroll ingår" | okänd |
| Tro | — (brief saknas i repot) | 449 kr i stället för 589 kr (stämmer med sidan 449 / 589) | okänd |
| Positionering | — (brief saknas i repot) | -24 %, 449 kr mot 589 kr, fri frakt över 300 kr, Klarna | okänd |
| Brådska | — (brief saknas i repot) | "Bara i dag", "lagret är begränsat och priset gäller inte länge till" (obelagt) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 18 kr, 1 sidvisningar och 0 köp på rea-copyn — för lite för en dom; hook 47 % / hold 21 % säger bara att Meta hittade ett syskon med samma text som den hellre visade.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Under 300 kr: observation, ingen dom — ingen iteration på en imiterad format-kopia utan research (CS-KLART punkt 12).

### Lärdom L-120250349233230291 — Dorrlarm_CS_2 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 16 kr / 2 283 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 24 % / 6 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Skydda hemmet — snart öppnas dörren" · primärtext rad 1: "⏳ Bara i dag: -24% på vårt dörr- och fönsterlarm."
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som redan vill ha ett larm och väntar på rätt pris | okänd |
| Vinkel | — (brief saknas i repot) | CS enligt namnkoden — rea, priset först | okänd |
| Medvetandenivå | — (brief saknas i repot) | mest medveten | okänd |
| Mekanism | — (brief saknas i repot) | ingen — bara "Trådlös fjärrkontroll ingår" | okänd |
| Tro | — (brief saknas i repot) | 449 kr i stället för 589 kr (stämmer med sidan 449 / 589) | okänd |
| Positionering | — (brief saknas i repot) | -24 %, 449 kr mot 589 kr, fri frakt över 300 kr, Klarna | okänd |
| Brådska | — (brief saknas i repot) | "Bara i dag", "lagret är begränsat och priset gäller inte länge till" (obelagt) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 16 kr, okänt antal sidvisningar och 0 köp på rea-copyn — för lite för en dom; hook 24 % / hold 6 % säger bara att Meta hittade ett syskon med samma text som den hellre visade.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Under 300 kr: observation, ingen dom — ingen iteration på en imiterad format-kopia utan research (CS-KLART punkt 12).

### Lärdom L-120250349246190291 — Dorrlarm_PD_2 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 14 kr / 2 283 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | 0,0 % (0 köp / 2 LPV) |
| Hook rate / hold rate | 62 % / 18 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Hör direkt när dörren öppnas" · primärtext rad 1: "Vet du alltid när nån öppnar dörren hemma? 🚪"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | husägaren som inte hör när altandörren eller källarfönstret öppnas | okänd |
| Vinkel | — (brief saknas i repot) | PD enligt namnkoden — frågan om dörren, sedan larmet | okänd |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten in, produktmedveten ut (tre funktionsrader) | okänd |
| Mekanism | — (brief saknas i repot) | 110 dB hörs i hela huset, fjärrkontroll på/av utan att gå dit, ingen app, inget abonnemang, ingen elektriker | okänd |
| Tro | — (brief saknas i repot) | "Sätt upp på 5 minuter. Sov lugnare i natt." | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | "Sov lugnare i natt" (mild) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 14 kr, 2 sidvisningar och 0 köp på PD-copyn — för lite för en dom; hook 62 % / hold 18 % säger bara att Meta hittade ett syskon med samma text som den hellre visade.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Under 300 kr: observation, ingen dom — ingen iteration på en imiterad format-kopia utan research (CS-KLART punkt 12).

### Lärdom L-120250349254630291 — Dorrlarm_SP_3 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 10 kr / 2 283 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | 33 % / 10 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Trygghet tusentals redan valt" · primärtext rad 1: ""Jag hör direkt om nån öppnar altandörren — även när jag sover på övervåningen." ⭐⭐⭐⭐⭐"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | villaägaren som sover på övervåningen och vill höra altandörren | okänd |
| Vinkel | — (brief saknas i repot) | SP enligt namnkoden — kundcitat med fem stjärnor | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten | okänd |
| Mekanism | — (brief saknas i repot) | enkelt att sätta upp själv, trådlös fjärrkontroll ingår | okänd |
| Tro | — (brief saknas i repot) | citatet + "hundratals svenska hem" i texten och "tusentals" i rubriken (obelagt och motsägande: lanserad 2026-09-24) | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad; "14 dagars öppet köp" | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen bara 10 kr på sju dygn — CBO:n lade citat-copyns spend på syskonannonsen med samma text, och under 300 kr finns ingen dom, bara att den aldrig fick leverans.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Ingen leverans på sju dygn är en förlorare (CLAUDE.md regel 11, INGEN_LEVERANS).

### Lärdom L-120250349234390291 — Dorrlarm_CS_3 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 10 kr / 2 283 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 32 % / 2 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Skydda hemmet — snart öppnas dörren" · primärtext rad 1: "⏳ Bara i dag: -24% på vårt dörr- och fönsterlarm."
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som redan vill ha ett larm och väntar på rätt pris | okänd |
| Vinkel | — (brief saknas i repot) | CS enligt namnkoden — rea, priset först | okänd |
| Medvetandenivå | — (brief saknas i repot) | mest medveten | okänd |
| Mekanism | — (brief saknas i repot) | ingen — bara "Trådlös fjärrkontroll ingår" | okänd |
| Tro | — (brief saknas i repot) | 449 kr i stället för 589 kr (stämmer med sidan 449 / 589) | okänd |
| Positionering | — (brief saknas i repot) | -24 %, 449 kr mot 589 kr, fri frakt över 300 kr, Klarna | okänd |
| Brådska | — (brief saknas i repot) | "Bara i dag", "lagret är begränsat och priset gäller inte länge till" (obelagt) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen bara 10 kr på sju dygn — CBO:n lade rea-copyns spend på syskonannonsen med samma text, och under 300 kr finns ingen dom, bara att den aldrig fick leverans.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Ingen leverans på sju dygn är en förlorare (CLAUDE.md regel 11, INGEN_LEVERANS).

### Lärdom L-120250349237600291 — Dorrlarm_G_2 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 5 kr / 2 283 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 47 % / 23 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Den present han faktiskt använder" · primärtext rad 1: "Jag visste inte vad jag skulle ge honom i år. Sen hittade jag det här. 🎁"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som ger present till "honom" (partner/pappa med garage) | okänd |
| Vinkel | — (brief saknas i repot) | G enligt namnkoden — presentvinkel berättad i jag-form | okänd |
| Medvetandenivå | — (brief saknas i repot) | presentletaren är omedveten om produkten; larmet nämns inte vid namn | okänd |
| Mekanism | — (brief saknas i repot) | ingen — "Satte upp det på garaget samma kväll" är det enda om produkten | okänd |
| Tro | — (brief saknas i repot) | "Han blev faktiskt rörd" / "jag vill att du ska känna dig trygg" | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | "i år" | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen bara 5 kr på sju dygn — CBO:n lade present-copyns spend på syskonannonsen med samma text, och under 300 kr finns ingen dom, bara att den aldrig fick leverans.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Ingen leverans på sju dygn är en förlorare (CLAUDE.md regel 11, INGEN_LEVERANS).

### Lärdom L-120250349240250291 — Dorrlarm_G_2_1 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 3 kr / 2 283 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Den present han faktiskt använder" · primärtext rad 1: "Jag visste inte vad jag skulle ge honom i år. Sen hittade jag det här. 🎁"
- VO: ingen VO (bild) — bildens egen text inte läst (ingen bild hämtad).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som ger present till "honom" (partner/pappa med garage) | okänd |
| Vinkel | — (brief saknas i repot) | G enligt namnkoden — presentvinkel berättad i jag-form (bild — samma copy som videosyskonen) | okänd |
| Medvetandenivå | — (brief saknas i repot) | presentletaren är omedveten om produkten; larmet nämns inte vid namn | okänd |
| Mekanism | — (brief saknas i repot) | ingen — "Satte upp det på garaget samma kväll" är det enda om produkten | okänd |
| Tro | — (brief saknas i repot) | "Han blev faktiskt rörd" / "jag vill att du ska känna dig trygg" | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | "i år" | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen bara 3 kr på sju dygn — CBO:n lade present-copyns spend på syskonannonsen med samma text, och under 300 kr finns ingen dom, bara att den aldrig fick leverans.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Ingen leverans på sju dygn är en förlorare (CLAUDE.md regel 11, INGEN_LEVERANS).

### Lärdom L-120250349254710291 — Dorrlarm_SP_2_1 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 kr / 2 283 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Trygghet tusentals redan valt" · primärtext rad 1: ""Jag hör direkt om nån öppnar altandörren — även när jag sover på övervåningen." ⭐⭐⭐⭐⭐"
- VO: ingen VO (bild) — bildens egen text inte läst (ingen bild hämtad).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | villaägaren som sover på övervåningen och vill höra altandörren | okänd |
| Vinkel | — (brief saknas i repot) | SP enligt namnkoden — kundcitat med fem stjärnor (bild — samma copy som videosyskonen) | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten | okänd |
| Mekanism | — (brief saknas i repot) | enkelt att sätta upp själv, trådlös fjärrkontroll ingår | okänd |
| Tro | — (brief saknas i repot) | citatet + "hundratals svenska hem" i texten och "tusentals" i rubriken (obelagt och motsägande: lanserad 2026-09-24) | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad; "14 dagars öppet köp" | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen bara 2 kr på sju dygn — CBO:n lade citat-copyns spend på syskonannonsen med samma text, och under 300 kr finns ingen dom, bara att den aldrig fick leverans.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Ingen leverans på sju dygn är en förlorare (CLAUDE.md regel 11, INGEN_LEVERANS).

### Lärdom L-120250349250970291 — Dorrlarm_SP_1 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 kr / 2 283 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,20 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 71 % / 57 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Trygghet tusentals redan valt" · primärtext rad 1: ""Jag hör direkt om nån öppnar altandörren — även när jag sover på övervåningen." ⭐⭐⭐⭐⭐"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | villaägaren som sover på övervåningen och vill höra altandörren | okänd |
| Vinkel | — (brief saknas i repot) | SP enligt namnkoden — kundcitat med fem stjärnor | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten | okänd |
| Mekanism | — (brief saknas i repot) | enkelt att sätta upp själv, trådlös fjärrkontroll ingår | okänd |
| Tro | — (brief saknas i repot) | citatet + "hundratals svenska hem" i texten och "tusentals" i rubriken (obelagt och motsägande: lanserad 2026-09-24) | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad; "14 dagars öppet köp" | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen bara 2 kr på sju dygn — CBO:n lade citat-copyns spend på syskonannonsen med samma text, och under 300 kr finns ingen dom, bara att den aldrig fick leverans.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 2 057 kr / 4 köp / ROAS 1,33 på 3 d mot break-even 1,52, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Ingen leverans på sju dygn är en förlorare (CLAUDE.md regel 11, INGEN_LEVERANS).

