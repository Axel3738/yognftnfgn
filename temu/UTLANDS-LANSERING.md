# Utlandslansering — komplett recept (NO/DK/FI/UK)

Självbärande instruktion. Kan klistras in i ett annat Claude-konto — allt som behövs
står här: regler, priser, SKU:er, bild-URL:er och steg. Skriven 2026-08-18 efter att
Norge och Danmark lanserats med exakt den här processen.

Svara Axel på svenska. Han är inte utvecklare. Kör klart — lämna aldrig över
halvfärdigt med "nu behöver du bara…".

---

## Butiksregistret

| Land | Butik | Valuta | Vendor | 🦫 i garantiblocket | Status |
|---|---|---|---|---|---|
| 🇸🇪 | bäverbutiken.se | SEK | Bäverbutiken | Ja | Huvudbutik, källan |
| 🇳🇴 | beverbutikken.no | NOK | Beverbutikken | Ja | ✅ Lanserad 2026-08-18 |
| 🇩🇰 | bæverbutiken.dk | DKK | Bæverbutiken | Ja | ✅ Lanserad 2026-08-18 (⚠️ dubbletter, se nedan) |
| 🇫🇮 | majavakauppa.fi | EUR | Majavakauppa | Ja (*majava* = bäver) | ✅ Lanserad 2026-08-18 |
| 🇬🇧 | beavershop.co.uk (BeaverShop) | GBP | BeaverShop | Ja | ✅ Lanserad 2026-08-18 |

## Hårda regler

0. **INVENTERA FÖRST — före första `create-product`.** Butiken kan redan ha produkterna
   från en tidigare session eller ett annat Claude-konto. Lista hela katalogen
   (`products(first: 50, sortKey: TITLE)`, sidbläddra till `hasNextPage: false`) och
   sök på SKU-mönstret (`productVariants(query: "sku:TEMU-*")`) **innan** något skapas.
   Skapa bara det som saknas. *(Danmark fick 25 dubbletter 2026-08-18 för att det här
   steget hoppades över — Axel: "don't do any duplicates, that just happened in Danish".)*
   Finns produkten redan: rör den inte utom för att laga defekter (se regel 12).
1. **`get-shop-info` FÖRST — före varje skrivning.** Verifiera namn + valuta. Fel butik
   eller fel valuta: STOPPA och säg till Axel. Blanda ALDRIG ihop butikerna.
2. **Butiksbyte:** `switch-shop` släpper nuvarande token; Axel måste själv koppla nästa
   butik i Shopify-connectorn (claude.ai → Connectors → Shopify). Be honom, vänta, kör
   `get-shop-info` när han säger klar.
3. **Sist av allt: be Axel koppla tillbaka bäverbutiken.se.** Annars pekar nästa session
   mot fel butik.
4. **Vendor = butikens eget varumärke.** Grillklinikken-butiker får aldrig "Bäverbutiken"
   som vendor och aldrig 🦫 i copyn.
5. **Varje variant:** `inventoryPolicy: CONTINUE` + `taxable: false` (sätts med
   `productVariantsBulkUpdate` EFTER `create-product` — kan inte sättas vid skapandet).
5b. **`templateSuffix: "claudeprodukter"` på VARJE produkt** — även i utlandsbutikerna.
   `create-product` kan inte sätta det; kör `productUpdate` direkt efteråt. Missades i
   hela DK-omgången 2026-08-18 (Axel upptäckte det). Kontrollera med
   `products(first:50){edges{node{templateSuffix}}}` — `null` = fel mall renderas.

5c. **Städa dubbletter så här när skadan redan skett.** Regeln Axel gav 2026-08-18:
   **behåll den med varianter — alltså den nyare, rikare versionen.** Titlarna skiljer
   sig ofta något mellan versionerna ("Ergonomiske Tøfler" vs "Ergonomiske Hjemmesko"),
   så para ihop på produkt, inte på exakt titel. Jämför alltid innehållet först: den
   gamla versionen bar tomma platshållarkommentarer, hastighetslöfte ("Hurtig levering")
   och pris utanför prismatrisen — den nya var korrekt på alla tre.
   **Arkivera (`status: ARCHIVED`), radera inte.** Arkivering tar bort produkten ur
   butiken men går att ångra; radering gör det inte, och väljer du fel tvilling är
   arbetet borta. Arkiverade produkter behåller sitt `handle` — ska den nya ha den rena
   URL:en måste du först döpa om den arkiverades handle.
6. **Publicera på ALLA butikens kanaler:** hämta `publications`, kör `publishablePublish`
   per produkt med alla publication-ID:n.
