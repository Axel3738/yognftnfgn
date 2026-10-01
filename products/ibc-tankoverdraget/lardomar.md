# Lärdomar — IBC-Tanköverdraget

En per etiketterad annons (docs/os/CS-KLART.md punkt 1–5). Skrivs av `node agent/lardom.mjs --skriv`; varje brief pekar på ett id här (`lardom=L-…`).

### Lärdom L-120250005818370291 — IBC_PD_1_H1 (BREAKTHROUGH, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 0 — produkttestet före batch #1 (batch-log: 'upptagna ID:n PD_1/PD_2/PD_Extra' vid numreringen 2026-09-01) |
| Utfall | BREAKTHROUGH |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 7 739 kr / 8 911 kr (87 %) |
| Köp | 38 |
| ROAS / CPA | 3,07 / 204 kr — kampanjens ROAS 2,92 |
| Konverteringsgrad | 3,5 % (38 köp / 1103 LPV) |
| Hook rate / hold rate | 37 % / 15 % |
| Bedömbar | ja |

**Koncept:** PD produktdemo · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** produkttestet (briefen ligger i Product test center i Notion, inte i repot) — planerat läst ur `products/ibc-tankoverdraget/dna.md` Winning DNA 1–3


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext, rad 1 (live 2026-09-21): "Trött på grönt, algfyllt regnvatten? 💧"
- Rubrik (live): "Klart vatten. Ingen alg. Enkelt." · beskrivning: "Passar standard 1000L IBC-tank."
- Första frame (thumbnail, läst 2026-09-21): en tom IBC-tank i en trädgård, ingen text, inget överdrag — produkten syns inte i första bilden
- VO/inbränd text i videon: okänd — manuset finns inte i repot och videon är inte transkriberad (produkttestets brief i Notion)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | villaägare med IBC-tank för regnvatten i trädgården | samma: trädgård, rabatter, tanken på gräsmattan i första bilden; copyn talar till 'din IBC-tank' | ja |
| Vinkel | PD — produktdemo utan pris, utan urgency (dna.md Winning DNA 1) | PD: problemfråga → mekanism → tre ✓ → CTA, inget pris, ingen brådska i copyn | ja |
| Medvetandenivå | problem — kunden har sett det gröna vattnet | problem: 'Trött på grönt, algfyllt regnvatten?' öppnar på symptomet, inte på produkten | ja |
| Mekanism | solljus/UV ger alger — överdraget blockerar ljuset (dna.md 2: mekanism kopplad till verifierbar spec) | 'blockerar solljus och UV helt — så vattnet hålls klart, och tanken slits inte ut' + 210D Oxford-tyg som spec | ja |
| Tro | ljus är orsaken till algerna, så ett tätt överdrag löser det | samma tro bärs av copyn; ingen extern auktoritet, inget bevis utöver spec:en | ja |
| Positionering | skyddet som håller vattnet klart och tanken hel (funktion, inte pris) | 'Klart vatten. Ingen alg. Enkelt.' — funktion; tankens livslängd som andra löfte | ja |
| Brådska | ingen (dna.md: inget pris/urgency i PD-annonser) | ingen brådska i copy eller rubrik ('Skydda din tank idag 👇' är en CTA, ingen deadline) | ja |
**Utförandet föll:** nej · utford_som_briefad: ja — copyn och första bilden matchar dna.md:s beskrivning av vinnaren; videons VO är inte kontrollerad (okänd)

**Diagnos:** Breakthrough: tre iterationer inom 14 dagar, börja i manuslistan (nya hookar → längre problemdel → in media res). Aldrig en ren kopia av top spendern.

**Hypotes (gissning):** annonsen vinner på problemmedvetenheten — varje IBC-ägare har sett grönt vatten, och en fråga om just det plus en spec man kan peka på (210D Oxford-tyg) gör demot trovärdigt utan pris eller brådska; att produkten inte syns i första bilden verkar inte ha kostat hook rate (37 %), vilket talar för att symptombilden (tanken) bär hooken.

**Nästa annonser:**
- `IBC_PD_12_H1` — typ I, parent IBC_PD_1_H1, iteration 1 av 3 (vidarebygg, deadline 2026-10-05): ny hook — in media res, närbild på grönt vatten i tanken sekund 0, sedan samma manus ordagrant. (PD_12 = nästa lediga PD-nummer per batch-log; läs av kontot före brief.)
- `IBC_PD_12_H2` — typ I, parent IBC_PD_1_H1, iteration 2 av 3: längre problemdel — 5 s på vad algerna gör (igensatt kran, tank som byts) innan mekanismen, resten oförändrat.
- `IBC_PD_12_H3` — typ I, parent IBC_PD_1_H1, iteration 3 av 3: PD_Extras makro-textur-öppning (dna.md hypotes 4, CPA 129 kr på n=1) i full längd — isolerar öppningsbilden från klipplängden.

UGC: ingen beställning ur den här lärdomen — det som saknas är inte tro/auktoritet/tillit (annonsen konverterar 3,5 % av landningssidevisningarna, 38 köp / 1 103 LPV läst 2026-09-21), så vidarebyggen först.

### Lärdom L-120250155312560291 — IBC_SP_3_H1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 949 kr / 16 091 kr (6 %) |
| Köp | 2 |
| ROAS / CPA | 1,03 / 474 kr — kampanjens ROAS 1,67 |
| Konverteringsgrad | 3,2 % (2 köp / 63 LPV) |
| Hook rate / hold rate | 31 % / 5 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: ""Nu slipper jag mycket solljus på tanken. Det ser även snyggare ut." – Maria ★★★★★" · Rubrik: "Tio recensioner, 4,5 av 5" · Beskrivning: "Riktiga recensioner, 4,5 av 5 stjärnor."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | tankägare med regnvattentank ('min regnvattentank' i Lenas citat) | okänd |
| Vinkel | — (brief saknas i repot) | SP — två namngivna recensioner (Maria, Lena) ordagrant, aggregat i rubriken | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning — citaten beskriver resultatet (mindre solljus, enkelt att öppna), inte problemet | okänd |
| Mekanism | — (brief saknas i repot) | ingen förklarad — 'slipper mycket solljus på tanken' antyder ljusblockering men inget om UV/alger eller 210D | okänd |
| Tro | — (brief saknas i repot) | två 5★-citat + rubriken 'Tio recensioner, 4,5 av 5' — ⚠ aggregatet är fel: dna.md 2026-09-20 verifierade 4,7 av 5 på 10 recensioner | okänd |
| Positionering | — (brief saknas i repot) | 'Riktiga recensioner' — kundbetyg i stället för funktion | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** hook rate 31 % är i nivå med vinnaren (37 %) men hold 5 % mot 15 % och ROAS 1,03 mot break-even 1,51 — gissning: recensionerna bär öppningen men annonsen saknar mekanismen (varför vattnet blir klart), så tittaren tappas före köpet; det felaktiga aggregatet 4,5 i rubriken hjälper inte.

**Nästa annonser:**
- `IBC_SP_6_H1` — typ I, parent IBC_SP_3_H1, iteration 1: samma två citat (Maria, Lena) men PD_1_H1:s mekanismrad ("blockerar solljus och UV helt") läggs in mellan hooken och citaten, rubriken rättas till det verifierade "4,7 av 5 på 10 recensioner". Enda variabeln: mekanismen. Källa: kalla=egen-data (recensionerna lästa ordagrant, backlog 2026-09-04).

### Lärdom L-120250005831370291 — IBC_CS_1_H3 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | KPI_WINNER |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 366 kr / 8 911 kr (4 %) |
| Köp | 2 |
| ROAS / CPA | 3,61 / 183 kr — kampanjens ROAS 2,92 |
| Konverteringsgrad | 7,7 % (2 köp / 26 LPV) |
| Hook rate / hold rate | 28 % / 7 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "⏰ IDAG ENDAST — 23% RABATT" · Rubrik: "Skydda tanken innan sommaren" · Beskrivning: "489 kr idag — ordinarie 636 kr."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan vill ha ett överdrag och väntar på rätt pris ('din IBC-tank') | okänd |
| Vinkel | — (brief saknas i repot) | CS — rea/prisankare 489 mot 636 kr, 23 % | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt/erbjudande — öppnar på rabatten, inte på problemet | okänd |
| Mekanism | — (brief saknas i repot) | svag: 'tjockt, skyddande överdrag', 'inga alger, inget spröd plast' — ingen spec, ingen förklaring | okänd |
| Tro | — (brief saknas i repot) | priset är tillfälligt lågt och lagret krymper — ingen av raderna går att belägga (dna.md compliance-fynd 2026-09-07/10) | okänd |
| Positionering | — (brief saknas i repot) | deal: 'Skydda tanken innan sommaren', '489 kr idag — ordinarie 636 kr' | okänd |
| Brådska | — (brief saknas i repot) | påhittad: 'IDAG ENDAST', 'priset går tillbaka imorgon', 'lagret krymper snabbt' — bryter mot CLAUDE.md regel 3 | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** ROAS 3,61 på 366 kr med 7,7 % konverteringsgrad (mot vinnarens 3,5 %) — gissning: det verifierade prisfaktumet 489/636 kr gör jobbet och den påhittade brådskan är dödvikt; annonsen får bara 4 % av spenden för att Meta redan har en billigare köpare i PD_1_H1 (dna.md 2026-09-17: CS_1_H3 har lägst CPA av de tre bedömbara, 181 kr).

**Nästa annonser:**
- `IBC_CS_10_H1` — typ I, parent IBC_CS_1_H3, iteration 1 (KPI winner ⇒ ny hook, allt annat lika): hooken byts från "IDAG ENDAST — 23% RABATT" till det verifierbara "489 kr i stället för 636 kr — 147 kr mindre" sagt över tanken sekund 0; resten av videon och copyn oförändrad men ALLA påhittade brådskerader ("priset går tillbaka imorgon", "lagret krymper") strukna. Isolerar: hook utan fabricerad urgency.

