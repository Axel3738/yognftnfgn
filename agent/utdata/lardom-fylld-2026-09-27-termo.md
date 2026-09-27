# Lärdomar att skriva — 2026-09-27

6 etiketterade annonser utan lärdom (SE). Fyll varje [FYLL I], spara, kör `node agent/lardom.mjs --skriv <fil>`. En annons är inte klar förrän raden LARDOM finns.

## Termoskyddet för Husbil 211 × 171 cm (120250175763810291)

### Lärdom L-120250301207460291 — Termoskydd_RI_1_H1 (SPEND_WINNER, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | SPEND_WINNER |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 7 100 kr / 16 059 kr (44 %) |
| Köp | 23 |
| ROAS / CPA | 1,86 / 309 kr — kampanjens ROAS 2,08 |
| Konverteringsgrad | 3,5 % (23 köp / 657 LPV) |
| Hook rate / hold rate | 44 % / 15 % |
| Bedömbar | ja |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Första frame (läst 2026-09-27 ur Metas thumbnail, 1080 px): delad ruta — övre halvan en hand som drar undan innanförgardinen och blottar en vindruta full av imma och rinnande droppar; nedre halvan samma hand som håller det kviltade silverskyddet mot vindrutan på en vit husbil i dimmig skog, inbränd text "Två månar." (sic — ska vara "Två mornar")
- Primärtext rad 1 (live 2026-09-27): "Två mornar. En med imma. En utan." · rad 2: "Den ena torkar du rutan med samma trasa som igår. Den andra satte du skyddet i dörrkarmen kvällen innan – och vaknade utan imma att torka bort." · rad 3: "559 kr, ordinarie 932 kr."
- Rubrik (live): "Två mornar. En med imma. En utan." · beskrivning: ingen
- VO: okänd — videon är inte transkriberad (hook rate 44 %, hold rate 15 % ur etikettraden)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | husbilsägaren som torkar imma varje morgon (batch-log: "den återkommande kostnaden: torka imma varje morgon mot två minuter en gång") | husbilsagare-som-torkar-imma-varje-dag — handen med trasan mot den immiga rutan är avatarens egen morgon, sedd inifrån hytten | ja |
| Vinkel | RI — återkommande kostnad: daglig syssla mot två minuter en gång | RI: "Två mornar. En med imma. En utan." — kontrasten daglig trasa mot skyddet satt kvällen innan | ja |
| Medvetandenivå | problemmedveten (imman är känd, lösningen inte) | problemmedveten — copyn börjar i imman, inte i produkten | ja |
| Mekanism | skyddet sitter utanpå glaset, sätts i dörrkarmen (sidans rad) | "satte du skyddet i dörrkarmen kvällen innan – och vaknade utan imma" + bilden av skyddet utanpå rutan | ja |
| Tro | att imman är oundviklig / att innanförgardinen räcker | gardinen som dras undan i övre halvan ÄR trosbarriären (innanför räcker inte) — bemöts i bild, inte i text | ja |
| Positionering | två-minuters-jobb i stället för daglig syssla | samma — "samma trasa som igår" mot "kvällen innan" | ja |
| Brådska | ingen | ingen — priset står utan deadline | ja |
**Utförandet föll:** nej · utford_som_briefad: okänd

**Diagnos:** Spend winner: läs FÖRST kommentarerna på annonsen (node tools/annonskommentarer.mjs --annons <id>) — vad invänder publiken mot? Sedan konverteringsgraden, sedan manuset. Saknas tro, brådska, insats eller funnel-kongruens? Lägg bara till den delen, bygg inte om hela annonsen.

**Hypotes (gissning):** Gissning: den delade första bildrutan visar smärtan (imma, trasan) och lösningen (skyddet utanpå) i samma sekund, så tittaren slipper tro på en text — det är därför den tog 44 % av kampanjens spend första veckan med konverteringsgrad 3,5 % (23 köp / 657 LPV), högre än CS_3:s 2,6 %; att den blev SPEND_WINNER och inte BREAKTHROUGH sitter i ROAS 1,86 mot kampanjens 2,08 (CPA 309 kr mot break-even 347 kr — plus, men tunt): den köper trafik brett (hook 44 %) och hold rate 15 % säger att kroppen efter öppningen tappar folk innan priset. Kommentarerna på annonsen lästa 2026-09-27: 0 kommentarer — ingen invändning att svara på, så det som saknas är inte tro utan hold (manuset efter sekund 3).

