# Kalendrarna — adventlane.se → bäverbutiken.se (2026-09-16)

Axel lade ner Adventlane som egen butik och flyttade in sortimentet i general store:
*"Det här var en hemsida som jag byggde upp för jag trodde jag skulle orka ha igång denna
samtidigt som General Store. Men jag tänker att jag struntar i det … alla de här produkterna
kan du bara lägga upp på bäverbutiken. Och du får rippa one to one."*

**12 kalendrar på Adventlane, 9 importerade.** Bara Sverige (Axels ord: "på bäverbutiken").
Inga AI-bilder, inga nyskrivna texter — allt kommer från Adventlanes egna sidor.

**Norge (2026-09-18):** dinosauriekalendern ligger nu även i beverbutikken.no på begäran
("Dinosaur calendar is missing from beverbutikken.no") — 449 / 599 NOK, cogs 125,91 NOK
(MODELL: SE-landat 11,95 USD × 1,133, Kalenderkungen-arket har bara SWEDEN-rader).
Norsk copy i `copy-no.json` (Sonnet), skapad med `no.mjs dinosaurie --skarp`, bilden via SE:s CDN.
https://beverbutikken.no/products/dinosaur-adventskalender-24-dinosaurer
**Golfkalendern i NO (2026-09-29, Axel: "vi måste fixa golfkalendern till norska butiken"):** 619 / 809 NOK, cogs 181,14 NOK
(MODELL: 17,19 USD × 1,133 × 9,2989 — arket har bara SWEDEN-rader), norsk copy i `copy-no.json` (Sonnet, korrläst), skapad
med `no.mjs golf --skarp`, båda SE-bilderna via CDN:en. https://beverbutikken.no/products/golf-adventskalender-24-golftilbehor
⚠️ Garantiblocket: SE:s alla nio kalendrar (och taköverdraget) fick 2026-09-21 ett block "Ångerrätt – 14 dagars ångerrätt
enligt lag" i stället för GARANTI4 (30 dagars öppet köp) — odokumenterat, ingen session har loggat det. NO-kalendrarna
(dinosaurie, golf) har GARANTI4.no (30 dagers åpent kjøp). Axel avgör vilket som gäller; ändra inte NO förrän han sagt till.
Övriga sju kalendrar finns bara i SE. Fler till NO: skriv copyn till `copy-no.json`, lägg
`no: { pris, jamfor, usd, modell }` i `fakta.mjs`, kör `node temu/kalendrar/no.mjs <id> --skarp`.

| id | Titel i butiken | Pris | Inköp | Kvar |
|---|---|---|---|---|
| golf | Golf Adventskalender – 24 golftillbehör | 549 / 719 | 162,79 | 386 kr |
| pussel | Pussel Adventskalender – 24 Dagar med Pusselbitar | 449 / 599 | 137,88 | 311 kr |
| gor_din_egen | Gör Din Egen Adventskalender – 24 tomma askar att fylla | 449 / 599 | 151,14 | 298 kr |
| dinosaurie | Dinosaurie Adventskalender – 24 Dinosaurier | 399 / 529 | 113,16 | 286 kr |
| ishockey | Ishockey Adventskalender – 24 Luckor med Hockeyprylar | 399 / 529 | 113,92 | 285 kr |
| cocktail | Cocktail Adventskalender – 24 Cocktailflaskor i Akryl | 349 / 469 | 85,80 | 263 kr |
| ol | Öl-adventskalender – 24 Ölflaskor som Julgranspynt | 349 / 469 | 85,80 | 263 kr |
| whisky | Whisky Adventskalender – 24 Dekorflaskor | 349 / 469 | 91,86 | 257 kr |
| sprit | Sprit Adventskalender – 24 dekorflaskor | 349 / 469 | 92,43 | 257 kr |

Priserna är Axels egna från Adventlane, oförändrade. COGS ur Google-arket "Kalenderkungen",
kolumnen *Total tax exclusive* för SWEDEN vid Qty 1, × 9,4698.

Kollektion: **https://baverbutiken.se/collections/adventskalendrar** — de nio nya plus
racingbilarna och fiskedragen som redan låg i butiken. Elva kalendrar på ett ställe.

**Inte importerade:** racingbilar (Axels lista — låg dessutom redan i bäverbutiken),
smyckeskalendern och barnens smyckeskalender (Axels lista, "barn/flickkalendrarna").
Ark-raden *Scented candle calendar* finns offererad men byggdes aldrig på Adventlane
(frakten är 19,58 av 26,50 USD, offerten är märkt "over weight") — ingen sida att rippa.

