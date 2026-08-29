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

## 7. Research i korthet (fullständigt i `research/`)

- **Konkurrenten** kör permanent "40% OFF" med countdown, live-mockupwidget på
  produktsidan, "Handmade in USA" ×4, humor ("Roast Your Cat") och en mycket
  välskriven memorial-ton (konkreta sorgetriggers — tom matskål, koppel på
  kroken — aldrig "regnbågsbron"). Det vi behöll: sidstrukturen, remake-garantin,
  "any phone photo works", människogranskat utkast. Det vi vände på: rean,
  presenten-först, USA-skriket.
- **Juridik (verifierat mot lagtext, se `research/juridik-trust.md`):**
  ångerrättsundantaget är distansavtalslagen 2 kap. 11 § p. 3; informationen
  måste ges *innan* köp (2 kap. 2 §), annars förlängs ångerfristen upp till ett
  år (2 kap. 12 §) — därför står det på varje produktsida, i FAQ och i
  leveranssidan. Jämförpriser kräver 30-dagars prishistorik (prisinformations-
  lagen) — därför inga överstrukna priser.
- **Svensk marknad:** ingen etablerad svensk aktör äger formklippta
  husdjurskuddar med skandinavisk estetik; utländska aktörer skeppar hit med
  långa leveranstider och översättningssvenska. Luckan vi tar: äkta svenska +
  ärlighet + skandinaviskt bildspråk.

## 8. Bygglogg — vad som är GJORT i Shopify (2026-08-29)

| Sak | Status | ID |
|---|---|---|
| Tvillingkudden (599/799/1 099 kr, 3 storlekar, hero + närbild) | ✅ ACTIVE + publicerad | `gid://shopify/Product/8814684307593` |
| Minneskudden (599/799 kr, 2 storlekar, närbild) | ✅ ACTIVE + publicerad | `gid://shopify/Product/8814684733577` |
| Fotokudden (449/549 kr, 2 storlekar) | ⚠️ DRAFT — bild saknas (kreditbrist) | `gid://shopify/Product/8814684930185` |
| Kollektion "Alla kuddar" (alla 3, beskrivning + bild) | ✅ publicerad | `gid://shopify/Collection/326691651721` |
| Sidor: Om oss, Leverans och retur, Vanliga frågor | ✅ publicerade | `/pages/om-oss`, `/pages/leverans-och-retur`, `/pages/vanliga-fragor` |
| Huvudmeny (Hem, Alla kuddar, Tvillingkudden, Minneskudden, FAQ, Kontakt) | ✅ | main-menu |
| Sidfotsmeny (Om oss, Leverans, FAQ, Kontakt, Sök) | ✅ | footer |
| Frakt: egen Sverige-zon med **Fri frakt 0 kr** | ✅ | butiken var felkonfigurerad: "Domestic" var Norge i NOK och Sverige låg i International för 180 NOK — åtgärdat |
| Publicering till Webbshop + Shop-kanalen | ✅ | båda ACTIVE-produkterna + kollektionen |
| Moms inkl. i priser (`taxesIncluded`) | ✅ verifierat | — |

**Bilder:** hero-soffan (godkänd i QA) ligger som featured på Tvillingkudden och
kollektionen. Närbilden hade AI-artefakten "AMIUOEN" tryckt på kuddens sida —
retuscherad lokalt (maskerad + median-inpainting, verifierad i zoom-QA) och
uppladdad via staged upload till både Tvillingkudden (bild 2) och Minneskudden
(featured). Original + retusch + prompt-URL:er: `svensk-butik/bilder/`.

## 9. Kvarstående — kräver Axel eller mer krediter

1. **Higgsfield-krediter tog slut** (0,35 → 0,11; en bild kostar 0,12 med
   soul_2). 8 av 10 planerade bilder återstår, prompterna ligger färdiga i
   `bilder/bilder.json` + workflow-scriptet. Fyll på ~1 credit och kör om —
   prioritet: katt-fatolj, fotokudde (låser upp Fotokudden ur DRAFT), tvilling,
   barnkram, minne.
2. **Butiksnamnet** är fortfarande "My Store" — går inte att byta via API.
   Shopify admin → Settings → Store details → byt till **Hjärtkompis** (och
   verifiera ledig .se-domän innan något registreras; se `copy/namn-och-rubriker.md`
   för 4 alternativ till namn).
3. **Policyerna i kassan** (Refund/Shipping) gick inte att sätta via API:t
   (saknar `write_legal_policies`-scope). Färdiga texter att klistra in finns i
   `SHOPIFY-MANUELLT.md`. Innehållet finns redan publikt på Leverans-sidan, så
   inget är dolt för kunden — men kassan länkar tomma policyer tills detta görs.
4. **Betalningar:** Shopify Payments + Klarna måste aktiveras i admin innan
   lansering (copyn nämner Klarna och kort). Utan detta går det inte att checka ut.
5. **Tema/startsida:** live-temat är Horizon; ditt eget tema
   (matstrumpor-exporten) ligger opublicerat och rördes inte (API:t får inte
   skriva i publicerade teman, och att skriva blint i din enda export vore
   fel). Startsidans sektioner sätts i temaredigeraren: hero-bild
   (`bilder/hero-soffa.png`), rubrik *"En bit av din hund du får behålla."* +
   kollektionen. 10 minuter i Customize.
6. **Leverantör:** priserna antar COGS ≈ 250–350 kr för custom-formklippt kudde
   (CJ/AliExpress-klass). Verifiera mot faktisk leverantör innan första annonskrona.
7. **Lösenordsskyddet** ligger kvar tills du väljer att lansera.
