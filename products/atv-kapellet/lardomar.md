# Lärdomar — ATV-Kapellet 3XL 256 × 110 × 120 cm

En per etiketterad annons (docs/os/CS-KLART.md punkt 1–5). Skrivs av `node agent/lardom.mjs --skriv`; varje brief pekar på ett id här (`lardom=L-…`).

### Lärdom L-120250320728410291 — ATVKapell_PD_1_H1 (BREAKTHROUGH, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | BREAKTHROUGH |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 7 336 kr / 9 563 kr (77 %) |
| Köp | 27 |
| ROAS / CPA | 2,52 / 272 kr — kampanjens ROAS 2,05 |
| Konverteringsgrad | 4,1 % (27 köp / 653 LPV) |
| Hook rate / hold rate | 36 % / 14 % |
| Bedömbar | ja |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Din ATV förtjänar bättre än att stå ute och skadas av vädret. 🌧️" · rad 2–4: "✅ Vattentätt, vindtätt och UV-skyddat ✅ Passar de flesta märken – Polaris, Honda, Yamaha, Can-Am ✅ Ingen mer skrapning eller tvätt innan du kör" · rad 5–6: "Dra bara på kapellet och glöm bort vädret. 👉 Beställ ditt ATV-Kapell idag." · rubrik: "Skydda din ATV – hela året"
- Texten är IDENTISK med syskonen PD_1_H2 (26 kr) och PD_1_H3 (770 kr, 1 köp) — bara videons öppning (VO-hooken 0–3 s) skiljer H1 från dem. VO/första frame: inte transkriberad (ffmpeg saknas i containern; adcopy-dokumentet i Drive bär bara texten) — hook rate 36 % / hold rate 14 % ur etikettraden
- ⚠️ Offer-integritet (dna.md FAS 3): "vattentätt, vindtätt, UV-skyddat" och märkeslistan står inte på produktsidan — sidan lovar damm/löv/skräp och måtten 256 × 110 × 120 cm. Vidarebyggen får bara ärva sidans egna löften

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | ATV-ägaren som parkerar ute ("stå ute och skadas av vädret") — dna.md avatar 1, tilltalad som du/din | ja |
| Vinkel | — (brief saknas i repot) | PD (problem → demo): vädret skadar → "Dra bara på kapellet och glöm bort vädret" | ja |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten (öppnar på skadan, presenterar kapellet som lösning) | ja |
| Mekanism | — (brief saknas i repot) | kapellet dras på — "Vattentätt, vindtätt och UV-skyddat" i copyn (⚠️ inte sidans ord) | okänd |
| Tro | — (brief saknas i repot) | "Passar de flesta märken – Polaris, Honda, Yamaha, Can-Am" bemöter "passar den min?"; inga recensioner | ja |
| Positionering | — (brief saknas i repot) | skydd året runt ("Skydda din ATV – hela året"), inget pris i copyn | ja |
| Brådska | — (brief saknas i repot) | mjuk — "Beställ ditt ATV-Kapell idag", ingen deadline, ingen rabatt | ja |
**Utförandet föll:** nej — annonsen är Joshs launchcreative (Product test center-raden "10 ATV-kapell 3XL"), ingen brief i repot; planerat = dna.md FAS 3-teardownen 2026-09-24, som stämmer med den live copyn · utford_som_briefad: okänd

**Diagnos:** Breakthrough: tre iterationer inom 14 dagar, börja i manuslistan (nya hookar → längre problemdel → in media res). Aldrig en ren kopia av top spendern.

**Hypotes (gissning):** Gissning: samma text i H1/H2/H3 och 7 336 kr / 27 köp mot 26 kr respektive 770 kr / 1 köp säger att VO-hooken i H1:s första tre sekunder är den bärande komponenten — hook rate 36 % och hold 14 % håller tittaren till demon, och konverteringsgraden 4,1 % (27 köp / 653 LPV) med CPA 272 kr mot break-even-CPA ~450 kr (AOV 684 kr ÷ 1,52) säger att sidan bär det hooken lovar; vad i öppningen som skiljer går inte att säga förrän videon lästs — det är det första en iteration ska isolera (n = 27, en annons, budgeten höjdes 1 000 → 1 500 kr under fönstret så etiketten är riktig men bärs av EN creative).

