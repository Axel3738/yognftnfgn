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

## Prisramen (uppdaterad 2026-08-13)

Axel har bekräftat att en **verklig lagerutförsäljning pågår**: syftet är att
sälja ned befintligt lager och nuvarande priser är nedsatta mot ordinarie.
Sidan bygger därför på samma reason-why-mekanik som källsidan. Följande block
skrevs om: `h1`, `dek`, `hero_cta`, `summary`, `honesty_body`, `risk_body`,
`risk_cta` och `solution_cta`.

Gränserna som gäller ändå, och som `build.py` upprätthåller:

| Tillåtet | Inte tillåtet |
|---|---|
| "lagerutförsäljning", "nedsatta priser", "så långt lagret räcker" | Procentsatser. Vi skriver 649 mot ordinarie 811 kr, aldrig ett tal i procent |
| 649 kr och 811 kr (`price` och `compareAtPrice` i Shopify) | Slutdatum, nedräkning, "sista chansen", "bara idag" |
| Att vi säljer ned befintligt lager | **Varför** vi gör det. Källsidans "vi beställde in för många" är inte vårt skäl och används inte |
| | Lagersiffror: "bara X kvar", "X sålda" |

Ordinarie-priset 811 kr påstås vara vårt normalpris, vilket ägaren bekräftat.
Sidan påstår däremot **inte** att priset historiskt tagits ut under någon viss
period, eftersom det inte går att belägga ur underlaget.

## Kontroller som körs vid varje bygge (build.py stoppar vid fel)

- Varje textnyckel måste träffa exakt en källsträng, annars stopp
- 0 em-dash, 0 tankstreck i löptext
- Ordet "överstruket" får inte finnas
- Källproduktens ord (motorhölje, kåpa, båt, salt, vax, glans, 420D, hk,
  dragsko, 299 kr, 367 kr ...) måste vara 0
- Obelagda påståenden i VÅR nya text måste vara 0: procentsatser, "sista
  chansen", "bara idag", "gäller till", slutdatum, "bara X kvar", "X sålda"
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