### Lärdom L-120250005822500291 — IBC_PD_2_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 269 kr / 8 911 kr (3 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,92 |
| Konverteringsgrad | 0,0 % (0 köp / 21 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Trött på grönt, algfyllt regnvatten? 💧" · Rubrik: "Klart vatten. Ingen alg. Enkelt." · Beskrivning: "Passar standard 1000L IBC-tank."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | villaägare med IBC-tank för regnvatten i trädgården ('din IBC-tank', 'regnvatten') | okänd |
| Vinkel | — (brief saknas i repot) | PD — vinnarens copy ordagrant som statisk bild (bilden ej granskad) | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem — öppnar på symptomet 'grönt, algfyllt regnvatten' | okänd |
| Mekanism | — (brief saknas i repot) | 'blockerar solljus och UV helt' → vattnet hålls klart, tanken slits inte ut; spec 210D Oxford-tyg, blixtlås, öppning upptill | okänd |
| Tro | — (brief saknas i repot) | ljus ger alger, ett tätt överdrag löser det — beviset är specen, ingen recension eller auktoritet | okänd |
| Positionering | — (brief saknas i repot) | funktion: 'Klart vatten. Ingen alg. Enkelt.' | okänd |
| Brådska | — (brief saknas i repot) | ingen ('Skydda din tank idag 👇' är CTA, ingen deadline) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** 0 köp på 21 LPV i första veckan och 0 köp på 618 kr livstid (dna.md 2026-09-20) med exakt vinnarens text — gissning: det är videon (tanken, överdraget som dras på, blixtlåset) som säljer, inte orden; en stillbild kan inte visa mekanismen och därför konverterar samma copy inte.

**Nästa annonser:**
- SLÄPP — samma copy som vinnaren utan ett enda köp på 618 kr livstid: formatet (statisk) är variabeln som föll, och format-transfern har redan omprövats i PD_4_1, PD_5_1, PD_6_1, PD_9_1 och PD_10_1 utan att någon nått grinden utom PD_9_1 (egen lärdom).

### Lärdom L-120250077952830291 — IBC_CO_1_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-03 – 2026-09-09 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 257 kr / 14 561 kr (2 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,32 |
| Konverteringsgrad | 0,0 % (0 köp / 16 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Utan skydd blir tankvattnet grönt av alger. 210D Oxford-tyget blockerar solljuset helt och stoppar algtillväxten. Samma tank, olika resultat – skillnaden är överdraget." · Rubrik: "210D Oxford-tyg stoppar UV och alger" · Beskrivning: "IBC-tanköverdrag, 1000 L"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som sett grönt vatten | okänd |
| Vinkel | — (brief saknas i repot) | CO — jämförelse: samma tank utan och med överdrag | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem → lösning i en mening ('Utan skydd blir tankvattnet grönt av alger') | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyget blockerar solljuset helt och stoppar algtillväxten | okänd |
| Tro | — (brief saknas i repot) | 'Samma tank, olika resultat – skillnaden är överdraget' — bevis ska ligga i bilden (före/efter), bilden ej granskad | okänd |
| Positionering | — (brief saknas i repot) | skillnaden är överdraget | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** 0 köp på 16 LPV första veckan, livstid 870 kr / 1 köp / ROAS 0,56 (dna.md 2026-09-20) — gissning: en före/efter-bild av alger lovar samma sak som PD_1_H1 men utan videons demo av att överdraget faktiskt sätts på, så klicket kommer men köpet uteblir.

**Nästa annonser:**
- SLÄPP — livstid 870 kr med 1 köp och ROAS 0,56 mot break-even 1,51 är kampanjens dyraste annons; idén (visualiserat sakfaktum) kom ur egen data men har fått mer spend än någon annan icke-vinnare utan att nå ens en tredjedel av break-even.

### Lärdom L-120250231777490291 — IBC_PD_9_1 (KPI_WINNER, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 5 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 215 kr / 5 353 kr (4 %) |
| Köp | 2 |
| ROAS / CPA | 16,23 / 108 kr — kampanjens ROAS 2,39 |
| Konverteringsgrad | 20,0 % (2 köp / 10 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Grönt vatten börjar med ljus genom plasten." · Rubrik: "Stoppa algerna vid ljuset" · Beskrivning: "Öppning upptill ingår"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som sett grönt vatten | okänd |
| Vinkel | — (brief saknas i repot) | PD — statisk demo: orsak → spec → åtkomst (batch #5:s statiska tvilling till PD_8_H1) | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem/orsak — 'Grönt vatten börjar med ljus genom plasten' | okänd |
| Mekanism | — (brief saknas i repot) | 210D-tyget stänger ute ljuset innan algerna får fäste; öppning upptill | okänd |
| Tro | — (brief saknas i repot) | ljus genom plasten är orsaken — specen är beviset, ingen recension | okänd |
| Positionering | — (brief saknas i repot) | 'Stoppa algerna vid ljuset' — orsaken, inte symptomet | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** 2 köp på 10 LPV (20 % konverteringsgrad) och ROAS 16 på 215 kr, 3 köp på 199 kr 2026-09-20 — gissning: att öppna på orsaken (ljus genom plasten) i stället för symptomet ger färre men mycket mer köpklara klick; n=2–3, kan lika gärna vara brus.

**Nästa annonser:**
- `IBC_PD_13_1` — typ I, parent IBC_PD_9_1, iteration 1 (KPI winner ⇒ ny hook, allt annat lika): rubrik/hookrad byts från "Stoppa algerna vid ljuset" till orsaken som påstående i bild: "Ljus genom plasten — det är så vattnet blir grönt"; bild, mekanismrad och åtkomstrad oförändrade. Isolerar: hookformulering på orsaksvinkeln.

### Lärdom L-120250154966570291 — IBC_PD_4_H3 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 191 kr / 16 091 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,67 |
| Konverteringsgrad | 0,0 % (0 köp / 8 LPV) |
| Hook rate / hold rate | 24 % / 7 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Grönt vatten i tanken?" · Rubrik: "Skydda tanken. 489 kr." · Beskrivning: "210D Oxford-tyg, blockerar UV."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som sett grönt vatten | okänd |
| Vinkel | — (brief saknas i repot) | PD med pris — tre rader: fråga, spec, '489 kr' (⚠ pris i en PD-annons, mot dna.md Winning DNA 1) | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem — 'Grönt vatten i tanken?' | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyg blockerar solljus och UV helt — en rad, ingen konsekvens utskriven | okänd |
| Tro | — (brief saknas i repot) | specen — inget annat | okänd |
| Positionering | — (brief saknas i repot) | 'Skydda tanken. 489 kr.' — skydd till ett pris | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** hook rate 24 % / hold 7 % är under vinnarens 37 % / 15 % och 0 köp på 8 LPV vid 191 kr — gissning: 12–15 s-klippet hann inte visa överdraget sättas på, och priset i copyn bryter PD-regeln så annonsen är varken ren demo eller ren rea (batch-log #2 planerade pacing-cut utan pris).

**Nästa annonser:**
- SLÄPP — under 300 kr; längdhypotesen är redan omtagen renare i PD_10_H2 (batch #6, ordagrant samma rader som PD_10_H1, ingen prisrad) som ligger i Creative strat review.

### Lärdom L-120250147950300291 — IBC_PD_4_H1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 133 kr / 16 091 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,67 |
| Konverteringsgrad | 0,0 % (0 köp / 6 LPV) |
| Hook rate / hold rate | 25 % / 3 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Grönt, algfyllt regnvatten i tanken?" · Rubrik: "Blockerar solljus och UV helt" · Beskrivning: "210D Oxford-tyg. Öppning upptill."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare med regnvatten | okänd |
| Vinkel | — (brief saknas i repot) | PD — tre rader: smärtfråga, spec, åtkomst | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem — öppnar på 'Grönt, algfyllt regnvatten i tanken?' (⚠ batch-log #2 planerade fact-first, texten är pain-first) | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyg blockerar solljus och UV helt; öppning upptill | okänd |
| Tro | — (brief saknas i repot) | specen | okänd |
| Positionering | — (brief saknas i repot) | 'Blockerar solljus och UV helt' — funktion | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** ja · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** batch-log #2:s enda variabel var fact-first-hooken, men den live texten öppnar på samma smärtfråga som vinnaren — gissning: testet kördes aldrig; 133 kr, hold 3 % och 0 köp på 6 LPV säger bara att en kortare kopia av vinnaren inte fick spend bredvid originalet.

**Nästa annonser:**
- SLÄPP — utförandet följde inte hypotesen (pain-first i stället för fact-first) och annonsen fick 133 kr; fact-first-hooken har redan testats i den form den var tänkt i PD_3_H1/PD_4_1/PD_5_1 (alla svält) och behöver inte en femte statisk kopia.

### Lärdom L-120250102938120291 — IBC_PD_4_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 111 kr / 14 949 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,98 |
| Konverteringsgrad | 0,0 % (0 köp / 6 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "210D Oxford-tyg stänger ute ljuset. Algerna kommer aldrig igång." · Rubrik: "210D Oxford-tyg. Ingen alg." · Beskrivning: "Tar UV-strålningen i stället för plasten."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare | okänd |
| Vinkel | — (brief saknas i repot) | PD — fact-first statisk: specen i rad 1 | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning — '210D Oxford-tyg stänger ute ljuset' förutsätter att man redan vet varför | okänd |
| Mekanism | — (brief saknas i repot) | tyget stänger ute ljuset → algerna kommer aldrig igång; tar UV-strålningen i stället för plasten | okänd |
| Tro | — (brief saknas i repot) | specen | okänd |
| Positionering | — (brief saknas i repot) | '210D Oxford-tyg. Ingen alg.' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** annonsen fick 111 kr (1 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn; att en spec som ingen utanför branschen känner igen (210D) står ensam som hook gör dessutom att bilden saknar symptomet som bär vinnaren.

**Nästa annonser:**
- SLÄPP — under 300 kr, format-transfer (typ IM av PD_4_H1) utan egen research; fact-first som hook har svultit i fyra assets (PD_3_H1, PD_4_H1, PD_4_1, PD_5_1).

### Lärdom L-120250135240320291 — IBC_BOF_5_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER · BOF |
| Fönster | 2026-09-08 – 2026-09-14 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 103 kr / 15 972 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,72 |
| Konverteringsgrad | 0,0 % (0 köp / 6 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Presenningen som skulle skydda blåser av vid första höststormen." · Rubrik: "Presenningen blåser av i höststormen" · Beskrivning: "210D Oxford-överdrag med blixtlås."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — invändningen 'en presenning duger' (cost of inaction: presenningen blåser av) | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | ett 210D Oxford-överdrag med blixtlås sitter kvar när presenningen blåser av | okänd |
| Tro | — (brief saknas i repot) | produktsidans egen rad 'Presenningen som skulle skydda blåser av vid första höststormen' | okänd |
| Positionering | — (brief saknas i repot) | överdraget som sitter kvar | okänd |
| Brådska | — (brief saknas i repot) | mild, verifierbar säsong: 'Skydda tanken innan hösten' | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** annonsen fick 103 kr (1 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn; invändningen är ändå den vanligaste i kommentarerna (invandningar.md: "en grön tjockare presenning med ett par spännband duger"), så idén är starkare än utfallet.

**Nästa annonser:**
- SLÄPP — BOF räknas inte i frekvensen och fick 103 kr; presenningsinvändningen tas vidare som OB-video i lärdomen för IBC_CO_2_H1 (kalla=voc), inte som ännu en BOF-bild.

### Lärdom L-120250005819880291 — IBC_PD_1_H2 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 98 kr / 8 911 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,92 |
| Konverteringsgrad | 0,0 % (0 köp / 14 LPV) |
| Hook rate / hold rate | 36 % / 17 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Trött på grönt, algfyllt regnvatten? 💧" · Rubrik: "Klart vatten. Ingen alg. Enkelt." · Beskrivning: "Passar standard 1000L IBC-tank."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | villaägare med IBC-tank för regnvatten i trädgården ('din IBC-tank', 'regnvatten') | okänd |
| Vinkel | — (brief saknas i repot) | PD — vinnarens copy ordagrant, annan videohook (H2) | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem — öppnar på symptomet 'grönt, algfyllt regnvatten' | okänd |
| Mekanism | — (brief saknas i repot) | 'blockerar solljus och UV helt' → vattnet hålls klart, tanken slits inte ut; spec 210D Oxford-tyg, blixtlås, öppning upptill | okänd |
| Tro | — (brief saknas i repot) | ljus ger alger, ett tätt överdrag löser det — beviset är specen, ingen recension eller auktoritet | okänd |
| Positionering | — (brief saknas i repot) | funktion: 'Klart vatten. Ingen alg. Enkelt.' | okänd |
| Brådska | — (brief saknas i repot) | ingen ('Skydda din tank idag 👇' är CTA, ingen deadline) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** hook rate 36 % och hold 17 % är lika bra som PD_1_H1 (37 % / 15 %) men 0 köp på 14 LPV och 396 kr / 0 köp livstid (dna.md 2026-09-20) — gissning: H2-öppningen får tittaren att stanna men landar fel publik, eller så räcker 14 LPV helt enkelt inte för ett köp; Meta valde H1 och lät H2 svälta.

**Nästa annonser:**
- SLÄPP — samma copy som vinnaren med 0 köp på 396 kr livstid; nya hookar på PD_1_H1 byggs redan i batch #8 (PD_12_H1–H3) och en fjärde variant av samma manus tillför ingen ny variabel.

### Lärdom L-120250005823320291 — IBC_SP_1_H1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 89 kr / 8 911 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,92 |
| Konverteringsgrad | 0,0 % (0 köp / 11 LPV) |
| Hook rate / hold rate | 45 % / 12 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: ""Äntligen klart vatten i tanken — inga alger på hela sommaren!" ⭐⭐⭐⭐⭐" · Rubrik: "Klart vatten hela sommaren" · Beskrivning: "Betygsatt av riktiga trädgårdsägare."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | trädgårdsägare med algig tank ('hundratals trädgårdsägare') | okänd |
| Vinkel | — (brief saknas i repot) | SP — social proof: citat med fem stjärnor + volympåstående + tre ✓ | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning — citatet beskriver resultatet 'klart vatten hela sommaren' | okänd |
| Mekanism | — (brief saknas i repot) | 'Blockerar UV och sol helt' som punkt, inte förklarad; blixtlås, åtkomst till locket | okänd |
| Tro | — (brief saknas i repot) | andra har köpt och är nöjda — 'hundratals trädgårdsägare' är obelagt (10 recensioner på sidan, dna.md) och citatet är inte hämtat ur en namngiven recension | okänd |
| Positionering | — (brief saknas i repot) | kundfavoriten: 'Se varför kunderna älskar det' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** hook rate 45 % är kampanjens näst högsta men 0 köp på 11 LPV vid 89 kr — gissning: ett citat med fem stjärnor stoppar tummen, men "hundratals trädgårdsägare" utan namn och utan mekanism ger inget att tro på när man väl klickat.

**Nästa annonser:**
- SLÄPP — under 300 kr och volympåståendet "hundratals" går inte att belägga (10 recensioner); SP-vinkeln lever vidare i IBC_SP_3_H1:s lärdom (namngivna citat) och behöver inte den här kopian.

### Lärdom L-120250233379210291 — IBC_PD_6_H2 (LOSER, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | LOSER |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 87 kr / 5 353 kr (2 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | 27 % / 4 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Överdraget blockerar solljus och UV helt." · Rubrik: "Blockerar solljus och UV helt" · Beskrivning: "Kraftigt 210D Oxford-tyg"
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare | okänd |
| Vinkel | — (brief saknas i repot) | PD — mekanism-först, tre rader utan fråga | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning — öppnar på 'Överdraget blockerar solljus och UV helt', inget symptom i texten | okänd |
| Mekanism | — (brief saknas i repot) | blockerar solljus och UV → vattnet hålls klart; 210D Oxford, blixtlås, öppning upptill | okänd |
| Tro | — (brief saknas i repot) | specen | okänd |
| Positionering | — (brief saknas i repot) | 'Blockerar solljus och UV helt' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** hook 27 % / hold 4 % på 87 kr och 1 LPV — gissning: batch #4:s makro-öppning (tygets textur) utan smärtfrågan i texten ger ingen anledning att stanna för den som inte redan vet vad alger i tanken är; n är för litet för mer än det.

**Nästa annonser:**
- SLÄPP — 87 kr, ingen läsning; öppningsbildshypotesen (dna.md 4) tas om i IBC_PD_12_H3 (batch #8, makro-öppning i full längd på vinnarens exakta manus).

### Lärdom L-120250005833290291 — IBC_CS_2_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 87 kr / 8 911 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,92 |
| Konverteringsgrad | 0,0 % (0 köp / 2 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "⏰ IDAG ENDAST — 23% RABATT" · Rubrik: "Skydda tanken innan sommaren" · Beskrivning: "489 kr idag — ordinarie 636 kr."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan vill ha ett överdrag och väntar på rätt pris ('din IBC-tank') | okänd |
| Vinkel | — (brief saknas i repot) | CS — samma rea-copy som CS_1_H3 som statisk bild (bilden ej granskad) | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt/erbjudande — öppnar på rabatten, inte på problemet | okänd |
| Mekanism | — (brief saknas i repot) | svag: 'tjockt, skyddande överdrag', 'inga alger, inget spröd plast' — ingen spec, ingen förklaring | okänd |
| Tro | — (brief saknas i repot) | priset är tillfälligt lågt och lagret krymper — ingen av raderna går att belägga (dna.md compliance-fynd 2026-09-07/10) | okänd |
| Positionering | — (brief saknas i repot) | deal: 'Skydda tanken innan sommaren', '489 kr idag — ordinarie 636 kr' | okänd |
| Brådska | — (brief saknas i repot) | påhittad: 'IDAG ENDAST', 'priset går tillbaka imorgon', 'lagret krymper snabbt' — bryter mot CLAUDE.md regel 3 | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** 87 kr, 2 LPV, 0 köp första veckan och 144 kr / 0 köp livstid (dna.md 2026-09-20) — gissning: samma påhittade brådska som i CS_1_H3 men utan videons demo blir bilden en ren rabattskylt, och rabattskyltar utan produkt i rörelse säljer inte här (PD_2_1 visar samma mönster för PD-copyn).

**Nästa annonser:**
- SLÄPP — påhittad brådska ("IDAG ENDAST", "ENDAST FÅ KVAR I LAGER") får inte byggas vidare på (dna.md compliance-fynd), och den rena rean utan brådska finns redan som CS_5_1/CS_4_1/BOF_15_1.

### Lärdom L-120250233165060291 — IBC_CS_5_H1 (LOSER, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | LOSER |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 83 kr / 5 353 kr (2 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | 37 % / 6 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "489 kr för samma 210D Oxford-tyg som stoppar algerna." · Rubrik: "489 kr, fullt UV-skydd" · Beskrivning: "Klart på ett par minuter"
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som jämför pris | okänd |
| Vinkel | — (brief saknas i repot) | CS — ren rea utan påhittad brådska: pris + spec + montering | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — öppnar på '489 kr för samma 210D Oxford-tyg' | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyg stoppar algerna; klart på ett par minuter; öppning upptill | okänd |
| Tro | — (brief saknas i repot) | priset 489 kr (verifierat mot sidan) + specen | okänd |
| Positionering | — (brief saknas i repot) | '489 kr, fullt UV-skydd' | okänd |
| Brådska | — (brief saknas i repot) | ingen — jämförpriset 636 kr saknas i texten | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** hook rate 37 % (samma som vinnaren) men 0 köp på 3 LPV vid 83 kr — gissning: "489 kr" utan jämförpriset 636 kr är ingen rea, bara ett pris, så prisvinkelns bärande faktum (147 kr mindre) saknas i den live copyn.

**Nästa annonser:**
- SLÄPP — under 300 kr; den rena prisvideon med båda priserna finns redan som IBC_CS_8_H1 (batch #6, Creative strat review) och IBC_CS_9_H1 (batch #7, 12–15 s), som svarar på samma fråga bättre.

### Lärdom L-120250134496480291 — IBC_PD_5_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-08 – 2026-09-14 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 75 kr / 15 972 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,72 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "210D Oxford-tyg mellan solen och ditt regnvatten." · Rubrik: "210D Oxford-tyg mot solen" · Beskrivning: "Ingen presenning, inga gummiband."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare med regnvatten som i dag använder presenning | okänd |
| Vinkel | — (brief saknas i repot) | PD/jämförelse — spec mellan solen och vattnet, presenning + gummiband som motbild | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning — specen först | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyg mellan solen och regnvattnet; ett blixtlås i stället för presenning och gummiband; algerna kommer aldrig igång | okänd |
| Tro | — (brief saknas i repot) | specen + sidans egen presenningsrad | okänd |
| Positionering | — (brief saknas i repot) | '210D Oxford-tyg mot solen' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** annonsen fick 75 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn; 1 LPV är ingen läsning.

**Nästa annonser:**
- SLÄPP — 75 kr och 1 LPV, format-transfer av en video (PD_5_H1) som aldrig producerades; presenningsjämförelsen tas vidare i lärdomen för IBC_CO_2_H1.

### Lärdom L-120250147958100291 — IBC_PD_4_H2 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 73 kr / 16 091 kr (0 %) |
| Köp | 1 |
| ROAS / CPA | 6,66 / 73 kr — kampanjens ROAS 1,67 |
| Konverteringsgrad | 9,1 % (1 köp / 11 LPV) |
| Hook rate / hold rate | 27 % / 5 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Trött på grönt algfyllt vatten i IBC-tanken?" · Rubrik: "Stänger ute ljuset. Ingen alg." · Beskrivning: "Öppning upptill. Blixtlås."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som sett grönt vatten | okänd |
| Vinkel | — (brief saknas i repot) | PD — vinnarens tre steg i tre rader (batch #2: creator på kamera, talare ej kontrollerad i texten) | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem — 'Trött på grönt algfyllt vatten i IBC-tanken?' | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyg stänger ute ljuset – algerna kommer aldrig igång; öppning upptill, blixtlås | okänd |
| Tro | — (brief saknas i repot) | specen | okänd |
| Positionering | — (brief saknas i repot) | 'Stänger ute ljuset. Ingen alg.' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** 1 köp på 11 LPV (9,1 %) vid 73 kr, ROAS 6,66 — gissning: ett ansikte som säger vinnarens rader konverterar minst lika bra som rösten utan ansikte, men n=1 och 88 kr livstid (dna.md 2026-09-20) är brus; talarvariabeln testas igen i IBC_PD_11_H1 (batch #7).

**Nästa annonser:**
- `IBC_PD_14_H1` — typ I, parent IBC_PD_4_H2, iteration 1 (KPI winner ⇒ ny hook, allt annat lika): samma creator och samma tre rader, men hooken byts från frågan till ett påstående över grönt vatten i bild ("Så här ser vattnet ut efter en sommar utan överdrag") — resten ordagrant. Isolerar: hook på creator-formatet. Körs bara om IBC_PD_11_H1 (samma talarhypotes, batch #7) inte redan svarat när briefen skrivs.

### Lärdom L-120250005822150291 — IBC_PD_Extra (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | KPI_WINNER |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 68 kr / 8 911 kr (1 %) |
| Köp | 1 |
| ROAS / CPA | 7,14 / 68 kr — kampanjens ROAS 2,92 |
| Konverteringsgrad | 7,7 % (1 köp / 13 LPV) |
| Hook rate / hold rate | 43 % / 15 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Trött på grönt, algfyllt regnvatten? 💧" · Rubrik: "Klart vatten. Ingen alg. Enkelt." · Beskrivning: "Passar standard 1000L IBC-tank."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | villaägare med IBC-tank för regnvatten i trädgården ('din IBC-tank', 'regnvatten') | okänd |
| Vinkel | — (brief saknas i repot) | PD — vinnarens copy ordagrant, kortare klippning och makro-öppning (dna.md hypotes 4) | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem — öppnar på symptomet 'grönt, algfyllt regnvatten' | okänd |
| Mekanism | — (brief saknas i repot) | 'blockerar solljus och UV helt' → vattnet hålls klart, tanken slits inte ut; spec 210D Oxford-tyg, blixtlås, öppning upptill | okänd |
| Tro | — (brief saknas i repot) | ljus ger alger, ett tätt överdrag löser det — beviset är specen, ingen recension eller auktoritet | okänd |
| Positionering | — (brief saknas i repot) | funktion: 'Klart vatten. Ingen alg. Enkelt.' | okänd |
| Brådska | — (brief saknas i repot) | ingen ('Skydda din tank idag 👇' är CTA, ingen deadline) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** hook rate 43 % / hold 15 % och 1 köp på 13 LPV första veckan, sedan 8 köp och CPA 191–197 kr mot vinnarens 263–266 kr över tre avläsningar (dna.md 2026-09-17/20) — gissning: den kortare klippningen når köpet snabbare per krona, men längd och öppningsbild ändrades samtidigt så orsaken är fortfarande inte isolerad.

**Nästa annonser:**
- `IBC_PD_15_H1` — typ I, parent IBC_PD_Extra, iteration 1 (KPI winner ⇒ ny hook, allt annat lika): PD_Extras korta klipp och makro-öppning behålls exakt, hookraden byts från "Trött på grönt, algfyllt regnvatten?" till påståendet "Grönt vatten i en IBC-tank utan UV-skydd." (samma rad som PD_12_H1 använder på den långa versionen) — så att kort/lång kan jämföras med samma hook. Isolerar: hooken på den korta klippningen.

### Lärdom L-120250102768570291 — IBC_BOF_1_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER · BOF |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 62 kr / 14 949 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,98 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "489 kr istället för 636 kr. Tyget är 210D Oxford och tar UV-strålningen i stället för plasten." · Rubrik: "23 % rabatt på tanköverdraget" · Beskrivning: "Fri frakt över 300 kr. Betala sen med Klarna."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — pris/erbjudande | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | tyget är 210D Oxford och tar UV-strålningen i stället för plasten | okänd |
| Tro | — (brief saknas i repot) | priset 489/636 kr, fri frakt över 300 kr, Klarna — alla verifierade mot sidan 2026-09-04 | okänd |
| Positionering | — (brief saknas i repot) | '23 % rabatt på tanköverdraget' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** annonsen fick 62 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn; 1 LPV.

**Nästa annonser:**
- SLÄPP — BOF-pris räknas inte i frekvensen; priset ensamt finns redan i BOF_10_1 och BOF_15_1 och behöver ingen fjärde bild.

### Lärdom L-120250233325780291 — IBC_PD_6_H1 (LOSER, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | LOSER |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 60 kr / 5 353 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | 22 % / 7 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Trött på grönt, algfyllt vatten i tanken?" · Rubrik: "Trött på grönt tankvatten?" · Beskrivning: "Ingen alg, inget ljus in"
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som sett grönt vatten | okänd |
| Vinkel | — (brief saknas i repot) | PD — vinnarens struktur komprimerad till tre rader (batch #4: 8–12 s klipp) | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem — 'Trött på grönt, algfyllt vatten i tanken?' | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyg med blixtlås; inget ljus in — inga alger som växer | okänd |
| Tro | — (brief saknas i repot) | specen | okänd |
| Positionering | — (brief saknas i repot) | 'Trött på grönt tankvatten?' — symptomet | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** hook 22 % / hold 7 % på 60 kr — gissning: ett 8–12 s-klipp av vinnaren hinner inte visa överdraget sättas på innan tittaren är förbi, men 60 kr är ingen läsning av något.

**Nästa annonser:**
- SLÄPP — 60 kr; längdhypotesen (dna.md 2) tas om renare i IBC_PD_10_H2 (batch #6, 12–15 s med ordagrant samma rader som den långa PD_10_H1).

### Lärdom L-120250260705080291 — IBC_PD_8_H1 (LOSER, etikett 2026-09-24)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-17 – 2026-09-23 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 55 kr / 4 190 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,69 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | 61 % / 3 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "210D Oxford-tyget blockerar UV helt. Utan det blir vattnet så här. Tyget håller ljuset ute så algerna inte får något att växa av. Öppning upptill gör att du når locket utan att lyfta av hela skyddet. 489 kr i stället för 636 kr – spara 147 kr." · Rubrik: "210D Oxford-tyget blockerar UV helt." · Beskrivning: ingen
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som sett grönt vatten | okänd |
| Vinkel | — (brief saknas i repot) | PD med pris — spec först, 'Utan det blir vattnet så här', åtkomst, pris (⚠ '489 kr i stället för 636 kr' i en PD-annons, mot dna.md Winning DNA 1; batch #5 planerade grönt vatten som öppning) | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning i texten (specen först), problembilden kommer i rad 2 | okänd |
| Mekanism | — (brief saknas i repot) | tyget håller ljuset ute så algerna inte får något att växa av; öppning upptill | okänd |
| Tro | — (brief saknas i repot) | specen + priset | okänd |
| Positionering | — (brief saknas i repot) | '210D Oxford-tyget blockerar UV helt.' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** ja · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** hook rate 61 % är kampanjens högsta men hold 3 % och 0 köp på 1 LPV vid 55 kr — gissning: öppningsbilden (grönt vatten) fångar, men copyn öppnar på specen och slutar på ett pris som PD-regeln förbjuder, så annonsen tappar riktning direkt efter hooken; 55 kr är ändå ingen dom.

**Nästa annonser:**
- SLÄPP — utförandet avvek (spec-först i texten och pris i en PD-annons) så hypotesen "grönt vatten som öppning" är otestad här; den körs i stället i IBC_PD_12_H1 (batch #8, in media res på vinnarens exakta manus, inget pris).

### Lärdom L-120250005829330291 — IBC_CS_1_H2 (KPI_WINNER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | KPI_WINNER |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 53 kr / 8 911 kr (1 %) |
| Köp | 1 |
| ROAS / CPA | 9,25 / 53 kr — kampanjens ROAS 2,92 |
| Konverteringsgrad | 50,0 % (1 köp / 2 LPV) |
| Hook rate / hold rate | 44 % / 8 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "⏰ IDAG ENDAST — 23% RABATT" · Rubrik: "Skydda tanken innan sommaren" · Beskrivning: "489 kr idag — ordinarie 636 kr."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan vill ha ett överdrag och väntar på rätt pris ('din IBC-tank') | okänd |
| Vinkel | — (brief saknas i repot) | CS — samma rea-copy som CS_1_H3, annan videohook (H2) | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt/erbjudande — öppnar på rabatten, inte på problemet | okänd |
| Mekanism | — (brief saknas i repot) | svag: 'tjockt, skyddande överdrag', 'inga alger, inget spröd plast' — ingen spec, ingen förklaring | okänd |
| Tro | — (brief saknas i repot) | priset är tillfälligt lågt och lagret krymper — ingen av raderna går att belägga (dna.md compliance-fynd 2026-09-07/10) | okänd |
| Positionering | — (brief saknas i repot) | deal: 'Skydda tanken innan sommaren', '489 kr idag — ordinarie 636 kr' | okänd |
| Brådska | — (brief saknas i repot) | påhittad: 'IDAG ENDAST', 'priset går tillbaka imorgon', 'lagret krymper snabbt' — bryter mot CLAUDE.md regel 3 | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** 1 köp på 2 LPV vid 53 kr, hook rate 44 % — gissning: samma prisfaktum som CS_1_H3 säljer här också, men n=1 och Meta lät H3 ta spenden; skillnaden mot H3 sitter i videons öppning, som inte är läst.

**Nästa annonser:**
- `IBC_CS_11_H1` — typ I, parent IBC_CS_1_H2, iteration 1 (KPI winner ⇒ ny hook, allt annat lika): H2-videons klipp behålls, hooken byts till materialraden "Inget spröd plast — tyget tar UV-smällen i stället för tanken" och priset 489/636 kr flyttas till rad 2; alla påhittade brådskerader strukna. Isolerar: material-hook på prisvinkeln (CS_10_H1 tar pris-hooken).

### Lärdom L-120250005825820291 — IBC_SP_1_H3 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 52 kr / 8 911 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,92 |
| Konverteringsgrad | 0,0 % (0 köp / 5 LPV) |
| Hook rate / hold rate | 39 % / 10 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: ""Äntligen klart vatten i tanken — inga alger på hela sommaren!" ⭐⭐⭐⭐⭐" · Rubrik: "Klart vatten hela sommaren" · Beskrivning: "Betygsatt av riktiga trädgårdsägare."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | trädgårdsägare med algig tank ('hundratals trädgårdsägare') | okänd |
| Vinkel | — (brief saknas i repot) | SP — social proof: citat med fem stjärnor + volympåstående + tre ✓ | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning — citatet beskriver resultatet 'klart vatten hela sommaren' | okänd |
| Mekanism | — (brief saknas i repot) | 'Blockerar UV och sol helt' som punkt, inte förklarad; blixtlås, åtkomst till locket | okänd |
| Tro | — (brief saknas i repot) | andra har köpt och är nöjda — 'hundratals trädgårdsägare' är obelagt (10 recensioner på sidan, dna.md) och citatet är inte hämtat ur en namngiven recension | okänd |
| Positionering | — (brief saknas i repot) | kundfavoriten: 'Se varför kunderna älskar det' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** hook 39 % / hold 10 % och 0 köp på 5 LPV vid 52 kr — gissning: som SP_1_H1: citatet stoppar tummen men "hundratals" utan namn ger inget att tro på; 52 kr är ingen läsning.

**Nästa annonser:**
- SLÄPP — under 300 kr, obelagt volympåstående; SP lever vidare i IBC_SP_3_H1:s lärdom.

### Lärdom L-120250232993680291 — IBC_PD_6_1 (LOSER, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | LOSER |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 48 kr / 5 353 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "210D Oxford-tyg. Riktigt tyg, inte plast." · Rubrik: "210D Oxford-tyg, inte plast" · Beskrivning: "Stänger ute UV och alger"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare | okänd |
| Vinkel | — (brief saknas i repot) | PD — spec-först statisk (batch #4: makro-crop + produktbild, bilden ej granskad) | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning — '210D Oxford-tyg. Riktigt tyg, inte plast.' | okänd |
| Mekanism | — (brief saknas i repot) | stänger ute UV — algerna kommer aldrig igång; blixtlås på sidan, öppning upptill, passar 1000L | okänd |
| Tro | — (brief saknas i repot) | specen ("riktigt tyg, inte plast") | okänd |
| Positionering | — (brief saknas i repot) | '210D Oxford-tyg, inte plast' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** annonsen fick 48 kr (1 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn; 1 LPV.

**Nästa annonser:**
- SLÄPP — 48 kr, statisk tvilling till PD_6_H2 som själv svalt; öppningsbildshypotesen tas om i IBC_PD_12_H3.

### Lärdom L-120250276222220291 — IBC_PD_10_1 (LOSER, etikett 2026-09-25)

| Fält | Värde |
|---|---|
| Batch | 6 |
| Utfall | LOSER |
| Fönster | 2026-09-18 – 2026-09-24 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 47 kr / 4 454 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,56 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Solljus in i tanken. Alger i vattnet. 210D Oxford-tyg stänger ute ljuset helt, och öppningen upptill går rakt till locket – ingen avdragning för att nå tanken. Passar din 1000 L-tank." · Rubrik: "Stänger ute ljuset, inte locket" · Beskrivning: ingen
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare | okänd |
| Vinkel | — (brief saknas i repot) | PD — statisk: symptom i två korta meningar, spec, åtkomst, passform | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem — 'Solljus in i tanken. Alger i vattnet.' | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyg stänger ute ljuset helt; öppningen upptill går rakt till locket | okänd |
| Tro | — (brief saknas i repot) | specen + blixtlås/topplock (batch #6:s variabel) | okänd |
| Positionering | — (brief saknas i repot) | 'Stänger ute ljuset, inte locket' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** annonsen fick 47 kr (1 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn; 1 LPV.

**Nästa annonser:**
- SLÄPP — 47 kr, statisk tvilling till PD_10_H1 som ännu inte är live (Creative strat review); domen om blixtlås/topplock-specen ska falla på videon, inte på bilden.

### Lärdom L-120250260663910291 — IBC_CS_7_1 (LOSER, etikett 2026-09-24)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-17 – 2026-09-23 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 38 kr / 4 190 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,69 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "489 kr styck – 2-pack ger 15 % rabatt + fri frakt. Rabatten läggs på automatiskt när du väljer två stycken, ingen kod behövs. Samma 210D Oxford-tyg och samma UV-skydd – bara till lägre pris per styck." · Rubrik: "2-pack: 15 % rabatt + fri frakt" · Beskrivning: ingen
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | odlare/tankägare med flera tankar (2-pack) | okänd |
| Vinkel | — (brief saknas i repot) | CS — 2-packserbjudande: 15 % rabatt + fri frakt vid två | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen vill ha två | okänd |
| Mekanism | — (brief saknas i repot) | samma 210D Oxford-tyg och samma UV-skydd, lägre pris per styck | okänd |
| Tro | — (brief saknas i repot) | 'Rabatten läggs på automatiskt när du väljer två' — ⚠ dna.md 2026-09-20: sidan har EN variant, inget 2-pack; premissen stämmer inte | okänd |
| Positionering | — (brief saknas i repot) | '2-pack: 15 % rabatt + fri frakt' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** 38 kr, 1 LPV, 0 köp — gissning: utfallet är svält, men annonsen lovar ett 2-packspris som inte finns på sidan, så varje klick som når butiken möter ett brutet löfte.

**Nästa annonser:**
- SLÄPP — premissen (2-pack med 15 % rabatt) finns inte på produktsidan (dna.md 2026-09-20); annonsen bör pausas av Axel snarare än itereras. Flerpacks-avataren (odlare-med-flera-tankar) står kvar som gissning i dna.md tills sidan har ett riktigt erbjudande.

### Lärdom L-120250232963230291 — IBC_CS_5_1 (LOSER, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | LOSER |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 35 kr / 5 353 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "489 kr istället för 636 kr — du sparar 147 kr." · Rubrik: "489 kr i stället för 636 kr" · Beskrivning: "Spara 147 kr, 23 % rabatt"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som jämför pris | okänd |
| Vinkel | — (brief saknas i repot) | CS — ren rea statisk: 489 i stället för 636, spara 147 | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt/erbjudande | okänd |
| Mekanism | — (brief saknas i repot) | samma 210D Oxford-tyg som stoppar algerna; blixtlås, öppning upptill | okänd |
| Tro | — (brief saknas i repot) | priset 489/636 kr (verifierat), fri frakt | okänd |
| Positionering | — (brief saknas i repot) | '489 kr i stället för 636 kr' | okänd |
| Brådska | — (brief saknas i repot) | ingen påhittad — bara rabatten | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** annonsen fick 35 kr (1 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — 35 kr; samma pris-bild finns som CS_4_1, CS_3_1 och BOF_15_1 och ingen av dem har fått spend, så en till kopia svarar inte på frågan varför Meta inte visar dem.

### Lärdom L-120250005820750291 — IBC_PD_1_H3 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 26 kr / 8 911 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,92 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | 33 % / 11 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Trött på grönt, algfyllt regnvatten? 💧" · Rubrik: "Klart vatten. Ingen alg. Enkelt." · Beskrivning: "Passar standard 1000L IBC-tank."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | villaägare med IBC-tank för regnvatten i trädgården ('din IBC-tank', 'regnvatten') | okänd |
| Vinkel | — (brief saknas i repot) | PD — vinnarens copy ordagrant, annan videohook (H3) | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem — öppnar på symptomet 'grönt, algfyllt regnvatten' | okänd |
| Mekanism | — (brief saknas i repot) | 'blockerar solljus och UV helt' → vattnet hålls klart, tanken slits inte ut; spec 210D Oxford-tyg, blixtlås, öppning upptill | okänd |
| Tro | — (brief saknas i repot) | ljus ger alger, ett tätt överdrag löser det — beviset är specen, ingen recension eller auktoritet | okänd |
| Positionering | — (brief saknas i repot) | funktion: 'Klart vatten. Ingen alg. Enkelt.' | okänd |
| Brådska | — (brief saknas i repot) | ingen ('Skydda din tank idag 👇' är CTA, ingen deadline) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** hook 33 % / hold 11 % på 26 kr och 1 LPV — gissning: Meta valde H1 av de tre hookarna inom timmar och H3 fick aldrig chansen; siffrorna säger inget om H3-öppningen.

**Nästa annonser:**
- SLÄPP — 26 kr, samma manus som vinnaren; nya hookar på det manuset byggs i batch #8 (PD_12_H1–H3).

### Lärdom L-120250276317180291 — IBC_CO_2_H1 (LOSER, etikett 2026-09-25)

| Fält | Värde |
|---|---|
| Batch | 5 |
| Utfall | LOSER |
| Fönster | 2026-09-18 – 2026-09-24 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 25 kr / 4 454 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,56 |
| Konverteringsgrad | 0,0 % (0 köp / 1 klick) |
| Hook rate / hold rate | 24 % / 8 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Presenningen lossnar i första vinden. Vårt 210D Oxford-tyg sitter kvar i samma vind och stänger ute solljuset helt. Öppningen upptill ger dig locket ändå." · Rubrik: "Vinden tar presenningen" · Beskrivning: ingen
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som i dag använder presenning | okänd |
| Vinkel | — (brief saknas i repot) | CO — konflikt mot presenningen: lossnar i vinden vs 210D sitter kvar (bemöter i praktiken invändningen "en presenning duger") | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning — köparen har redan ett skydd (presenning) | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyg sitter kvar i samma vind och stänger ute solljuset helt; öppning upptill | okänd |
| Tro | — (brief saknas i repot) | sidans egen presenningsrad; ingen demo av vinden i texten (videon ej läst) | okänd |
| Positionering | — (brief saknas i repot) | 'Vinden tar presenningen' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** hook 24 % / hold 8 % på 25 kr, 1 klick — gissning: svält, ingen läsning; men invändningen annonsen bemöter är den som faktiskt står i kommentarerna på PD_1_H1 ("en grön tjockare presenning med ett par spännband duger"), så idén har research bakom sig även om den här videon aldrig fick spend.

**Nästa annonser:**
- `IBC_OB_1_H1` — typ I, parent IBC_CO_2_H1, iteration 1, kalla=voc (invandningar.md 2026-09-22): samma presenningskonflikt men öppnar med kundens egna ord i bild — "En grön presenning med ett par spännband duger väl?" — och svarar med sidans stormrad + 210D-specen; vinkelkoden OB så invändningsannonserna går att skära ut ur datan (naming-convention 2026-09-21). Fyller tomma rutan "Fungerar det / presenning" i invändningsmatrisen.

### Lärdom L-120250231658390291 — IBC_BOF_10_1 (LOSER, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 5 |
| Utfall | LOSER · BOF |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 20 kr / 5 353 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "636 kr blir 489 kr – du sparar 147 kr redan i priset." · Rubrik: "489 kr – frakten ingår" · Beskrivning: "Spara 147 kr, fri frakt"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — pris + frakt + Klarna | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | ingen — bara pris, frakt och betalsätt | okänd |
| Tro | — (brief saknas i repot) | priset 489/636 kr, frakten ingår, Klarna — verifierade mot sidan | okänd |
| Positionering | — (brief saknas i repot) | '489 kr – frakten ingår' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** annonsen fick 20 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — BOF räknas inte i frekvensen; priset ensamt finns i tre bilder redan (BOF_1_1, BOF_10_1, BOF_15_1) och ingen har fått spend.

### Lärdom L-120250135235730291 — IBC_RV_4_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | LOSER |
| Fönster | 2026-09-08 – 2026-09-14 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 19 kr / 15 972 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,72 |
| Konverteringsgrad | 0,0 % (0 köp / 2 klick) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: ""Bra kvalitet och lätt att använda. Passade min 1000 liters tank utan problem."" · Rubrik: "Johan: Passade tanken utan problem" · Beskrivning: "Passar standard 1000L IBC-tank."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som vill se att någon annan köpt och är nöjd | okänd |
| Vinkel | — (brief saknas i repot) | RV — recensionsbild, Johan ordagrant | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning/produkt — recensionen förutsätter att köparen redan vet vad ett överdrag är | okänd |
| Mekanism | — (brief saknas i repot) | 'Passade min 1000 liters tank utan problem' — passform, ingen mekanism | okänd |
| Tro | — (brief saknas i repot) | en namngiven kund på produktsidan (Johan) är nöjd — recensionen är verifierad mot Judge.me enligt dna.md | okänd |
| Positionering | — (brief saknas i repot) | recenserad av riktiga kunder | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** annonsen fick 19 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn; 2 klick.

**Nästa annonser:**
- SLÄPP — 19 kr; samma Johan-citat kördes igen som RV_9_1 (batch #6) med samma svält, så det är inte citatet som avgör utan att recensionsbilder aldrig får spend bredvid vinnaren.

### Lärdom L-120250005857680291 — IBC_GT_1_H3 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 15 kr / 8 911 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,92 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | 33 % / 12 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Vet du någon som klagat på alger i sin IBC-tank i flera somrar? 🎁" · Rubrik: "Presenten han faktiskt använder" · Beskrivning: "Enkel gåva. Stor uppskattning."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | partner (fru) som köper present till mannen med IBC-tank | okänd |
| Vinkel | — (brief saknas i repot) | GT — gåva, berättelse i jag-form | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem hos mottagaren ('klagat på alger i flera somrar'); köparen själv är inte tankägare | okänd |
| Mekanism | — (brief saknas i repot) | ingen — produkten beskrivs inte, bara utfallet 'visar upp tanken för alla grannar' | okänd |
| Tro | — (brief saknas i repot) | en present som löser ett gammalt problem uppskattas — inget produktbevis | okänd |
| Positionering | — (brief saknas i repot) | 'Presenten han faktiskt använder' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** hook 33 % / hold 12 % på 15 kr, status WITH_ISSUES i kontot — gissning: annonsen svalt och har dessutom ett leveransproblem (WITH_ISSUES) som ingen kreativ ändring löser.

**Nästa annonser:**
- SLÄPP — 15 kr och WITH_ISSUES; GT-vinkeln har fått fem försök utan riktig budget (dna.md), och en sjätte kopia av samma berättelse tillför inget — GT prövas bara igen om Axel ger den ett eget test-ABO.

### Lärdom L-120250102827960291 — IBC_BOF_3_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER · BOF |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 15 kr / 14 949 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,98 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Passar den på min tank? Måtten är 120 × 100 × 116 cm — standard för en 1000-literstank." · Rubrik: "120×100×116 cm, standard 1000L" · Beskrivning: "30 dagars öppet köp om den inte passar."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — invändningen 'passar den min tank?' | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | måtten 120 × 100 × 116 cm, standard 1000 L | okänd |
| Tro | — (brief saknas i repot) | måtten verifierade mot sidan; 30 dagars öppet köp som säkerhetsnät | okänd |
| Positionering | — (brief saknas i repot) | '120×100×116 cm, standard 1000L' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** annonsen fick 15 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — BOF, 15 kr; passformsinvändningen har fått tre bilder (BOF_3_1, BOF_14_1, BOF_18_1) och ingen spend — inte en fjärde.

### Lärdom L-120250102960530291 — IBC_CS_3_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | LOSER |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 14 kr / 14 949 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,98 |
| Konverteringsgrad | 0,0 % (0 köp / 1 klick) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "489 kr istället för 636 kr. Tyget är 210D Oxford och stänger ute ljuset — algerna kommer aldrig igång. 23 % rabatt." · Rubrik: "23 % rabatt — 210D Oxford-tyg" · Beskrivning: "Fri frakt över 300 kr."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som jämför pris | okänd |
| Vinkel | — (brief saknas i repot) | CS — rea + fakta: pris, spec, 23 % | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt/erbjudande | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford stänger ute ljuset — algerna kommer aldrig igång | okänd |
| Tro | — (brief saknas i repot) | priset 489/636 kr + specen; fri frakt över 300 kr | okänd |
| Positionering | — (brief saknas i repot) | '23 % rabatt — 210D Oxford-tyg' | okänd |
| Brådska | — (brief saknas i repot) | ingen påhittad | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** annonsen fick 14 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn; 1 klick.

**Nästa annonser:**
- SLÄPP — 14 kr; den rena rean utan brådska är redan täckt av CS_4_1/CS_5_1 (statisk) och CS_8_H1/CS_9_H1 (video).

### Lärdom L-120250005835180291 — IBC_GT_1_H1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 12 kr / 8 911 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,92 |
| Konverteringsgrad | 0,0 % (0 köp / 2 LPV) |
| Hook rate / hold rate | 42 % / 13 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Vet du någon som klagat på alger i sin IBC-tank i flera somrar? 🎁" · Rubrik: "Presenten han faktiskt använder" · Beskrivning: "Enkel gåva. Stor uppskattning."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | partner (fru) som köper present till mannen med IBC-tank | okänd |
| Vinkel | — (brief saknas i repot) | GT — gåva, berättelse i jag-form | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem hos mottagaren ('klagat på alger i flera somrar'); köparen själv är inte tankägare | okänd |
| Mekanism | — (brief saknas i repot) | ingen — produkten beskrivs inte, bara utfallet 'visar upp tanken för alla grannar' | okänd |
| Tro | — (brief saknas i repot) | en present som löser ett gammalt problem uppskattas — inget produktbevis | okänd |
| Positionering | — (brief saknas i repot) | 'Presenten han faktiskt använder' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** hook 42 % / hold 13 % på 12 kr, WITH_ISSUES — gissning: berättelsen fångar (hook i nivå med vinnaren) men annonsen har ett leveransproblem och fick aldrig spend; ingen slutsats om gåvovinkeln.

**Nästa annonser:**
- SLÄPP — 12 kr och WITH_ISSUES; se IBC_GT_1_H3:s lärdom, samma berättelse.

### Lärdom L-120250005827300291 — IBC_SP_2_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 12 kr / 8 911 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,92 |
| Konverteringsgrad | 0,0 % (0 köp / 4 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: ""Äntligen klart vatten i tanken — inga alger på hela sommaren!" ⭐⭐⭐⭐⭐" · Rubrik: "Klart vatten hela sommaren" · Beskrivning: "Betygsatt av riktiga trädgårdsägare."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | trädgårdsägare med algig tank ('hundratals trädgårdsägare') | okänd |
| Vinkel | — (brief saknas i repot) | SP — samma social proof-copy som SP_1 som statisk bild (bilden ej granskad) | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning — citatet beskriver resultatet 'klart vatten hela sommaren' | okänd |
| Mekanism | — (brief saknas i repot) | 'Blockerar UV och sol helt' som punkt, inte förklarad; blixtlås, åtkomst till locket | okänd |
| Tro | — (brief saknas i repot) | andra har köpt och är nöjda — 'hundratals trädgårdsägare' är obelagt (10 recensioner på sidan, dna.md) och citatet är inte hämtat ur en namngiven recension | okänd |
| Positionering | — (brief saknas i repot) | kundfavoriten: 'Se varför kunderna älskar det' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** annonsen fick 12 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn; 4 LPV.

**Nästa annonser:**
- SLÄPP — 12 kr, obelagt "hundratals"; SP lever vidare i IBC_SP_3_H1:s lärdom.

### Lärdom L-120250078091950291 — IBC_PD_3_1 (LOSER, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | LOSER |
| Fönster | 2026-09-03 – 2026-09-09 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 10 kr / 14 561 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,32 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "210D Oxford-tyget blockerar UV-ljus och håller borta alger. Blixtlåset går att sätta på under två minuter. Öppningen upptill ger åtkomst till locket utan att ta av hela överdraget." · Rubrik: "Sätt på blixtlåset på 2 minuter" · Beskrivning: "210D Oxford-tyg, blixtlås, öppning upptill"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare | okänd |
| Vinkel | — (brief saknas i repot) | PD — spec-först statisk: UV, blixtlås under två minuter, öppning upptill | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyget blockerar UV-ljus och håller borta alger; blixtlåset på under två minuter | okänd |
| Tro | — (brief saknas i repot) | specen + tidsangivelsen "under två minuter" (⚠ sidan anger ingen tid — batch #8 förbjuder "2 minuter") | okänd |
| Positionering | — (brief saknas i repot) | 'Sätt på blixtlåset på 2 minuter' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** annonsen fick 10 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — 10 kr; fact-first statisk har svultit i fyra assets och rubrikens "2 minuter" är en tidsangivelse sidan inte stöder.

### Lärdom L-120250231739360291 — IBC_BOF_12_1 (LOSER, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 5 |
| Utfall | LOSER · BOF |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 10 kr / 5 353 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Räcker skugga mot UV på IBC-tanken? Nej." · Rubrik: "Skugga räcker inte mot UV" · Beskrivning: "210D-tyg tar UV-smällen"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — invändningen 'räcker skugga?' | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | 210D-tyget tar UV-strålningen i stället för plasten | okänd |
| Tro | — (brief saknas i repot) | fråga + svar ("Nej.") + pris 489/636 kr | okänd |
| Positionering | — (brief saknas i repot) | 'Skugga räcker inte mot UV' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** annonsen fick 10 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — BOF, 10 kr; skugga-invändningen finns också som BOF_8_1 (3 kr) — ingen av dem har visats, så en tredje bild svarar inte på varför.

### Lärdom L-120250154956130291 — IBC_GT_4_H1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 10 kr / 16 091 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,67 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 37 % / 3 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Present till den som just skaffat en IBC-tank." · Rubrik: "Blixtlås, inte presenning" · Beskrivning: "Passar standard 1000-liters IBC-tank."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som köper present till någon som just skaffat en IBC-tank | okänd |
| Vinkel | — (brief saknas i repot) | GT — konkret mottagare (nyinflyttad tankägare), blixtlås vs presenning | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning hos mottagaren, problem hos köparen (vet att tanken blir grön) | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyg stänger ute ljuset som får algerna att växa; blixtlås i stället för presenning och gummiband | okänd |
| Tro | — (brief saknas i repot) | specen | okänd |
| Positionering | — (brief saknas i repot) | 'Blixtlås, inte presenning' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** hook 37 % / hold 3 % på 10 kr — gissning: hooken (present till ny tankägare) stoppar lika många som vinnaren men 10 kr är ingen leverans, så gåvovinkeln är fortfarande otestad — femte gången (dna.md).

**Nästa annonser:**
- SLÄPP — ingen leverans (10 kr); GT prövas bara igen i ett eget test-ABO med lika budget (CLAUDE.md regel 11), inte som en sjätte annons bredvid PD_1_H1.

### Lärdom L-120250154950960291 — IBC_CS_4_H1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-09 – 2026-09-15 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 9 kr / 16 091 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,67 |
| Konverteringsgrad | 0,0 % (0 köp / 1 klick) |
| Hook rate / hold rate | 23 % / 3 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "489 kr istället för 636 kr — 147 kr mindre." · Rubrik: "489 kr istället för 636 kr" · Beskrivning: "Spara 147 kr — 23 % rabatt."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som jämför pris | okänd |
| Vinkel | — (brief saknas i repot) | CS — ren rea: 489/636, 147 kr mindre, spec, 23 % | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt/erbjudande | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyg blockerar solljus och UV helt | okänd |
| Tro | — (brief saknas i repot) | priset (verifierat) + specen | okänd |
| Positionering | — (brief saknas i repot) | '489 kr istället för 636 kr' | okänd |
| Brådska | — (brief saknas i repot) | ingen påhittad | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** hook 23 % / hold 3 % på 9 kr — gissning: ingen leverans, ingen läsning; prisvideon utan brådska får sin riktiga chans i CS_8_H1/CS_9_H1.

**Nästa annonser:**
- SLÄPP — ingen leverans (9 kr); samma hypotes är omtagen i IBC_CS_8_H1 (batch #6) och IBC_CS_9_H1 (batch #7).

### Lärdom L-120250233029760291 — IBC_RV_5_1 (INGEN_LEVERANS, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 8 kr / 5 353 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: ""Bra material och känns stabilt."" · Rubrik: "Bra material, lätt att montera" · Beskrivning: "Verifierad recension"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som vill se att någon annan köpt och är nöjd | okänd |
| Vinkel | — (brief saknas i repot) | RV — recensionsbild, Magnus ordagrant | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning/produkt — recensionen förutsätter att köparen redan vet vad ett överdrag är | okänd |
| Mekanism | — (brief saknas i repot) | 'Bra material och känns stabilt', 'Lätt att montera' — material och montering | okänd |
| Tro | — (brief saknas i repot) | en namngiven kund på produktsidan (Magnus) är nöjd — recensionen är verifierad mot Judge.me enligt dna.md | okänd |
| Positionering | — (brief saknas i repot) | recenserad av riktiga kunder | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** annonsen fick 8 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — ingen leverans (8 kr); recensionsbilder (RV_1–RV_12) har fått 0–19 kr var — problemet är formatets plats bredvid vinnaren, inte Magnus citat.

### Lärdom L-120250005852720291 — IBC_GT_1_H2 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 7 kr / 8 911 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,92 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 39 % / 9 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Vet du någon som klagat på alger i sin IBC-tank i flera somrar? 🎁" · Rubrik: "Presenten han faktiskt använder" · Beskrivning: "Enkel gåva. Stor uppskattning."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | partner (fru) som köper present till mannen med IBC-tank | okänd |
| Vinkel | — (brief saknas i repot) | GT — gåva, berättelse i jag-form | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem hos mottagaren ('klagat på alger i flera somrar'); köparen själv är inte tankägare | okänd |
| Mekanism | — (brief saknas i repot) | ingen — produkten beskrivs inte, bara utfallet 'visar upp tanken för alla grannar' | okänd |
| Tro | — (brief saknas i repot) | en present som löser ett gammalt problem uppskattas — inget produktbevis | okänd |
| Positionering | — (brief saknas i repot) | 'Presenten han faktiskt använder' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** hook 39 % / hold 9 % på 7 kr — gissning: ingen leverans, berättelsen är oprövad; samma som GT_1_H1/H3.

**Nästa annonser:**
- SLÄPP — ingen leverans (7 kr); se IBC_GT_1_H3:s lärdom.

### Lärdom L-120250105772210291 — IBC_PD_3_H1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 7 kr / 14 949 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 26 % / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "210D Oxford-tyg. Ingen sol når vattnet." · Rubrik: "210D Oxford-tyg. Ingen alg." · Beskrivning: ingen
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare | okänd |
| Vinkel | — (brief saknas i repot) | PD med pris — fact-first: '210D Oxford-tyg. Ingen sol når vattnet.' + '489 kr (ord. 636 kr)' (⚠ pris i PD) | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning — specen först (batch #1:s fact-first-hypotes är utförd i texten) | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyg stänger ute ljuset – algerna kommer aldrig igång | okänd |
| Tro | — (brief saknas i repot) | specen + priset | okänd |
| Positionering | — (brief saknas i repot) | 'Ett skydd, ingen grön tank i sommar' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** hook 26 % på 7 kr — gissning: ingen leverans; fact-first-hooken är utförd som planerat men aldrig visad, så batch #1:s hypotes är obesvarad, inte motbevisad.

**Nästa annonser:**
- SLÄPP — ingen leverans (7 kr) och priset bryter PD-regeln; fact-first prövas inte igen förrän PD_12-serien svarat på om hooken alls är variabeln som bär.

### Lärdom L-120250233113130291 — IBC_RV_6_1 (INGEN_LEVERANS, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 6 kr / 5 353 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: ""Ett enkelt och praktiskt överdrag."" · Rubrik: "Enkelt och praktiskt" · Beskrivning: "Verifierad recension"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som vill se att någon annan köpt och är nöjd | okänd |
| Vinkel | — (brief saknas i repot) | RV — recensionsbild, Peter ordagrant | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning/produkt — recensionen förutsätter att köparen redan vet vad ett överdrag är | okänd |
| Mekanism | — (brief saknas i repot) | 'Ett enkelt och praktiskt överdrag' — inget om mekanismen | okänd |
| Tro | — (brief saknas i repot) | en namngiven kund på produktsidan (Peter) är nöjd — recensionen är verifierad mot Judge.me enligt dna.md | okänd |
| Positionering | — (brief saknas i repot) | recenserad av riktiga kunder | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** annonsen fick 6 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — ingen leverans (6 kr); se IBC_RV_5_1.

### Lärdom L-120250103102350291 — IBC_RV_2_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 5 kr / 14 949 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: ""Köpte detta för min regnvattentank. Fungerar bra och är enkelt att öppna när jag behöver." — Lena, ★★★★★" · Rubrik: "Lena: Enkelt att öppna" · Beskrivning: "Passar 1000L-tank. 489 kr."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som vill se att någon annan köpt och är nöjd | okänd |
| Vinkel | — (brief saknas i repot) | RV — recensionsbild, Lena ordagrant | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning/produkt — recensionen förutsätter att köparen redan vet vad ett överdrag är | okänd |
| Mekanism | — (brief saknas i repot) | 'Enkelt att öppna när jag behöver' — åtkomst | okänd |
| Tro | — (brief saknas i repot) | en namngiven kund på produktsidan (Lena) är nöjd — recensionen är verifierad mot Judge.me enligt dna.md; '489 kr' i beskrivningen | okänd |
| Positionering | — (brief saknas i repot) | recenserad av riktiga kunder | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** annonsen fick 5 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — ingen leverans (5 kr); Lenas citat bär redan i IBC_SP_3_H1 och vidare i dess nästa annons.

### Lärdom L-120250005824980291 — IBC_SP_1_H2 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 5 kr / 8 911 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,92 |
| Konverteringsgrad | 0,0 % (0 köp / 1 klick) |
| Hook rate / hold rate | 65 % / 8 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: ""Äntligen klart vatten i tanken — inga alger på hela sommaren!" ⭐⭐⭐⭐⭐" · Rubrik: "Klart vatten hela sommaren" · Beskrivning: "Betygsatt av riktiga trädgårdsägare."
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | trädgårdsägare med algig tank ('hundratals trädgårdsägare') | okänd |
| Vinkel | — (brief saknas i repot) | SP — social proof: citat med fem stjärnor + volympåstående + tre ✓ | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning — citatet beskriver resultatet 'klart vatten hela sommaren' | okänd |
| Mekanism | — (brief saknas i repot) | 'Blockerar UV och sol helt' som punkt, inte förklarad; blixtlås, åtkomst till locket | okänd |
| Tro | — (brief saknas i repot) | andra har köpt och är nöjda — 'hundratals trädgårdsägare' är obelagt (10 recensioner på sidan, dna.md) och citatet är inte hämtat ur en namngiven recension | okänd |
| Positionering | — (brief saknas i repot) | kundfavoriten: 'Se varför kunderna älskar det' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** hook rate 65 % på 5 kr och 1 klick — gissning: siffran är brus på ett tiotal visningar; ingen leverans, ingen slutsats.

**Nästa annonser:**
- SLÄPP — ingen leverans (5 kr), obelagt "hundratals"; SP lever vidare i IBC_SP_3_H1:s lärdom.

### Lärdom L-120250233239120291 — IBC_GT_5_H1 (INGEN_LEVERANS, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 5 kr / 5 353 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | 16 % / 8 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Vattnet i IBC-tanken blev grönt av alger." · Rubrik: "Grönt vatten? Stäng ute ljuset" · Beskrivning: "210D Oxford-tyg mot alger"
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som sett grönt vatten — ⚠ ingen gåvoköpare i texten | okänd |
| Vinkel | — (brief saknas i repot) | PD i praktiken — symptom, orsak, spec; batch #4 planerade GT (kompis som skaffat tank) men texten har ingen gåvo-inramning | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem — 'Vattnet i IBC-tanken blev grönt av alger' | okänd |
| Mekanism | — (brief saknas i repot) | ljus in genom plasten får algerna att växa; 210D Oxford-tyg stänger ute ljuset helt | okänd |
| Tro | — (brief saknas i repot) | specen | okänd |
| Positionering | — (brief saknas i repot) | 'Grönt vatten? Stäng ute ljuset' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** ja · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** hook 16 % / hold 8 % på 5 kr — gissning: ingen leverans; och eftersom den live copyn saknar gåvo-inramningen helt är det inte GT som kördes utan en femte PD-variant, så GT-vinkelns femte försök (dna.md) ägde aldrig rum.

**Nästa annonser:**
- SLÄPP — ingen leverans (5 kr) och utförandet följde inte konceptet (PD-text under GT-namn); GT prövas bara igen i ett eget test-ABO, se IBC_GT_4_H1.

### Lärdom L-120250134665590291 — IBC_BOF_6_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-08 – 2026-09-14 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 4 kr / 15 972 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,72 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Fri frakt inom Sverige, 5–10 arbetsdagar." · Rubrik: "Fri frakt, 5–10 arbetsdagar" · Beskrivning: "Klarna – betala sen. 30 dagars öppet köp."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — frakt/leverans | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | ingen — frakttid, Klarna, öppet köp | okänd |
| Tro | — (brief saknas i repot) | sidans egen fraktrad '5–10 arbetsdagar' | okänd |
| Positionering | — (brief saknas i repot) | 'Fri frakt, 5–10 arbetsdagar' | okänd |
| Brådska | — (brief saknas i repot) | mild: 'Beställ nu så är den på plats innan tanken hinner grönska' (säsong, ingen påhittad deadline) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** annonsen fick 4 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — BOF, ingen leverans (4 kr); frakt/öppet köp finns i BOF_2/6/9/11 — fyra bilder utan spend.

### Lärdom L-120250231860540291 — IBC_RV_8_1 (INGEN_LEVERANS, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 5 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 4 kr / 5 353 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: ""Bra produkt för pengarna." – Daniel." · Rubrik: "Daniel: passar utan krångel" · Beskrivning: "489 kr, jämförpris 636"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som vill se att någon annan köpt och är nöjd | okänd |
| Vinkel | — (brief saknas i repot) | RV — recensionsbild, Daniel ordagrant | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning/produkt — recensionen förutsätter att köparen redan vet vad ett överdrag är | okänd |
| Mekanism | — (brief saknas i repot) | 'Bra produkt för pengarna', 'passar min IBC-tank' — pris och passform | okänd |
| Tro | — (brief saknas i repot) | en namngiven kund på produktsidan (Daniel) är nöjd — recensionen är verifierad mot Judge.me enligt dna.md; pris 489/636 kr i texten | okänd |
| Positionering | — (brief saknas i repot) | recenserad av riktiga kunder | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** annonsen fick 4 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — ingen leverans (4 kr); se IBC_RV_5_1.

### Lärdom L-120250105818500291 — IBC_GT_3_H1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 1 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 4 kr / 14 949 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 27 % / 9 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Vet du någon som klagat på alger i sin IBC-tank i flera somrar?" · Rubrik: "Ge skyddet i present. Slipp algskrubben." · Beskrivning: ingen
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | den som köper present till en tankägare som klagat på alger | okänd |
| Vinkel | — (brief saknas i repot) | GT — gåva + spec + pris + betyg | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem hos mottagaren | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyg stänger ute solljuset – ingen alg får fäste | okänd |
| Tro | — (brief saknas i repot) | specen, priset 489/636 kr och '4,4 av 5 på produktsidan' — ⚠ betyget är fel (verifierat 4,7 av 5, dna.md 2026-09-20) | okänd |
| Positionering | — (brief saknas i repot) | 'Ge skyddet i present. Slipp algskrubben.' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** hook 27 % / hold 9 % på 4 kr — gissning: ingen leverans; dessutom står ett felaktigt betyg (4,4) i copyn, så annonsen ska inte visas i den här formen ens om den fick spend.

**Nästa annonser:**
- SLÄPP — ingen leverans (4 kr) och fel aggregat i copyn (4,4 mot verifierat 4,7); GT prövas bara igen i eget test-ABO, se IBC_GT_4_H1.

### Lärdom L-120250231698060291 — IBC_BOF_11_1 (INGEN_LEVERANS, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 5 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 4 kr / 5 353 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Passar inte tanken? Skicka tillbaka inom 30 dagar och få pengarna." · Rubrik: "30 dagars öppet köp" · Beskrivning: "Ingen risk att testa"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — risk: passar den inte? | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | ingen — 30 dagars öppet köp, Klarna | okänd |
| Tro | — (brief saknas i repot) | öppet köp och Klarna verifierade mot sidan | okänd |
| Positionering | — (brief saknas i repot) | '30 dagars öppet köp' / 'Ingen risk att testa' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** annonsen fick 4 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — BOF, ingen leverans (4 kr); öppet köp finns i BOF_2_1/BOF_9_1/BOF_11_1 utan spend.

### Lärdom L-120250135358520291 — IBC_RV_3_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-08 – 2026-09-14 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 4 kr / 15 972 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,72 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: ""Passar bra på tanken och skyddar mot solen. Precis vad jag behövde."" · Rubrik: "Sofia: Skyddar mot solen" · Beskrivning: "489 kr, 23 % rabatt."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som vill se att någon annan köpt och är nöjd | okänd |
| Vinkel | — (brief saknas i repot) | RV — recensionsbild, Sofia ordagrant | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning/produkt — recensionen förutsätter att köparen redan vet vad ett överdrag är | okänd |
| Mekanism | — (brief saknas i repot) | 'skyddar mot solen' — sol/UV | okänd |
| Tro | — (brief saknas i repot) | en namngiven kund på produktsidan (Sofia) är nöjd — recensionen är verifierad mot Judge.me enligt dna.md; pris '489 kr, 23 % rabatt' i texten | okänd |
| Positionering | — (brief saknas i repot) | recenserad av riktiga kunder | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** annonsen fick 4 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — ingen leverans (4 kr); samma Sofia-citat kördes igen som RV_10_1 (0 kr) — se IBC_RV_5_1.

### Lärdom L-120250102989510291 — IBC_RV_1_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 3 kr / 14 949 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: ""Jag är nöjd. Nu slipper jag mycket solljus på tanken och det ser även snyggare ut." — Maria, ★★★★★" · Rubrik: "Maria: Jag är nöjd" · Beskrivning: "210D Oxford-tyg. 489 kr."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som vill se att någon annan köpt och är nöjd | okänd |
| Vinkel | — (brief saknas i repot) | RV — recensionsbild, Maria ordagrant | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning/produkt — recensionen förutsätter att köparen redan vet vad ett överdrag är | okänd |
| Mekanism | — (brief saknas i repot) | 'slipper mycket solljus på tanken' — sol | okänd |
| Tro | — (brief saknas i repot) | en namngiven kund på produktsidan (Maria) är nöjd — recensionen är verifierad mot Judge.me enligt dna.md | okänd |
| Positionering | — (brief saknas i repot) | recenserad av riktiga kunder | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** annonsen fick 3 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — ingen leverans (3 kr); Marias citat bär redan i IBC_SP_3_H1.

### Lärdom L-120250233418110291 — IBC_BOF_8_1 (INGEN_LEVERANS, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 3 kr / 5 353 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Skuggan flyttar sig under dagen." · Rubrik: "Skuggan flyttar sig, skyddet inte" · Beskrivning: "Skyddar oavsett placering"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — invändningen 'räcker skugga?' | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | skuggan flyttar sig under dagen, tanken får sol ändå; överdraget skyddar oavsett placering | okänd |
| Tro | — (brief saknas i repot) | resonemang, ingen spec och inget pris | okänd |
| Positionering | — (brief saknas i repot) | 'Skuggan flyttar sig, skyddet inte' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** annonsen fick 3 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — BOF, ingen leverans (3 kr); se IBC_BOF_12_1 (samma invändning).

### Lärdom L-120250232831340291 — IBC_BOF_7_1 (INGEN_LEVERANS, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 kr / 5 353 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Plasten blir spröd i solen." · Rubrik: "Tyget tar smällen, inte tanken" · Beskrivning: "210D Oxford-tyg mot UV"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — investeringsskydd: plasten blir spröd | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyget tar UV-strålningen i stället för plasten | okänd |
| Tro | — (brief saknas i repot) | sidans UV-fakta | okänd |
| Positionering | — (brief saknas i repot) | 'Tyget tar smällen, inte tanken' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** annonsen fick 2 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn; tankens livslängd som löfte är ändå vinnarens andra rad ("tanken slits inte ut i förtid") och kan bära en egen video senare.

**Nästa annonser:**
- SLÄPP — BOF, ingen leverans (2 kr); "tanken slits inte ut" lever redan i PD_1_H1:s manus och ärvs av PD_12-serien.

### Lärdom L-120250260581300291 — IBC_SP_5_H1 (INGEN_LEVERANS, etikett 2026-09-24)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-17 – 2026-09-23 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 kr / 4 190 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,69 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | 88 % / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Tyget släpper inte igenom en enda solstråle. Öppningen upptill gör att du når locket utan att lyfta av hela överdraget. UV och dagsljus når aldrig plasten under tyget, så algerna får inget att växa av. 4,7 av 5 på 10 recensioner, 489 kr (ord. 636 kr)." · Rubrik: "Blockerar UV – 4,7 av 5" · Beskrivning: ingen
- VO: ej läst (bara text lästs) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare | okänd |
| Vinkel | — (brief saknas i repot) | SP/PD — mekanism i tre rader + verifierat aggregat + pris | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning — 'Tyget släpper inte igenom en enda solstråle' | okänd |
| Mekanism | — (brief saknas i repot) | UV och dagsljus når aldrig plasten under tyget, så algerna får inget att växa av; öppning upptill | okänd |
| Tro | — (brief saknas i repot) | '4,7 av 5 på 10 recensioner' — det verifierade aggregatet (dna.md 2026-09-20), första gången rätt i en annons; pris 489/636 kr | okänd |
| Positionering | — (brief saknas i repot) | 'Blockerar UV – 4,7 av 5' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** hook rate 88 % på 2 kr — gissning: siffran är brus på ett fåtal visningar; ingen leverans, så det ärliga aggregatet är otestat.

**Nästa annonser:**
- SLÄPP — ingen leverans (2 kr); det verifierade aggregatet 4,7 av 5 tas i stället in i IBC_SP_6_H1 (lärdomen för IBC_SP_3_H1), som har 949 kr data att bygga på.

### Lärdom L-120250103001370291 — IBC_BOF_2_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 2 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-05 – 2026-09-11 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 kr / 14 949 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,98 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Gillar du inte tanköverdraget? Skicka tillbaka det inom 30 dagar. Du får pengarna tillbaka." · Rubrik: "30 dagars öppet köp" · Beskrivning: "Pengarna tillbaka om du ångrar dig."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — risk: gillar du det inte? | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | ingen — 30 dagars öppet köp | okänd |
| Tro | — (brief saknas i repot) | öppet köp verifierat mot sidan | okänd |
| Positionering | — (brief saknas i repot) | '30 dagars öppet köp' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** annonsen fick 2 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — BOF, ingen leverans (2 kr); se IBC_BOF_11_1.

### Lärdom L-120250232931560291 — IBC_BOF_9_1 (INGEN_LEVERANS, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 4 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 kr / 5 353 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "30 dagars öppet köp på tanköverdraget." · Rubrik: "30 dagars öppet köp" · Beskrivning: "Fri frakt · Klarna"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — riskfri-kombo: öppet köp + fri frakt + Klarna | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | ingen | okänd |
| Tro | — (brief saknas i repot) | sidans garanti- och fraktrader | okänd |
| Positionering | — (brief saknas i repot) | '30 dagars öppet köp' / 'Fri frakt · Klarna' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** annonsen fick 2 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — BOF, ingen leverans (2 kr); se IBC_BOF_11_1.

### Lärdom L-120250231826110291 — IBC_RV_7_1 (INGEN_LEVERANS, etikett 2026-09-22)

| Fält | Värde |
|---|---|
| Batch | 5 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-15 – 2026-09-21 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 kr / 5 353 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,39 |
| Konverteringsgrad | okänd — hämta inline_link_clicks/landing_page_view i etikettjobbet |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: ""Fungerar precis som jag hade hoppats." – Karin." · Rubrik: "Karin: bra skydd utomhus" · Beskrivning: "489 kr, jämförpris 636"
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som vill se att någon annan köpt och är nöjd | okänd |
| Vinkel | — (brief saknas i repot) | RV — recensionsbild, Karin ordagrant | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning/produkt — recensionen förutsätter att köparen redan vet vad ett överdrag är | okänd |
| Mekanism | — (brief saknas i repot) | 'Bra skydd för min tank utomhus' — utomhusbruk | okänd |
| Tro | — (brief saknas i repot) | en namngiven kund på produktsidan (Karin) är nöjd — recensionen är verifierad mot Judge.me enligt dna.md; pris 489/636 kr i texten; Karin är 4★ på sidan (dna.md 2026-09-20), ej utskrivet i annonsen | okänd |
| Positionering | — (brief saknas i repot) | recenserad av riktiga kunder | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** annonsen fick 2 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — ingen leverans (2 kr); se IBC_RV_5_1.

### Lärdom L-120250134494990291 — IBC_CS_4_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-08 – 2026-09-14 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 kr / 15 972 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,72 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "489 kr istället för 636 kr." · Rubrik: "489 kr istället för 636 kr" · Beskrivning: "23 % rabatt. Fri frakt inom Sverige."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som jämför pris | okänd |
| Vinkel | — (brief saknas i repot) | CS — ren rea statisk: 489/636, 147 kr mindre, spec | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt/erbjudande | okänd |
| Mekanism | — (brief saknas i repot) | 210D Oxford-tyg som stänger ute ljuset — algerna kommer aldrig igång | okänd |
| Tro | — (brief saknas i repot) | priset (verifierat) + specen; fri frakt inom Sverige | okänd |
| Positionering | — (brief saknas i repot) | '489 kr istället för 636 kr' | okänd |
| Brådska | — (brief saknas i repot) | ingen påhittad | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** annonsen fick 2 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — ingen leverans (2 kr); samma bild finns som CS_5_1/CS_3_1, se IBC_CS_5_1.

### Lärdom L-120250276257990291 — IBC_RV_9_1 (INGEN_LEVERANS, etikett 2026-09-25)

| Fält | Värde |
|---|---|
| Batch | 6 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-18 – 2026-09-24 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 kr / 4 454 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,56 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Recension från produktsidan. "Bra kvalitet och lätt att använda. Passade min 1000 liters tank utan problem." – Johan. Gör som Johan – täck tanken." · Rubrik: "Johan: passade utan problem" · Beskrivning: ingen
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som vill se att någon annan köpt och är nöjd | okänd |
| Vinkel | — (brief saknas i repot) | RV — recensionsbild, Johan ordagrant | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning/produkt — recensionen förutsätter att köparen redan vet vad ett överdrag är | okänd |
| Mekanism | — (brief saknas i repot) | 'Passade min 1000 liters tank utan problem' — passform (samma citat som RV_4_1) | okänd |
| Tro | — (brief saknas i repot) | en namngiven kund på produktsidan (Johan) är nöjd — recensionen är verifierad mot Judge.me enligt dna.md; CTA 'Gör som Johan – täck tanken' | okänd |
| Positionering | — (brief saknas i repot) | recenserad av riktiga kunder | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** annonsen fick 1 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — ingen leverans (1 kr) och dubblett av RV_4_1:s citat; se IBC_RV_5_1.

### Lärdom L-120250276187240291 — IBC_BOF_15_1 (INGEN_LEVERANS, etikett 2026-09-25)

| Fält | Värde |
|---|---|
| Batch | 6 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-18 – 2026-09-24 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 kr / 4 454 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,56 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "489 kr. Ordinarie pris 636 kr – 23 % rabatt. 147 kr billigare för samma tanköverdrag. Betala 489 kr, inte 636 kr." · Rubrik: "489 kr – inte 636 kr" · Beskrivning: ingen
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — priset ensamt | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | ingen | okänd |
| Tro | — (brief saknas i repot) | priset 489/636 kr, 23 %, 147 kr | okänd |
| Positionering | — (brief saknas i repot) | '489 kr – inte 636 kr' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** annonsen fick 1 kr (0 % av kampanjens spend) bredvid PD_1_H1 som tar 80–88 % — gissning: den vann aldrig auktionen och utfallet säger något om Metas fördelning, inte om copyn.

**Nästa annonser:**
- SLÄPP — BOF, ingen leverans (1 kr); se IBC_BOF_10_1.

### Lärdom L-120250135368810291 — IBC_BOF_4_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | 3 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-08 – 2026-09-14 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 15 972 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,72 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Blixtlås. Inte presenning och gummiband." · Rubrik: "Blixtlås. Inte presenning." · Beskrivning: "Öppning upptill. Passar 1000-liters IBC."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — invändningen 'är det krångligt att sätta på?' | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | på och av med dragkedja — ingen kamp med väder eller vind; öppning upptill | okänd |
| Tro | — (brief saknas i repot) | sidans egen rad 'På och av med dragkedja' | okänd |
| Positionering | — (brief saknas i repot) | 'Blixtlås. Inte presenning.' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** noll spend på sju dagar — gissning: Meta visade den aldrig; installationsinvändningen är därför otestad, inte motbevisad.

**Nästa annonser:**
- SLÄPP — BOF, 0 kr; blixtlåsraden lever i PD_1_H1:s manus och i BOF_13_1, ingen ny bild.

### Lärdom L-120250005858870291 — IBC_GT_2_1 (INGEN_LEVERANS, etikett 2026-09-21)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-08-28 – 2026-09-03 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 8 911 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,92 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Vet du någon som klagat på alger i sin IBC-tank i flera somrar? 🎁" · Rubrik: "Presenten han faktiskt använder" · Beskrivning: "Enkel gåva. Stor uppskattning."
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | partner (fru) som köper present till mannen med IBC-tank | okänd |
| Vinkel | — (brief saknas i repot) | GT — samma gåvoberättelse som GT_1 som statisk bild (bilden ej granskad) | okänd |
| Medvetandenivå | — (brief saknas i repot) | problem hos mottagaren ('klagat på alger i flera somrar'); köparen själv är inte tankägare | okänd |
| Mekanism | — (brief saknas i repot) | ingen — produkten beskrivs inte, bara utfallet 'visar upp tanken för alla grannar' | okänd |
| Tro | — (brief saknas i repot) | en present som löser ett gammalt problem uppskattas — inget produktbevis | okänd |
| Positionering | — (brief saknas i repot) | 'Presenten han faktiskt använder' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** noll spend, WITH_ISSUES — gissning: annonsen har ett leveransproblem i kontot och har aldrig visats.

**Nästa annonser:**
- SLÄPP — 0 kr och WITH_ISSUES; se IBC_GT_1_H3.

### Lärdom L-120250276129690291 — IBC_BOF_13_1 (INGEN_LEVERANS, etikett 2026-09-25)

| Fält | Värde |
|---|---|
| Batch | 6 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-18 – 2026-09-24 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 4 454 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,56 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Hur kommer du åt locket när tanken är täckt? Öppningen upptill går rakt till locket – du drar upp blixtlåset, fyller på och stänger igen. Skyddet sitter kvar, bara öppningen rör sig." · Rubrik: "Öppningen går rakt till locket" · Beskrivning: ingen
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — invändningen 'hur kommer jag åt locket?' | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | öppningen upptill går rakt till locket — dra upp blixtlåset, fyll på, stäng igen | okänd |
| Tro | — (brief saknas i repot) | produktens egen konstruktion (sidan) | okänd |
| Positionering | — (brief saknas i repot) | 'Öppningen går rakt till locket' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** noll spend på sju dagar — gissning: aldrig visad; åtkomstinvändningen är otestad.

**Nästa annonser:**
- SLÄPP — BOF, 0 kr; åtkomstraden ("öppning upptill, du kommer åt locket ändå") ligger redan i vinnarens manus.

### Lärdom L-120250276280330291 — IBC_RV_10_1 (INGEN_LEVERANS, etikett 2026-09-25)

| Fält | Värde |
|---|---|
| Batch | 6 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-18 – 2026-09-24 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 4 454 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,56 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Recension från produktsidan. "Passar bra på tanken och skyddar mot solen. Precis vad jag behövde." – Sofia. Gör som Sofia – skydda tanken mot solen." · Rubrik: "Sofia: skyddar mot solen" · Beskrivning: ingen
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som vill se att någon annan köpt och är nöjd | okänd |
| Vinkel | — (brief saknas i repot) | RV — recensionsbild, Sofia ordagrant | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning/produkt — recensionen förutsätter att köparen redan vet vad ett överdrag är | okänd |
| Mekanism | — (brief saknas i repot) | 'skyddar mot solen' (samma citat som RV_3_1) | okänd |
| Tro | — (brief saknas i repot) | en namngiven kund på produktsidan (Sofia) är nöjd — recensionen är verifierad mot Judge.me enligt dna.md; CTA 'Gör som Sofia' | okänd |
| Positionering | — (brief saknas i repot) | recenserad av riktiga kunder | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** noll spend på sju dagar — gissning: aldrig visad; dubblett av RV_3_1.

**Nästa annonser:**
- SLÄPP — 0 kr och dubblett av RV_3_1:s citat; se IBC_RV_5_1.

### Lärdom L-120250276155820291 — IBC_BOF_14_1 (INGEN_LEVERANS, etikett 2026-09-25)

| Fält | Värde |
|---|---|
| Batch | 6 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-18 – 2026-09-24 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 4 454 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,56 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Text (primärtext), rad 1: "Passar den verkligen din IBC-tank? 120 × 100 × 116 cm – måtten för en standard 1000 L IBC-tank. Byggd efter de måtten, inte en universalpresenning. Mät inte – den är gjord för din tank." · Rubrik: "120 × 100 × 116 cm – din tank" · Beskrivning: ingen
- Bild/inbränd text: ej granskad (bara text läst)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som redan sett produkten och tvekar (BOF) | okänd |
| Vinkel | — (brief saknas i repot) | BOF — invändningen 'passar den verkligen min tank?' | okänd |
| Medvetandenivå | — (brief saknas i repot) | produkt — förutsätter att köparen redan övervägt överdraget | okänd |
| Mekanism | — (brief saknas i repot) | byggd efter måtten 120 × 100 × 116 cm, inte en universalpresenning | okänd |
| Tro | — (brief saknas i repot) | måtten verifierade mot sidan | okänd |
| Positionering | — (brief saknas i repot) | '120 × 100 × 116 cm – din tank' | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** noll spend på sju dagar — gissning: aldrig visad; passformsinvändningen är otestad i alla tre bilderna (BOF_3/14/18).

**Nästa annonser:**
- SLÄPP — BOF, 0 kr; se IBC_BOF_3_1.

### Lärdom L-120250301282210291 — IBC_RI_1_1 (LOSER, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | 7 |
| Utfall | LOSER |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 26 kr / 4 527 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,38 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Utan skydd. Med skydd. Vattnet blir grönt av alger utan cover. Presenningen som skulle skydda blåser av vid första höststormen. Sätt på skyddet – vattnet förbli" · rubrik: "Utan skydd. Med skydd."
- Första frame / VO: inte avläst i den här ronden — under 300 kr eller 3 köp, observation utan dom (CLAUDE.md regel 3)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | RI (återkommande kostnad) enligt namnkoden; copyn: "Utan skydd. Med skydd. Vattnet blir grönt av alger utan cover. Presenningen som skulle sky" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Utan skydd. Med skydd. Vattnet blir grönt av alger utan cover. Presenningen som skulle skydda blåser av vid första hösts" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 26.21 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120250301312580291 — IBC_BOF_16_1 (INGEN_LEVERANS, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | 7 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 kr / 4 527 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,38 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "4,7 av 5 på 10 recensioner. IBC-tanköverdraget stoppar alger och UV med tätt 210D Oxford-tyg. Zippa fast skyddet." · rubrik: "4,7 av 5 på 10 recensioner"
- Första frame / VO: inte avläst i den här ronden — under 300 kr eller 3 köp, observation utan dom (CLAUDE.md regel 3)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | BOF (retargeting, invändning) enligt namnkoden; copyn: "4,7 av 5 på 10 recensioner. IBC-tanköverdraget stoppar alger och UV med tätt 210D Oxford-t" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "4,7 av 5 på 10 recensioner. IBC-tanköverdraget stoppar alger och UV med tätt 210D Oxford-tyg. Zippa fast skyddet." | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** Gissning: Meta gav den 1.33 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120250301305600291 — IBC_BOF_17_1 (INGEN_LEVERANS, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | 7 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 4 527 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,38 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Ljuset stannar ute. Vattnet stannar klart. 210D Oxford-tyg blockerar ljuset som annars föder alger. Skyddet stoppar alger och håller UV ute. Sätt på skyddet – v" · rubrik: "Ljuset stannar ute, vattnet klart."
- Första frame / VO: inte avläst i den här ronden — under 300 kr eller 3 köp, observation utan dom (CLAUDE.md regel 3)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | BOF (retargeting, invändning) enligt namnkoden; copyn: "Ljuset stannar ute. Vattnet stannar klart. 210D Oxford-tyg blockerar ljuset som annars föd" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Ljuset stannar ute. Vattnet stannar klart. 210D Oxford-tyg blockerar ljuset som annars föder alger. Skyddet stoppar alge" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** Gissning: Meta gav den 0 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120250301297630291 — IBC_BOF_18_1 (INGEN_LEVERANS, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | 7 |
| Utfall | INGEN_LEVERANS · BOF |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 4 527 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,38 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Passar den min tank? 120 × 100 × 116 cm – byggd för en standard 1000-literstank. Öppningen upptill gör att du når locket utan att ta av skyddet. Kolla måtten oc" · rubrik: "Passar den min tank?"
- Första frame / VO: inte avläst i den här ronden — under 300 kr eller 3 köp, observation utan dom (CLAUDE.md regel 3)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | BOF (retargeting, invändning) enligt namnkoden; copyn: "Passar den min tank? 120 × 100 × 116 cm – byggd för en standard 1000-literstank. Öppningen" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Passar den min tank? 120 × 100 × 116 cm – byggd för en standard 1000-literstank. Öppningen upptill gör att du når locket" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** BOF — räknas inte i frekvensen; lärdomen handlar om invändningen den svarar på.

**Hypotes (gissning):** Gissning: Meta gav den 0 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120250301259210291 — IBC_RV_11_1 (INGEN_LEVERANS, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | 7 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 4 527 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,38 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Anders, 5 stjärnor: "Väldigt bra överdrag. Passar min IBC-tank perfekt och är enkelt att sätta på." 210D Oxford-tyg stoppar alger och UV. Sätt på skyddet – vatt" · rubrik: "Anders, 5 stjärnor"
- Första frame / VO: inte avläst i den här ronden — under 300 kr eller 3 köp, observation utan dom (CLAUDE.md regel 3)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | RV (recension) enligt namnkoden; copyn: "Anders, 5 stjärnor: "Väldigt bra överdrag. Passar min IBC-tank perfekt och är enkelt att s" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Anders, 5 stjärnor: "Väldigt bra överdrag. Passar min IBC-tank perfekt och är enkelt att sätta på." 210D Oxford-tyg stop" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav den 0 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120250301237140291 — IBC_RV_12_1 (INGEN_LEVERANS, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | 7 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 0 kr / 4 527 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,38 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Emma, 4 stjärnor: "Mycket nöjd. Tanken ser mycket bättre ut och överdraget sitter bra." 210D Oxford-tyg stoppar alger och UV. Sätt på skyddet – vattnet förblir " · rubrik: "Emma, 4 stjärnor"
- Första frame / VO: inte avläst i den här ronden — under 300 kr eller 3 köp, observation utan dom (CLAUDE.md regel 3)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | RV (recension) enligt namnkoden; copyn: "Emma, 4 stjärnor: "Mycket nöjd. Tanken ser mycket bättre ut och överdraget sitter bra." 21" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Emma, 4 stjärnor: "Mycket nöjd. Tanken ser mycket bättre ut och överdraget sitter bra." 210D Oxford-tyg stoppar alger oc" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav den 0 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120252313723210233 — IBC-tanktrekk_NO_RI_1_1 (LOSER, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 51 kr / 9 107 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,59 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Uten trekk. Med trekk. Vannet blir grønt av alger uten trekk. Presenningen som skulle beskytte blåser av i den første høststormen. Sett på trekket – vannet forb" · rubrik: "Uten trekk. Med trekk."
- Första frame / VO: inte avläst i den här ronden — under 300 kr eller 3 köp, observation utan dom (CLAUDE.md regel 3)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: norsk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | RI (återkommande kostnad) enligt namnkoden; copyn: "Uten trekk. Med trekk. Vannet blir grønt av alger uten trekk. Presenningen som skulle besk" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Uten trekk. Med trekk. Vannet blir grønt av alger uten trekk. Presenningen som skulle beskytte blåser av i den første hø" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 51.12 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120252313786480233 — IBC-tanktrekk_NO_BOF_16_1 (LOSER, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 29 kr / 9 107 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,59 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "4,7 av 5 på 10 anmeldelser. IBC-tanktrekket stopper alger og UV med tett 210D Oxford-stoff. Zipp fast trekket." · rubrik: "4,7 av 5 på 10 anmeldelser"
- Första frame / VO: inte avläst i den här ronden — under 300 kr eller 3 köp, observation utan dom (CLAUDE.md regel 3)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: norsk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | BOF (retargeting, invändning) enligt namnkoden; copyn: "4,7 av 5 på 10 anmeldelser. IBC-tanktrekket stopper alger og UV med tett 210D Oxford-stoff" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "4,7 av 5 på 10 anmeldelser. IBC-tanktrekket stopper alger og UV med tett 210D Oxford-stoff. Zipp fast trekket." | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 29.12 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden: en observation, ingen dom och ingen iteration (loser-regeln: iterera bara ur research, och det finns ingen bedömbar signal att iterera på).

### Lärdom L-120252313719230233 — IBC-tanktrekk_NO_RV_11_1 (INGEN_LEVERANS, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 6 kr / 9 107 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,59 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Anders, 5 stjerner: «Veldig bra trekk. Passer IBC-tanken min perfekt og er enkelt å sette på.» 210D Oxford-stoff stopper alger og UV. Sett på trekket – vannet f" · rubrik: "Anders, 5 stjerner"
- Första frame / VO: inte avläst i den här ronden — under 300 kr eller 3 köp, observation utan dom (CLAUDE.md regel 3)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: norsk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | RV (recension) enligt namnkoden; copyn: "Anders, 5 stjerner: «Veldig bra trekk. Passer IBC-tanken min perfekt og er enkelt å sette " | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Anders, 5 stjerner: «Veldig bra trekk. Passer IBC-tanken min perfekt og er enkelt å sette på.» 210D Oxford-stoff stopper" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav den 5.82 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120252313782720233 — IBC-tanktrekk_NO_BOF_18_1 (INGEN_LEVERANS, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 3 kr / 9 107 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,59 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Passer det tanken min? 120 × 100 × 116 cm – laget for en standard 1000-liters tank. Åpningen øverst gjør at du når lokket uten å ta av trekket. Sjekk målene og " · rubrik: "Passer det tanken min?"
- Första frame / VO: inte avläst i den här ronden — under 300 kr eller 3 köp, observation utan dom (CLAUDE.md regel 3)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: norsk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | BOF (retargeting, invändning) enligt namnkoden; copyn: "Passer det tanken min? 120 × 100 × 116 cm – laget for en standard 1000-liters tank. Åpning" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Passer det tanken min? 120 × 100 × 116 cm – laget for en standard 1000-liters tank. Åpningen øverst gjør at du når lokke" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav den 2.88 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120252313784750233 — IBC-tanktrekk_NO_BOF_17_1 (INGEN_LEVERANS, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 kr / 9 107 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,59 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Lyset holdes ute. Vannet holdes klart. 210D Oxford-stoff blokkerer lyset som ellers gir grobunn for alger. Trekket stopper alger og holder UV ute. Sett på trekk" · rubrik: "Lyset holdes ute, vannet klart."
- Första frame / VO: inte avläst i den här ronden — under 300 kr eller 3 köp, observation utan dom (CLAUDE.md regel 3)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: norsk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | BOF (retargeting, invändning) enligt namnkoden; copyn: "Lyset holdes ute. Vannet holdes klart. 210D Oxford-stoff blokkerer lyset som ellers gir gr" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Lyset holdes ute. Vannet holdes klart. 210D Oxford-stoff blokkerer lyset som ellers gir grobunn for alger. Trekket stopp" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | pris | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav den 0.94 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120252313717780233 — IBC-tanktrekk_NO_RV_12_1 (INGEN_LEVERANS, etikett 2026-09-27)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-20 – 2026-09-26 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 1 kr / 9 107 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,59 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | okänd / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-27): "Emma, 4 stjerner: «Veldig fornøyd. Tanken ser mye bedre ut, og overtrekket sitter bra.» 210D Oxford-stoff stopper alger og UV. Sett på trekket – vannet forblir " · rubrik: "Emma, 4 stjerner"
- Första frame / VO: inte avläst i den här ronden — under 300 kr eller 3 köp, observation utan dom (CLAUDE.md regel 3)

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: norsk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | RV (recension) enligt namnkoden; copyn: "Emma, 4 stjerner: «Veldig fornøyd. Tanken ser mye bedre ut, og overtrekket sitter bra.» 21" | okänd |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten (copyn förutsätter att läsaren vet vad produkten är) | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Emma, 4 stjerner: «Veldig fornøyd. Tanken ser mye bedre ut, og overtrekket sitter bra.» 210D Oxford-stoff stopper alger " | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav den 0.9 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (under 300 kr, 0 köp): logga och släpp, aldrig ABO (Axels beslut 2026-09-20); idén får bara komma igen som en ny öppning på en levande vinnare, inte som samma annons.

### Lärdom L-120250312634610291 — IBC_PD_11_H1 (KPI_WINNER, etikett 2026-09-28)

| Fält | Värde |
|---|---|
| Batch | 7 |
| Utfall | KPI_WINNER |
| Fönster | 2026-09-21 – 2026-09-27 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 242 kr / 4 440 kr (5 %) |
| Köp | 2 |
| ROAS / CPA | 3,76 / 121 kr — kampanjens ROAS 1,98 |
| Konverteringsgrad | 7,4 % (2 köp / 27 LPV) |
| Hook rate / hold rate | 34 % / 7 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** PD — vinnarens (PD_1_H1) exakta manus med en creator på kamera i sin egen trädgård · **Typ:** I · **Parent:** IBC_PD_1_H1 · **Iteration:** 1 · **Källa:** batch #7 2026-09-21 (batch-log.md, raden "Vinnarens exakta manus, ENDA variabeln är talaren (ansikte i bild)"); briefen i Notion-hubben (IBC_PD_11_H1, Approved), inte i repot. Meta-annons-id 120250312634610291.

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live, creatives-filen 2026-09-28): "Vattnet i tanken var grönt av alger innan skyddet satt på. / Tyget är tjockt 210D-material – jag kände efter själv. / Dragkedjan stängs på under två minuter, med öppning kvar för locket." · Rubrik: "Grönt vatten. Sen satte jag på skyddet." · ingen beskrivning
- Briefens hook (Notion-raden): "Trött på grönt, algfyllt regnvatten?" (talking head 0–3 s) — VO: ej läst (videon inte öppnad, ffmpeg saknas i containern), så om VO-hooken är frågan ur briefen eller påståendet ur primärtexten är okänt
- Första bildruta (thumbnailen, öppnad 2026-09-28): en IBC-tank i galler på gräsmatta, plasten grönfärgad av alger nedtill, regn — ingen person i bild, ingen text

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | villaägaren med tank i trädgården (briefen: creator "i sin egen trädgård, bredvid tanken") | jag-form i primärtexten ("jag kände efter själv") — en ägare som talar om sin egen tank | ja |
| Vinkel | PD — vinnarens manus, talaren som enda variabel | PD: problem (grönt vatten) → tyget → dragkedjan, i vinnarens ordning | ja |
| Medvetandenivå | problemmedveten (briefens hook "Trött på grönt, algfyllt regnvatten?") | problemmedveten — öppnar på det gröna vattnet | ja |
| Mekanism | 210D Oxford blockerar ljuset, utan ljus inga alger (briefens rad 3) | "tjockt 210D-material – jag kände efter själv" — materialet, men orsakskedjan ljus → alger saknas i primärtexten | nej |
| Tro | ett ansikte som säger raderna (briefens Why: talarvariabeln) | "jag kände efter själv" — vittnesbörd i första person; om ansiktet syns i videon är oläst | okänd |
| Positionering | ingen (briefen nämner ingen jämförelse) | ingen | ja |
| Brådska | ingen, inget pris (briefens Rules) | ingen brådska, inget pris | ja |
**Utförandet föll:** okänd · utford_som_briefad: okänd — videon är inte öppnad; primärtexten är omskriven mot briefens COPY (deklarativ i stället för fråga, "jag"-form) och mekanismradens orsakskedja saknas i texten. Priset står inte i annonsen (rätt enligt briefen). Inga förbjudna ord.

**Diagnos:** KPI winner: läs hook rate, sedan hold rate, sedan förbi hooken. Den säljer men får inte spend — får den ingen spend på sju dagar är den en förlorare.

**Hypotes (gissning):** Gissning: 2 köp på 27 LPV (7,4 %, kampanjens 1,98 ROAS mot annonsens 3,76) tyder på att en ägare i jag-form konverterar den som klickar minst lika bra som rösten utan ansikte (PD_1_H1), men hook rate 34 % och hold 7 % — under PD_1_H1:s 37 % / 15 % i sin första vecka — säger att öppningen (en grön tank i regn, ingen person) inte stoppar scrollen lika bra som vinnarens "smutsig tank"-öppning, så Meta ger den 5 % av spenden; 242 kr och 2 köp är brus, ingen dom.

**Nästa annonser:**
- `IBC_PD_11_H2` — typ I, parent IBC_PD_11_H1, iteration 1 (KPI winner ⇒ ny hook, allt annat lika): samma creator, samma klipp och samma rader från sekund 3, men hooken byts från briefens fråga till det påstående som redan står som rubrik i den live annonsen: "Grönt vatten. Sen satte jag på skyddet." (hubbens regel 1 2026-09-21/28: hookar är påståenden). Isolerar: hookformulering på creator-formatet.
- `IBC_PD_14_H1` (namngiven i lärdomen för IBC_PD_4_H2) SLÄPPS — samma talarhypotes är nu prövad här med 2 köp; PD_4_H2:s Drive-fil finns inte och klippet kan inte läsas, så en iteration på den bygger på en påhittad sekund.

### Lärdom L-120250312659050291 — IBC_CS_9_H1 (LOSER, etikett 2026-09-28)

| Fält | Värde |
|---|---|
| Batch | 7 |
| Utfall | LOSER |
| Fönster | 2026-09-21 – 2026-09-27 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 33 kr / 4 440 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,98 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | 35 % / 9 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** CS — prisvinkeln 489/636/147 kr i kort klipp (12–15 s) · **Typ:** I · **Parent:** IBC_CS_1_H3 · **Iteration:** 2 · **Källa:** batch #7 2026-09-21 (batch-log.md, raden "Isolerar längden på prisvinkeln mot CS_8_H1 (20–25 s)", källa "CS_1_H3 + PD_Extra-gapet"); briefen i Notion-hubben (IBC_CS_9_H1, SE-ACTIVE to be translated), inte i repot. Meta-annons-id 120250312659050291.

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live, creatives-filen 2026-09-28): "489 kr för skyddet – jämförpris 636 kr, alltså 147 kr billigare. / Tyget är 210D Oxford – du ser det i närbilden. / Dras igen på under två minuter, direkt över tanken." · Rubrik: "489 kr – 147 kr billigare än jämförpris" · ingen beskrivning
- VO: ej läst (videon inte öppnad, ffmpeg saknas i containern) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot; batch-log: prisvinkeln) | den som redan vet vad skyddet är och tvekar på priset — ingen person i texten | okänd |
| Vinkel | CS — priset 489/636/147 som hook, kort klipp (batch-log #7) | CS: priset och jämförpriset i rad 1, materialet i rad 2, dragkedjan i rad 3 | ja |
| Medvetandenivå | — (brief saknas i repot) | produktmedveten — produkten förklaras inte, priset först | okänd |
| Mekanism | — (brief saknas i repot) | "210D Oxford – du ser det i närbilden" — materialet, ingen orsakskedja | okänd |
| Tro | — (brief saknas i repot) | ingen; "du ser det i närbilden" pekar på bilden som bevis | okänd |
| Positionering | — (brief saknas i repot) | mot jämförpriset 636 kr | okänd |
| Brådska | — (brief saknas i repot) | ingen — inget "idag", ingen deadline (rätt enligt regeln 2026-09-25) | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd — bara texten är läst; priset 489/636/147 stämmer med produktsidan (läst live 2026-09-28). Inga förbjudna ord.

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 33 kr på sju dygn är Metas val, inte publikens — hook rate 35 % och hold 9 % ligger i nivå med PD_11_H1 (34/7) som fick spend, så klippet i sig är inte sämre; CBO:n valde CS_8_H1/CS_10_H1-spåret och den korta prisversionen fick aldrig en chans, vilket säger inget om längden.

**Nästa annonser:**
- `SLÄPP` — 33 kr och 3 LPV ger inget att lära om längden; prisvinkeln utan brådska har redan fyra iterationer i loggen (koncept cs-pris-utan-bradska vid taket, punkt 18) och CS_10_H1 (In progress i hubben) bär samma fråga i 20–24 s. Läs om längdfrågan när CS_10_H1 fått sin etikett — inte förr.

### Lärdom L-120250312599430291 — IBC_RI_1_H1 (LOSER, etikett 2026-09-28)

| Fält | Värde |
|---|---|
| Batch | 7 |
| Utfall | LOSER |
| Fönster | 2026-09-21 – 2026-09-27 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 20 kr / 4 440 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,98 |
| Konverteringsgrad | 0,0 % (0 köp / 1 LPV) |
| Hook rate / hold rate | 33 % / 7 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** RI — förlustvinkeln: stormen tog presenningen, en sommar utan skydd · **Typ:** N · **Parent:** — · **Iteration:** 0 · **Källa:** batch #7 2026-09-21 (batch-log.md, raden "Förlustvinkeln otestad på produkten", källa produktsidans storm-rad "Presenningen som skulle skydda blåser av vid första höststormen"); briefen i Notion-hubben (IBC_RI_1_H1, Approved), inte i repot. Meta-annons-id 120250312599430291.

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext (live, creatives-filen 2026-09-28): "En tunn presenning slets av i höststormen. / Utan lock för ljuset blir vattnet grönt och grumligt. / Den här gången är det ingen presenning – utan ett skydd i 210D-tyg som dras igen på två minuter och håller ljuset ute." · Rubrik: "Stormen tog presenningen. Inte skyddet." · ingen beskrivning
- VO: ej läst (videon inte öppnad, ffmpeg saknas i containern) · första bildruta: ej granskad

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot; batch-log: cost of inaction) | den som redan har en presenning över tanken — ingen person i texten | okänd |
| Vinkel | RI — kostnaden av att inte göra något: en sommar utan skydd (batch-log #7) | RI: presenningen blåste av i stormen → grönt vatten → skyddet i 210D som alternativ | ja |
| Medvetandenivå | — (brief saknas i repot) | problemmedveten — öppnar på stormen och presenningen, inte på produkten | okänd |
| Mekanism | — (brief saknas i repot) | "dras igen på två minuter och håller ljuset ute" — dragkedjan och ljusblockeringen | okänd |
| Tro | — (brief saknas i repot) | ingen barriär bemöts; storm-raden är sidans egen | okänd |
| Positionering | — (brief saknas i repot) | mot presenningen ("ingen presenning – utan ett skydd i 210D-tyg") | okänd |
| Brådska | — (brief saknas i repot) | höststormen som årstidsargument, inget pris, ingen deadline | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd — bara texten är läst; storm-raden är produktsidans egen. Inga förbjudna ord, inget pris.

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 20 kr och 1 LPV är Metas val i en CBO med 80 annonser — hook 33 % / hold 7 % ligger på kampanjens nivå, så vinkeln är inte falsifierad; att presenningen som positionering står i primärtexten (OB_1_H1 bygger samma jämförelse i hubben) betyder att två annonser säger samma sak samtidigt, och den ena svälter.

**Nästa annonser:**
- `SLÄPP` — under 300 kr, 0 köp; presenningsjämförelsen bärs vidare av IBC_OB_1_H1 (In progress i hubben, kalla=voc), så en andra RI-video vore en dubblett. Idén kom ur produktsidan (egen-data), men den prövas färdigt av OB_1_H1 först.

### Lärdom L-120252336848000233 — IBC-tanktrekk_NO_PD_11_H1 (LOSER, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | LOSER |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 126 kr / 5 868 kr (2 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,42 |
| Konverteringsgrad | 0,0 % (0 köp / 5 LPV) |
| Hook rate / hold rate | 37 % / 7 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "Vannet i tanken var grønt av alger før trekket kom på." · rubrik: "Grønt vann. Så satte jeg på trekket."
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | okänd enligt namnkoden; copyn: "Vannet i tanken var grønt av alger før trekket kom på. Stoffet er tykt 210D-materiale – je…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "Vannet i tanken var grønt av alger før trekket kom på. Stoffet er tykt 210D-materiale – jeg kjente etter selv. Glidelåse…" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: 126 kr och 0 köp första veckan är under grinden (300 kr / 3 köp) — annonsen förlorade auktionen mot syskonen, och siffrorna kan inte skilja en svag idé från en svag öppning; ingen dom.

**Nästa annonser:**
- `SLÄPP` — kampanjen är inte aktiv i dag (avstängd eller pausad): ingen iteration byggs på en annons vars kampanj inte kör.

### Lärdom L-120252336843630233 — IBC-tanktrekk_NO_RI_1_H1 (INGEN_LEVERANS, etikett 2026-09-29)

| Fält | Värde |
|---|---|
| Batch | okänd |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-22 – 2026-09-28 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 9 kr / 5 868 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 1,42 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 30 % / 4 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-09-29): "En tynn presenning blåste av i høststormen." · rubrik: "Stormen tok presenningen. Ikke trekket."
- Första frame / VO: inte avläst i den här ronden (videon inte transkriberad) — under grinden, observation utan dom

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | läst ur copyn: svensk ägare av produkten som grupp — ingen person eller scen i texten | okänd |
| Vinkel | — (brief saknas i repot) | okänd enligt namnkoden; copyn: "En tynn presenning blåste av i høststormen. Uten lokk for lyset blir vannet grønt og grums…" | okänd |
| Medvetandenivå | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Mekanism | — (brief saknas i repot) | ur copyn: "En tynn presenning blåste av i høststormen. Uten lokk for lyset blir vannet grønt og grumsete. Denne gangen er det ikke …" | okänd |
| Tro | — (brief saknas i repot) | ingen trosbarriär bemöts i copyn | okänd |
| Positionering | — (brief saknas i repot) | okänd — inte avläst utöver copyn | okänd |
| Brådska | — (brief saknas i repot) | ingen i copyn | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: Meta gav den 9 kr första veckan — öppningen vann aldrig auktionen mot syskonen i samma adset; utfallet säger inget om idén, bara att den inte fick leverans.

**Nästa annonser:**
- `SLÄPP` — kampanjen är inte aktiv i dag (avstängd eller pausad): ingen iteration byggs på en annons vars kampanj inte kör.

### Lärdom L-120250357082270291 — IBC_PD_12_H1 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | 8 |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 106 kr / 3 757 kr (3 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,81 |
| Konverteringsgrad | 0,0 % (0 köp / 3 LPV) |
| Hook rate / hold rate | 43 % / 5 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** pd-alger-mekanism · **Typ:** I · **Parent:** IBC_PD_1_H1 · **Iteration:** 1 · **Källa:** parent
**Brief:** `products/ibc-tankoverdraget/batch-08/video-ads-briefs/IBC_PD_12_H1/brief.md`

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "Grönt vatten i en IBC-tank utan UV-skydd." · rubrik: "Grönt vatten utan UV-skydd." (briefens H1 ordagrant i primärtexten; rubriken avviker från briefens COPY CARD "Klart vatten. Ingen alg. Enkelt.")
- VO: okänd (videon inte transkriberad; briefen: VO rad 1 = samma mening, in media res över grönt vatten sekund 0) · hook 43 % / hold 5 %

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | villaagare-med-ibc-tank | villaägaren med IBC-tank för regnvatten ("din IBC-tank"), samma som förälderns copy | ja |
| Vinkel | PD | PD: symptom/orsak → "blockerar solljus och UV" → 210D → blixtlås → öppning upptill, inget pris | ja |
| Medvetandenivå | problem | problem — öppnar på grönt vatten/solljus/tyget, aldrig på produktnamnet | ja |
| Mekanism | blockerar-ljus-och-uv | "blockerar solljus och UV – vattnet hålls klart" + 210D Oxford-tyg som spec | ja |
| Tro | ljus-ger-alger | ljus ger alger — samma tro som föräldern, ingen extern auktoritet | ja |
| Positionering | — (taggen saknas i briefen) | "Grönt vatten utan UV-skydd." — symptomet som rubrik, inget pris (briefen: "Klart vatten. Ingen alg. Enkelt.") | okänd |
| Brådska | ingen | ingen (ingen deadline, inget pris — PD-regeln) | ja |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: hook 43 % (över förälderns 37 %) säger att grönt vatten i sekund 0 stoppar scrollen som briefen tänkte, men hold 5 % mot förälderns 15 % säger att kroppen efter hooken inte håller — och 106 kr, 3 LPV, 0 köp är hur som helst Metas fördelning i CBO:n, inte publikens dom.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden (106 kr, 0 köp, 3 LPV): en observation, ingen dom. Iteration 1 av 3 på breakthroughen IBC_PD_1_H1 är därmed utförd och svalt i CBO:n (de tre tillsammans 170 kr mot förälderns 80–88 % av spenden); CS-KLART punkt 18: tre iterationer med lärdom på varje, ingen slog originalet — forskningen bakom PD_1_H1 är stark, men nästa försök på samma manus är redan namngivna och briefade (`IBC_PD_15_H1` kort klipp med samma hook, batch #9; `IBC_PD_11_H2` creator-hooken, batch #10). Ingen fjärde iteration ur brus.

### Lärdom L-120250357115480291 — IBC_PD_12_H2 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | 8 |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 48 kr / 3 757 kr (1 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,81 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 35 % / 4 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** pd-alger-mekanism · **Typ:** I · **Parent:** IBC_PD_1_H1 · **Iteration:** 2 · **Källa:** parent
**Brief:** `products/ibc-tankoverdraget/batch-08/video-ads-briefs/IBC_PD_12_H2/brief.md`

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "Solljuset når vattnet i en oskyddad IBC-tank." · rubrik: "Solljus når vattnet i tanken." · rad 2: "Algerna växer i ljuset, och UV-ljuset sliter ut tanken i förtid." (briefens H1 + orsaksraden ordagrant)
- VO: okänd (videon inte transkriberad; briefen: 5 s problemdel före mekanismen) · hook 35 % / hold 4 %

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | villaagare-med-ibc-tank | villaägaren med IBC-tank för regnvatten ("din IBC-tank"), samma som förälderns copy | ja |
| Vinkel | PD | PD: symptom/orsak → "blockerar solljus och UV" → 210D → blixtlås → öppning upptill, inget pris | ja |
| Medvetandenivå | problem | problem — öppnar på grönt vatten/solljus/tyget, aldrig på produktnamnet | ja |
| Mekanism | blockerar-ljus-och-uv | "blockerar solljus och UV – vattnet hålls klart" + 210D Oxford-tyg som spec | ja |
| Tro | ljus-ger-alger | ljus ger alger — samma tro som föräldern, ingen extern auktoritet | ja |
| Positionering | — (taggen saknas i briefen) | "Solljus når vattnet i tanken." — orsaken som rubrik, inget pris | okänd |
| Brådska | ingen | ingen (ingen deadline, inget pris — PD-regeln) | ja |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: den längre problemdelen gav hook 35 % (förälderns 37 %) och hold 4 % — fem sekunder orsak före mekanismen håller inte tittaren bättre än förälderns enradiga problem; men 48 kr och 0 LPV är ingen läsning, utfallet är CBO-fördelning.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden (48 kr, 0 köp): en observation, ingen dom. Iteration 2 av 3 på breakthroughen IBC_PD_1_H1 är därmed utförd och svalt i CBO:n (de tre tillsammans 170 kr mot förälderns 80–88 % av spenden); CS-KLART punkt 18: tre iterationer med lärdom på varje, ingen slog originalet — forskningen bakom PD_1_H1 är stark, men nästa försök på samma manus är redan namngivna och briefade (`IBC_PD_15_H1` kort klipp med samma hook, batch #9; `IBC_PD_11_H2` creator-hooken, batch #10). Ingen fjärde iteration ur brus.

### Lärdom L-120250357148370291 — IBC_PD_12_H3 (LOSER, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | 8 |
| Utfall | LOSER |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 16 kr / 3 757 kr (0 %) |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,81 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 28 % / 5 % |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept:** pd-alger-mekanism · **Typ:** I · **Parent:** IBC_PD_1_H1 · **Iteration:** 3 · **Källa:** egen-data
**Brief:** `products/ibc-tankoverdraget/batch-08/video-ads-briefs/IBC_PD_12_H3/brief.md`

**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "Det här är 210D Oxford-tyget – tätt vävt, blockerar ljus." · rubrik: "210D Oxford-tyg blockerar ljuset." (briefens H1 utan ordet "ytan") · rad 2: "Samma tyg täcker hela din IBC-tank."
- VO: okänd (videon inte transkriberad; briefen: makro på väven, pull-back till tanken, sedan full längd) · hook 28 % / hold 5 %

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | villaagare-med-ibc-tank | villaägaren med IBC-tank för regnvatten ("din IBC-tank"), samma som förälderns copy | ja |
| Vinkel | PD | PD: symptom/orsak → "blockerar solljus och UV" → 210D → blixtlås → öppning upptill, inget pris | ja |
| Medvetandenivå | problem | problem — öppnar på grönt vatten/solljus/tyget, aldrig på produktnamnet | ja |
| Mekanism | blockerar-ljus-och-uv | "blockerar solljus och UV – vattnet hålls klart" + 210D Oxford-tyg som spec | ja |
| Tro | ljus-ger-alger | ljus ger alger — samma tro som föräldern, ingen extern auktoritet | ja |
| Positionering | — (taggen saknas i briefen) | "210D Oxford-tyg blockerar ljuset." — specen som rubrik (dna.md hypotes 4: PD_Extras makro-öppning), inget pris | okänd |
| Brådska | ingen | ingen (ingen deadline, inget pris — PD-regeln) | ja |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Loser: en lärdom, sedan släpp. Iterera BARA om idén kom ur research (kalla=voc/swipe/egen-data/playbook/winning-line/feedback), aldrig om den var en imiterad format-kopia (typ=IM).

**Hypotes (gissning):** Gissning: makro-öppningen på väven gav fönstrets lägsta hook (28 % mot förälderns 37 %) — en textur utan symptom stoppar färre än grönt vatten, vilket talar för att PD_Extras låga CPA satt i klipplängden, inte i öppningen; 16 kr är dock ingen läsning alls.

**Nästa annonser:**
- `SLÄPP` — LOSER under grinden (16 kr, 0 köp): en observation, ingen dom. Iteration 3 av 3 på breakthroughen IBC_PD_1_H1 är därmed utförd och svalt i CBO:n (de tre tillsammans 170 kr mot förälderns 80–88 % av spenden); CS-KLART punkt 18: tre iterationer med lärdom på varje, ingen slog originalet — forskningen bakom PD_1_H1 är stark, men nästa försök på samma manus är redan namngivna och briefade (`IBC_PD_15_H1` kort klipp med samma hook, batch #9; `IBC_PD_11_H2` creator-hooken, batch #10). Ingen fjärde iteration ur brus.

### Lärdom L-120250357195530291 — IBC_PD_8_H2 (INGEN_LEVERANS, etikett 2026-10-01)

| Fält | Värde |
|---|---|
| Batch | 5 |
| Utfall | INGEN_LEVERANS |
| Fönster | 2026-09-24 – 2026-09-30 (annonsens första vecka, 7d_click) |
| Spend annons / kampanj | 2 kr / 3 757 kr |
| Köp | 0 |
| ROAS / CPA | 0,00 / ingen (0 köp) — kampanjens ROAS 2,81 |
| Konverteringsgrad | okänd — backfillad före 2026-09-21 (inga klick i fönstret hämtade) |
| Hook rate / hold rate | 15 % / okänd |
| Bedömbar | nej (under 300 kr eller 3 köp — lärdomen är en observation, ingen dom) |

**Koncept/typ/parent/källa:** brief saknas i repot — läs annonsen


**Hookar (ordagrant, med hook rate / hold rate ovan):**
- Primärtext rad 1 (live 2026-10-01): "210D Oxford-tyg blockerar solljuset helt." · rubrik: "210D Oxford-tyg blockerar solljuset helt" · sista rad: "489 kr (jämförpris 636 kr)." (⚠ pris i en PD-annons — mot dna.md Winning DNA 1, samma avvikelse som PD_8_H1)
- VO: okänd (videon inte transkriberad; brief saknas i repot — batch #5:s rad) · hook 15 %

**Planerat mot utfört** (briefens taggar mot den live annonsen — stämde inte utförandet är det utförandet som föll, inte idén):
| Komponent | Planerat | Utfört | Stämmer |
|---|---|---|---|
| Avatar | — (brief saknas i repot) | IBC-tankägare som sett grönt vatten | okänd |
| Vinkel | — (brief saknas i repot) | PD med pris: spec först → "alger får ingen chans" → öppning upptill → 489 kr | okänd |
| Medvetandenivå | — (brief saknas i repot) | lösning (specen först), problemet kommer i rad 2 | okänd |
| Mekanism | — (brief saknas i repot) | "blockerar solljuset helt" + öppning upptill för locket | okänd |
| Tro | — (brief saknas i repot) | specen + priset | okänd |
| Positionering | — (brief saknas i repot) | "210D Oxford-tyg blockerar solljuset helt" — spec som rubrik | okänd |
| Brådska | — (brief saknas i repot) | ingen | okänd |
**Utförandet föll:** okänd · utford_som_briefad: okänd

**Diagnos:** Ingen leverans: hooken föll för Meta — logga och släpp, aldrig ABO.

**Hypotes (gissning):** Gissning: INGEN_LEVERANS (2 kr, hook 15 %) — en spec som ingen utanför branschen känner igen som öppning, och ett pris som PD-regeln förbjuder, gav Meta inget att leverera på; systern PD_8_H1 (55 kr) föll på samma copy.

**Nästa annonser:**
- `SLÄPP` — INGEN_LEVERANS (2 kr, Metas dom, aldrig ABO): samma avvikelse som PD_8_H1 (spec först + pris i en PD-annons), så hypotesen "grönt vatten som öppning" testades inte här — den kördes i IBC_PD_12_H1 (ovan). Ingen tredje PD_8-variant; ny PD-copy får aldrig bära pris.

