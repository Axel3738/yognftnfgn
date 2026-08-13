# Sätesöverdrag listicle (advertorial)

Byggd 2026-08-13 enligt `docs/os/LISTICLE-FRAMEWORK.md` genom att klona
motorhölje-listiclen (`baverbutiken.se/pages/motorholje-lagerrensning`) och byta
allt innehåll, aldrig strukturen.

| Fil | Vad |
|---|---|
| `Satesoverdrag_listicle.gempages` | Färdig GemPages-import |
| `copy.json` | All text, en nyckel per slot. Ändra här, inte i JSON:en |
| `build.py` | Bygger om paketet från källexporten och kör alla kontroller |

Sidans identitet: namn `Sätesöverdrag för åkgräsklippare (listicle)`, handle
`satesoverdrag-akgrasklippare`, sid-id `631451887748514777`. **Ny id sattes med
flit** så importen inte skriver över motorhölje-sidan (som har id
`...514611`). Detta steg saknas i frameworket och bör läggas till där.

## Vad som behölls och vad som byttes

Behållet: layout, sektionsordning (10 sektioner), CSS, knappplaceringar,
bildproportioner, spacing, avsändaren "Anders från Bäverbutiken", rubriken
"Jag ska vara ärlig:", "Därför kan du testa helt riskfritt.", footern med
"OBS: Detta är reklam.", profilbilden och footer-logotypen.

Bytt: 26 textblock, 7 produktbilder (hämtade ur produktens egna Shopify-media),
produktlänken på alla 8 knappar, och knapptexten per sektion (8 unika CTA:er).

## Punkternas roller (ordningen är frameworkets, innehållet är vårt)

| # | Roll | Vår version |
|---|---|---|
| 1 | Förnekelse | Sätet ser fortfarande helt ut |
| 2 | Falsk lösning A | Du har redan löst det med en handduk |
| 3 | Oåterkallelighet | Det går inte att fixa i efterhand |
| 4 | Ackumulerad kostnad | Det är inte en dag, det är varje dag |
| 5 | Falsk lösning B | Det billiga alternativet är sämre än inget |

Punkt 2 bär kontots starkaste mätta insikt: handduks-hooken (`PD_13_H1`, CTR
3,87 %, högst i kontot). Punkt 4 landar i prisankaret, som är kontots
bäst konverterande budskap (`SO_1_1_H1`, LPV→köp 6,33 %).

## AVVIKELSE FRÅN KÄLLSIDAN, medveten

Källsidan säljer på **lagerrensning** ("vi beställde in för många"). Den ramen
kunde inte återanvändas: vi har ingen överlagersituation på sätesöverdraget
(lagersaldot i Shopify är till och med negativt). Att skriva en påhittad
lagerrensning hade brutit både frameworkets egen regel om ärligt prisskäl och
CLAUDE.md:s regel att aldrig hitta på data.

Ärlighetssektionen säger därför sanningen i stället: 649 kr är vad överdraget
kostar hos oss varje dag, 811 kr är ordinarie pris (verifierat som
`compareAtPrice` i Shopify), och det verkliga argumentet är att du byter ett
överdrag i stället för ett helt säte. Ingen "så länge lagret räcker" finns kvar
på sidan.

## Kontroller som körs vid varje bygge (build.py stoppar vid fel)

- Varje textnyckel måste träffa exakt en källsträng, annars stopp
- 0 em-dash, 0 tankstreck i löptext
- Ordet "överstruket" får inte finnas
- Källproduktens ord (motorhölje, kåpa, båt, salt, vax, glans, 420D, hk,
  dragsko, lagerrensning, 299 kr, 367 kr ...) måste vara 0
- Alla gamla bild-URL:er borta, alla nya använda minst en gång
- Gamla produktlänken 0 träffar, nya finns
- Obligatoriska strängar: 649 kr, 811 kr, 600D, "OBS: Detta är reklam."

## Otestat

Ingen A/B mellan listicle och produktsida är körd, varken här eller för
motorhöljet. Att sidan finns säger inget om att den slår produktsidan.
Mät klick→köp för de annonser som pekas hit mot samma annonser mot produktsidan,
under samma grind som annonser: 300 kr spend och 3 köp.

**Vilka annonser bör peka hit:** SO-spåret (prisankaret) och `PD_18_H1`, som är
de creatives som bär kostnadsjämförelsen. Frameworkets följdregel gäller:
annonsens löfte = sidans första mening.

## Claim som bör beläggas

"Ett nytt säte kostar flera tusenlappar" står på sidan. Det är samma claim som
redan körs i annonserna sedan launch, men det är aldrig belagt mot en prislista.
Värt en källa innan sidan skalas.
