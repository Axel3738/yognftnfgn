# NO-videobatch 2026-09-04 (rutinen /translate-no)

| Produkt | Läge | Orsak |
|---|---|---|
| Bordtennisnät Infällbart | ⚠️ Överhoppad | Norsk sida finns, men INGEN Norge-kostnad i något av batch-sheet #1–#5.1 (samma fynd som 2026-09-03). Problemmeddelande skickat till #problems-no. |
| Magnetplater i Stort Format | ✅ Launchad ACTIVE | Se nedan. |
| Motocentric Bakveske 37 L | ✅ Launchad ACTIVE | Se nedan. |
| Pelsbørste til Dyson-støvsuger | ✅ Launchad ACTIVE | Se nedan. |

Ingen kö till i morgon — fyra kandidater i LAUNCHED (bokstavsordning: Bordtennisnät,
Magnetplattor, Motocentric, Pälsborste), en blockerad på COGS, tre launchade.

## Magnetplater i Stort Format → Magnetplater NO

- **Pris:** 409 kr (46 deler, ordinært 682 kr) / 469 kr (60 deler, ordinært 782 kr).
  CS-annonsen claimar "40 % RABATT" → jämförpriset höjt i Shopify NO (var 23 %,
  `tools/shopify-fix-compareat.mjs --market NO --product-id 15547994800503 --rabatt 40`)
  så claimen stämmer (46-delarsvarianten 409/682 = exakt 40 %).
- **COGS:** batch-sheet #5.1, "Magnetic tiles building set 46/60 pcs", NORWAY-blockets
  Total ex. tax Qty 1 = 14,55 EUR × 10,799272 NOK/EUR (ECB-dagskurs) = 157,13 kr.
  BE-ROAS = 409/(409−157,13) = **1,62**.
- **Videor:** 12/12 proofread → SRT-lokalisering (sonnet-subagent) → HeyGen-render →
  captions. Grovöversättningen hade SEK-siffror bara omdöpta till "kroner" (610/460
  i st f 682/409) och produktnamnet inkonsekvent översatt ("Magnetfliser"/"Magnetplater")
  och butiksnamnet oöversatt ("Bäverbutiken") — allt rättat. 3 filer (PD_1_H1/H2/H3)
  fick en falsk textvarning från kontrollskriptet (ojämn textposition i källvideon,
  troligen bakgrundskontrast feltolkad som text) — alla 9 QA-bilder manuellt granskade,
  inget svenskt syns, godkända med manuellt override.
  Kvot 22 265 → se total nedan.
- **Levererat:** 12 mp4 i chatten (1 komprimerad separat för 30 MB-gränsen gällde inte
  här — alla under gränsen). Drive: MAKE TO NORWAY → "NO Magnetplattor i Storformat"
  (ny mapp, skapad via Drive-connectorn): 12 mp4 + 4 adcopy-txt uppladdade.
- **Launchad ACTIVE:** kampanj-ID 120252077084550233, "Magnetplater NO | BE-ROAS 1,62 |
  2026-09-04", CBO 1000 kr/dag. 4 adsets (CS/GT/PD/SP), 3 videoannonser vardera (12
  totalt), alla ACTIVE.
- ⚠️ **Bildannonser (Fas 3.2) INTE körda** denna natt — se anteckning i slutet.

## Motocentric Bakveske 37 L → Motocentric NO

- **Pris:** 1049 kr (ordinært 1364 kr = 23 %, matchar CS-annonsens claim direkt).
- **COGS:** batch-sheet #5.1, "Motocentric motorcycle tail bag 37 L", NORWAY-blockets
  Total ex. tax Qty 1 = 37,77 EUR × 10,799272 = 407,90 kr.
  BE-ROAS = 1049/(1049−407,90) = **1,64**.
- **Videor:** 12/12. Samma SEK→NOK-fel i grovöversättningen (1286/989 i st f 1364/1049,
  ett par ställen läste även fel siffra "889" i st f rätt belopp) plus butiksnamnet
  felstavat på tre olika sätt ("Bawebutiken"/"Babe-butikken"/"Spavebutiken") plus ett
  produktfel: SP_1_H2 och SP_1_H3 kallade produkten "toppboks" i stället för "bakveske"
  — allt rättat av copy-subagenten.
