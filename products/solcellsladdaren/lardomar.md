# Lärdomar — Solcellsladdaren 10 W MPPT

En per etiketterad annons (docs/os/CS-KLART.md punkt 1–5). Skrivs av `node agent/lardom.mjs --skriv`; varje brief pekar på ett id här (`lardom=L-…`).

### Lärdom L-120250349362290291 — Solcellsladdare_SP_1 (SPEND_WINNER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | SPEND_WINNER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 577 kr / 1 704 kr (34 %) |
| Köp | 1 |
| ROAS / CPA | 0,97 / 577 kr — kampanjens ROAS 0,66 |
| Konverteringsgrad | 1,3 % (1 köp / 79 LPV) |
| Hook rate / hold rate | 48 % / 16 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Batteriet redo – utan att lyfta ett finger" · primärtext rad 1: ""Batteriet var fulladdat efter en hel vinter i garaget." ⭐⭐⭐⭐⭐"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | ägaren av bil, båt eller husvagn som står still över vintern | okänd |
| Vinkel | — (brief saknas i repot) | SP enligt namnkoden — kundcitat med fem stjärnor, sedan "tusentals svenska fordonsägare" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (laddaren presenteras som "den här lösningen") | okänd |
| Mekanism | — (brief saknas i repot) | skonsam underhållsladdning året runt, fungerar utan eluttag | okänd |
| Tro | — (brief saknas i repot) | citatet + "Tusentals svenska fordonsägare har redan slutat oroa sig" (obelagt: lanserad 2026-09-24, inget citat på sidan) | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Spend winner: läs FÖRST kommentarerna på annonsen (node tools/annonskommentarer.mjs --annons <id>) — vad invänder publiken mot? Sedan konverteringsgraden, sedan manuset. Saknas tro, brådska, insats eller funnel-kongruens? Lägg bara till den delen, bygg inte om hela annonsen.

**Hypotes (gissning):** Gissning: Meta lade 34 % av spenden på citatet "Batteriet var fulladdat efter en hel vinter i garaget" (hook 48 %, hold 16 %), men 79 sidvisningar gav 1 köp (CVR 1,3 %) — kundernas kommentarer på solprodukterna frågar "var ska solen komma ifrån" (lead VOC-122187658244859973_995231902976428), och annonsen visar inte var panelen sitter; 577 kr och 1 köp är ingen dom.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Observation för en omstart: kundrösterna (lead VOC-122187658244859973_995231902976428, 4 kommentarer 25–26/9) saknar placeringen av panelen — en OB-annons som visar sugkopparna i rutan och sidans ord om laddning är det som saknas, inte ett nytt citat.

### Lärdom L-120250349359780291 — Solcellsladdare_PD_2 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 503 kr / 1 704 kr (29 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 0,66 |
| Konverteringsgrad | 0,0 % (0 köp / 50 LPV) |
| Hook rate / hold rate | 36 % / 13 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Batteriet redo – utan att lyfta ett finger" · primärtext rad 1: "Glöm att batteriet dör i garaget. 🔋☀️"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den vars 12 V-batteri dör medan fordonet står i garaget | okänd |
| Vinkel | — (brief saknas i repot) | PD enligt namnkoden — problemet (batteriet dör) och sedan laddaren | okänd |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten in, produktmedveten ut | okänd |
| Mekanism | — (brief saknas i repot) | solcellsladdaren håller 12 V-batteriet laddat automatiskt, MPPT-teknik, ingen app, ingen timer | okänd |
| Tro | — (brief saknas i repot) | "Sätt dit den – och glöm den. Batteriet är redo när du är det." | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | "Beställ din idag" (mild) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: "Glöm att batteriet dör i garaget" fick 503 kr och 50 sidvisningar utan köp (hook 36 %, hold 13 %) — kommentaren "Nu lyser ju tyvärr inte solen inne i mitt garage" (lead VOC-122187658244859973_995231902976428) pekar på att ordet "garage" i hooken väcker invändningen annonsen inte svarar på; 0 köp på 503 kr är ingen dom.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Observation: PD_2:s hook "garaget" drog själv fram invändningen i kommentarerna — om produkten startas om ska "garaget" bytas mot var panelen faktiskt sitter (sidan: sugkoppar, cigguttag eller batteriklämmor).

