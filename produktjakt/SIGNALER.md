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

## Känd begränsning i verktyget

AliExpress **produktsidor** svarar med ett tomt skal i containern — varken `ali.py`, en egen
hämtning eller `WebFetch` får ut specifikationer eller säljtext (mätt 2026-09-09). Temu stryper
till ~1 hämtning/timme. Mekanismen måste därför bedömas på det vi faktiskt får:
**produktbilderna** (de visar konstruktionen), titeln och `sald`-talet ur sökträffen.
Bygg inte en bedömning som förutsätter beskrivningstext vi inte kan hämta.
