# Strandtofflor-listiclen

Byggd 2026-08-13 genom att applicera `docs/os/LISTICLE-FRAMEWORK.md` på
Motorhölje-listiclen (`Motorhölje – Lagerrensning (listicle)`, sid-id
`631451887748514611`).

| Fil | Vad |
|---|---|
| `Strandtofflor_Halkfria_listicle.gempages` | **Importera denna i GemPages.** |
| `copy_sv.py` | `M`-kartan: exakt gammal sträng → ny sträng. All svensk copy ligger här. |
| `build.py` | Pipelinen: kartor, rekursivt byte, verifiering, paketering. Kör `python3 build.py`. |

Sidan heter `Strandtofflor – Halkfria trädgårdsskor (listicle)`,
handle `strandtofflor-halkfria`.

## Vad som byttes

- **26 textblock** — alla 11 slots i frameworket.
- **8 bilder** → 6 unika Shopify-CDN-bilder från produkten (två återanvänds).
- **8 produktlänkar** → `/products/strandtofflor-for-herr-halkfria-tradgardsskor`.
- **Sidnamn, handle, meta-titel, meta-beskrivning.** GemPages cachade
  skärmbilder av källsidan nollställdes, annars hade fel förhandsbild följt med.

## Vad som medvetet behölls

Strukturen förstås, och dessutom:

- **Bylinen och profilbilden** — "Av Anders från Bäverbutiken." Samma avsändare,
  samma butik. Frameworket kräver namngiven avsändare, inte ett påhittat vittne.
- **"Jag ska vara ärlig:"** och **"Därför kan du testa helt riskfritt."** — samma
  rubriker, nytt innehåll.
- **"OBS: Detta är reklam."** i footern. Tas aldrig bort.

## Erbjudandet: verklig lagerutförsäljning

Uppgivet av ägaren 2026-08-13: Bäverbutiken kör en **verklig lagerutförsäljning**
i sina e-handelsbutiker. Syftet är att sälja ned befintligt lager, och priserna
kunderna ser nu är nedsatta mot ordinarie. Det är ingen påhittad kampanjvinkel,
och sidan kommunicerar den därför rakt ut, precis som Motorhölje-sidan gör med
sitt överlager.

**Sidan är byggd erbjudandeledd.** H1, dek, sammanfattning, ärlighetssektionen
och hero-knappen bär utförsäljningen. Punkt 1 till 5, lösningen och
riskavlastningen är oförändrat problemledda.

### Vad copyn får och inte får säga om priset

Vi har **ingen verifierad rabattsats för just den här produkten**, bara att en
utförsäljning pågår och att priset är nedsatt. Ordinarie ligger normalt omkring
25 procent högre i verksamheten som helhet, men det är inte en produktspecifik
siffra och står därför ingenstans på sidan.

| ✅ Används | ❌ Används aldrig |
|---|---|
| "vi säljer ut lagret" | Rabattsiffra eller procent |
| "nedsatt pris" | Ordinarie pris i kronor |
| "349 kr" | Slutdatum |
| "så långt lagret räcker" | Antal par i lager |
| | Nedräkning eller klocka |

Knappheten uttrycks **enbart** som "så långt lagret räcker". Det är hela
knapphetsvokabulären.

### ⚠️ Produktsidan matchar inte påståendet än

Sidan säger "nedsatt pris". Produktsidan visar idag bara 349 kr utan överstruket
ordinariepris: `compareAtPrice` ligger på 348,75 kr, alltså i praktiken inget
jämförpris. **Klickar en läsare vidare och möter en helt vanlig prislapp faller
hela ärlighetssektionen.** Sätt ordinariepriset i Shopify så att utförsäljningen
syns även där. Det är en ägaråtgärd, inte något jag gör åt dig.

## Verifierade produktfakta som copyn bygger på

Hämtade ur Shopify 2026-08-13, inget är påhittat:

- 349 kr · mjuk, lätt EVA · torkar snabbt · lätt att skölja ren
- tjock sula som dämpar · halkfritt mönster
- storlek 36 till 47 · svart, kaki, vit
- **30 dagars nöjd-kund-garanti — verifierad, står på produktsidan**

Inga kundantal, inga betyg, inga recensioner, ingen nedräkning, inga tankstreck.
Kontrolleras maskinellt av `build.py` innan filen paketeras.

## Bildkartan

Ingen av produktens Shopify-bilder visar **sulan rakt framifrån**, vilket är
produktens starkaste bevis och det som `PD_13_6` bevisat fungerar i annonser.
Två slots får därför en återanvänd bild. Laddar du upp en sulbild till Shopify
byter jag in den i `build.py` på en rad.

| Slot | Bild |
|---|---|
| Punkt 1, förnekelse | svart camo buren på fot, asfalt |
| Punkt 2, falsk lösning A | svart par uppifrån mot vägg |
| Punkt 3, oåterkallelighet | kaki buren på fot, gata |
| Punkt 4, ackumulerad kostnad | svart camo på piedestal (starkaste bilden, tyngsta punkten) |
| Punkt 5, billigt alternativ | vit variant på piedestal |
| Lösningen | kaki på piedestal |
| Ärlighetssektionen | svart camo på piedestal (återanvänd) |
| Footer | svart par uppifrån (återanvänd) |

Produktbilden med röd text "Random Shipment" är **utesluten** — leverantörstext
i bild.

## Efter importen: polish-passet

Frameworkets Del 4 gäller. Kontrollera i GemPages:

1. Anton på rubriker, Inter på brödtext
2. Rätt knapptext och rätt produktlänk på alla åtta knappar
3. Ingen dubblerad produktbild i heron
4. I varje punkt: bild under rubriken, CTA efter texten
5. Egen bild i ärlighetssektionen
6. Vit footer

## Vad som ska mätas

Sidan är ett led i funneln, inte en annons. Läs den mot produktsidan:

- **Klick → köp** från de annonser som pekar hit, mot samma annonser som pekar
  på produktsidan
- **Vilka annonser som ska peka hit:** de problemledda PD-annonserna, eftersom
  sidan är problemledd. `PD_13_1` och `PD_13_6` är kandidaterna.
- Samma grind som annonser: **ingen dom under 300 kr spend och 3 köp** på den
  trafik som skickats hit

**Otestat:** ingen A/B mellan listicle och produktsida har körts på den här
produkten. Att sidan finns betyder inte att den slår produktsidan.