**Nästa annonser:**
- `Termoskydd_RI_1_H2` — typ I, parent Termoskydd_RI_1_H1, iteration 1 av 3: längre problemdel — öppningen behålls (delad ruta), men sekund 3–8 stannar i den immiga morgonen (trasan, klockan, kaffet som kallnar) INNAN skyddet visas; enda variabeln är problemdelens längd (hold rate 15 % är det som ska upp)
- `Termoskydd_RI_1_H3` — typ I, parent Termoskydd_RI_1_H1, iteration 2 av 3: in media res — klippet börjar med skyddet som redan sitter i dörrkarmen i gryningen och rutan bakom som är torr, imman berättas i efterhand; samma copy
- `Termoskydd_RI_2_1` — typ S (statisk validering), parent Termoskydd_RI_1_H1: den delade rutan som stillbild med rubriken "Två mornar. En med imma. En utan." (rättstavat) — testar om kontrasten bär utan rörelse, som CS_3 gjorde

### Lärdom L-120250301214840291 — Termoskydd_SP_4_H1 (KPI_WINNER, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 144 kr / 16 059 kr (7 %) |
| Köp | 9 |
| ROAS / CPA | 5,03 / 127 kr — kampanjens ROAS 2,08 |
| Konverteringsgrad | 12,3 % (9 köp / 73 LPV) |
| Hook rate / hold rate | 33 % / 9 % |
| Bedömbar | ja |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Första frame (läst 2026-09-27 ur Metas thumbnail, 1080 px): vit husbil (Fiat Ducato-front) i solig glänta med det kviltade silverskyddet monterat över vindrutan och sidorutorna, inbränd text "211 gånger 171 centimeter"
- Primärtext rad 1 (live 2026-09-27): "211 × 171 cm. 90 cm sidflikar." · rad 2: "Skyddet täcker vindrutan och båda sidorutorna, och flikarna kläms fast i dörrkarmen utan att någon dörr öppnas." · rad 3: "Kupén blir inte 30 grader av morgonsolen. 559 kr (ord. 932 kr), fri frakt."
- Rubrik (live): "211 × 171 cm. 90 cm sidflikar." · beskrivning: ingen
- VO: okänd — videon är inte transkriberad (hook rate 33 %, hold rate 9 % ur etikettraden)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | husbilsägaren som tvekar på om skyddet passar (batch-log: spec-proof i stället för social proof) | husbilsägare som redan vet vad produkten är och vill veta måtten — bilden är produkten på en riktig husbil, texten är måtten | ja |
| Vinkel | SP — proof byggd på mätbara egenskaper i noll-recensionsläget | SP: måtten som bevis (211 × 171, 90 cm flikar) i stället för recensioner | ja |
| Medvetandenivå | produktmedveten | produktmedveten — copyn förklarar inte varför man vill ha ett skydd, bara vad det mäter | ja |
| Mekanism | flikarna kläms fast i dörrkarmen utan att någon dörr öppnas (sidans rad) | "flikarna kläms fast i dörrkarmen utan att någon dörr öppnas" ordagrant | ja |
| Tro | att ett skydd inte passar just min husbil | måtten + bilden på en Ducato-front bemöter passformstvivlet | ja |
| Positionering | spec-proof | spec + värme ("inte 30 grader av morgonsolen") — ⚠️ värmeargumentet är fel säsong i slutet av september (dna.md: sommar är förbjuden säsong), medan kondens/mörker är rätt | nej |
| Brådska | ingen | ingen — men "fri frakt" står i copyn, vilket bryter butiksneutraliteten (speglas till CaraShell) | nej |
**Utförandet föll:** ja · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: måtten som hook sållar bort alla som inte redan letar efter ett skydd — därför hook rate 33 % (kampanjens lägsta bland de bedömbara) men konverteringsgrad 12,3 % (9 köp / 73 LPV) och ROAS 5,03, kampanjens högsta; Meta ger den bara 7 % av spenden för att få klickar, och hold rate 9 % säger att den som inte bryr sig om mått lämnar direkt. Det är en KPI winner av precis det slag diagnosen beskriver: den säljer till den som klickar men vinner inte auktionen — nya öppningar som når problemmedvetna, med samma måttkropp efter sekund 3, är vägen; värmeraden ("30 grader av morgonsolen") är dessutom fel säsong och kan ha kostat leverans i september.