## Var copyn låg
Adventlane-temat lägger INTE texten i `body_html` (den är 83–124 tecken lång) utan i egna
sektioner: `opf_problem`, `opf_losning`, `opf_funktioner`, `opf_lifestyle`, `opf_faq`,
`opf_garanti`. Sektions-id:na är `shopify-section-template--<siffror>__opf_<namn>` och ligger
i olika ordning på olika sidor — mappa på id, aldrig på position. `products.json` räcker alltså
inte; hela HTML-sidan måste hämtas.

## Fem rättningar mot källan
Rippen är ordagrann utom här, och varje ändring har ett skäl:

1. **whisky**: titeln sa "24 miniatyrflaskor". *Miniatyr* är på svenska Systembolagets egen
   varugrupp för 5 cl riktig sprit. Produktens egen kortText och systerprodukten sprit säger
   redan "dekorflaskor" — titeln följer nu dem. Axels alkoholregel går före ordagrannheten.
2. **ol**: "guldkapsyl på varje flaska" är inte sant — minst fem kapsyler är silverfärgade på
   leverantörsbilden. Ändrat till "kapsyl i guld- eller silverfärg".
3. **gor_din_egen**: "24 olika storlekar" stämmer inte. Leverantörens måttabell har 24 askar
   men bara **14 unika mått** (4×4×7 återkommer fem gånger). Min- och maxmåtten stämmer.
4. **Taggen "alkoholfritt"** är på svenska en dryckeskategori (alkoholfri öl, alkoholfritt vin).
   Fel signal för julgranspynt — bytt mot "utan alkohol" på alla fyra.
5. **ishockey**: alt-texten beskrev "en ask formad som en rink". Asken är rektangulär med ett
   rinkmotiv *tryckt* på framsidan.

## Två saker som inte följde med
Adventlanes garantisektion lovar **"Leveranstid: 5–10 arbetsdagar · Fri frakt till alla länder"**
och **"14 dagars ångerrätt"**. Hastighetslöften är förbjudna enligt CLAUDE.md, och Bäverbutiken
har 30 dagars öppet köp. Raderna är strukna tillsammans med FAQ-frågorna om leverans, frakt och
retur — Bäverbutikens eget garantiblock (`GARANTI4.sv`) står där i stället.

## Bilderna
13 originalbilder hämtade från Adventlanes CDN. Sju behövde städas, sex gick att rädda:

| Bild | Vad som togs bort |
|---|---|
| cocktail-1 | Amazons hjärt- och delaikon, "Click to see full view" |
| golf-1 | Amazons hjärt- och delaikon |
| golf-2 | vattenstämpel med en `1688.com`-adress |
| dinosaurie-1 | engelsk reklamtext "Fine gift box / Christmas vibe / Merry Christmas" |
| gor-din-egen-2 | kinesisk spec-tabell och reklamraderna 源头大厂、免费设计 |
| pussel-2 | engelsk spectext "Box : 28*26*5cm / Puzzle: 70*50cm" |
| **cocktail-2** | **utesluten** — se nedan |

`adventlane-cocktail-2.jpg` gick inte att rädda: firmavattenstämpeln 义乌市耀强工艺品有限公司
ligger i två band tvärs över både asken och flaskrutnätet (uppmätt x 55–643/y 255–302 och
x 570–1145/y 858–907). Varje beskärning som rymmer hela asken träffar det ena bandet och varje
beskärning som rymmer flaskorna träffar det andra. Ytorna bakom är mönstrat asktryck, inte
enfärgade, så övermålning är uteslutet. Kalendern går ut med sin andra galleribild.

**Produktens eget tryck står kvar** — "GOLF ADVENT CALENDAR", "ICE HOCKEY", "DINO THEMES", "3+",
"1008 TOTAL PIECES". Det är hur asken ser ut när kunden öppnar paketet; att måla bort det vore
att ljuga om varan. Bara lager som ligger *ovanpå* fotot beskärs.

Filerna döps om vid uppladdningen (`kalender-<id>-<n>.<ext>`). Annars hamnar `adventlane` i
bäverbutikens egen CDN-URL och i sidans HTML.

## ⚠️ Årtalet 2025
Tre askar är tryckta med förra årets årtal, synligt på produktbilden:
**"BEER ADVENT CALENDAR 2025"**, **"WHISKEY ADVENT CALENDAR 2025"**, **"CLASSIC BASE LIQUOR
ADVENT CALENDAR 2025"**. Det är samma bilder som legat på Adventlane. Årtalet är varken
beskuret eller dolt — kunden ska se vad hen får. Behöver Axels besked inför julhandeln 2026.

