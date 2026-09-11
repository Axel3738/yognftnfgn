# Signaler från Axel — och hur de ska läsas

## Grundregeln, Axels besked 2026-09-09

> "Jag bara säger produkter som har gått bra, och det betyder inte att de nischerna är op.
> Du ska ju hitta gemensamma variabler i alla produkter som gör det till vinnare genom att
> kolla på AliExpress- och Temu-sidorna och kolla om produkterna har unika mekanismer och
> funktioner och liknande."

**Att en vara sålt bra är inte ett kvitto på dess nisch.** Vikta aldrig upp en sökordsgrupp
för att en produkt i den gick bra — det var precis felet 2026-09-09, när husvagn och djur
fick högre vikt och sedan sänktes tillbaka igen samma dag.

Signalen ligger i **mekanismen och funktionen**, inte i kategorin. Frågan om varje kandidat är:
*gör den något som kedjans variant inte gör, och syns det?* Två vinnare i olika nischer ska
kunna dela samma mekaniska variabel — det är den variabeln som ska jaga nästa produkt.

## Vad Axel sagt om enskilda produkter

| Datum | Produkt | Vad han sa | Vad det INTE betyder |
|---|---|---|---|
| 2026-09-09 | Husvagnsöverdrag | "verkar gå bra" | Att husvagnsnischen är öppen. |
| 2026-09-09 | Kattkojan | "verkar gå bra" | Att djurnischen är öppen. Varan ville han ändå inte ha på arket. |
| 2026-09-09 | Sotset, båtkapellstötta | valde dessa två av fem | — |

## Axels svar på sidan 2026-09-09 (första omgången med knapparna)

Nio svar: 3 ja, 4 kanske, 2 nej. Ja på tvättmoppen, vibrationslarmet och båtkapellstöttan
(orsak "Skyddar något" + "Känns rätt" på alla tre). Nej på COB-arbetslampan och navskydden
("För dyr", "Kedjan har den", "Tråkig"). Kanske på vedklyvborren, sotsetet, oljepumpen och
rännskopan — och Axels egen förklaring i chatten:

> "De som jag valt kanske på är också ofta att det är väldigt lågt upplevt värde."

> "Det är viktigt att tänka på, för är det ett högt upplevt värde gör det stooor skillnad."

**Upplevt värde är alltså en egen, tung variabel**: ser varan ut att vara värd 500–1 000 kr i en
bild, eller ser den ut som en plastpryl för 99 kr? Vedklyvborren, sotsetet, oljepumpen och
rännskopan är alla små, billiga i utseendet och verktygslika — ekonomin gick ihop på papperet
men varan *ser* inte ut som sitt pris. Etiketten "Lågt upplevt värde" finns nu på sidan.

Obs: Axels ja på moppen och larmet går emot wow-testets dom samma dag ("payoffen syns inte i
ett tystat flöde"). Båda står. Facit kommer från leverantörens pris och en eventuell launch —
inte från vem som hade rätt.

## Känd begränsning i verktyget

AliExpress **produktsidor** svarar med ett tomt skal i containern — varken `ali.py`, en egen
hämtning eller `WebFetch` får ut specifikationer eller säljtext (mätt 2026-09-09). Temu stryper
till ~1 hämtning/timme. Mekanismen måste därför bedömas på det vi faktiskt får:
**produktbilderna** (de visar konstruktionen), titeln och `sald`-talet ur sökträffen.
Bygg inte en bedömning som förutsätter beskrivningstext vi inte kan hämta.

## Axels svar 2026-09-10: "sett innan" är hans första filter

> "Jag går väldigt mycket på utefter om man sett produkten innan eller inte."
> "De där ramperna till husbil har varenda campare sedan innan, jag har jobbat på camping."

Två olika saker, och båda är kill:
1. **Ägaren har redan en.** Uppkörningsramper är standardutrustning i varje husvagn — man
   köper dem med vagnen. Rätt datum, rätt objekt, rätt pris, och ändå noll. Det är K0/K4.
2. **Axel har sett den förut.** Har han sett varan i flödet eller på en hylla är den inte
   ny i svenskt flöde, och kategorinyhet är det som bär (vinnar-DNA punkt G).

Axels branschkunskap (campingen) är en källa rutinen inte har. När han säger "alla har
den" är det facit — skriv ner det på objektraden i `objekt.json` så det aldrig söks igen.

## Axels svar 2026-09-11 på V3:s första batch: "du har sneat in dig på överdrag för mycket"

Batchen hade 6 av 11 i skyddsform (snöskoterkapell, släpkärrekapell, värmepumpsskydd, takluckehuv, hjulskydd,
ATV-kapell). Två vinnare (taköverdraget, utekattkojan) hade dragit hela sökningen mot samma FORM. Det är exakt
fällan uppdraget varnade för: *"do not collapse into finding 20 covers because two covers won — abstract upward"*.

Facit stödjer Axel: 9 av kontots 18 REAL WINNERS är inte överdrag — spöklämman (#2 i vinst), kameran, bandslipen,
axelbältet, damaskerna, cykelshortsen, klistermärkena, adventskalendern, strandtofflorna. Det som bär är
**strukturen** (ägt objekt ute + hyllfrånvaro + leverantörsmaterial + prisutrymme), inte formen.

Följd: `rank.py` har ett **formtak** (skyddsformer högst 40 % av batchen) och ett arketyptak (50 %), och
discovery-linserna ska täcka minst tre strukturer per körning: ordning/friktion (spöklämma), maskin som gör
jobbet (bandslip), synlig nyhet (klistermärken), djur/datum, skydd — aldrig bara skydd.

