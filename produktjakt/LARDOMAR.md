# Lärdomar från Axels svar

Läses av `/produktjakt` INNAN sökningen. Auto-delen räknas av `feedback.py vikter`; skriv aldrig i den för hand.

<!-- auto:start -->
Uppdaterad 2026-09-14. **47 svar** — ja 32, kanske 9, nej 6.

## Det Axel säger ja till

- prisband **500–999**: 27 ja, 3 kanske, 2 nej → score 0.868
- ankare_klass **1,3–1,6×**: 14 ja, 1 kanske, 0 nej → score 0.912
- form **överdrag**: 13 ja, 0 kanske, 1 nej → score 0.875
- deadline_klass **6–12 v**: 10 ja, 1 kanske, 0 nej → score 0.885
- prisband **300–499**: 10 ja, 2 kanske, 0 nej → score 0.857
- ankare_klass **≥ 1,6×**: 9 ja, 4 kanske, 3 nej → score 0.667
- ankare_klass **golv utan ankare**: 8 ja, 0 kanske, 0 nej → score 0.9
- arketyp **A1**: 8 ja, 1 kanske, 0 nej → score 0.864
- deadline_klass **2–6 v**: 8 ja, 0 kanske, 0 nej → score 0.9
- ankare_klass **1,2–1,3×**: 7 ja, 0 kanske, 0 nej → score 0.889
- deadline_typ **uppställning**: 7 ja, 1 kanske, 0 nej → score 0.85
- form **annat**: 7 ja, 2 kanske, 0 nej → score 0.818
- prisband **≥ 1 000**: 7 ja, 0 kanske, 1 nej → score 0.8
- arketyp **B_SKYDDA_DYRT**: 7 ja, 0 kanske, 2 nej → score 0.727
- deadline_typ **första frost**: 6 ja, 0 kanske, 2 nej → score 0.7

## Det Axel säger nej till

- ankare_klass **≥ 1,6×**: 3 nej, 9 ja → score 0.667
- deadline_typ **första frost**: 2 nej, 6 ja → score 0.7
- arketyp **B_SKYDDA_DYRT**: 2 nej, 7 ja → score 0.727
- prisband **500–999**: 2 nej, 27 ja → score 0.868
- grupp **belysning och mörker**: 1 nej, 0 ja → score 0.333
- grupp **Gårdshunden/hundgården**: 1 nej, 0 ja → score 0.333
- grupp **Luftvärmepumpens utedel**: 1 nej, 0 ja → score 0.333
- grupp **Släpkärra**: 1 nej, 0 ja → score 0.333
- ankare_kalla **Kerbl Pet Levin plastkoja 99×70×75 (zooplus.se)**: 1 nej, 0 ja → score 0.333
- ankare_kalla **Clas Ohlson Värmepumpsskydd plåt med tak 36-217, 100×80×50 cm**: 1 nej, 0 ja → score 0.333
- ankare_kalla **Fogelsta kapellock FS1425 (formsydd kapellväv, original)**: 1 nej, 0 ja → score 0.333
- form **hus**: 1 nej, 0 ja → score 0.333
- objekt **Gårdshunden/hundgården**: 1 nej, 0 ja → score 0.333
- objekt **Luftvärmepumpens utedel**: 1 nej, 0 ja → score 0.333
- objekt **Släpkärra**: 1 nej, 0 ja → score 0.333

## Orsakerna han anger

- **Känns rätt**: 0 nej, 12 ja, 0 kanske
- **Skyddar något**: 0 nej, 8 ja, 0 kanske
- **Deadline nu**: 0 nej, 4 ja, 0 kanske
- **För dyr**: 2 nej, 0 ja, 0 kanske
- **Nöjd med det han har**: 2 nej, 0 ja, 0 kanske
- **Bra ankare**: 0 nej, 1 ja, 0 kanske
- **Snygg bild**: 0 nej, 1 ja, 0 kanske
- **Kedjan har den**: 1 nej, 0 ja, 0 kanske
- **Tråkig**: 1 nej, 0 ja, 0 kanske
- **Har redan**: 1 nej, 0 ja, 0 kanske
- **Kan bli bra**: 0 nej, 0 ja, 1 kanske
- **Lågt upplevt värde**: 0 nej, 0 ja, 1 kanske