**Nästa annonser:**
- `ATVKapell_PD_1_H4` — typ I, parent ATVKapell_PD_1_H1, iteration 1: ny VO-hook (0–3 s) med sidans egna ord (löv, damm och skräp lägger sig på lacken dag efter dag), resten av klippet som H1; enda variabeln är hooken. Copyn byter "vattentätt, vindtätt, UV-skyddat" mot sidans löften (rättar förälderns obelagda rad, som Brief review-regeln säger)
- `ATVKapell_PD_1_H5` — typ I, parent ATVKapell_PD_1_H1, iteration 2: längre problemdel (4–6 s) före kapellet — ATV:n står still mellan turerna, löven lägger sig på lacken, dammet på sätet; sedan H1:s demo
- `ATVKapell_PD_1_H6` — typ I, parent ATVKapell_PD_1_H1, iteration 3: in media res — kapellet dras av i sekund 0, ren ATV under, skräpet ligger på kapellet; problemet berättas efteråt
Not: Alla tre är backlog.md:s vidarebyggen (2026-09-24); numren H4–H6 lästes lediga i kontot 2026-09-29 (kontot bär PD_1_H1–H3, PD_2_1, CS_1–2, G_1–2, SP_1–2; ingen Notion-hub finns än)

### Lärdom L-120250320731270291 — ATVKapell_PD_1_H3 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 770 kr / 9 563 kr (8 %) |
| Köp | 1 |
| ROAS / CPA | 0,75 / 770 kr — kampanjens ROAS 2,05 |
| Konverteringsgrad | 1,6 % (1 köp / 61 LPV) |
| Hook rate / hold rate | 35 % / 11 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Din ATV förtjänar bättre än att stå ute och skadas av vädret. 🌧️" · rubrik: "Skydda din ATV – hela året"
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | PD (problem → demo) enligt namnkoden; copyn: "Din ATV förtjänar bättre än att stå ute och skadas av vädret. 🌧️ ✅ Vattentätt, vindtätt oc…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Din ATV förtjänar bättre än att stå ute och skadas av vädret. 🌧️ ✅ Vattentätt, vindtätt och UV-skyddat ✅ Passar de flest…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ur copyn: "🌧️ ✅ Vattentätt, vindtätt och UV-skyddat ✅ Passar de flesta märken – Polaris, Honda, Yamah…" | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 770 kr och 1 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250320730010291 — ATVKapell_PD_1_H2 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 344 kr / 9 563 kr (4 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,05 |
| Konverteringsgrad | 0,0 % (0 köp / 22 LPV) |
| Hook rate / hold rate | 36 % / 10 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Din ATV förtjänar bättre än att stå ute och skadas av vädret. 🌧️" · rubrik: "Skydda din ATV – hela året"
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | PD (problem → demo) enligt namnkoden; copyn: "Din ATV förtjänar bättre än att stå ute och skadas av vädret. 🌧️ ✅ Vattentätt, vindtätt oc…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Din ATV förtjänar bättre än att stå ute och skadas av vädret. 🌧️ ✅ Vattentätt, vindtätt och UV-skyddat ✅ Passar de flest…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ur copyn: "🌧️ ✅ Vattentätt, vindtätt och UV-skyddat ✅ Passar de flesta märken – Polaris, Honda, Yamah…" | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 344 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250320719810291 — ATVKapell_CS_1_H1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 336 kr / 9 563 kr (4 %) |
| Köp | 1 |
| ROAS / CPA | 1,72 / 336 kr — kampanjens ROAS 2,05 |
| Konverteringsgrad | 5,6 % (1 köp / 18 LPV) |
| Hook rate / hold rate | 51 % / 7 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "🚨 REA PÅ ATV-KAPELL 3XL! 🚨" · rubrik: "24% RABATT – BARA IDAG"
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | CS (pris/kostnadsankare) enligt namnkoden; copyn: "🚨 REA PÅ ATV-KAPELL 3XL! 🚨 Bara 579 kr just nu. Ordinarie pris 759 kr. Det är 24% rabatt, …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "🚨 REA PÅ ATV-KAPELL 3XL! 🚨 Bara 579 kr just nu. Ordinarie pris 759 kr. Det är 24% rabatt, men bara idag. Vi har nästan s…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 579 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ur copyn: "Det är 24% rabatt, men bara idag" | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 336 kr och 1 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250320726150291 — ATVKapell_G_1_H3 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 336 kr / 9 563 kr (4 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,05 |
| Konverteringsgrad | 0,0 % (0 köp / 20 LPV) |
| Hook rate / hold rate | 39 % / 10 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Vad ger man till den som älskar sin ATV mer än allt annat? 🎁" · rubrik: "Presenten han faktiskt blir glad för"
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | G (present) enligt namnkoden; copyn: "Vad ger man till den som älskar sin ATV mer än allt annat? 🎁 Jag hittade det. Och jag ser …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Vad ger man till den som älskar sin ATV mer än allt annat? 🎁 Jag hittade det. Och jag ser redan hans leende framför mig.…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 336 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250320731420291 — ATVKapell_PD_2_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 195 kr / 9 563 kr (2 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,05 |
| Konverteringsgrad | 0,0 % (0 köp / 11 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Din ATV förtjänar bättre än att stå ute och skadas av vädret. 🌧️" · rubrik: "Skydda din ATV – hela året"
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | PD (problem → demo) enligt namnkoden; copyn: "Din ATV förtjänar bättre än att stå ute och skadas av vädret. 🌧️ ✅ Vattentätt, vindtätt oc…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Din ATV förtjänar bättre än att stå ute och skadas av vädret. 🌧️ ✅ Vattentätt, vindtätt och UV-skyddat ✅ Passar de flest…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ur copyn: "🌧️ ✅ Vattentätt, vindtätt och UV-skyddat ✅ Passar de flesta märken – Polaris, Honda, Yamah…" | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 195 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250320724300291 — ATVKapell_G_1_H1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 100 kr / 9 563 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,05 |
| Konverteringsgrad | 0,0 % (0 köp / 10 LPV) |
| Hook rate / hold rate | 34 % / 9 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Vad ger man till den som älskar sin ATV mer än allt annat? 🎁" · rubrik: "Presenten han faktiskt blir glad för"
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | G (present) enligt namnkoden; copyn: "Vad ger man till den som älskar sin ATV mer än allt annat? 🎁 Jag hittade det. Och jag ser …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Vad ger man till den som älskar sin ATV mer än allt annat? 🎁 Jag hittade det. Och jag ser redan hans leende framför mig.…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 100 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250320722140291 — ATVKapell_CS_1_H3 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 48 kr / 9 563 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,05 |
| Konverteringsgrad | 0,0 % (0 köp / 6 LPV) |
| Hook rate / hold rate | 40 % / 9 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "🚨 REA PÅ ATV-KAPELL 3XL! 🚨" · rubrik: "24% RABATT – BARA IDAG"
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | CS (pris/kostnadsankare) enligt namnkoden; copyn: "🚨 REA PÅ ATV-KAPELL 3XL! 🚨 Bara 579 kr just nu. Ordinarie pris 759 kr. Det är 24% rabatt, …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "🚨 REA PÅ ATV-KAPELL 3XL! 🚨 Bara 579 kr just nu. Ordinarie pris 759 kr. Det är 24% rabatt, men bara idag. Vi har nästan s…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 579 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ur copyn: "Det är 24% rabatt, men bara idag" | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 48 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250320725340291 — ATVKapell_G_1_H2 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 45 kr / 9 563 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,05 |
| Konverteringsgrad | 0,0 % (0 köp / 4 LPV) |
| Hook rate / hold rate | 43 % / 7 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Vad ger man till den som älskar sin ATV mer än allt annat? 🎁" · rubrik: "Presenten han faktiskt blir glad för"
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | G (present) enligt namnkoden; copyn: "Vad ger man till den som älskar sin ATV mer än allt annat? 🎁 Jag hittade det. Och jag ser …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Vad ger man till den som älskar sin ATV mer än allt annat? 🎁 Jag hittade det. Och jag ser redan hans leende framför mig.…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 45 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250320720490291 — ATVKapell_CS_1_H2 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 35 kr / 9 563 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,05 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 38 % / 5 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "🚨 REA PÅ ATV-KAPELL 3XL! 🚨" · rubrik: "24% RABATT – BARA IDAG"
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | CS (pris/kostnadsankare) enligt namnkoden; copyn: "🚨 REA PÅ ATV-KAPELL 3XL! 🚨 Bara 579 kr just nu. Ordinarie pris 759 kr. Det är 24% rabatt, …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "🚨 REA PÅ ATV-KAPELL 3XL! 🚨 Bara 579 kr just nu. Ordinarie pris 759 kr. Det är 24% rabatt, men bara idag. Vi har nästan s…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 579 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ur copyn: "Det är 24% rabatt, men bara idag" | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 35 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250320722990291 — ATVKapell_CS_2_1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 18 kr / 9 563 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,05 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "🚨 REA PÅ ATV-KAPELL 3XL! 🚨" · rubrik: "24% RABATT – BARA IDAG"
- Första frame / VO: inte avläst i den här ronden (bilden ej avläst) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — tilltalad som du/din, ingen namngiven person eller scen | okänd |
| Vinkel | — (brief saknas i repot) | CS (pris/kostnadsankare) enligt namnkoden; copyn: "🚨 REA PÅ ATV-KAPELL 3XL! 🚨 Bara 579 kr just nu. Ordinarie pris 759 kr. Det är 24% rabatt, …" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "🚨 REA PÅ ATV-KAPELL 3XL! 🚨 Bara 579 kr just nu. Ordinarie pris 759 kr. Det är 24% rabatt, men bara idag. Vi har nästan s…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris 579 kr i copyn | okänd |
| Brådska | — (brief saknas i repot) | ur copyn: "Det är 24% rabatt, men bara idag" | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 18 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

## Damasker Vandring (120250009391470291)