7. **Kategori:** taxonomi-GID:na är globala — använd exakt de som står i tabellen nedan,
   via `productUpdate(product: {id, category})`.
8. **Aldrig hastighetslöften.** "Smidig leverans" på landets språk: "smidig levering" (NO),
   "smidig levering" (DK), "sujuva toimitus" (FI), "smooth delivery" (UK). CWD-frakten är
   6–10 arbetsdagar (NO 8–10) — därför lovas ingen tid.
9. **Copy på landets språk, korrläst som infödd.** Samma 7-block som Sverige:
   (1) emotionellt problem utan produktnamn → (2) GIF → (3) lösningen → (4) bild →
   (5) Funktioner: 4–5 bullets med **utfallet i fetstil** – spec som bevis (och?-testet) →
   (6) ev. bild → (7) garanti: 30 dagars öppet köp, smidig leverans, Klarna (+🦫 endast
   bäver-butiker). Inga tomma HTML-kommentarer som platshållare — någonsin.
10. **Inga påhittade siffror.** Alla räkneord kommer ur tabellen nedan (de är verifierade
    mot CWD-offert och referensbilder).
11. **Verifiera efteråt:** hämta några produkter och kontrollera `featuredMedia` (bilderna
    kopieras asynkront till landets CDN — kolla att de landat), status ACTIVE och
    publikationsantal. Rapportera i två högar: Fixat / Förslag.
12. **Granska det som redan ligger i butiken, inte bara det du själv la in.** En tidigare
    session kan ha lämnat defekter. Sök efter dem så här — de går att hitta med API:et:
    - `products(query: "<hastighetsord på landets språk>")` — fulltextsök på beskrivningen.
      Hittade 12 produkter med "Nopea toimitus" i finska butiken 2026-08-18.
    - `variantsCount { count }` mot förväntat antal — **1 variant på en sko eller ett
      mobilskal betyder att kunden inte kan välja storlek/modell.** Laga med
      `productOptionUpdate` (döp om `Title`-optionen, lägg sedan till värdena i ett
      SEPARAT anrop — döpa om och lägga till i samma anrop failar tyst) och sätt därefter
      unika SKU:er, annars ärver alla nya varianter samma SKU.
    - `mediaCount { count }` = 1 och `<!-- GIF: … -->` i `descriptionHtml` — tomma
      platshållarkommentarer, ofta kvar på svenska mitt i landets copy.