**Nästa annonser:**
- `Termoskydd_SP_4_H2` — typ I, parent Termoskydd_SP_4_H1, iteration 1: ny hook, allt annat lika — öppningen är imman på insidan av rutan i gryningen (problemmedveten ingång), måttkroppen från sekund 3; VO-raden "211 gånger 171 centimeter" flyttas till sekund 3
- `Termoskydd_SP_4_H3` — typ I, parent Termoskydd_SP_4_H1, iteration 1: ny hook — flikarna som kläms i dörrkarmen i närbild (monteringen som första bild), måttkroppen efter
- `Termoskydd_SP_4_H4` — typ I, parent Termoskydd_SP_4_H1, iteration 1: ny hook — mörkläggningen inifrån hytten (svart ruta där ljuset borde vara), måttkroppen efter; värmeraden "30 grader" byts i alla tre mot kondens/mörker (rätt säsong) och "fri frakt" stryks (butiksneutralt)

### Lärdom L-120250301224150291 — Termoskydd_PR_1_H1 (LOSER, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 78 kr / 16 059 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,08 |
| Konverteringsgrad | 0,0 % (0 köp / 2 LPV) |
| Hook rate / hold rate | 41 % / 10 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Vindrutan mörklagd. Båda sidorutorna mörklagda. Ingen ser in. Flikarna kläms i dörrkarmen, så du slipper öppna dörrarna. Skyddet sitter utanpå glaset, och konde" · rubrik: "Vindrutan mörklagd. Ingen ser in."
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under 300 kr eller 3 köp, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | PR (integritet/privatliv) enligt namnkoden; copyn: "Vindrutan mörklagd. Båda sidorutorna mörklagda. Ingen ser in. Flikarna kläms i dörrkarmen," | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Vindrutan mörklagd. Båda sidorutorna mörklagda. Ingen ser in. Flikarna kläms i dörrkarmen, så du slipper öppna dörrarna." | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 77.52 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250301193840291 — Termoskydd_CO_1_H1 (LOSER, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 21 kr / 16 059 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,08 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 33 % / 12 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Gardin innanför. Imma kvar på morgonen. Skyddet sitter utanpå i stället, så rutan aldrig blir kall inifrån. Tätt material stoppar värmen innan den kommer in, oc" · rubrik: "Gardin innanför. Imma kvar."
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under 300 kr eller 3 köp, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | CO (jämförelse mot alternativet) enligt namnkoden; copyn: "Gardin innanför. Imma kvar på morgonen. Skyddet sitter utanpå i stället, så rutan aldrig b" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Gardin innanför. Imma kvar på morgonen. Skyddet sitter utanpå i stället, så rutan aldrig blir kall inifrån. Tätt materia" | okänd |
| Tro | — (brief saknas i repot) | ur copyn: jämförelsen mot alternativet bemöter tron att det gamla sättet räcker | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 21.24 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250301160110291 — Termoskydd_SP_6_H1 (LOSER, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 11 kr / 16 059 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,08 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 52 % / 20 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Samma rastplats. Två morgnar. Den första vaknade jag klockan fyra med solen rakt i rutan. Kvällen innan hade jag klämt fast skyddet i dörrkarmen på två minuter." · rubrik: "Samma rastplats. Två morgnar."
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under 300 kr eller 3 köp, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | SP (situation/proof) enligt namnkoden; copyn: "Samma rastplats. Två morgnar. Den första vaknade jag klockan fyra med solen rakt i rutan. " | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Samma rastplats. Två morgnar. Den första vaknade jag klockan fyra med solen rakt i rutan. Kvällen innan hade jag klämt f" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 11.45 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250301181000291 — Termoskydd_PD_7_H1 (INGEN_LEVERANS, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 kr / 16 059 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,08 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Ingen dörr öppnas. Skyddet läggs över utanpå, och flikarna kläms fast i dörrkarmen. Det håller i blåst utan extra rem. Två minuter, så är det klart." · rubrik: "Ingen dörr öppnas. Klart på 2 min."
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under 300 kr eller 3 köp, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | PD (problem → demo) enligt namnkoden; copyn: "Ingen dörr öppnas. Skyddet läggs över utanpå, och flikarna kläms fast i dörrkarmen. Det hå" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Ingen dörr öppnas. Skyddet läggs över utanpå, och flikarna kläms fast i dörrkarmen. Det håller i blåst utan extra rem. T" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav den 1.3 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.