## Stoppas i nästa körning (≥ 3 nej, 0 ja)

- inget

## Lyfts i nästa körning (≥ 3 ja)

- ankare_kalla:eurotrail/getcamping.se
- ankare_kalla:lego.com/kedjan
- ankare_kalla:pricerunner.se (Kerbl/Northix)
- ankare_klass:1,2–1,3×
- ankare_klass:1,3–1,6×
- ankare_klass:ej mätt
- ankare_klass:golv utan ankare
- ankare_klass:≥ 1,6×
- arketyp:A1
- arketyp:A3
- arketyp:A4
- arketyp:A_AGARE_FRIKTION
- arketyp:B_SKYDDA_DYRT
- arketyp:E_VADER_SASONG
- arketyp:G_Q4_GAVA
- arketyp:H_VISUELL_NYHET
- arketyp:verktyg
- deadline_klass:2–6 v
- deadline_klass:6–12 v
- deadline_klass:pågående
- deadline_typ:1 december
- deadline_typ:första frost
- deadline_typ:första snö
- deadline_typ:uppställning
- deadline_typ:upptagning
- deadline_typ:älgjakt
- form:annat
- form:kalender
- form:koja
- form:överdrag
- objekt:Barnbarnet — adventskalendern
- objekt:Husvagn — taket
- objekt:Utekatten
- prisband:300–499
- prisband:500–999
- prisband:≥ 1 000

<!-- auto:end -->

## Egna anteckningar (rutinen skriver här, en rad per körning)

