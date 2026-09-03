# Kontrollgruppen — alla produkter i kontot klassade

Skriven 2026-09-03. Syfte: karakterisera förlorarna på samma variabler som vinnarna, så att
varje vinnarmönster kan motsägelsetestas mot en kontrollgrupp i stället för att bekräftas av sig självt.

**Källor** (allt annat är min läsning och märks så):
- Meta: `scratchpad/temu/ground-truth.md` (konto MagiBorsten 1867947880635861, date_preset=maximum, kampanjnivå, hämtat 2026-09-03). Spend/köp/CPA/ROAS är citerade rakt av, inte omräknade.
- Shopify: `https://baverbutiken.se/products.json?limit=250`, hämtad 2026-09-03 (173 produkter). Pris, jämförpris, varianter, antal bilder, beskrivning, publiceringsdatum.
- Drive: `LOSERS` (1y8c-…) och `WINNERS` (1752E…) inkl. undermappen `TURNT OFF`, listade 2026-09-03 med `tools/drive-ls.py`.
- `products/products.json` (BE-ROAS för motorhöljet, axelbältet, sätesöverdragaren, strandtofflorna, ai-glasögon, vaggfastet) och `docs/os/SOP-06-produkttest.md` (testregler).
- Batch-sheet #1 (USD-kostnader) via ground-truth.md; omräknat med ECB-kurs 2026-09-01 ur `commission/valutakurs.json` (0,10428 USD/SEK → 9,59 SEK/USD).

**Klassningsregler (från uppdraget):**
- Ingen dom under 300 kr spend **eller** under 3 köp → OSÄKER.
- BEVISAD VINNARE = de tio i ground-truth. LOVANDE = ROAS över BE, ≥3 köp, <10 000 kr spend. FÖRLORARE = ROAS under BE, ≥3 köp, ≥1 000 kr spend.
- BE tas ur kampanjnamnet; saknas det, ur products.json; saknas det också → "okänd". För okänd BE: ROAS under 1,49 (lägsta BE bland Temu-produkterna med känt BE, bortsett från Sneakers 1,19) räknas som FÖRLORARE; ROAS ≥ 1,49 → OSÄKER (BE okänd).
- Härledd kostnad = pris × (1 − 1/BE). Det är allt Axel räknat in i BE (inköp + ev. frakt/avgifter), inte bara Temu-priset.

## 1. Klassningstabell

Spend i kr. "Vårt pris" = Shopify-pris (jämförpris inom parentes). Varianter = antal Shopify-varianter. Drive = mapp där Axel lagt produkten ("—" = ingen mapp).

