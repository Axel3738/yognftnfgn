# Creative DNA — Kasta & Fånga-settet

Skapad 2026-09-04 av `/forsta-batch`-flödet (körning nr 1, automatisk
rutinkörning via rondens `ersatt`-behov: "material pausat senaste veckan —
ersätt det som stängts av"), loggad som `CS_BATCH_KLAR` (INTE
`FORSTA_BATCH_KLAR` — produkten hade redan spend/annonser). Datakälla:
MagiBorsten `1867947880635861`, kampanj `120250053637760291` ("Kasta &
Fånga-settet | BE ROAS 1.61 | Launch 2026-09-02"), livstid 2026-09-02 →
2026-09-04 (`date_preset: maximum`).

**Kampanjen var redan PAUSED av rondens huvudflöde tidigare samma dag**
(trappan: potentialkollen föll — en annons med köp och ROAS över break-even
fanns, men ingen enskild annons åt ≥40 % av spenden med noll köp, så domen
blev "ingen potential" → hela kampanjen pausad). Den här körningen har INTE
rört Meta-status.

## Produktfakta (verifierade direkt mot produktsidan 2026-09-04 — Shopify MCP
var kopplad till fel butik, TwinPillow, och tappade sin session efter ett
`switch-shop`-försök som inte gick att slutföra i en overvakad körning;
hämtat i stället via direkt sidhämtning + Notion-testcentret + Drive)

- **Kasta & Fånga-set – 4 Korgar och Bollar på Lina**
  (`kasta-fanga-set-4-korgar-och-bollar-pa-lina`), baverbutiken.se.
- **Pris 419 kr, jämförpris 545 kr → spara 126 kr (23 %)** (verifierat direkt
  på produktsidan, tre oberoende hämtningar samma resultat).
- Fyra korgar med rem (hålls i hand eller bärs runt halsen) + bollar på
  **84 cm lina** (bollen lossnar aldrig). Redo att spela på **30 sekunder**,
  ingen montering. Fungerar på gräsmatta, strand och tältplats. 2 spelare
  eller fler.
- **Garanti: 30 dagars öppet köp, pengarna tillbaka.** Fri frakt inom
  Sverige. Leverans 5–10 arbetsdagar.
