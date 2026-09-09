# /kundvakten — veckans kundproblem och chargeback-risk

Kör **en gång i veckan, måndag 07:00**. Uppdraget i en mening: **läs veckans
supportmail och butikens tvister, tala om vad kunderna klagar på, vad som är på
väg att bli en chargeback, och vilka produkter som drar dem.**

Gäller **Bäverbutiken** (bäverbutiken.se). Aldrig Grillkliniken, aldrig
OPS-butikerna.

Argument: `$ARGUMENTS` — normalt tomt. `--dagar N` = annat fönster än 90 dagar.
`--torr` = räkna och visa, skriv ingen rapportfil.

## Rutinen är läs-bara

Kundvakten ändrar **ingenting**: inte en orderstatus, inte en Notion-rad, inte
en kampanj. Den läser, räknar och skriver en rapport. Rör aldrig något i
butiken även om rapporten pekar ut ett problem — åtgärderna är Axels.

## Noll godkännanden

Fråga aldrig om lov, och avbryt aldrig för att invänta ett godkännande. Går ett
steg inte att göra: skriv det i rapporten och kör vidare med resten.

## Steg 1 — kör

```bash
node kundvakten/run.mjs --rutin
```

Skriptet läser Shopify via `SHOPIFY_TOKEN_SE` och mailen via brevlådan
(`MAIL_BREVLADA_URL`). Inga `mcp__*`-verktyg — alltså ingenting som kan utlösa
en godkännanderuta.

**Går Shopify inte att läsa** avbryter skriptet. Det är rätt beteende: en
halv rate är värre än ingen. Vanligaste orsaken är en utgången token (401) —
skriv då i rapporten att en ny Admin API-token behövs, och kör inte vidare.

**Går mailen inte att läsa** skrivs rapporten ändå, med varningen högst upp.
Rapportera det i svaret — hoppa aldrig tyst över det.

## Steg 2 — läs rapporten och döm

Rapporten ligger i `kundvakten/korningar/<datum>.md`. Gå igenom den och avgör:

1. **Är någon produkt röd?** Röd betyder att produkten ensam ligger över
   kortnätverkens gräns. Titta på vad tvisterna har gemensamt — samma produkt,
   samma leveranstid, samma vecka?
2. **Har antalet obesvarade tvister gått upp sedan förra veckan?** En obesvarad
   tvist förloras av sig själv när fristen går ut. Det är den enda posten i
   rapporten där ingenting görs och pengarna ändå är borta.
3. **Har ett mailärende ökat kraftigt?** Trendpilen visar mot förra veckan. Ett
   ärende som fördubblas är en produkt- eller leveransförändring, inte slump.

**Enmetriksdomar är förbjudna.** Döm aldrig en produkt på raten ensam.
Rangordningen i rapporten går på pengar i risk med flit — en hög rate på tolv
ordrar är ⚪ för lite data, inte ett problem.

**Döm aldrig en ⚪-rad.** Under 30 ordrar finns inget underlag. Skriv "för lite
data" och gå vidare.

## Steg 3 — skriv in lärdomen

Har veckan visat något som gäller framåt — en produkt som konsekvent drar
tvister, en leveransväg som ger "har inte fått" — skriv in det i produktens
`products/<id>/dna.md` under en egen rubrik med datum. Minnet ligger i filer,
aldrig i chatten.

Committa och pusha rapporten och eventuella DNA-ändringar.

## Steg 4 — svara Axel

Svarsformatet i `CLAUDE.md` gäller: **Läget**, max tre rader, sedan vad han ska
göra. Aldrig mer än tre saker.

Det han ska göra är nästan alltid ett av tre:

- svara på de obesvarade tvisterna i Shopify (annars förloras de),
- skicka de ordrar som ligger obefordrade,
- pausa eller fixa en produkt som ligger röd.

Skriv siffran, inte resonemanget.

## Definition of done

- [ ] `node kundvakten/run.mjs --rutin` har körts
- [ ] Rapporten finns i `kundvakten/korningar/<datum>.md`
- [ ] Butikens rate och dess nivå står i svaret
- [ ] Antal obesvarade tvister står i svaret
- [ ] Gick mailen inte att läsa: det står uttryckligen i svaret
- [ ] Ingen dom har fällts på en ⚪-rad
- [ ] Lärdomar inskrivna i berörd `products/<id>/dna.md`
- [ ] Allt committat och pushat
- [ ] Svaret till Axel följer formatet i `CLAUDE.md`