13. **Produktnamn får inte krocka med etablerade varumärken.** "Boxbollen" är ett
    skyddat varumärke i Sverige (Axel 2026-08-21) — produkten döptes om till
    "Bollpannband" och ordet togs bort ur titel, copy och taggar. Innan ett
    produktnamn sätts: fundera på om namnet är en känd produkt/ett företag på
    marknaden, och välj i så fall ett beskrivande eget namn i stället. Gäller
    alla länder — kolla mot landets marknad, inte bara den svenska.
    - `products(query: "vendor:'<främmande vendor>'")` — utkast från en HELT annan butik
      kan ligga kvar. UK hade 14 svenska DRAFT-produkter från "Trevlig Trädgård"
      (Snigelfällan, Växtbelysning …). Arkivera dem (`status: ARCHIVED`) — arkiv går att
      ångra, radering gör det inte.
    - Kvarglömda landsnamn ur den svenska originalcopyn: UK:s magnetfiske sa
      "one of the fastest-growing hobbies in **Sweden**". Sök på "Sweden"/"Sverige".

    - **Externt hotlänkade bilder.** Läs `src` i varje `<img>`: allt som inte är
      `cdn.shopify.com` ägs inte av butiken. UK hade 117 av 122 produkter hotlänkade
      från `img.kwcdn.com` (Temus CDN) + 1 från `cdn.cloudfastin.top`. Alla svarade 200,
      så det syns inte som ett fel — men blockerar Temu hotlänkning släcks alla
      produktsidor samtidigt och tyst. Migrera med `fileCreate` (tar en publik URL som
      `originalSource`) och byt sedan `src`. Radera inget förrän den nya URL:en svarar 200.
    - **Absoluta löften i RUBRIKER, inte bara i brödtext.** Rättar du "you can always hear
      where the animal is" i stycket men lämnar `<h2>Hear where your animals are – at all
      times</h2>` ovanför, lovar sidan efter fixen MER än den gjorde innan. Sök på
      never/always/zero/no risk i HELA dokumentet, rubriker inkluderade.

    ⚠️ **Hämta aldrig `descriptionHtml` med `first: 100`.** Node dör på OOM och
    processen hänger tills den timeoutar — utan felmeddelande som pekar på orsaken.
    Använd `first: 25`. Vill du bara ha ett ANTAL: använd `productsCount(query: "…")`
    i stället, det kostar nästan ingenting. (Norge 2026-08-19.)

    ⚠️ Shopifys fulltextsök matchar ord för sig, inte frasen. En träff på "Fast delivery"
    kan vara "stick fast" + "Smooth delivery" i samma text. Hämta alltid `descriptionHtml`
    och läs innan du dömer — annars jagar du spöken.

    ⚠️ Låt en SEPARAT agent verifiera varje ändring mot den skarpa texten. I UK-omgången
    rapporterade lagningsagenterna "klart" på alla 21 — verifierarna bekräftade att alla
    21 stämde, men hittade samtidigt fyra ärvda mallfel som ingen bett om att leta efter.
    Den som lagar ser inte det den inte fick i uppdrag att se.

## Hitta samma produkt i en annan butik

Titelmatchning fungerar inte — finska och norska titlarna delar inga ord med de
svenska ("Fiskespöhållare" / "Fiskestangholder" / "Kalastusvapateline").

**Matcha pa SKU:ns tre sista siffror.** Katalogen anvander samma nummer i alla
butiker, bara kategoridelen skiljer:

```
SE  TEMU-601104615671651          (goods-id, avviker)
NO  BEVER-MARIN-049
DK  BAEVER-MARINE-049
FI  MAJAVA-MARINE-049
UK  BEAVER-MARINE-049
```

Numret finns i `market-expansion/uk/output/catalog.uk.json` via `sourceHandle`.
Verktyg: `temu/synka-priser.mjs`.

## Bildreglerna (Axel, 2026-08-20 — efter pingisskandalen)

Bakgrund: bordtennistränaren fick en DDG-sökträff som bild — en golvstående modell
från en ANNAN listning — medan copyn beskrev en bordsklämma. Bild och text motsade
varandra i fyra butiker. Dessa regler är obligatoriska för varje produkt:

1. **Endast produktens egna bilder.** Källa 1: galleriet på produktens Temu-sida —
   **Axel klistrar in bilderna direkt i chatten**; de går att plocka ut i full
   upplösning ur sessionens transkript (JSONL, `message.content[].type=="image"`,
   base64 i `source.data`). Källa 2: huvudbilden ur sidans HTML-skal
   (`img.kwcdn.com/product/fancy/…w/800` — hämtas med curl, är alltid produktens
   egen). **Bildsökningar (DDG m.fl.) är HELT förbjudna som produktbilder.**
   ⭐ **Temu-galleriets infografiker är guldstandarden** (Axel 2026-08-21:
   "de hade varit perfekta … dessa bilder ska du ta också från alla produkter") —
   de visar produkten i användning och bär verifierade mått/spec som copyn ska
   hämta sina räkneord ur. Be Axel klistra in dem för varje produkt.
   **Två vägar in (den här molnmiljön kan INTE själv nå galleriet — verifierat
   2026-08-21 med både curl och riktig Chromium; proxyn släpper inte igenom
   webbläsartrafik):**
   1. Axel håller in bilderna i mobilen och klistrar in dem i chatten (funkade
      för pingisen), eller
   2. Axel kör **Claude på sin egen dator** (Cowork/desktop-appen med
      Chrome-tillägget, eller Claude Code lokalt med webbläsarkoppling) — den
      styr HANS inloggade webbläsare, kan öppna Temu-länken som han själv och
      spara alla galleribilder. Bilderna klistras sedan in här, eller committas
      till repot av den lokala sessionen så plockar molnsessionen upp dem.
   **Texten på infografikerna görs om till marknadens språk** (Axel 2026-08-21) —
   engelska original får bara ligga kvar i UK-butiken. Metod: INTE AI-textbyte —
   kie.ai garblade svenskan ("UTDRABARLT NÄT", "PASSCHES TO ALLA BORD") och
   ritade dessutom om produkten (tre stolpar i stället för två). Gör som
   `pipeline/compose.mjs`: behåll riktiga fotot, täck textytorna (plana färgfält)
   och lägg språket som skarp vektortext med sharp. Färdigt exempel med alla
   fem språken: `temu/infografik/pingis.mjs` (originalen bredvid i
   `temu/infografik/pingis/`). Korrläs renderingen visuellt före uppladdning.
2. **Research är facit för copyn.** Läs Temu-sidans egen produktbeskrivning
   (`ra_beskrivning` ur `hamta.mjs`), sök lite om produkttypen, förstå vilket
   problem den löser — DÄRIFRÅN skrivs copyn. Bilderna kontrolleras sedan mot
   copyn: motsäger de varandra är det stopp tills det är utrett.
3. **Minst 2 olika bilder för en full produktsida — helst så många som möjligt**
   (fler bilder höjer konverteringsgraden). 1 bild = galleri endast, inga
   bildblock i beskrivningen, produkten flaggas "väntar på bilder".
   ⚠️ **SKÄRPNING (Axel 2026-08-21, efter offert 2-leveransen): 2 bilder är
   MINIMUM, inte klart.** En färdig produktsida har huvudbild + Temu-galleriets
   spec-/infografikbilder (översatta till marknadens språk med sharp-metoden)
   + AI-bilder (miljö och i-användning, 1:1). Sidorna läcker inte galleriet —
   **be Axel klistra in galleribilderna INNAN leveransen**, som ett steg i
   jobbet, inte som en fotnot efteråt. Axels dom när steget hoppades över:
   "bare minimum … kastjobbat".
3b. **Researchen ska svara på NÄR och VAR produkten används** — inte bara vilket
   problem den löser. Båtmotorskyddet sattes i sjön på AI-bilden, men produkten
   används vid VINTERFÖRVARING PÅ LAND (båten på trailer/bockar; skyddet håller
   väder ute och gör motorn ointressant för tjuvar — ingen kapell-täcker motorn
   i vattnet). Fel användningskontext = fel miljöbild, fel copy och fel vinkel,
   även när själva produkten är rätt återgiven.
4. **GIF:en ska visa produktens FUNKTION** — aldrig en inzoomad stillbild.
   Finns en video på Temu-sidan: ta videon (Axel kopierar videoadressen), lägg in
   den eller konvertera+komprimera till GIF. Finns ingen funktionsvisning: ingen GIF.
5. **Klarar produkten inte 1–4 laddas den INTE upp.** Den hamnar på väntelistan
   i leveransen i stället. Hellre tre kompletta än sex halva.
6. **Leverans per produkt:** när en produkt är klar skickas butikslänken till Axel
   direkt — han granskar och ger feedback per produkt. Ingen bulk-avrapportering
   av osedda sidor.

### AI-miljöbilder (kie.ai, Axels beslut 2026-08-21)

När produkten behöver en "i användning"-bild som Temu inte ger: generera den ur
produktens RIKTIGA bild med `node temu/ai-bild.mjs` (kie.ai nano-banana-edit,
nyckel i miljövariabeln `KIE_API_KEY`). Fyra hårda regler står i skriptets huvud —
kortversion: alltid edit av referensbilden (aldrig text-till-bild), granska
räkneorden visuellt (modellen räknar fel — piloten gav 7-8 bollar i stället för 6),
aldrig som huvudbild, undvik människor i närbild.

**Format och antal (Axel 2026-08-21):** AI-bilder genereras i **1:1**, aldrig 16:9
(skriptets default är nu 1:1). Gör gärna **flera** per produkt: en stilla miljöbild
plus en där produkten **används** — utan ansikten (beskär till ben/händer i
prompten), och personen ska matcha produkten (herrprodukt = herrkläder i bild).

⚠️ **AI-bilder får aldrig gissa produktegenskaper.** Piloten (pingis 2026-08-21)
underkändes av Axel: AI:n ritade ett kort nät fast det riktiga dras ut 1,7 m över
hela bordet — referensbilden (produkten hopfälld i låda) visade inte utsträckt
läge, så modellen hittade på det. Regeln: generera bara scener där referensbilden
visar produktens form i det läge scenen kräver. Finns en riktig infografik/
galleribild från Temu som visar samma sak går den ALLTID före en AI-bild.

## Prismetoden

### ⚠️ NY REGEL för alla NYA produkter (Axel 2026-08-21)

**Pris = 3 × (landad kostnad + 2,9 €) i EU-butikerna (SE/DK/FI). Norge och UK
har ingen 2,9 €-avgift → pris = 3 × landad kostnad, rakt av — märkbart lägre.**
Skatten ligger INUTI multiplikationen — det ger exakt 1,5 i break-even-ROAS.
⚠️ Först felräknat som "3 × kostnad, plus skatten utanför" vilket SÄNKTE priser
— Axel: "du ska höja dem". Landad kostnad tas ur offertbladets kolumn för
respektive land (kostnaderna skiljer per land!), konverteras till lokal valuta
och avrundas till landets prispunkter (9-slut / X,90 / X.99 — uppåt vid lika).
Faktormetoden nedan gäller bara den GAMLA katalogen.

*Tillämpad 2026-08-21 på offert 2-produkterna i SE (USD→SEK 9,6; 2,9 € ≈ 31,9 kr):
båtmotorskydd 579 · MC-kapell 349 · dörrlist 319 · kranskydd 309 · plyschtofflor 429.*

### Gamla katalogen: faktormetoden

Kostnadsbaserad per land — INTE valutakonvertering. CWD:s frakt skiljer per land
(tofflorna: SE $9,15 · NO $10,21 · DK $10,45 · FI $12,08 · UK $8,40 landad kostnad).
Ankarpriser satta av Axel 2026-08-18 på tofflorna: **349 NOK / 229 DKK / 29,90 € / £22,99**.
Det ger faktorer mot svenska priset som används på hela katalogen:

| Land | Faktor på SEK-priset | Avrundning |
|---|---|---|
| NO | ×1,13 | närmsta 9-slut (349, 789, 1029 …) |
| DK | ×0,74 | närmsta 9-slut (229, 519, 669 …) |
| FI | ×0,097 | närmsta X,90 (29,90, 67,90 …) |
| UK | ×0,074 | närmsta X.99 (22.99, 51.99 …) |

## Produkterna — allt som behövs per rad

Källa = svenska butiken. Bilderna ligger på `https://cdn.shopify.com/s/files/1/1013/0322/2621/files/`
(förkortas `CDN/` nedan) — de är publika och kan användas direkt som bild-URL i
`create-product`; Shopify kopierar dem till landets CDN. GIF:en läggs i beskrivningens
block 2, stillbilden i block 4. Titlar skrivs om på landets språk (norska och danska
versionerna finns redan live som facit i respektive butik).