- 2026-09-09: Axel om sina kanske-svar: "ofta väldigt lågt upplevt värde". Vedklyvborr, sotset, oljepump, rännskopa — små verktygslika varor som inte ser ut som sitt pris. Ny etikett "Lågt upplevt värde" på sidan; ny variabel i masterprompten.
- 2026-09-10: Axel om ramperna till husbilen: "varenda campare har dem sedan innan, jag har jobbat på camping". Och principen bakom: "jag går väldigt mycket utefter om man sett produkten innan eller inte". **Standardutrustning som varje ägare redan har är död oavsett säsong och ekonomi** — det är K0/K4, inte K6. Ramperna hade rätt datum, rätt objekt, rätt prisband och föll ändå. Frågan att ställa före varje kandidat: *har ägaren redan en?* Svaret finns hos den som jobbat med kunderna, inte i en kedjas sortiment.
- 2026-09-10: Vilthissens listningsbild visar ett trebent stålstativ med vinsch, men paketet för 242 kr landat är ett repblock + galge (bekräftat mot Amazon/Walmart/eBay). **Bilden kan lova en annan vara än den som skickas** — ny kontroll innan bild används: stämmer landad kostnad med det bilden visar? Axel svarade ja på vilthissen och solcellsladdaren, nej på ramperna; wow-mätningen sa skippa på alla tre. Båda står (8.6).
- 2026-09-10 (manuell DOA-körning, eftermiddag): 0 nya svar sedan morgonen · STOPP nya: inga · LYFT nya: ankare_klass:1,2–1,3×, deadline_klass:6–12 v (ur utfall.json: V1, V2, V3 launchade 09-08/09-09) · parkerat: halkskydd A6 → v 44, poolsolskydd → april · Meta-utfall: Taköverdraget → launchad, Utekattkojan → launchad, Adventskalendern → launchad (≥ BE/< BE först vid 2 000 kr + två snapshots) · Avvikelse: ingen orsak ≥ 5 ggr ännu (12 svar) · Ändrat i sökningen i morgon: 10 objektrader har mätt ankare i objekt.json (frontskydd 1 145, spalock 995, gasol 399, vattenskål 745, båtkapell 1 215, Ducato 793, elcykel 299, terrassvärmare 225); sex av dem visade att AliExpress-priset landar över 0,7 × märket ÷ 2,4 — formerna gasolflaskeskydd, elcykelbatteriskydd, termomatta Ducato och uppvärmd vattenskål ska inte sökas igen förrän ett inköpspris under taket syns. Lärdom: kedjan har nästan varje enkel huv (grill, eldstad, dynor, däck, dragkula, terrassvärmare, elverk) — objekt med fackhandelsankare men utan kedjeform (husvagnsfront, spalock) är de som passerar.
- 2026-09-11: 3 nya svar (2/1/0) · STOPP nya: inga · LYFT nya: ankare_klass:1,3–1,6×, ankare_klass:golv utan ankare, arketyp:A1, arketyp:verktyg, deadline_klass:2–6 v, deadline_typ:uppställning, form:överdrag, prisband:500–999 (ur 7 launchade i utfall.json — obs: 'arketyp:verktyg' lyfts av att Axel launchade Stegstödet och Solcellslarmet; LYFT upphäver aldrig K3) · parkerat: luftvärmepump-snötak → v 39, gårdshund-koja → v 39, utekatt-värmeplatta → v 38 · Meta-utfall: Taköverdraget → ≥BE prel. (ROAS 6,46), Utekattkojan → ≥BE prel. (2,50), Adventskalendern → ≥BE prel. (3,11); Stegstödet 912 kr/1 köp, Staketstolpslagaren 1 009 kr/0 köp (< 2 000, ej dömda) · Avvikelse: ingen orsak ≥ 5 ggr (15 svar) · Ändrat i sökningen i morgon: karantänen lyfts när ett ankare mäts (gjort för hand i dag), `--objekt` för riktad körning, ankaret gäller formen inte objektet (dörrflik 2 399 kr och tygkåpa 1 799 kr är fel), skriv alla som klarat ekonomin i stället för topp 12 på uppslag.
- 2026-09-12: 18 nya svar (15/2/3) · STOPP nya: inga · LYFT nya: 25 (klick är bevisnivå 2 — visas, styr inte) · parkerat: Highland Cow-kalender → v 38 (< 20 USD), hästens värmehink → v 38 (ankare 1 299), igelkottshus → v 39, utekattens värmeplatta → v 41 (annan källa) · Meta-utfall: Termoskyddet husbil → REAL_WINNER MEANINGFUL prel. (ROAS 4,33), V1/V2/V3 HIGH prel. (bekräftas ≥ 09-14) · Avvikelse: 'Nöjd med det han har' = standardutrustning (kärrkapell) — samma som ramperna · Ändrat i sökningen i morgon: hållare/krokar bara där kedjan säljer en och ägaren behöver många; objektfält unikt före tankstrecket; en H10-lins och en H09-lins med hästhinken.
- 2026-09-13: 7 nya svar (7/0/0), 5 obesvarade LÅG-rader · STOPP nya: inga · LYFT nya: 29 (bevisnivå 2) · parkerat: hästhink → v 39 bara 24 V, husbilskalendern + ekorrsäker automat → i morgon (utanför batch på plats), igelkott → v 42 · Meta-utfall: V1 15 166/71/5,35 och termoskyddet 3 417/19/3,22 håller; kojan 6 237/13/1,73 (0 köp senaste dygnet) och kalendern 7 398/24/1,91 tappar — dom 09-14 · Avvikelse: Axel prissatte 13 butikslaunches −54 % till +31 % mot våra förslag (facit på K7 när kampanjerna finns) · Ändrat i sökningen i morgon: kroppsligt-lins + Makita-lins för exploitation; inga LÅG-rader utan asymmetri; SAK-nyckel med tema.
- 2026-09-14: 5 nya svar (3/2/0) på 09-12:s LÅG-rader — 'Lågt upplevt värde' på maskinhyllan · STOPP nya: inga · LYFT nya: 36 (bekräftade vinnare väger 3) · parkerat: isfiske → v 2 · Meta-utfall: taköverdraget BEKRÄFTAD vinnare (16 109/79/5,65); kojan och kalendern bekräftade men pausade nära BE · Avvikelse: obesvarat lästes som ointresse i går — fel, svar kom ett dygn senare · Ändrat i sökningen i morgon: svar läses efter 48 h; en säsongslins; samma form + samma kropp = en rad.
