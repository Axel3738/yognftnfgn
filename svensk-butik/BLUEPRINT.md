# Svensk kuddbutik — blueprint och bygglogg

**Datum:** 2026-08-29 · **Butik:** "My Store" (a6k90m-ii.myshopify.com, SEK, Sverige)
**Förlaga:** allaboutvibe.com (custom pet pillows, USA) — vi tar produkten och
strukturen, INTE bilderna, copyn eller vinkeln.

⚠️ Det här är en **tredje verksamhet** — den har inget med Bäverbutiken
(MagiBorsten) eller Grillkliniken (SnarkLös) att göra. Ingen Meta-koppling är
gjord ännu. Blanda aldrig in de kontona utan Axels uttryckliga besked.

---

## 1. Produkten och förlagan

Konkurrenten säljer kuddar skurna i husdjurets exakta silhuett, tryckta från
kundens eget foto. Deras data (avläst 2026-08-29):

- Priser: 16" $75, 22" $90, 30" $110, 60" $240 — med ständig "40% OFF"-rea
- Vinkel: **presenten** ("The gift they'll never forget"), kändisar, rea-skrik
- Struktur på produktsidan (värd att behålla): galleri → storleksval →
  beskrivning → 5 fördelar → storleksguide → personas → 3-stegsprocess →
  testimonials → FAQ → recensioner
- Garanti: "we'll remake it for free until you're 100% happy" + designer
  granskar varje bild manuellt
- 4,9/5 med 16 712 recensioner (deras — inte våra; vi lånar ALDRIG siffrorna)

## 2. Vinkelbytet (kärnbeslutet)

**Originalet säljer presenten. Vi säljer relationen.**
Arbetsrubrik: *"En bit av din hund du får behålla."*

Tre ben:

1. **Vardagsmys** — kudden i det skandinaviska hemmet. Linne, ljust trä,
   dämpade färger. Den smälter in i vardagsrummet i stället för att skrika.
   Detta styr bildspråket (se §5) och är vår tydligaste visuella
   differentiering mot förlagans amerikanska mockup-estetik.
2. **För alltid** — husdjur blir aldrig gamla nog. Minnesvinkeln får en egen
   produktsida (Minneskudden) med lågmäld, respektfull ton. Aldrig
   exploaterande, ingen rea-energi där.
3. **Ärlighet** — inga låtsasreor, priser inkl. moms, ärliga leveranstider
   (8–12 arbetsdagar, sys på beställning), omsy-garanti. Det är både vinkel
   och juridik (se §4).

**Målgrupp:** svenska hund- och kattägare 25–65, tyngdpunkt kvinnor 30–55.
Köper åt sig själva OCH som present till djurägare.

## 3. Sortiment och priser (beslutade)

Alla priser inkl. moms (`taxesIncluded: true` är verifierat i butiken).
**Inga jämförpriser vid lansering** — se §4.

| Produkt | Storlekar | Pris | SKU |
|---|---|---|---|
| Husdjurskudden (huvudprodukt) | 40 / 55 / 75 cm | 599 / 799 / 1 099 kr | HK-40/55/75 |
| Minneskudden (minnesvinkel, samma fysiska produkt) | 40 / 55 cm | 599 / 799 kr | MK-40/55 |
| Fotokudden (fyrkantig, fototryck) | 40×40 / 50×50 cm | 449 / 549 kr | FK-40/50 |

Prisnivån ligger i linje med förlagan ($56–120 ≈ 540–1 150 kr) och lämnar
dropshipping-marginal (COGS för custom-kuddar hos vanliga leverantörer ≈
250–350 kr inkl. frakt — **verifiera mot faktisk leverantör innan skalning**).

**Kundflöde:** beställ → svara på orderbekräftelsen med fotot (vilken
mobilbild som helst) → digitalt utkast att godkänna → sys och skickas.
(Foto-uppladdning direkt på produktsidan kräver temaanpassning eller app —
medvetet bortvalt i v1, mejlflödet är standard i nischen.)

## 4. Juridik- och ärlighetsbeslut

- **Inga överstrukna jämförpriser:** prisinformationslagen kräver att
  jämförpris = lägsta pris senaste 30 dagarna. En ny butik har ingen
  prishistorik — låtsasreor är olagliga och dessutom fel för vinkeln.
- **Ångerrätt gäller inte** specialtillverkade varor (distansavtalslagen,
  undantaget för varor tillverkade enligt konsumentens anvisningar). Det
  sägs rakt ut på produktsidor och i leveranssidan — och kompenseras med
  garantitrappan: godkänn utkastet före sömnad → omsyning utan kostnad om
  kudden ändå blir fel. Reklamationsrätten enligt konsumentköplagen nämns.
- **Inga lånade recensioner eller påhittade siffror.** Butiken lanserar utan
  recensionsblock tills det finns riktiga köp.
- **Inga leveranslöften vi inte äger:** "8–12 arbetsdagar" (produktion +
  frakt), inte förlagans "2–3 dagar" (de syr i Chicago, vi dropshippar).

## 5. Bildspråket (differentieringens andra halva)

Alla bilder AI-genereras via Higgsfield — **noll bilder tas från förlagan.**
Stilguide: skandinaviskt hem, mjukt dagsljus, linne + ljus ek, dämpade varma
neutraler, redaktionell fotorealism, ingen text i bild. 10 bestämda motiv
(hero-soffa, närbilder hund/katt, "tvillingen" — djuret bredvid sin kudde,
barnkram, minnesmotiv med ljus, fotokudde, unboxing i kraftpapper, nyfiken
katt, sortimentsbild). Prompter + URL:er: `svensk-butik/bilder/`.

## 6. Modellpolicy följd

All slutgiltig svensk copy (produktsidor, sidor, annonshooks, namn) är
skriven av sonnet-subagenter med copy-reglerna (`docs/copy-regler.md`) i
prompten, inkl. tre-frågorstestet redovisat per rad. Strategi, sortiment,
priser och struktur: huvudsessionen. Workflow-run: `wf_4e07ebfe-f50`.

---

*Resterande sektioner (research-sammanfattning, vald copy, bygglogg,
kvarstående manuella steg) fylls på nedan när workflowen levererat och
Shopify-bygget är gjort.*