**Varianter:** `EN` = en variant (`options: ['Title']`). Skor = `Storlek`-axel på landets
språk, ett pris för alla storlekar. SKU-mönstret är identiskt i alla butiker.

| # | Produkt (SE-titel) | SKU-bas | Varianter | Kategori-GID (`gid://shopify/TaxonomyCategory/…`) | GIF (block 2) | Bild (block 4 + galleri) | SE kr | NO kr | DK kr | FI € | UK £ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Tofflor Ergonomiska | TEMU-601100379316292-<strl>-<SO/HG> | 7 strl (36-37…48-49) × 2 färger (Svart/Orange, Vit/Grön) | aa-8-7 | CDN/temu-tofflor.gif | CDN/ce963fd939ae7017637863a3d0a0ec07.jpg + CDN/Namnlosdesign-2026-08-13T190843.822.png | 309 | 349 | 229 | 29,90 | 22.99 |
| 2 | Uteduschen | TEMU-601104547945861 | EN | sg-4-2 | CDN/temu-uteduschen.gif | CDN/01d1af10-a6a3-4693-8faf-efc4f5c3283b.jpg + CDN/01d1af10-…-e2edbc5014b1.jpg (extra, block 6) | 579 | 649 | 429 | 55,90 | 42.99 |
| 3 | Golfskoväska | TEMU-601099516487044 | EN | sg-4-7 | CDN/temu-golfskovaska.gif | CDN/b46d69054357183f5bb6199789be32f5.jpg | 309 | 349 | 229 | 29,90 | 22.99 |
| 4 | Magnetfiskesats 320lb | TEMU-601104677569375 | EN | sg-4-6 | CDN/temu-magnetfiskesats.gif | CDN/740baad3a413478fbd645c2618dec9e7-goods.jpg | 279 | 319 | 209 | 26,90 | 20.99 |
| 5 | Golfbollsplockare 80 cm | TEMU-601100286187971 | EN | sg-4-7 | CDN/temu-golfbollsplockare.gif | CDN/b05d773393119e15b8eab965e57dbd54_1741939977992.jpg | 309 | 349 | 229 | 29,90 | 22.99 |
| 6 | Fritidsskor Herr | TEMU-601102200064735 | EN | aa-8 | CDN/temu-fritidsskor.gif | CDN/b1d1d71d-c0b4-40d4-ad6d-a2a3c1d3cc73.jpg | 309 | 349 | 229 | 29,90 | 22.99 |
| 7 | Mobilskal Magnetiskt iPhone 12–17 | TEMU-601103799817572-<modell> | 18 modeller: 12/12P/12PM/13/13P/13PM/14/14P/14PM/15/15P/15PM/16/16E/16P/16PM/17/17A | el-4-8-4-2 | CDN/temu-mobilskal.gif | CDN/912694ed-892f-4142-b051-5b31980c0a2d.jpg | 219 | 249 | 159 | 20,90 | 15.99 |
| 8 | Surfplatteställ | TEMU-601102197280712 | EN | el-7-9-15-1-3 | CDN/temu-surfplattestall.gif | CDN/73c6e9cb-6221-4086-8e99-3c009a14c8ae.jpg | 279 | 319 | 209 | 26,90 | 20.99 |
| 9 | 14-i-1 Multiverktygshammare | TEMU-601101921250503 | EN | ha-15-38 | CDN/temu-multiverktygshammare.gif | CDN/3f2e2bf8-883d-41ef-87b9-47e26e53dc20.jpg | 349 | 399 | 259 | 33,90 | 25.99 |
| 10 | Gräsklippartäcke 600D | TEMU-605510862498229 | EN | hg-12-3-5 | CDN/temu-grasklippartacke.gif | CDN/5661b1e5a1d0413497069942ef7bf1ae-goods.jpg | 369 | 419 | 269 | 35,90 | 26.99 |
| 11 | Fiskespöhållare Båt 2-pack | TEMU-601099792244573 | EN | sg-4-6 | CDN/temu-fiskespohallare.gif | CDN/afa5554aaa164c7bbdbbb4264a12a532-goods.jpg | 269 | 299 | 199 | 25,90 | 19.99 |
| 12 | Hattgalge 8 kepsar | TEMU-605828169987760 | EN | fr-3-2-2 | CDN/temu-hattgalge.gif | CDN/d8dd15a8-ecc7-436d-9e8c-69d6daf2ada4.jpg | 179 | 199 | 129 | 16,90 | 12.99 |
| 13 | Övervakningskamera dubbellins PTZ | TEMU-601100938731214 | EN | co-2-5 | CDN/temu2-kamera.gif | CDN/temu2-kamera-1.webp + -2.webp + -3.webp (galleri; -1 block 4, -3 block 6) | 799 | 899 | 589 | 76,90 | 59.99 |
| 14 | Första Hjälpen-Kit 260 delar | TEMU-601099866212432 | EN | hb-1-8 | CDN/temu2-forstahjalpen.gif | CDN/temu2-forstahjalpen-1.webp | 309 | 349 | 229 | 29,90 | 22.99 |
| 15 | Stänkskärm MTB | TEMU-601100182464991 | EN | sg-4-4-2 | CDN/temu2-stankskarm.gif | CDN/temu2-stankskarm-1.webp + -2.webp + -3.webp (galleri; -1 block 4, -2 block 6) | 219 | 249 | 159 | 20,90 | 15.99 |
| 16 | Bollpannband — ⚠️ OMDÖPT + NY VINKEL 2026-08-21 (Axel): "Boxbollen" är ett skyddat varumärke i Sverige → ordet boxboll får inte finnas i titel/copy/taggar på någon marknad. Vinkeln är ROLIG PRESENT/familjekväll, INTE träning/gym ("ingen köper den för att träna"). Lokala namn sätts i samma anda (t.ex. DA/NO/FI-motsvarighet till "bollpannband"). Varianter: Färg Svart/Röd (bollens färg, Axel 2026-08-21), variantbilder: svart=boxboll-produkt.jpg, röd=boxboll-detalj.jpg | TEMU-601100409294093-<SV/RO> | 2 färger | sg-1-4-2 | ingen GIF (ingen funktionsvideo) | CDN(SE)/21f347ce-….jpg (huvud, Temus egen) + boxboll-produkt.jpg + boxboll-detalj.jpg (beskurna ur huvudbilden; filnamnen bär gamla ordet — bara URL:er, ej synlig text). ⚠️ Pannbandet har tryckta runliknande bokstäver ("TRIPLE"-aktigt) — syns på produkten, Axel informerad | 179 | 199 | 129 | 16,90 | 12.99 |
| 17 | Bordtennisnät Infällbart (2 rack & 6 bollar) — ⚠️ BYTT PRODUKT 2026-08-21: goods 605778962427277, gamla "tränaren" var fel bild/produkt. SE ombyggd; DK/FI/UK väntar på Axels feedback. Varianter: Färg Svart/Orange (näthållarnas färg, Axel 2026-08-21) | TEMU-605778962427277-<SV/OR> | 2 färger | sg-3-6 | ingen GIF (färgbyte ≠ funktion, regel 4) | CDN(SE)/cf861360-….jpg + temu3-pingnat-svart.jpg + temu3-pingnat-orange.jpg (variantbilder kopplade) | 309 | 349 | 229 | 29,90 | 22.99 |
| 18 | Linupprullare Aluminium | TEMU-601099521158260 | EN | sg-4-6 | CDN/temu2-linupprullare.gif | CDN/temu2-linupprullare.webp | 249 | 279 | 179 | 23,90 | 18.99 |
| 19 | Mini Fiskespö Set | TEMU-601102632838913 | EN | sg-4-6-11-12 | CDN/temu2-fiskespo.gif | CDN/temu2-fiskespo-1.webp | 429 | 489 | 319 | 41,90 | 31.99 |
| 20 | Hopfällbar Såg | TEMU-601099520639890 | EN | ha-15-62 | CDN/temu2-sag.gif | CDN/temu2-sag.webp | 279 | 319 | 209 | 26,90 | 20.99 |
| 21 | Bälteslipmaskin Mini 3-i-1 | TEMU-601102681234291 | EN | ha-15-59 | CDN/temu2-balteslip.gif | CDN/temu2-balteslip.webp | 909 | 1029 | 669 | 87,90 | 67.99 |
| 22 | Sneakers Herr EVA | TEMU-601102199755631-<strl> | Strl 40–46 | aa-8 | CDN/temu2-sneakers.gif | CDN/temu2-sneakers-1.jpg | 699 | 789 | 519 | 67,90 | 51.99 |
| 23 | Vandringskängor Herr — ⚠️ RÄTTAD PRODUKT 2026-08-21: Temus egen bild visar bruna kängor; gamla FANGHUO-sneakersbilden var en sökträff på fel produkt (og-rubriken säger "sneakers" men är keyword-soppa — bilden är facit). SE ombyggd: ny titel/handle/copy | TEMU-601099705910254-<strl> | Strl 40–46 | aa-8 | ingen GIF (ingen funktionsvideo; gamla zoom-GIF:en borttagen) | CDN(SE)/vandringskangor-herr.jpg (huvud, Temus egen) + vandringskangor-miljo.png (AI-miljöbild, aldrig huvudbild) | 699 | 789 | 519 | 67,90 | 51.99 |
| 24 | Vandringskängor Herr | TEMU-601105032097489-<strl> | Strl 41–47 | aa-8-3 | CDN/temu2-kangor.gif | CDN/temu2-kangor-1.webp | 669 | 759 | 499 | 64,90 | 49.99 |
| 25 | Cykelshorts Herr | TEMU-601099538175267-<S…3XL> | S, M, L, XL, 2XL, 3XL | sg-4-4-4 | CDN/temu2-cykelshorts.gif | CDN/temu2-cykelshorts-1.webp + -2.webp (-2 = block 4) | 259 | 289 | 189 | 24,90 | 18.99 |

