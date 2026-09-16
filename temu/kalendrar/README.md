# Kalendrarna — adventlane.se → bäverbutiken.se (2026-09-16)

Axel lade ner Adventlane som egen butik och flyttade in sortimentet i general store:
*"Det här var en hemsida som jag byggde upp för jag trodde jag skulle orka ha igång denna
samtidigt som General Store. Men jag tänker att jag struntar i det … alla de här produkterna
kan du bara lägga upp på bäverbutiken. Och du får rippa one to one."*

**12 kalendrar på Adventlane, 9 importerade.** Bara Sverige (Axels ord: "på bäverbutiken").
Inga AI-bilder, inga nyskrivna texter — allt kommer från Adventlanes egna sidor.

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
