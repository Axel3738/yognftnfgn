# Lärdomar — Båtmotorskyddet 420D

En per etiketterad annons (docs/os/CS-KLART.md punkt 1–5). Skrivs av `node agent/lardom.mjs --skriv`; varje brief pekar på ett id här (`lardom=L-…`).

### Lärdom L-120250009362730291 — Batmotor_SP_1_H3 (BREAKTHROUGH, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | BREAKTHROUGH |
| Fönster | 2026-08-29 – 2026-09-04 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 599 kr / 8 779 kr (30 %) |
| Köp | 7 |
| ROAS / CPA | 2,41 / 371 kr — kampanjens ROAS 3,18 |
| Konverteringsgrad | 2,7 % (7 köp / 262 LPV) |
| Hook rate / hold rate | 45 % / 10 % |
| Bedömbar | ja |

**Koncept:** SP social proof · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen (briefen ligger i Product test center i Notion, inte i repot) — batch-log.md 2026-09-02/05/08 kallar den "toppspendern, svagare vinnare"


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext, rad 1 (live 2026-09-22): "Så många svenska båtägare har redan bytt till det här skyddet. ⛵"
- Rubrik (live): "En motor som håller längre" · beskrivning: "Älskat av båtägare över hela Sverige."
- Första frame (thumbnail, läst 2026-09-22, 64 px): utombordare med det svarta skyddet på, båt vid brygga — produkten syns i första bilden
- VO/inbränd text i videon: okänd — manuset finns inte i repot och videon är inte transkriberad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | svensk båtägare som grupp: "fiskare, skärgårdsbor och fritidsbåtsägare" — ingen enskild person, ingen scen | okänd |
| Vinkel | — (brief saknas i repot) | social proof: "så många … har redan bytt", "ett av våra mest omtyckta tillbehör" — obelagt, inget tal, ingen recension | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösningsmedveten: problemet (väder, salt, sol) nämns bara som "väder och vind" i en bisats | okänd |
| Mekanism | — (brief saknas i repot) | ingen mekanism — tre egenskaper (Oxford-tyg, heltäckande passform, enkelt på/av) utan att säga varför motorn håller längre | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts; copyn lånar tro från "så många har redan bytt" | okänd |
| Positionering | — (brief saknas i repot) | mot att köra utan skydd ("en motor som håller längre") — inte mot presenning eller annat skydd | okänd |
| Brådska | — (brief saknas i repot) | ingen deadline, ingen påhittad brådska — "Handla nu" är en CTA | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd — briefen finns inte i repot, så planerat går inte att läsa. ⚠️ Copyn bär obelagd social proof ("så många svenska båtägare har redan bytt", "ett av våra mest omtyckta") — förbjudet i ny copy sedan CLAUDE.md regel 3; annonsen är live och rörs inte, iterationerna tar bort det.

**Diagnos:** Breakthrough: tre iterationer inom 14 dagar, börja i manuslistan (nya hookar → längre problemdel → in media res). Aldrig en ren kopia av top spendern.

**Hypotes (gissning):** Gissning: annonsen blev breakthrough för att den hade lanseringens högsta hook rate (45 %) — produkten syns i första bilden på en riktig utombordare, och det räckte för att CBO:n skulle ge den 30 % av spenden vecka ett; hold rate 10 % och CPA över kampanjsnittet (371 mot 3,18 i ROAS) talar för att det är öppningsbilden som bär, inte social proof-texten som ändå ingen kan belägga.

**Nästa annonser:**
- `Batmotor_SP_1_H13` — typ I, parent Batmotor_SP_1_H3, iteration 1 av 3 (vidarebygg, deadline 2026-10-05): ny hook — samma kropp, men öppningsraden byts från "så många har bytt" till något som går att peka på (skyddet dras över motorn, remmen spänns). Enda variabeln är hookraden. (H11 och H12 finns redan i hubben — läs av innan namnet sätts.)
- `Batmotor_SP_1_H14` — typ I, parent Batmotor_SP_1_H3, iteration 2 av 3: längre problemdel — 5 s på den oskyddade motorn (salt, sol, fågelskit ur sidans egna rader) innan skyddet visas, resten oförändrat.
- `Batmotor_SP_1_H15` — typ I, parent Batmotor_SP_1_H3, iteration 3 av 3: in media res — sekund 0 är remmen som dras åt över motorn, ingen inledning, sedan samma kropp.

## Termoskyddet för Husbil 211 × 171 cm (120250175763810291)

### Lärdom L-120250125804850291 — Batmotor_SP_1_H5 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-07 – 2026-09-13 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 366 kr / 7 735 kr (18 %) |
| Köp | 8 |
| ROAS / CPA | 3,39 / 171 kr — kampanjens ROAS 2,35 |
| Konverteringsgrad | 4,5 % (8 köp / 178 LPV) |
| Hook rate / hold rate | 37 % / 7 % |
| Bedömbar | ja |

**Koncept:** SP social proof-kroppen med mekanism-demo som hook · **Typ:** I · **Parent:** Batmotor_SP_1_H1 · **Iteration:** 1 · **Källa:** batch #2 (batch-log.md 2026-09-05: "Ny hook: mekanism-demo ('dra över, spänn remmen') på vinnarens manus — isolerar hook-variabeln, källa SP_1_H1/SP_1_H3-jämförelsen"); briefen ligger i Notion-hubben `3d2270ab-908c-8166-8a97-eeba41397e84` (Approved), Drive-mapp `1IdL2RpOCyMhqae5hqenI9ii1mI4q5ltv`

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext, rad 1 (live 2026-09-23): "Dra över. Spänn remmen. Klart."
- Rubrik (live): "Dra över. Spänn. Klart." · primärtext rad 2–3: "Kraftigt 420D Oxford-tyg som täcker hela motorn – inga verktyg, inga krångliga fästen. / För dig som fiskar, bor i skärgården eller bara vill slippa krångel vid bryggan."
- Briefens manus (Notion, 5 rader 0–18 s): 1 "Dra över. Spänn remmen. Klart." (närbild: händer drar det svarta skyddet över utombordaren vid bryggan, spänner remmen) · 2 "Fiskare, skärgårdsbor och fritidsbåtsägare litar på Båtmotorskydd 420D …" (återanvänd kropp) · 3 tre bullets Oxford-tyg / heltäckande / enkelt på och av · 4 "Se varför det blivit ett av våra mest omtyckta tillbehör." · 5 "Handla nu. 579 kr."
- Första frame (thumbnail, läst 2026-09-23, 64 px): händer och det svarta skyddet på en utombordare — produkten och handgreppet syns i sekund 0
- VO: enligt briefen manusraderna ovan; videon är inte transkriberad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | fiskare / skärgårdsbor / fritidsbåtsägare vid bryggan (briefens "real dock/marina") | samma grupp ordagrant i rad 3 av primärtexten | ja |
| Vinkel | social proof-kropp med mekanism-demo som hook | hooken är mekanismen (dra över, spänn remmen), kroppen social proof | ja |
| Medvetandenivå | lösningsmedveten (produkten i bild från sekund 0) | lösningsmedveten — inget problem byggs, handgreppet först | ja |
| Mekanism | dra över, spänn remmen, inga verktyg | "täcker hela motorn – inga verktyg, inga krångliga fästen" | ja |
| Tro | "det är krångligt att skydda motorn" (briefens hook svarar med tre ord) | "bara vill slippa krångel vid bryggan" | ja |
| Positionering | mot att köra utan skydd, inte mot annat skydd | ingen konkurrent nämns; "täcker hela motorn" mot att lämna den öppen | ja |
| Brådska | ingen (regeln: aldrig påhittad brådska) | ingen — "Handla nu" är en CTA | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare. (Fick den: 34 % av kampanjens spend 2026-09-21, +15 007 kr vinstbidrag — kampanjens största annons sedan vecka två.)

**Hypotes (gissning):** Gissning: den konkreta mekanismhooken (handgreppet i sekund 0, tre ord) tar SP_1-kroppen förbi det H1/H3 aldrig klarade — CPA 171 mot H3:s 371 med samma kropp — och kommentarerna på just den här annonsen (7 st, 45 dagar: skepsis "onödigt"/"utombordare tål fukt" 43 %, fukt/kondens 43 %) är produktens hela invändningsbild, obesvarad i alla format.

**Nästa annonser:**
- `Batmotor_OB_1_1` — typ N, bild, kalla=voc, invandning=skepsis: rubriken medger "motorn tål ju regn" och svarar med sidans egna rader (sex månader på land, tjuven ser den blanka motorn från vägen). Fyller tomma rutan skepsis × statisk i invändningsmatrisen; mäts mot SP_1_H5 som bär kommentarerna.
- `Batmotor_SP_1_H11` och `Batmotor_SP_1_H12` — typ I, parent SP_1_H5, briefade 2026-09-21 (batch #5): två nya hookar på samma kropp. Inga fler hook-iterationer förrän de fått etikett.
- `Batmotor_OB_2_1` — typ N, bild, kalla=voc, invandning=fukt: fukt/kondens (43 %, 0 av 4 format) står kvar som tom ruta. Byggs först när produktsidan ger en mekanism att svara med — sidan säger i dag inget om ventilation, och en påhittad mekanism är förbjuden. Inte i dag.

### Lärdom L-120250009361920291 — Batmotor_SP_1_H1 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | KPI_WINNER |
| Fönster | 2026-08-29 – 2026-09-04 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 052 kr / 8 779 kr (23 %) |
| Köp | 14 |
| ROAS / CPA | 4,66 / 147 kr — kampanjens ROAS 3,18 |
| Konverteringsgrad | 7,4 % (14 köp / 190 LPV) |
| Hook rate / hold rate | 52 % / 13 % |
| Bedömbar | ja |

**Koncept:** SP social proof (lanseringsvideon) · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen 2026-08-29 (brief i Product test center i Notion, inte i repot); dna.md 2026-09-02: vinnaren med ROAS 8,32 som batch #1–#5 byggde hook-serien SP_1_H4–H12 på


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26, identisk med SP_1_H2/H3/SP_2_1): "Så många svenska båtägare har redan bytt till det här skyddet. ⛵ / Fiskare, skärgårdsbor och fritidsbåtsägare litar på Båtmotorskydd 420D för att skydda sin motor mot väder och vind. / ✅ Kraftigt Oxford-tyg ✅ Heltäckande passform ✅ Enkelt att sätta på och ta av / Se varför det blivit ett av våra mest omtyckta tillbehör. 👉 Handla nu."
- Rubrik (live): "En motor som håller längre" · beskrivning: "Älskat av båtägare över hela Sverige."
- Metas "preferred" thumbnail (inlagd bild, samma fil som SP_1_H2 — md5 lika): skyddet på en utombordare vid brygga med röda stugor, fem stjärnor och citatet "Perfekt passform och håller tätt även i kraftigt regn!" – Verifierad kund, 58 år, 30 dagars öppet köp, knapp "Handla nu". ⚠️ Citatet finns inte bland de 8 Judge.me-recensionerna (dna.md) — obelagd recension i bild; annonsen är live och rörs inte
- Autogenererade frames ur videon (Meta, ordning ej garanterad): frame 0 = närbild på en BAR, väderbiten och smutsig motorkåpa med tejpbit, marina i bakgrunden — produkten syns inte; frame 1 = skyddet dras av riggen för hand, caption "enkelt att ta av." (captions följer alltså primärtextens bullets)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | svensk båtägare som grupp ("fiskare, skärgårdsbor och fritidsbåtsägare") — ingen enskild person | okänd |
| Vinkel | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | social proof: "så många … har redan bytt", "ett av våra mest omtyckta tillbehör" — obelagt, inget tal | okänd |
| Medvetandenivå | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | lösningsmedveten: problemet bara som "väder och vind" i en bisats | okänd |
| Mekanism | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen mekanism — tre egenskaper (Oxford-tyg, heltäckande passform, enkelt på/av) utan varför | okänd |
| Tro | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen trosbarriär bemöts; tron lånas från "så många har bytt" | okänd |
| Positionering | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | mot att köra utan skydd ("En motor som håller längre"), inte mot annat skydd | okänd |
| Brådska | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen — "Handla nu" är en CTA, ingen deadline | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: H1 har familjens bästa CPA (147 kr mot break-even-CPA 393 kr, 14 köp) och kampanjens högsta hook rate (52 %) för att öppningen visar en bar, sliten kåpa — ett problem kunden känner igen — innan skyddet kommer; H3 (samma text, annan video) öppnar på det färdiga skyddet och landar på 371 kr. Hold rate 13 % säger att kroppen inte håller kvar, så CPA:n bärs av hooken plus bullets.

**Nästa annonser:**
- SLÄPP nya hook-varianter på SP_1 tills `Batmotor_SP_1_H11`, `H12` (live 2026-09-22) och `H13`–`H15` (live 2026-09-25) fått etikett — sju SP_1-hookar ligger redan i kön, en åttonde lär ingenting nytt.
- SLÄPP — lärdomen om problem-först-öppningen (frame 0) testas redan av `Batmotor_SP_1_H14` (längre problemdel, live 2026-09-25); läs dess etikett dag 7 (2026-10-02) mot H1:s 52 % hook rate innan något nytt briefas.