- **Launch:** krävde en omkörning — första försöket tog slut på 8 rate-limit-retries
  på GT-adsetet efter att kampanj + alla 12 videor + CS-adsetet redan skapats. Väntade
  3 min, körde om (idempotent, hoppade över det som redan fanns), gick igenom på andra
  försöket.
- **Levererat:** 12 mp4 i chatten. Drive: "NO Motocentric Bakväska" — 12 mp4 + 4
  adcopy-txt.
- **Launchad ACTIVE:** kampanj-ID 120252077268170233, "Motocentric NO | BE-ROAS 1,64 |
  2026-09-04", CBO 1000 kr/dag. 4 adsets, 12 videoannonser, alla ACTIVE.
- ⚠️ **Bildannonser (Fas 3.2) INTE körda.**

## Pelsbørste til Dyson-støvsuger → Pelsbørste NO

- **Pris:** 479 kr (ordinært 623 kr = 23 %, matchar CS-claimen direkt). Inget
  butiksnamn i originalcopyn — inget att rätta där.
- **COGS:** batch-sheet #5.1, "Pet brush kit for Dyson vacuums", NORWAY-blockets
  Total ex. tax Qty 1 = 17,30 EUR × 10,799272 = 186,83 kr.
  BE-ROAS = 479/(479−186,83) = **1,64**.
- **Videor:** 12/12. Samma SEK→NOK-fel i CS-filerna (701/539 i st f 623/479).
- **Levererat:** 12 mp4 i chatten. En fil (PD_1) var 32 MB, för stor för
  chattgränsen — separat komprimerad kopia (crf 27, 17,7 MB) skickad i stället;
  originalfilen (bättre kvalitet) användes ändå för Meta och Drive.
  Drive: "NO Pälsborste till Dyson-dammsugare" — 12 mp4 + 4 adcopy-txt.
- **Launchad ACTIVE:** kampanj-ID 120252077611670233, "Pelsbørste NO | BE-ROAS 1,64 |
  2026-09-04", CBO 1000 kr/dag. 4 adsets (CS/G/PD/SP), 12 videoannonser, alla ACTIVE.
- ⚠️ **Bildannonser (Fas 3.2) INTE körda.**

## Rate limit-läget i natt

Kontot var ovanligt hårt rate-limitat hela natten (Meta-fel 17, "User request limit
reached") — även enkla GET-anrop för att verifiera kampanjerna i efterhand fick samma
fel. Troligen orsakat av att tre parallella Drive-uppladdningar (36 videor totalt) och
tre sekventiella Meta-launchar kördes tätt inpå varandra. Alla tre launchar gick
igenom till slut tack vare skriptets inbyggda backoff (upp till 8 försök,
15–120 sekunders väntan), men Magnetplattor + Pälsborste tog över 20 minuter var och
Motocentric krävde en manuell omkörning efter en 3-minuters paus. Total körtid för
hela natten (proofread → render → captions → tre launchar) var runt 3,5 timmar,
inom 4-timmarsbudgeten men med marginal uppäten av rate limits.

## Bildannonser (Fas 3.2) — inte körda, KÄND LUCKA

Alla tre produkter har `*_2_1`-bildfiler i sina Drive-mappar (t.ex.
`Magnetplattor_CS_2_1`, `Motocentric Bakväska_GT_2_1`, `Pälsborste till Dyson_CS_2_1.png`)
som enligt rutinens Fas 3.2 ska rensas för svensk text, få norsk text pålagd och läggas
in i respektive koncept-adset med `no-image-ads.mjs`. Det hann inte göras denna natt
— videobatchen ensam tog hela tidsbudgeten (36 videor, tre launchar, samtliga hårt
rate-limitade). Kampanjerna innehåller därför bara videoannonser (3 per koncept, 12
per produkt), inga bildannonser ännu. Detta är en avvikelse från Definition of done
och bör tas igen — antingen manuellt eller i en kommande körning.

## Kvot

HeyGen: 22 265 → 20 581 (1 684 krediter, 36 videor renderade, inga misslyckade
sessioner denna natt).