### Lärdom L-120250349361350291 — Solcellsladdare_PD_2_1 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 364 kr / 1 704 kr (21 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 0,66 |
| Konverteringsgrad | 0,0 % (0 köp / 36 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Batteriet redo – utan att lyfta ett finger" · primärtext rad 1: "Glöm att batteriet dör i garaget. 🔋☀️"
- VO: ingen VO (bild) — bildens egen text inte läst (ingen bild hämtad).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den vars 12 V-batteri dör medan fordonet står i garaget | okänd |
| Vinkel | — (brief saknas i repot) | PD enligt namnkoden — problemet (batteriet dör) och sedan laddaren (bild — samma copy som videosyskonen) | okänd |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten in, produktmedveten ut | okänd |
| Mekanism | — (brief saknas i repot) | solcellsladdaren håller 12 V-batteriet laddat automatiskt, MPPT-teknik, ingen app, ingen timer | okänd |
| Tro | — (brief saknas i repot) | "Sätt dit den – och glöm den. Batteriet är redo när du är det." | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | "Beställ din idag" (mild) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: bilden med samma PD-copy fick 364 kr och 36 sidvisningar utan köp — samma "garage"-invändning som PD_2, utan video som visar panelen; 0 köp är ingen dom.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Under 300 kr: observation, ingen dom — ingen iteration på en imiterad format-kopia utan research (CS-KLART punkt 12).

### Lärdom L-120250349349340291 — Solcellsladdare_CS_2_1 (KPI_WINNER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 134 kr / 1 704 kr (8 %) |
| Köp | 1 |
| ROAS / CPA | 4,18 / 134 kr — kampanjens ROAS 0,66 |
| Konverteringsgrad | 6,3 % (1 köp / 16 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "50% RABATT – Endast idag" · primärtext rad 1: "⚡ 50% RABATT – ENDAST IDAG ⚡"
- VO: ingen VO (bild) — bildens egen text inte läst (ingen bild hämtad).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | prisjägaren som redan vet vad en solcellsladdare är | okänd |
| Vinkel | — (brief saknas i repot) | CS enligt namnkoden — rea, "halva priset" (bild — samma copy som videosyskonen) | okänd |
| Medvetandenivå | — (brief saknas i repot) | mest medveten (ingen funktion, bara priset) | okänd |
| Mekanism | — (brief saknas i repot) | ingen — laddaren beskrivs inte | okänd |
| Tro | — (brief saknas i repot) | "halva priset" (sidan: 559 kr mot jämförpris 1 118 kr = 50 %, stämmer) | okänd |
| Positionering | — (brief saknas i repot) | 50 % rabatt, inget belopp i copyn | okänd |
| Brådska | — (brief saknas i repot) | "bara några timmar kvar", "Lagret är nästan slut", "Priset går tillbaka imorgon" (obelagt) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: 1 köp på 16 sidvisningar (134 kr, ROAS 4,18) på rea-bilden "50 % RABATT – ENDAST IDAG" — rabatten stämmer med sidan (559 mot 1 118), men "bara några timmar kvar" är obelagt och ett köp säger inget om vinkeln.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Observation: kampanjens enda annons över break-even var rea-bilden — ett köp, ingen dom, och brådskeraderna ("priset går tillbaka imorgon") saknar täckning.

### Lärdom L-120250349360710291 — Solcellsladdare_PD_3 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 40 kr / 1 704 kr (2 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 0,66 |
| Konverteringsgrad | 0,0 % (0 köp / 4 LPV) |
| Hook rate / hold rate | 29 % / 13 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Batteriet redo – utan att lyfta ett finger" · primärtext rad 1: "Glöm att batteriet dör i garaget. 🔋☀️"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den vars 12 V-batteri dör medan fordonet står i garaget | okänd |
| Vinkel | — (brief saknas i repot) | PD enligt namnkoden — problemet (batteriet dör) och sedan laddaren | okänd |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten in, produktmedveten ut | okänd |
| Mekanism | — (brief saknas i repot) | solcellsladdaren håller 12 V-batteriet laddat automatiskt, MPPT-teknik, ingen app, ingen timer | okänd |
| Tro | — (brief saknas i repot) | "Sätt dit den – och glöm den. Batteriet är redo när du är det." | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | "Beställ din idag" (mild) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 40 kr, 4 sidvisningar och 0 köp på PD-copyn — för lite för en dom; hook 29 % / hold 13 % säger bara att Meta hittade ett syskon med samma text som den hellre visade.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Under 300 kr: observation, ingen dom — ingen iteration på en imiterad format-kopia utan research (CS-KLART punkt 12).

### Lärdom L-120250349365540291 — Solcellsladdare_SP_3 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 28 kr / 1 704 kr (2 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 0,66 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 36 % / 15 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Batteriet redo – utan att lyfta ett finger" · primärtext rad 1: ""Batteriet var fulladdat efter en hel vinter i garaget." ⭐⭐⭐⭐⭐"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | ägaren av bil, båt eller husvagn som står still över vintern | okänd |
| Vinkel | — (brief saknas i repot) | SP enligt namnkoden — kundcitat med fem stjärnor, sedan "tusentals svenska fordonsägare" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (laddaren presenteras som "den här lösningen") | okänd |
| Mekanism | — (brief saknas i repot) | skonsam underhållsladdning året runt, fungerar utan eluttag | okänd |
| Tro | — (brief saknas i repot) | citatet + "Tusentals svenska fordonsägare har redan slutat oroa sig" (obelagt: lanserad 2026-09-24, inget citat på sidan) | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 28 kr, okänt antal sidvisningar och 0 köp på citat-copyn — för lite för en dom; hook 36 % / hold 15 % säger bara att Meta hittade ett syskon med samma text som den hellre visade.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Under 300 kr: observation, ingen dom — ingen iteration på en imiterad format-kopia utan research (CS-KLART punkt 12).

### Lärdom L-120250349345560291 — Solcellsladdare_CS_1 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 23 kr / 1 704 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 0,66 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | 40 % / 9 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "50% RABATT – Endast idag" · primärtext rad 1: "⚡ 50% RABATT – ENDAST IDAG ⚡"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | prisjägaren som redan vet vad en solcellsladdare är | okänd |
| Vinkel | — (brief saknas i repot) | CS enligt namnkoden — rea, "halva priset" | okänd |
| Medvetandenivå | — (brief saknas i repot) | mest medveten (ingen funktion, bara priset) | okänd |
| Mekanism | — (brief saknas i repot) | ingen — laddaren beskrivs inte | okänd |
| Tro | — (brief saknas i repot) | "halva priset" (sidan: 559 kr mot jämförpris 1 118 kr = 50 %, stämmer) | okänd |
| Positionering | — (brief saknas i repot) | 50 % rabatt, inget belopp i copyn | okänd |
| Brådska | — (brief saknas i repot) | "bara några timmar kvar", "Lagret är nästan slut", "Priset går tillbaka imorgon" (obelagt) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 23 kr, 1 sidvisningar och 0 köp på rea-copyn — för lite för en dom; hook 40 % / hold 9 % säger bara att Meta hittade ett syskon med samma text som den hellre visade.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Under 300 kr: observation, ingen dom — ingen iteration på en imiterad format-kopia utan research (CS-KLART punkt 12).

### Lärdom L-120250349364420291 — Solcellsladdare_SP_2 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 10 kr / 1 704 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 0,66 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | 23 % / 12 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Batteriet redo – utan att lyfta ett finger" · primärtext rad 1: ""Batteriet var fulladdat efter en hel vinter i garaget." ⭐⭐⭐⭐⭐"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | ägaren av bil, båt eller husvagn som står still över vintern | okänd |
| Vinkel | — (brief saknas i repot) | SP enligt namnkoden — kundcitat med fem stjärnor, sedan "tusentals svenska fordonsägare" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (laddaren presenteras som "den här lösningen") | okänd |
| Mekanism | — (brief saknas i repot) | skonsam underhållsladdning året runt, fungerar utan eluttag | okänd |
| Tro | — (brief saknas i repot) | citatet + "Tusentals svenska fordonsägare har redan slutat oroa sig" (obelagt: lanserad 2026-09-24, inget citat på sidan) | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 10 kr, 1 sidvisningar och 0 köp på citat-copyn — för lite för en dom; hook 23 % / hold 12 % säger bara att Meta hittade ett syskon med samma text som den hellre visade.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Under 300 kr: observation, ingen dom — ingen iteration på en imiterad format-kopia utan research (CS-KLART punkt 12).

### Lärdom L-120250349357680291 — Solcellsladdare_PD_1 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 7 kr / 1 704 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 0,66 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 21 % / 18 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Batteriet redo – utan att lyfta ett finger" · primärtext rad 1: "Glöm att batteriet dör i garaget. 🔋☀️"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den vars 12 V-batteri dör medan fordonet står i garaget | okänd |
| Vinkel | — (brief saknas i repot) | PD enligt namnkoden — problemet (batteriet dör) och sedan laddaren | okänd |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten in, produktmedveten ut | okänd |
| Mekanism | — (brief saknas i repot) | solcellsladdaren håller 12 V-batteriet laddat automatiskt, MPPT-teknik, ingen app, ingen timer | okänd |
| Tro | — (brief saknas i repot) | "Sätt dit den – och glöm den. Batteriet är redo när du är det." | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | "Beställ din idag" (mild) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen bara 7 kr på sju dygn — CBO:n lade PD-copyns spend på syskonannonsen med samma text, och under 300 kr finns ingen dom, bara att den aldrig fick leverans.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Ingen leverans på sju dygn är en förlorare (CLAUDE.md regel 11, INGEN_LEVERANS).

### Lärdom L-120250349350440291 — Solcellsladdare_GT_1 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 6 kr / 1 704 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 0,66 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 19 % / 6 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Den perfekta presenten till honom" · primärtext rad 1: "Vet du fortfarande inte vad du ska ge honom? 🎁"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som letar present till "honom" som "redan har allt för garaget" | okänd |
| Vinkel | — (brief saknas i repot) | GT enligt namnkoden — presentvinkel | okänd |
| Medvetandenivå | — (brief saknas i repot) | presentletaren är omedveten om produkten; laddaren nämns inte ens vid namn | okänd |
| Mekanism | — (brief saknas i repot) | ingen — copyn säger bara "det här" | okänd |
| Tro | — (brief saknas i repot) | "Något han faktiskt kommer använda" / "vad smart, det här behövde jag" | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen bara 6 kr på sju dygn — CBO:n lade present-copyns spend på syskonannonsen med samma text, och under 300 kr finns ingen dom, bara att den aldrig fick leverans.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Ingen leverans på sju dygn är en förlorare (CLAUDE.md regel 11, INGEN_LEVERANS).

### Lärdom L-120250349366140291 — Solcellsladdare_SP_2_1 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 5 kr / 1 704 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 0,66 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Batteriet redo – utan att lyfta ett finger" · primärtext rad 1: ""Batteriet var fulladdat efter en hel vinter i garaget." ⭐⭐⭐⭐⭐"
- VO: ingen VO (bild) — bildens egen text inte läst (ingen bild hämtad).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | ägaren av bil, båt eller husvagn som står still över vintern | okänd |
| Vinkel | — (brief saknas i repot) | SP enligt namnkoden — kundcitat med fem stjärnor, sedan "tusentals svenska fordonsägare" (bild — samma copy som videosyskonen) | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (laddaren presenteras som "den här lösningen") | okänd |
| Mekanism | — (brief saknas i repot) | skonsam underhållsladdning året runt, fungerar utan eluttag | okänd |
| Tro | — (brief saknas i repot) | citatet + "Tusentals svenska fordonsägare har redan slutat oroa sig" (obelagt: lanserad 2026-09-24, inget citat på sidan) | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen bara 5 kr på sju dygn — CBO:n lade citat-copyns spend på syskonannonsen med samma text, och under 300 kr finns ingen dom, bara att den aldrig fick leverans.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Ingen leverans på sju dygn är en förlorare (CLAUDE.md regel 11, INGEN_LEVERANS).

### Lärdom L-120250349347420291 — Solcellsladdare_CS_2 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 4 kr / 1 704 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 0,66 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 39 % / 4 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "50% RABATT – Endast idag" · primärtext rad 1: "⚡ 50% RABATT – ENDAST IDAG ⚡"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | prisjägaren som redan vet vad en solcellsladdare är | okänd |
| Vinkel | — (brief saknas i repot) | CS enligt namnkoden — rea, "halva priset" | okänd |
| Medvetandenivå | — (brief saknas i repot) | mest medveten (ingen funktion, bara priset) | okänd |
| Mekanism | — (brief saknas i repot) | ingen — laddaren beskrivs inte | okänd |
| Tro | — (brief saknas i repot) | "halva priset" (sidan: 559 kr mot jämförpris 1 118 kr = 50 %, stämmer) | okänd |
| Positionering | — (brief saknas i repot) | 50 % rabatt, inget belopp i copyn | okänd |
| Brådska | — (brief saknas i repot) | "bara några timmar kvar", "Lagret är nästan slut", "Priset går tillbaka imorgon" (obelagt) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen bara 4 kr på sju dygn — CBO:n lade rea-copyns spend på syskonannonsen med samma text, och under 300 kr finns ingen dom, bara att den aldrig fick leverans.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Ingen leverans på sju dygn är en förlorare (CLAUDE.md regel 11, INGEN_LEVERANS).

### Lärdom L-120250349348550291 — Solcellsladdare_CS_3 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 kr / 1 704 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 0,66 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 40 % / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "50% RABATT – Endast idag" · primärtext rad 1: "⚡ 50% RABATT – ENDAST IDAG ⚡"
- VO: okänd (videon inte transkriberad) — hook rate / hold rate står i tabellen ovan.

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | prisjägaren som redan vet vad en solcellsladdare är | okänd |
| Vinkel | — (brief saknas i repot) | CS enligt namnkoden — rea, "halva priset" | okänd |
| Medvetandenivå | — (brief saknas i repot) | mest medveten (ingen funktion, bara priset) | okänd |
| Mekanism | — (brief saknas i repot) | ingen — laddaren beskrivs inte | okänd |
| Tro | — (brief saknas i repot) | "halva priset" (sidan: 559 kr mot jämförpris 1 118 kr = 50 %, stämmer) | okänd |
| Positionering | — (brief saknas i repot) | 50 % rabatt, inget belopp i copyn | okänd |
| Brådska | — (brief saknas i repot) | "bara några timmar kvar", "Lagret är nästan slut", "Priset går tillbaka imorgon" (obelagt) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen bara 2 kr på sju dygn — CBO:n lade rea-copyns spend på syskonannonsen med samma text, och under 300 kr finns ingen dom, bara att den aldrig fick leverans.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Ingen leverans på sju dygn är en förlorare (CLAUDE.md regel 11, INGEN_LEVERANS).

### Lärdom L-120250349354780291 — Solcellsladdare_GT_2_1 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 kr / 1 704 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 0,66 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Rubrik (live 2026-10-01, Meta creative): "Den perfekta presenten till honom" · primärtext rad 1: "Vet du fortfarande inte vad du ska ge honom? 🎁"
- VO: ingen VO (bild) — bildens egen text inte läst (ingen bild hämtad).

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som letar present till "honom" som "redan har allt för garaget" | okänd |
| Vinkel | — (brief saknas i repot) | GT enligt namnkoden — presentvinkel (bild — samma copy som videosyskonen) | okänd |
| Medvetandenivå | — (brief saknas i repot) | presentletaren är omedveten om produkten; laddaren nämns inte ens vid namn | okänd |
| Mekanism | — (brief saknas i repot) | ingen — copyn säger bara "det här" | okänd |
| Tro | — (brief saknas i repot) | "Något han faktiskt kommer använda" / "vad smart, det här behövde jag" | okänd |
| Positionering | — (brief saknas i repot) | ingen prisrad | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav annonsen bara 1 kr på sju dygn — CBO:n lade present-copyns spend på syskonannonsen med samma text, och under 300 kr finns ingen dom, bara att den aldrig fick leverans.

**Nästa annonser:**
- `SLÄPP` — kampanjen stängdes av 2026-09-26 (STANG_AV, trappan: 1 614 kr / 2 köp / ROAS 0,69 på 3 d mot break-even 1,51, INGEN_TJUV); ingen brief på en avstängd kampanj (rond-auto 4b-spärren). Ingen leverans på sju dygn är en förlorare (CLAUDE.md regel 11, INGEN_LEVERANS).

