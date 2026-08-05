# Creative DNA – Strandtofflorna (Bäverbutiken)

Produkt: Strandtofflor för Herr – Halkfria Trädgårdsskor · 349 kr · [produktsida](https://baverbutiken.se/products/strandtofflor-for-herr-halkfria-tradgardsskor)
Ad account: MagiBorsten `1867947880635861` · Kampanj: `120249220414220291`
Senast uppdaterad: **2026-08-05** (upphämtning + första feedbackloopen, 33 annonser)

**Läsanvisning:** `DATA` = uppmätt i kontot. `HYPOTES` = strategisk tolkning, ej bevisad.
Ingen dom sätts på annons under 300 kr spend eller 3 köp.

---

## Läget i siffror (livstid 23 juli – 5 augusti 2026)

| | Spend | Köp | CPA | ROAS |
|---|---:|---:|---:|---:|
| **Totalt** | 10 889 kr | 59 | **185 kr** | 2,36 |
| Batch 1 (23 juli) | 4 386 kr | 17 | 258 kr | 1,74 |
| Batch 2 (29 juli) | 6 472 kr | 42 | **154 kr** | 2,79 |
| Batch 3 (4 aug, video) | 30 kr | 0 | – | – |

Target-CPA: **145 kr**. Vi ligger 27 % över på livstid, men batch 2 landade på 154 kr — nästan på target. Riktningen är rätt, drivet av statics.

### Ranking enligt ANALYSMETOD.md `DATA`

Räknat 2026-08-05 enligt `docs/os/ANALYSMETOD.md`. **break-even-CPA 252 kr** · target-CPA 145 kr · AOV 430 kr.

**Datakvalitet (steg 1):** `omni_purchase_values` är trasigt även i den här kampanjen — PD_2_3 rapporterar 17,84 kr intäkt på 5 köp, PD_8_1 6,98 kr på 2 köp. Intäkt är därför räknad som `amount_spent × purchase_roas` genomgående. PD_13_1 stämmer mot fältet (15 251 kr) och validerar metoden.

**Signifikansgrind (steg 2): endast två annonser är bedömbara** (≥300 kr spend OCH ≥3 köp). Allt annat är "för tidigt" och får ingen dom, ingen ranking, inga slutsatser om vinkel eller hook.

#### Bedömbara — rangordnade på vinstbidrag `(252 − CPA) × köp`

| Annons | Spend | Andel spend | Köp | CPA | ROAS | **Vinstbidrag** | Andel vinst |
|---|---:|---:|---:|---:|---:|---:|---:|
| **PD_13_1** (piedestal, svart camo) | 5 744 kr | 52,7 % | 33 | 174 kr | 2,65 | **2 574 kr** | **82 %** |
| PD_2_2 (torr flat-lay, 4 färger) | 2 701 kr | 24,8 % | 13 | 208 kr | 2,17 | **572 kr** | 18 % |

**PD_13_1 står för 82 % av allt vinstbidrag.** Den är produktens vinnare och kampanjens **benchmark** — alla andra annonser jämförs mot den, aldrig tvärtom.

**Båda ligger under break-even och tjänar pengar per order:** PD_13_1 78 kr, PD_2_2 44 kr. Att de ligger över target-CPA (145 kr) är en skalningssignal, **aldrig ett skäl att pausa**.

#### För tidigt — ingen dom möjlig

| Annons | Spend | Köp | Varför utesluten |
|---|---:|---:|---|
| PD_2_3 (våt flat-lay) | 247 kr | 5 | Under 300 kr spend |
| PD_8_1 (sulan) | 187 kr | 2 | Under båda gränserna |
| PD_13_2 · SO_5_1 · PD_1_H2 | 49–120 kr | 1 var | Under båda gränserna |
| PD_13_3 · SP_5_1 · 15 andra | < 82 kr | 0 | Ingen konvertering att mäta |

⚠️ Dessa får **inte** användas som jämförelsenorm mot PD_13_1. En annons med ROAS 7,2 på 247 kr är en **skalningskandidat att testa**, inte en vinnare — höga kvoter på låg spend är delvis tur och delvis att den bästa publiken nås först. Räkna med regression när de får volym.

#### Kill-beslut (steg 3 — mäts mot break-even 252 kr, aldrig mot target)

| Annons | Spend | Köp | CPA | Beslut |
|---|---:|---:|---:|---|
| PD_1_H1 (video) | 895 kr | 1 | 895 kr | **Pausa.** CPA 3,6× break-even efter långt över 500 kr spend. För få köp för att rankas, men kill-regeln är uppfylld. |
| SP_1_H2 (video) | 543 kr | 2 | 271 kr | Redan pausad. Marginellt över break-even. |

`HYPOTES`: PD_13_1:s överlägsenhet beror på att den ensam klarat hög spend utan att CPA:n sprack. Ingen annan annons har prövats över 250 kr, så deras tak är okänt.

<details><summary>Tidigare CPA-index-tabell (behållen som diagnos)</summary>

| Annons | Andel av spend | Andel av köp | CPA | CPA-index |
|---|---:|---:|---:|---:|
| PD_2_3 (våt flat-lay) | 2,3 % | 8,5 % | 49 kr | **0,34** |
| PD_13_2 (khaki piedestal) | 0,6 % | 1,7 % | 70 kr | **0,48** |
| SO_5_1 (offer-layout) | 0,4 % | 1,7 % | 49 kr | **0,34** |
| PD_8_1 (sulan) | 1,7 % | 3,4 % | 93 kr | **0,64** |
| PD_1_H2 (video) | 1,1 % | 1,7 % | 120 kr | 0,82 |
| **PD_13_1 (piedestal)** | **52,7 %** | 55,9 % | 174 kr | 1,20 |
| **PD_2_2 (torr flat-lay)** | **24,8 %** | 22,0 % | 208 kr | 1,43 |
| SP_1_H2 (video) | 5,0 % | 3,4 % | 271 kr | 1,87 |
| PD_1_H1 (video) | 8,2 % | 1,7 % | 895 kr | 6,17 |

De fyra annonser som slår target-CPA delar på 5,0 % av spenden. Det betyder **inte** att de är vinnare — de är obeprövade vid volym. Det betyder att de är nästa kandidater att försöka skala.
</details>

### Statics vs video per spenderad krona `DATA`

| | Spend | Andel | Köp | CPA | CPA-index |
|---|---:|---:|---:|---:|---:|
| **Statics** | 9 222 kr | 84,7 % | 55 | **168 kr** | 1,16 |
| **Video** | 1 672 kr | 15,3 % | 4 | **418 kr** | 2,88 |

Video kostar **2,5× mer per köp** än statics på den här produkten. Skillnaden är för stor för att vara brus — den håller över tre batcher och elva videoannonser.

---

## Metrik-diagnos + creative-teardown (2026-08-05)

### Steg 6 — var i kedjan tappar de bedömbara?

Båda är bildannonser, så hook rate och hold existerar inte för dem.

| | CTR | CPM | Frekvens | Köp per klick |
|---|---:|---:|---:|---:|
| PD_13_1 | **2,99 %** | **95,63 kr** | 1,62 | 1,81 % |
| PD_2_2 | 1,81 % | 103,30 kr | **1,73** | **2,74 %** |

`DATA`: PD_2_2 övertygar bättre per klick (2,74 % mot 1,81 %) men fångar färre — lägre CTR, högre CPM, högst frekvens i kampanjen. **Dess svaghet sitter i uppmärksamheten, inte i övertygelsen.**

### Steg 6b — teardown av de två bedömbara

Båda granskade visuellt (bildfilerna nedladdade ur kontot).

**PD_13_1** — ett svart camo-par, ena skon upphöjd på vit piedestal, grå seamless studio, premium "sneaker drop"-ljus. Ögat träffar den upphöjda skon först; sulprofilen syns i siluett. Noll text, noll pris, noll proof. Läses som produktlansering, inte som annons.

**PD_2_2** — fyra par (svart camo, khaki camo, svart, vit) i flat-lay på beige studiobakgrund, uppifrån. Ögat sprids över fyra objekt utan tydlig hjälte. Sortimentsbredd är budskapet. Noll text, noll pris, noll proof.

### Variabeltabell — vinstbidrag grupperat per variabelvärde

| Variabelvärde | Annonser | Spend | Vinstbidrag | Andel |
|---|---:|---:|---:|---:|
| Textfri produktbild | 2 | 8 534 kr | 3 058 kr | 100 % |
| Torr studio | 2 | 8 534 kr | 3 058 kr | 100 % |
| Ingen proof i bild | 2 | 8 534 kr | 3 058 kr | 100 % |
| Ingen offer i bild | 2 | 8 534 kr | 3 058 kr | 100 % |
| **Ett par (hjälte) + piedestal + svart camo** | 1 | 5 824 kr | **2 492 kr** | **81 %** |
| **Fyra par + flat-lay + alla färger** | 1 | 2 710 kr | 566 kr | 19 % |

### Tre mönster

**1 — Textfri produktbild är den enda visuella stil som nått bedömbarhet. `HYPOTES` (starkt indicium)**
Båda bedömbara annonserna är textfria. Varje text-tung variant (PD_2_1 textoverlay, PD_9_1 jämförelse, PD_12_1 tabell, SO_4_1 prisankare) ligger kvar på 5–9 kr spend — auktionen vägrar leverera dem. Kan inte märkas *bevisad*: det finns ingen text-variant som fått spend att jämföra mot.
→ **Briefinstruktion:** textfritt är default i alla hjältebilder. Ska påståendet bevisas måste en text-variant tvingas fram i eget ad set med egen budget.

**2 — "Ett par slår fyra par" är en obevisad slutsats — tre variabler ändras samtidigt. `HYPOTES`**
PD_13_1 och PD_2_2 skiljer sig på antal par, komposition (piedestal vs flat-lay) OCH färgfokus (svart ensam vs alla fyra). Vinstbidraget 81/19 kan inte tillskrivas någon av dem. Detta är den viktigaste luckan i vår kunskap just nu.
→ **Briefinstruktion:** `PD_13_10` byggd i batch 4 som kontroll — exakt PD_13_1-uppställningen men fyra par. Isolerar antalet med komposition och studio konstant.

**3 — PD_2_2 tappar på uppmärksamhet, inte på övertygelse. `DATA` (13 respektive 33 köp bakom)**
Högre köp-per-klick men lägre CTR, högre CPM och högst frekvens (1,73).
→ **Briefinstruktion:** nya varianter ska förändra det som fångar ögat — komposition, underlag, ljus, beskärning. Lägg **inte** till säljargument, text eller proof; det är inte där den tappar.

---

## WINNING DNA

### Format: statics dominerar totalt `DATA`
Statiska bilder står för i praktiken all volym och alla köp. Videorna har fått 1 570 kr av 10 889 kr och levererat 4 köp av 59. Billigaste CPM i hela kampanjen är statics: 84–125 kr, mot 190–430 kr för video.

### Ren, textfri produktbild = billigast trafik `DATA`
De tre lägsta CPM:erna i kampanjen är alla textfria produktfoton: PD_13_2 (84 kr), PD_13_1 (96 kr), PD_2_3 (95 kr). Text-tunga overlay-statics får ingen leverans alls (PD_2_1: 33 impressions på 12 dagar).
`HYPOTES`: bilderna passerar som organiskt innehåll i flödet, vilket sänker auktionspriset.

### Enskilt par som hjälte på piedestal — volymvinnaren `DATA`
`PD_13_1` (svart camo-par på vit piedestal, grå studio, ingen text): 5 744 kr, **33 köp**, CPA 174 kr, ROAS 2,65. Ensam står den för 56 % av köpen i hela kampanjen.

### Vått underlag — effektivitetsvinnaren `DATA`
`PD_2_3` (fyra färger på regnvått trädäck): 247 kr, 5 köp, **CPA 49 kr**, ROAS 7,22. Samma uppställning torr (PD_2_2) ger CPA 208 kr. Enda skillnaden är underlaget.
Under 300 kr spend ⇒ formellt ingen dom, men det är kampanjens starkaste signal och den är underbudgeterad.

### Sulan som bevis fungerar `DATA`
`PD_8_1` (extrem närbild av sulmönstret + rubrik "Sulan som greppar blött trä."): 187 kr, 2 köp, CPA 93 kr, ROAS 3,73. Lägre CTR (1,39 %) än snittet men klicken konverterar — precis det utfall som var hypotesen.

### Svart camo säljer, khaki och vit gör det inte `DATA`
Identisk komposition, tre färger: svart camo 33 köp (PD_13_1), khaki 1 köp (PD_13_2), vit 0 köp på 81 kr (PD_13_3).

### Copy som fungerar `DATA` (samma copy över alla PD-annonser)
Problem-hook först ("Halkar du fortfarande på blöta altanen? 😬"), tre konkreta ytor ("blött däck, våt gräsmatta, hala stenar"), bekvämlighet som sekundärt motiv, CTA med emotionell payoff ("sluta oroa dig för nästa steg").

---

## LOSING DNA

### Lång brand-voice-video `DATA`
`PD_1_H1` (41,5 s, företagsröst, funktionsuppräkning): 895 kr, 1 köp, **ROAS 0,38**. Snittittartid 4 sekunder. Manuset avslöjar produkten i mening ett, lägger problemet efter lösningen, och slutar utan CTA, pris eller garanti.

### Hög CTR utan köpintention `DATA`
`PD_1_H1` har kampanjens näst högsta CTR (2,02 %) och dess sämsta ROAS. `SP_1_H2` har 2,25 % CTR och ROAS 1,25.
`HYPOTES`: hookar som säljer nyfikenhet i stället för problemigenkänning drar fel klick. **Optimera aldrig på CTR ensamt i den här produkten.**

### Låtsas-erbjudandet `DATA`
Hela SO-setet i batch 1 (349 → 339 kr, "begränsat lager"): 72 kr spend, 0 köp, ingen leverans. Annonserna lovade dessutom 339 kr när sidan tar 349 kr.
`HYPOTES`: 10 kr rabatt är inget erbjudande och undergräver urgency-påståendet.

### Text-tunga overlay-statics `DATA`
`PD_2_1` (stor rubrik över bilden, dessutom med stavfelet "GRIPPER"): 33 impressions totalt. Auktionen väljer bort dem mot de textfria.

### Retention är videons flaskhals `DATA`
Snittittartid över alla videor: 3–9 sekunder på klipp som är 21–42 sekunder. Bästa hold i kampanjen är `SP_3_H2` (22 % vid halva videon), sämsta är `PD_4_H1` (4 %).

---

## ÄNNU OBEVISAT

- **Videorna i batch 3** (PD_4/PD_5/PD_6/SP_3/SP_4) — 30 kr spend totalt. Ingen som helst dom möjlig.
- **Karusell** (`PD_7_1`, 2,64 kr) och **jämförelseformat** (`PD_9_1`, `PD_12_1`, båda under 10 kr).
- **Native lo-fi-formatet**: `SP_5_1` (post-it på blöt gräsmatta) har kampanjens **högsta CTR, 3,17 %**, men 0 köp på 52 kr. Formatet fångar uppmärksamhet — obevisat om det kan konvertera. Bilden saknar sula, pris och garanti, dvs. inget som kvalificerar klicket. `HYPOTES`: native + ett konverteringselement är den obeprövade kombinationen med högst potential.
- **Bundle** (`SO_3_1`, 4,72 kr) — **BLOCKERAD**: 2-för-598-rabatten är inte verifierad i Shopify. Annonsen får inte skalas förrän erbjudandet finns.
- **Livsstilsformat** (`PD_11_1`) och **familjekollage** (`PD_10_1`), båda under 6 kr.

---

## REGLER FÖR NÄSTA BATCH

**Formatmix: minst 75 % statiska bilder.** Beslutat av ägaren 2026-08-05, uppbackat av datan ovan (statics CPA-index 1,16 mot videons 2,88). Av en batch på 8 blir det minst 6 statics. Kvarvarande ~25 % video körs bara som iterationer på videokoncept som redan visat hold över 15 % — aldrig som nya långa koncept.

**Rangordna alltid på vinstbidrag `(252 − CPA) × köp`** enligt `docs/os/ANALYSMETOD.md` — aldrig på ROAS eller CPA ensamt, aldrig på antal köp. Kör signifikansgrinden först: under 300 kr spend eller 3 köp får annonsen ingen dom alls. Kill mäts mot break-even 252 kr, aldrig mot target 145 kr.

**Bygg majoriteten av varje batch på den formel som tjänar mest just nu.** Idag är det PD_13: enskilt par svart camo, upphöjt på piedestal, premium studio, ingen text. Variera en parameter åt gången inom formeln — vinkel, ljus, underlag, produktorientering, beskärning — i stället för att sprida batchen över obeprövade koncept.

**Behåll alltid:** textfri eller nästan textfri produktbild · svart camo som primär färg · vått underlag som kontext · sulan synlig · PD-copyn med problem-hook och de tre ytorna · 349 kr (aldrig 339).

**Testa kontrollerat (en variabel åt gången):** antal par i bild · torrt vs vått underlag · studio vs verklig miljö · rubrik på sulbilden · native lo-fi med vs utan konverteringselement.

**Undvik:** videor över 25 sekunder · företagsröst ("vi tog fram") · problemet efter lösningen · stora textblock i bild · rabatter under 10 % · vit och khaki som huvudfärg i hjältebilden.

**Bevaka:** frekvensen kryper uppåt på de två volymannonserna (PD_2_2: 1,73 · PD_13_1: 1,61). Creative-diversitet är motmedlet — det är därför kvoten finns.
