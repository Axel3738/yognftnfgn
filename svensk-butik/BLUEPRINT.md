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

Alla bilder AI-genereras — **noll bilder tas från förlagan.** Stilguide:
skandinaviskt hem, mjukt dagsljus, linne + ljus ek, dämpade varma neutraler,
redaktionell fotorealism, ingen text i bild.

**Modellbeslut (2026-08-29, andra varvet):** första försöket med Higgsfield
soul_2 underkändes av Axel — kuddarna såg ut som riktiga djur, inte som
produkten. Ersatt med **nano-banana-2 via kie.ai** (`KIE_API_KEY` i env,
`POST /api/v1/jobs/createTask`, polla `recordInfo`). Nyckeln till att bilden
läser som produkt är promptreceptet: *"die-cut shaped plush pillow …
photorealistic printed image on its front face … clearly a PILLOW, not a
real animal: visible fabric texture and slight print flatness, a thick white
fabric side gusset running around the entire edge, plump stuffed body,
rounded seams"* + uppställd/proppad pose. 11 godkända bilder (produktstudio
hund/katt, hero, soffa, fåtölj, tvilling, barnkram, minne, fotokudde,
unboxing, sortiment). Manifest med prompter/CDN-URL:er: `bilder/bilder.json`;
helperscript: kie.py i scratchpad, dokumenterat i manifestet.

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

**Bilder (andra varvet, 2026-08-29):** hela bildsetet utbytt mot 11
nano-banana-2-bilder efter Axels underkännande av Higgsfield-setet.
Tvillingkudden: 6 bilder (soffa featured, studio hund/katt, tvilling,
sortiment, barnkram). Minneskudden: minne (featured) + unboxing. Fotokudden:
fotokudde — och produkten sattes ACTIVE. Kollektionsbild: sortiment. Alla
ligger även som butiksfiler (`hjartkompis-*.png`) för temat.

**Tema (2026-08-29):** Axels opublicerade matstrumpor-CRO-tema är omskrivet
till Hjärtkompis via `themeFilesUpsert` — tre filer: `templates/index.json`
(hero med hero-wide-bilden, USP-rad, marquee, featured Tvillingkudden,
sortiment, galleri, trygghet, FAQ, garantiblock — matstrumpor-recensionerna
och "Köp 1 – Få 1"-paketet borttagna, AI-bildmärkningen behållen),
`templates/product.json` (trustrad, leveransestimat 8–12 dagar, kudd-FAQ) och
`config/settings_data.json` (lugn typografi i stället för Mochiy Pop,
terrakotta #B26E4B i stället för sushi-orange, matstrumpor-logga och sociala
länkar rensade). Kopior i `svensk-butik/tema/`. Verifierat: `ms-head`
innehåller INGEN tracking (bara CSS + A/B-skript), så ingen
matstrumpor-pixel följer med. Originalet finns kvar på matstrumpor.se.
**API:t kan inte publicera teman — publiceringen är ett klick för Axel.**

## 8b. Varv 3 (2026-08-29): Temu-referensen

Axel pekade på två Temu-listningar av samma produkt — i praktiken
leverantörens egna produktbilder. Lärdomar som byggts in:

- **Produktens verkliga konstruktion:** generös **vit tygkant** runt det
  tryckta djuret (inte tight silhuettklippning), plysch i **stickat
  polyestertyg**, **helsydd utan dragkedja**. Copyn på alla tre produkter är
  rättad ("sammet" → plysch; "exakt silhuett" → kontur med vit kant) — utkastet
  kunden godkänner ska stämma med det som levereras.
- **Två nya säljmotiv** lånade som *idé* (aldrig som bildfil): **kuddväggen**
  (sju olika djur i en soffa — säljer "vilken bild som helst funkar") och
  **före/efter** (mobilfoto → färdig kudde — förklarar produkten på en sekund).
- 4 nya bilder genererade (kuddvagg, hund-porträtt, katt-porträtt,
  före/efter). Tvillingkuddens galleri leds nu av före/efter → hundporträtt →
  kuddvägg; kollektionsbilden är kuddväggen. Temus bilder användes **inte**
  som generator-input — de innehåller andras husdjur och går inte att äga;
  motiven är textpromptade från analys av konstruktionen.

## 8c. Varv 4 (2026-08-29): one product store + UGC-bildreceptet

Axels beslut: butiken är för "mellanmjölkig" med tre produkter — **one product
store** för det generiska Sverige-testet. Vinklarna (saknad, gullig kudde,
present) körs i **annonserna**, inte som egna produktsidor. Landing pages per
vinkel kommer senare, när testet visat något.

Genomfört:
- **Tvillingkudden är enda produkten.** Ny titel: *"Tvillingkudden – din bästa
  vän, en kram du får behålla"* och ny öppning på produktsidan
  (dörr-ögonblicket — svensk version av konkurrentens "best friend"-vinkel som
  Axel pekade ut, skriven av sonnet-subagent, tre-frågorstestet kört).
  Minneskudden + Fotokudden ligger kvar som UTKAST för senare vinkel-evolution.
  Menyn: Hem / Tvillingkudden / Vanliga frågor / Kontakt.
- **UGC/iPhone-bildreceptet** (research + 6 godkända bilder på första försöket):
  amatörfoto-triggerord (candid, handheld, awkward framing, uneven indoor
  lighting, lived-in home) + produktspec + kravet att kuddens tryck matchar det
  riktiga djuret i bilden. Fullt recept i `bilder/bilder.json`. Motiven:
  eldstad, soffa-katt, selfie, mormor (present), valp, shiba-som-nosar.
  Produktgalleriet är nu UGC-först (före/efter → eldstad → porträtt → nosar →
  selfie → kuddvägg …); de polerade studiobilderna är borttagna.
- **Temat publicerades av Axel under arbetet** — Hjärtkompis-temat är LIVE.
  Baksidan: API:t får inte längre skriva i det (spärr mot livetema). Den
  färdiga one-product-startsidan (sortiment-sektionen borttagen, CTA:er till
  produktsidan, UGC-galleri, rättad berättelse-text) ligger i
  `tema/index.json` och väntar — se SHOPIFY-MANUELLT steg 0b.

## 9. Kvarstående — kräver Axel

1. **Publicera temat:** Online Store → Themes →
   "theme-export-matstrumpor-se-matstrumpor-cro-v5" → Publish. Allt innehåll
   är redan omskrivet till Hjärtkompis. (Ett klick — API:t får inte.)
2. **Butiksnamnet** är fortfarande "My Store" — går inte att byta via API.
   Settings → Store details → byt till **Hjärtkompis** (verifiera ledig
   .se-domän; 4 alternativ i `copy/namn-och-rubriker.md`).
3. **Policyerna i kassan** (Refund/Shipping) — API-token saknar
   `write_legal_policies`. Klistra-in-färdiga texter i `SHOPIFY-MANUELLT.md`.
   Innehållet finns redan publikt på Leverans-sidan.
4. **Betalningar:** Shopify Payments + Klarna aktiveras i admin före lansering.
5. **Leverantör:** priserna antar COGS ≈ 250–350 kr för custom-formklippt kudde.
   Verifiera mot faktisk leverantör innan första annonskrona.
6. **Lösenordsskyddet** ligger kvar tills du väljer att lansera.