**Våg 3 (2026-08-20, ur Next_up_products_3, CDN-bas `…/0985/8754/1849/files/`):**

| # | Produkt | SKU-bas | Varianter | Kategori | GIF/bild | SE | NO | DK | FI | UK |
|---|---|---|---|---|---|---|---|---|---|---|
| 26 | MC-kapell 220×120 — 6 färger BEKRÄFTADE i offerten 2026-08-21 (Cloud Grey/Solid Black/Frosted Dragon/Frosted Floral/Clear Dragon/Clear Floral) | TEMU-601102992953649-<CG/SB/FD/FF/CD/CF> | 6 färger | vp-1-5-3-6 | zoom-GIF ERSATT 2026-08-21 med AI-miljöbild (regn) | CDN(SE)/temu3-mc-kapell-1.jpg + mc-kapell-miljo.png | 289 | 329 | 209 | 27,90 | 20.99 |
| 27 | Dörrbottenlist — ⚠️ COPY OMSKRIVEN 2026-08-21: gamla var gissad utan bild (självhäftande/sax/lim) — produkten är en textilhylsa med skumcylinder som TRÄS på dörrbladet, 94 cm, springor upp till 3 cm, kaffebrun | TEMU-601099515911841 | EN | ha-2-20-4 | ingen GIF | CDN(SE)/dorrlist-huvud.jpg (Temus egen, COFFEE-bannern bortskuren) + dorrlist-miljo.png (AI) | 259 | 289 | 189 | 24,90 | 18.99 |
| 28 | Kranskydd frost 420D | TEMU-601101411598143 | EN | ha-10-2-4 | zoom-GIF ERSATT 2026-08-21 med AI-miljöbild (frostvägg) | CDN(SE)/temu3-kranskydd-1.jpg + kranskydd-miljo.png | 249 | 279 | 179 | 23,90 | 17.99 |
| 29 | Plyschtofflor herr | TEMU-601102047663138-<4041…4849> | 5 strl (40-41…48-49, tolkning av "40-49" — ⚠️ EJ bekräftad av Axel) | aa-8-7 | zoom-GIF ERSATT 2026-08-21 med AI-bild i användning (fötter, ansiktsfritt) | CDN(SE)/temu3-plyschtofflor-1.jpg + plyschtofflor-miljo.png | 389 | 439 | 289 | 37,90 | 28.99 |
| 30 | Båtmotorskydd 420D Heltäckande — NY 2026-08-21 ur offert 2. ⚠️ Temu-bilden visar 3 färger men offerten säger "only black" → bara svart säljs, huvudbilden är den svarta URKLIPPT ur triobilden. 9 storleksvarianter. **OMPOSITIONERAD (Axel 2026-08-21): produkten är för VINTERFÖRVARING PÅ LAND** — copy och miljöbild bytta till upplagd båt på trailer (första AI-bilden hade motorn i sjön = fel kontext); stöldvinkeln inne ("övertäckt motor = tråkigare byte"). Propellern ur AI-bilden togs bort med riktad andrapass-edit | TEMU-605748427852371-<0-5…250-350> | 9 storlekar (hk) | vp-1-5-3-6 | ingen GIF | CDN(SE)/batmotorskydd-svart.jpg + batmotorskydd-vinter.png (AI) | **519** (nya 3×-regeln) | räknas per land vid utrullning: 3 × landets landade kostnad, + 2,9 € endast DK/FI | | | |
| 31 | Herrtofflor inne (comfy) — ⚠️ VÄNTAR: ingen offert (leverantören: "similar but with a moq 3000"), inget SE-pris går att räkna → EJ uppladdad. Axel avgör om den ska offereras om | TEMU-601101251777925 | — | — | — | — | — | — | — | — | — |

