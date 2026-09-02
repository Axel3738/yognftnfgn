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

## 8d. Varv 6 (2026-08-29): leverantörsfakta, en storlek och VoC-copy

- **Leverantören bekräftad (Axels skärmdump):** fabriken gör **45 cm-enheter**,
  ~4 dagars produktion + 2–3 dagar transport till deras lager. Löftet
  8–12 arbetsdagar till kund håller därmed (4 + 2–3 + frakt till Sverige),
  men verifiera totala frakttiden mot första riktiga ordern.
- **Varianterna omgjorda:** 40/55/75 cm var påhittade storlekar — ersatta med
  **en variant: 45 cm, 599 kr** (SKU HK-45), den storlek fabriken faktiskt
  gör. Färre val är dessutom renare för one-product-testet. Fler storlekar
  läggs till först när leverantören bekräftat dem.
- **VoC-kundinsikter** (Axels PDF, Reddit-material) sparade i
  `research/kundinsikter-voc.md` och invävda i all copy via sonnet-subagent:
  generiskt-vs-sytt-konflikten, "den knasiga bilden", privata minnen,
  närhet på avstånd, används-varje-dag, kvalitetsoro mött med ärlighet,
  humor, hundar-tar-kuddar-själva.
- Temaloopen: v3 (färger + FAQ-sektion) publicerades av Axel → VoC-texterna
  för startsidan skrivs i **v4 (utkast)**.

## 8e. Varv 7 (2026-08-29): redigerarmanualen