- **8 recensioner, alla 5 stjärnor** — verifierat i tre oberoende
  hämtningar av produktsidan OCH i källfilen `Kasta & Fånga-set_REVIEW`
  (Google Sheet i produktens Drive-mapp, skapad av Josh 2026-09-01) som
  innehåller samma 8 recensioner ordagrant med namn, betyg och datum.
  Verbatim-citat använda i denna batch: Linda Berg ("Det blev mycket
  skratt. Barnen vill spela igen.") och Daniel Persson ("Smidigt set som vi
  tog med till campingen."). Källan är alltså äkta — **detta motsäger tidiga
  antaganden om att produkten saknade recensioner; den hade dem, de låg bara
  i en källfil ingen tidigare läst.**
- Break-even-ROAS **1,61×** (ur kampanjnamnet). Break-even-CPA är INTE
  tillförlitligt räkneligt än — bara 1 order i hela kampanjen, och dess
  ordervärde (1 158,93 kr) är ~2,8× styckpriset (troligen flera set i samma
  order), så ett enda datapunkt duger inte som AOV. En grov approximation
  (styckpris/BE-ROAS = 419/1,61 ≈ 260 kr) står i testplanen men ska räknas
  om så fort fler köp finns.
- Meta Ad Library-sökning på svenska termer ("kasta fånga korgar bollar
  barn", "utomhuslek barn present barnbarn") gav 0 respektive irrelevanta
  träffar — inga direkta Meta-konkurrenter identifierade den här gången.
  Websökning hittar samma produktkategori under namnet "Catchball" hos
  svenska leksaksbutiker (Lekia, Leksakscity, Fyndiq, Lekakademin,
  Storochliten) — indirekt konkurrens, ingen swipe gjord än.

## Datakvalitet

`amount_spent × purchase_roas` kontrollerat mot `omni_purchase_values` på
den enda annonsen med köp (Kastafanga_G_2_1): 524,05 × 2,211487 = 1 158,94 kr
≈ 1 158,93 kr angivet — stämmer inom avrundning. `omni_purchase_values` är
INTE trasigt i den här kampanjen. Kampanjens totalsumma (15 annonser,
1 998,93 kr) summerar exakt mot listan av enskilda annonser — ingen lucka.
Videomanus finns inte som separata transkript; `body`-texten (primärtexten)
användes som proxy för voiceover-manuset, vilket är samma mönster som
resten av kontots annonser i den här batchen (strukturerad hook+bullets+CTA
som matchar hur `/forsta-batch` normalt bygger manus) — flaggat, inte
gissat.

## Signifikansgrind (ANALYSMETOD steg 2)

**Ingen annons i denna kampanj klarar den formella grinden (≥300 kr spend
OCH ≥3 köp).** Hela batchen är "för tidigt" formellt sett:

| Annons | Format | Spend | Köp | CTR | ROAS | Dom |
|---|---|---|---|---|---|---|
| Kastafanga_G_1 | Video | 605,62 kr | **0** | 2,56 % | — | Störst spendtjuv, ingen dom (för tidigt formellt, men 0 köp på högst spend är en verklig varningssignal) |
| Kastafanga_G_2_1 | Statisk | 524,05 kr | 1 | 5,98 % | 2,21 | **Lovande, INTE bevisad** — 1 köp under 3-köpsgränsen, men enda köpet i kampanjen och högst CTR |
| Kastafanga_PD_1 | Video | 225,21 kr | 0 | 2,67 % | — | Under spendgränsen, ingen dom |
| Kastafanga_CS_2_1 | Statisk | 170,90 kr | 0 | 0,93 % | — | Under spendgränsen, men lägsta CTR i kampanjen — se QC nedan |
| Kastafanga_G_2 | Video | 131,98 kr | 0 | 4,69 % | — | Under spendgränsen, bäst hold rate (36,8 %) |
| (10 övriga annonser) | — | 17–82 kr vardera | 0 | varierande | — | Brus, ingen dom |

Total kampanj: 1 998,93 kr spend, **1 köp**, blandad ROAS 0,58 (under
break-even 1,61 — därför trappan pausade kampanjen tidigare idag).

**Eftersom ingen annons klarar grinden formellt skrivs INGET i denna DNA som
"bevisad".** Allt nedan är hypotes, byggd på riktningsindikationer (CTR,
hold rate, den enda köpta ordern) — inte slutgiltiga domar.

## Koncept-nivå (4 script/koncept identifierade i kontot via creative-body)

| Koncept | Vinkel | Antal ads | Spend | Köp | Snitt-CTR |
|---|---|---|---|---|---|
| **G** (Gift) | "Rätt present till barnbarnen" — emotionell, ärlig copy | 3 | 1 261,65 kr | 1 | **4,41 %** |
| **PD** (Problem/Demo) | "Skärmen av, korgen på" — funktionell skärmtidsvinkel, ärlig copy | 4 | 318,81 kr | 0 | 2,42 % |
| **CS** (fejkad brådska) | "23% RABATT — IDAG ENDAST, lagret nästan slut" | 4 | 257,67 kr | 0 | **1,93 %** |
| **SP** (fejkad social proof) | "Därför pratar alla föräldrar... tusentals familjer" | 4 | 160,80 kr | 0 | **1,46 %** |

## Kvalitetskontroll av befintligt material (obligatoriskt, FAS 0/regel 8) — VIKTIGA FYND

Två av de fyra befintliga koncepten bryter mot copy-reglerna OCH är kontots
sämst presterande:

- **CS-konceptet påstår falsk brådska.** Live-annons `Kastafanga_CS_2_1`
  (granskad visuellt, ladda-ner-preview): "23% RABATT – IDAG ENDAST",
  "Lagret nästan slut!", CTA "Köp innan det är slut". Rabatten (23 %) är
  korrekt, men "idag endast" och "lagret nästan slut" är **påhittad
  brådska** — förbjudet enligt BRIEFMALLEN-reglerna och `docs/copy-regler.md`.
  Konceptet har också kampanjens näst sämsta CTR (1,93 % snitt, CS_2_1 själv
  bara 0,93 %).
- **SP-konceptet innehåller en fabricerad recension.** Live-annons
  `Kastafanga_SP_2_1` (granskad visuellt): 5 stjärnor + citatet **"Bästa
  köpet i sommar! Barnen leker med den varje dag." – Verifierad kund, 34 år**.
  Detta citat finns INTE bland produktens 8 riktiga recensioner (kontrollerat
  mot källfilen `Kasta & Fånga-set_REVIEW`) — det är påhittat, med en
  anonym "34 år"-etikett i stället för ett riktigt namn. Samma mönstret som
  Sömnadskitet-incidenten 2026-09-02 ("en review-bild gick ut med
  nonsenstext som citat"). SP-konceptets body-text påstår dessutom "Därför
  pratar alla föräldrar" och "tusentals familjer redan har sitt eget set" —
  ingen källa finns för detta. SP är kampanjens sämsta koncept (1,46 %
  snitt-CTR, två annonser på exakt 0 % CTR).
- Ingen prisfel hittades (419/545 kr stämmer överallt där priset visas).

**Ingen av dessa fel rättades i kontot** — kampanjen är redan PAUSED och
ingen Meta-ändring gjordes av den här körningen. Flaggat till nästa runda
och till Axel.

## Winning DNA (hypotes, INTE bevisad — se signifikansgrind ovan)

- **Ärlig, konkret copy slår påhittad brådska/social proof på CTR.** De två
  ärliga koncepten (G, PD) har klart högre snitt-CTR (4,41 % och 2,42 %) än
  de två som bryter mot copy-reglerna (CS 1,93 %, SP 1,46 %, varav två
  annonser på 0 %). Detta är både en compliance-regel och — i den här
  batchens data — en prestandasignal.
- **Emotionell gift-vinkel (G) leder på CTR och är enda konceptet med ett
  köp.** `Kastafanga_G_2_1` (statisk) hade kampanjens högsta CTR (5,98 %)
  och det enda köpet (ROAS 2,21, över break-even 1,61).
- **Format-signal: statisk vann, video med IDENTISK copy förlorade.**
  `G_1` (video) och `G_2_1` (statisk) delar exakt samma primärtext/rubrik.
  `G_1` spenderade mer (605,62 kr) men fick lägre CTR (2,56 % mot 5,98 %)
  och 0 köp — trots en hook rate på 94 %. `G_1`s hold rate var bara 12,8 %
  (245/1 911 videovisningar nådde halva klippet) — hooken fungerar (folk
  klickar play), men klippet tappar dem innan betalvinjetten. Hypotes: en
  enskild stark lifestyle-bild kommunicerar löftet snabbare än videons
  uppbyggnad för just detta budskap.
- Videornas hook rate är genomgående mycket hög (94–97 % på alla mätbara
  klipp) men hold rate genomgående låg (13–37 %) — själva klicket-till-play
  fungerar (thumbnail/miniatyr fångar), men ingen video håller kvar
  tittaren förbi de första sekunderna. Detta är ett produktionsmönster att
  fixa i nästa batch (payoff/produkt i bild tidigare), inte ett
  vinkel-problem.

## Losing DNA / Undvik

- **Påhittad brådska ("idag endast", "lagret nästan slut") — förbjudet och
  kampanjens näst sämsta koncept.**
- **Fabricerad recension/socialt bevis utan källa — förbjudet och
  kampanjens sämsta koncept.** Skriv ALDRIG en recensionsrad utan ett
  verifierat citat ur produktsidans/Judge.me-liknande källa.
- Video med långsam uppbyggnad innan produkten/betalvinjetten syns — matchar
  den låga hold-raten på samtliga klipp.

## Obevisat (för tidigt att döma — hela batchen)

Allt ovan bygger på 1 köp och CTR/hold-rate-riktning, inte på
signifikansgrindens ≥300 kr/≥3 köp. Nästa avläsning (efter att batch #1:s
briefer launchats och kampanjen ev. återaktiverats av Axel) avgör om
mönstren håller.

## Konkurrenter

Meta Ad Library gav inga direkta träffar på svenska sökord för denna
produktkategori (0–irrelevanta resultat, se ovan). Indirekt konkurrens
identifierad via websökning: svenska leksaksbutiker (Lekia, Leksakscity,
Fyndiq, Lekakademin, Storochliten) säljer liknande "Catchball"-set. Ingen
swipe gjord — kandidat för nästa runda.