Ur samma quote HOPPADES ÖVER: motorskydd 605748427852371 (= befintliga "Marint
Motorskydd 420D" — quoten är facit för den, ingen ny produkt) och memory foam-tofflor
601101251777925 (leverantören gav ingen quote, MOQ 3000).

**Ny bildkälla 2026-08-20:** Temu-sidans HTML-skal bär numera produktens HUVUDBILD
(`img.kwcdn.com/product/fancy/…?imageView2/2/w/800`) — hämtas med curl + grep, ingen
inloggning. Det är produktens EGEN bild, så den är OK även för skor/kläder (till
skillnad från DDG-söktraffar). Bara en bild per produkt; galleriet kräver fortfarande
inloggning eller Axel.

Uteduschens extra-bild (rad 2): `CDN/01d1af10-a6a3-4693-8faf-efc4f5c3283b_19396558-e6ba-4b1f-b1bb-e2edbc5014b1.jpg`.
Bild-URL:erna funkar utan `?v=`-parametern.

## Steg per land (i exakt denna ordning)

1. `get-shop-info` → verifiera land + valuta mot registret. Fel → stopp.
2. Hämta `publications` (kanal-ID:n skiljer per butik).
3. `create-product` per produkt: titel + copy på landets språk, `status: ACTIVE`,
   vendor enligt registret, options + varianter + SKU:er + priser ur tabellen,
   `inventoryItem: {tracked: true}`, bilder ur tabellen (första = huvudbild).
4. `productVariantsBulkUpdate`: `inventoryPolicy: CONTINUE, taxable: false` på VARJE variant.
5. `publishablePublish` per produkt med butikens alla publication-ID:n.
6. `productUpdate` med kategori-GID ur tabellen.
7. Verifiera: `featuredMedia` satt (utom boxbollen), ACTIVE, publikationsantal = antal kanaler.
8. `switch-shop` → be Axel koppla nästa land.

## Definition of done per land

- [ ] `get-shop-info` visade rätt butik INNAN första skrivningen
- [ ] 25 produkter ACTIVE med copy på landets språk (24 med bild — boxbollen är känd bildlös)
- [ ] Alla varianter: rätt pris ur tabellen, SKU, CONTINUE, taxable false
- [ ] Publicerad på butikens alla kanaler
- [ ] Kategori satt på alla
- [ ] Bilder verifierade på landets CDN
- [ ] Rapport: Fixat / Förslag
- [ ] Nästa butik kopplad — eller bäverbutiken.se återkopplad om detta var sista landet
