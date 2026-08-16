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

## Prisramen och berättelsen (uppdaterad 2026-08-13, andra revisionen)

Ägaren har bekräftat förstahands att **vi råkade beställa in för många**: lagret
är större än vi vill ha, det ska säljas ned, och det är därför utförsäljningen
körs och priserna är nedsatta. Sidan bär den berättelsen från rubriken till sista
knappen, precis som källsidan gör med sin.

Berättelsen som går igenom hela sidan: vi beställde för många → lagret blev
större än planerat → vi behöver sälja ned det → därför lagerutförsäljning →
därför nedsatt pris just nu.

Omskrivna block: `h1`, `dek`, `hero_cta`, `summary`, `honesty_body`, `risk_body`,
`risk_cta`, `solution_cta` och samtliga fem punkt-CTA:er (`p1_cta` till
`p5_cta`), så att inget block säger något annat än de andra. De fem
problempunkternas brödtext är oförändrad.

### Priserna, verifierade live 2026-08-13

`price` 649,00 kr mot `compareAtPrice` 811,25 kr, alltså exakt **20 %** nedsatt.
`build.py` räknar själv ut procentsatsen ur `PRICE` och `COMPARE` och **stoppar
bygget om texten innehåller något annat procenttal**, eller om samma tal nämns
mer än en gång. Sidan använder i nuläget bara kronbeloppen; procentsatsen sparas
till videomanuset där swipens struktur kräver den.

**Ändras priset i butiken är siffrorna i `build.py` fel och sidan måste byggas
om.** Det är den enda manuella kopplingen mellan Shopify och den här sidan.

| Tillåtet | Inte tillåtet |
|---|---|
| Att vi beställde för många och sitter med överskottslager | Antal: "bara X kvar", "X sålda", "två pallar kvar" |
| "lagerutförsäljning", "nedsatta priser", "så långt lagret räcker" | Slutdatum, nedräkning, "sista chansen", "bara idag" |
| 649 kr och 811 kr, och 20 % en gång | Varje annan procentsats |

## Paketformatet, fyra fel som stoppade importen en gång

Första paketet importerades inte i GemPages. Orsaken var att exportstrukturen
inte var återskapad exakt. Fyra saker måste stämma, och `build.py` kontrollerar
dem numera automatiskt mot originalexporten innan filen skrivs:

| Krav | Vad som var fel |
|---|---|
| Inre filnamn heter `1_<sid-id>.zip` och `1_<sid-id>.json` | Prefixet `1_` saknades, filerna hette bara `<sid-id>` |
| Alla zip-poster är DEFLATE-komprimerade | Yttre arkivet var lagrat okomprimerat |
| `manifest.json` är byte-identisk med originalets | `image_url_count` var satt till 7 i stället för 0, och radbrytningen på slutet saknades |
| JSON skrivs kompakt, utan mellanslag efter kolon och komma | Skrevs med Pythons standardformat |

`manifest.json` kopieras nu ordagrant ur källexporten, eftersom ingenting i den
beskriver vår sida. Bygget avbryts om paketets filnamn, komprimering eller
metadata avviker från originalet.

## Kontroller som körs vid varje bygge (build.py stoppar vid fel)

- Varje textnyckel måste träffa exakt en källsträng, annars stopp
- 0 em-dash, 0 tankstreck i löptext
- Ordet "överstruket" får inte finnas
- Källproduktens ord (motorhölje, kåpa, båt, salt, vax, glans, 420D, hk,
  dragsko, 299 kr, 367 kr ...) måste vara 0
- Obelagda påståenden i VÅR nya text måste vara 0: "sista chansen", "bara idag",
  "gäller till", slutdatum, "bara X kvar", "X sålda"
- Varje procenttal måste vara lika med det uträknade (649/811,25 = 20 %) och får
  förekomma högst en gång
- Både 649 och 811 måste finnas i den nya texten
- Alla gamla bild-URL:er borta, alla nya använda minst en gång
- Gamla produktlänken 0 träffar, nya finns
- Obligatoriska strängar: 649 kr, 811 kr, 600D, "OBS: Detta är reklam."
- Paketets filnamn, komprimering och metadata jämförs mot originalexporten

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