| Produkt | Klass | Spend | Köp | CPA | ROAS | BE-ROAS | Vårt pris | Härledd kostnad (pris×(1−1/BE)) | Varianter | Drive-mapp |
|---|---|---|---|---|---|---|---|---|---|---|
| **Motorhöljet** (5 kampanjer: huvud 72 235 / Lagerrensingsrea 20 822 / ABO 3 857 / CBO 1 537 / Båtmotorskyddet 420D 6 479) | BEVISAD VINNARE #1 | ~104 900 | ~523 | ~200 | 1,71–3,50 (huvud 1,93) | 1,63 (products.json) / 1,62 (kampanj) | 299 (367); Båtmotorskydd 579 (965) | 116; Båtmotorskydd 222 | 30; Båtmotorskydd 9 | WINNERS (två mappar: Marin Motorhölje 420D + Båtmotorskydd 420D) |
| **Fiskespöhållaren** | BEVISAD VINNARE #2 | 59 100 | 307 | 193 | 2,24 | 1,50 | 289 (inget jmf) | 96 | 1 | WINNERS — mappen heter "Fiskespöhållare_pausad", kampanjen är ACTIVE |
| **Sätesöverdragaren** (+kopia 2 235/3) | BEVISAD VINNARE #3 | 62 441 | 182 | ~343 | 2,15 | 1,47 | 649 (811) | 208 | 4 | WINNERS/TURNT OFF (MOWER-SEAT-GRA) |
| **Strandtofflorna** (+brynis lagris 2 592/7) | BEVISAD VINNARE #4 | 41 377 | 187 | ~221 | 2,10 | 1,70 | 349 (420) | 144 | 36 | WINNERS/TURNT OFF |
| **Axelbältet** (+brynis 2 124/5, ugc 1 021/1) | BEVISAD VINNARE #5 | 50 235 | 158 | ~318 | 1,91 | 1,72 (räknad på 509 kr) | 599 (789) | 251 (213 vid 509 kr) | 1 | WINNERS/TURNT OFF |
| **Bälteslipmaskinen** | BEVISAD VINNARE #6 | 22 774 | 53 | 430 | 2,30 | 1,73 | 909 (1 182) | 384 | 1 | WINNERS |
| **Soptunneklistermärkena** | BEVISAD VINNARE #7 | 9 563 | 73 | 131 | 2,05 | 1,67 | 199 (259) | 80 | 1 | WINNERS |
| **Övervakningskameran** | BEVISAD VINNARE #8 | 10 266 | 29 | 354 | 3,38 | 1,57 | 799 (1 000) | 290 | 1 | WINNERS |
| **Ergonomiska Tofflorna** | VINNARE #9 (koppling länk↔kampanj OSÄKER) — per regel LOVANDE | 7 492 | 31 | 242 | 1,59 | ≈1,51 (batch-sheet 10,9 USD = 105 kr) | 309 (400) | ≈105 | 14 | WINNERS/TURNT OFF ("Tofflor Ergonomiska") |
| **IBC-Tanköverdraget** | BEVISAD VINNARE #10 | 8 642 | 40 | 216 | 2,94 | 1,51 | 489 (636) | 165 | 1 | WINNERS |
| Kranskydd Frost 420D | LOVANDE (över BE, PAUSED) | 7 416 | 28 | 265 | 1,59 | 1,49 | 309 (402) | 102 | 1 | — |
| MC-Kapellet | LOVANDE (ACTIVE) | 7 034 | 36 | 195 | 2,20 | 1,49 | 349 (582) | 115 | 1 | — |
| Cykelshorts Herr | LOVANDE (ACTIVE) | 6 994 | 41 | 171 | 2,18 | 1,68 | 259 (337) | 105 | 6 (storlek) | — |
| Skoreparationslapparna | OSÄKER (BE okänd; ROAS 1,74; PAUSED) | 6 664 | 42 | 159 | 1,74 | okänd | 249 (jmf 248,75 — lägre än priset, datafel) | okänd | 2 (färg) | WINNERS |
| Damasker Vandring | LOVANDE (ACTIVE) | 5 821 | 29 | 201 | 2,76 | 1,60 | 389 (649) | 146 | 18 (färg) | — |
| Surfplattestället | FÖRLORARE (marginell: 1,59 vs 1,67) | 5 505 | 21 | 262 | 1,59 | 1,67 | 310 (400) | 124 | 1 | LOSERS |
| Gravstenspennan | FÖRLORARE (ACTIVE) | 5 376 | 19 | 283 | 1,46 | 1,60 | 269 (538) | 101 | 6 (färg) | — |
| Plyschtofflorna Herr | FÖRLORARE (marginell: 1,46 vs 1,49) | 5 363 | 15 | 358 | 1,46 | 1,49 | 429 (558) | 141 | 5 (storlek) | — |
| AI Smarta Glasögon | OSÄKER (2 köp) — stark förlorarsignal: 4 471 kr för 2 köp, BE-CPA 1 395 | 4 471 | 2 | 2 236 | 0,84 | 1,34 (products.json) | 1 869 (2 336) | 474 | 1 | LOSERS |
| Cargoshortsen (3-pack) | OSÄKER (BE okänd; ROAS 1,63) | 4 324 | 8 | 540 | 1,63 | okänd | 909 (1 136) | okänd | 6 (storlek) | LOSERS |
| Väggfästet (trimmer) | FÖRLORARE (1,64 vs 2,00 — marginalförlorare, inte efterfrågeförlorare) | 3 762 | 9 | 418 | 1,64 | 2,00 (products.json) | 359 (449) | 180 | 1 | LOSERS |
| Gräsklippartäcket | FÖRLORARE (BE okänd; 1,29 under alla kända BE) | 3 537 | 11 | 322 | 1,29 | okänd | 369 (inget jmf) | okänd | 1 | LOSERS |
| Badshorts med Skämttryck | FÖRLORARE | 3 533 | 10 | 353 | 1,29 | 1,62 | 399 (798) | 153 | 20 (4 motiv × 5 storlekar) | LOSERS |
| Magnetfiskesatsen | FÖRLORARE | 3 111 | 10 | 311 | 1,10 | 1,65 (batch-sheet 8,1 USD vid 239 kr ger 1,48) | 279 (inget jmf) | 110 | 1 | LOSERS |
| Golfklubbsborsten | FÖRLORARE (BE okänd; 1,31) | 2 940 | 10 | 294 | 1,31 | okänd | 280 (350) | okänd | 1 | LOSERS |
| Jättefotbollen | FÖRLORARE | 2 697 | 4 | 674 | 0,66 | 1,61 | 379 (493) | 144 | 1 | LOSERS |
| Bordtennisnätet Infällbart | OSÄKER (2 köp) — stark förlorarsignal, ACTIVE | 2 644 | 2 | 1 322 | 0,23 | 1,80 | 309 (476) | 137 | 2 (färg) | — |
| Ståltrådsborsthuvuden | FÖRLORARE (BE okänd; ROAS < 1) | 2 490 | 7 | 356 | 0,96 | okänd | 349 / 399 (236) | okänd | 2 (antal) | LOSERS (STALTRAD-HUVUD) |
| Skotvättpåsen | FÖRLORARE (BE okänd; 1,48 — marginell) | 2 425 | 8 | 303 | 1,48 | okänd | 169 (211) — Drive-SKU; en andra "Skotvättpåse" finns för 359 kr | okänd | 1 | LOSERS (shoe wash bag) |
| Krananslutningen 4-vägs | FÖRLORARE (BE okänd; 1,13) | 2 261 | 7 | 323 | 1,13 | okänd | 289 (350) | okänd | 1 | LOSERS (4 vägs kran) |
| Lastnätet | FÖRLORARE (BE okänd; 1,11) | 2 249 | 6 | 375 | 1,11 | okänd | 399 / 499 (499) | okänd | 2 (storlek) | LOSERS |
| Magnethyllan | OSÄKER (2 köp) — stark förlorarsignal | 2 189 | 2 | 1 095 | 0,68 | 1,62 | 439 (732) | 168 | 2 (färg) | — |
| Lättviktsryggsäcken | OSÄKER (1 köp) — stark förlorarsignal | 2 112 | 1 | 2 112 | 0,35 | okänd | 729 (911) | okänd | 6 (färg) | LOSERS |
| Luffarschacket i Trä | OSÄKER (2 köp) — stark förlorarsignal | 2 088 | 2 | 1 044 | 0,36 | 1,59 | 259 (337) | 96 | 4 (färg) | — |
| Sömnadskitet 104 Delar | FÖRLORARE | 2 081 | 4 | 520 | 0,74 | 1,60 | 329 (428) | 123 | 1 | — |
| Vandringskängor Herr | LOVANDE per regel (1,61 vs 1,60 — 5 köp, i praktiken osäker; PAUSED) | 2 026 | 5 | 405 | 1,61 | 1,60 | 669 (1 338) eller 699 (909) — två Shopify-produkter, kampanjen går inte att knyta till en | 251 / 262 | 7 (storlek) | LOSERS ("Vandringssneakers Herr" — kan även avse Andningsbara Sneakers 349 kr) |
| Golfskoväskan | FÖRLORARE | 1 933 | 4 | 483 | 1,09 | 1,79 (batch-sheet 11 USD vid 309 kr ger 1,52) | 344 (430) | 152 | 1 | LOSERS |
| Uteduschen | OSÄKER (2 köp) — stark förlorarsignal | 1 930 | 2 | 965 | 0,60 | ≈1,51 (batch-sheet 20,4 USD = 196 kr vid 579 kr) | 579 (750) | ≈196 | 1 | LOSERS |
| Liggunderlaget (Sovdyna TPU) | OSÄKER (0 köp) — stark förlorarsignal | 1 829 | 0 | — | 0 | okänd | 709 (886) | okänd | 1 | LOSERS (SOVDYNA-TPU) |
| Kasta & Fånga-settet | OSÄKER (1 köp), ACTIVE | 1 747 | 1 | 1 747 | 0,66 | 1,61 | 419 (545) | 159 | 1 | — |
| Första Hjälpen-Kitet | FÖRLORARE | 1 705 | 5 | 341 | 1,30 | 1,78 | 309 (402) | 135 | 1 | LOSERS |
| Medicinasken i Fickformat | OSÄKER (1 köp), ACTIVE | 1 710 | 1 | 1 710 | 0,29 | 1,60 | 289 (381) | 108 | 2 (färg) | — |
| Herrshortsen (3-pack) | OSÄKER (2 köp) — stark förlorarsignal | 1 651 | 2 | 826 | 0,56 | okänd | 459 (574) | okänd | 5 (storlek) | LOSERS |
| Mattdynorna | FÖRLORARE (BE okänd; ROAS < 1) | 1 569 | 4 | 392 | 0,76 | okänd | 249 (311) | okänd | 1 | LOSERS |
| Bollpannbandet | OSÄKER (2 köp) — stark förlorarsignal | 1 534 | 2 | 767 | 0,35 | 2,03 | 179 (358) | 91 | 2 (färg) | LOSERS |
| Stänkskärmen MTB | FÖRLORARE (BE okänd; 1,10) | 1 487 | 4 | 372 | 1,10 | okänd | 219 (275) | okänd | 1 | LOSERS |
| Trädgårdssäcken | OSÄKER (2 köp) | 1 487 | 2 | 743 | 1,06 | okänd | 199 / 289 / 318 | okänd | 3 (storlek) | LOSERS (TRGSACK) |
| 14-i-1 Verktyget | OSÄKER (2 köp) — stark förlorarsignal | 1 483 | 2 | 742 | 0,54 | 1,63 | 399 (500) | 154 | 1 | LOSERS |
| Kedjeslipen | FÖRLORARE (BE okänd; ROAS < 1) | 1 407 | 4 | 352 | 0,99 | okänd | 249 (311) | okänd | 1 | LOSERS |
| Förtöjningslinan | OSÄKER (2 köp) | 1 368 | 2 | 684 | 0,93 | okänd | 319 (350) | okänd | 1 | LOSERS (Båtlina) |
| Dörrbottenlisten | OSÄKER (1 köp) | 1 210 | 1 | 1 210 | 0,45 | okänd | 319 (415) | okänd | 2 (färg) | LOSERS |
| Mobilskalet | FÖRLORARE | 1 091 | 4 | 273 | 1,17 | 1,79 (batch-sheet 6,8 USD ger 1,42) | 219 (438) | 97 | 18 (modell) | LOSERS |
| Hopfällbara Sågen | OSÄKER (2 köp) | 1 001 | 2 | 500 | 0,80 | 1,79 | 279 (360) | 123 | 1 | LOSERS |
| Linupprullare Aluminium | OSÄKER (1 köp) | 989 | 1 | 989 | 0,30 | 1,83 | 249 (325) | 113 | 1 | LOSERS |
| Mini Fiskespöset | OSÄKER (2 köp, < 1 000 kr) | 839 | 2 | 420 | 1,02 | 1,67 | 429 (560) | 172 | 1 | LOSERS |
| Magnetplattorna i Storformat | OSÄKER (ny 09-03, 1 köp) | 800 | 1 | 800 | — | 1,63 | 469 / 539 (782 / 899) | 181 / 208 | 2 (antal) | — |
| Motocentric Bakväskan 37 L | OSÄKER (ny 09-03, 1 köp) | 557 | 1 | 557 | 1,77 | 1,63 | 989 (1 286) | 382 | 4 (logofärg) | — |
| Sneakers Herr | OSÄKER (aldrig körd, 1 kr) | 1 | 0 | — | — | 1,19 | 699 (1 398) | 112 | 7 (storlek) | LOSERS — klassad förlorare utan data |
| Kamouflagetejpen | OSÄKER (ingen spend) | 0 | 0 | — | — | okänd | 289 (376) | okänd | 1 | — |