## Filerna
- `fakta.mjs` — priser, jämförpriser, COGS, SKU, offertrad, alkoholnoteringar
- `copy.json` — rippad och granskad copy för alla nio
- `bilder-<namn>.mjs` — ett städskript per bild, med koordinaterna och skälet i headern
- `skapa.mjs [--skarp] [id …]` — skapar produkten med bilder, beskrivning, cogs, publicering
- `kollektion.mjs [--skarp]` — samlar alla elva kalendrar i kollektionen

## Notion
Nio kort i **Product test center SE BÄVER**, namn `K <Kalender>`, Status `Products`,
Typ `Video - Pending Approval`. Alkoholkorten bär en engelsk ruta om att flaskorna är
julgranspynt utan dryck, och de tre 2025-askarna en ruta om årtalet.

## Recensionerna på golfkalendern (2026-09-29)
Axel: "Recensionerna då" efter att NO-sidan skapats. SE-sidan har **8 Judge.me-recensioner, alla 5/5**, men Judge.me:s
egen data visar att alla åtta skapades **inom nio sekunder 2026-09-24 kl 00:23 UTC**, ingen är verifierat köp
(`verified_buyer: false`), ingen har brödtext, namnen är generiska (Lars Andersson, Anna Johansson …). Det är inte
kundrecensioner utan inlagda. **Inga sådana görs i NO** — CLAUDE.md: påhittade omdömen görs aldrig, och norsk
markedsføringslov/svensk MFL förbjuder falska omdömen. Judge.me:s "review request"-mejl till riktiga köpare är vägen.

## Golfkalenderns sida omgjord (2026-09-29/30)
Axel: *"Du har inte missat några gifs och så då? Det kändes legit som världens keffaste produktsida"* — och sedan
*"fixa ba golf kalendern tbh den är lowkey den ända som printar"*. Alla nio kalendrar hade 1–2 bilder och ingen GIF
(byggda 16/9, före GIF-regeln 24/9). Bara golf är omgjord; de andra åtta väntar (källbilder för dinosaurie och gör din egen
hittades på Amazon.de, se nedan).

- **Källor:** offertens Amazon-listning B0FRFP1JZ2 via **amazon.de** (amazon.com ger captcha, AliExpress/Temu är blockerade
  från molnet, Bing-bildsök fungerar) + B0FVSM4YZC (samma tillbehör, bilder i användning).
- **Galleriet (SE + NO, 6 bilder + GIF, ingen AI):** 01 asken med öppna luckor och alla tillbehör · 02 fyra tillbehör i bruk
  (2×2, rubrikband bortskuret, `golf/rutnat.mjs`) · 03 mått 30 × 28 × 6 cm (asken frilagd, cm-linjer ritade med sharp,
  `golf/matt.mjs`) · 04 julklappsbild · 05 klubbborste i bruk · 06 linjemarkör i bruk · GIF = bildspel med övertoning av de
  riktiga fotona. Filer: `<scratch>/advent/galleri/golf/`, plan: `galleri.json`, byggt med
  `node temu/kalendrar/galleri-bygg.mjs <se|no> --skarp golf`.
- **AI-video underkänd fyra gånger:** veo hittade på utdragna lådor och hål tre luckor breda i lucktråget och öppnade fel
  lucka. För kalendrar med numrerade luckor: **ingen AI-video av luckan som öppnas** — bildspel av riktiga foton i stället.
  En GIF utan AI får egen alt-text (`gif.ai: false` i planen) och ingen AI-rad.
- **Beskrivningen** byggdes om från live-HTML: problem → GIF → lösning → bild 02 → funktioner (utfallet i fetstil, orden
  kontrollerade mot live-texten, `bullets.json`) + specar → bild 03 → FAQ → garantiblocket orört.
- **Öppen fråga till Axel:** måttbilden säger 30 × 28 × 6 cm (leverantörens siffror, samma som specen). Askens proportioner
  på alla foton tyder på ~30 × 23–24 cm — höjden kan vara uppräknad. Bekräfta med CWD om det spelar roll.
- **Workflow-verktyg:** `bild.mjs` (hämta/ark/crop/kie-rensa/kie-bild/video/gif), `galleri-bygg.mjs`, `../sidkoll.mjs`.
- **De andra åtta: Axel 2026-09-30 "Strunta i dom"** — inget ändrat. Hittade källbilder om de ska göras senare
  (amazon.de/dp/<ASIN>): dinosaurie B0FST8F71J (9 bilder, samma ask), gör din egen B0DDXK8FNZ (7), whisky B0FYCK8SB5 (6),
  cocktail B0G1ZFJ23M (9). Pussel, ishockey, öl och sprit: inga källor hittade från molnet.

