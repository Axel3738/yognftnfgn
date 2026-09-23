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