Axels generiska editor-SOP ("How to Make Ads for a New Product", Beerverse)
granskades mot den här butikens verklighet — sex ändringspunkter godkändes och
implementerades i en ny självbetjäningsmanual för videoredigeraren:
`redigerare/tvillingkudden-ad-manual.html`, publicerad som Claude-artifact
(<https://claude.ai/code/artifact/84cc1400-5d01-48b2-be1c-5ff7031011a8>).

- **Låsta produktfakta** överst (45 cm, 599 kr, vit kant, order → foto →
  utkast → 8–12 arbetsdagar) + "Never in any ad"-listan: inga rabatter
  (prisinformationslagen), inga påhittade recensioner, inget "made in Sweden",
  inget snabb-leverans- eller retursnack.
- **Koncepten bytta:** Social Proof → **Recognition** (ingen social proof
  finns än), Clearance Sale → **Longing** (rabatter är olagliga för ny butik;
  smakregler: antyd aldrig att djuret dött). Demo och Gift kvar, Gift med
  köpar-avataren utskriven.
- **Tre inbäddade Claude-promptar** med fakta + förbjudslista + 5 VoC-insikter
  inbakade, så redigeraren inte behöver veta något själv.
- **ElevenLabs-röstguide:** svensk kvinna 30–45 — inte defaultrösten (man).
- **Assetpaketet:** 14 CDN-länkar till butikens bilder/GIF:ar, fasta svenska
  repliker i tabell (Swedish | English meaning), namnkonvention
  `Tvillingkudden – Concept – Hook N`, 12-videorutnät, leveranschecklista.
- **Två fält Axel måste fylla i i HTML-filen:** `[PASSWORD HERE]`
  (butikslösenordet) och `[LINK HERE]` (ElevenLabs-SOP:en).

Notion-raden i Product test center SE BÄVER (`3cb270ab…`) uppdaterad:
Instructions pekar på nya artifacten och **Typ ändrad
"Video - Pending Approval" → "Guideline"** så raden inte räknas som en
Bäver-annons i mätningen.

## 8f. Varv 8 (2026-08-30): varumärket blir TWINPILLOW

Axel valde **Twinpillow** som varumärke (kandidater på vägen: "din vän på
kudde", Tvillingkudden som brand, TwinPet). Avgörandet: varumärket ska funka
i alla länder på en och samma sajt, och rymma framtida kuddar med människor —
det klarar inte ett pet-namn. Domänkollen (DNS, 2026-08-30): hela
twinpillow-familjen ledig **inklusive .com**; twinpet.com var upptagen av en
djuraffär i Wales. Namnsystemet: brand Twinpillow överallt, produktnamnet är
den lokala översättningen per marknad — Tvillingkudden (SE), Tvillingpuden
(DK), Tvillingputen (NO). Känd svaghet: "twin pillow" är en sängstorlek på
engelska → sökbrus i US/UK, irrelevant i Norden.

Genomfört i repot: SHOPIFY-MANUELLT.md (butiksnamn + domänköp),
namn-och-rubriker.md (beslutet loggat, kandidaterna arkiverade),
redigerarmanualen ombrandad + ompublicerad. Genomfört i Shopify 2026-08-30
(efter att Axel köpt twinpillow.se + .com och kopplat om connectorn):
vendor → Twinpillow på alla tre produkterna, Om oss-sidan omskriven,
Minneskuddens beskrivning ("Twinpillows minneskudde"), temautkastet döpt om
till "Twinpillow v4 (utkast)". Live-temat v3 behåller sitt gamla namn
(API:t rör inte MAIN; namnet försvinner när v4 publiceras).
Butiksnamnfältet ("My Store") återstår — bara Axel kommer åt det.

## 8g. Varv 9 (2026-08-30): nordisk positionering

Axels beslut: positionera Twinpillow som **svenskt varumärke som levererar
till hela Norden**, tydligt på hemsidan (särskilt startsidan). Regeln som
styrde genomförandet: flaggorna får bara visas om kassan faktiskt tar emot
länderna — annars är det ett falskt löfte av precis den sort varumärket
lovar att aldrig ge.

- **Frakt:** ny zon "Norden" (NO, DK, FI, IS) med fri frakt i
  leveransprofilen, bredvid Sverige-zonen. Samtidigt raderades två trasiga
  rester från butiksmallen: "Domestic" som i själva verket var **Norge** i
  NOK (75/0 kr + Ekspress 99 NOK) och "International" (USA, Japan m.fl. för
  180 NOK). Butiken säljer nu till exakt Norden, inget annat.
- **Tema v4:** ny sektion `norden_flaggor` direkt under USP-raden —
  "Svenskt varumärke · Vi levererar till hela Norden" + alla fem nordiska
  flaggor som inline-SVG (emoji-flaggor visas som bokstäver på Windows).
  USP-raden, marqueen (+ "Svenskt varumärke"), trygghetstexten och
  produktsidans trustrad bytta från "Sverige" till "Norden".
- **Sidorna:** Leverans och retur + Vanliga frågor uppdaterade (fri frakt i
  hela Norden, ny FAQ-fråga "Skickar ni till hela Norden?"), inklusive den
  ärliga raden om att Norge/Island kan få lokal moms/hanteringsavgift vid
  införsel. Utkastprodukternas beskrivningar likaså.

**Justering samma dag (Axels beslut):** Island utgår helt — fraktzonen är
NO/DK/FI, flaggraden visar 4 flaggor, sidtexterna säger "Sverige, Norge,
Danmark och Finland". Moms/tull-raden om Norge togs bort från sajten på
Axels uttryckliga order ("norge får ingen moms"), och policytexterna i
SHOPIFY-MANUELLT rörs inte (de nämner fortfarande Island + avgiftsraden —
synka dem först när Axel säger till).

⚠️ **Kända begränsningar (medvetna, inte glömda):**
1. **Norge = tull ändå.** Norges momsfria 350-kronorsgräns försvann 2020;
   utan VOEC-registrering (eller leverantör som skickar med tull betald)
   momsas norska paket vid gränsen, oavsett vad sajten säger. Axel är
   informerad 2026-08-30. **Verifiera leverantörens Norge-flöde innan
   annonser körs i NO.**
2. **Valutan är SEK för alla.** Shopify Markets med DKK/NOK/EUR är nästa
   steg, inte gjort.
3. **Sajten är på svenska.** Funkar i SE, hyfsat i NO/DK, inte i FI —
   Markets + översättning enligt expansionsplanen i varv 8-diskussionen.

## 8h. Varv 10 (2026-08-30): popup-rensning + två lögner ur mallen

Axels beställning: bort med skrapkorts-popupen, mejlprenumerationen och den
egna cookie-bannern. Gjort i tema v4 (`footer-group.json`): sektionerna
`ms_cookies` och `ms_skrapkort` borttagna, footerns `newsletter_enable` →
false (och `enable_follow_on_shop` → false). Cookie-bannern är ok att ta
bort just nu eftersom `ms-head.liquid` är verifierat fritt från
spårningspixlar — **när Meta-pixeln installeras måste samtycke lösas igen**
(Shopifys inbyggda Customer Privacy räcker), annars spåras EU-besökare utan
samtycke.

I samma städning hittades och fixades två ärvda mallfel som aldrig fått gå
live (`header-group.json` + footern):
1. Annonsbaren lovade **"30 dagars öppet köp"** — direkt falskt för
   specialtillverkade varor utan ångerrätt. Ersatt med "Du godkänner
   utkastet innan vi syr" / "Omsys utan kostnad om den blir fel", och
   "hela Sverige" → "hela Norden".
2. Footern angav **Matstrumpor.se + kundsupport@matstrumpor.se** som
   avsändare. Nu: "Twinpillow drivs av STONEBITE ECOM AB, org.nr
   559576-2401" + länkar till Om oss/Kontakt. **Mejladressen är medvetet
   borttagen** tills Axel sagt vilken Twinpillow-adress som gäller (två är
   på väg: en för .se, en för .com).

## 8i. Varv 11 (2026-08-30): bundle + bildfält på produktsidan

Axels beställning: enkel bundle (inte "generisk kaching"), enkel bilduppladdning
eller extremt tydliga instruktioner (äldre köpare), stor text. Under arbetet
publicerade Axel v4 → allt nedan ligger i **"Twinpillow v5 (utkast)"**
(`156602990729`), duplicerat från v4.

- **Bundlen** använder temats eget ärliga paketsystem (`ms-paket`, visar
  rabattpris bara om rabattkoden finns på riktigt). Skapat i butiken:
  metaobjekt-definitionen `ms_paketniva` (fanns inte — följer inte med
  temaexporter) + två nivåer: "1 kudde" 599 kr (förvald) och "2 kuddar –
  en till dig, en att ge bort" **1 098 kr** (549 kr/st, bricka utan
  skrikighet) via äkta rabattkod **TVILLING2** (−100 kr, min 2 st, bara
  Tvillingkudden). ⚠️ 1 098 kr är Claudes förslag — Axel bekräftar eller
  ändrar (`Innehåll → Metaobjekt → Paketnivå` + rabattkoden).
  Jämförelsen är mot gällande styckpris — ingen påhittad förr-pris-rea.
- **Bildfältet:** "SÅ FUNKAR DET" i tre stora steg + frivilligt filfält
  (`properties[Din bild]`, kopplat till produktformuläret via
  `form`-attributet) + lugnande rad om att bilden kan mejlas efteråt.
  Större brödtext på hela produktsidan (1.7rem).
- **Måste testas före lansering:** lägg i varukorgen MED en bifogad bild
  (AJAX-varukorgen + filfält), och ett testköp med 2-pack där TVILLING2
  dras av automatiskt i kassan.

## 8j. Varv 12 (2026-08-30): förbeställnings-CTA:n

Axels beställning: en visuellt stark CTA som tydligt är en förbeställning,
med text nära köpknappen och en optimerad knappetikett. Ligger i
**"Twinpillow v5 (utkast)"** (`156602990729`), v4 är MAIN.

**Grepp:** väntetiden görs till argumentet i stället för invändningen —
"Din kudde finns inte än. Vi syr den åt dig." Produkten *kan* inte finnas i
lager, och det är precis varför den blir kundens. Visuellt bärs kortet av
sömnaden: stygnrad som innerkant och de tre stegen uppträdda på en tråd
(`snippets/ms-preorder.liquid` + `.ms-pre*` i `ms-tema.css`).

- **Knappetiketten:** "Lägg i varukorgen" → **"Förbeställ min kudde"**.
  Första person och benämner köpet rätt. Ändrad i `snippets/buy-buttons.liquid`
  (inte i locales — en produkt i butiken; flytta till `locales/sv.json` om
  butiken någonsin får fler). Sticky-knappen har samma text.
- **Raden under knappen:** "Du betalar i dag. Vi syr först när du godkänt
  ditt utkast." — sista invändningen besvaras där tummen redan är.
- **Leveransfönstret** i kortet återanvänder `ms-delivery-estimate`, som
  räknar riktiga arbetsdagar i webbläsaren. Datumet är alltså sant.
- **Inga påhittade signaler:** ingen nedräknare, ingen lagerräknare, inga
  recensioner. Varje påstående i kortet går att belägga.
- **Förhandsvisning** (mobilvy av hela köprutan):
  <https://claude.ai/code/artifact/c8bb8fba-4196-4703-a48a-d5275ed24f1f>

## 8k. Varv 13 (2026-08-30): nedräkningen till sömnadsomgången

Axel ville ha en timer som startar om på ~12 timmar vid varje sidbesök, för
att rättfärdiga leveranstiden. **Den byggdes inte.** En tidsgräns som beror
på när besökaren råkade öppna sidan kan aldrig vara sann, och en påhittad
tidsgräns som ska pressa fram ett snabbt köp står på svarta listan i
marknadsföringslagen (bilaga I till direktiv 2005/29/EG, punkt 7) — förbjuden
oavsett effekt, och första sak en konkurrentanmälan tar.

**Byggt i stället:** nedräkning mot en *riktig* veckodeadline — samma sluttid
för alla besökare, **söndag 23.00 svensk tid**, satt av när ordrarna faktiskt
går till leverantören. Tickar i sekunder, står i timmar/minuter/sekunder
under det sista dygnet, och rullar automatiskt vidare till nästa vecka.
Färgen skärps när det verkligen är bråttom: bärnsten under 12 timmar kvar,
rött sista två timmarna. Samma emotionella beat, men det håller.

⚠️ **Förutsättning som måste hållas sann:** texten lovar att beställningar
före deadline går i veckans omgång. Det gäller bara så länge ordrarna
faktiskt skickas till leverantören en gång i veckan vid den tidpunkten.
Ändras rutinen ska `stang_veckodag`/`stang_timme` i
`snippets/ms-preorder.liquid` ändras samma dag.

Förhandsvisningen (med levande timer):
<https://claude.ai/code/artifact/c8bb8fba-4196-4703-a48a-d5275ed24f1f>

## 8l. Varv 14 (2026-08-30): köprutan omstuvad efter beslutsordningen

Axel: optimera hela köprutan efter hur beslutet faktiskt fattas, och behåll
timern som urgency-trigger. Ligger i **"Twinpillow v6 (utkast)"**
(`156622094473`) — v5 publicerades av Axel under arbetet.

**Ordningen är nu besökarens frågeordning.** Rutan svarar på en fråga i
taget; byter man ordning tvingas hon hålla en obesvarad fråga i huvudet
medan hon läser nästa, och det är där folk lämnar.

| # | Frågan i huvudet | Vad som svarar |
|---|---|---|
| 1 | Vad är det här? | förbeställningskortet |
| 2 | Hur går det till? | tråden med tre steg |
| 3 | När får jag den? | leveransdatumet |
| 4 | Vad kostar det? | paketvalet |
| 5 | Vad ska jag göra? | bildfältet |
| 6 | Varför just nu? | nedräkningen |
| 7 | Vågar jag? | raden under knappen |

**Tre konkreta ändringar:**
1. **Nedräkningen flyttad ned**, från mitten av kortet till direkt ovanför
   knappen. Brådska högt upp på sidan läses som en reklamruta och scrollas
   förbi; i beslutsögonblicket är den det sista hon ser innan hon trycker.
2. **En förklaring i stället för två.** Tråden och den numrerade "så funkar
   det"-listan sa samma sak och konkurrerade. Listan är borta; steg 1 i
   tråden rymmer nu bilden ("Du beställer / och skickar din bild").
3. **Bildfältet av med sin ram.** Fyra inramade lådor på rad gjorde att allt
   vägde lika mycket. Nu finns tre ramar — kortet, paketvalet, nedräkningen —
   och en enda sak som väger tyngst: knappen.

CSS:en för hela köprutan bröts ut ur `ms-tema.css` till egen
`assets/ms-preorder.css`, laddad av snippeten. Köprutan går nu att justera
utan att hela basanpassningen skickas upp igen.

Förhandsvisningen (uppdaterad):
<https://claude.ai/code/artifact/c8bb8fba-4196-4703-a48a-d5275ed24f1f>

## 8m. Varv 15 (2026-08-30): två klockor, båda riktiga

Axel: timern såg inte brådskande ut, och han ville ha en dygnsklocka vid
sidan av veckoklockan — båda med sekundvisare. Ligger i **"Twinpillow v7
(utkast)"** (`156622389385`); v6 publicerades under arbetet.

**Varför den inte såg brådskande ut:** en siffra i löptext läses som
information, inte som en klocka. Nu är det siffertavlor — mörka rutor med
tim/min/sek under, blinkande kolon en gång i sekunden, och sekunderna som
faktiskt rör sig. Det är den enda rörelsen i köprutan, därför märks den.

**Två deadlines, ingen påhittad:**
1. **Dygnsklockan → midnatt svensk tid.** "Beställ före midnatt så ligger
   ditt utkast i mejlen i morgon." Nollställs varje natt av kalendern, inte
   av besöket — samma sluttid för alla. Visar HH:MM:SS dygnet runt, vilket
   också är det som ger den ständiga brådskekänslan Axel var ute efter.
2. **Veckoraden → söndag 23.00.** Sömnadsomgången, nu också med sekunder.

Färgen skärps när det faktiskt är bråttom: bärnsten sista tre timmarna före
midnatt, rött sista timmen.

⚠️ **Två förutsättningar som måste hållas sanna** — annars ska respektive rad
bort samma dag:
1. **Utkast dagen efter beställning** (dygnsklockan). Det är vårt eget
   arbete, så det är Axels att hålla — men det måste faktiskt hållas.
2. **Ordrar till leverantören en gång i veckan** vid angiven tid (veckoraden).

Byggd så att den aldrig kan bli en per-besökare-timer: båda räknar mot
kalendertidpunkter i `Europe/Stockholm`, oavsett besökarens tidszon.

Förhandsvisningen (levande klockor):
<https://claude.ai/code/artifact/c8bb8fba-4196-4703-a48a-d5275ed24f1f>

## 8n. Varv 16 (2026-08-30): batchklockan

Axel förtydligade: **en** klocka, till veckans batch, som räknar ner med
sekunder — och under den ska det synas att den som missar får vänta en hel
vecka extra i tillverkningstid. Dygnsklockan (utkast i natt) från varv 15 är
borttagen; den var Claudes tolkning, inte beställningen. Ligger i
**"Twinpillow v8 (utkast)"** (`156622553225`); v7 publicerades under arbetet.

**Så ser den ut nu:**
- **Fyra siffertavlor** — dagar : timmar : minuter : sekunder — så sekunderna
  alltid syns röra sig, oavsett om det är sex dagar eller sex minuter kvar.
  Blinkande kolon en gång i sekunden. Det är den enda rörelsen i köprutan.
- **Mätare under klockan** som visar hur mycket av veckans omgång som är
  kvar. Den gör veckan konkret: fönstret krymper synligt i stället för att
  bara räknas ned.
- **Konsekvensen utskriven** i en egen varningsruta: *"Beställer du efter det
  hamnar din kudde i nästa veckas omgång — en hel vecka extra att vänta."*
  Det är den som gör klockan värd att titta på; utan den är en nedräkning
  bara en siffra som rör sig.
- Färgen skärps sista dygnet (bärnsten) och sista tre timmarna (rött) —
  tavlorna och mätaren byter färg tillsammans.

Deadlinen är fortfarande söndag 23.00 svensk tid, samma sluttid för alla
besökare, nollställd av kalendern och aldrig av besöket.

⚠️ **Förutsättningen som måste hållas sann:** löftet om en vecka extra
gäller bara så länge ordrarna faktiskt går till leverantören en gång i
veckan vid den tiden. Ändras rutinen ska `stang_veckodag`/`stang_timme` i
`snippets/ms-preorder.liquid` ändras samma dag.

Förhandsvisningen:
<https://claude.ai/code/artifact/c8bb8fba-4196-4703-a48a-d5275ed24f1f>

## 8o. Varv 17 (2026-08-30): konsekvensen — vinsten mot förlusten

Två omtag efter Axels synpunkter. Slutversionen ligger i **"Twinpillow v8
(utkast)"** (`156622553225`):

> **BESTÄLLER DU NU** — vi börjar med din kudde *så fort klockan går ut* —
> den går med i veckans sömnad
> **MISSAR DU KLOCKAN** — då syr vi den först *måndag 8 september* —
> en hel vecka extra att vänta.

- Ett datum på den positiva raden fick även det bra alternativet att låta
  segt — det byttes mot vad klockan faktiskt ger henne.
- Mellanversionen "inom 24 timmar" ströks: den hade varit ett löfte till om
  vår egen svarstid, som måste hållas varje dag. Nu säger båda raderna bara
  vad klockan innebär, vilket är sant utan extra åtaganden.
- Datumet står kvar där det biter, på förlustraden. "En vecka extra" är en
  abstraktion; ett datum går att se framför sig.

**Datumet uppdateras av sig självt.** Det räknas om varje sekund i
webbläsaren ur samma deadline som klockan (sömnaden startar dagen efter att
omgången stängt, missad omgång = sju dagar till), i svensk tid oavsett var
besökaren sitter. När en omgång passerat rullar både klockan och datumet
vidare till nästa — ingenting behöver ändras för hand. Utan JavaScript står
"veckan därpå", vilket är sant men mindre skarpt.

⚠️ **Förutsättningen:** ordrarna går till leverantören en gång i veckan vid
angiven tid och sömnaden startar dagen efter. Ändras rutinen ska
`stang_veckodag`/`stang_timme` i `snippets/ms-preorder.liquid` ändras samma
dag.

Förhandsvisningen:
<https://claude.ai/code/artifact/c8bb8fba-4196-4703-a48a-d5275ed24f1f>

## 8p. Varv 18 (2026-08-31): testläge för klockan

Axel behövde kunna visa hela nedräkningsförloppet för vänner och familj utan
att vänta en vecka. Tre vägar dit, alla utan att en enda siffra på riktig
sida blir påhittad:

1. **Eget testtema:** *"TESTKLOCKA 7 min – publicera aldrig"*
   (`156623044745`), duplicerat från v9. Klockan står på 7 minuter direkt när
   sidan öppnas, med en testremsa i rutan. Skillnaden mot v9 är en enda rad
   i `templates/product.json` — inget i den delade snippeten. **Publiceras
   aldrig.** Delas som temaförhandsvisning från Themes → ⋯ → Preview.
2. **Adressparameter i det riktiga temat:** `?testklocka=420` på
   produktsidan kortar klockan till 420 sekunder och visar testremsan. Utan
   parametern finns läget inte, så kunder kan aldrig råka hamna i det.
3. **Förhandsvisningen** (artifact): knappar för 7 minuter, 20 sekunder och
   10 timmar (gula fasen) plus "Riktig klocka".

Klockan i det publicerade temat står kvar på **en omgång i veckan, söndag
23.00**. `stang_veckodagar` tar numera flera dagar kommaseparerat (`'0,3'` =
söndag och onsdag) — fler omgångar i verkligheten är enda ärliga sättet att
korta ner klockan, och koden är förberedd för det.

Publicerat av Axel som **Twinpillow v9**.

## 8q. Varv 19 (2026-08-31): sakfel rättat + Longing omskriven

Axel läste redigerarnas manusutkast och rättade två saker.

**1. Produkten har INGEN vit tygkant.** Kudden är skuren i djurets kontur,
tygbitarna sys ihop och vänds ut och in, så sömmen hamnar på insidan. Ingen
synlig kant, ingen brodyr. Antagandet kom från Temu-listningarna i varv 3 och
hade hunnit spridas överallt. Rättat i:
- produktbeskrivningen (live, `Funktioner`-punkten)
- startsidans berättelsetext (tema-utkast **v10**, `156629467273`)
- redigerarmanualen (sex ställen: låsta fakta, konceptbeskrivning, alla tre
  Claude-prompterna, assettabellen, specen och checklistan)
- manusdokumentet till redigerarna
- `bilder/bilder.json` (rättelsenot högst upp)

⚠️ **De 11 AI-bilderna visar alla den gamla konstruktionen med vit kant.**
De ligger kvar på produktsidan och startsidan och visar därmed en produkt som
inte finns. De måste genereras om innan butiken lanseras — receptet i
`bilder.json` ska aldrig mer innehålla *white fabric margin*.

**2. Longing är omskriven till en enda historia:** dottern som flyttat
hemifrån för att plugga och saknar familjens hund; köparen är föräldern. Det
är den vinkel som bär bäst hos den amerikanska förlagan, och Sverige är fullt
av studenter i korridorsrum. Manualen säger uttryckligen att vinkeln inte får
breddas till "alla som bor ifrån sitt husdjur".

**3. Leveranstiden är borttagen ur Recognition-manuset** på Axels order.

Nytt manusdokument: `redigerare/tvillingkudden-manus.docx`.

## 8r. Varv 20 (2026-08-31): annonscopy för alla fyra koncept

Meta feed ad copy (PRIMÄRTEXT × 3 varianter, RUBRIK, BESKRIVNING) skriven av
sonnet-subagent enligt regel 6, med de rättade fakta från varv 19 (ingen vit
kant, Longing = studentvinkeln, ingen leveranstid i Recognition) och
copy-reglernas tre-frågorstest kört på varje primärtext-variant.

- Leveransfil: `copy/tvillingkudden-annonscopy.docx` (ren, klistra-in-klar).
- Fullt facit med tre-frågorstestet: `copy/annonscopy-live.md`.

## 9. Kvarstående — kräver Axel

1. **Publicera temat:** Online Store → Themes →
   "theme-export-matstrumpor-se-matstrumpor-cro-v5" → Publish. Allt innehåll
   är redan omskrivet till Hjärtkompis. (Ett klick — API:t får inte.)
2. **Butiksnamnet** är fortfarande "My Store" — går inte att byta via API.
   Settings → Store details → byt till **Twinpillow** (beslut 2026-08-30,
   se varv 8). Köp **twinpillow.se + twinpillow.com** först.
3. **Policyerna i kassan** (Refund/Shipping) — API-token saknar
   `write_legal_policies`. Klistra-in-färdiga texter i `SHOPIFY-MANUELLT.md`.
   Innehållet finns redan publikt på Leverans-sidan.
4. **Betalningar:** Shopify Payments + Klarna aktiveras i admin före lansering.
5. **Leverantör:** priserna antar COGS ≈ 250–350 kr för custom-formklippt kudde.
   Verifiera mot faktisk leverantör innan första annonskrona.
6. **Lösenordsskyddet** ligger kvar tills du väljer att lansera.
7. **Redigerarmanualen:** fyll i `[PASSWORD HERE]` (butikslösenordet) och
   `[LINK HERE]` (ElevenLabs-SOP:en) i
   `redigerare/tvillingkudden-ad-manual.html`, be Claude publicera om
   artifacten, och **dela artifacten** via share-menyn — den är privat tills
   du delar den, så redigeraren kan inte öppna länken innan dess.