### Lärdom L-120250017784490291 — Batmotor_CS_2_1 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | KPI_WINNER |
| Fönster | 2026-08-30 – 2026-09-05 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 835 kr / 10 282 kr (18 %) |
| Köp | 14 |
| ROAS / CPA | 4,64 / 131 kr — kampanjens ROAS 3,11 |
| Konverteringsgrad | 7,9 % (14 köp / 178 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | ja |

**Koncept:** CS erbjudande, statisk — 40 % rabatt med falsk deadline · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen 2026-08-30 (brief inte i repot); dna.md 2026-09-05 flaggar spänningen: bär både den vinnande marinabilden och den förbjudna brådskan "imorgon är det för sent"


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "⚡ IDAG ENDAST: 40% rabatt på Båtmotorskydd 420D ⚡ / Priset gäller bara ett begränsat antal – och lagret minskar snabbt. / Ingen kod behövs. Rabatten dras av direkt i kassan. / Missa inte chansen – imorgon är det för sent. 👉 Ta rabatten innan den försvinner."
- Rubrik (live): "40% RABATT – ENDAST IDAG" · beskrivning: "Begränsat lager. Erbjudandet gäller endast idag."
- Bildtext (live, läst 2026-09-26): rubrik i vita versaler "40% RABATT – ENDAST IDAG", underrad "Få kvar i lager – slår snart i topp", röd knapp "Ta rabatten nu"; foto: skyddet på en stor utombordare på en vit båt i en solig marina med blått vatten — ingen person

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen avatar — talar till "du" som redan vet vad produkten är | okänd |
| Vinkel | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | erbjudande: 40 % rabatt, ingen kod | okänd |
| Medvetandenivå | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | produktmedveten: inget problem, ingen funktion — bara pris | okänd |
| Mekanism | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen mekanism, ingen produktfakta alls | okänd |
| Tro | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen trosbarriär; bilden (produkten på riktig båt) bär tilliten | okänd |
| Positionering | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | mot ordinarie pris, inte mot annat skydd | okänd |
| Brådska | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | påhittad: "IDAG ENDAST", "imorgon är det för sent", "lagret minskar snabbt" — rabatten är ett stående jämförpris (dna.md). Förbjudet i ny copy | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: CPA 131 kr mot break-even-CPA 393 kr och 7,9 % konvertering kommer ur kombinationen marinafoto + röd versalrubrik + brådska, och det är brådskan som får leveransen — de ärliga kopiorna av samma layout (CS_4_1 97 kr, CS_7_1 43 kr, CS_8_1 6 kr, CS_10_1 4 kr första veckan) fick aldrig spend, så Metas auktion verkar premiera just deadline-raden, inte layouten.

**Nästa annonser:**
- SLÄPP fler ärliga kopior av layouten — fyra är testade (CS_4_1, CS_7_1, CS_8_1, CS_10_1) utan leverans, och `Batmotor_CS_11_1` (säsongsrubrik i stället för deadline, live 2026-09-22) är femte försöket; får den ingen spend till 2026-09-29 är svaret att det är brådskan Meta köper, och äkta brådska finns bara i säsongen.

### Lärdom L-120250229963530291 — Batmotor_BF_12_1 (LOSER, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 665 kr / 16 662 kr (10 %) |
| Köp | 6 |
| ROAS / CPA | 2,57 / 278 kr — kampanjens ROAS 3,18 |
| Konverteringsgrad | 4,4 % (6 köp / 137 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | ja |

**Koncept:** BOF-statisk, storleksinvändningen ("passar den min motor?") · **Typ:** I · **Parent:** Batmotor_BF_3_1 · **Iteration:** 2 av storleksinvändningen (BF_3_1 → BF_12_1; BOF_3_1 är tredje, live 2026-09-20) · **Källa:** batch 2026-09-15 (batch-log: "passar den min motor?" löst med 9 storlekar och hk-spannet; kalla=egen-data, BF_3_1 bedömbar vinnare)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "9 storlekar. En passar din motor. / Från 0–5 hk upp till 250–350 hk. / 420D Oxford-tyg. Dra över, spänn remmen — inga verktyg."
- Rubrik (live): "9 storlekar, 0–5 till 250–350 hk" · beskrivning: "9 storlekar för din motor"
- Bildtext (live, läst 2026-09-26): svart rubrik "9 storlekar. En för din motor.", underrad "Passar 0–5 hk upp till 250–350 hk.", tre skyddade utombordare i tre storlekar på vit/grå studiobakgrund, fotrad "420D Oxford-tyg · Dra över, spänn remmen — inga verktyg", blå knapp "Hitta din storlek — Båtmotorskyddet 420D"

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (taggen saknas; batch 2026-09-15: BOF-bild, ingen avatar angiven) | ingen person — "din motor" | okänd |
| Vinkel | invändning: "passar den min motor?" löst med 9 storlekar och hk-spannet | storleksinvändningen, exakt så: 9 storlekar, 0–5 till 250–350 hk | ja |
| Medvetandenivå | — (BOF: produktmedveten) | produktmedveten — inget problem, bara passform | ja |
| Mekanism | 9 storlekar + hk-spann + dra över/spänn remmen | "Dra över, spänn remmen — inga verktyg" står i bild och text | ja |
| Tro | "passar den min motor?" (tvivlet på passform) | bemöts med tre storlekar i bild och hk-spannet | ja |
| Positionering | — (BOF) | ingen konkurrent, ingen jämförelse | okänd |
| Brådska | ingen (BOF-regeln: aldrig påhittad brådska) | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: etiketten LOSER dag 7 kom av ROAS 2,57 under kampanjens 3,18 — men CPA 278 kr ligger under break-even-CPA 393 kr och batch-log 2026-09-21 visar 6 köp och +942 kr vinstbidrag vid 1 356 kr; storleksinvändningen bär (BF_3_1 233 kr), medan studiobakgrunden och 4,4 % konvertering (mot BF_3_1:s 5,4 %) håller den under kampanjsnittet.

**Nästa annonser:**
- SLÄPP fler storleks-bilder — tre exekveringar finns (BF_3_1, BF_12_1, `Batmotor_BOF_3_1` live 2026-09-20), alla samma bevis; den fjärde lär inget. Formatfrågan (video) tas i `Batmotor_OB_3_H1` under BF_3_1:s lärdom nedan.

### Lärdom L-120250065298370291 — Batmotor_BF_3_1 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-02 – 2026-09-08 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 633 kr / 14 177 kr (12 %) |
| Köp | 7 |
| ROAS / CPA | 2,59 / 233 kr — kampanjens ROAS 1,97 |
| Konverteringsgrad | 5,4 % (7 köp / 130 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | ja |

**Koncept:** BOF-statisk, invändning/storleksguide · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (batch-log: "Invändning/storleksguide — 9 storlekar, verifierat mot Shopify-varianterna"; Axels BOF-serie)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Storlekar för allt från 5 hk jolle till 350 hk storbåt. / Mät din motor på 30 sekunder i måttguiden. / Beställ rätt direkt – inget gissande. 579 kr, skyddet i din storlek."
- Rubrik (live): "0–350 hk. En skyddar din."
- Bildtext (live, läst 2026-09-26): svart rubrik "Fel storlek? Se måttguiden innan du beställer.", underrad "9 storlekar, 0–5 hk till 250–350 hk. Hitta din.", ett skydd på grå studiobakgrund (ingen båt, ingen person), blå knapp "Se din storlek. Handla nu."

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (batch #1: BOF-bild, ingen avatar) | ingen person — "din motor", jolle till storbåt | okänd |
| Vinkel | invändning/storleksguide | storleksinvändningen med måttguiden som lösning | ja |
| Medvetandenivå | — (BOF: produktmedveten) | produktmedveten | ja |
| Mekanism | 9 storlekar, verifierade mot Shopify | 9 storlekar + "mät din motor på 30 sekunder i måttguiden" | ja |
| Tro | "jag beställer fel storlek" | bemöts direkt: "Fel storlek? Se måttguiden innan du beställer" | ja |
| Positionering | — (BOF) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: CPA 233 kr mot break-even-CPA 393 kr på en ren studiobild säger att storleksinvändningen är kampanjens starkaste statiska argument efter priset — den som redan vill ha skyddet stannar på "fel storlek?" och måttguiden tar bort sista tvivlet; att den fick 12 % av spenden utan båtfoto talar emot dna.md:s hypotes att studiobakgrund bara duger för invändningshantering — det ÄR invändningshantering.

**Nästa annonser:**
- `Batmotor_OB_3_H1` — typ I, parent Batmotor_BF_3_1, iteration 1: samma invändning ("Fel storlek?") och samma svar (måttguiden, 9 storlekar, 0–5 till 250–350 hk) som VIDEO — sekund 0 är måttbandet runt kåpan, sedan storlekstabellen, sedan skyddet dras på; enda variabeln är formatet. Storlek står INTE i invändningsmatrisen (den bygger på kommentarer), så briefen bär kalla=egen-data och ingen invandning=/ruta=-tagg.

### Lärdom L-120250105131680291 — Batmotor_FM_1_H1 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 789 kr / 10 808 kr (7 %) |
| Köp | 5 |
| ROAS / CPA | 3,38 / 158 kr — kampanjens ROAS 1,69 |
| Konverteringsgrad | 9,3 % (5 köp / 54 LPV) |
| Hook rate / hold rate | 50 % / 11 % |
| Bedömbar | ja |

**Koncept:** FM säsong/haul-out — "Snart står båten på land igen" · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (batch-log: "Säsong/haul-out (äkta, ej påhittad brådska) — produktsidans egen öppningsrad"); dna.md 2026-09-08 flyttade vinkeln till Winning DNA


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Snart står båten på land igen. / Sex månader i garage eller på trailer utan 420D-skydd — motorn möter regn, snö och UV. / Skyddet täcker hela motorn tills du sjösätter igen. / 579 kr (ord. 965 kr)."
- Rubrik (live): "420D mellan motorn och sex månaders väder"
- Frame (Metas preferred thumbnail, läst 2026-09-26): en vit/orange jolle med bar Selva 20-utombordare dras upp på trailer vid en sjösättningsramp, båtar på trailrar i bakgrunden, caption "på land igen." — produkten syns INTE i den bilden, bara den bara motorn i uppdragningsögonblicket
- VO: okänd — inte transkriberad (ffmpeg saknas i containern); captions följer primärtexten ("… på land igen.")

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (taggen saknas; batch #1: säsong/haul-out, båtägaren inför upptagningen) | båtägaren som snart tar upp båten — scenen är rampen och trailern | ja |
| Vinkel | säsong/haul-out, äkta brådska ur produktsidans öppningsrad | exakt: "Snart står båten på land igen" + sex månader på land | ja |
| Medvetandenivå | — (problemmedveten: vet att båten ska upp) | problemmedveten — upptagningen visas, skyddet kommer efter | ja |
| Mekanism | — (taggen saknas) | "täcker hela motorn tills du sjösätter igen" — täckning, ingen materialmekanism | okänd |
| Tro | — (taggen saknas) | "motorn klarar vintern bar" bemöts med "regn, snö och UV" i sex månader | okänd |
| Positionering | — (taggen saknas) | mot att låta motorn stå bar över vintern | okänd |
| Brådska | äkta: säsongen, ingen påhittad deadline | äkta: "snart", "sex månader" — ingen deadline | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: hook rate 50 % och 9,3 % konvertering (CPA 158 kr mot break-even-CPA 393 kr) kommer av att öppningsbilden är kundens egen situation just nu — båten på väg upp på trailern i september — och att brådskan är sann; att den bara fick 7 % av spenden beror snarare på att Meta redan lagt spenden på SP_1-familjen än på annonsen (CBO-svält, inte förlorare).

**Nästa annonser:**
- SLÄPP nya säsongsbriefer — vinkeln bär redan `Batmotor_FM_4_H1` (checklista, live 2026-09-22), `Batmotor_UG_3_H1` (UGC vid upptagningen, live 2026-09-23) och `Batmotor_SP_1_H14` (upplagd båt som problemdel, live 2026-09-25); `Batmotor_FM_2_H1` (visuell haul-out-hook, batch #3 2026-09-08) och `Batmotor_SP_4_H1` (batch #4) ligger briefade i hubben men är INTE i kontot 2026-09-26 — de ska levereras före någon ny brief, säsongen är nu.

### Lärdom L-120250126099880291 — Batmotor_CS_5_H1 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-07 – 2026-09-13 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 734 kr / 7 735 kr (10 %) |
| Köp | 4 |
| ROAS / CPA | 3,71 / 184 kr — kampanjens ROAS 2,35 |
| Konverteringsgrad | 10,3 % (4 köp / 39 LPV) |
| Hook rate / hold rate | 26 % / 4 % |
| Bedömbar | ja |

**Koncept:** CS ärligt erbjudande + båtvisual, video · **Typ:** I · **Parent:** Batmotor_CS_2_1 · **Iteration:** 1 (isolerar bilden från brådskan) · **Källa:** batch #2 2026-09-05 (batch-log: "Ärligt erbjudande + båtvisual, video-format — isolerar om CS_2_1:s båtbild (inte brådskan) bär resultatet")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Regn, sol och saltvatten – hela motorn skyddad under tätt 420D-tyg. 579 kr. Ordinarie pris 965 kr, 386 kr redan avdraget i priset. Ingen rabattkod, inget nedräkningsur. Det här är priset – i dag och imorgon."
- Rubrik (live): "Regn, sol, salt – 579 kr, inte 965 kr."
- Frame (Metas preferred thumbnail, läst 2026-09-26): skyddet på en stor utombordare i en marina med palmer, stor grå text "965 KR" med rött streck över, ett suddigt band under (troligen 579 kr-raden mitt i animation) — produkten i bild från sekund 0, priset som grafik
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (taggen saknas; batch #2: samma publik som CS_2_1) | ingen person — "hela motorn skyddad", priset | okänd |
| Vinkel | ärligt erbjudande + båtvisual (CS_2_1 utan brådskan) | exakt: samma marina-miljö, priset ärligt, "inget nedräkningsur" | ja |
| Medvetandenivå | — (produktmedveten) | produktmedveten med en problemrad ("Regn, sol och saltvatten") först | ja |
| Mekanism | — (taggen saknas) | "tätt 420D-tyg" — material, ingen demo | okänd |
| Tro | "rabatten är ett trick" bemöts med ärlighet | "Ingen rabattkod, inget nedräkningsur. Det här är priset – i dag och imorgon." | ja |
| Positionering | mot ordinarie pris | mot 965 kr | ja |
| Brådska | ingen (isolerar bort brådskan) | ingen — säger uttryckligen att priset gäller imorgon också | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: 10,3 % konvertering och CPA 184 kr mot break-even-CPA 393 kr säger att det ärliga erbjudandet säljer minst lika bra som CS_2_1 när någon väl tittar — men hook rate 26 % (kampanjens lägsta bland vinnarna) och hold 4 % säger att öppningen på ett färdigt skydd med ett överstruket pris inte stoppar tummen; annonsen är hook-begränsad, inte erbjudande-begränsad, därför bara 10 % av spenden.

**Nästa annonser:**
- `Batmotor_CS_5_H2` — typ I, parent Batmotor_CS_5_H1, iteration 2 av CS_5: samma kropp och samma ärliga prisrad, men de tre första sekunderna byts från "skydd + överstruket pris" till problembilden som bär SP_1_H1:s 52 % hook rate — en bar, väderbiten kåpa i närbild (regn/salt), sedan skyddet dras på och priset kommer. Enda variabeln är hooken; hook rate mäts mot 26 %.

### Lärdom L-120250104984000291 — Batmotor_RV_1_H1 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 612 kr / 10 808 kr (6 %) |
| Köp | 4 |
| ROAS / CPA | 3,79 / 153 kr — kampanjens ROAS 1,69 |
| Konverteringsgrad | 9,8 % (4 köp / 41 LPV) |
| Hook rate / hold rate | 29 % / 4 % |
| Bedömbar | ja |

**Koncept:** RV riktig recensionsvideo — två Judge.me-citat ordagrant · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (batch-log: "Riktig recensionsvideo (NY formatidé), 2 verbatim Judge.me-citat"); recensionerna organiska (`source: web`, dna.md 2026-09-15)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "8 av 8 recensioner. 5,0 av 5 stjärnor. / \"Bra köp: Skyddet känns hållbart och är lätt att sätta på.\" – Fredrik Larsson / \"Rekommenderas: Bra skydd när båten står ute. Väldigt nöjd.\" – Thomas Eriksson / 579 kr (ord. 965 kr)."
- Rubrik (live): "8 av 8 recensioner gav 5 stjärnor"
- Frame (Metas preferred thumbnail, läst 2026-09-26): skyddet på en utombordare på en vit båt på trailer, grusplan och båtar på trailrar bakom, caption "420D Oxford-tyg" — produkten i bild, ingen person
- VO: okänd — inte transkriberad (ffmpeg saknas i containern); captions följer produktfakta ("420D Oxford-tyg")

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (taggen saknas; batch #1: kunden som läser recensioner före köp) | ingen person i bild; två namngivna kunder i texten | okänd |
| Vinkel | riktig recensionsvideo, verbatim citat | exakt: 8 av 8, 5,0, två citat ordagrant med namn | ja |
| Medvetandenivå | — (lösningsmedveten) | lösningsmedveten — inget problem byggs, bevis först | okänd |
| Mekanism | — (taggen saknas) | "lätt att sätta på", "420D Oxford-tyg" i caption — ingen demo | okänd |
| Tro | "är det bra på riktigt?" bemöts med riktiga kundord | bemöts: 8 av 8, citat med fullständiga namn | ja |
| Positionering | — (taggen saknas) | ingen konkurrent | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: 9,8 % konvertering och CPA 153 kr mot break-even-CPA 393 kr säger att riktiga citat med fullständiga namn stänger köpet för den som redan letar — men hook rate 29 % och hold 4 % säger att en stilla produktbild med caption inte öppnar; formatet är det enda recensionsformat som levererat i kampanjen (åtta review-bilder RV_2/3/6/7/8/9/10/11 fick 0–30 kr var), så det är videon, inte citatet, som Meta ger spend.

**Nästa annonser:**
- SLÄPP fler recensionsBILDER för gott — 8 av 8 review-bilder i kampanjen fick under 30 kr (INGEN_LEVERANS/LOSER) medan den enda review-VIDEON blev KPI_WINNER; regeln för produkten: recensioner briefas bara som video.
- SLÄPP ny recensionsvideo nu — `Batmotor_RV_12_H1` (Thomas Erikssons citat som video, live 2026-09-23) är iteration 1 och får etikett 2026-09-30; först då avgörs om en tredje ska byggas med ny hook (hook rate 29 % är det som ska slås).

### Lärdom L-120250024545240291 — Batmotor_PD_1_H3 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-31 – 2026-09-06 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 846 kr / 11 721 kr (7 %) |
| Köp | 2 |
| ROAS / CPA | 1,37 / 423 kr — kampanjens ROAS 2,67 |
| Konverteringsgrad | 3,4 % (2 köp / 59 LPV) |
| Hook rate / hold rate | 31 % / 7 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** PD problem/skada — "Din motor står ute i regn, sol och salt luft" (lanseringens PD-manus, hook 3) · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen 2026-08-31 (brief inte i repot); batch-log 2026-09-15: 972 kr / 2 köp, under köpgränsen, ingen dom


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26, identisk med PD_1_H1/H2, PD_2_1, PD_EXTRA): "Din motor står ute i regn, sol och salt luft – varje dag. 🌧️ / Med tiden sliter det hårt på utombordaren. / Båtmotorskydd 420D skyddar mot: ✅ Regn och fukt ✅ Sol och UV-strålar ✅ Damm och smuts / Kraftigt 420D Oxford-tyg. Enkelt att sätta på – bara dra över motorn. / Skydda din investering redan idag. 👉 Beställ ditt Båtmotorskydd nu."
- Rubrik (live): "En motor som håller längre" · beskrivning: "Heltäckande skydd i kraftigt 420D-tyg för utombordare."
- Bild: inte tittad (annonsen inte bedömbar: 2 köp — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | utombordarägare vars motor "står ute … varje dag" — ingen person, ingen scen | okänd |
| Vinkel | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | problem/skada: "sliter det hårt på utombordaren" → tre ✅-punkter regn/fukt, sol/UV, damm/smuts | okänd |
| Medvetandenivå | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | problemmedveten: öppnar på vädret, produkten kommer i rad 3 | okänd |
| Mekanism | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "Kraftigt 420D Oxford-tyg. Enkelt att sätta på – bara dra över motorn" — material + handgrepp | okänd |
| Tro | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen — "Skydda din investering" antar att kunden redan tror på slitaget | okänd |
| Positionering | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | mot att låta motorn stå bar, inte mot annat skydd | okänd |
| Brådska | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "redan idag" — mjuk, ingen påhittad deadline | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: hook rate 31 % är lägre än SP_1-familjens 45–52 % och CPA 423 kr ligger över break-even-CPA 393 kr på 2 köp — PD-kroppens berättade väderpåståenden ("regn, sol och salt luft") utan bild på skadan stoppar inte tummen, samma copy föll i alla fem PD-exekveringar (PD_1_H1/H2, PD_2_1, PD_EXTRA alla under 60 kr).

**Nästa annonser:**
- SLÄPP hela PD_1-kroppen — fem exekveringar av samma text, ingen över break-even; problem-vinkeln lever vidare i `Batmotor_SP_1_H14` (problemdel på SP_1-kroppen, live 2026-09-25) och `Batmotor_PD_8_H1` (before/after, live 2026-09-22), inte i fler PD_1-hookar.

### Lärdom L-120250126154060291 — Batmotor_UG_1_H1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-07 – 2026-09-13 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 803 kr / 7 735 kr (10 %) |
| Köp | 2 |
| ROAS / CPA | 1,44 / 401 kr — kampanjens ROAS 2,35 |
| Konverteringsgrad | 2,8 % (2 köp / 72 LPV) |
| Hook rate / hold rate | 31 % / 7 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** UG UGC talking-head, formatskifte på vinnarens proof points · **Typ:** IM · **Parent:** Batmotor_SP_1_H1 · **Iteration:** 1 · **Källa:** batch #1 2026-09-02 (batch-log: "Formatskifte (UGC talking-head) — samma proof points som vinnaren, nytt format")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Båten åker upp om några veckor. I år får motorn ett riktigt skydd. / 420D Oxford-tyg, kåpa till rigg – inte bara toppen. / Ingen verktyg. Dra över, spänn remmen. / 579 kr (ord. 965 kr). 30 dagars öppet köp."
- Rubrik (live): "420D-skydd, kåpa till riggen"
- Bild: inte tittad (annonsen inte bedömbar dag 7: 2 köp — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | formatskifte: en person talar till kameran (UGC) | primärtexten är i jag-form ("I år får motorn ett riktigt skydd") — talking-head enligt briefen; videon inte sedd | okänd |
| Vinkel | samma proof points som SP_1_H1 | kåpa till rigg, 420D, inga verktyg, 579 kr — proof points, men säsongsöppning i stället för social proof | nej |
| Medvetandenivå | — (taggen saknas) | problemmedveten: "Båten åker upp om några veckor" | okänd |
| Mekanism | — (taggen saknas) | "Dra över, spänn remmen" — handgreppet | okänd |
| Tro | — (taggen saknas) | "ett riktigt skydd" mot det som inte täcker riggen | okänd |
| Positionering | — (taggen saknas) | "kåpa till rigg – inte bara toppen" — mot skydd som bara täcker toppen | okänd |
| Brådska | — (taggen saknas) | äkta: "om några veckor" | okänd |
**Utförandet föll:** ja · utford_som_briefad: nej

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: dag 7 (803 kr, 2 köp, CPA 401 kr mot break-even-CPA 393 kr) var för tidigt — batch-log 2026-09-21 visar 1 308 kr, 8 köp, CPA 163 kr och +1 757 kr vinstbidrag på dag 14, så etiketten LOSER mätte inlärningsveckan, inte formatet; UGC-formatet med säsongsöppning verkar bära, men bytet av öppning mot briefen gör att formatet och vinkeln inte går att skilja åt.

**Nästa annonser:**
- SLÄPP ny UGC nu — `Batmotor_UG_3_H1` (UGC vid bryggan, säsongsvinkeln, live 2026-09-23) är redan nästa steg på exakt den här lärdomen; etikett 2026-09-30. Sjudagarsetiketten på UG_1_H1 ska läsas som "svalt vecka ett, lönsam vecka två" i dna.md.

### Lärdom L-120250064627690291 — Batmotor_PD_5_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-02 – 2026-09-08 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 385 kr / 14 177 kr (3 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,97 |
| Konverteringsgrad | 0,0 % (0 köp / 17 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** PD demo/feature-collage, statisk — "Kåpa till rigg. Inte bara toppen." · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (batch-log: "Demo/feature-collage — format-transfer av PD-manuset"); dna.md 2026-09-05: verklig båt/trailer vid brygga, CTR 1,70 %


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "De flesta kåpor stannar vid toppen av motorn. / Den här går ner över riggen också. / 420D Oxford-tyg, 9 storlekar för allt från 0–5 hk till 250–350 hk. / 579 kr."
- Rubrik (live): "Kåpa till rigg. Inte bara toppen."
- Bild: inte tittad (annonsen 385 kr men 0 köp — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (batch #1: feature-collage, ingen avatar) | ingen person | okänd |
| Vinkel | demo/feature-collage av PD-manuset | produktargument: täcker riggen, inte bara toppen | ja |
| Medvetandenivå | — (taggen saknas) | produktmedveten (jämför med "de flesta kåpor") | okänd |
| Mekanism | — (taggen saknas) | täckning kåpa→rigg, 420D, 9 storlekar | ja |
| Tro | — (taggen saknas) | "en kåpa räcker" bemöts med "den här går ner över riggen" | okänd |
| Positionering | — (taggen saknas) | mot kåpor som stannar vid toppen | ja |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 385 kr, 17 LPV och 0 köp — "täcker riggen"-argumentet får klick (dna.md: CTR 1,70 %) men konverterar inte ensamt i en bild, eftersom den som klickar på jämförelsen vill SE skillnaden, och en stillbild med tre punkter text visar den inte; samma argument som video (PD_6_H1, live 2026-09-20) är rätt test.

**Nästa annonser:**
- SLÄPP — rigg-argumentet testas redan som video i `Batmotor_PD_6_H1` (jämförelse mot kapell som bara täcker toppen, live 2026-09-20) och som invändning i `Batmotor_BF_14_1` ("Täcker den hela motorn?", live 2026-09-22); ingen ny statisk på samma argument.

### Lärdom L-120250064868580291 — Batmotor_BF_1_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-02 – 2026-09-08 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 314 kr / 14 177 kr (2 %) |
| Köp | 1 |
| ROAS / CPA | 1,85 / 314 kr — kampanjens ROAS 1,97 |
| Konverteringsgrad | 11,1 % (1 köp / 9 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** BOF-statisk, pris/erbjudande · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (Axels BOF-serie: pris/erbjudande)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "965 kr ner till 579 kr. / 40% rabatt, avdraget direkt i kassan. / Ingen kod att skriva in, inget att komma ihåg."
- Rubrik (live): "579 kr. Ord. 965 kr."
- Bild: inte tittad (annonsen 314 kr, 1 köp — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (BOF, ingen avatar) | ingen person | okänd |
| Vinkel | pris/erbjudande | pris/erbjudande, ärligt | ja |
| Medvetandenivå | — (BOF: produktmedveten) | produktmedveten | ja |
| Mekanism | — (BOF) | ingen produktfakta alls | okänd |
| Tro | — (BOF) | "måste jag ha en kod?" — "ingen kod att skriva in" | okänd |
| Positionering | mot ordinarie pris | mot 965 kr | ja |
| Brådska | ingen (BOF-regeln) | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 314 kr och 1 köp (CPA 314 kr, precis under break-even-CPA 393 kr) — ett rent prisbudskap utan båtbild och utan brådska får varken leverans eller konvertering i den här CBO:n; det enda prisformat som levererar är CS_2_1 med marinafoto och deadline.

**Nästa annonser:**
- SLÄPP pris-BOF som statisk — sju rena prisbilder (BF_1_1, BF_7_1, BF_10_1, BOF_1_1, CS_4_1, CS_8_1, CS_10_1) fick 4–314 kr; batch #5 hade redan 0 BOF, håll det så.

### Lärdom L-120250009362290291 — Batmotor_SP_1_H2 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | KPI_WINNER |
| Fönster | 2026-08-29 – 2026-09-04 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 274 kr / 8 779 kr (3 %) |
| Köp | 2 |
| ROAS / CPA | 3,38 / 137 kr — kampanjens ROAS 3,18 |
| Konverteringsgrad | 4,9 % (2 köp / 41 LPV) |
| Hook rate / hold rate | 46 % / 13 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** SP social proof (lanseringsvideon, hook 2) · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen 2026-08-29 (brief inte i repot); batch-log 2026-09-15/18: seriens enda fall — 1 165 kr, 2 köp, ROAS 0,80 på dag 20, "kopiera aldrig H2:s öppning"


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26, identisk med SP_1_H1): "Så många svenska båtägare har redan bytt till det här skyddet. ⛵ / Fiskare, skärgårdsbor och fritidsbåtsägare litar på Båtmotorskydd 420D för att skydda sin motor mot väder och vind. / ✅ Kraftigt Oxford-tyg ✅ Heltäckande passform ✅ Enkelt att sätta på och ta av / Se varför det blivit ett av våra mest omtyckta tillbehör. 👉 Handla nu."
- Rubrik (live): "En motor som håller längre" · beskrivning: "Älskat av båtägare över hela Sverige."
- Metas preferred thumbnail: samma inlagda bild som SP_1_H1 (md5 lika) — se H1
- Autogenererade frames ur videon (ordning ej garanterad): frame 0 = det färdiga skyddet på en båt på trailer på en uppfart, tonad övergång; frame 1 = en BLANK, ny motorkåpa som spolas med vatten, caption "Fråga vilken båtägare" — videons captions följer alltså INTE primärtexten, H2 har ett eget manus ("Fråga vilken båtägare …")
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | svensk båtägare som grupp ("fiskare, skärgårdsbor och fritidsbåtsägare") — ingen enskild person | okänd |
| Vinkel | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | social proof: "så många … har redan bytt", "ett av våra mest omtyckta tillbehör" — obelagt, inget tal | okänd |
| Medvetandenivå | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | lösningsmedveten: problemet bara som "väder och vind" i en bisats | okänd |
| Mekanism | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | i videon: vatten spolas över en blank kåpa (demo av tåligheten?) — texten säger inget | okänd |
| Tro | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen trosbarriär bemöts; tron lånas från "så många har bytt" | okänd |
| Positionering | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | mot att köra utan skydd ("En motor som håller längre"), inte mot annat skydd | okänd |
| Brådska | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen — "Handla nu" är en CTA, ingen deadline | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: dag 7 såg H2 ut som en vinnare (hook 46 %, CPA 137 kr mot break-even-CPA 393 kr på 2 köp) men vecka två och tre gav 0 köp på 900 kr — öppningen där en blank, ny motor spolas med vatten visar att motorn TÅL vatten, alltså precis kommentarernas invändning ("utombordare är gjorda för att tåla fukt"), och säljer bort behovet av skyddet.

**Nästa annonser:**
- SLÄPP — batch-log 2026-09-18: "kopiera aldrig H2:s öppning"; lärdomen är att en demo av motorns tålighet motverkar produkten, och den regeln ska in i dna.md:s Losing DNA i stället för en ny brief.

### Lärdom L-120250064854480291 — Batmotor_CO_1_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-02 – 2026-09-08 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 169 kr / 14 177 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,97 |
| Konverteringsgrad | 0,0 % (0 köp / 9 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** CO jämförelse täckt/otäckt, statisk · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (batch-log: "Jämförelse (täckt/otäckt) — nytt koncept, grundad i produktens kärnfunktion")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Utan skydd: regn, snö och UV rakt på motorn. / Med skydd: 420D Oxford-tyg och kåpa ner till riggen. / 579 kr, med 30 dagars öppet köp om du ändrar dig."
- Rubrik (live): "Utan skydd. Med skydd."
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (batch #1, ingen avatar) | ingen person | okänd |
| Vinkel | jämförelse täckt/otäckt | utan/med skydd | ja |
| Medvetandenivå | — (taggen saknas) | problemmedveten | okänd |
| Mekanism | — (taggen saknas) | 420D + kåpa till rigg | ja |
| Tro | — (taggen saknas) | ingen | okänd |
| Positionering | mot att stå bar | mot att stå bar | ja |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 169 kr, 9 LPV, 0 köp — en before/after-bild utan riktigt väder i bilden (bilden inte sedd, men copyn beskriver inget som syns) får ingen leverans; samma idé fick 103 kr och 1 köp som BF_13_1 med regn i bild, så det är utförandet i bild som avgör, inte idén.

**Nästa annonser:**
- SLÄPP — before/after lever i `Batmotor_PD_8_H1` (video, live 2026-09-22) och `Batmotor_BF_13_1` (bild med regn); ingen tredje statisk.

### Lärdom L-120250105139440291 — Batmotor_AU_1_H1 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 161 kr / 10 808 kr (1 %) |
| Köp | 1 |
| ROAS / CPA | 3,60 / 161 kr — kampanjens ROAS 1,69 |
| Konverteringsgrad | 11,1 % (1 köp / 9 LPV) |
| Hook rate / hold rate | 21 % / 4 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** AU materialfaktum i stället för social proof — "Regn. Snö. UV." · **Typ:** I · **Parent:** Batmotor_SP_1_H1 · **Iteration:** 1 (ny öppning, samma struktur/CTA) · **Källa:** batch #1 2026-09-02 (batch-log: "Ny persuasion-vinkel (materialfaktum i stället för social proof) — samma struktur/CTA som vinnaren, ny öppning")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Regn. Snö. UV. / 420D Oxford-tyg tar smällen i stället för motorn. / Täcker hela motorn, kåpa till rigg. 579 kr (ord. 965 kr)."
- Rubrik (live): "Regn, snö och UV möter 420D-tyget"
- Frame (Metas preferred thumbnail, läst 2026-09-26): en man i rutig skjorta och arbetshandskar spänner remmen på skyddet över en utombordare på en vit båt på trailer, båtar i bakgrunden — händer + produkt, ingen text i bild
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (taggen saknas; batch #1: samma publik som SP_1_H1) | en båtägare med handskar vid trailern | okänd |
| Vinkel | materialfaktum i stället för social proof | exakt: "420D Oxford-tyg tar smällen i stället för motorn" | ja |
| Medvetandenivå | — (taggen saknas) | problemmedveten: tre ord väder först | okänd |
| Mekanism | 420D-tyget | 420D-tyget + kåpa till rigg, remmen spänns i bild | ja |
| Tro | — (taggen saknas) | ingen | okänd |
| Positionering | — (taggen saknas) | mot att låta motorn ta smällen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: 161 kr, 1 köp och hook rate 21 % (lägst av alla vinnare) — tre ord väder som text över ett lugnt handgrepp stoppar ingen; materialfaktumet konverterar när någon tittar (11 % på 9 LPV, för lite för dom) men öppningen ger inte Meta något att leverera på.

**Nästa annonser:**
- SLÄPP — materialraden lever redan i `Batmotor_SP_1_H13`:s kropp ("420D Oxford-tyget håller regn, snö och UV ute", live 2026-09-25); ingen egen AU-iteration.

### Lärdom L-120250289522610291 — Batmotor_BF_13_1 (KPI_WINNER, etikett 2026-09-26)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-19 – 2026-09-25 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 103 kr / 25 389 kr (0 %) |
| Köp | 1 |
| ROAS / CPA | 9,54 / 103 kr — kampanjens ROAS 2,04 |
| Konverteringsgrad | 20,0 % (1 köp / 5 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** BF före/efter i EN bild — bar motor i regn mot täckt motor · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** batch #4 2026-09-18 (batch-log: "före/efter i EN bild: bar motor i regn mot täckt motor — isolerad variabel: formatet")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Vänster: oskyddad motor i regnet. Höger: samma motor, skyddad med 420D Oxford ner över hela riggen. 579 kr i stället för 965 kr."
- Rubrik (live): "420D Oxford-tyg. Ner över hela riggen."
- Bildtext (live, läst 2026-09-26): delad bild, regn i båda halvorna; vänster en BAR svart motor (⚠️ den ser täckt/mörk ut — svårt att se att den är oskyddad), höger samma motor med skyddet; rubrik "420D Oxford-tyg. Ner över hela riggen.", underrad "Vänster: oskyddad. Höger: skyddad med 420D Oxford.", fotrad "579 kr. Ordinarie 965 kr. Du sparar 386 kr.", knapp "Beställ Båtmotorskyddet 420D."

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (batch #4: ingen avatar) | ingen person | okänd |
| Vinkel | före/efter i en bild | exakt: vänster oskyddad, höger skyddad | ja |
| Medvetandenivå | — (taggen saknas) | problemmedveten | okänd |
| Mekanism | 420D ner över riggen | 420D ner över riggen | ja |
| Tro | — (taggen saknas) | ingen | okänd |
| Positionering | mot att stå bar i regn | mot att stå bar i regn | ja |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: 103 kr, 5 LPV, 1 köp (CPA 103 kr mot break-even-CPA 393 kr) — för lite för en dom; att Meta gav den 0 % av spenden kan bero på att den "oskyddade" motorn till vänster är svart och blank och ser nästan lika täckt ut som högersidan, så kontrasten som ska bära bilden syns inte i flödet.

**Nästa annonser:**
- SLÄPP — before/after som video (`Batmotor_PD_8_H1`, live 2026-09-22) visar kontrasten i rörelse; ingen ny statisk förrän den fått etikett 2026-09-29.

### Lärdom L-120250065038000291 — Batmotor_CS_4_1 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-02 – 2026-09-08 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 97 kr / 14 177 kr (1 %) |
| Köp | 1 |
| ROAS / CPA | 5,98 / 97 kr — kampanjens ROAS 1,97 |
| Konverteringsgrad | 20,0 % (1 köp / 5 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** CS ärligt erbjudande, statisk — CS_2_1 utan den falska deadlinen · **Typ:** I · **Parent:** Batmotor_CS_2_1 · **Iteration:** 1 · **Källa:** batch #1 2026-09-02 (batch-log: "Ersätter CS_2_1:s falska brådska med samma äkta 40 %-rabatt utan påhittad deadline")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "965 kr → 579 kr. / 40% rabatt är redan avdraget, du behöver ingen kod. / Priset du ser är priset du betalar."
- Rubrik (live): "965 kr → 579 kr, redan avdraget"
- Bildtext (live, läst 2026-09-26): svart rubrik "965 kr → 579 kr. 40% rabatt, redan avdraget.", underrad "Ingen kod behövs. Priset syns i kassan.", foto av skyddet på en båt på trailer vid en brygga i kvällsljus, blå knapp "Handla nu."

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | samma publik som CS_2_1 | ingen person | okänd |
| Vinkel | ärligt erbjudande, samma rabatt | exakt: 965 → 579, ingen kod | ja |
| Medvetandenivå | produktmedveten | produktmedveten | ja |
| Mekanism | — (ingen) | ingen | okänd |
| Tro | "är rabatten ett trick?" | "Priset du ser är priset du betalar" | ja |
| Positionering | mot ordinarie pris | mot 965 kr | ja |
| Brådska | ingen — det är hela poängen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: 97 kr, 1 köp (CPA 97 kr mot break-even-CPA 393 kr, 20 % på 5 LPV) — samma erbjudande och nästan samma bild som CS_2_1 fick 1 % av spenden mot CS_2_1:s 18 %; det som skiljer är deadline-raden och den röda versalrubriken, så det verkar vara brådskan (inte layouten) som Metas auktion premierar.

**Nästa annonser:**
- SLÄPP — svaret på "kan vi vinna utan falsk brådska?" ligger i `Batmotor_CS_11_1` (säsongsrubrik, live 2026-09-22); ingen fler ärliga priskopior tills den fått etikett.

### Lärdom L-120250168880490291 — Batmotor_SP_1_H8 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-10 – 2026-09-16 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 90 kr / 5 744 kr (2 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 4,43 |
| Konverteringsgrad | 0,0 % (0 köp / 8 LPV) |
| Hook rate / hold rate | 32 % / 5 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** SP_1-kroppen, ny hook: aggregat-recension "8 av 8 ger 5 stjärnor" · **Typ:** I · **Parent:** Batmotor_SP_1_H1 · **Iteration:** hook 8 i SP_1-serien · **Källa:** batch #3 2026-09-08 (batch-log: "Ny hook: aggregat-recension på vinnarens manus — konkretiserad social proof, verifierad Judge.me-siffra")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "8 av 8 som recenserat Båtmotorskyddet 420D ger det 5 stjärnor. / Det täcker hela kåpan ner över riggen, inte bara toppen. / 420D Oxford-tyg, finns i 9 storlekar. / Båtmotorskyddet 420D, 579 kr (ord. 965 kr)."
- Rubrik (live): "8 av 8 ger 5 stjärnor" · beskrivning: "Täcker hela kåpan ner"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | samma som SP_1_H1 | ingen person | okänd |
| Vinkel | social proof konkretiserad (8 av 8) | exakt | ja |
| Medvetandenivå | lösningsmedveten | lösningsmedveten | ja |
| Mekanism | kåpa till rigg | kåpa till rigg, 420D, 9 storlekar | ja |
| Tro | "är det bra?" → 8 av 8 | 8 av 8 | ja |
| Positionering | mot skydd som bara täcker toppen | mot "bara toppen" | ja |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 90 kr, 0 köp, hook rate 32 % — en siffra som text över produkten stoppar färre än H1:s bara kåpa (52 %); social proof som hook i en video som redan har social proof i kroppen dubblerar samma argument och ger Meta inget nytt att leverera på.

**Nästa annonser:**
- SLÄPP — samma sak (8 av 8 som hook) föll även som SP_1_H4 (79 kr) och som review-bilder; recensionsargumentet hör hemma i `Batmotor_RV_12_H1` (video, live 2026-09-23), inte som SP_1-hook.

### Lärdom L-120250024536580291 — Batmotor_GT_1_H3 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | KPI_WINNER |
| Fönster | 2026-08-31 – 2026-09-06 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 89 kr / 11 721 kr (1 %) |
| Köp | 1 |
| ROAS / CPA | 6,48 / 89 kr — kampanjens ROAS 2,67 |
| Konverteringsgrad | 10,0 % (1 köp / 10 LPV) |
| Hook rate / hold rate | 31 % / 8 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** GT gift/present — "Vet du inte vad du ska ge honom som lever för sin båt?" (hook 3) · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen 2026-08-31 (brief inte i repot); dna.md 2026-09-02: GT_1 har kontots högsta CTR (4,17 %) men abstrakt hook


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26, identisk med GT_1_H1/H2, GT_2_1): "Vet du inte vad du ska ge honom som lever för sin båt? 🎁 / Jag hittade äntligen en present han faktiskt kommer använda – inte bara lägga i en låda. / Något som visar att jag tänkte på precis det han bryr sig om. / Se hans ansikte lysa upp när han öppnar den. Det är den känslan som gör det värt det. 👉 Ge honom presenten han inte visste att han behövde."
- Rubrik (live): "Den perfekta presenten till honom" · beskrivning: "En present han faktiskt kommer använda, hela säsongen."
- Frame (Metas preferred thumbnail, läst 2026-09-26): det färdiga skyddet på en utombordare på en vit båt på trailer på en villauppfart, caption "till pappa" — samma uppfartsscen som SP_1_H2:s frame 0; produkten i bild, ingen person
- VO: okänd — inte transkriberad (ffmpeg saknas i containern); captions ("till pappa") säger att VO:n riktar sig till barnet/partnern som köper present

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | presentköparen ("ge honom som lever för sin båt") — partnern, inte båtägaren | okänd |
| Vinkel | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | gift/present: "en present han faktiskt kommer använda" | okänd |
| Medvetandenivå | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | omedveten om produkten: ordet skydd nämns aldrig i primärtexten | okänd |
| Mekanism | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen — produkten beskrivs inte alls, bara känslan | okänd |
| Tro | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "presenter hamnar i en låda" bemöts med "faktiskt kommer använda" | okänd |
| Positionering | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | mot andra presenter, inte mot andra skydd | okänd |
| Brådska | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: 89 kr, 1 köp (ROAS 6,48 säger inget på ett köp) — presentvinkeln lanserades i slutet av augusti utan något presenttillfälle i sikte, så Meta hittade ingen publik att leverera till; hook rate 31 % och hold 8 % är normala, det är tillfället som saknas, inte utförandet.

**Nästa annonser:**
- SLÄPP nu — fyra GT-exekveringar (GT_1_H1/H2/H3, GT_2_1, GT_4_H1) under 90 kr utanför presentsäsong; `Batmotor_GT_3_H1` (konkretiserad, batch #1) gick live 2026-09-23 och får etikett 2026-09-30. Vinkeln prövas igen BARA i ett presentfönster (fars dag 2026-11-08, jul) och då som iteration på den GT som fått bäst etikett — brief senast 2026-10-25.

### Lärdom L-120250105327740291 — Batmotor_SP_1_H4 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 79 kr / 10 808 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,69 |
| Konverteringsgrad | 0,0 % (0 köp / 4 LPV) |
| Hook rate / hold rate | 24 % / 5 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** SP_1-kroppen, hook 4: recensionshook "5,0 av 5 stjärnor. 8 av 8 recensioner." · **Typ:** I · **Parent:** Batmotor_SP_1_H1 · **Iteration:** hook 4 · **Källa:** batch #1 2026-09-02 (batch-log: "Nära iteration av vinnaren — samma manus, ny öppningsvideo, hooket konkretiserat (8/8 recensioner)")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "5,0 av 5 stjärnor. 8 av 8 recensioner. / \"Skyddet känns hållbart och är lätt att sätta på.\" – Fredrik L. / 579 kr (ord. 965 kr)."
- Rubrik (live): "5,0 av 5 stjärnor (8 av 8 recensioner)"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | samma som SP_1_H1 | ingen person; ett citat med förnamn + initial | okänd |
| Vinkel | social proof konkretiserad (8/8) | exakt | ja |
| Medvetandenivå | lösningsmedveten | lösningsmedveten | ja |
| Mekanism | — (samma manus) | "lätt att sätta på" — inget mer | okänd |
| Tro | "är det bra?" → 8 av 8 | 8 av 8 + citat | ja |
| Positionering | — (samma manus) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 79 kr, 0 köp, hook rate 24 % — samma mönster som SP_1_H8 och TR_1_1: recensionssiffran som ÖPPNING fungerar inte i den här kampanjen, den fungerar bara som bevis i mitten av en video som öppnar på något annat (RV_1_H1).

**Nästa annonser:**
- SLÄPP — tre recensionshookar (SP_1_H4, SP_1_H8, TR_1_1) under 90 kr; inga fler.

### Lärdom L-120250147259930291 — Batmotor_FM_3_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 62 kr / 4 809 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 4,36 |
| Konverteringsgrad | 0,0 % (0 köp / 2 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** FM säsongsvinkeln, statisk transfer · **Typ:** S · **Parent:** Batmotor_FM_1_H1 · **Iteration:** 1 · **Källa:** batch #3 2026-09-08 (batch-log: "Säsongsvinkeln, billig statisk transfer — FM_1_H1 nu bevisad")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Snart läggs båten upp för säsongen. / 420D Oxford-tyg skyddar motorn under tiden. / 579 kr istället för 965 kr."
- Rubrik (live): "579 kr istället för 965 kr" · beskrivning: "30 dagars öppet köp"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | samma som FM_1_H1 | ingen person | okänd |
| Vinkel | säsong, statisk | säsong — men rubriken är priset, inte säsongen | nej |
| Medvetandenivå | problemmedveten | produktmedveten (rubriken är ett pris) | nej |
| Mekanism | — (taggen saknas) | 420D | okänd |
| Tro | — (taggen saknas) | ingen | okänd |
| Positionering | — (taggen saknas) | ingen | okänd |
| Brådska | äkta: säsongen | "snart läggs båten upp" — äkta | ja |
**Utförandet föll:** ja · utford_som_briefad: nej

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 62 kr, 0 köp — säsongsvinkeln bär i video (FM_1_H1: rampen, båten dras upp) men i bilden blev rubriken ett pris ("579 kr istället för 965 kr") och säsongen en bisats, så det som gjorde FM_1_H1 till vinnare (kundens egen situation i bild) följde inte med; utförandet föll, inte idén.

**Nästa annonser:**
- SLÄPP — säsongen som statisk finns redan som `Batmotor_CS_11_1` (säsongsrubrik, live 2026-09-22); rättningen är rubriken, och den är gjord där.

### Lärdom L-120250064963380291 — Batmotor_RI_1_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-02 – 2026-09-08 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 59 kr / 14 177 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,97 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** RI risk/kostnad av att vänta — "Rost syns inte förrän det är för sent." · **Typ:** IM · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (batch-log: "Strukturell överföring från Grillklinikens mönster, grundad i verifierad täckningsclaim")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Rost syns inte förrän det är för sent. / Skyddet täcker hela motorn, kåpa till rigg – inte bara toppen. / 579 kr skyddar mot sex månader i regn, snö och salt."
- Rubrik (live): "Rost syns inte förrän det är för sent."
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (batch #1, ingen avatar) | ingen person | okänd |
| Vinkel | risk/kostnad av att vänta (Grillkliniken-mönster) | exakt: rost | ja |
| Medvetandenivå | problemmedveten | problemmedveten | ja |
| Mekanism | — (taggen saknas) | kåpa till rigg | okänd |
| Tro | — (taggen saknas) | "jag ser inget fel" → "syns inte förrän det är för sent" | okänd |
| Positionering | — (taggen saknas) | mot att vänta | okänd |
| Brådska | ingen påhittad | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 59 kr, 0 köp — en IM-överföring från en annan produkt (grillen rostar, en utombordare "tål fukt" enligt kommentarerna) träffar inte båtägarens egen erfarenhet; rost är inte den skada kunderna nämner (kommentarerna säger onödigt/kondens), så budskapet saknar research bakom sig.

**Nästa annonser:**
- SLÄPP — typ IM utan research bakom (punkt 12), ingen iteration.

### Lärdom L-120250064958220291 — Batmotor_BF_2_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-02 – 2026-09-08 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 58 kr / 14 177 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,97 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** BOF-statisk, garanti/trygghet · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (Axels BOF-serie: "30 dagars öppet köp + Klarna, verifierat mot produktsidan")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Täcker skyddet inte riggen som du väntat dig? / Skicka tillbaka det inom 30 dagar, pengarna tillbaka. / Betala tryggt med Klarna."
- Rubrik (live): "30 dagars öppet köp."
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom) ⚠️ Policyrad i annonsen ("30 dagars öppet köp") — sidan säger 14 dagars ångerrätt sedan 2026-09-23 (Brief review 2026-09-18); annonsen är live och rörs inte, men raden får inte kopieras

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (BOF) | ingen person | okänd |
| Vinkel | garanti/trygghet | öppet köp + Klarna | ja |
| Medvetandenivå | produktmedveten | produktmedveten | ja |
| Mekanism | — (BOF) | ingen | okänd |
| Tro | "tänk om den inte passar" | "skicka tillbaka inom 30 dagar" | ja |
| Positionering | — (BOF) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 58 kr, 0 köp — garantibudskap utan produktargument får ingen leverans i en CBO där SP_1-videorna tar 60–70 % (BF_2_1, BF_8_1, BF_11_1, BOF_2_1 alla under 60 kr första veckan); tryggheten läses på produktsidan, inte i flödet.

**Nästa annonser:**
- SLÄPP garanti-BOF — fyra exekveringar, ingen leverans, och policyraden stämmer inte längre med sidan.

### Lärdom L-120250009360910291 — Batmotor_PD_2_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-29 – 2026-09-04 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 57 kr / 8 779 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 3,18 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** PD problem/skada, statisk (lanseringens PD-copy som bild) · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen 2026-08-29 (brief inte i repot)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26, identisk med PD_1_H1/H2/H3, PD_EXTRA): "Din motor står ute i regn, sol och salt luft – varje dag. 🌧️ / Med tiden sliter det hårt på utombordaren. / Båtmotorskydd 420D skyddar mot: ✅ Regn och fukt ✅ Sol och UV-strålar ✅ Damm och smuts / Kraftigt 420D Oxford-tyg. Enkelt att sätta på – bara dra över motorn. / Skydda din investering redan idag. 👉 Beställ ditt Båtmotorskydd nu."
- Rubrik (live): "En motor som håller längre"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | utombordarägare vars motor "står ute … varje dag" — ingen person, ingen scen | okänd |
| Vinkel | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | problem/skada: "sliter det hårt på utombordaren" → tre ✅-punkter regn/fukt, sol/UV, damm/smuts | okänd |
| Medvetandenivå | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | problemmedveten: öppnar på vädret, produkten kommer i rad 3 | okänd |
| Mekanism | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "Kraftigt 420D Oxford-tyg. Enkelt att sätta på – bara dra över motorn" — material + handgrepp | okänd |
| Tro | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen — "Skydda din investering" antar att kunden redan tror på slitaget | okänd |
| Positionering | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | mot att låta motorn stå bar, inte mot annat skydd | okänd |
| Brådska | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "redan idag" — mjuk, ingen påhittad deadline | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 57 kr, 0 köp — PD_1-copyn föll i alla fem exekveringar (video och bild), bilden inte sedd; det är kroppen ("regn, sol och salt luft" berättat), inte formatet, som Meta inte levererar.

**Nästa annonser:**
- SLÄPP — hela PD_1-kroppen släpps (se PD_1_H3).

### Lärdom L-120250105321700291 — Batmotor_PD_3_H1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 46 kr / 10 808 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,69 |
| Konverteringsgrad | 0,0 % (0 köp / 2 LPV) |
| Hook rate / hold rate | 26 % / 6 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** PD mekanism/demo, visa-inte-berätta — "Se skyddet dras på — i realtid" · **Typ:** I · **Parent:** Batmotor_PD_1_H3 · **Iteration:** 1 · **Källa:** batch #1 2026-09-02 (batch-log: "Ersätter PD-scriptets berättade väderpåståenden med en visad demo")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Regn mot en obeskyddad motor. / Sen dras 420D Oxford-tyget på — utan verktyg. / 579 kr (ord. 965 kr), spara 386 kr."
- Rubrik (live): "Se skyddet dras på — i realtid"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | samma som PD_1 | ingen person nämnd | okänd |
| Vinkel | mekanism/demo i stället för berättat problem | exakt: regn → skyddet dras på | ja |
| Medvetandenivå | problemmedveten | problemmedveten | ja |
| Mekanism | visad demo: dras på utan verktyg | "dras på — utan verktyg" | ja |
| Tro | — (taggen saknas) | ingen | okänd |
| Positionering | — (taggen saknas) | mot att stå bar i regn | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 46 kr, 0 köp, hook rate 26 % — samma demo (dra över, spänn remmen) blev kampanjens största annons som SP_1_H5 (hook 37 %, CPA 171 kr) tre dagar senare; skillnaden är kroppen efter demon (SP_1:s bullets mot PD:s prisrad), så demon bär bara ovanpå SP_1-kroppen.

**Nästa annonser:**
- SLÄPP — demon lever i `Batmotor_SP_1_H5` och `H15` (in media res, live 2026-09-25); ingen PD-version till.

### Lärdom L-120250105232890291 — Batmotor_CS_3_H1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 45 kr / 10 808 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,69 |
| Konverteringsgrad | 0,0 % (0 köp / 2 LPV) |
| Hook rate / hold rate | 29 % / 4 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** CS investeringsskydd — "Sex månader i vattnet. Sen obeskyddad i sex till?" · **Typ:** IM · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (batch-log: "Strukturell överföring från Grillklinikens bevisade skydda-investeringen-mönster, grundad i verifierat pris")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Sex månader i vattnet — sen står motorn kvar, obeskyddad, resten av året. / 420D Oxford-tyg täcker den mot regn, snö och UV tills du sjösätter igen. / 579 kr (ord. 965 kr)."
- Rubrik (live): "Sex månader i vattnet. Sen obeskyddad i sex till?"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (batch #1) | ingen person | okänd |
| Vinkel | investeringsskydd (Grillkliniken-mönster) | utfört som säsong/vinterförvaring — "investering" nämns inte | nej |
| Medvetandenivå | problemmedveten | problemmedveten | ja |
| Mekanism | — (taggen saknas) | 420D mot regn, snö, UV | okänd |
| Tro | — (taggen saknas) | ingen | okänd |
| Positionering | — (taggen saknas) | mot att stå bar | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** ja · utford_som_briefad: nej

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 45 kr, 0 köp, hook rate 29 % — copyn blev i praktiken en andra säsongsvinkel (samma "sex månader"-löfte som FM_1_H1, som gick live samma dag med 50 % hook rate), och Meta gav spenden till den av de två som hade upptagningsscenen i bild.

**Nästa annonser:**
- SLÄPP — typ IM, och löftet är FM_1_H1:s; ingen iteration.

### Lärdom L-120250168704670291 — Batmotor_GT_4_H1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-10 – 2026-09-16 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 45 kr / 5 744 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 4,43 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 14 % / 4 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** GT gift-vinkeln med fastare, produktnämnande CTA · **Typ:** I · **Parent:** Batmotor_GT_1_H3 · **Iteration:** 1 · **Källa:** batch #3 2026-09-08 (backlog-hypotes: "CTA:n har varit för mjuk, inte vinkeln som är fel")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "En present han faktiskt använder, varje gång båten läggs upp. / 420D Oxford-tyg, finns i 9 storlekar. / 30 dagars öppet köp om storleken inte passar. / Köp Båtmotorskyddet 420D, 579 kr (ord. 965 kr)."
- Rubrik (live): "Presenten han faktiskt använder" · beskrivning: "9 storlekar, 420D-tyg"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | presentköparen | presentköparen | ja |
| Vinkel | gift med fast CTA | exakt: "Köp Båtmotorskyddet 420D, 579 kr" | ja |
| Medvetandenivå | — (taggen saknas) | produktmedveten | okänd |
| Mekanism | — (taggen saknas) | 420D, 9 storlekar | okänd |
| Tro | "presenten hamnar i en låda" | "faktiskt använder" | ja |
| Positionering | mot andra presenter | mot andra presenter | ja |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 45 kr, 0 köp, hook rate 14 % (kampanjens lägsta) — backlog-hypotesen om CTA:n var fel: en fastare CTA hjälper inte när ingen tittar, och ingen tittar för att det inte är presentsäsong; hooken föll, inte kassan.

**Nästa annonser:**
- SLÄPP — backlog-hypotesen "mjuk CTA" avskrivs; presentvinkeln parkeras till fars dag-fönstret (se GT_1_H3).

### Lärdom L-120250147719310291 — Batmotor_CS_7_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 43 kr / 4 809 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 4,36 |
| Konverteringsgrad | 0,0 % (0 köp / 2 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** CS tredje exemplet på båtmiljö + ärligt erbjudande, statisk · **Typ:** I · **Parent:** Batmotor_CS_2_1 · **Iteration:** 3 (CS_4_1 → CS_6_1 → CS_7_1) · **Källa:** batch #3 2026-09-08 (batch-log: "bygger hypotesen (2 tidigare exempel) mot bevisad")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "579 kr för Båtmotorskyddet 420D. / Ordinarie pris 965 kr – spara 386 kr. / 30 dagars öppet köp, betalning med Klarna."
- Rubrik (live): "579 kr för 420D-skyddet (ord. 965 kr)" · beskrivning: "30 dagars öppet köp · Klarna"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | samma som CS_2_1 | ingen person | okänd |
| Vinkel | ärligt erbjudande + båtmiljö | ärligt erbjudande (bilden inte sedd) | okänd |
| Medvetandenivå | produktmedveten | produktmedveten | ja |
| Mekanism | — (ingen) | ingen | okänd |
| Tro | — (taggen saknas) | öppet köp + Klarna | okänd |
| Positionering | mot ordinarie pris | mot 965 kr | ja |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 43 kr, 0 köp — tredje ärliga priskopian i rad utan leverans; hypotesen "båtbilden bär CS_2_1" håller inte, det verkar vara brådskan (se CS_2_1 och CS_4_1).

**Nästa annonser:**
- SLÄPP — tre iterationer med lärdom på samma koncept (punkt 18), ingen slår originalet; CS_11_1 är sista försöket via säsongsrubriken.

### Lärdom L-120250105225860291 — Batmotor_TH_1_H1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 42 kr / 10 808 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,69 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | 20 % / 6 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** TH stöldskydd — "Ingen ser vilken motor som står under" · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (batch-log: "Stöldskydd (NY vinkel, hypotes) — grundad i produktsidans egen rad")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Ingen ser vilken motor som står under. / 420D Oxford-tyg täcker hela motorn — märke och modell osynligt för alla som går förbi. / BÄVERBUTIKEN. 579 kr (ord. 965 kr)." ⚠️ Butikens namn i primärtexten — förbjudet sedan 2026-09-18 (Axels beslut); annonsen är live och rörs inte, men copyn får inte kopieras
- Rubrik (live): "Ingen ser vilken motor som står under"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (batch #1) | båtägaren som oroar sig för stöld | okänd |
| Vinkel | stöldskydd (ny vinkel) | exakt: märke och modell osynligt | ja |
| Medvetandenivå | — (taggen saknas) | problemmedveten | okänd |
| Mekanism | täcker hela motorn | täcker hela motorn | ja |
| Tro | — (taggen saknas) | ingen | okänd |
| Positionering | — (taggen saknas) | mot att låta motorn synas | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 42 kr, 0 köp, hook rate 20 % — stöldvinkeln ensam bär inte; produktsidans rad fungerar som andra argument (OB_1_1 använder den så), inte som öppning, och avataren (den som oroar sig för stöld) är för smal för CBO:n att hitta.

**Nästa annonser:**
- SLÄPP som egen vinkel — stöldraden lever som stödargument i `Batmotor_OB_1_1` (live 2026-09-24) och `SP_1_H13`:s kropp.

### Lärdom L-120250289540570291 — Batmotor_BOF_1_1 (LOSER, etikett 2026-09-26)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER · BOF |
| Fönster | 2026-09-19 – 2026-09-25 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 41 kr / 25 389 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,04 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** BOF pris/erbjudande, fjärde exekveringen · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #4 2026-09-18 (batch-log: "579 kr mot 965 kr, spara 386 kr")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "579 kr — du sparar 386 kr mot ordinarie pris 965 kr på båtmotorskyddet 420D. Samma skydd, bara till ett lägre pris. Beställ det här."
- Rubrik (live): "579 kr — spara 386 kr"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (BOF) | ingen person | okänd |
| Vinkel | pris | pris | ja |
| Medvetandenivå | produktmedveten | produktmedveten | ja |
| Mekanism | — (BOF) | ingen | okänd |
| Tro | — (BOF) | ingen | okänd |
| Positionering | mot ordinarie pris | mot 965 kr | ja |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** Gissning: 41 kr, 0 köp — samma utfall som BF_1_1, BF_7_1, BF_10_1 och CS-kopiorna: ren prisbild utan brådska levereras inte i den här CBO:n.

**Nästa annonser:**
- SLÄPP — BOF räknas inte i frekvensen och pris-BOF har sju exekveringar utan leverans; inga fler.

### Lärdom L-120250009360390291 — Batmotor_GT_2_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-29 – 2026-09-04 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 40 kr / 8 779 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 3,18 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** GT gift/present, statisk (lanseringens GT-copy som bild) · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen 2026-08-29 (brief inte i repot)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26, identisk med GT_1_H1/H2/H3): "Vet du inte vad du ska ge honom som lever för sin båt? 🎁 / Jag hittade äntligen en present han faktiskt kommer använda – inte bara lägga i en låda. / Något som visar att jag tänkte på precis det han bryr sig om. / Se hans ansikte lysa upp när han öppnar den. Det är den känslan som gör det värt det. 👉 Ge honom presenten han inte visste att han behövde."
- Rubrik (live): "Den perfekta presenten till honom"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | presentköparen ("ge honom som lever för sin båt") — partnern, inte båtägaren | okänd |
| Vinkel | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | gift/present: "en present han faktiskt kommer använda" | okänd |
| Medvetandenivå | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | omedveten om produkten: ordet skydd nämns aldrig i primärtexten | okänd |
| Mekanism | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen — produkten beskrivs inte alls, bara känslan | okänd |
| Tro | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "presenter hamnar i en låda" bemöts med "faktiskt kommer använda" | okänd |
| Positionering | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | mot andra presenter, inte mot andra skydd | okänd |
| Brådska | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 40 kr, 0 köp — presentvinkeln utanför presentsäsong, som bild; samma orsak som GT_1_H3.

**Nästa annonser:**
- SLÄPP — presentvinkeln parkeras till fars dag-fönstret (se GT_1_H3), och då som video, inte bild.

### Lärdom L-120250017785270291 — Batmotor_PD_EXTRA (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-30 – 2026-09-05 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 37 kr / 10 282 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 3,11 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** PD problem/skada, statisk extra (lanseringens PD-copy) · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen 2026-08-30 (brief inte i repot; namnet följer inte namnkonventionen)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26, identisk med PD_1/PD_2_1): "Din motor står ute i regn, sol och salt luft – varje dag. 🌧️ / Med tiden sliter det hårt på utombordaren. / Båtmotorskydd 420D skyddar mot: ✅ Regn och fukt ✅ Sol och UV-strålar ✅ Damm och smuts / Kraftigt 420D Oxford-tyg. Enkelt att sätta på – bara dra över motorn. / Skydda din investering redan idag. 👉 Beställ ditt Båtmotorskydd nu."
- Rubrik (live): "En motor som håller längre"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | utombordarägare vars motor "står ute … varje dag" — ingen person, ingen scen | okänd |
| Vinkel | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | problem/skada: "sliter det hårt på utombordaren" → tre ✅-punkter regn/fukt, sol/UV, damm/smuts | okänd |
| Medvetandenivå | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | problemmedveten: öppnar på vädret, produkten kommer i rad 3 | okänd |
| Mekanism | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "Kraftigt 420D Oxford-tyg. Enkelt att sätta på – bara dra över motorn" — material + handgrepp | okänd |
| Tro | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen — "Skydda din investering" antar att kunden redan tror på slitaget | okänd |
| Positionering | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | mot att låta motorn stå bar, inte mot annat skydd | okänd |
| Brådska | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "redan idag" — mjuk, ingen påhittad deadline | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 37 kr, 0 köp — PD_1-kroppen som bild, andra bilden med samma text; kroppen släpps.

**Nästa annonser:**
- SLÄPP — se PD_1_H3; namnet `PD_EXTRA` bryter dessutom namnkonventionen och ska inte upprepas.

### Lärdom L-120250230146770291 — Batmotor_BF_10_1 (LOSER, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 33 kr / 16 662 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 3,18 |
| Konverteringsgrad | 0,0 % (0 köp / 2 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** BOF pris/erbjudande, tredje exekveringen · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch 2026-09-15 (batch-log: "579 kr / ord. 965 kr / spara 386 kr")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "579 kr istället för 965 kr — du sparar 386 kr, det är 40 %. / 420D Oxford-tyg täcker kåpan och riggen ner mot propellern. / 9 storlekar från 0 till 350 hk, med spännband och snabbspänne."
- Rubrik (live): "Spara 386 kr (40 %)" · beskrivning: "9 storlekar · 420D-tyg"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (BOF) | ingen person | okänd |
| Vinkel | pris | pris + täckning + storlekar | ja |
| Medvetandenivå | produktmedveten | produktmedveten | ja |
| Mekanism | — (BOF) | spännband och snabbspänne | okänd |
| Tro | — (BOF) | ingen | okänd |
| Positionering | mot ordinarie pris | mot 965 kr | ja |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 33 kr, 0 köp — pris-BOF utan brådska, samma som BF_1_1/BF_7_1/BOF_1_1.

**Nästa annonser:**
- SLÄPP — pris-BOF är uttömd (sju exekveringar).

### Lärdom L-120250065193470291 — Batmotor_RV_3_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-02 – 2026-09-08 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 30 kr / 14 177 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,97 |
| Konverteringsgrad | 0,0 % (0 köp / 4 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** RV recensionsbild, verbatim citat (Johan K.) · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (Judge.me, verifierat)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "\"Bra skydd mot regn och smuts. Jag är nöjd.\" – Johan K. / Verklig recension, baverbutiken.se. / 5,0 av 5 (8 recensioner). 579 kr." ⚠️ Domänen i copyn — butiksnamnsregeln 2026-09-18; live, rörs inte
- Rubrik (live): "\"Bra skydd mot regn och smuts.\" – Johan K."
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (review-bild) | en namngiven kund | okänd |
| Vinkel | recension ordagrant | exakt | ja |
| Medvetandenivå | lösningsmedveten | lösningsmedveten | ja |
| Mekanism | — (ingen) | ingen | okänd |
| Tro | "är det bra?" | citat + 5,0 | ja |
| Positionering | — (ingen) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 30 kr, 0 köp — recensionsbilder får ingen leverans i kampanjen (8 av 8 under 30 kr); ett kort citat på en bild ger Meta inget att optimera på när samma citat finns i en video som konverterar (RV_1_H1).

**Nästa annonser:**
- SLÄPP alla recensionsbilder — regeln står under RV_1_H1: recensioner bara som video.

### Lärdom L-120250009361290291 — Batmotor_SP_2_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-29 – 2026-09-04 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 28 kr / 8 779 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 3,18 |
| Konverteringsgrad | 0,0 % (0 köp / 4 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** SP social proof, statisk (lanseringens SP-copy som bild) · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen 2026-08-29 (brief inte i repot)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26, identisk med SP_1_H1): "Så många svenska båtägare har redan bytt till det här skyddet. ⛵ / Fiskare, skärgårdsbor och fritidsbåtsägare litar på Båtmotorskydd 420D för att skydda sin motor mot väder och vind. / ✅ Kraftigt Oxford-tyg ✅ Heltäckande passform ✅ Enkelt att sätta på och ta av / Se varför det blivit ett av våra mest omtyckta tillbehör. 👉 Handla nu."
- Rubrik (live): "En motor som håller längre"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | svensk båtägare som grupp ("fiskare, skärgårdsbor och fritidsbåtsägare") — ingen enskild person | okänd |
| Vinkel | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | social proof: "så många … har redan bytt", "ett av våra mest omtyckta tillbehör" — obelagt, inget tal | okänd |
| Medvetandenivå | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | lösningsmedveten: problemet bara som "väder och vind" i en bisats | okänd |
| Mekanism | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen mekanism — tre egenskaper (Oxford-tyg, heltäckande passform, enkelt på/av) utan varför | okänd |
| Tro | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen trosbarriär bemöts; tron lånas från "så många har bytt" | okänd |
| Positionering | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | mot att köra utan skydd ("En motor som håller längre"), inte mot annat skydd | okänd |
| Brådska | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen — "Handla nu" är en CTA, ingen deadline | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 28 kr, 0 köp — samma text som kampanjens vinnarfamilj men som stillbild; det som bär SP_1 är videon (H1:s slitna kåpa, H5:s handgrepp), inte texten, och en bild har ingen av dem.

**Nästa annonser:**
- SLÄPP — SP-vinkeln är video; dna.md säger det redan ("hook-videot är den avgörande variabeln, inte manuset").

### Lärdom L-120250065032980291 — Batmotor_TR_1_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-02 – 2026-09-08 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 25 kr / 14 177 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,97 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** TR testimonial/aggregerat betyg, statisk · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (batch-log: "8 recensioner, snitt 5,0 (Judge.me)")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "5,0 av 5 stjärnor. 8 av 8 recensioner. / \"Skyddet känns hållbart och är lätt att sätta på.\" – Fredrik L. / 579 kr."
- Rubrik (live): "5,0 av 5 stjärnor (8 recensioner)"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (batch #1) | ingen person i bild; ett citat | okänd |
| Vinkel | aggregerat betyg | exakt | ja |
| Medvetandenivå | lösningsmedveten | lösningsmedveten | ja |
| Mekanism | — (ingen) | "lätt att sätta på" | okänd |
| Tro | "är det bra?" | 5,0 + citat | ja |
| Positionering | — (ingen) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 25 kr, 0 köp — samma copy som SP_1_H4 (79 kr) fast som bild; betyget som öppning bär inte, se SP_1_H4 och RV_3_1.

**Nästa annonser:**
- SLÄPP — recensioner bara som video (regeln under RV_1_H1).

### Lärdom L-120250024539550291 — Batmotor_PD_1_H1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-31 – 2026-09-06 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 24 kr / 11 721 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,67 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 22 % / 8 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** PD problem/skada, lanseringens PD-manus hook 1 · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen 2026-08-31 (brief inte i repot)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26, identisk med PD_1_H2/H3): "Din motor står ute i regn, sol och salt luft – varje dag. 🌧️ / Med tiden sliter det hårt på utombordaren. / Båtmotorskydd 420D skyddar mot: ✅ Regn och fukt ✅ Sol och UV-strålar ✅ Damm och smuts / Kraftigt 420D Oxford-tyg. Enkelt att sätta på – bara dra över motorn. / Skydda din investering redan idag. 👉 Beställ ditt Båtmotorskydd nu."
- Rubrik (live): "En motor som håller längre"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | utombordarägare vars motor "står ute … varje dag" — ingen person, ingen scen | okänd |
| Vinkel | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | problem/skada: "sliter det hårt på utombordaren" → tre ✅-punkter regn/fukt, sol/UV, damm/smuts | okänd |
| Medvetandenivå | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | problemmedveten: öppnar på vädret, produkten kommer i rad 3 | okänd |
| Mekanism | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "Kraftigt 420D Oxford-tyg. Enkelt att sätta på – bara dra över motorn" — material + handgrepp | okänd |
| Tro | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen — "Skydda din investering" antar att kunden redan tror på slitaget | okänd |
| Positionering | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | mot att låta motorn stå bar, inte mot annat skydd | okänd |
| Brådska | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "redan idag" — mjuk, ingen påhittad deadline | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 24 kr, 0 köp, hook rate 22 % — lägst i PD_1-serien; H3 (31 %) fick spenden, H1 och H2 svalt; samma kropp, tre öppningar, ingen lönsam.

**Nästa annonser:**
- SLÄPP — PD_1-kroppen släpps (se PD_1_H3).

### Lärdom L-120250230020440291 — Batmotor_BF_11_1 (LOSER, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 23 kr / 16 662 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 3,18 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** BOF garanti — "Ingen risk för dig" · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch 2026-09-15 (batch-log: "30 dagars öppet köp, Klarna")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Är du inte nöjd inom 30 dagar skickar du bara tillbaka skyddet. / Risken ligger hos oss, inte hos dig. / 579 kr just nu, ordinarie pris 965 kr."
- Rubrik (live): "Ingen risk för dig" · beskrivning: "579 kr · öppet köp 30 dagar"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom) ⚠️ "30 dagar" stämmer inte med sidans 14 dagars ångerrätt (2026-09-23)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (BOF) | ingen person | okänd |
| Vinkel | garanti | garanti | ja |
| Medvetandenivå | produktmedveten | produktmedveten | ja |
| Mekanism | — (BOF) | ingen | okänd |
| Tro | "tänk om" | "risken ligger hos oss" | ja |
| Positionering | — (BOF) | ingen | okänd |
| Brådska | ingen | "just nu" — mjuk, ingen deadline | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 23 kr, 0 köp — garanti-BOF får ingen leverans (fjärde exekveringen), se BF_2_1.

**Nästa annonser:**
- SLÄPP — garanti-BOF är uttömd och policyraden stämmer inte längre.

### Lärdom L-120250024533740291 — Batmotor_GT_1_H1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-31 – 2026-09-06 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 23 kr / 11 721 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,67 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | 50 % / 13 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** GT gift/present, lanseringens GT-manus hook 1 · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen 2026-08-31 (brief inte i repot)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26, identisk med GT_1_H2/H3, GT_2_1): "Vet du inte vad du ska ge honom som lever för sin båt? 🎁 / Jag hittade äntligen en present han faktiskt kommer använda – inte bara lägga i en låda. / Något som visar att jag tänkte på precis det han bryr sig om. / Se hans ansikte lysa upp när han öppnar den. Det är den känslan som gör det värt det. 👉 Ge honom presenten han inte visste att han behövde."
- Rubrik (live): "Den perfekta presenten till honom"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | presentköparen ("ge honom som lever för sin båt") — partnern, inte båtägaren | okänd |
| Vinkel | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | gift/present: "en present han faktiskt kommer använda" | okänd |
| Medvetandenivå | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | omedveten om produkten: ordet skydd nämns aldrig i primärtexten | okänd |
| Mekanism | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen — produkten beskrivs inte alls, bara känslan | okänd |
| Tro | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "presenter hamnar i en låda" bemöts med "faktiskt kommer använda" | okänd |
| Positionering | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | mot andra presenter, inte mot andra skydd | okänd |
| Brådska | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 23 kr, 0 köp trots hook rate 50 % och hold 13 % (på ett fåtal visningar) — de som såg tittade, men Meta hittade ingen köpande publik för present i augusti; tillfället saknas.

**Nästa annonser:**
- SLÄPP nu — presentvinkeln parkeras till fars dag-fönstret (se GT_1_H3).

### Lärdom L-120250024542500291 — Batmotor_PD_1_H2 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-31 – 2026-09-06 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 21 kr / 11 721 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,67 |
| Konverteringsgrad | 0,0 % (0 köp / 2 LPV) |
| Hook rate / hold rate | 38 % / 12 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** PD problem/skada, lanseringens PD-manus hook 2 · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen 2026-08-31 (brief inte i repot)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26, identisk med PD_1_H1/H3): "Din motor står ute i regn, sol och salt luft – varje dag. 🌧️ / Med tiden sliter det hårt på utombordaren. / Båtmotorskydd 420D skyddar mot: ✅ Regn och fukt ✅ Sol och UV-strålar ✅ Damm och smuts / Kraftigt 420D Oxford-tyg. Enkelt att sätta på – bara dra över motorn. / Skydda din investering redan idag. 👉 Beställ ditt Båtmotorskydd nu."
- Rubrik (live): "En motor som håller längre"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | utombordarägare vars motor "står ute … varje dag" — ingen person, ingen scen | okänd |
| Vinkel | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | problem/skada: "sliter det hårt på utombordaren" → tre ✅-punkter regn/fukt, sol/UV, damm/smuts | okänd |
| Medvetandenivå | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | problemmedveten: öppnar på vädret, produkten kommer i rad 3 | okänd |
| Mekanism | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "Kraftigt 420D Oxford-tyg. Enkelt att sätta på – bara dra över motorn" — material + handgrepp | okänd |
| Tro | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen — "Skydda din investering" antar att kunden redan tror på slitaget | okänd |
| Positionering | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | mot att låta motorn stå bar, inte mot annat skydd | okänd |
| Brådska | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "redan idag" — mjuk, ingen påhittad deadline | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 21 kr, 0 köp, hook rate 38 % — bättre hook än H3 men ingen leverans; CBO:n valde H3 av de tre och lät H1/H2 svälta, så H2:s öppning är oprövad snarare än dålig — men kroppen är PD_1:s, och den föll.

**Nästa annonser:**
- SLÄPP — PD_1-kroppen släpps (se PD_1_H3).

### Lärdom L-120250147714760291 — Batmotor_BF_7_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 16 kr / 4 809 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 4,36 |
| Konverteringsgrad | 0,0 % (0 köp / 2 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** BOF pris/erbjudande, andra exekveringen · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #3 2026-09-08 (Extra BOF-serie)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "579 kr istället för 965 kr – spara 386 kr. / 420D Oxford-tyg, 9 storlekar, 0–350 hk. / Betala med Klarna."
- Rubrik (live): "579 kr (ord. 965 kr) – spara 386 kr" · beskrivning: "Betala med Klarna"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (BOF) | ingen person | okänd |
| Vinkel | pris | pris | ja |
| Medvetandenivå | produktmedveten | produktmedveten | ja |
| Mekanism | — (BOF) | ingen | okänd |
| Tro | — (BOF) | Klarna | okänd |
| Positionering | mot ordinarie pris | mot 965 kr | ja |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 16 kr, 0 köp — pris-BOF utan brådska, se BF_1_1.

**Nästa annonser:**
- SLÄPP — pris-BOF är uttömd.

### Lärdom L-120250065179450291 — Batmotor_LI_1_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-02 – 2026-09-08 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 9 kr / 14 177 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,97 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** LI listicle, 5 verifierade fakta · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (batch-log: "Listicle, 5 verifierade fakta — inga adjektiv, bara specs")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "5 saker skyddet gör: / 1. Täcker hela motorn, kåpa till rigg. / 2. 420D Oxford-tyg mot regn, snö och UV. / 3. 9 storlekar, 0–5 hk till 250–350 hk. / 4. Monteras utan verktyg. / 5. 30 dagars öppet köp. / 579 kr."
- Rubrik (live): "5 saker skyddet gör"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (batch #1) | ingen person | okänd |
| Vinkel | listicle/specs | exakt | ja |
| Medvetandenivå | produktmedveten | produktmedveten | ja |
| Mekanism | fem fakta | fem fakta | ja |
| Tro | — (ingen) | ingen | okänd |
| Positionering | — (ingen) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 9 kr — en lista med fem specs som bild ger Meta ingen hook att leverera på; specs säljer först när någon redan tittar (SP_1:s bullets i mitten av videon).

**Nästa annonser:**
- SLÄPP — hooken föll för Meta; ingen ABO, ingen iteration.

### Lärdom L-120250125793010291 — Batmotor_UG_2_H1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-07 – 2026-09-13 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 9 kr / 7 735 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,35 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 40 % / 4 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** UG UGC talking-head, andra konceptet · **Typ:** IM · **Parent:** Batmotor_UG_1_H1 · **Iteration:** 1 · **Källa:** batch #2 2026-09-05 (batch-log: "UG_1_H1 fortfarande i produktion — ger formatet en andra chans till data")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "8 recensioner. Alla 5 stjärnor. / Jag drog skyddet över motorn och spände remmen. Klart – inga verktyg. / 420D Oxford-tyg som suttit en hel säsong, i regn och sol."
- Rubrik (live): "8 av 8 recensioner – 5 stjärnor" · beskrivning: "579 kr, ingen kod behövs"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | UGC talking-head | jag-form ("Jag drog skyddet över motorn") — talking-head | ja |
| Vinkel | UGC med proof points | öppnar på recensionssiffran, sedan handgreppet | okänd |
| Medvetandenivå | — (taggen saknas) | lösningsmedveten | okänd |
| Mekanism | — (taggen saknas) | dra över, spänn remmen | ja |
| Tro | — (taggen saknas) | "håller det en säsong?" → "suttit en hel säsong" | okänd |
| Positionering | — (taggen saknas) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 9 kr trots hook rate 40 % på de få som såg — Meta lät UG_2 svälta bredvid UG_1_H1 (samma format, samma vecka, 803 kr) och SP_1_H5 (samma handgrepp); två UGC-videor i samma CBO-vecka betyder att en dör.

**Nästa annonser:**
- SLÄPP — UGC-formatet bärs av `Batmotor_UG_1_H1` (lönsam dag 14) och `UG_3_H1` (live 2026-09-23); ingen ABO.

### Lärdom L-120250126119630291 — Batmotor_SP_1_H6 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-07 – 2026-09-13 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 8 kr / 7 735 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,35 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 23 % / 2 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** SP_1-kroppen, hook 6: problem-först "regn, sol och salt sliter" · **Typ:** I · **Parent:** Batmotor_SP_1_H1 · **Iteration:** hook 6 · **Källa:** batch #2 2026-09-05 (batch-log: "kombinerar PD_1_H3:s problemramning med SP:s bevisade kropp")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Regn, sol och salt sliter på motorn varje dag. Båtmotorskydd 420D i kraftigt Oxford-tyg täcker hela motorn och spänns fast vid kaj. 579 kr istället för 965 kr – Bäverbutiken.se" ⚠️ Butikens namn i copyn (regeln 2026-09-18); live, rörs inte
- Rubrik (live): "579 kr: skydd mot regn, sol, salt"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | samma som SP_1_H1 | ingen person | okänd |
| Vinkel | problem-först på SP_1-kroppen | problem-först — men kroppen är EN mening, inte SP_1:s bullets | nej |
| Medvetandenivå | problemmedveten | problemmedveten | ja |
| Mekanism | — (samma manus) | "spänns fast vid kaj" | okänd |
| Tro | — (samma manus) | ingen | okänd |
| Positionering | — (samma manus) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** ja · utford_som_briefad: nej

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 8 kr, hook rate 23 % — gick live samma dag som SP_1_H5 (handgreppet, 37 %), och CBO:n valde H5; dessutom är primärtexten inte SP_1-kroppen utan en hopklämd mening, så testet av "problem-först på vinnarens kropp" utfördes aldrig — det görs nu av `SP_1_H14`.

**Nästa annonser:**
- SLÄPP — idén (problemdel före SP_1-kroppen) är `Batmotor_SP_1_H14` (live 2026-09-25); ingen ABO för H6.

### Lärdom L-120250229991810291 — Batmotor_CS_8_1 (INGEN_LEVERANS, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 6 kr / 16 662 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 3,18 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** CS CS_2_1:s prisformat med ny uppställning, statisk · **Typ:** I · **Parent:** Batmotor_CS_2_1 · **Iteration:** 4 · **Källa:** batch 2026-09-15 (batch-log: "CS_2_1:s prisformat (CPA 180) med ny uppställning, samma äkta 579/965 kr — layouten, erbjudandet låst")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "579 kr. Du sparar 386 kr mot ordinarie pris 965 kr — 40 %. / Skyddet ligger kvar över kåpan medan båten ligger vid bryggan. / 30 dagars öppet köp. Trygg betalning med Klarna."
- Rubrik (live): "579 kr. Spara 386 kr (40 %)" · beskrivning: "Spara 386 kr, nu 579 kr"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | samma som CS_2_1 | ingen person | okänd |
| Vinkel | prisformat, ny layout | pris | ja |
| Medvetandenivå | produktmedveten | produktmedveten | ja |
| Mekanism | — (ingen) | ingen | okänd |
| Tro | — (taggen saknas) | öppet köp, Klarna | okänd |
| Positionering | mot ordinarie pris | mot 965 kr | ja |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 6 kr — fjärde ärliga priskopian, ingen leverans; se CS_2_1: det verkar vara brådskan Meta köper, inte layouten.

**Nästa annonser:**
- SLÄPP — hooken föll för Meta; CS_2_1-familjen är vid taket (punkt 18), CS_11_1 är sista försöket.

### Lärdom L-120250065304340291 — Batmotor_RV_2_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-02 – 2026-09-08 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 6 kr / 14 177 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,97 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** RV recensionsbild, verbatim citat (Fredrik L.) · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #1 2026-09-02 (Judge.me, verifierat)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "\"Skyddet känns hållbart och är lätt att sätta på.\" – Fredrik L. / Verklig recension, baverbutiken.se. / 5,0 av 5 (8 recensioner). 579 kr." ⚠️ Domänen i copyn; live, rörs inte
- Rubrik (live): "\"Skyddet känns hållbart.\" – Fredrik L."
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (review-bild) | en namngiven kund | okänd |
| Vinkel | recension ordagrant | exakt | ja |
| Medvetandenivå | lösningsmedveten | lösningsmedveten | ja |
| Mekanism | — (ingen) | "lätt att sätta på" | okänd |
| Tro | "är det bra?" | citat + 5,0 | ja |
| Positionering | — (ingen) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 6 kr — recensionsbild, ingen leverans, som alla åtta; samma citat i RV_1_H1 (video) gav CPA 153 kr mot break-even-CPA 393 kr.

**Nästa annonser:**
- SLÄPP alla recensionsbilder — regeln under RV_1_H1.

### Lärdom L-120250147257090291 — Batmotor_BF_8_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 5 kr / 4 809 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 4,36 |
| Konverteringsgrad | 0,0 % (0 köp / 1 klick) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** BOF garanti, tredje exekveringen · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #3 2026-09-08 (batch-log: "Garanti (30 dagars öppet köp, Klarna)")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Passar skyddet inte din motor? / Skicka tillbaka det inom 30 dagar. / Betalning med Klarna."
- Rubrik (live): "30 dagars öppet köp" · beskrivning: "Betalning med Klarna"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom) ⚠️ "30 dagar" stämmer inte med sidans 14 dagar (2026-09-23)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (BOF) | ingen person | okänd |
| Vinkel | garanti | garanti | ja |
| Medvetandenivå | produktmedveten | produktmedveten | ja |
| Mekanism | — (BOF) | ingen | okänd |
| Tro | "passar den?" | "skicka tillbaka" | ja |
| Positionering | — (BOF) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 5 kr — garanti-BOF, ingen leverans (se BF_2_1).

**Nästa annonser:**
- SLÄPP — hooken föll för Meta; garanti-BOF är uttömd.

### Lärdom L-120250230030970291 — Batmotor_RV_9_1 (INGEN_LEVERANS, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 5 kr / 16 662 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 3,18 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** RV recensionsbild, Mikael Svensson (omskrivet till tredje person) · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch 2026-09-15 (batch-log: "ordagrant citat, Mikael Svensson")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Mikael Svensson satte skyddet på sin egen båtmotor och testade det på riktigt. / Han tyckte det kändes starkt och satt bra, inte löst eller skevt. / 579 kr, med 30 dagars öppet köp om det inte stämmer för dig." ⚠️ Briefen sa ordagrant citat ("Känns starkt och sitter bra på motorn.") — live-copyn är omskriven i tredje person med tillägg ("testade det på riktigt", "inte löst eller skevt") som recensionen inte säger
- Rubrik (live): "Verifierad kundrecension" · beskrivning: "579 kr · 30 dagars öppet köp"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (review-bild) | en namngiven kund i tredje person | okänd |
| Vinkel | recension ORDAGRANT | omskriven, inte ordagrant | nej |
| Medvetandenivå | lösningsmedveten | lösningsmedveten | ja |
| Mekanism | — (ingen) | ingen | okänd |
| Tro | "är det bra?" | ett omskrivet omdöme | nej |
| Positionering | — (ingen) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** ja · utford_som_briefad: nej

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 5 kr — recensionsbild utan leverans som de andra sju; dessutom föll utförandet (citatet omskrivet mot regeln "verbatim, aldrig omskrivna" i dna.md), så även med leverans hade den inte fått räknas.

**Nästa annonser:**
- SLÄPP alla recensionsbilder — regeln under RV_1_H1; omskrivna citat ska dessutom aldrig godkännas i granskningen.

### Lärdom L-120250289595490291 — Batmotor_CS_10_1 (INGEN_LEVERANS, etikett 2026-09-26)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-19 – 2026-09-25 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 4 kr / 25 389 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,04 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** CS CS_2_1:s prislayout med ärlig rubrik, statisk · **Typ:** I · **Parent:** Batmotor_CS_2_1 · **Iteration:** 5 · **Källa:** batch #4 2026-09-18 (batch-log: "CS_2_1:s prislayout med ärlig rubrik — rubriken")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Spara 386 kr på båtmotorskyddet. 965 kr blir 579 kr — samma skydd till lägre pris. Tyget är 420D Oxford och täcker motorn hela vägen ner."
- Rubrik (live): "Spara 386 kr på båtmotorskyddet."
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | samma som CS_2_1 | ingen person | okänd |
| Vinkel | prislayout, ärlig rubrik | pris, ärligt | ja |
| Medvetandenivå | produktmedveten | produktmedveten | ja |
| Mekanism | — (ingen) | 420D, täcker hela vägen ner | okänd |
| Tro | — (ingen) | ingen | okänd |
| Positionering | mot ordinarie pris | mot 965 kr | ja |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 4 kr — femte ärliga priskopian, ingen leverans; CS_2_1-familjen har passerat taket (punkt 18) och svaret är detsamma varje gång.

**Nästa annonser:**
- SLÄPP — hooken föll för Meta; CS_2_1-familjen stängs efter `Batmotor_CS_11_1`:s etikett.

### Lärdom L-120250147263960291 — Batmotor_RV_7_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 kr / 4 809 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 4,36 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** RV recensionsbild, verbatim citat (Daniel Lindberg) · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #3 2026-09-08 (Judge.me)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "\"Gör jobbet bra och motorn hålls ren.\" / – Daniel Lindberg / 579 kr istället för 965 kr."
- Rubrik (live): "\"Motorn hålls ren\" – Daniel L." · beskrivning: "579 kr istället för 965 kr"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (review-bild) | en namngiven kund | okänd |
| Vinkel | recension ordagrant | exakt | ja |
| Medvetandenivå | lösningsmedveten | lösningsmedveten | ja |
| Mekanism | — (ingen) | ingen | okänd |
| Tro | "är det bra?" | citat | ja |
| Positionering | — (ingen) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 1 kr — recensionsbild, ingen leverans (8 av 8).

**Nästa annonser:**
- SLÄPP alla recensionsbilder — regeln under RV_1_H1.

### Lärdom L-120250229959640291 — Batmotor_RV_8_1 (INGEN_LEVERANS, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 kr / 16 662 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 3,18 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** RV recensionsbild, verbatim citat (Anders Nilsson) + produktfakta · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch 2026-09-15 (batch-log: "ordagrant citat, Anders Nilsson")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "\"Skyddet passar bra och håller motorn ren.\" – Anders Nilsson, recension på baverbutiken.se / Skyddet täcker hela kåpan, ner över riggen — inte bara toppen. / 420D Oxford-tyg. Dra över, spänn remmen. Inga verktyg. / 579 kr · 30 dagars öppet köp." ⚠️ Domänen i copyn; live, rörs inte
- Rubrik (live): "Håller motorn ren, säger Anders" · beskrivning: "579 kr · 30 dagars öppet köp"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (review-bild) | en namngiven kund | okänd |
| Vinkel | recension ordagrant | exakt + produktfakta | ja |
| Medvetandenivå | lösningsmedveten | lösningsmedveten | ja |
| Mekanism | — (ingen) | kåpa till rigg, dra över, spänn remmen | okänd |
| Tro | "är det bra?" | citat | ja |
| Positionering | — (ingen) | mot "bara toppen" | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 1 kr — recensionsbild, ingen leverans; samma citat som RV_6_1 (1 kr) tre dagar tidigare — två bilder på samma citat i samma CBO.

**Nästa annonser:**
- SLÄPP alla recensionsbilder — regeln under RV_1_H1; samma citat ska aldrig briefas två gånger.

### Lärdom L-120250147525600291 — Batmotor_BF_9_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 kr / 4 809 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 4,36 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** BOF invändning: presenning vs. skräddarsytt skydd · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #3 2026-09-08 (batch-log: "Ny objection, bara verifierade egna produktfakta")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "Ingen presenning. / 420D Oxford-tyg i 9 storlekar, 0–5 hk till 250–350 hk. / Dras över och spänns fast – inga verktyg."
- Rubrik (live): "Inte en presenning. Ett format skydd." · beskrivning: "Dras över, spänns fast – inga verktyg"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (BOF) | ingen person | okänd |
| Vinkel | invändning: presenning | exakt | ja |
| Medvetandenivå | produktmedveten | produktmedveten | ja |
| Mekanism | 9 storlekar, spänns fast | 9 storlekar, dras över, spänns fast | ja |
| Tro | "en presenning räcker" | "Inte en presenning. Ett format skydd." | ja |
| Positionering | mot presenning | mot presenning | ja |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 1 kr — presenningsinvändningen kommer inte ur kommentarerna (matrisen säger skepsis och fukt), så den svarar på något ingen frågade; storleksinvändningen (BF_3_1, BF_12_1) levererar eftersom kunden faktiskt undrar över passformen.

**Nästa annonser:**
- SLÄPP — hooken föll för Meta och invändningen saknar belägg i kommentarerna; invändningar briefas ur matrisen (`Batmotor_OB_1_1` skepsis, `OB_2_1` fukt när mekanism finns).

### Lärdom L-120250147712920291 — Batmotor_RV_6_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 kr / 4 809 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 4,36 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** RV recensionsbild, verbatim citat (Anders Nilsson) · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #3 2026-09-08 (Judge.me)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "\"Skyddet passar bra och håller motorn ren.\" / – Anders Nilsson / 579 kr istället för 965 kr."
- Rubrik (live): "\"Håller motorn ren\" – Anders N." · beskrivning: "579 kr istället för 965 kr"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (review-bild) | en namngiven kund | okänd |
| Vinkel | recension ordagrant | exakt | ja |
| Medvetandenivå | lösningsmedveten | lösningsmedveten | ja |
| Mekanism | — (ingen) | ingen | okänd |
| Tro | "är det bra?" | citat | ja |
| Positionering | — (ingen) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 1 kr — recensionsbild, ingen leverans (8 av 8); citatet briefades dessutom om som RV_8_1 en vecka senare, med samma utfall.

**Nästa annonser:**
- SLÄPP alla recensionsbilder — regeln under RV_1_H1.

### Lärdom L-120250024534870291 — Batmotor_GT_1_H2 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-08-31 – 2026-09-06 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 11 721 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,67 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 50 % / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** GT gift/present, lanseringens GT-manus hook 2 · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** lanseringsbatchen 2026-08-31 (brief inte i repot)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26, identisk med GT_1_H1/H3): "Vet du inte vad du ska ge honom som lever för sin båt? 🎁 / Jag hittade äntligen en present han faktiskt kommer använda – inte bara lägga i en låda. / Något som visar att jag tänkte på precis det han bryr sig om. / Se hans ansikte lysa upp när han öppnar den. Det är den känslan som gör det värt det. 👉 Ge honom presenten han inte visste att han behövde."
- Rubrik (live): "Den perfekta presenten till honom"
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)
- VO: okänd — inte transkriberad (ffmpeg saknas i containern)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | presentköparen ("ge honom som lever för sin båt") — partnern, inte båtägaren | okänd |
| Vinkel | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | gift/present: "en present han faktiskt kommer använda" | okänd |
| Medvetandenivå | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | omedveten om produkten: ordet skydd nämns aldrig i primärtexten | okänd |
| Mekanism | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen — produkten beskrivs inte alls, bara känslan | okänd |
| Tro | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | "presenter hamnar i en låda" bemöts med "faktiskt kommer använda" | okänd |
| Positionering | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | mot andra presenter, inte mot andra skydd | okänd |
| Brådska | — (lanseringsbatchen, briefen ligger i Product test center i Notion, inte i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 0 kr — tre GT-hookar i samma CBO-vecka, Meta valde H3 och lät H1/H2 stå utan visningar; presentvinkeln utanför säsong, se GT_1_H3.

**Nästa annonser:**
- SLÄPP nu — presentvinkeln parkeras till fars dag-fönstret (se GT_1_H3).

### Lärdom L-120250289863700291 — Batmotor_RV_11_1 (INGEN_LEVERANS, etikett 2026-09-26)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-19 – 2026-09-25 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 25 389 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,04 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** RV recensionsbild, verbatim citat (Thomas Eriksson) · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #4 2026-09-18 (batch-log: "ordagrant citat, Thomas Eriksson" — sista obrukade citatet)


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "\"Bra skydd när båten står ute. Väldigt nöjd.\" — Thomas Eriksson, kund. 420D Oxford-tyg, 579 kr i stället för ordinarie 965 kr."
- Rubrik (live): "Bra skydd när båten står ute."
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (review-bild) | en namngiven kund | okänd |
| Vinkel | recension ordagrant | exakt | ja |
| Medvetandenivå | lösningsmedveten | lösningsmedveten | ja |
| Mekanism | — (ingen) | 420D | okänd |
| Tro | "är det bra?" | citat | ja |
| Positionering | — (ingen) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 0 kr — åttonde recensionsbilden, noll visningar; samma citat bär RV_1_H1 (video, KPI_WINNER) och RV_12_H1 (video, live 2026-09-23).

**Nästa annonser:**
- SLÄPP alla recensionsbilder — regeln under RV_1_H1.

### Lärdom L-120250289801080291 — Batmotor_RV_10_1 (INGEN_LEVERANS, etikett 2026-09-26)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-19 – 2026-09-25 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 25 389 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,04 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** RV recensionsbild, verbatim citat (Peter Andersson) · **Typ:** S · **Parent:** — · **Iteration:** 0 · **Källa:** batch #4 2026-09-18 (batch-log: "ordagrant citat, Peter Andersson")


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live 2026-09-26): "\"Lätt att använda och täcker motorn bra.\" — Peter Andersson, kund. 420D Oxford-tyg, 579 kr i stället för ordinarie 965 kr."
- Rubrik (live): "Lätt att använda och täcker motorn bra."
- Bild: inte tittad (annonsen under 300 kr — bara body/title lästa, ingen dom)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (review-bild) | en namngiven kund | okänd |
| Vinkel | recension ordagrant | exakt | ja |
| Medvetandenivå | lösningsmedveten | lösningsmedveten | ja |
| Mekanism | — (ingen) | 420D | okänd |
| Tro | "är det bra?" | citat | ja |
| Positionering | — (ingen) | ingen | okänd |
| Brådska | ingen | ingen | ja |
**Utförandet föll:** nej · utford_som_briefad: ja

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: 0 kr — recensionsbild, noll visningar; alla åtta citat är nu förbrukade som bilder utan att en enda levererat, och det är formatet, inte citaten.

**Nästa annonser:**
- SLÄPP alla recensionsbilder — regeln under RV_1_H1; nästa recensionsformat kräver nya recensioner OCH video.

