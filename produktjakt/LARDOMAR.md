# Lärdomar från Axels svar

Läses av `/produktjakt` INNAN sökningen. Auto-delen räknas av `feedback.py vikter`; skriv aldrig i den för hand.

<!-- auto:start -->
Uppdaterad 2026-09-10. **12 svar** — ja 5, kanske 4, nej 3.

## Det Axel säger ja till

- deadline_klass **6–12 v**: 4 ja, 0 kanske, 0 nej → score 0.833
- ankare_klass **1,2–1,3×**: 4 ja, 0 kanske, 0 nej → score 0.833
- objekt **Husvagn — taket**: 2 ja, 0 kanske, 0 nej → score 0.75
- objekt **Utekatten**: 2 ja, 0 kanske, 0 nej → score 0.75
- objekt **Barnbarnet — adventskalendern**: 2 ja, 0 kanske, 0 nej → score 0.75
- arketyp **A1**: 2 ja, 0 kanske, 0 nej → score 0.75
- arketyp **A3**: 2 ja, 0 kanske, 0 nej → score 0.75
- arketyp **A4**: 2 ja, 0 kanske, 0 nej → score 0.75
- form **överdrag**: 2 ja, 0 kanske, 0 nej → score 0.75
- form **koja**: 2 ja, 0 kanske, 0 nej → score 0.75
- form **kalender**: 2 ja, 0 kanske, 0 nej → score 0.75
- deadline_typ **uppställning**: 2 ja, 0 kanske, 0 nej → score 0.75
- deadline_typ **första frost**: 2 ja, 0 kanske, 0 nej → score 0.75
- deadline_typ **1 december**: 2 ja, 0 kanske, 0 nej → score 0.75
- deadline_klass **2–6 v**: 2 ja, 0 kanske, 0 nej → score 0.75

## Det Axel säger nej till

- grupp **belysning och mörker**: 1 nej, 0 ja → score 0.333
- grupp **båt och trailer**: 1 nej, 1 ja → score 0.5
- grupp **husvagn och husbil**: 1 nej, 2 ja → score 0.6

## Orsakerna han anger

- **Känns rätt**: 0 nej, 4 ja, 0 kanske
- **Skyddar något**: 0 nej, 3 ja, 0 kanske
- **För dyr**: 2 nej, 0 ja, 0 kanske
- **Bra ankare**: 0 nej, 1 ja, 0 kanske
- **Snygg bild**: 0 nej, 1 ja, 0 kanske
- **Kedjan har den**: 1 nej, 0 ja, 0 kanske
- **Tråkig**: 1 nej, 0 ja, 0 kanske
- **Har redan**: 1 nej, 0 ja, 0 kanske
- **Nöjd med det han har**: 1 nej, 0 ja, 0 kanske

## Stoppas i nästa körning (≥ 3 nej, 0 ja)

- inget

## Lyfts i nästa körning (≥ 3 ja)

- ankare_klass:1,2–1,3×
- deadline_klass:6–12 v

<!-- auto:end -->

## Egna anteckningar (rutinen skriver här, en rad per körning)

- 2026-09-09: Axel om sina kanske-svar: "ofta väldigt lågt upplevt värde". Vedklyvborr, sotset, oljepump, rännskopa — små verktygslika varor som inte ser ut som sitt pris. Ny etikett "Lågt upplevt värde" på sidan; ny variabel i masterprompten.
- 2026-09-10: Axel om ramperna till husbilen: "varenda campare har dem sedan innan, jag har jobbat på camping". Och principen bakom: "jag går väldigt mycket utefter om man sett produkten innan eller inte". **Standardutrustning som varje ägare redan har är död oavsett säsong och ekonomi** — det är K0/K4, inte K6. Ramperna hade rätt datum, rätt objekt, rätt prisband och föll ändå. Frågan att ställa före varje kandidat: *har ägaren redan en?* Svaret finns hos den som jobbat med kunderna, inte i en kedjas sortiment.
- 2026-09-10: Vilthissens listningsbild visar ett trebent stålstativ med vinsch, men paketet för 242 kr landat är ett repblock + galge (bekräftat mot Amazon/Walmart/eBay). **Bilden kan lova en annan vara än den som skickas** — ny kontroll innan bild används: stämmer landad kostnad med det bilden visar? Axel svarade ja på vilthissen och solcellsladdaren, nej på ramperna; wow-mätningen sa skippa på alla tre. Båda står (8.6).
- 2026-09-10 (manuell DOA-körning, eftermiddag): 0 nya svar sedan morgonen · STOPP nya: inga · LYFT nya: ankare_klass:1,2–1,3×, deadline_klass:6–12 v (ur utfall.json: V1, V2, V3 launchade 09-08/09-09) · parkerat: halkskydd A6 → v 44, poolsolskydd → april · Meta-utfall: Taköverdraget → launchad, Utekattkojan → launchad, Adventskalendern → launchad (≥ BE/< BE först vid 2 000 kr + två snapshots) · Avvikelse: ingen orsak ≥ 5 ggr ännu (12 svar) · Ändrat i sökningen i morgon: 10 objektrader har mätt ankare i objekt.json (frontskydd 1 145, spalock 995, gasol 399, vattenskål 745, båtkapell 1 215, Ducato 793, elcykel 299, terrassvärmare 225); sex av dem visade att AliExpress-priset landar över 0,7 × märket ÷ 2,4 — formerna gasolflaskeskydd, elcykelbatteriskydd, termomatta Ducato och uppvärmd vattenskål ska inte sökas igen förrän ett inköpspris under taket syns. Lärdom: kedjan har nästan varje enkel huv (grill, eldstad, dynor, däck, dragkula, terrassvärmare, elverk) — objekt med fackhandelsankare men utan kedjeform (husvagnsfront, spalock) är de som passerar.