**Summering av klassningen:** 10 BEVISAD VINNARE · 5 LOVANDE (Kranskydd, MC-Kapell, Cykelshorts, Damasker, Vandringskängor — plus Ergonomiska Tofflorna om #9 räknas hit) · 20 FÖRLORARE · 24 OSÄKER (varav 14 med ≥1 000 kr spend och ROAS < 0,9 = "stark förlorarsignal" utan formell dom).

**Axels Drive-klassning mot Meta (min listning 2026-09-03):**
- LOSERS har 33 mappar i min listning (ground-truth säger 34). Alla 33 motsvarar en kampanj i ground-truth ("Vandringssneakers Herr" med förbehåll, se tabellen). Alla 20 formella FÖRLORARE utom Gravstenspennan, Plyschtofflorna och Sömnadskitet ligger där. Avvikelser: **Sneakers Herr** ligger i LOSERS med 1 kr spend (klassad utan test); **Vandringskängor** (LOVANDE per regel, 1,61 vs BE 1,60) ligger i LOSERS som "Vandringssneakers Herr"; **Cargoshortsen** (ROAS 1,63, BE okänd) ligger i LOSERS.
- WINNERS: **Skoreparationslapparna** ligger där, men kampanjen är PAUSED, ROAS 1,74 och BE saknas — går inte att bekräfta som vinnare ur Meta. **Fiskespöhållare-mappen heter "_pausad"** trots ACTIVE kampanj med 59 100 kr. `TURNT OFF` innehåller exakt de fyra skalningsprodukterna (Mower seat, Strandtofflor, Axelbälte, Tofflor Ergonomiska) — stämmer med att deras huvudkampanjer är PAUSED.
- **Ingen mapp alls** (15 st): Kranskydd, MC-Kapell, Cykelshorts, Damasker, Gravstenspenna, Plyschtofflor, Bordtennisnät, Magnethylla, Luffarschack, Sömnadskit, Kasta & Fånga, Medicinask, Magnetplattor, Motocentric, Kamouflagetejp. Alla utom Plyschtofflor/Bordtennisnät publicerades i Shopify 2026-08-17 eller senare — Drive-sorteringen släpar efter kontot, det är inte ett medvetet "mittemellan".

## 2. Variabelprofil per produkt

Legend (allt i denna sektion är min bedömning utifrån Shopify-sidan, huvudbilden och produktens natur — inte annonserna, som jag inte sett):
- (a) komplement till dyr ägd sak: 0/1 + vilken; värdeband: dyr > 10 tkr, medel 1–10 tkr, billig < 1 tkr.
- (b) problemet går att visa i bild utan text: 0/1.
- (c) mekanismklass: BP/BL = bekant problem/bekant lösning · BP/NL = bekant problem/ny lösning · DP/BL = dolt problem/bekant lösning · DP/NM = dolt problem/ny mekanism · INGET = ingen problemlösning (nöje/mode/present).
- (d) old way: I = ingenting/improviserat · K = en befintlig köpt produkt eller tjänst.
- (e) storleks-/passformsrisk 0/1 · (f) jämförelsehandlad kategori med märkesvara/lågprisalternativ kunden googlar 0/1 · (g) förtroendekrav (elektronik/hälsa/säkerhet) 0/1 · (h) demonstrerbar på 3 s utan ljud 1–5 · (i) före/efter-kontrast 0/1.
- (j) latent efterfrågan: 1 = behovet måste skapas av annonsen, 0 = aktivt upplevt problem.
- (k) prisband · (l) prisuppslag pris/kostnad = BE/(BE−1), styrs helt av BE · (m) säsong vid launch (Shopify-publicering som proxy): rätt / fel / tidig / sen / ingen.
- (n) målgrupp man 45+ med hus/båt/trädgård 0/1 · (o) skydd av något man redan äger 0/1 · (p) F = förbrukning, V = varaktig · (q) humor/dekoration/lek snarare än funktion 0/1 · (r) kräver app/installation/inlärning 0/1.

### 2a. LOVANDE och FÖRLORARE — variabler (a)–(i)

| Produkt (klass, ROAS/BE) | (a) komplement | (b) syns | (c) mekanism | (d) old way | (e) passform | (f) jämförelse | (g) förtroende | (h) 3 s | (i) före/efter |
|---|---|---|---|---|---|---|---|---|---|
| Ergonomiska Tofflorna (LOV/#9, 1,59/≈1,51) | 0 | 0 — "trötta fötter" syns inte | BP/BL | K (andra tofflor) | 1 (7 storlekar × 2 färger) | 1 (Crocs, Skechers) | 0 | 2 — en toffel | 0 |
| Kranskydd Frost (LOV, 1,59/1,49) | 1 — vattenledning/huset (skadan dyr, kranen billig) | 1 — isig kran (bilden visar exakt det) | BP/BL | I (stänga av vattnet/handduk) | 0 | 1 (kranskydd finns i bygghandeln) | 0 | 4 | 1 |
| MC-Kapellet (LOV, 2,20/1,49) | 1 — MC (dyr) | 1 — kapell på hoj | BP/BL | K (kapell finns överallt) | 1 (en storlek "passar de flesta") | 1 | 0 | 5 | 1 |
| Cykelshorts Herr (LOV, 2,18/1,68) | 1 — cykel (medel–dyr) | 0 — sadelsmärta syns inte | BP/BL | K (andra shorts) | 1 (6 storlekar) | 1 (Craft, Decathlon) | 0 | 2 | 0 |
| Skoreparationslapparna (OSÄKER-BE, 1,74) | 1 — sneakers (medel) | 1 — hålet i hälen, rödmarkerat i bilden | BP/NL (klisterlapp i stället för nya skor) | I (kasta skorna) | 0 | 0 | 0 | 4 | 1 |
| Damasker Vandring (LOV, 2,76/1,60) | 1 — kängor (medel) | 1 — snö/blöt sly | BP/BL | K (damasker är en etablerad kategori) | 0 (en storlek) | 1 (Lundhags m.fl.) | 0 | 4 | 1 |
| Vandringskängor Herr (LOV marg., 1,61/1,60) | 0 | 0 | BP/BL | K | 1 (7 storlekar) | 1 (Merrell, Salomon) | 0 | 2 | 0 |
| Surfplattestället (FÖRL, 1,59/1,67) | 1 — iPad (dyr) | 0 — bilden visar lösningen, inte kaffekoppen | BP/BL | K (ställ för 100–300 kr finns överallt) | 0 | 1 | 0 | 3 | 1 |
| Gravstenspennan (FÖRL, 1,46/1,60) | 1 — gravsten (dyr, familjeägd) | 1 — blekt text | BP/NL (penna i stället för stenhuggare) | K (stenhuggartjänst) | 0 | 0 | 0 (men pietetsrisk) | 4 | 1 — tydligast av alla |
| Plyschtofflorna Herr (FÖRL, 1,46/1,49) | 0 | 0 | BP/BL | K | 1 (5 storlekar) | 1 (Shepherd, Ugg) | 0 | 2 | 0 |
| Väggfästet trimmer (FÖRL, 1,64/2,00) | 1 — trimmer (medel) | 1 — trimmer på golvet vs på väggen | BP/BL | I (lutad mot väggen) | 0 | 1 (redskapskrokar i bygghandeln) | 0 | 4 | 1 |
| Gräsklippartäcket (FÖRL, 1,29/okänd) | 1 — gräsklippare (medel, 2–5 tkr) | 1 — regn på klipparen | BP/BL | I (står i förrådet) | 1 ("passar de flesta") | 1 (täcken i bygghandeln) | 0 | 5 | 1 |
| Badshorts Skämttryck (FÖRL, 1,29/1,62) | 0 | 1 — skämtet syns | INGET | K (vanliga badshorts) | 1 (4 motiv × 5 storlekar) | 1 | 0 | 5 | 0 |
| Magnetfiskesatsen (FÖRL, 1,10/1,65) | 0 | 1 — magneten full av skrot | INGET (ny hobby) | I | 0 | 1 (set för 200–400 kr finns hos flera) | 0 | 4 | 0 |
| Golfklubbsborsten (FÖRL, 1,31/okänd) | 1 — golfklubbor (dyr) | 1 — smuts i spåren | BP/BL | K (borste/handduk i varje golfshop) | 0 | 1 | 0 | 4 | 1 |
| Jättefotbollen (FÖRL, 0,66/1,61) | 0 | 0 — inget problem att visa | INGET (lek) | K (vanlig boll) | 0 | 0 | 0 | 5 | 0 |
| Ståltrådsborsthuvuden (FÖRL, 0,96/okänd) | 1 — trimmer (medel) | 1 — mossa i fogar | BP/NL (stålborste på trimmern) | K (fogskrapa/ogräsättika) | 1 (kompatibilitet med trimmern) | 1 | 1 — ståltråd i 10 000 varv, säkerhet | 5 | 1 |
| Skotvättpåsen (FÖRL, 1,48/okänd) | 1 — sneakers (medel) | 1 — skor i trumman | BP/BL | I (tvättar löst/för hand) | 0 | 1 (tvättpåsar för 30–80 kr) | 0 | 3 | 0 |
| Krananslutningen (FÖRL, 1,13/okänd) | 0 — kran/slang (billig) | 0 — "byta slang" syns inte som problem | BP/BL | K (Gardena-fördelare) | 1 (gänga/kompatibilitet) | 1 (Gardena) | 0 | 4 | 0 |
| Lastnätet (FÖRL, 1,11/okänd) | 1 — släpvagn (medel–dyr) | 1 — last som blåser av | BP/BL | K (spännband/presenning; nät i bygghandeln) | 1 (2 storlekar, passa släpet) | 1 | 1 — lastsäkring på väg | 4 | 0 |
| Sömnadskitet (FÖRL, 0,74/1,60) | 0 | 0 — kitet syns, problemet inte | BP/BL | K (sylåda) | 0 | 1 | 0 | 3 | 0 |
| Golfskoväskan (FÖRL, 1,09/1,79) | 1 — golfskor (medel) | 1 — jord i bagaget | BP/BL | K (plastpåse; golfshop säljer skoväskor — bilden visar märket PGM) | 0 | 1 | 0 | 3 | 0 |
| Första Hjälpen-Kitet (FÖRL, 1,30/1,78) | 0 | 0 | BP/BL | K (apotek/Clas Ohlson) | 0 | 1 | 1 — hälsa; "Temu-plåster" | 2 | 0 |
| Mattdynorna (FÖRL, 0,76/okänd) | 0 — matta (billig–medel) | 1 — mattan glider | BP/BL | K (IKEA-halkskydd) | 0 | 1 (IKEA) | 0 | 4 | 1 |
| Stänkskärmen MTB (FÖRL, 1,10/okänd) | 1 — MTB (dyr) | 1 — lera på ryggen | BP/BL | K (stänkskärm i varje cykelbutik) | 1 (montering/kompatibilitet) | 1 | 0 | 4 | 1 |
| Kedjeslipen (FÖRL, 0,99/okänd) | 1 — motorsåg (medel–dyr) | 0 — slö kedja syns inte | BP/NL (handvevad slip i stället för fil) | K (rundfil/Stihl 2-in-1 — varje sågägare har en) | 1 (kedjedelning) | 1 (Stihl, Oregon) | 0 | 3 | 1 |
| Mobilskalet (FÖRL, 1,17/1,79) | 1 — iPhone (dyr) | 0 | BP/BL | K (alla har redan ett skal) | 1 (18 modeller) | 1 (extremt) | 0 | 3 | 0 |

### 2b. LOVANDE och FÖRLORARE — variabler (j)–(r)

| Produkt | (j) latent | (k) prisband | (l) uppslag | (m) säsong | (n) man 45+ | (o) skydd av ägd | (p) F/V | (q) nöje | (r) app/install/inlärning |
|---|---|---|---|---|---|---|---|---|---|
| Ergonomiska Tofflorna | 0 | 250–500 | ≈2,9× | rätt (aug) | 0 (unisex) | 0 | V | 0 | 0 |
| Kranskydd Frost | 0 (husägare vet) | 250–500 | 3,0× | tidig (launch 20 aug, frost nov) | 1 | 1 | V | 0 | 0 |
| MC-Kapellet | 0 | 250–500 | 3,0× | sen (20 aug; hojsäsongen slutar) | 1 | 1 | V | 0 | 0 |
| Cykelshorts Herr | 0 (sadelsmärta upplevs) | 250–500 | 2,5× | rätt | 0 (sportcyklister) | 0 | V | 0 | 0 |
| Skoreparationslapparna | 1 (man tänker inte på det förrän bilden) | < 250 | okänd | ingen | 0 | 1 | F | 0 | 0 |
| Damasker Vandring | 0 | 250–500 | 2,7× | tidig (25 aug; snö/väta höst–vinter) | 0 (vandrare, båda könen) | 0 | V | 0 | 0 |
| Vandringskängor Herr | 0 | 500–1000 | 2,7× | rätt | 0 | 0 | V | 0 | 0 |
| Surfplattestället | 1 | 250–500 | 2,5× | ingen | 0 (bilden: kvinna, hemmaträning) | 0 | V | 0 | 0 |
| Gravstenspennan | 1 | 250–500 | 2,7× | tidig (allhelgona nov) | 1 (äldre) | 1 | F (färg tar slut) | 0 | 1 (noggrant handarbete) |
| Plyschtofflorna Herr | 0 | 250–500 | 3,0× | **fel** (vintertofflor 20 aug) | 0 | 0 | V | 0 | 0 |
| Väggfästet trimmer | 1 (trimmer på golvet gör inte ont) | 250–500 | 2,0× — lägst i kontot | ingen | 1 | 0 (förvaring) | V | 0 | 1 (skruvas i vägg) |
| Gräsklippartäcket | 1 (de flesta klippare står inne) | 250–500 | okänd | sen/ingen (13 aug) | 1 | 1 | V | 0 | 0 |
| Badshorts Skämttryck | 1 (present) | 250–500 | 2,6× | sen (28 aug) | 0 | 0 | V | 1 | 0 |
| Magnetfiskesatsen | 1 (impuls/ny hobby) | 250–500 | 2,8× | rätt | 0 (familj/yngre) | 0 | V | 1 | 0 |
| Golfklubbsborsten | 0 | 250–500 | okänd | rätt | 1 | 1 | V | 0 | 0 |
| Jättefotbollen | 1 | 250–500 | 2,6× | sen (25 aug) | 0 (barnfamilj) | 0 | V | 1 | 0 |
| Ståltrådsborsthuvuden | 0 | 250–500 | okänd | rätt | 1 | 0 | F (slits) | 0 | 1 (montering/kompatibilitet) |
| Skotvättpåsen | 1 | < 250 | okänd | ingen | 0 | 1 | V | 0 | 0 |
| Krananslutningen | 0 | 250–500 | okänd | rätt | 1 | 0 | V | 0 | 1 (gängor) |
| Lastnätet | 0 | 250–500 | okänd | ingen | 1 | 0 | V | 0 | 0 |
| Sömnadskitet | 1 | 250–500 | 2,7× | ingen | 0 | 0 | V | 0 | 0 |
| Golfskoväskan | 1 | 250–500 | 2,3× | rätt | 1 | 0 (förvaring) | V | 0 | 0 |
| Första Hjälpen-Kitet | 1 (köps sällan spontant) | 250–500 | 2,3× | ingen | 0 | 0 | F | 0 | 0 |
| Mattdynorna | 0 | < 250 | okänd | ingen | 0 | 0 | F (klister) | 0 | 0 |
| Stänkskärmen MTB | 0 | < 250 | okänd | rätt (höstlera) | 0 (MTB, yngre) | 0 | V | 0 | 1 (buntband/montering) |
| Kedjeslipen | 0 | < 250 | okänd | rätt (vedsäsong) | 1 | 1 | V | 0 | 1 (vinkel/inställning) |
| Mobilskalet | 0 | < 250 | 2,3× | ingen | 0 | 1 | V | 0 | 0 |

### 2c. OSÄKER med förlorarsignal (≥ 800 kr spend, ≤ 2 köp) — bara poäng, för känslighetstest

| Produkt | a | b | c | d | e | f | g | h | i | j | k | m | n | o | p | q | r |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AI Smarta Glasögon (0,84, 2 köp) | 0 | 0 | DP/NM (ny kategori) | K (telefonen) | 0 | 1 (Ray-Ban Meta) | 1 | 2 | 0 | 1 | > 1000 | ingen | 0 | 0 | V | 0 | 1 (app) |
| Bordtennisnätet (0,23) | 0 | 1 | BP/NL | K (pingisbord) | 0 | 1 | 0 | 4 | 1 | 1 | 250–500 | ingen | 0 | 0 | V | 1 | 0 |
| Magnethyllan (0,68) | 0 (tvättmaskin — billig komplementkoppling) | 1 | BP/BL | K (hylla) | 0 | 1 (IKEA) | 0 | 4 | 1 | 1 | 250–500 | ingen | 0 (hyresgäst, tvättstuga) | 0 | V | 0 | 0 |
| Lättviktsryggsäcken (0,35) | 0 | 0 | BP/BL | K | 0 | 1 (Fjällräven, Osprey) | 0 | 2 | 0 | 0 | 500–1000 | rätt | 0 | 0 | V | 0 | 0 |
| Luffarschacket (0,36) | 0 | 1 | INGET (dekor/spel) | K | 0 | 0 | 0 | 3 | 0 | 1 | 250–500 | ingen | 0 | 0 | V | 1 | 0 |
| Uteduschen (0,60) | 0 | 1 | BP/NL | I | 0 | 1 | 1 (pump/USB) | 4 | 0 | 1 | 500–1000 | sen (13 aug) | 0 | 0 | V | 0 | 1 |
| Liggunderlaget (0 köp) | 0 | 1 | BP/BL | K (Therm-a-Rest) | 0 | 1 | 0 | 3 | 0 | 0 | 500–1000 | sen | 0 | 0 | V | 0 | 0 |
| Kasta & Fånga (0,66) | 0 | 1 | INGET (lek) | I | 0 | 0 | 0 | 4 | 0 | 1 | 250–500 | sen (29 aug) | 0 | 0 | V | 1 | 0 |
| Medicinasken (0,29) | 0 | 1 | BP/BL | K (apotek, 30 kr) | 0 | 1 | 1 (hälsa) | 3 | 0 | 1 | 250–500 | ingen | 0 | 0 | V | 0 | 0 |
| Herrshortsen 3-pack (0,56) | 0 | 0 | INGET (mode) | K | 1 | 1 | 0 | 1 | 0 | 0 | 250–500 | sen | 0 | 0 | V | 0 | 0 |
| Bollpannbandet (0,35) | 0 | 1 | INGET (lek) | I | 0 | 0 | 0 | 5 | 0 | 1 | < 250 | ingen | 0 | 0 | V | 1 | 0 |
| Trädgårdssäcken (1,06) | 0 | 1 | BP/BL | K (plastsäck) | 0 | 1 | 0 | 3 | 0 | 0 | < 250–250–500 | rätt (höstlöv) | 1 | 0 | V | 0 | 0 |
| 14-i-1 Verktyget (0,54) | 0 | 1 | BP/BL | K (Leatherman) | 0 | 1 | 0 | 3 | 0 | 1 (present) | 250–500 | ingen | 1 | 0 | V | 0 | 0 |
| Förtöjningslinan (0,93) | 1 — båt (dyr) | 1 | BP/NL (elastisk) | K (vanlig tamp) | 0 | 1 | 1 (båten sliter sig) | 3 | 0 | 0 | 250–500 | rätt | 1 | 1 | V | 0 | 0 |
| Dörrbottenlisten (0,45) | 0 | 1 | BP/BL | K (bygghandel 50–100 kr) | 1 (klipps till) | 1 | 0 | 3 | 1 | 0 | 250–500 | tidig (drag = vinter) | 0 | 0 | V | 0 | 1 |
| Hopfällbara Sågen (0,80) | 0 | 1 | BP/BL | K (Bahco Laplander) | 0 | 1 | 0 | 3 | 0 | 0 | 250–500 | ingen | 1 | 0 | V | 0 | 0 |
| Linupprullare (0,30) | 1 — fiskerulle (medel) | 0 | BP/NL | I (pinne mellan knäna) | 0 | 0 | 0 | 3 | 0 | 1 | < 250 | rätt | 1 | 0 | V | 0 | 1 |
| Mini Fiskespöset (1,02) | 0 | 1 | INGET/BP-NL ("spöet hemma") | K (riktigt spö) | 0 | 1 | 0 | 3 | 0 | 1 | 250–500 | rätt | 1 | 0 | V | 1 (gimmick) | 0 |

## 3. Vad förlorarna HAR som vinnarna saknar, och tvärtom

### 3a. Frekvenser — 20 FÖRLORARE mot 10 VINNARE (min bedömning av vinnarna nedan; ground-truth ger siffrorna)

Vinnarnas värden (bedömda på samma sätt): Motorhölje a1 b1 BP/BL I e1(30 var) f0 g0 h5 i1 j0 250–500 rätt n1 o1 V q0 r0 · Fiskespöhållare a1 b1 BP/BL I e0 f0 g0 h4 i1 j1(ordning) 250–500 rätt n1 o0 V q0 r0 · Sätesöverdrag a1 b1 BP/BL I e0 f0 g0 h5 i1 j0 500–1000 rätt n1 o1 V q0 r0 · Strandtofflor a0 b0 BP/BL K e1 f1(Crocs) g0 h3 i0 j0 250–500 rätt n1 o0 V q0 r0 · Axelbälte a1 b1 BP/BL I e0 f0 g0 h4 i1 j0 500–1000 rätt n1 o0 V q0 r0 · Bandslipare a0 b1 BP/NL K e0 f1 g1 h4 i1 j0 500–1000 ingen n1 o0 V q0 r0 · Soptunneklistermärken a0 b1 DP/NL I e0 f0 g0 h5 i1 j1 <250 ingen n1 o0 V q1 r0 · Kamera a1(tomten) b0 BP/BL K e0 f1 g1 h3 i0 j0 500–1000 ingen n1 o1 V q0 r1 · Ergonomiska tofflor a0 b0 BP/BL K e1 f1 g0 h2 i0 j0 250–500 rätt n0 o0 V q0 r0 · IBC a1 b1 DP/BL I e0 f0 g0 h4 i1 j0 250–500 rätt n1 o1 V q0 r0.

| Variabel | FÖRLORARE (n=20) | VINNARE (n=10) | Skiljer den? |
|---|---|---|---|
| (a) komplement till dyr/medel ägd sak = 1 | 12/20 (60 %) | 6–7/10 | **Nej.** Surfplatteställ, Golfborste, Mobilskal, Stänkskärm, Kedjeslip, Lastnät är alla komplement till dyra saker — och förlorade. Komplement är inte tillräckligt. |
| (b) problemet syns i bild = 1 | 10/20 (50 %) | 7/10 | Svagt. Mer vanligt hos vinnare, men hälften av förlorarna har det. |
| (c) BP/BL | 14/20 (70 %) | 7/10 | **Nej.** Samma andel. "Bekant problem/bekant lösning" beskriver hela kontot. |
| (c) INGET problem (nöje/mode/present) | 3/20 (15 %) — Badshorts, Magnetfiske, Jättefotboll; 8/38 (21 %) om OSÄKER-gruppen räknas | 0/10 (Soptunneklistermärkena löser "vilken tunna är min") | Ja, men lågfrekvent. |
| (d) old way = K (köpt produkt/tjänst) | 16/20 (80 %) | 4/10 | Starkt i frekvens, men 4 vinnare (Strandtofflor, Bandslipare, Kamera, Ergonomiska tofflor) bryter det — kan inte vara en killer ensam. |
| (e) storleks-/passformsrisk = 1 | 9/20 (45 %) | 3/10 (Motorhölje 30 varianter, båda tofflorna) | Svagt. Motorhöljets 30 varianter (färg × hk) sålde ändå — hk-storlek vet ägaren utantill. |
| (f) jämförelsehandlad kategori = 1 | 18/20 (90 %) | 4/10 — och det är de fyra svagaste/mest "vanliga" vinnarna | Starkt i frekvens, men 4 vinnare + LOVANDE Cykelshorts (2,18) och Damasker (2,76) har f=1. Nödvändig? Nej. |
| (g) förtroendekrav = 1 | 3/20 (15 %) | 2/10 | **Nej.** |
| (h) demonstrerbar ≥ 4 | 12/20 (60 %) | 7/10 | **Nej.** Jättefotboll, Badshorts, Gräsklippartäcke är 5:or och förlorade. |
| (i) före/efter = 1 | 9/20 (45 %) | 7/10 | Svagt. Gravstenspennan har den tydligaste före/efter-bilden i hela kontot och ligger under BE. |
| (j) latent behov = 1 | **11/20 (55 %)** | 1–2/10 (Soptunneklistermärkena; ev. Fiskespöhållaren) | **Ja.** Bästa enskilda skiljelinjen. LOVANDE-gruppen har j=0 på 5 av 6. |
| (k) pris < 500 kr | 20/20 (100 %) | 6/10 | **Ja, åt ett håll:** inga förlorare över 500 kr med ≥3 köp; 4 av 10 vinnare ligger 599–909 kr. Över 500 kr finns bara Cargoshorts (OSÄKER-BE, 1,63) och Vandringskängor (1,61). |
| (k) pris < 250 kr | 5/20 (25 %) | 1/10 | Svagt. |
| (l) prisuppslag | 2,0–3,0× (styrs av BE) | 2,4–3,1× | **Nej** — uppslaget är matematiskt = BE/(BE−1) och säger inget nytt. Undantag Väggfästet 2,0× (BE 2,00): det är ett marginalproblem, inte ett efterfrågeproblem. |
| (m) fel/sen/tidig säsong | 5/20 (25 %) — Gravstenspenna, Plyschtofflor, Gräsklippartäcke, Badshorts, Jättefotboll | 0/10 | Nära gränsen. Alla vinnare launchades i eller före säsong (Motorhölje/Strandtofflor/Axelbälte/Sätesöverdrag i juni). |
| (n) målgrupp ≠ man 45+ hus/båt/trädgård | **11/20 (55 %)** | 1/10 (Ergonomiska tofflor, unisex) | **Ja.** Men LOVANDE Cykelshorts (n=0, 41 köp, 2,18) och Damasker (n=0, 2,76) är motbevis i vardande — skalar de, faller n. |
| (o) skydd av ägd sak = 1 | 6/20 (30 %) | 4–5/10 | Svagt. Mobilskal, Gräsklippartäcke, Golfborste, Kedjeslip är "skydd/vård" och förlorade. |
| (p) förbrukning | 4/20 (20 %) | 0/10 | Under 30 %-gränsen. Noteras. |
| (q) humor/dekoration/lek | 3/20 (15 %) | 1/10 | Under gränsen. Soptunneklistermärkena bevisar att q=1 kan vinna när j=1 kompenseras av pris 199 kr och h=5. |
| (r) app/installation/inlärning | **6/20 (30 %)** — Gravstenspenna, Väggfäste, Ståltråd, Kran, Stänkskärm, Kedjeslip | 1/10 (Kamera) | Precis på gränsen. Kameran är undantaget (app) — men den har 799 kr och rädsla som drivkraft. |

**Vad förlorarna har som vinnarna saknar:** latent behov (j), fel målgrupp (n=0), pris under 500 kr utan undantag, något att montera/lära sig (r), och — i 25 % av fallen — fel eller för tidig säsong.

**Vad vinnarna har som förlorarna saknar:** inget som ensamt räcker. Komplement, synligt problem, demonstrerbarhet och skydd-av-ägt finns i massor bland förlorarna. Det som faktiskt skiljer är kombinationen: *aktivt upplevt problem (j=0) hos man 45+ (n=1) i ett prisband med CPA-utrymme (≥ 250 kr, gärna ≥ 500 kr) som inte kräver montering*. Räknar man (j=0 ∧ n=1 ∧ r=0) får vinnarna 7/10 (undantag: Soptunne j=1, Kamera r=1, Ergonomiska tofflor n=0) och förlorarna 2/20 (Golfklubbsborsten och Lastnätet — båda d=K ∧ f=1, se sektion 4).

### 3b. Nära-missar — vilken variabel skiljer?

1. **Gräsklippartäcket (1,29) vs Motorhöljet (1,93) / IBC (2,94).** Samma Oxford-tyg, samma "skydd av ägd maskin", samma man 45+. Skillnaden är (j): en utombordare och en IBC-tank står ute hela säsongen — problemet finns redan. De flesta gräsklippare står i förrådet — täcket måste först övertyga om att det finns ett problem. Dessutom (a) värde: 2–5 tkr klippare mot 20–100 tkr motor; (f) täcken finns i bygghandeln; (e) "passar de flesta"; 1 Shopify-bild (Temu-render av en amerikansk villa och en push-mower). BE saknas — det går inte ens att säga hur långt under den ligger.
2. **Kranskydd Frost (1,59 över BE 1,49, PAUSED) vs IBC (2,94).** Det här är ingen förlorare — den ligger över BE med 28 köp och pausades ändå. Skillnaden mot IBC är (m): launch 20 aug, frostskador i november. (f) kranskydd är en bygghandelsvara. Bild och beskrivning är i klass med IBC:s. Kandidat för omtest i oktober, inte för negativ rymd.
3. **Plyschtofflor (1,46) / Ergonomiska tofflor (1,59) / Vandringskängor (1,61) / Sneakers (aldrig körd) vs Strandtofflorna (2,10).** Alla skor ligger på eller strax över BE; Strandtofflorna ligger tydligt över. Skillnad: (m) Strandtofflorna launchades i juni, Plyschtofflorna 20 aug (vintertofflor i augusti = fel); (n) Strandtofflorna säljs som "halkfria trädgårdsskor" för altan/däck/båt — man 45+-kontext — de andra är generisk komfort; (f) Vandringskängor 669–699 kr mot Merrell/Salomon är den hårdaste jämförelsen i kontot, med 1 Shopify-bild. Ergonomiska tofflornas huvudbild har leverantörsloggan "OK ouranni SUMMER ADEVNUTRES" (felstavad) inbränd — det är inte annonsen, men det är sidan kunden landar på.
4. **Golfklubbsborsten (1,31) / Skotvättpåsen (1,48) / Golfskoväskan (1,09) vs Fiskespöhållaren (2,24).** Alla är "vård/ordning för något man äger". Skillnaden: Fiskespöhållarens old way är I (spön huller om buller i garaget — synligt kaos), de andras är K (golfshopen säljer borstar och skoväskor — Golfskoväskans huvudbild visar t.o.m. märket PGM; tvättpåsar finns för 30 kr). Dessutom (j): jord i bagaget och smuts i klubbspåren är låg-stakes-problem som ingen går och tänker på; trassliga spön ser man varje gång man öppnar garaget.
5. **Väggfästet (1,64 vs BE 2,00) vs Axelbältet (1,91 vs 1,72).** Samma ägare (trimmer). Väggfästets ROAS 1,64 hade räckt för nästan varje annan produkt i kontot — det är BE 2,00 (härledd kostnad 180 kr på 359 kr) som fäller det. Därtill (j): en trimmer på golvet gör inte ont, ryggen efter trimning gör det; (r) skruvas i vägg; (o) förvaring är inte skydd. Lärdom: skilj marginalförlorare från efterfrågeförlorare innan mönstret dras.
6. **Magnetfiskesatsen (1,10) / Mini fiskespöet (1,02, 2 köp) / Linupprullaren (1 köp) vs Fiskespöhållaren (2,24).** Fiskespöhållaren säljer till den som redan äger många spön (a=1, j=0). Magnetfiske är en ny hobby (a=0, j=1, q=1, familj/yngre). Mini-spöet ersätter ett riktigt spö (d=K, q=gimmick). Linupprullaren löser ett problem som inte syns (b=0) och kräver handlag (r=1). Kampanjnamnets BE 1,65 för magnetfisket stämmer inte med batch-sheetets 8,1 USD (ger 1,39–1,48) — bara ett av talen kan gälla.
7. **Kedjeslipen (0,99) vs Bälteslipmaskinen (2,30).** Båda slipar. Skillnad: bandsliparen är en maskin som gör jobbet (motor, gnistor, h=4) för 909 kr med 384 kr i härledd kostnad och 525 kr i BE-CPA; kedjeslipen är handvevad (r=1), måste passa kedjedelningen (e=1), konkurrerar med en rundfil som varje sågägare redan har (d=K, f=1) och kostar 249 kr — BE-CPA under 150 kr. Huvudbilden är en Temu-bild med inbränd engelsk text ("Portable Hand Cranked Chain Saw Sharpener"). Sliparens enda Shopify-bild är ett rent produktfoto — antal bilder är inte variabeln.
8. **AI-glasögonen (0,84, 2 köp) vs Övervakningskameran (3,38).** Båda elektronik (g=1, r=1, f=1). Skillnad: (k) 1 869 kr — enda produkten över 1 000 kr — mot ett märke (Ray-Ban Meta) som kunden känner igen; (c) DP/NM "kliv in i framtiden" = inget problem alls (j=1); (n) yngre; (o) inget att skydda. Kameran: ljud på tomten kl 03 (rädsla, j=0), skydd av hemmet (o=1), 799 kr inom 500–1000-bandet.
9. **Mobilskalet (1,17 vs 1,79).** iPhone är dyr (a=1) och skalet är skydd (o=1) — ändå förlorare, för att (d) alla har redan ett skal, (f) kategorin är den mest jämförelsehandlade som finns, (e) 18 modellvarianter, (k) 219 kr. Visar att "skydd av dyr ägd sak" inte räcker när kunden redan löst problemet.
10. **Surfplattestället (1,59 vs 1,67).** Marginell förlorare (5 % under BE). a=1 (iPad), men d=K (ställ för 100 kr överallt), j=1, n=0 (huvudbilden: kvinna som tränar hemma). Hade BE varit 1,49 som för Kranskyddet hade det varit LOVANDE — ytterligare ett skäl att alltid skriva BE i kampanjnamnet.
11. **Ståltrådsborsthuvuden (0,96) vs Axelbältet (1,91).** Samma trimmerägare, samma man 45+, h=5 (mossa som försvinner). Skillnad: (g) ståltråd i 10 000 varv är en säkerhetsfråga, (e)/(r) måste passa trimmerns fäste, (d) fogskrapa/ättika finns redan, (p) slits ut. Kampanjen har inget BE i namnet.
12. **Förtöjningslinan (0,93, 2 köp) vs Motorhöljet.** Samma båtägare, o=1 (skonar beslag). Skillnad: (g) linan håller båten — Temu-lina är en förtroendefråga; (d) alla båtägare har redan tampar; (b) rycken syns inte i en stillbild. OSÄKER formellt, men alla tre variabler pekar åt samma håll som Lastnätets.

## 4. Kandidater till negativ rymd

Kriterium: egenskapen finns hos ≥ 30 % av de 20 FÖRLORARNA och hos 0–1 av de 10 VINNARNA.

| Kandidat | Förlorare | Vinnare | Kommentar |
|---|---|---|---|
| **(j) Behovet måste skapas av annonsen (latent efterfrågan)** | 11/20 = 55 % | 1/10 (Soptunneklistermärkena) | Kvalificerar. Soptunneklistermärkena kompenserar med 199 kr, h=5 och humor. LOVANDE-gruppen: 5 av 6 har j=0. |
| **(n) Målgruppen är inte man 45+ med hus/båt/trädgård** | 11/20 = 55 % | 1/10 (Ergonomiska tofflor, unisex) | Kvalificerar. Testet som kan fälla den: Cykelshorts (41 köp, 2,18) och Damasker (29 köp, 2,76) är n=0 och ACTIVE — passerar de 10 000 kr över BE ska n strykas. |
| **(r) Kräver montering, installation eller inlärning** | 6/20 = 30 % | 1/10 (Kameran, app) | Kvalificerar precis. Kameran är undantaget med 799 kr och rädsla som drivkraft. |
| **(k) Pris under 500 kr — inga undantag** | 20/20 = 100 % | 6/10 | Kvalificerar INTE som negativ rymd (6 vinnare), men som gräns åt andra hållet: **ingen produkt över 500 kr har förlorat med ≥ 3 köp.** Alla under-BE-produkter ligger 169–429 kr. |
| (m) Fel, för sen eller för tidig säsong vid launch | 5/20 = 25 % (+ Kranskydd, Damasker, MC-Kapell i LOVANDE, alla tidiga/sena men över BE) | 0/10 | Under 30 %. Starkt tecken ändå: ingen vinnare launchades utanför säsong. |
| (p) Förbrukningsvara | 4/20 = 20 % | 0/10 | Under gränsen. |
| (c) Ingen problemlösning alls (lek/humor/mode/present) | 3/20 = 15 % (8/38 med OSÄKER) | 0/10 | Under gränsen. Överrepresenterad i OSÄKER-gruppen (Bollpannband, Luffarschack, Kasta & Fånga, Herrshorts, Mini-spö). |
| (d) Old way = befintlig köpt produkt | 16/20 = 80 % | 4/10 | Kvalificerar inte (4 vinnare). Men kombinationen **d=K ∧ f=1 ∧ pris < 300 kr** ger 6/20 = 30 % förlorare (Golfborste 280, Kran 289, Mattdynor 249, Stänkskärm 219, Kedjeslip 249, Mobilskal 219) mot 0/10 vinnare (Ergonomiska tofflor 309 och Strandtofflor 349 ligger precis över gränsen). Kvalificerar precis, som sammansatt kandidat. |
| Temu-leverantörens bild med inbränd engelsk text/logga som Shopify-huvudbild | 6/20 = 30 % (Surfplatteställ "360°", Ståltråd, Lastnät, Golfskoväska PGM, Första hjälpen mått, Kedjeslip) | 2/10 (Motorhölje "Outboard Motor Cover / Xlin Tonxue", Kamera "5G / Dual Lens") | Kvalificerar inte (2 vinnare) — och det är sidan, inte annonsen. Noteras som hygienfaktor. |

Sammansatt negativ rymd att testa vinnarna mot: **latent behov ∨ fel målgrupp ∨ montering/inlärning ∨ (köpt old way ∧ jämförelsehandlad ∧ < 300 kr)**. Träffar 19/20 förlorare — enda missen är Lastnätet (j=0, n=1, r=0, 399 kr; det som fäller det är g=1 lastsäkring och d=K) — och 3/10 vinnare (Soptunneklistermärkena via j, Kameran via r, Ergonomiska tofflorna via n). Ergonomiska tofflorna är samtidigt den svagaste vinnaren (1,59 mot ≈1,51) och den med osäkrast koppling, så träffen är snarare en bekräftelse än en motsägelse.

## 5. Datakvalitet

**Meta-siffror (ground-truth.md, 2026-09-03, kampanjnivå, livstid):** spend, köp, CPA, ROAS, status för samtliga 59 rader. Citerade rakt av. Jag har inte räknat om CPA/ROAS och inte sett annonsnivå — en kampanj med 7 000 kr kan bestå av en annons som fått köra eller tio som svalt; det syns inte här. Motorhöljets fem kampanjer och de tre andra skalningsprodukternas kopior är ihopslagna med ground-truth:s "~"-tal.

**Shopify (products.json, 2026-09-03):** pris, jämförpris, varianter, antal bilder, beskrivning, publiceringsdatum. Publiceringsdatum är en **proxy** för launch (många är publicerade 2026-06-21 i klump — Motorhölje, Strandtofflor, Axelbälte, Sätesöverdrag — så för dem säger datumet bara "före/vid säsong"). Två produkter matchar oklart: **Vandringskängor** (två Shopify-produkter, 669 och 699 kr, 1 respektive 3 bilder) och **Skotvättpåsen** (169 kr = Drive-SKU 601100218100590; en andra "Skotvättpåse med Dragkedja" finns för 359 kr; kampanjens CPA 303 × ROAS 1,48 ≈ 448 kr AOV, vilket inte stämmer med 169 kr ensamt — flerköp eller fel produkt).

**BE-ROAS — tre källor som inte alltid säger samma sak:**
- Kampanjnamnet: 28 produkter. Products.json: AI-glasögon 1,34, Väggfästet 2,00 samt de fyra skalningsprodukterna.
- **Okänd BE (18 st):** Skoreparationslappar, Cargoshorts, Gräsklippartäcke, Golfklubbsborste, Ståltrådsborsthuvuden, Skotvättpåse, Krananslutning, Lastnät, Lättviktsryggsäck, Liggunderlag, Herrshorts, Mattdynor, Stänkskärm, Trädgårdssäck, Kedjeslip, Förtöjningslina, Dörrbottenlist, Kamouflagetejp. För dessa vilar FÖRLORARE-klassningen på "ROAS under 1,49" — 9 av dem har ROAS ≤ 1,31 så domen håller oavsett BE; Skotvättpåsen (1,48) är den enda som kan vippa.
- Batch-sheet #1 (USD, CWD-offert 2026-08-01) omräknat med 9,59 SEK/USD (ECB 2026-09-01, `commission/valutakurs.json`): ger **lägre** BE än kampanjnamnen för Golfskoväskan (1,52 mot 1,79), Magnetfiskesatsen (1,39–1,48 mot 1,65) och Mobilskalet (1,42 mot 1,79). Antingen innehåller kampanj-BE frakt/avgifter som batch-sheetet inte har, eller så har priserna ändrats (Golfskoväskan 309 → 344, Magnetfiskesatsen 239 → 279 enligt sheetet mot Shopify). Härledd kostnad i tabellen är alltid räknad på kampanj-BE och nuvarande Shopify-pris. Supplier Quotation Sheet har tomma kostnadskolumner för alla tio vinnarna (ground-truth).
- **Axelbältets** BE 1,72 är räknat på 509 kr (CLAUDE.md); vid 599 kr är härledd kostnad 251 kr, vid 509 kr 213 kr — det ena talet är fel.

**Drive:** LOSERS (33 mappar i min listning; ground-truth säger 34) och WINNERS (9 poster inkl. TURNT OFF), listade 2026-09-03. Mappnamn ≠ kampanjnamn; matchningen är min ("Vandringssneakers Herr", "Båtlina", "shoe wash bag").

**Min läsning (inte data):** alla värden i sektion 2 — komplement, mekanismklass, old way, jämförelsehandlad, förtroende, demonstrerbarhet, latent behov, säsong, målgrupp. Jag har bedömt dem på Shopify-sidan, huvudbilden och produktens natur, **inte** på annonserna. Ett vinnarmönster som handlar om kreativet (hook, format, UGC) kan inte testas mot den här kontrollgruppen. Målgrupp (n) är särskilt subjektiv.

**Saknas helt:** annonskreativen per kampanj; antal annonser och testlängd; AOV per produkt (products.json har det bara för fyra); vilka kampanjer som är ABO-test och vilka som är CBO (regel 11 i CLAUDE.md — testresultat i CBO bredvid en vinnare är oläsbara); varför Kranskyddet, Skoreparationslapparna och Vandringskängorna pausades trots ROAS över BE; COGS för de 18 utan BE; Temu-listningarnas egna säljvolymer och recensioner (vinnarurvalet gjordes på Temu-länkar, kontrollgruppen på kontot — det är två olika populationer).
