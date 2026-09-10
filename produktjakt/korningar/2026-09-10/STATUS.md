# Produktjakt 2026-09-10

16 sökord ur sokord.json (objekt.json saknas ännu — `hitta.py` föll tillbaka på katalogen).
Karantänen höll 28 ord från gårdagen borta. USD/SEK 9,5687 (ECB 2026-09-10).
18 kandidater klarade ekonomin, 12 gick till läsningen, 3 blev kvar.

Axels 9 svar från gårdagens sida är inlästa (`vikter.json`): 0 stopp, 0 lyft.

## Kvar — 2 produkter på arket (ramperna strukna på Axels ord, se nedan)

| # | Produkt | Grupp | Landad | Tänkt pris | Uppslag |
|---|---|---|---|---|---|
| 1 | Vilthiss med block och bock, 700 lbs | jakt | 242 kr | 599 kr | 2,47× |
| 2 | Uppkörningsramper husvagn, 2-pack | husvagn och husbil | 318 kr | 799 kr | 2,51× |
| 3 | Solcellsladdare 10 W MPPT, batteriunderhåll | båt och trailer | 367 kr | 899 kr | 2,45× |

Säsongen mitt i september: älgjakten pågår (vilthissen), husvagnen ställs upp för
vintern (ramperna), batteriet lämnas utan el till maj (laddaren).

## Strukna — 9 produkter

| Produkt | Orsak |
|---|---|
| Firewood Log Splitter Drill Bit Set (1005010580308237-gruppen, 399 kr) | **Stod på gårdagens ark** — samma vedklyvborr, annan säljare. Axel svarade "kanske" på den i går. |
| 4pcs Hex Shank Wood Splitter Drill Bits | Samma vara som ovan, tredje säljaren. |
| Monocrystalline Solar Panel Trickle Charger 599 kr | Dubblett i sak med solcellsladdaren. Sämre spec (ingen MPPT). |
| LEAORLD 7.5W MPPT 999 kr | Dubblett i sak med solcellsladdaren. Sämre uppslag. |
| 3Pcs Cattle Water Float Valve | Reservdel i 3-pack, ingen egen payoff. Frostproblemet ligger i november. |
| Deer Hanger Game Hoist Gambrel + Drag Harness 499 kr | Dubblett i sak med vilthissen. Ren bock utan block — lägre upplevt värde. |
| Deer Hanger Gambrel Heavy Duty Steel 499 kr | Dubblett i sak med vilthissen. |
| Pool Solar Cover Reel Straps Kit 599 kr | Kit och förbrukning. Poolsäsongen är slut, remmarna används när duken rullas *på*, inte när poolen stängs. Lågt upplevt värde. |
| 8-Piece Pool Cover Reel Straps Kit 499 kr | Samma sak. |

## Upplevt värde (Axels nya variabel från i går)

Vilthissen ser ut som sitt pris: tungt stål, block, kätting. Ramperna är två stora
plastkilar — gränsfall, men de är stora och tunga i bild. Solcellsladdaren med MPPT-
regulator och klämmor ser teknisk och gedigen ut. Ingen av de tre är en liten plastpryl.

## Axels svar på sidan 2026-09-09 → 2026-09-10 (klick + chatt)

| Produkt | Dom | Orsaker |
|---|---|---|
| Vilthissen | **ja** | Känns rätt |
| Solcellsladdaren | **ja** | — |
| Ramperna | **nej** | Fel säsong · Har redan · Kedjan har den |

Axel i chatten: *"Jag går väldigt mycket på utefter om man sett produkten innan eller inte. De där
ramperna till husbil har varenda campare sedan innan, jag har jobbat på camping."* Ramperna togs
bort från arket och fraserna ströks ur katalogen. Lärdomen står i `LARDOMAR.md` och `SIGNALER.md`.

## Wow-testet — alla tre "skippa" enligt mätningen

| Produkt | Dom | Varför |
|---|---|---|
| Slaktgalge med lyftblock (700 lbs) | skippa | Timingen är rätt (älgjakten startade 1 september i norr, 8 oktober i söder; vildsvin, kronhjort, dovhjort och råbock pågår), men varan som skickas är ett rep med block och en galge — inte stativet i bilden — och en sådan ser ut so |
| Nivåkilar för husbil och husvagn, 2-pack | skippa | Varan saknar allt som bar vinnarna: ingen leverantörsvideo, inget oväntat i bild, och en billig ihålig plastkil som ser ut som Biltemas 249 kr-kloss medan vi vill ta 799 kr. Dessutom är mitten av september slutet på husbilssäsonge |
| Solcellsladdare 12V 10W för båt och bil | skippa | Ingenting händer synligt på tre sekunder — en platta läggs ner och klämmor sätts på, laddning är osynlig och ingen leverantörsvideo med produkten i bruk hittades. Varan ser ut som en 300-kronors plastskiva bredvid ECO-WORTHY och B |

**Mätningen och Axel säger olika** på vilthissen och solcellsladdaren (MASTERPROMPT 8.6). Båda står.
Facit kommer från leverantörens pris och en eventuell launch.

⚠️ **Vilthissen: listningsbilden visar en annan vara än paketet.** Bilden är ett 2,4 m trebent
stålstativ med vinsch; det som skickas för 242 kr landat är ett repblock 1:4, ~12 m rep och en
stålgalge (bekräftat mot Amazon/Walmart/eBay-listningar med samma titel). Bilden får inte
användas i en annons. Fråga leverantören uttryckligen vad som ingår innan pris sätts.
Svensk tvilling: Grey Oak/Stabilotherm slaktgalge med spel, 400–499 kr hos Widforss, Swedol,
PN Jakt.

## Kvitto: kommandots Definition of done

- ✅ `fynd.json` finns med minst en produkt (2)
- ✅ Strukna med kriterium i STATUS (9 + ramperna)
- ✅ Offertark byggt, prisfälten tomma, ett block per produkt
- ✅ Sidan publicerad mot samma URL, med db + downloads
- ✅ Nedladdningsknappen — Axel har hämtat och svarat på sidan i dag
- ✅ `sedda.json` uppdaterad och pushad
- ✅ Steg 0: 12 svar inlästa från sidan (`feedback.py samla` + `vikter`)
- ❌ Steg 0 kontots facit (Meta-kampanjer → `utfall.json`): inte kört i dag — `META_ACCESS_TOKEN` ej prövad i den här körningen
- ❌ K0–K12-poängkortet per produkt i `fynd.json`: körningen startade före merge av MASTERPROMPT v3.1; morgondagens körning följer det
- ✅ Raden i `RUTIN-KVITTO.md`
- ✅ Discord skickat
